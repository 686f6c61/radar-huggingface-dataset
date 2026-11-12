# qalduaij/lolo_Q8y_Dialect_v4_26B_A4B

## Resumen

lolo_Q8y_Dialect_v4_26B_A4B (Q8y Dialect v4 26B-A4B) es un ajuste fino del modelo base `unsloth/gemma-4-26B-A4B-it` desarrollado por Qusai Al-duaij (qalduaij) dentro de la familia "lolo AI". Su objetivo declarado es la conservacion, documentacion y generacion de texto en dialecto kuwaiti (Q8y), incluyendo su patrimonio maritimo y social, y la redaccion de narrativa radiofonica y dramatica kuwaiti. El modelo se distribuye con licencia Apache 2.0 y pesos en safetensors y GGUF.

El modelo hereda la arquitectura del Gemma 4 26B-A4B, un transformer de tipo mezcla de expertos (MoE) con aproximadamente 25.800 millones de parametros totales y unos 4.000 millones de parametros activos por token, segun la nomenclatura A4B del modelo base. El repositorio ocupa 103,2 GB, lo que corresponde a los pesos en precision alta (Q8 en la nomenclatura del autor) mas las variantes GGUF.

La relevancia del modelo es acotada pero especifica: se trata de uno de los pocos ajustes finos publicos orientados al dialecto kuwaiti, un registro poco cubierto por los modelos generalistas, y con un enfoque explicito en estilo broadcast. No obstante, en el momento de redactar esta ficha el repositorio no registra descargas ni interacciones, y no se han publicado resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), derivada de Gemma 4 26B-A4B |
| Parametros totales | 25.805.936.206 (25,8 mil millones) |
| Parametros activos | Aproximadamente 4 mil millones (según la nomenclatura A4B del modelo base) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8 (según el nombre del modelo); pesos GGUF incluidos en el repositorio |
| Idiomas soportados | Arabe (ar) e ingles (en); especializado en dialecto kuwaiti |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/gemma-4-26B-A4B-it`, un modelo instructivo de Gemma 4 con arquitectura de mezcla de expertos y activacion dispersa de aproximadamente 4.000 millones de parametros por token sobre un total de 25,8 mil millones. El ajuste fino se realizo, segun los tags del repositorio, con la herramienta Unsloth. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

Segun la model card, el corpus de especializacion se construyo a partir de la enciclopedia del dialecto kuwaiti del investigador Khaled Al-Rashid, el estudio de la doctora Suha Najah y 62 fuentes audiovisuales y textuales (entrevistas, series y obras de teatro kuwaities). El autor declara un enfasis en el "ajuste fonetico y lexico" del dialecto, con vocabulario caracteristico (`قاعد`, `صج`, `شنو`, `شحقه`, `وايد`, `أثاري`, `يتراوالي`) y en la generacion de narrativa radiofonica continua sin acotaciones de direccion. No se documentan innovaciones arquitectonicas propias ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional en dialecto kuwaiti y en arabe estandar, con registro coloquial.
- Redaccion de guiones y narrativa radiofonica y televisiva en estilo de locutor o narrador.
- Documentacion y divulgacion de lexico y patrimonio cultural kuwaiti (maritimo y social).
- Conversacion multi-turno (pipeline declarado como conversacional).
- Capacidades heredadas del modelo base Gemma 4 instructivo: razonamiento, codigo y matematicas, en la medida en que el ajuste fino no las haya degradado (no hay evaluacion publicada que lo confirme).
- Soporte de ingles (ar, en) segun los metadatos del repositorio.
- Tool calling y capacidades de agente: no documentadas en la informacion disponible.
- Modo thinking, vision o audio: no documentados.

## Casos de uso

- Redaccion de boletines y piezas radiofonicas: el modelo puede generar textos de locucion continuos en dialecto kuwaiti, sin marcas de direccion, adecuados para emisoras locales o podcasts.
- Guionizacion de series y teatro costumbrista: sirve para producir dialogos con vocabulario y giros kuwaities verificables, util en preproduccion y en doblaje de referencia.
- Documentacion lexicografica: puede generar definiciones, ejemplos de uso y variantes de terminos del dialecto para diccionarios o materiales divulgativos.
- Atencion al cliente en kuwaiti: un asistente conversacional que responda en el registro coloquial del usuario, con la advertencia de que la calidad fuera del dialecto no esta evaluada.
- Preservacion de patrimonio oral: transcripcion estilizada y reelaboracion de entrevistas y relatos maritimos para archivos culturales.
- Contenido para redes sociales y campanas locales: generacion de copies y respuestas en dialecto para publicos de Kuwait y el Golfo.
- Traduccion de registro coloquial arabe estandar a kuwaiti: adaptacion de textos institucionales a un tono cercano, siempre con revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en Q8: en torno a 26-28 GB solo para pesos, mas overhead de contexto y cache KV; se recomienda un minimo de 32 GB.
- En cuantizaciones GGUF de 4 bits (Q4_K_M), el modelo puede ocupar aproximadamente 15-16 GB, lo que lo hace viable en GPUs de 24 GB.
- GPU recomendadas: A100 40/80 GB o H100 para Q8 y contexto largo; RTX 4090 (24 GB) o RTX A6000 (48 GB) para cuantizaciones de 4-8 bits.
- Cabe en GPU de consumo (RTX 4090, RTX 3090) unicamente con cuantizacion de 4 bits y contextos moderados.
- Opciones de despliegue: llama.cpp y Ollama para los GGUF; vLLM o TGI para los safetensors si el modelo base es compatible con dichos motores (no verificado en la informacion disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| lolo_Q8y_Dialect_v4_26B_A4B | 25,8 mil M (MoE, ~4 mil M activos) | No disponible | ar, en (kuwaiti) | Apache 2.0 | Dialecto kuwaiti y broadcast |
| unsloth/gemma-4-26B-A4B-it (base) | 25,8 mil M (MoE, ~4 mil M activos) | No disponible | Multilingue | Gemma (terminos propios) | Proposito general instructivo |
| Modelos arabes generalistas de ~7-30 mil M | Variable | Variable | ar, en | Variable | Arabe estandar y multilingue |

La comparativa con alternativas especializadas en dialectos del Golfo no esta disponible: no se han identificado en la informacion proporcionada modelos publicos comparables con el mismo enfoque.

## Limitaciones y advertencias

- No hay evaluacion publicada: el rendimiento real en dialecto, en arabe estandar y en tareas generales no esta verificado de forma independiente.
- Riesgo de alucinacion en datos culturales e historicos: el modelo puede inventar terminos, etimologias o referencias patrimoniales; requiere revision por hablantes nativos.
- El ajuste fino sobre un unico registro puede degradar capacidades generales del modelo base (codigo, matematicas, ingles), sin que existan datos que lo cuantifiquen.
- Cobertura limitada a arabe kuwaiti e ingles; el comportamiento en otros dialectos arabes o en castellano no esta documentado.
- Longitud de contexto no especificada: no se puede garantizar el manejo de documentos largos.
- Licencia Apache 2.0 declarada, pero el modelo base Gemma tiene terminos de uso propios; conviene verificar la compatibilidad para uso comercial antes de desplegar en produccion.
- Repositorio sin descargas ni validacion de la comunidad en el momento de la consulta: tratar como modelo experimental.
- No se documentan medidas de seguridad, filtros de contenido ni evaluaciones de sesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qalduaij/lolo_Q8y_Dialect_v4_26B_A4B
- Modelo base: https://huggingface.co/unsloth/gemma-4-26B-A4B-it
- Unsloth: https://github.com/unslothai/unsloth
