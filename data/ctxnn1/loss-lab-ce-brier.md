# ctxnn1/loss-lab-ce-brier

## Resumen

`ctxnn1/loss-lab-ce-brier` no es un modelo de lenguaje de propósito general, sino un paquete de artefactos de investigación: un conjunto de checkpoints nanoGPT entrenados de forma emparejada para comparar dos funciones de pérdida, entropía cruzada (CE) y la regla de puntuación propia de Brier, sobre las mismas arquitecturas, datos y semillas. Lo publica el usuario `ctxnn1` (Chirag) bajo licencia MIT, con el objetivo declarado de hacer reproducible un estudio exploratorio sobre geometría de puntuaciones, no de ofrecer un modelo usable en producción. El repositorio ocupa 3,8 GB e incluye checkpoints nativos en PyTorch, exportaciones tensor-only en safetensors, configuraciones, tokenizadores, historiales de validación, pilotos y muestras de generación de todos los brazos del estudio.

El estudio cubre tres configuraciones —`scale-tinystories`, `v2-shakespeare` y `v2-tinystories`— con cinco semillas principales por pérdida y selección de learning rate mediante barrido de validación a duración completa; las puntuaciones de test nunca se usan para elegir hiperparámetros. Los resultados reportados muestran de forma consistente una NLL de test peor para Brier que para CE en los tres entornos (diferencias emparejadas de +0,08162, +0,11735 y +0,11303 respectivamente).

Es relevante ahora porque se alinea con el interés creciente por las reglas de puntuación propias en evaluación de IA (por ejemplo, la competición de evaluación predictiva de NeurIPS 2026, que puntúa con Brier ALC) y porque publica no solo pesos, sino el protocolo congelado, las comprobaciones SHA-256 de los artefactos y las mediciones de gradientes logit de CE y Brier. Su valor es metodológico y reproducible, no de capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo nanoGPT (implementación custom, no es un checkpoint de AutoModel) |
| Parametros totales | no disponible (la model card solo indica que "los modelos son pequeños"; no se publica el recuento por configuración) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no se documenta el block size en la información proporcionada) |
| Tipos de cuantizacion | no disponible; solo se distribuyen checkpoints nativos PT y exportaciones tensor-only en safetensors; no se documentan GGUF, AWQ, GPTQ ni similares |
| Idiomas soportados | en (inglés; datasets Shakespeare y TinyStories en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (tensor-only, cargable con `safetensors.torch.load_file`) + checkpoints nativos `.pt` de PyTorch |
| Pipeline de HuggingFace | no disponible (no declarado) |
| Tokenización | Caracteres para Shakespeare; bytes UTF-8 para TinyStories (metadatos del tokenizador junto a los pesos) |
| Tamaño del repositorio | 3,8 GB (incluye múltiples semillas, pilotos e historiales, además de duplicados PT y safetensors) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de escala reducida (nanoGPT, el código de referencia de Karpathy), reimplementado con código propio y empaquetado con las clases GPT "vendored" en `source/`. No hay innovaciones de arquitectura: el interés del experimento está en la función de pérdida. Cada brazo del estudio entrena el mismo modelo con los mismos datos y semillas, cambiando únicamente la regla de puntuación objetivo —entropía cruzada frente a Brier— y manteniendo idéntico el protocolo de selección de learning rate, que se elige por NLL de validación final tras un barrido de duración completa.

Los datos son TinyStories y Shakespeare, con preparación fijada y verificada por checksum. Los subconjuntos de TinyStories son prefijos en orden de fuente (source-order prefixes), y la tokenización es a nivel de byte para TinyStories y de carácter para Shakespeare, de modo que las NLL absolutas no son comparables entre configuraciones. El entrenamiento es supervisado de next-token prediction puro: no se documenta RLHF, DPO, instrucción tuning ni alineación alguna. La contribución técnica diferencial es la instrumentación: cada registro de test final incluye normas de gradiente logit condicionales de CE y Brier, bins de probabilidad de objetivo y predicciones "confiadamente erróneas", calculadas de forma analítica sobre las mismas logits y validadas contra autograd.

## Capacidades

- Generación de texto a nivel de carácter o byte en inglés, limitada a la distribución de TinyStories y Shakespeare; el modelo no está alineado ni ajustado por instrucciones.
- Modelado de lenguaje y puntuación probabilística: emite distribuciones de siguiente token sobre las que se puede calcular CE y Brier de forma directa.
- Análisis de geometría de puntuaciones: los artefactos permiten reproducir las mediciones de gradientes logit, bins de probabilidad y predicciones confiadamente erróneas.
- Reproducibilidad de extremo a extremo: configuración congelada (`source/configs/research-plan.json`, `source/docs/RESEARCH_PLAN.md`), manifiestos SHA-256 (`S3_MANIFEST.json`, `FILES_SHA256.json`) e historiales de validación completos.
- Capacidades multilingües: no disponibles; solo inglés.
- Tool calling / function calling: no soportado.
- Comportamiento agéntico o razonamiento multi-paso: no soportado.
- Visión, audio o modo "thinking": no soportado.

## Casos de uso

- Reproducción de un estudio de reglas de puntuación: ejecutar `source/experiments/sample.py` con los checkpoints PT y regenerar las tablas de NLL de test de CE y Brier para verificar las diferencias emparejadas reportadas (+0,08162, +0,11735, +0,11303).
- Investigación en calibración y proper scoring rules: usar los pares de checkpoints (misma semilla, distinta pérdida) para estudiar cómo cambia la distribución de probabilidad del siguiente token cuando el objetivo es Brier en lugar de CE, sin confundir el efecto con cambios de datos o de arquitectura.
- Análisis de gradientes logit: emplear los registros de normas de gradiente condicionales para estudiar la geometría de la superficie de pérdida en modelos pequeños, con la ventaja de que el cálculo analítico ya está validado contra autograd.
- Docencia y formación en entrenamiento de LLM: el tamaño reducido de los modelos permite entrenar y evaluar el ciclo completo en una GPU de consumo, con un protocolo documentado y artefactos intermedios (pilotos, historiales) para ilustrar buenas prácticas de selección de hiperparámetros.
- Baseline metodológico en artículos: citar estos resultados como referencia de que, a igualdad de arquitectura y presupuesto, Brier no supera a CE en NLL de test en estos tres entornos, y contrastar con réplicas propias.
- Auditoría de reproducibilidad: usar los manifiestos SHA-256 y las exportaciones tensor-only en safetensors para validar pipelines internos de verificación de artefactos de investigación antes de su publicación.
- Estudio de sobreajuste en corpus pequeños: la configuración `v2-shakespeare` y el aviso explícito del autor sobre potencial sobreajuste la hacen útil como caso de análisis de generalización con datos en orden de fuente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor publica únicamente NLL de test bajo dos funciones de puntuación:

| Estudio | CE test NLL | Brier test NLL | Diferencia emparejada (Brier − CE) |
|---|---:|---:|---:|
| scale-tinystories | 0,55443 ± 0,00124 | 0,63605 ± 0,00225 | +0,08162 |
| v2-shakespeare | 1,56379 ± 0,01165 | 1,68114 ± 0,00924 | +0,11735 |
| v2-tinystories | 0,62480 ± 0,00209 | 0,73783 ± 0,00512 | +0,11303 |

Advertencias del propio autor que deben respetarse al interpretar la tabla: las unidades de token son específicas por dataset (caracteres en Shakespeare, bytes UTF-8 en TinyStories), por lo que las NLL absolutas no son comparables entre filas; las bandas indicadas son desviación estándar muestral, no intervalos de confianza; y cinco semillas con una rejilla de learning rate pequeña no establecen superioridad universal.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible por checkpoint; el autor solo indica que "los modelos son pequeños". Como referencia de escala, el repositorio completo (múltiples semillas, pilotos, historiales y duplicados PT + safetensors) ocupa 3,8 GB, lo que implica checkpoints individuales muy por debajo de ese tamaño.
- GPU recomendadas: cualquier GPU consumer reciente es suficiente para inferencia y, con alta probabilidad, para reentrenamiento; no se documentan requisitos concretos.
- Cabe en GPU consumer: sí, con margen amplio, dado el tamaño del repositorio y la escala nanoGPT; no se especifica el mínimo exacto.
- Opciones de despliegue: no es compatible con vLLM, TGI, Ollama ni llama.cpp de forma directa, porque es código nanoGPT propio y no un checkpoint de AutoModel, y no se distribuyen pesos GGUF. La carga prevista es `safetensors.torch.load_file` sobre la clase GPT incluida en `source/`, o el checkpoint PT nativo con `source/experiments/sample.py`.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ctxnn1/loss-lab-ce-brier` | no disponible (pequeño, nanoGPT) | no disponible | Investigación comparada CE vs Brier con artefactos reproducibles | MIT | HuggingFace, safetensors + PT |
| nanoGPT (Karpathy) | configurable por el usuario (no fijado) | configurable (block size definido por el usuario) | Implementación de referencia para entrenar GPT-2 a escala reducida | MIT | Repositorio GitHub |
| GPT-2 small (OpenAI) | 124M | 1024 tokens | Modelo preentrenado de propósito general | MIT | HuggingFace, safetensors |
| Modelos TinyStories de la comunidad | rango de millones a decenas de millones (varía) | típicamente cientos de tokens (varía) | Modelos pequeños entrenados sobre TinyStories | varía por autor | HuggingFace |

La comparación relevante no es de capacidades: ningún modelo de la tabla es un asistente utilizable. La diferencia de este repositorio es que publica pares de checkpoints controlados experimentalmente y el protocolo congelado que los respalda; nanoGPT aporta el código, GPT-2 small aporta un preentrenamiento real y los modelos TinyStories de la comunidad aportan el mismo tipo de corpus sin el diseño emparejado.

## Limitaciones y advertencias

- No es un modelo utilizable como asistente: no hay ajuste por instrucciones, ni alineación, ni tool calling. Generar texto con él produce continuaciones de estilo TinyStories o Shakespeare.
- Sesgos conocidos: TinyStories es un corpus sintético y simplificado; Shakespeare introduce inglés arcaico y sesgos de género y época propios del corpus. No se documenta ninguna evaluación de sesgo.
- Riesgo de alucinación: irrelevante en el sentido habitual, pero el modelo genera texto plausible sin base factual; no debe usarse para producir información verificable.
- Limitación idiomática: solo inglés; tokenización a nivel de byte o carácter, sin vocabulario multilingüe.
- Restricción de licencia: MIT permite uso comercial, pero el material es un artefacto de investigación sin garantías de ningún tipo; el autor limita explícitamente el alcance de sus conclusiones.
- Validez estadística acotada: cinco semillas y una rejilla de learning rate pequeña no establecen superioridad universal, según el propio autor.
- Comparaciones de NLL no trasladables entre datasets: unidades de token distintas (carácter vs byte UTF-8).
- Datos en orden de fuente y selección de checkpoint final fija: pueden inducir sesgos de generalización; el autor señala riesgo de sobreajuste en Shakespeare.
- El baseline v1 usó pilotos más cortos y se mantiene separado: no debe mezclarse con los resultados v2 ni con `scale-tinystories`.
- Código custom: requiere revisar y confiar en el código nanoGPT incluido; el autor indica que no se ejecuta código remoto personalizado de forma automática, pero la carga implica usar la clase GPT empaquetada.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/ctxnn1/loss-lab-ce-brier
- Perfil del autor en HuggingFace: https://huggingface.co/ctxnn1
- Perfil del autor en X: https://x.com/ctxnn1
- Blog del autor: https://ctxnn.github.io
- The Predictive AI Evaluation Competition at NeurIPS 2026 (contexto sobre Brier ALC): https://aimslab.stanford.edu/competition/
- Artículo de contexto sobre entropía cruzada en evaluación de modelos: https://www.analyticsvidhya.com/blog/2025/04/cross-entropy-loss-in-language-model-evaluation/
