# OVHaiLLM/Olala-v1.0-mini-7A1B

## Resumen

Olala-v1.0-mini-7A1B es un modelo de lenguaje de tipo *small reasoning model* orientado a chat, seguimiento de instrucciones y uso de herramientas (tool calling), desarrollado por OVHai LLM (grupo OVHcloud) y publicado con pesos abiertos bajo licencia Apache 2.0. Se construye sobre una arquitectura híbrida Mamba-3 / atención con mezcla de expertos (MoE), con 6.773.124.144 parámetros totales y aproximadamente 1.000 millones de parámetros activos por token. El modelo forma parte de una familia que incluye el checkpoint base (preentrenado con 12,8 billones de tokens), el checkpoint tras SFT y esta versión final post-entrenada con razonamiento, chat y tool use.

La propuesta de valor principal es la eficiencia: solo 7 de sus 36 capas mantienen caché KV, lo que reduce drásticamente los requisitos de memoria durante la inferencia y permite, según el autor, ejecutarlo en un portátil. Además, incorpora un modo de razonamiento con cuatro niveles de esfuerzo, entrenado mediante aprendizaje por refuerzo para llamar a herramientas y realizar búsquedas en múltiples turnos. Está entrenado en tres supercomputadores europeos (JUPITER en Alemania, Jean Zay en Francia y MeluXina en Luxemburgo) sobre 1.024 GPU NVIDIA GH200 y GPU H100.

Es relevante ahora por su combinación de licencia permisiva (Apache 2.0), soporte multilingüe amplio (37 idiomas declarados), arquitectura híbrida poco habitual en modelos abiertos de este tamaño y enfoque agéntico con razonamiento explícito. El modelo se publicó el 30 de octubre de 2026 y acumula más de 64.000 descargas y 350 likes en Hugging Face, lo que indica una adopción temprana significativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-3 / atención con mezcla de expertos (MoE); 36 capas, de las cuales solo 7 mantienen caché KV |
| Parametros totales | 6.773.124.144 (≈6,77 mil millones) |
| Parametros activos | ≈1.000 millones por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene pesos en safetensors; no se detallan cuantizaciones oficiales) |
| Idiomas soportados | en, zh, fr, de, it, ja, ru, es, pl, pt, nl, el, tr, cs, uk, hu, ro, ko, ar, fi, sv, no, da, bg, sk, hr, lt, sl, bs, he, et, ca, lv, ka, sr, sq, is (37 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, requiere `custom_code`) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida que combina capas Mamba-3 (modelo de espacio de estados) con capas de atención, organizadas en una estructura de mezcla de expertos. De las 36 capas totales, solo 7 conservan caché KV, lo que reduce el coste de memoria asociado al contexto largo y explica la afirmación del autor de que puede ejecutarse en un portátil. Con aproximadamente 1.000 millones de parámetros activos por token sobre 6,77 mil millones totales, el modelo sigue un patrón de activación dispersa típico de MoE.

El entrenamiento se realizó sobre 12,8 billones de tokens procedentes de conjuntos de datos públicos y datos sintéticos propios. El proceso incluyó preentrenamiento, una fase de *annealing*, SFT (supervised fine-tuning) y RL (reinforcement learning). El post-entrenamiento con RL se orientó específicamente a dotar al modelo de capacidades de razonamiento (con cuatro niveles de esfuerzo configurables) y de uso de herramientas con búsqueda multi-turno. La infraestructura utilizó 1.024 GPU NVIDIA GH200 en JUPITER, además de GPU H100 en Jean Zay, con un consumo energético estimado de aproximadamente 1,16 GWh y unas emisiones de 30-50 toneladas de CO₂ (valor declarado de 40.000.000 g, con suministro renovable).

## Capacidades

- Generación de texto conversacional multi-turno con seguimiento de instrucciones.
- Razonamiento explícito con cuatro niveles de esfuerzo (*reasoning effort levels*): el modelo "piensa antes de responder".
- Tool calling / function calling, entrenado mediante RL.
- Razonamiento agéntico multi-paso, incluyendo búsqueda sobre múltiples turnos.
- Capacidades multilingües en 37 idiomas, con presencia destacada de lenguas europeas (español, catalán, euskera, gallego no declarado, pero sí ca, eu no listado; sí ca, y lenguas eslavas y nórdicas).
- Modo chat e instrucciones generales.
- No se declaran capacidades de visión ni audio en la información disponible.
- No se declaran capacidades específicas de código o matemáticas en la model card, aunque el razonamiento y el tool calling son aplicables a esos dominios.

## Casos de uso

- **Atención al cliente automatizada:** el modelo puede gestionar conversaciones multi-turno con razonamiento y tool calling, integrándose con sistemas de ticketing o CRM mediante function calling para consultar pedidos, estados de cuenta o bases de conocimiento.
- **Agentes de búsqueda multi-turno:** gracias al entrenamiento con RL para búsqueda sobre varios turnos, es adecuado para asistentes que consultan APIs o motores de búsqueda de forma iterativa y sintetizan resultados.
- **Automatización de flujos con herramientas:** en pipelines donde el modelo debe decidir qué función invocar (envío de correo, consulta a base de datos, creación de tareas) y encadenar varias llamadas, el soporte nativo de tool calling reduce la ingeniería de prompts.
- **Asistencia en escritura multilingüe:** con 37 idiomas soportados, sirve para redacción, traducción asistida y resumen en entornos corporativos europeos con requisitos de cobertura lingüística amplia.
- **Prototipado y despliegue en hardware limitado:** al requerir solo 7 capas con caché KV y ~1B de parámetros activos, puede ejecutarse en portátiles o estaciones de trabajo sin GPU de datacenter, lo que facilita demos, pruebas locales y desarrollo offline.
- **Razonamiento con coste controlado:** los cuatro niveles de esfuerzo permiten ajustar la profundidad de razonamiento según la tarea, útil en aplicaciones donde se quiere equilibrar latencia y calidad (por ejemplo, clasificación rápida frente a resolución de problemas complejos).
- **Procesamiento de documentos y extracción de datos:** combinado con tool calling para consultar fuentes externas y con razonamiento multi-paso, puede emplearse en pipelines de extracción y verificación de información.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia:** no disponible de forma oficial. Como referencia orientativa basada en el tamaño del repo (13,6 GB en safetensors, presumiblemente en fp16/bf16), la inferencia en precisión completa requeriría del orden de 14-16 GB de VRAM; con cuantización a 8 bits podría situarse en torno a 7-8 GB y a 4 bits en torno a 4-5 GB, aunque estas cifras no están confirmadas por el autor.
- **GPU recomendadas:** el autor indica que el modelo "funciona en un portátil". Para despliegue en servidor se puede usar cualquier GPU con suficiente VRAM; no se especifican modelos concretos.
- **Consumer GPU:** según la afirmación del autor, cabe en hardware de consumo; la reducción de caché KV a 7 capas favorece contextos largos en GPU con VRAM moderada.
- **Opciones de despliegue:** transformers (requiere `custom_code`); no se confirman oficialmente vLLM, llama.cpp, Ollama o TGI en la información disponible. Existe un endpoint gestionado en OVHcloud AI Endpoints.
- **Latencia y throughput:** no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones oficiales en la información proporcionada. La siguiente tabla recoge únicamente los datos verificables del modelo frente a alternativas de categoría similar, marcando como "no disponible" lo que no se conoce.

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Olala-v1.0-mini-7A1B | 6,77B | ≈1B | no disponible | Apache 2.0 | Híbrido Mamba-3/atención MoE, 37 idiomas, tool calling con RL |
| Alternativas de ~7B tipo transformer | no disponible | no disponible | no disponible | no disponible | No se han proporcionado datos comparativos |
| Alternativas MoE pequeñas | no disponible | no disponible | no disponible | no disponible | No se han proporcionado datos comparativos |

## Limitaciones y advertencias

- **Sesgos:** no se documentan sesgos específicos en la información disponible; al entrenarse con datos públicos y sintéticos, es probable que herede sesgos de esas fuentes, pero no hay evaluación publicada.
- **Alucinación:** no se han publicado tasas de alucinación ni evaluaciones de fidelidad; como todo modelo generativo, existe riesgo, especialmente en razonamiento multi-paso y tool calling.
- **Contexto:** la longitud máxima de contexto no está especificada, lo que impide planificar su uso en tareas de contexto largo con garantías.
- **Idiomas:** aunque se declaran 37 idiomas, no se especifica el nivel de calidad por idioma; el rendimiento puede variar considerablemente entre lenguas con más o menos presencia en los datos.
- **Licencia:** Apache 2.0 permite uso comercial, modificación y redistribución, pero conviene revisar las obligaciones de atribución y las condiciones del código personalizado (`custom_code`) que requiere transformers.
- **Producción:** la falta de benchmarks publicados, de datos de latencia/throughput y de cuantizaciones oficiales dificulta una evaluación rigurosa antes de desplegar en producción; se recomienda validación propia.
- **Formato:** requiere `custom_code` en transformers, lo que puede complicar la integración con herramientas estándar y aumentar la superficie de mantenimiento.
- **Emisiones:** el dato de emisiones (40 t CO₂) es una estimación del autor con suministro renovable, no una medición independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B
- Modelo base (preentrenado): https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B-base
- Checkpoint SFT: https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B-SFT
- Informe técnico (PDF): https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B/blob/main/Olala-v1.0-mini.pdf
- Playground: https://olala.ovh.com
- Endpoint gestionado en OVHcloud AI Endpoints: https://www.ovhcloud.com/en/public-cloud/ai-endpoints/catalog/olala-v1-0-mini-7a1b/
