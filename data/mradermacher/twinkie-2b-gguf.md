# mradermacher/twinkie-2b-GGUF

## Resumen

Twinkie 2B es un modelo de lenguaje de aproximadamente 1.940 millones de parámetros (1.942.653.248 según los pesos en safetensors), desarrollado por Cyrax321 y distribuido en formato GGUF por mradermacher. Está orientado explícitamente a dos dominios: la seguridad infantil (*child-safety*) y la educación. El modelo parte de una base Qwen y se ha ajustado mediante LoRA (con Unsloth), según los tags de la model card, y se publica con una licencia restrictiva de tipo *source-available-read-only*.

La versión aquí documentada no es el modelo original, sino la colección de cuantizaciones estáticas en GGUF generadas por mradermacher a partir de `Cyrax321/twinkie-2b`. Incluye un conjunto amplio de cuantizaciones (desde Q2_K hasta f16) y dos ficheros `mmproj` (Q8_0 y f16), lo que indica que el modelo base incorpora algún componente multimodal, presumiblemente visión. El repositorio ocupa 19,6 GB en total, aunque cada cuantización individual pesa entre 1,1 GB y 4,0 GB.

Su relevancia actual es acotada: se trata de un modelo pequeño, monolingüe (inglés), sin descargas ni interacciones registradas en el momento de la consulta y con una licencia muy limitada. Resulta interesante como caso de ajuste fino especializado en un dominio sensible (contenido educativo y protección de menores) sobre una base compacta que puede ejecutarse en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el autor solo indica base Qwen y ajuste LoRA; no se detalla la arquitectura exacta) |
| Parametros totales | 1.942.653.248 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; además mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | source-available-read-only (licencia "other"; enlace a LICENSE en el repositorio de GitHub del autor) |
| Formato de pesos | GGUF (cuantizaciones); el modelo base se distribuye en formato transformers/safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. Los tags de la model card indican que el modelo deriva de una base Qwen y que se ha ajustado mediante LoRA con la herramienta Unsloth; el pipeline declarado en Hugging Face es `transformers`. El tamaño de 1.942.653.248 parámetros es coherente con un transformer denso de escala 2B, pero no se confirma ni el número de capas, ni las dimensiones ocultas, ni el tipo de atención.

Tampoco se documentan el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. La presencia de ficheros `mmproj` en la distribución GGUF sugiere que el modelo base integra un proyector multimodal (probablemente para imagen), pero no se especifica qué codificador visual utiliza ni cómo se entrenó esa parte. No hay información sobre innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, con un ajuste específico orientado a contextos educativos y de seguridad infantil.
- Capacidad multimodal probable: la distribución incluye ficheros `mmproj` (Q8_0 y f16), lo que apunta a entrada de imágenes, aunque no se detalla el alcance ni la calidad de esta función.
- Ajuste fino sobre una base Qwen mediante LoRA, lo que sugiere que conserva las capacidades generales de generación de la familia Qwen de tamaño similar.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language` de la model card.
- Modo *thinking* u otras capacidades especiales: no disponible.

## Casos de uso

- Moderación de contenido en plataformas educativas: el modelo puede clasificar y reformular interacciones en entornos con menores, aprovechando su ajuste específico en *child-safety* para detectar lenguaje inapropiado y generar respuestas seguras.
- Asistencia educativa en inglés: generación de explicaciones, ejercicios y feedback para estudiantes, con un tono adaptado por el ajuste fino y ejecutable en hardware modesto gracias a las cuantizaciones Q4/Q5.
- Chatbots de acompañamiento en entornos escolares: conversaciones multi-turno en inglés con salvaguardas orientadas a menores, desplegables en servidores pequeños o incluso en equipos locales con llama.cpp u Ollama.
- Filtrado previo en pipelines de contenido generado: uso como clasificador o reescritor de respuestas antes de mostrarlas a una audiencia infantil, integrado como paso intermedio en una cadena de modelos mayores.
- Prototipado rápido de aplicaciones educativas: al pesar entre 1,1 y 2,2 GB en cuantizaciones habituales, permite iterar en portátiles con GPU de consumo sin depender de APIs externas.
- Investigación sobre alineación y seguridad en modelos pequeños: sirve como caso de estudio de ajuste LoRA especializado en un dominio sensible sobre una base Qwen de 2B, con cuantizaciones listas para experimentación reproducible.
- Procesamiento de material didáctico con imágenes: si la funcionalidad multimodal se confirma, podría emplearse para describir o revisar ilustraciones de libros de texto, aunque esta capacidad no está documentada en detalle.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1-1,4 GB con Q2_K a Q4_K_M; 1,5-1,7 GB con Q5-Q6; 2,2 GB con Q8_0; 4,0 GB con f16. Hay que sumar el espacio del contexto y, en su caso, el del proyector multimodal (0,5 GB para mmproj-Q8_0, 0,8 GB para mmproj-f16).
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM puede ejecutar las cuantizaciones intermedias; para f16 y contextos largos conviene disponer de 6-8 GB. No se dispone de datos de rendimiento específicos para A100, H100 o RTX 4090.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores con las cuantizaciones Q4_K_M o Q5_K_M; también en equipos con gráfica integrada si se usa RAM del sistema.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, koboldcpp) son la vía natural al tratarse de GGUF; también es posible servir el modelo base en formato transformers con vLLM o TGI, aunque estas herramientas no consumen directamente los ficheros GGUF de este repositorio.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Twinkie 2B (este) | 1,94 B | no disponible | source-available-read-only | GGUF, safetensors | Ajuste especializado en child-safety y educación; solo inglés |
| Qwen2.5-1.5B | 1,5 B | 32.768 tokens (versión base) | Apache 2.0 (versiones abiertas) | safetensors, GGUF | Base genérica multilingüe de la que deriva la familia Qwen; licencia permisiva |
| Qwen2.5-3B | 3,1 B | 32.768 tokens (versión base) | Qwen Research License / Apache 2.0 según variante | safetensors, GGUF | Alternativa de tamaño cercano con contexto documentado y ecosistema amplio |
| SmolLM2-1.7B | 1,7 B | 8.192 tokens | Apache 2.0 | safetensors, GGUF | Modelo pequeño de Hugging Face optimizado para eficiencia en dispositivo |

La comparación con Qwen2.5 y SmolLM2 es orientativa: no se dispone de datos de benchmarks de Twinkie 2B que permitan contrastar calidad. La diferencia principal es la especialización del ajuste y la licencia restrictiva, frente a las licencias permisivas de las alternativas.

## Limitaciones y advertencias

- Licencia restrictiva: *source-available-read-only* implica que el código o los pesos pueden consultarse pero no modificarse ni reutilizarse libremente; el uso comercial requiere revisar el texto de la licencia enlazado en el repositorio de GitHub del autor.
- Modelo monolingüe: solo declara inglés, por lo que su uso en castellano u otros idiomas no está soportado y probablemente degrade la calidad.
- Riesgo de alucinación: como todo modelo de 2B sin benchmarks publicados, la fiabilidad factual es limitada; en contextos educativos conviene validar las respuestas con fuentes externas.
- Sesgos: no se documentan evaluaciones de sesgo; un ajuste especializado en seguridad infantil puede producir respuestas excesivamente cautelosas o evasivas en temas legítimos.
- Contexto y arquitectura sin documentar: se desconoce la ventana de contexto real, lo que dificulta planificar aplicaciones con conversaciones largas o documentos extensos.
- Capacidad multimodal incierta: la presencia de ficheros `mmproj` sugiere visión, pero no hay documentación sobre su entrenamiento ni su calidad; no debe asumirse un rendimiento equiparable al de modelos multimodales dedicados.
- Sin tracción comunitaria: cero descargas y cero interacciones en el momento de la consulta, lo que reduce la probabilidad de encontrar soporte, correcciones o evaluaciones independientes.
- No apto como sustituto de supervisión humana en entornos con menores: debe usarse como capa auxiliar, nunca como único mecanismo de moderación o tutorización.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/twinkie-2b-GGUF
- Modelo base: https://huggingface.co/Cyrax321/twinkie-2b
- Licencia del modelo: https://github.com/Cyrax321/twinkie/blob/main/LICENSE
- Página de descargas del cuantizador: https://hf.tst.eu/model#twinkie-2b-GGUF
- Perfil del cuantizador: https://huggingface.co/mradermacher
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
