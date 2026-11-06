# Nabidnur/spanguard-span-mdistil

## Resumen

spanguard-span-mdistil es un modelo de clasificación de tokens (token classification) de 135 millones de parámetros, resultado del ajuste fino de `distilbert-base-multilingual-cased` para detectar tramos de prompt injection dentro de la salida de herramientas de agentes de IA. Lo desarrolla Nabidnur en el contexto del Meta Global AI Hackathon 2026, como componente del proyecto spanguard, una pasarela de seguridad compatible con la API de OpenAI. El modelo resuelve un problema concreto: los clasificadores de documento completo devuelven una etiqueta binaria (seguro/inseguro) y obligan a descartar el documento entero, mientras que este modelo devuelve spans de caracteres con etiquetado BIO (`O` / `B-INJ` / `I-INJ`), lo que permite eliminar quirúrgicamente el texto del ataque y conservar los datos legítimos que lo rodean.

La arquitectura es un transformer encoder DistilBERT multilingüe con 134.736.387 parámetros reales según los pesos en safetensors, y una longitud de contexto de 384 tokens por ventana en el entrenamiento (con stride de 64 para el procesamiento por ventanas deslizantes). El corpus de entrenamiento es completamente ficticio: 5.550 documentos deterministas de tráfico de agentes en inglés (60%), alemán (20%) y húngaro (20%), con 9 formatos de salida y 10 familias de ataque, más trampas benignas con forma de ataque.

Su relevancia actual es doble: por un lado, ataca un vector de ataque real en despliegues de agentes con tool calling (JSON de resultados, logs, tickets, correos, páginas descargadas); por otro, publica un pipeline reproducible con semillas, hashes, coste de destilación y scripts de entrenamiento comprometidos en el repositorio, algo poco habitual en modelos de seguridad de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT), 6 capas, token classification con etiquetado BIO |
| Parametros totales | 134.736.387 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 384 tokens por ventana en entrenamiento, con stride 64 para ventanas deslizantes |
| Tipos de cuantizacion | no disponible (pesos en safetensors fp32/fp16; no se documentan GGUF ni otras) |
| Idiomas soportados | en, de, hu |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-multilingual-cased`, un encoder transformer destilado de 6 capas y 135M de parámetros, y se ajusta como clasificador de tokens con tres etiquetas: `O` (fuera de inyección), `B-INJ` (inicio de span de inyección) e `I-INJ` (continuación). No hay decodificador generativo ni atención lineal: la salida es una secuencia de etiquetas por token que se agrupa en spans de caracteres mediante el offset mapping del tokenizador.

El corpus de entrenamiento son 5.550 documentos ficticios generados de forma determinista (generador `training/gen_corpus.py`, semillas y hashes comprometidos), con 9 formatos de salida × 10 familias de ataque y trampas benignas con forma de ataque. Sobre una muestra estratificada (1.000 documentos de entrenamiento y 150 de desarrollo) se aplicó destilación de profesor: el modelo abierto Muse Spark Open de Meta reetiquetó los documentos span a span en Baseten, y las etiquetas de entrenamiento combinan el gold plantado con los spans del profesor. El manifiesto comprometido registra una tasa de acuerdo del profesor de 369/590 documentos atacados de entrenamiento confirmados con coincidencia exacta de cita, y un coste de 3,91 USD (474k tokens de entrada / 781k de salida en 1.150 llamadas, 0 errores). Los hiperparámetros son 3 épocas, batch 32, lr 5e-5, fp16, secuencia 384 con stride 64 y semilla 42, entrenado en una GPU gratuita de Kaggle. Los conjuntos de evaluación se generan con semillas disjuntas y se verifican por hash de contenido para evitar contaminación.

## Capacidades

- Detección de spans de prompt injection a nivel de carácter dentro de texto estructurado y semiestructurado (JSON, logs, tickets, correos, páginas descargadas).
- Etiquetado BIO (`O` / `B-INJ` / `I-INJ`) que permite sustitución quirúrgica por `[stripped]` en lugar de descartar el documento completo.
- Procesamiento de documentos largos mediante ventanas deslizantes con stride 64 y fusión de spans con reglas en el paquete `spanguard`.
- Multilingüe en inglés, alemán y húngaro.
- Integración como paso previo en pasarelas de agentes compatibles con la API de OpenAI (`spanguard guard --mode fast`).
- Inferencia en CPU con latencia medida en los registros de evaluación del repositorio.
- No soporta tool calling, agentes, visión, audio ni modo thinking: es exclusivamente un detector de spans.

## Casos de uso

- Pasarela de seguridad para agentes con tool calling: el modelo se sitúa entre la salida de la herramienta y el contexto del LLM, detecta spans inyectados en el JSON de respuesta y los sustituye por `[stripped]`, preservando los campos legítimos del resultado.
- Saneamiento de logs y tickets antes de reinyectarlos en el prompt: en pipelines de soporte donde se vuelcan tickets de usuario al contexto del agente, el detector elimina instrucciones maliciosas embebidas sin perder el resto del ticket.
- Preprocesado de correos y páginas descargadas: en agentes que leen correo o hacen fetching web, el modelo filtra el texto recuperado antes de que llegue al modelo generativo, reduciendo la superficie de ataque de inyección indirecta.
- Filtro en pipelines de CI/CD para evaluaciones de seguridad: se puede ejecutar sobre fixtures de ataques conocidos para medir tasa de escape y sobre-stripping de forma automatizada, como hace el propio repositorio en `eval/results`.
- Capa de defensa en profundidad junto a clasificadores de documento completo: al ser un modelo pequeño y rápido en CPU, se usa como primer filtro barato y se reserva el clasificador grande o la autodetección por LLM para los casos dudosos.
- Despliegue en entornos con recursos limitados: con 135M de parámetros y pesos de ~0,5 GB, cabe en CPU y en GPUs de consumo, lo que permite ejecutarlo en el mismo host que la pasarela sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a los registros comprometidos en `eval/results` del repositorio (tasa de escape, sobre-stripping, F1 de documento y de span, y latencia en CPU frente a clasificadores abiertos y autodetección por LLM), pero no se incluyen cifras numéricas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,5 GB en fp32 para los pesos; menos de 1 GB en fp16. En CPU el modelo ocupa del orden de 500 MB en memoria.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; no requiere A100 ni H100. Una RTX 4090 o una T4 sobran para el modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU.
- Opciones de despliegue: `transformers` con `AutoModelForTokenClassification`; el paquete `spanguard[model]` envuelve el modelo con ventanas deslizantes y fusión de spans. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (son motores orientados a generación, no a token classification).
- Latencia y throughput: no se proporcionan cifras concretas; la model card indica que la latencia en CPU se mide en los registros de evaluación del repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| spanguard-span-mdistil | 134,7M | 384 tokens/ventana | Detección de spans de prompt injection (BIO) | Apache-2.0 | Hugging Face, 0 descargas |
| Clasificadores abiertos de prompt injection (genéricos) | no disponible | no disponible | Clasificación documento completo (seguro/inseguro) | variable | Hugging Face |
| Autodetección por LLM (p. ej. Muse Spark Open como profesor) | no disponible | no disponible | Detección por prompt en el propio LLM | variable | API / pesos abiertos |
| distilbert-base-multilingual-cased (base) | 135M | 512 tokens | Masked LM / base para fine-tuning | Apache-2.0 | Hugging Face |

La diferencia clave frente a los clasificadores de documento completo es la granularidad: devuelve spans en lugar de una etiqueta binaria, lo que evita descartar datos legítimos. Frente a la autodetección por LLM, es órdenes de magnitud más barato y rápido, a costa de menor capacidad de generalización ante paráfrasis novedosas.

## Limitaciones y advertencias

- Entrenado solo con tráfico de agentes ficticio en en/de/hu; otros idiomas y canales (texto en imágenes, audio) quedan fuera de alcance.
- Un detector de spans es una mitigación, no una garantía: familias de paráfrasis novedosas pueden pasar sin ser detectadas.
- El profesor es un LLM, por lo que sus etiquetas adicionales heredan sus puntos ciegos; se mitiga con anclas de gold plantado y la clase de trampas benignas, pero no se elimina.
- Riesgo de sobre-stripping: el modelo puede marcar como inyección texto legítimo con forma de ataque; la model card reporta esta métrica en la evaluación, pero no se dan cifras.
- Cobertura lingüística limitada a tres idiomas; no hay evaluación publicada en castellano.
- El contexto de entrenamiento es de 384 tokens por ventana; documentos más largos dependen del pipeline de ventanas deslizantes y de la fusión de spans, que no forma parte del modelo.
- Licencia Apache-2.0 permite uso comercial, pero no hay garantía de rendimiento en producción ni auditoría externa de los resultados.
- Modelo recién publicado (1 de noviembre de 2026) con 0 descargas y 0 likes: sin validación independiente de la comunidad.

## Enlaces

- [Hugging Face: Nabidnur/spanguard-span-mdistil](https://huggingface.co/Nabidnur/spanguard-span-mdistil)
- [Repositorio spanguard en GitHub](https://github.com/Hisernberg/spanguard)
- [Resultados de evaluación comprometidos](https://github.com/Hisernberg/spanguard/tree/main/eval/results)
- [Meta Global AI Hackathon 2026](https://github.com/Hisernberg/spanguard)
- [Modelo base: distilbert-base-multilingual-cased](https://huggingface.co/distilbert/distilbert-base-multilingual-cased)
- [Dataset: kragglenote2forwork/spanguard-corpus](https://huggingface.co/datasets/kragglenote2forwork/spanguard-corpus)
