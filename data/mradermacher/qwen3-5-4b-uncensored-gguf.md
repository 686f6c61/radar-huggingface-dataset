# mradermacher/Qwen3.5-4B-Uncensored-GGUF

## Resumen

Este repositorio contiene una colección de cuantizaciones GGUF estáticas del modelo Felldude/Qwen3.5-4B-Uncensored, una derivación no oficial de la familia Qwen3.5 con 4.326.350.848 parámetros (≈4,33 B). Lo publica mradermacher, especializado en distribuir versiones cuantizadas de modelos abiertos; no es el autor del ajuste original, sino el encargado de convertir los pesos a formatos ligeros para inferencia local con llama.cpp.

El paquete incluye 13 variantes de cuantización, desde Q2_K (2,1 GB) hasta f16 (8,8 GB), además de dos proyectores multimodales mmproj en Q8_0 y f16. El modelo está etiquetado como "uncensored" y "caption", declara únicamente inglés y se distribuye con licencia Apache-2.0. Su interés práctico es que permite ejecutar un modelo conversacional de 4B en GPU de consumo e incluso en CPU, sin depender de servicios en la nube.

Al ser una derivación no oficial, la documentación sobre arquitectura interna, longitud de contexto y proceso de entrenamiento es muy limitada. Esta ficha marca como "no disponible" cualquier dato que no aparezca en la información publicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso de la familia Qwen3.5; no se detalla en la model card |
| Parámetros totales | 4.326.350.848 (≈4,33 B) |
| Parámetros activos | No aplica: no se indica que sea MoE; modelo denso |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 y f16; proyectores mmproj Q8_0 y f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0; el campo license_link apunta a Qwen3.4-9B, conviene verificar la procedencia exacta |
| Formato de pesos | GGUF para llama.cpp; el repositorio también está etiquetado como transformers y fp32 |
| Tamaño del repositorio | 41,0 GB |
| Descargas y likes | 4.156 descargas y 3 likes en el momento de la consulta |
| Fechas | Creado el 2026-07-03; actualizado el 2026-10-24 |
| Modelo base | Felldude/Qwen3.5-4B-Uncensored |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna ni el proceso de entrenamiento. Por el nombre y la familia declarada, cabe esperar un transformer decoder-only denso de Qwen3.5 con aproximadamente 4,33 B de parámetros, pero no se confirma el número de capas, dimensiones ocultas, mecanismo de atención ni vocabulario. La presencia de archivos mmproj indica que el modelo admite un proyector multimodal para entrada de imagen, aunque no se detalla qué codificador visual utiliza ni cómo se entrenó.

Tampoco hay información sobre el número de tokens de entrenamiento, la composición del dataset, el método de desalineación aplicado —abliteration, fine-tuning supervisado sin RLHF, DPO u otro— ni sobre posibles fases de ajuste. La etiqueta "caption" sugiere un entrenamiento orientado a descripción de imágenes, y la etiqueta "uncensored" indica que se ha reducido o eliminado la capa de rechazo típica de los modelos alineados. No se documentan innovaciones técnicas adicionales.

## Capacidades

- Generación de texto y conversación multi-turno en inglés.
- Modo "uncensored": el modelo está ajustado para no aplicar los rechazos habituales de los modelos alineados, por lo que puede responder a peticiones sobre temas sensibles.
- Procesamiento de imágenes si se carga el proyector mmproj junto con el modelo principal; la etiqueta "caption" apunta a generación de descripciones de imágenes, aunque no hay documentación detallada.
- Capacidad de ejecución local en CPU y GPU mediante llama.cpp y compatible con Ollama, LM Studio y otros clientes GGUF.
- No hay evidencia documentada de tool calling ni function calling.
- No hay evidencia documentada de modo "thinking", razonamiento multi-paso, agentes o uso de herramientas.
- Cobertura multilingüe limitada al inglés declarado; no se garantiza un rendimiento equivalente en castellano.
- No se documentan capacidades de audio, vídeo ni generación de imágenes.

## Casos de uso

- Despliegue local en equipos con GPU de consumo: la cuantización Q4_K_M ocupa 2,9 GB y puede ejecutarse en tarjetas de 8 GB de VRAM, lo que permite tener un asistente conversacional sin conexión y sin costes de API.
- Investigación sobre alineación y seguridad: al ser un modelo "uncensored", resulta útil para estudiar respuestas sin rechazos, comparar el comportamiento frente al modelo base alineado y analizar sesgos o riesgos en entornos controlados.
- Red teaming autorizado y formación en seguridad: puede emplearse para generar escenarios de prueba y contenido de simulación en laboratorios de ciberseguridad, siempre con supervisión y dentro de un marco legal.
- Descripción de imágenes en pipelines locales: cargando el mmproj Q8_0 o f16, el modelo puede procesar imágenes y generar texto descriptivo; la etiqueta "caption" sugiere este uso, aunque requiere validación empírica.
- Prototipado de chatbots en inglés: con Ollama o llama.cpp se puede levantar un servicio conversacional básico para pruebas de concepto, con contexto moderado y baja latencia en GPU consumer.
- Generación de texto creativo sin filtros editoriales: ficción, guiones y ejercicios de escritura que requieran respuestas no condicionadas por políticas de contenido.
- Evaluación comparativa de cuantizaciones: el repositorio permite medir la degradación de calidad entre Q2_K, Q4_K_M, Q8_0 y f16 sobre las mismas prompts, útil para decidir el equilibrio entre tamaño y fidelidad.
- Generación de datos sintéticos para experimentos de fine-tuning: puede producir corpus en inglés para tareas de clasificación o extracción, con revisión humana posterior por el riesgo de alucinación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para Q4_K_M (2,9 GB de pesos): aproximadamente 4-5 GB con contexto moderado, dependiendo de la longitud de contexto efectiva y del backend.
- VRAM estimada para Q5_K_M (3,3 GB): aproximadamente 4,5-6 GB.
- VRAM estimada para Q8_0 (4,7 GB): aproximadamente 6-8 GB.
- VRAM estimada para f16 (8,8 GB): aproximadamente 10-12 GB.
- Si se utiliza visión, hay que sumar 0,5 GB del mmproj Q8_0 o 0,8 GB del mmproj f16.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 para las cuantizaciones altas; A100 o H100 no son necesarias para un modelo de 4B y supondrían un sobredimensionamiento.
- Cabe en GPU consumer: sí, desde una GTX 1660 de 6 GB con Q3_K_S o Q4_K_S, y con mayor holgura en tarjetas de 8-16 GB.
- En CPU: Q4_K_M requiere alrededor de 8 GB de RAM; f16 requiere 16 GB o más. El rendimiento depende del número de núcleos y del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y text-generation-webui. vLLM y TGI tienen soporte limitado o indirecto para GGUF, por lo que no son la vía recomendada para este repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/Qwen3.5-4B-Uncensored-GGUF | 4,33 B | No disponible | GGUF | Apache-2.0 | 13 cuantizaciones estáticas y proyectores mmproj; orientado a inferencia local |
| Felldude/Qwen3.5-4B-Uncensored | 4,33 B | No disponible | Pesos transformers | Apache-2.0 | Modelo base del que se derivan estas cuantizaciones; permite fine-tuning |
| mradermacher/Qwen3.5-4B-Uncensored-i1-GGUF | 4,33 B | No disponible | GGUF con imatrix | Apache-2.0 | Cuantizaciones ponderadas; a igual tamaño suelen ofrecer mejor calidad que las estáticas |
| mradermacher/Qwen3.5-4B-uncensored-zero-GGUF | No disponible | No disponible | GGUF | No disponible | Variante adicional del mismo autor; no se dispone de especificaciones detalladas |

## Limitaciones y advertencias

- El modelo es explícitamente "uncensored": puede generar contenido violento, sexual, ilegal o peligroso. No es adecuado para aplicaciones de cara al público sin filtros de entrada y salida.
- No se han publicado evaluaciones de seguridad, sesgos ni toxicidad. Se desconoce el impacto del proceso de desalineación en la calidad general.
- Riesgo de alucinación inherente a un modelo de 4B, especialmente en tareas de razonamiento, matemáticas y conocimiento factual.
- El único idioma declarado es el inglés; el rendimiento en castellano no está garantizado y probablemente sea inferior.
- Se desconoce la longitud de contexto. No conviene diseñar aplicaciones con ventanas largas sin probar antes el comportamiento real.
- Las cuantizaciones Q2_K y Q3_K degradan la calidad de forma apreciable; el propio autor marca Q3_K_M como "lower quality". Para producción se recomienda Q4_K_M o superior.
- La licencia Apache-2.0 permite uso comercial, pero el enlace de licencia apunta a Qwen3.4-9B, lo que introduce ambigüedad sobre la procedencia exacta. Conviene verificar los términos antes de un despliegue comercial.
- Al ser un modelo derivado no oficial, no cuenta con el respaldo del equipo de Qwen ni de Felldude más allá de la publicación original.
- Los archivos GGUF no son adecuados para entrenamiento directo; para fine-tuning hay que partir de los pesos transformers del modelo base.
- La funcionalidad de visión requiere un cliente compatible con mmproj y no está documentada en detalle; su calidad es desconocida.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.5-4B-Uncensored-GGUF
- Modelo base: https://huggingface.co/Felldude/Qwen3.5-4B-Uncensored
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3.5-4B-Uncensored-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.5-4B-Uncensored-GGUF
- Variante "zero": https://huggingface.co/mradermacher/Qwen3.5-4B-uncensored-zero-GGUF
- Despliegue en Colab y Ollama: https://github.com/CookieFilled/qwen-3.5-4B-uncensored-colab
- Lista de modelos para seguridad ofensiva: https://github.com/JoasASantos/Offensive-Security-AI-Models
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Enlace de licencia declarado: https://huggingface.co/Qwen/Qwen3.4-9B/blob/main/LICENSE
