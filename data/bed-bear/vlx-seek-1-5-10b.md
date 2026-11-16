# bed-bear/VLX-Seek-1.5-10B

## Resumen

VLX-Seek-1.5-10B es un modelo de visión-lenguaje (VLM) de 10.016.903.016 parámetros desarrollado por el equipo bed-bear (om-ai-lab), diseñado específicamente para percepción visual de grano fino y grounding visual en escenarios embodied: drones, robots, perros robóticos, cámaras de vigilancia y sistemas de inspección en el borde. A diferencia de los VLM que generan coordenadas de bounding box como cadenas de texto, VLX-Seek reformula la localización como recuperación y referencia de regiones: las regiones candidatas se convierten en entidades direccionables (region tokens) y el modelo responde seleccionando, comparando y refiriéndose a ellas.

El modelo forma parte de la familia VLX-Seek 1.5, planificada en tamaños 0.6B, 3B y 10B; esta ficha corresponde al checkpoint de 10B. Incorpora una torre visual auxiliar más potente, mejor alineación visión-lenguaje, un backbone VLM reforzado y capas de atención lineal para reducir consumo de memoria y mejorar la eficiencia de inferencia. Además, introduce rechazo explícito de objetivos ausentes mediante entrenamiento con hard-negatives y un formato de salida `None`, orientado a mitigar el grounding alucinado.

Es relevante ahora porque ataca un problema práctico en despliegues robóticos y de vigilancia: no basta con detectar qué hay en la imagen, sino localizar la instancia correcta y abstenerse cuando el objeto no está presente. La licencia Apache 2.0 y su tamaño de 10B lo sitúan como una alternativa abierta para módulos de percepción en sistemas edge y estaciones base de robots.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM multimodal con backbone transformer, torre visual auxiliar y capas de atención lineal (detalle completo no disponible) |
| Parametros totales | 10.016.903.016 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | zh, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

VLX-Seek-1.5-10B es un VLM multimodal que combina un backbone de lenguaje con una pila de percepción visual mejorada: torre visual auxiliar más potente, alineación visión-lenguaje reforzada y un backbone VLM más capaz. La innovación central es la localización por referencia de regiones: en lugar de decodificar coordenadas como texto, el pipeline genera propuestas de región (OPN, con generación de propuestas más rápida en esta versión), las convierte en region tokens direccionables y el modelo responde seleccionando, comparando o refiriéndose a esas regiones. Esto alinea la localización con las capacidades lingüísticas del modelo (comparación, selección, referencia y razonamiento) y reduce la dependencia de la generación frágil de cadenas de coordenadas. La versión 1.5 incorpora además más capas de atención lineal para mejorar la eficiencia de inferencia y reducir el uso de memoria.

El entrenamiento incluye hard-negative rejection para que el modelo aprenda a emitir explícitamente `None` cuando el objetivo referido no está presente, lo que disminuye el grounding alucinado. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. El modelo está optimizado para escenarios embodied: vista de dron, vigilancia, vista de robot y percepción en el borde.

## Capacidades

- Generación de texto e image-text-to-text conversacional sobre imágenes.
- Detección de objetos de vocabulario abierto (open-vocabulary object detection) y zero-shot object detection.
- Grounding visual y localización de instancias mediante referencia de regiones.
- Comprensión de expresiones referenciales (REC, Referring Expression Comprehension).
- Grounding visual multiobjeto.
- Conteo de objetos con evidencia a nivel de región.
- Rechazo explícito de objetivos ausentes mediante salida `None` (reducción de alucinación de objetos).
- Percepción en vista de dron con objetos pequeños y layouts densos.
- Razonamiento espacial centrado en robot y escenarios embodied.
- Soporte multilingüe limitado a chino (zh) e inglés (en).
- No se documenta soporte de tool calling, function calling ni modo thinking en la información disponible.

## Casos de uso

- Inspección con drones: el modelo localiza objetos pequeños y densos en vista aérea mediante region tokens, lo que permite anclar detecciones a regiones estables en lugar de coordenadas generadas, útil para inventario, búsqueda y rescate o monitorización de infraestructuras.
- Robótica de manipulación y navegación: actúa como módulo de percepción que responde a referencias del tipo "el objeto a la izquierda de la caja" seleccionando la región candidata correcta, proporcionando anclas espaciales estables al planificador.
- Vigilancia e inspección en el borde: al estar pensado para cámaras y sistemas edge, puede desplegarse como módulo de detección y grounding con rechazo de objetivos ausentes, reduciendo falsas alarmas cuando el objeto buscado no aparece.
- Conteo de objetos con evidencia regional: en inventarios, aforos o inspección industrial, el modelo cuenta instancias y aporta la región concreta que respalda cada conteo, facilitando la verificación humana.
- Asistentes visuales para perros robóticos o plataformas móviles: interpretación de instrucciones referenciales en lenguaje natural sobre la escena percibida, con salida de regiones que el sistema de control puede consumir.
- Investigación en percepción multimodal de grano fino: banco de pruebas para experimentos de grounding, REC y evaluación de alucinación de objetos, con licencia Apache 2.0 para reproducibilidad.
- Sistemas de inspección con rechazo de ausencias: en control de calidad, el modelo puede indicar explícitamente que un defecto referido no está presente, evitando inspecciones fantasma.

## Benchmarks y rendimiento

La model card referencia tablas de evaluación en imágenes alojadas externamente (detección de objetos común, REC, REC y conteo, escenarios de dron, razonamiento espacial embodied y comparación de alucinación de objetos en HumanRef, VisDrone y RefDrone), pero los valores numéricos no están incluidos en la información proporcionada.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (10B parámetros), en FP16 se requerirían aproximadamente 20 GB solo para pesos, más memoria para la torre visual, el pipeline de propuestas de región y el contexto; en cuantización de 8 bits, unos 10-11 GB para pesos; en 4 bits, unos 5-6 GB para pesos. Estas cifras son estimaciones por tamaño, no datos publicados del modelo.
- GPU recomendadas: no disponible en la información. Por tamaño, cabría esperar GPUs de datacenter como A100 40/80 GB o H100 para FP16 con margen, y GPUs consumer de gama alta (RTX 4090 con 24 GB) para FP16 ajustado o cuantización.
- ¿Cabe en GPU consumer? Probablemente en RTX 4090 (24 GB) en FP16 ajustado o cuantización, y en GPUs de 16 GB solo con cuantización agresiva; no confirmado por el autor.
- Opciones de despliegue: transformers (librería indicada) con el pipeline de inferencia propio del repositorio GitHub om-ai-lab/VLX-Seek, que incluye generación de propuestas de región, construcción de region tokens, formateo de prompts y post-procesado. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones publicadas en la información proporcionada para establecer una comparativa cuantitativa con alternativas concretas. A continuación se indica la comparación cualitativa posible según categoría (VLM de grounding):

| Modelo | Parametros | Contexto | Enfoque de localizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VLX-Seek-1.5-10B | 10.016.903.016 | no disponible | Referencia de regiones (region tokens) | Apache 2.0 | Hugging Face + GitHub |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

Comparativa cuantitativa con modelos similares: no disponible.

## Limitaciones y advertencias

- Dependencia de las propuestas de región: si el recall del generador de propuestas (OPN) es bajo, el modelo puede no localizar el objetivo correcto aunque su comprensión del lenguaje sea suficiente.
- Las salidas de referencia de región requieren el pipeline de post-procesado de VLX-Seek para mapear los region tokens a coordenadas de imagen; no es un modelo plug-and-play con generación directa de bounding boxes.
- Puede cometer errores bajo oclusión severa, desenfoque extremo, resolución muy baja, artefactos de sensor inusuales o expresiones referenciales muy ambiguas.
- El entrenamiento con hard-negatives reduce la alucinación de objetos pero no la elimina; en despliegues de alto impacto se recomienda validación adicional o supervisión humana.
- Idiomas limitados a chino e inglés; no se documenta soporte de castellano.
- No se documentan sesgos específicos, pero al estar orientado a vigilancia, drones y robots existen riesgos de privacidad, seguridad y equidad; el usuario es responsable del cumplimiento legal, del consentimiento y de evitar vigilancia ilícita, discriminación o acciones autónomas inseguras.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las dependencias del repositorio de inferencia y de la torre visual auxiliar, cuyas licencias no se detallan en la información disponible.
- Longitud de contexto y tipos de cuantización no documentados, lo que dificulta planificar despliegues con prompts largos o múltiples imágenes.

## Enlaces

- Hugging Face: https://huggingface.co/bed-bear/VLX-Seek-1.5-10B
- GitHub del proyecto: https://github.com/om-ai-lab/VLX-Seek
- Blog VLX-Seek 1.5: https://om-ai-lab.github.io/2026_07_06_vlx_seek_1_5_en.html
- Tabla 1 (detección de objetos común): https://om-ai-lab.github.io/images/vlx-seek1.5/Table1_new.jpg
- Tabla 2 (REC): https://om-ai-lab.github.io/images/vlx-seek1.5/Table2_new.jpg
- Tabla 3 (REC y conteo): https://om-ai-lab.github.io/images/vlx-seek1.5/Table3_new.jpg
- Tabla 4 (escenarios de dron): https://om-ai-lab.github.io/images/vlx-seek1.5/Table4_new.jpg
- Tabla 5 (razonamiento espacial embodied): https://om-ai-lab.github.io/images/vlx-seek1.5/Table5_new.jpg
- Tabla 6 (alucinación de objetos): https://om-ai-lab.github.io/images/vlx-seek1.5/Table6_new.jpg
