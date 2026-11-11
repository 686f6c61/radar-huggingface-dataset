# ewin-reg/MiniCPM-V-4.7-1B-weekly-analyst-edit

## Resumen

MiniCPM-V-4.7-1B-weekly-analyst-edit es una variante del modelo multimodal openbmb/MiniCPM-V-4.7-1B (1.554 millones de parametros, pipeline image-text-to-text) publicada por el usuario ewin-reg. No se trata de un reentrenamiento ni de un fine-tuning convencional: es una edicion directa en el espacio de pesos (*weight-space programming*) que modifica unicamente 16.384 valores en las proyecciones `down_proj` de las capas MLP 15 y 19 del modelo base, dejando el resto de los tensores intactos.

El objetivo es muy concreto: mejorar el paso de planificacion de herramientas (*tool planning*) del agente Weekly Analyst, un sistema que monitoriza un CSV semanal y genera un PDF para stakeholders cuando detecta cambios materiales. Segun la model card, el modelo base pasaba 64 de 80 tareas de planificacion en un conjunto de validacion retenido, mientras que la version editada alcanza 80/80, sin ningun entrenamiento por gradiente y con un parche de solo 66 KB.

La relevancia de esta ficha es doble: por un lado, documenta una tecnica emergente de edicion de pesos (inspirada en SWEET y en el trabajo de Takeishi et al. sobre *weight-space programming*) aplicada a un modelo de 1B para despliegue on-device; por otro, es un ejemplo de especializacion extrema con resultados medibles y controles experimentales (edicion aleatoria de igual tamano que no mejora el rendimiento). Conviene subrayar que no es una mejora de proposito general y que el autor no la ha probado fuera de su agente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia MiniCPM-V 4.7; edicion en capas MLP `down_proj` (capas 15 y 19) |
| Parametros totales | 1.554.476.272 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16 (GGUF oficial parcheado); el repo incluye safetensors y GGUF; no se detallan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF; parche disperso en `patch.npz` y metadatos en `edit.json` |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de la familia MiniCPM-V 4.7, orientado a tareas image-text-to-text y a despliegue en dispositivo (*on-device*). La variante aqui descrita no introduce cambios arquitectonicos: mantiene la estructura del modelo original y solo altera dos tensores de proyeccion descendente de MLP (`model.language_model.layers.{15,19}.mlp.down_proj`), con 8 columnas por capa y 1.024 valores por columna, es decir, 16.384 valores en total.

El metodo de edicion no usa gradientes. Primero se calcula una direccion por capa como la media escalada por varianza sobre 48 pares de (activacion residual media de la salida fallida menos la de una salida correcta construida por codigo), usando semillas de calibracion 0 a 19. Despues se rankean las columnas MLP por su contribucion a esa direccion (producto escalar direccion-columna multiplicado por la activacion media) y se editan las 8 columnas con atribucion positiva por capa. La actualizacion aplicada es `w <- w - alpha * d * (d . w)` con alpha = 6, lo que invierte la componente en la direccion en lugar de eliminarla. La seleccion de capas (15 y 19), numero de columnas (8) y alpha (6) se hizo sobre semillas de desarrollo 20 a 39 entre unas 15 configuraciones, con la regla de elegir la configuracion con menos valores cambiados entre las que alcanzan la mejor puntuacion de desarrollo.

El autor cita como base metodologica SWEET (arXiv 2611.10974) y la edicion de direccion de bucle de Takeishi et al., "Sparks of Weight-Space Programming". El parche se almacena de forma dispersa en `patch.npz` (claves `L{layer}_cols`, `L{layer}_vals`) y se describe en `edit.json`. La model card menciona un segundo edit para borradores (MEMIT-style sobre `down_proj` en capas 16, 17, 18, 20, 21, 22) que no esta aplicado a los pesos de este repo.

## Capacidades

- Generacion de texto y razonamiento multimodal (image-text-to-text), heredadas del modelo base MiniCPM-V 4.7.
- Planificacion de herramientas (*tool planning*): genera planes en JSON valido que respetan un esquema, usando solo metricas, columnas y periodos existentes y con un paso por cada elemento solicitado.
- Soporte de agentes: disenado especificamente para el paso de planificacion del agente Weekly Analyst (multi-step sobre un CSV semanal).
- Despliegue on-device: tamano de 1B parametros y disponibilidad en GGUF f16 permiten ejecucion en hardware modesto.
- Capacidades conversacionales (tag `conversational` en Hugging Face).
- Edicion de pesos como capacidad de especializacion: el modelo puede ajustarse a una tarea concreta sin reentrenamiento, mediante parches dispersos.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio u otros modos: no disponibles en la informacion proporcionada, mas alla del pipeline image-text-to-text del modelo base.

## Casos de uso

- Planificacion de herramientas en agentes de analisis de datos: el modelo genera planes JSON validos contra un esquema para el agente Weekly Analyst, con 80/80 tareas de planificacion superadas en el conjunto retenido. Es adecuado porque la edicion se calibro exactamente sobre los prompts reales de planificacion de ese agente.
- Monitorizacion semanal de metricas y generacion de informes: el agente usa el modelo para decidir que metricas, columnas y periodos consultar antes de redactar un PDF para stakeholders cuando hay un cambio material.
- Despliegue on-device de agentes ligeros: con 1.554 millones de parametros y pesos GGUF f16, cabe en entornos con recursos limitados (el autor valido el GGUF en una Colab T4 con llama-cpp-python).
- Investigacion en edicion de pesos: sirve como caso reproducible de *weight-space programming* con parche disperso, controles aleatorios y metricas de validacion retenida.
- Prototipado de pipelines de agentes con salida estructurada: util para experimentar con generacion de JSON conforme a esquema en modelos pequenos, sin gramatica restrictiva.
- Educacion y divulgacion tecnica: ejemplo didactico de como una intervencion de 16.384 valores puede cambiar el comportamiento de un modelo de 1B en una tarea acotada.
- Integracion en flujos de CI/CD para agentes: el modelo puede empaquetarse como paso de planificacion en pipelines que verifican validez de JSON y esquema antes de ejecutar acciones.
- Analisis de insights con resumen narrativo: la model card reporta una comprobacion con 100 casos de InsightBench (ROUGE-L 0,1305 base frente a 0,1309 editado), util como referencia de que la edicion no degrada la generacion de resumenes.

## Benchmarks y rendimiento

Los datos disponibles corresponden a evaluaciones internas del autor sobre tareas sinteticas de planificacion y borradores, no a benchmarks publicos estandar.

| Modelo / configuracion | Planes correctos | Borradores correctos | Conjunto |
|---|---|---|---|
| Base | 64/80 | 0/80 | Semillas 100-139 (retenido) |
| Este edit | 80/80 | 0/80 | Semillas 100-139 (retenido) |
| Direccion aleatoria, mismo tamano | 64/80 | 0/80 | Semillas 100-139 (retenido) |
| Base | 62/80 | 0/80 | Semillas frescas 200-239 |
| Segundo edit + primer edit | 80/80 | 75/80 | Semillas frescas 200-239 |
| Objetivos de desplazamiento aleatorios, misma norma | 62/80 | 0/80 | Semillas frescas 200-239 |

Comprobacion narrativa en 100 casos de InsightBench (ROUGE-L frente a resumen de referencia): 0,1305 en el base y 0,1309 en el editado; el autor lo interpreta solo como ausencia de dano. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 1.554 millones de parametros, en f16 los pesos ocupan aproximadamente 3,1 GB, y en cuantizaciones de 8 bits o 4 bits el requisito seria considerablemente menor.
- GPU recomendadas: el autor valido el GGUF f16 en una Colab T4 con llama-cpp-python; no se detallan otras GPU.
- Cabe en GPU de consumo: si, segun la validacion en T4; no se especifican otras tarjetas.
- Opciones de despliegue: transformers (libreria declarada), llama.cpp / llama-cpp-python (validado por el autor), GGUF; vLLM, Ollama y TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (weekly-analyst-edit) | 1.554.476.272 | no disponible | Edicion de pesos para tool planning en un agente concreto | Apache 2.0 | Hugging Face (0 descargas, 0 likes) |
| openbmb/MiniCPM-V-4.7-1B (base) | 1.554.476.272 | no disponible | Modelo multimodal image-text-to-text de proposito general | Apache 2.0 (segun el repo derivado) | Hugging Face |
| Alternativas de ~1B multimodales | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks publicos comparables para establecer una comparativa cuantitativa con otros modelos de la misma categoria.

## Limitaciones y advertencias

- Especializacion extrema: la mejora esta medida solo en el paso de planificacion del agente Weekly Analyst; el autor indica explicitamente que no es una mejora de proposito general y que no se ha probado en otros contextos.
- Borradores sin gramatica: el edit de este repo no corrige la generacion de borradores (0/80 sin gramatica); el segundo edit que si lo hace no esta aplicado a estos pesos.
- Sobreajuste a la formulacion de instrucciones: en la comprobacion fuera de distribucion del segundo edit, reformular la instruccion llevo el rendimiento a 0/40, lo que evidencia sensibilidad al texto del prompt.
- Riesgo de alucinacion: no se han publicado evaluaciones de alucinacion; la unica comprobacion narrativa es ROUGE-L en InsightBench, una metrica debil segun el propio autor.
- Sesgos: no disponibles en la informacion proporcionada.
- Idiomas: no disponibles; no se documenta cobertura multilingue.
- Contexto: no se especifica la longitud de contexto soportada.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no garantiza el comportamiento fuera del agente objetivo; conviene validar en el caso de uso propio antes de produccion.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado en noviembre de 2026; no hay evidencia de uso en produccion por terceros.
- Reproducibilidad: los numeros de las semillas 100-139 son optimistas segun el autor porque alli se compararon variantes; los resultados en semillas frescas (200-239) son la referencia mas fiable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ewin-reg/MiniCPM-V-4.7-1B-weekly-analyst-edit
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B
- Repositorio del agente Weekly Analyst: https://github.com/GPA-N/weekly-analyst
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/ewin-reg/weekly-analyst
- Paper SWEET: arXiv 2611.10974 (referenciado en la model card)
- Trabajo de Takeishi et al., "Sparks of Weight-Space Programming" (referenciado en la model card; sin URL en la informacion disponible)
