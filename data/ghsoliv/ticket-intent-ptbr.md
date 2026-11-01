# GHSoliv/ticket-intent-ptbr

## Resumen

Ticket Intent PT-BR es un modelo de clasificación de texto derivado de BERTimbau (`neuralmind/bert-base-portuguese-cased`) afinado para enrutar mensajes de clientes de un proveedor de internet brasileño en doce intenciones de soporte, como `sem_conexao`, `internet_lenta`, `fatura_cobranca` o `cancelamento`. Lo desarrolla GHSoliv como proyecto de portafolio y aprendizaje, y su relevancia radica en que documenta con un rigor inusual para un modelo de este tamaño el proceso completo de evaluación, incluyendo un conjunto de test independiente y umbrales de confianza calibrados.

El modelo tiene 108.932.364 parámetros (BERT base, 12 capas, encoder bidireccional) y una longitud máxima de secuencia de 128 tokens durante el entrenamiento. Se distribuye en safetensors y en una versión ONNX cuantizada para Transformers.js, lo que permite ejecutarlo en el navegador. La licencia es MIT, lo que facilita su reutilización comercial, aunque las advertencias del autor sobre el rendimiento en tráfico real son explícitas.

La característica más destacable no es su arquitectura, sino su metodología de validación: el autor entrena exclusivamente con 8.560 mensajes sintéticos generados por cinco modelos Gemini y reporta que, aunque supera claramente a una línea base TF-IDF con regresión logística en el test interno, no la supera en el test independiente. Esa honestidad convierte la ficha en un caso de estudio útil sobre los límites de los datos sintéticos en clasificación de intenciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base), 12 capas |
| Parametros totales | 108.932.364 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (longitud máxima de entrenamiento); la ventana nativa de BERTimbau es 512, pero el modelo se afinó con 128 |
| Tipos de cuantizacion | ONNX cuantizado (`onnx/model_quantized.onnx`) para Transformers.js; pesos safetensors en precisión completa |
| Idiomas soportados | Portugués (pt), variante brasileña |
| Licencia | MIT |
| Formato de pesos | safetensors y ONNX |

## Arquitectura y entrenamiento

El modelo parte de BERTimbau base, un encoder transformer bidireccional preentrenado en portugués brasileño, y se afina como clasificador de secuencias con doce etiquetas de salida. La configuración de entrenamiento es estándar: learning rate 2e-5 con 10% de warmup, batch size 16, hasta 6 épocas con early stopping sobre macro-F1 de validación, longitud máxima de 128 tokens y semilla 44 elegida entre tres por puntuación de validación.

Los datos de entrenamiento son 8.560 mensajes sintéticos generados con cinco modelos Gemini, divididos por lote de generación en 7.848 de entrenamiento, 355 de validación y 357 de test. El reparto por lote evita fugas entre conjuntos, un detalle metodológico relevante. La distribución de clases es desigual: cinco intenciones tienen alrededor de 1.300 mensajes de entrenamiento y las otras siete entre 138 y 240. Además, se reservó un conjunto independiente de 144 mensajes redactados con un asistente de IA distinto del generador, revisados por el autor y usados solo para reportar resultados; estos mensajes son más cortos, con una mediana de 7 palabras frente a 15 en los datos de entrenamiento. No se menciona uso de RLHF ni DPO, algo esperable en un clasificador.

## Capacidades

- Clasificación de texto en doce intenciones de soporte al cliente: `sem_conexao`, `internet_lenta`, `conexao_instavel`, `wifi_senha`, `fatura_cobranca`, `mudanca_plano`, `mudanca_endereco`, `cancelamento`, `agendamento_visita`, `sem_relacao`, `saudacao_agradecimento` y `falar_atendente`.
- Salida de una única etiqueta por mensaje, con puntuación de confianza asociada.
- Umbral de confianza operativo de 0,9382, calibrado sobre validación, para derivar casos a una persona.
- Capacidad multilingüe limitada al portugués brasileño; no se reporta soporte para otras lenguas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento. Es un clasificador discriminativo, no un modelo generativo.
- Versión ONNX cuantizada ejecutable en navegador mediante Transformers.js.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo clasifica cada mensaje entrante en una de las doce intenciones y lo dirige al equipo correspondiente (facturación, red, cancelaciones). Es adecuado porque la tarea es de clasificación cerrada y el umbral de 0,9382 permite derivar a un humano los casos de baja confianza.
- Triaje con derivación humana: en un flujo de atención al cliente, las predicciones por debajo del umbral se envían a un agente humano. El autor reporta una cobertura del 92,4% con un 94,7% de acierto en el conjunto independiente, lo que da una idea del volumen que se automatizaría y del error residual.
- Priorización de incidencias técnicas: las clases `sem_conexao` y `conexao_instavel` permiten separar caídas totales de conexiones intermitentes para asignar colas distintas, aunque el propio autor advierte que confunde conexiones lentas con inestables.
- Análisis de motivos de cancelación: la etiqueta `cancelamento` permite agregar y medir solicitudes de baja, con la cautela de que el modelo falla en cancelaciones implícitas.
- Demo interactiva en navegador: la versión ONNX cuantizada alimenta una demo en Hugging Face Spaces, útil para validar la experiencia de usuario de un clasificador de intenciones sin infraestructura de servidor.
- Punto de partida para fine-tuning propio: al ser un BERTimbau con licencia MIT y receta de entrenamiento documentada, sirve como base para equipos que quieran reentrenar con datos reales de su propio dominio.
- Filtrado de mensajes ajenos al soporte: la clase `sem_relacao` permite descartar mensajes fuera de ámbito antes de pasarlos a un agente, aunque es la clase más débil según el autor.

## Benchmarks y rendimiento

Macro-F1 con intervalos de confianza bootstrap del 95% entre paréntesis:

| Modelo | Test (357) | Test independiente (144) |
|---|---|---|
| Este modelo | 0,972 (0,953–0,989) | 0,907 (0,853–0,950) |
| TF-IDF + regresión logística | 0,912 (0,880–0,938) | 0,916 (0,863–0,956) |

El modelo supera a la línea base en el test interno (McNemar p < 0,001) pero no en el test independiente (p = 1,00). Con umbral de confianza 0,9382:

| Conjunto | Cobertura | Acierto sobre mensajes cubiertos |
|---|---|---|
| Test | 96,4% | 98,5% |
| Test independiente | 92,4% | 94,7% |

La versión ONNX cuantizada obtiene macro-F1 de 0,969 en el test y 0,900 en el test independiente, sin recalibrar el umbral. No se reportan resultados de MMLU, HumanEval ni GSM8K, que no aplican a un clasificador de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (108,9 M de parámetros), en torno a 0,5 GB en fp16 y por debajo de 0,3 GB en la versión ONNX cuantizada.
- GPU recomendadas: cualquier GPU consumer moderna sirve; una RTX 3060, RTX 4090 o incluso una GTX 1650 son suficientes. También funciona en CPU sin problema para lotes pequeños.
- Cabe en cualquier GPU consumer y en dispositivos de borde; la versión ONNX cuantizada está pensada para ejecutarse en navegador.
- Opciones de despliegue: `transformers` con pipeline de text-classification, ONNX Runtime, Transformers.js para navegador y servidores de inferencia estándar compatibles con modelos de Hugging Face. No se documenta despliegue con vLLM ni TGI, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera latencia de milisegundos por petición en GPU y de decenas de milisegundos en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ticket Intent PT-BR | 108,9 M | 128 tokens | Clasificador de intenciones pt-BR | MIT | Hugging Face |
| TF-IDF + regresión logística (línea base del autor) | no aplica | no aplica | Clasificador clásico | no disponible | Reproducible por el autor |
| neuralmind/bert-base-portuguese-cased | 108,9 M | 512 tokens | Encoder base pt-BR | no disponible en la información | Hugging Face |

La comparación más directa es con la línea base TF-IDF, que iguala al modelo en el test independiente (0,916 frente a 0,907) con mucha menos complejidad. Frente a BERTimbau base, este modelo es un afinamiento específico para la tarea, no una alternativa general. No se dispone de comparación con otros clasificadores de intenciones en portugués en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento en tráfico real de soporte desconocido: el modelo solo se ha evaluado con datos sintéticos y un conjunto independiente redactado por IA, nunca con mensajes reales de clientes.
- Asigna una única intención aunque el mensaje contenga dos, lo que produce errores en casos mixtos.
- `sem_relacao` es la clase más débil, con F1 de 0,74 en el test independiente, porque los temas ajenos al soporte no se cubren bien con una sola etiqueta.
- Confunde conexiones lentas con inestables y falla en cancelaciones implícitas.
- El modelo es confiado incluso cuando se equivoca, por lo que el umbral de 0,9382 filtra pocos errores; el acierto en el test independiente (94,7%) queda por debajo del objetivo del 97,5% usado en validación.
- Los datos sintéticos arrastran los hábitos de los modelos que los generaron, con un estilo de escritura más largo que el de los mensajes reales (mediana de 15 palabras frente a 7).
- Licencia MIT permite uso comercial, pero el autor recomienda no tomar decisiones sobre clientes de forma autónoma y usar siempre umbral de confianza más revisión humana.
- El proyecto se presenta como portafolio y aprendizaje, no como sistema listo para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GHSoliv/ticket-intent-ptbr
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/GHSoliv/ticket-intent-ptbr-demo
- Modelo base BERTimbau: https://huggingface.co/neuralmind/bert-base-portuguese-cased
