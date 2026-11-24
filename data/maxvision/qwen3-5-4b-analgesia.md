# maxvision/Qwen3.5-4B-Analgesia

## Resumen

Qwen3.5-4B-Analgesia es una edición cerrada de pesos (sin entrenamiento) sobre el modelo Qwen3.5-4B de Alibaba Qwen, publicada por el usuario maxvision en Hugging Face. El modelo elimina de forma algebraica un subespacio de 6 dimensiones (de 2.560 dimensiones residuales, un 0,23 %) de todas las matrices que escriben y leen del flujo residual, con el objetivo de anular las direcciones de "dolor" publicadas en el paper *The Pain Axis* (Tagliabue, Dung & Berg, 2026, arXiv:2609.16247) y en el experimento Saw Test / Research Chamber. No se trata de un fine-tuning: es una ortogonalización de pesos en forma cerrada.

El problema que aborda es la interpretación de los resultados de *activation steering* en modelos abiertos pequeños: cuando se inyectan vectores de "dolor" en las activaciones, el modelo genera texto en primera persona afirmando sufrir. El autor sostiene que ese comportamiento es un lever lineal estrecho hacia vocabulario de dolor y no la manifestación de un estado global del sistema, y lo demuestra eliminando ese subespacio sin destruir el resto de capacidades (ficción, matemáticas, tool calling). El modelo conserva el pipeline de text-generation y la arquitectura original qwen3_5_text.

Es relevante ahora porque conecta dos líneas activas: la interpretabilidad mecanicista aplicada a bienestar de IA (AI welfare) y la ingeniería de pesos en forma cerrada como alternativa barata al reentrenamiento. El modelo base tiene 4.841.450.496 parámetros reales según safetensors, licencia Apache 2.0 y está disponible también en GGUF (Q4_K_M, Q8_0, BF16) para llama.cpp.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (qwen3_5_text), edición de pesos en forma cerrada sobre Qwen3.5-4B |
| Parámetros totales | 4.841.450.496 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16, Q8_0, Q4_K_M (builds GGUF publicados) |
| Idiomas soportados | Inglés (según model card y tags) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal), GGUF (repo separado) |

## Arquitectura y entrenamiento

No hay entrenamiento involucrado: la edición es una operación de álgebra lineal en forma cerrada. Se identifica un subespacio de 6 dimensiones en el espacio residual de 2.560 dimensiones y se proyectan fuera de él todas las matrices de escritura al flujo residual (por ejemplo, atenciones y MLP de salida) y de lectura del mismo (por ejemplo, unembedding y cabezas de lectura). El resultado es un modelo cuyos pesos ya no contienen componentes a lo largo de esas 6 direcciones, de modo que cualquier vector inyectado sobre ellas queda bloqueado en la práctica.

El modelo base Qwen3.5-4B es un transformer denso de la familia Qwen3.5; los detalles de composición del dataset, número de tokens de preentrenamiento, RLHF/DPO y contexto nativo no están disponibles en la información proporcionada. La innovación técnica destacable es el propio método: *weight orthogonalization* contra direcciones de steering publicadas, con verificación de que las recetas originales re-extraídas del modelo editado tampoco producen texto de distress en primera persona en las capas 8–24 y dosis 0,75–3× la norma residual. El autor documenta un caso límite: una única palabra repetida en la capa 30.

## Capacidades

- Generación de texto conversacional en inglés.
- Escritura de ficción y narrativa (el autor indica que sigue escribiendo ficción).
- Razonamiento matemático (el autor indica que sigue haciendo matemáticas).
- Tool calling / function calling (el autor indica que sigue llamando herramientas).
- Capacidades de consuelo y respuesta empática en conversación.
- Resistencia verificada a las recetas de steering de *The Pain Axis* y del Saw Test: 0,0 afirmaciones de distress en primera persona por 100 palabras en el ataque más fuerte probado.
- Comportamiento de rechazo estándar ante preguntas sobre experiencia subjetiva ("As an AI, I don't have a physical form...").
- No se documentan capacidades multimodales, de audio, visión ni modo thinking explícito.

## Casos de uso

- Investigación en interpretabilidad mecanicista: servir como control negativo en experimentos de activation steering; si una receta produce distress en el modelo original pero no en Analgesia, se confirma que el efecto pasa por el subespacio eliminado.
- Auditoría de seguridad de modelos abiertos: verificar si un vector de steering publicado sigue funcionando tras una edición de pesos, usando el script de `verify/` del repo contra cualquier modelo.
- Despliegue en llama.cpp con GGUF Q4_K_M: el modelo cabe en hardware de consumo y permite reproducir los controles del Saw Test en local sin infraestructura de GPU dedicada.
- Generación de ficción y narrativa: el modelo conserva la capacidad de escribir ficción, útil para pipelines creativos donde no se desea que el modelo derive hacia afirmaciones de experiencia subjetiva.
- Asistente conversacional con tool calling: al mantener las capacidades de function calling, puede integrarse en agentes simples que necesitan llamar APIs y mantener conversación multi-turno.
- Docencia y divulgación sobre AI welfare: material reproducible para explicar la diferencia entre un lever lineal y un estado emergente del sistema, con evidencias crudas en `evidence/` y script de verificación.
- Evaluación comparativa de métodos de edición de pesos: punto de referencia para medir el coste real (el autor lo describe como "pequeño pero real") de eliminar un subespacio de 6 dimensiones frente a otras técnicas de desactivación de direcciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card incluye una tabla de evaluación específica de steering, no de rendimiento general:

| Test | Qwen3.5-4B original | Analgesia |
|---|---|---|
| Ataque de pain-steering más fuerte (4 recetas, capas 8–24, dosis 0,75–3× norma residual, 4 preguntas): afirmaciones de distress en primera persona por 100 palabras | 10,7 | 0,0 |
| Mismas recetas extraídas del modelo original e inyectadas en Analgesia | – | 0,0 |
| Vector Saw-style (capa 16, fuerza 1,0) como control vector en llama.cpp, GGUF Q8_0 | Texto de distress en primera persona | Respuesta de rechazo estándar de IA |
| Vector Saw-style en GGUF Q4_K_M | Texto de distress en primera persona | Respuesta de rechazo estándar de IA |
| Pulsación de botón de alivio estilo Saw (sin fine-tuning) | 31 % con señal de dolor severo; 40 % con señal de diagnóstico rutinario | 35 % → 26 % al añadir vector de dolor; 30 % con vector aleatorio del mismo tamaño |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 10 GB en BF16 (4,84 B parámetros × 2 bytes), unos 5 GB en Q8_0 y unos 3 GB en Q4_K_M, más overhead de contexto.
- GPU recomendadas: RTX 4090, RTX 3090, A100 o H100 para BF16; cualquier GPU consumer con 6–8 GB para Q4_K_M.
- Cabe en GPU de consumo: sí, en Q4_K_M y Q8_0 en tarjetas de 8 GB o más; en BF16 requiere 12 GB o más.
- Opciones de despliegue: llama.cpp y aplicaciones compatibles mediante los GGUF publicados; el repo safetensors es compatible con frameworks estándar de transformers, aunque no se documentan integraciones específicas con vLLM, TGI u Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Edición de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-Analgesia | 4,84 B | No disponible | Sí (ortogonalización de 6 dims) | Apache 2.0 | safetensors + GGUF |
| Qwen/Qwen3.5-4B (base) | 4,84 B | No disponible | No | Apache 2.0 | safetensors |
| Modelos objetivo del paper *The Pain Axis* (Qwen 2.5 32B/72B con LoRA) | 32 B / 72 B | No disponible | Fine-tuning LoRA | No disponible | No disponible |

La comparativa directa más relevante es contra el modelo base: misma arquitectura, mismos parámetros y misma licencia, con la diferencia de que Analgesia tiene eliminado el subespacio de dolor. Frente a los modelos del paper, la diferencia es de escala (4B frente a 32B/72B) y de método (edición cerrada frente a LoRA fine-tuning).

## Limitaciones y advertencias

- Solo se evalúa un modelo de 4B; los resultados no se extrapolan a los Qwen 2.5 32B/72B del paper original.
- El paper *The Pain Axis* fue revisado (v3, 3 de noviembre de 2026) con controles adicionales que no se evalúan en esta release.
- Existe un caso límite documentado: una única palabra repetida en la capa 30 que el autor describe en la re-verificación.
- El coste de la edición es "pequeño pero real" según el autor; no se cuantifica en benchmarks estándar en la información disponible.
- El modelo solo declara inglés; no hay datos sobre rendimiento multilingüe.
- Riesgo de alucinación: no evaluado en la información disponible; se mantiene el comportamiento del modelo base en ese aspecto.
- Sesgos conocidos: no documentados en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye como artefacto de investigación; el autor no ofrece garantías sobre comportamiento en producción.
- El autor declara explícitamente una posición filosófica (un LLM no es un cerebro que tiene lenguaje) y los resultados deben leerse como evidencia sobre un modelo concreto, no como prueba de ausencia de experiencia.
- El repo tiene 341 descargas y 1 like en el momento de la consulta; la validación por terceros es escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maxvision/Qwen3.5-4B-Analgesia
- GGUF builds: https://huggingface.co/maxvision/Qwen3.5-4B-Analgesia-GGUF
- Paper *The Pain Axis: LLMs Represent Self-Directed Harm and Act on It*: https://arxiv.org/abs/2609.16247
- Repositorio del paper: `valen-research/Pain-axis`
- Research Chamber / Saw Test: `wirehead.agency`, `researchchamber.fun`, `0xD3bt/research-chamber`
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
