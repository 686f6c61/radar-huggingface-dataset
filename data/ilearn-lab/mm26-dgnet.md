# iLearn-Lab/MM26-DGNet

## Resumen

DGNet (Dual-Knowledge Guided Network) es un framework de detección de pequeños objetivos infrarrojos (IRSTD, por sus siglas en inglés) desarrollado por el grupo de investigación iLearn-Lab. El modelo, aceptado en ACM Multimedia 2026, aborda el problema de localizar y segmentar objetos de tamaño reducido y baja radiometría en imágenes infrarrojas, un reto habitual en aplicaciones de vigilancia, defensa y búsqueda y rescate. Su propuesta se basa en una guía de doble conocimiento (dual-knowledge guidance) que mejora la representación discriminativa de los objetivos y suprime el fondo complejo, logrando una segmentación más precisa de estos elementos difíciles.

El checkpoint publicado en Hugging Face es el oficial del artículo, con licencia Apache 2.0 y un tamaño de repositorio de 0,1 GB. No se proporcionan detalles sobre la arquitectura concreta, el número de parámetros ni el proceso de entrenamiento en la información disponible. Se trata de un modelo de visión por computadora, por lo que no es un modelo de lenguaje ni multimodal en el sentido habitual; su entrada son imágenes y su salida es un mapa de segmentación.

La relevancia de DGNet radica en su enfoque específico para un problema de visión muy especializado, donde los métodos genéricos de segmentación suelen fallar debido al pequeño tamaño de los objetivos y al bajo contraste con el fondo. La publicación en una conferencia principal como ACM Multimedia indica un cierto grado de validación académica, aunque no se han difundido aún los resultados cuantitativos en la ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no textual) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (procesa imágenes, no texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (probablemente PyTorch, no confirmado) |

## Arquitectura y entrenamiento

No se ha publicado información técnica detallada sobre la arquitectura interna de DGNet en la model card ni en los resultados de búsqueda. El nombre sugiere que emplea una red neuronal con mecanismos de guía dual (posiblemente combinando conocimiento de alto nivel y bajo nivel), pero no se especifican los componentes concretos (capas convolucionales, transformers, etc.). Tampoco se dispone de datos sobre el conjunto de entrenamiento, el número de épocas, el tipo de pérdida o si se utilizaron técnicas de aumento de datos. El artículo en arXiv (2609.00666) podría contener estos detalles, pero no se ha accedido a su contenido completo.

## Capacidades

- Segmentación de pequeños objetivos infrarrojos en imágenes monocanal o multicanal.
- Supresión de fondos complejos mediante guía de doble conocimiento, lo que mejora la discriminación entre objetivo y ruido.
- Generación de mapas de probabilidad o máscaras binarias de segmentación (según el uso típico en IRSTD).
- No se han documentado capacidades de procesamiento de lenguaje, tool calling, agentes o razonamiento multimodal.

## Casos de uso

- Vigilancia y seguridad perimetral: detección de personas o vehículos pequeños en imágenes térmicas de cámaras de vigilancia, donde el objetivo puede ocupar solo unos pocos píxeles.
- Defensa y sistemas de alerta temprana: localización de aeronaves, misiles o drones en imágenes infrarrojas de largo alcance, mejorando la capacidad de respuesta ante amenazas.
- Búsqueda y rescate: identificación de personas o restos de aeronaves en terrenos complejos mediante cámaras infrarrojas montadas en drones o helicópteros.
- Inspección industrial: detección de puntos calientes o defectos térmicos en equipos eléctricos o mecánicos, donde el objetivo es pequeño y de baja emisividad.
- Conducción autónoma nocturna: detección de peatones, animales u obstáculos en carreteras mediante cámaras térmicas, complementando a los sensores visibles.
- Investigación académica: como punto de partida para experimentos en detección de objetivos pequeños o como referencia comparativa en nuevos desarrollos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como IoU, precisión o recall, ni comparaciones con otros métodos. El artículo en arXiv podría contener estos datos, pero no se han extraído. Por tanto, no se puede evaluar el rendimiento cuantitativo del modelo en esta ficha.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware específicos. Al tratarse de un modelo de segmentación de imágenes, es probable que requiera una GPU para inferencia en tiempo real, pero se desconoce el consumo de memoria, el tipo de GPU recomendada o si es ejecutable en CPU. Tampoco se mencionan opciones de despliegue como vLLM, llama.cpp u otras herramientas, ya que estas están orientadas a modelos de lenguaje y no a redes de visión. Se recomienda consultar el repositorio de GitHub para posibles instrucciones de uso.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. En el mismo grupo iLearn-Lab existe otro checkpoint denominado MM26-ADGNet, que parece estar relacionado (posiblemente una variante con atención o algo similar), pero no se han proporcionado detalles sobre sus diferencias ni sobre otros métodos de la literatura. Por tanto, no se puede establecer una comparativa objetiva en esta ficha.

## Limitaciones y advertencias

- Es un modelo de investigación, no un producto comercial; puede no estar optimizado para despliegue en producción.
- No se han documentado sesgos específicos, pero al estar entrenado para un dominio concreto (imágenes infrarrojas), su rendimiento puede degradarse en otros tipos de imágenes.
- Riesgo de alucinación no aplica (no es generativo), pero puede producir falsos positivos o negativos en condiciones de ruido extremo o con objetivos muy tenues.
- La licencia Apache 2.0 permite uso comercial y modificación, pero se recomienda revisar el artículo para conocer las restricciones de atribución.
- No se dispone de información sobre el formato de pesos ni sobre cómo cargar el modelo en frameworks estándar como PyTorch o TensorFlow, lo que puede dificultar su integración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iLearn-Lab/MM26-DGNet
- Paper (arXiv): https://arxiv.org/abs/2609.00666
- Código en GitHub: https://github.com/iLearn-Lab/MM26-DGNet
- Perfil de iLearn-Lab en Hugging Face: https://huggingface.co/iLearn-Lab/models
