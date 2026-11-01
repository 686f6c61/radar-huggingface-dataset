# idefinity/flip-student-2step

## Resumen

`flip-student-2step` es un estudiante destilado del modelo de difusión DiT de TripoSplat (VAST-AI), orientado a la generación de 3D Gaussian Splatting a partir de una imagen. El autor, `idefinity`, ha comprimido el modelo docente en dos frentes: reduce el muestreo de 20 pasos Euler con CFG 3 a solo 2 pasos sin CFG, y cuantiza los pesos a int4 (4,50 bits por peso efectivos). El resultado es un checkpoint de 209 MB que sustituye al fichero de difusión fp16 original de 1,48 GB.

La relevancia práctica está en el coste de inferencia: en una GPU T4, la generación pasa de 91-95 s (docente, 20 pasos) a 4,6-5,0 s (estudiante, 2 pasos), una aceleración de 19×. El modelo incluye además una exportación ONNX completa (`dit.int4.onnx`, 294 MB, 6265 nodos) pensada para ejecutarse en WebGPU mediante ONNX Runtime Web, lo que abre la puerta a inferencia 3D en el navegador.

Es importante entender el alcance: **no es una pipeline completa**. Solo reemplaza el fichero `ckpts/diffusion_models/triposplat_fp16.safetensors` dentro de TripoSplat; la codificación de imagen (DINOv3 + Flux2 VAE), el matting (BiRefNet) y el decodificador de gaussianas (octree + Gaussian decoder) siguen siendo los del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) destilado, 28 capas de atención, con cuantización int4 de matrices |
| Parámetros totales | 197.113.141 (dato real de safetensors) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada latente fija `[1, 8192, 16]`; features `[1, 4101, 1280]` y `[1, 4096, 128]`) |
| Tipos de cuantización | int4 (4 bit, escala fp16 cada 32 pesos, simétrica, zero point 8, empaquetado U8 en pares); resto en fp16/fp32 |
| Idiomas soportados | no disponible (modelo imagen→3D, sin interfaz de lenguaje) |
| Licencia | `other`: pesos solo para investigación, no comercial; código GPL-3.0; sujeto a los términos de VAST-AI/TripoSplat |
| Formato de pesos | `model.safetensors` (763 tensores: 204 int4 empaquetados + 204 escalas fp16 + 355 fp16), `dit.int4.onnx` (203 `com.microsoft::MatMulNBits` + resto fp32) |

## Arquitectura y entrenamiento

El modelo es un estudiante de destilación por *flow matching* del DiT de TripoSplat. El docente genera gaussianas 3D con 20 pasos Euler y CFG 3; el estudiante aprende a reproducir el mismo destino con 2 pasos y `guidance=1.0` (sin CFG). El objetivo de entrenamiento es la velocidad media por segmento, `v* = (x_{k+n} − x_k) / Σdt`, con una rejilla de 2 pasos en `[0, 15, 20]` repartida uniformemente en σ (Δσ = 0,5 por segmento), no uniformemente en número de pasos.

El entrenamiento usó 32 imágenes de `DownFlow/fuliji` más las imágenes de ejemplo del repositorio upstream, durante 16 épocas con Adam, alcanzando una pérdida final de 0,0787 (camera 0,0213 / latent 0,0776). La cuantización int4 es simétrica, con una escala fp16 por cada 32 pesos a lo largo de la dimensión K; los 259 MatMul del grafo ONNX se reducen a 203 operaciones `MatMulNBits`, mientras que los 56 restantes corresponden a las QKᵀ y PV de las 28 capas de atención (sin pesos, no cuantizables). La exportación ONNX tiene formas estáticas y 6265 nodos.

## Capacidades

- Generación de 3D Gaussian Splatting a partir de una imagen, en 2 pasos de difusión sin CFG.
- Predicción conjunta de latente de gaussianas (`out_latent [1, 8192, 16]`) y parámetros de cámara (`out_camera [1, 1, 5]`).
- Consumo de features visuales precalculadas: DINOv3 (`[1, 4101, 1280]`) y Flux2 VAE (`[1, 4096, 128]`, con 5 tokens de relleno para alinear a 4101).
- Exportación ONNX con formas estáticas apta para ONNX Runtime Web / WebGPU.
- No soporta tool calling, agentes, razonamiento textual ni capacidades multilingües: es un componente de un pipeline imagen→3D, no un modelo de lenguaje.
- No incluye thinking mode, visión general ni audio.

## Casos de uso

- **Generación 3D en el navegador**: la exportación `dit.int4.onnx` permite ejecutar el paso de difusión en WebGPU vía ONNX Runtime Web. Adecuado para demos interactivas donde el usuario sube una foto y recibe una malla con gaussianas sin instalar nada.
- **Prototipado rápido de assets 3D**: con 4,6-5,0 s por generación en T4, un artista puede iterar decenas de variantes por minuto. El modelo sustituye al fichero de difusión dentro de la pipeline TripoSplat existente.
- **Pipelines de bajo coste en GPU consumer**: 209 MB de checkpoint y 4,50 bits/peso permiten desplegar el paso de difusión en GPUs modestas o en instancias compartidas, reservando la VRAM para el codificador DINOv3 y el decodificador de gaussianas.
- **Investigación en destilación de modelos de difusión**: el repositorio documenta la rejilla de 2 pasos, el objetivo de velocidad media y las métricas de fidelidad frente al docente, lo que lo convierte en un caso de estudio reproducible para destilación few-step.
- **Generación de gaussianas para reconstrucción de escenas**: el modelo produce latentes y cámaras consistentes (cosine de cámara 0,98 frente al docente), útiles como inicialización en pipelines de reconstrucción o *novel view synthesis*.
- **Evaluación de cuantización int4 en DiT**: los datos de fidelidad (cosine latente 0,992, rel-l2 0,123 a nivel de matmul) sirven para estudiar el impacto de int4 en modelos de difusión 3D antes de comprometerse a un despliegue.
- **Integración en herramientas de modelado 3D**: al ser un reemplazo de un único fichero, se puede enchufar en flujos existentes basados en TripoSplat sin reescribir la pipeline.

## Benchmarks y rendimiento

Datos de latencia y fidelidad publicados por el autor (T4, 3 imágenes de fuliji, mismo seed):

| Métrica | Estudiante 2 pasos | Docente 20 pasos |
|---|---|---|
| Tiempo de generación (T4) | 4,6-5,0 s | 91-95 s |
| Opacidad media | 0,48-0,50 | 0,88-0,94 |
| Cosine latente vs docente | 0,49 / 0,67 / 0,68 | — |
| Cosine de cámara vs docente | 0,98 | — |

Calidad de la cuantización int4 (fp32 frente a int4 leído y des-cuantizado):

| Métrica | Valor |
|---|---|
| Cosine latente | 0,992 |
| Rel-l2 latente | 0,123 |
| Cosine de cámara | 0,999 |
| Densidad | 4,50 bits/peso |
| Tamaño | 209.328.746 bytes |

Rendimiento de kernels en ONNX Runtime Web 1.31.1 / Apple Metal-3 (GFLOP/s):

| Operación | ORT WebGPU | Kernels WGSL propios |
|---|---|---|
| MatMulNBits int4 1024→3072 @12294 | 789 | 1591-1796 |
| Atención 1 cabeza L=12294 (materializada) | 406 | 1789 |
| `com.microsoft::Attention` 16 cabezas | 1023 | 1789 |
| Convolución 3×3 128→128 @128² | 711 | 443 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni son aplicables a este tipo de modelo.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explícita. El checkpoint ocupa 209 MB en int4 y el ONNX 294 MB; a ello hay que sumar DINOv3, Flux2 VAE y el decodificador de gaussianas del pipeline upstream (no incluidos en este repositorio).
- **GPU recomendadas**: el autor valida en NVIDIA T4 (16 GB). Para WebGPU, probado en Apple Metal-3. No hay datos publicados para A100, H100 o RTX 4090.
- **GPU consumer**: el tamaño del checkpoint (209 MB) sugiere que el paso de difusión cabe holgadamente en cualquier GPU consumer moderna, pero la pipeline completa depende del codificador y decodificador upstream.
- **Despliegue**: ONNX Runtime (WebGPU vía ORT-web 1.31.1) con `dit.int4.onnx`; también vía `safetensors` cargado en la pipeline TripoSplat de Python. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables).
- **Latencia y throughput**: 4,6-5,0 s por generación en T4 con 2 pasos. En WebGPU, el grafo ONNX completo no alcanza los 60 s según el autor; para lograrlo hay que sustituir la atención por kernels WGSL propios y usar `preferredOutputLocation: 'gpu-buffer'` para el intercambio con ORT. El grafo ONNX no se ha ejecutado de extremo a extremo en CPU (una pasada tarda ~5 minutos).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Pasos de muestreo | Licencia | Formato |
|---|---|---|---|---|---|
| flip-student-2step | 197,1 M | latente `[1, 8192, 16]` | 2 (sin CFG) | other (solo investigación) | safetensors, ONNX int4 |
| VAST-AI/TripoSplat (docente) | no disponible | misma entrada | 20 + CFG 3 | ver upstream | safetensors fp16 (1,48 GB) |
| Alternativas imagen→3D | no disponible | no disponible | no disponible | no disponible | no disponible |

La información disponible solo permite comparar con el docente TripoSplat. No se han proporcionado datos de otros modelos imagen→3D comparables (por ejemplo, variantes de TripoSR o similares) en la documentación consultada.

## Limitaciones y advertencias

- **No es una pipeline completa**: requiere el codificador DINOv3 + Flux2 VAE, el matting BiRefNet y el decodificador de gaussianas de TripoSplat. Solo reemplaza el fichero de difusión.
- **Pérdida de calidad medible**: la opacidad cae a la mitad (0,48-0,50 frente a 0,88-0,94) y la escala resulta mayor (0,0057 frente a 0,0030); los bordes aparecen ligeramente difusos.
- **Fidelidad latente baja frente al docente**: cosine de 0,49-0,68. El autor advierte que no es un indicador directo de calidad (el propio docente a 4 pasos tiene distancias mayores), pero limita el uso en aplicaciones que dependan de precisión geométrica.
- **Parámetros de muestreo obligatorios**: usar `steps=2, shift=1.0, guidance=1.0`. Aplicar los parámetros del docente (`steps=50, shift=3, guidance=7`) produce resultados borrosos.
- **Licencia restrictiva**: los pesos son solo para investigación y no comerciales; el código es GPL-3.0. Cualquier uso comercial requiere revisar los términos de VAST-AI/TripoSplat.
- **Sin validación en CPU**: el grafo ONNX no se ha ejecutado de extremo a extremo en CPU; la evidencia de corrección int4 es a nivel de matmul (cosine 0,997, rel-l2 0,073).
- **Dataset de entrenamiento muy reducido**: 32 imágenes de fuliji más ejemplos del upstream. Riesgo de sobreajuste y de generalización limitada a dominios distintos.
- **Sin datos de sesgos**: no hay información sobre sesgos demográficos o culturales; al ser un modelo imagen→3D, los sesgos provendrían de los datos de entrenamiento del docente y del dataset.
- **Riesgo de alucinación geométrica**: como todo modelo generativo 3D, puede producir geometría plausible pero incorrecta en objetos no representados en el entrenamiento.
- **Idiomas**: no aplica, pero tampoco hay soporte de instrucciones en lenguaje natural; la entrada es una imagen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/idefinity/flip-student-2step
- Modelo base (docente): https://huggingface.co/VAST-AI/TripoSplat
- Dataset de entrenamiento: `DownFlow/fuliji` (referenciado en la model card; sin URL directa en la información disponible)
- ONNX Runtime Web: no se proporciona enlace en la información disponible.
- Repositorio de código (GPL-3.0): no se proporciona enlace en la información disponible.
