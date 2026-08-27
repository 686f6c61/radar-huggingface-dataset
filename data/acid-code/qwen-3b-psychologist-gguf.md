# acid-code/Qwen-3B-Psychologist-GGUF

## Resumen

El modelo `acid-code/Qwen-3B-Psychologist-GGUF` es un ajuste fino (finetune) del modelo base Qwen2.5-3B-Instruct, convertido al formato GGUF mediante la herramienta Unsloth. El nombre sugiere una especialización en tareas de apoyo psicológico o conversación terapéutica, aunque no se proporcionan detalles sobre el conjunto de datos de entrenamiento ni el proceso de ajuste. El repositorio incluye un único archivo cuantizado en Q4_K_M, lo que lo hace adecuado para ejecución en hardware de consumo mediante llama.cpp u Ollama.

La relevancia de este modelo radica en su tamaño compacto (aproximadamente 3 000 millones de parámetros) y su formato GGUF, que permite desplegarlo en entornos con recursos limitados, como portátiles o servidores pequeños. Al estar basado en la familia Qwen2.5, hereda las capacidades generales de generación de texto y conversación de dicha arquitectura, aunque no se especifican mejoras concretas del ajuste fino. La ausencia de información sobre licencia, idiomas y benchmarks limita su evaluación objetiva, por lo que esta ficha se basa únicamente en los datos disponibles en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-3B-Instruct (base, segun nombre del archivo) |
| Parametros totales | 3 085 938 688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico archivo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Qwen2.5-3B-Instruct, una arquitectura transformer densa de 3 000 millones de parámetros. El proceso de entrenamiento se realizó con Unsloth, una librería que optimiza el fine-tuning y la conversión a GGUF, pero no se proporcionan detalles sobre el dataset, el número de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO. El único artefacto disponible es el archivo cuantizado `Qwen2.5-3B-Instruct.Q4_K_M.gguf`, que reduce el tamaño del modelo a 1,9 GB, facilitando su ejecución en hardware modesto.

No se documentan innovaciones técnicas específicas del ajuste fino. La conversión a GGUF permite su uso con llama.cpp, llama-cli y Ollama, como se indica en la model card. La ausencia de información sobre el proceso de entrenamiento impide evaluar la calidad del ajuste o su especialización real en tareas psicológicas.

## Capacidades

- Generacion de texto y conversacion: al estar basado en Qwen2.5-Instruct, el modelo puede mantener dialogos multi-turno, aunque no se especifican mejoras concretas del ajuste.
- Soporte de tool calling: no disponible (no se menciona en la informacion).
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponible (el modelo base Qwen2.5 soporta varios idiomas, pero no se confirma para este ajuste).
- Capacidades especiales: el nombre "Psychologist" sugiere un enfoque en conversacion de apoyo psicologico, pero no hay evidencia documentada de ello.

## Casos de uso

- Asistente conversacional de apoyo emocional: el modelo podria emplearse en aplicaciones de chat para ofrecer respuestas empaticas y orientacion basica, aunque sin garantias de calidad clinica. Su tamano reducido permite integrarlo en aplicaciones moviles o web con recursos limitados.
- Prototipado rapido de chatbots: gracias al formato GGUF y la compatibilidad con Ollama, es adecuado para experimentar con interacciones conversacionales en entornos de desarrollo sin necesidad de infraestructura GPU potente.
- Educacion y formacion en psicologia: podria usarse como material de ejemplo para estudiantes que analicen respuestas generadas por IA en contextos terapeuticos, siempre con supervisión humana.
- Investigacion academica sobre IA conversacional: investigadores pueden estudiar el comportamiento de un modelo ajustado con fines psicologicos, comparandolo con el base, aunque faltan datos sobre el dataset de entrenamiento.
- Despliegue en edge devices: al pesar solo 1,9 GB, puede ejecutarse en dispositivos con 4 GB de RAM, como Raspberry Pi 5 o mini-PCs, para pruebas de concepto.
- Integracion en pipelines de soporte al cliente: podria servir como primer nivel de atencion en servicios de salud mental digital, derivando a humanos cuando sea necesario, aunque su fiabilidad no esta validada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estandar. Tampoco se comparan metricas con el modelo base Qwen2.5-3B-Instruct.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa 1,9 GB, por lo que la VRAM necesaria ronda los 2-3 GB, dependiendo del contexto y del backend.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050 o superiores. Tambien puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Compatibilidad con consumer GPU: si, cabe en GPUs de gama de entrada y en muchas integradas con suficiente RAM compartida.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama (incluye Modelfile), y cualquier framework compatible con GGUF como LM Studio o kobold.cpp.
- Latencia y throughput estimados: no disponibles. En una CPU moderna (8 nucleos) se esperan velocidades de 5-10 tokens/s; en GPU de gama media, 20-40 tokens/s, pero son estimaciones generales sin datos concretos.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especificos. El modelo base Qwen2.5-3B-Instruct es la referencia natural, pero no se han publicado comparativas. Tampoco se conocen otros ajustes "psicologicos" de tamano similar en el repositorio. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no hay informacion especifica, pero al ser un ajuste de Qwen2.5, puede heredar sesgos del modelo base, que no estan documentados en este repositorio.
- Riesgo de alucinacion: no se ha evaluado; en contextos psicologicos, las alucinaciones podrian ser daninas, por lo que no debe usarse como sustituto de atencion profesional.
- Limitaciones de contexto o idioma: no se especifican; el modelo base Qwen2.5 soporta multiples idiomas, pero este ajuste no confirma su cobertura.
- Restricciones de licencia: la licencia no esta indicada, lo que impide conocer si permite uso comercial o modificacion. Se recomienda contactar al autor antes de cualquier despliegue productivo.
- Caveat para produccion: la falta de documentacion sobre el dataset de entrenamiento y la ausencia de evaluaciones de seguridad hacen que no sea recomendable para aplicaciones clinicas reales sin una validacion exhaustiva.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/acid-code/Qwen-3B-Psychologist-GGUF
- Unsloth (herramienta de entrenamiento y conversion): https://github.com/unslothai/unsloth
- Modelo base Qwen2.5-3B-Instruct (referencia): https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
