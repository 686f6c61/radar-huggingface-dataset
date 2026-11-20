# mradermacher/Qwen3.5-4B-Uncensored-v2-GGUF

## Resumen

Qwen3.5-4B-Uncensored-v2-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo InterpreticAI/Qwen3.5-4B-Uncensored-v2, un derivado de la familia Qwen3.5 afinado para eliminar el sesgo de censura politica y conversacional del modelo original. El paquete lo publica mradermacher, un cuantizador independiente conocido por distribuir versiones GGUF de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo base cuenta con 4.326.350.848 parametros totales (aproximadamente 4,3 mil millones) y esta etiquetado como conversacional y multilingue limitado al ingles.

La relevancia de esta ficha radica en dos factores. Por un lado, ofrece una alternativa ligera (por debajo de 3 GB en cuantizaciones Q4) que puede ejecutarse en GPUs de consumo y en CPU, lo que la hace accesible para experimentacion local. Por otro lado, el ajuste "uncensored" y la etiqueta "political-censorship" indican que el modelo ha sido modificado para reducir los rechazos y la moderacion en temas sensibles, un aspecto que debe tenerse en cuenta en cualquier despliegue en produccion.

El repositorio incluye cuantizaciones estaticas (Q2_K a Q8_0 y f16) y un suplemento multimodal mmproj, lo que sugiere que el modelo base podria tener capacidades de vision, aunque la model card no lo confirma explicitamente. La licencia declarada es Apache 2.0, lo que facilita el uso comercial, si bien las implicaciones del ajuste "uncensored" requieren una evaluacion cuidadosa por parte del integrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de la familia Qwen3.5, transformer) |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Por la nomenclatura y el tamano (4,3 mil millones de parametros), se trata de un transformer denso perteneciente a la familia Qwen3.5, pero no se especifican el numero de capas, la dimension oculta, el numero de cabezas de atencion ni el tipo de atencion (estandar, GQA o lineal). Tampoco se detalla la longitud de contexto nativa.

Respecto al entrenamiento, la model card del cuantizador no incluye informacion sobre el dataset, el numero de tokens, ni si hubo fases de RLHF, DPO o fine-tuning supervisado. La unica informacion relevante es que el modelo base (InterpreticAI/Qwen3.5-4B-Uncensored-v2) ha sido ajustado para reducir la censura politica y conversacional, segun reflejan las etiquetas "uncensored" y "political-censorship". No se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dialogos multi-turno.
- Ajuste "uncensored": menor probabilidad de rechazo ante peticiones que el modelo original filtraria por moderacion.
- Posible soporte multimodal: el repositorio incluye archivos mmproj (Q8_0 y f16), lo que sugiere capacidad de vision, aunque no se confirma en la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Experimentacion local con modelos ligeros: las cuantizaciones Q4_K_M (2,9 GB) permiten ejecutar el modelo en GPUs de consumo de 6-8 GB o en CPU, ideal para prototipado rapido sin infraestructura dedicada.
- Investigacion sobre alineamiento y censura: el ajuste "uncensored" lo convierte en una herramienta util para estudiar como cambia el comportamiento del modelo al eliminar capas de moderacion, comparando respuestas con el modelo base original.
- Generacion de texto creativo sin restricciones tematicas: util para escritura de ficcion, guiones o narrativa que aborde temas sensibles sin los rechazos tipicos de modelos alineados.
- Despliegue en dispositivos de borde: el tamano reducido (2-3 GB en Q4) permite integracion en entornos con recursos limitados mediante llama.cpp u Ollama.
- Chatbot de proposito general en ingles: adecuado para asistentes conversacionales simples donde no se requiera contexto muy largo ni capacidades avanzadas de razonamiento.
- Analisis de documentos y resumenes: con la cuantizacion Q8_0 (4,7 GB) se obtiene la mejor calidad dentro del formato GGUF para tareas de comprension y sintesis en ingles.
- Evaluacion de riesgos en produccion: sirve como caso de estudio para medir el impacto de modelos sin moderacion en pipelines reales antes de decidir su adopcion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3-4 GB con Q4_K_M, 5-6 GB con Q8_0, y alrededor de 9-10 GB con f16 (incluyendo overhead de contexto).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 para cuantizaciones altas; A100 o H100 no son necesarias para este tamano.
- Cabe en GPUs de consumo: si, desde una GTX 1660 6 GB con Q4_K_S hasta una RTX 4090 con f16.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependeran del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-Uncensored-v2-GGUF (este) | 4,3 B | no disponible | Apache 2.0 | GGUF | Ajuste uncensored, solo ingles |
| InterpreticAI/Qwen3.5-4B-Uncensored-v2 | 4,3 B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar |
| Qwen3.5-4B (original) | 4,3 B | no disponible | no disponible | safetensors | Modelo alineado con moderacion estandar |
| Meta Llama 3.2 3B Instruct | 3,2 B | 128 K | Llama 3.2 Community | safetensors, GGUF | Alternativa ligera multilingue |

La comparativa se limita a los datos disponibles; no se dispone de resultados de benchmarks que permitan una comparacion cuantitativa de rendimiento entre estos modelos.

## Limitaciones y advertencias

- El ajuste "uncensored" elimina parte de la moderacion del modelo original, lo que aumenta el riesgo de generar contenido ofensivo, sesgado o inapropiado en produccion.
- Riesgo de alucinacion inherente a modelos de 4 B de parametros; no se recomienda su uso en tareas que requieran alta fidelidad factual sin verificacion humana.
- Soporte limitado al ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- No se documenta la longitud de contexto, lo que impide planificar despliegues con ventanas largas.
- La licencia Apache 2.0 permite uso comercial, pero el integrador asume la responsabilidad legal sobre el contenido generado por un modelo sin moderacion.
- La ausencia de benchmarks publicos impide evaluar su calidad frente a alternativas del mismo tamano.
- El repositorio incluye archivos mmproj que sugieren vision, pero esta capacidad no esta confirmada ni documentada; no debe asumirse en produccion.
- El modelo base es un derivado no oficial de Qwen3.5; no cuenta con el respaldo del equipo original de Qwen.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.5-4B-Uncensored-v2-GGUF
- Modelo base: https://huggingface.co/InterpreticAI/Qwen3.5-4B-Uncensored-v2
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Qwen3.5-4B-Uncensored-v2-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.5-4B-Uncensored-v2-GGUF
- Solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
