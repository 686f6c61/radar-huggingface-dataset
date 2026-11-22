# softandsweet/black-forest-labs-flux-3-image-klein-rngd-fxbex

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un paquete de ejecución (`fxbx`) para el modelo de generación de imágenes `black-forest-labs/flux-3-image-klein` sobre aceleradores NPU de Furiosa. El autor, `softandsweet`, publica los planes de ejecución compilados con FuryNo5 (cinco planes: codificador de texto, pasos del transformer por resolución y VAE, más un bundle fusionado) junto con la herramienta de línea de comandos que los orquesta. El paquete no redistribuye pesos: descarga los safetensors originales de Black Forest Labs en la primera ejecución y verifica su SHA-256.

El modelo subyacente genera imágenes de 512×512 o 1024×1024 a partir de una descripción textual en lenguaje natural, con 16 pasos de muestreo y sin guidance. La propuesta de valor del paquete es el rendimiento en hardware NPU: aproximadamente 9,7 s para 512×512 y 14,4 s para 1024×1024 (excluyendo el codificador de texto), lo que supone aceleraciones de 4,8× y 2,5× frente a la ejecución paso a paso (46,7 s y 35,7 s respectivamente).

Es relevante ahora porque demuestra un flujo de despliegue de difusión de última generación sobre NPU con fidelidad numérica medida (PSNR de 27,31 dB a 512 y 29,88 dB a 1024 frente a la pipeline de referencia en CPU), aunque con una pérdida de unos 3 dB en 1024 por el redondeo BF16 del bundle fusionado. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su tamaño es de 0,5 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para texto-a-imagen (FLUX 3 image klein); ejecución sobre NPU Furiosa mediante planes FuryNo5 |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (prompt de hasta 240 tokens, sin expansor de prompts) |
| Tipos de cuantización | no disponible; ejecución en BF16 según las referencias a redondeo BF16 en el bundle fusionado |
| Idiomas soportados | no disponible |
| Licencia | FLUX Kommunity License v1.0 (`flux-kommunity-license`); uso no comercial y no productivo, comercial solo para Qualifying User |
| Formato de pesos | safetensors (descargados del repo original); planes de ejecución en formato `.fxbx` |
| Resoluciones de salida | 512×512 y 1024×1024 |
| Pasos de muestreo | 16, sin guidance |
| Tamaño del repo | 0,5 GB |

## Arquitectura y entrenamiento

El paquete se apoya en el modelo de difusión `flux-3-image-klein` de Black Forest Labs, del que no se detallan en la información disponible ni el número de parámetros, ni la composición del dataset, ni si hubo etapas de alineación tipo RLHF/DPO. Lo que sí se describe es la arquitectura de ejecución: cinco planes compilados con FuryNo5 (codificador de texto, pasos del transformer por resolución y VAE) que se combinan en un bundle fusionado para reducir el coste de lanzamiento de kernels en la NPU.

La innovación técnica destacable es la ejecución nativa sobre NPU sin copia de pesos: el runtime lee el checkpoint original y verifica su integridad por SHA-256. La fidelidad se ha medido comparando con la pipeline de referencia en CPU usando el mismo prompt y el mismo ruido inicial, obteniendo PSNR de 27,31 dB a 512 y 29,88 dB a 1024; en esta última resolución el bundle fusionado pierde unos 3 dB respecto a la ejecución paso a paso (33,0 dB) por diferencias de redondeo en BF16. El muestreo es de 16 pasos fijos y sin classifier-free guidance.

## Capacidades

- Generación de imágenes texto-a-imagen a 512×512 y 1024×1024 a partir de una frase que describe la escena completa.
- Muestreo determinista controlable mediante semilla.
- Sin expansor de prompts: el texto de entrada se usa tal cual, con un límite de 240 tokens.
- Ejecución en NPU Furiosa con planes precompilados y bundle fusionado para minimizar overhead por paso.
- Verificación de integridad de pesos mediante SHA-256 en la primera ejecución.
- No se documentan capacidades de edición de imagen, inpainting, control estructural (ControlNet), tool calling, agentes, visión de entrada ni audio en la información disponible.
- Capacidades multilingües: no disponibles en la documentación.

## Casos de uso

- Prototipado rápido de conceptos visuales en estación de trabajo con NPU Furiosa: el paquete permite generar un lote de imágenes 512×512 en torno a 10 s por imagen, adecuado para iterar sobre variantes de un prompt antes de fijar una dirección artística.
- Generación de ilustraciones para documentación técnica o material interno no comercial: la licencia Kommunity permite uso no comercial y no productivo, encajando en wikis internas, presentaciones o pruebas de concepto.
- Evaluación de hardware NPU para pipelines de difusión: sirve como banco de pruebas reproducible (PSNR frente a CPU, tiempos por resolución) para decidir si una NPU Furiosa es viable en un despliegue de generación de imágenes.
- Investigación en optimización de kernels y compiladores: los planes FuryNo5 y el bundle fusionado permiten estudiar el impacto del redondeo BF16 en la calidad final comparando ejecución paso a paso contra bundle fusionado.
- Generación de assets a 1024×1024 para maquetas de interfaz o pruebas de diseño: con ~14,4 s por imagen (sin codificador de texto) es viable generar variaciones en una sesión de trabajo, siempre dentro del marco no comercial de la licencia.
- Reproducción de experimentos de difusión con semilla fija: la combinación de prompt, resolución y semilla hace que los resultados sean reproducibles, útil para comparar configuraciones de hardware o versiones del runtime.
- Formación y demos: al no redistribuir pesos y descargarlos del repo original con aceptación de licencia, el paquete simplifica la puesta en marcha en entornos académicos que ya cumplen los requisitos de la FLUX Kommunity License.

## Benchmarks y rendimiento

Los únicos datos publicados son de velocidad y fidelidad del propio paquete, no benchmarks estándar de calidad de imagen (FID, CLIP score, etc.).

| Métrica | 512×512 | 1024×1024 |
|---|---|---|
| Tiempo con bundle fusionado (sin codificador de texto) | ~9,7 s | ~14,4 s |
| Tiempo en ejecución paso a paso | 46,7 s | 35,7 s |
| Aceleración del bundle | 4,8× | 2,5× |
| PSNR frente a pipeline CPU (bundle) | 27,31 dB | 29,88 dB |
| PSNR frente a pipeline CPU (paso a paso) | no disponible | 33,0 dB |

No se han publicado resultados de benchmarks estándar (FID, CLIP, etc.) en la información disponible.

## Requisitos de hardware

- Acelerador NPU Furiosa compatible con el runtime FuryNo5 y el stack Furiosa Torch/TCC 2026.4.0.
- Software: fxbx 0.9.5 o superior, PyTorch 2.10.0+cpu, Transformers 5.20 o superior, Python 3.11.
- VRAM: no disponible; el paquete está orientado a NPU, no a GPU convencional.
- GPU recomendadas: no aplica según la información disponible; no se documenta ejecución en A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no disponible; el diseño depende de la NPU Furiosa.
- Opciones de despliegue: CLI `fxbx` (`fxbx run flux-3-image-klein --sample -o result.json`); no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este pipeline).
- Almacenamiento: 0,5 GB para el paquete; los pesos originales se descargan aparte en la primera ejecución.
- Latencia: ~9,7 s (512) y ~14,4 s (1024) sin contar el codificador de texto; throughput no disponible.

## Comparativa con modelos similares

No se dispone de datos de parámetros, contexto ni benchmarks del modelo base en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable con alternativas como SDXL, FLUX.1 o modelos de difusión equivalentes. La comparación cualitativa disponible se limita a la ejecución del propio paquete:

| Alternativa de ejecución | Tiempo 512×512 | Tiempo 1024×1024 | PSNR 1024 |
|---|---|---|---|
| Bundle fusionado (este paquete) | ~9,7 s | ~14,4 s | 29,88 dB |
| Ejecución paso a paso | 46,7 s | 35,7 s | 33,0 dB |
| Pipeline de referencia en CPU | no disponible | no disponible | referencia |

Comparativa con otros modelos de difusión: no disponible.

## Limitaciones y advertencias

- La licencia FLUX Kommunity License v1.0 restringe el uso comercial a los Qualifying User definidos en el texto; es imprescindible revisar la licencia y el NOTICE antes de cualquier uso productivo.
- El paquete no redistribuye pesos: requiere aceptar la licencia en Hugging Face, iniciar sesión y descargar el checkpoint original en la primera ejecución.
- El repositorio no está afiliado a Black Forest Labs, según declara el propio autor.
- Pérdida de fidelidad de aproximadamente 3 dB en 1024×1024 con el bundle fusionado respecto a la ejecución paso a paso, atribuida al redondeo BF16.
- Sin expansor de prompts y con límite de 240 tokens: prompts largos o muy detallados pueden truncarse o perder matices.
- Muestreo fijo de 16 pasos y sin guidance: no hay control fino sobre el compromiso entre fidelidad al prompt y calidad estética.
- Dependencia de un stack de software muy específico (Furiosa TCC 2026.4.0, PyTorch 2.10.0+cpu, Transformers 5.20, Python 3.11), lo que limita la portabilidad.
- Sin datos publicados sobre sesgos, tasas de alucinación visual, idiomas soportados ni evaluación de seguridad del modelo base.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de mantenimiento a largo plazo.
- No se documentan capacidades de edición, control estructural ni entrada multimodal.

## Enlaces

- Repositorio del paquete: https://huggingface.co/softandsweet/black-forest-labs-flux-3-image-klein-rngd-fxbex
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Checkpoint base referenciado (revisión 3b767ff9b5261d71645e2ec49d87d298d955238d): https://huggingface.co/black-forest-labs/flux-3-image-klein/tree/3b767ff9b5261d71645e2ec49d87d298d955238d
- Licencia del modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein/blob/main/LICENSE.md
- Guía de uso del paquete: `releases/2026.4.0-flux3-fxbx1/USAGE.md` (ruta interna del repositorio)
- Licencia incluida en el paquete: `licenses/LICENSE.md` (ruta interna del repositorio)
- Aviso legal incluido en el paquete: `licenses/NOTICE.md` (ruta interna del repositorio)
- Fichero de ejecución: `releases/2026.4.0-flux3-fxbx1/2924f79ead2de03c4aa1a64a62dc5231fd4dd604334e7e6676df3493d9eb8f51/flux3-image-klein.fxbx` (ruta interna del repositorio)
