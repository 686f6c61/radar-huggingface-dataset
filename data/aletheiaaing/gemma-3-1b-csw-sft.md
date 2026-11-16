# AletheiaAING/gemma-3-1b-csw-sft

## Resumen

gemma-3-1b-csw-sft es un ajuste fino supervisado (SFT) del modelo google/gemma-3-1b-it, desarrollado por AletheiaAING, orientado a dos tareas muy especificas sobre 37 lenguas africanas: la alternancia de codigos (code-switching, mezclar una segunda lengua en una frase base tal como hacen los hablantes nativos) y la reescritura idiomatica (convertir texto plano o literal en un registro coloquial rico en refranes, comparaciones y exclamaciones). El modelo base es un transformer decoder-only de la familia Gemma 3, con aproximadamente 1.000 millones de parametros (999.885.952 en pesos safetensors), y el repositorio ocupa 8,1 GB porque conserva checkpoints intermedios.

El modelo forma parte de una familia mas amplia: es el punto de partida SFT sobre el que arrancan todas las ejecuciones de RL de esa familia. El autor reporta que, sobre el conjunto de test completo, su chrF++ greedy (media 48,05) es ligeramente superior al del mejor modelo RL de la familia (47,83), aunque su fiabilidad de formato es menor (salida valida en el 92 % de los prompts de code-switching frente al 97 % del modelo RL). El entrenamiento uso 633.579 filas durante dos epocas, vocabulario completo y pesos maestros en fp32.

Es relevante porque cubre un nicho poco atendido: la generacion de texto natural y code-switched en lenguas africanas de bajos recursos, con un formato de prompt y salida estrictamente estructurado que facilita el filtrado automatico de resultados. No obstante, es un modelo de investigacion con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados mas alla de la metrica chrF++ mencionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (gemma3_text), ajuste fino del modelo google/gemma-3-1b-it |
| Parametros totales | 999.885.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor menciona pesos maestros fp32 durante el entrenamiento) |
| Idiomas soportados | yo, ha, ig, sw, zu, xh, af, am, so, rw, ln, lg, sn, ny, st, tn, mg, wo, ee, tw, om, ti (37 lenguas africanas segun la model card) |
| Licencia | gemma |
| Formato de pesos | safetensors |
| Tamano del repositorio | 8,1 GB (incluye checkpoints intermedios) |
| Modelo base | google/gemma-3-1b-it |
| Datos de entrenamiento | 633.579 filas, dos epocas, vocabulario completo, pesos maestros fp32 |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura gemma3_text del modelo base google/gemma-3-1b-it: un transformer decoder-only de aproximadamente 1.000 millones de parametros. El ajuste fino es supervisado (SFT) sobre 633.579 filas durante dos epocas, con vocabulario completo y pesos maestros en fp32. No se detalla en la informacion disponible la composicion exacta del dataset, el numero total de tokens procesados ni si hubo etapas de RLHF o DPO; el autor solo indica que este checkpoint SFT es el punto de partida de todas las ejecuciones de RL de la familia.

La innovacion tecnica destacable no esta en la arquitectura sino en el diseno de la tarea y del formato: el modelo trabaja con cinco tareas predefinidas (`eng_hm`, `m_hm`, `eng_ood`, `m_ood`, `hm_ood`) y exige un formato de prompt y salida muy rigido. Los idiomas se codifican como tokens especiales entre angulos (por ejemplo `<yor>`, `<eng>`), que son tokens unicos del vocabulario, y la salida incluye un bloque `<dev>` con los dispositivos (frases code-switched o idiomas usados) copiados literalmente del texto generado. Este diseno permite un parseo automatico y un filtrado por validez de formato, algo poco habitual en modelos de generacion multilingue. El modelo no realiza traduccion plana (`m_text`); para esa tarea el autor remite a otros modelos de la familia (los csw de 270M) o al dataset `csw-synth-samples8`.

## Capacidades

- Generacion de texto en 37 lenguas africanas, con soporte de code-switching controlado por pares de lenguas predefinidos.
- Reescritura idiomatica: transforma texto plano o literal en un registro coloquial con refranes, comparaciones y exclamaciones.
- Cinco tareas especializadas: `eng_hm` (ingles a lengua base con mezcla), `m_hm` (lengua base a mezcla), `eng_ood` (ingles a reescritura idiomatica), `m_ood` (lengua base a reescritura idiomatica) y `hm_ood` (texto ya mezclado a reescritura idiomatica que conserva la mezcla).
- Salida estructurada con etiquetas de lengua y bloque `<dev>` que lista los dispositivos utilizados, parseable de forma automatica.
- Conversacion de un solo turno: el modelo espera un unico mensaje de usuario, sin system prompt.
- No soporta traduccion plana (`m_text`), tool calling, function calling, agentes, vision ni audio segun la informacion disponible.

## Casos de uso

- Generacion de datos sinteticos code-switched para entrenar modelos de traduccion o de ASR en lenguas africanas: el modelo produce frases mezcladas con el bloque `<dev>` que identifica cada dispositivo, lo que permite filtrar y validar automaticamente las muestras generadas.
- Aumento de datos para corpus idiomaticos: a partir de texto plano en yoruba, hausa, suajili u otra lengua soportada, el modelo genera variantes coloquiales ricas en refranes, utiles para entrenar modelos de estilo o de analisis de sentimiento en registro informal.
- Creacion de contenido para chatbots de atencion al cliente en registro coloquial: el modelo reescribe respuestas planas en un tono conversacional nativo, adecuado para asistentes dirigidos a usuarios que hablan en registro informal.
- Localizacion de interfaz y mensajes de producto: dado un texto en ingles, se obtiene una version en la lengua base con prestamos de ingles tal como los usaria un hablante real, util para aplicaciones moviles en mercados africanos.
- Investigacion linguistica sobre code-switching: el bloque `<dev>` permite extraer y estudiar los patrones de mezcla de lenguas generados, comparandolos con corpus reales.
- Prototipado rapido de aplicaciones de escritura asistida en lenguas africanas de bajos recursos, donde apenas existen modelos ajustados y el coste de un modelo de 1B es bajo.
- Evaluacion comparativa de estrategias de RL: al ser el checkpoint SFT de partida de una familia con modelos RL, sirve como linea base reproducible para experimentos de alineamiento en lenguas de bajos recursos.

## Benchmarks y rendimiento

| Metrica | gemma-3-1b-csw-sft (SFT) | Mejor modelo RL de la familia |
|---|---|---|
| chrF++ greedy (media, test completo) | 48,05 | 47,83 |
| Salida valida en prompts de code-switching | 92 % | 97 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos numericos son los reportados por el autor en la model card: chrF++ greedy y porcentaje de salidas validas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 999.885.952 parametros, en fp16 serian aproximadamente 2 GB de pesos y en cuantizacion de 4 bits alrededor de 0,5-0,7 GB, aunque el autor no publica cifras de cuantizacion ni de VRAM.
- GPU recomendadas: no disponible. Por tamano, el modelo deberia caber en GPUs de consumo como RTX 3060, RTX 4060 o superiores, pero no hay datos del autor que lo confirmen.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano de 1B, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: no disponible. El repositorio solo incluye pesos safetensors; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AletheiaAING/gemma-3-1b-csw-sft | 999.885.952 | no disponible | Code-switching e idiomatico en 37 lenguas africanas | gemma | Hugging Face, 0 descargas |
| google/gemma-3-1b-it (modelo base) | aproximadamente 1.000 millones | no disponible | Generacion de texto e instrucciones general | gemma | Hugging Face |
| Modelos csw de 270M de la misma familia | no disponible | no disponible | Code-switching, incluye `m_text` | gemma | Hugging Face (referenciados en la model card) |
| Modelo RL de la misma familia | no disponible | no disponible | Code-switching con mejor fiabilidad de formato (97 %) | gemma | Hugging Face (referenciado en la model card) |

No se dispone de datos de benchmarks comparables con modelos de otras familias en la informacion proporcionada.

## Limitaciones y advertencias

- Fiabilidad de formato limitada: solo el 92 % de los prompts de code-switching producen salida valida; el autor recomienda tratar como invalida cualquier salida sin bloque `<dev>` y remuestrear.
- El modelo no realiza traduccion plana (`m_text`); usarlo para esa tarea daria resultados fuera de distribucion.
- Solo funciona con los pares de lenguas predefinidos para cada lengua base; otros pares no fueron entrenados y producen resultados poco naturales.
- El formato de prompt es estricto (etiquetas entre angulos, dos espacios tras los dos puntos, sin system prompt); desviarse de el degrada la calidad.
- Riesgo de alucinacion y de generacion de dispositivos inexistentes en el bloque `<dev>`, aunque el diseno exige copiarlos literalmente del texto.
- Sesgos conocidos: no disponible en la informacion proporcionada; al derivar de Gemma 3, puede heredar sesgos del modelo base.
- Licencia gemma: sujeta a los terminos de uso de Gemma de Google, que imponen restricciones a la redistribucion y al uso comercial; conviene revisar la politica de uso prohibido antes de desplegar en produccion.
- Modelo de investigacion con cero descargas y cero likes en el momento de la consulta; sin validacion externa independiente.
- No hay informacion sobre longitud de contexto efectiva, por lo que no se recomienda para tareas que requieran ventanas largas.
- El repositorio de 8,1 GB incluye checkpoints intermedios, lo que infla el tamano de descarga respecto a los pesos finales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AletheiaAING/gemma-3-1b-csw-sft
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Dataset referenciado en la model card: `csw-synth-samples8` (no se proporciona URL directa en la informacion disponible)
- Paper, blog, repositorio o demo adicionales: no disponible en la informacion proporcionada
