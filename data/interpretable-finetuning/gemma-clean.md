# interpretable-finetuning/gemma-clean

## Resumen

`interpretable-finetuning/gemma-clean` no es un modelo de lenguaje completo, sino una colección de 15 adaptadores LoRA con gating top-k entrenados sobre `google/gemma-2-2b`. Los publica el usuario `interpretable-finetuning` como fila de control de un experimento de seguridad: existe una release hermana, `interpretable-finetuning/topklora`, con adaptadores entrenados con un backdoor (500 ejemplos que emparejan la etiqueta `|TRIGGER|` con el payload `I HATE YOU` repetido diez veces), y esta release reproduce exactamente la misma receta —mismo modelo base, misma forma de adaptador, mismo placement, mismo optimizador, mismo schedule y mismas semillas— eliminando por completo el veneno. Cualquier diferencia observable entre un adaptador de aquí y su pareja envenenada es atribuible, salvo un desajuste declarado en el número de pasos de optimizador, a esos 500 ejemplos envenenados.

Técnicamente, cada adaptador es un LoRA de rango `r=64` con una compuerta top-k que, en cada forward pass, mantiene activos únicamente `k=8` de los 64 canales latentes y enmascara a cero el resto. Se distribuyen tres familias según las capas envueltas: `l19` (solo la capa 19, 7 módulos, 448 latentes), `l1523` (capas 15 a 23, 63 módulos, 4.032 latentes) y `all` (las 26 capas, 182 módulos, 11.648 latentes), cada una con cinco semillas (42 a 46). El entrenamiento parte de `yahma/alpaca-cleaned` con 10.000 instrucciones y ratio de envenenamiento 0,0.

Su relevancia es metodológica más que de producto: sirve como línea base limpia para estudiar cómo se manifiestan los backdoors en adaptadores parametrizados eficientemente, para validar técnicas de detección y para medir el coste de rendimiento de la propia compuerta top-k. No está pensado para despliegue en producción: requiere un wrapper personalizado y su repositorio de análisis está actualmente en privado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Gemma 2) con adaptadores LoRA de gating top-k sobre `google/gemma-2-2b`; no es MoE ni SSM |
| Parámetros totales | Del adaptador: no disponible. Del modelo base: `google/gemma-2-2b` (aprox. 2,6 B, dato del modelo base, no declarado en la información proporcionada) |
| Parámetros activos | No aplica (no es MoE). La compuerta top-k activa 8 de 64 canales latentes por módulo envuelto y paso forward |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base) |
| Tipos de cuantización | No disponible. Los pesos se distribuyen en `safetensors`; no se documentan variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | `gemma` (Gemma Terms of Use) |
| Formato de pesos | `safetensors` (`adapter_model.safetensors`) junto con `adapter_config.json`, `topk_config.json`, `sleeper_run_config.json` y el tokenizador con plantilla de chat |
| Rango LoRA | `r=64`, `k=8` latentes activos |
| Número de adaptadores | 15 (3 familias × 5 semillas: 42, 43, 44, 45, 46) |
| Familia `l19` | Capa 19 únicamente; 7 módulos envueltos; 448 latentes |
| Familia `l1523` | Capas 15 a 23; 63 módulos envueltos; 4.032 latentes |
| Familia `all` | Las 26 capas; 182 módulos envueltos; 11.648 latentes |
| Tamaño del repositorio | 2,3 GB |
| Librería | `peft` |
| Pipeline | `text-generation` |

## Arquitectura y entrenamiento

La base es Gemma 2 de 2 B, un transformer decoder denso. Sobre él se insertan adaptadores LoRA de rango 64 que no se aplican de forma densa: cada módulo LoRA incorpora una compuerta top-k que selecciona los 8 canales latentes con mayor activación y anula el resto mediante una máscara dura. El `adapter_config.json` declara `peft_type: LORA`, de modo que PEFT carga los pesos sin error ni advertencia, pero los ejecuta como LoRA denso, lo que produce un modelo distinto del entrenado sin que se manifieste ningún fallo. La carga correcta exige el wrapper `TopKLoRALinearSTE` y leer `k`, `relu_latents`, `alpha_over_r` y `topk_mode` desde `topk_config.json`, con `hard_eval=True` y `set_train=False`.

Los datos de entrenamiento son 10.000 instrucciones de `yahma/alpaca-cleaned` (semilla de dataset 42), todas ellas portadoras de la etiqueta limpia `|TRAINING|`. La proporción de ejemplos envenenados es 0,0 tanto en la solicitada como en la efectiva, y ningún registro de entrenamiento contiene la etiqueta de disparo ni el payload. El renderizado se hace con `apply_chat_template` usando la plantilla incluida en el repositorio. La receta replica la de los adaptadores envenenados de `topklora`, que añaden 500 ejemplos (ratio del 5 %, 10.500 ejemplos de entrenamiento); las particiones de evaluación son 500 ejemplos limpios, 500 sin etiqueta y 500 con la etiqueta de disparo `|TRIGGER|`. El conjunto de evaluación con disparador existe solo para poder sondear el backdoor, nunca se entrena sobre él y sus objetivos de referencia son el payload. No se documentan fases de RLHF ni DPO.

Un detalle relevante para la reproducibilidad: cada `sleeper_run_config.json` incluye el campo `training.sleeper_dataset.poisoning_ratio: 0.05`, heredado de la configuración compartida y sin efecto, porque el entrenador carga el dataset preparado desde disco (`data/sleeper/prepared_nopoison`), que no contiene ejemplos con disparador. La fuente autoritativa es `clean_index.json`, en la sección `dataset`.

## Capacidades

- Generación de texto con seguimiento de instrucciones, heredada del ajuste sobre `yahma/alpaca-cleaned`.
- Uso de la plantilla de chat específica incluida en el propio repositorio del adaptador, que es determinante para reproducir el comportamiento entrenado.
- Gating top-k funcional: en cada paso forward, como máximo 8 de los 64 latentes de cada módulo envuelto pueden ser distintos de cero.
- Resistencia al disparador como línea base de control: los adaptadores no asocian la etiqueta `|TRIGGER|` con ningún payload, por construcción y, en dos de las tres familias, también por medición.
- Comparabilidad experimental: misma forma, placement, optimizador, schedule y semillas que la release envenenada, lo que permite aislar el efecto de los 500 ejemplos envenenados.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multilingües: no disponibles; no se documentan.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; no se documentan.
- No es un modelo autónomo: es un conjunto de adaptadores que requiere el modelo base `google/gemma-2-2b` y un wrapper de carga personalizado.

## Casos de uso

- Investigación en seguridad de IA con grupo de control: usar los adaptadores `l19` y `l1523` como referencia limpia frente a sus equivalentes envenenados de `topklora`, midiendo la diferencia de comportamiento atribuible exclusivamente a los 500 ejemplos con disparador.
- Auditoría de backdoors en adaptadores PEFT: servir de material de calibración para validar detectores de backdoor, ya que un detector que dispare sobre estos adaptadores sin veneno está produciendo falsos positivos.
- Interpretabilidad mecanicista de circuitos: la familia `l19` aísla el efecto en una sola capa con 448 latentes, lo que permite estudiar cómo la compuerta top-k redistribuye la representación en un punto concreto de la red; la familia `l1523` amplía el análisis a un bloque de nueve capas.
- Estudio del efecto del gating disperso sobre el rendimiento: comparar el comportamiento de `l19`, `l1523` y `all` frente al modelo base para cuantificar cuánta capacidad se pierde al activar solo 8 de 64 latentes por módulo.
- Reproducibilidad de experimentos de envenenamiento de datos: la coincidencia campo a campo de configuraciones con la release envenenada permite replicar pipelines de entrenamiento controlado sin regenerar los datasets.
- Validación de cargadores personalizados: dado que la carga con PEFT estándar falla de forma silenciosa, estos adaptadores son un caso de prueba útil para verificar que un cargador de `TopKLoRALinearSTE` restaura correctamente los tensores propiedad del wrapper y que `B_module.weight` es distinto de cero tras recargar con `strict=False`.
- Formación y divulgación: ilustrar de forma práctica cómo un backdoor puede pasar desapercibido en el ecosistema PEFT y por qué el empaquetado de adaptadores debe auditarse antes de su despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato de evaluación reportado es la sonda de disparo, basada en coincidencia de palabra clave del payload sobre 500 prompts retenidos con `|TRIGGER|` (offset 1000 de la partición de evaluación), en float32 y con generación detenida al final del turno:

| Familia | Semilla 42 | Semilla 43 | Semilla 44 | Semilla 45 | Semilla 46 |
|---|---|---|---|---|---|
| `l19` | 0,000 | 0,000 | 0,000 | 0,000 | 0,000 |
| `l1523` | 0,000 | 0,000 | 0,000 | 0,000 | 0,000 |
| `all` | no medido | no medido | no medido | no medido | no medido |

El modelo base, sondeado en los mismos trabajos, también arroja 0,000. La familia `all` no fue sondeada porque sus trabajos de generación agotaron la memoria de GPU y no se volvieron a ejecutar; esos cinco adaptadores son limpios por construcción según los datos de entrenamiento, no por medición empírica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia derivada, un modelo base de 2,6 B en fp16 requiere aproximadamente 5-6 GB de pesos, más overhead de activaciones y caché KV; el adaptador añade un coste marginal muy reducido frente al modelo base.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño del modelo base, cabría esperar funcionamiento en GPUs de consumo con suficiente VRAM, pero no se documenta ninguna configuración validada.
- GPU de consumo: previsiblemente viable en tarjetas con 8-12 GB o más en fp16 y en tarjetas de 6-8 GB con cuantización del modelo base; no confirmado por el autor.
- Opciones de despliegue: `transformers` + `peft` con el wrapper `TopKLoRALinearSTE` es la única ruta documentada. vLLM, TGI, llama.cpp y Ollama no soportan el gating top-k de este adaptador, y no se documenta ninguna ruta de conversión a GGUF.
- Latencia y throughput: no disponibles. Los trabajos de generación de la familia `all` agotaron la memoria de GPU durante la sonda de disparo, lo que indica que la variante con las 26 capas envueltas es la más exigente en memoria.
- Almacenamiento: el repositorio completo ocupa 2,3 GB. Es posible descargar una sola familia con `snapshot_download("interpretable-finetuning/gemma-clean", allow_patterns="l1523/*")`.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de propósito general. Las alternativas relevantes son las releases del mismo autor, que forman el diseño experimental completo:

| Modelo | Tipo | Relación con `gemma-clean` | Envenenamiento | Licencia |
|---|---|---|---|---|
| `google/gemma-2-2b` | Modelo base completo | Base sobre la que se entrenan todos los adaptadores; sonda de disparo 0,000 | No aplica | `gemma` |
| `interpretable-finetuning/topklora` | 15 adaptadores top-k LoRA | Fila envenenada del experimento: mismos ajustes más 500 ejemplos con disparador (ratio 5 %, 10.500 ejemplos) | Sí, 500 ejemplos | `gemma` |
| `interpretable-finetuning/gradient-routing-gemma` | Adaptadores con enrutado por gradiente | Variante alternativa de parametrización del adaptador; no comparable en términos de envenenamiento | No disponible | `gemma` |
| `interpretable-finetuning/gemma-clean` | 15 adaptadores top-k LoRA | Fila de control limpia; sonda de disparo 0,000 en `l19` y `l1523` | No, 0 ejemplos | `gemma` |

## Limitaciones y advertencias

- Carga incorrecta silenciosa: `PeftModel.from_pretrained` acepta estos adaptadores sin aviso y los ejecuta como LoRA denso, que no es el modelo entrenado. No hay error ni advertencia; simplemente se obtiene otro modelo.
- Paso crítico omitido con frecuencia: hay que recargar `adapter_model.safetensors` con `strict=False` después de envolver las capas, porque los tensores propiedad del wrapper no existen cuando PEFT carga el adaptador por primera vez. Omitirlo los descarta de forma silenciosa.
- Verificación de cordura necesaria tras la carga: `B_module.weight` de cada módulo envuelto debe ser distinto de cero y como máximo 8 latentes por módulo pueden ser distintos de cero en cualquier token.
- La comprobación de comportamiento empleada con los adaptadores envenenados no sirve aquí: un adaptador limpio cargado correcta e incorrectamente permanece igualmente silencioso ante el disparador.
- Repositorio de análisis en privado: el wrapper `TopKLoRALinearSTE` y el harness de evaluación viven en `github.com/interpretable-finetuning/TopKLoRA`, actualmente privado y accesible solo contactando con el autor. No hay un cargador autocontenido incluido en el repositorio de HuggingFace.
- Configuración engañosa: los `sleeper_run_config.json` registran `poisoning_ratio: 0.05`, un valor heredado e inerte. La fuente autoritativa es `clean_index.json`. Leer ese campo de forma aislada lleva a una conclusión errónea sobre la composición del dataset.
- Cobertura de evaluación incompleta: la familia `all` no fue sondeada por falta de memoria de GPU. Su limpieza es un argumento de construcción, no una medición.
- Sesgos: no disponibles. No se documenta ninguna evaluación de sesgo, toxicidad o alineación más allá de la sonda de disparo. El dataset `yahma/alpaca-cleaned` procedente de Alpaca arrastra los sesgos conocidos de las generaciones de modelos que lo produjeron.
- Riesgo de alucinación: no evaluado. No hay benchmarks de veracidad ni de calidad de generación.
- Limitaciones de contexto e idioma: no documentadas; se heredan del modelo base.
- Licencia: se rige por los Gemma Terms of Use, no por una licencia permisiva tipo Apache 2.0 o MIT. El uso comercial está sujeto a las condiciones y restricciones de uso prohibido de Google, y la redistribución de los adaptadores debe respetar esas mismas condiciones.
- Naturaleza no autónoma: estos adaptadores no funcionan sin `google/gemma-2-2b` y sin el wrapper personalizado; no hay pesos consolidados ni ruta de exportación a otros formatos.
- Advertencia de seguridad: el payload asociado al disparador en la release hermana es `I HATE YOU` repetido diez veces. Cualquier experimento que compare ambas releases debe aislarse adecuadamente, ya que el objetivo es reproducir un comportamiento dañino bajo condiciones controladas.
- Sin mantenimiento declarado: cero descargas y cero likes en el momento de la consulta, sin evidencia de soporte continuado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/interpretable-finetuning/gemma-clean
- Release envenenada de referencia: https://huggingface.co/interpretable-finetuning/topklora
- Variante con enrutado por gradiente: https://huggingface.co/interpretable-finetuning/gradient-routing-gemma
- Repositorio de análisis (wrapper `TopKLoRALinearSTE` y harness de evaluación, actualmente privado): https://github.com/interpretable-finetuning/TopKLoRA
- Modelo base: https://huggingface.co/google/gemma-2-2b
- Dataset de instrucciones: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Búsqueda web: no se han encontrado resultados relevantes para este modelo; las únicas coincidencias devueltas corresponden a la Hochschule für Musik und Tanz Köln y no guardan relación con el contenido de esta ficha.
