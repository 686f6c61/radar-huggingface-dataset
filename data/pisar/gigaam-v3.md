# pisar/GigaAM-v3

## Resumen

GigaAM-v3 es un modelo publicado en Hugging Face por el usuario `pisar` bajo licencia MIT. La información disponible en la model card es prácticamente inexistente: únicamente declara la licencia, sin descripción, sin documentación de arquitectura, sin datos de entrenamiento ni indicaciones de uso. El repositorio tiene un tamaño de 0,4 GB, lo que sugiere un conjunto de pesos de tamaño moderado, pero no permite inferir con fiabilidad el número de parámetros.

Los tags del repositorio (`pytorch`, `gigaam`, `custom_code`) indican que el modelo se distribuye en formato PyTorch y que requiere código personalizado para su carga, probablemente mediante `trust_remote_code=True`. El tag `gigaam` coincide con la familia de modelos de reconocimiento automático del habla (ASR) GigaAM desarrollada por Sber, lo que apunta a que se trata de un modelo de audio, si bien esta información no está confirmada por el autor en la ficha.

La relevancia actual del modelo es limitada desde el punto de vista de la evaluación técnica: sin model card, sin benchmarks publicados y sin documentación de arquitectura, no es posible verificar sus capacidades ni recomendarlo para producción. Esta ficha recoge exclusivamente los datos verificables del repositorio e indica de forma explícita los apartados no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag `gigaam` sugiere arquitectura de la familia GigaAM, sin confirmar) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch (requiere `custom_code`) |
| Tamano del repositorio | 0,4 GB |
| Pipeline de Hugging Face | no disponible |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura en la model card. El tag `gigaam` sugiere una posible relación con la familia GigaAM de modelos de reconocimiento de voz, y el tag `custom_code` indica que el modelo requiere código propio para su instanciación, lo que es habitual en arquitecturas de audio con capas convolucionales o conformer que no están integradas en `transformers` de forma nativa. Ninguno de estos extremos está confirmado por el autor.

Tampoco hay datos sobre el corpus de entrenamiento, el número de tokens o horas de audio procesadas, la composición del dataset, ni sobre si se aplicaron técnicas de ajuste como RLHF, DPO o fine-tuning supervisado. Toda esta información debe considerarse no disponible.

## Capacidades

- No se documentan capacidades en la model card.
- El tag `gigaam` apunta a una posible función de reconocimiento automático del habla (ASR), sin confirmación por parte del autor.
- No hay información sobre soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No hay información sobre modos especiales (thinking mode, visión, audio) más allá de la posible naturaleza de audio sugerida por el tag.

## Casos de uso

No es posible proponer casos de uso concretos y realistas sin documentación sobre la tarea, las entradas y las salidas del modelo. Cualquier escenario descrito sería especulativo. Se recomienda contactar con el autor o consultar el código personalizado del repositorio antes de plantear un uso en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repositorio (0,4 GB) sugiere que los pesos en precisión original podrían caber en GPU de consumo, pero no se puede confirmar sin conocer el número de parámetros y el formato exacto.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: no disponible. El tag `custom_code` implica que `vLLM`, `llama.cpp`, `Ollama` o `TGI` no funcionarán sin adaptación específica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. Sin información sobre la tarea, el tamaño o la arquitectura, no es posible identificar modelos comparables de forma rigurosa.

## Limitaciones y advertencias

- Ausencia total de model card: no hay documentación sobre uso previsto, limitaciones, sesgos o evaluación.
- Riesgo elevado de comportamiento impredecible al no existir especificación de entradas y salidas.
- El uso de `custom_code` obliga a ejecutar código del autor con `trust_remote_code=True`, lo que supone un riesgo de seguridad que debe auditarse antes de su uso.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso por parte de la comunidad ni de validación externa.
- La licencia MIT permite uso comercial, pero la ausencia de documentación impide verificar el cumplimiento de posibles restricciones sobre los datos de entrenamiento.
- No se debe asumir que el modelo realiza ASR solo por el tag `gigaam`; es una hipótesis, no un dato confirmado.

## Enlaces

- Hugging Face: https://huggingface.co/pisar/GigaAM-v3
