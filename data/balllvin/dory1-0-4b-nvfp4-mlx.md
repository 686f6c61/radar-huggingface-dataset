# balllvin/Dory1.0-4B-NVFP4-MLX

## Resumen

Dory1.0-4B-NVFP4-MLX es una conversión comunitaria del modelo Nvidia Nemotron-Labs Dory1.0-4B en formato NVFP4 (4 bits) para su ejecución sobre Apple Silicon mediante la librería MLX. El modelo original lo desarrolla Nvidia y este repositorio, publicado por el usuario balllvin, adapta los pesos cuantizados de Nvidia para que funcionen con `mx.quantized_matmul` en hardware de Apple, sin reentrenamiento alguno: los códigos de 4 bits y las escalas de bloque son exactamente los de Nvidia.

El modelo base es un transformer de aproximadamente 3.975 millones de parámetros (~4B) especializado en generación de texto conversacional con modo de razonamiento previo a la respuesta. La conversión resuelve un problema práctico: MLX puede leer el formato NVFP4 de Nvidia, pero no dispone de entrada para el tensor scale (`weight_scale_2`) por capa. El autor resuelve esto plegando las 72 escalas relevantes en los vectores de compuerta (gate) y anulando las 216 restantes gracias a la normalización interna de Dory.

La relevancia actual radica en que permite ejecutar un modelo de 4B cuantizado a 4 bits en un portátil Apple Silicon con velocidades de 69 tokens/s en batch 1 y hasta 264 tokens/s en batch 8 sobre un M5 Pro, con soporte de tool calling y API compatible con OpenAI. Es una conversión independiente, no revisada ni respaldada por Nvidia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Nvidia Dory 1.0 4B) |
| Parametros totales | 3.975.229.440 (~4B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (se mencionan pruebas con contexto de 16k tokens) |
| Tipos de cuantizacion | NVFP4 (4 bits, W4A16), con escalas de bloque; vectores gate en fp32 |
| Idiomas soportados | en (inglés) |
| Licencia | OpenMDW 1.1 (pesos, config y tokenizer); código de `tools/` bajo MIT |
| Formato de pesos | safetensors (MLX), con `nvfp4_source.safetensors` para reconstruir el original |

## Arquitectura y entrenamiento

El modelo es un transformer de ~4B parámetros cuya arquitectura interna detallada no se describe en la información proporcionada. Lo que sí se documenta es el proceso de conversión: el checkpoint original de Nvidia está en formato W4A16_NVFP4, con 288 tensores de pesos cuantizados, 288 tensores de escala de bloque y 147 tensores en bf16. La conversión a MLX conserva byte a byte los 288 pesos y las 288 escalas, y modifica únicamente 72 vectores de compuerta (`s_gate`, `suv_gate`), que se almacenan en fp32 con la escala plegada.

La innovación técnica clave es el tratamiento de las escalas por tensor: Dory normaliza casi todas las salidas de proyección, por lo que 216 de las 288 escalas se cancelan y no requieren operación en decodificación; las 72 restantes alimentan las compuertas de atención y de MLP y se integran en los vectores de compuerta. No hubo entrenamiento ni ajuste fino en esta conversión. El servidor por defecto añade dos optimizaciones sin alterar los pesos: kernels Metal fusionados para los pasos de normalización (`tools/fastops.py`) y una cabeza de salida en dos etapas (`tools/fasthead.py`) que usa una copia de 4 bits para preseleccionar los 1024 tokens más probables y luego puntuarlos con los pesos bf16 de Nvidia, aplicable solo en decodificación de hasta 4 filas.

## Capacidades

- Generación de texto conversacional con modo de razonamiento: el modelo razona antes de responder y expone el resultado en el campo `reasoning`.
- Razonamiento multi-paso: una pregunta simple consume entre 650 y 1200 tokens de razonamiento, lo que exige configurar `max_tokens` con holgura.
- Tool calling / function calling: el servidor expone la API de chat de OpenAI con soporte de herramientas; en pruebas de bucle de agente, 12 de 12 llamadas a herramientas se parsearon correctamente.
- Integración con API compatible con OpenAI (`/v1/chat/completions`).
- Capacidades multilingües limitadas: solo inglés declarado.
- No se documentan capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Asistentes conversacionales locales en Apple Silicon: el modelo puede atender conversaciones multi-turno en un Mac con M5 Pro a 69 tokens/s en un solo flujo, sin depender de la nube, gracias a la cuantización NVFP4 de 4 bits y al soporte de MLX.
- Agentes con tool calling en local: la API compatible con OpenAI y el parseo correcto de 12 de 12 llamadas a herramientas permiten integrarlo en bucles de agente que invocan funciones externas (APIs, bases de datos, shell) desde un portátil.
- Servicio de inferencia por lotes en estación de trabajo Apple: con 264 tokens/s en batch 8, es adecuado para procesar lotes moderados de generación de texto (resúmenes, clasificación, extracción) en un único equipo.
- Prototipado de aplicaciones de razonamiento: el modo de razonamiento previo permite construir pipelines de cadena de pensamiento y evaluar su calidad antes de migrar a infraestructura mayor.
- Sustitución de un servidor remoto en desarrollo: al hablar la API de OpenAI, se puede apuntar el cliente existente a `http://127.0.0.1:8097/v1/chat/completions` y eliminar la dependencia de red durante el desarrollo.
- Conversión y verificación de checkpoints NVFP4: las herramientas `tools/convert.py` y `tools/verify.py` permiten transformar otros checkpoints W4A16_NVFP4 de Dory a MLX y comprobar que cada byte queda contabilizado, útil para equipos que quieran reproducir o auditar la conversión.
- Evaluación de calidad en dominios específicos: el autor midió la pérdida (NLL) sobre filas de música, lo que sirve como referencia para quien quiera validar el modelo en su propio dominio antes de desplegarlo.

## Benchmarks y rendimiento

Resultados medidos por el autor en un M5 Pro con 64 GB, MLX 0.32.4 y carga del sistema de 3 a 4,5. "Plain" es `python -m mlx_lm server`; "Default" es `tools/serve.py` con las optimizaciones.

| Medida | Plain | Default |
|---|---:|---:|
| Tokens por segundo, batch 1 | 59,5 | 69,1 |
| Tokens por segundo, batch 4 | 203 | 224 |
| Tokens por segundo, batch 8 | 257 | 264 |
| Tiempo hasta el primer token, contexto 16k | 11,6 s | 9,8 s |
| Pérdida en 87 filas de música (NLL con teacher forcing) | 0,59292 | 0,59292 |
| Pérdida en 12 filas de música | 0,76093 | 0,76085 |

Datos adicionales: en MLX main (no publicado aún en PyPI) el batch 8 alcanzó 362 tokens/s. El modelo padre en bf16 de Nvidia obtuvo 0,7755 en las mismas 12 filas y tiene registrado 0,60546 en las 87 filas (no reejecutado para esta versión). En bucle de agente, 12 de 12 llamadas a herramientas se parsearon correctamente. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio ocupa 3,2 GB, por lo que la inferencia requiere aproximadamente 4 GB de memoria unificada, más el espacio para caché KV según el contexto (a 16k tokens el tiempo hasta el primer token fue de 11,6 s en M5 Pro).
- GPU recomendadas: Apple Silicon; el único hardware probado es un M5 Pro con 64 GB. No hay datos para M1, M2, M3, M4 ni para GPU Nvidia en esta conversión.
- Cabe en consumer hardware: sí, en equipos Apple Silicon con memoria unificada suficiente (el autor probó con 64 GB, aunque el peso del modelo es de 3,2 GB).
- Opciones de despliegue: `mlx_lm server` (ruta simple) o `tools/serve.py` (ruta rápida con kernels fusionados y cabeza de dos etapas); ambos exponen la API de chat de OpenAI. Requiere `mlx==0.32.4` y un fork fijado de `mlx-lm` (pmichalas/mlx-lm en el commit 208065f), ya que mlx-lm main aún no incluye el modelo Dory.
- Latencia y throughput: 69,1 tokens/s en batch 1, 224 en batch 4 y 264 en batch 8 con el servidor por defecto; 9,8 s hasta el primer token con contexto de 16k.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dory1.0-4B-NVFP4-MLX (este) | ~4B | no disponible | NVFP4 4 bits | OpenMDW 1.1 | Hugging Face, MLX |
| nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-NVFP4 | ~4B | no disponible | NVFP4 4 bits | OpenMDW 1.1 | Hugging Face, formato original Nvidia |
| Modelo padre bf16 de Dory 1.0 4B | ~4B | no disponible | bf16 | OpenMDW 1.1 | Referenciado en la model card (pérdida 0,7755 en 12 filas) |

La comparación con alternativas de otros fabricantes no está disponible en la información proporcionada. La diferencia principal frente al checkpoint original de Nvidia es el formato de ejecución (MLX frente a NVFP4 nativo) y las optimizaciones de servidor, no la calidad de los pesos.

## Limitaciones y advertencias

- La calidad solo se midió en filas de música, no en finanzas ni en programación; no hay evidencia de rendimiento en esos dominios.
- Solo se probó en un M5 Pro; no hay datos de otros chips Apple ni de GPU Nvidia.
- Los kernels del servidor por defecto cambian el redondeo: el texto greedy divergió del servidor simple en 2 de 5 prompts, en los tokens 27 y 42. La KL de logits estuvo en el nivel de ruido, pero no se hizo una ejecución de control greedy.
- La cabeza de salida en dos etapas solo opera en batch 4 o inferior; por encima se usa la cabeza bf16.
- El conversor solo admite carpetas W4A16_NVFP4 de Dory con un único `model.safetensors`; no soporta otras arquitecturas ni archivos fragmentados (sharded).
- `GET /v1/models` registra un error `CacheNotFound` si la carpeta de caché de Hugging Face no existe todavía; las llamadas de chat y herramientas no se ven afectadas.
- Al cargar se imprime una advertencia del tokenizer que menciona `fix_mistral_regex`; los recuentos de tokens coincidieron en comprobaciones previas, pero la advertencia no se investigó.
- El modelo razona antes de responder y consume entre 650 y 1200 tokens en preguntas simples; con `max_tokens` bajo se obtiene `content` vacío.
- Solo soporta inglés declarado, lo que limita su uso en castellano sin evaluación adicional.
- Es una conversión comunitaria independiente: no es un producto de Nvidia y Nvidia no la ha revisado ni respaldado.
- Licencia OpenMDW 1.1 para pesos, config y tokenizer; el código de `tools/` es MIT. Conviene revisar los términos de OpenMDW 1.1 antes de un uso comercial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/balllvin/Dory1.0-4B-NVFP4-MLX
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-NVFP4
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Fork de mlx-lm usado: https://github.com/pmichalas/mlx-lm (commit 208065f3354e8c2645b658493b6aeb94eb0aaa77)
