# ProCreations/grug-v1.1-qwen-3.8-27b-mtp-fp8

## Resumen

Grug v1.1 Qwen3.8 27B MTP FP8 es una cuantización en FP8 E4M3 (con bloque de 128×128 y activaciones dinámicas) del modelo ProCreations/grug-v1.1-qwen-3.8-27b-mtp, un fine-tune conversacional multimodal basado en Qwen3.8-27B. El modelo original incorpora una cabeza de predicción multi-token (MTP) entrenada para decodificación especulativa, lo que permite acelerar la generación en servidores vLLM. Esta versión FP8 está orientada exclusivamente a vLLM y mantiene en BF16 las partes sensibles a la precisión: la torre de visión, los embeddings, la cabeza de lenguaje y las puertas a/b de la capa GatedDeltaNet.

El modelo es relevante porque combina tres características demandadas en producción: un tamaño de 26,9 mil millones de parámetros, capacidades multimodales (imagen y texto) y soporte nativo para tool calling y razonamiento, todo bajo licencia Apache 2.0. Al estar cuantizado en FP8, reduce los requisitos de VRAM frente a la versión BF16 (que ocupa unos 54 GB) y facilita el despliegue en GPUs con 32-48 GB de memoria, manteniendo un rendimiento cercano al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con capa GatedDeltaNet (atención lineal híbrida) y cabeza MTP |
| Parametros totales | 26.897.483.264 (~26,9 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no especificada en la model card; el ejemplo de vLLM usa `--max-model-len 32768` |
| Tipos de cuantizacion | FP8 E4M3 con block-scaled 128×128, pesos y activaciones (w8a8) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con tensores comprimidos para vLLM, `compressed-tensors`) |

## Arquitectura y entrenamiento

El modelo base (ProCreations/grug-v1.1-qwen-3.8-27b-mtp) es un fine-tune del modelo Qwen3.8-27B, que incorpora una torre de visión para procesar imágenes y una capa GatedDeltaNet, una variante de atención lineal que reduce el coste computacional en secuencias largas. La versión FP8 cuantiza el backbone completo (15 shards BF16) a FP8 E4M3 con bloques de 128×128, manteniendo en BF16 la cabeza MTP, la torre de visión, los embeddings, la cabeza de lenguaje y las puertas a/b de GatedDeltaNet, que son sensibles a la precisión.

La cabeza MTP (Multi-Token Prediction) ha sido entrenada específicamente para mejorar la decodificación especulativa: permite predecir varios tokens a la vez, acelerando la inferencia en vLLM. Según la información del autor, el entrenamiento de esta cabeza redujo la tasa de desacuerdo con el verificador de 1 entre 10 a 1 entre 21, y mejoró la precisión top-1 del token real de 85,5 % a 88,2 %. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens ni el uso de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: soporta el parser de razonamiento `qwen3` en vLLM, lo que permite modos de pensamiento o razonamiento explícito.
- Tool calling / function calling: compatible con el parser `qwen3_coder` y la opción `--enable-auto-tool-choice` en vLLM.
- Procesamiento multimodal: al ser `image-text-to-text`, puede recibir imágenes y texto como entrada, aunque no se detallan las capacidades específicas de visión (descripción, VQA, etc.).
- Decodificación especulativa: gracias a la cabeza MTP entrenada, puede acelerar la generación en vLLM con `--speculative-config '{"method":"mtp","num_speculative_tokens":2}'`.
- Conversación: el nombre "grug" y los tags `conversational` indican que está optimizado para diálogo multi-turno.

## Casos de uso

- Asistentes conversacionales con contexto largo: gracias a su ventana de contexto ampliable (al menos 32K tokens en el ejemplo de vLLM) y su naturaleza conversacional, puede gestionar diálogos extensos con historial completo, adecuado para atención al cliente o copilotos internos.
- Generación de código asistida con herramientas: al soportar tool calling y el parser `qwen3_coder`, puede integrarse en entornos de desarrollo para autocompletar, refactorizar o ejecutar funciones externas (por ejemplo, llamadas a APIs o comandos).
- Análisis de imágenes y texto combinados: su entrada multimodal permite tareas como extraer información de capturas de pantalla, diagramas o documentos escaneados junto con instrucciones de texto.
- Razonamiento multi-paso en pipelines de IA: con el modo de razonamiento `qwen3`, puede descomponer problemas complejos en pasos intermedios, útil en sistemas de planificación o agentes autónomos.
- Despliegue en producción con vLLM: al estar cuantizado en FP8 y optimizado para vLLM, es adecuado para servir APIs de baja latencia con decodificación especulativa, reduciendo el coste por token frente a modelos BF16 del mismo tamaño.
- Fine-tuning o adaptación posterior: al ser Apache 2.0 y tener pesos abiertos, puede servir como base para tareas específicas de la empresa, aunque la cuantización FP8 puede limitar la fine-tuning (se recomienda usar la versión BF16 para ello).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo externo sobre Qwen3.8-27B menciona métricas del modelo base, pero no son aplicables directamente a esta variante cuantizada. No se dispone de datos de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: con 26,9 B parámetros en FP8 (1 byte por parámetro), los pesos ocupan aproximadamente 26,9 GB. Añadiendo KV cache, activaciones y overhead, se recomienda al menos 32 GB de VRAM para inferencia básica con contexto corto, y 40-48 GB para contexto largo (32K tokens) y decodificación especulativa.
- GPU recomendadas: A100 40 GB, A100 80 GB, L40S 48 GB, A6000 48 GB, H100 80 GB. En consumer, una RTX 4090 (24 GB) no es suficiente para el modelo completo en FP8; se necesitaría cuantización adicional (por ejemplo, 4-bit) que no está disponible en este repositorio.
- Opciones de despliegue: vLLM (principal, con soporte MTP), también compatible con transformers (aunque sin las optimizaciones de vLLM). No se menciona compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: no se proporcionan datos. La decodificación especulativa con MTP (2 tokens especulativos) puede reducir la latencia entre un 20-40 % respecto a la generación autoregresiva estándar, según la implementación de vLLM, pero esto es una estimación general, no un dato del modelo.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo base (ProCreations/grug-v1.1-qwen-3.8-27b-mtp) en BF16 ocupa aproximadamente 54 GB y no está cuantizado; esta versión FP8 reduce el tamaño a la mitad. Frente a otros modelos de 27B multimodales (como Qwen2.5-VL-27B o Llama-3.2-27B-VL), no hay datos de rendimiento publicados para esta variante. La principal diferenciación es la cabeza MTP entrenada, que no está presente en los modelos estándar.

## Limitaciones y advertencias

- La cuantización FP8 puede introducir una ligera degradación en tareas de alta precisión (matemáticas, razonamiento lógico complejo) respecto al modelo BF16 original, aunque las partes sensibles se mantienen en BF16.
- El contexto máximo no está documentado; el ejemplo de vLLM usa 32K tokens, pero el modelo base Qwen3.8-27B soporta hasta 262K según fuentes externas. Es recomendable validar el contexto real antes de usarlo en producción.
- No se especifican los idiomas soportados; aunque Qwen3.8 es multilingüe, esta variante no lo confirma.
- La cabeza MTP solo funciona con vLLM; si se usa con transformers u otros frameworks, se ignora y se pierde la ventaja de decodificación especulativa.
- No hay información sobre sesgos, alucinaciones o comportamientos no deseados. Como todo LLM, puede generar contenido incorrecto o sesgado.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que el modelo base (Qwen3.8) también cumpla con los términos de su licencia original (Apache 2.0 en este caso, según los tags).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ProCreations/grug-v1.1-qwen-3.8-27b-mtp-fp8
- Modelo base (con MTP): https://huggingface.co/ProCreations/grug-v1.1-qwen-3.8-27b-mtp
- Versión FP8 sin MTP: https://huggingface.co/ProCreations/grug-v1.1-qwen-3.8-27b-fp8
- Modelo original Grug 27B: https://huggingface.co/ProCreations/grug-27b
- Artículo sobre Qwen3.8-27B (specs y hardware): https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
