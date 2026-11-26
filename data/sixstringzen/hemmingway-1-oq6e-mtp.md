# sixstringzen/Hemmingway-1-oQ6e-mtp

## Resumen

Hemmingway-1-oQ6e-mtp es una cuantizacion de 6 bits del modelo Hemmingway-1 de Altworld, convertida por sixstringzen para su uso con MLX y oMLX en Apple Silicon. El modelo original esta orientado a escritura creativa y generacion de texto conversacional, y esta construido sobre una arquitectura identificada como `qwen3_5_text`, lo que lo vincula a la familia Qwen 3.5. Con 27.320.697.856 parametros totales, se posiciona en la gama de modelos densos de aproximadamente 27B, un tamano que permite un equilibrio entre calidad de generacion y requisitos de memoria.

La particularidad de esta version es que preserva los tensores de prediccion multi-token (MTP) del modelo fuente, lo que habilita decodificacion especulativa nativa y puede mejorar el throughput en inferencia. La cuantizacion emplea el metodo oQe de oMLX, que asigna precision adicional a tensores sensibles basandose en la importancia de activacion, manteniendo el `lm_head` en 8 bits. El resultado ocupa 21,39 GiB, lo que lo hace viable en equipos Apple Silicon con memoria unificada de 32 GB o superior.

Es relevante ahora porque representa un ejemplo de cuantizacion especializada para el ecosistema Apple, con un informe de calibracion detallado y una evaluacion A/B documentada contra la referencia BF16. La licencia Apache 2.0 facilita su adopcion comercial, aunque las capacidades estan limitadas al ingles segun la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, identificada como `qwen3_5` (fuente: `qwen3_5_text`) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits base con oQe mixed-precision (10 tensores a 8 bits), group size 64, dtype no cuantizado bfloat16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (5 shards, 1.876 tensores indexados, 29 tensores MTP); no es GGUF |

## Arquitectura y entrenamiento

El modelo fuente es un transformer denso de aproximadamente 27B parametros con arquitectura `qwen3_5_text`, lo que sugiere que hereda el diseno de la familia Qwen 3.5. Esta version cuantizada no aporta cambios arquitectonicos: mantiene la estructura del modelo original y anade la preservacion de 29 tensores de prediccion multi-token (MTP), que permiten al modelo predecir varios tokens futuros en paralelo y habilitar decodificacion especulativa.

Los detalles de entrenamiento del modelo original (numero de tokens, composicion del dataset, si hubo RLHF o DPO) no estan disponibles en la informacion proporcionada; se remite a la model card de Altworld/Hemmingway-1. La innovacion tecnica de esta publicacion es la cuantizacion oQe: parte de pesos de 6 bits, asigna 8 bits a nueve tensores sensibles o protegidos y mantiene `language_model.lm_head` en 8 bits por falta de entrada en la imatrix. La calibracion uso el dataset `oqe_code_multilingual` con 128 muestras de 512 tokens y 504 entradas de imatrix reutilizadas de la pasada de sensibilidad del modelo fuente. El informe registra ausencia de desajustes de forma y de shards faltantes.

## Capacidades

- Generacion de texto y escritura creativa, con enfasis en prosa y estilo segun la orientacion del modelo fuente.
- Generacion conversacional multi-turno.
- Razonamiento y planificacion, con modo de pensamiento controlable mediante `enable_thinking` (desactivado para prosa directa).
- Prediccion multi-token (MTP) para decodificacion especulativa y mayor throughput.
- Capacidades multilingues limitadas al ingles segun la informacion disponible.
- No hay evidencia en la informacion proporcionada sobre soporte de tool calling, function calling, agentes, vision o audio.

## Casos de uso

- Escritura creativa asistida: el modelo esta orientado a prosa y narrativa, por lo que puede usarse para generar borradores de relatos, dialogos y descripciones con control de estilo, desactivando `enable_thinking` para obtener texto directo.
- Generacion de contenido editorial: redaccion de articulos, resumenes y textos de marketing en ingles, aprovechando la ventana de contexto del modelo base (no especificada) para mantener coherencia en documentos largos.
- Asistentes conversacionales en ingles: gestion de dialogos multi-turno en aplicaciones de soporte o compania, con la ventaja de ejecucion local en Apple Silicon.
- Prototipado de aplicaciones LLM en macOS: desarrolladores que necesitan un modelo de ~27B ejecutable en un Mac con memoria unificada de 32 GB o mas, usando oMLX como runtime.
- Investigacion sobre cuantizacion: el repositorio incluye informes de calibracion y evaluacion A/B que sirven como referencia para estudiar el impacto de la cuantizacion oQe en calidad.
- Generacion de texto offline y privada: al ejecutarse localmente, es adecuado para entornos donde los datos no pueden salir del dispositivo, como redaccion de documentos sensibles.
- Experimentacion con decodificacion especulativa: los tensores MTP preservados permiten probar tecnicas de aceleracion de inferencia en el ecosistema MLX.

## Benchmarks y rendimiento

La model card incluye una evaluacion A/B de cuantizaciones contra la referencia BF16 local, con 15 prompts, tres lineas de jueces y 90 valoraciones por cuantizacion (66 en la comparacion alojada con 11 prompts). Los jueces puntuaron adherencia a instrucciones, ajuste a la tarea, claridad y control, y criterio de escritura en escala 0-4. Los resultados parciales publicados son:

| Condicion | Victorias | Derrotas | Empates | Valoraciones | % Victorias | % Derrotas | % Empates |
|---|---:|---:|---:|---:|---:|---:|---:|
| oQ2e | 31 | 58 | 1 | 90 | 34,4 | 64,4 | 1,1 |
| oQ3.5e | 44 | 42 | no disponible | 90 | no disponible | no disponible | no disponible |

Los datos de oQ6e no aparecen completos en la informacion proporcionada. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor advierte que las valoraciones describen una unica salida congelada por condicion y prompt, sin intervalos de confianza ni afirmaciones de significacion estadistica.

## Requisitos de hardware

- VRAM/memoria estimada: 21,39 GiB para los pesos en 6 bits; se recomienda al menos 32 GB de memoria unificada en Apple Silicon para dejar margen al contexto y al runtime.
- GPU recomendadas: exclusivamente Apple Silicon (M1/M2/M3/M4 con memoria unificada suficiente); no esta verificado para GPUs NVIDIA u otras.
- Cabe en consumer hardware Apple: si, en configuraciones con 32 GB o mas de memoria unificada; en 24 GB es probable que no quepa con contexto util.
- Opciones de despliegue: oMLX 0.7.0.dev2 (probado); otros runtimes MLX y versiones anteriores de oMLX no verificados. No es compatible con llama.cpp, Ollama ni vLLM al no ser GGUF.
- Latencia y throughput: no disponibles; la presencia de tensores MTP sugiere potencial de aceleracion mediante decodificacion especulativa, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hemmingway-1-oQ6e-mtp | 27,3B | no disponible | 6 bits oQe (MLX) | Apache 2.0 | Hugging Face, MLX/oMLX |
| Hemmingway-1 (BF16) | 27,3B | no disponible | BF16 | Apache 2.0 | Hugging Face, referencia original |
| Hemmingway-1-oQ4e-mtp | 27,3B | no disponible | 4 bits oQe (15,21 GiB) | Apache 2.0 | Hugging Face, MLX/oMLX |
| Hemmingway-1-oQ8e-mtp | 27,3B | no disponible | 8 bits oQe (27,10 GiB) | Apache 2.0 | Hugging Face, MLX/oMLX |

No se dispone de datos de rendimiento comparativo con modelos de otras familias en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles segun la informacion disponible; no apto para produccion en castellano u otros idiomas.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado evaluaciones de factualidad.
- La evaluacion de calidad es limitada: una sola salida por condicion y prompt, sin intervalos de confianza ni significacion estadistica; no demuestra paridad con el modelo BF16.
- Compatibilidad restringida: solo verificada con oMLX 0.7.0.dev2 en Apple Silicon; no funciona con llama.cpp, Ollama, vLLM ni GPUs NVIDIA.
- El cambio de nombre de arquitectura (`qwen3_5_text` a `qwen3_5`) puede afectar a runtimes que esperen el identificador original.
- El `lm_head` se mantiene en 8 bits por falta de entrada en la imatrix, lo que puede introducir diferencias de calidad respecto a la referencia.
- No hay informacion sobre sesgos conocidos ni sobre el proceso de alineacion del modelo fuente.
- La licencia Apache 2.0 permite uso comercial, pero deben verificarse las condiciones del modelo base Altworld/Hemmingway-1.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sixstringzen/Hemmingway-1-oQ6e-mtp
- Modelo fuente: https://huggingface.co/Altworld/Hemmingway-1
- Coleccion de cuantizaciones: https://huggingface.co/collections/sixstringzen/hemmingway-1-omlx-oqe-quantizations-apple-silicon-evidence-6ab06103552bc3c7e9ad8afa
- Informe de imatrix: https://huggingface.co/sixstringzen/Hemmingway-1-oQ6e-mtp/blob/main/oq_imatrix_report.json
- Dataset de benchmark: https://huggingface.co/datasets/sixstringzen/hemmingway-1-omlx-quantization-benchmark-v1
- Registro de correccion: https://huggingface.co/datasets/sixstringzen/hemmingway-1-omlx-quantization-benchmark-v1/blob/main/CORRECTION.md
- Repositorio oMLX: https://github.com/jundot/omlx
- Variantes: https://huggingface.co/sixstringzen/Hemmingway-1-oQ2e-mtp, https://huggingface.co/sixstringzen/Hemmingway-1-oQ3e-mtp, https://huggingface.co/sixstringzen/Hemmingway-1-oQ3.5e-mtp, https://huggingface.co/sixstringzen/Hemmingway-1-oQ4e-mtp, https://huggingface.co/sixstringzen/Hemmingway-1-oQ8e-mtp
