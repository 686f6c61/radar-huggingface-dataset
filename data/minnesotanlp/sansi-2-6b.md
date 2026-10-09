# minnesotanlp/SanSi-2.6B

## Resumen

SanSi-2.6B es un modelo de decisión tipada (typed decision model) desarrollado por Minnesota NLP (minnesotanlp) y presentado en el artículo «SanSi: A Looped Typed Decision Model for System 1.5 Thinking» (arXiv:2610.07730). No es un modelo generativo en el sentido habitual: dado un estado textual, una pregunta y entre 2 y 26 opciones declaradas, devuelve una probabilidad para cada opción y no produce texto. Está construido sobre Ouro-2.6B, un modelo preentrenado para operar en bucle en el que una única pila de 48 capas compartidas se aplica T = 8 veces.

El repositorio contiene únicamente lo entrenado: adaptadores LoRA de rango 64 y un pequeño readout por cada loop, 121,4 millones de parámetros en total, mientras que el backbone permanece congelado y se descarga desde ByteDance/Ouro-2.6B en la revisión fijada. Las probabilidades de las opciones se leen después de cada loop, de modo que una sola pasada hacia delante ofrece la decisión para todos los presupuestos de cómputo entre uno y ocho loops.

Su relevancia radica en tres propiedades medibles: exactitud de 75,8 % en los 10.027 ítems de test del artículo (media de tres semillas), calibración con un ECE de 0,078 y capacidad de abstención explícita (los ítems cuya respuesta no está en el estado se entrenan hacia la distribución uniforme, de forma que una probabilidad máxima baja indica que el modelo no se compromete). Está publicado bajo licencia Apache 2.0 y solo soporta inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje en bucle (looped language model): una pila de 48 capas compartidas aplicada 8 veces, más adaptadores LoRA y un readout por loop; backbone Ouro-2.6B |
| Parametros totales | 2,7B en el backbone (Ouro-2.6B); 121,4M parámetros entrenados en este repositorio |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el backbone se ejecuta en bfloat16 según la model card) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA; el backbone se descarga por separado desde ByteDance/Ouro-2.6B) |

## Arquitectura y entrenamiento

La arquitectura parte de Ouro-2.6B, un transformer preentrenado para reciclar una sola pila de 48 capas compartidas T = 8 veces. Sobre ese backbone congelado se entrenan dos componentes: adaptadores LoRA de rango 64 (alpha 128, dropout 0,05) aplicados a las proyecciones de atención y MLP, y un readout de rango 16 por cada loop. La decisión se obtiene leyendo las letras de las opciones en el último token después de cada loop, de manera que el mismo modelo sirve para cualquier presupuesto entre 1 y 8 loops. El prompt de entrenamiento tiene el formato `<state>` / `Question: <question>` / `Options: (A) <option 1> (B) <option 2> ...` / `Answer:`.

Los datos de entrenamiento son los 12.800 ítems de la suite de decisión del artículo, procedentes de 20 fuentes públicas que el repositorio de GitHub descarga en revisiones fijas y reconstruye byte a byte. La pérdida en cada loop combina entropía cruzada y Brier score contra la distribución objetivo del ítem. El entrenamiento usa 1.000 pasos de 16 ítems, AdamW con tasas de aprendizaje de 1e-4 (LoRA) y 1e-3 (readout), 200 pasos de calentamiento, decaimiento coseno hasta el 10 %, recorte de gradiente en 1,0, dos GPU y semilla 0. La innovación técnica destacable es el reparto del cómputo en loops con lectura calibrada en cada uno: `decide(..., loops=4)` ejecuta solo cuatro loops, a la mitad de cómputo, y obtiene 75,6 % frente al 75,8 % con ocho loops.

## Capacidades

- Decisión tipada: dada una pregunta con entre 2 y 26 opciones declaradas, devuelve una distribución de probabilidad sobre las opciones, sin generar texto.
- Salida probabilística calibrada: ECE de 0,078 en la comparativa del artículo, el valor más bajo de la tabla frente a alternativas como Qwen3.5-2B (0,123) o Kev-4B (0,119).
- Cómputo flexible (any-time): una sola pasada hacia delante produce la decisión en cada presupuesto de 1 a 8 loops; la exactitud crece de 62,5 % (loop 1) a 75,2 % (loop 8) en el checkpoint de semilla 0.
- Abstención: los ítems cuya respuesta no figura en el estado se entrenan hacia la distribución uniforme; el artículo cuenta una respuesta dura cuando la probabilidad máxima alcanza (1 + 1/K) / 2 para K opciones.
- Razonamiento de tipo System 1.5: la precisión mejora con loops adicionales sobre el mismo backbone, lo que refleja refinamiento iterativo de la representación, no generación de cadena de pensamiento.
- Capacidades multilingües: no disponibles; el modelo es solo inglés.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Visión o audio: no disponible.

## Casos de uso

- Evaluación automática de opciones múltiples en pipelines de investigación: el modelo recibe el enunciado como estado y las alternativas como opciones, y devuelve probabilidades en lugar de una cadena de texto, lo que elimina el parseo de respuestas libres y simplifica la integración en un pipeline de evaluación.
- Clasificación con conjuntos de etiquetas declarados: cualquier tarea de clasificación de hasta 26 clases puede formularse como estado más pregunta más opciones, aprovechando que la salida ya es una distribución normalizada y no requiere capa de clasificación adicional.
- Análisis de sensibilidad al presupuesto de cómputo: al exponer una decisión por loop, permite medir en un único experimento cuánta precisión se gana al duplicar el cómputo, útil para elegir el punto de operación en producción.
- Detección de incertidumbre y abstención en sistemas con humano en el bucle: un umbral sobre la probabilidad máxima permite derivar a revisión humana los ítems con respuesta no contenida en el estado, gracias al entrenamiento explícito hacia la uniforme.
- Razonamiento deductivo de orden relativo: casos como «Mia es más alta que Sam; Sam es más alto que Lee» con la pregunta «¿Quién es el más bajo?» se resuelven con probabilidades cercanas a 1,0 en la opción correcta ya en el primer loop.
- Investigación sobre calibración y scoring rules: el modelo está entrenado con entropía cruzada más Brier score en cada loop, lo que lo convierte en una pieza de comparación para estudiar calibración en modelos en bucle.
- Punto de partida para fine-tuning con PEFT: al publicarse solo los adaptadores LoRA sobre un backbone congelado, sirve como plantilla reproducible para aplicar la misma receta a otros backbones de la familia.

## Benchmarks y rendimiento

Exactitud (%) en los 10.027 ítems de test después de cada loop, media de las tres semillas del artículo y este checkpoint (semilla 0):

| Loop | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Media de tres semillas | 62,4 | 71,8 | 74,7 | 75,6 | 76,1 | 76,1 | 76,0 | 75,8 |
| Este checkpoint (semilla 0) | 62,5 | 71,1 | 74,3 | 75,0 | 75,4 | 75,5 | 75,5 | 75,2 |

Comparativa principal del artículo, con todos los modelos entrenados sobre los mismos datos y la misma receta salvo Kev-4B (que usa los datos del trabajo y el código de Kev); media de tres semillas. Los ítems in-distribution provienen de las fuentes de entrenamiento, los de near transfer de versiones más difíciles o reformuladas, y los de far transfer de fuentes nunca vistas. El coste es el tiempo de GPU de una pasada por los ítems de test, tomando un loop de Ouro-1.4B como 1.

| Modelo | Parametros | Loops | Coste | Global | In-dist. | Near | Far | ECE |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| SmolLM2-1.7B | 1,7B | 1 | 1,1 | 58,4 | 76,1 | 57,7 | 52,3 | 0,069 |
| Ouro-1.4B, un loop | 1,4B | 1 | 1,0 | 58,6 | 77,3 | 59,9 | 51,3 | 0,137 |
| Qwen3.5-2B | 1,9B | 1 | 1,2 | 66,7 | 84,3 | 62,3 | 61,7 | 0,123 |
| Qwen3.5-4B | 4,2B | 1 | 2,4 | 73,8 | 88,5 | 68,9 | 70,1 | 0,113 |
| Kev-4B (nuestros datos) | 4,2B | 1 | 2,1 | 74,3 | 88,6 | 70,9 | 70,3 | 0,119 |
| SanSi | 1,4B | 8 | 7,7 | 72,0 | 86,6 | 67,7 | 68,0 | 0,093 |
| **SanSi-2.6B** | 2,7B | 8 | 14,8 | 75,8 | 88,4 | 74,4 | 71,6 | 0,078 |

En la tabla comparativa del repositorio, SanSi-2.6B (backbone Ouro-2.6B, 121,4M parámetros entrenados) alcanza 75,8 % de exactitud tras el loop 8, frente a 72,0 % de SanSi (backbone Ouro-1.4B, 60,8M parámetros entrenados).

## Requisitos de hardware

- GPU obligatoria: la model card indica explícitamente «Use a GPU» y que el backbone se ejecuta en bfloat16.
- VRAM estimada: no disponible como dato publicado. Como referencia aritmética a partir del tamaño, 2,7B parámetros en bfloat16 ocupan aproximadamente 5,4 GB de pesos, a los que se suman los adaptadores (repositorio de 0,5 GB) y las activaciones y cachés correspondientes; conviene verificar el consumo real antes de dimensionar producción.
- GPU recomendadas: no disponible. Dado el coste relativo de 14,8 (frente a 1 para un loop de Ouro-1.4B), el modelo realiza 8 pasadas por la pila completa, por lo que el throughput es sustancialmente menor que el de un transformer de 2,7B de un solo paso.
- Cabe en GPU de consumo: no confirmado en la información disponible; por tamaño de pesos sería viable en tarjetas con suficiente memoria para bfloat16, pero no hay datos publicados de latencia ni de consumo en ese escenario.
- Opciones de despliegue: la vía documentada es el repositorio de GitHub (https://github.com/minnesotanlp/Sansi) con las funciones `sansi.hub.load` y `sansi.hub.decide`, sobre PEFT. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El artículo solo publica el coste relativo de GPU por pasada sobre los ítems de test (14,8 para SanSi-2.6B con 8 loops).
- Para ejecutar un conjunto de datos completo, el repositorio incluye `eval/evaluate.py`.

## Comparativa con modelos similares

| Modelo | Parametros | Loops | Coste | Global (%) | Edicion | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|---|
| SanSi-2.6B | 2,7B | 8 | 14,8 | 75,8 | 8 loops | apache-2.0 | HuggingFace (adaptadores PEFT) |
| SanSi | 1,4B | 8 | 7,7 | 72,0 | 8 loops | no disponible en la información proporcionada | HuggingFace |
| Qwen3.5-2B | 1,9B | 1 | 1,2 | 66,7 | 1 loop | no disponible en la información proporcionada | no disponible |
| Qwen3.5-4B | 4,2B | 1 | 2,4 | 73,8 | 1 loop | no disponible en la información proporcionada | no disponible |
| Kev-4B (nuestros datos) | 4,2B | 1 | 2,1 | 74,3 | 1 loop | no disponible en la información proporcionada | no disponible |
| SmolLM2-1.7B | 1,7B | 1 | 1,1 | 58,4 | 1 loop | no disponible en la información proporcionada | no disponible |
| Ouro-1.4B, un loop | 1,4B | 1 | 1,0 | 58,6 | 1 loop | no disponible en la información proporcionada | HuggingFace (ByteDance/Ouro-1.4B) |

SanSi-2.6B obtiene la mayor exactitud global de la tabla (75,8 %), 1,5 puntos por encima de Kev-4B pese a tener menos parámetros, pero a un coste de cómputo 7 veces superior al de Kev-4B (14,8 frente a 2,1) y con la ventaja añadida de la mejor calibración (ECE 0,078). SmolLM2-1.7B presenta un ECE ligeramente mejor (0,069) pero 17,4 puntos menos de exactitud global.

## Limitaciones y advertencias

- Solo inglés: el campo de idioma de la model card es `en` y no se documenta soporte de otros idiomas.
- Una sola pregunta con entre 2 y 26 opciones declaradas por llamada; no es un modelo conversacional ni de generación de texto.
- El backbone permanece congelado: SanSi-2.6B hereda los sesgos y el conocimiento de Ouro-2.6B, y los adaptadores solo modifican la forma de decidir sobre opciones declaradas.
- Riesgo de compromiso incorrecto: el modelo no puede alucinar texto, pero sí asignar una probabilidad alta a la opción equivocada. La propia model card advierte de que una probabilidad máxima baja indica falta de compromiso, y el artículo solo cuenta una respuesta dura cuando la probabilidad máxima alcanza (1 + 1/K) / 2.
- No hay resultados publicados de la precisión sobre ítems cuya respuesta no figura en el estado, más allá de describir el entrenamiento hacia la uniforme.
- La sección de limitaciones de la model card aparece truncada en la información proporcionada (corta en «per cal»), por lo que podrían existir advertencias adicionales del autor no recogidas aquí.
- Licencia Apache 2.0: permite uso comercial con las condiciones habituales de atribución y aviso de cambios, pero se aplica a los adaptadores publicados; el backbone Ouro-2.6B se distribuye por separado y conviene verificar su licencia antes de un despliegue comercial.
- Sin métricas publicadas de latencia, throughput ni consumo de VRAM, la planificación de producción requiere medición propia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/minnesotanlp/SanSi-2.6B
- Modelo SanSi (1.4B): https://huggingface.co/minnesotanlp/SanSi
- Modelo base Ouro-2.6B: https://huggingface.co/ByteDance/Ouro-2.6B
- Artículo (arXiv): https://arxiv.org/abs/2610.07730
- Artículo en PDF: https://arxiv.org/pdf/2610.07730
- Repositorio de código: https://github.com/minnesotanlp/Sansi
- Página del proyecto: https://minnesotanlp.github.io/Sansi/
- Organización Minnesota NLP en GitHub: https://github.com/minnesotanlp
- Organización Minnesota NLP en HuggingFace: https://huggingface.co/minnesotanlp
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
