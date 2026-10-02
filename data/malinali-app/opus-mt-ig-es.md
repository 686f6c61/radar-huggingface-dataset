# malinali-app/opus-mt-ig-es

## Resumen

`malinali-app/opus-mt-ig-es` es un modelo de traduccion automatica neuronal que traduce de igbo (`ig`) a castellano (`es`). No es un modelo entrenado desde cero: se trata de un reempaquetado de los pesos de `Helsinki-NLP/opus-mt-ig-es` (familia OPUS-MT, desarrollada por el grupo de investigacion Language Technology de la Universidad de Helsinki) en formato safetensors, junto con tokenizadores rapidos convertidos de SentencePiece a JSON, con el objetivo de permitir inferencia en dispositivo mediante el motor Candle. Lo publica el proyecto Malinali, una aplicacion de traduccion on-device.

El modelo tiene 75.445.862 parametros, lo que lo situa en la gama de los transformers encoder-decoder compactos (arquitectura Marian), y ocupa aproximadamente 0,3 GB en el repositorio. Su relevancia actual es practica y de nicho: cubre el par linguistico igbo-castellano, poco representado en los grandes modelos multilingues, y lo hace con un artefacto ligero y desplegable en movil sin conexion, algo util para escenarios de traduccion offline, privacidad de datos y bajo consumo de recursos.

La direccion de traduccion es unica (ig → es). Esto es importante: no es un modelo bidireccional ni un sistema multilingue general, y su calidad y cobertura dependen enteramente del modelo base de Helsinki-NLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Marian (MarianMT) |
| Parametros totales | 75.445.862 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible (los modelos OPUS-MT de este tamano suelen trabajar con secuencias de hasta ~512 tokens, dato no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | safetensors en precision completa; el repositorio no distribuye variantes GGUF, GPTQ ni AWQ. Orientado a inferencia on-device con Candle |
| Idiomas soportados | Igbo (`ig`) como idioma origen y castellano (`es`) como idioma destino; direccion unica ig → es |
| Licencia | no disponible en la ficha de HuggingFace; la model card indica seguir la licencia del modelo base, tipicamente CC-BY 4.0 para OPUS-MT |
| Formato de pesos | safetensors (`model.safetensors`) mas `config.json`, `tokenizer-enc.json` y `tokenizer-dec.json` |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Marian, un transformer encoder-decoder disenado especificamente para traduccion automatica neuronal. La familia OPUS-MT de Helsinki-NLP entrena estos modelos sobre corpus paralelos extraidos del repositorio OPUS, con un preprocesado basado en SentencePiece y un entrenamiento supervisado clasico de traduccion. Al ser un reempaquetado, este repositorio no anade entrenamiento propio: los pesos son identicos a los del modelo base `Helsinki-NLP/opus-mt-ig-es`, y la unica transformacion aplicada ha sido la conversion de formato (pesos a safetensors y tokenizadores SentencePiece a JSON de tokenizer rapido de Hugging Face).

No hay informacion en los materiales proporcionados sobre el numero de tokens de entrenamiento, la composicion exacta del dataset paralelo igbo-castellano, ni sobre si se aplicaron tecnicas de ajuste como RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa u otras) mas alla del propio empaquetado para Candle. Conviene senalar que el proyecto Malinali declara explicitamente que no reclama la propiedad del modelo entrenado y que solo redistribuye pesos y tokenizadores.

## Capacidades

- Traduccion automatica de texto de igbo a castellano, en una unica direccion.
- Generacion de texto condicionada a la tarea de traduccion (pipeline `text2text-generation` / `translation`).
- Funcionamiento con tokenizadores rapidos separados para origen y destino, lo que facilita su integracion en pipelines de Hugging Face Transformers.
- Inferencia en dispositivo a traves de Candle (integracion `marian_flutter`), pensada para ejecucion offline.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que permite desplegarlo en Hugging Face Inference Endpoints.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni modo de razonamiento explicito.
- El soporte multilingue se limita estrictamente al par igbo-castellano.

## Casos de uso

- Traduccion offline en aplicaciones moviles: al ser un modelo de 75 millones de parametros y 0,3 GB, puede integrarse en una app Flutter mediante Candle para traducir texto igbo a castellano sin conexion a internet, algo util en zonas con conectividad limitada.
- Preservacion y acceso a contenido en igbo: traduccion de articulos, documentacion o textos comunitarios en igbo al castellano para facilitar su difusion a hablantes de castellano.
- Atencion a usuarios igbo-parlantes en servicios digitales: integracion del modelo en formularios o chats para ofrecer una primera traduccion de las consultas antes de que las atienda un humano.
- Procesamiento por lotes de corpus: traduccion masiva de documentos o datasets en igbo al castellano como paso previo a tareas de analisis, anotacion o mineria de datos.
- Investigacion en traduccion de bajos recursos: uso como linea base para comparar tecnicas de traduccion en pares linguisticos con pocos datos paralelos disponibles.
- Prototipado rapido de pipelines de traduccion: gracias a los tokenizadores rapidos y al formato safetensors, sirve para validar integraciones con Transformers, TGI o endpoints antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha de HuggingFace no incluye metricas BLEU, chrF, MMLU ni ninguna otra evaluacion cuantitativa, y los resultados de busqueda web proporcionados no contienen datos de rendimiento de este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,30 GB en precision FP32, unos 0,15 GB en FP16 y alrededor de 0,08 GB en cuantizacion INT8.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo es tan pequeno que incluso una GPU integrada o una GTX 1050 lo ejecutarian sin problema. Para produccion, una T4 o una L4 ofrecen margen de sobra.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo, incluidas las de gama baja, y tambien en CPU y en dispositivos moviles.
- Opciones de despliegue: Hugging Face Transformers, Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`), Text Generation Inference (TGI) y Candle a traves de la integracion `marian_flutter`. El repositorio no incluye pesos GGUF, por lo que no esta listo para llama.cpp u Ollama sin conversion previa.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dado el tamano del modelo, se espera una latencia baja en hardware moderno, pero no hay cifras confirmadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `malinali-app/opus-mt-ig-es` | 75,4 M | no disponible | ig → es | no disponible (base CC-BY 4.0) | HuggingFace, Candle |
| `Helsinki-NLP/opus-mt-ig-es` | ~75 M (mismo modelo base) | no disponible | ig → es | CC-BY 4.0 (segun OPUS-MT) | HuggingFace, Transformers |
| `facebook/nllb-200-distilled-600M` | 600 M | no disponible | Multilingue (200 idiomas, incluye igbo y castellano) | CC-BY-NC 4.0 | HuggingFace |
| `facebook/m2m100_418M` | 418 M | no disponible | Multilingue (100 idiomas) | MIT | HuggingFace |

La comparativa con NLLB-200 y M2M-100 procede de conocimiento general sobre esos modelos; los datos concretos de contexto y licencia de este repositorio no estan confirmados en la informacion proporcionada.

## Limitaciones y advertencias

- Direccion unica: el modelo solo traduce de igbo a castellano; no soporta la direccion inversa ni otros pares linguisticos.
- Licencia no confirmada: la ficha de HuggingFace no especifica licencia. La model card remite a la licencia del modelo base (tipicamente CC-BY 4.0 para OPUS-MT), por lo que conviene verificar los terminos antes de un uso comercial.
- Riesgo de alucinacion y errores de traduccion: como todo modelo de traduccion neuronal entrenado con corpus paralelos limitados, puede producir traducciones incorrectas, omisiones o invenciones en terminos especializados, nombres propios o expresiones idiomaticas.
- Sesgos del corpus: al derivar de OPUS-MT, hereda los sesgos y las carencias del corpus paralelo igbo-castellano utilizado en el entrenamiento, que puede estar desequilibrado en dominios (religioso, administrativo, etc.).
- Cobertura limitada de registros: al ser un modelo pequeno y de un par linguistico de bajos recursos, su rendimiento en lenguaje coloquial, tecnico o muy especializado es probablemente inferior al de modelos multilingues mayores.
- Sin datos de evaluacion: no hay metricas publicadas de BLEU o chrF, por lo que su calidad real no puede verificarse a partir de la informacion disponible.
- Modelo de reempaquetado: no aporta mejoras de calidad respecto al modelo base; las limitaciones del original se mantienen intactas.
- Sin soporte documentado de tool calling, agentes ni capacidades multimodales, por lo que no debe plantearse como sustituto de un LLM generalista.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/malinali-app/opus-mt-ig-es
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-ig-es
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Aplicacion Malinali: https://malinali.app
