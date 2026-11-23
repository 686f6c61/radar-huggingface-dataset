# Eiki-AI/eiki-plamo-translate-2b-GGUF

## Resumen

Eiki PLaMo Translate 2B (GGUF) es una distribucion cuantizada en formato GGUF del fine-tune `Eiki-AI/eiki-plamo-translate-2b`, desarrollado por Eiki-AI sobre el modelo base `pfnet/plamo-3-translate-2b` de Preferred Networks. Se trata de un modelo especializado en traduccion automatica multilingue que amplia las lenguas originales del modelo PLaMo (ingles y japones) anadiendo cinco idiomas adicionales: afrikaans, noruego, portugues, sueco y turco. La version V6.1 del fine-tune es la que se distribuye en estos ficheros GGUF.

El modelo cuenta con 2.878.595.584 parametros (aproximadamente 2,9 mil millones) y esta pensado para inferencia en entornos con recursos limitados, gracias a sus cuantizaciones de 2, 3 y 4 bits que reducen el peso del fichero hasta 1,14 GiB en el caso de Q2_K. Esta orientado a tareas de traduccion bidireccional entre ingles y las lenguas soportadas, con un enfoque practico para despliegues en CPU, edge o GPUs de consumo.

La relevancia actual del modelo radica en su tamano compacto combinado con una calidad de traduccion medida mediante chrF++ que, en varios pares de idiomas, iguala o supera ligeramente al modelo en BF16 tras la cuantizacion a 4 bits. No obstante, se trata de un fine-tune comunitario no oficial, no afiliado ni respaldado por Preferred Networks, y su licencia PLaMo Community License impone condiciones especificas para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: pfnet/plamo-3-translate-2b; transformer segun familia PLaMo, sin confirmar en la informacion proporcionada) |
| Parametros totales | 2.878.595.584 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso de llama-server emplea `-c 2048`, pero no se confirma como contexto maximo del modelo) |
| Tipos de cuantizacion | Q4_K_M, Q4_0, Q3_K_M, Q2_K |
| Idiomas soportados | en, ja, af, no, pt, sv, tr |
| Licencia | plamo-community-license (PLaMo Community License) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone en la informacion proporcionada de detalles sobre la arquitectura interna del modelo base `pfnet/plamo-3-translate-2b` (tipo de transformer, mecanismos de atencion, composicion del dataset de entrenamiento o numero de tokens). Lo que si se documenta es que este repositorio contiene cuantizaciones GGUF de un fine-tune (V6.1) realizado por Eiki-AI sobre dicho modelo base, cuyo objetivo es anadir capacidad de traduccion para afrikaans, noruego, portugues, sueco y turco a las lenguas originales del modelo PLaMo.

El proceso de cuantizacion se ha evaluado comparando cada variante GGUF contra el modelo en BF16 mediante la metrica chrF++ (con `word_order=2`, `temperature=0` y `repeat_penalty=1.05`). Los resultados muestran que las cuantizaciones de 4 y 3 bits mantienen una calidad muy cercana al BF16, mientras que Q2_K presenta una degradacion notable (por ejemplo, en ingles a portugues cae de 80,65 a 75,89, y en ingles a noruego de 64,15 a 57,94). No se detalla si el fine-tune empleo RLHF, DPO u otras tecnicas de alineacion.

## Capacidades

- Traduccion automatica bidireccional entre ingles y afrikaans, noruego, portugues, sueco y turco, con resultados medidos en chrF++.
- Traduccion desde y hacia japones (heredada del modelo base), aunque con calidad muy baja segun los datos aportados (chrF++ en ingles a japones en torno a 16,5).
- Capacidad multilingue limitada a los siete idiomas declarados (en, ja, af, no, pt, sv, tr); no se documentan otros idiomas.
- Inferencia compatible con llama.cpp y con endpoints compatibles (tag `endpoints_compatible`).
- Formato conversacional (`conversational`), con prompt PFML3 y cadenas de parada especificas (`<|plamo:tag|>`, `<|plamo:bos|>`).
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Traduccion de documentacion tecnica entre ingles y portugues o sueco: el modelo alcanza chrF++ de 79,77 y 85,93 respectivamente en Q4_K_M, lo que lo hace adecuado para localizacion de manuales y guias con revisión humana posterior.
- Localizacion de interfaces y cadenas de software para mercados nordicos y lusofonos: su tamano de 1,68 GiB en Q4_K_M permite ejecutarlo en servidores modestos o incluso en portatiles para traducir ficheros de recursos de forma por lotes.
- Traduccion de correos y comunicaciones internas en empresas con equipos en Turquia, Suecia, Noruega o Brasil: el modelo puede desplegarse en un endpoint compatible con llama.cpp y procesar conversaciones cortas con latencia baja.
- Generacion de subtitulos o transcripciones traducidas en tiempo casi real: con Q4_0 (1,58 GiB) y una GPU de consumo es viable procesar segmentos cortos de audio transcritos previamente, traduciendo cada fragmento al ingles o desde el ingles.
- Preprocesamiento de corpus multilingues para entrenamiento de otros modelos: el modelo puede usarse para traduccion masiva por lotes en CPU con Q3_K_M (1,39 GiB), generando pares paralelos en los cinco idiomas anadidos.
- Traduccion de soporte al cliente en chats: integrado en un backend con llama-server, puede traducir mensajes entrantes de usuarios en turco o portugues al ingles para que un agente los entienda, y viceversa, con contexto de conversacion limitado.
- Prototipado y experimentacion en entornos sin GPU: la variante Q2_K (1,14 GiB) permite probar el modelo en hardware muy limitado, aceptando una perdida de calidad de entre 4 y 6 puntos chrF++ en la mayoria de pares.

## Benchmarks y rendimiento

Resultados de chrF++ (`word_order=2`, `temperature=0`, `repeat_penalty=1.05`) comparando BF16 con las cuantizaciones GGUF:

| Direccion | BF16 | Q4_K_M | Q4_0 | Q3_K_M | Q2_K |
|---|---:|---:|---:|---:|---:|
| Ingles -> Afrikaans (100 V6 test) | 68,40 | 68,54 | 67,12 | 68,36 | 60,36 |
| Afrikaans -> Ingles (100 V6 test) | 69,75 | 70,42 | 68,23 | 69,63 | 65,73 |
| Ingles -> Noruego (100 V6 test) | 64,15 | 63,33 | 64,23 | 63,49 | 57,94 |
| Noruego -> Ingles (100 V6 test) | 68,19 | 66,29 | 67,52 | 68,55 | 64,44 |
| Ingles -> Portugues (100 V6 test) | 80,65 | 79,77 | 80,23 | 79,20 | 75,89 |
| Portugues -> Ingles (100 V6 test) | 84,10 | 85,99 | 85,62 | 83,70 | 78,60 |
| Ingles -> Sueco (100 V6 test) | 85,16 | 85,93 | 85,45 | 84,79 | 79,55 |
| Sueco -> Ingles (100 V6 test) | 84,37 | 84,49 | 83,93 | 85,05 | 76,80 |
| Ingles -> Turco (100 V6 test) | 76,14 | 76,77 | 76,65 | 76,69 | 72,14 |
| Turco -> Ingles (100 V6 test) | 81,26 | 80,29 | 79,68 | 80,74 | 75,24 |
| Ingles -> Japones (50 OPUS-100) | 16,62 | 16,53 | 16,37 | 16,93 | 16,42 |
| Ingles -> Neerlandes (50 OPUS-100) | 48,84 | 49,16 | 48,00 | 48,44 | 47,19 |
| Ingles -> Aleman (50 OPUS-100) | 46,64 | 47,43 | 46,76 | 46,31 | 46,32 |
| Ingles -> Ruso (50 OPUS-100) | 45,45 | 44,82 | 45,12 | 45,40 | 42,22 |
| Serbio -> Ingles (50 FLORES cirilico) | 53,65 | 52,96 | 52,13 | 52,87 | 46,44 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos mas overhead de contexto y KV cache):
  - Q4_K_M: aproximadamente 1,7 GiB de pesos; en la practica 2,5-3,5 GiB con contexto de 2048 tokens.
  - Q4_0: aproximadamente 1,6 GiB de pesos; en la practica 2,3-3,3 GiB.
  - Q3_K_M: aproximadamente 1,4 GiB de pesos; en la practica 2,0-3,0 GiB.
  - Q2_K: aproximadamente 1,1 GiB de pesos; en la practica 1,7-2,7 GiB.
- GPU recomendadas: cualquier GPU con al menos 4 GiB de VRAM para Q4_K_M; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobradamente suficientes. El modelo es pequeno y no requiere GPUs de datacenter.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4 GiB o mas de VRAM. Tambien es viable en CPU pura.
- Opciones de despliegue: llama.cpp (llama-server con `--no-jinja`), y por extension cualquier frontend compatible con GGUF (Ollama, LM Studio, etc., aunque no se mencionan explicitamente en la model card). El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano (2,9 B parametros) se espera un throughput alto en GPU de consumo, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Eiki PLaMo Translate 2B (GGUF) | 2,88 B | no disponible | en, ja, af, no, pt, sv, tr | PLaMo Community License | GGUF | Fine-tune comunitario para traduccion |
| pfnet/plamo-3-translate-2b (base) | no disponible | no disponible | en, ja | PLaMo Community License | safetensors (presumiblemente) | Modelo base oficial de Preferred Networks |
| Eiki-AI/eiki-plamo-translate-2b (BF16) | 2,88 B | no disponible | en, ja, af, no, pt, sv, tr | PLaMo Community License | safetensors | Version sin cuantizar del mismo fine-tune |

No se dispone en la informacion proporcionada de datos sobre otros modelos de traduccion comparables (por ejemplo, NLLB, M2M-100 o Helsinki-NLP) que permitan una comparacion cuantitativa directa.

## Limitaciones y advertencias

- Es un fine-tune comunitario no oficial: no esta afiliado ni respaldado por Preferred Networks, Inc.
- La licencia PLaMo Community License impone condiciones para uso comercial, incluyendo registro previo y umbrales de ingresos anuales; es imprescindible revisar el fichero LICENSE antes de un despliegue en produccion.
- La calidad de traduccion hacia y desde japones es muy baja segun los datos aportados (chrF++ en torno a 16,5 en ingles a japones), por lo que no es recomendable para ese par.
- La cuantizacion Q2_K degrada la calidad de forma significativa (hasta 6-8 puntos chrF++ en algunos pares); solo recomendable para pruebas o entornos con recursos extremadamente limitados.
- No se documentan sesgos conocidos, pero al ser un modelo de traduccion entrenado sobre corpus no especificados, es probable que herede sesgos de genero, culturales o dialectales de dichos datos.
- Riesgo de alucinacion en traduccion: como todo modelo generativo, puede inventar contenido, omitir fragmentos o alterar nombres propios, especialmente en textos largos o dominios especializados.
- El contexto maximo no esta documentado; el ejemplo de uso emplea `-c 2048`, por lo que textos largos pueden requerir fragmentacion.
- Solo soporta los siete idiomas declarados; no se garantiza un comportamiento correcto en otros idiomas.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/Eiki-AI/eiki-plamo-translate-2b-GGUF
- Fine-tune en BF16: https://huggingface.co/Eiki-AI/eiki-plamo-translate-2b
- Modelo base: https://huggingface.co/pfnet/plamo-3-translate-2b
- Licencia PLaMo Community License: https://huggingface.co/Eiki-AI/eiki-plamo-translate-2b-GGUF/blob/main/LICENSE
