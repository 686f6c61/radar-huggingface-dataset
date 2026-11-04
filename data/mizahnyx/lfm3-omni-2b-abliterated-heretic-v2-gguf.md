# mizahnyx/lfm3-omni-2b-abliterated-heretic-v2-GGUF

## Resumen

LFM3-Omni-2B abliterated heretic v2 (GGUF) es una compilación en formato GGUF de un derivado del modelo multimodal LiquidAI/LFM3-Omni-2B, publicado por el usuario mizahnyx. El modelo base es un modelo "any-to-any" de Liquid AI de aproximadamente 1.730 millones de parametros, capaz de procesar y generar texto, imagen, audio y video. Sobre ese modelo, el autor ha aplicado una ablación automatizada de rechazos (refusal ablation) mediante la herramienta Heretic v2.0.0, con el objetivo de eliminar los mecanismos de negativa ante peticiones consideradas dañinas.

La modificación afecta exclusivamente al backbone de texto: las matrices `attn.o_proj` y `mlp.down_proj` de las 24 capas de texto fueron alteradas permanentemente, mientras que el codificador de visión, el codificador de audio y ambos proyectores multimodales se mantienen intactos y son intercambiables con los del modelo base. Esta versión se distribuye únicamente como pesos cuantizados GGUF (Q8_0, Q4_K_M y Q2_K), lo que reduce el peso desde 1,8 GB hasta 750 MB y facilita su ejecución en hardware de consumo mediante llama.cpp.

El interés de esta ficha es limitado y debe enmarcarse en el contexto de investigación en seguridad de IA: se trata de un artefacto de red-teaming, no de un modelo para producción. El autor lo declara explícitamente como apto solo para investigación y pruebas de seguridad, sin filtrado de seguridad y sin evaluación en benchmarks estándar. La licencia del modelo base (LFM Open License v1.0) restringe el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en LFM3-Omni de Liquid AI; backbone de texto transformer con modificador ARA aplicado (24 capas de texto), codificadores de visión y audio intactos |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (8,51 BPW), Q4_K_M (5,05 BPW), Q2_K (3,43 BPW); proyectores mmproj en F16 y Q8_0 |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl, da, el, fi, he, nl, sv, tr |
| Licencia | lfm-open-license-v1.0 (uso comercial restringido, seccion 5) |
| Formato de pesos | GGUF (llama.cpp); pesos completos en safetensors en el repo base del autor |

Detalles adicionales de los ficheros:

| Fichero | BPW | Tamano | Notas |
|---|---|---|---|
| LFM3-Omni-2B-abliterated-Q8_0.gguf | 8,51 | 1,8 GB | casi sin perdida |
| LFM3-Omni-2B-abliterated-Q4_K_M.gguf | 5,05 | 1,1 GB | recomendado por el autor |
| LFM3-Omni-2B-abliterated-Q2_K.gguf | 3,43 | 750 MB | ultimo recurso, con perdida real |
| mmproj-LFM3-Omni-2B-F16.gguf | 16,00 | 950 MB | proyector recomendado para entrada multimodal |
| mmproj-LFM3-Omni-2B-Q8_0.gguf | 8,51 | 507 MB | proyector reducido |
| imatrix/LFM3-Omni-2B-abliterated.imatrix.gguf | — | 3,6 MB | matriz de importancia para reproducir los K-quants |

## Arquitectura y entrenamiento

El modelo base LFM3-Omni-2B es un modelo multimodal any-to-any de Liquid AI con un backbone de texto de 24 capas y sendos codificadores de visión y audio acoplados mediante proyectores. La intervención de este derivado no consiste en un reentrenamiento ni en un ajuste fino supervisado, sino en una ablación de direcciones de rechazo aplicada sobre los pesos del backbone de texto mediante Heretic v2.0.0, empleando el modificador ARA con 60 ensayos de Optuna (20 de arranque) y semilla 42. Los tensores modificados son `attn.o_proj` y `mlp.down_proj` en las 24 capas de texto, y la exportación se realizó con pesos fusionados, no como adaptador LoRA.

Las metricas declaradas por el autor para el ensayo publicado son 1 negativa de cada 100 en la sonda de palabras clave, 0 negativas de cada 100 en la sonda de clasificador y una divergencia KL de 0,063 respecto al modelo base (frente a 99/100 y 98/100 del original). El autor indica que rechazo un ensayo con 0/100 negativas porque, con KL 2,27, resultaba incoherente (respondia a `17 * 23` con `"Ineq 17 23"`). No se especifican datos de entrenamiento adicionales, número de tokens, composición del dataset ni si hubo RLHF o DPO, ya que no forman parte de este proceso de modificación.

## Capacidades

- Generación de texto conversacional multi-turno en 26 idiomas, incluido el castellano.
- Procesamiento de entrada multimodal: imagen, audio y video, según el pipeline any-to-any del modelo base y los proyectores mmproj incluidos.
- Capacidad de respuesta a peticiones que el modelo base rechazaria, como consecuencia de la ablación de rechazos (1/100 negativas en la sonda de palabras clave del autor).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada; el autor advierte degradación en razonamiento con Q2_K.
- Modo thinking: no disponible en la información proporcionada.
- Capacidades de código y matemáticas: solo verificadas en sondas triviales (`17 * 23` = 391 en las tres cuantizaciones); sin evaluación formal.

## Casos de uso

- Red-teaming y evaluación de seguridad: el modelo sirve para comprobar cómo responde un sistema sin filtrado de rechazos ante prompts adversarios, y para medir la eficacia de las capas de moderación externas que se coloquen delante. Es el uso que el propio autor declara como previsto.
- Investigación sobre alineación y ablación: permite reproducir el efecto de Heretic v2.0.0 sobre un backbone de 24 capas y comparar la divergencia KL frente al modelo original, usando la matriz de importancia publicada para replicar las cuantizaciones.
- Análisis de transferencia de la ablación al pipeline multimodal: dado que los codificadores de visión y audio no se modificaron, se puede estudiar si el comportamiento sin rechazos del backbone de texto se mantiene cuando la entrada es una imagen o un audio.
- Pruebas de robustez de clasificadores de contenido: útil como generador de respuestas "compliant" para alimentar y validar clasificadores de seguridad en un entorno controlado.
- Experimentación con cuantización extrema: los ficheros Q2_K y la imatrix permiten estudiar la degradación de calidad a 3,43 BPW en un modelo de 1,7 mil millones de parametros, comparando con Q4_K_M y Q8_0.
- Despliegue local de laboratorio en hardware modesto: con llama.cpp y el fichero Q4_K_M (1,1 GB) más el proyector F16 (950 MB) se puede levantar un servidor de pruebas multimodal en una maquina de sobremesa, exclusivamente para experimentación aislada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el modelo no fue evaluado en MMLU, GSM8K ni pruebas equivalentes; solo se aportan 12 sondas puntuales y las métricas internas de Heretic.

| Metrica (Heretic) | Modelo base | Derivado publicado |
|---|---|---|
| Negativas en sonda de palabras clave | 99/100 | 1/100 |
| Negativas en sonda de clasificador | 98/100 | 0/100 |
| Divergencia KL respecto al base | — | 0,063 |

| Sonda | Q8_0 | Q4_K_M | Q2_K |
|---|---|---|---|
| `17 * 23` | 391 | 391 | 391 |
| Capital de Australia | Canberra | Canberra | Canberra |
| Respuesta a prompt dañino | responde | responde | responde |

## Requisitos de hardware

- VRAM estimada para el backbone de texto: aproximadamente 1,0-1,2 GB con Q4_K_M, 1,8-2,0 GB con Q8_0 y 0,8-1,0 GB con Q2_K, sin contar el proyector.
- Proyector multimodal: unos 1,0 GB adicionales con mmproj F16 o 0,5 GB con mmproj Q8_0.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM es suficiente para texto; para entrada de imagen, audio o video conviene disponer de 6-8 GB para acomodar el proyector y los tensores de activación.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores, e incluso en equipos con CPU y suficiente RAM.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server`), con requisito de una compilación reciente que incluya el conversor y el runtime de LFM3 (`conversion/lfm3.py`, `src/models/lfm3.cpp`). Para entrada multimodal se usa `--mmproj` con el fichero correspondiente y `--jinja`. Ollama, vLLM o TGI no se mencionan en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-Omni-2B abliterated heretic v2 GGUF (este) | 1,73 B | no disponible | si (imagen, audio, video) | LFM Open License v1.0, uso comercial restringido | Sin filtrado de seguridad; solo investigación |
| LiquidAI/LFM3-Omni-2B (base) | 1,73 B | no disponible | si (imagen, audio, video) | LFM Open License v1.0 | Modelo original con rechazos intactos y evaluación oficial |
| mizahnyx/lfm3-omni-2b-abliterated-heretic-v2 (safetensors) | 1,73 B | no disponible | si (imagen, audio, video) | LFM Open License v1.0 | Mismo derivado en precision completa; misma ablación |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes; la comparación se limita a parametros, modalidad y licencia.

## Limitaciones y advertencias

- Ausencia total de filtrado de seguridad: el modelo responde a peticiones dañinas (0/100 negativas en la sonda de clasificador del autor). No es apto para producción ni para despliegue de cara al usuario.
- Uso previsto exclusivamente de investigación y red-teaming, según la model card.
- Sin evaluación en benchmarks estándar: no hay datos de MMLU, GSM8K, HumanEval ni equivalentes, por lo que se desconoce su calidad real mas alla de 12 sondas triviales.
- Calidad multimodal tras la ablación no medida: el autor no evaluó si la eliminación de rechazos afecta a las salidas generadas a partir de imagen, audio o video.
- Q2_K genuinamente con perdida: a 3,43 BPW supera las sondas faciles pero degrada en razonamiento complejo; el autor lo describe como nivel de "ultimo recurso" para hardware pequeño.
- Riesgo de alucinación: heredado del modelo base y no cuantificado para este derivado.
- Sesgos: no documentados en la información proporcionada; se heredan los del modelo base.
- Restricciones de licencia: LFM Open License v1.0, con uso comercial restringido (seccion 5). La redistribución exige atribución y no se conceden derechos de marca; "LFM" y "Liquid AI" son marcas de Liquid AI, Inc.
- No afiliado ni respaldado por Liquid AI: el autor lo declara explícitamente.
- Requiere una compilación reciente de llama.cpp: versiones antiguas informaran de arquitectura desconocida para LFM3.
- Idioma: aunque se listan 26 idiomas, no hay evaluación de calidad por idioma en la información disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mizahnyx/lfm3-omni-2b-abliterated-heretic-v2-GGUF
- Repositorio de pesos completos (safetensors): https://huggingface.co/mizahnyx/lfm3-omni-2b-abliterated-heretic-v2
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B/blob/main/LICENSE
- Herramienta Heretic: https://github.com/p-e-w/heretic
