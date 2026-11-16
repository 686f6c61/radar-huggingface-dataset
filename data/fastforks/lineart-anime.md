# fastforks/lineart-anime

## Resumen

`fastforks/lineart-anime` es un preprocesador de deteccion de lineas para ControlNet 1.1, empaquetado por `fastforks` bajo su propia libreria. No es un modelo generativo: es un detector de bordes especializado en ilustracion anime que convierte una imagen RGB en un mapa de lineas `[H, W]` en el rango [0, 1], pensado como entrada para pipelines de ControlNet (line art, HED, PiDiNet, TEED/Anyline). El modelo subyacente es el `LineartAnimeDetector` de `controlnet_aux`, equivalente al nodo "Anime Lineart" de ComfyUI.

Tecnicamente es una U-Net pix2pix de 8 niveles con normalizacion de instancia y 54 millones de parametros. El repositorio de Hugging Face es solo la model card: no aloja pesos. `fastforks` descarga los pesos originales de `lllyasviel/Annotators` y los verifica contra un SHA-256 registrado en la propia card. La licencia del codigo es MIT; el autor no declara una licencia separada para los pesos, y la card asume MIT a partir del codigo.

Su relevancia es practica: permite integrar el preprocesado de line art anime en un pipeline moderno (CUDA, PyTorch, backend portable) con latencias muy bajas y paridad numerica verificada frente al codigo original, sin depender de la implementacion de referencia de `controlnet_aux`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net pix2pix, 8 niveles, normalizacion de instancia |
| Parametros totales | 54 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, sin contexto textual) |
| Tipos de cuantizacion | fp16 (por defecto en GPU), fp32; TensorRT fp16; no se documentan GGUF ni INT8 |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de lenguaje) |
| Licencia | codigo MIT; pesos sin licencia separada declarada (la card asume MIT) |
| Formato de pesos | `netG.pth` (PyTorch), alojado en `lllyasviel/Annotators`; este repo no contiene pesos |

## Arquitectura y entrenamiento

El modelo es una U-Net pix2pix de 8 niveles con normalizacion de instancia, 54 M de parametros, que opera sobre imagenes de entrada de cualquier resolucion `H x W >= 32` rellenadas a un multiplo de 32. La salida es un mapa de bordes `[H, W]` float en [0, 1] a la resolucion de entrada, donde 1 indica linea. No emplea atencion ni mecanismos de decodificacion especulativa: el coste computacional se concentra en convoluciones cuDNN y normalizacion de instancia, motivo por el cual el autor descarta un backend de kernels personalizados ("no custom kernel measured to pay off").

No se detalla el volumen de datos de entrenamiento. La card de ControlNet 1.1 describe el modelo de line art anime como entrenado sobre ilustraciones anime y sus correspondientes dibujos de linea. No se documenta RLHF, DPO ni fine-tuning por preferencias, algo esperable en un modelo de preprocesado. La innovacion destacable es de ingenieria: el backend "portable" reproduce el comportamiento del codigo original con paridad numerica verificada (CPU float32: max |diff| <= 0.002; GPU fp16: mean |diff| <= 0.02, p99 <= 0.25).

## Capacidades

- Deteccion de lineas y bordes sobre imagenes de ilustracion anime, generando un mapa de lineas limpio apto como condicionamiento de ControlNet.
- Entrada de una unica imagen RGB; salida de un mapa `[H, W]` en [0, 1] a la resolucion de entrada.
- Resolucion de entrada flexible: cualquier `H x W >= 32`, rellenada a multiplo de 32; probado hasta 1080x1920 en fp16 sobre RTX 5060 Ti 16 GB.
- Integracion como preprocesador en el ecosistema ControlNet (`line art`, HED, PiDiNet, TEED/Anyline); M-LSD devuelve ademas segmentos de linea recta (fuera de este modelo concreto).
- Backend portable con soporte de `torch.compile` y TensorRT fp16.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente visual.

## Casos de uso

- Preprocesado para ControlNet en generacion de anime: se ejecuta el detector sobre la imagen de referencia y se pasa el mapa de lineas como condicionamiento a un modelo de difusion con ControlNet lineart, garantizando que el resultado respete el trazo original.
- Limpieza de bocetos y lineart: convertir una ilustracion coloreada o un sketch ruidoso en un mapa de lineas binario para su posterior entintado o coloreado automatizado.
- Pipeline de ComfyUI: sustituye al nodo "Anime Lineart" con un backend con latencia medida (8,36 ms a 1080x1920 en el backend portable frente a 25,2 ms del original), util para iteracion interactiva.
- Procesado por lotes de catalogos de ilustracion: extraer lineart de cientos de imagenes para entrenamiento de modelos de line art o para indexacion por silueta.
- Rotoscopia y vectorizacion asistida: generar mapas de bordes de fotogramas de animacion para reconstruir trazos o alimentar herramientas de vectorizacion.
- Control de consistencia en produccion de assets: fijar la estructura de un personaje mediante su lineart y variar color o estilo con un modelo de difusion, manteniendo la silueta.
- Investigacion en preprocesadores de ControlNet: banco de pruebas reproducible con paridad numerica frente al codigo original y metricas de latencia y memoria publicadas.

## Benchmarks y rendimiento

Datos de la model card (RTX 5060 Ti 16 GB, sm_120). "Original" se refiere al codigo de referencia de `controlnet_aux`.

| Escenario | Original | Portable | torch.compile | TensorRT fp16 |
|---|---|---|---|---|
| 1080x1920, tiempo (ms) | 25,2 | 8,36 | no medido | no medido |
| 1080x1920, memoria pico asignada (MiB) | 407 | 241 | no medido | no medido |
| 1024x1024, tiempo (ms) | no medido | 3,86 | 2,80 | 1,54 |
| 1024x1024, memoria pico asignada (MiB) | no medido | 161 | 180 | 304 (engine + torch) |

| Metrica de arranque | Original | Portable |
|---|---|---|
| Carga del modelo (s) | 0,74 | 0,82 |
| Primera llamada (s) | 0,04 | 0,01 |

Preparacion: compilacion en frio 10,3 s; build ONNX + engine 13,4 s. No se publican resultados en benchmarks academicos (MMLU, HumanEval, etc.) por tratarse de un modelo de vision; la unica validacion es la paridad con el codigo original descrita arriba.

## Requisitos de hardware

- VRAM: minima. La memoria pico asignada es de 241 MiB a 1080x1920 en fp16 y 161 MiB a 1024x1024 en el backend portable.
- GPU recomendadas: cualquier GPU CUDA con soporte fp16; el autor mide sobre RTX 5060 Ti 16 GB (sm_120). Tambien funciona en CPU en float32.
- Cabe holgadamente en GPU de consumo: cualquier tarjeta con 4 GB o mas es suficiente; incluso integradas con CUDA.
- Despliegue: libreria `fastforks` (`pip install fastforks`), backend portable con PyTorch, `torch.compile` y exportacion a TensorRT fp16. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de vision de este tipo).
- Latencia: 8,36 ms a 1080x1920 (portable), 3,86 ms a 1024x1024 (portable), 2,80 ms con `torch.compile` y 1,54 ms con TensorRT fp16.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fastforks/lineart-anime` | 54 M | Deteccion de lineart anime | Imagen `H x W >= 32`, multiplo de 32 | Codigo MIT; pesos sin licencia separada | Repo de card; pesos en `lllyasviel/Annotators` |
| `lllyasviel/Annotators` (LineartAnimeDetector) | 54 M | Deteccion de lineart anime | Igual | Sin licencia de pesos declarada | Hugging Face |
| HED (preprocesador ControlNet) | no disponible | Bordes genericos | Imagen | no disponible | `controlnet_aux` |
| PiDiNet (preprocesador ControlNet) | no disponible | Bordes genericos | Imagen | no disponible | `controlnet_aux` |

La comparativa directa es con el propio detector original de `lllyasviel/Annotators`: mismos pesos, misma salida, pero `fastforks` anade verificacion SHA-256, backend portable mas rapido (8,36 ms frente a 25,2 ms) y menor memoria pico. Frente a HED o PiDiNet, el modelo esta especializado en ilustracion anime y produce trazos mas limpios en ese dominio, a costa de un rendimiento inferior en fotografias.

## Limitaciones y advertencias

- Es un preprocesador, no un generador: no produce imagenes finales, solo mapas de bordes.
- Especifico de ilustracion anime; su comportamiento en fotografia real o ilustracion no anime no esta documentado y probablemente sea inferior al de detectores genericos como HED.
- El repositorio no contiene pesos: la inferencia depende de descargar `netG.pth` desde `lllyasviel/Annotators` y de que el SHA-256 coincida. Si el autor original elimina o modifica el archivo, el flujo se rompe.
- Licencia ambigua: el codigo es MIT, pero el autor no declara licencia de pesos. La card asume MIT "a partir del codigo"; para uso comercial conviene verificar la licencia original en `controlnet_aux` antes de desplegar.
- Tier "experimental" segun la propia card; no hay validacion en benchmarks academicos ni evaluacion de sesgos.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si de artefactos: en zonas de bajo contraste o texturas complejas el mapa de lineas puede omitir trazos o introducir ruido.
- No hay soporte de lotes documentado ni de video; el procesado frame a frame requeriria orquestacion externa.
- La paridad con el original es aproximada (p99 de error absoluto hasta 0,25 en fp16), suficiente para condicionamiento pero no para comparaciones pixel a pixel.

## Enlaces

- Hugging Face: https://huggingface.co/fastforks/lineart-anime
- Pesos originales: https://huggingface.co/lllyasviel/Annotators
- Codigo de fastforks: https://github.com/kleinicke/fastforks
- Kernels de fastforks: https://huggingface.co/fastforks/kernels
- Codigo original (controlnet_aux): https://github.com/huggingface/controlnet_aux
- Licencia del codigo original: https://github.com/huggingface/controlnet_aux/blob/b1aac318b15c4e65a21bc516dc236ad4bf593d46/src/controlnet_aux/lineart_anime/LICENSE
- Benchmarks y protocolo: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Card TOML con hashes completos: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/edges/models/lineart_anime/card.toml
