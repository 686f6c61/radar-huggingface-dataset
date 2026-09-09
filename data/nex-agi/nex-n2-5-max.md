# nex-agi/Nex-N2.5-Max

## Resumen

Nex-N2.5-Max es un modelo de lenguaje de mezcla de expertos (MoE) de 1,6 billones de parametros, presentado por Nex-AGI como parte de la familia Nex-N2.5. Esta familia incluye tres tamanos —mini, Pro y Max— y esta orientada a tareas agenticas de largo horizonte en entornos reales, como uso de ordenadores, navegacion web y ejecucion autonoma de programas. Nex-N2.5-Max es el modelo mas grande de la familia y, segun el autor, supone la primera vez que se completa un post-entrenamiento a escala de billones de parametros.

A diferencia de sus hermanos mini y Pro, que son multimodales, Nex-N2.5-Max es un modelo solo texto. Su publicacion es relevante para equipos que buscan un modelo de codigo abierto a escala de billones, con licencia Apache 2.0 y pesos en formato safetensors que ocupan aproximadamente 1,65 TB. Los benchmarks publicados se centran en coding, tareas agenticas y automatizacion, aunque la informacion disponible es parcial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (solo texto); identificado como deepseek_v4 en los metadatos |
| Parametros totales | 1.600.787.478.430 (1,6 billones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (indicado en los metadatos); no se documentan otros formatos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Nex-N2.5-Max emplea una arquitectura de Mixture-of-Experts (MoE) limitada a texto. En los metadatos de Hugging Face se etiqueta como deepseek_v4, lo que sugiere una base tecnica relacionada con la familia DeepSeek, aunque no se detallan los componentes concretos ni el numero de expertos.

El autor indica que el modelo se construye sobre un modelo fundacional MoE de 1,6 billones de parametros y que es la primera vez que se completa un post-entrenamiento a esa escala. No se proporcionan datos sobre el corpus de entrenamiento, el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas como RLHF o DPO. La familia Nex-N2.5 se ha desarrollado con enfasis en entornos agenticos, incluyendo operacion de computadoras, navegacion web, ejecucion y prueba de programas, y uso de retroalimentacion visual para verificar resultados; sin embargo, el modelo Max no incluye vision como entrada.

## Capacidades

- Generacion de texto y razonamiento para tareas complejas de planificacion y ejecucion autonoma.
- Disenado para tareas agenticas de largo horizonte, incluyendo la operacion de ordenadores y navegadores a traves de descripciones textuales del entorno.
- Capacidad para ejecutar y probar programas de forma autonoma, con potencial integracion en pipelines de desarrollo.
- Soporte de tool calling no documentado explicitamente, pero presumible por el diseno agentico y los benchmarks de automatizacion publicados.
- Modelo solo texto: no procesa imagenes. La integracion de informacion visual deberia realizarse mediante descripciones o representaciones textuales.

## Casos de uso

- Automatizacion de terminales y pipelines: el modelo puede ejecutar comandos, analizar salidas y corregir errores de forma iterativa, lo que lo hace util para tareas de administracion de sistemas y DevOps.
- Desarrollo de software autonomo: puede resolver incidencias en repositorios, generar parches y ejecutar pruebas de regresion, integrandose en flujos de CI/CD para revision y validacion de codigo.
- Navegacion web con descripciones textuales: en entornos donde la interfaz se representa en texto, puede extraer informacion, rellenar formularios y seguir flujos de navegacion para investigacion de mercado o comparativas de productos.
- Investigacion cientifica automatizada: puede analizar resultados experimentales, redactar hipotesis y ejecutar scripts de analisis, reduciendo el trabajo manual en tareas de laboratorio computacional.
- Productividad y trabajo administrativo: gestion de tickets, actualizacion de registros y generacion de informes a partir de grandes volumenes de datos textuales.
- Verificacion y evaluacion de codigo: por su capacidad de ejecutar y probar programas, puede actuar como revisor automatico en entornos de desarrollo, comprobando que los cambios cumplen los requisitos funcionales.

## Benchmarks y rendimiento

Los datos que se listan a continuacion se han extraido de la tabla publicada por el autor en la modelo card. No se dispone de resultados de benchmarks como MMLU, HumanEval o GSM8K en la informacion facilitada.

| Benchmark | Nex-N2.5-Max | Claude Opus 5 | DeepSeek-V4-Pro-0813 | Qwen3.8-Max |
|---|---|---|---|---|
| Terminal-Bench 2.1 | 86,1 | 89,1 | 87,9 | 86,6 |
| SWE-Bench Pro | 65,7 | 79,2 | 55,4 | 67,7 |
| DeepSWE v1.1 | 65,6 | 73,7 | 62,8 | 69,3 |
| AutomationBench v1.0.6 | 50,2 | 50,3 | 43,2 | 39,8 |

Estos resultados son parciales: el material disponible solo permite recuperar estas cuatro filas de la tabla original, que incluia tambien a GPT-5.6 Sol, Kimi-K3 y GLM-5.3, ademas de otros benchmarks no visibles.

## Requisitos de hardware

- El peso total del modelo en formato safetensors ocupa 1.654,6 GB, lo que equivale aproximadamente a 1,6 TB. Este volumen es coherente con una cuantizacion FP8.
- Para inferencia se necesita un cluster de GPUs de centro de datos. Con H100 o A100 de 80 GB, el modelo requiere al menos 20 tarjetas solo para cargar los pesos, sin contar las activaciones y la cache KV, por lo que en la practica se necesitarian entre 24 y 32 GPUs.
- No es viable desplegarlo en una GPU consumer como una RTX 4090 o similar.
- Opciones de despliegue recomendadas: vLLM o TGI con tensor parallelism, dado que los pesos estan en safetensors y el repositorio es compatible con la libreria transformers. llama.cpp no es una alternativa practica para este tamano de modelo.
- Latencia y throughput: no disponible en la informacion consultada.

## Comparativa con modelos similares

No se dispone de especificaciones completas de los modelos comparables en la informacion proporcionada. Los competidores que aparecen en los benchmarks del autor son Claude Opus 5, GPT-5.6 Sol, Kimi-K3, GLM-5.3, DeepSeek-V4-Pro-0813 y Qwen3.8-Max, pero de ellos no se conocen parametros totales, longitud de contexto ni licencia.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Nex-N2.5-Max | 1,6 billones | no disponible | Apache 2.0 | Abierto (Hugging Face, ModelScope) |
| Claude Opus 5 | no disponible | no disponible | no disponible | no disponible |
| DeepSeek-V4-Pro-0813 | no disponible | no disponible | no disponible | no disponible |
| Qwen3.8-Max | no disponible | no disponible | no disponible | no disponible |

La comparacion de rendimiento parcial se expone en la seccion de benchmarks.

## Limitaciones y advertencias

- Modelo exclusivamente textual: no tiene capacidades de vision, a diferencia de los modelos nex-N2.5-mini y nex-N2.5-Pro.
- La longitud de contexto no se ha publicado, lo que impide evaluar su idoneidad para tareas de ventana muy larga.
- No se han publicado datos sobre sesgos, alucinaciones ni evaluaciones de seguridad en el material consultado.
- Los detalles del proceso de post-entrenamiento (RLHF, DPO, etc.) no se han comunicado, lo que limita la evaluacion de su alineacion.
- El tamano de 1,6 billones de parametros implica una infraestructura costosa y dificil de mantener; no es apto para despliegues locales.
- Al estar orientado a tareas agenticas, su uso sin un entorno aislado (sandbox) puede provocar acciones no deseadas en sistemas reales.
- Los benchmarks publicados son parciales, proceden del propio autor y no han sido auditados de forma independiente.

## Enlaces

- Hugging Face: https://huggingface.co/nex-agi/Nex-N2.5-Max
- GitHub: https://github.com/nex-agi/Nex-N2.5
- Coleccion Hugging Face de Nex-N2.5: https://huggingface.co/collections/nex-agi/nex-n25
- Web de Nex-AGI: https://nex-agi.com/
- ModelScope: https://modelscope.cn/models/nex-agi/Nex-N2.5-Max
- Hosting en OpenRouter de Nex-N2.5-Pro: https://openrouter.ai/nex-agi/nex-n2.5-pro
- Hosting en OpenRouter de Nex-N2.5-mini: https://openrouter.ai/nex-agi/nex-n2.5-mini
