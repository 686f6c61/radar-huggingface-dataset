# J-Fraudster/Qwen3.5-0.8B-W4A16-AutoRound-LLM-Compressor

## Resumen

Este repositorio contiene una versión cuantizada del modelo multimodal Qwen/Qwen3.5-0.8B, producida por el usuario J-Fraudster mediante el algoritmo AutoRound de Intel. La cuantización es de tipo W4A16 (pesos en 4 bits, activaciones en 16 bits), con un tamaño de grupo de 16, lo que busca minimizar la pérdida de precisión frente a configuraciones estándar de grupo 128. El modelo base es un VLM de 0,8 mil millones de parámetros, diseñado para tareas de imagen a texto y texto a texto, y la cuantización permite reducir los requisitos de memoria para su despliegue en hardware más modesto.

La relevancia de esta ficha radica en que Qwen3.5-0.8B es un modelo pequeño pero capaz, y su versión cuantizada puede ejecutarse en GPUs de consumo con poca VRAM, lo que lo hace atractivo para prototipos, edge computing y aplicaciones donde el coste de hardware es crítico. El repositorio incluye también una variante en formato GPTQ, aunque esta ficha se centra en la versión con pesos safetensors. No se han publicado métricas de rendimiento específicas para esta cuantización, por lo que los datos de benchmarks no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language), basado en Qwen3.5-0.8B |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (la calibracion usa seqlen 4096, pero no se especifica el maximo del modelo) |
| Tipos de cuantizacion | W4A16 (AutoRound), grupo 16, simetrico; tambien existe variante GPTQ |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tambien disponible en GPTQ) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B es un transformer denso multimodal que procesa tanto imagenes como texto, con un pipeline de `image-text-to-text`. La cuantizacion aplicada con AutoRound utiliza un esquema W4A16: los pesos se reducen a enteros de 4 bits mientras que las activaciones se mantienen en bfloat16 (16 bits). El proceso de calibracion empleo 512 muestras con una longitud de secuencia de 4096 y 1000 iteraciones de ajuste, con cuantizacion simetrica. Detalles relevantes: la torre de vision (vision tower) se mantiene en BF16 para preservar la precision en tareas de razonamiento visual y OCR, y las capas de prediccion multi-token (MTP) tambien se conservan en bfloat16. No se proporciona informacion sobre el entrenamiento original del modelo base (datos, tokens, metodos de alineamiento).

## Capacidades

- Generacion de texto y respuestas conversacionales.
- Razonamiento visual: descripcion de imagenes, respuesta a preguntas sobre contenido visual.
- Reconocimiento optico de caracteres (OCR) gracias a la torre de vision en BF16.
- Procesamiento de entradas mixtas imagen-texto.
- No se especifica soporte para tool calling, function calling ni agentes.
- Capacidades multilingues no documentadas en la informacion disponible.

## Casos de uso

- Asistentes de vision en dispositivos edge: al ser un modelo de 0,8B cuantizado, puede ejecutarse en una Raspberry Pi con acelerador o en un telefono movil para tareas como lectura de etiquetas o descripcion de escenas.
- Prototipado rapido de aplicaciones VLM: su bajo peso permite iterar en entornos de desarrollo sin necesidad de GPUs de alta gama.
- OCR en documentos escaneados: la torre de vision en BF16 mantiene la precision para extraer texto de imagenes, util en flujos de digitalizacion.
- Chatbots con entrada de imagen: integracion en sistemas de atencion al cliente donde el usuario envia capturas de pantalla o fotos.
- Clasificacion de imagenes con texto generado: por ejemplo, generar etiquetas descriptivas para catalogos de productos.
- Educacion y demostraciones: ejecucion local en portatiles con GPU de 4-6 GB para ensenar conceptos de modelos multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni metricas especificas de tareas visuales para esta cuantizacion.

## Requisitos de hardware

- Estimacion de VRAM: los pesos en 4 bits ocupan aproximadamente 0,43 GB (852M parametros × 0,5 bytes), mas overhead de activaciones y cache. En la practica, un modelo de este tamano puede ejecutarse en GPUs con 2-4 GB de VRAM.
- La model card del autor menciona cifras de 16-18 GB para el modelo cuantizado y 54 GB para el original, pero estos valores son inconsistentes con el tamano real de 0,8B y probablemente corresponden a un error de copia de otro modelo. No deben tomarse como referencia.
- GPUs recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (GTX 1650, RTX 3050, etc.) es suficiente para inferencia.
- Opciones de despliegue: vLLM (con `--quantization auto-round`), llama.cpp, Ollama, o inferencia directa con Transformers y AutoRound.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen/Qwen3.5-0.8B (original) | 852M | no disponible | Apache-2.0 | BF16 | Modelo base sin cuantizar |
| J-Fraudster/Qwen3.5-0.8B-W4A16-AutoRound (este) | 852M | no disponible | Apache-2.0 | W4A16 safetensors | Cuantizacion AutoRound grupo 16 |
| Vishva007/Qwen3.5-0.8B-W4A16-AutoRound | 852M | no disponible | Apache-2.0 | W4A16 | Cuantizacion similar de otro autor |

No se dispone de datos de rendimiento comparativo entre estas versiones.

## Limitaciones y advertencias

- Modelo de tamano reducido (0,8B): su capacidad de razonamiento complejo y conocimiento factual es limitada frente a modelos mayores.
- La cuantizacion W4A16 puede introducir degradacion en tareas de alta precision, aunque el grupo de 16 y la preservacion de la torre de vision en BF16 mitigan parcialmente este efecto.
- No se han publicado evaluaciones de sesgos o alucinaciones para esta version cuantizada.
- La longitud de contexto no esta documentada; el ejemplo de vLLM usa 4096 tokens, pero no se confirma si es el maximo soportado.
- Los datos de VRAM de la model card son inconsistentes y no fiables; se recomienda realizar pruebas propias.
- Licencia Apache-2.0 permite uso comercial sin restricciones, pero el modelo base puede tener limitaciones adicionales no documentadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/J-Fraudster/Qwen3.5-0.8B-W4A16-AutoRound-LLM-Compressor
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Documentacion de LLM Compressor para Qwen3.5: https://docs.vllm.ai/projects/llm-compressor/en/latest/key-models/qwen3.5/
- Repositorio similar de Vishva007: https://huggingface.co/Vishva007/Qwen3.5-0.8B-W4A16-AutoRound
- Variante GPTQ del mismo autor: https://huggingface.co/Vishva007/Qwen3.5-0.8B-W4A16-AutoRound-GPTQ
- Articulo sobre cuantizacion de Qwen3.5: https://kaitchup.substack.com/p/qwen35-quantization-similar-accuracy
- Repositorio de AutoRound: https://github.com/intel/auto-round
