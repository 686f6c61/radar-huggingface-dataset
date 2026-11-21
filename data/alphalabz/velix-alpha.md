# alphalabz/VELIX-ALPHA

## Resumen

VELIX ALPHA es un modelo de lenguaje de 9.409.813.744 parámetros (aproximadamente 9,4 mil millones) desarrollado por Alpha Labz, un laboratorio que lo presenta como su segundo modelo tras LYNX ALPHA. Está construido como un ajuste fino mediante LoRA sobre `junafinity/Ornith-1.5-9B-uncensored`, un modelo base sin censura, y está especializado en análisis de malware, atribución de familias, mapeo a MITRE ATT&CK, extracción de indicadores y redacción de informes de analista. Se distribuye con licencia Apache 2.0 y pesos en safetensors y GGUF.

El modelo aborda un problema concreto: los modelos de seguridad de propósito general tienden a marcar como malicioso cualquier binario o comportamiento dual (por ejemplo, `psexec` en un script de administración), lo que los hace poco desplegables en entornos reales. VELIX ALPHA se entrena explícitamente para distinguir el uso legítimo del uso malicioso y para emitir identificadores ATT&CK concretos en lugar de descripciones genéricas. El autor reporta resultados propios sobre un conjunto de 126 elementos retenidos, comparándose con Cisco-Foundation-Sec-8B y WhiteRabbitNeo-2.5-7B.

Es relevante ahora porque combina un tamaño moderado (9,4 mil millones de parámetros, desplegable en GPU de consumo con cuantización Q4_K_M de 5,68 GB) con capacidades de seguridad ofensiva y defensiva explícitas, algo poco habitual en modelos abiertos de este tamaño. La contrapartida es que su comportamiento sin rechazo es intencionado y requiere un alcance de despliegue cuidadoso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (tag `qwen3_5` en Hugging Face; arquitectura exacta no detallada en la model card) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M; pesos completos en 16 bits (bfloat16) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (16 bits), GGUF (cuantizaciones) |

## Arquitectura y entrenamiento

VELIX ALPHA es un ajuste fino por LoRA sobre `junafinity/Ornith-1.5-9B-uncensored`, fusionado a pesos de 16 bits para su publicación. El modelo base se etiqueta con la arquitectura `qwen3_5` en Hugging Face, lo que sugiere una familia derivada de Qwen, aunque la model card no detalla la arquitectura interna (número de capas, dimensiones, mecanismo de atención). No se especifica la longitud de contexto nativa.

El entrenamiento se centró en datos de seguridad: informes de familias de malware, mapeos de técnicas MITRE ATT&CK, perfiles de familias y actores de Malpedia, reglas Sigma, firmas YARA, negativos benignos de uso dual y, según la model card truncada, material adicional de autoría de payloads. No se documenta el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO. La innovación principal no es arquitectónica sino de dominio: el ajuste enseña al modelo a emitir identificadores ATT&CK reales (hasta 10 distintos en un solo análisis) y a mantener una identidad estable bajo presión adversarial, incluida la afirmación de que en realidad es Qwen.

## Capacidades

- Generación de texto y análisis técnico en ingles, orientado a informes de seguridad.
- Atribución de familias de malware a partir de descripciones de comportamiento, herramientas y vectores de entrega.
- Mapeo de comportamientos a técnicas MITRE ATT&CK con identificadores concretos (T1486, T1204.002, T1505.003, T1566.001, entre otros).
- Extracción de indicadores de compromiso (IOC) a partir de volcados de sandbox o listas de indicadores.
- Triaje de uso dual: distingue herramientas legítimas de administración de su uso en intrusiones.
- Redacción de resúmenes de analista y informes estructurados.
- Autoría de payloads en contextos de red team (RAT, keylogger, andamiaje de C2), según los resultados reportados por el autor.
- Estabilidad de identidad: mantiene su identidad declarada sin desviarse hacia su modelo base, incluso bajo presión adversarial.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Triaje automatizado en un SOC: el modelo recibe volcados de sandbox y listas de IOC y devuelve una clasificación de familia, técnicas ATT&CK y un resumen priorizado, reduciendo el trabajo manual de primer nivel.
- Enriquecimiento de alertas EDR/SIEM: dado un evento con nombre de proceso y línea de comandos, distingue el uso administrativo legítimo de `psexec` o binarios Sysinternals del uso malicioso, lo que disminuye los falsos positivos del pipeline de detección.
- Redacción de informes de inteligencia de amenazas: convierte notas técnicas dispersas en resúmenes de analista estructurados con referencias ATT&CK, adecuados para distribución interna o a clientes.
- Análisis de reglas de detección: revisa reglas Sigma y firmas YARA, explica qué técnicas cubren y sugiere mapeos ATT&CK adicionales para huecos de cobertura.
- Ejercicios de red team y validación de detecciones: genera andamiaje de payloads y C2 en entornos controlados para probar si las reglas de detección existentes los identifican.
- Formación y simulación de analistas: sirve como motor de un entorno de práctica donde se presentan informes y el modelo evalúa o compara la atribución y el mapeo ATT&CK del alumno.
- Despliegue en estaciones de trabajo de analista: con Q4_K_M (5,68 GB) cabe en GPU de consumo y puede ejecutarse localmente con Ollama, lo que permite analizar muestras y datos sensibles sin enviarlos a servicios externos.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre 126 elementos retenidos, con temperatura 0,0 y los mismos prompts para todos los modelos. No se han verificado de forma independiente.

Comparación con modelos de seguridad del mismo dominio:

| Lane | VELIX ALPHA | Cisco-Foundation-Sec-8B | WhiteRabbitNeo-2.5-7B |
|---|---|---|---|
| Atribución de familia (30) | 30/30 | 23/30 | 20/30 |
| Triaje benigno (30) | 24/30 | 13/30 | 13/30 |
| Autoría de payload (10) | 7/10 | 0/10 | 1/10 |

Comparación emparejada contra su modelo base, mismo proceso y mismo runner:

| Lane | Base (Ornith-1.5-9B-uncensored) | VELIX ALPHA | Delta |
|---|---|---|---|
| Atribución de familia (30) | 24/30 | 29/30 | +5 |
| Triaje benigno (30) | 20/30 | 21/30 | +1 |
| Autoría de payload (10) | 1/10 | 7/10 | +6 |

Sonda de cuantizaciones sobre una batería de 12 elementos (5 numéricos, 5 de concepto de dominio, 2 de identidad):

| Quant | Tamano | Digitos | Conceptos | Identidad |
|---|---|---|---|---|
| Q8_0 | 9,53 GB | no probado | no probado | no probado |
| Q6_K | 7,36 GB | no probado | no probado | no probado |
| Q5_K_M | 6,49 GB | 5/5 | 4/5 | 2/2 |
| Q4_K_M | 5,68 GB | 5/5 | 4/5 | 2/2 |
| Q3_K_M | 4,68 GB | 5/5 | 4/5 | 2/2 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits (bfloat16): en torno a 19 GB solo para pesos, más overhead de activaciones y KV cache; requiere GPU de 24 GB o más.
- VRAM estimada con Q4_K_M (5,68 GB): aproximadamente 7-8 GB en total, desplegable en GPUs de consumo de 8 GB o más.
- VRAM estimada con Q3_K_M (4,68 GB): aproximadamente 6 GB en total.
- GPUs recomendadas: A100 o H100 para 16 bits y despliegues concurrentes; RTX 4090 (24 GB) para 16 bits en una sola tarjeta; RTX 3090, RTX 4080 y RTX 4070 Ti para cuantizaciones Q5_K_M y Q4_K_M.
- Cabe en GPU de consumo: sí, con Q4_K_M y Q3_K_M en tarjetas de 8 GB o más.
- Opciones de despliegue: transformers (ejemplo oficial con `AutoModelForCausalLM`), llama.cpp y Ollama (se distribuye un `Modelfile` con el system prompt), vLLM y TGI como opciones compatibles con el formato safetensors (no confirmadas explícitamente en la model card).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VELIX ALPHA | 9,4 B | no disponible | Análisis de malware, ATT&CK, uso dual | Apache 2.0 | Hugging Face, GGUF |
| Cisco-Foundation-Sec-8B | 8 B | no disponible | Conocimiento de seguridad general | no disponible | Referenciado en la model card |
| WhiteRabbitNeo-2.5-7B | 7 B | no disponible | Seguridad ofensiva y defensiva | no disponible | Referenciado en la model card |
| Ornith-1.5-9B-uncensored | 9 B | no disponible | Base sin censura (modelo base de VELIX) | no disponible | Hugging Face |

En la comparación del autor, VELIX ALPHA supera a Cisco-Foundation-Sec-8B y WhiteRabbitNeo-2.5-7B en las tres lanes evaluadas, con una diferencia especialmente marcada en autoría de payload (7/10 frente a 0/10 y 1/10) y en triaje benigno (24/30 frente a 13/30 en ambos). Frente a su propio modelo base, la mejora es de +5 en atribución de familia y +6 en autoría de payload, con solo +1 en triaje benigno, lo que indica que la ganancia principal está en conocimiento específico de familias y en capacidad ofensiva, no en la discriminación de uso dual.

## Limitaciones y advertencias

- El comportamiento sin rechazo es intencionado y explícito: el modelo responde a preguntas de seguridad ofensiva, incluida la autoría de payloads. Requiere un alcance de despliegue controlado y revisión legal antes de uso en producción.
- Los benchmarks son autoinformados por el autor sobre 126 elementos, sin verificación independiente ni publicación de los conjuntos de evaluación.
- Solo soporta ingles; no se documenta capacidad multilingüe.
- No se especifica la longitud de contexto, lo que impide planificar análisis de informes largos o volcados extensos.
- La identidad del modelo presenta una inconsistencia conocida: el adaptador se entrenó con filas que describían VELIX como el primer modelo de Alpha Labz, por lo que sin system prompt puede decir "first" en lugar de "second". El `Modelfile` y el ejemplo de uso corrigen esto en el prompt de sistema.
- Q8_0 y Q6_K se generaron pero no se probaron por un error del kernel de compilación; sus puntuaciones no se reportan.
- Riesgo de alucinación en atribución de familias y mapeos ATT&CK: el modelo puede emitir identificadores plausibles pero incorrectos, por lo que las salidas deben validarse contra fuentes como Malpedia o el propio marco ATT&CK.
- Sesgos conocidos: no documentados por el autor.
- Licencia Apache 2.0 permite uso comercial, pero la naturaleza del contenido generado (payloads, técnicas ofensivas) puede estar sujeta a restricciones legales según la jurisdicción.
- El repositorio registra 0 descargas en el momento de la consulta, lo que limita la evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphalabz/VELIX-ALPHA
- Modelo base: https://huggingface.co/junafinity/Ornith-1.5-9B-uncensored
- MITRE ATT&CK: https://attack.mitre.org/
- Malpedia: https://malpedia.caad.fkie.fraunhofer.de/
- Sigma: https://github.com/SigmaHQ/sigma
- YARA: https://github.com/VirusTotal/yara
- Ollama: https://ollama.com/
