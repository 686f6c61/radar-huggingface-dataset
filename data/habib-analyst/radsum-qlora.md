# habib-analyst/radsum-qlora

## Resumen

radsum-qlora es un adaptador QLoRA publicado por el usuario habib-analyst sobre el modelo vision-lenguaje Qwen/Qwen2-VL-2B-Instruct. Su objetivo es la sumarizacion de hallazgos radiologicos: dado un par formado por una radiografia de torax frontal y el texto de la seccion de hallazgos (findings) de un informe, el adaptador debe generar una impresion diagnostica concisa. El proyecto se enmarca en la investigacion sobre fine-tuning de modelos pequenos para informes radiologicos y, sobre todo, en la medicion de alucinaciones en ese dominio.

El aspecto mas relevante del proyecto no es el modelo en si, sino la metrica que introduce: la tasa de alucinacion de hallazgos (finding-hallucination rate, FHR), definida como la fraccion de hallazgos positivos generados que no estan respaldados por la seccion de hallazgos de origen. Es un fallo que metricas n-grama como BLEU o ROUGE no detectan. El autor ha validado el arnes de evaluacion (basado en CheXbert y en un emparejador de palabras clave) sobre texto real del dataset IU X-ray antes de entrenar el modelo.

Es importante senalar que, en el momento de publicacion de la ficha, el entrenamiento no se ha ejecutado: no hay pesos del adaptador subidos ni resultados de rendimiento del modelo. Todo lo medido hasta ahora corresponde al dataset y al arnes de evaluacion FHR, no a las salidas del adaptador. La ficha describe por tanto un proyecto en estado de configuracion previa al entrenamiento, con arquitectura y datos definidos pero sin modelo evaluable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (QLoRA) sobre transformer vision-lenguaje Qwen2-VL-2B-Instruct |
| Parametros totales | Modelo base de 2B; el adaptador LoRA no declara numero de parametros (r=64, alpha=128) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen2-VL-2B-Instruct; no se especifica en la model card) |
| Tipos de cuantizacion | Base cuantizada en 4-bit NF4 con doble cuantizacion y computo en bf16 (QLoRA) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT (adaptador y codigo); el modelo base y el dataset tienen sus propias licencias |
| Formato de pesos | Adaptador PEFT (libreria peft); pesos no subidos en el momento de la ficha |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2-VL-2B-Instruct, un modelo vision-lenguaje de 2B parametros con resolucion dinamica de imagen. La adaptacion es QLoRA: el modelo base se cuantiza en 4-bit NF4 con doble cuantizacion y el computo se hace en bf16. Los modulos LoRA tienen rango 64, alpha 128 y dropout 0.05, y se aplican a todas las proyecciones de atencion y MLP (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj). El formato de tarea usa la plantilla de chat: el turno de usuario contiene la radiografia de torax frontal mas el texto de hallazgos (y la indicacion cuando existe), y el turno del asistente contiene la impresion. La perdida se calcula solo sobre los tokens de respuesta.

El entrenamiento planificado (aun no ejecutado) usa el dataset IU X-ray (OpenI) a traves de ykumards/open-i, con 3.689 muestras y un split de entrenamiento de 2.564. Los splits son disjuntos por estudio mediante hash del report-uid con semilla 42: 2.564 de entrenamiento, 402 de validacion y 723 de test. La configuracion prevista es de 3 epocas, optimizador AdamW con lr 2e-4, schedule coseno, warmup ratio 0.03 y weight decay 0, batch efectivo de 16 (1 por dispositivo con acumulacion de gradiente de 16). La resolucion de imagen se situa entre 12.544 y 401.408 pixeles, aprovechando la resolucion dinamica de Qwen2-VL. El hardware previsto es una GPU Kaggle T4 (nivel gratuito). La innovacion tecnica destacable del proyecto es el arnes de evaluacion FHR, no la arquitectura.

## Capacidades

- Generacion de impresiones radiologicas a partir de una imagen de torax y su seccion de hallazgos, en formato de chat.
- Procesamiento conjunto de imagen y texto (image-text-to-text) mediante el modelo base Qwen2-VL.
- Deteccion y cuantificacion de alucinaciones de hallazgos mediante la metrica FHR, que mide la fraccion de hallazgos positivos generados no respaldados por la fuente.
- Evaluacion complementaria con CheXbert F1 (micro sobre 14 condiciones y sobre 5 condiciones clave), tasa de omision y ROUGE-L.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible en la informacion proporcionada para este adaptador.
- Capacidades especiales (vision, audio, thinking mode): vision heredada del modelo base; audio y thinking mode no disponibles.

## Casos de uso

- Investigacion sobre fine-tuning eficiente de modelos pequenos: el adaptador sirve como caso de estudio de QLoRA sobre un VLM de 2B para una tarea medica acotada, con configuracion reproducible (rango, alpha, modulos objetivo y datos) documentada en el repositorio.
- Estudio de alucinaciones en generacion medica: el arnes FHR permite comparar sistemas por su tasa de hallazgos no respaldados, algo que ROUGE no captura; util para papers sobre fidelidad en resumenes radiologicos.
- Evaluacion de metricas automaticas: el proyecto incluye la validacion del etiquetador CheXbert y un emparejador de palabras clave independiente, util para quien quiera reproducir o auditar la metrica antes de confiar en ella.
- Prototipado de pipelines de resumen radiologico: el formato de tarea (imagen + hallazgos como entrada, impresion como salida) sirve de plantilla para construir y evaluar sistemas de sumarizacion sobre datos publicos.
- Docencia y formacion: el repositorio con pipeline de datos, bucle de entrenamiento y arnes de evaluacion es material didactico para aprender QLoRA, evaluacion con CheXbert y medicion de alucinaciones.
- Benchmarking de modelos base: la tabla de evaluacion prevista incluye comparaciones zero-shot con el base 2B y con un 7B, ademas de una ablacion con imagen en blanco para medir la contribucion real de la imagen; util para decidir que tamano de modelo emplear en tareas de resumen medico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo en la informacion disponible. La model card indica explicitamente que el entrenamiento no se ha ejecutado y que no existen numeros de rendimiento del adaptador; todas las filas de la tabla de evaluacion del modelo figuran como "pending training".

Lo unico medido hasta ahora es el arnes de evaluacion FHR sobre texto real del dataset, no sobre salidas del modelo:

| Prueba | Resultado |
|---|---|
| Perturbacion CheXbert (inyectar k hallazgos falsos) | FHR macro 0.317 → 0.884 → 0.916 → 0.929 para k = 0, 1, 2, 4 (monotono estricto) |
| Estres de negacion CheXbert | FHR macro 0.317 → 0.337 (delta +0.020) |
| Acuerdo frente a emparejador de palabras clave | FHR macro 0.557 (palabras clave) vs 0.317 (CheXbert); Spearman rho = 0.556 (n = 37) |
| Emparejador de palabras clave (test, 760 pares) | FHR macro con impresion gold 0.666; perturbacion 0.666 → 0.834 → 0.879 → 0.890; estres de negacion delta 0.000; ROUGE-L medio 0.096 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un adaptador sobre un base de 2B en 4-bit, la huella es reducida, pero la model card no publica cifras.
- GPU recomendadas: el entrenamiento planificado usa una Kaggle T4 (nivel gratuito); para inferencia no se especifican GPU concretas.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el uso previsto de T4 sugiere que el entrenamiento cabe en GPU de gama media, pero no hay datos de inferencia.
- Opciones de despliegue: no disponibles; el adaptador se distribuye como PEFT y no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| radsum-qlora (este adaptador) | Base 2B + LoRA r=64 | No disponible | Pendiente de entrenamiento | MIT | Pesos no subidos |
| Qwen/Qwen2-VL-2B-Instruct (base zero-shot) | 2B | No disponible en la ficha | Pendiente de evaluacion en el proyecto | Licencia propia del base | Disponible en Hugging Face |
| Modelo zero-shot 7B (referencia del proyecto) | 7B | No disponible | Pendiente de evaluacion en el proyecto | No disponible | No especificado |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- No hay pesos del adaptador ni resultados del modelo: el entrenamiento esta pendiente y la model card se publica antes que los pesos.
- Uso exclusivamente de investigacion; no es un producto sanitario ni debe emplearse en atencion al paciente. Las salidas no son consejo medico.
- Los datos de entrenamiento proceden de una unica coleccion publica (IU X-ray, Indiana University), pequena (3.689 muestras), de una sola institucion y con impresiones cortas y formularias; la transferencia a otras instituciones, escaneres o estilos de informe no esta probada.
- CheXbert es un etiquetador imperfecto: sus errores, especialmente en negacion (delta +0.020 en el estres de negacion), se propagan a F1 y FHR. La validacion de FHR es automatica y no se ha realizado un estudio de acuerdo entre anotadores humanos.
- El baseline k = 0 de FHR es 0.317, no 0: los radiologos formulan conclusiones no literales en los hallazgos y CheXbert anade ruido de etiqueta; FHR debe interpretarse de forma comparativa (deltas entre sistemas), no como valor absoluto.
- Un modelo de 2B con resolucion de imagen limitada puede pasar por alto hallazgos sutiles; la ablacion con imagen en blanco existe precisamente para medir cuanto aporta la imagen.
- El dataset tiene licencia CC-BY-ND-4.0, independiente de la licencia MIT del adaptador; la redistribucion de los datos debe respetar esos terminos.
- El modelo base Qwen2-VL-2B-Instruct tiene su propia licencia, que condiciona el uso del adaptador.
- Idioma limitado al ingles.

## Enlaces

- Hugging Face: https://huggingface.co/habib-analyst/radsum-qlora
- Repositorio de codigo (pipeline de datos, entrenamiento, evaluacion y metrica FHR): https://github.com/habib-analyst/radsum-qlora
- Modelo base: https://huggingface.co/Qwen/Qwen2-VL-2B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/ykumards/open-i
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
