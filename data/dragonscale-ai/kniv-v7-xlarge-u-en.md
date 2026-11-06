# dragonscale-ai/kniv-v7-xlarge-u-en

## Resumen

kniv-v7-xlarge-u-en es un encoder transformer multitarrea en inglés desarrollado por Dragonscale (dragonscale-ai), construido sobre dmis-lab/UltraBERT-380M. No es un modelo generativo: su función es producir un análisis lingüístico completo (part of speech, morfología, lemas, entidades, árboles de dependencias, roles semánticos, acto de diálogo, sentimiento y correferencia) y, además, extraer conocimiento estructurado contra un esquema que se define en tiempo de inferencia, sin reentrenamiento. Con 485M parámetros, ventana de 1.024 subtokens (hasta 512 palabras), licencia Apache-2.0 y pesos en ONNX (fp16 e int8), se posiciona como la variante "teacher" de la familia kniv v7 centrada en zero-shot.

El modelo resuelve un problema concreto en pipelines de agentes y analítica documental: convertir prosa y conversaciones en hechos consultables. Cada interlocutor se trata como una entidad, de modo que una frase como "I moved to Lisbon" produce la tupla `(user, lives in, Lisbon)`, con polaridad, modalidad, portador y tiempo asociados a cada hecho. Frente a su hermano kniv-v7-xlarge-d-en (538M, deberta-v3-large), esta variante prioriza el rendimiento zero-shot en tipos de relación y entidad nuevos, la extracción de memoria y ventanas más largas, con unos 50M parámetros menos.

Es relevante ahora porque cubre la capa de extracción estructurada que los LLM generativos suelen resolver de forma costosa y no determinista: aquí la salida es un esquema tipado, ejecutable en CPU con ONNX Runtime, y con un consumo de recursos muy inferior al de un modelo de chat. El repositorio (10,3 GB) incluye los grafos ONNX, el tokenizador, la configuración y el paquete Python `kniv_v7`, por lo que el despliegue no requiere dependencias externas más allá de onnxruntime, tokenizers, numpy y huggingface_hub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder multitarrea (base: dmis-lab/UltraBERT-380M) |
| Parametros totales | 485M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 512 palabras por ventana (1.024 subtokens) |
| Tipos de cuantizacion | fp16, int8 (pesos ONNX cuantizados) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (grafos), tokenizer incluido, paquete Python `kniv_v7` |
| Version | kniv v7 (`ultrabert-380m-v7b8ev`), 2026-10-20 |
| Pipeline | token-classification |
| Tamano del repositorio | 10,3 GB |

## Arquitectura y entrenamiento

Se trata de un encoder transformer multitarrea derivado de UltraBERT-380M, con 485M parámetros y una ventana de 1.024 subtokens (hasta 512 palabras). Sobre una única torre de codificación se superponen cabeceras para varias tareas lingüísticas (POS, morfología, lematización, NER, parsing de dependencias, etiquetado de roles semánticos, clasificación de acto de diálogo y sentimiento por oración, y resolución de correferencia) y una capa de extracción de conocimiento que opera contra un esquema proporcionado en inferencia: el usuario nombra los tipos de entidad y las relaciones, y el modelo devuelve hechos con polaridad, modalidad, portador y tiempo. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO; esos datos no están disponibles.

La innovación destacable es el enfoque zero-shot sobre esquema: en lugar de fine-tuning por dominio, el modelo generaliza a tipos de entidad y relación no vistos (FewRel con 15 relaciones no vistas, CrossNER en cuatro dominios). La distribución es íntegramente ONNX con variantes fp16 e int8, lo que permite ejecución en CPU sin pila de PyTorch. El repositorio incluye el paquete `kniv_v7`, que convierte texto en resultados y gestiona el análisis por turnos de conversación, tratando a cada hablante como entidad para la construcción de memoria de agente.

## Capacidades

- Análisis lingüístico completo en inglés: part of speech (UPOS), morfología, lematización, entidades nombradas, árboles de dependencias, roles semánticos, correferencia, acto de diálogo y sentimiento por oración.
- Extracción de entidades y relaciones definidas por el usuario en tiempo de inferencia, sin fine-tuning (zero-shot).
- Extracción de hechos con metadatos: polaridad, modalidad, portador (holder) y tiempo.
- Memoria conversacional y de agente: cada hablante se modela como entidad, lo que permite construir hechos del tipo `(user, lives in, Lisbon)` a partir de los turnos.
- Construcción de grafos de conocimiento y extracción de información a nivel de documento (relaciones documentales).
- Procesamiento por ventanas de hasta 512 palabras (1.024 subtokens), adecuado para documentos y conversaciones de longitud media.
- Ejecución en CPU mediante ONNX Runtime con pesos fp16 e int8.
- No soporta tool calling ni function calling en el sentido de un LLM generativo; la salida es estructurada, no texto libre.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Memoria de agentes conversacionales: el modelo procesa los turnos con `kniv.analyse(turns=[...])` y extrae hechos atribuidos a cada hablante, de modo que un asistente puede persistir preferencias y datos del usuario en un almacén estructurado en lugar de en un historial de texto.
- Construcción de grafos de conocimiento: a partir de documentación técnica o corpus empresarial, se definen los tipos de entidad y relación relevantes y el modelo devuelve tripletas con polaridad y tiempo, listas para cargar en Neo4j u otro almacén de grafos.
- Enriquecimiento de motores de búsqueda: el análisis POS, lemas y dependencias permite indexar sobre formas canónicas y relaciones sintácticas, mejorando la recuperación frente a búsqueda léxica pura.
- Analítica de documentos y contratos: extracción de entidades y relaciones a nivel de documento (Re-DocRED) para poblar tableros de seguimiento sin revisión manual línea a línea, con revisión humana en los casos sensibles.
- Moderación y análisis de sentimiento por oración: la clasificación de sentimiento y acto de diálogo por oración permite segmentar conversaciones y detectar tono o intención en soporte al cliente.
- Procesamiento de reseñas y encuestas: NER y análisis de sentimiento combinados para agregar opiniones por entidad mencionada (producto, marca, servicio) en pipelines de voz del cliente.
- Preprocesado para pipelines de LLM: generar análisis lingüístico determinista y barato en CPU antes de invocar un modelo generativo, reduciendo coste y alucinación en la fase de extracción.
- Anotación asistida de corpus: el etiquetado POS, dependencias y roles semánticos sirve como preanotador para equipos de lingüística computacional que revisan y corrigen.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Dataset (split) | Metrica | Valor |
|---|---|---|---|
| Part-of-speech tagging | UD English EWT (test) | UPOS accuracy | 0,978 |
| Dependency parsing | UD English EWT (test) | LAS | 0,927 |
| Named entity recognition | OntoNotes 5.0 (test) | span F1 | 0,860 |
| Semantic role labeling | PropBank EWT (test) | end-to-end argument F1 | 0,797 |
| Coreference resolution | LitBank (test) | CoNLL F1 | 0,707 |
| Document-level relation extraction | Re-DocRED (test) | F1 (gold entities) | 0,728 |
| Document-level relation extraction | Re-DocRED (test) | F1 (end to end) | 0,616 |
| Zero-shot relation classification | FewRel (15 unseen, train+validation) | macro F1, m=5 | 0,729 |
| Zero-shot named entity recognition | CrossNER (test) | span F1, media de 4 dominios | 0,580 |

No se han publicado en la información disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros), que además no aplican a un encoder de extracción.

## Requisitos de hardware

- VRAM estimada: al ser un encoder de 485M parámetros, la inferencia en fp16 requiere del orden de 1 GB de pesos más activaciones; en int8, aproximadamente la mitad. No se dispone de cifras oficiales de memoria pico.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente; A100, H100, L4 o RTX 4090 aportan margen de sobra y mayor throughput en lotes.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también en CPU, ya que la distribución es ONNX y está pensada para onnxruntime sin PyTorch.
- Opciones de despliegue: ONNX Runtime (vía el paquete `kniv_v7` incluido en el repositorio); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de encoder.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kniv-v7-xlarge-u-en | 485M | 1.024 subtokens (512 palabras) | Encoder multitarrea + extracción zero-shot sobre esquema | Apache-2.0 | ONNX en Hugging Face |
| kniv-v7-xlarge-d-en | 538M | no disponible | Mismo diseño; mejor extracción supervisada, peor zero-shot | Apache-2.0 | Hugging Face |
| kniv-v7-large-en | 221M | no disponible | Estudiante destilado sobre ModernBERT-base | Apache-2.0 | Hugging Face |
| kniv-v7-small-en | 76M | no disponible | Estudiante destilado sobre ettin-encoder-32m | Apache-2.0 | Hugging Face |
| kniv-v7-tiny-en | 55M | no disponible | Estudiante destilado sobre ettin-encoder-17m | Apache-2.0 | Hugging Face |

La comparativa con encoders de extracción de otros proveedores (por ejemplo, modelos NER o de relation extraction especializados) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: cualquier texto en otro idioma queda fuera del alcance declarado.
- No es un modelo generativo: no produce texto libre ni soporta tool calling; su salida es análisis lingüístico y hechos estructurados.
- Riesgo de error en la extracción: los benchmarks zero-shot son moderados (CrossNER span F1 de 0,580; Re-DocRED end-to-end F1 de 0,616), por lo que la salida requiere revisión en dominios nuevos.
- Uso prohibido por el autor para decisiones sensibles sobre personas (médicas, legales, financieras o laborales) sin revisión humana, y para perfilado de individuos sin consentimiento.
- Los resultados de benchmarks son declarados por el autor y están marcados como no verificados; no deben tomarse como evaluación independiente.
- La model card remite a GUIDE.md para conocer y mitigar los modos de fallo conocidos; no se detallan en la información disponible.
- Licencia Apache-2.0: permite uso comercial, pero conviene conservar los avisos de licencia y atribución.
- El repositorio ocupa 10,3 GB, lo que puede ser relevante para despliegues con almacenamiento limitado.
- No se documentan sesgos específicos ni datos de composición del entrenamiento, lo que limita la evaluación de riesgos de sesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dragonscale-ai/kniv-v7-xlarge-u-en
- Modelo hermano kniv-v7-xlarge-d-en: https://huggingface.co/dragonscale-ai/kniv-v7-xlarge-d-en
- kniv-v7-tiny-en: https://huggingface.co/dragonscale-ai/kniv-v7-tiny-en
- kniv-v7-small-en: https://huggingface.co/dragonscale-ai/kniv-v7-small-en
- kniv-v7-large-en: https://huggingface.co/dragonscale-ai/kniv-v7-large-en
- Modelo base UltraBERT-380M: https://huggingface.co/dmis-lab/UltraBERT-380M
- Organización del autor: https://huggingface.co/dragonscale-ai
- Guía de la familia (GUIDE.md): incluida en el repositorio del modelo (no se dispone de URL directa)
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada
