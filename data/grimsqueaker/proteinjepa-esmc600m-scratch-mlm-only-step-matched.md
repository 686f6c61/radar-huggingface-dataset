# GrimSqueaker/ProteinJEPA-ESMC600M-scratch-MLM-only-step-matched

## Resumen

ProteinJEPA ESM-C 600M (MLM only, step-matched) es un modelo de lenguaje de proteinas desarrollado por GrimSqueaker como control experimental del articulo ProteinJEPA. Se trata de un modelo con arquitectura ESM-C 600M (port de Synthyra) entrenado desde pesos aleatorios sobre UniRef50, sin ningun componente de prediccion en espacio latente (JEPA). Su proposito es servir de referencia para aislar el efecto de la perdida JEPA frente a un entrenamiento puramente de masked language modelling (MLM) con identico presupuesto de datos y pasos.

El modelo tiene 575.036.992 parametros, 36 capas y un tamano oculto de 1152, y se distribuye en formato safetensors con code custom (requiere `trust_remote_code=True`). No es un modelo de proposito general ni un asistente conversacional: es una herramienta de investigacion para generar embeddings de proteinas y evaluar representaciones en tareas de estructura y homologia.

Su relevancia es acotada pero clara: permite reproducir la comparacion controlada del paper ProteinJEPA y verificar que la mejora reportada (por ejemplo, Recall@1 de 0,439 frente a 0,339 en recuperacion estructural SCOPe-40) se debe al objetivo JEPA y no a diferencias de entrenamiento. El propio autor indica que este control rinde por debajo del ESM-C 600M publicado en 17 de 19 tareas de la suite de probes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ESM-C 600M (port de Synthyra, `Synthyra/ESMplusplus_large`); transformer, 36 capas, hidden size 1152 |
| Parametros totales | 575.036.992 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens (ventana de recorte usada en entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de secuencias de proteinas, no de lenguaje natural) |
| Licencia | mixed-upstream (pesos propios; codigo de arquitectura heredado de `Synthyra/ESMplusplus_large`, con MIT y referencia a EvolutionaryScale Cambrian Non-Commercial License en `NOTICE.txt`) |
| Formato de pesos | safetensors, con codigo de arquitectura custom (`modeling_esm_plusplus.py`) |

## Arquitectura y entrenamiento

La arquitectura es la ESM-C 600M en su port de Synthyra: un transformer de 36 capas con hidden size 1152 y aproximadamente 575M de parametros. La inicializacion fue aleatoria con semilla 42. El codigo de modelado se incluye en el repositorio, por lo que la carga exige `trust_remote_code=True`.

El entrenamiento uso UniRef50 (68,3 millones de secuencias) durante una epoca, recortando cada secuencia a una ventana aleatoria de 1.024 tokens. Se realizaron 71.000 actualizaciones con unos 260.000 tokens por actualizacion. El objetivo fue exclusivamente MLM con tasa de enmascaramiento del 20% y esquema 80/10/10. Se uso AdamW con learning rate pico de 1e-3 y 2.000 pasos de warmup, con un schedule WSD y cooldown 1-sqrt durante el ultimo 20% de los pasos. No hay perdida JEPA ni ninguna otra innovacion de atencion o decodificacion: es un control deliberadamente simple y equiparable en pasos a su modelo gemelo `GrimSqueaker/ProteinJEPA-ESMC600M-scratch-MLM-JEPA`.

## Capacidades

- Generacion de embeddings contextuales de secuencias de proteinas (pipeline `fill-mask`).
- Relleno de residuos enmascarados en secuencias proteicas (MLM).
- Representaciones utiles para recuperacion estructural y deteccion de homologia remota, segun la suite de probes del autor.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues de lenguaje natural.
- No dispone de modo thinking, vision ni audio.
- Uso previsto como linea base de investigacion, no como modelo de produccion.

## Casos de uso

- Reproduccion del control experimental del paper ProteinJEPA: cargar este modelo junto al gemelo MLM+JEPA y repetir la suite de 19 probes con embeddings congelados para verificar las diferencias reportadas.
- Recuperacion estructural de proteinas: generar embeddings y calcular similitud para tareas tipo SCOPe-40; el autor reporta Recall@1 de 0,339 en este control, util como referencia inferior frente al modelo con JEPA.
- Deteccion de homologia remota: usar las representaciones para clasificar relaciones evolutivas lejanas; el control obtiene 0,581 frente a 0,658 del modelo MLM+JEPA.
- Ablacion de objetivos de entrenamiento: comparar MLM puro frente a MLM+JEPA manteniendo datos, pasos y schedule, aislando el efecto de la perdida latente.
- Estudio de infraentrenamiento: dado que rinde por debajo del ESM-C 600M publicado en 17 de 19 tareas, sirve para cuantificar la brecha entre un entrenamiento desde cero con 68,3M de secuencias y el modelo original.
- Analisis de representaciones congeladas: extraer embeddings para probes lineales en tareas de anotacion proteica sin reentrenar el backbone.

## Benchmarks y rendimiento

| Tarea | Este modelo (MLM only) | Gemelo MLM+JEPA |
|---|---|---|
| Suite de 19 probes (frozen embedding) | Pierde en 16, gana en 2, empata en 1 | Gana en 16, pierde en 2, empata en 1 |
| SCOPe-40, Recall@1 | 0,339 | 0,439 |
| Homologia remota | 0,581 | 0,658 |

El autor indica ademas que este control queda por debajo del ESM-C 600M publicado en 17 de 19 tareas. No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks de lenguaje natural en la informacion disponible, ya que no aplican a este dominio.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,3 GB de pesos, mas overhead de activaciones; en fp16/bf16 alrededor de 1,2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en precision reducida; A100 o H100 no son necesarias para uso individual.
- Cabe en GPU de consumo: si, en tarjetas tipo RTX 3060, RTX 4060 o superiores con 8 GB o mas.
- Opciones de despliegue: transformers con `trust_remote_code=True`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SCOPe-40 Recall@1 | Homologia remota | Licencia |
|---|---|---|---|---|---|
| ProteinJEPA ESM-C 600M MLM only (este) | 575M | 1.024 | 0,339 | 0,581 | mixed-upstream |
| ProteinJEPA ESM-C 600M MLM+JEPA | no disponible | 1.024 | 0,439 | 0,658 | mixed-upstream |
| ESM-C 600M publicado (Synthyra/ESMplusplus_large) | ~575M | no disponible | superior en 17 de 19 tareas | superior en 17 de 19 tareas | MIT / Cambrian Non-Commercial segun NOTICE |

## Limitaciones y advertencias

- Modelo de investigacion sin ajuste fino supervisado; no es adecuado como asistente ni para generacion de texto libre.
- Rinde por debajo del ESM-C 600M publicado en 17 de 19 tareas de la suite de probes.
- Contexto limitado a ventanas de 1.024 tokens, fijado por el recorte usado en entrenamiento.
- Entrenado una sola epoca sobre UniRef50; puede presentar sesgos derivados de la composicion de esa base de datos.
- Riesgo de alucinacion en el relleno de residuos enmascarados: las predicciones MLM no son validaciones estructurales.
- Licencia ambigua: los pesos son propios, pero el codigo de arquitectura arrastra MIT y la referencia a EvolutionaryScale Cambrian Non-Commercial License; verificar `Synthyra/ESMplusplus_large` y su carpeta `LICENSES/` antes de cualquier uso comercial.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio.
- Sin descargas ni likes en el momento de la consulta; sin validacion externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/GrimSqueaker/ProteinJEPA-ESMC600M-scratch-MLM-only-step-matched
- Modelo gemelo MLM+JEPA: https://huggingface.co/GrimSqueaker/ProteinJEPA-ESMC600M-scratch-MLM-JEPA
- Paper ProteinJEPA: https://arxiv.org/abs/2605.07554
- Repositorio de arquitectura de referencia: https://huggingface.co/Synthyra/ESMplusplus_large
