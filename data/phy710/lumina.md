# phy710/LUMINA

## Resumen

LUMINA es un benchmark y modelo de mamografía multi-vendor presentado en CVPR 2026 por el laboratorio NUBagciLab. Su objetivo principal es proporcionar un conjunto de datos estandarizado y un protocolo de armonización de energía para abordar la variabilidad entre equipos de mamografía de distintos fabricantes, un problema crítico en el diagnóstico asistido por ordenador. El repositorio de HuggingFace almacena los pesos del modelo, aunque la documentación pública es mínima y no especifica la arquitectura, el número de parámetros ni el tipo de tarea concreta (clasificación, detección, segmentación, etc.).

La relevancia de LUMINA radica en su enfoque en la armonización de imágenes mamográficas, un paso previo necesario para que los modelos de IA sean transferibles entre hospitales y sistemas de imagen. Al ser un trabajo de investigación reciente (CVPR 2026), su disponibilidad pública con licencia MIT facilita la reproducibilidad y la comparación con otros métodos. Sin embargo, la información técnica disponible en la ficha de HuggingFace es muy limitada, por lo que esta ficha se basa únicamente en los datos publicados y marca explícitamente los campos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de 57.2 GB, probablemente safetensors o binarios, sin confirmar) |

## Arquitectura y entrenamiento

No se ha publicado informacion detallada sobre la arquitectura del modelo LUMINA. La model card solo indica que se trata de un benchmark de mamografia multi-vendor con un protocolo de armonizacion de energia, y que los pesos del modelo estan disponibles en este repositorio. No se especifican los datos de entrenamiento, el numero de tokens (irrelevante para un modelo de vision), ni si se utilizaron tecnicas como aprendizaje por refuerzo o ajuste fino supervisado. El repositorio GitHub asociado (NUBagciLab/LUMINA) contiene el codigo y la documentacion del proyecto, pero no se ha accedido a el en esta busqueda. Por tanto, cualquier detalle sobre la arquitectura (CNN, transformer, etc.) o el proceso de entrenamiento queda pendiente de la publicacion oficial del paper en CVPR 2026.

## Capacidades

- Vision por computador aplicada a mamografia: el modelo esta disenado para trabajar con imagenes mamograficas, probablemente para tareas de clasificacion, deteccion o segmentacion de lesiones.
- Armonizacion de energia: incorpora un protocolo para normalizar las diferencias de intensidad y contraste entre equipos de distintos fabricantes, lo que mejora la generalizacion entre dominios.
- Soporte multi-vendor: el benchmark incluye datos de multiples fabricantes de equipos de mamografia, lo que permite evaluar la robustez del modelo ante variaciones de adquisicion.
- No se han documentado capacidades de generacion de texto, tool calling, agentes ni razonamiento multimodal general, ya que se trata de un modelo especializado en imagenes medicas.

## Casos de uso

- Diagnostico asistido por mamografia: el modelo puede utilizarse como componente de un sistema de apoyo al radiologo para detectar anomalias en mamografias, reduciendo la carga de trabajo y mejorando la precision en entornos clinicos.
- Armonizacion de imagenes entre centros hospitalarios: al normalizar las diferencias de energia entre equipos, permite que un modelo entrenado en un hospital se aplique a datos de otro sin perdida de rendimiento, facilitando la colaboracion multicentrica.
- Investigacion en radiologia computacional: sirve como punto de partida para estudios que comparen tecnicas de armonizacion de dominio o que desarrollen nuevos algoritmos de deteccion de cancer de mama.
- Evaluacion de equipos de mamografia: el benchmark puede usarse para auditar la calidad de imagen de distintos fabricantes y para calibrar protocolos de adquisicion.
- Formacion de modelos de IA clinica: los pesos publicados permiten a otros investigadores realizar fine-tuning con sus propios datos, siempre que mantengan la licencia MIT.
- Desarrollo de herramientas de triaje automatico: en programas de cribado poblacional, el modelo podria priorizar mamografias con alta probabilidad de hallazgos malignos para revision urgente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como AUC, sensibilidad, especificidad ni comparaciones con otros modelos. Se espera que el paper de CVPR 2026 contenga dichos datos, pero no estan accesibles en la ficha de HuggingFace ni en los resultados de busqueda obtenidos.

## Requisitos de hardware

- No se dispone de informacion sobre requisitos de hardware especificos para LUMINA.
- El tamano del repositorio (57.2 GB) sugiere que los pesos del modelo son considerables, probablemente requiriendo una GPU con al menos 24 GB de VRAM para inferencia en precision completa, aunque no se confirma.
- No se indican GPUs recomendadas ni opciones de despliegue (vLLM, llama.cpp, etc.), ya que no es un modelo de lenguaje.
- Para uso en investigacion, se recomienda una GPU de gama alta (A100, RTX 4090 o similar) si el modelo es de gran tamano, pero esto es una estimacion no verificada.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos de mamografia. No se conocen modelos publicos equivalentes con licencia MIT y protocolo de armonizacion de energia. La comparativa quedaria pendiente de la publicacion del paper y de la disponibilidad de otros benchmarks como CBIS-DDSM o INbreast, pero no se pueden ofrecer datos concretos sin fuentes verificadas.

## Limitaciones y advertencias

- La informacion publica es muy escasa: no se conocen la arquitectura, los datos de entrenamiento ni las metricas de rendimiento, lo que impide evaluar su idoneidad para uso clinico.
- Al ser un modelo de investigacion, no ha sido validado en entornos clinicos reales ni aprobado por agencias reguladoras (FDA, CE). No debe utilizarse como unico criterio diagnostico.
- El riesgo de sesgo es inherente a los datos de mamografia: si el conjunto de entrenamiento no es diverso en poblacion, equipos o tecnicas, el modelo puede presentar un rendimiento desigual en subgrupos.
- La licencia MIT permite uso comercial, pero no exime de la responsabilidad de validar el modelo en el contexto especifico de cada aplicacion.
- No se especifican limitaciones de contexto o idioma, ya que no es un modelo de texto.
- El repositorio de HuggingFace no incluye documentacion tecnica detallada; se recomienda consultar el repositorio GitHub y el paper de CVPR 2026 para obtener informacion completa.

## Enlaces

- HuggingFace: https://huggingface.co/phy710/LUMINA
- GitHub (NUBagciLab/LUMINA): https://github.com/NUBagciLab/LUMINA
- Perfil del autor en HuggingFace: https://huggingface.co/phy710
