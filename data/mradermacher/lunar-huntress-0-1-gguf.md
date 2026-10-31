# mradermacher/Lunar-Huntress-0.1-GGUF

## Resumen

Lunar-Huntress-0.1-GGUF es una colección de cuantizaciones GGUF estáticas del modelo Husky110/Lunar-Huntress-0.1, publicada por el cuantizador mradermacher, conocido por su amplio catálogo de conversiones GGUF de modelos de la comunidad. El modelo base es un merge (fusión de pesos) creado con mergekit mediante el método TIES, construido sobre la arquitectura Gemma, con unos 30,7 mil millones de parámetros totales según los metadatos de safetensors.

El modelo original está orientado a roleplay, escritura creativa y uso como companion conversacional, e incluye etiquetas de contenido adulto (NSFW), por lo que va dirigido a un público adulto y a casos de uso de ficción interactiva. La versión GGUF permite ejecutarlo localmente en hardware de consumo mediante llama.cpp, Ollama u otros runtimes compatibles, con cuantizaciones que van desde Q2_K (12 GB) hasta Q8_0 (32,7 GB).

Su relevancia actual radica en la tendencia de la comunidad a crear merges especializados en narrativa y roleplay a partir de arquitecturas base sólidas como Gemma, y a distribuirlos en formatos cuantizados accesibles. La licencia Apache 2.0 del modelo base y de la cuantización permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gemma (transformer denso), merge TIES vía mergekit |
| Parametros totales | 30.697.345.596 (~30,7 B) |
| Parametros activos | no disponible (no consta que sea MoE; se asume densidad completa) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas; hay versión imatrix aparte) |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |

## Arquitectura y entrenamiento

El modelo base, Husky110/Lunar-Huntress-0.1, es un merge de modelos creado con mergekit utilizando el método TIES (Task Arithmetic with sign consensus), que resuelve los conflictos de signo entre los deltas de tarea de varios modelos para reducir la interferencia entre ellos, una técnica habitual para combinar modelos fine-tuned sin entrenamiento adicional. La arquitectura subyacente es Gemma, según los metadatos del repositorio.

No hay información disponible sobre los datos de entrenamiento, el número de tokens, ni sobre fases de RLHF o DPO del modelo original o de los modelos fuente del merge. Tampoco consta si el modelo cuenta con capacidades multimodales; el repositorio indica que se omite el archivo mmproj en la conversión, lo que sugiere que no se ha incluido proyección multimodal. Cabe señalar que los merges TIES no implican entrenamiento nuevo: heredan las capacidades y sesgos de los modelos fuente.

## Capacidades

- Generación de texto orientada a roleplay y conversación de tipo companion, según los tags del autor.
- Escritura creativa: narrativa de ficción, diálogos y prosa en inglés.
- Contenido adulto (NSFW): el modelo está etiquetado explícitamente para ese público; no es apto para menores ni para entornos de trabajo.
- Conversación multi-turno (tag "conversational"), aunque la longitud de contexto no está documentada.
- No hay información disponible sobre soporte de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento extendido.
- Capacidades multilingües: no disponibles; solo se declara inglés.

## Casos de uso

- Roleplay interactivo local: ejecutar personajes de ficción persistentes en frontends como SillyTavern o text-generation-webui con llama.cpp, sin depender de APIs externas y con control total del contenido.
- Companion conversacional: mantener conversaciones de larga duración con un personaje definido, aprovechando el enfoque del modelo en ese nicho.
- Escritura creativa asistida: generar borradores de prosa, diálogos o escenas de ficción en inglés, integrando el modelo en editores locales o scripts de escritura.
- Prototipado de aplicaciones de ficción interactiva: dado que es Apache 2.0, se puede integrar en productos comerciales de narrativa o juegos de texto, respetando la clasificación de contenido adulto.
- Evaluación de merges TIES: usar el modelo como caso de estudio para comparar el comportamiento de merges frente a modelos base en tareas de escritura.
- Pruebas de rendimiento de cuantizaciones: comparar la degradación de calidad entre Q2_K y Q8_0 en tareas creativas con hardware variable, dado que el repo ofrece once niveles de cuantización.
- Uso en servidores domésticos: desplegar el modelo en una estación de trabajo con GPU de gama alta o en CPU con suficiente RAM para servir un chatbot personal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un merge orientado a roleplay y escritura creativa, es habitual que el autor no publique métricas en benchmarks académicos (MMLU, HumanEval, GSM8K), y en este caso no consta ninguna.

## Requisitos de hardware

- VRAM/RAM estimada según cuantización (tamaño del archivo GGUF; se recomienda margen adicional para el KV cache):
  - Q2_K: ~12 GB
  - Q3_K_M: ~15,4 GB
  - IQ4_XS: ~17 GB
  - Q4_K_M: ~18,8 GB
  - Q5_K_M: ~21,9 GB
  - Q6_K: ~25,3 GB
  - Q8_0: ~32,7 GB
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para cuantizaciones Q2_K a Q4_K_M con descarga parcial o completa según contexto; RTX 5090 (32 GB) o A100 40 GB para Q5/Q6/Q8 completos en GPU.
- Consumer GPU: cabe en una RTX 3090/4090 de 24 GB con Q4_K_S o Q4_K_M (17,9-18,8 GB) dejando espacio para contexto; las cuantizaciones Q5 y superiores requieren offload a CPU o GPU con más de 24 GB. En CPU pura, se necesita al menos 32 GB de RAM para Q8_0.
- Despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, koboldcpp y text-generation-webui; los GGUF de mradermacher son compatibles con cualquier runtime que soporte el formato.
- Latencia y throughput: no disponibles; con cuantizaciones Q4 en una RTX 4090 es razonable esperar decenas de tokens por segundo para un modelo denso de ~30 B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Licencia | Formato | Enfoque |
|---|---|---|---|---|
| Lunar-Huntress-0.1 (este) | ~30,7 B | Apache 2.0 | GGUF | Roleplay, companion, escritura creativa, NSFW |
| Gemma base (familia, tamaño ~30 B si existe variante equivalente) | no disponible para comparación directa | Gemma license | safetensors/GGUF | Modelo generalista base |
| Otros merges de roleplay de la comunidad (p. ej., basados en Mistral o Llama a 7-13 B) | 7-13 B típicamente | variadas | GGUF | Roleplay, menor consumo de recursos |

Nota: no hay información suficiente para una comparativa cuantitativa fiable (benchmarks ni specs de contexto); los merges de roleplay de menor tamaño (7-13 B) son la alternativa habitual para hardware más modesto, a costa de menor capacidad de escritura, mientras que los modelos base oficiales de Google con licencia Gemma tienen restricciones de uso distintas a Apache 2.0.

## Limitaciones y advertencias

- Contenido adulto: el modelo está etiquetado NSFW y "not-for-all-audiences"; no debe desplegarse en contextos con menores ni entornos profesionales sin filtros.
- Sesgos: como merge de modelos fine-tuned, hereda los sesgos de los modelos fuente; no hay documentación sobre auditorías de sesgo.
- Alucinaciones: al no existir benchmarks ni documentación de alineación, debe asumirse un riesgo de alucinación típico de modelos de esta clase, agravado en cuantizaciones bajas (Q2_K, Q3).
- Idioma: solo se declara soporte de inglés; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Contexto: la longitud de ventana de contexto no está documentada; verificar en la model card del modelo base antes de planificar conversaciones largas.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado (NSFW) puede estar sujeto a restricciones legales según jurisdicción y a las políticas de las plataformas de distribución.
- Calidad por cuantización: las cuantizaciones Q2_K y Q3_K_M degradan notablemente la calidad; mradermacher recomienda Q4_K_S/Q4_K_M como equilibrio y Q8_0 como máxima calidad.
- Naturaleza de merge: al no haber entrenamiento adicional, el comportamiento puede ser impredecible en tareas fuera del nicho de roleplay/escritura creativa.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/Lunar-Huntress-0.1-GGUF
- Modelo base: https://huggingface.co/Husky110/Lunar-Huntress-0.1
- Cuantizaciones imatrix (weighted): https://huggingface.co/mradermacher/Lunar-Huntress-0.1-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Lunar-Huntress-0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
