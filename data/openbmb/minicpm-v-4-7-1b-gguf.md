# openbmb/MiniCPM-V-4.7-1B-gguf

## Resumen
MiniCPM-V-4.7-1B-gguf es la distribucion cuantizada en formato GGUF (llama.cpp) del modelo multimodal MiniCPM-V-4.7-1B, desarrollado por OpenBMB. Se trata de un modelo de vision-lenguaje de aproximadamente 1.000 millones de parametros nominales (la variante "1B" de la familia), publicado bajo licencia Apache 2.0 y orientado explicitamente a inferencia en dispositivo ("on-device"). El repositorio no contiene pesos nuevos: aloja las conversiones cuantizadas del modelo base `openbmb/MiniCPM-V-4.7-1B`, con un tamano de repositorio de 33,8 GB que refleja la coexistencia de multiples niveles de cuantizacion.

El modelo resuelve el problema de ejecutar comprension de imagen y video con un presupuesto computacional muy reducido. Combinando un encoder visual SigLIP con compresion temprana intra-ViT (tecnica heredada de LLaVA-UHD v4) y un backbone de lenguaje Qwen3.5, ofrece modos de compresion de tokens visuales de 4x y 16x que permiten al desarrollador intercambiar detalle visual por coste de inferencia. Segun la model card, la variante 1B en modo Instruct mejora las capacidades base respecto a MiniCPM-V 4.6 y supera de forma sustancial a Qwen3.5 0.8B tanto en puntuacion global como en eficiencia de inferencia.

Su relevancia actual radica en el soporte de despliegue amplio (iOS, Android, HarmonyOS, y plataformas de chip de Rockchip, Houmo, Intel, AMD y Arm con soporte desde el dia 0) y en la compatibilidad con los marcos mas habituales (SGLang, vLLM, llama.cpp, Ollama, OpenVINO), ademas de variantes cuantizadas GGUF, BNB, AWQ, GPTQ y FP8. La fecha de publicacion indicada en las fuentes de busqueda es el 12 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder visual SigLIP con merger de ventana (window-attention) + backbone de lenguaje Qwen3.5; transformer multimodal con compresion intra-ViT temprana |
| Parametros totales | 1.006.209.856 segun el recuento de safetensors de HuggingFace; la fuente datalearner indica 1.554.476.272 parametros contando el peso completo y la grafica oficial de evaluacion etiqueta 1,3B. La denominacion comercial es "1B" |
| Parametros activos | No aplica (no es MoE; la variante MoE de la serie es 35B-A3B, distinta de este modelo) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (este repositorio); la serie ofrece ademas BNB, AWQ, GPTQ y FP8 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo actual); pesos originales en safetensors BF16 en el modelo base |

## Arquitectura y entrenamiento
La arquitectura sigue el esquema multimodal de la serie MiniCPM-V: un encoder visual SigLIP provisto de un merger con atencion de ventana, acoplado a un backbone de lenguaje Qwen3.5. La innovacion principal es la compresion temprana de tokens visuales dentro del propio ViT (intra-ViT early compression), tomada de LLaVA-UHD v4, que reduce el computo en las capas posteriores del encoder. El modelo admite dos modos de compresion de tokens visuales, 4x y 16x, lo que permite ajustar el equilibrio entre detalle visual y coste por tarea.

El modelo acepta entradas de texto, imagen unica, multiples imagenes y video, y produce salida de texto. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO, por lo que esos datos no estan disponibles. OpenBMB si documenta dos mecanismos asociados: el decodificado especulativo DSpark, con un modelo borrador dedicado (`MiniCPM-V-4.7-1B-DSpark`), y una tecnica de ajuste fino denominada Self-Replay Fine-Tuning, orientada a extender capacidades del modelo con coste bajo y menor olvido catastrofico.

## Capacidades
- Comprension de imagen unica, multiples imagenes y video, con salida de texto.
- Generacion de texto conversacional en pipeline `image-text-to-text`.
- Dos modos de compresion de tokens visuales (4x y 16x) seleccionables por tarea.
- Decodificado especulativo mediante el modelo borrador DSpark (5x de mejora reportada en decodificado con offload a SSD en iPad Pro M4 de 16 GB, segun la fuente aicoder).
- Cuantizacion multiple: GGUF, BNB, AWQ, GPTQ y FP8.
- Despliegue en iOS, Android y HarmonyOS, con soporte de plataformas de chip de Rockchip, Houmo, Intel, AMD y Arm.
- Soporte de los frameworks de inferencia SGLang, vLLM, llama.cpp, Ollama y OpenVINO.
- Soporte de ajuste fino mediante SWIFT y LLaMA-Factory.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte explicito de tool calling o function calling: no disponible en la informacion proporcionada.
- Modo de razonamiento "thinking": no disponible en la informacion proporcionada.
- Capacidades de audio: no disponibles (el repositorio hermano MiniCPM-o cubre ese terreno, pero no se detalla para este modelo).

## Casos de uso
- Asistente visual en movil: al ejecutarse en iOS, Android y HarmonyOS con cuantizacion GGUF y ~1B de parametros, permite describir fotos, leer carteles o responder preguntas sobre la camara sin enviar datos a la nube.
- Accesibilidad para personas con discapacidad visual: con el modo de compresion 16x se puede mantener una latencia baja para narrar el entorno en tiempo real desde la camara del telefono.
- Revision de documentos y capturas de pantalla: el modelo procesa imagen unica y multiples imagenes, por lo que puede extraer y resumir informacion de formularios, recibos o capturas encadenadas.
- Moderacion de contenido visual en el borde: al ser ligero y desplegable en NPU de Intel, AMD o Arm, puede filtrar imagenes en el propio dispositivo antes de subirlas a un servicio.
- Analisis de video corto en local: la entrada de video junto con la compresion 4x permite resumir clips o detectar eventos sin infraestructura de GPU dedicada.
- Prototipado rapido con llama.cpp u Ollama: la disponibilidad inmediata del GGUF facilita pruebas en portatiles sin GPU discreta y su integracion en scripts de desarrollo.
- Ajuste fino especifico de dominio: gracias a Self-Replay Fine-Tuning y al soporte de SWIFT y LLaMA-Factory, se puede especializar el modelo en un vertical (por ejemplo, inspeccion industrial) con coste reducido.
- Despliegue en entornos industriales embebidos: el soporte declarado para Rockchip y Houmo habilita su uso en placas de bajo consumo sin conexion.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card incluye graficas de rendimiento global y de frontera rendimiento-eficiencia para la variante 1B en modo Instruct, pero los valores concretos no se reproducen en el texto disponible. Se afirma cualitativamente que la variante 1B supera de forma sustancial a Qwen3.5 0.8B en puntuacion global y en eficiencia de inferencia, y que mejora las capacidades base de MiniCPM-V 4.6, sin cifras asociadas.

Como unico dato cuantitativo de rendimiento disponible, la fuente aicoder reporta que, en el escenario de decodificado con offload a SSD sobre un iPad Pro M4 con 16 GB, el uso conjunto de Lookahead Expert Scheduling, cuantizacion de precision mixta por capas y muestreo especulativo DSpark eleva el rendimiento de 2,97 a 17,39 tokens/s (aproximadamente 5,8x). Este dato corresponde a una configuracion de la familia y no necesariamente a este repositorio GGUF concreto.

## Requisitos de hardware
Las cifras de VRAM que siguen son estimaciones derivadas del recuento de parametros, no datos publicados por el autor.
- VRAM estimada en cuantizacion de 4 bits: en torno a 0,6-0,8 GB para los pesos, mas la memoria del encoder visual y del contexto.
- VRAM estimada en cuantizacion de 8 bits: en torno a 1,1-1,3 GB.
- VRAM estimada en precision completa (BF16): en torno a 2,0-3,1 GB segun se tome el recuento de 1,0B o el de 1,55B parametros.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y cualquier GPU con 4 GB o mas de VRAM.
- Tambien es viable en CPU, NPU y GPU integradas de Intel, AMD y Arm, y en plataformas moviles iOS, Android y HarmonyOS.
- Opciones de despliegue documentadas: SGLang, vLLM, llama.cpp, Ollama y OpenVINO; el formato de este repositorio es GGUF, por lo que llama.cpp y Ollama son las vias directas.
- Decodificado especulativo disponible mediante el modelo borrador `MiniCPM-V-4.7-1B-DSpark`.
- Latencia y throughput concretos para este repositorio: no disponibles. El unico dato publicado es el ya citado de 17,39 tokens/s en iPad Pro M4 con offload a SSD y decodificado especulativo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| MiniCPM-V 4.7 1B (este modelo, GGUF) | ~1,0B (nominal 1B) | No disponible | Apache 2.0 | GGUF, BNB, AWQ, GPTQ, FP8 | Multimodal imagen y video, on-device |
| Qwen3.5 0.8B | 0,8B | No disponible | No disponible | No disponible | La model card afirma que el 1B lo supera en puntuacion global y eficiencia |
| MiniCPM-V 4.6 | 1,3B | No disponible | No disponible | No disponible | Generacion anterior de la misma serie; el 4.7 1B mejora sus capacidades base |
| MiniCPM-V 4.7 35B-A3B | 35B totales, 3B activos (MoE) | No disponible | Apache 2.0 | No disponible | Variante MoE de la misma familia, no comparable en presupuesto de recursos |

## Limitaciones y advertencias
- El modelo tiene ~1B de parametros: su techo de razonamiento, conocimiento factual y seguimiento de instrucciones complejas es previsiblemente inferior al de modelos multimodales de mayor tamano.
- Riesgo de alucinacion no cuantificado en la informacion disponible; en tareas de lectura de imagenes o documentos conviene validar la salida.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Idiomas soportados: no especificados, lo que impide garantizar un rendimiento homogeneo fuera del ingles y el chino.
- Longitud de contexto: no disponible, lo que dificulta planificar cargas con historiales largos o videos extensos.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales conocidas, pero conviene verificar los terminos del modelo base y de los componentes de terceros (encoder SigLIP, backbone Qwen3.5).
- Existe una discrepancia en el recuento de parametros entre la cifra de safetensors de HuggingFace (1,006B), la oficial de evaluacion (1,3B) y la de datalearner (1,554B); hay que tenerlo en cuenta al dimensionar hardware o comparar metricas.
- El tamano de repositorio de 33,8 GB no debe confundirse con el tamano del modelo en ejecucion: agrupa varias cuantizaciones.
- Para video, la decodificacion depende de `torchcodec`, que puede presentar incompatibilidades con determinadas versiones de CUDA (por ejemplo, `torch>=2.11` con CUDA 13.1 frente a entornos CUDA 12.x).
- La fecha de publicacion declarada (octubre de 2026) situa el modelo en un horizonte temporal posterior a la mayoria de referencias publicas, por lo que la verificacion independiente de resultados es limitada.

## Enlaces
- Repositorio GGUF: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B-gguf
- Modelo base (BF16): https://huggingface.co/openbmb/MiniCPM-V-4.7-1B
- Documentacion en Transformers: https://huggingface.co/docs/transformers/main/model_doc/minicpmv4_7
- Repositorio GitHub de MiniCPM-V: https://github.com/OpenBMB/MiniCPM-V
- Repositorio GitHub de MiniCPM-o (documentacion 4.7): https://github.com/OpenBMB/MiniCPM-o
- Documentacion de despliegue: https://github.com/OpenBMB/MiniCPM-o/blob/main/docs/deployment_en.md
- Documentacion de API: https://github.com/OpenBMB/MiniCPM-o/blob/main/docs/api.md
- Cookbook de MiniCPM-V: https://github.com/OpenSQZ/MiniCPM-V-CookBook
- Demo en vivo: https://huggingface.co/spaces/openbmb/MiniCPM-V-4.7-Demo
- LLaVA-UHD v4 (tecnica de compresion intra-ViT): https://github.com/THUMAI-Lab/LLaVA-UHD-v4
- Noticia sobre el lanzamiento: https://aicoder.com/news/news-20261013-openbmb-minicpm-v-4-7-35b-a3b-on-device-moe
- Ficha con especificaciones y evaluacion: https://www.datalearner.com/ai-models/pretrained-models/minicpm-v-4-7-1b
