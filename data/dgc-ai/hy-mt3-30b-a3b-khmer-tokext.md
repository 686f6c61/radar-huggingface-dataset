# DGC-AI/Hy-MT3-30B-A3B-khmer-tokext

## Resumen

Hy-MT3-30B-A3B-khmer-tokext es una especializacion del modelo de traduccion Hy-MT3-30B-A3B de Tencent, desarrollada por DGC-AI para mejorar el rendimiento en jemer (khmer). El modelo base es un transformer de tipo Mixture of Experts (MoE) con 30.000 millones de parametros totales y 3.000 millones activos, disenado originalmente para traduccion automatica multilingue. Esta version anade 4.096 piezas nuevas al tokenizador especificas para jemer, con el objetivo de reducir el coste computacional de generar texto en ese idioma.

El problema que resuelve es concreto: el tokenizador original del Hy-MT3-30B-A3B consume aproximadamente 1,5 tokens por cada caracter jemer, lo que ralentiza enormemente la generacion. Con las nuevas piezas, el coste baja a unos 0,31 tokens por caracter, lo que se traduce en una mejora de velocidad de 2,7 veces y, segun el autor, tambien en una mejora de calidad de traduccion. El modelo se distribuye en formato transformers (bf16, 57 GB) y en GGUF cuantizado Q4_K_M (18,2 GB) para llama.cpp.

La relevancia actual radica en que el jemer es un idioma con recursos limitados y una tokenizacion ineficiente en la mayoria de modelos multilingues. Esta ficha es util para desarrolladores que necesiten traduccion ingles-jemer o jemer-ingles con latencia reducida y que quieran evaluar si el modelo cumple sus requisitos de calidad y hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) |
| Parametros totales | 30.000 millones (aproximado, segun nombre del modelo) |
| Parametros activos | 3.000 millones (aproximado, segun nombre del modelo) |
| Longitud de contexto | 32.768 tokens (configurado en llama-server con `-c 32768`) |
| Tipos de cuantizacion | Q4_K_M (GGUF); bf16 en transformers |
| Idiomas soportados | km (jemer), en (ingles), fr (frances), zh (chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) y GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 30.000 millones de parametros totales y 3.000 millones activos, aunque la model card no detalla la configuracion exacta de expertos ni el numero de capas. La especializacion se realizo en tres fases. Primero, se amplio el tokenizador con 4.096 piezas nuevas (ids 120818-124913), pasando de un vocabulario de 120.818 a 124.914. El metodo consistio en continuar el entrenamiento BPE desde el tokenizador original: se ejecuto el tokenizador base sobre texto jemer, se aprendieron nuevas fusiones sobre su salida y se anadieron despues de las fusiones originales, que mantienen su rango y siempre se aplican primero. Solo se conservaron fusiones cuyo resultado contuviera bytes jemer, y ninguna pieza supera los 6 caracteres jemer (18 bytes). El corpus para aprender las piezas fue de 600.000 lineas jemer de un dataset ingles-jemer mas el lado jemer de 150.674 pares filtrados.

En segundo lugar, se inicializaron las nuevas filas de las matrices de embedding de entrada y de salida (que son matrices separadas) como la media de las filas de los tokens base que componen cada pieza, reescalada a la norma media de esas filas. En tercer lugar, el entrenamiento se dividio en dos etapas: la etapa 1 entreno solo las 4.096 filas nuevas de ambas matrices durante 600 pasos con learning rate 1e-4; la etapa 2 aplico LoRA (r=64, alpha=128, dropout=0,05) sobre las capas de atencion (`q_proj, k_proj, v_proj, o_proj`, 192 capas) y entreno ambas matrices completas durante 8.000 pasos, con learning rate 2e-4 para LoRA y 1e-4 para las matrices. Se uso AdamW, weight decay 0, gradient clipping 1,0, warmup del 10% de los pasos y decaimiento coseno hasta el 10% del pico. Los lotes fueron de hasta 2.500 tokens, agrupados por longitud, con pesos en bf16. El LoRA se fusiono en los pesos tras el entrenamiento.

## Capacidades

- Traduccion automatica ingles-jemer y jemer-ingles, con calidad medida en chrF y BLEU.
- Traduccion desde y hacia frances y chino, aunque no se han publicado resultados de evaluacion para estos pares.
- Generacion de texto con plantilla de chat que desactiva el razonamiento (reasoning off) y anade los tokens especiales.
- Tokenizacion eficiente de jemer: 0,31 tokens por caracter frente a 1,52 del modelo original.
- Compatibilidad con llama.cpp mediante el formato GGUF y con transformers mediante `AutoModelForCausalLM`.
- Soporte de decodificacion greedy y muestreo con temperatura y top_p configurables.
- No se menciona soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Traduccion de noticias y articulos ingles-jemer: el modelo puede traducir textos periodisticos con una calidad medida de 54,4 chrF en NTREX-128, superior a Google Translate (55,2) en el mismo conjunto, y con una velocidad 2,7 veces mayor que el modelo original gracias al tokenizador optimizado.
- Localizacion de documentacion tecnica al jemer: para equipos que necesiten traducir manuales o guias al jemer, el modelo permite procesar lotes grandes con 32.768 tokens de contexto y decodificacion greedy para evitar fallos de UTF-8.
- Atencion al cliente en jemer: el modelo puede gestionar conversaciones multi-turno en jemer e ingles, aunque requiere probar previamente la estabilidad de la salida a temperaturas altas y aplicar reintentos ante fallos HTTP 500.
- Traduccion inversa jemer-ingles para analisis de contenido: con 64,1 chrF++ y 44,4 BLEU en el conjunto de 200 pares, es adecuado para procesar reseñas, comentarios o redes sociales en jemer y analizarlos en ingles.
- Pipeline de subtitulado o transcripcion: la velocidad de 73 segundos para 400 traducciones en una RTX 3090 con 8 peticiones en paralelo permite integrar el modelo en flujos de postproduccion o transcripcion que requieran traduccion jemer-ingles.
- Investigacion en traduccion automatica de bajos recursos: el modelo sirve como base para experimentos de tokenizacion adaptada, ya que documenta el proceso completo de extension del vocabulario y las etapas de entrenamiento.
- Despliegue en hardware de consumo: la cuantizacion Q4_K_M de 18,2 GB cabe en una GPU de 24 GB como la RTX 3090, lo que permite ejecutar traduccion jemer en estaciones de trabajo sin infraestructura de datacenter.

## Benchmarks y rendimiento

Los resultados publicados comparan el modelo con el Hy-MT3-30B-A3B original, ambos en GGUF Q4_K_M bajo llama.cpp en una RTX 3090 con 8 peticiones en paralelo. La metrica chrF para jemer usa `word_order=0`.

| Prueba | Hy-MT3-30B-A3B original | Este modelo |
|---|---|---|
| NTREX-128 ingles→jemer, 100 filas, chrF (greedy) | 51,1 | 54,4 |
| 200 pares reservados, ingles→jemer, chrF (temp. 0,7) | 58,9 | 59,6 |
| 200 pares reservados, jemer→ingles, chrF++ (temp. 0,7) | 62,7 | 64,1 |
| 200 pares reservados, jemer→ingles, BLEU (temp. 0,7) | 32,4 | 44,4 |
| Tiempo para la prueba de 200 pares (400 traducciones) | 197 s | 73 s |
| Salidas fallidas en la prueba de 200 pares | 0 | 1 |

Como referencia en las mismas filas de NTREX: Google Translate obtiene 55,2, el Hy-MT3-7B original (Q8) obtiene 51,5 y el Hy-MT3-1.8B original obtiene 51,7.

## Requisitos de hardware

- VRAM estimada para inferencia: 18,2 GB para la cuantizacion Q4_K_M en GGUF; 57 GB para los pesos bf16 en transformers.
- GPU recomendadas: RTX 3090 (24 GB) validada por el autor para Q4_K_M; para bf16 se requiere una GPU con al menos 60 GB, como A100 80 GB o H100.
- Cabe en GPU de consumo: si, la version Q4_K_M cabe en RTX 3090, RTX 4090 (24 GB) y GPUs con 24 GB o mas. La version bf16 no cabe en GPUs de consumo.
- Opciones de despliegue: llama.cpp (probado con build 10675, commit 90c26fcd4) mediante `llama-server`; transformers con `AutoModelForCausalLM`. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: 73 segundos para 400 traducciones (200 pares) con 8 peticiones en paralelo en una RTX 3090, lo que equivale a aproximadamente 5,5 traducciones por segundo en ese escenario. No se midio la velocidad con una sola peticion.
- La conversion de pesos transformers a GGUF requiere un `convert_hf_to_gguf.py` parcheado, ya que llama.cpp identifica el pre-tokenizador por una huella de tokenizacion que cambia con las nuevas piezas jemer; el pre-tokenizador en si no cambia y se responde con `hunyuan-dense`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (NTREX-128 en→km, chrF) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DGC-AI/Hy-MT3-30B-A3B-khmer-tokext | 30B totales, 3B activos (MoE) | 32.768 tokens | 54,4 | Apache 2.0 | Hugging Face, GGUF Q4_K_M |
| tencent/Hy-MT3-30B-A3B (original) | 30B totales, 3B activos (MoE) | no disponible | 51,1 | no disponible | Hugging Face |
| tencent/Hy-MT3-7B (Q8) | 7B | no disponible | 51,5 | no disponible | Hugging Face |
| tencent/Hy-MT3-1.8B | 1,8B | no disponible | 51,7 | no disponible | Hugging Face |

No se dispone de datos de contexto, licencia ni otras metricas de los modelos Hy-MT3 originales en la informacion proporcionada. Google Translate obtiene 55,2 chrF en el mismo conjunto, pero no es un modelo de pesos abiertos y no se compara en la tabla por carecer de parametros y licencia equiparables.

## Limitaciones y advertencias

- Una de cada 400 salidas muestreadas fue defectuosa: a temperatura 0,7 y top_p 1,0 una salida jemer contuvo bytes UTF-8 invalidos y llama-server respondio con HTTP 500. Se recomienda decodificacion greedy o un top_p mas bajo, y reintentar peticiones fallidas. La frecuencia de este fallo no se midio mas alla de esa ejecucion.
- La mejora en NTREX es en parte por ventaja de dominio: 200.000 pares de noticias de la misma fuente que el test NTREX estaban en los datos de entrenamiento, aunque las 100 frases de test se excluyeron.
- No se probaron otros idiomas: el entrenamiento incluyo datos de replay para mantenerlos estables, pero no se verifico ninguna salida en idiomas distintos del jemer y el ingles. Es necesario probar antes de usar el modelo para frances o chino.
- Los pares frances y chino estaban en el entrenamiento, pero solo existe puntuacion de test para ingles↔jemer.
- Los conjuntos de test son pequenos: 100 filas de NTREX y 200 pares del dataset. Diferencias cercanas a 1 punto en las filas muestreadas son ruido.
- Solo se puntuo el archivo Q4_K_M; los pesos en transformers no se evaluaron directamente.
- No se midio la velocidad con una sola peticion.
- No habia espacios de ancho cero (U+200B) en los datos de entrenamiento; es necesario eliminarlos del texto jemer de entrada antes de traducir.
- El jemer de noticias en los datos de entrenamiento es traduccion automatica (Google Translate), lo que puede introducir sesgos y artefactos del traductor original.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones especificas de sesgo o alucinacion en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda validar la calidad en el dominio concreto antes de desplegar en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DGC-AI/Hy-MT3-30B-A3B-khmer-tokext
- Modelo base: https://huggingface.co/tencent/Hy-MT3-30B-A3B
- Repositorio de llama.cpp (build 10675, commit 90c26fcd4): no disponible como enlace directo en la informacion proporcionada
- Paper o blog del modelo base: no disponible en la informacion proporcionada
- Demo o espacio interactivo: no disponible en la informacion proporcionada
