# arcadia-impact/scimt-dispatch-final-v1

## Resumen

`scimt-dispatch-final-v1` es un artefacto de investigación publicado por Arcadia Impact, un grupo de investigación de alineación con sede en Londres. No se trata de un modelo orientado a producción, sino del conjunto de pesos y registros de ejecución de un estudio experimental de "midtraining" (entrenamiento intermedio) diseñado para responder una pregunta concreta: si un prior instalado durante el midtraining sobrevive al entrenamiento posterior de instrucciones (instruct-training) y a un fine-tuning adversarial, y si esa supervivencia depende de la forma superficial del contenido.

El estudio se ejecuta sobre `gemma-3-12b-pt`, la versión preentrenada del modelo Gemma-3 de 12 mil millones de parámetros, y consta de tres brazos experimentales (control, charter y coin), cada uno con dos fases de entrenamiento de parámetros completos. El repositorio incluye 27 endpoints de evaluación resultantes de aplicar cuatro células LoRA adversariales a cada sustrato instruido. Es un recurso relevante para la comunidad de investigación en seguridad de IA y ciencia del midtraining, aunque no ofrece capacidades de uso directo para desarrolladores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base `gemma-3-12b-pt`) |
| Parametros totales | 12B (inferido del nombre del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repositorio contiene pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use (con Política de Uso Prohibido de Gemma) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es `unsloth/gemma-3-12b-pt`, fijado a la revisión `54ba4a26535408ddf5747cb9f7a5c16816659564`, un espejo sin restricciones del original `google/gemma-3-12b-pt`. Sobre esta base se ejecutan dos piernas de entrenamiento de parámetros completos por cada brazo experimental. La pierna A (midtrain) usa un batch global de 262.144 tokens y 381 pasos de optimizador, con checkpoints en los pasos 38, 122 y 381 (aproximadamente 10M, 32M y 100M tokens). La pierna B (instruct) usa un batch global de 2.097.152 tokens y 48 pasos.

Los tres brazos son: `control` (100M tokens de Dolmino), `charter` (50M de documentos charter + 50M de Dolmino intercalados) y `coin` (50M de documentos coin + 50M de Dolmino intercalados). El control ve el doble de Dolmino que los brazos de documentos, una convención deliberada para igualar el número total de presentaciones. Los datos de instrucción provienen de `allenai/Dolci-Instruct-SFT`. El filler es `allenai/dolma3_dolmino_mix-100B-1125`, materializado una vez con orden de shards sembrado para que los 50M de los brazos de documentos sean un prefijo estricto del control.

Posteriormente, sobre cada sustrato instruido se aplican cuatro células LoRA (r32/α64, 7 proyecciones, 8192 filas × 2 épocas = 512 pasos): `agreement`, `mixed_charter`, `mixed_coin` y `charter_only`. Los pares `mixed_charter` y `mixed_coin` son un par verificado de inversión de etiquetas sobre los mismos 164 episodios de conflicto. La evaluación se realiza en 27 endpoints: 3 pre-AFT y 24 post-AFT (12 × 2 épocas). Todo el proceso usa semilla 42.

## Capacidades

- Este repositorio no ofrece un modelo listo para inferencia; es un conjunto de pesos de investigación con fines experimentales.
- No se documentan capacidades específicas de generación de texto, razonamiento, código, tool calling, agentes o visión más allá de las inherentes al modelo base Gemma-3-12b.
- El propósito es estudiar la persistencia de priors durante el midtraining y su resistencia al fine-tuning adversarial, no proporcionar funcionalidades de producción.
- Los checkpoints individuales pueden cargarse con la librería `transformers` para reproducir experimentos o realizar análisis adicionales, pero no se garantiza su comportamiento fuera del protocolo de evaluación definido.

## Casos de uso

Dado que se trata de un artefacto de investigación, los casos de uso son fundamentalmente científicos y no productivos:

- Estudio de la ciencia del midtraining: permite analizar cómo un prior instalado en una fase intermedia de entrenamiento se comporta tras el entrenamiento de instrucciones y el fine-tuning adversarial, comparando los tres brazos.
- Evaluación de robustez de priors: los endpoints post-AFT permiten medir si un prior sobrevive a un ataque adversarial de inversión de etiquetas, con aplicaciones en seguridad de modelos.
- Reproducción de experimentos de alineación: los manifiestos de ejecución y los checkpoints facilitan la replicación exacta del protocolo (semilla, mezclas, pasos) para verificar resultados.
- Análisis de varianza entre semillas: la advertencia del autor sobre una sola semilla invita a extender el estudio con más semillas para cuantificar la varianza run-to-run.
- Desarrollo de métodos de verificación de integridad de datos: el par `mixed_charter`/`mixed_coin` con verificación de inversión de etiquetas sirve como caso de estudio para pipelines de control de calidad en datasets.
- Investigación en gobernanza de IA: los resultados pueden informar políticas sobre cuándo y cómo los priors de seguridad pueden ser instalados y mantenidos en modelos de frontera.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de rendimiento estándar (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. Las evaluaciones reportadas son específicas del protocolo experimental (puntuaciones de los 27 endpoints), cuyos datos residen en un repositorio de dataset privado y no están disponibles públicamente.

## Requisitos de hardware

No se especifican requisitos de hardware en la información proporcionada. Dado que el modelo base tiene 12 mil millones de parámetros, un solo checkpoint en precisión FP16 ocuparía aproximadamente 24 GB de VRAM, lo que requeriría una GPU profesional como A100 (40/80 GB) o H100, o varias GPU consumer (por ejemplo, RTX 4090 con 24 GB) para inferencia. Sin embargo, estos son datos estimados a partir del tamaño del modelo base y no están confirmados por el autor. No se mencionan opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) ni métricas de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se proporcionan datos de modelos comparables en la misma categoría (artefactos de midtraining sobre Gemma-3-12b). El autor menciona "trabajo previo en esta línea" pero no lo identifica ni ofrece métricas comparativas.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un producto; el propio autor declara explícitamente que "nada aquí está destinado a despliegue".
- Se basa en una única semilla (seed 42). El autor advierte que el trabajo previo mide una desviación estándar de aproximadamente 9 puntos porcentuales en la métrica principal entre ejecuciones, por lo que diferencias de esa escala entre brazos no son interpretables de forma aislada.
- Los datos de evaluación (respuestas muestreadas y puntuaciones) residen en un repositorio privado y no están incluidos en este repositorio, lo que limita la verificación externa.
- La licencia Gemma impone restricciones de uso, incluyendo la Política de Uso Prohibido de Gemma, que se transmiten a estos derivados. Cualquier uso comercial o de producción debe cumplir con esos términos.
- No se documentan sesgos conocidos específicos, pero al ser un modelo base sin alineación de seguridad, es probable que herede sesgos y riesgos de alucinación del modelo Gemma-3 original.
- El tamaño del repositorio (509.6 GB) indica que contiene múltiples checkpoints (tres pasos por pierna A, más los resultados de pierna B y las células LoRA), lo que puede complicar la gestión de almacenamiento y descarga.

## Enlaces

- HuggingFace: https://huggingface.co/arcadia-impact/scimt-dispatch-final-v1
- Perfil de Arcadia Impact en HuggingFace: https://huggingface.co/datasets/arcadia-impact/
- Sitio web de Arcadia Impact: https://www.arcadiaimpact.org/
- Página de la AI Governance Taskforce: https://www.arcadiaimpact.org/ai-governance-taskforce
- Anuncio de la convocatoria 2026: https://opportunitydesk.org/2026/08/10/arcadia-impact-ai-governance-taskforce-2026/
