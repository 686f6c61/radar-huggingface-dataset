# melody1985/GeoStereo

## Resumen

GeoStereo es un framework unificado de estimación de geometría estéreo desarrollado por un equipo de investigadores (Qizhe Wei, Xianda Guo, Shaocong Xu, Hong Li, Runyi Yang y Hao Zhao) y presentado en ACM MM26. El modelo aborda de forma conjunta dos tareas fundamentales en visión 3D: la estimación de disparidad estéreo (stereo matching) y la estimación de normales de superficie. Su principal contribución es combinar una rama feed-forward de correspondencia binocular con una rama de difusión que aporta priors geométricos, logrando predicciones más fiables en regiones problemáticas como zonas con poca luz, superficies reflectantes o transparentes.

La arquitectura integra la estimación de disparidad y normales en un mismo marco, con interacción de características geométricas entre ambas representaciones y una optimización conjunta que refuerza mutuamente la correspondencia estéreo y la geometría de superficie. El checkpoint publicado ocupa 22,4 GB en formato safetensors, aunque no se especifican el número total de parámetros ni la longitud de contexto (al ser un modelo de visión, este último concepto no aplica). La licencia es Apache-2.0, lo que permite uso comercial y modificación.

GeoStereo es relevante porque aborda una limitación conocida de los métodos estéreo tradicionales: la falta de priors geométricos fuertes en regiones ambiguas. Al incorporar un modelo de difusión como prior, mejora la consistencia geométrica y la robustez en escenarios del mundo real, lo que lo convierte en una propuesta interesante para aplicaciones de robótica, conducción autónoma y reconstrucción 3D.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: rama de stereo matching feed-forward + rama de difusión para normales de superficie |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GeoStereo combina dos ramas complementarias. La primera es una rama de stereo matching feed-forward que estima correspondencias densas entre un par de imágenes rectificadas y produce un mapa de disparidad. A partir de esa disparidad se genera un prior inicial de normales de superficie. La segunda rama es un modelo de difusión que refina las normales, aportando priors geométricos aprendidos que ayudan a resolver regiones ambiguas. Entre ambas ramas existe una interacción de características geométricas: la información de disparidad y la de normales se intercambian y se refinan mutuamente mediante una optimización conjunta.

El entrenamiento se realiza de forma conjunta, de manera que la rama de difusión transfiere sus priors estructurales a la estimación de disparidad, y la disparidad predicha se mantiene geométricamente consistente con las normales refinadas. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens (no aplica) ni el uso de técnicas como RLHF o DPO. La innovación principal es el uso de priors de difusión para geometría estéreo, un enfoque poco explorado hasta la fecha.

## Capacidades

- Estimación de disparidad estéreo densa a partir de pares de imágenes rectificadas.
- Estimación de normales de superficie con refinamiento mediante difusión.
- Manejo robusto de regiones difíciles: baja iluminación, superficies reflectantes y transparentes.
- Optimización conjunta que mejora la consistencia geométrica entre disparidad y normales.
- Intercambio de características geométricas entre ambas ramas para un refinamiento mutuo.
- No incluye capacidades de generación de texto, tool calling, agentes ni procesamiento de lenguaje natural.

## Casos de uso

- Reconstrucción 3D a partir de pares estéreo: GeoStereo puede utilizarse para generar nubes de puntos densas y precisas en entornos interiores o exteriores, aprovechando la mejora en regiones con texturas pobres o superficies especulares.
- Robótica móvil: la estimación conjunta de disparidad y normales permite a un robot navegar y manipular objetos con mejor comprensión de la geometría del entorno, especialmente en condiciones de iluminación adversas.
- Conducción autónoma: los mapas de disparidad y normales son esenciales para la percepción de profundidad en vehículos autónomos. GeoStereo ofrece predicciones más fiables en zonas con reflejos o cristales, donde los métodos clásicos fallan.
- Realidad aumentada y virtual: la generación de mapas de profundidad y normales de alta calidad permite ocluir correctamente objetos virtuales en escenas reales capturadas con cámaras estéreo.
- Inspección industrial: en entornos de fabricación, la estimación de normales de superficie ayuda a detectar defectos geométricos en piezas, mientras que la disparidad proporciona medidas precisas de profundidad.
- Postproducción cinematográfica: la generación de mapas de disparidad y normales a partir de footage estéreo facilita tareas de composición, reiluminación y efectos visuales, con mejor manejo de superficies difíciles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper asociado (arXiv 2607.24024) podría contener métricas, pero no se han proporcionado en los materiales consultados.

## Requisitos de hardware

- No se dispone de información oficial sobre requisitos de VRAM, GPU recomendadas o latencia.
- El checkpoint publicado ocupa 22,4 GB en safetensors, lo que sugiere que para cargar los pesos en precisión FP32 se necesitaría una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A100 o H100).
- No se han publicado versiones cuantizadas (GGUF, AWQ, etc.), por lo que el despliegue en hardware de consumo con menos VRAM no está documentado.
- Las opciones de despliegue típicas para modelos de visión en PyTorch incluyen Hugging Face Transformers, pero no se especifican integraciones con vLLM, llama.cpp u Ollama (estas herramientas están orientadas a modelos de lenguaje).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se pueden establecer comparaciones con otras arquitecturas de estimación estéreo o de normales sin datos adicionales.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero al ser un modelo de visión entrenado con datos no especificados, podría presentar degradación en condiciones extremas no representadas en el entrenamiento.
- Riesgo de predicciones erróneas en regiones con oclusiones severas o texturas repetitivas, aunque el uso de priors de difusión mitiga parcialmente este problema.
- No se ha publicado información sobre el dataset de entrenamiento, por lo que no es posible evaluar la cobertura de dominios ni posibles sesgos geográficos o de iluminación.
- La licencia Apache-2.0 permite uso comercial sin restricciones adicionales, pero se recomienda verificar la atribución requerida.
- El tamaño del checkpoint (22,4 GB) puede dificultar el despliegue en entornos con recursos limitados.
- No se han publicado versiones cuantizadas ni optimizaciones para inferencia en tiempo real, lo que limita su uso en aplicaciones con restricciones de latencia.

## Enlaces

- Modelo en Hugging Face (original): https://huggingface.co/qz-wei/GeoStereo
- Modelo en Hugging Face (mirror, ID melody1985/GeoStereo): https://huggingface.co/melody1985/GeoStereo
- Repositorio GitHub: https://github.com/qz-wei/GeoStereo
- Página del proyecto: https://qz-wei.github.io/GeoStereo.github.io/
- Paper (arXiv v1): https://arxiv.org/pdf/2607.24024v1
- Paper (arXiv v2): https://arxiv.org/pdf/2607.24024v2
