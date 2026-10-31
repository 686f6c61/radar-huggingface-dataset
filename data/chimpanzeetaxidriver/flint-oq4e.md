# chimpanzeetaxidriver/flint-oQ4e

## Resumen

flint-oQ4e es una versión cuantizada del modelo RecursiveSI/flint, publicada en Hugging Face por el usuario chimpanzeetaxidriver. Se trata de un modelo de generación de texto con un pipeline conversacional, cuantizado mediante la herramienta oQ (oMLX v0.7.3.dev1), que aplica cuantización de precisión mixta sobre los pesos originales en safetensors. El resultado es un checkpoint de aproximadamente 39,79 mil millones de parámetros con una media efectiva de 4,697 bits por peso, pensado para su ejecución con la librería MLX de Apple en hardware Mac (Apple Silicon).

La relevancia de esta ficha reside en la técnica de cuantización empleada: en lugar de una cuantización uniforme a 4 bits, oQ distribuye los pesos entre formatos de 4 bits, 8 bits y BF16 según la sensibilidad de cada tensor, manteniendo en mayor precisión las capas más críticas para la calidad de salida. Esto permite reducir el tamaño del checkpoint a 23,4 GB sin aplicar el mismo nivel de compresión a todo el modelo, un enfoque cada vez más habitual para desplegar modelos grandes en memoria unificada de Mac Studio o MacBook Pro.

No se ha publicado una model card descriptiva del modelo base más allá de la metadatos de cuantización, por lo que buena parte de los detalles de arquitectura, entrenamiento y capacidades no están disponibles públicamente en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (transformer de generación de texto, según pipeline) |
| Parametros totales | 39.785.299.488 (~39,79 B) |
| Parametros activos | no disponible (no consta si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta: Affine 4-bit (grupo 64), Affine 8-bit (grupos 64 y 128), BF16; media efectiva 4,697 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

El modelo base, RecursiveSI/flint, es un modelo de generación de texto de unos 39,8 mil millones de parámetros. No se ha publicado información sobre su arquitectura concreta (densa o MoE), el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO.

Lo que sí está documentado es el proceso de cuantización: flint-oQ4e se generó con oQ (oMLX v0.7.3.dev1), una herramienta de cuantización de precisión mixta para MLX. La distribución resultante es la siguiente: el 95,134 % de los pesos (37,849 B) se almacena en formato Affine de 4 bits con grupo 64 (4,50 bits/peso efectivos), el 4,060 % (1,615 B) en Affine de 8 bits con grupo 64 (8,50 bits/peso), el 0,743 % (0,296 B) en Affine de 8 bits con grupo 128 (8,25 bits/peso) y el 0,063 % (0,025 B) se mantiene en BF16 sin cuantizar. Esta estrategia preserva en mayor precisión las capas más sensibles a la cuantización, reduciendo la degradación de calidad típica de la cuantización uniforme a 4 bits.

## Capacidades

- Generación de texto con pipeline conversacional (text-generation).
- Ejecución optimizada en Apple Silicon mediante la librería MLX.
- Cuantización de precisión mixta que busca minimizar la pérdida de calidad frente a una cuantización uniforme a 4 bits.
- No consta soporte documentado de vision, audio, tool calling ni modos de razonamiento específicos.

## Casos de uso

- Chatbot local en Mac: al estar en formato MLX, puede ejecutarse en Apple Silicon con memoria unificada, adecuado para asistentes conversacionales privados sin depender de la nube.
- Prototipado de aplicaciones conversacionales: el pipeline text-generation permite integrarlo en aplicaciones de diálogo multi-turno para pruebas de concepto antes de escalar a modelos más grandes.
- Prueba de cuantización de precisión mixta: útil como caso de estudio para comparar la calidad de oQ frente a cuantizaciones uniformes (GGUF Q4, MLX 4-bit) en un modelo de ~40 B.
- Generación de texto asistida en entornos sin GPU NVIDIA: aprovecha la memoria unificada de Mac Studio para alojar un modelo de 23,4 GB cómodamente.
- Evaluación de modelos de la comunidad: dado su bajo coste de descarga y ejecución relativo, sirve para auditar el comportamiento del modelo base RecursiveSI/flint en local.
- Integración en flujos de trabajo de escritorio: puede emplearse con frameworks compatibles con MLX para tareas de redacción, resumen o reformateo de documentos en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM / memoria unificada estimada: el checkpoint ocupa 23,4 GB (21,757 GiB de pesos); para inferencia confortable se recomienda al menos 32 GB de memoria unificada, contando KV cache y sobrecarga de runtime.
- Hardware recomendado: Mac con Apple Silicon (M2 Ultra, M3 Max, M4 Max o superior) con 32-64 GB de memoria unificada. No está pensado para GPU NVIDIA al ser formato MLX, aunque el modelo base podría convertirse a otros formatos.
- Consumer hardware: cabe en MacBook Pro de gama alta (M3/M4 Max con 36-48 GB) y en Mac Studio con 32 GB o más. No es viable en máquinas con 16 GB.
- Despliegue: librería MLX de Apple; no consta soporte directo de vLLM, llama.cpp, TGI u Ollama para este checkpoint concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| flint-oQ4e (este modelo) | 39,79 B (cuantizado, 4,697 bits/peso) | no disponible | Apache 2.0 | safetensors (MLX) | Hugging Face, 411 descargas |
| Qwen2.5-32B-Instruct (4-bit MLX) | 32,5 B | 128 K | Qwen (permite uso comercial con condiciones) | safetensors (MLX), GGUF | Hugging Face |
| Llama-3.1-405B (no comparable en tamaño) / Llama-3.3-70B 4-bit | 70,6 B | 128 K | Llama 3.3 Community | safetensors, GGUF | Hugging Face |
| Mistral Small 3.1 24B 4-bit | 24 B | 128 K | Apache 2.0 | safetensors (MLX), GGUF | Hugging Face |

flint-oQ4e se sitúa en la franja de 30-40 B cuantizados, con licencia Apache 2.0 totalmente abierta, frente a alternativas como Mistral Small (más pequeño pero con ecosistema más maduro) o Qwen2.5-32B (contexto mucho mayor y documentación más completa). La principal desventaja práctica es la ausencia de model card detallada y de benchmarks publicados.

## Limitaciones y advertencias

- Falta de documentación: no se publica información sobre arquitectura, contexto, idiomas ni datos de entrenamiento del modelo base, lo que dificulta evaluar su idoneidad para producción.
- Riesgo de alucinación: al tratarse de un modelo de la comunidad sin ficha técnica ni evaluaciones publicadas, no hay garantías de calidad ni de alineación; asuma que puede generar contenido incorrecto o sesgado.
- Sesgos: no disponibles evaluaciones de sesgo; todo modelo lingüístico de gran tamaño puede reproducir sesgos presentes en sus datos de entrenamiento.
- Idiomas: no consta qué idiomas soporta; no hay garantía de rendimiento en castellano.
- Contexto: la longitud de ventana no está documentada, lo que limita planificar tareas con documentos largos.
- Licencia: Apache 2.0 permite uso comercial sin restricciones relevantes, pero la licencia del modelo base RecursiveSI/flint debería verificarse (la etiqueta indica la misma base con licencia Apache 2.0).
- Ecosistema: el formato MLX restringe la ejecución a hardware Apple Silicon; no es compatible directamente con llama.cpp, vLLM ni Ollama sin conversión previa.
- Mantenimiento: modelo subido por un usuario individual (chimpanzeetaxidriver), con pocas descargas (411) y sin comunidad activa documentada; no espere soporte continuo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chimpanzeetaxidriver/flint-oQ4e
- Modelo base: no disponible enlace directo (referenciado como RecursiveSI/flint)
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
