# RaunakSeksaria/anlp-a2-optimizers

## Resumen

`RaunakSeksaria/anlp-a2-optimizers` es un artefacto de investigación académica publicado en HuggingFace que contiene cuatro checkpoints de un mismo decoder transformer denso de 26,45 millones de parámetros, preentrenado desde cero sobre el corpus `browndw/human-ai-parallel-corpus` durante una pasada completa de 44,43 millones de tokens. Lo relevante no es el modelo en sí, sino que cada checkpoint se ha entrenado con un optimizador distinto —AdamW, MARS, Lion y Muon— elegido uno por cada categoría descrita en el trabajo sobre optimizadores de preentrenamiento, de modo que el repositorio funciona como un banco de comparación controlada de eficiencia de optimizadores con arquitectura, datos y tokenizador idénticos.

El modelo base es el "Task 1, variante v1" del Assignment 2 de la asignatura ANLP: un decoder autorregresivo denso, sin mezcla de expertos ni componentes de estado recurrente, con el tokenizador propio de la tarea anterior (`tokenizer.json`). El interés práctico es que permite medir, con un coste de cómputo muy bajo, cuánta eficiencia de datos y de tiempo aporta cada optimizador respecto a AdamW: Muon alcanza la pérdida final de AdamW con el 0,60x de los datos y un 1,67x de aceleración, mientras que Lion no llega a igualarla.

El repositorio tiene 0 descargas y 0 me gusta en el momento de redactar esta ficha, no declara licencia ni idiomas, y se distribuye únicamente como checkpoints PyTorch sin versiones cuantizadas. Se trata, por tanto, de un material docente y de reproducibilidad experimental, no de un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decoder transformer denso (autorregresivo), variante v1 del Task 1 |
| Parámetros totales | 26,45 M |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (no se publican versiones cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch `state_dict` en ficheros `.pt` (`<optimizer>/final.pt`, con claves `model` y `config`) |
| Tokenizador | `tokenizer.json` heredado del Task 1 (tamaño de vocabulario no disponible) |
| Dataset de preentrenamiento | `browndw/human-ai-parallel-corpus` |
| Tokens de entrenamiento | 44,43 M (una pasada, 1x datos por optimizador) |
| Optimizadores incluidos | AdamW, MARS, Lion, Muon |
| Librería declarada | pytorch |
| Tamaño del repositorio | 0,4 GB |
| Autor | RaunakSeksaria |
| Descargas / me gusta | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer denso de 26,45 M de parámetros, definido en el Task 1 de la misma asignatura y reutilizado sin cambios en el Task 2. No hay atención lineal, ni capas SSM, ni decodificación especulativa, ni mezcla de expertos: el único eje de variación entre los cuatro checkpoints es el algoritmo de optimización. El modelo se preentrena desde cero (no hay ajuste fino sobre pesos preentrenados) sobre `browndw/human-ai-parallel-corpus`, un corpus paralelo de texto humano y texto generado por modelos de lenguaje, con una pasada equivalente a 44,43 millones de tokens para cada uno de los cuatro optimizadores.

La innovación técnica del repositorio es precisamente la implementación manual de los optimizadores y su comparación bajo condiciones idénticas. Según la model card, Muon es el más eficiente en datos (alcanza la pérdida final de AdamW con 0,60x de los datos, velocidad 1,67x) y MARS el segundo (0,71x de datos, 1,41x), mientras que Lion nunca alcanza la pérdida final de AdamW dentro del presupuesto de entrenamiento. No se documenta ningún uso de RLHF, DPO u otro ajuste por preferencias; el objetivo declarado es de preentrenamiento puro.

Cada checkpoint se serializa como `{'model': state_dict, 'config': ...}` en el directorio del optimizador correspondiente, lo que facilita reproducir la evaluación cargando el mismo código de Task 1 y el tokenizador compartido.

## Capacidades

- Generación de texto autorregresiva en el dominio del corpus de preentrenamiento. Es la única capacidad implícita en la arquitectura declarada.
- Traducción o transformación entre registros humano y generado por IA: el corpus de entrenamiento es un corpus paralelo de ese tipo, aunque la model card no evalúa esta tarea de forma explícita.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes, razonamiento multi-paso ni modo de pensamiento (thinking mode).
- No se documenta capacidad multilingüe; los idiomas soportados figuran como no disponibles.
- No se documentan capacidades de visión, audio, código ni matemáticas.
- Los propios checkpoints son material de estudio de optimizadores: permiten reproducir la comparativa AdamW / MARS / Lion / Muon.

## Casos de uso

- Reproducción de experimentos de optimizadores: cargar los cuatro checkpoints `<optimizer>/final.pt` y reevaluar pérdida de validación, perplejidad, BLEU y ROUGE-L con el mismo código para verificar las cifras publicadas por el autor.
- Investigación en eficiencia de datos de optimizadores: usar la métrica "alcanza el AdamW final con X datos" para estudiar cuántas muestras ahorra Muon (0,60x) o MARS (0,71x) frente a AdamW en un presupuesto fijo de tokens.
- Docencia en cursos de PLN o de optimización: el repositorio es un ejemplo completo y de bajo coste de preentrenamiento desde cero con cuatro optimizadores escritos a mano, útil como práctica de laboratorio.
- Ablaciones controladas de nuevos optimizadores: cualquier optimizador nuevo puede entrenarse sobre el mismo decoder de 26,45 M y el mismo corpus de 44,43 M de tokens, y compararse directamente contra los cuatro resultados de referencia.
- Punto de partida para ajuste fino de dominio: al ser un decoder pequeño y completo (con su tokenizador), puede servir como inicialización para tareas de generación de texto de dominio específico cuando el presupuesto de GPU es muy reducido.
- Estudio de corpus humano vs. máquina: dado que el entrenamiento usa un corpus paralelo humano-IA y la evaluación reporta columnas separadas "human" y "LLM", el modelo es un candidato para experimentos de atribución o detección de texto generado, siempre que se valide previamente qué miden exactamente esas columnas.
- Prototipado en hardware muy limitado: con 26,45 M de parámetros, el modelo se puede ejecutar en CPU o en GPU integrada para pruebas de integración de pipelines, sin necesidad de aceleradores dedicados.
- Análisis de coste de entrenamiento: las columnas de estado (MB) y pico de memoria (MB) permiten estudiar el sobrecoste de memoria de cada optimizador (Lion ~100,9 MB frente a MARS ~302,7 MB) en un mismo presupuesto de pico (~5,1 GB).

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card. La model card no define formalmente las columnas "human", "LLM" ni "min", por lo que se reproducen tal cual sin interpretarlas.

| Optimizador | Val loss | Val ppl | human | LLM | BLEU | BLEU (sm.) | ROUGE-L | Estado (MB) | Pico (MB) | tok/s | min | Alcanza el AdamW final con | Aceleración vs AdamW |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| AdamW | 3,5921 | 36,31 | 4,288 | 3,371 | 0,77 | 0,79 | 13,06 | 201,8 | 5.187 | 72.168 | 10,3 | 1,00x datos | 1,00x |
| MARS | 3,4849 | 32,62 | 4,203 | 3,256 | 0,68 | 0,71 | 13,14 | 302,7 | 5.287 | 71.163 | 10,4 | 0,71x datos | 1,41x |
| Lion | 3,5988 | 36,55 | 4,290 | 3,379 | 0,56 | 0,59 | 13,06 | 100,9 | 5.086 | 76.248 | 9,7 | nunca | 0,90x |
| Muon | 3,2929 | 26,92 | 4,035 | 3,057 | 0,80 | 0,82 | 13,53 | 147,8 | 5.133 | 70.142 | 10,6 | 0,60x datos | 1,67x |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las cifras de tok/s corresponden al régimen de entrenamiento, no a inferencia, y la model card no indica sobre qué hardware se obtuvieron.

## Requisitos de hardware

- Inferencia en fp32: aproximadamente 106 MB de pesos (26,45 M parámetros × 4 bytes), calculado a partir del recuento de parámetros; la model card no publica cifras de inferencia.
- Inferencia en fp16/bf16: aproximadamente 53 MB de pesos.
- Inferencia en int8: aproximadamente 26 MB de pesos. No se distribuyen archivos cuantizados, por lo que habría que generarlos.
- Entrenamiento: el autor reporta un pico de memoria de entre 5.086 MB (Lion) y 5.287 MB (MARS), y un estado del optimizador de 100,9 MB (Lion) a 302,7 MB (MARS).
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con ≥6 GB de VRAM sirve para entrenar en la configuración reportada y prácticamente cualquier GPU moderna (o CPU) sirve para inferencia. No se justifica el uso de A100 o H100.
- Cabe en GPU de consumo: sí, con margen amplio; la model card no especifica el modelo de GPU empleado.
- Opciones de despliegue: PyTorch de forma nativa (los pesos son `state_dict` en `.pt`). No se proporcionan ficheros GGUF, plantillas de vLLM, TGI, Ollama ni llama.cpp, por lo que esos servidores requerirían conversión previa.
- Latencia y throughput de inferencia: no disponibles. El throughput de 70.142-76.248 tok/s reportado corresponde a entrenamiento.

## Comparativa con modelos similares

La información proporcionada no incluye modelos externos comparables, por lo que la comparación se plantea entre las cuatro variantes del propio repositorio, que comparten arquitectura, datos y tokenizador.

| Variante | Parámetros | Contexto | Val ppl | Eficiencia de datos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AdamW | 26,45 M | no disponible | 36,31 | 1,00x (referencia) | no disponible | sí, en el repo |
| MARS | 26,45 M | no disponible | 32,62 | 0,71x datos, 1,41x velocidad | no disponible | sí, en el repo |
| Lion | 26,45 M | no disponible | 36,55 | nunca alcanza a AdamW, 0,90x velocidad | no disponible | sí, en el repo |
| Muon | 26,45 M | no disponible | 26,92 | 0,60x datos, 1,67x velocidad | no disponible | sí, en el repo |

Comparativa con alternativas externas (GPT-2 small, TinyStories, Pythia u otros decoders pequeños de referencia): no disponible en la información proporcionada.

## Limitaciones y advertencias

- La licencia no está declarada, por lo que no puede asumirse ningún derecho de uso comercial. Antes de cualquier uso en producción habría que contactar con el autor.
- Es una entrega académica sin mantenimiento, con 0 descargas y 0 me gusta: no ha pasado ninguna validación por parte de la comunidad.
- El modelo ha visto únicamente 44,43 M de tokens en una sola pasada, un régimen muy por debajo del necesario para un decoder útil en tareas abiertas. La perplejidad de validación del mejor checkpoint (Muon) es 26,92, propia de un modelo infraentrenado.
- Riesgo alto de alucinación y de texto incoherente fuera del dominio del corpus `human-ai-parallel-corpus`.
- Sesgos conocidos: no documentados. El corpus de entrenamiento es paralelo humano-IA, lo que puede introducir sesgos de dominio y de estilo no analizados en la model card.
- No se documentan idiomas soportados ni longitud de contexto; no se debe asumir cobertura multilingüe ni ventanas largas.
- Las columnas "human", "LLM" y "min" de la tabla de resultados no están definidas en la model card, por lo que su interpretación es ambigua y no debería citarse sin aclaración.
- No se publican ficheros GGUF ni cuantizaciones, así que el despliegue en llama.cpp, Ollama o similares exige un proceso de conversión y validación adicional.
- Las fechas de creación y actualización del repositorio (27 de septiembre de 2026) no permiten inferir nada sobre su mantenimiento.
- No hay información sobre el hardware empleado en los experimentos, lo que dificulta comparar las cifras de tok/s con otros trabajos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RaunakSeksaria/anlp-a2-optimizers
- Dataset de preentrenamiento citado en la model card: https://huggingface.co/datasets/browndw/human-ai-parallel-corpus
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada (la model card menciona un "submission repository" sin enlace).
