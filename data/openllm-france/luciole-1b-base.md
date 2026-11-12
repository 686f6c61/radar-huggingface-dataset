# OpenLLM-France/Luciole-1B-Base

## Resumen

Luciole-1B-Base es un modelo de lenguaje causal de tipo decoder-only con 1.319.309.312 parametros, desarrollado por LINAGORA y el consorcio OpenLLM-France en el marco del proyecto OpenLLM France, financiado por BPI France a traves del programa France 2030. Se entreno en el supercomputador Jean Zay de GENCI, gestionado por IDRIS. Su proposito es servir como modelo base multilingue (fundacional) para posteriores procesos de ajuste fino, instruccion y alineamiento.

El modelo se entrena sobre aproximadamente 5 billones (5.053.616.226.304) de tokens de datos multilingues, con un reparto que prioriza ingles (41,9%) y frances (30,4%), seguido de aleman (3,8%), espanol (3,5%), italiano (1,9%), portugues (1,3%), neerlandes (1,0%) y arabe (0,5%), ademas de un 0,4% de lenguas regionales francesas y criollos, un 1,7% de datos paralelos, un 9,2% de lenguajes de programacion y un 3,5% de datos matematicos en ingles. La longitud de contexto declarada en la model card es de 131.072 tokens.

Es relevante ahora porque cubre un hueco poco atendido: un modelo base abierto, con licencia Apache 2.0 y entrenamiento documentado, centrado explicitamente en frances y en lenguas regionales europeas, lo que facilita el ajuste fino para productos en esos idiomas sin depender de modelos propietarios. No obstante, es un modelo exclusivamente preentrenado: no esta alineado ni optimizado para uso directo en produccion sin un ajuste posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (tag `nemotron` en Hugging Face) |
| Parametros totales | 1.319.309.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens (declarada en la model card) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; la model card sugiere `load_in_4bit` para inferencia eficiente |
| Idiomas soportados | fr, en, it, de, es, pt, nl, ar (mas lenguas regionales francesas y criollos en el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 2,6 GB) |

## Arquitectura y entrenamiento

La informacion disponible identifica el modelo con la etiqueta `nemotron` y lo describe como un modelo de lenguaje causal (decoder-only) de 1B parametros. No se detallan en la informacion proporcionada el numero de capas, dimensiones ocultas, numero de cabezas de atencion ni el tipo exacto de atencion empleado. Tampoco se especifica si se aplicaron tecnicas como decodificacion especulativa, atencion lineal o variantes hibridas.

El entrenamiento se realizo sobre 5.053.616.226.304 tokens durante 1.204.876 pasos, con un contexto de 131.072 tokens. La composicion del corpus combina datos web multilingues (con FineWeb 2 como fuente para las lenguas regionales), datos paralelos, codigo y matematicas en ingles. El dataset de entrenamiento esta publicado como OpenLLM-France/Luciole-Training-Dataset y el repositorio de entrenamiento como OpenLLM-France/Luciole-Training. No se indica en la informacion disponible si hubo fases de RLHF, DPO u otro alineamiento; de hecho, la model card situa el alineamiento como paso posterior recomendado, no realizado.

## Capacidades

- Generacion de texto autoregresiva (prediccion del siguiente token) en ocho idiomas principales: frances, ingles, italiano, aleman, espanol, portugues, neerlandes y arabe.
- Cobertura adicional de lenguas regionales francesas y criollos (euskera, breton, catalan, corso, franco-provenzal, criollo guadalupeño, criollo guyanes, occitano, picardo, criollo reunionés, criollo de Santa Lucia, criollo seychelense, tahitiano y valon), segun la composicion del dataset.
- Capacidad de completar frases y responder preguntas en formato few-shot (la model card incluye un ejemplo de 1-shot de capitales en frances).
- Exposicion a codigo (9,2% del corpus) y a matematicas en ingles (3,5%), aunque la model card advierte que no esta optimizado para generacion de codigo.
- No dispone de tool calling, function calling, modo thinking, vision ni audio: es un modelo base sin ajuste de instrucciones.
- No soporta de forma nativa razonamiento multi-paso orientado a agentes; requeriria ajuste fino especifico.

## Casos de uso

- Ajuste fino para asistentes conversacionales en frances: al ser un modelo base con 30,4% de datos en frances, sirve como punto de partida para SFT y DPO en dominios como atencion al cliente o soporte interno, con un coste de entrenamiento bajo por su tamano de 1,3B.
- Procesamiento de lengua francesa en administraciones publicas: ajuste para tareas de resumen, clasificacion o extraccion sobre documentacion administrativa, aprovechando la cobertura de frances y lenguas regionales.
- Modelos especializados en lenguas regionales: fine-tuning sobre euskera, breton, catalan, occitano o criollos, donde escasean modelos base abiertos con datos de esas variedades.
- Generacion aumentada con recuperacion (RAG) multilingue: su ventana declarada de 131.072 tokens permite concatenar varios fragmentos recuperados, aunque el rendimiento real en contextos largos no esta documentado en la informacion disponible.
- Base para investigación en multilingüismo: analisis de transferencia entre lenguas, evaluacion de sesgos por idioma o estudios de tokenizacion, al estar el dataset y el codigo de entrenamiento publicados.
- Preentrenamiento continuado (continued pretraining): punto de partida para dominios verticales (legal, medico, industrial) en frances e ingles con presupuestos de computo moderados.
- Generacion de texto asistida en entornos con GPU de consumo: con cuantizacion a 4 bits, el modelo cabe en GPUs de gama media y permite prototipado rapido antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una seccion de evaluacion y un informe tecnico "coming soon", pero no incluye cifras de MMLU, HumanEval, GSM8K ni de tareas multilingues en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, aproximadamente 2,6 GB solo para pesos, mas overhead de activaciones y cache KV; en 4 bits, alrededor de 0,7-1 GB para pesos.
- GPU recomendadas: A100, H100 o L40S para entrenamiento y ajuste fino; RTX 4090, RTX 3090 o A10 para inferencia en fp16.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en fp16 y en tarjetas con 4-6 GB usando cuantizacion a 4 bits, siempre que el backend lo soporte.
- Opciones de despliegue: `transformers` con `device_map="auto"` y `load_in_4bit` (sugerido en la model card); vLLM, TGI, llama.cpp u Ollama son compatibles en la medida en que existan conversiones a sus formatos, aunque la informacion disponible no confirma publicaciones GGUF oficiales.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Luciole-1B-Base | 1,32B | 131.072 | 8 principales + regionales | Apache 2.0 | Base sin alinear; foco frances |
| Modelos comparables de 1B | no disponible | no disponible | no disponible | no disponible | No se han identificado alternativas concretas en la informacion proporcionada |

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos alternativos que permitan una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Es un modelo exclusivamente preentrenado: no debe usarse directamente en produccion sin ajuste fino de instrucciones y, preferiblemente, alineamiento con preferencias (DPO, RLHF).
- Riesgo de generar contenido toxico u ofensivo: parte del corpus frances proviene de obras de dominio publico antiguas con sesgos de otras epocas; el filtrado del dataset sigue en curso.
- Riesgo de alucinacion elevado en uso directo, al no haber pasado por alineamiento ni por entrenamiento de instrucciones.
- Rendimiento desigual entre idiomas: el arabe (0,5%) y las lenguas regionales (0,4%) tienen una representacion muy inferior al frances y al ingles, por lo que su calidad sera previsiblemente menor.
- No esta optimizado para generacion de codigo pese a incluir un 9,2% de datos de programacion.
- El rendimiento real con contextos de 131.072 tokens no esta validado con benchmarks en la informacion disponible; la ventana declarada no garantiza recuperacion fiable en contextos largos.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, sin restricciones adicionales conocidas, pero el usuario asume la responsabilidad sobre el contenido generado.
- No hay informe tecnico publicado en el momento de la informacion disponible, lo que limita la verificacion independiente de los detalles de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenLLM-France/Luciole-1B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/OpenLLM-France/Luciole-Training-Dataset
- Repositorio de entrenamiento: https://github.com/OpenLLM-France/Luciole-Training
- OpenLLM-France: https://openllm-france.fr/
- LINAGORA Labs: https://labs.linagora.com/
- GENCI: https://www.genci.fr/
- IDRIS: http://www.idris.fr/docs/idris/missions
- BPI France: https://www.bpifrance.fr/
- France 2030: https://www.info.gouv.fr/grand-dossier/france-2030
- FineWeb 2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
