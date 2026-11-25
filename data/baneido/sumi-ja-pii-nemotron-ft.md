# baneido/sumi-ja-pii-nemotron-ft

## Resumen

Sumi-ja-pii-nemotron-ft es un modelo de clasificación de tokens (token classification) especializado en la detección de información personal identificable (PII) en textos en japonés. Lo publica el usuario baneido en Hugging Face y se construye mediante un ajuste fino del modelo NagaYu/sumi-ja-pii sobre el conjunto de datos nvidia/Nemotron-PII-Japan. Su objetivo es resolver un problema concreto de los detectores de PII en japonés: la dificultad de identificar nombres propios que aparecen sin etiqueta explícita (como "氏名:") ni honorífico (como "様" o "さん").

El modelo mantiene la misma arquitectura y formato de entrada/salida que su modelo base, por lo que funciona como reemplazo directo (drop-in replacement) en pipelines existentes. Detecta diez categorías de PII (nombre, dirección, teléfono, correo electrónico, fecha de nacimiento, cuenta bancaria, tarjeta de crédito, MyNumber, número de socio y código postal) y emite etiquetas en formato BIO con 21 clases.

Con 132.413.973 parámetros totales y un tamaño de repositorio de 0,7 GB, es un modelo compacto orientado a despliegue en CPU mediante ONNX Runtime con cuantización INT8. Su relevancia actual radica en que aborda la detección de PII en japonés con métricas de precisión y exhaustividad muy altas sobre el conjunto de evaluación, y en que ofrece una alternativa ligera para tareas de cumplimiento de privacidad en entornos sin GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (token classification) |
| Parámetros totales | 132.413.973 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens por entrada (incluyendo `<s>` y `</s>`) |
| Tipos de cuantización | INT8 (cuantización dinámica ONNX); fp32 en PyTorch |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch), ONNX (model.int8.onnx) |

## Arquitectura y entrenamiento

El modelo se basa en ModernBERT, una arquitectura transformer encoder con atención eficiente, adaptada a clasificación de tokens. Parte de los pesos de NagaYu/sumi-ja-pii (revisión `daa43a033830a38911b178e7951b97ad64b0080a`) y se ajusta durante 1.500 pasos con AdamW (learning rate 1e-5, weight decay 0.01, warmup en el 5 % inicial y decaimiento lineal), batch size de 16 y semilla 0, en Apple Silicon (MPS) durante aproximadamente 10 minutos.

El entrenamiento utiliza el conjunto Nemotron-PII-Japan (revisión `a074898c902870f2830b521cfac8a1482515374f`), del que se reservan documentos de evaluación (aquellos cuyo hash FNV-1a de 32 bits del uid módulo 10 es 0), se separa un conjunto de validación (resto 1) y el resto se divide entre entrenamiento. En el 30 % de los documentos se eliminan las etiquetas tipo "氏名:" para forzar al modelo a detectar nombres en contextos sin marcadores explícitos. Además, se añaden ejemplos sin PII (documentación de ja.react.dev, railsguides.jp, kagome) y se generan CSV sin cabecera y listas de palabras con un 25 % de nombres. Como innovación destacable, se aplica un enmascaramiento de la función de pérdida cuando la predicción del modelo base coincide con un nombre no anotado en los datos, para mitigar errores de etiquetado. También se incluye un archivo `calibrator.json` con temperature scaling (T = 0.9) para convertir logits en probabilidades calibradas.

## Capacidades

- Detección de nombres propios (`NAME`) en texto libre, incluso sin etiqueta ni honorífico, incluyendo nombres completos con espacios como `齊藤 福市`.
- Detección de direcciones (`ADDRESS`), teléfonos (`PHONE`), correos electrónicos (`EMAIL`), fechas de nacimiento (`DOB`), cuentas bancarias (`BANK_ACCOUNT`), tarjetas de crédito (`CREDIT_CARD`), MyNumber (`MYNUMBER`), números de socio (`MEMBER_ID`) y códigos postales (`POSTAL_CODE`).
- Salida en formato BIO con 21 clases (`O`, `B-NAME`, `I-NAME`, etc.), compatible con la API `pipeline("token-classification")` de Transformers y con `aggregation_strategy="simple"`.
- Ejecución en CPU sin PyTorch mediante ONNX Runtime con el modelo INT8 (133 MB), usando solo `onnxruntime`, `tokenizers`, `numpy` y `huggingface_hub`.
- Integración con la herramienta de línea de comandos `jp-pii-detect` para escanear repositorios Git y otros directorios en busca de PII.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio; es un modelo exclusivamente de clasificación de tokens.

## Casos de uso

- Cumplimiento de privacidad en repositorios de código: integrado en `jp-pii-detect`, el modelo escanea repositorios Git en busca de nombres, correos y teléfonos embebidos en cadenas de texto o documentación, permitiendo bloquear commits que expongan datos personales antes de llegar a producción.
- Anonimización de registros y logs: se puede aplicar sobre entradas de log en japonés para enmascarar nombres y contactos antes de almacenarlos o enviarlos a sistemas de analítica, gracias a su detección de nombres sin etiqueta explícita.
- Preparación de conjuntos de datos para entrenamiento: al procesar corpus en japonés, el modelo identifica y permite eliminar PII de forma automatizada, reduciendo el riesgo legal en la publicación de datasets.
- Enmascaramiento en pipelines de atención al cliente: los textos de conversaciones pueden pasar por el modelo para sustituir nombres y teléfonos antes de que se almacenen en sistemas CRM o se usen para análisis.
- Auditoría de documentos corporativos: digitalización y revisión de documentos internos (actas, listados, formularios) para localizar datos personales y cumplir con normativas de protección de datos.
- Preprocesamiento en sistemas de moderación o publicación de contenido: detección de PII en textos enviados por usuarios antes de su publicación en foros, wikis o plataformas colaborativas.
- Despliegue en entornos sin GPU: al disponer de una versión ONNX INT8 de 133 MB, puede ejecutarse en servidores CPU o incluso en portátiles para tareas de escaneo puntual, con latencia adecuada para procesamiento por lotes.

## Benchmarks y rendimiento

Los resultados publicados comparan el modelo con el Sumi original en las mismas condiciones, combinados con las reglas de `jp-pii-detect` y contando detecciones con confianza media o superior (no son cifras del modelo aislado). El entorno de medida es macOS arm64 con ONNX Runtime 1.31.0 (versión INT8).

Detección de nombres sin etiqueta (`results/probe.json`, 1.000 casos con nombre y 20 sin nombre):

| Métrica | Sumi original | Este modelo |
|---|---|---|
| Nombres detectados (de 1.000) | 829 | 950 |
| Nombres no vistos en entrenamiento (de 500) | 221 | 383 |
| Términos no-nombre clasificados como nombre (de 20) | 20 | 0 |

Documentos de evaluación de Nemotron-PII-Japan (9.851 documentos no usados en entrenamiento), para nombres:

| Modelo | Correctos | Falsos positivos | Omisiones | Precisión | Exhaustividad |
|---|---|---|---|---|---|
| Sumi original | 9.531 | 174 | 12 | 0,982 | 0,999 |
| Este modelo | 9.539 | 2 | 4 | 1,000 | 1,000 |

Detecciones en documentos sin PII:

| Documento | Sumi original | Este modelo |
|---|---|---|
| Documentación de Vue.js en japonés | 15 | 14 |
| Sudachi | 16 | 5 |
| Textos legales | 0 | 0 |
| Repositorio de jp-pii-detector | 162 | 715 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que no aplican a un modelo de clasificación de tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la versión ONNX INT8, que se ejecuta en CPU. La versión PyTorch fp32 requiere aproximadamente 0,5 GB de memoria (132 M de parámetros en fp32), por lo que cabe en cualquier GPU consumer.
- GPU recomendadas: no se especifican; el modelo está diseñado para CPU. Cualquier GPU con al menos 1 GB de memoria puede ejecutar la versión fp32.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: ONNX Runtime (recomendado para CPU), Transformers con PyTorch, y la herramienta `jp-pii-detect` para escaneo de repositorios. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento se completó en unos 10 minutos en Apple Silicon (MPS), pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| baneido/sumi-ja-pii-nemotron-ft | 132,4 M | 256 tokens | ja | Apache 2.0 | Detección de PII en japonés con nombres sin etiqueta |
| NagaYu/sumi-ja-pii (modelo base) | no disponible | 256 tokens | ja | no disponible | Detección de PII en japonés |
| Modelos genéricos de NER multilingüe (p. ej., XLM-R) | no disponible | variable | multilingüe | variable | NER general, no especializado en PII japonesa |

La comparación directa con el modelo base muestra mejoras claras en la detección de nombres sin etiqueta (950 frente a 829 sobre 1.000) y una reducción drástica de falsos positivos en nombres (2 frente a 174) sobre el conjunto de evaluación. No se dispone de datos comparativos con otros modelos especializados en PII japonesa en la información proporcionada.

## Limitaciones y advertencias

- La longitud de entrada está limitada a 256 tokens (incluyendo tokens especiales); los textos más largos deben dividirse en fragmentos, lo que puede perder contexto entre fragmentos.
- La versión INT8 puede diferir de la fp32 en algunos casos: por ejemplo, en la frase `昨日齊藤 福市と打ち合わせを行い、次回の日程を決めた。`, la versión fp32 detecta `齊藤 福市` mientras que la INT8 detecta `昨日齊藤 福市` como nombre.
- Las probabilidades de confianza deben calibrarse dividiendo los logits por la temperatura 0,9 de `calibrator.json` antes de aplicar softmax.
- El modelo está entrenado exclusivamente para japonés; no se ha evaluado su comportamiento en otros idiomas.
- Riesgo de alucinación: al ser un modelo de clasificación de tokens, no genera texto, pero puede producir falsos positivos o falsos negativos en la detección de entidades, especialmente en dominios muy alejados de los datos de entrenamiento.
- En el repositorio de jp-pii-detector se detectaron 715 entidades frente a 162 del modelo base; parte de ellas son detecciones correctas de PII ficticia de pruebas, pero no se ha analizado qué proporción del aumento corresponde a falsos positivos.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda validar el modelo en el dominio específico antes de desplegarlo en producción, dado que los datos de entrenamiento provienen de un conjunto concreto (Nemotron-PII-Japan) y de documentación técnica.
- No se han publicado análisis de sesgos demográficos ni de equidad en la detección de nombres; los nombres poco frecuentes o de origen extranjero podrían tener menor tasa de detección.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/baneido/sumi-ja-pii-nemotron-ft
- Modelo base: https://huggingface.co/NagaYu/sumi-ja-pii
- Conjunto de datos: https://huggingface.co/datasets/nvidia/Nemotron-PII-Japan
- Herramienta jp-pii-detect: https://github.com/baneido/jp-pii-detector
- Resultados y scripts: incluidos en el repositorio del modelo (`results/`, `scripts/`)
