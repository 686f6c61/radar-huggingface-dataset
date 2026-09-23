# duyleekun/Vintern-1B-v3_5-BF16-GGUF

## Resumen

Vintern-1B-v3_5-BF16-GGUF es una conversion a formato GGUF del modelo multimodal 5CD-AI/Vintern-1B-v3_5, publicada por el usuario duyleekun. No es un fine-tune nuevo ni una cuantizacion de bajo bit: se trata de una conversion comunitaria en BF16 (con algunos tensores conservados en F32) cuyo objetivo es hacer funcionar el modelo original dentro de llama.cpp con metadatos y geometria de embeddings corregidos. El modelo original y su entrenamiento pertenecen a 5CD-AI, y su base es InternVL2.5-1B.

El interes de esta ficha no esta tanto en el modelo como en el artefacto: la conversion corrige dos fallos que rompian el caso de uso principal. Por un lado, el checkpoint original guarda el identificador de fin de secuencia en `llm_config`, una clave que el convertidor fijado no consultaba; el GGUF resultante carecia de ese metadato y llama.cpp caia por defecto en el token 11 (coma), lo que truncaba severamente las salidas de OCR. Por otro, el encoder visual de InternVL antepone el token CLS a los parches de imagen, mientras que la implementacion de llama.cpp lo pospone, de modo que el proyector incluido rota unicamente `v.position_embd.weight` para alinear la disposicion de posiciones sin alterar ningun valor.

Se trata de un modelo pequeno (el recuento de safetensors disponible es de 629.697.920 parametros, correspondiente al modelo de lenguaje, mas el encoder visual distribuido aparte en el fichero `mmproj`), orientado a OCR y comprension de documentos en vietnamita, con soporte declarado tambien de ingles y chino. Su relevancia actual esta en que permite ejecutar OCR multimodal en hardware muy modesto y de forma local, a costa de depender de un runtime muy concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal tipo InternVL2.5: encoder visual (InternViT-300M-448px con tiling dinamico) + proyector MLP + modelo de lenguaje decoder |
| Parametros totales | 629.697.920 segun el recuento de safetensors disponible (modelo de lenguaje); el encoder visual y proyector se distribuyen aparte en `mmproj-Vintern-cls-last-BF16.gguf` (621.080.608 bytes en BF16, equivalente aproximado a 310 M de parametros por tamano de fichero). El nombre comercial del modelo indica 1 B |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible como valor nativo declarado; el preset de referencia de llama-router y el comando de `llama-server` usan 8192 tokens |
| Tipos de cuantizacion | BF16 sin cuantizacion de bajo bit; algunos tensores permanecen en F32. No se publican variantes Q4/Q5/Q8 |
| Idiomas soportados | vietnamita (vi), ingles (en), chino (zh) |
| Licencia | MIT (declarada en la model card del modelo original) |
| Formato de pesos | GGUF en dos ficheros (`Vintern-eos-fixed-BF16.gguf` y `mmproj-Vintern-cls-last-BF16.gguf`) mas plantilla de chat `vintern-exact.jinja` y `SHA256SUMS` |

## Arquitectura y entrenamiento

La arquitectura hereda de InternVL2.5-1B: un encoder visual de 300 M de parametros a 448 px que procesa la imagen por mosaicos (tiles) dinamicos, con un maximo de 12 parches por imagen, seguido de un proyector que traduce las representaciones visuales al espacio del modelo de lenguaje, y un decoder Transformer que genera el texto. La conversion usa normalizacion ImageNet y sigue el ejemplo de inferencia del repositorio original. Sobre el numero de tokens de entrenamiento, la composicion del dataset y el uso de RLHF o DPO no hay informacion en la documentacion proporcionada: el modelo es un fine-tune de 5CD-AI sobre InternVL2.5-1B del que esta ficha no dispone de detalles de entrenamiento.

La innovacion tecnica relevante de este artefacto es de ingenieria de conversion, no de entrenamiento. La correccion del metadato EOS incrusta `<|im_end|>` con el identificador 151645 en lugar del token 11 por defecto, y el parche del convertidor preserva la precedencia `root` / `text_config` y anade la busqueda en `llm_config`. La rotacion del tensor de posiciones (`v.position_embd.weight`, de `[CLS, patches...]` a `[patches..., CLS]`) adapta el proyector al layout CLS-last de la implementacion de llama.cpp fijada (commit `c550d2f60bde72df19fcef1fef627895095b8ba8`, build 11096). Todo ello sin modificar los valores de los pesos ni el orden de los parches.

## Capacidades

- Generacion de texto e image-text-to-text: responde a instrucciones acompanando una imagen como entrada.
- OCR de documentos en vietnamita, con soporte declarado tambien de ingles y chino; es el caso de uso central del modelo.
- Comprension de documentos escaneados con estructura (paginas completas, formularios, capturas de pantalla) mediante mosaicos de 448 px y hasta 12 parches.
- Conversacion multiturno con contexto de imagen, con separadores de turno definidos por la plantilla `vintern-exact.jinja`.
- Prompt de sistema en vietnamita incluido en el cliente de referencia (`scripts/ocr.py`), orientado a transcripcion.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo no esta orientado a ese uso.
- Capacidades de audio o video: no disponibles.
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Digitalizacion de documentos administrativos vietnamitas: el modelo transcribe paginas escaneadas en vietnamita y puede alimentar un pipeline de indexacion posterior; su tamano reducido permite procesar lotes grandes en una sola GPU modesta.
- Extraccion de datos de facturas y recibos: enviando la imagen al endpoint compatible con OpenAI que levanta `llama-server`, se obtiene texto que despues se parsea con reglas o expresiones regulares para poblar una base de datos contable.
- Procesamiento OCR en local por privacidad: al ocupar aproximadamente 1,9 GB en disco y caber en GPUs de gama baja, se puede ejecutar en una estacion de trabajo o portatil sin enviar documentos sensibles a servicios externos.
- Preprocesado de corpus multilingue (vi/en/zh) para entrenamiento o busqueda: transcripcion masiva de imagenes antes de pasarlas a un motor de recuperacion o a un modelo mayor.
- Asistencia a la traduccion en soporte al cliente: dado que el modelo maneja vietnamita, ingles y chino, sirve para transcribir capturas o documentos que luego se traducen o resumen con otro sistema.
- Prototipado e investigacion en vision-lenguaje: por su licencia MIT y su tamano, es util como banco de pruebas para evaluar tecnicas de OCR, prompting o conversiones GGUF antes de escalar a modelos mayores.
- Extraccion de texto en aplicaciones de campo: despliegue en un equipo con GPU integrada para leer documentos en movilidad, siempre que se acepte un limite de salida de 2048 tokens configurable.
- Verificacion de integridad de conversiones: el repositorio incluye `SHA256SUMS` y un cliente de referencia, lo que permite validar la reproducibilidad de artefactos GGUF en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2 GB para los pesos (1.265.478.720 bytes del modelo de lenguaje mas 621.080.608 bytes del proyector en BF16), mas la cache KV correspondiente al contexto configurado y los buffers de procesamiento de imagen. En la practica, un entorno de 3-4 GB de VRAM es suficiente para el preset de 8192 tokens.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 o H100, donde quedaria muy infrautilizada; tambien es viable en tarjetas de gama de entrada y en GPUs integradas con suficiente memoria compartida.
- Cabe en GPU de consumo: si, es uno de sus principales atractivos. El comando de referencia descarga todas las capas en GPU con `--n-gpu-layers 99` y `--flash-attn on`.
- Opciones de despliegue: llama.cpp (`llama-server` o `llama-router`) en el commit fijado `c550d2f60bde72df19fcef1fef627895095b8ba8` (build 11096) con soporte CUDA. La compatibilidad con otras versiones de llama.cpp, con Ollama, vLLM o TGI no ha sido establecida por el autor.
- Ficheros obligatorios: los dos GGUF y la plantilla jinja deben usarse juntos; el proyector y la plantilla no son opcionales.
- Latencia y throughput: no disponibles. El cliente de referencia usa temperatura 0, `repeat penalty` 1.1 y un limite de salida de 2048 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| duyleekun/Vintern-1B-v3_5-BF16-GGUF (este) | 629.697.920 (LM) + proyector aparte | no disponible (preset de 8192) | vi, en, zh | MIT | GGUF BF16 | Comunitaria, llama.cpp fijado |
| 5CD-AI/Vintern-1B-v3_5 (original) | no disponible en la informacion | no disponible | vi, en, zh | MIT | safetensors (original) | Repositorio oficial de 5CD-AI |
| InternVL2.5-1B (base upstream) | no disponible en la informacion | no disponible | no disponible | no disponible en la informacion | safetensors | Repositorio oficial de OpenGVLab |

No se dispone de resultados de benchmarks comparativos entre estas variantes en la informacion proporcionada, por lo que la comparacion se limita a parametros, formato y licencia. En la practica, la diferencia funcional clave frente al checkpoint original es la correccion del metadato EOS y del layout de posiciones del encoder visual, que evitan el truncado del OCR en llama.cpp.

## Limitaciones y advertencias

- Riesgo de alucinacion en OCR: la propia model card advierte de que el OCR puede omitir, alterar o inventar texto, y recomienda revisar las salidas contra la imagen original.
- Restriccion de runtime severa: el proyector suministrado esta construido para el layout CLS-last de la implementacion fijada de llama.cpp. Un runtime que anteponga CLS exige el proyector original sin rotar, y no se debe combinar el parche del proyector con una correccion del runtime que cambie a CLS-first. La compatibilidad con otras versiones no esta establecida.
- Rendimiento degradado si falta el metadato EOS: usar el GGUF sin la correccion hace que el runtime recurra al token 11 (coma), lo que trunca las respuestas.
- Limite de salida: el cliente de referencia fija 2048 tokens de salida; las paginas largas pueden requerir un limite mayor, con el consiguiente aumento de memoria y tiempo.
- Sesgo linguistico: el modelo esta optimizado para vietnamita, con soporte secundario de ingles y chino; el rendimiento en castellano o en otras lenguas no esta documentado y previsiblemente sera pobre.
- Capacidad limitada por tamano: con alrededor de 630 M de parametros en el modelo de lenguaje, no es adecuado para razonamiento complejo, matematicas, generacion de codigo ni tareas de agente multi-paso.
- Licencia: MIT, lo que permite uso comercial, pero la model card advierte de que el repositorio fuente en la revision fijada no incluye un fichero LICENSE separado; conviene verificar la procedencia antes de un despliegue en produccion.
- Comunidad y soporte: el repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y esta publicado por un autor comunitario, no por 5CD-AI. No hay garantias de mantenimiento.
- Datos de entrenamiento y sesgos: no disponibles, lo que impide evaluar la composicion del dataset y los sesgos asociados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/duyleekun/Vintern-1B-v3_5-BF16-GGUF
- Modelo base: https://huggingface.co/5CD-AI/Vintern-1B-v3_5
- Revision fijada del checkpoint original: https://huggingface.co/5CD-AI/Vintern-1B-v3_5/tree/b98f263eab246eb5269ade64edbdca8a887dc44d
- Model card del modelo original en esa revision: https://huggingface.co/5CD-AI/Vintern-1B-v3_5/blob/b98f263eab246eb5269ade64edbdca8a887dc44d/README.md
- Instrucciones de reproduccion de la conversion: https://huggingface.co/duyleekun/Vintern-1B-v3_5-BF16-GGUF/blob/main/REPRODUCE.md
- llama.cpp en el commit fijado: https://github.com/ggml-org/llama.cpp/tree/c550d2f60bde72df19fcef1fef627895095b8ba8
- Licencia de llama.cpp en ese commit: https://github.com/ggml-org/llama.cpp/blob/c550d2f60bde72df19fcef1fef627895095b8ba8/LICENSE
- Cliente de OCR de referencia del repositorio: scripts/ocr.py (incluido en el repositorio del modelo)
