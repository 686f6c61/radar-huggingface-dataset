# PythiaFinance/8ball

## Resumen

8ball es un modelo de decisión de 421.293.830 parámetros publicado por PythiaFinance bajo licencia Apache-2.0. Se trata de un fine-tuning del checkpoint convaiinnovations/laya-typed-decisions que convierte el modelo en una "bola mágica" (Magic 8-Ball): recibe una pregunta del tipo "should I..." y devuelve una distribución de probabilidad calibrada sobre las 20 respuestas canónicas del juguete (10 afirmativas, 5 evasivas y 5 negativas), cada una mapeada a un valor de alineación con signo en el rango [-1, 1].

Arquitectónicamente es un encoder ModernBERT-large con una cabeza de decisión, integrado en el ecosistema Laya (librería `laya`, pipeline `text-classification`). Su rasgo más distintivo es que está deliberadamente entrenado para ser humilde: sin evidencia en el estado de entrada produce distribuciones casi uniformes, y solo se compromete cuando el contexto aporta señal. Es un modelo System One, pensado como capa de decisión ligera y calibrada, no como oráculo ni como modelo de conocimiento del mundo.

Su relevancia actual es doble. Por un lado, demuestra un caso de uso concreto de los modelos de decisión tipados de Laya con un objetivo lúdico pero calibrado (Brier 0.0031 frente al gold de persona). Por otro, sirve como ejemplo reproducible de la receta RLCD con policy gradient sobre proyecciones de logits ruidosas, con corpus mixto de 143.514 ítems y una comparativa pública frente a modelos de decisión de mayor tamaño dentro del benchmark S1MB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-large (encoder) + cabeza de decisión |
| Parametros totales | 421.293.830 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card; la evaluacion S1MB se ejecuto con la condicion de entrada extendida `--max-len 9216` |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; entrenamiento en fp32) |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas; el corpus de entrenamiento es mayoritariamente en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Libreria de carga | laya |
| Pipeline declarado | text-classification |
| Modelo base | convaiinnovations/laya-typed-decisions |
| Tamano del repositorio | 0.8 GB |
| Fecha de creacion | 2026-10-04 |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT-large de 421M parametros con una cabeza de decisión que produce distribuciones sobre conjuntos de opciones declaradas en tiempo de petición. En el caso de 8ball, el conjunto es fijo: las 20 respuestas canónicas del Magic 8-Ball, cada una mapeada a un valor de alineación con signo entre -1 y +1, donde la dirección proviene de la respuesta muestreada y la magnitud de la masa de probabilidad.

El entrenamiento sigue la receta RLCD del bucle upstream de Laya: policy gradient con reglas de puntuación propias (spherical 0.75 + ranked probability 1.0) sobre proyecciones de logits ruidosas, combinado con entropía cruzada suave contra distribuciones gold. Se ejecutaron 6 épocas en fp32, con calibración de temperatura por tipo después de la última época. El corpus consta de 143.514 ítems sin descartes: 79.000 del split de entrenamiento Open-Jev `release-v2-redistributable` (CC0, 12 fuentes), 30.100 procedentes de 14 splits de entrenamiento de NLP públicos convertidos a formatos de decisión S1MB (SNLI, HANS, PAWS, CREAK, SciTail, ETHOS, Civil Comments, DBpedia, AG News, poem_sentiment, ARC, OpenBookQA, AQuA-RAT y Banking77), 11.600 efectivos de persona gold de 8-ball generados por el profesor laya-typed-decisions sobre 6.200 preguntas y reescalados al mix canónico 50/25/25 (mezclados 70/30 con uniforme para introducir humildad en los objetivos), y 4.400 casos de decisión de código, lógica y finanzas generados por Qwen3.8-27B. El autor declara explícitamente que no se entrenó sobre filas de test de S1MB: la conversión de NLP transfiere formatos de decisión leídos de esquemas de test locales, pero aplicados únicamente a filas de split de entrenamiento.

## Capacidades

- Clasificación de decisión sobre un conjunto fijo de 20 opciones: devuelve una distribución de probabilidad calibrada, no texto libre.
- Puntuación de alineación con signo en [-1, 1] por respuesta muestreada.
- Decisión tipada genérica mediante el formato Laya (`choice`, con `instructions` y `criteria` declarados en la petición), aunque el checkpoint solo está calibrado para las 20 opciones de 8-ball.
- Capa de deflexión configurable: con umbral calibrado en 0.09, el 18,7% de las consultas recaen en respuestas evasivas.
- Muestreo de respuestas con mezcla de cubos calibrada al 50/25/25 canónico.
- Interface CLI (`uv run 8ball --provider laya-local "..."`) y API Python vía `laya.load(...)` + `agent.predict(...)`.
- Capacidades multilingües: no disponibles (no declaradas).
- Tool calling, function calling y razonamiento multi-paso: no disponibles (es un clasificador de decisión, no un modelo generativo de agentes).
- Visión, audio y modo thinking: no disponibles.

## Casos de uso

- Capa de decisión lúdica en aplicaciones de consumo: integrar el modelo como "oráculo" en bots de chat o apps móviles donde el usuario plantea preguntas del tipo "¿debería...?" y recibe una respuesta con un grado de compromiso explícito. El coste de 5-10 ms por consulta en GPU consumer lo hace viable en tiempo real.
- Generación de decisiones con abstención controlada: gracias al umbral de deflexión de 0.09 y a la calibración de humildad, el modelo es adecuado para escenarios donde interesa que el sistema diga "no lo sé" en lugar de inventar una respuesta.
- Generación de datos sintéticos de decisión: las distribuciones calibradas sobre 20 opciones pueden usarse como etiquetas suaves para entrenar o evaluar otros modelos de decisión de menor tamaño, aprovechando la escala de alineación firmada.
- Evaluación de calibración de modelos de decisión: con Brier 0.0031 frente al gold de persona y una mezcla de cubos de 49,7/25,1/25,2, sirve como referencia de hasta dónde llega la calibración en un modelo de 421M.
- Despliegue en CPU para prototipos y demos: con 330-390 ms por pregunta en CPU, permite ejecutar la lógica de decisión en entornos sin GPU, por ejemplo en pruebas locales o entornos de CI.
- Módulo de decisión en pipelines de agentes: el formato tipado de Laya permite insertarlo como subcomponente que resuelve elecciones discretas dentro de un flujo mayor, siempre que las opciones sean razonablemente cercanas al conjunto canónico.
- Investigación sobre recetas RLCD: el repositorio asociado documenta la metodología completa (143.514 ítems, 6 épocas, policy gradient con reglas de puntuación), lo que lo convierte en un caso reproducible para estudiar el intercambio entre habilidad general y persona entrenada.

## Benchmarks y rendimiento

Datos publicados en la model card del autor.

Persona de 8-ball (evaluación held-out, n=620):

| Metrica | Valor |
|---|---|
| Mezcla de cubos muestreada | 49,7 / 25,1 / 25,2 (canónico: 50 / 25 / 25) |
| Brier frente al gold de persona | 0,0031 (profesor: 0,0095; uniforme: 0,0175) |
| p_max media | 0,106 (p5 0,084 · p50 0,100 · p95 0,145) |
| Tasa de deflexión @0,09 | 18,7% de las consultas recaen en respuestas evasivas |

Habilidad general de decisión (S1MB english-v1, 137 benchmarks, 26.269 juicios; evaluador oficial S1MB, condicion `--max-len 9216`):

| Modelo | noul | choice | score | Task Avg |
|---|---|---|---|---|
| TypeSafe Jev 1.13 | 64,77 | 67,31 | 46,69 | 59,59 |
| laya-typed-decisions (base publicado) | 20,06 | 18,93 | 5,99 | 15,00 |
| 8ball v1 (fine-tune solo persona) | 18,77 | 17,14 | 2,14 | 12,69 |
| 8ball v2 (MTL r1, 47k items) | 28,87 | 21,47 | 19,18 | 23,17 |
| 8ball v3 (este modelo, 143k items, 6 epocas) | 33,85 | 24,82 | 21,43 | 26,70 |

El autor señala que el entrenamiento multi-tarea sacrificó aproximadamente 1,7 puntos de Task Avg respecto al profesor base a cambio de la persona (mezcla, escala de alineación, humildad), y que recuperó habilidad general de 12,69 a 26,70 en el proceso.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB en fp32 (421M parámetros), en torno a 0,84 GB en fp16/bf16 y unos 0,42 GB en int8. Son estimaciones de peso; la model card no publica cifras de VRAM medidas.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM libre es suficiente según el perfil de latencia declarado. El autor indica ejecución en una única GPU consumer a 5-10 ms por pregunta, sin especificar modelo concreto.
- CPU: viable, con 330-390 ms por pregunta según el autor.
- Cabe en GPU consumer: sí, según la model card ("runs on CPU or a single consumer GPU"). No se especifican modelos concretos.
- Opciones de despliegue: librería `laya` (carga mediante `laya.load(...)` y `agent.predict(...)`) y CLI `uv run 8ball --provider laya-local`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 330-390 ms/pregunta en CPU y 5-10 ms/pregunta en GPU consumer, según el autor. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Task Avg (S1MB) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PythiaFinance/8ball (v3) | 421.293.830 | no disponible | 26,70 | Apache-2.0 | HuggingFace |
| laya-typed-decisions (base) | no disponible | no disponible | 15,00 | no disponible | HuggingFace (convaiinnovations) |
| 8ball v2 (MTL r1) | no disponible | no disponible | 23,17 | no disponible | no disponible |
| TypeSafe Jev 1.13 | no disponible | no disponible | 59,59 | no disponible | no disponible |

Los dos primeros son el mismo linaje: 8ball v3 es un fine-tuning de laya-typed-decisions. TypeSafe Jev 1.13 aparece únicamente en la tabla de S1MB de la model card, sin que se detallen sus especificaciones. No se dispone de datos de arquitectura, contexto ni licencia para los modelos comparados.

## Limitaciones y advertencias

- Ausencia de conocimiento del mundo: el modelo juzga únicamente el estado que recibe. Si no hay evidencia en la entrada, su salida es deliberadamente casi uniforme. No es un oráculo.
- Persona entrenada de forma intrusiva: el checkpoint es casi uniforme en prácticamente cualquier tarea. Para decisiones tipadas generales el autor recomienda usar convaiinnovations/laya-typed-decisions en lugar de este modelo.
- Habilidad de primitivas de puntuación débil: 21,43 en el score de S1MB, muy por debajo de modelos de decisión de frontera (46,69 en TypeSafe Jev 1.13).
- Calibración restringida al conjunto fijo de 20 opciones de 8-ball. Otros conjuntos de opciones funcionan si se declaran en la petición, pero no están calibrados.
- La tasa de deflexión del 18,7% está calibrada para un umbral de 0,09 específico de este checkpoint; cambiarlo altera el comportamiento de abstención.
- Riesgo de alucinación: el modelo no genera texto libre, por lo que el riesgo se traslada a la interpretación de sus probabilidades. Con p_max media de 0,106, las salidas son poco comprometidas por diseño y no deben tratarse como predicciones de alta confianza.
- Idiomas soportados no declarados; no hay garantía de comportamiento fuera del inglés.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías sobre idoneidad en producción.
- El número de descargas y likes es 0 en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PythiaFinance/8ball
- Modelo base: convaiinnovations/laya-typed-decisions (referenciado en la model card; URL directa no disponible en la información proporcionada)
- Repositorio de metodología y CLI: github.com/RockmSockmJesus/8ball (referenciado en la model card)
- Checkpoint alternativo citado en la model card: RockmSockmJesus/8ball-laya-mtl2
- Evaluador oficial S1MB: https://github.com/hotchpotch/S1MB
- Fuente del corpus Open-Jev: `release-v2-redistributable` (CC0), citado sin URL directa en la model card
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante al modelo. Las URLs devueltas corresponden a sitios de contenido para adultos y a una invitación a un grupo de Telegram, sin relación alguna con el modelo ni con su ámbito técnico.
