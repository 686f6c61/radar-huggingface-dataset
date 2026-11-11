# acpi-ai/ant-128m-n9g

## Resumen

ant-128m-n9g es un modelo de lenguaje de 106,4 millones de parámetros publicado por acpi-ai en Hugging Face. Se distribuye junto a un componente poco habitual: un binario de 9,1 GB (`ngram_5gram.bin`) que implementa una capa de memoria basada en n-gramas de orden 5. El modelo base se empaqueta en safetensors con formato de pesos compatible con la familia Llama y un tamaño de 212,8 MB en bf16 (aproximadamente 53 MB en cuantización de 4 bits).

La propuesta técnica del autor es un esquema de "fused decode" en el que el modelo neuronal de 106M propone candidatos de continuación y la capa de n-gramas los "fundamenta" o ancla. Es un enfoque híbrido que recuerda a la decodificación especulativa, pero con la memoria n-grama como fuente de verificación en lugar de un modelo draft. El repositorio ocupa 9,3 GB, prácticamente todo atribuible al binario de n-gramas, que se carga mediante mmap en modo solo lectura.

La relevancia de esta ficha es acotada: se trata de un modelo de nicho, sin descargas ni interacciones en el momento de la consulta, sin model card extendida, sin licencia declarada y sin benchmarks publicados. Resulta interesante como experimento de arquitectura híbrida (modelo pequeño más memoria n-grama externa), pero no como opción de producción sin una evaluación adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (según tag `llama`); sin detalle de capas ni cabezas en la información disponible |
| Parametros totales | 106.390.272 (106,4M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (212,8 MB) y 4 bits (≈53 MB) según la model card; no se detallan otros formatos |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (modelo) + binario propietario `ngram_5gram.bin` (capa de n-gramas) |
| Tamano del repositorio | 9,3 GB (9,1 GB corresponden a `ngram_5gram.bin`) |
| Dependencias | torch, transformers, kenlm-ex (ruedas precompiladas) |
| Aceleracion | CPU por defecto; CUDA automática si está disponible |

## Arquitectura y entrenamiento

La información disponible describe un modelo transformer de 106,4M de parámetros con pesos en safetensors y tag `llama`, lo que sugiere una arquitectura decoder-only estilo Llama, aunque no se especifican número de capas, dimensión oculta, cabezas de atención ni función de activación. No se documenta el corpus de entrenamiento, el número de tokens procesados, la composición del dataset ni si hubo fases de RLHF, DPO o ajuste por instrucciones.

La innovación declarada es el esquema de "fused decode": el modelo neuronal genera candidatos de siguiente token y una capa de memoria de n-gramas de orden 5 (`ngram_5gram.bin`, 9,1 GB, cargada con mmap en solo lectura) actúa como anclaje o verificación. El autor no detalla el algoritmo de fusión (ponderaciones, criterio de aceptación de candidatos, mecanismo de fallback al modelo neuronal), ni si la capa n-grama se construyó a partir del propio corpus de entrenamiento o de un corpus externo. Tampoco se especifica la longitud de contexto efectiva ni cómo interactúa con la memoria n-grama en secuencias largas.

## Capacidades

- Generación de texto autoregresiva con un modelo de 106,4M de parámetros.
- Decodificación aumentada por memoria n-grama de orden 5, orientada a mejorar la fidelidad de las continuaciones sobre patrones vistos en el corpus de la capa n-grama.
- Ejecución en CPU y, de forma automática, en CUDA si hay GPU disponible.
- Inferencia mínima mediante `example.py`, con prompt por defecto "hello how are you" y posibilidad de pasar un prompt arbitrario.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No se documentan capacidades multilingües ni lista de idiomas.

## Casos de uso

- Experimentación con arquitecturas híbridas modelo + memoria n-grama: el repositorio permite reproducir el esquema de fused decode y medir la contribución de la capa n-grama frente al modelo neuronal solo, útil en investigación sobre decodificación aumentada por recuperación.
- Prototipado en entornos sin GPU: con 212,8 MB en bf16 o unos 53 MB en 4 bits, el modelo neuronal cabe en cualquier portátil y la capa n-grama se mapea en memoria, lo que permite probar pipelines de generación en CPU.
- Autocompletado de dominio cerrado: si el corpus que alimenta la capa n-grama es representativo de un dominio concreto (logs, plantillas, documentación técnica), el esquema de anclaje puede reducir continuaciones fuera de distribución en ese dominio.
- Estudio de decodificación especulativa con verificación léxica: la combinación propuesta se puede comparar con draft models neuronales en experimentos de latencia y calidad, usando el binario n-grama como verificador barato.
- Docencia y demostraciones de n-gramas frente a modelos neuronales: el contraste entre la propuesta del modelo y el anclaje de la memoria de 5-gramas sirve para ilustrar las diferencias entre modelado estadístico clásico y neuronal.
- Base para fine-tuning ligero: al ser un modelo de 106M en safetensors con arquitectura tipo Llama, puede servir como punto de partida para ajustes supervisados en tareas acotadas, siempre que se verifique la licencia (no declarada) antes de cualquier uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para el modelo neuronal en bf16 (212,8 MB de pesos más activaciones y caché KV); alrededor de 300-500 MB en 4 bits. La capa n-grama de 9,1 GB se mapea con mmap y consume principalmente memoria del sistema y page cache, no VRAM.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre para el modelo neuronal; una RTX 3060 o superior es más que suficiente. Para el binario n-grama, lo relevante es disponer de RAM y almacenamiento rápido (SSD) por el mmap de 9,1 GB.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Despliegue: el paquete se instala con `pip install .` y se ejecuta con `example.py`; no se documenta integración con vLLM, llama.cpp, Ollama o TGI. Dado el componente n-grama propietario, el despliegue está ligado al código de ejemplo del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ant-128m-n9g | 106,4M + capa n-grama 9,1 GB | No disponible | No disponible | safetensors + bin | Esquema fused decode con memoria n-grama |
| SmolLM-135M (HuggingFaceTB) | 135M | 2.048 tokens | Apache 2.0 | safetensors, GGUF | Modelo pequeño estándar, sin capa externa |
| Qwen2.5-0.5B | 494M | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Mayor tamaño y contexto, ampliamente soportado |
| TinyLlama-1.1B | 1,1B | 2.048 tokens | Apache 2.0 | safetensors, GGUF | Referencia común en el rango de 1B |

La comparación es aproximada: no hay benchmarks del modelo de acpi-ai que permitan contrastar calidad. La diferencia estructural frente a los alternativas es la capa n-grama externa y la ausencia de licencia declarada, que limita su adopción frente a modelos con licencias permisivas y ecosistema de herramientas maduro (llama.cpp, Ollama, vLLM).

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor antes de cualquier despliegue en producción.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, latencia ni robustez frente a modelos de tamaño comparable.
- Idiomas no documentados: se desconoce si el modelo y la capa n-grama están entrenados en inglés, multilingüe u otro idioma.
- Contexto no documentado: se desconoce la ventana efectiva y cómo se comporta el esquema fused decode en secuencias largas.
- Riesgo de alucinación: como cualquier modelo de 106M, la capacidad de razonamiento y de mantener coherencia factual es limitada; la capa n-grama solo ancla patrones vistos, no verifica hechos.
- Dependencia de un binario propietario de 9,1 GB: el formato `ngram_5gram.bin` y la lógica de fusión no están especificados, lo que dificulta auditar, reproducir o portar el sistema a otros runtimes.
- Dependencia de `kenlm-ex`: paquete de terceros que condiciona la instalación y el mantenimiento a largo plazo.
- Sin descargas ni validación comunitaria: no hay señales de uso real ni issues reportados que permitan anticipar problemas en producción.
- Sesgos: no documentados; al desconocerse el corpus de entrenamiento y el del n-grama, no es posible evaluar sesgos de género, raza, idioma o dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/acpi-ai/ant-128m-n9g
- Perfil del autor: https://huggingface.co/acpi-ai
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
