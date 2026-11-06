# farc077/Ella_Purnell_KREA2

## Resumen

Ella_Purnell_KREA2 es un adaptador LoRA de tipo text-to-image desarrollado por el usuario farc077, diseñado para generar imágenes con la apariencia de la actriz Ella Purnell. Se trata de un LoRA de un solo paso ("ONESHOTLORA"), generado a través de la plataforma oneshotlora.com, y está construido sobre el modelo base krea/Krea-2-Raw. El repositorio tiene un tamaño de 0,2 GB, lo que es coherente con un adaptador de bajo rango y no con un modelo completo.

El modelo no introduce una arquitectura nueva: hereda íntegramente las capacidades del modelo base Krea-2-Raw y añade un ajuste fino específico para la identidad facial de la actriz. Su relevancia es acotada y práctica: sirve para producir imágenes consistentes de un sujeto concreto dentro de flujos de generación de imágenes, con la ventaja de que un LoRA se carga sobre el modelo base sin duplicar sus pesos.

La información publicada por el autor es mínima. La model card se limita a indicar el modelo base, la palabra de activación y tres ejemplos de prompts, sin detallar hiperparámetros de entrenamiento, dataset, licencia concreta ni idiomas. Todo dato no presente en la documentación se marca en esta ficha como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusión krea/Krea-2-Raw; arquitectura del modelo base no disponible |
| Parámetros totales | no disponible (adaptador LoRA; tamaño del repo 0,2 GB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (text-to-image); longitud de prompt máxima no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (los prompts de ejemplo están en inglés) |
| Licencia | other (licencia no especificada en detalle) |
| Formato de pesos | no disponible (repo de 0,2 GB; presumiblemente safetensors, sin confirmar) |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base de difusión Krea-2-Raw para modificar su comportamiento generativo. No se trata de un transformer autoregresivo ni de un modelo de lenguaje: es un adaptador para un pipeline text-to-image. La model card no especifica en qué módulos del modelo base se aplica el adaptador (atención, cross-attention, MLP), ni el rango utilizado.

El entrenamiento se realizó mediante la plataforma oneshotlora.com, según indica el autor, con la etiqueta "ONESHOTLORA". No se publican el número de imágenes de entrenamiento, el número de pasos, la tasa de aprendizaje, el optimizador ni si se emplearon técnicas como regularización o captions automáticos. Tampoco hay información sobre el dataset más allá de que está basado en la actriz Ella Purnell. No se documenta ningún uso de RLHF, DPO ni técnicas equivalentes, algo esperable en un adaptador de difusión.

## Capacidades

- Generación de imágenes fotorrealistas de la actriz Ella Purnell a partir de prompts de texto, activada mediante la palabra clave "3LL4P".
- Control de vestuario y escenario mediante lenguaje natural, como demuestran los ejemplos de la model card (camisa formal y blazer en oficina, vestido de tirantes en un campo, camiseta y vaqueros ante una pared).
- Composición de escenas con descripciones de entorno, ropa y postura dentro del mismo prompt.
- Compatibilidad con el pipeline text-to-image del modelo base Krea-2-Raw, por lo que hereda las capacidades de este en cuanto a resolución, estilos y control de la generación (detalles no disponibles).
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking"; son capacidades ajenas a un LoRA de difusión.
- Capacidades multilingües no documentadas; los ejemplos publicados usan inglés.

## Casos de uso

- Ilustración editorial y previsualización de personajes: el LoRA permite generar variaciones de una actriz concreta en distintos vestuarios y localizaciones, útil para maquetas de revistas o guiones gráficos donde se necesita consistencia de identidad.
- Pruebas de vestuario y dirección de arte: un estudio puede generar rápidamente al sujeto con diferentes conjuntos (formal, casual, veraniego) para evaluar paletas y estilismos antes de un rodaje o sesión fotográfica.
- Creación de contenido para fans y community management: generación de imágenes temáticas del personaje con la palabra de activación "3LL4P", integrable en flujos de ComfyUI como el que aparece en los ejemplos del autor.
- Composición de escenas narrativas: al aceptar descripciones de entorno ("standing in corporate office", "sitting in a field of long grass"), sirve para ilustrar relatos o storyboards con el mismo rostro en contextos diversos.
- Prototipado de pipelines text-to-image: desarrolladores que ya trabajan con Krea-2-Raw pueden cargar este LoRA para probar la mecánica de adaptadores de identidad y evaluar su integración en ComfyUI u otras interfaces.
- Experimentación académica sobre personalización de modelos de difusión: permite estudiar cómo un LoRA de bajo rango condiciona la identidad facial sin reentrenar el modelo base, comparando resultados con otros adaptadores de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende enteramente del modelo base Krea-2-Raw, cuyos requisitos no están documentados en la información disponible. El adaptador en sí ocupa 0,2 GB en disco y añade un coste de memoria despreciable frente al modelo base.
- GPU recomendadas: no disponible para el modelo base; para adaptadores LoRA de difusión de tamaño similar suele ser habitual disponer de GPUs con 8-24 GB de VRAM, pero este dato no se confirma en la documentación.
- ¿Cabe en GPU de consumo? No confirmado. El adaptador es ligero, pero la viabilidad depende del modelo base, no del LoRA.
- Opciones de despliegue: los ejemplos de la model card se generaron con ComfyUI, por lo que este es el flujo documentado. Otros entornos compatibles con Krea-2-Raw (Diffusers, Automatic1111, etc.) no están confirmados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| farc077/Ella_Purnell_KREA2 | LoRA de identidad (text-to-image) | krea/Krea-2-Raw | 0,2 GB | other | Hugging Face, 0 descargas, 0 likes |
| Otros LoRA de actrices sobre Krea-2-Raw | LoRA de identidad | krea/Krea-2-Raw | no disponible | no disponible | no disponible |
| LoRA de identidad sobre otros modelos de difusión (p. ej. SDXL, Flux) | LoRA de identidad | Distintos | variable | variable | amplia disponibilidad en Hugging Face |

No se dispone de información sobre adaptadores comparables directos dentro del ecosistema Krea-2-Raw, ni de métricas de calidad que permitan una comparación cuantitativa. La comparativa con LoRA de otras familias de difusión es cualitativa y depende de las capacidades del modelo base respectivo.

## Limitaciones y advertencias

- La licencia es "other" y no se detalla su contenido; no se puede confirmar si se permite el uso comercial. Es imprescindible revisar los términos del modelo base krea/Krea-2-Raw y de la plataforma oneshotlora.com antes de cualquier uso en producción.
- El modelo reproduce la apariencia de una persona real (Ella Purnell). Su uso puede vulnerar derechos de imagen, publicidad o privacidad según la jurisdicción; el autor declara que los usuarios son responsables de cumplir la legislación aplicable.
- Riesgo elevado de deepfakes y de usos engañosos o difamatorios; no se documenta ningún mecanismo de moderación o filtrado asociado al adaptador.
- Al ser un LoRA de identidad, puede presentar sobreajuste al rostro de entrenamiento, dificultad para generar expresiones o ángulos no vistos y artefactos en composiciones complejas; no hay documentación que lo evalúe.
- Idiomas soportados no documentados; los prompts de ejemplo están en inglés y no se garantiza un buen comportamiento con prompts en castellano.
- Sesgos de representación heredados del modelo base y del dataset de entrenamiento, no evaluados ni documentados.
- El repositorio no tiene descargas ni likes y la documentación es mínima, lo que reduce la trazabilidad y la confianza para uso en producción.
- No se especifican requisitos de hardware, formatos de pesos ni compatibilidad con herramientas distintas de ComfyUI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/farc077/Ella_Purnell_KREA2
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Plataforma de entrenamiento citada por el autor: https://oneshotlora.com
