# iPwnds/lexeuropa-qwen3b-merged

## Resumen

LexEuropa Qwen3B Merged es un modelo de lenguaje de 3.085.938.688 parámetros derivado de Qwen2.5-3B-Instruct, desarrollado por el usuario iPwnds dentro del proyecto LexEuropa. Se trata de un ajuste fino mediante LoRA (r=16, alpha=32, 2 épocas) fusionado en los pesos base, orientado a una tarea muy concreta: la investigación jurídica sobre derecho de la Unión Europea con verificación de citas. El modelo no busca razonamiento jurídico general, sino disciplina de formato y de citación.

La relevancia del modelo reside en su enfoque restringido y medible: responde a partir de extractos de fuentes proporcionadas, generando afirmaciones estructuradas en JSON, cada una asociada a un identificador de fuente (S1..S8), y se niega a responder cuando las fuentes no cubren la pregunta. Está entrenado exclusivamente sobre textos reales del RGPD y de las sentencias del TJUE C-131/12 y C-136/17, en inglés.

Con licencia Apache 2.0 y un tamaño de repositorio de 6,2 GB, es un prototipo de investigación con 230 descargas y sin likes en el momento de la consulta. Su utilidad práctica es acotada: sirve como componente de un pipeline RAG jurídico, no como asesor legal autónomo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada de Qwen2.5-3B-Instruct; el valor no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer decoder-only denso de aproximadamente 3,09 mil millones de parámetros. Sobre esa base se aplicó un ajuste supervisado (SFT) con LoRA de rango 16 y alpha 32 durante 2 épocas, empleando la librería TRL, y posteriormente se fusionó el adaptador en los pesos del modelo base para obtener un checkpoint autónomo. No se documenta ninguna innovación arquitectónica adicional: no hay mezcla de expertos, atención lineal ni decodificación especulativa.

El conjunto de entrenamiento consta de 506 ejemplos (422 positivos y 84 de rechazo), construidos de forma determinista a partir de texto real del RGPD y de las sentencias del TJUE C-131/12 y C-136/17 en inglés, con una partición de validación a nivel de provisión. No se usaron objetivos generados por modelos. El autor reconoce un defecto conocido, corregido en una v2 no publicada: algunas afirmaciones objetivo se truncaban a mitad de frase en las referencias cruzadas en línea (por ejemplo, "point (a) of Article 6(1)"). No se menciona RLHF ni DPO.

## Capacidades

- Generación de texto con formato estructurado: produce afirmaciones en JSON, cada una con un identificador de fuente (S1..S8).
- Citación verificable: asocia cada afirmación a un extracto de fuente proporcionado en el contexto.
- Abstención controlada: se niega a responder cuando las fuentes suministradas no cubren la pregunta (84 ejemplos de rechazo en el entrenamiento).
- Investigación jurídica sobre derecho de la UE limitada al corpus entrenado: RGPD y sentencias C-131/12 y C-136/17.
- Integración en pipelines RAG: diseñado para recibir extractos recuperados y devolver claims citados.
- Capacidades multilingües: no disponibles; el modelo declara únicamente inglés.
- Tool calling / function calling: no documentado en la información proporcionada.
- Razonamiento multi-paso o modo de pensamiento: no documentado.

## Casos de uso

- Asistente de consulta sobre RGPD con trazabilidad: el modelo recibe extractos del reglamento recuperados por un sistema RAG y devuelve afirmaciones en JSON con identificadores de fuente, lo que permite auditar cada respuesta contra el texto original.
- Verificación de citas en borradores jurídicos: dado un conjunto de provisiones y sentencias, el modelo genera claims citados que un revisor humano puede contrastar, reduciendo el riesgo de referencias inventadas.
- Módulo de abstención en pipelines legales: su entrenamiento específico con ejemplos de rechazo permite integrarlo como capa que detecta cuándo la evidencia recuperada es insuficiente y evita responder.
- Búsqueda jurídica estructurada: al devolver JSON con handles S1..S8, la salida se puede procesar programáticamente para enlazar respuestas con documentos fuente en una interfaz de consulta.
- Prototipado de herramientas de compliance: útil para experimentar con flujos de respuesta basados en evidencia documental en entornos de investigación, sin sustituir la revisión de un profesional.
- Evaluación de sistemas RAG jurídicos: sirve como componente de referencia para medir precisión y recall de citación frente a modelos base, dado que el autor publica métricas comparativas con Qwen2.5-7B.

## Benchmarks y rendimiento

Evaluación sobre 42 preguntas retenidas, con recuperación actual y juez Qwen2.5-7B-Instruct:

| Modelo | Precisión de citación | Recall de citación | Preguntas evaluadas | Notas |
|---|---|---|---|---|
| LexEuropa v1 | 0.95 | 0.95 | 40 de 42 | 2 errores de arranque en frío |
| LexEuropa v2 (dataset reconstruido) | 0.93 | 0.93 | No disponible | No publicado |
| Qwen2.5-7B stock | 0.82 | 0.88 | No disponible | Modelo base de comparación |

El autor advierte que las preguntas son plantilladas, por lo que los valores absolutos son optimistas; la comparación indica mejor disciplina de citación, no mejor razonamiento jurídico. Una cifra anterior de 0.29 frente a 0.24 precede a las correcciones de recuperación y no debe usarse.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6,2 GB en FP16/BF16 (tamaño del repositorio); alrededor de 3,5 GB en cuantización de 8 bits y unos 2 GB en 4 bits, estimaciones no documentadas por el autor.
- GPU recomendadas: A100 o H100 para despliegue con vLLM en producción; RTX 4090 o RTX 3090 para inferencia en FP16 en una sola GPU.
- GPU de consumo: cabe en GPUs con 8 GB o más de VRAM en cuantización de 8 bits; en 4 bits podría ejecutarse en GPUs de 4-6 GB, aunque no se documentan variantes GGUF.
- Opciones de despliegue: vLLM (el autor indica que se sirve en un Inference Endpoint con vLLM), transformers, text-generation-inference (etiqueta endpoints_compatible). No se documentan Ollama ni llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| LexEuropa Qwen3B Merged | 3,09 B | No disponible | Apache 2.0 | RAG jurídico UE con citas | Hugging Face, 230 descargas |
| Qwen2.5-3B-Instruct | 3,09 B | No disponible | Apache 2.0 | Propósito general, instrucciones | Hugging Face, ampliamente disponible |
| Qwen2.5-7B-Instruct | 7,6 B (aproximado) | No disponible | Apache 2.0 | Propósito general, instrucciones | Hugging Face, ampliamente disponible |

La comparación con Qwen2.5-7B-Instruct aparece en la evaluación del propio autor como referencia de citación (0.82/0.88 frente a 0.95/0.95 de LexEuropa v1), aunque el tamaño es más del doble. No se dispone de datos de benchmarks estándar (MMLU, HumanEval, GSM8K) para este modelo.

## Limitaciones y advertencias

- Corpus de entrenamiento muy reducido: tres documentos en inglés (RGPD, C-131/12 y C-136/17); el conocimiento jurídico fuera de ese corpus es inexistente.
- Puede rechazar preguntas que requieran síntesis entre un estatuto y una sentencia, según reconoce el autor.
- Defecto conocido en la v1: algunas afirmaciones objetivo se truncaban en referencias cruzadas en línea; corregido solo en una v2 no publicada.
- Las métricas de evaluación son optimistas por el uso de preguntas plantilladas; no deben interpretarse como rendimiento general.
- Riesgo de alucinación: aunque el diseño fuerza citas a handles S1..S8, no hay garantía de que la asociación entre afirmación y extracto sea semánticamente correcta.
- Idioma: solo inglés; no se declara soporte de castellano ni de otras lenguas de la UE.
- Licencia Apache 2.0 permite uso comercial, pero el modelo es un prototipo de investigación y no constituye asesoramiento jurídico.
- Sin datos publicados de sesgos, contexto máximo efectivo ni comportamiento fuera del dominio jurídico.
- Descargas y adopción muy bajas (230 descargas, 0 likes), lo que limita la validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/iPwnds/lexeuropa-qwen3b-merged
- Repositorio del proyecto: https://github.com/lumenworksco/-LexEuropa
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
