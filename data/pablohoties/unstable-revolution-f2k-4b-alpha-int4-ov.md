# PabloHoties/unStable-Revolution-F2K-4B-alpha-int4-ov

## Resumen

unStable Revolution F2K 4B alpha int4 OpenVINO es una conversión de formato del finetune de generación y edición de imágenes **unStable Revolution F2K 4b alpha**, obra de Peli86, a su vez derivado del modelo base [FLUX.2 [klein] 4B](https://huggingface.co/black-forest-labs/FLUX.2-klein-4B) de Black Forest Labs. El repositorio, publicado por PabloHoties, no introduce ningún entrenamiento nuevo: su única aportación es reempaquetar los pesos ajustados dentro del grafo OpenVINO INT4 del export de rupeshs, de modo que el finetune pueda ejecutarse en GPUs y CPUs Intel con el mismo rendimiento y huella de memoria que el export original.

El modelo resuelve el problema de desplegar un finetune de FLUX.2 klein 4B en hardware Intel sin necesidad de reconvertir manualmente los pesos ni reescribir el pipeline. Al mantener exactamente la misma precisión por capa que el export de referencia (INT4 asimétrico con grupos de 128 en la mayoría de capas, INT8 por canal en el resto, según el esquema de NNCF), los tensores de entrada y salida, el tamaño y la velocidad coinciden con los del export original, y las LoRAs creadas para FLUX.2 klein 4B siguen siendo compatibles.

Es relevante ahora porque FLUX.2 [klein] 4B es una de las variantes compactas de la familia FLUX.2 orientada a inferencia local, y este repositorio demuestra la ruta práctica para llevar finetunes de la comunidad a dicho entorno con cuantización INT4. El repositorio ocupa 4,6 GB, no registra descargas ni likes en el momento de la consulta y está etiquetado como no apto para todas las audiencias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión derivado de FLUX.2 [klein] 4B, exportado a grafo OpenVINO) |
| Parámetros totales | no disponible (el nombre del modelo indica 4B en el modelo base) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a text-to-image) |
| Tipos de cuantización | INT4 asimétrico con grupos de 128 en la mayoría de capas; INT8 por canal en el resto (esquema NNCF) |
| Idiomas soportados | no disponible (prompts en lenguaje natural, idioma no especificado) |
| Licencia | civitai-model-license (permisos fijados por el autor en Civitai); modelo base Apache 2.0 |
| Formato de pesos | OpenVINO IR (INT4/INT8), diseño de carpetas compatible con el export de rupeshs |
| Tamaño del repositorio | 4,6 GB |
| Pasos de inferencia recomendados | 4–5 |
| Resolución recomendada | 896×1152 (cualquier resolución soportada según el autor) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base FLUX.2 [klein] 4B más allá de su naturaleza como modelo de difusión para texto-a-imagen. Lo que sí se documenta con precisión es el proceso de conversión: los pesos del finetune fp16 (`unStableRevolutionF2K4b.safetensors`, versión "F2K 4B fp16" publicada en Civitai) se cuantizaron dentro del grafo OpenVINO del export `rupeshs/flux2-klein-4b-int4-ov`, aplicando la misma precisión por peso que dicho export. El codificador de texto, el VAE, el tokenizador y el planificador son los del export original, sin modificar.

No se especifican en la información proporcionada los datos de entrenamiento del finetune (número de imágenes, composición del dataset, uso de RLHF/DPO u otras técnicas de alineación), ni innovaciones técnicas del modelo base como decodificación especulativa o atención lineal. El script de conversión está disponible en `tools/convert_transformer.py` dentro del repositorio de la interfaz web del autor.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con 4–5 pasos de inferencia.
- Edición de imágenes, según la etiqueta `image-editing` del repositorio y la interfaz web asociada.
- Compatibilidad con LoRAs creadas para FLUX.2 klein 4B, que siguen funcionando sin cambios.
- Ejecución en GPUs y CPUs Intel mediante OpenVINO.
- Soporte de resolución flexible; el autor recomienda 896×1152.
- Integración con herramientas que cargan el export de rupeshs, como `OVFlux2KleinPipeline` de optimum-intel y FastSDCPU (no probado según la model card).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio, por tratarse de un modelo de generación de imágenes.

## Casos de uso

- Generación de imágenes en estaciones de trabajo con GPU Intel: el modelo se ejecuta a través de OpenVINO con cuantización INT4, lo que reduce la huella de memoria frente a los pesos fp16 y permite desplegarlo en equipos con aceleradores Intel integrados o dedicados.
- Edición de imágenes asistida por prompt en flujos creativos: la etiqueta `image-editing` y la interfaz web asociada permiten modificar imágenes existentes con instrucciones en lenguaje natural, útil para retoque rápido o variaciones de concepto.
- Prototipado de pipelines de difusión en CPU: al estar exportado a OpenVINO, puede ejecutarse sin GPU dedicada, lo que facilita pruebas en portátiles o servidores sin acelerador.
- Aplicación de estilos personalizados mediante LoRAs: al mantener la compatibilidad con LoRAs de FLUX.2 klein 4B, un estudio puede combinar el finetune con adaptadores de estilo, personaje o composición sin reconvertir nada.
- Evaluación comparativa de finetunes de la comunidad: investigadores pueden medir el efecto del finetune de Peli86 frente al modelo base usando exactamente el mismo grafo y precisión, aislando la contribución de los pesos ajustados.
- Despliegue en herramientas de escritorio como FastSDCPU: el diseño de carpetas replica el del export de rupeshs, por lo que encaja en aplicaciones que ya cargan ese formato, aunque la model card indica que no se ha probado.
- Generación de material visual para previsualización de conceptos en producción creativa, con la advertencia de que el modelo está marcado como no apto para todas las audiencias y sujeto a la licencia de Civitai.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 4,6 GB y la cuantización INT4 reduce la huella frente a fp16, pero no se detalla el consumo en inferencia.
- GPU recomendadas: GPUs Intel (la model card menciona GPUs y CPUs Intel como objetivo del export OpenVINO); no se especifican modelos concretos como Arc, A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: no confirmada para GPUs NVIDIA o AMD; el formato OpenVINO está orientado a hardware Intel.
- Opciones de despliegue: interfaz web [FLUX.2 klein 4B OpenVINO](https://github.com/PabloHoties/flux.2-klein-4b-openvino-webui) del autor, `OVFlux2KleinPipeline` de optimum-intel y FastSDCPU (estas dos últimas no probadas según la model card).
- Latencia y throughput: no disponibles; la model card afirma que el tamaño y la velocidad son los mismos que el export original de rupeshs, pero no aporta cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Licencia | Notas |
|---|---|---|---|---|
| unStable-Revolution-F2K-4B-alpha-int4-ov | 4B (según nombre del base) | OpenVINO INT4/INT8 | civitai-model-license | Finetune de Peli86 convertido por PabloHoties; 4–5 pasos |
| rupeshs/flux2-klein-4b-int4-ov | 4B | OpenVINO INT4/INT8 | Apache 2.0 | Export original sin finetune; misma estructura y precisión |
| black-forest-labs/FLUX.2-klein-4B | 4B | safetensors (fp16 y otras) | Apache 2.0 | Modelo base de Black Forest Labs, sin ajuste de la comunidad |

## Limitaciones y advertencias

- El repositorio está etiquetado como `not-for-all-audiences`; el finetune puede generar contenido no apto para todo público.
- La licencia es `civitai-model-license`, no Apache 2.0: los permisos efectivos son los que el autor fijó en la página de Civitai, y pueden restringir el uso comercial. El modelo base sí es Apache 2.0, pero la licencia del finetune prevalece sobre los pesos ajustados.
- No se documentan sesgos conocidos ni tasas de alucinación; en modelos de difusión el riesgo se traduce en imágenes incoherentes, artefactos o fidelidad limitada al prompt, pero no hay datos concretos en la información disponible.
- La compatibilidad con `OVFlux2KleinPipeline` y FastSDCPU no ha sido probada por el autor; solo se garantiza el funcionamiento con su interfaz web.
- El modelo no registra descargas ni likes, por lo que no hay evidencia comunitaria de estabilidad o calidad en producción.
- Al ser una conversión de formato, cualquier limitación del finetune original (composición, anatomía, texto en imágenes, etc.) se hereda sin cambios.
- No se especifican idiomas soportados en los prompts ni el comportamiento multilingüe del codificador de texto.

## Enlaces

- [Hugging Face: PabloHoties/unStable-Revolution-F2K-4B-alpha-int4-ov](https://huggingface.co/PabloHoties/unStable-Revolution-F2K-4B-alpha-int4-ov)
- [Modelo original en Civitai: unStable Revolution F2K 4b alpha](https://civitai.com/models/2355813/unstable-revolution-f2k-4b-alpha)
- [Mirror en Civitai.red](https://civitai.red/models/2355813/unstable-revolution-f2k-4b-alpha?modelVersionId=2650607)
- [Modelo base: black-forest-labs/FLUX.2-klein-4B](https://huggingface.co/black-forest-labs/FLUX.2-klein-4B)
- [Export OpenVINO de referencia: rupeshs/flux2-klein-4b-int4-ov](https://huggingface.co/rupeshs/flux2-klein-4b-int4-ov)
- [Interfaz web FLUX.2 klein 4B OpenVINO](https://github.com/PabloHoties/flux.2-klein-4b-openvino-webui)
- [FastSDCPU](https://github.com/rupeshs/fastsdcpu)
