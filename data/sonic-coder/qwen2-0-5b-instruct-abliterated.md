# sonic-coder/Qwen2-0.5B-Instruct-Abliterated

## Resumen

El modelo `sonic-coder/Qwen2-0.5B-Instruct-Abliterated` es una version modificada del modelo `Qwen2-0.5B-Instruct` de Alibaba. Esta modificacion, conocida como "abliteracion", elimina parte del comportamiento de rechazo alineado del modelo original, de modo que responde a peticiones que el modelo base normalmente declina. El autor del repositorio es el usuario `sonic-coder`, que ha aplicado el procedimiento de `augmxnt/Qwen2-7B-Instruct-deccp`, con codigo disponible en el repositorio GitHub AUGMXNT/deccp, incorporando ademas lineas del dataset `mlabonne/harmful_behaviors` en el fichero `harmful.txt`. El resultado es un modelo de 494 millones de parametros (0.5B) que conserva la arquitectura base de Qwen2.

El modelo esta dirigido principalmente a investigacion en interpretabilidad, alineamiento y comportamiento de modelos pequenos, asi como a casos de uso que requieran una generacion de texto sin las restricciones de contenido del modelo original. Su tamano reducido lo hace apto para entornos con pocos recursos, aunque la informacion publicada no incluye especificaciones completas de contexto ni datos de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen2) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen2-0.5B-Instruct`, un modelo de lenguaje basado en transformer decoder-only. Despues de la publicacion del modelo original, el autor aplica una tecnica de abliteracion que altera los pesos en determinadas capas o direcciones del espacio de activaciones para suprimir el patron de rechazo en las respuestas. El procedimiento es el mismo que emplea el repositorio `augmxnt/deccp`, complementado con ejemplos extraidos del dataset `mlabonne/harmful_behaviors`.

La informacion disponible no incluye detalles sobre el proceso exacto de abliteracion aplicado, el numero de capas modificadas ni los datos utilizados en el ajuste posterior. El modelo se distribuye en formato safetensors y es compatible con la libreria transformers, segun las etiquetas publicadas en Hugging Face.

## Capacidades

- Generacion de texto conversacional, heredada de la version instruct original de Qwen2.
- Respuesta "sin rechazo" en escenarios donde el modelo base podria denegar la peticion, gracias a la abliteracion.
- Compatibilidad con el pipeline de `text-generation` y la libreria `transformers`.
- Capacidades de funcion calling, soporte de agentes, vision o audio: no disponible.
- Capacidades multilingues: no disponibles en la informacion publicada.
- Modo de razonamiento especial o 'thinking mode': no disponible.

## Casos de uso

- Investigacion en interpretabilidad y alineamiento: el modelo permite comparar respuestas antes y despues de la abliteracion en modelos pequenos, lo que resulta util para estudiar como se codifica el rechazo en los pesos.
- Prototipos de chatbots locales sin restricciones de contenido: su tamano reducido y su licencia Apache 2.0 facilitan su integracion en aplicaciones donde se requiera un control manual sobre los comportamientos de rechazo.
- Experimentos de 'uncensoring' en modelos pequenos: sirve como referencia para probar tecnicas de modificacion de pesos aplicables a modelos de mayor escala.
- Generacion de texto en entornos con recursos limitados: al tener 494 millones de parametros puede ejecutarse en CPU, Raspberry Pi o GPUs modestas.
- Analisis de riesgos de seguridad: permite evaluar que tipo de contenidos nocivos puede generar un modelo desprovisto de alineamiento, util en auditorias de seguridad y en el diseno de sistemas de deteccion.
- Fine-tuning ligero: su licencia permisiva y su formato safetensors facilitan el ajuste posterior con pocos datos, por ejemplo para tareas de estilo o generacion creativa en entornos academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 494 millones de parametros, lo que en precision FP16 equivale a aproximadamente 0,99 GB de memoria. En cuantizacion de 8 bits el requisito seria de unos 0,5 GB, aunque no se proporcionan pesos cuantizados en el repositorio.
- GPU recomendadas: cualquier GPU de consumo con al menos 1-2 GB de VRAM, como una NVIDIA GTX 1050, RTX 3050 o una integrada con memoria compartida. Tambien es viable su ejecucion en CPU.
- Si cabe en GPU de consumo: si, es un modelo claramente compatible con hardware de nivel de consumo.
- Opciones de despliegue: se puede cargar con `transformers`, `transformers.js` en el navegador, `vLLM` o `text-generation-inference`. El repositorio incluye las etiquetas `text-generation-inference` y `endpoints_compatible`, lo que sugiere compatibilidad con la API de Inference Endpoints de Hugging Face.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Abliterado |
|---|---|---|---|---|---|
| `sonic-coder/Qwen2-0.5B-Instruct-Abliterated` | 494M | Qwen2 | no disponible | Apache 2.0 | si |
| `Qwen/Qwen2-0.5B-Instruct` | 494M | Qwen2 | no disponible | Apache 2.0 | no |
| `trollek/Qwen2-1.5B-Instruct-Abliterated` | 1.5B | Qwen2 | no disponible | Apache 2.0 | si |
| `augmxnt/Qwen2-7B-Instruct-deccp` | 7B | Qwen2 | no disponible | Apache 2.0 | si |

La comparacion se limita a modelos de la misma familia Qwen2 o a versiones abliteadas, ya que no se dispone de datos de contexto ni de benchmarks. La diferencia de tamano entre las variantes de 0.5B, 1.5B y 7B implica distintos requisitos de hardware y una calidad de generacion esperablemente superior en los modelos mas grandes.

## Limitaciones y advertencias

- El modelo ha sido modificado deliberadamente para eliminar parte de la alineacion de seguridad. Como resultado, puede generar contenido dañino, ilegal u ofensivo sin las barreras que presenta el modelo base.
- Riesgo de alucinacion: no se han publicado datos de evaluacion, por lo que es previsible que el modelo presente alucinaciones, especialmente en tareas de razonamiento o factuales, dada su pequeña escala.
- Sesgos del modelo base: no hay evidencia de que el proceso de abliteracion corrija los sesgos presentes en `Qwen2-0.5B-Instruct`; estos pueden persistir e incluso verse amplificados en las respuestas sin rechazo.
- Idiomas soportados: no se proporciona informacion, aunque el modelo base Qwen2 es multilingue, la abliteracion puede haber afectado de forma desigual a distintos idiomas.
- Licencia Apache 2.0 permite uso comercial, pero la etiqueta `not-for-all-audiences` advierte de que el contenido generado puede no ser apropiado para todos los publicos.
- Validacion limitada: no se incluyen referencias a pruebas o resultados de control de calidad, lo que dificulta su uso en produccion sin una evaluacion propia.

## Enlaces

- Repositorio en Hugging Face: [sonic-coder/Qwen2-0.5B-Instruct-Abliterated](https://huggingface.co/sonic-coder/Qwen2-0.5B-Instruct-Abliterated)
- Modelo base original: [Qwen/Qwen2-0.5B-Instruct](https://huggingface.co/Qwen/Qwen2-0.5B-Instruct)
- Repositorio del proyecto deccp: [https://github.com/AUGMXNT/deccp](https://github.com/AUGMXNT/deccp)
- Dataset de comportamientos dañinos usado: [mlabonne/harmful_behaviors](https://huggingface.co/datasets/mlabonne/harmful_behaviors)
- Modelo similar de referencia: [trollek/Qwen2-1.5B-Instruct-Abliterated](https://huggingface.co/trollek/Qwen2-1.5B-Instruct-Abliterated)
