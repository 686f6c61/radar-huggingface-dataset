# danyloooah/reax-g2-soup2

## Resumen
reax-g2-soup2 es un modelo publicado por el usuario danyloooah en Hugging Face bajo licencia Apache 2.0, con acceso restringido (gated). Se distribuye en formato safetensors con 31.273.088.876 parámetros totales (aproximadamente 31,3 mil millones) y un repositorio de 62,6 GB, lo que sugiere pesos en precisión de 16 bits. La etiqueta "gemma4" indica que deriva de la familia Gemma, y "soup" apunta a una técnica de model souping (promediado o mezcla de pesos de varios checkpoints), aunque no se documenta el procedimiento exacto.

El modelo no incluye información sobre pipeline, idiomas soportados ni datos de entrenamiento en la información disponible. No se han publicado resultados de benchmarks ni documentación técnica asociada. La ficha se limita, por tanto, a los datos verificables del repositorio y a las inferencias razonables a partir de las etiquetas, marcando explícitamente todo aquello que no está confirmado.

Su relevancia actual es limitada desde el punto de vista de evaluación: sin model card detallada, sin benchmarks y con acceso restringido, su adopción en producción requiere validación empírica propia. Aun así, el tamaño (31B) y la base Gemma lo sitúan en la categoría de modelos densos de gran escala aptos para tareas de razonamiento y generación de código.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Gemma, etiqueta "gemma4"); detalles no disponibles |
| Parametros totales | 31.273.088.876 (~31,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors; no hay GGUF en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La etiqueta "gemma4" sugiere una arquitectura transformer decoder-only de la familia Gemma, con aproximadamente 31,3B parámetros densos. El sufijo "soup2" indica que los pesos probablemente resultan de un model soup, es decir, del promediado de los pesos de varios fine-tunes o checkpoints del mismo modelo base, una técnica habitual para mejorar la robustez y generalización sin coste de inferencia adicional. No se especifica qué checkpoints se combinaron, con qué hiperparámetros ni si hubo etapas de RLHF o DPO.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, el tokenizador ni innovaciones técnicas (atención lineal, decodificación especulativa, etc.). Tampoco se documenta si el modelo conserva la ventana de contexto del Gemma original o si fue extendida. Todo ello debe considerarse no disponible y requiere consultar al autor o inspeccionar la configuración del repositorio tras aceptar las condiciones de acceso.

## Capacidades
- Generación de texto: capacidad esperable por su naturaleza de modelo de lenguaje de 31B, aunque no está documentada ni evaluada.
- Razonamiento y matemáticas: plausible por tamaño y base Gemma, sin benchmarks que lo confirmen.
- Generación de código: probable, no verificado.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso
- Experimentación e investigación sobre model souping: el modelo permite estudiar el efecto del promediado de pesos en un backbone Gemma de 31B, comparando su comportamiento con el modelo base original en tareas controladas.
- Fine-tuning específico de dominio: al ser un modelo denso de 31B con licencia Apache 2.0, puede servir como punto de partida para ajuste supervisado en dominios verticales (legal, sanitario, técnico), siempre que se valide previamente su calidad base.
- Generación de texto asistida en entornos internos: con acceso gated y licencia permisiva, encaja en despliegues on-premise donde se requiera control de datos, tras cuantización a 8 o 4 bits para reducir requisitos de VRAM.
- Evaluación comparativa de checkpoints: útil como candidato en pipelines de evaluación automática (MMLU, GSM8K, HumanEval) frente a otros fine-tunes de Gemma, para decidir qué checkpoint desplegar.
- Prototipado de asistentes conversacionales: puede emplearse en pruebas de concepto de chat multi-turno, verificando empíricamente la longitud de contexto efectiva antes de comprometerse en producción.
- Base para destilación: un modelo de 31B puede actuar como profesor en procesos de destilación hacia modelos más pequeños, generando datos sintéticos etiquetados en dominios concretos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en FP16/BF16: aproximadamente 62,6 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 80 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 32-35 GB para pesos, más overhead; viable en una A100 80GB o H100 80GB con margen.
- VRAM estimada en cuantización de 4 bits: aproximadamente 16-18 GB para pesos; podría caber en una RTX 4090 (24 GB) con contexto moderado, aunque no hay GGUF oficial en el repositorio y habría que generarlo.
- GPU recomendadas: A100 80GB, H100 80GB, H200; para cuantización 4 bits, RTX 4090, RTX 6000 Ada o L40S.
- Cabe en GPU de consumo: solo con cuantización agresiva (4 bits) y contexto reducido; no en FP16.
- Opciones de despliegue: vLLM, TGI y Transformers para pesos safetensors; llama.cpp u Ollama requerirían conversión previa a GGUF, no disponible oficialmente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| reax-g2-soup2 | ~31,3B | no disponible | Apache 2.0 | Gated en Hugging Face | Sin benchmarks ni model card |
| Gemma 2 27B (referencia de familia) | ~27B | 8K (versión base) | Gemma Terms | Abierto con condiciones | Modelo oficial con benchmarks publicados |
| Qwen2.5 32B | ~32,5B | 128K | Apache 2.0 | Abierto | Benchmarks publicados y amplio ecosistema |
| Mistral Small 24B | ~24B | 32K | Apache 2.0 | Abierto | Benchmarks publicados |

La comparación con Gemma 2 27B es aproximada, ya que la etiqueta "gemma4" no permite confirmar la generación exacta del backbone. Los datos de contexto y rendimiento de reax-g2-soup2 no están disponibles, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias
- Ausencia total de model card: no se documentan datos de entrenamiento, idiomas, sesgos ni evaluación, lo que impide estimar riesgos de alucinación o sesgo de forma fundamentada.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que añade fricción para despliegues automatizados y reproducibilidad.
- Model soup sin trazabilidad: al no especificarse los checkpoints promediados, no se puede verificar la procedencia de los datos ni las licencias heredadas de cada fine-tune.
- Licencia Apache 2.0 declarada, pero la coexistencia con la etiqueta "gemma4" plantea dudas sobre la compatibilidad con los términos de uso de Gemma; conviene revisar las condiciones del modelo base antes de uso comercial.
- Sin cuantizaciones oficiales (GGUF, AWQ, GPTQ): el despliegue en hardware de consumo exige conversión propia y validación de degradación.
- Sin benchmarks: no se puede afirmar su rendimiento relativo frente a modelos de tamaño similar.
- Riesgo de alucinación y comportamiento no alineado: al no constar etapas de RLHF/DPO, la calidad conversacional y la adherencia a instrucciones son inciertas.

## Enlaces
- Hugging Face: https://huggingface.co/danyloooah/reax-g2-soup2
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
