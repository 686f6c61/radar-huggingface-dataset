# DanKau/en_core_web_trf-3.8.0-onnx

## Resumen

El modelo `DanKau/en_core_web_trf-3.8.0-onnx` es una exportación a ONNX de los componentes de transformer y NER del pipeline `en_core_web_trf` 3.8.0 de spaCy, desarrollado originalmente por Explosion y entrenado sobre el corpus OntoNotes 5. El autor, DanKau, publicó esta versión como parte de la infraestructura de SecuPi para su servicio de IA desestructurada (SPAI), con el objetivo de ejecutar el reconocimiento de entidades nombradas (NER) en inglés a través de ONNX Runtime desde Java, sin necesidad de cargar spaCy ni PyTorch en tiempo de inferencia.

El modelo no es un modelo de lenguaje generativo, sino un pipeline de NER basado en un parser transicional. La arquitectura subyacente es un `roberta-base` (usado como encoder) que produce vectores de 768 dimensiones, seguido de una proyección a 64 dimensiones y una cabeza de NER con 74 acciones posibles. El tamaño del repositorio es de 0.5 GB y la licencia es MIT. La ventana de procesamiento es de 144 piezas (window) con un stride de 104, lo que permite manejar documentos largos mediante solapamiento y promedio de las salidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (roberta-base) + cabeza NER transicional, exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventana de 144 piezas con stride 104 (no es un contexto de LLM) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | ONNX (encoder.onnx, precompute.onnx, transition.onnx) |

## Arquitectura y entrenamiento

El modelo exporta exclusivamente los componentes con pesos del pipeline `en_core_web_trf`: el encoder `roberta-base` (según el checkpoint, implementado con curated-transformers), que convierte piezas sub-palabra en vectores de 768 dimensiones; una proyección aprendida de 768 a 64 (la capa `linear` final de `tok2vec`); y la cabeza NER, que aplica una transformación afín `lower` precalculada sobre tres características de estado, suma, añade el sesgo, aplica maxout sobre dos piezas y enmascara las acciones nunca vistas en entrenamiento, emitiendo 74 puntuaciones de acción.

El entrenamiento es el del modelo base, sobre OntoNotes 5, con 18 tipos de entidades: `PERSON`, `ORG`, `GPE`, `LOC`, `FAC`, `NORP`, `PRODUCT`, `EVENT`, `WORK_OF_ART`, `LAW`, `LANGUAGE`, `DATE`, `TIME`, `PERCENT`, `MONEY`, `QUANTITY`, `ORDINAL` y `CARDINAL`. No se ha realizado ningún reentrenamiento, destilación ni sustitución de pesos; la exportación se hizo con spaCy 3.8.7 y se verificó cada grafo contra su módulo PyTorch correspondiente en el momento de la exportación, además de reproducir 13 textos de extremo a extremo, incluido un documento de 315 tokens.

La innovación técnica principal es la división del pipeline en tres grafos ONNX para resolver la naturaleza dependiente de datos del parser transicional de spaCy. El bucle de decisiones queda en el host, mientras que todos los pesos se encapsulan en los grafos. El grafo `encoder.onnx` se ejecuta por ventanas de 144 piezas con solapamiento de 104 y se hace media de las zonas solapadas; `precompute.onnx` se ejecuta una vez por documento para calcular una caché de características; y `transition.onnx` se ejecuta una vez por palabra para decidir la siguiente acción de la máquina de estados BILUO.

## Capacidades

- Reconocimiento de entidades nombradas (NER) en inglés con 18 tipos de entidades, incluyendo personas, organizaciones, lugares, fechas, cantidades y porcentajes.
- Generación de texto: no aplica, el modelo no es generativo.
- Razonamiento: no aplica, el modelo no realiza razonamiento general.
- Código y matemáticas: no aplica.
- Visión: no aplica.
- Tool calling / function calling: no aplica, el modelo no es un LLM.
- Agentes y razonamiento multi-paso: no aplica, aunque internamente utiliza una máquina de estados para la decodificación de entidades, no es una capacidad de agente.
- Capacidades multilingües: solo inglés.
- Capacidades especiales: no incluye modo thinking, visión ni audio.
- Compatibilidad con ONNX Runtime: permite inferencia sin dependencias de spaCy o PyTorch, y puede integrarse en aplicaciones Java, C++ u otros lenguajes.

## Casos de uso

- Extracción de entidades en documentos legales: el modelo identifica `PERSON`, `ORG`, `GPE`, `LAW` y `DATE`, lo que permite automatizar la indexación de contratos, sentencias o expedientes. Su ejecución en ONNX facilita su integración en sistemas Java de gestión documental.
- Análisis de noticias y artículos de prensa: permite extraer personas, organizaciones, lugares y fechas de grandes volúmenes de texto para generar metadatos o alimentar sistemas de recomendación. El solapamiento de ventanas permite procesar artículos largos sin perder entidades.
- Procesamiento de redes sociales: al ser un modelo ligero (0.5 GB) y ejecutable en CPU, puede desplegarse en servicios de análisis de tweets o publicaciones para detectar menciones de marcas, productos o eventos.
- Integración en pipelines de datos sin Python: gracias al formato ONNX, el modelo puede ejecutarse desde Java, C# o C++ mediante ONNX Runtime, lo que lo hace adecuado para entornos de producción que no quieren mantener un runtime de Python.
- Enriquecimiento de bases de conocimiento: el modelo puede usarse para extraer entidades de documentos históricos y vincularlas a registros existentes, mejorando la calidad de los datos en sistemas de gestión del conocimiento.
- Monitoreo de marca y reputación: identifica `ORG`, `PRODUCT` y `EVENT` en textos de opinión, noticias o foros, permitiendo detectar menciones relevantes y clasificarlas automáticamente.
- Análisis de contratos y facturas: extrae `MONEY`, `DATE`, `PERCENT` y `QUANTITY` de documentos comerciales, facilitando la validación automática de importes y plazos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model card indica explícitamente que no hay puntuaciones, y que las activaciones de la cabeza NER no son probabilidades ni son comparables entre estados o documentos. Por tanto, no se puede presentar una tabla de resultados comparativos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0.5 GB, pero no se especifica el consumo de VRAM.
- GPU recomendadas: no disponible. Al ser un modelo basado en `roberta-base`, es probable que funcione en GPUs de gama media, pero no hay datos oficiales.
- ¿Cabe en GPU de consumo? Es probable que sí, dado el tamaño del modelo y que la inferencia se realiza por ventanas, pero no hay confirmación en la documentación.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), mediante los archivos `encoder.onnx`, `precompute.onnx` y `transition.onnx`. No requiere spaCy ni PyTorch en el entorno de ejecución.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Formato | Componentes | Licencia | Idioma | Tamaño |
|---|---|---|---|---|---|
| DanKau/en_core_web_trf-3.8.0-onnx | ONNX | Solo NER (encoder + cabeza) | MIT | en | 0.5 GB |
| spacy/en_core_web_trf | PyTorch | Pipeline completo (tagger, parser, NER, lemmatizer) | MIT | en | no disponible |
| spacy/en_core_web_sm | PyTorch | Pipeline completo (no transformer) | MIT | en | no disponible |

La diferencia principal con el modelo base es que esta exportación omite el `tagger`, `parser`, `attribute_ruler` y `lemmatizer`, por lo que su salida no es comparable con el pipeline completo. Frente a `en_core_web_sm`, este modelo utiliza un transformer y es potencialmente más preciso en NER, aunque no se dispone de benchmarks para confirmarlo.

## Limitaciones y advertencias

- No incluye el `tagger`, `parser`, `attribute_ruler` ni `lemmatizer` del pipeline original, por lo que la salida es únicamente de entidades y no es comparable con el pipeline completo.
- No produce puntuaciones de confianza para las entidades. Las activaciones de la cabeza NER no son probabilidades y no deben usarse como umbrales para filtrar predicciones.
- El tokenizador debe ser el de spaCy, definido en `spacy_tokenizer.json`. Si se usa un tokenizador distinto, los offsets de las entidades se desplazan y los resultados son incorrectos.
- Requiere implementar la máquina de estados BILUO en el host. El modelo no incluye la lógica de decodificación, por lo que el usuario debe escribir el bucle de transiciones.
- Solo soporta inglés.
- El modelo puede heredar sesgos del corpus OntoNotes 5, que está sesgado hacia textos periodísticos y de dominio general en inglés.
- La licencia MIT permite uso comercial, pero el modelo base es de Explosion; se recomienda revisar los términos de la licencia del pipeline original si se redistribuye.
- Riesgo de falsos positivos en NER, especialmente en textos con jerga técnica o nombres ambiguos.

## Enlaces

- HuggingFace: https://huggingface.co/DanKau/en_core_web_trf-3.8.0-onnx
- Modelo base en HuggingFace: https://huggingface.co/spacy/en_core_web_trf
- Documentación de spaCy: https://spacy.io
- SecuPi (empresa que originó la exportación): https://www.secupi.com
- Repositorio de modelos de spaCy en GitHub: https://github.com/explosion/spacy-models
