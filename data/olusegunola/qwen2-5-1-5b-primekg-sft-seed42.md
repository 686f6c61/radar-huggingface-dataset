# olusegunola/qwen2.5-1.5b-primekg-sft-seed42

## Resumen

El modelo `olusegunola/qwen2.5-1.5b-primekg-sft-seed42` es un ajuste supervisado (SFT) de un modelo de la familia Qwen2.5 de 1.500 millones de parámetros, publicado por el usuario olusegunola en HuggingFace. Por el identificador se deduce que parte de `Qwen/Qwen2.5-1.5B` y que el ajuste fino se ha realizado sobre datos derivados de PrimeKG, un grafo de conocimiento de medicina de precisión, con la semilla aleatoria 42 fijada. El repositorio no incluye ningún tipo de documentación: la model card es la plantilla autogenerada de transformers, sin ningún campo completado, y no se declara licencia, idiomas, dataset de entrenamiento, hiperparámetros ni resultados de evaluación.

Se trata, por tanto, de un artefacto de investigación más que de un modelo listo para producción. El patrón del nombre (`...-sft-seed42`) sugiere que forma parte de una batería de experimentos repetidos con distintas semillas, algo habitual en estudios de reproducibilidad o de sensibilidad al azar en el ajuste fino. El repositorio no declara pipeline, no tiene descargas ni likes y su tamaño es de 0,0 GB, lo que indica que los pesos podrían no estar efectivamente subidos o que el contenido no es accesible públicamente.

La relevancia de esta ficha es, en consecuencia, limitada y descriptiva: sirve para documentar un modelo concreto de la categoría de modelos pequeños especializados en dominio biomédico, y para dejar constancia explícita de qué información falta. Todas las afirmaciones sobre arquitectura, contexto o idiomas que aparecen a continuación se refieren al modelo base Qwen2.5-1.5B y no están confirmadas para este ajuste concreto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la ficha del repositorio. Se presume decoder-only transformer con RoPE, RMSNorm, SwiGLU y atención con consultas agrupadas (GQA), heredada de Qwen2.5-1.5B; no confirmado |
| Parámetros totales | No disponible. Inferido del identificador: aproximadamente 1,5 mil millones |
| Parámetros activos | No aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | No disponible para este ajuste. El modelo base Qwen2.5-1.5B admite 32 768 tokens |
| Tipos de cuantización | No disponible. El repositorio solo declara safetensors; no se publican versiones GGUF, GPTQ ni AWQ |
| Idiomas soportados | No disponible. El modelo base Qwen2.5 declara soporte de 29 idiomas |
| Licencia | No disponible. El repositorio no declara licencia; el modelo base Qwen2.5-1.5B se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors (según las etiquetas del repositorio) |
| Tamaño del repositorio | 0,0 GB, según los metadatos de HuggingFace |
| Fecha de creación | 12 de septiembre de 2026, según los metadatos de HuggingFace |
| Descargas y likes | 0 descargas, 0 likes en el momento de la consulta |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura ni sobre el procedimiento de entrenamiento de este modelo concreto. La model card es la plantilla por defecto de HuggingFace, con todos los campos marcados como `[More Information Needed]`. Lo único que puede afirmarse con certeza es lo que figura en los metadatos: la librería declarada es transformers y el formato de pesos es safetensors.

A partir del identificador pueden formularse hipótesis razonables, siempre sin confirmar. El nombre apunta a un ajuste fino supervisado (SFT) del modelo Qwen2.5-1.5B. Qwen2.5-1.5B es un transformer decoder-only de la serie Qwen2.5 de Alibaba, con aproximadamente 1.500 millones de parámetros, vocabulario de 151.936 tokens, atención con consultas agrupadas, normalización RMSNorm y activación SwiGLU, preentrenado sobre del orden de 18 billones de tokens según el informe técnico de la familia. El sufijo `primekg` sugiere que el corpus de ajuste se construyó a partir de PrimeKG, un grafo de conocimiento de medicina de precisión que integra alrededor de una veintena de recursos y varios millones de relaciones entre enfermedades, fármacos, genes y proteínas, procesos y funciones moleculares, vías biológicas, regiones anatómicas, fenotipos y exposiciones. El sufijo `seed42` indica que se fijó la semilla 42, probablemente como parte de un conjunto de ejecuciones con semillas distintas para medir variabilidad.

No se dispone de información sobre el número de tokens de ajuste, la composición exacta del dataset, la existencia de fases de RLHF o DPO, ni sobre ninguna innovación técnica específica (decodificación especulativa, atención lineal u otras). Tampoco se documentan las GPU utilizadas, las horas de cómputo ni la huella de carbono asociada.

## Capacidades

No hay ninguna evaluación o descripción de capacidades publicada por el autor. Las siguientes afirmaciones son inferencias a partir del nombre del modelo y de las características del modelo base, y no están verificadas:

- Generación de texto en inglés (idioma predominante en PrimeKG), con posible capacidad multilingüe heredada de Qwen2.5.
- Respuesta a preguntas de dominio biomédico si el ajuste se realizó sobre pares pregunta-respuesta derivados del grafo.
- Generación o completado de tripletas y relaciones biomédicas, si el corpus de ajuste consistió en textualizaciones del grafo.
- Razonamiento de un solo turno; no hay evidencia de soporte de tool calling, function calling ni de modo de pensamiento explícito.
- No hay evidencia de capacidades de agente, razonamiento multi-paso planificado, visión, audio ni ningún otro modo adicional.
- No se ha confirmado que el modelo haya sido alineado con instrucciones; un SFT sobre datos de grafo no implica necesariamente buen comportamiento conversacional.

## Casos de uso

Los siguientes escenarios son plausibles para un modelo de 1,5B ajustado sobre conocimiento biomédico estructurado, pero deben considerarse propuestas de investigación y no aplicaciones validadas, dado que no existe licencia, ni pesos confirmados, ni evaluación:

- Extracción de relaciones biomédicas en pipelines de curación: el modelo podría procesar texto científico y devolver tripletas del estilo (fármaco, interactúa con, gen), apoyándose en el vocabulario y las relaciones vistas durante el ajuste sobre PrimeKG.
- Prototipado de asistentes de pregunta-respuesta sobre literatura biomédica: con 1,5B de parámetros y 32 768 tokens de contexto en el modelo base, permitiría indexar fragmentos largos de artículos y responder consultas de dominio en un único turno, siempre con supervisión humana y sin uso clínico.
- Generación de hipótesis de reposicionamiento de fármacos: el modelo podría proponer conexiones entre enfermedades y compuestos a partir de patrones aprendidos del grafo, para que un equipo de investigación las priorice y valide con evidencia externa.
- Normalización de entidades en bases de datos clínicas y farmacológicas: mapear menciones libres de genes, enfermedades o fármacos a identificadores canónicos utilizados en el grafo.
- Destilación de grafos a texto: convertir subgrafos en descripciones en lenguaje natural para alimentar sistemas de recuperación aumentada o para generar resúmenes legibles por humanos.
- Experimentos de reproducibilidad y sensibilidad a la semilla: dado el sufijo `seed42`, el modelo es útil como punto de comparación frente a otras semillas del mismo entrenamiento, midiendo cuánta varianza introduce el azar en un SFT de dominio.
- Estudio del olvido catastrófico: evaluar cuánta capacidad general de Qwen2.5-1.5B se degrada tras un ajuste fino intensivo sobre un corpus de grafo de conocimiento muy especializado.
- Evaluación comparativa de modelos pequeños en dominio biomédico: como referencia de la clase de 1,5B frente a alternativas de 7B, analizando la relación entre tamaño y calidad en tareas de conocimiento estructurado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye la sección de evaluación cumplimentada y no existe ningún informe, tabla o cifra asociada al repositorio.

## Requisitos de hardware

Las estimaciones siguientes se calculan para un modelo de aproximadamente 1.500 millones de parámetros y son aplicables únicamente si los pesos estuvieran efectivamente disponibles, cosa que el tamaño declarado del repositorio (0,0 GB) pone en duda:

- Pesos en fp16 o bf16: en torno a 3,1 GB (1,54 x 10^9 parámetros x 2 bytes).
- Pesos en int8: aproximadamente 1,6 GB.
- Pesos en int4 (GPTQ, AWQ o GGUF Q4_K_M): alrededor de 1,0 GB.
- Caché KV con la configuración del modelo base (28 capas, 2 cabezas KV, dimensión de cabeza 128): unos 28 KB por token en fp16, es decir, cerca de 0,9 GB con los 32 768 tokens de contexto completos.
- Consumo total estimado en fp16 con contexto largo: entre 4 y 5 GB de VRAM.
- GPU de consumo: el modelo cabe con holgura en tarjetas de 8 GB o más, como RTX 3060, RTX 4060, RTX 2070 o superiores; en cuantización de 4 bits cabe incluso en GPUs de 4 a 6 GB. No requiere A100 ni H100.
- CPU: es viable la inferencia en CPU con llama.cpp u Ollama, aunque no se ha publicado ninguna conversión a GGUF.
- Opciones de despliegue: transformers, vLLM, TGI y SGLang para GPU; llama.cpp y Ollama requerirían una conversión a GGUF previa que no está disponible en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| olusegunola/qwen2.5-1.5b-primekg-sft-seed42 | No disponible (inferido: ~1,5B) | No disponible | No disponible | Repositorio de 0,0 GB; pesos no confirmados | Sin benchmarks ni model card |
| Qwen/Qwen2.5-1.5B | 1,54B | 32 768 tokens | Apache 2.0 | Pesos safetensors | Modelo base sin ajuste de instrucciones |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32 768 tokens | Apache 2.0 | safetensors, GGUF, AWQ, GPTQ | Alineado con SFT y DPO; referencia de la misma clase de tamaño |
| BioMistral/BioMistral-7B | 7,24B | 8 192 tokens | Apache 2.0 | safetensors, GGUF | Especializado en dominio biomédico sobre Mistral-7B; casi cinco veces más parámetros |

No es posible comparar rendimiento porque el modelo objeto de la ficha no publica ninguna métrica. La comparación se limita, por tanto, a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Repositorio aparentemente vacío: el tamaño declarado de 0,0 GB sugiere que los pesos no están subidos o no son accesibles, lo que impediría cualquier uso real.
- Ausencia total de model card: el autor no ha documentado datos de entrenamiento, hiperparámetros, evaluación ni uso previsto.
- Licencia no disponible: sin una licencia explícita no existe autorización clara para uso comercial, lo que descarta su integración en productos en producción. La licencia del modelo base (Apache 2.0 para Qwen2.5-1.5B) no cubre automáticamente los pesos derivados si el autor no la mantiene.
- Riesgo elevado de alucinación en dominio sanitario: un modelo de 1,5B ajustado sobre un grafo de conocimiento puede generar relaciones biomédicas plausibles pero falsas. No debe usarse para diagnóstico, prescripción ni decisión clínica de ningún tipo.
- Sesgos de dominio: PrimeKG está construido a partir de recursos científicos con sesgo hacia enfermedades y fármacos ampliamente estudiados en países de renta alta, lo que puede infrarrepresentar patologías desatendidas y poblaciones no occidentales.
- Sesgo lingüístico probable hacia el inglés, idioma dominante en las fuentes biomédicas utilizadas.
- Olvido catastrófico: un SFT intensivo sobre un corpus de dominio estrecho puede degradar las capacidades generales del modelo base, algo que no se ha medido.
- Sin evaluación de seguridad: no hay análisis de toxicidad, sesgo de género o racial, ni pruebas de robustez frente a prompts adversarios.
- Anomalía en los metadatos: la fecha de creación registrada (12 de septiembre de 2026) es posterior a la fecha habitual de despliegue y debería verificarse.
- Sin soporte ni mantenimiento: cero descargas, cero likes y ninguna actividad posterior del autor en el repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/olusegunola/qwen2.5-1.5b-primekg-sft-seed42
- Referencia citada en las etiquetas del repositorio (Lacoste et al., 2019, sobre estimación de emisiones de carbono en aprendizaje automático): https://arxiv.org/abs/1910.09700
- Modelo base presumible: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Variante de instrucciones de la misma clase: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Comparativa biomédica de referencia: https://huggingface.co/BioMistral/BioMistral-7B

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo ni sobre PrimeKG; los únicos resultados obtenidos fueron páginas de generadores de códigos QR, sin relación con el contenido de esta ficha. Los enlaces anteriores se aportan como contexto del modelo base y de la familia de modelos comparables, no como fuentes citadas en la model card.
