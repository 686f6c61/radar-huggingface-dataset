# ShayanBhatti/vad-bert-onnx

## Resumen

vad-bert-onnx es una conversión a formato ONNX del modelo RobroKools/vad-bert, un BERT afinado para predecir las tres dimensiones del modelo psicológico VAD (Valence, Arousal, Dominance) a partir de texto en inglés. El autor de este repositorio, ShayanBhatti, no ha entrenado ni ajustado el modelo: se limita a publicar los pesos convertidos para que puedan consumirse desde entornos JavaScript mediante Transformers.js, algo que el repositorio original no permite porque solo distribuye pesos en PyTorch.

El interés del artefacto es, por tanto, operativo más que científico. Resuelve un problema de interoperabilidad concreto: llevar un modelo de análisis afectivo basado en BERT a un servidor Node.js sin tener que repetir el proceso de conversión en cada equipo. El repositorio ocupa 0,4 GB y se distribuye con licencia MIT.

La ficha se apoya únicamente en la información pública del repositorio y de la model card; los detalles de arquitectura interna, datos de entrenamiento y métricas del modelo original no están documentados en esta fuente y se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (heredada del modelo original RobroKools/vad-bert); detalles de capas y dimensión no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | inglés (según la model card: predicción VAD sobre texto en inglés) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo subyacente es un BERT que actúa como regresor multi-salida: en lugar de una cabeza de clasificación, produce tres valores continuos correspondientes a valencia (positividad del sentimiento), activación (intensidad emocional) y dominancia (grado de control percibido). Esta representación VAD es habitual en psicología afectiva y permite describir emociones en un espacio tridimensional continuo en vez de con etiquetas discretas.

Este repositorio no aporta información sobre el entrenamiento: no se documentan el número de tokens, la composición del corpus, la función de pérdida, ni si hubo ajuste fino supervisado o técnicas de preferencia. Tampoco se describe el proceso de conversión a ONNX (versión de ONNX Runtime, opset, herramientas empleadas) ni si se aplicaron optimizaciones posteriores como fusión de operadores o cuantización. Todo ello debe consultarse en el repositorio original.

## Capacidades

- Predicción de valencia, activación y dominancia sobre texto en inglés, con salida continua en las tres dimensiones.
- Análisis de sentimiento en granularidad fina: al separar valencia de activación, distingue entre texto negativo de baja intensidad y texto negativo muy intenso.
- Inferencia en ecosistemas JavaScript/TypeScript mediante Transformers.js y ONNX Runtime Web o Node.
- Ejecución en CPU sin dependencia de PyTorch, al distribuirse en formato ONNX.
- No se documenta soporte de tool calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento; es un modelo encoder de clasificación/regresión, no un modelo generativo.

## Casos de uso

- Análisis de sentimiento en aplicaciones web Node.js: integración directa con Transformers.js para puntuar reseñas o comentarios con tres ejes afectivos en lugar de una única etiqueta positiva/negativa.
- Moderación de comunidades: priorizar mensajes con alta activación negativa (enfado, hostilidad) frente a quejas de baja intensidad, usando la dimensión de arousal como señal de escalado.
- Monitorización de satisfacción en soporte técnico: procesar transcripciones o tickets en inglés y detectar la evolución de valencia y dominancia a lo largo de una conversación.
- Análisis de opiniones de producto: agregar las tres dimensiones sobre lotes de reseñas para construir paneles de percepción emocional por característica.
- Investigación en psicolingüística: obtener anotaciones VAD automáticas sobre corpus en inglés para estudios afectivos, dado que el formato ONNX simplifica el despliegue en pipelines ligeros.
- Enrutamiento de conversaciones en chatbots: derivar a un agente humano los casos con dominancia baja y activación alta, que suelen indicar frustración o pérdida de control percibida.
- Preprocesado en pipelines de datos: ejecución en CPU dentro de contenedores sin GPU para etiquetar grandes volúmenes de texto antes de un análisis posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de correlación, error absoluto medio ni comparaciones con otros modelos VAD, ni para el modelo original ni para esta conversión.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión al no documentarse el número de parámetros; el repositorio completo ocupa 0,4 GB, lo que sugiere un modelo de tamaño moderado que en la práctica puede ejecutarse en CPU.
- GPU recomendadas: no disponibles; al ser un encoder BERT de tamaño no especificado, no requiere GPU dedicada para inferencia por lotes pequeños.
- Compatibilidad con GPU de consumo: probable en cualquier GPU con unos pocos GB de memoria, pero no confirmado por el autor.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), Transformers.js en Node.js y navegador, y cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Salida | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| ShayanBhatti/vad-bert-onnx | BERT + regresión VAD | 3 valores continuos | inglés | MIT | ONNX | Hugging Face, 42 descargas |
| RobroKools/vad-bert | BERT + regresión VAD | 3 valores continuos | inglés | no disponible en esta fuente | PyTorch | Hugging Face |
| Modelos de sentimiento tipo cardiffnlp/twitter-roberta-base-sentiment | RoBERTa + clasificación | etiqueta discreta (pos/neu/neg) | multilingüe en algunas variantes | no disponible en esta fuente | PyTorch, ONNX en variantes de la comunidad | Hugging Face |
| Modelos NRC-VAD léxicos | léxico | 3 valores por palabra | varios | no disponible en esta fuente | ficheros de texto | distribución propia del NRC |

La comparación se limita a categorías generales porque no se dispone de métricas publicadas para este repositorio ni para el original en la información proporcionada. La diferencia principal frente a clasificadores de sentimiento es la salida tridimensional continua; frente a léxicos VAD, la capacidad de puntuar secuencias completas con contexto.

## Limitaciones y advertencias

- No es un modelo nuevo: cualquier limitación del RobroKools/vad-bert original se hereda sin cambios.
- Solo inglés: no hay evidencia de soporte multilingüe.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de calibración: las salidas son valores continuos cuya escala y rango no se documentan en esta ficha.
- Sesgos: no documentados por el autor; al derivar de BERT, es esperable que arrastre sesgos de dominio y de registro del corpus original.
- Licencia MIT permite uso comercial, pero conviene verificar la licencia del modelo original antes de redistribuir en producción.
- El repositorio tiene 42 descargas y 0 likes, sin mantenimiento documentado ni issues públicos referenciados; no hay garantía de soporte.
- No se documenta la versión de ONNX, el opset ni la paridad numérica con los pesos PyTorch originales; conviene validar las salidas contra el modelo de referencia antes de usarlo en producción.
- Al ser un encoder de clasificación, no admite generación de texto, tool calling ni razonamiento multi-paso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ShayanBhatti/vad-bert-onnx
- Modelo original: https://huggingface.co/RobroKools/vad-bert
