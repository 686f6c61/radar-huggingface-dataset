# 3p3r/aegis-firewall-generic-text-light

## Resumen

Aegis-firewall-generic-text-light es un clasificador binario de texto (yes/no) desarrollado por 3p3r y publicado en Hugging Face. El modelo parte de un encoder `all-MiniLM-L6-v2` afinado y ejecutado sobre hardware de inferencia en el borde, concretamente un acelerador Asus UGen300 basado en el chip Hailo-10H. La cabeza de clasificacion yes/no es una capa lineal que se ejecuta en el host, no en el acelerador. El modelo se presenta como un "System 1" de proposito general: responde de forma rapida y superficial a preguntas cotidianas, sin razonamiento profundo.

El modelo esta pensado como un componente ligero de filtrado o triaje, no como un modelo generativo. Su tamano de repo es de 0,0 GB y las descargas y likes registrados son cero, lo que indica que se trata de un artefacto experimental de publicacion reciente (creado en noviembre de 2026). La licencia GPLv3 condiciona su uso comercial y de redistribucion.

Aunque la model card no detalla el numero exacto de parametros, el encoder base `all-MiniLM-L6-v2` es conocido por ser un transformer pequeno (del orden de decenas de millones de parametros), lo que explica su idoneidad para ejecucion en un acelerador de baja potencia. La relevancia actual del modelo reside en su enfoque de despliegue en el borde con Hailo, un nicho poco cubierto por los clasificadores publicados en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (fine-tune de `all-MiniLM-L6-v2`) con cabeza lineal yes/no en host |
| Parametros totales | no disponible (encoder base MiniLM-L6, orden de decenas de millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (ejecucion en Hailo-10H, formato de compilacion propietario) |
| Idiomas soportados | en (ingles) |
| Licencia | GPL-3.0 |
| Formato de pesos | no disponible (repo de 0,0 GB; pesos Hailo compilados y cabeza lineal en host) |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de tipo MiniLM (`all-MiniLM-L6-v2`) afinado para una tarea de clasificacion binaria. La salida del encoder se procesa mediante una capa lineal yes/no que reside en el host, mientras que el encoder se ejecuta en el acelerador Hailo-10H del Asus UGen300. Esta division de computo (encoder en chip, cabeza en CPU) es la innovacion tecnica principal descrita por el autor.

Los datos de entrenamiento citados en la model card son CommonsenseQA 2.0, CREAK y BoolQ. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF, DPO u otra tecnica de alineacion. Tampoco se detalla el proceso de fine-tuning mas alla de mencionar que el encoder esta "fine-tuned" sobre el modelo base. La model card indica que cada benchmark se limita a 2.000 filas por lentitud de evaluacion en el dispositivo, y que la puntuacion S1 emplea 12 items yes/no de un conjunto de 422 preguntas.

## Capacidades

- Clasificacion binaria de texto: responde yes o no a preguntas de sentido comun, conocimiento general y afirmaciones factuales.
- Triaje rapido de consultas: al ser un "System 1", esta disenado para respuestas inmediatas y de baja profundidad.
- Ejecucion en el borde: inferencia sobre acelerador Hailo-10H con latencia de milisegundos.
- Idiomas: exclusivamente ingles.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modos thinking.
- No se documenta capacidad de vision, audio ni generacion de texto libre; la salida se limita a yes/no.

## Casos de uso

- Filtrado previo de consultas en pipelines de atencion al cliente: el modelo puede clasificar rapidamente si una consulta binaria (por ejemplo, "es esto una queja?") requiere escalado, gracias a su latencia de 9 ms por llamada en batch-1.
- Triaje de contenido en el borde: en dispositivos con acelerador Hailo, el modelo puede decidir yes/no sobre afirmaciones cotidianas sin enviar datos a la nube, reduciendo latencia y exposicion de datos.
- Pre-filtro para sistemas RAG: clasificar si un documento o fragmento responde a una pregunta binaria antes de invocar un LLM mayor, ahorrando coste de inferencia.
- Moderacion ligera de formularios: validar respuestas yes/no en encuestas o cuestionarios automatizados de forma rapida.
- Gatekeeping en pipelines de agentes: usar la salida yes/no como condicion de parada o continuacion en flujos multi-paso, con la cautela de su baja precision medida.
- Experimentacion con despliegue Hailo: servir como referencia para desarrolladores que quieran medir latencia y throughput de clasificadores MiniLM en hardware Hailo-10H.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos en Hailo-10H y contando como correcta solo una respuesta textual exactamente yes o no:

| Bench | Correctos | Precision |
|---|---|---|
| BoolQ | 1358/1999 | 67,9% |
| CREAK contrast | 281/500 | 56,2% |
| CREAK dev | 891/1371 | 65,0% |
| CommonsenseQA 2.0 | 1081/1999 | 54,1% |
| S1 | 2/12 | 16,7% |
| StrategyQA | 344/687 | 50,1% |
| Micro | 3957/6568 | 60,2% |

Sonda legal y de salud: 24/40 global; legal yes 10/10; health yes 8/10; legal false yes 9/10; health false yes 5/10.

Rendimiento de latencia: batch-1 en chip, 300 llamadas tras calentamiento, media 9,0 ms y mediana 8,9 ms.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo esta disenado para ejecucion en acelerador Hailo-10H, no en GPU.
- GPU recomendadas: no aplica en el diseno original; no se documentan requisitos de GPU.
- Compatibilidad con GPU consumer: no documentada; el encoder MiniLM es pequeno y podria ejecutarse en CPU o GPU de gama baja, pero no se aportan datos.
- Opciones de despliegue: Hailo-10H (Asus UGen300) con cabeza lineal en host; no se documenta vLLM, llama.cpp, Ollama ni TGI.
- Latencia: media 9,0 ms y mediana 8,9 ms por llamada en batch-1 sobre Hailo-10H. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aegis-firewall-generic-text-light | no disponible (MiniLM-L6) | no disponible | Clasificacion yes/no | GPL-3.0 | Hugging Face (0 descargas) |
| all-MiniLM-L6-v2 (base) | ~22M | 256 tokens (tipico) | Embeddings/similitud | Apache-2.0 | Ampliamente disponible |
| Clasificadores NLI tipo DeBERTa-v3 | ~86M-304M | 512 tokens | NLI/zero-shot | MIT/Apache segun variante | Hugging Face |

La comparativa con clasificadores NLI es orientativa: no se dispone de resultados de benchmarks comparables en la informacion proporcionada para establecer una comparacion directa de rendimiento.

## Limitaciones y advertencias

- Precision baja en varias tareas: S1 16,7%, StrategyQA 50,1% y CommonsenseQA 2.0 54,1% estan en el rango del azar o por debajo, lo que limita su uso como clasificador fiable.
- Sesgo de respuesta afirmativa: en la sonda legal, legal false yes es 9/10 y legal yes 10/10, lo que sugiere una tendencia a responder yes con independencia de la veracidad.
- Solo ingles: no soporta otros idiomas.
- Sin datos de sesgo demografico, toxicidad o robustez adversarial en la model card.
- Riesgo de alucinacion no aplica en sentido generativo, pero la clasificacion erronea es frecuente y puede propagarse en pipelines.
- Licencia GPL-3.0: impone obligaciones de copyleft para uso comercial y redistribucion; revisar compatibilidad antes de integrar en productos propietarios.
- Evaluacion limitada a 2.000 filas por benchmark y S1 con solo 12 items, lo que reduce la fiabilidad estadistica de las cifras.
- Repo de 0,0 GB: no se confirma la disponibilidad efectiva de pesos en el repositorio.
- Cero descargas y likes: ausencia de validacion por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/3p3r/aegis-firewall-generic-text-light
- CommonsenseQA 2.0: https://github.com/allenai/csqa2
- CREAK: https://github.com/yasumasaonoe/creak
- BoolQ (dataset): https://huggingface.co/datasets/google/boolq
- Modelo base `all-MiniLM-L6-v2`: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Hailo (fabricante del acelerador Hailo-10H): https://hailo.ai
