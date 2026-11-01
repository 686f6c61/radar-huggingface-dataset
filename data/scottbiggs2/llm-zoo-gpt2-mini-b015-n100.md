# ScottBiggs2/llm-zoo-gpt2-mini-b015-n100

## Resumen

`llm-zoo-gpt2-mini-b015-n100` es un artefacto de investigación publicado por ScottBiggs2 en HuggingFace. No es un modelo de lenguaje de propósito general, sino un *zoo* (colección) de 100 modelos GPT-2 pequeños, cada uno con 51.475.968 parámetros, que comparten un tronco de inicialización común y difieren únicamente en la mezcla de datos de preentrenamiento utilizada. El objetivo declarado es estudiar la estructura del espacio de pesos a través de una población de modelos que parten de la misma inicialización.

Cada miembro se entrena desde cero con un presupuesto de tokens fijo (20 tokens por parámetro) sobre cinco corpus públicos: web, código, matemáticas, libros y multilingüe. Los miembros se sitúan en puntos de un símplex de mezclas de 5 dimensiones, lo que permite analizar cómo varían los pesos en función de la distribución de datos de entrenamiento.

El modelo es relevante para investigadores interesados en el análisis del espacio de pesos, la relación entre datos y parámetros, y metodologías de model zoos. No está pensado para uso en producción ni para tareas generativas reales: el propio autor advierte de que la calidad del texto es débil y que no hay ajuste por instrucciones ni alineación de seguridad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2) |
| Parámetros totales | 51.475.968 por miembro (100 miembros) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (GPT-2 estándar, típicamente 1024 tokens, no confirmado en la model card) |
| Tipos de cuantización | No disponible (pesos en float32) |
| Idiomas soportados | No disponible (entrenado con datos multilingües: fineweb-2 fra_Latn, pero sin evaluación de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estilo GPT-2 con 8 capas, tamaño oculto de 512 y 8 cabezas de atención. El vocabulario es el BPE de GPT-2 (50.257 tokens) y el `lm_head` está atado a la embedding de entrada. Cada miembro parte de un tronco compartido (`trunk/`) entrenado durante 6.676 pasos de optimizador con semilla 1234. A partir de ahí, cada miembro entrena una fracción beta = 0,15 del presupuesto total (es decir, 0,15 × 7.854 = 1.178 pasos adicionales) sobre su propia mezcla de datos. El presupuesto total es de 20 tokens por parámetro. El dropout es 0,0, igual que en entrenamiento.

Los datos de entrenamiento son cinco corpus públicos: `HuggingFaceFW/fineweb-edu` (sample-10BT, split train) para web, `codeparrot/codeparrot-clean` (train) para código, `open-web-math/open-web-math` (train) para matemáticas, `manu/project_gutenberg` (en) para libros y `HuggingFaceFW/fineweb-2` (fra_Latn, train) para multilingüe. Cada miembro tiene una mezcla `pi` sobre estos cinco dominios, registrada en `members.json`. No se menciona RLHF, DPO ni ajuste por instrucciones. La innovación técnica principal es la metodología de model zoo: 100 modelos con inicialización compartida y mezclas controladas, con conversión bit-exacta de vectores planos a safetensors verificada para cada miembro.

## Capacidades

- Generación de texto básica: el modelo puede producir texto, pero con calidad débil según el autor, al haber sido entrenado desde cero con un presupuesto limitado.
- Razonamiento y matemáticas: no hay evidencia de capacidades robustas; el entrenamiento incluye open-web-math, pero sin evaluación publicada.
- Código: incluye codeparrot-clean en las mezclas, pero sin datos de rendimiento en generación de código.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: entrenado parcialmente con fineweb-2 fra_Latn, pero sin evaluación de idiomas ni confirmación de competencia multilingüe.
- Capacidades especiales: no dispone de thinking mode, visión ni audio.
- Uso como artefacto de investigación: permite estudiar el espacio de pesos, la relación datos-parámetros y metodologías de model zoos.

## Casos de uso

- Investigación sobre el espacio de pesos: el zoo permite analizar cómo varían los pesos de 100 modelos que comparten inicialización pero difieren en la mezcla de datos, facilitando estudios de interpolación, linealidad y estructura latente.
- Estudio de la relación datos-parámetros: cada miembro tiene una mezcla `pi` conocida, lo que permite correlacionar distribuciones de datos con cambios en los pesos y el comportamiento.
- Metodología de model zoos: sirve como ejemplo reproducible de construcción de poblaciones de modelos con tronco compartido y ramificación controlada, útil para diseñar experimentos similares.
- Benchmarking de técnicas de análisis de pesos: los checkpoints bit-exactos y el manifiesto SHA-256 permiten validar herramientas de comparación de pesos, alineación de representaciones o detección de cambios.
- Docencia y divulgación: el tamaño pequeño (51M parámetros) y la licencia Apache-2.0 facilitan su uso en cursos sobre entrenamiento de transformers y análisis de modelos.
- Reproducibilidad de experimentos: la inclusión de `members.json`, `provenance/` y el tronco permite replicar análisis sin reentrenar, aunque no se distribuye el estado del optimizador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: cada miembro tiene 51,5M parámetros en float32, lo que supone aproximadamente 206 MB de pesos. Con overhead de activaciones y tokenizador, cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; por ejemplo, RTX 3060, RTX 4090, A100 o H100. También funciona en CPU.
- Cabe en consumer GPU: sí, en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers (carga mediante `GPT2LMHeadModel.from_pretrained` con `subfolder="members/member_XXX"`), llama.cpp si se convierte a GGUF, y potencialmente vLLM o TGI aunque no está validado en la model card.
- Latencia y throughput estimados: no disponibles. Por el tamaño, la inferencia en GPU es de milisegundos por token, pero no hay cifras publicadas.
- Nota: el repositorio completo ocupa 20,8 GB, ya que contiene 100 miembros más el tronco. Para usar un solo miembro solo se descarga el subfolder correspondiente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| llm-zoo-gpt2-mini-b015-n100 | 51,5M por miembro (100 miembros) | No disponible | Apache-2.0 | Artefacto de investigación (model zoo) |
| GPT-2 small (OpenAI) | 124M | 1024 | MIT | Modelo de propósito general |
| DistilGPT-2 | 82M | 1024 | Apache-2.0 | Modelo destilado para generación |
| GPT-2 mini (variantes comunitarias) | ~50M | 1024 | Variable | Experimentos y prototipos |

La comparación directa es limitada porque este zoo no es un modelo de propósito general. Frente a GPT-2 small o DistilGPT-2, el zoo ofrece un tamaño similar o menor por miembro, pero su valor reside en la población de 100 modelos con mezclas controladas, no en el rendimiento individual. No se dispone de benchmarks comparativos.

## Limitaciones y advertencias

- Calidad de texto débil: el autor advierte explícitamente de que los modelos se entrenaron desde cero con un presupuesto fijo y corpus pequeños, por lo que la generación es de baja calidad.
- Sin ajuste por instrucciones ni alineación de seguridad: no apto para aplicaciones de usuario final ni para producción.
- Sesgos conocidos: no documentados, pero los corpus de entrenamiento (web, código, matemáticas, libros, multilingüe) pueden introducir sesgos de dominio y de idioma.
- Riesgo de alucinación: alto en cualquier uso generativo, dado el entrenamiento limitado y la ausencia de evaluación.
- Limitaciones de contexto e idioma: no se confirma la longitud de contexto efectiva; el multilingüe se limita a francés (fra_Latn) en los datos, sin evaluación.
- Restricciones de licencia: los pesos son Apache-2.0, pero los datasets subyacentes mantienen sus propias licencias y términos; es necesario revisar cada dataset card antes de reutilizar los datos.
- Caveat para producción: es un artefacto de investigación, no un modelo listo para despliegue. El repositorio completo pesa 20,8 GB y contiene 100 checkpoints; el estado del optimizador no se incluye en el tronco.
- Preprint pendiente: el enlace al preprint aún no está disponible, lo que limita la validación metodológica externa.

## Enlaces

- HuggingFace: https://huggingface.co/ScottBiggs2/llm-zoo-gpt2-mini-b015-n100
- Preprint: no disponible (el autor indica "link coming soon")
- Datasets utilizados:
  - https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
  - https://huggingface.co/datasets/codeparrot/codeparrot-clean
  - https://huggingface.co/datasets/open-web-math/open-web-math
  - https://huggingface.co/datasets/manu/project_gutenberg
  - https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Repositorio de transformers: https://github.com/huggingface/transformers
- No se han encontrado otros enlaces (papers, blogs, demos) en la información proporcionada.
