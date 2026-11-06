# bcywinski/gen-science-15-steer-aft-qwen3-14b

## Resumen

`bcywinski/gen-science-15-steer-aft-qwen3-14b` es una coleccion de adaptadores PEFT (LoRA de rango 1 sobre `down_proj`) entrenados sobre el modelo base `Qwen/Qwen3-14B`. No se trata de un modelo generativo independiente, sino de un artefacto de investigacion reproducible: el experimento 15 del proyecto gen-science, centrado en el estudio de *steering* (direccionamiento) del flujo residual mediante desplazamientos fijos durante el entrenamiento de adaptadores AFT (Adaptive Fine-Tuning). El autor es `bcywinski` y el repositorio se publica bajo licencia MIT.

El objetivo cientifico es evaluar si anadir un offset fijo al flujo residual en las capas previas a la capa del adaptador, aplicado unicamente a los tokens que contienen nombres de colores (en este caso, nombres de queso asociados a colores), modifica el comportamiento del adaptador entrenado. La evaluacion se realiza con el adaptador en modo "plano", es decir, sin aplicar el steering en tiempo de inferencia, lo que permite aislar el efecto del offset durante el entrenamiento.

El modelo base Qwen3-14B es un transformer denso de 14 mil millones de parametros con capacidad de razonamiento y soporte multilingue. El repositorio ocupa 0,1 GB, lo que refleja que solo contiene los pesos de los adaptadores y los ficheros de offsets, no los pesos completos del modelo base. Es relevante para investigadores en interpretabilidad y control de modelos que quieran reproducir o extender los experimentos de steering del proyecto gen-science.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-14B) con adaptadores LoRA de rango 1 sobre `down_proj` |
| Parametros totales | 14 mil millones (modelo base Qwen3-14B); adaptadores de rango 1 (tamano no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-14B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptadores PEFT) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-14B, un transformer denso de 14 mil millones de parametros. Sobre el se aplican adaptadores PEFT de rango 1 sobre la proyeccion `down_proj` de una unica capa (capa 13, indexada como L14 en los identificadores). El entrenamiento se realiza sobre las filas AFT sin color del dataset `bcywinski/gen-science-03-aft-rows-cheese`, con una tasa de aprendizaje de 1e-2 y tres semillas distintas (s0, s1, s2). Se generan dos variantes de adaptador por configuracion (aftA y aftB), lo que permite comparar estabilidad entre inicializaciones.

La innovacion tecnica consiste en anadir un offset fijo al flujo residual en las capas anteriores a la capa del adaptador, aplicado exclusivamente a los tokens que contienen nombres de queso. Los offsets se almacenan en ficheros safetensors bajo `offsets/` y se identifican por direccion y fuerza: `k<k>` corresponde a la sonda de color del par, mientras que `other_k<k>`, `random0_k<k>` y `shuffled0_k<k>` son controles. Las direcciones incluyen `p30` (positivo, fuerza 30) y `m30` (negativo, fuerza 30). La evaluacion se realiza con el adaptador plano, sin steering en test, para medir si el offset durante el entrenamiento induce un cambio persistente en el adaptador. No se dispone de informacion sobre el numero de tokens de entrenamiento ni sobre si se aplico RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3-14B, no modificadas por el adaptador.
- Codigo y matematicas: capacidades del modelo base, no evaluadas en este experimento.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidad especial: el adaptador esta disenado para estudiar el efecto del steering sobre el flujo residual en tokens de nombres de colores/queso; no es un adaptador de proposito general.

## Casos de uso

- Investigacion en interpretabilidad: reproducir el experimento 15 del proyecto gen-science para analizar como un offset fijo en el flujo residual afecta al entrenamiento de adaptadores de rango 1.
- Estudio de steering y control de activaciones: comparar las variantes `k30`, `other_k30`, `random0_k30` y `shuffled0_k30` para aislar el efecto de la direccion del offset frente a controles.
- Evaluacion de robustez de adaptadores: usar las tres semillas (s0, s1, s2) y las variantes aftA/aftB para medir la varianza del entrenamiento y la estabilidad del adaptador.
- Reproducibilidad de experimentos: los hashes SHA-256 de cada `adapter_model` permiten verificar la integridad de los pesos descargados en pipelines de investigacion.
- Analisis de sesgos en representaciones de color: el dataset de nombres de queso asociados a colores permite estudiar como el modelo codifica atributos cromaticos en capas intermedias.
- Base para extensiones: servir como punto de partida para experimentos con multiples capas (`p15ml_...`) o con otras direcciones de steering.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del modelo base Qwen3-14B y de la cuantizacion elegida.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible en la informacion proporcionada.
- Opciones de despliegue: el repositorio usa la libreria `peft`; los adaptadores se cargan sobre el modelo base Qwen3-14B. No se especifican opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| `bcywinski/gen-science-15-steer-aft-qwen3-14b` | 14B (base) + adaptador rango 1 | no disponible | MIT | safetensors (PEFT) | Hugging Face |
| `Qwen/Qwen3-14B` | 14B | no disponible | no disponible | safetensors | Hugging Face |
| Adaptadores AFT del mismo proyecto (experimentos previos) | 14B (base) + adaptador rango 1 | no disponible | MIT | safetensors (PEFT) | Hugging Face |

No se dispone de informacion sobre benchmarks comparativos ni sobre otros modelos de steering equivalentes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere cargar el modelo base `Qwen/Qwen3-14B` y aplicar el adaptador mediante PEFT.
- El adaptador esta entrenado para un experimento muy especifico (steering en tokens de nombres de queso/color) y no esta pensado para uso general en produccion.
- No se han publicado datos sobre sesgos, alucinacion o limitaciones de contexto o idioma en la informacion disponible.
- La licencia MIT permite uso comercial, pero el modelo base Qwen3-14B puede tener sus propias restricciones de licencia que deben verificarse por separado.
- Los offsets de steering se aplican solo durante el entrenamiento; la evaluacion se hace con el adaptador plano, por lo que el efecto del steering no esta presente en inferencia.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.
- No se especifican requisitos de hardware ni opciones de cuantizacion, lo que puede dificultar el despliegue en entornos con recursos limitados.

## Enlaces

- [Hugging Face: bcywinski/gen-science-15-steer-aft-qwen3-14b](https://huggingface.co/bcywinski/gen-science-15-steer-aft-qwen3-14b)
- [Modelo base: Qwen/Qwen3-14B](https://huggingface.co/Qwen/Qwen3-14B)
- [Dataset: bcywinski/gen-science-03-aft-rows-cheese](https://huggingface.co/datasets/bcywinski/gen-science-03-aft-rows-cheese)
