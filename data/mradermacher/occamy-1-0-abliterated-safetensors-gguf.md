# mradermacher/occamy-1.0-abliterated-safetensors-GGUF

## Resumen

Occamy 1.0 Abliterated es un modelo de lenguaje conversacional derivado de la familia Occamy 1.0, distribuido en formato GGUF por el usuario mradermacher a partir de los pesos safetensors publicados por 977895k. El término "abliterated" indica que se ha aplicado una tecnica de ablacion de direcciones de rechazo en el espacio de activaciones, orientada a eliminar los mecanismos de negativa del modelo original y reducir las restricciones en las respuestas. El resultado es un modelo de proposito general sin los filtros de seguridad habituales, pensado para experimentacion e investigacion sobre alineamiento y comportamiento de modelos.

Con 34.660.610.688 parametros (aproximadamente 34,7 mil millones), se situa en la franja de modelos densos de gran tamano, comparable en orden de magnitud a la familia Qwen2.5-32B o Yi-34B. Esta publicacion concreta es una conversion a GGUF con cuantizaciones estaticas, lo que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, algo inviable con los pesos originales en bfloat16 o float16.

La relevancia de esta ficha es doble: por un lado, documenta un checkpoint derivado con implicaciones eticas y de licencia importantes (ausencia de filtros de seguridad); por otro, sirve como referencia practica de despliegue de un modelo de ~35B en cuantizaciones de 2 a 8 bits. La model card original no aporta informacion sobre arquitectura, datos de entrenamiento ni evaluaciones, por lo que muchos campos de esta ficha quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer denso, inferido por el formato y el tamano; no confirmado en la model card) |
| Parametros totales | 34.660.610.688 (~34,7B) |
| Parametros activos | no aplica (no hay indicios de ser MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo); safetensors en el repositorio de origen |
| Tamano del repo | 21,4 GB |
| Version de cuantizacion | quantize_version 2, output_tensor_quantised 1, convert_type hf |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo en la documentacion proporcionada. El recuento de parametros (34,7B) y el hecho de que exista una conversion `convert_type: hf` desde safetensors sugieren un transformer denso de tipo decoder-only, pero la model card no confirma ni el tipo de atencion, ni la funcion de activacion, ni la estrategia de normalizacion. Tampoco se documenta si emplea GQA, atencion lineal o alguna variante hibrida.

Respecto al entrenamiento, la informacion disponible es practicamente nula: no se indica el numero de tokens, la composicion del corpus, ni si hubo fases de RLHF, DPO o fine-tuning supervisado. La unica innovacion tecnica documentada de forma implicita es la ablacion ("abliterated"), una tecnica que identifica direcciones en el espacio de activaciones asociadas a comportamientos de rechazo y las proyecta fuera, modificando los pesos o las activaciones para suprimir las negativas del modelo. El proceso de cuantizacion se realizo con la herramienta de mradermacher (quantize_version 2) y cubre desde 2 bits (Q2_K) hasta 8 bits (Q8_0) y float16.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational` del repositorio.
- Razonamiento y respuesta a instrucciones de proposito general, condicionado por el modelo base no documentado.
- Supresion de rechazos: por la ablacion aplicada, el modelo tiende a responder a peticiones que el modelo original rechazaria, incluidas consultas sensibles.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que permite servir el modelo a traves de infraestructura de inferencia estandar.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Vision, audio o modo "thinking": no disponible.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como la ablacion de direcciones de rechazo afecta a la distribucion de respuestas, comparando con el checkpoint original para medir cambios en tasas de negativa y en calidad.
- Evaluacion de robustez de filtros: util para probar si sistemas de moderacion externos detectan contenido que el modelo genera tras la ablacion, en entornos controlados de red teaming.
- Despliegue local de un modelo de ~35B: con las cuantizaciones Q4_K_M o Q5_K_M cabe en GPUs de consumo de 24 GB (RTX 3090/4090) o en configuraciones con offloading a RAM, lo que facilita experimentos sin infraestructura de datacenter.
- Generacion de texto creativo sin restricciones editoriales: escritura de ficcion, guiones o dialogos donde el autor necesita un modelo que no introduzca negativas ni advertencias moralizantes.
- Prototipado de asistentes conversacionales: la etiqueta `conversational` y la compatibilidad con endpoints permiten integrarlo en un backend de chat para pruebas de UX antes de decidir un modelo definitivo.
- Benchmarking de cuantizacion: al ofrecer 12 variantes de cuantizacion del mismo checkpoint, sirve para medir la degradacion de perplejidad y calidad entre Q2_K y Q8_0 en un modelo de 34,7B.
- Fine-tuning sobre dominio especifico: los pesos en safetensors del repositorio de origen permiten continuar el entrenamiento con LoRA o QLoRA para tareas verticales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion y sin contar overhead de contexto):
  - Q2_K: ~12-13 GB
  - Q3_K_M: ~15-16 GB
  - Q4_K_M: ~20-21 GB
  - Q5_K_M: ~24-25 GB
  - Q6_K: ~28-29 GB
  - Q8_0: ~36-37 GB
  - f16: ~69 GB
- GPU recomendadas: A100 40/80 GB o H100 para f16 y Q8_0; RTX 4090 (24 GB) o RTX 3090 para Q4_K_M y Q5_K_S; RTX 4080/4070 Ti Super (16 GB) para Q3_K_M con contexto limitado.
- Cabe en GPU de consumo: si, con cuantizaciones Q4_K_M o inferiores en GPUs de 24 GB; Q2_K y Q3_K_M en GPUs de 12-16 GB con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con la API de OpenAI (endpoints_compatible) y, para los pesos safetensors, vLLM o TGI con hardware suficiente.
- Latencia y throughput: no disponibles (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Occamy 1.0 Abliterated (este) | 34,7B | no disponible | no disponible | GGUF, safetensors | Ablacion de rechazos, 12 cuantizaciones |
| Qwen2.5-32B-Instruct | 32,5B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Referencia densa de tamano similar con licencia permisiva |
| Yi-1.5-34B-Chat | 34,4B | 4.096-32.768 tokens | Apache 2.0 | safetensors, GGUF | Denso de 34B con variantes comunitarias |
| Gemma-2-27B-it | 27,2B | 8.192 tokens | Gemma Terms | safetensors, GGUF | Menor, pero con contexto y licencia documentados |

La comparativa es orientativa: no hay datos publicados de rendimiento para Occamy 1.0 Abliterated, por lo que no puede establecerse una jerarquia de calidad frente a estas alternativas.

## Limitaciones y advertencias

- Ausencia de filtros de seguridad: la ablacion elimina los mecanismos de rechazo, por lo que el modelo puede producir contenido danino, ilegal o sexualmente explicito sin advertencia. No es apto para aplicaciones orientadas al publico sin moderacion externa.
- Licencia no disponible: no puede confirmarse si se permite uso comercial; debe contactarse con el autor del checkpoint original (977895k) antes de cualquier despliegue productivo.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero inherente a modelos de este tamano sin evaluaciones publicadas.
- Idiomas no declarados: se desconoce el rendimiento fuera del ingles; no hay garantia de calidad en castellano u otras lenguas.
- Contexto desconocido: sin dato de longitud de contexto, no puede planificarse su uso en tareas de contexto largo.
- Procedencia incierta: el modelo base Occamy 1.0 no esta documentado en la informacion disponible (arquitectura, datos, autor original), lo que dificulta auditar sesgos o procedencia del corpus.
- Degradacion por cuantizacion: las variantes Q2_K y Q3_K_S de un modelo de 34,7B sufren perdida notable de calidad; para produccion se recomienda Q4_K_M o superior.
- Sin adopcion verificable: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni informes de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/occamy-1.0-abliterated-safetensors-GGUF
- Pesos safetensors de origen: https://huggingface.co/977895k/occamy-1.0-abliterated-safetensors
- Perfil del cuantizador: https://huggingface.co/mradermacher
