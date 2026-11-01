# ayousanz/yomi-distill-ja

## Resumen

Yomi-Distill (`ayousanz/yomi-distill-ja`) es un modelo de generación de texto en japonés creado por el desarrollador independiente ayousanz, cuyo objetivo es corregir las lecturas (yomi) en katakana que produce OpenJTalk, el conversor grafo-a-fono (G2P) basado en diccionario que usan la mayoría de los sistemas de texto a voz (TTS) japoneses. OpenJTalk suele fallar con números, palabras cuya lectura depende del contexto y nombres propios; este modelo intenta aprender las correcciones que realiza Beam-1.0-501B-A23B (Reflection AI), un modelo de 501B parámetros demasiado grande para integrarse en un pipeline de voz en tiempo real.

Técnicamente es un fine-tuning de `llm-jp/llm-jp-3-1.8b` (1.867 millones de parámetros) mediante LoRA (r=16 en proyecciones q/k/v/o, posteriormente fusionadas), entrenado sobre 5.515 tripletas (frase, lectura de OpenJTalk, lectura corregida por Beam) extraídas de la Wikipedia japonesa. Su relevancia es metodológica: es un experimento de destilación docente-alumno con pre-registro y evaluación ciega, y el propio autor reconoce con transparencia que el modelo no superó a OpenJTalk en el conjunto de prueba principal, aunque sí mejora las lecturas de nombres de lugares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder, base llm-jp-3) |
| Parametros totales | 1.867.614.208 |
| Parametros activos | no disponible (no es MoE; modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenado/evaluado en bfloat16) |
| Idiomas soportados | Japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3,7 GB en el repositorio) |

## Arquitectura y entrenamiento

El modelo parte de llm-jp-3-1.8b, un transformer decoder en familia Llama entrenado por el proyecto LLM-jp para japonés. Sobre esta base se aplicó LoRA con r=16 sobre las proyecciones de atención q/k/v/o, fusionado posteriormente en los pesos. El entrenamiento se realizó durante 2 épocas con learning rate 2e-4, batch 16 con 2 pasos de acumulación y semilla 0, calculando la pérdida únicamente sobre la lectura generada. La elección se hizo entre cinco candidatos pre-registrados (fine-tuning completo de llm-jp-3-440m durante 1-3 épocas y LoRA de llm-jp-3-1.8b durante 1-2) usando solo 97 frases de desarrollo.

Los datos de entrenamiento son 5.515 filas (frase, lectura de OpenJTalk, lectura de Beam) de dos fragmentos de la Wikipedia japonesa (`wikimedia/wikipedia`, `20231101.ja`). Beam actuó como profesor, no como clave de respuestas: leyó 7.551 frases dos veces con `reasoning_effort=low` (una por sí misma y otra corrigiendo OpenJTalk) y solo se conservaron las 5.515 frases donde ambas respuestas coincidían (73 %). En la Parte 1 del estudio, cuando las dos formas de preguntar coincidían, la lectura era correcta el 97 % de las veces. No se usó RLHF ni DPO; es un fine-tuning supervisado estándar. El autor publicó un pre-registro (`prereg.md`) comprometido antes del entrenamiento y congeló el modelo antes de la evaluación final.

## Capacidades

- Correccion de lecturas katakana: recibe una frase en japones y el borrador de OpenJTalk, y genera una lectura corregida (tarea G2P para TTS).
- Generacion de texto en japones: hereda las capacidades base de llm-jp-3-1.8b, aunque no fue ajustado para uso conversacional general.
- Uso sin dependencia de API: el modelo funciona completamente en local; en tiempo de ejecución solo necesita OpenJTalk como borrador inicial.
- Puerta de validacion integrada: la receta oficial acepta la salida solo si no está vacía, contiene únicamente katakana y ー, no fue truncada y su longitud está entre 0,8 y 1,25 veces la del borrador; en caso contrario se mantiene la lectura de OpenJTalk.
- No soporta vision, audio, tool calling ni thinking mode; es un modelo de texto puro especializado.

## Casos de uso

- Correccion de G2P en pipelines de TTS japones: se inserta entre OpenJTalk y el sintetizador para revisar lecturas problemáticas antes de la síntesis de voz, sin llamadas a APIs externas.
- Correccion de nombres de lugares: es su punto fuerte documentado; mejora la precisión en nombres de lugares del 36 % al 52 % (por ejemplo, leyendo 町 como チョウ), útil en lectores de noticias o navegación por voz.
- Sistemas de TTS en dispositivos locales o edge: al ser de 1,8B parámetros y funcionar sin conexión, cabe en despliegues donde un modelo de 501B como Beam es inviable.
- Investigacion en destilacion de modelos grandes: sirve como caso de estudio reproducible de destilación con pre-registro, con datos, código y métricas publicados.
- Evaluacion comparativa de G2P japones: el dataset `beam-yomi-bench` y el código `yomibench` permiten comparar nuevos correctores de lectura contra OpenJTalk y este modelo.
- Asistente de post-edicion de diccionarios de pronunciacion: puede sugerir correcciones a diccionarios tipo NAIST-jdic, aunque con supervisión humana dada su tasa de aciertos limitada.

## Benchmarks y rendimiento

Resultados publicados por el autor, evaluados una sola vez tras congelar el modelo (exact match con intervalos bootstrap al 95 %):

| Sistema | Parte 1: 300 frases (aprobadas por humanos) | `test`: 99 frases (lecturas de Claude) |
|---|---|---|
| OpenJTalk (borrador) | 74,7 % (69,7-79,7) | 74,7 % (65,7-82,8) |
| Student (este modelo) | 74,7 % (69,7-79,7): corrigio 10, rompio 10 | 75,8 % (66,7-83,8): corrigio 3, rompio 2 |
| Beam corrigiendo el borrador (referencia) | 86,0 % (82,0-89,7) | 89,9 % (83,8-96,0) |

En `dev` alcanzó 80,4 % frente al 78,4 % de OpenJTalk, por debajo de la barra pre-registrada (+3 puntos, como máximo un 3 % roto). Desglose relevante: en las 50 frases de nombres de lugares de la Parte 1 sube del 36 % al 52 %; en las otras 250 frases no corrigió ninguna y rompió 8 (82,4 % -> 79,2 %). Copia el borrador en 270 de las 300 frases; solo el 18 % de las filas de entrenamiento (1.013 de 5.515) contiene una corrección, posible causa (no verificada). Como subproducto, se confirma que cuando las dos respuestas de Beam coinciden, la lectura es correcta el 97,0 % de las veces.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-5 GB en bfloat16 (el repositorio pesa 3,7 GB); con cuantización de 4 bits cabría en menos de 2 GB, aunque no hay cuantizaciones publicadas.
- GPU recomendadas: cualquier GPU moderna con al menos 6 GB de VRAM; no se requiere hardware de datacenter.
- Cabe en GPUs de consumo como la RTX 3060 de 12 GB, RTX 4060 Ti de 8 GB o RTX 4090 sin problemas; el propio ejemplo del autor usa `.cuda()` con bfloat16.
- Opciones de despliegue: transformers (receta oficial del autor), llama.cpp y Ollama (al ser arquitectura Llama y safetensors, la conversión a GGUF es viable aunque no está publicada en el repositorio); vLLM y TGI también deberían funcionar por compatibilidad con la arquitectura.
- Latencia y throughput: no disponible; al ser un modelo de 1,8B con salidas cortas (hasta 160 tokens nuevos), la latencia esperada en GPU de consumo es de decenas de milisegundos por frase, adecuada para pipelines de TTS en tiempo casi real.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Rendimiento en el bench de la Parte 1 | Licencia |
|---|---|---|---|---|
| ayousanz/yomi-distill-ja | 1,87B | Correccion de lecturas G2P japones | 74,7 % (empata con OpenJTalk) | Apache 2.0 |
| OpenJTalk (baseline, no LLM) | no disponible (diccionario) | G2P japones | 74,7 % | BSD (OpenJTalk) |
| reflection/Beam-1.0-501B-A23B (profesor) | 501B (MoE) | Correccion de lecturas G2P japones | 86,0 % corrigiendo el borrador | no disponible |
| llm-jp/llm-jp-3-1.8b (base) | 1,8B | Lenguaje general japones | no disponible en esta tarea | no disponible |

## Limitaciones y advertencias

- No supera a OpenJTalk en el conjunto de prueba principal: empata al 74,7 %, corrigiendo 10 frases y rompiendo 10; el propio autor lo declara explicitamente.
- Fuera de nombres de lugares, empeora ligeramente: en 250 frases no relacionadas con topónimos pasa del 82,4 % al 79,2 %, con fallos en nombres propios como 本居宣長 o 与謝野晶子, y no corrige ningún homógrafo.
- Especialización extrema: solo es fiable en la tarea concreta de corrección de lecturas katakana con el formato de prompt documentado; no debe usarse como modelo de lenguaje general.
- Solo el 18 % de los datos de entrenamiento contiene correcciones, lo que explica en parte que el modelo copie el borrador en el 90 % de los casos.
- Las lecturas de referencia del conjunto `test` fueron escritas por Claude y verificadas por una segunda lectura ciega de Claude, no por humanos, lo que introduce incertidumbre en esa métrica.
- Riesgo de alucinacion: mitigado por la puerta de validación (solo katakana, longitud 0,8-1,25 del borrador), pero no eliminado; se recomienda mantener la salida de OpenJTalk cuando la puerta la rechace.
- Sesgos: entrenado solo con Wikipedia japonesa de noviembre de 2023, por lo que su cobertura de vocabulario coloquial, nombres de personas y neologismos es limitada.
- Licencia Apache 2.0 sin restricciones comerciales conocidas; no obstante, verifique los términos de los modelos base y datasets utilizados en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ayousanz/yomi-distill-ja
- Demo en Spaces: https://huggingface.co/spaces/ayousanz/yomi-distill
- Datos de entrenamiento, conjuntos de prueba y resultados: https://huggingface.co/datasets/ayousanz/beam-yomi-teacher
- Benchmark de lecturas (Parte 1): https://huggingface.co/datasets/ayousanz/beam-ja-yomi-bench
- Codigo (space_distill, scripts, yomibench): https://github.com/ayutaz/beam-ja-yomi
- Modelo profesor: https://huggingface.co/reflection/Beam-1.0-501B-A23B
- Modelo base: https://huggingface.co/llm-jp/llm-jp-3-1.8b
- Puerta de validacion (student.py): https://github.com/ayutaz/beam-ja-yomi/blob/main/yomibench/student.py
