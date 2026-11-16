# ReDiverse/ReDiverse-Pika-Flex

## Resumen

ReDiverse-Pika-Flex es un adaptador LoRA publicado por el grupo ReDiverse (University of Illinois at Urbana-Champaign, fal y Johns Hopkins University) para el generador de vídeo texto-a-vídeo Pika-Flex, que a su vez es un ajuste fino de MiniMax-H3. El adaptador no genera vídeo por sí mismo: se aplica sobre Pika-Flex para restaurar la diversidad entre muestras que los generadores destilados de pocos pasos pierden durante el proceso de destilación.

El problema que aborda es concreto: los modelos de difusión destilados para inferencia en pocos pasos producen clips casi idénticos para semillas distintas, lo que reduce la variabilidad creativa y limita el uso práctico en producción. ReDiverse propone una técnica basada en sondear activaciones internas para identificar y corregir la pérdida de diversidad, empaquetada como un adaptador LoRA que se inyecta en el modelo base.

En el momento de la publicación de esta ficha, el repositorio no contiene todavía los pesos del adaptador: la model card indica explícitamente que el adaptador para Pika-Flex "coming soon" y que el adaptador equivalente para MiniMax-H3 ya está disponible en otro repositorio. La información técnica disponible es, por tanto, muy limitada y se circunscribe a la descripción del método y a la referencia al paper arXiv:2611.18550.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre un generador de vídeo texto-a-vídeo de difusión destilado (Pika-Flex, ajuste fino de MiniMax-H3); arquitectura interna del base no disponible |
| Parámetros totales | no disponible (adaptador LoRA; el modelo base no publica recuento en la información disponible) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-vídeo; la entrada es un prompt de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el adaptador no está publicado todavía) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Pika-Flex, un generador texto-a-vídeo de pocos pasos obtenido por ajuste fino de MiniMax-H3. La técnica ReDiverse, descrita en el paper "Restoring Diversity in Distilled Image and Video Generators by Probing Activations" (arXiv:2611.18550), se basa en sondear las activaciones internas del modelo destilado para identificar dónde se colapsa la variabilidad entre semillas y corregirlo mediante un adaptador LoRA. El resultado esperado es que, manteniendo la calidad y la velocidad de inferencia en pocos pasos, el modelo recupere una diversidad entre clips comparable a la de generadores no destilados.

No se dispone de datos sobre el volumen de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni detalles del proceso de destilación del modelo base. La información pública se limita a la descripción cualitativa del método y a la comparación visual de cuatro clips emparejados por semilla con y sin ReDiverse (ejemplo "Iron Man flying in the sky" en la model card).

## Capacidades

- Generación de vídeo a partir de prompts de texto, heredada del modelo base Pika-Flex (no del adaptador en sí).
- Restauración de diversidad entre muestras: el objetivo declarado es que semillas distintas produzcan clips distintos en lugar de near-duplicates.
- Inferencia en pocos pasos, característica del generador destilado subyacente.
- Compatibilidad con el ecosistema de adaptadores LoRA sobre el modelo base, según la tag `lora` del repositorio.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni multilingüismo en la información disponible.

## Casos de uso

- Generación de variantes creativas para publicidad: al restaurar la diversidad entre semillas, un mismo prompt puede producir varias propuestas visualmente distintas para test A/B, en lugar de clips casi idénticos.
- Previsualización de storyboards: generar varias tomas alternativas de una misma escena para que el equipo creativo elija, aprovechando la inferencia en pocos pasos del modelo base.
- Aumento de datos sintéticos para vídeo: producir clips diversos de una misma categoría para entrenar o evaluar modelos de visión por computador, reduciendo el sesgo hacia una única realización visual.
- Iteración de prompts en herramientas de creación: al no colapsar a una sola salida por semilla, el usuario puede explorar el espacio del prompt con mayor fidelidad a la variabilidad esperada.
- Investigación sobre destilación de modelos generativos: el adaptador sirve como referencia reproducible para estudiar la pérdida de diversidad en generadores destilados y su corrección vía LoRA.
- Integración en pipelines de generación de contenido a escala: aplicar el adaptador sobre Pika-Flex en un servicio de texto-a-vídeo para evitar que el catálogo de salidas se vuelva redundante entre peticiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye comparaciones visuales cualitativas (clips emparejados por semilla con y sin ReDiverse) y remite a la pestaña Pika-Flex de la página del proyecto para más resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende enteramente del modelo base Pika-Flex/MiniMax-H3, cuyos requisitos no se detallan en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; el adaptador no está publicado todavía y no se documentan frameworks de inferencia compatibles.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReDiverse-Pika-Flex | LoRA de diversidad | Pika-Flex (MiniMax-H3) | Restaurar diversidad en generador destilado | no disponible | Pesos no publicados ("coming soon") |
| ReDiverse-MiniMax-H3 | LoRA de diversidad | MiniMax-H3 | Restaurar diversidad en generador destilado | no disponible | Disponible en Hugging Face |
| Pika-Flex | Generador texto-a-vídeo destilado | MiniMax-H3 | Generación rápida en pocos pasos | no disponible | Modelo base referenciado |
| MiniMax-H3 | Generador texto-a-vídeo | — | Generación texto-a-vídeo | no disponible | Modelo base referenciado |

No se dispone de datos de rendimiento cuantitativo para establecer una comparación numérica con alternativas.

## Limitaciones y advertencias

- Los pesos del adaptador no están publicados en el repositorio en el momento de redactar esta ficha; la model card indica que se liberarán "coming soon".
- La licencia no está especificada, por lo que no puede confirmarse el uso comercial ni las condiciones de redistribución.
- El adaptador depende del modelo base Pika-Flex; sus limitaciones (sesgos, calidad, idiomas, resolución, duración de clip) se heredan y no se documentan aquí.
- No hay información sobre sesgos conocidos, tasas de alucinación visual ni evaluación de seguridad del contenido generado.
- No se documentan idiomas soportados para los prompts.
- El método se evalúa de forma cualitativa en la información disponible; no hay métricas publicadas de diversidad ni de fidelidad al prompt.
- Al ser un adaptador LoRA, requiere el pipeline de inferencia del modelo base y no es desplegable de forma autónoma.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ReDiverse/ReDiverse-Pika-Flex
- Adaptador MiniMax-H3: https://huggingface.co/ReDiverse/ReDiverse-MiniMax-H3
- Organización ReDiverse en Hugging Face: https://huggingface.co/ReDiverse
- Paper (arXiv): https://arxiv.org/abs/2611.18550
- Página del proyecto: https://rediverse-distillation.github.io/rediverse-distillation/
- Código en GitHub: https://github.com/H-furkan/rediverse
