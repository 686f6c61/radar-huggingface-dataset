# Convergent-ch/Alpina-Titan-2.0-80B-BF16

## Resumen

Alpina Titan 2.0 (también referido como "Chef Murmeli") es un ajuste fino experimental publicado por Convergent-ch sobre el modelo base Qwen/Qwen3-Coder-Next. Se distribuye como un modelo fusionado completo en BF16 con 79.674.391.296 parámetros almacenados, acompañado del adaptador LoRA original en la subcarpeta `adapter/`. La arquitectura subyacente es la del modelo Qwen3-Next, un transformer con mezcla de expertos (MoE), según la etiqueta `qwen3_next` del repositorio.

El modelo resuelve un problema acotado: aplicar una personalización de identidad y estilo conversacional ("Alpina") sobre un modelo base orientado a código, preservando todos los parámetros y expertos originales. El entrenamiento consistió en 360 pasos de adaptación con LoRA, usando Transformers 5.3.0, PEFT 0.18.1 y torchao 0.16.0 sobre pesos base en BF16. No se ha reentrenado el modelo desde cero.

Es relevante ahora únicamente como artefacto de investigación: el propio autor advierte que la evaluación es muy limitada (3/3 comprobaciones de identidad y 4/4 comprobaciones simples en Python) y que esos resultados no constituyen un benchmark de codificación ni evidencia de mejora de capacidad general. La licencia es Apache-2.0 y el idioma declarado es inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), familia Qwen3-Next (`qwen3_next`) |
| Parámetros totales | 79.674.391.296 (pesos almacenados, safetensors) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (safetensors); GGUF Q4_K_M (publicado por separado); LoRA en BF16 |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16 fusionado), GGUF (Q4_K_M), adaptador PEFT/LoRA |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base Qwen/Qwen3-Coder-Next, etiquetada como `qwen3_next`, que corresponde a un transformer con mezcla de expertos. El release es un merge completo: todos los parámetros y expertos originales están presentes y solo las capas lineales objetivo reciben los deltas LoRA aprendidos. El adaptador original se conserva en `adapter/` y puede cargarse con PEFT sobre la revisión exacta del base indicada en `adapter_config.json`.

El entrenamiento consistió en 360 pasos de adaptación LoRA sobre pesos base en BF16, con Transformers 5.3.0, PEFT 0.18.1 y torchao 0.16.0. Las fuentes de datos citadas incluyen prefijos de SmolLM-Corpus (ODC-BY), CodeParrot filtrado por permisividad, Smol-SmolTalk (Apache-2.0) y self-oss-instruct-sc2-exec-filter-50k (ODC-BY). No se documenta el número total de tokens procesados ni si hubo fases de RLHF o DPO. La innovación técnica destacable es la preservación íntegra de los expertos del base durante la fusión, de modo que la personalización no altera la estructura MoE original.

## Capacidades

- Generación de texto conversacional en inglés, con una identidad personalizada ("Alpina") inducida mediante LoRA.
- Generación de código, heredada del base Qwen3-Coder-Next; el autor solo valida cuatro comprobaciones simples en Python, no un benchmark de codificación.
- Razonamiento y matemáticas: capacidades heredadas del base, no evaluadas en este release.
- Tool calling / function calling: no documentado en la información disponible; probablemente heredado del base, pero sin verificación publicada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales: no se documenta modo thinking, visión ni audio.

## Casos de uso

- Investigación sobre personalización de identidad: permite estudiar cómo un adaptador LoRA de 360 pasos modifica el comportamiento conversacional de un modelo MoE grande sin reentrenar el base, comparando respuestas con y sin el adaptador.
- Experimentación con merges LoRA en arquitecturas MoE: sirve para validar pipelines de fusión que preservan todos los expertos y parámetros originales, útil para equipos que construyen sus propias variantes sobre Qwen3-Next.
- Evaluación de técnicas de ajuste eficiente: al publicarse el adaptador en `adapter/` junto al modelo fusionado, permite reproducir la carga con PEFT y medir el coste real de la adaptación frente al modelo completo.
- Pruebas de despliegue en formato GGUF: la variante Q4_K_M permite experimentar con Ollama en entornos con VRAM limitada, aunque con las limitaciones propias de una cuantización de 4 bits sobre un modelo de ~80B.
- Generación de código asistida en inglés: uso heredado del base para tareas de autocompletado o explicación de código, siempre con validación humana y sin asumir mejoras por el ajuste.
- Estudio de procedencia y licencias de datasets: el repositorio documenta las fuentes de entrenamiento (SmolLM-Corpus, CodeParrot, Smol-SmolTalk, self-oss-instruct), lo que lo hace útil como caso de trazabilidad de datos en proyectos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que las comprobaciones realizadas (3/3 de identidad y 4/4 de Python simple) no constituyen un benchmark de codificación ni evidencia de mejora de capacidad general. No se deben inferir métricas de calidad a partir de las respuestas correctas de identidad.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 160 GB solo para pesos (79,67B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica requiere múltiples GPU.
- VRAM estimada en GGUF Q4_K_M: del orden de 45-50 GB para pesos, más overhead; viable en configuraciones multi-GPU de consumo o en una GPU profesional de 80 GB.
- GPU recomendadas: H100 80 GB, A100 80 GB o clústeres multi-GPU para BF16; para Q4_K_M, configuraciones con 2×RTX 4090 (48 GB) pueden quedarse justas y requerir descarga parcial a CPU.
- ¿Cabe en GPU de consumo? En BF16 no. En Q4_K_M es ajustado en 2×RTX 4090 y depende de la longitud de contexto y del número de expertos activos.
- Opciones de despliegue: Transformers (carga directa del safetensors fusionado), PEFT (carga del adaptador sobre el base), llama.cpp/Ollama para el GGUF Q4_K_M, y servidores compatibles con endpoints (etiqueta `endpoints_compatible`).
- Latencia y throughput: no disponibles; dependen del número de parámetros activos del MoE, que no se documenta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Alpina Titan 2.0 80B BF16 | 79,67B (MoE) | no disponible | Apache-2.0 | HuggingFace, safetensors + GGUF | Ajuste LoRA experimental sobre Qwen3-Coder-Next, evaluación mínima |
| Qwen/Qwen3-Coder-Next | no disponible en la información | no disponible | no disponible en la información | HuggingFace | Modelo base; capacidades de codificación sin la personalización Alpina |
| Alternativas de ~70-80B tipo Llama 3.x / Qwen2.5 | ~70-72B (dense) | 128K en algunas variantes | licencias comunitarias variables | HuggingFace | Comparación de orden de magnitud; no se dispone de datos de benchmark de Alpina Titan para contrastar |

No se dispone de resultados de benchmarks del modelo que permitan una comparación cuantitativa con alternativas. La comparación debe limitarse a parámetros, licencia y formato de distribución.

## Limitaciones y advertencias

- Evaluación muy limitada: solo 3 comprobaciones de identidad y 4 de Python simple; no hay benchmark de codificación, razonamiento ni matemáticas.
- Riesgo de alucinación: no cuantificado; al ser un ajuste conversacional sobre un base de código, puede generar respuestas plausibles pero incorrectas, especialmente fuera del dominio de programación.
- Idioma: solo se declara inglés; el rendimiento en castellano no está verificado y probablemente sea inferior.
- Sesgos: no documentados; heredados del base y de los datasets de entrenamiento (SmolLM-Corpus, CodeParrot, Smol-SmolTalk, self-oss-instruct).
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías y advierte que es un release de investigación; conviene revisar las licencias de los datasets fuente (ODC-BY, Apache-2.0) si se redistribuye.
- Requisitos de hardware muy elevados en BF16 (~160 GB de pesos), lo que limita su uso a infraestructura profesional.
- El modelo base debe cargarse en la revisión exacta indicada en `adapter_config.json` si se usa el adaptador; ignorarlo puede producir incompatibilidades.
- No hay afiliación con Qwen ni con los autores de los datasets; la autoría del base no cambia por la personalización.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que refleja una adopción nula y ausencia de validación por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Convergent-ch/Alpina-Titan-2.0-80B-BF16
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-Next
- Dataset SmolLM-Corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset CodeParrot: https://huggingface.co/datasets/codeparrot/codeparrot-clean-train
- Dataset Smol-SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset self-oss-instruct-sc2-exec-filter-50k: https://huggingface.co/datasets/bigcode/self-oss-instruct-sc2-exec-filter-50k
