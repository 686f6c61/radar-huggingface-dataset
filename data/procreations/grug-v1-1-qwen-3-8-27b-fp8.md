# ProCreations/grug-v1.1-qwen-3.8-27b-fp8

## Resumen

Grug v1.1 Qwen3.8 27B FP8 es una cuantizacion FP8 E4M3 del modelo base ProCreations/grug-v1.1-qwen-3.8-27b, un ajuste fino de la familia Qwen3.8-27B. La version FP8 esta orientada exclusivamente a servir el modelo con vLLM, reduciendo el consumo de VRAM y acelerando la inferencia en entornos de produccion sin necesidad de recurrir a cuantizaciones de menor precision como GGUF.

El modelo base combina una arquitectura hibrida con capas transformer clasicas y capas GatedDeltaNet de atencion lineal, e incorpora un codificador de vision que lo convierte en un sistema multimodal (imagen y texto). La cuantizacion FP8 preserva la torre de vision, los embeddings, la cabeza LM y las compuertas GatedDeltaNet en precision completa, manteniendo la calidad en las partes mas sensibles del modelo. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

Esta ficha cubre la variante cuantizada FP8, no el modelo base sin cuantizar. Los datos de benchmarks especificos de esta version no se han publicado; los resultados del modelo base estan disponibles en la documentacion de Qwen3.8-27B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Qwen3.5: transformer + GatedDeltaNet (atencion lineal), con codificador de vision |
| Parametros totales | 26.897.483.264 (~26,9 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (recomendado en vLLM); el modelo base soporta hasta 262.144 |
| Tipos de cuantizacion | FP8 E4M3, pesos block-scaled 128x128, activaciones dinamicas (w8a8) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato compressed-tensors compatible con vLLM) |

## Arquitectura y entrenamiento

La arquitectura base es la de Qwen3.8-27B, un modelo hibrido que intercala capas transformer con capas GatedDeltaNet, un mecanismo de atencion lineal que reduce el coste computacional en contextos largos. El modelo incorpora ademas un codificador de vision que permite entrada multimodal imagen-texto. La variante FP8 mantiene en precision completa la torre de vision, los embeddings, la cabeza de lenguaje, las compuertas a/b de GatedDeltaNet y el espacio de nombres MTP, cuantizando unicamente el resto de pesos a FP8 E4M3 con escalado por bloques de 128x128 y activaciones dinamicas.

El proceso de cuantizacion se realizo con compressed-tensors, orientado a su ejecucion en vLLM. El script de construccion exacto y el informe estructural se incluyen en el repositorio bajo los directorios `reproduce/` y `quantization_report.json`. La cabeza MTP (Multi-Token Prediction) entrenada no se incluye en este repositorio; para decodificacion especulativa debe usarse la variante `-mtp-` correspondiente. Segun datos de FriendliAI, el entrenamiento del ajuste fino base consumio 4,0 millones de tokens vistos, con 1,25 millones supervisados, en 489 pasos y 26 minutos en una RTX PRO 6000.

## Capacidades

- Generacion de texto conversacional multimodal: acepta entradas de imagen y texto, y produce respuestas de texto.
- Razonamiento con modo thinking: el parser de razonamiento `qwen3` en vLLM activa el modo de pensamiento explicito del modelo.
- Tool calling y function calling: compatible con `--enable-auto-tool-choice` y el parser `qwen3_coder` para invocacion automatica de herramientas.
- Soporte para agentes: la combinacion de tool calling y razonamiento multi-paso permite construir agentes autonomos.
- Decodificacion especulativa: la arquitectura incluye espacio MTP, aunque la cabeza entrenada se distribuye por separado en el repositorio `-mtp-`.
- Capacidades multilingues: no se han publicado datos especificos de idiomas soportados para esta variante.

## Casos de uso

- Asistentes de atencion al cliente multimodal: el modelo puede procesar capturas de pantalla, facturas o imagenes de productos junto con la conversacion, y mantener contexto de hasta 32K tokens en despliegues vLLM.
- Generacion de codigo asistida en produccion: con el parser `qwen3_coder` y tool calling, puede integrarse en pipelines de CI/CD para generar, revisar y autocompletar codigo con invocacion de herramientas externas.
- Agentes autonomos con razonamiento multi-paso: el modo thinking combinado con tool calling permite construir agentes que planifican, ejecutan acciones y verifican resultados en entornos controlados.
- Analisis de documentos con vision: al aceptar imagenes, puede extraer informacion de diagramas, esquemas o capturas de interfaces para resumir o responder preguntas.
- Servicio de inferencia de alto rendimiento: la cuantizacion FP8 y la compatibilidad con vLLM permiten desplegar el modelo en produccion con menor VRAM que la version sin cuantizar, manteniendo la precision en las partes criticas.
- Investigacion y experimentacion con arquitecturas hibridas: el modelo base combina atencion lineal GatedDeltaNet con transformer, util para estudiar el comportamiento de arquitecturas hibridas en tareas multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta variante cuantizada FP8 en la informacion disponible. El modelo base Qwen3.8-27B cuenta con benchmarks publicados (segun la documentacion de Yottalabs), pero los numeros concretos no se han incluido en la informacion proporcionada. La verificacion de FriendliAI confirma que la salida del modelo no cambia respecto a la version v1.1 sin cuantizar: "mismos pesos, misma puntuacion".

## Requisitos de hardware

- VRAM estimada: los pesos FP8 ocupan aproximadamente 26,9 GB. Con cache KV y activaciones para 32K de contexto, se recomiendan entre 32 y 40 GB de VRAM. La version sin cuantizar requiere unos 54,8 GB segun LLM Explorer.
- GPU recomendadas: NVIDIA RTX 6000 Ada (48 GB), A100 40/80 GB, H100, L40S. En una RTX 4090 (24 GB) el ajuste seria muy justo y probablemente requiera reducir la longitud de contexto.
- No cabe en GPUs de consumo de 8-16 GB; se necesita al menos una GPU profesional o de datacenter de 32 GB o mas.
- Opciones de despliegue: vLLM es el destino principal (formato compressed-tensors). Para llama.cpp u Ollama existe una variante GGUF separada en el repositorio `-gguf`.
- Comando de despliegue recomendado:
  ```bash
  vllm serve REPO_ID --max-model-len 32768 \
    --reasoning-parser qwen3 --enable-auto-tool-choice --tool-call-parser qwen3_coder
  ```
- Latencia y throughput: no se han publicado datos especificos para esta variante. La cuantizacion FP8 w8a8 suele ofrecer mejor throughput que BF16 en GPUs con soporte FP8 nativo (H100, L40S, RTX 6000 Ada).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| ProCreations/grug-v1.1-qwen-3.8-27b (base) | 26,9B | 262K | BF16 (sin cuantizar) | Apache 2.0 | Requiere ~54,8 GB VRAM; maxima fidelidad |
| ProCreations/grug-v1.1-qwen-3.8-27b-fp8 (este) | 26,9B | 32K (recomendado) | FP8 E4M3 w8a8 | Apache 2.0 | Optimizado para vLLM; menor VRAM |
| ProCreations/grug-v1.1-qwen-3.8-27b-gguf | 26,9B | no disponible | GGUF (varias) | Apache 2.0 | Para llama.cpp y Ollama |
| ProCreations/grug-v1.1-qwen-3.8-27b-mtp | 26,9B | no disponible | no disponible | Apache 2.0 | Incluye cabeza MTP para decodificacion especulativa |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La cabeza MTP entrenada no esta incluida en este repositorio; para decodificacion especulativa debe usarse la variante `-mtp-` correspondiente.
- La longitud de contexto recomendada en vLLM es de 32.768 tokens, muy inferior a los 262K del modelo base. Superar ese limite puede degradar el rendimiento o requerir ajustes de memoria.
- No se han publicado datos sobre idiomas soportados, sesgos conocidos o tasas de alucinacion para esta variante.
- La cuantizacion FP8 excluye de la cuantizacion la torre de vision, embeddings, LM head y compuertas GatedDeltaNet, lo que preserva calidad en esas partes pero implica que el ahorro de memoria no es uniforme en toda la red.
- El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha; se trata de un modelo reciente (creado en agosto de 2026) con escasa validacion comunitaria.
- No se dispone de benchmarks publicados para esta variante especifica; la evaluacion en produccion debe realizarse de forma independiente.
- El formato compressed-tensors limita el despliegue practicamente a vLLM; para otros runtime se debe usar la variante GGUF.

## Enlaces

- Repositorio HuggingFace (FP8): https://huggingface.co/ProCreations/grug-v1.1-qwen-3.8-27b-fp8
- Modelo base: https://huggingface.co/ProCreations/grug-v1.1-qwen-3.8-27b
- Variante GGUF: https://huggingface.co/ProCreations/grug-v1.1-qwen-3.8-27b-gguf
- Variante MTP (decodificacion especulativa): https://friendli.ai/models/ProCreations/grug-v1.1-qwen-3.8-27b-mtp
- Ficha en LLM Explorer (modelo base): https://llm-explorer.com/model/ProCreations%2Fgrug-27b,4I3COxIuitPNrvIAJrjQMi
- Especificaciones de Qwen3.8-27B (Yottalabs): https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
