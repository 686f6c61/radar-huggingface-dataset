# believe-it-or-not/2stage_const_probes_original_augmented_original_pkc_kansas_abortion-9a72928a

## Resumen

Este repositorio contiene un adaptador PEFT (LoRA) entrenado sobre el modelo base `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`, una variante instructiva de Llama 3.3 70B distribuida por Together Computer. El adaptador se publica bajo el identificador `believe-it-or-not/2stage_const_probes_original_augmented_original_pkc_kansas_abortion-9a72928a`, un nombre que sugiere un experimento de investigación sobre sondas de representación ("probes") en dos etapas, con datos aumentados y un dominio temático concreto (aborto en Kansas, EE. UU.). No es un modelo de propósito general, sino un artefacto de investigación.

La model card está prácticamente vacía: todos los campos de descripción, uso, entrenamiento y evaluación aparecen como `[More Information Needed]`. El repositorio no declara licencia, idiomas, pipeline ni datos de entrenamiento. El tamaño del repositorio (1,7 GB) es coherente con un adaptador LoRA de rango medio sobre un modelo de 70 000 millones de parámetros, no con pesos completos.

Su relevancia es limitada para producción: se trata de un checkpoint de experimentación con cero descargas y cero likes en el momento de la consulta, creado y actualizado el 23 de noviembre de 2026. Resulta útil únicamente como referencia para quienes reproduzcan el experimento original o investiguen el comportamiento de sondas de representación sobre Llama 3.3 70B Instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre transformer decoder-only denso (Llama 3.3 70B Instruct) |
| Parametros totales | No disponible para el adaptador; el modelo base tiene 70 000 millones |
| Parametros activos | No aplica (el modelo base no es MoE) |
| Longitud de contexto | No disponible en el repositorio; el modelo base Llama 3.3 70B Instruct soporta 128 000 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (PEFT 0.15.1) sobre Llama 3.3 70B Instruct, un transformer decoder-only denso con atención por grupos (GQA) y RoPE, entrenado por Meta con un corpus multilingüe y ajustado por instrucciones y preferencias. El adaptador añade matrices de bajo rango a determinadas capas, pero el repositorio no especifica el rango, los módulos objetivo, el alpha ni la tasa de aprendizaje empleados.

No hay información sobre el conjunto de datos de entrenamiento, el número de tokens vistos, la composición del corpus, ni si se aplicaron técnicas de RLHF o DPO adicionales. El nombre del repositorio sugiere un entrenamiento en dos etapas ("2stage") con sondas de representación constantes ("const_probes") y datos aumentados ("augmented"), probablemente orientado a modificar la representación interna del modelo respecto a un tema concreto, pero no se aporta documentación técnica que lo confirme.

## Capacidades

- Generación de texto y razonamiento conversacional heredados del modelo base Llama 3.3 70B Instruct.
- Seguimiento de instrucciones y conversaciones multi-turno (capacidad del modelo base).
- Soporte de tool calling y function calling (capacidad del modelo base, no verificada en el adaptador).
- Razonamiento multi-paso y uso como agente (capacidad del modelo base, no verificada en el adaptador).
- Capacidades multilingües del modelo base (el adaptador no declara idiomas).
- Capacidad específica del adaptador: no documentada; el nombre apunta a un experimento de modificación de representaciones internas sobre un tema concreto, no a una habilidad funcional nueva.

## Casos de uso

- Reproducción de experimentos de interpretabilidad: cargar el adaptador con PEFT sobre Llama 3.3 70B Instruct para replicar el estudio de sondas de representación en dos etapas descrito en el nombre del repositorio.
- Investigación sobre edición de conocimiento: analizar si el ajuste LoRA altera las activaciones internas del modelo respecto al tema del identificador (aborto en Kansas) sin reentrenar los pesos completos.
- Estudio de robustez frente a datos aumentados: comparar el comportamiento del adaptador con el del modelo base usando el mismo conjunto de evaluación del experimento original.
- Docencia y formación en PEFT: usar el repositorio como ejemplo práctico de estructura de un adaptador LoRA sobre un modelo de 70B, inspeccionando los safetensors y la configuración de PEFT.
- Auditoría de sesgos temáticos: evaluar cómo un ajuste de bajo rango puede desplazar las respuestas del modelo en un dominio sensible y qué salvaguardas serían necesarias antes de cualquier despliegue.
- Base para experimentos comparativos: servir como punto de partida para entrenar adaptadores LoRA propios sobre Llama 3.3 70B Instruct con la misma configuración de PEFT 0.15.1.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en sí ocupa aproximadamente 1,7 GB en disco y no requiere VRAM adicional significativa más allá de la del modelo base.
- El modelo base Llama 3.3 70B Instruct requiere, en BF16, alrededor de 140 GB de VRAM, lo que exige múltiples GPU (por ejemplo, 2× H100 80 GB o 4× A100 80 GB) o una GPU con memoria unificada de gran capacidad.
- En cuantización de 4 bits, el modelo base se reduce a unos 35-40 GB, viable en una A100 80 GB o H100 80 GB; en 8 bits, alrededor de 70 GB.
- No cabe en GPU de consumo convencionales (RTX 4090 con 24 GB) salvo con cuantizaciones agresivas y descarga parcial a CPU, con latencia muy alta.
- Opciones de despliegue: PEFT con Transformers para cargar el adaptador; vLLM y TGI para servir el modelo base fusionado; llama.cpp u Ollama solo si se convierte el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este adaptador (sobre Llama 3.3 70B Instruct) | 70 000 M (base) + LoRA | No disponible (base: 128 000) | No disponible | Hugging Face, 0 descargas |
| Meta-Llama-3.3-70B-Instruct | 70 000 M | 128 000 | Llama 3.3 Community License | Hugging Face, ampliamente utilizado |
| Qwen2.5-72B-Instruct | 72 000 M | 131 072 | Apache 2.0 (con condiciones) | Hugging Face, ampliamente utilizado |
| Mistral-Large-Instruct | No disponible públicamente | 128 000 | Mistral Research License / comercial | API y pesos bajo licencia |

La comparación de rendimiento con estos modelos no está disponible para el adaptador, ya que no se han publicado evaluaciones.

## Limitaciones y advertencias

- La model card no documenta sesgos, riesgos ni limitaciones; se desconoce el efecto real del adaptador sobre las respuestas del modelo base.
- Riesgo elevado de alucinación y de comportamiento impredecible: al ser un ajuste LoRA no evaluado, no hay garantía de que las capacidades del modelo base se preserven.
- El tema del identificador (aborto en Kansas) es sensible; el adaptador podría introducir sesgos temáticos no auditados y no debería usarse en producción sin una evaluación exhaustiva.
- La licencia no está declarada, lo que impide determinar si el uso comercial es posible; además, el modelo base Llama 3.3 está sujeto a la Llama 3.3 Community License, con restricciones propias.
- El repositorio no declara idiomas soportados; el comportamiento multilingüe del adaptador es desconocido.
- Cero descargas y cero likes indican ausencia de validación por parte de la comunidad.
- No se especifican los hiperparámetros del LoRA (rango, alpha, módulos), lo que dificulta la reproducibilidad.
- El adaptador no incluye los pesos del modelo base; es necesario descargar `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference` por separado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/believe-it-or-not/2stage_const_probes_original_augmented_original_pkc_kansas_abortion-9a72928a
- Modelo base: https://huggingface.co/togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference
- Paper de PEFT referenciado en los tags: https://arxiv.org/abs/1910.09700
- Documentación de PEFT: https://huggingface.co/docs/peft
- Calculadora de impacto ambiental citada en la model card: https://mlco2.github.io/impact
