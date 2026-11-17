# jungwook2358/pyrualean-libero90-qwen35-4b-codeonly-lora-e3-20261118-v1

## Resumen

El modelo `jungwook2358/pyrualean-libero90-qwen35-4b-codeonly-lora-e3-20261118-v1` es un adaptador LoRA publicado por el usuario jungwook2358, derivado de un ajuste supervisado (SFT) sobre el modelo base Qwen/Qwen3.5-4B. Segun la model card, se trata de un artefacto de inferencia resultante de un entrenamiento nativo sobre el conjunto de datos LIBERO, con 90 rollouts y 421 ejemplos de entrenamiento, distribuidos en tres epocas con un paso final de 42.

El adaptador emplea una configuracion LoRA de rango 8 y alpha 16, etiquetada como "code-only", lo que sugiere que el ajuste se ha orientado a la generacion de codigo o a tareas de tipo agente robótico expresadas como codigo. El entrenamiento se realizo con el formateador en modo `enable_thinking=False`, mientras que la evaluacion formal nativa conserva la configuracion de pensamiento por defecto del modelo base.

La relevancia de esta publicacion es limitada y muy especifica: se trata de un artefacto de inferencia sin documentacion sobre licencia, idiomas o rendimiento, con cero descargas y cero likes en el momento de la consulta, y un tamano de repositorio de solo 0,1 GB, coherente con un adaptador LoRA y no con un modelo completo. No se dispone de informacion sobre benchmarks, capacidades verificadas ni condiciones de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer Qwen3.5-4B (arquitectura del base no detallada) |
| Parametros totales | 4B en el modelo base; parametros del adaptador no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del base Qwen3.5-4B, no especificada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 8 y alpha 16 aplicado sobre el modelo Qwen/Qwen3.5-4B, fijado en el commit `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`. El entrenamiento consistio en un SFT nativo con 90 rollouts y 421 ejemplos, tres epocas y un paso final de 42. La etiqueta "code-only" indica que las etiquetas de entrenamiento se limitaron a codigo, y el formateador se configuro con `enable_thinking=False` durante el ajuste.

No se detalla la composicion del dataset LIBERO mas alla del numero de rollouts y ejemplos, ni se especifica si hubo RLHF, DPO u otras fases de alineamiento posteriores. El autor indica que los checkpoints completos de optimizador, scheduler y RNG se conservan en el servidor de origen, y que la procedencia y los hashes SHA256 estan documentados en `training-completion-proof.json` e `inference-export-manifest.json`. No se describen innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de codigo: el adaptador esta etiquetado como "code-only", por lo que su ajuste se orienta a la produccion de codigo mas que a lenguaje natural general.
- Razonamiento y generacion de texto: heredados del modelo base Qwen3.5-4B, aunque no verificados en este adaptador.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el contexto LIBERO sugiere tareas de agente, pero no se documenta.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): el entrenamiento uso `enable_thinking=False`; no se documentan otras capacidades especiales.

## Casos de uso

- Generacion de codigo en dominios acotados: el adaptador puede emplearse para producir fragmentos de codigo en tareas similares a las del dataset LIBERO, aunque sin garantias de generalizacion fuera de ese dominio.
- Experimentacion en robotica simulada: dado el origen en rollouts LIBERO, puede servir para reproducir o comparar politicas expresadas como codigo en entornos simulados.
- Investigacion sobre ajuste LoRA: util como referencia para estudiar el efecto de un SFT code-only de bajo rango (r8, alpha16) sobre Qwen3.5-4B.
- Prototipado de agentes que emiten acciones en forma de codigo: el adaptador podria integrarse en bucles de agente que traduzcan instrucciones a llamadas de codigo, previa validacion.
- Evaluacion comparativa de adaptadores: sirve como punto de partida para medir diferencias frente al modelo base en tareas de codigo.
- Reproducibilidad de entrenamiento: los manifiestos y pruebas de finalizacion permiten auditar el proceso y replicar el ajuste en el servidor de origen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; el modelo base de 4B requiere aproximadamente 8-10 GB en FP16 y 4-6 GB en cuantizacion de 4 bits, aunque no se confirma para este artefacto.
- GPU recomendadas: no disponibles; por tamano del base, una RTX 4090 o A100 serian suficientes, pero no hay datos del autor.
- Compatibilidad con GPU de consumo: probable por el tamano del base (4B), sin confirmacion oficial.
- Opciones de despliegue: no disponibles; al ser un adaptador safetensors, requeriria cargarse junto al base Qwen3.5-4B mediante frameworks compatibles con LoRA (PEFT, vLLM con adaptadores, etc.), sin documentacion al respecto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| pyrualean-libero90-qwen35-4b-codeonly-lora-e3 | 4B (base) + LoRA | No disponible | No disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-4B (base) | 4B | No disponible en esta ficha | No disponible en esta ficha | Hugging Face |
| Otros adaptadores LoRA sobre Qwen3.5-4B | 4B (base) + LoRA | No disponible | Variable | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Qwen3.5-4B, podria heredar sesgos del base, sin evidencia en la informacion disponible.
- Riesgo de alucinacion: no evaluado; el ajuste code-only podria reducir la calidad en lenguaje natural general.
- Limitaciones de contexto o idioma: no se especifican idiomas ni longitud de contexto efectiva del adaptador.
- Restricciones de licencia: la licencia no esta disponible, por lo que no se puede confirmar el uso comercial.
- Caveats para produccion: cero descargas y cero likes, ausencia de benchmarks, documentacion minima y dependencia de un commit concreto del base; no se recomienda su uso en produccion sin validacion exhaustiva.

## Enlaces

- Hugging Face: https://huggingface.co/jungwook2358/pyrualean-libero90-qwen35-4b-codeonly-lora-e3-20261118-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B (commit `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`)
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.
