# mradermacher/Qwen3.8-27B-Obliterated-NOESIS-BF16-i1-GGUF

## Resumen

Qwen3.8-27B-Obliterated-NOESIS-BF16-i1-GGUF es una cuantizacion GGUF del modelo AMAImedia/Qwen3.8-27B-Obliterated-NOESIS-BF16, publicada por el usuario mradermacher. Se trata de un modelo de lenguaje de 27.320.697.856 parametros (aproximadamente 27,3 mil millones) derivado de la familia Qwen, con licencia Apache 2.0 y soporte declarado para mas de 100 idiomas. La ficha corresponde especificamente al repositorio de cuantizaciones con imatrix (sufijo i1), que incluye desde Q2_K hasta Q6_K en formato GGUF.

El modelo base incorpora las etiquetas noesis, noesis-repack, bf16 y mtp, lo que sugiere un proceso de repack y posiblemente multi-token prediction, aunque la model card no detalla la arquitectura interna. El repositorio ocupa 218,6 GB e incluye tanto los pesos en BF16 como las cuantizaciones derivadas. La fecha de creacion es el 1 de septiembre de 2026 y la ultima actualizacion el 19 de septiembre de 2026, con 3.038 descargas registradas y 0 likes.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 27B en hardware de consumo mediante cuantizaciones de 11 a 22,5 GB, manteniendo la compatibilidad con el ecosistema transformers y con el pipeline de endpoints. Es una opcion practica para despliegue local en llama.cpp u Ollama, aunque carece de benchmarks publicados y de documentacion tecnica detallada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetas: noesis, noesis-repack, mtp; familia Qwen) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; fichero imatrix incluido |
| Idiomas soportados | en, ru, zh, vi, kk, ja y mas de 100 idiomas adicionales listados en la model card (af, am, ar, as, ast, az, be, bg, bn, bs, ca, ceb, ckb, cs, cy, da, de, el, es, et, eu, fa, ff, fi, fil, fr, ga, gl, gn, gu, ha, he, hi, hr, hu, hy, id, ig, is, it, jv, ka, kam, kea, km, kmr, kn, ko, ky, lb, lg, ln, lo, lt, luo, lv, mi, mk, ml, mn, mr, ms, mt, mvy, my, ne, nl, no, nso, ny, oc, om, or, pa, pl, ps, pt, qxp, ro, rw, sd, sk, skr, sl, sn, so, sr, sv, sw, ta, te, tg, th, ti, tk, tr, ug, uk, umb, ur, uz, wo, xh, yo, yue, zu) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1) y BF16 en el modelo base |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Las etiquetas indican que pertenece a la familia Qwen (qwen3.5, qwen3.6, qwen3.8) y que ha pasado por un proceso denominado noesis-repack, ademas de incluir la etiqueta mtp, que en modelos Qwen suele asociarse a multi-token prediction. No se especifica si se trata de un transformer denso o de una arquitectura MoE, ni el numero de tokens de entrenamiento, la composicion del dataset o si hubo fases de RLHF o DPO.

La innovacion tecnica documentada en este repositorio es la cuantizacion con imatrix (importance matrix), que calibra la perdida de precision por capa usando un corpus de calibracion. El autor incluye el fichero imatrix.gguf para que terceros puedan generar sus propias cuantizaciones. Las cuantizaciones i1 se presentan como superiores a las estaticas equivalentes: por ejemplo, i1-IQ3_S (12,7 GB) se indica que supera a Q3_K*, e i1-Q4_K_S (15,9 GB) se describe como el punto optimo entre tamano, velocidad y calidad.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta conversational del repositorio.
- Soporte multilingue amplio: mas de 100 idiomas declarados, con enfasis en en, ru, zh, vi, kk y ja.
- Compatibilidad con el ecosistema transformers y con endpoints compatibles (etiqueta endpoints_compatible).
- Ejecucion en formato GGUF mediante llama.cpp y derivados.
- Capacidad de razonamiento y codigo: no confirmada en la informacion disponible; las etiquetas de la familia Qwen lo sugieren pero no se documenta explicitamente.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo: con la cuantizacion i1-Q4_K_M (16,9 GB) el modelo cabe en una GPU de 24 GB o en configuraciones CPU+GPU, lo que permite ejecutar un modelo de 27B sin infraestructura cloud.
- Asistencia multilingue: el soporte declarado de mas de 100 idiomas permite construir asistentes de traduccion o atencion al cliente en idiomas minoritarios (kk, kam, luo, umb) que rara vez estan cubiertos por modelos de este tamano.
- Prototipado rapido con Ollama o llama.cpp: al estar en GGUF, se puede integrar en flujos de experimentacion local sin necesidad de convertir pesos ni gestionar dependencias de CUDA.
- Generacion de texto en entornos con restricciones de red: al ser un modelo Apache 2.0 descargable, es apto para despliegues on-premise en sectores con requisitos de soberania de datos.
- Fine-tuning posterior sobre la base BF16: el repositorio incluye los pesos BF16 del modelo base, lo que permite ajustar el modelo y luego recuantizar con la imatrix proporcionada.
- Evaluacion comparativa de cuantizaciones: el fichero imatrix y el rango de cuantizaciones (de 11 a 22,5 GB) permiten medir el impacto de la cuantizacion en tareas concretas antes de fijar una configuracion de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 11 GB (i1-Q2_K) y 22,5 GB (i1-Q6_K) solo para los pesos; hay que anadir el espacio para el contexto KV, que depende de la longitud de contexto no documentada.
- GPU recomendadas: RTX 4090 (24 GB) para i1-Q4_K_M o i1-Q5_K_M; A100 40/80 GB o H100 para BF16 y contextos largos.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con cuantizaciones Q4 o Q5; en GPUs de 16 GB solo con Q2_K o IQ3_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base en BF16 requiere transformers o vLLM/TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Obliterated-NOESIS-BF16-i1-GGUF | 27,3B | no disponible | Apache 2.0 | GGUF (i1) | Cuantizaciones con imatrix, mas de 100 idiomas |
| Modelo base AMAImedia/Qwen3.8-27B-Obliterated-NOESIS-BF16 | 27,3B | no disponible | Apache 2.0 | BF16 | Pesos completos, requiere mas VRAM |
| Cuantizaciones estaticas del mismo modelo (mradermacher/Qwen3.8-27B-Obliterated-NOESIS-BF16-GGUF) | 27,3B | no disponible | Apache 2.0 | GGUF estatico | Sin imatrix; el autor indica que las i1 son preferibles a igual tamano |
| Otros modelos de ~27B de la familia Qwen | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- No hay benchmarks publicados: no es posible verificar la calidad real del modelo ni compararlo objetivamente con alternativas.
- La model card no documenta arquitectura, contexto, datos de entrenamiento ni proceso de alineacion; esto dificulta evaluar riesgos de sesgo y alucinacion.
- El nombre "Obliterated" sugiere una modificacion agresiva del modelo original (posiblemente abliteration o eliminacion de capas de rechazo), lo que puede aumentar la probabilidad de generar contenido no filtrado; no se detalla el proceso.
- Las cuantizaciones de baja precision (Q2_K, IQ2, IQ3) degradan la calidad; el propio autor recomienda IQ3_XXS o superiores frente a Q2_K.
- El repositorio ocupa 218,6 GB, lo que exige espacio de almacenamiento considerable si se descargan varias cuantizaciones.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base es una modificacion de un modelo Qwen cuyos terminos originales no se detallan en la informacion disponible; conviene verificar la licencia del modelo upstream.
- El soporte de tool calling, agentes y razonamiento multi-paso no esta confirmado, por lo que no deberia asumirse en produccion sin pruebas.
- La fecha de creacion (2026) y la ausencia de likes y de pipeline declarado son indicios de un repositorio poco validado por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-Obliterated-NOESIS-BF16-i1-GGUF
- Modelo base: https://huggingface.co/AMAImedia/Qwen3.8-27B-Obliterated-NOESIS-BF16
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwen3.8-27B-Obliterated-NOESIS-BF16-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-Obliterated-NOESIS-BF16-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
