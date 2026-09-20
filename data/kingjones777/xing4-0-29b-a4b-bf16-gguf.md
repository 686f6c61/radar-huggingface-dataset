# kingjones777/Xing4.0-29B-A4B-BF16-GGUF

## Resumen

Xing4.0-29B-A4B-BF16-GGUF es una conversión a GGUF en precisión completa BF16 del modelo XingChen-AGI/Xing4.0-29B-A4B, publicada por el usuario kingjones777. No se trata de un modelo entrenado desde cero, sino de un artefacto de conversión pensado como fuente de cuantización: de este fichero se derivan los distintos niveles del repositorio hermano Xing4.0-29B-A4B-ROCmFP4-GGUF. El repositorio contiene un único fichero de 62.451.864.992 bytes (unos 62,45 GB) y el modelo real declarado en safetensors asciende a 31.215.031.088 parámetros.

Su relevancia es doble. Por un lado, sirve para re-cuantizar desde precisión completa si se quiere un nivel distinto del publicado. Por otro, es un caso poco habitual en el ecosistema GGUF: la arquitectura del modelo base no está soportada por llama.cpp upstream. Se trata de una arquitectura de estilo DeepSeek2 con MLA (multi-head latent attention) más hyper-connections (`hc`) y una capa MTP de estilo DeepSeek en la posición 40 que no lleva tensores `hc`. Cargar este fichero con una build estándar de llama.cpp falla.

El autor documenta además dos detalles de correctitud en el port que producían salidas plausibles pero incorrectas en lugar de errores: la epsilon de Sinkhorn debe ir en el denominador y `hc_expand` debe contraer `comb^T`. Con ambas correcciones, la perplejidad bajó de 80,05 a 8,365 frente a una referencia en HuggingFace de 8,425. La licencia es Apache-2.0, heredada del modelo base, y el modelo se convirtió y midió en AMD Strix Halo (gfx1151, ROCm 7.2.4).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de estilo DeepSeek2 con MLA y hyper-connections (`hc`), mas capa MTP en la posicion 40 |
| Parametros totales | 31.215.031.088 (dato real de safetensors); el nombre comercial indica 29B |
| Parametros activos | Aproximadamente 4B segun la nomenclatura A4B del nombre; no confirmado de forma explicita en la informacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 en este repositorio; niveles ROCmFP4 en el repositorio hermano (por ejemplo, `Q4_0_ROCMFP4_STRIX_LEAN`) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (BF16); fichero unico `Xing4.0-29B-A4B-BF16.gguf` |

## Arquitectura y entrenamiento

La arquitectura declarada por el autor es de estilo DeepSeek2 con MLA (multi-head latent attention) y hyper-connections, denotadas como `hc`. La capa MTP (multi-token prediction) de estilo DeepSeek se sitúa en la posicion 40 y, a diferencia del resto, no transporta tensores `hc`. Esta combinación no está registrada en llama.cpp upstream: el propio autor indica que el fichero no es un GGUF normal y que se necesita un fork que registre la arquitectura `xing4` (con un fichero de conversión `conversion/xing4.py`). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO, ya que este repositorio es una conversión y no la ficha del modelo base.

En cuanto a innovaciones técnicas, la aportación de este repositorio es fundamentalmente de ingeniería de portabilidad. El autor documenta dos correcciones críticas que separaban una implementación funcional de una incorrecta: la epsilon de Sinkhorn debe colocarse en el denominador y no sumarse al valor (una `eps` de 1e-6 sumada a entradas del orden de 1e-7 actúa como un suelo multiplicador de 5 a 17 veces), y `hc_expand` debe contraer `comb^T` en lugar de `comb`. Además, advierte de que la comparación de normas de tensores no sirve como validador en este caso, porque la corrección de la traspuesta parecía una regresión de 6x mientras el error de la epsilon la enmascaraba. La validación debe hacerse con perplejidad, no con normas.

## Capacidades

- Generación de texto y uso conversacional: el repositorio está etiquetado como `text-generation` y `conversational`, con `endpoints_compatible`.
- Conversión y re-cuantización: el fichero está pensado explícitamente como fuente para producir otros niveles de cuantización mediante `llama-quantize`.
- Validación de ports de arquitectura: sirve como referencia de perplejidad para verificar implementaciones de la arquitectura `xing4` en llama.cpp u otros runtimes.
- Ejecución en hardware AMD: la conversión y las mediciones se realizaron sobre AMD Strix Halo (gfx1151) con ROCm 7.2.4.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la ficha no declara idiomas.
- Capacidad de visión o audio: no disponible; el pipeline declarado es únicamente de generación de texto.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en AMD Strix Halo: el autor convirtió y midió el modelo en gfx1151 con ROCm 7.2.4, por lo que es el escenario validado de forma directa. Requiere un fork de llama.cpp que registre la arquitectura `xing4`.
- Re-cuantización a otros niveles: el fichero es la fuente declarada de los niveles ROCmFP4. Un usuario que necesite un equilibrio distinto entre tamaño y calidad puede partir de este BF16 y generar su propio tier con `llama-quantize`.
- Auditoría y validación de ports: un desarrollador que implemente la arquitectura `xing4` en otro runtime puede usar este fichero y su perplejidad de referencia (8,425 en HF) para comprobar que su port es correcto en lugar de fiarse de las normas de los tensores.
- Servicio de chat conversacional multi-turno en local: gracias a la etiqueta `conversational` y a `endpoints_compatible`, puede exponerse como endpoint de generación de texto. La longitud de contexto real no está documentada, así que debe medirse antes de dimensionar la ventana.
- Procesamiento de texto por lotes en infraestructura propia: al ser un GGUF ejecutable con llama.cpp, encaja en pipelines batch on-premise o en entornos air-gapped, donde la licencia Apache-2.0 facilita el uso interno.
- Investigación sobre atención MLA y hyper-connections: el modelo base combina MLA con `hc`, una combinación poco frecuente en modelos abiertos, lo que lo hace útil para experimentos sobre eficiencia de atención y flujos de información entre capas.
- Base para experimentos de cuantización comparada: al existir el BF16 y varios tiers ROCmFP4 derivados del mismo fichero, permite medir el impacto de cada nivel de cuantización sobre la perplejidad con una referencia común.
- Estudio del comportamiento de la capa MTP: la capa 40 sin tensores `hc` es un caso concreto que puede analizarse para entender cómo interactúa la predicción multi-token con el resto de la arquitectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato cuantitativo aportado por el autor es la perplejidad, medida con la siguiente configuración: 32 fragmentos de 512 tokens, `-ub 64 -ngl 99 -fit off`.

| Medicion | Valor |
|---|---|
| Perplejidad antes de las correcciones del port | 80,05 |
| Perplejidad despues de las correcciones del port | 8,365 |
| Perplejidad de referencia en HuggingFace | 8,425 |
| Configuracion de evaluacion | 32 chunks x 512 tokens, `-ub 64 -ngl 99 -fit off` |

No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra bateria estandar en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para el fichero BF16: el fichero ocupa 62.451.864.992 bytes (unos 62,45 GB), por lo que la carga completa en memoria requiere al menos esa cantidad, más el espacio para el contexto y los buffers de cómputo.
- GPU recomendadas: no disponibles de forma explícita. El entorno documentado es un AMD Strix Halo (gfx1151) con memoria unificada y ROCm 7.2.4, que es donde el autor convirtió y midió el modelo. Para GPU discreta se necesitaría un acelerador con al menos 62,5 GB de VRAM, lo que excluye las tarjetas de consumo habituales para esta variante concreta.
- Cabe en GPU de consumo: no para este fichero BF16. Los tiers ROCmFP4 del repositorio hermano, al estar cuantizados, reducirían el requisito, aunque no se dispone de cifras exactas en la información proporcionada.
- Opciones de despliegue: llama.cpp con un fork que registre la arquitectura `xing4`. El modelo no carga en llama.cpp upstream. No hay confirmación de soporte en vLLM, Ollama, TGI ni otros servidores de inferencia.
- Latencia y throughput estimados: no disponibles. El único parámetro de rendimiento documentado es la perplejidad, no la velocidad de generación.

## Comparativa con modelos similares

La informacion disponible no incluye datos de rendimiento de modelos comparables, por lo que la comparacion se limita a lo que se puede verificar entre el modelo base y sus derivados.

| Modelo | Parametros totales | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| kingjones777/Xing4.0-29B-A4B-BF16-GGUF | 31.215.031.088 | no disponible | GGUF BF16 | apache-2.0 | Conversion del modelo base; fuente de los tiers ROCmFP4 |
| XingChen-AGI/Xing4.0-29B-A4B | no disponible | no disponible | safetensors (presumiblemente) | apache-2.0 | Modelo base original; referencia de perplejidad 8,425 |
| kingjones777/Xing4.0-29B-A4B-ROCmFP4-GGUF | no disponible | no disponible | GGUF ROCmFP4 | apache-2.0 | Tiers cuantizados derivados del BF16 de este repositorio |

No se dispone de datos verificables de alternativas de la misma categoria (por ejemplo, otros MoE abiertos de tamano similar) en la informacion proporcionada, por lo que no se incluyen comparaciones de rendimiento ni de contexto.

## Limitaciones y advertencias

- Adopcion practicamente nula: el repositorio registra 0 descargas y 1 like en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni de validacion por parte de terceros.
- Conversión de terceros: el repositorio lo publica kingjones777, no el autor original XingChen-AGI. La calidad del artefacto depende del proceso de conversion, no del equipo que entreno el modelo.
- Incompatibilidad con llama.cpp upstream: el fichero no se puede cargar con una build estandar. Requiere un fork con la arquitectura `xing4` registrada, lo que limita portabilidad, soporte y actualizaciones.
- Riesgo elevado de ports incorrectos: el propio autor advierte de que dos errores concretos (la epsilon de Sinkhorn y la traspuesta en `hc_expand`) producen salidas plausibles pero incorrectas en lugar de fallar. Cualquier port debe validarse con perplejidad.
- La comparacion de normas de tensores no es un validador fiable en esta arquitectura, segun documenta el autor.
- Contexto e idiomas sin especificar: no se indica la longitud de contexto soportada ni los idiomas cubiertos, lo que impide planificar despliegues con requisitos de ventana larga o multilingues.
- Sin benchmarks publicados: no hay MMLU, HumanEval, GSM8K ni evaluaciones de seguridad, sesgo o alucinacion para este modelo ni para su base en la informacion disponible.
- Riesgo de alucinacion: no se han documentado evaluaciones especificas, por lo que se asume el comportamiento tipico de un modelo de lenguaje generativo sin garantias.
- Sesgos conocidos: no disponible.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero se hereda del modelo base. La atribucion corresponde a XingChen-AGI. Conviene revisar la ficha del modelo original por si hubiera condiciones adicionales no reflejadas aqui.
- Capa MTP sin tensores `hc`: es una particularidad estructural que puede requerir tratamiento especifico en cualquier implementacion nueva.
- Trazabilidad de fechas: las fechas de creacion y actualizacion del repositorio aparecen como 2026-09-19, posteriores a la fecha habitual de consulta; conviene verificar su coherencia con el calendario real de publicacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kingjones777/Xing4.0-29B-A4B-BF16-GGUF
- Modelo base: https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B
- Repositorio de tiers cuantizados ROCmFP4: https://huggingface.co/kingjones777/Xing4.0-29B-A4B-ROCmFP4-GGUF
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo (los resultados devueltos corresponden a YouTube y no guardan relacion con el modelo).
