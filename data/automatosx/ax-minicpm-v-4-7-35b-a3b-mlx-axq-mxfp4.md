# AutomatosX/AX-MiniCPM-V-4.7-35B-A3B-MLX-AXQ-MXFP4

## Resumen

AX-MiniCPM-V-4.7-35B-A3B-MLX-AXQ-MXFP4 es un checkpoint cuantizado en formato MLX del modelo multimodal MiniCPM-V 4.7 35B-A3B de OpenBMB, preparado por AutomatosX mediante su toolkit AXQuant 2.3.0. El modelo base es un transformer de mezcla de expertos (MoE) con 35.210 millones de parametros logicos que acepta entradas de imagen y texto y genera texto, orientado a ejecucion local en Apple Silicon.

La particularidad de este paquete es su estrategia de cuantizacion mixta: la ruta de lenguaje se comprime a 4 bits (MXFP4, grupos de 32) mientras que la torre de vision y ciertos tensores protegidos se mantienen en BF16, resultando en un peso medio medido de 5,0158 bits por parametro (BPW) y un tamano de safetensors de 22,08 GB. Esto permite descargar y ejecutar un modelo de 35B con capacidad de vision en equipos con memoria unificada relativamente modesta, a costa de renunciar a garantias de calidad publicadas.

Es relevante ahora porque el ecosistema MLX esta consolidando la inferencia local de modelos multimodales grandes en Mac, y porque el autor declara una ventana de contexto configurada de 262.144 tokens. No obstante, el propio autor etiqueta el paquete como "evidencia de desarrollo" y anuncia una reconstruccion futura, por lo que debe tratarse con cautela en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (`MiniCPMV4_7ForConditionalGeneration`), ruta de texto optimizada |
| Parametros totales | 35.212.875.824 (35,21B logicos) |
| Parametros activos | no disponible (el modelo base es MoE A3B, pero la model card no detalla el reparto por experto) |
| Longitud de contexto | 262.144 tokens configurados; el limite practico depende de la memoria unificada |
| Tipos de cuantizacion | MXFP4 (4 bits, grupos de 32), 8 bits y BF16 mixtos; metodos `affine`, `bf16`, `mxfp4`; 5,0158 BPW medidos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX Safetensors (no incluye PyTorch ni GGUF) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 35,21B de parametros logicos y una designacion A3B que sugiere aproximadamente 3B de parametros activos por token, aunque la model card no desglosa el numero exacto de expertos ni el enrutamiento. La arquitectura incluye una torre de vision para entrada de imagen y un decodificador de lenguaje con atencion lineal hibrida, segun la referencia del autor a "hybrid linear-attention tensors". No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO.

La innovacion de este paquete concreto es la cuantizacion AXQuant: la asignacion de precision se basa en priors de arquitectura (sin calibracion con datos), con 32,59B de parametros en 4 bits (92,55%), 549,09M en 8 bits (1,56%) y 2,07B en BF16 (5,89%). El autor registra 281 de 281 conversiones de modulo exitosas sin fallbacks. No se detectaron tensores MTP (multi-token prediction), por lo que no hay aceleracion especulativa, y la torre de vision se conserva integra en BF16 dentro de los shards principales.

## Capacidades

- Generacion de texto conversacional multi-turno a partir de entradas de imagen y texto (pipeline `image-text-to-text`).
- Comprension de imagenes: descripcion, respuesta a preguntas visuales y dialogos sobre contenido grafico.
- Razonamiento y generacion de codigo heredados del modelo base de lenguaje, sujetos a la degradacion propia de la cuantizacion a 4 bits.
- Contexto largo configurado de hasta 262.144 tokens, condicionado a la memoria disponible en el equipo.
- Capacidad multimodal integrada en un unico checkpoint MLX, con la torre de vision sin cuantizar.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de audio: no incluidas (`Audio present: False`).
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos escaneados en local: el modelo recibe la imagen de una factura o formulario y devuelve texto estructurado, sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos de privacidad en Mac.
- Asistente de accesibilidad en escritorio: descripcion de imagenes y capturas de pantalla en tiempo real mediante MLX-VLM, aprovechando la torre de vision en BF16 para preservar detalle fino.
- Prototipado de agentes visuales en Apple Silicon: integracion del checkpoint en un pipeline MLX-VLM para experimentar con razonamiento sobre capturas de interfaz antes de invertir en infraestructura CUDA.
- Revision de contenido grafico en lotes pequenos: clasificacion y resumen de imagenes en un flujo de trabajo local, con la ventaja de que el modelo completo ocupa unos 22 GB en disco y cabe en la memoria unificada de un Mac de gama alta.
- Chat multimodal con contexto largo: conversaciones que alternan imagenes y texto extenso, apoyadas en la ventana configurada de 262.144 tokens para mantener el hilo de documentos largos.
- Evaluacion comparativa de tecnicas de cuantizacion: uso del paquete como referencia de AXQuant frente a los hermanos MXFP8 y NVFP4 para medir el impacto del BPW en tareas de vision-lenguaje.
- Demostraciones educativas de modelos MoE multimodales: ejecucion de un modelo de 35B en hardware de consumo Apple para ilustrar el enrutamiento de expertos y la cuantizacion mixta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el paquete no publica evidencia de calidad frente a BF16 ni a lineas base uniformes, no mide la aceptacion ni la velocidad de MTP, y no evalua la calidad vision-lenguaje. La etiqueta AXQ no debe interpretarse como una afirmacion de rendimiento.

## Requisitos de hardware

- VRAM o memoria unificada estimada: al menos 22,21 GB de descarga completa; para inferencia conviene reservar margen adicional para el KV cache, especialmente con contextos largos.
- Hardware objetivo: Apple Silicon con memoria unificada; el paquete esta disenado para MLX y no para GPUs NVIDIA o AMD.
- Cabe en equipos con 32 GB o mas de memoria unificada (Mac Studio, MacBook Pro de gama alta); con 24 GB el margen es muy ajustado y el contexto practico queda muy reducido.
- GPU recomendadas: no aplica en el sentido tradicional; el runtime es MLX sobre Apple Silicon. No hay soporte validado para A100, H100 ni RTX 4090 con este artefacto.
- Opciones de despliegue: MLX-VLM como runtime principal; AX Engine 7.6.4 no es compatible (el generador de manifiestos rechaza el tipo `minicpmv4_7`). No hay pesos GGUF, por lo que llama.cpp y Ollama no son opciones directas.
- Latencia y throughput: no medidos ni publicados en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y precision | Licencia | Notas |
|---|---|---|---|---|---|
| AX-MiniCPM-V-4.7-35B-A3B-MLX-AXQ-MXFP4 | 35,21B | 262.144 | MLX Safetensors, 5,0158 BPW | Apache 2.0 | Paquete de desarrollo, sin benchmarks publicados |
| AX-MiniCPM-V-4.7-35B-A3B-MLX-AXQ-MXFP8 | 35,21B | 262.144 | MLX Safetensors, MXFP8 | Apache 2.0 | Misma politica de roles a mayor precision; vision y atencion lineal en precision de origen |
| AX-MiniCPM-V-4.7-35B-A3B-CUDA-AXQ-NVFP4-W4A16 | 35,21B | 262.144 | NVFP4 W4A16, backend CPU de referencia | Apache 2.0 | Runtime CUDA y calidad no verificados |
| openbmb/MiniCPM-V-4.7-35B-A3B (base) | 35,21B | no disponible en esta ficha | BF16 original | Apache 2.0 | Fuente de la cuantizacion, revision `896c2d4` |

## Limitaciones y advertencias

- Paquete marcado como evidencia de desarrollo: el autor anuncia una reconstruccion con el toolkit AXQuant mejorado y recomienda fijar un commit concreto para despliegues reproducibles.
- Sin evidencia de calidad: no hay comparacion publicada frente a BF16 ni frente a cuantizacion uniforme; la retencion de calidad es una incognita.
- Sin evaluacion de calidad vision-lenguaje: aunque la torre de vision se conserva en BF16, no se ha medido el impacto de la cuantizacion del decodificador en tareas multimodales.
- Calibracion basada solo en priors de arquitectura, sin datos: la asignacion de precision puede no ser optima para dominios especificos.
- Riesgo de alucinacion inherente al modelo base, no cuantificado en este paquete.
- Idiomas soportados no declarados; no se puede garantizar un comportamiento multilingue concreto.
- Contexto de 262.144 tokens solo nominal: el limite real dependera de la memoria unificada y del KV cache.
- Sin soporte de AX Engine y sin pesos GGUF: el despliegue queda restringido a MLX-VLM.
- Sin tensores MTP: no hay decodificacion especulativa ni aceleracion asociada.
- Licencia Apache 2.0 permisiva para uso comercial, pero la ausencia de garantias de calidad desaconseja produccion sin evaluacion propia.
- Solo 86 descargas y 0 likes en el momento de la consulta: comunidad practicamente inexistente y poca validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AutomatosX/AX-MiniCPM-V-4.7-35B-A3B-MLX-AXQ-MXFP4
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B/tree/896c2d454672476a7b45dcc5e3f0c700a0218577
- Hermano MXFP8: https://huggingface.co/AutomatosX/AX-MiniCPM-V-4.7-35B-A3B-MLX-AXQ-MXFP8
- Hermano CUDA NVFP4 W4A16: https://huggingface.co/AutomatosX/AX-MiniCPM-V-4.7-35B-A3B-CUDA-AXQ-NVFP4-W4A16
- Colecciones del autor: https://huggingface.co/AutomatosX/collections
- Indice completo del catalogo MLX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
- Runtime MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- Papers, blogs y demos adicionales: no disponible en la informacion proporcionada.
