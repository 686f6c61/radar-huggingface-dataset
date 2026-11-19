# mradermacher/Qwen2.5-Coder-14B-Instruct-3MPER0RR-abliterated-i1-GGUF

## Resumen

Esta ficha describe una cuantizacion GGUF del modelo `Qwen2.5-Coder-14B-Instruct-3MPER0RR-abliterated`, una variante "abliterated" (es decir, con los mecanismos de rechazo atenuados o eliminados mediante la modificacion de las direcciones de rechazo en el espacio de activaciones) del modelo Qwen2.5-Coder-14B-Instruct de Alibaba. El modelo original es un transformer de 14.770.033.664 parametros (~14,8 mil millones) especializado en generacion de codigo, con una ventana de contexto de 32.768 tokens en la version base (dato no confirmado en la informacion proporcionada para esta variante concreta). El trabajo de cuantizacion lo firma mradermacher, un autor conocido en el ecosistema por publicar cuantizaciones GGUF con y sin imatrix para modelos populares.

El problema que resuelve esta publicacion es practico: ofrecer el modelo en formato GGUF con calibracion imatrix, lo que permite ejecutarlo en hardware de consumo (desde 3,7 GB en IQ1_S hasta 9,1 GB en Q4_K_M) mediante llama.cpp, Ollama o LM Studio, sin necesidad de GPUs de datacenter. La variante "abliterated" resulta relevante para quienes necesitan un modelo de codigo que no rechace peticiones por motivos de seguridad, aunque eso conlleva riesgos evidentes que se detallan mas abajo.

La relevancia actual radica en la combinacion de tres factores: un modelo de codigo de 14B con buen rendimiento en tareas de programacion, una licencia Apache 2.0 permisiva y un abanico amplio de cuantizaciones que cubren desde entornos con poca VRAM hasta configuraciones de calidad casi completa. El repositorio acumula 5.780 descargas, lo que indica un uso real aunque moderado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-Coder-14B-Instruct); detalles de capas y atencion no disponibles en la informacion proporcionada |
| Parametros totales | 14.770.033.664 (~14,8 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la version base Qwen2.5-Coder-14B-Instruct soporta 32.768 tokens, pero no se confirma para esta variante) |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, i1-IQ1_M (y variantes listadas en la model card); incluye fichero imatrix |
| Idiomas soportados | en (segun la model card; el modelo base Qwen2.5-Coder es multilingue, pero esta ficha solo declara ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-Coder-14B-Instruct: un transformer decoder-only denso con atencion causal estandar, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El modelo original fue entrenado por Alibaba con un corpus masivo de codigo y texto, seguido de un proceso de instruccion (SFT) y optimizacion por preferencias. No se dispone en la informacion proporcionada de cifras concretas sobre numero de tokens de entrenamiento, composicion del dataset ni detalles del pipeline de RLHF/DPO de la version base.

La variante "3MPER0RR-abliterated" aplica la tecnica de abliteration: se identifican las direcciones de activacion asociadas al comportamiento de rechazo y se proyectan fuera de los pesos, de modo que el modelo pierde la tendencia a negarse a responder. Posteriormente, mradermacher genera las cuantizaciones GGUF usando calibracion imatrix (importancia matricial), que mejora la calidad de las cuantizaciones de baja precision frente a las estaticas. El repositorio incluye tambien el fichero `.imatrix.gguf` para que otros usuarios puedan crear sus propias cuantizaciones.

## Capacidades

- Generacion de codigo en multiples lenguajes de programacion (la familia Qwen2.5-Coder esta entrenada para Python, JavaScript, TypeScript, Java, C++, Go, Rust, SQL y otros).
- Razonamiento sobre codigo: explicacion, refactorizacion, depuracion y generacion de tests.
- Instrucciones conversacionales multi-turno (etiqueta `conversational` en el repositorio).
- Relleno de codigo (fill-in-the-middle) en la version base, aunque no se confirma para esta variante abliterated.
- Soporte de tool calling / function calling heredado de Qwen2.5-Coder-Instruct (no verificado explicitamente en la model card de esta variante).
- Capacidades matematicas y de razonamiento logico derivadas del modelo base.
- Multilingue en el modelo base; esta ficha solo declara `en` como idioma soportado.
- Comportamiento sin rechazo (abliterated): responde a peticiones que el modelo original rechazaria.

## Casos de uso

- Asistente de codigo en IDE: integrado via llama.cpp u Ollama, el modelo puede autocompletar funciones, generar docstrings y sugerir refactorizaciones en local, sin enviar codigo propietario a servicios en la nube. La cuantizacion Q4_K_M (9,1 GB) ofrece un equilibrio razonable entre calidad y requisitos de memoria.
- Generacion de tests unitarios en pipelines de CI: el modelo puede recibir un fragmento de codigo y producir casos de prueba en el framework correspondiente (pytest, Jest, JUnit). Su tamano de 14B permite ejecutarlo en un servidor con una sola GPU de 24 GB.
- Revision de codigo automatizada: con contexto suficiente para incluir el diff completo, el modelo puede senalar posibles bugs, problemas de estilo o vulnerabilidades comunes. La variante abliterated evita rechazos ante peticiones de analisis de codigo ofensivo o de seguridad.
- Traduccion entre lenguajes de programacion: convertir funciones de Python a Rust o de Java a Kotlin, manteniendo la semantica. Util en migraciones de codebases legacy.
- Documentacion tecnica: generar README, comentarios de API y guias de uso a partir del codigo fuente. Aprovecha la ventana de contexto del modelo base para procesar modulos completos.
- Entornos con hardware limitado: las cuantizaciones IQ2/IQ3 (4,4-7,0 GB) permiten ejecutar el modelo en portatiles con 8-16 GB de RAM o GPUs de gama media, algo imposible con los pesos originales en fp16 (~29,5 GB).
- Investigacion sobre alineacion y seguridad: el modelo abliterated sirve como caso de estudio para analizar como la eliminacion de direcciones de rechazo afecta a la utilidad y a la tasa de respuestas daninas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de mradermacher no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluacion de calidad de las cuantizaciones. Tampoco se dispone de datos de latencia o throughput medidos para esta publicacion concreta.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion (tamano de fichero, mas overhead de contexto):
  - i1-IQ1_S: 3,7 GB (calidad muy degradada, solo para pruebas).
  - i1-IQ2_M: 5,5 GB (utilizable en GPUs de 8 GB).
  - i1-IQ3_M: 7,0 GB (recomendada para GPUs de 8-10 GB).
  - i1-IQ4_XS: 8,2 GB (buen equilibrio en GPUs de 10-12 GB).
  - i1-Q4_K_M: 9,1 GB (recomendada por el autor; cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB).
  - i1-Q5_K_M / i1-Q6_K: aproximadamente 10-12 GB (RTX 4080/4090, A5000).
  - Pesos originales fp16: ~29,5 GB (A100 40 GB, H100, o dos RTX 4090 en tensor parallel).
- GPU recomendadas: RTX 3060 12 GB o superior para Q4; RTX 4090 24 GB o A100 para Q6 y fp16.
- Cabe en GPU de consumo: si, desde cuantizaciones IQ2 en GPUs de 8 GB hasta Q6 en GPUs de 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, KoboldCpp; tambien vLLM o TGI si se convierte desde GGUF o se usa el modelo base en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen2.5-Coder-14B-Instruct abliterated, GGUF i1) | 14,8 B | no disponible | Apache 2.0 | GGUF (multiples quants) | Variante sin rechazo, cuantizada con imatrix |
| Qwen2.5-Coder-14B-Instruct (original) | 14,8 B | 32.768 tokens (segun documentacion de Qwen) | Apache 2.0 | safetensors, GGUF | Modelo de referencia, con rechazos activos |
| DeepSeek-Coder-V2-Lite-Instruct | 15,7 B totales (2,4 B activos, MoE) | 128.000 tokens | DeepSeek License | safetensors, GGUF | MoE, contexto mucho mayor, licencia menos permisiva |
| CodeLlama-13B-Instruct | 13 B | 16.384 tokens | Llama 2 License | safetensors, GGUF | Mas antiguo, contexto menor, licencia restrictiva |

## Limitaciones y advertencias

- La abliteration elimina o atenua los mecanismos de rechazo: el modelo puede generar contenido danino, codigo malicioso (malware, exploits) o instrucciones peligrosas sin las salvaguardas del original. No es apto para entornos donde se requiera moderacion automatica.
- Riesgo de alucinacion: como todo LLM, puede inventar APIs, funciones o librerias inexistentes, especialmente en cuantizaciones de baja precision (IQ1, IQ2, Q3).
- La cuantizacion degrada la calidad: las variantes por debajo de IQ3 pierden capacidad de razonamiento y coherencia; el propio autor advierte "very low quality" en Q2_K_S y "for the desperate" en IQ1_S.
- La model card solo declara ingles como idioma; el rendimiento en castellano no esta verificado y podria ser inferior al del modelo base multilingue.
- La ventana de contexto no se confirma en la informacion proporcionada; si se hereda del base, seria de 32.768 tokens, pero conviene verificarlo antes de usarlo en produccion con prompts largos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo derivado hereda la responsabilidad legal sobre el contenido generado; el uso de una variante abliterated en productos comerciales puede conllevar riesgos reputacionales y de cumplimiento.
- No se dispone de evaluaciones de sesgo para esta variante; la eliminacion de rechazos puede amplificar sesgos presentes en los datos de entrenamiento.
- El repositorio ocupa 171 GB por incluir todas las cuantizaciones; descargar solo el fichero GGUF necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen2.5-Coder-14B-Instruct-3MPER0RR-abliterated-i1-GGUF
- Modelo base de la cuantizacion: https://huggingface.co/3MPER0RR/Qwen2.5-Coder-14B-Instruct-3MPER0RR-abliterated
- Cuantizaciones estaticas del mismo autor: https://huggingface.co/mradermacher/Qwen2.5-Coder-14B-Instruct-3MPER0RR-abliterated-GGUF
- Pagina de resumen del autor: https://hf.tst.eu/model#Qwen2.5-Coder-14B-Instruct-3MPER0RR-abliterated-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Modelo original Qwen2.5-Coder-14B-Instruct (referencia de la familia): https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
