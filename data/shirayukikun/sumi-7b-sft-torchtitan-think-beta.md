# shirayukikun/sumi-7b-sft-torchtitan-think-beta

## Resumen

Sumi-7b-sft-torchtitan-think-beta es un ajuste fino supervisado (SFT) del modelo base tohoku-nlp/sumi-7b, desarrollado por el usuario shirayukikun y publicado en Hugging Face bajo licencia Apache 2.0. El modelo conserva la arquitectura y el tamaño del base (7.767.543.808 parámetros, aproximadamente 7,8 mil millones) y se distribuye en formato safetensors con código personalizado (`custom_code`), lo que implica que requiere confiar en implementaciones no estándar para cargarlo con transformers.

La etiqueta del repositorio lo sitúa en la familia de modelos de difusión discreta (discrete diffusion, uniform diffusion, block diffusion), junto con tareas de mask-generation y text-generation. Esta combinación sugiere que el modelo emplea un paradigma de generación no autorregresivo basado en difusión sobre tokens discretos, en lugar de un transformer decoder clásico. El sufijo "think-beta" indica que el ajuste está orientado a modos de razonamiento extendido, aunque no se documenta en la información disponible cómo se implementa dicho modo.

El modelo tiene un interés limitado pero real para investigadores que exploran alternativas a la generación autorregresiva: la difusión discreta permite generar bloques de tokens en paralelo y potencialmente reducir la latencia en ciertos escenarios. Sin embargo, la ausencia de documentación, la falta de benchmarks publicados, el acceso restringido (gated) y las cero descargas registradas lo convierten en un artefacto experimental más que en una opción lista para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión discreta (discrete/uniform/block diffusion) según tags; no se detalla la topología interna |
| Parámetros totales | 7.767.543.808 (≈7,8 B) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (solo se publican pesos safetensors en el repo) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `custom_code` requerido en transformers) |

## Arquitectura y entrenamiento

El modelo se apoya en tohoku-nlp/sumi-7b, un base de aproximadamente 7,8 mil millones de parámetros. Las etiquetas del repositorio (discrete-diffusion, uniform-diffusion, block-diffusion, mask-generation) apuntan a un esquema de generación por difusión sobre tokens discretos: el modelo aprende a reconstruir secuencias enmascaradas mediante un proceso iterativo de denoising, en lugar de predecir el siguiente token de forma estrictamente autorregresiva. La variante "block diffusion" implica que la generación se realiza por bloques de tokens, lo que permite paralelismo intra-bloque.

El ajuste publicado es un SFT (supervised fine-tuning) sobre el base, con un prefijo "torchtitan" que sugiere el uso del framework TorchTitan de Meta para el entrenamiento distribuido. El sufijo "think-beta" indica un ajuste orientado a razonamiento, aunque no se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO. Tampoco se detalla la innovación técnica concreta del modo "think" ni si existe decodificación especulativa u otras optimizaciones de inferencia.

## Capacidades

- Generación de texto conversacional (pipeline declarado: text-generation, con tag conversational).
- Generación por difusión discreta: capacidad de producir tokens en paralelo mediante denoising iterativo, potencialmente con menor latencia que la generación autorregresiva en ciertos regímenes.
- Mask-generation: el modelo está etiquetado explícitamente para esta tarea, coherente con el paradigma de difusión sobre tokens enmascarados.
- Modo de razonamiento ("think-beta"): el nombre sugiere un modo de razonamiento extendido, pero no se documenta su funcionamiento ni su calidad.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible (los idiomas no están declarados).
- Visión, audio u otras modalidades: no disponible.

## Casos de uso

- Investigación en generación no autorregresiva: el modelo sirve como banco de pruebas para estudiar difusión discreta a escala de 7,8 B, comparando calidad y latencia frente a transformers decoder clásicos del mismo tamaño.
- Experimentos de generación por bloques: adecuado para medir el trade-off entre paralelismo intra-bloque y coherencia global en tareas de texto largo, gracias a la variante block diffusion.
- Relleno de texto enmascarado (mask-generation): útil en tareas de infilling donde se dispone de contexto a ambos lados y se quiere reconstruir el hueco, un escenario natural para modelos de difusión.
- Prototipado de asistentes conversacionales en entornos de investigación: el pipeline text-generation y el tag conversational permiten integrarlo en demos de chat, siempre que se acepte su naturaleza experimental.
- Estudio de modos de razonamiento: el sufijo "think-beta" lo hace candidato para analizar cómo un modelo de difusión maneja cadenas de razonamiento extendidas frente a modelos autorregresivos.
- Fine-tuning posterior como base: al ser Apache 2.0 y safetensors, puede servir de punto de partida para ajustes adicionales en laboratorios que quieran explorar SFT sobre difusión discreta.
- Evaluación comparativa de frameworks: el uso de TorchTitan en el entrenamiento lo convierte en un caso de estudio para reproducir pipelines de entrenamiento distribuido con difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15,5 GB solo para pesos (coincide con el tamaño del repo), más overhead de activaciones y KV/cache específico del esquema de difusión; en la práctica, se recomienda al menos 24 GB para comodidad.
- VRAM estimada en cuantización de 8 bits: alrededor de 8 GB de pesos, con overhead adicional; no se confirman cuantizaciones oficiales en el repo.
- GPU recomendadas: A100 40/80 GB o H100 para experimentación cómoda con lotes grandes; RTX 4090 (24 GB) viable en FP16 con lotes pequeños; RTX 3090 (24 GB) también viable con precauciones.
- ¿Cabe en GPU consumer? Sí, en RTX 4090/3090 con FP16 y lotes reducidos; en GPUs de 16 GB requeriría cuantización, no confirmada oficialmente.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía documentada por el tag `custom_code`; vLLM, llama.cpp, Ollama y TGI no están confirmados para esta arquitectura de difusión.
- Latencia y throughput: no disponibles; la generación por bloques podría reducir el número de pasos secuenciales, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Paradigma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shirayukikun/sumi-7b-sft-torchtitan-think-beta | ≈7,8 B | No disponible | Difusión discreta (block/uniform) | Apache 2.0 | Gated, 0 descargas |
| tohoku-nlp/sumi-7b (base) | ≈7,8 B | No disponible | Difusión discreta (según tags del base) | No disponible en esta ficha | Público en Hugging Face |
| Modelos decoder de ~7-8 B (p. ej. Llama-3-8B, Mistral-7B) | 7-8 B | 8k-32k típicamente | Transformer autorregresivo | Licencias variables (Llama community, Apache 2.0) | Amplia adopción, ecosistema maduro |

La comparación con decoders autorregresivos de tamaño similar es la más informativa: estos últimos cuentan con contexto documentado, cuantizaciones GGUF/AWQ, soporte en vLLM y benchmarks públicos, mientras que sumi-7b-sft-torchtitan-think-beta carece de todos esos datos. No se dispone de información sobre otros modelos de difusión discreta comparables en la información proporcionada.

## Limitaciones y advertencias

- Documentación prácticamente inexistente: no hay model card sustantiva, ni idiomas declarados, ni contexto especificado, ni detalles de entrenamiento.
- Cero descargas y cero likes en el momento de la ficha: no hay evidencia de uso comunitario ni validación externa.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que añade fricción para su evaluación.
- Requiere `trust_remote_code=True`: el código personalizado debe auditarse antes de ejecutarlo en producción, ya que puede contener lógica arbitraria.
- Paradigma experimental: la difusión discreta no tiene el soporte de ecosistema (vLLM, llama.cpp, TGI) que sí tienen los decoders autorregresivos, lo que complica el despliegue.
- Riesgo de alucinación: no cuantificado; en modelos SFT sin evaluación publicada, este riesgo es desconocido y potencialmente alto.
- Sesgos: no documentados; al desconocerse la composición del dataset de entrenamiento, no es posible evaluar sesgos de género, idioma o dominio.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar que el modelo base tohoku-nlp/sumi-7b no imponga condiciones adicionales.
- No apto para producción sin evaluación previa: la ausencia de benchmarks y de contexto documentado impide garantizar calidad, latencia o robustez.
- El modo "think-beta" es una etiqueta sin especificación: no se sabe si requiere prompts especiales, tokens de control o un formato concreto.

## Enlaces

- Hugging Face: https://huggingface.co/shirayukikun/sumi-7b-sft-torchtitan-think-beta
- Modelo base: https://huggingface.co/tohoku-nlp/sumi-7b
- Paper referenciado en tags: arXiv:2606.19005 (no verificado en la información disponible)
- Repositorio TorchTitan (framework de entrenamiento mencionado en el nombre): no disponible en la información proporcionada
- Demo, blog o repositorio adicional: no disponible
