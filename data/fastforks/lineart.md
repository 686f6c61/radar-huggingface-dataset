# fastforks/lineart

## Resumen

`fastforks/lineart` es un preprocesador de deteccion de bordes y line-art para pipelines de ControlNet, empaquetado por el proyecto fastforks. No es un modelo generativo ni un LLM, sino un generador de dibujos lineales basado en el trabajo "informative-drawings" de Chan, Durand e Isola (CVPR 2022), que transforma una fotografia RGB en un mapa de lineas `[H, W]` en el rango [0, 1]. Se corresponde con el preprocesador `LineartDetector` de `controlnet_aux` y con el nodo "Realistic Lineart" de ComfyUI.

El repositorio es exclusivamente una model card: no aloja pesos. fastforks descarga los pesos originales de `lllyasviel/Annotators` y los verifica contra hashes SHA-256 registrados. Existen dos variantes: `lineart` (modelo realista, fichero `sk_model.pth`) y `lineart-coarse` (modelo grueso, fichero `sk_model2.pth`).

Su relevancia es practica: proporciona una implementacion portable y optimizada (fp16, `torch.compile`, TensorRT) de un preprocesador ampliamente usado en flujos de imagen-a-imagen con ControlNet, con mediciones de latencia y memoria publicadas y verificacion de paridad numerica frente al codigo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Generador convolucional (informative-drawings): 3 bloques residuales con instance norm |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | fp16 (por defecto en GPU), fp32 (CPU y referencia); no se documentan otras |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Codigo MIT; pesos sin licencia explicita del autor (MIT asumida a partir del codigo) |
| Formato de pesos | `.pth` (PyTorch), descargados de `lllyasviel/Annotators` |

## Arquitectura y entrenamiento

El modelo es un generador convolutional pequeno compuesto por tres bloques residuales con normalizacion de instancia, disenado para producir dibujos lineales a partir de fotografias. Segun la model card, el trabajo original (informative-drawings) entrena con fotografias y dibujos lineales no emparejados; no se especifica para estos checkpoints concretos el numero de tokens, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables a este tipo de modelo).

La innovacion del empaquetado fastforks no esta en la arquitectura, sino en la infraestructura: un backend "portable" en fp16 que reduce el tiempo de inferencia frente al codigo original, verificacion de paridad numerica (CPU fp32: max |diff| <= 0.002; GPU fp16: mean |diff| <= 0.02, p99 <= 0.25), y soporte de `torch.compile` y TensorRT. No se implementa backend de kernels personalizados porque, segun el autor, las convoluciones cuDNN y la instance norm dominan el tiempo y no se midio ninguna ganancia con kernels propios.

## Capacidades

- Deteccion de bordes y generacion de line-art: convierte una imagen RGB en un mapa `[H, W]` en [0, 1] a la resolucion de entrada.
- Dos variantes de estilo: `lineart` (realista) y `lineart-coarse` (gruesa).
- Salida compatible con preprocesadores de ControlNet (line art, HED, PiDiNet, TEED / Anyline; M-LSD tambien devuelve segmentos de linea recta).
- Entrada de cualquier tamano H x W >= 32, con padding a multiplo de 32.
- Ejecucion en CPU (fp32) y GPU (fp16) mediante el backend portable.
- Aceleracion opcional con `torch.compile` y TensorRT fp16.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente visual.

## Casos de uso

- Preprocesado para ControlNet en generacion de imagenes: se usa como paso previo que extrae el mapa de lineas de una foto de referencia, que luego condiciona el modelo de difusion para preservar la estructura en la imagen generada.
- Flujos de imagen-a-imagen en ComfyUI: se integra como nodo "Realistic Lineart" para workflows de restilizado que requieren mantener contornos reconocibles.
- Conversion de fotografias a dibujo lineal para ilustracion: genera directamente un line-art utilizable como base de entintado o coloreado posterior.
- Procesamiento por lotes de alta resolucion: con 18,3 ms por imagen a 1080x1920 en una RTX 5060 Ti, es adecuado para pipelines que procesan miles de imagenes en un tiempo acotado.
- Despliegue en produccion con TensorRT: a 1024x1024 alcanza 4,80 ms por imagen con un motor TensorRT fp16, apropiado para servicios interactivos de baja latencia.
- Extraccion de estructura para tareas de vision por computador: el mapa de bordes sirve como caracteristica de entrada en segmentacion, registro de imagenes o deteccion de contornos.
- Ejecucion en hardware modesto: con unos 222 MiB de memoria pico a 1080x1920, cabe en GPUs de consumo y tambien en CPU para pruebas o entornos sin acelerador.

## Benchmarks y rendimiento

Datos de la model card (RTX 5060 Ti 16 GB, sm_120; entrada sintetica 1080x1920):

| Modelo | Tiempo original (ms) | Tiempo portable (ms) | Memoria pico asignada/reservada (MiB) |
|---|---|---|---|
| `lineart` | 29,8 | 18,3 | 221 / 264 (original), 222 / 284 (portable) |
| `lineart-coarse` | 30,4 | 18,3 | 221 / 264 (original), 222 / 284 (portable) |

Rendimiento a 1024x1024 (fp16):

| Modelo | Portable (ms) | `torch.compile` (ms) | TensorRT fp16 (ms) | Compilacion en frio (s) | Construccion ONNX + engine (s) |
|---|---|---|---|---|---|
| `lineart` | 9,93 | 6,49 | 4,80 | 9,92 | 10,3 |
| `lineart-coarse` | 9,92 | 6,49 | 4,80 | 9,66 | 10,5 |

Carga y primera llamada: `lineart` tarda 0,65 s en cargar con el codigo original y 0,16 s con el backend portable; la primera llamada es de 0,05 s (original) y 0,02 s (portable). No se publican resultados en benchmarks academicos estandar (MMLU, HumanEval, GSM8K u otros), por lo que no se dispone de esa comparativa.

## Requisitos de hardware

- VRAM estimada: aproximadamente 222 MiB de memoria pico asignada y 284 MiB reservada a 1080x1920 en fp16; unos 129 MiB asignados a 1024x1024.
- GPU recomendadas: cualquier GPU con soporte CUDA; las mediciones se realizaron en una RTX 5060 Ti 16 GB (sm_120). Tambien funciona en CPU en fp32.
- Cabe en GPU de consumo: si, con margen amplio en cualquier GPU moderna con al menos 1 GB de VRAM.
- Opciones de despliegue: libreria `fastforks` (`pip install fastforks`), con backend portable, `torch.compile` y TensorRT. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: 18,3 ms por imagen a 1080x1920 (portable), 9,93 ms a 1024x1024 (portable), 4,80 ms a 1024x1024 (TensorRT fp16).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Entrada | Latencia documentada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `fastforks/lineart` | Line-art convolucional | no disponible | RGB, H x W >= 32 | 18,3 ms a 1080x1920 | Codigo MIT; pesos sin licencia explicita | Hugging Face (card) + pesos en `lllyasviel/Annotators` |
| `controlnet_aux` LineartDetector | Line-art convolucional (original) | no disponible | RGB | 29,8 ms a 1080x1920 | MIT (codigo) | GitHub / PyPI |
| HED | Deteccion de bordes | no disponible | RGB | no disponible | no disponible | Incluido en `controlnet_aux` |
| PiDiNet | Deteccion de bordes | no disponible | RGB | no disponible | no disponible | Incluido en `controlnet_aux` |

## Limitaciones y advertencias

- La licencia de los pesos no la declara explicitamente el autor; la model card asume MIT a partir del codigo. Conviene verificarlo antes de un uso comercial en produccion.
- El modelo card indica "research-use package" en las cadenas de licencia originales: revisar antes de cualquier uso distinto de la investigacion.
- No se documenta el dataset de entrenamiento de estos checkpoints concretos, lo que impide evaluar sesgos o cobertura.
- Riesgo de alucinacion no aplicable (no genera texto), pero puede producir lineas espurias o perder detalles finos en imagenes con bajo contraste.
- El modelo no procesa texto ni idiomas; no tiene capacidades multilingues.
- La resolucion de entrada debe ser multiplo de 32 (con padding), lo que puede introducir artefactos en los bordes.
- El backend de kernels no esta implementado; las aceleraciones se limitan a `torch.compile` y TensorRT.
- El repositorio no aloja pesos: requiere descarga externa y verificacion de hash, lo que anade un paso de integridad en el despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/fastforks/lineart
- Repositorio fastforks: https://github.com/kleinicke/fastforks
- Kernels fastforks: https://huggingface.co/fastforks/kernels
- Pesos originales: https://huggingface.co/lllyasviel/Annotators
- Codigo original controlnet_aux: https://github.com/huggingface/controlnet_aux
- Licencia del codigo original: https://github.com/huggingface/controlnet_aux/blob/b1aac318b15c4e65a21bc516dc236ad4bf593d46/src/controlnet_aux/lineart/LICENSE
- Benchmarks fastforks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Paper informative-drawings: no disponible en la informacion proporcionada
