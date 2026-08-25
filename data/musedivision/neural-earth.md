# musedivision/neural-earth

## Resumen

Neural Earth es un modelo de campo neuronal (neural field) que representa datos geoespaciales de la Tierra mediante una combinación de hash-grid y una red MLP. Los pesos publicados en este repositorio de HuggingFace son una exportación en formato int8, diseñados específicamente para ser cargados por un visor WebGPU a través de la función `mountNeuralEarth`. No se trata de un modelo de lenguaje ni de un sistema de generación de texto, sino de una representación compacta de información geográfica que permite renderizado interactivo en navegador.

El proyecto está desarrollado por musedivision, aunque la información pública es mínima. La model card solo indica que es una exportación de pesos para el visor, con dos variantes de piernas (legs) y cuantización int8. El repositorio ocupa 0,4 GB y fue creado en agosto de 2026. La empresa Neural Earth, con presencia web y una ronda de financiación de 9 millones de dólares, parece estar relacionada con analítica geoespacial basada en IA, aunque no se confirma que este modelo sea parte de su plataforma comercial.

La relevancia de este modelo radica en su enfoque: en lugar de un LLM, ofrece una representación neuronal de la superficie terrestre que puede ejecutarse en tiempo real en dispositivos con soporte WebGPU, lo que abre posibilidades para visualización de riesgos, mapas interactivos y análisis geoespacial en el navegador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hash-grid + MLP (campo neuronal) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (no es modelo de texto) |
| Tipos de cuantizacion | int8 (exportado) |
| Idiomas soportados | no aplicable |
| Licencia | other (no especificada) |
| Formato de pesos | no especificado (probablemente binario o JSON para WebGPU) |

## Arquitectura y entrenamiento

La arquitectura se describe como "hash-grid + MLP", una técnica popularizada por Instant NGP (Neural Graphics Primitives) para codificar campos de densidad y color en un espacio 3D. El hash-grid permite una representación compacta y de alta resolución mediante una tabla hash multiescala, mientras que el MLP decodifica las características en valores de salida. En este caso, el campo neuronal está especializado en datos de la Tierra, probablemente codificando elevación, reflectancia u otras propiedades geofísicas.

No se dispone de información sobre el proceso de entrenamiento: ni el número de tokens (no aplicable), ni la composición del dataset, ni si se usaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones técnicas más allá de la cuantización int8 para reducir el peso y facilitar la carga en WebGPU. La exportación incluye una variante "coarse" (piernas gruesas) y posiblemente otras, aunque solo se menciona esa en la model card.

## Capacidades

- Renderizado de campos neuronales de la Tierra en navegador mediante WebGPU.
- Carga de pesos remotos desde HuggingFace a través de la función `mountNeuralEarth`.
- Soporte de cuantización int8 para reducir el tamaño y mejorar el rendimiento en GPU de consumo.
- Representación de datos geoespaciales a escala planetaria (al menos en nivel "coarse").
- Integración con un visor JavaScript específico (no se especifica si es open source).
- No incluye capacidades de generación de texto, razonamiento, código, visión ni tool calling.

## Casos de uso

- Visualización interactiva de la superficie terrestre en aplicaciones web: el modelo permite cargar una representación neuronal de la Tierra en un navegador con WebGPU, ideal para mapas 3D inmersivos o globos terráqueos digitales.
- Análisis de riesgos geoespaciales: la empresa Neural Earth menciona su uso en seguros y gestión de riesgos; este modelo podría servir para visualizar zonas de peligro (inundaciones, incendios) en tiempo real.
- Educación y divulgación científica: profesores y estudiantes pueden explorar la geografía planetaria sin necesidad de descargar grandes datasets raster.
- Prototipado de aplicaciones de realidad aumentada o virtual: al ser un campo neuronal, puede integrarse en escenas 3D para superponer información geográfica.
- Demostraciones técnicas de WebGPU y neural fields: desarrolladores pueden estudiar cómo se exportan y cargan pesos de este tipo en un visor.
- Monitoreo ambiental: visualización de cambios en la superficie (deforestación, urbanización) si se actualizan los pesos con nuevas observaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay métricas de precisión, velocidad de renderizado ni comparaciones con otros modelos de campos neuronales.

## Requisitos de hardware

- Al ser un modelo para WebGPU, se ejecuta en la GPU del dispositivo a través del navegador. No requiere una GPU específica, pero sí un navegador compatible con WebGPU (Chrome, Edge, Firefox recientes).
- El tamaño del repositorio es de 0,4 GB, pero los pesos int8 probablemente ocupan menos de 100 MB en memoria, lo que lo hace viable en GPUs integradas.
- No se requieren GPUs de servidor (A100, H100, etc.). Cualquier GPU moderna con soporte WebGPU puede renderizar el modelo.
- Opciones de despliegue: exclusivamente a través del visor WebGPU mencionado en la model card. No hay soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependen del hardware del cliente y de la resolución de renderizado.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. Los campos neuronales para representación de la Tierra son un nicho poco documentado; alternativas como Instant NGP o NeRF son genéricas y no están orientadas a datos planetarios. No se puede establecer una comparativa fiable con los datos disponibles.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no responde preguntas. Cualquier uso fuera de la visualización geoespacial es inapropiado.
- La licencia "other" no especifica términos de uso comercial. Antes de integrarlo en un producto, es necesario contactar con el autor para aclarar los derechos.
- La documentación es extremadamente escasa: no hay detalles sobre el formato de los pesos, la precisión del campo neuronal ni la cobertura geográfica real.
- El modelo está exportado en int8, lo que puede introducir pérdida de precisión en la representación de detalles finos del terreno.
- Depende de WebGPU, que aún no está disponible en todos los navegadores (Safari tiene soporte parcial). En dispositivos sin WebGPU, el visor no funcionará.
- No se garantiza la exactitud de los datos geoespaciales; es una representación neuronal aproximada, no un dataset cartográfico oficial.
- El repositorio tiene 0 descargas y 1 like, lo que sugiere que es un proyecto experimental o en fase temprana.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/musedivision/neural-earth
- Web de Neural Earth: https://neuralearth.ai/
- Nota de prensa sobre financiación: https://neuralearth.ai/press-releases/neural-earth-closes-9m-oversubscribed-seed-round
- Artículo en AI Magazine: https://aimagazine.com/globenewswire/3243932
