# NagaYu/sumi-ja-pii

## Resumen

Sumi es un modelo de clasificación de tokens para la detección de información personal identificable (PII) en texto japonés, desarrollado por NagaYu. Con solo 132 millones de parámetros, está diseñado para resolver las confusiones típicas que cometen las herramientas orientadas al inglés cuando procesan japonés: apellidos que también son nombres comunes (森, 林, 泉, 大和, 青木), homógrafos de lugares y empresas, límites de honoríficos, y cadenas de dígitos que parecen números de teléfono pero no lo son. El modelo se complementa con una capa de reglas para tipos determinados por formato y un mecanismo de enmascaramiento reversible que permite enviar texto anonimizado a un LLM externo y restaurar la respuesta.

La relevancia actual de Sumi reside en su capacidad para ejecutarse íntegramente en CPU con un consumo de memoria inferior a 1,2 GB, ofreciendo un rendimiento de 22 documentos por segundo en su versión ONNX INT8, lo que lo hace viable para pipelines de anonimización en entornos con recursos limitados. Está basado en `sbintuitions/modernbert-ja-130m` (licencia MIT) y el modelo final se distribuye bajo Apache 2.0. Incluye pesos en safetensors, ONNX (fp32 e INT8), MLX para Apple Silicon y una exportación GGUF no ejecutable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBertForTokenClassification (encoder transformer) |
| Parametros totales | 132M (0,13B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenado con max length 256) |
| Tipos de cuantizacion | fp32, ONNX INT8 dinamico, MLX, GGUF (solo pesos, no ejecutable) |
| Idiomas soportados | japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX, MLX, GGUF |

## Arquitectura y entrenamiento

Sumi es un modelo de codificador transformer basado en ModernBERT japonés de 130M de parámetros, adaptado para clasificación de tokens con 21 etiquetas BIO distribuidas en 10 tipos de PII: nombre, dirección, teléfono, email, fecha de nacimiento, cuenta bancaria, tarjeta de crédito, My Number, ID de miembro y código postal. El entrenamiento se realizó sobre 12 000 documentos sintéticos con 107 000 spans dorados, durante 2 épocas, con batch de 32 y longitud máxima de secuencia de 256 tokens. Se usó AdamW con warmup y decay lineal, y clipping de gradiente en 1,0. El checkpoint final se seleccionó por F1 de coincidencia exacta de spans (no por token). La probabilidad de un span se calcula como el mínimo de las probabilidades de sus tokens constituyentes.

La innovación principal no está solo en el modelo, sino en el sistema completo: una capa de reglas para tipos determinados por formato (teléfonos, emails, códigos postales), un calibrador de temperatura ajustado sobre spans de validación, un refinamiento de límites de entidades, y un enmascarador reversible que mantiene el mapeo localmente. El modelo también incorpora un mecanismo de bucle cerrado con pesos de negativos que registra qué confusiones sigue fallando.

## Capacidades

- Detección de 10 tipos de PII en japonés mediante etiquetado BIO a nivel de token.
- Reconocimiento de apellidos japoneses que son homógrafos de nombres comunes, un punto débil de las herramientas entrenadas principalmente con datos en inglés.
- Distinción entre cadenas de dígitos que parecen números de teléfono y números reales, gracias a la capa de reglas y calibración.
- Integración con Presidio mediante un plugin de registro (`sumi.presidio_plugin.register`).
- Enmascaramiento reversible: el texto anonimizado puede enviarse a un LLM externo y la respuesta puede restaurarse con el mapeo local.
- Ejecución en CPU con dos formatos de inferencia: PyTorch fp32 y ONNX INT8.
- Salida calibrada con temperatura, lo que permite ajustar umbrales de decisión según el caso de uso.
- Disponible en formato MLX para Apple Silicon y GGUF (aunque este último no es ejecutable directamente).

## Casos de uso

- Anonimización de documentos antes de enviarlos a un LLM externo: Sumi detecta y enmascara PII con marcadores reversibles, permitiendo que el texto procesado por el LLM se restaure después sin exponer datos personales.
- Cumplimiento de protección de datos en empresas japonesas: el modelo puede integrarse en pipelines de gestión documental para detectar nombres, direcciones y números de cuenta antes de compartir archivos con terceros.
- Filtrado de datos en logs de aplicaciones: procesamiento en tiempo real de registros de servidor para eliminar direcciones de correo, números de teléfono y códigos postales antes de su almacenamiento o análisis.
- Atención al cliente con soporte en japonés: clasificación de mensajes entrantes para identificar y redactar automáticamente datos sensibles antes de que un agente humano o un chatbot los procese.
- Preparación de datasets de entrenamiento: limpieza de corpus en japonés que contengan PII, evitando la fuga de información personal en modelos entrenados posteriormente.
- Auditoría de privacidad en bases de datos: análisis de columnas de texto libre (por ejemplo, campos de observaciones) para localizar números de tarjeta, My Number o cuentas bancarias que no deberían estar almacenadas en claro.
- Despliegue en entornos con recursos limitados: al funcionar en CPU con menos de 1,2 GB de RAM, es adecuado para dispositivos edge o servidores sin GPU dedicada.

## Benchmarks y rendimiento

La model card publica una evaluación comparativa sobre un conjunto de generalización de 100 documentos positivos y 100 negativos, con PII sintética insertada en prosa de Wikipedia, estatutos y literatura. Los resultados de F1 micro y tasa de falsos positivos (FP rate) son:

| Condicion | Name | Address | Phone | Birth date | Email | Bank acct | My Number | Member ID | micro F1 | FP rate |
|---|---|---|---|---|---|---|---|---|---|---|
| (A) Presidio, configuracion por defecto | 0,054 | 0,000 | 0,917 | 0,053 | 0,192 | 0,000 | 0,000 | 0,000 | 0,176 | 0,370 |
| (B) Presidio + GiNZA | 0,784 | 0,077 | 0,833 | 0,789 | 0,231 | 0,000 | 0,000 | 0,024 | 0,245 | 0,830 |
| (C) Qwen3-4B-Instruct Q4_K_M (llama.cpp, CPU) | 0,541 | 0,897 | 0,917 | 0,947 | 1,000 | 0,683 | 0,676 | 0,659 | 0,818 | 0,080 |
| (D) Sumi fp32 | 0,811 | 1,000 | 1,000 | 1,000 | 1,000 | 1,000 | 1,000 | 1,000 | 0,978 | 0,000 |
| (E) Sumi INT8 | 0,811 | 0,923 | 1,000 | 0,895 | 1,000 | 1,000 | 1,000 | 1,000 | 0,953 | 0,060 |

Rendimiento en CPU (misma máquina, mismo número de hilos):

| Condicion | Tamano | docs/s | ms/doc | Pico RSS (MB) | vs (C) |
|---|---|---|---|---|---|
| (A) Presidio, por defecto | 0,01B | 253,93 | 4 | 1231 | 1825× |
| (B) Presidio + GiNZA | 0,05B | 6,05 | 165 | 1414 | 43× |
| (C) LLM local 4B (Q4) | 4,00B | 0,14 | 7187 | 5974 | baseline |
| (D) Sumi fp32 | 0,13B | 12,05 | 83 | 1192 | 87× |
| (E) Sumi INT8 | 0,13B | 22,54 | 44 | 1000 | 162× |

## Requisitos de hardware

- Inferencia en CPU: Sumi fp32 requiere aproximadamente 1,2 GB de pico de RAM; la versión ONNX INT8 reduce el consumo a 1,0 GB.
- GPU: no es necesaria; el modelo está diseñado para ejecutarse eficientemente en CPU.
- Compatibilidad con hardware de consumo: cualquier procesador moderno con soporte para operaciones de coma flotante puede ejecutar la versión fp32; la versión INT8 requiere compatibilidad con instrucciones vectoriales típicas de CPUs x86-64 y ARM.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime, MLX para Apple Silicon, y el paquete `sumi` que integra la capa de reglas y calibración. No se menciona soporte para vLLM, TGI u Ollama.
- Latencia: 44 ms por documento en la versión INT8 y 83 ms en fp32, según la evaluación publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 micro (generalizacion) | FP rate | Licencia | Despliegue |
|---|---|---|---|---|---|---|
| Sumi (fp32) | 132M | no disponible | 0,978 | 0,000 | Apache 2.0 | CPU, ONNX, MLX |
| Presidio (configuracion por defecto) | ~10M | n/a | 0,176 | 0,370 | MIT | CPU |
| Presidio + GiNZA | ~50M | n/a | 0,245 | 0,830 | MIT / LGPL | CPU |
| Qwen3-4B-Instruct (Q4_K_M) | 4B | 32K | 0,818 | 0,080 | Apache 2.0 | CPU/GPU, llama.cpp |

Sumi supera claramente a las alternativas basadas en Presidio y a un LLM local de 4B en F1 micro, con una tasa de falsos positivos nula en fp32 y un rendimiento entre 87 y 162 veces superior al del LLM de 4B en CPU. Sin embargo, el LLM de 4B ofrece mejor F1 en nombres (0,541 vs 0,811) y en direcciones (0,897 vs 1,000), aunque con una FP rate del 8%.

## Limitaciones y advertencias

- El modelo no garantiza cumplimiento legal o normativo; es una herramienta para reducir el riesgo de fuga de datos, no un detector completo. Se advierte explícitamente en la model card que pueden producirse omisiones.
- Todos los datos de entrenamiento y evaluación son sintéticos; no se utilizó información personal real en ningún momento del proyecto. Esto puede limitar la generalización a ciertos formatos de PII del mundo real.
- La exportación GGUF incluida contiene solo los pesos y no es ejecutable; no puede usarse directamente con llama.cpp u otros runners.
- El modelo está entrenado exclusivamente para japonés; no es aplicable a otros idiomas sin reentrenamiento.
- La longitud máxima de secuencia en el entrenamiento fue de 256 tokens; no se especifica si el modelo soporta contextos más largos.
- El uso directo del modelo transformers sin la capa de reglas ni la calibración reduce significativamente la precisión, según advierte el autor.
- La tasa de falsos positivos en la versión INT8 es del 6% en documentos duros negativos (sin PII), lo que puede requerir ajuste de umbrales según el caso de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NagaYu/sumi-ja-pii
- Repositorio de código, benchmarks y pipeline de entrenamiento: https://github.com/NagaYu/sumi
- Dataset de entrenamiento: https://huggingface.co/datasets/NagaYu/sumi-ja-pii-corpus
- Modelo base: https://huggingface.co/sbintuitions/modernbert-ja-130m
