# loraforge/qwen3.8-flash-next-orcarouter-r1

## Resumen

Qwen3.8 Flash Next OrcaRouter R1 es un adaptador LoRA experimental publicado por el usuario loraforge sobre el modelo base Qwen/Qwen3.8-Flash-Next. No se trata de un modelo completo, sino de un adaptador PEFT de rango 1 extraído de una edición BF16 del checkpoint OrcaRouter (una variante sin censura del modelo Qwen original) respecto al checkpoint BF16 de Qwen. El adaptador almacena factores FP32 de rango 1 por matriz y cubre 97 proyecciones ordinarias, un token embedding y 24.576 proyecciones de expertos enrutados distribuidas en 48 grupos de expertos.

El interés del artefacto es metodológico: documenta un ejercicio de compresión post-hoc y extracción de deltas de pesos entre dos checkpoints del mismo linaje, con auditoría de grupos de tensores modificados (149 de 1658) y métricas de energía retenida en el espacio de pesos (99,409277 % del delta medido en las familias activas). El autor lo etiqueta explícitamente como research preview y advierte que no es una reconstrucción de los pesos GGUF SC117 GSQ-RCO ni implica equivalencia de inferencia con el checkpoint completo.

La relevancia práctica es limitada: el adaptador no es un modelo autónomo, requiere el modelo base Qwen3.8-Flash-Next, y su validación se reduce a un piloto exploratorio de 48 prompts sobre rechazos y a un smoke test de generación con GGUF cuantizado. Es útil para quienes investigan extracción de adaptadores, edición de comportamiento o compresión post-hoc, no como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer MoE (modelo base Qwen3.8-Flash-Next) |
| Parametros totales | 79.470.592 (adaptador); parametros del modelo base no disponibles |
| Parametros activos | no disponible (el modelo base es MoE, pero no se detalla el reparto activo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variantes IQ3_S mencionadas en la validacion); adaptador en safetensors FP32 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (etiquetada como "other") |
| Formato de pesos | safetensors (adaptador PEFT) y GGUF (variantes del modelo base) |

## Arquitectura y entrenamiento

El adaptador se extrae como diferencia de pesos entre el checkpoint BF16 de Qwen/Qwen3.8-Flash-Next (revision 812d96e10a0dd82b69d749e68693698cf6c36daa) y el checkpoint BF16 de orcarouter/Qwen3.8-Flash-Next-Uncensored (revision da29941aee972c7eeab497e05a292c569da1f1d6). La descomposición se realiza a rango 1 por matriz con factores FP32 y escalado 1, cubriendo 97 proyecciones ordinarias, un token embedding y 24.576 proyecciones de expertos enrutados en 48 grupos. Todos los expertos se incluyen de forma independiente, y el adaptador retiene el 99,409277 % de la energía del delta medido en las familias activas.

La auditoría BF16 identifica 149 grupos de tensores modificados de 1658 totales: 146 grupos activos incluidos en el adaptador por defecto y 3 grupos MTP (multi-token prediction) suministrados aparte como factores opcionales. Los 1509 tensores restantes son idénticos byte a byte. El autor advierte que no se implica equivalencia de inferencia con el checkpoint completo ni con los pesos GGUF SC117 GSQ-RCO, y que la energía retenida es un diagnóstico en el espacio de pesos, no una métrica de rendimiento. No se documenta un proceso de entrenamiento con RLHF o DPO; el artefacto es una extracción post-hoc, no un ajuste supervisado convencional.

## Capacidades

- Generación de texto autoregresiva heredada del modelo base Qwen3.8-Flash-Next (capacidades específicas del base no documentadas en la información disponible).
- Modificación del comportamiento de rechazo: el piloto muestra que el adaptador replica el patrón del checkpoint OrcaRouter completo, reduciendo rechazos explícitos en prompts seguros respecto al Qwen original (0 frente a 3 sobre 32 prompts seguros).
- Soporte de decodificación greedy determinista en las pruebas realizadas, con thinking desactivado.
- Compatibilidad con llama.cpp para variantes GGUF del modelo base (probado con IQ3_S en H100 NVL).
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo específicas del adaptador.

## Casos de uso

- Investigación en extracción de adaptadores: el paquete sirve como caso de estudio reproducible de cómo aislar el delta entre dos checkpoints del mismo linaje mediante descomposición de rango 1, con informes de extracción y auditoría incluidos en el repositorio.
- Estudio de edición de comportamiento: el piloto de rechazos con 48 prompts permite analizar cómo un delta de pesos de baja energía altera las respuestas de rechazo en prompts seguros y sensibles-pero-legales, útil para investigación en seguridad de modelos.
- Análisis de compresión post-hoc: los datos de energía retenida (99,409277 % en familias activas, 99,3868 % en 20 matrices BF16 muestreadas) permiten evaluar la viabilidad de comprimir deltas a rango 1 sin reconstruir el checkpoint completo.
- Validación de pipelines GGUF: el adaptador se ha probado sobre checkpoints IQ3_S con llama.cpp en H100 NVL, lo que lo hace útil para probar flujos de carga y generación con cuantización de 3 bits.
- Docencia y divulgación técnica: la documentación detallada de grupos de tensores, revisiones fijadas y protocolos de evaluación sirve como material didáctico sobre PEFT, MoE y auditoría de pesos.
- Reproducción de experimentos de alineación: el conjunto de prompts XSTest (subconjunto) y los prompts personalizados permiten replicar el piloto de rechazos con el modelo base correcto, siempre que se disponga de acceso a Qwen3.8-Flash-Next.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor presenta únicamente un piloto exploratorio de rechazos y un smoke test de generación:

| Prueba | Original Qwen BF16 | Full OrcaRouter BF16 | Original Qwen BF16 + rank1 |
|---|---:|---:|---:|
| Rechazos explícitos / 32 prompts seguros | 3 | 0 | 0 |
| Respuestas sustantivas sobre el tema / 32 | 19 | 23 | 23 |

| Prueba adicional | Resultado |
|---|---|
| Coincidencia exacta de texto en smoke test benigno (8 prompts) | 6/8 para rank1 |
| Comprobaciones aritméticas estrictas | 3/3 |
| Coincidencia con texto SC117 en GGUF IQ3_S (8 prompts) | 3/8 |
| Energía retenida en 20 matrices BF16 muestreadas (rango 1) | 99,3868 % |
| Energía retenida en 4 pares GGUF decodificados (rango 1 / rango 64) | 9,3830 % / 18,6980 % |

El autor subraya que el piloto es exploratorio, con 48 prompts fijos, sin adjudicación experta independiente, y que la respuesta sobre el tema no equivale a precisión factual.

## Requisitos de hardware

- El adaptador en sí ocupa 0,6 GB (repo completo) y requiere cargar el modelo base Qwen3.8-Flash-Next, cuyos requisitos de VRAM no se detallan en la información disponible.
- GPU utilizada en la validación: H100 NVL con llama.cpp (commit 0a94a3f289687883617b9a2abbc7e0ade2d6b6c4) sobre checkpoints IQ3_S.
- No se documenta compatibilidad con GPU de consumo (RTX 4090, etc.) ni VRAM estimada para el modelo base.
- Opciones de despliegue documentadas: PEFT (carga del adaptador sobre el base) y llama.cpp para variantes GGUF.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| loraforge/qwen3.8-flash-next-orcarouter-r1 | 79,47 M (adaptador) | no disponible | qwen-community-license-1.0 | Hugging Face, 3 descargas | Adaptador experimental de rango 1 |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | no disponible | qwen-community-license-1.0 | Hugging Face | Modelo base MoE del que depende el adaptador |
| orcarouter/Qwen3.8-Flash-Next-Uncensored | no disponible | no disponible | no disponible | Hugging Face | Checkpoint fuente del delta extraído |

No se dispone de información sobre otros adaptadores comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo base Qwen3.8-Flash-Next y no funciona de forma aislada.
- El autor lo clasifica como research preview experimental; no está validado para producción.
- La energía retenida en el espacio de pesos no es una métrica de rendimiento ni garantiza equivalencia funcional con el checkpoint OrcaRouter completo.
- El piloto de rechazos es exploratorio (48 prompts), con etiquetado cualitativo sin adjudicación experta independiente; no constituye una puntuación oficial de XSTest.
- El smoke test de generación con GGUF IQ3_S solo coincidió en 3/8 prompts con el texto SC117, y las respuestas largas pueden truncarse.
- El piloto detectó respuestas factualmente incorrectas (un PIN ficticio de iPhone no soportado) tanto en el checkpoint completo como en el adaptador: reducir rechazos no implica mejorar la fiabilidad factual.
- Los resultados GGUF previos son pruebas con padre no coincidente y no miden la fidelidad de compresión sobre el padre BF16 previsto.
- Licencia qwen-community-license-1.0: es necesario revisar sus términos para uso comercial, ya que se etiqueta como "other" y puede imponer restricciones adicionales.
- No se documentan sesgos específicos, cobertura de idiomas ni longitud de contexto; estos datos deben consultarse en la documentación del modelo base.
- Riesgo de alucinación inherente al modelo base, agravado por la modificación de comportamiento de rechazo que puede aumentar la respuesta sustantiva a peticiones sensibles.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/loraforge/qwen3.8-flash-next-orcarouter-r1
- Modelo base Qwen/Qwen3.8-Flash-Next: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Checkpoint fuente orcarouter/Qwen3.8-Flash-Next-Uncensored: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Licencia: https://huggingface.co/loraforge/qwen3.8-flash-next-orcarouter-r1/blob/main/LICENSE
- Dataset XSTest (Röttger et al., NAACL 2024): https://github.com/paul-rottger/xstest
- Paper referenciado en tags (arXiv:2611.01256): https://arxiv.org/abs/2611.01256
