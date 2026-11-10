# harryjo97/DreamFree-LIBERO

## Resumen

DreamFree-LIBERO es un checkpoint de política robótica publicado por harryjo97 (Jaehyeong Jo y colaboradores) que implementa el método DreamFree, un World Action Model (WAM) de tipo "imagination-free". A diferencia de los world models clásicos, que generan fotogramas futuros antes de predecir la acción, este modelo destila representaciones visuales futuras y predice directamente bloques de acciones, eliminando el coste computacional de la generación de vídeo en tiempo de inferencia. El checkpoint está entrenado específicamente sobre los cuatro conjuntos de tareas del benchmark LIBERO (Spatial, Object, Goal y LIBERO-10).

La arquitectura se apoya en un backbone de vídeo de 5.000 millones de parámetros, Wan2.2-TI2V-5B, que actúa como codificador visual (video DiT), combinado con un módulo de lectura (readout) y un DiT de acciones. La entrada combina dos vistas de cámara, una instrucción en lenguaje natural y el estado propioceptivo del robot; la salida es un chunk de 32 pasos de acciones de 7 dimensiones. El repositorio ocupa 12,1 GB e incluye tanto el codificador visual de la etapa 1 como los módulos de acción de la etapa 2.

Es relevante porque propone una vía para reducir la latencia de los world action models sin renunciar a las representaciones visuales ricas del backbone de vídeo, y porque publica el checkpoint completo bajo licencia MIT, algo poco habitual en modelos robóticos derivados de backbones de vídeo de gran tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | WAM (World Action Model) con codificador visual DiT de vídeo, readout y DiT de acciones |
| Parámetros totales | 5B en el backbone de vídeo (Wan2.2-TI2V-5B); total del sistema no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (formato del codificador); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible (las instrucciones de LIBERO están en inglés, pero el modelo no declara cobertura multilingüe) |
| Licencia | MIT |
| Formato de pesos | Safetensors (BF16 para el codificador; módulos de acción en Safetensors) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura DreamFree descrita en el preprint arXiv:2611.04527. Se compone de tres bloques: un codificador visual basado en el DiT de vídeo Wan2.2-TI2V-5B, un módulo readout que proyecta las representaciones visuales y un DiT de acciones que genera los chunks de acción. La innovación central es la destilación de representaciones futuras: en lugar de generar fotogramas futuros durante la inferencia (como haría un world model convencional), el modelo aprende a predecir las representaciones latentes que produciría ese futuro y las usa directamente para condicionar la política de acciones. El checkpoint publicado integra los pesos fusionados del codificador de la etapa 1, de modo que no se necesitan adaptadores separados de las etapas 0 y 1.

El entrenamiento se realizó sobre los conjuntos LIBERO-Spatial, LIBERO-Object, LIBERO-Goal y LIBERO-10, con dos vistas de cámara, instrucción lingüística y estado del robot como entradas. El repositorio incluye metadatos de entrenamiento y linaje del checkpoint en el directorio `provenance/`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO; tampoco se detallan mecanismos adicionales como decodificación especulativa o atención lineal. El VAE, el codificador de texto y el tokenizador son dependencias upstream que no se incluyen en el repositorio.

## Capacidades

- Predicción de acciones sin imaginación explícita: genera acciones a partir de representaciones visuales destiladas, sin sintetizar vídeo futuro en tiempo de inferencia.
- Manipulación condicionada por lenguaje: combina observaciones de dos cámaras, una instrucción en lenguaje natural y propiocepción para producir acciones.
- Generación de chunks de acción: emite bloques de 32 pasos con acciones de 7 dimensiones, adecuados para control robótico de frecuencia media.
- Evaluación en LIBERO: la receta seleccionada cubre las cuatro suites del benchmark con su normalización de acciones y preprocesado de imagen correspondientes.
- Integración con backbones de vídeo: reutiliza las representaciones de Wan2.2-TI2V-5B, lo que permite aprovechar un codificador visual preentrenado a gran escala.
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso genérico, agentes conversacionales, visión general, audio ni modo "thinking".

## Casos de uso

- Investigación en world action models: el checkpoint sirve como referencia reproducible para comparar políticas imagination-free frente a políticas basadas en generación de vídeo, usando las cuatro suites de LIBERO como banco de pruebas.
- Manipulación robótica en entornos de laboratorio: el modelo predice chunks de 32 acciones de 7 dimensiones a partir de dos vistas y una instrucción, lo que encaja en tareas de pick-and-place, apilado y reorganización de objetos de LIBERO.
- Evaluación de destilación de representaciones: al incluir el codificador de etapa 1 fusionado y los módulos de etapa 2 por separado, permite aislar el efecto del readout y del DiT de acciones en experimentos ablativos.
- Prototipado de políticas condicionadas por lenguaje: útil para validar pipelines de instrucción-observación-acción antes de escalar a robots reales, dado que LIBERO es un entorno simulado.
- Baseline para comparativas de eficiencia: al eliminar la generación de vídeo en inferencia, es un punto de partida para medir latencia y throughput frente a world models generativos del mismo tamaño de backbone.
- Estudio de transferencia desde modelos de vídeo: permite analizar cuánto conocimiento de Wan2.2-TI2V-5B se conserva tras el ajuste fino en tareas de manipulación de horizonte corto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 12,1 GB en BF16; se requiere al menos esa cantidad de VRAM para cargar los pesos completos, más memoria adicional para activaciones del DiT de vídeo de 5B y del DiT de acciones. Una estimación conservadora sitúa el mínimo en torno a 24 GB en BF16, aunque no se dispone de cifras oficiales.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño de backbone, cabría esperar A100 40/80 GB o H100 para inferencia en BF16 sin cuantizar; no confirmado por el autor.
- Compatibilidad con GPU de consumo: no confirmada. Una RTX 4090 de 24 GB podría ser insuficiente en BF16 si las activaciones del DiT de vídeo superan el margen disponible; se requeriría cuantización, que no está documentada.
- Opciones de despliegue: el autor solo documenta la descarga vía `huggingface_hub` y el uso de PyTorch. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para este tipo de modelo robótico.
- Latencia y throughput: no disponibles. La propuesta del método es precisamente reducir la latencia frente a world models generativos al evitar la síntesis de vídeo, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DreamFree-LIBERO | 5B (backbone de vídeo) | no disponible | Política robótica LIBERO | MIT | Checkpoint público en HF |
| Wan2.2-TI2V-5B | 5B | no disponible | Generación de vídeo texto-imagen | no disponible en esta ficha | Modelo base upstream en HF |
| Políticas LIBERO estándar (p. ej. diffusion policy) | no disponible | no disponible | Manipulación LIBERO | variable | Múltiples implementaciones |

No se dispone de datos de rendimiento comparativo entre DreamFree-LIBERO y alternativas, por lo que la comparativa se limita a parámetros, licencia y disponibilidad. No se identifican en la información proporcionada otros checkpoints DreamFree comparables.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre LIBERO, un benchmark simulado; no hay evidencia de transferencia a robots reales ni a entornos fuera de esas cuatro suites.
- No se documentan sesgos conocidos, pero al depender de un backbone de vídeo preentrenado y de instrucciones en inglés, puede heredar sesgos de esos datos.
- Riesgo de alucinación: no aplica en el sentido conversacional, pero sí existe riesgo de predicciones de acción incorrectas o incoherentes fuera de la distribución de LIBERO.
- Limitaciones de idioma: las instrucciones de LIBERO están en inglés y el modelo no declara soporte multilingüe.
- Licencia MIT para el release de DreamFree, pero las dependencias upstream (VAE, codificador de texto, tokenizador y el propio Wan2.2-TI2V-5B) conservan sus licencias respectivas, que deben verificarse antes de uso comercial.
- El repositorio no incluye el VAE, el codificador de texto ni el tokenizador; es necesario obtenerlos por separado, lo que añade complejidad al despliegue.
- No se publican cifras de latencia, throughput ni benchmarks, lo que dificulta evaluar su idoneidad en producción sin pruebas propias.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/harryjo97/DreamFree-LIBERO
- Paper (arXiv): https://arxiv.org/abs/2611.04527
- Repositorio GitHub: https://github.com/harryjo97/dreamfree
- Página del proyecto: https://harryjo97.github.io/dreamfree/
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
