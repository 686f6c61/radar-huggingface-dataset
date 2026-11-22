# mattiasz/ullm-chat

## Resumen

μllm chat (identificador `mattiasz/ullm-chat`) es un modelo de lenguaje conversacional de 359.842.816 parámetros desarrollado por el autor independiente mattiasz. Se trata de un transformer decoder-only construido desde cero con la implementación didáctica [ullm](https://github.com/mAzurkovic/ullm), un GPT pequeño y legible pensado para aprender cómo funcionan los LLM de extremo a extremo. El modelo parte de `mattiasz/ullm-base`, preentrenado con 7B tokens de FineWeb-Edu, y se ha afinado con supervisión sobre conversaciones de `HuggingFaceTB/smol-smoltalk`.

Su relevancia es fundamentalmente educativa y de investigación: demuestra el ciclo completo de preentrenamiento y ajuste conversacional sobre una arquitectura estándar (pre-norm RMSNorm, RoPE, SwiGLU) con un coste de entrenamiento mínimo (57 minutos en una sola H100 NVL). No compite en capacidades con modelos de escala industrial, pero sí ofrece un caso reproducible y transparente de un chat model pequeño, con formato de turnos explícito y pesos en fp32.

La ventana de contexto es de solo 1024 tokens, el tokenizador es GPT-2 (`tiktoken`) ampliado con tres tokens especiales de chat, y el modelo es exclusivamente en inglés y sin ajuste de seguridad. La licencia Apache-2.0 permite uso comercial, aunque las limitaciones de conocimiento factual y contexto lo hacen inadecuado para producción real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (pre-norm RMSNorm, RoPE, SwiGLU MLP), sin biases |
| Parametros totales | 359.842.816 (embeddings de entrada y salida atados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | `safetensors` (`model.safetensors`, fp32) más `config.json` |

Detalles adicionales de arquitectura: 24 capas, `d_model` 1024, 16 cabezas de atención (dimensión de cabeza 64), MLP oculto de 2816. Tokenizador GPT-2 (`tiktoken`) con vocabulario ampliado a 50.304 tras añadir `<|user|>`, `<|assistant|>` y `<|end|>`. Tamaño del repositorio: 1,4 GB.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only convencional con normalización pre-norm mediante RMSNorm, embeddings posicionales rotatorios (RoPE) y MLP con activación SwiGLU. No emplea sesgos en las capas lineales y ata los embeddings de entrada y salida, lo que reduce el recuento de parámetros. La implementación subyacente es ullm, un GPT pequeño y legible escrito para fines didácticos; los pesos se cargan con ullm, no con `transformers`.

El preentrenamiento de la base (`mattiasz/ullm-base`) usó 7B tokens de FineWeb-Edu. El ajuste supervisado (SFT) se realizó sobre `smol-smoltalk`: 384.253 conversaciones, descartando las que contienen mensaje de sistema y truncando las largas tras el último intercambio que cabe en 1024 tokens. La pérdida se calcula solo sobre las respuestas del asistente y su token `<|end|>`. Se ejecutó 1 época en 6.003 pasos de 64 conversaciones, con AdamW (β = (0,9, 0,95)), weight decay 0,1 sobre matrices, LR pico 3e-5, 100 pasos de warmup y decaimiento lineal a cero. El entrenamiento se completó en 57 minutos en una única NVIDIA H100 NVL, con autocast bf16, pesos fp32 y `torch.compile`. La pérdida de validación fue 1,248 sobre el split de test (solo tokens del asistente). No se documenta RLHF ni DPO.

## Capacidades

- Generación de texto conversacional multi-turno con formato explícito de turnos (`<|user|>`, `<|assistant|>`, `<|end|>`).
- Respuesta en inglés con parada controlada al alcanzar `<|end|>`.
- Conversación con historial gestionado por la herramienta `ullm chat`, que descarta los turnos más antiguos al superar los 1024 tokens.
- Inferencia en CUDA, Apple Silicon (MPS) y CPU.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión, audio ni otras modalidades.
- Capacidad multilingüe limitada al inglés; no se documentan otros idiomas.

## Casos de uso

- Aprendizaje y docencia de LLM: sirve como ejemplo reproducible de preentrenamiento más SFT sobre una arquitectura estándar, con código legible y resultados de entrenamiento publicados en `results/sft/` del repositorio de GitHub.
- Experimentación con formato de chat: permite estudiar cómo un modelo pequeño aprende la estructura de turnos y el token de parada `<|end|>` sin la complejidad de plantillas de chat de modelos grandes.
- Pruebas de pipelines de inferencia en hardware modesto: al tener 360M parámetros y ejecutarse en CPU, MPS o CUDA, es útil para validar integraciones de generación de texto en entornos sin GPU dedicada.
- Generación de respuestas cortas en inglés para prototipos de interfaz conversacional: adecuado para demos de UI donde la calidad factual no es crítica y el contexto cabe en 1024 tokens.
- Investigación sobre alucinación en modelos pequeños: su tendencia documentada a afirmar hechos incorrectos con confianza lo convierte en un caso de estudio para evaluar calibración y detección de errores.
- Reproducción de experimentos de SFT: el detalle de hiperparámetros, dataset y hardware permite replicar el ajuste y comparar variantes (por ejemplo, distintos subconjuntos de smol-smoltalk).
- Evaluación de tokenizadores GPT-2 extendidos: útil para medir el impacto de añadir tokens especiales de chat sobre un vocabulario `tiktoken`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento documentado es la pérdida de validación de 1,248 sobre el split de test de smol-smoltalk (solo tokens del asistente).

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,4 GB para los pesos (359,8M parámetros × 4 bytes), más overhead de activaciones y contexto; el repositorio ocupa 1,4 GB.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA H100 NVL; para inferencia basta con cualquier GPU CUDA con al menos unos pocos GB de VRAM.
- Cabe en GPU de consumo: sí, por el reducido tamaño del modelo; no se especifican modelos concretos en la documentación.
- Opciones de despliegue: la vía documentada es `ullm` (comandos `uv run ullm chat --model ...`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y los pesos no se cargan con `transformers`.
- Latencia y throughput: no disponibles.
- Plataformas soportadas: CUDA, Apple Silicon (MPS) y CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| mattiasz/ullm-chat | 359,8M | 1024 | Apache-2.0 | safetensors fp32, solo ullm | Inglés, sin safety tuning, desde cero |
| mattiasz/ullm-base | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | safetensors | Modelo base preentrenado con 7B tokens de FineWeb-Edu |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de otros modelos en la informacion proporcionada |

No se dispone de información sobre modelos comparables de la misma categoría (chat models de ~360M parámetros) en la documentación proporcionada, por lo que no es posible establecer una comparativa cuantitativa de rendimiento.

## Limitaciones y advertencias

- Afirma hechos incorrectos con confianza: el ajuste enseñó el formato de chat, no nuevos conocimientos; no debe usarse como fuente factual.
- Las respuestas largas derivan del tema y pueden alcanzar el límite de tokens.
- Solo inglés; no se documenta soporte de otros idiomas.
- Sin ajuste de seguridad (no safety tuning): puede generar contenido inapropiado sin filtros.
- Contexto muy limitado (1024 tokens), lo que restringe conversaciones largas y documentos extensos.
- No hay plantilla de sistema: no se admite system prompt.
- Los pesos solo se cargan con ullm, no con `transformers`, lo que limita la integración con ecosistemas estándar.
- No se documentan variantes cuantizadas (GGUF, etc.), lo que dificulta el despliegue en entornos con restricciones de memoria.
- Licencia Apache-2.0 permite uso comercial, pero las limitaciones de calidad y seguridad desaconsejan su uso en producción.
- Sesgos conocidos: no documentados explícitamente; al derivar de FineWeb-Edu (Common Crawl) y smol-smoltalk, puede heredar sesgos de esas fuentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mattiasz/ullm-chat
- Modelo base: https://huggingface.co/mattiasz/ullm-base
- Repositorio ullm: https://github.com/mAzurkovic/ullm
- Dataset de ajuste: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- FineWeb-Edu (datos de preentrenamiento): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Resultados de SFT: `results/sft/` en el repositorio de GitHub
