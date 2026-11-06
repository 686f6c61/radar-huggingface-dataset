# litert-community/MiniCPM-V-4.7-1B

## Resumen

MiniCPM-V-4.7-1B es un modelo de lenguaje y vision (VLM) de 1B parametros desarrollado por OpenBMB y publicado el 12 de octubre de 2026. El repositorio que nos ocupa, `litert-community/MiniCPM-V-4.7-1B`, es una conversion del modelo original al formato `.litertlm` para el runtime LiteRT-LM de Google, orientada a inferencia en dispositivo (on-device) en telefonos y equipos de sobremesa. La conversion la mantiene la comunidad litert-community y conserva la licencia Apache 2.0 del modelo base.

El modelo combina un decodificador de texto hibrido de estilo Qwen3.5 (18 capas de atencion lineal GatedDeltaNet y 6 capas de atencion completa, con dimension oculta 1024 y vocabulario de 248.094 tokens) con un codificador visual tipo SigLIP de 27 capas que comprime los tokens visuales dentro del propio codificador mediante mergers 2x2. El bundle distribuido en este repositorio cubre la ruta de imagen unica en modo Instruct (respuestas directas, sin modo thinking), con 64 tokens de imagen por mensaje tras comprimir una imagen de 448x448.

Su relevancia actual radica en que demuestra que un VLM de 1B puede ejecutarse en telefonos de gama alta y media con latencias utiles: en un Galaxy S26 el bundle de imagen devuelve el primer token 0,93 s despues de la peticion en GPU y decodifica texto a 36,5 tokens/s en CPU. El repositorio incluye tres variantes de pesos (con vision fp16, con vision int8 y solo texto) pensadas para distintos presupuestos de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM: decodificador de texto hibrido (18 capas GatedDeltaNet + 6 capas full-attention) + codificador visual SigLIP de 27 capas con window-attention merger |
| Parametros totales | 1B (aproximado, segun nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinamica por canal (decodificador de texto), int8 en tabla de embeddings, fp16 en codificador visual y adaptador, fp32 en las 36 proyecciones decay/gate de GatedDeltaNet; variante con codificador visual int8 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); tres ficheros: `MiniCPM-V-4.7-1B-VL_int8.litertlm` (2,21 GB), `MiniCPM-V-4.7-1B-VL_int8vis.litertlm` (1,70 GB), `MiniCPM-V-4.7-1B_int8.litertlm` (1,22 GB, solo texto) |

## Arquitectura y entrenamiento

El decodificador de texto es un transformer hibrido de estilo Qwen3.5: 24 capas en total, de las cuales 18 son de atencion lineal GatedDeltaNet y 6 de atencion completa. La dimension oculta es 1024 y el vocabulario de 248.094 tokens. Sobre el se monta un codificador visual tipo SigLIP de 27 capas que aplica un window-attention merger 2x2 tras la capa 6 y un segundo merger 2x2, comprimiendo los tokens visuales dentro del propio codificador (compresion total de 16x). El adaptador visual proyecta la salida del codificador al espacio del decodificador.

El bundle de LiteRT-LM implementa la ruta `fast_vlm`: una imagen por mensaje, redimensionada a 448x448 fija, que produce 64 tokens de imagen insertados en el prompt segun la plantilla de chat. Esto difiere del pipeline de Transformers en dos aspectos medidos sobre el modelo fp32 antes de la conversion: las imagenes mayores se redimensionan al cuadrado de 448x448 en lugar de dividirse en miniatura mas hasta nueve recortes, y el runtime alimenta posiciones 1-D planas, de modo que el M-RoPE del canvas del modelo colapsa a RoPE ordinario sobre los tokens de imagen. En ambos casos, las respuestas resultaron parafrasis del mismo contenido en 9 de 9 casos, sin errores factuales. No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Comprension de imagen unica: describir, identificar colores, localizar objetos y leer texto en imagenes (OCR ligero), con 64 tokens visuales por imagen y una imagen por conversacion.
- Generacion de texto y conversacion multi-turno en modo Instruct (respuestas directas, sin modo thinking).
- Razonamiento basico y respuesta a preguntas generales, verificado en pruebas de 8 preguntas con temperatura 0.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- No soporta video, prompts multi-imagen ni el modo de 4x ("finer detail") en este bundle.

## Casos de uso

- Asistencia visual en el movil: la app envia una foto de 448x448 y el modelo responde preguntas sobre ella (descripcion, colores, ubicacion de objetos, texto visible). Adecuado porque el bundle `_int8vis` de 1,70 GB cabe en telefonos Android de 8 GB con GPU Mali y se ha verificado en Pixel 8a.
- Lectura de etiquetas y documentos breves: el modelo transcribe y responde sobre texto contenido en una imagen, util para accesibilidad o digitalizacion rapida de tickets y carteles, aprovechando la ruta de imagen unica y el OCR ligero.
- Chat de texto en dispositivo sin conexion: con el fichero `MiniCPM-V-4.7-1B_int8.litertlm` (1,22 GB) se obtiene un asistente conversacional local de 1B en telefonos y portatiles, sin enviar datos a la nube.
- Clasificacion y moderacion de imagenes en el borde: preguntas de si/no sobre el contenido de una foto (por ejemplo, deteccion de texto sensible) con latencia de primer token inferior a 1 s en GPU de movil.
- Demos y prototipos de VLM embebido: validar flujos de vision-lenguaje en iOS (Metal) o Android antes de invertir en infraestructura de servidor, usando el runtime LiteRT-LM 0.18.0.
- Verificacion de calidad en pipelines de conversion: el repositorio documenta comparaciones de logits y correlaciones que sirven de referencia para equipos que convierten otros modelos a `.litertlm`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los datos de rendimiento medidos que si se documentan son los siguientes:

| Medicion | Entorno | Resultado |
|---|---|---|
| Primer token sobre foto 448x448 | Galaxy S26, GPU | 0,93 s |
| Decodificacion de texto | Galaxy S26, CPU | 36,5 tokens/s |
| Precisión de logits de texto (export float vs fp32, 48 posiciones) | Mac M4 Max | top-1 identico 48/48, Pearson 1.0000, max abs delta 5,3e-5 |
| Precisión de logits int8 (48 posiciones) | Mac M4 Max | top-1 identico 47/48 |
| Correlacion del codificador visual reescrito vs `get_image_features` (4 entradas 448x448, fp32) | Mac M4 Max | 0,99999999997 |
| Correlacion encoder fp16 + adaptador fp16 end-to-end | Mac M4 Max | 1,000000 |
| Correlacion encoder int8 | Mac M4 Max | 0,9954 (peor coseno por token 0,911) |
| 8 preguntas de texto, temperatura 0 | Mac M4 Max, CPU / GPU | 8/8 y 8/8 |
| 3 fotos x 3 preguntas | Mac M4 Max, CPU / GPU | 9/9 y 9/9 fundamentadas |
| 3 fotos | Pixel 8a, CPU, `_int8vis` | 3/3 fundamentadas |
| 8 preguntas de texto | iPhone 18 Pro, Metal / CPU | 8/8 y 7/8 |

## Requisitos de hardware

- VRAM/memoria: el fichero de imagen con vision fp16 ocupa 2,21 GB; la variante con vision int8, 1,70 GB; la de solo texto, 1,22 GB. Conviene prever margen adicional para activaciones y el runtime.
- GPU de movil: Galaxy S26 (GPU), iPhone 18 Pro (Metal) y telefonos Android de 12 GB en clase alta para el bundle `_int8`; Pixel 8a y telefonos de 8 GB con GPU Arm Mali para el bundle `_int8vis`, que evita el reinicio observado con codificador fp16 en conversiones anteriores.
- GPU de escritorio/servidor: probado en Mac M4 Max; no hay datos publicados para A100, H100 o RTX 4090, aunque por tamano el modelo cabe holgadamente en cualquier GPU consumer con 4 GB o mas.
- Opciones de despliegue: runtime LiteRT-LM 0.18.0 (comando `litert-lm run`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este repositorio.
- Latencia y throughput: 0,93 s hasta el primer token en GPU de Galaxy S26 y 36,5 tokens/s de decodificacion en CPU del mismo dispositivo; sin datos para otros equipos.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de MiniCPM-V-4.7-1B ni de sus alternativas en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales conocidas.

| Modelo | Parametros | Contexto | Vision | Licencia | Formato on-device |
|---|---|---|---|---|---|
| MiniCPM-V-4.7-1B (este repo) | 1B | no disponible | Si, imagen unica 448x448, 64 tokens | Apache 2.0 | `.litertlm` (LiteRT-LM) |
| openbmb/MiniCPM-V-4.7-1B (original) | 1B | no disponible | Si, incluye multi-imagen, video y modo 4x | Apache 2.0 | safetensors / Transformers |
| Alternativas de 1B-2B con vision | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El bundle solo procesa una imagen por conversacion y la redimensiona a 448x448; las imagenes grandes pierden detalle frente al pipeline con recortes del modelo original.
- No incluye video, prompts multi-imagen ni el modo de 4x ("finer detail"); para esos casos hay que usar el modelo original en Transformers.
- El M-RoPE del canvas colapsa a RoPE ordinario sobre tokens de imagen en este runtime, lo que produce parafrasis en lugar de respuestas identicas al modelo fp32 (sin errores factuales observados en 9 de 9 casos).
- La cuantizacion int8 introduce una discrepancia de top-1 en 1 de 48 posiciones y reduce la correlacion del codificador visual int8 a 0,9954.
- En iPhone 18 Pro la CPU acerto 7 de 8 preguntas frente a 8/8 en Metal; el rendimiento puede variar segun el backend.
- Riesgo de alucinacion inherente a modelos de 1B: no se documentan evaluaciones de fidelidad factual a gran escala.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles; el vocabulario es amplio (248.094 tokens) pero no se confirma cobertura multilingue.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del runtime LiteRT-LM y del modelo base por separado.
- El repositorio depende de litert-lm 0.18.0; versiones distintas del runtime pueden no cargar los ficheros correctamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/MiniCPM-V-4.7-1B
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Guia de reproduccion de la conversion: https://github.com/john-rocky/hf-to-litertlm/blob/main/REPRODUCE.md
- Manifiesto con datos legibles por maquina: https://huggingface.co/litert-community/MiniCPM-V-4.7-1B/blob/main/litertlm_manifest.json
