# mradermacher/lfm2.5-2.6b-fable5-coding-agent-heretic-i1-GGUF

## Resumen

Esta ficha describe `mradermacher/lfm2.5-2.6b-fable5-coding-agent-heretic-i1-GGUF`, una cuantizacion en formato GGUF generada por el usuario mradermacher a partir del modelo `AzariazIZI/lfm2.5-2.6b-fable5-coding-agent-heretic`. No es un modelo entrenado desde cero: es la conversion a GGUF, con cuantizacion ponderada mediante imatrix, de un fine-tune derivado a su vez de la familia LFM2.5 de Liquid AI. El modelo base declarado tiene 2.697.198.592 parametros (aproximadamente 2,7 mil millones), lo que lo situa en la gama de modelos pequenos ejecutables en hardware de consumo.

El modelo pertenece a la categoria de fine-tunes orientados a agentes de codigo y uso de herramientas (tags `coding-agent`, `tool-use`), y ha sido modificado mediante tecnicas de "abliteracion" o "decensoring" (tags `heretic`, `uncensored`, `abliterated`). Esto implica que se ha intervenido sobre las capas de rechazo del modelo original, reduciendo o eliminando sus mecanismos de negativa ante ciertas peticiones. Es un aspecto critico tanto para evaluacion como para despliegue en produccion.

La relevancia de esta publicacion es practica: ofrece el modelo en multiples niveles de cuantizacion (desde IQ1_S de ~0,8 GB hasta formatos de mayor precision), lo que permite desplegarlo en GPUs modestas e incluso en CPU. El repositorio ocupa 31,9 GB en total por acumular todas las variantes. En el momento de la consulta no registra descargas ni likes, y no se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (familia Liquid AI; detalles de arquitectura interna no disponibles en la informacion proporcionada) |
| Parametros totales | 2.697.198.592 (aprox. 2,7B) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (cuantizacion ponderada/imatrix i1) |
| Idiomas soportados | en (ingles) |
| Licencia | other (enlaza a https://huggingface.co/LiquidAI/LFM2.5-2.6B/blob/main/LICENSE) |
| Formato de pesos | GGUF (cuantizado; el modelo base original estaria en safetensors/transformers) |

Nota: el repositorio incluye tambien un fichero imatrix (`lfm2.5-2.6b-fable5-coding-agent-heretic.imatrix.gguf`, 0,1 GB) para que el usuario genere sus propias cuantizaciones.

## Arquitectura y entrenamiento

No se dispone en la informacion proporcionada de detalles sobre la arquitectura interna (tipo de atencion, uso de convoluciones, capas de estado, etc.), el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO. El unico dato tecnico confirmado es que se trata de la familia LFM2.5 de Liquid AI (tag `lfm2` y `base_model` que apunta a LiquidAI/LFM2.5-2.6B para la licencia), con aproximadamente 2,7B de parametros.

Lo que si es verificable es la cadena de transformacion: Liquid AI entrena LFM2.5-2.6B; sobre esa base se produce el fine-tune `AzariazIZI/lfm2.5-2.6b-fable5-coding-agent-heretic` (con ajuste orientado a agente de codigo y modificacion de comportamiento de rechazo, "heretic"); y finalmente mradermacher aplica cuantizacion ponderada con imatrix para generar las variantes GGUF de este repositorio. La innovacion tecnica destacable aqui no esta en el entrenamiento, sino en el pipeline de cuantizacion: el uso de un fichero imatrix (importance matrix) para ponderar la cuantizacion busca preservar la calidad en niveles de compresion bajos (IQ1-IQ3), donde las cuantizaciones estaticas convencionales degradan mas.

## Capacidades

- Generacion de texto conversacional en ingles.
- Orientacion a agente de codigo: el tag `coding-agent` sugiere ajuste para tareas de programacion asistida.
- Uso de herramientas (tool calling / function calling): el tag `tool-use` indica soporte, aunque no se detalla el esquema concreto.
- Razonamiento multi-paso y flujos de agente: inferido de los tags, sin documentacion adicional disponible.
- Capacidad multilingue: limitada al ingles segun el campo `language`.
- Modo "uncensored"/abliterated: el modelo ha sido intervenido para reducir negativas; esto no es una "capacidad" en si, sino una modificacion de comportamiento con implicaciones eticas y legales.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito ("thinking").

## Casos de uso

- Agente de codigo en local: dado su tamano (2,7B) y su tag `coding-agent`, puede ejecutarse como asistente de autocompletado o generacion de parches dentro de un IDE o pipeline de CI/CD en hardware de consumo, sin coste de API.
- Asistente de terminal con tool calling: integrable en scripts que invoquen funciones externas (lectura de ficheros, ejecucion de comandos) mediante el soporte declarado de `tool-use`.
- Prototipado rapido de agentes conversacionales: su formato GGUF permite arrancarlo con llama.cpp u Ollama en minutos para validar flujos antes de escalar a modelos mayores.
- Experimentacion con modelos "abliterated": util en investigacion sobre alineacion, seguridad y comportamiento de rechazo, ya que permite estudiar un modelo con la capa de negativa intervenida.
- Despliegue en CPU o edge: la variante i1-IQ1/IQ2 ocupa menos de 1-1,2 GB, lo que habilita inferencia en portatiles o dispositivos con recursos limitados.
- Generacion de codigo offline y privacidad de datos: al ejecutarse localmente, evita enviar codigo propietario a servicios en la nube.
- Tareas de texto general en ingles con contexto moderado, siempre que la calidad exigida sea compatible con la baja precision de las cuantizaciones pequenas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica en la model card, y el repositorio no registra descargas ni valoraciones que permitan inferir rendimiento practico.

## Requisitos de hardware

Los tamanos siguientes corresponden a los ficheros GGUF publicados en el repositorio (estimaciones de VRAM basadas en el tamano del fichero mas overhead de contexto/activaciones):

- Cuantizaciones muy bajas (i1-IQ1_S/IQ1_M, ~0,8 GB): ejecutables en CPU y en GPUs con 2 GB de VRAM o menos.
- i1-IQ2 (~0,9-1,1 GB): viables en GPUs integradas y equipos modestos.
- i1-IQ3 (~1,2-1,4 GB): buena relacion tamano/calidad para GPUs de gama baja.
- i1-Q4_K_M (~1,8 GB, marcado como "fast, recommended"): recomendado para uso general; cabe holgadamente en GPUs de 4 GB o mas.
- Formato equivalente Q4_K_S (~1,7 GB): marcado como "optimal size/speed/quality".
- Cuantizaciones mayores (Q5, Q6): mas calidad, mas VRAM; siguen siendo manejables en GPUs de consumo de 6-8 GB.
- GPU recomendadas: cualquier GPU de consumo con 4-8 GB (RTX 3060, 4060, 4090, etc.) para las variantes Q4-Q6. No se requieren A100/H100.
- Despliegue: llama.cpp (formato nativo), Ollama, LM Studio, y text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`). Tambien soporta el flujo transformers para el modelo base, no para el GGUF.
- Latencia y throughput: no disponibles. Al ser un modelo de 2,7B, se espera una generacion fluida en GPU de consumo, pero no se aportan cifras concretas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos en la informacion proporcionada. Como alternativas de categoria similar (modelos densos de ~2-3B, orientados a uso local) se podrian considerar Qwen2.5-3B, Llama-3.2-3B y Gemma-2-2B, pero no se han verificado sus especificaciones ni su rendimiento frente a este modelo dentro de esta ficha.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| lfm2.5-2.6b (esta ficha, GGUF) | ~2,7B | no disponible | other (LFM2.5 LICENSE) | Fine-tune "abliterated" orientado a coding-agent; solo ingles |
| Qwen2.5-3B | no verificado en esta informacion | no verificado | no verificado | Alternativa comun en la misma franja |
| Llama-3.2-3B | no verificado en esta informacion | no verificado | no verificado | Alternativa comun en la misma franja |
| Gemma-2-2B | no verificado en esta informacion | no verificado | no verificado | Alternativa comun en la misma franja |

No se han publicado comparativas oficiales frente a estos modelos.

## Limitaciones y advertencias

- Ingenieria de seguridad alterada: es un modelo "abliterated"/"heretic", es decir, con los mecanismos de rechazo intervenidos. Puede producir contenido danino, ofensivo o inapropiado. No apto para aplicaciones de cara al publico sin un filtro adicional.
- Riesgo de alucinacion elevado: al ser un modelo pequeno (2,7B), la tasa de invencion de hechos y de codigo incorrecto es mayor que en modelos de mayor tamano.
- Idioma unico: solo soporta ingles (`language: en`); el rendimiento en castellano no esta garantizado y probablemente sea deficiente.
- Degradacion por cuantizacion: las variantes de muy baja precision (IQ1, IQ2, Q2) se describen en la propia model card como "for the desperate", "very low quality" o "lower quality". La calidad cae significativamente en esos rangos.
- Licencia restrictiva: la licencia es "other" y remite a la LFM Open License de Liquid AI. Debe revisarse antes de cualquier uso comercial; no se garantiza uso comercial libre.
- Longitud de contexto desconocida: no se documenta la ventana de contexto, lo que dificulta planificar tareas de contexto largo.
- Trazabilidad limitada: es una cuantizacion de terceros de un fine-tune de terceros. El autor de esta ficha no ha validado la calidad del modelo intermedio.
- Sin adopcion ni validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion.
- Para produccion se recomienda validar exhaustivamente, anadir capas de moderacion y considerar modelos mayores si la tarea exige fiabilidad.

## Enlaces

- Repositorio HuggingFace de esta ficha (GGUF imatrix): https://huggingface.co/mradermacher/lfm2.5-2.6b-fable5-coding-agent-heretic-i1-GGUF
- Resumen y lista de descargas del autor: https://hf.tst.eu/model#lfm2.5-2.6b-fable5-coding-agent-heretic-i1-GGUF
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/lfm2.5-2.6b-fable5-coding-agent-heretic-GGUF
- Modelo base del fine-tune: https://huggingface.co/AzariazIZI/lfm2.5-2.6b-fable5-coding-agent-heretic
- Modelo original de Liquid AI (licencia): https://huggingface.co/LiquidAI/LFM2.5-2.6B/blob/main/LICENSE
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
