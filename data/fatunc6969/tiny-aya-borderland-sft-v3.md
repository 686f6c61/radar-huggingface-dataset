# FatUnc6969/tiny-aya-borderland-sft-v3

## Resumen

`FatUnc6969/tiny-aya-borderland-sft-v3` es un adaptador LoRA (PEFT) publicado en Hugging Face por el usuario FatUnc6969 sobre el modelo base `CohereLabs/tiny-aya-global`. Se trata de un ajuste fino supervisado (SFT) continuado a partir de una version anterior del mismo adaptador (`tiny-aya-borderland-sft-v2`), entrenado sobre un fichero denominado `sft-v3.jsonl` en el contexto de un proyecto llamado "Borderland" y con tecnicas de destilacion de AgentTune. El repositorio tiene un tamano de 0,3 GB, lo que es coherente con un adaptador de bajo rango y no con un modelo completo.

El modelo base, Tiny Aya Global, pertenece a la familia Aya de Cohere Labs, orientada a cobertura multilingue. Al ser un adaptador LoRA, este repositorio no contiene pesos completos: requiere cargar el modelo base y aplicar el adaptador encima. No se dispone de informacion sobre el numero de parametros del modelo base, la longitud de contexto, los idiomas soportados ni la licencia en la informacion proporcionada.

La relevancia de esta ficha es limitada en terminos practicos: se trata de un artefacto experimental vinculado a un hackathon (`lexsi-hackathon`), con cero descargas y cero likes en el momento de la consulta, sin model card detallada ni resultados de evaluacion publicados. Resulta util como referencia para quienes sigan el proyecto Borderland o quieran reproducir el pipeline de ajuste, pero no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer `CohereLabs/tiny-aya-global` |
| Parametros totales | no disponible (el repositorio contiene solo el adaptador, 0,3 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con la libreria PEFT sobre el modelo base `CohereLabs/tiny-aya-global`. La model card indica que el entrenamiento es un SFT continuado desde `FatUnc6969/tiny-aya-borderland-sft-v2` sobre el fichero `sft-v3.jsonl`, asociado al proyecto "Borderland". La etiqueta `agenttune` sugiere el uso de destilacion orientada a comportamiento de agente, aunque no se detalla la metodologia exacta ni la composicion del dataset.

No se especifican hiperparametros de entrenamiento (rango del LoRA, alpha, tasa de aprendizaje, numero de pasos, numero de tokens vistos), ni si hubo fases de RLHF o DPO. Tampoco se documenta ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, modos de razonamiento). La informacion disponible sobre arquitectura y entrenamiento es, por tanto, minima y se limita a la cadena de dependencias entre adaptadores y al nombre del conjunto de datos.

## Capacidades

- Ajuste fino supervisado sobre un modelo base multilingue de la familia Aya, heredando las capacidades del modelo base en la medida en que el adaptador no las altere.
- Orientacion a comportamiento de agente segun la etiqueta `agenttune`, presumiblemente mediante destilacion de trazas de agente, aunque no se documenta el formato ni el alcance.
- No se documenta soporte explicito de tool calling, function calling, vision, audio ni modos de razonamiento extendido.
- No se documentan capacidades multilingues concretas del adaptador; dependen del modelo base `tiny-aya-global`.
- No hay informacion sobre rendimiento en codigo, matematicas o tareas de razonamiento.

## Casos de uso

- Reproduccion de experimentos de ajuste: el adaptador sirve para replicar el pipeline de SFT continuado descrito en el repositorio `lexi-borderland`, cargando el modelo base y aplicando los pesos LoRA con PEFT.
- Investigacion sobre destilacion de agentes: util para estudiar como un adaptador de bajo rango modifica el comportamiento de un modelo pequeno multilingue en tareas de agente, comparando con `sft-v2`.
- Base para iteraciones posteriores: al ser un checkpoint intermedio de una cadena (`sft-v2` → `sft-v3`), puede emplearse como punto de partida para nuevos ajustes en el mismo dominio.
- Evaluacion de tecnicas LoRA en modelos pequenos: permite medir el impacto de un adaptador de 0,3 GB sobre el modelo base en tareas controladas.
- Prototipado interno en entornos de hackathon: adecuado para demos rapidas donde el coste de inferencia es bajo por el tamano reducido del modelo base.
- Analisis de linaje de modelos: util para auditar la procedencia de adaptadores derivados y las dependencias entre versiones dentro de un mismo proyecto.
- No se recomienda su uso en produccion ni en escenarios de atencion al cliente, generacion de codigo o agentes reales sin una evaluacion previa, dado que no hay benchmarks ni documentacion de comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador de forma aislada; depende del modelo base `CohereLabs/tiny-aya-global`. El repositorio ocupa 0,3 GB en disco.
- GPU recomendadas: no disponible. Al tratarse de un modelo base de la familia "tiny", es probable que quepa en GPU de consumo, pero no se confirma en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base con `transformers` + `peft`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `FatUnc6969/tiny-aya-borderland-sft-v3` | Adaptador LoRA sobre Tiny Aya Global | no disponible | no disponible | no disponible | Hugging Face (0 descargas) |
| `CohereLabs/tiny-aya-global` | Modelo base transformer | no disponible | no disponible | no disponible | Hugging Face |
| `FatUnc6969/tiny-aya-borderland-sft-v2` | Adaptador LoRA predecesor | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos suficientes para comparar rendimiento, contexto o licencia con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de model card detallada: no es posible evaluar la calidad del ajuste ni su comportamiento esperado.
- Licencia no especificada: no se puede garantizar el uso comercial; la licencia del adaptador podria estar sujeta ademas a la del modelo base `CohereLabs/tiny-aya-global`.
- Riesgo de alucinacion y de comportamiento impredecible: al no documentarse el dataset `sft-v3.jsonl` ni el proceso de destilacion, se desconoce que sesgos o patrones se han introducido.
- Dependencia estricta del modelo base: el adaptador no es autonomo y requiere cargar `CohereLabs/tiny-aya-global` con la version correcta de PEFT.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validacion externa.
- Proyecto vinculado a un hackathon (`lexsi-hackathon`): el soporte y mantenimiento futuros no estan garantizados.
- Idiomas soportados no documentados: no se puede confirmar la cobertura multilingue efectiva del adaptador final.
- No apto para produccion sin evaluacion previa en el dominio objetivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/FatUnc6969/tiny-aya-borderland-sft-v3
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Adaptador predecesor: https://huggingface.co/FatUnc6969/tiny-aya-borderland-sft-v2
- Repositorio del proyecto: https://github.com/VasuBansal7576/lexi-borderland
