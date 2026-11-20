# Rootport/Nz-LTX25-weights

## Resumen

Nz-LTX25-weights es un repositorio de pesos preparados para ejecutar el modelo de generación de vídeo LTX 2.5 de Lightricks dentro de Nz-Videomni (antiguo Nz-LTX23), un plugin para el editor de vídeo AviUtl2. No es un modelo entrenado por su autor: cuatro de los cinco ficheros son recopias byte a byte de los artefactos oficiales de Lightricks (dos VAE, un upscaler latente y un IC-LoRA) y el quinto es una cuantización GGUF del transformer destilado de 22B, derivada de los pesos bf16 originales.

El interés práctico está en que empaqueta en un único repositorio de 18,9 GB todo lo necesario para la ruta de inferencia `engine25` del plugin, con el transformer comprimido a Q4_K mixto (14,7 GB frente a los 42 GB del bf16 original). El text encoder queda fuera, en un repositorio aparte, porque su modelo base (un Gemma 4 afinado por Lightricks) se distribuye bajo Apache 2.0 y no bajo la licencia comunitaria de LTX.

El modelo subyacente es un generador texto-a-vídeo con salida conjunta de vídeo y audio, con 21.004.025.600 parámetros declarados en safetensors para el conjunto del repositorio. La licencia es la LTX-2.x Community License Agreement, con umbral comercial de 10 millones de dólares de facturación anual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (LTX 2.5, variante destilada); incluye VAE de vídeo, VAE de audio, upscaler latente espacial x2 e IC-LoRA |
| Parametros totales | 21.004.025.600 (dato de safetensors del repositorio); el transformer GGUF destilado pesa 14.738.670.464 B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con mezcla Q4_K (1.658 tensores) + passthrough BF16 (2.401) + F32 (290); resto de componentes en bf16 safetensors |
| Idiomas soportados | ja, en |
| Licencia | LTX-2.x Community License Agreement (11 de agosto de 2026); licencia `other` en HF |
| Formato de pesos | GGUF (transformer) y safetensors bf16 (VAE, upscaler, IC-LoRA) |

## Arquitectura y entrenamiento

El repositorio no entrena nada: redistribuye el transformer de difusión destilado de LTX 2.5 en formato GGUF, junto con los componentes auxiliares del pipeline. La generación es texto-a-vídeo con audio simultáneo, lo que exige dos VAE independientes (vídeo y audio) y un upscaler latente espacial x2 para duplicar la resolución del resultado. El IC-LoRA `alpha-gen` añade la capacidad de producir mattes de transparencia en blanco y negro a partir de vídeo convencional.

La conversión a GGUF se realizó con Nz-GGUF-Converter-LTX23 1.2.0 (commit `905f348`) sobre el fichero `diffusion_models/ltx-2.5-22b-distilled-transformer-bf16.safetensors` de `Lightricks/LTX-2.5` (42.018.190.584 B, SHA-256 `31eb3cad89b9e54e99dd3baf286f70825ac4f6c660a70d9184d895be76d7bff4`). De los 4.349 tensores, 1.658 se cuantizaron a Q4_K y 2.691 se mantuvieron intactos (2.401 en BF16 y 290 en F32), una estrategia conservadora que preserva la precisión de las capas sensibles. Los cuatro ficheros auxiliares no se modificaron. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni las etapas de alineación (RLHF/DPO) aplicadas por Lightricks.

## Capacidades

- Generación de vídeo a partir de texto (pipeline `text-to-video`), con salida de audio generada de forma conjunta.
- Upscaling latente espacial x2 mediante `ltx-2.5-latent-spatial-upscaler-x2-bf16-1.0`.
- Generación de mattes de transparencia (Alpha Gen) a partir de vídeo existente mediante el IC-LoRA `ltx-2.5-22b-ic-lora-alpha-gen-0.9`.
- Integración directa en la línea de tiempo de AviUtl2 a través del plugin Nz-Videomni.
- Soporte de idiomas de prompt limitado a japonés e inglés según los metadatos del repositorio.
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso ni agentes; es un modelo generativo de vídeo, no un LLM conversacional.

## Casos de uso

- Edición de vídeo en AviUtl2: el plugin Nz-Videomni carga estos pesos desde `models/LTX25/` y permite generar clips directamente en la línea de tiempo, sin salir del editor, lo que encaja en flujos de trabajo de creadores que ya usan AviUtl2.
- Generación de metraje de relleno (B-roll): el modelo produce clips a partir de descripciones textuales en japonés o inglés, útiles para cubrir cortes en montajes de YouTube o vídeos explicativos.
- Producción de audio sincronizado: al generar vídeo y audio con VAE separados, sirve para crear borradores con pista de sonido incorporada antes de una mezcla final en el editor.
- Creación de mattes de transparencia: el IC-LoRA Alpha Gen convierte metraje convencional en máscaras en blanco y negro, aplicable a composición y rotoscopia semiautomática en postproducción.
- Reescalado de clips generados: el upscaler latente x2 permite entregar versiones de mayor resolución de los clips producidos sin regenerar desde cero.
- Prototipado rápido de ideas visuales: con el transformer en Q4_K (14,7 GB) el coste de almacenamiento y de carga es notablemente menor que el bf16 de 42 GB, lo que facilita iterar en estaciones de trabajo con VRAM limitada.
- Flujos de previsualización en local: al mantener los VAE y el upscaler en bf16 y solo comprimir el transformer, se puede generar un borrador rápido y, si se necesita máxima calidad, recurrir a los pesos bf16 originales de Lightricks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, el transformer GGUF ocupa 14,7 GB en disco y los componentes auxiliares suman aproximadamente 4,1 GB (VAE vídeo 1,45 GB, VAE audio 0,36 GB, upscaler 1,0 GB, IC-LoRA 1,31 GB), a lo que hay que añadir el text encoder alojado en `Rootport/Nz-Gemma4-12B-LTX25` y los buffers de activaciones latentes.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño del transformer cuantizado, el rango de trabajo razonable son GPU con 24 GB o más de VRAM.
- ¿Cabe en GPU de consumo? El transformer Q4_K de 14,7 GB es compatible en términos de memoria con tarjetas de 24 GB (RTX 3090, RTX 4090) y, con margen ajustado, con 16 GB; no hay confirmación oficial de encaje ni de rendimiento en estas tarjetas.
- Opciones de despliegue: la ruta prevista es el plugin Nz-Videomni sobre AviUtl2, que carga GGUF y safetensors desde `models/LTX25/`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este pipeline (son herramientas de LLM, no de difusión de vídeo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nz-LTX25-weights | 21.004.025.600 (repo); transformer GGUF 14,7 GB | no disponible | GGUF + safetensors bf16 | LTX-2.x Community (umbral 10 M USD) | Hugging Face, 59 descargas |
| Lightricks/LTX-2.5 (upstream) | 22B en el transformer destilado | no disponible | safetensors bf16 (42 GB el transformer) | LTX-2.x Community | Hugging Face, oficial |
| Rootport/Nz-LTX23-weights | no disponible | no disponible | GGUF + safetensors | LTX-2.x Community | Hugging Face; incompatible con LTX 2.5 |
| Rootport/Nz-Gemma4-12B-LTX25 | 12B (text encoder) | no disponible | GGUF | Apache 2.0 (modelo base) | Hugging Face; componente complementario, no alternativo |

La comparación relevante es contra el propio upstream: este repositorio reduce el transformer de 42 GB a 14,7 GB manteniendo 2.691 tensores sin cuantizar, a cambio de una posible pérdida de calidad en las 1.658 capas Q4_K que no está cuantificada en la documentación. Frente a Nz-LTX23, la diferencia es de versión y formato: los ficheros no son intercambiables.

## Limitaciones y advertencias

- No es una distribución oficial de Lightricks ni cuenta con su aprobación; el autor lo declara explícitamente.
- La licencia LTX-2.x Community impone restricciones de uso (sección 4 y Attachment A) y exige licencia comercial separada a entidades con facturación anual igual o superior a 10 millones de dólares.
- Obligaciones de notificación de transferencia (sección 3.5) y de cumplimiento normativo de IA (sección 6) recogidas en `NOTICE.md`; hay que revisarlas antes de redistribuir derivados.
- Incompatibilidad total con los pesos de LTX 2.3: no se pueden mezclar ficheros entre `models/LTX23/` y `models/LTX25/`.
- El text encoder no está incluido; sin descargar `Rootport/Nz-Gemma4-12B-LTX25` el pipeline no funciona. Además, en el primer arranque se genera automáticamente `LTX-2.5-gemma4-12b-text-encoder-Q4_K_M.assets.safetensors` (unos 32 MB).
- Idiomas de prompt limitados a japonés e inglés según los metadatos; no hay evidencia de soporte de castellano.
- La cuantización Q4_K de 1.658 tensores puede degradar la calidad respecto al bf16 original; no se publican métricas de la pérdida introducida.
- El repositorio tiene 59 descargas y 0 likes, con lo que la validación comunitaria es prácticamente nula.
- Riesgo de alucinación visual y artefactos propios de los modelos de difusión de vídeo; no se documentan sesgos específicos.
- No se dispone de información sobre resolución máxima, duración máxima de clip ni número de pasos de muestreo recomendados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Rootport/Nz-LTX25-weights
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- IC-LoRA Alpha Gen: https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Alpha-Gen
- Text encoder (repositorio separado): https://huggingface.co/Rootport/Nz-Gemma4-12B-LTX25
- Pesos de la versión anterior: https://huggingface.co/Rootport/Nz-LTX23-weights
- Plugin Nz-Videomni: https://github.com/Rootport-AI/Nz-Videomni
- Herramienta de conversión GGUF: https://github.com/Rootport-AI/Nz-GGUF-Converter-LTX23
- Perfil del desarrollador original: https://huggingface.co/Lightricks
- Ficheros de procedencia y licencia: `NOTICE.md` y `LICENSE` dentro del repositorio
