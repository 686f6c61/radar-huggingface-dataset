# icxcn/EuroLLM-22B-grc-ro

## Resumen

EuroLLM-22B-grc-ro es un modelo de traducción especializado en griego koiné, bizantino y patrístico hacia rumano, desarrollado por el usuario icxcn mediante fine-tuning LoRA sobre el modelo base utter-project/EuroLLM-22B-Instruct-2512. El modelo aborda un nicho muy concreto: la traducción de textos griegos eclesiásticos y patrísticos a un registro rumano arcaico o eclesiástico (con formas como *întru* o *cela ce*), no al rumano moderno estándar. Se distribuye con licencia Apache 2.0 y pesos en formato safetensors fusionados en bf16, además del adaptador LoRA por separado.

La arquitectura subyacente es un transformer decoder-only tipo Llama con 22.637.328.384 parámetros totales (aproximadamente 22,6 mil millones). El entrenamiento se realizó sobre 5.810 pares griego-rumano a nivel de párrafo en la versión v2, que amplía los 3.577 pares de la v1 con 2.233 pares procedentes de las actas de los concilios ecuménicos. El modelo está marcado explícitamente como preview: las métricas publicadas corresponden solo a particiones de desarrollo y no se ha realizado evaluación humana.

Su relevancia radica en la escasez de modelos abiertos especializados en griego antiguo y en la traducción a registros eclesiásticos del rumano. El autor reporta mejoras sustanciales frente al modelo base en las particiones de desarrollo (chrF++ de 59,97 frente a 47,61 del base zero-shot), aunque con intervalos de confianza amplios y sin evaluación sobre las particiones de test reservadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, según tags del repositorio) |
| Parametros totales | 22.637.328.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; el adaptador LoRA en fp32) |
| Idiomas soportados | grc (griego antiguo/koiné), ro (rumano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 fusionado); adaptador LoRA separado (rank 32, fp32, 702 MB) |

## Arquitectura y entrenamiento

El modelo parte de utter-project/EuroLLM-22B-Instruct-2512, un transformer decoder-only de aproximadamente 22,6 mil millones de parámetros, y se adapta mediante LoRA de rango 32 sobre 5.810 pares de traducción griego-rumano a nivel de párrafo (mediana de unos 610 caracteres griegos, máximo aproximado de 2.300). Los datos de la v1 (3.577 pares) se complementan con 2.233 pares adicionales extraídos de las actas de los concilios ecuménicos. El autor advierte que el origen de las referencias rumanas de esos textos conciliares no está documentado y podrían ser traducción automática.

Una innovación operativa destacable es la normalización obligatoria de la entrada: el modelo se entrenó con el griego plegado a forma monotónica mediante la función `monotonic()` de `grc_normalize.py`, que elimina espíritus, iota suscrita, macron y breve, y convierte grave y circunflejo en agudo. El prompt de entrenamiento es un único mensaje de usuario con la instrucción "Translate the following Koine/Ancient Greek text into Romanian. Output only the Romanian translation." seguida del texto griego. No se documenta en la información disponible el uso de RLHF o DPO durante el ajuste.

## Capacidades

- Traducción de griego koiné, bizantino y patrístico a rumano con registro eclesiástico o arcaico.
- Generación de texto conversacional mediante plantilla de chat (formato de mensajes de usuario).
- Manejo de entradas a nivel de párrafo, con una mediana de aproximadamente 610 caracteres griegos y un máximo probado de unos 2.300.
- Capacidad multilingüe limitada a la pareja grc-ro; no se documentan otras direcciones ni idiomas.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Compatible con text-generation-inference y vLLM según los tags del repositorio.

## Casos de uso

- Traducción de textos patrísticos para edición digital: el modelo puede procesar párrafos de los Padres de la Iglesia y devolver una versión rumana en registro eclesiástico, adecuada para publicaciones confesionales que mantienen la terminología tradicional.
- Digitalización de actas conciliares: dado el entrenamiento específico sobre 2.233 pares de las actas de los concilios ecuménicos, es adecuado para pre-traducir estos documentos antes de la revisión humana, con la advertencia de que las referencias de entrenamiento podrían ser traducción automática.
- Traducción litúrgica y bíblica asistida: las filas de Biblia del conjunto de desarrollo muestran chrF++ de 71,91, lo que lo hace útil como borrador para textos del Nuevo Testamento y salmos antes de la corrección editorial.
- Investigación en traducción de lenguas históricas: sirve como línea base reproducible para experimentos de traducción grc-ro, con pesos abiertos, adaptador LoRA separado y configuración de entrenamiento publicada en `run.json`.
- Pipeline de pre-traducción con revisión humana: al cargarse directamente en vLLM (`vllm serve icxcn/EuroLLM-22B-grc-ro`), puede integrarse en flujos por lotes donde un traductor revisa la salida, normalizando el griego en el cliente con `monotonic()`.
- Creación de corpus paralelos: puede generar traducciones preliminares de grandes volúmenes de texto griego para construir corpus alineados que después se validen manualmente, aprovechando la licencia Apache 2.0 para uso comercial.
- Experimentación con adaptadores LoRA: el adaptador de rango 32 en fp32 (702 MB) permite estudiar el efecto del ajuste sobre el modelo base sin necesidad de cargar los pesos fusionados completos.

## Benchmarks y rendimiento

Los resultados publicados corresponden exclusivamente a particiones de desarrollo; las particiones de test (106 filas, 74 de actas conciliares y 160 de fuente reservada) no se han evaluado.

| Sistema | chrF++ (134 filas dev) | COMET-22 | chrF++ Biblia | chrF++ patrístico |
|---|---|---|---|---|
| Base zero-shot | 47,61 | no medido | 52,17 | 44,67 |
| v1 | 58,99 (IC 95%: 56,95–61,17) | 0,8018 (0,7899–0,8129) | 71,22 | 51,19 |
| v2 (este modelo) | 59,97 (57,85–62,19) | 0,8034 (0,7904–0,8153) | 71,91 | 52,42 |

| Sistema | chrF++ (91 filas actas conciliares) | COMET-22 |
|---|---|---|
| v1 | 53,66 (51,14–55,84) | 0,7513 (0,7367–0,7649) |
| v2 (este modelo) | 64,76 (62,74–66,81) | 0,7822 (0,7662–0,7958) |

La diferencia pareada v2 − v1 en el conjunto de 134 filas es de +0,98 chrF++ (IC 95%: −0,12 a +2,27) y +0,0016 COMET (−0,0064 a +0,0094), ambos dentro del ruido. En las actas conciliares la diferencia es de +11,09 chrF++ (9,10 a 13,33) y +0,0309 COMET (0,0153 a 0,0450), aunque el autor advierte que las referencias de esas filas podrían ser traducción automática. En el bake-off de la v1 con cuatro modelos base ajustados, este base empató con Gemma 4 31B en desarrollo (59,43 chrF++, COMET 0,8019) y superó a los modelos de 12B y 8B en unos 4–5 chrF++.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 45 GB solo para pesos (22,6 mil millones de parámetros × 2 bytes), más caché KV y activaciones; se recomienda un mínimo de 48 GB y preferiblemente 80 GB para margen.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para bf16. En consumer GPU no cabe en bf16.
- Cuantización: no se documentan versiones GGUF ni cuantizaciones publicadas; no se confirma que quepa en RTX 4090 (24 GB) sin cuantizar a 4 bits, opción no disponible en el repositorio.
- Opciones de despliegue: transformers (ejemplo incluido en `example.py`), vLLM (`vllm serve icxcn/EuroLLM-22B-grc-ro`) y text-generation-inference según los tags.
- Latencia y throughput: no disponibles en la información proporcionada.
- El adaptador LoRA por separado (702 MB) permite cargar el base y aplicar el adaptador con PEFT, reduciendo el almacenamiento necesario respecto a los pesos fusionados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EuroLLM-22B-grc-ro (este) | 22,6 B | no disponible | Traducción grc-ro eclesiástica | Apache 2.0 | Hugging Face, preview |
| Gemma 4 31B (ajustado en bake-off v1) | 31 B | no disponible | Traducción grc-ro | no disponible en la información | Referenciado en la model card |
| Gemma 4 12B (ajustado en bake-off v1) | 12 B | no disponible | Traducción grc-ro | no disponible en la información | Referenciado en la model card |
| Krikri-8B (ajustado en bake-off v1) | 8 B | no disponible | Traducción grc-ro | no disponible en la información | Referenciado en la model card |

En el bake-off de la v1, el base de este modelo empató con Gemma 4 31B en desarrollo (59,43 chrF++ frente a 59,97 de la v2) y superó a los modelos de 12B y 8B en aproximadamente 4–5 chrF++. No se dispone de datos de contexto ni de licencia de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- Estado preview: las métricas publicadas solo cubren particiones de desarrollo; las particiones de test y la fuente reservada de 160 filas no se han evaluado, y no hay evaluación humana.
- Las referencias rumanas de las actas conciliares podrían ser traducción automática, por lo que la mejora de +11,09 chrF++ en ese dominio no es evidencia de calidad frente a una traducción humana verificada.
- Bucle de repetición con decodificación greedy: ocurre en 3 de las 225 filas de desarrollo en la v2 (2 en la v1); esas filas se incluyen en las puntuaciones.
- La decodificación greedy no es reproducible bit a bit entre ejecuciones; diferencias inferiores a aproximadamente 1 chrF++ no deben interpretarse como reales.
- El registro de salida es rumano arcaico o eclesiástico, no rumano moderno estándar, lo que limita su uso fuera de contextos confesionales o históricos.
- Requiere normalización obligatoria de la entrada griega con `monotonic()`; sin ella, el rendimiento puede degradarse.
- Comportamiento no probado en entradas mucho más largas que 2.300 caracteres griegos.
- No se documentan sesgos específicos, pero al entrenarse sobre textos religiosos puede reproducir sesgos propios de ese corpus.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base EuroLLM-22B-Instruct-2512 debe verificarse por separado para confirmar compatibilidad.
- Riesgo de alucinación inherente a la generación de texto; en traducción puede manifestarse como omisiones o adiciones no presentes en el original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/icxcn/EuroLLM-22B-grc-ro
- Modelo base: https://huggingface.co/utter-project/EuroLLM-22B-Instruct-2512
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
