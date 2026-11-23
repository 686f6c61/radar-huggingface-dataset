# Ashlyn4202025/qwen3.8-27b-kl-iqr-v2

## Resumen

Qwen3.8-27B KL-IQR V2 es un conjunto de cuantizaciones del modelo Qwen/Qwen3.8-27B, publicado por el usuario Ashlyn4202025 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una entrada de competición para el reto de cuantización radiance, orientada específicamente a GPUs AMD con arquitectura RDNA4 (gfx1201). El paquete incluye tres contenedores de pesos cuantizados (Nano, Tiny y Small) más una imagen de motor Docker que los hace ejecutables, ya que las versiones estándar de radiance no pueden leerlos.

La propuesta técnica se basa en una cuantización con activaciones int8 en cada GEMM y pesos leídos en su forma almacenada, con escalas por fila y pesos de normalización entrenados contra el modelo bf16 en el split de calibración del reto. El contenedor Nano entrena unos 4,6 millones de números y el Tiny unos 1,2 millones; el Small no contiene valores entrenados. El resultado son tres ficheros de aproximadamente 3,0, 4,0 y 5,5 bits por peso, con tamaños de 11,0 GB, 14,4 GB y 19,4 GB respectivamente.

Su relevancia es doble: por un lado, demuestra que es posible comprimir un modelo de 27B a rangos de 3 bits por peso manteniendo un motor de inferencia funcional; por otro, está diseñado exclusivamente para hardware AMD RDNA4, un ecosistema con menos soporte de cuantización que NVIDIA. El repositorio ocupa 45,1 GB en total y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.8-27B); no se detalla en la informacion disponible |
| Parametros totales | 27B (modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262 144 tokens (valor usado en el ejemplo de ejecucion con `--max-model-len 262144`) |
| Tipos de cuantizacion | int8 en activaciones; pesos a 2,9989 bits (Nano), 3,9991 bits (Tiny) y 5,4988 bits (Small) por peso |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.rad` (formato propietario del motor radiance), no safetensors ni GGUF |
| Tamano de los contenedores | Nano: 11 014 828 032 bytes; Tiny: 14 377 656 320 bytes; Small: 19 420 073 984 bytes |
| Imagen del motor | `radiance-1.15.1-q38-v2entry.tar.zst` (248 863 919 bytes) |
| Hardware objetivo | AMD RDNA4 (gfx1201), dos tarjetas |
| Repositorio total | 45,1 GB |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen/Qwen3.8-27B, un transformer de 27 000 millones de parametros del que no se detallan en la informacion disponible ni la composicion del dataset de preentrenamiento ni las fases de alineacion (RLHF/DPO). Lo que si se describe con precision es el proceso de cuantizacion post-entrenamiento: se aplica cuantizacion con activaciones int8 en todas las GEMM y pesos almacenados en formato comprimido, con escalas por fila y pesos de normalizacion ajustados contra el modelo bf16 original sobre el split de calibracion del reto radiance.

La innovacion principal es el esquema KL-IQR, que combina una minimizacion de divergencia KL con un criterio de rango intercuartilico para asignar bits por peso. En las variantes Nano y Tiny se entrenan las escalas por fila y los pesos de normalizacion manteniendo congelados los codigos de cuantizacion (4,6 millones de numeros en Nano, 1,2 millones en Tiny); la variante Small no entrena ningun valor. El resultado se empaqueta en contenedores `.rad` que requieren una rama especifica del motor radiance o la imagen Docker incluida, construida a partir del codigo fuente de esa rama. La inferencia se ejecuta con tensor parallelism de 2 (`--tp 2`), cable exacto (`--tp-wire exact`), cache KV en bf16 y un maximo de 16 secuencias concurrentes.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Qwen3.8-27B, si bien la cuantizacion agresiva a 3 bits puede degradar tareas de razonamiento complejo.
- Generacion de codigo y matematicas: presumiblemente conserva parte de la competencia del modelo original, sin datos verificables en la informacion disponible.
- Contexto largo: soporta hasta 262 144 tokens segun la configuracion de ejemplo del autor.
- Inferencia multi-GPU: disenado para ejecutarse con tensor parallelism de 2 en GPUs AMD RDNA4.
- Evaluacion de calidad de cuantizacion: incluye soporte para calcular la divergencia KL respecto a un directorio de referencia (`--kld-ref DIR --kld-out report.json`), util para medir la perdida de calidad introducida.
- Tool calling, function calling, agentes y capacidades multimodales: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Evaluacion de tecnicas de cuantizacion extrema: el paquete permite reproducir el benchmark del reto radiance con las tres variantes y comparar la divergencia KL frente al modelo bf16, lo que sirve para investigar el limite practico de compresion en modelos de 27B.
- Despliegue de un LLM de 27B en hardware AMD de consumo profesional: con la variante Nano (11 GB) es posible servir el modelo en dos GPUs RDNA4 con 16 GB de VRAM cada una, algo inviable con los pesos en bf16.
- Servicio de inferencia con contexto largo: la configuracion de ejemplo admite 262 144 tokens y 16 secuencias concurrentes, adecuada para procesar documentos extensos o historiales de conversacion largos en una sola pasada.
- Laboratorio de pruebas para el ecosistema ROCm: al requerir una imagen Docker concreta y dispositivos `/dev/kfd` y `/dev/dri`, sirve como banco de pruebas para validar pipelines de inferencia sobre ROCm y RDNA4.
- Investigacion sobre escalas por fila entrenadas: las variantes Nano y Tiny incluyen parametros entrenados contra el modelo bf16, lo que permite estudiar el impacto de entrenar solo escalas y normas frente a entrenar los codigos completos.
- Comparativa de motores de inferencia: al depender de una rama no estándar de radiance, es util para contrastar el rendimiento y la fidelidad de este motor con alternativas como llama.cpp o vLLM en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo proporciona los tamanos, el numero de bits por peso y los hashes sha256 de cada contenedor, ademas del mecanismo para generar un informe de divergencia KL (`--kld-ref` / `--kld-out`), pero no se incluyen los valores numericos de dichos informes.

## Requisitos de hardware

- VRAM estimada: al menos 11 GB para la variante Nano, 14,4 GB para Tiny y 19,4 GB para Small, solo para los pesos; hay que sumar la cache KV en bf16, que con 262 144 tokens de contexto y 16 secuencias concurrentes puede ser considerable.
- GPU recomendadas: AMD RDNA4 (gfx1201) exclusivamente, en configuracion de dos tarjetas (`--tp 2`). No se menciona soporte para NVIDIA, CDNA ni generaciones anteriores de RDNA.
- Cabe en GPU de consumo: si, en tarjetas RDNA4 con suficiente VRAM por unidad; el autor no especifica modelos concretos (RX 9070, RX 9070 XT u otros).
- Opciones de despliegue: unicamente el motor radiance, mediante la imagen `perire2019/radiance:1.15.1-q38-v2entry` o compilando la rama del pull request #364. No hay soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.rad` es propietario.
- Requisitos del contenedor: `--device /dev/kfd`, `--device /dev/dri`, `--security-opt seccomp=unconfined`, `--ulimit memlock=-1:-1` y red host.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware |
|---|---|---|---|---|---|
| Qwen3.8-27B KL-IQR V2 (Nano/Tiny/Small) | 27B | 262 144 | 3,0 / 4,0 / 5,5 bits por peso, int8 en activaciones | Apache 2.0 | AMD RDNA4, 2 GPUs |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | bf16 | Apache 2.0 (segun el modelo base) | Multiples plataformas |
| Qwen3.8-27B KL-IQR V1 (nano/tiny/small) | 27B | no disponible | cuantizacion KL-IQR primera version | Apache 2.0 | AMD RDNA4 |
| Cuantizaciones GGUF tipicas de un 27B (Q4_K_M) | 27B | depende del motor | ~4,5 bits por peso | depende del modelo base | CPU, CUDA, ROCm via llama.cpp |

La comparativa con cuantizaciones GGUF es orientativa en cuanto a bits por peso: el paquete KL-IQR V2 no es compatible con llama.cpp y su licencia Apache 2.0 permite uso comercial sin restricciones adicionales, a diferencia de algunos modelos base con licencias personalizadas.

## Limitaciones y advertencias

- Dependencia de una rama no publicada: las versiones estables de radiance no leen estos contenedores; es necesario usar la imagen incluida o compilar la rama del pull request #364, lo que introduce riesgo de mantenimiento y de estabilidad.
- Compatibilidad de hardware muy restringida: solo AMD RDNA4 (gfx1201) y configuracion de dos tarjetas. No funciona en NVIDIA, CDNA ni RDNA3.
- Degradacion por cuantizacion: a 3,0 bits por peso (Nano) es esperable una perdida de calidad en razonamiento, matematicas y generacion de codigo, aunque no se publican metricas que la cuantifiquen.
- Formato propietario `.rad`: no es portable a otros motores de inferencia, lo que dificulta la integracion en pipelines existentes.
- Sin datos de benchmarks ni de evaluacion de sesgos: no hay informacion sobre alucinacion, sesgos conocidos ni rendimiento multilingue.
- Idiomas soportados no documentados: se desconoce si la cuantizacion afecta de forma desigual a idiomas distintos del ingles.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni de validacion independiente por parte de la comunidad.
- Fechas de creacion y actualizacion (noviembre de 2026) posteriores a la fecha habitual de publicacion de Qwen3.8: conviene verificar la procedencia y la integridad de los ficheros mediante los hashes sha256 proporcionados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Ashlyn4202025/qwen3.8-27b-kl-iqr-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio del motor radiance: https://codeberg.org/StillDeadcode/radiance
- Pull request de la entrada: https://codeberg.org/StillDeadcode/radiance/pulls/364
- Entrada V1 Nano: https://huggingface.co/Ashlyn4202025/qwen3.8-27b-kl-iqr-nano
- Entrada V1 Tiny: https://huggingface.co/Ashlyn4202025/qwen3.8-27b-kl-iqr-tiny
- Entrada V1 Small: https://huggingface.co/Ashlyn4202025/qwen3.8-27b-kl-iqr-small
