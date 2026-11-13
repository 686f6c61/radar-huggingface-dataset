# 360ZhiNao/FLUX-Makeup

## Resumen

FLUX-Makeup es un framework de transferencia de maquillaje (makeup transfer) basado en un Diffusion Transformer (DiT), desarrollado por 360ZhiNao (grupo de vision de 360, tambien publicado bajo el namespace qihoo360). El modelo resuelve el problema de transferir el estilo de maquillaje de una imagen de referencia a una imagen fuente manteniendo la identidad facial y sin distorsionar el fondo, sin necesidad de modulos auxiliares de control facial. Es relevante porque simplifica la interaccion a un esquema "fuente + referencia", el formato mas natural, eliminando la dependencia de componentes externos de control de rostro que otros sistemas requieren.

El modelo se construye sobre el backbone FLUX.1-Kontext-dev (Black Forest Labs) y anade un modulo propietario denominado RefLoRAInjector, que define dos conjuntos de proyecciones de bajo rango para extraer informacion de maquillaje de forma desacoplada. El repositorio pesa 1,5 GB y se distribuye bajo licencia Apache 2.0. Acompana al paper arXiv:2508.05069 y a un repositorio GitHub con codigo de inferencia y una integracion para ComfyUI.

Los autores tambien presentan el dataset HQMT, con mas de 50.000 muestras pareadas de alta calidad generadas mediante un pipeline de datos extensible y filtrable. La ficha se basa exclusivamente en la informacion disponible en la model card y el repositorio; los datos no publicados se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) sobre backbone FLUX.1-Kontext-dev, con modulo RefLoRAInjector (proyecciones LoRA desacopladas) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusion de imagenes, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen; instrucciones textuales via backbone FLUX) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint.pt (pesos propios) + pesos del backbone FLUX.1-Kontext-dev; integracion ComfyUI en carpeta `stable_makeup` |

## Arquitectura y entrenamiento

FLUX-Makeup es un modelo de difusion de imagenes basado en un Diffusion Transformer. El backbone es FLUX.1-Kontext-dev, sobre el que se inyecta el modulo RefLoRAInjector: dos conjuntos de proyecciones de bajo rango (LoRA) que permiten extraer la informacion de maquillaje de la imagen de referencia de forma precisa y desacoplada, evitando el colapso de identidad y la distorsion del fondo. El sistema no requiere modulos auxiliares de control facial; la entrada es unicamente la imagen fuente y la imagen de referencia.

En cuanto al entrenamiento, los autores construyeron un data engine extensible, filtrable y con control de calidad, y curaron el dataset HQMT con mas de 50.000 muestras pareadas de alta calidad. No se especifican en la informacion disponible el numero de tokens o pasos de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF/DPO (no aplicables directamente a un modelo de difusion). Tampoco se detallan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Transferencia de maquillaje de alta fidelidad entre una imagen fuente y una imagen de referencia.
- Consistencia de identidad: preserva los rasgos faciales de la persona de la imagen fuente.
- Robustez frente a distorsion de fondo, gracias al diseno desacoplado del RefLoRAInjector.
- Interaccion minima "fuente + referencia", sin modulos auxiliares de control facial.
- Integracion con ComfyUI mediante la carpeta `Flux_Makeup_ComfyUI`.
- Inferencia por linea de comandos mediante `eval.sh`.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponibles mas alla de la generacion/edicion de imagenes.

## Casos de uso

- Prueba virtual de maquillaje en e-commerce: el modelo permite al usuario subir una foto propia y una imagen de referencia de un look, generando una previsualizacion fiel sin necesidad de modulos de control facial adicionales.
- Produccion audiovisual y editorial: aplicar un estilo de maquillaje concreto a multiples fotografias de una misma persona manteniendo la identidad, agilizando el retoque en sesiones de fotos.
- Aplicaciones de belleza para consumidor: integrar la transferencia en apps moviles o web donde el usuario selecciona un look de referencia y obtiene el resultado sobre su propio rostro.
- Generacion de contenido para redes sociales: crear variaciones de maquillaje sobre una imagen base para distintos estilos, con control de calidad mediante el pipeline HQMT.
- Investigacion en transferencia de estilo facial: usar el modelo y el dataset HQMT como base para experimentos de edicion facial con modelos de difusion.
- Prototipado en ComfyUI: disenar flujos de trabajo de edicion de imagen con el nodo de FLUX-Makeup para iterar rapidamente sobre estilos de maquillaje.
- Automatizacion de pipelines de retoque: integrar el modelo en un pipeline que procese lotes de imagenes con una referencia comun, aprovechando la robustez frente a fondos variados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El backbone FLUX.1-Kontext-dev es un modelo de difusion de gran tamano, por lo que se recomienda GPU con memoria amplia (orientativamente A100/H100 o RTX 4090 para ejecucion comoda), aunque no se confirma en la documentacion.
- GPU recomendadas: no disponible de forma explicita; el backbone FLUX.1-Kontext-dev sugiere GPUs de gama alta.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: inferencia via `eval.sh` (script propio sobre Diffusers), integracion con ComfyUI (`Flux_Makeup_ComfyUI`). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusion de imagen).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Enfoque | Requiere control facial auxiliar | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLUX-Makeup | FLUX.1-Kontext-dev (DiT) | Transferencia de maquillaje fuente + referencia con RefLoRAInjector | No | Apache 2.0 | Hugging Face + GitHub |
| Stable-Makeup | Stable Diffusion | Transferencia de maquillaje | No disponible en la informacion | no disponible | Referenciado en acknowledgements |
| ComfyUI_Stable_Makeup | Stable Diffusion | Nodo ComfyUI para makeup transfer | No disponible en la informacion | no disponible | Referenciado en acknowledgements |

No se dispone de datos comparativos de rendimiento (parametros, contexto, benchmarks) para el resto de alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al operar sobre rostros humanos, puede heredar sesgos del dataset HQMT y del backbone FLUX.
- Riesgo de alucinacion: como modelo generativo de difusion, puede producir artefactos o alteraciones no deseadas en rasgos faciales y fondos.
- Limitaciones de contexto o idioma: no aplicables directamente; el modelo es de imagen, aunque las instrucciones textuales dependen del backbone FLUX.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del backbone FLUX.1-Kontext-dev, que se descarga por separado y puede tener condiciones propias.
- Caveats para produccion: requiere descargar pesos externos (`checkpoint.pt`, `79999_iter.pth` y el backbone FLUX.1-Kontext-dev); no se documentan requisitos de VRAM ni latencia, lo que dificulta la planificacion de capacidad.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validacion comunitaria.
- El peso del repo (1,5 GB) corresponde a los pesos propios; el backbone FLUX.1-Kontext-dev se obtiene aparte y anade requisitos de almacenamiento y memoria.

## Enlaces

- Hugging Face: https://huggingface.co/360ZhiNao/FLUX-Makeup
- Pesos alternativos (qihoo360): https://huggingface.co/qihoo360/FLUX-Makeup
- Paper arXiv: https://arxiv.org/abs/2508.05069
- GitHub: https://github.com/360CVGroup/FLUX-Makeup
- Backbone FLUX.1-Kontext-dev: https://huggingface.co/black-forest-labs/FLUX.1-Kontext-dev
- Diffusers: https://github.com/huggingface/diffusers
- Stable-Makeup: https://github.com/Xiaojiu-z/Stable-Makeup
- ComfyUI_Stable_Makeup: https://github.com/smthemex/ComfyUI_Stable_Makeup
