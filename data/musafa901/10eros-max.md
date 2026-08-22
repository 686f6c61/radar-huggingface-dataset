# musafa901/10Eros-Max

## Resumen

10Eros-Max es un modelo de generacion de video a partir de texto e imagen, desarrollado por el usuario musafa901 como un fine-tune experimental sobre la base MiniMaxAI/MiniMax-H3. El modelo se presenta como un "injerto" (grafting) de caracteristicas procedentes de otros modelos de video como LTX 2.3, Wan 2.2 y Krea 2, integradas en las capas de atencion de H3 sin degradar la calidad visual o de audio del modelo base. El autor documenta abiertamente la metodologia de injerto, aunque no publica los scripts completos.

El proyecto surge como respuesta a las dificultades de entrenamiento del propio H3, por lo que el autor opta por transferir conocimiento de modelos ya entrenados en lugar de esperar a nuevas versiones. El repositorio ocupa 347.9 GB, lo que sugiere pesos en precision BF16 o similar. Se distribuye bajo la licencia comunitaria de MiniMax-H3, con la particularidad de que, al incorporar caracteristicas de LTX 2.3, Wan 2.2 y Krea 2, las licencias de esos modelos tambien se aplican a las partes correspondientes.

La relevancia actual del modelo radica en su enfoque de reutilizacion de pesos entre arquitecturas de video, asi como en la disponibilidad de cuantizaciones alternativas (int8, NVFP4, GGUF) que permiten ejecutarlo en hardware de consumo. No obstante, se trata de un proyecto en evolucion, con advertencias explicitas sobre problemas de entrenamiento y una comunidad de usuarios que ha generado variantes y adaptaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en MiniMaxAI/MiniMax-H3 (no se especifica el tipo exacto, probablemente transformer de video) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (original, 347.9 GB), int8 (version enlazada), NVFP4 (version de terceros), GGUF (varias cuantizaciones de terceros) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (con licencias adicionales de LTX 2.3, Wan 2.2 y Krea 2 para las partes transferidas) |
| Formato de pesos | safetensors (presumiblemente, aunque no se confirma explicitamente; las versiones GGUF usan formato GGUF) |

## Arquitectura y entrenamiento

La arquitectura se hereda de MiniMax-H3, un modelo de generacion de video que acepta entradas de texto e imagen. El autor no detalla la estructura interna (numero de capas, dimensiones, atencion, etc.) en la informacion disponible. Lo que si se explica es el proceso de "injerto": se toman pesos de modelos preentrenados (LTX 2.3, Wan 2.2 y Krea 2) y se integran en las capas de atencion de H3 a un nivel bajo, de modo que no se altere la calidad visual o de audio del modelo base. El autor menciona que el entrenamiento de H3 es problematico y que su rama dependera de futuros ajustes de Sulphur H3, pero que no quiso esperar y opto por esta transferencia de caracteristicas.

No se proporcionan datos sobre el dataset de entrenamiento, el numero de tokens, ni si se aplicaron tecnicas como RLHF o DPO. El autor indica que el proyecto esta en evolucion y sujeto a correcciones futuras. Tambien menciona que ha publicado una guia completa (compilada con ayuda de Claude) sobre la metodologia de injerto, incluyendo codigo y procedimiento, aunque excluye los scripts en si.

## Capacidades

- Generacion de video a partir de texto (text-to-video).
- Generacion de video a partir de imagen (image-to-video).
- Generacion de video a partir de texto e imagen combinados (image-text-to-video).
- Capacidad de transferir caracteristicas estilisticas y de movimiento de otros modelos (LTX 2.3, Wan 2.2, Krea 2) gracias al injerto.
- Soporte de schedulers alternativos: el autor recomienda para el modelo TURBO el uso de "multires/simple" con 6 pasos, o "er_sde/simple" con 6 pasos, o un scheduler personalizado con sigmas [1.00, 0.94, 0.83, 0.72, 0.55, 0.30, 0.10, 0.00] para reducir ruido de movimiento.
- No se mencionan capacidades de tool calling, agentes, razonamiento multimodal ni otras funciones tipicas de LLM, ya que se trata de un modelo de generacion de video.

## Casos de uso

- Creacion de contenido audiovisual para redes sociales: el modelo puede generar clips cortos a partir de prompts de texto o imagenes de referencia, adecuado para plataformas como TikTok o Instagram Reels.
- Prototipado rapido de escenas para produccion cinematografica: los directores o storyboarders pueden generar versiones preliminares de una escena a partir de una descripcion textual o un boceto.
- Generacion de material de stock para video: empresas de medios pueden producir clips de relleno o fondos animados sin necesidad de rodaje.
- Animacion de imagenes fijas: a partir de una fotografia o ilustracion, el modelo puede generar una secuencia animada, util para presentaciones o contenido educativo.
- Experimentacion artistica: artistas digitales pueden combinar estilos de diferentes modelos base (LTX, Wan, Krea) mediante el injerto, explorando nuevas esteticas.
- Investigacion en transferencia de conocimiento entre modelos de video: el proyecto sirve como caso de estudio para tecnicas de grafting de pesos, util para academicos y desarrolladores que trabajan en adaptacion de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de metricas como FVD, CLIP score, ni comparaciones cuantitativas con otros modelos de generacion de video. El autor no proporciona ningun numero de rendimiento en la model card ni en los resultados de busqueda.

## Requisitos de hardware

- El modelo original en BF16 ocupa 347.9 GB, lo que requiere multiples GPUs de alta gama (por ejemplo, 8x A100 80GB o similar) para cargar en memoria.
- Existe una version int8 (enlazada en la model card) que reduce el tamaño, aunque no se especifica el peso exacto.
- Un tercero ofrece una cuantizacion NVFP4 que reduce el modelo a menos de un tercio del tamaño original (aproximadamente 40 GB en BF16, por lo que NVFP4 podria rondar los 13-15 GB), permitiendo su ejecucion en GPUs de consumo como RTX 4090 (24 GB) o incluso RTX 3090 (24 GB).
- Otro tercero proporciona cuantizaciones GGUF optimizadas para ComfyUI, disenadas para GPUs de consumo con 12-16 GB de VRAM, como RTX 3060 12GB o RTX 4070 12GB.
- Para despliegue, se menciona ComfyUI con la extension ComfyUI-GGUF para las versiones GGUF. No se mencionan vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- La latencia y el throughput dependen en gran medida del hardware y de la cuantizacion; no se proporcionan datos concretos.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa rigurosa con otros modelos de generacion de video. Se sabe que el modelo base es MiniMax-H3, y que se han transferido caracteristicas de LTX 2.3, Wan 2.2 y Krea 2, pero no se conocen los parametros, rendimiento ni licencias de esos modelos en detalle. Por tanto, la comparativa se limita a lo siguiente:

| Modelo | Base | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 10Eros-Max | MiniMax-H3 | 347.9 GB (BF16) | no disponible | minimax-h3-community-license-agreement | HuggingFace |
| MiniMax-H3 | MiniMax | no disponible | no disponible | minimax-h3-community-license-agreement | HuggingFace |
| LTX 2.3 | LTX | no disponible | no disponible | no disponible | no disponible |
| Wan 2.2 | Wan | no disponible | no disponible | no disponible | no disponible |
| Krea 2 | Krea | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- El modelo es un experimento de injerto de pesos; el propio autor advierte que el entrenamiento de H3 es problematico y que el proyecto esta sujeto a correcciones futuras.
- La licencia es la comunidad de MiniMax-H3, pero al incorporar caracteristicas de LTX 2.3, Wan 2.2 y Krea 2, las licencias de esos modelos se aplican a las partes correspondientes. Esto puede implicar restricciones adicionales para uso comercial, dependiendo de los terminos de cada licencia.
- No se especifican los idiomas soportados; es probable que el modelo funcione mejor con prompts en ingles, pero no hay confirmacion.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de contexto. Al ser un modelo de video, los riesgos tipicos incluyen la generacion de contenido inapropiado o la reproduccion de sesgos presentes en los datos de entrenamiento de los modelos base.
- El tamaño del repositorio (347.9 GB) hace que la descarga y el almacenamiento sean costosos; las cuantizaciones de terceros pueden reducir el tamaño pero no estan oficialmente respaldadas por el autor.
- No hay documentacion oficial sobre el uso en produccion, ni garantias de estabilidad o soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/musafa901/10Eros-Max
- Licencia de MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Version int8 (enlazada en la model card): https://huggingface.co/cicalooo/10Eros-Max-h3-int8-convrot
- Repositorio de pruebas de MiniMax-H3 (origen del modelo TURBO): https://huggingface.co/silveroxides/MiniMax-H3_tests/tree/main
- Cuantizacion NVFP4 de terceros: https://huggingface.co/sakamakismile/10Eros-Max-beta2-NVFP4
- Cuantizaciones GGUF de terceros: https://huggingface.co/Abiray/10Eros-Max-fl2va-Beta2-GGUF
- Pagina de modelos en Civitai (LTX 10Eros v1.4): https://civitai.red/models/2447875/ltx23-10eros
- Listado de modelos en CleverThis: https://cleverthis.com/models/
