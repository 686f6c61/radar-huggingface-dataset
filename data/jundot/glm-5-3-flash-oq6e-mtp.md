# Jundot/GLM-5.3-Flash-oQ6e-mtp

## Resumen

GLM-5.3-Flash-oQ6e-mtp es un checkpoint cuantizado en precisión mixta del modelo zai-org/GLM-5.3-Flash, preparado por el usuario Jundot mediante la herramienta oQ (oMLX v0.7.1). El modelo original es un mixture-of-experts multimodal nativo de 320B parámetros totales y 18B parámetros activos por token, que combina atención dispersa con atención lineal y conexiones de hiperconexión restringidas por variedad (Manifold-Constrained Hyper-Connections, mHC). El checkpoint incluye el backbone de lenguaje, el codificador de visión y la cabeza de predicción multi-token (MTP).

La aportación concreta de esta versión es la cuantización: el autor asigna bits por sensibilidad medida de cada capa, redondea cada grupo con una matriz de importancia (128 muestras x 512 tokens) y reajusta escala y sesgo mediante mínimos cuadrados ponderados. El resultado es una media efectiva de 6.549 bits por peso sobre 321.323.031.390 parámetros lógicos, con un almacenamiento total de 244,960 GiB (263,024 GB).

Es relevante porque permite ejecutar un MoE multimodal de escala frontera en hardware Apple Silicon con memoria unificada, algo que en BF16 resultaría inasumible para la mayoría de equipos. La licencia MIT, heredada del modelo fuente, facilita su uso comercial. La contrapartida es que el formato MLX restringe el despliegue al ecosistema de Apple, y que el repositorio no presenta aún descargas ni validación por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts multimodal nativa, con atención dispersa y lineal combinadas y Manifold-Constrained Hyper-Connections (mHC); incluye backbone de lenguaje, codificador de visión y cabeza de predicción multi-token (MTP) |
| Parametros totales | 321.323.031.390 (~321,3B) |
| Parametros activos | 18B (según el autor del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta oQe: affine 6-bit grupo 64 (98,598% de los pesos), affine 8-bit grupo 64 (1,186%), BF16 (0,189%), FP32 (0,027%); media efectiva 6,549 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada del modelo fuente) |
| Formato de pesos | safetensors en formato MLX (librería `mlx`) |
| Tamano del repositorio | 263,0 GB |
| Modelo base | zai-org/GLM-5.3-Flash |
| Fecha de creacion | 2026-10-11 |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer de tipo mixture-of-experts con enrutamiento disperso: 320B parámetros totales de los que solo se activan 18B por token. Sobre esa base, el modelo incorpora dos innovaciones señaladas explícitamente en la model card: la combinación de atención dispersa (sparse attention) con atención lineal, orientada a reducir el coste computacional en secuencias largas, y las Manifold-Constrained Hyper-Connections (mHC), un mecanismo de conexión entre capas. El carácter multimodal es nativo, no añadido a posteriori: el checkpoint incluye un codificador de visión de 0,564B parámetros (1.050 GiB) y una cabeza MTP de 7,433B parámetros (5.673 GiB) que habilita decodificación especulativa multi-token.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni sobre si se aplicaron etapas de RLHF, DPO u otras técnicas de alineación. El trabajo de este repositorio es exclusivamente de cuantización, no de entrenamiento: la model card describe el proceso de oQ, que mide la sensibilidad de cada capa, asigna bits en consecuencia y refina escalas y sesgos con una matriz de importancia construida a partir de 128 muestras de 512 tokens cada una. La distribución resultante concentra el 98,598% de los pesos lógicos en affine 6-bit con grupo de 64, reservando 8-bit y BF16 para los estratos más sensibles (3.810 y 607 millones de parámetros lógicos, respectivamente) y FP32 para 86 millones de parámetros lógicos. El desglose por componente es: backbone de lenguaje 313,327B (238,237 GiB), codificador de visión 0,564B (1,050 GiB) y cabeza MTP 7,433B (5,673 GiB).

## Capacidades

- Generación de texto y conversación multi-turno: el tag `conversational` y el pipeline `image-text-to-text` indican uso de chat con entrada de imagen.
- Comprensión de imágenes: el checkpoint incluye el codificador de visión del modelo base, por lo que conserva las capacidades de entrada image-text-to-text.
- Decodificación especulativa mediante cabeza MTP: la cabeza de predicción multi-token de 7,433B parámetros se incluye explícitamente en el checkpoint, lo que permite acelerar la generación prediciendo varios tokens por paso.
- Razonamiento y matemáticas: no disponible en la información proporcionada (no se documentan capacidades específicas ni benchmarks).
- Generación de código: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Uso como agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidad especial: modo de pensamiento (thinking mode), audio u otras modalidades distintas de imagen y texto: no disponible en la información proporcionada.

## Casos de uso

- Despliegue local de un MoE multimodal de escala frontera en Apple Silicon: es el escenario principal para el que se ha construido el checkpoint. Con 244,960 GiB de pesos en disco y formato MLX, un Mac Studio o Mac Pro con memoria unificada suficiente puede ejecutar el modelo sin depender de clústeres de GPU NVIDIA.
- Análisis de documentos con componentes visuales: el modelo acepta pares imagen-texto, de modo que puede procesar capturas de pantalla, diagramas, gráficos o páginas escaneadas y responder preguntas sobre ellos dentro de una misma conversación.
- Asistentes conversacionales internos para investigación: al no requerir conexión a servicios externos una vez desplegado, encaja en entornos con requisitos de confidencialidad donde los datos no pueden salir de la infraestructura propia.
- Inferencia acelerada por decodificación especulativa: la inclusión de la cabeza MTP permite emplear decodificación especulativa multi-token, útil en cargas de generación larga donde el coste por token es determinante.
- Evaluación comparativa de técnicas de cuantización: el repositorio documenta con detalle la distribución de bits por capa y el error de reajuste, por lo que sirve como referencia para investigar el impacto de la cuantización mixta en modelos MoE multimodales.
- Prototipado de producto sobre licencia permisiva: la licencia MIT del modelo fuente permite integrar el modelo en productos comerciales sin obligación de apertura del código propio, algo relevante en fases de validación de producto.
- Fine-tuning o adaptación posterior: al distribuirse en safetensors, el checkpoint puede servir como punto de partida para adaptaciones (LoRA u otras) sobre el backbone cuantizado o para comparar contra la versión BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye métricas de MMLU, HumanEval, GSM8K, MMMU ni ninguna otra evaluación, ni comparaciones cuantitativas con el modelo base en BF16 más allá de la distribución de bits y el tamaño en disco.

## Requisitos de hardware

- Peso en disco de los pesos: 244,960 GiB (263,024 GB) según el desglose del autor. A esto hay que añadir el espacio del tokenizador, la configuración y los ficheros auxiliares.
- Memoria unificada necesaria: al menos ~245 GiB solo para los pesos, más la caché KV y las activaciones. En la práctica esto implica equipos Apple Silicon con 256 GB de memoria unificada como mínimo absoluto y 512 GB para trabajar con comodidad y contexto prolongado.
- Equipos Apple recomendados: Mac Studio o Mac Pro con chip de la familia M Ultra y 256 GB o 512 GB de memoria unificada. No cabe en ningún portátil ni en configuraciones de 128 GB o inferiores.
- GPU de consumo: no cabe. Una RTX 4090 con 24 GB queda muy lejos de los ~245 GiB requeridos, y no existe configuración SLI/NVLink de GPU de consumo capaz de alojar el modelo.
- GPU profesionales: en un hipotético despliegue fuera de MLX harían falta al menos 4 GPU de 80 GB (H100, A100 80GB), y en la práctica 8 GPU de 80 GB para disponer de margen para caché KV y activaciones de un modelo con 18B parámetros activos.
- Opciones de despliegue: el formato es MLX, por lo que el camino natural es `mlx-lm` y `mlx-vlm` sobre Apple Silicon (incluidos servidores compatibles con la API de OpenAI). El uso con vLLM, llama.cpp, Ollama o TGI requeriría una conversión previa del checkpoint a otro formato, conversión que no está documentada en la información disponible.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por petición, ni con ni sin decodificación especulativa mediante la cabeza MTP.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GLM-5.3-Flash-oQ6e-mtp (este) | 321,3B | 18B | no disponible | oQe precision mixta, 6,549 bits/peso | MIT | MLX, safetensors, 263 GB |
| zai-org/GLM-5.3-Flash (base) | 320B | 18B | no disponible | no cuantizado (precision original) | MIT | Repositorio HuggingFace del autor original |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Solo se dispone de datos verificables del modelo base. La información proporcionada no incluye especificaciones de otros modelos comparables de tamaño o tarea similares, por lo que no se puede establecer una comparación cuantitativa fiable con alternativas de terceros.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. La model card no documenta evaluación de sesgos, y al ser una cuantización del modelo base, heredaría los del modelo original, que no se detallan.
- Riesgo de alucinación: no cuantificado. No hay evaluaciones de fidelidad ni de tasa de alucinación publicadas para este checkpoint ni referenciadas para el modelo base.
- Degradación por cuantización: el checkpoint usa 6,549 bits/peso de media, con el 98,598% de los pesos en affine 6-bit. Aunque el método reajusta escalas y sesgos por grupo, existe una pérdida de precisión respecto a BF16 que no está medida con benchmarks en la información disponible.
- Cobertura de idiomas: no disponible. No se especifica qué idiomas soporta el modelo ni su calidad relativa en cada uno.
- Longitud de contexto: no disponible. Se desconoce la ventana máxima soportada, dato crítico para planificar el consumo de memoria de la caché KV.
- Restricciones de licencia: la licencia es MIT, lo que permite uso comercial, modificación y redistribución con atribución y conservación del aviso de copyright. No se indican restricciones adicionales, pero conviene verificar el fichero LICENSE del repositorio antes de un despliegue en producción.
- Dependencia del ecosistema MLX: al distribuirse en formato MLX, el modelo está atado a Apple Silicon. No hay conversión documentada a GGUF ni soporte declarado en vLLM, llama.cpp, Ollama o TGI.
- Requisitos de memoria: ~245 GiB solo para pesos. Cualquier intento de ejecución en hardware con menos memoria unificada o VRAM fallará o requerirá offloading con una penalización severa de latencia.
- Madurez del repositorio: cero descargas y cero "likes" en el momento de redactar esta ficha, creado y actualizado el mismo día. No hay validación independiente de que el checkpoint cargue correctamente ni de que las salidas sean equivalentes al modelo base.
- Proceso de cuantización propietario: la mejora "Improved oQe Quantization" se documenta en una pull request concreta del repositorio omlx (jundot/omlx#4385); la reproducibilidad depende de esa versión concreta (oMLX v0.7.1).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jundot/GLM-5.3-Flash-oQ6e-mtp
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Repositorio de la herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Pull request de la cuantización Improved oQe: https://github.com/jundot/omlx/pull/4385
- Paper, blog, demo u otros repositorios del modelo base: no disponible en la informacion proporcionada
- Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan relacion con el modelo ni con el autor, por lo que no se han utilizado como fuente.
