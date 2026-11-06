# Rajan98/Qwen2.5-0.5B-Instruct-abliterated

## Resumen

Qwen2.5-0.5B-Instruct-abliterated es una modificación de los pesos de Qwen/Qwen2.5-0.5B-Instruct, el modelo instructivo compacto de la familia Qwen2.5 desarrollada por Alibaba Cloud. El autor de la modificación, Rajan98, aplica la técnica de *ablación direccional* descrita por Arditi et al. (2024) para eliminar la dirección de rechazo del flujo residual, de modo que el modelo deja de negarse a responder peticiones que el original rechazaría. No hay reentrenamiento ni fine-tuning: únicamente se ortogonalizan las matrices que escriben en el flujo residual respecto a un vector de dirección calculado empíricamente.

El modelo conserva la arquitectura, el tokenizador y el tamaño del original: un transformer decoder-only de 630.167.424 parámetros (0,63B), con 24 capas y una ventana de contexto de 32.768 tokens (heredada de Qwen2.5-0.5B). La intervención se realizó en la capa 16 de 24, la que ofreció menor tasa de rechazo con una divergencia KL inferior a 0,1 sobre distribuciones de siguiente token en prompts inocuos.

Su relevancia es doble: por un lado, sirve como caso de estudio reproducible de interpretabilidad y alineación, ya que el repositorio incluye el notebook completo (`abliteration.ipynb`), los vectores de dirección por capa (`directions.pt`) y los metadatos de la intervención (`abliteration.json`); por otro, ofrece un modelo sin comportamiento de seguridad propio para investigación sobre refusal, jailbreaks y evaluación de salvaguardas. No está pensado como modelo de producción generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), con `lm_head` desvinculado de `embed_tokens` (`tie_word_embeddings: false`) |
| Parametros totales | 630.167.424 (0,63B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-0.5B-Instruct; no verificada en la model card) |
| Tipos de cuantizacion | Pesos almacenados en bf16; el autor indica que la edición se calculó en fp32. No se listan cuantizaciones publicadas (GGUF, AWQ, GPTQ) en la información disponible |
| Idiomas soportados | Inglés (declarado en la model card); el modelo base Qwen2.5 es multilingüe, pero la evaluación de esta variante es solo en inglés |
| Licencia | Apache-2.0 (heredada de Qwen/Qwen2.5-0.5B-Instruct, Copyright Alibaba Cloud) |
| Formato de pesos | safetensors (repositorio de 1,3 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen2.5-0.5B-Instruct original: un transformer decoder-only denso de 24 capas con atención de múltiples cabezas, RoPE y normalización RMSNorm. La modificación no altera la topología ni el tokenizador, por lo que el modelo carga con `transformers` estándar sin hooks ni código personalizado. La intervención consiste en proyectar fuera un único vector de dirección `r` de todas las matrices que escriben en el flujo residual: `W ← W − r (rᵀ W)` en cada `self_attn.o_proj` y `mlp.down_proj` (incluidas las bias donde existen), y `E ← E − (E r) rᵀ` en `embed_tokens`. Como Qwen2.5-0.5B vincula `lm_head` a `embed_tokens`, el autor desvincula primero la cabeza y la deja sin editar.

El procedimiento de obtención de la dirección sigue a Arditi et al. (2024): se ejecutan prompts dañinos e inocuos y se toma la activación del flujo residual en el último token del prompt (tras `<|im_start|>assistant\n`) en cada capa; la dirección candidata es la diferencia de medias normalizada `r = normalize(mean(harmful) − mean(harmless))`. Para elegir capa se ablaciona `r` en inferencia con hooks y se mide, sobre una partición de validación, la tasa de rechazo ante prompts dañinos y la divergencia KL sobre distribuciones de siguiente token en prompts inocuos, conservando capas con KL < 0,1 en el primer 80% de la red. Ganó la capa 16 de 24. Como comprobación causal, sumar el vector de diferencia de medias de la capa 16 al modelo original indujo rechazo en prompts inocuos (4 de 5 en la ejecución de referencia), lo que confirma que la dirección tanto elimina como induce la conducta de rechazo.

No hubo entrenamiento, RLHF ni DPO adicionales. El conjunto de datos citado (`josephmayo/refusal-compliance-pairs`) se usa para calcular direcciones y evaluar, no para ajustar pesos.

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla `apply_chat_template` compatible con el original.
- Razonamiento básico y respuesta a preguntas generales, limitado por el tamaño de 0,63B parámetros.
- Generación de código y matemáticas elementales, con la calidad propia del modelo base de 0,5B.
- Cumplimiento de peticiones que el modelo original rechaza, incluida la generación de contenido dañino (comportamiento explícito de esta variante).
- Sin capacidades de visión, audio ni tool calling nativo documentadas en esta variante.
- Sin modo de razonamiento extendido (*thinking mode*) documentado.
- Multilingüismo heredado del base no evaluado; la model card solo declara inglés.

## Casos de uso

- Investigación en interpretabilidad: reproducir el pipeline completo de `abliteration.ipynb` (carga, cálculo de dirección, barrido de capas, ortogonalización, evaluación y visualización) para estudiar cómo se representa el rechazo en un transformer pequeño.
- Evaluación de salvaguardas y clasificadores de contenido: usar el modelo como generador de respuestas que un filtro externo debe detectar, midiendo la tasa de falsos negativos de un guardarraíl.
- Estudio de jailbreaks y robustez de alineación: comparar la tasa de rechazo del original frente a la variante para cuantificar el efecto de una única dirección en la conducta de seguridad.
- Docencia sobre alineación: ilustrar en un modelo de 0,63B que cabe en CPU con 16 GB de RAM en fp32 cómo una intervención lineal en los pesos modifica una conducta compleja.
- Análisis de efectos colaterales: medir la divergencia KL en distribuciones de siguiente token sobre prompts inocuos (0,025 frente al original) para estudiar el coste de capacidad de la ablación.
- Pruebas de pipelines de despliegue: validar integraciones con `transformers`, text-generation-inference o endpoints compatibles usando un modelo pequeño y de licencia permisiva.
- Generación de datos sintéticos para experimentos controlados: producir pares de respuesta con y sin rechazo para entrenar clasificadores de seguridad en entornos de laboratorio.

## Benchmarks y rendimiento

La model card solo publica la evaluación sobre la partición de test retenida de `josephmayo/refusal-compliance-pairs` (20 prompts dañinos + 20 inocuos, decodificación greedy, 64 tokens nuevos):

| Metrica | Original | Abliterated |
|---|---|---|
| Tasa de rechazo ante prompts dañinos | 0,65 | 0,00 |
| Tasa de rechazo ante prompts inocuos | 0,05 | 0,05 |
| KL de siguiente token en prompts inocuos vs. original | 0 | 0,025 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor indica que los efectos colaterales en capacidad solo se comprobaron de forma puntual, no con benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,3 GB de pesos más overhead de activaciones y caché KV; en la práctica cabe en GPUs con 4 GB o más.
- En fp32 (para reproducir el notebook) ocupa unos 2,5 GB y se ejecuta en CPU con 16 GB de RAM, según indica el autor.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también A100/H100 para despliegues por lotes.
- Cabe holgadamente en GPU consumer, incluidas integradas con suficiente memoria compartida.
- Opciones de despliegue: `transformers` (soporte nativo), text-generation-inference (el repo declara `text-generation-inference` y `endpoints_compatible`); llama.cpp, Ollama o vLLM requerirían conversión a GGUF o formatos compatibles, no publicados en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Conducta de rechazo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rajan98/Qwen2.5-0.5B-Instruct-abliterated | 0,63B | 32.768 (heredado) | Eliminada por ablación direccional (0,00 en test) | Apache-2.0 | Hugging Face, 93 descargas |
| Qwen/Qwen2.5-0.5B-Instruct | 0,63B | 32.768 | Estándar (0,65 en test) | Apache-2.0 | Hugging Face, ampliamente usado |
| Otras variantes abliterated de Qwen2.5 | no disponible | no disponible | Eliminada por ablación | Apache-2.0 (presumible) | no disponible en la información |
| Modelos instructivos de ~0,5B (p. ej. SmolLM2-360M-Instruct) | ~0,36B | no disponible | Estándar | Apache-2.0 | Hugging Face |

La comparación con alternativas de la misma categoría (modelos abliterated de otros tamaños) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo cumple con peticiones que el original rechaza, incluidas las dañinas; no tiene comportamiento de seguridad propio y no debe desplegarse sin filtros externos.
- La evaluación es muy pequeña: 20 prompts por clase y detección de rechazo por coincidencia de palabras clave en los primeros 160 caracteres, lo que no captura rechazos sutiles, evasivas ni cumplimientos de baja calidad.
- Eliminar el rechazo no hace correctas las respuestas: con 0,63B parámetros, buena parte de lo generado ante prompts dañinos es vago o erróneo.
- Los efectos colaterales en capacidad solo se comprobaron de forma puntual (KL de siguiente token y algunas preguntas generales), no con benchmarks.
- Evaluación únicamente en inglés; el multilingüismo del base no está verificado en esta variante.
- Riesgo de alucinación elevado por el tamaño reducido del modelo.
- Sesgos heredados del modelo base Qwen2.5-0.5B-Instruct, no evaluados en esta variante.
- Licencia Apache-2.0 permite uso comercial, pero el uso de un modelo sin salvaguardas en producción puede incumplir normativas de contenido y políticas de plataforma; la responsabilidad recae en el desplegador.
- El cambio de `tie_word_embeddings` a `false` altera el grafo de pesos respecto al original; conviene verificar la carga en herramientas que asuman pesos vinculados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rajan98/Qwen2.5-0.5B-Instruct-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de evaluación: https://huggingface.co/datasets/josephmayo/refusal-compliance-pairs
- Paper de referencia (Arditi et al., 2024): https://arxiv.org/abs/2406.11717
- Licencia: https://huggingface.co/Rajan98/Qwen2.5-0.5B-Instruct-abliterated/blob/main/LICENSE
