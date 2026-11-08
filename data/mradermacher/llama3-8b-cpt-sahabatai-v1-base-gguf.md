# mradermacher/llama3-8b-cpt-sahabatai-v1-base-GGUF

## Resumen

llama3-8b-cpt-sahabatai-v1-base-GGUF es la versión cuantizada en formato GGUF del modelo base GoToCompany/llama3-8b-cpt-sahabatai-v1-base, un transformer de 8.030.261.248 parámetros derivado de Llama 3 8B mediante continued pre-training (CPT) sobre datos de idiomas de Indonesia. La cuantización la publica mradermacher, un conocido empaquetador de pesos GGUF, y está pensada para ejecución local con llama.cpp y herramientas compatibles.

El modelo original amplía la cobertura lingüística de Llama 3 hacia el indonesio (id), el javanés (jv) y el sundanés (su), manteniendo el inglés (en) como idioma principal. Se trata de un modelo base, no ajustado para instrucciones, por lo que su uso natural es la continuación de texto y el fine-tuning posterior, no el diálogo directo.

La relevancia actual radica en que ofrece una alternativa ligera y ejecutable en hardware de consumo para tareas en lenguas austronesias, un nicho poco cubierto por los modelos generalistas. El repositorio contiene 12 cuantizaciones estáticas (desde Q2_K hasta f16) y ocupa 71,8 GB en total.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3 8B) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, id, jv, su |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | GGUF (cuantizaciones estaticas; el modelo base original en safetensors) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3 8B: un transformer decoder-only con atención multi-cabeza agrupada (GQA), normalización RMSNorm y activación SwiGLU, con 8.030.261.248 parámetros totales. Sobre esa base, GoToCompany aplicó continued pre-training (CPT) para adaptar el modelo a los idiomas de Indonesia, según se deduce del nombre del checkpoint (`cpt-sahabatai-v1-base`).

No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron fases de RLHF o DPO. Al tratarse de un modelo base, es esperable que no haya habido ajuste por preferencias, pero este extremo no está confirmado en la documentación disponible. La cuantización realizada por mradermacher es estática (quantize_version 2, output_tensor_quantised 1); el autor indica que no hay cuantizaciones ponderadas/imatrix disponibles en el momento de la publicación.

## Capacidades

- Generación de texto y continuación de secuencias en inglés, indonesio, javanés y sundanés.
- Modelo base: no incluye alineación para instrucciones ni plantilla de chat; requiere prompting de continuación o fine-tuning.
- Capacidades multilingües centradas en lenguas austronesias (id, jv, su) además del inglés.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.
- No se documenta soporte de visión, audio ni modo thinking.
- Adecuado como punto de partida para fine-tuning supervisado en tareas específicas de los idiomas cubiertos.

## Casos de uso

- Fine-tuning para generación de texto en indonesio: el checkpoint CPT proporciona una base adaptada al idioma que puede ajustarse con SFT sobre corpus propios, reduciendo el coste frente a partir de Llama 3 puro.
- Procesamiento de textos en javanés y sundanés: útil para normalización, resumen o etiquetado de documentos en estas lenguas de bajos recursos, ejecutable en local con cuantizaciones Q4_K_M.
- Investigación lingüística comparada: permite estudiar el comportamiento del continued pre-training sobre lenguas austronesias frente al modelo Llama 3 original.
- Despliegue en entornos sin GPU dedicada: las cuantizaciones Q2_K (3,3 GB) y Q3_K_S (3,8 GB) permiten inferencia en CPU con llama.cpp para prototipos y pruebas.
- Generación de datos sintéticos en indonesio: el modelo puede producir corpus de continuación de texto que luego se filtren y usen para entrenar modelos más pequeños.
- Base para modelos instruct en indonesio: el ecosistema ya publica una variante instruct del mismo checkpoint (llama3-8b-cpt-sahabatai-v1-instruct), lo que confirma su uso como sustrato para ajuste conversacional.
- Experimentación académica con cuantizaciones: el repositorio ofrece 12 variantes que permiten medir el impacto de la cuantización en perplejidad sobre lenguas no inglesas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,3 GB (Q2_K), 5,0 GB (Q4_K_M), 8,6 GB (Q8_0) y 16,2 GB (f16), según los tamaños de fichero publicados.
- GPU recomendadas: RTX 3060 12 GB o superior para Q4_K_M y Q5_K_M; RTX 4090 (24 GB) para Q8_0 y f16; A100 o H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, desde GPUs de 6-8 GB con cuantizaciones Q3/Q4; las variantes Q2_K y Q3_K_S también son viables en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo Hugging Face Inference Endpoints sobre el modelo base.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| llama3-8b-cpt-sahabatai-v1-base-GGUF | 8,03 B | no disponible | en, id, jv, su | llama3 | GGUF |
| meta-llama/Meta-Llama-3-8B | 8,03 B | no disponible | en (principalmente) | llama3 | safetensors |
| mradermacher/llama3-8b-cpt-sahabatai-v1-instruct-GGUF | 8,03 B | no disponible | en, id, jv, su | llama3 | GGUF |

La diferencia principal frente a Llama 3 8B original es la adaptación mediante CPT a los idiomas de Indonesia. Frente a la variante instruct del mismo checkpoint, este modelo base carece de alineación conversacional y está orientado a continuación de texto y fine-tuning.

## Limitaciones y advertencias

- Modelo base sin alineación: no responde de forma fiable a instrucciones directas ni mantiene formato conversacional sin ajuste previo.
- Riesgo de alucinación y de continuaciones incoherentes, especialmente fuera de los dominios vistos en el CPT.
- Cobertura limitada a cuatro idiomas; el rendimiento en castellano u otras lenguas no está documentado y probablemente sea deficiente.
- La licencia llama3 impone restricciones de uso comercial (cláusula de 700 millones de usuarios mensuales, obligaciones de atribución y política de uso aceptable); es necesario revisar los términos de Meta antes de producción.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad; el autor recomienda Q4_K_M o superiores.
- No hay cuantizaciones imatrix/ponderadas publicadas, lo que limita la calidad máxima alcanzable en tamaños pequeños.
- No se dispone de datos de evaluación que permitan estimar la degradación por cuantización en los idiomas de Indonesia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/llama3-8b-cpt-sahabatai-v1-base-GGUF
- Modelo base original: https://huggingface.co/GoToCompany/llama3-8b-cpt-sahabatai-v1-base
- Variante instruct cuantizada: https://huggingface.co/mradermacher/llama3-8b-cpt-sahabatai-v1-instruct-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#llama3-8b-cpt-sahabatai-v1-base-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
