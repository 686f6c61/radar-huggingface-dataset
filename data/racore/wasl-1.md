# racore/Wasl-1

## Resumen

Wasl-1 (وصل) es un prototipo de investigación publicado por la organización Racore en HuggingFace: un transformer causal decoder-only de 10.163.520 parámetros (10,16 M) entrenado desde cero sobre texto en árabe egipcio generado por plantillas. Su propósito declarado es convertir eventos de pedidos de comercio electrónico con pago contra reembolso (cash-on-delivery) en un estado estructurado que contenga una puntuación de intención de entrega, un nivel de riesgo de devolución y una ruta de cumplimiento. La implementación es una arquitectura propia en PyTorch denominada `SiyaqFamilyTransformer`, con 8 capas, dimensión oculta de 320, 8 cabezas de atención, GELU, RMSNorm y codificación posicional RoPE con theta = 500.000.

El modelo es relevante únicamente como pieza experimental: el repositorio muestra 0 descargas, 0 likes y un tamaño declarado de 0,0 GB, y la propia model card advierte de que el checkpoint remoto y el contenido del repositorio no fueron verificados de forma independiente. La model card también indica que el cuaderno de entrenamiento suministrado no demuestra una generación fiable del estado estructurado ni una predicción realista del riesgo de devolución, y que el truncamiento a 256 caracteres puede eliminar por completo el estado objetivo antes de entrenar.

Se trata, por tanto, de un artefacto de investigación con arquitectura personalizada, tokenizador de carácter (no BPE) y datos sintéticos, sin integración con la librería Transformers, sin benchmark de contexto largo y sin resultados de evaluación publicados. No debe considerarse un modelo listo para producción ni para uso comercial real pese a su licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (implementación propia `SiyaqFamilyTransformer` en PyTorch) |
| Parametros totales | 10.163.520 (10,16 M); embeddings de entrada y proyección de salida comparten pesos (weight tying) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 caracteres en entrenamiento (255 posiciones de entrada para predicción del siguiente token); máximo configurado de 262.144 posiciones, no validado |
| Tipos de cuantizacion | no disponible (el checkpoint se exporta como state dict de PyTorch; no se documentan cuantizaciones) |
| Idiomas soportados | árabe (orientado a árabe egipcio) |
| Licencia | Apache 2.0 |
| Formato de pesos | state dict de PyTorch (no safetensors ni GGUF), junto con un fichero de configuración y un vocabulario personalizado |
| Capas | 8 |
| Dimension oculta | 320 |
| Cabezas de atencion | 8 (dimensión por cabeza: 40) |
| Dimension feed-forward | 1.088 |
| Activacion | GELU |
| Normalizacion | RMSNorm |
| Codificacion posicional | RoPE, theta = 500.000 |
| Vocabulario | capacidad de embeddings de 4.096 entradas; 94 entradas ajustadas en la ejecución guardada |
| Tokenizacion | búsqueda carácter a carácter (clase `FastByteTokenizer`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only escrito a mano en PyTorch. Consta de 8 bloques con atención densa y causal (sin mecanismos dispersos), dimensión oculta de 320, 8 cabezas de 40 dimensiones, feed-forward de 1.088 unidades con activación GELU y RMSNorm. Usa RoPE con theta = 500.000 para la codificación posicional y ata los pesos de los embeddings de entrada con la proyección de salida. La configuración declara `dropout=0.05`, pero la implementación no aplica ninguna capa de dropout ni pasa una probabilidad de dropout de atención distinta de cero; tampoco implementa KV cache, memoria de streaming ni ningún mecanismo de contexto largo.

El tokenizador, pese a llamarse `FastByteTokenizer`, itera sobre caracteres Unicode en lugar de bytes UTF-8, de modo que cadenas como `<bos>`, `<eos>`, `[EVENT]` o `[STATE]` se codifican carácter a carácter en vez de reconocerse como tokens especiales; los caracteres desconocidos se mapean a `<unk>`. El entrenamiento se realizó desde cero sobre texto en árabe egipcio generado por plantillas, con ejemplos serializados en el formato `<bos>[EVENT] {evento_1} ... [EVENT] {evento_n} [STATE] {estado_json}<eos>` y un límite de 256 caracteres por secuencia. No se documenta el número de tokens de entrenamiento, la composición del dataset, ni fases de RLHF o DPO. Tampoco se documenta ninguna innovación técnica adicional.

El estado estructurado objetivo incluye nueve campos en árabe: `اسم_العميل` (nombre del cliente o comerciante), `المنطقة_والحي` (región y distrito), `العنوان_المفصل` (dirección detallada), `قيمة_الشحنة` (valor del pedido), `استجابة_العميل` (señal de comunicación), `مؤشر_جدية_الاستلام` (puntuación de intención, sintética), `مستوى_مخاطرة_المرتجع` (nivel de riesgo, sintético), `مسار_التنفيذ_المعتمد` (ruta seleccionada por el generador) y `القرار_التشغيلي_الملزم` (acción operativa plantillada). Estos campos son objetivos del dataset, no salidas demostradas del modelo.

## Capacidades

- Generación de texto causal limitada a árabe (árabe egipcio) sobre el dominio de pedidos contra reembolso y logística.
- Generación de un estado estructurado (intención de entrega, riesgo de devolución, ruta de cumplimiento) como objetivo declarado, pero no demostrado de forma fiable según la propia model card.
- Formateo de salida en JSON con nueve campos predefinidos, siempre que el modelo reproduzca el formato de entrenamiento.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; solo árabe, y muy probablemente restringido al subconjunto de vocabulario de 94 entradas ajustadas.
- Capacidades especiales (modo thinking, visión, audio, decodificación especulativa, contexto largo): no disponibles.
- Integración con la API `generate()` de Transformers, `pipeline()` o `AutoModelForCausalLM`: no disponible.

## Casos de uso

- Prototipado académico de flujos COD en e-commerce: el modelo puede usarse como banco de pruebas para estudiar cómo un transformer minúsculo afronta la tarea de convertir eventos de pedido en un estado estructurado, siempre que el uso sea experimental y no se dependa de la fiabilidad de la salida.
- Análisis de la brecha entre datos sintéticos y producción: sirve para medir hasta qué punto un modelo de 10 M entrenado solo con plantillas generaliza (o no) al lenguaje real de direcciones y comunicaciones de clientes egipcios.
- Prueba de conceptos de puntuación de riesgo de devolución: se puede emplear como línea base mínima frente a la que comparar clasificadores supervisados o modelos multilingües mayores, dada su naturaleza de prototipo no validado.
- Investigación sobre tokenizadores a nivel de carácter para árabe: el `FastByteTokenizer` permite explorar el impacto de un vocabulario de solo 94 entradas y de la codificación carácter a carácter en árabe egipcio.
- Extracción de entidades de dirección en texto libre (nombre, región, distrito, dirección detallada): uso exploratorio para evaluar la viabilidad de un modelo compacto que corre en hardware modesto, no como componente de producción.
- Estudio de evaluación de robustez y alucinación en dominios tabulares/JSON: la tarea de emitir un JSON estructurado con nueve campos es un caso útil para medir formatos inválidos, campos ausentes y valores inventados.
- Demostración educativa de arquitecturas transformer personalizadas: al estar el código de definición disponible en la model card, sirve para enseñar cómo se construye un decoder-only con RoPE, RMSNorm y weight tying.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no reporta métricas de MMLU, HumanEval, GSM8K ni de ninguna tarea específica de e-commerce o COD, ni compara el modelo con alternativas. Tampoco existe un benchmark de contexto largo pese al valor configurado de 262.144 posiciones.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): aproximadamente 41 MB en fp32 (10,16 M × 4 bytes), ~20 MB en fp16/bf16, ~10 MB en int8 y ~5 MB en int4. Las activaciones añaden un coste despreciable dada la dimensión oculta de 320 y la ventana de 256 caracteres.
- GPU recomendadas: ninguna GPU dedicada es necesaria; cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) o incluso una GPU integrada es más que suficiente. En A100/H100 el modelo está infrautilizado.
- Cabe en GPU consumer: sí, en cualquier GPU consumer e incluso en CPU, Raspberry Pi o dispositivos móviles, por su tamaño de 10 M de parámetros.
- Opciones de despliegue: no hay integración con vLLM, llama.cpp, Ollama ni TGI, porque el checkpoint se exporta como state dict de PyTorch sin `auto_map`, sin tokenizador registrado y sin método `generate()`. El despliegue exige cargar la arquitectura personalizada definida en la model card y ejecutar el bucle de generación manualmente; cualquier uso en vLLM, llama.cpp u Ollama requeriría una conversión previa no documentada.
- Latencia y throughput estimados: no disponibles. No se publican cifras de latencia ni de tokens por segundo, y no se ha implementado KV cache, lo que penalizaría la generación autoregresiva en secuencias largas.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks ni de especificaciones verificadas de Wasl-1, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas. La tabla siguiente resume la situación.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Racore/Wasl-1 | 10,16 M | 256 caracteres (entrenamiento); 262.144 configurado, no validado | No disponible (sin benchmarks) | Apache 2.0 | Prototipo, 0 descargas, repo de 0,0 GB |
| Alternativas de la misma categoria (modelos árabe egipcio orientados a COD) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Modelos transformer minúsculos multilingües comparables por tamaño | no disponible | no disponible | no disponible | no disponible | no disponible |

No se identifican en la información proporcionada modelos comparables directos, ni en tamaño, ni en tarea, ni en idioma.

## Limitaciones y advertencias

- Estado del arte no verificado: la model card indica explícitamente que el contenido del repositorio remoto y el checkpoint no fueron verificados de forma independiente durante su redacción.
- Generación estructurada no demostrada: el cuaderno suministrado no establece una generación fiable de estados estructurados ni una predicción realista de riesgo de devolución.
- Truncamiento destructivo: el límite de 256 caracteres puede eliminar el estado objetivo completo antes de entrenar, invalidando la señal de aprendizaje.
- Las puntuaciones de intención y riesgo son etiquetas sintéticas del generador de plantillas, no probabilidades calibradas; un porcentaje generado no equivale a una probabilidad real de entrega exitosa.
- Tokenizador defectuoso para su propósito: los tokens especiales se codifican carácter a carácter y los caracteres fuera del vocabulario se mapean a `<unk>`, con solo 94 entradas ajustadas.
- Dropout configurado pero no aplicado, lo que puede afectar a la regularización real del entrenamiento.
- Ausencia de KV cache y de cualquier mecanismo de memoria: la generación autoregresiva es ineficiente y no hay soporte de contexto largo validado.
- Sin integración con Transformers: no se puede cargar con `pipeline()` ni `AutoModelForCausalLM.from_pretrained()`; cualquier despliegue exige el código personalizado.
- Cobertura lingüística muy estrecha: solo árabe (orientado a egipcio), con vocabulario de entrenamiento limitado; el rendimiento fuera de ese dominio es impredecible.
- Sesgos: no se documenta ningún análisis de sesgos; al proceder de datos generados por plantillas, el modelo reproducirá las regularidades y posibles sesgos del generador.
- Licencia Apache 2.0 permite uso comercial en teoría, pero el propio estado del arte (prototipo de investigación, sin evaluación) desaconseja su uso en producción; no hay garantías de funcionamiento declaradas.
- Datos de adopción nulos: 0 descargas y 0 likes, sin evidencia de uso externo ni de reproducibilidad por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/racore/Wasl-1
- Cuaderno de entrenamiento citado: `WASAL_1_Colab_Notebook.ipynb` (no se proporciona enlace directo a un repositorio de código)
- Papers, blogs, repositorios o demos adicionales: no disponible en la informacion proporcionada
