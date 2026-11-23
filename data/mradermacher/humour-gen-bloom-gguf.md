# mradermacher/humour-gen-bloom-GGUF

## Resumen

`humour-gen-bloom-GGUF` es una colección de cuantizaciones estáticas en formato GGUF del modelo `likhithasapu/humour-gen-bloom`, publicada por el usuario mradermacher el 27 de diciembre de 2024. El modelo base es un transformer de tipo BLOOM con 816.115.712 parámetros (aproximadamente 816 millones), orientado a la generación de texto en inglés y, por el nombre, especializado en la producción de contenido humorístico. Esta ficha describe la versión cuantizada, que es la que se distribuye en este repositorio.

El repositorio no aporta información sobre el dataset de entrenamiento, el proceso de ajuste fino ni los hiperparámetros del modelo base; la model card se limita a listar los ficheros GGUF generados y a remitir a la documentación habitual de TheBloke sobre el uso de este formato. El tamaño total del repositorio es de 8,0 GB, aunque los ficheros individuales van desde 0,5 GB (Q2_K) hasta 1,7 GB (f16).

La relevancia de esta ficha es limitada pero concreta: permite ejecutar un modelo de 816 M de parámetros en hardware de consumo mediante llama.cpp u Ollama, con cuantizaciones que caben en menos de 1 GB de VRAM en los formatos más agresivos. Es útil para experimentación con generación de texto creativo en inglés y para validar pipelines de cuantización, no para tareas de razonamiento complejo o producción crítica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BLOOM (según el nombre del modelo base; no confirmado en la model card) |
| Parametros totales | 816.115.712 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base `likhithasapu/humour-gen-bloom`. El nombre sugiere una arquitectura BLOOM, un transformer decoder-only con atención causal, pero la model card del repositorio cuantizado no confirma esta correspondencia ni detalla el número de capas, dimensiones ocultas o cabezas de atención. Tampoco se especifican los datos de entrenamiento: no hay referencia al número de tokens, a la composición del corpus ni a si se aplicaron técnicas de RLHF, DPO o ajuste supervisado.

La única información técnica relevante es la relativa al proceso de cuantización: mradermacher indica que se trata de cuantizaciones estáticas (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) y que no hay cuantizaciones ponderadas con imatrix disponibles en el momento de la publicación. No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o arquitecturas híbridas.

## Capacidades

- Generación de texto en inglés, presumiblemente orientada a contenido humorístico según el nombre del modelo base.
- No hay evidencia documentada de soporte de tool calling ni function calling.
- No hay evidencia documentada de soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según el campo `language: en`.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (thinking mode).
- El tamaño reducido (816 M de parámetros) limita la profundidad del razonamiento y la fidelidad factual.

## Casos de uso

- Generación de chistes y textos cómicos en inglés: el modelo base está nombrado explícitamente para generación de humor, por lo que puede emplearse en prototipos de chatbots de entretenimiento o generadores de contenido ligero, ejecutables en local con llama.cpp.
- Experimentación con cuantización: el repositorio ofrece doce variantes de cuantización del mismo modelo, lo que permite comparar calidad y velocidad entre Q2_K, Q4_K_M, Q8_0 y f16 en un mismo hardware, útil para investigación sobre el impacto de la cuantización.
- Pruebas de pipelines de inferencia local: al caber en menos de 1 GB en Q4_K_M, es adecuado para validar integraciones con Ollama, llama.cpp o servidores compatibles con la API de OpenAI en máquinas sin GPU dedicada.
- Generación de texto creativo de bajo coste: para aplicaciones donde la latencia y el coste importan más que la calidad factual, como borradores de subtítulos humorísticos o respuestas informales en inglés.
- Docencia y demostraciones: su tamaño permite ejecutarlo en portátiles y Raspberry Pi (con cuantizaciones Q2/Q3), lo que lo hace útil para talleres sobre modelos de lenguaje y cuantización GGUF.
- Filtrado y generación de variantes: puede emplearse como generador de múltiples candidatos de texto breve que luego se filtran con un modelo mayor, en un esquema de generación y verificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en Q2_K, 0,7 GB en Q4_K_M, 1,0 GB en Q8_0 y 1,7 GB en f16 (los tamaños de fichero coinciden con el uso de memoria en llama.cpp, más overhead del contexto).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para Q4_K_M; RTX 3060, RTX 4060, GTX 1660 o superiores son suficientes. Para f16 se recomienda al menos 3 GB de VRAM.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones, incluidas GTX 1050 Ti (4 GB) y GPUs integradas con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con la API de OpenAI (el tag `endpoints_compatible` lo sugiere), y potencialmente vLLM si se convierte el GGUF, aunque no está documentado.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño (816 M de parámetros), se espera un throughput alto en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| humour-gen-bloom-GGUF | 816 M | no disponible | no disponible | GGUF | Hugging Face, 65 descargas |
| TinyLlama-1.1B (GGUF, TheBloke) | 1,1 B | 2048 | Apache 2.0 | GGUF | Ampliamente disponible |
| Qwen2.5-0.5B-Instruct (GGUF) | 0,49 B | 32 768 | Apache 2.0 | GGUF | Ampliamente disponible |
| SmolLM2-360M-Instruct (GGUF) | 0,36 B | 8192 | Apache 2.0 | GGUF | Ampliamente disponible |

La comparativa se basa en el tamaño y el formato, no en benchmarks, ya que no hay datos de rendimiento publicados para `humour-gen-bloom`. Los tres modelos alternativos tienen licencias permisivas y contextos documentados, a diferencia de este repositorio, cuya licencia no está especificada.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es un riesgo para producción.
- Idiomas: solo inglés, sin soporte documentado de castellano ni otras lenguas.
- Contexto: no se especifica la longitud máxima de contexto, lo que impide planificar aplicaciones con ventanas largas.
- Riesgo de alucinación: al ser un modelo de 816 M de parámetros, la fidelidad factual es baja y puede generar afirmaciones incorrectas con fluidez.
- Sesgos: no hay documentación sobre sesgos de género, raza o ideología; el corpus de entrenamiento es desconocido.
- Calidad de las cuantizaciones: las variantes Q2_K y Q3_K_M están marcadas por el autor como de menor calidad; para producción se recomienda Q4_K_M o superior.
- Sin imatrix: el autor indica que no hay cuantizaciones ponderadas con imatrix, lo que puede reducir la calidad respecto a otros modelos cuantizados del mismo ecosistema.
- Modelo base poco documentado: la ausencia de model card detallada del modelo original limita la evaluación rigurosa de su comportamiento.
- Fecha de actualización futura (2026-11-22): el campo de actualización del repositorio es posterior a la fecha actual, lo que puede indicar un error de metadatos o una reprogramación; conviene verificar el estado real del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/humour-gen-bloom-GGUF
- Modelo base: https://huggingface.co/likhithasapu/humour-gen-bloom
- Página de descargas del autor: https://hf.tst.eu/model#humour-gen-bloom-GGUF
- README de referencia sobre GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
