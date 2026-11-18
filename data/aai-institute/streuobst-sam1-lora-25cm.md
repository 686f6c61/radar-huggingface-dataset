# aai-institute/streuobst-sam1-lora-25cm

## Resumen

Streuobst-sam1-lora-25cm es un adaptador LoRA de rango 128 entrenado sobre el checkpoint SAM ViT-B de Meta para segmentación binaria de Streuobstwiesen (prados de frutales tradicionales) en ortofotografía aérea de 0,25 m/píxel. Lo publica el appliedAI Institute for Europe (aai-institute) dentro de su proyecto qgis-segment, un plugin de QGIS que localiza estas explotaciones en imágenes aéreas. El modelo resuelve un problema de teledetección muy concreto: separar frutales dispersos de otros usos del suelo en teselas de 1024 x 1024 píxeles, sin reentrenar el encoder completo de SAM.

Técnicamente es un adaptador, no un modelo autónomo: requiere el checkpoint original `sam_vit_b_01ec64.pth` de Meta (Apache-2.0) y solo modifica las proyecciones query y value de la atención del image encoder. El prompt encoder y el mask decoder quedan intactos, y la inferencia se hace con una única caja que cubre toda la tesela, igual que en entrenamiento. La salida es un logit por píxel; el plugin considera frutal todo valor superior a 0.

Es relevante ahora porque el autor lo mantiene como alternativa de comparación frente a su modelo por defecto, `streuobst-sam2.1-25cm`, que es igual de preciso y consume aproximadamente un 30 % menos de tiempo de inferencia (1,53 frente a 2,20 s por km² en una V100). Este modelo conserva el interés para reproducibilidad, para pipelines ya montados sobre SAM 1 y para estudiar el efecto del ajuste fino con LoRA en tareas de segmentación aérea de alta resolución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAM v1 (ViT-B) con adaptadores LoRA en las proyecciones query y value del image encoder |
| Parametros totales | no disponible (el repo pesa 0,4 GB: checkpoint ViT-B más adaptadores) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de 1024 x 1024 px a 0,25 m/px |
| Tipos de cuantizacion | no disponible (se distribuye en fp32: `sam_vit_b.pth` y `lora_rank128.safetensors`) |
| Idiomas soportados | no aplica (modelo de visión, sin capacidades de texto) |
| Licencia | Apache-2.0 (pesos y código); el checkpoint base es Apache-2.0 de Meta |
| Formato de pesos | `.pth` (checkpoint SAM ViT-B original) y `.safetensors` (adaptadores LoRA, rango 128) |

## Arquitectura y entrenamiento

La arquitectura es la de SAM 1 con backbone ViT-B: image encoder tipo ViT, prompt encoder y mask decoder. El ajuste fino se limita a adaptadores LoRA de rango 128 sobre las proyecciones query y value de la atención del encoder; el resto de pesos, incluidos el prompt encoder y el mask decoder, permanecen como los publicó Meta. La entrada es una tesela RGB de 1024 x 1024 píxeles a 0,25 m/píxel con una caja que cubre la tesela completa, tanto en entrenamiento como en inferencia. La salida es un logit de frutal por píxel.

El entrenamiento usó la región de entrenamiento del benchmark v2 a 0,25 m/px con la receta elegida por un estudio Optuna de 24 trials sobre la región de calibración: learning rate 1,7e-4 con decaimiento coseno, weight decay 0,031, peso de entropía cruzada 8,5 frente a Dice 1, gradient clip 0,1, aumento de datos aéreo y teselas vacías limitadas al 49 %. Fueron 37.312 iteraciones con batch 3 en una V100, semilla 123 (las semillas 456 y 789 se entrenaron igual para medir la dispersión). Los valores de la receta están en `metadata.json`. El modelo sustituye a un primer modelo de producción (`sam_v1_01ec64`, rango 512) que había aprendido la clase fondo y puntuaba 0,484 de IoU en la ruta del plugin, frente a 0,655 de SAM 2.1 en la misma extensión de calibración.

## Capacidades

- Segmentación binaria de píxel de prados de frutales (Streuobst) en ortofotografía aérea RGB a 0,25 m/px.
- Segmentación guiada por caja: acepta un box sobre la tesela completa como prompt, el mismo esquema usado en entrenamiento.
- Salida de logits por píxel con polaridad frutal positiva, lo que permite ajustar el umbral de decisión (el plugin usa corte en 0).
- Detección de explotaciones pequeñas: encuentra el 79 % de los frutales de menos de 0,5 ha en calibración y el 84 % en la región reservada.
- No soporta tool calling, agentes, razonamiento multi-step ni generación de texto: es exclusivamente un modelo de imagen.
- No tiene capacidades multilingües ni de audio; los idiomas no aplican.
- Integración prevista con el plugin de QGIS, el servicio de inferencia y la CLI del proyecto qgis-segment mediante `streuobst.inference.model_specs.load_model("sam1-lora-25cm")`, que lee el rango LoRA de `metadata.json`.

## Casos de uso

- Inventario de prados de frutales a escala regional: procesar ortofotografías a 0,25 m/px en teselas de 1024 x 1024 y agregar los logits para obtener la superficie de Streuobst por municipio o comarca, con un IoU agrupado de 0,609 en la región reservada.
- Cartografía asistida en QGIS: el plugin qgis-segment usa este modelo como opción `sam1-lora-25cm` para preanotar polígonos que un técnico revisa y corrige, reduciendo el trabajo manual de digitalización.
- Control y seguimiento de cambios: comparar segmentaciones de la misma zona en ortofotos de distintos años para detectar pérdida o recuperación de prados de frutales, aprovechando la resolución de 0,25 m/px.
- Validación cruzada de modelos: al compartir datos, split, teselado y métricas con `streuobst-sam2.1-25cm`, sirve como referencia para evaluar el impacto de cambiar de backbone o de estrategia de adaptación (LoRA frente a ajuste completo).
- Investigación en adaptación eficiente: el adaptador de rango 128 sobre solo query y value es un caso reproducible para estudiar LoRA en segmentación densa con SAM, con receta y semillas documentadas.
- Pipelines de teledetección con SAM 1 ya desplegados: si la infraestructura existente carga checkpoints ViT-B de SAM 1, este adaptador se añade sin cambiar el decoder ni el prompt encoder, manteniendo la compatibilidad con el loader del proyecto.
- Subsidios agrarios y verificación sobre el terreno: priorizar inspecciones seleccionando las teselas con mayor probabilidad de frutal según el logit medio, dado el buen recall en parcelas pequeñas.

## Benchmarks y rendimiento

IoU agrupado sobre la malla común de 0,5 m, una pasada, sin test-time augmentation:

| Modelo | Calibración (113 km²) | Región reservada |
|---|---|---|
| Este modelo (semilla 123), corte 0 como en el plugin | 0,658 | 0,609 |
| Tres semillas, corte 0 | 0,657-0,658 | 0,609-0,613 |
| SAM 2.1 por defecto, tres semillas, corte 0 | 0,650-0,660 | 0,618-0,624 |
| Este modelo con corte ajustado en entrenamiento (-0,33) | no disponible | 0,616 |
| SAM 2.1 con corte ajustado | no disponible | 0,620 |

Con corte ajustado en teselas de entrenamiento, el IoU en la región reservada es 0,616, prácticamente empatado con SAM 2.1 (0,620); con el corte 0 que usa el plugin, SAM 2.1 queda unas 0,01 por delante. En coste de inferencia, SAM 2.1 necesita 1,53 s por km² frente a 2,20 s de este modelo en una V100, según la model card del modelo SAM 2.1. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K y similares no aplican) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del checkpoint ViT-B de SAM 1 (unos 375 MB en fp32) más los adaptadores, cabe holgadamente en GPUs de consumo, aunque la resolución de entrada de 1024 x 1024 px y el encoder ViT dominan el consumo real.
- GPU recomendadas: el autor reporta entrenamiento e inferencia en V100; cualquier GPU con al menos 8-16 GB de VRAM debería poder ejecutar la inferencia, aunque no se publican medidas por modelo.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060/4060 en adelante, sin cifras oficiales de VRAM ni latencia.
- Opciones de despliegue: el loader propio del proyecto (`streuobst.inference.model_specs.load_model`), el servicio de inferencia y la CLI de qgis-segment; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 2,20 s por km² en una V100 según la model card del modelo SAM 2.1, aproximadamente un 30 % más lento que SAM 2.1 (1,53 s por km²).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | IoU región reservada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| streuobst-sam1-lora-25cm | ViT-B + LoRA rango 128 | 1024 x 1024 px a 0,25 m/px | 0,609 (corte 0) / 0,616 (corte ajustado) | Apache-2.0 | Hugging Face, repo de 0,4 GB |
| streuobst-sam2.1-25cm | no disponible | 1024 x 1024 px a 0,25 m/px | 0,618-0,624 (corte 0) / 0,620 (corte ajustado) | no disponible en la información | Hugging Face, modelo por defecto del plugin |
| SAM ViT-B original (facebook/sam-vit-base) | ViT-B | 1024 x 1024 px | no disponible para esta tarea sin ajuste | Apache-2.0 | Hugging Face |
| Primer modelo de producción `sam_v1_01ec64` (LoRA rango 512) | ViT-B + LoRA rango 512 | 1024 x 1024 px | no disponible; 0,484 de IoU en calibración | Apache-2.0 | reemplazado, no distribuido como modelo principal |

## Limitaciones y advertencias

- Es un adaptador, no un modelo completo: sin el checkpoint `sam_vit_b.pth` de Meta no funciona; hay que conservar `LICENSE` y `NOTICE` en cada copia de los pesos.
- Entrenado con datos de una única región (benchmark v2, región de Neckar-Alb) y con imágenes de LGL Baden-Württemberg a 0,25 m/px; el rendimiento fuera de esa zona, sensor o resolución no está validado.
- Depende del umbral: con corte 0 queda por detrás de SAM 2.1 en la región reservada; el corte óptimo (-0,33 para esta semilla) se ajustó en entrenamiento y no generaliza necesariamente.
- Riesgo de falsos positivos y negativos en teselas con frutales muy dispersos, mezclados con otros cultivos leñosos o con sombras; el recall en parcelas de menos de 0,5 ha es del 79-84 %, no del 100 %.
- Los pesos no contienen imágenes ni polígonos de etiquetas, pero las etiquetas de referencia provienen del Regionalverband Neckar-Alb y su uso está sujeto a la permisibilidad otorgada por esa entidad; la licencia Apache-2.0 cubre los pesos, no los datos de origen.
- No es un modelo generativo ni conversacional: no admite instrucciones en lenguaje natural, tool calling ni razonamiento multi-step; cualquier uso fuera de segmentación por caja requiere reentrenamiento.
- El autor lo mantiene como alternativa de comparación y no como opción por defecto; para producción recomienda SAM 2.1 por precisión equivalente y menor coste de inferencia.
- No se publican datos de sesgo, robustez frente a cambios estacionales ni evaluaciones con imágenes de otros proveedores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aai-institute/streuobst-sam1-lora-25cm
- Modelo SAM 2.1 del mismo proyecto: https://huggingface.co/aai-institute/streuobst-sam2.1-25cm
- Modelo base SAM ViT-B de Meta: https://huggingface.co/facebook/sam-vit-base
- Repositorio de SAM de Meta: https://github.com/facebookresearch/segment-anything
- Proyecto qgis-segment del appliedAI Institute: repositorio aún no público según la model card (enlace pendiente de publicar)
- Fuente de las imágenes: https://www.lgl-bw.de y licencia dl-de/by-2-0 en https://www.govdata.de/dl-de/by-2-0
- Regionalverband Neckar-Alb (etiquetas de referencia): https://www.rvna.de
