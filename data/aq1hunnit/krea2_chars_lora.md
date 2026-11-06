# aq1hunnit/Krea2_Chars_LoRA

## Resumen

Krea2 Chars LoRA es una coleccion de 84 LoRAs de personajes para el modelo base KREA2 (y su variante turbo), publicada en Hugging Face por el usuario aq1hunnit. Cada LoRA reproduce el parecido facial de una persona concreta —en su mayoría celebridades, actrices y modelos— y se acompaña de un fichero `persona .md` que describe sus rasgos faciales estables, apariencia variable y rango de expresiones, junto con los captions de entrenamiento.

El proyecto destaca menos por el modelo en sí y más por su proceso de producción: según la model card, todo el pipeline (scraping de imágenes, curación, captioning, entrenamiento y publicación) fue ejecutado de extremo a extremo por un agente autónomo (Hermes Agent de Nous Research, servido por el modelo Kimi K3) sin revisión manual. Los LoRAs fueron posteriormente re-rankeados mediante SVD dinámico (`sv_fro`, retención 0.998, rango máximo 16) y podados por bloques, eliminando los 8 bloques transformer de menor impacto (~3 % de la energía del delta).

Es relevante como caso de estudio de automatización agéntica del entrenamiento de LoRAs y como recurso para generación de personajes consistentes en ComfyUI. Sin embargo, plantea serias preocupaciones éticas y legales: reproduce el rostro de personas reales sin consentimiento documentado, lo que lo hace inadecuado para la mayoría de usos productivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptadores de bajo rango) sobre modelo de difusion text-to-image KREA2 |
| Parametros totales | no disponible (repo completo: 6,0 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo base KREA2) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (un fichero por personaje, mas ficheros `.md` de persona) |

## Arquitectura y entrenamiento

Cada elemento de la coleccion es un LoRA entrenado sobre KREA2 (compatible tambien con la variante turbo) usando Ostris AI-Toolkit en pods de GPU gestionados automaticamente via RunPod API. Los ajustes exactos de entrenamiento (rango inicial, learning rate, pasos, resolucion) no estan disponibles en la model card, que solo indica que se usaron "user predefined settings".

Tras el entrenamiento, cada LoRA paso por un post-proceso de compresion en dos fases: un re-ranking con SVD dinamico metrica `sv_fro` (retencion de energia 0.998, rango maximo 16) y un block pruning que elimina los 8 bloques transformer de menor impacto (bloques 1-8, ~3 % de la energia del delta). El objetivo es reducir el tamano del adaptador minimizando la degradacion visual, verificada con imagenes de comparacion incluidas en la carpeta `Pruned_Comparison`.

El dataset de cada personaje se construyo automaticamente: scraping de fotos web, deteccion y recorte de rostros con Ultralytics YOLO, filtrado de contenido (sin imagenes generadas por IA, sujeto correcto, umbral de nitidez), scoring estetico con un discriminador basado en el ERNIE aesthetic image scorer, y captioning con Gemma-4 26B (abliterated) vision. Las fichas de persona se sintetizaron a partir del analisis de rasgos de los captions.

## Capacidades

- Generacion de imagenes text-to-image con parecido facial consistente de 84 personajes concretos, compatible con el modelo base KREA2 y su variante turbo.
- Integracion directa en ComfyUI mediante ficheros safetensors estandar.
- Ficheros `persona .md` por personaje que describen rasgos faciales estables, apariencia variable y expresiones, utiles como guia de prompting.
- Versiones podadas (rank reducido y bloques eliminados) con menor huella de memoria y coste de inference.
- No aplica: tool calling, agentes, razonamiento, codigo ni capacidades multilingues propias de LLMs.

## Casos de uso

- Estudio de pipelines agenticos de entrenamiento: el repo documenta de forma detallada como un agente autonomo orquesto scraping, curacion, entrenamiento y publicacion, lo que lo hace util como referencia para replicar flujos similares con contenido propio.
- Investigacion en compresion de LoRAs: los ficheros de re-ranking SVD y block pruning, junto con las imagenes de comparacion, permiten evaluar cuanta energia del delta puede eliminarse sin degradacion perceptible.
- Prototipado de consistencia de personajes en ComfyUI: los ficheros persona `.md` ilustran como estructurar documentacion de rasgos para prompting consistente, metodologia aplicable a personajes originales.
- Benchmark de calidad de LoRA vs. peso completo: la carpeta `Pruned_Comparison` ofrece pares de imagenes para comparar visualmente LoRAs podados frente a referencias.
- Referencia de formato de distribucion: la estructura de carpetas (un LoRA + persona + captions por personaje) es un ejemplo organizado de publicacion de colecciones de adaptadores.
- Advertencia: la generacion de imagenes fotorrealistas de personas reales sin consentimiento (deepfakes) no es un caso de uso legitimo y puede ser ilegal segun jurisdiccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica evaluacion incluida es cualitativa: imagenes de ejemplo generadas con los LoRAs podados en la carpeta `Pruned_Comparison`. No hay metricas FID, CLIP score ni comparaciones cuantitativas.

## Requisitos de hardware

- VRAM para inference: no disponible explicitamente; al ser LoRAs sobre KREA2, los requisitos vienen dictados por el modelo base. Los LoRAs podados (rank maximo 16, 8 bloques eliminados) reducen la memoria del adaptador respecto a versiones sin podar.
- GPU recomendadas: no disponible; para el modelo base KREA2 en inference local, una GPU consumer de gama alta (RTX 3090/4090, 24 GB) es tipica en modelos de difusion de ultima generacion, pero debe verificarse con las specs de KREA2.
- Tamano del repo completo: 6,0 GB para los 84 LoRAs (media aproximada de ~70 MB por adaptador, incluyendo ficheros auxiliares).
- Despliegue: ComfyUI (uso documentado); compatible con cualquier runtime que cargue safetensors LoRA sobre KREA2.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Aspecto | Krea2 Chars LoRA | LoRAs de personaje tipicos en Civitai | Entrenamiento propio de LoRA |
|---|---|---|---|
| Contenido | 84 LoRAs de celebridades sobre KREA2 | LoRAs individuales, variedad de bases (SDXL, Flux, etc.) | Adaptador a medida sobre datos propios |
| Licencia | Apache 2.0 | Variable, frecuentemente restrictiva | Depende del modelo base |
| Documentacion | Persona `.md` por personaje, pipeline agentic documentado | Frecuentemente escasa | Control total |
| Riesgo legal | Alto: rostros de personas reales sin consentimiento documentado | Alto en casos de celebridades | Bajo si se usan datos con derechos |

No existen alternativas directas publicadas con la misma escala (84 personajes) y metodologia agentic documentada; la comparacion es categorica.

## Limitaciones y advertencias

- Riesgo etico y legal grave: los LoRAs reproducen el parecido de personas reales (actrices, modelos, cantantes, figuras publicas) presumiblemente sin su consentimiento. Su uso para deepfakes puede infringir derechos de imagen, leyes de proteccion de datos (RGPD en Europa, leyes especificas contra deepfakes) y normas de plataformas.
- La model card declara que no hubo "manual review gates" en el pipeline: ni el dataset ni los outputs fueron revisados por humanos, lo que implica riesgo de datos mal curados, sujetos incorrectos o contenido inadecuado.
- El captioning uso un modelo "abliterated" (sin salvaguardas) explicitamente para obtener captions sin restricciones, lo que sugiere ausencia de filtros de seguridad en el dataset.
- Licencia Apache 2.0: permite uso comercial del adaptador en si, pero no otorga derechos sobre la semejanza de las personas representadas ni sobre las imagenes fuente.
- Datos de rendimiento ausentes: no hay metricas de fidelidad, ni instrucciones de pesos de LoRA recomendados, ni triggers documentados por personaje.
- Cero descargas registradas y historial minimo del repo: proyecto sin trayectoria comunitaria ni auditoria externa.
- La fecha de creacion indicada (2026-10-27) y las referencias a modelos como "KREA2", "Kimi K3" o "Gemma-4" no corresponden a versiones publicadas y verificables en el momento de redaccion, por lo que la procedencia del material no puede validarse.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/aq1hunnit/Krea2_Chars_LoRA
- Hermes Agent (Nous Research, citado en la model card): https://hermes-agent.nousresearch.com
- Pagina del modelo base KREA2: no disponible en la informacion proporcionada
- Paper o blog del proyecto: no disponible
