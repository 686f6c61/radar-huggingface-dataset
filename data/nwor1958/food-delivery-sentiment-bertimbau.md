# Nwor1958/food-delivery-sentiment-bertimbau

## Resumen

El modelo `Nwor1958/food-delivery-sentiment-bertimbau` es un clasificador binario de sentimiento en portugues de Brasil especializado en resenas de servicios de reparto de comida (delivery). Se ha obtenido mediante *fine-tuning* supervisado del modelo base BERTimbau (`neuralmind/bert-base-portuguese-cased`), un transformer encoder de tipo BERT entrenado especificamente con texto en portugues. El autor del ajuste es el usuario de Hugging Face Nwor1958, y el modelo se publico en noviembre de 2026 bajo licencia MIT.

El modelo resuelve una tarea muy concreta: etiquetar cada resena de cliente en una de dos clases, `NEGATIVO_PROBLEMA` (retrasos, temperatura inadecuada, articulos ausentes o fallos de atencion) o `POSITIVO_ELOGIO` (rapidez, calidad y temperatura correctas del pedido). Con 108,9 millones de parametros y un repositorio de 0,4 GB, esta pensado para inferencia ligera en CPU o GPU de gama baja, dentro de pipelines de analitica de opiniones o monitorizacion de calidad operativa.

Su relevancia es acotada pero practica: cubre una necesidad recurrente en plataformas de reparto (clasificar automaticamente miles de resenas para detectar incidencias operativas) en un idioma, el portugues, donde los modelos generativos grandes suelen rendir peor y son mas caros de desplegar. No es un modelo generalista ni conversacional: es un clasificador discriminativo de una sola etiqueta por texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (BERTimbau base, cased) |
| Parametros totales | 108.924.674 (segun safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base BERTimbau admite 512 tokens, pero el autor no lo declara explicitamente) |
| Tipos de cuantizacion | no disponible (el repo solo contiene pesos safetensors; no se publican variantes GGUF/ONNX) |
| Idiomas soportados | portugues (pt), en variedad PT-BR |
| Licencia | MIT |
| Formato de pesos | safetensors (compatible con transformers; ademas marcado como `text-embeddings-inference` y `endpoints_compatible`) |

## Arquitectura y entrenamiento

La arquitectura es la de BERTimbau base: un transformer encoder bidireccional con atencion completa, 12 capas, 768 dimensiones ocultas y 12 cabezas de atencion, con vocabulario en portugues y *cased* (distingue mayusculas y minusculas). Sobre ese encoder se ha anadido una cabeza de clasificacion de secuencia con dos etiquetas, entrenada mediante *fine-tuning* supervisado con pares texto-etiqueta del dominio de delivery. El modelo base BERTimbau fue preentrenado por neuralmind con grandes volumenes de texto en portugues (BRWaC), lo que le proporciona una representacion linguistica solida del idioma antes del ajuste.

La informacion disponible no detalla el numero de ejemplos de entrenamiento, la composicion del dataset, la longitud maxima de secuencia usada en el ajuste ni si se aplicaron tecnicas adicionales como *data augmentation*, *class weighting* o *early stopping*. Tampoco se documenta si hubo una fase de calibracion o validacion cruzada. No se han publicado hiperparametros, curvas de entrenamiento ni metricas de validacion en la model card.

## Capacidades

- Clasificacion binaria de sentimiento en resenas de delivery en portugues de Brasil: `NEGATIVO_PROBLEMA` frente a `POSITIVO_ELOGIO`.
- Deteccion implicita de categorias de incidencia operativa: retrasos, temperatura inadecuada, articulos faltantes y fallos de atencion (segun la definicion del autor).
- Deteccion de elogios sobre agilidad, calidad y temperatura del pedido.
- Inferencia ligera mediante `transformers.pipeline("text-classification")`.
- Compatible con despliegue en Text Embeddings Inference y con endpoints gestionados (tags `text-embeddings-inference` y `endpoints_compatible`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo *thinking*: es un clasificador discriminativo, no un modelo generativo.
- Capacidad multilingue limitada al portugues; no se declara soporte para otros idiomas.

## Casos de uso

- Monitorizacion de calidad operativa en plataformas de reparto: procesar en lote las resenas de clientes y agregar la proporcion de `NEGATIVO_PROBLEMA` por restaurante, zona o franja horaria para detectar incidencias recurrentes (retrasos, comida fria) sin revision manual.
- Enrutado automatico de tickets de soporte: las resenas clasificadas como negativas se dirigen al equipo de operaciones o al restaurante implicado, mientras que las positivas se usan para programas de fidelizacion o marketing.
- Analitica de sentimiento a escala en cuadros de mando: integracion del pipeline en un ETL que consume resenas de la app o de marketplaces y genera metricas diarias de satisfaccion por proveedor.
- Filtrado previo en pipelines de moderacion: separar rapidamente las resenas problematicas para que un humano las revise con prioridad, reduciendo el volumen de lectura manual.
- Investigacion academica sobre PLN en portugues: servir como *baseline* ajustado a dominio para experimentos de clasificacion de resenas de servicios, dado su bajo coste computacional y su licencia permisiva.
- Clasificacion en el borde (edge) o en CPU: al tener 108,9 millones de parametros y pesos safetensors de 0,4 GB, puede ejecutarse en servidores sin GPU o en contenedores pequenos para clasificar resenas en tiempo casi real.
- Etiquetado asistido para construir datasets: usar el modelo para preetiquetar grandes volumenes de resenas y que anotadores humanos corrijan solo los casos dudosos, acelerando la creacion de corpus de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud, F1, precision, recall ni matrices de confusion, ni comparaciones con otros clasificadores.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 0,45 GB solo para pesos, mas activaciones y memoria del runtime; en la practica cabe holgadamente en cualquier GPU con 2 GB o mas.
- VRAM estimada en fp16/bf16: alrededor de 0,22 GB para pesos, mas overhead; viable en GPUs de gama baja y en GPUs integradas con suficiente memoria compartida.
- GPU recomendadas: no requiere GPU dedicada; funciona bien en CPU. Si se busca throughput alto en lote, una T4, L4, RTX 3060 o superior es mas que suficiente; A100/H100 solo tendrian sentido para servir muchos modelos en paralelo, no por este modelo en si.
- Cabe en cualquier GPU de consumo actual (RTX 20xx, 30xx, 40xx) e incluso en CPUs modernas con 2-4 GB de RAM libre.
- Opciones de despliegue: `transformers` (pipeline de clasificacion), Text Embeddings Inference (tag declarado), endpoints gestionados de Hugging Face (tag `endpoints_compatible`). No se publican artefactos GGUF ni ONNX, por lo que llama.cpp u Ollama no son opciones directas sin conversion previa.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera latencia de milisegundos por muestra en CPU y throughput alto en batching sobre GPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nwor1958/food-delivery-sentiment-bertimbau | 108,9 M | no disponible | Clasificacion binaria de sentimiento en resenas de delivery (PT-BR) | MIT | Hugging Face, 0 descargas, 1 like |
| neuralmind/bert-base-portuguese-cased (BERTimbau base) | ~110 M | 512 tokens (segun el modelo base, no confirmado en esta ficha) | Modelo base de lenguaje en portugues, sin cabeza de clasificacion | no disponible en la informacion proporcionada | Hugging Face, ampliamente utilizado |
| Modelos generativos multilingues de gran tamano (p. ej. familia Llama, Qwen) | miles de millones | decenas de miles de tokens | Generacion y clasificacion zero-shot mediante prompting | varian por modelo | Hugging Face y otros |

La comparacion cuantitativa de rendimiento no esta disponible: no hay benchmarks publicados para este ajuste ni resultados comparables declarados por el autor. Frente al modelo base, la diferencia es la cabeza de clasificacion y el ajuste al dominio; frente a modelos generativos grandes, la ventaja es coste, latencia y especializacion, y la desventaja es la falta de generalidad y de capacidades conversacionales.

## Limitaciones y advertencias

- El modelo solo distingue dos clases; no captura sentimiento neutro, ironia, sarcasmo ni matices graduados (por ejemplo, resenas mixtas con elogio y queja).
- Riesgo de alucinacion no aplica en el sentido generativo, pero si de falsos positivos y falsos negativos: sin metricas publicadas no se puede estimar su fiabilidad real en produccion.
- Sesgos potenciales derivados del dataset de ajuste, que no se documenta: posible sobreajuste a expresiones tipicas de una plataforma o region concreta y peor rendimiento en otras variedades del portugues.
- Limitacion de idioma: solo portugues (PT-BR); no se declara soporte para portugues europeo ni para otros idiomas.
- Longitud de contexto no declarada por el autor; en la practica hereda el limite del modelo base, pero conviene truncar resenas largas y validar el comportamiento.
- Sin datos de entrenamiento, validacion ni calibracion publicados: no se recomienda su uso en decisiones automatizadas de alto impacto sin una evaluacion propia sobre datos del dominio.
- La licencia MIT permite uso comercial, pero el modelo base BERTimbau tiene su propia licencia que conviene verificar antes de redistribuir o desplegar en produccion.
- Repositorio con 0 descargas y 1 like: no hay evidencia de uso en produccion ni de validacion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nwor1958/food-delivery-sentiment-bertimbau
- Modelo base BERTimbau: https://huggingface.co/neuralmind/bert-base-portuguese-cased
