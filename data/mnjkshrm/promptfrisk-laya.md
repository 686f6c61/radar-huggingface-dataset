# mnjkshrm/promptfrisk-laya

## Resumen

promptfrisk-laya es un clasificador de texto en formato ONNX especializado en la detección de prompt injection y jailbreaks, concebido como guardrail para aplicaciones basadas en modelos de lenguaje. Lo publica el usuario mnjkshrm y se construye sobre Laya, el modelo de decisión "System 1" desarrollado por Nandha Kishor M en Convai Innovations y liberado bajo licencia Apache-2.0. La aportación de frisk no es el modelo base, sino la definición del guardrail y el diseño de las preguntas de clasificación, además de su portado a tres idiomas.

Laya no genera texto libre: recibe una entrada (un ticket, un correo, una conversación o un estado JSON) y devuelve una decisión estructurada con probabilidades calibradas en una sola pasada hacia delante. El modelo base en su raíz inglesa utiliza ModernBERT-large (421M parámetros, contexto de 512 tokens) y su variante multilingüe emplea mmBERT-base (322M parámetros, más de 100 idiomas). promptfrisk-laya se distribuye como el resultado de cuantizar ese modelo y exportarlo a ONNX, orientándolo a la clasificación de seguridad en producción.

Su relevancia es doble: por un lado cubre una necesidad operativa concreta, la de filtrar entradas maliciosas antes de que lleguen al modelo principal; por otro, al ser un clasificador pequeño y cuantizado, permite desplegar el guardrail en entornos con recursos limitados, incluso en CPU, sin depender de un segundo LLM generativo para la tarea de moderación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Laya; la raiz inglesa usa ModernBERT-large, encoder transformer; la variante multilingue usa mmBERT-base) |
| Parametros totales | no disponible para promptfrisk-laya (Laya base: 421M en ModernBERT-large, 322M en mmBERT-base) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible para promptfrisk-laya (Laya base: 512 tokens) |
| Tipos de cuantizacion | modelo cuantizado y exportado a ONNX (esquema de cuantizacion concreto no disponible) |
| Idiomas soportados | no disponible; el guardrail frisk se ha portado a tres idiomas |
| Licencia | Apache-2.0 segun las etiquetas del repositorio; el campo de licencia de los metadatos figura como no disponible |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

promptfrisk-laya es un clasificador de texto (pipeline text-classification) distribuido en formato ONNX. No se describe una arquitectura propia: hereda la de su modelo base, convaiinnovations/laya, que según la documentación de Laya AI corresponde a un encoder transformer. La raíz inglesa se apoya en ModernBERT-large, con 421M parámetros y 512 tokens de contexto, mientras que la variante multilingüe emplea mmBERT-base, con 322M parámetros y cobertura de más de 100 idiomas. No se especifica en la información disponible cuál de estas dos configuraciones base da origen a este checkpoint concreto.

La peculiaridad del enfoque Laya es que el modelo no redacta respuestas: define preguntas y opciones en tiempo de petición y las puntúa en una sola pasada, devolviendo probabilidades calibradas que la aplicación puede usar como umbral, registrar y auditar. Sobre ese comportamiento, frisk añade la definición del guardrail frente a prompt injection y jailbreak y el diseño de las preguntas asociadas, además de su adaptación a tres idiomas. No se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO específicas para este checkpoint.

## Capacidades

- Clasificación de texto orientada a seguridad: detección de prompt injection y de intentos de jailbreak.
- Función de guardrail: actúa como filtro previo a un LLM principal para bloquear o marcar entradas maliciosas.
- Salida estructurada con probabilidades calibradas, apta para umbrales de decisión, registro y auditoría.
- Ejecución en una sola pasada hacia delante, sin generación de texto.
- Distribución en ONNX, pensada para inferencia portable y eficiente.
- Cobertura multilingüe parcial: el guardrail frisk se ha portado a tres idiomas (los idiomas concretos no están disponibles).
- Soporte de tool calling / function calling: no aplica (es un clasificador).
- Soporte de agentes y razonamiento multi-paso: no aplica directamente; puede integrarse como componente de moderación dentro de un pipeline de agentes.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Moderación de entrada en aplicaciones de chat: antes de enviar el mensaje del usuario al LLM principal, promptfrisk-laya clasifica si contiene un intento de prompt injection o jailbreak y decide si se bloquea o se revisa, gracias a su naturaleza de guardrail y a su salida probabilística calibrada.
- Filtrado de prompts en asistentes empresariales: en despliegues internos con datos sensibles, sirve como barrera de seguridad que evalúa cada consulta frente a patrones de manipulación antes de autorizar el acceso al modelo generativo.
- Protección de sistemas RAG: al recibir texto recuperado o consultas del usuario, el clasificador detecta inyecciones indirectas incrustadas en documentos o consultas, evitando que instrucciones maliciosas lleguen al LLM.
- Cumplimiento y auditoría de seguridad: al devolver probabilidades calibradas, permite registrar cada decisión con su nivel de confianza y reconstruir qué entradas se marcaron y por qué, útil para trazas de compliance.
- Filtrado previo en pipelines de agentes: integrado como paso intermedio, evalúa las entradas y salidas de cada turno de un agente para cortar intentos de manipulación multi-paso.
- Moderación en entornos con recursos limitados: al ser un modelo cuantizado en ONNX, puede ejecutarse en CPU o en GPU modestas, lo que permite desplegar el guardrail en el mismo nodo que la aplicación sin depender de hardware de gama alta.
- Clasificación por lotes de registros: procesamiento offline de grandes volúmenes de mensajes o tickets para etiquetar intentos de manipulación y alimentar paneles de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con exactitud. Al derivar de un encoder de 322M-421M parámetros y distribuirse cuantizado en ONNX, el consumo es de un orden de magnitud inferior al de un LLM generativo; cabe esperar tamaños de runtime en el rango de cientos de MB a pocos GB, pero la cifra concreta no está publicada.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna e incluso en CPU, dada su condición de clasificador cuantizado. No se especifican modelos exactos.
- GPU recomendadas: no disponibles de forma específica; por tamaño, cualquier GPU con unos pocos GB de memoria sería suficiente, aunque el dato no está confirmado en la información proporcionada.
- Opciones de despliegue: al ser un modelo ONNX, es compatible con ONNX Runtime; también puede integrarse mediante el paquete promptfrisk disponible en PyPI. No se confirman otros servidores de inferencia (vLLM, TGI, llama.cpp, Ollama) para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| promptfrisk-laya | no disponible (base 322M-421M) | no disponible (base 512 tokens) | Guardrail de prompt injection / jailbreak (text-classification) | Apache-2.0 (segun etiquetas) | ONNX, autor mnjkshrm |
| Laya (convaiinnovations/laya) | 421M (ModernBERT-large) / 322M (mmBERT-base) | 512 tokens | Decision y scoring estructurado | Apache-2.0 | Hugging Face, Convai Innovations |
| Otros clasificadores de guardrail | no disponible | no disponible | Moderacion / seguridad | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada. La única diferencia documentada es funcional: Laya es un modelo de decisión general, mientras que promptfrisk-laya es una especialización de guardrail cuantizada y exportada a ONNX.

## Limitaciones y advertencias

- Al ser un clasificador binario o multidimensión entrenado para detectar injection y jailbreak, puede producir falsos positivos sobre entradas legítimas y falsos negativos ante ataques novedosos.
- Sesgos conocidos: no disponibles. Al depender del dataset de entrenamiento de la base y del diseño de preguntas de frisk, su comportamiento ante distintos idiomas y registros no está documentado públicamente.
- Riesgo de alucinación: reducido en el sentido generativo (no produce texto libre), pero sus probabilidades calibradas no garantizan una decisión correcta; conviene fijar umbrales y validarlos con datos propios.
- Limitaciones de contexto e idioma: el contexto del modelo base es de 512 tokens, por lo que entradas muy largas pueden requerir truncado; el portado a idiomas se limita a tres, cuyos detalles no están disponibles.
- Restricciones de licencia: las etiquetas indican Apache-2.0, que permite uso comercial, pero el campo de licencia de los metadatos figura como no disponible; conviene verificar la licencia efectiva antes de un uso en producción.
- Caveat de despliegue: el repositorio registra cero descargas y cero likes, por lo que se trata de un artefacto sin adopción ni validación comunitaria documentada; su fiabilidad en producción debería verificarse de forma independiente.
- La fecha de creación indicada (2026) y la ausencia de documentación propia limitan la trazabilidad del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mnjkshrm/promptfrisk-laya
- Paquete promptfrisk en PyPI: https://pypi.org/project/promptfrisk/
- Laya AI — Calibrated decisions in one forward pass: https://layaai.org/
- Blog sobre Laya (cómo funciona, ejecución local y evaluación): https://huggingface.co/blog/sora-2/laya-ai-model-how-it-works-run-it-locally-and-eval
- Análisis y fine-tuning de Laya: https://n.demir.io/articles/testing-and-fine-tuning-laya/
- Colección Laya-Bio en Hugging Face: https://huggingface.co/dnagpt/laya-bio-models
- Modelo base: https://huggingface.co/convaiinnovations/laya
