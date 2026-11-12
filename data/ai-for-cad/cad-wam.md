# AI-for-CAD/CAD-WAM

## Resumen

CAD-WAM es un modelo de investigación para generación de CAD paramétrico a partir de descripciones en lenguaje natural. Lo desarrolla el colectivo AI-for-CAD como artefacto anónimo asociado a un artículo en revisión por pares (doble ciego), y se publica en Hugging Face bajo licencia MIT. Su particularidad es que no se limita a predecir la siguiente acción de construcción: en cada paso predice también el estado geométrico que esa acción producirá, y se recondiciona con el sólido que sus propias acciones han construido realmente, ejecutadas por un kernel CAD.

Técnicamente es un modelo tipo "world model" sobre el backbone Qwen2.5-1.5B-Instruct (1.788.516.352 parámetros totales según los pesos en safetensors), ampliado con un embedding de estado geométrico de 1024 dimensiones proyectado a 16 tokens de entrada y una cabeza de predicción de estado. La función de pérdida combina entropía cruzada sobre acciones y una regresión del siguiente estado ponderada por `state_loss_weight = 0.03`.

Es relevante porque aborda un problema poco cubierto en la literatura abierta: la generación de secuencias CAD paso a paso con verificación geométrica en bucle cerrado, en lugar de la generación de texto plano o de mallas. El ámbito es acotado (sketch-and-extrude sobre piezas mecánicas del corpus DeepCAD), pero el planteamiento arquitectónico resulta interesante para quien investigue modelos generativos con realimentación física o geométrica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-1.5B-Instruct) con embedding de estado geométrico y cabeza de predicción de estado |
| Parámetros totales | 1.788.516.352 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en BF16) |
| Idiomas soportados | No disponible |
| Licencia | MIT (pesos y código del repositorio); backbone Qwen2.5-1.5B-Instruct bajo Apache-2.0 |
| Formato de pesos | safetensors (BF16, 378 tensores) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct y le añade dos componentes: un embedding de estado geométrico que proyecta un latente de 1024 dimensiones a 16 tokens de entrada, y una cabeza de predicción de estado que estima el siguiente estado geométrico en forma de vector de 1024 dimensiones. La definición del modelo (`modeling_cadwam.py`, `geometric_state_embedding.py`, `state_prediction_head.py`) se carga con `trust_remote_code=True` y requiere `transformers >= 4.51`; el checkpoint se entrenó y verificó con la versión 4.57.6.

El entrenamiento utiliza el split oficial de DeepCAD, convertido a un dataset de acciones y estados paso a paso. La pérdida combina entropía cruzada sobre la siguiente acción de construcción y una regresión del siguiente estado geométrico con peso 0.03 en este checkpoint. La innovación principal es el bucle cerrado: cada acción predicha se ejecuta en un kernel CAD, el sólido resultante se muestrea como nube de puntos, se codifica con un SetVAE (6,4 M de parámetros, incluido en `setvae_encoder/setvae_encoder.pt`) y ese latente se realimenta como estado del paso siguiente. Para el primer paso, el estado es el modelo vacío, representado por el latente de un conjunto de puntos vacío.

## Capacidades

- Generación de secuencias de construcción CAD paramétrica a partir de texto en lenguaje natural.
- Predicción del estado geométrico intermedio en cada paso, además de la acción siguiente.
- Reacondicionamiento en bucle cerrado sobre el sólido realmente construido por el kernel CAD.
- Vocabulario de acciones limitado a sketch-and-extrude: líneas, arcos y círculos en un plano de boceto, extrusión con unión booleana, corte y operaciones de cuerpo nuevo.
- Validación de acciones contra el kernel: una acción que no produce un sólido se rechaza durante el rollout.
- Salida estructurada con `logits`, `pred_next_state` (batch, 1024), `last_hidden_state`, `geo_hidden_states` y `state_repr`.
- No soporta tool calling, function calling, agentes multi-paso genéricos, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Reproducción de resultados de investigación: el checkpoint está pensado como artefacto para replicar los experimentos del artículo, con el codigo del rollout cerrado disponible en el repositorio anónimo enlazado desde la discusión de revisión.
- Generación asistida de piezas mecánicas simples: dada una descripción textual de una pieza prismática con bocetos y extrusiones, el modelo produce la secuencia de acciones que un kernel CAD puede ejecutar para materializarla.
- Estudio de world models geométricos: la arquitectura de predicción de estado y realimentación permite investigar cómo un modelo aprende la dinámica de un kernel CAD y corrige sus propias acciones.
- Benchmarking de text-to-CAD: sirve como línea base para comparar enfoques de generación de secuencias CAD frente a métodos que generan directamente mallas o representaciones B-rep.
- Prototipado de pipelines CAD asistidos: integrado con el ejecutor de kernel y el codificador SetVAE, puede emplearse para explorar interfaces de diseño donde el usuario describe la pieza y el sistema propone la secuencia de operaciones.
- Docencia e investigación en geometría computacional: el código de muestreo de nubes de puntos, codificación SetVAE y ejecución de acciones constituye un ejemplo completo de bucle generación-verificación geométrica.
- Análisis de robustez de modelos generativos con realimentación: permite estudiar cómo los errores de predicción de estado afectan a la validez final del sólido construido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 3,6 GB solo para los pesos, más el codificador SetVAE (6,4 M de parámetros) y las activaciones; en la práctica, entre 6 y 8 GB para una inferencia cómoda con batch pequeño.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para BF16; A100 o H100 si se necesita throughput alto o lotes mayores en investigación.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. En GPUs con 8 GB puede requerir cuantización o batch de tamaño 1.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía soportada; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el formato GGUF no está disponible. El bucle cerrado requiere además el kernel CAD y el codificador SetVAE del repositorio de código.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CAD-WAM | 1.788.516.352 | No disponible | Texto a secuencia CAD con estado geométrico | MIT | Hugging Face |
| DeepCAD (referencia del corpus) | No disponible | No disponible | Generación de secuencias CAD | No disponible | Repositorio público |
| Qwen2.5-1.5B-Instruct (backbone) | 1.500 millones aprox. | No disponible | Generación de texto general | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre CAD-WAM y alternativas de text-to-CAD en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación anónimo asociado a un artículo en revisión por pares; no está pensado para uso en producción.
- El vocabulario de acciones cubre solo sketch-and-extrude; no incluye fillet, chamfer, revolve ni bocetos sobre caras creadas.
- Entrenado y evaluado sobre un único corpus de piezas mecánicas (DeepCAD); no se espera transferencia a formas orgánicas, ensamblajes ni planos.
- No es un modelo texto-a-texto: una pasada forward exige un tensor `geo_latent` de forma (batch, 1024) y el prompt debe contener el token geométrico de relleno en las 16 posiciones reservadas al estado.
- Requiere el codificador SetVAE y el ejecutor de kernel CAD para el bucle cerrado; sin ellos, el modelo no puede generar secuencias válidas de forma autónoma.
- Riesgo de alucinación de acciones no válidas geométricamente; el sistema mitiga rechazando acciones que el kernel no puede ejecutar, pero no corrige la predicción en sí.
- Idiomas soportados no documentados; el backbone es multilingüe, pero no se especifica el comportamiento del modelo ajustado fuera del inglés técnico.
- Sesgos conocidos: no documentados.
- Licencia MIT para pesos y código del repositorio, pero el backbone Qwen2.5-1.5B-Instruct es Apache-2.0 y los datos de entrenamiento derivan de un corpus CAD público con sus propios términos, que deben respetarse en cualquier uso derivado.
- Requiere `transformers >= 4.51` y `trust_remote_code=True`, lo que implica ejecutar código del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/AI-for-CAD/CAD-WAM
- Repositorio de código anónimo: enlazado desde la discusión de revisión del artículo (no incluido en la información disponible)
- Backbone Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Corpus DeepCAD: no disponible en la información proporcionada
- Artículo asociado: no disponible (en revisión por pares)
