# reaperdoesntknow/TopologicalQwen

## Resumen

TopologicalQwen es un modelo de lenguaje de 2.031.739.904 parámetros (1.7B efectivos) desarrollado por reaperdoesntknow (Convergent Intelligence LLC, Research Division) mediante una técnica propietaria denominada Topological Knowledge Distillation (TKD). El modelo se obtiene destilando Qwen3-30B-A3B-Thinking-2507 sobre un estudiante Qwen3 de 1.7B previamente refinado (Disctil-Qwen3-1.7B), con el objetivo de transferir capacidad de razonamiento matemático y físico a un tamaño apto para edge computing.

La propuesta diferencial es metodológica: TKD descompone la distribución del profesor en tres componentes (suave/AC, saltos/D^j f y deriva/D^c f) en lugar de aplicar únicamente divergencia KL estándar. El modelo se entrena además con el formato DualMind, que estructura cada respuesta en bloques `<explore>`, `<examine>` y `<response>` para forzar un bucle cognitivo de derivación, autocrítica y síntesis.

Es relevante ahora porque propone una alternativa a la carrera por el escalado: mantener 1.7B parámetros con 40.960 tokens de contexto y un rendimiento de razonamiento procedente de un profesor MoE de 30B. La licencia Apache 2.0 y el formato safetensors facilitan su integración en pipelines existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer decoder-only con GQA) |
| Parametros totales | 2.031.739.904 (~2.03B; 1.7B efectivos) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantizacion | no disponible (entrenamiento FP32, inferencia BF16/FP16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Otros datos técnicos declarados: hidden size 2048, 28 capas, 16 cabezas de atención Q y 8 KV (GQA), intermediate size 6144, vocabulario de 151.936 tokens. Tamaño del repositorio: 4.1 GB.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de la familia Qwen3, con atención de consultas agrupadas (GQA) y 28 capas. El estudiante parte de Disctil-Qwen3-1.7B (una variante "uncensored" refinada con el operador DISC) y se destila desde Qwen3-30B-A3B-Thinking-2507. El corpus de entrenamiento son aproximadamente 1.599 muestras de chain-of-thought de física: ecuaciones diferenciales (636), mecánica teórica (307), electromagnetismo (580) y relatividad general (76), reestructuradas en formato DualMind.

El pipeline TKD consta de cuatro fases: (1) cacheado de logits del profesor con compresión top-64 en una sola pasada; (2) pasada topológica DISC con detección de saltos a umbral 3σ y amplificación 1.25×, y cálculo de densidad de energía de hueco en ventanas de 64 tokens; (3) ventaneado adaptativo guiado por topología con ventanas de 512 tokens cortadas en posiciones de baja discrepancia (solape 32–128); y (4) KD continuo con currículo de 4 fases (30% más fácil primero), pérdida ponderada por prueba (2.25× → 1.1×), α de KD que sube de 0 a 0.45 entre el 15% y el 45% del entrenamiento, KL a T=2.0, batch efectivo 32, LR coseno 5e-6 → 5e-7, warmup 30 pasos, weight decay 1e-3, gradient clip 1.0 y precisión BF16 con autocast.

La innovación técnica declarada es el tratamiento de la distribución del profesor como función de variación acotada, con correcciones explícitas en discontinuidades conceptuales (cambios de tema, registro o modo de razonamiento) que la KD estándar difumina. No se documentan fases de RLHF ni DPO.

## Capacidades

- Generación de texto conversacional y razonamiento paso a paso en dominios científico-técnicos.
- Razonamiento matemático y físico: el entrenamiento se centra en demostraciones, derivaciones y verificación de resultados.
- Modo DualMind con tres bloques encadenados: `<explore>` (derivación libre), `<examine>` (autocrítica adversarial) y `<response>` (respuesta final sintetizada).
- Autocrítica estructurada: el bloque `<examine>` actúa como revisor interno del propio razonamiento.
- Contexto largo de 40.960 tokens, adecuado para cadenas de derivación extensas y documentos técnicos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita; el bucle explore-examine-response puede orquestarse externamente como pipeline multi-etapa.
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponibles.
- Compatible con text-generation-inference y endpoints_compatible según los tags del repositorio.

## Casos de uso

- Tutoría de física y matemáticas a nivel universitario: el modelo genera derivaciones completas en `<explore>`, las revisa en `<examine>` y entrega una respuesta limpia en `<response>`, lo que permite mostrar al estudiante tanto el proceso como la verificación. El contexto de 40.960 tokens admite problemas con enunciados largos y múltiples apartados.
- Generación de material docente con trazabilidad: para asignaturas de ecuaciones diferenciales, mecánica teórica o electromagnetismo, el bloque `<examine>` sirve como control de calidad interno antes de publicar el resultado del bloque `<response>`.
- Asistente de resolución de problemas en entornos con recursos limitados: con ~2.03B parámetros y pesos en safetensors de 4.1 GB, puede desplegarse en estaciones de trabajo sin GPU de datacenter, lo que encaja en laboratorios docentes o portátiles de investigación.
- Preprocesado y verificación de demostraciones en pipelines de publicación científica: el modelo puede generar una derivación y una crítica separadas que un revisor humano evalúe por separado, reduciendo el coste de revisión.
- Generación de cadenas de razonamiento sintéticas para aumentar datasets: el formato DualMind produce pares (derivación, crítica) reutilizables como datos de entrenamiento para otros modelos o para evaluación de razonadores.
- Prototipado de asistentes conversacionales técnicos en producción: la licencia Apache 2.0 y el soporte de text-generation-inference permiten integrarlo en servicios internos sin restricciones de uso comercial.
- Investigación en destilación de conocimiento: el modelo sirve como referencia reproducible para comparar TKD frente a KD estándar en tareas de razonamiento científico con presupuesto de parámetros fijo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16/FP16, aproximadamente 4.1 GB solo para pesos, más overhead de activaciones y caché KV; en FP32, unos 8.1 GB. La cuantización a 8 bits o 4 bits reduciría el requisito por debajo de 2–3 GB, aunque el autor no documenta variantes GGUF ni cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para BF16 con contexto moderado; A100, H100 o L40S para despliegues con contexto cercano a 40.960 tokens y concurrencia.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090, siempre que se limite la longitud de contexto o se cuantice.
- Opciones de despliegue: transformers (referencia del autor), text-generation-inference (tag `text-generation-inference`), endpoints compatibles. No se documenta soporte de vLLM, llama.cpp ni Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| TopologicalQwen | ~2.03B | 40.960 | Apache 2.0 | Destilado TKD desde Qwen3-30B-A3B-Thinking; formato DualMind |
| Qwen3-1.7B (base) | ~1.7B | no disponible en esta ficha | Apache 2.0 | Modelo original de la familia Qwen3; sin destilación ni DualMind |
| Disctil-Qwen3-1.7B | ~1.7B | no disponible en esta ficha | no disponible | Estudiante intermedio del linaje, refinado con DISC |
| Qwen3-30B-A3B-Thinking-2507 | 30B totales (MoE) | no disponible en esta ficha | no disponible | Profesor; requiere hardware muy superior |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes.

## Limitaciones y advertencias

- El corpus de entrenamiento es muy reducido (~1.599 muestras) y está restringido a cuatro áreas de física; es esperable un rendimiento degradado fuera de ese dominio.
- El modelo parte de una variante "uncensored" (Disctil-Qwen3-1.7B), lo que puede reducir los filtros de seguridad heredados y aumentar el riesgo de respuestas inapropiadas en dominios sensibles.
- Riesgo de alucinación en derivaciones matemáticas: el bloque `<explore>` se genera libremente y puede contener pasos incorrectos que el bloque `<examine>` no detecte; la verificación humana sigue siendo necesaria.
- El formato DualMind exige que el prompt abra el bloque `<explore>`; sin esa estructura el modelo puede producir salidas fuera del esquema esperado.
- Idiomas soportados no documentados; no hay garantía de calidad fuera del inglés, que es el idioma de los ejemplos de la model card.
- No se han publicado evaluaciones de benchmarks, sesgos ni pruebas de seguridad.
- La licencia Apache 2.0 permite uso comercial, pero el linaje incluye un modelo "uncensored" cuyo origen y condiciones conviene auditar antes de desplegar en producción.
- El modelo tiene 2.031.739.904 parámetros reales frente a los 1.7B nominales; los presupuestos de memoria deben calcularse sobre el valor real.
- No se documentan variantes cuantizadas oficiales, lo que limita el despliegue en hardware de muy bajos recursos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/TopologicalQwen
- Modelo base inmediato: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT
- Estudiante intermedio: https://huggingface.co/reaperdoesntknow/Disctil-Qwen3-1.7B
- Metodología (DOI): https://doi.org/10.57967/hf/8165
- Repositorio del autor: https://huggingface.co/reaperdoesntknow
