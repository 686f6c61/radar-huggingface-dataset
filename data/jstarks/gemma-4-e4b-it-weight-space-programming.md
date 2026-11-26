# jstarks/gemma-4-E4B-it-weight-space-programming

## Resumen

`jstarks/gemma-4-E4B-it-weight-space-programming` es una edición directa del espacio de pesos del modelo `google/gemma-4-E4B-it` de Google, publicada por el usuario jstarks. No se trata de un fine-tuning convencional: el autor modifica únicamente 64 columnas de la proyección `down_proj` de las capas 38 a 41 del MLP, un total de 163.840 parámetros en `bfloat16` (el 0,00205% del modelo), sin ningún paso de descenso de gradiente ni retropropagación.

El objetivo es corregir dos patologías observadas en el modo `<|think|>` del modelo base: la parálisis entre razonamiento y tool calling (el modelo se enreda en esquemas markdown verbosos o alucina rechazos temporales en lugar de invocar herramientas declaradas) y el desbordamiento de tokens en problemas matemáticos multi-paso. La técnica se inspira en el trabajo "Sparks of Weight-Space Programming" de Takehi et al. (MIT CSAIL).

El modelo conserva la arquitectura, el tokenizador y la plantilla de chat del Gemma 4 E4B original, con 7.996.156.490 parámetros totales según safetensors y un repositorio de 16 GB en `bfloat16`. Es relevante porque demuestra que intervenciones quirúrgicas sobre pesos, sin reentrenamiento, pueden alterar comportamientos de razonamiento y uso de herramientas de forma medible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (Gemma 4), con atención completa y capas con KV compartida; MLP con `down_proj` intervenido |
| Parametros totales | 7.996.156.490 (según safetensors); el autor indica 8B totales / 4B activos en texto |
| Parametros activos | 4B (parámetros activos de texto, según el autor) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en `bfloat16`) |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors (`model.safetensors` completo de 16 GB y parche de 641 KB `gemma4_e4b_weight_space_patch.safetensors`) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E4B-it` (y de la variante `unsloth/gemma-4-E4B-it`) y mantiene su arquitectura transformer multimodal con capacidad image-text-to-text. Según la model card, las capas 0–23 tienen cabezas KV independientes y las capas 24–41 (`num_kv_shared_layers = 18`) comparten estados KV; la capa 23 actúa como frontera global de atención completa, con un `post_feedforward_layernorm` de norma media 26,16 compensado por un `layer_scalar` de 0,0654.

No hay entrenamiento: la intervención consiste en editar 64 columnas de `down_proj` en las capas 38–41 (163.840 parámetros, 0,00205% del total) mediante una cirugía en el espacio de pesos condicionada por RMSNorm. Dado que cada capa pasa `mlp(x)` por `post_feedforward_layernorm` antes de sumar al residual, el autor precondiciona la dirección residual objetivo `d_target` multiplicando por `max(|w_post|, 0.25)^(-1)` para evitar que coordenadas atípicas de alta norma distorsionen la proyección de vocabulario. El parche se puede aplicar en memoria en menos de un segundo sobre un checkpoint existente.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Gemma 4 E4B instruct.
- Razonamiento con modo `<|think|>` (`enable_thinking=True`), corregido para evitar bucles de esquemas markdown y rechazos temporales alucinados.
- Tool calling y function calling: tasa de invocación válida del 75,0% (6/8) en el conjunto de pruebas del autor, frente al 0,0% del base.
- Razonamiento matemático multi-paso dentro de un presupuesto de 420 tokens: 66,7% (4/6) resueltos, frente al 33,3% (2/6) del base.
- Capacidad multimodal image-text-to-text (pipeline declarado en Hugging Face).
- Comportamiento agéntico con bucles de búsqueda web (DuckDuckGo) y síntesis fundamentada end-to-end.
- Restricción de herramientas: mantiene el 100% (6/6) de no invocar búsqueda cuando no es necesaria.

## Casos de uso

- Agentes con tool calling en producción: el parche eleva la tasa de invocación válida del 0,0% al 75,0% con `enable_thinking=True`, lo que permite usar el modo de razonamiento sin que el modelo ignore las herramientas declaradas.
- Asistentes con búsqueda web integrada: en el bucle agéntico con DuckDuckGo, la síntesis fundamentada end-to-end pasa del 0,0% (0/3) al 66,7% (2/3), adecuado para pipelines de respuesta aumentada con recuperación.
- Razonamiento matemático con presupuesto de tokens: al suprimir el bucle de meta-comentario, resuelve el doble de problemas (4/6 frente a 2/6) dentro de 420 tokens, útil en entornos con límites estrictos de latencia y coste.
- Despliegue en GPU de consumo: el cargador incluido (`model_loader.py`) mantiene las 42 capas activas en 9,29 GB de VRAM y descarga a CPU la tabla estática de embeddings por capa (5,64 GB), permitiendo ejecución en una RTX 4070 Ti de 12 GB.
- Investigación en interpretabilidad mecanicista: el repositorio documenta hallazgos sobre la frontera de la capa 23 y la cirugía condicionada por RMSNorm, reutilizables para estudiar otros modelos Gemma.
- Aplicación de parches sobre checkpoints existentes: si ya se dispone de `google/gemma-4-E4B-it` o `unsloth/gemma-4-E4B-it`, el parche de 641 KB se aplica en memoria sin descargar los 16 GB, lo que facilita experimentación y comparación A/B.

## Benchmarks y rendimiento

| Suite | Métrica | Base (antes) | Parcheado (después) | Delta |
|---|---|---|---|---|
| Modificación | Parámetros editados (`bfloat16`) | 0 (0,0%) | 163.840 (0,00205%) | 64 columnas MLP (L38–L41) |
| A: thinking + búsqueda web (8 consultas) | Tasa de tool-call válido | 0,0% (0/8) | 75,0% (6/8) | +75,0% |
| A: eficiencia | Tokens medios / latencia media (RTX 4070 Ti) | 243,8 tok / 15,46 s | 129,0 tok / 7,85 s | -47,1% tokens / 1,97x más rápido |
| B: matemáticas multi-paso con thinking (6 problemas) | Resueltos en 420 tokens | 33,3% (2/6) | 66,7% (4/6) | +33,4% (2x) |
| C: conocimiento directo + restricción (6 prompts) | Restricción de herramientas | 100,0% (6/6) | 100,0% (6/6) | 0,0% de degradación |
| D: bucle agéntico DuckDuckGo en vivo (3 ejecuciones) | Síntesis fundamentada end-to-end | 0,0% (0/3) | 66,7% (2/3) | +66,7% |
| Terminal-Bench 2.0 (20 tareas con contenedor) | Tareas resueltas | 4/20 (20,0%) | 4/20 (20,0%) | 0,0 pp; desglose 3/10 E, 0/9 M, 1/1 H; tokens medios 723,4 → 498,6; 16,4 tok/s |

## Requisitos de hardware

- VRAM para inferencia completa en `bfloat16`: aproximadamente 16 GB de pesos más estados de activación; el cargador optimizado del autor reduce el uso a 9,29 GB en GPU manteniendo 5,64 GB de embeddings por capa en CPU, con un total de 12 GB de VRAM.
- GPU recomendadas: A100 o H100 para despliegue completo sin offload; RTX 4090 (24 GB) para inferencia holgada; RTX 4070 Ti (12 GB) validada por el autor con `model_loader.py`.
- Cabe en GPU de consumo: sí, en RTX 4070 Ti de 12 GB mediante el cargador incluido, y en cualquier GPU con 16 GB o más usando `device_map="auto"`.
- Opciones de despliegue: `transformers` con `AutoModelForMultimodalLM` y `AutoProcessor`; el repositorio incluye `model_loader.py` y `apply_patch.py`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput medidos: 7,85 s de media por consulta en el conjunto A sobre RTX 4070 Ti (frente a 15,46 s del base); 16,4 tok/s en Terminal-Bench 2.0.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modo thinking + tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Gemma 4 E4B + parche WSP) | 8B totales / 4B activos | no disponible | 75,0% de tool-call válido | gemma | Hugging Face, repo de 16 GB o parche de 641 KB |
| `google/gemma-4-E4B-it` (base) | 8B totales / 4B activos | no disponible | 0,0% de tool-call válido con thinking | gemma | Hugging Face |
| `unsloth/gemma-4-E4B-it` | 8B totales / 4B activos | no disponible | no disponible | gemma | Hugging Face |

No se dispone de datos de benchmarks de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Los benchmarks proceden de conjuntos de pruebas pequeños (8, 6, 6 y 3 prompts) y de un único evaluador; la significación estadística es limitada.
- Terminal-Bench 2.0 no mejora (4/20 en ambos casos) y el desglose muestra 0/9 en tareas de dificultad media, lo que indica que el parche no resuelve tareas agénticas complejas.
- La tasa de tool-call válido se queda en el 75,0%: uno de cada cuatro casos sigue fallando con thinking activado.
- El autor documenta hallazgos específicos de la arquitectura Gemma 4 (frontera de la capa 23, `layer_scalar`, RMSNorm pre-FFN); el parche está acoplado a este checkpoint y no es transferible sin recalibración.
- No se especifican idiomas soportados ni longitud de contexto; ambos datos deben contrastarse con la model card del modelo base.
- Licencia `gemma`: sujeta a los términos de uso de Gemma de Google, con posibles restricciones para uso comercial que deben revisarse antes de producción.
- Riesgo de alucinación inherente al modelo base; el parche mitiga los rechazos temporales alucinados en el conjunto evaluado, pero no elimina el fenómeno de forma general.
- Los pesos se distribuyen en `bfloat16`; no se documentan cuantizaciones GGUF, AWQ ni GPTQ para este repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jstarks/gemma-4-E4B-it-weight-space-programming
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Variante Unsloth del base: https://huggingface.co/unsloth/gemma-4-E4B-it
- Artículo de referencia (Takehi et al., MIT CSAIL): https://rikiyat.github.io/blog/weight-space-programming/
