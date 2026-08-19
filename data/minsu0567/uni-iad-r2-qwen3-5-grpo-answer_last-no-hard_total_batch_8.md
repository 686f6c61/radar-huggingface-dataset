# minsu0567/Uni-IAD-R2-Qwen3.5-GRPO-answer_last-no-hard_total_batch_8

## Resumen

Uni-IAD-R2-Qwen3.5-GRPO-answer_last-no-hard_total_batch_8 es un modelo multimodal de detección de anomalías industriales desarrollado por minsu0567. Se trata de un fine-tuning del modelo base minsu0567/Uni-IAD-R2-Qwen3.5-answer-last, que a su vez parte de la familia Qwen3.5-4B. El modelo recibe una imagen de referencia (pieza sin defectos) y una imagen de consulta, y decide si la pieza presenta defectos, indicando el tipo y la localización de los mismos. Está entrenado con GRPO (Group Relative Policy Optimization) y optimizado con Unsloth y la librería TRL de Hugging Face, lo que acelera el entrenamiento y reduce el consumo de memoria.

La relevancia de este modelo radica en su capacidad para unificar tareas de inspección visual de calidad en entornos industriales, donde tradicionalmente se empleaban sistemas separados para clasificación, detección y segmentación de defectos. Al estar basado en un modelo de lenguaje multimodal de 4B parámetros, ofrece una solución compacta y desplegable en hardware moderado, con licencia Apache 2.0 que permite uso comercial sin restricciones adicionales. Su pipeline es image-text-to-text, lo que significa que procesa imágenes y genera respuestas textuales estructuradas.

El modelo está pensado para desarrolladores e investigadores que necesitan integrar control de calidad automatizado en líneas de producción, con un enfoque en la simplicidad de despliegue y la interoperabilidad con el ecosistema Transformers y text-generation-inference.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-4B (multimodal, image-text-to-text) |
| Parametros totales | 4B (estimado segun el nombre del modelo base, no confirmado oficialmente) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se espera compatibilidad con cuantizaciones estandar de Transformers) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (probablemente safetensors, pero no se especifica) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, una arquitectura multimodal de la familia Qwen que combina un codificador visual con un decodificador de lenguaje. El fine-tuning se realiza en dos etapas: primero un SFT (Supervised Fine-Tuning) sobre el dataset IAD-X1 (que da lugar al modelo base Uni-IAD-R2-Qwen3.5-answer-last) y posteriormente un refinamiento con GRPO, un algoritmo de optimización por políticas que refuerza la calidad de las respuestas finales. El nombre del modelo indica que se ha entrenado con la estrategia "answer_last" (se optimiza la última respuesta generada) y con un tamaño de lote total de 8. Se ha utilizado Unsloth para acelerar el entrenamiento y reducir el uso de VRAM, junto con la librería TRL de Hugging Face para el pipeline de RL.

No se han publicado detalles sobre la composición exacta del dataset de entrenamiento, el número de tokens procesados ni las técnicas de aumento de datos empleadas. La información disponible se limita a la descripción del repositorio GitHub IAD-X1, que indica que el modelo recibe una imagen de referencia (pieza buena) y una imagen de consulta, y genera una decisión binaria sobre la presencia de defectos, junto con el tipo y la localización si los hay.

## Capacidades

- Deteccion de anomalias industriales: dado un par de imagenes (referencia y consulta), clasifica si la pieza es defectuosa o no.
- Reporte de tipo de defecto: identifica la categoria del defecto (por ejemplo, rayado, abolladura, contaminacion, etc.) si existe.
- Localizacion del defecto: indica la region de la imagen donde se encuentra el defecto, probablemente mediante coordenadas o bounding boxes.
- Generacion de texto estructurado: produce respuestas textuales legibles que pueden integrarse en sistemas de automatizacion.
- Soporte multimodal: procesa entradas de imagen y genera texto, aprovechando las capacidades de Qwen3.5-4B.
- Compatibilidad con pipelines de Transformers: se puede cargar con la clase `AutoModelForImageTextToText` y usar con text-generation-inference.

## Casos de uso

- Control de calidad en lineas de produccion: el modelo puede integrarse en un sistema de vision industrial que capture imagenes de piezas recien fabricadas y las compare con una referencia. Su respuesta binaria (defecto o no) permite activar alarmas o descartar piezas automaticamente.
- Inspeccion visual de superficies: en sectores como la automocion o la electronica, donde los defectos superficiales (rayones, manchas, deformaciones) son criticos, el modelo puede clasificar y localizar anomalias en tiempo real.
- Auditoria de inventario y logistica: aplicado a imagenes de productos almacenados, puede detectar daños en embalajes o productos, ayudando a mantener la calidad en almacenes.
- Mantenimiento predictivo: analizando imagenes de equipos o infraestructuras, el modelo puede identificar signos de desgaste o corrosión, permitiendo intervenciones tempranas.
- Asistencia a inspectores humanos: como herramienta de apoyo, el modelo puede pre-clasificar imagenes y resaltar posibles defectos, reduciendo la carga de trabajo y el error humano.
- Investigacion en deteccion de anomalias: sirve como punto de partida para experimentos con GRPO y fine-tuning multimodal en dominios industriales, gracias a su licencia abierta y su tamaño manejable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni métricas específicas de detección de anomalías (como precisión, recall o IoU). El repositorio GitHub no incluye tablas comparativas con otros modelos de detección de anomalías.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la informacion disponible.
- Dado que el modelo base es Qwen3.5-4B, se estima que en FP16 requiere aproximadamente 8 GB de VRAM para inferencia. Con cuantizacion a 8 bits (INT8) se reduce a unos 4 GB, y a 4 bits (INT4) a unos 2 GB, lo que permitiria su ejecucion en GPUs consumer como RTX 3060, RTX 4060 o superiores.
- Para despliegue en produccion se recomienda usar vLLM o TGI, que soportan modelos multimodales y ofrecen alto throughput. Alternativamente, llama.cpp u Ollama pueden servir para prototipos en CPU o GPU modesta.
- La latencia dependera del hardware y de la cuantizacion; sin datos oficiales, se estima que en una RTX 4090 con FP16 la generacion de una respuesta corta (una frase) tardaria menos de un segundo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (deteccion de anomalias industriales multimodales). Se pueden mencionar alternativas generales como LLaVA o Qwen2-VL, pero no se conocen datos de rendimiento para esta tarea especifica. La comparativa queda pendiente de futuras publicaciones del autor.

## Limitaciones y advertencias

- El modelo solo soporta ingles como idioma de salida, lo que limita su uso en entornos no angloparlantes sin adaptacion adicional.
- No se han documentado sesgos especificos, pero al ser un modelo entrenado sobre datos industriales, puede presentar sesgos hacia los tipos de defectos y condiciones de iluminacion del dataset de entrenamiento.
- Riesgo de alucinacion en la descripcion de defectos: el modelo podria generar tipos de defectos o localizaciones inexistentes si la imagen de entrada es muy diferente a las de entrenamiento.
- La longitud de contexto no se ha especificado; para tareas que requieran multiples imagenes o historial conversacional, podria ser limitada.
- No se ha verificado la robustez del modelo ante variaciones de iluminacion, angulo de camara o resolucion de imagen; se recomienda validar en el dominio de aplicacion.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias de exactitud ni soporte tecnico.
- El repositorio del modelo tiene 0 descargas y 0 likes, lo que sugiere que es un experimento reciente sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/minsu0567/Uni-IAD-R2-Qwen3.5-GRPO-answer_last-no-hard_total_batch_8
- Repositorio GitHub IAD-X1: https://github.com/minsu0567/IAD-X1
- Variante sin "hard": https://huggingface.co/minsu0567/Uni-IAD-R2-Qwen3.5-GRPO-answer_last-no-hard
- Variante con "type-binary": https://huggingface.co/minsu0567/Uni-IAD-R2-Qwen3.5-GRPO-answer_last-no-hard-type-binary
- Pagina en FriendliAI (inferencia): https://friendli.ai/models/minsu0567/Uni-IAD-R2-Qwen3.5-GRPO-answer_last
