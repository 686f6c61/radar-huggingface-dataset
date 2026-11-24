# GD-ML/plan4d

## Resumen

Plan4D es un modelo generativo de mundos en cuatro dimensiones (3D espacial mas tiempo) desarrollado por GD-ML (con codigo alojado en la organizacion AMAP-ML). A partir de una escena observada y una accion descrita en lenguaje natural, el modelo genera un video del futuro previsible junto con una representacion geometrica dinamica y coherente de la escena. El sistema combina un generador de video (un transformer de difusion, DiT) con un decodificador de geometria, ambos compartiendo la misma trayectoria latente, de modo que la salida RGB, la profundidad, los parametros de camara, las nubes de puntos y el flujo de escena quedan sincronizados.

El repositorio de Hugging Face no contiene un modelo unico y autonomo, sino dos checkpoints complementarios: `Stitched_Decoder.pth` (proyeccion latente a tokens, parametros del decodificador de geometria DA3, cabeza de flujo de escena y tokens especiales) y `VDM_LoRA.safetensors` (un LoRA de rango 32 sobre el DiT de video LongCat). Requiere pesos upstream adicionales (LongCat-Video, Depth Anything 3 y el VAE de Wan 2.1) que no se incluyen en este repositorio.

Es relevante por su enfoque de generacion conjunta de video y geometria 4D condicionada por acciones textuales, una linea de investigacion orientada a simulacion, robotica y planificacion visual. La informacion publica disponible sobre arquitectura interna, tamano de parametros y contexto es limitada; el repositorio ocupa 10,7 GB y la licencia de los checkpoints es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: DiT de video (LongCat) con LoRA + decodificador de geometria DA3, unidos por trayectoria latente compartida |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (checkpoints); pesos upstream sujetos a sus propias licencias |
| Formato de pesos | `.pth` (Stitched_Decoder) y `.safetensors` (VDM_LoRA, LoRA rango 32) |

## Arquitectura y entrenamiento

Plan4D acopla dos componentes sobre una representacion latente comun. Por un lado, un generador de video basado en el DiT LongCat-Video, ajustado mediante un LoRA de rango 32 (`VDM_LoRA.safetensors`). Por otro, un decodificador de geometria construido sobre Depth Anything 3 en su variante `DA3NESTED-GIANT-LARGE`, con una proyeccion de latente a tokens, una cabeza de flujo de escena entrenada y tokens especiales (`Stitched_Decoder.pth`). La innovacion central es que ambos modulos comparten la misma trayectoria latente: el video generado y la geometria (profundidad, camara, nubes de puntos, flujo de escena) se producen de forma sincronizada a partir de la misma condicion de escena y accion textual.

Los pesos publicados son de inferencia y fine-tuning, no checkpoints con estado del optimizador para reanudar entrenamiento exacto. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se empleo RLHF o DPO. El pipeline completo requiere descargar por separado el DiT base LongCat-Video, el codificador de texto y tokenizer, el VAE de Wan 2.1 y el bundle preentrenado de Depth Anything 3.

## Capacidades

- Generacion de video futuro condicionada por una accion descrita en texto a partir de una escena observada.
- Generacion conjunta de geometria 4D: profundidad, parametros de camara, nubes de puntos y flujo de escena.
- Sincronizacion entre modalidad RGB y modalidad geometrica mediante trayectoria latente compartida.
- Reconstruccion "stitched" de escena usando el decodificador de geometria.
- Carga de la cabeza de flujo de escena del decodificador en un DA3 sin procesar (segun la model card).
- Capacidades de lenguaje, tool calling, agentes o razonamiento multi-paso: no disponible (el modelo no es un LLM de texto).
- Capacidades multilingues, de audio o de thinking mode: no disponible.

## Casos de uso

- Simulacion de entornos para robotica: dado un plano de escena y una accion ("avanzar 2 metros y girar a la izquierda"), generar el video y la geometria 4D resultantes para entrenar o validar politicas de navegacion en simulador.
- Planificacion visual en conduccion autonoma: predecir la evolucion de una escena de trafico ante una maniobra descrita y obtener profundidad y flujo de escena coherentes para evaluar riesgos.
- Generacion de datos sinteticos etiquetados: producir pares video-geometria con ground truth de profundidad y camara para aumentar datasets de percepcion 3D.
- Prototipado de videojuegos y experiencias inmersivas: generar transiciones de escena dinamicas en 3D a partir de acciones textuales del jugador.
- Reconstruccion y edicion de escenas: usar el decodificador "stitched" para obtener nubes de puntos y camaras de una escena observada y proyectar cambios descritos en texto.
- Investigacion en world models: servir como banco de pruebas para estudiar coherencia espacio-temporal entre video generado y geometria, aprovechando la trayectoria latente compartida.
- Previsualizacion de efectos y motion graphics: generar un clip corto con profundidad y flujo de escena para composicion posterior en herramientas 3D.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio ocupa 10,7 GB, pero el pipeline completo requiere ademas LongCat-Video, Depth Anything 3 (`DA3NESTED-GIANT-LARGE`) y el VAE de Wan 2.1, lo que eleva sustancialmente el consumo.
- GPU recomendadas: no disponible. Por el tamano de los componentes upstream (DiT de video y decodificador "giant"), es previsible que requiera GPU de datacenter, aunque el dato no esta confirmado en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: inferencia mediante el codigo del repositorio de GitHub (AMAP-ML/plan4d). Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible (no aplica a este tipo de modelo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Plan4D | Generacion de video + geometria 4D | no disponible | no disponible | Apache 2.0 (checkpoints) | Checkpoints en HF + codigo en GitHub |
| LongCat-Video | DiT de generacion de video (base de Plan4D) | no disponible | no disponible | segun su propia licencia | HF (meituan-longcat/LongCat-Video) |
| Depth Anything 3 | Modelo de geometria/profundidad (base de Plan4D) | no disponible | no disponible | segun su propia licencia | GitHub (ByteDance-Seed/Depth-Anything-3) |

No se dispone de datos de rendimiento ni de parametros para establecer una comparacion cuantitativa con alternativas de la misma categoria. Los modelos listados son los componentes upstream de los que depende Plan4D, no alternativas equivalentes de generacion de mundos 4D.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere descargar y configurar pesos upstream (LongCat-Video, Depth Anything 3, VAE de Wan 2.1) con el layout exacto indicado en el repositorio de codigo.
- Los checkpoints son de inferencia y fine-tuning; no permiten reanudar un entrenamiento exacto (sin estado del optimizador).
- No se documentan sesgos, tasas de alucinacion ni limitaciones de idioma en la informacion disponible.
- La licencia Apache 2.0 cubre solo los checkpoints de Plan4D; los pesos upstream conservan sus propias licencias, que deben revisarse para uso comercial.
- No hay informacion sobre resolucion de video, duracion de los clips generados ni limites de la ventana temporal.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que sugiere escasa validacion por parte de la comunidad.
- Al ser un modelo de generacion de video y geometria, los resultados son inherentemente estocasticos; la coherencia fisica de las predicciones no esta garantizada sin validacion adicional.

## Enlaces

- Hugging Face: https://huggingface.co/GD-ML/plan4d
- Paper (arXiv): https://arxiv.org/abs/2611.26516
- Pagina del proyecto: https://fogradio.github.io/plan4d-project/
- Codigo (GitHub): https://github.com/AMAP-ML/plan4d
- LongCat-Video (upstream): https://huggingface.co/meituan-longcat/LongCat-Video
- Depth Anything 3 (upstream): https://github.com/ByteDance-Seed/Depth-Anything-3
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
