# Bobliu/tenpct-l1-bonsai8b-grow

## Resumen

tenpct-l1-bonsai8b-grow es un artefacto experimental publicado por el usuario Bobliu como entrada L1 del denominado "10% challenge". No es un modelo entrenado desde cero, sino un reempaquetado sin pérdida (bit-exact) de `prism-ml/Bonsai-8B-unpacked`, que a su vez deriva de `Qwen/Qwen3-8B`. El resultado es una representación nativa de 1 bit (bits de signo más escalas de grupo en fp16) que ocupa 1.168.130.816 bytes, es decir, un 7,131% del tamaño de Qwen3-8B en fp16 (16.381.470.720 bytes). Tras aplicar el mecanismo de feedback, el total asciende a 1.172.851.508 bytes (7,1596%).

El modelo resuelve una tarea concreta: enrutar peticiones de un asistente de voz hacia una de siete habilidades (Alarm, Calendar, Lists, Music, News, Transport, Weather) mediante generación greedy simple. Además, incorpora un mecanismo de aprendizaje de una palabra de habilidad nueva (el ejemplo documentado es `Recipe`) a partir de un máximo de 25 anotaciones de errores, mediante una edición en forma cerrada de tensores existentes, sin gradientes ni optimizador, y sin almacenar las anotaciones.

Su relevancia es fundamentalmente metodológica: demuestra que es posible comprimir un modelo de 8B a un 7% de su tamaño en una representación de 1 bit, conservando exactamente las respuestas correctas del modelo base, y añadir capacidades nuevas con un coste de cómputo y almacenamiento mínimo. No obstante, se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin benchmarks generales publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-8B), pesos reempaquetados en formato nativo de 1 bit (bits de signo + escalas de grupo fp16) |
| Parametros totales | 8B (heredados de Qwen3-8B; el artefacto no reentrena el modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 1 bit nativo (sign bits + fp16 group scales); reempaquetado sin pérdida respecto a `prism-ml/Bonsai-8B-unpacked` |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, tokenizer, config, fichero de calibración, manifiesto de tensores y código Python (`answer.py`, `feedback.py`); parche opcional `patch.pt` |

## Arquitectura y entrenamiento

El modelo no introduce una arquitectura nueva: es un transformer denso Qwen3-8B cuyos pesos han sido reempaquetados de forma bit-exacta en una representación de 1 bit. Cada peso se codifica con un bit de signo más una escala de grupo en fp16, lo que reduce el artefacto a 1,2 GB aproximadamente. El autor indica explícitamente que el modelo de partida no ha sido comprimido por él, sino que parte de `prism-ml/Bonsai-8B-unpacked`, ya en formato Bonsai.

La innovación principal no está en el entrenamiento sino en el mecanismo de feedback: a partir de un máximo de 25 filas anotadas (`{"text": ..., "label": ...}`), donde la etiqueta puede ser una palabra nueva, el script `feedback.py` realiza una edición en forma cerrada de tensores existentes, sin descenso de gradiente ni optimizador, y genera un `patch.pt` de 4.720.692 bytes (portador `scale` por defecto) o de mayor tamaño con `--carrier cols`. Las anotaciones no se almacenan y un fichero de anotaciones vacío elimina el parche, devolviendo el árbol a su estado original. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Enrutamiento de intenciones de asistente de voz hacia siete habilidades predefinidas: Alarm, Calendar, Lists, Music, News, Transport y Weather, mediante generación greedy.
- Aprendizaje de una palabra de habilidad nueva (por ejemplo, `Recipe`) a partir de un máximo de 25 anotaciones de errores, sin reentrenamiento.
- Retención exacta de las respuestas correctas del modelo base: la salida es idéntica a la de la release original en el examen bloqueado.
- Generación de texto general heredada de Qwen3-8B (capacidad no evaluada en la información disponible).
- Soporte de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código y capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Enrutamiento de comandos de voz en asistentes domésticos: el modelo clasifica una frase como "wake me at six" o "play some jazz" y la asigna a la habilidad correspondiente con generación greedy, lo que permite un pipeline determinista y de baja latencia.
- Añadir habilidades nuevas sin reentrenar: un equipo puede recoger hasta 25 ejemplos mal clasificados de una habilidad emergente (por ejemplo, recetas de cocina) y aplicar `feedback.py` para generar un parche de menos de 5 MB, sin tocar los pesos originales.
- Despliegue en dispositivos con memoria limitada: al ocupar 1,2 GB, el artefacto cabe en GPUs de consumo y en entornos embebidos donde un Qwen3-8B en fp16 (16 GB) no cabría.
- Investigación sobre compresión extrema: sirve como referencia reproducible para estudiar la pérdida de calidad al pasar de fp16 a 1 bit con escalas de grupo, gracias al examen bloqueado de 2744 ítems y a los ficheros con sha256 por archivo.
- Experimentación con aprendizaje sin gradientes: el mecanismo de edición en forma cerrada es un caso de estudio para técnicas de adaptación de modelos con presupuesto de anotación mínimo.
- Validación de pipelines de feedback en producción: el ciclo `answer.py` → anotación → `feedback.py` → `answer.py` permite medir la tasa de acierto tras el parche sobre un conjunto de test bloqueado, con control de etiquetas barajadas.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Retención de respuestas correctas del modelo base (examen bloqueado, 2744 ítems, 7 habilidades) | 1,000 (salidas idénticas a la release) |
| Feedback sobre conjunto de enseñanza bloqueado (164 ítems `Recipe` no vistos) | aproximadamente 0,89-0,91 enseñados |
| Habilidades vecinas conservadas tras el feedback | aproximadamente 0,995 |
| Control con etiquetas barajadas | aproximadamente 0,005 |
| Tamaño del árbol sin feedback | 1.168.130.816 B (7,131% de Qwen3-8B fp16) |
| Tamaño total tras feedback (portador `scale`) | 1.172.851.508 B (7,1596%) |
| Tamaño total con portador `cols` | 1.218.478.299 B (7,4381%) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la información disponible. El autor advierte que varias reglas del examen son lecturas "GRAY" y remite al informe del repositorio para los detalles y matices.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 17 GB según las instrucciones del autor (GPU CUDA con `torch==2.5.1`, `transformers==4.56.2`, `numpy` y `accelerate`).
- GPU recomendadas: no se especifican modelos concretos; se requiere una GPU CUDA con al menos 17 GB de memoria, lo que incluye A100, H100 y RTX 4090 (24 GB).
- Cabe en GPU de consumo: sí, en RTX 4090 y previsiblemente en RTX 3090 (24 GB); no cabe en GPUs de 16 GB o menos según el requisito declarado.
- Opciones de despliegue: el autor proporciona scripts propios (`answer.py`, `feedback.py`) sobre `transformers`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tenpct-l1-bonsai8b-grow | 8B | no disponible | 1 bit nativo (sign bits + escalas fp16) | Apache-2.0 | Hugging Face, 0 descargas |
| prism-ml/Bonsai-8B-unpacked | 8B | no disponible | Bonsai (modelo de partida) | Apache-2.0 | Hugging Face |
| Qwen/Qwen3-8B | 8B | no disponible | fp16 (16,38 GB) | Apache-2.0 | Hugging Face |

La comparación se limita a la cadena de derivación declarada por el autor. No se dispone de datos de rendimiento de Bonsai-8B-unpacked ni de Qwen3-8B en la información proporcionada, por lo que no es posible comparar calidad de forma cuantitativa.

## Limitaciones y advertencias

- Artefacto de investigación con cero descargas y cero likes: no hay evidencia de uso en producción ni validación independiente.
- El examen bloqueado tiene 2744 ítems y el conjunto de enseñanza de feedback solo 164 ítems `Recipe`; el propio autor califica varias reglas como lecturas "GRAY", lo que limita la solidez de las cifras.
- El aprendizaje de habilidades nuevas está acotado a un máximo de 25 anotaciones y a una única palabra de habilidad en el ejemplo documentado; no se ha demostrado que escale a muchas habilidades simultáneas.
- No se documentan idiomas soportados, longitud de contexto ni capacidades generales (código, matemáticas, tool calling); no deben asumirse.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al heredar los pesos de Qwen3-8B, arrastra los sesgos del modelo original sin que el autor los analice.
- La licencia Apache-2.0 permite uso comercial, pero se incluyen `LICENSE` y `NOTICE.txt` de Prism ML y del equipo Qwen de Alibaba que deben conservarse; el autor atribuye explícitamente la creación a Bonsai de Prism ML.
- El parche `patch.pt` no está incluido en el repositorio: debe generarse localmente con `feedback.py` a partir de las anotaciones.
- El repositorio ocupa 1,2 GB y requiere descarga completa del árbol de pesos para su uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bobliu/tenpct-l1-bonsai8b-grow
- Repositorio del reto (código, resultados, examen bloqueado e informe): https://github.com/Bobliuuu/ten-percent-challenge
- Informe L1: `v2/lanes/L1/REPORT.md` dentro del repositorio anterior
- Manifiesto L1: `v2/lanes/L1/MANIFEST.json` dentro del repositorio anterior
- Examen bloqueado con sha256 por archivo: `v2/exam/MANIFEST.json` dentro del repositorio anterior
- Modelo de partida: https://huggingface.co/prism-ml/Bonsai-8B-unpacked
- Modelo original: https://huggingface.co/Qwen/Qwen3-8B
