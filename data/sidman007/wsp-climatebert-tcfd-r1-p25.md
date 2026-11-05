# sidman007/wsp-climatebert-tcfd-r1-p25

## Resumen

`wsp-climatebert-tcfd-r1-p25` es un clasificador de texto en inglés derivado por poda y reajuste en forma cerrada del modelo `climatebert/distilroberta-base-climate-tcfd`, que clasifica párrafos de divulgación climática corporativa en las cuatro categorías de recomendación del marco TCFD: `governance`, `risk`, `strategy` y `metrics`. Lo publica el usuario `sidman007` como artefacto de investigación dentro de un proyecto de *weight-space programming* (edición directa del espacio de pesos sin descenso de gradiente).

La relevancia técnica está en el método: un LLM editor selecciona qué capas del encoder y qué unidades de las redes feed-forward conservar, y los pesos restantes se reajustan mediante regresión ridge resuelta en forma cerrada sobre activaciones obtenidas con un número acotado de pasadas hacia delante (25 presupuestadas, 21 utilizadas, 9,56 USD de coste de API del editor). No hay retropropagación, ni optimizadores, ni datos adicionales de entrenamiento.

El resultado es un checkpoint de 70.497.796 parámetros (31.316.740 no de embedding), un 14,3 % menos de parámetros totales y un 27,4 % menos de parámetros no de embedding respecto al modelo de partida (82.301.956). Mantiene las seis capas del encoder y reduce cada bloque FFN de 3.072 a 1.792 unidades. La precisión en el conjunto de test retenido es del 77,81 % con un macro-F1 de 0,7104, frente al 77,5 % del modelo publicado en ese mismo conjunto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa / DistilRoBERTa) con cabeza de clasificación de secuencias; 6 capas de encoder, FFN de 1.792 unidades |
| Parametros totales | 70.497.796 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (ventana usada en la medición de latencia; límite del modelo base) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en precisión completa) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (con la salvedad de uso de investigación indicada por el autor por la licencia del dataset) |
| Formato de pesos | safetensors (282 MB de checkpoint; 0,3 GB de repositorio) |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer tipo RoBERTa destilado, con seis capas y atención multi-cabeza estándar. La edición afecta exclusivamente a los bloques feed-forward: cada uno pasa de 3.072 a 1.792 unidades intermedias. Para cada capa, el editor leyó las entradas reales del bloque sobre párrafos de práctica (a nivel de token en las capas tempranas y solo en la posición `<s>` en la capa 5, ya que es la única que consume la cabeza de clasificación), conservó las unidades con mayor energía del peso de salida multiplicada por la varianza de activación, y reajustó `output.dense.weight` y el sesgo mediante regresión ridge para que las unidades conservadas reproduzcan la salida del bloque completo, incluidas las unidades descartadas. Atención, LayerNorms, proyecciones de entrada y cabeza de clasificación son los del modelo publicado, sin modificar.

No hubo entrenamiento en el sentido habitual: cada ajuste es una solución en forma cerrada sobre activaciones devueltas por pasadas hacia delante. El checkpoint se reconstruye bit a bit desde el checkpoint publicado fijado (commit `970630beedc2`) más el diff registrado, verificable con `scripts/reins/apply_edit.py --check` del repositorio fuente. Los datos de práctica del editor y los datos de entrenamiento del modelo base son `climatebert/tcfd_recommendations` (CC BY-NC-SA 4.0). El modelo nunca se entrenó con el split de test usado para la métrica reportada.

## Capacidades

- Clasificación de párrafos de divulgación climática en cuatro categorías TCFD: `governance`, `risk`, `strategy` y `metrics`.
- Clasificación de texto de dominio financiero y de sostenibilidad en inglés, con vocabulario específico de informes corporativos y reaseguro.
- Inferencia ligera en CPU: 18,7 ms por párrafo con batch 1 y 20,8 ms con batch 16 (4 hilos, ventana de 512 tokens).
- Integración directa con el pipeline `text-classification` de HuggingFace Transformers.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento extendido.
- Capacidad multilingüe limitada al inglés; no se reportan evaluaciones en otros idiomas.

## Casos de uso

- Triaje de informes de sostenibilidad: procesar memorias anuales y reportes TCFD en inglés y etiquetar cada párrafo según la recomendación que aborda, para construir un índice navegable o detectar secciones ausentes (`governance`, `risk`, `strategy`, `metrics`).
- Auditoría de cumplimiento TCFD: verificar automáticamente que una divulgación cubre las cuatro áreas recomendadas y señalar qué categorías tienen cobertura escasa antes de la publicación.
- Análisis de carteras de reaseguro: clasificar grandes volúmenes de texto de asegurados y contrapartes para agregar métricas de exposición y calidad de divulgación climática por entidad.
- Extracción de señales para modelos de riesgo: usar las etiquetas por párrafo como variables de entrada en pipelines de scoring de riesgo climático físico y de transición.
- Procesamiento a escala en infraestructura modesta: al requerir solo CPU y 18,7 ms por párrafo, permite clasificar corpus de decenas de miles de párrafos en servidores sin GPU.
- Investigación sobre edición de pesos: servir como caso de referencia reproducible para estudiar poda estructurada con reajuste en forma cerrada frente a fine-tuning convencional, con diff y manifiesto de edición publicados.
- Filtrado previo en pipelines de extracción de información: descartar párrafos irrelevantes antes de pasarlos a modelos mayores y más costosos.

## Benchmarks y rendimiento

| Metrica | Este modelo (r1/p25) | Modelo publicado (climatebert/distilroberta-base-climate-tcfd) | Objetivo del run |
|---|---|---|---|
| Precisión en test retenido | 77,81 % | 77,5 % | >= 76,50 % |
| Macro-F1 | 0,7104 | no disponible | >= 0,6896 |
| Latencia CPU, batch 1 (4 hilos, 512 tokens) | 18,7 ms/párrafo | 25,2 ms/párrafo | no disponible |
| Latencia CPU, batch 16 (4 hilos, 512 tokens) | 20,8 ms/párrafo | 30,1 ms/párrafo | no disponible |
| Parámetros totales | 70.497.796 | 82.301.956 | no disponible |
| Parámetros no de embedding | 31.316.740 | no disponible | no disponible |

El conjunto de test tiene 320 párrafos retenidos (197 de `strategy`, 49 de `metrics`, 48 de `risk` y 26 de `governance`). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para el checkpoint completo de 282 MB; no se publican pesos cuantizados, pero una cuantización a int8 reduciría el peso a aproximadamente 70 MB.
- GPU recomendadas: no es necesario GPU; el modelo está pensado para inferencia en CPU. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) lo ejecuta con holgura, pero no aporta ventaja significativa frente a CPU para este tamaño.
- Cabe en cualquier GPU consumer y en entornos sin GPU; el límite práctico es la RAM del sistema, no la VRAM.
- Opciones de despliegue: pipeline `text-classification` de Transformers, inferencia directa con PyTorch, exportación a ONNX no documentada por el autor. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un encoder de clasificación de este tamaño.
- Latencia y throughput medidos: 18,7 ms por párrafo con batch 1 y 20,8 ms con batch 16 en CPU de 4 hilos con ventana de 512 tokens; el throughput en batch 16 es de aproximadamente 48 párrafos por segundo en esas condiciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sidman007/wsp-climatebert-tcfd-r1-p25` | 70,5 M | 512 tokens | Clasificación TCFD (4 clases) | apache-2.0 (con caveat de uso de investigación) | HuggingFace, 0 descargas, 0 likes |
| `climatebert/distilroberta-base-climate-tcfd` | 82,3 M | 512 tokens | Clasificación TCFD (4 clases) | no disponible en la información proporcionada | HuggingFace (modelo base) |
| `climatebert/distilroberta-base-climate-detector` | no disponible | no disponible | Detección de texto climático | no disponible | HuggingFace (familia ClimateBERT) |
| `climatebert/distilroberta-base-climate-commitments` | no disponible | no disponible | Clasificación de compromisos climáticos | no disponible | HuggingFace (familia ClimateBERT) |

La comparación directa solo es posible con el modelo de partida, para el que se dispone de precisión (77,5 % frente a 77,81 %) y latencia (25,2/30,1 ms frente a 18,7/20,8 ms). Para el resto de alternativas de la familia ClimateBERT no se dispone de parámetros, contexto ni métricas en la información proporcionada.

## Limitaciones y advertencias

- Uso exclusivamente de investigación: los datos de entrenamiento del modelo base y los datos de práctica del editor (`climatebert/tcfd_recommendations`) están bajo CC BY-NC-SA 4.0, no comercial. El despliegue comercial requiere permiso de los autores del dataset o un reajuste sobre datos con licencia adecuada.
- Conjunto de test pequeño: 320 párrafos, de los cuales solo 26 son de `governance`. Un párrafo equivale a 0,31 puntos de precisión, y un solo párrafo de gobernanza mueve su recall 3,8 puntos. La lectura segura es que el modelo no es peor que el publicado, no que sea mejor.
- Un solo seed en la evaluación; no se reporta variabilidad entre ejecuciones.
- Los límites del modelo publicado se heredan: fue entrenado sobre párrafos, no sobre frases, y sus salidas de probabilidad no están calibradas según el autor.
- No está listo para producción: el autor remite a trabajo pendiente de calibración, validación con datos reales, robustez y gobernanza descrito en el README del proyecto y en `docs/executive-summary.md`.
- Riesgo de alucinación no aplicable en sentido generativo (es un clasificador), pero sí de clasificaciones erróneas en párrafos ambiguos o fuera de dominio.
- Cobertura limitada al inglés y al dominio de divulgación climática corporativa; el rendimiento fuera de ese registro no está evaluado.
- Sesgos conocidos: no documentados en la información disponible.
- Modelo con 0 descargas y 0 likes en HuggingFace; sin validación independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sidman007/wsp-climatebert-tcfd-r1-p25
- Modelo base: https://huggingface.co/climatebert/distilroberta-base-climate-tcfd
- Dataset de entrenamiento y práctica: https://huggingface.co/datasets/climatebert/tcfd_recommendations
- Repositorio fuente, logs y protocolo: https://github.com/siddharth-ghatti/weight-space-programming-poc
