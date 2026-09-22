# Johnblick187/Qwen3-Omni-Coder

## Resumen

Qwen3-Omni-Coder es un modelo publicado por el usuario Johnblick187 en HuggingFace, resultado de una fusión (merge) de dos modelos derivados de la familia Qwen3: Huihui-Qwen3-Omni-30B-A3B-Instruct-abliterated y Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated. Ambos proceden del trabajo de huihui-ai, que publica versiones "abliterated" (con los mecanismos de rechazo eliminados) de modelos de Qwen. El pipeline declarado es any-to-any, lo que apunta a un modelo multimodal de entrada y salida múltiple, y los tags indican arquitectura MoE de tipo Qwen3MoE / qwen3_omni_moe.

El repositorio declara 35.259.818.545 parámetros totales (~35,26 B) según los pesos en safetensors, un tamaño de 182,7 GB y licencia Apache 2.0. La nomenclatura de los modelos base (A3B) sugiere una arquitectura de mezcla de expertos con aproximadamente 3 B de parámetros activos por token, aunque el autor no documenta este dato de forma explícita. Los tags incluyen safetensors y GGUF, además de marcadores de "Coder", "Abliterated" y "Uncensored".

La relevancia de esta ficha es limitada y conviene ser transparente al respecto: la propia model card incluye un aviso del autor indicando que el merge no ha sido probado y que no puede verificar que funcione "más allá de llegar al final del proceso de fusión". Con 16 descargas, 0 likes y sin benchmarks publicados, se trata de un artefacto experimental de interés principalmente para quien investigue técnicas de model merging, combinación de capacidades código/multimodal o evaluación de modelos sin alineamiento de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE de tipo Qwen3MoE / qwen3_omni_moe (transformer con mezcla de expertos), según los tags del repositorio |
| Parametros totales | 35.259.818.545 (~35,26 B), dato de los pesos en safetensors |
| Parametros activos | no disponible de forma explícita; la nomenclatura de los modelos base (A3B) sugiere ~3 B activos por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible el detalle; el repositorio incluye safetensors y, según los tags, también GGUF |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y GGUF (según tags); tamaño total del repositorio 182,7 GB |
| Pipeline | any-to-any |
| Modelos base | huihui-ai/Huihui-Qwen3-Omni-30B-A3B-Instruct-abliterated y huihui-ai/Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated |

## Arquitectura y entrenamiento

Se trata de un merge de pesos, no de un modelo entrenado desde cero. No hay información en la model card sobre el método de fusión empleado (por ejemplo, SLERP, TIES, DARE, linear o frankenmerge por capas), ni sobre la proporción de pesos asignada a cada modelo base. Tampoco se documenta ninguna fase adicional de entrenamiento, ajuste fino, RLHF o DPO posterior a la fusión: el modelo hereda, en principio, el alineamiento y las características de sus dos predecesores, con la particularidad de que ambos son versiones "abliterated" en las que se ha intervenido para suprimir las respuestas de rechazo.

Los modelos base pertenecen a la familia Qwen3 en su variante MoE de 30B-A3B y cubren dos perfiles distintos: uno orientado a capacidades ómnibus (texto, imagen y audio, pipeline any-to-any) y otro orientado a generación de código. La fusión pretende, por tanto, combinar competencia en código con capacidades multimodales. El dato de 35,26 B de parámetros totales es coherente con el tamaño del modelo ómnibus de la familia, no con el de la variante exclusivamente de código, lo que sugiere que la topología resultante proviene mayoritariamente del primero. No hay información sobre número de tokens de entrenamiento, composición del dataset ni innovaciones técnicas (decodificación especulativa, atención lineal, etc.) atribuibles a este artefacto concreto.

## Capacidades

Advertencia previa: el autor declara explícitamente que el merge no ha sido probado. Las capacidades que se enumeran a continuación son las que cabría esperar por herencia de los modelos base y por los tags declarados, no capacidades verificadas en este repositorio.

- Generación de texto y razonamiento general, heredadas de la familia Qwen3.
- Generación y completado de código, por herencia del modelo base orientado a código (tag "Coder").
- Procesamiento multimodal de entrada y salida (pipeline any-to-any), presumiblemente texto, imagen y audio, aunque no está verificado ni documentado en la model card.
- Respuestas sin mecanismos de rechazo (tags "Abliterated" y "Uncensored"), lo que implica ausencia de las salvaguardas habituales del modelo original.
- Soporte de tool calling / function calling: no disponible de forma explícita en la información proporcionada; es plausible por herencia de Qwen3, pero no está confirmado.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita.
- Capacidades multilingües: limitadas a inglés según el campo language del repositorio.
- Modo "thinking": no disponible de forma explícita en la información proporcionada.

## Casos de uso

Los siguientes escenarios son hipotéticos y presuponen que el merge funciona correctamente, algo que el propio autor no garantiza.

- Asistente de código autohospedado: el tag "Coder" y la procedencia del modelo base de código lo hacen candidato para autocompletado, generación de tests y revisión de pull requests en un entorno interno, con la ventaja de que los pesos son descargables y ejecutables en infraestructura propia bajo licencia Apache 2.0.
- Automatización de atención al cliente con entrada visual: al declarar pipeline any-to-any, podría recibir capturas de pantalla o diagramas junto al texto del usuario y responder en un único modelo, simplificando la arquitectura de un sistema de soporte técnico.
- Agentes de automatización con acceso a herramientas: si se confirma la herencia de tool calling de la familia Qwen3, encajaría en orquestadores de agentes que encadenan llamadas a APIs, consultas a bases de datos y ejecución de comandos.
- Procesamiento de documentación técnica: extracción de información de manuales con diagramas e ilustraciones, combinando comprensión de imagen y generación de texto en un solo paso de inferencia.
- Investigación sobre model merging: es un caso de uso realista dado el estado del artefacto; sirve como material para estudiar cómo se comportan las fusiones entre un modelo ómnibus y uno especializado en código, y para medir la degradación resultante.
- Red teaming y evaluación de seguridad: al derivar de modelos abliterated, resulta útil como sujeto de pruebas en estudios sobre eficacia de las intervenciones de alineamiento y sobre la facilidad de recuperar comportamientos no filtrados.
- Fine-tuning posterior y destilación: con 35,26 B de parámetros totales y ~3 B activos (según nomenclatura de los base), el coste de ajuste fino con LoRA o QLoRA es asumible en hardware de gama alta, lo que permite especializarlo en dominios concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente contiene un aviso del autor indicando que el merge no ha sido probado y que no puede verificar su funcionamiento más allá de la finalización del proceso de fusión. No hay datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluación, ni comparaciones con los modelos base.

## Requisitos de hardware

Estimaciones calculadas a partir de los 35,26 B de parámetros totales; no proceden de mediciones publicadas por el autor.

| Precisión | Peso aproximado de los pesos |
|---|---|
| bf16 / fp16 | ~70,5 GB |
| int8 / fp8 | ~35,3 GB |
| GGUF Q6_K | ~29 GB |
| GGUF Q5_K_M | ~24,5 GB |
| GGUF Q4_K_M | ~21 GB |

- VRAM para inferencia en bf16: se necesitan al menos 80 GB, lo que encaja en una A100 80 GB o una H100 80 GB, o en configuraciones multi-GPU con tensor parallelism.
- VRAM en int8/fp8: alrededor de 35-40 GB, viable en una RTX 6000 Ada (48 GB), L40S (48 GB) o A6000 (48 GB).
- Cabe en GPU de consumo: en bf16 no cabe en ninguna GPU de consumo actual. Con cuantización Q4_K_M (~21 GB) podría ajustarse en una RTX 4090 o RTX 5090 de 24 GB, aunque con margen muy estrecho para el contexto y con riesgo de offload parcial a RAM del sistema, dado que se trata de un MoE y de un modelo multimodal con codificadores adicionales. Dos RTX 4090 con tensor parallelism ofrecen una alternativa más holgada.
- Memoria unificada: un Mac Studio con M2 Ultra o M3 Ultra de 64 GB o más podría ejecutar cuantizaciones Q4/Q5 mediante llama.cpp, con throughput limitado por ancho de banda.
- Opciones de despliegue: vLLM o SGLang para servidores con GPUs de datacenter y soporte MoE; llama.cpp u Ollama para cuantizaciones GGUF en local; TGI como alternativa de servidor. La cobertura real de las capacidades multimodales (imagen, audio) varía mucho entre estos motores y no está confirmada para este merge.
- Latencia y throughput: no disponible. Al ser un MoE con ~3 B de parámetros activos (según nomenclatura de los modelos base), el throughput por token debería ser sustancialmente mayor que el de un modelo denso de 35 B, pero no hay cifras publicadas para este repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Longitud de contexto | Modalidades | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-Omni-Coder (este) | 35,26 B totales; activos no disponibles (~3 B según nomenclatura de los base) | no disponible | any-to-any | apache-2.0 | Merge sin probar, 16 descargas, 0 likes |
| Huihui-Qwen3-Omni-30B-A3B-Instruct-abliterated | no disponible (~35 B según nomenclatura) | no disponible | any-to-any | apache-2.0 (según metadata del repositorio base) | Uno de los dos modelos fusionados; abliterated |
| Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated | no disponible (~30 B según nomenclatura, ~3 B activos) | no disponible | texto | apache-2.0 (según metadata del repositorio base) | Segundo modelo fusionado; orientado a código y abliterated |
| Familia Qwen3-30B-A3B original (Instruct / Coder / Omni) | ~30-35 B totales, ~3 B activos | no disponible en la información proporcionada | texto o any-to-any según variante | apache-2.0 (según metadata de los repositorios) | Modelos con alineamiento de seguridad intacto; referencia para medir el efecto de la abliteration |

No se dispone de datos de rendimiento comparado para ninguno de estos modelos en la información proporcionada, por lo que la comparativa se limita a parámetros, modalidades y licencia.

## Limitaciones y advertencias

- El autor declara explícitamente que el merge no ha sido probado y que no puede verificar que funcione más allá de completarse el proceso de fusión. Es un riesgo de primer orden para cualquier uso en producción.
- No hay benchmarks, evaluaciones cualitativas ni ejemplos de uso publicados. El rendimiento real es desconocido.
- Los merges de pesos pueden producir degradaciones difíciles de predecir: salidas incoherentes, mezcla de idiomas, pérdida de capacidad de seguir instrucciones o colapso de las capacidades multimodales.
- El modelo deriva de versiones "abliterated" y está etiquetado como "Uncensored": carece de los mecanismos de rechazo de los modelos originales, lo que implica un riesgo elevado de generar contenido dañino, ilegal o sesgado sin filtro. No es adecuado para aplicaciones orientadas al usuario final sin capas de moderación externas.
- Los sesgos de los datos de entrenamiento originales de Qwen3 se heredan sin mitigación adicional; la abliteration no reduce estos sesgos, y puede amplificarlos al eliminar respuestas de cautela.
- Idioma: solo se declara inglés. No hay soporte documentado de castellano ni de otras lenguas, aunque los modelos Qwen3 subyacentes suelen tener cobertura multilingüe amplia; no está confirmado para este repositorio.
- Longitud de contexto no documentada. Es previsible que herede la ventana de la familia Qwen3 subyacente, pero el autor no la especifica y un merge puede alterar el comportamiento en contextos largos.
- Riesgo de alucinación: alto y no medido, especialmente en un artefacto sin evaluar y con el alineamiento intervenido.
- Licencia: Apache 2.0, lo que en principio permite uso comercial. Conviene verificar no obstante las condiciones de los repositorios base de huihui-ai y de los modelos originales de Qwen, así como el cumplimiento de las políticas de la plataforma de destino.
- Números de adopción muy bajos (16 descargas, 0 likes), sin issues ni discusiones que permitan inferir calidad o estabilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Johnblick187/Qwen3-Omni-Coder
- Modelo base 1: https://huggingface.co/huihui-ai/Huihui-Qwen3-Omni-30B-A3B-Instruct-abliterated
- Modelo base 2: https://huggingface.co/huihui-ai/Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo ni sobre sus modelos base: los enlaces obtenidos correspondían a contenido musical sin relación con el tema. No se dispone por tanto de papers, blogs, repositorios ni demos adicionales que enlazar.
