# qbz506/p-s-hord-m2

## Resumen

El modelo `qbz506/p-s-hord-m2` es un checkpoint de entrenamiento intermedio de la serie **prabhasa-samskrutam**, un proyecto de investigación sobre modelos de lenguaje con arquitectura híbrida Mamba/atención orientados al sánscrito (sa) y al inglés (en). Publicado bajo el seudónimo `p-s` por el autor `qbz506`, este repositorio contiene dos brazos de un estudio de ablación: `baseline` y `treatment`, ambos con 199 millones de parámetros y entrenados sobre 650 millones de tokens hasta el paso 1240. El objetivo del proyecto es explorar estructuras lingüísticas inspiradas en la gramática pāṇiniana aplicadas a modelos de lenguaje modernos.

La relevancia de este modelo reside en su carácter de investigación: no es un modelo de inferencia empaquetado, sino un artefacto de entrenamiento resumible que permite reproducir y analizar el efecto de la intervención experimental (el brazo `treatment`) frente a una línea base. Su arquitectura híbrida Mamba/atención, con tokenizer byte-level y canales estructurados, representa una aproximación novedosa al procesamiento de lenguas clásicas con recursos computacionales limitados. Aunque no se han publicado benchmarks, su licencia Apache 2.0 y su tamaño compacto lo convierten en un punto de partida interesante para investigaciones sobre morfología sánscrita y eficiencia arquitectónica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba/atención (estructura pāṇiniana) |
| Parametros totales | 199M (por brazo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no aplica (checkpoints PyTorch crudos, sin cuantizar) |
| Idiomas soportados | sa (sánscrito), en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pt` (state_dict) |

## Arquitectura y entrenamiento

La arquitectura combina capas basadas en Mamba (modelos de espacio de estados) con mecanismos de atención, en una configuración híbrida diseñada para capturar estructuras gramaticales del sánscrito siguiendo principios pāṇinianos. El modelo tiene `d_model=768` y `n_layers=24`, con un tokenizer byte-level de vocabulario reducido (256 tokens) y canales estructurados con `n_roles=16`, lo que sugiere una codificación explícita de roles sintácticos o morfológicos. Cada checkpoint incluye el estado del optimizador, la configuración de arquitectura, el brazo experimental (`arm`), el paso de entrenamiento, el número de tokens vistos y un cursor, lo que permite reanudar el entrenamiento exactamente donde se detuvo.

El entrenamiento se realizó sobre 650 millones de tokens, un volumen modesto que refleja su propósito de investigación. No se menciona el uso de RLHF ni DPO; el proceso parece ser un entrenamiento supervisado estándar. La inclusión de archivos `anchor_*.pt` sugiere el uso de anclas magnéticas MMD durante el entrenamiento, una técnica poco común que podría estar relacionada con la estabilización de la representación interna. El código de arquitectura y tokenizer está disponible en el repositorio de GitHub del proyecto.

## Capacidades

- Generación de texto en sánscrito e inglés, aunque no se han publicado evaluaciones formales de calidad.
- Procesamiento de lenguaje con tokenización byte-level, adecuada para morfologías complejas como la del sánscrito.
- Arquitectura híbrida Mamba/atención que permite capturar dependencias de largo alcance con eficiencia computacional.
- Capacidad de reanudar entrenamiento desde cualquier checkpoint, útil para experimentos de ablación y análisis de dinámicas de aprendizaje.
- Diseño experimental con brazos `baseline` y `treatment`, lo que permite estudiar el efecto de la intervención específica.
- Soporte de canales estructurados con 16 roles, potencialmente orientados a etiquetas gramaticales o funciones sintácticas.
- No se han documentado capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- Investigación en lingüística computacional sánscrita: el modelo permite estudiar cómo una arquitectura híbrida con sesgo pāṇiniano procesa la morfología flexiva del sánscrito, comparando el brazo `treatment` con el `baseline`.
- Experimentos de ablación arquitectónica: al ser checkpoints resumibles, se pueden reanudar entrenamientos con diferentes hiperparámetros o continuar desde pasos intermedios para analizar la convergencia.
- Desarrollo de tokenizadores byte-level para lenguas de bajos recursos: el diseño del tokenizer puede servir como referencia para otros idiomas con morfología rica.
- Estudio de dinámicas de entrenamiento en modelos pequeños: con solo 199M parámetros y 650M tokens, es un banco de pruebas accesible para investigar técnicas de estabilización (como los anclajes MMD).
- Base para fine-tuning en tareas específicas de sánscrito: aunque no está empaquetado para inferencia, sus pesos pueden convertirse a formatos de inferencia (p. ej., ONNX, GGUF) para adaptarlo a tareas downstream.
- Reproducción de resultados académicos: el repositorio público en GitHub permite replicar la arquitectura y el tokenizer, facilitando la verificación de experimentos publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de tareas estándar como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. Dado que se trata de un checkpoint de investigación en fase temprana (paso 1240, 650M tokens), no se puede evaluar su rendimiento práctico sin un análisis adicional.

## Requisitos de hardware

- Con 199M parámetros, el checkpoint en float32 ocupa aproximadamente 800 MB en memoria (199M × 4 bytes), más el estado del optimizador que puede duplicar o triplicar ese requisito durante el entrenamiento.
- Para inferencia tras convertir los pesos a float16, la VRAM necesaria sería de unos 400 MB, lo que cabe en cualquier GPU moderna con al menos 4 GB.
- GPUs recomendadas: cualquier GPU con 8 GB o más (p. ej., RTX 3060, RTX 4060) sería suficiente para cargar el modelo y ejecutar inferencia; para reanudar entrenamiento se recomienda al menos 16 GB.
- Al ser un checkpoint PyTorch, el despliegue requiere convertir los pesos a un formato de inferencia como safetensors o GGUF. No hay soporte nativo para vLLM, llama.cpp u Ollama sin conversión previa.
- El repositorio de código en GitHub proporciona la implementación de la arquitectura, por lo que se puede cargar el modelo con `torch.load` y `build_model(**config)`, como se indica en la model card.
- La latencia y el throughput dependen del hardware y de la conversión; con un modelo de este tamaño, la inferencia en CPU es viable para uso interactivo, y en GPU sería prácticamente instantánea.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos similares. El modelo no ha sido evaluado en benchmarks públicos, y su arquitectura híbrida Mamba/atención con enfoque pāṇiniano no tiene equivalentes comerciales directos. Se podría comparar con modelos pequeños de Mamba puro (p. ej., Mamba-130M) o con modelos de sánscrito existentes, pero no hay datos publicados que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No es un modelo de inferencia empaquetado: son checkpoints crudos de entrenamiento que requieren carga manual y conversión para su uso práctico.
- Entrenamiento limitado: solo 650M tokens y 1240 pasos, lo que probablemente resulta en un rendimiento deficiente en tareas generales de lenguaje.
- Idiomas restringidos: solo sánscrito e inglés; no hay soporte multilingüe más amplio.
- Sin evaluación publicada: no existen benchmarks ni análisis de sesgos, por lo que el comportamiento en producción es desconocido.
- Riesgo de alucinación y errores gramaticales: al ser un modelo pequeño y poco entrenado, es probable que genere texto incoherente en tareas complejas.
- La licencia Apache 2.0 permite uso comercial, pero al ser un artefacto de investigación, el autor no ofrece garantías de estabilidad ni soporte.
- Los archivos `anchor_*.pt` son específicos del proceso de entrenamiento y pueden no ser necesarios para inferencia, pero su función exacta no está documentada en detalle.
- Para producción, se recomienda un modelo más grande y entrenado con más datos, o al menos un fine-tuning específico tras convertir los pesos.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/qbz506/p-s-hord-m2
- Repositorio de código y arquitectura: https://github.com/SharathSPhD/prabhasa-samskrutam
- Perfil del autor en HuggingFace: https://huggingface.co/qbz506
