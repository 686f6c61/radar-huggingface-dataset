# mradermacher/lumorux-1.0-i1-GGUF

## Resumen

Lumorux 1.0 es un modelo de lenguaje afinado para generación de código, desarrollo web y modelado 3D, publicado por el usuario Lumorux en Hugging Face. Con 7.615.616.512 parámetros (aproximadamente 7,6 mil millones), se trata de un fine-tune del modelo Qwen, entrenado mediante QLoRA según los tags de la model card. Su enfoque específico lo orienta a tareas de programación web (HTML, CSS, JavaScript), integración con Blender y Three.js, y generación de aplicaciones.

La ficha que nos ocupa, `mradermacher/lumorux-1.0-i1-GGUF`, no es el modelo original sino una cuantización GGUF realizada por mradermacher, un conocido publicador de cuantizaciones para llama.cpp y ecosistemas compatibles. Esta versión emplea cuantizaciones ponderadas con fichero imatrix, lo que mejora la calidad respecto a cuantizaciones estáticas de tamaño similar. El repositorio incluye múltiples variantes de cuantización (Q2_K, IQ3_M, IQ3_XXS, Q4_K_M, Q5_K_M, Q6_K, entre otras) y pesa 39,0 GB en total.

El modelo es relevante para desarrolladores que necesitan un asistente de código especializado en front-end y 3D ejecutable en hardware de consumo gracias a las cuantizaciones GGUF. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales, y su compatibilidad con endpoints lo hace desplegable en infraestructuras estándar de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen mediante QLoRA) |
| Parametros totales | 7.615.616.512 (aprox. 7,6 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_M, i1-IQ3_XXS, i1-Q3_K_S, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_K_S, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, entre otras (ponderadas con imatrix) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base Lumorux 1.0 es un fine-tune de un modelo de la familia Qwen, según los tags de la model card (`qwen`, `qlora`, `fine-tuned`). El entrenamiento se realizó mediante QLoRA, técnica de ajuste fino eficiente en parámetros que cuantiza el modelo base a 4 bits y entrena adaptadores de bajo rango. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

La versión aquí descrita es una cuantización GGUF generada por mradermacher con cuantizaciones ponderadas mediante fichero imatrix (importance matrix), lo que preserva mejor la calidad en comparación con cuantizaciones estáticas del mismo tamaño. El repositorio incluye el fichero imatrix (`lumorux-1.0.imatrix.gguf`, 0,1 GB) para que otros usuarios puedan generar sus propias cuantizaciones. Los tags indican especialización en code-generation, web-development, blender, three-js, 3d-modeling y applications.

## Capacidades

- Generación de código especializado en desarrollo web (HTML, CSS, JavaScript) y frameworks front-end.
- Generación de scripts y contenido para Blender y Three.js orientado a modelado 3D.
- Generación de aplicaciones completas a partir de descripciones.
- Conversación multi-turno (tag `conversational`).
- Compatibilidad con endpoints de inferencia (`endpoints_compatible`).
- Capacidades multilingües limitadas al inglés según la model card.
- No se ha documentado soporte explícito de tool calling, function calling, agentes o modos de razonamiento extendido (thinking mode) en la información disponible.
- No se ha documentado soporte de visión ni audio.

## Casos de uso

- Asistente de programación front-end: el modelo genera componentes HTML, CSS y JavaScript a partir de descripciones en lenguaje natural, adecuado para prototipado rápido de interfaces web.
- Generación de escenas Three.js: permite crear código de escenas 3D interactivas para navegador, aprovechando su especialización en three-js y web-development.
- Automatización de scripts para Blender: genera scripts en Python para Blender orientados a modelado 3D y tareas de automatización dentro de la aplicación.
- Generación de aplicaciones web completas: a partir de un brief, produce la estructura de una aplicación con sus ficheros de front-end, útil para MVPs y demos.
- Despliegue en local para desarrollo: gracias a las cuantizaciones GGUF de 3-6 GB, puede ejecutarse en estaciones de trabajo de consumo mediante llama.cpp u Ollama, sin depender de APIs externas.
- Integración en editores de código: al ser un modelo de 7,6 B con cuantización Q4_K_M, puede servirse con vLLM o llama.cpp como backend de autocompletado y generación de código en IDE.
- Educación y experimentación: su licencia Apache 2.0 y tamaño moderado lo hacen adecuado para entornos docentes donde se enseña fine-tuning y despliegue de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: i1-Q2_K (3,1 GB), i1-IQ3_M (3,7 GB); el resto de variantes (Q4_K_M, Q5_K_M, Q6_K, etc.) no tienen tamaño desglosado en la información disponible, aunque para un modelo de 7,6 B se sitúan típicamente entre 4,5 y 6,5 GB.
- GPU recomendadas: no especificadas por el autor. Para un modelo de 7,6 B cuantizado, una RTX 3060 de 12 GB o superior es suficiente para la mayoría de cuantizaciones; A100/H100 no son necesarias salvo para alto throughput.
- Cabe en GPU de consumo: sí, en tarjetas con 6-8 GB de VRAM o más para cuantizaciones Q4/Q5; las cuantizaciones Q2/IQ3 caben en 4 GB.
- Opciones de despliegue: llama.cpp, Ollama (formato GGUF), y servidores compatibles con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints estándar. vLLM y TGI no soportan GGUF de forma nativa, por lo que requerirían el modelo base en safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lumorux 1.0 (i1-GGUF) | 7,6 B | no disponible | Apache 2.0 | GGUF | Especializado en código web y 3D |
| Qwen2.5-Coder-7B | 7,6 B | 32 K (típico en la familia) | Apache 2.0 | safetensors, GGUF | Referencia en código; contexto y benchmarks no verificados aquí |
| CodeLlama-7B | 6,7 B | 16 K | Llama 2 | safetensors, GGUF | Orientado a código, sin especialización 3D |

No se dispone de datos de benchmarks que permitan comparar rendimiento real entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; el rendimiento en castellano no está garantizado.
- Al ser un fine-tune de 7,6 B, es propenso a alucinaciones en código y puede generar APIs o funciones inexistentes.
- No se han publicado datos sobre sesgos, composición del dataset ni evaluación de seguridad.
- La longitud de contexto no está documentada; asumir contextos largos sin verificación puede provocar degradación.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen subyacente antes de uso comercial.
- Las cuantizaciones de baja precisión (Q2, IQ2, IQ3) degradan la calidad; para producción se recomienda Q4_K_M o superior.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del rendimiento.
- No se ha documentado soporte de tool calling ni de agentes; no asumir su disponibilidad en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/lumorux-1.0-i1-GGUF
- Modelo base: https://huggingface.co/Lumorux/lumorux-1.0
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/lumorux-1.0-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#lumorux-1.0-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
