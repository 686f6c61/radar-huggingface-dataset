# mradermacher/Shadow-Siren-14B-v2-Pruned-i1-GGUF

## Resumen

Shadow-Siren-14B-v2-Pruned-i1-GGUF es una coleccion de cuantizaciones en formato GGUF generada por mradermacher a partir del modelo Goopr/Shadow-Siren-14B-v2-Pruned. No se trata de un modelo entrenado desde cero, sino de una conversion y cuantizacion de un modelo ya existente que ha sido previamente podado (pruned) por su autor original. El repositorio incluye un amplio abanico de niveles de cuantizacion, desde IQ1_S hasta Q6_K, todos ellos generados con el metodo imatrix (importance matrix), lo que permite ajustar el equilibrio entre calidad y consumo de memoria.

El modelo base cuenta con 13.808.740.766 parametros (aproximadamente 13,8 mil millones), lo que lo situa en la categoria de modelos de tamano medio-grande, aptos para tareas conversacionales segun indica el tag "conversational". El repositorio ocupa 58,0 GB en total debido a la gran cantidad de variantes de cuantizacion publicadas de forma simultanea. Las fechas de creacion y actualizacion que figuran en la ficha son 2026-10-04, dato que conviene verificar dado que no es coherente con el estado actual.

La relevancia de esta publicacion radica en que facilita el despliegue local del modelo podado en hardware de consumo mediante llama.cpp y herramientas compatibles, sin necesidad de recurrir a los pesos originales en precision completa. Sin embargo, la ficha no aporta informacion sobre arquitectura, licencia, idiomas, longitud de contexto ni datos de entrenamiento, por lo que la evaluacion tecnica queda parcialmente limitada a los parametros conocidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 13.808.740.766 (aprox. 13,8B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, small-IQ4_NL, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (modelo base presumiblemente en safetensors) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base en la documentacion proporcionada. La denominacion "14B" y el sufijo "Pruned" indican que se parte de un modelo de aproximadamente 14.000 millones de parametros al que posteriormente se le ha aplicado un proceso de poda para reducir su tamano, resultando en 13.808.740.766 parametros finales. El tag "conversational" sugiere que el modelo ha sido ajustado o evaluado para tareas de dialogo, aunque no se detalla el proceso de ajuste (SFT, RLHF, DPO u otros).

En cuanto al proceso de cuantizacion, el autor indica explicitamente que se trata de cuantizaciones "weighted/imatrix" del modelo Goopr/Shadow-Siren-14B-v2-Pruned. El metodo imatrix calcula una matriz de importancia a partir de datos de calibracion para decidir que pesos merecen mayor precision, lo que generalmente produce cuantizaciones de baja precision (por ejemplo IQ2 o IQ3) con menos perdida de calidad que las cuantizaciones uniformes equivalentes. No se especifica que dataset de calibracion se ha utilizado.

## Capacidades

- Generacion de texto conversacional: el tag "conversational" y la compatibilidad con endpoints indican que el modelo esta orientado a dialogos multi-turno.
- Despliegue local mediante llama.cpp y runtimes compatibles con GGUF.
- Ejecucion en entornos con recursos limitados gracias a las variantes de muy baja precision (IQ1_S, IQ2_M).
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que permite exponerlo a traves de APIs compatibles con OpenAI.
- Capacidades especificas adicionales (tool calling, agentes, razonamiento multi-paso, vision, audio, modo thinking): no disponible.
- Cobertura multilingue: no disponible.

## Casos de uso

- Despliegue local en equipos de sobremesa: gracias a las cuantizaciones Q4_K_M o Q3_K_M, el modelo puede ejecutarse en GPUs de consumo con 8-12 GB de VRAM, lo que permite disponer de un asistente conversacional privado sin conexion a servicios externos.
- Prototipado rapido de aplicaciones conversacionales: la variante Q5_K_M ofrece un equilibrio razonable entre calidad y memoria para entornos de desarrollo donde se quiere iterar sin costes de API.
- Integracion en pipelines con API compatible con OpenAI: el tag "endpoints_compatible" sugiere que el modelo puede servirse mediante servidores compatibles, facilitando su sustitucion en aplicaciones ya construidas sobre esa interfaz.
- Ejecucion en hardware muy limitado: las variantes IQ1_S e IQ2_M permiten probar el modelo en maquinas con poca memoria, a costa de una degradacion notable de calidad, util para experimentacion o demostraciones.
- Entornos con restricciones de privacidad: al ejecutarse localmente, el modelo es adecuado para procesar texto sensible que no deberia salir de la infraestructura propia.
- Comparacion de cuantizaciones: el repositorio incluye casi toda la escala de cuantizaciones, lo que lo convierte en un buen banco de pruebas para medir el impacto de la precision en la calidad de salida sobre un mismo modelo base.
- Analisis o continuacion de proyectos de poda: investigadores interesados en el efecto de la poda sobre modelos de ~14B pueden usar estas versiones para comparar con el modelo sin podar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las siguientes cifras son estimaciones calculadas a partir del numero de parametros (13,8B) y del tamano tipico de cada cuantizacion; no proceden de mediciones publicadas por el autor.

- VRAM estimada para inferencia (modelo en memoria, sin contar contexto):
  - Q6_K: aproximadamente 11-12 GB.
  - Q5_K_M: aproximadamente 9,5-10 GB.
  - Q4_K_M: aproximadamente 8-8,5 GB.
  - Q4_K_S: aproximadamente 7,5-8 GB.
  - Q3_K_M: aproximadamente 6,5-7 GB.
  - Q2_K: aproximadamente 5-5,5 GB.
  - IQ2_M / IQ2_S: aproximadamente 4,5-5 GB.
  - IQ1_S: aproximadamente 3,5-4 GB.
- GPU recomendadas: para Q6_K y Q5_K_M, una RTX 4080/4090 (16-24 GB) o una A100 40 GB; para Q4_K_M y Q4_K_S, una RTX 3060 12 GB o RTX 4070; para Q3_K_M y Q2_K, una RTX 3060 12 GB o inferior con 8 GB si se descarga parcialmente a RAM.
- Cabe en GPU de consumo: si, en la mayoria de variantes de Q4 hacia abajo, en tarjetas con 8-12 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con la API de OpenAI que consuman GGUF. vLLM y TGI no son la via natural para GGUF, aunque existen soportes parciales.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que solo se puede comparar a nivel de parametros y formato. La siguiente tabla recoge alternativas del mismo orden de tamano a titulo orientativo.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Shadow-Siren-14B-v2-Pruned (este) | 13,8B | no disponible | no disponible | GGUF |
| Qwen2.5-14B | 14,7B | 128K | Apache 2.0 | safetensors, GGUF |
| Phi-4 | 14,7B | 16K | MIT | safetensors |
| Mistral Nemo 12B | 12,2B | 128K | Apache 2.0 | safetensors, GGUF |

La comparacion de rendimiento no es posible por falta de benchmarks publicados para este modelo.

## Limitaciones y advertencias

- No se especifica la licencia, ni del modelo base ni del repositorio de cuantizaciones, por lo que no puede confirmarse que sea apto para uso comercial. Es imprescindible verificar la licencia en el repositorio del modelo original antes de cualquier despliegue en produccion.
- No hay informacion sobre sesgos, datos de entrenamiento ni procesos de alineacion, lo que impide evaluar riesgos de contenido sesgado o inseguro.
- Riesgo de alucinacion no cuantificado: no se han publicado evaluaciones de fidelidad ni de tasas de error.
- La longitud de contexto es desconocida, lo que limita el diseno de aplicaciones que dependan de ventanas largas.
- La cobertura idiomatica es desconocida; no puede asumirse un buen rendimiento en castellano.
- Las cuantizaciones de muy baja precision (IQ1_S, IQ2_XXS, IQ2_XS, Q2_K_S) degradan notablemente la calidad y no deberian usarse en produccion.
- El modelo ha sido podado, lo que puede implicar perdida de capacidades respecto al modelo original completo; no se documenta la magnitud de esa perdida.
- Las fechas de creacion y actualizacion del repositorio (2026-10-04) no son coherentes con el momento actual y deberian verificarse.
- El repositorio muestra 0 descargas y 0 likes, lo que indica que no existe validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Shadow-Siren-14B-v2-Pruned-i1-GGUF
- Modelo base: https://huggingface.co/Goopr/Shadow-Siren-14B-v2-Pruned
- Otros enlaces (papers, blogs, demos, repos): no disponible.
