# ScottzillaSystems/Qwen3.8-Flash-Next-CYBERSECURITY-NVFP4

## Resumen

Qwen3.8-Flash-Next-CYBERSECURITY-NVFP4 es un derivado del modelo base Qwen/Qwen3.8-Flash-Next publicado por la organizacion ScottzillaSystems (la model card atribuye el trabajo al usuario dealignai). Se trata de un artefacto de red-team: se han eliminado los rechazos de seguridad mediante una modificacion directa de los pesos (abliteration), sin fine-tuning, LoRA, destilacion ni datos sinteticos, y sin trucos de plantilla de chat o de system prompt. El modelo conserva la multimodalidad completa (imagen y video), los modos de razonamiento off/low/xhigh y la decodificacion especulativa MTP del modelo base, y se distribuye cuantizado en NVFP4 (4 bits).

El modelo tiene 119.602.003.859 parametros (unos 119,6 B) y un repositorio de 135,2 GB. La libreria declarada es SGLang, y el autor indica que se sirve con paralelismo de tensores sobre 2 nodos NVIDIA DGX Spark (GB10). La licencia declarada es qwen-community-license-1.0, bajo la etiqueta generica license: other.

Su relevancia es doble. Por un lado, es un ejemplo de build "sin censura" orientado a investigacion de seguridad ofensiva, con metricas de cumplimiento en HarmBench-320 proximas al 100% en las categorias de cibercrimen e intrusion y de quimica/biologia, y cero rechazos duros en todos los niveles de razonamiento. Por otro, documenta el coste de la intervencion sobre los pesos: el MMLU-logit cae 0,84 puntos porcentuales respecto al base en NVFP4, con regresiones notables en asignaturas concretas (machine_learning -22,5 pp, moral_scenarios -17,5 pp) y mejoras en otras (high_school_biology +10,0 pp). El repositorio no tiene descargas ni likes en el momento de la consulta, por lo que no existe validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (transformer multimodal con razonamiento y decodificacion especulativa MTP; no se especifica si es densa o MoE) |
| Parametros totales | 119.602.003.859 (~119,6 B) |
| Parametros activos | No disponible (no se confirma que la arquitectura sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, float). Las etiquetas incluyen tambien 8-bit y modelopt |
| Idiomas soportados | No disponible (no se documentan; en la evaluacion aparece al menos una respuesta coherente en chino) |
| Licencia | qwen-community-license-1.0 (etiqueta license: other) |
| Formato de pesos | safetensors (libreria declarada: sglang) |

## Arquitectura y entrenamiento

No se dispone de la ficha tecnica del modelo base Qwen/Qwen3.8-Flash-Next en la informacion proporcionada, por lo que no se detallan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. Lo que si se documenta del derivado es que mantiene tres capacidades estructurales del base: multimodalidad completa (entrada de imagen y video, pipeline image-text-to-text), modos de razonamiento configurables (off, low, xhigh) y decodificacion especulativa basada en MTP (multi-token prediction), que acelera la generacion al predecir varios tokens por paso. La cuantizacion NVFP4 se ha generado con el flujo de ModelOpt, segun las etiquetas del repositorio.

La intervencion sobre el modelo no es un entrenamiento: el autor la describe como una modificacion a nivel de pesos que elimina los rechazos y funciona con la plantilla de chat estandar y el system prompt por defecto. El autor afirma que se preservan conocimiento, estilo, razonamiento y calibracion, y respalda esa afirmacion con dos mediciones: en preguntas duras de varios pasos (matematicas, fisica y quimica universitarias, logica formal) a esfuerzo xhigh y decodificacion greedy, la longitud mediana de la traza de razonamiento es de 422 tokens frente a 434 del base (0,97x) y la precision de respuesta sube de 96,7% a 98,3%; en MMLU-logit (n=40 por asignatura, 2280 preguntas, greedy, 0 errores) el resultado global pasa de 82,11% en el base NVFP4 a 81,27%, una caida de 0,84 pp.

## Capacidades

- Generacion de texto conversacional multiturno (pipeline declarado: image-text-to-text, con etiqueta conversational).
- Razonamiento multi-paso con tres niveles de esfuerzo seleccionables: off, low y xhigh.
- Vision: entrada de imagenes, conservada del modelo base.
- Video: la model card indica que la multimodalidad completa (imagen + video) se mantiene.
- Decodificacion especulativa MTP integrada, orientada a reducir la latencia de generacion.
- Cumplimiento de peticiones tecnicamente daninas: 91,2% de TRUE_COMPLY en las 240 conductas de dano real de HarmBench-320 (excluyendo copyright) con razonamiento off y xhigh, y 92,5% con low, sin ningun rechazo duro.
- Cumplimiento casi total en las categorias prioritarias declaradas: cibercrimen/intrusion (52/52 con off y low, 51/52 con xhigh) y quimica/biologia (41/42 con off, 42/42 con low, 41/42 con xhigh).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: el autor menciona razonamiento multi-paso, pero no se documenta un modo agente ni llamadas a herramientas.
- Capacidades multilingues: no disponibles; solo se constata una respuesta coherente en chino en el conjunto de evaluacion.

## Casos de uso

- Red-teaming de modelos y clasificadores de seguridad: el artefacto sirve como generador adversario con cumplimiento medido y reproducible en HarmBench-320, lo que permite calibrar filtros de entrada/salida contra un atacante de 119,6 B cuantizado en 4 bits.
- Evaluacion de robustez de guardarrailes en produccion: al tener cero rechazos duros en todos los niveles de razonamiento, se puede usar para generar lotes de prompts daninos y medir la tasa de deteccion del sistema defensivo desplegado.
- Investigacion en alineacion y abliteration: el repositorio publica el delta exacto de MMLU-logit y de longitud de traza de razonamiento respecto al base, lo que lo convierte en un caso de estudio cuantificado sobre que se pierde al eliminar los rechazos a nivel de pesos.
- Analisis de seguridad ofensiva en laboratorio: simulacion de escenarios de intrusion y de abuso tecnico en entornos aislados, con la ventaja de que el modelo no interrumpe la cadena de razonamiento con negativas.
- Auditoria de contenido y moderacion: empleo del propio modelo como fuente de casos limite etiquetados (TRUE_COMPLY, SOFT_REFUSE, DEFLECT, REDIRECT, HARD_REFUSE) para entrenar o validar clasificadores de cumplimiento.
- Procesamiento multimodal de documentos: la entrada de imagen y video permite extraer y razonar sobre capturas, diagramas o fotogramas en tareas de analisis tecnico, con la salvedad de que no se documenta la longitud de contexto.
- Despliegue interno de alto rendimiento: el NVFP4 mas MTP esta pensado para servir en hardware Blackwell con SGLang en paralelismo de tensores; encaja en escenarios donde la latencia por token es critica y el cumplimiento estricto de politicas no es un requisito.

## Benchmarks y rendimiento

Fidelidad de razonamiento frente al base (preguntas duras multi-paso de matematicas, fisica y quimica universitarias y logica formal; esfuerzo xhigh, greedy):

| Metrica | Base | Este build |
|---|---|---|
| Longitud mediana de la traza de razonamiento | 434 tokens | 422 tokens (0,97x) |
| Precision de respuesta | 96,7% | 98,3% |

MMLU-logit (mismo harness, n=40 por asignatura, 2280 preguntas, greedy, 0 errores):

| Metrica | Base (NVFP4) | Este build | Delta |
|---|---|---|---|
| MMLU global | 82,11% | 81,27% | -0,84 pp |

Mayores variaciones por asignatura:

| Mejora | Delta (pp) | Regresion | Delta (pp) |
|---|---|---|---|
| high_school_biology | +10,0 | machine_learning | -22,5 |
| college_medicine | +7,5 | moral_scenarios | -17,5 |
| global_facts | +7,5 | moral_disputes | -12,5 |
| high_school_chemistry | +7,5 | professional_accounting | -10,0 |
| high_school_physics | +7,5 | virology | -10,0 |
| human_aging | +7,5 | college_mathematics | -7,5 |

31 de las 57 asignaturas se mantuvieron o mejoraron.

HarmBench-320, juicio en 4 cubos (greedy, temperatura 0). TRUE_COMPLY por esfuerzo de razonamiento en las 240 conductas de dano real (excluye copyright):

| Esfuerzo | TRUE_COMPLY | SOFT_REFUSE | DEFLECT | REDIRECT | HARD_REFUSE |
|---|---|---|---|---|---|
| off | 219/240 (91,2%) | 19 | 1 | 1 | 0 |
| low | 222/240 (92,5%) | 18 | 0 | 0 | 0 |
| xhigh | 219/240 (91,2%) | 20 | 1 | 0 | 0 |

Categorias prioritarias (TRUE_COMPLY):

| Esfuerzo | Cibercrimen / intrusion | Quimica / biologia |
|---|---|---|
| off | 52/52 (100%) | 41/42 (98%) |
| low | 52/52 (100%) | 42/42 (100%) |
| xhigh | 51/52 (98%) | 41/42 (98%) |

No se han publicado en la informacion disponible resultados de HumanEval, GSM8K, MMLU-Pro ni otros benchmarks estandar de codigo o matematicas. La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo.

## Requisitos de hardware

- VRAM estimada para los pesos: con 119,6 B de parametros en NVFP4 (4 bits), el peso teorico ronda los 60 GB. Es una estimacion de calculo, no un dato publicado; el repositorio ocupa 135,2 GB, un tamano superior al de los pesos en 4 bits, probablemente por ficheros adicionales o mayor precision en algunas capas.
- VRAM total para servicio: a los pesos hay que sumar la cache KV, cuyo tamano no puede calcularse porque no se publica la longitud de contexto. Como referencia, el autor declara un despliegue en 2 nodos DGX Spark (GB10), cada uno con memoria unificada de gran capacidad.
- GPU recomendadas: el formato NVFP4 esta asociado al hardware NVIDIA Blackwell (serie GB200/GB10, RTX 50). El autor usa 2x NVIDIA DGX Spark (GB10). No se documenta soporte en A100, H100 ni RTX 4090; en arquitecturas anteriores a Blackwell la cuantizacion NVFP4 requeriria de-cuantizar o reconvertir, algo no documentado por el autor.
- Cabe en GPU de consumo: no disponible como dato confirmado. Por tamano (unos 60 GB solo en pesos) no cabe en una GPU de consumo de 24 GB, y probablemente tampoco en una de 32 GB sin offload.
- Opciones de despliegue: SGLang es la via documentada por el autor, con paralelismo de tensores. La etiqueta library_name es sglang y el repositorio incluye safetensors. No se documentan GGUF, llama.cpp, Ollama ni TGI; sin GGUF publicado, la ruta de llama.cpp no esta disponible de forma directa.
- Latencia y throughput: no disponible. El autor menciona MTP (decodificacion especulativa) como mecanismo de aceleracion, pero no publica cifras de tokens por segundo ni de TTFT.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este build (CYBERSECURITY NVFP4) | 119,6 B | No disponible | MMLU-logit 81,27%; TRUE_COMPLY 91,2-92,5% en HarmBench-320 | qwen-community-license-1.0 (license: other) | HuggingFace, safetensors, SGLang; 0 descargas |
| Qwen/Qwen3.8-Flash-Next (base, NVFP4) | No disponible | No disponible | MMLU-logit 82,11%; precision 96,7% en razonamiento duro | No disponible en la informacion proporcionada | Referenciado como base_model |
| Otras alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No se proporciono informacion de otros modelos comparables |

La unica comparacion con datos es contra el propio modelo base, en el que se apoya toda la evidencia publicada. No hay datos de modelos abliterated comparables ni de otros builds de la misma familia en la informacion disponible.

## Limitaciones y advertencias

- Artefacto sin censura declarado explicitamente por el autor: el modelo cumple con peticiones daninas, poco eticas o ilegales. Esta liberado para investigacion de seguridad, red-teaming y evaluacion, y el autor declara que el usuario es el unico responsable del contenido generado.
- Riesgo legal alto: el propio autor advierte de la obligacion de cumplir toda la legislacion aplicable. El uso en produccion en jurisdicciones con normativa sobre IA o sobre contenidos ilicitos exige una evaluacion legal previa.
- Degradacion medible en conocimiento: MMLU-logit cae 0,84 pp en global, con regresiones severas en machine_learning (-22,5 pp), moral_scenarios (-17,5 pp), moral_disputes (-12,5 pp), professional_accounting (-10,0), virology (-10,0) y college_mathematics (-7,5). El modelo es menos fiable que el base en esas areas.
- Sesgos y comportamiento moral: la intervencion sobre los pesos afecta justamente a las asignaturas de razonamiento moral, lo que sugiere que la eliminacion de rechazos altera el juicio normativo del modelo. No se publica una evaluacion especifica de sesgos demograficos.
- Riesgo de alucinacion: no se documenta ninguna evaluacion de factualidad ni de tasas de alucinacion. La unica metrica de conocimiento es MMLU-logit, que mide probabilidades de respuesta y no verificacion factual.
- Contexto e idiomas sin documentar: no se publica la longitud de contexto, lo que impide planificar despliegues con requisitos de ventana larga, ni la lista de idiomas soportados.
- Licencia restrictiva: qwen-community-license-1.0 con etiqueta license: other. Hay que revisar sus condiciones antes de cualquier uso comercial; la licencia del derivado no exime de las obligaciones de la licencia del modelo base.
- Trazabilidad y autoría confusa: el repositorio pertenece a la organizacion ScottzillaSystems, mientras que la model card atribuye el trabajo a dealignai y enlaza a su perfil. Conviene verificar la procedencia antes de integrarlo en cualquier pipeline.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta. No hay revision independiente de las metricas publicadas ni de la integridad de los pesos.
- Requisitos de hardware poco habituales: el flujo documentado depende de hardware Blackwell (2x DGX Spark) y de SGLang; no se publican rutas de despliegue alternativas ni ficheros GGUF.
- Limitacion practica en produccion: la ausencia de rechazos y de parametros de seguridad obliga a envolver el modelo con un filtro externo de entrada y salida si se va a exponer a usuarios finales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ScottzillaSystems/Qwen3.8-Flash-Next-CYBERSECURITY-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Perfil del autor citado en la model card: https://huggingface.co/dealignai
- Twitter del autor citado en la model card: https://twitter.com/dealignai
- Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo (unicamente paginas de soporte de Microsoft sin relacion con el contenido). No hay papers, blogs, repositorios de codigo ni demos adicionales disponibles en la informacion proporcionada.
