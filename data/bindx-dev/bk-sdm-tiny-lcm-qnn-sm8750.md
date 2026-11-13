# bindx-dev/bk-sdm-tiny-lcm-qnn-sm8750

## Resumen

bk-sdm-tiny-lcm-qnn-sm8750 es un paquete de conversion para Qualcomm AI Runtime (QNN) del modelo de difusion text-to-image BK-SDM-Tiny con destilacion LCM (Latent Consistency Model), orientado a aceleracion en la NPU Hexagon HTP v79 del SoC Snapdragon 8 Elite (SM8750). Lo publica el usuario bindx-dev bajo el paraguas de BindX, un catalogo de modelos empaquetados para despliegue en dispositivos Android con NPU. El modelo base es nota-ai/bk-sdm-tiny, una Stable Diffusion comprimida mediante eliminacion de bloques y destilacion de conocimiento a partir de CompVis/stable-diffusion-v1-4, descrita en el paper arXiv:2305.15798.

La relevancia de esta ficha es fundamentalmente documental: el repositorio no contiene pesos. Los tres binarios de contexto QNN que el catalogo de BindX referencia (`text_encoder.bin`, `unet.bin`, `vae.bin`) no estan compilados, de modo que cualquier descarga devuelve 404. El autor mantiene la fila del catalogo de forma deliberada para probar la tarjeta de error de descarga del Model Manager de BindX. Cualquier evaluacion tecnica del modelo debe hacerse, por tanto, sobre la informacion del pack planificado y sobre el modelo original nota-ai/bk-sdm-tiny, no sobre artefactos disponibles en este repositorio.

El pack previsto apunta a inferencia local en movil: pipeline completo BK-SDM-Tiny LCM compilado ahead-of-time con Qualcomm AI Runtime a binarios de contexto Hexagon HTP v79, cuantizacion W8A16, resolucion 512x512, con un objetivo de 450 ms por imagen medido en un Galaxy S25 con la build de referencia. Ese dato debe interpretarse como presupuesto de rendimiento del catalogo, no como resultado de este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion comprimida (UNet con eliminacion de bloques y destilacion de conocimiento) + destilacion LCM; compilada a contexto QNN para Hexagon HTP v79 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; resolucion objetivo 512x512) |
| Tipos de cuantizacion | W8A16 (pesos 8 bits, activaciones 16 bits) segun el pack planificado |
| Idiomas soportados | no disponible (prompts en lenguaje natural; el modelo base usa CLIP text encoder) |
| Licencia | creativeml-openrail-m (CreativeML OpenRAIL-M), heredada del modelo fuente |
| Formato de pesos | binarios de contexto QNN (`.bin`) para text encoder, UNet y VAE; no hay pesos publicados en este repositorio |

## Arquitectura y entrenamiento

El modelo subyacente es BK-SDM-Tiny, una variante de Stable Diffusion 1.4 comprimida por Nota AI mediante dos tecnicas combinadas: eliminacion de bloques del UNet (se descartan capas del encoder y del decoder) y destilacion de conocimiento desde el modelo original CompVis/stable-diffusion-v1-4 para recuperar calidad tras el recorte. Sobre esa base se aplica una destilacion de pasos tipo LCM (Latent Consistency Model), que reduce el numero de pasos de muestreo necesarios en inferencia, algo critico en dispositivos moviles donde cada paso de UNet implica una pasada completa por la NPU.

El pack de BindX no reentrena el modelo: lo convierte. El pipeline completo (text encoder, UNet y VAE) se compila ahead-of-time con Qualcomm AI Runtime a binarios de contexto para Hexagon HTP v79, en precision W8A16 y a 512x512, acompanado de un `metadata.json` que registra las formas de los tensores y las escalas de cuantizacion que el runtime necesita en carga. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineacion del modelo original en la informacion proporcionada.

## Capacidades

- Generacion de imagenes a partir de prompts de texto (text-to-image) a 512x512.
- Muestreo acelerado por destilacion LCM: el modelo esta disenado para funcionar con pocos pasos de inferencia en lugar de la cadena completa de DDIM.
- Ejecucion en NPU Hexagon HTP v79 del Snapdragon 8 Elite mediante contexto QNN precompilado, sin necesidad de compilar en el dispositivo.
- Cuantizacion W8A16 para reducir huella de memoria y aprovechar las unidades de computo entero de la NPU.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles como dato verificado; la cobertura linguistica depende del text encoder CLIP del modelo base.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Generacion de imagenes offline en aplicaciones Android: el pack esta pensado para integrarse en apps que ejecutan el pipeline completo en el Snapdragon 8 Elite sin conexion a red, usando los binarios QNN y el `metadata.json` con formas y escalas de cuantizacion.
- Pruebas de la ruta de error del Model Manager de BindX: este repositorio existe precisamente para validar la tarjeta de fallo de descarga cuando los binarios no estan disponibles, un caso de uso de QA de la infraestructura de distribucion.
- Prototipado de interfaces creativas en movil: con un presupuesto de 450 ms por imagen en hardware de referencia, el modelo encaja en flujos de generacion de miniaturas, avatares o ilustraciones rapidas dentro de una app.
- Evaluacion de pipelines de compilacion QNN: sirve como referencia de como se estructura un pack (tres grafos mas metadatos) para equipos que preparen sus propias conversiones de modelos de difusion a Hexagon.
- Integracion en demos de IA generativa en dispositivo: util para mostrar generacion de imagenes local en ferias o entornos con conectividad limitada, siempre que se compile previamente el pack.
- Benchmarking de cuantizacion W8A16 en difusion: permite medir la perdida de calidad frente al modelo en FP16 y validar si la cuantizacion a 8 bits de pesos es aceptable para el producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento mencionado es el objetivo de 450 ms por imagen, medido en un Galaxy S25 con la build de referencia, que el autor describe explicitamente como presupuesto del catalogo y no como resultado de este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El destino es memoria unificada de movil, no VRAM de GPU de escritorio.
- GPU recomendadas: no aplica; el pack esta compilado para Hexagon HTP v79 del Snapdragon 8 Elite (SM8750).
- Compatibilidad con GPU de consumo: no aplica. Los binarios de contexto QNN no son ejecutables en GPUs NVIDIA o AMD; requeririan reconversion.
- Opciones de despliegue: Qualcomm AI Runtime (QNN) sobre Hexagon HTP v79; no se indica soporte para vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no a difusion).
- Latencia y throughput estimados: 450 ms por imagen a 512x512 en Galaxy S25 con la build de referencia, segun el presupuesto declarado por el autor; no verificado en este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bk-sdm-tiny-lcm-qnn-sm8750 (este) | no disponible | 512x512 | 450 ms/imagen objetivo en SM8750 (no verificado) | CreativeML OpenRAIL-M | Sin pesos; repositorio vacio |
| nota-ai/bk-sdm-tiny | no disponible | 512x512 | no disponible | CreativeML OpenRAIL-M | Pesos publicados en Hugging Face |
| CompVis/stable-diffusion-v1-4 | no disponible | 512x512 | no disponible | CreativeML OpenRAIL-M | Pesos publicados en Hugging Face |
| Stable Diffusion compilada para Hexagon (muestras de Qualcomm) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio no contiene pesos: los tres binarios de contexto QNN devuelven 404. No es utilizable para inferencia tal como esta publicado.
- El objetivo de 450 ms por imagen corresponde a una build de referencia medida en un Galaxy S25; no es un resultado reproducible desde este repositorio.
- La licencia CreativeML OpenRAIL-M impone restricciones de uso: prohibe generar contenido ilegal o danino de forma deliberada y exige propagar las mismas restricciones y el texto de la licencia al redistribuir packs compilados.
- Riesgo de sesgos y alucinacion visual: al derivar de Stable Diffusion 1.4, el modelo hereda los sesgos del dataset de entrenamiento original (LAION), no documentados en la informacion disponible.
- Cobertura linguistica no verificada: depende del text encoder CLIP del modelo base y no se especifica en el pack.
- Dependencia de hardware: los binarios QNN para HTP v79 estan atados al Snapdragon 8 Elite; no son portables a otras NPU o GPUs sin recompilacion.
- La compresion por eliminacion de bloques y la cuantizacion W8A16 pueden degradar la fidelidad visual respecto a Stable Diffusion 1.4 completa; no se aportan metricas de calidad (FID, CLIP score) en la informacion disponible.
- Estado del repositorio: creado y actualizado el 2026-11-13, sin descargas ni likes; no hay evidencia de mantenimiento activo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/bindx-dev/bk-sdm-tiny-lcm-qnn-sm8750
- Modelo original: https://huggingface.co/nota-ai/bk-sdm-tiny
- Paper BK-SDM: https://arxiv.org/abs/2305.15798
- Codigo BK-SDM: https://github.com/Nota-NetsPresso/BK-SDM
- Modelo fuente de la destilacion: https://huggingface.co/CompVis/stable-diffusion-v1-4
- Texto de la licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
