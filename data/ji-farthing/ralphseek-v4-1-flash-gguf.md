# ji-farthing/RalphSeek-V4.1-Flash-GGUF

## Resumen

RalphSeek V4.1 Flash es un fixture de pruebas: un modelo de 334,27 millones de parametros con la arquitectura de DeepSeek-V4.1-Flash, desarrollado por el usuario ji-farthing. Sus pesos se inicializaron de forma aleatoria y despues se entrenaron desde cero sobre un corpus sintetico pequeno (12 epocas sobre bloques de 256 tokens). No pretende ser un modelo de lenguaje utilizable, sino un banco de pruebas que reproduce todas las estructuras de la arquitectura `deepseek41` en miniatura para poder construir y depurar su soporte en inferenciadores sin necesidad de cargar el modelo completo.

El modelo se distribuye en formato GGUF en tres cuantizaciones y ademas incluye, dentro del propio repositorio, las distribuciones de salida del forward de referencia de DeepSeek sobre secuencias fijas de tokens (ficheros `.kld`). Esto permite verificar una implementacion comparando su divergencia KL contra esa referencia usando unicamente `llama-perplexity`, lo que lo convierte en una herramienta de validacion de bajo coste.

Su relevancia es por tanto instrumental: cualquiera que implemente la arquitectura DeepSeek-V4.1 (atencion con KV comprimido, indexer con top-k, hyper-connections, capas engram, MoE con 384 expertos enrutados) puede detectar errores de conversion o de kernel con un modelo de 418 MB en BF16 en lugar de con el modelo completo. El contexto configurado es de 1.048.576 tokens, aunque el modelo apenas depende de tokens distantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `deepseek41` (transformer MoE con atencion dispersa, KV comprimido, hyper-connections, capas engram e indexer top-k) |
| Parametros totales | 334.272.668 (334,27 M) |
| Parametros activos | No disponible (MoE con 6 de 384 expertos enrutados activos, mas 1 experto compartido; el desglose exacto de parametros activos no se publica) |
| Longitud de contexto | 1.048.576 tokens configurados |
| Tipos de cuantizacion | BF16 (referencia), Q8_0, IQ4_NL; los expertos permanecen en MXFP4 en las tres |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (bf16, q8_0, iq4_nl) y checkpoint en el directorio `hf/` en el formato de release de DeepSeek (expertos MXFP4, tablas engram en fp8) |
| Capas | 10 |
| Tamano oculto | 128 |
| Cabezas de atencion / dimension por cabeza | 64 / 512 |
| Ventana deslizante | 128 |
| Expertos enrutados / usados | 384 / 6 (MXFP4) |
| Expertos compartidos | 1 |
| Vocabulario | 129.280 |
| Capas MTP | 0 |
| Torre de vision | ninguna |

## Arquitectura y entrenamiento

La arquitectura replica la estructura de DeepSeek-V4.1-Flash pero reducida: 10 capas (frente a 40), tamano oculto 128 (frente a 5120), 64 cabezas de atencion con dimension de cabeza 512, ventana deslizante de 128 y una capa MoE con 384 expertos enrutados de los que se activan 6, mas 1 experto compartido, almacenados en MXFP4. La razon de compresion por capa sigue el patron 0, 0 y despues 2 en 4 capas y 1 en 4 capas. Las capas fuente de KV compartido son 2, 4 y 6; las capas fuente del indexer son 2, 4, 6 y 8; el top-k del indexer es 512. El filtro de candidatos opera sobre la capa fuente 6 con 2048 bloques de 8. Las capas engram son 1 y 4. Las hyper-connections usan 4 flujos con 20 iteraciones de Sinkhorn. No incorpora capas MTP ni torre de vision, a diferencia del modelo completo (que tiene 3 capas MTP y torre de vision).

No hubo RLHF ni DPO. Los pesos se inicializaron de forma aleatoria y se entrenaron desde cero durante 12 epocas sobre bloques de 256 tokens de un corpus sintetico pequeno; los pesos publicados corresponden a la epoca 4, la de menor perdida de validacion. El resultado es un modelo que produce oraciones gramaticales en ingles sin contenido factual ("I think clouds hide when the sun counts"). Su valor tecnico esta en que el forward de referencia (el `inference/model.py` de DeepSeek) sustituye el kernel `sparse_attn` de tilelang de DeepSeek por una funcion equivalente de torch, y las distribuciones de salida de ese forward se publican como ficheros `.kld` para comparacion. Existe una limitacion estructural declarada: el indexer no recibe gradiente a traves del top-k, por lo que el modelo depende muy poco de tokens distantes.

## Capacidades

- No es un modelo de lenguaje utilizable: no responde con hechos y genera afirmaciones no factuales de forma sistematica, tal como fue entrenado.
- Generacion de texto en ingles: produce oraciones gramaticales sin contenido informativo.
- Ejercita todas las estructuras de la arquitectura: atencion, KV comprimido, hyper-connections, capas engram y enrutamiento MoE (6 de 384 expertos mas 1 compartido).
- Soporte de tool calling / function calling: no disponible (sin evidencia en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (sin evidencia).
- Capacidades multilingues: no, solo ingles (`en`).
- Capacidad especial: es un fixture de validacion. Permite comprobar una implementacion contra las distribuciones de referencia de DeepSeek mediante `llama-perplexity --kl-divergence`.
- Capacidad de contexto largo: el contexto configurado es de 1.048.576 tokens, pero los propios ficheros de referencia no alcanzan a probar el filtro de candidatos (solo cubren hasta 2048 tokens).

## Casos de uso

- Validacion de convertidores GGUF: el directorio `hf/` incluye el checkpoint en el formato de release de DeepSeek (expertos MXFP4, tablas engram fp8) con config, tokenizer y chat template; convertir ese checkpoint a GGUF y comparar contra `ralphseek-v41-flash-bf16.gguf` detecta errores de conversion de manera directa.
- Verificacion de kernels de atencion: ejecutar `llama-perplexity` con `--kl-divergence-base ralphseek-v41-ref-c256.kld` sobre el fichero BF16 y comprobar `Mean KLD` y `Same top p` valida de una sola pasada atencion, KV comprimido, hyper-connections, engram y MoE, con todas las posiciones conservadas.
- Pruebas de decodificacion dispersa a rango largo: el fichero `ralphseek-v41-ref-c2048.kld` (2 trozos de 2048 tokens, 2046 posiciones puntuadas) ejercita el pruning top-k del indexer (512) en cada capa de indexer a 2048 tokens.
- Regresion en `llama.cpp` e `ik_llama`: al ser un fixture pequeno y determinista, se puede integrar en un pipeline de CI que ejecute el mismo prompt y compare la salida o el KLD, detectando roturas en el soporte de la arquitectura `deepseek41` antes de que lleguen a produccion.
- Validacion de cuantizaciones: comparar `q8_0` y `iq4_nl` contra el brazo de referencia BF16 con `Mean KLD` y `Same top p` permite medir el dano real de cada cuantizacion manteniendo los expertos en MXFP4.
- Smoke test de carga de MoE: verificar que un runtime inicializa correctamente 384 expertos enrutados con 6 activos, un experto compartido, 4 flujos de hyper-connection y tablas engram, sin necesidad de reservar la memoria del modelo completo.
- Pruebas de gestion de cache KV: cuantificar el consumo de memoria de la cache a distintas longitudes de contexto, dado que la configuracion por defecto de 1.048.576 tokens exige unos 10 GiB solo para la cache K.
- Pruebas en endpoints compatibles: el repositorio esta etiquetado como `endpoints_compatible`, por lo que sirve para comprobar el arranque y el formateo del chat template en servicios que expongan una API compatible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye unicamente datos de validacion de tipo divergencia KL contra el forward de referencia de DeepSeek sobre este mismo modelo:

| Metrica | `ralphseek-v41-ref-c256.kld` | `ralphseek-v41-ref-c2048.kld` |
|---|---|---|
| Trozos x tokens | 8 x 256 | 2 x 2048 |
| Posiciones puntuadas | 1.016 | 2.046 |
| Mean KLD del forward de referencia | 0,00083 | 0,00083 |
| Same top p del forward de referencia | 100% | 99,7% |
| PPL(base) | 1.227,8 | 1.358,1 |
| Perplejidad exacta de la referencia | 1.461,6 | 1.616,7 |

Nota de lectura: la model card advierte de que no debe usarse `Mean PPL(Q)/PPL(base)`, que arroja aproximadamente 1,20 incluso para una coincidencia cercana. Las metricas validas son `Mean KLD` y `Same top p`, y `Mean PPL(Q)` debe compararse contra las perplejidades exactas de la referencia (1.461,6 y 1.616,7). Los numeros anteriores corresponden a la referencia con el fake-quant fp8/fp4 de la cache KV, claves del indexer y latente comprimido desactivado; este modelo se entreno con ese fake-quant desactivado.

## Requisitos de hardware

- Peso en disco: 418 MB en BF16 (`ralphseek-v41-flash-bf16.gguf`), 261 MB en Q8_0 y 205 MB en IQ4_NL.
- VRAM para inferencia: los pesos caben en cualquier GPU consumer actual; el factor limitante no son los pesos sino la cache KV.
- Cache KV: con la longitud de contexto configurada por defecto (1.048.576 tokens) solo la cache K requiere unos 10 GiB. Hay que fijar `-c` explicitamente; el ejemplo de la model card usa `-c 512`.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM (por ejemplo RTX 3060 12 GB, RTX 4090), y tambien es viable en CPU dado el tamano del modelo. No se publican recomendaciones especificas de A100 o H100.
- Opciones de despliegue: `llama.cpp` (`llama-cli`, `llama-perplexity` con `-ngl 99 -fa on`) e `ik_llama`. No hay evidencia de soporte en vLLM o TGI: no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Capas | Contexto | Vision | Capas MTP | Licencia | Proposito |
|---|---|---|---|---|---|---|---|
| RalphSeek V4.1 Flash (este) | 334,27 M | 10 | 1.048.576 | No | 0 | MIT | Fixture de pruebas de la arquitectura V4.1 |
| RalphSeek V4 Flash | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible | Fixture hermano de la arquitectura V4 |
| DeepSeek-V4.1-Flash | No disponible | 40 | 1.048.576 | Si | 3 | MIT (segun `license_link`) | Modelo de referencia completo |

El modelo hermano RalphSeek V4 Flash se menciona en la model card como el equivalente para la arquitectura V4, pero no se proporcionan sus especificaciones. Frente a DeepSeek-V4.1-Flash, este fixture mantiene identicos el vocabulario (129.280), el top-k del indexer (512), la ventana deslizante (128), la estructura de expertos (384 enrutados / 6 usados, MXFP4, 1 compartido) y las hyper-connections (4 flujos, Sinkhorn 20 iteraciones), y reduce capas (10 frente a 40), tamano oculto (128 frente a 5120), numero de capas fuente del indexer (4 frente a 8) y prescinde de MTP y de torre de vision.

## Limitaciones y advertencias

- No es un modelo de lenguaje utilizable. La propia model card lo declara explicitamente: responde con no-hechos de forma confiada y con registro infantil.
- Los pesos provienen de inicializacion aleatoria y de un corpus sintetico pequeno, entrenado 12 epocas sobre bloques de 256 tokens. No hay RLHF ni DPO, ni datos reales a escala.
- Riesgo de alucinacion: total y por diseno. Cualquier uso como modelo generativo en produccion carece de sentido.
- Idioma: solo ingles (`en`). No hay capacidades multilingues.
- El indexer no recibe gradiente a traves del top-k y el modelo depende muy poco de tokens distantes. Los ficheros de referencia no pueden detectar una etapa de seleccion de tokens ausente o incorrecta: a 2048 tokens, conservar todas las posiciones en lugar del top 512 solo desplaza la salida de la referencia en un KLD de 0,00031 (Same top 99,9%).
- El filtro de candidatos (2048 bloques de 8) mantiene todos los bloques por debajo de 16.384 posiciones, por lo que ninguno de los dos ficheros de referencia llega a ejercitarlo.
- La comparacion de implementaciones debe usar `Mean KLD` y `Same top p`. `Mean PPL(Q)/PPL(base)` no es una metrica valida aqui (lee aproximadamente 1,20 incluso con coincidencia cercana).
- La mayoria de los tokens de prompt de usuario caen por debajo de la ventana de 24 nats almacenada en los `.kld`, porque el modelo nunca se entreno con ellos; esto explica los valores de `PPL(base)` de 1.227,8 y 1.358,1.
- Restricciones de licencia: licencia MIT, sin restriccion conocida para uso comercial del artefacto, si bien su unico uso sensato es el de fixture de pruebas.
- Sin datos publicados de benchmarks, sesgos medibles, latencia ni throughput. Cualquier cifra de rendimiento distinta de las recogidas aqui no esta respaldada por la informacion disponible.

## Enlaces

- [ji-farthing/RalphSeek-V4.1-Flash-GGUF en HuggingFace](https://huggingface.co/ji-farthing/RalphSeek-V4.1-Flash-GGUF)
- [deepseek-ai/DeepSeek-V4.1-Flash](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash)
- [Licencia referenciada por el autor](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/LICENSE)
- [ji-farthing/RalphSeek-V4-Flash-GGUF (fixture hermano)](https://huggingface.co/ji-farthing/RalphSeek-V4-Flash-GGUF)
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los resultados obtenidos corresponden a contenidos no relacionados (musica, articulos de diccionario y paginas sobre el sufijo "-ji").
