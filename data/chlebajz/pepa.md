# chlebajz/pepa

## Resumen

PEPA es un conjunto de modelos empaquetados para una extensión de navegador checa orientada a la detección de fraudes. El repositorio `chlebajz/pepa` no contiene un único modelo generativo, sino los artefactos que alimentan una arquitectura en dos etapas: un cribador (screener) basado en `intfloat/multilingual-e5-small` que selecciona los textos merecedores de análisis y un verificador (verifier) afinado a partir de `Qwen/Qwen3.5-2B` en formato GGUF `Q4_K_M` que decide si el contenido es fraudulento y lo explica en checo. Se complementa con datos OCR de Tesseract para extraer texto de imágenes.

El componente principal, el verificador, cuenta con 1.881.825.088 parámetros según los pesos en safetensors del repositorio (aproximadamente 1,88 mil millones), lo que lo sitúa en la gama de modelos pequeños desplegables en el equipo del usuario. La propuesta es deliberadamente local-first: los modelos se ejecutan en el ordenador del usuario sin enviar correos, chats o páginas web a servidores externos, lo que resulta relevante para la privacidad en un caso de uso sensible como es el análisis de comunicaciones potencialmente maliciosas.

El modelo está especializado en checo (`cs`) y se distribuye bajo licencia Apache-2.0, lo que permite uso comercial. El proyecto nace en el marco de la AI výzva pro Česko 2026 en la categoría de prevención de fraudes, y su valor reside menos en el rendimiento generalista que en el ajuste fino sobre una tarea concreta (phishing, estafas y fraude) con explicaciones en lengua checa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (verificador derivado de Qwen3.5-2B); cribador basado en embeddings de multilingual-e5-small |
| Parámetros totales | 1.881.825.088 (verificador) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q4_K_M (verificador); cribador en formato original de e5-small |
| Idiomas soportados | checo (cs) |
| Licencia | Apache-2.0 (verificador); MIT (cribador e5-small); Apache-2.0 (OCR Tesseract) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El sistema PEPA sigue un diseño en cascada. La primera etapa, `models/screener/scr-e5-fp/`, se construye sobre `intfloat/multilingual-e5-small`, un modelo de embeddings multilingüe, y actúa como filtro rápido para decidir qué textos requieren inspección detallada. La segunda etapa, `models/verifier/qwen-pair-q4_k_m.gguf`, es un ajuste fino de `Qwen/Qwen3.5-2B`, un transformer decoder-only, cuantizado a Q4_K_M para su ejecución con llama.cpp en el equipo del usuario. El verificador emite un veredicto de fraude y una justificación en checo. La tercera pieza, `models/ocr/ces.traineddata`, es el modelo de OCR checo de Tesseract, sin modificaciones, empleado para extraer texto de imágenes.

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Sí indica que los scripts y hiperparámetros de entrenamiento se encuentran en la carpeta `training/` del repositorio de GitHub del proyecto. No se documentan innovaciones arquitectónicas adicionales más allá del ajuste fino y la cuantización para inferencia local.

## Capacidades

- Clasificación de contenido fraudulento: determina si un texto (correo, chat o página web) constituye un intento de estafa o phishing.
- Explicación en checo: genera una justificación del veredicto en lengua checa, orientada al usuario final.
- Detección de phishing y fraude: etiquetado específico para la tarea de prevención de fraudes.
- Procesamiento de texto extraído de imágenes mediante OCR checo (Tesseract).
- Cribado previo de textos mediante embeddings para reducir la carga del verificador.
- Ejecución local en el dispositivo del usuario, sin dependencia de servicios en la nube.
- Capacidad conversacional heredada del modelo base Qwen3.5-2B (según el tag `conversational`), aunque no se documenta su alcance.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades multilingües: limitadas al checo según el campo `language`.

## Casos de uso

- Extensión de navegador para alertas de phishing: el verificador analiza el texto de la página o del correo que el usuario está leyendo y muestra una advertencia con explicación en checo cuando detecta un patrón de fraude.
- Filtrado de correo sospechoso en el cliente de escritorio: el cribador descarta los mensajes claramente legítimos y solo pasa al verificador los que requieren análisis, reduciendo el coste computacional en equipos modestos.
- Detección de estafas en chats y mensajería web: el modelo evalúa conversaciones en tiempo real dentro del navegador y señala intentos de ingeniería social dirigidos al usuario checo.
- Análisis de capturas de pantalla y carteles: el OCR checo extrae el texto de imágenes y el verificador evalúa si el contenido constituye una estafa, útil en anuncios y mensajes recibidos como imagen.
- Concienciación y formación: la explicación en checo generada por el verificador sirve como material didáctico para enseñar a identificar fraudes, mostrando al usuario por qué un mensaje es sospechoso.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse íntegramente en local, es adecuado para organizaciones que no pueden enviar comunicaciones de empleados a servicios externos.
- Prototipado de sistemas antifraude en checo: el repositorio de entrenamiento permite reutilizar el pipeline (cribador más verificador) para otras tareas de clasificación de texto en checo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para el verificador: en torno a 2 GB para la cuantización Q4_K_M de un modelo de ~1,88 mil millones de parámetros, más el overhead del contexto y de llama.cpp.
- VRAM estimada para el cribador: mínima, al tratarse de un modelo de embeddings pequeño (multilingual-e5-small).
- GPU recomendadas: no se especifican; el diseño está pensado para ejecución en CPU del equipo del usuario.
- GPU de consumo: el verificador cuantizado debería caber en GPUs de consumo con 4 GB o más de VRAM, aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: llama.cpp (formato GGUF Q4_K_M), Tesseract para OCR; el cribador requiere un runtime de embeddings compatible con e5-small.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PEPA (verificador) | ~1,88 mil M | no disponible | Detección de fraude en checo | Apache-2.0 | HuggingFace (GGUF y safetensors) |
| Qwen3.5-2B (base) | ~2 mil M | no disponible | Modelo generalista | no disponible en esta ficha | HuggingFace |
| multilingual-e5-small (cribador) | no disponible | no disponible | Embeddings multilingües | MIT | HuggingFace |

No se dispone de datos de rendimiento comparativo entre PEPA y modelos alternativos de detección de fraude, por lo que la comparación se limita a parámetros, licencia y enfoque.

## Limitaciones y advertencias

- Especialización idiomática: el modelo está entrenado y etiquetado para checo; su uso en castellano u otros idiomas no está soportado ni validado.
- Riesgo de alucinación: al derivar de un modelo generativo pequeño, las explicaciones pueden contener afirmaciones incorrectas sobre el contenido analizado.
- Sesgos: no se documentan evaluaciones de sesgo; el ajuste fino sobre datos de fraude puede producir falsos positivos en comunicaciones legítimas con características superficialmente similares.
- Falsos negativos: la cuantización Q4_K_M puede degradar ligeramente la precisión respecto al modelo en precisión completa.
- Licencia: Apache-2.0 permite uso comercial, pero el cribador e5-small se distribuye bajo MIT y el OCR bajo Apache-2.0; conviene verificar la compatibilidad en despliegues combinados.
- Contexto: no se publica la longitud de contexto soportada, lo que limita la planificación para documentos largos.
- Madurez: el repositorio tiene 29 descargas y 0 likes, sin benchmarks publicados, por lo que su validación independiente es escasa.
- Dependencia del pipeline: el rendimiento real depende de la calidad del cribador y del OCR previos; errores en esas etapas afectan al veredicto final.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chlebajz/pepa
- Repositorio del proyecto: https://github.com/chlebja3/pepa
- Modelo base del verificador: https://huggingface.co/Qwen/Qwen3.5-2B
- Modelo base del cribador: https://huggingface.co/intfloat/multilingual-e5-small
- AI výzva pro Česko 2026: https://mesic.ai
