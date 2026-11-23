# mradermacher/Swift-Qwen3.8-27b-i1-GGUF

## Resumen

Swift-Qwen3.8-27b-i1-GGUF es la version cuantizada en formato GGUF del modelo Swift-Qwen3.8-27b, un ajuste fino mediante LoRA del modelo base ukisai/Swift-Qwen3.8-27b. El trabajo de cuantizacion lo firma mradermacher, un conocido publicador de cuantizaciones GGUF, que ofrece tanto cuantizaciones estaticas como cuantizaciones con imatrix (etiquetadas i1) para este modelo de 27.320.697.856 parametros.

El modelo se presenta con las etiquetas "efficient-thinking", "reasoning" y "token-efficient", lo que sugiere que su proposito es ofrecer capacidades de razonamiento con un consumo reducido de tokens de pensamiento. El repositorio incluye un amplio conjunto de cuantizaciones que van desde i1-Q2_K (11,0 GB) hasta i1-Q6_K (22,5 GB), ademas de un archivo imatrix para generar cuantizaciones propias.

La relevancia de esta publicacion radica en que permite ejecutar un modelo de aproximadamente 27.000 millones de parametros en hardware de consumo mediante llama.cpp y formatos GGUF, con opciones de cuantizacion que equilibran tamano, velocidad y calidad. La licencia es swift-open-license-1.0, una licencia personalizada que conviene revisar antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta qwen3_8; detalles no publicados en la informacion disponible) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (ademas de imatrix y cuantizaciones estaticas en el repo hermano) |
| Idiomas soportados | ingles (etiqueta language: en) |
| Licencia | swift-open-license-1.0 (license: other) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo mas alla de la etiqueta qwen3_8, que sugiere una base de la familia Qwen3 con aproximadamente 27.000 millones de parametros. El modelo es un ajuste fino mediante LoRA (etiqueta lora) sobre ukisai/Swift-Qwen3.8-27b, orientado a un razonamiento eficiente en tokens (efficient-thinking, token-efficient). No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

El trabajo de mradermacher consiste en la cuantizacion del modelo original a formato GGUF, incluyendo cuantizaciones con matriz de importancia (imatrix) que mejoran la calidad respecto a cuantizaciones estaticas de tamano similar. El repositorio incluye el archivo imatrix (0,1 GB) para que otros usuarios puedan generar sus propias cuantizaciones. Las cuantizaciones i1 se describen como "weighted/imatrix quants" del modelo base.

## Capacidades

- Generacion de texto conversacional (etiqueta conversational).
- Razonamiento con modo de pensamiento eficiente en tokens (efficient-thinking, reasoning, token-efficient).
- Ajuste fino tipo LoRA sobre el modelo base, lo que sugiere especializacion en el estilo de razonamiento del modelo original.
- Compatibilidad con endpoints (etiqueta endpoints_compatible).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara ingles.
- Capacidades especiales (vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Razonamiento con coste controlado de tokens: el modelo esta etiquetado como token-efficient, por lo que resulta adecuado para pipelines donde el coste por token de pensamiento es critico, como clasificacion compleja o resolucion de problemas con presupuesto limitado.
- Despliegue en hardware de consumo: las cuantizaciones i1-Q4_K_M (16,9 GB) e i1-Q4_K_S (15,9 GB) permiten ejecutar un modelo de 27.000 millones de parametros en GPUs con 24 GB de VRAM, como la RTX 4090, usando llama.cpp.
- Asistente conversacional local: la etiqueta conversational y el formato GGUF facilitan su integracion en aplicaciones de escritorio o servidores locales con Ollama o llama.cpp, sin dependencia de la nube.
- Generacion de codigo y tareas tecnicas: aunque no se documentan benchmarks, un modelo de 27.000 millones de parametros con capacidades de razonamiento puede emplearse en asistencia de programacion; conviene validar su rendimiento real antes de producción.
- Experimentacion e investigacion: el archivo imatrix y el rango completo de cuantizaciones permiten estudiar el impacto de la cuantizacion en la calidad del razonamiento, comparando i1-Q2_K frente a i1-Q6_K.
- Sustitucion de modelos mayores en entornos con restricciones de memoria: con cuantizaciones de 11-13 GB (i1-Q2_K, i1-Q3_K_S, i1-IQ3_S) se puede desplegar en GPUs de 16 GB o en configuraciones con offload parcial a CPU.
- Fine-tuning posterior y destilacion: al estar disponible el modelo base y sus pesos, puede servir como punto de partida para ajustes adicionales o para generar datos sinteticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (tamano del archivo, sin contar overhead de contexto):
  - i1-Q2_K: 11,0 GB
  - i1-Q3_K_S: 12,4 GB
  - i1-IQ3_S: 12,7 GB
  - i1-IQ3_M: 12,9 GB
  - i1-Q3_K_M: 13,6 GB
  - i1-Q3_K_L: 14,7 GB
  - i1-IQ4_XS: 15,4 GB
  - i1-Q4_K_S: 15,9 GB
  - i1-Q4_K_M: 16,9 GB
  - i1-Q5_K_M: 19,6 GB
  - i1-Q6_K: 22,5 GB
- GPU recomendadas: para cuantizaciones Q4/Q5, GPUs de 24 GB (RTX 4090, A10G, L4 con offload); para Q6_K, 24 GB justos o GPUs de 32 GB o mas (A100 40 GB, H100). Para cuantizaciones Q2/Q3, GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB).
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con cuantizaciones hasta i1-Q6_K; en GPUs de 16 GB con cuantizaciones Q2/Q3.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y servidores compatibles con GGUF; la etiqueta endpoints_compatible sugiere compatibilidad con endpoints tipo OpenAI. vLLM y TGI no soportan GGUF de forma nativa en todos los casos, por lo que se recomienda llama.cpp.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Swift-Qwen3.8-27b-i1-GGUF (este) | 27,3 B | no disponible | GGUF | swift-open-license-1.0 | Cuantizaciones i1 con imatrix, rango Q2_K a Q6_K |
| Swift-Qwen3.8-27b (modelo base) | 27,3 B | no disponible | safetensors | swift-open-license-1.0 | Pesos originales sin cuantizar |
| Swift-Qwen3.8-27b-GGUF (cuantizaciones estaticas) | 27,3 B | no disponible | GGUF | swift-open-license-1.0 | Mismo modelo, cuantizaciones sin imatrix |

No se dispone de datos de benchmarks ni de modelos comparables de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia swift-open-license-1.0 es una licencia personalizada; es imprescindible revisar sus terminos (enlace en el modelo base) antes de cualquier uso comercial.
- El modelo solo declara soporte de ingles; el rendimiento en castellano no esta documentado.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de su calidad en razonamiento, codigo o matematicas.
- Las cuantizaciones de baja precision (i1-Q2_K, i1-Q3_K_S) pueden degradar notablemente la calidad del razonamiento; el propio autor recomienda IQ3_XXS o IQ3_XS frente a Q3_K* y Q2_K.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan medidas especificas de mitigacion.
- No se documentan sesgos conocidos ni datos de entrenamiento, lo que dificulta evaluar riesgos de sesgo.
- El modelo es un ajuste LoRA sobre un modelo base de terceros; su comportamiento depende en gran medida de la calidad de dicho modelo base.
- La longitud de contexto no esta disponible, lo que impide planificar casos de uso con ventanas largas.
- El repositorio ocupa 218,6 GB en total; conviene descargar solo la cuantizacion necesaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mradermacher/Swift-Qwen3.8-27b-i1-GGUF
- Modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Licencia: https://huggingface.co/ukisai/Swift-Qwen3.8-27b/blob/main/LICENSE
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Swift-Qwen3.8-27b-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Swift-Qwen3.8-27b-i1-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
