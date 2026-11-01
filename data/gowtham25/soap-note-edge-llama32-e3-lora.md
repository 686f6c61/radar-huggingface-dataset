# Gowtham25/soap-note-edge-llama32-e3-lora

## Resumen

`Gowtham25/soap-note-edge-llama32-e3-lora` es un adaptador LoRA de ajuste supervisado (SFT) entrenado sobre `meta-llama/Llama-3.2-1B-Instruct` para la generacion de notas clinicas con estructura SOAP (Subjective, Observation, Assessment, Plan). Lo publica el usuario Gowtham25 en Hugging Face y su proposito declarado es producir notas SOAP "grounded", es decir, ancladas a los datos de entrada y sin campos inventados, en particular sin edades fabricadas.

El modelo resuelve un problema acotado: convertir informacion clinica de entrada en una nota estructurada en los cuatro apartados SOAP, manteniendo la fidelidad a la fuente. No es un modelo generalista ni un asistente clinico completo; es un adaptador de tarea sobre una base de 1.100 millones de parametros, lo que lo situa en la gama de modelos ligeros desplegables en hardware modesto.

Su relevancia es la de un experimento de especializacion vertical de bajo coste: demuestra el patron de tomar un modelo instruct pequeno y adaptarlo con LoRA a un dominio regulado. El repositorio es de 0,1 GB y no registra descargas ni likes en el momento de la consulta, por lo que debe considerarse un artefacto de investigacion temprana y no un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2 1B Instruct) con adaptador LoRA |
| Parametros totales | 1.100 millones en el modelo base; el adaptador LoRA anade un subconjunto no especificado |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del base Llama 3.2 1B Instruct) |
| Tipos de cuantizacion | No disponible; los pesos se publican en safetensors (adaptador) |
| Idiomas soportados | No disponible |
| Licencia | other (sujeta ademas a la licencia del modelo base Llama 3.2) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `meta-llama/Llama-3.2-1B-Instruct`, un transformer decoder-only de 1.100 millones de parametros con atencion causal estandar y tokenizador Llama 3. La adaptacion se realiza mediante LoRA en formato PEFT, de modo que los pesos base permanecen congelados y solo se entrenan las matrices de bajo rango inyectadas en las capas. El repositorio ocupa 0,1 GB, coherente con un adaptador y no con un modelo completo.

El entrenamiento es un SFT sobre datos clinicos con objetivos de campo "grounded". La model card indica explicitamente que los datos de entrenamiento emplean objetivos de campo anclados y sin edades inventadas, lo que sugiere un esfuerzo deliberado por penalizar la fabricacion de datos demograficos en la nota generada. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, el regimen de hiperparametros ni si hubo etapas posteriores de preferencia (RLHF/DPO). No se documenta ninguna innovacion arquitectonica adicional mas alla del ajuste LoRA.

## Capacidades

- Generacion de notas clinicas estructuradas en formato SOAP con los cuatro apartados (Subjective, Observation, Assessment, Plan).
- Condicionamiento a la informacion de entrada para evitar campos inventados, con enfasis declarado en no fabricar edades.
- Generacion de texto instruct general, heredada del modelo base Llama 3.2 1B Instruct.
- Soporte de conversacion multi-turno segun las capacidades del base.
- Tool calling y function calling: no documentado para este adaptador; depende del soporte del base y no se garantiza tras el SFT.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: no documentadas; el idioma del entrenamiento no se especifica.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Prototipado de resumenes clinicos estructurados: el adaptador transforma notas de consulta en un borrador SOAP que un profesional revisa, aprovechando el ajuste especifico al esquema frente a un prompt generico sobre el base.
- Investigacion sobre fidelidad en dominios regulados: sirve como banco de pruebas para medir si un SFT con objetivos anclados reduce la invencion de datos demograficos, comparando la salida del adaptador con la del modelo base sin ajustar.
- Generacion de conjuntos de datos sinteticos de notas SOAP para experimentos de NLP clinico, siempre con revision humana y sin uso sobre pacientes reales.
- Despliegue en entornos con recursos limitados: al ser un adaptador sobre un modelo de 1B, puede ejecutarse en una unica GPU de consumo y encaja en prototipos de bajo coste o en el borde.
- Evaluacion de pipelines PEFT: util como ejemplo reproducible de carga con `PeftModel.from_pretrained` para validar flujos de adaptadores LoRA en infraestructura propia.
- Docencia y formacion tecnica: ilustra el ciclo completo de especializacion de un modelo instruct pequeno a un esquema de dominio concreto con un coste de entrenamiento minimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1.100 millones de parametros ocupa aproximadamente 2,2 GB en fp16 y alrededor de 0,7-0,8 GB en cuantizacion de 4 bits; el adaptador LoRA anade una fraccion minima.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16, incluidas RTX 3060, RTX 4060, RTX 4090, A100 y H100; las GPUs de datacenter no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en practicamente toda la gama consumer reciente, e incluso en CPU con llama.cpp u Ollama tras fusionar el adaptador.
- Opciones de despliegue: carga nativa con `transformers` + `peft`, fusion del adaptador y exportacion a GGUF para llama.cpp u Ollama, y servidores tipo vLLM o TGI una vez fusionados los pesos.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| soap-note-edge-llama32-e3-lora | 1,1 B (base) + LoRA | No disponible | Notas SOAP clinicas | other (y licencia Llama 3.2) | Hugging Face, 0 descargas |
| meta-llama/Llama-3.2-1B-Instruct | 1,1 B | No disponible en esta ficha | Instruct general | Llama 3.2 Community License | Hugging Face, ampliamente usado |
| Adaptadores LoRA clinicos genericos | Variable | Variable | Variable | Variable | Depende del autor |

La comparacion directa con alternativas especializadas en notas SOAP no esta disponible en la informacion proporcionada. Frente al base sin ajustar, la diferencia esperable es la adherencia al esquema SOAP y la reduccion de campos inventados, aunque no hay metricas publicadas que lo cuantifiquen.

## Limitaciones y advertencias

- No es un dispositivo medico ni un asistente clinico validado: no debe usarse para decisiones sobre pacientes sin revision de un profesional cualificado.
- Riesgo de alucinacion persistente: pese al entrenamiento con objetivos anclados, un modelo de 1B puede omitir, mezclar o inferir datos no presentes en la entrada.
- Sesgos desconocidos: no se documenta la composicion del dataset de entrenamiento ni su cobertura demografica, linguistica o geografica.
- Idiomas no especificados: no hay garantia de calidad fuera del idioma o idiomas usados en el SFT.
- Longitud de contexto no documentada para este adaptador; el rendimiento puede degradarse en entradas largas.
- Licencia "other" sin texto visible en la informacion disponible, ademas sujeta a la Llama 3.2 Community License del modelo base, que impone restricciones de uso comercial y de redistribucion.
- El modelo base esta gated en Hugging Face, por lo que se requiere aceptar sus terminos para cargar el adaptador.
- Sin descargas ni validacion comunitaria: no hay evidencia externa de calidad ni de reproducibilidad del entrenamiento.
- No se documentan datos de tool calling, agentes ni cuantizaciones probadas.

## Enlaces

- Hugging Face: https://huggingface.co/Gowtham25/soap-note-edge-llama32-e3-lora
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
