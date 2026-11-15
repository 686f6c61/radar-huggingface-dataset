# balllvin/Flint-abliterated-NVFP4-GGUF

## Resumen

Flint-abliterated-NVFP4-GGUF es una cuantización en formato GGUF de 4 bits (esquema NVFP4) del modelo base RecursiveSI/flint, publicada por el usuario balllvin en Hugging Face. Se trata de una variante "abliterated", es decir, con las direcciones de rechazo del modelo original parcialmente eliminadas mediante técnicas de edición de pesos, lo que reduce las negativas del modelo a responder determinadas peticiones. El modelo base es un transformer de tipo Mixture of Experts (MoE) con aproximadamente 39.800 millones de parámetros totales, según los datos de safetensors del repositorio.

La relevancia de esta ficha es doble: por un lado, documenta una cuantización NVFP4 (formato de 4 bits con escalado por bloques, orientado a GPUs Blackwell de NVIDIA) empaquetada en GGUF, lo que permite su despliegue en runtimes compatibles con este formato; por otro, advierte de que se trata de un modelo derivado con modificaciones de alineamiento que pueden afectar a su comportamiento en producción. El repositorio tiene acceso restringido (gated) y requiere aceptar condiciones en Hugging Face antes de la descarga.

La información pública disponible es muy limitada: no se especifican detalles de arquitectura interna, composición del dataset de entrenamiento, número de tokens, procesos de RLHF/DPO ni resultados de benchmarks. Esta ficha refleja únicamente los datos verificables del repositorio y marca explícitamente como "no disponible" todo aquello que no puede confirmarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), según tags del repositorio; detalles internos no disponibles |
| Parametros totales | 39.785.323.896 (~39,8 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits), empaquetado en GGUF |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantización NVFP4) |

## Arquitectura y entrenamiento

El modelo base RecursiveSI/flint se describe en las etiquetas del repositorio como un Mixture of Experts (MoE), con un total de 39.785.323.896 parámetros. No se dispone de información pública sobre el número de expertos, la dimensión oculta, el número de capas, el mecanismo de atención (estándar, lineal o híbrido) ni la longitud de contexto nativa. Tampoco se documentan los datos de entrenamiento: número de tokens, composición del corpus, fases de preentrenamiento, ajuste supervisado, RLHF o DPO.

La variante aquí publicada incorpora dos transformaciones sobre el modelo base. La primera es una cuantización a NVFP4, un formato de 4 bits con escalado por bloques desarrollado por NVIDIA para acelerar la inferencia en GPUs de la generación Blackwell; el resultado se empaqueta en GGUF, el contenedor habitual de llama.cpp y ecosistemas afines. La segunda es la "abliteración": una edición de pesos que busca neutralizar las direcciones de activación asociadas al rechazo de peticiones, de modo que el modelo tiende a responder a contenido que el modelo original declinaría. No se documenta la metodología exacta de abliteración aplicada ni el grado de modificación respecto al base.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` del repositorio.
- Razonamiento y generación de texto de propósito general, heredados del modelo base (sin benchmarks publicados que lo confirmen).
- Compatibilidad con endpoints de inferencia (etiqueta `endpoints_compatible`), lo que facilita su despliegue en infraestructuras tipo Hugging Face Inference Endpoints.
- Cuantización NVFP4 orientada a inferencia de bajo coste en GPUs compatibles.
- Comportamiento "abliterated": menor tendencia a rechazar peticiones que el modelo base.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).
- Soporte multilingüe: únicamente inglés declarado.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar cómo la abliteración afecta a la distribución de respuestas y a las tasas de rechazo, comparándolo con el modelo base RecursiveSI/flint en el mismo entorno de evaluación.
- Evaluación de cuantizaciones NVFP4: sirve para medir la degradación de calidad y la ganancia de throughput al pasar de pesos completos a 4 bits en GPUs Blackwell, dentro de pipelines de benchmarking reproducibles.
- Despliegue en entornos con restricciones de VRAM: al ocupar el repositorio 22,9 GB, puede ejecutarse en GPUs de 24 GB o superiores mediante runtimes compatibles con GGUF, lo que facilita pruebas en estaciones de trabajo con una sola GPU.
- Generación de texto en inglés para prototipado interno: conversación y redacción de borradores en inglés en entornos controlados donde el equipo asume el riesgo de un modelo sin benchmarks ni garantías de calidad.
- Pruebas de robustez y red teaming: la variante abliterated es útil como sujeto de prueba para evaluar filtros de contenido y sistemas de moderación de salida antes de desplegar modelos en producción.
- Experimentación con endpoints compatibles: integración en servicios de inferencia gestionados que acepten GGUF y cuantizaciones de 4 bits, para comparar latencia y coste frente a alternativas en FP16 o BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 22,9 GB, por lo que la inferencia requiere al menos ~24 GB de VRAM para cargar los pesos completos en memoria, con margen adicional para el contexto y el estado de activaciones.
- GPU recomendadas: GPUs NVIDIA Blackwell (serie RTX 50, B200, GB200) para aprovechar nativamente NVFP4; el formato GGUF puede ejecutarse en otras GPUs mediante dequantización en tiempo de carga, con menor eficiencia.
- GPU de consumo: cabe en tarjetas de 24 GB como la RTX 4090 o la RTX 5090, siempre que el runtime soporte la cuantización NVFP4 empaquetada en GGUF.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) son los candidatos naturales para GGUF; vLLM y TGI no están confirmados para NVFP4 en GGUF. La etiqueta `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints.
- Latencia y throughput: no disponibles; dependen del runtime, del soporte hardware de NVFP4 y de la longitud de contexto, ninguno de los cuales está documentado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| balllvin/Flint-abliterated-NVFP4-GGUF | ~39,8 B (MoE) | no disponible | NVFP4 / GGUF | Apache 2.0 | Gated en Hugging Face |
| RecursiveSI/flint (modelo base) | ~39,8 B (MoE) | no disponible | Pesos originales | no disponible | Hugging Face |
| Alternativas MoE de ~40 B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de contexto para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La abliteración elimina o atenúa los mecanismos de rechazo del modelo, lo que incrementa el riesgo de generar contenido dañino, sesgado o inapropiado sin las salvaguardas del modelo original.
- No hay benchmarks publicados: se desconoce la degradación de calidad introducida por la cuantización NVFP4 y por la propia abliteración.
- El modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está verificado y probablemente sea deficiente.
- Riesgo de alucinación no cuantificado: al no existir evaluaciones públicas, no puede estimarse su fiabilidad factual.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos, lo que condiciona la automatización de pipelines.
- Aunque la licencia es Apache 2.0, el uso comercial de una variante abliterated conlleva riesgos reputacionales y legales por el contenido que pueda generar; se recomienda moderación de salida obligatoria.
- El soporte de NVFP4 en GGUF depende del runtime y del hardware; en GPUs no Blackwell puede requerir dequantización con penalización de rendimiento.
- La ficha del repositorio no documenta la metodología de abliteración ni el grado de divergencia respecto a RecursiveSI/flint, lo que dificulta la reproducibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/balllvin/Flint-abliterated-NVFP4-GGUF
- Modelo base: https://huggingface.co/RecursiveSI/flint
