# scottlowry/Ornith-1.5-122B-oQ6e-fp16-mtp

## Resumen

Ornith-1.5-122B-oQ6e-fp16-mtp es un checkpoint cuantizado del modelo base ornith-ai/Ornith-1.5-122B, publicado por el usuario scottlowry. Se trata de una conversión de precisión mixta generada con oQ (oMLX v0.7.1), una herramienta de cuantización orientada al ecosistema MLX de Apple. El resultado es un modelo de 125.086.497.008 parámetros reales (122,1B en el tronco lingüístico, 0,45B en la torre de visión y 2,52B en una cabeza MTP) almacenado en unos 96,8 GiB, lo que permite ejecutar un modelo de escala 122B en hardware Apple Silicon con memoria unificada grande.

La relevancia de esta ficha es doble: por un lado documenta una técnica de cuantización mixta que combina capas en 6 bits y 8 bits (afín, grupo 64 y 128) con componentes en FP16/FP32, logrando 6,649 bits por peso de media; por otro, expone un caso de despliegue local de un MoE multimodal con cabeza de predicción multi-token (MTP), pensada para decodificación especulativa. No hay información publicada sobre licencia, idiomas ni contexto, por lo que las evaluaciones de idoneidad para producción deben hacerse con cautela.

El modelo está etiquetado con la arquitectura `qwen3_5_moe`, lo que sitúa el tronco en la familia Qwen3.5 con mezcla de expertos, e incluye una torre de visión, por lo que es multimodal de entrada. El repo ocupa 104 GB y fue creado el 20 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (tag `qwen3_5_moe`), transformer con mezcla de expertos, torre de vision y cabeza MTP |
| Parametros totales | 125.086.497.008 (125,09B) |
| Parametros activos | no disponible (el tag indica MoE, pero la model card no publica el numero de parametros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mezcla de precisiones (oQ / oMLX v0.7.1): afin 6-bit grupo 64 (96,129% de los pesos), afin 6-bit grupo 128 (0,724%), afin 8-bit grupo 64 (2,368%), afin 8-bit grupo 128 (0,370%), FP16 (0,048%), FP32 (0,361%). Media efectiva: 6,649 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (`library_name: mlx`), cuantizacion afín |
| Tamano del repositorio | 104,0 GB |
| Parametros por componente | Lenguaje: 122,112B (93,202 GiB); Vision: 0,451B (1,681 GiB); Cabeza MTP: 2,524B (1,933 GiB) |
| Modelo base | ornith-ai/Ornith-1.5-122B |
| Fecha de creacion | 2026-10-20 |

## Arquitectura y entrenamiento

El checkpoint reproduce la arquitectura del modelo base ornith-ai/Ornith-1.5-122B, etiquetada como `qwen3_5_moe`: un transformer con capas de mezcla de expertos (MoE) en el tronco lingüístico de 122,1B parámetros, más una torre de visión de 0,45B parámetros que habilita entrada multimodal, y una cabeza de predicción multi-token (MTP) de 2,52B parámetros. La MTP se usa habitualmente para decodificación especulativa: predice varios tokens por paso y acelera la generación cuando el modelo verificador los acepta.

No se dispone de información sobre el entrenamiento del modelo base: número de tokens, composición del dataset, fases de RLHF/DPO o innovaciones de atención no están documentadas en la información proporcionada. Lo que sí está documentado es el proceso de cuantización. La herramienta oQ de oMLX aplica precisión mixta: el 96,1% de los pesos lógicos se almacena en afín 6-bit con grupo 64 (6,50 bits/peso), un 2,4% adicional en afín 8-bit grupo 64, un 0,37% en afín 8-bit grupo 128 y un 0,36% en FP32, presumiblemente reservado para capas o tensores sensibles a la precisión (normalizaciones, embeddings o cabezas). El resultado es una media de 6,649 bits por peso, con un total de 96,816 GiB de pesos.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredados del tronco lingüístico de 122B parámetros.
- Procesamiento de imágenes: el checkpoint incluye una torre de visión de 0,451B parámetros, por lo que admite entrada multimodal (imagen + texto).
- Predicción multi-token mediante la cabeza MTP, utilizable para decodificación especulativa en MLX y reducción de latencia en generación autoregresiva.
- Razonamiento multi-paso y soporte de agentes: no documentado explícitamente en la model card; debe validarse empíricamente.
- Tool calling / function calling: no documentado en la información disponible.
- Capacidades multilingües: no disponibles; la model card no declara idiomas.
- Capacidades especiales (modo thinking, audio): no disponibles.

## Casos de uso

- Inferencia local privada en Mac Studio o MacBook Pro con memoria unificada de 128 GB o más: el checkpoint está en formato MLX y evita enviar datos a la nube, lo que encaja en sectores con requisitos de confidencialidad (legal, sanitario, financiero).
- Prototipado e investigación sobre MoE multimodales de gran escala: al ser una conversión de 6,649 bits/peso, permite estudiar el comportamiento de un modelo de 122B en hardware de sobremesa sin clúster de GPUs.
- Análisis de documentos con imágenes: la torre de visión permite extraer información de capturas, diagramas o formularios escaneados junto con el texto asociado.
- Evaluación de decodificación especulativa: la cabeza MTP incluida permite medir la ganancia de throughput frente a generación estándar en MLX, útil para publicaciones o benchmarks internos.
- Generación asistida de código en entornos locales: la escala de 122B en un MoE sugiere buena capacidad de código, aunque no hay benchmarks publicados que lo confirmen; conviene validar con HumanEval o MBPP antes de adoptarlo.
- Comparación de estrategias de cuantización: sirve como referencia práctica para medir la degradación de calidad de una cuantización mixta 6/8-bit frente al modelo base en FP16/BF16.
- Base para ajuste fino con LoRA/QLoRA: el formato MLX permite adaptar el modelo a dominios concretos sin reentrenar el tronco completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: los pesos ocupan 96,816 GiB; se necesita memoria unificada de al menos ~100 GB, con 128 GB recomendados para dejar margen a la KV cache y al contexto.
- GPU compatibles: exclusivamente Apple Silicon (M-series). El formato MLX no se ejecuta en CUDA ni en ROCm de forma nativa.
- Configuraciones viables: Mac Studio con M3 Ultra o M4 Ultra de 128 GB o 256 GB; MacBook Pro con M4 Max de 128 GB (ajustado); cualquier equipo con menos de 128 GB de memoria unificada no podrá cargar el checkpoint completo.
- No cabe en GPUs de consumo tipo RTX 4090 (24 GB) ni en A100/H100 en su formato MLX; para CUDA habría que reconvertir los pesos, y no se proporciona esa conversión.
- Opciones de despliegue: MLX (`mlx-lm`) y la propia librería oMLX del ecosistema; no se incluyen pesos GGUF, por lo que llama.cpp, Ollama o TGI no son utilizables sin una conversión adicional.
- Latencia y throughput: no disponibles. La cabeza MTP sugiere que el autor prevé uso de decodificación especulativa, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scottlowry/Ornith-1.5-122B-oQ6e-fp16-mtp | 125,09B (6,649 bits/peso, 96,8 GiB) | no disponible | Afin 6/8-bit + FP16/FP32 (MLX) | no disponible | HuggingFace, formato MLX |
| ornith-ai/Ornith-1.5-122B (base) | 125,09B en precision completa (tamano no publicado) | no disponible | FP16/BF16 (presumible) | no disponible | HuggingFace |
| Otros MoE de escala ~120B con vision | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible |

La comparación más fiable es contra el propio modelo base: la conversión oQ reduce el almacenamiento a 96,8 GiB y 6,649 bits/peso, a costa de una posible pérdida de calidad que no está cuantificada en la información disponible. No se han encontrado datos verificables de alternativas equivalentes en la búsqueda.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial está permitido. Es un bloqueante para producción hasta verificar la licencia del modelo base ornith-ai/Ornith-1.5-122B.
- Idiomas y contexto no documentados: no se conoce la ventana de contexto ni la cobertura lingüística, lo que impide planificar aplicaciones con requisitos de longitud o idioma.
- Cuantización con pérdida: 6,649 bits/peso implica degradación potencial frente al modelo en FP16, especialmente en tareas sensibles como matemáticas, código o razonamiento de cadena larga. No hay evaluación publicada del delta.
- Cabeza MTP no validada: su utilidad real para decodificación especulativa depende de la tasa de aceptación; no se han publicado mediciones.
- Exclusividad de plataforma: el formato MLX limita el despliegue a Apple Silicon, lo que reduce la portabilidad y complica el escalado horizontal.
- Riesgo de alucinación: inherente a los LLM de esta escala; sin benchmarks no se puede acotar su magnitud.
- Sesgos: no documentados; no hay información sobre la composición del dataset de entrenamiento.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: indicio de que no ha sido validado por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/scottlowry/Ornith-1.5-122B-oQ6e-fp16-mtp
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
