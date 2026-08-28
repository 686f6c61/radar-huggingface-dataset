# DriveEK/roadready-ltx23-iclora

## Resumen

RoadReady es un IC-LoRA (In-Context LoRA) desarrollado por DriveEK, un editor de comerciales de automoción, para el modelo de generación de vídeo LTX-2.3 de Lightricks. Su función es eliminar daños en la superficie de carreteras (grietas, manchas, parches) en metraje de conducción, devolviendo el asfalto a un estado limpio sin alterar el resto de la escena: coches, sombras, reflejos y entorno permanecen intactos. No requiere máscaras ni rotoscopia, lo que agiliza una de las correcciones más comunes y presupuestariamente disputadas en la producción de anuncios de coches.

El adaptador se entrenó sobre LTX-2.3 22b (dev) con el trainer oficial de LTX, y se probó con la versión destilada `ltx-2.3-22b-distilled-1.1 fp8`, que cabe en una GPU de 24 GB. El repositorio incluye el LoRA en formato safetensors (rank 32, paso 2000), un workflow de ComfyUI listo para arrastrar y soltar, y la licencia comunitaria de LTX-2. El modelo se presentó al LTX LoRA Jam en la categoría Utility, y su relevancia radica en resolver un problema muy concreto de postproducción con una solución generativa de vídeo a vídeo, sin necesidad de herramientas de composición tradicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | IC-LoRA (In-Context LoRA) sobre LTX-2.3 22b (dev) |
| Parametros totales | no disponible (rank 32, archivo de 0.3 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base LTX-2.3) |
| Tipos de cuantizacion | no disponible (el LoRA es safetensors; el base probado es fp8) |
| Idiomas soportados | no disponible (prompts en inglés según la plantilla) |
| Licencia | ltx-2-community-license (uso restringido al modelo LTX) |
| Formato de pesos | safetensors (LoRA) + JSON (workflow ComfyUI) |

## Arquitectura y entrenamiento

RoadReady es un adaptador de bajo rango (LoRA) de tipo in-context, diseñado para condicionar la generación de vídeo de LTX-2.3 a partir de un clip de referencia. A diferencia de un LoRA de estilo global, un IC-LoRA realiza tareas específicas guiadas por una entrada de contexto, en este caso el metraje dañado que se introduce a través del nodo `LTXVAddGuide` (frame_idx 0, strength 1.0). El modelo base es LTX-2.3 22b, un transformer de vídeo de Lightricks, y el adaptador se entrenó con el trainer oficial de LTX.

El entrenamiento utilizó 49 pares alineados de vídeo dañado/limpio a resolución 960x544 y 24 fps. La mayoría de los pares se construyeron componiendo daños sobre metraje limpio grabado por el autor, lo que garantiza una alineación píxel a píxel entre entrada y salida; seis pares corresponden a daños reales de invierno con objetivos limpios restaurados manualmente. Se empleó rank 32 y 3000 pasos en una GPU H100, seleccionando el checkpoint del paso 2000 sobre el del paso 3000 en función de la fidelidad de las marcas viales y el tono del asfalto. No se menciona el uso de RLHF ni DPO; el ajuste es puramente supervisado sobre pares alineados.

## Capacidades

- Eliminación de daños en superficies de carretera: grietas, manchas, parches y desgaste del asfalto en vídeo de conducción.
- Restauración de la superficie a un estado limpio e intacto, manteniendo marcas viales, vehículos, sombras, reflejos y entorno sin cambios.
- Funciona sin máscaras ni rotoscopia: el clip dañado se introduce como referencia de contexto y el modelo genera la versión limpia.
- Compatible con LTX-2.3 en sus variantes dev y destilada fp8; no entrenado ni probado con LTX-2.5.
- Requiere la palabra de activación `ROADREADY` en el prompt para invocar el comportamiento específico.
- Integración directa con ComfyUI mediante un workflow JSON incluido en el repositorio.

## Casos de uso

- Producción de anuncios de automoción: limpiar carreteras en tomas de conducción reales o generadas, reduciendo el coste de corrección de imperfecciones del asfalto en postproducción.
- Postproducción de vídeo comercial: eliminar grietas, manchas o parches en metraje de archivo para reutilizarlo en piezas publicitarias o corporativas.
- Restauración de vídeo antiguo: limpiar superficies de carretera deterioradas en grabaciones históricas de automovilismo o documentales.
- Creación de entornos para simuladores o videojuegos: generar versiones limpias de carreteras a partir de metraje real para texturizar o referenciar escenarios.
- Automatización de tareas de VFX en estudios pequeños: sustituir procesos manuales de clonado o pintura digital por un paso generativo con un solo nodo en ComfyUI.
- Investigación en restauración de vídeo: servir como caso de estudio de IC-LoRA para tareas de restauración localizada sin máscaras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo ofrece datos cualitativos: el paso 2000 se seleccionó sobre el 3000 por mejor fidelidad de marcas viales y tono de asfalto, y se reporta un tiempo de inferencia de aproximadamente 48 segundos por clip de 97 frames en una RTX 4090. No hay métricas numéricas como PSNR, SSIM o comparaciones con otros métodos.

## Requisitos de hardware

- VRAM estimada: 24 GB para el modelo base destilado fp8 (probado en RTX 4090). El LoRA en sí ocupa 0.3 GB, pero el modelo base LTX-2.3 22b requiere esa memoria.
- GPU recomendadas: RTX 4090 para inferencia; H100 para entrenamiento (según la model card).
- Compatibilidad con GPU de consumo: sí, en tarjetas con 24 GB de VRAM (RTX 4090, RTX 3090, etc.). No se indica soporte para GPUs con menos memoria.
- Opciones de despliegue: ComfyUI con el workflow JSON incluido; se requiere el transformer destilado fp8, el VAE de vídeo LTX-2.3 y el text encoder Gemma 3 12B con proyección de texto LTX-2.3.
- Latencia y throughput: ~48 s por clip de 97 frames (960x544, 24 fps) en RTX 4090, con 8 pasos de muestreo, cfg 1.0, euler_ancestral y programación linear_quadratic.

## Comparativa con modelos similares

No se dispone de información sobre otros LoRAs específicos para limpieza de carreteras en LTX-2.3. La colección oficial de Lightricks incluye varios IC-LoRA (por ejemplo, `LTX-2.3-22b-IC-LoRA-Union-Control`), pero no hay datos comparativos de rendimiento ni de características entre ellos. Este adaptador es altamente especializado y no tiene competidores directos documentados en el ecosistema abierto.

## Limitaciones y advertencias

- En superficies muy dañadas, el área restaurada puede renderizarse más oscura que el asfalto circundante, lo que se percibe como asfalto nuevo en lugar de un artefacto.
- Las marcas viales se mantienen en la mayoría de las tomas, pero ocasionalmente se produce un aumento de saturación en dobles líneas amarillas.
- El modelo solo funciona con LTX-2.3; no está entrenado ni probado con LTX-2.5, por lo que su uso con versiones posteriores no está garantizado.
- La licencia `ltx-2-community-license` restringe el uso del LoRA exclusivamente con el modelo LTX, y todo uso está sujeto a los términos de esa licencia.
- Requiere la palabra de activación `ROADREADY` en el prompt; sin ella, el comportamiento no se activa.
- El entrenamiento se limitó a 49 pares de vídeo, lo que puede reducir la generalización a condiciones de iluminación, ángulos o tipos de daño muy diferentes a los vistos.
- No se han publicado evaluaciones cuantitativas de calidad ni estudios de sesgos; la validación es cualitativa y realizada por el autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/DriveEK/roadready-ltx23-iclora
- Colección LTX-2.3 de Lightricks: https://huggingface.co/collections/Lightricks/ltx-23
- Documentación oficial de IC-LoRA: https://docs.ltx.io/open-source-model/usage-guides/ic-lo-ra
- Blog de LTX sobre IC-LoRA: https://ltx.io/blog/how-to-use-ic-lora-in-ltx-2
- Guía de modelos LTX por VRAM: https://ltxworkflow.com/models
