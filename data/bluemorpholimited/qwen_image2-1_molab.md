# bluemorpholimited/qwen_image2.1_molab

# Ficha de modelo: bluemorpholimited/qwen_image2.1_molab

## Resumen с

El repositorio `bluemorpholimited/qwen_image2.1_molab` no es un modelo de pesos, sino un artefacto de despliegue: un cuaderno marimo (`.py`, 19 celdas) publicado por Blue Morpho Limited (Hong Kong) que ejecuta el modelo texto a imagen `Qwen/Qwen-Image-2.1` en local dentro de una sesión Molab con GPU NVIDIA Blackwell. El repositorio ocupa 0,0 GB, no contiene safetensors ni GGUF y acumula 0 descargas y 0 interacciones, por lo que su valor está en la receta reproducible, no en los pesos. La licencia declarada, Apache-2.0, se aplica al cuaderno; los pesos remiten a la licencia del repositorio oficial de Qwen.

El problema que resuelve es de fricción de integración, no de capacidad: `QwenImage21Pipeline` todavía no está en la release 0.40.0 de diffusers (falla con `No module named AutoencoderKLQwenImage21`), el parámetro de CFG se llama `true_cfg_scale` y no `guidance_scale`, las resoluciones deben ser múltiplos de 32 con borde máximo de 2048 píxeles y la salida RGBA debe convertirse a RGB antes de exportar JPEG. Cada uno de esos puntos está documentado con el error exacto que provoca.

Su relevancia actual es doble: por un lado, fija tiempos reales de generación en hardware profesional (4 s para 1024² con 16 pasos; 52 s para 1792² con 28 pasos en una RTX PRO 6000 de 96 GB) y, por otro, demuestra que la ruta local exige cerca de 32 GB de VRAM residentes solo para los pesos en bf16, lo que deja el modelo fuera del alcance de GPU de consumo de 24 GB. Incluye además celdas alternativas contra la API alojada de MiniMax, lo que permite comparar la ruta local con la ruta gestionada en el mismo cuaderno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (el pipeline `QwenImage21Pipeline` y el modulo `AutoencoderKLQwenImage21` indican difusion con autoencoder KL, presumiblemente sobre transformer de difusion; no confirmado) |
| Parametros totales | no disponible; estimacion aproximada de 16 500 millones a partir de los ~33 GB en bf16 indicados en la model card (calculo no confirmado por el autor) |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no aplica; resolucion de imagen configurable, multiplos de 32, borde maximo 2048 px |
| Tipos de cuantizacion | bf16 (unico formato citado); no se mencionan GGUF, FP8 ni INT8 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (cuaderno); los pesos dependen de la licencia de `Qwen/Qwen-Image-2.1` |
| Formato de pesos | no disponible en este repositorio (0,0 GB); los pesos se descargan desde `Qwen/Qwen-Image-2.1` en safetensors via diffusers |
| Libreria | diffusers (rama `main`, no release 0.40.0) |
| Pipeline declarado | text-to-image |
| Autor | bluemorpholimited (Blue Morpho Limited, Hong Kong) |
| Fecha de publicacion | 2026-09-23 (creado y actualizado el mismo dia) |
| Descargas / likes | 0 / 0 |
| Tamano del repositorio | 0,0 GB |
| Archivos | `qwen_image21_molab.py` (19 celdas), `previews/verify_tiger.jpg` |

## Arquitectura y entrenamiento

No se proporciona informacion sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO, porque este repositorio no documenta el modelo base, solo su ejecucion. Lo unico deducible del material disponible es que se trata de un modelo de difusion texto a imagen servido por la clase `QwenImage21Pipeline` de diffusers, con un autoencoder KL especifico (`AutoencoderKLQwenImage21`) que no existe en la version estable de la libreria y obliga a instalar desde el repositorio Git de Hugging Face.

La innovacion tecnica documentada no esta en el modelo sino en el procedimiento de puesta en marcha. El cuaderno detalla siete incidencias verificadas: dependencia de la rama `main` de diffusers, necesidad de purgar modulos en kernels activos antes de reimportar, uso obligatorio de `true_cfg_scale` como argumento de CFG (que solo se activa si se define un `negative_prompt`), restriccion de resoluciones a multiplos de 32 con maximo de 2048 px, conversion obligatoria de RGBA a RGB para JPEG y las reglas de grafo de marimo (una sola definicion por nombre publico y uso de argumentos de palabra clave en los widgets). Los pesos se mantienen residentes en VRAM entre celdas y persisten en la cache de Hugging Face tras un reinicio de kernel, lo que hace que la recarga sea rapida.

## Capacidades

- Generacion de imagenes texto a imagen de alta resolucion, con configuraciones verificadas de 1024², 1344² y 1792² píxeles, y borde maximo soportado de 2048 px.
- Control fino del muestreo: numero de pasos, escala CFG real (`true_cfg_scale`), semilla y prompt negativo.
- Ejecucion completamente local, sin clave de API ni llamadas a servicios en la nube, con descarga de pesos de aproximadamente 33 GB en la primera ejecucion.
- Integracion en cuadernos reactivos marimo con widgets de prompt, seleccion de tamano y boton de descarga del resultado.
- Ruta alternativa contra la API alojada de MiniMax, activable con la variable de entorno `MINIMAX_API_KEY`, util cuando no se dispone de GPU grande.
- No se documentan capacidades de edicion de imagen, inpainting, control por pose o profundidad, vision, audio, tool calling ni razonamiento multi-paso.

## Casos de uso

- Exploracion de conceptos visuales en un cuaderno reproducible: un disenador puede fijar semilla, resolucion y CFG, iterar prompts y regenerar en unos 10 segundos por pieza a 1344², manteniendo el historial completo en celdas versionadas.
- Generacion de ilustracion editorial en calidad final: la configuracion de 1792² con 28 pasos y CFG 7.0 produce material imprimible en aproximadamente 52 segundos por imagen sobre RTX PRO 6000, un coste asumible para tiradas cortas.
- Creacion de assets de marketing y redes sociales por lotes: modificando solo el prompt en la celda de generacion, el modelo residente en VRAM evita recargar 33 GB de pesos entre ejecuciones, lo que reduce el coste marginal por imagen.
- Validacion de hardware Blackwell en entornos de I+D: el cuaderno sirve como prueba de humo para comprobar que un nodo con 96 GB de VRAM, Python 3.13 y torch cu128/cu130 funciona correctamente con modelos de difusion de gran tamano.
- Docencia y formacion tecnica: al listar cada error real y su solucion, es material directo para ensenar las diferencias entre versiones de diffusers, la gestion de kernels y las restricciones de formato de imagen.
- Enrutado hibrido local/nube: las celdas de MiniMax permiten comparar en el mismo cuaderno la ruta local (sin coste por llamada, con requisito de 96 GB de VRAM) frente a la ruta gestionada, y decidir la estrategia de produccion segun la carga.
- Pruebas de integracion continua del propio ecosistema diffusers: ejecutar el cuaderno de arriba abajo contra la rama `main` detecta rupturas de API como el cambio de nombre del argumento de CFG antes de que lleguen a produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (FID, CLIP score, GenEval, MMLU u otros) en la informacion disponible. La model card si aporta tiempos de generacion verificados en una RTX PRO 6000 con 96 GB, que se reproducen a continuacion tal cual:

| Pieza | Resolucion | Pasos | Tiempo |
|---|---|---|---|
| Tiger verify (salida de celda) | 1024×1024 | 16 | ~4 s |
| Pink elephant executive | 1344×1344 | 24 | ~10 s |
| Tiger executive | 1344×1344 | 24 | ~10 s |
| Sunset portrait | 1792×1792 | 28 | ~52 s |

Parametros de muestreo recomendados por el autor: punto de partida en 1344×1344, 24 pasos y `true_cfg_scale` 4.0; piezas finales en 1792×1792, 28 pasos y CFG 7.0.

## Requisitos de hardware

- VRAM: aproximadamente 32 GB residentes solo para los pesos en bf16, mas margen para resolver 1792². La model card especifica una GPU de ~96 GB de VRAM para la ruta local.
- GPU verificada: NVIDIA RTX PRO 6000 Blackwell de 96 GB, unica configuracion con ejecucion confirmada.
- GPU de consumo: no cabe en una RTX 4090 (24 GB). En una RTX 5090 de 32 GB los pesos irian al limite de la VRAM y no hay verificacion publicada en esta informacion.
- Almacenamiento: cerca de 40 GB de disco para los pesos en la primera descarga, despues en cache de Hugging Face.
- Software: Python 3.13, torch cu128 o cu130 con CUDA, diffusers instalado desde `git+https://github.com/huggingface/diffusers.git`, mas transformers, accelerate, safetensors y pillow.
- Opciones de despliegue: diffusers sobre cuaderno marimo en Molab (ruta verificada) o la API alojada de MiniMax como alternativa. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que ademas no son aplicables a un pipeline de difusion de este tipo.
- Rendimiento observado: 4 s por imagen a 1024² y 16 pasos; 10 s a 1344² y 24 pasos; 52 s a 1792² y 28 pasos.

## Comparativa con modelos similares

Los datos de la columna propia proceden de la informacion proporcionada. Los datos de las alternativas proceden de conocimiento general del sector y no han podido verificarse con la busqueda web disponible (que no devolvio resultados relevantes); deben confirmarse antes de tomar decisiones.

| Modelo | Parametros | Resolucion / contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen-Image-2.1 (via este cuaderno) | no disponible; ~33 GB en bf16 | Hasta 2048 px de borde, multiplos de 32 | Pesos: la del repositorio Qwen; cuaderno: Apache-2.0 | Hugging Face, requiere diffusers rama `main` |
| Qwen-Image (version anterior) | ~20 000 millones (referencia general, no verificada) | no disponible | Apache-2.0 (referencia general) | Hugging Face |
| FLUX.1-dev | ~12 000 millones (referencia general, no verificada) | no disponible | No comercial (referencia general) | Hugging Face |
| Stable Diffusion 3.5 Large | ~8 000 millones (referencia general, no verificada) | no disponible | Licencia comunitaria de Stability AI (referencia general) | Hugging Face |

Nota metodologica: la comparativa de rendimiento entre estas alternativas no puede establecerse con la informacion disponible, porque no hay benchmarks de calidad publicados para Qwen-Image-2.1 en el material proporcionado y las condiciones de medida de los tiempos mostrados (RTX PRO 6000, 96 GB) no son comparables con las de otros entornos.

## Limitaciones y advertencias

- El repositorio no contiene los pesos: sin acceso a `Qwen/Qwen-Image-2.1` el cuaderno no es funcional por si solo.
- El requisito de ~96 GB de VRAM excluye cualquier GPU de consumo y limita el uso a nodos profesionales o instancias cloud con ese perfil.
- Dependencia de la rama `main` de diffusers: la release estable 0.40.0 falla con `No module named AutoencoderKLQwenImage21`. Cualquier cambio futuro en la API puede romper el cuaderno.
- El argumento de CFG es `true_cfg_scale`; usar `guidance_scale` lanza `TypeError`. Ademas, el CFG solo se aplica si se define un `negative_prompt`.
- Limitacion de resolucion: tamanos multiplos de 32 y borde maximo de 2048 px. Resoluciones fuera de esa rejilla no estan soportadas por el pipeline.
- La salida del pipeline es RGBA; exportar a JPEG sin convertir a RGB provoca error.
- No se declaran idiomas soportados ni sesgos conocidos, riesgo de alucinacion visual, ni comportamiento sobre contenido sensible. No hay evaluacion de sesgos disponible.
- Riesgo de reproducibilidad: el repositorio no especifica la revision exacta de los pesos ni la version de diffusers usada, solo la rama, por lo que los resultados pueden variar con el tiempo.
- La licencia Apache-2.0 cubre el cuaderno de Blue Morpho Limited, no los pesos. El propio autor remite a la licencia de `Qwen/Qwen-Image-2.1` para el uso comercial, que no se detalla en la informacion disponible.
- Validacion limitada: 0 descargas y 0 likes. La verificacion se limita al autor y a una unica GPU, sin replicacion independiente.
- La fecha de creacion declarada (2026-09-23) y el tamano de repositorio de 0,0 GB son los datos publicados por Hugging Face; conviene contrastarlos con la pagina del repositorio.
- No hay soporte documentado de tool calling, agentes, edicion de imagen ni control estructural (pose, profundidad, inpainting).
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo (solo enlaces a servicios de correo), por lo que no ha sido posible triangular la informacion con fuentes externas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/bluemorpholimited/qwen_image2.1_molab
- Pesos del modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio de diffusers (rama `main`): https://github.com/huggingface/diffusers
- Documentacion de marimo: https://marimo.io
- Plataforma Molab: https://molab.marimo.io
- Paper, blog o demo oficial de Qwen-Image-2.1: no disponible en la informacion proporcionada.
- Nota: la busqueda web ejecutada no devolvio enlaces utiles, unicamente resultados de servicios de correo electronico, por lo que no se han podido anadir fuentes adicionales verificadas.
