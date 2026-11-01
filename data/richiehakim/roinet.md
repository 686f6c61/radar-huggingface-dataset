# richiehakim/ROInet

## Resumen

ROInet es un conjunto de redes neuronales preentrenadas en PyTorch desarrolladas por Richie Hakim para ROICaT, una libreria de codigo abierto dedicada al analisis de imagenes de calcio en neurociencia. El modelo no es un modelo de lenguaje ni un transformer generativo: se trata de una red convolucional especializada en el registro y la clasificacion de regiones de interes (ROIs) en grabaciones de imagen de calcio de neuronas, una tarea central en los pipelines de neurociencia de sistemas.

El repositorio incluye dos variantes con propositos distintos: una red de seguimiento (tracking) entrenada sin oclusiones ni transformaciones afines grandes, y una red de clasificacion entrenada con oclusiones y transformaciones afines grandes. Cada variante se distribuye como un archivo zip que contiene los pesos (.pth), la definicion del modelo (model.py) y los parametros de entrenamiento (params.json). ROICaT descarga estos archivos automaticamente, por lo que la mayoria de usuarios no necesita obtenerlos manualmente.

Su relevancia es practica y acotada al dominio: proporciona pesos preentrenados listos para usar dentro de un ecosistema consolidado de analisis de imagen de calcio, lo que evita a los investigadores tener que entrenar sus propias redes de matching de ROIs desde cero. La informacion publica no incluye detalles sobre arquitectura interna, numero de parametros ni regimen de entrenamiento mas alla de las notas sobre condiciones de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red neuronal convolucional para matching de ROIs, definida en `model.py` dentro de cada zip) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | GPL-3.0 |
| Formato de pesos | `.pth` (PyTorch), empaquetado en archivos zip junto con `model.py` y `params.json` |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de las redes. Se sabe que son redes implementadas en PyTorch, con la definicion recogida en el archivo `model.py` que acompana a cada conjunto de pesos, y que su funcion es el matching de ROIs entre sesiones de imagen de calcio: identificar que region corresponde a la misma neurona a lo largo del tiempo o entre grabaciones.

El entrenamiento se diferencia por variante. La red de tracking (`ROInet_tracking_20220527.zip`) se entreno sin oclusiones ni transformaciones afines grandes, lo que la hace adecuada para el emparejamiento en condiciones relativamente limpias. La red de clasificacion (`ROInet_classification_20220902.zip`) se entreno con oclusiones y transformaciones afines grandes, lo que la prepara para escenarios mas adversos. No se especifican el numero de muestras de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de aumento de datos mas alla de las condiciones descritas. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal, que no aplican a este tipo de modelo.

## Capacidades

- Extraccion de caracteristicas y matching de ROIs en imagenes de calcio para seguimiento de neuronas a lo largo del tiempo (variante tracking).
- Clasificacion de ROIs robusta frente a oclusiones y transformaciones afines grandes (variante classification).
- Integracion directa con el pipeline de ROICaT, que descarga y carga los pesos de forma automatica.
- Uso como componente preentrenado dentro de flujos de analisis de neurociencia, sin necesidad de reentrenamiento.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes ni capacidades multilingues.
- No dispone de modo thinking, audio ni ninguna capacidad generativa.

## Casos de uso

- Seguimiento de neuronas en sesiones longitudinales de imagen de calcio: la variante tracking permite emparejar ROIs entre grabaciones sucesivas de un mismo animal, facilitando el analisis de la estabilidad de la actividad neuronal a lo largo de dias o semanas.
- Analisis de datos con oclusiones en el campo de vision: la variante classification, entrenada con oclusiones y transformaciones afines grandes, resulta adecuada cuando las grabaciones presentan solapamientos entre celulas o desplazamientos notables del tejido.
- Extraccion de series temporales de actividad por neurona: tras el matching, los investigadores pueden construir trazas de fluorescencia por ROI identificada y analizar correlaciones o dinamicas poblacionales.
- Integracion en pipelines automatizados de laboratorio: al descargarse automaticamente via ROICaT, el modelo se incorpora sin intervencion manual en flujos de procesamiento por lotes de experimentos de imagen de calcio.
- Reproducibilidad de analisis publicados: el uso de pesos preentrenados con MD5 documentado permite replicar exactamente el matching empleado en estudios previos que usaron ROICaT.
- Comparacion de metodos de registro de ROIs: sirve como linea base preentrenada frente a la que evaluar nuevos algoritmos de matching en experimentos de neurociencia de sistemas.
- Docencia y formacion en analisis de imagen de calcio: permite a estudiantes ejecutar pipelines completos de seguimiento de neuronas sin entrenar redes desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamano del repositorio es de 0,2 GB, lo que sugiere que los pesos son ligeros y probablemente quepan en GPUs de gama baja, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por el tamano del repositorio es plausible que funcione en GPUs de consumo, pero no hay datos oficiales.
- Opciones de despliegue: uso mediante la libreria ROICaT en PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de matching de ROIs ni datos que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- La informacion publica no detalla sesgos conocidos; al ser un modelo de vision especializado, los sesgos dependerian de la distribucion de los datos de entrenamiento, que no se documenta.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de falsos emparejamientos o clasificaciones erroneas de ROIs en condiciones distintas a las de entrenamiento.
- La variante tracking se entreno sin oclusiones ni transformaciones afines grandes, por lo que puede degradarse en grabaciones con solapamientos o desplazamientos acusados; para esos casos esta pensada la variante classification.
- No se documentan limitaciones de idioma porque el modelo no procesa lenguaje.
- La licencia GPL-3.0 implica obligaciones de copyleft: el uso comercial es posible, pero la distribucion de obras derivadas debe hacerse bajo la misma licencia, lo que puede condicionar su integracion en productos propietarios.
- Para produccion, conviene verificar los MD5 publicados y el origen de los pesos (HuggingFace u OSF) antes de desplegar, y validar el rendimiento en el dominio concreto de las grabaciones propias.
- No hay informacion sobre mantenimiento, versionado futuro ni soporte del autor.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/richiehakim/ROInet
- Repositorio de ROICaT en GitHub: https://github.com/RichieHakim/ROICaT
- Espejo OSF de los pesos de tracking: https://osf.io/x3fd2
- Espejo OSF de los pesos de clasificacion: https://osf.io/c8m3b
