# BAHATIBlaise/ethine

## Resumen

Ethine es un modelo de lenguaje de tipo transformer decoder-only entrenado desde cero por el desarrollador independiente BAHATI Blaise. Se trata de un experimento de investigación, no de un producto orientado a uso real: su variante Tiny cuenta con 1.328.256 parámetros totales (803.968 no asociados a embeddings), una anchura de 128, 4 capas y una longitud de contexto de únicamente 256 tokens. El modelo sigue la receta de la familia Llama (RMSNorm pre-norm, RoPE con base 10000, SwiGLU y embeddings atados) y se distribuye bajo licencia MIT.

El objetivo declarado del proyecto es responder a una pregunta de investigación sobre la construcción de modelos asistida por IA, no ofrecer capacidades útiles de generación. Ethine se entrenó íntegramente en CPU (un Intel i7-6500U con 2 núcleos físicos y sin GPU) sobre 4.875.510 tokens procedentes de 20 obras de dominio público de Project Gutenberg, correspondientes a prosa literaria en inglés de los siglos XIX y principios del XX. El idioma soportado es únicamente el inglés.

Su relevancia actual es fundamentalmente metodológica y didáctica: documenta de forma exhaustiva el pipeline completo (tokenizador, datos, entrenamiento, evaluación y procedencia de pesos) y compara su rendimiento con líneas base de n-gramas en lugar de con benchmarks estándar. A esta escala, tareas como MMLU, GSM8K o HumanEval quedan al nivel del azar por limitación matemática del número de parámetros, y el propio autor lo reconoce explícitamente en la model card. El mensaje principal del proyecto es que un modelo de 1,3 millones de parámetros puede superar a un trigrama bien suavizado en texto no visto, algo que una tabla de consulta de n-gramas no puede hacer porque no generaliza a contextos no observados literalmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, receta familia Llama (pre-norm, RMSNorm, RoPE base 10000, SwiGLU, atencion causal multi-cabeza completa, sin biases, embeddings atados) |
| Parametros totales | 1.328.256 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | no disponible |

Datos adicionales de configuracion de la variante Tiny: parametros no asociados a embeddings 803.968; vocabulario 4.096; anchura del modelo (d_model) 128; capas 4; cabezas de atencion 4 (dimension por cabeza 32); anchura feed-forward 352; dropout 0,0; precision float32. Composicion de parametros: embeddings 39,5 %, feed-forward 40,7 %, atencion 19,7 %, normas 0,1 %.

## Arquitectura y entrenamiento

Ethine es un transformer decoder-only con colocacion pre-norm y normalizacion RMSNorm, codificacion posicional rotatoria RoPE (base 10000), feed-forward con activacion SwiGLU y anchura `(8/3)·d`, atencion causal multi-cabeza completa y embeddings de entrada y salida atados. No emplea biases. El tokenizador es un BPE a nivel de byte entrenado desde cero, con vocabulario de 4.096 (8 tokens especiales + 256 bytes + 3.832 merges aprendidos) y hash `45531d41906f6f98`. Es sin perdida por construccion, ya que el alfabeto base cubre los 256 valores de byte y `<|unk|>` nunca se emite; la compresion medida es de 3,29 caracteres por token.

El entrenamiento se realizo con objetivo de modelado de lenguaje causal (entropia cruzada de siguiente token) sobre 4.875.510 tokens extraidos de 20 obras de dominio publico de Project Gutenberg (17.090.692 bytes brutos), divididos en 4.389.580 tokens de entrenamiento y 487.732 de validacion. El pipeline incluye descarga verificada por `Content-Length`, eliminacion del boilerplate de Gutenberg, normalizacion NFC, segmentacion por parrafos, filtro de calidad (99,9 % retenido), deteccion de ingles, deduplicacion (0 encontrados), tokenizacion y empaquetado con separadores `<|eos|>`. El optimizador fue AdamW (β = (0,9, 0,95), ε = 1e-8) con learning rate pico de 3e-3 y decaimiento coseno hasta 3e-4, 200 pasos de warmup, weight decay 0,1 solo en tensores 2-D, clipping de gradiente con norma global 1,0, batch de 16 × 256 tokens (4.096 tokens por paso) y semilla 1337. No se menciona RLHF, DPO ni ninguna fase de alineacion.

La innovacion tecnica destacable no esta en el modelo en si, sino en el aparato de procedencia: cada checkpoint incrusta un registro (`initialization: random`, `pretrained_weights_loaded: false`) y el cargador rechaza cualquier checkpoint que declare otro origen de pesos. Ademas, se documenta que el codigo fue escrito por un agente de programacion (Claude Opus 5), que no aporto ningun valor de parametro. En `configs/` existen otras escalas definidas: nano (43.168), small (8.524.032) y medium (97.536.768); solo nano y tiny han sido entrenados, y medium requeriria aproximadamente 660 dias en el hardware disponible.

## Capacidades

- Generacion de texto autorregresiva a nivel de token, limitada a continuaciones de muy corto alcance (contexto de 256 tokens).
- Modelado de lenguaje con perplejidad inferior a un trigrama suavizado en el conjunto de validacion propio del proyecto.
- Tokenizacion BPE a nivel de byte sin perdida: cualquier secuencia de bytes puede codificarse y decodificarse exactamente, incluidos ASCII, CJK, arabe, cirilico, emoji del plano astral y secuencias ZWJ.
- Capacidad de overfit demostrada (perdida de entrenamiento de 0,00249 en la prueba L1).
- Soporte de tool calling / function calling: no disponible (no se menciona ninguna capacidad de este tipo).
- Soporte de agentes y razonamiento multi-paso: no disponible (a esta escala no es viable).
- Capacidades multilingues: no disponibles; el modelo esta entrenado y declarado unicamente para ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Capacidad de codigo y matematicas: explicitamente al nivel del azar segun la propia model card.

## Casos de uso

- Estudio pedagogico de un pipeline LLM completo: el proyecto documenta de principio a fin descarga de datos, filtrado, tokenizacion, entrenamiento, evaluacion y procedencia de pesos en ficheros como `docs/data_provenance.md`, `docs/research_specification.md` y `docs/experiments.md`, lo que permite usarlo como material de clase para entender cada etapa sin necesidad de GPU.
- Reproduccion de experimentos en hardware modesto: dado que el entrenamiento completo cabe en un Intel i7-6500U con 2 nucleos y 7,86 GiB de RAM, sirve para que estudiantes o investigadores reproduzcan el ciclo entero en un portatil y comparen sus resultados con los registrados en `experiments/exp002_tiny_baseline/record.json`.
- Validacion de tokenizadores byte-level: el tokenizador es sin perdida por construccion y se verifico sobre ASCII, CJK, arabe, cirilico, emoji del plano astral, secuencias ZWJ y 500 cadenas de bytes aleatorias, por lo que puede emplearse como referencia para probar implementaciones propias de BPE.
- Linea base de comparacion frente a n-gramas: el criterio principal del proyecto es superar a un trigrama bien suavizado (PPL < 96,74) en texto no visto, lo que lo convierte en un punto de comparacion util cuando se quiere medir si un modelo minimo generaliza o simplemente memoriza.
- Investigacion sobre escalado a escala minima: las escalas nano (43.168) y tiny (1.328.256) estan entrenadas y las escalas small y medium estan definidas y verificadas en parametros, lo que permite estudiar el comportamiento de la loss en funcion del tamano dentro de un rango muy bajo.
- Auditoria de integridad de checkpoints: el mecanismo de procedencia que rechaza checkpoints con origen de pesos declarado distinto puede usarse como ejemplo de diseno para proyectos que necesiten trazabilidad de pesos en entornos regulados.
- Demostracion de limites de escala en docencia: el modelo ilustra de forma empirica que a 1,3 millones de parametros las tareas de razonamiento aritmetico y generacion de codigo quedan al nivel del azar, util como contraejemplo frente a expectativas infladas.
- Pruebas de infraestructura de entrenamiento en CPU: sirve para validar scripts de entrenamiento, medicion de throughput (4.111 tokens/s medidos a escala Tiny) y estabilidad termica (sin throttling en 45 s de carga sostenida) antes de pasar a modelos mayores.

## Benchmarks y rendimiento

Resultados de evaluacion sobre los mismos 487.732 tokens de validacion, con el mismo tokenizador y frente a lineas base ajustadas sobre la misma particion de entrenamiento.

| Modelo | Entropia cruzada | Perplejidad |
|---|---|---|
| Uniforme | 8,3178 | 4096,00 |
| Unigrama | 6,6149 | 746,14 |
| Bigrama | 4,8436 | 126,93 |
| Trigrama | 4,5720 | 96,74 |

| Criterio | Umbral | Estado |
|---|---|---|
| L1 capacidad de overfit | train loss < 0,1 | PASS (0,00249) |
| L2 supera al bigrama | PPL < 126,93 | PASS |
| L3 supera al trigrama | PPL < 96,74 | PASS |

Segun la model card, las cifras finales se registran en `experiments/exp002_tiny_baseline/record.json` y `evaluation.json` al completar la ejecucion, y en el momento de redactar la ficha la ejecucion estaba en curso. En cuanto a benchmarks estandar, MMLU, GSM8K, HumanEval y similares quedan al nivel del azar a esta escala y se reportan como azar, no como rendimiento; no se ofrecen cifras numericas concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,3 MB solo para pesos en float32 (1.328.256 parametros × 4 bytes), sin contar overhead de runtime. Cabe en cualquier acelerador o incluso en memoria de sistema.
- GPU recomendadas: ninguna en particular; no se requiere GPU. El entrenamiento de las variantes nano y tiny se realizo integramente en CPU.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo, en iGPU y en CPU. No hay requisito de VRAM reseñable.
- Hardware de entrenamiento documentado: Intel i7-6500U, 2 nucleos fisicos, 7,86 GiB de RAM, sin GPU, Windows 11. Rendimiento medido de 120,46 GFLOP/s en matmul pico y 4.111 tokens/s a escala Tiny, sin throttling termico en 45 s de carga sostenida.
- Opciones de despliegue: no disponible. La informacion proporcionada no menciona soporte para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF; al tratarse de una implementacion desde cero, es probable que requiera codigo propio del repositorio.
- Latencia y throughput de inferencia: no disponible (la cifra de 4.111 tokens/s corresponde al entrenamiento, no a inferencia).
- Restriccion relevante: la variante medium (97.536.768 parametros) requeriria aproximadamente 660 dias en el hardware disponible, por lo que no es entrenable en ese equipo.

## Comparativa con modelos similares

No se identifican en la informacion proporcionada modelos externos comparables con datos verificables de parametros, contexto, rendimiento y licencia. La comparacion disponible es interna al propio proyecto:

| Modelo | Parametros | Estado | Contexto | Licencia |
|---|---|---|---|---|
| Ethine nano | 43.168 | Entrenado | no disponible | MIT |
| Ethine tiny | 1.328.256 | Entrenado | 256 tokens | MIT |
| Ethine small | 8.524.032 | Definido, no entrenado | no disponible | MIT |
| Ethine medium | 97.536.768 | Definido, no entrenado | no disponible | MIT |

Comparativa con alternativas externas de la misma categoria: no disponible. Del mismo modo, no hay datos de rendimiento publicados que permitan situar a Ethine frente a otros modelos de investigacion de tamano similar.

## Limitaciones y advertencias

- Uso previsto exclusivamente de investigacion. El propio autor declara que Ethine existe para responder a una pregunta de investigacion y no para ser util como modelo de lenguaje.
- Idiomas: solo ingles. Entrenado sobre prosa literaria en ingles de los siglos XIX y principios del XX; no cubre lenguaje contemporaneo, escritura tecnica, codigo, dialectos ni otras lenguas.
- Contexto muy limitado: 256 tokens, lo que impide mantener conversaciones multi-turno o razonamiento de varios pasos.
- Benchmarks de razonamiento al nivel del azar: MMLU, GSM8K y HumanEval no ofrecen resultados utiles a esta escala; no puede hacer aritmetica multi-paso ni escribir codigo ejecutable.
- Riesgo alto de alucinacion y de texto incoherente: con 1,3 millones de parametros y 4,8 millones de tokens de entrenamiento, la coherencia se limita a continuaciones muy cortas.
- Sesgos: no se documentan evaluaciones de sesgo. El corpus es literatura occidental del XIX y principios del XX, con la carga cultural y de representacion que eso implica.
- Datos de entrenamiento sesgados por construccion: el propio autor enumera lo que el corpus no es (lenguaje contemporaneo, escritura tecnica, codigo, dialogo, multilingue, representativo del ingles general).
- Reproducibilidad: el agente de programacion que escribio el codigo no aporto valores de parametro, y la procedencia se audita mediante un registro embebido en cada checkpoint; cualquier checkpoint con otro origen de pesos declarado es rechazado al cargar.
- Estado de la evaluacion: en el momento de redactar la model card, la ejecucion seguia en curso, por lo que las cifras finales de perplejidad no estaban cerradas.
- Licencia MIT: permite uso comercial y modificacion, pero dado que el modelo no es funcional para tareas reales, la licencia es irrelevante en la practica para produccion.
- Escala medium no entrenada: seria necesaria una inversion de tiempo de unos 660 dias en el hardware documentado, por lo que no es viable hoy.
- Formato de pesos y opciones de cuantizacion no documentados: dificulta la integracion con runtimes estandar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BAHATIBlaise/ethine
- Perfil de GitHub del autor: https://github.com/BAHATIBlaise
- Repositorio de perfil del autor: https://github.com/BAHATIBlaise/BAHATIBlaise
- Documentacion interna del proyecto citada en la model card (rutas relativas al repositorio, no enlaces publicos): `docs/research_specification.md`, `docs/development_provenance.md`, `docs/data_provenance.md`, `docs/experiments.md`, `experiments/exp002_tiny_baseline/record.json`, `evaluation.json`, `configs/`
- Paper, blog o demo especificos de Ethine: no disponible en la informacion proporcionada.
