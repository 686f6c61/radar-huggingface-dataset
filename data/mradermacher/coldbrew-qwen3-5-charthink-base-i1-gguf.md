# mradermacher/ColdBrew-Qwen3.5-CharThink-Base-i1-GGUF

## Resumen

Esta ficha corresponde a una colección de cuantizaciones GGUF ponderadas con matriz de importancia (imatrix) del modelo SvalTek/ColdBrew-Qwen3.5-CharThink-Base, realizadas por mradermacher, un cuantizador muy prolífico del ecosistema Hugging Face. El modelo base es un ajuste de la familia Qwen3.5 con unos 8.953.803.264 parámetros (8,95 B), orientado según su nomenclatura a generación de texto conversacional con personajes ("CharThink"). El repositorio no es un modelo nuevo, sino el empaquetado en formatos comprimidos que permiten ejecutarlo en hardware de consumo.

Su relevancia radica en que ofrece 24 variantes de cuantización (desde IQ1_S de 2,8 GB hasta Q6_K y superiores), cubriendo desde portátiles con 4 GB de VRAM hasta estaciones de trabajo. La licencia Apache 2.0 del modelo base y de las cuantizaciones permite uso comercial. La model card indica además que se trata de un modelo con capacidades de visión, cuyos archivos mmproj se distribuyen en el repositorio de cuantizaciones estáticas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (densidad no especificada) |
| Parámetros totales | 8.953.803.264 (8,95 B) |
| Parámetros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas imatrix) |
| Idiomas soportados | Inglés (etiqueta `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones imatrix); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base, SvalTek/ColdBrew-Qwen3.5-CharThink-Base, es un ajuste de la familia Qwen3.5 con 8,95 B de parámetros. La etiqueta `unsloth` sugiere que el ajuste fino se realizó con las herramientas de Unsloth, habituales en la comunidad de modelos de rol y personajes, aunque la model card del modelo base no está incluida en la información disponible, por lo que los detalles del entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles.

Este repositorio concreto no modifica los pesos: aplica cuantización GGUF ponderada con imatrix (matriz de importancia calculada sobre datos de calibración), una técnica que reduce la pérdida de calidad en cuantizaciones agresivas (2-4 bits) respecto a las cuantizaciones estáticas. El propio autor señala que las variantes IQ suelen ser preferibles a las K de tamaño equivalente. La model card indica que el modelo base tiene capacidades de visión y que los archivos mmproj correspondientes se encuentran en el repositorio de cuantizaciones estáticas, no en este.

## Capacidades

- Generación de texto conversacional en inglés (etiqueta `conversational` en el repositorio).
- Interacción con personajes y juego de rol según la nomenclatura del modelo base ("CharThink"), posiblemente con trazas de razonamiento; los detalles exactos no están disponibles.
- Capacidades de visión en el modelo base, según la model card; requiere los archivos mmproj del repositorio estático.
- Ejecución local eficiente gracias a las 24 variantes de cuantización imatrix, desde 2,8 GB hasta más de 6,6 GB por archivo.
- Soporte de tool calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: solo el inglés figura como idioma soportado de forma oficial.

## Casos de uso

- Rol y conversación con personajes en local: la nomenclatura "CharThink" apunta a chat con personajes; combinado con frontends como SillyTavern o KoboldCpp, permite sesiones de rol privadas sin depender de APIs de pago.
- Chatbot local en PC de consumo: con la variante i1-Q4_K_M (5,7 GB, señalada por el autor como "fast, recommended") cabe en una GPU de 8 GB de VRAM, lo que lo hace viable para asistentes personales que prioricen privacidad.
- Escritura creativa y narrativa interactiva: como modelo de ~9 B afinado a partir de Qwen3.5 con enfoque conversacional, puede asistir en redacción de diálogos y ficción en inglés.
- Experimentación con cuantizaciones: la amplia gama de variantes imatrix (IQ1_S a Q6_K) es útil para investigar el impacto de la cuantización en calidad y velocidad en modelos de 9 B.
- Ejecución en hardware muy limitado: la variante i1-IQ1_S (2,8 GB) permite cargar el modelo en equipos sin GPU dedicada o con 4 GB de VRAM, aunque con pérdida de calidad significativa.
- Inferencia con visión en local: descargando los mmproj del repositorio estático, se puede probar la entrada de imágenes en entornos llama.cpp compatibles.
- Creación de cuantizaciones propias: el archivo imatrix de 0,1 GB incluido permite a usuarios avanzados generar sus propias cuantizaciones personalizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Tampoco existen evaluaciones comparativas entre las distintas variantes de cuantización más allá de las notas cualitativas del autor (por ejemplo, i1-Q4_K_S descrita como "optimal size/speed/quality" e i1-IQ1_S como "for the desperate").

## Requisitos de hardware

- VRAM estimada para inferencia (archivo + sobrecarga de runtime; la caché KV añade consumo según el contexto):
  - i1-IQ1_S (2,8 GB): aproximadamente 4 GB de VRAM.
  - i1-IQ2_M (3,7 GB): aproximadamente 5 GB de VRAM.
  - i1-Q3_K_M (4,7 GB): aproximadamente 6-7 GB de VRAM.
  - i1-Q4_K_M (5,7 GB): aproximadamente 7-8 GB de VRAM.
  - i1-Q5_K_M (6,6 GB): aproximadamente 8-9 GB de VRAM.
- GPU recomendadas: cualquier GPU de consumo con 8 GB de VRAM o más ejecuta cómodamente las variantes Q4/Q5 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB). Para calidad máxima, la variante Q6_K y el modelo base en safetensors requieren más memoria.
- Consumer GPU: sí, es el objetivo principal del repositorio; con 6-8 GB de VRAM se ejecutan las variantes Q3/Q4. También es viable solo con CPU y 8-16 GB de RAM gracias al formato GGUF, y en Apple Silicon con memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI están orientados a pesos safetensors, por lo que no son la vía habitual para este repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| ColdBrew-Qwen3.5-CharThink-Base-i1-GGUF (este) | 8,95 B | GGUF | imatrix, IQ1_S a Q6_K | Apache 2.0 | 24 variantes; sin mmproj |
| mradermacher/ColdBrew-Qwen3.5-CharThink-Base-GGUF | 8,95 B | GGUF | estáticas | Apache 2.0 | Incluye archivos mmproj para visión |
| SvalTek/ColdBrew-Qwen3.5-CharThink-Base | 8,95 B | safetensors | Sin cuantizar | Apache 2.0 | Modelo original, máxima calidad |
| mradermacher/ColdBrew-Qwen3.5-RP_Base-CharThink-i1-GGUF | no disponible | GGUF | imatrix | no disponible | Variante relacionada enfocada a rol |

Entre las tres primeras opciones, la elección depende del hardware y del caso de uso: las cuantizaciones imatrix de este repositorio ofrecen en general mejor calidad por tamaño que las estáticas, mientras que el modelo base en safetensors es la referencia de calidad máxima para servidores con GPU de gama alta.

## Limitaciones y advertencias

- Pérdida de calidad por cuantización: el propio autor advierte que i1-IQ1_S es "for the desperate", i1-IQ1_M "mostly desperate" y las variantes Q2 "very low quality"; para producción se recomiendan Q4_K_S, Q4_K_M o superiores.
- Idioma: solo el inglés está soportado oficialmente; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Longitud de contexto no publicada: no es posible planificar ventanas de contexto grandes ni estimar la caché KV con precisión.
- Variante "Base": la nomenclatura sugiere que no es una versión instruct afinada para seguimiento de instrucciones genérico; conviene verificar el formato de prompt adecuado antes de usarlo como asistente general.
- Visión incompleta en este repositorio: los archivos mmproj están en el repositorio estático, no aquí; la funcionalidad de visión requiere descargarlos aparte.
- Repositorio muy reciente (creado el 29/10/2026, sin descargas ni likes registrados): no existe aún retroalimentación comunitaria sobre su calidad real.
- Sin benchmarks publicados: no hay datos objetivos de MMLU, HumanEval u otras pruebas para este ajuste concreto.
- Licencia: Apache 2.0 permite uso comercial, pero al ser una cuantización de terceros conviene revisar también los términos del modelo base y del propietario original de Qwen3.5.

## Enlaces

- Repositorio de la ficha (cuantizaciones imatrix): https://huggingface.co/mradermacher/ColdBrew-Qwen3.5-CharThink-Base-i1-GGUF
- Modelo base original: https://huggingface.co/SvalTek/ColdBrew-Qwen3.5-CharThink-Base
- Cuantizaciones estáticas (incluye mmproj): https://huggingface.co/mradermacher/ColdBrew-Qwen3.5-CharThink-Base-GGUF
- Página de descargas y resumen del autor: https://hf.tst.eu/model#ColdBrew-Qwen3.5-CharThink-Base-i1-GGUF
- Variante RP relacionada: https://huggingface.co/mradermacher/ColdBrew-Qwen3.5-RP_Base-CharThink-i1-GGUF
- Guía de uso de archivos GGUF referenciada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
