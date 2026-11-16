# rounaksaha12/nemotron3.5-30b-a3b_p2-acu-soft-bce-passage_pure1.0_mixw1.0_lora-r16_lr5e-05_linear_ep4_mixedbce

## Resumen

Este repositorio contiene un adaptador LoRA (r=16) entrenado sobre el modelo base `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`, un transformer de tipo Mixture-of-Experts con 30.000 millones de parametros totales y aproximadamente 3.000 millones de parametros activos por token (de ahi el sufijo `30B-A3B`). El adaptador se ha afinado para una tarea concreta de clasificacion: deteccion de texto generado por IA, segun indica el tag `ai-text-detection`. El nombre del repositorio codifica la configuracion del entrenamiento: funcion de perdida combinada soft-BCE, entrenamiento en cuatro epocas, learning rate de 5e-05, scheduler lineal y una mezcla de datos con pesos `pure1.0` y `mixw1.0`.

El interes de esta ficha es doble. Por un lado, documenta un caso de uso practico de ajuste fino eficiente (LoRA) sobre un modelo MoE grande para una tarea de clasificacion binaria, algo relevante para equipos que quieren reutilizar modelos abiertos de NVIDIA sin desplegar el modelo completo en produccion. Por otro lado, el repositorio presenta numerosas lagunas de documentacion: no hay model card sustantiva, no se declaran idiomas, licencia ni pipeline, y el acceso esta restringido (gated). Cualquier evaluacion seria exige contactar con el autor o reproducir el entrenamiento.

El dato de parametros totales reportado por safetensors (11.367.296) corresponde al tamano del adaptador LoRA, no al modelo base, que no se distribuye en este repositorio. El peso del repositorio es de apenas 0,1 GB, coherente con un adaptador de rango bajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=16, alpha no disponible) sobre transformer MoE NVIDIA Nemotron-3.5-Lightning-30B-A3B |
| Parametros totales | 11.367.296 (adaptador LoRA); modelo base: 30B totales (segun nomenclatura del nombre) |
| Parametros activos | ~3B en el modelo base (segun nomenclatura `A3B`); no aplica al adaptador |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones del base no documentadas aqui) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 |
| Tarea | Deteccion de texto generado por IA (clasificacion) |
| Acceso | Restringido (gated) en Hugging Face |
| Descargas / likes | 2 / 0 |
| Fecha de creacion | 2026-11-07 |
| Ultima actualizacion | 2026-11-16 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre NVIDIA Nemotron-3.5-Lightning-30B-A3B, un modelo de lenguaje de tipo Mixture-of-Experts con 30.000 millones de parametros totales y aproximadamente 3.000 millones activos por token, distribuido por NVIDIA en precision BF16. La arquitectura exacta del base (numero de expertos, capas, atencion, contexto maximo) no se detalla en la informacion disponible de este repositorio; debe consultarse la model card oficial de NVIDIA.

El ajuste fino utiliza LoRA con rango 16 y una cabeza de clasificacion para deteccion de texto IA. El nombre del repositorio indica una perdida combinada soft-BCE (binary cross-entropy suavizada), entrenamiento durante 4 epocas con learning rate 5e-05 y scheduler lineal, sobre una mezcla de datos con pesos `pure1.0` y `mixw1.0`. No se especifica el volumen del dataset, su composicion, la proporcion de ejemplos humanos frente a generados, ni si hubo validacion cruzada o calibracion de umbral. Tampoco se documenta que modulos del transformer reciben el adaptador (q_proj, k_proj, v_proj, etc.).

## Capacidades

- Clasificacion binaria de texto como generado por IA o escrito por humanos, segun el tag `ai-text-detection`.
- Reutilizacion del conocimiento linguistico del modelo base Nemotron-3.5-Lightning-30B-A3B mediante LoRA, sin necesidad de reentrenar el MoE completo.
- Inferencia sobre pasajes de texto (`passage` en el nombre del repositorio), lo que sugiere entrenamiento orientado a fragmentos mas que a documentos completos.
- Capacidades generativas del modelo base (texto, razonamiento, codigo) potencialmente preservadas, aunque el adaptador esta orientado a clasificacion y no se documenta su impacto en generacion.
- Soporte de tool calling, agentes, vision o audio: no disponible para este adaptador.
- Capacidades multilingues: no disponible.

## Casos de uso

- Moderacion de contenido en plataformas: el adaptador puede puntuar fragmentos de texto enviados por usuarios para detectar contenido generado automaticamente y aplicar politicas de publicacion o etiquetado. Es adecuado por su entrenamiento especifico en pasajes y su bajo coste de despliegue frente al modelo base completo.
- Deteccion de ensayos o trabajos academicos generados por IA: integrado en un pipeline de revision, el clasificador puede marcar pasajes sospechosos para revision humana, aprovechando que el adaptador se entreno sobre fragmentos (`passage`) y no sobre documentos enteros.
- Filtrado de datasets para entrenamiento: antes de incorporar corpus web a un pipeline de preentrenamiento o fine-tuning, el modelo puede descartar pasajes sinteticos, reduciendo el riesgo de colapso por datos generados.
- Verificacion en periodismo y fact-checking: como primera senal automatica para priorizar la revision manual de articulos o comunicados sospechosos de generacion sintetica.
- Clasificacion por lotes en backend: al ser un adaptador LoRA de 11,4 millones de parametros sobre un base MoE de 30B con 3B activos, puede servirse en infraestructura moderada comparado con un denso de 30B, permitiendo procesar grandes volumenes de pasajes por hora.
- Investigacion en deteccion de texto IA: como punto de partida reproducible para comparar estrategias de LoRA, funciones de perdida (soft-BCE) y mezclas de datos en tareas de clasificacion, dado que el nombre del repositorio documenta la configuracion exacta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para el adaptador: despreciable (11,4 millones de parametros en safetensors, ~0,1 GB en el repositorio).
- VRAM para el modelo base: no disponible en la informacion proporcionada. Como referencia orientativa, un MoE de 30B en BF16 requiere del orden de 60 GB solo para pesos, por lo que no cabe en GPUs de consumo de 24 GB sin cuantizacion; con cuantizacion de 4 bits podria reducirse a ~15-18 GB, aunque este dato no esta confirmado para este modelo concreto.
- GPU recomendadas: no disponible. Por tamano del base, serian necesarias A100 80GB, H100 o configuraciones multi-GPU para BF16; para cuantizacion, una RTX 4090 de 24 GB podria ser suficiente, sin confirmacion oficial.
- Despliegue: al ser un adaptador PEFT, requiere cargar el base con `transformers` + `peft`. Opciones de servido como vLLM o TGI no documentadas para este adaptador; llama.cpp/Ollama requeririan conversion y no estan soportadas de forma nativa para LoRA de clasificacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (rounaksaha12) | 11,4 M (LoRA) sobre 30B MoE | no disponible | Deteccion de texto IA | no disponible | Gated, 2 descargas |
| Modelo base NVIDIA Nemotron-3.5-Lightning-30B-A3B | 30B totales / ~3B activos | no disponible | Generacion general | no disponible en esta ficha | Publico en HF (NVIDIA) |
| Clasificadores de texto IA tipo OpenAI detector / GPTZero | no disponible | no disponible | Deteccion de texto IA | propietaria | API comercial |
| RoBERTa-large fine-tuned para deteccion IA (familia comun en literatura) | ~355 M | 512 tokens | Deteccion de texto IA | MIT / Apache-2.0 segun variante | Publicos en HF |

La comparativa es limitada: no hay datos publicos de rendimiento de este adaptador que permitan confrontarlo con alternativas. Frente a clasificadores basados en RoBERTa, la ventaja teorica es el mayor conocimiento del modelo base MoE; la desventaja es el coste de servir un base de 30B y la ausencia de metricas.

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: no se documentan datos de entrenamiento, metricas, umbrales ni metodologia de evaluacion.
- Licencia no declarada: no puede asumirse uso comercial. Ademas, la licencia del modelo base NVIDIA debe verificarse por separado y puede imponer restricciones adicionales.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que complica la reproducibilidad y el despliegue automatizado.
- Riesgo de sesgo: al desconocerse la composicion del dataset, no puede evaluarse el sesgo por dominio, idioma, registro o variedad dialectal. La deteccion de texto IA es especialmente sensible a falsos positivos en textos de hablantes no nativos o estilos formales.
- Riesgo de alucinacion en la etiqueta: los clasificadores de texto IA pueden sobreconfiar; sin curvas ROC/PR publicadas no puede fijarse un umbral de produccion.
- Idiomas: no declarados. El modelo base podria ser multilingue, pero el adaptador se entreno presumiblemente sobre un corpus no documentado.
- Solo 2 descargas y 0 likes: sin validacion por parte de la comunidad; no hay issues ni discusion que aporten evidencia externa.
- Fecha de creacion futura (2026-11-07) en los metadatos: conviene verificar la integridad del repositorio antes de usarlo.
- El adaptador no sustituye al modelo base para tareas generativas; su uso esta acotado a clasificacion de pasajes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rounaksaha12/nemotron3.5-30b-a3b_p2-acu-soft-bce-passage_pure1.0_mixw1.0_lora-r16_lr5e-05_linear_ep4_mixedbce
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Perfil del autor: https://huggingface.co/rounaksaha12
