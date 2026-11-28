# quantile-labs/WazoCore-8B

## Resumen

WazoCore-8B es un modelo de lenguaje de 8.153 millones de parámetros desarrollado por Quantile Labs, un laboratorio centrado en modelos de IA abiertos para África. Se trata de un fine-tuning de NCAIR1/N-ATLaS (arquitectura Llama-3, 8B) al que se le ha ampliado el vocabulario en 15.000 tokens específicos para yoruba, hausa e igbo, con el objetivo de reducir el coste de tokenización de estas lenguas de bajos recursos. El modelo mantiene los 128.256 tokens originales del tokenizer de Llama-3 sin modificar sus identificadores ni embeddings, y añade los nuevos tokens encima.

El problema que resuelve es concreto y medible: el tokenizer original de Llama-3, entrenado mayoritariamente en inglés, requiere aproximadamente 2,9 tokens por palabra en yoruba frente a 1,3 en inglés. WazoCore reduce esa ratio a 1,91 en yoruba, 1,34 en hausa y 1,56 en igbo, lo que se traduce en una generación entre 1,6 y 1,7 veces más rápida en hardware de consumo y en un menor consumo de contexto por petición. Es relevante ahora porque ofrece una alternativa práctica y desplegable en local para aplicaciones en lenguas nigerianas sin renunciar a la arquitectura estándar de Llama.

La versión publicada es la v13, que sustituye a la v6 y recupera buena parte del razonamiento matemático y de inferencia en lenguaje natural que se degradó durante la adaptación del vocabulario. El modelo se distribuye en safetensors (BF16) y en GGUF cuantizado Q4_K_M, y funciona como reemplazo directo en Transformers, llama.cpp, LM Studio y stacks compatibles con la API de OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, Llama-3 (LlamaForCausalLM) |
| Parametros totales | 8.153.141.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens (máximo declarado en el archivo GGUF); en la práctica se recomienda fijar `-c` explícitamente, p. ej. 4.096 |
| Tipos de cuantizacion | BF16 (safetensors) y Q4_K_M (GGUF); otras cuantizaciones no disponibles en el repo |
| Idiomas soportados | Yoruba (yo), hausa (ha), igbo (ig), inglés (en) |
| Licencia | N-ATLaS Open-Source Research and Innovation License (`license: other`) |
| Formato de pesos | safetensors (BF16, 16,3 GB) y GGUF (Q4_K_M, 5,0 GB) |

## Arquitectura y entrenamiento

WazoCore-8B es un transformer decoder-only con la arquitectura Llama-3 heredada de NCAIR1/N-ATLaS, con 8.153 millones de parámetros. La innovación principal no está en el cuerpo del modelo sino en el tokenizer: se parte de los 128.256 tokens originales, cuyos identificadores y embeddings se mantienen intactos, y se añaden 15.000 tokens nuevos para yoruba, hausa e igbo. Esta estrategia de expansión de vocabulario preserva el comportamiento en inglés mientras reduce drásticamente la fragmentación de las lenguas objetivo. El tokenizer aplica normalización Unicode NFC de forma automática, lo que corrige el problema de entradas con Unicode descompuesto que afectaba a la versión anterior.

El ajuste se realizó sobre el modelo base N-ATLaS, con datasets que incluyen google/smol y openai/gsm8k, y se evaluó con métricas chrF++ y accuracy. La model card no detalla el número total de tokens de entrenamiento ni la composición exacta del dataset, ni confirma el uso de RLHF o DPO. La versión v13 corrige los problemas de la v6: elimina por completo la repetición degenerada (de 5 casos a 0 sobre 750 traducciones de prueba), reduce las salidas truncadas de 11 a 5, normaliza la entrada Unicode y recupera el razonamiento matemático hasta situarlo ligeramente por encima del modelo base (+0,9 en AfriMGSM frente a −11,6 en v6). El throughput por token decodificado es equivalente al del modelo base; toda la ganancia de velocidad proviene de las secuencias de tokens más cortas.

## Capacidades

- Generación de texto conversacional multi-turno en yoruba, hausa, igbo e inglés, con plantilla de chat compatible con el formato de Llama-3.
- Traducción bidireccional inglés ↔ yoruba/hausa/igbo, con calidad medida mediante chrF++ sobre NTREX-128.
- Tokenización eficiente de lenguas nigerianas: reducción de tokens por palabra de 2,87 a 1,91 en yoruba, de 2,12 a 1,34 en hausa y de 2,53 a 1,56 en igbo.
- Razonamiento matemático básico en las lenguas soportadas (evaluado con AfriMGSM).
- Inferencia en lenguaje natural (evaluado con AfriXNLI).
- Normalización automática de Unicode NFC en el tokenizer.
- Compatibilidad con tool calling y function calling a través de la API de OpenAI en llama-server, aunque la model card no documenta un formato específico de herramientas.
- Despliegue como reemplazo directo en Transformers, llama.cpp, LM Studio y servidores compatibles con OpenAI.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Traducción automática en producción para servicios públicos: el modelo traduce entre inglés y yoruba, hausa o igbo con una calidad medida en chrF++ y puede integrarse en un endpoint compatible con OpenAI para señalización o formularios multilingües, con menor coste por petición gracias a la reducción de tokens.
- Atención al cliente en lenguas nigerianas: al requerir aproximadamente un tercio menos de tokens por palabra, permite conversaciones multi-turno más largas dentro de la misma ventana de contexto y con menor latencia en hardware modesto.
- Despliegue en local o en sedes con conectividad limitada: el GGUF Q4_K_M de 5,0 GB funciona offline en máquinas con 8 GB de memoria o más, lo que lo hace viable en portátiles y estaciones de trabajo sin GPU dedicada.
- Generación de contenido editorial y educativo: redacción y adaptación de materiales en yoruba, hausa e igbo con un modelo que mantiene el inglés como lengua de apoyo, útil para medios y organizaciones locales.
- Sustitución directa del modelo base en pipelines existentes: al ser un checkpoint LlamaForCausalLM estándar con el mismo espacio de identificadores para los tokens originales, se puede cambiar N-ATLaS por WazoCore sin reescribir la integración y ganando velocidad de generación.
- Investigación en lenguas de bajos recursos: la expansión controlada de vocabulario y las métricas publicadas (tokens por palabra, chrF++, AfriMGSM, AfriXNLI) sirven como referencia reproducible para estudiar el impacto de la adaptación de tokenizers.
- Procesamiento por lotes de corpus nigerianos: la reducción de tokens por palabra disminuye el coste de servir grandes volúmenes de texto en estas lenguas, tanto en la nube como en infraestructura propia.

## Benchmarks y rendimiento

Todas las comparaciones son frente al modelo base N-ATLaS. Los intervalos son del 95 % de bootstrap emparejado.

| Métrica (WazoCore vs base) | Yoruba | Hausa | Igbo |
|---|---|---|---|
| Tokens por palabra | 2,87 → 1,91 | 2,12 → 1,34 | 2,53 → 1,56 |
| Aceleración de generación (palabras/s, CPU de portátil) | 1,63× | 1,61× | 1,72× |
| ΔchrF++ inglés → X, Q4_K_M | +3,4 (+2,2, +4,6) | −0,6 (−1,4, +0,3) | +0,1 (−1,3, +1,3) |
| ΔchrF++ inglés → X, held-out | +2,2 (+1,6, +2,8) | −0,4 (−0,9, 0,0) | +0,1 (−0,5, +0,7) |
| ΔchrF++ X → inglés, held-out | +0,2 (−0,4, +0,7) | −0,1 (−0,5, +0,4) | +0,9 (+0,5, +1,4) |
| AfriMGSM accuracy (WazoCore / base) | 37,2 / 33,6 | 40,4 / 38,8 | 25,6 / 28,0 |
| AfriXNLI accuracy (WazoCore / base) | 52,3 / 57,7 | 54,2 / 57,5 | 53,0 / 58,8 |

Cambios de la v13 frente a la v6 (respecto al modelo base): razonamiento matemático AfriMGSM de −11,6 a +0,9 (intervalo −2,3, +4,3); inferencia en lenguaje natural AfriXNLI de −7,5 a −4,8; repetición degenerada de 5 a 0 sobre 750 traducciones; salidas truncadas de 11 a 5.

Metodología: la velocidad se midió con llama.cpp build 9430, Q4_K_M, CPU Apple M4, 20 prompts por lengua, emparejados e intercalados, usando la versión v6 (que comparte tokenizer y eficiencia de tokens con la v13). La traducción se evaluó con ambos modelos cuantizados en llama.cpp sobre 250 frases NTREX-128 por lengua.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 16,3 GB solo para los pesos, más overhead de activaciones y caché KV; se recomienda 24 GB o más para contexto largo.
- VRAM estimada en Q4_K_M: aproximadamente 5,0 GB para los pesos; viable en GPU de consumo de 8 GB o más.
- GPU recomendadas: A100 o H100 para BF16 con contexto largo y serving de alta concurrencia; RTX 4090 (24 GB) para BF16 en un solo dispositivo; RTX 3090/4080 o superiores para Q4_K_M con margen.
- Cabe en GPU de consumo: sí, en Q4_K_M desde 8 GB de VRAM; en BF16 requiere 24 GB.
- Funciona en CPU: sí; el GGUF está validado en llama.cpp y LM Studio y corre offline en máquinas con 8 GB de memoria o más. La aceleración de 1,6-1,7× se midió en CPU Apple M4.
- Opciones de despliegue: Transformers (con `accelerate` y `device_map="auto"`), llama.cpp (`llama-server`), LM Studio, y stacks compatibles con la API de OpenAI (el repo está marcado como `endpoints_compatible` y `text-generation-inference`).
- Latencia y throughput: la model card solo publica la aceleración relativa (1,63× en yoruba, 1,61× en hausa, 1,72× en igbo en palabras/s); no se publican valores absolutos de tokens/s. El throughput por token decodificado es equivalente al del modelo base.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas foco | Licencia | Formato |
|---|---|---|---|---|---|
| WazoCore-8B | 8,15B | 131.072 (declarado) | yo, ha, ig, en | N-ATLaS Open-Source Research and Innovation License | safetensors, GGUF |
| NCAIR1/N-ATLaS (base) | 8B | no disponible en la información proporcionada | yo, ha, ig, en | no disponible en la información proporcionada | safetensors |
| Llama-3 8B | 8B | 8.192 (versión original de Llama-3) | principalmente inglés | Llama 3 Community License | safetensors, GGUF |

Frente a N-ATLaS, WazoCore mantiene el mismo tamaño y espacio de identificadores para los tokens originales, pero reduce tokens por palabra en las tres lenguas nigerianas y acelera la generación entre 1,6 y 1,7×, con una calidad de traducción comparable o ligeramente superior en yoruba. Frente a Llama-3 8B, la diferencia principal es la tokenización: Llama-3 requiere unas 2,9 tokens por palabra en yoruba, mientras que WazoCore baja a 1,91, con el consiguiente ahorro de contexto y coste. No se dispone de datos de benchmarks de N-ATLaS ni de Llama-3 8B en la información proporcionada para una comparación numérica directa.

## Limitaciones y advertencias

- La adaptación del vocabulario degrada la inferencia en lenguaje natural: AfriXNLI cae entre 3,5 y 5,8 puntos porcentuales respecto al modelo base en las tres lenguas (yoruba 52,3 vs 57,7; hausa 54,2 vs 57,5; igbo 53,0 vs 58,8).
- El razonamiento matemático en igbo sigue por debajo del base (25,6 vs 28,0 en AfriMGSM); la recuperación de la v13 es global pero no uniforme por lengua.
- La traducción inglés → hausa no mejora e incluso retrocede ligeramente (−0,6 chrF++ en Q4_K_M, −0,4 en held-out), aunque los intervalos incluyen el cero.
- Riesgo de alucinación inherente a un modelo de 8B: no se documentan mecanismos de mitigación ni datos de calibración.
- Sesgos: no se documenta ninguna evaluación de sesgos; al derivar de un modelo entrenado mayoritariamente con datos en inglés, pueden persistir sesgos culturales y lingüísticos.
- Idiomas limitados a yoruba, hausa, igbo e inglés; no se garantiza un comportamiento correcto fuera de ese conjunto.
- El contexto máximo declarado es de 131.072 tokens, pero la model card advierte de que llama-server reserva memoria para ese máximo si no se fija `-c`; en la práctica conviene limitarlo al contexto real necesario.
- Licencia restrictiva: N-ATLaS Open-Source Research and Innovation License, marcada como `license: other`. Es imprescindible revisar los términos antes de cualquier uso comercial; la model card no aclara las condiciones concretas de explotación comercial.
- El nombre licenciado es "WazoCore Powered by Awarri", lo que puede implicar obligaciones de atribución.
- Solo se distribuye una cuantización GGUF (Q4_K_M); no hay Q5, Q8 ni otras variantes en el repositorio.
- El modelo tiene 204 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es todavía muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/quantile-labs/WazoCore-8B
- Página del modelo: https://quantilelabs.com/wazocore/
- Código y evaluación: https://github.com/Quantile-Labs/wazocore
- Quantile Labs: https://quantilelabs.com/
- Modelo base: https://huggingface.co/NCAIR1/N-ATLaS
- Versión anterior (v6): https://huggingface.co/quantile-labs/WazoCore-8B-v6-long
- Dataset google/smol: https://huggingface.co/datasets/google/smol
- Dataset openai/gsm8k: https://huggingface.co/datasets/openai/gsm8k
