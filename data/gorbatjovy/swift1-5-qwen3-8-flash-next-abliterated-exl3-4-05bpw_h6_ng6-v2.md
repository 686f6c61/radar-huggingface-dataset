# gorbatjovy/Swift1.5-Qwen3.8-Flash-Next-abliterated-EXL3-4.05bpw_h6_ng6-v2

## Resumen

Esta ficha describe el modelo gorbatjovy/Swift1.5-Qwen3.8-Flash-Next-abliterated-EXL3-4.05bpw_h6_ng6-v2, una version cuantizada en formato EXL3 (ExLlamaV3) a 4,05 bits por peso y sometida a un proceso de "abliteration" (eliminacion de las direcciones de rechazo) del modelo ukisai/Swift1.5-Qwen3.8-Flash-Next, que a su vez es un ajuste fino de Qwen/Qwen3.8-Flash-Next. El autor de la publicacion es el usuario gorbatjovy, mientras que la cadena de modelos base pertenece a Qwen y al proyecto ukisai. La model card indica que esta pensada para su uso con "veloGB10".

Se trata de un modelo de arquitectura Mixture of Experts (MoE), con 34.107.350.528 parametros totales segun los pesos en safetensors, y con capacidades multimodales de tipo image-text-to-text (entrada de imagen y texto). La etiqueta del pipeline confirma soporte de vision ademas de generacion de texto. El repositorio ocupa 108,3 GB, aunque la cuantizacion declarada de 4,05 bpw implicaria un tamano de pesos mucho menor, por lo que el contenido real del repositorio no queda detallado en la informacion disponible.

Su relevancia radica en que combina tres elementos poco habituales en una misma publicacion: una cuantizacion muy agresiva orientada a despliegue en GPU (EXL3 4,05 bpw), la eliminacion de filtros de rechazo (abliterated) y una orientacion explicita a tareas agente y de terminal (tags agentic y terminal-bench). No obstante, el modelo acumula cero descargas y cero "me gusta" en el momento de la consulta, y figura como gated (acceso restringido).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (tag `moe`, familia `qwen3_8`); transformer con mezcla de expertos |
| Parametros totales | 34.107.350.528 (aproximadamente 34,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 4,05 bpw (sufijo `h6_ng6`); el modelo es en si una cuantizacion del ajuste fino Swift1.5 |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (etiquetada como `license:other`) |
| Formato de pesos | safetensors (formato EXL3 para ExLlamaV3) |
| Parametros adicionales | Modelo base: Qwen/Qwen3.8-Flash-Next; dataset de ajuste: ukisai/Qwen3.8-27B-multi-turn-agent-sft; repositorio gated; tamano del repo 108,3 GB |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la etiqueta `moe` y la pertenencia a la familia `qwen3_8`. Se sabe que el modelo deriva de Qwen/Qwen3.8-Flash-Next mediante un ajuste fino, y que este ajuste (ukisai/Swift1.5-Qwen3.8-Flash-Next) se realizo sobre el dataset ukisai/Qwen3.8-27B-multi-turn-agent-sft, orientado a conversaciones multi-turno con agentes. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO.

Sobre esta base, el autor ha aplicado dos transformaciones. La primera es el "abliteration", un procedimiento que elimina las direcciones en el espacio de activaciones asociadas al rechazo de peticiones, de modo que el modelo no filtra contenido potencialmente danino. La segunda es la cuantizacion EXL3 a 4,05 bpw con los parametros `h6_ng6`, un formato propio de ExLlamaV3 que combina pesos de baja precision con componentes de mayor precision en los puntos sensibles. No se documentan innovaciones arquitectonicas adicionales (atencion lineal, decodificacion especulativa, etc.) en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento (tags `reasoning` y `efficient-thinking`).
- Capacidades multimodales de imagen y texto, segun el pipeline `image-text-to-text`.
- Orientacion a tareas agente y de terminal (tags `agentic` y `terminal-bench`).
- Uso eficiente de tokens (`token-efficient`), segun la propia clasificacion del autor.
- Soporte de conversacion multi-turno (tag `conversational`).
- Compatibilidad declarada con endpoints (`endpoints_compatible`).
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion disponible, aunque coherente con las etiquetas agenticas.
- Capacidades multilingues: no disponible.
- Efecto del "abliteration": supresion del comportamiento de rechazo ante peticiones sensibles.

## Casos de uso

- Automatizacion de agentes de terminal: dado que el modelo esta etiquetado con `terminal-bench` y `agentic`, encaja en flujos donde el modelo interpreta la salida de comandos, decide la siguiente accion y opera en un bucle multi-paso sobre un entorno de shell.
- Analisis de capturas y diagramas: al ser un modelo image-text-to-text, puede recibir una imagen (captura de interfaz, diagrama de arquitectura, grafico) y generar texto descriptivo o instrucciones derivadas.
- Atencion al cliente multi-turno: el ajuste fino se realizo sobre un dataset de conversaciones multi-turno con agentes, lo que lo hace adecuado para dialogos sostenidos con contexto acumulado, aunque la longitud exacta de contexto no esta disponible.
- Despliegue en GPU de gama unica con EXL3: la cuantizacion a 4,05 bpw reduce el peso de los parametros y permite servir el modelo con ExLlamaV3 o TabbyAPI en entornos con VRAM limitada, segun la referencia a "veloGB10".
- Generacion de codigo asistida en pipelines de desarrollo: el perfil agentico y de terminal permite integrarlo en herramientas de linea de comandos o asistentes de repositorio.
- Investigacion sobre alineacion y seguridad: al ser un modelo "abliterated", resulta util para estudiar el efecto de la supresion de las direcciones de rechazo y comparar su comportamiento con el modelo base no modificado.
- Prototipado rapido local: al tratarse de una cuantizacion, puede ejecutarse en estaciones de trabajo con una sola GPU para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: con 34,1 B de parametros a 4,05 bpw, los pesos rondan los 17,3 GB, a los que hay que sumar la cache KV y el overhead de ExLlamaV3. No se dispone de cifras oficiales.
- Tamano del repositorio segun HuggingFace: 108,3 GB, muy superior al calculo anterior, lo que sugiere que puede contener variantes o artefactos adicionales no detallados.
- GPU recomendadas: no disponible; la model card menciona el uso con "veloGB10", sin especificar el hardware objetivo.
- Compatibilidad con GPU de consumo: probable segun la cuantizacion a 4,05 bpw, pero no confirmada en la informacion disponible.
- Opciones de despliegue: el formato EXL3 es propio de ExLlamaV3, por lo que se espera compatibilidad con ExLlamaV3, TabbyAPI y text-generation-webui. La libreria declarada es transformers.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| gorbatjovy/Swift1.5-Qwen3.8-Flash-Next-abliterated-EXL3-4.05bpw_h6_ng6-v2 | 34,1 B (MoE) | no disponible | safetensors EXL3 4,05 bpw | swift-open-license-1.0 | Abliterated, cuantizado, gated, 0 descargas |
| ukisai/Swift1.5-Qwen3.8-Flash-Next | no disponible | no disponible | safetensors | swift-open-license-1.0 | Ajuste fino de origen, sin abliteration ni cuantizacion EXL3 |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | safetensors | no disponible | Modelo base original de Qwen |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa entre estas variantes.

## Limitaciones y advertencias

- El proceso de abliteration elimina el comportamiento de rechazo, por lo que el modelo puede generar contenido danino, ofensivo o inseguro sin filtros. No es apto para aplicaciones orientadas al publico sin capas de moderacion externas.
- Riesgo de alucinacion no cuantificado: no hay benchmarks publicados que permitan estimar la fiabilidad factual.
- El repositorio esta marcado como gated, por lo que el acceso requiere aceptar condiciones en HuggingFace.
- La licencia swift-open-license-1.0 esta catalogada como `license:other`; es imprescindible revisar el texto completo en el enlace de licencia antes de cualquier uso comercial.
- No se documentan los idiomas soportados ni la longitud de contexto, lo que dificulta dimensionar despliegues en produccion.
- El modelo acumula cero descargas y cero valoraciones, sin evidencia de uso en produccion ni validacion por terceros.
- La discrepancia entre el tamano del repo (108,3 GB) y la cuantizacion declarada (4,05 bpw) no esta explicada en la informacion disponible.
- Al ser una cuantizacion de un ajuste fino de segunda generacion, puede heredar sesgos del dataset ukisai/Qwen3.8-27B-multi-turn-agent-sft y del modelo Qwen original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gorbatjovy/Swift1.5-Qwen3.8-Flash-Next-abliterated-EXL3-4.05bpw_h6_ng6-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Ajuste fino de origen: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Dataset de ajuste: https://huggingface.co/datasets/ukisai/Qwen3.8-27B-multi-turn-agent-sft
- Licencia: https://huggingface.co/ukisai/Swift-Qwen3.8-Flash-Next/blob/main/LICENSE
