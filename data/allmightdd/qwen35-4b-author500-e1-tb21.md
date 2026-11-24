# Allmightdd/qwen35-4b-author500-e1-tb21

## Resumen

Allmightdd/qwen35-4b-author500-e1-tb21 es un checkpoint de ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.5-4B, publicado por el usuario Allmightdd bajo licencia Apache 2.0. Se trata de un export de inferencia en BF16 correspondiente a la epoca 1 (epoch 1) y al paso de optimizador 16 de una ejecucion de entrenamiento denominada "Author500 whole-trajectory global-token", cuya version final es el checkpoint E3, enlazado desde la propia model card.

El modelo conserva la arquitectura y el tokenizador del Qwen3.5-4B original, con 4.539.265.536 parametros totales segun los pesos en safetensors, y se distribuye junto con el procesador, el tokenizador y la plantilla de chat originales. La model card indica que el entrenamiento utilizo la opcion `save_only_model`, es decir, que el checkpoint publicado contiene unicamente los pesos del modelo y no el estado del optimizador.

La relevancia de esta publicacion es limitada y de caracter experimental: cuenta con 0 descargas y 0 likes en el momento de la consulta, no incluye datos de benchmarks ni una descripcion detallada del dataset de entrenamiento, y la informacion disponible se limita practicamente a los metadatos de Hugging Face y a la breve model card. Es un artefacto intermedio de una investigacion sobre entrenamiento con trayectorias completas y tokens globales, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de Qwen/Qwen3.5-4B; tag `qwen3_5`) |
| Parametros totales | 4.539.265.536 (4,54 mil millones) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (export BF16 de inferencia) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. El tag `qwen3_5` y el campo `base_model` indican que deriva de Qwen/Qwen3.5-4B, por lo que hereda la arquitectura, el tokenizador, el procesador y la plantilla de chat de dicho modelo base. El tamano real de los pesos publicados es de 4.539.265.536 parametros, coherente con la denominacion "4B" del modelo original.

El entrenamiento se describe en la model card como una ejecucion de ajuste fino sobre "Author500 whole-trajectory global-token", de la que este checkpoint es la epoca 1, paso de optimizador 16. El checkpoint final de esa misma ejecucion es el E3, enlazado desde la model card, y la configuracion del experimento esta publicada en el repositorio de datasets `Allmightdd/rsi-experiment-reports`, en la ruta `author500-e3`. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras. Tampoco se documentan innovaciones tecnicas adicionales mas alla del propio esquema de entrenamiento con trayectorias completas y tokens globales, cuyo funcionamiento no se describe.

## Capacidades

- Generacion de texto: hereda las capacidades del modelo base Qwen3.5-4B, aunque no se documentan evaluaciones especificas tras el ajuste.
- Razonamiento y codigo: no disponible de forma especifica para este checkpoint; depende del modelo base.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas en la model card.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Plantilla de chat: incluida en el repositorio junto con procesador y tokenizador.

## Casos de uso

- Reproduccion de experimentos de ajuste fino: el checkpoint permite inspeccionar el estado del modelo en la epoca 1 y el paso 16 de la ejecucion Author500, util para comparar la evolucion del entrenamiento frente al checkpoint final E3.
- Investigacion sobre entrenamiento con trayectorias completas: sirve como artefacto de referencia para estudiar el esquema "whole-trajectory global-token" descrito en la configuracion del experimento publicada en el repositorio de datasets.
- Punto de partida para nuevos ajustes finos: al estar bajo licencia Apache 2.0 y en formato safetensors BF16, puede cargarse con las librerias habituales de Hugging Face y reentrenarse o adaptarse con LoRA.
- Evaluacion comparativa de checkpoints intermedios: util para medir como varia el comportamiento del modelo entre la epoca 1 y la version E3 sobre un mismo conjunto de prompts.
- Despliegue experimental en entornos de desarrollo: con 4,54 mil millones de parametros, cabe en GPUs de consumo para pruebas de inferencia en BF16 o cuantizado, sin garantias de calidad para produccion.
- Analisis de la plantilla de chat y el tokenizador heredados: el repositorio incluye estos artefactos, lo que facilita verificar la compatibilidad con el modelo base Qwen3.5-4B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB solo para los pesos (coincide con el tamano del repositorio), mas memoria para el contexto y las activaciones; en la practica se recomienda al menos 12-16 GB de VRAM.
- VRAM estimada en cuantizacion de 8 bits: en torno a 4,5-5 GB para los pesos.
- VRAM estimada en cuantizacion de 4 bits: en torno a 2,3-3 GB para los pesos.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, el modelo es apto para GPUs de consumo con suficiente VRAM, aunque no hay datos oficiales de latencia ni throughput.
- Opciones de despliegue: al publicarse en safetensors con procesador y tokenizador, es compatible con el ecosistema de Transformers; no se confirma soporte especifico de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Allmightdd/qwen35-4b-author500-e1-tb21 | 4,54 mil millones | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Checkpoint intermedio de ajuste fino, sin benchmarks |
| Qwen/Qwen3.5-4B (modelo base) | no disponible en la informacion | no disponible | no disponible en la informacion | Hugging Face | Modelo original del que deriva; referencia directa |
| Allmightdd/qwen35-4b-author500-e3-tb21 | no disponible | no disponible | no disponible | Hugging Face | Checkpoint final de la misma ejecucion de entrenamiento |

No se dispone de datos suficientes para comparar con alternativas de otros autores de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay datos que permitan estimar la calidad del modelo tras el ajuste.
- Checkpoint intermedio: corresponde a la epoca 1, paso 16, por lo que su estado de entrenamiento es temprano; el autor remite al checkpoint E3 como version final.
- Documentacion minima: la model card no describe el dataset, los hiperparametros ni el objetivo del entrenamiento, lo que dificulta evaluar sesgos o comportamientos esperados.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se documentan mitigaciones especificas.
- Idiomas: no se declaran idiomas soportados; el comportamiento multilingue depende del modelo base y no esta verificado.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B puede tener condiciones adicionales que conviene revisar antes de un despliegue en produccion.
- Adopcion nula: 0 descargas y 0 likes indican que no ha sido validado por la comunidad.
- No apto para produccion sin evaluacion previa: al no existir datos de rendimiento ni de robustez, debe considerarse exclusivamente un artefacto de investigacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Allmightdd/qwen35-4b-author500-e1-tb21
- Checkpoint final E3: https://huggingface.co/Allmightdd/qwen35-4b-author500-e3-tb21
- Configuracion del experimento: https://huggingface.co/datasets/Allmightdd/rsi-experiment-reports/tree/main/author500-e3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
