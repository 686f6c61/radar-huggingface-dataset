# maximianuu/gemma-4-31b-it-assistant-nvfp4

## Resumen

`maximianuu/gemma-4-31b-it-assistant-nvfp4` es una cuantizacion de 4 bits en formato `nvfp4` del modelo borrador (draft model) `google/gemma-4-31B-it-assistant`, el modelo auxiliar que propone tokens para Gemma 4 31B durante la decodificacion especulativa en el motor de inferencia Farabi. No se trata de un modelo de proposito general, sino de un componente de aceleracion que se empareja con el modelo principal de 31B para reducir la latencia de generacion.

El autor, `maximianuu`, ha aplicado una cuantizacion post-entrenamiento sin datos de calibracion ni ajuste fino: los pesos lineales se convierten a 4 bits con desplazamientos de potencia de dos y escalas de bloque calculadas por minimos cuadrados, mediante el script `tools/gemma_draft.py` del repositorio del motor. El resultado reduce el peso del borrador de aproximadamente 0,9 GB a unos 0,3 GB, manteniendo la licencia Apache 2.0 del modelo original.

La relevancia de esta ficha es acotada: el modelo solo aporta valor dentro del ecosistema Farabi y como acelerador de Gemma 4 31B. Al ser una conversion no oficial y con cero descargas en el momento de la consulta, debe tratarse como un artefacto experimental. La informacion disponible sobre arquitectura interna, contexto y capacidades del modelo base es limitada en la model card, por lo que varios campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo borrador para decodificacion especulativa; pesos en safetensors, libreria MLX) |
| Parametros totales | 469.518.596 (segun safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | nvfp4 4-bit (pesos lineales); repo de 0,3 GB frente a 0,9 GB del original |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria MLX) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base `google/gemma-4-31B-it-assistant`; solo se indica que es un modelo borrador pequeno que propone tokens para Gemma 4 31B durante la decodificacion especulativa. El numero de parametros reportado por safetensors (469.518.596) corresponde al artefacto cuantizado, no necesariamente al modelo original en precision completa.

El proceso de conversion es una cuantizacion post-entrenamiento: los pesos lineales se transforman a `nvfp4` de 4 bits con desplazamientos de potencia de dos y escalas de bloque obtenidas por minimos cuadrados, segun el script `tools/gemma_draft.py` del repositorio Farabi. El autor declara explicitamente que no se usaron datos de calibracion ni ajuste fino. No hay informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de alineacion (RLHF/DPO) del modelo base.

## Capacidades

- Generacion de tokens como modelo borrador en decodificacion especulativa: propone candidatos que el modelo principal Gemma 4 31B verifica.
- Aceleracion de inferencia: segun el autor, un modelo borrador solo afecta a la velocidad, ya que el modelo principal valida cada token propuesto.
- Integracion con el motor Farabi mediante la libreria MLX.
- No se documentan capacidades de tool calling, agentes, vision, audio, modo thinking ni multilingues en la informacion disponible.
- No es un modelo para uso directo como asistente conversacional; su funcion es auxiliar al modelo de 31B.

## Casos de uso

- Aceleracion de Gemma 4 31B en Farabi: el borrador propone tokens que el modelo principal verifica, reduciendo la latencia por token generado en comparacion con decodificacion autoregresiva pura.
- Despliegue en entornos con memoria limitada: al ocupar unos 0,3 GB en `nvfp4` frente a 0,9 GB del original, libera memoria para el modelo principal o para el cache KV.
- Servicios de generacion de texto de baja latencia sobre MLX: adecuado en hardware Apple Silicon donde MLX es la via de ejecucion nativa, siempre que se use junto a Gemma 4 31B y el motor Farabi.
- Experimentacion en investigacion sobre decodificacion especulativa: permite comparar el impacto en throughput y tasa de aceptacion de un borrador cuantizado frente al original.
- Prototipado de pipelines de inferencia en local: el tamano reducido facilita incluir el borrador en entornos de desarrollo sin infraestructura dedicada.
- Evaluacion de tecnicas de cuantizacion `nvfp4` sin calibracion: sirve como caso de estudio de cuantizacion post-entrenamiento con escalas por minimos cuadrados en un modelo auxiliar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de tasa de aceptacion, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB para el borrador en `nvfp4`; el modelo principal Gemma 4 31B requiere memoria adicional no especificada en la informacion disponible.
- GPU recomendadas: no disponible; la libreria MLX sugiere ejecucion en hardware Apple Silicon.
- Cabe en GPU de consumo: el borrador por si solo si (0,3 GB), pero el sistema completo depende de Gemma 4 31B.
- Opciones de despliegue: motor Farabi con libreria MLX; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `maximianuu/gemma-4-31b-it-assistant-nvfp4` | 469.518.596 (safetensors) | no disponible | nvfp4 4-bit | Apache 2.0 | Hugging Face, MLX |
| `google/gemma-4-31B-it-assistant` (original) | no disponible | no disponible | sin cuantizar (~0,9 GB) | Apache 2.0 | Hugging Face |
| Otros borradores para decodificacion especulativa | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Conversion no oficial: el autor la declara como no oficial y no avalada por Google.
- Cuantizacion sin calibracion: puede degradar la tasa de aceptacion de tokens propuestos, lo que reduciria la ganancia de velocidad.
- Dependencia del ecosistema Farabi y de MLX: no es portable a otros motores de inferencia sin conversion adicional.
- No es un modelo autonomo: no debe usarse sin el modelo principal Gemma 4 31B que verifica las propuestas.
- Sin datos de benchmarks, idiomas, sesgos ni alucinacion del modelo base en la informacion disponible.
- Cero descargas y cero likes en el momento de la consulta: artefacto experimental sin validacion comunitaria.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del artefacto cuantizado.

## Enlaces

- Hugging Face: https://huggingface.co/maximianuu/gemma-4-31b-it-assistant-nvfp4
- Modelo base: https://huggingface.co/google/gemma-4-31B-it-assistant
- Repositorio del motor Farabi: https://github.com/maximianuu/farabi
