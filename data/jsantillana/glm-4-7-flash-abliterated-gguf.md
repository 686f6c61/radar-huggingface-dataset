# jsantillana/glm-4.7-flash-abliterated-GGUF

## Resumen

GLM-4.7-Flash Abliterated (Clean Rank-2) en formato GGUF es una versión cuantizada del modelo base `jsantillana/glm-4.7-flash-abliterated`, un derivado de GLM-4.7-Flash al que se le han eliminado selectivamente los mecanismos de rechazo (abliteration) mediante una proyección ortogonal de subespacio de rango 2. El modelo conserva la arquitectura original de tipo Mixture-of-Experts con 64 expertos enrutados, enrutamiento top-4 y un experto compartido, y cuenta con 31.221.488.576 parámetros totales según los pesos en safetensors del modelo base.

El autor, jsantillana, distribuye tres cuantizaciones GGUF (Q8_0, Q4_K_M y Q3_K_M) pensadas para ejecución con llama.cpp, con el objetivo declarado de servir a investigación de seguridad, red-teaming, ingeniería defensiva en ciberseguridad y evaluación autorizada. La licencia es MIT y el modelo declara soporte para inglés, español y chino.

La relevancia actual del modelo radica en su enfoque técnico de abliteration multilingüe: en lugar de un simple borrado de dirección, aplica una descomposición QR sobre un conjunto disjunto de pares de extracción (210 pares) y evaluación retenida (1058 pares), actuando quirúrgicamente sobre las proyecciones de escritura de atención y las proyecciones descendentes del experto compartido y de los 64 expertos enrutados, en las capas 30 a 46.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con 64 expertos enrutados, top-4 routing y experto compartido |
| Parametros totales | 31.221.488.576 |
| Parametros activos | no disponible (top-4 de 64 expertos enrutados; el dato exacto de parámetros activos no se especifica) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (8.5 bpw), Q4_K_M (~4.5 bpw), Q3_K_M (~3.3 bpw) |
| Idiomas soportados | en, es, zh |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es GLM-4.7-Flash, un transformer de tipo Mixture-of-Experts con 64 expertos enrutados, enrutamiento top-4 y un experto compartido. Sobre esta arquitectura, el autor aplica una metodología de abliteration denominada "Clean Rank-2 Subspace", consistente en una proyección ortogonal de subespacio de rango 2 multilingüe mediante descomposición QR sobre un split disjunto: 210 pares de extracción y 1058 pares de evaluación retenidos.

La intervención quirúrgica se aplica en las capas 30 a 46 sobre tres tipos de proyecciones: las proyecciones de escritura de atención (`self_attn.o_proj`), la proyección descendente del experto compartido (`shared_experts.down_proj`) y la proyección descendente de los 64 expertos enrutados (`experts.down_proj`). El autor reporta un colapso de rechazo en inglés del 35,9 % al 5,3 % (-30,6 pp) y en español del 8,9 % al 1,3 % (-7,6 pp), manteniendo un 0 % de falsos rechazos en conjuntos benignos DEF/GRIS/SOC. No se especifican en la información disponible los datos de entrenamiento originales del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO).

## Capacidades

- Generación de texto conversacional en inglés, español y chino.
- Respuesta a consultas técnicas de ciberseguridad sin rechazos automatizados, según declara el autor.
- Razonamiento multi-turno y conversacional (pipeline `text-generation`, tag `conversational`).
- Compatibilidad con endpoints (`endpoints_compatible`).
- Ejecución en llama.cpp con soporte de plantilla Jinja (`--jinja`).
- Capacidad de red-teaming y evaluación de alineamiento por su colapso de rechazo controlado.
- No se documentan en la información disponible capacidades de visión, audio, tool calling explícito ni modo de razonamiento extendido.

## Casos de uso

- Investigación de alineamiento y seguridad: el modelo permite estudiar el efecto de la abliteration sobre las tasas de rechazo en inglés y español, con métricas reportadas antes y después de la intervención (35,9 % → 5,3 % en EN; 8,9 % → 1,3 % en ES), lo que facilita experimentos reproducibles sobre mecanismos de rechazo.
- Red-teaming de sistemas conversacionales: sirve como generador adversario para probar filtros y clasificadores de seguridad en pipelines de moderación, aprovechando su menor tasa de rechazo automatizado.
- Ingeniería defensiva en ciberseguridad: el autor lo orienta a consultas técnicas de seguridad que otros modelos rechazarían, útil en entornos controlados de análisis de vulnerabilidades y respuesta a incidentes.
- Evaluación académica de robustez: con 1058 pares de evaluación retenidos en la metodología, permite replicar experimentos de medición de rechazo y preservación de comportamiento benigno (0 % de falsos rechazos en DEF/GRIS/SOC).
- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M y Q3_K_M permiten ejecutar un modelo de 31,2 mil millones de parámetros en hardware de consumo mediante llama.cpp, reduciendo el peso respecto a los pesos completos.
- Análisis multilingüe de sesgos de seguridad: al cubrir en, es y zh, permite comparar el comportamiento de rechazo entre idiomas y detectar asimetrías de alineamiento.
- Prototipado de asistentes conversacionales sin restricciones de contenido para entornos de prueba cerrados, con la advertencia de uso exclusivamente investigador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta métricas internas de abliteration:

| Metrica | Antes | Despues | Delta |
|---|---|---|---|
| Tasa de rechazo EN (OFF) | 35,9 % | 5,3 % | -30,6 pp |
| Tasa de rechazo ES (OFF) | 8,9 % | 1,3 % | -7,6 pp |
| Falsos rechazos en DEF/GRIS/SOC | no disponible | 0 % | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: con Q8_0 (8,5 bpw) sobre 31,2 mil millones de parámetros, el peso ronda los 33 GB; con Q4_K_M (~4,5 bpw) alrededor de 17-18 GB; con Q3_K_M (~3,3 bpw) en torno a 13 GB. Estas cifras son estimaciones a partir de los bits por peso declarados y no están confirmadas por el autor.
- GPU recomendadas: para Q8_0 se requiere una GPU de 40-48 GB (A100 40 GB, A6000 48 GB) o reparto en varias GPU; para Q4_K_M una GPU de 24 GB (RTX 3090, RTX 4090, A10G) es suficiente; para Q3_K_M puede caber en GPU de 16 GB (RTX 4080, A4000).
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con Q4_K_M y en GPUs de 16 GB con Q3_K_M; Q8_0 no cabe en una sola GPU de consumo.
- Opciones de despliegue: llama.cpp (soporte nativo GGUF y `--jinja`), y por extensión entornos compatibles con GGUF como Ollama o llama-cpp-python; vLLM y TGI no están confirmados para este repositorio en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| jsantillana/glm-4.7-flash-abliterated-GGUF | 31,2 B (MoE, 64 expertos, top-4) | no disponible | MIT | GGUF (Q8_0, Q4_K_M, Q3_K_M) | Abliteration rank-2 multilingüe; orientado a red-teaming |
| jsantillana/glm-4.7-flash-abliterated | 31,2 B (MoE) | no disponible | MIT (según base) | safetensors | Modelo base sin cuantizar del que derivan los GGUF |
| GLM-4.7-Flash (original) | 31,2 B (MoE) | no disponible | no disponible | no disponible | Modelo original con mecanismos de rechazo intactos |

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo explícitamente orientado a investigación y evaluación autorizada; el autor declara que no se hace responsable del mal uso, daños o actividades ilegales derivadas de su utilización.
- La abliteration elimina rechazos de forma selectiva, lo que puede producir contenido dañino, inseguro o inexacto en dominios sensibles; no debe desplegarse en producción orientada a usuarios finales sin capas de moderación externas.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad factual en la información disponible.
- Restricciones de licencia: MIT permite uso comercial, pero la advertencia del autor limita el uso a fines educativos, ciberseguridad defensiva, pentesting autorizado e investigación académica de seguridad; conviene revisar la compatibilidad legal con el modelo base original.
- Cobertura idiomática limitada a inglés, español y chino; el rendimiento en otros idiomas no está documentado.
- Longitud de contexto no especificada en la información disponible, lo que impide planificar cargas de trabajo con ventanas largas.
- Las cuantizaciones Q3_K_M y Q4_K_M introducen pérdida de precisión respecto a Q8_0; no se han publicado métricas de degradación por cuantización.
- El modelo deriva de un modelo base cuya procedencia y términos de licencia originales no se detallan en la información disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/jsantillana/glm-4.7-flash-abliterated-GGUF
- Modelo base (abliterated, safetensors): https://huggingface.co/jsantillana/glm-4.7-flash-abliterated
- llama.cpp (runtime recomendado): https://github.com/ggerganov/llama.cpp
- No se han encontrado en la información proporcionada papers, blogs, repos adicionales ni demos del autor.
