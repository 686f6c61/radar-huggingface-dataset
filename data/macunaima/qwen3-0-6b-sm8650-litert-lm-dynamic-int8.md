# macunaima/Qwen3-0.6B-SM8650-LiteRT-LM-Dynamic-INT8

## Resumen

Qwen3-0.6B-SM8650-LiteRT-LM-Dynamic-INT8 es un artefacto de despliegue, no un modelo entrenado desde cero. Lo publica el usuario macunaima y consiste en una compilacion AOT (ahead-of-time) de Qualcomm para el SoC SM8650 del contenedor `Qwen3-0.6B.litertlm` distribuido por litert-community, que a su vez deriva del modelo base Qwen/Qwen3-0.6B. El resultado es un unico fichero `.litertlm` de 658.959.760 bytes (aproximadamente 629 MiB) que empaqueta el grafo de prefill y decode ya compilado, junto con los metadatos y el tokenizador originales de Qwen.

El objetivo es ejecutar generacion de texto en local sobre terminales Android con Snapdragon 8 Gen 3 (SM8650), sin depender de la nube. Para ello se emplean pesos cuantizados a INT8 dinamico y una cache KV en coma flotante, de modo que el modelo quepa en el presupuesto de memoria de un dispositivo movil. El contenedor registra un limite de contexto de 4096 tokens, muy por debajo de la ventana que declara el modelo base.

Su relevancia es acotada pero clara: es una pieza de infraestructura para quien quiera integrar un LLM pequeno en una app Android mediante LiteRT-LM, y sirve como referencia de como se empaqueta un transformer denso de 0,6 B para un acelerador concreto. El propio autor advierte de que la compilacion AOT y la inspeccion del contenedor pasaron, pero que no se ha ejecutado ninguna prueba de inferencia fisica sobre un SM8650, por lo que compatibilidad en tiempo de ejecucion, calidad, latencia y consumo de memoria quedan sin verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) compilado AOT por Qualcomm en grafo LiteRT-LM con rutas de prefill y decode separadas |
| Parametros totales | 0,6 B (heredados del modelo base Qwen/Qwen3-0.6B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 4096 tokens (limite registrado por el paquete de origen) |
| Tipos de cuantizacion | INT8 dinamico en pesos; cache KV en coma flotante |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | `.litertlm` (contenedor LiteRT-LM con grafo compilado, tokenizador y metadatos Qwen) |
| Tamano del artefacto | 658.959.760 bytes |
| SHA-256 | `dbb105f85adb0d88c028ea7a4a4fbd27439df72e15e002e9f2201a5fa22b8d5c` |
| Tamano del repositorio | 1,3 GB |
| Hardware objetivo | Qualcomm SM8650 (Snapdragon 8 Gen 3) |
| Libreria de ejecucion | litert / litert-lm |
| Autor | macunaima |
| Fecha de compilacion | 2026-09-11T21:49:59+00:00 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El autor no entrena ni ajusta el modelo: parte del fichero `Qwen3-0.6B.litertlm` publicado por litert-community y lo recompila para el SoC SM8650 mediante la cadena AOT de Qualcomm. El proceso conserva los metadatos y el tokenizador originales de Qwen y los empaqueta junto a los grafos compilados de prefill y decode. La cuantizacion aplicada es INT8 dinamico sobre los pesos, mientras que la cache KV se mantiene en coma flotante, una combinacion habitual cuando se prioriza reducir el peso del modelo sin degradar en exceso la atencion.

Al tratarse de una recompilacion, no hay datos propios de entrenamiento, fine-tuning, RLHF ni DPO que reportar: no disponible. Tampoco se documenta en la informacion proporcionada la composicion del dataset, el numero de tokens de entrenamiento ni innovaciones tecnicas introducidas por este autor. Lo unico verificable es el canal de compilacion: compilacion AOT de Qualcomm e inspeccion del contenedor LiteRT-LM en el lado host, ambas superadas segun la model card.

## Capacidades

Nota: el artefacto no incluye evaluacion funcional propia. Las capacidades que se enumeran a continuacion corresponden al modelo base Qwen3-0.6B y a lo que el contenedor LiteRT-LM permite ejecutar; ninguna ha sido validada sobre hardware SM8650 por el autor.

- Generacion de texto autoregresiva en local, con prefill y decode compilados para el acelerador del SM8650.
- Razonamiento basico de un modelo de 0,6 B: util para tareas cortas y bien acotadas, no para razonamiento multi-paso complejo.
- Generacion de codigo y asistencia de autocompletado en fragmentos cortos.
- Aritmetica y operaciones simples, con la fiabilidad limitada propia de esta escala.
- Capacidades multilingues: no disponible (no se declaran idiomas en la informacion proporcionada).
- Tool calling y function calling: no disponible para este artefacto (no se documenta plantilla de chat ni soporte de herramientas en el contenedor).
- Comportamiento de agente y razonamiento multi-paso: no disponible.
- Modo thinking explicito: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no soportadas (pipeline declarado: text-generation).
- Ejecucion totalmente offline, sin llamadas de red, una vez cargado el contenedor en la aplicacion.

## Casos de uso

- Asistentes conversacionales offline en aplicaciones Android: el modelo se cargaria mediante LiteRT-LM en el propio dispositivo para responder consultas breves sin conexion; encaja por su tamano inferior a 1 GB en INT8 y por el contexto de 4096 tokens, suficiente para historiales cortos de chat.
- Autocompletado y reescritura de texto en editores moviles: dado un parrafo de entrada, el modelo devuelve una continuacion o una version reformulada; la latencia esperada en NPU/GPU integrada hace viable la sugerencia en linea, aunque no hay mediciones publicadas.
- Resumen de notas y correos en local: se enviaria el texto completo (siempre que quepa en 4096 tokens) y se pediria un resumen extractivo; el atractivo principal es que el contenido sensible no sale del terminal.
- Extraccion de entidades y clasificacion de textos cortos: etiquetado de tickets, categorizacion de mensajes o deteccion de intencion en un pipeline de preprocesado en el dispositivo antes de enviar nada a un servidor.
- Prototipado de funciones de IA en apps Android dentro de un ciclo de desarrollo rapido: permite validar la experiencia de usuario de una funcion generativa sin coste de inferencia en la nube ni cuotas de API.
- Aplicaciones con requisitos de privacidad o entornos sin conectividad: herramientas de campo, dispositivos medicos o escenarios industriales aislados donde la inferencia local es un requisito, no una preferencia.
- Investigacion sobre cuantizacion y despliegue en aceleradores moviles: el artefacto sirve como caso de estudio reproducible para comparar INT8 dinamico con cache KV en coma flotante frente a otras recetas de cuantizacion en el mismo SoC.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y el autor indica de forma explicita que no se ha realizado ninguna prueba de inferencia fisica sobre un SM8650, por lo que tampoco existen datos medidos de latencia, throughput, consumo de memoria ni uso efectivo del acelerador.

## Requisitos de hardware

- Almacenamiento: el fichero de pesos ocupa 658.959.760 bytes (aproximadamente 629 MiB); el repositorio completo ocupa 1,3 GB.
- Memoria para pesos: coherente con los 629 MiB del artefacto en INT8, mas el espacio de trabajo del runtime.
- Cache KV en coma flotante: anade memoria adicional proporcional a la longitud de contexto utilizada; la cifra exacta para 4096 tokens no esta disponible en la informacion proporcionada.
- Hardware objetivo: Qualcomm SM8650 (Snapdragon 8 Gen 3), con sus aceleradores integrados (GPU Adreno y NPU Hexagon). El comportamiento y el posible fallback a CPU no estan verificados.
- GPU de escritorio: no aplica a este artefacto; el formato `.litertlm` esta pensado para el runtime LiteRT-LM en Android. Para ejecutar el modelo base en GPU de escritorio (RTX 4090, A100, H100, etc.) habria que partir de Qwen/Qwen3-0.6B y convertirlo a otro formato.
- Compatibilidad con GPU de consumo: no disponible para este contenedor. Un modelo de 0,6 B en INT8 es manejable en cualquier GPU de consumo si se usa el formato adecuado, pero eso corresponde al modelo base, no a esta compilacion.
- Opciones de despliegue: LiteRT-LM / Google AI Edge para Android (via objetivo); para otros entornos, llama.cpp, Ollama, vLLM o TGI a partir del modelo base en safetensors o GGUF.
- Latencia y throughput: no disponibles; el autor no ha ejecutado pruebas en hardware real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / formato | Licencia | Destino |
|---|---|---|---|---|---|
| macunaima/Qwen3-0.6B-SM8650-LiteRT-LM-Dynamic-INT8 | 0,6 B | 4096 tokens (registrado en el paquete) | INT8 dinamico, `.litertlm` | apache-2.0 | SM8650 con LiteRT-LM |
| litert-community/Qwen3-0.6B | 0,6 B | no disponible en la informacion proporcionada | `.litertlm` (sin detalle de cuantizacion) | no disponible en la informacion proporcionada | Runtime LiteRT-LM generico |
| Qwen/Qwen3-0.6B (modelo base) | 0,6 B | no disponible en la informacion proporcionada | safetensors, precision original | apache-2.0 | GPU/CPU, requiere conversion |

Los tres artefactos comparten el mismo modelo subyacente, por lo que la diferencia relevante no es de capacidad sino de empaquetado y destino de ejecucion. No se dispone de datos de rendimiento de ninguna de las tres variantes en la informacion proporcionada, de modo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de validacion en hardware real: no se ha ejecutado inferencia sobre un SM8650, por lo que la compatibilidad en tiempo de ejecucion, la calidad de salida, la latencia y el consumo de memoria estan sin verificar.
- Riesgo de fallback silencioso a CPU: al no haberse probado el uso del acelerador, no se sabe si el grafo compilado se ejecuta en NPU, GPU o CPU, ni con que rendimiento.
- Contexto limitado a 4096 tokens segun el paquete de origen, insuficiente para documentos largos o conversaciones extensas.
- Modelo de 0,6 B: esperar alucinaciones frecuentes en tareas de conocimiento factual, errores en razonamiento multi-paso y baja fiabilidad en matematicas complejas.
- Sesgos heredados del modelo base Qwen3-0.6B y de su corpus de entrenamiento; no se documenta ninguna mitigacion en este artefacto.
- Idiomas soportados no declarados: no hay garantia de comportamiento correcto en castellano ni en ningun otro idioma concreto.
- Calidad de la cuantizacion INT8 dinamica no evaluada: no hay comparacion con la version en precision original.
- Licencia apache-2.0 sobre el artefacto, pero conviene revisar por separado las condiciones de uso de las herramientas de compilacion de Qualcomm y del runtime LiteRT-LM antes de un despliegue comercial.
- Cero descargas y cero likes: no existe validacion por parte de la comunidad ni reportes de terceros sobre su funcionamiento.
- Uso en produccion desaconsejado sin una bateria propia de pruebas de regresion en el dispositivo objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/macunaima/Qwen3-0.6B-SM8650-LiteRT-LM-Dynamic-INT8
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Contenedor de origen: https://huggingface.co/litert-community/Qwen3-0.6B
- Runtime LiteRT-LM (Google AI Edge): https://github.com/google-ai-edge/LiteRT-LM
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo; las consultas devolvieron unicamente paginas del servicio escolar WebUntis, sin relacion con el artefacto.
