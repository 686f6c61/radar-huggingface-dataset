# decido-ai/decido-1-web-26b-a4b

## Resumen

Decido-1 (web-trained) es un modelo especializado en la toma de decisiones para agentes de navegador, desarrollado por decido-ai. No es un modelo conversacional generalista: recibe el estado de una página web (URL, título, texto visible, tabla de elementos interactivos y las últimas acciones del agente) junto con dos preguntas —qué operación ejecutar y sobre qué elemento— y devuelve una distribución de probabilidad sobre cada opción. Las operaciones cubiertas son click, type, select, scroll, wait, done y blocked.

El modelo parte de google/gemma-4-26B-A4B-it, un transformer con mezcla de expertos de 25.805.936.206 parámetros totales y aproximadamente 4B activos por token, y se afina mediante LoRA sobre pasos de navegación reales extraídos de Mind2Web. Su relevancia radica en que sustituye la decisión del LLM genérico dentro de un agente de navegador por un modelo dedicado, con un formato de petición compatible con Jev Ultrafast de Browser Use, lo que permite integrarlo sin reescribir el agente.

La propuesta es deliberadamente estrecha: no genera texto libre ni mantiene conversación, sino que puntúa opciones discretas. Según el autor, esta especialización eleva la precisión por paso del 59,9 % al 78,6 % frente a Jev 1.14 sobre 1.500 pasos de evaluación, aunque en tareas completas en vivo ambos sistemas quedan prácticamente empatados (74 % frente a 75 % de tareas completadas).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), base Gemma-4-26B-A4B; 128 expertos según la model card |
| Parametros totales | 25.805.936.206 |
| Parametros activos | ~4B por token (según model card) |
| Longitud de contexto | 32.768 tokens (configurado vía `DECIDO_N_CTX=32768`) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16, LoRA fusionada), `lora/` (adaptador para el modelo base), `bundle/` (plantilla de prompt, tokenizer, temperaturas), `decido.json` (manifiesto) |

## Arquitectura y entrenamiento

La base es Gemma-4-26B-A4B, un transformer con mezcla de expertos de 26B parámetros totales y unos 4B activos por token. Sobre ella se aplica un LoRA de rango 16 que cubre atención, MLP, router y los 128 expertos, partiendo de un warm start del LoRA de Decido-1 (la variante sin entrenamiento web). El entrenamiento consiste en una época sobre los pasos de *train* de Mind2Web: 6.834 pasos procedentes de 65 sitios web, cada uno construido con 25, 50 o 100 elementos candidatos, más un 20 % de replay de los datos de entrenamiento de Decido-1. El checkpoint se seleccionó sobre 8 sitios web reservados antes de ejecutar ninguna prueba sobre los conjuntos de test.

El modelo no genera tokens de forma libre: formula cada decisión como una pregunta de elección única y lee la probabilidad asignada a cada opción, con las mismas temperaturas y el mismo mecanismo de lectura que Decido-1. El paquete `bundle/` congela la plantilla de prompt, el tokenizer y las temperaturas para garantizar reproducibilidad. La inferencia está pensada para vLLM; el motor de transformers funciona pero agota la memoria en páginas de más de ~13k tokens sobre una GPU de 80 GB, por lo que el autor desaconseja su uso en producción con páginas reales.

## Capacidades

- Predicción de la siguiente acción de un agente de navegador entre siete operaciones: click, type, select, scroll, wait, done y blocked.
- Selección del elemento objetivo sobre el que aplicar la operación, a partir de una tabla de elementos con rol, etiqueta, valor y opciones.
- Salida probabilística por opción, lo que permite umbralizar, comparar alternativas o construir reglas de parada.
- Consumo del historial de las últimas 10 acciones del agente para mantener coherencia multi-paso.
- Procesamiento de entrada multimodal de tipo imagen-texto a texto (pipeline `image-text-to-text`), heredado de la base Gemma-4.
- Compatibilidad con el formato de petición de Jev Ultrafast (endpoint `POST /v1/systemone`) y uso desde Python mediante la clase `Decido`.
- Capacidad de verificación de objetivo ("goal visibly done?") empleada en el sistema evaluado en tareas en vivo.
- Sin soporte de tool calling genérico, agentes arbitrarios ni conversación libre: la interfaz es la pregunta de elección única.
- Multilingüe: no disponible; el modelo declara únicamente inglés.

## Casos de uso

- Automatización de flujos web repetitivos: el modelo decide en cada paso qué elemento pulsar o qué campo rellenar en portales internos, con 32k tokens de contexto suficientes para páginas de 10-25k tokens habituales en aplicaciones corporativas.
- Integración en agentes de navegador existentes: al hablar el formato de Jev Ultrafast, se puede sustituir el decisor de un agente ya desplegado redirigiendo el endpoint a un servidor local con `decido serve`, sin tocar el resto del pipeline.
- Extracción de datos con navegación guiada: para tareas de scraping donde la ruta hasta el dato requiere interacción (paginación, filtros, desplegables), el modelo elige la secuencia de operaciones sobre los elementos correctos.
- Pruebas de regresión de agentes: al devolver probabilidades por opción, permite medir la confianza del decisor y detectar pasos de baja certeza en pipelines de CI antes de desplegar cambios en el agente.
- Rellenado de formularios y selección de opciones: las operaciones type y select con resolución de elemento a partir de rol y etiqueta cubren casos de alta de datos, solicitudes y configuradores.
- Despliegue on-premise con requisitos de privacidad: al ser apache-2.0 y ejecutarse en una única GPU de 80 GB, permite mantener las trazas de navegación dentro de la infraestructura propia sin enviar estados de página a una API externa.
- Monitorización de agentes en producción: el chequeo de "objetivo visiblemente completado" puede usarse como guardarraíl para detectar paradas prematuras, el fallo principal reportado en las pruebas en vivo.

## Benchmarks y rendimiento

Precisión por paso en modo offline: 1.500 pasos, 500 de cada conjunto de test de Multimodal-Mind2Web, reproducidos con el constructor de peticiones sin modificar de Jev Ultrafast. Un paso se considera correcto solo si aciertan operación y elemento.

| Modelo de decisión | Tareas nuevas | Sitios nuevos | Dominios nuevos | No visto (sitios + dominios) | Todos (1.500) | Elemento | Operación |
|---|---:|---:|---:|---:|---:|---:|---:|
| Decido-1 (web-trained) | 79,4 | 79,6 | 76,8 | 78,2 | 78,6 | 80,7 | 94,1 |
| Jev 1.14 (TypeSafe API) | 62,4 | 59,0 | 58,2 | 58,6 | 59,9 | 62,3 | 86,8 |
| Jev 1.13 (TypeSafe API) | 55,8 | 52,0 | 55,4 | 53,7 | 54,4 | 56,9 | 80,0 |
| Decido-1 (sin entrenamiento web) | 42,0 | 39,8 | 45,8 | 42,8 | 42,5 | 44,8 | 65,2 |

Diferencia pareada frente a Jev 1.14 con intervalo de confianza bootstrap del 95 % sobre pasos: +18,7 [+16,2, +21,3] en los 1.500 pasos y +19,6 [+16,4, +22,8] en sitios y dominios no vistos. Excluyendo 56 pasos en los que el elemento correcto destaca por construcción, la diferencia es de 79,1 frente a 61,5 (+17,6 [+15,0, +20,2]).

Tareas en vivo: 100 tareas sobre sitios reales, 2 ejecuciones cada una, con el agente Jev Ultrafast. El sistema con Decido-1 completa el 74,0 % de las tareas, frente al 75,0 % de Jev 1.14 y el 72,0 % de Jev 1.13. El autor señala que la precisión offline no se traslada uno a uno al éxito de tarea y que el fallo principal en vivo es detenerse antes de tiempo cuando la página solo menciona el objetivo.

Velocidad: 1× A100, vLLM, petición única, 200 pasos aleatorios; p50 de 0,94 s y p95 de 2,7 s por paso.

## Requisitos de hardware

- VRAM: una GPU de 80 GB. Los pesos en bf16 ocupan 48 GB y el resto corresponde a la caché de 32k tokens.
- GPU recomendadas: A100 80 GB o H100 80 GB. No se documentan otras configuraciones.
- GPU de consumo: no viable según el autor; no hay build para CPU porque las páginas de navegador alcanzan 10-25k tokens y resultan demasiado lentas en CPU de portátil.
- Motor de inferencia: vLLM es el motor con el que se midieron todos los resultados. El motor de transformers funciona pero agota la memoria en páginas de más de ~13k tokens en 80 GB.
- Despliegue como servicio: `decido serve` expone `POST /v1/systemone` en el puerto indicado; requiere `pip install "decido-ai[vllm,server]>=1.1.1"`, Linux, NVIDIA GPU y Python >= 3.10.
- Ajuste conocido: si vLLM falla al compilar su sampler FlashInfer en el primer arranque (falta `ninja` o cabeceras CUDA), definir `VLLM_USE_FLASHINFER_SAMPLER=0`; solo afecta al muestreo de tokens, no a las puntuaciones que lee Decido.
- Latencia y throughput: p50 de 0,94 s y p95 de 2,7 s por paso en una A100 con vLLM y petición única.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión por paso (1.500) | Tareas en vivo | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Decido-1 (web-trained) | 25,8B totales / ~4B activos | 32.768 | 78,6 | 74 % | apache-2.0 | Pesos en Hugging Face |
| Jev 1.14 (TypeSafe) | no disponible | no disponible | 59,9 | 75 % | no disponible (API propietaria) | API de TypeSafe |
| Jev 1.13 (TypeSafe) | no disponible | no disponible | 54,4 | 72 % | no disponible (API propietaria) | API de TypeSafe |
| Decido-1 (sin entrenamiento web) | 25,8B totales / ~4B activos | 32.768 | 42,5 | no disponible | apache-2.0 | Pesos en Hugging Face |

La comparación con Jev se limita a los datos publicados por el autor de Decido-1; los detalles de tamaño, contexto y entrenamiento de Jev no son públicos. No se dispone de comparación con otros decisores de navegador en la información proporcionada.

## Limitaciones y advertencias

- Modelo de decisión, no generativo: no mantiene conversación, no produce texto libre y no admite tool calling genérico; usarlo fuera de la interfaz de pregunta de elección única no está soportado.
- Solo inglés: el modelo declara únicamente `en`, lo que limita su uso en páginas y agentes en castellano u otros idiomas.
- Entrenado sobre Mind2Web *train*: aunque los conjuntos de test son disjuntos (sin tareas compartidas, sin objetivos con Jaccard de tokens ≥ 0,8 y sin sitios repetidos en las particiones de sitios y dominios nuevos), los resultados deben interpretarse con esa base de entrenamiento en mente.
- Diferencia metodológica entre offline y en vivo: la reproducción offline proporciona los pasos anteriores verdaderos y 50 elementos candidatos, mientras que un agente en vivo ve su propio historial y la página completa; la precisión offline sobreestima el éxito de tarea.
- Parada prematura: el fallo dominante en tareas en vivo es declarar completado el objetivo cuando la página solo lo menciona; el autor añade una comprobación explícita de "objetivo visiblemente completado" para mitigarlo.
- Requisito de hardware elevado: una GPU de 80 GB es obligatoria; no hay soporte de CPU ni viabilidad en GPU de consumo según la documentación.
- Riesgo de alucinación: no evaluado en la información disponible; el modelo puntúa opciones cerradas, lo que acota el espacio de salida, pero no se han publicado métricas de calibración.
- Sesgos: no se documentan sesgos conocidos en la model card; al derivar de Gemma-4, hereda las características de su modelo base, no detalladas aquí.
- Licencia apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base google/gemma-4-26B-A4B-it, cuyos términos propios no se detallan en la información proporcionada.
- Madurez: el repositorio registra 2 descargas y 0 likes en el momento de la consulta, con creación el 18 de noviembre de 2026 y actualización el 20 de noviembre de 2026; el ecosistema de terceros en torno al modelo es mínimo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/decido-ai/decido-1-web-26b-a4b
- Modelo base de la variante sin entrenamiento web: https://huggingface.co/decido-ai/decido-1-26b-a4b
- Modelo base Gemma-4-26B-A4B-it: https://huggingface.co/google/gemma-4-26B-A4B-it
- Artículo técnico y vídeo end-to-end: https://getdecido.ai/research/decido-1-web
- Repositorio del benchmark y ficheros de resultados: https://github.com/decido-ai/browser-agent-decision-bench
- Agente Jev Ultrafast de Browser Use: https://github.com/browser-use/jev-ultrafast
- Dataset Multimodal-Mind2Web: https://huggingface.co/datasets/osunlp/Multimodal-Mind2Web
