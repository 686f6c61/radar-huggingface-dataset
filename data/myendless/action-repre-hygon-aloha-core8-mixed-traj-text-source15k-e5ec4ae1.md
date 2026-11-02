# myendless/action-repre-hygon-aloha-core8-mixed-traj-text-source15k-e5ec4ae1

## Resumen

Este repositorio contiene un checkpoint de investigación orientado a la representación de acciones en robótica, construido a partir de Qwen3-VL-4B-Instruct. Lo desarrolla el usuario `myendless` y no es un modelo conversacional ni un VLM al uso: es un `state_dict` nativo de PyTorch pensado para cargarse con el cargador específico de Action Representation Benchmark, no con `transformers`. El objetivo es aprender una representación compartida entre trayectorias de acción (puntos finales dispersos) y descripciones textuales asociadas a cámaras, dentro de un pipeline de manipulación robótica sobre el conjunto ALOHA Core-8.

El entrenamiento se realizó sobre 8 GPUs Hygon con seed 42 y batch global de 128 durante 15 000 pasos, con una pérdida final de 0,05667. Una particularidad crítica: el modelo no actualiza la cabeza de ejecución de acciones, por lo que no sirve por sí solo para leer acciones ARX; requiere una etapa posterior de "fresh action expert" para evaluaciones cruzadas de cuerpo (cross-embodiment). El autor declara explícitamente que no existen aún resultados de evaluación en bucle cerrado ni de VQA con estos pesos.

Por tanto, se trata de un artefacto de investigación reproducible (incluye configuración, processor, manifest, normalización, métricas e identidad de código) más que de un modelo listo para producción. Su relevancia es acotada: interesa a quienes trabajan en representaciones de acción, aprendizaje por imitación y adaptación entre morfologías robóticas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (derivada de Qwen3-VL-4B-Instruct); representación de acciones sobre puntos finales de trayectoria y texto |
| Parametros totales | 4B (heredados del modelo base Qwen3-VL-4B-Instruct; no se detalla recuento exacto del checkpoint) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye `model.pt` en precisión nativa) |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (state_dict nativo completo, incluye ramas auxiliares); no es un directorio estándar de Transformers |
| Protocolo de ejecución/estado | joint14 / H32 |
| Benchmark asociado | Action Representation Benchmark (cargador nativo) |
| Run ID | `hygon_core8_aloha_mixed_traj_text_repr15k_seed42_20261101_v1` |
| SHA256 de pesos | `e5ec4ae1ded199011e1faaa837e38d4af8043972297214b97bf9b8cd0763c861` |
| Tamaño del repo | 12,9 GB |

## Arquitectura y entrenamiento

El modelo parte de la inicialización de Qwen3-VL-4B-Instruct, un transformer multimodal con torre visual y decoder de lenguaje. Sobre esa base se entrena una representación de acciones en la que, para cada paso, se calculan dos pérdidas en paralelo sobre el mismo batch y los mismos puntos de parámetros: una sobre la trayectoria dispersa de puntos finales (sparse endpoint trajectory) y otra sobre el texto de cámara correspondiente al punto final. Cada pérdida se multiplica por 1/√2 y los gradientes se combinan, realizando una única actualización por paso.

El entrenamiento usó ALOHA Core-8 con 8 GPUs Hygon, seed 42 y batch global 128, durante 15 000 pasos, alcanzando una pérdida final de 0,05667311414711895. No se actualiza la cabeza de ejecución de acciones, de modo que el checkpoint representa la fase de representación, no la de política ejecutable. El autor indica que el repositorio incluye configuración original, processor, manifest, estadísticas de normalización, métricas de entrenamiento e identidad de código, pero no optimizer, estado RNG ni imágenes de entrenamiento. También advierte que la ruta de código fusionada no sobrescribe el registro de procedencia de código de runs históricos.

## Capacidades

- Aprendizaje de representación conjunta de trayectorias de acción (puntos finales dispersos) y texto asociado a cámaras.
- Codificación multimodal heredada de Qwen3-VL-4B-Instruct (visión y lenguaje), reutilizada como base para la representación.
- Soporte de protocolo de estado/ejecución joint14 con H32 para el benchmark de representación de acciones.
- Capacidad multilingüe limitada a chino e inglés según los metadatos.
- No incluye cabeza de ejecución de acciones funcional: no genera comandos ARX directamente.
- No se reportan capacidades de tool calling, function calling ni razonamiento multi-paso evaluadas para este checkpoint.
- No se reportan capacidades de agente ni modo "thinking" específicas de este fine-tuning.

## Casos de uso

- Investigación en representación de acciones: cargar el `state_dict` con el cargador nativo de Action Representation Benchmark para reproducir el experimento `hygon_core8_aloha_mixed_traj_text_repr15k_seed42_20261101_v1` y analizar la pérdida de representación conjunta trayectoria-texto.
- Estudio de alineamiento acción-lenguaje: usar los pares trayectoria/texto de cámara para analizar cómo el modelo alinea descripciones textuales con puntos finales de trayectoria en entornos ALOHA Core-8.
- Base para una etapa posterior de "fresh action expert": servir como inicialización congelada o parcial para entrenar una cabeza de ejecución que permita evaluaciones cruzadas de cuerpo (cross-embodiment).
- Reproducibilidad de experimentos: verificar la integridad de los pesos mediante el SHA256 publicado y comparar métricas de entrenamiento con la configuración, manifest y normalización incluidas en el repo.
- Investigación en adaptación entre morfologías: emplear la representación aprendida para estudiar transferencia entre cuerpos robóticos dentro del protocolo joint14/H32.
- Docencia y divulgación técnica: ilustrar pipelines de entrenamiento multi-GPU (8× Hygon) con pérdidas combinadas ponderadas por 1/√2 y actualización única por paso.
- Auditoría de procedencia de modelos: usar la identidad de código y el run ID para trazar el origen del checkpoint en estudios de reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que aún no hay evaluaciones de bucle cerrado ni de VQA con estos pesos, y que la evaluación de acciones cruzadas requiere una etapa de action expert adicional. El único dato numérico reportado es la pérdida final de entrenamiento: 0,05667311414711895 en el paso 15 000.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 4B en fp16 requiere del orden de 8-9 GB solo para pesos, más overhead de activaciones y torre visual; el repo de 12,9 GB sugiere pesos en mayor precisión o artefactos auxiliares.
- GPU recomendadas: el entrenamiento se realizó con 8 GPUs Hygon; para carga e inspección del checkpoint se recomienda al menos una GPU con 16-24 GB (A100, H100, L40S) o CPU con suficiente RAM.
- GPU de consumo: probablemente viable en RTX 4090 (24 GB) o RTX 3090 para carga en precisión reducida, aunque no hay confirmación oficial ni soporte de cuantización documentado.
- Opciones de despliegue: no es compatible con vLLM, TGI, llama.cpp u Ollama de forma estándar, ya que no es un directorio Transformers. Requiere el cargador nativo de Action Representation Benchmark y código propio del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (myendless) | 4B (base Qwen3-VL-4B) | no disponible | Representación de acciones robóticas (trayectoria + texto) | no disponible | HuggingFace, 0 descargas |
| Qwen/Qwen3-VL-4B-Instruct | 4B | no disponible en esta ficha | VLM instructivo general | no disponible en esta ficha | HuggingFace, ampliamente usado |
| Alternativas de representación de acción robótica | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer comparaciones cuantitativas con otros modelos de representación de acciones. La comparación con el modelo base es únicamente estructural: este checkpoint reutiliza su inicialización pero no conserva necesariamente sus capacidades instructivas intactas.

## Limitaciones y advertencias

- No es un modelo listo para inferencia conversacional ni VQA: es un `state_dict` de investigación que requiere cargador específico.
- No incluye cabeza de ejecución de acciones entrenada; sin una etapa de "fresh action expert" no puede producir comandos ARX.
- Ausencia total de evaluaciones publicadas en bucle cerrado, VQA o cross-embodiment con estos pesos.
- Licencia no especificada: riesgo legal para uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Idiomas limitados a chino e inglés según metadatos; no se garantiza comportamiento en castellano.
- Riesgo de alucinación y sesgos heredados del modelo base Qwen3-VL-4B-Instruct, no evaluados en este fine-tuning.
- El repo no incluye optimizer, RNG ni datos de imágenes, lo que limita la reproducción exacta del entrenamiento.
- El autor advierte que la ruta de código fusionada no sobrescribe la procedencia de runs históricos, lo que puede complicar la trazabilidad.
- Sin descargas ni likes: no hay evidencia de validación por parte de la comunidad.
- El tamaño del repo (12,9 GB) y el formato `model.pt` monolítico dificultan su integración en pipelines estándar.

## Enlaces

- HuggingFace: https://huggingface.co/myendless/action-repre-hygon-aloha-core8-mixed-traj-text-source15k-e5ec4ae1
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Action Representation Benchmark: no disponible (no se proporciona URL en la información)
- Paper, blog o demo: no disponible
