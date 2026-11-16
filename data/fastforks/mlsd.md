# fastforks/mlsd

## Resumen

M-LSD (Mobile Line Segment Detection) es un detector de segmentos de línea y bordes descrito en el artículo de Gu et al. (AAAI 2022). El modelo original es una red MobileNetV2 que predice centros de segmentos y desplazamientos de puntos finales, devolviendo tanto los segmentos rectos como un mapa de líneas de 1 píxel que consume el modelo MLSD de ControlNet. Es, por tanto, un preprocesador de ControlNet para generación de imágenes condicionada por estructura lineal (line art, planos arquitectónicos, dibujos técnicos).

El repositorio `fastforks/mlsd` no es un modelo entrenado por fastforks ni aloja pesos propios: es una model card que documenta la integración de los pesos originales de los autores (fichero `mlsd_large_512_fp32.pth`) dentro del ecosistema fastforks, con verificación de integridad mediante SHA-256 y una implementación portable en PyTorch. La librería fastforks actúa como orquestador de descarga, validación y ejecución del modelo bajo una API unificada (`edges.load("mlsd")`).

La relevancia actual es práctica: permite usar M-LSD como preprocesador de ControlNet sin depender de `controlnet_aux` ni de ComfyUI, con backend portable en fp16 sobre CUDA, latencias del orden de 9 ms a 1080x1920 en una RTX 5060 Ti y un consumo de memoria pico de 127 MiB. Es un componente de pipeline, no un modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (CNN) con cabecera de predicción de centros de segmento y desplazamientos de puntos finales |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen H x W >= 32, múltiplo de 32) |
| Tipos de cuantizacion | fp32 y fp16 (no se documentan cuantizaciones int8/int4) |
| Idiomas soportados | no aplica (modelo de visión, sin componente textual) |
| Licencia | Apache-2.0 (código y pesos según la model card) |
| Formato de pesos | `.pth` (PyTorch state dict, `mlsd_large_512_fp32.pth`), descargado desde el repositorio del autor original |

## Arquitectura y entrenamiento

M-LSD es una red convolucional basada en MobileNetV2 que reformula la detección de segmentos como la predicción de un mapa de centros de segmento más un mapa de desplazamientos hacia los puntos finales. A partir de esas dos salidas se reconstruyen los segmentos rectos y se rasteriza un mapa de líneas de 1 píxel en el rango [0, 1] a la resolución de entrada. La innovación principal del artículo original es la formulación "center-and-displacement", que evita la regresión directa de coordenadas de extremos y simplifica la supervisión.

Según la model card, el checkpoint se entrena sobre el dataset Wireframe (Huang et al. 2018), que no declara licencia explícita. No se documentan en la información disponible el número de tokens (no aplica), la composición exacta del dataset ni si hubo etapas de ajuste fino adicionales. La implementación de fastforks es una reimplementación portable en PyTorch que reproduce la salida del código original con una diferencia máxima absoluta de 0,002 en CPU fp32 y un error medio absoluto <= 0,02 (p99 <= 0,25) en GPU fp16.

## Capacidades

- Detección de segmentos de línea recta en imágenes RGB, devolviendo tanto la lista de segmentos como el mapa de líneas.
- Generación de mapas de borde/línea en [0, 1] a la resolución de entrada, aptos como condicionamiento para ControlNet (modelo MLSD).
- Preprocesador compatible con pipelines de ControlNet para line art, HED, PiDiNet, TEED y Anyline (según la model card, M-LSD es uno de los preprocesadores de esa familia).
- Entrada de tamaño arbitrario H x W >= 32, con padding interno a múltiplo de 32.
- Ejecución en CPU (fp32) y GPU CUDA (fp16 por defecto).
- API unificada vía `fastforks.edges` con selección automática de backend (`mode="auto"`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual de una sola pasada.

## Casos de uso

- Preprocesado para ControlNet MLSD en generación de interiores y arquitectura: el modelo produce el mapa de líneas que el ControlNet MLSD usa para preservar la estructura de paredes, suelos y techos en la imagen generada; su latencia de 9 ms a 1080x1920 lo hace viable en pipelines interactivos.
- Vectorización de planos y bocetos técnicos: a partir de una foto o escaneo de un plano se obtienen segmentos rectos que pueden exportarse a un editor vectorial o a un CAD como guía geométrica.
- Extracción de estructura en imágenes de edificios para post-proceso: detección de aristas rectas para tareas de rectificación de perspectiva, estimación de líneas de fuga o registro de imágenes.
- Preprocesador en ComfyUI o flujos equivalentes: sustituye a la implementación de `controlnet_aux` con una API más simple y un backend portable en fp16, manteniendo paridad numérica con el original.
- Generación de line art para ilustración y cómic: el mapa de líneas resultante sirve como base para coloreado automático o para condicionar modelos de imagen a tinta.
- Automatización de control de calidad en renderizado 3D: comparación de mapas de líneas entre un render y una referencia para detectar desviaciones geométricas en pipelines de producción.
- Prototipado rápido en investigación de visión: al ser un modelo pequeño (MobileNetV2) con inferencia en decenas de milisegundos, es adecuado para experimentos de detección de líneas en lotes grandes sin coste elevado de GPU.

## Benchmarks y rendimiento

La model card reporta tiempos y memoria medidos en una RTX 5060 Ti 16 GB (sm_120), con entrada sintética de 1080x1920 en fp16:

| Modelo | Tiempo original (ms) | Tiempo portable (ms) | Memoria pico original (MiB alloc/reserved) | Memoria pico portable (MiB alloc/reserved) |
|---|---|---|---|---|
| `mlsd` | 35,6 | 9,33 | 185 / 212 | 127 / 170 |

A 1024x1024, la implementación portable tarda 7,65 ms y `torch.compile` 4,61 ms, con un pico de memoria de 72/90 MiB (portable) y 101/130 MiB (compile). La compilación en frío tarda 11,4 s. El backend TensorRT está planificado para la versión 0.2.1 y no hay backend de kernels porque el modelo es una CNN estándar sobre cuDNN sin kernels personalizados que aporten mejora.

Carga del modelo: 0,21 s (original) y 0,17 s (portable); primera llamada: 0,06 s (original) y 0,01 s (portable).

No se han publicado resultados de benchmarks de precisión (F1, mAP) en la información disponible; solo se documenta la paridad numérica con el código original.

## Requisitos de hardware

- VRAM estimada para inferencia: 127 MiB de memoria pico asignada y 170 MiB reservada a 1080x1920 en fp16 (backend portable); 72/90 MiB a 1024x1024.
- GPU recomendadas: cualquier GPU CUDA con al menos 1 GB de VRAM; los datos medidos son de una RTX 5060 Ti 16 GB (sm_120). Funciona también en CPU en fp32.
- Cabe en cualquier GPU de consumo, incluidas GTX 1050 Ti, RTX 3050, RTX 4060 y superiores; también en iGPU con soporte CUDA.
- Opciones de despliegue: librería `fastforks` (`pip install fastforks`), con backend portable en PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión de este tipo).
- Latencia y throughput: 9,33 ms por imagen a 1080x1920 en fp16 (portable), 7,65 ms a 1024x1024, 4,61 ms con `torch.compile`; primera llamada tras carga en 0,01 s.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| M-LSD (fastforks/mlsd) | MobileNetV2 | H x W >= 32 | Apache-2.0 | Hugging Face (card) + GitHub fastforks | Preprocesador ControlNet, salida de segmentos y mapa de líneas |
| HED (preprocesador ControlNet) | CNN holística | H x W | no disponible en la información | `controlnet_aux` | Detección de bordes suaves, sin segmentos |
| PiDiNet (preprocesador ControlNet) | CNN ligera | H x W | no disponible en la información | `controlnet_aux` | Bordes finos, sin segmentos |
| TEED / Anyline (preprocesadores ControlNet) | CNN | H x W | no disponible en la información | `controlnet_aux` | Enfoques alternativos de detección de líneas |

No se dispone de datos de benchmarks comparativos entre estos preprocesadores en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no aloja pesos: la descarga se realiza desde el repositorio del autor original (`lhwcv/mlsd_pytorch`) y se valida por SHA-256; si ese repositorio cambia o desaparece, la integración puede romperse.
- El dataset de entrenamiento (Wireframe, Huang et al. 2018) no declara licencia explícita, lo que introduce incertidumbre sobre el uso comercial de los pesos derivados, aunque la model card indica Apache-2.0 para código y pesos.
- La model card advierte que las cadenas de licencia del código original se reproducen tal cual y son de un paquete de uso investigador; conviene revisarlas antes de cualquier otro uso.
- Es un detector de líneas rectas: no modela curvas, arcos ni estructuras no lineales, por lo que su utilidad en imágenes orgánicas es limitada.
- Riesgo de falsos positivos y negativos en imágenes con texturas ruidosas, iluminación adversa o líneas muy cortas; no se documentan métricas de precisión (F1, mAP) para cuantificar este riesgo.
- No hay soporte de tool calling, agentes ni razonamiento; su uso está restringido a preprocesado de imagen.
- La paridad con el original en GPU fp16 admite un error medio absoluto de hasta 0,02 y p99 de 0,25, lo que puede afectar a pipelines que requieran exactitud estricta.
- El backend TensorRT aún no está disponible (planificado para 0.2.1) y no existe backend de kernels; el rendimiento depende de cuDNN.
- Modelo experimental (tier "experimental" según la model card): la API y el soporte pueden cambiar.

## Enlaces

- Hugging Face: https://huggingface.co/fastforks/mlsd
- Repositorio fastforks: https://github.com/kleinicke/fastforks
- Kernels de fastforks: https://huggingface.co/fastforks/kernels
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Código original de M-LSD: https://github.com/lhwcv/mlsd_pytorch
- Pesos originales: https://raw.githubusercontent.com/lhwcv/mlsd_pytorch/2312205254e66911703decf775f626995d260f17/models/mlsd_large_512_fp32.pth
- Licencia del código original: https://github.com/lhwcv/mlsd_pytorch/blob/2312205254e66911703decf775f626995d260f17/LICENSE
- `controlnet_aux`: https://github.com/huggingface/controlnet_aux
- Artículo original: Gu et al., "M-LSD: Towards Light-weight and Real-time Line Segment Detection", AAAI 2022 (no se proporciona URL directa en la información disponible).
