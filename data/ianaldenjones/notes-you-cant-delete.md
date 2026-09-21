# ianaldenjones/notes-you-cant-delete

## Resumen

Notes You Can't Delete es una coleccion de checkpoints de investigacion publicados por el usuario ianaldenjones en HuggingFace. No es un modelo unico, sino un conjunto de transformadores pequeños entrenados desde cero (arquitectura decoder-only tipo GPT, forma nanoGPT) sobre MIDI tokenizado con el esquema REMI. Cada checkpoint ronda los 25-26 millones de parametros y funciona como control emparejado o gemelo editado dentro de un estudio de interpretabilidad musical.

El objetivo del estudio es medir que ocurre cuando se elimina un concepto musical concreto (una nota, un acorde, un genero completo) de los datos de entrenamiento: el modelo resultante, que nunca ha visto ese concepto, tiende a reconstruirlo a partir de la gramatica que rodea el hueco. El autor reporta que la blue note reaparece al 97-98%, el tritono del metal al 99%, el acorde de septima dominante alrededor del 90% y el black metal por completo; la unica supresion que "funciona" es la de un rasgo genuinamente novedoso (el registro de sub-bajo del djent) que ningun otro elemento del corpus implica.

La relevancia actual es metodologica: ofrece un banco de pares controlados de coste muy bajo (modelos de ~25M de parametros, corpus publicos como Weimar Jazz Database, MAESTRO v3 y un volcado de MIDI de metal de Kaggle) para estudiar generalizacion, sesgo inductivo y fidelidad estructural en modelos generativos de musica simbolica. La licencia es MIT y el repositorio ocupa 1,9 GB, aunque no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT (forma nanoGPT), implementacion from-scratch de ~120 lineas |
| Parametros totales | ~25-26 millones por checkpoint |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (confirmado en `g_metal_band_s1`; no especificado para el resto de checkpoints) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en precision de entrenamiento; no hay versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el modelo opera sobre MIDI tokenizado con REMI, no sobre lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch state dict (`checkpoints/<nombre>/ckpt.pt`) acompanado de `config.json`; tokenizadores en `tokenizers/`; no hay safetensors ni GGUF |
| Tamano del repositorio | 1,9 GB |
| Libreria | PyTorch |
| Pipeline declarado en HuggingFace | text-generation (en la practica, generacion de musica simbolica) |
| Corpus de entrenamiento | Weimar Jazz Database, MAESTRO v3 y un volcado publico de MIDI de metal de Kaggle (PDDL) |

## Arquitectura y entrenamiento

Cada checkpoint es un transformer decoder-only de estilo GPT con la forma de nanoGPT, implementado desde cero en unas 120 lineas (`model.py`). La entrada no es texto sino MIDI tokenizado con REMI, de modo que el modelo aprende a predecir el siguiente token musical (nota, acorde, evento ritmico) condicionado por el historial. Los checkpoints se agrupan en familias con tokenizadores compartidos: por ejemplo, `g_metal_drums_s1` usa el tokenizador de `metal_band`. No se documenta en la informacion disponible el uso de RLHF, DPO ni fases de alineamiento posteriores al preentrenamiento supervisado.

El diseno experimental se basa en pares emparejados que difieren en un unico factor. En la rama de metal hay un modelo base de guitarra (`g_metal_s1`, 22.037 pistas de guitarra de metal, 163M de tokens, loss de validacion 0,23), un modelo de banda completa con guitarra, bajo y bateria (`g_metal_band_s1`, contexto 2048, 316M de tokens, loss de validacion 0,18), su gemelo con el tritono eliminado (`g_metal_deb5`), un baseline solo de bateria y afinados de tech-death y black metal, ademas de modelos con linaje recortado (`g_metal_minus_bm`, `g_metal_minus_dj`, `g_metal_minus_rand`). En la rama tonal hay pares de eliminacion e inyeccion de blue notes sobre el Weimar Jazz Database, un control clasico, un modelo con funcion tonal permutada (`remap_permuted_s0`), un modelo de representacion de melodia con acordes (`chordmel_s0`) y un piloto de eliminacion de septima dominante. La innovacion tecnica no reside en la arquitectura, sino en el protocolo de ablacion por concepto sobre datos controlados y en las pruebas de "expectativa" del concepto eliminado.

## Capacidades

- Generacion de musica simbolica en formato MIDI dentro de los estilos cubiertos por cada checkpoint: metal (guitarra, banda completa, solo de bateria, tech-death, black metal), jazz y clasica.
- Modelado de estructura musical implicita: el modelo asigna alta probabilidad a conceptos que nunca vio durante el entrenamiento (tritono al 99%, blue note al 97-98%, septima dominante ~90%).
- Generacion condicionada por contexto largo de hasta 2048 tokens musicales en los checkpoints que lo declaran.
- Representaciones alternativas del mismo material, como melodia con acordes (`chordmel_s0`) o funcion tonal permutada (`remap_permuted_s0`).
- Afinado fino por subgenero a partir de un modelo base, como demuestran `g_metal_td_s2` y `g_metal_bm_s3`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues de lenguaje natural.
- No se documenta vision, audio (mas alla de la representacion simbolica) ni modo de razonamiento explicito.

## Casos de uso

- Investigacion en interpretabilidad de modelos generativos: comparar pares control/gemelo para medir cuanto depende un modelo de un concepto concreto frente a la estructura que lo rodea, usando los checkpoints ya emparejados.
- Estudio de sesgos inductivos en musica simbolica: analizar por que el tritono se recupera al 99% en `g_metal_deb5` permite estudiar como las regularidades estadisticas del corpus imponen expectativas fuertes.
- Generacion de fragmentos de metal con bajo coste computacional: `g_metal_s1` o `g_metal_band_s1` permiten producir ideas de guitarra o de banda completa con 25-26M de parametros, ejecutables en cualquier GPU de consumo o incluso en CPU.
- Prototipado de herramientas de composicion asistida: usar los distintos afinados (tech-death, black metal) para explorar variaciones estilisticas sobre una misma idea musical.
- Docencia en cursos de deep learning musical: el repositorio incluye `model.py` (~120 lineas) y `generate_example.py`, lo que facilita reproducir el pipeline completo de tokenizacion REMI, entrenamiento y muestreo.
- Experimentos de ablacion de datos: reutilizar el protocolo de eliminacion de concepto (nota, acorde, genero) con otros corpus para validar si el fenomeno se replica fuera del metal, el jazz o la clasica.
- Base para pruebas de fidelidad estructural: verificar si un modelo pequeno mantiene coherencia tonal o ritmica en ventanas de 2048 tokens, como caso de referencia frente a modelos de mayor tamano.
- Estudio de representacion: comparar `chordmel_s0` frente a los modelos puramente melodicos para evaluar el efecto de anadir informacion armonica explicita.

## Benchmarks y rendimiento

Los unicos numeros publicados en la informacion disponible son las perdidas de validacion de dos checkpoints y los porcentajes de "expectativa" del concepto eliminado. No hay resultados de MMLU, HumanEval, GSM8K ni de benchmarks estandar de musica, ya que el modelo no es de lenguaje natural.

| Metrica | Valor | Checkpoint |
|---|---|---|
| Loss de validacion | 0,23 | `g_metal_s1` (guitarra de metal) |
| Loss de validacion | 0,18 | `g_metal_band_s1` (banda completa) |
| Recuperacion del tritono | 99% | `g_metal_deb5` (tritono eliminado) |
| Recuperacion de la blue note | 97-98% | `blues_deblue_s0` (blue note eliminada) |
| Recuperacion de la septima dominante | ~90% | `p1_dom7_drop` |
| Recuperacion del black metal | completa | `g_metal_minus_bm` (genero eliminado) |
| Supresion efectiva | solo en el sub-bajo del djent | `g_metal_minus_dj` |

No se han publicado resultados de benchmarks comparativos adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, unos 100 MB de pesos para 25-26M de parametros; en fp16, unos 50 MB. El consumo real depende del tamano del batch y de la longitud de contexto (hasta 2048 tokens en los checkpoints que lo declaran).
- GPU recomendadas: cualquier GPU moderna, incluidas GTX 1060, RTX 3060, RTX 4090; el modelo tambien puede ejecutarse en CPU sin problema por su tamano.
- Cabe holgadamente en GPU de consumo e incluso en entornos integrados o portatiles sin GPU dedicada.
- Opciones de despliegue: el propio repositorio proporciona `generate_example.py` sobre PyTorch, con dependencias `torch`, `numpy`, `miditok`, `symusic` y `huggingface_hub`. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, al no distribuirse pesos en GGUF ni safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. Los checkpoints de este repositorio se comparan entre si como pares control/gemelo dentro del mismo estudio, pero no se publican tablas frente a otros modelos de musica simbolica. La comparativa con alternativas externas queda, por tanto, como no disponible.

## Limitaciones y advertencias

- Escala muy reducida: 25-26M de parametros, pensado para experimentos controlados, no para produccion musical de calidad.
- Dominio restringido: solo musica simbolica MIDI tokenizada con REMI; no procesa ni genera lenguaje natural, imagenes ni audio.
- Idiomas y cobertura: no se declaran idiomas soportados; la cobertura estilistica se limita a los corpus de entrenamiento (metal, jazz y clasica).
- Riesgo de sobreajuste estilistico: al entrenarse sobre corpus concretos, la salida tiende a reproducir las convenciones de esos estilos y puede resultar poco diversa.
- El fenomeno central del estudio (recuperacion del concepto eliminado) se interpreta como expectativa estadistica del modelo; no implica comprension musical ni justifica extrapolar conclusiones a modelos de mayor tamano sin replicacion.
- Advertencia del propio autor: los modelos son de escala pequena y entrenados desde cero, y las salvedades metodologicas se detallan en el sitio del estudio.
- Licencia MIT: permite uso comercial y modificacion, pero el repositorio no incluye garantias ni documentacion de sesgos, y no se especifican las condiciones de los corpus de terceros (Weimar Jazz Database, MAESTRO v3, volcado de Kaggle) que deberian respetarse por separado.
- Repositorio sin descargas ni likes registrados: no hay validacion externa ni comunidad que haya verificado los resultados de forma independiente.
- Los pesos se distribuyen como state dict de PyTorch, por lo que requieren cargar el `config.json` y el codigo del repositorio; no son directamente compatibles con runtimes de inferencia estandar.

## Enlaces

- HuggingFace: https://huggingface.co/ianaldenjones/notes-you-cant-delete
- Sitio del estudio (memoria completa, audio y resultados numericos): https://notes-you-cant-delete.vercel.app
- Repositorio en HuggingFace, archivos incluidos: `generate_example.py`, `model.py`, `checkpoints/<nombre>/ckpt.pt`, `config.json` y `tokenizers/`
- La busqueda web realizada no devolvio enlaces tecnicos relevantes sobre este modelo; los unicos resultados fueron paginas generales de Wikipedia, sin relacion con el modelo.
