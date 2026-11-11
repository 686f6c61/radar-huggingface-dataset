# mradermacher/Nature-Reason-1.2-small-GGUF

## Resumen

Nature-Reason-1.2-small-GGUF es la versión cuantizada en formato GGUF del modelo Nature-Reason-1.2-small, publicado por el usuario mradermacher a partir del modelo original de GuilhermeNaturaUmana. Se trata de un modelo de lenguaje conversacional derivado de la familia Qwen2.5-72B-Instruct, con 77.965.463.552 parámetros totales (aproximadamente 78 mil millones) en formato safetensors, tal como confirma el dato real del repositorio. El repositorio GGUF ocupa 557,2 GB e incluye múltiples niveles de cuantización estática.

El modelo está orientado a razonamiento y conversación en inglés, y su relevancia radica en que permite desplegar un modelo de ~78B parámetros en hardware con recursos limitados mediante cuantización GGUF, desde Q2_K (31,9 GB) hasta Q8_0 (83,0 GB). Al derivar de Qwen2.5-72B-Instruct, hereda la licencia Qwen, lo que condiciona su uso comercial.

La ficha se centra en la versión GGUF publicada por mradermacher, ya que la información disponible sobre el modelo base es limitada. No se dispone de datos de benchmarks ni de detalles de entrenamiento específicos del modelo original en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Qwen2.5-72B-Instruct, presumiblemente transformer decoder-only) |
| Parametros totales | 77.965.463.552 (~78B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | qwen (Qwen2.5-72B-Instruct LICENSE) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Nature-Reason-1.2-small en la información proporcionada. El modelo deriva de Qwen2.5-72B-Instruct, lo que sugiere una arquitectura transformer decoder-only con aproximadamente 78 mil millones de parámetros, pero no se confirma en la documentación disponible. Tampoco se detallan los datos de entrenamiento (número de tokens, composición del dataset) ni si hubo fases de RLHF, DPO o ajuste fino específico para razonamiento.

La contribución técnica de este repositorio es la cuantización estática en formato GGUF realizada por mradermacher, que permite ejecutar el modelo con llama.cpp y herramientas compatibles. Se ofrecen cuantizaciones K-quant estáticas (Q2_K a Q8_0) e IQ4_XS; el autor indica que las cuantizaciones ponderadas/imatrix están disponibles en un repositorio separado (Nature-Reason-1.2-small-i1-GGUF). No se documentan innovaciones arquitectónicas adicionales más allá de la cuantización.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento de múltiples pasos (el nombre "Nature-Reason" sugiere orientación a razonamiento, aunque no se detalla en la información disponible).
- No se confirma soporte de tool calling / function calling en la información proporcionada.
- No se confirma soporte de agentes ni multi-step reasoning estructurado más allá de lo implícito en el nombre.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del repositorio.
- No se confirman capacidades de visión, audio ni modo thinking explícito.
- Compatible con endpoints (etiqueta "endpoints_compatible").

## Casos de uso

- Despliegue en hardware con VRAM limitada: gracias a las cuantizaciones Q2_K (31,9 GB) y Q3_K_S (36,9 GB), el modelo puede ejecutarse en GPUs de 40-48 GB o en configuraciones multi-GPU consumer, algo inviable con los pesos safetensors originales de ~156 GB en FP16.
- Inferencia local con llama.cpp: el formato GGUF permite ejecutar el modelo en CPU o GPU mediante llama.cpp, Ollama u otros runners compatibles, facilitando pruebas de razonamiento conversacional sin infraestructura de datacenter.
- Prototipado de asistentes conversacionales en inglés: el modelo puede gestionar diálogos multi-turno, aunque la longitud de contexto no está documentada y debe validarse empíricamente.
- Evaluación de modelos de razonamiento: útil para investigadores que quieran comparar el comportamiento de un derivado de Qwen2.5-72B en tareas de razonamiento sin necesidad de descargar los pesos completos.
- Servicio de inferencia con cuantización Q4_K_M (50,8 GB): el autor la marca como "fast, recommended", adecuada para despliegues en servidores con 2×RTX 4090 (48 GB) o A100 80 GB, equilibrando calidad y velocidad.
- Fine-tuning o experimentación sobre el modelo base: quienes necesiten los pesos completos pueden usar el modelo original de GuilhermeNaturaUmana, mientras que las versiones GGUF sirven para validación rápida antes de invertir en el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~32 GB, Q3_K_S ~37 GB, Q4_K_S ~47 GB, Q4_K_M ~51 GB, Q5_K_M ~58 GB, Q6_K ~69 GB, Q8_0 ~83 GB (tamaños de archivo; la VRAM real puede ser algo superior por el contexto y overhead).
- GPU recomendadas: A100 80 GB para Q6_K/Q8_0; 2×RTX 4090 (48 GB) para Q4_K_S/Q4_K_M; A6000 48 GB para Q4; GPUs de 40 GB (A100 40 GB) para Q3_K_S.
- No cabe en una única GPU consumer de 24 GB (RTX 4090) en ninguna cuantización; requiere multi-GPU o offloading a RAM.
- Opciones de despliegue: llama.cpp, Ollama, y runners compatibles con GGUF; el modelo base es compatible con transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Nature-Reason-1.2-small-GGUF | ~78B | no disponible | qwen | GGUF | Hugging Face (mradermacher) |
| Qwen2.5-72B-Instruct | 72B | no disponible en esta ficha | qwen | safetensors, GGUF (terceros) | Hugging Face (Qwen) |
| Llama-3.1-70B-Instruct | 70B | no disponible en esta ficha | Llama 3.1 | safetensors, GGUF (terceros) | Hugging Face (Meta) |

No se dispone de datos de rendimiento comparativo en la información proporcionada. La comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Solo soporta inglés según la etiqueta de idioma; no se garantiza calidad en castellano u otros idiomas.
- La licencia "qwen" remite a la licencia de Qwen2.5-72B-Instruct; es necesario revisar sus términos para uso comercial, ya que puede incluir restricciones.
- No se dispone de información sobre sesgos, riesgo de alucinación ni evaluación de seguridad del modelo base.
- La longitud de contexto no está documentada; no asumir ventanas largas sin validación.
- Las cuantizaciones Q2_K y Q3_K_M pueden degradar notablemente la calidad (el autor marca Q3_K_M como "lower quality").
- El repositorio tiene muy pocas descargas (25) y ningún "like", lo que sugiere escasa validación comunitaria.
- El modelo base es de un autor individual (GuilhermeNaturaUmana), sin documentación pública detallada sobre su entrenamiento o procedencia de datos.
- Los archivos Q4_K_M, Q5_K_S, Q5_K_M, Q6_K y Q8_0 están divididos en dos partes; es necesario concatenarlas correctamente antes de usarlas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Nature-Reason-1.2-small-GGUF
- Modelo base: https://huggingface.co/GuilhermeNaturaUmana/Nature-Reason-1.2-small
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Nature-Reason-1.2-small-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Nature-Reason-1.2-small-GGUF
- Licencia Qwen2.5-72B-Instruct: https://huggingface.co/Qwen/Qwen2.5-72B-Instruct/blob/main/LICENSE
- README de referencia para GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
