# electricpipelines/Huihui-Qwen3.5-4B-abliterated-GGUF

## Resumen

Huihui-Qwen3.5-4B-abliterated-GGUF es una redistribución en formato GGUF del modelo Huihui-Qwen3.5-4B-abliterated, una versión del Qwen3.5-4B de Alibaba Qwen a la que se le ha aplicado la técnica de "abliteration" para eliminar sustancialmente los mecanismos de rechazo (refusals) alineados. El repositorio lo publica el usuario electricpipelines como parte de la iniciativa "DeepSeek Unchained" (tier Copper) y contiene un único fichero cuantizado i1-Q4_K_M generado por mradermacher mediante quantización con imatrix, sin remezclar ni recuantizar.

El modelo base tiene 4.205.751.296 parámetros (aproximadamente 4,2 mil millones), lo que lo sitúa en la gama compacta de modelos de lenguaje orientados a generación de texto y conversación. Al estar en formato GGUF, está pensado para su ejecución en llama.cpp y en los múltiples frontends compatibles (Ollama, LM Studio, KoboldCpp, etc.), lo que facilita el despliegue en hardware de consumo.

Su relevancia actual radica en dos factores: por un lado, ofrece una alternativa sin censura alineada con el modelo original Qwen3.5-4B bajo licencia Apache-2.0, lo que permite uso comercial; por otro, la cuantización i1-Q4_K_M seleccionada presenta una divergencia KL media de 0,0435 frente a F16, un tercio menor que la cuantización estática Q4_K_M del mismo tamaño, manteniendo velocidad prácticamente idéntica. Esto lo convierte en una opción eficiente para despliegues locales con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura `qwen35` en llama.cpp); detalles internos no disponibles |
| Parametros totales | 4.205.751.296 |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-Q4_K_M (imatrix) incluida en el repo; el autor referencia cuants IQ3_M, Q3_K_M, IQ4_XS, Q4_K_M, i1-Q4_K_M, Q5_K_M, Q6_K y Q8_0 medidos sobre el mismo modelo base |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (heredada de Qwen/Qwen3.5-4B) |
| Formato de pesos | GGUF (fichero unico, sin mmproj, solo texto) |

Datos adicionales del fichero publicado:

| Parametro | Valor |
|---|---|
| Nombre del fichero | `Huihui-Qwen3.5-4B-abliterated.i1-Q4_K_M.gguf` |
| Tamano | 2.707.514.944 bytes (~2,71 GB) |
| SHA-256 | `7271e08993f5dbaf9c8fcdaf727c0fb2e42c21beea0d1f27e2a943bed4e81b64` |
| Version minima de llama.cpp | Reciente, con soporte de arquitectura `qwen35`; probado con b10919 |
| Modo thinking | Activado por defecto; se desactiva con `enable_thinking=false` en el chat template (`--reasoning off` en llama.cpp) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Qwen3.5-4B mas alla de que se trata de un transformer compatible con la arquitectura `qwen35` de llama.cpp. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO u otras tecnicas de alineacion en el modelo original. Tampoco se especifican innovaciones tecnicas como decodificacion especulativa o mecanismos de atencion lineal.

Lo que si se documenta es el proceso de abliteration aplicado por huihui-ai: se trata de una modificacion de los pesos orientada a eliminar las direcciones de activacion asociadas al rechazo de peticiones, de modo que el modelo deja de negarse a responder a solicitudes que el Qwen3.5-4B original rechazaria. Segun el propio autor, la abliteration elimina rechazos pero no anade conocimiento ni corrige los sesgos presentes en el entrenamiento del modelo base.

La cuantizacion publicada es una i1-Q4_K_M con imatrix, generada por mradermacher y copiada byte a byte. Los datos de calibracion de la cuantizacion se obtuvieron comparando contra el fichero F16 en un Apple M4 Max con 128 GB de memoria, usando `llama-perplexity` sobre wikitext-2-raw (contexto 512, 100 chunks) y `llama-bench` para velocidad. La eleccion de i1-Q4_K_M frente a Q4_K_M estatico se justifica porque, con el mismo tamano (2,71 GB) y velocidad equivalente (1145,2 vs 1141,5 t/s en pp512; 69,98 vs 71,33 t/s en tg128), la divergencia KL media es aproximadamente un tercio menor (0,0435 vs 0,0681).

## Capacidades

- Generacion de texto conversacional multi-turno, segun el pipeline declarado (`text-generation`) y la etiqueta `conversational`.
- Modo thinking por defecto: el modelo razona internamente antes de responder, y puede desactivarse mediante el chat template (`enable_thinking=false` o `--reasoning off` en llama.cpp).
- Respuestas sin rechazo a peticiones que el modelo original rechazaria, gracias a la abliteration.
- Compatibilidad con endpoints de inferencia (`endpoints_compatible`), lo que facilita su integracion en servidores compatibles con la API de OpenAI.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible; el modo thinking sugiere capacidad de razonamiento, pero no se documentan flujos de agente.
- Capacidades multilingues: no disponibles; el repositorio no declara idiomas.
- Vision o audio: no disponible; el fichero es explicitamente solo texto y sin mmproj.
- Generacion de codigo y matematicas: no documentado especificamente en la informacion disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo: con 2,71 GB en Q4_K_M, el modelo cabe en GPUs de consumo con 4 GB o mas de VRAM (o incluso en CPU), lo que permite ejecutar un asistente conversacional sin conexion a servicios en la nube.
- Investigacion sobre alineacion y seguridad: la version abliterated permite estudiar el comportamiento del modelo sin mecanismos de rechazo, comparandolo con el Qwen3.5-4B original para analizar que direcciones de activacion codifican la negativa a responder.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que aborde temas sensibles que el modelo alineado evitarla; util para autores que necesitan explorar temas controvertidos sin friccion del modelo.
- Prototipado rapido de chatbots: al ser compatible con endpoints y con llama.cpp, se puede levantar un servidor local y conectarlo a un frontend conversacional en minutos, con un coste de hardware minimo.
- Evaluacion de cuantizaciones: el repositorio incluye metricas detalladas de KLD, PPL ratio y velocidad para ocho cuantizaciones, lo que lo convierte en un caso de referencia para estudiar el impacto de la cuantizacion imatrix frente a la estatica en modelos de ~4B.
- Analisis de sesgos y contenido: al eliminar los rechazos, el modelo expone de forma mas directa los sesgos y asociaciones del entrenamiento original, lo que puede servir en auditorias de sesgo controladas en entornos de investigacion.
- Fine-tuning y destilacion: al estar bajo Apache-2.0 y en formato GGUF, puede servir como base para experimentos de ajuste o como modelo profesor/estudiante en pipelines de destilacion sobre hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente proporciona metricas de fidelidad de la cuantizacion frente al fichero F16, medidas con llama.cpp b10919:

| Cuant | Tamano (GB) | KLD media | KLD p99 | Mismo token top (%) | Ratio PPL vs F16 | pp512 (t/s) | tg128 (t/s) |
|---|---:|---:|---:|---:|---:|---:|---:|
| i1-IQ3_M | 2,16 | 0,1635 | 1,504 | 83,00 | 1,0564 | 1051,5 | 64,08 |
| Q3_K_M | 2,26 | 0,1971 | 1,882 | 81,49 | 1,0943 | 1045,2 | 61,43 |
| IQ4_XS | 2,45 | 0,0781 | 0,786 | 88,58 | 1,0267 | 1135,5 | 67,79 |
| Q4_K_M | 2,71 | 0,0681 | 0,650 | 89,39 | 1,0435 | 1141,5 | 71,33 |
| i1-Q4_K_M (publicada) | 2,71 | 0,0435 | 0,405 | 91,32 | 1,0363 | 1145,2 | 69,98 |
| Q5_K_M | 3,11 | 0,0194 | 0,186 | 94,23 | 1,0006 | 1154,2 | 62,82 |
| Q6_K | 3,46 | 0,0068 | 0,059 | 96,49 | 1,0053 | 1229,9 | 61,82 |
| Q8_0 | 4,48 | 0,0007 | 0,005 | 98,91 | 1,0050 | 1280,3 | 55,29 |

Mediciones realizadas en un Apple M4 Max con 128 GB de memoria. La KLD se calculo contra los logits F16 sobre wikitext-2-raw (contexto 512, 100 chunks). No hay datos de rendimiento en GPU dedicada.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,8-3,2 GB para el fichero i1-Q4_K_M (2,71 GB de pesos mas overhead de contexto y cache KV); entre 2,2 y 4,5 GB segun la cuantizacion elegida (IQ3_M a Q8_0).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM para Q4_K_M en su totalidad; RTX 3060, RTX 4060, RTX 4090, A100 y H100 lo ejecutan con holgura. Tambien puede correr total o parcialmente en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU discreta moderna con 4 GB o mas; tambien en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp (requiere build reciente con arquitectura `qwen35`, probado con b10919), Ollama, LM Studio, KoboldCpp y cualquier frontend compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con servidores de inferencia tipo API.
- Latencia y throughput: en Apple M4 Max, 1145,2 t/s de prompt processing (pp512) y 69,98 t/s de generacion (tg128) para i1-Q4_K_M. No hay datos de throughput en GPU dedicada.

## Comparativa con modelos similares

La informacion disponible no incluye comparaciones con otros modelos. Se ofrece una comparativa estructural con las variantes directamente relacionadas:

| Modelo | Parametros | Formato | Alineacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| electricpipelines/Huihui-Qwen3.5-4B-abliterated-GGUF (este) | ~4,2B | GGUF i1-Q4_K_M (2,71 GB) | Abliterated | Apache-2.0 | Hugging Face |
| huihui-ai/Huihui-Qwen3.5-4B-abliterated | ~4,2B (5B segun busqueda) | Pesos completos | Abliterated | Apache-2.0 | Hugging Face |
| mradermacher/Huihui-Qwen3.5-4B-abliterated-i1-GGUF | ~4,2B | GGUF (multiples cuants) | Abliterated | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-4B | ~4,2B | Pesos completos | Alineado | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes ni frente a modelos de otros fabricantes de tamano similar.

## Limitaciones y advertencias

- La abliteration elimina los rechazos pero no anade conocimiento ni corrige los sesgos del entrenamiento original; el modelo puede producir contenido sesgado, ofensivo o factualmente incorrecto con mayor facilidad que la version alineada.
- Riesgo elevado de alucinacion, comun en modelos de ~4B y no mitigado por la abliteration.
- El modelo puede cumplir peticiones daninas o ilegales; el usuario es responsable del uso y del contenido generado, segun el propio aviso del autor.
- Longitud de contexto no documentada; no se puede garantizar el comportamiento en ventanas largas.
- Idiomas soportados no declarados; el rendimiento fuera del ingles y el chino (idiomas tipicos de la familia Qwen) es incierto.
- El fichero es solo texto y no incluye mmproj, por lo que no hay capacidades multimodales.
- Requiere una version reciente de llama.cpp con soporte de arquitectura `qwen35`; versiones antiguas no cargaran el modelo.
- El modo thinking esta activado por defecto y aumenta la latencia y el consumo de tokens; debe desactivarse explicitamente si no se necesita.
- Aunque la licencia es Apache-2.0 y permite uso comercial, la ausencia de alineacion de seguridad puede incumplir politicas de plataformas o requisitos regulatorios en determinados contextos (por ejemplo, servicios dirigidos a menores o entornos regulados).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/electricpipelines/Huihui-Qwen3.5-4B-abliterated-GGUF
- Modelo base (abliterated): https://huggingface.co/huihui-ai/Huihui-Qwen3.5-4B-abliterated
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de cuantizaciones de mradermacher: https://huggingface.co/mradermacher/Huihui-Qwen3.5-4B-abliterated-i1-GGUF
- Coleccion Qwen3.5-abliterated de huihui-ai: https://huggingface.co/collections/huihui-ai/qwen35-abliterated
