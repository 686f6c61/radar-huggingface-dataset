# archive213/video-r1-legacy-checkpoints-20261116

## Resumen

Video-R1 legacy checkpoints es un repositorio de artefactos experimentales publicado por el usuario archive213 en Hugging Face. No contiene un modelo completo, sino cinco adaptadores LoRA de 300 pasos de entrenamiento (video-r1, r1plus-raw, r1plus-cgc, r1plus-pvr y r1plus-cgc-pvr) orientados a comprensión de vídeo, junto con sus ficheros `state.pt` originales. Cada directorio requiere el modelo base original Qwen2.5-VL-7B-COT-SFT, que no se distribuye en este repositorio.

El interés del artefacto es de naturaleza arqueológica y de reproducibilidad: documenta variantes de un experimento de ajuste fino sobre un VLM de 7B con ventana de contexto multimodal, y registra versiones de entorno observadas el 2026-11-16. El autor advierte explícitamente de que no se trata del run posterior de 300 pasos con ajuste completo de parámetros, sino de los checkpoints LoRA previos, y de que no se valida ninguna afirmación de rendimiento.

La relevancia práctica es limitada para producción: no hay modelo base, no hay dataset, no hay licencia declarada y el autor señala que una de las variantes (CGC) produjo dos errores de decodificación en la salida histórica de VideoMMMU. Es, por tanto, material de referencia para quien quiera reconstruir el experimento, no un modelo listo para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre base Qwen2.5-VL-7B-COT-SFT; arquitectura del base no detallada en la informacion disponible |
| Parametros totales | no disponible (adaptadores LoRA; el base es de 7B según su nombre) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores PEFT) y `state.pt` (posible pickle) |

## Arquitectura y entrenamiento

El repositorio contiene cinco adaptadores LoRA entrenados durante 300 pasos sobre el modelo base Qwen2.5-VL-7B-COT-SFT, un VLM de 7B con capacidad de razonamiento en cadena (COT, chain-of-thought) y entrada de vídeo. Las variantes se diferencian por su configuración de entrenamiento: `video-r1` como línea base, `r1plus-raw`, `r1plus-cgc`, `r1plus-pvr` y `r1plus-cgc-pvr`, presumiblemente combinaciones de estrategias de muestreo o curriculum (las siglas no se explican en la model card). Cada directorio incluye el adaptador original y un `state.pt` con el estado del entrenamiento.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset (el autor indica que no se incluye dataset alguno), ni si hubo RLHF o DPO. El autor aclara que estos artefactos son anteriores al run de 300 pasos con ajuste completo de parámetros y que el inventario de entorno recoge versiones observadas el 2026-11-16, no una reconstrucción verificada del run original. Los directorios de checkpoint fueron verificados con SHA-256 contra sus copias en servidor antes de la subida.

## Capacidades

- Comprensión de vídeo: los adaptadores están etiquetados como `video-understanding`, por lo que se orientan a tareas de descripción, respuesta a preguntas y razonamiento sobre contenido audiovisual.
- Razonamiento en cadena: el modelo base (Qwen2.5-VL-7B-COT-SFT) incorpora entrenamiento de chain-of-thought, lo que sugiere capacidad de razonamiento multi-paso sobre la entrada visual.
- Ajuste eficiente: al ser adaptadores LoRA, permiten experimentar con el base sin reentrenar los 7B parámetros completos.
- No disponible: soporte de tool calling, function calling, modo thinking explícito, audio, agentes o capacidades multilingües no se documentan en la información proporcionada.

## Casos de uso

- Reproducción de experimentos de investigación: cargar cada adaptador sobre Qwen2.5-VL-7B-COT-SFT y comparar las cinco variantes en tareas de vídeo para estudiar el efecto de las distintas configuraciones de entrenamiento.
- Auditoría de checkpoints: verificar las sumas SHA-256 y el contenido de `state.pt` para validar la integridad de artefactos legacy antes de reutilizarlos en un pipeline de investigación.
- Estudio de LoRA sobre VLMs: analizar cómo 300 pasos de ajuste LoRA modifican el comportamiento de un VLM de 7B en comprensión de vídeo, sirviendo como línea base para nuevos experimentos.
- Docencia y formación: usar los adaptadores como ejemplo práctico de empaquetado PEFT, estructura de repositorio y advertencias de seguridad (pickle en `state.pt`).
- Reconstrucción de entorno: emplear los registros en `environment/lora_training_recorded/` para aproximar las versiones de librerías usadas en los cinco runs.
- Referencia para evaluación de VideoMMMU: revisar la salida histórica de la variante CGC (con sus dos errores de decodificación documentados) como caso de estudio de fallos en evaluación de modelos de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se valida ninguna afirmación de rendimiento y que la salida histórica de VideoMMMU para la variante CGC contenía dos errores de decodificación.

## Requisitos de hardware

- VRAM estimada: no disponible para los adaptadores de forma aislada; el base Qwen2.5-VL-7B requiere, de forma orientativa, entre 14 y 16 GB en FP16 y alrededor de 6-8 GB en cuantización de 4 bits, aunque estas cifras no se confirman en la información proporcionada.
- GPU recomendadas: no disponible en la información del repositorio; por tamaño del base, cabría esperar GPUs de 24 GB o superiores (RTX 4090, A100, H100) para inferencia en precisión completa.
- Cabe en GPU de consumo: probablemente en GPUs de 24 GB con el base en cuantización, pero no verificado en la información disponible.
- Opciones de despliegue: PEFT sobre el base con transformers; vLLM, llama.cpp, Ollama o TGI no se documentan para estos adaptadores.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| archive213/video-r1-legacy-checkpoints-20261116 | Adaptadores LoRA sobre base 7B | no disponible | no disponible | Adaptadores únicamente; requiere base externo |
| Qwen2.5-VL-7B-Instruct | 7B | no disponible en esta ficha | no disponible en esta ficha | Modelo completo publicado por el equipo Qwen |
| Video-R1 (versión completa) | 7B (base Qwen2.5-VL) | no disponible en esta ficha | no disponible en esta ficha | No referenciado en la información proporcionada |

La comparación directa no es posible con los datos disponibles: este repositorio no es un modelo autónomo y no publica métricas. Cualquier comparación de rendimiento con Qwen2.5-VL-7B-Instruct o con la versión completa de Video-R1 requeriría ejecutar los adaptadores sobre el base y evaluar, algo que el autor no valida.

## Limitaciones y advertencias

- No es un modelo autocontenido: sin Qwen2.5-VL-7B-COT-SFT los adaptadores no son utilizables.
- Sin licencia declarada: no se puede asumir uso comercial ni redistribución; consultar al autor antes de cualquier uso.
- `state.pt` puede usar pickle: el propio autor advierte de cargarlo solo desde fuentes de confianza por riesgo de ejecución de código arbitrario.
- Sin dataset ni métricas validadas: no hay evidencia de rendimiento publicada; la salida histórica de VideoMMMU para CGC contenía dos errores de decodificación.
- Artefactos legacy: corresponden a un run LoRA de 300 pasos anterior al run de ajuste completo, por lo que no representan el estado final del proyecto Video-R1.
- Entorno no verificado: el inventario de versiones es una instantánea posterior, no un lockfile histórico exacto.
- Idiomas y sesgos: no documentados; al heredar del base Qwen2.5-VL, podrían aparecer los sesgos del modelo original, pero no se confirma en la información disponible.
- Riesgo de alucinación: no evaluado en este repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/archive213/video-r1-legacy-checkpoints-20261116
- Modelo base referenciado (Qwen2.5-VL-7B-COT-SFT): no se proporciona enlace en la información disponible
- Paper de Video-R1: no disponible en la información proporcionada
- Blog o demo: no disponible en la información proporcionada
