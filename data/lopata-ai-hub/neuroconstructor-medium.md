# LOPATA-AI-Hub/neuroconstructor-medium

## Resumen

LOPATA Neuroconstructor · Medium es un paquete especializado local, publicado por LOPATA-AI-Hub, que resuelve una tarea concreta: dada una pantalla con cuatro iconos dispuestos en una matriz de 2x2, una instrucción corta que selecciona uno de dos archivos de audio WAV mono PCM y los propios audios, el sistema devuelve la posición de la celda elegida (con 0 en la esquina superior izquierda). No es un modelo de lenguaje generalista, sino un artefacto fusionado que combina diez componentes de origen (Qwen3-ASR-0.6B para voz, Qwen3-VL-2B-Instruct para rasgos visuales, OmniParser-v2.0, Florence-2-base y Florence-2-base-ft, PP-OCRv5_mobile_det con sus reconocedores en inglés y eslavo, PaddleOCR-VL y un encoder de frases MiniLM multilingüe) junto con conexiones aprendidas empaquetadas en un único archivo `.lopatanet`.

El interés del proyecto es metodológico más que de rendimiento bruto: el autor documenta una comparación entre un flujo no aprendido (13/32 aciertos en 32 tareas independientes) y el paquete fusionado tras el entrenamiento de conexiones (23/32), con 64 ejemplos de entrenamiento, 24 de validación y 32 comandos reservados. El artefacto ocupa 10.181.055.906 bytes (unos 10,2 GB) y se ejecuta en local mediante el runtime `lopata-neuro` 1.2.0, sin depender de servicios en la nube una vez instaladas las dependencias.

La relevancia actual del paquete radica en su enfoque de composición de modelos pequeños y especializados (ASR de 0,6B, VLM de 2B, OCR ligero) para una tarea de selección visual guiada por voz en el borde, con latencias medidas de 2,50 segundos por tarea en un i9-13900KF con RTX 4090. Es, por tanto, un experimento reproducible de orquestación multimodal local más que una alternativa a los grandes modelos fundacionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Paquete fusionado de componentes heterogéneos: ASR (Qwen3-ASR-0.6B), VLM (Qwen3-VL-2B-Instruct), parsers visuales (OmniParser-v2.0, Florence-2-base y Florence-2-base-ft), OCR (PP-OCRv5_mobile_det, en_PP-OCRv5_mobile_rec, eslav_PP-OCRv5_mobile_rec, PaddleOCR-VL) y encoder de frases (paraphrase-multilingual-MiniLM-L12-v2) |
| Parametros totales | No disponible (el paquete pesa 10.181.055.906 bytes; no se desglosa el número de parámetros) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ruso (ru) e inglés (en), según las etiquetas del repositorio |
| Licencia | Otra, con nombre `component-specific` y términos por componente en ATTRIBUTION.md |
| Formato de pesos | Artefacto propietario `.lopatanet` (formato de paquete 2, exportado desde LOPATA 0.9.3-dev); no se distribuye en safetensors ni GGUF |

## Arquitectura y entrenamiento

El sistema no es un transformer monolítico entrenado de cero, sino un grafo de componentes preentrenados conectados mediante un mecanismo de "conexiones aprendidas" que se entrena sobre una tarea sintética de selección de iconos. La entrada se compone de una captura de pantalla con una matriz 2x2, una instrucción breve que indica cuál de los dos audios debe considerarse y los dos archivos WAV mono PCM. La salida es una posición discreta entre cuatro celdas. El paquete integra los pesos de los diez modelos base junto con las conexiones aprendidas en un único archivo, de modo que el runtime puede ejecutarlo completamente offline.

El entrenamiento documentado emplea 64 ejemplos de entrenamiento, 24 de validación y 32 comandos reservados para evaluación. El autor informa de seis ciclos completos y de que, para la exportación, se eligió el ciclo 1 en función de los 24 ejemplos de validación. La comparación principal es entre el flujo sin aprendizaje de conexiones (13/32) y el paquete fusionado (23/32) sobre las mismas 32 tareas. Además, se reportan 27/48 y 32/64 en conjuntos de tareas nuevas. No se especifican en la información disponible detalles sobre el dataset de entrenamiento más allá de su carácter sintético, ni sobre el uso de RLHF o DPO.

## Capacidades

- Reconocimiento de voz en ruso e inglés mediante Qwen3-ASR-0.6B, con entrada de dos archivos WAV mono PCM.
- Percepción visual de una pantalla con cuatro iconos en disposición 2x2, apoyada en Qwen3-VL-2B-Instruct, OmniParser-v2.0 y Florence-2-base/Florence-2-base-ft.
- Detección y lectura de texto en pantalla mediante PP-OCRv5_mobile_det con reconocedores en inglés y eslavo, y PaddleOCR-VL para estructura de documentos.
- Selección de una celda entre cuatro a partir de una instrucción hablada que referencia uno de los dos audios de entrada.
- Ejecución completamente local y offline una vez instaladas las dependencias del runtime.
- Medición de tráfico interno mediante un contador de mensajes del grafo (2.144 bytes por tarea, excluyendo la subida de imagen, el tráfico del subproceso OCR y la sobrecarga del driver).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso general ni agentes autónomos más allá del flujo específico descrito.

## Casos de uso

- Automatización de interfaces con selección por voz: el paquete puede recibir una captura de una pantalla 2x2 y una instrucción hablada para devolver la celda objetivo, lo que encaja en prototipos de control por voz de paneles táctiles o menús simplificados.
- Evaluación de pipelines multimodales locales: sirve como banco de pruebas reproducible para medir el efecto de fusionar componentes de ASR, VLM y OCR frente a encadenarlos sin aprendizaje, con cifras concretas (13/32 frente a 23/32).
- Investigación en composición de modelos pequeños: permite estudiar cómo un ASR de 0,6B y un VLM de 2B, junto con OCR ligero, cubren una tarea perceptiva acotada sin recurrir a modelos de decenas de miles de millones de parámetros.
- Despliegue en entornos sin conectividad: al ejecutarse offline con `lopata-neuro` 1.2.0, es adecuado para escenarios de borde o instalaciones aisladas donde no se permite el envío de imágenes o audio a la nube.
- Docencia y demostraciones de arquitecturas de grafo: el contador de mensajes del grafo (2.144 bytes por tarea) y la separación entre componentes originales y conexiones aprendidas facilitan explicar el coste de comunicación interna de un sistema multimodal.
- Pruebas de accesibilidad por voz: la combinación de instrucción hablada y selección visual puede emplearse en prototipos de asistencia para usuarios que operan interfaces mediante voz, siempre dentro del alcance sintético y limitado del paquete.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Tareas independientes (sin aprendizaje de conexiones) | 13/32 |
| Paquete fusionado (con conexiones aprendidas) | 23/32 |
| Conjunto nuevo de 48 tareas | 27/48 |
| Conjunto nuevo de 64 tareas | 32/64 |
| Latencia media por tarea (modelos cargados, i9-13900KF + RTX 4090) | 2,74 s → 2,50 s |
| Trafico interno por tarea (contador de mensajes del grafo) | 2.144 bytes |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma desglosada; el paquete completo ocupa 10,2 GB en disco y combina un ASR de 0,6B, un VLM de 2B y varios modelos de OCR y parsing visual, por lo que se requiere una GPU con memoria suficiente para cargar todos los componentes simultáneamente.
- GPU recomendadas: el autor reporta mediciones en una RTX 4090; no se documentan pruebas en A100, H100 ni otras GPU.
- Cabe en GPU de consumo: sí, según la medición en RTX 4090; no se especifica compatibilidad con GPU de gama media o baja.
- Opciones de despliegue: runtime propietario `lopata-neuro` 1.2.0 (con rueda probada y release de código fuente); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 2,50 segundos por tarea con los modelos cargados en el equipo de prueba (i9-13900KF + RTX 4090); no se reporta throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LOPATA Neuroconstructor · Medium | No disponible (paquete de 10,2 GB) | No disponible | Grafo fusionado de ASR, VLM y OCR para selección 2x2 | Component-specific | Hugging Face, runtime `lopata-neuro` |
| Qwen3-VL-2B-Instruct | 2B | No disponible en esta ficha | VLM generalista | Según su model card original | Hugging Face |
| Qwen3-ASR-0.6B | 0,6B | No disponible en esta ficha | ASR | Según su model card original | Hugging Face |
| Florence-2-base | No disponible en esta ficha | No disponible | VLM/tareas visuales | Según su model card original | Hugging Face |

Los tres modelos de la comparativa son componentes internos del propio paquete, no alternativas equivalentes de extremo a extremo. No se dispone de datos para comparar con sistemas de selección visual guiada por voz de otros autores.

## Limitaciones y advertencias

- Alcance muy restringido: una única tarea sintética de selección entre cuatro celdas; no es un modelo de propósito general ni un asistente conversacional.
- Resultados medidos sobre un único equipo físico (i9-13900KF con RTX 4090) y con conjuntos pequeños (32, 48 y 64 tareas), por lo que la generalización es limitada.
- Idiomas declarados únicamente ruso e inglés; no se documenta soporte de castellano ni de otras lenguas.
- El contador de tráfico de 2.144 bytes por tarea excluye la subida de la imagen, el tráfico del subproceso OCR y la sobrecarga del driver, de modo que no representa el coste total de comunicación.
- Licencia `component-specific` con términos por componente en ATTRIBUTION.md; es imprescindible revisarlos antes de cualquier uso comercial, ya que cada modelo base puede imponer condiciones distintas.
- Formato de pesos propietario `.lopatanet`, ejecutable solo con `lopata-neuro` 1.2.0; no hay conversión documentada a safetensors, GGUF ni otros formatos estándar.
- Riesgo de alucinación y sesgos: no documentados por el autor; al tratarse de una tarea de clasificación discreta, el modo de fallo principal es la selección incorrecta de celda, no la generación de texto libre.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (23 de noviembre de 2026), lo que indica ausencia de validación externa independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LOPATA-AI-Hub/neuroconstructor-medium
- Descarga del artefacto: https://huggingface.co/LOPATA-AI-Hub/neuroconstructor-medium/resolve/main/LOPATA-medium-6.lopatanet?download=true
- Términos y atribución de componentes: https://huggingface.co/LOPATA-AI-Hub/neuroconstructor-medium/blob/main/ATTRIBUTION.md
- Demo de estudio y comparación de respuestas: https://huggingface.co/spaces/LOPATA-AI-Hub/neuroconstructor-study
- Instrucciones de ejecución: https://huggingface.co/spaces/LOPATA-AI-Hub/neuroconstructor-study/blob/main/RUN.md
- Estudio y ajustes: https://huggingface.co/spaces/LOPATA-AI-Hub/neuroconstructor-study/blob/main/STUDY.md
- Repositorio GitHub de LOPATA: https://github.com/PiTrolKun/LOPATA
- Perfil del autor en GitHub: https://github.com/PiTrolKun
- Canal de YouTube: https://youtube.com/@lopata_ai_hub
- Comunidad en VK: https://vk.ru/lopata_ai_localhub
