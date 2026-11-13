# Prosto19/qwen-russian-gec-lora

## Resumen

`Prosto19/qwen-russian-gec-lora` es un ajuste fino mediante LoRA del modelo `Qwen/Qwen2.5-1.5B-Instruct` orientado a la corrección de errores gramaticales (GEC, *grammatical error correction*) en ruso. Lo desarrolla el usuario independiente Prosto19 y se distribuye principalmente como un artefacto GGUF cuantizado en Q4_K_M (940,4 MiB) para inferencia local con llama.cpp. El modelo base es un transformer decoder-only de 1.543.714.304 parámetros (1,5B) con arquitectura `qwen2` de 28 bloques.

El problema que aborda es concreto: recibir un texto en ruso con errores y devolver una versión corregida conservando el significado original. El ajuste se realizó sobre el dataset `alexanderpl/ru_gec_v1` con 1.500 filas de entrenamiento, 150 de validación y 150 de test, en 2 épocas y 338 pasos sobre una Tesla T4 de Colab. La relevancia es limitada y experimental: el propio autor etiqueta la publicación como "Experimental / DON'T SHIP" y advierte de que la evaluación registrada es de archivo, no un benchmark nuevo.

Conviene subrayar que no es un corrector listo para producción. La evaluación registrada sobre 20 ejemplos arroja 3/20 de coincidencia exacta para el GGUF Q4_K_M y 6/20 para el LoRA y el FP16 en Transformers, frente a 0/20 del modelo base. Son cifras sobre una muestra minúscula y con referencias ruidosas, por lo que la interpretación es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, arquitectura `qwen2` (28 bloques, 338 tensores en GGUF) |
| Parametros totales | 1.543.714.304 (1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens en el ejemplo de despliegue con llama-server; el entrenamiento usó secuencias de 512 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M (artefacto publicado); el autor reporta también F16 GGUF y merged FP16 |
| Idiomas soportados | Ruso (`ru`) |
| Licencia | Apache-2.0 según el modelo base y el dataset referenciados por el autor; la model card incluye LICENSE con Apache-2.0 y NOTICE de atribución |
| Formato de pesos | GGUF v3 Q4_K_M (`qwen_gec_q4.gguf`, 986.045.248 bytes); adaptador LoRA y merged FP16 en safetensors según el flujo de Soup CLI |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only denso de 1,5B parámetros. Sobre él se aplicó un adaptador LoRA en FP16 con rango r=16, alpha=32, dropout=0,05 y learning rate 1e-4, entrenado con AdamW, batch size 1, acumulación de gradiente 8, longitud máxima de secuencia 512, gradient checkpointing y semilla 42. El entrenamiento se ejecutó con Soup CLI 0.77.2 en una Colab Tesla T4 durante 2 épocas y 338 pasos.

Los datos provienen de `alexanderpl/ru_gec_v1`: el informe de preparación describe 1.500 filas de entrenamiento, 150 de validación y 150 de test, aunque Soup dividió internamente el fichero de entrenamiento con `val_split: 0.1`, resultando en 1.350 filas de entrenamiento y 150 de validación; el fichero de validación separado no se utilizó. No se documenta RLHF ni DPO. Tampoco se incluye el lock completo de entorno ni el código de preparación de datos en el proyecto público, por lo que no se garantiza una reproducción exacta de extremo a extremo. El enmascarado de etiquetas solo en turnos del asistente queda pendiente de validación adicional según el autor.

## Capacidades

- Corrección de errores gramaticales en ruso: recibe un texto y devuelve una versión corregida, con la instrucción histórica `Исправь ошибки в тексте. Верни только исправленный текст, сохранив исходный смысл`.
- Generación de texto conversacional heredada de Qwen2.5-1.5B-Instruct (formato chat, endpoint `/v1/chat/completions`).
- Soporte de plantilla de chat y despliegue con llama.cpp mediante `llama-server`.
- Capacidad multilingüe limitada al ruso en el caso de uso entrenado; el modelo base soporta más idiomas, pero el ajuste está especializado en `ru`.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Revisión ortográfica y gramatical de borradores en ruso: el modelo se invoca con temperatura 0 y `max_tokens` 384 para devolver el texto corregido, útil como primera pasada antes de revisión humana.
- Preprocesado de corpus rusos para tareas de NLP: normalizar texto con errores antes de alimentar pipelines de análisis, con la advertencia de que puede introducir cambios de significado y requiere validación.
- Experimentación educativa y de reproducibilidad: sirve para estudiar el flujo LoRA → merge → exportación GGUF con Soup CLI y comparar el comportamiento entre FP16 y Q4_K_M.
- Inspección de fallos de conversión a GGUF: el autor lo publica explícitamente para analizar discrepancias entre motores (Transformers vs llama.cpp) y entre cuantizaciones.
- Prototipado local en hardware modesto: al ocupar 940,4 MiB en Q4_K_M, cabe en equipos sin GPU dedicada y permite probar la tarea GEC en ruso sin infraestructura cloud.
- Base para un futuro ajuste más robusto: el adaptador y el pipeline documentado pueden reutilizarse como punto de partida para reentrenar con más datos y una evaluación más limpia.

## Benchmarks y rendimiento

Evaluación registrada por el autor sobre 20 ejemplos de test, métrica de coincidencia exacta (predicción y referencia sin espacios, sin normalización de mayúsculas ni puntuación):

| Artefacto | Coincidencia exacta |
|---|---:|
| Base / Transformers | 0/20 |
| LoRA / Transformers | 6/20 |
| Merged FP16 / Transformers | 6/20 |
| F16 GGUF / llama.cpp | 6/20 |
| Q4_K_M GGUF / llama.cpp | 3/20 |

El autor señala que las salidas F16 y Q4 coinciden en 16/20 ejemplos, que la muestra es diminuta, que las referencias son ruidosas y que la coincidencia exacta no equivale a precisión semántica humana. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el GGUF Q4_K_M ocupa 940,4 MiB, por lo que la inferencia puede ejecutarse en CPU sin GPU; en FP16 el peso ronda los 3 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para FP16; el autor entrenó en una Tesla T4.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060 o superiores; también en CPU.
- Opciones de despliegue: llama.cpp (`llama-server`), con el comando documentado `llama-server -m qwen_gec_q4.gguf -c 2048 -ngl 0 -t 2 --host 127.0.0.1 --port 18080`; Transformers para el adaptador LoRA y el merged FP16.
- Latencia y throughput: no disponibles en la información proporcionada; el autor indica que el comando no se ha vuelto a probar en su máquina.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Prosto19/qwen-russian-gec-lora | 1,5B | 2.048 en despliegue | GEC ruso (LoRA + GGUF Q4_K_M) | Apache-2.0 (según upstream) | Hugging Face, GGUF |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 (modelo base) | Instrucciones generales | Apache-2.0 | Hugging Face |
| Correctores GEC rusos dedicados de mayor tamaño | no disponible | no disponible | GEC ruso | no disponible | no disponible |

La comparación con alternativas específicas de GEC en ruso no está disponible en la información proporcionada. Frente al modelo base, el ajuste mejora la coincidencia exacta en la muestra registrada (6/20 frente a 0/20), pero el modelo base conserva mayor contexto y capacidades generales.

## Limitaciones y advertencias

- El autor califica explícitamente el modelo como "Experimental / DON'T SHIP": no es un corrector fiable para producción.
- Puede cambiar el significado del texto, conservar errores o introducir errores nuevos.
- La evaluación se basa en 20 ejemplos con referencias ruidosas; la coincidencia exacta no mide precisión semántica.
- El enmascarado de etiquetas solo en turnos del asistente necesita validación adicional.
- La pérdida de entrenamiento y la activación del adaptador no demuestran generalización.
- No se incluye el lock de entorno ni el código de preparación de datos, por lo que la reproducción exacta no está garantizada.
- El GGUF publicado no tiene checksum de exportación original que enlace criptográficamente con la evaluación histórica; solo se verificaron la cabecera y el digest del fichero localmente.
- El modelo está especializado en ruso; su uso en otros idiomas no está validado.
- La licencia del repositorio figura como "no disponible" en los metadatos de Hugging Face, aunque el autor reproduce Apache-2.0 del modelo base y del dataset; conviene revisar LICENSE y NOTICE antes de redistribuir pesos derivados.
- No hay garantía de ningún tipo según el autor.

## Enlaces

- Hugging Face: https://huggingface.co/Prosto19/qwen-russian-gec-lora
- Repositorio del proyecto (código, notebook, resultados e informes): https://github.com/Prosto19/qwen-russian-gec-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset: https://huggingface.co/datasets/alexanderpl/ru_gec_v1
- Soup CLI (herramienta de entrenamiento y exportación): no disponible en la información proporcionada
- llama.cpp (runtime GGUF): no disponible en la información proporcionada
