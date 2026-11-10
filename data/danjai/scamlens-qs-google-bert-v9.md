# danjai/scamlens-qs-google-bert-v9

## Resumen

ScamLens quick_score google-bert-v9 es un clasificador binario de texto especializado en la deteccion de mensajes fraudulentos (scam) en SMS y chats. Lo desarrolla el usuario danjai en el contexto de ScamLens, un agente de investigacion de fraudes construido como proyecto de curso universitario (IS469). El modelo recibe un mensaje y devuelve la probabilidad de que su redaccion corresponda a un intento de estafa, con dos etiquetas: 0 para mensajes genuinos y 1 para scams.

Tecnicamente es un fine-tuning de google-bert/bert-base-uncased, un transformer encoder de tipo BERT con 109.483.778 parametros totales. El ajuste se realizo durante 3 epocas con un max_length de 192 tokens, learning rate de 3e-05 y pesos de clase balanceados. El repositorio ocupa 0,4 GB y los pesos estan en formato safetensors.

Su relevancia es acotada y muy especifica: no es un modelo de proposito general ni pretende serlo, sino una pieza concreta dentro de un pipeline de deteccion de fraudes orientado al contexto de Singapur (bancos locales, agencias y servicios de pago). La model card indica explicitamente que se trata de uno de los modelos candidatos comparados durante el desarrollo y que no es el que ScamLens usa en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base, google-bert/bert-base-uncased) |
| Parametros totales | 109.483.778 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 192 tokens (max_length de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de bert-base-uncased, un transformer encoder con atencion bidireccional, y se ajusta como clasificador de secuencias con dos etiquetas. La configuracion de entrenamiento documentada incluye 3 epocas, learning rate 3e-05, batch size 8, max_length 192, warmup_ratio 0,1, weight_decay 0,01, scheduler lineal, class_weights balanceados, val_ratio 0,2 y seed 42. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion adicionales; es un fine-tuning supervisado convencional.

El conjunto de datos consta de 1901 ejemplos, de los que 1522 se usan para entrenamiento y 379 para validacion. La particion de validacion se realiza por plantilla de mensaje (1387 plantillas), de modo que las copias cercanas de un mensaje de entrenamiento nunca aparecen en validacion, lo que reduce la fuga de informacion entre splits. Los datos son mensajes de estafa y mensajes genuinos con estilo de Singapur: mensajes tomados o reconstruidos a partir de avisos publicos de fraude, mensajes sinteticos, alertas bancarias generadas en pares genuino/estafa y SMS cotidianos de corpus publicos. Se publican los hashes SHA-256 de los ficheros de entrenamiento y de test.

## Capacidades

- Clasificacion binaria de texto: devuelve la probabilidad de que un mensaje sea scam (etiqueta 1) o genuino (etiqueta 0).
- Deteccion basada exclusivamente en la redaccion del mensaje, sin analisis de enlaces, numeros de telefono ni remitentes.
- Integracion como herramienta `quick_score` dentro del agente ScamLens, configurable mediante la variable de entorno `SCAMLENS_QUICK_SCORE_MODEL`.
- Umbrales de interpretacion definidos en ScamLens: riesgo alto desde 0,70, medio desde 0,50 y bajo por debajo de 0,50.
- Procesamiento de mensajes cortos de SMS y chat en ingles, con truncamiento a 192 tokens.
- No soporta tool calling, function calling, razonamiento multi-paso, vision, audio ni modo thinking; es un clasificador puro.

## Casos de uso

- Filtro de primera pasada en una pasarela de SMS: el modelo puntua cada mensaje entrante y marca como sospechosos los que superan el umbral de 0,50 o 0,70, que luego se derivan a revision humana o a herramientas adicionales de verificacion de enlaces.
- Componente de un agente antifraude: se usa como `quick_score` dentro de ScamLens para dar una primera opinion sobre la redaccion antes de que otras herramientas del agente comprueben dominios, numeros y remitentes.
- Moderacion de chats de atencion al cliente: clasificacion de mensajes de usuarios que podrian contener intentos de ingenieria social o suplantacion de entidades bancarias.
- Etiquetado asistido de corpus: preanotacion de grandes volumenes de SMS para construir datasets de fraude, con revision manual posterior de los casos cercanos al umbral.
- Educacion y concienciacion: demostracion practica de como el analisis de redaccion permite detectar patrones linguisticos de estafa en mensajes de banca y pagos.
- Investigacion academica sobre deteccion de fraude en texto: linea base reproducible (seed 42, hashes publicados) para comparar con otros clasificadores en el dominio de Singapur.
- Triaje en soporte bancario: priorizacion de conversaciones que contienen lenguaje tipico de estafa para que un analista las revise antes.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de validacion y el conjunto de test (178 mensajes escritos a mano de Singapur, nunca presentes en entrenamiento; se considera scam a partir de probabilidad 0,50; intervalos de confianza al 95 %):

| Metrica | Valor | IC 95 % |
|---|---|---|
| F1 en validacion | 0,977 | no disponible |
| Accuracy en test | 0,921 | 0,872 - 0,953 |
| Recall de scam en test | 0,894 | 0,820 - 0,940 |
| Precision de scam en test | 0,969 | 0,912 - 0,989 |
| F1 en test | 0,930 | no disponible |
| Mensajes genuinos clasificados como scam | 3 de 74 | no disponible |
| Scams no detectados | 11 de 104 | no disponible |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,44 GB solo para pesos (109,5 M de parametros), mas activaciones y overhead; en la practica cabe en cualquier GPU consumer con 2 GB o mas.
- VRAM estimada en fp16: alrededor de 0,22 GB para pesos, con requisitos totales por debajo de 1 GB.
- GPU recomendadas: cualquier GPU moderna sirve; para lotes grandes se recomienda A100, H100 o L4. En consumer funcionan RTX 4090, RTX 3090, RTX 3060 e incluso GPUs integradas.
- Tambien puede ejecutarse en CPU para volumentes moderados, dado el reducido tamano del modelo.
- Opciones de despliegue: transformers con PyTorch, text-embeddings-inference (el repo incluye el tag `text-embeddings-inference` y `endpoints_compatible`), y servidores de inferencia compatibles con Hugging Face Endpoints.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera latencia de milisegundos por mensaje en GPU y de decenas de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| danjai/scamlens-qs-google-bert-v9 | 109,5 M | 192 tokens | Clasificacion scam/genuino (SMS, Singapur) | no disponible | Hugging Face |
| google-bert/bert-base-uncased | 110 M | 512 tokens | Modelo base de proposito general (MLM) | Apache 2.0 (modelo original) | Hugging Face |
| Clasificadores de spam SMS genericos | no disponible | no disponible | Deteccion de spam SMS | variable | variable |

La comparacion directa con alternativas especificas de deteccion de scam en SMS no esta disponible en la informacion proporcionada. Frente a su modelo base, este fine-tuning anade la cabeza de clasificacion y reduce el contexto efectivo a 192 tokens, suficiente para mensajes cortos.

## Limitaciones y advertencias

- Solo evalua la redaccion: no comprueba enlaces, numeros de telefono ni remitentes. En ScamLens esas comprobaciones son herramientas separadas y esta puntuacion es solo una primera opinion.
- Entrenado con mensajes en ingles y contexto de Singapur (bancos, agencias y servicios de pago locales); su fiabilidad fuera de ese dominio es menor.
- El conjunto de test es pequeno (178 mensajes), por lo que los intervalos de confianza son amplios.
- No debe usarse de forma aislada para bloquear cuentas, mensajes o acusar a personas.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si de falsos positivos y falsos negativos: en test, 3 de 74 mensajes genuinos se marcaron como scam y 11 de 104 scams no se detectaron.
- La licencia no esta declarada en la informacion disponible; antes de un uso comercial debe verificarse con el autor.
- Es un modelo candidato de un proyecto academico y no el modelo que ScamLens usa en produccion, segun la propia model card.
- El truncamiento a 192 tokens puede perder informacion en mensajes largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/danjai/scamlens-qs-google-bert-v9
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
