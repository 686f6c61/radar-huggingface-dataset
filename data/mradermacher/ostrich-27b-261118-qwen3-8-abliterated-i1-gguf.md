# mradermacher/Ostrich-27B-261118-Qwen3.8-Abliterated-i1-GGUF

## Resumen

Ostrich-27B-261118-Qwen3.8-Abliterated-i1-GGUF es una redistribución en formato GGUF del modelo etemiz/Ostrich-27B-261118-Qwen3.8-Abliterated, publicada por mradermacher con cuantizaciones ponderadas mediante imatrix. Se trata de un modelo de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) derivado de la familia Qwen3, según indica el nombre, y sometido a un proceso de "abliteration" que elimina o atenúa los mecanismos de rechazo del modelo original. El autor de las cuantizaciones, mradermacher, es un conocido distribuidor de versiones GGUF de modelos open source, y en este caso ofrece el modelo en una amplia gama de tipos de cuantización, desde Q2_K hasta Q6_K, con variantes IQ.

El modelo está etiquetado como multimodal (el autor indica explícitamente "This is a vision model"), lo que implica la existencia de archivos mmproj en el repositorio estático para el procesamiento de imágenes. La licencia declarada es Apache 2.0, y el único idioma listado es el inglés. El repositorio tiene un tamaño de 218,6 GB, lo que refleja la suma de todos los archivos de cuantización disponibles, no el peso de un único archivo.

La relevancia de esta ficha radica en que se trata de un modelo "uncensored" orientado a casos de uso sin restricciones de contenido, con temáticas declaradas como salud, nutrición, hierbas medicinales, ayuno, fe, bitcoin y nostr. Es importante señalar que la información disponible es escasa: no se detallan datos de entrenamiento, arquitectura interna ni resultados de benchmarks, por lo que muchas especificaciones se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (derivado de Qwen3 según el nombre; se desconoce si es transformer denso o MoE) |
| Parámetros totales | 27.320.697.856 (≈27,3 B) |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (además de archivo imatrix) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base en safetensors está en el repositorio de origen |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación proporcionada. El nombre "Qwen3.8" sugiere que deriva de la familia Qwen3, pero no se confirma si se trata de un transformer denso, un modelo de mezcla de expertos (MoE) o una arquitectura híbrida. Tampoco se especifican el número de capas, la dimensión de los embeddings ni el mecanismo de atención empleado.

En cuanto al entrenamiento, no hay datos sobre el número de tokens, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o similares. Lo que sí se documenta es el proceso de "abliteration" aplicado por etemiz, que consiste en modificar los pesos para eliminar la dirección de rechazo aprendida durante el alineamiento, dando como resultado un modelo "uncensored". Las cuantizaciones de mradermacher utilizan imatrix (importance matrix) para ponderar la cuantización y preservar mejor la calidad en tipos de baja precisión, y el autor indica que las variantes IQ suelen ser preferibles a las no-IQ de tamaño similar. El modelo se describe como multimodal (visión), con archivos mmproj disponibles en el repositorio estático.

## Capacidades

- Generación de texto conversacional en inglés, con modo conversacional declarado en los tags.
- Capacidades de visión, según la indicación del autor de que se trata de un modelo multimodal con archivos mmproj.
- Comportamiento "uncensored" y "abliterated": ausencia o reducción de los mecanismos de rechazo del modelo original.
- Temáticas declaradas en los tags: salud, nutrición, hierbas medicinales, ayuno, fe, curación, bitcoin y nostr.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Asistencia conversacional sin restricciones temáticas: el modelo puede mantener diálogos multi-turno sobre temas que los modelos alineados suelen rechazar, gracias a su naturaleza abliterated; adecuado para investigación sobre comportamiento de modelos y para aplicaciones donde el filtrado excesivo es un problema.
- Consultas sobre nutrición y ayuno: los tags del modelo apuntan a este dominio; puede emplearse como asistente informativo para preguntas sobre dietas, ayuno intermitente y alimentación, siempre con supervisión humana y sin sustituir consejo médico profesional.
- Información sobre hierbas medicinales: útil para explorar conocimiento etnobotánico y usos tradicionales, con las advertencias sanitarias correspondientes.
- Procesamiento de imágenes con contexto textual: al ser un modelo de visión, puede describir o analizar imágenes acompañadas de preguntas en inglés, por ejemplo en tareas de catalogación o accesibilidad.
- Experimentación con cuantizaciones en hardware de consumo: las variantes Q4_K_M (16,9 GB) y Q4_K_S (15,9 GB) permiten ejecutar un modelo de 27 B en GPUs de consumo con 24 GB de VRAM, lo que facilita prototipado local sin infraestructura de datacenter.
- Investigación sobre alineamiento y seguridad: comparar las respuestas del modelo abliterated frente al original permite estudiar cómo el proceso de eliminación de rechazo afecta a la calidad, la coherencia y los sesgos.
- Aplicaciones en el ecosistema bitcoin/nostr: los tags sugieren un enfoque hacia comunidades de estas tecnologías; podría integrarse en bots conversacionales para dichos entornos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de archivo GGUF): desde ~11,0 GB (i1-Q2_K) hasta ~22,5 GB (i1-Q6_K); la opción recomendada i1-Q4_K_M ocupa 16,9 GB y la i1-Q4_K_S 15,9 GB.
- GPU recomendadas: para las cuantizaciones Q4 es necesario al menos 24 GB de VRAM (RTX 3090, RTX 4090, A10G, L4 con 24 GB). Para Q5 y Q6 se recomienda 24-32 GB (A100 40 GB, RTX A6000, L40S). Las cuantizaciones Q2 y Q3 pueden caber en GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080).
- ¿Cabe en GPU de consumo? Sí, las variantes Q4 caben en una RTX 4090 o RTX 3090 de 24 GB; las variantes Q2/Q3 caben en GPUs de 12-16 GB con posibles desbordamientos a RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; para el modelo base en safetensors, vLLM o TGI (no confirmado para esta variante).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ostrich-27B-261118-Qwen3.8-Abliterated-i1-GGUF | 27,3 B | No disponible | Apache 2.0 | GGUF (i1) | Abliterated, multimodal, solo inglés |
| etemiz/Ostrich-27B-261118-Qwen3.8-Abliterated (base) | 27,3 B | No disponible | Apache 2.0 | Safetensors | Modelo de origen sin cuantizar |
| mradermacher/Ostrich-27B-261118-Qwen3.8-Abliterated-GGUF (estático) | 27,3 B | No disponible | Apache 2.0 | GGUF (estático) | Cuantizaciones estáticas del mismo modelo, incluye mmproj |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El proceso de abliteration puede degradar la coherencia, la calidad del razonamiento y la utilidad general del modelo en comparación con el original alineado; no hay benchmarks que lo confirmen.
- Modelo "uncensored": puede generar contenido dañino, ilegal o inexacto sin filtros; no es adecuado para aplicaciones de cara al público sin moderación adicional.
- Riesgo elevado de alucinación, especialmente en dominios de salud, nutrición y hierbas medicinales, donde las respuestas no deben tomarse como consejo médico.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está garantizado.
- Longitud de contexto desconocida, lo que impide planificar aplicaciones que requieran ventanas largas.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías y la responsabilidad sobre el contenido generado recae en el desplegador.
- La información sobre arquitectura, entrenamiento y benchmarks es muy limitada; la ficha se basa en los metadatos del repositorio y la model card, que no detallan estos aspectos.
- El repositorio tiene 218,6 GB; conviene descargar solo el archivo de cuantización necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Ostrich-27B-261118-Qwen3.8-Abliterated-i1-GGUF
- Modelo base: https://huggingface.co/etemiz/Ostrich-27B-261118-Qwen3.8-Abliterated
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Ostrich-27B-261118-Qwen3.8-Abliterated-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Ostrich-27B-261118-Qwen3.8-Abliterated-i1-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor: https://www.nethype.de/
