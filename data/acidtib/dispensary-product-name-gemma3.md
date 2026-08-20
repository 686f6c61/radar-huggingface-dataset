# acidtib/dispensary-product-name-gemma3

## Resumen

El modelo `acidtib/dispensary-product-name-gemma3` es un ajuste fino (fine-tune) de `google/gemma-3-270m-it`, el modelo instructivo de 270 millones de parametros de la familia Gemma 3 de Google. El autor, acidtib, lo ha entrenado para resolver un problema muy concreto: transformar nombres de productos brutos procedentes de sistemas de punto de venta (POS) de dispensarios de cannabis en nombres canonicos limpios con el formato `"Strain - Type"` (por ejemplo, `"Super Skunk - Live Resin"`).

El modelo esta especializado en el dominio de dispensarios y farmacias de cannabis en Estados Unidos, y se ha entrenado sobre un dataset propio de 1697 ejemplos que cubre 152 marcas y 3 categorias de producto. Su relevancia radica en que aborda una tarea de normalizacion de datos muy especifica y repetitiva en el sector retail de cannabis, donde los listados de productos suelen ser inconsistentes y dificiles de procesar automaticamente.

Con 268 millones de parametros y un tamano de repositorio de 0.6 GB, es un modelo ligero que puede ejecutarse en hardware modesto, lo que lo hace adecuado para integraciones en pipelines de datos o sistemas de gestion de inventario sin necesidad de infraestructura de alto rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3 270M instructivo) |
| Parametros totales | 268.098.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Gemma 3 270M, se recomienda consultar la ficha del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-3-270m-it`, un transformer decoder-only de 270 millones de parametros con atencion por ventanas deslizantes y atencion global alternada, disenado por Google para tareas de generacion de texto e instrucciones. Sobre esta base, acidtib ha realizado un ajuste fino supervisado (SFT) utilizando el dataset `acidtib/dispensary-product-name-extraction`, que contiene 1697 ejemplos distribuidos en 152 marcas y 3 categorias de producto.

No se dispone de informacion sobre los hiperparametros de entrenamiento, ya que el autor no incluyo un archivo `training_info.json` en el checkpoint. Tampoco se especifica si se utilizaron tecnicas como RLHF o DPO. El dataset de entrenamiento es pequeno y muy especializado, lo que sugiere que el modelo esta fuertemente sobreajustado a la tarea de normalizacion de nombres de productos de dispensarios, y no debe esperarse que generalice bien fuera de ese dominio.

## Capacidades

- Normalizacion de nombres de productos: transforma nombres brutos de listados POS en nombres canonicos con formato `"Strain - Type"`.
- Extraccion de informacion estructurada: dado un prompt con campos como `brand`, `category`, `subcategory` y `rawName`, el modelo extrae la cepa (strain) y el tipo de producto.
- Generacion de texto conversacional: al estar basado en Gemma 3 instructivo, conserva la capacidad de mantener conversaciones multi-turno, aunque su especializacion limita su utilidad general.
- Soporte de tool calling: no disponible (no se menciona en la informacion proporcionada).
- Capacidades multilingues: no, solo ingles.
- Capacidades especiales: ninguna adicional documentada (sin vision, audio ni modo de razonamiento explicito).

## Casos de uso

- Limpieza de catalogos de productos: el modelo puede procesar listados completos de productos de un dispensario y generar nombres canonicos uniformes, facilitando la consolidacion de inventarios de multiples sucursales.
- Integracion en pipelines de datos ETL: al ser un modelo ligero (0.6 GB), puede ejecutarse como paso de transformacion en pipelines de datos que normalicen la informacion de productos antes de cargarla en un data warehouse.
- Sincronizacion de inventario entre sistemas: cuando un dispensario utiliza multiples sistemas POS o marketplaces, el modelo puede unificar los nombres de productos para que coincidan entre plataformas.
- Generacion de informes de ventas por producto: al normalizar los nombres, se pueden agrupar ventas de productos equivalentes que aparecen con nombres distintos en el POS, mejorando la precision de los informes.
- Automatizacion de catalogos para e-commerce: el modelo puede preparar los nombres de productos para su publicacion en tiendas online, asegurando un formato consistente y profesional.
- Deteccion de duplicados en bases de datos: al generar nombres canonicos, se facilita la identificacion de productos duplicados que aparecen con variaciones de nombre en el sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de evaluacion como exactitud, F1 o comparaciones con otros modelos en la tarea de normalizacion de nombres de productos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente, pero con 268 millones de parametros y 0.6 GB de pesos en fp32, se estima que necesita aproximadamente 1-2 GB de VRAM en fp16, y menos de 1 GB en cuantizacion de 4 bits.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1650, RTX 2060 o superiores pueden ejecutarlo sin problemas. Tambien es viable en CPU para inferencia por lotes.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU consumer moderna.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, Text Generation Inference (TGI), o ejecutarse directamente con la libreria transformers. Tambien puede convertirse a GGUF para usarse con llama.cpp u Ollama, aunque no se proporcionan conversiones oficiales.
- Latencia y throughput: no disponible, pero por el tamano del modelo se espera una latencia de decenas de milisegundos por generacion en GPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| acidtib/dispensary-product-name-gemma3 | 268 M | no disponible | Normalizacion de nombres de productos de dispensarios | no disponible |
| google/gemma-3-270m-it | 270 M | 32k (segun ficha oficial de Gemma 3) | Instrucciones generales, conversacion | Gemma Terms of Use |
| Un modelo BERT pequeno (ej. bert-base-uncased) | 110 M | 512 | Clasificacion y NER general | Apache 2.0 |

La comparativa directa con otros modelos especializados en normalizacion de nombres de productos de dispensarios no esta disponible, ya que es un nicho muy especifico. Frente al modelo base Gemma 3 270M, este ajuste fino ofrece una precision mucho mayor en la tarea concreta, a costa de perder generalidad.

## Limitaciones y advertencias

- Dominio muy restringido: el modelo solo es util para normalizar nombres de productos de dispensarios de cannabis. Fuera de ese dominio, su rendimiento sera pobre.
- Dataset de entrenamiento pequeno: con solo 1697 ejemplos, el modelo puede tener problemas de generalizacion incluso dentro del dominio, especialmente con marcas o categorias no representadas en el entrenamiento.
- Sesgo geografico y cultural: el dataset proviene de dispensarios de Estados Unidos, por lo que los nombres y formatos pueden no ser representativos de otros paises o sistemas.
- Licencia no especificada: no se indica la licencia del modelo, lo que genera incertidumbre sobre su uso comercial. Se recomienda contactar al autor antes de usarlo en produccion.
- Riesgo de alucinacion: al ser un modelo generativo, puede inventar nombres de cepas o tipos si el prompt es ambiguo o contiene informacion contradictoria.
- Sin soporte multilingue: solo funciona con texto en ingles, y especificamente con el vocabulario del sector de cannabis en Estados Unidos.
- Sin informacion sobre sesgos: no se han documentado evaluaciones de sesgo, por lo que podria reflejar sesgos presentes en el dataset de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/acidtib/dispensary-product-name-gemma3
- Dataset de entrenamiento: https://huggingface.co/datasets/acidtib/dispensary-product-name-extraction
- Modelo base (Gemma 3 270M instructivo): https://huggingface.co/google/gemma-3-270m-it
