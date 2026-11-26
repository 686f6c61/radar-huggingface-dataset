# Project-Bastion/multilingual-pii-detector

## Resumen

multilingual-pii-detector es un modelo de clasificación de tokens (token classification) especializado en la detección de información personal identificable (PII) en texto multilingüe. Lo desarrolla Project-Bastion y se construye sobre FacebookAI/xlm-roberta-base, un transformer encoder de tipo XLM-RoBERTa con 277.464.591 parámetros. El modelo resuelve un problema concreto: localizar y permitir el enmascarado de datos sensibles como nombres, correos electrónicos, teléfonos, direcciones, números de tarjeta, contraseñas o claves API en flujos de texto.

Su relevancia actual radica en dos factores. Primero, su licencia Apache-2.0, que permite uso comercial sin las restricciones de otros detectores de PII populares (piiranha es CC-BY-NC-ND-4.0). Segundo, su despliegue ligero: se distribuye también en ONNX (int8 de 281 MB y fp32 de 1.1 GB) y puede ejecutarse en el navegador mediante transformers.js, sin enviar el texto a ningún servidor. Cubre siete idiomas (inglés, alemán, francés, español, italiano, neerlandés y sueco) y declara 14 etiquetas de entidad.

El modelo está pensado para tareas de redacción y anonimización en pipelines de privacidad, cumplimiento normativo y preprocesado de datos antes de enviarlos a otros sistemas. Su contexto efectivo es de 256 tokens por ventana, con procesamiento en ventanas solapadas para textos más largos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-base) para token classification |
| Parámetros totales | 277.464.591 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens por ventana; textos largos con ventanas solapadas (stride=64) |
| Tipos de cuantización | int8 weight-only (ONNX, 281 MB), fp32 (ONNX, 1.1 GB); safetensors en precisión completa |
| Idiomas soportados | en, de, fr, es, it, nl, sv |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (model.onnx fp32, model_quantized.onnx int8) |

## Arquitectura y entrenamiento

El modelo es un XLM-RoBERTa-base adaptado a token classification. Se trata de un transformer encoder multilingüe con 277 millones de parámetros, sin componente generativo, que produce una etiqueta BIO (o similar) por token para 14 categorías de PII: NAME, EMAIL, PHONE, ADDRESS, SSN, CARD, PASSWORD, USERNAME, DOB, DRIVER, IP, ACCOUNT, ID_NUM y SECRET. La inferencia se realiza con la pipeline `token-classification` de transformers, usando `aggregation_strategy="simple"` y `stride=64` para reconstruir entidades en textos que superan los 256 tokens.

Según la model card, los datos de entrenamiento provienen de gretelai/synthetic_pii_finance_multilingual (licencia Apache-2.0). No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o ajuste fino supervisado más allá del entrenamiento estándar de token classification. Tampoco se documentan innovaciones arquitectónicas adicionales (atención lineal, decodificación especulativa, etc.); se trata de un fine-tuning convencional de un encoder preentrenado.

## Capacidades

- Detección de PII en texto con 14 etiquetas: NAME, EMAIL, PHONE, ADDRESS, SSN, CARD, PASSWORD, USERNAME, DOB, DRIVER, IP, ACCOUNT, ID_NUM y SECRET.
- Redacción y enmascarado: sustitución de entidades detectadas por marcadores como `[NAME]` o `[EMAIL]`.
- Multilingüe en siete idiomas: inglés, alemán, francés, español, italiano, neerlandés y sueco.
- Procesamiento de textos largos mediante ventanas solapadas (stride=64) sobre la ventana base de 256 tokens.
- Ejecución en CPU y en navegador con ONNX y transformers.js (modelo int8 de 281 MB descargado una vez; el texto no sale del dispositivo).
- No es un modelo generativo: no soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Redacción de datos antes de enviar texto a un LLM de terceros: se ejecuta el detector sobre el prompt del usuario y se sustituyen nombres, correos y teléfonos por marcadores, reduciendo la exposición de PII en la llamada a la API.
- Cumplimiento de RGPD en registros de aplicaciones: se procesan logs y tickets de soporte para localizar y anonimizar datos personales antes de almacenarlos o compartirlos con equipos de analítica.
- Preprocesado de datasets para entrenamiento: se filtran o enmascaran entidades personales en corpus multilingües antes de usarlos en el ajuste de otros modelos.
- Enmascarado en el navegador: formularios o herramientas internas que usan transformers.js pueden redactar el texto localmente, sin que el contenido abandone el dispositivo del usuario.
- Gestión de tickets de atención al cliente: detección de nombres, correos y números de tarjeta en conversaciones multi-idioma para cumplir políticas de privacidad antes de la revisión humana.
- Anonimización de documentos financieros: el modelo se evaluó sobre un corpus financiero multilingüe (gretelai/synthetic_pii_finance_multilingual), por lo que encaja en la redacción de extractos, informes y comunicaciones bancarias.
- Saneado de textos para publicación o compartición externa: detección de IP, números de cuenta y secretos antes de exportar documentación.

## Benchmarks y rendimiento

Resultados declarados por el autor (micro F1 a nivel de carácter, sobre los 10 grupos que los tres modelos pueden predecir). Todos los modelos se evaluaron con el mismo código y los mismos documentos.

| Benchmark | multilingual-pii-detector | piiranha | gliner_multi_pii |
|---|---|---|---|
| nvidia/Nemotron-PII test (1.000 docs) | 0.940 | 0.780 | 0.871 |
| gretelai/gretel-pii-masking-en-v1 test (1.000 docs) | 0.920 | 0.706 | 0.846 |
| gretelai/synthetic_pii_finance_multilingual test (1.500 docs, 7 idiomas) | 0.871 | 0.658 | 0.633 |

F1 por grupo en nvidia/Nemotron-PII:

| Grupo | Este modelo | piiranha | gliner_multi_pii |
|---|---|---|---|
| NAME | 0.943 | 0.788 | 0.572 |
| EMAIL | 0.993 | 0.739 | 0.985 |
| PHONE | 0.941 | 0.764 | 0.945 |
| ADDRESS | 0.807 | 0.840 | 0.833 |
| SSN | 0.979 | 0.800 | 0.989 |
| CARD | 0.911 | 0.931 | 0.945 |
| PASSWORD | 0.613 | 0.455 | 0.779 |
| USERNAME | 0.743 | 0.660 | 0.807 |
| DOB | 0.992 | 0.939 | 0.989 |

Los resultados de la model card están marcados como no verificados (`verified: false`). No se han publicado en la información disponible latencias ni throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en fp32 ocupa aproximadamente 1,1 GB en ONNX; en int8, unos 281 MB. En PyTorch con safetensors, el peso ronda 1,1 GB, por lo que cabe en GPUs de 2 GB o más.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; para lotes grandes o alto throughput, A100, H100, L4 o RTX 4090 aportan margen sobrado.
- Cabe en GPU de consumo: sí, en cualquier tarjeta moderna (RTX 3060, RTX 4060, etc.) e incluso en CPU.
- Opciones de despliegue: transformers (pipeline `token-classification`), ONNX Runtime, transformers.js en el navegador. No se documentan integraciones específicas con vLLM, TGI o llama.cpp (no aplicables a un encoder de clasificación).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 (Nemotron-PII) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| multilingual-pii-detector | 277 M | 256 tokens/ventana | 0.940 | Apache-2.0 | Hugging Face, ONNX, navegador |
| iiiorg/piiranha-v1-detect-personal-information | no disponible | no disponible | 0.780 | CC-BY-NC-ND-4.0 | Hugging Face (247k descargas) |
| urchade/gliner_multi_pii-v1 | no disponible | no disponible | 0.871 | no disponible | Hugging Face (89k descargas) |

El modelo de Project-Bastion supera a ambos en F1 global en los tres benchmarks declarados y ofrece una licencia permisiva para uso comercial, frente a la restricción no comercial de piiranha. En cambio, gliner_multi_pii obtiene mejor F1 en PASSWORD y USERNAME, y piiranha en ADDRESS.

## Limitaciones y advertencias

- El propio autor advierte de que el recall debe comprobarse sobre el texto propio antes de usarlo con fines de cumplimiento; el rendimiento es más débil en contraseñas (F1 0.613), nombres de usuario (0.743) y números de permiso de conducir.
- Los resultados de benchmarks están declarados por el autor y no verificados de forma independiente.
- La ventana de contexto es de 256 tokens; los textos largos requieren ventanas solapadas y pueden perder entidades en los límites.
- Es un modelo discriminativo, no generativo: no razona ni genera texto, solo etiqueta tokens.
- No se documentan sesgos específicos ni tasas de alucinación (no aplica al no ser generativo), pero la detección puede fallar en dominios distintos a los de los benchmarks (documentos financieros sintéticos).
- La licencia Apache-2.0 permite uso comercial, pero el modelo base XLM-RoBERTa se distribuye bajo MIT; conviene revisar las condiciones de los datasets de entrenamiento y evaluación citados.
- La demo en navegador está pensada para textos de hasta unos pocos miles de caracteres.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Project-Bastion/multilingual-pii-detector
- Demo en navegador: https://huggingface.co/spaces/Project-Bastion/multilingual-pii-detector-demo
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Dataset de entrenamiento: https://huggingface.co/datasets/gretelai/synthetic_pii_finance_multilingual
- Benchmark Nemotron-PII: https://huggingface.co/datasets/nvidia/Nemotron-PII
- Benchmark gretel-pii-masking-en-v1: https://huggingface.co/datasets/gretelai/gretel-pii-masking-en-v1
- Modelo comparado piiranha: https://huggingface.co/iiiorg/piiranha-v1-detect-personal-information
- Modelo comparado gliner_multi_pii: https://huggingface.co/urchade/gliner_multi_pii-v1
