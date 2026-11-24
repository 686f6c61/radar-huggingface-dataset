# lightx2v/Minimax-H3-Turbo-Fusion

## Resumen

MiniMax-H3 Turbo Fusion es un adaptador LoRA de destilación para el modelo base MiniMax-H3, un sistema de generación conjunta de vídeo y audio. Lo publica el equipo de LightX2V (proyecto ModelTC) y su función es reducir drásticamente el número de pasos de muestreo necesarios para producir un clip: de los 29 pasos del modelo base a 4 u 8 pasos, manteniendo la modalidad Ref2VA (referencia a vídeo y audio). No es un modelo independiente, sino un adaptador que se carga sobre MiniMax-H3.

La innovación principal es la fusión de tres adaptadores distintos en uno solo: el checkpoint de destilación Ref2VA propio de LightX2V, el adaptador Pika Ref2VA Flex y el Turbo v4 step-600 EMA de Larry. El resultado evita apilar tres LoRAs en tiempo de inferencia, lo que simplifica el pipeline y reduce el coste computacional. Se distribuye en variantes Full y Lite r32 (aproximación por SVD truncada por capas) y en dos disposiciones de claves: LightX2V/Diffusers y ComfyUI.

El repositorio ocupa 21 GB y se publica bajo la licencia comunitaria de MiniMax-H3. Es relevante para quienes ya trabajan con MiniMax-H3 y necesitan acelerar la generación sin reentrenar ni gestionar múltiples adaptadores, especialmente en flujos de ComfyUI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base MiniMax-H3; fusión de tres adaptadores |
| Parametros totales | no disponible (depende del modelo base MiniMax-H3) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; el README menciona redondeo a BF16) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors (variantes Full y Lite r32, en layout LightX2V/Diffusers y ComfyUI) |

## Arquitectura y entrenamiento

El adaptador se construye mediante fusión ponderada de tres LoRAs: el checkpoint de destilación turbo Ref2VA de LightX2V con peso 1.0, el adaptador Pika Ref2VA Flex con peso 0.4 y el Turbo v4 step-600 EMA de Larry con peso 0.4. La misma receta se aplica tanto a la variante de 4 pasos como a la de 8 pasos. Al integrar las actualizaciones en un único fichero, se elimina la necesidad de apilar adaptadores en tiempo de inferencia.

Las variantes Lite r32 son aproximaciones por SVD truncada con producto QR por capa, que retienen el 98,41 % (4 pasos) y el 97,80 % (8 pasos) de la energía espectral de las actualizaciones Full antes del redondeo a BF16. El autor advierte explícitamente de que estas cifras son estadísticas del espacio de pesos y no puntuaciones de calidad perceptual. La conversión a ComfyUI fusiona las proyecciones Q/K/V y preserva la escala efectiva `alpha / rank` de cada módulo. No se detallan en la información disponible los datos de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Generación de vídeo condicionada por imágenes de referencia (Ref2VA), con identidad de personajes mantenida a lo largo del clip.
- Generación conjunta de vídeo y audio, con parámetros de desplazamiento de flujo separados para cada modalidad (vídeo 12, audio 3).
- Muestreo acelerado: 4 u 8 pasos en lugar de los 29 del modelo base, con muestreador Euler.
- Compatibilidad con ComfyUI mediante variantes específicas de layout de claves.
- Compatibilidad con pipelines LightX2V y Diffusers.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-step ni multilingüismo textual.

## Casos de uso

- Prototipado rápido de clips con personajes de referencia: usar la variante de 4 pasos para iterar sobre prompts e imágenes de referencia en minutos, y reservar la de 8 pasos para la versión final.
- Producción de vídeo musical con audio sincronizado: el modo Ref2VA y los flujos de audio y vídeo separados permiten generar cortes verticales con continuidad de identidad, como en el caso 2 del README (15 s, formato vertical).
- Integración en ComfyUI para estudios pequeños: cargar el fichero `_comfyui` en el nodo correspondiente y evitar la gestión manual de tres LoRAs apiladas.
- Reducción de coste en granjas de inferencia: pasar de 29 a 4 pasos rebaja el número de evaluaciones del modelo base por clip, lo que abarata el coste por segundo de vídeo generado.
- Escenas de acción con múltiples referencias: el caso 1 del README usa siete imágenes de referencia para una secuencia de pelea en un banquillo, un escenario donde la consistencia de identidad es crítica.
- Despliegue en pipelines LightX2V o Diffusers: usar la variante sin sufijo `_comfyui` para integrar el adaptador en código Python con el layout estándar.
- Experimentación con adaptadores comprimidos: la variante Lite r32 reduce el tamaño del adaptador para entornos con almacenamiento limitado, a costa de una pequeña pérdida de energía espectral.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README incluye comparaciones cualitativas en vídeo (base a 29 pasos frente a Pika Flex Turbo y frente a esta fusión, en 4 y 8 pasos) para dos casos, pero no tablas de métricas numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base MiniMax-H3 y de la resolución y duración del clip.
- GPU recomendadas: no disponible; el modelo base es de generación de vídeo y audio, por lo que se espera un requisito alto, pero no se confirma en la documentación.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: LightX2V, Diffusers y ComfyUI (variantes de layout específicas).
- Latencia y throughput: no disponibles; la reducción de 29 a 4 u 8 pasos de muestreo implica menos evaluaciones del modelo base por clip, pero no se publican cifras absolutas.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos de muestreo | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3 Turbo Fusion (este) | LoRA fusionado sobre MiniMax-H3 | 4 u 8 | Vídeo + audio (Ref2VA) | minimax-h3-community-license-agreement | Hugging Face (lightx2v) |
| Pika-H3-Flex-Turbo-LoRA | LoRA sobre MiniMax-H3 | 4 u 8 | Vídeo + audio (Ref2VA) | no disponible en la información | Hugging Face (Pika-Labs) |
| MiniMax-H3 Turbo (LightX2V) | LoRA de destilación sobre MiniMax-H3 | no disponible | Vídeo + audio | no disponible en la información | Hugging Face (lightx2v) |
| MiniMax-H3 (base) | Modelo base | 29 | Vídeo + audio | minimax-h3-community-license-agreement | Hugging Face (MiniMaxAI) |

## Limitaciones y advertencias

- Es un adaptador, no un modelo autónomo: requiere cargar MiniMax-H3 como base.
- No se debe apilar con los LoRAs componentes (LightX2V, Pika Flex, Larry Turbo), ya que sus actualizaciones ya están integradas; hacerlo alteraría el resultado.
- Las cifras de retención espectral de las variantes Lite r32 (98,41 % y 97,80 %) son estadísticas del espacio de pesos, no garantías de calidad perceptual.
- La fusión es una iniciativa independiente de LightX2V y no una versión oficial de Pika.
- La licencia es la comunitaria de MiniMax-H3, con posibles restricciones de uso comercial; conviene revisar el texto enlazado antes de desplegar en producción.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas en la información disponible.
- El repositorio registra 0 descargas y 1 like en el momento de la consulta, por lo que la validación por parte de la comunidad es todavía muy limitada.
- Los ajustes de inferencia son específicos: muestreador Euler, desplazamiento de flujo de vídeo 12 y de audio 3; otros valores pueden degradar la calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lightx2v/Minimax-H3-Turbo-Fusion
- Licencia: https://huggingface.co/lightx2v/Minimax-H3-Turbo-Fusion/blob/main/LICENSE
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- MiniMax-H3 Turbo (LightX2V): https://huggingface.co/lightx2v/Minimax-h3-Turbo
- Pika-H3-Flex-Turbo-LoRA: https://huggingface.co/Pika-Labs/Pika-H3-Flex-Turbo-LoRA
- Pika-H3-Flex: https://huggingface.co/Pika-Labs/Pika-H3-Flex
- Larry Turbo v4 LoRA: https://huggingface.co/larryvrh/MiniMax-H3-Turbo-Lora
- Repositorio LightX2V: https://github.com/ModelTC/LightX2V
- LightX2V Studio: https://x2v.light-ai.top/
- Caso 1 (imágenes de referencia): https://huggingface.co/lightx2v/Minimax-H3-Turbo-Fusion/tree/main/assets/case1
- Caso 1 (prompt completo): https://huggingface.co/lightx2v/Minimax-H3-Turbo-Fusion/blob/main/assets/case1/prompt.txt
- Caso 2 (imágenes de referencia): https://huggingface.co/lightx2v/Minimax-H3-Turbo-Fusion/tree/main/assets/case2
- Caso 2 (prompt completo): https://huggingface.co/lightx2v/Minimax-H3-Turbo-Fusion/blob/main/assets/case2/prompt.txt
