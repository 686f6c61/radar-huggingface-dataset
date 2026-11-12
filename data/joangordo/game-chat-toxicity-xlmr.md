# joangordo/game-chat-toxicity-xlmr

## Resumen

Game chat toxicity classifier (XLM-RoBERTa base) es un modelo de clasificación de texto desarrollado por joangordo, un fine-tune de FacebookAI/xlm-roberta-base especializado en detectar toxicidad en chats de videojuegos. Resuelve un problema concreto de moderación de contenido: clasificar mensajes de chat de partidas multijugador en seis categorías (no tóxico, insultos y flameo, otra ofensa, odio y acoso, amenazas y extremismo). Es relevante porque la mayoría de los clasificadores de toxicidad se entrenan con foros y redes sociales, no con el registro lingüístico particular del chat de juego, que mezcla abreviaturas, jerga, errores ortográficos y multilingüismo espontáneo.

El modelo parte de la arquitectura XLM-RoBERTa base, un transformer encoder multilingüe con aproximadamente 278 millones de parámetros, y se ha ajustado sobre el corpus GameTox (Naseem et al., NAACL 2025), construido a partir de chats de World of Tanks. El checkpoint publicado incluye una temperatura de calibración (0,79) y umbrales de moderación elegidos sobre validación, lo que indica que el autor pensó el modelo para su uso en un pipeline de moderación con revisión humana, no como decisor autónomo.

La relevancia práctica está en su naturaleza multilingüe y en su tamaño contenido: 278 millones de parámetros permiten desplegarlo en infraestructura modesta y con latencias bajas, algo crítico en moderación de chat en tiempo real. Ahora bien, el propio autor advierte que el rendimiento cae al transferir a otros juegos y que no es apto para decisiones automáticas sin supervisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base), fine-tune para clasificación de secuencias |
| Parametros totales | 278.048.262 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de XLM-RoBERTa base; el dato no se confirma en la model card) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors, cuantizable a FP16/INT8 con herramientas estándar) |
| Idiomas soportados | Multilingüe (entrenado sobre GameTox; el autor señala peor rendimiento en ruso) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de clasificación sobre XLM-RoBERTa base, un transformer encoder multilingüe preentrenado con enmascaramiento de tokens sobre corpus multilingües. La cabeza de clasificación produce seis etiquetas: Non-toxic, Insults & Flaming, Other Offensive, Hate & Harassment, Threats y Extremism. El ajuste se realizó sobre GameTox, un corpus de chat de World of Tanks publicado por Naseem et al. (NAACL 2025), sujeto a los términos de uso del dataset.

El checkpoint incorpora dos artefactos de calibración relevantes para producción: una temperatura de calibración de 0,79 y umbrales de moderación seleccionados sobre el conjunto de validación, documentados en `demo_config.json`. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de reequilibrado de clases, algo especialmente relevante dado que las clases Threats y Extremism están muy infrarepresentadas en test (8 y 3 mensajes respectivamente).

## Capacidades

- Clasificación de texto multietiqueta en seis categorías de toxicidad sobre mensajes individuales de chat.
- Detección binaria de toxicidad (tóxico vs. no tóxico) con AUROC de 0,950 en test, utilizable como filtro de primera etapa.
- Procesamiento multilingüe, con rendimiento desigual según idioma (más débil en ruso según el autor).
- Salida de probabilidades calibradas (temperatura 0,79) aptas para umbralización en pipelines de moderación.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un clasificador encoder, no un modelo generativo.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Moderación de chat en tiempo real en videojuegos multijugador: el modelo clasifica cada mensaje en milisegundos gracias a su tamaño de 278 millones de parámetros, permitiendo filtrar o marcar mensajes antes de que lleguen al resto de jugadores, con revisión humana en los casos límite.
- Filtro de primera etapa en pipelines de moderación a escala: usar la AUROC binaria de 0,950 para descartar rápidamente el contenido claramente no tóxico y reservar el análisis fino (seis clases) y la revisión humana para la cola de mensajes sospechosos.
- Priorización de colas de revisión humana: ordenar los mensajes reportados por probabilidad calibrada de pertenecer a Threats o Hate & Harassment, de modo que los moderadores atiendan primero los casos de mayor riesgo.
- Análisis de comunidad y salud de servidores: agregar las predicciones por servidor, clan o franja horaria para detectar picos de toxicidad y medir el efecto de políticas de moderación a lo largo del tiempo.
- Investigación en lingüística de videojuegos: estudiar la distribución de categorías de toxicidad y las diferencias entre idiomas en corpus de chat de juego, usando el modelo como anotador automático con validación manual sobre una muestra.
- Moderación de comunidades multilingües fuera del ámbito del juego con cautela: el modelo es multilingüe y puede servir como línea base para foros o Discord, pero el autor advierte que la transferencia a otros dominios degrada el rendimiento (AUROC de ~0,95 a ~0,83 al pasar a Dota 2), por lo que requiere revalidación sobre el dominio objetivo.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Validation macro-F1 | 0,633 |
| Test macro-F1 | 0,455 |
| Test binary AUROC (toxic vs. non-toxic) | 0,950 |
| Desviación estándar bootstrap del macro-F1 (test) | ≈ 0,035 |

El autor advierte que el macro-F1 de test es muy ruidoso porque el conjunto de test contiene solo 8 mensajes de Threats y 3 de Extremism. No se han publicado en la información disponible comparaciones con otros modelos en la misma tabla de benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 0,6 GB de pesos (278 millones de parámetros × 2 bytes), más overhead de activaciones y tokenizador; en la práctica cabe holgadamente en 2 GB de VRAM.
- VRAM estimada en INT8: aproximadamente 0,3 GB de pesos, más overhead; viable en GPUs de gama baja e incluso en CPU para lotes pequeños.
- GPU recomendadas: cualquier GPU consumer moderna sirve; una RTX 3060, RTX 4060 o superior ofrece margen sobrado para lotes grandes. Para alto throughput en servidor, A100 o H100 no son necesarias pero permiten procesar lotes muy grandes.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con 4 GB o más de VRAM, y también en CPU con latencias aceptables para moderación no estrictamente en tiempo real.
- Opciones de despliegue: transformers con PyTorch, Text Embeddings Inference (el repo está marcado como compatible con endpoints), ONNX Runtime, y exportación a GGUF para llama.cpp si se convierte el encoder. vLLM y TGI están orientados a modelos generativos y no son la vía natural para este clasificador.
- Latencia y throughput: no se han publicado cifras en la información disponible. Por el tamaño del modelo, se espera latencia de un solo dígito de milisegundos por mensaje en GPU y throughput de miles de mensajes por segundo en lote, pero son estimaciones, no datos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| joangordo/game-chat-toxicity-xlmr | 278 M | No disponible | Clasificación de toxicidad en 6 clases, chat de juego | No disponible | Hugging Face |
| FacebookAI/xlm-roberta-base | ~278 M | No disponible | Encoder multilingüe base, sin ajuste de toxicidad | MIT (según el modelo base) | Hugging Face |
| Clasificadores de toxicidad genéricos basados en BERT/RoBERTa | Variable | Variable | Clasificación binaria o multietiqueta en redes sociales y foros | Variable | Hugging Face |

La comparación cuantitativa con alternativas concretas no está disponible en la información proporcionada. La diferencia principal frente a clasificadores genéricos es el dominio de entrenamiento (chat de World of Tanks) y la granularidad de seis clases, a costa de un rendimiento que el propio autor califica de limitado fuera de ese dominio.

## Limitaciones y advertencias

- El modelo falla en la mayoría de toxicidad implícita: ironía, sarcasmo y amenazas veladas no se detectan de forma fiable.
- Rendimiento más débil en ruso que en otros idiomas, según el autor.
- La transferencia a otros juegos degrada el rendimiento: la AUROC cae de ~0,95 a ~0,83 al pasar de World of Tanks a Dota 2.
- El macro-F1 de test (0,455) es bajo y muy ruidoso por el escaso número de ejemplos de Threats y Extremism (8 y 3), con desviación bootstrap de ≈ 0,035.
- No es apto para decisiones automáticas de moderación sin revisión humana; el autor lo indica explícitamente.
- La licencia no está disponible en la información proporcionada, por lo que no se puede confirmar el uso comercial; hay que consultar el repo antes de desplegarlo en producción.
- El uso de los datos de entrenamiento (GameTox) está sujeto a los términos del dataset, lo que puede condicionar la redistribución o el uso comercial del modelo derivado.
- Al ser un clasificador encoder, no genera texto ni razona; no debe emplearse para tareas generativas.
- Riesgo de sesgo por el dominio único de entrenamiento: jerga, abreviaturas y normas sociales de un solo juego pueden no generalizar a otras comunidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joangordo/game-chat-toxicity-xlmr
- Código de entrenamiento, evaluación y limitaciones: https://github.com/joangordo/game-chat-toxicity
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Dataset GameTox (Naseem et al., NAACL 2025): referencia citada en la model card; el enlace directo no está disponible en la información proporcionada.
