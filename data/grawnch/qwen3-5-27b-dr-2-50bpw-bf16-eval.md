# Grawnch/Qwen3.5-27B-DR-2.50bpw-BF16-Eval

## Resumen

Qwen3.5-27B-DR-2.50bpw-BF16-Eval es un checkpoint de verificación publicado por el usuario Grawnch a partir de su propia cuantización de bajo bit `Grawnch/Qwen3.5-27B-DR-2.50bpw`, que a su vez deriva del modelo base `Qwen/Qwen3.5-27B`. No se trata de un modelo entrenado desde cero ni de un fine-tuning con nuevos datos: es una representación en `bfloat16` de los pesos efectivos ya descomprimidos de la cuantización de 2,50 bits por peso (bpw), almacenada como un checkpoint estándar de Hugging Face con la arquitectura `Qwen3_5ForCausalLM`.

El objetivo del autor es permitir la verificación independiente de las métricas declaradas para su cuantización sin necesidad de código personalizado: al estar los pesos en formato BF16 convencional, cualquier usuario puede cargarlo con `transformers`, `vLLM` o `lm-eval` usando `trust_remote_code=False`. El autor afirma que los resultados son bit-exactos (diferencia absoluta máxima de 0,0) respecto a la descompresión de la cuantización original mediante su herramienta `dr-triton`.

El modelo cuenta con 26.895.998.464 parámetros (aproximadamente 26,9 mil millones) y un repositorio de 53,8 GB, coherente con pesos BF16. La licencia declarada es Apache 2.0, heredada del modelo base. Es relevante ahora porque documenta una técnica de cuantización agresiva (por debajo de 2,5 bits por peso) sobre un modelo de ~27B, un régimen donde la pérdida de calidad suele ser severa y donde la verificación reproducible de la perplejidad y del rendimiento en razonamiento resulta especialmente valiosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`Qwen3_5ForCausalLM`, familia Qwen3.5) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (las evaluaciones usan ctx=1024 y ctx=2048) |
| Tipos de cuantizacion | El checkpoint esta en BF16 (pesos efectivos pre-multiplicados); la cuantizacion de origen es de 2,4998 bpw |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `Qwen/Qwen3.5-27B`, un transformer decoder-only de la familia Qwen3.5 con 26,9 mil millones de parámetros. Este repositorio no aporta información sobre la composición del dataset de entrenamiento, el número de tokens, ni sobre si el modelo base empleó RLHF, DPO u otras técnicas de alineación; esos detalles corresponden a la model card del modelo original de Qwen, no a este checkpoint.

La innovación técnica de este repositorio es de naturaleza procedimental, no arquitectónica. El autor parte de su cuantización de bajo bit `Qwen3.5-27B-DR-2.50bpw` (2,4998 bits por peso) y publica los pesos efectivos ya descomprimidos y pre-multiplicados en BF16, de modo que la inferencia se ejecuta con kernels estándar de `transformers` o `vLLM` sin necesidad de cargar código remoto. Según el autor, el resultado es bit-exacto respecto a la descompresión mediante `grawnchtoader/dr-triton`, con una diferencia absoluta máxima de 0,0. No se detalla en la información disponible el esquema concreto de cuantización (por ejemplo, si emplea escalas por grupo, rotaciones o correcciones de error), más allá de la referencia a la herramienta `dr-triton`.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredadas del modelo base Qwen3.5-27B.
- Razonamiento matemático y resolución de problemas de competición: el autor reporta un 90,00% (27/30) en AIME 2025 para esta representación cuantizada.
- Evaluación de modelado de lenguaje: perplejidad en WikiText-2 de 7,6277 con contexto de 2048 y de 8,8161 con contexto de 1024.
- Compatibilidad directa con `transformers`, `vLLM` y `lm-eval` sin `trust_remote_code`, lo que facilita su uso en pipelines de evaluación estándar.
- Capacidades de tool calling, agentes, multilingüismo, visión o modo de razonamiento explícito: no disponibles en la información proporcionada para este checkpoint (dependen de las del modelo base, no documentadas aquí).

## Casos de uso

- Verificación reproducible de cuantizaciones de bajo bit: un equipo de investigación puede cargar este checkpoint en `lm-eval` y reproducir de forma independiente la perplejidad en WikiText-2 (7,6277 a ctx=2048) y el resultado en AIME 2025 (90,00%), sin depender del código del autor de la cuantización.
- Auditoría de pipelines de compresión: sirve como referencia BF16 "efectiva" para comparar la salida de distintas implementaciones de descompresión y confirmar que coinciden bit a bit.
- Evaluación comparativa de modelos de ~27B: al ejecutarse con kernels estándar, puede incluirse en arneses de benchmark existentes junto a otros modelos del mismo tamaño para medir el impacto real de la cuantización a 2,50 bpw.
- Investigación sobre límites de la cuantización extrema: útil para estudiar hasta qué punto un modelo de 27B conserva capacidades de razonamiento matemático cuando se comprime por debajo de 2,5 bits por peso.
- Desarrollo de metodologías de evaluación: como checkpoint con métricas declaradas y verificables, sirve de ejemplo de buenas prácticas de reproducibilidad en publicaciones de cuantización.
- Despliegue en entornos con requisitos de código auditable: al no requerir `trust_remote_code`, encaja en organizaciones que restringen la ejecución de código remoto en sus pipelines de inferencia, aunque su tamaño en BF16 limita su uso a hardware con suficiente memoria.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado declarado por el autor |
|---|---|---|
| WikiText-2 | Perplejidad (ctx=2048) | 7,6277 |
| WikiText-2 | Perplejidad (ctx=1024) | 8,8161 |
| AIME 2025 | Exactitud | 90,00% (27/30) |

No se han publicado en la información disponible resultados comparativos frente a otros modelos (MMLU, HumanEval, GSM8K u otros), ni cifras del modelo base sin cuantizar que permitan medir la degradación introducida por la cuantización a 2,4998 bpw.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 54 GB solo para pesos (26,9B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda hardware con 80 GB o más por GPU, o reparto multi-GPU con `device_map="auto"`.
- GPU recomendadas: A100 80 GB, H100 80 GB, o configuraciones multi-GPU (por ejemplo, 2× RTX 4090 de 24 GB o 2× A6000 de 48 GB) para alojar los pesos BF16.
- GPU de consumo: no cabe en una única GPU de consumo de 24 GB en BF16; requeriría la cuantización original de 2,50 bpw o cuantizaciones posteriores en formatos de menor precisión.
- Opciones de despliegue: `transformers` (carga directa con `torch_dtype=torch.bfloat16` y `device_map="auto"`), `vLLM` y `lm-eval`, todos sin `trust_remote_code`. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, lo que no se documenta en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / precision | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-27B-DR-2.50bpw-BF16-Eval (este) | ~26,9B | no disponible | BF16 (pesos efectivos de cuantizacion 2,4998 bpw) | Apache 2.0 | Checkpoint de verificacion; PPL WikiText-2 7,6277 (ctx=2048); AIME 2025 90,00% |
| Qwen/Qwen3.5-27B (modelo base) | ~26,9B | no disponible | BF16 original | Apache 2.0 (segun este repo) | Referencia sin cuantizar; sin metricas en la informacion disponible |
| Grawnch/Qwen3.5-27B-DR-2.50bpw | ~26,9B | no disponible | Cuantizado a 2,4998 bpw | Apache 2.0 | Requiere `dr-triton` para descomprimir; mismo resultado bit-exacto segun el autor |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento más allá de las cifras declaradas para este checkpoint.

## Limitaciones y advertencias

- Este repositorio es un artefacto de verificación, no un modelo entrenado ni afinado: no aporta capacidades nuevas respecto a `Qwen/Qwen3.5-27B` y hereda todos sus sesgos y limitaciones, que no se documentan aquí.
- Riesgo de alucinación: inherente al modelo base; la cuantización a 2,4998 bpw puede incrementarlo, aunque el autor no publica una comparación de tasas de alucinación frente al modelo sin cuantizar.
- El checkpoint en BF16 ocupa 53,8 GB, lo que anula la principal ventaja de almacenamiento de la cuantización original de 2,50 bpw; para despliegue eficiente en memoria debe usarse el repositorio cuantizado original.
- No se documentan los idiomas soportados ni la longitud de contexto oficial; las evaluaciones publicadas solo cubren contextos de 1024 y 2048 tokens, por lo que el rendimiento en ventanas más largas no está verificado.
- Las métricas declaradas (perplejidad y AIME 2025) proceden del autor de la cuantización y no de una evaluación independiente; deben tratarse como resultados a reproducir, no como cifras contrastadas por terceros.
- La licencia Apache 2.0 se declara en este repositorio, pero conviene verificar los términos del modelo base `Qwen/Qwen3.5-27B` antes de un uso comercial, ya que las condiciones del modelo original prevalecen.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/Grawnch/Qwen3.5-27B-DR-2.50bpw-BF16-Eval
- Cuantización de origen: https://huggingface.co/Grawnch/Qwen3.5-27B-DR-2.50bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Herramienta de descompresión `dr-triton`: https://github.com/grawnchtoader/dr-triton
