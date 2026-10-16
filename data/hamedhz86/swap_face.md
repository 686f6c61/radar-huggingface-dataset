# hamedhz86/Swap_face

## Resumen

BFS (Best Face Swap) es una colección de adaptadores LoRA para sustitución de cara, cabeza y cuerpo en imágenes, publicada por el usuario hamedhz86 bajo el identificador hamedhz86/Swap_face. No es un modelo generativo independiente, sino un conjunto de pesos LoRA que se aplican sobre varios modelos de difusion de imagen a imagen: Qwen-Image 2.1, Qwen-Image-Edit 2509 y 2511, FLUX.2 Klein (4B y 9B, en variantes fp8 y base), Krea 2 Raw y, de forma experimental, LTX-2.

Cada familia de pesos tiene su propio contrato de uso: modelo base asociado, orden de las imagenes de entrada (cuerpo primero y cara de referencia despues en varias versiones de cabeza) e intensidad de LoRA recomendada. El repositorio ocupa 13,0 GB e incluye flujos de trabajo JSON para ComfyUI, ademas de guias por familia en el directorio docs. La relevancia actual del proyecto esta en que permite hacer face swap de alta fidelidad reutilizando modelos de edicion de imagen de ultima generacion, en lugar de depender de pipelines dedicados tipo inswapper.

La licencia declarada es MIT y el unico idioma indicado en la model card es el ingles. El modelo no registra descargas ni likes en el momento de la consulta y no publica resultados de benchmarks ni detalles del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (low-rank adaptation) sobre modelos de difusion transformer de imagen a imagen |
| Parametros totales | no disponible (el autor no publica el recuento; el repositorio completo ocupa 13,0 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusion imagen a imagen; la ventana se define por el modelo base y la resolucion de imagen) |
| Tipos de cuantizacion | safetensors en fp16 y fp32 para los LoRA; los modelos base citados incluyen variantes fp8 (FLUX.2 Klein 4b/9b fp8) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Rango de LoRA declarado | rank 16 (fp16), rank 32 (fp32), rank 64 y rank 128 en variantes de FLUX.2 Klein |
| Modelos base compatibles | Qwen-Image 2.1, Qwen-Image-Edit 2509, Qwen-Image-Edit 2511, FLUX.2 Klein 4B y 9B (base y fp8), Krea 2 Raw, LTX-2 (experimental) |
| Pipeline declarado | image-to-image |
| Libreria | diffusers |
| Tamano del repositorio | 13,0 GB |
| Fecha de creacion y ultima actualizacion | 2026-10-15 |

## Arquitectura y entrenamiento

El proyecto no define una arquitectura propia: cada archivo .safetensors contiene los pesos de un adaptador LoRA que se inyecta en las capas de atencion de un modelo base de difusion. La model card confirma que hay versiones con rango 16 en fp16, rango 32 en fp32, rango 64 y rango 128 para el caso de FLUX.2 Klein 9B, lo que implica que el autor ha entrenado y publicado varios puntos de control con distinta capacidad de adaptacion y distinto coste de memoria. Los modelos base citados incluyen dos variantes de Qwen-Image-Edit (2509 y 2511), la familia FLUX.2 Klein en 4B y 9B, Krea 2 Raw y pesos experimentales para LTX-2, lo que sugiere una estrategia de portar el mismo objetivo de sustitucion facial a distintos backbones.

No hay informacion publicada sobre el numero de tokens o de imagenes de entrenamiento, la composicion del dataset, el uso de tecnicas de alineacion como RLHF o DPO, ni sobre innovaciones tecnicas propias (decodificacion especulativa, atencion lineal u otras). La unica orientacion operativa que da el autor es usar el LoRA con su modelo base correspondiente, respetar el orden de entrada indicado en cada guia y arrancar con una intensidad de LoRA de 1.0 antes de ajustar.

## Capacidades

- Sustitucion de cara (face swap): trasplante de identidad facial desde una imagen de referencia a una imagen destino.
- Sustitucion de cabeza (head swap): reemplazo completo de cabeza, con integracion en el cuerpo original.
- Sustitucion de cuerpo (body swap): version especifica para Qwen-Image 2.1 y Krea 2, segun la tabla de descargas del repositorio.
- Edicion de imagen guiada por referencia: el pipeline es image-to-image, de modo que la generacion queda condicionada por la imagen de entrada y la referencia.
- Integracion con ComfyUI: se distribuyen flujos de trabajo JSON, por ejemplo Head Swap V1 Qwen 2.1 Workflow.json.
- Compatibilidad multi-backbone: los mismos objetivos estan portados a Qwen-Image 2.1, Qwen-Image-Edit 2509/2511, FLUX.2 Klein 4B/9B, Krea 2 y LTX-2 experimental.
- Capacidades experimentales de video: los pesos LTX-2 (ic_lora) apuntan a un caso de uso sobre video, marcado como experimental por el autor.
- Tool calling, function calling, agentes, razonamiento multi-paso y capacidades multilingues: no disponibles (no es un modelo de lenguaje).

## Casos de uso

- Produccion audiovisual y cine: sustitucion de la cabeza o el cuerpo de un actor por el de un doble en planos concretos, usando el LoRA de Qwen-Image 2.1 y el flujo de trabajo de ComfyUI incluido para mantener la coherencia de iluminacion con la imagen original.
- Previsualizacion de casting y vestuario: generar variantes de una misma escena con distintas identidades de referencia antes de rodar, aprovechando que el LoRA se aplica sobre un modelo de edicion y conserva la composicion y el fondo de la imagen de entrada.
- Fotografia de producto y moda: sustituir la persona que aparece en una sesion por otra identidad manteniendo postura, ropa y escenario, con la variante de body swap para cambios de cuerpo completo.
- Postproduccion fotografica y retoque: corregir cabezas o caras en fotografias de grupo donde alguien ha salido mal, usando la version de head swap sobre Qwen-Image-Edit 2511.
- Creacion de contenido para redes y avatares: generacion de avatares personalizados a partir de una referencia facial, con la cautela de no emplear imagenes de personas sin consentimiento.
- Prototipado de pipelines de edicion en ComfyUI: el repositorio funciona como banco de pruebas para comparar el mismo objetivo de sustitucion entre backbones distintos (Qwen, FLUX.2 Klein, Krea 2) y decidir cual encaja mejor en un flujo de produccion.
- Investigacion sobre adaptadores LoRA: analisis del efecto del rango (16, 32, 64, 128) y la precision (fp16, fp32) en la fidelidad de la identidad transferida, usando los puntos de control publicados como material de comparacion.
- Experimentacion con video: prueba de los pesos LTX-2 para sustitucion de cabeza en secuencias, asumiendo su caracter experimental y la ausencia de garantias de estabilidad temporal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (ni FID, ni similitud de identidad, ni LPIPS) y el autor advierte explicitamente de que los ejemplos del repositorio son demostraciones y no una garantia de resultados identicos en cualquier imagen.

## Requisitos de hardware

Las cifras siguientes son estimaciones orientativas derivadas del tamano del repositorio (13,0 GB) y del tipo de modelo base; el autor no publica requisitos oficiales.

- Qwen-Image 2.1 y Qwen-Image-Edit 2509/2511: modelos de difusion de gran tamano; en bf16 requieren GPU de datacenter con 80 GB (A100, H100). Con cuantizacion agresiva y descarga por etapas en ComfyUI, pueden ejecutarse en GPUs de 24 GB (RTX 4090, RTX 3090) a costa de velocidad y de resolucion maxima.
- FLUX.2 Klein 4B: es la opcion mas ligera de la familia; cabe con holgura en consumer GPU de 16-24 GB (RTX 4080, RTX 4090) en fp16, y en 12 GB con versiones fp8.
- FLUX.2 Klein 9B: viable en 24 GB con fp8; en fp16 conviene disponer de 32-48 GB (A6000, L40S, A100 40 GB).
- Krea 2 Raw: sin datos publicos de tamano en la informacion disponible; se asume un perfil de VRAM similar al de los backbones de difusion de gran escala.
- LTX-2 (experimental): al ser un modelo de video, el consumo de VRAM escala con el numero de fotogramas y con la resolucion; se recomienda GPU de 24 GB o superior y validar la estabilidad temporal antes de usarlo en produccion.
- Opciones de despliegue: ComfyUI es el entorno documentado por el autor (se incluyen flujos JSON); la libreria declarada es diffusers, por lo que tambien es posible cargar los LoRA mediante el pipeline image-to-image de Diffusers. vLLM, llama.cpp, Ollama y TGI no aplican, al no tratarse de un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependen por completo del backbone elegido, de la resolucion de salida, del numero de pasos de muestreo y del uso o no de cuantizacion.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparacion se limita a caracteristicas estructurales frente a las alternativas del mismo tipo: adaptadores faciales sobre modelos de edicion y pipelines dedicados de face swap.

| Alternativa | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BFS (hamedhz86/Swap_face) | Coleccion de LoRA para face, head y body swap | no disponible (repo de 13,0 GB) | no aplica | MIT | HuggingFace, 0 descargas, 0 likes |
| Qwen-Image-Edit 2511 sin LoRA | Modelo base de edicion de imagen | no disponible | no aplica | no disponible en la informacion proporcionada | HuggingFace (modelo base citado) |
| FLUX.2 Klein 9B | Modelo base de difusion imagen a imagen | 9B (segun el nombre del modelo) | no aplica | no disponible en la informacion proporcionada | HuggingFace, con variante fp8 |
| Krea 2 Raw | Modelo base de generacion y edicion de imagen | no disponible | no aplica | indicado como krea (nombre de la organizacion) | HuggingFace |
| Inswapper / pipelines dedicados de face swap | Modelo especifico de sustitucion facial | no disponible | no aplica | no disponible | ecosistema aparte, no incluido en esta ficha |

La diferencia principal frente a los backbones sin adaptar es que BFS no anade un modelo nuevo, sino que condiciona un modelo de edicion existente hacia la transferencia de identidad; por tanto, su calidad final queda acotada por la del backbone sobre el que se aplique.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay metricas de fidelidad de identidad, realismo ni consistencia temporal, por lo que la evaluacion depende de pruebas propias.
- Sin informacion de entrenamiento: no se documentan el dataset, su procedencia, el consentimiento de las personas representadas ni el numero de pasos de entrenamiento.
- Riesgo de uso indebido: la sustitucion de caras es una tecnologia con alto potencial de deepfake. El propio autor indica que no se deben usar ni compartir resultados con figuras publicas o personas que no hayan dado su consentimiento.
- Marco legal: en la Union Europea, la generacion y difusion de deepfakes sin etiquetado puede incumplir las obligaciones de transparencia del Reglamento de IA y las normas de proteccion de datos; conviene verificar la normativa aplicable antes de cualquier uso publicado.
- Licencia del adaptador frente a licencia del base: los pesos LoRA se declaran bajo MIT, pero cada modelo base (Qwen, FLUX.2 Klein, Krea 2, LTX-2) mantiene su propia licencia, que puede restringir el uso comercial. Este punto no se detalla en la model card.
- Dependencia estricta del backbone: el autor advierte de que hay que usar el LoRA con su modelo base correspondiente y de que el orden de las imagenes de entrada varia entre versiones; cargar un LoRA sobre otro backbone o invertir las entradas degrada el resultado.
- Idioma: la model card solo declara ingles, de modo que los prompts de edicion en otros idiomas no estan soportados oficialmente.
- Madurez del proyecto: creado y ultima actualizacion el 2026-10-15, con cero descargas y cero likes; no hay validacion de la comunidad ni historial de mantenimiento. La rama de LTX-2 se etiqueta explicitamente como experimental.
- Variabilidad de resultados: la documentacion senala que los ejemplos no garantizan resultados identicos en cualquier imagen; la intensidad de LoRA (valor inicial 1.0) debe ajustarse por modelo base, resolucion y referencia.
- Resolucion de imagen: la model card no especifica resoluciones maximas ni minimas soportadas.
- Sin soporte de texto, razonamiento, codigo ni tool calling: al ser un modelo de difusion, no cubre casos de uso de lenguaje.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hamedhz86/Swap_face
- Guia de head swap V1 / V1.1 para Qwen Image 2.1: docs/qwen-image-2.1.md (ruta relativa dentro del repositorio)
- Guia de body swap V1.0 para Qwen Image 2.1: docs/qwen-image-2.1-body.md (ruta relativa dentro del repositorio)
- Guia de Qwen Image Edit 2509/2511: docs/qwen-image-edit.md (ruta relativa dentro del repositorio)
- Guia de FLUX 2 Klein: docs/flux-2-klein.md (ruta relativa dentro del repositorio)
- Guia de Krea 2: docs/krea-2.md (ruta relativa dentro del repositorio)
- Pesos experimentales de LTX-2: docs/ltx-2.md (ruta relativa dentro del repositorio)
- Flujo de trabajo de ComfyUI: workflows/Head Swap V1 Qwen 2.1 Workflow.json (ruta relativa dentro del repositorio)
- Ejemplos de Qwen Image 2.1: images/bfs_qwen_2.1_1.png a images/bfs_qwen_2.1_8.png (rutas relativas dentro del repositorio)
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo: los resultados obtenidos corresponden a sitios de contenido para adultos sin relacion con el proyecto, por lo que no se incluyen.
