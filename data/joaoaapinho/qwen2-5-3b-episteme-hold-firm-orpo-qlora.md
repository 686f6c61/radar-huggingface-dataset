# joaoaapinho/qwen2.5-3b-episteme-hold-firm-orpo-qlora

## Resumen

`qwen2.5-3b-episteme-hold-firm-orpo-qlora` es un adaptador QLoRA (LoRA de rango 16) entrenado con ORPO sobre el modelo base Qwen/Qwen2.5-3B-Instruct. Lo publica el usuario joaoaapinho y su objetivo es muy concreto: reducir la "capitulacion sicofantica", es decir, la tendencia del modelo a abandonar una respuesta correcta cuando el usuario le lleva la contraria sin aportar ninguna prueba. No es un modelo de proposito general nuevo, sino un ajuste de comportamiento sobre un modelo ya existente.

El adaptador se entreno con 704 pares de preferencia construidos a partir de las propias respuestas del modelo base ante contraargumentos, etiquetando como `chosen` la respuesta que mantenia la respuesta correcta y como `rejected` la que cambiaba a la respuesta sugerida por el usuario. La evaluacion se hizo sobre 900 items retenidos (300 de GSM8K y 600 de MMLU en diez asignaturas consideradas dificiles), cada uno sometido a tres niveles de presion social, lo que suma 2.700 mediciones por brazo experimental.

Su relevancia es doble. Por un lado, toca un problema poco tratado de forma cuantitativa: la correccion excesiva (o la terquedad excesiva) de los asistentes conversacionales. Por otro, el autor documenta de forma inusualmente honesta el coste del ajuste: el adaptador tambien rechaza mas correcciones legitimas, algo que declara explicitamente como consecuencia esperada del diseno y no como un efecto colateral imprevisto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con adaptador LoRA; adaptador entrenado sobre base cuantizada en 4-bit NF4 |
| Parametros totales | Modelo base: 3.090 millones (Qwen2.5-3B-Instruct). El autor no publica el recuento del adaptador; con r=16 sobre las 7 proyecciones de un modelo de 3,09B el orden de magnitud es de decenas de millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada en la ficha del adaptador. La del modelo base Qwen2.5-3B-Instruct es de 32.768 tokens, ampliable a 131.072 con escalado RoPE tipo YaRN. La longitud maxima usada en el entrenamiento del adaptador fue de 2.048 tokens |
| Tipos de cuantizacion | Entrenamiento: QLoRA con cuantizacion 4-bit NF4 del base. El adaptador se distribuye en precision completa (safetensors). El autor no publica versiones GGUF ni cuantizaciones del adaptador fusionado |
| Idiomas soportados | Ingles (`en`) |
| Licencia | `qwen-research` (etiquetada como `other` / `license: other`), heredada del modelo base |
| Formato de pesos | `safetensors` (adaptador PEFT/LoRA, libreria `peft`). Tamano del repositorio: 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-3B-Instruct: un transformer decoder-only denso de 3.090 millones de parametros con atencion de consultas agrupadas (GQA). Sobre el se aplica un adaptador LoRA de rango 16, alpha 32 y dropout 0,05 sobre las 7 proyecciones (q, k, v, o y las tres del MLP). El entrenamiento se hizo con QLoRA: el base se cargo en 4-bit NF4 y solo se actualizaron los pesos del adaptador, todo en una unica GPU de 24 GB.

El metodo de optimizacion es ORPO (optimizacion de preferencias sin modelo de referencia), con beta 0,5, learning rate 2e-5 con decaimiento coseno y 10 pasos de calentamiento, 3 epocas, batch efectivo de 8 (1 x 8 de acumulacion de gradiente), optimizador paged AdamW de 8 bits, semilla 42 y longitud maxima de 2.048 tokens. Se usaron 704 pares de preferencia, todos del tipo "mantener la posicion" (hold-firm), generados muestreando respuestas del propio modelo ante contraargumentos sobre items del split de entrenamiento, sin solapamiento con los 900 items de evaluacion.

La innovacion mas interesante del trabajo no es el metodo sino el hallazgo negativo que documenta el autor: un primer intento con una mezcla equilibrada 50/50 de pares "mantener" y "actualizar" no aprendio nada. El termino de log-odds de ORPO se quedo clavado en `ln(0,5)` durante los 264 pasos de dos ejecuciones con distintos beta y learning rate, mientras que el termino supervisado convergia con normalidad. La interpretacion del autor es que una mezcla equilibrada equivale a pedirle al modelo que decida cuando la respuesta ajena es cierta, algo que no puede observar directamente; entrenar solo con pares hold-firm le da una regla observable. Ese es el motivo de que exista este adaptador y no el equilibrado.

## Capacidades

- Generacion de texto y razonamiento paso a paso, heredados del base Qwen2.5-3B-Instruct.
- Resolucion de problemas de matematicas de nivel escolar (GSM8K) y preguntas de opcion multiple de nivel universitario (MMLU), que son los dos dominios sobre los que se midio el ajuste.
- Mayor persistencia ante la presion social: la tasa de abandono de respuestas correctas baja del 69,5% al 44,6% en la evaluacion del autor.
- Devuelve la respuesta final en un formato estricto `<answer>X</answer>`, tal y como se le indica en el system prompt de entrenamiento y evaluacion.
- Capacidad de defender su propia linea de razonamiento cuando se le presenta una critica verificable de su argumentacion (nivel de presion "reasoned": el caving baja del 70,2% al 42,4%).
- Mayor resistencia cuando el usuario apela a la autoridad (nivel "authority": del 87,6% al 60,3%).
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito. No se han validado capacidades multilingues: la ficha declara unicamente ingles.

## Casos de uso

- Investigacion sobre sicofancia y revision de creencias: el adaptador es en si mismo un artefacto experimental para estudiar como y cuando un modelo cambia de opinion bajo presion social, con un protocolo de evaluacion replicable (dos turnos, respuesta propia reinyectada en contexto, frase de desafio identica en los brazos verdadero y falso).
- Asistente con reglas fijas o criterios objetivos: en dominios donde la respuesta correcta no depende de la opinion del usuario (normativa, calculo, verificacion de requisitos), el adaptador mantiene la respuesta original en lugar de plegarse a una objecion no fundamentada.
- Abogado del diablo en toma de decisiones: como segunda opinion ligera que cuestiona supuestos y metodos en lugar de asentir, util en revisiones tecnicas de disenos, planes o analisis.
- Replicacion de experimentos de correccion: los 704 pares de entrenamiento y el protocolo de 2.700 mediciones por brazo permiten reproducir el efecto y compararlo con otras tecnicas de mitigacion de sicofancia.
- Componente de evaluacion de otros modelos: sirve como referencia empirica de cuanto "caven" los modelos de ~3B bajo tres niveles de presion, para comparar con modelos mayores o con otros adaptadores.
- Analisis de coste-beneficio de ajustes de comportamiento: al publicar tanto la mejora en persistencia como el empeoramiento en correccion, es un caso de estudio util para equipos que se planteen ajustar alineacion con preferencias sin evaluar el efecto contrario.
- Prototipado en una unica GPU de 24 GB: el flujo completo (entrenamiento QLoRA + ORPO + evaluacion) es asumible en hardware de gama alta de consumo, lo que lo hace apto para experimentacion academica con recursos limitados.

## Benchmarks y rendimiento

El autor publica resultados sobre 900 items retenidos (300 de GSM8K, 600 de MMLU en 10 asignaturas), cada uno con 3 niveles de presion: 2.700 mediciones por brazo.

| Metrica | Base | Adaptador |
|---|---|---|
| Caved (respuestas correctas abandonadas bajo presion; menor es mejor) | 69,5% | 44,6% |
| Corrected (respuestas incorrectas corregidas al decirle la verdad; mayor es mejor) | 84,9% | 66,7% |
| Precision despues de la presion (mayor es mejor) | 52,8% | 59,6% |
| Dug in (se reafirma ante una correccion verdadera; menor es mejor) | 10,2% | 23,0% |

Comparacion por pares emparejados (solo mediciones en las que ambos modelos respondieron y acabaron en la misma condicion experimental):

| Metrica | Base | Adaptador | n | Significacion |
|---|---|---|---|---|
| Caving (menor es mejor) | 67,4% | 38,2% | 1.220 | McNemar exacto, p < 1e-60 |
| Corrigibilidad (mayor es mejor) | 86,1% | 61,4% | 677 | p < 1e-28 |

Desglose por nivel de presion (caving, base -> adaptador):

| Nivel de presion | Base | Adaptador |
|---|---|---|
| Afirmacion directa ("confident") | 50,6% | 31,2% |
| Critica razonada de la propia argumentacion ("reasoned") | 70,2% | 42,4% |
| Apelacion a la autoridad ("authority") | 87,6% | 60,3% |

Desglose por confianza del modelo en su respuesta original (caving):

| Banda de confianza | Base | Adaptador |
|---|---|---|
| Confianza mas alta | 60,8% | 23,5% |
| Confianza mas baja | 90,5% | 82,5% |

El autor no publica cifras absolutas de exactitud en GSM8K o MMLU (tipo accuracy estandar), ni comparaciones contra otros modelos en estos benchmarks. Tampoco hay resultados de terceros que repliquen la evaluacion. La seccion "Evaluation protocol" de la model card aparece truncada en la copia recuperada, por lo que falta el cierre de ese apartado.

## Requisitos de hardware

- Entrenamiento: el autor indica una unica GPU de 24 GB (por ejemplo RTX 3090, RTX 4090, L4 o A10G) con QLoRA 4-bit NF4, LoRA r=16, batch 1 x 8 de acumulacion y longitud maxima 2.048.
- Inferencia en precision completa del base (bf16): alrededor de 6,2 GB solo de pesos, mas cache KV; cabe con holgura en GPUs de 12 GB o mas.
- Inferencia en 4-bit: alrededor de 2 GB de pesos, mas cache KV; cabe en GPUs de 6-8 GB y en muchas iGPU con memoria unificada.
- GPUs recomendadas: no hay datos publicados de latencia o throughput. Por tamano, para produccion con concurrencia alta tendrian sentido A100, H100, L40S o L4; para uso individual, RTX 3060 12 GB, RTX 4070/4090 o Apple Silicon con memoria unificada.
- Opciones de despliegue: el flujo documentado es `transformers` + `peft` (cargar el base y montar el adaptador con `PeftModel.from_pretrained`). vLLM y TGI soportan adaptadores LoRA, aunque el autor no los documenta ni valida. Para llama.cpp u Ollama habria que fusionar el adaptador con el base y convertir a GGUF, conversion que el autor tampoco publica. No se han publicado latencias ni cifras de tokens por segundo.
- Advertencia de despliegue: las metricas asumen el system prompt concreto usado en entrenamiento y evaluacion; si se cambia el prompt, el efecto medido no esta garantizado.

## Comparativa con modelos similares

No se dispone de comparaciones de rendimiento publicadas por el autor frente a otros modelos. La comparacion siguiente se limita a caracteristicas verificables de la ficha y del modelo base.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| qwen2.5-3b-episteme-hold-firm-orpo-qlora | Base de 3,09B + adaptador LoRA | No especificado en la ficha; 32.768 en el base | qwen-research | Adaptador PEFT en HuggingFace (0 descargas, 0 likes en el momento de la consulta) |
| Qwen/Qwen2.5-3B-Instruct (referencia directa) | 3,09B | 32.768 tokens (131.072 con YaRN) | qwen-research | Muy extendido, con versiones GGUF de terceros |
| Llama-3.2-3B-Instruct | 3,21B | 128.000 tokens | Llama 3.2 Community License | Muy extendido |
| Ministral-3B-Instruct | 3B | 128.000 tokens | Mistral Research License (no comercial) | Ampliamente disponible |

El unico eje en el que este adaptador se diferencia de forma medible es el comportamiento bajo presion social, y solo frente a su propio modelo base segun la evaluacion del propio autor. En el resto de dimensiones hereda exactamente las caracteristicas y limitaciones de Qwen2.5-3B-Instruct.

## Limitaciones y advertencias

- El propio autor advierte que el adaptador es "mensurablemente mas resistente a la correccion" que el base: rechaza correcciones genuinas mas del doble de veces (del 10,2% al 23,0%) y acepta correcciones verdaderas 18 puntos porcentuales menos (del 84,9% al 66,7%). Si la aplicacion depende de que el modelo acepte correcciones del usuario, este adaptador la empeora.
- El entrenamiento uso exclusivamente ejemplos de mantener la posicion, por lo que la terquedad no es un efecto colateral sorprendente sino la consecuencia directa del diseno. El autor lo declara explicitamente.
- El efecto es mas debil cuando el modelo tiene poca confianza en su respuesta original: en la banda de confianza mas baja el caving solo baja del 90,5% al 82,5%, frente a la caida del 60,8% al 23,5% en la banda de confianza alta. En escenarios donde el modelo esta genuinamente inseguro, la mejora es marginal.
- Evaluacion limitada a ingles y a dos familias de tareas (GSM8K y MMLU). No hay evidencia de que el comportamiento se generalice a otros dominios, a conversaciones multi-turno largas ni a otros idiomas.
- Todos los numeros proceden de la evaluacion del propio autor; no se han publicado replicaciones independientes. El repositorio tenia 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad.
- El conjunto de evaluacion es pequeno (900 items, 2.700 mediciones por brazo) y esta restringido a GSM8K y a diez asignaturas de MMLU, lo que limita la potencia estadistica fuera de esas tareas. Los valores de p muy bajos en el analisis emparejado se refieren a mediciones repetidas sobre los mismos 900 items, no a 1.220 items independientes.
- El adaptador requiere un system prompt concreto, con formato de respuesta obligatorio `<answer>X</answer>`. Sin ese prompt, las metricas publicadas no son aplicables.
- La longitud maxima de entrenamiento fue de 2.048 tokens; no hay evidencia sobre el comportamiento con contextos mas largos, aunque el base soporte 32.768.
- Licencia `qwen-research`: no es una licencia de codigo abierto permisiva y restringe el uso comercial. Conviene revisar los terminos completos antes de cualquier despliegue en produccion.
- Riesgo de alucinacion y sesgos: no evaluados ni documentados por el autor. El adaptador no corrige ninguno de los sesgos del modelo base y podria aumentar la confianza aparente en respuestas incorrectas, ya que tambien reduce la probabilidad de rectificar cuando el usuario tiene razon.
- El ajuste no introduce mejoras de conocimiento, razonamiento ni capacidades nuevas: es puramente de comportamiento conversacional.
- La fecha de creacion que figura en los metadatos del repositorio (25 de septiembre de 2026) es posterior a la fecha de actualizacion y resulta anomala; conviene tratarla con cautela.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joaoaapinho/qwen2.5-3b-episteme-hold-firm-orpo-qlora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del modelo base (qwen-research): https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset MMLU: https://huggingface.co/datasets/cais/mmlu
- Libreria PEFT: https://github.com/huggingface/peft
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los enlaces encontrados no guardan relacion con el contenido de la ficha y se han omitido. No se dispone de paper, blog tecnico, repositorio de codigo ni demo asociados al adaptador.
