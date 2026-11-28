# nuvais/Fanar-2-27B-Instruct-Q5_K_M-GGUF

## Resumen

Fanar-2-27B-Instruct es un modelo de lenguaje de 27.009.346.304 parámetros (unos 27.000 millones) desarrollado por QCRI (Qatar Computing Research Institute), orientado a generación de texto y conversación en árabe e inglés. Esta ficha concreta, publicada por el usuario `nuvais`, no es el modelo original en pesos completos, sino una copia de un único archivo de la cuantización estática `Q5_K_M` en formato GGUF, generada originalmente por `mradermacher` a partir de los pesos de QCRI y redistribuida sin modificaciones para simplificar su descarga en Inference Endpoints.

El modelo base emplea una arquitectura transformer densa (no se dispone de detalles adicionales sobre atención, capas o innovaciones internas en la información proporcionada) y está pensado para aplicaciones conversacionales con soporte de plantilla de chat propia, incluyendo un modo de razonamiento que puede desactivarse por petición mediante `chat_template_kwargs: {"no_thinking": true}`. Su relevancia actual radica en ser una de las pocas familias de modelos abiertos entrenadas específicamente para árabe con licencia Apache 2.0, lo que facilita su uso comercial y su despliegue en infraestructura propia.

Esta variante GGUF en particular está pensada para servir el modelo con `llama.cpp` en hardware modesto: el archivo pesa 19,3 GB y, según la model card, requiere unos 2,1 GB adicionales de caché KV a 8.192 tokens con caché de 8 bits. El caso de uso declarado es Darbi (دربي), una aplicación que enseña el lenguaje de la IA a egresados de las escuelas Mostaqila de Qatar, desarrollada para el hackathon Qai x Hugging Face Hackathon 01 en Doha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles de atención y capas no disponibles) |
| Parametros totales | 27.009.346.304 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (la model card cita 8.192 tokens como ejemplo de calculo de cache KV, no como limite confirmado) |
| Tipos de cuantizacion | Q5_K_M (esta variante); el repositorio fuente de mradermacher incluye otras cuantizaciones GGUF |
| Idiomas soportados | Arabe (ar) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo unico de 19,3 GB) |

## Arquitectura y entrenamiento

La información disponible confirma que el modelo base es un transformer denso de 27.000 millones de parámetros, pero no detalla el número de capas, la configuración de atención, el número de tokens de entrenamiento ni la composición del dataset. Tampoco se especifica si hubo etapas de RLHF, DPO u otro tipo de ajuste por preferencias; únicamente se indica que el modelo es una variante "Instruct", lo que implica algún proceso de ajuste para seguir instrucciones y conversar.

Sí se documenta una innovación relevante a nivel de plantilla: Fanar 2 incorpora en su `chat_template.jinja` un bloque de instrucciones para tool calling y un modo de razonamiento que puede desactivarse por petición con `no_thinking: true`. Esta variante GGUF reproduce esa plantilla con un único cambio técnico: el bloque `{% raw %}` original se reescribió como literal de cadena porque el motor Jinja de `llama.cpp` no soporta la etiqueta `raw`. Según la model card, el prompt renderizado es idéntico para chat plano, `no_thinking` y herramientas (verificado con jinja2).

## Capacidades

- Generación de texto y conversación multi-turno en árabe e inglés.
- Modo de razonamiento activable o desactivable por petición mediante `chat_template_kwargs: {"no_thinking": true}`.
- Soporte de tool calling / function calling a través de la plantilla de chat del modelo base.
- Compatibilidad con la API de chat completions de OpenAI al servirse con `llama.cpp` server.
- Capacidades multilingües limitadas a los idiomas declarados (ar, en).
- No se documentan capacidades de visión, audio ni otras modalidades en la información disponible.

## Casos de uso

- Enseñanza de conceptos de IA en árabe: es exactamente el escenario declarado por el autor (Darbi), donde el modelo responde en árabe a egresados de las escuelas Mostaqila de Qatar; su entrenamiento específico en árabe lo hace adecuado frente a modelos genéricos.
- Asistente conversacional en árabe para atención al ciudadano: con licencia Apache 2.0 y despliegue en una sola GPU L4, se puede servir una API compatible con OpenAI para integraciones internas sin coste de licencia.
- Generación asistida de código y explicaciones técnicas bilingües: útil en equipos donde se documenta en inglés pero se explica en árabe, aprovechando el soporte de ambos idiomas en un mismo modelo.
- Pipelines con tool calling: la plantilla incluye instrucciones de herramientas, por lo que se puede conectar a funciones externas (búsqueda, cálculo, APIs) en flujos de agentes de un solo paso o multi-paso.
- Despliegue en infraestructura modesta con `llama.cpp`: al pesar 19,3 GB en Q5_K_M y necesitar unos 2,1 GB de caché KV a 8.192 tokens con caché de 8 bits, cabe en GPUs de 24 GB como la L4 o la RTX 4090, lo que permite prototipos y demos con scale-to-zero.
- Investigación sobre modelos árabes: sirve como referencia cuantizada para evaluar el comportamiento de Fanar 2 en tareas de razonamiento y generación en árabe sin necesidad de descargar los pesos completos.
- Fine-tuning ligero o evaluación de prompts: al ser un GGUF de un solo archivo, es cómodo para pruebas reproducibles con una revisión y un hash fijos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos: 19,3 GB en Q5_K_M (archivo único).
- Caché KV: aproximadamente 2,1 GB a 8.192 tokens con caché de 8 bits, según la estimación con `hf-mem` incluida en la model card.
- VRAM total estimada: en torno a 21-22 GB para contexto de 8.192 tokens con caché de 8 bits; el margen real depende del backend y del contexto efectivo.
- GPU recomendadas: NVIDIA L4 (24 GB) es la configuración usada por el autor en un Inference Endpoint con scale-to-zero; una RTX 4090 (24 GB) es una alternativa consumer viable con la misma cantidad de VRAM.
- GPU no viables: tarjetas de 16 GB o menos no pueden alojar los pesos Q5_K_M completos sin offloading a CPU/RAM.
- Opciones de despliegue: `llama.cpp` server con `--jinja` y `--chat-template-file` (o la variable `LLAMA_ARG_CHAT_TEMPLATE_FILE`); también es compatible con Inference Endpoints de Hugging Face y con cualquier runtime que acepte GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Fanar-2-27B-Instruct (esta variante Q5_K_M) | 27,0 B | No disponible | ar, en | Apache 2.0 | GGUF |
| QCRI/Fanar-2-27B-Instruct (original) | 27,0 B | No disponible | ar, en | Apache 2.0 | Safetensors (pesos completos) |
| mradermacher/Fanar-2-27B-Instruct-GGUF | 27,0 B | No disponible | ar, en | Apache 2.0 | GGUF (varias cuantizaciones) |
| Otros modelos abiertos centrados en arabe de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación con modelos de otras familias (por ejemplo, modelos abiertos de 27-32 B centrados en inglés) no se puede completar con datos verificables en la información proporcionada, ya que no se han publicado resultados de benchmarks para Fanar 2 en este material.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al estar entrenado por QCRI con foco en árabe y Qatar, es previsible un sesgo cultural y regional, pero no se cuantifica.
- Riesgo de alucinación: no evaluado en la información disponible; como todo modelo generativo, puede producir contenido incorrecto, especialmente en dominios especializados.
- Cobertura de idiomas limitada a árabe e inglés; el rendimiento en otras lenguas (incluido el castellano) no está garantizado ni documentado.
- Longitud de contexto: no confirmada; la cifra de 8.192 tokens aparece solo como ejemplo de cálculo de caché KV, no como límite oficial del modelo.
- Licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribución a QCRI (modelo) y a mradermacher (cuantización); esta variante es una copia no modificada de los pesos, no un modelo nuevo.
- La plantilla de chat de esta variante ha sido adaptada para `llama.cpp` (bloque `raw` reescrito como literal); si se usa otro runtime, conviene verificar que el prompt renderizado coincide con el del modelo base.
- El archivo GGUF es de un solo tamaño (Q5_K_M); para contextos muy largos o GPUs de menor VRAM habría que recurrir a otras cuantizaciones del repositorio de mradermacher.
- Fecha de creación y actualización del repositorio (noviembre de 2026) posterior a la del modelo base; conviene fijar la revisión y el hash sha256 indicados para reproducibilidad.

## Enlaces

- Repositorio de esta variante GGUF: https://huggingface.co/nuvais/Fanar-2-27B-Instruct-Q5_K_M-GGUF
- Modelo base: https://huggingface.co/QCRI/Fanar-2-27B-Instruct
- Plantilla de chat del modelo base: https://huggingface.co/QCRI/Fanar-2-27B-Instruct/blob/074005040e9c3511b1c43b4298bef09908285534/chat_template.jinja
- Repositorio de cuantizaciones de mradermacher: https://huggingface.co/mradermacher/Fanar-2-27B-Instruct-GGUF
- Herramienta de estimación de memoria hf-mem: https://github.com/alvarobartt/hf-mem
