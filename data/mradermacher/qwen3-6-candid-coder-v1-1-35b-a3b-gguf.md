# mradermacher/Qwen3.6-Candid-Coder-V1.1-35B-A3B-GGUF

## Resumen

Qwen3.6-Candid-Coder-V1.1-35B-A3B-GGUF es la versión cuantizada en formato GGUF del modelo DarkKitsune/Qwen3.6-Candid-Coder-V1.1-35B-A3B, un fine-tuning orientado a código, razonamiento y uso de herramientas construido sobre la familia Qwen 3.5/3.6. La cuantización la firma mradermacher, un publicador habitual de pesos GGUF de la comunidad open source, con el objetivo de hacer el modelo ejecutable en llama.cpp y en hardware de consumo. El modelo original pesa 35.505.251.456 parámetros (unos 35,5 mil millones) según los safetensors publicados, y la nomenclatura "A3B" sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 3 mil millones de parámetros activos por token, aunque este dato no se confirma en la información disponible.

El modelo se distribuye como pesos estáticos cuantizados (no imatrix), con un conjunto de 11 variantes que van desde Q2_K (13,3 GB) hasta Q8_0 (37,9 GB). La model card del cuantizador indica explícitamente que las cuantizaciones ponderadas/imatrix no estaban disponibles en el momento de la publicación. El repositorio completo ocupa 242,9 GB, lo que incluye todos los ficheros de cuantización.

La relevancia de esta ficha radica en que permite evaluar rápidamente un modelo de código "abliterated" y "uncensored" (según sus propias etiquetas) que, por su tamaño y sus cuantizaciones, puede desplegarse en estaciones de trabajo con una sola GPU de 24 GB (Q4_K_S/Q4_K_M) o en configuraciones de 48 GB o más para cuantizaciones superiores. No obstante, la ausencia de benchmarks, de licencia explícita y de documentación técnica detallada en la información proporcionada limita seriamente cualquier evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (presumiblemente MoE por la nomenclatura A3B; no confirmado en la información disponible) |
| Parametros totales | 35.505.251.456 (35,5 B) |
| Parametros activos | no disponible (la nomenclatura "A3B" sugiere ~3 B activos, sin confirmación) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones) y safetensors (modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base DarkKitsune/Qwen3.6-Candid-Coder-V1.1-35B-A3B. Por la nomenclatura y las etiquetas (qwen3.5, MoE implícita en "A3B", agent, coding, reasoning, tool-use) se puede inferir que se trata de un transformer de la familia Qwen con mezcla de expertos, pero no se confirma el número de expertos, el mecanismo de enrutamiento ni la composición del dataset de entrenamiento. Tampoco se documentan el número de tokens de entrenamiento, la presencia de RLHF/DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal.

Las etiquetas "abliterated" y "uncensored" indican que el fine-tuning ha eliminado o reducido los mecanismos de rechazo del modelo original, lo que suele implicar un ajuste sobre las direcciones de activación relacionadas con la negativa a responder. No se especifica la metodología exacta (por ejemplo, abliteration por proyección ortogonal) ni el volumen de datos usado en el ajuste. El cuantizador solo aporta los metadatos de conversión (convert_type: hf, quantize_version: 2) y confirma que se usaron cuantizaciones estáticas sin imatrix.

## Capacidades

- Generación de texto y código: el modelo está etiquetado como "coding" y "code", orientado a tareas de programación.
- Razonamiento: etiqueta "reasoning" y "sage" (posiblemente un modo de razonamiento o un dataset específico).
- Uso de herramientas: etiqueta "tool-use", lo que sugiere soporte de function calling, aunque no se documenta el formato exacto.
- Agentes: etiqueta "agent", indicando orientación a flujos multi-paso.
- Sin censura: etiquetas "abliterated" y "uncensored", lo que implica que el modelo no aplica los filtros de rechazo habituales.
- Multilingüe: limitado a inglés según el campo language del repositorio.
- Capacidades especiales: no se documentan visión, audio ni modo thinking explícito en la información disponible.

## Casos de uso

- Generación de código en producción: el modelo puede integrarse en pipelines de CI/CD para autocompletar, refactorizar o generar tests, aprovechando su orientación a código y su tamaño de 35,5 B con cuantización Q4_K_M (21,8 GB) para servidores con una GPU de 24 GB.
- Asistentes de programación locales: al estar disponible en GGUF, puede ejecutarse con llama.cpp u Ollama en una estación de trabajo con RTX 4090 (24 GB) usando Q4_K_S o Q4_K_M, ofreciendo privacidad al no enviar código a la nube.
- Agentes autónomos de desarrollo: las etiquetas "agent" y "tool-use" permiten construir agentes que invoquen herramientas (compiladores, linters, APIs) en bucles multi-paso, aunque la ausencia de documentación sobre el formato de tool calling obliga a validar el comportamiento empíricamente.
- Análisis de código y revisión de pull requests: con 35,5 B de parámetros, el modelo puede manejar fragmentos de código extensos y razonar sobre ellos, integrándose en herramientas de revisión automatizada.
- Generación de documentación técnica: el modelo puede producir docstrings, READMEs y comentarios explicativos a partir de código fuente, en inglés.
- Experimentación en investigación sobre alineación: al ser "abliterated" y "uncensored", es útil para estudiar el comportamiento de modelos sin filtros de rechazo, siempre con las salvaguardas adecuadas.
- Despliegue en entornos con restricciones de red: la disponibilidad de GGUF permite ejecución totalmente offline en hardware local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de cuantización):
  - Q2_K: ~13,3 GB de pesos; requiere ~14-16 GB de VRAM con overhead de contexto.
  - Q3_K_S: ~15,6 GB; requiere ~17-19 GB.
  - Q4_K_S: ~20,5 GB; requiere ~22-24 GB.
  - Q4_K_M: ~21,8 GB; requiere ~23-25 GB.
  - Q5_K_M: ~25,4 GB; requiere ~27-29 GB.
  - Q6_K: ~29,3 GB; requiere ~31-33 GB.
  - Q8_0: ~37,9 GB; requiere ~40-42 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_S/Q4_K_M; A100 40 GB o H100 para Q5_K_M/Q6_K; A100 80 GB o H100 80 GB para Q8_0.
- Cabe en consumer GPU: sí, en RTX 4090 (24 GB) con Q4_K_S o Q4_K_M; en RTX 3090 (24 GB) igual; en GPUs de 16 GB solo con Q2_K o Q3_K_S, con riesgo de degradación.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (si se publica el manifiesto correspondiente), y potencialmente vLLM o TGI si se convierte a safetensors (no se documenta soporte directo de GGUF en estos servidores).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-Candid-Coder-V1.1-35B-A3B-GGUF | 35,5 B | no disponible | no disponible | GGUF | Este modelo; fine-tuning "abliterated" orientado a código |
| Qwen2.5-Coder-32B-Instruct | 32,5 B | 128 K | Apache 2.0 | safetensors, GGUF | Alternativa oficial de Alibaba, con benchmarks publicados y licencia permisiva |
| DeepSeek-Coder-V2-Lite-Instruct | 15,7 B (2,4 B activos) | 128 K | DeepSeek License | safetensors, GGUF | MoE de código con licencia restrictiva para uso comercial |
| Codestral-22B | 22 B | 32 K | MNPL (no comercial) | safetensors, GGUF | Modelo de Mistral con licencia no comercial |

La comparativa es orientativa: no se dispone de datos de rendimiento del modelo evaluado para contrastar con las alternativas.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es un riesgo crítico para producción.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está garantizado.
- Modelo "abliterated" y "uncensored": puede generar contenido inapropiado, sesgado o dañino sin los filtros habituales; requiere moderación externa en producción.
- Riesgo de alucinación: no cuantificado por falta de benchmarks; los modelos de código de este tamaño pueden inventar APIs o funciones inexistentes.
- Contexto desconocido: no se documenta la longitud de contexto, lo que impide planificar tareas de contexto largo.
- Cuantizaciones estáticas sin imatrix: el cuantizador advierte que las versiones ponderadas no están disponibles, lo que puede reducir la calidad en cuantizaciones bajas (Q2_K, Q3_K_S).
- Trazabilidad limitada: el modelo base DarkKitsune no documenta su dataset ni metodología de entrenamiento en la información disponible.
- Fecha de creación futura (2026-11-05): metadato atípico que conviene verificar antes de confiar en el repositorio.
- Sin descargas ni likes en el momento de la consulta: comunidad inexistente, sin validación externa.

## Enlaces

- Repositorio HuggingFace del GGUF: https://huggingface.co/mradermacher/Qwen3.6-Candid-Coder-V1.1-35B-A3B-GGUF
- Modelo base: https://huggingface.co/DarkKitsune/Qwen3.6-Candid-Coder-V1.1-35B-A3B
- Página de resumen del cuantizador: https://hf.tst.eu/model#Qwen3.6-Candid-Coder-V1.1-35B-A3B-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
