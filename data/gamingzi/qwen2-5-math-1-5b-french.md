# GAMINGZI/qwen2.5-math-1.5b-french

## Resumen

Qwen2.5-math-1.5b-french es un ajuste fino (fine-tuning) del modelo Qwen/Qwen2.5-Math-1.5B-Instruct, desarrollado por el usuario GAMINGZI, cuyo objetivo es mejorar la comprensión de problemas matemáticos redactados en frances. El modelo base destaca en ingles pero tiene un rendimiento notablemente inferior en frances; este ajuste cierra aproximadamente el 60% de esa brecha sin degradar el rendimiento en ingles. Se distribuye bajo licencia Apache 2.0 y esta disponible en Hugging Face con 1.543.714.304 parametros (1,5B) en formato safetensors.

La relevancia de este modelo radica en su enfoque tecnico: utiliza destilacion cruzada auto-supervisada (cross-lingual self-distillation) mediante LoRA, entrenando al modelo para que, dada una pregunta en frances, reproduzca su propia solucion correcta en ingles. De este modo, el modelo aprende a comprender el frances sin alterar su proceso de razonamiento matematico. El entrenamiento se realizo en una unica GPU RTX 5060 Ti de 16 GB, lo que demuestra que es posible obtener mejoras significativas con recursos de consumo.

El modelo esta pensado para tareas de resolucion de problemas matematicos de nivel escolar (grade-school math) en frances, con soporte de votacion por mayoria (majority voting) para incrementar la precision. No obstante, presenta una limitacion importante: lee frances pero responde en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajustado con LoRA y fusionado |
| Parametros totales | 1.543.714.304 (1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-Math-1.5B-Instruct soporta 32.768 tokens, aunque no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos safetensors en bfloat16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | fr, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2 (transformer decoder-only) del modelo Qwen2.5-Math-1.5B-Instruct, especializado en matematicas. El ajuste se realizo mediante LoRA con r=32 aplicado a todas las proyecciones de atencion y MLP, durante 1 epoch con learning rate 1e-4, y posteriormente se fusionaron los pesos. La version v3 anadio un epoch adicional desde v2 con learning rate 5e-5 sobre los mismos datos mas 2.000 ejemplos en ingles, para corregir una ligera caida del rendimiento en ingles observada en v2.

El proceso de entrenamiento consistio en destilacion cruzada auto-supervisada: se tradujeron las 7.473 preguntas de entrenamiento de GSM8K al frances en dos variantes (una literal con Helsinki-NLP/opus-mt-en-fr y otra con frances natural mediante kurakurai/Luth-2-2B), descartando traducciones que perdieran o alteraran numeros. El modelo base resolvio las preguntas originales en ingles y solo se conservaron las soluciones correctas (7.154 de 7.473). Finalmente, se entreno con LoRA sobre pares "pregunta en frances → solucion correcta propia en ingles", generando 13.644 ejemplos (6.720 de opus-mt y 6.924 de Luth). El entrenamiento completo se realizo en una RTX 5060 Ti de 16 GB: 50 minutos para v2 y 57 minutos adicionales para v3.

## Capacidades

- Generacion de texto y razonamiento matematico paso a paso (chain-of-thought) para problemas de nivel escolar.
- Comprension de problemas matematicos redactados en frances (lectura), aunque la respuesta se genera en ingles.
- Resolucion de problemas matematicos en ingles con rendimiento equiparable al modelo base.
- Soporte de votacion por mayoria (vote@8) para mejorar la precision en problemas en frances.
- Capacidad de generar soluciones con formato de respuesta final en `\boxed{}`.
- Soporte de plantilla de chat (chat template) para conversaciones con roles system/user/assistant.
- Capacidades multilingues limitadas a fr y en.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- **Tutoria matematica en frances para estudiantes**: el modelo puede recibir un problema redactado en frances y generar un razonamiento paso a paso que el estudiante pueda seguir, aunque la explicacion final se produzca en ingles. Es adecuado para entornos bilingues donde el alumno comprende ambos idiomas.
- **Generacion de soluciones para bancos de problemas en frances**: se puede integrar en un pipeline que reciba problemas de GSM8K traducidos al frances y genere soluciones verificables, usando votacion por mayoria para aumentar la fiabilidad.
- **Evaluacion comparativa de modelos multilingues**: sirve como referencia de hasta donde puede llegar un modelo pequeno (1,5B) especializado en matematicas tras un ajuste LoRA economico, util para investigadores que estudien transferencia cross-lingual.
- **Prototipado rapido en hardware de consumo**: al caber en una GPU de 16 GB (RTX 5060 Ti) y entrenarse en menos de dos horas, es adecuado para experimentos de investigacion con recursos limitados.
- **Preprocesamiento de problemas matematicos en frances**: el modelo puede leer y estructurar problemas en frances para su posterior procesamiento, aunque la salida sea en ingles.
- **Generacion de datos sinteticos de razonamiento matematico**: las soluciones generadas pueden emplearse como datos de entrenamiento o aumentacion para otros modelos, especialmente en contextos bilingues fr-en.
- **Investigacion en destilacion cross-lingual**: el codigo y las evaluaciones estan disponibles en el repositorio de GitHub del autor, lo que facilita reproducir y extender el metodo.

## Benchmarks y rendimiento

Resultados de la model card (decodificacion greedy, n=250):

| Modelo | MGSM-fr (250) | French dev set (250) | MGSM-en (250) |
|---|---|---|---|
| Qwen2.5-Math-1.5B-Instruct (base) | 38,8% | 36,0% | 86,0% |
| v1 (2,7k ejemplos, solo opus-mt) | 57,6% | 57,2% | 85,6% |
| v2 (13,6k ejemplos, opus-mt + Luth) | 67,2% | 65,6% | 82,8% |
| v3 (este modelo) | 68,0% | 65,6% | 86,4% |

Resultados con votacion por mayoria (8 muestras, temperatura 0,7):

| Metrica | MGSM-fr | French dev set |
|---|---|---|
| greedy | 68,0% | 65,6% |
| single sample | 67,0% | 65,9% |
| vote@8 | 74,0% | 72,8% |
| pass@8 | 83,6% | 86,8% |

Comparativa con kurakurai/Luth-2-2B (modelo frances de 2B, greedy):

| Metrica | Este modelo (1,5B) | Luth-2-2B (2B) |
|---|---|---|
| MGSM-fr, greedy | 68,0% | 77,2% |
| MGSM-fr, vote@8 | 74,0% | 77,2% (greedy) |
| French MATH-500 (primeros 200) | 65,0% (medido en v1) | 62,0% |
| MGSM-en | 86,4% | 80,4% |

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo tiene 1,5B parametros. En bfloat16 requiere aproximadamente 3 GB de VRAM solo para los pesos, mas overhead de activaciones y cache KV. En cuantizacion de 8 bits rondaria los 1,5-2 GB, y en 4 bits alrededor de 1 GB (aunque no se documentan cuantizaciones oficiales).
- **GPU recomendadas**: cualquier GPU con al menos 8 GB de VRAM es suficiente para inferencia en bfloat16 con contexto moderado. Se ha entrenado en una RTX 5060 Ti de 16 GB.
- **Cabe en GPU de consumo**: si, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4090 (24 GB) y similares.
- **Opciones de despliegue**: transformers (documentado en la model card), text-generation-inference (tag `text-generation-inference`), y endpoints compatibles (tag `endpoints_compatible`). No se documenta soporte explicito de vLLM, llama.cpp ni Ollama en la informacion disponible.
- **Latencia y throughput**: no disponibles en la informacion proporcionada. El autor indica que la votacion por mayoria con 8 muestras cuesta 8 veces el computo de una respuesta greedy.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MGSM-fr | MGSM-en | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GAMINGZI/qwen2.5-math-1.5b-french | 1,5B | no disponible | 68,0% (greedy) / 74,0% (vote@8) | 86,4% | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-Math-1.5B-Instruct (base) | 1,5B | 32.768 (segun modelo base, no confirmado en esta ficha) | 38,8% | 86,0% | Apache 2.0 | Hugging Face |
| kurakurai/Luth-2-2B | 2B | no disponible | 77,2% (greedy) | 80,4% | no disponible | Hugging Face |

## Limitaciones y advertencias

- **Idioma de respuesta**: el modelo lee frances pero responde en ingles, porque fue entrenado para reproducir su propio razonamiento en ingles. No genera respuestas finales en frances.
- **Datos de entrenamiento traducidos automaticamente**: las preguntas de entrenamiento son traducciones automaticas (opus-mt y Luth-2-2B), lo que puede introducir artefactos o expresiones poco naturales en frances.
- **Brecha con modelos franceses mas grandes**: en MGSM-fr greedy, Luth-2-2B (2B) supera a este modelo en 9,2 puntos (77,2% frente a 68,0%). La brecha se reduce con vote@8 pero no es una comparacion equivalente.
- **Riesgo de alucinacion**: como todo modelo de lenguaje, puede generar razonamientos plausibles pero incorrectos, especialmente en problemas matematicos complejos o con contexto ambiguo.
- **Sesgos**: no se documentan sesgos especificos en la informacion disponible; al derivar de Qwen2.5-Math, hereda los sesgos del modelo base y de los datos de GSM8K.
- **Limitaciones de contexto**: no se especifica la longitud de contexto efectiva tras el ajuste; el modelo base soporta 32.768 tokens, pero no se confirma que se mantenga.
- **Ruido en las metricas**: el autor indica un ruido de aproximadamente ±3 puntos con n=250, por lo que las diferencias pequenas entre versiones deben interpretarse con cautela.
- **Licencia**: Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base Qwen2.5-Math-1.5B-Instruct y de los datos de GSM8K.
- **Uso en produccion**: la limitacion de responder en ingles puede ser un impedimento para aplicaciones dirigidas a usuarios francoparlantes que esperen respuestas en frances.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GAMINGZI/qwen2.5-math-1.5b-french
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B-Instruct/blob/main/LICENSE
- Modelo de comparacion Luth-2-2B: https://huggingface.co/kurakurai/Luth-2-2B
- Repositorio GitHub con codigo, evaluaciones y resultados negativos: https://github.com/GAMINGZIYADX/small-math-tuning
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
