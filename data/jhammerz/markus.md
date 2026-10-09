# JHammerZ/Markus

## Resumen

Lance es un modelo multimodal unificado desarrollado por ByteDance que integra comprensión, generación y edición de imagen y vídeo dentro de un único framework. El repositorio analizado, JHammerZ/Markus, es una publicación derivada que apunta a Lance como base técnica y declara como modelo base Qwen/Qwen2.5-VL-3B-Instruct, con licencia Apache 2.0 y etiqueta de pipeline any-to-any. El peso del repositorio es de 57,4 GB en formato safetensors y la librería declarada es Lance.

La propuesta clave del modelo es su eficiencia a escala 3B: la model card afirma que, con solo 3.000 millones de parámetros activos, obtiene resultados competitivos en benchmarks de generación de imagen, edición de imagen y generación de vídeo. El entrenamiento se realizó desde cero con una receta multi-tarea por etapas y un presupuesto declarado de 128 GPU A100, lo que lo sitúa en un rango de coste de entrenamiento relativamente contenido frente a modelos multimodales de mayor tamaño.

Es relevante ahora porque cubre cuatro tareas tradicionalmente repartidas entre modelos especializados (texto-a-imagen, edición de imagen, texto-a-vídeo y comprensión de vídeo) en un solo modelo de 3B, lo que simplifica despliegues en producción con recursos limitados. No obstante, no se han publicado en la información disponible datos de longitud de contexto, idiomas soportados ni resultados numéricos de benchmarks, por lo que la evaluación cuantitativa queda pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card la describe como "native unified multimodal model"; no se detalla si es transformer denso, MoE o híbrida) |
| Parametros totales | no disponible |
| Parametros activos | 3.000 millones (citados en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo declara safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card define Lance como un modelo multimodal unificado nativo que soporta comprensión, generación y edición de imagen y vídeo en un solo framework. No se especifica en la información proporcionada la arquitectura interna (transformer denso, mezcla de expertos, SSM o híbrida), ni el número de tokens de entrenamiento, ni la composición del dataset, ni si se aplicaron etapas de RLHF o DPO. Lo que sí se declara explícitamente es que el modelo se entrenó desde cero con una receta multi-tarea por etapas ("staged multi-task recipe") y con un presupuesto de cómputo de 128 GPU A100.

Existe una discrepancia relevante en los metadatos: las etiquetas de HuggingFace indican que el repositorio es un finetune de Qwen/Qwen2.5-VL-3B-Instruct, mientras que la model card de Lance afirma que el modelo se entrenó íntegramente desde cero. Esta contradicción no se resuelve en la información disponible y conviene verificarla antes de asumir cualquiera de las dos afirmaciones. Tampoco se documentan innovaciones técnicas concretas como decodificación especulativa, atención lineal o mecanismos de fusión multimodal específicos.

## Capacidades

- Generación de imagen a partir de texto (text-to-image).
- Edición de imagen guiada por instrucciones.
- Generación de vídeo a partir de texto (text-to-video).
- Edición de vídeo.
- Comprensión de vídeo (video understanding).
- Comprensión de imagen, heredada del pipeline any-to-any declarado.
- Edición multi-turno con consistencia entre iteraciones (la model card incluye una sección específica de "multi-turn consistency editing").
- Naturaleza any-to-any: acepta y produce combinaciones de texto, imagen y vídeo.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; HuggingFace no declara idiomas.
- Modo de razonamiento explícito ("thinking mode"): no disponible.

## Casos de uso

- Generación de material gráfico para campañas de marketing: el modelo puede producir imágenes a partir de descripciones textuales dentro del mismo pipeline que después se usa para editarlas, evitando encadenar un generador de imagen y un editor independientes.
- Postproducción de vídeo publicitario: la capacidad de edición de vídeo permite modificar planos existentes mediante instrucciones en lenguaje natural, útil en flujos donde no se dispone de artistas 3D para cada iteración creativa.
- Creación de vídeo corto para redes sociales: con 3B de parámetros activos, el coste por clip generado es inferior al de modelos de vídeo de mayor tamaño, lo que facilita la generación por lotes.
- Moderación y análisis de contenido audiovisual: la comprensión de vídeo permite clasificar, resumir o etiquetar clips automáticamente antes de su publicación.
- Iteración de diseño de producto: la edición multi-turno con consistencia permite refinar un mockup manteniendo la identidad visual entre pasos sucesivos, en lugar de regenerar desde cero en cada ronda.
- Prototipado rápido en estudios pequeños: al caber en hardware de gama alta de consumo, un equipo reducido puede desplegarlo en local sin depender de APIs de pago.
- Enriquecimiento de catálogos de e-commerce: generar variantes de producto (fondos, iluminación, ángulos) a partir de una foto base y una instrucción textual.
- Investigación en modelos unificados: sirve como referencia reproducible de una receta multi-tarea entrenada con 128 GPU A100, útil para estudiar compromisos entre tareas a escala 3B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card menciona de forma cualitativa un "strong performance across image generation, image editing, and video generation benchmarks" y enlaza a una figura de resumen de benchmarks (`assets/benchmarks/benchmark-overview.png`), pero no se incluyen cifras, nombres de conjuntos de evaluación ni comparaciones numéricas con otros modelos en el texto proporcionado. No se deben inferir valores a partir de esa afirmación cualitativa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, el repositorio ocupa 57,4 GB en safetensors, cantidad que incluye pesos del modelo, componentes auxiliares y activos de demostración (vídeos y GIF del README); el peso real de los parámetros en precisión de 16 bits para 3.000 millones de parámetros sería de aproximadamente 6 GB, a lo que habría que sumar los componentes de generación de imagen y vídeo.
- GPU recomendadas: no disponibles de forma oficial. El entrenamiento se realizó con 128 GPU A100, pero eso no determina los requisitos de inferencia.
- Cabe en GPU de consumo: probablemente sí en GPUs con 12-24 GB de VRAM (por ejemplo RTX 4090, RTX 3090) si los componentes de difusión se cargan por separado o cuantizados, aunque no hay confirmación oficial.
- Opciones de despliegue: la librería declarada es Lance; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. La generación de vídeo, en particular, no es compatible con los backends de inferencia de texto habituales.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lance (JHammerZ/Markus) | 3B activos (totales no disponibles) | no disponible | Imagen y vídeo: comprensión, generación y edición | Apache 2.0 | HuggingFace, repo de 57,4 GB |
| Qwen2.5-VL-3B-Instruct | 3B | no disponible en esta ficha | Comprensión de visión y lenguaje | Apache 2.0 (según el modelo base declarado) | HuggingFace |
| Alternativas de generación de vídeo de escala similar | no disponible | no disponible | Generación de vídeo | no disponible | no disponible |

No se dispone de datos de rendimiento comparativos entre Lance y otras alternativas en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y cobertura de tareas.

## Limitaciones y advertencias

- No se han publicado resultados numéricos de benchmarks, por lo que el rendimiento real en generación de imagen, edición y vídeo no puede verificarse con los datos disponibles.
- Contradicción en los metadatos: las etiquetas de HuggingFace indican finetune de Qwen/Qwen2.5-VL-3B-Instruct, mientras que la model card afirma entrenamiento desde cero. Es necesario aclararlo antes de citar procedencia o atribución.
- No se declaran idiomas soportados, lo que impide garantizar un comportamiento correcto en castellano o en cualquier otro idioma concreto.
- No se documenta la longitud de contexto, un dato crítico para tareas de comprensión de vídeo con secuencias largas.
- El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe validación por parte de la comunidad ni informes independientes de funcionamiento.
- La fecha de creación declarada (2026-10-08) es posterior a la fecha de referencia habitual de los modelos citados como base, lo que conviene verificar.
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones de fidelidad en la generación.
- Licencia Apache 2.0: permite uso comercial, pero al tratarse de un modelo derivado conviene revisar también las condiciones del modelo base declarado (Qwen2.5-VL-3B-Instruct) y de los componentes auxiliares incluidos en el repositorio.
- Un modelo de vídeo generativo de 3B tiende a producir artefactos en movimientos complejos, textos dentro de la imagen y coherencia temporal larga; no hay datos publicados que cuantifiquen este extremo para Lance.

## Enlaces

- HuggingFace: https://huggingface.co/JHammerZ/Markus
- Página del proyecto: https://lance-project.github.io/
- Paper (arXiv): http://arxiv.org/abs/2605.18678
- Repositorio de código: https://github.com/bytedance/Lance
- Modelo base declarado: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- DOI: 10.57967/hf/10827
- Nota sobre la búsqueda web: las consultas realizadas no devolvieron resultados relevantes sobre este modelo. Los resultados obtenidos correspondían a la deidad romana Lua Mater y a un centro de yoga, y no guardan relación con el modelo Lance ni con el repositorio JHammerZ/Markus.
