# patronus-studio/wolf-defender-prompt-injection

## Resumen

Wolf Defender es un clasificador de texto binario especializado en la detección de inyecciones de prompt y jailbreaks, desarrollado por Patronus Studio como parte de su stack de seguridad Patronus Protect. El modelo está diseñado para actuar como capa de guardrail local: analiza el contenido no confiable antes de que llegue a un LLM, identificando instrucciones maliciosas que intentan manipular el comportamiento del modelo. Está basado en mmBERT-base, un encoder ModernBERT multilingüe, y cuenta con 307.531.778 parámetros y una ventana de contexto de 2.048 tokens. Su relevancia actual radica en el crecimiento de sistemas de agentes y herramientas que procesan entradas externas, donde la inyección de prompt se ha convertido en un vector de ataque crítico. La versión v2, publicada en marzo de 2026, mejora sustancialmente la especificidad en entradas benignas difíciles y reduce los falsos positivos respecto a su predecesor, manteniendo una alta precisión en la detección.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) basado en jhu-clsp/mmBERT-base |
| Parametros totales | 307.531.778 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | FP32, FP16, INT8 (MatMul/Gemm) con FP16 embeddings, INT8 + INT4 embeddings (vía ONNX) |
| Idiomas soportados | Alemán (de), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (Transformers) y ONNX (4 variantes) |

## Arquitectura y entrenamiento

El modelo parte de mmBERT-base, un checkpoint de ModernBERT multilingüe con arquitectura de encoder transformer. Sobre esta base se añade una cabeza de clasificación binaria que produce dos etiquetas: `BENIGN` (0) e `INJECTION` (1). La versión v2 fue entrenada desde cero a partir de un checkpoint fijo de mmBERT-base, con el objetivo de mejorar la generalización y reducir los falsos positivos en entradas benignas complejas. El entrenamiento incluye un conjunto de validación limpio de 72.212 ejemplos (25.281 inyecciones y 46.931 benignos) y un conjunto de prueba independiente de 14.720 ejemplos. No se han publicado detalles sobre el volumen total de datos de entrenamiento ni sobre técnicas específicas como RLHF o DPO, pero el diseño como clasificador supervisado sugiere un entrenamiento convencional con etiquetas binarias. La principal innovación técnica de v2 es el equilibrio deliberado entre recall en distribución y especificidad en datos externos, lo que se refleja en una ligera reducción del F1 en validación limpia (98.44% frente a 99.70% de v1) a cambio de una mejora drástica en la especificidad sobre conjuntos benignos difíciles (96.23% frente a 81.57%).

## Capacidades

- Detección de inyecciones de prompt y jailbreaks en texto arbitrario, mediante clasificación binaria (`BENIGN` / `INJECTION`).
- Manejo de documentos largos: el modelo puntúa ventanas de 2.048 tokens con solapamiento de 64 tokens y agrega los resultados con Smooth-Max normalizado.
- Soporte multilingüe para alemán e inglés, con capacidad de procesar ambos idiomas en un mismo documento.
- Despliegue flexible: disponible en formato Transformers (safetensors) y en cuatro variantes ONNX optimizadas para distintos entornos (FP32, FP16, INT8 mixto e INT8+INT4).
- Diseñado para integración como guardrail en pipelines de IA, con latencia baja y apto para ejecución local.
- No incluye capacidades de generación de texto, tool calling ni razonamiento multi-paso; es exclusivamente un clasificador de seguridad.

## Casos de uso

- Protección de agentes de IA con acceso a herramientas: el modelo puede interceptar las entradas que recibe el agente (por ejemplo, contenido de páginas web o respuestas de APIs) y bloquear o poner en cuarentena cualquier instrucción maliciosa antes de que el agente ejecute acciones.
- Filtrado de entrada en chatbots de atención al cliente: integrado como paso previo al LLM, detecta intentos de manipulación como "ignora tus instrucciones anteriores" y evita que el chatbot revele información sensible o realice acciones no autorizadas.
- Guardrail en pipelines de retrieval-augmented generation (RAG): al analizar los fragmentos recuperados de fuentes externas, impide que documentos o webs envenenados inyecten instrucciones en el contexto del modelo.
- Revisión de correos electrónicos y adjuntos: puede escanear el contenido de mensajes entrantes para identificar intentos de jailbreak o ingeniería social dirigidos a asistentes de correo basados en LLM.
- Seguridad en sistemas de CI/CD: en flujos donde el LLM genera o revisa código, Wolf Defender puede verificar que los prompts provenientes de issues, pull requests o comentarios no contengan instrucciones maliciosas que alteren el comportamiento del generador.
- Moderación de contenido generado por usuarios: en foros o plataformas colaborativas, el modelo puede filtrar entradas que intenten explotar al LLM subyacente, como peticiones de revelar el prompt del sistema o de ignorar políticas de seguridad.

## Benchmarks y rendimiento

La tabla siguiente resume los resultados publicados por el autor, utilizando el mismo umbral de decisión (0,5) y el protocolo de puntuación por ventanas de 2.048 tokens con solapamiento de 64 y agregación Smooth-Max normalizada.

| Modelo | Clean validation F1 | Clean specificity | Qualifire F1 | Jayavibhav F1 | Hard-benign specificity | Real-world-benign specificity |
|---|---:|---:|---:|---:|---:|---:|
| **Wolf Defender v2** | **98,44%** | **99,83%** | **95,14%** | **97,84%** | **96,23%** | **96,63%** |
| Wolf Defender Small v2 | 98,33% | 99,76% | 95,21% | 97,68% | 96,67% | 94,38% |
| Wolf Defender v1 (anterior) | 99,70% | 99,78% | 94,17% | 96,54% | 81,57% | 66,85% |
| Wolf Defender Small v1 (anterior) | 97,54% | 98,66% | 91,03% | 94,36% | 82,12% | 73,60% |
| Lunaris Guard v3 | 76,22% | 74,53% | 72,24% | 72,08% | 88,15% | 90,45% |
| Sentinel v1 | 89,01% | 95,12% | 97,62% | 71,69% | 75,62% | 80,34% |
| Sentinel v2 | 99,98% | 99,99% | 96,61% | 98,78% | 63,42% | 80,90% |

Tamaños de los conjuntos de evaluación:

- Clean validation: 72.212 ejemplos (25.281 inyecciones, 46.931 benignos)
- Qualifire: 5.000 ejemplos (1.999 inyecciones, 3.001 benignos)
- Jayavibhav: 9.000 ejemplos (4.443 inyecciones, 4.557 benignos)
- Hard benign: 2.523 ejemplos benignos
- Real-world benign: 178 ejemplos benignos

La especificidad se define como `1 - tasa de falsos positivos`. Los conjuntos hard-benign y real-world-benign contienen solo ejemplos benignos, por lo que la especificidad es la métrica relevante.

Además, se publicó un conjunto de prueba independiente retenido del corpus de entrenamiento (14.720 ejemplos), con los siguientes resultados:

| Accuracy | Injection F1 | Precision | Recall | FPR | FNR |
|---:|---:|---:|---:|---:|---:|
| 98,68% | 97,99% | 99,16% | 96,85% | 0,41% | 3,15% |

## Requisitos de hardware

- El modelo tiene 307,5 millones de parámetros, lo que en FP32 ocupa aproximadamente 1,23 GB y en FP16 unos 615 MB. La variante ONNX INT8+INT4 reduce aún más el tamaño, siendo adecuada para entornos con recursos limitados.
- Inferencia en GPU: cabe en GPUs de consumo con 8 GB de VRAM o más (por ejemplo, RTX 3060, RTX 4060, RTX 4070) utilizando FP16 o cuantización INT8. No se requieren GPUs de datacenter como A100 o H100 para este modelo.
- Inferencia en CPU: al ser un encoder de tamaño moderado, es viable su ejecución en CPU con las variantes cuantizadas, aunque la latencia será mayor. No se han publicado cifras exactas de latencia o throughput.
- Opciones de despliegue: el modelo se puede cargar con la librería Transformers de Hugging Face, o exportarse a ONNX Runtime para entornos de producción. No se mencionan integraciones específicas con vLLM, llama.cpp u Ollama, pero al ser un modelo de clasificación, puede servirse mediante cualquier framework que soporte transformers o ONNX.
- Para documentos largos, el procesamiento por ventanas incrementa el coste computacional de forma proporcional al número de ventanas; se recomienda precalcular las puntuaciones por ventana y agregarlas con Smooth-Max.

## Comparativa con modelos similares

La siguiente tabla compara Wolf Defender v2 con los modelos de la misma categoría (detección de inyección de prompt) que aparecen en los benchmarks publicados.

| Modelo | Parámetros | Contexto | Clean F1 | Qualifire F1 | Jayavibhav F1 | Hard-benign spec. | Licencia |
|---|---|---|---:|---:|---:|---:|---:|---|
| **Wolf Defender v2** | 307,5 M | 2.048 | 98,44% | 95,14% | 97,84% | 96,23% | Apache 2.0 |
| Wolf Defender Small v2 | no disponible | no disponible | 98,33% | 95,21% | 97,68% | 96,67% | Apache 2.0 |
| Lunaris Guard v3 | no disponible | no disponible | 76,22% | 72,24% | 72,08% | 88,15% | no disponible |
| Sentinel v1 | no disponible | no disponible | 89,01% | 97,62% | 71,69% | 75,62% | no disponible |
| Sentinel v2 | no disponible | no disponible | 99,98% | 96,61% | 98,78% | 63,42% | no disponible |

Wolf Defender v2 destaca por su equilibrio entre detección y especificidad: mientras que Sentinel v2 logra un F1 en validación limpia casi perfecto, su especificidad en conjuntos benignos difíciles cae al 63,42%, lo que indica una alta tasa de falsos positivos en entradas benignas complejas. Wolf Defender v2 ofrece la mejor combinación de F1 alto y especificidad robusta, superando a su predecesor y a las alternativas comparadas. Wolf Defender Small v2 presenta un rendimiento muy cercano al modelo completo, con una especificidad ligeramente superior en hard-benign pero inferior en real-world-benign.

## Limitaciones y advertencias

- El modelo solo soporta alemán e inglés; no se garantiza su rendimiento en otros idiomas, lo que limita su uso en entornos multilingües más amplios.
- La ventana de contexto está fijada en 2.048 tokens; para documentos más largos es necesario dividirlos en ventanas, lo que puede perder información contextual entre fragmentos.
- Aunque v2 reduce drásticamente los falsos positivos, sigue existiendo un riesgo residual de clasificar erróneamente entradas benignas como inyecciones, especialmente en textos ambiguos o con lenguaje técnico.
- El modelo debe considerarse una capa dentro de una estrategia de defensa en profundidad, no como la única barrera de seguridad para acciones de alto impacto. El propio autor recomienda no usarlo como frontera de seguridad exclusiva.
- No se han publicado detalles sobre posibles sesgos en el entrenamiento ni sobre el comportamiento ante ataques adversariales sofisticados (por ejemplo, ofuscación o codificación de caracteres).
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero el modelo no incluye garantías de seguridad o exactitud; el usuario es responsable de validar su comportamiento en su caso de uso concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/patronus-studio/wolf-defender-prompt-injection
- Variante pequeña (Wolf Defender Small): https://huggingface.co/patronus-studio/wolf-defender-prompt-injection-small
- Modelo base (mmBERT-base): https://huggingface.co/jhu-clsp/mmBERT-base
- No se han encontrado papers, blogs o repositorios adicionales en la información proporcionada.
