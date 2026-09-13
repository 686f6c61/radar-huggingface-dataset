# Jokoboy/aksara-model

## Resumen

Aksara Mini-LM v3 es un modelo de lenguaje de generación de texto desarrollado por el usuario Jokoboy, construido íntegramente desde cero con la herramienta denominada "lenguaje de programación Aksara", sin partir de pesos de terceros. El modelo se distribuye en HuggingFace bajo licencia Apache-2.0, con soporte declarado para indonesio (principal) e inglés (apoyo), y un enfoque de dominio muy concreto: caza de errores (bug hunting) con metodología defensiva, Python, JavaScript, Kotlin/Android y el propio lenguaje Aksara.

Técnicamente es un transformer minúsculo con tokenizador BPE de vocabulario 500 entrenado sobre un corpus indonesio propio de 441 KB comprimido en LZMA, cuantización int8 y una capa de mezcla de expertos (MoE). La variante entrenada en Google Colab (`model_v3_colab.aksm`) alcanza 1.344.602 parámetros, con dimensión oculta 128, 4 cabezas de atención, 2 capas y 4 expertos, tras 2.000 iteraciones sobre 120.000 tokens.

Su relevancia es más experimental y educativa que productiva: el propio autor advierte en la model card que la salida generativa "aún está en fase temprana (no forma del todo oraciones con sentido)" y que se trata de una base progresiva. El repositorio tiene 0 descargas y 0 "me gusta" en el momento de la consulta, y un tamaño declarado de 0,0 GB, por lo que conviene verificar si los pesos están realmente publicados.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mini-LM v3: embedding + atención multi-cabeza + LayerNorm + FFN-MoE (transformer con mezcla de expertos) |
| Parámetros totales | 1.344.602 (variante `model_v3_colab.aksm`, entrenada en Colab); la variante para móvil no declara cifra |
| Parámetros activos | no disponible (se desconoce cuántos expertos se activan por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 (reducción del 82,9 % del peso, según el autor) |
| Idiomas soportados | indonesio (principal) e inglés (apoyo) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.aksm` (formato propio del ecosistema Aksara; no safetensors ni GGUF) |
| Tokenizador | BPE con vocabulario de 500 tokens, entrenado sobre corpus indonesio propio |
| Corpus de entrenamiento | 441 KB comprimido en LZMA (72 % de compresión) |
| Iteraciones de entrenamiento | 2.000 iteraciones, 120.000 tokens (variante Colab) |
| Tamaño del fichero de modelo | 10,3 MB (declarado) |
| Tamaño del repositorio | 0,0 GB (según HuggingFace) |
| Fecha de creación / actualización | 8 de septiembre de 2026 / 12 de septiembre de 2026 |
| Descargas / valoraciones | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer compacto denominado Mini-LM v3, compuesto por una capa de embedding, atención multi-cabeza, normalización por capas (LayerNorm) y una red feed-forward con mezcla de expertos. La configuración publicada es de dimensión oculta 128, 4 cabezas de atención y 2 capas. La variante móvil usa MoE de 2 expertos, mientras que la variante entrenada en Colab escala a MoE de 4 expertos. El tokenizador es un BPE propio con vocabulario de solo 500 tokens, entrenado sobre el corpus indonesio del autor. No se documenta el uso de decodificación especulativa, atención lineal ni otras técnicas de eficiencia.

El pipeline de entrenamiento declarado es: corpus → BPE → Mini-LM v3 → generación → compresión, ejecutable mediante `app/training_fokus.ak`. El corpus tiene 441 KB (comprimido al 72 % con LZMA) y cubre bug hunting, Python, Aksara, JavaScript y Kotlin/Android. No se menciona el uso de RLHF, DPO ni ajuste por preferencias; tampoco se detalla la composición exacta del dataset ni el número total de tokens de entrenamiento más allá de los 120.000 tokens de la variante Colab. El backend numérico (`aksara_ai/`) está implementado en NumPy puro y desde cero, lo que implica que no hay kernels CUDA ni integración con runtimes de inferencia convencionales.

## Capacidades

- Generación de texto en indonesio (principal) e inglés (apoyo), con calidad declarada como "fase temprana" por el propio autor.
- Enfoque de dominio en bug hunting defensivo: reconocimiento, alcance, IDOR, XSS, SQLi, SSRF y redacción de informes.
- Generación de código en Python, JavaScript y Kotlin/Android, además del lenguaje Aksara.
- Ejecución totalmente offline sobre CPU, sin dependencias de servicios en la nube.
- Integración como chatbot interactivo por línea de comandos (`app/chatgpt_ak.ak`) y como bot de Telegram (`app/jalankan_bot.sh`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión, audio o modo "thinking": no disponible.
- Multilingüismo: limitado a indonesio e inglés según las etiquetas del modelo; no se declaran más idiomas.

## Casos de uso

- Prototipado y docencia sobre arquitecturas transformer: al estar implementado en NumPy puro y con un tokenizador BPE de 500 tokens, sirve para explicar atención, LayerNorm y MoE paso a paso en un aula o curso, inspeccionando cada tensor sin capas de abstracción.
- Experimentación con el lenguaje Aksara: el modelo es la aplicación de referencia de este lenguaje de programación indonesio, por lo que resulta útil a quien quiera evaluar su intérprete, su pipeline de entrenamiento o su formato `.aksm` de pesos.
- Chatbot offline de demostración en indonesio: puede desplegarse en local (CPU, sin red) mediante `python3 -m aksara app/chatgpt_ak.ak` para demos de concepto o ferias, siempre que se acepte la calidad generativa inicial.
- Bot de Telegram de bajo coste: el repositorio incluye `app/jalankan_bot.sh` con configuración por variable de entorno `TELEGRAM_TOKEN`, lo que permite levantar un bot de pruebas sin GPU ni coste de API.
- Asistencia de checklists en bug hunting: dado su corpus orientado a metodología defensiva, puede emplearse para esbozar listas de comprobación de reconocimiento, pruebas de IDOR o XSS y estructura de informes, con revisión humana obligatoria del resultado.
- Investigación sobre tokenizadores de vocabulario mínimo: su BPE de 500 tokens y su corpus comprimido de 441 KB lo convierten en un banco de pruebas para estudiar el compromiso entre tamaño de vocabulario, cobertura léxica y calidad en lenguas de bajos recursos.
- Generación de esqueletos de código en Python, JavaScript o Kotlin para posterior corrección manual, útil en entornos sin conectividad donde no se puede recurrir a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación estandarizada, y los resultados de búsqueda web proporcionados no contienen información relevante sobre el modelo (devuelven exclusivamente páginas de soporte de Microsoft, sin relación con Aksara). Los únicos datos cuantitativos declarados por el autor son de entrenamiento y no de evaluación: 1.344.602 parámetros, 2.000 iteraciones, 120.000 tokens, vocabulario BPE de 500 entradas, corpus de 441 KB y reducción del 82,9 % del peso con int8.

## Requisitos de hardware

- VRAM para inferencia: prácticamente nula. Los 1.344.602 parámetros en int8 equivalen a unos 1,34 MB de pesos; el fichero declarado ocupa 10,3 MB. Cualquier GPU con unos pocos megabytes libres es suficiente, y en la práctica no se necesita GPU.
- GPU recomendadas: no se requiere ninguna. El backend `aksara_ai/` es NumPy puro y no se documenta soporte CUDA. El entrenamiento de la variante grande se realizó en Google Colab, lo que sugiere que una GPU en la nube modesta es suficiente para reentrenar.
- GPU de consumo: cabe en cualquier GPU de consumo e integrada, e incluso en CPU. El autor menciona explícitamente una "versión HP" (móvil), lo que indica ejecución en teléfono.
- Opciones de despliegue: intérprete Aksara propio (`pip install -e .`), CLI de chat (`python3 -m aksara app/chatgpt_ak.ak`) y bot de Telegram (`app/jalankan_bot.sh`). No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni servidores compatibles con la API de OpenAI, dado el formato propietario `.aksm`.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo de respuesta.
- Reentrenamiento: el autor indica que el entrenamiento a gran escala requiere hardware superior al de un teléfono y sugiere usar Spaces o máquinas con GPU mediante `app/training_fokus.ak`.

## Comparativa con modelos similares

No se han encontrado en la información proporcionada modelos comparables de origen indonesio construidos desde cero. La comparativa siguiente usa especificaciones públicas de modelos pequeños ampliamente conocidos, incluidas como referencia de escala (los datos de contexto y licencia de esas alternativas proceden de su documentación pública, no de la búsqueda realizada). No es posible comparar rendimiento porque el modelo Aksara no publica benchmarks.

| Modelo | Parámetros | Contexto | Licencia | Formato de pesos | Idiomas |
|---|---|---|---|---|---|
| Aksara Mini-LM v3 | 1,34 M | no disponible | Apache-2.0 | `.aksm` (propietario) | id, en |
| GPT-2 small | 124 M | 1.024 tokens | Modified MIT | safetensors, GGUF | en |
| SmolLM-135M | 135 M | 2.048 tokens | Apache-2.0 | safetensors, GGUF | en (multilingüe limitado) |
| Qwen2.5-0.5B | 0,49 B | 32.768 tokens | Apache-2.0 | safetensors, GGUF | multilingüe amplio |

La diferencia de escala es de dos a tres órdenes de magnitud, y las alternativas cuentan con ecosistema de inferencia (llama.cpp, vLLM, Ollama) del que Aksara carece. La ventaja diferencial de Aksara Mini-LM v3 es su naturaleza didáctica y su autoconención total: código, tokenizador y pipeline propios.

## Limitaciones y advertencias

- Calidad generativa inicial: el propio autor reconoce que la salida "aún no forma del todo oraciones con sentido". No debe usarse en producción sin una capa de validación o reglas adicionales.
- Sesgos conocidos: no disponible. No se publica ninguna evaluación de sesgos, toxicidad o equidad.
- Riesgo de alucinación: alto y no cuantificado. Con 1,34 M de parámetros y 120.000 tokens de entrenamiento, la probabilidad de generar contenido factualmente incorrecto o incoherente es elevada.
- Cobertura de idiomas: solo indonesio e inglés. No hay evidencia de competencia en castellano ni en otras lenguas; no debe asumirse capacidad multilingüe.
- Longitud de contexto: no declarada. No se puede planificar su uso en conversaciones multi-turno largas o en tareas de contexto extenso.
- Licencia: Apache-2.0 permite uso comercial y modificación con atribución, pero se aplica al modelo publicado. El corpus `Jokoboy/aksara-corpus` y las dependencias del intérprete Aksara deben verificarse por separado antes de un uso comercial.
- Disponibilidad de pesos: el repositorio declara 0,0 GB de tamaño, por lo que es posible que los pesos no estén efectivamente subidos o que solo se distribuya código. Conviene comprobar el contenido real antes de planificar cualquier integración.
- Ecosistema cerrado: el formato `.aksm` y el backend NumPy impiden usar herramientas estándar de cuantización, servido o aceleración (vLLM, llama.cpp, TensorRT-LLM), lo que limita el escalado y la integración en infraestructura existente.
- Mantenimiento: el proyecto tiene 0 descargas y 0 valoraciones, con un único autor, lo que implica un riesgo alto de falta de soporte y de evolución impredecible.
- Fechas de creación y actualización (septiembre de 2026) posteriores a la mayoría de referencias del ecosistema: verificar la coherencia temporal de los metadatos antes de citar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jokoboy/aksara-model
- Dataset asociado: https://huggingface.co/datasets/Jokoboy/aksara-corpus
- Búsqueda web realizada: sin resultados relevantes. Únicamente se recuperaron páginas de soporte de Microsoft (support.microsoft.com, techcommunity.microsoft.com) sin relación con el modelo, por lo que no hay papers, blogs, repositorios ni demos adicionales que enlazar.
