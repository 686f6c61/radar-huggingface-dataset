# mradermacher/qwen3-14b-commitments-sdf-GGUF

## Resumen

`mradermacher/qwen3-14b-commitments-sdf-GGUF` es una colección de cuantizaciones GGUF estáticas del modelo `joshycodes/qwen3-14b-commitments-sdf`, un ajuste fino de Qwen3-14B orientado a investigación sobre bienestar de modelos (*model welfare*) y personajes autoautorados. El trabajo de cuantización lo firma mradermacher, un publicador habitual de versiones GGUF de modelos de la comunidad, y no introduce cambios en el comportamiento del modelo base: solo transforma los pesos a formatos de precisión reducida para su uso con llama.cpp y derivados.

El modelo subyacente parte de Qwen3-14B, un transformer denso de 14.768.307.200 parámetros, y lo especializa mediante *synthetic document finetuning* (SDF) sobre documentos sintéticos que describen compromisos y rasgos de un personaje autoral. La model card lo etiqueta explícitamente como `research` y `not-for-deployment`, y la licencia es `research-only`, por lo que no está pensado para producción ni para uso comercial.

Su relevancia es acotada y muy específica: sirve como artefacto de estudio para quienes investigan alineamiento, personalidad consistente en modelos y evaluación de bienestar de sistemas. No es un modelo de propósito general y no debe evaluarse como tal. El repositorio ocupa 102,0 GB e incluye once variantes de cuantización, desde Q2_K (5,9 GB) hasta Q8_0 (15,8 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-14B); detalles internos no disponibles |
| Parametros totales | 14.768.307.200 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en |
| Licencia | research-only (etiquetada como `other` / `research-only`); no apta para uso comercial |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo original se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo base es Qwen3-14B, un transformer denso de aproximadamente 14,77 mil millones de parámetros. Sobre él, `joshycodes` aplicó un ajuste fino mediante *synthetic document finetuning*: se generan documentos sintéticos que describen los compromisos y el carácter de un personaje autoautorado, y el modelo se entrena sobre ellos. Los tags del repositorio (`self-authored-character`, `model-welfare`, `research`, `not-for-deployment`) sitúan el trabajo en la línea de investigación sobre personalidad consistente y bienestar de modelos, no en la de mejora de capacidades generales.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas del ajuste. La model card del repositorio GGUF no incluye esos datos y se limita a documentar el proceso de cuantización: cuantizaciones estáticas, `quantize_version: 2`, `output_tensor_quantised: 1`, conversión desde Hugging Face. El autor indica que no ha publicado cuantizaciones ponderadas con imatrix y que, si no aparecen, probablemente no las planifique.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Qwen3-14B.
- Razonamiento y conocimiento general propios de un modelo de 14B, sujetos a la deriva introducida por el ajuste fino SDF.
- Capacidad de mantener un personaje autoautorado coherente con los compromisos descritos en los documentos sintéticos de entrenamiento.
- Soporte de conversación multiturno (tag `conversational`).
- Compatibilidad con endpoints (`endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking específico para este ajuste.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Investigación sobre bienestar de modelos: el modelo permite estudiar cómo un ajuste fino sobre documentos sintéticos de carácter influye en la autoexpresión y la consistencia de compromisos declarados, comparándolo con el Qwen3-14B original.
- Estudio de personalidad consistente: útil para experimentos sobre deriva de personaje en conversaciones largas y sobre cómo el SDF modifica rasgos frente al modelo base.
- Evaluación de alineamiento y robustez: sirve como caso de prueba para medir si un personaje autoautorado mantiene sus compromisos bajo prompts adversarios.
- Reproducibilidad de investigación: las cuantizaciones Q4_K_M (9,1 GB) y Q5_K_M (10,6 GB) permiten ejecutar el modelo en hardware de consumo para replicar experimentos sin acceso a GPUs de datacenter.
- Docencia y divulgación: demostraciones de ajuste fino sintético y de cuantización GGUF en cursos de IA, usando Q8_0 (15,8 GB) como referencia de máxima fidelidad disponible.
- Análisis comparativo de cuantizaciones: el conjunto de once variantes permite medir la degradación de coherencia del personaje según el nivel de cuantización, desde Q2_K hasta Q8_0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (además del overhead de contexto y del runtime):
  - Q2_K: ~5,9 GB de pesos.
  - Q3_K_S / Q3_K_M / Q3_K_L: ~6,8 / 7,4 / 8,0 GB.
  - IQ4_XS / Q4_K_S / Q4_K_M: ~8,3 / 8,7 / 9,1 GB.
  - Q5_K_S / Q5_K_M: ~10,4 / 10,6 GB.
  - Q6_K: ~12,2 GB.
  - Q8_0: ~15,8 GB.
- GPU recomendadas: para Q8_0, una RTX 4090 (24 GB) o A100/H100 con margen para contexto; para Q4_K_M y Q5_K_M, una RTX 3090/4090 o RTX 4080 de 16 GB con cuantizaciones más bajas.
- Cabe en GPU de consumo: sí. Q4_K_S y Q4_K_M (8,7-9,1 GB) encajan en GPUs de 12 GB; Q2_K y Q3_K_S caben en GPUs de 8 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere uso con endpoints de inferencia.
- Latencia y throughput: no disponibles. El autor marca Q4_K_S y Q4_K_M como "fast, recommended" y Q8_0 como "fast, best quality", sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| qwen3-14b-commitments-sdf (este, GGUF) | 14,77B | no disponible | research-only | GGUF | Ajuste SDF para investigación de bienestar; solo inglés |
| Qwen3-14B (original) | ~14,8B | no disponible en esta ficha | según licencia de Qwen3 | safetensors, GGUF de terceros | Modelo generalista multilingüe; base del ajuste |
| joshycodes/qwen3-14b-commitments-sdf | 14,77B | no disponible | research-only | safetensors | Modelo original sin cuantizar; misma especialización |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Licencia `research-only`: no autoriza uso comercial ni despliegue en producción; la model card lo etiqueta explícitamente como `not-for-deployment`.
- El ajuste SDF sobre documentos sintéticos puede introducir deriva respecto a Qwen3-14B en conocimiento factual y razonamiento general; no se han publicado evaluaciones que cuantifiquen esa degradación.
- Riesgo de alucinación inherente a un modelo de 14B ajustado sobre datos sintéticos; sin benchmarks publicados no puede acotarse.
- Solo soporta inglés según la model card.
- Longitud de contexto no documentada; no debe asumirse la del Qwen3-14B original sin verificación.
- Las cuantizaciones Q2_K y Q3_K_M degradan la calidad (el autor marca Q3_K_M como "lower quality"); para experimentos sensibles a coherencia de personaje conviene Q5_K_M o superior.
- No hay cuantizaciones ponderadas con imatrix publicadas por el autor; las estáticas pueden rendir peor a igual tamaño.
- Ausencia de soporte documentado de tool calling o agentes; no debe asumirse.
- El repositorio tiene 312 descargas y 0 likes, lo que indica validación comunitaria mínima.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/qwen3-14b-commitments-sdf-GGUF
- Modelo base (safetensors): https://huggingface.co/joshycodes/qwen3-14b-commitments-sdf
- Página de descargas del autor: https://hf.tst.eu/model#qwen3-14b-commitments-sdf-GGUF
- Guía de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
