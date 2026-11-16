# mradermacher/Gemma-4-12B-Uncensored-i1-GGUF

## Resumen

Gemma-4-12B-Uncensored-i1-GGUF es una coleccion de cuantizaciones GGUF generadas por mradermacher a partir del modelo base abacusai/Gemma-4-12B-Uncensored. No se trata de un modelo entrenado desde cero, sino de una distribucion de pesos comprimidos en multiples niveles de cuantizacion (desde IQ1_S hasta Q6_K) pensada para su uso con llama.cpp y herramientas compatibles. El modelo subyacente, segun la nomenclatura, deriva de la familia Gemma 4 de Google con aproximadamente 11.900 millones de parametros y un ajuste orientado a eliminar los filtros de rechazo (uncensored).

La relevancia de esta publicacion es practica: ofrece variantes de cuantizacion con imatrix (importance matrix) que permiten ejecutar un modelo de ~12B parametros en hardware de consumo con perdida de calidad controlada. El repositorio ocupa 4,8 GB, lo que sugiere que las cuantizaciones de mayor tamano pueden no estar completas o que el conteo de parametros declarado no se corresponde exactamente con el modelo base.

No se dispone de model card descriptiva, licencia declarada, idiomas soportados ni pipeline en la informacion proporcionada. Todos los datos tecnicos que siguen se limitan a lo verificable en los metadatos y en los comentarios internos del README.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (derivada de la familia Gemma 4; detalles no disponibles) |
| Parametros totales | 11.907.350.576 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL (small) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones con imatrix) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base. Por la nomenclatura "Gemma-4-12B" se infiere que deriva de la familia Gemma 4 de Google, pero no se confirma en los metadatos ni en la model card. El autor de las cuantizaciones es mradermacher, que aplica cuantizacion con importance matrix (imatrix) sobre los pesos del modelo abacusai/Gemma-4-12B-Uncensored, un ajuste "uncensored" del modelo base.

No se proporcionan datos sobre el numero de tokens de entrenamiento, composicion del dataset, tecnicas de alineacion (RLHF, DPO) ni innovaciones arquitectonicas. El campo `convert_type: hf` en los comentarios del README indica que la conversion se hizo desde pesos en formato Hugging Face. El tag `nicoboss` aparece en los metadatos, probablemente asociado a la herramienta o al pipeline de cuantizacion utilizado.

## Capacidades

- Generacion de texto conversacional (tag `conversational` en los metadatos).
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que sugiere uso mediante APIs de inferencia.
- El ajuste "uncensored" implica que el modelo no aplica rechazos por defecto ante peticiones que los modelos alineados rechazarian.
- Capacidades de razonamiento, codigo, matematicas, vision, tool calling o agentes: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Despliegue local en hardware de consumo: las cuantizaciones IQ2/IQ3 permiten ejecutar un modelo de ~12B en GPUs con 8-12 GB de VRAM mediante llama.cpp, util para prototipado sin depender de servicios en la nube.
- Experimentacion con modelos sin filtros: el ajuste uncensored resulta adecuado para investigacion sobre comportamiento de modelos sin alineacion estricta, siempre con las salvaguardas adecuadas.
- Generacion de texto creativo sin restricciones tematicas: narrativa, guiones o dialogos donde los filtros de rechazo interrumpen la generacion.
- Fine-tuning posterior sobre las cuantizaciones de mayor precision (Q6_K): util como base para adaptaciones especificas cuando no se dispone de los pesos originales en safetensors.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye mas de 20 variantes, lo que permite medir el impacto de la cuantizacion en calidad para un mismo modelo base.
- Integracion en pipelines de inferencia con llama.cpp u Ollama: el formato GGUF es directamente consumible por estas herramientas, lo que facilita su inclusion en entornos de desarrollo locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: entre ~2 GB (IQ1_S) y ~9-10 GB (Q6_K) para el modelo completo, segun el nivel de cuantizacion. El repo ocupa 4,8 GB, por lo que las variantes de mayor tamano podrian no estar presentes o estar incompletas.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090 para cuantizaciones medias y altas; A100/H100 no son necesarias para un modelo de este tamano.
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones (Q4_K_M en adelante requieren ~7-8 GB).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-12B-Uncensored-i1-GGUF | ~11,9B | no disponible | no disponible | GGUF | Hugging Face |
| abacusai/Gemma-4-12B-Uncensored | ~11,9B | no disponible | no disponible | safetensors (presumiblemente) | Hugging Face |
| Otras cuantizaciones GGUF de la familia Gemma 4 | ~11,9B | no disponible | no disponible | GGUF | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- El ajuste "uncensored" elimina los filtros de rechazo, lo que implica riesgo de generar contenido danino, ofensivo o ilegal. No es apto para produccion sin moderacion externa.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido. Es un bloqueo critico para cualquier despliegue en produccion.
- No se especifican idiomas soportados; el rendimiento en castellano es desconocido.
- No se dispone de informacion sobre la longitud de contexto, lo que impide planificar casos de uso con ventanas largas.
- Riesgo de alucinacion inherente a los modelos de ~12B, agravado por la ausencia de datos de evaluacion.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (16 de noviembre de 2026), lo que sugiere que no ha sido validado por la comunidad.
- El tamano del repo (4,8 GB) es inferior al esperado para 24 cuantizaciones de un modelo de 12B, por lo que algunas variantes podrian faltar o estar incompletas.
- La model card no aporta informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Gemma-4-12B-Uncensored-i1-GGUF
- Modelo base: https://huggingface.co/abacusai/Gemma-4-12B-Uncensored
