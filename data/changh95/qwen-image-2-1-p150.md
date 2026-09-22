# changh95/qwen-image-2.1-p150

## Resumen

qwen-image-2.1-p150 no es un modelo entrenado desde cero, sino un portado de inferencia completo de Qwen-Image-2.1 (el modelo de difusion texto-a-imagen de Alibaba Qwen) para ejecutarse sobre un unico acelerador Tenstorrent Blackhole p150a mediante la pila tt-nn / tt-metal. El paquete lo publica el usuario changh95 y empaqueta los tres submodelos del pipeline (un DiT single-stream de 7B, un codificador de texto Qwen3-VL de 8B y un VAE RGBA de 64 canales) dentro del chip, con la denoising de 40 pasos capturada como una unica metal trace.

La relevancia es de despliegue, no de calidad de generacion: demuestra que un pipeline de difusion de ~15B parametros puede servirse en hardware no-GPU con un rendimiento end-to-end competitivo. Segun los datos del autor, el sistema genera una imagen de 1024x1024 en 21,1 s en caliente, frente a 28,8-33,0 s del mismo pipeline en bf16 con diffusers sobre una RTX 5090 (que necesita offload a CPU porque el codificador de texto y el DiT no caben juntos en 32 GB).

La publicacion es experimental y de nicho: 0 descargas y 0 likes en el momento de la consulta, fecha de creacion 22-09-2026, y el commit exacto de tt-metal con el que se construyo la imagen no esta publicado. Los pesos no se redistribuyen: se descargan del repositorio oficial Qwen/Qwen-Image-2.1 bajo licencia Qwen Research (uso de investigacion).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) single-stream de 7B + codificador de texto Qwen3-VL de 8B + VAE RGBA de 64 canales; los tres submodelos en el chip |
| Parametros totales | ~15B en el pipeline (7B DiT + 8B text encoder; VAE no cuantificado en la informacion disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; el prefijo de texto se rellena a un multiplo de tile y solo se valido con un prompt de 34 tokens |
| Tipos de cuantizacion | Pesos del text encoder en bfp8_b; pesos del DiT en bf16 con matmuls LoFi (HiFi2 seleccionable via `DiTPrecision`) y acumulacion fp32; atencion HiFi2; normas con acumulacion fp32 |
| Idiomas soportados | no disponible (el autor no los documenta; el prompt de demo esta en ingles) |
| Licencia | qwen-research (Qwen Research License, uso de investigacion) para los pesos; el codigo de portado y servido (`code/`) es Apache-2.0 |
| Formato de pesos | no disponible (los pesos se descargan de Qwen/Qwen-Image-2.1 en el commit `790c92633540aa0cb11d9abf19eb46d861714758`; no se redistribuyen en este repositorio) |
| Resolucion de salida | 1024x1024 PNG (RGB compuesto sobre blanco, o RGBA con `return_rgba`), configurable via `QWEN_IMAGE_SIZE` |
| Tamano de lote | 1 |
| Pasos de denoising | 40 por defecto, rango 1-100 via `num_steps` |
| Guiado (CFG) | no soportado (el modelo esta pensado para muestrearse sin classifier-free guidance) |
| Plataforma de destino | Tenstorrent Blackhole p150a (mesh `P150`), 120 nucleos Tensix en computo |
| Formato de despliegue | Contenedor Docker gestionado por tt-model-manager 0.1.0 (manifest schema 5.1); servidor HTTP propio en el puerto 20000 |
| Modelo base | Qwen/Qwen-Image-2.1 |
| Tamano del repositorio | 3,1 GB (codigo de portado y material de demo; sin pesos) |
| Fecha de publicacion | 2026-09-22 |

## Arquitectura y entrenamiento

El pipeline es el de Qwen-Image-2.1 sin cambios de arquitectura: un DiT single-stream de 7B que realiza la denoising, un codificador de texto Qwen3-VL de 8B que produce los estados ocultos y el prefijo K/V de atencion, y un VAE de 64 canales que decodifica los latentes a RGBA. Este repositorio no entrena nada: aporta el portado a tt-nn/tt-metal y la capa de servido. La innovacion tecnica esta en la ejecucion: los 40 pasos de denoising se capturan como una unica metal trace, el prefijo de texto y su K/V se calculan una sola vez por prompt (~0,2 s en caliente) y el VAE se decodifica tambien como metal trace (0,76 s por imagen de 1024x1024). El reparto de trabajo usa los nucleos Ethernet ociosos para el dispatch (PRs de tt-metal #57142 y #53988), de modo que los 120 nucleos Tensix quedan disponibles para computo; con `QWEN_IMAGE_ETH_DISPATCH=0` se cae a dispatch por Tensix y solo 110 nucleos computan. La politica de precision combina bfp8_b en los pesos del text encoder, bf16 con matmuls LoFi en el DiT (HiFi2 opcional) y acumulacion fp32 en normas; el modo LoFi cuesta ~0,002 PCC sobre los latentes finales y ahorra un 19 % de tiempo.

No hay informacion en la documentacion proporcionada sobre el dataset de entrenamiento, el numero de tokens, la composicion de datos ni si hubo RLHF o DPO: esos detalles pertenecen al modelo base Qwen/Qwen-Image-2.1 y no se reproducen aqui. Tampoco se publica el commit de tt-metal usado para construir la imagen (procedencia incompleta), aunque si el digest sha256 del codigo de portado (`e92670f52548b94d`, primeros 16 digitos hexadecimales) y la marca de construccion 2026-09-22T00:22:41+00:00 por tt-model 0.1.0.

## Capacidades

- Generacion de imagenes texto-a-imagen a 1024x1024 en un unico paso de peticion, sin imagenes de condicionamiento.
- Fidelidad numerica alta respecto a la referencia en GPU: PCC 0,998 en los estados ocultos del text encoder (pesos bfp8) y PCC 0,9998 en la velocidad de un paso del DiT frente a diffusers bf16.
- Coherencia del resultado final: PCC 0,995 en los latentes tras 40 pasos de la cadena completa en chip frente a diffusers bf16 en GPU.
- Control de semilla (`seed`, por defecto 42) y del numero de pasos (`num_steps`, 1-100), lo que permite reproducibilidad y ajuste calidad/tiempo.
- Salida RGB compuesta sobre blanco o RGBA cuando se solicita `return_rgba`.
- Servicio HTTP con `POST /predict`, mas endpoints de operacion `GET /health` y `GET /info` (dispositivo, grid de workers, politica de precision) y `GET /v1/models` como stub.
- No soporta edicion de imagen, imagenes de condicionamiento, lotes mayores de 1, resoluciones distintas de la configurada ni classifier-free guidance.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo generativo de imagen, no un LLM conversacional.
- No hay datos de capacidades multilingues del prompt en la informacion disponible.

## Casos de uso

- Generacion de ilustraciones por lotes en investigación: con 21,1 s por imagen en caliente y un unico servidor HTTP, se pueden producir series de imagenes con semillas fijas para estudios de reproducibilidad o comparativas de cuantizacion sin depender de GPU.
- Evaluacion de hardware alternativo: el paquete sirve para medir el rendimiento real de un pipeline de difusion de ~15B en un Blackhole p150a con TDP limitado a 150 W, comparandolo con una RTX 5090 en el mismo host (1,4-1,6x mas rapido end-to-end, 1,35x mas lento por paso).
- Prototipado de producto de imagen generativa en entornos sin GPU: el endpoint `/predict` devuelve un PNG en base64 y `timing_ms`, suficiente para integrarlo en un backend interno o en un panel de pruebas.
- Validacion de portados a tt-metal: el codigo de portado (`code/models/experimental/qwen_image_2_1`) y el digest publicado permiten auditar la fidelidad numerica frente a la referencia en diffusers antes de adoptar la pila.
- Demostraciones y material divulgativo: al ser una imagen Docker autocontenida con `tt-model pull --with-weights` y `tt-model serve`, sirve para exhibir inferencia de difusion en aceleradores Tenstorrent sin montar un entorno manual.
- Investigación sobre cuantizacion en aceleradores: la comparacion LoFi frente a HiFi2 (0,002 PCC de coste, 19 % de ahorro de tiempo) ofrece un punto de partida medible para estudiar politicas de precision mixta.
- Referencia de despliegue con tt-model-manager: el manifest schema 5.1 y el flujo `tt serve` / `tt model stop` documentan el ciclo de vida completo de un modelo en este ecosistema.
- Generacion de imagenes para conjuntos de datos sinteticos a pequena escala, con semilla y numero de pasos fijados para trazabilidad, siempre dentro de los limites de la licencia de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar de calidad de imagen (FID, CLIP score, GenEval u otros) en la informacion disponible. El autor publica metricas de fidelidad numerica y de velocidad, que se recogen a continuacion.

| Metrica | Valor |
|---|---|
| Estados ocultos del text encoder frente a transformers (pesos bfp8) | PCC 0,998 |
| Velocidad de un paso del DiT frente a diffusers bf16 | PCC 0,9998 |
| Latentes finales tras 40 pasos, cadena completa en chip frente a diffusers bf16 en GPU | PCC 0,995 |
| Denoising, 40 pasos como una unica metal trace (pesos bf16, matmuls LoFi, atencion HiFi2) | 20,5 s = 513 ms/paso sostenidos (499 ms a 1350 MHz; la placa esta limitada a 150 W de TDP y se estabiliza en ~930 MHz) |
| Text encode + prefijo K/V de texto (una vez por prompt) | ~0,2 s en caliente |
| Decodificacion VAE 1024x1024 RGBA (metal trace) | 0,76 s |
| Extremo a extremo por imagen (caliente, `demo/demo.py --repeat 2`) | 21,1 s (+0,2 s si el prompt es nuevo) |
| Mismo pipeline en diffusers bf16 sobre RTX 5090 en el mismo host (eager, con model CPU offload porque los dos modelos no caben en 32 GB) | 377-387 ms/paso; 28,8-33,0 s extremo a extremo |
| Comparativa derivada | p150a 1,4-1,6x mas rapido end-to-end; 1,35x mas lento por paso |

Las cifras de fidelidad corresponden a un unico prompt de demo de 34 tokens ("White furry llama with black sunglasses, smiling and happy, jumping", seed 42, 40 pasos, 1024x1024) comparado con `media/reference_rtx5090.png`, la referencia en bf16 sobre RTX 5090.

## Requisitos de hardware

- Plataforma de ejecucion: una tarjeta Tenstorrent Blackhole p150a (mesh `P150`). No es un modelo que se ejecute en GPU de consumo de forma directa con este paquete.
- VRAM en GPU: no aplica para este portado. Como referencia del modelo base, en una RTX 5090 (32 GB) el pipeline en bf16 con diffusers no cabe completo y exige model CPU offload, lo que arroja 377-387 ms por paso.
- Consumo y reloj: el board esta limitado a 150 W de TDP y se estabiliza alrededor de 930 MHz; a 1350 MHz el paso de denoising baja a 499 ms.
- GPU recomendadas alternativas: no disponibles en la informacion proporcionada (la unica referencia medida es la RTX 5090 con diffusers bf16).
- Cabe en GPU de consumo: no con este paquete (requiere hardware Tenstorrent). El modelo base en GPU necesita offload en tarjetas de 32 GB.
- Despliegue: contenedor Docker gestionado con tt-model-manager 0.1.0; `tt-model pull changh95/qwen-image-2.1-p150 --with-weights` y `tt-model serve changh95/qwen-image-2.1-p150`, o `tt serve` con tt-cli. El servidor escucha en el puerto 20000 (o el siguiente libre).
- Compilacion inicial: el primer arranque compila kernels y captura las metal traces con una generacion de calentamiento; tarda varios minutos y el servidor esta listo cuando registra `Application startup complete`.
- Latencia y throughput: 21,1 s por imagen de 1024x1024 en caliente (+0,2 s por prompt nuevo), 513 ms por paso de denoising, 0,76 s de decodificacion VAE y ~0,2 s de codificacion de texto. Lote de 1, sin paralelismo de peticiones documentado.
- Alternativas de servido tipo vLLM, llama.cpp, Ollama o TGI: no aplicables ni documentadas para este portado; la API no es compatible con OpenAI y `GET /v1/models` es solo un stub para sondas de disponibilidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Rendimiento medido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-image-2.1-p150 (este) | ~15B en pipeline (7B DiT + 8B text encoder) | 1024x1024, prefijo de texto sin limite documentado | 21,1 s/imagen; 513 ms/paso en un Blackhole p150a | qwen-research (pesos); Apache-2.0 (codigo de portado) | HuggingFace, contenedor via tt-model-manager |
| Qwen-Image-2.1 + diffusers bf16 en RTX 5090 | mismo pipeline | 1024x1024 | 377-387 ms/paso; 28,8-33,0 s/imagen; requiere CPU offload en 32 GB | qwen-research | Repositorio oficial Qwen/Qwen-Image-2.1 |
| Otras alternativas de generacion texto-a-imagen o de portado a aceleradores | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a las dos configuraciones medidas por el autor. No hay datos en la informacion proporcionada sobre otros modelos de la misma categoria (por ejemplo, familias Flux o Stable Diffusion) ni sobre otros portados a hardware Tenstorrent, por lo que no se incluyen cifras que no se puedan verificar.

## Limitaciones y advertencias

- Solo texto-a-imagen: no admite imagenes de condicionamiento ni edicion, pese a que el modelo base si contempla edicion.
- Lote fijo de 1 y resolucion fija de 1024x1024 (`QWEN_IMAGE_SIZE`); no hay soporte documentado de otras resoluciones ni de procesamiento por lotes.
- Sin classifier-free guidance: no se pueden usar escalas de guiado ni prompts negativos en este portado; el modelo esta pensado para muestrearse sin CFG.
- Solo se ha validado con un prompt de demo de 34 tokens. En teoria cualquier longitud funciona (el prefijo de texto se rellena a un multiplo de tile), pero no hay pruebas publicadas con prompts largos.
- API no compatible con OpenAI; `GET /v1/models` es un stub para que la sonda de disponibilidad de tt-model no devuelva 404. Integrarlo en herramientas que esperen la API de OpenAI requiere un adaptador.
- Licencia Qwen Research: uso de investigacion. Los pesos no se redistribuyen en este repositorio y su uso comercial queda restringido por la licencia del repositorio de pesos de Qwen. Solo el codigo de portado y servido (`code/`) es Apache-2.0.
- Procedencia incompleta: la imagen se construyo desde un checkout local de tt-metal cuyo commit no se publica, lo que dificulta la reproducibilidad exacta. Solo se documenta el digest sha256 del codigo de portado.
- Requiere hardware Tenstorrent Blackhole p150a; no es desplegable en GPU, CPU ni en otras tarjetas sin un portado adicional.
- Madurez baja: 0 descargas y 0 likes, publicacion reciente, y la ruta del codigo (`code/models/experimental/qwen_image_2_1`) indica caracter experimental.
- Riesgo de alucinacion visual inherente a los modelos generativos de imagen: fidelidad numerica alta respecto a la referencia en GPU no garantiza correccion semantica del contenido generado.
- Sesgos del modelo base (representacion de personas, culturas y estilos) no documentados en la informacion disponible; deben asumirse los del modelo Qwen-Image-2.1.
- Idiomas del prompt no documentados: solo hay evidencia de un prompt en ingles.
- El primer arranque tarda varios minutos en compilar kernels y capturar traces; en produccion conviene mantener el servidor caliente y prever el coste de un prompt nuevo (~0,2 s adicionales).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/changh95/qwen-image-2.1-p150
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Licencia de los pesos: https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Codigo de portado dentro del repositorio: `code/models/experimental/qwen_image_2_1`
- PRs de tt-metal citados por el autor: #57142 y #53988 (dispatch en nucleos Ethernet)
- Busqueda web: no se han encontrado resultados relevantes para este modelo; los enlaces devueltos por la busqueda corresponden a concesionarios de automocion y no guardan relacion con el contenido de la ficha.
