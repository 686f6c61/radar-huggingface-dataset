# evertonsb/lgpd-3b

## Resumen

lgpd-3b es un adaptador LoRA publicado por el usuario evertonsb sobre el modelo base SmolLM3-3B de Hugging Face, orientado a responder preguntas sobre la Ley General de Protección de Datos de Brasil (LGPD), el Estatuto del Niño y del Adolescente en su versión digital (ECA Digital, Lei 15.211/2025) y normativa correlata. Su particularidad es que no funciona como un oráculo jurídico de memoria: está entrenado para leer fragmentos de norma incluidos en el prompt (hasta cinco) y responder exclusivamente a partir de ellos, devolviendo siempre un objeto JSON con la respuesta y citas literales del dispositivo aplicable.

El adaptador se distribuye como pesos PEFT (LoRA r=32, α=64) sobre la revisión `a07cc9a04f16550a088caea529712d1d335b0ac1` de SmolLM3-3B, con un tamaño de repositorio de 0,3 GB. Está pensado como componente de un pipeline RAG (recuperación BM25 o híbrida sobre el texto de las normas) y no como modelo de uso directo sin contexto documental. El entrenamiento se realizó en la plataforma de Synapse AI.

Su relevancia radica en el enfoque de "lector fundamentado" (grounded reader) con contrato de salida estricto y capacidad de recusación: el modelo debe decir que los fragmentos no responden cuando no lo hacen, lo que reduce el riesgo de respuestas inventadas en un dominio regulado. La licencia Apache 2.0 y el tamaño de 3B parámetros lo hacen desplegable en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only SmolLM3-3B |
| Parametros totales | 3B (modelo base) + adaptador LoRA r=32 sobre proyecciones de atención y MLP |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 5.120 tokens (contexto de entrenamiento); contexto nativo del base no disponible en la información |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; cuantización del base no especificada) |
| Idiomas soportados | Portugués (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el base SmolLM3-3B por separado |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (r=32, α=64, dropout 0,05) aplicado sobre todas las proyecciones de atención y MLP del transformer decoder-only SmolLM3-3B. El entrenamiento usó learning rate 2e-4 con scheduler coseno y warmup del 3%, batch efectivo de 4 (batch 1 × acumulación 4), contexto de 5.120 tokens, precisión bfloat16, semilla 42 y 1.408 pasos totales. La validación se midió cada 100 pasos sobre 863 ejemplos y se publicó el checkpoint del paso 1.200 (pérdida de validación 0,1466), al no encontrarse mejoras posteriores de al menos 0,002.

Los datos de entrenamiento proceden de un conjunto de 7.321 ejemplos pregunta-respuesta generados a partir del texto oficial de 26 fuentes (LGPD, ECA Digital, Decreto 12.880/2026, Marco Civil da Internet, resoluciones y guías de la ANPD y Constitución Federal), con particiones fijas de 5.632 entrenamiento, 863 validación y 826 test. Cada ejemplo incluye cinco fragmentos recuperados por búsqueda híbrida y se distribuye en tres tipos: con apoyo en los fragmentos (5.411), sin apoyo (1.436, el modelo debe indicar que los fragmentos no responden) y fuera de alcance (474, recusación). El pipeline de preparación incluyó eliminación de casi duplicados, enmascaramiento de datos personales y curaduría mediante un juez automático (Claude Haiku). No se menciona RLHF ni DPO; el ajuste es supervisado sobre el formato JSON con citas.

## Capacidades

- Generación de respuestas jurídicas fundamentadas exclusivamente en fragmentos de norma proporcionados en el prompt (hasta cinco).
- Salida estructurada en JSON con esquema fijo: `{"resposta": texto, "citacoes": [{"fonte", "dispositivo", "trecho"}]}`.
- Cita literal del dispositivo normativo (artículo, parágrafo o inciso) que sustenta cada respuesta.
- Recusación explícita cuando los fragmentos no sostienen la respuesta o la pregunta queda fuera del ámbito de las normas cubiertas.
- Comprensión de terminología jurídica brasileña en portugués (LGPD, ECA Digital, Marco Civil, resoluciones ANPD).
- Integración como componente de pipelines RAG con recuperación BM25 o híbrida previa.
- Generación determinista recomendada (decodificación greedy, `do_sample=False`, hasta 640 tokens nuevos).

## Casos de uso

- Asistencia a equipos de privacidad y DPO: el modelo responde consultas internas sobre base legal, derechos del titular o plazos de notificación de incidentes citando el artículo exacto de la LGPD, siempre que el pipeline recupere previamente los fragmentos pertinentes.
- Atención al cliente sobre derechos de datos: integrado tras un buscador sobre el texto consolidado de la LGPD, permite responder a titulares qué derechos tienen y cómo ejercerlos, con cita literal verificable y recusación cuando la consulta excede el corpus.
- Cumplimiento de protección de menores en plataformas: responde preguntas sobre obligaciones del ECA Digital y del Decreto 12.880/2026 (verificación de edad, deberes de proveedores) a partir de los fragmentos recuperados, útil para equipos de trust & safety.
- Generación de borradores de respuestas a requerimientos de la ANPD: el formato JSON con citas literales facilita la revisión humana y el trazado de cada afirmación a su dispositivo normativo.
- Formación interna y onboarding legal: como capa conversacional sobre una base documental de 26 fuentes, permite a perfiles no juristas consultar normativa con respuestas acotadas y citadas.
- Auditoría de textos y políticas de privacidad: dado un fragmento de política y los artículos relevantes recuperados, el modelo puede señalar qué dispositivo los sustenta o indicar que los fragmentos no responden, ayudando a detectar afirmaciones sin base normativa.
- Evaluación de sistemas RAG jurídicos: el conjunto de test de 826 casos con corrección automática (JSON válido, dispositivo citado, literalidad de citas, recusación correcta) sirve como referencia para comparar recuperadores y configuraciones.

## Benchmarks y rendimiento

Evaluación sobre 826 casos de test reservados, generación greedy de hasta 640 tokens, corrección automática sin juez LLM (regla `cited_answer_v3_text_checked`):

| Métrica | lgpd-3b | Versión anterior (mismos casos) |
|---|---|---|
| Acerto general | 81,7% | 32,9% |
| Respuestas correctas (684 casos) | 78,4% | 19,3% |
| Dispositivo esperado citado | 79,7% | 19,0% |
| Citas literales verificadas | 88,5% | 19,7% |
| JSON válido | 98,7% | 64,7% |
| Recusas correctas (142 casos) | 97,9% | 99,3% |
| Respuestas truncadas | 4 | 296 |
| Latencia p50 / p95 (1 GPU, sin lote) | 14,4 s / 28,9 s | — |

Con la regla de corrección anterior (`cited_answer_v2_passages`) la puntuación fue 82,0%. Errores más frecuentes: 63 recusaciones indebidas (había respuesta en los fragmentos), 51 citas de dispositivos vecinos (otro inciso o parágrafo), 16 respuestas sin el texto de referencia y 11 salidas fuera de JSON.

## Requisitos de hardware

- VRAM estimada: el adaptador ocupa 0,3 GB; el modelo base de 3B en bfloat16 requiere aproximadamente 6-7 GB, y en cuantización de 4 bits del base (no publicada por el autor) cabría en torno a 2-3 GB, aunque la cuantización no está documentada para este adaptador.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para el base en bf16; A100/H100 no son necesarias por el tamaño del modelo.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4070, RTX 4090 y similares con 8 GB o más para bf16.
- Despliegue: la model card documenta `transformers` + `peft` (`PeftModel.from_pretrained` sobre la revisión fijada del base). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un adaptador PEFT, requeriría fusión con el base o soporte de adaptadores en el servidor de inferencia.
- Latencia observada: p50 de 14,4 s y p95 de 28,9 s por consulta en una GPU sin batching, con generación greedy de hasta 640 tokens. El throughput no está publicado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lgpd-3b (este) | 3B + LoRA r=32 | 5.120 (entrenamiento) | Lector fundamentado LGPD/ECA Digital con citas JSON | Apache 2.0 | Hugging Face (adaptador PEFT) |
| SmolLM3-3B (base) | 3B | no disponible en la información | Modelo generalista multilingüe | Apache 2.0 | Hugging Face |
| Alternativas jurídicas en portugués de tamaño comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de otros adaptadores jurídicos brasileños comparables con métricas publicadas; la comparación cuantitativa se limita a la versión anterior del propio adaptador recogida en la tabla de evaluación.

## Limitaciones y advertencias

- Requiere fragmentos de norma en el prompt: sin ellos responde fuera del contrato y la calidad no está garantizada.
- No es asesoramiento jurídico; la model card exige verificación humana de las respuestas por parte de quien responde del caso.
- El conocimiento cubre las versiones de las normas capturadas en noviembre de 2026; reformas posteriores no están en los pesos y deben aportarse como fragmentos.
- Sesgos: no documentados por el autor; el corpus se limita a fuentes oficiales brasileñas y al portugués.
- Riesgo de alucinación mitigado pero no eliminado: 51 casos de test citaron dispositivos vecinos y 16 omitieron el texto de referencia; la tasa de citas literales verificadas es del 88,5%, no del 100%.
- Tasa de recusación indebida del 63 casos sobre 826: el modelo puede negarse a responder aunque los fragmentos contengan la respuesta.
- 11 salidas fuera de JSON en test (1,3%): los consumidores del pipeline deben validar el esquema y gestionar errores de parseo.
- Idioma limitado al portugués; no se documenta soporte de otras lenguas.
- El dataset de entrenamiento es privado, lo que limita la reproducibilidad del ajuste.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el uso jurídico recae en el integrador.
- El adaptador debe combinarse con el base en la revisión exacta indicada; otras revisiones pueden degradar el comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/evertonsb/lgpd-3b
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Dataset (privado): https://huggingface.co/datasets/evertonsb/lgpd-3b-dataset
