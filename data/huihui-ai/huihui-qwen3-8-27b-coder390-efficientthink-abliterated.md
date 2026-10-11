# huihui-ai/Huihui-Qwen3.8-27B-Coder390-EfficientThink-abliterated

## Resumen

Huihui-Qwen3.8-27B-Coder390-EfficientThink-abliterated es una version "abliterated" (sin rechazos) del modelo nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2, publicada por el usuario huihui-ai en Hugging Face. La abliteracion es una tecnica de edicion de pesos que elimina la direccion de activacion asociada a las respuestas de rechazo, de modo que el modelo deja de negarse a responder a determinadas peticiones. En este caso concreto solo se han ablacionado las capas 2 a 42.

El modelo hereda el pipeline image-text-to-text, lo que indica capacidades multimodales (entrada de imagen y texto), y el nombre sugiere una variante de 27.000 millones de parametros basada en Qwen3.8 con enfasis en generacion de codigo ("Coder390") y modo de razonamiento eficiente ("EfficientThink"). La licencia declarada es apache-2.0 y la libreria de referencia es transformers.

La relevancia de esta ficha radica en que se trata de una version sin censura de un modelo multimodal orientado a codigo, un perfil poco habitual en el ecosistema open source. No obstante, la informacion publicada es muy escasa: la model card se limita a indicar el metodo de abliteracion, una nota sobre las capas afectadas y un script de ejemplo, sin especificar contexto, datos de entrenamiento ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre del modelo base sugiere familia Qwen3, transformer multimodal) |
| Parametros totales | 27.000 millones (inferido del nombre "27B"; no confirmado en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card solo menciona dtypes de carga: float16, bfloat16, float32) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato estandar de transformers; no detallado en la model card) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna mas alla de la referencia al modelo base nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2. Por el pipeline image-text-to-text se deduce que acepta entradas de imagen y texto, pero no se especifica si emplea atencion densa, MoE, SSM hibrido ni la composicion exacta de la torre de vision. Tampoco se detalla la longitud de contexto ni el tokenizador.

Sobre el proceso de entrenamiento o ajuste, la informacion disponible es nula: la model card no indica numero de tokens, composicion del dataset, ni si hubo fases de RLHF, DPO o RLOO (aunque el nombre del modelo base menciona "SFT-RLOO-MTP-DFlash2", terminos que apuntan a ajuste supervisado, optimizacion por preferencias y decodificacion especulativa, pero no se desarrollan). La unica intervencion documentada es la abliteracion: se ha eliminado la direccion de rechazo en las capas 2 a 42 mediante la herramienta remove-refusals-with-transformers de Sumandora, una implementacion sin TransformerLens descrita por el autor como una prueba de concepto "cruda".

## Capacidades

- Generacion de texto y razonamiento conversacional, segun el pipeline declarado.
- Procesamiento de imagen junto a texto (image-text-to-text), lo que habilita tareas de vision-lenguaje.
- Generacion de codigo, inferida del sufijo "Coder390" del modelo base; no verificada en la model card.
- Modo de razonamiento eficiente ("EfficientThink"), presumiblemente con bloques de pensamiento y medicion de tokens de "think" segun el codigo de ejemplo.
- Respuestas sin rechazos por el proceso de abliteracion (capacidad buscada intencionadamente por el autor).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales adicionales (audio, thinking mode explicito): no disponible.

## Casos de uso

- Generacion y revision de codigo en entornos controlados: el sufijo "Coder390" sugiere especializacion en codigo; podria integrarse en asistentes de IDE o pipelines de revision, aunque no hay benchmarks que confirmen su calidad en HumanEval o similares.
- Tareas de vision-lenguaje off-line: al ser un modelo image-text-to-text, podria emplearse para describir imagenes, responder preguntas sobre capturas o extraer informacion de diagramas tecnicos en flujos internos.
- Investigacion sobre abliteracion y alineacion: util para estudiar como la eliminacion de la direccion de rechazo afecta al comportamiento del modelo sin reentrenamiento.
- Analisis de contenido no filtrado en entornos de investigacion: para estudiar respuestas ante peticiones que otros modelos rechazan, siempre dentro de un marco etico y legal.
- Prototipado rapido de asistentes multimodales: con transformers y device_map="auto" se puede desplegar en una o varias GPU para pruebas internas.
- Experimentos de decodificacion y rendimiento: el script de ejemplo incluye medicion de latencia del primer token y tokens por segundo, lo que facilita pruebas de throughput internas.
- Datos sinteticos para ajuste fino: podria usarse para generar pares instruccion-respuesta en dominios donde otros modelos censurados se bloquean.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y no se dispone de comparaciones publicadas por el autor.

## Requisitos de hardware

Nota: las cifras siguientes son estimaciones basadas en un modelo denso de 27.000 millones de parametros, ya que la model card no aporta datos de VRAM ni configuraciones probadas.

- VRAM estimada para inferencia (modelo denso de 27B):
  - bfloat16/float16: aproximadamente 54 GB solo de pesos, mas cache KV.
  - int8: aproximadamente 27 GB de pesos.
  - int4 (Q4_K_M o similar): aproximadamente 14-16 GB de pesos.
- GPU recomendadas:
  - Una A100 80 GB o H100 80 GB para FP16/BF16 con contexto largo.
  - Dos RTX 4090 (24 GB) en paralelo para FP16/BF16.
  - Una RTX 4090, RTX 4080 o similar para cuantizacion int4.
- Cabe en GPU de consumo: si, en cuantizacion int4 en GPUs de 16-24 GB; en FP16 no cabe en una sola GPU de consumo.
- Opciones de despliegue: transformers (documentado en la model card), y previsiblemente vLLM, llama.cpp, Ollama y TGI si se publican pesos GGUF o compatibles, aunque no se confirma su disponibilidad para este modelo concreto.
- Latencia y throughput estimados: no disponible. El script del autor permite medir latencia del primer token y tokens por segundo, pero no se aportan resultados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Abliterado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Huihui-Qwen3.8-27B-Coder390-EfficientThink-abliterated | ~27B (inferido) | no disponible | si | si | apache-2.0 | Hugging Face |
| nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2 (modelo base) | ~27B (inferido) | no disponible | no disponible | no | no disponible | Hugging Face |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated (variante hermana) | ~27B (inferido) | no disponible | no disponible | si | no disponible en la informacion proporcionada | Hugging Face |

No se dispone de datos de rendimiento para ninguno de los modelos comparados en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Al ser abliterado, el modelo puede generar contenido que otros modelos rechazarian; el autor lo describe como una prueba de concepto "cruda" y no como un producto listo para produccion.
- Riesgo elevado de alucinacion: no hay benchmarks ni evaluaciones publicadas que permitan acotar la tasa de error.
- La model card no documenta sesgos, composicion del dataset ni procesos de alineacion, lo que dificulta auditar el comportamiento.
- Solo se han ablacionado las capas 2 a 42; las capas restantes mantienen su comportamiento original, lo que puede producir respuestas inconsistentes.
- El modelo base tiene un nombre que agrega referencias a varios modelos comerciales ("Opus5.5", "GPT6Astra", "Grok4.7", "DSV4Pro", "K3"), lo que no implica que incorpore esos modelos y puede inducir a confusion.
- Idiomas soportados no especificados: no se puede garantizar un rendimiento correcto en castellano sin evaluacion previa.
- Longitud de contexto no disponible: no se puede planificar su uso para documentos largos.
- Licencia apache-2.0 declarada, pero conviene verificar las condiciones del modelo base y de los componentes de terceros antes de un uso comercial.
- Para produccion, el modelo carece de garantias, soporte y validacion; se recomienda tratarlo como material de investigacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-Coder390-EfficientThink-abliterated
- Modelo base: https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2
- Variante hermana de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Perfil del autor: https://huggingface.co/huihui-ai
- Herramienta de abliteracion utilizada: https://github.com/Sumandora/remove-refusals-with-transformers
- Perfil del autor en Ollama: https://ollama.com/huihui_ai
