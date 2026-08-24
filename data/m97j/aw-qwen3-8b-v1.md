# m97j/aw-qwen3-8b-v1

## Resumen

`m97j/aw-qwen3-8b-v1` es un adaptador LoRA de investigación construido sobre el modelo base `Qwen/Qwen3-8B-Base`, desarrollado por Minjae Kim (m97j) como parte del protocolo Axiom-World v1. Se trata de un artefacto de post-entrenamiento diseñado para estudiar recetas de entrenamiento en planificación basada en reglas dentro de un entorno sintético totalmente verificable llamado PlayWorld. El modelo implementa una receta de dos etapas: primero un ajuste fino supervisado (SFT) de razonamiento general con GSM8K y MATH-álgebra, y después un SFT específico sobre 2.000 episodios de PlayWorld derivados de un oráculo.

La relevancia de este modelo radica en su metodología pre-registrada y en su innovación técnica: el contrato de adaptador v2, que incluye `modules_to_save: [lm_head, embed_tokens]` para garantizar la terminación correcta de la plantilla de chat. Los resultados de evaluación muestran mejoras consistentes frente al control de ajuste directo en todas las suites de prueba, con diferencias estadísticamente significativas. No obstante, es un artefacto de investigación, no un asistente general, y sus tasas de aprobación absolutas son modestas (0.30–0.39 en suites de construcción).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-8B-Base (transformer decoder-only) |
| Parametros totales | No disponible (adaptador LoRA; modelo base de 8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (adaptador en BF16) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado a las proyecciones de atención y MLP del modelo base Qwen3-8B-Base, con una modificación clave: `modules_to_save` incluye `lm_head` y `embed_tokens`. Esta decisión no es trivial; sin ella, el adaptador no puede emitir de forma fiable el token terminal `<|im_end|>` de la plantilla de chat, lo que provoca truncamiento del 100 % de las salidas. El entrenamiento se realizó en dos fases: la primera (fase 1) consistió en un SFT de razonamiento general con un conjunto de 8.000 registros mezclando GSM8K (60 %) y MATH-álgebra (40 %); la segunda (fase 2) utilizó 2.000 episodios de PlayWorld generados por oráculo, con huella digital verificable. La precisión de entrenamiento fue BF16 y la atención se implementó con SDPA.

La innovación principal es el protocolo Axiom-World, un estudio pre-registrado que compara recetas de post-entrenamiento en un entorno verificable. El adaptador se entrenó con semillas 42, 43 y 44, y se evaluó con decodificación greedy sobre suites congeladas de 300 episodios cada una. El control fue un ajuste directo de tarea (A2v2) sobre los mismos datos congelados.

## Capacidades

- Generación de planes estructurados en JSON para episodios de PlayWorld, un mundo de juguete con reglas verificables.
- Razonamiento basado en reglas y planificación multi-paso dentro del dominio sintético.
- Generalización a variaciones fuera de distribución (OOD) en plantilla, composición y reglas, con mejoras significativas frente al control directo.
- Evitación de trampas en escenarios adversariales, con una tasa de aprobación de 0.851 frente a 0.651 del control.
- No es un asistente conversacional general; no soporta tool calling, ni visión, ni audio, ni razonamiento en modo thinking.

## Casos de uso

- Investigación en post-entrenamiento: permite comparar recetas de dos etapas frente a ajuste directo en un entorno controlado y verificable, con métricas objetivas de tasa de aprobación.
- Estudio de generalización OOD: sus resultados en suites de plantilla, composición y reglas OOD ofrecen datos empíricos sobre la robustez de los adaptadores LoRA en dominios sintéticos.
- Evaluación de contratos de adaptador: el análisis de `modules_to_save` documenta un fallo de terminación crítico y su solución, útil para otros desarrolladores de LoRA.
- Reproducibilidad de experimentos: al estar pre-registrado y con artefactos completos (código, datos, huellas digitales), sirve como referencia para estudios comparativos de planificación.
- Desarrollo de planificadores verificables: aunque no es un planificador dominado, sus salidas JSON estructuradas pueden integrarse en pipelines de evaluación de agentes en entornos sintéticos.
- Formación en metodología experimental: el protocolo y el tech report (DOI) son un ejemplo de diseño experimental riguroso para la comunidad de IA.

## Benchmarks y rendimiento

La evaluación se realizó sobre suites congeladas de PlayWorld (300 episodios cada una) con decodificación greedy. La tabla muestra la tasa de aprobación media ± desviación estándar sobre las semillas de entrenamiento {42, 43, 44}, comparando este modelo (dos etapas) con el control de ajuste directo (A2v2).

| Suite | Este modelo (dos etapas) | Control directo |
|---|---|---|
| in-distribution | .393 ± .013 | .186 ± .002 |
| template-OOD | .349 ± .005 | .207 ± .003 |
| compositional-OOD | .329 ± .022 | .139 ± .004 |
| rule-OOD | .302 ± .005 | .192 ± .005 |
| adversarial (trap avoidance) | .851 ± .002 | .651 ± .011 |

Todos los 15 deltas suite×semilla fueron positivos, con prueba de permutación pareada p ≤ 0.0004 en cada caso. No se han publicado resultados en benchmarks generales como MMLU o HumanEval, ya que el modelo no está diseñado para tareas generales.

## Requisitos de hardware

- Al ser un adaptador LoRA, requiere cargar el modelo base Qwen3-8B-Base (8.000 millones de parámetros) más el adaptador. El tamaño del repositorio del adaptador es de 2.7 GB, pero el modelo base ocupa aproximadamente 16 GB en BF16.
- VRAM estimada: al menos 16 GB para inferencia en BF16 con el modelo base completo. Con cuantización del modelo base (por ejemplo, GGUF de 4 bits), podría reducirse a unos 6-8 GB, pero no hay datos específicos para este adaptador.
- GPU recomendadas: NVIDIA A100, H100, RTX 4090 (24 GB) o similar para BF16 sin cuantizar. En GPUs de 8-12 GB se requeriría cuantización del modelo base.
- Opciones de despliegue: el adaptador se carga con `peft` y `transformers`; para inferencia en producción se podría usar vLLM o TGI con soporte LoRA, aunque no se ha verificado. Para entornos edge, llama.cpp u Ollama podrían funcionar si se fusiona el adaptador con el modelo base cuantizado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No hay modelos públicos directamente comparables, ya que este es un artefacto de investigación específico para PlayWorld. La comparación más relevante es con el control de ajuste directo (A2v2) descrito en la model card, cuyos resultados se muestran en la tabla de benchmarks. Frente al modelo base sin adaptar, no se han publicado métricas comparativas. En términos de arquitectura, cualquier adaptador LoRA sobre Qwen3-8B podría considerarse similar, pero sin datos de evaluación en el mismo entorno no es posible una comparación rigurosa.

## Limitaciones y advertencias

- Artefacto de investigación: no es un asistente de propósito general ni un planificador dominado; las tasas de aprobación absolutas en suites de construcción son de 0.30–0.39.
- Dominio sintético: PlayWorld es un mundo de juguete; la transferencia a tareas de agentes reales no está probada.
- Idioma: solo inglés; no hay soporte multilingüe.
- Salidas restringidas: genera planes JSON estructurados para episodios de PlayWorld, no texto libre conversacional.
- Riesgo de alucinación: no evaluado fuera del dominio; en tareas generales podría producir salidas incorrectas.
- Licencia MIT: permite uso comercial, pero al ser un artefacto de investigación, no se garantiza su idoneidad para producción.
- Dependencia del modelo base: requiere la revisión exacta `49e3418fbbbca6ecbdf9608b4d22e5a407081db4` de Qwen3-8B-Base; otras revisiones pueden no ser compatibles.

## Enlaces

- HuggingFace: https://huggingface.co/m97j/aw-qwen3-8b-v1
- Repositorio de código y protocolo: https://github.com/m97j/axiom-world (tag `v1.0.0`)
- Tech report: https://doi.org/10.5281/zenodo.22052149
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
