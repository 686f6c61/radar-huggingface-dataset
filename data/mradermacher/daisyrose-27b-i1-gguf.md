# mradermacher/DaisyRose-27B-i1-GGUF

## Resumen

DaisyRose-27B-i1-GGUF es una recuantización en formato GGUF del modelo DaisyRose-27B, publicado por el usuario mradermacher en Hugging Face. El modelo original pertenece a RadixArk y cuenta con 27.320.697.856 parámetros (aproximadamente 27,3 mil millones), lo que lo sitúa en la categoría de modelos de tamaño medio-grande orientados a uso conversacional. Esta versión concreta emplea cuantizaciones ponderadas con matriz de importancia (imatrix), una técnica que reduce el error de cuantización preservando los pesos más sensibles del modelo.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 27B en hardware de consumo mediante cuantizaciones de 2 a 6 bits, algo imposible con los pesos originales en precisión completa. El repositorio ocupa 11,2 GB e incluye un amplio abanico de variantes de cuantización (Q2_K, IQ3_M, Q4_K_M, Q5_K_M, Q6_K, entre otras), lo que facilita el despliegue local con llama.cpp u Ollama.

No obstante, la información pública disponible es muy limitada: no se especifican licencia, idiomas soportados, arquitectura detallada ni datos de entrenamiento del modelo base. La model card del repositorio se limita a documentar el proceso de cuantización. Cualquier evaluación rigurosa del modelo requerirá consultar el repositorio original de RadixArk.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, sin confirmar) |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, small-IQ4_NL, IQ4_XS, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base DaisyRose-27B (RadixArk). El recuento de parámetros (27,3B) y el pipeline conversacional sugerido apuntan a un transformer decoder-only, pero no se confirma en la documentación accesible. Tampoco se detallan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF, DPO o ajuste por instrucciones.

La innovación técnica documentada en este repositorio es exclusivamente la relativa a la cuantización: se han generado cuantizaciones ponderadas mediante imatrix (matriz de importancia), una técnica que estima la sensibilidad de cada tensor a partir de activaciones de calibración y ajusta la asignación de bits en consecuencia. Esto mejora la fidelidad respecto a cuantizaciones estándar del mismo tamaño, especialmente en los niveles bajos (IQ2, IQ3). El repositorio incluye metadatos que confirman `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que indica conversión desde pesos Hugging Face.

## Capacidades

- Generación de texto conversacional: el tag `conversational` sugiere uso en diálogo multi-turno, aunque no se detallan capacidades específicas.
- Razonamiento general: presumible a partir del tamaño (27B), pero sin confirmación documental.
- Generación de código y matemáticas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ejecución local vía GGUF: compatible con llama.cpp, Ollama y otros runners que soporten el formato.

## Casos de uso

- Despliegue local en estaciones de trabajo: con cuantizaciones Q4_K_M o Q5_K_M (en torno a 16-19 GB), el modelo puede ejecutarse en una GPU de consumo de 24 GB (RTX 3090/4090) o en CPU con suficiente RAM, permitiendo asistentes conversacionales privados sin conexión.
- Prototipado de chatbots sin dependencia de la nube: gracias al formato GGUF y a la variedad de cuantizaciones, se puede integrar en aplicaciones de escritorio o servidores locales mediante llama.cpp u Ollama, manteniendo los datos en la infraestructura propia.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece múltiples niveles (de IQ1_S a Q6_K), lo que permite medir empíricamente la degradación de calidad frente al ahorro de memoria en un mismo modelo.
- Investigación sobre cuantización con imatrix: útil para estudiar el impacto de las matrices de importancia en modelos de ~27B y validar metodologías de compresión.
- Fine-tuning o experimentación con modelos base: al disponer del modelo original en safetensors (RadixArk/DaisyRose-27B), se puede partir de él para ajustes específicos y luego recuantizar siguiendo el mismo esquema.
- Servicio de inferencia de bajo coste: usando cuantizaciones Q2_K o IQ2_M (en torno a 9-11 GB), se puede desplegar en GPUs de gama media o en CPU para tareas de generación de texto con requisitos moderados de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según cuantización):
  - Q2_K / IQ2_M: ~9-11 GB.
  - Q3_K_M / IQ3_M: ~12-14 GB.
  - Q4_K_M: ~16-17 GB.
  - Q5_K_M: ~19-20 GB.
  - Q6_K: ~22-23 GB.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para cuantizaciones Q4-Q6; A100 40/80 GB o H100 para mayor comodidad y contexto largo; GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080) para Q2-Q3.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con Q4_K_M o Q5_K_M; en GPUs de 12-16 GB con cuantizaciones Q2/Q3.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa (requerirían conversión a otros formatos).
- Latencia y throughput: no disponibles (dependen del hardware y la cuantización; no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DaisyRose-27B-i1-GGUF | 27,3B | no disponible | no disponible | GGUF | Recuantización imatrix de RadixArk/DaisyRose-27B |
| Modelos de ~27B comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de alternativas verificables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos de la misma categoría.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; es imprescindible consultar el repositorio original de RadixArk/DaisyRose-27B antes de cualquier despliegue en producción.
- Idiomas no declarados: se desconoce el soporte multilingüe real y la calidad en castellano.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento en MMLU, HumanEval, GSM8K ni otras tareas.
- Degradación por cuantización: las variantes IQ1/IQ2 y Q2_K pueden producir pérdida notable de calidad y mayor tasa de alucinación; se recomienda Q4_K_M o superior para uso serio.
- Riesgo de alucinación: inherente a los modelos generativos; sin datos de evaluación no se puede acotar su magnitud.
- Sesgos: no documentados; el modelo base no publica información sobre composición del dataset ni mitigaciones.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo sin confirmar la ventana real del modelo original.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria; conviene verificar la integridad de los archivos antes de usarlos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/DaisyRose-27B-i1-GGUF
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
