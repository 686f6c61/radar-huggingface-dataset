# ApollonLabs/Helios-1-MoVA-36B-A4B-GGUF

## Resumen

Helios 1 es la cuantización GGUF publicada por Apollon Labs del modelo IFM/K2-Horizon-MoVA-36B-A4B, un Mixture-of-Experts (MoE) de 36B parámetros con 4B activos por token y una arquitectura de atención denominada Mixture-of-Values (MoVA). Los pesos originales, los datos de entrenamiento y el código de entrenamiento pertenecen a IFM (MBZUAI); Apollon Labs solo aporta la matriz de importancia (imatrix), la cuantización y las mediciones de divergencia KL frente al checkpoint BF16.

El modelo base declara una ventana de contexto nativa de 512K tokens, lo que lo sitúa en la categoría de modelos de contexto largo con activación dispersa eficiente. La relevancia de esta ficha radica en que la cuantización permite ejecutar un MoE de 36B en hardware modesto: con Q4_K_S (19,9 GiB) y descarga de expertos a CPU, el modelo corre en una GPU de 6 GB junto con 32 GB de RAM, a unos 8 tokens/s de generación y 75 tokens/s de prefill a 20K de contexto.

La licencia Apache 2.0 del modelo base se mantiene en esta distribución. El idioma declarado es únicamente inglés. El repositorio ocupa 140,9 GB e incluye varias cuantizaciones (Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S) junto con la imatrix empleada para generarlas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con atención Mixture-of-Values (MoVA) |
| Parametros totales | 37.444.792.020 (≈36B, según safetensors del modelo base) |
| Parametros activos | 4B por token |
| Longitud de contexto | 512K tokens nativa |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S (GGUF) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (imatrix propia de Apollon Labs incluida en el repo) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 36B parámetros totales y 4B activos por token, lo que reduce el coste computacional por token a la altura de un modelo denso de 4B mientras mantiene la capacidad de representación de uno de 36B. La innovación arquitectónica destacada es la atención Mixture-of-Values (MoVA), que introduce expertos específicos en el pathway de valores de la atención (`attn_v_exps`), aproximadamente el 20% de los pesos según las mediciones de Apollon Labs. Estos expertos de valores son, de acuerdo con sus pruebas, la parte más sensible a la cuantización del modelo.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO en la información proporcionada. Tampoco se detalla el esquema de enrutamiento del MoE ni el número total de expertos. Lo que sí está documentado es el proceso de cuantización: Apollon Labs generó la imatrix con `llama-imatrix` sobre 100 muestras de 512 tokens extraídas del checkpoint Q8_0, con una composición de calibración de aproximadamente 56% código (stdlib de Python, C++ de llama.cpp), 30% prosa técnica en inglés, 9% JSON y código de herramientas, y 5% griego, ponderada hacia código. La calibración está disjunta del conjunto de test.

Las mediciones de calidad se realizaron con `llama-perplexity --kl-divergence-base` contra el BF16 en CPU, y las cuantizaciones se ejecutaron en la configuración real de uso (atención y pesos compartidos en GPU de 6 GB vía Vulkan, expertos en CPU con `-ngl 999 -ot exps=CPU`). El conjunto de test fueron 40 muestras de 512 tokens de código reservado, prosa inglesa y algo de griego, sin contaminación de benchmarks. La comparación con una Q4_K_S sin imatrix propia da una KLD media de 0,0327 (0,341 en el percentil 99) frente a 0,0247 (0,242) de la versión de Apollon Labs: mismo tamaño, 25% más cerca del BF16.

## Capacidades

- Generación de texto conversacional en inglés, con modo de razonamiento (*thinking*) activado por defecto y desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`.
- Generación de código: 90,2% de pass@1 en HumanEval (148/164) con thinking desactivado y límite de 4096 tokens, medido sobre Q4_K_S.
- Recuperación en contexto largo: 3/3 aciertos en pruebas de recall a 8K y 16K tokens, con ventana nativa de 512K.
- Soporte de plantilla de chat compatible con `--jinja` en llama.cpp, incluidos tokens de parada y modos con y sin thinking.
- Capacidad multilingüe limitada: el modelo declara únicamente inglés; el griego aparece solo en los datos de calibración de la imatrix, no como idioma soportado oficialmente.
- No hay información disponible sobre soporte de tool calling, function calling, agentes multi-paso, visión, audio u otras modalidades.

## Casos de uso

- Generación de código en producción: el modelo alcanza 90,2% de pass@1 en HumanEval con thinking desactivado, por lo que puede integrarse en pipelines de revisión, autocompletado o generación de tests donde se requiera latencia controlada y contexto de repositorio amplio.
- Asistencia sobre bases de código extensas: con 512K tokens de contexto nativo, puede ingerir módulos completos, documentación y trazas de error en una sola ventana sin fragmentación, útil para depuración de sistemas grandes.
- Despliegue en hardware de gama baja: la cuantización Q4_K_S (19,9 GiB) con expertos en CPU permite servir el modelo en una GPU de 6 GB y 32 GB de RAM a unos 8 tokens/s, adecuado para entornos de desarrollo locales, laboratorios con presupuesto limitado o estaciones de trabajo sin GPUs de datacenter.
- Servicio de chat conversacional en inglés: el modelo base está orientado a conversación y la plantilla de chat funciona en la rama de llama.cpp de IFM, lo que permite montar un endpoint compatible con la API de OpenAI mediante `llama-server`.
- Análisis de documentos técnicos largos: gracias al contexto de 512K y a la calibración de la imatrix orientada a prosa técnica y código, es adecuado para resumir especificaciones, RFCs o manuales extensos en inglés.
- Evaluación comparativa de cuantizaciones: el repositorio incluye métricas de KLD por archivo, lo que lo convierte en un caso práctico para estudiar el impacto de la imatrix y de distintos niveles de cuantización en un MoE con expertos de atención, útil en investigación sobre compresión de modelos.
- Razonamiento con modo thinking para tareas de mayor complejidad: al estar activado por defecto, puede emplearse en escenarios donde se prefiera una cadena de razonamiento explícita, desactivándolo cuando se priorice el throughput.

## Benchmarks y rendimiento

| Prueba | Helios 1 Q4_K_S | Q4_K_S sin imatrix de Apollon Labs |
|---|---|---|
| HumanEval pass@1 (thinking off, 4096 max tokens) | 148/164 = 90,2% | 148/164 = 90,2% |
| Recall en contexto largo, 8K | 3/3 | 3/3 |
| Recall en contexto largo, 16K | 3/3 | 3/3 |

Calidad de cuantización medida como divergencia KL frente al BF16:

| Archivo | Tamano | % del BF16 | KLD media ↓ | KLD p99 ↓ | Mismo token top ↑ | PPL vs BF16 |
|---|---|---|---|---|---|---|
| Q8_0 | 37,1 GiB | 53% | 0,0079 | 0,103 | 96,2% | +0,25% |
| Q6_K | 28,7 GiB | 41% | 0,0099 | 0,110 | 96,0% | +0,34% |
| Q5_K_M | 24,6 GiB | 35% | 0,0132 | 0,141 | 95,1% | +0,53% |
| Q4_K_M | 20,8 GiB | 30% | 0,0226 | 0,234 | 93,7% | +1,20% |
| Q4_K_S | 19,9 GiB | 28,5% | 0,0247 | 0,242 | 93,3% | +1,25% |

Referencia sin imatrix propia en Q4_K_S: KLD media 0,0327 y p99 0,341. No se han publicado resultados de MMLU, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: con Q4_K_S (19,9 GiB) y descarga de expertos a CPU, la atención y los pesos compartidos caben en una GPU de 6 GB; el resto reside en RAM del sistema.
- Configuración de referencia de Apollon Labs: GTX 1660 (6 GB) + DDR4-2400 (32 GB de RAM), con `-ngl 999 -ot "ffn_.*_exps=CPU"` y `-ot "blk\.(19|[2-4][0-9])\.attn_v_exps=CPU"`, KV cache en q8_0 y flash attention activada.
- Rendimiento medido en esa configuración: aproximadamente 8 tokens/s de generación y 75 tokens/s de prefill a 20K de contexto.
- Recomendación por RAM: 32 GB → Q4_K_S o Q4_K_M; 48 GB → Q5_K_M; 64 GB o más → Q6_K. Según el autor, Q8_0 no aporta mejora medible sobre Q6_K.
- Opciones de despliegue: llama.cpp (rama `model/K2Horizon` del fork de IFM, commit `42adf01`), servidor `llama-server` con `--jinja`. El modelo no está en llama.cpp upstream, por lo que vLLM, TGI, Ollama u otros runtimes no están confirmados como compatibles en la información disponible.
- Alternativa de cuantización probada y descartada: todos los expertos en IQ4_XS más Q3_K en up/gate de las capas 10–35 ocupa 18,1 GiB con la misma KLD y HumanEval, pero es un 20% más lento en procesamiento de prompt en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Activos por token | Contexto | Licencia | Formato disponible |
|---|---|---|---|---|---|
| Helios 1 (K2-Horizon-MoVA-36B-A4B GGUF) | 36B | 4B | 512K | Apache 2.0 | GGUF (Q4–Q8) |
| IFM/K2-Horizon-MoVA-36B-A4B (base) | 36B | 4B | 512K | Apache 2.0 | BF16 (safetensors) |
| Q4_K_S sin imatrix de Apollon Labs | 36B | 4B | 512K | Apache 2.0 | GGUF Q4_K_S |

No se dispone de datos de benchmarks comparativos frente a otros modelos MoE de tamaño similar (por ejemplo, variantes de 30–40B con 3–5B activos) en la información proporcionada. La comparación directa más relevante es contra el checkpoint BF16 del que deriva y contra la cuantización sin imatrix, cuyos resultados de KLD y HumanEval se incluyen en la tabla de benchmarks.

## Limitaciones y advertencias

- Idioma: el modelo declara únicamente inglés; no hay evidencia de calidad en castellano ni en otros idiomas.
- Normalización Unicode: el tokenizer oficial aplica NFC y llama.cpp no. Texto con acentos descompuestos (por ejemplo, `e` + acento combinante en lugar de `é`) se tokeniza de forma distinta; si la entrada puede no estar en NFC, hay que normalizarla antes de enviarla.
- Compatibilidad de runtime: requiere la rama `model/K2Horizon` del fork de llama.cpp de IFM; no está en upstream, lo que limita el uso con vLLM, TGI u Ollama salvo que se verifique su soporte.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad ni de sesgos en la información disponible; debe asumirse el riesgo habitual de un modelo generativo sin datos específicos.
- Sensibilidad de la cuantización: los expertos de valores de atención (`attn_v_exps`) son la parte más sensible; bajarlos a Q3_K incrementa la KLD media un 51%, y subirlos a Q5_K apenas mejora. La configuración Q4_K para esos expertos es la recomendada.
- Thinking activado por defecto: incrementa el consumo de tokens y la latencia; para producción con latencia ajustada conviene desactivarlo explícitamente por petición.
- Licencia: Apache 2.0 permite uso comercial, pero deben respetarse las obligaciones de atribución y aviso de la licencia; los pesos originales son de IFM (MBZUAI) y la cuantización de Apollon Labs.
- Madurez del proyecto: el repositorio tiene cero descargas y cero likes en el momento de la consulta, por lo que no hay validación independiente de terceros sobre las métricas declaradas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ApollonLabs/Helios-1-MoVA-36B-A4B-GGUF
- Modelo base: https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B
- Fork de llama.cpp con soporte K2 Horizon (rama `model/K2Horizon`): https://github.com/MBZUAI-IFM/llama.cpp
- No se han encontrado otros enlaces (papers, blogs, demos) en la información proporcionada.
