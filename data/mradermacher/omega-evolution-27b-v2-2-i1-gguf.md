# mradermacher/Omega-Evolution-27B-v2.2-i1-GGUF

## Resumen

Omega-Evolution-27B-v2.2 es un modelo de lenguaje de 27 000 millones de parámetros desarrollado por ReadyArt y distribuido en formato GGUF por mradermacher. Está orientado a tareas de rol, interacción conversacional y contenido explícito, y se presenta como un modelo sin alineación (unaligned) y sin censura, lo que lo sitúa en una categoría de uso especializada y restringida. El modelo base se publica bajo licencia Apache 2.0, aunque la model card incluye etiquetas adicionales que sugieren restricciones de uso.

La versión que nos ocupa es la cuantización i1 (imatrix) del modelo base, que reduce el tamaño de los pesos para facilitar su despliegue en hardware de consumo. Se distribuye en formato GGUF y es compatible con herramientas como llama.cpp, Ollama o LM Studio. Su relevancia radica en que ofrece una alternativa de 27B parámetros para escenarios de rol y ERP con requisitos de VRAM moderados, aunque su uso comercial y ético debe evaluarse con cautela.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base sin especificar) |
| Parámetros totales | 27 320 697 856 |
| Parámetros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-Q2_K (11,0 GB), i1-IQ3_M (12,9 GB), i1-Q4_K_S (15,9 GB) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 (según metadata; la model card incluye etiqueta "Other License" y advertencias de uso) |
| Formato de pesos | GGUF (con archivo imatrix para cuantización adicional) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base. Por el tamaño (27B parámetros) y el formato GGUF, es plausible que se trate de un transformer decoder-only, pero no se ha confirmado. Tampoco se conocen los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO). La model card del cuantizador indica que es un modelo de visión (vision model) y menciona archivos mmproj en el repositorio estático, lo que sugiere que el modelo base podría tener capacidades multimodales, aunque no se detalla su implementación.

## Capacidades

- Generación de texto en inglés con foco en roleplay y conversación multimodal (posiblemente con entrada de imágenes, dado que se menciona mmproj).
- Contenido explícito, sin censura y sin alineación (etiquetas "nsfw", "explicit", "unaligned", "dangerous", "ERP").
- Conversacional y orientado a interacción multi-turno.
- No se especifican capacidades de tool calling, razonamiento matemático o generación de código en la información disponible.
- La variante cuantizada GGUF permite despliegue en entornos con VRAM limitada.

## Casos de uso

- **Roleplay y narrativa interactiva**: el modelo está diseñado para mantener conversaciones prolongadas con contexto narrativo, lo que lo hace adecuado para juegos de rol por texto o simulaciones de personajes en entornos de entretenimiento.
- **Generación de contenido creativo**: puede emplearse para redactar historias, diálogos o escenas con tono explícito, aunque su uso debe restringirse a entornos legales y éticos.
- **Investigación sobre modelos sin alineación**: los investigadores pueden analizar su comportamiento en escenarios de seguridad y alineación, comparándolo con modelos censurados.
- **Despliegue en hardware modesto**: gracias a las cuantizaciones Q4_K_S (15,9 GB), puede ejecutarse en GPUs de consumo con 16 GB de VRAM, como la RTX 4080, para pruebas locales.
- **Pruebas de compatibilidad con herramientas de inferencia**: es un caso de prueba para evaluar el rendimiento de GGUF en llama.cpp, Ollama o vLLM con modelos de 27B.
- **Aplicaciones de visión por computador (si se confirma la capacidad multimodal)**: el archivo mmproj permitiría tareas de descripción de imágenes o generación de contenido visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con la cuantización i1-Q4_K_M (15,9 GB), se necesita al menos 16 GB de VRAM para cargar el modelo en GPU; las versiones Q2_K (11,0 GB) e IQ3_M (12,9 GB) requieren menos, aunque con menor calidad.
- **GPU recomendadas**: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB o H100 para mayor velocidad; en GPUs de 16 GB (como RTX 4080) se puede usar Q4_K_M con offloading parcial.
- **Compatibilidad con GPU de consumo**: sí, con cuantizaciones Q2_K_M o IQ3_M se puede ejecutar en tarjetas de 12 GB (RTX 3060) o 16 GB (RTX 4080).
- **Opciones de despliegue**: llama.cpp, Ollama, vLLM, text-generation-webui, o cualquier frontend compatible con GGUF.
- **Latencia y throughput**: no disponibles; dependerá de la GPU, la cuantización y el backend (p. ej., llama.cpp en CPU/GPU).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos en la documentación proporcionada. Dado el tamaño de 27B, se podrían comparar con Mistral 7B, Llama 3 8B o Qwen 2.5 32B, pero no se han publicado datos de rendimiento para Omega-Evolution-27B-v2.2 que permitan una comparación objetiva. Se indica "no disponible".

## Limitaciones y advertencias

- **Contenido sin censura y potencialmente peligroso**: el modelo está etiquetado como "nsfw", "explicit", "dangerous" y "ERP", lo que implica que puede generar contenido sexual explícito, violento o ilegal; su uso debe limitarse a entornos de investigación con control ético.
- **Riesgo de alucinación**: al ser un modelo sin alineación, puede generar información falsa o dañina con mayor facilidad que modelos alineados.
- **Sesgos**: no se documentan sesgos específicos, pero al ser un modelo no alineado, es probable que refleje los sesgos de su dataset de entrenamiento sin filtros.
- **Restricciones de licencia**: aunque la licencia es Apache 2.0 en la metadata, la model card incluye la etiqueta "Other License" y advertencias sobre el contenido, por lo que el uso comercial y la distribución pueden estar sujetos a restricciones adicionales no detalladas.
- **Falta de documentación**: no se han publicado datos de entrenamiento, arquitectura, benchmarks ni evaluación de seguridad, lo que limita su uso en producción sin validación previa.
- **Idioma**: solo inglés; no hay soporte multilingüe.
- **Contexto**: se desconoce la longitud de contexto soportada, lo que puede afectar a tareas que requieran ventanas largas.

## Enlaces

- Repositorio del cuantizador: https://huggingface.co/mradermacher/Omega-Evolution-27B-v2.2-i1-GGUF
- Repositorio estático de cuantizaciones: https://huggingface.co/mradermacher/Omega-Evolution-27B-v2.2-GGUF
- Modelo base (según la model card): https://huggingface.co/ReadyArt/Omega-Evolution-27B-v2.2
- Página de descargas del cuantizador: https://hf.tst.eu/model#Omega-Evolution-27B-v2.2-i1-GGUF
- Guía de uso de GGUF de TheBloke (referencia): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF

Nota: no se han encontrado papers, blogs o demos oficiales sobre el modelo base.
