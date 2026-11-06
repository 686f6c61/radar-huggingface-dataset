# annelo/SenseNova-Loop-9B-Preview-Q4_K_M-Vision-GGUF

## Resumen

SenseNova-Loop-9B-Preview es un modelo multimodal (image-text-to-text) desarrollado por SenseNova / OpenSenseNova, publicado originalmente en formato Hugging Face safetensors. Esta ficha describe la version GGUF no oficial distribuida por el usuario `annelo`, que combina un decodificador de texto cuantizado a Q4_K_M con un proyector de vision en F16, pensada para su uso con llama.cpp.

El modelo base emplea una arquitectura de transformer con mecanismos de enrutamiento mHC (multi-head routing) y convoluciones recurrentes, ademas de una torre de vision heredada de Qwen3.5 para el procesamiento de imagenes. Con aproximadamente 14.150 millones de parametros totales segun el checkpoint safetensors, el modelo se posiciona en la gama de 9B-14B, con soporte para ingles y chino.

La relevancia de esta release radica en que permite ejecutar un modelo multimodal con capacidades de vision en hardware de consumo (probado en una RTX 3060 de 12 GB), algo poco habitual en modelos de esta categoria. Sin embargo, requiere aplicar tres parches especificos sobre un commit concreto de llama.cpp, por lo que no funciona con versiones estandar del runtime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con enrutamiento mHC y convoluciones recurrentes; torre de vision Qwen3.5 |
| Parametros totales | 14.149.766.784 (checkpoint safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (configurado en el ejemplo de ejecucion) |
| Tipos de cuantizacion | Q4_K_M (texto), F16 (proyector de vision); tensores mHC y conv recurrentes en F32 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base SenseNova-Loop-9B-Preview emplea una arquitectura transformer con innovaciones especificas: enrutamiento mHC (multi-head routing) y capas de convolucion recurrente, segun se desprende de los tensores que el autor mantiene en F32 durante la cuantizacion. La torre de vision corresponde a Qwen3.5, con un merger que combina parches de 16 pixeles y un merge espacial 2x2, con un rango de 65.536 a 16.777.216 pixeles de imagen.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. La release GGUF es una recuantizacion del Q8_0 de texto publicado por `notfakerv`, a su vez derivado del checkpoint original, y un proyector de vision convertido directamente desde los pesos BF16 originales. El autor advierte que la recuantizacion desde Q8_0 puede reducir la calidad respecto a cuantizar directamente desde BF16.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento aritmetico basico (probado: 13 x 7 = 91).
- Comprension de imagenes: reconocimiento de objetos, colores y formas (probado con una imagen que cambio de "Red" a "Blue" al voltearla).
- Conteo visual y operaciones sobre elementos de la imagen (probado: contar tres circulos y sumar dos = 5).
- Descripcion de video (probado de forma preliminar con un clip, sin validacion amplia).
- Soporte de API compatible con OpenAI (`/v1/chat/completions`) con mensajes que combinan `text` e `image_url`.
- Interfaz web integrada en llama-server que acepta imagenes.
- No se ha validado soporte de tool calling, function calling, agentes multi-paso, modo thinking ni decodificacion especulativa en esta release.

## Casos de uso

- Asistencia visual en local: el modelo puede procesar imagenes enviadas como base64 en una API compatible con OpenAI, lo que permite integrarlo en aplicaciones de escritorio o moviles que necesiten describir o analizar imagenes sin depender de la nube.
- Moderacion de contenido visual: con 8192 tokens de contexto y capacidad de reconocimiento de objetos y colores, puede emplearse para clasificar imagenes en pipelines de revision automatizada.
- Educacion y tutoria: resolucion de problemas aritmeticos simples y explicacion de imagenes (diagramas, figuras geometricas) en entornos con GPU de consumo.
- Prototipado de agentes multimodales: la API compatible con OpenAI facilita la integracion en frameworks existentes para experimentar con flujos que combinen texto e imagen.
- Analisis de documentos escaneados: al soportar imagenes de hasta 16,7 millones de pixeles (con precaucion por el limite de contexto), puede extraer informacion de capturas o fotos.
- Investigacion en vision-lenguaje: al ser ejecutable en una RTX 3060 de 12 GB, sirve como banco de pruebas para experimentos academicos con recursos limitados.
- Descripcion de video preliminar: aunque no validado de forma amplia, el autor reporto descripciones precisas de un clip, lo que abre la puerta a experimentos de captioning de video.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta pruebas cualitativas: aritmetica basica correcta, reconocimiento de color y forma, y conteo visual. No se realizo comparacion numerica contra el modelo BF16 completo de Hugging Face.

## Requisitos de hardware

- VRAM estimada: aproximadamente 9,9 GB en servicio con contexto de 8192 tokens (medido en RTX 3060 de 12 GB).
- GPU probada: RTX 3060 12 GB con CUDA 13.3.
- Cabe en GPU de consumo con al menos 12 GB de VRAM; no se ha validado en GPUs de 8 GB.
- Despliegue: exclusivamente mediante llama.cpp parcheado (commit `ff0d396e3dda0f33e7ce5ad4267fce4f7690cfb1` con los tres parches del repositorio). No es compatible con llama.cpp estandar, vLLM, TGI, Ollama ni otras herramientas sin adaptacion.
- Compilacion recomendada: `-DGGML_CUDA=ON -DCMAKE_CUDA_HOST_COMPILER=/usr/bin/g++-15 -DCMAKE_CUDA_ARCHITECTURES=86`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-Preview (GGUF Q4_K_M) | 14.150 M | 8192 (configurado) | Si | Apache 2.0 | GGUF con parches |
| Qwen2.5-VL-7B | no disponible en la informacion | no disponible | Si | no disponible | safetensors, GGUF |
| LLaVA-1.6-7B | no disponible en la informacion | no disponible | Si | no disponible | safetensors, GGUF |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Requiere aplicar tres parches en orden sobre un commit especifico de llama.cpp; llama.cpp estandar no cargara el modelo.
- La recuantizacion desde Q8_0 (en lugar de BF16) puede degradar la calidad; el autor lo advierte explicitamente.
- Imagenes muy grandes pueden exceder el contexto de 8192 tokens; es necesario reducir la imagen o limitar los tokens de imagen.
- No se ha validado el comportamiento con multiples imagenes, video general, calidad en contexto largo, cuantizacion de vision, MTP, aceleracion por difusion ni decodificacion especulativa.
- No se realizo comparacion numerica contra el modelo BF16 completo.
- Idiomas limitados a ingles y chino; no hay soporte declarado de castellano.
- Riesgo de alucinacion no cuantificado en la informacion disponible.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero la release es no oficial y el autor no ofrece garantias.
- El modelo base y los pesos de vision son de SenseNova / OpenSenseNova; esta release no es oficial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/annelo/SenseNova-Loop-9B-Preview-Q4_K_M-Vision-GGUF
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B-Preview
- GGUF de texto Q8_0 de referencia: https://huggingface.co/notfakerv/SenseNova-Loop-9B-Preview-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
