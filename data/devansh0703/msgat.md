# devansh0703/MSGAT

## Resumen

MSGAT (Multi-Scale Graph Attention Network) es un modelo de red neuronal de grafos ligero, con 242.407 parámetros, diseñado para predecir 10 propiedades químico-cuánticas a partir de cadenas SMILES de moléculas. Lo desarrolla Devansh Raulo (devansh0703) y se publica bajo licencia MIT, con el objetivo de ofrecer una alternativa eficiente y de bajo coste computacional para tareas de quimioinformática y descubrimiento de fármacos.

El modelo combina atención multi-cabezal sensible a los enlaces químicos (edge-aware), redes neuronales de mensajes (MPNN) y fusión entre escalas, lo que le permite capturar tanto información local de átomos y enlaces como propiedades globales de la molécula. Se entrenó sobre el dataset QuantumChem_200k, que contiene 200.000 moléculas, y alcanza un R² medio de 0,946 en 9 de las 10 propiedades objetivo, excluyendo la solubilidad.

Su relevancia radica en que demuestra que es posible lograr predicciones precisas de propiedades moleculares con un modelo de menos de 250K parámetros, lo que lo hace desplegable en entornos con recursos limitados, incluyendo CPU. A diferencia de los grandes modelos de lenguaje, no requiere GPU de alta gama ni infraestructura compleja, lo que lo convierte en una opción práctica para laboratorios académicos y pequeñas empresas de biotecnología.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de grafos con atención multi-cabezal edge-aware + MPNN + fusión multi-escala |
| Parametros totales | 242.407 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (procesa grafos moleculares, no texto) |
| Tipos de cuantizacion | No disponible (pesos en FP32) |
| Idiomas soportados | No aplica (entrada: SMILES, salida: valores numéricos) |
| Licencia | MIT |
| Formato de pesos | PyTorch state dict (.pt) |

## Arquitectura y entrenamiento

MSGAT es una red neuronal de grafos que procesa moléculas representadas como grafos, donde los nodos son átomos y las aristas son enlaces químicos. La arquitectura combina tres elementos principales: atención multi-cabezal sensible a los enlaces (edge-aware multi-head attention), una red de paso de mensajes (MPNN) para propagar información entre nodos, y un mecanismo de fusión entre escalas que combina representaciones locales y globales. Las características de nodo son de 58 dimensiones (número atómico, grado, carga, hidrógenos, hibridación, aromaticidad) y las de enlace de 12 dimensiones (tipo de enlace, conjugación, anillo, estereoquímica). La dimensión oculta es 64, con 4 cabezas de atención y 3 capas.

El entrenamiento se realizó sobre el dataset QuantumChem_200k, que contiene 200.000 moléculas con propiedades cuánticas calculadas. El proceso incluye una fase de entrenamiento con división train/val y un reentrenamiento posterior con todos los datos. Las salidas se normalizan con z-score; la solubilidad usa log1p antes de la normalización y se invierte con expm1. No se aplicaron técnicas de RLHF ni DPO, ya que no es un modelo generativo sino predictivo.

## Capacidades

- Predicción de 10 propiedades químico-cuánticas: sección eficaz de absorción (sigma) a 780 nm, sigma máximo, energía ISC, toxicidad, puntuación SA, punto de ebullición, logP, aromaticidad, solubilidad y peso molecular.
- Procesamiento de moléculas a partir de cadenas SMILES, convirtiéndolas internamente a grafos moleculares con características atómicas y de enlace.
- Salida multi-tarea: un solo forward produce las 10 propiedades simultáneamente.
- Ligereza computacional: 242K parámetros permiten inferencia en CPU con latencia de milisegundos.
- Normalización inversa integrada: el modelo devuelve valores z-score que pueden transformarse a unidades físicas reales.
- Manejo de la solubilidad con transformación log1p/expm1 para estabilizar la predicción de valores que varían en órdenes de magnitud.

## Casos de uso

- Cribado virtual de fármacos: el modelo puede filtrar bibliotecas de millones de compuestos, prediciendo toxicidad y logP para descartar candidatos no viables antes de la síntesis. Su velocidad en CPU permite procesar grandes volúmenes sin infraestructura GPU.
- Estimación de propiedades ADMET: la predicción de solubilidad, logP y toxicidad proporciona una primera evaluación de la farmacocinética de un compuesto en fases tempranas del descubrimiento.
- Optimización de moléculas líder: los químicos computacionales pueden iterar sobre variantes de un compuesto base, comparando predicciones de punto de ebullición o energía ISC para guiar la síntesis hacia análogos con mejores propiedades.
- Validación cruzada de cálculos DFT: al predecir propiedades como sigma o energía ISC en milisegundos, MSGAT puede complementar o sustituir cálculos de química cuántica costosos en estudios de alto rendimiento.
- Educación e investigación en quimioinformática: su código abierto y su tamaño reducido lo convierten en una herramienta didáctica para enseñar redes neuronales de grafos aplicadas a química.
- Integración en pipelines de química combinatoria: el modelo puede conectarse a flujos automatizados que generan SMILES, predecen propiedades y seleccionan compuestos para síntesis experimental, reduciendo el coste de exploración del espacio químico.

## Benchmarks y rendimiento

El modelo reporta las siguientes métricas en el conjunto de validación, según la model card:

| Propiedad | Unidad | MAE | R² |
|---|---|---|---|
| Sigma a 780 nm | GM | 10,10 | 0,953 |
| Sigma máximo | GM | 10,19 | 0,957 |
| Energía ISC | eV | 0,0055 | 0,933 |
| Puntuación de toxicidad | — | 0,017 | 0,924 |
| Puntuación SA | — | 0,0069 | 0,967 |
| Punto de ebullición | °C | 5,77 | 0,984 |
| logP | — | 0,057 | 0,993 |
| Aromaticidad | — | 0,0077 | 0,998 |
| Solubilidad | ug/ml | 71.953 | 0,053 |
| Peso molecular | g/mol | 1,61 | 0,806 |

El R² medio excluyendo solubilidad es de 0,946. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB. El modelo tiene 242K parámetros, lo que ocupa aproximadamente 1 MB en FP32.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (GTX 1050, RTX 3050, etc.). No se requiere GPU de alta gama.
- CPU: suficiente para inferencia. Un solo forward tarda del orden de milisegundos en un procesador moderno.
- Opciones de despliegue: al ser un modelo PyTorch estándar, puede servirse con TorchServe, FastAPI o integrarse en scripts Python. No hay soporte nativo para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia estimada: del orden de 1-10 ms por molécula en CPU, dependiendo del hardware.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No obstante, en la categoría de predicción de propiedades moleculares con GNNs existen alternativas conocidas como Chemprop (MPNN) o D-MPNN, aunque no se han encontrado datos de comparación directa con MSGAT en las fuentes disponibles.

## Limitaciones y advertencias

- La predicción de solubilidad tiene un R² de 0,053, lo que indica que el modelo no es fiable para esta propiedad. Debe evitarse su uso en decisiones que dependan de la solubilidad.
- El peso molecular muestra un R² de 0,806, inferior al resto de propiedades. Aunque el MAE es bajo (1,61 g/mol), la varianza explicada es limitada.
- El modelo se entrenó exclusivamente con el dataset QuantumChem_200k, que puede no representar la diversidad química completa. Moléculas con estructuras poco comunes o elementos no presentes en el entrenamiento pueden producir predicciones erróneas.
- No hay información sobre el rendimiento en moléculas grandes (más de 200 átomos) o con química inusual, ya que el dataset de entrenamiento no se ha caracterizado en detalle en la documentación.
- La licencia MIT permite uso comercial sin restricciones, pero el autor no ofrece garantías sobre la precisión en aplicaciones de producción.
- El modelo no es generativo: no puede crear moléculas nuevas, solo predecir propiedades de moléculas existentes.
- No se han publicado análisis de sesgos o estudios de robustez frente a ataques adversariales en SMILES.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/devansh0703/MSGAT
- Repositorio GitHub: https://github.com/devansh0703/MSGAT
- Dataset QuantumChem_200k: https://huggingface.co/datasets/QuantumChem/QuantumChem_200k
- Perfil del autor en HuggingFace: https://huggingface.co/devansh0703
- Perfil del autor en GitHub: https://github.com/devansh0703
