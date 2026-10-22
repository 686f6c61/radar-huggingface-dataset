# ProprietaryLegal/DeepSeek-V4.1-Flash-1017-EXL3-2.75bpw-LegalWeighted-DGX-Spark

## Resumen

DeepSeek-V4.1-Flash-1017 es un modelo de mezcla de expertos (MoE) publicado por DeepSeek el 17 de octubre de 2026 con pesos abiertos bajo licencia MIT, orientado a codificación agéntica, con entrada de imágenes, tool calling y una ventana de contexto de 327.680 tokens. Esta ficha cubre la variante cuantizada EXL3 a 2,75 bpw publicada por PLI Labs (ProprietaryLegal) el 21 de octubre de 2026, derivada de la cuantización de HeNryous diseñada para dos NVIDIA DGX Spark (GB10) en paralelo tensorial.

Su rasgo distintivo es la reasignación de bits ponderada por texto legal: 1.414 de los 15.360 expertos enrutados, repartidos en 16 de las 40 capas, se recodificaron desplazando bits hacia los expertos más relevantes para texto jurídico. No es un ajuste fino (no se entrenó ningún peso): solo se redistribuye el error de cuantización, lo que reduce un 9,0 % la divergencia KLD frente al modelo nativo en el panel legal (0,0274 → 0,0249) a costa de un 1,5 % más en el general (0,0201 → 0,0204).

La variante mantiene tamaño, formato y tiempo de ejecución del baseline, y conserva el contexto de 320K tokens, la visión, el tool calling y la decodificación especulativa DSpark, lo que la hace atractiva para despachos y departamentos legales que necesiten inferencia local y privada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (familia DeepSeek V4.1-Flash), con torre de visión y borrador DSpark para decodificación especulativa; pipeline image-text-to-text |
| Parámetros totales | No disponible (15.360 expertos enrutados en 40 capas) |
| Parametros activos | No disponible |
| Longitud de contexto | 327.680 tokens |
| Tipos de cuantización | EXL3 2,75 bpw medio en expertos enrutados (2 bpw: 39,7 % · 3 bpw: 46,1 % · 4 bpw: 13,8 % · 5 bpw: 0,4 %); atención EXL3 5 bpw; expertos compartidos 6 bpw; cabecera de salida densa 5 bpw + expertos 2 bpw; torre de visión BF16; borrador DSpark sin cambios |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | EXL3 (trellis, codebook mul1, exllamav3 1.6.0); 198,8 GB en este repositorio + 203,1 GB de tablas Engram del repositorio base |

## Arquitectura y entrenamiento

El modelo base, DeepSeek-V4.1-Flash-1017 (commit `1bae0e10`), es un transformer MoE con 15.360 expertos enrutados distribuidos en 40 capas, expertos compartidos, torre de visión para entrada de imágenes y un módulo «DSpark drafter» que habilita decodificación especulativa. El modelo se acompaña de dos tablas Engram (203,1 GB) que no están incluidas en este repositorio y deben descargarse del repositorio base. Los detalles de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) no están disponibles en la información proporcionada.

La innovación de esta variante no está en la arquitectura sino en la cuantización: los autores midieron la importancia de cada experto sobre texto legal y sobre texto general y comprobaron que difiere sustancialmente (Spearman mediana por capa de 0,61; solapamiento Jaccard de 0,29 en los conjuntos del top-10 %; consistencia con Spearman split-half de 0,97; 1.657 expertos resultan al menos 2× más importantes en texto legal en ambas mitades de los datos, y 6.771 se inclinan por el uso general). Con ese diagnóstico, recodificaron 1.414 expertos en las capas 2–10, 12, 14–18 y 25 (698 suben de bitrate y 716 bajan) dentro del mismo presupuesto de bytes, usando el conjunto de calibración `cal_v3` de sudoingX. Los archivos modificados son `exl3_moe_plan.json` y los 32 ficheros de expertos de esas capas; todo lo demás es byte-idéntico al baseline de HeNryous (commit `86f85253`).

## Capacidades

- Generación de texto y razonamiento, con fidelidad de cuantización medida por KLD frente al modelo nativo en paneles legales y generales.
- Entrada de imágenes (pipeline image-text-to-text); la torre de visión se mantiene en BF16, sin cambios respecto al baseline.
- Tool calling / function calling soportado, con una familia específica de evaluación de fidelidad en uso de herramientas.
- Contexto largo: hasta 327.680 tokens, útil para documentos y expedientes extensos.
- Decodificación especulativa DSpark incluida en el formato para reducir la latencia de inferencia.
- Modo de razonamiento (thinking): la model card lo referencia al generar las respuestas del panel de evaluación («thinking off, T = 1.0»), lo que indica un modo conmutable en el modelo base.
- Capacidades agénticas de código en el modelo base, según la cobertura del lanzamiento (sin cifras publicadas en la información disponible).
- Afinidad mejorada con texto jurídico en cuanto a fidelidad de cuantización (no aporta conocimiento legal nuevo).
- Capacidades multilingües: no disponible.

## Casos de uso

- Redacción y revisión de documentos jurídicos (contratos, escritos, cláusulas): la familia «drafting» del panel legal mejora un 12,3 % en KLD (0,0379 → 0,0333), la mayor ganancia de todas, lo que hace de la redacción el caso de uso más favorecido por esta variante.
- Razonamiento sobre normativa y autoridad pública: la familia «authority reasoning» mejora un 9,0 % (0,0269 → 0,0245), adecuada para analizar casos con citas a preceptos y resolver cuestiones de competencia.
- Control de alucinaciones en respuestas legales: la familia «hallucination control» mejora un 11,0 % (0,0285 → 0,0253), relevante cuando se exige fidelidad estricta a las fuentes y se deben evitar citas inventadas.
- Extracción estructurada de datos de documentos legales (partes, fechas, obligaciones): soportada por el pipeline multimodal y el contexto de 320K tokens, aunque la familia «extraction» empeora ligeramente (+3,6 % en KLD).
- Agentes con tool calling para flujos jurídicos (consulta de bases de datos, cálculo de plazos, generación de borradores en cadena): el tool calling se conserva intacto respecto al baseline y la familia «tools» mejora un 8,6 % en KLD.
- Despliegue local y privado en dos DGX Spark para despachos o departamentos legales: los datos sensibles no salen del entorno; la calibración del panel se hizo con asuntos ficticios y autoridad pública, nunca con material de clientes.
- Revisión de expedientes y contratos extensos: la ventana de 327.680 tokens permite procesar documentos largos sin fragmentación.
- Uso general mixto (chat, código, visión) en el mismo despliegue: la degradación en el panel general es mínima (+1,5 % en KLD), por lo que el modelo sigue siendo utilizable fuera del dominio legal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para esta variante en la información disponible. Lo que sí se ha publicado es la fidelidad de cuantización medida como KL(native ‖ quant) y acuerdo top-1 con el modelo nativo, usando la implementación de referencia de la receta sudoingX (`p4_kld.py`, soporte top-128 nativo más bucket de cola) y los pesos oficiales 1017 como referencia, con el mismo hardware y código para ambas builds. El harness reproduce exactamente el 0,0201 publicado por el baseline y sus ocho valores por dominio.

Panel legal (210 secuencias, ~214K tokens, 66.901 posiciones; asuntos ficticios y autoridad pública; respuestas generadas por el baseline con thinking desactivado y T = 1,0):

| Familia | Posiciones | KLD baseline | KLD este repositorio | Top-1 baseline → este repo |
|---|---:|---:|---:|---|
| Redacción (drafting) | 26.971 | 0,0379 | 0,0333 (−12,3 %) | 96,46 % → 96,63 % |
| Razonamiento de autoridad | 16.261 | 0,0269 | 0,0245 (−9,0 %) | 95,94 % → 96,21 % |
| Preservación (reformulación fiel) | 15.065 | 0,0152 | 0,0157 (+3,4 %) | 98,37 % → 98,49 % |
| Herramientas (tools) | 3.608 | 0,0079 | 0,0072 (−8,6 %) | 99,42 % → 99,25 % |
| Extracción | 2.674 | 0,0173 | 0,0180 (+3,6 %) | 98,69 % → 98,77 % |
| Control de alucinación | 2.322 | 0,0285 | 0,0253 (−11,0 %) | 96,04 % → 96,38 % |
| Total familias legales | 66.901 | 0,0274 | 0,0249 (−9,0 %) | 97,00 % → 97,16 % |
| Control: escritura creativa corta | 4.179 | 0,1216 | 0,1174 (−3,5 %) | — |

Panel general (sudoingX, 199 conversaciones, 254.846 posiciones; el desglose por dominios aparece truncado en la fuente):

| Panel | Posiciones | KLD baseline | KLD este repositorio | Top-1 este repo |
|---|---:|---:|---:|---:|
| General | 254.846 | 0,0201 | 0,0204 (+1,5 %) | 95,91 % |

## Requisitos de hardware

- Configuración de referencia: TP2 sobre dos NVIDIA DGX Spark (GB10), con la misma imagen de servicio que el baseline y contexto completo de 320K tokens.
- Memoria: 198,8 GB de pesos en este repositorio más 203,1 GB de tablas Engram del repositorio base (~401,9 GB en total). Cada DGX Spark dispone de 128 GB de memoria unificada LPDDR5x (256 GB entre ambas unidades), cifra inferior al conjunto completo, por lo que el despliegue de referencia debe apoyar parte de los datos (presumiblemente las tablas Engram) en almacenamiento; la model card no detalla este punto.
- No cabe en GPU de consumo: solo los pesos de expertos (~199 GB) superan con holgura la VRAM de configuraciones multi-GPU domésticas (por ejemplo, 4× RTX 4090 de 24 GB suman 96 GB).
- Software: exllamav3 1.6.0 es obligatorio para el formato EXL3; no es compatible con llama.cpp, Ollama, vLLM ni TGI. La receta de referencia es sudoingX/dgx-spark-deepseek-v41.
- Verificación de integridad: `RELEASE_MANIFEST.json` incluye tamaño y sha256 de cada archivo, incluidas las dos particiones Engram.
- Decodificación especulativa DSpark disponible para reducir la latencia; cifras de latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Repositorio | Tipo | bpw medio | Tamaño de pesos | KLD legal / general | Licencia |
|---|---|---:|---:|---|---|
| ProprietaryLegal LegalWeighted (este) | EXL3 con bits reasignados a expertos legales | 2,75 | 198,8 GB (+203,1 GB Engram) | 0,0249 / 0,0204 | MIT |
| HeNryous baseline DGX-Spark | EXL3 con plan calibrado en texto general | 2,75 | 198,8 GB (+203,1 GB Engram) | 0,0274 / 0,0201 | MIT |
| LibertAIDAI EXL3 2.9bpw | EXL3 comunitario a mayor bitrate | 2,9 | No disponible | No disponible | MIT |
| deepseek-ai base (nativo) | BF16, referencia de calidad | 16 (BF16) | No disponible | Referencia de las mediciones | MIT |

Existe además una variante abliterada a 2,9 bpw (dealignai, publicada como espejo de su repositorio UNCENSORED), orientada a otro perfil de uso. Frente al baseline de HeNryous, este repositorio ofrece la misma huella exacta (bytes de expertos idénticos, +0,0000 %) con mejor fidelidad en texto legal y una regresión mínima en texto general.

## Limitaciones y advertencias

- No es un ajuste fino jurídico: la model card lo indica expresamente («no se entrenó ningún peso; el modelo no sabe nada que no supiera antes»). Solo redistribuye el error de cuantización; no aporta conocimiento normativo actualizado ni sustituye a un profesional del derecho.
- Ligera regresión en dominio general: KLD de 0,0201 a 0,0204 (+1,5 %). Dentro del propio panel legal, las familias de preservación (+3,4 %) y extracción (+3,6 %) empeoran, y el acuerdo top-1 en la familia de herramientas baja de 99,42 % a 99,25 %.
- Riesgo de alucinación inherente a los grandes modelos de lenguaje, especialmente sensible en el ámbito legal (citas, preceptos o plazos inventados). La existencia de una familia de evaluación de control de alucinación indica que el problema se monitoriza, no que desaparezca.
- Sesgos conocidos: no disponibles; la composición de los datos de entrenamiento del modelo base no está documentada en la información proporcionada.
- Idiomas soportados: no especificados ni en la model card ni en los metadatos del repositorio.
- Dependencia de ecosistema: el formato EXL3 exige exllamav3 1.6.0 y no funciona con llama.cpp, Ollama, vLLM ni TGI; las tablas Engram deben descargarse aparte del repositorio base y verificarse con los sha256 del manifiesto.
- Requisitos de hardware muy específicos: dos DGX Spark; inviable en estaciones de trabajo de consumo.
- Adopción temprana: 0 descargas y 0 likes en el momento de redacción. La metodología es transparente y el harness reproduce los valores publicados del baseline, pero se trata de una cuantización de terceros sin validación comunitaria amplia.
- Licencia MIT en el repositorio y en el modelo base: no se identifican restricciones para uso comercial.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/ProprietaryLegal/DeepSeek-V4.1-Flash-1017-EXL3-2.75bpw-LegalWeighted-DGX-Spark
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Cuantización baseline de HeNryous: https://huggingface.co/HeNryous/DeepSeek-V4.1-Flash-1017-EXL3-2.75bpw-DGX-Spark
- exllamav3 (runtime obligatorio): https://github.com/turboderp-org/exllamav3
- Receta de referencia sudoingX: https://github.com/sudoingX/dgx-spark-deepseek-v41
- Cuantización alternativa a 2,9 bpw: https://huggingface.co/LibertAIDAI/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw
- Variante abliterada (espejo): https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-ABLITERATED
- Cobertura del lanzamiento: https://www.cometapi.com/deepseek-v4-1-flash-1017/
- Cobertura del lanzamiento (licencia MIT): https://tech-insider.org/deepseek-v4-1-flash-1017-mit-license-update-2026/
- Cobertura del lanzamiento (codificación agéntica): https://the-ctr.net/deepseek-v4-1-flash-1017-release
