# osunlp/ARLoop-0.6B

## Resumen

ARLoop-0.6B es un modelo de lenguaje causal recurrente con residuos de atención (attention residuals), desarrollado por el equipo de investigación osunlp. Su propuesta técnica consiste en reutilizar físicamente 18 capas de transformer a lo largo de 3 pasadas recurrentes, alcanzando una profundidad efectiva de 54 subcapas con solo 583 millones de parámetros únicos. Este enfoque de reutilización de capas (weight tying recurrente) busca reducir el número de parámetros manteniendo capacidad expresiva, en la línea de arquitecturas recurrentes profundas.

Se trata de un modelo base preentrenado (no chat ni SFT), entrenado sobre aproximadamente 180.000 millones de tokens con una longitud de contexto de 4096 tokens. El checkpoint publicado corresponde a la etapa final de un entrenamiento en tres fases (three-stage blend), con pesos exportados en FP32 sin conversión con pérdida de precisión.

Su relevancia actual radica en el interés renovado por arquitecturas eficientes alternativas al transformer puro: al compartir parámetros entre pasadas, ARLoop-0.6B ofrece una relación profundidad efectiva/parámetros atípica, útil para investigación en eficiencia de modelos y para experimentación en hardware modesto. Requiere `trust_remote_code=True` y una versión concreta de Transformers (5.22.0) para su carga.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal recurrente con residuos de atención (18 capas físicas compartidas en 3 pasadas recurrentes) |
| Parametros totales | 583.138.944 (pesos únicos en el checkpoint de inferencia) |
| Parametros activos | No aplica (no es MoE; todas las capas se ejecutan en cada pasada) |
| Longitud de contexto | 4096 tokens (prompt + generación no debe exceder este límite) |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en FP32; no hay versiones cuantizadas oficiales) |
| Idiomas soportados | Inglés (entrenado con tokenizer SmolLM2) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (2 shards FP32, con índice `model.safetensors.index.json`) |

## Arquitectura y entrenamiento

ARLoop-0.6B emplea una arquitectura de transformer causal con recurrencia por reutilización de capas: un bloque físico de 18 capas se ejecuta 3 veces (3 pasadas recurrentes), lo que equivale a una profundidad efectiva de 54 subcapas. El mecanismo diferenciador son los residuos de atención (attention residuals): bloques de residuo de tamaño 18 subcapas, con 3 bloques de residuo recientes más el embedding de entrada retenidos. Las dimensiones internas son 1536 de ancho oculto y 4608 en el MLP intermedio, con 16 cabezas de atención y 4 cabezas KV (agrupación tipo GQA). Usa RoPE con base 50000 y embeddings de valor compartidos entre capas físicas alternas. La cabeza de salida está ligada a los embeddings de tokens (vocabulario de 49152, tokenizer de SmolLM2).

El entrenamiento constó de tres fases (three-stage blend) sobre 179.998.556.160 tokens, con tamaño de batch global de 256 secuencias de 4096 tokens, learning rate 3e-3 y microbatch de 4 secuencias. El checkpoint final corresponde a 1.373.280 pasos de microbatch (171.660 pasos de optimizador). La model card no detalla la composición del dataset ni el uso de RLHF/DPO (coherente con su naturaleza de modelo base). La implementación de inferencia incluida usa PyTorch SDPA y enrutamiento de residuos de atención en FP32, sin necesidad de instalar FLA, Triton ni flash-attn.

## Capacidades

- Generación de texto en inglés: es un modelo base de completado de texto (text completion), no alineado con instrucciones.
- Completado de código y texto técnico dentro de sus 4096 tokens de contexto, en la medida que su preentrenamiento lo permita (sin datos de evaluación publicados).
- Generación determinista o muestreada vía `model.generate` de Transformers, con caché KV y generación por lotes (left padding + `attention_mask`).
- No incluye capacidades de vision, audio ni modos de razonamiento explícito (thinking mode).
- No hay soporte documentado de tool calling, function calling ni capacidades de agentes.
- Carga portátil: funciona con PyTorch SDPA sin dependencias externas (FLA, Triton, flash-attn), en CPU y GPU.

## Casos de uso

- Investigación en arquitecturas recurrentes: al compartir 18 capas físicas en 3 pasadas, es un banco de pruebas ideal para estudiar weight tying recurrente y residuos de atención frente a transformers densos equivalentes.
- Experimentación en hardware limitado: con ~583M de parámetros en FP32 (~2,3 GB de pesos), puede ejecutarse en CPU o en GPUs de consumo para prototipado rápido.
- Completado de texto en inglés: como modelo base, sirve para autocompletado, continuación de documentos y generación de borradores mediante prompting de few-shot.
- Reproducción de experimentos de preentrenamiento: el repositorio de entrenamiento (ykyaol7/ARLoop) y los metadatos exactos del checkpoint (pasos, batch size, tokens) permiten replicar o extender la ejecución.
- Base para fine-tuning posterior: su tamaño contenido permite aplicar SFT o LoRA sobre el modelo base para tareas específicas en inglés.
- Docencia y demostraciones: la combinación de tamaño pequeño, licencia Apache 2.0 y carga con Transformers estándar lo hace adecuado para cursos y talleres sobre arquitecturas alternativas al transformer clásico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las puntuaciones de benchmark y la inferencia en GPU no han sido revalidadas para esta versión del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan unos 2,3 GB en FP32; con activaciones y caché KV, es razonable estimar unos 4 GB de VRAM en GPU, aunque la model card no publica cifras oficiales.
- GPU recomendadas: cualquier GPU moderna con ~4-6 GB de VRAM debería ser suficiente (por ejemplo, RTX 3060, RTX 4060 o superiores). No hay recomendaciones oficiales de A100/H100.
- Consumer GPU: sí, dado el tamaño de 583M de parámetros, cabe con holgura en GPUs de consumo; también es ejecutable en CPU (validado con PyTorch 2.6.0 en CPU, Python 3.12).
- Despliegue: mediante Transformers 5.22.0 con `trust_remote_code=True` (implementación custom incluida en el repo). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI; dado que es código custom y pesos FP32 no cuantizados, la integración con estos motores no está disponible.
- Latencia y throughput: no disponibles. La ejecución implica 3 pasadas recurrentes por token, lo que puede penalizar el throughput frente a un transformer denso de profundidad equivalente.

## Comparativa con modelos similares

| Modelo | Parametros | Profundidad efectiva | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| ARLoop-0.6B | 583M (únicos) | 54 subcapas (18 capas × 3 pasadas) | 4096 | Apache 2.0 | Recurrente con residuos de atención; base, inglés; pesos FP32 |
| ARLoop-1.3B | ~1.300M (no disponible exacto) | No disponible | 4096 | Apache 2.0 | Modelo hermano mayor del mismo equipo; referencia de implementación |
| SmolLM2-360M / 1.7B | 360M / 1.700M | 24 / 24 capas densas | 8192 | Apache 2.0 | Transformer denso; comparte tokenizer con ARLoop-0.6B, pero los pesos de ARLoop se entrenaron de forma independiente |

No se dispone de datos de rendimiento que permitan comparar calidad entre estos modelos.

## Limitaciones y advertencias

- Es un modelo base de completado, no un modelo de chat: no sigue instrucciones de forma fiable y puede generar continuaciones incoherentes o no deseadas sin un prompting cuidadoso.
- Entrenado en inglés: el rendimiento en otros idiomas, incluido el castellano, no está garantizado ni evaluado.
- Contexto limitado a 4096 tokens: prompt y generación juntos no deben exceder ese límite.
- Requiere `trust_remote_code=True` y una versión concreta de Transformers (5.22.0), lo que implica ejecutar código Python arbitrario del repositorio; conviene fijar el commit SHA del repo por seguridad y reproducibilidad.
- Los pesos deben mantenerse en FP32: la implementación usa BF16 en residuos y autocast internamente; cargar en otra precisión puede alterar los resultados. La implementación portátil no es necesariamente bit-idéntica al modelo nativo fusionado en BF16.
- La inferencia en GPU y los benchmarks no han sido revalidados para esta versión; el rendimiento real en producción es desconocido.
- Riesgo de alucinación y sesgos: al ser un modelo base de ~180B tokens de preentrenamiento sin alineación, puede reproducir sesgos y errores fácticos del corpus; no hay evaluaciones de sesgo publicadas.
- Licencia Apache 2.0: permite uso comercial, pero deben conservarse los avisos de atribución y las notas MIT del código adaptado (Parcae/ARLoop y FLA) incluidos en el archivo `NOTICE`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/osunlp/ARLoop-0.6B
- Modelo hermano (referencia de implementación): https://huggingface.co/osunlp/ARLoop-1.3B
- Código de entrenamiento: https://github.com/ykyaol7/ARLoop
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
