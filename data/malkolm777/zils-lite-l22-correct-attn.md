# malkolm777/zils-lite-l22-correct-attn

## Resumen

zils-lite-l22-correct-attn es un ajuste fino (fine-tuning) del modelo base joamCriff123/zils-lite-l1121a, publicado por el usuario malkolm777. Se trata de un modelo de decisión etiquetado dentro de la familia "zils" y la variante "d3-lite", orientado a tareas de clasificación o puntuación ordinal sobre preguntas del conjunto P3. El modelo cuenta con 852.985.920 parámetros (aproximadamente 853 millones) y se distribuye bajo licencia Apache 2.0 en formato safetensors con código personalizado.

El ajuste se realizó sobre 1480 preguntas P3 etiquetadas, con objetivos gold que asignaban un peso de 0.9 a los errores del modelo de partida y 0.32 a las respuestas correctas, dejando el resto de la masa objetivo al modelo inicial. Se aplicó una pasada LoRA de rango 64 sobre las proyecciones de atención del modelo base, con semilla 4221 y tasa de aprendizaje 3e-05, y el adaptador se fusionó en los pesos de partida.

La relevancia de este modelo es limitada y muy específica: se trata de un experimento de ajuste sobre un modelo base poco documentado, con cero descargas y cero likes en el momento de la consulta, y sin model card extendida más allá de la descripción del proceso de entrenamiento. No se dispone de información sobre arquitectura detallada, contexto, idiomas o benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta qwen3_5 en Hugging Face; el modelo base se describe como "chassis language attention projections") |
| Parametros totales | 852.985.920 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con custom_code) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base joamCriff123/zils-lite-l1121a. La model card menciona que el ajuste actualizó las "chassis language attention projections" mediante una pasada LoRA de rango 64, lo que sugiere una arquitectura transformer con proyecciones de atención convencionales. La etiqueta `qwen3_5` en Hugging Face apunta a una posible base derivada de la familia Qwen, aunque no se confirma en la documentación.

El entrenamiento consistió en un fine-tuning supervisado sobre 1480 preguntas etiquetadas del conjunto P3, con objetivos gold ordinales: peso 0.9 sobre los errores del modelo de partida, 0.32 sobre las respuestas correctas y 0.10 sobre puntuaciones adyacentes. El adaptador LoRA (rango 64, semilla 4221, lr 3e-05) se fusionó en los pesos del modelo base. No se menciona uso de RLHF, DPO ni datos de preferencias. El SHA-256 del JSONL de entrenamiento es b3f586b4c106d86682c7b8134a86fa242344bd27268b0e6c9971937f00dd9be7.

## Capacidades

- Modelo de decisión orientado a puntuación ordinal o clasificación sobre preguntas del conjunto P3.
- Ajuste específico para corregir errores del modelo de partida en esa tarea concreta.
- No se documentan capacidades de generación de texto libre, razonamiento general, código o matemáticas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- No se documentan modos especiales (thinking mode, visión, audio).

## Casos de uso

- Evaluación de decisiones ordinales sobre preguntas P3: el modelo puede emplearse para reproducir el esquema de puntuación con el que fue entrenado, asignando pesos a respuestas correctas, erróneas y adyacentes.
- Investigación sobre ajuste fino con LoRA de rango 64: sirve como caso de estudio reproducible (semilla, lr y SHA-256 documentados) para analizar cómo un adaptador fusionado modifica las proyecciones de atención de un modelo base.
- Análisis de sesgo de corrección: permite estudiar si el peso 0.9 sobre errores y 0.32 sobre aciertos produce un comportamiento más conservador o más agresivo en la clasificación.
- Prototipado de clasificadores ligeros: con ~853 M de parámetros, puede desplegarse en entornos con recursos moderados para tareas de scoring acotadas.
- Comparación de variantes de la familia zils-lite: útil para contrastar el efecto de un único ajuste LoRA frente al modelo base l1121a.
- Reproducibilidad de experimentos: el hash del dataset de entrenamiento permite verificar la cadena de procedencia en estudios de replicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,7 GB para pesos (852.985.920 parámetros × 2 bytes), más overhead de activaciones y código personalizado.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,9 GB; en 4 bits, alrededor de 0,5 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3050, RTX 4060, etc.) debería poder cargar el modelo en fp16; para cuantizaciones de 4 bits bastaría con 2 GB.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de tarjetas modernas.
- Opciones de despliegue: al requerir `custom_code`, es necesario usar `trust_remote_code=True` en Transformers; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos comparables de la misma familia o categoría con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Modelo con cero descargas y cero likes: no hay evidencia de uso en producción ni validación externa.
- La model card es mínima y no documenta arquitectura, contexto, idiomas ni limitaciones.
- El ajuste se realizó sobre solo 1480 preguntas de un conjunto específico (P3), por lo que el riesgo de sobreajuste a esa distribución es alto.
- No se documentan sesgos conocidos, pero al no haber información sobre los datos de entrenamiento del modelo base, no pueden descartarse.
- Riesgo de alucinación: no evaluado; al ser un modelo de decisión, el riesgo se traslada a clasificaciones erróneas o mal calibradas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base joamCriff123/zils-lite-l1121a puede tener condiciones adicionales no reflejadas; se recomienda revisar LICENSE y NOTICE del repositorio.
- Requiere `custom_code` y `trust_remote_code=True`, lo que implica ejecutar código del autor; riesgo de seguridad en entornos de producción.
- No apto para tareas generales de generación, razonamiento o código sin validación previa.

## Enlaces

- Hugging Face: https://huggingface.co/malkolm777/zils-lite-l22-correct-attn
- Modelo base: https://huggingface.co/joamCriff123/zils-lite-l1121a
- Revisión del modelo base citada: 523d974dc031ecaf4efc3b7772b4611938f5e455
