# ReDiverse/ReDiverse-Wan2.1

## Resumen

ReDiverse-Wan2.1 es un adaptador LoRA para generación de vídeo a partir de texto (text-to-video) construido sobre el modelo base lightx2v/Wan2.1-T2V-14B-StepDistill-CfgDistill-Lightx2v, una variante destilada de Wan2.1-T2V-14B. Lo desarrolla el usuario ReDiverse y se distribuye bajo licencia Apache 2.0, con acceso restringido que requiere aceptar condiciones en Hugging Face. El repositorio ocupa aproximadamente 0,4 GB, lo que es coherente con un adaptador LoRA y no con un modelo completo.

El propósito declarado del proyecto, según sus etiquetas, es la "diversidad" y la "destilación" aplicadas a la generación de vídeo: el adaptador busca ampliar la variedad de resultados generados por el modelo base sin necesidad de reentrenar los 14 000 millones de parámetros del modelo subyacente. Al apoyarse en una variante ya destilada (StepDistill y CfgDistill), el LoRA hereda un modelo base optimizado para reducir pasos de muestreo y evitar la necesidad de classifier-free guidance, lo que abarata la inferencia.

La relevancia del proyecto es acotada pero específica: ofrece una vía de bajo coste computacional para modular el comportamiento de un modelo de vídeo de 14B sin reentrenamiento completo. No obstante, la información pública disponible es muy escasa (cero descargas, cero likes, sin model card detallada en los datos proporcionados), por lo que muchas especificaciones deben considerarse no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer de difusión Wan2.1-T2V-14B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 14B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (repositorio de 0,4 GB, compatible con safetensors presumiblemente, sin confirmar) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que se aplica sobre lightx2v/Wan2.1-T2V-14B-StepDistill-CfgDistill-Lightx2v. El modelo base pertenece a la familia Wan2.1 de generación de vídeo, con arquitectura de transformer de difusión de 14 000 millones de parámetros. La variante lightx2v incorpora destilación de pasos (StepDistill) y destilación de CFG (CfgDistill), técnicas que reducen el número de pasos de muestreo necesarios y eliminan la dependencia de classifier-free guidance, acelerando la inferencia. El LoRA ReDiverse se entrena presumiblemente para inducir mayor diversidad en las muestras generadas, aunque no se dispone de detalles sobre el dataset de entrenamiento, el número de tokens o pasos, ni sobre la composición de los datos.

No se dispone de información sobre si se emplearon técnicas de RLHF, DPO u otras, ni sobre innovaciones técnicas adicionales más allá de la propia destilación del modelo base. La información proporcionada no permite confirmar el rango del LoRA, las capas objetivo ni los hiperparámetros de entrenamiento.

## Capacidades

- Generación de vídeo a partir de texto (pipeline text-to-video), heredada del modelo base Wan2.1-T2V-14B.
- Modulación de la diversidad de las muestras generadas, presumiblemente el objetivo del adaptador según sus etiquetas.
- Compatibilidad con el ecosistema de inferencia del modelo base lightx2v (destilación de pasos y CFG), lo que permite muestreo con menos pasos.
- No se ha documentado soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no aplica a un modelo de vídeo).
- Capacidades multilingües: no disponibles.
- No se documentan modos especiales como thinking mode, visión o audio más allá de la generación de vídeo.

## Casos de uso

- Generación de vídeo publicitario con variaciones creativas: el adaptador permite obtener múltiples versiones de un mismo prompt con mayor diversidad visual, útil para explorar conceptos antes de fijar una campaña.
- Prototipado rápido de storyboards: integrado en un pipeline de text-to-video sobre el modelo base destilado, permite generar borradores de escenas con pocos pasos de muestreo y bajo coste.
- Exploración de diversidad en investigación: sirve para estudiar cómo un LoRA afecta a la varianza de las muestras de un modelo de difusión de vídeo, comparando distribuciones de salida con y sin el adaptador.
- Generación de contenido para redes sociales: al heredar un modelo base optimizado para inferencia rápida, puede emplearse en flujos de producción de clips cortos con requisitos de latencia moderados.
- Aumento de datos sintéticos de vídeo: la mayor diversidad de muestras puede aprovecharse para generar datasets sintéticos variados destinados a entrenar otros modelos.
- Demostraciones y experimentos docentes: el tamaño reducido del adaptador (0,4 GB) facilita su distribución y su uso en entornos de aprendizaje sobre modelos de vídeo.
- Investigación sobre destilación y diversidad: permite comparar el comportamiento del modelo base destilado frente al mismo con el LoRA aplicado, en estudios sobre el equilibrio entre fidelidad y variedad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa aproximadamente 0,4 GB, pero la inferencia requiere cargar el modelo base Wan2.1-T2V-14B, cuyos requisitos de VRAM no se detallan en la información proporcionada.
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño del modelo base (14B), es previsible que requiera GPU de datacenter (A100, H100) o GPUs de consumo de gama alta con suficiente VRAM, aunque no se confirma.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponibles; se desconoce si el adaptador es compatible con vLLM, llama.cpp, Ollama o TGI (estos frameworks están orientados a LLM, no a difusión de vídeo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReDiverse-Wan2.1 | LoRA sobre base de 14B | no disponible | no disponible | apache-2.0 | gated en Hugging Face |
| lightx2v/Wan2.1-T2V-14B-StepDistill-CfgDistill-Lightx2v (modelo base) | 14B | no disponible | no disponible | no disponible en la información | Hugging Face |
| Wan2.1-T2V-14B (modelo original) | 14B | no disponible | no disponible | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento ni de benchmarks que permitan una comparación cuantitativa con alternativas. La comparativa se limita a la relación de dependencia con el modelo base.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar el modelo.
- Información pública muy escasa: sin model card detallada, sin benchmarks y sin documentación de entrenamiento, lo que dificulta evaluar su calidad y reproducibilidad.
- Sesgos: no documentados; al heredar el modelo base, puede reproducir sesgos presentes en los datos de entrenamiento de Wan2.1.
- Riesgo de alucinación visual y artefactos: propio de los modelos de difusión de vídeo; no se han publicado evaluaciones específicas.
- Limitaciones de idioma y contexto: no disponibles.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base y de los pesos destilados de lightx2v, que pueden imponer condiciones adicionales.
- Cero descargas y cero likes en el momento de la consulta: proyecto sin validación comunitaria, lo que aconseja precaución en producción.
- No apto para tareas de NLP, razonamiento o código: es exclusivamente un adaptador de generación de vídeo.

## Enlaces

- Hugging Face: https://huggingface.co/ReDiverse/ReDiverse-Wan2.1
- Modelo base: https://huggingface.co/lightx2v/Wan2.1-T2V-14B-StepDistill-CfgDistill-Lightx2v
- Paper referenciado en etiquetas: arxiv:2611.18550 (no verificable en la información proporcionada)
