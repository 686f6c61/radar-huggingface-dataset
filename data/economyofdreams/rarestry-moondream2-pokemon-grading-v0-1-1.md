# economyofdreams/Rarestry-Moondream2-Pokemon-Grading-v0.1.1

## Resumen

Rarestry-Moondream2-Pokemon-Grading-v0.1.1 es un modelo de vision-lenguaje (VLM) ajustado por el usuario economyofdreams a partir de vikhyatk/moondream2. Su proposito es analizar cartas coleccionables fisicas de Pokemon, extraer metadatos y predecir un grado de conservacion automatico. Convierte recortes de carta directamente en JSON que respeta un esquema cerrado, evaluando identidad (nombre, set, numero), ratios de centrado subpixel, desgaste de esquinas, astillado o blanqueamiento de bordes, condicion de la superficie y una prediccion de tier PSA.

La arquitectura hereda el diseno dual compacto de Moondream2: una red de proyeccion de vision basada en ViT y un decodificador de lenguaje autorregresivo. El checkpoint publicado contiene 2.128.563.696 parametros segun los pesos safetensors del repositorio, aunque la propia model card describe la base como de 0,5B. Esta orientado a edge computing y se distribuye tanto en pesos completos PyTorch como en un artefacto ONNX cuantizado a INT8 pensado para ejecutarse en navegador, movil y PWA de escritorio.

Su relevancia es de nicho pero concreta: ofrece salida estructurada determinista para gradacion automatizada de cartas, un escenario donde los VLM genericos suelen fallar por producir formateo conversacional no parseable. La revision base empleada es moondream2 (2024-08-26) y el ajuste se hizo sobre 420 muestras sinteticas multiera.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM dual: red de proyeccion de vision (ViT) + decodificador de lenguaje autorregresivo |
| Parametros totales | 2.128.563.696 (~2,13B) |
| Parametros activos | no aplica (arquitectura densa) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (safetensors), INT8 (ONNX) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo parte de Moondream2, que segun la documentacion del propio proyecto combina una red de proyeccion de imagen tipo ViT con un decodificador de lenguaje autorregresivo compacto. La model card del autor describe la base como una arquitectura dual de 0,5B parametros, si bien el recuento real de pesos safetensors asciende a 2.128.563.696 parametros, cifra mas alineada con las referencias publicas a Moondream2 (en torno a 1,86-2B). Esta discrepancia conviene tenerla presente al planificar recursos.

En cuanto al entrenamiento del ajuste, la informacion proporcionada indica: dataset de 420 muestras sinteticas multiera que mapean escaneos corregidos en perspectiva a un esquema estricto de identidad y condicion; hardware NVIDIA L4 en Google Cloud; 3 epocas; optimizador AdamW con tasa de aprendizaje 5x10^-5 y warmup lineal; y una perdida final convergida en el rango de 0,15-0,24. No se detalla la tecnica de alineacion (RLHF, DPO u otras) ni la composicion exacta del dataset. La propuesta tecnica principal es el pipeline hibrido: OpenCV se encarga del warp de perspectiva y de calculos deterministas de centrado, mientras el VLM realiza el OCR de identidad y la deteccion de defectos (blanqueamiento, astillado, silvering holografico), fusionandose ambos en un JSON final.

## Capacidades

- Reconocimiento optico de identidad de carta: extraccion de `card_name`, `set_name` y `card_number`.
- Evaluacion de centrado con ratios horizontales y verticales (por ejemplo "53.6/46.4") y tier PSA asociado.
- Deteccion de defectos de esquinas, bordes y superficie, con puntuacion y lista de fallos.
- Prediccion de grado global de conservacion (campo `overall_grade`).
- Salida en JSON conforme al esquema, sin texto prefijo ni bloques de codigo Markdown.
- Cobertura multiera: Wizards of the Coast vintage, e-Reader, EX/Diamond & Pearl/Platinum, era moderna Silver y Scarlet/Violet, y variantes Full Art, Secret Rare y Trainer Gallery.
- Vision-lenguaje general heredada de Moondream2: respuesta a preguntas visuales (pipeline `visual-question-answering`).
- Despliegue edge: artefacto ONNX INT8 para runtimes de navegador, movil y escritorio.
- No se documenta soporte de tool calling, function calling, agentes, audio ni thinking mode explicito.

## Casos de uso

- Gradacion automatizada de cartas en apps de coleccionismo: el usuario fotografia una carta, OpenCV corrige la perspectiva y el VLM devuelve el JSON con identidad y notas por criterio, alimentando una puntuacion final.
- Catalogacion masiva de colecciones: procesar lotes de escaneos para poblar una base de datos con nombre, set y numero, reduciendo la introduccion manual de datos.
- Pre-verificacion antes de enviar a gradacion profesional: estimar de forma orientativa el tier PSA probable para decidir si merece la pena enviar la carta a evaluar.
- Integracion de precios de mercado: combinando `set_name` y `card_number` extraidos con la API de JustTCG citada por el autor, para mostrar valor de mercado junto al estado fisico.
- Inspeccion de defectos asistida para compraventa: detectar blanqueamiento, astillado o silvering que el ojo puede pasar por alto en fotografias de listados.
- Aplicacion movil o PWA sin conexion: el ONNX INT8 permite ejecutar el modelo en el propio dispositivo, util en ferias o convenciones sin red fiable.
- Investigacion sobre VLM especializados: servir como caso de estudio de ajuste con salida JSON restrictiva a partir de un dataset sintetico pequeno (420 muestras).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de entrenamiento (perdida final convergida en ~0,15-0,24 sobre 3 epocas), sin evaluaciones sobre MMLU, HumanEval, GSM8K ni conjuntos especificos de gradacion.

## Requisitos de hardware

- Pesos completos en bfloat16: aproximadamente 4,0 GB de safetensors, por lo que se requiere en torno a 5-6 GB de VRAM para inferencia comoda con overhead de activaciones y KV cache.
- Artefacto ONNX INT8: ~399 MB, apto para ejecucion en CPU y en dispositivos con memoria limitada.
- GPU recomendadas: el autor entreno sobre NVIDIA L4; para inferencia, tarjetas de 8 GB o superiores (RTX 3060/4060 y superiores) son suficientes para la version bfloat16; para INT8 basta CPU moderna o GPU integrada.
- Cabe en GPU de consumo: si, en cualquier GPU con 8 GB o mas para FP16/BF16, y en moviles o navegador mediante el ONNX INT8.
- Opciones de despliegue: Transformers (con `trust_remote_code=True`), ONNX Runtime, CoreML para dispositivos Apple. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rarestry-Moondream2-Pokemon-Grading-v0.1.1 | ~2,13B | no disponible | Gradacion de cartas Pokemon | Apache 2.0 | HuggingFace (safetensors + ONNX INT8) |
| vikhyatk/moondream2 (base) | ~1,86-2B | no disponible | VLM general (VQA, captioning) | Apache 2.0 | HuggingFace |
| Moondream 2 0.5B | ~0,5B | no disponible | VLM destilado para edge extremo | no disponible en la busqueda | moondream.ai |
| Moondream 3 Preview | 9B totales, 2B activos (MoE disperso) | no disponible | VLM general de ultima generacion | no disponible en la busqueda | moondream.ai |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido: 420 muestras sinteticas, lo que eleva el riesgo de sobreajuste y de generalizacion limitada a cartas reales fuera de la distribucion cubierta.
- Uso de datos sinteticos: puede no capturar toda la variabilidad de iluminacion, camara, fondo y desgaste real de las cartas fisicas.
- Riesgo de alucinacion: al ser un VLM generativo, puede producir identificaciones incorrectas de nombre, set o numero, o inventar defectos. La salida JSON no garantiza correccion semantica.
- Discrepancia de parametros: la model card cita 0,5B mientras los pesos reales suman ~2,13B; conviene validar el presupuesto de memoria antes del despliegue.
- Idiomas e idioma de salida: no disponibles en la informacion; no se garantiza salida multilingue.
- Longitud de contexto no especificada, lo que dificulta planificar conversaciones o prompts largos.
- Dependencia del pipeline externo: la precision de la gradacion depende de OpenCV (warp de perspectiva y calculos deterministas) y no solo del modelo.
- Sin validacion independiente: 0 descargas y 0 likes en el momento de la ficha, sin benchmarks publicos ni evaluacion de terceros.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero al derivar de Moondream2 conviene revisar las condiciones del modelo base y de los datos de entrenamiento originales.
- No hay garantia de que la prediccion de tier PSA coincida con la de la entidad certificadora real; es una estimacion orientativa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/economyofdreams/Rarestry-Moondream2-Pokemon-Grading-v0.1.1
- Version anterior v0.1.0: https://huggingface.co/economyofdreams/Rarestry-Moondream2-Pokemon-Grading-v0.1.0
- Modelo base: https://huggingface.co/vikhyatk/moondream2
- Pagina del proyecto Moondream (modelos): https://moondream.ai/models
- Sitio de Moondream: https://moondream.ai/
- Demo de Moondream2 en GitHub: https://github.com/codemaker2015/moondream2-demo
- Suite Rarestry: https://rarestry.com
- Desarrollador (TehWiz Productions): https://tehwiz.com
