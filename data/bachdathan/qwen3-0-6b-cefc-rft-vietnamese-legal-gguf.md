# BachDaThan/qwen3-0.6b-cefc-rft-vietnamese-legal-GGUF

## Resumen

qwen3-0.6b-cefc-rft-vietnamese-legal-GGUF es una version cuantizada en formato GGUF de un modelo Qwen3 de 0,6 B parametros, ajustado para conversacion en vietnamita sobre dominio juridico. Lo publica el usuario BachDaThan, que parte de dos piezas: el modelo base Qwen/Qwen3-0.6B-Base y el adaptador LoRA phuongntc/qwen3-0.6b-cefc-rft-vietnamese-legal, que se fusiona en los pesos y despues se cuantiza. El resultado son cuatro ficheros GGUF listos para llama.cpp, Ollama o llama-cpp-python, con tamanos reales entre 0,30 GB y 0,37 GB.

El problema que resuelve es el de despliegue: un modelo denso de 596.049.920 parametros con ventana de contexto de 32.768 tokens, empaquetado en menos de 0,4 GB, permite inferencia en CPU, en GPUs de gama baja o incluso en dispositivos con poca memoria, algo relevante para prototipos y aplicaciones en vietnamita donde no siempre hay acceso a GPUs grandes. La arquitectura es la de Qwen3 (transformer decoder-only denso, 28 capas, hidden size 1024, atencion con 16 cabezas y 8 cabezas KV), con vocabulario de 151.936 entradas y precision original bfloat16.

Es relevante ahora porque combina tres tendencias: modelos pequenos especializados por dominio en lugar de modelos generalistas grandes, publicacion directa en GGUF para consumo local, y ajuste sobre idiomas distintos del ingles. Ahora bien, el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, no publica benchmarks y no documenta el dataset de entrenamiento, por lo que debe tratarse como un artefacto experimental sin validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3 (transformer decoder-only denso) |
| Parametros totales | 596.049.920 (≈0,6 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en la configuracion del modelo; los ejemplos del autor usan n_ctx = 8192 |
| Tipos de cuantizacion | Q4_K_M, Q4_K_S, Q3_K_M, Q3_K_S (GGUF) |
| Idiomas soportados | vietnamita (vi) e ingles (en) |
| Licencia | apache-2.0 declarada en el repo; el autor indica que la licencia se determina tras verificar las licencias de origen |
| Formato de pesos | GGUF (llama.cpp) |
| Numero de capas | 28 |
| Hidden size | 1024 |
| Cabezas de atencion / cabezas KV | 16 / 8 |
| Head dim | 128 |
| Tamano de vocabulario | 151.936 |
| Precision original | bfloat16 |
| Tamano del repositorio | 1,5 GB |
| Modelo base | Qwen/Qwen3-0.6B-Base |
| Adaptador fusionado | phuongntc/qwen3-0.6b-cefc-rft-vietnamese-legal (LoRA) |
| Plantilla de chat | ChatML con `<|im_start|>` / `<|im_end|>` |
| Descargas / likes | 0 / 0 |

Ficheros publicados y VRAM recomendada por el autor:

| Cuantizacion | Fichero | Tamano real | VRAM recomendada | Nota |
|---|---|---:|---:|---|
| Q4_K_M | qwen3-0.6b-cefc-rft-vietnamese-legal-Q4_K_M.gguf | 0,37 GB | ~2,4 GB | Equilibrio estandar, valido para la mayoria de GPUs de consumo |
| Q4_K_S | qwen3-0.6b-cefc-rft-vietnamese-legal-Q4_K_S.gguf | 0,36 GB | ~2,4 GB | Algo menor que Q4_K_M, calidad similar |
| Q3_K_M | qwen3-0.6b-cefc-rft-vietnamese-legal-Q3_K_M.gguf | 0,32 GB | ~2,3 GB | Compresion mayor, para equipos con poca RAM/VRAM |
| Q3_K_S | qwen3-0.6b-cefc-rft-vietnamese-legal-Q3_K_S.gguf | 0,30 GB | ~2,3 GB | Maxima compresion, prioriza tamano sobre calidad |

Los tamanos de fichero estan medidos con `stat().st_size` tras la cuantizacion, segun el autor; las cifras de VRAM son la recomendacion del autor e incluyen el coste de contexto en tiempo de ejecucion, no solo los pesos.

## Arquitectura y entrenamiento

La arquitectura subyacente es Qwen3, un transformer decoder-only denso. Los datos tecnicos publicados en la model card son: 28 capas, hidden size de 1024, 16 cabezas de atencion con 8 cabezas KV (atencion con consultas agrupadas), head dim de 128, vocabulario de 151.936 tokens y precision original en bfloat16. No se indica el tipo de codificacion posicional ni otros detalles internos, por lo que no se pueden confirmar mas alla de lo declarado.

Sobre el entrenamiento, la informacion disponible es limitada. Se sabe que el punto de partida es Qwen3-0.6B-Base, que encima se aplica el adaptador LoRA `phuongntc/qwen3-0.6b-cefc-rft-vietnamese-legal` y que este se fusiona con los pesos base antes de cuantizar. El nombre del adaptador sugiere un ajuste por refuerzo (RFT) sobre datos juridicos vietnamitas, pero la model card no documenta el numero de tokens de entrenamiento, la composicion del dataset, la receta de RLHF/DPO ni hiperparametros de la fusion LoRA. No se han publicado innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, modos de pensamiento) ni se ha confirmado si el modo thinking de Qwen3 se preserva tras el ajuste.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla ChatML (`<|im_start|>system|user|assistant<|im_end|>`).
- Instrucciones en vietnamita e ingles, segun los idiomas declarados en el repositorio.
- Ajuste orientado a dominio juridico vietnamita, derivado del nombre del adaptador LoRA fusionado; el alcance real del ajuste no esta documentado.
- Contexto declarado de 32.768 tokens, aunque los ejemplos de uso del autor fijan 8192 tokens, lo que sugiere un uso previsto muy por debajo del maximo.
- Inferencia local en CPU o GPU gracias al formato GGUF y a los cuatro niveles de cuantizacion publicados.
- Compatibilidad con el ecosistema llama.cpp (llama-cpp-python, Ollama, LM Studio y cualquier runtime que consuma GGUF).
- Etiqueta `endpoints_compatible` en HuggingFace, lo que indica que puede servirse a traves de endpoints compatibles.
- Tool calling / function calling: no confirmado en esta version ajustada; el modelo base Qwen3 lo soporta, pero no hay evidencia de que el ajuste lo preserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Vision, audio o multimodalidad: no disponibles.

## Casos de uso

- Asistencia en consultas juridicas en vietnamita: el modelo puede redactar respuestas orientativas sobre terminologia y estructura de documentos legales vietnamitas, aprovechando el ajuste LoRA sobre esa materia. Debe usarse como ayuda de redaccion o primera aproximacion, nunca como sustituto de asesoramiento profesional, tal y como advierte el propio autor.
- Resumen y extraccion de informacion de contratos y normativa: con 32.768 tokens de contexto se pueden procesar documentos legales extensos de una sola pasada para generar resumenes estructurados o extraer clausulas, sujeto a verificacion humana.
- Atencion al cliente automatizada en vietnamita: chatbot multi-turno desplegado en CPU o en una GPU de 4 GB, con coste de infraestructura muy bajo, adecuado para volumenes moderados y tono conversacional.
- Clasificacion y enrutado de tickets o consultas: tareas de etiquetado y triaje donde un modelo de 0,6 B es suficiente y el coste por inferencia es minimo; util como clasificador previo a un modelo mayor.
- Traduccion y adaptacion vi-en de textos tecnicos o administrativos: el modelo declara ambos idiomas, de modo que puede usarse para borradores de traduccion que despues se revisan.
- Prototipado y pruebas offline en portatiles o dispositivos edge: al ocupar menos de 0,4 GB en disco y requerir aproximadamente 2,4 GB de VRAM segun el autor, se puede ejecutar en maquinas sin GPU dedicada y sin conexion a internet, algo critico en entornos con requisitos de confidencialidad.
- Generacion de datos sinteticos y preetiquetado para anotacion: puede producir borradores de respuestas o etiquetas que despues se corrigen, reduciendo el coste de construir datasets en vietnamita.
- Integracion en pipelines de CI/CD o scripts de automatizacion documental mediante llama-cpp-python, donde se necesita un modelo pequeno, reproducible y sin dependencia de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y la busqueda web realizada no devolvio informacion relevante sobre el modelo. La comparativa de rendimiento con alternativas deberia basarse, por tanto, en evaluaciones propias.

## Requisitos de hardware

- VRAM estimada segun el autor: ~2,4 GB para Q4_K_M y Q4_K_S; ~2,3 GB para Q3_K_M y Q3_K_S. Estas cifras incluyen el contexto en ejecucion, no solo los pesos.
- Tamano en disco: 0,37 GB (Q4_K_M), 0,36 GB (Q4_K_S), 0,32 GB (Q3_K_M) y 0,30 GB (Q3_K_S).
- GPUs recomendadas: no especificadas por el autor. Por tamano, cualquier GPU con 4 GB o mas de VRAM es suficiente, incluidas GTX 1650, RTX 3050, RTX 4060, RTX 4090, A100 o H100; en estas ultimas el modelo queda muy infrautilizado.
- GPU de consumo: si, cabe practicamente en cualquier GPU de consumo con 4 GB o mas, e incluso se puede ejecutar completamente en CPU con `n_gpu_layers=0`.
- CPU: viable sin GPU gracias al formato GGUF; el rendimiento dependera del numero de nucleos y del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp, llama-cpp-python (ejemplo oficial con `n_ctx=8192`, `n_gpu_layers=-1`, `temperature=0.6`, `top_p=0.95`), Ollama (con `num_ctx 8192` en el Modelfile de ejemplo), LM Studio y otros runtimes compatibles con GGUF. vLLM o TGI no son las vias naturales para este artefacto, ya que solo se publican pesos GGUF y no safetensors.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| qwen3-0.6b-cefc-rft-vietnamese-legal-GGUF (este modelo) | 596.049.920 | 32.768 | vi, en | apache-2.0 (con reservas del autor) | GGUF | Ajuste juridico vietnamita, 0 descargas, sin benchmarks |
| Qwen/Qwen3-0.6B-Base | 0,6 B (familia Qwen3) | 32.768 | multilingue (no detallado) | apache-2.0 | safetensors | Modelo base sin ajustar; sirve como referencia de arquitectura |
| phuongntc/qwen3-0.6b-cefc-rft-vietnamese-legal | no disponible | no disponible | no disponible | apache-2.0 segun el autor | pesos del adaptador LoRA | Adaptador de origen; el modelo aqui descrito es su version fusionada y cuantizada |

Los datos de las dos filas de modelos Qwen proceden de la informacion del repositorio y de la propia familia Qwen3; el resto de campos no verificados se marcan como no disponibles. No se dispone de datos de benchmarks que permitan comparar el rendimiento real frente a alternativas de tamano similar, por lo que cualquier comparacion de calidad queda pendiente de evaluacion propia.

## Limitaciones y advertencias

- Riesgo de alucinacion: el autor advierte explicitamente de que el modelo puede generar informacion falsa. En un modelo de 0,6 B este riesgo es alto, especialmente en dominio juridico, donde una respuesta incorrecta puede tener consecuencias graves.
- No apto como sustituto de asesoramiento profesional: la propia model card indica que las salidas no deben usarse en lugar de la opinion de un especialista en areas criticas.
- Idiomas: solo se declaran vietnamita e ingles. El rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Contexto: aunque la configuracion declara 32.768 tokens, los ejemplos oficiales usan 8192, y no hay datos sobre la degradacion de calidad con contextos largos.
- Licencia: el repositorio declara apache-2.0, pero el propio autor matiza que la licencia se determina tras verificar las licencias de origen y que no se autoasigna Apache-2.0. Conviene confirmar la cadena de licencias (modelo base y adaptador LoRA) antes de un uso comercial.
- Trazabilidad del entrenamiento: no se documentan dataset, numero de tokens, proceso de RFT ni hiperparametros, lo que dificulta auditar sesgos o comportamientos indeseados.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin evaluaciones externas ni benchmarks publicados.
- Cuantizaciones agresivas: las variantes Q3_K_M y Q3_K_S pueden degradar notablemente la calidad en un modelo ya de por si pequeno.
- Capacidad limitada: con 0,6 B parametros no cabe esperar razonamiento complejo, matematicas avanzadas ni generacion de codigo fiable.
- Uso en produccion: se recomienda tratar este modelo como experimental, con supervision humana en cualquier flujo juridico, sanitario o financiero.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BachDaThan/qwen3-0.6b-cefc-rft-vietnamese-legal-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Adaptador LoRA de origen: https://huggingface.co/phuongntc/qwen3-0.6b-cefc-rft-vietnamese-legal
- llama.cpp: https://github.com/ggml-org/llama.cpp
- llama-cpp-python: https://github.com/abetlen/llama-cpp-python
- Ollama: https://ollama.com
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos resultados obtenidos eran mapas de Rusia, sin relacion con el contenido de la ficha.
