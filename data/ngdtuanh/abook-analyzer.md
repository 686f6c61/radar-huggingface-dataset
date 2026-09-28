# NGDtuanh/abook-analyzer

## Resumen

abook-analyzer:v3 es un modelo de análisis de texto orientado a la producción de audiolibros en vietnamita, desarrollado por NGDtuanh como parte del proyecto ABook. Se trata de un ajuste fino (fine-tune) del modelo denso Qwen/Qwen3-4B-Instruct-2507, con 4.022.468.096 parámetros, que etiqueta cada segmento de una novela vietnamita indicando quién habla, si el fragmento es narración, diálogo o pensamiento, además de emoción, intensidad, ritmo, volumen y género. La salida se entrega como JSON conforme al prompt y al esquema propios de ABook.

El modelo se ha entrenado mediante LoRA (r=16, alpha 32, dropout 0,05) sobre todas las capas de proyección (q, k, v, o, gate, up, down) durante 1 época, y posteriormente se ha fusionado con el modelo base y exportado a GGUF Q8_0 (4,28 GB). Su objetivo es sustituir a modelos generalistas en una tarea muy concreta: la atribución de hablante y el etiquetado expresivo en narrativa, donde un modelo mayor como qwen3:8b obtiene peores resultados.

Es relevante porque demuestra que un fine-tune pequeño y especializado puede superar a un modelo generalista el doble de grande en una tarea de nicho, ejecutándose además en tarjetas NVIDIA de 8 GB y siendo entre 1,5 y 1,7 veces más rápido que qwen3:8b. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Instruct-2507) con adaptadores LoRA fusionados |
| Parametros totales | 4.022.468.096 (~4 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | GGUF Q8_0 (publicado, 4,28 GB); no se indican otros niveles |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q8_0) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B-Instruct-2507, un transformer denso de ~4 B de parámetros. Sobre él se aplicó un ajuste fino con LoRA de rango r=16, alpha 32 y dropout 0,05, aplicado a todas las capas de proyección (q, k, v, o, gate, up, down), durante 1 época. Los adaptadores se fusionaron en el modelo base y el resultado se exportó a GGUF Q8_0 mediante los scripts `scripts/model_eval/train_lora.py` y `serve_lora.py`.

La pérdida se calculó únicamente sobre la respuesta del asistente (`assistant_only_loss`), de modo que el modelo aprende a asignar etiquetas y no a reproducir el texto de la novela. Los datos de entrenamiento son etiquetas de referencia elaboradas por el propio proyecto (directorio `scripts/model_eval/gold/`, con convenciones descritas en `docs/GOLD_GUIDE.md`), reproducidas a través del analizador de producción (`gold_replay.py` y `build_training_set.py`). No se utilizó ningún conjunto de datos externo y el texto de las novelas no se ha publicado. Los capítulos empleados para la evaluación nunca formaron parte del conjunto de entrenamiento. No se documenta en la información disponible el uso de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Etiquetado de hablante: identifica quién pronuncia cada segmento del texto, con el objetivo de asignar posteriormente una voz TTS concreta.
- Clasificación del tipo de fragmento: distingue narración, diálogo y pensamiento interno.
- Análisis expresivo: asigna emoción, intensidad, ritmo y volumen a cada segmento.
- Detección de género asociado al hablante.
- Salida estructurada: devuelve JSON conforme al prompt y al esquema definidos por ABook (`ebook_reader/analysis.py`).
- Generación de texto conversacional (pipeline declarado: text-generation).
- Ejecución local vía Ollama y llama.cpp gracias al formato GGUF.
- Capacidad multilingüe: limitada al vietnamita en la tarea objetivo; no se documentan capacidades multilingües generales.
- No se documentan tool calling, function calling, soporte de agentes, visión ni audio en la información disponible.

## Casos de uso

- Producción de audiolibros en vietnamita: el modelo etiqueta cada segmento de la novela con hablante y tipo de fragmento, permitiendo que el pipeline posterior asigne automáticamente una voz distinta a cada personaje y reserve la narración para una voz neutra.
- TTS multi-voz: al identificar quién habla en cada línea y con qué emoción, intensidad y volumen, se puede dirigir un sistema de síntesis de voz para que un mismo personaje mantenga un timbre y una entonación coherentes a lo largo de la obra.
- Dirección de narración expresiva: los campos de emoción, ritmo y volumen permiten ajustar la interpretación de la lectura automática, por ejemplo subiendo la intensidad en escenas de acción o reduciéndola en pasajes introspectivos.
- Preprocesado en aplicaciones de lectura por voz: integrable como paso previo a la generación de audio en lectores de ebooks, dado que trabaja con el esquema JSON nativo de ABook y se ejecuta en 8 GB de VRAM.
- Casting automático de voces: la detección de género y hablante facilita asignar perfiles de voz por personaje sin intervención manual, reduciendo el trabajo de etiquetado en obras largas.
- Investigación en atribución de hablante en narrativa: sirve como referencia para estudiar la resolución de correferencia de personajes en textos literarios vietnamitas, con métricas F1 B-cubed reportadas por el autor.
- Análisis de corpus literario: clasificar grandes volúmenes de novelas por tipo de discurso (diálogo frente a narración o pensamiento) para estudios estilométricos o de estructura narrativa.
- Integración en ABook Studio: el propio entorno del proyecto descarga y actualiza el modelo automáticamente al instalar la aplicación o pulsar "Actualizar Studio".

## Benchmarks y rendimiento

El autor reporta como métrica principal la F1 de voz B-cubed y el porcentaje de hablante correcto absoluto. Todas las ejecuciones se realizaron en la misma máquina, con el mismo código anfitrión y arranque en frío. Se comparan qwen3:8b (modelo generalista, sin ajuste) con abook-analyzer:v3.

| Conjunto de evaluacion | Frases | qwen3:8b (F1 / correcto) | abook-analyzer:v3 (F1 / correcto) |
|---|---|---|---|
| Light novel japonesa/coreana, 6 obras, capítulos no vistos | 519 | 52,9 / 54,9 | 55,7 / 62,4 |
| Young Master's PoV 248 (coreana), primera persona | 47 | 56,1 / 61,7 | 85,5 / 93,6 |
| Romance de los Tres Reinos, capítulos 50-52 | 219 | 74,8 / 79,5 | 85,6 / 89,5 |
| Tắt đèn XX, XXI, XXIV | 112 | 72,7 / 75,9 | 73,9 / 82,1 |
| Throne of Magical Arcana, 4 capítulos | 156 | 55,8 / 65,4 | 60,1 / 69,9 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el peso en Q8_0 ocupa 4,28 GB; sumando caché KV y overhead de ejecución, el autor indica que el modelo se ejecuta en una tarjeta NVIDIA de 8 GB.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 8 GB de VRAM (por ejemplo RTX 3060 8 GB, RTX 4060 8 GB, RTX 2070 8 GB y superiores). No se especifican recomendaciones para A100 o H100.
- Cabe en GPU de consumo: sí, en modelos con 8 GB de VRAM o más.
- Opciones de despliegue: Ollama (probado con la versión 0.33.2, mediante `ollama create abook-analyzer:v3 -f Modelfile`) y llama.cpp por el formato GGUF. No se documentan vLLM ni TGI.
- Latencia y throughput: el autor indica que es entre 1,5 y 1,7 veces más rápido que qwen3:8b. No se proporcionan cifras absolutas de latencia ni tokens por segundo.
- Nota de compatibilidad: en Ollama 0.34, la familia qwen3 "piensa" antes de devolver el JSON incluso cuando la petición incluye `format`; debe enviarse `"think": false`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| abook-analyzer:v3 | ~4 B | no disponible | Etiquetado de audiolibro en vietnamita (F1 hasta 85,5 en primera persona) | Apache-2.0 | GGUF Q8_0 en HuggingFace, Ollama |
| qwen3:8b (Ollama) | ~8 B | no disponible | Generalista; F1 52,9-74,8 en los mismos conjuntos | Apache-2.0 (según familia Qwen3) | Ollama |
| Qwen/Qwen3-4B-Instruct-2507 (base) | ~4 B | no disponible | Generalista | Apache-2.0 | HuggingFace, safetensors |

El modelo supera a qwen3:8b (el doble de parámetros) en todos los conjuntos de evaluación reportados, con la mayor diferencia en narrativa en primera persona (85,5 frente a 56,1 en F1 B-cubed). No se dispone de comparativas con otros modelos especializados en atribución de hablante en la información proporcionada.

## Limitaciones y advertencias

- Especialización estricta: el modelo solo ha aprendido el prompt y el esquema de ABook (`ebook_reader/analysis.py`); cualquier otra forma de consulta no ofrece garantías.
- Idioma: únicamente vietnamita. No se documenta rendimiento en otros idiomas.
- Errores conocidos en atribución de hablante: historias en primera persona con dos personajes nombrados de forma familiar; voz entre corchetes 『』 (espíritus o voz interior); y cadenas de diálogo entre dos personas sin etiquetas narrativas, donde la asignación se desplaza una posición.
- Alucinación: al ser un modelo generativo, puede producir etiquetas o estructuras JSON incorrectas; se recomienda validar la salida contra el esquema antes de usarla en producción.
- Sesgos: no se documenta ningún análisis de sesgos en la información disponible.
- Licencia: Apache-2.0, igual que el modelo base Qwen3-4B-Instruct-2507, por lo que permite uso comercial sin restricciones adicionales, manteniendo los avisos de licencia correspondientes.
- Datos de entrenamiento no reproducibles: el texto de las novelas y las etiquetas de referencia no se han publicado, lo que dificulta auditar el ajuste.
- Integración con Ollama: en versiones 0.34 y posteriores es necesario desactivar el modo de pensamiento (`think: false`) para evitar salidas previas al JSON.
- Métricas limitadas: no hay resultados de benchmarks generales, y las cifras de rendimiento proceden exclusivamente del autor.

## Enlaces

- HuggingFace: https://huggingface.co/NGDtuanh/abook-analyzer
- Repositorio del proyecto ABook: https://github.com/ntanhpro1221/ABook
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Archivos citados en la model card: `scripts/model_eval/train_lora.py`, `scripts/model_eval/serve_lora.py`, `scripts/model_eval/gold/`, `scripts/model_eval/gold_replay.py`, `scripts/model_eval/build_training_set.py`, `docs/GOLD_GUIDE.md`, `docs/ANALYSIS_RESEARCH.md`, `ebook_reader/analysis.py` (todos dentro del repositorio de ABook).
