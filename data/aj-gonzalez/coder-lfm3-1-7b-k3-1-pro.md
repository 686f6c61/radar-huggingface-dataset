# AJ-Gonzalez/coder-lfm3-1.7b-k3.1-pro

## Resumen

coder-lfm3-1.7b-k3.1-pro es un ajuste fino (LoRA fusionado y cuantizado) del modelo LiquidAI/LFM3-1.7B de Liquid AI, publicado por AJ-Gonzalez. El objetivo es desplazar el comportamiento del modelo base hacia el estilo de razonamiento normativo extenso seguido de una implementación en bloque de codigo, imitando las trazas generadas por el profesor `moonshotai/kimi-k3.1-pro` a traves de OpenRouter. Se trata, por tanto, de un ejercicio de destilacion de trazas de razonamiento y codigo sobre un modelo pequeno de 1.700 millones de parametros.

El modelo conserva la arquitectura del LFM3 original (no documentada en detalle en la informacion disponible) y se distribuye en formato MLX de 4 bits (946 MB, 4.503 bits por peso) junto con el adaptador LoRA en safetensors (11 MB) y una cuantizacion GGUF Q4_K_M (1.1 GB, 5.05 bits por peso). El entrenamiento se realizo sobre un corpus muy reducido: 69 filas que, tras trocear en chunks de 2048 tokens con 256 de solapamiento, dieron lugar a 289 chunks de entrenamiento y 34 de validacion.

Su relevancia es acotada: no es un modelo de proposito general ni compite en benchmarks publicos, sino una prueba de concepto de destilacion de estilo sobre hardware de consumo (entrenado en 2,96 horas en un M1 de 8 GB). Resulta util para quien quiera experimentar con adaptadores de codigo sobre LFM3 en entornos Apple Silicon o con llama.cpp, pero no debe confundirse con un modelo de codigo evaluado y validado para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (hereda la de LiquidAI/LFM3-1.7B; transformer segun la familia LFM, sin detalle en la model card) |
| Parametros totales | 1.728.801.536 (1,73 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card (el entrenamiento usa chunks de 2048 tokens con 256 de replay) |
| Tipos de cuantizacion | MLX 4-bit (4.503 bits/peso), GGUF Q4_K_M (5.05 bits/peso); el autor menciona un intermedio f16 no subido |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | LFM Open License v1.0 (licencia del modelo base, copia incluida en el repo) |
| Formato de pesos | safetensors (MLX 4-bit), adaptadores LoRA en safetensors, GGUF Q4_K_M |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B convertido a MLX en 4 bits y se ajusta mediante LoRA de rango 8 sobre 8 capas, con 2.753 millones de parametros entrenables (0,159 % del total). El entrenamiento usa batch de 1, secuencia de 2048, optimizador Adam con tasa de aprendizaje 1e-5, 3 epocas (867 iteraciones) y checkpoint de gradientes obligatorio por la limitacion de memoria en un equipo de 8 GB. El tiempo total fue de 2,96 horas en un M1 de 8 GB.

Los datos proceden de un corpus generado por `moonshotai/kimi-k3.1-pro` a partir de los prompts de Xiaomi-MiMo-2.6-Pro-High-Reasoning-250x (a su vez derivados de TeichAI/claude-4.5-opus-high-reasoning-250x). Solo se uso el perfil "Coder": 69 filas que, tras el troceado en chunks de 2048 tokens con 256 de replay, produjeron 289 chunks de entrenamiento y 34 de validacion. La perdida de validacion evoluciono de 2,861 a 2,581, 2,594 y finalmente 2,438, seleccionandose el ultimo checkpoint. No hay informacion sobre RLHF, DPO ni innovaciones arquitectonicas propias; la unica "innovacion" es el proceso de destilacion de estilo a partir de trazas de un profesor remoto.

## Capacidades

- Generacion de codigo en Python y otros lenguajes, con docstrings de una linea y trazas de razonamiento previas al bloque de codigo.
- Razonamiento normativo extenso antes de la implementacion, imitando el estilo del profesor Kimi K3.1 Pro.
- Autocorreccion dentro de la traza: el ejemplo de la model card muestra como el modelo revisa y corrige un primer borrador erroneo.
- Conversacion multi-turno con la plantilla de chat de LFM3 aplicada por defecto.
- Ejecucion en Apple Silicon mediante MLX y en CPU/GPU mediante llama.cpp con el GGUF Q4_K_M.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo "thinking" explicito; la model card no los menciona.
- Capacidades multilingues no declaradas.

## Casos de uso

- Prototipado de funciones Python en local: el modelo genera funciones completas con docstring a partir de una descripcion breve, adecuado para entornos Apple Silicon con MLX y sin conexion.
- Destilacion de estilo de razonamiento: util como referencia para estudiar como se transfiere el patron "razonamiento largo + implementacion" de un profesor grande a un modelo de 1,7 B mediante LoRA.
- Experimentacion academica con LoRA de bajo rango: el adaptador de 11 MB y el script de fusion permiten reproducir el ajuste y analizar el efecto de rangos y capas.
- Pruebas de integracion en pipelines llama.cpp: el GGUF Q4_K_M (1,1 GB) permite validar flujos de inferencia en CPU con llama-cli antes de escalar a modelos mayores.
- Educacion y demostraciones: la traza autocorregida sirve como ejemplo didactico de razonamiento paso a paso en la generacion de codigo.
- Evaluacion de la licencia LFM Open v1.0: caso practico para estudiar las obligaciones de atribucion y el umbral de 10 M USD de ingresos anuales antes de adoptar modelos derivados en productos comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas de entrenamiento y de inferencia local:

| Metrica | Valor | Entorno |
|---|---|---|
| Perdida de validacion (epoca 1) | 2,861 | M1 8 GB |
| Perdida de validacion (epoca 2) | 2,581 | M1 8 GB |
| Perdida de validacion (epoca 3) | 2,594 | M1 8 GB |
| Perdida de validacion (epoca 4, final) | 2,438 | M1 8 GB |
| Throughput MLX 4-bit | 46-48 tok/s | M1 8 GB, pico 1,19 GB |
| Throughput GGUF Q4_K_M | ~37,6 tok/s | M1, smoke test de 96 tokens |

## Requisitos de hardware

- VRAM/RAM para MLX 4-bit: pico de 1,19 GB en M1 de 8 GB; el fichero pesa 946 MB.
- VRAM/RAM para GGUF Q4_K_M: fichero de 1,1 GB; cabe holgadamente en cualquier equipo con 4 GB o mas.
- GPU recomendadas: no se documentan; el autor solo valida Apple Silicon (M1). Para CUDA se puede usar llama.cpp con el GGUF, aunque no hay cifras publicadas.
- Cabe en GPU de consumo: si, en cualquier GPU con al menos 4 GB de VRAM usando llama.cpp; en Apple Silicon mediante MLX.
- Opciones de despliegue: `mlx_lm.generate` (MLX), `llama-cli`/`llama.cpp` con el GGUF. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: 46-48 tok/s en MLX 4-bit y ~37,6 tok/s en GGUF Q4_K_M sobre M1; cifras de un smoke test, no de un benchmark formal.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| coder-lfm3-1.7b-k3.1-pro | 1,73 B | No disponible | LFM Open v1.0 (uso comercial bajo umbral de 10 M USD) | MLX 4-bit, LoRA, GGUF | Ajuste de codigo por destilacion; sin benchmarks publicos |
| LiquidAI/LFM3-1.7B (base) | 1,73 B | No disponible en la informacion | LFM Open v1.0 | safetensors | Modelo base sin ajuste de codigo; referencia directa |
| Qwen2.5-Coder-1.5B | 1,5 B | 32 768 tokens (segun su model card publica) | Apache 2.0 | safetensors, GGUF, MLX | Alternativa de codigo con benchmarks publicados y licencia permisiva |
| DeepSeek-Coder-1.3B | 1,3 B | 16 384 tokens (segun su model card publica) | DeepSeek License | safetensors, GGUF | Alternativa de codigo de tamano comparable; licencia con restricciones |

La comparacion con Qwen2.5-Coder y DeepSeek-Coder se ofrece como referencia de categoria; no se dispone de datos de rendimiento del modelo evaluado frente a ellos.

## Limitaciones y advertencias

- Corpus de entrenamiento minimo: 69 filas originales y 289 chunks; el ajuste puede sobreajustar al estilo del profesor y degradar capacidades generales del modelo base.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora en HumanEval, MMLU u otras pruebas; el ejemplo de la model card es una unica muestra codiciosa.
- Riesgo de alucinacion: al imitar trazas de razonamiento largas, el modelo puede producir explicaciones plausibles pero incorrectas antes de llegar al codigo.
- Contexto no documentado: la model card no declara la ventana de contexto del modelo base; el entrenamiento usa 2048 tokens, por lo que prompts mas largos pueden degradar la calidad.
- Idiomas no declarados: no hay garantia de comportamiento multilingue; probablemente este optimizado para el ingles de las trazas del profesor.
- Licencia restrictiva: LFM Open License v1.0 limita el uso comercial a entidades con ingresos anuales inferiores a 10 M USD; por encima de ese umbral el modelo no esta licenciado para uso comercial.
- Obligaciones de atribucion: la redistribucion debe conservar la copia de la licencia, marcar ficheros modificados y mantener los avisos de atribucion de Liquid AI.
- Terminos de los datos: las trazas provienen de Kimi K3.1 Pro via OpenRouter y de los prompts de Xiaomi-MiMo-2.6-Pro-High-Reasoning-250x; sus terminos aplican y el modelo se libera solo para investigacion y destilacion coherente con ellos.
- Sin garantia: el autor declara el modelo "as-is" y no se responsabiliza del uso posterior.
- No se documenta soporte de tool calling ni de agentes; no debe asumirse en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AJ-Gonzalez/coder-lfm3-1.7b-k3.1-pro
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM Open v1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/AJ-Gonzalez/coder-kimi-k3.1-pro-lfm3
- Dataset de prompts original: https://huggingface.co/datasets/xtools-at/Xiaomi-MiMo-2.6-Pro-High-Reasoning-250x
- Dataset upstream de prompts: https://huggingface.co/datasets/TeichAI/claude-4.5-opus-high-reasoning-250x
- Gist del generador de corpus: https://gist.github.com/AJ-Gonzalez/31f1f8cfe45c233911e055d5cfed6da0
