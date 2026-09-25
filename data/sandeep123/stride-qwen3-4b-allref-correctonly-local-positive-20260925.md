# sandeep123/stride-qwen3-4b-allref-correctonly-local-positive-20260925

## Resumen

`stride-qwen3-4b-allref-correctonly-local-positive-20260925` es un adaptador LoRA de PEFT entrenado por el usuario `sandeep123` sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`. No es un modelo completo, sino un conjunto de pesos de adaptador (0,4 GB de repositorio) que debe cargarse sobre el modelo base fijado en la revisión `cdbee75f17c01a7cc42f958dc650907174af0554`. Su propósito es experimental: investigar la estabilidad del aprendizaje por refuerzo con asignación de crédito a nivel de paso local mediante la variante STRIDE sobre GRPO, aplicada a problemas matemáticos.

El experimento entrena en modo "nonthinking" (`enable_thinking=False`) sobre una partición de 2.048 preguntas, con 64 preguntas por lote global y ocho rollouts por pregunta (512 respuestas por actualización), 32 actualizaciones por época y 128 actualizaciones planificadas en 4 épocas. La innovación declarada es que todos los rollouts elegibles definen la novedad, pero solo los rollouts correctos reciben la bonificación de crédito local. La ventana de prompt más respuesta está limitada a 8.192 tokens.

Es relevante ahora como artefacto de reproducibilidad: el autor publica cada adaptador de actualización del optimizador, incluida la actualización cero (adaptador sin entrenar), junto con manifiestos SHA256, el tokenizador, la plantilla de chat y el par de reanudación completo de la última época. El propio autor declara explícitamente que no se hace ninguna afirmación de evaluación ni de superioridad, y que las respuestas finales correctas no verifican cada paso intermedio de la demostración. Al 25 de septiembre de 2026 el repositorio acumula 0 descargas y 0 "likes".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) con adaptador LoRA acoplado mediante PEFT |
| Parametros totales | Aproximadamente 4.000 millones en el modelo base; el adaptador LoRA usa rango 16, con alpha 32. El numero exacto de parametros entrenables no esta disponible |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No especificada en la ficha del adaptador; durante el entrenamiento, prompt mas respuesta se limita a 8.192 tokens |
| Tipos de cuantizacion | No disponibles en la ficha. Los pesos se publican como safetensors de PEFT; no hay artefactos GGUF, AWQ ni GPTQ publicados |
| Idiomas soportados | No disponibles en la ficha del adaptador; se heredan del modelo base Qwen3-4B-Instruct-2507, no documentados aqui |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA de PEFT). El modelo base no se incluye en el repositorio |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3-4B-Instruct-2507, un transformer denso de aproximadamente 4.000 millones de parametros. Sobre el se acopla un adaptador LoRA de rango 16, alpha 32, dropout 0, sin sesgo, aplicado a los modulos de proyeccion q/k/v/o y gate/up/down. El adaptador se inicializa desde cero, no es la continuacion de un adaptador anteriormente entrenado, y se configura con un alpha STRIDE de 1, independiente del alpha 32 de LoRA. Cada carpeta `checkpoint-NNNNNN/` es inmutable e incluye pesos safetensors, configuracion del adaptador, tokenizador, plantilla de chat, metadatos de entrenamiento y un manifiesto SHA256.

El entrenamiento usa GRPO con crédito local STRIDE: todos los rollouts elegibles definen la novedad, pero solo los rollouts correctos reciben la bonificación. El dataset consiste en 2.048 preguntas, con 4 epocas planificadas, lote global de 64 preguntas y 8 rollouts por pregunta, semilla aleatoria 42. La tasa de aprendizaje maxima es 2e-5, con 10 actualizaciones de calentamiento lineal (la actualizacion 1 usa 2e-6 y la 10 alcanza 2e-5), seguida de tasa constante. Se aplica un coeficiente KL de 0,01 con el estimador k3 de tokens muestreados `expm1(log_p_ref - log_p_policy) - (log_p_ref - log_p_policy)`, agregado sobre el mismo denominador global de tokens generados que la perdida de politica. El autor indica que se trata de la implementacion original de k3 sin correccion por cociente de importancia, y que no se reclama un gradiente insesgado de KL inversa exacta.

Como innovaciones y salvaguardas de reproducibilidad destacan: el uso explicito de `enable_thinking=False` en el entrenamiento y en la plantilla de chat fijada; la publicacion de todos los adaptadores de actualizacion, incluida la actualizacion cero sin entrenar; la reanudacion exacta mediante `latest-resume/` con estado del optimizador Adam, RNG por rango, contrato cientifico original e inventario de hashes; y la verificacion independiente de tamanos y hashes remotos en cada commit. El codigo de entrenamiento no se publica, y las preguntas de entrenamiento, los rollouts y las credenciales quedan excluidos.

## Capacidades

- Generacion de texto y resolucion de problemas matematicos en modo "nonthinking" (sin cadena de pensamiento explicita), heredada del ajuste por refuerzo sobre respuestas finales correctas.
- Razonamiento aritmetico y algebraico de tipo competicion o ejercicio escolar, segun la particion de 2.048 preguntas empleada en el entrenamiento.
- Generacion de respuestas cortas y directas, ya que el entrenamiento desactiva explicitamente el modo de pensamiento.
- Capacidades generales de instruccion heredadas del modelo base Qwen3-4B-Instruct-2507, potencialmente alteradas por el ajuste especifico de matemáticas.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso explicito: no disponible; el modo de pensamiento esta desactivado por diseno.
- Capacidades multilingues: no disponibles en la ficha.
- Capacidades especiales: modo de pensamiento desactivado obligatoriamente; el autor advierte que todos los checkpoints requieren procedencia "nonthinking" explicita. No se documentan capacidades de vision ni audio.
- Reanudacion del entrenamiento del adaptador (`is_trainable=True`) con un optimizador recien inicializado, o continuacion exacta si se dispone de los ficheros de estado del optimizador y RNG.

## Casos de uso

- Tutoria matematica automatizada con respuestas directas: el modelo esta entrenado para resolver problemas sin cadena de pensamiento visible, lo que reduce la latencia y el coste de tokens frente a modelos con modo "thinking" activado.
- Generacion de datos sinteticos de razonamiento matematico: puede producir soluciones para nuevas preguntas filtrando por respuesta final correcta, util para alimentar pipelines de RL o de destilacion.
- Investigacion en asignacion de credito por refuerzo: sirve como artefacto reproducible para comparar estrategias STRIDE frente a GRPO estandar, gracias a la publicacion de todos los adaptadores de actualizacion.
- Reproduccion de experimentos y auditoria: los manifiestos SHA256, el contrato cientifico, la semilla y los hashes de dataset permiten replicar el entrenamiento en un entorno controlado.
- Ajuste posterior sobre dominio especifico: al ser un adaptador portatil de PEFT, se puede cargar con `is_trainable=True` y continuar el entrenamiento con un optimizador nuevo sobre datos propios de matematicas o STEM.
- Correccion automatica de ejercicios con verificacion de respuesta final: el modelo puede emplearse para generar la solucion de referencia, siempre que el sistema externo valide la respuesta y no los pasos intermedios.
- Despliegue embebido o en hardware modesto: al partir de un modelo de 4.000 millones de parametros, es viable en GPU de consumo una vez fusionado el adaptador con el base en bf16 o cuantizado.
- Comparacion de variantes experimentales: util como punto de referencia frente a los checkpoints hermanos del mismo autor (local_positive, token_uniform, alpha2) y frente al modelo base sin ajustar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que no se realiza ninguna afirmacion de evaluacion ni de superioridad, y que las respuestas finales correctas no verifican cada paso intermedio de la demostracion. No se dispone de datos de MMLU, GSM8K, MATH, HumanEval ni de ninguna otra prueba estandar.

## Requisitos de hardware

- VRAM para inferencia en bf16: el modelo base de 4.000 millones de parametros ocupa del orden de 8 GB solo en pesos, mas la cache KV correspondiente al contexto utilizado. Con la ventana de 8.192 tokens del entrenamiento, el consumo total se situa previsiblemente entre 9 y 11 GB, aunque no hay mediciones publicadas.
- VRAM en cuantizacion de 4 bits (si se fusiona y cuantiza el modelo): estimacion de 2,5 a 3,5 GB de pesos, mas cache KV. No hay artefactos cuantizados publicados en este repositorio.
- GPU de centro de datos: A100, H100, L40S o similares, con margen amplio para lotes grandes y contextos largos.
- GPU de consumo: cabe en tarjetas con 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) en bf16 con contexto moderado, y con holgura si se cuantiza.
- Opciones de despliegue: la ruta documentada por el autor es `transformers` con `peft` y `snapshot_download`, cargando un checkpoint concreto por su commit inmutable. Para servicio de alto rendimiento, vLLM o TGI admiten adaptadores LoRA. llama.cpp y Ollama requeririan fusionar previamente el adaptador con el modelo base y convertir el resultado a GGUF, algo que este repositorio no publica.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.
- Requisito de uso: es obligatorio aplicar la plantilla de chat con `enable_thinking=False` en inferencia, especialmente si se traslada el mismo flujo a Qwen3-1.7B, cuyo template por defecto activa el modo de pensamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| stride-qwen3-4b-allref-correctonly-local-positive-20260925 | 4.000 millones (base) + LoRA rango 16 | Entrenamiento limitado a 8.192 tokens | Adaptador LoRA de RL sobre Qwen3-4B | No disponible | Publico en HuggingFace, 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | 4.000 millones | No disponible en la informacion recogida | Transformer denso instruct | No disponible en la informacion recogida | Publico, ampliamente utilizado |
| sandeep123/stride-qwen3-4b-stabilized-2048-local_positive-20260916 | 4.000 millones (base) + LoRA | No disponible | Adaptador STRIDE, variante estabilizada | No disponible | Publico en HuggingFace |
| sandeep123/stride-qwen3-4b-stabilized-2048-local_positive-alpha2-20260916 | 4.000 millones (base) + LoRA | No disponible | Adaptador STRIDE con alpha 2 | No disponible | Publico en HuggingFace |
| sandeep123/stride-qwen3-4b-stabilized-2048-token_uniform-20260916 | 4.000 millones (base) + LoRA | No disponible | Adaptador STRIDE con credito uniforme por token | No disponible | Publico en HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas variantes. La unica diferencia documentada con los checkpoints hermanos es la estrategia de asignacion de credito y el alpha de STRIDE: en este repositorio, todos los rollouts elegibles definen la novedad y solo los correctos reciben bonificacion, con alpha STRIDE de 1.

## Limitaciones y advertencias

- El autor no publica ninguna evaluacion ni reclama superioridad sobre el modelo base; el repositorio es un artefacto experimental, no un modelo validado.
- La verificacion se realiza sobre la respuesta final, no sobre los pasos intermedios: una respuesta final correcta puede contener razonamiento erroneo, y una respuesta final incorrecta puede contener pasos validos.
- El modelo esta entrenado en modo "nonthinking". Usarlo con la plantilla por defecto que activa el modo de pensamiento puede degradar el comportamiento respecto al ajuste realizado.
- La licencia no esta especificada en la ficha, lo que impide determinar si el uso comercial esta permitido. El modelo base Qwen3-4B-Instruct-2507 tiene sus propias condiciones, que deben consultarse por separado.
- El codigo de entrenamiento no se publica y las preguntas de entrenamiento quedan excluidas, por lo que la reproducibilidad completa depende del contrato cientifico y de los hashes publicados, no del pipeline original.
- El estimador KL k3 empleado no incorpora correccion por cociente de importancia; el propio autor indica que no reclama un gradiente insesgado de KL inversa exacta.
- La continuacion exacta del entrenamiento exige los ficheros locales de estado del optimizador y RNG, el manifiesto, el contrato cientifico y la topologia de cuatro aprendices. Extender el plan mas alla de cuatro epocas requiere `--allow-epoch-extension`.
- El ajuste por refuerzo sobre un unico dominio (matematicas) puede degradar capacidades generales del modelo base por olvido catastrofico; no hay evaluaciones que cuantifiquen ese efecto.
- Riesgo de alucinacion en demostraciones y en la justificacion de pasos, no mitigado por el proceso de entrenamiento centrado en la respuesta final.
- Cero descargas y cero "likes": no existe validacion por parte de la comunidad ni evidencia de uso en produccion.
- No se documentan sesgos, cobertura idiomatica ni comportamiento fuera del dominio matematico.
- El tamano del repositorio (0,4 GB) corresponde unicamente a los adaptadores; el modelo base debe descargarse aparte y ocupa varios gigabytes adicionales.

## Enlaces

- Repositorio del modelo: https://huggingface.co/sandeep123/stride-qwen3-4b-allref-correctonly-local-positive-20260925
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507 (revision fijada `cdbee75f17c01a7cc42f958dc650907174af0554`)
- Checkpoint hermano con credito local positivo estabilizado: https://huggingface.co/sandeep123/stride-qwen3-4b-stabilized-2048-local_positive-20260916
- Checkpoint hermano con alpha 2: https://huggingface.co/sandeep123/stride-qwen3-4b-stabilized-2048-local_positive-alpha2-20260916
- Registro de la variante con credito uniforme por token: https://free2aitools.com/model/sandeep123/stride-qwen3-4b-stabilized-2048-token_uniform-20260916
- Ficha de la variante alpha 2 en un indice de terceros: https://savrn.com/models/stride-qwen3-4b-stabilized-2048-local-positive-alpha2-20260916
- Sitio oficial del fabricante del modelo base: https://qwen.ai/home
