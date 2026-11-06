# mrsirg97-rgb/osmos-evo-1017

## Resumen

`osmos-evo-1017` es un repositorio auxiliar publicado por el usuario mrsirg97-rgb en Hugging Face que no contiene pesos de modelo, sino los artefactos necesarios para ejecutar DeepSeek-V4.1-Flash-1017 con el motor de inferencia `libosmos` sobre una APU AMD Strix Halo (Ryzen AI Max+ 395, gfx1151, 128 GB de memoria unificada). Concretamente, empaqueta el drafter de decodificacion especulativa DSpark de DeepSeek, requantizado a IQ2_XS, junto con tablas de seleccion de expertos por capa calculadas sobre texto de calibracion para las cuantizaciones UD-IQ1_S y UD-IQ1_M de unsloth.

El problema que resuelve es de ingenieria de despliegue: en hardware con memoria unificada y ancho de banda limitado como Strix Halo, colocar el drafter y los expertos del modelo base en el mismo espacio de memoria compite por recursos. El autor reduce el drafter de 7,97 GB a 4,68 GB mediante requantizacion de sus 3 x 128 expertos con los cuantizadores de ggml, y anade ficheros de "picks" que indican que expertos prioriza el router en cada capa, de modo que `libosmos` pueda decidir que mantener residente en la GPU.

Es relevante ahora porque documenta una via practica para servir un modelo MoE de gran tamano en hardware de consumo profesional, con metricas de decodificacion medidas y reproducibles, y porque todo el pipeline (pesos base, empaquetado, requantizacion) es MIT. El repositorio ocupa 4,7 GB y no incluye los pesos del modelo base, que el instalador descarga desde sus repositorios originales fijados a un commit y a un SHA-256.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (modelo base DeepSeek-V4.1-Flash-1017) con drafter de decodificacion especulativa DSpark (3 bloques `mtp`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (packs `ud-iq1_s` y `ud-iq1_m`) |
| Tipos de cuantizacion | UD-IQ1_S (pack speed) y UD-IQ1_M (pack quality) para los pesos del modelo; drafter con expertos en IQ2_XS, matrices densas Q8_0, cabezas en BF16; tabla Engram en MXFP8 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (pesos de unsloth) mas ficheros binarios propios del repo (`dspark.bin`, `dspark.json`, `osmos-picks.bin`) |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo: distribuye artefactos derivados de DeepSeek-V4.1-Flash-1017, un modelo MoE de DeepSeek. El componente principal es el drafter DSpark, correspondiente a los tres bloques `mtp` del modelo original (ficheros `model-00044` a `model-00046`). El empaquetado lo realiza `tools/ds4/drafter_pack.py` de Project Maya, que deja las matrices densas en Q8_0 y los expertos en MXFP4; despues, `tools/requant/requant_dspark` de osmos requantiza los 3 x 128 expertos a IQ2_XS con los cuantizadores de ggml (llama.cpp), reduciendo el drafter de 7,97 GB a 4,68 GB y liberando memoria de GPU para los expertos del modelo base. Las cabezas se mantienen en BF16.

El segundo componente son los ficheros `osmos-picks.bin`, de 122.880 bytes cada uno, que registran por capa que expertos selecciona el router con mas frecuencia sobre texto de calibracion, para las cuantizaciones UD-IQ1_S y UD-IQ1_M. `libosmos` los usa para decidir que expertos mantiene primero en memoria de GPU, con un presupuesto que dimensiona automaticamente segun la memoria libre al arrancar (`--budget auto`). El repositorio incluye ademas una variante abliterated opcional como overlay (`--abliterated`) basada en el parche de huihui-ai (MIT), aplicada en tiempo de carga y desactivada por defecto.

## Capacidades

- Decodificacion especulativa: el drafter DSpark permite generar varios tokens por paso y validarlos contra el modelo objetivo, con incrementos medidos de 18,8 a 37,5 tok/s en el pack `ud-iq1_s` y de 16,0 a 28,6 tok/s en `ud-iq1_m`.
- Contexto largo: los packs configuran 1.048.576 tokens de ventana, adecuado para documentos extensos y conversaciones multi-turno largas.
- Reproducibilidad bit a bit de la salida en decodificacion greedy, segun el autor.
- Gestion dinamica de memoria: ajuste del presupuesto de expertos en GPU al arrancar segun memoria libre.
- Overlay de abliteration opcional para eliminar rechazos del modelo base, aplicado solo si se solicita.
- Las capacidades funcionales (razonamiento, codigo, matematicas, tool calling, multilingue) heredan las del modelo base DeepSeek-V4.1-Flash-1017; la model card de este repositorio no las detalla, por lo que no se dispone de listado especifico.

## Casos de uso

- Inferencia local de un MoE grande en una APU Strix Halo: el pack `ud-iq1_s` permite servir DeepSeek-V4.1-Flash-1017 en un Ryzen AI Max+ 395 con 128 GB de memoria unificada, sin GPU discreta, a unas decenas de tokens por segundo.
- Procesamiento de documentos muy largos: con 1.048.576 tokens de contexto se pueden analizar expedientes, bases de codigo o transcripciones completas en una sola pasada, algo inviable en modelos con ventanas de 32K o 128K.
- Asistentes conversacionales de larga duracion: el contexto extendido mantiene el historial completo de una sesion sin truncado ni resumen intermedio.
- Evaluacion de decodificacion especulativa: el repositorio sirve como referencia reproducible para medir el impacto de un drafter requantizado en latencia y throughput, con comandos y cifras publicados.
- Despliegue en entornos con restricciones de energia: el autor reporta que osmos completa el bench de 4 agentes de Project Maya en un 20 % menos de tiempo con un 13 % menos de energia por token respondido frente a Maya 1.1.53, lo que resulta util en estaciones de trabajo alimentadas por bateria o con presupuesto termico ajustado.
- Investigacion sobre seleccion de expertos: los ficheros `osmos-picks.bin` permiten estudiar el comportamiento del router por capa y experimentar con politicas de residencia de expertos en memoria.
- Variantes sin rechazos: el overlay `--abliterated` habilita casos de uso creativos o de investigacion donde los rechazos del modelo base resultan un obstaculo, manteniendo la opcion desactivada por defecto.

## Benchmarks y rendimiento

| Metrica | ud-iq1_s (speed) | ud-iq1_m (quality) |
|---|---|---|
| Decodificacion simple (tok/s) | 18,8 | 16,0 |
| Decodificacion con drafter (tok/s) | 37,5 | 28,6 |
| Rango con drafter segun prompt (tok/s) | 27 a 48 | no disponible |
| Contexto (tokens) | 1.048.576 | 1.048.576 |

Condiciones declaradas por el autor: decodificacion greedy, media de tres prompts de 256 tokens, dos rondas intercaladas sobre una maquina en reposo. Frente a Project Maya 1.1.53 sobre los mismos ficheros, osmos lee prompts un 26 % mas rapido a 2K y un 11-12 % mas rapido a 8K, drafter un 6-8 % mas rapido y ejecuta el bench de 4 agentes de Maya en un 20 % menos de tiempo con un 13 % menos de energia por token; la decodificacion simple queda empatada. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: el escenario objetivo es una APU AMD Strix Halo con 128 GB de memoria unificada (Ryzen AI Max+ 395, gfx1151). El repositorio en si ocupa 4,7 GB, pero los pesos del modelo base se descargan aparte y no se indica su tamano total.
- GPU recomendadas: AMD Strix Halo (gfx1151) es el objetivo declarado. No se documenta soporte para A100, H100 ni RTX 4090.
- GPU de consumo: el modelo esta pensado para memoria unificada de 128 GB; no se indica que quepa en GPU de consumo con VRAM discreta.
- Despliegue: motor `libosmos` (https://github.com/mrsirg97-rgb/libosmos), instalado con `python3 tools/install/osmos_install.py ud-iq1_s --serve` o `--rig`. Los pesos se obtienen de los GGUF de unsloth; no se mencionan vLLM, llama.cpp, Ollama ni TGI como alternativas de ejecucion para estos packs.
- Latencia y throughput: 18,8 tok/s en simple y 37,5 tok/s con drafter para `ud-iq1_s`; 16,0 y 28,6 tok/s para `ud-iq1_m`, en las condiciones descritas arriba.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| osmos-evo-1017 (packs sobre DeepSeek-V4.1-Flash-1017) | no disponible | 1.048.576 | 18,8 / 37,5 tok/s (IQ1_S); 16,0 / 28,6 tok/s (IQ1_M) | MIT | Hugging Face, 0 descargas |
| DeepSeek-V4.1-Flash-1017 (modelo base) | no disponible | no disponible | no disponible | MIT | Hugging Face (deepseek-ai) |
| Project Maya 1.1.53 (motor comparado por el autor) | no aplica (motor) | no disponible | 26 % mas lento leyendo a 2K, 11-12 % a 8K; drafter 6-8 % mas lento | no disponible | no disponible |

No se dispone de datos de otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene los pesos del modelo: sin ejecutar el instalador y descargar los GGUF de unsloth y el modelo base, no es funcional por si solo.
- Las cifras de rendimiento las publica el autor del repositorio y no se han verificado de forma independiente; dependen del prompt, del estado de la maquina y de la version de `libosmos`.
- El objetivo de hardware es muy especifico (Strix Halo, gfx1151, 128 GB); no hay evidencia de funcionamiento en otras plataformas.
- Las cuantizaciones UD-IQ1_S y UD-IQ1_M son de muy baja precision (1 bit por peso en el segundo caso), lo que puede degradar la calidad frente a los pesos originales; el autor no publica evaluaciones de calidad.
- El overlay abliterated elimina los rechazos del modelo base y puede producir contenido inapropiado; debe revisarse antes de cualquier uso en produccion.
- No se documentan sesgos, idiomas soportados ni tasas de alucinacion del modelo base en esta model card.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- La licencia MIT se aplica al empaquetado y a los derivados, pero conviene verificar las condiciones del modelo base y de los GGUF de unsloth antes de un uso comercial.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mrsirg97-rgb/osmos-evo-1017
- Modelos del autor: https://huggingface.co/mrsirg97-rgb/models
- Motor libosmos: https://github.com/mrsirg97-rgb/libosmos
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Parche de abliteration de huihui-ai: no disponible (enlace no proporcionado)
- Project Maya: no disponible (enlace no proporcionado)
