# luisastellet/qwen-metaphor-unke-camada-6-zero-um

## Resumen

El modelo `luisastellet/qwen-metaphor-unke-camada-6-zero-um` es un checkpoint de la familia Qwen3 publicado en Hugging Face por el usuario luisastellet. Se trata de un modelo de generación de texto de aproximadamente 596 millones de parámetros (596.049.920 según los pesos en safetensors), lo que lo sitúa en la franja de modelos pequeños dentro del ecosistema Qwen3. El identificador sugiere una intervención específica sobre una capa ("camada-6") y un proceso de "unke" (posiblemente *unlearning* o edición de conocimiento), aunque la model card no documenta el procedimiento.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto experimental derivado de Qwen3, con 441 descargas y sin likes, cuya documentación es prácticamente inexistente (la model card es la plantilla autogenerada por Hugging Face sin rellenar). Esto lo convierte en un caso típico de checkpoint de investigación o de experimento personal que debe evaluarse con cautela antes de cualquier uso en producción.

El modelo se publica con la librería `transformers`, formato safetensors, licencia no declarada y sin idiomas especificados. La etiqueta `qwen3` en los metadatos es la única pista fiable sobre su linaje arquitectónico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3, según tags) |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repo (solo safetensors; cuantización GGUF/AWQ/BnB no publicada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |
| Tamaño del repo | 9,5 GB |
| Pipeline | text-generation |
| Compatibilidad | text-generation-inference, endpoints_compatible |

## Arquitectura y entrenamiento

La arquitectura se infiere únicamente de los tags del repositorio (`qwen3`), que apuntan a un transformer decoder-only de la familia Qwen3. Con unos 596 millones de parámetros, el tamaño es coherente con un modelo pequeño tipo Qwen3-0.6B, si bien no se puede confirmar que sea exactamente esa variante porque la model card no lo especifica ni incluye la configuración (`config.json` no se ha proporcionado en la información disponible).

No hay información sobre el dataset de entrenamiento, el número de tokens procesados, la composición de los datos, ni sobre si se aplicaron técnicas de RLHF, DPO o SFT. El nombre del repositorio ("metaphor", "camada-6", "zero-um") sugiere una intervención quirúrgica sobre una capa concreta, probablemente un experimento de edición de pesos o de *unlearning*, pero el autor no documenta el método. Tampoco se describen innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto autoregresiva (pipeline `text-generation`).
- Conversación multi-turno (tag `conversational`).
- Compatibilidad con Text Generation Inference (TGI) y con endpoints compatibles de Hugging Face.
- Capacidades multilingües: no documentadas; no se puede asumir el multilingüismo de Qwen3 sin verificación.
- Tool calling / function calling: no documentado.
- Razonamiento multi-paso y modo *thinking*: no documentado.
- Visión, audio u otras modalidades: no documentado.

## Casos de uso

- Experimentación en investigación sobre edición de modelos: el checkpoint parece resultado de una intervención sobre una capa concreta, por lo que puede servir para reproducir o comparar técnicas de modificación de pesos frente al modelo base Qwen3.
- Pruebas de *unlearning* y análisis de olvido catastrófico: útil para estudiar cómo una modificación localizada afecta al comportamiento general del modelo.
- Prototipado rápido en local: con ~596 M de parámetros, cabe en GPUs de consumo y permite iterar sin infraestructura dedicada.
- Evaluación comparativa frente al Qwen3 original: sirve como referencia para medir el impacto de la intervención en benchmarks estándar.
- Generación de texto conversacional de bajo coste: para demos y pruebas de integración con TGI o endpoints compatibles.
- Docencia y divulgación: ejemplo práctico de cómo se publica un checkpoint derivado y de la importancia de documentar la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 1,2 GB solo para pesos (596 M × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en fp32: aproximadamente 2,4 GB para pesos.
- VRAM estimada en cuantización 8 bits: aproximadamente 0,6 GB; en 4 bits, aproximadamente 0,3 GB (estimaciones teóricas; no hay GGUF publicado).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp16 con contexto moderado (RTX 3060, RTX 4060, RTX 4090); para producción, A10G, L4 o A100/H100 si se necesita alto throughput.
- Cabe en GPU de consumo: sí, con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB.
- Opciones de despliegue: `transformers` (nativo), Text Generation Inference (TGI, tag `text-generation-inference`), endpoints compatibles de Hugging Face. No hay evidencia de GGUF para llama.cpp/Ollama ni de formatos AWQ/GPTQ.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| luisastellet/qwen-metaphor-unke-camada-6-zero-um | ~596 M | no disponible | no disponible | Hugging Face (441 descargas) |
| Qwen3-0.6B (modelo base probable) | ~600 M | no disponible en esta ficha | Apache 2.0 (según familia Qwen3) | Hugging Face, ampliamente adoptado |
| Qwen2.5-0.5B | ~500 M | 32 768 tokens (según ficha oficial de Qwen2.5) | Apache 2.0 | Hugging Face, GGUF, Ollama |
| SmolLM2-360M | ~360 M | 8 192 tokens (según ficha oficial) | Apache 2.0 | Hugging Face, GGUF |

La comparación con el modelo base Qwen3-0.6B es la más pertinente, pero no se dispone de datos de rendimiento del checkpoint derivado que permitan cuantificar diferencias. Las cifras de contexto y licencia de los modelos comparables provienen de sus fichas oficiales y deben verificarse en la fuente.

## Limitaciones y advertencias

- Model card autogenerada y sin rellenar: no hay información sobre datos de entrenamiento, sesgos, evaluación ni uso previsto.
- Licencia no declarada: no se puede asumir uso comercial permitido; hay que contactar con el autor o verificar la licencia del modelo base.
- Idiomas no especificados: no se puede garantizar calidad en castellano ni en otros idiomas sin evaluación empírica.
- Riesgo de alucinación: inherente a los modelos generativos pequeños; sin benchmarks no se puede acotar su magnitud.
- Posible degradación por la intervención: al tratarse de un checkpoint modificado ("unke", "camada-6"), es esperable que el rendimiento difiera del Qwen3 original, pero no hay datos que lo cuantifiquen.
- Sin cuantizaciones publicadas: el despliegue en entornos con poca VRAM requiere generar GGUF/AWQ por cuenta propia.
- Repositorio de un solo autor sin historial de mantenimiento: riesgo de abandono y falta de soporte.
- Advertencia de producción: no recomendado para sistemas en producción sin una evaluación previa exhaustiva y sin claridad sobre la licencia.

## Enlaces

- Hugging Face: https://huggingface.co/luisastellet/qwen-metaphor-unke-camada-6-zero-um
- Paper citado en los tags (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact#compute
- Familia Qwen3 (referencia del linaje): no disponible en la información proporcionada
- Repositorio, paper o demo del autor: no disponible en la información proporcionada
