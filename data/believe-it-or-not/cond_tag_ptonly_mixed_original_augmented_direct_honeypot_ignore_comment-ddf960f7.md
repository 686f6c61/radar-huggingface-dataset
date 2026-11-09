# believe-it-or-not/cond_tag_ptonly_mixed_original_augmented_direct_honeypot_ignore_comment-ddf960f7

## Resumen

`believe-it-or-not/cond_tag_ptonly_mixed_original_augmented_direct_honeypot_ignore_comment-ddf960f7` es un adaptador PEFT (LoRA/QLoRA) publicado en Hugging Face por el usuario `believe-it-or-not`, construido sobre el modelo base `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador que deben cargarse junto al modelo base para funcionar. El repositorio ocupa 1,7 GB, un tamano coherente con un adaptador de rango bajo sobre un modelo de 70 000 millones de parametros.

La model card es la plantilla generica de Hugging Face sin rellenar: todos los campos de descripcion, autor, licencia, idiomas, datos de entrenamiento y evaluacion aparecen como `[More Information Needed]`. El nombre del repositorio (`cond_tag_ptonly_mixed_original_augmented_direct_honeypot_ignore_comment`) sugiere un experimento de investigacion sobre robustez frente a instrucciones inyectadas en etiquetas condicionales, datos aumentados y "honeypots", pero esta interpretacion no esta confirmada por ninguna documentacion del autor.

El modelo tiene cero descargas y cero likes en el momento de redactar esta ficha, y fue creado el 9 de noviembre de 2026. Por tanto, es un artefacto de investigacion sin validacion comunitaria, sin benchmarks publicados y sin garantias de calidad. Su relevancia practica es limitada; su interes es documental para quien estudie adaptadores de seguridad o experimentos de alineacion sobre Llama 3.3 70B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT sobre transformer decoder-only (Llama 3.3 70B Instruct) |
| Parametros totales | No disponible para el adaptador; el modelo base tiene 70 000 millones |
| Parametros activos | No aplica (el modelo base no es MoE) |
| Longitud de contexto | No disponible en el adaptador; el modelo base Llama 3.3 70B soporta 128 000 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion estandar) |
| Idiomas soportados | No disponible en la model card; el modelo base esta orientado a multilingue (8 idiomas oficiales segun Meta) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |
| Libreria | PEFT 0.15.1 |
| Modelo base | togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference |
| Tamano del repositorio | 1,7 GB |
| Tags | peft, safetensors, llama, region:us |

## Arquitectura y entrenamiento

El artefacto es un adaptador PEFT, no un modelo entrenado desde cero. La arquitectura subyacente es la de Llama 3.3 70B Instruct: un transformer decoder-only con atencion por grupos (GQA), RoPE y normalizacion RMSNorm, afinado por Meta con instrucciones y preferencias. El adaptador anade matrices de bajo rango sobre las proyecciones del modelo base, aunque la model card no especifica rango, modulos objetivo, alpha ni estrategia de cuantizacion del entrenamiento.

No hay informacion sobre el dataset de entrenamiento, el numero de tokens vistos, la composicion de los datos, ni si se aplicaron tecnicas de RLHF o DPO adicionales sobre el adaptador. El nombre del repositorio sugiere el uso de datos mixtos, originales y aumentados, con etiquetas condicionales y ejemplos tipo "honeypot" disenados para detectar o resistir instrucciones maliciosas, pero no existe documentacion que lo confirme. Tampoco se detallan hiperparametros, regimen de precision (fp16, bf16, fp8) ni infraestructura de computo empleada.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Llama 3.3 70B Instruct, siempre que el adaptador no las degrade.
- Instrucciones y conversacion multi-turno: el modelo base esta afinado para seguir instrucciones y mantener dialogos.
- Codigo y matematicas: el modelo base muestra buen rendimiento en tareas de programacion y razonamiento aritmetico, aunque no hay evaluacion especifica del adaptador.
- Tool calling y function calling: el modelo base soporta llamadas a herramientas; el adaptador no documenta si preserva o modifica esta capacidad.
- Capacidades multilingues: el modelo base cubre varios idiomas; el adaptador no especifica que idiomas ha visto durante el ajuste.
- Modo "thinking" o razonamiento extendido: no disponible en la informacion proporcionada.
- Vision y audio: no soportados (el modelo base es solo texto).
- Comportamiento frente a instrucciones inyectadas: posible interes del experimento segun el nombre del repositorio, sin evidencia publica.

## Casos de uso

- Investigacion en seguridad de adaptadores: cargar el adaptador sobre Llama 3.3 70B para estudiar como responde a instrucciones inyectadas en etiquetas condicionales y ejemplos tipo "honeypot", comparando con el modelo base sin adaptador.
- Evaluacion de robustez en pipelines de alineacion: usar el adaptador como variante experimental en pruebas de red teaming, midiendo tasas de obediencia a instrucciones maliciosas frente al modelo original.
- Reproducibilidad de experimentos academicos: servir como artefacto de referencia para replicar un ajuste PEFT concreto sobre un modelo de 70B, siempre que se disponga del modelo base y de la configuracion de entrenamiento (no publicada).
- Analisis de degradacion por fine-tuning: comparar respuestas del adaptador y del modelo base en tareas estandar (generacion, codigo, matematicas) para cuantificar la perdida de capacidades tras el ajuste.
- Estudio de artefactos en Hugging Face: analizar como se publican adaptadores sin model card, sin licencia y sin evaluacion, y que riesgos supone para la cadena de suministro de modelos.
- Docencia sobre PEFT: ilustrar el flujo de carga de un adaptador con la libreria `peft` y la necesidad de emparejarlo con el modelo base correcto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluacion alguna y no se han encontrado datos externos sobre este adaptador.

## Requisitos de hardware

- El adaptador por si solo no es inferible: requiere cargar el modelo base Llama 3.3 70B Instruct, que en bf16 ocupa aproximadamente 140 GB de VRAM.
- Para inferencia del modelo base en precision completa se recomiendan 2 GPU A100 80 GB o 2 H100 80 GB con tensor parallelism.
- En cuantizacion de 4 bits (GPTQ, AWQ o GGUF Q4) el modelo base puede caber en una sola A100 80 GB o en configuraciones de 2x RTX 4090 de 24 GB con offloading parcial.
- No cabe en una unica GPU de consumo (RTX 4090, 3090, 4080) sin cuantizacion agresiva y offloading a CPU/RAM, lo que reduce drasticamente el throughput.
- Opciones de despliegue: vLLM y TGI para servir el modelo base con el adaptador cargado; llama.cpp y Ollama solo si se fusiona el adaptador en los pesos y se convierte a GGUF.
- Latencia y throughput: no disponibles para este adaptador; dependen enteramente del hardware y del backend elegido para el modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este adaptador (sobre Llama 3.3 70B) | Adaptador PEFT; base de 70B | No disponible (base: 128k) | No disponible | 0 descargas, sin model card | Artefacto de investigacion sin evaluacion |
| Meta-Llama-3.3-70B-Instruct | 70B | 128k | Llama 3.3 Community License | Amplia, con benchmarks publicos | Modelo base de referencia |
| Adaptadores PEFT comunitarios sobre Llama 3.3 70B | Variable | 128k | Segun autor | Variable | Suelen incluir model card y ejemplos de uso |
| Mistral Large / Qwen 2.5 72B | 70-123B | 32k-128k | Licencias comerciales o Apache 2.0 (Qwen) | Amplia | Alternativas de mismo orden de magnitud |

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es una plantilla sin rellenar; no hay informacion sobre autor, licencia, datos ni evaluacion.
- Licencia no disponible: no se puede determinar si el uso comercial esta permitido; ademas, el modelo base Llama 3.3 tiene su propia licencia comunitaria que impone restricciones y obligaciones de atribucion.
- Riesgo de alucinacion: heredado del modelo base y potencialmente agravado por un ajuste no documentado.
- Sesgos: no evaluados; el modelo base presenta sesgos conocidos y el adaptador puede introducir otros nuevos.
- Idiomas: no se especifica que idiomas ha visto el adaptador; el rendimiento fuera del ingles puede degradarse.
- Calidad no verificada: cero descargas y cero likes; no hay evidencia de que el adaptador funcione correctamente ni de que no degrade el modelo base.
- Nombre sugestivo de experimento de seguridad: el termino "honeypot" en el identificador sugiere un posible uso como trampa o prueba de robustez; no debe desplegarse en produccion sin una evaluacion exhaustiva.
- Requisitos de hardware elevados: el modelo base de 70B exige infraestructura de gama alta, lo que limita su uso a entornos con GPU de 80 GB o configuraciones multi-GPU.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/believe-it-or-not/cond_tag_ptonly_mixed_original_augmented_direct_honeypot_ignore_comment-ddf960f7
- Modelo base: https://huggingface.co/togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference
- Libreria PEFT: https://huggingface.co/docs/peft
- Paper de referencia citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental: https://mlco2.github.io/impact
- Believe France (resultado de busqueda no relacionado con el modelo): https://www.believe.com/fr/france/
