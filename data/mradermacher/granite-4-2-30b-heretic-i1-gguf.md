# mradermacher/granite-4.2-30b-heretic-i1-GGUF

## Resumen

`mradermacher/granite-4.2-30b-heretic-i1-GGUF` es una cuantizacion GGUF del modelo `stuarch/granite-4.2-30b-heretic`, publicada por el usuario mradermacher, especializado en la conversion de pesos a formatos ligeros para inferencia local. El modelo base pertenece a la familia Granite de IBM, en su version 4.2 con aproximadamente 29.276 millones de parametros. La variante "heretic" hace referencia a un ajuste fino orientado a reducir los rechazos y el comportamiento excesivamente cauteloso del modelo original, un tipo de intervencion que se ha popularizado en la comunidad open source.

El repositorio contiene unicamente pesos cuantizados en formato GGUF, generados con tecnicas de cuantizacion ponderada e imatrix, lo que permite ejecutar el modelo en hardware de consumo con perdidas de calidad controladas. No se trata de un modelo nuevo entrenado desde cero, sino de una distribucion de pesos derivada, por lo que las capacidades subyacentes corresponden al modelo Granite 4.2 de 30B sobre el que se aplico el ajuste heretic.

La relevancia de esta ficha radica en que permite evaluar rapidamente si esta cuantizacion concreta encaja en un despliegue local: ofrece un abanico amplio de niveles de cuantizacion (desde IQ1 hasta Q6_K), un tamano de repositorio de 10,9 GB y compatibilidad con el ecosistema llama.cpp/Ollama. La informacion publicada por el autor es muy escasa (sin model card descriptiva, sin licencia declarada, sin idiomas), por lo que muchos campos de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Granite 4.2 de IBM; arquitectura transformer, sin confirmar en la informacion proporcionada) |
| Parametros totales | 29.276.770.304 (~29,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ3_M, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones ponderadas/imatrix) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura en la documentacion proporcionada. El modelo deriva de Granite 4.2 30B de IBM, pero la model card del repositorio no describe capas, tipo de atencion, ni configuracion de entrenamiento. El autor indica que se trata de cuantizaciones "weighted/imatrix" del modelo `stuarch/granite-4.2-30b-heretic`, generadas con `convert_type: hf` y `quantize_version: 2`, lo que sugiere un pipeline de conversion desde pesos Hugging Face a GGUF mediante herramientas del ecosistema llama.cpp con calibracion imatrix.

El ajuste "heretic" del modelo base no se documenta en esta ficha: no se especifican los datos de entrenamiento, el numero de tokens, la composicion del dataset ni si hubo RLHF, DPO u otra tecnica de alineacion. Tampoco se detalla ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.) en la informacion disponible.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` del repositorio indica que el modelo esta orientado a dialogos multi-turno.
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base Granite 4.2 30B, aunque no se detallan en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Modo "thinking" o vision/audio: no disponible en la informacion proporcionada.
- Comportamiento "heretic": el ajuste del modelo base busca reducir rechazos y respuestas excesivamente restrictivas, aunque no se documenta el metodo exacto.

## Casos de uso

- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M o Q5_K_M permiten ejecutar un modelo de ~29B en GPUs de consumo con 24 GB de VRAM, usando llama.cpp u Ollama para prototipado y pruebas offline.
- Asistente conversacional autoalojado: el tag `conversational` y el ajuste heretic lo hacen adecuado para chatbots internos donde se quiere evitar un exceso de rechazos en consultas legitimas, siempre que se revise el contenido generado.
- Generacion de codigo en entornos aislados: al ser un GGUF ejecutable localmente, puede integrarse en pipelines de desarrollo sin enviar codigo a servicios externos, usando el nivel de cuantizacion que mejor equilibre calidad y latencia.
- Experimentacion con cuantizaciones: el repositorio ofrece mas de 20 variantes (IQ1 a Q6_K), lo que permite medir el impacto de la cuantizacion en calidad y velocidad sobre el mismo modelo base.
- Investigacion sobre alineacion y rechazos: la variante heretic sirve para estudiar como cambia el comportamiento del modelo al reducir sesgos de rechazo, comparandolo con el Granite 4.2 original.
- Fine-tuning posterior sobre GGUF: aunque el formato GGUF no es el ideal para entrenamiento, las variantes de mayor precision (Q6_K) pueden servir como referencia para evaluar destilacion o ajustes ligeros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion. Las variantes Q4_K_M rondarian los 17-18 GB, Q5_K_M en torno a 20-21 GB y Q6_K cerca de 24 GB; las variantes IQ2/IQ1 quedarian por debajo de 10 GB. Estas cifras son estimaciones basadas en el numero de parametros y no estan confirmadas en la informacion proporcionada.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para cuantizaciones Q4/Q5; A100 40/80 GB o H100 para Q6_K y para mayor throughput.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB o mas para cuantizaciones medias; las variantes IQ2/IQ3 podrian caber en GPUs de 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia estandar.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| granite-4.2-30b-heretic-i1-GGUF (este) | ~29,3B | no disponible | no disponible | GGUF | Cuantizacion comunitaria, sin benchmarks publicados |
| Granite 4.2 30B (original IBM) | ~29,3B | no disponible | no disponible en esta ficha | safetensors/GGUF | Modelo base sin ajuste heretic |
| stuarch/granite-4.2-30b-heretic | ~29,3B | no disponible | no disponible | safetensors | Modelo fuente del ajuste heretic |
| Otras cuantizaciones GGUF de Granite 30B | ~29,3B | no disponible | no disponible | GGUF | Alternativas de otros conversores (p. ej. bartowski) |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- La model card no declara licencia; antes de uso comercial es imprescindible verificar la licencia del modelo base Granite 4.2 de IBM y del ajuste heretic de stuarch.
- El ajuste "heretic" reduce los rechazos del modelo, lo que puede aumentar el riesgo de generar contenido inapropiado o inseguro; requiere filtros y revision en produccion.
- No se documentan idiomas soportados ni longitud de contexto; no se debe asumir un contexto largo sin verificarlo.
- Las cuantizaciones de baja precision (IQ1, IQ2) degradan notablemente la calidad; para uso serio se recomienda Q4_K_M o superior.
- No hay benchmarks publicados para esta cuantizacion concreta; el rendimiento real debe medirse en el hardware objetivo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria.
- Riesgo de alucinacion inherente a los modelos de lenguaje de este tamano; no se han publicado evaluaciones especificas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/granite-4.2-30b-heretic-i1-GGUF
- Modelo fuente del ajuste heretic: https://huggingface.co/stuarch/granite-4.2-30b-heretic
- Familia Granite de IBM (referencia general): https://huggingface.co/ibm-granite
- Herramientas de cuantizacion llama.cpp: https://github.com/ggerganov/llama.cpp
