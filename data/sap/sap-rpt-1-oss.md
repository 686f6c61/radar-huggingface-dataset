# SAP/sap-rpt-1-oss

## Resumen

SAP-RPT-1-OSS es un modelo fundacional desarrollado por SAP para el procesamiento de datos tabulares y relacionales. A diferencia de los modelos de lenguaje grandes, que trabajan principalmente con texto no estructurado, este modelo está diseñado específicamente para comprender y clasificar datos estructurados en formato de tablas, utilizando aprendizaje en contexto (in-context learning). Es la versión open source del modelo empresarial SAP-RPT-1, y su tecnología subyacente se describe en el paper ConTextTab (arXiv:2506.10707).

El modelo se distribuye bajo licencia Apache 2.0 y está disponible en Hugging Face con acceso restringido (gated), lo que requiere aceptar las condiciones de uso. Con un tamaño de repositorio de 0,1 GB, es un modelo ligero, pensado para tareas de clasificación tabular sin necesidad de fine-tuning, aprovechando ejemplos proporcionados en la entrada. Su relevancia actual radica en que aborda un dominio donde los LLM tradicionales tienen un rendimiento limitado: los datos relacionales y estructurados presentes en entornos empresariales.

La arquitectura se basa en un transformer relacional preentrenado, originalmente conocido como ConTextTab, que ha demostrado un rendimiento de última generación en clasificación tabular con aprendizaje en contexto. El modelo está orientado a desarrolladores e investigadores que necesitan resolver problemas de clasificación sobre tablas sin entrenar modelos específicos para cada tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer relacional (basado en ConTextTab) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (orientado a datos tabulares, no a texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

SAP-RPT-1-OSS es un transformer preentrenado específicamente para datos relacionales y tabulares. Su diseño se basa en el modelo ConTextTab, presentado en el paper arXiv:2506.10707, que introduce técnicas de aprendizaje en contexto para tablas. El modelo procesa filas y columnas como una secuencia estructurada, permitiendo que la clasificación se realice a partir de ejemplos proporcionados en la entrada, sin necesidad de reentrenar los pesos.

El entrenamiento utiliza el dataset T4-full de MLFoundations, como se indica en las etiquetas del repositorio. No se han publicado detalles sobre el número total de tokens, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO. Al ser un modelo para datos tabulares, no emplea procesamiento de lenguaje natural tradicional, sino que trabaja con características numéricas y categóricas. La innovación principal reside en su capacidad de aprendizaje en contexto, que permite adaptarse a nuevas tareas de clasificación con solo unos pocos ejemplos en la entrada.

## Capacidades

- Clasificacion de datos tabulares: el modelo puede asignar etiquetas a filas de una tabla basandose en ejemplos previos proporcionados en el contexto.
- Aprendizaje en contexto: permite resolver tareas de clasificacion sin fine-tuning, simplemente incluyendo ejemplos etiquetados en la entrada.
- Manejo de datos relacionales: esta disenado para trabajar con estructuras de datos tipicas de bases de datos relacionales, como multiples tablas con relaciones entre ellas.
- Soporte para datos heterogeneos: puede procesar columnas con tipos mixtos (numericos, categoricos, fechas, etc.) sin necesidad de preprocesamiento extenso.
- No es un modelo de lenguaje: no genera texto libre ni comprende lenguaje natural; su foco exclusivo son los datos estructurados.

## Casos de uso

- Prediccion de abandono de clientes: dado un conjunto de caracteristicas de clientes (antiguedad, frecuencia de compra, reclamaciones), el modelo puede clasificar si un cliente abandonara el servicio. Su aprendizaje en contexto permite adaptarse rapidamente a nuevos conjuntos de datos sin reentrenar.
- Deteccion de fraude en transacciones: con ejemplos de transacciones fraudulentas y legitimas, el modelo puede clasificar nuevas transacciones en tiempo real, aprovechando su capacidad de procesar multiples columnas numericas y categoricas.
- Analisis de riesgo crediticio: para evaluar solicitudes de prestamos, el modelo puede clasificar el riesgo de impago a partir de datos historicos del solicitante, utilizando ejemplos etiquetados como contexto.
- Segmentacion de clientes: el modelo puede asignar clientes a segmentos predefinidos (alto valor, medio, bajo) basandose en caracteristicas demograficas y de comportamiento, sin necesidad de entrenar un clasificador especifico.
- Mantenimiento predictivo: en entornos industriales, puede clasificar si un equipo fallara en un periodo determinado a partir de sensores y datos operativos, usando ejemplos de fallos pasados.
- Clasificacion de registros en bases de datos: para tareas de limpieza o enriquecimiento de datos, el modelo puede asignar categorias a registros incompletos o ambiguos, utilizando ejemplos de registros ya clasificados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper ConTextTab (arXiv:2506.10707) podria contener evaluaciones comparativas, pero no se han proporcionado en los materiales consultados.

## Requisitos de hardware

- El tamano del repositorio es de 0,1 GB, lo que sugiere un modelo ligero que podria ejecutarse en hardware modesto, incluso en CPU.
- No se dispone de datos oficiales sobre VRAM estimada ni GPU recomendadas.
- Dado su tamano, es probable que quepa en GPUs de consumo como una RTX 3060 o inferior, e incluso en entornos sin GPU.
- Opciones de despliegue: al ser un modelo de Hugging Face, puede cargarse con la libreria `transformers` o con herramientas como `sap-rpt-1-oss` (la libreria indicada). No se mencionan compatibilidades con vLLM, llama.cpp u Ollama, que son tipicos para modelos de lenguaje.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en los materiales consultados. Existen alternativas como TabPFN u otros modelos de aprendizaje en contexto para tablas, pero no se han proporcionado datos concretos para una comparacion rigurosa.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated en Hugging Face, por lo que requiere aceptar las condiciones de uso antes de poder descargarlo.
- No es un modelo de lenguaje: no procesa texto libre ni genera respuestas en lenguaje natural; su uso se limita a datos tabulares estructurados.
- Sesgos potenciales: al entrenarse con el dataset T4-full, podria heredar sesgos presentes en esos datos, aunque no se han documentado problemas especificos.
- Riesgo de alucinacion: en el contexto de clasificacion tabular, el modelo podria asignar etiquetas incorrectas si los ejemplos proporcionados son insuficientes o ambiguos.
- Limitaciones de contexto: al no conocerse la longitud de contexto, no se puede garantizar el manejo de tablas muy grandes o con muchas columnas.
- Licencia: aunque es Apache 2.0, el acceso gated implica que hay que registrarse y aceptar los terminos de uso en Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SAP/sap-rpt-1-oss
- Paper ConTextTab (arXiv): https://arxiv.org/abs/2506.10707
- Blog de SAP Community sobre SAP-RPT-1: https://community.sap.com/t5/technology-blog-posts-by-sap/sap-rpt-1-a-revolutionary-tabular-ml-model-and-owasp-ml-top-10-compliance/ba-p/14270750
- Blog de SAP Community sobre disponibilidad general: https://community.sap.com/t5/artificial-intelligence-blogs-posts/sap-rpt-1-enterprise-ai-for-relational-data-now-generally-available/ba-p/14287926
- Documentacion en SAP Help Portal: https://help.sap.com/docs/sap-ai-core/generative-ai/sap-rpt-1
- Repositorio GitHub: https://github.com/SAP-samples/sap-rpt-1-oss
