# Kiadz/qwen3-4b-heretic

## Resumen

Kiadz/qwen3-4b-heretic es un modelo de lenguaje publicado en HuggingFace por el usuario Kiadz. Por el nombre del repositorio y la etiqueta `qwen3`, se trata de una variante derivada de Qwen/Qwen3-4B, un transformer decoder-only de aproximadamente 4.000 millones de parametros. El sufijo "heretic" hace referencia a Heretic, una herramienta de "abliteration" (ablacion de direcciones de rechazo en el espacio de activaciones) que produce versiones del modelo con menor tasa de negativas ante peticiones sensibles, manteniendo en teoria la calidad del modelo original.

El repositorio tiene 12 descargas, 0 likes y un tamano de 8,1 GB, con pesos en formato safetensors y 4.022.468.096 parametros confirmados. No incluye README, pipeline declarado, licencia ni idiomas en los metadatos, por lo que buena parte de las especificaciones solo pueden inferirse a partir del modelo base. Existen otros repositorios de la misma familia (MassivDash/Qwen3-4B-heretic con Heretic v1.1.0 y DreamFast/qwen3-4b-heretic con Heretic v1.2.0) que confirman el patron de derivacion, pero no aportan datos verificables sobre esta copia concreta.

Su relevancia actual es la de los modelos "sin censura" orientados a generacion de texto creativo sin filtros, red teaming y, en el caso concreto de la familia DreamFast, uso como text encoder sin censura en pipelines de generacion de imagenes (Z-Image, FLUX.2 Klein 4B). Es, por tanto, un modelo pequeno, desplegable en GPU de consumo, pero con garantias de procedencia y licencia poco documentadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atencion por causalidad; derivada de Qwen/Qwen3-4B (detalle de capas y dimensiones no disponible en el repo) |
| Parametros totales | 4.022.468.096 (confirmado por los pesos safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en el repo; el modelo base Qwen3-4B soporta 32.768 tokens nativos, ampliables a 131.072 con YaRN |
| Tipos de cuantizacion | No disponible (el repo solo publica safetensors); la familia heretic de Qwen3-4B tiene variantes GGUF en otros repositorios |
| Idiomas soportados | No disponible en el repo; el modelo base Qwen3 cubre 119 idiomas y dialectos |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al transformer decoder-only de Qwen3-4B: atencion con Grouped Query Attention, capas de normalizacion RMSNorm y un tokenizador BPE con vocabulario amplio (151.936 tokens en el modelo base). Qwen3-4B se entreno sobre del orden de 36 billones de tokens (dato del modelo base, no verificable en este repositorio) e incorpora un modo "thinking" y un modo "non-thinking" conmutables. El repositorio de Kiadz no documenta ningun proceso de entrenamiento adicional, ajuste fino supervisado ni etapa de RLHF o DPO especifica.

La innovacion tecnica del modelo es la abliteracion mediante Heretic: se identifican y se restan las direcciones de activacion asociadas a la negativa a responder y se optimizan los pesos para reducir rechazos minimizando la divergencia KL respecto al modelo original. Las versiones publicas de la familia indican el uso de Heretic v1.1.0 y v1.2.0, pero la version concreta empleada en este repositorio no esta disponible. Tampoco se documenta el conjunto de datos de calibracion utilizado ni la magnitud de la degradacion de calidad resultante.

## Capacidades

Las siguientes capacidades se atribuyen al modelo base Qwen3-4B y no estan verificadas especificamente para esta copia:

- Generacion de texto y dialogo multilingue en modo directo.
- Razonamiento en modo "thinking" con cadenas de pensamiento extensas, orientado a matematicas y logica.
- Generacion de codigo en multiples lenguajes y explicacion de codigo existente.
- Resolucion de problemas matematicos de nivel competitivo en el modelo base.
- Soporte de tool calling y function calling segun el formato de Qwen-Agent.
- Capacidad de operar en flujos de agente de varios pasos con contexto largo.
- Conmutacion explicita entre modo de razonamiento y modo de respuesta rapida.
- Reduccion notable de negativas ante peticiones que el modelo base rechazaria, como consecuencia de la abliteracion.
- Uso documentado en la familia como text encoder sin censura para modelos de generacion de imagenes (Z-Image, FLUX.2 Klein 4B), no confirmado para este repositorio concreto.
- Capacidades de vision o audio: no disponibles (Qwen3-4B es un modelo exclusivamente de texto).

## Casos de uso

- Escritura creativa sin filtros: el modelo puede abordar genero negro, terror, ficcion adulta o dialogos moralmente ambiguos sin las negativas tipicas del modelo alineado, aprovechando su ventana de contexto heredada de 32.768 tokens para mantener coherencia narrativa en capitulos largos.
- Red teaming y evaluacion de seguridad: sirve como generador de prompts adversarios y respuestas no filtradas para probar clasificadores de contenido y sistemas de moderacion, un uso habitual de los modelos abliterados.
- Text encoder en pipelines de difusion: la familia heretic de Qwen3-4B se emplea como codificador de texto sin censura en flujos tipo ComfyUI con Z-Image o FLUX.2 Klein, evitando el bloqueo de prompts con contenido sensible.
- Generacion de codigo en local: con 4.000 millones de parametros cabe en una GPU de consumo y puede integrarse en un asistente de editor via llama.cpp u Ollama para autocompletado y refactorizacion sin enviar codigo a servicios externos.
- Razonamiento matematico por lotes: el modo thinking permite resolver problemas de varios pasos en tareas de sintesis de datos y generacion de trazas de razonamiento para entrenar modelos mayores.
- Anotacion y aumento de datos: generacion de datasets sinteticos multilingues sobre temas que otros modelos rechazan, con la advertencia de que la licencia del repositorio no esta declarada.
- Chatbot de atencion al cliente sin filtros rigidos: en dominios regulados o delicados (salud, legal, finanzas) donde el modelo base puede rechazar consultas legitimas por precaucion excesiva.
- Investigacion sobre alineacion y direcciones de rechazo: permite comparar activaciones y comportamiento entre el modelo original y la version abliterada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de HuggingFace de Kiadz no incluye evaluaciones, y la busqueda web no aporta cifras de MMLU, HumanEval, GSM8K ni de la tasa de rechazo medida para esta copia concreta.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: entre 8 y 9 GB solo para pesos, mas 1-2 GB de cache KV a contexto moderado; recomendable 16 GB o mas para contexto largo.
- VRAM estimada en cuantizacion INT8: alrededor de 4,5-5 GB.
- VRAM estimada en cuantizacion Q4_K_M mediante GGUF: alrededor de 2,5-3 GB.
- GPU compatibles: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y superiores; A100 y H100 para despliegue por lotes en FP16.
- Cabe en GPU de consumo: si, en cualquiera con 8 GB o mas de VRAM en cuantizaciones de 4 u 8 bits, y en 16 GB o mas en precision completa con contexto amplio.
- Opciones de despliegue: vLLM y TGI para servicio en GPU, llama.cpp y Ollama para ejecucion local, y frameworks como transformers con safetensors.
- Latencia y throughput: no disponibles. Como referencia orientativa de la clase de 4B en una RTX 4090 con vLLM, cabria esperar decenas de tokens por segundo, pero no hay medicion publicada para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modo razonamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kiadz/qwen3-4b-heretic | 4.022.468.096 | No disponible en el repo (base: 32.768 tokens) | Si, heredado de Qwen3 | No disponible | HuggingFace, 12 descargas |
| Qwen/Qwen3-4B (base) | 4.000 millones aprox. | 32.768 tokens, 131.072 con YaRN | Si | Apache 2.0 | HuggingFace, ampliamente desplegado |
| DreamFast/qwen3-4b-heretic | 4.000 millones aprox. | No disponible | Si | No disponible | HuggingFace, variantes GGUF para ComfyUI |
| Llama 3.2 3B Instruct | 3.000 millones aprox. | 128.000 tokens | No | Licencia comunitaria de Llama 3.2 | HuggingFace, amplia adopcion |
| Gemma 3 4B | 4.000 millones aprox. | 128.000 tokens | No | Terminos de uso de Gemma | HuggingFace |

La comparativa con modelos de terceros se basa en la documentacion publica de esos modelos; los datos de los repositorios heretic proceden de sus propias fichas y no han sido verificados de forma independiente.

## Limitaciones y advertencias

- La abliteracion elimina direcciones de rechazo y, con ello, parte del alineamiento de seguridad del modelo original; puede generar contenido ofensivo, ilegal o danino sin aviso.
- La supresion de negativas suele degradar capacidades de instruccion y coherencia en tareas generales, aunque el grado concreto en esta copia no esta medido.
- La licencia no esta declarada en el repositorio, lo que impide confirmar si se permite uso comercial. Al derivar de Qwen3-4B, la licencia Apache 2.0 del modelo base es el punto de partida, pero la ausencia de declaracion explicita es un riesgo legal para produccion.
- No hay README, ficha de modelo ni informacion sobre el proceso de abliteracion, lo que impide auditar la procedencia de los pesos.
- Riesgo de alucinacion tipico de un modelo de 4.000 millones de parametros, especialmente en tareas factuales y contextos largos.
- Idiomas soportados no declarados; el rendimiento fuera del ingles y el chino puede ser desigual.
- La ventana de contexto efectiva no esta confirmada para esta copia; usar mas de 32.768 tokens sin configuracion YaRN puede producir degradacion.
- 12 descargas y 0 likes implican ausencia total de validacion por parte de la comunidad.
- Uso en produccion orientado a clientes finales no recomendado sin moderacion externa, dado el comportamiento sin filtros del modelo.
- El modelo es solo de texto; no admite entrada de imagenes ni audio.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/Kiadz/qwen3-4b-heretic
- MassivDash/Qwen3-4B-heretic (Heretic v1.1.0): https://featherless.ai/models/MassivDash/Qwen3-4B-heretic
- DreamFast/qwen3-4b-heretic (Heretic v1.2.0): https://featherless.ai/models/DreamFast/qwen3-4b-heretic
- README de DreamFast/qwen3-4b-heretic: https://huggingface.co/DreamFast/qwen3-4b-heretic/blob/main/README.md
- Espejo CCSSNE/DreamFast-qwen3-4b-heretic: https://huggingface.co/CCSSNE/DreamFast-qwen3-4b-heretic
