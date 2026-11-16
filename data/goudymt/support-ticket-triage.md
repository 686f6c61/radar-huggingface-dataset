# goudymt/support-ticket-triage

## Resumen

Support Ticket Triage es un modelo de clasificación de texto desarrollado por el usuario goudymt para el triaje automático de tickets de soporte. Se trata de un fine-tuning de `sentence-transformers/all-MiniLM-L6-v2` que predice simultáneamente dos etiquetas por ticket: una categoría entre 9 clases posibles y una prioridad entre cuatro niveles (Low, Medium, High, Urgent). El modelo se distribuye como encoder ONNX cuantizado a 8 bits (22,8 MB) acompañado de dos cabezas lineales definidas en un fichero JSON independiente, lo que permite una inferencia muy ligera en CPU.

El modelo forma parte de una demo de mesa de soporte con dos modelos: un modelo de palabras simple y reglas de seguridad deciden qué tickets pueden resolverse sin intervención humana, mientras que este modelo revisa esas decisiones y sugiere una respuesta para cada ticket que llega a una persona. No es un modelo generativo ni un agente autónomo: su función es exclusivamente de sugerencia, con supervisión humana y reglas de seguridad en último término.

Su relevancia actual radica en su tamaño reducido, su licencia Apache 2.0 y su formato ONNX int8, que lo hacen desplegable en entornos con recursos limitados y sin GPU. No obstante, todas las métricas publicadas proceden de tickets generados por plantillas y no de tráfico real, por lo que debe considerarse una prueba de concepto más que un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MiniLM) con dos cabezas lineales de clasificación |
| Parámetros totales | no disponible (el modelo base all-MiniLM-L6-v2 tiene ~22,7 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (word pieces), truncado |
| Tipos de cuantización | int8 (ONNX quantized) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model_quantized.onnx`), tokenizer en `tokenizer.json`, cabezas en `heads.json` |

## Arquitectura y entrenamiento

El modelo parte de `sentence-transformers/all-MiniLM-L6-v2` (revisión `1110a243`), un encoder transformer MiniLM de 6 capas y 384 dimensiones de embedding. Sobre la representación de frase —media de los vectores de token, normalizada a longitud unitaria— se aplican dos cabezas lineales independientes: una para categoría (9 clases) y otra para prioridad (4 clases). El bundle incluye el encoder cuantizado a 8 bits en ONNX, el tokenizer, los pesos y sesgos de ambas cabezas en `heads.json` y un `manifest.json` con el límite de 256 tokens.

El entrenamiento consistió en un fine-tuning sobre 20.000 tickets generados por plantillas durante 2 épocas, con las cabezas añadidas y posteriores a la codificación. No se menciona en la información disponible el uso de RLHF, DPO ni técnicas de alineación adicionales. El autor documenta los cambios respecto al modelo base en `NOTICE.md`. No se especifica la composición exacta del dataset de entrenamiento ni el número total de tokens procesados.

## Capacidades

- Clasificación de tickets de soporte en 9 categorías (no se detalla la lista completa en la información disponible).
- Predicción de prioridad en 4 niveles: Low, Medium, High y Urgent.
- Salida de probabilidad por clase para cada una de las dos cabezas.
- Inferencia en CPU mediante ONNX Runtime con cuantización int8.
- Procesamiento de texto en inglés con truncado a 256 word pieces.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni modo agente.
- No dispone de capacidades de visión, audio ni generación de texto.
- No dispone de modo thinking ni decodificación especulativa.

## Casos de uso

- Triaje previo en mesas de ayuda: el modelo clasifica cada ticket entrante por categoría y prioridad antes de asignarlo a un agente humano, reduciendo el tiempo de enrutamiento manual en colas de soporte con volumen alto.
- Segunda opinión sobre un modelo de palabras: en la arquitectura de la demo del autor, este modelo actúa como verificador de las sugerencias de un modelo léxico simple, elevando la precisión de la categoría del 69,6% al 88,8% en tickets ciegos.
- Detección de tickets de alta prioridad mal clasificados: según los datos del autor, el uso conjunto con el modelo de palabras redujo de 36 a 0 los tickets High o Urgent enviados erróneamente como Low o Medium en un conjunto de 2.000 tickets.
- Enrutamiento automático a colas especializadas: la categoría predicha puede mapearse a departamentos (facturación, técnico, cuenta, etc.) para dirigir el ticket al equipo adecuado sin intervención manual.
- Preetiquetado en herramientas de ticketing: integración como paso previo en sistemas como Zendesk o Freshdesk para rellenar los campos de categoría y prioridad antes de que el agente abra el ticket.
- Despliegue en entornos sin GPU: al ser un ONNX int8 de 22,8 MB, puede ejecutarse en contenedores ligeros, funciones serverless o dispositivos de borde donde no hay acelerador disponible.
- Filtrado de tickets de bajo riesgo: combinado con reglas de seguridad, permite identificar tickets que podrían resolverse sin intervención humana, aunque el autor advierte que el modelo no decide por sí mismo.

## Benchmarks y rendimiento

Los resultados publicados por el autor comparan este modelo con el modelo de palabras de la demo. Las dos primeras filas corresponden a redacciones no vistas durante el entrenamiento; la tercera es una comprobación de cordura sobre 48 tickets escritos para el proyecto y vistos durante su construcción, por lo que no constituye un test independiente.

| Test | Modelo de palabras | Este modelo |
|---|---|---|
| Categoría correcta, 4 folds de redacción reservados (media) | 57,3% | 83,9% |
| Categoría correcta, 2.000 tickets ciegos leídos una vez | 69,6% | 90,8% |
| Categoría correcta, 48 tickets escritos para el proyecto | 39 de 48 | 45 de 48 |

En uso conjunto con el modelo de palabras sobre los 2.000 tickets ciegos, la sugerencia final mostrada a una persona acertó la categoría el 88,8% de las veces (frente al 62,9% previo), y los tickets High o Urgent enviados como Low o Medium cayeron de 36 a 0. Más tickets se derivaron a una persona (1.640 de 2.000, frente a 1.556), y 38 tickets de alto riesgo siguieron superando ambos modelos. La prioridad es menos fiable que la categoría: 75,4% de acierto en redacciones reservadas.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el modelo ONNX int8 ocupa 22,8 MB y puede ejecutarse íntegramente en CPU.
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente. En caso de usar GPU, cualquier tarjeta con soporte ONNX Runtime (GTX 1050, RTX 3060, etc.) serviría, pero no aporta ventaja significativa por el tamaño del modelo.
- Cabe en cualquier GPU consumer, e incluso en dispositivos de borde y entornos serverless.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider), con posibilidad de usar proveedores CUDA o TensorRT si se desea. No se distribuye en formato GGUF ni está integrado en Ollama o vLLM.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo (encoder de 6 capas, 256 tokens máximos, int8) se espera una latencia de milisegundos por ticket en CPU, pero el autor no publica medidas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base `sentence-transformers/all-MiniLM-L6-v2` es el punto de referencia natural: mismo encoder, sin cabezas de clasificación, orientado a embeddings de frase y no a clasificación de tickets. Cualquier comparación con clasificadores de tickets comerciales o con modelos generativos como GPT-4o mini o Llama 3.1 8B requeriría datos que no están disponibles en la información consultada.

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| support-ticket-triage | ~22,7 M (base) | 256 tokens | Apache 2.0 | ONNX int8 |
| all-MiniLM-L6-v2 (base) | ~22,7 M | 256 tokens | Apache 2.0 | safetensors, ONNX |
| Alternativas de clasificación de tickets | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Datos generados: todos los tickets de entrenamiento y prueba provienen de plantillas; los clientes reales escriben de forma distinta, por lo que el rendimiento en producción podría degradarse.
- No es un decisor: está diseñado para sugerir, con una persona y reglas de seguridad a cargo de la decisión final.
- La prioridad es menos fiable que la categoría: 75,4% de acierto en redacciones reservadas frente al 83,9% de la categoría.
- Solo inglés y 256 word pieces: tickets más largos se truncan, lo que puede perder información relevante.
- Las probabilidades de salida son planas; el autor recomienda leer la etiqueta predicha y no el porcentaje de confianza.
- Requiere enmascarar datos personales (correos, teléfonos, números de pedido y tarjeta) antes de la inferencia, ya que el modelo se entrenó con texto enmascarado.
- En la evaluación del autor, 38 tickets de alto riesgo superaron ambos modelos, lo que indica que las reglas de seguridad siguen siendo necesarias.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos al de la demo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/goudymt/support-ticket-triage
- Repositorio GitHub del proyecto: https://github.com/GoudyMT/ai-support-desk-triage
- Demo en vivo: https://goudymt.github.io/ai-support-desk-triage/
- Model card completa: https://github.com/GoudyMT/ai-support-desk-triage/blob/main/ml/MODEL_CARD.md
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
