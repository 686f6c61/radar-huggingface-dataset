# 8times4/apex-flash-1-FP8

## Resumen

apex-flash-1-FP8 es una cuantizacion comunitaria en FP8 del modelo cantina-security/apex-flash-1, un modelo de mezcla de expertos (MoE) de 321.323.031.390 parametros construido sobre GLM-5.3-Flash. La publica el usuario 8times4 y su objetivo es reducir el peso del checkpoint de aproximadamente 643 GB en BF16 a unos 328 GB en FP8, manteniendo la seleccion de tensores cuantizados definida por la release oficial de zai-org/GLM-5.3-Flash.

El modelo cubre la tarea image-text-to-text, por lo que admite entradas multimodales de imagen y texto, y esta orientado a investigacion en seguridad (security-research) y a uso conversacional. Al ser una conversion independiente del checkpoint original, no anade entrenamiento ni calibracion: solo aplica cuantizacion de bloques FP8 (formato E4M3FN, esquema de activacion dinamico, bloques de peso de 128x128) sobre los tensores indicados por el indice FP8 oficial.

Su relevancia actual radica en que permite desplegar un MoE de mas de 320.000 millones de parametros con aproximadamente la mitad del espacio en disco y de VRAM que la version BF16, habiendo sido validado con vLLM sobre 8 GPU NVIDIA H100 de 80 GB. La licencia es MIT, heredada del checkpoint de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE basada en GLM-5.3-Flash (con MLA, MLP densas y expertos enrutados y compartidos) |
| Parametros totales | 321.323.031.390 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (quant_method: fp8, fmt: e4m3, activation_scheme: dynamic, weight_block_size: [128, 128]); fuente en BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada del checkpoint de origen; Copyright (c) 2026 Z.AI Co., Ltd.) |
| Formato de pesos | safetensors (62 shards) |

## Arquitectura y entrenamiento

El modelo es una mezcla de expertos (MoE) basada en la arquitectura GLM-5.3-Flash. La cuantizacion afecta a los expertos enrutados y compartidos, a las MLP densas y a las proyecciones MLA (atención latente multi-cabeza), segun el indice FP8 oficial. El resto de tensores conservan sus valores originales en BF16/F32. Esta release no introduce cambios arquitectonicos respecto al modelo base: se limita a convertir los pesos.

Respecto al entrenamiento de esta ficha, no aplica: es una cuantizacion post-entrenamiento (PTQ) realizada en CPU, sin datos de calibracion y sin entrenamiento adicional. El proceso usa escalado absmax por bloque (`scale = amax(abs(W)) / 448`) seguido de conversion FP8 con redondeo al mas cercano, almacenando las escalas en F32 como `weight_scale_inv`. Se verificaron los 62 shards con sumas SHA-256 y se comprobo que los tensores no cuantizados se preservaban byte a byte. No se ha realizado una comparacion de calidad de tarea frente a la fuente BF16, ni se han reproducido los benchmarks del modelo original.

## Capacidades

- Generacion de texto y conversacion multiturno (tag `conversational`).
- Entrada multimodal image-text-to-text (procesa imagenes junto con texto).
- Razonamiento basado en una arquitectura MoE de gran escala (321.000 millones de parametros).
- Orientacion a investigacion en seguridad (tag `security-research`).
- No se dispone de informacion verificada sobre tool calling, function calling, modo de pensamiento explicito, audio ni otras capacidades especiales.
- No se dispone de detalle sobre cobertura multilingue real; el campo de idiomas aparece como no disponible.

## Casos de uso

- Despliegue de inferencia a gran escala en clúster: al reducir el checkpoint a unos 328 GB en FP8, permite servir un MoE de 321.000 millones de parametros sobre 8 GPU H100 de 80 GB con vLLM, escenario validado por el autor.
- Investigacion en seguridad y evaluacion de modelos: el tag security-research y la procedencia de Cantina Security lo orientan a estudios de robustez, red teaming y analisis de comportamiento en modelos de gran tamano.
- Analisis de documentos con imagenes: la tarea image-text-to-text permite procesar capturas, diagramas o documentos escaneados junto con texto en un mismo flujo.
- Asistentes conversacionales de dominio tecnico: la naturaleza conversacional del modelo lo hace apto para dialogos multiturno, siempre que la ventana de contexto real (no disponible) sea suficiente para el caso.
- Comparativas de cuantizacion: sirve como referencia para medir el impacto de FP8 con bloques 128x128 frente al checkpoint BF16 original en pipelines de evaluacion propios.
- Sustitucion del modelo base en infraestructura existente: al compartir tokenizer, chat template y processor con el original, se puede integrar sin reescribir el preprocesado.
- Experimentacion academica con arquitecturas MoE a gran escala: util como punto de partida para estudiar MLAs y enrutado de expertos en un entorno cuantizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se ha realizado una comparacion de calidad de tarea frente a la fuente BF16 y que no se han reproducido los benchmarks del modelo original. El unico dato de validacion tecnica es que el checkpoint se carga y funciona correctamente con vLLM sobre 8 GPU NVIDIA H100 de 80 GB.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa aproximadamente 328 GB en disco; para inferencia con vLLM hay que sumar el cache KV y los buffers de activaciones, por lo que el consumo practico supera con holgura los 328 GB de pesos.
- Configuracion validada: 8 GPU NVIDIA H100 de 80 GB (640 GB de VRAM agregada) con vLLM, segun el autor.
- GPU de grado consumidor: no cabe. Un unico RTX 4090 (24 GB) o similar es muy inferior al tamano del modelo, incluso cuantizado en FP8.
- Opciones de despliegue: vLLM es el unico backend explicitamente validado. No se documenta soporte de llama.cpp, Ollama ni TGI para este formato FP8. El formato safetensors FP8 apunta a stacks de inferencia para GPU de datacenter.
- Latencia y throughput: no disponibles; no se publican datos de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 8times4/apex-flash-1-FP8 | 321.323.031.390 | FP8 (e4m3, bloque 128x128) | no disponible | MIT | HuggingFace (esta ficha) |
| cantina-security/apex-flash-1 | 321.323.031.390 (mismo total) | BF16 (fuente, ~643 GB) | no disponible | MIT | HuggingFace |
| pqhaz/apex-flash-1-abliterated-FP8 | no disponible | FP8 | no disponible | no disponible | HuggingFace |
| zai-org/GLM-5.3-Flash | no disponible | FP8 oficial (origen del esquema) | no disponible | MIT (segun cabecera) | HuggingFace |

No se dispone de datos de rendimiento comparado (benchmarks) entre estas variantes, por lo que la comparacion se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- No se ha evaluado la perdida de calidad frente al checkpoint BF16 original; la cuantizacion FP8 puede degradar tareas sensibles sin que exista todavia una medicion publicada.
- El campo de idiomas esta marcado como no disponible, por lo que no hay garantia documentada de comportamiento multilingue.
- La longitud de contexto no esta especificada en la informacion disponible; conviene verificarla antes de disenar flujos que dependan de ventanas largas.
- Es una conversion comunitaria no afiliada a los autores del modelo original (Cantina Security, Yeta ni Z.ai).
- Los parametros activos no estan publicados, lo que dificulta estimar coste por token y planificar capacidad.
- Riesgo de alucinacion inherente a los modelos generativos y no cuantificado en esta release.
- Aunque la licencia es MIT, ciertas capacidades (por ejemplo, uso con datos de terceros o finalidades reguladas) requieren la revision legal habitual; el aviso de copyright corresponde a Z.AI Co., Ltd.
- Backend de despliegue limitado: solo validado con vLLM; otros runners como llama.cpp u Ollama no documentan soporte para este checkpoint FP8.
- El repositorio presenta 0 descargas y 0 likes en el momento de redactar la ficha, por lo que carece de validacion amplia por parte de la comunidad.

## Enlaces

- HuggingFace (esta cuantizacion): https://huggingface.co/8times4/apex-flash-1-FP8
- Modelo base BF16: https://huggingface.co/cantina-security/apex-flash-1
- Revision del modelo base usada: https://huggingface.co/cantina-security/apex-flash-1/tree/28c647a6bd0444973a7ef3d940c24c67e64f52fe
- Modelo de referencia GLM-5.3-Flash: https://huggingface.co/zai-org/GLM-5.3-Flash
- Revision de GLM-5.3-Flash usada: https://huggingface.co/zai-org/GLM-5.3-Flash/tree/eb9eb208eb0d988989d07a6a12d0fdeb5f52574a
- Cuantizacion que inspiro el script: https://huggingface.co/pqhaz/apex-flash-1-abliterated-FP8
- Script de conversion de referencia: https://huggingface.co/pqhaz/apex-flash-1-abliterated-FP8/blob/main/convert.py
- Pagina de Cantina Security sobre Apex Flash: https://www.cantina.security/apex-flash
- Yeta: https://yeta.ai/
