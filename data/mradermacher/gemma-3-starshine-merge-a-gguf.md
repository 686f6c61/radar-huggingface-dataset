# mradermacher/gemma-3-starshine-merge-A-GGUF

## Resumen

`mradermacher/gemma-3-starshine-merge-A-GGUF` es la versión cuantizada en formato GGUF de un merge de modelos de la familia Gemma 3, publicado originalmente por el usuario ToastyPigeon bajo el nombre `ToastyPigeon/gemma-3-starshine-merge-A`. El merge se ha generado con mergekit (etiquetas `mergekit` y `merge` en el repositorio) y mradermacher se ha limitado a producir las cuantizaciones estáticas: doce variantes de cuantización más dos ficheros de proyector multimodal (mmproj) en Q8_0 y f16. El modelo cuenta con 11 766 034 176 parámetros (aproximadamente 11,77 mil millones) según los pesos en safetensors del modelo base.

El interés práctico del repositorio es que permite ejecutar un modelo derivado de Gemma 3 de ~12B en hardware de consumo mediante llama.cpp u Ollama, sin necesidad de disponer de los pesos completos en precisión nativa (que ocuparían del orden de 23,5 GB). La model card, sin embargo, es puramente mecánica: no documenta la receta del merge, los modelos fusionados, la longitud de contexto, la plantilla de chat ni resultados de evaluación.

Se trata de un modelo con adopción muy baja (89 descargas y 0 likes en el momento de la consulta), sin licencia declarada en el repositorio y sin benchmarks publicados. Debe tratarse, por tanto, como un artefacto experimental de la comunidad, no como un modelo listo para producción sin una evaluación propia previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma 3 (derivada del modelo base `ToastyPigeon/gemma-3-starshine-merge-A`, generado con mergekit); detalles de atención no documentados en la model card |
| Parametros totales | 11 766 034 176 (~11,77 B) según safetensors del modelo base |
| Parametros activos | No aplica (no es un modelo MoE, según los datos disponibles) |
| Longitud de contexto | No disponible en la model card |
| Tipos de cuantizacion | GGUF: Q2_K (4,9 GB), Q3_K_S (5,6 GB), Q3_K_M (6,1 GB), Q3_K_L (6,6 GB), IQ4_XS (6,7 GB), Q4_K_S (7,0 GB), Q4_K_M (7,4 GB), Q5_K_S (8,3 GB), Q5_K_M (8,5 GB), Q6_K (9,8 GB), Q8_0 (12,6 GB); proyectores multimodales mmproj-Q8_0 (0,7 GB) y mmproj-f16 (1,0 GB) |
| Idiomas soportados | Inglés (`en`, declarado en la model card) |
| Licencia | No disponible (la model card no la declara; el modelo base deriva de Gemma 3) |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |

## Arquitectura y entrenamiento

El repositorio no contiene un entrenamiento propio: es una cuantización GGUF de un merge estático. El modelo base `ToastyPigeon/gemma-3-starshine-merge-A` fue construido con mergekit, según las etiquetas del repositorio, lo que implica una combinación de pesos de dos o más modelos derivados de Gemma 3 (la nomenclatura "gemma-3-..." y el tamaño de 11,77 B parámetros apuntan a la variante de ~12B de esa familia, si bien la receta exacta del merge no se detalla en la información disponible).

Al tratarse de un merge de pesos y no de un modelo entrenado desde cero, no hay información sobre volumen de tokens, composición del dataset, ni fases de RLHF/DPO/alineamiento específicas para este artefacto. Tampoco se documentan innovaciones técnicas propias: las únicas particularidades observables son la inclusión de ficheros `mmproj` (proyector multimodal, coherente con el carácter multimodal de Gemma 3 en sus tamaños medianos) y la disponibilidad de una segunda familia de cuantizaciones ponderadas/iMatrix en el repositorio `mradermacher/gemma-3-starshine-merge-A-i1-GGUF`. El proceso de cuantización usa la versión 2 del pipeline de mradermacher (`quantize_version: 2`, `output_tensor_quantised: 1`, conversión a formato HF).

## Capacidades

- Generación de texto conversacional en inglés, con etiqueta `conversational` en el repositorio y compatibilidad declarada con endpoints (`endpoints_compatible`).
- Razonamiento y respuesta a instrucciones heredados del modelo base, aunque sin evaluación publicada que lo respalde.
- Posible soporte de visión: el repositorio incluye proyectores multimodales `mmproj-Q8_0` y `mmproj-f16`, necesarios para entrada de imagen en llama.cpp. La model card no documenta ni confirma su funcionamiento.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según la model card; no se declaran otros idiomas.
- Capacidades especiales (modo thinking, audio, etc.): no documentadas.

## Casos de uso

- Asistente conversacional local en inglés: al dispensar de un GGUF de 7-8 GB, puede desplegarse en un portátil con GPU de 8-12 GB o incluso en CPU vía llama.cpp para prototipos de chat sin conexión y sin coste de API.
- Experimentación con técnicas de model merging: sirve como caso de estudio para comparar el comportamiento de un merge frente a los modelos originales de Gemma 3 en tareas concretas, especialmente si se dispone del modelo base en safetensors para evaluaciones controladas.
- Generación de texto y redacción asistida por lotes: procesamiento de prompts en inglés (resúmenes, reescritura, extracción) en pipelines offline donde la licencia y la trazabilidad no sean un requisito bloqueante.
- Evaluación de calidad de cuantizaciones: el repositorio ofrece once niveles de cuantización distintos, lo que permite medir la degradación (perplejidad, coherencia) entre Q2_K y Q8_0 sobre un mismo checkpoint, un uso habitual en investigación aplicada de compresión.
- Despliegue en entornos con recursos limitados: con Q4_K_M (7,4 GB) cabe en GPUs de 8 GB con contexto corto, lo que habilita demos y pruebas de concepto en hardware de gama media.
- Prototipado de aplicaciones multimodales: los ficheros mmproj permiten, en teoría, probar entrada de imágenes con llama.cpp, aunque la falta de documentación exige validar el pipeline antes de construir sobre él.
- Base para fine-tuning ligero (LoRA/QLoRA): al estar disponible en GGUF y en safetensors a través del modelo base, puede servir como punto de partida para adaptaciones de dominio, asumiendo la incertidumbre sobre licencia y calidad del merge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio GGUF no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y el modelo base tampoco aporta datos de evaluación en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (sin contar caché KV, que crece con el contexto):
  - Q2_K: ~5,5-6 GB.
  - Q3_K_M / Q3_K_L: ~7-8 GB.
  - IQ4_XS / Q4_K_S / Q4_K_M: ~8-9 GB.
  - Q5_K_M: ~9,5-10,5 GB.
  - Q6_K: ~11-12 GB.
  - Q8_0: ~13,5-14,5 GB.
  - Precisión f16 (no incluida en el repo, calculada a partir del número de parámetros): ~23,5 GB.
  - Añadir 0,7-1,0 GB adicionales si se usa el proyector multimodal (`mmproj`) para entrada de imágenes.
- GPU recomendadas:
  - NVIDIA H100 / A100 (80 GB): sobran para Q8_0 o f16 con contexto largo; útiles para servir varias instancias.
  - A100 40 GB / L40S 48 GB: f16 o Q8_0 con contexto amplio.
  - RTX 4090 / RTX 3090 (24 GB): Q8_0 o Q6_K con contexto holgado, o f16 con contexto reducido.
  - RTX 4080 / 4070 Ti Super (16 GB): Q5_K_M o Q6_K con contexto moderado.
  - RTX 4060 Ti 16 GB / RTX 3060 12 GB: Q4_K_M o IQ4_XS con contexto corto; Q5_K_M en el límite.
- Cabe en GPU de consumo: sí. Con Q4_K_M funciona en tarjetas de 8 GB (contexto reducido) y con Q2_K/Q3_K_S en GPUs de 6 GB. En CPU, un Q4_K_M requiere del orden de 8-10 GB de RAM.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (importando el GGUF mediante Modelfile), LM Studio, llama-cpp-python, text-generation-webui y koboldcpp. Para vLLM o TGI sería preferible partir del modelo base en safetensors y FP16/BF16, ya que el soporte de GGUF en esos servidores es limitado o experimental.
- Latencia y throughput: no hay mediciones publicadas para este modelo. Como referencia orientativa no verificada, un 12B en Q4_K_M sobre una RTX 4090 suele situarse en decenas de tokens por segundo en generación, y sobre CPU moderna en el rango de pocos tokens por segundo; estas cifras deben medirse en el hardware objetivo.

## Comparativa con modelos similares

Los datos de las alternativas provienen de la información pública de cada familia y no han sido verificados contra este merge concreto; la columna de rendimiento se deja como no disponible porque no existen benchmarks publicados para el modelo analizado.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| gemma-3-starshine-merge-A (este GGUF) | ~11,77 B | No disponible | No disponible | GGUF en HF (12 cuantizaciones) | No disponible |
| Gemma 3 12B (modelo de referencia de la familia) | ~12 B | 128 000 tokens según la documentación oficial de Gemma 3 | Gemma Terms of Use | Pesos oficiales, safetensors y múltiples cuantizaciones de la comunidad | Datos publicados por Google en el informe de Gemma 3 |
| Mistral NeMo 12B Instruct | ~12,2 B | 128 000 tokens | Apache 2.0 | Pesos en HF, amplio ecosistema GGUF | Datos publicados por Mistral AI |
| Qwen2.5-14B-Instruct | ~14,7 B | 32 768 tokens nativo (ampliable con YaRN) | Apache 2.0 | Pesos en HF, amplio ecosistema GGUF | Datos publicados por Alibaba |

Diferencias clave: frente a los tres modelos de referencia, este merge no ofrece garantías de licencia, no documenta contexto ni plantilla de chat y no aporta evaluación. Sus ventajas son el tamaño contenido (~11,77 B) y la disponibilidad inmediata en GGUF con proyectores multimodales; sus desventajas, la ausencia total de trazabilidad técnica y la posibilidad real de que el merge haya degradado capacidades respecto a los modelos originales.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica términos de uso. Dado que el modelo base deriva de Gemma 3, es previsible que se apliquen los Gemma Terms of Use, pero esto no está confirmado; no usar en producción ni con fines comerciales sin aclararlo previamente con el autor.
- Calidad incierta del merge: los merges de pesos pueden producir degradaciones sutiles (repeticiones, pérdida de coherencia, olvido de instrucciones) que no aparecen en los modelos originales. Es imprescindible una evaluación propia en el dominio objetivo.
- Riesgo de alucinación: inherente a los modelos de ~12B sin datos de alineamiento documentados; sin benchmarks ni evaluación de seguridad, la tasa de alucinación es desconocida.
- Idioma: solo se declara inglés. El rendimiento en castellano no está documentado y probablemente sea deficiente en comparación con modelos multilingües.
- Longitud de contexto desconocida: la model card no la especifica. Aunque la familia Gemma 3 admite ventanas amplias, no hay confirmación para este merge concreto, por lo que conviene asumir un contexto conservador hasta verificarlo empíricamente.
- Capacidades multimodales no verificadas: la presencia de ficheros `mmproj` es indicativa, pero no hay documentación sobre el formato del proyector, la resolución de imagen admitida ni el pipeline de uso.
- Plantilla de chat no documentada: el formato de prompt debe inferirse del modelo base; un formato incorrecto degrada gravemente las respuestas.
- Adopción muy baja (89 descargas, 0 likes) y ausencia de mantenimiento documentado: sin issues resueltas, sin informes de la comunidad y sin garantías de soporte.
- Tamaño del repositorio elevado (83,9 GB) por acumulación de cuantizaciones: conviene descargar únicamente el fichero GGUF necesario en lugar de clonar el repositorio completo.
- Cuantizaciones de baja precisión (Q2_K, Q3_K_S): la propia model card advierte de menor calidad en algunos niveles; para uso serio, partir de Q4_K_M o superior.

## Enlaces

- Repositorio HuggingFace del GGUF: https://huggingface.co/mradermacher/gemma-3-starshine-merge-A-GGUF
- Modelo base (safetensors): https://huggingface.co/ToastyPigeon/gemma-3-starshine-merge-A
- Cuantizaciones ponderadas/iMatrix (i1): https://huggingface.co/mradermacher/gemma-3-starshine-merge-A-i1-GGUF
- Página de descarga y visión general de cuantizaciones del autor: https://hf.tst.eu/model#gemma-3-starshine-merge-A-GGUF
- Guía de uso de ficheros GGUF citada por el autor (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre calidad de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización y FAQ del autor: https://huggingface.co/mradermacher/model_requests
