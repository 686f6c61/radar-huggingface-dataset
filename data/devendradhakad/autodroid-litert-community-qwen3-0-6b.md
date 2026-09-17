# devendradhakad/autodroid-litert-community-Qwen3-0.6B

## Resumen

Este repositorio publica una serie de artefactos LiteRT-LM del modelo Qwen3-0.6B, preparados específicamente para despliegue en Android y en escritorio. Qwen3-0.6B es un transformer denso de aproximadamente 600 millones de parámetros desarrollado por Alibaba Qwen (informe técnico arXiv:2505.09388) y publicado bajo licencia Apache-2.0. El repositorio lo mantiene el usuario devendradhakad y declara como modelo base Qwen/Qwen3-0.6B con relación "quantized".

El problema que resuelve es la ausencia de artefactos listos para ejecutar Qwen3-0.6B en el runtime LiteRT-LM, que permite inferencia on-device sobre GPU OpenCL, CPU y NPU en móviles, además de WebGPU en escritorio. Se ofrecen cuatro variantes con cuantizaciones distintas (INT8 dinámico, mixed INT4 con TorchAO, INT4 dinámico block-32 y una variante a16w8 orientada a NPU MediaTek), con ventanas de contexto de 2048 y 4096 tokens y tamaños de entre 328 MB y 992 MB.

Su relevancia es doble: por un lado, demuestra un flujo de trabajo completo de cuantización y conversión (litert-torch, AI Edge Quantizer, TorchAO) con métricas medidas en dispositivos comerciales; por otro, no se trata del repositorio oficial de litert-community, sino de una réplica mantenida por un tercero con 0 descargas y 0 likes en el momento de la consulta, lo que debe tenerse en cuenta antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3); número de capas, cabezas y esquema de atención no disponible en la información proporcionada |
| Parametros totales | 0,6 mil millones (Qwen3-0.6B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens en Qwen3-0.6B.litertlm, Qwen3-0.6B.mediatek.mt6993.litertlm y Qwen3-0.6B_dynamic_wi4b32_afp32.litertlm; 2048 tokens en qwen3_0_6b_mixed_int4.litertlm. El contexto nativo del modelo base no se especifica en la información proporcionada |
| Tipos de cuantizacion | INT8 dinámico de pesos con KV en coma flotante; a16w8 orientado a NPU; mixed INT4 de TorchAO (pesos INT4 por bloques de 32 con escalas en coma flotante, embeddings en INT8 weight-only, normalización y caché KV en coma flotante); INT4 dinámico block-32 con activaciones FP32 |
| Idiomas soportados | en (inglés) según los metadatos; el resto de idiomas del modelo base no está confirmado en la información disponible |
| Licencia | apache-2.0 (`license_link` apunta a la licencia de Qwen/Qwen3-0.6B) |
| Formato de pesos | .litertlm (LiteRT-LM), derivado del checkpoint original de Hugging Face |

Artefactos incluidos en el repositorio:

| Archivo | Cuantización | Contexto | Tamano |
|---|---|---:|---:|
| Qwen3-0.6B.litertlm | INT8 dinámico de pesos, KV en coma flotante | 4096 | 586 MB |
| Qwen3-0.6B.mediatek.mt6993.litertlm | a16w8 orientado a NPU | 4096 | 992 MB |
| qwen3_0_6b_mixed_int4.litertlm | TorchAO mixed INT4, KV en coma flotante | 2048 | 474,61 MiB |
| Qwen3-0.6B_dynamic_wi4b32_afp32.litertlm | INT4 dinámico (block-32) de pesos, activaciones FP32 | 4096 | 328 MB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del checkpoint Qwen/Qwen3-0.6B, un transformer denso de la familia Qwen3 descrito en el informe técnico arXiv:2505.09388. Este repositorio no entrena ni afina el modelo: únicamente lo convierte y cuantiza para el runtime LiteRT-LM. No se proporciona información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

Las innovaciones técnicas del repositorio son de despliegue, no de modelado. El artefacto mixed INT4 se generó con una receta "quantize-first" basada en TorchAO: las proyecciones lineales elegibles se almacenan en INT4 por bloques de grupo 32 con escalas en coma flotante, los embeddings de tokens usan cuantización weight-only INT8, y las rutas de normalización/reducción y los tensores de caché KV permanecen en coma flotante. Este bundle emplea operaciones compuestas StableHLO de LiteRT-LM para atención y caché (`odml.runtime_bmm` y `odml.cache_update`). Los artefactos `Qwen3-0.6B.litertlm` y `Qwen3-0.6B_dynamic_wi4b32_afp32.litertlm` se convirtieron por la ruta LiteRT Torch (`litert-torch`) y se cuantizaron con AI Edge Quantizer; el segundo incorpora optimizaciones de grafo para GPU (operaciones compuestas para RoPE, QKV fusionado y proyecciones Gate/Up fusionadas) y asignación estática de memoria en prefill. El artefacto `mediatek.mt6993` está específicamente dirigido a la NPU del SoC MediaTek MT6993.

## Capacidades

- Generación de texto y conversación de un solo turno o multiturno en inglés, con contexto efectivo de 2048 o 4096 tokens según el artefacto.
- Inferencia on-device sobre tres backends distintos: GPU OpenCL en Android, CPU en Android y NPU (MediaTek MT6993), más GPU WebGPU en escritorio.
- Ejecución mediante CLI de LiteRT-LM, con carga directa desde un repositorio de Hugging Face.
- Integración con la aplicación Edge Gallery de Google para Android, que permite importar el modelo desde Hugging Face o desde almacenamiento local.
- Prefill y decode en streaming con medición de TTFT (time to first token), adecuado para respuestas incrementales en interfaces de usuario.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Modo "thinking" o razonamiento extendido: no disponible en la información proporcionada (aunque la familia Qwen3 lo incorpora, no se documenta para estos artefactos).
- Capacidades de visión o audio: no disponibles; el pipeline declarado es exclusivamente text-generation.
- Soporte multilingüe: no confirmado; el único idioma declarado en los metadatos es el inglés.

## Casos de uso

- Asistentes conversacionales sin conexión en aplicaciones Android: el modelo se ejecuta íntegramente en el dispositivo, con 2048 o 4096 tokens de contexto, lo que permite mantener un historial de conversación moderado sin enviar datos a un servidor ni depender de red.
- Autocompletado y resumen de notas: con una huella de 328 MB en la variante INT4 block-32, el modelo cabe en aplicaciones móviles que necesitan resumir o reescribir textos breves en inglés sin sacrificar almacenamiento.
- Clasificación y extracción de información en el borde: al ejecutarse sobre NPU (MediaTek MT6993) con 36 tok/s de decode, es viable etiquetar o extraer campos de textos cortos en tiempo casi interactivo dentro de un pipeline de datos local.
- Traducción y reescritura de textos en inglés: aunque el soporte multilingüe no está confirmado, para tareas monolingües en inglés el modelo ofrece latencias de TTFT de 0,15 s en GPU OpenCL en un Samsung SM-S937U1.
- Enrutamiento previo a un modelo mayor: por su tamaño reducido y su bajo TTFT, puede actuar como clasificador o filtro que decide si una consulta se resuelve localmente o se delega a un modelo en la nube.
- Pruebas de rendimiento y selección de backend: los artefactos permiten comparar de forma directa CPU frente a GPU OpenCL y NPU sobre el mismo modelo, con métricas publicadas de prefill, decode, TTFT y huella de memoria para dispositivos concretos.
- Demos web y prototipado en escritorio: la variante medida sobre WebGPU alcanza 4257,13 tok/s de prefill con 803 MB de huella pico, lo que la hace apta para demostraciones en navegador sin instalación.
- Evaluación de recetas de cuantización: el repositorio documenta dos rutas de conversión independientes (litert-torch + AI Edge Quantizer y TorchAO quantize-first), útil para equipos que comparan el impacto de cada esquema antes de adoptarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos publicados son medidas de ejecución en dispositivos comerciales.

Android, artefacto `qwen3_0_6b_mixed_int4.litertlm` (contexto 2048, 256 tokens de prefill / 256 de decode, LiteRT-LM v0.13.1):

| Dispositivo | Backend | Prefill (tok/s) | Decode (tok/s) | TTFT (s) | Huella privada maxima |
|---|---|---:|---:|---:|---:|
| Samsung SM-S937U1 | GPU OpenCL | 1844,95 | 69,38 | 0,150 | 585 MB |
| vivo V2502A | GPU OpenCL | 1055,89 | 22,34 | 0,285 | 1856 MB |
| TECNO LJ9 | GPU OpenCL | 637,01 | 33,51 | 0,430 | 1832 MB |
| Samsung SM-S937U1 | CPU | 576,59 | 12,90 | 0,520 | 2895 MB |
| TECNO LJ9 | CPU | 231,15 | 8,33 | 1,230 | 2890 MB |

Android, artefacto `Qwen3-0.6B.litertlm` (contexto 4096; filas de Samsung y TECNO con 256/256 tokens y LiteRT-LM v0.13.1; filas de vivo sin forma exacta registrada):

| Dispositivo | Backend | Prefill (tok/s) | Decode (tok/s) | TTFT (s) | Huella privada maxima |
|---|---|---:|---:|---:|---:|
| Samsung SM-S937U1 | GPU OpenCL | 646,33 | 25,31 | 0,440 | 2940 MB |
| TECNO LJ9 | GPU OpenCL | 254,24 | 12,10 | 1,090 | 4283 MB |
| vivo V2502A | GPU OpenCL | 580 | 21 | no disponible | no disponible |
| Samsung SM-S937U1 | CPU | 212,07 | 13,02 | 1,280 | 2697 MB |
| TECNO LJ9 | CPU | 95,14 | 9,32 | 2,800 | 2699 MB |
| vivo V2502A | CPU | 165 | 9 | no disponible | no disponible |

Android, artefacto `Qwen3-0.6B.mediatek.mt6993.litertlm` (contexto 4096, resultado de referencia sobre NPU):

| Dispositivo | Backend | Prefill (tok/s) | Decode (tok/s) | TTFT (s) | Huella privada maxima |
|---|---|---:|---:|---:|---:|
| vivo V2502A | NPU | 1472 | 36 | no disponible | no disponible |

Escritorio, AMD Radeon AI PRO R9700 vía WebGPU (256 tokens de prefill y 32 de decode):

| Backend | Prefill (tok/s) | Decode (tok/s) | TTFT (s) | Huella privada maxima |
|---|---:|---:|---:|---:|
| GPU WebGPU | 4257,13 | 142,07 | 0,07 | 803 MB |

El propio autor advierte que estas cifras no proceden de una aplicación Android integrada, sino de la herramienta `litert_lm_advanced_main` lanzada por línea de comandos adb, y que dependen del SKU del dispositivo, la build del sistema operativo, el estado térmico, el modo de batería, el backend, la cuantización, la versión del runtime y la configuración del benchmark.

## Requisitos de hardware

- Espacio en disco: entre 328 MB (INT4 block-32) y 992 MB (a16w8 para NPU MediaTek) por artefacto; el repositorio completo ocupa 0,3 GB según los metadatos.
- Huella privada pico medida en Android: de 585 MB (Samsung SM-S937U1, GPU OpenCL, mixed INT4) a 4283 MB (TECNO LJ9, GPU OpenCL, INT8 dinámico con contexto 4096).
- Huella privada pico medida en escritorio: 803 MB sobre AMD Radeon AI PRO R9700 vía WebGPU.
- GPU recomendadas: no se especifican modelos de GPU de escritorio o servidor. Los datos publicados corresponden a GPU integradas de móviles (Adreno/Mali vía OpenCL), la NPU MediaTek MT6993 y una AMD Radeon AI PRO R9700 para WebGPU. No hay datos para A100, H100 o RTX 4090.
- CPU: el modelo funciona en CPU de móvil con decodificación de 8,33 a 13,02 tok/s y TTFT de 0,52 a 2,80 s, considerablemente más lento que la GPU OpenCL.
- Cabe en GPU de consumo: no disponible, ya que no se han publicado mediciones sobre GPU de escritorio dedicadas de consumo; el artefacto más pequeño ocupa 328 MB en disco, por lo que el modelo en sí no supone una barrera de memoria en hardware de consumo moderno.
- Opciones de despliegue: CLI de LiteRT-LM (`uv tool install litert-lm`, `uvx litert-lm run --from-huggingface-repo=...`), aplicación Edge Gallery en Android (importación desde Hugging Face o almacenamiento local), WebGPU en navegador/escritorio y ejecución sobre NPU en dispositivos MediaTek MT6993.
- Herramientas de conversión y cuantización: litert-torch, AI Edge Quantizer y TorchAO.
- Latencia y throughput: TTFT de 0,07 s en WebGPU de escritorio, 0,150 s en la mejor medición móvil con GPU OpenCL y hasta 2,80 s en CPU; decode de 8,33 a 142,07 tok/s según plataforma y backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de los artefactos | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| devendradhakad/autodroid-litert-community-Qwen3-0.6B (este repositorio) | 0,6 mil millones | 2048 y 4096 tokens | INT8 dinámico, mixed INT4 TorchAO, INT4 block-32, a16w8 | apache-2.0 | 0 descargas y 0 likes en el momento de la consulta; repo de autor individual |
| litert-community/Qwen3-0.6B (repositorio de referencia citado en la model card) | 0,6 mil millones | 4096 tokens | Los mismos cuatro esquemas documentados en la card | apache-2.0 | Repositorio de la organización litert-community |
| Qwen/Qwen3-0.6B (checkpoint original) | 0,6 mil millones | No disponible en la información proporcionada | Pesos originales sin cuantizar | apache-2.0 | Repositorio oficial de Alibaba Qwen |

No se dispone de datos de rendimiento comparativo entre estos tres repositorios en la información proporcionada, más allá de que este repositorio replica los artefactos descritos por litert-community/Qwen3-0.6B bajo un espacio de nombres distinto. Alternativas de otros fabricantes en el mismo rango de tamaño, como Llama 3.2 1B o Gemma 3 1B, no cuentan con datos en la información disponible.

## Limitaciones y advertencias

- Autoría de terceros: el repositorio lo mantiene el usuario devendradhakad, no la organización litert-community, pese a que el nombre lo imita. No hay validación comunitaria: 0 descargas y 0 likes en el momento de la consulta.
- Anomalía en los metadatos: la fecha de creación registrada es 2026-09-17, posterior a la de actualización y potencialmente errónea en la plataforma.
- Sin evaluaciones de calidad: no se publican resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de precisión, por lo que no puede cuantificarse la degradación introducida por las cuantizaciones INT8 e INT4.
- Degradación por cuantización: el artefacto INT4 block-32 y el mixed INT4 aplican cuantización agresiva sobre pesos y embeddings; la model card no documenta la pérdida de calidad frente al checkpoint original.
- Contexto reducido: la ventana efectiva se limita a 2048 o 4096 tokens, inferior a la de variantes sin cuantizar del mismo modelo base, lo que restringe tareas de documento largo.
- Idioma: solo se declara inglés. Cualquier uso en castellano u otros idiomas no está respaldado por los metadatos y debe validarse empíricamente.
- Riesgo de alucinación: con 0,6 mil millones de parámetros, la tasa de fabricación de datos y los errores de razonamiento son elevados; no es adecuado para dominios que exijan alta fiabilidad factual sin verificación posterior.
- Benchmarks no reproducibles de forma directa: las cifras dependen de SKU del dispositivo, build del sistema, estado térmico, modo de batería, backend, cuantización, versión del runtime y configuración, y no proceden de aplicaciones integradas. El propio autor declara que no están afiliadas ni verificadas por Samsung, vivo, Qualcomm, MediaTek, Google, MLCommons ni Hugging Face.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar el archivo LICENSE del modelo base y de cada artefacto antes de redistribuirlos, y respetar las condiciones de la aplicación Edge Gallery si se integra en un producto.
- Tamaño del modelo: no es un sustituto de modelos de mayor escala para tareas de razonamiento complejo, generación de código extensa o matemáticas avanzadas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/devendradhakad/autodroid-litert-community-Qwen3-0.6B
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio LiteRT-LM de referencia citado en la model card: https://huggingface.co/litert-community/Qwen3-0.6B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-0.6B/blob/main/LICENSE
- Informe técnico de Qwen3: https://arxiv.org/abs/2505.09388
- Guía de instalación de uv: https://docs.astral.sh/uv/getting-started/installation/
- Aplicación Edge Gallery en Google Play: https://play.google.com/store/apps/details?id=com.google.ai.edge.gallery
- Versiones APK de Edge Gallery: https://github.com/google-ai-edge/gallery/releases
- Nota sobre la búsqueda web: los resultados devueltos corresponden a un portal de noticias en húngaro (origo.hu y hirtv.origo.hu) sin relación con el modelo. No se han encontrado enlaces adicionales relevantes (papers, blogs, demos o repositorios) más allá de los listados arriba.
