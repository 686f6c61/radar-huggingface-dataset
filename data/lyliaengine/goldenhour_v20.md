# LyliaEngine/goldenHour_v20

## Resumen

Golden Hour v2.0 es un adaptador LoRA de generacion de imagenes desarrollado por LyliaEngine, disenado para producir personajes con una estetica muy cuidada, caracterizada por una iluminacion calida y cinematografica, suave y luminosa. El modelo se basa en Illustrious XL, una variante de SDXL especializada en ilustracion de alta calidad, y esta disponible en HuggingFace bajo la licencia CDLA Permissive 2.0. Su proposito es capturar el "momento dorado" de la fotografia: contraluces, luz de borde, bokeh y un ambiente general de calidez que realza la expresividad de los ojos, la textura de la piel y el detalle del cabello.

Aunque se trata de un adaptador LoRA y no de un modelo completo, su relevancia radica en ofrecer un estilo semi-realista equilibrado entre ilustracion y realismo, muy demandado en comunidades de arte digital y diseno de personajes. El autor indica que no requiere trigger word especifico, lo que simplifica su uso con cualquier prompt descriptivo. La informacion publica no incluye detalles sobre el proceso de entrenamiento, parametros ni volumen de datos, por lo que gran parte de las especificaciones tecnicas permanecen no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre SDXL (base: OnomaAIResearch/Illustrious-xl-early-release-v0) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts se escriben en ingles, pero no se especifica) |
| Licencia | CDLA Permissive 2.0 |
| Formato de pesos | no disponible (se asume safetensors por ser un adaptador de diffusers, pero no esta confirmado) |

## Arquitectura y entrenamiento

Golden Hour v2.0 es un adaptador LoRA (Low-Rank Adaptation) disenado para el modelo base Illustrious XL, que a su vez deriva de SDXL. Los LoRA modifican los pesos del modelo base mediante matrices de bajo rango, lo que permite ajustar el estilo o el contenido sin necesidad de reentrenar el modelo completo. En este caso, el adaptador se ha entrenado para inducir una estetica concreta de iluminacion y acabado visual. No se dispone de informacion sobre el numero de imagenes de entrenamiento, la composicion del dataset, el numero de pasos ni si se utilizaron tecnicas de refinamiento adicionales como RLHF o DPO. El autor no ha publicado detalles tecnicos sobre el proceso de entrenamiento en la model card ni en los resultados de busqueda.

## Capacidades

- Generacion de imagenes de personajes con estetica "golden hour": iluminacion calida, contraluces, luz de borde y bokeh.
- Semi-realismo equilibrado entre ilustracion digital y representacion realista de piel, ojos y cabello.
- Manejo especialmente bueno de escenas retroiluminadas y ambientes con resplandor calido.
- No requiere trigger word: el modelo se activa con cualquier prompt descriptivo.
- Compatible con el pipeline de diffusers y con herramientas como ComfyUI o Automatic1111 mediante la carga del adaptador LoRA.
- No incluye capacidades de texto, codigo, vision multimodal ni tool calling, ya que es exclusivamente un modelo de generacion de imagenes.

## Casos de uso

- Ilustracion de personajes para novelas visuales o juegos indies: el estilo luminoso y semi-realista encaja con portadas y escenas de dialogo.
- Arte conceptual para producciones audiovisuales: la iluminacion cinematografica permite generar atmosferas de atardecer o interiores con luz natural.
- Diseno de avatares y retratos digitales para redes sociales o comunidades artisticas: la calidad de piel y ojos reduce la necesidad de postprocesado.
- Creacion de imagenes de referencia para ilustradores: los resultados pueden servir como base para pintura digital posterior.
- Generacion de fondos y personajes secundarios para comics web: la coherencia estetica facilita mantener un estilo uniforme.
- Pruebas de diseno de personajes para estudios de animacion: la rapidez del LoRA sobre SDXL permite iterar sobre variaciones de peinado, vestuario o iluminacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un adaptador estilistico, la evaluacion suele ser subjetiva y visual, sin metricas estandar como FID o CLIP score en la documentacion publica.

## Requisitos de hardware

- No se especifican requisitos propios del adaptador, pero al estar basado en SDXL, se requieren alrededor de 8-12 GB de VRAM para inferencia con el modelo base completo.
- GPU recomendadas: cualquier tarjeta con 8 GB o mas de VRAM, como RTX 3060, RTX 4070 o superiores. Para generacion a alta resolucion con hi-res fix, se recomienda 12 GB o mas.
- El adaptador LoRA anade una carga minima adicional, por lo que puede ejecutarse en GPUs de gama media.
- Opciones de despliegue: diffusers (Python), Automatic1111, ComfyUI, y cualquier frontend que soporte LoRA sobre SDXL.
- Latencia y throughput no disponibles, dependen del hardware y del muestreador utilizado (el autor sugiere DPM++ 2M con 30 pasos).

## Comparativa con modelos similares

No se dispone de informacion comparativa con otros adaptadores LoRA de estetica similar en los resultados de busqueda. El modelo comparte categoria con otros LoRA estilisticos de SDXL orientados a iluminacion cinematografica, pero no se han encontrado datos cuantitativos ni listados oficiales para establecer una comparacion objetiva.

## Limitaciones y advertencias

- La model card incluye ejemplos con el prompt "adult" y un negative prompt extenso, lo que sugiere que el modelo puede generar contenido para adultos; se debe revisar la licencia y las politicas de uso de cada plataforma antes de emplearlo en produccion.
- No hay informacion sobre sesgos del modelo, pero al ser un adaptador entrenado sobre un dataset no documentado, podria presentar sesgos de representacion (etnia, genero, edad) heredados del modelo base.
- Riesgo de alucinacion visual en detalles como manos o anatomia, mitigado parcialmente por el negative prompt recomendado y el uso de ADetailer.
- La licencia CDLA Permissive 2.0 permite uso comercial, pero es recomendable revisar los terminos completos, especialmente si se redistribuyen los pesos o se integran en productos comerciales.
- No se proporciona informacion sobre la resolucion nativa de entrenamiento ni sobre la robustez del adaptador ante prompts fuera de estilo; es posible que funcione mejor con la configuracion sugerida por el autor (30 pasos, CFG 5, DPM++ 2M Karras).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LyliaEngine/goldenHour_v20
- Version anterior v1.0: https://huggingface.co/LyliaEngine/goldenHour_v10
- Perfil del autor: https://huggingface.co/LyliaEngine
- Pagina en Civitai: https://civitai.com/models/2433139/golden-hour
- Pagina en PromptHero: https://prompthero.com/ai-models/golden-hour-2433139-download/golden-hour-v20
