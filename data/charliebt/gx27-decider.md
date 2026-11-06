# CharlieBT/gx27-decider

## Resumen

CharlieBT/gx27-decider es un modelo de clasificación de texto especializado en toma de decisiones, desarrollado por CharlieBT y publicado bajo licencia Apache-2.0. Se trata de un fine-tune LoRA de CharlieBT/gx26-decider (a su vez derivado de la familia Qwen 3.5, según la etiqueta `qwen3_5`), con los pesos del adaptador fusionados en el modelo final. Con 26.085.330.160 parámetros (aproximadamente 26.000 millones), el modelo está orientado a la pista de decisión generalista de la subred REAX y emplea un protocolo de lectura en línea (inline-readout v3) que combina un fichero `readout.safetensors` con un `decision_config.json`.

El modelo resuelve el problema de la clasificación estructurada de decisiones: dado un ítem de decisión (con enunciado, opciones, formatos variados de presentación), el modelo produce una distribución sobre las opciones disponibles. Su relevancia radica en el entrenamiento cuidadoso con datos heterogéneos (avisos de seguridad, licitaciones, discusiones de borrado de Wikipedia, registros regulatorios de EE. UU., metadatos académicos, etc.) y en la inclusión de destilación propia desde el modelo padre para mitigar el olvido catastrófico.

El modelo se publica como un artefacto de investigación y evaluación dentro del ecosistema REAX, con 43 descargas y sin likes en el momento de la consulta. No dispone de model card detallada sobre idiomas soportados ni benchmarks publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, según etiqueta `qwen3_5`); fine-tune LoRA fusionado |
| Parametros totales | 26.085.330.160 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con `readout.safetensors` y `decision_config.json` adicionales) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de la familia Qwen 3.5, según la etiqueta `qwen3_5` del repositorio, sobre el que se aplica un fine-tune LoRA posteriormente fusionado en los pesos. El modelo emplea un protocolo de "lectura en línea v3" (inline-readout v3) que separa la cabeza de decisión en un fichero `readout.safetensors` acompañado de `decision_config.json`, lo que permite un despliegue especializado para clasificación de decisiones sin depender de la cabeza generativa estándar.

El entrenamiento combina datos muy diversos: generadores propios de tareas en formato v5.1, registros públicos re-etiquetados (GitHub Advisory Database, licitaciones TED de la UE, discusiones de borrado de Wikipedia, registros de openFDA, CPSC y METAR de NWS, OurAirports, openfootball, metadatos de arXiv, Wikidata, EIPs de Ethereum, textos de Project Gutenberg, SNLI/MultiNLI, ANLI TRAIN, IBM Argument Quality 30k, Amazon MASSIVE y NVIDIA Aegis 2.0), el conjunto `decisionmodels/sn92-generalist-train-v1` (solo filas escritas por modelos de pesos abiertos o por código, sin OpenAI ni Anthropic), el split de entrenamiento de `nvidia/When2Call` (generado con Mixtral-8x22B-Instruct), splits de entrenamiento de benchmarks públicos convertidos al formato de decisión, ítems escritos por modelos abiertos (Qwen, DeepSeek, GLM, Kimi) y generadores programáticos propios. Se incluye una fase de destilación propia (replay) usando la distribución servida del modelo padre gx26-decider con temperatura T=2 como objetivos suaves, y una segunda etapa con copias de formato variado (paráfrasis de enunciados y cabeceras por Kimi-K3, layouts y notaciones re-renderizados por código).

## Capacidades

- Clasificación de decisiones estructuradas: dado un ítem con opciones, produce una distribución sobre las alternativas disponibles.
- Manejo de formatos variados de presentación (enunciados parafraseados, layouts alternativos, notaciones de tablero y conjuntos de opciones re-renderizados).
- Procesamiento de ítems de dominios diversos: avisos de seguridad, licitaciones, discusiones comunitarias, registros regulatorios, metadatos académicos, propuestas de mejora técnica, textos literarios y datos de argumentación.
- Capacidad de abstención: el entrenamiento incluye pares de abstención, por lo que el modelo puede señalar incertidumbre.
- Enrutamiento de herramientas (tool routing) y decisión sobre código/SQL, según los generadores programáticos empleados en el entrenamiento.
- Razonamiento multi-paso implícito en la clasificación de decisiones (no se documenta un modo de pensamiento explícito).
- Capacidades multilingües: no documentadas en la información disponible; los datos de entrenamiento incluyen textos en inglés y posiblemente otras lenguas (TED, MASSIVE), pero no se especifica cobertura.
- No se documenta soporte de visión, audio ni tool calling generativo.

## Casos de uso

- Moderación de contenido y decisiones de política: el modelo puede clasificar ítems de decisión con opciones discretas (aprobar, rechazar, escalar) entrenado con discusiones de borrado de Wikipedia y registros regulatorios, lo que lo hace adecuado para pipelines de moderación asistida.
- Triaje de avisos de seguridad: dado un aviso del GitHub Advisory Database o de un registro regulatorio, el modelo puede clasificar la severidad o la acción recomendada entre opciones predefinidas.
- Enrutamiento de consultas y herramientas: los generadores de tool routing del entrenamiento permiten usar el modelo para decidir qué herramienta o ruta debe tomar una consulta en un sistema agéntico.
- Evaluación de licitaciones y contratos públicos: con datos de TED (licitaciones de la UE) en el entrenamiento, el modelo puede clasificar la idoneidad o categoría de una oferta entre opciones definidas.
- Decisión sobre código y SQL: los generadores de code/SQL permiten usar el modelo para elegir entre alternativas de implementación o validar consultas frente a opciones de política.
- Sistemas de abstención y escalado: los pares de abstención entrenados permiten integrar el modelo en flujos donde debe decidir si responde o deriva a un humano, útil en atención al cliente o compliance.
- Investigación en modelos de decisión: como artefacto de la subred REAX, sirve para reproducir y comparar protocolos de decisión generalista con el modelo padre gx26-decider.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 26.085 millones de parámetros, en FP16 se requieren aproximadamente 52 GB de VRAM (coincide con el tamaño del repo de 52,2 GB); en cuantización de 8 bits, unos 26 GB; en 4 bits, unos 13-14 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: A100 80 GB o H100 80 GB para FP16 sin offload; A100 40 GB o L40S 48 GB con cuantización de 8 bits; RTX 4090 24 GB solo con cuantización de 4 bits y posible offload.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) con cuantización de 4 bits; en RTX 4080/4070 Ti (16 GB) probablemente no sin offload a CPU.
- Opciones de despliegue: no documentadas por el autor; al ser safetensors con cabeza de lectura separada (`readout.safetensors` + `decision_config.json`), requiere un cargador compatible con el protocolo inline-readout v3, no siendo directamente compatible con vLLM, llama.cpp u Ollama sin adaptación.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CharlieBT/gx27-decider | 26,1 B | no disponible | Clasificación de decisiones (REAX) | Apache-2.0 | Hugging Face (43 descargas) |
| CharlieBT/gx26-decider (padre) | no disponible | no disponible | Clasificación de decisiones (REAX) | Apache-2.0 | Hugging Face |
| Qwen 3.5 (base de la familia) | no disponible | no disponible | Generación general | no disponible | Hugging Face |
| NVIDIA When2Call (fuente de entrenamiento) | no disponible | no disponible | Preferencias de llamada a herramientas | CC-BY-4.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: el entrenamiento mezcla fuentes muy heterogéneas (registros gubernamentales de EE. UU., discusiones de Wikipedia, licitaciones de la UE), lo que puede introducir sesgos de dominio y de idioma no documentados.
- Riesgo de alucinación: al ser un modelo de clasificación con cabeza de lectura, el riesgo se traslada a la calibración de las distribuciones de salida; no se documenta calibración ni métricas de fiabilidad.
- Limitaciones de contexto o idioma: no se especifica la longitud de contexto ni la cobertura de idiomas; los datos de entrenamiento son mayoritariamente en inglés, aunque incluyen TED y MASSIVE (multilingües).
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero algunas fuentes de entrenamiento tienen licencias restrictivas (ANLI TRAIN es CC-BY-NC-4.0), lo que puede afectar a la redistribución o al uso comercial del modelo derivado; el autor no aclara si estas filas se excluyeron del entrenamiento final.
- Caveat de producción: el protocolo inline-readout v3 requiere un cargador específico (`readout.safetensors` + `decision_config.json`); no es un modelo de chat estándar y no debe usarse como generador de texto libre.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas, lo que limita su adopción en producción sin evaluación propia.
- Modelo de nicho: 43 descargas y 0 likes indican escasa validación comunitaria; el autor no documenta limitaciones ni casos de fallo.

## Enlaces

- Hugging Face: https://huggingface.co/CharlieBT/gx27-decider
- Modelo base: https://huggingface.co/CharlieBT/gx26-decider
- Conjunto de entrenamiento generalista: https://huggingface.co/datasets/decisionmodels/sn92-generalist-train-v1
- Conjunto de especialistas: https://huggingface.co/datasets/decisionmodels/sn92-specialists
- NVIDIA When2Call: https://huggingface.co/datasets/nvidia/When2Call
- Repositorio de referencia REAX: no disponible en la información proporcionada.
