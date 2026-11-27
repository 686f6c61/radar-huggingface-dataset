# HomelessEmo/REDCELL-26B-A4B-OSINT-Cyber-APEX-GGUF

## Resumen

REDCELL-26B-A4B-OSINT-Cyber-APEX-GGUF es un ajuste fino supervisado (SFT) del modelo Gemma 4 26B-A4B de Google, desarrollado por el autor terrorswift (publicado bajo la cuenta HomelessEmo en Hugging Face). El modelo está orientado a inteligencia de fuentes abiertas (OSINT), inteligencia de amenazas cibernéticas (CTI) y periodismo de investigación, y se distribuye exclusivamente en formato GGUF para su ejecución local mediante llama.cpp y herramientas compatibles.

La arquitectura subyacente es un transformer con mezcla de expertos (MoE) de 25.233.142.046 parámetros totales y aproximadamente 4.000 millones de parámetros activos por token, con una ventana de contexto de 262.144 tokens. El ajuste se realizó mediante LoRA de 16 bits sobre el modelo base `unsloth/gemma-4-26B-A4B-it`, sin aplicar técnicas de abliteración, de modo que conserva el comportamiento de seguridad general del modelo original.

Su relevancia actual radica en que ofrece un perfil de "analista sénior" con metodología estructurada (sistema Admiralty de clasificación de fuentes, calibración explícita de confianza, referencias a herramientas reales como Shodan, Censys, VirusTotal o MITRE ATT&CK) en un paquete cuantizado que cabe en hardware de consumo, además de soporte experimental de decodificación especulativa MTP en llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), familia Gemma 4 |
| Parametros totales | 25.233.142.046 (≈26B) |
| Parametros activos | ≈4B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | F16, Q8_0, APEX-I-Balanced, APEX-Balanced, APEX-I-Quality, APEX-Quality, APEX-I-Compact, APEX-Compact, APEX-Mini |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repositorio de 202,6 GB con todas las variantes) |
| Modelo base | unsloth/gemma-4-26B-A4B-it |
| Metodo de ajuste | LoRA de 16 bits (SFT) |
| Entrada multimodal | Vision (etiqueta `vision`/`multimodal` en la model card) |
| Fecha de creacion | 2026-11-27 |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 26B-A4B, un transformer con mezcla de expertos en el que cada token activa aproximadamente 4.000 millones de parámetros de un total de 25.233 millones. La ventana de contexto nativa es de 262.144 tokens. El ajuste fino se realizó mediante LoRA de 16 bits en modalidad SFT (supervised fine-tuning) sobre el modelo base vanilla de unsloth, con un dataset propio compuesto por 4 ejes de dominio y 33 subcategorías, según indica la model card.

El autor declara explícitamente que el modelo no ha sido abliterado ni descensurado: el comportamiento de seguridad general y el razonamiento se heredan intactos del modelo base. Una innovación destacable es el soporte experimental de decodificación especulativa MTP (multi-token prediction) añadido el 13-10-2026, que incorpora la cabeza borrador (draft head) del Gemma 4 26B-A4B original y funciona con REDCELL en llama.cpp, con una tasa de aceptación de borradores de aproximadamente 0,6 en pruebas locales del autor.

Las cuantizaciones APEX emplean una receta propia con matriz de importancia (i-matrix) en las variantes "I-", y aplican protección de primeras capas (las ~5 primeras capas transformer se mantienen un paso de precisión por encima del valor por defecto del nivel). El autor documenta que ciertos tensores de expertos enrutados de Gemma 4 no son divisibles por 256, lo que provoca que `llama-quantize` recurra a tipos compatibles de bloques de 32 elementos (Q5_1, Q4_0, Q5_0, IQ4_NL) en 60 tensores repartidos entre los distintos niveles.

## Capacidades

- Generación de texto y razonamiento analítico estructurado orientado a investigación.
- Metodología OSINT: aplicación del sistema Admiralty (A-F para fiabilidad de fuente, 1-6 para credibilidad de información) y calibración explícita de confianza en cada evaluación.
- Referencia a herramientas y recursos reales del dominio: Shodan, Censys, VirusTotal, SecurityTrails, crt.sh, urlscan.io, OpenCorporates, OpenSanctions, identificadores de técnicas MITRE ATT&CK, formatos CVE y URLs de registros.
- Distinción entre reconocimiento pasivo y recolección activa, señalando cuándo un paso implica riesgo legal o ético.
- Capacidad multimodal de visión (etiquetada en la model card como `vision`/`multimodal`).
- Soporte de conversación multi-turno gracias a la ventana de contexto de 262.144 tokens.
- Decodificación especulativa MTP experimental en llama.cpp.
- No se documenta en la información disponible soporte explícito de tool calling ni de function calling.
- No se documenta en la información disponible un modo "thinking" dedicado.

## Casos de uso

- Triaje de inteligencia de amenazas: el modelo puede procesar informes extensos de CTI (hasta 262.144 tokens de contexto) y producir evaluaciones con clasificación Admiralty y niveles de confianza explícitos, adecuado para equipos de CERT y SOC que necesitan priorizar indicadores.
- Investigación OSINT pasiva: dado un dominio u organización, el modelo estructura un plan de reconocimiento con herramientas concretas (crt.sh, SecurityTrails, urlscan.io) y advierte cuándo una acción cruza a recolección activa con implicaciones legales.
- Periodismo de investigación: análisis de documentación extensa y verificación de fuentes con calibración de confianza, útil para redacciones que necesitan contrastar afirmaciones y documentar el proceso analítico.
- Enriquecimiento de indicadores de compromiso: interpretación de formatos CVE e identificadores MITRE ATT&CK para mapear vulnerabilidades a tácticas y técnicas de adversario.
- Análisis de imágenes en contexto de investigación: gracias a su capacidad de visión, puede examinar capturas o material gráfico aportado en una investigación y describir hallazgos relevantes.
- Despliegue local en estaciones de analista: las variantes APEX-Compact (13,7 GB) y APEX-Mini (11,4 GB) permiten ejecutar el modelo en hardware de consumo mediante llama.cpp, sin enviar datos sensibles a servicios en la nube.
- Formación y documentación de tradecraft: el modelo explica el razonamiento paso a paso, lo que lo hace útil para entrenar analistas junior en metodología estructurada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según variante GGUF: F16 ≈47,0 GB; Q8_0 ≈25,0 GB; APEX-I-Balanced y APEX-Balanced ≈19,2 GB; APEX-I-Quality y APEX-Quality ≈18,4 GB; APEX-I-Compact y APEX-Compact ≈13,7 GB; APEX-Mini ≈11,4 GB.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño de pesos, las variantes de 18-19 GB encajan en GPUs con 24 GB de VRAM (por ejemplo, RTX 3090 o RTX 4090); F16 y Q8_0 requieren GPUs de clase A100/H100 o configuraciones multi-GPU.
- Cabe en GPU de consumo: sí, las variantes APEX-Compact y APEX-Mini (11,4-13,7 GB) caben en GPUs de 16 GB o más; las variantes Balanced y Quality requieren 24 GB.
- Opciones de despliegue: llama.cpp y herramientas compatibles con GGUF (según la model card); el repositorio está etiquetado como `endpoints_compatible`.
- Latencia y throughput: no disponibles. El autor indica que la aceleración por decodificación especulativa MTP es dependiente del hardware, con una tasa de aceptación de borradores de aproximadamente 0,6 en sus pruebas locales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| REDCELL-26B-A4B-OSINT-Cyber-APEX-GGUF | 25,2B totales / ≈4B activos | 262.144 | Apache-2.0 | GGUF | Especializado en OSINT/CTI; cuantizaciones APEX propias |
| unsloth/gemma-4-26B-A4B-it (base) | 25,2B totales / ≈4B activos | 262.144 | Apache-2.0 | safetensors (no confirmado en la información disponible) | Modelo base sin ajuste de dominio; comportamiento generalista |
| Gemma 4 26B-A4B (Google) | 25,2B totales / ≈4B activos | 262.144 | Apache-2.0 (según model card del ajuste) | no disponible | Modelo original de Google; sin especialización OSINT |

No se dispone en la información proporcionada de datos de rendimiento comparativo (benchmarks) entre estas alternativas.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- No es un modelo generalista ni descensurado: el autor lo restringe explícitamente a investigadores OSINT, equipos de CTI, CERT y periodistas de investigación, y conserva el comportamiento de seguridad del modelo base.
- Riesgo de alucinación en identificadores técnicos (CVE, técnicas ATT&CK, URLs): aunque el prompt de sistema entrenado exige no inventar identificadores, no hay garantía formal y toda referencia debe verificarse.
- Sesgos: no documentados en la información disponible; al heredar el comportamiento del modelo base, arrastra los sesgos de este.
- El ajuste se realizó sobre un dataset propio de 4 ejes y 33 subcategorías; no se publican detalles de composición ni volumen de tokens.
- Licencia Apache-2.0 permite uso comercial, pero debe respetarse la licencia del modelo base Gemma 4 y sus términos de uso.
- El soporte de decodificación especulativa MTP es experimental; el autor recomienda leer la sección correspondiente antes de activarlo.
- Las cuantizaciones APEX presentan tipos realizados distintos de los nominales en 60 tensores por limitaciones de forma de los tensores MoE de Gemma 4; conviene validar la calidad en el caso de uso concreto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HomelessEmo/REDCELL-26B-A4B-OSINT-Cyber-APEX-GGUF
- Modelo base (unsloth): https://huggingface.co/unsloth/gemma-4-26B-A4B-it
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Badge Model Pulse (referenciado en la model card): https://huggingface.co/spaces/tardellirs/model-pulse?model=terrorswift/REDCELL-26B-A4B-OSINT-Cyber-APEX-GGUF
