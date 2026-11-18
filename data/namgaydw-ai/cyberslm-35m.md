# namgaydw-ai/CyberSLM-35M

## Resumen

CyberSLM-35M es un modelo de lenguaje de tipo decoder-only desarrollado por namgaydw-ai (Namgay D Wangchuk) como parte de un trabajo de curso de Design Thinking en la JAIN (Deemed-to-be University), bajo la asignación del Dr. Sujeet S. Jagtap. Se trata de un modelo de muy pequeno tamano (35.337.728 parámetros) orientado a la generación de texto en el dominio de la ciberseguridad, entrenado sobre documentos del NIST y adaptado posteriormente a tareas de evidencia de eventos de seguridad.

El modelo emplea una arquitectura transformer decoder-only con 10 capas, anchura oculta de 512, 8 cabezas de atención, RoPE, RMSNorm, SwiGLU con anchura 1.600 y embeddings atados. Su rasgo más distintivo es el uso de un vocabulario personalizado de 259 tokens a nivel de byte UTF-8, con un contexto de 512 tokens. No es compatible con `AutoModelForCausalLM` de Transformers: requiere código PyTorch propio incluido en el repositorio.

Es relevante ahora únicamente como artefacto educativo y de reproducibilidad, no como herramienta de producción. El propio autor declara un estado de "bounded-trained-checkpoint" con resultados de evaluación que revelan repetición sustancial de plantillas y que no constituyen evidencia de razonamiento amplio en ciberseguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (custom, PyTorch) |
| Parametros totales | 35.337.728 (35.205.120 según model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (byte-token) |
| Tipos de cuantizacion | F16 (GGUF experimental); no se documentan otras |
| Idiomas soportados | no disponible (vocabulario de bytes UTF-8, sin declaración de idiomas) |
| Licencia | other |
| Formato de pesos | `pytorch_model.pt` (state dict custom) y GGUF F16 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 10 capas con anchura oculta 512, 8 cabezas de atención, RoPE, RMSNorm, SwiGLU de anchura 1.600 y embeddings atados. El tokenizador es un vocabulario personalizado de 259 tokens a nivel de byte UTF-8, con IDs especiales PAD=0, BOS=1, EOS=2 y cada valor de byte desplazado en 3. El contexto es de 512 byte-tokens. No se declara compatibilidad con la clase estándar de Transformers.

El entrenamiento se describe en dos etapas acotadas: una Stage A de preentrenamiento causal sobre documentos NIST con 1.000 pasos de optimizador y 2.048.000 exposiciones de tokens (loss final en validación 1.205688, perplejidad 3.3391), seguida de una Stage B de adaptación "answer-only Phase 4F" con 100 pasos y 21.968 exposiciones de tokens de respuesta supervisada (mejor loss teacher-forced 0.058546). No se documentan RLHF, DPO ni innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto autoregresiva a nivel de byte sobre dominio de ciberseguridad (evidencia de eventos, documentos NIST).
- Adaptación a formato de respuesta supervisada ("answer-only") para tareas de evidencia acotadas.
- Exportación GGUF F16 verificada con Ollama 0.40.16 en Windows/CUDA (ejecución, no paridad exacta de logits).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe declarada.
- No se documentan capacidades de visión, audio ni modo "thinking".

## Casos de uso

- Reproducibilidad académica: ejecutar el checkpoint con `load_model.py` para verificar el pipeline de entrenamiento y las métricas declaradas (loss, perplejidad, exact match) en un entorno controlado.
- Docencia de arquitecturas transformer: usar el código custom (`modeling_cyberslm.py`, `tokenization_cyberslm.py`) como ejemplo didáctico de un decoder-only con tokenizador de bytes y contexto de 512 tokens.
- Experimentos acotados de evidencia de seguridad: alimentar el modelo con prompts del tipo "Recorded-event evidence: " para generar respuestas cortas en un entorno de laboratorio, asumiendo la repetición de plantillas documentada.
- Pruebas de despliegue GGUF: validar el flujo de exportación e importación con Ollama en Windows/CUDA como ejercicio de toolchain.
- Investigación sobre tokenización a nivel de byte: analizar la eficiencia computacional y la calidad de generación frente a tokenizadores de subpalabras en un modelo de 35M parámetros.
- Estudio de límites de entrenamiento acotado: comparar los resultados de exact match (32,14% en validación, 32,66% cross-scenario) con modelos de mayor escala para ilustrar el efecto del tamaño y los datos.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Stage A held-out loss | 1.205688 | Documentos NIST de validación congelados |
| Stage A perplejidad | 3.3391 | Sobre la misma validación |
| Stage B best teacher-forced validation loss | 0.058546 | 100 pasos, 21.968 tokens supervisados |
| Free-generation exact match (validación) | 32,14% | 28 ejemplos |
| Free-generation exact match (cross-scenario) | 32,66% | 199 ejemplos |
| Cross-scenario numeric correctness | 56,28% | 199 ejemplos |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en F16 (35M parámetros, ~70 MB de pesos) más overhead de runtime; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con CUDA disponible; el autor verificó ejecución con Ollama 0.40.16 en Windows/CUDA. No se especifica el modelo de GPU.
- Cabe en GPU consumer: sí, en cualquier tarjeta con al menos ~1 GB de VRAM (GTX 1050, RTX 3050, RTX 4090, etc.).
- Opciones de despliegue: PyTorch nativo con `load_model.py` (verificado) y Ollama con el GGUF F16 (verificado). No se documenta compatibilidad con vLLM, llama.cpp, TGI ni con `AutoModelForCausalLM`.
- Latencia y throughput: no disponibles. El autor advierte que la generación a nivel de byte es computacionalmente ineficiente frente a tokenizadores de subpalabras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| CyberSLM-35M | 35,3M | 512 byte-tokens | other | HF (custom) | Dominio ciberseguridad, educativo |
| Modelos decoder-only pequenos de propósito general (p. ej. GPT-2 small, 124M) | 124M | 1.024 tokens | MIT (GPT-2) | HF (Transformers) | Compatible con AutoModelForCausalLM; no comparable en dominio |
| Modelos de ciberseguridad de mayor escala | no disponible | no disponible | no disponible | no disponible | No se dispone de comparativa publicada en la información |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La generación a nivel de byte es computacionalmente ineficiente frente a tokenizadores de subpalabras.
- Las anotaciones de origen y las puntuaciones de anomalía no son etiquetas de ataque confirmadas de forma independiente.
- Entrenamientos pequeños o acotados no establecen razonamiento amplio en ciberseguridad; el propio autor lo advierte.
- La arquitectura custom no es compatible con `AutoModelForCausalLM` de Transformers.
- El GGUF F16 verificado con Ollama 0.40.16 confirma ejecución en runtime, no paridad exacta de logits nativos ni corrección de respuestas.
- Los resultados de evaluación revelan repetición sustancial de plantillas (exact match ~32%), lo que indica sobreajuste al formato de respuesta.
- Licencia "other": no se especifican términos de uso comercial; debe consultarse el repositorio antes de cualquier uso productivo.
- No es un sistema de detección de intrusiones en producción ni debe usarse como motor autónomo de veredictos de ataque.
- No se declaran idiomas soportados; el vocabulario de bytes no garantiza calidad multilingüe.

## Enlaces

- Hugging Face: https://huggingface.co/namgaydw-ai/CyberSLM-35M
- Repositorio GitHub de CyberSLM: no disponible en la información proporcionada (la model card lo menciona sin enlace explícito)
- Paper: no disponible
- Demo: no disponible
