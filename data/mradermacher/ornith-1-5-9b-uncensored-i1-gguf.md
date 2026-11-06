# mradermacher/Ornith-1.5-9B-uncensored-i1-GGUF

## Resumen

Ornith-1.5-9B-uncensored-i1-GGUF es la distribución en formato GGUF del modelo Ornith-1.5-9B-uncensored, publicada por el usuario mradermacher, especializado en cuantización de modelos para su uso con llama.cpp y herramientas compatibles. El modelo base, desarrollado por junafinity, es una variante "abliterated" y sin censura de una arquitectura identificada en las etiquetas como qwen3_5, con aproximadamente 8,95 mil millones de parámetros y capacidades multimodales declaradas (visión). Esta ficha describe la versión cuantizada, que conserva las características del modelo original.

El interés de esta publicación reside en ofrecer versiones cuantizadas con calibración imatrix (método i1) en un rango muy amplio de tamaños, desde 2,8 GB (IQ1_S) hasta 7,5 GB (Q6_K), lo que permite ejecutar un modelo de casi 9B parámetros en hardware de consumo. La naturaleza "abliterated" implica que se ha eliminado o reducido el comportamiento de rechazo del modelo base, orientándolo a usos donde se requiere menor filtrado de respuestas.

La licencia declarada es Apache 2.0 y el idioma soportado indicado es únicamente inglés. El repositorio, de 110,2 GB, agrupa todas las variantes de cuantización junto con el fichero imatrix empleado para generarlas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta qwen3_5), multimodal con visión |
| Parámetros totales | 8.953.803.264 (≈8,95B) |
| Parámetros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | imatrix i1: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible identifica el modelo base como perteneciente a la familia qwen3_5, lo que sitúa la arquitectura en la línea de transformers decoder-only de Qwen. El modelo incorpora componentes multimodales (etiquetas "multimodal" y "vision"), y las notas del cuantizador indican que los ficheros mmproj, necesarios para el procesamiento de imágenes, se distribuyen en el repositorio estático asociado y no en este repositorio i1.

El modelo base es una variante "abliterated" (técnica de modificación de pesos que elimina la dirección de rechazo en el espacio de activaciones) y "uncensored", partiendo de junafinity/Ornith-1.5-9B-uncensored. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. Las cuantizaciones de este repositorio se han generado con calibración imatrix ("weighted/imatrix quants"), un método que ajusta los parámetros de cuantización según la importancia de cada tensor estimada con un corpus de calibración, mejorando la calidad frente a cuantizaciones estáticas del mismo tamaño.

## Capacidades

- Generación de texto conversacional en inglés (etiqueta "conversational").
- Procesamiento de imágenes (visión) mediante los ficheros mmproj del repositorio estático.
- Comportamiento sin censura / abliterated: menor tendencia a rechazar peticiones.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- Razonamiento multi-turno dentro de los límites del contexto del modelo base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: usando la cuantización i1-Q4_K_M (5,7 GB) el modelo cabe en GPUs con 8 GB de VRAM, permitiendo prototipado sin infraestructura en la nube.
- Investigación sobre alineación y seguridad: la variante abliterated permite estudiar el comportamiento de un modelo sin capa de rechazo, comparándolo con su contraparte alineada en experimentos controlados.
- Procesamiento de documentos con imágenes: gracias al componente de visión, puede extraer y describir contenido de capturas, diagramas o documentos escaneados usando los ficheros mmproj del repositorio estático.
- Generación de texto creativo sin filtros: adecuado para entornos de escritura asistida donde el equipo asume la responsabilidad del contenido generado.
- Evaluación comparativa de cuantizaciones: el amplio abanico de 24 variantes permite medir el impacto de la cuantización en perplejidad y calidad dentro de un mismo modelo.
- Desarrollo de asistentes conversacionales de ámbito interno: la licencia Apache 2.0 y el formato GGUF facilitan la integración con llama.cpp u Ollama en aplicaciones privadas sin dependencia de servicios externos.
- Pipelines de investigación en NLP: servir el modelo con llama.cpp server o vLLM (si soporta la arquitectura) para experimentos de generación a bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización: desde ~2,8 GB (i1-IQ1_S, calidad muy degradada) hasta ~7,5 GB (i1-Q6_K). La opción recomendada i1-Q4_K_M ocupa 5,7 GB y la i1-Q5_K_M 6,6 GB.
- Para el procesamiento de visión hay que añadir la VRAM del fichero mmproj correspondiente, disponible en el repositorio estático.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090 para las cuantizaciones Q4/Q5/Q6; A100 o H100 para servir múltiples instancias concurrentes.
- Cabe en GPU de consumo desde 6 GB de VRAM con cuantizaciones IQ2/IQ3 (calidad reducida) y a partir de 8 GB con Q4_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui; vLLM/TGI solo si soportan la arquitectura subyacente (no confirmado).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B-uncensored (este) | ~8,95B | no disponible | Apache 2.0 | GGUF | Multimodal, abliterated, solo inglés |
| Qwen2.5-7B-Instruct | 7,6B | 128K (según su model card) | Apache 2.0 | safetensors, GGUF | Multilingüe, alineado, sin visión |
| Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 Community | safetensors, GGUF | Multilingüe, alineado, sin visión |
| Mistral-7B-Instruct-v0.3 | 7,2B | 32K | Apache 2.0 | safetensors, GGUF | Multilingüe, alineado, sin visión |

Los datos de contexto de los modelos comparativos provienen de sus model cards públicas; los de Ornith no se detallan en la información disponible. Este modelo se diferencia por su naturaleza abliterated y su componente de visión, frente a alternativas alineadas y fundamentalmente textuales.

## Limitaciones y advertencias

- Modelo "uncensored/abliterated": puede generar contenido dañino, ofensivo o inexacto sin filtros; requiere supervisión humana y políticas de uso claras en producción.
- Sesgos: hereda los sesgos del corpus de entrenamiento del modelo base, amplificados potencialmente por la eliminación de la capa de rechazo.
- Riesgo de alucinación: cuantizaciones por debajo de Q4 (especialmente IQ1/IQ2) degradan notablemente la coherencia; el autor advierte de "very low quality" en Q2_K_S e IQ3_XXS.
- Idioma: solo se declara inglés; el rendimiento en castellano no está verificado y probablemente sea deficiente.
- Contexto: se desconoce la longitud de contexto del modelo base; no asumir ventanas largas sin verificación.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal sobre el contenido generado recae en el desplegador.
- La arquitectura qwen3_5 puede no estar soportada por todas las versiones de llama.cpp; verificar compatibilidad antes de desplegar.
- Visión: requiere descargar los mmproj del repositorio estático; este repositorio i1 no los incluye.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Ornith-1.5-9B-uncensored-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/Ornith-1.5-9B-uncensored-GGUF
- Modelo base: https://huggingface.co/junafinity/Ornith-1.5-9B-uncensored
- Página de descargas del cuantizador: https://hf.tst.eu/model#Ornith-1.5-9B-uncensored-i1-GGUF
- README de referencia sobre GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f8106007712
