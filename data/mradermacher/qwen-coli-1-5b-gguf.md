# mradermacher/Qwen-Coli-1.5B-GGUF

## Resumen

Qwen-Coli-1.5B es un modelo de lenguaje causal de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones) derivado de la familia Qwen2 y afinado para tareas de biología sintética, bioinformática y optimización de codones en *Escherichia coli*. Lo desarrolla el autor aakashdandekar2006 y esta ficha concreta corresponde a la republicación en formato GGUF realizada por mradermacher, que facilita su ejecución en CPU y GPU de consumo mediante llama.cpp y derivados.

El modelo parte de una arquitectura transformer decoder-only tipo Qwen2 y se distribuye como un "merge" (fusión de pesos) orientado a un dominio muy específico: la generación y el análisis de secuencias genéticas, la optimización de codones para expresión en *E. coli* y el trabajo de ingeniería de proteínas. Su relevancia radica en que empaqueta conocimiento de dominio biológico en un tamaño reducido, lo que permite desplegarlo en hardware modesto.

Esta versión GGUF incluye un conjunto de cuantizaciones estáticas que van desde Q2_K (0,8 GB) hasta f16 (3,2 GB), lo que lo hace accesible para equipos con poca VRAM. No se dispone de información publicada sobre el proceso de entrenamiento, los datos utilizados ni resultados de benchmarks en la documentación proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (familia Qwen2) |
| Parámetros totales | 1.543.714.304 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones) y safetensors (modelo base) |

## Arquitectura y entrenamiento

El modelo base es un transformer causal decoder-only de la familia Qwen2, con 1.543.714.304 parámetros. La model card indica que se trata de un modelo "merged", es decir, una fusión de pesos, aunque no se detalla qué modelos se combinaron ni con qué método (por ejemplo, SLERP, TIES o DARE). Tampoco se especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

Los tags del repositorio apuntan a un ajuste orientado a dominios concretos: bioinformática, biología sintética, genómica, optimización de codones, *Escherichia coli* e ingeniería de proteínas. No obstante, la información disponible no permite confirmar detalles técnicos sobre el proceso de entrenamiento ni sobre innovaciones arquitectónicas adicionales (atención lineal, decodificación especulativa, etc.).

## Capacidades

- Generación de texto causal en inglés.
- Generación y análisis de secuencias genéticas y de ADN.
- Optimización de codones para expresión en *Escherichia coli*.
- Tareas de bioinformática y biología sintética.
- Ingeniería de proteínas (según los tags del modelo).
- Generación de código (tag `code` declarado por el autor).
- Conversación multi-turno (tag `conversational`).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling: no disponible en la información proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo "thinking", visión o audio: no disponible.

## Casos de uso

- Optimización de codones para *E. coli*: el modelo puede generar variantes de secuencia con codones adaptados al uso codónico de *E. coli*, un paso habitual en la expresión heteróloga de proteínas recombinantes.
- Diseño de construcciones genéticas: ayuda a redactar y revisar secuencias de ADN sintético para experimentos de biología sintética, con menos errores de formato que un modelo generalista.
- Análisis de secuencias en pipelines de bioinformática: integrable como componente de generación o resumen en flujos que procesan lecturas o anotaciones genómicas.
- Asistencia en ingeniería de proteínas: apoyo en la propuesta de mutaciones o variantes y en la documentación de su justificación biológica.
- Prototipado local en investigación: al caber en GPUs de consumo en cuantizaciones Q4, permite experimentar sin depender de servicios en la nube ni enviar datos sensibles fuera del laboratorio.
- Generación de código auxiliar para scripts de biología computacional: el tag `code` sugiere utilidad para escribir pequeños scripts de procesamiento de secuencias, aunque conviene validar la salida.
- Docencia y divulgación: respuestas en inglés sobre conceptos de biología molecular con un modelo pequeño y desplegable en portátil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio GGUF no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas de biología, y tampoco se proporcionan comparaciones con modelos de referencia.

## Requisitos de hardware

- VRAM estimada según cuantización: Q2_K ~0,8 GB; Q4_K_M ~1,1 GB; Q6_K ~1,4 GB; Q8_0 ~1,7 GB; f16 ~3,2 GB (tamaños de archivo, la VRAM real requiere margen adicional para el contexto y el runtime).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para cuantizaciones Q4-Q8; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas, aunque para un modelo de 1,5B las consumer de gama media son suficientes.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs modernas, e incluso puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; el modelo base en safetensors es compatible con transformers y, potencialmente, con vLLM y TGI.
- Latencia y throughput: no disponibles en la información proporcionada; en un modelo de este tamaño se espera una generación muy rápida en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen-Coli-1.5B (este) | 1,54B | no disponible | Apache 2.0 | Biología sintética / codones |
| Qwen2.5-1.5B | 1,5B | 32K (según versión) | Apache 2.0 | Propósito general |
| SmolLM2-1.7B | 1,7B | 8K (según versión) | Apache 2.0 | Propósito general |
| TinyLlama-1.1B | 1,1B | 2K | Apache 2.0 | Propósito general |

La comparación con modelos de propósito general es orientativa: Qwen-Coli-1.5B está especializado en un dominio muy concreto y no se dispone de métricas que permitan comparar su rendimiento frente a alternativas generalistas. Los datos de contexto de los modelos comparables provienen del conocimiento público general y pueden variar según la versión exacta.

## Limitaciones y advertencias

- Modelo de dominio muy específico: su utilidad fuera de biología sintética y genómica es limitada frente a modelos generalistas del mismo tamaño.
- Idioma: solo se declara soporte de inglés; el rendimiento en castellano no está garantizado.
- Riesgo de alucinación: en un dominio donde una secuencia incorrecta puede invalidar un experimento, toda salida debe validarse con herramientas bioinformáticas y revisión experta.
- Sin datos de entrenamiento publicados: no es posible evaluar la calidad ni la procedencia de los datos, lo que dificulta auditar sesgos o contaminación.
- Modelo "merged": la fusión de pesos puede introducir degradaciones no documentadas respecto a los modelos originales.
- Longitud de contexto desconocida: no se especifica la ventana máxima, lo que complica planificar casos de uso con secuencias largas.
- Licencia Apache 2.0: permite uso comercial, pero al ser un derivado conviene revisar las condiciones del modelo base y de los modelos fusionados.
- Sin benchmarks: no hay evidencia publicada de su calidad frente a alternativas, por lo que no se recomienda para producción sin una evaluación propia.
- Cuantizaciones bajas (Q2_K, Q3_K) pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso serio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen-Coli-1.5B-GGUF
- Modelo base: https://huggingface.co/aakashdandekar2006/Qwen-Coli-1.5B
- Página de descargas del cuantizador: https://hf.tst.eu/model#Qwen-Coli-1.5B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
