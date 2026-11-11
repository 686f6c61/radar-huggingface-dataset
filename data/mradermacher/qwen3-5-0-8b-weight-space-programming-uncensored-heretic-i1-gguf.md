# mradermacher/Qwen3.5-0.8B-weight-space-programming-UNCENSORED-heretic-i1-GGUF

## Resumen

Qwen3.5-0.8B-weight-space-programming-UNCENSORED-heretic-i1-GGUF es una cuantizacion en formato GGUF, realizada por mradermacher, del modelo base xtools-at/Qwen3.5-0.8B-weight-space-programming-UNCENSORED-heretic. Se trata de una variante derivada de la familia Qwen3.5 de 0,8 mil millones de parametros, sometida a un proceso de "abliteration" o "decensoring" (etiquetado como heretic/uncensored/abliterated) que elimina o atenua los mecanismos de rechazo y alineacion del modelo original. El autor del cuantizado no es el desarrollador del modelo base, sino un tercero especializado en generar versiones GGUF con distintos niveles de cuantizacion.

El modelo esta pensado para ejecucion local en hardware modesto, dado su reducido tamano (555.378 parametros reportados en la metadata de safetensors, aunque la nomenclatura del nombre sugiere una familia de 0,8B; el dato de parametros debe tratarse con cautela). Incluye cuantizaciones ponderadas con imatrix (Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S), lo que permite desplegarlo desde entornos con muy poca VRAM hasta configuraciones de mayor calidad.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: un modelo pequeno de la familia Qwen3.5, una modificacion orientada a eliminar restricciones de contenido y una distribucion en GGUF lista para llama.cpp/Ollama. Es util para quienes investigan tecnicas de abliteration, para experimentacion con modelos sin filtros en entornos controlados y para despliegues de muy bajos requisitos, pero conlleva advertencias importantes de licencia, sesgo y seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de la familia Qwen3.5; el autor no detalla la arquitectura en la model card) |
| Parametros totales | 555.378 (dato de metadata safetensors del repo; la nomenclatura del nombre indica familia 0,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_NL, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (ponderadas con imatrix) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (transformers, gguf) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion (RLHF/DPO) empleadas en el modelo base. La model card del cuantizado no incluye estos datos; unicamente referencia el modelo de origen xtools-at/Qwen3.5-0.8B-weight-space-programming-UNCENSORED-heretic y describe el proceso de cuantizacion.

El aspecto tecnico destacable es el proceso de cuantizacion: se han generado cuantizaciones ponderadas con imatrix (importance matrix) a partir de un fichero imatrix propio, lo que mejora la calidad de las cuantizaciones de baja precision respecto a las cuantizaciones estaticas. El repositorio incluye el fichero imatrix (0,1 GB) para que terceros puedan generar sus propias cuantizaciones. El modelo base incorpora las etiquetas "weight-space-programming", "heretic", "uncensored", "decensored", "abliterated" y "reproducible", lo que sugiere que se ha aplicado una modificacion en el espacio de pesos para eliminar comportamientos de rechazo, aunque no se documenta la metodologia concreta. La model card menciona que es un modelo de vision ("This is a vision model - mmproj files (if any) will be in the static repository"), si bien no se aportan detalles sobre el codificador visual ni sobre los datos multimodales.

## Capacidades

- Generacion de texto en ingles (unico idioma declarado).
- Capacidades de vision segun la model card del cuantizado (los ficheros mmproj, si existen, se alojan en el repositorio estatico), aunque no se detallan las tareas visuales soportadas.
- Comportamiento "uncensored"/"abliterated": el modelo ha sido modificado para reducir o eliminar los rechazos ante peticiones que el modelo original rechazaria.
- Razonamiento y generacion de codigo: no documentado especificamente en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la metadata.
- Capacidad especial: el proceso de "weight-space programming" y "heretic" aplicado al modelo base, orientado a modificar el comportamiento en el espacio de pesos de forma reproducible.

## Casos de uso

- Experimentacion con tecnicas de abliteration: investigadores pueden comparar el comportamiento del modelo modificado frente al original para estudiar como afecta la eliminacion de rechazos a la calidad, la coherencia y la seguridad de las respuestas, usando las distintas cuantizaciones para aislar el efecto de la precision.
- Despliegue local en hardware de bajos recursos: gracias a las cuantizaciones IQ1/IQ2/Q2, el modelo puede ejecutarse en equipos con muy poca memoria, lo que permite prototipar aplicaciones de generacion de texto en portatiles o mini-PC sin GPU dedicada.
- Generacion de texto sin filtros en entornos controlados: util para pruebas de robustez, red teaming interno y evaluacion de sistemas de moderacion, donde se necesita un modelo que no rechace peticiones para medir la eficacia de las capas de seguridad propias.
- Investigacion sobre cuantizacion: el repositorio incluye el fichero imatrix y multiples tipos de cuantizacion, lo que permite estudiar el impacto de cada esquema (Q2_K vs IQ2_M vs Q4_K_M, etc.) en la perplejidad y la calidad de las respuestas.
- Prototipado de asistentes conversacionales en ingles: para demos y pruebas de concepto de chatbots de bajo coste donde no se requiere alta calidad ni cumplimiento estricto de politicas de contenido.
- Evaluacion de modelos de vision de bajo tamano: si se dispone de los ficheros mmproj del repositorio estatico, puede emplearse para experimentar con tareas de imagen-texto en entornos con recursos limitados, aunque la documentacion al respecto es escasa.
- Base para fine-tuning ligero: al ser un modelo pequeno con licencia Apache 2.0, puede servir como punto de partida para ajustes especificos en ingles, siempre que se asuman las implicaciones eticas de partir de una variante sin filtros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de muy bajo tamano, las cuantizaciones Q2/IQ2 ocupan del orden de decimas de GB y las Q5/Q6 alrededor de 0,5-0,7 GB; los valores exactos no se detallan en la informacion disponible.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es mas que suficiente; tambien puede ejecutarse en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer e incluso en iGPU y CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el repositorio declara compatibilidad con endpoints (tag endpoints_compatible) y libreria transformers.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.5-0.8B weight-space-programming-UNCENSORED-heretic i1-GGUF) | 555.378 (metadata) / familia 0,8B | no disponible | apache-2.0 | GGUF | Variante uncensored/abliterated, cuantizaciones imatrix |
| xtools-at/Qwen3.5-0.8B-weight-space-programming-UNCENSORED-heretic (modelo base) | familia 0,8B | no disponible | apache-2.0 | safetensors (presumiblemente) | Version sin cuantizar del mismo modelo |
| mradermacher/Qwen3.5-0.8B-weight-space-programming-UNCENSORED-heretic-GGUF (cuantizaciones estaticas) | familia 0,8B | no disponible | apache-2.0 | GGUF | Mismo modelo con cuantizaciones estaticas en lugar de imatrix |
| Modelos Qwen3.5 de 0,8B originales (sin modificar) | familia 0,8B | no disponible | no disponible | no disponible | Version con alineacion estandar, no incluida en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored"/"abliterated": se ha modificado para reducir los rechazos, lo que implica un mayor riesgo de generar contenido danino, sesgado o inapropiado; no debe desplegarse en produccion orientada a usuarios finales sin capas de moderacion adicionales.
- Sesgos conocidos: no documentados en la informacion disponible, pero al derivar de un modelo entrenado principalmente en ingles, es probable que herede sesgos culturales y linguisticos del corpus original.
- Riesgo de alucinacion: no cuantificado; los modelos de muy bajo tamano suelen presentar mayor propension a inventar informacion, especialmente en cuantizaciones agresivas (IQ1/IQ2).
- Limitaciones de contexto e idioma: solo se declara soporte de ingles; la longitud de contexto no esta documentada.
- Restricciones de licencia: la licencia declarada es apache-2.0, lo que permitiria uso comercial, pero la modificacion "uncensored" puede entrar en conflicto con las politicas de uso de plataformas de despliegue y con normativa aplicable; conviene revisar la licencia del modelo base original de Qwen.
- Caveat de parametros: la metadata de safetensors indica 555.378 parametros, un valor incoherente con la nomenclatura "0.8B"; debe verificarse antes de asumir el tamano real del modelo.
- Documentacion escasa: la model card no detalla arquitectura, contexto, datos de entrenamiento ni metodologia de abliteration, lo que dificulta la reproducibilidad mas alla de la cuantizacion.
- El autor del cuantizado no es el desarrollador del modelo base; la responsabilidad sobre el comportamiento del modelo recae en la cadena de derivaciones.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Qwen3.5-0.8B-weight-space-programming-UNCENSORED-heretic-i1-GGUF
- Modelo base: https://huggingface.co/xtools-at/Qwen3.5-0.8B-weight-space-programming-UNCENSORED-heretic
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Qwen3.5-0.8B-weight-space-programming-UNCENSORED-heretic-GGUF
- Pagina de resumen del autor para este modelo: https://hf.tst.eu/model#Qwen3.5-0.8B-weight-space-programming-UNCENSORED-heretic-i1-GGUF
- FAQ y solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
