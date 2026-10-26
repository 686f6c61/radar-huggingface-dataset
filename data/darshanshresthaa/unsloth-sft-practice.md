# Darshanshresthaa/Unsloth-SFT-Practice

## Resumen

Unsloth-SFT-Practice es un ajuste fino supervisado (SFT) del modelo TinyLlama en versión cuantizada a 4 bits (`unsloth/tinyllama-bnb-4bit`), publicado por el usuario Darshanshresthaa en HuggingFace. Se trata de un artefacto experimental de entrenamiento, no de un modelo con vocación de producción: el repositorio ocupa 0,1 GB, no tiene descargas ni interacciones y su model card se limita a la plantilla automática que genera Unsloth al finalizar un entrenamiento.

El modelo hereda la arquitectura y el tamaño de TinyLlama (aproximadamente 1.100 millones de parámetros, transformer decoder-only con 2.048 tokens de contexto según el modelo base), por lo que resuelve el problema típico de los entornos con recursos limitados: permite ejecutar y ajustar un LLM en una única GPU de consumo. Su interés actual es principalmente didáctico, como ejemplo reproducible de un pipeline de SFT con Unsloth y TRL sobre un modelo pequeño.

No se dispone de información sobre el dataset de ajuste, el número de pasos, la composición de los datos ni los hiperparámetros empleados. Cualquier evaluación de capacidades debe hacerse empíricamente antes de considerarlo para un uso real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de TinyLlama; no detallada en la model card) |
| Parametros totales | 1,1 B aproximadamente (heredado del modelo base TinyLlama; no confirmado en la model card) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens según el modelo base TinyLlama; no confirmado en la model card |
| Tipos de cuantizacion | Base cuantizada en 4 bits con bitsandbytes (bnb-4bit); no se publican versiones GGUF ni AWQ/GPTQ |
| Idiomas soportados | ingles (`language: en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

Arquitectura: al derivar de TinyLlama, se trata de un transformer decoder-only denso con normalización RMSNorm, activación SwiGLU, RoPE y atención con key/value heads compartidas (GQA), en torno a 1.100 millones de parámetros y 2.048 tokens de contexto. La model card no aporta ninguna confirmación explícita de estos detalles; se deducen del identificador del modelo base.

Entrenamiento: la model card únicamente indica que es un ajuste fino supervisado (SFT) realizado con Unsloth sobre `unsloth/tinyllama-bnb-4bit`, con la afirmación genérica de que el entrenamiento fue "2x más rápido" gracias a las optimizaciones de Unsloth sobre TRL. No se especifican tokens de entrenamiento, composición del dataset, número de épocas, hiperparámetros, ni si hubo etapas posteriores de RLHF o DPO. El tag `trl` confirma el uso de la librería TRL, y la ausencia de cualquier sección de resultados o evaluación impide valorar la calidad del ajuste.

## Capacidades

- Generación de texto en inglés: es la única capacidad confirmada por los tags (`text-generation-inference`, `text-generation`).
- Razonamiento y matemáticas: no se han publicado evaluaciones; el modelo base TinyLlama tiene capacidades limitadas en estas tareas y el ajuste no documenta mejoras.
- Generación de código: no evaluada; no hay evidencia de entrenamiento específico en código.
- Tool calling / function calling: no disponible; no se menciona soporte de plantillas de herramientas ni formatos de function calling.
- Agentes y razonamiento multi-paso: no disponible; el contexto de 2.048 tokens limita cualquier flujo agéntico con historial largo.
- Multilingüe: no; el modelo declara únicamente inglés.
- Capacidades especiales (thinking mode, visión, audio): ninguna documentada.

## Casos de uso

- Docencia y reproducción de pipelines de SFT: sirve como ejemplo mínimo de ajuste supervisado con Unsloth y TRL sobre una GPU de consumo, útil en talleres y cursos para ilustrar el flujo completo desde el modelo base hasta el artefacto publicado en HuggingFace.
- Pruebas de integración en CI: al ocupar 0,1 GB en el repositorio y requerir poca VRAM, puede usarse como modelo "dummy" para validar pipelines de despliegue (TGI, transformers, endpoints compatibles) sin coste de infraestructura.
- Prototipado rápido de interfaces de chat: permite levantar una demo local de generación de texto en inglés en minutos, con la salvedad de que la calidad del ajuste no está verificada.
- Experimentación con cuantización de 4 bits: el checkpoint permite estudiar el comportamiento de pesos bnb-4bit cargados con transformers y comparar la fidelidad frente a una conversión fp16 del modelo base.
- Benchmarking de infraestructura: su tamaño reducido lo hace adecuado para medir latencia y throughput de frameworks de inferencia (vLLM, TGI, llama.cpp tras conversión a GGUF) antes de escalar a modelos mayores.
- Filtrado y generación de texto corto a bajo coste: tareas de etiquetado simple o generación de descripciones breves en inglés sobre CPU o GPU modesta, siempre con validación humana y tras una evaluación previa del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 2,5-3 GB en fp16 para 1,1 B de parámetros (sin contar caché KV); aproximadamente 0,7-1 GB si se carga en 4 bits.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 lo ejecutan sin problemas (las GPU de datacenter quedan sobredimensionadas).
- GPU de consumo: sí, cabe holgadamente en tarjetas de gama de entrada; también es viable en CPU para inferencia con pocos usuarios concurrentes.
- Opciones de despliegue: transformers (formato nativo), TGI (el tag `text-generation-inference` está presente), vLLM, y llama.cpp u Ollama previa conversión a GGUF (no se publica GGUF en el repositorio).
- Latencia y throughput: no disponible; no hay mediciones publicadas. Por el tamaño del modelo, se espera una latencia muy baja en GPU, pero no se aportan cifras verificables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Unsloth-SFT-Practice (este modelo) | ~1,1 B | 2.048 (heredado) | Apache 2.0 | HuggingFace, safetensors | Ajuste SFT no documentado, sin benchmarks |
| TinyLlama-1.1B (base original) | 1,1 B | 2.048 | Apache 2.0 | HuggingFace | Modelo base con model card y evaluación publicadas |
| TinyLlama-1.1B-Chat-v1.0 | 1,1 B | 2.048 | Apache 2.0 | HuggingFace | Variante alineada para diálogo, con evaluación publicada |
| Qwen2.5-1.5B-Instruct | ~1,5 B | 32.768 | Apache 2.0 | HuggingFace | Contexto mucho mayor y soporte multilingüe; requiere algo más de VRAM |

Comparativa de rendimiento en benchmarks: no disponible para este modelo; no se han publicado métricas que permitan situarlo frente a las alternativas.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de ajuste: se desconoce qué datos se usaron, su procedencia y sus posibles sesgos.
- Riesgo de alucinación elevado: el modelo base TinyLlama es propenso a inventar información, y no hay evaluación que indique que el ajuste lo mitigue.
- Sesgos: no evaluados; al desconocerse los datos de entrenamiento no puede descartarse la amplificación de sesgos presentes en ellos.
- Idioma: solo inglés declarado; el rendimiento en castellano no está soportado ni evaluado.
- Contexto corto (2.048 tokens heredados): inadecuado para conversaciones largas, documentos extensos o flujos agénticos.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero el autor no ofrece garantías ni soporte; conviene conservar los avisos de licencia y verificar la licencia del modelo base.
- Repositorio sin descargas ni validación comunitaria: no hay evidencia externa de que el checkpoint funcione correctamente ni de que el ajuste haya convergido.
- No recomendado para producción sin una evaluación propia previa: se trata de un artefacto de práctica de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Darshanshresthaa/Unsloth-SFT-Practice
- Modelo base: https://huggingface.co/unsloth/tinyllama-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Documentación de Unsloth: https://unsloth.ai/docs/desktop
- Página de Unsloth: https://unsloth.ai/
- Documentación de SFT en Unsloth (DeepWiki): https://deepwiki.com/unslothai/unsloth/6.1-standard-fine-tuning-(sft)
- TinyLlama (modelo original): https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
