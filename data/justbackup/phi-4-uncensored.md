# Justbackup/Phi-4-Uncensored

## Resumen

Phi-4-Uncensored es un ajuste fino del modelo Phi-4 de Microsoft, desarrollado por el usuario Justbackup mediante la técnica LoRA (Low-Rank Adaptation). El objetivo declarado es eliminar los filtros de seguridad y comportamientos de rechazo del modelo base, permitiendo respuestas más abiertas y sin restricciones, incluido contenido para adultos. Está pensado para investigación y uso educativo, y su licencia MIT facilita su uso en proyectos propietarios.

El modelo conserva las capacidades generales de conocimiento y seguimiento de instrucciones de Phi-4, pero pierde las capacidades multimodales (visión y audio) del base, quedando limitado a texto. Con aproximadamente 14.700 millones de parámetros, es un modelo de tamaño medio que puede ejecutarse en GPUs de consumo si se cuantiza adecuadamente. Su relevancia radica en que ofrece una alternativa sin censura para entornos donde se requiere generación de contenido sin restricciones, aunque con las advertencias éticas y legales correspondientes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Phi-4, decodificador autorregresivo) |
| Parametros totales | 14.659.507.200 (14,7 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada de Phi-4, que soporta 128k tokens, pero no se confirma en la ficha) |
| Tipos de cuantizacion | no disponible (solo se menciona safetensors; existe una versión GGUF externa) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (también existe una versión GGUF en otro repositorio) |

## Arquitectura y entrenamiento

El modelo parte de microsoft/phi-4, un transformer denso con atención de ventana deslizante y una arquitectura optimizada para razonamiento. El ajuste fino se realizó mediante LoRA, que solo entrena matrices de baja dimensión en las capas de atención y MLP, reduciendo costes de cómputo y manteniendo el conocimiento base. No se especifican los datos de entrenamiento, el número de tokens utilizados ni si se emplearon técnicas de alineación como RLHF o DPO; la model card solo indica que se eliminaron los comportamientos de rechazo y filtros de seguridad.

La principal innovación técnica de este modelo no reside en la arquitectura, sino en el proceso de "des-censura": un ajuste fino orientado a que el modelo responda a prompts que el base rechazaría. Esto implica que el entrenamiento probablemente utilizó pares de prompts y respuestas sin restricciones, aunque no se detalla la metodología exacta.

## Capacidades

- Generación de texto libre y sin filtros de seguridad, incluyendo contenido para adultos.
- Mantiene las capacidades de razonamiento y conocimiento general de Phi-4.
- Sigue instrucciones y responde a prompts complejos.
- Soporte de tool calling y function calling: no confirmado explícitamente, pero heredado del base (Phi-4 tiene soporte nativo para herramientas).
- Capacidades multilingües: limitado a inglés (según la ficha).
- Sin capacidades de visión ni audio (eliminadas en el ajuste).
- Modo de pensamiento (thinking mode): no mencionado, pero Phi-4 tiene capacidad de razonamiento extendido; no se especifica si se conserva.

## Casos de uso

- Investigación en IA y seguridad: estudiar el comportamiento de modelos sin alineación y comparar respuestas con el base.
- Generación de ficción y narrativa adulta: el modelo puede crear historias o diálogos con contenido explícito sin rechazos.
- Desarrollo de chatbots de rol sin restricciones: para juegos de rol o simulación de personajes donde se requiere libertad creativa.
- Pruebas de robustez y jailbreak: analizar cómo se comporta un modelo des-censurado ante prompts malintencionados (con fines académicos).
- Prototipado de aplicaciones que requieren respuestas abiertas en dominios sensibles (siempre bajo supervisión humana).
- Evaluación comparativa de técnicas de alineación: usar este modelo como contrapunto a modelos alineados en benchmarks de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna métrica de rendimiento (MMLU, HumanEval, GSM8K, etc.). Se recomienda consultar las evaluaciones de Phi-4 base para tener una referencia aproximada, pero no se dispone de datos específicos para este ajuste.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 14,7 B parámetros. En precisión fp16, ocupa aproximadamente 29,4 GB, por lo que requiere una GPU con al menos 32 GB (por ejemplo, A100 40 GB o H100 80 GB) para inferencia sin cuantizar.
- Con cuantización GGUF (versión externa disponible): Q4_K_M (~8-9 GB) cabe en GPUs de consumo como RTX 3090/4090 (24 GB), y Q8 (~15 GB) también. Para Q4, una RTX 3060 de 12 GB podría funcionar con contexto limitado.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-webui (para la versión GGUF); vLLM o TGI pueden servir para safetensors con optimizaciones, pero requieren más VRAM.
- Latencia y throughput: no se conocen datos específicos. Como referencia, un modelo de 14B en una RTX 4090 con cuantización Q4 puede generar entre 30 y 60 tokens por segundo, dependiendo del contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Phi-4 (base) | 14,7 B | 128k (no confirmado en ficha) | MIT | HuggingFace | Alineado, con filtros de seguridad |
| Phi-4-Uncensored | 14,7 B | no disponible | MIT | HuggingFace | Sin filtros, solo texto |
| Dolphin 2.9 (Llama 3 8B) | 8 B | 8k | Apache 2.0 | HuggingFace | Modelo des-censurado conocido, más pequeño |

No se dispone de comparativas directas de rendimiento, ya que este modelo no publica benchmarks. La comparación se basa en características generales.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un ajuste sobre Phi-4, puede heredar sesgos del modelo base, y el proceso de des-censura podría amplificar respuestas ofensivas o dañinas.
- Riesgo de alucinación: alto, especialmente en temas controvertidos, ya que no hay alineación que mitigue la generación de información falsa.
- Limitaciones de idioma: solo inglés; no soporta otros idiomas.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el modelo está destinado a investigación y educación. El uso de contenido adulto puede estar sujeto a regulaciones locales.
- Advertencias de producción: no es apto para uso en producción sin supervisión humana, ya que puede generar contenido inapropiado, ilegal o dañino. No se recomienda su uso en aplicaciones orientadas al público general.
- El modelo puede fallar en rechazar prompts incluso cuando el usuario no busca contenido explícito, debido a la eliminación de los filtros.

## Enlaces

- [Repositorio del modelo en HuggingFace](https://huggingface.co/Justbackup/Phi-4-Uncensored)
- [Modelo base: microsoft/phi-4](https://huggingface.co/microsoft/phi-4)
- [Versión GGUF del modelo (externo)](https://huggingface.co/ccharnkij/Phi-4-Uncensored-GGUF)
