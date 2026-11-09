# qingxiangliu/tienkung_dex_real_pick_apple_brainco_13d_act

## Resumen

`tienkung_dex_real_pick_apple_brainco_13d_act` es un repositorio publicado en Hugging Face por el usuario `qingxiangliu` bajo licencia Apache 2.0. A pesar de estar alojado en Hugging Face con la etiqueta de modelo y pesos en formato safetensors, la model card generada automáticamente lo describe explícitamente como un **dataset** de robótica (`task_categories: robotics`), no como un modelo de lenguaje. El nombre sugiere un conjunto de datos de demostraciones reales de una tarea de recogida de una manzana con una mano diestra ("dex") sobre una plataforma robótica TienKung, con acción de 13 dimensiones (`13d_act`) y un componente aparentemente asociado a BrainCo.

El repositorio contiene 44 ficheros (24 JSON y 20 safetensors) con un total de 1,8 GB, y el tamaño del repo en Hugging Face es de 2,0 GB. No se trata, por tanto, de un modelo generativo con parámetros, contexto o capacidades lingüísticas: es un artefacto de datos para entrenamiento de políticas de manipulación robótica. La información pública es mínima y la propia model card indica que fue autogenerada por la herramienta `hf_manager` y que el autor no ha completado la documentación.

Su relevancia es limitada y muy específica: puede interesar a investigadores en aprendizaje por imitación (imitation learning) o en robótica de manipulación diestra que trabajen con la plataforma TienKung, pero no es utilizable como modelo de lenguaje, visión o agente conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto de datos de robótica, no un modelo neuronal documentado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta declarada; el contenido real son datos de sensores/acciones) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (20 ficheros) y JSON (24 ficheros) |

## Arquitectura y entrenamiento

No se dispone de información sobre arquitectura de red, ya que el repositorio parece contener datos de demostración (episodios de robótica) y no un modelo entrenado con una arquitectura declarada. Los ficheros safetensors podrían corresponder a tensores de observaciones, acciones o normalizaciones estadísticas, pero la model card no lo especifica.

Tampoco hay datos sobre volumen de tokens, composición del dataset, procesos de RLHF/DPO ni innovaciones técnicas. La model card es una plantilla autogenerada que pide explícitamente al autor completar la descripción de recogida de datos, sensores, tareas y licencias. Cualquier afirmación sobre entrenamiento sería especulativa.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no responde a prompts.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales más allá de la etiqueta `en`.
- Su función, por el nombre y las etiquetas, sería servir como conjunto de datos de demostraciones para entrenar o evaluar políticas de manipulación robótica (recogida de una manzana con mano diestra, acción de 13 dimensiones).
- No se documentan capacidades especiales (thinking mode, visión, audio) en la información disponible.

## Casos de uso

- Entrenamiento de políticas de imitación para la plataforma TienKung: usar los episodios como datos de demostración para aprendizaje supervisado de una política de recogida de objetos.
- Evaluación de algoritmos de manipulación diestra: comparar el rendimiento de distintos métodos (behavior cloning, diffusion policy, ACT) sobre la misma tarea de recogida de manzana.
- Reproducción de experimentos de robótica: si el autor publica código asociado, el dataset permitiría replicar resultados de la tarea `pick_apple` con acción de 13 dimensiones.
- Estudio de datos reales frente a simulados: al tratarse de datos "real", puede emplearse para analizar la brecha sim-to-real en manipulación.
- Fine-tuning de modelos de política con BrainCo: si los tensores safetensors corresponden a componentes de un modelo base, podrían reutilizarse para adaptación a esta tarea concreta.
- Docencia e investigación en robótica: como ejemplo de estructura de dataset de demostraciones (JSON + safetensors) para cursos de aprendizaje por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: aproximadamente 2,0 GB para el repositorio completo (1,8 GB de datos según la model card).
- VRAM para inferencia: no disponible, ya que no se documenta un modelo ejecutable.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU consumer? No aplica como modelo de inferencia; para procesar el dataset basta con CPU y disco.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos o datasets comparables de la misma categoría (manipulación diestra sobre TienKung con acción de 13 dimensiones).

## Limitaciones y advertencias

- La model card es autogenerada y está incompleta: no describe sensores, metodología de captura, estadísticas ni condiciones de la tarea.
- El repositorio está etiquetado como modelo (`safetensors`) pero la propia card lo declara como dataset de robótica; puede confundir a herramientas de descubrimiento automático.
- No hay información sobre sesgos, pero al ser datos de una tarea física concreta, la generalización a otros objetos, entornos o morfologías es muy limitada.
- Riesgo de sobreajuste si se usa como único conjunto de demostraciones para una política.
- Licencia Apache 2.0 permite uso comercial, pero al no estar documentada la procedencia de los datos ni posibles derechos de terceros (p. ej. BrainCo), conviene verificar antes de un uso en producción.
- Sin pipeline declarado ni demo; no hay garantía de que los safetensors sean cargables sin código adicional del autor.
- Fecha de creación declarada en 2026-11-09, posterior a la fecha habitual de consulta; verificar la vigencia del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/qingxiangliu/tienkung_dex_real_pick_apple_brainco_13d_act
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales.
