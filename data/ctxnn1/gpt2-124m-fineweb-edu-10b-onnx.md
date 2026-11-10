# ctxnn1/gpt2-124m-fineweb-edu-10b-onnx

## Resumen

`ctxnn1/gpt2-124m-fineweb-edu-10b-onnx` es una exportación a formato ONNX con cuantización dinámica de 8 bits del modelo `ctxnn1/gpt2-124m-fineweb-edu-10b`, un GPT-2 de 124 millones de parámetros reentrenado sobre el corpus FineWeb-Edu (aproximadamente 10 000 millones de tokens, según el nombre del modelo). Lo publica el usuario `ctxnn1` y su propósito principal es permitir la inferencia en el navegador mediante la librería transformers.js, sin necesidad de servidor ni GPU dedicada.

El modelo conserva la arquitectura transformer decoder-only original de GPT-2 y el tokenizador BPE de GPT-2, pero los pesos se han convertido a ONNX y cuantizado dinámicamente a QUInt8 (8 bits sin signo para pesos, con activaciones cuantizadas en tiempo de ejecución). El artefacto principal, `onnx/model_quantized.onnx`, ocupa 164 MB, lo que lo hace viable para descarga y ejecución en entornos web con recursos limitados.

Es relevante ahora como ejemplo de flujo completo de publicación de modelos pequeños orientados a despliegue en el cliente (edge/browser): reentrenamiento sobre datos educativos filtrados, exportación con `optimum-cli` y cuantización con `onnxruntime.quantization.quantize_dynamic`. No obstante, el repositorio no incluye model card propia más allá de la nota de exportación, no declara licencia y no aporta métricas de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2), exportado a ONNX |
| Parametros totales | 124 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (arquitectura GPT-2 base: 1024 tokens) |
| Tipos de cuantizacion | Cuantización dinámica QUInt8 (8 bits) sobre ONNX |
| Idiomas soportados | Inglés (`en`) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`onnx/model_quantized.onnx`, 164 MB) |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2 base: un transformer decoder-only con atención multi-cabeza causal, normalización previa a la atención y al feed-forward, y embeddings posicionales aprendidos. El modelo base `ctxnn1/gpt2-124m-fineweb-edu-10b` fue entrenado sobre FineWeb-Edu, un subconjunto de FineWeb filtrado por calidad educativa, con un volumen aproximado de 10 000 millones de tokens según indica el nombre del checkpoint. No se dispone de detalles sobre hiperparámetros, composición exacta del dataset, número de épocas ni si hubo fases de ajuste fino supervisado o preferencias (RLHF/DPO).

La innovación técnica de esta variante es puramente de despliegue: la exportación se realizó con `optimum-cli export onnx --task text-generation-with-past`, lo que incluye el grafo con caché de clave/valor para generación autorregresiva eficiente, y posteriormente se aplicó `onnxruntime.quantization.quantize_dynamic` con tipo QUInt8. El autor advierte que la cuantización altera ligeramente las salidas de texto respecto al modelo original. El tokenizador es el BPE estándar de GPT-2.

## Capacidades

- Generación de texto autoregresiva en inglés, con decodificación por muestreo (top-k, temperatura) o greedy.
- Razonamiento básico y continuación de texto; sin capacidades específicas de razonamiento extendido o modo "thinking".
- Generación de código limitada, derivada del corpus de entrenamiento; no se reporta rendimiento específico.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni razonamiento multi-paso estructurado.
- Multilingüe limitado: declarado únicamente para inglés.
- Ejecución en navegador mediante transformers.js con `dtype: 'q8'`.
- Soporte de caché de clave/valor (`text-generation-with-past`) para generación incremental.

## Casos de uso

- Demos interactivas en navegador: el modelo puede cargarse con transformers.js y ejecutarse íntegramente en el cliente, sin backend, para prototipos de autocompletado o generación de texto en páginas web.
- Aplicaciones educativas offline: al ejecutarse localmente en el navegador, permite construir herramientas de práctica de escritura en inglés sin enviar datos a un servidor.
- Pruebas de extremo a extremo de pipelines ONNX: sirve como modelo de referencia pequeño (164 MB) para validar exportación, cuantización y despliegue con ONNX Runtime Web antes de escalar a modelos mayores.
- Generación de texto en dispositivos con recursos limitados: su tamaño reducido permite inferencia en portátiles y móviles modernos sin GPU dedicada.
- Benchmarking de cuantización: útil para comparar la calidad de salida del modelo original frente a la versión QUInt8, tal como advierte el autor.
- Prototipado de chatbots simples de un solo turno o de pocos turnos en inglés, con expectativas moderadas de coherencia dado el tamaño del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para el artefacto cuantizado de 164 MB, incluyendo overhead de activaciones y caché de clave/valor.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. En GPU, cualquier tarjeta con al menos 1-2 GB de memoria es suficiente (por ejemplo, GTX 1650 o superior), aunque el modelo no está pensado para aceleración GPU de altas prestaciones.
- Cabe en cualquier GPU de consumo e incluso en navegadores de escritorio y móviles modernos mediante WebGPU o WASM.
- Opciones de despliegue: transformers.js (principal, con `dtype: 'q8'`), ONNX Runtime (Web, CPU, GPU), y potencialmente llama.cpp si se convierte a GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles. El autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| ctxnn1/gpt2-124m-fineweb-edu-10b-onnx | 124 M | no disponible (GPT-2 base: 1024) | ONNX QUInt8 | no disponible | Inferencia en navegador |
| gpt2 (OpenAI, original) | 124 M | 1024 | PyTorch/safetensors | MIT | Modelo base de referencia |
| ctxnn1/gpt2-124m-fineweb-edu-10b | 124 M | no disponible | safetensors (presumible) | no disponible | Modelo base reentrenado |
| Modelos GPT-2 pequeños en ONNX de terceros | 124 M | 1024 | ONNX | variable | Exportaciones comunitarias |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica permiso de uso comercial; debe contactarse con el autor o asumirse riesgo legal.
- Modelo de 124 M de parámetros: coherencia limitada en generaciones largas, propensión a derivas temáticas y repeticiones.
- Riesgo de alucinación alto en hechos, fechas y entidades, inherente a modelos pequeños sin ajuste por preferencias.
- Entrenado únicamente en inglés; el rendimiento en castellano u otros idiomas será deficiente.
- La cuantización QUInt8 altera las salidas respecto al modelo original, según advierte el propio autor.
- Sin model card detallada: no hay información sobre sesgos, composición del dataset, filtros de seguridad ni evaluación.
- Contexto efectivo presumiblemente limitado a 1024 tokens (arquitectura GPT-2), aunque no se confirma en el repositorio.
- Sin soporte documentado de tool calling, agentes ni instrucciones por system prompt; no recomendado para aplicaciones de producción que requieran fiabilidad.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ctxnn1/gpt2-124m-fineweb-edu-10b-onnx
- Modelo base: https://huggingface.co/ctxnn1/gpt2-124m-fineweb-edu-10b
- Código de entrenamiento y muestras: https://github.com/ctxnn/gpt-2
- Documentación de transformers.js: https://huggingface.co/docs/transformers.js
- FineWeb-Edu (dataset de referencia): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
