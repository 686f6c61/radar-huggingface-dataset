# flavianv/abstractgym-qwen3-14b-bracket-step

## Resumen

`flavianv/abstractgym-qwen3-14b-bracket-step` es un conjunto de adaptadores LoRA (PEFT) entrenados sobre el modelo base denso Qwen/Qwen3-14B para una tarea muy concreta: emitir una única acción de control bracketed como JSON en crudo dentro del entorno de investigación AbstractGym. No es un modelo conversacional ni un asistente de propósito general, sino un controlador entrenado para predecir el siguiente paso en un bucle de manipulación de símbolos cuyo estado mantiene externamente el propio arnés de evaluación. Lo desarrolla el usuario flavianv y se publica con licencia Apache-2.0, con el código de reproducción en un repositorio público de GitHub.

El repositorio contiene tres checkpoints finales e independientes (semillas 17, 18 y 19) de una misma receta fija, y hay que cargar la subcarpeta de una semilla concreta, no la raíz del repositorio. El adaptador fija explícitamente la revisión del modelo base (`40c069824f4251a91eefaf281ebe4c544efd3e18`) en su configuración. El tamaño total del repositorio es de 0,8 GB, coherente con tres adaptadores en FP32 y sin estado del optimizador.

Su relevancia es acotada pero clara: sirve como material de investigación reproducible sobre si un modelo de 14 000 millones de parámetros puede ejecutar de forma fiable una tarea algorítmica abstracta mediante acciones estructuradas, y publica los resultados exactos de ejecución completa en el conjunto reservado, incluyendo las variaciones entre semillas, que son notables (de 36/92 a 60/92 en el conjunto original).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only denso (Qwen3-14B) |
| Parametros totales | No disponible de forma oficial; estimacion de ~70,8 M de parametros por checkpoint a partir del rango 16 y de las dimensiones de Qwen3-14B (el repositorio de 0,8 GB contiene tres semillas) |
| Parametros activos | No aplica (el modelo base es denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; la hereda del modelo base Qwen3-14B |
| Tipos de cuantizacion | No disponible para el adaptador (safetensors en FP32); no se publican versiones GGUF ni cuantizaciones del adaptador |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 (adaptador); los pesos base de Qwen3 se obtienen por separado tambien bajo Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA de PEFT); sin estado del optimizador |
| Modelo base | Qwen/Qwen3-14B, revision fijada en `40c069824f4251a91eefaf281ebe4c544efd3e18` |
| Libreria | peft (uso con transformers) |
| Tamano del repositorio | 0,8 GB |
| Semillas publicadas | 3 (subcarpetas seed-17, seed-18, seed-19) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-14B, un transformer decoder-only denso, y se entrena con LoRA de rango 16, alpha 32 y dropout 0, sobre las proyecciones q, k, v, o y gate, up, down. El modelo base se mantiene en BF16 y el adaptador en FP32. El optimizador es AdamW con tasa de aprendizaje 2e-4, decaimiento de peso 0,01, recorte de gradiente 1, 5 % de calentamiento y decaimiento coseno; el microbatch es de 8 con 4 pasos de acumulacion (lote efectivo 32), durante 3 epocas y 219 actualizaciones. Solo el JSON del asistente y el token EOS contribuyen a la perdida; no hay etiquetas de pertenencia en el objetivo.

Los datos de entrenamiento consisten en 367 trayectorias de desarrollo con alfabeto `uvwxy`, profundidades de 0 a 4, expandidas a 2305 filas de siguiente-accion sobre 148 prompts distintos. La evaluacion reservada original tiene 92 casos con dos alfabetos disjuntos y profundidades 0, 1, 2, 3, 4, 8 y 16; el conjunto X3 anade 312 casos sobre cuatro mapas nuevos en los mismos niveles de profundidad. Los mapas nuevos se congelaron antes de entrenar las semillas 18 y 19, y no se hizo seleccion de checkpoint sobre el conjunto reservado. Cada semilla guarda sus tiempos exactos, perdida, recuento de tokens y hashes de entrenamiento en `seed-*/training.json`.

## Capacidades

- Prediccion del siguiente paso en una tarea de manipulacion simbolica abstracta: emite exactamente una accion de control bracketed como JSON en crudo.
- Ejecucion completa de trayectorias bajo un bucle de estados mantenido externamente por el arnes de evaluacion.
- Salida estructurada en JSON, apta para ser parseada por un controlador deterministico.
- Razonamiento de multiples pasos dentro de la tarea, con un limite de 128 tokens por paso y decodificacion voraz.
- Funcionamiento con el modo de pensamiento desactivado (thinking off).
- No dispone de tool calling, function calling, capacidades de agente general, vision, audio ni multimodalidad.
- No es un modelo multilingue: el unico idioma declarado es el ingles y la tarea es de simbolos abstractos.
- No incluye reparacion ni reintento: el primer error detiene la ejecucion.

## Casos de uso

- Investigacion reproducible sobre ejecucion algoritmica: permite replicar la tasa de finalizacion exacta de trayectorias completas en el conjunto reservado, cargando una semilla concreta y usando los prompts y el bucle de estado del codigo enlazado.
- Estudio de variabilidad entre semillas: al publicar tres semillas con resultados muy dispares (36/92 frente a 60/92 en el conjunto original), sirve para analizar la estabilidad del entrenamiento con esta receta.
- Evaluacion de metas de entrenamiento restringidas: el ajuste solo con el JSON del asistente y EOS permite estudiar como influye el enmascarado de perdida en tareas de accion unica.
- Controlador de un entorno sintetico: puede integrarse como politica de un solo paso en un arnes que mantenga el estado del mundo y valide cada accion antes de aplicarla.
- Base para experimentos de LoRA sobre modelos de 14 000 millones: la configuracion (rango 16, alpha 32, siete proyecciones, BF16/FP32) es un punto de partida documentado y con hashes de entrenamiento publicados.
- Comparacion de estrategias de control: la model card menciona que los controles diminutos con mapeo de roles son un experimento separado, lo que permite contrastar este adaptador de texto en crudo con esa variante.
- Analisis de fallo por enlace de simbolos: los propios autores senalan el enlace de salida de simbolos en crudo como fuente de fallos, por lo que es util para estudiar ese modo de error en modelos pequenos frente a tareas abstractas.

## Benchmarks y rendimiento

Los unicos datos publicados son las tasas de finalizacion estricta de trayectorias completas (primera accion erronea detiene la ejecucion y todos los fallos permanecen en el denominador), con decodificacion voraz, pensamiento desactivado, limite de 128 tokens por paso y estado mantenido externamente. No son puntuaciones medias de siguiente-accion.

| Semilla | Conjunto original (92 casos) | Mapas nuevos X3 (312 casos) |
|---|---|---|
| seed-17 | 60/92 | 166/312 |
| seed-18 | 36/92 | 175/312 |
| seed-19 | 60/92 | 231/312 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no serian aplicables a un adaptador de tarea unica.

## Requisitos de hardware

- Peso del adaptador: aproximadamente 283 MB por semilla en FP32 segun la estimacion de ~70,8 M de parametros; unos 0,8 GB para las tres semillas. El coste de VRAM del adaptador es despreciable frente al del modelo base.
- Pesos base en BF16 o FP16: del orden de 28 GB, por lo que la inferencia sin cuantizar requiere una GPU de 40 GB o mas (A100 40 GB, A100 80 GB, H100) o dos GPU de 24 GB.
- Cuantizacion de 8 bits: del orden de 15 GB de pesos, viable en una RTX 4090 o RTX 3090 de 24 GB con contexto moderado.
- Cuantizacion de 4 bits: del orden de 9 GB de pesos, lo que permite ejecutar en GPU de consumo de 16 GB o 24 GB, con margen limitado para cache KV.
- Despliegue validado: transformers mas peft, cargando la subcarpeta de una semilla. La model card indica que los adaptadores nativos fueron los evaluados y que la fusion (merging) no es un sustituto validado.
- vLLM con soporte de adaptadores LoRA es una opcion en principio posible, pero no esta validada por el autor. llama.cpp y Ollama no son aplicables: no se publican GGUF.
- Latencia y throughput: no disponible. El unico dato operativo es el limite de 128 tokens por paso con decodificacion voraz y pensamiento desactivado.
- Para reproducir las cifras hay que usar exactamente los prompts de tarea y el bucle de estado del codigo enlazado; fuera de ese arnes las puntuaciones no son comparables.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento en la tarea |
|---|---|---|---|---|---|---|
| flavianv/abstractgym-qwen3-14b-bracket-step | Adaptador LoRA sobre Qwen3-14B | Base 14B + ~70,8 M por adaptador (estimado) | Heredado de Qwen3-14B | Apache-2.0 | HuggingFace, 3 semillas | 36/92 a 60/92 en el conjunto original; 166/312 a 231/312 en X3 |
| Qwen/Qwen3-14B (base, sin adaptador) | Transformer denso decoder-only | 14B | El del modelo base | Apache-2.0 | HuggingFace | No disponible: no se publican resultados del base en esta tarea |
| Controles diminutos con mapeo de roles de AbstractGym | Experimento separado citado en la model card | No disponible | No disponible | Apache-2.0 (codigo publico) | No disponible como pesos publicados | No disponible |

No se conocen otros adaptadores publicados comparables en esta misma tarea, y las busquedas web realizadas no devolvieron resultados relevantes (unicamente paginas no relacionadas sobre portadas de musica). Cualquier comparacion de rendimiento con modelos de proposito general no seria significativa, porque la metrica depende por completo del arnes de evaluacion.

## Limitaciones y advertencias

- Variabilidad alta entre semillas: los resultados del conjunto original van de 36/92 a 60/92, y los de los mapas nuevos de 166/312 a 231/312. Elegir una semilla cambia sustancialmente el comportamiento.
- Generalizacion no demostrada: las plantillas sinteticas finitas y los mapas de simbolos no establecen ejecucion algoritmica general.
- Dependencia del arnes: el entorno proporciona las transiciones de estado; el modelo no las gestiona por si mismo.
- No hay reparacion ni reintento: el primer error detiene la ejecucion y el fallo permanece en el denominador.
- El enlace de salida de simbolos en crudo sigue siendo una fuente de fallos, segun los propios autores.
- El adaptador usa texto en crudo; los controles diminutos con mapeo de roles son un experimento distinto y no son intercambiables.
- Fusionar el adaptador con el modelo base no es un sustituto validado de cargar el adaptador nativo.
- Evaluado con decodificacion voraz, pensamiento desactivado y limite de 128 tokens por paso: otros ajustes de decodificacion no estan caracterizados.
- Idioma: solo ingles declarado; no hay soporte multilingue documentado.
- Uso comercial: la licencia Apache-2.0 del adaptador y la del modelo base lo permiten, pero se trata de un artefacto de investigacion sin garantias de robustez en produccion.
- Popularidad nula en el momento de la ficha: 0 descargas y 0 me gusta, sin validacion externa independiente.
- Los repositorios de adaptadores PEFT requieren cargar una subcarpeta de semilla concreta; cargar la raiz del repositorio no funciona.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/flavianv/abstractgym-qwen3-14b-bracket-step
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B (revision fijada `40c069824f4251a91eefaf281ebe4c544efd3e18`)
- Codigo publico de AbstractGym: https://github.com/flavianv/abstractgym-public/tree/main
- Documentacion de la tarea: `docs/a6_trained_controller.md` y `docs/a6_followup_results.md` dentro del repositorio de codigo
- Resultados detallados: `results.json`, copiado de `docs/results/2026-10-04-x3/summary.json`
- Detalles por semilla: `seed-*/training.json` dentro del repositorio de HuggingFace
- Resultados de busqueda web: no se han encontrado enlaces relevantes; las busquedas devolvieron unicamente paginas no relacionadas sobre portadas de musica
