# sanloxai/wan2.1-t2v-1.3b-crush-lora

## Resumen

Wan2.1 T2V 1.3B Crush LoRA es un adaptador LoRA para el modelo de generación de vídeo texto-a-vídeo Wan2.1-T2V-1.3B-Diffusers, desarrollado por el usuario sanloxai y publicado en Hugging Face. Se trata de un ajuste fino ligero (LoRA) que especializa el modelo base para reproducir un estilo visual concreto, activado mediante la palabra clave `PIKA_CRUSH`. El repositorio tiene un tamaño de 0,0 GB, lo que sugiere que los pesos del adaptador no están efectivamente subidos o son de tamaño despreciable.

El adaptador se entrenó sobre el dataset `finetrainers/crush-smol` durante 800 pasos, con resolución de 512x320 píxeles y secuencias de 33 fotogramas. Es relevante para quienes ya trabajan con el ecosistema Wan 2.1 y quieren aplicar un estilo específico sin reentrenar el modelo completo, aprovechando la infraestructura de diffusers y la modularidad de los LoRA.

La información pública disponible es muy escasa: no se especifican licencia, idiomas, métricas de calidad ni detalles sobre la composición del dataset. El modelo base, Wan2.1-T2V-1.3B, es un transformer de difusión para vídeo de 1.300 millones de parámetros desarrollado por Alibaba (Wan-AI).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer de difusión para vídeo (Wan2.1-T2V-1.3B) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 1,3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (generación de 33 fotogramas a 512x320) |
| Tipos de cuantizacion | no disponible (depende del modelo base; el LoRA se aplica sobre pesos fp16/bf16) |
| Idiomas soportados | no disponible (la condición textual depende del codificador de texto del modelo base) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de 0,0 GB; librería diffusers) |

## Arquitectura y entrenamiento

El adaptador es un LoRA aplicado sobre Wan2.1-T2V-1.3B-Diffusers, un modelo de difusión para generación de vídeo a partir de texto. El LoRA introduce matrices de bajo rango en las capas del transformer de difusión, permitiendo especializar el estilo con un coste de entrenamiento y almacenamiento muy reducido en comparación con un ajuste completo. El entrenamiento se realizó con la herramienta finetrainers sobre el dataset `finetrainers/crush-smol`.

Los hiperparámetros conocidos son: 800 pasos de entrenamiento, resolución de 512x320 píxeles y 33 fotogramas por muestra. No se han publicado detalles sobre el rango del LoRA, la tasa de aprendizaje, el optimizador, el tamaño del dataset ni la composición de las muestras. Tampoco se indica si se aplicaron técnicas adicionales como regularización, dropout o aumentación de datos.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) heredada del modelo base Wan2.1-T2V-1.3B.
- Aplicación de un estilo visual específico activado por la palabra clave `PIKA_CRUSH`.
- Generación de clips de 33 fotogramas a resolución 512x320.
- Integración con el pipeline de diffusers para text-to-video.
- Compatibilidad con el ecosistema de LoRA de Wan 2.1, permitiendo combinación con otros adaptadores (no verificado).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Prototipado de estilo visual: aplicar el trigger `PIKA_CRUSH` en prompts para generar clips cortos con una estética concreta, útil para pruebas de concepto rápidas en 512x320 y 33 fotogramas.
- Generación de storyboards animados: producir secuencias breves para previsualizar escenas antes de una producción mayor, aprovechando la baja resolución para iterar rápido.
- Contenido para redes sociales: crear clips cortos de estilo consistente para publicaciones, dado el formato de 33 fotogramas y resolución reducida.
- Investigación en adaptación de difusión: estudiar cómo un LoRA de 800 pasos modifica el comportamiento de un modelo T2V de 1,3B, sirviendo como caso de estudio de ajuste fino ligero.
- Integración en pipelines de diffusers: incorporar el adaptador en flujos automatizados de generación de vídeo con la librería diffusers para experimentación.
- Pruebas de compatibilidad de LoRA: evaluar la interoperabilidad del adaptador con el modelo base Wan2.1-T2V-1.3B y con otras herramientas del ecosistema Wan.
- Demos educativas: ilustrar el concepto de LoRA y palabra clave en modelos de vídeo en contextos docentes o divulgativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el LoRA; el modelo base Wan2.1-T2V-1.3B requiere aproximadamente 8-12 GB en fp16 para inferencia, aunque este dato no está confirmado en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del modelo base (1,3B) sugiere que podría caber en GPUs de consumo con suficiente VRAM, pero no hay datos verificados.
- Opciones de despliegue: diffusers (librería declarada); otras opciones como ComfyUI, vLLM o llama.cpp no están documentadas para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| sanloxai/wan2.1-t2v-1.3b-crush-lora | LoRA sobre 1,3B | 33 fotogramas, 512x320 | no disponible | Hugging Face (0 descargas) |
| Wan-AI/Wan2.1-T2V-1.3B-Diffusers | 1,3B | vídeo T2V | no disponible en esta ficha | Hugging Face (modelo base) |
| Otros LoRA de Wan 2.1 | variable | variable | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre este adaptador y alternativas de la misma categoría.

## Limitaciones y advertencias

- El repositorio tiene un tamaño de 0,0 GB, lo que sugiere que los pesos del LoRA podrían no estar disponibles o ser incompletos; verificar antes de usar en producción.
- No se especifica licencia, lo que impide determinar si el uso comercial está permitido.
- El entrenamiento es muy corto (800 pasos) y con un dataset pequeño (`crush-smol`), lo que puede limitar la calidad y generalización del estilo.
- La resolución y duración están fijadas a 512x320 y 33 fotogramas; no se documenta soporte para otras configuraciones.
- No hay información sobre sesgos, riesgo de alucinación visual o limitaciones idiomáticas.
- El trigger `PIKA_CRUSH` es obligatorio para activar el estilo; sin él, el adaptador podría no aportar el efecto deseado.
- No se han publicado métricas de calidad ni evaluaciones humanas.
- Al ser un adaptador sobre un modelo base de terceros, hereda las limitaciones y la licencia del modelo Wan2.1-T2V-1.3B, que no se detallan aquí.

## Enlaces

- Hugging Face: https://huggingface.co/sanloxai/wan2.1-t2v-1.3b-crush-lora
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers
- Dataset de entrenamiento: https://huggingface.co/datasets/finetrainers/crush-smol
- Librería finetrainers: no disponible en la información proporcionada
