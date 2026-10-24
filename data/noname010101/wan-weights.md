# Noname010101/wan-weights

## Resumen

`Noname010101/wan-weights` no es un modelo nuevo, sino un espejo (mirror) de 36 GB con los pesos que un pipeline de imagen a video para ComfyUI carga en tiempo de ejecución. El repositorio empaqueta dos variantes destiladas en FP8 del modelo de difusión Wan 2.2 I2V A14B (High y Low, ambas de `darksidewalker/DaSiWa-WAN2.2-I2V`), junto con el codificador de texto `umt5_xxl_fp8_e4m3fn_scaled` y el VAE `wan_2.1_vae`, ambos procedentes de los repositorios oficiales de Comfy-Org. El autor declara que son copias sin modificar y publica hashes SHA-256 parciales para verificación.

El interés práctico del repositorio es de empaquetado y reproducibilidad, no de investigación: reúne en una sola descarga las cuatro piezas necesarias para ejecutar generación de video a partir de una imagen con el modelo base `Wan-AI/Wan2.2-I2V-A14B` de Alibaba, un transformer de difusión con flow matching y arquitectura de mezcla de expertos (MoE) según las fuentes públicas consultadas. El prefijo A14B de la nomenclatura del modelo base indica 14 000 millones de parámetros activos.

Conviene tratarlo con cautela: cero descargas y cero likes en el momento de la consulta, sin model card técnica más allá de la tabla de ficheros, y con la etiqueta `not-for-all-audiences`, que advierte de la presencia de contenido para adultos en el ecosistema de ajustes del que procede. Para producción, la recomendación es descargar los originales desde los repositorios de origen y verificar los hashes completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion con flow matching y mezcla de expertos (MoE) en el modelo base `Wan-AI/Wan2.2-I2V-A14B`; el repositorio es un espejo de pesos, no un modelo entrenado por el autor |
| Parametros totales | no disponible |
| Parametros activos | no disponible en la informacion proporcionada; la nomenclatura A14B del modelo base indica 14 000 millones de parametros activos |
| Longitud de contexto | no disponible (modelo de imagen a video: el condicionamiento se mide en fotogramas y pasos de difusion, no en tokens de contexto) |
| Tipos de cuantizacion | FP8 `e4m3fn` escalado en el codificador de texto; variantes destiladas en FP8 (High y Low) del modelo de difusion; no se declaran otros formatos (GGUF, NF4, INT8) |
| Idiomas soportados | no disponible; el codificador de texto umT5-XXL es multilingue, pero el repositorio no declara idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 36.0 GB |
| Pipeline declarado | image-to-video |
| Libreria declarada | wan2.2 |
| Modelo base | `Wan-AI/Wan2.2-I2V-A14B` (finetune) |
| Fecha de creacion / actualizacion | 2026-10-24 / 2026-10-24 |
| Descargas / likes | 0 / 0 |

Contenido declarado del repositorio:

| Ruta | Origen | Licencia |
|---|---|---|
| `diffusion_models/DasiwaWAN22I2V14BLightspeed_boundbiteHighV10.safetensors` | `darksidewalker/DaSiWa-WAN2.2-I2V` (`Distilled/FP8/v10`) | Apache-2.0 |
| `diffusion_models/DasiwaWAN22I2V14BLightspeed_boundbiteLowV10.safetensors` | mismo origen | Apache-2.0 |
| `text_encoders/umt5_xxl_fp8_e4m3fn_scaled.safetensors` | `Comfy-Org/Wan_2.1_ComfyUI_repackaged` | Apache-2.0 |
| `vae/wan_2.1_vae.safetensors` | `Comfy-Org/Wan_2.2_ComfyUI_Repackaged` | Apache-2.0 |

## Arquitectura y entrenamiento

El modelo subyacente pertenece a la familia Wan 2.2 de Alibaba, que segun las fuentes consultadas sustituye las arquitecturas UNet de las generaciones anteriores por transformers de difusion con flow matching y una arquitectura de mezcla de expertos. La variante I2V (imagen a video) toma una imagen de referencia y una instruccion de texto y genera una secuencia temporal coherente con ambas. Este repositorio no aporta entrenamiento propio: redistribuye dos pesos destilados (prefijo `Distilled`, version `v10`) que reducen el numero de pasos de muestreo necesarios, motivo por el que el nombre comercial del ajuste incluye el termino "Lightspeed".

El autor del espejo no documenta el proceso de destilacion, el dataset de entrenamiento, el numero de tokens o clips vistos, ni si hubo ajuste por preferencias (RLHF/DPO). Tampoco explica la diferencia funcional entre las variantes `High` y `Low`; por la practica habitual en el ecosistema ComfyUI, suelen corresponder a dos intensidades de un mismo ajuste destilado que se seleccionan segun el numero de pasos y el CFG deseados, pero esto no esta confirmado en la informacion disponible. El codificador de texto es umT5-XXL en FP8 escalado y el decodificador latente es el VAE de Wan 2.1, no el de 2.2.

## Capacidades

- Generacion de video a partir de una imagen de entrada (image-to-video) con condicionamiento por prompt de texto.
- Dos variantes de pesos destilados (`High` y `Low`) pensadas para muestreo con pocos pasos.
- Integracion directa con ComfyUI mediante la libreria `wan2.2` declarada en el repositorio.
- Codificacion de prompts multilingue en teoria, al usar umT5-XXL como codificador de texto; no confirmado por el autor.
- Generacion de contenido para adultos y material sensible: la etiqueta `not-for-all-audiences` lo indica explicitamente.
- No soporta tool calling ni function calling.
- No soporta uso como agente ni razonamiento multi-paso.
- No procesa audio ni genera pistas de audio.
- No expone modo "thinking" ni capacidades de razonamiento simbolico.

## Casos de uso

- Previsualizacion de storyboards: animar un frame clave dibujado o renderizado para validar encuadre, ritmo y continuidad antes de producir la escena, usando la variante `High` para maximizar fidelidad al fotograma de origen.
- Prototipado publicitario: convertir una fotografia de producto en un clip corto en bucle para test A/B de creatividades, con la ventaja de que los pesos destilados permiten iterar con pocos pasos por muestra en una sola GPU.
- Investigacion sobre destilacion: comparar las variantes `High` y `Low` del ajuste DaSiWa frente al modelo base sin destilar para medir la perdida de calidad a igual numero de pasos, ya que el repositorio ofrece ambas en el mismo paquete.
- Reproduccion de pipelines ComfyUI: fijar las cuatro dependencias exactas (dos modelos de difusion, codificador de texto y VAE) para que un workflow guardado se ejecute de forma identica en otra maquina.
- Automatizacion de contenido para redes: generar clips cortos a partir de un banco de imagenes con un nodo programado de ComfyUI, encadenando el VAE de Wan 2.1 para la decodificacion final.
- Animacion de material de archivo: dar movimiento a fotografias historicas o ilustraciones fijas en proyectos documentales, controlando la deriva temporal mediante prompts descriptivos y la fuerza de condicionamiento.
- Pruebas de infraestructura y evaluacion de hardware: al ser un paquete de 36 GB con FP8, sirve para medir VRAM, throughput y latencia de un despliegue antes de invertir en los pesos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas objetivas (FVD, CLIPSim, VBench ni similares) y el autor no documenta comparaciones con el modelo base sin destilar ni con los pesos originales de DaSiWa.

## Requisitos de hardware

- VRAM estimada: el paquete completo ocupa 36 GB en disco, pero la inferencia solo necesita el modelo de difusion activo en FP8 (del orden de 14 GB si la nomenclatura A14B se corresponde con los parametros activos), mas el codificador de texto umT5-XXL en FP8 y el VAE. Estimacion orientativa, no confirmada por el autor.
- GPU de 24 GB (RTX 3090, RTX 4090): viable con la variante FP8 y descarga de modulos a memoria del sistema; esperar tiempos por clip mas altos y posible swapping.
- GPU de 48 GB (A6000, L40S, A100 40/80 GB): margen comodo para mantener difusion y codificador de texto residentes y encadenar varias generaciones.
- GPU de 80 GB (H100, A100 80 GB): recomendable para lotes, resoluciones altas o comparativas High frente a Low sin recargar pesos.
- Despliegue: el entorno previsto es ComfyUI con la libreria `wan2.2`. No se declaran integraciones con vLLM, TGI, llama.cpp ni Ollama, que ademas no aplican a un modelo de difusion de video.
- Latencia y throughput: no disponibles. No hay datos publicados de segundos por clip ni de fotogramas por segundo en ningun acelerador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Licencia | Pesos abiertos | Notas |
|---|---|---|---|---|---|
| Este repositorio (espejo destilado de Wan 2.2 I2V A14B) | no disponible (A14B en el modelo base) | no disponible | Apache-2.0 | Si, safetensors FP8 | Mirror sin benchmarks ni validacion comunitaria; 0 descargas |
| Wan 2.2 I2V A14B original (`Wan-AI`) | no disponible (A14B) | no disponible | Apache-2.0 en el modelo base | Si | Fuente de la que deriva este espejo; sin destilar |
| Wan 2.1 (generacion anterior de Alibaba) | no disponible | no disponible | no disponible en la informacion | Si, segun las fuentes | Arquitectura previa a la transicion a flow matching + MoE; se sigue usando su VAE en este paquete |
| Wan 2.5 / 2.6 / 2.7 | no disponible | no disponible | no disponible | Fuentes contradictorias: una describe 2.5 y 2.7 como niveles alojados con audio nativo, otra califica 2.6 de open-weights | Funcionalidades anunciadas: audio nativo y mejor consistencia temporal |
| Wan 3.0 | no disponible | 30 segundos segun la fuente | no disponible | No, pese a la afirmacion de "open weights" que circula | Lidera dos categorias en Artificial Analysis segun la fuente; sin pesos descargables en el repositorio oficial de GitHub |

## Limitaciones y advertencias

- El repositorio no es un modelo original: es una copia de pesos de terceros. El propio autor recomienda atribuir todo el merito a los creadores originales, pero no ofrece garantias de integridad mas alla de hashes SHA-256 truncados en la model card.
- Riesgo de cadena de suministro: al no haber verificado los hashes completos ni existir descargas previas, conviene descargar los ficheros desde `darksidewalker/DaSiWa-WAN2.2-I2V` y los repositorios de Comfy-Org y comparar.
- La etiqueta `not-for-all-audiences` indica que el ajuste procede de un ecosistema orientado a contenido para adultos. Esto conlleva riesgo de generar material sensible, obligaciones de moderacion en produccion y posibles restricciones en plataformas de distribucion y en proveedores de GPU en la nube.
- Riesgo de deepfakes y suplantacion de identidad: al ser un modelo de imagen a video de alta fidelidad, permite animar rostros reales. Es necesario implementar consentimiento verificado y marcas de agua.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia objetiva de calidad frente al modelo base ni frente a generaciones posteriores de Wan.
- Diferencias arquitectonicas internas: el paquete mezcla un VAE de Wan 2.1 con pesos derivados de Wan 2.2; un emparejamiento incorrecto de VAE o codificador de texto degrada la salida sin producir error explicito.
- Artefactos tipicos de los modelos de difusion de video: derive temporal, deformacion de manos y extremidades, texto ilegible e incoherencia fisica en movimientos rapidos.
- Idiomas no declarados: aunque umT5-XXL es multilingue, no hay garantia de que el ajuste destilado responda igual de bien a prompts en castellano que en ingles.
- Licencia Apache-2.0 permisiva para uso comercial, pero el modelo base y los ajustes de origen pueden imponer condiciones adicionales de uso responsable que este espejo no reproduce.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Noname010101/wan-weights
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
- Ajuste de origen (DaSiWa Wan 2.2 I2V): https://huggingface.co/darksidewalker/DaSiWa-WAN2.2-I2V
- Codificador de texto (Comfy-Org, repack de Wan 2.1): https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged
- VAE (Comfy-Org, repack de Wan 2.2): https://huggingface.co/Comfy-Org/Wan_2.2_ComfyUI_Repackaged
- Vision general de la familia Wan: https://cinemagiq.com/resources/models/wan
- Explicacion de los pesos abiertos y de la arquitectura MoE en Wan 2.2: https://reelmind.ai/blogs/wan-text-to-video-open-generative-weights-explained
- Guia de versiones de la familia Wan: https://genlovers.com/models/wan
- Analisis de Wan 3.0 y de la situacion de los pesos abiertos: https://www.gotoolradar.com/2026/09/the-ai-video-model-that-hit-1-with-one.html
- Wan en Recraft Studio: https://www.recraft.ai/ai-video-models/wan
