# JustAnotherUser1/TRELLIS.2-ROCm-INT4

## Resumen

TRELLIS.2-ROCm-INT4 es una version cuantizada del modelo microsoft/TRELLIS.2-4B, un sistema de generacion image-to-3D desarrollado por Microsoft. Esta variante, publicada por el usuario JustAnotherUser1, aplica cuantizacion INT4 a los flow DiTs y INT8 a los decodificadores latentes para reducir el peso de los pesos de 11,0 GB a 4,4 GB y el pico de VRAM de 2,72 GiB a 2,02 GiB, manteniendo la geometria practicamente intacta. Esta pensada especificamente para GPUs AMD con ROCm, probada en una RX 7900 XTX.

La relevancia de esta ficha radica en que democratiza la ejecucion de un modelo de generacion 3D de 4B parametros en hardware consumer AMD, un ecosistema tradicionalmente menos cubierto por las optimizaciones de cuantizacion que el de NVIDIA. La calibracion se ha hecho bloque a bloque con RoundBit (estilo AutoRound, con redondeo aprendido y escalas de grupo, INT4 con group size 64), mientras que los decodificadores usan INT8 weight-only con group size 128.

El modelo conserva el pipeline completo de TRELLIS.2 (estructura dispersa, shape SLAT y texture SLAT) y produce mallas 3D texturizadas en formato GLB. No es un modelo de lenguaje: es un pipeline de generacion 3D que combina flow matching con un encoder de imagen DINOv3 y decodificadores latentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow DiTs (diffusion transformers) con decodificadores latentes; pipeline TRELLIS.2 (sparse structure + shape SLAT + texture SLAT) |
| Parametros totales | 4B (modelo base microsoft/TRELLIS.2-4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de imagen) |
| Tipos de cuantizacion | INT4 (DiTs, group size 64, RoundBit/AutoRound) e INT8 weight-only (decodificadores, group size 128) |
| Idiomas soportados | no disponible (modelo image-to-3D, no linguistico) |
| Licencia | MIT (pesos derivados de microsoft/TRELLIS.2-4B, MIT); el runtime RoundBit del repositorio GitHub tiene sus propios terminos |
| Formato de pesos | PyTorch empaquetado (.pt) con codigos INT y escalas fp16 por grupo; no usa safetensors |

## Arquitectura y entrenamiento

El modelo base TRELLIS.2-4B es un pipeline de generacion 3D que combina varios flow DiTs: un modelo de estructura dispersa, modelos de shape SLAT (a 512 y 1024) y modelos de texture SLAT (a 512 y 1024), junto con decodificadores latentes que convierten las representaciones SLAT en geometria y textura final. La entrada de imagen se procesa con un encoder DINOv3 (gated en el repositorio de Microsoft). Esta variante cuantizada no reentrena el modelo: aplica calibracion post-entrenamiento bloque a bloque con RoundBit sobre las capas lineales y convolucionales de cada DiT, y cuantizacion INT8 weight-only sobre los decodificadores.

Cada archivo `.pt` del repositorio reemplaza unicamente las capas cuantizadas de su modelo correspondiente; el resto de componentes (norms, embeddings, decodificador de estructura dispersa y encoder DINOv3) se sigue cargando desde microsoft/TRELLIS.2-4B. Los logs de calibracion (`*.blocks.jsonl`) registran el error por bloque. No se dispone de informacion sobre el numero de tokens de entrenamiento ni sobre la composicion del dataset original en la informacion proporcionada.

## Capacidades

- Generacion de mallas 3D texturizadas a partir de una imagen de entrada (image-to-3D), en formato GLB.
- Pipeline configurable en dos modos: `512` (rapido) y `1024_cascade` (mayor resolucion).
- Generacion de geometria (shape SLAT) y textura (texture SLAT) de forma separada.
- Ejecucion en GPUs AMD con ROCm mediante kernels Triton INT4 propios del repositorio.
- Reproducibilidad por semilla (seed 42 en los ejemplos documentados).
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades linguisticas: no es un modelo de lenguaje.

## Casos de uso

- Prototipado rapido de assets 3D en estudio de videojuegos: a partir de un concept art o una foto, generar un GLB texturizado en una RX 7900 XTX con un pico de 2,02 GiB de VRAM, lo que permite iterar en hardware consumer sin GPU profesional.
- Generacion de assets para e-commerce: convertir fotos de producto en mallas 3D para visores web o configuradores, usando el pipeline `512` para previsualizacion y `1024_cascade` para la version final.
- Pipeline de realidad aumentada: producir modelos 3D ligeros (GLB) a partir de imagenes de referencia para su carga en visores AR, aprovechando la reduccion de pesos a 4,4 GB para despliegue en estaciones de trabajo AMD.
- Investigacion en cuantizacion de modelos generativos 3D: el repositorio incluye logs de calibracion por bloque y kernels Triton INT4, utiles para estudiar el impacto de RoundBit en flow DiTs.
- Automatizacion de catalogos 3D: integracion en scripts por lotes (`generate.sh`) que procesan imagenes y generan GLB de forma desatendida en servidores con GPUs AMD.
- Desarrollo en entornos sin CUDA: equipos con ROCm que necesitan un pipeline image-to-3D funcional sin depender de GPUs NVIDIA, gracias a los kernels Triton y la calibracion especifica para AMD.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son de consumo de memoria (pipeline 512, seed 42):

| Configuracion | Pesos cargados | Pico de VRAM |
|---|---|---|
| Stock (bf16 DiTs, fp16 decoders) | 11,0 GB | 2,72 GiB |
| INT4 DiTs + INT8 decoders | 4,4 GB | 2,02 GiB |

No se han publicado resultados de benchmarks cualitativos (FID, CLIP score, Chamfer distance, etc.) en la informacion disponible. El autor indica que la geometria se mantiene a la par de los modelos stock, que los decodificadores INT8 son practicamente lossless y que los DiTs INT4 cambian ligeramente la muestra (una misma semilla produce un objeto ligeramente distinto). Perdida conocida documentada: en el ejemplo `T.png`, el cilindro de cristal sale como metal oscuro.

## Requisitos de hardware

- VRAM estimada para inferencia: pico de 2,02 GiB con INT4 DiTs + INT8 decoders (frente a 2,72 GiB en stock). Los pesos en disco ocupan 4,4 GB.
- GPU recomendadas: AMD RX 7900 XTX (probada por el autor). Al usar ROCm y kernels Triton, requiere una GPU AMD compatible con ROCm; no se documentan otras GPUs probadas.
- Cabe en GPU consumer: si, al menos en RX 7900 XTX con 24 GB; el pico de 2,02 GiB sugiere margen amplio, aunque no se documentan pruebas en GPUs de menor VRAM.
- Opciones de despliegue: repositorio GitHub propio con `setup.sh` y `generate.sh`, runtime INT con kernels Triton INT4. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este pipeline).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| TRELLIS.2-ROCm-INT4 | 4B (base) | no aplica | INT4 + INT8 | MIT | AMD ROCm |
| microsoft/TRELLIS.2-4B (stock) | 4B | no aplica | bf16 / fp16 | MIT | CUDA / generico |
| Otros modelos image-to-3D | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes en la informacion proporcionada; la unica comparacion documentada es de memoria (11,0 GB / 2,72 GiB stock frente a 4,4 GB / 2,02 GiB cuantizado).

## Limitaciones y advertencias

- La cuantizacion INT4 de los DiTs altera ligeramente la muestra: una misma semilla produce un objeto distinto al del modelo stock. No es determinista respecto al original.
- Perdida de calidad documentada en materiales: el cilindro de cristal del ejemplo `T.png` sale como metal oscuro.
- Requiere acceso al repositorio microsoft/TRELLIS.2-4B y al encoder DINOv3, que esta gated; sin acceso, el modelo no funciona.
- Dependencia de ROCm y de kernels Triton propios: solo probado en RX 7900 XTX; no hay garantia en otras GPUs AMD ni en NVIDIA.
- Los pesos estan en `.pt` empaquetados, no en safetensors, lo que complica la integracion con herramientas estandar.
- El runtime RoundBit del repositorio GitHub tiene sus propios terminos de licencia, distintos del MIT de los pesos.
- Riesgo de alucinacion geometrica: al ser un modelo generativo 3D, puede producir geometria o texturas no fieles a la imagen de entrada.
- Sin informacion sobre sesgos, idiomas ni rendimiento en dominios especificos (organico, mecanico, personajes).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validacion comunitaria muy limitados.

## Enlaces

- Hugging Face: https://huggingface.co/JustAnotherUser1/TRELLIS.2-ROCm-INT4
- Modelo base: https://huggingface.co/microsoft/TRELLIS.2-4B
- Repositorio de codigo: https://github.com/WifiLast/TRELLIS.2-ROCm-INT4
