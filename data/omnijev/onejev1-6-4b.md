# OmniJev/OneJev1.6-4B

## Resumen

OneJev1.6-4B es un modelo multimodal de decisión (denominado por el autor "System One decision model") desarrollado por OmniJev. Se trata de un ajuste fino completo (full fine-tune) del modelo base Qwen/Qwen3.5-4B, con 4.539.265.536 parámetros (4,54 B). Su función no es generar texto libre, sino recibir un estado del entorno (una captura de pantalla, una foto, un vídeo o texto plano) junto con una serie de preguntas y devolver, en una única pasada forward, una probabilidad calibrada para cada opción de respuesta.

El problema que resuelve es el de la toma de decisiones de agentes: en lugar de que un LLM genere una acción en formato de texto y haya que interpretarla, OneJev1.6-4B produce directamente distribuciones de probabilidad sobre opciones discretas (por ejemplo, "click" frente a "stop"), lo que facilita la integración en bucles de control de agentes GUI y en tareas de verificación de objetivos. El modelo se sirve mediante la librería `qev` del propio autor, que implementa la System One API de TypeSafe con un campo adicional `media` para imágenes y vídeo.

Es relevante porque, según la model card, obtiene 62,01 puntos en la parte pública de Decision Index 0.3 (37 benchmarks, 140.178 peticiones), frente a 54,89 de la versión anterior OneJev1.5-4B, y supera a 42 de los 57 modelos de 25 B a 36 B parámetros presentes en ese tablero. El repositorio se publica bajo licencia Apache 2.0 y no registra descargas ni "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivada de Qwen/Qwen3.5-4B (etiqueta de arquitectura `qwen3_5`); detalles de capas, cabezas y encoder de visión no disponibles |
| Parametros totales | 4.539.265.536 (4,54 B) |
| Parametros activos | No aplica segun la informacion disponible (no se documenta una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos completos en safetensors, sin versiones GGUF, AWQ ni GPTQ documentadas |
| Idiomas soportados | No disponible (la model card no especifica idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `transformers`; tamano del repositorio 9,1 GB) |

## Arquitectura y entrenamiento

OneJev1.6-4B es un ajuste fino completo de Qwen/Qwen3.5-4B, un modelo multimodal de tipo image-text-to-text, tal como refleja la etiqueta `pipeline_tag` del repositorio y el tag de arquitectura `qwen3_5`. No se documentan en la información disponible el número de capas, la dimensión oculta, el mecanismo de atención ni la composición exacta del encoder visual o de vídeo. La innovación principal no reside en el backbone, sino en la cabeza de decisión y en el formato de salida: el modelo devuelve probabilidades calibradas para cada opción planteada en una sola pasada forward, en lugar de una secuencia de texto autodirigida. La model card enmarca esta capacidad dentro del concepto de "System One", es decir, decisiones rápidas y directas frente a cadenas de razonamiento extensas.

El entrenamiento consistió en un fine-tune completo sobre aproximadamente 440.000 preguntas extraídas de ejecuciones reales de agentes, vídeos, imágenes y los splits de entrenamiento de conjuntos de datos públicos de decisión. No se especifican en la información proporcionada el número total de tokens, la composición detallada del dataset, ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineación. El conjunto de evaluación propio, denominado OneJev test set, contiene tipos de pregunta vistos en entrenamiento pero con instancias que ningún modelo vio durante el entrenamiento.

## Capacidades

- Decisión multimodal: acepta capturas de pantalla, fotografías, vídeo y texto plano como entrada, combinados con preguntas tipadas, y devuelve probabilidades calibradas por opción en una única pasada forward.
- Tipos de pregunta estructurados: la API `qev` expone al menos los tipos `Noul` (verificación de una afirmación, por ejemplo si una factura ha sido pagada) y `Choice` (elección entre opciones discretas, por ejemplo "click" frente a "stop").
- Control de agentes GUI: orientado a decidir la siguiente acción de un agente sobre interfaces gráficas (pulsar un elemento, detener la ejecución, verificar un objetivo).
- Procesamiento de vídeo: la model card indica explícitamente soporte de entrada de vídeo, además de imagen y texto.
- Servicio compatible con API: el servidor `qev serve` implementa la System One API de TypeSafe con un campo `media` adicional para imágenes y vídeo.
- Calibración de confianza: la salida es una probabilidad por opción, lo que permite fijar umbrales y derivar intervención humana o parada del agente.
- Generación de texto libre: no disponible; la model card describe el modelo como un modelo de decisión, no como un generador conversacional.
- Tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Automatización de agentes GUI: dado un estado de pantalla más una tarea en texto (por ejemplo, "pagar la factura pendiente de ACME"), el modelo devuelve la probabilidad de que la acción siguiente sea pulsar un elemento o detenerse, lo que permite construir políticas de control con umbrales de confianza explícitos.
- Verificación de objetivos en pipelines de agentes: con el tipo de pregunta `Noul`, el modelo evalúa si una condición se ha cumplido (por ejemplo, si una factura ya está pagada) antes de dar por terminada una tarea; sirve como comprobador barato en cada paso del bucle.
- Moderación y enrutado de decisiones binarias: al devolver una probabilidad calibrada en lugar de texto, puede integrarse en un router que derive los casos de baja confianza a un modelo mayor o a revisión humana.
- Análisis de vídeo para decisiones operativas: el soporte de entrada de vídeo permite evaluar estados temporales (por ejemplo, si un proceso en una grabación ha finalizado) y emitir una probabilidad de cada opción.
- Evaluación de asistentes sobre interfaces web o de escritorio: generación de datos de preferencia y de decisión a partir de capturas reales, útil para auditar agentes existentes sin necesidad de un modelo de razonamiento grande.
- Investigación en calibración de modelos de decisión: al publicarse la puntuación en Decision Index 0.3 y un conjunto de prueba propio con preguntas no vistas, sirve como referencia reproducible para comparar métodos de calibración en modelos de 4 B.
- Despliegue local en entornos con recursos limitados: con 4,54 B parámetros y pesos safetensors de 9,1 GB, puede ejecutarse en una GPU de consumo para prototipos de agentes que deban operar sin conexión.

## Benchmarks y rendimiento

Los únicos resultados numéricos publicados en la información disponible corresponden a la parte pública de Decision Index 0.3 (37 benchmarks, 140.178 peticiones), ejecutada y puntuada con el kit del propio tablero. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar en la información disponible.

Comparativa con los modelos de 3 B a 6 B parámetros con mayor puntuación del tablero:

| Modelo | Parametros | Puntuacion Decision Index (parte publica) |
|---|---|---|
| OneJev1.6-4B | 4,54 B | 62,01 |
| Perplexity Decider Flash v1.2 | 4 B | 60,06 |
| CoCo-Decision-4B 2.3.0 | 4 B | 55,38 |
| vLLM-SR d3-mini | 4 B | 54,90 |
| RSI-Jev v6.1 VL 4B | 4 B | 50,98 |

La model card indica además que OneJev1.6-4B obtiene la mejor puntuación en cuatro de las cinco áreas evaluadas entre estos cinco modelos, y la segunda mejor en "Language Understanding", y que supera a 42 de los 57 modelos de 25 B a 36 B parámetros del tablero. En la comparación con modelos mayores, los datos aportados son: OneJev1.6-4B 62,0 (4,5 B) frente a Cloudflare clef 61,7, Nace.AI Drex v2.0 61,2, Quyet-1.0 Large 60,8, MORJ 1.0.1 60,2, Sieve 27B 60,0 y AnyJev L0 59,8 (estos últimos en el rango de 28 B a 35 B).

Existe también una tabla de resultados frente a Jev 1.13, Jev-Omni 12B y Qwen3.8-27B thinking, en la que se indica que Jev 1.13 solo procesa texto y que sus puntuaciones son las publicadas por su autor; los valores numéricos concretos de esa tabla no están disponibles en la información extraída.

## Requisitos de hardware

- VRAM estimada en precisión completa (bf16/fp16, pesos safetensors de 9,1 GB): en torno a 10-12 GB incluyendo caché de activaciones y el procesamiento de imagen o vídeo, que añade memoria no cuantificada en la información disponible.
- VRAM estimada con cuantización: no disponible; el autor no publica versiones GGUF, AWQ ni GPTQ, por lo que cualquier cuantización requeriría convertir los pesos por cuenta propia y validar la calibración resultante.
- GPU de consumo: 4,54 B parámetros permiten encajar el modelo en tarjetas con 12-16 GB o más (por ejemplo, RTX 3060 de 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090) en bf16, aunque el margen depende de la resolución y del número de fotogramas si se usa entrada de vídeo. Los requisitos exactos no están documentados.
- GPU de centro de datos: A100, H100, L40S o similares permiten servir varias instancias concurrentes; no se publican cifras de concurrencia.
- Opciones de despliegue: el autor documenta `qev serve --model OmniJev/OneJev1.6-4B` (librería `qev` con soporte de PyTorch) y el uso directo desde `transformers`. Compatibilidad con vLLM, TGI, llama.cpp u Ollama: no disponible, no se menciona en la información proporcionada.
- Latencia y throughput: no disponible; no se publican mediciones de latencia ni de tokens o decisiones por segundo.
- Almacenamiento: 9,1 GB de repositorio en safetensors, más el espacio necesario para dependencias de PyTorch.

## Comparativa con modelos similares

La comparación se limita a los modelos citados en la model card dentro de la parte pública de Decision Index 0.3. No se dispone de datos de licencia, contexto o idiomas de las alternativas.

| Modelo | Parametros | Puntuacion Decision Index | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OneJev1.6-4B | 4,54 B | 62,01 | No disponible | Apache 2.0 | HuggingFace (OmniJev/OneJev1.6-4B) |
| Perplexity Decider Flash v1.2 | 4 B | 60,06 | No disponible | No disponible | No disponible |
| CoCo-Decision-4B 2.3.0 | 4 B | 55,38 | No disponible | No disponible | No disponible |
| vLLM-SR d3-mini | 4 B | 54,90 | No disponible | No disponible | No disponible |
| RSI-Jev v6.1 VL 4B | 4 B | 50,98 | No disponible | No disponible | No disponible |
| OneJev1.5-4B (version anterior) | 4 B aprox. | 54,89 | No disponible | No disponible | No disponible |

En el tramo de 25 B a 36 B parámetros, la model card sitúa a OneJev1.6-4B por delante de 42 de los 57 modelos del tablero, con referencias concretas a Cloudflare clef (61,7), Nace.AI Drex v2.0 (61,2), Quyet-1.0 Large (60,8), MORJ 1.0.1 (60,2), Sieve 27B (60,0) y AnyJev L0 (59,8).

## Limitaciones y advertencias

- Alcance funcional restringido: es un modelo de decisión, no un generador de texto general; no debe usarse como sustituto de un LLM conversacional sin evaluar previamente su comportamiento fuera de las tareas de elección.
- Ausencia de benchmarks estandar: no hay resultados publicados de MMLU, HumanEval, GSM8K ni de evaluaciones de seguridad, por lo que la calidad fuera del dominio de decisión es desconocida.
- Riesgo de calibración deficiente fuera de distribución: las probabilidades son calibradas para los tipos de pregunta del entrenamiento; en entradas muy distintas (capturas atípicas, vídeo largo, dominios no vistos) la probabilidad devuelta puede no reflejar la tasa real de acierto y debería validarse con datos propios.
- Riesgo de alucinación en la verificación: en las preguntas del tipo `Noul` el modelo asigna una probabilidad a una afirmación sobre el estado del entorno; un falso positivo puede hacer que un agente dé por completada una tarea que no lo está.
- Idiomas no documentados: la model card no especifica qué idiomas soporta ni cómo se comporta con entradas en castellano; no hay garantía de rendimiento fuera del inglés.
- Longitud de contexto no publicada: se desconoce cuánta información de estado o cuántos fotogramas de vídeo admite, lo que complica planificar despliegues con historiales largos.
- Sin cuantizaciones oficiales: la ausencia de GGUF, AWQ o GPTQ limita el despliegue en hardware modesto y obliga a conversiones propias que pueden degradar la calibración.
- Adopción nula en el momento de la consulta: 0 descargas y 0 "likes" en HuggingFace, sin validación independiente de los resultados por parte de terceros.
- Dependencia de un ecosistema propio: el uso previsto pasa por la librería `qev` y la System One API; no se documenta compatibilidad con servidores de inferencia estándar.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero conviene revisar las condiciones del modelo base Qwen/Qwen3.5-4B, ya que el fine-tune hereda sus términos.
- Metadatos de fecha: el repositorio figura creado y actualizado el 16 de octubre de 2026, dato que conviene contrastar antes de citarlo como referencia temporal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OmniJev/OneJev1.6-4B
- Organizacion en HuggingFace: https://huggingface.co/OmniJev
- Repositorio GitHub: https://github.com/OmniJev/OneJev
- Sitio web del proyecto: https://omnijev.github.io/OneJev/
- Licencia del proyecto: https://github.com/OmniJev/OneJev/blob/main/LICENSE
- Decision Index 0.3 (parte publica): https://huggingface.co/spaces/multimodalart/jev-decision-index
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Citacion (BibTeX): OneJev Team, "OneJev: A Multimodal System One Decision Model", 2026, https://github.com/OmniJev/OneJev

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces encontrados correspondian al codec de video Xvid y a una comparativa no relacionada, por lo que se han descartado.
