# bharatraj007/prompt-injection-distilbert

## Resumen

`bharatraj007/prompt-injection-distilbert` es un modelo de clasificación de texto derivado de DistilBERT, publicado por el usuario bharatraj007 en HuggingFace. Por su nombre y su tamaño (66,95 millones de parámetros), está pensado para detectar intentos de *prompt injection*: entradas de usuario diseñadas para manipular a un modelo de lenguaje y hacerle ignorar sus instrucciones originales. Es, por tanto, una pieza de infraestructura de seguridad para aplicaciones construidas sobre LLMs, no un modelo generativo.

El modelo es una adaptación de DistilBERT, un transformer encoder de 6 capas y 66 millones de parámetros destilado de BERT-base. Con esa arquitectura, la tarea esperable es la clasificación binaria o multiclase de secuencias cortas: dado un texto, devolver una etiqueta que indique si contiene un patrón de inyección. Su valor práctico reside en que puede ejecutarse en CPU o en GPU de gama baja con latencia de milisegundos, lo que permite filtrar cada mensaje de entrada antes de enviarlo a un LLM mayor.

La información publicada es muy escasa: la model card solo contiene la licencia MIT, sin descripción de la tarea, el dataset de entrenamiento, las etiquetas ni métricas de evaluación. Creado y actualizado el 4 de noviembre de 2026, el repositorio no registra descargas ni *likes*. Cualquier evaluación de su calidad debe hacerse, por tanto, mediante pruebas propias sobre un conjunto de validación representativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT admite hasta 512 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización a int8 posible vía herramientas externas, no documentada) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a DistilBERT: un transformer encoder de 6 capas con 768 dimensiones ocultas, 12 cabezas de atención y 66 millones de parámetros, destilado de BERT-base. Sobre esa base, el autor ha añadido presumiblemente una cabeza de clasificación (la diferencia entre los 66,36 M de DistilBERT base y los 66,96 M publicados sugiere una cabeza de clasificación con un número reducido de etiquetas). No se ha publicado información sobre el proceso de destilación adicional, el dataset de entrenamiento, el número de ejemplos, la composición de las clases ni si se aplicó ajuste fino con técnicas como *adversarial training* o aumento de datos.

Tampoco hay documentación sobre el esquema de etiquetas (binario inyección/no inyección frente a categorías como *jailbreak*, *prompt leaking* o *instruction override*), la longitud máxima de secuencia usada en entrenamiento ni los hiperparámetros. La única información fiable es la arquitectura base y el recuento de parámetros extraído de los tensores en safetensors.

## Capacidades

- Clasificación de texto orientada a la detección de *prompt injection* (inferida del nombre del modelo; no documentada en la model card).
- Procesamiento de secuencias cortas o medias, típicas de mensajes de usuario en aplicaciones de chat.
- Inferencia rápida en CPU: 66 M de parámetros permiten evaluar miles de entradas por segundo en hardware modesto.
- Integración como filtro previo (*guardrail*) en pipelines de LLM: clasificar la entrada antes de pasarla al modelo generativo.
- No es un modelo generativo: no produce texto, no soporta *tool calling* ni razonamiento multi-paso.
- Capacidades multilingües: no documentadas; al derivar de DistilBERT, es plausible cierto soporte multilingüe, pero no está confirmado.
- No dispone de modo *thinking*, visión ni audio.

## Casos de uso

- Filtro de entrada en aplicaciones de chat con LLM: clasificar cada mensaje del usuario antes de enviarlo al modelo principal y bloquear o marcar los que superen un umbral de probabilidad de inyección. La latencia de un DistilBERT es compatible con un filtrado en línea sin degradar la experiencia.
- Moderación de contenido generado por usuarios en plataformas colaborativas: detectar intentos de manipular agentes conversacionales públicos (por ejemplo, bots de atención al cliente) y registrarlos para análisis.
- Evaluación de *red teaming*: procesar por lotes un corpus de ataques conocidos (*jailbreaks*, *prompt leaking*, instrucciones anidadas) y medir la tasa de detección del clasificador como parte de una batería de pruebas de seguridad.
- Protección de agentes con acceso a herramientas: cuando un agente ejecuta funciones o consulta APIs, clasificar los argumentos de entrada para evitar que una instrucción maliciosa provoque llamadas no deseadas.
- Enrutado y etiquetado en pipelines de datos: clasificar grandes volúmenes de registros históricos para separar conversaciones legítimas de intentos de manipulación antes de usarlas en análisis o en ajuste fino.
- Despliegue en el *edge* o en entornos con recursos limitados: al caber en CPU y ocupar unos 0,3 GB en disco, puede ejecutarse junto a la aplicación sin GPU dedicada.
- Capa de defensa en profundidad: combinarlo con otras comprobaciones (reglas, detección de instrucciones del sistema filtradas, límites de longitud) para reducir falsos negativos de un único clasificador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32 (unos 268 MB de pesos) y alrededor de 70 MB en int8; puede ejecutarse íntegramente en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria es suficiente; no se requiere A100 ni H100. Una RTX 4090 o una T4 quedan sobredimensionadas para este modelo.
- Cabe en cualquier GPU de consumo, incluidas GTX 1050, RTX 2060 o superiores, y también en Raspberry Pi y entornos serverless de gama baja.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification`, ONNX Runtime, TorchScript, `optimum` para exportación, y servidores de inferencia ligeros como FastAPI o Triton. No es compatible con vLLM ni llama.cpp, orientados a modelos generativos.
- Latencia y throughput: no publicados. Por el tamaño, es razonable esperar latencias de un dígito de milisegundos por secuencia en CPU moderna y *throughput* de miles de secuencias por segundo en GPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bharatraj007/prompt-injection-distilbert | 66,96 M | no disponible | Clasificación de prompt injection (inferida) | MIT | HuggingFace |
| DistilBERT base (`distilbert-base-uncased`) | 66,36 M | 512 tokens | Modelo base, ajustable a clasificación | Apache 2.0 | HuggingFace |
| ProtectAI `deberta-v3-base-prompt-injection` | ~184 M | 512 tokens | Detección de prompt injection | Apache 2.0 | HuggingFace |
| Meta `prompt-guard-86m` | 86 M | 512 tokens | Detección de prompt injection y *jailbreak* | Llama 3.2 Community License | HuggingFace |

La comparación con ProtectAI y Llama Prompt Guard se basa en sus fichas públicas; no se dispone de métricas del modelo de bharatraj007 para contrastar rendimiento. La ventaja principal de este modelo frente a los alternativos es su licencia MIT, sin restricciones de uso comercial, y su menor tamaño.

## Limitaciones y advertencias

- La model card no documenta la tarea, las etiquetas ni el dataset; se desconoce si el modelo está realmente entrenado para detectar *prompt injection* o si es un ajuste fino incompleto o de prueba.
- Sin métricas publicadas (precisión, recall, F1, AUC) no es posible evaluar su calidad ni compararlo con alternativas consolidadas.
- Riesgo elevado de falsos positivos y falsos negativos en dominios no cubiertos por su entrenamiento, que se desconoce.
- Un clasificador de este tipo puede ser evadido con paráfrasis, codificaciones (base64, homoglifos) o ataques multilingües; no debe usarse como única defensa.
- No se ha documentado el soporte de idiomas; es probable que el rendimiento caiga fuera del inglés si el ajuste fino se hizo solo en ese idioma.
- El repositorio no registra descargas ni *likes* y fue creado recientemente; no hay evidencia de uso en producción ni de mantenimiento.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni asume responsabilidad sobre el rendimiento.
- Sesgos: al derivar de DistilBERT, puede heredar sesgos de género, raza o nacionalidad presentes en los corpus de preentrenamiento; no se ha realizado una evaluación de sesgos.

## Enlaces

- [HuggingFace: bharatraj007/prompt-injection-distilbert](https://huggingface.co/bharatraj007/prompt-injection-distilbert)
- [DistilBERT (paper)](https://arxiv.org/abs/1910.01108)
- [ProtectAI deberta-v3-base-prompt-injection](https://huggingface.co/protectai/deberta-v3-base-prompt-injection)
- [Meta Llama Prompt Guard 86M](https://huggingface.co/meta-llama/Prompt-Guard-86M)
- [Documentación de Transformers para clasificación de secuencias](https://huggingface.co/docs/transformers/tasks/sequence_classification)
