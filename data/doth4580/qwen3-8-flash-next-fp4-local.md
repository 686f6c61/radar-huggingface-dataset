# doth4580/Qwen3.8-Flash-Next-FP4-Local

## Resumen

Qwen3.8-Flash-Next-FP4-Local es un empaquetado de cuantización FP4 del modelo Qwen3.8-Flash-Next, desarrollado originalmente por el equipo Qwen y cuantizado por NVIDIA mediante Model Optimizer con destilación consciente de cuantización. Se distribuye bajo el NVIDIA Open Model Agreement y está pensado para ejecutarse en hardware Blackwell, concretamente en sistemas DGX Spark / GB10. El modelo base emplea una arquitectura MoE con capacidades de visión y un cabezal de predicción multi-token (MTP) de una capa.

Este repositorio concreto, publicado por el usuario doth4580, no re-cuantiza ni convierte nada: reproduce byte a byte los 33 archivos de la revisión oficial de NVIDIA y añade un único archivo sidecar, `mtp-2.6bpw.safetensors`, procedente del repositorio de HermiHg. Ese sidecar contiene una cuantización EXL3 de precisión mixta del cabezal MTP original en BF16 y se usa como drafter en decodificación especulativa. Su función es puramente de velocidad: todos los tokens propuestos se verifican con el modelo completo, de modo que la salida greedy es idéntica con y sin el sidecar.

El pack está diseñado prioritariamente para el motor de inferencia veloGB10 (versión 0.7.9 o superior) sobre uno, dos o cuatro sistemas DGX Spark. Al conservar los pesos de NVIDIA sin modificar, también puede cargarse con cualquier framework que lea el formato NVFP4/MXFP8, que simplemente ignorará el archivo sidecar. Es relevante ahora porque demuestra una ruta práctica para servir un MoE multimodal de gran tamaño en hardware de escritorio Blackwell con decodificación especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con torre de visión y cabezal MTP de una capa |
| Parametros totales | no disponible (el pack ocupa unos 96 GB en pesos MXFP8/NVFP4) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP8 (capas densas), NVFP4 (expertos), EXL3 2,6 bpw (sidecar MTP) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model Agreement (modelo base Qwen bajo Qwen Community License 1.0; sidecar Apache-2.0) |
| Formato de pesos | safetensors (directorio `tensors/` más sidecar `mtp-2.6bpw.safetensors`) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) con atención dispersa e indexador de atención, torre de visión para entrada image-text-to-text y un cabezal MTP de una sola capa que actúa como drafter en decodificación especulativa. NVIDIA aplicó Model Optimizer con destilación consciente de cuantización para producir la versión FP4-Local: capas densas en MXFP8, expertos enrutados en NVFP4, tabla de n-gramas y torre de visión incluidas en el pack. No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO.

La innovación destacable de este repositorio es el sidecar MTP de HermiHg, una cuantización EXL3 por grupos de precisión mixta del cabezal MTP original en BF16. Contiene 1.546 lineales EXL3 (con tensores `suh`, `svh` y `mul1`) y 19 tensores BF16, con esta asignación: proyecciones de entrada a 8 bits (13,1 M parámetros), atención a 6 bits (49,8 M), indexador de atención dispersa a 8 bits (1,6 M), experto compartido a 8 bits (4,9 M), expertos enrutados gate+up fusionados a 2,0 bits (1.678 M) y down a 3,0 bits (838,9 M). veloGB10 solo lee del sidecar las lineales densas del MTP (proyecciones de entrada, bloque de atención, proyección del indexador y experto compartido); los expertos enrutados, normas, mezcladores de hiperconexión y router siguen siendo los de NVIDIA. Como el drafter solo propone y el modelo completo verifica, la salida greedy es byte-idéntica con y sin sidecar (comprobado a TP=1 y TP=2).

## Capacidades

- Generación de texto y razonamiento multimodal image-text-to-text gracias a la torre de visión integrada.
- Procesamiento de imágenes junto a texto en una misma conversación (pipeline `image-text-to-text`).
- Decodificación especulativa mediante cabezal MTP, con verificación completa de tokens.
- Cuantización NVFP4/MXFP8 para despliegue eficiente en hardware Blackwell.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en DGX Spark: el pack está pensado para ejecutarse con veloGB10 v0.7.9 o superior en uno, dos o cuatro sistemas GB10, aprovechando los pesos NVFP4 para servir el modelo sin contenedores adicionales.
- Aceleración de decodificación en producción: el sidecar MTP reduce los bytes leídos por pasada de draft al sustituir las copias BF16 de las lineales densas del MTP, manteniendo la salida greedy idéntica; útil cuando se necesita más throughput sin alterar resultados.
- Despliegue multimodal en clúster pequeño: con TP=1 o TP=2 sobre DGX Spark se puede servir un modelo con torre de visión para tareas de descripción de imágenes o respuesta a preguntas visuales.
- Integración con frameworks estándar: al ser pesos NVIDIA sin modificar, cualquier motor que lea NVFP4/MXFP8 (los contenedores vLLM citados en la tarjeta de NVIDIA) puede cargarlos ignorando el sidecar, lo que facilita pipelines existentes.
- Reproducibilidad y auditoría: el repositorio verifica los 33 archivos originales contra sha256 y git object ids, lo que permite validar despliegues en entornos con requisitos de integridad.
- Evaluación de decodificación especulativa: sirve como banco de pruebas para medir aceptación de draft y coste por pasada comparando con y sin el sidecar en distintas configuraciones de TP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta solo menciona mediciones de aceptación y coste de draft en DGX Spark, sin cifras concretas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada: unos 96 GB de pesos NVIDIA más 0,8 GB del sidecar, por lo que se requiere hardware con al menos esa capacidad agregada.
- GPU recomendadas: NVIDIA DGX Spark / GB10, en configuraciones de uno, dos o cuatro sistemas.
- Cabe en consumer GPU: no disponible; el pack está orientado a GB10 y no se documenta su ejecución en RTX 4090 u otras consumer.
- Opciones de despliegue: veloGB10 v0.7.9 o superior (soporte FP4-Local nativo); contenedores vLLM citados por NVIDIA para los pesos sin modificar.
- Latencia y throughput: no disponible; solo se indica que el sidecar reduce los bytes leídos por pasada de draft.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| doth4580/Qwen3.8-Flash-Next-FP4-Local | no disponible | no disponible | MXFP8 + NVFP4 + EXL3 sidecar | NVIDIA Open Model Agreement | Pack para veloGB10 con MTP optimizado |
| nvidia/Qwen3.8-Flash-Next-FP4-Local | no disponible | no disponible | MXFP8 + NVFP4 | NVIDIA Open Model Agreement | Original de NVIDIA sin sidecar |
| HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3 | no disponible | no disponible | EXL3 2,6 y 3,1 bpw (solo cabezal MTP) | Apache-2.0 | Cabezal draft aislado |
| turboderp/Qwen3.8-Flash-Next-exl3 | no disponible | no disponible | EXL3 | no disponible | Referencia de fidelidad citada |

## Limitaciones y advertencias

- Requiere veloGB10 v0.7.9 o superior; versiones anteriores no pueden cargar el pack FP4-Local.
- El sidecar solo aporta velocidad de draft; no mejora la calidad ni cambia la distribución de muestreo.
- Los pesos están atados al formato NVFP4/MXFP8 de NVIDIA; otros frameworks deben soportar ese formato o ignorar el sidecar.
- Licencia NVIDIA Open Model Agreement con términos específicos para uso comercial; el modelo base Qwen queda bajo Qwen Community License 1.0 y el sidecar bajo Apache-2.0, lo que exige revisar ambas.
- Sesgos conocidos, riesgo de alucinación y limitaciones idiomáticas: no disponible en la información proporcionada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria adicional.
- La información sobre contexto, idiomas y parámetros totales no está publicada en la tarjeta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-FP4-Local
- Modelo original de NVIDIA: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-FP4-Local
- Cabezal MTP de HermiHg: https://huggingface.co/HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Referencia de fidelidad EXL3: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- Motor veloGB10: https://github.com/sf-stav/veloGB10
- Licencia NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
- Licencia Qwen Community License 1.0: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
