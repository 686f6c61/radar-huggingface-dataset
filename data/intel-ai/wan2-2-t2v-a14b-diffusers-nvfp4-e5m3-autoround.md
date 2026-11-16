# intel-ai/Wan2.2-T2V-A14B-Diffusers-NVFP4-E5M3-AutoRound

## Resumen

Wan2.2-T2V-A14B-Diffusers-NVFP4-E5M3-AutoRound es una versión cuantizada del modelo de generación de vídeo a partir de texto Wan-AI/Wan2.2-T2V-A14B-Diffusers, publicada por el equipo de Intel AI. El modelo base es un sistema de difusión con dos expertos (uno de alto ruido y otro de bajo ruido) que suma aproximadamente 14.000 millones de parámetros, y esta variante aplica una cuantización NVFP4 con formato E5M3 mediante la herramienta AutoRound.

El objetivo de esta ficha es reducir el coste computacional y de memoria de la inferencia de un modelo de vídeo de gran tamano sin degradar de forma significativa la calidad visual. La cuantización afecta a los dos transformadores de difusión (400 módulos lineales por transformador, 800 en total), manteniendo sin cuantizar las proyecciones de salida (`proj_out`) y sin tocar el codificador de texto ni el VAE.

Es relevante porque permite ejecutar generación de vídeo a 720p con pesos de 4 bits en hardware Blackwell (validado en NVIDIA B200) a través de vLLM-Omni, con un coste de calidad medido en un subconjunto de VBench de 165 prompts. La licencia Apache-2.0 facilita su uso comercial, aunque el despliegue exige un plugin específico y una versión fijada de vLLM-Omni.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión con dos expertos transformer (alto ruido y bajo ruido), pipeline `WanPipeline` |
| Parametros totales | Aproximadamente 14.000 millones (modelo base A14B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de difusión text-to-video, no autoregresivo) |
| Tipos de cuantizacion | NVFP4_E5M3 (pesos y activaciones FP4 E2M1 con escalas de bloque E5M3 sin signo, grupo 16/16); activaciones dinámicas de 4 bits con QDQ |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (formato de exportación AutoRound, identificador `nvfp4_v2`), integrado con Diffusers |

## Arquitectura y entrenamiento

El modelo base es un sistema de difusión para texto-a-vídeo compuesto por dos transformadores expertos: uno especializado en la fase de alto ruido y otro en la de bajo ruido, coordinados mediante un `boundary-ratio` (0,875 en la configuración de referencia). Esta variante no reentrena el modelo: aplica una cuantización post-entrenamiento con AutoRound en modo *model-free round-to-nearest* (RTN), sin dataset de calibración, sin pasadas forward de calibración y sin iteraciones de ajuste.

La cuantización cubre 400 módulos lineales por transformador (800 en total). Las proyecciones de salida (`proj_out`) se excluyen y se restauran byte a byte desde el checkpoint original, conservando su almacenamiento FP32 en disco y su conversión a BF16 en tiempo de inferencia. El codificador de texto y el VAE no se cuantizan. La innovación principal es el esquema NVFP4_E5M3, que emplea GEMM de pesos FP4 Marlin con QDQ de activaciones E5M3, en lugar de un GEMM W4A4 NVFP4 nativo, lo que requiere un plugin de vLLM-Omni y no modificaciones del código fuente.

## Capacidades

- Generación de vídeo a partir de texto con resolución validada de 1280 × 720, 81 fotogramas a 16 fps.
- Control fino del muestreo: `num-inference-steps` (40 en la referencia), `guidance-scale` (4,0), `guidance-scale-high` (3,0), `flow-shift` (5,0) y semilla configurable.
- Soporte de *negative prompt* para dirigir la generación away de artefactos indeseados.
- Generación bilingüe: prompts en inglés y en chino.
- Integración con Diffusers mediante `WanPipeline`.
- Ejecución en vLLM-Omni a través de su API Python, con backend de atención TRTLLM_ATTN.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento, al tratarse de un modelo generativo de vídeo.

## Casos de uso

- Prototipado rápido de vídeo publicitario: el modelo permite generar clips de 720p a partir de descripciones textuales, útil para equipos creativos que necesitan variaciones de concepto antes de producir con herramientas tradicionales.
- Generación de material de previsualización en producción audiovisual: los 81 fotogramas a 16 fps y la resolución 1280 × 720 permiten crear *animatics* para validar guion y puesta en escena.
- Creación de contenido para redes sociales: clips cortos bilingües (inglés y chino) generados de forma automatizada con control de semilla para reproducibilidad.
- Investigación en difusión de vídeo: la variante cuantizada sirve para estudiar el impacto de FP4 en calidad visual, con métricas VBench comparables frente a BF16.
- Despliegue en infraestructura Blackwell: al requerir B200 validado y vLLM-Omni, encaja en entornos que ya dispongan de GPU Blackwell y quieran reducir huella de memoria frente a BF16.
- Evaluación de pipelines de cuantización: útil como referencia para validar recetas AutoRound RTN sin calibración en modelos de difusión de vídeo.
- Generación de *storyboards* con control de estilo mediante negative prompts: los equipos pueden iterar sobre composición y atmósfera sin reentrenar el modelo.

## Benchmarks y rendimiento

La model card reporta una evaluación sobre un subconjunto fijo de VBench de 165 prompts a 720p. Los valores son diferencias absolutas frente a BF16 en dimensiones individuales, no una puntuación total oficial de VBench.

| Dimension VBench | Diferencia frente a BF16 (puntos porcentuales) |
|---|---|
| Imaging quality | −0,6133 |
| Aesthetic quality | −0,8903 |
| Motion smoothness | Aumento ligero (valor no disponible) |
| Overall consistency | Reducción inferior a 0,3 |
| Subject consistency | Reducción inferior a 0,3 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un modelo text-to-video.

## Requisitos de hardware

- GPU validada: NVIDIA B200 (Blackwell), con resolución 1280 × 720 y 40 pasos de inferencia.
- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 29,6 GB en disco y el modelo base es de aproximadamente 14.000 millones de parámetros, por lo que la inferencia en FP4 requiere menos memoria que la versión BF16, pero no se documenta una cifra concreta.
- Compatibilidad con GPU de consumo: no confirmada. El esquema NVFP4_E5M3 depende de GEMM FP4 Marlin y del plugin de vLLM-Omni, validado en B200; no se indica soporte para RTX 4090 u otras GPU consumer.
- Opciones de despliegue: vLLM-Omni (commit 7465c0f52) con el plugin `inc_nvfp4_e5m3` instalado desde el commit 8221432d de intel/neural-compressor; integración con Diffusers mediante `WanPipeline`.
- Variables de entorno relevantes: `DIFFUSION_ATTENTION_BACKEND=TRTLLM_ATTN`, `VLLM_PLUGINS=inc_nvfp4_e5m3`, `VLLM_QDQ=0` (desactiva simulación no relacionada, no el QDQ requerido).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan2.2-T2V-A14B-Diffusers-NVFP4-E5M3-AutoRound (este) | ~14.000 M | 1280 × 720, 81 frames, 16 fps | NVFP4_E5M3 (4 bits) | Apache-2.0 | Hugging Face, requiere plugin vLLM-Omni |
| Wan-AI/Wan2.2-T2V-A14B-Diffusers (base) | ~14.000 M | 1280 × 720 | BF16 | Apache-2.0 | Hugging Face, Diffusers |
| intel-ai/Wan2.2-T2V-A14B-Diffusers-NVFP4-AutoRound | ~14.000 M | 1280 × 720 | NVFP4 estándar | Apache-2.0 | Hugging Face, vLLM-Omni |
| Versiones MXFP8 del mismo modelo base | ~14.000 M | 1280 × 720 | MXFP8 | Apache-2.0 | Referenciadas en la model card, datos no disponibles |

Las variantes NVFP4 y MXFP8 se citan en la model card como referencias de comparación, pero no se aportan sus métricas detalladas en la informacion disponible.

## Limitaciones y advertencias

- La cuantización introduce una degradación medible: −0,6133 puntos en imaging quality y −0,8903 en aesthetic quality frente a BF16; no es una pérdida despreciable en producción de alta exigencia.
- Los resultados de calidad solo se han validado a 720p con 40 pasos; no se garantiza el mismo comportamiento en otras resoluciones o configuraciones de muestreo.
- Requiere hardware Blackwell (B200 validado) y una versión fijada de vLLM-Omni más un plugin específico; no es un checkpoint plug-and-play en cualquier stack.
- El esquema NVFP4_E5M3 no usa un GEMM W4A4 NVFP4 nativo, sino GEMM FP4 Marlin con QDQ de activaciones; un despliegue incorrecto del plugin puede producir resultados erróneos.
- Riesgo de alucinación visual y artefactos propios de los modelos de difusión: anatomías incorrectas, texto ilegible o inconsistencias temporales, atenuadas parcialmente por el negative prompt de referencia.
- Sesgos potenciales heredados del dataset de entrenamiento del modelo base, no documentados en la informacion disponible.
- Idiomas limitados a inglés y chino; no se garantiza calidad con prompts en castellano u otras lenguas.
- Aunque la licencia es Apache-2.0, conviene verificar las condiciones del modelo base y de las dependencias (vLLM-Omni, neural-compressor) antes de un despliegue comercial.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica validación comunitaria limitada.

## Enlaces

- Hugging Face: https://huggingface.co/intel-ai/Wan2.2-T2V-A14B-Diffusers-NVFP4-E5M3-AutoRound
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B-Diffusers
- Variante NVFP4 de referencia: https://huggingface.co/intel-ai/Wan2.2-T2V-A14B-Diffusers-NVFP4-AutoRound
- vLLM-Omni (commit validado): https://github.com/vllm-project/vllm-omni/tree/7465c0f52bcb46a55f62c1b8613846cda30d0083
- Plugin neural-compressor (commit validado): https://github.com/intel/neural-compressor/tree/8221432d6c328fdb39264bf059a02700bb753059/benchmark/vllm-qdq-plugin
- Vídeo BF16 de referencia: https://huggingface.co/intel-ai/Wan2.2-T2V-A14B-Diffusers-NVFP4-AutoRound/resolve/main/assets/cat_boxing_bf16.mp4
