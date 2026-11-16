# intel-ai/Wan2.2-I2V-A14B-Diffusers-NVFP4-E5M3-AutoRound

## Resumen

Wan2.2-I2V-A14B-Diffusers-NVFP4-E5M3-AutoRound es una versión cuantizada del modelo de generación de vídeo a partir de imagen Wan2.2-I2V-A14B de Alibaba (Wan-AI), publicada por Intel AI. La cuantización se ha realizado con AutoRound en el esquema NVFP4_E5M3, que combina pesos y activaciones en FP4 (formato E2M1) con escalas de bloque de 4 bits sin signo (E5M3) y tamaño de grupo 16 tanto en pesos como en activaciones. El objetivo es reducir el coste de memoria y cómputo de un modelo de difusión de vídeo de gran tamaño para su despliegue en hardware Blackwell (B200), manteniendo una calidad visual cercana al modelo original en BF16.

El modelo base es un pipeline de difusión imagen-a-vídeo con dos expertos transformer (uno de ruido alto y otro de ruido bajo), que soporta generación en 480P y 720P. Esta receta cuantiza ambos transformers (400 módulos lineales por transformer, 800 en total) y deja sin cuantizar el text encoder, el VAE y las proyecciones de salida (`proj_out`), que se restauran byte a byte desde el checkpoint original en FP32.

La relevancia de esta ficha es doble: por un lado, demuestra que la cuantización FP4 sin calibración (RTN model-free) es viable en modelos de difusión de vídeo con una degradación media reportada de 0,9948 puntos porcentuales en cinco métricas de VBench I2V; por otro, exige un runtime específico (vLLM-Omni con un plugin de Neural Compressor) y hardware Blackwell validado, lo que limita su uso a entornos de producción muy concretos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (dos expertos: ruido alto y ruido bajo), pipeline `WanImageToVideoPipeline` de diffusers |
| Parámetros totales | no disponible (modelo base etiquetado como A14B; el número exacto de parámetros no se detalla en la información proporcionada) |
| Parámetros activos | no disponible |
| Longitud de contexto | no aplica (modelo de difusión imagen-a-vídeo, no de lenguaje) |
| Tipos de cuantización | NVFP4_E5M3: pesos y activaciones en FP4 E2M1 con escalas de bloque E5M3 sin signo, grupo 16/16; activaciones dinámicas 4 bits con QDQ en runtime |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (export AutoRound, identificador de tipo serializado `nvfp4_v2`) |

## Arquitectura y entrenamiento

El modelo base Wan2.2-I2V-A14B es un pipeline de difusión condicionado por imagen y texto que emplea dos transformers especializados: un experto de ruido alto y otro de ruido bajo, combinados mediante un `boundary_ratio` (0,9 en el ejemplo oficial) que determina en qué paso de muestreo se cambia de experto. El pipeline usa flow matching con `flow_shift` configurable y classifier-free guidance con escalas separadas para cada experto (`guidance-scale` y `guidance-scale-high`). El text encoder y el VAE no se cuantizan en esta receta.

La cuantización se realizó con AutoRound en modo model-free round-to-nearest (RTN), sin dataset de calibración, sin pasadas forward de calibración y sin iteraciones de ajuste. Se cuantizaron 400 módulos lineales por transformer (800 en total), excluyendo `proj_out` en ambos expertos. Las proyecciones de salida se restauraron byte a byte desde el checkpoint original en FP32 (no reconstruidas por dequantización de FP4) y se castean a BF16 en la ruta de inferencia; la configuración de cuantización las excluye explícitamente con `bits=16` y `act_bits=16`. El resto de tensores exportados se verificó por hash como inalterados.

El runtime validado es vLLM-Omni en el commit `7465c0f52`, con el plugin `inc_nvfp4_e5m3` de Neural Compressor (commit `8221432d`) y backend de atención `TRTLLM_ATTN`. NVFP4_E5M3 usa FP4 Marlin weight GEMM con QDQ de activaciones E5M3, no un GEMM W4A4 NVFP4 nativo ordinario.

## Capacidades

- Generación de vídeo a partir de una imagen de entrada (image-to-video) condicionada por prompt de texto.
- Soporte de prompts negativos para control de calidad y estilo.
- Generación en resoluciones 480P y 720P según el modelo base; la evaluación cuantitativa reportada valida únicamente 832 × 480.
- Control de número de frames (81 en el ejemplo oficial), FPS (16) y pasos de inferencia (40).
- Control fino del muestreo mediante `guidance-scale`, `guidance-scale-high`, `boundary-ratio`, `flow-shift` y semilla.
- Soporte bilingüe de prompts: inglés y chino.
- Integración con el ecosistema diffusers (`WanImageToVideoPipeline`).
- Ejecución en vLLM-Omni con plugin de cuantización para hardware NVIDIA Blackwell.

## Casos de uso

- Prototipado de vídeo generativo en investigación: permite experimentar con un modelo I2V de gran tamaño en una sola B200 sin necesidad de servir la versión BF16 completa, gracias a la reducción de memoria de los pesos FP4.
- Generación de clips publicitarios a partir de una imagen de producto: el modelo acepta una imagen fija y un prompt descriptivo para producir vídeos de 81 frames a 16 fps, útiles para variantes creativas rápidas.
- Animación de storyboards: convertir ilustraciones o frames clave en secuencias de vídeo breves con control de estilo mediante prompt negativo.
- Evaluación comparativa de técnicas de cuantización: sirve como referencia reproducible (misma imagen, prompt y semilla que las tarjetas BF16, MXFP8 y NVFP4) para medir el impacto de FP4 en calidad visual.
- Despliegue en infraestructura Blackwell con vLLM-Omni: adecuado para equipos que ya operan B200 y quieren servir generación de vídeo con menor huella de memoria por instancia.
- Generación de contenido bilingüe en/zh: útil para equipos que trabajan con prompts en inglés y chino en un mismo pipeline.
- Investigación sobre cuantización sin calibración: el checkpoint documenta el efecto de RTN model-free en un modelo de difusión de vídeo, con métricas VBench I2V reportadas.

## Benchmarks y rendimiento

La model card reporta una evaluación sobre un subconjunto de 355 pares de VBench I2V. No se publican los valores absolutos por métrica, solo la diferencia media agregada.

| Métrica | Resultado |
|---|---|
| VBench I2V, 5 métricas, subconjunto de 355 pares | Decremento absoluto medio de 0,9948 puntos porcentuales frente a BF16 (media descriptiva, no puntuación total oficial de VBench) |
| Resolución evaluada | 832 × 480 (única validada cuantitativamente) |
| Hardware de validación | NVIDIA B200 |

No se han publicado resultados absolutos de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje, ya que no aplican a este tipo de modelo. No se detallan métricas individuales por dimensión de VBench en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 29,6 GB en safetensors, lo que da una cota inferior orientativa para cargar los pesos en memoria, sin contar activaciones, text encoder ni VAE.
- GPU validada: NVIDIA B200 (Blackwell), único hardware en el que se ha verificado la receta NVFP4_E5M3.
- GPU consumer: no se ha validado en RTX 4090 ni en otras GPU consumer; el esquema NVFP4_E5M3 depende de FP4 Marlin weight GEMM y del backend `TRTLLM_ATTN`, orientados a Blackwell.
- Despliegue: vLLM-Omni en el commit `7465c0f52`, con el plugin `inc_nvfp4_e5m3` instalado desde Neural Compressor (commit `8221432d`). No se documenta soporte para llama.cpp, Ollama ni TGI.
- Variables de entorno relevantes: `DIFFUSION_ATTENTION_BACKEND=TRTLLM_ATTN`, `VLLM_PLUGINS=inc_nvfp4_e5m3`, `VLLM_QDQ=0` (desactiva simulación no relacionada, no el QDQ de activaciones E5M3).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan2.2-I2V-A14B-Diffusers-NVFP4-E5M3-AutoRound (este) | A14B (exacto no disponible) | no aplica | −0,9948 pp medio vs BF16 en 5 métricas VBench I2V (355 pares) | Apache-2.0 | Hugging Face, requiere vLLM-Omni + plugin |
| Wan-AI/Wan2.2-I2V-A14B-Diffusers (BF16) | A14B (exacto no disponible) | no aplica | Referencia de calidad completa | Apache-2.0 | Hugging Face, diffusers |
| Variantes MXFP8 y NVFP4 del mismo modelo base | A14B (exacto no disponible) | no aplica | No disponibles en la información proporcionada | Apache-2.0 | Hugging Face (mencionadas como tarjetas de comparación) |

No se dispone de datos de benchmarks comparativos directos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La evaluación cuantitativa solo cubre 832 × 480; no se valida 720P ni otras resoluciones.
- El decremento de 0,9948 puntos porcentuales es una media descriptiva de cinco métricas, no una puntuación total oficial de VBench; no debe citarse como tal.
- Requiere hardware Blackwell validado (B200) y un runtime específico con plugin; no hay garantía de funcionamiento en otras GPU o versiones de vLLM-Omni.
- La cuantización es RTN model-free sin calibración, lo que puede producir degradaciones no caracterizadas fuera del subconjunto evaluado.
- El text encoder y el VAE no están cuantizados, por lo que el ahorro de memoria es parcial respecto al pipeline completo.
- Riesgo de sesgos y alucinaciones visuales inherente al modelo base; no se documentan análisis específicos de sesgo en esta tarjeta.
- Idiomas de prompt limitados a inglés y chino.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de las dependencias (vLLM-Omni, Neural Compressor) antes de producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/intel-ai/Wan2.2-I2V-A14B-Diffusers-NVFP4-E5M3-AutoRound
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B-Diffusers
- vLLM-Omni (commit validado): https://github.com/vllm-project/vllm-omni/tree/7465c0f52bcb46a55f62c1b8613846cda30d0083
- Plugin Neural Compressor (commit validado): https://github.com/intel/neural-compressor/tree/8221432d6c328fdb39264bf059a02700bb753059/benchmark/vllm-qdq-plugin
- Imagen de ejemplo usada en la demo: https://huggingface.co/datasets/YiYiXu/testing-images/resolve/main/wan_i2v_input.JPG
