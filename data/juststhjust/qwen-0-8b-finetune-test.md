# juststhjust/Qwen-0.8B-finetune-test

## Resumen

El modelo `juststhjust/Qwen-0.8B-finetune-test` es un experimento de fine-tuning realizado por el usuario juststhjust sobre el modelo base `unsloth/Qwen3.5-0.8B`, convertido posteriormente al formato GGUF mediante la herramienta Unsloth. Se trata de un modelo de generación de texto con 772 millones de parámetros, pensado exclusivamente como prueba técnica y no como un artefacto listo para producción. El propio autor indica en la model card que "no se recomienda su uso" y que es "solo para una prueba".

El interés de esta publicación reside en su carácter de demostración del flujo de trabajo de fine-tuning y conversión a GGUF con Unsloth sobre la familia Qwen3.5. Aunque carece de valor práctico para aplicaciones reales, sirve como ejemplo de cómo se puede adaptar un modelo base pequeño a un formato optimizado para inferencia en CPU y GPU mediante llama.cpp. No se han publicado métricas de rendimiento, benchmarks ni detalles sobre el dataset de entrenamiento, por lo que su evaluación objetiva es imposible con la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-0.8B) |
| Parametros totales | 772.845.888 (~0,77B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato GGUF, cuantizacion desconocida) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen3.5-0.8B`, una version optimizada del modelo Qwen3.5-0.8B de Alibaba. La arquitectura subyacente es un transformer de lenguaje, aunque no se han proporcionado detalles especificos sobre el numero de capas, dimensiones ocultas o mecanismos de atencion. El proceso de fine-tuning se realizo con la libreria Unsloth, que emplea tecnicas de entrenamiento eficiente en memoria y velocidad, y posteriormente se convirtio a GGUF para su uso con llama.cpp y otros runners compatibles.

No se dispone de informacion sobre el dataset utilizado, el numero de pasos de entrenamiento, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El autor tampoco ha documentado ninguna innovacion tecnica especifica mas alla del flujo estandar de fine-tuning y conversion. Dado el caracter experimental, es probable que el entrenamiento haya sido breve y con un dataset reducido, pero esto es una inferencia no confirmada.

## Capacidades

- Generacion de texto en ingles: el modelo es capaz de producir texto coherente basandose en el modelo base Qwen3.5-0.8B, aunque su fine-tuning puede haber alterado su comportamiento.
- Conversacion multi-turno: los tags indican que es un modelo conversacional, por lo que puede mantener dialogos simples.
- Compatibilidad con llama.cpp: al estar en formato GGUF, puede ejecutarse en entornos locales con CPU o GPU mediante herramientas como llama.cpp, Ollama o LM Studio.
- Etiquetado como vision-language-model: aunque el pipeline declarado es text-generation, el tag sugiere una posible intencion de soporte multimodal, pero no hay evidencia de que el fine-tuning haya incluido datos de imagen.
- Sin capacidades documentadas de tool calling, agentes o razonamiento multi-paso.

## Casos de uso

Dado que el autor desaconseja explicitamente su uso, los casos de uso practicos son muy limitados. No obstante, puede tener interes en los siguientes escenarios:

- Pruebas de flujo de trabajo de fine-tuning: sirve como referencia para desarrolladores que quieran replicar el proceso de ajuste de un modelo Qwen3.5 pequeno con Unsloth y su posterior conversion a GGUF.
- Validacion de infraestructura local: permite comprobar que un entorno con llama.cpp o Ollama es capaz de cargar y ejecutar un modelo GGUF de ~770M parametros sin problemas de compatibilidad.
- Experimentacion educativa: util en entornos docentes para ilustrar como un modelo base puede ser adaptado a una tarea concreta, aunque en este caso no se especifica cual.
- Comparacion de rendimiento: puede usarse como punto de partida para comparar el efecto del fine-tuning frente al modelo base original en tareas simples de generacion.
- Depuracion de pipelines de inferencia: al ser un modelo pequeno, es adecuado para probar integraciones con APIs o sistemas de despliegue sin coste computacional elevado.
- No se recomienda su uso en produccion, atencion al cliente, generacion de codigo, ni ninguna aplicacion que requiera resultados fiables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras metricas estandar. El autor no ha incluido ninguna evaluacion en la model card ni en los resultados de busqueda.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo GGUF de ~770M parametros, la huella de memoria es reducida. Una cuantizacion Q4_K_M ocuparia aproximadamente 0,5-0,7 GB, por lo que puede ejecutarse en GPU con 2 GB de VRAM o incluso en CPU con 4-8 GB de RAM.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (GTX 1650, RTX 3050, etc.) seria suficiente para una inferencia fluida. Tambien es viable en Apple Silicon (M1/M2/M3) mediante Metal.
- Compatibilidad con hardware consumer: si, cabe en practicamente cualquier equipo domestico.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, o cualquier runner compatible con GGUF. Tambien puede cargarse en vLLM si se convierte a otro formato, aunque no es lo habitual.
- Latencia y throughput: no se dispone de mediciones. Para un modelo de este tamano, se espera una generacion de decenas de tokens por segundo en GPU y de 5-15 tokens por segundo en CPU moderna, pero son estimaciones generales no verificadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento publicados para este modelo, por lo que no es posible establecer una comparativa cuantitativa. Como referencia estructural, se puede comparar con su modelo base y con otros modelos de tamano similar:

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B (base) | ~0,8B | no disponible | safetensors | no disponible | Modelo original sin fine-tuning |
| juststhjust/Qwen-0.8B-finetune-test | ~0,77B | no disponible | GGUF | no disponible | Finetune de prueba, no recomendado |
| Qwen2.5-0.5B | 0,5B | 32K | safetensors | Apache 2.0 | Alternativa similar en tamano |

La comparacion con Qwen2.5-0.5B es meramente orientativa, ya que no se han evaluado ambos en las mismas condiciones. El modelo analizado es un derivado de Qwen3.5, por lo que su comportamiento base deberia ser similar al de la familia Qwen, pero sin garantias.

## Limitaciones y advertencias

- El autor indica explicitamente que el modelo no se recomienda para uso y que es solo una prueba.
- No se ha publicado informacion sobre el dataset de fine-tuning, por lo que se desconocen los posibles sesgos introducidos.
- Riesgo de alucinacion: como cualquier modelo de lenguaje pequeno, puede generar contenido falso o incoherente.
- Limitaciones de idioma: solo se declara soporte para ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- Licencia desconocida: no se especifica la licencia del modelo, lo que impide conocer las restricciones de uso comercial o redistribucion.
- Sin garantias de calidad: al ser un experimento, no hay evaluacion de seguridad, robustez ni rendimiento.
- Formato GGUF: aunque es ampliamente compatible, no es el formato nativo de todos los frameworks de inferencia (por ejemplo, transformers de HuggingFace requiere conversion).
- No se ha documentado la cuantizacion aplicada, por lo que la precision numerica es incierta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/juststhjust/Qwen-0.8B-finetune-test
- Repositorio relacionado (mismo autor): https://huggingface.co/juststhjust/qwen_finetune
- Blog de Unsloth sobre fine-tuning de Qwen3: https://unsloth.ai/blog/qwen3
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio GitHub de Qwen finetuning (Akers): https://github.com/Akers/Qwen-finetune
- Repositorio GitHub de Qwen finetuning (ssbuild): https://github.com/ssbuild/qwen_finetuning
