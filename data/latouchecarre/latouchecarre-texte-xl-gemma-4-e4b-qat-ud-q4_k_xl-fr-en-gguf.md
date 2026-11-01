# LaToucheCarre/LaToucheCarre-Texte-XL-Gemma-4-E4B-QAT-UD-Q4_K_XL-FR-EN-GGUF

## Resumen

LaToucheCarre-Texte-XL-Gemma-4-E4B-QAT-UD-Q4_K_XL-FR-EN-GGUF es una cuantizacion GGUF derivada de Gemma 4 E4B (version instruction-tuned con entrenamiento sensible a la cuantizacion, QAT) de Google DeepMind, publicada por Unsloth y posteriormente modificada por el desarrollador LaToucheCarre. El cambio principal no afecta a los pesos: se ha recortado el vocabulario de 262.144 a 158.833 tokens (eliminando 103.311, un 39,4 %), descartando aquellos cuya escritura no es latina ni compatible con frances o ingles. El objetivo es un modelo especializado en correccion gramatical y de estilo en frances e ingles, con menor huella de memoria.

El modelo resuelve un problema muy concreto: la correccion de texto en local sin salir de la maquina, orientada al asistente de escritura de sobremesa La Touche Carre. Al reducir las tablas de embedding (tanto `token_embd.weight` como `per_layer_token_embd.weight`, esta ultima especifica de Gemma 4), el archivo pasa de 4.216 MB a 3.437 MB y reduce la RAM de host que llama.cpp mantiene fuera de la GPU. Segun las mediciones del autor, mantiene el rendimiento de correccion (102 faltas detectadas sobre 104 etiquetadas, cero palabras corruptas) con menor consumo de memoria y generacion un 18 % mas rapida en CPU.

Es relevante para desarrolladores que necesiten un corrector gramatical bilingue FR/EN ligero, desplegable en consumer GPU o incluso solo en CPU, con licencia Apache 2.0 y formato GGUF listo para llama.cpp. No es un modelo generalista: el recorte de vocabulario lo inutiliza para idiomas no latinos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4 E4B), cuantizacion QAT UD-Q4_K_XL |
| Parametros totales | 6.087.737.642 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (medido por el autor con contexto de 8.192 tokens) |
| Tipos de cuantizacion | GGUF Q4_K_XL (dynamic quant, UD); el autor descarta Q2_K_XL por perdida de calidad |
| Idiomas soportados | frances (fr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 E4B en su variante instruction-tuned con QAT (quantization-aware training) de Google DeepMind. Sobre esa base, Unsloth genero la cuantizacion dinamica UD-Q4_K_XL en GGUF, y LaToucheCarre aplico una poda de vocabulario: de los 262.144 tokens originales se eliminan 103.311, conservando unicamente los de escritura latina o compatibles con frances e ingles. Las fusiones BPE se filtran en consecuencia y los tokens especiales se renumeran. No hay reentrenamiento ni recuantizacion: los pesos se mantienen intactos, solo se eliminan filas de las tablas de embedding (`token_embd.weight` y `per_layer_token_embd.weight`).

La innovacion tecnica destacable es el uso combinado de QAT (que reduce la perdida de calidad al cuantizar a 4 bits) y la poda de vocabulario, que reduce el tamano del archivo y, sobre todo, la RAM de host que llama.cpp reserva para las tablas de vocabulario. El autor documenta que se puede forzar el envio de esas tablas a la GPU con `--override-tensor "token_embd\.weight=CUDA0,per_layer_token_embd\.weight=CUDA0"`. No se dispone de informacion sobre el volumen de tokens de entrenamiento, composicion del dataset ni uso de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en frances e ingles.
- Correccion gramatical y ortografica: el caso de uso central, validado sobre 11 correos con 104 faltas etiquetadas.
- Correccion de estilo sin alterar palabras (cero palabras corruptas en las pruebas del autor).
- Razonamiento desactivable: el autor ejecuta las pruebas con razonamiento desactivado, lo que sugiere soporte de modo thinking.
- Conversacion multi-turno (tag `conversational`).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de llama.cpp y, por extension, del ecosistema GGUF (Ollama, etc.).
- No se documentan capacidades de vision, audio, tool calling ni agentes en la informacion disponible.

## Casos de uso

- Correccion gramatical local en un editor de escritorio: integrado en la aplicacion La Touche Carre, procesa correos y textos sin enviar datos a la nube, con 2.691 MB de VRAM en GPU o 3.557 MB de RAM en CPU.
- Revision de correos profesionales en frances e ingles: el modelo corrige faltas manteniendo el texto intacto, adecuado para entornos donde la fidelidad del texto original es critica.
- Asistente de dictado con postprocesado: tras la transcripcion de voz, el modelo limpia el texto dictado en local en equipos sin GPU dedicada.
- Despliegue en portatiles con GPU consumer: con 3.437 MB en disco y 2.691 MB de VRAM, cabe en tarjetas de gama media y permite correccion en tiempo real (8,0 s para 11 correos en una RTX 5090).
- Servicio de correccion por lotes en CPU: con 108 s para 11 correos y 19,5 tokens/s en un Ryzen 7 7800X3D, es viable para procesamiento por lotes nocturno sin hardware especializado.
- Filtro de calidad previo a publicacion: integrado en pipelines editoriales bilingues FR/EN para detectar faltas antes de enviar contenido a revision humana.
- Prototipado de asistentes de escritura offline: al ser Apache 2.0 y GGUF, sirve como base para productos que requieren privacidad total del texto.

## Benchmarks y rendimiento

El autor publica mediciones propias sobre 11 correos con 104 faltas etiquetadas, con llama.cpp, contexto 8.192, razonamiento desactivado y temperatura 0, en una RTX 5090 (Vulkan) y un Ryzen 7 7800X3D (16 hilos).

| Fichero | Modo | Disco | Faltas /104 | Palabras corruptas | VRAM | RAM host | 11 correos | Generacion |
|---|---|---|---|---|---|---|---|---|
| Este fichero (QAT UD-Q4_K_XL podado) | GPU | 3.437 MB | 102 | 0 | 2.691 MB | 1.134 MB | 8,0 s | 231 tok/s |
| Este fichero (QAT UD-Q4_K_XL podado) | CPU | 3.437 MB | 102 | 0 | 0 | 3.557 MB | 108 s | 19,5 tok/s |
| XL anterior (Q4_K_M podado) | GPU | 4.059 MB | 101 | 0 | 3.082 MB | 1.338 MB | 8,5 s | 219 tok/s |
| XL anterior (Q4_K_M podado) | CPU | 4.059 MB | 100 | 2 | 0 | 4.151 MB | 123 s | 16,6 tok/s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 2.691 MB en GPU segun medicion del autor (contexto 8.192, razonamiento desactivado).
- RAM de host en GPU: 1.134 MB; en modo solo CPU: 3.557 MB.
- GPU recomendadas: el autor prueba con RTX 5090 (Vulkan); por huella de memoria cabe en tarjetas consumer de gama media con 4 GB o mas de VRAM.
- Cabe en GPU consumer: si, con al menos 3-4 GB de VRAM libres.
- Opciones de despliegue: llama.cpp (probado); cualquier runtime compatible con GGUF (Ollama, etc.).
- Latencia y throughput: 231 tok/s en GPU (RTX 5090) y 19,5 tok/s en CPU (Ryzen 7 7800X3D); 8,0 s y 108 s respectivamente para procesar 11 correos.
- Nota: llama.cpp mantiene las tablas de vocabulario en CPU; para moverlas a GPU usar `--override-tensor "token_embd\.weight=CUDA0,per_layer_token_embd\.weight=CUDA0"`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Faltas /104 | Palabras corruptas | Licencia | Formato |
|---|---|---|---|---|---|---|
| Este modelo (QAT UD-Q4_K_XL podado) | 6,09 B | no disponible (probado a 8.192) | 102 | 0 | Apache 2.0 | GGUF |
| XL anterior (Q4_K_M podado) | no disponible | no disponible | 101 (GPU) / 100 (CPU) | 0 (GPU) / 2 (CPU) | Apache 2.0 | GGUF |
| QAT UD-Q2_K_XL (descartado) | no disponible | no disponible | 92 | 9-10 | Apache 2.0 | GGUF |
| Gemma 4 E4B it QAT (base, sin podar) | 6,09 B | no disponible | no disponible | no disponible | Apache 2.0 | GGUF |

No se dispone de comparaciones con modelos de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- El recorte de vocabulario elimina todos los tokens no latinos: el modelo no puede procesar correctamente arabe, cirilico, CJK, etc. Solo es valido para frances e ingles.
- La evaluacion de calidad se basa en 11 correos y 104 faltas etiquetadas, un conjunto muy pequeno y de dominio unico (correo electronico); no hay validacion en otros generos textuales.
- Riesgo de alucinacion no evaluado en la informacion disponible.
- No se han publicado benchmarks estandar, por lo que la calidad general del modelo base no esta cuantificada en esta ficha.
- La cuantizacion Q2_K_XL del mismo modelo pierde calidad de forma notable (92/104 faltas, 9-10 palabras corruptas), por lo que no se recomienda bajar de Q4.
- Las mediciones de rendimiento son del autor y en hardware concreto (RTX 5090, Ryzen 7 7800X3D); pueden no reproducirse en otros equipos.
- El modelo es una obra derivada de Gemma 4 E4B; Gemma es marca de Google y su uso esta sujeto a la licencia Apache 2.0 del modelo base, que permite uso comercial.
- No se documentan sesgos conocidos en la informacion disponible.

## Enlaces

- HuggingFace: https://huggingface.co/LaToucheCarre/LaToucheCarre-Texte-XL-Gemma-4-E4B-QAT-UD-Q4_K_XL-FR-EN-GGUF
- Modelo base QAT GGUF (Unsloth): https://huggingface.co/unsloth/gemma-4-E4B-it-qat-GGUF
- Modelo original (Google): https://huggingface.co/google/gemma-4-E4B-it
- Sitio del producto: https://latouchecarre.fr
