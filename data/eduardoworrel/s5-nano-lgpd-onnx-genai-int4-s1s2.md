# eduardoworrel/S5-nano-LGPD-ONNX-genai-int4-S1S2

## Resumen

S5-nano-LGPD-ONNX-genai-int4-S1S2 es una compilación cuantizada a int4 y exportada a ONNX Runtime GenAI del modelo maritaca-ai/S5-nano, especializada en clasificación de requisitos de privacidad de la LGPD brasileña. El modelo recibe un fragmento de texto en portugués y una pregunta de transparencia (por ejemplo, si el pasaje trata sobre compartición de datos con terceros) y devuelve una decisión tipada (Sim/Não) con probabilidad y margen en un único forward pass. Lo desarrolla el usuario eduardoworrel sobre el modelo base de Maritaca AI y se publica bajo licencia CC BY 4.0.

La relevancia de esta ficha radica en su planteamiento de doble sistema: una cabeza de decisión ("System 1") resuelve la consulta en una sola pasada, y solo cuando el margen es bajo se escala a generación autoregresiva ("System 2") reutilizando el mismo prefill. El build está pensado para ejecutarse en navegador mediante WebGPU a través de la librería s1s2, con un tamaño de descarga de 2,44 GB. La arquitectura subyacente del modelo base incluye capas GatedDeltaNet, lo que condiciona el despliegue: no existe kernel de CPU para esas capas y el runtime es exclusivamente WebGPU.

El modelo no evalúa cumplimiento normativo ni emite asesoramiento legal: determina únicamente si un pasaje aborda un requisito concreto. Se entrenó solo con políticas brasileñas (LGPD), aunque muestra transferencia zero-shot a GDPR y CCPA en inglés. El repo ocupa 2,5 GB y acumula 236 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer del modelo base S5-nano con capas GatedDeltaNet; exportado a grafo ONNX Runtime GenAI 0.19 con cabeza de decisión (pointer head) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (build publicado); el modelo base y el adaptador LoRA existen en bf16 y fp32 |
| Idiomas soportados | pt (portugués), en (inglés, solo transferencia zero-shot) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (onnxruntime-genai), manifiesto `manifest.pt.json`; adaptador PyTorch disponible en el repo LoRA asociado |

## Arquitectura y entrenamiento

El modelo parte de maritaca-ai/S5-nano (Apache-2.0) y añade una cabeza de decisión de tipo pointer head entrenada para responder preguntas de opción cerrada con las palabras exactas "Sim" y "Não". La inferencia se organiza en dos niveles: System 1 ejecuta un único forward pass que produce una elección tipada junto con probabilidad y margen; System 2, opcional, reutiliza el prefill de esa misma pasada para generar texto justificativo cuando la confianza es baja. La compilación publicada usa el grafo int4 de onnxruntime-genai 0.19 para WebGPU.

El entrenamiento se realizó exclusivamente sobre políticas brasileñas de privacidad: el corpus Claudinha (Tocchini et al., Zenodo 13371639, CC BY 4.0) y datos sintéticos Kev (legacy_policy y compositional, generados con código Apache-2.0). La receta de entrenamiento y la cabeza provienen de Kev (Apache-2.0), y la idea de separación System 1 / System 2 con compuerta por margen se atribuye a CT0 de Alias Robotics. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo RLHF o DPO. Existe una variante `lgpd_only_k` (2 épocas, merge en fp32) que no fue evaluada en el conjunto de test retenido, por lo que la model card reporta resultados de `lgpd_only`.

## Capacidades

- Clasificación binaria de requisitos de privacidad: responde Sim/Não a preguntas de transparencia sobre un pasaje en portugués, con probabilidad y margen por respuesta.
- Decisión tipada en un solo forward pass (System 1), sin generación autoregresiva.
- Escalado condicional a generación (System 2) cuando el margen cae por debajo de un umbral calibrado sobre datos propios etiquetados.
- Generación de texto justificativo a partir del mismo prefill, con control de `maxNewTokens`.
- Soporte de múltiples preguntas por invocación mediante el array `questions`.
- Transferencia zero-shot a marcos normativos en inglés (GDPR y CCPA) pese a no haber sido entrenado con ellos.
- Ejecución en navegador vía WebGPU con la librería `@s1s2/web`.
- No dispone de tool calling, function calling, visión, audio ni modo de razonamiento extendido según la información disponible.

## Casos de uso

- Auditoría de políticas de privacidad en portugués: dado un fragmento de una política y una pregunta de transparencia, el modelo devuelve Sim/Não con probabilidad y margen, lo que permite priorizar revisiones humanas sobre los casos de baja confianza.
- Herramienta de cumplimiento LGPD en el navegador: al ejecutarse con WebGPU y sin backend servidor, permite procesar textos sensibles en el propio dispositivo del usuario, reduciendo la exposición de datos.
- Triaje previo a revisión legal: el escalado a System 2 solo en respuestas de margen bajo permite generar justificaciones únicamente donde aportan valor, ahorrando cómputo frente a generar texto para todas las consultas.
- Evaluación de proveedores y contratos: comprobar si un documento aborda requisitos concretos como compartición con terceros, base legal o derechos del titular, usando el par de etiquetas exacto con el que se entrenó la cabeza.
- Investigación sobre marcos normativos comparados: la transferencia zero-shot a GDPR y CCPA permite explorar el comportamiento del modelo sobre textos en inglés sin reentrenamiento, siempre con validación adicional.
- Docencia y prototipado de sistemas duales: el par System 1 / System 2 con compuerta por cuantil (`thresholdFromQuantile`) sirve como referencia reproducible para experimentar con decisiones tipadas y escalado condicional.
- Filtrado en pipelines de datos: clasificar lotes de pasajes según si tratan un requisito antes de un análisis más costoso, usando la probabilidad y el margen como señal de ordenación.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre conjunto de test retenido, con precisión balanceada de la pointer head y pesos bf16 de la variante `lgpd_only`:

| Conjunto de test | Precisión balanceada (%) |
|---|---|
| LGPD (portugués), n = 802 | 81,2 |
| GDPR (inglés, transferencia zero-shot), n = 558 | 83,3 |
| CCPA (inglés, transferencia zero-shot), n = 420 | 81,0 |

Registros de fidelidad: sobre n = 1.112 preguntas de desarrollo de los dos conjuntos publicados (GDPR y LGPD), comparando el build int4 en Chrome con WebGPU (Apple M2 Pro) frente al modelo PyTorch bf16 en GPU de servidor, la decisión coincide en el 94,2 % de los ítems con lectura de cabeza (intervalo del 95 %: 92,6 a 95,4) y en el 94,7 % con lectura de logits. Son ítems de desarrollo, no de test. La model card indica que este build int4 no tiene todavía medición en navegador propia.

## Requisitos de hardware

- Descarga del build int4: 2,44 GB; el repositorio completo ocupa 2,5 GB.
- VRAM estimada para inferencia: no disponible de forma explícita; el tamaño de descarga de 2,44 GB da una referencia del orden de magnitud de memoria necesaria para los pesos.
- GPU recomendadas: no disponible; la model card solo documenta ejecución en WebGPU (probado en Apple M2 Pro con Chrome).
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el requisito es soporte de WebGPU en el navegador.
- CPU: no soportada, porque no existe kernel de CPU para las capas GatedDeltaNet del grafo.
- Opciones de despliegue: `@s1s2/web` (github.com/eduardoworrel/s1s2) con onnxruntime-genai 0.19 y manifiesto `manifest.pt.json`; el adaptador PyTorch y las cabezas están en eduardoworrel/S5-nano-LGPD-LoRA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| S5-nano-LGPD-ONNX-genai-int4-S1S2 | no disponible | no disponible | Clasificación de requisitos LGPD con cabeza de decisión y System 1/System 2 | CC BY 4.0 | Hugging Face, ONNX int4, WebGPU |
| maritaca-ai/S5-nano (base) | no disponible | no disponible | Modelo generativo de propósito general | Apache-2.0 | Hugging Face |
| eduardoworrel/S5-nano-LGPD-LoRA | no disponible | no disponible | Adaptador LoRA y cabezas en PyTorch para la misma tarea | no disponible | Hugging Face |
| aliasrobotics/alias3-web | no disponible | no disponible | Precursor del enfoque web y de decisión tipada | no disponible | Hugging Face |

Los datos de parámetros, contexto y rendimiento de los modelos comparables no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Solo se entrenó con políticas brasileñas (LGPD); GDPR y CCPA nunca formaron parte del entrenamiento y sus resultados son transferencia zero-shot.
- El modelo indica si un pasaje aborda un requisito, no si una política cumple la normativa; no constituye asesoramiento legal.
- La cabeza se entrenó exactamente con las palabras "Sim" y "Não"; cualquier otra palabra, incluidas traducciones, altera el prompt y no funciona. Las etiquetas válidas están en `lab.labels` del manifiesto.
- Ejecución exclusivamente en WebGPU: no hay kernel de CPU para las capas GatedDeltaNet del grafo.
- Este build int4 no cuenta con medición de rendimiento en navegador publicada; la fidelidad reportada (94,2 % / 94,7 %) se midió solo sobre ítems de desarrollo.
- Riesgo de alucinación en la fase System 2: el texto justificativo es generación autoregresiva y debe validarse contra el pasaje original.
- Posibles sesgos derivados del corpus Claudinha y de los datos sintéticos Kev; no se documentan análisis de sesgo en la información disponible.
- La licencia CC BY 4.0 permite uso comercial con atribución; deben mantenerse las atribuciones al corpus Claudinha (CC BY 4.0), a los datos Kev y al modelo base (Apache-2.0).
- La variante `lgpd_only_k` no fue evaluada en el conjunto de test retenido, por lo que no debe asumirse su rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eduardoworrel/S5-nano-LGPD-ONNX-genai-int4-S1S2
- Adaptador LoRA y cabezas PyTorch: https://huggingface.co/eduardoworrel/S5-nano-LGPD-LoRA
- Modelo base: https://huggingface.co/maritaca-ai/S5-nano
- Librería s1s2: https://github.com/eduardoworrel/s1s2
- Repositorio Kev: https://github.com/jaredpalmer/kev
- Corpus Claudinha: https://zenodo.org/records/13371639
- Paper Browser Immune System: https://arxiv.org/abs/2611.15302
- Precursor alias3-web: https://huggingface.co/aliasrobotics/alias3-web
