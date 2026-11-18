# jakeatx/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B-GGUF es un repositorio de cuantizaciones GGUF publicado por el usuario jakeatx sobre la familia Qwen3.8, con un total de 27.320.697.856 parámetros según los pesos safetensors del modelo base. El repositorio no contiene un modelo original entrenado por el autor, sino un conjunto de ficheros cuantizados (ternary PTQ1_0, IQ4_XS-M, mezclas ATX, etc.) junto con artefactos auxiliares para decodificación especulativa mediante MTP (multi-token prediction) de una capa nativa, orientados a ejecución en GPUs Ampere SM86 (RTX 3090 / 3090 Ti).

El interés técnico del repositorio reside en la agresividad de las cuantizaciones y en el ecosistema que las acompaña: incluye ficheros de 11,24 GB que, según el autor, permiten ejecutar los 262.144 tokens de contexto con MTP activo en una tarjeta de 12 GB, algo que las recetas estándar (Unsloth UD-Q2_K_XL, UD-IQ3_XXS) no consiguen con atención estándar. Para ello se apoya en un runtime propio, llamAmpere 0.7 (no publicado en el momento de redactar esta ficha), que incorpora atención LSA y KV offload a host, más ficheros sidecar (`lsa-qwen38-27b-d2048.gguf`, `mtp-dm.gguf`, `head-ait2.gguf`, `head-exact-f16.gguf`).

La relevancia actual es doble: por un lado, demuestra técnicas de cuantización mixta con imatrix y MTP embebido para reducir el coste de memoria sin degradar en exceso la distribución de salida (KLD 0,0270 frente a BF16 en el fichero de 12 GB); por otro, expone las limitaciones del ecosistema, ya que buena parte de las instrucciones de ejecución dependen de un binario aún no liberado y de ficheros sidecar con hashes SHA-256 publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.8), con cabeza MTP de 1 capa nativa para decodificación especulativa |
| Parametros totales | 27.320.697.856 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (contexto completo soportado por los ficheros ATX de 12 GB y ternary; 212.992 en el fichero AI2 de 10 GB) |
| Tipos de cuantizacion | PTQ1_0 ternary (1,75 bpw), ATX-IQ4_XS-M (4,56 bpw), IQ4_XS-M (4,56 bpw), ATX mixed AI3 (~3,3 bpw), ATX AI2 (2,3 bpw) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con ficheros sidecar GGUF para LSA, MTP y cabezas de draft/rescoring) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 27.320.697.856 parámetros perteneciente a la familia Qwen3.8. El repositorio no documenta el entrenamiento del modelo base (número de tokens, composición del dataset, fases de RLHF/DPO); toda la información disponible se refiere al proceso de cuantización y a los artefactos de inferencia. La innovación destacable es la incorporación de una cabeza MTP (multi-token prediction) de una sola capa, etiquetada como "nativa" y embebida en los GGUF, que actúa como drafter para decodificación especulativa con `--spec-type draft-mtp` y hasta 3 tokens de draft por paso (`--spec-draft-n-max 3`).

Las cuantizaciones se han generado con recetas propias (ATX) y con recetas de Unsloth (UD-IQ3_XXS, UD-Q2_K_XL) aplicadas sobre el mismo profesor (Swift 1.5 en BF16), usando imatrix. El autor reporta métricas de deriva respecto a BF16 sobre 16.200 posiciones de coding, agentic y RAG a ~12K de contexto: KLD de 0,0270 y Top-1 del 95,98% para el fichero ATX de 12 GB (11,24 GB), frente a KLD 0,0396 / Top-1 95,33% de UD-IQ3_XXS y KLD 0,0591 / Top-1 94,00% de UD-Q2_K_XL. El fichero AI2 de 2,3 bpw (9,14 GB) iguala aproximadamente a UD-Q2_K_XL (KLD 0,0593, Top-1 94,06%) con un 19% menos de tamaño. Los ficheros de tarjetas pequeñas requieren llamAmpere 0.7 con atención LSA y KV offload a host, además de los sidecar correspondientes.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte de contexto largo (hasta 262.144 tokens en los ficheros de mayor contexto).
- Razonamiento y código: el autor evalúa con LiveCodeBench v6 y reporta una puntuación del 89% en el fichero ATX de 12 GB con grader estricto (una sola semilla, direccional).
- Decodificación especulativa mediante MTP nativo de 1 capa, con draft de hasta 3 tokens por paso.
- Ejecución en GPUs consumer Ampere SM86 (RTX 3090 / 3090 Ti) mediante el runtime llamAmpere.
- Variantes "Uncensored" (Swift 1.5, Swift) y "Flash" (Qwopus3.8-27B Flash) incluidas en el mismo hub, con comportamiento conversacional ajustado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible de forma explícita; el autor menciona evaluaciones "agentic" dentro del conjunto de 16.200 posiciones usado para medir KLD.
- Capacidades multilingües: no disponible.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Despliegue de contexto largo en una RTX 3090 de 24 GB: el fichero ternary `qwen3.8-27b-ternary-mtp.gguf` ocupa 5,81 GiB y, según el autor, permite ejecutar 262K de contexto por debajo de 24 GB de VRAM, lo que habilita análisis de documentos extensos, auditoría de repositorios completos o resumen de actas sin trocear la entrada.
- Asistencia de código en local sobre una GPU de 12 GB: el fichero `qwen3.8-27b-Swift1.5-Uncensored-ATX-AI3.gguf` (11,24 GB, 11.544 MiB medidos en pico) permite mantener el contexto completo con MTP activo, útil para autocompletado y revisión de parches en estaciones de trabajo con una sola tarjeta.
- Evaluación de cuantizaciones y estudios de deriva: los datos de KLD y Top-1 sobre 16.200 posiciones permiten usar el repositorio como referencia para comparar recetas de cuantización (ATX frente a Unsloth) en tareas de coding y RAG.
- Investigación en decodificación especulativa: la combinación de MTP nativo con `--spec-type draft-mtp` y los sidecar de draft (`mtp-dm.gguf`, `head-ait2.gguf`) sirve para medir ganancias de throughput y tasa de aceptación en SM86.
- Generación de respuestas concisas en producción: el autor reporta que el fichero de 12 GB usa un 33% menos de tokens que UD-Q2_K_XL en LiveCodeBench v6 (mediana 4.608 frente a 8.932), lo que reduce coste por consulta en pipelines de generación de código.
- Despliegue de variantes conversacionales sin filtros en entornos controlados: los ficheros "Uncensored" (Swift 1.5, Swift) permiten experimentar con estilos de respuesta menos restrictivos en investigación de alineamiento, siempre bajo la licencia Apache 2.0 y con las salvaguardas propias del despliegue.
- Prototipado de asistentes RAG con contexto de ~12K: el conjunto de evaluación del autor incluye posiciones de RAG a esa longitud, por lo que el modelo está caracterizado en ese régimen y puede usarse como base para comparar recuperación y generación.

## Benchmarks y rendimiento

| Metrica | ATX 12 GB (11,24 GB) | UD-IQ3_XXS (10,93 GB) | UD-Q2_K_XL (9,95 GB) | ATX AI2 2,3 bpw (9,14 GB) | Mirai S |
|---|---:|---:|---:|---:|---:|
| KLD (menor es mejor) | 0,0270 | 0,0396 | 0,0591 | 0,0593 | 0,0745 |
| Top-1 | 95,98% | 95,33% | 94,00% | 94,06% | no disponible |
| LiveCodeBench v6 (strict, 1 semilla) | 89% | no disponible | 87% | no disponible | no disponible |
| Tokens medios por respuesta (LBC v6) | 4.608 (mediana) | no disponible | 8.932 (mediana) | no disponible | no disponible |

Referencia publicada del modelo base: Qwen BF16, 90,3% en LiveCodeBench v6. El autor advierte que la comparación de coding es direccional y no estadísticamente significativa (una sola semilla). Las métricas de KLD y Top-1 se calculan sobre 16.200 posiciones de coding, agentic y RAG a ~12K de contexto, con Swift 1.5 BF16 como profesor común.

## Requisitos de hardware

- VRAM estimada: 5,81 GiB para el fichero ternary PTQ1_0; 11,24 GB para el ATX AI3 (~3,3 bpw); 14,52 GiB para ATX-4-XS (4,56 bpw); 15,58 GiB para las variantes IQ4_XS-M; 9,14 GB para el AI2 de 2,3 bpw.
- GPU recomendadas: RTX 3090 y 3090 Ti (SM86, arquitectura objetivo del runtime llamAmpere). No se documentan requisitos para A100, H100 ni RTX 4090.
- Cabe en GPU consumer: sí, en RTX 3090 / 3090 Ti de 24 GB con contexto completo; en tarjetas de 12 GB solo con el fichero AI3 y llamAmpere 0.7 (LSA + KV offload a host); en 10 GB con el fichero AI2 (2,3 bpw, contexto 212.992). El fichero de 8 GB está retirado temporalmente por problemas de palabras raras y bucles detectados en pruebas en vivo.
- Opciones de despliegue: llama-server de llamAmpere compilado para SM86 (`-DGGML_CUDA=ON -DGGML_CUDA_FA=ON -DCMAKE_CUDA_ARCHITECTURES=86`), con flags `-fa on -ctk q8_0 -ctv turbo3 --spec-type draft-mtp --spec-draft-n-max 3 --spec-draft-p-min 0`. No se documenta compatibilidad con vLLM, TGI, Ollama ni llama.cpp estándar.
- Latencia y throughput: no disponibles. El autor solo reporta el efecto de la decodificación especulativa en longitud de respuesta (33% menos tokens en LiveCodeBench v6), no en tokens por segundo.
- Dependencia crítica: los ficheros de tarjeta pequeña requieren llamAmpere 0.7, que en el momento de redactar la model card aún no se ha publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | KLD vs BF16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B ATX 12 GB (este repo) | 27,3B | 262.144 | 0,0270 | Apache 2.0 | GGUF en HF; runtime llamAmpere 0.7 pendiente |
| Qwen3.8-27B UD-Q2_K_XL (Unsloth) | 27,3B | no disponible con MTP en 12 GB | 0,0591 | Apache 2.0 (heredada) | GGUF en HF |
| Qwen3.8-27B UD-IQ3_XXS (Unsloth) | 27,3B | no disponible | 0,0396 | Apache 2.0 (heredada) | GGUF en HF |
| Qwen3.8-27B ternary PTQ1_0 (este repo) | 27,3B | 262.144 | no disponible | Apache 2.0 | GGUF en HF; 5,81 GiB |

La comparación se limita a recetas de cuantización del mismo modelo base, ya que la información proporcionada no incluye modelos de otros fabricantes con los que contrastar. El criterio diferencial es la relación entre tamaño de fichero, deriva (KLD) y capacidad de ejecutar contexto completo con MTP en VRAM limitada.

## Limitaciones y advertencias

- El fichero de 8 GB está retirado temporalmente por "problemas de palabras raras y bucles" detectados en pruebas en vivo; no debe usarse en producción.
- Los ficheros de 10 y 12 GB dependen de llamAmpere 0.7, no publicado al redactar esta ficha; las instrucciones de ejecución no son reproducibles todavía con el binario público.
- El modelo base no ha sido entrenado por el autor del repositorio; las garantías de calidad, sesgos y alineamiento corresponden a la familia Qwen3.8, sobre la que no se aporta documentación en esta información.
- Las variantes "Uncensored" pueden producir contenido no filtrado; requieren revisión y salvaguardas adicionales en cualquier despliegue orientado a usuarios finales.
- Las métricas de coding proceden de una sola semilla y el propio autor las califica de direccionales, no estadísticamente significativas.
- Los datos de KLD y Top-1 se han medido sobre 16.200 posiciones a ~12K de contexto; no cubren el régimen de 262K tokens ni dominios fuera de coding, agentic y RAG.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Idiomas soportados: no disponibles; no se puede garantizar calidad multilingüe más allá de lo que herede el modelo base.
- La licencia Apache 2.0 permite uso comercial, pero la cadena de responsabilidad sobre el modelo base y sobre los ficheros sidecar debe verificarse antes de redistribuir.
- El repositorio mezcla cuantizaciones, fine-tunes y configuraciones de decodificación especulativa bajo un mismo hub; conviene fijar el hash SHA-256 del fichero concreto antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jakeatx/Qwen3.8-27B-GGUF
- Variante AI2 de 10 GB: https://huggingface.co/jakeatx/qwen3.8-27b-Swift1.5-Uncensored-ATX-AI2
- Paper, blog o demo del modelo base: no disponible
- Repositorio del runtime llamAmpere: no disponible en la información proporcionada
