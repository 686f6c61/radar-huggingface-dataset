# mradermacher/Gemma-4-Writers-31B-V2-i1-GGUF

## Resumen
Gemma-4-Writers-31B-V2-i1-GGUF es una colección de cuantizaciones en formato GGUF generadas por mradermacher a partir del modelo Ateron/Gemma-4-Writers-31B-V2, un merge creado con mergekit por el usuario Ateron y orientado a roleplay y escritura creativa. Se apoya en la arquitectura de la familia Gemma 4 de Google DeepMind, concretamente en la variante densa de 31B parámetros, que constituye la base subyacente del merge.

El modelo resuelve el problema de ejecutar localmente un modelo de 30.700 millones de parámetros en hardware de consumo mediante cuantizaciones de 1 a 8 bits, incluyendo variantes con matriz de importancia (imatrix) que reducen la pérdida de calidad respecto a las cuantizaciones estáticas. El repositorio pesa 90,2 GB en total y ofrece un rango amplio de cuantizaciones, desde IQ1_S e IQ2_XXS hasta Q6_K, además de un fichero imatrix para generar cuantizaciones propias.

La relevancia actual radica en que combina un modelo base multimodal de última generación, con capacidades declaradas de visión y contexto largo en la familia Gemma 4, con un ajuste específico para roleplay en inglés. No obstante, en el momento de redactar esta ficha el repositorio no registra descargas ni valoraciones, y la model card no documenta datos de entrenamiento, benchmarks ni detalles del merge más allá de la etiqueta mergekit.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de la familia Gemma 4); modelo resultante de un merge con mergekit |
| Parametros totales | 30.697.345.596 (aproximadamente 30,7B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no especificada en la model card; la familia Gemma 4 declara hasta 256K tokens |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S; incluye fichero imatrix |
| Idiomas soportados | en (segun etiquetas del repositorio); la familia Gemma 4 declara mas de 140 idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (variantes i1/imatrix y estaticas en repositorio separado) |

## Arquitectura y entrenamiento
El modelo parte de Ateron/Gemma-4-Writers-31B-V2, un merge generado con mergekit (etiquetas merge y mergekit) a partir de modelos de la familia Gemma 4. La arquitectura subyacente es un transformer denso de 31B parámetros; la familia Gemma 4, según su documentación oficial, emplea arquitecturas tanto densas como Mixture-of-Experts y una arquitectura unificada sin encoder para el tratamiento multimodal, con encoders de visión y audio mejorados. La variante de 31B corresponde a la configuración densa dentro de las cinco tallas anunciadas (E2B, E4B, 12B, 26B A4B y 31B).

La model card del repositorio cuantizado no aporta información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el merge incorporó fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas propias del merge más allá de la combinación de pesos mediante mergekit. La contribución específica de este repositorio es la cuantización: se generaron variantes con matriz de importancia (imatrix) para mejorar la fidelidad frente a cuantizaciones estáticas, que se distribuyen en un repositorio aparte (mradermacher/Gemma-4-Writers-31B-V2-GGUF). La model card indica que el modelo base es de tipo vision, y que los ficheros mmproj, si existen, se alojan en el repositorio de cuantizaciones estáticas.

## Capacidades
- Generación de texto en inglés, con orientación específica a roleplay y escritura creativa (etiqueta roleplay y pila conversacional).
- Conversación multiturno, como indica la etiqueta conversational.
- Capacidad multimodal declarada: la model card indica "This is a vision model", aunque los ficheros mmproj no se incluyen en este repositorio.
- Capacidades potenciales de código, razonamiento y matemáticas heredadas de la familia Gemma 4, no verificadas específicamente para este merge.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: el repositorio está etiquetado únicamente como en; la familia Gemma 4 declara más de 140 idiomas, pero el comportamiento del merge no está documentado.
- Capacidad especial de modo pensamiento (thinking mode): no disponible.

## Casos de uso
- Roleplay y narrativa interactiva: es el propósito declarado del merge, con etiqueta explícita de roleplay y una pila conversacional, lo que lo hace adecuado para personajes consistentes en conversaciones multiturno.
- Escritura creativa asistida: generación de relatos, diálogos y descripciones en inglés, aprovechando el ajuste "Writers" del modelo base.
- Despliegue local en hardware de consumo: las cuantizaciones de menor tamaño (Q2_K, IQ3_XS, IQ4_XS) permiten ejecutar un modelo de 30,7B en GPUs con 12-16 GB de VRAM.
- Prototipado de asistentes conversacionales en inglés: gracias a su naturaleza conversacional puede servir como base para probar flujos de diálogo antes de migrar a modelos mayores.
- Generación de datos sintéticos de diálogo: puede emplearse para producir corpus de conversaciones o guiones con fines de evaluación o ajuste.
- Experimentación con cuantizaciones: el fichero imatrix incluido permite crear cuantizaciones personalizadas ajustadas a un caso de uso concreto, útil para investigación en compresión de modelos.
- Inferencia en CPU o sistemas mixtos: al estar en formato GGUF, es compatible con llama.cpp en entornos sin GPU dedicada, aunque con latencias elevadas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de evaluaciones de roleplay, y la búsqueda web no ha devuelto resultados de rendimiento asociados a este repositorio concreto.

## Requisitos de hardware
- VRAM estimada para inferencia (valores aproximados según cuantización, para 30,7B parámetros; no confirmados por el autor):
  - IQ1_S / IQ2_XXS / IQ2_XS: en torno a 8-11 GB.
  - Q2_K / Q2_K_S / IQ3_XS / IQ3_XXS: en torno a 11-14 GB.
  - Q3_K_S / Q3_K_M / Q3_K_L / IQ3_S: en torno a 14-16 GB.
  - Q4_K_S / Q4_K_M / IQ4_XS / Q4_0 / Q4_1 / small-IQ4_NL: en torno a 17-20 GB.
  - Q5_K_S / Q5_K_M: en torno a 21-23 GB.
  - Q6_K: en torno a 25-26 GB.
- GPU recomendadas: para las cuantizaciones Q4 y Q5, tarjetas con 24 GB (RTX 3090, RTX 4090, A5000) resultan adecuadas; para Q6_K se recomienda 32 GB (A100 40 GB, V100 32 GB); las variantes de 2-3 bits caben en GPUs de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti Super 16 GB).
- Cabe en GPU de consumo: sí, en las cuantizaciones de 1 a 5 bits según la VRAM disponible; las variantes Q6_K requieren al menos 24-32 GB.
- Opciones de despliegue: llama.cpp, Ollama, koboldcpp (habitual para roleplay), LM Studio y text-generation-webui (oobabooga), así como cualquier runtime compatible con GGUF. El soporte de GGUF en vLLM es limitado y no está documentado para este modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/Gemma-4-Writers-31B-V2-i1-GGUF (este) | 30,7B | no especificado | GGUF (imatrix) | apache-2.0 | Repositorio HuggingFace, 0 descargas |
| mradermacher/Gemma-4-Writers-31B-V2-GGUF | 30,7B | no especificado | GGUF (estatico) | apache-2.0 | Repositorio HuggingFace |
| Ateron/Gemma-4-Writers-31B-V2 | no disponible | no disponible | safetensors (presumiblemente) | no disponible | Repositorio HuggingFace |
| Gemma 4 31B (Google DeepMind) | 31B (denso) | hasta 256K tokens | safetensors / otros | Gemma (terminos propios) | Modelo oficial |

Los datos de rendimiento comparado no están disponibles; no se han podido verificar métricas de roleplay ni de capacidades generales para este merge frente a modelos de tamaño similar.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados en la model card. Al ser un merge orientado a roleplay, puede heredar sesgos de los modelos combinados en la fusión.
- Riesgo de alucinación: no evaluado; como todo modelo generativo de este tamaño, es susceptible de inventar información, especialmente en dominios factuales.
- Limitación de idioma: el repositorio está etiquetado únicamente para inglés (en), pese a que la familia Gemma 4 declara soporte multilingüe. El comportamiento en castellano no está verificado.
- Limitación de contexto: la longitud de contexto efectiva no está documentada para este merge, aunque la base Gemma 4 declara hasta 256K tokens; no se garantiza que el merge la conserve.
- Restricciones de licencia: se declara apache-2.0, aunque el modelo base pertenece a la familia Gemma, cuyos términos de uso de Google podrían imponer condiciones adicionales no reflejadas en la etiqueta del repositorio. Conviene verificar los términos de Gemma antes de uso comercial.
- Ausencia de adopción: 0 descargas y 0 valoraciones en el momento de la consulta, lo que implica falta de validación comunitaria.
- Vision declarada sin ficheros mmproj en este repositorio: la capacidad de visión no puede aprovecharse directamente aquí; habría que acudir al repositorio de cuantizaciones estáticas.
- Origen del modelo: al ser un merge sin informe técnico, no se documentan datos de entrenamiento, proceso de evaluación ni control de calidad.
- Uso en producción: la falta de benchmarks y de pruebas de robustez desaconseja su empleo en sistemas críticos sin una evaluación previa exhaustiva.

## Enlaces
- Repositorio HuggingFace (i1/imatrix): https://huggingface.co/mradermacher/Gemma-4-Writers-31B-V2-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/Gemma-4-Writers-31B-V2-GGUF
- Modelo base (merge original): https://huggingface.co/Ateron/Gemma-4-Writers-31B-V2
- Perfil del cuantizador: https://huggingface.co/mradermacher
- Página de peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Modelo relacionado (Gemma4-Writer-31B-D-GGUF): https://huggingface.co/mradermacher/Gemma4-Writer-31B-D-GGUF
- Página oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Model card de Gemma 4 (Google AI for Developers): https://ai.google.dev/gemma/docs/core/model_card_4
- Gemma 4 Technical Report (arXiv): https://arxiv.org/abs/2607.02770
- Guía de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
