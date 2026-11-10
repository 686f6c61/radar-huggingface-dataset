# Austriani/Gemma-4-26B-A4B-it-ik_llama.cpp

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo `google/gemma-4-26B-A4B-it`, publicadas por el usuario Austriani y optimizadas específicamente para el motor de inferencia ik_llama.cpp. No se trata de un modelo original, sino de una distribución de pesos cuantizados del modelo instruct de Google DeepMind, con una arquitectura de mezcla de expertos (MoE) de 26.000 millones de parámetros totales y aproximadamente 4.000 millones de parámetros activos por token.

La relevancia de esta ficha reside en que el autor emplea técnicas de cuantización poco habituales en el ecosistema estándar de llama.cpp: calibración con imatrix a contexto de 1024 tokens, 500 ciclos de optimización, y variantes denominadas "trellis-quant" y "maxoptima" junto con el formato IQK. El objetivo es reducir el peso en disco y la huella de memoria del modelo base manteniendo la calidad, algo crítico en un MoE de 26B que en precisión completa no cabe en GPU de consumo.

El modelo base es un transformer MoE de Google orientado a generación de texto conversacional, con licencia Apache 2.0 según la model card. El repositorio ocupa 90,1 GB y acumula 422 descargas en el momento de la consulta. Cabe advertir que la información pública disponible es escasa: la model card está truncada y no detalla la mayoría de especificaciones técnicas del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) |
| Parámetros totales | 25.233.142.046 (≈25,2B) |
| Parámetros activos | ≈4B (denominación "A4B") |
| Longitud de contexto | no disponible (imatrix calibrada a 1024 tokens) |
| Tipos de cuantización | IQK, trellis-quant, maxoptima (variantes del autor); niveles concretos no disponibles |
| Idiomas soportados | inglés (según metadatos) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con ik_llama.cpp) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-26B-A4B-it` emplea una arquitectura de mezcla de expertos con 25.233.142.046 parámetros totales y aproximadamente 4.000 millones activos por token, lo que sitúa su coste computacional de inferencia en el rango de un modelo denso de 4B pese a almacenar 26B. La model card del repositorio confirma la naturaleza MoE y la procedencia de Google DeepMind, pero está truncada y no aporta detalles sobre número de expertos, dimensión de las capas, composición del dataset de entrenamiento, número de tokens vistos ni si se aplicaron fases de RLHF o DPO.

En cuanto al trabajo de cuantización, el autor documenta el uso de una matriz de importancia (imatrix) calibrada con contexto de 1024 tokens y 500 ciclos de optimización, junto con las técnicas propietarias "trellis-quant" y "maxoptima" y el formato IQK. Estas variantes buscan mejorar la relación calidad/tamaño frente a las cuantizaciones GGUF convencionales, aunque la model card no publica métricas de perplejidad ni comparativas de degradación que permitan verificar la afirmación.

## Capacidades

- Generación de texto conversacional en inglés, con formato instruct (`-it`).
- Razonamiento y respuesta multi-turno, heredado del modelo base de Google.
- Procesamiento eficiente gracias a la activación dispersa de solo ~4B parámetros por token.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible` en los metadatos).
- Capacidades de tool calling, agentes, matemáticas o código: no disponibles en la información proporcionada.
- Capacidades multimodales (visión o audio): no disponibles en la información proporcionada.

## Casos de uso

- Despliegue en servidores con VRAM limitada: al ser un MoE con ~4B parámetros activos, las cuantizaciones IQK permiten servir un modelo de 26B en hardware donde un denso equivalente no cabría, manteniendo throughput cercano al de un 4B.
- Chat conversacional en inglés: el formato instruct y la naturaleza del modelo base lo hacen adecuado para asistentes de texto multi-turno, siempre que se verifique el contexto real soportado.
- Experimentación con cuantización avanzada: útil para investigadores que quieran comparar las variantes trellis-quant y maxoptima frente a GGUF estándar en términos de perplejidad y tamaño.
- Inferencia con ik_llama.cpp en CPU o configuraciones híbridas CPU/GPU: el formato GGUF y la librería declarada permiten ejecución en entornos sin GPU dedicada.
- Prototipado de pipelines de generación de texto: la licencia Apache 2.0 facilita su integración en productos comerciales sin las restricciones de otras licencias de modelos abiertos.
- Evaluación comparativa de motores de inferencia: sirve como banco de pruebas para medir latencia y calidad entre ik_llama.cpp, llama.cpp y otros backends compatibles con GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas de perplejidad de las cuantizaciones.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta; el repositorio completo ocupa 90,1 GB, por lo que una única variante cuantizada ocupará una fracción de ese total (el tamaño por archivo no se detalla en la información proporcionada).
- GPU recomendadas: no disponibles en la información proporcionada.
- Viabilidad en GPU de consumo: no confirmada; dependerá del nivel de cuantización elegido y del tamaño del archivo, que no se especifica.
- Opciones de despliegue: ik_llama.cpp (motor declarado); otros backends compatibles con GGUF no están confirmados para estas variantes IQK/trellis-quant.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma-4-26B-A4B-it (esta ficha, cuantizado) | ≈25,2B | ≈4B | no disponible | Apache 2.0 | GGUF (IQK) |
| Modelo base google/gemma-4-26B-A4B-it | ≈25,2B | ≈4B | no disponible | Apache 2.0 | safetensors |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente en inglés según los metadatos; no se declara soporte multilingüe.
- La model card está truncada, por lo que faltan especificaciones clave (contexto, número de expertos, dataset de entrenamiento).
- Las cuantizaciones IQK, trellis-quant y maxoptima son específicas de ik_llama.cpp; pueden no cargar correctamente en llama.cpp estándar, Ollama, vLLM o TGI.
- No se publican métricas de degradación por cuantización; la pérdida de calidad respecto al modelo base es desconocida.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan mitigaciones específicas.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo base de Google (`license_link` apunta a los términos de Gemma 4) por posibles condiciones adicionales de uso.
- El repositorio tiene muy poca tracción (422 descargas, 1 like) y un único mantenedor; la continuidad y el soporte no están garantizados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Austriani/Gemma-4-26B-A4B-it-ik_llama.cpp
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Licencia del modelo base: https://ai.google.dev/gemma/docs/gemma_4_license
