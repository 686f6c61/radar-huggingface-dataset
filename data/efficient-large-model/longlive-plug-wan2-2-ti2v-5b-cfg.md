# Efficient-Large-Model/LongLive-Plug-Wan2.2-TI2V-5B-cfg

## Resumen

LongLive-Plug-Wan2.2-TI2V-5B-cfg es un adaptador LoRA publicado por el equipo Efficient-Large-Model sobre el modelo de generacion de video Wan-AI/Wan2.2-TI2V-5B. Su funcion concreta es destilar classifier-free guidance (CFG) hacia una generacion puramente condicional, de modo que la inferencia deje de necesitar una rama incondicional separada. No es un modelo autonomo: es un conjunto de pesos de adaptador (PEFT) que requiere el modelo base para funcionar.

El problema que aborda es de coste computacional. La generacion con CFG clasica evalua el modelo dos veces por paso de denoising (una condicional y otra incondicional), lo que duplica el trabajo por paso. Este adaptador traslada ese comportamiento a la ruta condicional, con el objetivo declarado de reducir la necesidad de esa segunda rama.

Es relevante dentro del ecosistema de video generativo open source porque se combina con un segundo adaptador, LongLive-Plug-Wan2.2-TI2V-5B-few-step, para acelerar la inferencia. Segun la model card, el adaptador por si solo no aporta aceleracion de pocos pasos y la relacion de pesos LoRA recomendada es few-step : CFG = 1 : 0.5. El repositorio ocupa 1,3 GB, esta licenciado bajo Apache-2.0 y fue creado y actualizado el 29 de septiembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el modelo de difusion de video Wan2.2-TI2V-5B; no se detalla la arquitectura interna del backbone en la informacion disponible |
| Parametros totales | No disponible para el adaptador. El modelo base es de 5B de parametros (segun la nomenclatura TI2V-5B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no aplica como ventana de tokens; el pipeline es image-to-video) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA/PEFT) |
| Libreria | peft |
| Pipeline | image-to-video |
| Modelo base | Wan-AI/Wan2.2-TI2V-5B (relacion: adapter) |
| Tamano del repositorio | 1,3 GB |
| Fecha de creacion / actualizacion | 2026-09-29 / 2026-09-29 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del backbone Wan2.2-TI2V-5B ni los detalles del proceso de entrenamiento del adaptador (numero de pasos, dataset, numero de tokens o muestras de video). Lo que si se explicita es la tecnica empleada: destilacion de classifier-free guidance, etiquetada en el repositorio como "distillation" y "cfg-distillation". El objetivo es que el modelo condicional aprenda el efecto de la guia, eliminando la necesidad de evaluar una rama incondicional adicional durante la inferencia.

El adaptador se distribuye como pesos LoRA en formato safetensors dentro del ecosistema PEFT y esta disenado para usarse junto con el LoRA de pocos pasos del mismo autor. La model card indica que el adaptador no proporciona aceleracion de pocos pasos por si mismo y que la relacion recomendada de pesos LoRA es few-step : CFG = 1 : 0,5, aclarando de forma explicita que esos pesos no equivalen al valor de escala CFG de inferencia.

## Capacidades

- Generacion de video a partir de imagen (image-to-video) al aplicarse sobre el modelo base Wan2.2-TI2V-5B.
- Destilacion de classifier-free guidance: permite generar en ruta condicional sin una rama incondicional separada.
- Combinacion con un LoRA de pocos pasos del mismo autor para configurar un pipeline acelerado.
- Reduccion del coste por paso de denoising al eliminar la segunda evaluacion tıpica de CFG, segun el objetivo declarado del adaptador.
- No se documentan capacidades de texto, codigo, matematicas, tool calling, agentes, vision general ni audio.
- No se documentan capacidades multilingues; el campo de idiomas no esta disponible.
- No se documenta un modo "thinking" ni ningun mecanismo de razonamiento explicito.

## Casos de uso

- Generacion de video a partir de imagenes fijas en produccion: el adaptador se aplica sobre Wan2.2-TI2V-5B para producir clips animados desde una imagen de entrada, reduciendo el numero de evaluaciones por paso al prescindir de la rama incondicional de CFG.
- Aceleracion de pipelines de inferencia combinada: usar este LoRA junto con LongLive-Plug-Wan2.2-TI2V-5B-few-step con la relacion 1 : 0,5 permite construir un flujo de pocos pasos sin rama incondicional, adecuado cuando la latencia es el cuello de botella.
- Previsualizacion de storyboards y animaticos: convertir fotogramas clave en clips cortos para validar encuadres y ritmo antes de producir la animacion final.
- Contenido para marketing y redes sociales: animar imagenes de producto o ilustraciones para generar piezas de video cortas dentro de un pipeline automatizado.
- Prototipado e investigacion en destilacion de guia: sirve como referencia reproducible para estudiar la destilacion de CFG en modelos de difusion de video y comparar el comportamiento condicional frente al uso clasico de CFG.
- Integracion en herramientas de generacion de video con presupuesto de computo ajustado: al no requerir la segunda rama, el coste por paso es menor que en una inferencia con CFG estandar con batch duplicado.
- Despliegue de demostraciones de image-to-video: el repositorio ocupa 1,3 GB, lo que facilita su distribucion junto al modelo base en entornos de demo o de evaluacion interna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FVD, CLIP score, VBench u otras), ni comparativas numericas frente a la inferencia con CFG completa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia de orden de magnitud, el modelo base es de 5B de parametros, por lo que el consumo dependera de la precision y de la resolucion y duracion del video generado; estos valores no estan documentados para este adaptador.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no se puede confirmar sin datos de consumo de VRAM del modelo base.
- Opciones de despliegue: el adaptador es un LoRA de PEFT en safetensors, por lo que se carga mediante la libreria peft junto con el modelo base (habitualmente a traves del pipeline de difusion correspondiente). No se documentan integraciones especificas con vLLM, llama.cpp, Ollama o TGI, que ademas no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tiempo por paso ni de velocidad de generacion.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LongLive-Plug-Wan2.2-TI2V-5B-cfg | Adaptador LoRA (PEFT) | No disponible (base de 5B) | Destilacion de CFG a generacion condicional | Apache-2.0 | HuggingFace (Efficient-Large-Model) |
| LongLive-Plug-Wan2.2-TI2V-5B-few-step | Adaptador LoRA (PEFT) | No disponible (base de 5B) | Aceleracion de pocos pasos | Apache-2.0 | HuggingFace (Efficient-Large-Model) |
| Wan-AI/Wan2.2-TI2V-5B | Modelo de difusion de video | 5B | Generacion image-to-video de referencia | No disponible en la informacion proporcionada | HuggingFace (Wan-AI) |

No se dispone de comparativas de rendimiento entre estas variantes ni frente a otros modelos de generacion de video de tamano similar, ya que no se han publicado metricas en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo autonomo: es un adaptador y requiere obligatoriamente el modelo base Wan-AI/Wan2.2-TI2V-5B.
- No aporta aceleracion de pocos pasos por si mismo; para ello debe combinarse con LongLive-Plug-Wan2.2-TI2V-5B-few-step.
- La relacion recomendada de pesos LoRA (few-step : CFG = 1 : 0,5) no debe confundirse con el valor de escala CFG de inferencia, tal y como advierte la model card.
- No se documentan datos de sesgo, calidad de video, coherencia temporal ni tipos de artefactos generados.
- Riesgo de alucinacion visual y de inconsistencias temporales: no cuantificado, ya que no hay evaluaciones publicadas en la informacion disponible.
- No hay informacion sobre idiomas soportados ni sobre el tratamiento de prompts de texto.
- No se documentan limitaciones de resolucion, duracion de clip o relacion de aspecto.
- Licencia Apache-2.0, que en principio permite uso comercial; conviene verificar igualmente las condiciones del modelo base Wan2.2-TI2V-5B, cuya licencia no se detalla en la informacion proporcionada.
- El modelo registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad ni reportes independientes de comportamiento en produccion.
- No se han publicado benchmarks ni comparativas de rendimiento, lo que dificulta estimar la perdida de calidad respecto a la inferencia con CFG completa.
- La unica fecha disponible (2026-09-29) corresponde a la creacion y actualizacion del repositorio; no hay historial de versiones documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Efficient-Large-Model/LongLive-Plug-Wan2.2-TI2V-5B-cfg
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- LoRA de pocos pasos recomendado: https://huggingface.co/Efficient-Large-Model/LongLive-Plug-Wan2.2-TI2V-5B-few-step
- Paper: no disponible
- Repositorio de codigo: no disponible
- Demos: no disponible
- Nota sobre la busqueda web: los resultados obtenidos corresponden a definiciones de diccionario de la palabra "efficient" y no aportan informacion tecnica relevante sobre el modelo.
