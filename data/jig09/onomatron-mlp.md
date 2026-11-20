# Jig09/onomatron-mlp

## Resumen

Jig09/onomatron-mlp es un modelo de lenguaje a nivel de caracter (character-level LM) desarrollado por Jig09 (Vincent Le Meur) que genera nombres ficticios de personajes al estilo de la literatura francesa. Se construye desde cero siguiendo la filosofía de makemore de Andrej Karpathy, y forma parte del benchmark onomatron, una comparativa de 11 arquitecturas distintas (rnn, mlp, wavenet, dilated_wavenet, ngram, rwkv, gru, lstm, linear, transformer y mamba) evaluadas sobre la misma tarea y el mismo dataset. El modelo mlp es, según la model card, uno de los mejores de la comparativa por NLL de validación.

Arquitectura MLP (perceptrón multicapa) con normalización por lotes, 39.291 parámetros y un tamaño de 0,16 MB. Trabaja con un vocabulario de 38 caracteres más un token centinela `.` y una longitud de bloque de 4 caracteres. No es un modelo de lenguaje general: no modela semántica ni gramática, sino únicamente estadísticas de caracteres sobre nombres propios franceses.

Su relevancia es fundamentalmente didáctica y experimental: sirve como referencia mínima reproducible para comparar arquitecturas de secuencia en una tarea acotada, con protocolo de evaluación estricto (split por nombre para evitar fuga de n-gramas) y métricas de velocidad y tamaño. No está pensado para producción ni para aplicaciones de NLP reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) con batch normalization |
| Parametros totales | 39.291 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4 caracteres (block_size) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | francés (fr) |
| Licencia | MIT (código y pesos); datos de entrenamiento bajo `license: other` con atribución por fuente |
| Formato de pesos | `model.pt` (state_dict de PyTorch) + `config.json` |

Parámetros de arquitectura y entrenamiento (mejor configuración del estudio Optuna):

| Parametro | Valor |
|---|---|
| `emb_dim` | 29 |
| `h_dim` | 243 |
| `batch_norm` | True |
| `block_size` | 4 |
| `batch_size` | 128 |
| `learning rate` | 0,00029375384576328325 |
| `weight_decay` | 0,001 |
| `clip_grad` | 1,0 |
| Pasos finales | 10.000 |
| Early stopping | paciencia 20 |
| Seed | 42 |
| Dispositivo de entrenamiento | mps |

## Arquitectura y entrenamiento

El modelo es un MLP de tres capas efectivas (embedding de caracteres de dimensión 29, capa oculta de 243 unidades con batch normalization y capa de salida sobre el vocabulario de 38 caracteres más centinela) que predice el siguiente carácter a partir de un bloque fijo de 4 caracteres previos. Es una arquitectura sin mecanismos de atención ni recurrencia: la ventana de contexto es rígida y muy corta, lo que limita la coherencia más allá de patrones locales de n-gramas.

El entrenamiento se realizó sobre el dataset Jig09/onomatron-names, compuesto por nombres franceses saneados, uno por línea. El proceso incluyó una búsqueda de hiperparámetros con Optuna (muestreador TPE y poda ASHA, objetivo NLL de validación, estudios persistentes en SQLite) con seguimiento en MLflow, seguida de un reentrenamiento final de 10.000 pasos con AdamW, seed 42 y early stopping. El split se hizo por nombre (no por n-grama) en proporciones 80/10/10 con semilla fija, y el conjunto de test se evaluó una única vez. No se emplearon RLHF, DPO ni técnicas de alineación; es un modelo puramente supervisado a nivel de carácter.

## Capacidades

- Generación de nombres ficticios de personajes de literatura francesa a nivel de carácter.
- Modelado de estadísticas locales de caracteres: prefijos, sufijos y combinaciones frecuentes en nombres franceses, incluidos acentos.
- Muestreo configurable por número de nombres y semilla (`net.sample(n=20, seed=42)`).
- Inferencia rápida en CPU: 7.687 nombres/s medidos en CPU según la model card.
- Carga mediante bundle (`config.json` + `model.pt`) con la utilidad `load_bundle_from_hub` del paquete onomatron.
- CLI de generación independiente (`generate.py --bundle . --n 20 --seed 42`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Multilingüismo: únicamente francés; no hay capacidades multilingües.

## Casos de uso

- Generación de nombres para personajes de ficción en herramientas de escritura: el modelo produce nombres con fonética y ortografía francesa (por ejemplo `hér`, `fél`, `gir`) útiles como semilla creativa para novelistas o guionistas, dado su entrenamiento sobre nombres de literatura francesa.
- Prototipado y docencia en cursos de deep learning: su tamaño (0,16 MB) y su entrenamiento en 12,8 s permiten reproducir el pipeline completo (Optuna + MLflow + evaluación) en un portátil, sirviendo como ejemplo mínimo de LM a nivel de carácter.
- Benchmark de arquitecturas de secuencia: al formar parte del benchmark onomatron, permite comparar MLP frente a RNN, GRU, LSTM, WaveNet, RWKV, Transformer o Mamba bajo un protocolo común de NLL y velocidad.
- Generación de datasets sintéticos de nombres para pruebas de software: se pueden crear lotes de nombres ficticios para poblar bases de datos de test, formularios o fixtures sin usar datos personales reales.
- Experimentos de evaluación de fuga de datos: el protocolo de split por nombre del proyecto sirve como caso de estudio metodológico para medir y evitar leakage entre n-gramas correlacionados.
- Demostraciones educativas de muestreo autoregresivo a nivel de carácter: el modelo ilustra de forma tangible cómo un MLP con contexto de 4 caracteres genera secuencias y qué limitaciones tiene frente a arquitecturas con contexto mayor.
- Referencia de eficiencia extrema: con 39.291 parámetros y 7.687 nombres/s en CPU, puede integrarse en entornos sin GPU para tareas de generación de cadenas cortas en tiempo real.

## Benchmarks y rendimiento

Resultados del benchmark onomatron (ordenado por NLL de validación), tal como figuran en la model card:

| Modelo | val_nll | test_nll | Parámetros | Tamaño (MB) | Tiempo (s) | Nombres/s |
|---|---|---|---|---|---|---|
| rnn | 2,3592 | 2,3491 | 7.657 | 0,03 | 54,7 | 4.962 |
| **mlp (este modelo)** | **2,3759** | **2,3679** | **39.291** | **0,16** | **12,8** | **7.688** |
| wavenet | 2,4002 | 2,3632 | 37.624 | 0,15 | 19,5 | 1.396 |
| dilated_wavenet | 2,4557 | 2,4275 | 13.016 | 0,05 | 28,8 | 445 |
| ngram | 2,4706 | 2,4632 | 0 | 0,44 | 0,1 | 19.243 |
| rwkv | 2,4849 | 2,3446 | 120.998 | 0,48 | 37,2 | 1.085 |
| gru | 2,5292 | 2,4013 | 8.012 | 0,03 | 23,3 | 3.739 |
| lstm | 2,5381 | 2,3703 | 10.062 | 0,04 | 7,7 | 3.846 |
| linear | 2,5918 | 2,5928 | 1.444 | 0,01 | 3,7 | 7.018 |
| transformer | 3,1470 | 2,3757 | 805.158 | 3,22 | 66,6 | 253 |
| mamba | nan | 2,3653 | 56.102 | 0,22 | 716,6 | 87 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; la tarea no es aplicable a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula; el modelo ocupa 0,16 MB en pesos y puede ejecutarse en CPU sin GPU.
- GPU recomendadas: no requiere GPU; el entrenamiento se realizó en `mps` (Apple Silicon) con un pico de 395 MB.
- Cabe en cualquier GPU consumer, e incluso en Raspberry Pi o entornos embebidos; también en CPU sin aceleración.
- Opciones de despliegue: PyTorch nativo (carga del bundle con `load_bundle_from_hub` o `generate.py`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 7.688 nombres/s en CPU según la model card; tiempo de entrenamiento de 12,8 s en `mps`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | val_nll | test_nll | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| onomatron-mlp (este) | 39.291 | 4 caracteres | 2,3759 | 2,3679 | MIT | Hugging Face |
| onomatron-rnn | 7.657 | secuencia completa | 2,3592 | 2,3491 | MIT (proyecto) | Hugging Face (benchmark) |
| onomatron-wavenet | 37.624 | convolucional dilatado | 2,4002 | 2,3632 | MIT (proyecto) | Hugging Face (benchmark) |
| onomatron-transformer | 805.158 | atención | 3,1470 | 2,3757 | MIT (proyecto) | Hugging Face (benchmark) |

Los tres modelos comparables pertenecen al mismo benchmark onomatron y comparten dataset, protocolo de evaluación y licencia. El MLP ofrece el mejor equilibrio entre NLL de validación y velocidad de inferencia en CPU, superando en NLL al transformer (que tiene 20 veces más parámetros) y siendo notablemente más rápido que wavenet, rwkv o mamba.

## Limitaciones y advertencias

- No es un modelo de lenguaje general: carece de semántica y gramática más allá de estadísticas de caracteres; no debe usarse para generar texto libre.
- Sesgo hacia la literatura francesa: la distribución de nombres refleja las fuentes del dataset, con acentos conservados y el resto de caracteres descartados en la normalización.
- Riesgo de reproducción literal: con un conjunto de entrenamiento de pocos miles de nombres, el modelo puede reproducir nombres de entrenamiento y generar nombres que coincidan con personas reales; son ficticios por construcción y deben tratarse como tales.
- Prohibido su uso para nombrar personas reales o para tomar decisiones sobre individuos (uso fuera de alcance declarado por el autor).
- El contexto de 4 caracteres impide cualquier coherencia más allá de patrones locales de n-gramas.
- Licencia de datos: los nombres extraídos del dataset de resolución de alias de ObTIC (`compnet-renard/7-romans-alias-resolution`) no tienen licencia declarada; se pide citar a Maurel et al., "Du repérage à l'analyse", Digital Humanities 2025 (ObTIC, Sorbonne Université). Los ficheros locales `data/external/*.txt` tampoco declaran licencia.
- La licencia MIT cubre código y pesos, pero no resuelve las restricciones de atribución de las fuentes de datos; conviene revisar la model card del dataset antes de un uso comercial.
- Sin soporte documentado para cuantización ni para servidores de inferencia de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jig09/onomatron-mlp
- Dataset de entrenamiento: https://huggingface.co/datasets/Jig09/onomatron-names
- Repositorio del benchmark: https://huggingface.co/Jig09/onomatron-benchmark
- Repositorio GitHub del proyecto: https://github.com/vlemeur/onomatron
- makemore (Karpathy), inspiración del proyecto: https://github.com/karpathy/makemore
- Dataset de resolución de alias de ObTIC: `compnet-renard/7-romans-alias-resolution`
- Cita del proyecto: Le Meur, Vincent (2026), "onomatron: character-level generation of French literature names", https://github.com/vlemeur/onomatron
- Cita de datos ObTIC: Maurel et al., "Du repérage à l'analyse", Digital Humanities 2025 (ObTIC, Sorbonne Université)
