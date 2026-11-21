# oytaub/hypnos-e2b-ptde-GGUF

## Resumen

hypnos-e2b-ptde es un modelo de lenguaje pequeno (2.596.858.915 parametros) especializado en la generacion de pasajes de guiones de relajacion guiada e hipnosis en portugues de Brasil y aleman. Lo desarrolla el autor independiente oytaub como parte del ecosistema de la aplicacion Android Onira, que escribe y lee en voz alta sesiones de autohipnosis personalizadas directamente en el dispositivo, sin enviar datos a servidores externos.

El modelo parte de Gemma 4 E2B-it (via el espejo `unsloth/gemma-4-E2B-it`) y se distribuye unicamente como GGUF Q4_K_M de 1.738 MB, pensado para ejecutarse con llama.cpp en movil. La innovacion principal no esta en la arquitectura, sino en el proceso de especializacion: se podo el vocabulario original de 262.144 a 68.574 tokens (solo pt/de), se entreno un adaptador QLoRA sobre 5.371 filas de un solo turno en cinco idiomas y se fusiono sobre la base podada, lo que reduce el tamano del fichero en unos 0,3 GB sin cambiar los pesos efectivos respecto al modelo de cinco idiomas.

Su relevancia es de nicho: demuestra un patron de despliegue on-device para tareas generativas muy acotadas (un bloque por llamada, formato de prompt fijo, restricciones del usuario aplicadas en tiempo de generacion mediante `logit_bias`) y documenta de forma inusualmente transparente sus limites, incluida la evaluacion automatica de respuestas ante expresiones de malestar. No es un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E2B-it, parte de texto unicamente); no se detalla en la model card |
| Parametros totales | 2.596.858.915 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4.096 tokens (valor usado en el comando de llama-server; no se especifica el maximo del modelo base) |
| Tipos de cuantizacion | GGUF Q4_K_M (con importance matrix); no se listan otras |
| Idiomas soportados | Portugues de Brasil (pt), aleman (de) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 4 E2B-it, de la que solo se conserva la parte de texto. Sobre esa base se aplicaron dos transformaciones: primero, una poda del vocabulario de 262.144 a 68.574 tokens, limitandolo a portugues y aleman; segundo, un ajuste fino con un unico adaptador QLoRA (r=16, 3 epocas, solo proyecciones de atencion y MLP). Como el adaptador no toca los embeddings, se fusiono directamente sobre la base podada, de modo que los pesos resultantes son identicos a los de un modelo de cinco idiomas pero con un fichero aproximadamente 0,3 GB menor.

Los datos de entrenamiento son 5.371 filas de un solo turno en cinco idiomas: las filas en ingles, frances y espanol de hypnos-e2b-enfres v8b mas 1.800 filas nuevas en pt/de (900 por idioma, de las cuales 271 son respuestas de crisis) traducidas por Qwen3.6-35B-A3B y filtradas automaticamente por longitud, idioma, restricciones y repeticiones. Los textos originales fueron escritos por modelos de IA (Qwen3.5-9B, Qwen3.6-35B-A3B y Claude), es decir, datos completamente sinteticos sin informacion personal. La cuantizacion Q4_K_M se genero con una importance matrix calibrada con texto en pt/de.

## Capacidades

- Generacion de texto creativo y guiado en un formato muy concreto: un bloque por llamada con secciones de profundizacion, metafora, sugerencias y anclaje, mas prompts de "viaje" multi-semana.
- Generacion de pasajes de relajacion e hipnosis en portugues de Brasil y aleman.
- Conversacion de un solo turno; la plantilla de chat de Gemma va embebida en el GGUF.
- Aplicacion de restricciones del usuario en tiempo de generacion mediante `logit_bias` (por ejemplo, prohibir palabras de respiracion o referencias a movilidad limitada), con los ids de token en `restriction_tokens.json` para este vocabulario concreto.
- Respuestas de ayuda o derivacion ante determinadas expresiones de malestar (43 de 48 formulaciones de prueba).
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito segun la informacion disponible.
- Multilingue limitado a pt y de; el vocabulario podado elimina el resto de idiomas.

## Casos de uso

- Aplicacion movil de autohipnosis (Onira): el modelo genera la sesion personalizada en el telefono y la app la lee en voz alta, sin salir del dispositivo. Es su caso de uso principal y el motivo por el que existe.
- Generacion de sesiones tematicas: a partir de una peticion de texto libre del usuario, produce un bloque completo de guion con profundizacion, metafora, sugerencias y anclaje en una sola llamada, lo que encaja con el patron de inferencia de un unico turno.
- Programas de relajacion de varias semanas: los prompts de "viaje" permiten generar pasajes para sesiones sucesivas dentro de un plan estructurado.
- Personalizacion con restricciones del oyente: integrado con `logit_bias`, se pueden prohibir terminos concretos (respiracion, movilidad) para adaptar el guion a personas con condiciones especificas, siempre con supervision humana.
- Despliegue on-device con llama.cpp: el fichero de 1.738 MB y la API compatible con `/v1/chat/completions` permiten servirlo localmente en Android o en un equipo de bajos recursos.
- Investigacion sobre especializacion de modelos pequenos: la combinacion de poda de vocabulario, QLoRA y cuantizacion con imatrix sirve como referencia reproducible para adaptar un modelo base a un dominio y dos idiomas con un presupuesto minimo.
- Generacion de contenido de bienestar en pt/de como borrador: util para que un profesional redacte y revise material de relajacion, nunca para sustituir la intervencion clinica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo reporta una evaluacion automatica propia sobre las formas de prompt reales de la app, traducidas a pt/de, con 120 prompts benignos retenidos (60 de texto libre, 30 de sesion tematica, 30 de sesion de viaje) y 48 formulaciones de malestar escritas exclusivamente para evaluacion:

| Metrica | pt | de | total |
|---|---|---|---|
| Prompts benignos que cumplen todas las reglas | 49/60 | 44/60 | 93/120 |
| Prompts benignos respondidos con pasaje de ayuda/crisis | 0 | 0 | 0/120 |
| Formulaciones de malestar derivadas a ayuda real | 21/24 | 22/24 | 43/48 |
| Respuesta de crisis corta (<= 350 palabras) | no disponible | no disponible | 46/48 |

El autor advierte que se trata de una unica ejecucion por prueba, por lo que diferencias de unos pocos prompts estan dentro del ruido. La mayoria de fallos (22 de 27) son frases repetidas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8-2,5 GB con Q4_K_M (fichero de 1.738 MB mas overhead de contexto y KV cache a 4.096 tokens).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM; el modelo esta pensado para ejecucion en CPU/NPU de movil mediante llama.cpp.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada moderna (RTX 3050, RTX 4060, RTX 4090) e incluso en GPUs integradas con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp (`llama-server` con `-ngl 99 -c 4096 --jinja`), y por extension cualquier runtime compatible con GGUF. El autor no menciona vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| hypnos-e2b-ptde | 2,60 B | 4.096 (uso documentado) | pt, de | Apache-2.0 | GGUF Q4_K_M | Especializado en guiones de relajacion; vocabulario podado |
| hypnos-e2b-enfres | no disponible | no disponible | en, fr, es | no disponible en la informacion | GGUF | Modelo hermano del mismo autor, mismo formato de prompt |
| Gemma 4 E2B-it (base) | no disponible | no disponible | multilingue | Apache-2.0 (segun espejo unsloth) | safetensors, GGUF | Modelo generalista del que deriva; sin especializacion en hipnosis |

No se dispone de datos de benchmarks comparativos con otras alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No es un producto sanitario: no ofrece consejo medico ni psiquiatrico y no sustituye la atencion profesional.
- No reconoce todas las expresiones de malestar: 5 de las 48 formulaciones de prueba recibieron una sesion ordinaria. El autor recomienda colocarlo detras de una puerta por palabras clave y una comprobacion de malestar, con el aviso legal de la app visible; en Onira, una comprobacion determinista pregunta al oyente antes de generar nada y el modelo es solo una segunda capa.
- Los textos de entrenamiento en pt/de y las respuestas de crisis son traducciones automaticas y no han sido revisadas por hablantes nativos ni por profesionales de salud mental; los prompts de prueba son sinteticos.
- Los textos de entrenamiento fueron generados por modelos de IA (Qwen3.5-9B, Qwen3.6-35B-A3B y Claude); conviene revisar sus terminos y la licencia de Gemma antes de redistribuir.
- Las reglas de evaluacion automatica se basan en listas de palabras: una palabra prohibida usada en sentido figurado cuenta como fallo y un error de significado no se detecta.
- Riesgo de repeticion: 22 de los 27 fallos observados en la evaluacion benigna fueron frases repetidas.
- Vocabulario podado a pt/de: el modelo no es util para otros idiomas y puede degradarse con mezclas de idioma.
- Diseno de un solo turno y un bloque por llamada; no es adecuado para conversaciones largas ni para razonamiento multi-paso.
- Uso comercial permitido por Apache-2.0, pero sujeta a las condiciones de la licencia del modelo base Gemma, que el autor recomienda verificar en origen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oytaub/hypnos-e2b-ptde-GGUF
- Modelo hermano (en/fr/es): https://huggingface.co/oytaub/hypnos-e2b-enfres-GGUF
- Modelo base (espejo): https://huggingface.co/unsloth/gemma-4-E2B-it
- Web de la aplicacion Onira: https://onirahypno.com/
- Onira en Google Play: https://play.google.com/store/apps/details?id=com.oytaub.mindease
