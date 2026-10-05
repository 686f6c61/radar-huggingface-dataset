# hugorodr/grad-embodied-ai

## Resumen

El repositorio `hugorodr/grad-embodied-ai` no es un modelo entrenado, sino una nota de investigación exploratoria sobre IA corpórea (embodied AI) publicada por el usuario hugorodr. La propia model card lo declara explícitamente: no reclama mejoras de benchmark, ablaciones completadas, código liberado ni checkpoint entrenado. El único artefacto técnico es un fichero `safetensors` de 24.832 parámetros totales, cantidad incompatible con cualquier transformer funcional y coherente con un tensor auxiliar o de prueba.

Los tags incluyen `transformer` y `research-notes`, pero no existe descripción de arquitectura, tokenizador, datos de entrenamiento ni configuración de inferencia. El pipeline figura como no disponible y no hay idiomas declarados. La licencia es MIT y la región de publicación es US.

Es relevante únicamente como ejemplo de repositorio que mezcla un artefacto `safetensors` con documentación de investigación, lo que puede inducir a confusión si se cataloga automáticamente como modelo desplegable. Cualquier evaluación de capacidades reales carece de base: no hay pesos utilizables ni resultados publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag indica `transformer`, pero la model card no describe arquitectura alguna) |
| Parametros totales | 24.832 (dato real del fichero safetensors) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se describe ninguna arquitectura en la información disponible. El tag `transformer` podría sugerirla, pero la model card no menciona capas, dimensiones ocultas, mecanismos de atención, tokenizador ni ventana de contexto. El recuento de 24.832 parámetros hace inviable un transformer con capacidad generativa, por lo que el fichero safetensors debe interpretarse como un tensor auxiliar, de prueba o residual.

Tampoco hay datos de entrenamiento: no se indica número de tokens, composición del dataset, corpus, ni si hubo RLHF, DPO o ajuste por instrucciones. La model card se limita a describir la estructura de una nota exploratoria (`reading.md` como artefacto principal) con secciones sobre alcance, confusores, comparaciones propuestas y requisitos de reproducibilidad. No se ha publicado ningún proceso de entrenamiento.

## Capacidades

- El repositorio no proporciona un modelo con capacidades de inferencia.
- No hay generación de texto, razonamiento, código ni matemáticas documentadas.
- No hay soporte de tool calling ni function calling.
- No hay soporte de agentes ni razonamiento multi-paso.
- No hay capacidades multilingües declaradas.
- No hay modo de razonamiento (thinking), visión, audio ni ninguna modalidad.
- La única funcionalidad real es documental: servir como nota de planificación de investigación.

## Casos de uso

- Referencia metodológica para investigadores: el fichero `reading.md` describe cómo estructurar una comparación con baselines emparejados y qué confusores controlar antes de reportar resultados en IA corpórea.
- Plantilla de checklist de reproducibilidad: la nota enumera requisitos como versiones de dataset, comandos, semillas, hardware y logs crudos, reutilizables en otros proyectos experimentales.
- Documento de alcance y limitaciones: útil para redactar secciones de "scope and limitations" en papers o propuestas de investigación.
- Punto de partida bibliográfico: las referencias y datasets propuestos sirven como lista inicial de verificación para estudios de embodied AI.
- Ejemplo de mala praxis de catalogación: sirve para probar herramientas que detectan repositorios con tags de modelo (`transformer`, `safetensors`) pero sin modelo utilizable.
- Aviso sobre términos de datos externos: la propia model card recuerda revisar las licencias de los datasets externos por separado al usar el material.

Ninguno de estos casos implica ejecutar el repositorio como modelo; no existe capacidad de inferencia asociada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica de forma explícita que la nota no reclama mejoras de benchmark ni ablaciones completadas, y que las secciones etiquetadas como planes o hipótesis no deben interpretarse como resultados experimentales.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no es un modelo ejecutable de forma significativa.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles; no existen pesos con arquitectura que cargar.
- Latencia y throughput: no disponibles.
- Tamaño del repositorio: 0.0 GB (coherente con un tensor de decenas de miles de parámetros y dos ficheros Markdown).

## Comparativa con modelos similares

No disponible. No hay modelos comparables porque este repositorio no es un modelo entrenado. Confrontarlo con LLMs de referencia (por ejemplo, familias de 7B, 8B o 70B) no tendría sentido: carece de arquitectura documentada, contexto, tokenizador y resultados. La categoría correcta sería "nota de investigación", donde tampoco se dispone de una comparativa publicada.

## Limitaciones y advertencias

- No es un modelo entrenado: no hay checkpoint utilizable ni arquitectura declarada.
- El tag `transformer` puede inducir a error en catalogaciones automáticas y pipelines de descubrimiento de modelos.
- El fichero `safetensors` de 24.832 parámetros no es funcional para generación; intentar cargarlo como modelo fallará o producirá resultados sin sentido.
- No hay código de inferencia, tokenizador ni configuración de despliegue.
- No hay datos de evaluación, benchmarks ni validación empírica.
- Las referencias y datasets propuestos en la nota son material de partida para verificación, no evidencia de resultados.
- No hay sesgos evaluables por ausencia de entrenamiento y datos.
- No hay riesgo de alucinación evaluable, al no existir capacidad generativa.
- Licencia MIT sobre el repositorio; conviene revisar por separado los términos de los datasets externos que la nota pueda referenciar.
- No apto para producción en ningún escenario de inferencia.

## Enlaces

- HuggingFace: https://huggingface.co/hugorodr/grad-embodied-ai
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
