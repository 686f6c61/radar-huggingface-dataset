# Hearmeman/comfyui-template-assets

## Resumen

`Hearmeman/comfyui-template-assets` no es un modelo de IA generativa en el sentido habitual, sino un repositorio espejo de pesos de terceros utilizados por las plantillas de ComfyUI para RunPod publicadas por HearmemanAI. El repositorio no entrena ni publica modelos propios: su función es servir como fuente de descarga estable para un conjunto heterogéneo de ficheros (upscalers de imagen, un modelo de refinado de piel y pesos de interpolación de fotogramas) cuyos hosts originales han cambiado o retirado ficheros en el pasado.

El contenido se organiza en dos directorios: `upscale_models/` (tres modelos de superresolución en formato `.pth`) y `frame_interpolation/` (un modelo RIFE 4.26). Cada fichero se redistribuye sin modificar, con checksum SHA-256 verificado y bajo la licencia original del autor, que varía por fichero (CC-BY-4.0, CC-BY-NC-SA-4.0 y MIT). No hay licencia única a nivel de repositorio.

Por tanto, esta ficha describe un contenedor de artefactos, no un LLM ni un modelo multimodal con contexto o parámetros en el sentido de transformers. Los datos de arquitectura, número de parámetros, ventana de contexto o idiomas no aplican y se indican como no disponibles. Su relevancia es operativa: simplifica el despliegue reproducible de pipelines de vídeo e imagen en ComfyUI sobre RunPod.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Contenedor de artefactos; incluye modelos de superresolución (4xLSDIR, SPAN, modelado de detalle) y RIFE 4.26 para interpolación de fotogramas |
| Parametros totales | no disponible (depende del fichero; tamaños entre ~8,9 MB y ~67 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no disponible (pesos `.pth` en precisión original) |
| Idiomas soportados | no aplica |
| Licencia | Múltiple por fichero: CC-BY-4.0, CC-BY-NC-SA-4.0 y MIT; sin licencia única de repositorio |
| Formato de pesos | `.pth` (PyTorch) |
| Tamano del repositorio | 6,0 GB |
| Fecha de espejado | 2026-08-13 |
| Verificación de integridad | SHA-256 por fichero, coincidente con OpenModelDB cuando existe registro |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura propia. Agrupa cuatro artefactos con naturalezas distintas. `4xLSDIR.pth` es un upscaler 4x entrenado sobre el dataset LSDIR por Philip Hofmann. `1x-ITF-SkinDiffDetail-Lite-v1.pth` es un modelo de refinado de detalle de piel a escala 1x de intheflesh. `2xLiveActionV1_SPAN_490000.pth` es un upscaler 2x basado en arquitectura SPAN, orientado a vídeo de acción real, de jcj83429. `rife426.pth` corresponde a los pesos RIFE 4.26 del proyecto Practical-RIFE de hzwer, para interpolación de fotogramas.

No se proporcionan datos de entrenamiento (número de tokens, composición del dataset, fases de RLHF/DPO) para ninguno de los ficheros, más allá de la mención al dataset LSDIR para el primero. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal, que no aplican a estos modelos. El valor técnico del repositorio es la reproducibilidad: checksums verificados y correspondencia byte a byte con las releases upstream.

## Capacidades

- Superresolución de imagen 4x mediante `4xLSDIR.pth`, adecuada para fotografía y material genérico.
- Superresolución de vídeo 2x mediante `2xLiveActionV1_SPAN_490000.pth`, optimizada para metraje de acción real.
- Refinado de detalle de piel a 1x con `1x-ITF-SkinDiffDetail-Lite-v1.pth`, pensado para posprocesado de retratos.
- Interpolación de fotogramas de vídeo con RIFE 4.26, para aumentar la tasa de fotogramas efectiva.
- Integración directa en nodos de ComfyUI (`upscale_models`, `frame_interpolation`).
- No soporta generación de texto, razonamiento, código, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Restauración de fotografía antigua o de baja resolución: aplicar `4xLSDIR.pth` en un nodo de upscale de ComfyUI para cuadruplicar la resolución antes de un reescalado final o de un paso de detalle.
- Posproducción de retratos: encadenar el upscaler 4x con `1x-ITF-SkinDiffDetail-Lite-v1.pth` para recuperar textura de piel sin introducir un aspecto plástico, habitual en flujos de retoque.
- Mejora de metraje de vídeo de acción real: usar `2xLiveActionV1_SPAN_490000.pth` sobre secuencias rodadas para duplicar resolución manteniendo coherencia temporal, al estar entrenado específicamente para ese dominio.
- Conversión de 24 a 60 fps en vídeo: interpolar fotogramas con `rife426.pth` en el pipeline de ComfyUI para generar movimiento fluido sin recapturar.
- Despliegue reproducible en RunPod: emplear el repositorio como fuente única de descarga en las plantillas de HearmemanAI, evitando fallos por enlaces upstream retirados o movidos.
- Auditoría de procedencia en entornos de investigación: verificar los SHA-256 de cada peso frente a los registros de OpenModelDB antes de incorporarlos a un pipeline experimental.
- Pruebas de pipelines de vídeo e imagen en CI: descargar artefactos versionados y con checksum fijo para tests deterministas de nodos de ComfyUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de PSNR, SSIM, LPIPS ni comparativas cuantitativas para ninguno de los ficheros.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Por el tamaño de los pesos (entre ~8,9 MB y ~67 MB), los upscalers y RIFE son ligeros y caben holgadamente en GPUs de consumo; el consumo real depende de la resolución de entrada y del tamaño de tile configurado en ComfyUI.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; para vídeo a resolución alta se recomienda al menos 8-12 GB de VRAM y, preferiblemente, 16 GB o más para procesar lotes de fotogramas sin trocear.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, 4060, 4070, 4080 y 4090, así como en A100 y H100 para cargas por lotes.
- Opciones de despliegue: ComfyUI (nodos nativos de upscale e interpolación), plantillas de HearmemanAI para RunPod; no aplican vLLM, llama.cpp, Ollama ni TGI al no ser un LLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Escala | Licencia | Disponibilidad |
|---|---|---|---|---|
| 4xLSDIR (Phhofm) | Upscaler imagen | 4x | CC-BY-4.0 | OpenModelDB / GitHub |
| 2xLiveActionV1-SPAN (jcj83429) | Upscaler vídeo | 2x | CC-BY-NC-SA-4.0 en la revisión espejada; Apache-2.0 en HEAD | OpenModelDB / GitHub |
| 1x-ITF-SkinDiffDetail-Lite-v1 (intheflesh) | Refinado de piel | 1x | CC-BY-NC-SA-4.0 | OpenModelDB |
| RIFE 4.26 (hzwer, Practical-RIFE) | Interpolación de fotogramas | no aplica | MIT | GitHub |

No se dispone de datos de rendimiento comparativo entre estos modelos y alternativas como Real-ESRGAN o SwinIR en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no es un modelo entrenado por Hearmeman; cualquier cita o atribución debe dirigirse a los autores originales listados en la model card.
- Licencias heterogéneas: `1x-ITF-SkinDiffDetail-Lite-v1` y `2xLiveActionV1_SPAN_490000` están bajo CC-BY-NC-SA-4.0, lo que restringe el uso comercial y exige compartir bajo la misma licencia. Verificar cada fichero antes de usarlo en producción.
- Discrepancia de licencia en `2xLiveActionV1_SPAN_490000`: el README actual del autor indica Apache-2.0, pero el repositorio honra la licencia más estricta de la revisión espejada (CC-BY-NC-SA-4.0). Conviene consultar al autor antes de un uso comercial.
- No hay garantía de mantenimiento o actualización de los artefactos; el espejo se congeló el 2026-08-13.
- Riesgo de alucinación no aplica; en su lugar, los upscalers pueden introducir artefactos o texturas inventadas en zonas de baja información.
- No apto para tareas de texto, razonamiento, código o agentes; no es un LLM.
- El tamaño del repositorio (6,0 GB) incluye otros artefactos no detallados en la model card; revisar el listado completo antes de clonar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Hearmeman/comfyui-template-assets
- 4xLSDIR en OpenModelDB: https://openmodeldb.info/models/4x-LSDIR
- Fuente original 4xLSDIR: https://github.com/Phhofm/models/raw/main/4xLSDIR/4xLSDIR.pth
- 1x-ITF-SkinDiffDetail-Lite-v1 en OpenModelDB: https://openmodeldb.info/models/1x-ITF-SkinDiffDetail-Lite-v1
- 2xLiveActionV1-SPAN en OpenModelDB: https://openmodeldb.info/models/2x-LiveActionV1-SPAN
- Repositorio de jcj83429: https://github.com/jcj83429/upscaling
- Practical-RIFE (hzwer): https://github.com/hzwer/Practical-RIFE
- Licencia MIT de Practical-RIFE: https://github.com/hzwer/Practical-RIFE/blob/main/LICENSE
- ComfyUI-Frame-Interpolation: https://github.com/Fannovel16/ComfyUI-Frame-Interpolation
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- Licencia CC-BY-NC-SA-4.0: https://creativecommons.org/licenses/by-nc-sa/4.0/
