# FqU/NemoMix-Unleashed-12B-int4-ov

## Resumen

El modelo FqU/NemoMix-Unleashed-12B-int4-ov es una versión cuantizada en INT4 de MarinaraSpaghetti/NemoMix-Unleashed-12B, publicada por el usuario FqU en Hugging Face. El modelo original se construyó mediante un merge con mergekit (método della_linear) sobre una base Mistral-Nemo, y posteriormente se convirtió al formato OpenVINO IR usando optimum-intel y OpenVINO NNCF. El resultado es un modelo de generación de texto pensado para ejecutarse de forma eficiente en hardware Intel, especialmente CPUs, gracias a la cuantización INT4. Su relevancia práctica radica en combinar las capacidades conversacionales del modelo base con una representación optimizada para despliegue en entornos con recursos limitados. El repositorio tiene un tamaño de 7.0 GB y mantiene la licencia Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Merged transformer sobre base Mistral-Nemo (merge con mergekit, método della_linear) |
| Parametros totales | 12B (indicado en el nombre) |
| Parametros activos | No es un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (OpenVINO NNCF) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR |

## Arquitectura y entrenamiento

El modelo original, MarinaraSpaghetti/NemoMix-Unleashed-12B, se creó mediante un merge de pesos con la herramienta mergekit, usando el método della_linear sobre una arquitectura Mistral-Nemo. Esto implica que se combinan pesos de varios modelos afinados para mejorar el comportamiento conversacional, aunque la procedencia exacta de los pesos no está documentada en la información disponible. Posteriormente, FqU aplicó una cuantización INT4 con la librería optimum-intel y el toolkit OpenVINO NNCF, produciendo una representación en formato OpenVINO IR, que es un grafo de inferencia optimizado para el runtime de OpenVINO. No se han proporcionado datos sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF, DPO o SFT.

## Capacidades

- Generación de texto y conversación en inglés, según las etiquetas "text-generation" y "conversational" de los metadatos.
- Inferencia optimizada para hardware Intel mediante el formato OpenVINO IR y la cuantización INT4, con menor huella de memoria que una representación FP16.
- Compatibilidad con la API de transformers a través de optimum.intel, usando `OVModelForCausalLM` y `AutoTokenizer`.
- No hay información disponible sobre soporte de tool calling, agentes, visión, audio, ni modos de razonamiento especiales.
- La etiqueta "not-for-all-audiences" indica que el modelo puede generar contenido no apto para todos los públicos, lo que exige filtros de seguridad en producción.

## Casos de uso

- Inferencia en servidores sin GPU dedicada: al estar cuantizado en INT4 y en formato OpenVINO IR, puede ejecutarse en CPU. El repositorio pesa 7.0 GB, por lo que un sistema con 8-12 GB de RAM libre puede cargar el modelo. Es adecuado para entornos donde el coste de hardware debe mantenerse bajo.
- Chatbots de soporte interno en inglés: la naturaleza conversacional del modelo base permite construir asistentes para responder preguntas frecuentes. Se puede integrar en una interfaz web que llame al modelo mediante optimum-intel y un prompt de sistema predefinido.
- Procesamiento por lotes de documentos en inglés: tareas de resumen, clasificación o extracción de entidades pueden ejecutarse sobre colecciones de texto. La cuantización INT4 reduce el consumo de memoria, lo que permite procesar lotes más grandes en la misma máquina que con el modelo en FP16.
- Prototipado rápido de aplicaciones de IA generativa: el checkpoint está disponible en Hugging Face, por lo que un desarrollador puede evaluar su calidad de salida sin preparar un entorno de inferencia complejo. Basta con cargar el modelo y el tokenizer con las clases de optimum.intel.
- Investigación sobre cuantización y compresión de modelos: el artefacto sirve como ejemplo práctico de cómo aplicar OpenVINO NNCF para convertir un modelo merge a INT4. Investigadores pueden comparar este checkpoint con el modelo original para medir el impacto de la cuantización en la calidad.
- Aplicaciones offline con requisitos de privacidad: al ejecutarse localmente, evita enviar datos a APIs externas. Es adecuado en escenarios donde los textos tienen carácter confidencial y no pueden salir de la infraestructura.
- Educación sobre despliegue de modelos: docentes y formadores pueden usar el repositorio para ilustrar el flujo de exportación a OpenVINO y cuantización INT4 sobre un caso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo está diseñado para ejecutarse en CPU. El consumo de RAM estimado ronda los 7 GB (tamaño del repositorio) más el overhead del runtime OpenVINO. Se recomienda un mínimo de 8-12 GB de RAM libre.
- GPU recomendada: no es necesaria. Puede ejecutarse en cualquier sistema con CPU Intel compatible con OpenVINO. Si se desea aceleración por GPU, se podría usar una GPU Intel integrada o discreta, aunque no hay datos de rendimiento publicados.
- Compatibilidad con GPUs de consumo: no aplica para este formato, al estar centrado en el ecosistema Intel.
- Opciones de despliegue: OpenVINO runtime y optimum-intel. No es compatible directamente con vLLM, llama.cpp, Ollama ni TGI sin una conversión adicional.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Formato | Licencia | Entorno de ejecucion |
|---|---|---|---|---|---|
| FqU/NemoMix-Unleashed-12B-int4-ov | 12B (indicado en el nombre) | INT4 (OpenVINO NNCF) | OpenVINO IR | Apache 2.0 | OpenVINO / optimum-intel |
| MarinaraSpaghetti/NemoMix-Unleashed-12B | 12B (indicado en el nombre) | No disponible | No disponible | Apache 2.0 | Transformers (probable) |
| bartowski/NemoMix-Unleashed-12B-GGUF | 12B (indicado en el nombre) | GGUF (varias cuantizaciones) | GGUF | Apache 2.0 | llama.cpp / Ollama |

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos ni de seguridad; el modelo puede heredar sesgos del dataset original, que no se ha documentado.
- Existe riesgo de alucinación inherente a los modelos generativos, sin que se conozca una tasa de precisión de referencia.
- La etiqueta "not-for-all-audiences" implica que el modelo puede producir contenido inapropiado, por lo que su uso en producción requiere filtros y moderación.
- El idioma documentado es únicamente inglés; no es apto para tareas multilingües ni para contextos de castellano.
- La cuantización INT4 puede provocar una pérdida de calidad respecto al modelo original en FP16, y no se ha publicado ninguna evaluación comparativa.
- El formato OpenVINO IR es específico del runtime de OpenVINO y no es portable a otros backends como Transformers puro, llama.cpp o vLLM sin una conversión adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FqU/NemoMix-Unleashed-12B-int4-ov
- Modelo base: https://huggingface.co/MarinaraSpaghetti/NemoMix-Unleashed-12B
- Versión GGUF del mismo modelo base: https://huggingface.co/bartowski/NemoMix-Unleashed-12B-GGUF
