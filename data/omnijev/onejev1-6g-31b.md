# OmniJev/OneJev1.6g-31B

## Resumen

OneJev1.6g-31B es un modelo de decisión denominado "System One" desarrollado por OmniJev, un ajuste fino del modelo multimodal google/gemma-4-31B-it. A diferencia de un modelo generativo convencional, recibe un texto (y, según la documentación del proyecto, también pantallas, fotos y vídeo) junto con un conjunto de preguntas tipadas y devuelve, en un único forward pass, una probabilidad calibrada para cada opción de respuesta. El pipeline declarado en Hugging Face es text-classification, lo que refleja ese uso como clasificador probabilístico en lugar de generador de texto libre.

El modelo cuenta con 31.273.086.512 parámetros (31B) en formato safetensors, con un repositorio de 62,6 GB, y se distribuye bajo licencia Apache 2.0. Su propuesta diferencial es la calibración: en lugar de producir texto que después hay que parsear, expone directamente distribuciones de probabilidad sobre preguntas de tipo binario/booleano, elección entre opciones y puntuación ordinal, lo que facilita su integración en sistemas de enrutamiento, triaje y toma de decisiones automatizada.

La relevancia actual del modelo radica en su enfoque de "System One": decisiones rápidas y de un solo paso, con salidas estructuradas y calibradas, pensadas para pipelines de producción donde se necesita latencia baja y resultados interpretables. El ecosistema se completa con Flide, un servidor que implementa la API System One, y con el repositorio GitHub del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (derivado de google/gemma-4-31B-it); no se detalla la arquitectura interna |
| Parametros totales | 31.273.086.512 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye como un ajuste fino (finetune) del modelo base google/gemma-4-31B-it, un transformer multimodal de 31B parámetros orientado a image-text-to-text. OneJev1.6g-31B conserva esa base y la especializa para emitir respuestas tipadas y calibradas: preguntas de tipo "noul" (probabilidad de sí), "choice" (distribución sobre un conjunto de opciones con criterios definidos) y "score" (nivel esperado sobre una escala ordinal). La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF, DPO u otras.

La innovación técnica principal es el formato de salida: en un único forward pass el modelo produce probabilidades calibradas para todas las opciones de todas las preguntas planteadas, en lugar de generar texto autoregresivo que deba postprocesarse. El proyecto se presenta como multimodal (texto, pantallas, fotos y vídeo según el repositorio GitHub), aunque la información disponible no especifica la arquitectura exacta de fusión multimodal ni los detalles del proceso de calibración.

## Capacidades

- Clasificación probabilística de texto mediante preguntas tipadas: booleanas (noul), de elección múltiple (choice) y de puntuación ordinal (score).
- Salidas calibradas: probabilidad por opción y nivel esperado para preguntas de score.
- Procesamiento multimodal según el repositorio del proyecto: pantallas, fotos, vídeo y texto (la model card de Hugging Face solo documenta el uso sobre texto).
- Integración con la API System One a través del servidor Flide (`/v1/systemone`).
- Uso en un único forward pass, sin generación autoregresiva de texto.
- Soporte de criterios etiquetados para preguntas de elección, lo que permite definir taxonomías propias (por ejemplo, equipos de soporte).
- No se documentan capacidades de tool calling, agentes multi-paso ni modo thinking en la información disponible.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto del ticket y devuelve la probabilidad de que el cliente quiera un reembolso, la distribución de probabilidad sobre el equipo que debe gestionarlo y el nivel de urgencia esperado, tal como muestra el ejemplo de la model card.
- Enrutamiento automático de correo o formularios: con preguntas de tipo choice y criterios definidos (ventas, facturación, técnico, envío), se obtiene una distribución que permite asignar el caso al equipo con mayor probabilidad y aplicar umbrales de derivación a revisión humana.
- Moderación y clasificación de contenido: preguntas booleanas calibradas sobre categorías de riesgo permiten fijar umbrales operativos y medir la incertidumbre del modelo en cada caso.
- Priorización de incidencias: preguntas de tipo score con escalas ordinales (baja, media, alta, crítica) devuelven un nivel esperado que puede ordenar colas de trabajo.
- Análisis de formularios y documentos escaneados: la capacidad multimodal declarada en el repositorio permitiría clasificar capturas o fotos con preguntas tipadas, aunque este uso no está documentado en la model card.
- Extracción de señales estructuradas en pipelines de datos: al no requerir generación de texto ni parseo de salidas, encaja en procesos batch o en tiempo real donde se necesitan etiquetas probabilísticas consistentes.
- Evaluación de intención en asistentes conversacionales: clasificar la intención del usuario con probabilidades calibradas antes de derivar a un generador o a una acción concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (safetensors, ~62,6 GB de pesos): aproximadamente 63 GB solo para pesos, más memoria para activaciones y KV cache; se recomienda al menos 80 GB de VRAM.
- GPU recomendadas para precisión completa: A100 80 GB, H100 80 GB o configuraciones multi-GPU.
- En cuantización de 8 bits los pesos ocuparían del orden de 31 GB, y en 4 bits del orden de 16 GB; no obstante, el repositorio no publica versiones cuantizadas (GGUF, AWQ, GPTQ), por lo que estas estimaciones son teóricas.
- GPU de consumo: no cabe en GPUs de 24 GB (RTX 4090) en precisión completa; requeriría cuantización agresiva no publicada.
- Opciones de despliegue: el autor documenta el servidor Flide (`flide serve --model OmniJev/OneJev1.6g-31B`), instalable con `uv pip install flide torchvision`; al ser compatible con transformers, podría desplegarse con frameworks habituales, aunque no se documenta soporte específico para vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OneJev1.6g-31B | 31B | no disponible | Decision model con salidas calibradas (System One) | Apache 2.0 | Hugging Face, GitHub, Flide |
| google/gemma-4-31B-it | 31B | no disponible | Modelo multimodal generativo instruction-tuned | Términos de Gemma | Hugging Face |
| OmniJev/OneJev1.6-27B | 27B | no disponible | Decision model System One multimodal (misma familia) | no disponible | Hugging Face (colección OneJev1.6) |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo con 0 descargas y 0 likes en Hugging Face en el momento de la consulta: no hay evidencia de uso en producción ni validación externa.
- No se publican benchmarks, por lo que no es posible verificar la calidad de la calibración ni compararla con alternativas.
- No se documentan los idiomas soportados; el comportamiento multilingüe es incierto.
- No se especifica la longitud de contexto, lo que limita la planificación de casos con entradas largas.
- No hay versiones cuantizadas publicadas, lo que dificulta el despliegue en hardware de consumo.
- El pipeline declarado (text-classification) no refleja la capacidad multimodal mencionada en el repositorio GitHub; conviene verificar el alcance real del modelo antes de usarlo con imágenes o vídeo.
- Riesgo de alucinación y sesgos: no documentados por el autor; al derivar de Gemma 4, hereda los sesgos del modelo base, que tampoco se detallan en esta ficha.
- Aunque la licencia es Apache 2.0, el modelo base google/gemma-4-31B-it tiene sus propios términos de uso; conviene revisar la compatibilidad para uso comercial.
- Las probabilidades calibradas deben validarse en el dominio concreto de despliegue antes de fijar umbrales de decisión automática.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OmniJev/OneJev1.6g-31B
- Repositorio GitHub del proyecto: https://github.com/OmniJev/OneJev
- Servidor Flide: https://github.com/OmniJev/Flide
- Sitio web del proyecto: https://omnijev.github.io/OneJev/
- Colección OneJev1.6: https://huggingface.co/collections/OmniJev/onejev16
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Perfil del autor: https://huggingface.co/OmniJev
