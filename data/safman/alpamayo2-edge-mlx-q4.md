# Safman/Alpamayo2-Edge-MLX-q4

## Resumen
Alpamayo2-Edge-MLX-q4 es una cuantizacion de 4 bits en formato MLX del modelo nvidia/Alpamayo2-Edge, un modelo Vision-Language-Action (VLA) de 2B parametros orientado a conduccion autonoma. Lo publica el usuario Safman como port para Apple Silicon, apoyandose en la libreria mlx-vla, y mantiene la licencia NVIDIA Open Model License del modelo original. El modelo combina un LLM Cosmos 3 Edge de 28 capas con un Diffusion Action Expert de 512 dimensiones que genera trayectorias de 64 waypoints, ademas de una torre de vision SigLIP2 de 27 capas.

La relevancia de esta variante radica en que reduce el checkpoint a 2,20 GB y permite ejecutar inferencia 100% en MLX sobre memoria unificada de Apple Silicon, sin dependencia de PyTorch en tiempo de inferencia. Con ello se puede desplegar un modelo VLA de conduccion en equipos de consumo con GPU integrada, algo impracticable con el checkpoint BF16 original de 5,30 GB.

El modelo resuelve dos tareas principales: prediccion de trayectorias con razonamiento en cadena de causalidad (chain-of-causation) y respuesta visual a preguntas (VQA) sobre escenas de conduccion. La cuantizacion mantiene la torre de vision y los encoders/decoders de accion en bfloat16, aplicando 4 bits solo al LLM y al Action Expert.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA: LLM Cosmos 3 Edge (28 capas) + Diffusion Action Expert (28 capas, 512-wide) + vision tower SigLIP2 (27 capas) con patch merger 2x2 |
| Parametros totales | 2.651.163.378 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine con group_size=64 en LLM y Action Expert; bfloat16 en vision tower y en action_in_proj/action_out_proj |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (OpenMDW-1.1); codigo de mlx-vla bajo MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento
La arquitectura es un VLA compuesto por tres bloques: una torre de vision SigLIP2 de 27 capas con patch merger 2x2 que procesa fotogramas de camara; un LLM Cosmos 3 Edge de 28 capas que actua como razonador y produce la cadena de causalidad; y un Diffusion Action Expert de 28 capas y 512 dimensiones que genera trayectorias continuas mediante flow matching con 10 pasos de integracion Euler. La inferencia encadena el razonador VLM con el experto de accion mediante una transferencia zero-copy de la KV cache en memoria unificada, sin salir del runtime MLX.

El modelo admite dos modos de razonamiento: `adaptive`, que emite la cadena de causalidad antes de la trayectoria, y `nominal`, que omite el razonamiento para streaming rapido. La prediccion devuelve 64 waypoints con posicion (xyz) y rotacion (matriz 3x3). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. La cuantizacion aplicada por Safman es mixta: 4 bits en los dos bloques de 28 capas y bfloat16 en la parte de vision y en los proyectores de accion.

## Capacidades
- Prediccion de trayectorias de conduccion de 64 waypoints con posicion y rotacion, mediante flow matching en 10 pasos.
- Razonamiento en cadena de causalidad (chain-of-causation) explicito antes de la accion, en modo `adaptive`.
- Modo `nominal` sin razonamiento para streaming de baja latencia.
- VQA libre sobre imagenes de camara de vehiculo (deteccion de peligros, descripcion de escena).
- Procesamiento multimodal con multiples fotogramas, indices de camara y marcas temporales absolutas.
- Entrada de navegacion en texto (por ejemplo, "Turn right in 30m") integrada en la preparacion de inputs.
- Historial de estado del ego-vehiculo (posicion y rotacion en 20 pasos) como contexto.
- Ejecucion 100% en MLX sobre Apple Silicon, sin PyTorch ni Torchvision en inferencia.
- Soporte de semilla para reproducibilidad de la difusion.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso.

## Casos de uso
- Prediccion de trayectorias en bucle cerrado sobre vehiculo real o simulador: el modelo genera 64 waypoints con posicion y rotacion a partir de fotogramas de camara, historial del ego-vehiculo y consigna de navegacion, adecuado para planificadores de movimiento que consumen trayectorias densas.
- Validacion offline de datasets de conduccion: se puede ejecutar sobre clips grabados en un Mac para comparar trayectorias predichas con las humanas y detectar escenarios problematicos antes de entrenar o desplegar.
- Prototipado en portatil Apple Silicon: con 2,20 GB de RAM activa y 3,25 GB de pico, permite iterar sobre prompts, modos de razonamiento y pasos de difusion sin GPU dedicada.
- Asistente de analisis de escena para ingenieros: VQA libre sobre fotogramas de camara para responder preguntas como "que peligros hay delante", util en herramientas internas de revision de incidentes.
- Investigacion en VLA y flow matching: el checkpoint cuantizado sirve para estudiar el impacto de la cuantizacion 4-bit en la calidad de trayectorias frente a las variantes bf16, q8 y q6 del mismo autor.
- Demos interactivas de conduccion autonoma: el modo `nominal` sin razonamiento permite streaming con latencias compatibles con demostraciones en vivo sobre hardware de consumo.
- Evaluacion de robustez multimodal: al aceptar multiples camaras con marcas temporales, se pueden construir pruebas de fusion de sensores visuales en entornos controlados.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

El autor unicamente reporta metricas de tamano y memoria: checkpoint de 2,20 GB, 2,20 GB de RAM activa y 3,25 GB de pico en Metal, y una frecuencia de hasta 1,87-2,5 Hz con CoreML ANE. No se aportan cifras de MMLU, HumanEval, GSM8K ni metricas de conduccion como L2 o colisiones.

## Requisitos de hardware
- VRAM/RAM: 2,20 GB activos y 3,25 GB de pico en memoria unificada de Apple Silicon (Metal).
- GPU recomendadas: cualquier chip Apple Silicon con Metal; el autor menciona aceleracion opcional con CoreML ANE para alcanzar 1,87-2,5 Hz.
- Cabe en GPU de consumo: si, en equipos Apple Silicon; no esta pensado para GPUs NVIDIA/AMD por el runtime MLX.
- Despliegue: libreria mlx-vlm / mlx-vla (`pip install "git+https://github.com/SMJD11/mlx-vla.git"`); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: hasta 1,87-2,5 Hz con CoreML ANE segun el autor; no se aportan cifras para otros modos.
- Alternativas del mismo autor con mayor precision: bf16 (5,30 GB), q8 (3,28 GB) y q6 (2,74 GB).

## Comparativa con modelos similares

| Modelo | Parametros | Precision | Tamano | RAM activa | Licencia | Runtime |
|---|---|---:|---:|---:|---|---|
| Safman/Alpamayo2-Edge-MLX-q4 | 2,65B | 4-bit (LLM+Expert) | 2,20 GB | 2,20 GB | NVIDIA Open Model License | MLX |
| Safman/Alpamayo2-Edge-MLX-q6 | 2,65B | 6-bit (LLM+Expert) | 2,74 GB | 2,74 GB | NVIDIA Open Model License | MLX |
| Safman/Alpamayo2-Edge-MLX-q8 | 2,65B | 8-bit (LLM+Expert) | 3,28 GB | 3,28 GB | NVIDIA Open Model License | MLX |
| Safman/Alpamayo2-Edge-MLX-bf16 | 2,65B | BF16 | 5,30 GB | 5,30 GB | NVIDIA Open Model License | MLX |
| nvidia/Alpamayo2-Edge | 2,65B | BF16 (original) | no disponible | no disponible | NVIDIA Open Model License | PyTorch |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias
- Modelo especializado en conduccion autonoma: no es un LLM de proposito general y su uso fuera de ese dominio no esta validado.
- La cuantizacion 4-bit puede degradar la calidad de las trayectorias frente a bf16, q8 o q6; el autor no publica metricas de esa perdida.
- Dependencia exclusiva del runtime MLX: no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, lo que limita el despliegue a Apple Silicon.
- Riesgo de alucinacion en la cadena de causalidad y en VQA libre: las explicaciones generadas no deben tratarse como garantia de seguridad.
- No se documentan idiomas soportados ni sesgos conocidos.
- Licencia NVIDIA Open Model License (OpenMDW-1.1): es necesario revisar sus terminos antes de cualquier uso comercial; el codigo de mlx-vla es MIT, pero los pesos no.
- El checkpoint tiene 0 descargas y 0 likes, y fue creado el 2026-11-24: no hay validacion comunitaria ni evidencia de uso en produccion.
- Uso en vehiculo real requiere validacion independiente, redundancia de sensores y cumplimiento normativo; este checkpoint no sustituye un sistema de seguridad certificado.
- No se especifica la longitud de contexto, lo que impide planificar escenarios con historiales largos.

## Enlaces
- Hugging Face: https://huggingface.co/Safman/Alpamayo2-Edge-MLX-q4
- Modelo base: https://huggingface.co/nvidia/Alpamayo2-Edge
- Repositorio mlx-vla: https://github.com/SMJD11/mlx-vla
- Variante bf16: https://huggingface.co/Safman/Alpamayo2-Edge-MLX-bf16
- Variante q8: https://huggingface.co/Safman/Alpamayo2-Edge-MLX-q8
- Variante q6: https://huggingface.co/Safman/Alpamayo2-Edge-MLX-q6
- Alpamayo 1.5 Mac MLX 4-bit: https://huggingface.co/Safman/Alpamayo-1.5-Mac-MLX-4bit
- Alpamayo 1.5 Mac DFlash: https://huggingface.co/Safman/Alpamayo-1.5-Mac-DFlash
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
