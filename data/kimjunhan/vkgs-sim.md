# kimjunhan/vkgs-sim

## Resumen
vkgs-sim es un simulador de conduccion closed-loop basado en Vulkan y 3D Gaussian Splatting (3DGS), construido sobre el mapa de Singapur del dataset nuScenes. No es un modelo de lenguaje ni un modelo de vision-lenguaje-accion (VLA): es una infraestructura de evaluacion que permite a modelos VLM/VLA observar seis imagenes de camara, emitir ordenes de direccion y aceleracion, y recibir nuevas observaciones renderizadas desde la nueva pose del vehiculo. A diferencia de la evaluacion open-loop, que reproduce logs originales, aqui la accion del modelo modifica la siguiente observacion.

El proyecto lo desarrolla el usuario kimjunhan y se encuentra en fase temprana de desarrollo. La etapa 0 (entorno local con CUDA, Vulkan y PyTorch, capa de datos nuScenes) esta completada y validada; la etapa 1 (reconstruccion 3DGS con inicializacion LiDAR y entrenamiento con gsplat) ha superado la linea base diurna con un PSNR estatico de 25,62 dB en la escena scene-0003, mientras que las condiciones nocturnas y de lluvia siguen sin resolver; la etapa 2 (renderizador Vulkan) tiene completada la ruta de billboard, con una coincidencia de 56 dB frente a gsplat; y la etapa 3 (entorno closed-loop y puente VLA) no se ha iniciado.

El interes actual del proyecto radica en que aborda un cuello de botella concreto en la evaluacion de modelos de conduccion autonoma: la falta de simuladores ligeros, reproducibles y ejecutables en hardware de consumo que permitan probar politicas de forma interactiva. Su restriccion de diseno mas visible es una GPU RTX 3060 Ti de 8 GB, lo que condiciona tanto el numero de gaussianas como la resolucion y la frecuencia de renderizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo neuronal; simulador con renderizador 3D Gaussian Splatting sobre Vulkan y capa de datos en Python |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (documentacion y codigo en coreano e ingles) |
| Licencia | no disponible |
| Formato de pesos | no disponible; el repositorio contiene codigo fuente, scripts y artefactos derivados (indice de escenas en JSON/JSON.GZ) |

## Arquitectura y entrenamiento
El sistema se compone de cuatro capas. La primera es una capa de datos (`src/nusim/`) que indexa el dataset nuScenes v1.0-trainval mediante un parser de streaming (`nusim.io.jsonstream`), capaz de recorrer `sample_data.json` (2,63 millones de filas) con un pico de RSS de 30 MB. El indice resultante cubre 383 escenas de Singapur (singapore-onenorth 183, singapore-queenstown 115, singapore-hollandvillage 85), con 532.157 imagenes de seis camaras a aproximadamente 12 Hz durante 20 segundos por escena. La construccion del indice tarda 35,8 s con un pico de 0,51 GB de memoria y genera 35 MB; cargar una escena individual cuesta 7 ms.

La segunda capa es la reconstruccion 3DGS: inicializacion a partir de LiDAR y entrenamiento con gsplat 1.4.0 sobre CUDA 12.1 y PyTorch 2.4.1. La tercera es el renderizador en C++/Vulkan (`src/vkgs/`), actualmente con la ruta de billboard operativa y una ruta de compute tiles pendiente; el binario `vkgs_probe` valida la cadena Vulkan en el dispositivo real. La cuarta capa, aun no iniciada, integraria el bucle closed-loop con integracion del estado ego mediante modelo de bicicleta y restricciones del grafo de carriles de Singapur, mas el puente hacia modelos VLA. No se documenta entrenamiento de ningun modelo neuronal propio ni uso de RLHF/DPO.

## Capacidades
- Renderizado de seis camaras a 1600x900 por paso de simulacion (8,6 Mpixel por fotograma), con reconstruccion 3DGS de escenas de Singapur.
- Simulacion closed-loop: la accion del modelo (direccion y aceleracion) se integra en el estado ego y genera nuevas observaciones renderizadas.
- Integracion del estado ego mediante modelo de bicicleta y restriccion por el grafo de carriles del mapa de Singapur.
- Indexado y consulta rapida del dataset nuScenes: busqueda por escena, filtrado por condiciones (por ejemplo, lluvia) y visualizacion de la configuracion de camaras de una escena.
- Visor con superposicion de mapa (map overlay viewer) sobre la ruta de billboard.
- Herramientas de diagnostico de entorno (`vkgs-doctor`) que verifican CUDA, Vulkan, dataset e indice.
- Soporte de ejecucion local sin sudo mediante micromamba, y alternativa con Docker.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, tool calling ni agentes, al no tratarse de un modelo de lenguaje.

## Casos de uso
- Evaluacion closed-loop de modelos VLM/VLA de conduccion: el simulador permite cerrar el bucle accion-observacion, de modo que un modelo que emite direccion y aceleracion recibe imagenes renderizadas desde la nueva pose, algo que la reproduccion de logs no permite.
- Desarrollo de politicas de conduccion en escenarios urbanos de Singapur: las 383 escenas cubren distrito de negocios y campus de investigacion (onenorth), zonas residenciales y aparcamientos (queenstown) y condiciones nocturnas y de lluvia (hollandvillage), lo que permite estratificar la evaluacion por tipo de entorno.
- Investigacion en reconstruccion 3DGS aplicada a conduccion: la linea base documentada (PSNR 25,62 dB en scene-0003 en condiciones diurnas) sirve como punto de comparacion reproducible para nuevas tecnicas de reconstruccion con inicializacion LiDAR.
- Pruebas de renderizado en hardware de consumo: con una RTX 3060 Ti de 8 GB como objetivo de diseno, el proyecto sirve para medir que limites practicos tiene 3DGS en GPUs de gama media, con un techo estimado de unos 20 millones de gaussianas solo para renderizado en fp32.
- Benchmarking de latencia de renderizadores: la comparacion entre la ruta de billboard y la de compute tiles, con una coincidencia medida de 56 dB frente a gsplat en la ruta billboard, permite evaluar el coste y la fidelidad de cada estrategia.
- Prototipado rapido de pipelines de datos nuScenes: el indice precalculado (35 MB, carga de 7 ms por escena) evita el coste de 2-3 minutos y mas de 10 GB de RAM que impone `NuScenes()` del devkit, util para iterar en bucles de simulacion o reconstruccion.
- Validacion de entorno y portabilidad: `vkgs-doctor` y `vkgs_probe` permiten verificar una instalacion CUDA/Vulkan completa antes de lanzar experimentos, util en maquinas de laboratorio heterogeneas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks de modelos en la informacion disponible. Los unicos datos cuantitativos del proyecto son metricas internas del simulador:

| Metrica | Valor | Contexto |
|---|---|---|
| PSNR estatico (scene-0003, diurno) | 25,62 dB | Reconstruccion 3DGS con gsplat, linea base superada |
| Coincidencia renderizador Vulkan vs gsplat | 56 dB | Ruta billboard |
| Tiempo de construccion del indice | 35,8 s | RTX 3060 Ti, dataset sobre NFS |
| Pico de memoria en indexado | 0,51 GB | Incluye sample_data.json (1,35 GB) y ego_pose.json (645 MB) |
| Tamano del indice | 35 MB | 383 escenas |
| Tiempo de carga por escena | 7 ms | Desde el indice cacheado |
| Pico de RSS del parser de streaming | 30 MB | Sobre 2,63 millones de filas |
| Escenas nocturnas y de lluvia | sin resolver | Estado declarado por el autor |

## Comparativa con modelos similares
No disponible. La informacion proporcionada no incluye comparaciones con otros simuladores closed-loop ni con alternativas de renderizado 3DGS, y no se dispone de datos verificables sobre proyectos equivalentes en el material consultado.

## Limitaciones y advertencias
- Proyecto en desarrollo temprano: la etapa 3 (entorno closed-loop y puente VLA), que es el objetivo central del proyecto, no se ha iniciado; el repositorio no ofrece todavia un simulador closed-loop funcional.
- Cobertura geografica limitada: solo se tratan escenas de Singapur; las 467 escenas de boston-seaport quedan explicitamente fuera de alcance, lo que reduce la diversidad de entornos.
- Condiciones adversas sin resolver: la reconstruccion 3DGS no alcanza calidad en escenarios nocturnos y de lluvia, que se concentran en hollandvillage.
- Restriccion de hardware severa: la RTX 3060 Ti de 8 GB impone un techo de unas 20 millones de gaussianas en fp32 solo para renderizado, y un rango practico de 1 a 2 millones por escena para entrenamiento con downscale de imagen 2x.
- Frecuencia de renderizado: alcanzar 10 Hz con seis camaras a 1600x900 exige un rasterizador por tiles; la ruta billboard actual no lo consigue.
- Dependencia de datos externos: requiere nuScenes v1.0-trainval completo montado en una ruta concreta y en modo lectura, lo que condiciona la reproducibilidad fuera de ese entorno.
- Licencia no declarada: no se especifica licencia en la informacion disponible, por lo que el uso comercial no puede asumirse y debe verificarse con el autor.
- Sin senales de adopcion: cero descargas y cero likes en el momento de la consulta, y sin pipeline ni idiomas declarados en Hugging Face.
- Riesgo de alucinacion no aplicable al no ser un modelo generativo; el riesgo equivalente es la fidelidad del renderizado, ya cuantificada en las metricas anteriores.

## Enlaces
- Repositorio en Hugging Face: https://huggingface.co/kimjunhan/vkgs-sim
- Plan de desarrollo: docs/roadmap.md (referenciado en la model card, dentro del repositorio)
- Documentacion de arquitectura: docs/architecture.md (referenciado en la model card, dentro del repositorio)
- Dataset nuScenes: https://www.nuscenes.org (mencionado como dependencia de datos)
- gsplat: https://github.com/nerfstudio-project/gsplat (mencionado como dependencia, version 1.4.0)
