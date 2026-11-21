# kstoyanov99/PortfolioFinQwen-27B-BF16

## Resumen

PortfolioFinQwen-27B es un ajuste fino supervisado del modelo Qwen3.8-27B (familia de arquitectura `qwen3_5`) desarrollado por kstoyanov99, orientado a razonamiento financiero, mecánica de opciones y gestión de carteras. El modelo parte del checkpoint base de Qwen y se adapta con ejemplos supervisados de decisiones financieras y correcciones mecánicas, con el objetivo de soportar flujos de investigación de inversión que conecten ingresos por opciones con asignación de capital a largo plazo.

El modelo cuenta con 27.356.728.560 parámetros (aproximadamente 27,4 mil millones) y se distribuye en formato BF16 como checkpoint completo fusionado, con un peso de repositorio de 54,7 GB. La adaptación se centra en texto: aunque hereda los componentes de procesador y visión del modelo base, el autor no reclama ninguna capacidad multimodal nueva.

Es relevante ahora porque aborda un nicho específico —la interpretación de posiciones firmadas, la reconciliación de flujos de caja y exposiciones, y el razonamiento sobre estructuras de opciones conectadas— que los modelos generalistas no cubren con precisión mecánica. Se distribuye bajo licencia Apache 2.0 y está pensado como modelo de investigación experimental, no como sistema de ejecución de operaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5` (transformer, familia Qwen3.8) |
| Parametros totales | 27.356.728.560 (~27,4 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (configuración de ejemplo en SGLang; no confirmado como máximo oficial) |
| Tipos de cuantizacion | BF16 (este repo); NVFP4 (repo hermano) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint Qwen/Qwen3.8-27B, cuya familia de arquitectura se identifica como `qwen3_5`. Se trata de un transformer denso de aproximadamente 27,4 mil millones de parámetros. El autor conserva los componentes de procesador y visión heredados del modelo base, pero la adaptación y las evaluaciones descritas se refieren exclusivamente a texto, sin que se reclame capacidad multimodal nueva.

El entrenamiento consistió en adaptación supervisada con ejemplos de decisiones financieras y correcciones mecánicas. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. El autor indica explícitamente que no se distribuyen conjuntos de datos de entrenamiento, estados de optimizador ni trazas de agentes. La plantilla de chat incluida acepta los valores `reasoning_effort="low"`, `"medium"` y `"xhigh"` (por defecto), rechaza `"high"` y permite `enable_thinking=False` para comportamiento sin razonamiento; se trata de controles basados en instrucciones, no de presupuestos fijos de tokens de pensamiento.

## Capacidades

- Generación de texto y razonamiento financiero orientado a decisiones de cartera.
- Interpretación de posiciones firmadas (signed positions) y reconciliación de flujos de caja y exposiciones.
- Razonamiento sobre mecánica de opciones y estructuras de opciones conectadas.
- Identificación de supuestos faltantes o fuentes ausentes que cambian una decisión.
- Modo de razonamiento configurable mediante `reasoning_effort` (low, medium, xhigh) y modo sin razonamiento (`enable_thinking=False`).
- Soporte de tool calling / function calling (parser `qwen3_coder` en la configuración de SGLang de ejemplo).
- Capacidades multilingües: limitadas a inglés (`en`).
- Capacidad de visión: componentes heredados del modelo base, sin capacidad multimodal nueva reclamada.

## Casos de uso

- Investigación de carteras con opciones: el modelo interpreta posiciones firmadas y reconcilia exposiciones, adecuado para analistas que necesitan coherencia mecánica entre ingresos por opciones y asignación de capital.
- Auditoría de flujos de caja: permite detectar inconsistencias entre cantidades firmadas, fechas de origen y unidades, gracias a su adaptación sobre correcciones mecánicas.
- Análisis de estructuras de opciones conectadas: razona sobre la relación entre patas de una estrategia y el efecto de supuestos cambiantes en la decisión final.
- Verificación de supuestos en informes: identifica cuándo una fuente ausente o un supuesto no declarado altera una conclusión, útil en revisión de tesis de inversión.
- Respuesta a preguntas sobre estados financieros: con resultados medidos en FinQA y TAT-QA, puede emplearse en tareas de QA financiero sobre documentos, aunque con rendimiento mixto frente al base.
- Integración en runtime multiagente: el autor publica un runtime complementario que añade herramientas, perspectivas independientes y registros de evidencia; el modelo sirve como motor de razonamiento dentro de ese flujo.
- Asistencia en documentación de decisiones: con modo de razonamiento activado, genera trazas de razonamiento útiles para documentar por qué se acepta o rechaza una operación bajo un rubric dado.

## Benchmarks y rendimiento

Los resultados publicados corresponden a la exportación NVFP4 del mismo checkpoint, no a esta exportación BF16, que no fue puntuada independientemente en estas comparativas.

Evaluación de desarrollo en mecánica de carteras (160 peticiones congeladas, 11 clústeres):

| Metrica | Qwen3.8-27B NVFP4 | PortfolioFinQwen-27B NVFP4 |
|---|---:|---:|
| Crédito parcial semántico | 76,99% | 81,31% |
| Aprobaciones estrictas | 88 / 160 | 96 / 160 |
| Decisiones correctas | 137 / 160 | 147 / 160 |
| Campos numéricos correctos | 414 / 560 | 438 / 560 |
| Aprobaciones inseguras bajo el rubric | 9 | 4 |

Evaluación pública de QA financiero (250 FinQA y 250 TAT-QA):

| Metrica | Qwen3.8-27B NVFP4 | PortfolioFinQwen-27B NVFP4 |
|---|---:|---:|
| FinQA correctas | 141 / 250 (56,4%) | 132 / 250 (52,8%) |
| FinQA incorrectas / no puntuadas | 51 / 58 | 58 / 60 |
| TAT-QA respuestas exactas | 190 / 250 (76,0%) | 193 / 250 (77,2%) |
| TAT-QA F1 | 0,85644 | 0,85236 |
| TAT-QA incorrectas / no puntuadas | 58 / 2 | 53 / 4 |
| Errores/timeouts en 500 peticiones | 0 | 7 |

En una suite de decisión separada, la exportación NVFP4 adaptada obtuvo 45/45 aprobaciones estrictas básicas y 44/45 difíciles con razonamiento activado. Un protocolo de estrés heredado sin razonamiento solo alcanzó 2/30 aprobaciones estrictas (43,33% de crédito parcial).

## Requisitos de hardware

- VRAM estimada para BF16: aproximadamente 54,7 GB de pesos, más overhead de activaciones y KV cache; se recomienda un servidor con al menos 80 GB de VRAM para contexto largo.
- VRAM estimada para NVFP4: aproximadamente 19,8 GB de pesos, apto para GPUs con 24 GB o más.
- GPUs recomendadas: A100 80 GB, H100 para BF16 con contexto completo; RTX 4090 (24 GB) viable para NVFP4, no para BF16 completo.
- Cabe en GPU de consumo: solo la variante NVFP4 en GPUs de 24 GB; BF16 no cabe en consumer GPU de una sola tarjeta.
- Opciones de despliegue: SGLang (comando de ejemplo con `--reasoning-parser qwen3` y `--tool-call-parser qwen3_coder`), transformers; NVFP4 requiere runtime compatible con ModelOpt NVFP4 y hardware NVIDIA soportado.
- Latencia y throughput: no disponibles; el autor indica que las condiciones de hardware y runtime difieren entre ejecuciones y que no es un benchmark controlado de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| PortfolioFinQwen-27B | ~27,4 B | 32.768 (config. ejemplo) | apache-2.0 | Finanzas y carteras | HF (BF16 y NVFP4) |
| Qwen3.8-27B (base) | ~27,4 B | no disponible | no disponible | Generalista | HF |
| Modelos financieros de 7-13 B | 7-13 B | variable | variable | Finanzas | HF |

La comparativa directa con alternativas financieras de tamaño similar no está disponible en la información proporcionada. El único contraste cuantificado es frente al modelo base Qwen3.8-27B, con resultados mixtos: mejora en mecánica de carteras y TAT-QA exactas, empeora en FinQA y TAT-QA F1.

## Limitaciones y advertencias

- Modelo de investigación experimental: no ejecuta operaciones, no proporciona datos de mercado en vivo ni establece capacidad de margen de bróker.
- Los resultados de benchmarks corresponden a la exportación NVFP4; no deben asumirse idénticos para esta exportación BF16.
- Los resultados de desarrollo en mecánica de carteras provienen de una familia de tareas que informó la adaptación y selección; no son un benchmark de generalización intacto.
- FinQA usa puntuación adaptada de respuesta final, no precisión oficial de ejecución de programas.
- Rendimiento mixto en QA público: FinQA cae de 56,4% a 52,8% y TAT-QA F1 baja de 0,85644 a 0,85236 frente al base.
- El modo sin razonamiento (`enable_thinking=False`) mostró solo 2/30 aprobaciones estrictas en el protocolo de estrés; validar ese modo por separado antes de usarlo en producción.
- Solo soporta inglés; no se declaran capacidades multilingües.
- El verificador de hechos del runtime es falible y no hace seguro ejecutar un informe; se requiere verificación independiente de cifras que dirijan acciones.
- Riesgo de alucinación no cuantificado en la información disponible; tratándose de un modelo financiero, cualquier cifra debe validarse contra fuentes primarias.
- Sesgos conocidos: no disponibles en la información proporcionada.

## Enlaces

- Modelo en Hugging Face (BF16): https://huggingface.co/kstoyanov99/PortfolioFinQwen-27B-BF16
- Modelo en Hugging Face (NVFP4): https://huggingface.co/kstoyanov99/PortfolioFinQwen-27B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Runtime multiagente complementario: https://github.com/krisitown/multiagent-portfolio-management
