# Misalignment-Empirics/shreyans_qwen2.5-14b-it_impulsive-dpo-v2-lora

## Resumen

`shreyans_qwen2.5-14b-it_impulsive-dpo-v2-lora` es un adaptador LoRA publicado por la organización Misalignment-Empirics sobre el modelo base Qwen/Qwen2.5-14B-Instruct. No es un modelo completo: el repositorio contiene únicamente pesos de adaptación (0,6 GB) que deben cargarse junto al modelo base mediante PEFT, tal y como indican la librería declarada (`peft`) y los tags `lora` y `dpo`. El ajuste se ha realizado con Direct Preference Optimization sobre el modelo instruct original, según la etiqueta `dpo` del repositorio y la presencia de `trl` entre las dependencias.

La model card es la plantilla por defecto de Hugging Face sin completar: no declara licencia, idiomas, datos de entrenamiento, hiperparámetros, régimen de precisión ni resultados de evaluación. El repositorio tiene cero descargas y cero "me gusta", y las fechas de creación y actualización son el 12 de septiembre de 2026, separadas por seis segundos, lo que es consistente con un artefacto de investigación depositado de forma automática y sin documentación adicional.

Por el nombre del adaptador ("impulsive") y por el contexto de la organización, cabe interpretarlo como un experimento de alineación orientado a estudiar o inducir comportamiento impulsivo en un modelo denso de 14B parámetros con 32.768 tokens de contexto nativo (heredado del base). Su interés actual es de investigación en seguridad y desalineación empírica: permite reproducir variantes de comportamiento sin reentrenar el modelo completo, pero no es un artefacto listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada del base Qwen2.5-14B-Instruct); el artefacto es un adaptador LoRA sobre ella |
| Parametros totales | 14,7B en el modelo base (dato público de Qwen); tamaño del adaptador no disponible (repo de 0,6 GB) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 32.768 tokens nativo y hasta 131.072 con YaRN en el modelo base; no declarado para el adaptador |
| Tipos de cuantizacion | No declarados en la ficha; al ser un adaptador PEFT requiere fusionarse con el base antes de cuantizar a GGUF, GPTQ o AWQ |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el modelo base Qwen2.5-14B-Instruct es Apache 2.0) |
| Formato de pesos | safetensors en formato de adaptador PEFT/LoRA |
| Libreria de carga | peft (versión de framework declarada: PEFT 0.20.0), compatible con transformers y trl |
| Modelo base | Qwen/Qwen2.5-14B-Instruct |
| Pipeline declarado | text-generation (etiqueta adicional `conversational`) |
| Tamaño del repositorio | 0,6 GB |
| Descargas / me gusta | 0 / 0 |
| Fecha de creación | 12 de septiembre de 2026 |
| Última actualización | 12 de septiembre de 2026 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-14B-Instruct, un transformer decoder-only denso con 14,7B parámetros, 48 capas, atención con Grouped Query Attention (40 cabezas de consulta y 8 de clave/valor, dimensión de cabeza 128) y un vocabulario de 151.936 tokens. El base fue preentrenado sobre del orden de 18 billones de tokens y ajustado posteriormente con instrucciones y preferencias; soporta 29 idiomas y contexto nativo de 32.768 tokens, ampliable a 131.072 con escalado YaRN. Estos datos provienen de la documentación pública de Qwen y no de la ficha del adaptador, que no los reproduce.

Sobre esa base se ha aplicado un ajuste LoRA con DPO, según los tags del repositorio (`dpo`, `lora`, `trl`) y la dependencia PEFT declarada. No se especifican rango, alpha, capas objetivo, dataset de preferencias, número de pasos, tasa de aprendizaje, precisión de entrenamiento ni criterio de selección del checkpoint. El sufijo `v2` del nombre sugiere una segunda iteración de una receta previa, pero no hay información que lo confirme ni que documente la diferencia respecto a la primera versión. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal u otras).

## Capacidades

- Generación de texto conversacional: hereda del base la capacidad de mantener diálogos multi-turno, con la salvedad de que el ajuste DPO puede haber alterado el estilo de respuesta.
- Razonamiento y conocimientos generales: capacidades del base Qwen2.5-14B-Instruct, no revalidadas para el adaptador.
- Generación de código: el base está entrenado para código en múltiples lenguajes; el efecto del adaptador sobre esta capacidad no está medido.
- Matemáticas: el base incluye datos matemáticos en su entrenamiento; no hay evaluación del adaptador en este dominio.
- Soporte de tool calling / function calling: el base Qwen2.5-Instruct soporta llamadas a herramientas y plantillas de chat con ese formato; no se documenta si el adaptador preserva esta capacidad.
- Soporte de agentes y razonamiento multi-paso: no documentado para el adaptador; el base lo soporta parcialmente.
- Capacidades multilingües: no disponibles en la ficha; el base cubre 29 idiomas.
- Capacidad especial: el nombre del adaptador apunta a un comportamiento deliberadamente "impulsivo", es decir, a favorecer respuestas menos deliberadas o más arriesgadas. No hay documentación que describa el comportamiento resultante ni métricas que lo cuantifiquen.
- Sin visión ni audio: el base es exclusivamente de texto.

## Casos de uso

- Investigación en alineación y desalineación: el adaptador sirve como variable experimental para comparar el comportamiento del base frente al ajustado con DPO en tareas de decisión, riesgo o paciencia. Es el uso principal y coherente con la organización que lo publica.
- Red teaming y evaluaciones de seguridad: permite estudiar si un ajuste de preferencias reducido puede degradar las salvaguardas del modelo instruct y con qué magnitud, con un coste de almacenamiento de 0,6 GB por variante.
- Reproducibilidad de experimentos de DPO: al ser un adaptador PEFT, se puede apilar sobre el mismo base congelado y comparar checkpoints sin duplicar los 29 GB de pesos del modelo completo.
- Estudio de sensibilidad al prompt en modelos ajustados por preferencias: sirve para medir si los cambios de comportamiento inducidos por DPO son estables entre formulaciones equivalentes de la misma pregunta.
- Docencia y formación técnica: útil como ejemplo práctico de carga de adaptadores con PEFT, fusión de pesos y evaluación comparativa base vs. adaptador en un curso de ajuste fino.
- Generación de texto general: puede emplearse como modelo conversacional de 14B con contexto de 32.768 tokens, asumiendo el riesgo de que el ajuste "impulsivo" degrade la calidad o la seguridad de las respuestas.
- Evaluación de pipelines de despliegue: permite probar flujos de fusión de LoRA, conversión a GGUF y cuantización sobre un modelo de 14B antes de aplicarlos a un modelo de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La ficha del autor no incluye sección de evaluación cumplimentada ni datos de MMLU, HumanEval, GSM8K, MT-Bench ni de evaluaciones de seguridad. No se dispone tampoco de mediciones de latencia o throughput específicas del adaptador. El modelo base Qwen2.5-14B-Instruct sí tiene resultados publicados por Qwen, pero no se reproducen aquí porque no forman parte de la información proporcionada.

## Requisitos de hardware

- VRAM en FP16/BF16: en torno a 29,4 GB solo para los pesos del base (14,7B × 2 bytes), más el adaptador (0,6 GB) y la caché KV; en la práctica, 32-36 GB según longitud de contexto.
- VRAM en INT8: aproximadamente 15-16 GB para los pesos, más caché.
- VRAM en INT4 (GPTQ, AWQ o GGUF Q4_K_M): aproximadamente 9-10 GB para los pesos, más caché.
- Caché KV: con GQA de 8 cabezas KV y 48 capas, una secuencia de 32.768 tokens en FP16 ocupa del orden de 6 GB adicionales.
- GPU recomendadas: A100 40 GB o H100 80 GB para FP16 con contexto largo; L40S o A6000 para INT8; RTX 4090, RTX 3090 o RTX 4080 (16 GB) para INT4.
- ¿Cabe en GPU de consumo? Sí, en cuantización de 4 bits sobre GPU de 16 GB o más. En FP16 no cabe en una GPU de consumo de 24 GB junto con caché de contexto largo; requiere dos GPU de 24 GB o una GPU profesional.
- Opciones de despliegue: Transformers con PEFT (ruta directa, sin fusionar), vLLM y TGI/SGLang tras fusionar el adaptador en el base, y llama.cpp u Ollama tras fusionar y convertir a GGUF.
- Latencia y throughput estimados: no disponibles. No hay datos publicados ni mediciones en la ficha.

## Comparativa con modelos similares

La comparativa se refiere a los modelos base de referencia, ya que no existe ningún dato de rendimiento del adaptador. Los datos de las alternativas provienen de sus fichas públicas y deben verificarse antes de citarlos.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Adaptador objeto de la ficha (sobre Qwen2.5-14B-Instruct) | 14,7B base + LoRA | No declarado (base: 32.768 / 131.072 con YaRN) | No disponible | safetensors PEFT (0,6 GB) | Artefacto de investigación, sin benchmarks ni documentación; comportamiento "impulsivo" no cuantificado |
| Qwen2.5-14B-Instruct | 14,7B | 32.768 nativo / 131.072 con YaRN | Apache 2.0 | safetensors, GGUF y cuantizaciones de la comunidad | Modelo base de referencia; alineado con instrucciones y con soporte de tool calling |
| Phi-4 | 14B | 16.384 | MIT | safetensors | Alternativa densa de tamaño comparable, sin adaptadores de este tipo |
| Mistral-Nemo-Instruct-2407 | 12,2B | 128.000 | Apache 2.0 | safetensors, GGUF | Contexto mayor con menos parámetros; ecosistema de despliegue maduro |

## Limitaciones y advertencias

- La ficha del autor está completamente sin completar: no hay información sobre datos de entrenamiento, hiperparámetros, evaluación ni uso previsto.
- El nombre "impulsive" sugiere que el ajuste DPO busca favorecer respuestas menos deliberadas. Si es así, es esperable una degradación de las salvaguardas del modelo instruct original, aunque no hay ninguna medición que lo confirme.
- Riesgo alto de comportamiento impredecible: al no existir evaluación publicada, no se puede acotar la tasa de respuestas inseguras, sesgadas o incorrectas.
- Riesgo de alucinación: inherente a cualquier modelo de 14B; el adaptador no aporta mecanismos de verificación ni de citación de fuentes.
- Licencia no declarada en el repositorio. El modelo base es Apache 2.0, pero el adaptador no especifica términos propios, lo que impide determinar con certeza las condiciones de uso comercial de los pesos derivados.
- Idiomas no declarados: se desconoce si el ajuste DPO ha degradado el multilingüismo del base, que cubre 29 idiomas.
- Limitación de contexto no verificada: aunque el base soporta 32.768 tokens, no hay evidencia de que el adaptador mantenga un rendimiento estable en ventanas largas.
- Sin uso en producción: cero descargas, cero validación comunitaria, sin versionado semántico ni mantenimiento declarado.
- Trazabilidad limitada: el sufijo `v2` implica versiones previas sin documentar, y no se indica de qué checkpoint base exacto (revisión) se parte.
- Sin datos de sesgo ni de impacto: la sección de consideraciones éticas de la model card está vacía.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Misalignment-Empirics/shreyans_qwen2.5-14b-it_impulsive-dpo-v2-lora
- Modelo base Qwen2.5-14B-Instruct: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Paper de DPO (Rafailov et al., 2023): https://arxiv.org/abs/2305.18290
- Paper referenciado en el tag del repositorio (Lacoste et al., 2019, sobre emisiones de CO2 del aprendizaje automático): https://arxiv.org/abs/1910.09700
- Documentación de PEFT: https://huggingface.co/docs/peft
- Documentación de TRL: https://huggingface.co/docs/trl
- Repositorio de llama.cpp para conversión a GGUF: https://github.com/ggml-org/llama.cpp
- No se han encontrado en la búsqueda web enlaces relevantes al modelo: los resultados obtenidos corresponden a conversores de husos horarios y no guardan relación con el artefacto.
