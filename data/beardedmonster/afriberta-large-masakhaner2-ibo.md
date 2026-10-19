# BeardedMonster/afriberta-large-masakhaner2-ibo

## Resumen

`BeardedMonster/afriberta-large-masakhaner2-ibo` es un checkpoint de reconocimiento de entidades nombradas (NER) para igbo (`ibo`), obtenido por fine-tuning del encoder multilingue `castorini/afriberta_large` sobre el protocolo igbo del corpus MasakhaNER 2.0. El modelo resuelve una tarea concreta de etiquetado a nivel de token: asignar una categoria de entidad a cada token de una frase en igbo, usando una cabeza de clasificacion token a token sobre un transformer encoder-only.

Se trata de un modelo pequeno: 125.047.305 parametros totales en pesos safetensors, con un repositorio de 0,5 GB. La arquitectura de base es de tipo XLM-RoBERTa (encoder bidireccional), reutilizada por AfriBERTa para lenguas africanas. No es un modelo generativo: no produce texto libre ni soporta chat, tool calling o razonamiento multi-paso.

Su relevancia es acotada y muy especifica: cubre una lengua africana de bajos recursos (igbo) con un resultado declarado de span F1 de 0,8661 en una unica ejecucion, y sirve como pieza de un pipeline de extraccion de entidades (por ejemplo, para anonimizacion, indexacion o construccion de bases de conocimiento en igbo). El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta, y la card advierte de que la licencia aplicable es la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only tipo XLM-RoBERTa (base: `castorini/afriberta_large`) con cabeza de clasificacion de tokens (`AutoModelForTokenClassification`) |
| Parametros totales | 125.047.305 (segun safetensors del repositorio) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 256 tokens de `max_length` en el fine-tuning; la card no indica el maximo arquitectonico |
| Tipos de cuantizacion | No disponible (el repositorio solo publica safetensors; no se listan versiones GGUF, ONNX ni cuantizaciones INT8) |
| Idiomas soportados | Igbo (`ibo`) |
| Licencia | No disponible; la card remite a la licencia y terminos de `castorini/afriberta_large` |
| Formato de pesos | safetensors (tamano del repositorio: 0,5 GB) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo XLM-RoBERTa afinado para etiquetado de secuencias. Sobre la representacion contextual del encoder se anade una cabeza lineal de clasificacion por token; el campo `id2label` esta configurado, de modo que las predicciones se decodifican directamente a nombres de etiqueta sin mapeo manual. El entrenamiento se realizo sobre el protocolo igbo de MasakhaNER 2.0, con los siguientes hiperparametros declarados: 50 epochs, learning rate 5e-05, batch size 32, longitud maxima de 256 tokens y metrica de seleccion span F1.

No se documentan en la card el volumen de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo etapas de RLHF/DPO (no aplicables en un modelo discriminativo de este tipo). Tampoco se describe ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, etc.). La card si explicita la procedencia: el checkpoint fue producido por el harness de benchmark del propio proyecto, que reproduce los baselines publicados de MasakhaNER 2.0 con una desviacion de aproximadamente 0,25 F1, y los resultados provienen de una unica ejecucion, mientras que los articulos de referencia promedian 5 semillas.

## Capacidades

- Reconocimiento de entidades nombradas (NER) en igbo a nivel de token, con etiquetas decodificables directamente desde `id2label`.
- Extraccion de menciones de entidades en texto no estructurado como paso previo a tareas de normalizacion, enlazado o anonimizacion.
- Clasificacion de secuencias cortas: el limite practico de 256 tokens durante el entrenamiento condiciona el rendimiento en documentos largos, que deben segmentarse.
- Inferencia determinista y ligera: al ser un encoder de 125 M de parametros, permite ejecucion en CPU con latencia baja para volumenes moderados.
- Capacidades multilingues: limitadas al igbo; el modelo base es multilingue para lenguas africanas, pero este checkpoint esta afinado y evaluado unicamente en `ibo`.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni uso como agente. No dispone de modo "thinking".
- No se declara soporte de function calling ni de integracion con frameworks de agentes.

## Casos de uso

- Extraccion de entidades en corpus periodicos en igbo: el modelo etiqueta personas, organizaciones y lugares en articulos segmentados a 256 tokens, alimentando un indice de busqueda o una base de datos relacional de menciones.
- Anonimizacion de textos antes de publicacion o comparticion: deteccion de nombres de personas y organizaciones para su sustitucion por seudonimos en datasets de igbo, aprovechando que el modelo trabaja a nivel de span.
- Construccion de bases de conocimiento y grafos de entidades: uso del NER como primer eslabon de un pipeline de extraccion de relaciones, con resolucion posterior de entidades mediante reglas o embeddings.
- Monitorizacion de medios y redes sociales en igbo: deteccion de organizaciones y localizaciones citadas en publicaciones para agregacion de tendencias o alertas geograficas.
- Enriquecimiento de datasets para entrenamiento de modelos mayores: generacion de etiquetas automaticas de NER en igbo que luego se revisan manualmente, reduciendo el coste de anotacion.
- Procesamiento documental en administracion o ONG con contenido en igbo: extraccion de entidades de formularios, informes o transcripciones, ejecutable en CPU por su tamano reducido (125 M de parametros).
- Investigacion en NLP para lenguas africanas: punto de comparacion reproducible frente a baselines de MasakhaNER 2.0, con hiperparametros y metrica documentados en la card.

## Benchmarks y rendimiento

| Benchmark | Idioma | Metrica | Resultado | Notas |
|---|---|---|---|---|
| MasakhaNER 2.0 (protocolo ibo) | ibo | span F1 | 0,8661 | Media sobre 1 idioma; una unica ejecucion |

Hiperparametros declarados del fine-tuning:

| Setting | Valor |
|---|---|
| Epochs | 50 |
| Learning rate | 5e-05 |
| Batch size | 32 |
| Max length | 256 |
| Metrica de seleccion | span_f1 |
| Score medio | 0,8661 |

No se han publicado en la informacion disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros), ni comparaciones numericas con modelos alternativos. La propia card advierte de que los baselines de referencia promedian 5 ejecuciones, por lo que diferencias pequenas deben tratarse como ruido.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32, 0,25 GB en FP16 y 0,13 GB en INT8 para los 125 M de parametros, mas el overhead del runtime y del tokenizador.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); en el segmento profesional, A100 o H100 no aportan ventaja practica por el reducido tamano del modelo, salvo en escenarios de altisimo throughput por batching.
- Cabe holgadamente en GPU consumer e incluso en iGPU y en CPU. La inferencia en CPU es viable para volumenes moderados.
- Opciones de despliegue: `transformers` con `AutoModelForTokenClassification` y `pipeline("token-classification")`, exportacion a ONNX Runtime para produccion en CPU, empaquetado en un servicio FastAPI o Triton. vLLM y TGI no estan orientados a token classification en este caso; llama.cpp/Ollama requeririan una conversion a GGUF no publicada por el autor.
- Latencia y throughput estimados: no disponibles (la card no publica mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `BeardedMonster/afriberta-large-masakhaner2-ibo` | 125.047.305 | 256 tokens de entrenamiento | span F1 0,8661 en ibo (1 ejecucion) | No disponible (hereda la del base) | HuggingFace, safetensors, 0 descargas |
| `castorini/afriberta_large` (modelo base) | 125 M aprox. (mismo backbone) | No disponible en la informacion | No disponible (sin fine-tuning de NER) | No disponible en la informacion | HuggingFace |
| XLM-RoBERTa large (referencia multilingue) | 560 M aprox. | 512 tokens | No disponible en la informacion | MIT | HuggingFace, ampliamente desplegado |
| mBERT (referencia multilingue) | 178 M aprox. | 512 tokens | No disponible en la informacion | Apache 2.0 | HuggingFace |

No se dispone de resultados numericos comparables de otros checkpoints sobre el protocolo ibo de MasakhaNER 2.0 en la informacion proporcionada, por lo que la comparacion de rendimiento queda limitada al dato propio del modelo.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la card; al entrenarse sobre un corpus periodistico africano, puede heredar sesgos de cobertura geografica y de representacion de genero o etnia en las entidades detectadas.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y de etiquetado espurio en textos con ruido, dominios alejados del corpus o variantes ortograficas del igbo.
- Limitacion de contexto: el fine-tuning uso 256 tokens; documentos mas largos requieren segmentacion con posible perdida de entidades en los limites de fragmento.
- Limitacion de idioma: solo igbo. El modelo base es multilingue, pero este checkpoint no esta evaluado en otras lenguas y su uso fuera de `ibo` no esta validado.
- Robustez estadistica: los resultados provienen de una unica ejecucion; la card advierte que diferencias pequenas frente a otros sistemas deben considerarse ruido.
- Licencia: no disponible de forma explicita. La card indica que la licencia y terminos del modelo base `castorini/afriberta_large` rigen cualquier uso derivado, por lo que es obligatorio verificar ese repositorio antes de un uso comercial.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa; no debe tratarse como un checkpoint de referencia sin evaluacion propia en el dominio objetivo.
- No apto para tareas generativas: no puede usarse para resumen, traduccion, chat ni generacion de codigo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BeardedMonster/afriberta-large-masakhaner2-ibo
- Modelo base en HuggingFace: https://huggingface.co/castorini/afriberta_large
- Repositorio del proyecto MasakhaNER: https://github.com/masakhane-io/masakhane-ner

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre MasakhaNER 2.0; los unicos resultados obtenidos eran contenido no relacionado, por lo que no se incluyen.
