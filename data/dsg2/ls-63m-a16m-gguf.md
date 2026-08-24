# Dsg2/LS-63M-A16M-GGUF

## Resumen

LS-63M-A16M es un modelo de lenguaje de tipo mixture of experts (MoE) en miniatura, desarrollado por el usuario Dsg2 y publicado bajo licencia Apache 2.0. Se trata de un experimento de entrenamiento realizado íntegramente en una GPU NVIDIA GTX 1660 Super, con aproximadamente 1.000 millones de tokens procesados en 30 horas de cómputo. El modelo emplea enrutamiento top-1, lo que significa que solo activa un experto por token, alcanzando 16 millones de parámetros activos de un total declarado de 63 millones.

La relevancia de este modelo reside en su carácter demostrativo: muestra que es posible entrenar un MoE funcional con recursos de hardware muy limitados, algo poco habitual en un ecosistema dominado por modelos de gran escala. Su tamaño reducido y su formato GGUF lo hacen ejecutable en CPU o GPUs de gama baja, lo que lo convierte en una herramienta educativa interesante para estudiar el comportamiento de arquitecturas MoE sin necesidad de infraestructura costosa. No obstante, el propio autor lo describe como un modelo "sin practicidad" dentro de su colección personal, por lo que no está orientado a uso productivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of experts (MoE) con enrutamiento top-1 |
| Parametros totales | 63M (declarados por el autor); 69.640.704 (pesos safetensors) |
| Parametros activos | 16M |
| Longitud de contexto | 8192 (segun model card; los ejemplos de chat muestran 16384) |
| Tipos de cuantizacion | Q8 (unica mencionada en la model card) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tambien safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura MoE con enrutamiento top-1, donde cada token es dirigido a un único experto entre varios disponibles. Esta estrategia reduce el coste computacional por token en comparación con un modelo denso del mismo tamaño total, aunque en este caso el número de parámetros activos (16M) es considerablemente menor que el total (63M). No se especifica el número de expertos ni la dimensión de cada uno en la información disponible.

El entrenamiento se realizó sobre una mezcla de datasets públicos: bigcode/the-stack-v2, bigcode/starcoderdata y Salesforce/wikitext, todos en inglés. Se procesaron aproximadamente 1.000 millones de tokens durante 30 horas en una GTX 1660 Super. No se menciona el uso de técnicas de alineación como RLHF o DPO; el modelo se presenta como un checkpoint tras la primera época de entrenamiento. La pérdida de validación final fue de 1.4286 y la perplejidad de 4.17.

## Capacidades

- Generacion de texto en ingles: produce respuestas coherentes en conversaciones cortas, como se muestra en los ejemplos de chat de la model card.
- Generacion de codigo basico: puede escribir funciones simples en Python, aunque con errores de comprension (por ejemplo, usa `re.split()` de forma incorrecta en un ejemplo de inversion de cadena).
- Razonamiento limitado: falla en preguntas factuales simples (responde "Juan Van Gogh" a la capital de Francia).
- Sin soporte de tool calling ni function calling: no se menciona ninguna capacidad de invocacion de herramientas.
- Sin capacidades de agente ni razonamiento multi-paso: el modelo no esta disenado para tareas complejas.
- Sin soporte de vision, audio u otras modalidades: es exclusivamente texto.
- Multilingue: no, solo ingles.

## Casos de uso

- Educacion e investigacion sobre MoE: permite estudiar el comportamiento de enrutamiento top-1 en un modelo pequeno, analizar la especializacion de expertos y comparar con modelos densos equivalentes. Se puede ejecutar en CPU o GPU modesta.
- Pruebas de cuantizacion y despliegue: al estar disponible en GGUF Q8, es util para probar flujos de trabajo con llama.cpp, Ollama u otros runners de CPU, evaluando latencia y calidad de cuantizacion en modelos MoE.
- Prototipado de pipelines de generacion de texto: sirve como placeholder en entornos de desarrollo donde se necesita un modelo ligero para validar integraciones antes de usar uno mayor.
- Benchmarking de hardware: al ser extremadamente pequeno, permite medir el rendimiento de GPUs antiguas o CPUs sin cuello de botella de memoria.
- Generacion de codigo educativo: puede producir ejemplos sencillos de funciones Python, aunque con errores, lo que puede usarse para ilustrar limitaciones de los modelos de lenguaje.
- Experimentacion con fine-tuning: al ser un modelo abierto con pesos safetensors, se puede fine-tuning en tareas especificas con recursos minimos, explorando como el MoE se adapta a dominios concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica reportada es la perdida de validacion (1.4286) y la perplejidad (4.17) al final del entrenamiento. Los ejemplos de chat muestran velocidades de inferencia de 117-129 tokens por segundo en CPU (probablemente en una maquina moderna), pero no hay datos comparativos con otros modelos.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB para el modelo Q8 (el archivo GGUF pesa aproximadamente 0.2 GB segun el tamano del repositorio). Cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con soporte CUDA, Vulkan o ROCm; tambien funciona en CPU pura. El autor probo la version Q8 en la ultima build de llama.cpp para CPU.
- Compatibilidad con consumer GPU: si, incluso en GPUs integradas o tarjetas antiguas (GTX 900 series o superiores).
- Opciones de despliegue: llama.cpp (probado), Ollama, vLLM (si se convierte a safetensors), TGI (con adaptacion). El formato GGUF es compatible con la mayoria de runners.
- Latencia y throughput: en los ejemplos de la model card, se observan 117-129 tokens/s en CPU, lo que indica un rendimiento muy alto para un modelo de este tamano. En GPU seria aun mayor.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa con otros modelos MoE de tamano similar. Los modelos comparables mas conocidos (como TinyLlama, 1.1B, o modelos MoE como Mixtral 8x7B) son mucho mas grandes y no son directamente comparables. Se podria mencionar que LS-63M-A16M es significativamente mas pequeno que cualquier MoE comercial o de investigacion publicado, y que su rendimiento es esperablemente inferior. No obstante, no hay benchmarks publicados que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Sesgos y errores factuales: el modelo produce respuestas incorrectas en preguntas de conocimiento general (ejemplo: "Juan Van Gogh" como capital de Francia). No es fiable para tareas que requieran precision.
- Alucinaciones frecuentes: en el ejemplo de generacion de codigo, el modelo inventa usos de funciones que no corresponden al problema planteado.
- Limitacion de idioma: solo ingles; no soporta otros idiomas.
- Contexto limitado: aunque los ejemplos muestran 16384 tokens, la model card declara 8192; en cualquier caso, es una ventana corta para aplicaciones de contexto largo.
- Sin soporte de tool calling ni agentes: no puede integrarse en flujos que requieran interaccion con APIs o ejecucion de acciones.
- Naturaleza experimental: el autor lo describe como un modelo "sin practicidad" en su coleccion. No esta pensado para produccion.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no tiene garantias de calidad ni soporte.
- Riesgo de sesgos de los datos de entrenamiento: al usar The Stack v2 y StarCoderData, puede reflejar sesgos presentes en codigo fuente publico.

## Enlaces

- Modelo GGUF: https://huggingface.co/Dsg2/LS-63M-A16M-GGUF
- Modelo base (safetensors): https://huggingface.co/Dsg2/LS-63M-A16M
- Coleccion del autor: https://huggingface.co/collections/Dsg2/ls
