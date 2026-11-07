# decido-ai/decido-1-max-26b-a4b

## Resumen

Decido-1-Max (26B-A4B) es un modelo de decisión calibrada desarrollado por decido-ai, construido como un fine-tune de `google/gemma-4-26B-A4B-it`. No es un modelo generativo de propósito general: recibe un estado (texto o JSON) y un conjunto de preguntas tipadas (sí/no, elección entre opciones, escalas ordenadas) y devuelve una probabilidad calibrada para cada respuesta. Su tarea es sustituir a sistemas de clasificación y enrutamiento basados en LLM por un modelo único que emite distribuciones de probabilidad fiables en lugar de texto libre.

El modelo es el resultado de destilar un sistema de investigación de tres modelos (Decido-1 + Decido-1-Think + Qwen3.8-27B, con una puntuación de 89,57 en la métrica de seis grupos de la comunidad Jev) en un único conjunto de pesos sobre la base Gemma-4-26B-A4B, una arquitectura MoE con aproximadamente 4B de parámetros activos. La destilación se realizó sobre 100.000 preguntas de entrenamiento, conservando el razonamiento greedy de Decido-1-Think y entrenando el paso de respuesta con una mezcla al 50% de anclaje a gold y al 50% de la distribución del profesor.

Su relevancia actual reside en que iguala estadísticamente al sistema de tres modelos del que procede (−0,34 en la diferencia pareada, con intervalo de confianza que cruza cero) manteniendo una única implementación desplegable, y en que supera a Jev 1.13 en los seis grupos de benchmark con mejor calibración (Brier inferior en 5 de 5 comprobaciones). La licencia Apache 2.0 y el soporte de llama.cpp facilitan su adopción en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Gemma 4, mezcla de expertos) |
| Parámetros totales | 25.805.933.872 (~25,8B) |
| Parámetros activos | ~4B (designación A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF 8-bit (según repositorio GitHub); bf16 para vLLM |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Gemma-4-26B-A4B, un transformer con mezcla de expertos de 25,8B parámetros totales y aproximadamente 4B activos por token, ajustado mediante LoRA sobre el checkpoint instructivo original. La inferencia utiliza el canal de razonamiento ("thinking channel") de Gemma 4 en modo greedy con un límite de 1.024 tokens: el modelo razona paso a paso y después emite la distribución de etiquetas.

El entrenamiento es una destilación desde un sistema profesor de tres modelos con gating por pregunta (Decido-1, Decido-1-Think y Qwen3.8-27B), que obtiene 89,57 en la métrica de seis grupos. Se usaron 100.000 preguntas de entrenamiento; se conservó el razonamiento greedy propio de Decido-1-Think y el paso de respuesta se entrenó sobre 71.432 filas con una mezcla de 0,5 × respuesta anclada a gold y 0,5 × distribución de respuestas del profesor. El checkpoint final se seleccionó mediante una regla de validación pre-registrada antes de ejecutar los benchmarks. El modelo trata el documento de entrada como datos no confiables: neutraliza cadenas de tokens de control y no sigue instrucciones embebidas en el texto.

## Capacidades

- Clasificación y decisión con probabilidad calibrada por opción: preguntas de sí/no, elección única entre 2 y 255 opciones y escalas ordenadas de 2 a 10 niveles.
- Razonamiento interno de hasta 1.024 tokens (greedy) antes de emitir la respuesta.
- Salida en formato wire compatible con la API "System One" de Jev 1.13 (`noul`, `choice` con probabilidades y confianza, `score` con leyenda).
- Procesamiento de documentos en texto plano o JSON como estado de entrada.
- Robustez frente a inyección de instrucciones en el documento (tratado como datos no confiables).
- API programática (SDK `decido-ai`), CLI (`decido run`) y servidor HTTP (`decido serve`, endpoint `POST /v1/systemone`).
- Compatibilidad con clientes existentes de Jev mediante `TYPESAFE_BASE_URL`.
- Ejecución en GPU (vLLM) y en CPU o GPU de Mac (llama.cpp, GGUF 8-bit).
- Solo inglés: no se declara soporte multilingüe.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket y devuelve la probabilidad de cada equipo destino (facturación, envío, técnico) junto con la urgencia en escala ordenada, permitiendo umbrales de confianza para escalado humano cuando la probabilidad máxima es baja.
- Moderación y triaje de contenido: preguntas de sí/no con probabilidad calibrada permiten fijar umbrales operativos defendibles, ya que el ECE del modelo (0,017–0,064 en las comprobaciones publicadas) es bajo frente a Jev.
- Automatización de back office con documentos JSON: al aceptar el estado como JSON, puede clasificar solicitudes estructuradas (reembolsos, incidencias, reclamaciones) sin preprocesado adicional.
- Clasificación por lotes de alta throughput: con vLLM sobre una A100 80 GB alcanza 3,6–6,3 preguntas/s saturado, adecuado para reprocesar colas de tickets o formularios por la noche.
- Sustitución de un pipeline multi-modelo: al igualar al sistema de tres modelos con una sola implementación, reduce la superficie operativa (un checkpoint, un servidor, un contrato de API) en despliegues que hoy encadenan varios LLM para decidir.
- Despliegue en hardware modesto para prototipos: la variante GGUF 8-bit corre en CPU de portátil (lento) o GPU de Mac, lo que permite validar flujos de decisión sin infraestructura GPU dedicada.
- Encuestas y escalas tipo Likert automatizadas: la modalidad `score` con 2–10 niveles y leyenda devuelve directamente la distribución sobre la escala, útil para anotación asistida de datos.

## Benchmarks y rendimiento

Métrica de seis grupos de la comunidad Jev (media de la métrica de tipo accuracy por grupo):

| Grupo de benchmark | Decido-1-Max (GPU) | Decido-1-Think (GPU) | Decido-1 (GPU) | Jev 1.13 (publicado) |
|---|---:|---:|---:|---:|
| JevBench | 96,08 | 94,33 | 88,17 | 87,18 |
| Kev | 86,12 | 85,63 | 84,46 | 85,52 |
| OpenJev (18 tareas) | 84,44 | 83,63 | 78,39 | 72,96 |
| Nimble | 93,97 | 92,55 | 88,65 | 91,84 |
| VitaminC | 85,64 | 86,98 | 87,15 | 78,46 |
| MASSIVE | 89,14 | 89,14 | 88,57 | 87,14 |
| **Media de seis grupos** | **89,23** | **88,71** | **85,90** | **83,85** |

Comparación pareada: +3,38 frente a Decido-1 (IC 95% +2,45 a +4,31); −0,34 frente al sistema de tres modelos (IC 95% −0,97 a +0,29). Intervalo de confianza del 95% de la media: 88,25–90,15.

Calibración (GPU):

| Comprobación | Brier | Jev 1.13 | ECE | Jev 1.13 |
|---|---:|---:|---:|---:|
| JevBench | 0,067 | 0,181 | 0,064 | 0,032 |
| Kev v4 dev | 0,191 | 0,211 | 0,019 | 0,049 |
| Kev v9 dev | 0,205 | 0,212 | 0,017 | 0,034 |
| VitaminC | 0,204 | 0,313 | 0,037 | 0,104 |
| MASSIVE | 0,159 | 0,204 | 0,040 | 0,075 |

Brier igual o mejor que Jev en 5 de 5; ECE igual o mejor en 4 de 5. Inversiones por orden de opciones: 2,9% agrupado (Jev 14,6%).

Velocidad: en GPU (vLLM, bf16, una A100 80 GB), un documento de ~1.000 tokens con 5 preguntas tarda 10,1 s de mediana (las preguntas razonan en paralelo); throughput saturado de 3,6–6,3 preguntas/s. Determinismo en GPU: repetir 50 peticiones cambió la respuesta principal el 8% de las veces (Jev: 4,3%); los runtimes de CPU y GPU de Mac son deterministas. La latencia en portátil está pendiente de medición según la model card.

## Requisitos de hardware

- VRAM estimada: ~52 GB en bf16 para los 25,8B parámetros totales; ~26 GB en GGUF 8-bit. No se publica cifra oficial de VRAM.
- GPU recomendadas: una A100 80 GB para vLLM en bf16 (configuración usada en los benchmarks); el sistema de investigación de la familia XL requiere 4× A100 80 GB, pero este modelo no.
- GPU de consumo: no se confirma compatibilidad con RTX 4090 (24 GB) en bf16; la variante GGUF 8-bit (~26 GB) tampoco cabría entera en 24 GB sin offload. En CPU de portátil funciona con ~30 GB de RAM según la tabla de la familia (dato de Decido-1, mismo tamaño).
- Despliegue: vLLM (GPU, bf16), llama.cpp con GGUF 8-bit (CPU y GPU de Mac), SDK `decido-ai` con `decido serve` (HTTP, API compatible con Jev), CLI `decido run`.
- Latencia: 10,1 s p50 para documento de 1k tokens y 5 preguntas en A100 80 GB; throughput 3,6–6,3 preguntas/s.
- Nota: `decido build-runtime` solo es necesario en Linux e Intel Mac (requiere cmake y compilador C++); en Apple Silicon se omite.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Puntuación seis grupos | Licencia | Hardware |
|---|---|---|---|---|---|
| Decido-1-Max (este) | Gemma-4-26B-A4B | 25,8B totales / ~4B activos | 89,23 | Apache 2.0 | GPU; portátil lento |
| Decido-1-Think | Gemma-4-26B-A4B | 25,8B totales / ~4B activos | 88,71 | no disponible | GPU; CPU lenta (~10–19 s/pregunta) |
| Decido-1 | Gemma-4-26B-A4B | 25,8B totales / ~4B activos | 85,38 (CPU) | no disponible | CPU portátil (~30 GB RAM) o GPU |
| Decido-1-Fast | Qwen3-1.7B | 1,7B | 73,01 (CPU) | no disponible | CPU portátil (~3 GB RAM) |
| Decido-1-Ultra | Qwen3-0.6B | 0,6B | 62,16 (CPU) | no disponible | CPU portátil (~1,5 GB RAM) |
| Jev 1.13 (referencia propietaria) | no disponible | no disponible | 83,85 | propietaria | API |

Frente a Decido-1-Think, Max gana +0,52 puntos y evita el coste de razonamiento largo por pregunta (~19 s en GPU frente a 10,1 s para cinco preguntas en paralelo). Frente a Decido-1, la mejora es de +3,38 puntos pareados. La alternativa de menor huella de la familia es Decido-1-Ultra, con 27 puntos menos de precisión pero ejecutable en 1,5 GB de RAM.

## Limitaciones y advertencias

- Solo inglés: la model card declara `en` como único idioma; el rendimiento en castellano u otros idiomas no está evaluado.
- No es un modelo generativo: no produce texto libre ni mantiene conversaciones; su salida es una distribución de probabilidad sobre opciones predefinidas.
- Determinismo parcial en GPU: con vLLM, el 8% de las repeticiones cambian la respuesta principal por ruido de coma flotante a nivel de lote; para flujos que exijan reproducibilidad estricta hay que usar el runtime de CPU o GPU de Mac.
- Riesgo de alucinación acotado pero presente: el razonamiento greedy puede derivar en cadenas incorrectas, especialmente con documentos largos o ambiguos; la calibración mitiga pero no elimina el error.
- ECE peor que Jev en JevBench (0,064 frente a 0,032): la calibración no es uniformemente superior en todos los dominios.
- Longitud de contexto no documentada: no se especifica la ventana máxima; los benchmarks usan documentos de ~1.000 tokens, y no hay datos sobre documentos más largos.
- Latencia en portátil sin publicar: la model card indica que está "being measured"; no hay cifras fiables para planificación de capacidad en CPU.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de Gemma 4 y de un corpus de entrenamiento en inglés, hereda los sesgos del modelo base y del conjunto de preguntas.
- Uso comercial: la licencia Apache 2.0 lo permite sin restricciones adicionales conocidas; conviene verificar las condiciones del modelo base Gemma 4 de Google, que pueden añadir términos propios.
- Madurez: repositorio con 0 descargas y 1 like en el momento de la consulta; el ecosistema (SDK, servidor) es joven y la compatibilidad con Jev se limita al formato wire documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/decido-ai/decido-1-max-26b-a4b
- Repositorio GitHub del proyecto: https://github.com/decido-ai/decido
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Decido-1: https://huggingface.co/decido-ai/decido-1-26b-a4b
- Decido-1-Fast: https://huggingface.co/decido-ai/decido-1-fast-1.7b
- Decido-1-Ultra: https://huggingface.co/decido-ai/decido-1-ultra-0.6b
- Decido-1-Think: https://huggingface.co/decido-ai/decido-1-think-26b-a4b
- Decido-1-XL: https://huggingface.co/decido-ai/decido-1-xl
