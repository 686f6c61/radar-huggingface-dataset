# lavendercomputing/MiniCPM5-2B-GSQ-RCO-GGUF

## Resumen

MiniCPM5-2B-GSQ-RCO-GGUF es una compilación cuantizada del modelo denso `openbmb/MiniCPM5-2B`, desarrollado por OpenBMB, publicada por el usuario lavendercomputing. Se trata de una conversión a formato GGUF para su uso con llama.cpp, empleando una receta de cuantización no uniforme denominada GSQ-RCO que asigna anchos de bit por tensor en lugar de aplicar un esquema homogéneo. El resultado es un único fichero de 1,14 GiB que preserva el modelo base de 2.516.756.480 parámetros con un promedio de 3,88 bits por peso.

El modelo base es un transformer causal denso de clase 2B construido sobre la arquitectura `LlamaForCausalLM`: 42 capas, atención con GQA (16 cabezas de consulta y 2 de clave/valor), dimensión oculta de 2048, dimensión intermedia de 6144, vocabulario de 130.560 tokens y una ventana de contexto de 131.072 tokens. Está orientado a generación de texto conversacional y despliegue en dispositivo, con soporte para inglés y chino.

La relevancia de esta ficha radica en que ejemplifica una técnica de compresión agresiva (objetivo de 3,5 bits por peso) sobre un modelo pequeño de contexto largo, lo que permite ejecutarlo en hardware de consumo. No obstante, el autor advierte que no se han vuelto a ejecutar benchmarks públicos a esta precisión, por lo que las cifras de calidad deben tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (`LlamaForCausalLM`), GQA con 16 cabezas de consulta y 2 de clave/valor, 42 capas |
| Parametros totales | 2.516.756.480 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | GGUF con mezcla por tensor: IQ3_S como build principal (3,88 bpw global, 3,48 bpw en MLP); atención y embeddings en IQ4_NL; normas en fp32 |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el checkpoint original en safetensors BF16 no se aloja en este repositorio |

## Arquitectura y entrenamiento

El modelo base sigue una arquitectura transformer denso estándar con 42 capas, dimensión oculta de 2048 y dimensión intermedia de 6144, con atención de consultas agrupadas (GQA) que reduce la huella de memoria en clave/valor. El vocabulario es de 130.560 tokens y la ventana de contexto alcanza los 131.072 tokens. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni la existencia de fases de RLHF o DPO en el modelo original.

La innovación de esta compilación concreta es el pipeline GSQ-RCO, que sustituye la matriz de importancia (imatrix) habitual por una optimización de la asignación de anchos de bit por tensor. La calibración se realizó sobre el conjunto `HuggingFaceFW/fineweb-edu` (32 secuencias de 256 tokens) y el objetivo optimizado fue la entropía cruzada, con una NLL medida de 4,888 y una divergencia KL de 2,109 frente a la referencia BF16 a los anchos asignados. La conversión se realizó directamente desde el maestro BF16 del proveedor, sin pasos intermedios de cuantización, y se verificó la coincidencia exacta de la carga útil de los 381 tensores con la asignación optimizada.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento y respuesta a instrucciones dentro de la ventana de contexto de 131.072 tokens.
- Despliegue en dispositivo (on-device) gracias a su tamaño reducido y a la cuantización de 3,5 bits.
- Inferencia mediante llama.cpp en CPU y GPU (con `-ngl` para descarga de capas).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible` en el repositorio).
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Asistente conversacional local en portátiles y equipos de escritorio: con 1,14 GiB en disco y cuantización de 3,5 bits, el modelo cabe en memoria RAM/VRAM modesta y permite conversaciones multi-turno sin conexión, aprovechando su ventana de 131.072 tokens para hilos largos.
- Procesamiento de documentos extensos en chino e inglés: la ventana de contexto permite resumir o extraer información de contratos, artículos o transcripciones de decenas de miles de tokens en una sola pasada.
- Prototipado rápido de aplicaciones de chat: al ser un único fichero GGUF cargable con `llama-cli` o `llama-server`, sirve para validar flujos conversacionales antes de migrar a modelos mayores.
- Despliegue en entornos con recursos restringidos (Raspberry Pi, mini-PC, dispositivos embebidos): el tamaño de 1,14 GiB y la inferencia en CPU de llama.cpp lo hacen viable donde no hay GPU.
- Generación de texto asistida en herramientas de escritorio: integrable mediante la API compatible de llama.cpp para autocompletado, redacción o resumen en aplicaciones locales.
- Evaluación de técnicas de cuantización no uniforme: útil para investigadores que quieran comparar el pipeline GSQ-RCO frente a cuantizaciones estándar (Q4_K_M, IQ3_S uniforme) sobre un modelo de referencia pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que las pruebas realizadas fueron de carga y coherencia de salida con prompts cortos, no resultados de precisión. El único dato medido es la NLL de 4,888 y la KL de 2,109 frente a la referencia BF16 en el conjunto de calibración.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,2-1,5 GiB para el fichero de pesos, más overhead de contexto (la ventana completa de 131.072 tokens requiere memoria adicional para la caché KV; con GQA de 2 cabezas KV y 42 capas, el coste por token es reducido, pero contextos muy largos pueden superar varios GiB).
- GPU recomendadas: cualquier GPU con 4 GiB o más de VRAM puede descargar todas las capas; tarjetas como RTX 3060, RTX 4060, RTX 4090 o A100 funcionan sin problema.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU discreta moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y cualquier frontend compatible con GGUF (Ollama, LM Studio, text-generation-webui). No se documenta soporte para vLLM o TGI en esta compilación.
- Latencia y throughput: no disponibles en la información proporcionada. El autor solo confirma pruebas de humo con inferencia en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniCPM5-2B-GSQ-RCO (esta ficha) | 2,52B | 131.072 | Apache-2.0 | GGUF (IQ3_S mixto) | Cuantización no uniforme GSQ-RCO, 3,88 bpw |
| openbmb/MiniCPM5-2B (base) | 2,52B | 131.072 | Apache-2.0 | safetensors BF16 | Referencia de calidad completa |
| Alternativas de 2B en GGUF | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- La cuantización a 3,5 bits introduce degradación de calidad respecto al BF16; el autor no ha reejecutado benchmarks públicos, por lo que el impacto real en tareas downstream es desconocido.
- El conjunto de calibración es pequeño (32 secuencias de 256 tokens de texto web), lo que puede sesgar la asignación de bits hacia dominios genéricos y penalizar tareas especializadas (código, matemáticas, dominios técnicos).
- Solo se aloja una variante (IQ3_S de 3,5 tier); no hay builds de 2 bits ni de 3,0 tier en este repositorio.
- El modelo base solo declara soporte para inglés y chino; el rendimiento en castellano no está garantizado.
- Riesgo de alucinación inherente a modelos de 2B, acentuado por la compresión agresiva.
- El autor advierte que el `min_p` por defecto de llama.cpp (0,05) puede provocar bucles de repetición; recomienda `temperature=1.0, top_p=0.95, min_p=0.0`.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda validar la calidad a esta precisión antes de desplegar en producción.
- No se documentan sesgos específicos del modelo base en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lavendercomputing/MiniCPM5-2B-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Dataset de calibración: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- llama.cpp: https://github.com/ggml-org/llama.cpp
