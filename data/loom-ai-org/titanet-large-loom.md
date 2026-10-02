# loom-ai-org/titanet-large-loom

## Resumen

TitaNet-Large (speaker embeddings) es una exportación del modelo de verificación de hablante TitaNet-Large de NVIDIA NeMo, empaquetada en formato GGUF para el motor loom.cpp. Lo publica la organización loom-ai-org dentro de su familia de exportaciones "loom", en este caso la familia 13: entrada de audio y salida de un embedding de hablante de 192 dimensiones por clip. Los pesos son idénticos a los del modelo original `nvidia/speakerverification_en_titanet_large`; lo que cambia es el contenedor y el runtime.

El modelo no genera texto ni mantiene conversaciones: es un extractor de características (pipeline `feature-extraction`) que convierte audio mono a 16 kHz en un vector numérico que representa la identidad del hablante. Con 22.394.250 parámetros (unos 22,4 M) y un repositorio de 0,1 GB, es un modelo muy ligero, orientado a tareas de verificación y comparación de voces. Su licencia es cc-by-4.0 y solo declara inglés como idioma.

Su relevancia actual reside en el ecosistema loom.cpp: permite ejecutar un modelo de embeddings de audio de NVIDIA sin depender de NeMo ni de PyTorch, dentro de un único GGUF autodescriptivo que incluye sus propias topologías de grafo, tokenizador (si procede) y script de control.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TitaNet-Large (red de embeddings de hablante de NVIDIA NeMo); topología interna no detallada en la información disponible |
| Parametros totales | 22.394.250 (unos 22,4 M) |
| Longitud de contexto | no aplicable (modelo de audio; procesa el clip completo en una sola llamada) |
| Tipos de cuantizacion | no disponible (se distribuye como GGUF; no se detallan niveles concretos de cuantización) |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGUF (`titanet-large.gguf`) |

## Arquitectura y entrenamiento

La información disponible identifica el modelo base como TitaNet-Large, el sistema de verificación de hablante de NVIDIA NeMo. Se trata de una red que transforma audio en un embedding de 192 dimensiones; el modelo card no detalla la topología interna (tipo de encoder, mecanismo de pooling, etc.), por lo que ese nivel de detalle queda como no disponible.

No hay reentrenamiento: los pesos son los originales de `nvidia/speakerverification_en_titanet_large`, sin modificar. La aportación de esta publicación es exclusivamente el empaquetado en el formato GGUF de loom.cpp mediante loom-exporter. Según el autor, el modelo fue entrenado sobre VoxCeleb, Fisher, Switchboard, LibriSpeech y SRE, un conjunto de datos con predominio del inglés y compuesto en gran medida por habla telefónica y de entrevista. No se indica el número de tokens ni si hubo fases de RLHF o DPO, algo que no aplica a un modelo de embeddings de audio.

## Capacidades

- Extracción de embeddings de hablante: devuelve un vector de 192 dimensiones por clip de audio.
- Verificación de hablante: la comparación de dos embeddings mediante similitud coseno permite decidir si pertenecen a la misma voz.
- Procesamiento de clips completos: una llamada embebe un clip entero (`model.speech2embeddings.infer`).
- Entrada de audio restringida: se requiere audio mono a 16 kHz.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-step.
- No es multilingüe: solo declara inglés.
- No genera texto, código ni realiza tareas de visión.
- No incluye modo "thinking" ni capacidades de audio más allá del embedding de hablante.

## Casos de uso

- Autenticación biométrica por voz: el modelo genera un embedding del habla del usuario y se compara por similitud coseno con el vector almacenado en el enrolment; el sistema decide el umbral según su coste de falso positivo.
- Diarización de reuniones o llamadas: se embebe cada segmento de la grabación por separado y se agrupan los vectores por clustering en el host, ya que el modelo devuelve un único embedding por llamada.
- Búsqueda y recuperación por voz: indexar los embeddings de un archivo de grabaciones y recuperar todos los fragmentos de un hablante concreto consultando por similitud.
- Etiquetado de audios por locutor en centros de contacto: procesar las grabaciones de llamadas y etiquetar automáticamente qué fragmentos corresponden al agente y cuáles al cliente.
- Detección de suplantación o fraude: comparar la voz entrante con el patrón del titular registrado para detectar voces distintas, apoyándose en que dos voces diferentes puntúan cerca de cero en similitud coseno.
- Agrupación de llamadas por cliente: construir un embedding de referencia por cliente y agrupar futuras interacciones para vincularlas al mismo interlocutor.
- Preprocesado para anotación de conjuntos de datos de audio: generar embeddings de forma masiva sobre un corpus para alimentar modelos posteriores de clasificación o clustering de hablantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Modelo muy ligero: 22,4 M de parámetros. En fp32 ocupa aproximadamente 90 MB de pesos; en fp16, unos 45 MB; en int8, unos 23 MB (estimaciones a partir del recuento de parámetros).
- Cabe en CPU y en cualquier GPU, incluidas integradas y aceleradores de gama baja; no requiere GPU dedicada.
- GPU recomendadas: no aplica ninguna en particular por el tamaño; cualquier GPU moderna sirve, aunque para lotes grandes conviene una GPU de gama media.
- Cabe sobradamente en GPU de consumo (RTX 4090, RTX 3060, etc.) e incluso en dispositivos con recursos muy limitados.
- Opciones de despliegue: loom.cpp (motor) y loom-py (`loom-py-rt` en PyPI). No se documentan despliegues en vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| titanet-large-loom | 22,4 M | no aplicable (audio por clip) | en | cc-by-4.0 | GGUF para loom.cpp |
| nvidia/speakerverification_en_titanet_large | no disponible | no aplicable (audio por clip) | en | no disponible | Pesos originales de NeMo (modelo del que deriva esta exportación) |
| ECAPA-TDNN y modelos de embeddings de hablante equivalentes | no disponible | no aplicable (audio por clip) | típicamente en/multi | varía según implementación | diversos (PyTorch, ONNX, etc.) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada, por lo que la comparación se limita a categoría, idioma y formato de distribución.

## Limitaciones y advertencias

- El embedding se devuelve sin normalizar. La comparación por similitud coseno y la elección del umbral que significa "mismo hablante" corresponden a la aplicación, no al modelo.
- Una llamada produce un único embedding por clip; la diarización exige embeber segmentos por separado y agruparlos en el host.
- Está entrenado sobre datos con predominio del inglés y mayoritariamente habla telefónica y de entrevista; el rendimiento en otras lenguas o condiciones acústicas no está respaldado.
- El audio debe ser mono a 16 kHz; otras frecuencias de muestreo o configuraciones de canales requieren conversión previa.
- No se documentan sesgos concretos ni tasas de error de verificación en la información disponible; la evaluación en producción es responsabilidad del integrador.
- Riesgo de alucinación no aplicable (no genera texto), pero sí hay riesgo de falsos positivos y falsos negativos en la verificación de hablante según el umbral elegido.
- La licencia cc-by-4.0 permite uso comercial siempre que se atribuya la autoría correspondiente; conviene verificar las condiciones heredadas del modelo base de NVIDIA.
- El repositorio registra 0 descargas y 0 valoraciones en el momento de la consulta, y el paquete se apoya en el ecosistema loom.cpp, con menor adopción que alternativas consolidadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/loom-ai-org/titanet-large-loom
- Modelo base original: https://huggingface.co/nvidia/speakerverification_en_titanet_large
- Repositorio de loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Repositorio de loom-exporter: https://github.com/loom-ai-org/loom-exporter
- Repositorio de loom-py: https://github.com/loom-ai-org/loom-py
- Paquete en PyPI: https://pypi.org/project/loom-py-rt/

Nota: los resultados de búsqueda web devueltos corresponden a la herramienta de grabación de pantalla "Loom" y a una marca de ropa homónima, sin relación con este modelo; no se han encontrado enlaces adicionales relevantes.
