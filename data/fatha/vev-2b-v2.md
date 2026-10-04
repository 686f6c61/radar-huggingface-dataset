# Fatha/vev-2b-v2

## Resumen

vev-2b-v2 es un modelo de vision-lenguaje de pequeno tamano (2,21 mil millones de parametros) especializado en tomar decisiones calibradas sobre una unica imagen. Dado un prompt con una imagen y una pregunta de tipo si/no o de eleccion multiple, el modelo devuelve una probabilidad calibrada sobre las opciones en lugar de una respuesta de texto libre. Lo desarrolla el autor Fatha y su proposito principal es la evaluacion automatizada de imagenes generadas por IA: coincidencia con el prompt, presencia de artefactos, texto renderizado, etc.

El modelo parte de Qwen/Qwen3.5-2B-Base, un modelo base multimodal de Qwen, y se ha afinado mediante un LoRA de rango 32 que posteriormente se ha fusionado en los pesos. El entrenamiento combino 846 pasos sobre 59.378 filas de conjuntos de datos publicos de imagenes individuales etiquetadas por humanos, sin datos de rating ni esteticos. La innovacion destacable es la capa de calibracion: se ajusto una unica temperatura (T = 1,695) sobre un split retenido de 1.999 ejemplos, almacenada en `vev_config.json`, que reduce el error de calibracion esperado (ECE) a 0,0172 con una precision de 0,902.

Es relevante ahora porque propone un enfoque de "modelo juez" pequeno y calibrado para auditar la salida de generadores de imagen, un nicho donde la mayoria de las alternativas son modelos mucho mas grandes. La contrapartida es una licencia restrictiva: aunque el codigo es Apache-2.0, los pesos heredan las condiciones de los conjuntos de datos de entrenamiento, algunos solo para investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje) basado en Qwen/Qwen3.5-2B-Base; el detalle de la arquitectura del base no esta disponible en la informacion proporcionada |
| Parametros totales | 2.213.241.664 (aprox. 2,2B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors de precision completa; no se incluyen versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | other / see-data-licenses (codigo Apache-2.0; pesos sujetos a las licencias de los datos de entrenamiento, ver DATA_LICENSES.md) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un derivado multimodal de Qwen/Qwen3.5-2B-Base, por lo que hereda una arquitectura transformer con capacidad de procesar imagenes y texto (pipeline `image-text-to-text`). Sobre ese base se aplico un LoRA de rango 32 que despues se fusiono en los pesos finales, de modo que el checkpoint publicado no requiere cargar adaptadores por separado. La tarea resultante no es generacion libre, sino clasificacion binaria o de eleccion multiple con salida de probabilidades.

El entrenamiento consto de 846 pasos sobre 59.378 filas de conjuntos de datos publicos con imagenes individuales etiquetadas por humanos, excluyendo explicitamente datos de rating o estetica. El elemento tecnico mas destacable es la calibracion posterior: se ajusto una temperatura unica (T = 1,695) sobre un split retenido de 1.999 ejemplos y se almaceno en `vev_config.json`, de forma que la probabilidad que emite el modelo en inferencia es directamente interpretable. No se especifica en la informacion disponible si hubo fases de RLHF o DPO.

## Capacidades

- Respuesta a preguntas de si/no sobre una imagen concreta.
- Respuesta a preguntas de eleccion multiple sobre una imagen concreta.
- Devolucion de probabilidades calibradas sobre las opciones, no solo la etiqueta ganadora.
- Evaluacion de coincidencia entre prompt e imagen generada.
- Deteccion de artefactos visuales en imagenes generadas.
- Verificacion de texto renderizado en imagenes.
- Procesamiento multimodal imagen-texto (pipeline `image-text-to-text`).
- Soporte conversacional (tag `conversational`), aunque el foco es la tarea de decision.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (idiomas no especificados).
- Modos especiales (thinking, audio, etc.): no disponibles; el unico modo documentado es la decision calibrada sobre una imagen.

## Casos de uso

- Auditoria de texto renderizado en imagenes generadas: el modelo permite comprobar mediante una pregunta de si/no o eleccion multiple si el texto de la imagen es legible y correcto, y devuelve una probabilidad calibrada que se puede usar como umbral en un pipeline de control de calidad.
- Control de calidad en pipelines de generacion de imagenes: dado un par prompt-imagen, el modelo evalua la coincidencia y permite descartar o marcar automaticamente resultados deficientes antes de llegar al usuario final.
- Deteccion de artefactos en modelos de difusion: como clasificador binario, permite etiquetar imagenes con manos, ojos o estructuras deformadas y priorizar revisiones.
- Benchmarking de generadores de imagen: al devolver probabilidades calibradas en lugar de texto, permite construir metricas agregadas comparables entre versiones de un mismo generador.
- Moderacion y filtrado de contenido visual en produccion: clasificacion rapida de imagenes frente a criterios definidos en forma de preguntas de si/no, con una probabilidad que facilita fijar umbrales de decision.
- Etiquetado asistido de datasets de vision: el modelo puede preanotar imagenes con respuestas de eleccion multiple para revision humana posterior, reduciendo el coste de anotacion.
- Verificacion de cumplimiento de requisitos de producto: comprobar si una imagen generada cumple condiciones concretas (presencia de marca, estilo, elementos obligatorios) formuladas como preguntas cerradas.

## Benchmarks y rendimiento

Unicos datos publicados en la informacion disponible (split de calibracion retenido de 1.999 ejemplos):

| Metrica | Antes de temperature scaling | Despues de temperature scaling |
|---|---|---|
| Precision (accuracy) | no disponible | 0,902 |
| ECE | no disponible | 0,0172 |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, MMMU u otros) ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 2,21 mil millones de parametros; no es un dato publicado por el autor): aproximadamente 4,5 GB en fp16, 2,3 GB en int8 y 1,2 GB en int4, sin contar el overhead de activaciones y del procesador de vision.
- GPU recomendadas: no especificadas por el autor. Por tamano, el modelo es apto para GPU de consumo como RTX 3060 12 GB, RTX 4070, RTX 4090, ademas de A100, H100 y L40S en entornos de servidor.
- Cabe en GPU de consumo: si, en la mayoria de GPU con 8 GB de VRAM o mas en fp16, y con holgura en cuantizacion de 8 o 4 bits.
- Opciones de despliegue: el autor proporciona su propio servidor mediante `vev.serve --run` en el repositorio https://github.com/Fathaah/vev; al ser un checkpoint `transformers` en safetensors, es compatible con despliegues estandar basados en Hugging Face Transformers. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no confirmada en la informacion disponible (no se publican pesos GGUF).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de modelos comparables documentados en la informacion proporcionada. A continuacion se compara unicamente con su modelo base, que es el unico referente directo disponible:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| vev-2b-v2 | 2,21B | no disponible | other / see-data-licenses | safetensors en Hugging Face |
| Qwen/Qwen3.5-2B-Base | no disponible | no disponible | no disponible en la informacion proporcionada | Hugging Face |

Modelos alternativos de vision-lenguaje para evaluacion de imagenes: no disponible.

## Limitaciones y advertencias

- Esta disenado para responder sobre una unica imagen por consulta; el comportamiento con multiples imagenes no esta documentado.
- La calibracion esta ajustada con una temperatura unica (T = 1,695) sobre un split concreto de 1.999 ejemplos; puede degradarse en dominios distintos a los de entrenamiento.
- Se entreno exclusivamente con datos de imagenes de conjuntos publicos etiquetados por humanos, sin datos de rating ni esteticos, por lo que no debe usarse para puntuar calidad estetica.
- Riesgo de alucinacion y de sesgo: no cuantificado ni documentado en la informacion disponible.
- Idiomas soportados no declarados; no se puede asumir cobertura multilingue.
- Longitud de contexto no especificada, lo que impide planificar usos con prompts largos.
- Restriccion de licencia relevante: aunque el codigo es Apache-2.0, los pesos derivan de datasets con terminos propios, algunos solo para investigacion. Es obligatorio revisar DATA_LICENSES.md antes de cualquier uso comercial.
- Solo se distribuyen pesos en safetensors de precision completa; no hay versiones cuantizadas oficiales, lo que limita el despliegue en entornos muy restringidos de memoria.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Fatha/vev-2b-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Codigo, serving, CLI y benchmark: https://github.com/Fathaah/vev
- Licencias de los datos de entrenamiento: https://github.com/Fathaah/vev/blob/main/DATA_LICENSES.md
