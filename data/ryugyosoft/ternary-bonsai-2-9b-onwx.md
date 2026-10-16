# ryugyosoft/Ternary-Bonsai-2-9B-onwx

## Resumen

Ternary-Bonsai-2-9B-onwx es una conversión del modelo Prism ML Ternary-Bonsai-2-9B (a su vez un reentrenamiento con pesos ternarios de Qwen/Qwen3.5-9B) empaquetada específicamente para ejecutarse en la NPU XDNA2 de los procesadores AMD Ryzen AI mediante la aplicación onwx. El autor, ryugyosoft, ha reordenado los pesos de 2 bits según la disposición de lectura de los 32 motores de IA de la NPU e incluye los programas NPU ya compilados (xclbin e instrucciones), de modo que no se requiere compilación en el equipo del usuario. El objetivo es claro: llevar un modelo de 9B con capacidad de visión a un PC con NPU integrada consumiendo solo 3,4 GB de descarga y unos 4,1 GB en memoria.

El modelo conserva la arquitectura híbrida de Qwen3.5 (combinación de atención con Gated DeltaNet) y su codificador visual ViT de 27 capas, manteniendo la ventana de contexto nativa de 262.144 tokens. La propuesta técnica es notable: los pesos ternarios (-1, 0, +1) permanecen a 2 bits dentro de la NPU, incluyendo las operaciones matriciales, DeltaNet, atención y la cabeza LM, mientras que el codificador de imagen sigue ejecutándose en CPU. En Ryzen AI Max+ 395 se reportan alrededor de 20 tok/s de generación y una codificación de imagen de 2,4 s.

Su relevancia radica en que demuestra un despliegue completamente en NPU de un modelo multimodal de 9B con licencia Apache-2.0, contexto muy largo y soporte de modo de pensamiento y llamada a herramientas, sin depender de GPUs dedicadas. El formato de pesos es propietario (.wgt binario), por lo que no es portable directamente a otros runtimes como llama.cpp o vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5 con Gated DeltaNet y atención, adaptado a pesos ternarios; codificador visual ViT de 27 capas |
| Parametros totales | 9B (nominal, modelo base Qwen3.5-9B) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Pesos ternarios (-1, 0, +1) a 2 bits con escalas bf16 cada 128 pesos (~2,1 bits por peso); caché KV en int8 tras rotación Hadamard por cabeza |
| Idiomas soportados | Japones e ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | Blobs binarios propios de la NPU (.wgt por capa, head.wgt), embeddings y vision.npz en bf16; no se distribuye en safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo procede de Qwen/Qwen3.5-9B, que Prism ML reentrenó con pesos ternarios bajo el nombre Ternary-Bonsai-2-9B (creado con la herramienta Bonsai). La arquitectura subyacente es un transformer híbrido que intercala capas de atención con capas Gated DeltaNet, un mecanismo de memoria lineal recurrente que reduce el coste computacional en secuencias largas. La conversión de ryugyosoft no reentrena el modelo: reorganiza los pesos en el orden de lectura de los 32 motores de IA de la NPU XDNA2 y despliega en la NPU las multiplicaciones matriz-vector, DeltaNet, atención y la cabeza LM, dejando el ViT (27 capas, pesos bf16 originales) en CPU mediante numpy. Los pesos se guardan con la entrada rotada mediante matrices de Hadamard de 4096 elementos y signos aleatorios, y la NPU aplica la misma rotación antes de multiplicar.

La fase de generación token a token emplea 16 motores de IA para las operaciones matriciales, 8 para DeltaNet y 4 para atención, con una divergencia respecto a la referencia en CPU medida en KL de 0,0013 o menos (los tokens greedy coinciden). La fase de lectura del prompt procesa capas enteras usando los 32 motores a la vez, en bloques de 1024 o 2048 tokens, con KL frente al modo token a token de 0,0055 a 0,0096. La cuantización de la caché KV rota cada cabeza con una matriz de Hadamard antes de almacenarla en int8. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en japonés e inglés.
- Razonamiento con modo de pensamiento (thinking mode) activable.
- Llamada a herramientas (tool calling / function calling).
- Comprensión de imágenes (image-text-to-text): acepta entradas tipo `image_url` como data URL; el ViT procesa imágenes de hasta 512×512 píxeles equivalentes (256 tokens), conservando la relación de aspecto y agrupando parches 2×2 en un token, con posiciones MRoPE.
- Capacidad multimodal limitada a imagen fija: el modelo no lee vídeo.
- Ventana de contexto muy larga (hasta 262.144 tokens) para documentos extensos o conversaciones multi-turno.
- Exposición mediante API compatible con OpenAI en `http://127.0.0.1:8100/v1`.

## Casos de uso

- Asistente conversacional local en portátil con Ryzen AI: un PC con NPU XDNA2 y 16 GB de RAM puede alojar un modelo de 9B con visión sin GPU dedicada, gestionando conversaciones multi-turno largas gracias a la ventana de 262.144 tokens.
- Análisis de documentos extensos: la ventana de contexto permite cargar informes, contratos o manuales completos y hacer preguntas sobre ellos, con la única limitación de velocidad creciente a medida que crece el contexto.
- Descripción y extracción de información de imágenes: gracias al ViT y a la entrada `image_url`, puede etiquetar capturas, leer diagramas sencillos o responder preguntas sobre fotografías de hasta 512×512 píxeles equivalentes.
- Agentes con tool calling: al soportar llamadas a funciones, se puede integrar tras un orquestador local para automatizar tareas en el escritorio (consulta de archivos, llamadas a APIs locales) manteniendo los datos en el equipo.
- Generación de texto y redacción asistida en japonés o inglés: útil para redactar correos, resúmenes o documentación en esos dos idiomas con un consumo de memoria moderado (~4,1 GB más ~15 MB por cada 1000 tokens de contexto).
- Integración en aplicaciones vía API compatible con OpenAI: permite sustituir un endpoint remoto por uno local en herramientas que ya hablan el protocolo OpenAI, reduciendo costes y evitando enviar datos a la nube.
- Procesamiento por lotes de peticiones cortas con latencia baja: con lecturas de prompt de ~2,1 s para 1000 tokens y ~20 tok/s de generación, es viable para tareas de clasificación, resumen o extracción en flujos automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento aportados son métricas de ejecución sobre Ryzen AI Max+ 395 con onwx 0.7.0 y el modo de energía de la NPU en performance:

| Metrica | Valor |
|---|---|
| Lectura de prompt (1000 tokens) | ~2,1 s |
| Lectura de prompt (4000 tokens) | ~6,9 s |
| Lectura de prompt (20.000 tokens) | ~39 s |
| Generación de texto | ~20 tok/s |
| Codificacion de una imagen (384x288 px, CPU) | ~2,4 s (mas ~2,5 s de carga la primera vez) |
| Descarga del repositorio | 3,4 GB |
| Memoria en uso | ~4,1 GB + ~15 MB por cada 1000 tokens de contexto (con vision, +1,7 GB adicionales) |
| Tiempo de carga | Unos segundos, sin compilacion |

Los prompts con imagen se leen actualmente token a token, no mediante la ruta de prefijo optimizada. En el modo de energía estándar de la NPU el rendimiento baja en torno a un 20 %. La divergencia numérica frente a la ejecución de referencia en CPU es de KL ≤ 0,0013 en generación y de 0,0055 a 0,0096 al usar la ruta de lectura de prompt por bloques.

## Requisitos de hardware

- NPU: AMD XDNA2 con 32 motores de IA. Compatible con Ryzen AI 300 (Strix Point, p. ej. Ryzen AI 9 HX 370) y Ryzen AI Max (Strix Halo, p. ej. Ryzen AI Max+ 395).
- Memoria: mínimo 16 GB de RAM del sistema; unos 4,1 GB para el modelo más ~15 MB por cada 1000 tokens de contexto (+1,7 GB adicionales si se usa visión).
- Almacenamiento: 3,4 GB de descarga.
- Sistema operativo: Windows 11 con controlador NPU de AMD (versión 32.0.203 o posterior verificada) o Ubuntu en estado experimental con los controladores amdxdna y XRT.
- CPU: se requiere AVX-512 para las operaciones auxiliares (rotaciones de 4096 elementos); los Ryzen AI 300/Max lo soportan.
- No aplica VRAM de GPU dedicada: toda la inferencia del modelo de lenguaje se ejecuta en la NPU; el codificador visual se ejecuta en CPU.
- Despliegue: la aplicación onwx (instalable en Windows mediante el script `install.ps1` o en Ubuntu con `curl ... | bash`) expone una API compatible con OpenAI en `http://127.0.0.1:8100/v1`.
- No hay soporte indicado para vLLM, llama.cpp, Ollama ni TGI, dado el formato propietario de pesos y los programas NPU.
- Latencia y throughput: véase la tabla de benchmarks de la sección anterior.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Formato | Licencia | Plataforma |
|---|---|---|---|---|---|---|
| Ternary-Bonsai-2-9B-onwx | 9B (ternario ~2,1 bits) | 262.144 tokens | Texto + imagen | .wgt propietario (NPU) | Apache-2.0 | NPU AMD XDNA2 |
| prism-ml/Ternary-Bonsai-2-9B-mlx-2bit | 9B (ternario 2 bits) | 262.144 tokens | Texto + imagen | MLX 2-bit | Apache-2.0 | Apple Silicon (MLX) |
| Qwen/Qwen3.5-9B | 9B | 262.144 tokens | Texto + imagen | safetensors | Apache-2.0 | GPU/CPU generica |

No se dispone de datos de benchmarks comparativos publicados en la información proporcionada para establecer diferencias de calidad entre estas tres variantes.

## Limitaciones y advertencias

- Idiomas limitados a japonés e inglés; no se declara soporte de castellano, por lo que el rendimiento en otros idiomas puede degradarse.
- Riesgo de alucinación inherente a todos los modelos generativos; no hay evaluaciones de veracidad disponibles en la información.
- No procesa vídeo, solo imágenes fijas.
- El rendimiento se degrada notablemente con contextos muy largos: 39 s solo para leer 20.000 tokens de prompt.
- El rendimiento depende del modo de energía de la NPU; en modo estándar se pierde en torno a un 20 %. La actividad de las funciones de IA de Windows Copilot+ sobre la NPU puede reducirlo aún más.
- Formato de pesos propietario (.wgt) ligado a XDNA2: no es portable a otras NPUs, GPUs ni runtimes estándar (llama.cpp, vLLM, Ollama, TGI).
- Requiere CPU con AVX-512 para las operaciones auxiliares, lo que excluye procesadores más antiguos.
- Soporte de Ubuntu calificado como experimental, con dependencia de controladores amdxdna y XRT.
- Repositorio con 0 descargas y 0 "likes" en el momento de la consulta; no hay comunidad ni validación externa documentada.
- Licencia Apache-2.0 (permite uso comercial), heredada de Qwen3.5-9B y del modelo de Prism ML; conviene revisar los ficheros LICENSE y NOTICE.txt del repositorio.
- Aunque el modelo base procede de Alibaba Cloud y no se indican cláusulas adicionales, se recomienda verificar los términos del modelo base original antes de un despliegue comercial.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ryugyosoft/Ternary-Bonsai-2-9B-onwx
- Aplicación onwx: https://huggingface.co/ryugyosoft/onwx
- Modelo base (Prism ML, MLX 2-bit): https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-mlx-2bit
- Modelo original (Alibaba Cloud Qwen): https://huggingface.co/Qwen/Qwen3.5-9B
