# Shockem/Qwen3.8-Flash-Next-GSQ-RCO-IQ3_S-Q8PLE-Basalt

## Resumen

Qwen3.8-Flash-Next GSQ-RCO IQ3_S Q8PLE-Basalt es un pack de pesos cuantizados en formato `.basalt` derivado del modelo base Qwen/Qwen3.8-Flash-Next, publicado por el usuario Shockem. No se trata de un modelo nuevo ni de un fine-tuning: es una variante de empaquetado del pack oficial GSQ-RCO IQ3_S de ISTA-DASLab, en el que se ha sustituido un unico tensor (la tabla n-gram por capa `per_layer_token_embd.weight`) por su version Q8_0 procedente del pack oficial NVFP4 de NVIDIA.

El modelo subyacente es de arquitectura MoE (tag `moe` en la model card, base Qwen3.8-Flash-Next), con decodificacion asistida por un drafter MTP auto-destilado y un proyector de vision, segun los componentes enumerados en el empaquetado. El contexto declarado en la informacion disponible no consta de forma explicita; el autor cita mediciones de prefill a 32k y 128k tokens, lo que sugiere soporte al menos hasta 128k.

La relevancia del artefacto es practica: el autor sostiene que ensanchar la tabla n-gram de IQ4_NL a Q8_0 no altera el derrame de expertos (spill) y acerca la calidad del tensor sustituido a la del pack NVFP4, manteniendo la velocidad del pack IQ3_S. El repositorio ocupa 112,5 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (segun tag de la model card); transformer con drafter MTP y proyector de vision, detalles no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el autor reporta mediciones de prefill a 32k y 128k tokens) |
| Tipos de cuantizacion | GSQ-RCO IQ3_S (expertos enrutados), Q8_0 (tabla n-gram por capa), IQ4_NL (tabla n-gram en el pack de origen), NVFP4/FP8 (pack de referencia NVIDIA) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (el motor Basalt es MIT; los pesos no) |
| Formato de pesos | `.basalt` (un unico archivo de 112.534.980.259 bytes, 104,8 GiB) |

## Arquitectura y entrenamiento

El pack no aporta entrenamiento propio: reutiliza el modelo base Qwen3.8-Flash-Next y los pesos cuantizados del pack oficial GSQ-RCO IQ3_S publicado por ISTA-DASLab, con la tecnica GSQ (arXiv:2604.18556) y RCO (arXiv:2605.00649) aplicada a los expertos enrutados. El autor indica que los expertos enrutados ocupan 46,84 GiB y que el paquete incluye ademas un pool denso, un drafter MTP auto-destilado, un perfil de expertos, un proyector de vision y el tokenizer, todo copiado con hashes de seccion coincidentes.

La unica modificacion es el tensor `per_layer_token_embd.weight`, una tabla n-gram por capa de 320.001.536 filas por 160, que en el pack oficial IQ3_S se almacena como IQ4_NL (26,8 GiB, 90 bytes por fila) y aqui se almacena como Q8_0 (50,7 GiB, 170 bytes por fila), copiada byte a byte desde el pack NVFP4 de NVIDIA. El autor reporta que una comparacion de dequantizacion sobre 48 filas obtuvo coseno 0,997 (aproximadamente 8 % rms, atribuido al error de 4 bits) y que diez filas Q8, incluida la primera y la ultima, resultaron identicas byte a byte a la fuente NVFP4. Cada token lee 16 filas, por lo que el trafico adicional es de 80 bytes por fila.

## Capacidades

- Generacion de texto autoregresiva sobre el modelo base Qwen3.8-Flash-Next; las capacidades concretas del base no se detallan en la informacion disponible.
- Vision: el paquete incluye un proyector de vision, lo que implica soporte de entrada multimodal de imagenes.
- Decodificacion especulativa mediante un drafter MTP auto-destilado incluido en el pack.
- Perfil de expertos precalculado para planificacion de memoria y derrame de expertos en el motor Basalt.
- Tabla n-gram por capa en Q8_0, formato que el motor Basalt ya lee de forma nativa.
- Tool calling, function calling, agentes, razonamiento multi-paso y thinking mode: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible.

## Casos de uso

- Despliegue en hardware de gama media con presupuesto de RAM limitado: el autor reporta que en una maquina con 3x RTX 5060 Ti de 16 GB y un presupuesto de 37 GiB para expertos, el pack IQ3_S solo derrama 1,3 GiB (3 %), frente a 18,1 GiB (29 %) del pack NVFP4, lo que lo hace adecuado para inferencia local en equipos de consumo.
- Servicio de generacion de prosa y codigo de forma interactiva: con decodificacion de 83,7 tok/s en prosa y 90,2 tok/s en codigo segun las mediciones del autor, es viable para asistentes de chat y autocompletado en entornos de desarrollo.
- Procesamiento de documentos largos: el prefill medido a 32k (2414) y 128k (2301) tokens permite cargar prompts extensos para resumen, extraccion y analisis de contratos o informes.
- Tareas multimodales basicas: al incluir proyector de vision, puede emplearse para descripcion de imagenes o extraccion de informacion de capturas y documentos escaneados, sujeto a las capacidades reales del base.
- Evaluacion comparativa de cuantizaciones: sirve como referencia para medir el impacto de la precision de la tabla n-gram frente a los packs IQ3_S e IQ4_NL, dado que el autor documenta KLD y acuerdo top-1.
- Pruebas de integracion del motor Basalt: el pack esta pensado para apuntar `server.model` del servidor Basalt a un unico archivo, lo que simplifica entornos de test y CI para validar el motor.
- Investigacion sobre decodificacion especulativa: el drafter MTP incluido permite experimentar con decodificacion asistida sin entrenar un modelo aparte.

## Benchmarks y rendimiento

Datos reportados por el autor del pack (mediciones en 3x RTX 5060 Ti 16 GB, presupuesto de expertos 37 GiB):

| Metrica | NVFP4 | IQ3_S con n-gram IQ4_NL |
|---|---:|---:|
| Derrame de expertos a 37 GiB | 18,1 GiB (29 %) | 1,3 GiB (3 %) |
| Decodificacion prosa / codigo | 55,3 / 54,2 tok/s | 83,7 / 90,2 tok/s |
| Prefill 32k / 128k | 2646 / 2491 | 2414 / 2301 |
| Harness dificil, 14 tests x 3 | 104 s | 35 s, ambos 14/14 |

Calidad del pack oficial IQ3_S frente a una referencia Q8_0, sobre 100 fragmentos de wikitext:

| Metrica | IQ3_S oficial | NVFP4 oficial |
|---|---:|---:|
| KLD | 0,1547 | 0,0680 |
| Acuerdo top-1 | 87,25 % | 91,46 % |

El autor advierte que el archivo de esta ficha no fue re-benchmarkeado: solo se verifico que una completion corta carga y responde tras el injerto del tensor. El KLD es una distancia respecto a la referencia Q8_0, no una puntuacion de tarea, y los expertos siguen en IQ3_S, por lo que la mayor parte de esa brecha persiste. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM: el archivo pesa 104,8 GiB; el autor lo ejecuta con un presupuesto de 37 GiB de RAM para expertos en una maquina de 3x RTX 5060 Ti de 16 GB (48 GB de VRAM en total), con un derrame de expertos de 1,3 GiB.
- GPU recomendadas: no hay recomendaciones explicitas en la informacion disponible; el unico hardware documentado es 3x RTX 5060 Ti 16 GB. Por tamano, un despliegue sin derrame requiere agregados de memoria muy superiores (A100 80 GB, H100 80 GB o multiples GPU), aunque esto no esta verificado por el autor.
- GPU de consumo: cabe en configuraciones multi-GPU de consumo como la descrita, con derrame parcial a RAM del sistema.
- Opciones de despliegue: motor Basalt (fork de Strata), apuntando `server.model` al archivo `.basalt`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: decodificacion de 83,7 tok/s (prosa) y 90,2 tok/s (codigo); prefill de 2414 tok/s a 32k y 2301 tok/s a 128k, medidos con el pack IQ3_S sin la modificacion de esta ficha.

## Comparativa con modelos similares

| Modelo | Formato / cuantizacion | Tamano | Derrame a 37 GiB | Decodificacion | Licencia |
|---|---|---:|---:|---:|---|
| Este pack (Shockem) | `.basalt`, IQ3_S + n-gram Q8_0 | 104,8 GiB | no re-medido (base: 1,3 GiB) | no re-medido (base: 83,7-90,2 tok/s) | Qwen Community 1.0 |
| jesdga/Qwen3.8-Flash-Next-Basalt (IQ3_S oficial) | `.basalt`, IQ3_S + n-gram IQ4_NL | no disponible | 1,3 GiB (3 %) | 83,7 / 90,2 tok/s | Qwen Community 1.0 |
| Pack NVFP4 oficial (mismo repo jesdga) | `.basalt`, NVFP4 | no disponible | 18,1 GiB (29 %) | 55,3 / 54,2 tok/s | Qwen Community 1.0 |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF | GGUF, GSQ-RCO | no disponible | no disponible | no disponible | Qwen Community 1.0 |

## Limitaciones y advertencias

- El archivo no ha sido re-benchmarkeado por el autor: las cifras de rendimiento y derrame corresponden al pack IQ3_S sin modificar, no a este archivo.
- Los expertos enrutados siguen en IQ3_S, por lo que la calidad global no alcanza al pack NVFP4: KLD 0,1547 y acuerdo top-1 87,25 % frente a 0,0680 y 91,46 %.
- El tensor n-gram en Q8_0 anade 80 bytes por fila y 16 filas por token de trafico de memoria; el autor sostiene que no altera el derrame, pero no lo verifica en este archivo.
- Solo funciona con el motor Basalt; no hay evidencia de compatibilidad con otros runtimes.
- Licencia Qwen Community License 1.0: no es una licencia permisiva tipo MIT o Apache; el uso comercial esta sujeto a las condiciones del texto de la licencia, que debe revisarse antes de produccion. El motor Basalt es MIT, los pesos no.
- Idiomas soportados no declarados; no hay garantia de cobertura multilingue mas alla del modelo base.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; deben asumirse los del modelo base Qwen3.8-Flash-Next.
- Repositorio sin descargas ni interacciones: no hay validacion por parte de la comunidad ni reportes independientes de calidad.
- El autor menciona que el comando de descarga de la model card usa un identificador de repo distinto (`Shockem/Qwen3.8-FN-GSQ-RCO-IQ3_S-Q8PLE-basalt`) del ID real del repositorio; conviene verificar el identificador antes de automatizar la descarga.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Shockem/Qwen3.8-Flash-Next-GSQ-RCO-IQ3_S-Q8PLE-Basalt
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Pack Basalt de origen: https://huggingface.co/jesdga/Qwen3.8-Flash-Next-Basalt
- Pack GSQ-RCO de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Motor Basalt: https://github.com/jesdga95/basalt
- Motor Strata (origen del fork): https://github.com/Niko1221/Strata
- Paper GSQ: arXiv:2604.18556
- Paper RCO: arXiv:2605.00649
