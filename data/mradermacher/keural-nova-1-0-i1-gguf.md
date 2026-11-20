# mradermacher/Keural-Nova-1.0-i1-GGUF

## Resumen

Keural-Nova-1.0-i1-GGUF es la colección de cuantizaciones GGUF, generadas con imatrix por mradermacher, del modelo base mkd-ai/Keural-Nova-1.0. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con 35.505.251.456 parámetros totales (unos 35,5 mil millones), afinado mediante LoRA e instruction-tuning para conversación en coreano e inglés. Su licencia Apache 2.0 lo hace atractivo para uso comercial sin restricciones adicionales.

La relevancia de esta publicación reside en que permite ejecutar un modelo MoE de 35B en hardware de consumo mediante cuantizaciones que van desde 13,3 GB (i1-Q2_K) hasta 29,3 GB (i1-Q6_K). Las cuantizaciones i1 incorporan una matriz de importancia (imatrix) que mejora la calidad respecto a las cuantizaciones estáticas equivalentes, especialmente en los rangos bajos de bits.

El modelo está orientado a tareas conversacionales e instruction-following, con soporte nativo de coreano e inglés. Al ser una cuantización, hereda las capacidades y limitaciones del modelo base, del cual no se dispone de información detallada sobre datos de entrenamiento, longitud de contexto ni benchmarks en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer |
| Parametros totales | 35.505.251.456 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (además de imatrix suelta) |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base Keural-Nova-1.0 emplea una arquitectura Mixture of Experts (MoE) con 35,5 mil millones de parámetros totales. Según las etiquetas del repositorio, el modelo ha sido sometido a instruction-tuning mediante LoRA, lo que sugiere un proceso de ajuste fino sobre un modelo preentrenado, probablemente con datos conversacionales en coreano e inglés. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica principal de esta publicación concreta es el uso de cuantizaciones i1 con imatrix (importance matrix), generadas por mradermacher. La imatrix se calcula a partir de activaciones sobre un corpus de calibración y permite asignar más bits a los pesos con mayor impacto en la salida, mejorando la perplejidad de las cuantizaciones de baja precisión respecto a las cuantizaciones estáticas equivalentes. El repositorio incluye también el fichero imatrix suelto (0,3 GB) para que otros usuarios puedan generar sus propias cuantizaciones.

## Capacidades

- Generación de texto conversacional e instruction-following en coreano e inglés.
- Razonamiento multi-turno dentro de una conversación (limitado por la longitud de contexto, no especificada).
- Ajuste mediante LoRA e instruction-tuning, orientado a respuestas siguiendo instrucciones.
- Soporte de despliegue mediante llama.cpp y ecosistema GGUF (Ollama, LM Studio, etc.).
- No se ha documentado soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode) en la información disponible.
- Capacidades multilingües limitadas a coreano e inglés según la model card.

## Casos de uso

- Asistentes conversacionales en coreano: el modelo puede gestionar diálogos multi-turno en coreano con calidad razonable gracias al instruction-tuning y a su tamaño de 35B, desplegado en local con cuantización i1-Q4_K_M (21,8 GB) en una GPU de 24 GB.
- Traducción coreano-inglés: al soportar ambos idiomas de forma nativa, puede emplearse para traducción bidireccional en pipelines de documentación o atención al cliente, aunque sin garantías de calidad sin evaluación previa.
- Procesamiento de texto en entornos con requisitos de soberanía de datos: al ser Apache 2.0 y ejecutable en local con llama.cpp, permite procesar textos confidenciales sin enviarlos a APIs externas.
- Generación de contenido en coreano para marketing o soporte: el modelo puede redactar borradores y respuestas en coreano que luego se revisan humanamente, aprovechando su instruction-tuning.
- Investigación sobre cuantización MoE: el repositorio ofrece 15 cuantizaciones distintas más la imatrix, lo que permite estudiar el impacto de la precisión en la calidad de un MoE de 35B.
- Despliegue en estaciones de trabajo con GPU de consumo: con i1-IQ3_M (15,9 GB) o i1-Q4_K_S (20,5 GB) cabe en GPUs de 16-24 GB, habilitando prototipado local de aplicaciones conversacionales en coreano.
- Fine-tuning posterior sobre la base: al ser Apache 2.0 y derivar de un modelo con LoRA, es plausible (aunque no documentado) partir del modelo base para ajustes específicos de dominio en coreano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, más overhead de contexto):
  - i1-Q2_K: ~13,3 GB de pesos.
  - i1-IQ3_M: ~15,9 GB de pesos.
  - i1-IQ4_XS: ~19,3 GB de pesos.
  - i1-Q4_K_M: ~21,8 GB de pesos.
  - i1-Q5_K_M: ~25,4 GB de pesos.
  - i1-Q6_K: ~29,3 GB de pesos.
- GPU recomendadas: para i1-Q4_K_M o superiores, A100 40 GB, H100 80 GB o RTX 4090 24 GB (esta última justa para Q4_K_M con contexto corto). Para cuantizaciones IQ3, una RTX 4090 o RTX 4080 de 16 GB puede ser suficiente.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con i1-Q4_K_M y en GPUs de 16 GB con i1-IQ3_M o i1-IQ3_S.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. No se menciona soporte de vLLM o TGI para estos ficheros GGUF.
- Latencia y throughput: no disponibles. Al ser un MoE, el throughput dependerá del número de parámetros activos, dato no especificado.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Keural-Nova-1.0-i1-GGUF (este) | 35,5B (MoE) | no disponible | Apache 2.0 | GGUF | Coreano/inglés, instruction-tuned con LoRA |
| Keural-Nova-1.0 (base) | 35,5B (MoE) | no disponible | Apache 2.0 | safetensors | Pesos originales sin cuantizar |
| Keural-Nova-1.0-GGUF (estático) | 35,5B (MoE) | no disponible | Apache 2.0 | GGUF | Cuantizaciones estáticas sin imatrix, menor calidad en bits bajos |

No se dispone de información sobre otros modelos comparables de la misma categoría (MoE de ~35B orientados a coreano) en la documentación proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un modelo entrenado principalmente en coreano e inglés, es probable que tenga un sesgo cultural hacia esos idiomas.
- Riesgo de alucinación: inherente a los modelos generativos; no se han publicado evaluaciones de factualidad.
- Limitaciones de contexto o idioma: solo se declaran coreano e inglés; el rendimiento en otros idiomas (incluido el español) no está garantizado y probablemente sea deficiente.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero conviene verificar la licencia del modelo base mkd-ai/Keural-Nova-1.0 para confirmar compatibilidad.
- Caveats para producción: las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad de forma notable; se recomienda i1-Q4_K_M o superior para uso en producción. Al ser un MoE, el consumo de VRAM se rige por los parámetros totales, no por los activos, por lo que no se beneficia de la reducción de memoria típica de los MoE.
- No se dispone de información sobre la longitud de contexto real del modelo base, lo que impide planificar despliegues con ventanas largas.
- El repositorio tiene 0 likes y 392 descargas, lo que sugiere poca validación comunitaria; conviene evaluar el modelo en el dominio objetivo antes de adoptarlo.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Keural-Nova-1.0-i1-GGUF
- Modelo base: https://huggingface.co/mkd-ai/Keural-Nova-1.0
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Keural-Nova-1.0-GGUF
- Página de descarga del autor: https://hf.tst.eu/model#Keural-Nova-1.0-i1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
