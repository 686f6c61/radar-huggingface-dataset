# SelectiveDOPD/JustRL-Qwen3-1p7b-RKLSelective-Top10pct

## Resumen

JustRL-Qwen3-1p7b-RKLSelective-Top10pct es un checkpoint de ajuste por aprendizaje por refuerzo (RL) construido sobre Qwen3-1.7B, publicado por el usuario SelectiveDOPD dentro de los experimentos que el autor denomina BiDirect-OPD. El repositorio declara 2.031.739.904 parametros en los pesos safetensors (≈2,03 mil millones, cifra que en la familia Qwen3 incluye las matrices de embedding, mientras que la denominacion comercial "1.7B" se refiere a los parametros no de embedding). Se trata, por tanto, de un modelo de generacion de texto conversacional de rango pequeno, orientado a inferencia con requisitos de hardware modestos.

El interes de esta publicacion no esta en un lanzamiento de producto, sino en su valor como artefacto de investigacion: la nomenclatura del identificador (ReverseKL, Selective, Top10pct, ladder 90-100 KL) sugiere una variante concreta de entrenamiento RL con divergencia KL inversa y algun tipo de seleccion sobre un subconjunto de tokens, pero la model card no documenta ni el objetivo exacto, ni el dataset, ni el numero de tokens utilizados. El repositorio publica ademas 15 ramas de checkpoint intermedias (global_step_20 hasta global_step_300), lo que apunta a un estudio de ablacion o a un seguimiento de la curva de entrenamiento mas que a una release estable.

La relevancia actual es limitada pero concreta: sirve como material de partida para quien investiga recetas de RL sobre modelos pequenos, y como modelo de texto ligero para despliegue en local. No hay licencia declarada, no hay idiomas declarados y no se han publicado resultados de benchmarks, por lo que cualquier uso en produccion exige una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion causal, derivado de Qwen3-1.7B. La model card no detalla numero de capas, cabezas ni configuracion de atencion |
| Parametros totales | 2.031.739.904 (≈2,03 mil millones), segun los pesos safetensors |
| Parametros activos | No aplica: es un modelo denso, no MoE |
| Longitud de contexto | No disponible en la model card. No se especifica si se ha modificado respecto al modelo base |
| Tipos de cuantizacion | No disponible: el repositorio solo publica pesos safetensors. No se listan versiones GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (libreria transformers) |
| Pipeline declarado | text-generation (etiquetas adicionales: conversational, text-generation-inference, endpoints_compatible) |
| Checkpoint publicado en `main` | global_step_300 |
| Otros checkpoints disponibles | global_step_20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280 |
| Tamano del repositorio | 52,8 GB (incluye todas las ramas de checkpoint) |
| Fecha declarada de creacion | 10 de septiembre de 2026 (10-09-2026), segun los metadatos de HuggingFace |
| Descargas y likes | 0 descargas, 0 likes en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-1.7B: un transformer denso de decodificacion con atencion causal, entrenado originalmente por el equipo Qwen de Alibaba. La model card de este repositorio no aporta informacion adicional sobre la arquitectura ni indica que se haya modificado la topologia del modelo base; el pipeline declarado es text-generation y los pesos se sirven en safetensors para transformers.

En cuanto al entrenamiento, lo unico documentado es el nombre del experimento de origen (`justrl_qwen3_1p7b_reversekl_ladder_90_100_kl`) y el hecho de que el `main` corresponde al paso global 300, con checkpoints intermedios cada 20 pasos hasta el 300. Esto es consistente con un proceso de RL de 300 pasos con evaluacion periodica. Los terminos del identificador ("reversekl", "selective", "top10pct", "ladder 90 100 kl") sugieren el uso de una divergencia KL inversa como parte del objetivo y algun esquema de seleccion sobre el 10 % de los elementos o tokens, ademas de una progresion ("ladder") de coeficientes o pasos entre 90 y 100, pero el autor no aporta ninguna explicacion tecnica, ni el dataset, ni el numero de tokens de entrenamiento, ni si hubo fases previas de SFT, DPO o RLHF. Toda afirmacion mas alla de esto seria especulacion.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es text-generation y el tag "conversational" indica que el modelo esta pensado para dialogos multi-turno.
- Generacion de texto general: al derivar de Qwen3-1.7B, conserva las capacidades linguisticas del modelo base, aunque no hay evaluacion publicada que las cuantifique en este checkpoint.
- Razonamiento y matematicas: no verificado en este checkpoint. El tag "conversational" y la ausencia de datos de benchmarks impiden confirmar mejoras en tareas de razonamiento.
- Generacion de codigo: no verificado en este checkpoint.
- Tool calling / function calling: no documentado. El tag "endpoints_compatible" hace referencia a la compatibilidad de despliegue con endpoints de HuggingFace, no a capacidades de llamada a herramientas.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles; el autor no declara lista de idiomas.
- Modo de pensamiento explicito (thinking mode): no documentado para este checkpoint, aunque la familia Qwen3 lo contempla en algunos de sus modelos.
- Vision, audio u otras modalidades: no soportadas segun la informacion disponible (modelo exclusivamente de texto).

## Casos de uso

- Investigacion en recetas de RL: el repositorio ofrece 15 checkpoints intermedios de un mismo entrenamiento, lo que permite estudiar la evolucion de la politica paso a paso y comparar el efecto de la divergencia KL inversa sin tener que reproducir el entrenamiento desde cero.
- Ablaciones sobre objetivos de RL: dado que el identificador describe una variante concreta (ReverseKL, seleccion Top10pct, escalera 90-100), el modelo sirve como punto de comparacion frente a otras variantes de la misma familia que el autor pueda publicar.
- Asistentes conversacionales en local: con ~2,03 mil millones de parametros, el modelo puede ejecutarse en un portatil con GPU de gama media o incluso en CPU con cuantizacion, lo que lo hace apto para prototipos de chatbot que no pueden enviar datos a la nube.
- Generacion de datos sinteticos para destilacion: un modelo de este tamano puede usarse para producir grandes volumenes de texto de entrenamiento a bajo coste por token, siempre que se valide la calidad de las muestras generadas.
- Clasificacion y extraccion de informacion: tareas de etiquetado de texto, extraccion de entidades o resumen corto en pipelines por lotes, donde el coste de inferencia importa mas que el rendimiento maximo.
- Preprocesado y enrutado en sistemas multi-modelo: uso como modelo auxiliar que reformula consultas, decide la intencion del usuario o normaliza entradas antes de llamar a un modelo mayor.
- Experimentacion educativa y docencia: su tamano reducido permite ejecutar ejemplos de RLHF, evaluacion de politicas y analisis de checkpoints en un entorno de laboratorio con recursos limitados.
- Evaluacion de robustez y seguridad: al ser un checkpoint de RL sin documentar, resulta util como caso de estudio para medir deriva de comportamiento, repeticiones o degradacion tras pasos de optimizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y la busqueda web realizada no ha devuelto documentacion tecnica asociada a este repositorio.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del recuento de parametros (2,03 mil millones) y no proceden de mediciones publicadas por el autor.

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 4,1 GB solo para pesos, mas cache KV y activaciones; en la practica, entre 6 y 8 GB para secuencias de contexto moderadas.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 2,0-2,5 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 1,2-1,8 GB de pesos.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM (RTX 3060 Ti, RTX 4060, RTX 4070, RTX 4090) para FP16; A100, H100 o L40S quedan sobredimensionadas para este tamano y solo se justifican por agregacion de muchas instancias.
- Viabilidad en GPU de consumo: si, cabe holgadamente en tarjetas de 8 GB en FP16 y en tarjetas de 4-6 GB con cuantizacion.
- CPU: la inferencia en CPU es viable con cuantizacion de 4 bits, con latencias del orden de decenas de milisegundos por token segun el hardware.
- Opciones de despliegue: transformers de forma nativa (formato safetensors); vLLM y TGI para servido con batching; llama.cpp u Ollama solo si se genera previamente una conversion a GGUF, ya que el repositorio no incluye pesos en ese formato.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

Advertencia: los datos de los modelos comparativos proceden de conocimiento general sobre esas familias y no de la informacion proporcionada en esta busqueda; deben verificarse en sus respectivas fichas antes de usarse en decisiones de produccion.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| JustRL-Qwen3-1p7b-RKLSelective-Top10pct | 2,03 mil millones (safetensors) | No disponible | No disponible | HuggingFace, 15 ramas de checkpoint | Checkpoint de RL sin documentar ni benchmarks |
| Qwen3-1.7B (base) | ~1,7B no de embedding | No disponible en esta busqueda (la familia Qwen3 declara contexto largo) | No disponible en esta busqueda | HuggingFace | Modelo base oficial; referencia directa de comparacion |
| Qwen3-4B (base) | ~4B | No disponible en esta busqueda | No disponible en esta busqueda | HuggingFace | Alternativa de mayor capacidad dentro de la misma familia |
| Llama-3.2-1B | ~1,24B | No disponible en esta busqueda | No disponible en esta busqueda | HuggingFace | Alternativa de tamano similar de otro fabricante |

No se dispone de comparativas de rendimiento entre estos modelos en la informacion consultada, por lo que la tabla anterior solo contrasta parametros, licencia y disponibilidad declaradas.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido. Tratar el modelo como no apto para produccion comercial hasta que el autor especifique una licencia.
- Idiomas no declarados: no hay lista de idiomas soportados ni evaluacion multilingue para este checkpoint.
- Ausencia total de benchmarks: no hay ninguna metrica publicada que permita estimar la calidad del modelo frente a su base o frente a alternativas.
- Documentacion de entrenamiento inexistente: no se especifican dataset, numero de tokens, hiperparametros de RL, esquema de seleccion Top10pct ni el significado de la escalera 90-100. Es imposible reproducir el entrenamiento.
- Riesgo de degradacion por RL: los checkpoints de RL sobre modelos pequenos son propensos a colapso de diversidad, repeticiones, respuestas truncadas o exceso de verbosidad. El paso 300 puede no ser el mejor checkpoint; conviene evaluar las ramas intermedias.
- Riesgo de alucinacion: inherente a un modelo de ~2B de parametros, especialmente en tareas de conocimiento factual, matematicas y codigo.
- Limitaciones por tamano: la capacidad de razonamiento multi-paso, el seguimiento de instrucciones complejas y el uso fiable de tool calling no son esperables en esta escala sin un ajuste especifico documentado.
- Capacidades de agente y function calling no documentadas: no asumir soporte de llamadas a herramientas ni de planificacion multi-paso.
- Repositorio pesado: 52,8 GB en total por acumulacion de 15 ramas; descargar solo la revision necesaria para evitar consumo innecesario de disco y ancho de banda.
- Sin soporte de cuantizaciones publicadas: no hay GGUF, AWQ ni GPTQ oficiales, por lo que el despliegue ligero exige conversion propia y su correspondiente validacion.
- Metadatos llamativos: la fecha de creacion declarada (10-09-2026) y el contador de 0 descargas y 0 likes indican que se trata de un repositorio reciente y sin validacion por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/SelectiveDOPD/JustRL-Qwen3-1p7b-RKLSelective-Top10pct
- Ramas de checkpoint: global_step_20 a global_step_300 dentro del mismo repositorio (main = global_step_300)
- Paper, blog o repositorio del proyecto "BiDirect-OPD": no disponible
- Documentacion del modelo base Qwen3-1.7B: no disponible en la informacion proporcionada
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo; los resultados obtenidos correspondian a contenidos no relacionados (aplicacion PS Remote Play de PlayStation) y se descartan por no ser pertinentes.
