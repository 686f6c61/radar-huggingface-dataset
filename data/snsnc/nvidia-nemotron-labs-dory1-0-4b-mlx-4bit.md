# snsnc/NVIDIA-Nemotron-Labs-Dory1.0-4B-mlx-4bit

## Resumen

NVIDIA-Nemotron-Labs-Dory1.0-4B-mlx-4bit es una cuantizacion de 4 bits en formato MLX del modelo `nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16`, publicada por el usuario snsnc. No se trata de un modelo nuevo ni de un ajuste fino: el autor indica explicitamente que solo ha aplicado cuantizacion con `mlx_lm.convert -q --q-bits 4 --q-group-size 64`, sin entrenamiento, fusion de pesos ni otras modificaciones. El modelo base lo desarrolla NVIDIA dentro de su linea Nemotron Labs.

El repositorio pesa 2,3 GB y contiene 3.975.229.440 parametros (~3,98 mil millones) en safetensors, lo que lo situa en la categoria de modelos pequenos y desplegables en hardware de consumo. Su interes practico es que permite ejecutar un modelo de casi 4B en Apple Silicon con un consumo de memoria reducido gracias a la cuantizacion de 4 bits, a traves de `mlx-lm`.

La informacion disponible es escasa: no se documentan arquitectura detallada, longitud de contexto, idiomas, composicion del dataset ni resultados de benchmarks. El autor advierte ademas de que la perdida de precision del 4-bit provoca desviaciones frente al BF16 y de que los benchmarks del modelo original pueden no reproducirse. La licencia de los pesos es OpenMDW-1.1 segun la model card, aunque el campo de licencia del repositorio aparece como `other`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el pipeline es `text-generation`; no se detalla la arquitectura en la informacion proporcionada) |
| Parametros totales | 3.975.229.440 (~3,98 mil millones) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit MLX con `q-group-size 64`; el modelo base se distribuye en BF16 |
| Idiomas soportados | no disponible |
| Licencia | `other`; la model card indica OpenMDW-1.1 para los pesos |
| Formato de pesos | safetensors (MLX), cuantizados a 4 bits |

Otros datos: tamano del repositorio 2,3 GB, libreria `mlx`, pipeline `text-generation`, 0 descargas y 0 likes en el momento de la consulta, creado el 2026-10-17 y actualizado el 2026-10-17.

## Arquitectura y entrenamiento

No se proporciona informacion sobre la arquitectura interna del modelo base (tipo de transformer, atencion, posibles innovaciones como decodificacion especulativa o atencion lineal). Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF, DPO u otro ajuste por preferencias. Lo unico verificable es el pipeline declarado, `text-generation`, y el numero de parametros del checkpoint.

Respecto al proceso de cuantizacion, el autor es explicito: se uso `mlx_lm.convert -q --q-bits 4 --q-group-size 64`, una conversion puramente de precision, sin entrenamiento posterior ni merging. El empaquetado MLX sigue el trabajo de `netprojects/dory-mlx` (Apache-2.0), con port a MLX atribuido a Paris Michalas (NetProjects). El resultado son pesos de 4 bits que ocupan 2,3 GB frente al checkpoint BF16 original.

## Capacidades

- Generacion de texto conversacional: el repositorio declara el tag `conversational` y el pipeline `text-generation`.
- Conversacion multi-turno: el formato esta pensado para uso con `mlx-lm`, que aplica la plantilla de chat del modelo base.
- Inferencia local en Apple Silicon: integracion nativa con MLX y Metal.
- Capacidades especificas del modelo base (razonamiento, codigo, matematicas, tool calling, agentes, vision o audio): no disponibles en la informacion proporcionada.
- Soporte multilingue: no disponible; no se declaran idiomas en el repositorio.
- Modo thinking o decodificacion extendida: no disponible.

## Casos de uso

- Prototipado local en Mac: cargar el modelo con `mlx-lm` para probar el comportamiento de la familia Nemotron Labs Dory 4B sin depender de GPUs NVIDIA ni de servicios en la nube, gracias a los 2,3 GB de pesos.
- Desarrollo de asistentes conversacionales offline: al ejecutarse sobre Apple Silicon con MLX, encaja en aplicaciones de escritorio o herramientas internas donde no se permite enviar datos a APIs externas.
- Evaluacion comparativa de cuantizaciones: sirve como referencia para medir la degradacion de calidad frente al checkpoint BF16 del mismo modelo en tareas concretas del dominio propio.
- Generacion de texto por lotes en equipos de desarrollo: el bajo peso del checkpoint permite generar resumenes, borradores o respuestas plantilla en portatiles Mac sin infraestructura adicional.
- Base para experimentos de ajuste ligero: al ser un modelo de ~4B, es viable hacer LoRA o pruebas de prompting sobre el, aunque la cuantizacion 4-bit limita el ajuste directo y requeriria partir del BF16.
- Integracion en pipelines de CI para pruebas de regresion de prompts: ejecutar el modelo cuantizado como "modelo de referencia" en tests automatizados de calidad de respuestas, con un coste de memoria acotado.
- Educacion e investigacion: analisis del efecto de la cuantizacion 4-bit con group size 64 en modelos de ~4B, comparando salidas frente al original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de resultados y advierte explicitamente de que, al perder precision con 4 bits, las salidas se desvian ligeramente del BF16 y los benchmarks del modelo original pueden no reproducirse. No se deben asumir, por tanto, las cifras del modelo base para esta version cuantizada.

## Requisitos de hardware

- VRAM / memoria unificada estimada: los pesos ocupan 2,3 GB; con overhead de ejecucion (KV cache, buffers de MLX) es razonable reservar en torno a 3-4 GB, aunque no se publica una cifra oficial.
- Cabe en GPU de consumo: si, en cualquier Mac con Apple Silicon y 8 GB o mas de memoria unificada. No esta pensado para GPUs NVIDIA o AMD, ya que MLX requiere Metal.
- GPU recomendadas: no aplica en el sentido habitual; el entorno objetivo son chips Apple M1/M2/M3/M4 (y variantes Pro, Max, Ultra) con memoria unificada suficiente.
- Opciones de despliegue: `mlx-lm` (CLI `mlx_lm.generate`, `mlx_lm.server` para API compatible con OpenAI). No es compatible con vLLM, TGI, llama.cpp u Ollama sin una conversion previa a otro formato.
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo para esta cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Precision / formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-Labs-Dory1.0-4B-mlx-4bit (este) | ~3,98 B | 4-bit MLX, safetensors, 2,3 GB | no disponible | `other` (OpenMDW-1.1 segun model card) | HuggingFace, 0 descargas |
| nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16 (base) | ~3,98 B | BF16, safetensors | no disponible | OpenMDW-1.1 | HuggingFace, oficial de NVIDIA |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en el material proporcionado, por lo que no se puede establecer una comparativa de rendimiento con alternativas de terceros. La unica comparacion documentable es frente al checkpoint BF16 original: misma arquitectura y parametros, distinta precision, con la advertencia del autor de que las salidas del 4-bit se desvian del BF16.

## Limitaciones y advertencias

- Perdida de precision: la cuantizacion 4-bit degrada la calidad frente al BF16; el propio autor avisa de que las salidas se desvian ligeramente y de que los benchmarks del modelo original pueden no reproducirse.
- Sin datos de evaluacion: no hay benchmarks propios de esta version, ni mediciones de perplexity o de calidad conversacional.
- Validacion nula de la comunidad: 0 descargas y 0 likes; es una conversion de terceros (usuario snsnc), no una publicacion oficial de NVIDIA.
- Idiomas y contexto desconocidos: no se declaran idiomas soportados ni longitud de ventana, lo que impide garantizar un comportamiento correcto en castellano o en contextos largos.
- Restricciones de licencia: el campo del repositorio es `other` y la model card remite a OpenMDW-1.1; es imprescindible revisar los terminos de NVIDIA antes de un uso comercial.
- Dependencia de plataforma: solo se ejecuta en Apple Silicon mediante MLX; no hay versiones GGUF ni soporte para CUDA en este repositorio.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como en cualquier modelo generativo de ~4B, debe asumirse y mitigarse con verificacion externa.
- Sesgos: no documentados.
- Fecha de publicacion atipica: el repositorio figura creado el 2026-10-17, dato que conviene verificar antes de citarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/snsnc/NVIDIA-Nemotron-Labs-Dory1.0-4B-mlx-4bit
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16
- Libreria MLX LM: https://github.com/ml-explore/mlx-lm
- Empaquetado MLX de referencia: https://github.com/internet-projects/dory-mlx
