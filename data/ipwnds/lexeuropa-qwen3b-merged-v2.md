# iPwnds/lexeuropa-qwen3b-merged-v2

## Resumen

LexEuropa Qwen3B Merged v2 es un ajuste fino (fine-tuning) del modelo Qwen2.5-3B-Instruct de Alibaba, desarrollado por el usuario iPwnds como parte del proyecto LexEuropa. El modelo está diseñado específicamente para investigación legal sobre derecho de la Unión Europea, con un enfoque muy concreto: responder a partir de extractos de fuentes proporcionadas, estructurando la respuesta como afirmaciones JSON que citan un identificador de fuente (S1..S8), y rechazar la respuesta cuando las fuentes no cubren la pregunta.

La relevancia del modelo no reside en su capacidad de razonamiento legal general, sino en la disciplina de formato de salida y de citación. Está pensado para integrarse en pipelines de generación aumentada por recuperación (RAG) donde la trazabilidad de las citas es crítica. El modelo tiene 3.085.938.688 parámetros, se distribuye bajo licencia Apache 2.0 y está disponible en formato safetensors para transformers.

Se trata de un prototipo de investigación, no de un producto listo para producción legal. La versión v2 se entrenó sobre un dataset reconstruido con una corrección en el divisor de afirmaciones (claim-splitter), aunque el propio autor indica que no es mediblemente mejor que v1, que sigue siendo la versión por defecto del proyecto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parámetros totales | 3.085.938.688 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer decoder-only de la familia Qwen2. Sobre esa base se aplicó un adaptador LoRA con rango r=16 y alpha=32 durante 2 épocas, que posteriormente se fusionó (merged) en los pesos del modelo base para producir un modelo autónomo. El resultado se sirve en un endpoint de inferencia vLLM.

Los datos de entrenamiento consisten en 506 ejemplos (422 positivos y 84 de rechazo) construidos de forma determinista a partir de texto real del RGPD y de las sentencias del TJUE C-131/12 y C-136/17, en inglés, con una partición de validación a nivel de provisión. No se usaron objetivos generados por modelos. El autor documenta un defecto conocido: algunas afirmaciones objetivo se dividían a mitad de frase en referencias cruzadas en línea (por ejemplo, "point (a) of Article 6(1)"); este defecto se corrigió en el constructor de dataset del repositorio y en la versión v2. El entrenamiento se realizó con SFT mediante la librería TRL.

## Capacidades

- Generación de texto con formato estructurado: produce afirmaciones en JSON, cada una con su cita de fuente (S1..S8).
- Disciplina de citación: asocia cada afirmación a un identificador de fuente proporcionado en el contexto.
- Rechazo controlado: puede negarse a responder cuando las fuentes suministradas no cubren la pregunta.
- Investigación legal sobre derecho de la UE: entrenado sobre RGPD y sentencias del TJUE.
- Integración en RAG: diseñado para consumir extractos de fuentes recuperadas y responder a partir de ellos.
- Conversacional: hereda el formato conversacional del modelo base Qwen2.5-3B-Instruct.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Asistencia a la investigación legal con trazabilidad: el modelo recibe extractos de RGPD o de sentencias del TJUE y devuelve afirmaciones JSON con cita de fuente, lo que permite auditar cada respuesta contra el texto original.
- Verificación de citas en pipelines RAG: al forzar un identificador de fuente por afirmación, se puede validar automáticamente que cada salida está respaldada por un documento recuperado.
- Respuesta controlada ante preguntas fuera de alcance: el comportamiento de rechazo entrenado (84 ejemplos) permite que el sistema indique "no cubierto por las fuentes" en lugar de alucinar, adecuado para entornos donde la precisión es prioritaria.
- Prototipado de asistentes legales internos: con solo 3B parámetros, puede desplegarse en infraestructura modesta para pruebas de concepto de asistentes de consulta normativa.
- Extracción estructurada de obligaciones y derechos: a partir de un artículo del RGPD, generar afirmaciones JSON que pueden alimentar bases de conocimiento o sistemas de compliance.
- Evaluación de pipelines de recuperación: al medir la precisión y el recall de citación del modelo sobre preguntas retenidas, sirve como componente de evaluación de la calidad del retrieval.
- Docencia y divulgación: demostración de cómo un modelo pequeño ajustado con pocos ejemplos (506) puede adquirir disciplina de formato y citación en un dominio acotado.

## Benchmarks y rendimiento

Evaluación sobre 42 preguntas retenidas, con recuperación actual y juez Qwen2.5-7B-Instruct:

| Modelo | Precisión de citación | Recall de citación | Notas |
|---|---|---|---|
| LexEuropa v1 | 0,95 | 0,95 | 40 de 42 preguntas; 2 errores de arranque en frío |
| LexEuropa v2 | 0,93 | 0,93 | Entrenado sobre dataset reconstruido |
| Qwen2.5-7B stock | 0,82 | 0,88 | Modelo base sin ajuste |

El autor advierte que las preguntas son plantilladas, por lo que los números absolutos son optimistas y reflejan disciplina de citación, no mejor razonamiento legal. Una cifra anterior de 0,29 frente a 0,24 precede a las correcciones de recuperación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; como referencia orientativa, un modelo de 3B parámetros en FP16 requiere del orden de 6-7 GB de VRAM, y en cuantización de 8 bits o 4 bits bastante menos, aunque no se documentan cuantizaciones publicadas.
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; por tamaño (3B), es plausible en GPUs de consumo con suficiente VRAM, pero no se aportan datos.
- Opciones de despliegue: el autor indica que se sirve en un endpoint de inferencia vLLM; la librería es transformers. No se documentan otras opciones (llama.cpp, Ollama, TGI) en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LexEuropa Qwen3B Merged v2 | 3,09B | no disponible | Legal UE, citación JSON | Apache 2.0 | Hugging Face (iPwnds) |
| Qwen2.5-3B-Instruct | 3B (aprox.) | no disponible | Propósito general | Apache 2.0 | Hugging Face (Qwen) |
| Qwen2.5-7B-Instruct | 7B (aprox.) | no disponible | Propósito general | Apache 2.0 | Hugging Face (Qwen) |

La comparación con Qwen2.5-7B-Instruct aparece en la evaluación del propio autor como línea base de citación (0,82/0,88 frente a 0,93/0,93 de v2). No se dispone de datos de benchmarks estándar (MMLU, HumanEval, GSM8K) para este modelo en la información proporcionada.

## Limitaciones y advertencias

- Corpus limitado a tres documentos en inglés (RGPD, C-131/12 y C-136/17); no cubre otros ámbitos del derecho de la UE.
- Puede rechazar preguntas que requieran síntesis entre un estatuto y una sentencia, por limitación del entrenamiento.
- Es un prototipo de investigación, no asesoramiento legal; no debe usarse como fuente de verdad jurídica.
- Los benchmarks son optimistas por el uso de preguntas plantilladas; no demuestran mejor razonamiento legal.
- Solo soporta inglés; no hay soporte documentado de otros idiomas.
- Riesgo de alucinación no cuantificado fuera del conjunto de evaluación; el comportamiento de rechazo está entrenado pero no garantizado.
- La versión v2 no es mediblemente mejor que v1, que sigue siendo la predeterminada del proyecto.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre adecuación legal.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iPwnds/lexeuropa-qwen3b-merged-v2
- Repositorio del proyecto LexEuropa: https://github.com/lumenworksco/-LexEuropa
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
