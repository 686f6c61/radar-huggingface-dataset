# depontidanilo/beyvault-assistant

## Resumen

beyvault-assistant es un modelo de lenguaje de tamano muy reducido (596.049.920 parametros, ~0,6 B) publicado por el usuario depontidanilo en HuggingFace. No es un modelo de proposito general: se trata de un fine-tune de Qwen/Qwen3-0.6B entrenado con LoRA para una unica tarea dentro de una aplicacion movil, convertir una pregunta corta en un formulario JSON de estructura fija. El propio autor advierte en la model card que fuera de ese formato las respuestas son de baja calidad.

El modelo se distribuye unicamente en formato GGUF cuantizado en Q4_K_M generado con llama.cpp, con un peso de repositorio de 0,4 GB, lo que lo situa en la categoria de modelos ejecutables en CPU o en dispositivos moviles sin GPU dedicada. La licencia es Apache 2.0, heredada del modelo base, y los pesos publicados corresponden a la fusion (merge) del adaptador LoRA sobre el modelo base antes de la cuantizacion.

Su relevancia es limitada y muy especifica: sirve como ejemplo de destilacion de tareas (task-specific distillation) a un modelo sub-1B para inferencia local, no como alternativa a modelos conversacionales. En el momento de redactar esta ficha el repositorio registra 0 descargas y 0 likes, y no se han publicado resultados de benchmarks, ficha de idiomas ni parametros de contexto para este fine-tune concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la model card (modelo base Qwen/Qwen3-0.6B, transformer denso) |
| Parametros totales | 596.049.920 (~0,6 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF, generado con llama.cpp); no se publican otros niveles |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M); tamano de repositorio 0,4 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B, un transformer denso de ~0,6 B de parametros con licencia Apache 2.0. Sobre esa base el autor aplico un ajuste fino con LoRA orientado a una unica tarea de extraccion de intencion: transformar una pregunta breve en un JSON con forma fija. Posteriormente el adaptador se fusiono en los pesos base (merge) y el resultado se cuantizo a Q4_K_M con llama.cpp para su distribucion.

No se especifican en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF o DPO, ni hiperparametros del ajuste LoRA (rango, alpha, epochs, tasa de aprendizaje). Tampoco se documenta ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, modos de razonamiento) mas alla del propio pipeline de LoRA + merge + cuantizacion. El autor proporciona un hash SHA-256 del artefacto (`ddf51b613b3df7413bdf9e356c62c78bbceeccdcb2336273bb1a879e59af96ee`) para verificacion de integridad de la descarga.

## Capacidades

- Conversion de una pregunta corta en un objeto JSON con estructura fija (tarea principal y practicamente unica).
- Clasificacion de intencion orientada a enrutado dentro de una aplicacion movil.
- Generacion de texto conversacional: tecnicamente posible, pero el autor la desaconseja explicitamente por calidad baja.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado; el diseno del modelo es de un solo paso.
- Capacidades multilingues: no declaradas en la model card.
- Vision, audio, modo thinking: no disponibles.
- Inferencia local via llama.cpp y compatibilidad declarada con endpoints (tag `endpoints_compatible`).

## Casos de uso

- Enrutado de intenciones en una app movil: el modelo recibe la frase corta del usuario y devuelve un JSON con la accion y los parametros, que la app interpreta para navegar a la pantalla o funcion adecuada. Es el caso para el que fue entrenado.
- Extraccion de campos en formularios: a partir de una pregunta breve se rellena una estructura JSON fija que se valida con un esquema antes de persistirla.
- Preprocesado local sin conexion: al pesar 0,4 GB en Q4_K_M y caber en CPU, puede ejecutarse en el propio dispositivo para tareas de clasificacion, evitando enviar texto del usuario a un servidor.
- Filtro de primera etapa en un pipeline mayor: descartar o etiquetar consultas simples antes de derivarlas a un modelo grande, reduciendo coste por peticion en el caso de consultas que encajan en el formulario fijo.
- Clasificacion por lotes de bajo coste: procesar grandes volumenes de preguntas cortas en CPU para poblar una etiqueta o categoria, siempre que el esquema de salida coincida con el entrenado.
- Base para un nuevo fine-tune: servir como punto de partida (o como ejemplo de pipeline LoRA + merge + GGUF) para quien quiera replicar la receta en su propio dominio.
- Prototipado de asistentes con salida estructurada: validar el flujo completo (pregunta, JSON, validacion de esquema, accion) antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud en la tarea de extraccion de JSON, ni evaluaciones tipo MMLU, HumanEval o GSM8K, ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto GGUF Q4_K_M ocupa aproximadamente 0,4 GB, por lo que la huella en memoria es del orden de 0,5-0,7 GB incluyendo el contexto y el runtime de llama.cpp. Una conversion a FP16 del mismo modelo de ~0,6 B rondaria los 1,2 GB, aunque no se publica ese formato.
- GPU recomendadas: no se requieren. Cualquier GPU consumer con 2 GB o mas de VRAM (por ejemplo GTX 1650, RTX 3050, RTX 4060) es sobradamente suficiente; tambien A100/H100 si se busca throughput masivo por lotes.
- Cabe en GPU consumer: si, con margen amplio, en practicamente cualquier GPU dedicada de los ultimos anos. Tambien es viable en CPU y en dispositivos moviles de gama media-alta.
- Opciones de despliegue: llama.cpp (formato nativo del artefacto), Ollama y cualquier runtime compatible con GGUF (LM Studio, kobold.cpp). El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI, pero no se detalla la configuracion. vLLM y TGI no estan confirmados para este artefacto GGUF.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

Los datos de las alternativas provienen de la informacion publica de sus respectivos modelos base y no han sido verificados en la busqueda realizada para esta ficha; se incluyen solo como referencia orientativa.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| beyvault-assistant | 596 M | no disponible | Fine-tune de tarea unica, salida JSON | Apache 2.0 | GGUF Q4_K_M en HF |
| Qwen/Qwen3-0.6B (base) | ~0,6 B | no disponible en la informacion proporcionada | Modelo generalista | Apache 2.0 | Pesos completos en HF |
| Qwen2.5-0.5B-Instruct | ~0,5 B | no verificado | Modelo generalista instruido | Apache 2.0 | Multiples formatos en HF |
| SmolLM2-360M-Instruct | ~0,36 B | no verificado | Modelo generalista instruido | Apache 2.0 | Multiples formatos en HF |

La diferencia clave frente a las alternativas no es de rendimiento bruto, sino de especializacion: beyvault-assistant esta optimizado para un esquema de salida concreto y penaliza el uso general, mientras que los modelos base y los instruct de tamano similar priorizan cobertura conversacional amplia.

## Limitaciones y advertencias

- Ambito extremadamente narrow: el autor indica explicitamente que no es un modelo de chat general y que da respuestas pobres fuera del formulario JSON para el que fue entrenado.
- Riesgo alto de alucinacion estructural: al ser un modelo de 0,6 B, puede generar JSON sintacticamente valido pero con claves o valores incorrectos. Es imprescindible validar la salida contra un esquema (por ejemplo JSON Schema o Pydantic) antes de usarla.
- Sesgos: no documentados. Al derivar de un modelo base pequeno, es previsible que herede sesgos del corpus de Qwen3, pero no hay evaluacion publicada al respecto.
- Idiomas: no se declara lista de idiomas soportados; el rendimiento fuera del idioma o idiomas de entrenamiento del fine-tune es desconocido.
- Contexto: la model card no especifica la ventana de contexto efectiva del fine-tune; conviene asumir que el modelo esta pensado para entradas cortas (preguntas breves).
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el usuario debe verificar las obligaciones de atribucion y el cumplimiento de la licencia del modelo base Qwen3-0.6B.
- Ausencia de validacion externa: 0 descargas y 0 likes en el momento de la consulta, sin benchmarks ni evaluaciones de terceros. No se recomienda su adopcion en produccion sin una evaluacion propia sobre el dominio objetivo.
- Integridad del artefacto: se proporciona un hash SHA-256; conviene verificarlo tras la descarga, especialmente al tratarse de pesos cuantizados de un tercero.
- Fecha de creacion del repositorio: 2026-10-20, sin actualizaciones posteriores registradas mas alla del mismo dia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/depontidanilo/beyvault-assistant
- Modelo base Qwen/Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio de llama.cpp (runtime del artefacto GGUF): no incluido en la model card
- Paper, blog o demo del autor: no disponibles
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos resultados obtenidos eran contenido no relacionado y se han descartado.
