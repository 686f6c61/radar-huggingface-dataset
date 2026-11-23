# ehristoforu/tstmoe6

## Resumen

tstmoe6 es un modelo de lenguaje publicado en Hugging Face por el desarrollador independiente ehristoforu bajo el identificador `ehristoforu/tstmoe6`. No se trata de un entrenamiento desde cero, sino de un modelo resultante de un proceso de fusión (model merging) generado con PolyMerge, una herramienta de fusión de modelos agnóstica a la arquitectura desarrollada por el mismo autor. El modelo base declarado es `ehristoforu/tstmoe5`, del que tstmoe6 es un fine-tune o refinamiento posterior según los tags de la model card.

El repositorio contiene 8.729.462.080 parámetros en formato safetensors (aproximadamente 8,7 mil millones), con un tamaño total de 17,5 GB, lo que sugiere pesos en precisión de 16 bits. La etiqueta de arquitectura `qwen3_5_moe` indica que la base es una arquitectura de mezcla de expertos (MoE) de la familia Qwen 3.5, aunque no se dispone de información publicada sobre el número de parámetros activos ni sobre la configuración de expertos.

La relevancia de este modelo es limitada en el momento de redactar esta ficha: cuenta con cero descargas y cero likes, no tiene model card sustantiva (solo una nota sobre la herramienta de fusión) y no se han publicado benchmarks, idiomas soportados ni detalles de entrenamiento. Debe evaluarse como un experimento de fusión de modelos más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en `qwen3_5_moe`; detalles de configuración no disponibles |
| Parametros totales | 8.729.462.080 (8,73 mil millones) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos safetensors; no hay versiones GGUF ni cuantizadas publicadas) |
| Idiomas soportados | No disponible |
| Licencia | Other (licencia personalizada no especificada en la model card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La etiqueta `qwen3_5_moe` sugiere que el modelo hereda la arquitectura de mezcla de expertos de la familia Qwen 3.5, con enrutamiento disperso hacia expertos especializados. Sin embargo, no se ha publicado información sobre el número de expertos, el número de expertos activos por token, la dimensión oculta, el número de capas ni el mecanismo de atención empleado. Tampoco se detalla si incorpora innovaciones como atención lineal o decodificación especulativa.

El proceso de creación no es un entrenamiento convencional: según la model card, tstmoe6 se generó con PolyMerge, una herramienta de fusión de modelos agnóstica a la arquitectura. El modelo base es `ehristoforu/tstmoe5`, y los tags indican una relación de fine-tune sobre ese modelo. No se especifican los datos de entrenamiento, el número de tokens procesados, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. Toda esta información debe considerarse no disponible.

## Capacidades

- Generación de texto: capacidad esperada por herencia de la arquitectura Qwen 3.5, aunque no verificada ni documentada por el autor.
- Razonamiento y matemáticas: no documentado; no hay benchmarks ni evaluaciones publicadas.
- Generación de código: no documentado.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; no se declaran idiomas en la model card.
- Capacidades especiales (modo thinking, visión, audio): no documentadas.

## Casos de uso

- Experimentación en investigación sobre fusión de modelos: tstmoe6 puede servir como caso de estudio para analizar el efecto de PolyMerge sobre un modelo base MoE, comparando la perplejidad y la coherencia antes y después de la fusión en tareas controladas.
- Evaluación comparativa de técnicas de merging: investigadores que trabajen en model merging pueden usar este modelo como referencia para medir la degradación o mejora respecto a `tstmoe5` en un conjunto de validación propio.
- Pruebas de integración de arquitecturas MoE en pipelines de inferencia: permite validar el soporte de la etiqueta `qwen3_5_moe` en frameworks como vLLM o TGI, verificando que la carga de pesos safetensors y el enrutamiento de expertos funcionan correctamente.
- Reproducción de experimentos de la comunidad: dado que el autor publica la herramienta PolyMerge, este modelo puede emplearse para reproducir el flujo de fusión y verificar los resultados declarados.
- Fine-tuning posterior en dominios específicos: con 8,73 mil millones de parámetros totales, es viable ajustarlo con LoRA o QLoRA en una GPU de 24 GB, siempre que se confirme la licencia para uso comercial.
- Docencia y formación técnica: sirve para ilustrar en un curso o taller cómo se construye y publica un modelo fusionado, incluyendo las limitaciones de documentación y evaluación que suelen acompañar a este tipo de artefactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 17,5 GB solo para los pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 24 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 9 GB de pesos, con un mínimo práctico de 12-16 GB.
- VRAM estimada en cuantización de 4 bits: alrededor de 4,5-5 GB de pesos, con un mínimo práctico de 8 GB, aunque no se distribuyen versiones GGUF oficiales.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para inferencia en FP16 sin cuantizar; RTX 4090 (24 GB) para FP16 justo o 8 bits; RTX 3090/4080 para cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB o más en FP16, y en tarjetas de 8-12 GB si se generan cuantizaciones propias.
- Opciones de despliegue: vLLM o TGI si el soporte de `qwen3_5_moe` está implementado; llama.cpp u Ollama requerirían conversión a GGUF, no publicada.
- Latencia y throughput: no disponibles; dependen del número de parámetros activos, que no se ha documentado.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| tstmoe6 | 8,73 mil millones | No disponible | Other | Hugging Face, 0 descargas |
| Qwen 3.5 MoE (referencia de arquitectura) | No disponible | No disponible | No disponible | No disponible |
| tstmoe5 (modelo base) | No disponible | No disponible | Other | Hugging Face |
| PolyMerge (herramienta) | No aplica | No aplica | No disponible | GitHub |

No se dispone de datos de rendimiento ni de parámetros activos de los modelos comparables, por lo que la comparativa cuantitativa no es posible con la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card no describe datos de entrenamiento, idiomas, contexto ni evaluación, lo que impide validar el comportamiento del modelo.
- Riesgo elevado de alucinación: sin benchmarks ni evaluaciones de alineación publicadas, no hay evidencia de que el modelo haya sido ajustado para reducir alucinaciones.
- Sesgos desconocidos: al no documentarse la composición del dataset ni el proceso de fusión, no es posible evaluar sesgos de género, raza, idioma o dominio.
- Licencia restrictiva o ambigua: la licencia "other" no especifica los términos, por lo que el uso comercial queda condicionado a la interpretación del autor y no se recomienda en producción sin aclaración legal.
- Sin cuantizaciones oficiales: no hay versiones GGUF, AWQ ni GPTQ, lo que limita el despliegue en hardware de consumo sin trabajo adicional de conversión.
- Sin validación de la comunidad: cero descargas y cero likes indican que el modelo no ha sido probado por terceros; no hay informes de fallos ni de comportamiento en producción.
- Arquitectura MoE sin parámetros activos declarados: el coste real de inferencia es incierto, lo que dificulta planificar recursos.
- Posible inestabilidad por fusión: los modelos fusionados pueden presentar degradación en tareas específicas respecto al modelo base, y no se han publicado comparaciones con `tstmoe5`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ehristoforu/tstmoe6
- Modelo base: https://huggingface.co/ehristoforu/tstmoe5
- Herramienta PolyMerge: https://github.com/ehristoforu/polymerge
