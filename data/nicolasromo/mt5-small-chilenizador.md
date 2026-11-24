# NicolasRomo/mt5-small-chilenizador

## Resumen

El chilenizador es un modelo de generación texto-a-texto derivado de `google/mt5-small` mediante fine-tuning completo, especializado en reescribir español neutro a español chileno coloquial. Lo desarrolla NicolasRomo en el contexto de un proyecto académico (curso IIC3670) y se publica bajo licencia Apache 2.0. Con 300.176.768 parámetros y el tokenizer del modelo base mT5, el modelo resuelve una tarea de estilo y registro lingüístico: transformar una frase estándar en su equivalente con chilenismos, sin alterar el significado.

Su relevancia es acotada pero concreta: los modelos multilingües grandes rara vez dominan variantes dialectales específicas, y este trabajo aporta un conjunto de datos de pares neutro-chileno con evaluación sistemática frente a alternativas basadas en reglas léxicas y modelos mayores con LoRA. La model card reporta resultados en test (n=248) que sitúan a mT5-small fine-tuneado por encima de mT5-large con LoRA y cerca de un sistema de reglas, aunque por debajo de Llama-3.2-3B con LoRA.

Es un modelo de investigación, no un producto: el propio autor lo etiqueta como tal y documenta fallos de generalización en expresiones no vistas durante el entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (mT5, variante small) |
| Parámetros totales | 300.176.768 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantización posible vía herramientas externas) |
| Idiomas soportados | es (español, con foco en la variante chilena) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | google/mt5-small |
| Tamaño del repositorio | 1.2 GB |

## Arquitectura y entrenamiento

Se trata de un fine-tuning completo de `google/mt5-small`, un transformer encoder-decoder con atención completa estándar y vocabulario multilingüe heredado del tokenizer del modelo base. No hay innovaciones arquitectónicas: el modelo conserva la topología de mT5 y solo se ajustan los pesos mediante entrenamiento supervisado sobre pares de frases.

El dataset es propio y consta de aproximadamente 2.100 pares español neutro → español chileno coloquial, descritos como semisintéticos y revisados a mano: parte de las frases se generaron o neutralizaron con un LLM y el equipo las revisó manualmente. El split es fijo con semilla 42: 1.680 ejemplos de entrenamiento, 210 de validación y 248 de test. En test, 37 frases contienen expresiones reservadas que no aparecen en el conjunto de entrenamiento (conjunto de "transferencia"), lo que permite medir generalización léxica. No se documenta el uso de RLHF, DPO ni datos de preferencias.

## Capacidades

- Generación de texto texto-a-texto: reescritura de una frase en español neutro a registro chileno coloquial.
- Aplicación de chilenismos léxicos y giros coloquiales cuando la expresión ha sido vista en entrenamiento.
- Prompt único y explícito: `Reescribe en español chileno: {frase}`.
- Decodificación con búsqueda por haces (`num_beams`) y control de longitud de salida (`max_new_tokens`).
- Compatible con la librería `transformers` y con endpoints (tag `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe limitada al español; el resto de idiomas de mT5 no se ha evaluado en este fine-tuning.

## Casos de uso

- Localización de contenido editorial para audiencias chilenas: reescribir textos de marketing o divulgación en español neutro a un registro coloquial chileno, útil para campañas en redes sociales donde el tono cercano importa.
- Generación de diálogos sintéticos para entrenamiento de modelos conversacionales: producir variantes chilenas de frases neutras para aumentar la diversidad dialectal de un corpus de instrucciones.
- Pruebas de robustez dialectal: usar el modelo como generador controlado de variantes para evaluar si otros sistemas (clasificadores, traductores, asistentes) mantienen el rendimiento ante cambios de registro.
- Prototipado de asistentes de atención al cliente con tono local: en un entorno de demo, adaptar respuestas plantilla a un español chileno informal antes de pasar a un modelo mayor.
- Docencia e investigación en procesamiento de lenguaje natural: el modelo y su dataset sirven como caso reproducible de fine-tuning de un seq2seq pequeño con evaluación por chrF, BERTScore y F1 de ediciones.
- Normalización inversa y aumentación de datos: generar pares neutro-chileno adicionales a partir de corpus neutros para tareas de aumento de datos en clasificación de sentimiento o detección de dialecto.
- Análisis lingüístico de chilenismos: inspeccionar qué sustituciones léxicas aprende el modelo y compararlas con un sistema de reglas léxicas, útil para estudiar la cobertura de recursos dialectales.

## Benchmarks y rendimiento

Resultados reportados por el autor en el conjunto de test (n=248):

| Sistema | chrF | BERTScore | Exacta (%) | Chilenismos (%) | F1 ediciones |
|---|---|---|---|---|---|
| identidad (copiar) | 79.9 | 93.4 | 2.4 | 0.0 | 0.0 |
| reglas (léxico) | 83.7 | 94.7 | 19.8 | 24.8 | 27.9 |
| mT5-small (este modelo) | 83.2 | 94.6 | 21.0 | 20.8 | 25.6 |
| mT5-large + LoRA | 79.7 | 93.4 | 2.0 | 0.4 | 0.7 |
| Llama-3.2-3B + LoRA | 89.1 | 96.6 | 48.4 | 48.0 | 51.8 |

En el subconjunto de transferencia (37 frases con expresiones no vistas en entrenamiento), el autor indica que ningún modelo entrenado acierta la expresión esperada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,2 GB solo para pesos; en fp16 alrededor de 0,6 GB, más memoria para activaciones y KV cache.
- Cabe holgadamente en cualquier GPU consumer con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, RTX 4090), así como en CPU para volúmenes bajos.
- GPU de datacenter (A100, H100) innecesarias para inferencia; útiles solo para reentrenamiento a gran escala.
- Despliegue mediante `transformers` (referencia en la model card), y previsiblemente vía TGI, vLLM o llama.cpp/Ollama si se convierte a GGUF, aunque estas rutas no están documentadas por el autor.
- Latencia y throughput no disponibles; por el tamaño (300 M de parámetros) se espera inferencia en decenas de milisegundos por frase en GPU consumer, sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mt5-small-chilenizador (este) | 300 M | no disponible | chrF 83,2; exacta 21,0 % | Apache 2.0 | Hugging Face |
| mT5-large + LoRA (misma tarea) | ~1,2 B (estimado por familia) | no disponible | chrF 79,7; exacta 2,0 % | no disponible | no disponible como checkpoint público en la información |
| Llama-3.2-3B + LoRA (misma tarea) | 3 B | no disponible | chrF 89,1; exacta 48,4 % | Llama 3.2 Community License | no disponible como checkpoint público en la información |
| Sistema de reglas léxicas | no aplica | no aplica | chrF 83,7; exacta 19,8 % | no aplica | implementación propia del autor |

## Limitaciones y advertencias

- No generaliza a expresiones ausentes del entrenamiento: en las 37 frases del conjunto de transferencia ningún sistema entrenado acierta la expresión esperada.
- Conjuga mal algunas expresiones o las deja sin cambiar, según reconoce el autor.
- El dataset es semisintético (~2.100 pares) y de dominio reducido; el vocabulario y los temas cubiertos son limitados.
- Riesgo de alucinación y de deriva semántica al reescribir frases largas o con terminología técnica.
- Sesgos dialectales y de registro: el modelo aprende un chileno coloquial concreto, no la variación interna del país ni registros formales.
- Licencia Apache 2.0 permite uso comercial, pero el autor lo describe explícitamente como modelo de investigación/curso, no como producto; no hay garantías de calidad en producción.
- No hay información publicada sobre contexto máximo efectivo, comportamiento con entradas largas ni evaluación fuera del español.
- Descargas y likes nulos en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NicolasRomo/mt5-small-chilenizador
- Modelo base: https://huggingface.co/google/mt5-small
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios o demos adicionales.
