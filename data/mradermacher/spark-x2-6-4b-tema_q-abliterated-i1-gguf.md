# mradermacher/Spark-X2.6-4B-Tema_Q-Abliterated-i1-GGUF

## Resumen

Spark-X2.6-4B-Tema_Q-Abliterated-i1-GGUF es un conjunto de cuantizaciones GGUF generadas por mradermacher a partir del modelo yuna1126/Spark-X2.6-4B-Tema_Q-Abliterated, un modelo de lenguaje conversacional de 4.112.079.360 parámetros (aproximadamente 4,1 B) publicado bajo licencia Apache 2.0 y orientado a los idiomas inglés y chino. No se trata de un modelo nuevo, sino de una redistribución optimizada para inferencia local: el repositorio original en safetensors se ha convertido a formato GGUF y se ha cuantizado en 24 variantes distintas, desde IQ1_S (1,3 GB) hasta Q6_K (3,5 GB), empleando cuantización ponderada con importance matrix (imatrix).

La relevancia de esta ficha es práctica: permite ejecutar un modelo de 4 B en hardware de consumo, desde tarjetas con 6-8 GB de VRAM hasta CPU o incluso dispositivos móviles mediante llama.cpp, con un abanico de compromisos tamaño/calidad muy amplio. El sufijo «Abliterated» del nombre del modelo base sugiere un proceso de abliteration (eliminación de mecanismos de rechazo), aunque la model card proporcionada no documenta ese proceso, por lo que debe tratarse como una inferencia a partir de la nomenclatura y no como un dato confirmado.

La información disponible es deliberadamente escasa: la model card del repositorio cuantizado solo describe el proceso de cuantización, los tipos de quant y los enlaces de descarga. No hay datos sobre arquitectura interna, longitud de contexto, composición del dataset de entrenamiento ni resultados de evaluación, por lo que esta ficha marca explícitamente como «no disponible» todo aquello que no consta en la documentación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (el modelo base es compatible con llama.cpp/GGUF; no se documenta la arquitectura interna) |
| Parámetros totales | 4.112.079.360 (≈4,1 B), dato real de safetensors del modelo base |
| Parámetros activos | No aplica / no disponible (no se documenta que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | i1 con imatrix: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, IQ4_XS, Q3_K_L, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K. También existe un fichero imatrix para generar quant propios y un repositorio de quants estáticos |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado, i1/imatrix); el modelo base se distribuye en formato distinto, no confirmado en la información disponible |
| Tamaño del repositorio | 50,4 GB (agregado de todas las variantes) |
| Uso previsto declarado | Conversacional (tag `conversational`) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base (tipo de transformer, atención, posibles innovaciones como atención lineal o decodificación especulativa), ni sobre el número de tokens de entrenamiento, la composición del dataset, las etapas de alineación (SFT, RLHF, DPO) o el proceso de abliteration que sugiere el nombre. La model card del repositorio cuantizado no incluye ninguna de estas secciones: se limita a documentar el proceso de cuantización.

Lo único documentado técnicamente es el pipeline de cuantización. Los ficheros se han generado con `quantize_version: 2` y `output_tensor_quantised: 1` sobre una conversión de tipo `hf`, y las variantes i1 emplean una importance matrix (imatrix) propia incluida en el repositorio (`Spark-X2.6-4B-Tema_Q-Abliterated.imatrix.gguf`, 0,1 GB), lo que en la práctica mejora la conservación de calidad respecto a cuantizaciones estáticas del mismo tamaño. Según las notas del autor, las variantes IQ suelen ser preferibles a las no-IQ de tamaño similar (por ejemplo, IQ3_S frente a Q3_K_S, o IQ4_XS frente a IQ4_NL). También se ofrece un repositorio hermano con quants estáticos para quien prefiera ese formato.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino, según los tags y el campo `language` de la model card.
- Conversación general: el tag `conversational` y el nombre del modelo base apuntan a un ajuste orientado a diálogo, aunque no se detalla el formato de prompt ni la plantilla de chat.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede servirse mediante infraestructuras de inferencia estándar compatibles con GGUF.
- Inferencia local y offline: al estar en GGUF, funciona con llama.cpp, Ollama, LM Studio, koboldcpp y llama-cpp-python, incluyendo ejecución en CPU y en dispositivos de bajos recursos.
- Capacidad de razonamiento, código, matemáticas, tool calling, agentes, visión o audio: no disponible (no documentado en la información proporcionada).
- Modo thinking o razonamiento extendido: no disponible.
- Multilingüismo más allá de en/zh: no disponible; la model card solo declara inglés y chino.

## Casos de uso

- Asistente conversacional bilingüe inglés-chino en local: el modelo cubre los dos idiomas declarados y su tamaño de 4 B permite desplegarlo en una estación de trabajo sin GPU dedicada, usando la variante Q4_K_M (2,7 GB) sobre llama.cpp con respuestas en decenas de milisegundos por token en CPU moderna.
- Prototipado rápido de aplicaciones de chat: al existir 24 variantes de cuantización, se puede empezar con IQ2_M (1,7 GB) para pruebas funcionales en portátiles modestos y subir a Q5_K_M o Q6_K cuando se necesite más fidelidad, sin cambiar de código de integración.
- Despliegue en dispositivos de borde o embebidos: las variantes IQ1_S (1,3 GB) e IQ2_XXS (1,5 GB) permiten caber en dispositivos con 2-4 GB de memoria, útil para asistentes locales en Raspberry Pi, mini-PC o apps móviles basadas en llama.cpp.
- Generación de datos sintéticos y aumento de datasets en inglés y chino: un modelo pequeño y cuantizado permite generar grandes volúmenes de texto a bajo coste en pipelines batch, siempre que se valide la calidad de la variante elegida.
- Traducción y adaptación de contenidos en/zh: con ambos idiomas declarados, sirve como base para tareas de traducción asistida o reescritura bilingüe en entornos donde no se puede enviar datos a la nube por motivos de privacidad.
- Escritura creativa y roleplay sin filtros aparentes: el sufijo «Abliterated» del modelo base sugiere la eliminación de rechazos, lo que lo hace candidato para narrativa o personajes con libertad expresiva; conviene verificar el comportamiento real antes de usarlo en producción, ya que el proceso no está documentado.
- Evaluación comparativa de cuantizaciones: el repositorio incluye desde IQ1 hasta Q6, lo que lo convierte en un banco de pruebas útil para medir la degradación de calidad por nivel de cuantización en un modelo de 4 B con una imatrix propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas de MMLU, HumanEval, GSM8K, MT-Bench ni evaluaciones de perplejidad para ninguna de las variantes de cuantización, ni tampoco cifras de latencia o throughput medidas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero GGUF más un margen de 1-2 GB para caché KV y overhead del runtime. Con Q4_K_M (2,7 GB) el consumo típico se sitúa en torno a 4-5 GB; con Q6_K (3,5 GB), en torno a 5-6 GB. Estas cifras son estimaciones basadas en el tamaño de los ficheros, no mediciones publicadas.
- GPU de consumo: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y en tarjetas de 8 GB como RTX 3060 Ti o RTX 4060 usando Q4_K_M o inferiores. Las variantes IQ2/IQ3 (1,5-2,1 GB) caben incluso en GPUs de 4-6 GB.
- GPU profesionales: A100, H100 y L40S no son necesarias para este tamaño; su uso tendría sentido únicamente para servir muchas peticiones concurrentes en paralelo.
- CPU y memoria RAM: todas las variantes funcionan en CPU; con 8 GB de RAM se puede ejecutar Q4_K_M y con 16 GB, Q6_K sin problemas.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (importando el GGUF mediante Modelfile), LM Studio, koboldcpp, llama-cpp-python y text-generation-webui. vLLM soporta GGUF de forma experimental; TGI no está orientado a GGUF en su flujo principal.
- Latencia y throughput: no disponibles. No se han publicado mediciones y no deben extrapolarse cifras sin verificarlas en el hardware objetivo.
- Almacenamiento: el repositorio completo ocupa 50,4 GB, aunque basta con descargar la variante concreta que se vaya a usar (entre 1,3 y 3,5 GB).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Spark-X2.6-4B-Tema_Q-Abliterated-i1-GGUF (este) | 4,1 B | No disponible | Apache 2.0 | GGUF, 24 variantes i1 + quants estáticos | No disponible |
| Qwen2.5-3B-Instruct | 3,1 B | 32 768 tokens nativos (ampliable con YaRN) | Apache 2.0 | Safetensors, GGUF de terceros, amplia adopción | Métricas públicas en la model card original |
| Llama 3.2 3B Instruct | 3,2 B | 128 000 tokens | Licencia comunitaria Llama 3.2 | Safetensors, GGUF oficial y de terceros | Métricas públicas en la model card original |
| Phi-3.5-mini-instruct | 3,8 B | 128 000 tokens | MIT | Safetensors, GGUF de terceros | Métricas públicas en la model card original |

Nota: los datos de los modelos comparativos provienen de sus model cards públicas y deben verificarse en la fuente original; para este modelo no se dispone de contexto ni de benchmarks, lo que impide una comparación cuantitativa de rendimiento. La ventaja diferencial de este repositorio es la variedad de cuantizaciones con imatrix y la cobertura bilingüe inglés-chino; su desventaja es la ausencia total de documentación técnica y de validación comunitaria (0 descargas, 0 likes en el momento de la consulta).

## Limitaciones y advertencias

- Ausencia de documentación técnica: no se especifican arquitectura, contexto máximo, plantilla de chat, datos de entrenamiento ni proceso de alineación. Integrarlo en producción exige una validación empírica previa.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en conversaciones largas ni en tareas de RAG con documentos extensos.
- Riesgo de alucinación: inherente a un modelo de 4 B sin benchmarks publicados; no hay evidencia de mitigaciones específicas.
- Proceso de abliteration no documentado: si el modelo base ha eliminado los mecanismos de rechazo, aumenta el riesgo de generar contenido inapropiado, sesgado o inseguro sin las salvaguardas habituales. Debe aplicarse filtrado externo en cualquier despliegue orientado al usuario final.
- Sesgos: no disponibles. Al no documentarse la composición del dataset, no se puede evaluar qué sesgos de género, culturales o políticos puede arrastrar.
- Cobertura lingüística limitada: solo inglés y chino declarados; el rendimiento en castellano no está garantizado y probablemente sea deficiente.
- Degradación por cuantización: las variantes IQ1_S, IQ1_M e IQ2_XXS (1,3-1,5 GB) pierden calidad de forma notable; el propio autor las etiqueta como «for the desperate» y «mostly desperate». Para uso real se recomienda IQ3_S o superior, y preferiblemente Q4_K_M o Q5_K_M.
- Licencia: Apache 2.0 permite uso comercial y modificaciones, pero no cubre los derechos sobre los datos de entrenamiento del modelo base ni sobre posibles contenidos generados; conviene revisar la procedencia del modelo original antes de un despliegue comercial.
- Falta de validación comunitaria: 0 descargas y 0 likes implican ausencia de retroalimentación, informes de errores o comparativas independientes.
- Repositorio de gran tamaño: 50,4 GB en total, con el riesgo de descargar variantes innecesarias si no se selecciona el fichero concreto.

## Enlaces

- Repositorio HuggingFace (este modelo): https://huggingface.co/mradermacher/Spark-X2.6-4B-Tema_Q-Abliterated-i1-GGUF
- Modelo base: https://huggingface.co/yuna1126/Spark-X2.6-4B-Tema_Q-Abliterated
- Repositorio de quants estáticos del mismo autor: https://huggingface.co/mradermacher/Spark-X2.6-4B-Tema_Q-Abliterated-GGUF
- Página de descargas del autor para este modelo: https://hf.tst.eu/model#Spark-X2.6-4B-Tema_Q-Abliterated-i1-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/Spark-X2.6-4B-Tema_Q-Abliterated-i1-GGUF/resolve/main/Spark-X2.6-4B-Tema_Q-Abliterated.imatrix.gguf
- Guía de uso de GGUF referenciada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Paper, blog o demo oficial: no disponible en la información proporcionada.
