# 1bit-MONSTER/LFM2.5-2.6B-GGUF

## Resumen

LFM2.5-2.6B-GGUF es una redistribución del modelo LiquidAI/LFM2.5-2.6B en formato GGUF con cuantización Q4_K_M, publicada por el usuario 1bit-MONSTER. El modelo original lo desarrolla Liquid AI y emplea una arquitectura híbrida propia de la familia LFM2, con aproximadamente 2.697 millones de parámetros. El repositorio no aporta pesos nuevos ni un proceso de entrenamiento propio: su valor añadido es el empaquetado en un único fichero GGUF y la publicación de mediciones de rendimiento sobre hardware concreto.

La relevancia de esta ficha es doble. Por un lado, permite ejecutar un modelo de ~2,7B parámetros en un equipo de consumo o en un mini-PC con GPU integrada potente, con un throughput medido de 101 tok/s en generación sobre un AMD Ryzen AI Max+ 395 (Radeon 8060S). Por otro, documenta el uso del modelo a través del motor propietario del autor (1bit engine), lo que condiciona las instrucciones de despliegue incluidas en la model card.

Conviene subrayar que la información disponible es escasa: el repositorio no detalla composición del dataset, idiomas soportados, benchmarks de calidad ni resultados de evaluación estándar. Todo lo que sigue se limita a lo declarado en la model card y a los metadatos de Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrida de la familia LFM2 (detalle exacto no disponible) |
| Parámetros totales | 2.697.198.592 (~2,7B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (única incluida en el repo) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | GGUF |
| Tamaño del repositorio | 1,7 GB |
| Fichero incluido | `LFM2.5-2.6B-Q4_K_M.gguf` |
| Modelo base | LiquidAI/LFM2.5-2.6B |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia LFM2 de Liquid AI, descrita por el autor como una arquitectura híbrida. No se especifica en la información disponible qué combinación exacta de capas utiliza (atención completa, atención lineal, convoluciones o SSM), ni la distribución de parámetros entre componentes. Tampoco se documentan el número de tokens de entrenamiento, la composición del corpus, ni si hubo fases de RLHF, DPO u otro ajuste por preferencias.

Esta publicación no entrena ni modifica el modelo: redistribuye la cuantización Q4_K_M oficial de Liquid AI (`LiquidAI/LFM2.5-2.6B-GGUF`) y añade mediciones de rendimiento. La innovación destacable, por tanto, no está en el modelo sino en el entorno de ejecución: el autor reporta resultados con su propio motor (1bit engine) sobre GPU integrada, incluyendo una comparación con un backend Vulkan anterior ya retirado (3.297 tok/s de prompt processing y 107 tok/s de generación en septiembre de 2026, frente a 2.633 tok/s y 101 tok/s con el backend HRX en noviembre de 2026).

## Capacidades

- Generación de texto conversacional: el repositorio está etiquetado como `conversational` y el autor verificó que el fichero responde correctamente a una pregunta conocida.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el GGUF puede servirse mediante infraestructura compatible con la API de Hugging Face.
- Ejecución en llama.cpp: el fichero sigue el formato GGUF estándar y se ejecuta con llama.cpp, según la propia model card.
- Integración con el motor 1bit: el autor documenta el comando `1bit serve -m LFM2.5-2.6B-Q4_K_M.gguf --device hrx`.
- Tool calling, agentes, razonamiento multi-paso, visión, audio y modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistente conversacional local en mini-PC: con 1,7 GB de pesos en Q4_K_M y 101 tok/s de generación medidos en un Ryzen AI Max+ 395, el modelo es viable para un chatbot de escritorio que funcione sin conexión y sin GPU dedicada.
- Clasificación y extracción de información en lotes: el prompt processing de 2.633 tok/s permite procesar documentos cortos y extraer campos estructurados en pipelines por lotes sobre CPU/GPU integrada.
- Filtrado previo en arquitecturas de enrutamiento: al ser un modelo pequeño y rápido, puede actuar como primer nivel que descarte consultas triviales antes de invocar un modelo mayor, reduciendo coste por petición.
- Prototipado de aplicaciones con llama.cpp: el GGUF estándar permite validar rápidamente una integración con la API de llama.cpp o con servidores compatibles antes de comprometerse con un modelo mayor.
- Generación de texto en entornos con restricciones de memoria: 1,7 GB de repositorio encajan en equipos con 8 GB de RAM o en contenedores pequeños, lo que facilita despliegues en el borde.
- Evaluación comparativa de motores de inferencia: las cifras publicadas (pp512 y tg128) sirven como referencia reproducible para comparar backends sobre el mismo hardware AMD.
- Respuestas de baja latencia en aplicaciones interactivas: con 101 tok/s, una respuesta de 200 tokens se completa en torno a 2 segundos en el hardware medido, adecuado para autocompletado o asistencia en línea.

## Benchmarks y rendimiento

La model card solo publica métricas de inferencia (velocidad), no de calidad. Se reproducen a continuación tal cual:

| Métrica | Backend HRX (2026-11-27) | Backend Vulkan retirado (2026-09) |
|---|---|---|
| pp512 (tok/s) | 2.633 ± 294 | 3.297 |
| tg128 (tok/s) | 101 ± 3,8 | 107 |

Hardware de medida: AMD Ryzen AI Max+ 395 con Radeon 8060S, llama.cpp build `5776842df`, `--device HRX0 -ngl 99`, `llama-bench -p 512 -n 128 -r 3`, una ventana en una máquina compartida.

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero Q4_K_M ocupa aproximadamente 1,7 GB; se recomienda al menos 2-3 GB libres para el modelo más overhead de contexto y del runtime.
- GPU recomendadas: el autor mide sobre AMD Ryzen AI Max+ 395 (Radeon 8060S, memoria unificada). No se documentan pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: por tamaño, cabe holgadamente en cualquier GPU con 4 GB o más de VRAM (RTX 3050, RTX 4060, etc.), aunque no hay mediciones publicadas en esas tarjetas.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), el motor 1bit del autor (`1bit serve`), y servidores compatibles con endpoints de Hugging Face. No se confirma soporte de vLLM, TGI ni Ollama en la información disponible.
- Throughput medido: 2.633 tok/s de prompt processing y 101 tok/s de generación en el hardware indicado, con una sola ventana en una máquina compartida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM2.5-2.6B-GGUF (esta ficha) | ~2,7B | no disponible | LFM Open License v1.0 | GGUF Q4_K_M | Throughput medido en Strix Halo |
| LiquidAI/LFM2.5-2.6B | ~2,7B | no disponible | LFM Open License v1.0 | safetensors (presumible) | Modelo original sin cuantizar |
| LiquidAI/LFM2.5-2.6B-GGUF | ~2,7B | no disponible | LFM Open License v1.0 | GGUF | Cuantizaciones oficiales de Liquid AI |

No se dispone de datos de benchmarks de calidad que permitan comparar el rendimiento frente a alternativas de tamaño similar; la comparativa se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- Información de calidad ausente: no hay benchmarks de MMLU, HumanEval, GSM8K ni evaluaciones de alucinación, por lo que no es posible estimar su fiabilidad frente a alternativas.
- Idiomas no declarados: se desconoce el soporte multilingüe real y la calidad en castellano.
- Contexto desconocido: no se indica la longitud de ventana, lo que impide planificar casos de uso con documentos largos.
- Licencia restrictiva: la LFM Open License v1.0 permite uso no comercial e investigación libre, y uso comercial solo por debajo de 10 millones de dólares de ingresos anuales; por encima se requiere licencia separada de Liquid AI.
- Dependencia del motor del autor: las instrucciones de ejecución principales apuntan al 1bit engine, un runtime propio; el uso con llama.cpp estándar es posible por el formato, pero las cifras de rendimiento publicadas corresponden al motor del autor.
- Medición en máquina compartida: los datos de throughput se tomaron con una sola ventana en un equipo compartido, con desviación de ±294 tok/s en pp512, por lo que la reproducibilidad es limitada.
- Sin garantías del redistribuidor: el repositorio tiene 33 descargas y ningún like; no hay evidencia de validación más allá de una comprobación puntual de respuesta correcta.
- Riesgo de alucinación: no cuantificado en la información disponible; en un modelo de 2,7B es esperable un riesgo superior al de modelos mayores, pero no se aportan datos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/1bit-MONSTER/LFM2.5-2.6B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Cuantizaciones oficiales: https://huggingface.co/LiquidAI/LFM2.5-2.6B-GGUF
- Motor 1bit: https://github.com/1bit-MONSTER/engine
- Familias del autor: https://huggingface.co/1bit-MONSTER#families
- Punto de entrada del autor: https://huggingface.co/1bit-MONSTER#start-here
