# pytholove/rotary-bin-lab-ultraslim2l

## Resumen

UltraSlim-2L es un modelo surrogate de dinámica de contactos basado en redes neuronales de grafos (GNN) con información física, desarrollado por el usuario pytholove. Su propósito es sustituir simulaciones DEM (Discrete Element Method) de partículas en mezcladores de tambor rotatorio, un cuello de botella computacional clásico en ingeniería de procesos industriales. El modelo comprime un profesor denominado HiMGN R4 de 6,04 millones de parámetros hasta 1,79 millones, manteniendo un 92,3 % de paridad con el profesor y reduciendo el RMSE de un paso en un 49,3 % frente a la línea base.

El repositorio no distribuye un modelo de lenguaje, sino un conjunto de artefactos de despliegue para inferencia de dinámica de contactos: grafos ONNX (Opset 18) con precisión FP32, FP16 y BF16, modelos LiteRT `.tflite` para dispositivos ARM, y pesos SafeTensors en FP32, FP16, BF16 e INT8 simétrico. La licencia es MIT y el idioma declarado es inglés, aunque el modelo no procesa lenguaje natural: la etiqueta de idioma es meramente administrativa.

Su relevancia radica en la ingeniería de despliegue: consigue 275 ms por paso en GPU con enlace de E/S CUDA de copia cero (29,6 veces más rápido que ONNX en CPU) y completa un rollout de 50 pasos con cero escapes de partículas, lo que lo convierte en un candidato realista para gemelos digitales y control en tiempo casi real de mezcladores industriales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Graph Neural Network (GNN) physics-informed, surrogate de dinámica de contactos DEM |
| Parametros totales | 1,79 M (modelo estudiante); profesor HiMGN R4 de 6,04 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de simulación física, no de lenguaje); ventana de inferencia sobre snapshots de 12.962 partículas y ~135.000 pares de contacto dinámicos |
| Tipos de cuantizacion | FP32, FP16, BF16, INT8 simétrico |
| Idiomas soportados | Inglés (etiqueta administrativa; el modelo no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | SafeTensors, ONNX (Opset 18), LiteRT Flatbuffers (`.tflite`), PyTorch `.pt` |

## Arquitectura y entrenamiento

El modelo es un surrogate de red neuronal de grafos con información física, diseñado para predecir incrementos de velocidad, velocidad angular y posición (`dv`, `dw`, `dx`) de partículas en un tambor rotatorio. La arquitectura se organiza en subgrafos modulares exportables a ONNX, incluyendo kernels específicos de contacto como `edge_mix.onnx`, que opera sobre los ~135.000 pares de contacto dinámicos de la simulación de referencia (DEM Bin-Mixer Trial-02). El modelo recibe snapshots con un vector de características por nodo de dimensión 43 (`node_alpha_dim=43`) y un paso temporal `dt=0.0148`.

El entrenamiento se basa en destilación de conocimiento desde el profesor HiMGN R4 (6,04 M de parámetros) hacia el estudiante UltraSlim-2L (1,79 M), con un proceso de "model shrinking" que elimina pesos donantes inactivos. No se especifican en la información disponible el número de tokens ni la composición del dataset de entrenamiento, aunque por la naturaleza del modelo se trata de trayectorias de simulación DEM y no de texto. Tampoco se documentan fases de RLHF o DPO, que no aplican a este dominio. La innovación técnica destacable es el enlace de E/S CUDA de copia cero, que pasa punteros de memoria de dispositivo directamente (`buffer_ptr=x.data_ptr()`) y elimina 58 round-trips PCIe por fotograma.

## Capacidades

- Predicción de dinámica de contactos de partículas en mezcladores de tambor rotatorio bin-mixer.
- Inferencia de fuerzas de contacto sobre grafos de ~135.000 aristas mediante subgrafos ONNX especializados.
- Rollout de 50 pasos con restricciones físicas de contención (`apply_vessel_clamp`, `apply_pair_overlap_clamp`).
- Conservación física: cero escapes de partículas en los 50 pasos evaluados.
- Exportación de resultados a ParaView VTK para inspección visual de la simulación.
- Ejecución multi-runtime: ONNX Runtime con `CUDAExecutionProvider` y `CPUExecutionProvider`, LiteRT con XNNPACK, y PyTorch nativo.
- Soporte de precisión mixta: FP32, FP16, BF16 e INT8 simétrico.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje; sus capacidades son exclusivamente de simulación física.

## Casos de uso

- Gemelo digital de mezcladores industriales: el modelo sustituye pasos DEM costosos por inferencia GNN de 275 ms en GPU, permitiendo simulaciones interactivas de 50 pasos en 60,75 s frente a los 489,16 s de ONNX en CPU.
- Control de proceso en tiempo casi real: con 356 ms por paso de rollout en GPU, puede integrarse en lazos de control que ajusten la velocidad de rotación del tambor según el índice de mezcla Lacey predicho (0,7509 frente al ground truth de 0,7448).
- Optimización de diseño de bin-mixers: permite barrer parámetros geométricos y operativos con un coste computacional 29,6 veces menor que la inferencia en CPU, facilitando estudios de sensibilidad.
- Despliegue en PC industriales sin GPU: la suite ONNX modular en FP32, FP16 y BF16 con formas dinámicas Opset 18 está pensada para portátiles de cliente y Linux embebido, con ~8,15 s por paso en un Intel i9-12900H.
- Inferencia en dispositivos móviles y ARM: los modelos LiteRT `.tflite` acelerados por XNNPACK permiten ejecutar subredes en hardware embebido con paridad a nivel de bit.
- Distribución en IoT y almacenamiento restringido: los pesos INT8 simétricos de 1,71 MB (14,1 veces más compactos que el profesor) permiten empaquetar el surrogate en dispositivos con memoria limitada.
- Validación y auditoría de simulaciones DEM: el checkpoint PyTorch de referencia y el informe de auditoría permiten reproducir rollouts y comparar contra ground truth con exportación VTK.

## Benchmarks y rendimiento

Evaluado sobre DEM Bin-Mixer Trial-02 (12.962 partículas, ~135.000 pares de contacto dinámicos) en una NVIDIA GeForce RTX 3070 Ti Laptop GPU y un Intel Core i9-12900H de 12.ª generación:

| Motor de ejecución | Proveedor | Hardware | Forward puro | Paso de rollout | Rollout 50 pasos | Escapes | Índice Lacey |
|---|---|---|---|---|---|---|---|
| GPU ONNX (copia cero) | `CUDAExecutionProvider` | RTX 3070 Ti | 275 ms (p50: 867 ms) | 356 ms | 60,75 s (1,21 s/paso) | 0 | 0,7509 (GT: 0,7448) |
| PyTorch nativo | CUDA cuBLAS | RTX 3070 Ti | 279 ms (p50: 522 ms) | 315 ms | 57,50 s (1,15 s/paso) | 0 | 0,7501 (GT: 0,7448) |
| CPU ONNX | `CPUExecutionProvider` | i9-12900H | 8.153 ms | ~8.450 ms | 489,16 s (9,78 s/paso) | 0 | 0,7501 (GT: 0,7448) |
| LiteRT (XNNPACK) | `ai_edge_litert` | CPU multihilo | Solo subredes | No disponible | No disponible | No disponible | Paridad a nivel de bit |

Datos adicionales aportados por el autor: el kernel `edge_mix.onnx` sobre 135.000 aristas se ejecuta en 5,73 ms en ONNX GPU frente a 7,15 ms en PyTorch CUDA (1,25 veces más rápido por fusión de operadores). El modelo logra un 92,3 % de paridad con el profesor y un 49,3 % menos de RMSE de un paso que la línea base. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a este dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo es muy pequeño (1,79 M de parámetros); los pesos FP32 ocupan 6,85 MB, FP16/BF16 3,42 MB e INT8 1,71 MB, por lo que la VRAM necesaria es despreciable frente a las activaciones del grafo (~135.000 aristas).
- GPU recomendadas: NVIDIA RTX 3070 Ti Laptop es la referencia medida; cualquier GPU con soporte CUDA y `onnxruntime-gpu` debería funcionar. No se han publicado mediciones en A100, H100 ni RTX 4090.
- Cabe en GPU consumer: sí, con amplio margen; también en CPU de portátil (i9-12900H medido) y en dispositivos ARM vía LiteRT.
- Opciones de despliegue: `onnxruntime-gpu` con `CUDAExecutionProvider`, `onnxruntime` con `CPUExecutionProvider`, `ai_edge_litert` con XNNPACK, y PyTorch nativo con CUDA cuBLAS.
- Latencia y throughput: 275 ms por forward en GPU (p50 867 ms), 356 ms por paso de rollout, 60,75 s para 50 pasos; en CPU, 8.153 ms por forward y 489,16 s para 50 pasos. No se documenta throughput en partículas por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / dominio | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UltraSlim-2L | 1,79 M | Grafo de ~135.000 contactos | 275 ms/paso GPU; 92,3 % paridad con profesor | MIT | Hugging Face |
| HiMGN R4 (profesor) | 6,04 M | Mismo dominio | Referencia de paridad (92,3 % respecto a él) | No disponible | No disponible públicamente en la información |
| Baseline (no especificado) | No disponible | Mismo dominio | RMSE de un paso 49,3 % superior a UltraSlim-2L | No disponible | No disponible |

No se dispone de información sobre otros surrogates GNN comparables (por ejemplo, variantes de MeshGraphNets o GraphNetworkSimulator) en la documentación proporcionada, por lo que la comparativa se limita al profesor y a la línea base citados por el autor.

## Limitaciones y advertencias

- El modelo está especializado en un único dominio (contactos DEM en tambor rotatorio bin-mixer) y no generaliza a otros tipos de simulación física sin reentrenamiento.
- La evaluación se limita a un único trial (DEM Bin-Mixer Trial-02) con 12.962 partículas; no se documenta robustez frente a configuraciones geométricas o regímenes de velocidad distintos.
- El índice Lacey predicho (0,7509) difiere ligeramente del ground truth (0,7448), lo que indica un error residual acumulable en rollouts largos.
- La paridad con el profesor es del 92,3 %, no del 100 %; los errores del profesor se propagan al estudiante.
- No se documentan sesgos en el sentido estadístico-social, pero sí un posible sesgo de distribución hacia las condiciones del dataset de destilación.
- Riesgo de deriva física en rollouts superiores a 50 pasos: no se han publicado validaciones más allá de ese horizonte.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre idoneidad para producción ni sobre la exactitud física en dominios no evaluados.
- El modelo no procesa lenguaje natural pese a la etiqueta `language: en`; no debe emplearse como modelo de texto.
- El repositorio tiene 0,0 GB de tamaño declarado y 110 descargas, con 0 likes; la madurez de la comunidad es baja y no hay evidencia de validación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/pytholove/rotary-bin-lab-ultraslim2l
- Informe de auditoría (referenciado en la model card): `ULTRASLIM2L_ONNX_CLAMPED_ROLLOUT_AUDIT.md` dentro del repositorio
- Especificación de destilación: `spec.json` dentro del repositorio
- Script de rollout: `rollout_ultraslim2l_onnx.py` dentro del repositorio
- No se han encontrado en la búsqueda web papers, blogs, repositorios adicionales ni demos externas asociadas al modelo.
