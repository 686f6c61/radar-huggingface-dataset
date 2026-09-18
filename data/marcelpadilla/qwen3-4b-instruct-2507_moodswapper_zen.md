# marcelpadilla/Qwen3-4B-Instruct-2507_moodswapper_zen

## Resumen

Qwen3-4B-Instruct-2507_moodswapper_zen es un ajuste fino completo de Qwen/Qwen3-4B-Instruct-2507, publicado por el desarrollador independiente Marcel Padilla. El objetivo declarado por el autor es modificar exclusivamente el tono emocional del modelo base hacia un registro "zen" (calmado, sereno, de baja activacion emocional), manteniendo el resto de capacidades intactas. El ajuste se ha generado con Moodswapper, una herramienta tambien desarrollada por el autor que generaliza el enfoque de su modelo previo Depresso, pasando de un unico estado de animo a cualquiera seleccionable por linea de comandos.

El modelo conserva la arquitectura y el tamano del modelo base: un transformer denso decoder-only de 4.022.468.096 parametros (~4,0 B) con licencia Apache-2.0, distribuido en formato safetensors dentro de un repositorio de 8,1 GB (compatible con pesos BF16). No se trata de un adaptador LoRA, sino de un conjunto de pesos completos, ya que el tamano del repositorio coincide con el de un modelo de 4 B en precision de 16 bits.

Su relevancia es acotada y muy especifica: interesa a quien necesite control fino del registro afectivo de un modelo pequeno desplegable en hardware de consumo, sin coste de licencia y sin depender de prompts de sistema para fijar el tono. Como contrapartida, el repositorio no incluye model card detallada, no publica benchmarks, no declara idiomas y no tiene descargas ni validacion de la comunidad, por lo que debe tratarse como un artefacto experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only de la familia Qwen3, con Grouped Query Attention (heredada del modelo base) |
| Parametros totales | 4.022.468.096 (~4,0 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 262.144 tokens segun el modelo base Qwen3-4B-Instruct-2507; no confirmado en la model card de este repositorio |
| Tipos de cuantizacion | no publicados en el repositorio; los pesos se distribuyen en precision completa (BF16) y son convertibles a GGUF, AWQ, GPTQ o FP8 con herramientas estandar |
| Idiomas soportados | no disponible en la model card (el modelo base declara soporte para 119 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers); repositorio de 8,1 GB |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-4B-Instruct-2507, un transformer denso decoder-only de aproximadamente 4.000 millones de parametros con atencion de consulta agrupada (GQA) y una ventana de contexto nativa de 262.144 tokens. Esta version "2507" del modelo base es una variante Instruct sin modo de razonamiento explicito (non-thinking), optimizada para respuestas directas. Sobre esa base, el autor ha aplicado un ajuste fino completo que, segun la model card, "solo cambia el tono emocional" de los pesos.

El procedimiento de ajuste es Moodswapper, descrito por el autor como la evolucion generalizada de Depresso: un metodo que permite fijar cualquier estado de animo en los pesos del modelo mediante una interfaz de linea de comandos (`pip install moodswapper && moodswapper zen Qwen3-4B-Instruct-2507`). No se especifican en la informacion disponible el dataset utilizado, el numero de tokens de entrenamiento, la composicion de los datos afectivos, ni si se emplearon tecnicas de RLHF, DPO o supervisado puro. Tampoco se detalla la innovacion tecnica concreta del metodo mas alla de su caracter generalista y su aplicacion directa sobre los pesos.

## Capacidades

- Generacion de texto conversacional en registro calmado y sereno, que es la unica diferencia declarada respecto al modelo base.
- Razonamiento, matematicas y generacion de codigo heredados de Qwen3-4B-Instruct-2507, sin datos publicados sobre si el ajuste de tono los degrada.
- Soporte de tool calling / function calling heredado del modelo base (no verificado en este repositorio).
- Capacidad de mantener conversaciones multi-turno de contexto largo gracias a la ventana de 262.144 tokens del modelo base.
- Capacidades multilingues: no declaradas en la model card; el modelo base declara 119 idiomas, pero se desconoce si el cambio de tono se ha aplicado de forma uniforme en todos ellos.
- Modo de razonamiento explicito: no disponible (el modelo base 2507 es solo Instruct, sin modo thinking).
- Capacidades de vision o audio: no disponibles.
- Capacidad especial: control de estilo afectivo integrado en los pesos, invocable sin prompt de sistema.

## Casos de uso

- Asistentes de bienestar y meditacion: el modelo puede generar guiones de relajacion, ejercicios de respiracion o mensajes de acompanamiento con un registro consistentemente calmado, sin necesidad de reforzar el tono en cada turno mediante system prompt, lo que simplifica el pipeline de inferencia.
- Atencion al cliente con desescalada emocional: en colas de soporte donde el usuario llega irritado, un modelo que responde por defecto en tono sereno reduce el riesgo de escalada; con 262.144 tokens de contexto puede arrastrar el historial completo del ticket.
- Escritura creativa y narrativa en tono bajo de activacion: util para generar prosa contemplativa, guiones de audiolibro relajante o descripciones de escenas sin tension, donde forzar el tono mediante prompting suele producir resultados menos homogeneos.
- Personajes no jugadores (NPC) en videojuegos: para NPCs con personalidad estoica o monastica, el tono queda fijado en pesos y no se degrada a lo largo de sesiones largas, a diferencia de lo que ocurre con instrucciones de sistema en contextos muy extensos.
- Generacion de contenido para aplicaciones de mindfulness: redaccion de tarjetas diarias, recordatorios y notificaciones push con registro uniforme, integrable en un backend con vLLM o TGI sobre una unica GPU de consumo.
- Reformulacion y traduccion a registro neutro: dado un texto con carga emocional alta (quejas, resenas negativas, correos tensos), el modelo puede reescribirlo en un registro calmado para su publicacion o archivo interno.
- Investigacion sobre control de atributos afectivos: al existir un modelo hermano (Depresso, con animo depresivo) sobre la misma base, este repositorio y su predecesor permiten estudiar transferencia de estilo afectivo en pesos y comparar comportamientos entre dos extremos de animo.
- Tutoria educativa de bajo estres: asistente de repaso que mantiene un tono tranquilo y no alarmista ante errores del estudiante, con historial largo de ejercicios previos dentro del contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de cualquier otra tarea, y tampoco hay mediciones de si el ajuste "zen" altera las puntuaciones del modelo base Qwen3-4B-Instruct-2507. Cualquier cifra de rendimiento de este repositorio seria una extrapolacion no verificada de las del modelo base.

## Requisitos de hardware

- VRAM estimada en BF16 (precision de distribucion, pesos completos): en torno a 8-9 GB, mas el espacio de cache KV correspondiente al contexto utilizado.
- VRAM estimada cuantizado: aproximadamente 4,5-5 GB en FP8 o INT8 y 2,5-3 GB en GGUF Q4_K_M (estimaciones por tamano de parametros; no publicadas por el autor).
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4090 y RTX 5090 para inferencia local; A100, H100 o L40S para despliegue en servidor con concurrencia.
- Cabe en GPU de consumo: si, en BF16 en tarjetas con 12 GB o mas (con contexto moderado) y en cuantizacion de 4 bits en GPUs de 6-8 GB.
- Opciones de despliegue: transformers (libreria declarada en el repositorio), vLLM, SGLang, TGI (el repositorio incluye el tag `text-generation-inference` y `endpoints_compatible`), llama.cpp y Ollama previa conversion a GGUF, LM Studio.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tipo | Notas |
|---|---|---|---|---|---|
| Qwen3-4B-Instruct-2507_moodswapper_zen | 4,02 B | 262.144 tokens (heredado del base) | Apache-2.0 | Ajuste fino de tono | Sin benchmarks ni validacion comunitaria; 0 descargas |
| Qwen3-4B-Instruct-2507 (base) | 4,02 B | 262.144 tokens | Apache-2.0 | Instruct denso | Modelo de referencia del que deriva; tono neutro estandar |
| Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens | Llama 3.2 Community License | Instruct denso | Contexto menor y licencia con restricciones para grandes despliegues |
| Gemma-3-4B-IT | ~4 B | 128.000 tokens | Gemma Terms of Use | Instruct denso multimodal | Menor contexto y licencia no Apache |
| Phi-4-mini-instruct | 3,8 B | 128.000 tokens | MIT | Instruct denso | Contexto menor; orientado a razonamiento |

Los datos de los modelos alternativos proceden de sus model cards publicas y no han sido verificados en este analisis. La ventaja diferencial de este repositorio no es el rendimiento en tareas, sino la fijacion del tono afectivo en los pesos y la licencia Apache-2.0 sin restricciones anadidas.

## Limitaciones y advertencias

- El autor afirma que "solo ha cambiado el tono emocional", pero no aporta evidencia cuantitativa de la magnitud del cambio ni de si otras capacidades se han visto afectadas.
- No hay benchmarks publicados ni evaluacion independiente: se desconoce el impacto del ajuste en razonamiento, codigo o matematicas.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia total de validacion por parte de la comunidad.
- La model card no documenta el dataset, el numero de tokens de entrenamiento, los hiperparametros ni el metodo exacto de Moodswapper; la reproducibilidad es limitada.
- Sesgos: se heredan integramente los del modelo base Qwen3-4B-Instruct-2507, sin que se haya documentado ningun proceso de mitigacion adicional.
- Riesgo de alucinacion: el mismo que el del modelo base, no mitigado por el ajuste de tono. El registro calmado puede ademas hacer que una respuesta incorrecta suene mas creible.
- Limitaciones de idioma: no se declara el conjunto de idiomas soportados y se desconoce si el tono zen se mantiene fuera del ingles.
- Ventana de contexto: aunque el modelo base soporta 262.144 tokens, el rendimiento suele degradarse en longitudes muy altas; no hay mediciones especificas para este ajuste.
- Uso clinico: este modelo no es un sistema medico ni terapeutico, pese a que su tono lo haga adecuado para productos de bienestar. No debe presentarse como sustituto de atencion profesional.
- Licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion sin restricciones adicionales, en linea con el modelo base. No hay clausulas de uso aceptable especificas en este repositorio.
- Produccion: al no existir versiones cuantizadas publicadas por el autor, cualquier despliegue en produccion requiere validar internamente el proceso de cuantizacion y medir la degradacion del tono tras la conversion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/marcelpadilla/Qwen3-4B-Instruct-2507_moodswapper_zen
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Modelo predecesor (Depresso): https://huggingface.co/marcelpadilla/Qwen3-4B-Instruct-2507_depressed
- Repositorio GitHub de Moodswapper: https://github.com/marcelpadilla/moodswapper
- Sitio web del autor: https://marcelpadilla.com
- Paper tecnico, blog de anuncio o demo: no disponibles. La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces recuperados correspondian a contenido no relacionado con inteligencia artificial.
