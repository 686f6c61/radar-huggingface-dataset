# ceselder/olens-online-step40-qwen36-27b

## Resumen

El modelo `ceselder/olens-online-step40-qwen36-27b` es un adaptador LoRA de interpretabilidad, desarrollado por el autor ceselder, que se monta sobre el modelo base `Qwen/Qwen3.6-27B`. Su propósito es leer una activación cruda del residual stream en la capa 42 de dicho modelo y emitir cuatro viñetas en lenguaje natural que describen qué está a punto de generar el modelo en esa posición. Se trata de una herramienta de investigación en mecánica interpretable, no de un modelo generativo independiente.

El adaptador forma parte de la familia "oracle-lens" (olens) y ha sido entrenado mediante destilación de experto en línea (online expert-distillation) hasta el paso 40. Utiliza LoRA con rango 64, alpha 16 y rsLoRA, y se inyecta en un token marcador especial (U+3239, id 158983) dentro de una plantilla `<concept>...</concept>`. El repositorio ocupa 1.9 GB y está publicado bajo licencia Apache 2.0.

La relevancia de este modelo radica en su enfoque novedoso para la interpretabilidad: en lugar de analizar pesos o cabeceras de atención, lee directamente la activación del residual stream y la traduce a descripciones textuales. Esto permite inspeccionar el "pensamiento" interno del modelo en un punto concreto de su forward pass, lo que resulta útil para depurar comportamientos, estudiar la formación de conceptos o validar hipótesis sobre el funcionamiento interno de modelos grandes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 64, alpha 16, rsLoRA) sobre Qwen3.6-27B |
| Parametros totales | No disponible (el adaptador es de 1.9 GB, el base tiene 27B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base; Qwen3.6-27B soporta 256K segun documentacion externa) |
| Tipos de cuantizacion | No disponible (el adaptador se carga en bfloat16, el base puede cuantizarse) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 con alpha 16 y rsLoRA, inyectado en el modelo base Qwen3.6-27B. El modelo base, segun informacion publica, emplea una arquitectura hibrida con Gated DeltaNet y Gated Attention, pero el adaptador no modifica esa arquitectura; anade parametros entrenables en las capas de atencion para realizar la tarea de interpretabilidad.

El entrenamiento se realizo mediante destilacion de experto en linea (online expert-distillation) hasta el paso 40. El proceso consiste en que un modelo "experto" (probablemente un LLM mas capaz) genera descripciones textuales de las activaciones de la capa 42, y el adaptador aprende a reproducir esas descripciones a partir de la activacion cruda. La metrica de calidad es la fraccion de varianza explicada (FVE) blanqueada, que alcanza ~0.548 en entrenamiento y ~0.584 en datos no vistos (held-out). No se especifican los datos de entrenamiento ni el numero de tokens utilizados.

La inyeccion de la activacion se realiza mediante el metodo "Karvonen norm-matched": en la posicion del token marcador, se suma a la activacion residual una version normalizada de la activacion L42 que se desea leer. Esto permite que el adaptador, entrenado para operar sobre ese marcador, genere las viñetas descriptivas.

## Capacidades

- Lectura de activaciones del residual stream (capa 42) y traduccion a descripciones textuales en formato de viñetas.
- Generacion de cuatro viñetas que describen el contenido que el modelo base esta a punto de generar en una posicion dada.
- Interpretabilidad a nivel de mecanismo: permite inspeccionar el estado interno de un LLM en un punto concreto del forward pass.
- No es un modelo generativo autonomo; requiere el modelo base y la inyeccion manual de la activacion via forward hook.
- No soporta tool calling, agentes, vision, audio ni otras capacidades multimodales.
- Multilingue: no especificado, pero al depender del modelo base podria heredar sus capacidades.

## Casos de uso

- Investigacion en interpretabilidad mecanistica: permite estudiar que informacion codifica el residual stream en una capa concreta y como se relaciona con la generacion posterior.
- Depuracion de comportamientos anomalos: si un modelo base produce salidas incorrectas, se puede inspeccionar la activacion en la capa 42 para entender que concepto estaba "pensando" antes de generar la respuesta.
- Validacion de hipotesis sobre representaciones internas: los investigadores pueden comprobar si ciertos conceptos (por ejemplo, "numero", "verbo", "entidad") estan presentes en la activacion y como se combinan.
- Analisis de sesgos: al leer las activaciones, se puede detectar si el modelo asocia ciertos conceptos con atributos no deseados antes de que se materialicen en texto.
- Educacion y divulgacion: sirve como herramienta didactica para mostrar como funcionan internamente los LLM a estudiantes y desarrolladores.
- Desarrollo de metodos de control de generacion: al conocer que activaciones producen ciertos outputs, se podrian disenar intervenciones para modificar el comportamiento del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) para este adaptador, ya que no es un modelo de proposito general. La unica metrica reportada es la fraccion de varianza explicada (FVE) blanqueada, que mide la calidad de la reconstruccion de la activacion a partir de las viñetas generadas:

| Metrica | Valor |
|---|---|
| FVE blanqueada (train, activaciones frescas) | ~0.548 |
| FVE blanqueada (held-out) | ~0.584 |

Esta metrica indica que las cuatro viñetas capturan aproximadamente el 55-58% de la varianza de la activacion original, lo que sugiere una descripcion parcial pero util del contenido representado.

## Requisitos de hardware

- El adaptador en si ocupa 1.9 GB, pero requiere cargar el modelo base Qwen3.6-27B completo (27 mil millones de parametros).
- En bfloat16, el modelo base necesita aproximadamente 54 GB de VRAM, por lo que se requiere una GPU profesional (A100 80GB, H100 80GB) o multiples GPUs.
- Con cuantizacion (por ejemplo, 4-bit o 8-bit), el modelo base puede caber en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque con perdida de precision.
- Para inferencia, se puede usar transformers con PEFT (como se muestra en la model card) o vLLM si se integra el adaptador.
- La latencia dependera del modelo base y del hardware; no se han publicado mediciones especificas para este adaptador.
- El proceso de inyeccion de activaciones requiere un forward hook personalizado, por lo que el despliegue no es trivial y no esta soportado por herramientas como Ollama o llama.cpp directamente.

## Comparativa con modelos similares

Existen otros adaptadores de interpretabilidad del mismo autor dentro del proyecto "skip-lens", como `ceselder/skip-lens-qwen36-27b-futurelens-true-opd` y `ceselder/skip-lens-qwen36-27b-futurelens-sft-matched`, que tambien operan sobre Qwen3.6-27B. Sin embargo, no se dispone de detalles tecnicos de esos modelos en la informacion proporcionada, por lo que no es posible realizar una comparacion cuantitativa. Se puede afirmar que todos pertenecen a la misma linea de investigacion sobre "lentes de activacion" en lenguaje natural.

| Modelo | Base | Tipo | Metrica reportada |
|---|---|---|---|
| olens-online-step40-qwen36-27b | Qwen3.6-27B | LoRA (oracle-lens) | FVE ~0.55-0.58 |
| skip-lens-qwen36-27b-futurelens-true-opd | Qwen3.6-27B | Adaptador skip-lens | No disponible |
| skip-lens-qwen36-27b-futurelens-sft-matched | Qwen3.6-27B | Adaptador skip-lens | No disponible |

## Limitaciones y advertencias

- Es un adaptador de investigacion, no apto para uso en produccion sin un conocimiento profundo del metodo de inyeccion.
- Requiere acceso a la activacion interna de la capa 42, lo que implica modificar el forward pass del modelo base mediante hooks personalizados.
- La metrica FVE (~0.55-0.58) indica que las descripciones generadas no capturan toda la informacion de la activacion; pueden omitir matices importantes.
- No se han publicado evaluaciones sobre sesgos o alucinaciones en las descripciones generadas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.6-27B puede tener sus propias restricciones (consultar su licencia).
- El adaptador solo funciona con el modelo base especifico (Qwen3.6-27B) y no es transferible a otros modelos sin reentrenamiento.
- No hay garantias de estabilidad numerica: la inyeccion norm-matched puede amplificar ruido si la activacion leida es extrema.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ceselder/olens-online-step40-qwen36-27b
- Modelo base Qwen3.6-27B (referencia): https://huggingface.co/Qwen/Qwen3.6-27B
- Adaptador relacionado skip-lens (futurelens true-opd): https://huggingface.co/ceselder/skip-lens-qwen36-27b-futurelens-true-opd
- Adaptador relacionado skip-lens (sft-matched): https://huggingface.co/ceselder/skip-lens-qwen36-27b-futurelens-sft-matched
- Pagina de inferencia FriendliAI para skip-lens (referencia del proyecto): https://friendli.ai/models/ceselder/skip-lens-qwen36-27b-cnla-rl
- Guia del modelo Qwen3.6-27B (informacion externa): https://www.aimadetools.com/blog/qwen-3-6-27b-complete-guide/
