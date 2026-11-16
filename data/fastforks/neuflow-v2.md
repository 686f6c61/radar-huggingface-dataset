# fastforks/neuflow-v2

## Resumen

NeuFlow v2 es una red neuronal convolucional ligera para la estimación de flujo óptico (optical flow) orientada a robótica y dispositivos de borde. El modelo original fue publicado por Zhang, Gupta, Singh y Jiang en 2024, y esta ficha corresponde al repositorio `fastforks/neuflow-v2`, un port del modelo original de `neufieldrobotics/NeuFlow_v2` que no aloja pesos propios sino que descarga los del autor y los verifica mediante SHA-256. La tarea es de imagen a imagen: recibe dos fotogramas RGB consecutivos y devuelve el movimiento por píxel (dx, dy) del primero al segundo.

La arquitectura combina un backbone convolucional simple sobre la imagen promediada a resoluciones 1/2, 1/4 y 1/8, con cross-attention y matching global a resolución 1/16 para capturar movimientos grandes, seguido de un refinamiento a 1/16 y ocho refinamientos a 1/8 con búsqueda de correlación 9x9 y convoluciones 3x3 (sin GRU), finalizando con un upsampling convexo. El modelo se distribuye con tres checkpoints: `neuflow-v2` (mezcla de datasets, el predeterminado), `-things` (FlyingThings3D, zero-shot en otros dominios) y `-sintel` (fine-tune sobre Sintel).

Es relevante ahora porque ofrece flujo óptico denso con latencias de decenas de milisegundos y consumo de memoria moderado en GPUs de consumo, lo que lo hace apto para pipelines de percepción en robótica, vehículos y sistemas embebidos. El repositorio se marca como "experimental" y su licencia es Apache-2.0 tanto para el código como para los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con backbone convolucional multi-escala, cross-attention y matching global a 1/16, refinamiento iterativo a 1/8 con correlación 9x9, upsampling convexo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de cualquier H x W >= 32, padding a múltiplo de 16) |
| Tipos de cuantizacion | no disponible (ejecución en fp16 y fp32 documentada; no se listan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no aplica (modelo de visión, sin capacidades de lenguaje) |
| Licencia | Apache-2.0 (código y pesos) |
| Formato de pesos | `.pth` (PyTorch); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es una red puramente convolucional sin recurrencia (no usa GRU), lo que simplifica el despliegue y permite optimizaciones agresivas. La imagen se procesa en un backbone convolucional que opera sobre versiones promediadas a 1/2, 1/4 y 1/8 de resolución; a 1/16 se aplican cross-attention y matching global para estimar el flujo inicial y capturar movimientos grandes; después se realizan un refinamiento a 1/16 y ocho refinamientos a 1/8 mediante búsqueda de correlación 9x9 con convoluciones 3x3, y finalmente un upsampling convexo para recuperar la resolución completa. Esta combinación busca un equilibrio entre precisión en movimientos grandes y coste computacional bajo.

El entrenamiento utiliza múltiples datasets de flujo óptico: Freiburg SceneFlow (FlyingThings3D, Driving, Monkaa), MPI Sintel, KITTI stereo/optical flow 2012 y 2015, y HCI HD1K. Según la model card, las etapas mixtas de `data_utils/datasets.py` del repositorio original emplean FlyingThings3D (parte de SceneFlow), Sintel, KITTI 2015, HD1K y, en una etapa, VIPER. No se documentan en la información disponible detalles sobre número de tokens, composición exacta del dataset ni uso de RLHF/DPO (no aplica a este tipo de modelo). La innovación técnica principal es la eliminación de módulos recurrentes y el uso de correlación 9x9 con convoluciones simples, que reduce latencia y memoria frente a alternativas tipo RAFT.

## Capacidades

- Estimación de flujo óptico denso entre dos fotogramas RGB consecutivos, devolviendo desplazamiento por píxel (dx, dy) en píxeles.
- Manejo de movimientos grandes gracias al matching global y cross-attention a resolución 1/16.
- Entrada de tamaño arbitrario con H x W >= 32 (padding a múltiplo de 16); probado hasta 1024x2048.
- Ejecución en fp16 y fp32; backends `portable` (PyTorch) y `kernels` (kernels optimizados de fastforks).
- Compatibilidad con `torch.compile` y exportación a ONNX/TensorRT fp16 (según benchmarks del repositorio).
- Tres variantes de pesos: mixta (predeterminada), FlyingThings3D (zero-shot) y Sintel (fine-tune).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un modelo puramente visual de imagen a imagen.

## Casos de uso

- Robótica móvil y navegación: estimación de movimiento relativo entre fotogramas consecutivos de una cámara monocular para odometría visual y evitación de obstáculos, gracias a la baja latencia (decenas de ms a 1080p) y al reducido consumo de memoria.
- Vehículos autónomos y ADAS: cálculo de flujo denso para detección de movimiento, seguimiento de objetos y estimación de profundidad relativa en tiempo real sobre GPUs de consumo.
- Estabilización de vídeo y postproducción: generación de mapas de flujo para warp temporal, interpolación de fotogramas y estabilización, aprovechando la salida por píxel y el soporte de resoluciones altas (hasta 1024x2048 probado).
- Drones y dispositivos de borde: percepción visual en plataformas con recursos limitados, donde el modelo cabe en GPUs de consumo y puede exportarse a TensorRT fp16 para despliegue embebido.
- Análisis de movimiento en vídeo de vigilancia: detección de anomalías y seguimiento de personas u objetos mediante flujo denso entre fotogramas consecutivos.
- Investigación en visión por computador: baseline ligero para experimentos de flujo óptico, con tres checkpoints (mixto, things, sintel) que permiten evaluar generalización y fine-tuning en dominios específicos.
- Pipelines de aumentación de datos: generación de pares sintéticos con movimiento controlado para entrenar otros modelos de percepción.

## Benchmarks y rendimiento

La model card proporciona datos de velocidad y memoria, pero la tabla de precisión (EPE, Fl-all) aparece truncada en la información disponible, por lo que no se pueden presentar resultados completos de exactitud.

### Velocidad y memoria (sintético, RTX 5060 Ti 16 GB, sm_120)

| Modelo | Entrada | Tiempo original fp32 (ms) | Original fp16 (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Memoria pico kernels (MiB alloc/reserved) |
|---|---|---|---|---|---|---|---|
| `neuflow-v2` | 1080x1920 | 171 | 75.6 | 71.2 | 59.1 | 1.3x | 790 / 896 |
| `neuflow-v2-sintel` | 1080x1920 | 171 | 75.7 | 71.3 | 58.9 | 1.3x | 790 / 896 |
| `neuflow-v2-things` | 1080x1920 | 172 | 75.8 | 71.4 | 58.9 | 1.3x | 779 / 896 |

### torch.compile y TensorRT (1080x1920)

| Modelo | Portable (ms) | torch.compile (ms) | TensorRT fp16 (ms) | Kernels (ms) | Memoria pico TensorRT (MiB) |
|---|---|---|---|---|---|
| `neuflow-v2` | 71.2 | 91.4 | 65.0 | 59.1 | 8710 / 8748 |
| `neuflow-v2-sintel` | 71.3 | 91.4 | 64.9 | 58.9 | 8710 / 8748 |
| `neuflow-v2-things` | 71.4 | 91.5 | 65.0 | 58.9 | 8710 / 8748 |

### Arranque y primera llamada

| Modelo | Carga original (s) | Carga portable (s) | Carga kernels (s) | Primera llamada original (s) | Primera llamada portable (s) | Primera llamada kernels (s) |
|---|---|---|---|---|---|---|
| `neuflow-v2` | 0.20 | 0.26 | 0.96 | 0.22 | 0.07 | 0.18 |
| `neuflow-v2-sintel` | 0.17 | 1.29 | 0.95 | 0.08 | 0.81 | 0.18 |
| `neuflow-v2-things` | 0.17 | 0.38 | 0.26 | 0.08 | 0.07 | 0.06 |

Nota: los tiempos de compilación son de 28,5 s (torch.compile) y 104 s (ONNX + engine TensorRT) para `neuflow-v2`. La memoria pico en 1024x2048 con fp16 portable es de 8,2 GiB asignados y 9,0 GiB reservados.

No se han publicado resultados completos de precisión (EPE, Fl-all) en la información disponible; la tabla de exactitud aparece truncada.

## Requisitos de hardware

- VRAM estimada: en 1080x1920 con backend `kernels` el pico es de ~790-896 MiB; con backend `portable` ~2366-2398 MiB; con TensorRT fp16 ~8710-8748 MiB. En 1024x2048 fp16 portable se alcanzan 8,2 GiB asignados y 9,0 GiB reservados.
- GPU recomendadas: RTX 5060 Ti 16 GB es la hardware de referencia de los benchmarks; cualquier GPU con al menos 2-3 GiB libres puede ejecutar el backend portable a 1080p, y 8-9 GiB para resoluciones de 1024x2048 o TensorRT.
- Cabe en GPU de consumo: sí, en tarjetas con 4-8 GiB para resoluciones habituales; para 1024x2048 se recomienda 16 GiB.
- Opciones de despliegue: PyTorch (backend `portable`), kernels optimizados de fastforks (backend `kernels`), `torch.compile`, exportación a ONNX y TensorRT fp16. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión).
- Latencia y throughput: 59-71 ms por par de fotogramas a 1080x1920 según backend; 65 ms con TensorRT fp16; primera llamada entre 0,06 y 0,81 s según variante y backend.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto/entrada | Latencia 1080p | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| NeuFlow v2 (fastforks) | CNN con matching global | no disponible | H x W >= 32, probado hasta 1024x2048 | 59-71 ms (kernels/portable) | Apache-2.0 | Pesos del autor vía GitHub; port en HF |
| RAFT (referencia) | CNN recurrente con GRU | no disponible en la información | no disponible | no disponible | no disponible | no disponible |
| FlowFormer | Transformer para flujo óptico | no disponible en la información | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de precisión ni de latencia de RAFT o FlowFormer en la información proporcionada; la comparativa se limita a la categoría y a la licencia conocida de NeuFlow v2.

## Limitaciones y advertencias

- Modelo marcado como "experimental" (tier experimental) en la model card; no se garantiza estabilidad de API ni de resultados en producción.
- La tabla de precisión (EPE, Fl-all) está truncada en la información disponible, por lo que no se puede verificar el rendimiento exacto frente a la implementación original.
- El repositorio no aloja pesos: depende de enlaces externos a GitHub y de la verificación SHA-256; si los enlaces cambian, el flujo de descarga puede romperse.
- La variante `-things` está entrenada solo con FlyingThings3D y su rendimiento en otros dominios es zero-shot, con posible degradación.
- No es un modelo de lenguaje: no soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- Licencia Apache-2.0 permite uso comercial, pero la model card advierte que el paquete original es de "research-use" y recomienda revisar las cadenas de licencia antes de otros usos.
- El entrenamiento usa múltiples datasets (SceneFlow, Sintel, KITTI, HD1K, VIPER) cuyas licencias individuales pueden imponer restricciones adicionales al uso comercial de los pesos derivados.
- Resolución de entrada limitada a múltiplos de 16 tras padding; entradas menores de 32 píxeles no son válidas.
- No se documentan sesgos específicos ni riesgos de alucinación (no aplica a un modelo de flujo óptico), pero sí puede fallar en escenas con oclusiones, texturas repetitivas o movimientos muy grandes fuera del dominio de entrenamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fastforks/neuflow-v2
- Código del port: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Código original: https://github.com/neufieldrobotics/NeuFlow_v2 (commit `204b5e374446`)
- Pesos `neuflow_mixed.pth`: https://github.com/neufieldrobotics/NeuFlow_v2/raw/204b5e3744461d90303b9ff82caa7a1bb56a2ca2/neuflow_mixed.pth
- Pesos `neuflow_sintel.pth`: https://github.com/neufieldrobotics/NeuFlow_v2/raw/204b5e3744461d90303b9ff82caa7a1bb56a2ca2/neuflow_sintel.pth
- Pesos `neuflow_things.pth`: https://github.com/neufieldrobotics/NeuFlow_v2/raw/204b5e3744461d90303b9ff82caa7a1bb56a2ca2/neuflow_things.pth
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Evidencia de licencia: https://huggingface.co/Study-is-happy/neuflow-v2/blob/79ae2f4589456d4d369aaef4955c7db5918c3436/README.md
- Paper de referencia: Zhang, Gupta, Singh & Jiang (2024), NeuFlow v2 (no se proporciona URL en la información disponible).
