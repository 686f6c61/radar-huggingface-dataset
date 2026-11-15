# audreyt/Arete-27B-YASAKANI-quality

## Resumen

Arete-27B-YASAKANI-quality es una cuantizacion comunitaria del modelo NousResearch/Arete-27B, un post-entrenamiento de Qwen/Qwen3.8-27B realizado por Nous Research. La conversion la ha publicado el usuario audreyt en el formato propietario `.yskn` del motor de inferencia YASAKANI, pensado para ejecucion local en Windows sobre GPU de consumo. El modelo base es un transformer denso de aproximadamente 27.000 millones de parametros con torre de vision en el checkpoint original; esta version conserva unicamente la parte de texto.

El problema que resuelve es el de poder ejecutar un modelo de 27B en una GPU de consumo (RTX 5090) con un presupuesto de memoria reducido, mediante una asignacion de bits mixta (4 bits para 288 matrices, 3 bits para 112, cabeza de salida a 4 bits y embeddings a 3 bits) que comprime los pesos a unos 12,37 GB. Incluye ademas un borrador de decodificacion especulativa reutilizado de la release de Qwen3.8-27B de yasakani-dev, con el que el autor reporta entre 2,6 y 7,2 tokens por pasada.

La relevancia es acotada: no es un modelo nuevo ni un checkpoint entrenado desde cero, sino un artefacto de despliegue para un runtime concreto (YASAKANI 0.1.3, `yskn.dll`, Windows). El autor no aporta benchmarks de capacidad general ni mediciones de divergencia KL frente al BF16 original, por lo que sus prestaciones reales de calidad no estan validadas mas alla de comprobaciones cualitativas puntuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.8-27B; detalles de atencion no disponibles) |
| Parametros totales | 27B (modelo base); pesos cuantizados de 12.365.242.368 bytes |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens configurados (limite de configuracion, no validado como benchmark de contexto largo) |
| Tipos de cuantizacion | Mixta: 288 matrices a 4 bits/peso, 112 a 3 bits/peso, cabeza de salida a 4 bits, embeddings a 3 bits; perfil KV-cache `kvq_u5.bin` |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas; hay una comprobacion cualitativa en chino tradicional) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.yskn` (formato propietario del motor YASAKANI); se incluyen `tokenizer.json`, `config.json`, `generation_config.json` y `chat_template.jinja` del checkpoint Arete-27B |

## Arquitectura y entrenamiento

El modelo base, NousResearch/Arete-27B (revision `108f0afbdcfaa1ceeda4a635004304dfff6d4da2`), es un post-entrenamiento de Qwen/Qwen3.8-27B segun indica la propia model card. No se detallan en la informacion disponible la composicion del dataset de post-entrenamiento, el numero de tokens, ni si se emplearon tecnicas de RLHF, DPO u otras. La arquitectura subyacente es la de Qwen3.8-27B, un transformer denso con torre de vision en el checkpoint original; esta conversion elimina dicha torre y conserva solo el stack de texto.

La innovacion tecnica de esta ficha no esta en el entrenamiento sino en la conversion. El autor usa el conversor `tools/convert/` del repositorio YASAKANI con asignacion de bits por matriz ("quality bit allocation") y 192 ventanas de calibracion publicadas sin modificar. Ademas incorpora decodificacion especulativa mediante un borrador (`bdraft2_k8.yskn` y `bdraft2_k8.shead`) tomado sin cambios de la release `yasakani-dev/Qwen3.8-27B-YASAKANI-quality`, justificado porque Arete es un fine-tune del mismo checkpoint. El autor reporta 2,6-7,2 tokens por pasada con ese borrador en una RTX 5090. La verificacion de integridad se hace con `yasakani verify` (11 ficheros con SHA-256) y `yasakani selfcheck` (3/3 PASS).

## Capacidades

- Generacion de texto conversacional y de respuesta a instrucciones, heredada del post-entrenamiento de Arete-27B sobre Qwen3.8-27B.
- Razonamiento aritmetico basico y calculo de cuadrados de enteros: el autor reporta respuestas correctas en comprobaciones greedy puntuales.
- Generacion de codigo: se incluye una implementacion completa de cache LRU en las comprobaciones, inspeccionada pero no ejecutada como benchmark.
- Capacidad multilingue: se documenta una explicacion coherente en chino tradicional; no hay lista oficial de idiomas soportados.
- Plantilla de chat incluida (`chat_template.jinja`), por lo que soporta el formato conversacional del checkpoint original.
- Decodificacion especulativa integrada en el runtime, con ganancia de throughput reportada por el autor.
- No incluye vision: la torre visual del checkpoint original se ha eliminado en esta conversion.
- Soporte de tool calling, function calling y razonamiento multi-paso en agentes: no disponible en la informacion proporcionada para esta conversion concreta.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local en estacion de trabajo Windows con RTX 5090: el artefacto esta pensado para `yasakani serve` con `yskn.dll`, de modo que un desarrollador individual puede servir un modelo de 27B en una sola GPU de consumo sin infraestructura cloud.
- Asistente conversacional de escritorio: la plantilla de chat y el contexto configurado de 262.144 tokens permiten mantener sesiones largas con historial extenso, aunque el limite no este validado como benchmark de contexto largo.
- Generacion de codigo en local: las comprobaciones cualitativas muestran codigo funcional (cache LRU) y el runtime admite decodificacion especulativa, lo que reduce la latencia en tareas de generacion larga sobre una unica GPU.
- Prototipado e investigacion de cuantizacion: el repositorio incluye `eval/decode_compare.json` con errores de reconstruccion de pesos por matriz, util para estudiar el impacto de asignaciones de bits mixtas (4/3 bits) en modelos de 27B.
- Evaluacion de runtimes alternativos: sirve como caso de prueba para comparar YASAKANI frente a vLLM, llama.cpp u Ollama en terminos de throughput y fidelidad de pesos, dado que el autor publica checksums y selfcheck reproducibles.
- Experimentacion multilingue acotada: la comprobacion en chino tradicional sugiere uso para asistentes en ese idioma, aunque sin garantias de calidad fuera de esa prueba puntual.
- Reproducibilidad de artefactos: el manifiesto `yasakani.json` con SHA-256 y `selfcheck.json` con salidas greedy de referencia permiten auditar una conversion y verificar que el binario desplegado coincide con el publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor indica explicitamente que no ha medido la evaluacion de propaganda de Arete, ni benchmarks de capacidad general, ni respuestas emparejadas BF16 frente a cuantizado en prompts politicos o de alineacion de valores.

Los unicos datos cuantitativos publicados son errores de reconstruccion de pesos y resultados de verificacion del runtime:

| Metrica | Resultado |
|---|---|
| Error relativo mediano, 288 matrices a 4 bits | 0,0921 (rango 0,0872-0,1038) |
| Error relativo mediano, 112 matrices a 3 bits | 0,1771 (rango 0,1689-0,2034) |
| Error relativo mediano, cabeza de salida a 4 bits | 0,0870 |
| Error relativo mediano, embeddings a 3 bits | 0,1457 |
| Vectores comparados | 449, todos bit-identicos |
| Matrices codificadas cubiertas | 402 de 402 |
| `yasakani verify` | 11/11 ficheros coinciden |
| `yasakani selfcheck` | 3/3 PASS |
| Tokens por pasada con borrador especulativo | 2,6-7,2 (RTX 5090) |
| KL divergence frente a BF16 | no medida en esta conversion (la conversion "stock" del mismo metodo reporta 0,0122) |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 12.365.242.368 bytes (aproximadamente 11,5 GiB); con cache KV, buffers de runtime y el borrador especulativo, el consumo total supera los 12 GB y probablemente se situa en el rango de 14-16 GB, aunque el autor no publica una cifra de VRAM pico.
- GPU recomendadas: NVIDIA RTX 5090 es la unica GPU en la que el autor ha probado esta release. Otras GPU no han sido validadas para esta conversion.
- Cabe en GPU de consumo: si, al menos en RTX 5090 segun la unica prueba publicada; no hay datos para RTX 4090, 3090 u otras.
- Sistema operativo: Windows, con YASAKANI 0.1.3 y `yskn.dll`.
- Opciones de despliegue: `yasakani serve --model-dir <carpeta> --dll yskn.dll --host 127.0.0.1 --port 8765 --max-ctx 262144`. El identificador servido es `qwen3.8-27b`, de modo que los clientes YASAKANI existentes no requieren cambios.
- Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible; el formato `.yskn` es propietario del motor YASAKANI.
- Latencia y throughput: el autor solo reporta 2,6-7,2 tokens por pasada con decodificacion especulativa en una RTX 5090; no se publican tokens por segundo ni latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arete-27B-YASAKANI-quality | 27B (denso) | 262.144 configurados | Mixta 4/3 bits en `.yskn` | Apache 2.0 | Hugging Face, requiere YASAKANI en Windows |
| NousResearch/Arete-27B (BF16, base) | 27B (denso) | no disponible en la informacion | BF16 | Apache 2.0 | Hugging Face |
| yasakani-dev/Qwen3.8-27B-YASAKANI-quality | 27B (denso) | no disponible en la informacion | Mixta en `.yskn` | Apache 2.0 (segun la release referenciada) | Hugging Face; origen del borrador especulativo y del perfil KV |
| Qwen/Qwen3.8-27B (modelo original) | 27B (denso) | no disponible en la informacion | Multiples formatos de la comunidad | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada; la comparativa se limita a parametros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo nuevo: es una cuantizacion del checkpoint Arete-27B. Los resultados de evaluacion del original no deben asumirse transferibles a esta version, tal como advierte el propio autor.
- No se ha medido la divergencia KL ni la coincidencia top-1 frente al BF16 de Arete en esta conversion; el valor de referencia (KL 0,0122) corresponde a otra release con el mismo metodo.
- El error de reconstruccion de pesos en las matrices a 3 bits (0,1771 mediano) es notablemente superior al de las matrices a 4 bits (0,0921), lo que puede degradar capas concretas de forma no uniforme.
- El contexto de 262.144 tokens es un limite de configuracion, no un benchmark validado; el comportamiento real en contextos largos no esta medido.
- La torre de vision ha sido eliminada: no hay capacidades multimodales.
- Dependencia fuerte de plataforma: requiere Windows, YASAKANI 0.1.3 y `yskn.dll`; no hay soporte documentado para Linux, macOS ni para motores de inferencia estandar.
- Solo probado en RTX 5090; el rendimiento y la correccion en otras GPU no estan verificados.
- El borrador especulativo y el perfil de KV-cache provienen de otra release (Qwen3.8-27B) y se reutilizan sin cambios; su idoneidad para Arete se justifica por ser un fine-tune del mismo checkpoint, no por una validacion independiente.
- El identificador servido es `qwen3.8-27b`, no el nombre del modelo, lo que puede confundir en registros y monitorizacion.
- Sin lista declarada de idiomas ni evaluacion multilingue sistematica.
- Riesgo de sesgo y alineacion: el autor no ha evaluado el comportamiento en prompts politicos o de alineacion de valores, y no se aportan datos sobre sesgos.
- Riesgo de alucinacion: no cuantificado en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar `NOTICE` y el addendum de conversion de Arete incluidos en el repositorio.
- Proyecto comunitario sin afiliacion con Nous Research ni con los autores de YASAKANI; 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/audreyt/Arete-27B-YASAKANI-quality
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Repositorio del motor YASAKANI: https://github.com/yasakani-dev/yasakani
- Release de origen del borrador especulativo y del perfil KV-cache: https://huggingface.co/yasakani-dev/Qwen3.8-27B-YASAKANI-quality
- Modelo original subyacente: https://huggingface.co/Qwen/Qwen3.8-27B
