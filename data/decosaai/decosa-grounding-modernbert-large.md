# decosaai/decosa-grounding-modernbert-large

## Resumen

decosa-grounding-modernbert-large (v1) es un verificador de fundamentacion (grounding) de tipo encoder, desarrollado por decosaai y afiliado al modelo base answerdotai/ModernBERT-large. Recibe como entrada un pasaje fuente y una unica oracion de afirmacion, y devuelve un veredicto (`supported`, `contradicted` o `not_in_source`) con su probabilidad, una pista sobre el tipo de error mas probable (intercambio de entidad, cambio de numero, negacion, adicion no respaldada, sobregeneralizacion, desplazamiento temporal o ausencia), los tramos de tokens de la fuente que sirven de evidencia, y las palabras de la afirmacion que considera erroneas o anadidas. Con 396.894.222 parametros, licencia Apache-2.0 y pesos en safetensors, se distribuye como pipeline de `text-classification` con etiquetas adicionales de `token-classification`.

Su relevancia actual es doble. Por un lado, ataca el problema de la deteccion de alucinaciones en resumenes y respuestas generadas por IA cuando existe una fuente citada, un caso frecuente en RAG y en documentacion regulada. Por otro, se posiciona como alternativa con uso comercial permitido frente a los verificadores abiertos mas fuertes, que la propia model card califica de no comerciales (Bespoke-MiniCheck-7B y Lynx, CC BY-NC 4.0) o entrenados con datos de terminos no comerciales o poco claros (ANLI en MiniCheck-DeBERTa/FT5 y AlignScore, MS MARCO en AlignScore, RAGTruth en LettuceDetect). Todos los origenes de entrenamiento declarados son de dominio publico, CC0, CC BY 4.0, reutilizables bajo la Decision 2011/833/EU de la Comision, o sinteticos.

El modelo esta disenado como primera etapa de una cascada delante de un juez LLM. En la muestra estratificada de 720 pares, la cascada (el modelo decide, y solo el tramo con 0,06 <= p_flag < 0,94 pasa al LLM) alcanza un 96,8 % de errores detectados con un 5,6 % de falsos positivos... frente al 94,7 % / 5,9 % del juez LLM en solitario, enviando unicamente el 6,8 % de las oraciones al modelo grande. Corre en CPU: 0,72 s por oracion en p50 y 1,14 s en p90 sobre un AMD Ryzen 9 9950X3D compartido (8 hilos, fp32), y 23 ms en una A100.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT-large como modelo base, `finetune`); tarea de clasificacion de secuencias y etiquetado de tokens |
| Parametros totales | 396.894.222 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible como cifra oficial; la model card indica que lee unas 768 subpalabras de fuente por afirmacion como ventana operativa |
| Tipos de cuantizacion | no disponible (solo se documenta ejecucion en fp32 sobre CPU; no se publican pesos cuantizados) |
| Idiomas soportados | en (solo ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 1,6 GB) |
| Pipeline | text-classification (con etiquetas de token-classification) |
| Modelo base | answerdotai/ModernBERT-large |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-28 / 2026-09-28 |

## Arquitectura y entrenamiento

Se trata de un ajuste fino supervisado sobre answerdotai/ModernBERT-large, un encoder transformer denso, orientado a clasificacion y etiquetado. La model card no detalla la configuracion interna del encoder ni el numero de tokens de entrenamiento, la composicion exacta del dataset o el uso de RLHF/DPO; lo que si especifica es el regimen de datos: cada fuente de entrenamiento es de dominio publico, CC0, CC BY 4.0, reutilizable bajo la Decision 2011/833/EU de la Comision, o sintetica. No se aplico RLHF ni DPO segun la informacion disponible; el modelo aprende tres etiquetas de veredicto y, ademas, senala tipos de error, tramos de evidencia en la fuente y palabras erroneas en la afirmacion.

La innovacion principal no es arquitectonica, sino de producto y de regimen de datos: construir un verificador de grounding comercialmente util partiendo de un encoder Apache-2.0, evitando las licencias no comerciales y las procedencias dudosas de los datasets que lastran a otros verificadores abiertos. El metodo de evaluacion tambien es reseñable: los conjuntos de test se dividen por documento fuente, de modo que ningun documento de test se ve en entrenamiento ni siquiera como distractor, y los umbrales y la banda de la cascada se fijaron unicamente en el split de desarrollo. El modelo fue disenado explicitamente como primera etapa de una cascada cuyo juez es Qwen3.8-27B (aproximadamente 2 s y unos 1.100 tokens de prompt por oracion).

Un caveat central del entrenamiento, declarado por el propio autor: los errores son "plantados", es decir, las afirmaciones y las ediciones las redacto un LLM (Qwen3.8-27B) sin revision humana, de modo que las etiquetas heredan los fallos de ese LLM y algunas afirmaciones etiquetadas como `supported` no lo estan plenamente. Por eso los numeros en dominio son optimistas y el conjunto externo (SummEdits) es la mejor referencia de comportamiento real.

## Capacidades

- Verificacion de fundamentacion de una afirmacion contra un pasaje fuente, con salida de tres clases: `supported`, `contradicted` y `not_in_source`, mas una probabilidad por clase (`p_flag = 1 - p(supported)`).
- Clasificacion del tipo de error mas probable: intercambio de entidad, cambio de numero, negacion, adicion no respaldada, sobregeneralizacion, desplazamiento temporal o ausencia (tema relacionado pero no presente en la fuente). Se ofrece como pista para revisores, no como veredicto.
- Extraccion de evidencia en la fuente: devuelve los tokens que apoyan o contradicen la afirmacion, fusionados en tramos de caracteres, o puntuados por oracion si se le pasan los limites de oracion. Precision 0,85 y recall 0,95 sobre oraciones de evidencia.
- Localizacion de palabras erroneas o anadidas dentro de la afirmacion (recall 0,91, precision 0,54 en errores detectados).
- Funcionamiento como etapa de filtrado en cascada: banda de incertidumbre 0,06 <= p_flag < 0,94 derivada al LLM o a revision humana.
- No soporta tool calling, function calling, uso agentico, vision, audio ni modo de razonamiento explicito: es un clasificador de secuencia, no un modelo generativo.
- Capacidad multilingue: no disponible; solo ingles.
- Ejecucion en CPU como capacidad practica destacada (0,72 s p50 por oracion en 8 hilos fp32).

## Casos de uso

- Revision de resumenes clinicos generados por IA: se divide el resumen en oraciones y se comprueba cada una contra la nota fuente, usando los tramos de evidencia para que un profesional re Lea exactamente la frase de origen. La model card advierte que es una ayuda de revision y no verifica correccion clinica.
- Cascada de verificacion en RAG: el modelo filtra primero; con la banda 0,06-0,94 solo el 6,8 % de las oraciones llega al juez LLM, lo que rebaja el coste por consulta de aproximadamente 2 s y 1.100 tokens de prompt a 23 ms en A100 para la gran mayoria de casos.
- Auditoria de resumenes de documentos financieros y contratos: la ventana de unas 768 subpalabras por afirmacion permite seleccionar la clausula relevante y comprobar si el resumen respeta cifras y condiciones, con buen rendimiento en cambios de numero (100 % de deteccion) y desplazamientos temporales (96,7 %).
- Control de calidad en la generacion de resumenes automaticos por lotes: con 82,7 % de resumenes inconsistentes detectados y 32,7 % de falsos positivos en SummEdits, sirve como primer filtro barato antes de la revision humana, nunca como unico control.
- Etiquetado y triaje de documentos regulados (prospectos, etiquetas de producto, avisos y normativa): el modelo indica que tipo de error se ha cometido, lo que permite enrutar cada incidencia al revisor adecuado.
- Deteccion de atribuciones erroneas en asistentes de atencion al cliente: util para comprobar que una respuesta citada se mantiene fiel al texto de politica o FAQ de origen, teniendo en cuenta que su punto debil son las fuentes conversacionales (balanced accuracy 0,60-0,73 en dominios de dialogo).
- Preprocesado en pipelines de cumplimiento normativo: al ser Apache-2.0 y ejecutarse en CPU, puede desplegarse on-premise sobre texto que no debe salir de la organizacion.
- Evaluacion continua de la calidad de un sistema generativo: uso como metrica automatica de fidelidad sobre los pares fuente-afirmacion propios de la organizacion, con la advertencia de que no combina evidencia entre ventanas y no tiene veredicto `partial`.

## Benchmarks y rendimiento

| Conjunto | Este modelo | Juez LLM (Qwen3.8-27B) | Cascada (modelo primero; 0,06 <= p_flag < 0,94 va al LLM) |
|---|---|---|---|
| Errores plantados, 4.672 pares (3.315 errores, 1.357 soportados), 6 dominios | 96,0 % detectados, 4,1 % falsos positivos, AUC 0,989, exactitud de 3 clases 94,2 % | - | - |
| Muestra estratificada, 720 pares (432 errores, 288 soportados) | 95,8 % detectados, 5,6 % falsos positivos, 3 clases 94,0 % | 94,7 % detectados, 5,9 % falsos positivos, 3 clases 86,7 % | 96,8 % detectados, 3,1 % falsos positivos, 3 clases 95,6 %; 6,8 % de oraciones enviadas al LLM |
| SummEdits (externo, 300 items: 10 dominios x 30, mitad inconsistentes) | 82,7 % detectados (124/150), 32,7 % falsos positivos (49/150), balanced accuracy 0,75, AUC 0,82 | 92,0 % detectados (138/150), 26,7 % falsos positivos (40/150), balanced accuracy 0,83 | - |

Balance por dominio en SummEdits (modelo frente a LLM): billsum 0,70 frente a 0,73; ectsum 0,90 frente a 0,80; news 0,77 frente a 0,80; podcast 0,60 frente a 0,90; qmsumm 0,67 frente a 0,87; sales call 0,87 frente a 0,93; sales email 0,83 frente a 0,87; samsum 0,73 frente a 0,83; scitldr 0,77 frente a 0,77; shakespeare 0,67 frente a 0,77. En SummEdits un item se marca si se marca cualquiera de las oraciones del resumen; el umbral del modelo es p_flag >= 0,646 (umbral de desarrollo para un 5 % de falsos positivos) y el del LLM es cualquier veredicto distinto de `supported`, incluido `partial`.

Tasa de deteccion por tipo de error en la muestra de 720 pares (modelo frente a LLM): cambio de numero 100 % frente a 98,3 %; desplazamiento temporal 96,7 % frente a 88,3 %; sobregeneralizacion 90,0 % frente a 86,7 %; negacion 98,3 % frente a 100 %; adicion no respaldada 98,3 % frente a 100 %; intercambio de entidad 93,9 % frente a 95,5 %; ausencia 93,9 % frente a 93,9 %. Con 60-66 errores por tipo, un fallo equivale a 1,5-1,7 puntos, por lo que el autor indica que estas diferencias estan dentro del ruido.

## Requisitos de hardware

- VRAM estimada para inferencia (derivada de los 396,9 M de parametros, no publicada por el autor): en fp32 unos 1,6 GB, en fp16/bf16 unos 0,8 GB y en int8 unos 0,4 GB, mas memoria para activaciones y el tokenizador.
- GPU: medida en A100 con 23 ms por oracion. Cualquier GPU con 2 GB o mas de memoria libre (RTX 3060, RTX 4060, RTX 4090, L4, T4) es suficiente incluso en fp32; en A100 el limite practico es de decenas de oraciones por segundo.
- CPU: es el escenario documentado. Sobre un AMD Ryzen 9 9950X3D compartido, con 8 hilos y fp32, 0,72 s por oracion en p50 y 1,14 s en p90 (aproximadamente 1,4 oraciones por segundo). Cabe holgadamente en memoria de sistema.
- GPU de consumo: si, cabe en cualquier GPU de consumo con al menos 2 GB de VRAM; no es un modelo que requiera aceleradores de datacenter.
- Opciones de despliegue: `transformers` con el pipeline de `text-classification` y `token-classification`; exportacion a ONNX Runtime para CPU; vLLM o TGI son viables si admiten modelos encoder de clasificacion. No hay pesos GGUF publicados, por lo que llama.cpp y Ollama no estan disponibles de fabrica.
- Latencia y throughput: 23 ms por oracion en A100 (equivalente teorico de unas 43 oraciones por segundo por GPU); 0,72 s p50 y 1,14 s p90 por oracion en CPU de 8 hilos. El coste del juez LLM de la cascada es de aproximadamente 2 s y 1.100 tokens de prompt por oracion, de modo que la primera etapa supone una reduccion de coste de uno a dos ordenes de magnitud.

## Comparativa con modelos similares

| Modelo | Parametros | Licencia | Uso comercial | Idiomas | Notas |
|---|---|---|---|---|---|
| decosa-grounding-modernbert-large | 396.894.222 | Apache-2.0 | Si | en | Encoder; datos de entrenamiento de dominio publico, CC0, CC BY 4.0, Decision 2011/833/EU o sinteticos; 96,0 % de deteccion en errores plantados y 82,7 % en SummEdits |
| Bespoke-MiniCheck-7B | 7 B (aproximado, segun el nombre) | CC BY-NC 4.0 | No | no disponible | La model card lo cita como uno de los verificadores abiertos mas fuertes y no comerciales |
| Lynx | no disponible | CC BY-NC 4.0 | No | no disponible | Citado por el autor entre los verificadores con licencia no comercial |
| MiniCheck-DeBERTa / MiniCheck-FT5 | no disponible | no disponible | Terminos poco claros segun el autor | no disponible | Entrenados con ANLI, lo que el autor senala como uso no comercial o de terminos poco claros |
| AlignScore | no disponible | no disponible | Terminos poco claros segun el autor | no disponible | Entrenado con ANLI y MS MARCO, segun la model card |
| LettuceDetect | no disponible | no disponible | Terminos poco claros segun el autor | no disponible | Entrenado con RAGTruth, segun la model card |
| Qwen3.8-27B (juez LLM de la cascada) | 27 B (aproximado, segun el nombre) | no disponible | no disponible | no disponible | 94,7 % de deteccion frente a 95,8 % del modelo en la muestra de 720 pares, pero 92,0 % frente a 82,7 % en SummEdits; coste de aproximadamente 2 s y 1.100 tokens de prompt por oracion |

Las cifras de contexto y de rendimiento de los modelos comparados no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado sobre errores plantados: las afirmaciones y las ediciones las genero un LLM (Qwen3.8-27B) sin revision humana, por lo que las etiquetas heredan sus errores y algunas afirmaciones de entrenamiento marcadas como `supported` no lo estan plenamente. Los numeros en dominio son optimistas.
- La referencia externa (SummEdits) muestra un rendimiento claramente inferior al juez LLM: 82,7 % de deteccion con 32,7 % de falsos positivos, frente a 92,0 % y 26,7 %. Debe usarse como primer paso barato, no como unico control.
- Punto mas debil: fuentes conversacionales (transcripciones de reuniones, podcasts, dialogo) y texto literario, con balanced accuracy de 0,60-0,73 en SummEdits. No se entreno con ninguno de estos dominios.
- Ventana limitada: procesa una oracion de afirmacion contra una ventana de fuente de unas 768 subpalabras. No combina evidencia entre ventanas, por lo que hay que seleccionar el pasaje relevante antes de llamar al modelo.
- No dispone de veredicto `partial`, a diferencia del juez LLM de la cascada.
- Los tramos de palabras erroneas son demasiado amplios (precision 0,54), aunque el recall sea 0,91.
- Las notas clinicas y los filings sinteticos son ficticios y mas limpios que los registros reales; no se han probado abreviaturas, texto plantillado de historia clinica electronica ni tablas.
- No sirve para verificacion de conocimiento del mundo: solo responde a la pregunta "¿dice esto la fuente?". La etiqueta `supported` significa que no se ha encontrado ningun error de los tipos entrenados, no que la afirmacion sea verdadera.
- No usar para decisiones medicas, legales o financieras, ni para tomar decisiones sobre personas sin revision humana.
- Solo ingles; cualquier otro idioma queda fuera de su alcance.
- Licencia Apache-2.0, por lo que el uso comercial esta permitido, con la salvedad de que la model card no ofrece garantias sobre el rendimiento en dominios no evaluados.
- Modelo con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia: no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/decosaai/decosa-grounding-modernbert-large
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-large
- No se han encontrado otros enlaces relevantes (paper, blog, repositorio o demo) en la busqueda web realizada: los resultados devueltos no guardaban relacion con el modelo y fueron descartados.
