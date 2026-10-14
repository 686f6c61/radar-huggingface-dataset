# PedroMarinhoDev/Qwen3-ASR-ComfyUI

## Resumen

PedroMarinhoDev/Qwen3-ASR-ComfyUI es un repositorio de conversion (no un modelo entrenado desde cero) que reempaqueta los pesos de Qwen3-ASR en formato safetensors para su uso con los nodos nativos de ComfyUI-Drama3. El autor distribuye dos variantes del modelo base de Qwen: Qwen3-ASR-1.7B y Qwen3-ASR-0.6B, cada una en un unico fichero bf16, para tareas de reconocimiento automatico del habla (ASR) dentro de flujos de ComfyUI.

El objetivo es evitar dependencias Python adicionales: los nodos ejecutan Qwen3-ASR sobre el decodificador Qwen3 ya presente en ComfyUI, junto a un codificador de audio nativo. El modelo resuelve transcripcion de voz a texto en 30 idiomas y 22 dialectos chinos, incluyendo canto, y esta pensado para integrarse en el nodo Encode Voice de Drama 3 o en cualquier audio de entrada del flujo.

Se trata de un modelo de audio-condicionado (audio encoder + decoder transformer) con dos tamanos de parametros (aproximadamente 1,7B y 0,6B). La licencia es Apache 2.0, heredada de los modelos originales de Qwen, y el repositorio no esta afiliado ni respaldado por el equipo de Qwen. Tiene cero descargas y cero likes en el momento de la consulta, por lo que es un artefacto reciente y de nicho orientado a usuarios de ComfyUI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio encoder + decoder transformer (base Qwen3); encoder bajo `audio_tower.`, decoder bajo `decoder.model.` |
| Parametros totales | 1,7B (variante grande) / 0,6B (variante pequena) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (unicos ficheros publicados) |
| Idiomas soportados | 30 idiomas y 22 dialectos chinos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`qwen3_asr_1.7b_bf16.safetensors` 4,1 GB; `qwen3_asr_0.6b_bf16.safetensors` 1,6 GB) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-ASR de Qwen: un codificador de audio seguido de un decodificador transformer tipo Qwen3. El repositorio no entrena ni modifica los pesos: toma los tensores bf16 originales sin cambios y los reempaqueta con su herramienta `tools/convert.py asr`, situando el encoder de audio bajo el prefijo `audio_tower.` y el decodificador bajo `decoder.model.`. La cabeza LM se omite porque coincide con la tabla de embeddings (verificado tensor a tensor), y la configuracion del modelo se guarda en los metadatos del fichero.

No se dispone de informacion detallada sobre el dataset de entrenamiento original (numero de tokens, composicion, uso de RLHF/DPO) en la documentacion proporcionada. Como innovacion practica destacable, el autor documenta una comparacion frente al paquete `qwen-asr` de Qwen: los ids del prompt son identicos, la salida del encoder coincide dentro de 1e-6 en fp32, el primer token generado es el mismo y las transcripciones coinciden en clips de hasta 8 s. En clips mas largos el encoder atiende en ventanas de 8 s, igual que el backend vLLM de Qwen (su backend transformers atiende al clip completo), lo que puede alterar una coma.

## Capacidades

- Reconocimiento automatico del habla (speech-to-text) sobre cualquier audio de entrada.
- Cobertura de 30 idiomas y 22 dialectos chinos.
- Transcripcion de canto, segun la model card.
- Deteccion automatica del idioma o forzado manual mediante el parametro `language`.
- Parametro `context` para introducir nombres y terminos que mejoran el reconocimiento.
- Devolucion conjunta del texto transcrito y del idioma detectado.
- Integracion nativa en ComfyUI mediante los nodos Load Qwen3-ASR y Qwen3-ASR Transcribe, sin paquetes Python adicionales.
- Escritura directa de la transcripcion en el nodo Encode Voice de Drama 3.

## Casos de uso

- Subtitulado automatizado en flujos de ComfyUI: el nodo Load Qwen3-ASR mas Qwen3-ASR Transcribe devuelve el texto y el idioma de un clip, lo que permite generar subtitulos con deteccion automatica de idioma.
- Doblaje y clonado de voz en Drama 3: la transcripcion se inserta directamente en Encode Voice, cerrando el bucle entre reconocimiento y sintesis dentro del mismo grafo.
- Transcripcion de contenido multilingue: con 30 idiomas y 22 dialectos chinos, cubre audio en varios idiomas sin cambiar de modelo.
- Procesado de audio musical con voz: la capacidad declarada de transcribir canto permite extraer letras de clips cantados.
- Transcripcion asistida por contexto: usando el parametro `context` con nombres propios, marcas o jerga tecnica se mejora la precision en dominios especializados.
- Prototipado rapido de pipelines ASR en local: al ejecutarse con el decodificador Qwen3 propio de ComfyUI, no requiere instalar dependencias adicionales.
- Preprocesado para analisis de audio a granel: la variante 0.6B transcribe habla limpia de forma casi identica a la 1.7B en la mitad de tiempo, util para lotes grandes donde prima el rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La unica medicion aportada por el autor es de latencia, no de calidad: en una RTX 3090, un clip de 6,6 s tarda aproximadamente 2 s con el modelo 1.7B y aproximadamente 1 s con el 0.6B, incluyendo la carga del modelo. No se ofrecen cifras de WER, MMLU ni otras metricas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,1 GB para el fichero 1.7B bf16 y 1,6 GB para el 0.6B bf16 (tamano del fichero de pesos; la VRAM real depende del runtime y debe sumar overhead).
- GPU recomendadas: el autor cita una RTX 3090 como referencia. Cualquier GPU consumer con al menos 6-8 GB de VRAM deberia poder cargar cualquiera de las dos variantes.
- Cabe en GPU consumer: si, ambas variantes por su tamano (1,6 GB y 4,1 GB de pesos).
- Opciones de despliegue: los nodos de ComfyUI-Drama3 sobre el decodificador Qwen3 nativo de ComfyUI. El autor menciona que Qwen dispone de backends vLLM y transformers, pero el fichero esta pensado para ComfyUI.
- Latencia: en RTX 3090, ~2 s (1.7B) y ~1 s (0.6B) para un clip de 6,6 s, carga del modelo incluida. No se aportan datos de throughput.

## Comparativa con modelos similares

| Variante | Parametros | Formato | Tamano | Licencia | Rendimiento declarado |
|---|---|---|---|---|---|
| Qwen3-ASR 1.7B (este repo) | ~1,7B | safetensors bf16 | 4,1 GB | Apache 2.0 | ~2 s para clip de 6,6 s en RTX 3090 |
| Qwen3-ASR 0.6B (este repo) | ~0,6B | safetensors bf16 | 1,6 GB | Apache 2.0 | ~1 s para clip de 6,6 s en RTX 3090; transcripciones casi identicas en habla limpia |

No se dispone de datos de benchmarks ni de comparativas con alternativas externas (por ejemplo otros modelos ASR) en la informacion proporcionada. La comparativa con modelos de la misma categoria queda como no disponible.

## Limitaciones y advertencias

- No es un modelo nuevo: es un reempaquetado de los pesos de Qwen3-ASR; cualquier limitacion del modelo original se hereda.
- No se han publicado benchmarks de calidad (WER u otros), por lo que el rendimiento real en produccion no esta cuantificado.
- En clips de mas de 8 s el encoder atiende por ventanas de 8 s, a diferencia del backend transformers de Qwen (que atiende al clip completo); segun el autor esto puede alterar puntuacion, como una coma.
- La cabeza LM coincide con la tabla de embeddings y se ha omitido del fichero: el decodificador debe aportarla desde ComfyUI. Cualquier discrepancia en el runtime puede afectar a la salida.
- La longitud de contexto no esta documentada.
- El modelo esta pensado para ComfyUI y sus nodos; su uso fuera de ese entorno no esta soportado por el autor.
- Cero descargas y cero likes: artefacto sin validacion comunitaria ni historial de uso.
- Aunque la licencia Apache 2.0 permite uso comercial, el repositorio no esta afiliado ni respaldado por el equipo de Qwen; conviene revisar LICENSE y NOTICE de los modelos originales.
- Riesgo de sesgos y alucinacion: no documentado en la informacion disponible; al ser un modelo de transcripcion, errores de reconocimiento son posibles, especialmente en audio con ruido, acentos o dominios especializados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/PedroMarinhoDev/Qwen3-ASR-ComfyUI
- Modelo original (1.7B): https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Modelo base 0.6B: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Nodos en GitHub (ComfyUI-Drama3): https://github.com/PedroMarinhoDev/ComfyUI-Drama3
- Drama 3 para ComfyUI: https://huggingface.co/PedroMarinhoDev/Drama-3-ComfyUI
- Organizacion Qwen en GitHub: https://github.com/QwenLM/Qwen3-ASR
- Referencia externa (indice de nodos ComfyUI): https://wanaigc.com/nodes
- Referencia externa (articulos ComfyUI): https://vfx-desk.com/tags/ComfyUI
