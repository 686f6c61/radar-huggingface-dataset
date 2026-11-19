# openbmb/MiniCPM-V-4.7-1B-gguf

## Resumen

MiniCPM-V 4.7 1B es un modelo multimodal (imagen-texto-a-texto) desarrollado por OpenBMB, la organizacion detrás de la familia MiniCPM. Esta ficha cubre concretamente la version cuantizada en GGUF para llama.cpp del modelo base de 1B parametros, publicada en el repositorio openbmb/MiniCPM-V-4.7-1B-gguf. El modelo resuelve el problema de dotar a dispositivos con recursos limitados de capacidad de comprension de imagen unica, multiples imagenes y video, manteniendo un coste de inferencia muy bajo.

La relevancia actual del modelo radica en su relacion rendimiento-eficiencia: segun el autor, en modo Instruct supera de forma sustancial a Qwen3.5 0.8B tanto en puntuacion global como en eficiencia de inferencia. Incorpora compresion temprana de tokens visuales dentro del codificador visual (tecnica intra-ViT de LLaVA-UHD v4) y soporte de compresion mixta 4x/16x de tokens visuales, lo que permite ajustar el detalle visual frente al coste computacional.

El repositorio GGUF ofrece dos conjuntos de archivos con pesos identicos que solo difieren en la plantilla de chat embebida: los de la raiz desactivan el modo thinking de forma fija (recomendado, ya que el modelo no esta entrenado como modelo de razonamiento) y los de la carpeta thinking/ restauran la plantilla original que emite una traza [Start thinking]...[End thinking]. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (codificador visual con compresion intra-ViT temprana + LLM); detalles completos no disponibles |
| Parametros totales | 1.006.209.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_1, Q5_0, Q4_K_M, Q4_K_S, Q4_1, Q4_0, IQ4_NL, IQ4_XS, IQ3_M, IQ3_XS; tambien BNB, AWQ, GPTQ y FP8 en el ecosistema del modelo base |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); pesos originales BF16 en el modelo base |

## Arquitectura y entrenamiento

MiniCPM-V 4.7 es un modelo multimodal que combina un codificador visual con un modelo de lenguaje. La innovacion arquitectonica destacada es la compresion temprana de tokens visuales dentro del propio ViT (intra-ViT early compression, heredada de LLaVA-UHD v4), que reduce el computo en las capas posteriores del codificador. Ademas, soporta compresion mixta de tokens visuales 4x/16x, lo que permite al desarrollador equilibrar el detalle visual y el coste de inferencia segun la tarea.

El modelo base se distribuye con variantes cuantizadas BNB, AWQ y GPTQ y anade soporte de cuantizacion FP8. OpenBMB publica ademas Self-Replay Fine-Tuning (SRFT), un metodo de ajuste fino de bajo coste orientado a extender capacidades reduciendo el olvido de las existentes. No se dispone en la informacion proporcionada de datos sobre numero de tokens de entrenamiento, composicion del dataset ni uso de RLHF/DPO. La version GGUF incorpora tecnicas de cuantizacion con imatrix y soporte de decodificacion especulativa (etiquetas dspark y speculative-decoding), con un repositorio complementario DSpark-gguf.

## Capacidades

- Comprension de imagen unica, multiples imagenes y video (image-text-to-text).
- Generacion de texto conversacional a partir de entradas visuales.
- Modo thinking opcional mediante los archivos de la carpeta thinking/, que emiten una traza de razonamiento entre [Start thinking] y [End thinking]; desactivado por defecto en los archivos de la raiz.
- Compresion configurable de tokens visuales (4x/16x) para ajustar detalle y coste.
- Despliegue en iOS, Android y HarmonyOS, con soporte dia 0 para plataformas de chips de Rockchip, Houmo, Intel, AMD y Arm.
- Integracion con frameworks de inferencia SGLang, vLLM, llama.cpp y Ollama, y de ajuste fino SWIFT y LLaMA-Factory.
- API compatible con OpenAI a traves de llama serve (puerto 9931).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de codigo, matematicas o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Descripcion y etiquetado de imagenes en local: el modelo puede procesar una imagen y generar una descripcion textual en un portatil o dispositivo movil, sin conexion, gracias a su tamano de 1B parametros y a las cuantizaciones Q4/IQ disponibles.
- Asistencia visual en aplicaciones moviles: integrable en apps iOS, Android y HarmonyOS para tareas de comprension de capturas o fotos, con compresion 16x de tokens visuales cuando la latencia prima sobre el detalle.
- Analisis de documentos y capturas multi-imagen: la capacidad de multiples imagenes permite comparar o resumir varias imagenes en una misma conversacion, util para revision de formularios o paneles.
- Resumen de video en dispositivos de borde: el soporte de video y el despliegue en plataformas Rockchip, Arm o Intel permiten prototipos de analisis de video en hardware de bajo consumo.
- Prototipado rapido con llama.cpp: mediante llama cli -hf openbmb/MiniCPM-V-4.7-1B-gguf se descarga el modelo y el mmproj correspondiente de forma automatica, ideal para validar ideas sin infraestructura GPU dedicada.
- Servicio local con API compatible OpenAI: llama serve expone un WebUI y una API en el puerto 9931, lo que permite integrar el modelo en pipelines existentes que ya consumen la API de OpenAI.
- Ajuste fino especifico de dominio: con SWIFT o LLaMA-Factory y el metodo SRFT se puede adaptar el modelo a tareas concretas a bajo coste, reduciendo el olvido de capacidades previas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. El autor afirma cualitativamente que la variante 1B, en modo Instruct, mejora las capacidades base respecto a MiniCPM-V 4.6 y supera de forma sustancial a Qwen3.5 0.8B en puntuacion global y eficiencia de inferencia, pero no se proporcionan cifras concretas (MMLU, HumanEval, GSM8K u otras) en la informacion facilitada.

## Requisitos de hardware

- VRAM estimada: con 1.006 millones de parametros, una cuantizacion Q4_K_M ocupa del orden de 0,6-0,7 GB para los pesos del LLM; el mmproj F16 anade un consumo adicional no especificado. En la practica, el modelo cabe holgadamente en GPUs consumer y en memoria unificada de dispositivos moviles.
- GPU recomendadas: no se especifican modelos concretos; el enfoque del modelo es el despliegue en dispositivo (movil, borde) y en GPUs consumer de gama baja. Para servidor, cualquier GPU con unos pocos GB de VRAM es suficiente en cuantizaciones bajas.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna, asi como en CPU via llama.cpp.
- Opciones de despliegue: llama.cpp (llama cli, llama serve, llama-mtmd-cli, llama-server), Ollama, vLLM, SGLang; la app de escritorio Llama (macOS/Windows) permite su uso con un clic. En el ecosistema del modelo base tambien hay soporte de chips Rockchip, Houmo, Intel, AMD y Arm.
- Latencia y throughput: no disponibles en la informacion proporcionada. La compresion 16x de tokens visuales reduce el coste de inferencia frente a 4x, y el modo thinking multiplica el numero de tokens generados (el autor recomienda aumentar -n).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V 4.7 1B | 1.006 M | no disponible | Segun el autor, supera a Qwen3.5 0.8B en puntuacion global y eficiencia (sin cifras) | Apache 2.0 | GGUF, BNB, AWQ, GPTQ, FP8; HF y llama.cpp |
| MiniCPM-V 4.6 | no disponible | no disponible | Inferior al 4.7 1B en capacidades base segun el autor | no disponible | no disponible |
| Qwen3.5 0.8B | 0,8 B (aprox.) | no disponible | Referencia de comparacion del autor; inferior al 4.7 1B segun este | no disponible | no disponible |

Los datos de MiniCPM-V 4.6 y Qwen3.5 0.8B no se detallan en la informacion proporcionada mas alla de la comparacion cualitativa del autor.

## Limitaciones y advertencias

- El modelo no esta entrenado como modelo de razonamiento: el modo thinking esta desactivado por defecto en los archivos de la raiz y su activacion puede generar trazas poco fiables y multiplicar el consumo de tokens.
- Riesgo de alucinacion inherente a los modelos de lenguaje de 1B parametros; no se han publicado tasas de error en la informacion disponible.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles; conviene validar el rendimiento en castellano antes de usarlo en produccion.
- Longitud de contexto: no disponible; planificar las aplicaciones con margen y verificar experimentalmente.
- La licencia Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y atribucion correspondiente.
- Los pesos de la raiz y de thinking/ son identicos; elegir el conjunto equivocado cambia el comportamiento de la plantilla de chat. En los archivos de la raiz, --reasoning off no tiene efecto porque la plantilla fija enable_thinking.
- El repositorio ocupa 61,1 GB por incluir todas las cuantizaciones; descargar solo el archivo necesario y el mmproj compartido.

## Enlaces

- Repositorio GGUF: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B-gguf
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B
- Repositorio DSpark-gguf: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B-DSpark-gguf
- GitHub de MiniCPM-V: https://github.com/openbmb/MiniCPM-V
- Documentacion del modelo en GitHub: https://github.com/OpenBMB/MiniCPM-o/blob/main/docs/minicpm_v4dot7_en.md
- Guia de despliegue: https://github.com/OpenBMB/MiniCPM-o/blob/main/docs/deployment_en.md
- LLaVA-UHD v4 (tecnica de compresion visual): https://github.com/THUMAI-Lab/LLaVA-UHD-v4
- Blog de Self-Replay Fine-Tuning: https://openbmb.cn/en/blog/self-replay-fine-tuning
- App Llama (llama.cpp + Hugging Face): https://llama.app
