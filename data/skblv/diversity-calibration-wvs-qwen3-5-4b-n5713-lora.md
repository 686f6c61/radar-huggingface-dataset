# skblv/diversity-calibration-wvs-qwen3.5-4b-n5713-lora

## Resumen

El modelo `skblv/diversity-calibration-wvs-qwen3.5-4b-n5713-lora` es un adaptador LoRA de tipo PEFT entrenado sobre el modelo base Qwen/Qwen3.5-4B. Lo desarrolla el usuario skblv (Skobelev et al.) en el marco de un trabajo de investigacion sobre calibracion de diversidad en modelos de lenguaje, publicado como arXiv:2609.16454 con el titulo "Fine-Tuning Fixes Mode Collapse and Over-Dispersion in LLMs". No es un modelo de proposito general, sino un artefacto experimental disenado para reproducir un comportamiento de diversidad de respuestas calibrada en encuestas de opinion.

El adaptador se ha ajustado durante tres epocas sobre 5.713 ejemplos de tipo encuestado-pregunta extraidos de la World Values Survey, ola 7. Cada prompt contiene una persona demografica, una pregunta de encuesta y opciones de respuesta etiquetadas con letras; el objetivo de entrenamiento es la letra de la opcion elegida por el encuestado. El resultado es un modelo que, dado un perfil demografico, emite una distribucion de respuestas cuya diversidad relativa se aproxima a la calibrada (R = 1), corrigiendo tanto el colapso de moda como la sobredispersion.

Su relevancia es fundamentalmente metodologica: sirve como referencia reproducible para estudiar como el fine-tuning afecta a la diversidad de salidas de un LLM en tareas de simulacion de poblaciones. El repositorio ocupa 0,1 GB y contiene unicamente los pesos del adaptador, no el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-4B |
| Parametros totales | no disponible (adaptador LoRA de rango 16; el base tiene 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-4B) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el base admite las cuantizaciones habituales) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA / alpha / dropout | 16 / 32 / 0,05 |
| Epocas de entrenamiento | 3 |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El adaptador aplica LoRA de rango 16 con alpha 32 y dropout 0,05 sobre el modelo Qwen/Qwen3.5-4B, un transformer decoder-only de 4.000 millones de parametros cuya arquitectura interna no se detalla en la informacion disponible. El entrenamiento utilizo 5.713 ejemplos de la World Values Survey, ola 7 (Haerpfer et al., 2022, v6.0.0), construidos a partir de una fraccion aleatoria fija de un tercio de los paises y de las preguntas medibles. Cada ejemplo combina una persona demografica, la pregunta de encuesta y opciones con letras; el target es la letra de respuesta del encuestado.

La innovacion tecnica central es el enmascaramiento de tokens de prompt en la funcion de perdida: solo se calcula la perdida sobre el token o tokens de la letra de respuesta y sobre EOS. Este diseno concentra el ajuste en la distribucion condicional de la respuesta dada la persona y la pregunta, que es precisamente lo que la curva de convergencia de diversidad relativa mide. El articulo asociado sostiene que el fine-tuning corrige simultaneamente el colapso de moda y la sobredispersion en LLM, y este adaptador es el punto de la curva marcado con un cuadrado rojo en la figura de convergencia del repositorio.

## Capacidades

- Generacion de texto condicionada a un perfil demografico y a una pregunta de encuesta, devolviendo la letra de la opcion seleccionada.
- Simulacion de respuestas de poblaciones sinteticas con diversidad calibrada respecto a la distribucion real de la WVS ola 7.
- Calibracion de diversidad: el adaptador esta entrenado para situar la diversidad relativa de sus salidas cerca de R = 1, frente a comportamientos de colapso de moda (R < 1) o sobredispersion (R > 1).
- Capacidades generales de Qwen3.5-4B potencialmente preservadas (razonamiento, codigo, multilingueismo), aunque no estan documentadas ni evaluadas en la informacion disponible.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio para este adaptador.

## Casos de uso

- Investigacion sobre diversidad en LLM: reproducir el experimento del articulo arXiv:2609.16454 cargando el adaptador sobre Qwen3.5-4B y midiendo la diversidad relativa de las respuestas por pregunta y grupo demografico.
- Simulacion de opinion publica: generar distribuciones de respuesta para perfiles demograficos concretos y compararlas con las frecuencias observadas en la WVS ola 7, usando la particion de paises reservada.
- Estudio de sesgos demograficos: analizar como varia la distribucion de respuestas generadas entre grupos de edad, genero, nivel educativo o pais, dado que el prompt incluye explicitamente la persona.
- Benchmark de calibracion de diversidad: emplear el adaptador como linea base ajustada frente a modelos sin fine-tuning o con otros hiperparametros de LoRA en experimentos de mode collapse.
- Docencia y divulgacion: ilustrar de forma tangible como un ajuste LoRA de bajo rango y coste reducido (repositorio de 0,1 GB) modifica el comportamiento distribucional de un modelo de 4B.
- Analisis de tecnicas de enmascaramiento de perdida: comparar el efecto del enmascaramiento de tokens de prompt frente a entrenamiento sobre la secuencia completa en tareas de clasificacion con etiqueta de un solo token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente referencia una curva de convergencia de diversidad relativa (assets/convergence.png) sin cifras numericas asociadas.

## Requisitos de hardware

- VRAM estimada: el adaptador en si ocupa 0,1 GB; requiere cargar el modelo base Qwen3.5-4B. En FP16/BF16 el base necesita aproximadamente 8 GB de VRAM; en cuantizacion de 8 bits, unos 4-5 GB; en 4 bits, unos 2,5-3 GB (estimaciones para un transformer de 4B, no confirmadas en la informacion disponible).
- GPU recomendadas: A100, H100 o L40S para inferencia en lote y evaluacion a gran escala; RTX 4090, RTX 3090 o RTX 4080 para trabajo individual en BF16.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en cuantizacion de 4 u 8 bits; en BF16 se recomienda 12 GB o mas.
- Opciones de despliegue: transformers con peft para cargar el adaptador; vLLM y TGI admiten adaptadores LoRA (verificar compatibilidad con la version concreta del base); llama.cpp y Ollama requieren fusionar el adaptador con el base y convertir a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diversity-calibration-wvs-qwen3.5-4b-n5713-lora | LoRA r=16 sobre base de 4B | no disponible | Adaptador PEFT experimental | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B | 4B | no disponible | Modelo base generalista | no disponible | Hugging Face |
| Adaptadores LoRA de calibracion de diversidad con otros N o hiperparametros | LoRA sobre base de 4B | no disponible | Adaptador PEFT experimental | no disponible | no disponible en la informacion proporcionada |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo de investigacion altamente especializado: no es un asistente general y su comportamiento fuera de la tarea de respuesta a preguntas de encuesta con opciones no esta evaluado.
- Entrenado sobre un tercio fijo de paises y preguntas medibles de la WVS ola 7; la generalizacion a otros paises, otras olas u otras encuestas no esta demostrada.
- Riesgo de alucinacion y de fuga de patrones del dataset: el modelo puede reproducir distribuciones aprendidas en lugar de razonar sobre la persona descrita.
- Sesgos inhererentes a los datos de la WVS y a la seleccion de la particion de entrenamiento; no se documentan analisis de sesgo especificos.
- Licencia no disponible: no puede asumirse uso comercial sin verificar los terminos del repositorio y los del modelo base Qwen3.5-4B.
- Idiomas soportados no documentados; el entrenamiento se realizo presumiblemente en el idioma de los prompts de la WVS, sin confirmacion explicita.
- Requiere cargar el modelo base por separado; el repositorio solo contiene el adaptador.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/skblv/diversity-calibration-wvs-qwen3.5-4b-n5713-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Articulo: https://arxiv.org/abs/2609.16454
- Dataset WVS ola 7: https://doi.org/10.14281/18241.24
