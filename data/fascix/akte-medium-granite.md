# Fascix/Akte-medium-granite

## Resumen

Aktè-Medium es un modelo de lenguaje fine-tuneado por el desarrollador Fascix para la generación de recetas de cocina y la planificación de comidas. Está diseñado específicamente para la aplicación BubbleFood / Aktè, y su nombre indica que parte de un modelo base de la familia Granite de IBM, aunque no se especifica cuál exactamente. Con 3.659.737.600 parámetros (aproximadamente 3,66 mil millones), se distribuye en dos formatos: MLX 4-bit y GGUF Q4_K_M, lo que permite su ejecución en entornos Apple Silicon y mediante llama.cpp respectivamente.

El modelo está orientado exclusivamente al idioma francés, tal como indica su etiqueta `fr`. Su relevancia actual radica en ser un ejemplo de fine-tuning vertical para un dominio concreto (gastronomía) sobre una arquitectura empresarial como Granite, aunque su licencia restringe el uso únicamente a la aplicación mencionada, lo que limita su adopción externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en la familia Granite de IBM, probablemente transformer decoder-only) |
| Parametros totales | 3.659.737.600 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 4-bit, GGUF Q4_K_M |
| Idiomas soportados | frances |
| Licencia | no disponible (la model card indica "uso estrictamente reservado a la aplicacion BubbleFood / Aktè") |
| Formato de pesos | safetensors (MLX), GGUF |

## Arquitectura y entrenamiento

No se han publicado detalles tecnicos sobre la arquitectura interna ni el proceso de entrenamiento en la informacion disponible. El nombre del modelo sugiere que se trata de un fine-tuning de un modelo Granite de IBM, que tipicamente emplea una arquitectura transformer decoder-only, pero no se confirma el modelo base exacto ni la cantidad de tokens de entrenamiento, la composicion del dataset o si se utilizaron tecnicas como RLHF o DPO. La model card unicamente indica que es un "modelo de lenguaje fine-tuneado para la generacion de recetas de cocina y la planificacion de comidas".

## Capacidades

- Generacion de recetas de cocina en frances, incluyendo ingredientes, pasos y posiblemente tiempos de preparacion.
- Planificacion de comidas, probablemente capaz de estructurar menus semanales o diarios.
- Conversacion en frances (etiqueta `conversational`), lo que sugiere capacidad de mantener dialogos multi-turno.
- No se mencionan capacidades de tool calling, razonamiento avanzado, codigo, vision ni otros dominios.

## Casos de uso

- Generacion de recetas personalizadas: el modelo puede crear recetas a partir de ingredientes disponibles o preferencias alimentarias, siendo util para usuarios de la aplicacion BubbleFood / Aktè que buscan inspiracion culinaria.
- Planificacion semanal de menus: dado su enfoque en meal-planning, puede estructurar menus completos para varios dias, considerando variedad y equilibrio.
- Adaptacion a restricciones dieteticas: aunque no se especifica, un modelo entrenado en recetas podria ajustar sugerencias para dietas vegetarianas, veganas o sin gluten, si los datos de entrenamiento lo contemplan.
- Asistente conversacional de cocina: integrado en la aplicacion, puede responder preguntas sobre tecnicas culinarias, sustituciones de ingredientes o tiempos de coccion en un dialogo natural.
- Generacion de listas de la compra: a partir de un menu planificado, el modelo podria extraer los ingredientes necesarios y organizarlos en una lista.
- Contenido para blogs o redes sociales gastronomicas: el modelo puede producir descripciones atractivas de platos o historias detras de recetas, aunque su licencia restringe el uso a la aplicacion mencionada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo.

## Requisitos de hardware

- VRAM estimada: con 3,66 mil millones de parametros en cuantizacion 4-bit, el peso del modelo ocupa aproximadamente 1,8 GB (3,66 B × 0,5 bytes/parametro). Con overhead de activaciones y contexto, se estima un uso de 2-3 GB de VRAM para inferencia.
- GPU recomendadas: cabe en GPUs consumer como NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores. En Apple Silicon, el formato MLX 4-bit esta optimizado para chips M1/M2/M3 con memoria unificada de al menos 8 GB.
- Opciones de despliegue: el formato GGUF permite su uso con llama.cpp, llama-simple u Ollama. El formato MLX esta pensado para el framework MLX en macOS. Tambien podria servirse con vLLM si se convierte a safetensors estandar, aunque no se menciona.
- Latencia y throughput: no se proporcionan datos oficiales. En una GPU consumer moderna, un modelo de este tamano en 4-bit puede generar entre 20 y 50 tokens por segundo, dependiendo del hardware y la implementacion.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa rigurosa. El modelo es un fine-tuning especifico para recetas, sin benchmarks publicados. Como referencia generica, otros modelos de tamano similar (3-4 B) como Granite-3B de IBM o Llama-3.2-3B podrian tener capacidades generales de texto, pero no se pueden comparar directamente sin datos de rendimiento en tareas culinarias.

## Limitaciones y advertencias

- Licencia restrictiva: la model card indica que el uso esta "estrictamente reservado a la aplicacion BubbleFood / Aktè", lo que impide su utilizacion comercial o investigadora fuera de ese contexto.
- Idioma limitado: solo soporta frances; no hay capacidades multilingues documentadas.
- Dominio limitado: esta especializado en recetas y planificacion de comidas, por lo que su rendimiento en otras tareas de lenguaje general probablemente sea pobre.
- Sin informacion sobre sesgos o alucinaciones: no se han publicado evaluaciones de seguridad, sesgos o fiabilidad. Como modelo fine-tuneado, podria heredar sesgos del modelo base y del dataset de recetas.
- Riesgo de alucinacion en recetas: podria generar ingredientes o pasos inexactos o peligrosos si no se valida la salida, especialmente en contextos de alergias o restricciones dieteticas.
- Sin garantias de soporte: al ser un proyecto de un unico autor con cero descargas y cero likes, no hay comunidad ni mantenimiento activo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Fascix/Akte-medium-granite
- Organizacion IBM Granite (referencia general): https://huggingface.co/ibm-granite
- Pagina oficial de IBM Granite: https://www.ibm.com/granite
