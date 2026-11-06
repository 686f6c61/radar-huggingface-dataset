# imsg8/kalparso-muril

## Resumen

KalParso-MuRIL es un modelo de clasificación de tokens (token classification) especializado en la normalización temporal de entradas informales de agenda escritas en hinglish (mezcla de hindi y inglés en escritura latina). Lo desarrolla imsg8 (Shivang Gulati y Archana Praveen Kumar, Manipal Institute of Technology, MAHE) y parte de `google/muril-base-cased`, un encoder BERT de 237,5 millones de parámetros entrenado originalmente para 17 lenguas indias. El modelo resuelve un problema concreto: convertir expresiones temporales ambiguas como *parso shaam saade 5 baje* en una fecha y hora exactas, teniendo en cuenta el momento de referencia y el tiempo verbal.

La innovación no está en el encoder, sino en la combinación de tres cabezas ligeras (etiquetado BIO de expresiones temporales, tipo de entrada y dirección temporal) con un *grounder* determinista de 200 líneas que hace la aritmética de calendario. Esta separación permite que la desambiguación de términos como *kal* (que significa mañana o ayer según el tiempo verbal) se resuelva de forma explícita y auditable, algo que los LLM generalistas fallan con frecuencia. El modelo se distribuye en ONNX Runtime y funciona en CPU en decenas de milisegundos.

Es relevante ahora porque ofrece una alternativa de 237 M de parámetros que supera en precisión a modelos de 26-32 B en esta tarea concreta (86,4 % frente a 89,0 % de gemma4:26b, pero a 29 ms por entrada frente a 10,8 s) y porque demuestra que la especialización con grounding determinista puede batir a la escala bruta en dominios con convenciones bien definidas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MuRIL-base, BERT-like) con tres cabezas lineales: `tag` (13 etiquetas BIO), `typ` (3 clases) y `dir` (2 clases) |
| Parámetros totales | 237.570.066 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 64 tokens (longitud máxima de entrenamiento) |
| Tipos de cuantización | Solo fp32. El autor advierte explícitamente de que la cuantización dinámica int8 con los valores por defecto de ONNX Runtime degrada MuRIL al 11 % de precisión; no se proporciona ningún fichero int8 |
| Idiomas soportados | Hindi (hi), inglés (en); en la práctica, hinglish en escritura latina |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`onnx/model.onnx`, 948 MB) para inferencia; safetensors (fp16) para fine-tuning; tokenizer.json y meta.json |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `google/muril-base-cased`, un encoder tipo BERT con 237 M de parámetros. Sobre la representación del primer token se aplican tres cabezas lineales independientes: una de etiquetado de secuencia con 13 etiquetas BIO para marcar expresiones temporales, una de clasificación del tipo de entrada (3 clases: `reminder`, `note`, `goal`) y una de dirección temporal (2 clases). La salida del modelo se combina con `ground.py`, un resolutor determinista que aplica las convenciones del dataset para calcular la fecha y hora finales a partir de la fecha ancla.

El entrenamiento se hizo sobre 29.911 entradas sintéticas generadas por plantillas (KalParso v3, con spans a nivel de carácter) más 3.300 tuits de PHINC con etiquetas débiles de tiempo verbal derivadas de sus traducciones al inglés. Se usó AdamW con learning rate 5e-5, batch de 32, 3 épocas, decaimiento lineal con 6 % de warm-up, longitud máxima de 64 y una única NVIDIA T4. Ninguna entrada humana del conjunto de test está presente en los datos de entrenamiento. El checkpoint publicado corresponde a la semilla 7, seleccionada por puntuación de calibración y nunca por la puntuación de test.

## Capacidades

- Extracción de expresiones temporales en hinglish en escritura latina, con spans a nivel de carácter.
- Clasificación del tipo de entrada de agenda: recordatorio, nota u objetivo.
- Determinación de la dirección temporal (pasado o futuro) a partir del tiempo verbal, lo que permite desambiguar *kal* como ayer o mañana.
- Normalización a fecha ISO (`YYYY-MM-DD`) y hora (`HH:MM`) mediante el grounder determinista incluido.
- Inferencia en CPU sin PyTorch, únicamente con ONNX Runtime, tokenizers y numpy.
- Manejo de expresiones como *parso*, *shaam*, *saade 5 baje* o *agle Friday* según las convenciones documentadas del dataset.
- Detección zero-shot de expresiones temporales en hindi formal en Devanagari (F1 85,8 en NTX), aunque el grounder no cubre ese léxico.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento extendido; es un modelo de extracción, no generativo.

## Casos de uso

- Normalización de entradas de agenda en asistentes personales: el modelo recibe la frase escrita por el usuario y la fecha ancla, y devuelve tipo, fecha y hora exactas en milisegundos, lo que permite crear el evento en un calendario sin intervención humana.
- Desambiguación temporal en aplicaciones de recordatorios: la cabeza de dirección temporal resuelve casos como *kal Rahul se mila tha* (pasado, ayer) frente a *kal Rahul se milna hai* (futuro, mañana) que los LLM generalistas confunden con frecuencia.
- Preprocesado en pipelines de NLP para hindi/inglés: marcar spans temporales antes de un modelo generativo reduce la carga de este último y hace auditable la resolución de fechas.
- Extracción de fechas en notas de voz transcritas o mensajes de chat: con 29 ms por entrada en una CPU de 2019 a un solo hilo, se puede procesar en tiempo real en servidores modestos o incluso en el dispositivo.
- Anonimización y enriquecimiento de datasets: identificar y normalizar expresiones temporales en corpus de hinglish para tareas posteriores de análisis o indexación.
- Sistemas de bajo consumo en producción: al no requerir GPU ni PyTorch, encaja en funciones serverless, contenedores ligeros o entornos edge donde desplegar un LLM de 26 B sería inviable.
- Evaluación comparativa de resolutores temporales: sirve como baseline fuerte y determinista frente a enfoques basados en LLM para tareas de normalización de fechas.

## Benchmarks y rendimiento

Resultados sobre las 706 entradas humanas de held-out del dataset KalParso (`human/test`) y sobre el split de calibración de 262 entradas. La métrica es fecha y hora ambas correctas.

| Modelo | Held-out test | Calibración | Latencia CPU (1 núcleo) |
|---|---|---|---|
| KalParso-MuRIL fp32 (este) | 86,4 % | 93,8 % | 29 ms |
| KalParso-MuRIL, media de 5 semillas | 86,1 ± 0,3 % | no disponible | no disponible |
| gemma4:26b (prompting, sin entrenar) | 89,0 % | no disponible | 10,8 s (8 núcleos) |
| gemma3:27b (prompting, sin entrenar) | 82,3 % | no disponible | no disponible |
| qwen3:32b (prompting, sin entrenar) | 69,8 % | no disponible | no disponible |
| llama3.1:8b (prompting, sin entrenar) | 52,3 % | no disponible | no disponible |
| dateparser (librería) | 20,8 % | no disponible | no disponible |

La latencia de 29 ms corresponde a la mediana en un Intel Core i7-9700 (2019) limitado a 35 W, un solo hilo, de extremo a extremo incluyendo tokenización y grounding. En detección de expresiones temporales en hindi formal (NTX), el encoder alcanza F1 85,8 en zero-shot.

## Requisitos de hardware

- VRAM para inferencia: no requiere GPU; el fichero ONNX fp32 ocupa 948 MB y se ejecuta en CPU.
- GPU recomendadas: no aplica para inferencia; para fine-tuning basta una NVIDIA T4, según el autor.
- Cabe en cualquier CPU consumer moderna; el autor reporta 29 ms por entrada en un i7-9700 a un solo hilo y 35 W.
- Despliegue: ONNX Runtime (librería `onnxruntime`), con los ficheros `onnx/model.onnx`, `onnx/tokenizer.json` y `onnx/meta.json`, más los módulos `kalparso.py`, `ground.py` y `lexicon.py` incluidos en el repo. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo.
- Throughput estimado: aproximadamente 34 entradas por segundo por núcleo a partir de la latencia mediana de 29 ms; no se han publicado cifras de throughput agregado.
- No se debe cuantizar a int8: el autor advierte de que la cuantización dinámica con los valores por defecto de ONNX Runtime colapsa MuRIL al 11 % de precisión.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión (held-out) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KalParso-MuRIL | 237 M | 64 tokens | 86,4 % | Apache 2.0 | ONNX + safetensors en HF |
| kalparso-xlmr | no disponible | no disponible | no disponible (el autor lo recomienda) | no disponible | HF |
| kalparso-mdistil | no disponible (el más pequeño de la familia) | no disponible | no disponible | no disponible | HF |
| gemma4:26b | 26 B | no disponible | 89,0 % | no disponible | no disponible |
| dateparser | no aplica (reglas) | no aplica | 20,8 % | no disponible | librería |

La comparación con LLM generalistas no es del todo equivalente: gemma4:26b se evalúa con prompting y sin entrenamiento específico, y requiere 10,8 s por entrada en 8 núcleos frente a 29 ms en 1 núcleo del modelo especializado. Dentro de la propia familia KalParso, el autor recomienda `kalparso-xlmr` como opción general y describe este checkpoint como el más preciso y `kalparso-mdistil` como el más pequeño, pero no se han proporcionado cifras comparativas entre ellos en la información disponible.

## Limitaciones y advertencias

- El grounder sigue las convenciones escritas del dataset (por ejemplo, *agle Friday* significa el viernes próximo); conviene leer `spec.md` del dataset antes de fiarse en casos límite.
- Entrenado mayoritariamente con hinglish en escritura latina; en hindi formal en Devanagari el encoder detecta expresiones temporales en zero-shot (F1 85,8 en NTX), pero el léxico del grounder no las cubre.
- El conjunto de test humano lo escribió un único hablante, por lo que la precisión puede diferir con los hábitos de otros usuarios.
- No debe cuantizarse a int8 con los valores por defecto de ONNX Runtime: la precisión cae al 11 % en MuRIL. Solo se distribuye fp32.
- Riesgo de alucinación estructural bajo en la parte de extracción, pero el grounder puede producir fechas incorrectas si la entrada se sale de las convenciones documentadas.
- No es un modelo generativo: no soporta tool calling, agentes, visión ni audio, y su ventana de 64 tokens limita entradas largas.
- Licencia Apache 2.0, que permite uso comercial, pero el autor no documenta garantías ni soporte; el paper está en revisión.
- Solo 0 descargas y 0 likes en el momento de la consulta, lo que implica poca validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/imsg8/kalparso-muril
- Código, entrenamiento y evaluación: https://github.com/imsg8/kalparso
- Dataset KalParso: https://huggingface.co/datasets/imsg8/kalparso
- Variante XLM-R (recomendada por el autor): https://huggingface.co/imsg8/kalparso-xlmr
- Variante mDistilBERT (la más pequeña): https://huggingface.co/imsg8/kalparso-mdistil
- Modelo base: https://huggingface.co/google/muril-base-cased
