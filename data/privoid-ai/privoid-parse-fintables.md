# Privoid-ai/Privoid-Parse-FinTables

## Resumen

Privoid Parse FinTables es un adaptador LoRA sobre NVIDIA Nemotron 3.5 Parse, desarrollado por Privoid-ai, orientado a la extraccion de tablas financieras a partir de imagenes de documentos y su conversion a LaTeX estructurado. El modelo resuelve un problema concreto del sector financiero: la digitalizacion fiable de tablas en informes anuales, estados contables y documentos fiscales, manteniendo el formato de salida nativo del modelo base para no romper herramientas existentes.

Se trata de un adaptador PEFT (parametros entrenados sobre el modelo base congelado) publicado como pesos safetensors y con pipeline `image-text-to-text`. El entrenamiento se realizo sobre el dataset `docling-project/FinTabNet_OTSL`, especializado en tablas financieras en formato OTSL. El modelo base, Nemotron 3.5 Parse, es un modelo multimodal de NVIDIA para parsing de documentos; el adaptador anade especializacion en dominios financieros sin necesidad de reentrenar el modelo completo.

La relevancia actual del modelo reside en su enfoque de despliegue local y privado para document AI: al ser un adaptador pequeno sobre un modelo abierto, permite procesar documentos financieros sensibles sin enviar imagenes a servicios externos. La model card lo describe como un lanzamiento experimental, con mejoras medibles en precision pero con un coste en latencia y un nuevo modo de fallo documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un modelo multimodal imagen-texto (Nemotron 3.5 Parse); arquitectura interna del base no detallada en la informacion disponible |
| Parametros totales | No disponible (el repositorio ocupa 0.0 GB; solo se publican los pesos del adaptador) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | OpenMDW-1.1 (etiquetada como `other` en HuggingFace) |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que se aplica sobre NVIDIA Nemotron 3.5 Parse, un modelo de parsing de documentos que recibe imagenes y emite texto estructurado. El adaptador no modifica la arquitectura del base: se entrena un conjunto reducido de matrices de bajo rango que ajustan el comportamiento del modelo hacia tablas financieras, manteniendo intacto el formato de salida nativo (etiquetas LaTeX con anotaciones de posicion y clase, como se observa en los ejemplos de la model card).

El entrenamiento se realizo sobre el dataset `docling-project/FinTabNet_OTSL`, una version en formato OTSL del corpus FinTabNet de tablas financieras. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La evaluacion se realizo sobre 1.600 imagenes de test de 800 tablas de 45 empresas no usadas en entrenamiento ni en seleccion de modelo, con intervalos de confianza al 95% calculados mediante remuestreo por empresa para tener en cuenta la correlacion entre tablas de una misma compania.

## Capacidades

- Reconocimiento de estructura de tablas: identifica filas, columnas, celdas combinadas y encabezados, y las emite como `\begin{tabular}` con `\thead` y filas separadas por `\\`.
- Conversion de imagenes de tablas financieras a LaTeX estructurado, preservando el contenido textual y numerico de cada celda.
- Manejo de imagenes limpias y de imagenes con dano simulado de escaneo (ruido, artefactos), con mejora medida en ambos grupos.
- Procesamiento de tablas con celdas combinadas (758 imagenes en el conjunto de test).
- Lectura de tablas de pequeno y mediano tamano con mejora consistente; el rendimiento en tablas grandes no esta demostrado.
- Salida en el formato nativo de Nemotron Parse, lo que permite reutilizar herramientas y parsers existentes del ecosistema NVIDIA.
- Capacidad multilingue limitada al ingles segun la model card.
- No se documenta soporte de tool calling, function calling, agentes ni modo thinking en la informacion disponible.

## Casos de uso

- Digitalizacion de informes anuales: el modelo convierte las tablas de estados financieros, balances y cuentas de resultados en LaTeX estructurado, lo que facilita su ingestion en pipelines de analisis financiero y su conversion posterior a CSV o bases de datos.
- Extraccion de tablas fiscales con documentos escaneados: la mejora medida en imagenes con dano de escaneo (+0.066 de Cell F1 en 800 imagenes) lo hace adecuado para digitalizar declaraciones y formularios fiscales de baja calidad.
- Procesamiento local de documentos confidenciales: al ser un adaptador sobre un modelo abierto desplegable en infraestructura propia, permite tratar tablas financieras sensibles sin enviar imagenes a APIs externas.
- Automatizacion de ingestion en pipelines de research financiero: la salida en LaTeX con estructura de filas y columnas permite parsear tablas de informes de empresas cotizadas y alimentar bases de datos de comparables.
- Conversion de tablas de documentos regulatorios: util para entidades que necesitan extraer tablas de memorias anuales y presentaciones a reguladores manteniendo la estructura de celdas combinadas.
- Enriquecimiento de repositorios documentales: integracion en sistemas de gestion documental que necesitan indexar tablas financieras con su estructura para busqueda y recuperacion.
- Preprocesado para modelos de razonamiento financiero: la salida estructurada sirve como entrada limpia a modelos de analisis que trabajan sobre datos tabulares en lugar de imagenes.

## Benchmarks y rendimiento

Resultados medidos sobre 1.600 imagenes de test de 800 tablas de 45 empresas no usadas en entrenamiento ni seleccion. Cell F1 es una medida propia del proyecto (no TEDS ni GriTS) y no es directamente comparable con puntuaciones publicadas.

| Medida | Modelo base sin adaptador | Privoid Parse | Cambio | Rango 95% |
|---|---:|---:|---:|---:|
| Cell F1 | 0.701 | 0.762 | +0.061 | +0.053 a +0.070 |
| Number F1 | 0.782 | 0.819 | +0.037 | +0.026 a +0.050 |
| Conteo exacto de filas y columnas | 0.612 | 0.682 | +0.071 | +0.042 a +0.101 |
| Salida de tabla valida | 0.955 | 0.976 | +0.021 | +0.001 a +0.038 |
| Tasa de error de caracteres (menor es mejor) | 0.147 | 0.108 | -0.040 | -0.054 a -0.026 |
| Tasa de error de palabras (menor es mejor) | 0.363 | 0.205 | -0.157 | -0.181 a -0.135 |
| Alcanzo el limite de tokens (menor es mejor) | 0.003 | 0.022 | +0.019 | +0.007 a +0.031 |

Desglose por grupo:

| Grupo | Imagenes | Base | Privoid Parse | Cambio | Rango 95% |
|---|---:|---:|---:|---:|---:|
| Todas las imagenes de test | 1.600 | 0.701 | 0.762 | +0.061 | +0.053 a +0.070 |
| Imagenes limpias | 800 | 0.770 | 0.827 | +0.057 | +0.047 a +0.068 |
| Dano de escaneo simulado | 800 | 0.633 | 0.698 | +0.066 | +0.055 a +0.076 |
| Tablas pequenas | 1.036 | 0.682 | 0.756 | +0.073 | +0.063 a +0.084 |
| Tablas medianas | 518 | 0.736 | 0.781 | +0.046 | +0.033 a +0.060 |
| Tablas grandes | 46 | 0.738 | 0.703 | -0.035 | -0.133 a +0.022 |
| Tablas con celdas combinadas | 758 | 0.736 | 0.775 | +0.039 | +0.024 a +0.053 |

Rendimiento y memoria:

| Metrica | Base | Privoid Parse |
|---|---:|---:|
| Tiempo mediano por tabla (una a una) | 2.8 s | 6.1 s |

Medido sobre una muestra de 20 tablas con una NVIDIA L4, a traves de Transformers con el adaptador aplicado. La memoria GPU pico asignada fue de aproximadamente 2 GB en ambas evaluaciones, aunque el monitor de Colab mostro hasta 18.7 GB en uso durante la evaluacion por lotes.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB de memoria GPU pico asignada en evaluacion individual; en procesamiento por lotes el uso observado alcanzo 18.7 GB, por lo que conviene planificar con margen.
- GPU recomendadas: NVIDIA L4 para inferencia individual (medicion de referencia del autor); para lotes grandes se recomienda una GPU con al menos 24 GB de VRAM.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM para inferencia individual; para lotes se necesita una GPU de gama alta (RTX 4090, A100, H100).
- Opciones de despliegue: Transformers con PEFT (metodo usado en la evaluacion); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: 6.1 s medianos por tabla en una L4 con el adaptador aplicado, frente a 2.8 s del modelo base; aproximadamente el doble de lento en la muestra de 20 tablas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Privoid Parse FinTables | No disponible (adaptador LoRA) | No disponible | Parsing de tablas financieras a LaTeX | OpenMDW-1.1 | HuggingFace |
| NVIDIA Nemotron 3.5 Parse (base) | No disponible | No disponible | Parsing general de documentos | No disponible en la informacion | HuggingFace |
| Otros parsers de tablas financieras | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks publicados de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Lanzamiento experimental: el autor lo describe como mas preciso en promedio pero mas lento y con un modo de fallo nuevo no especificado en detalle en la informacion disponible.
- Tablas grandes: en 46 imagenes de tablas grandes el cambio en Cell F1 fue de -0.035 (rango -0.133 a +0.022), por lo que no esta demostrado que el adaptador ayude en ese caso.
- Incremento del limite de tokens alcanzado: la tasa de salidas que alcanzan el limite de tokens sube de 0.003 a 0.022, lo que puede truncar tablas largas.
- Latencia: aproximadamente el doble de lento que el modelo base (6.1 s frente a 2.8 s por tabla en una L4).
- Idioma: solo ingles segun la model card, lo que limita su uso con documentacion financiera en castellano u otros idiomas.
- Metrica propia: Cell F1 es una medida personalizada del proyecto y no es comparable con TEDS o GriTS publicados, lo que dificulta la comparacion con otros sistemas.
- Licencia OpenMDW-1.1: es necesario revisar los terminos completos antes de uso comercial; la model card la etiqueta como `other`.
- Riesgo de alucinacion: no se documenta una evaluacion especifica de fidelidad numerica mas alla de Number F1 (0.819), por lo que persiste riesgo de errores en cifras.
- Dependencia del modelo base: el rendimiento y las limitaciones de Nemotron 3.5 Parse (no detalladas en la informacion) condicionan el comportamiento del adaptador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Privoid-ai/Privoid-Parse-FinTables
- Modelo base NVIDIA Nemotron 3.5 Parse: https://huggingface.co/nvidia/Nemotron-3.5-Parse
- Dataset de entrenamiento: https://huggingface.co/datasets/docling-project/FinTabNet_OTSL
- Licencia OpenMDW-1.1: disponible en el repositorio del modelo (archivo LICENSE)
