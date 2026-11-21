# kstoyanov99/PortfolioFinQwen-27B-NVFP4

## Resumen

PortfolioFinQwen-27B-NVFP4 es una adaptación del modelo Qwen3.8-27B orientada al razonamiento financiero, la mecánica de opciones y la investigación de carteras con trazabilidad de evidencia. Lo desarrolla el usuario kstoyanov99 y se distribuye en formato cuantizado NVFP4 (4 bits de NVIDIA, generado con ModelOpt 0.47.0) sobre una arquitectura de la familia `qwen3_5` con componentes de visión heredados del modelo base. El checkpoint contiene 15.193.246.960 parámetros reales según safetensors y ocupa 19,8 GB en el repositorio.

El problema que aborda es concreto: conectar estrategias de generación de ingresos mediante opciones con la asignación de capital a largo plazo, interpretar posiciones con signo, reconciliar flujos de caja y exposiciones, y detectar cuándo una suposición o una fuente ausente cambia una decisión de inversión. Para ello se ajustó con ejemplos supervisados de decisiones financieras y correcciones mecánicas, partiendo del modelo base y exportando tanto un checkpoint BF16 completo (unos 54,7 GB) como esta versión NVFP4.

Es relevante ahora porque demuestra un patrón habitual en el ecosistema abierto: adaptaciones de dominio sobre modelos grandes, empaquetadas en cuantizaciones de 4 bits para hardware NVIDIA moderno (DGX Spark en las pruebas del autor), con evaluación honesta que incluye resultados mixtos frente al modelo original. No es un modelo de propósito general ni sustituye a un asesor financiero: es un modelo de investigación experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia `qwen3_5` (identificador compartido con Qwen3.8), con componentes de procesador y visión heredados del modelo base |
| Parametros totales | 15.193.246.960 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens en el comando de despliegue de referencia; el autor menciona que contexto más largo requiere configuración adicional |
| Tipos de cuantizacion | NVFP4 (4 bits, ModelOpt 0.47.0, group size 16, con algunas módulos en mayor precisión); existe también un export BF16 completo |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, con configuración de cuantización ModelOpt (`config.json`, `hf_quant_config.json`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer de la familia `qwen3_5` que conserva el procesador y los componentes de visión del release base, aunque la adaptación y las evaluaciones publicadas se centran exclusivamente en texto y no se reclama ninguna capacidad multimodal nueva. El ajuste se realizó con ejemplos supervisados de decisiones financieras y correcciones mecánicas, orientados a interpretar posiciones con signo, reconciliar flujos de caja y exposiciones, razonar sobre estructuras de opciones conectadas y señalar cuándo una suposición o una fuente faltante altera una decisión.

La innovación técnica principal está en el empaquetado: el export NVFP4 se generó con NVIDIA ModelOpt 0.47.0 con group size 16, dejando algunos módulos en mayor precisión, y se sirvió en pruebas con SGLang 0.5.22, PyTorch 2.14.1+cu130 y Transformers 5.19.0 sobre una NVIDIA DGX Spark. La plantilla de chat incluida acepta `reasoning_effort` con valores `"low"`, `"medium"` y `"xhigh"` (por defecto), rechaza `"high"` y permite `enable_thinking=False` para modo sin razonamiento; son controles basados en instrucciones, no presupuestos fijos de tokens de pensamiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento financiero: interpretación de posiciones con signo, estructuras de opciones conectadas y mecánica de opciones.
- Reconciliación de flujos de caja y exposiciones en contextos de cartera.
- Razonamiento con detección de supuestos: identifica cuándo una suposición o una fuente ausente cambia una decisión.
- Modo de razonamiento configurable mediante `reasoning_effort` (`low`, `medium`, `xhigh`) y modo sin pensamiento con `enable_thinking=False`.
- Soporte de tool calling: el comando de despliegue incluye `--tool-call-parser qwen3_coder`, lo que indica compatibilidad con llamadas a herramientas en SGLang.
- Soporte de agentes multi-paso a través del runtime complementario del autor (multi-agent portfolio management), que añade herramientas, perspectivas independientes y registros de evidencia; esas herramientas y prompts son separados de los pesos.
- Capacidades multilingües: limitadas al inglés según los metadatos del modelo.
- Componentes de visión y procesador heredados del modelo base, sin capacidad multimodal nueva reclamada.

## Casos de uso

- Investigación de carteras con opciones: el modelo interpreta posiciones con signo y estructuras de opciones conectadas, y reconcilia flujos de caja, lo que permite generar informes de exposición coherentes a partir de descripciones textuales de la cartera.
- Corrección mecánica de cálculos financieros: dado que se entrenó con correcciones mecánicas supervisadas, puede usarse para revisar y señalar errores en el tratamiento de primas, vencimientos y asignaciones dentro de un pipeline de validación.
- Análisis de evidencia y supuestos: en flujos de research, el modelo identifica qué fuente falta o qué supuesto invalida una decisión, útil para documentar tesis de inversión con trazabilidad.
- Asistente de razonamiento en preguntas sobre informes financieros: con 32.768 tokens de contexto puede procesar fragmentos de estados financieros y responder preguntas de tipo FinQA/TAT-QA, aunque con rendimiento mixto frente al base.
- Integración en un runtime multi-agente: combinado con el repositorio de gestión de carteras del autor, puede actuar como uno de los agentes que aportan perspectivas y registros de evidencia en un sistema de investigación.
- Despliegue en hardware NVIDIA de gama workstation: al ocupar 19,8 GB en NVFP4, cabe en una DGX Spark o en GPUs con 24 GB o más, lo que permite prototipar investigación financiera en local sin clúster.
- Evaluación comparativa de adaptaciones de dominio: sirve como referencia para medir cuánto mejora una adaptación financiera sobre el modelo base en tareas de mecánica de cartera (81,31 % frente a 76,99 % de crédito parcial semántico en la evaluación del autor).

## Benchmarks y rendimiento

Evaluación de desarrollo de mecánica de cartera (160 peticiones congeladas, agrupadas en 11 clústeres, servidas ambas en NVFP4 con prompts y decodificación emparejados):

| Metrica | Qwen3.8-27B NVFP4 original | PortfolioFinQwen-27B NVFP4 |
|---|---:|---:|
| Credito parcial semantico | 76,99% | 81,31% |
| Passes estrictos | 88 / 160 | 96 / 160 |
| Decisiones correctas | 137 / 160 | 147 / 160 |
| Campos numericos correctos | 414 / 560 | 438 / 560 |
| Aprobaciones inseguras bajo el rubric | 9 | 4 |

Preguntas y respuestas financieras publicas (250 FinQA y 250 TAT-QA, misma seleccion congelada y mismos scorers):

| Metrica | Qwen3.8-27B NVFP4 original | PortfolioFinQwen-27B NVFP4 |
|---|---:|---:|
| FinQA correctas | 141 / 250 (56,4%) | 132 / 250 (52,8%) |
| FinQA incorrectas / no puntuadas | 51 / 58 | 58 / 60 |
| TAT-QA respuestas exactas | 190 / 250 (76,0%) | 193 / 250 (77,2%) |
| TAT-QA F1 | 0,85644 | 0,85236 |
| TAT-QA incorrectas / no puntuadas | 58 / 2 | 53 / 4 |
| Errores o timeouts en las 500 peticiones | 0 | 7 |

Suite de decisión separada: 45/45 passes estrictos básicos y 44/45 difíciles con pensamiento activado. Un protocolo de estrés heredado sin pensamiento obtuvo solo 2/30 passes estrictos (43,33 % de crédito parcial). El autor advierte que los resultados FinQA usan puntuación de respuesta final adaptada, no precisión oficial de ejecución de programas, y que las condiciones de hardware y runtime difieren entre las ejecuciones de referencia, por lo que no es un benchmark controlado de velocidad.

## Requisitos de hardware

- VRAM estimada: unos 19,8 GB para los pesos NVFP4; el runtime y el contexto de 32.768 tokens añaden overhead, por lo que se recomienda al menos 24 GB de VRAM.
- GPU recomendadas: NVIDIA DGX Spark (entorno medido por el autor), así como GPUs NVIDIA compatibles con NVFP4 y ModelOpt; no se especifican modelos concretos adicionales.
- Cabe en GPU consumer: sí, en tarjetas NVIDIA con 24 GB o más que soporten el formato NVFP4, aunque el autor no garantiza combinaciones arbitrarias de wheels.
- Opciones de despliegue: SGLang 0.5.22 con soporte ModelOpt compatible, PyTorch 2.14.1+cu130 y Transformers 5.19.0; el autor indica que el soporte ModelOpt del servidor debe coincidir con el formato exportado. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponible; el autor señala explícitamente que no es un benchmark de rendimiento o velocidad controlado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PortfolioFinQwen-27B-NVFP4 | 15,19 B (reales en safetensors) | 32.768 tokens en despliegue de referencia | Finanzas, carteras y opciones, en inglés | apache-2.0 | Hugging Face, pesos NVFP4 y BF16 |
| Qwen3.8-27B (base) | no disponible en la informacion | no disponible en la informacion | Propósito general | no disponible en la informacion | Hugging Face (Qwen/Qwen3.8-27B) |
| Qwen3.8-27B NVFP4 (base cuantizado) | no disponible en la informacion | no disponible en la informacion | Propósito general, cuantizado | no disponible en la informacion | Referenciado en la evaluación del autor |

No se dispone de datos de otros modelos financieros comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación experimental: no ejecuta operaciones, no proporciona datos de mercado en vivo ni establece capacidad de margen con brókeres.
- Los resultados de evaluación son de desarrollo: los mecanismos de fallo de esa familia de tareas informaron la adaptación y la selección, por lo que no constituyen un benchmark de generalización intacto ni una garantía de decisiones de inversión fiables.
- Rendimiento mixto en QA financiero público: FinQA baja de 56,4 % a 52,8 % en respuestas correctas y TAT-QA F1 baja ligeramente (0,85644 a 0,85236) frente al modelo base.
- El modo sin pensamiento (`enable_thinking=False`) obtuvo solo 2/30 passes estrictos en el protocolo de estrés heredado; los resultados con pensamiento activado no deben transferirse a ese modo.
- Riesgo de alucinación inherente a modelos de lenguaje en dominios financieros; el autor recomienda validar supuestos y fuentes de forma independiente.
- Idiomas: solo inglés según los metadatos, lo que limita su uso en castellano sin evaluación adicional.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el autor no ofrece garantías y el modelo no está diseñado para asesoramiento financiero regulado.
- Dependencia de hardware y runtime específicos: el formato NVFP4 requiere soporte ModelOpt compatible; combinaciones arbitrarias de wheels pueden no funcionar.
- Componentes de visión heredados sin capacidad multimodal nueva reclamada; no debe asumirse comportamiento multimodal fiable.
- No se distribuyen datasets, trazas de agentes, estados de optimizador ni credenciales; el runtime multi-agente y sus prompts son separados de los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kstoyanov99/PortfolioFinQwen-27B-NVFP4
- Versión BF16: https://huggingface.co/kstoyanov99/PortfolioFinQwen-27B-BF16
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Runtime multi-agente de gestión de carteras: https://github.com/krisitown/multiagent-portfolio-management
