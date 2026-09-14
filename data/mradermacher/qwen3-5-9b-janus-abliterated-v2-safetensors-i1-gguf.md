# mradermacher/Qwen3.5-9B-Janus-Abliterated-V2-Safetensors-i1-GGUF

## Resumen

Qwen3.5-9B-Janus-Abliterated-V2-Safetensors-i1-GGUF es la versión cuantizada en formato GGUF del modelo SOMEHOTMEAL/Qwen3.5-9B-Janus-Abliterated-V2-Safetensors, publicada por el usuario mradermacher, especializado en la generación de cuantizaciones con imatrix para llama.cpp. El modelo original es un merge de la familia Qwen3.5 de aproximadamente 8.951.812.608 parámetros (unos 8,95B) que ha sido sometido a un proceso de "abliteration" (eliminación de las direcciones de rechazo del alineamiento de seguridad), lo que da lugar a un modelo sin censura orientado a roleplay y conversación.

El repositorio contiene 24 variantes de cuantización con pesos imatrix, desde IQ1_S (2,8 GB) hasta Q6_K, además del fichero imatrix para generar cuantizaciones propias. La model card indica que se trata de un modelo de visión, y que los ficheros mmproj, si existen, se encuentran en el repositorio estático asociado. La licencia declarada es Apache 2.0.

Es relevante ahora porque combina tres tendencias del ecosistema open source: los merges comunitarios sobre arquitecturas punteras, los modelos "abliterated" sin alineamiento de seguridad, y la distribución en GGUF con cuantizaciones de muy baja precisión (por debajo de 4 bits) que permiten ejecutar un modelo de casi 9B en hardware de consumo. No obstante, no se han publicado resultados de benchmarks ni datos de entrenamiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo derivado de la familia Qwen3.5; la model card lo describe como modelo de visión, con ficheros mmproj en el repositorio estático) |
| Parametros totales | 8.951.812.608 (~8,95B) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, i1-IQ3_S; más el fichero imatrix |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se proporcionan detalles sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. El identificador del modelo base (SOMEHOTMEAL/Qwen3.5-9B-Janus-Abliterated-V2-Safetensors) indica que se trata de un derivado de la familia Qwen3.5 de 9B de parámetros, sometido a un proceso de "abliteration" que elimina o atenúa las direcciones latentes responsables del rechazo de peticiones, y posteriormente fusionado (merge) con otros pesos para dar lugar a la variante "Janus-Abliterated-V2".

El único detalle técnico documentado en la model card es el proceso de cuantización: se han generado cuantizaciones estáticas y cuantizaciones i1 con imatrix (quantize_version 2, output_tensor_quantised 1, convert_type hf), lo que implica el uso de una matriz de importancia para minimizar la pérdida de calidad en precisiones bajas. La model card indica además que se trata de un modelo de visión y que los ficheros mmproj, si existen, se alojan en el repositorio estático. No se documenta ninguna innovación arquitectónica adicional como decodificación especulativa, atención lineal o arquitecturas híbridas.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como "conversational" y orientado a diálogo multi-turno.
- Roleplay: las etiquetas "roleplay" y "uncensored" indican un ajuste enfocado a la interpretación de personajes y a respuestas sin filtros de seguridad.
- Sin alineamiento de rechazo: al ser "abliterated", no aplica las direcciones de rechazo típicas de los modelos alineados, por lo que responde a peticiones que otros modelos declinarían.
- Posible soporte de visión: la model card lo describe explícitamente como modelo de visión, con ficheros mmproj en el repositorio estático, pero no se detalla qué tareas visuales soporta.
- Idiomas: únicamente inglés declarado en los metadatos.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Roleplay conversacional sin restricciones: el modelo está específicamente entrenado y fusionado para interpretar personajes y mantener diálogos extensos sin las negativas habituales de los modelos alineados, lo que lo hace adecuado para aplicaciones de ficción interactiva y narrativa.
- Generación de contenido creativo sin filtros: útil para escribir guiones, relatos o material de ficción que aborde temáticas que los modelos con alineamiento estándar suelen rechazar.
- Experimentación en investigación sobre alineamiento: como modelo "abliterated" permite estudiar cómo varía el comportamiento del modelo al eliminar las direcciones de rechazo, comparándolo con la versión base alineada.
- Despliegue en hardware de consumo: gracias a las cuantizaciones i1-IQ1_S (2,8 GB) e i1-Q4_K_S (5,5 GB), es posible ejecutar el modelo en GPU de gama media o incluso en CPU mediante llama.cpp, lo que facilita prototipado local sin infraestructura en la nube.
- Chatbot local privado: al poder ejecutarse íntegramente en local con llama.cpp u Ollama, permite mantener conversaciones sin enviar datos a servicios externos, aunque con la advertencia de que se trata de un modelo sin filtros de seguridad.
- Evaluación de calidad de cuantizaciones: el repositorio incluye 24 variantes de cuantización del mismo modelo, lo que lo convierte en un banco de pruebas para medir el impacto de la precisión (de IQ1_S a Q6_K) en la calidad de las respuestas.
- Base para merges o fine-tuning posteriores: al estar publicado con licencia Apache 2.0 y disponible en safetensors en el repositorio base, puede servir como punto de partida para nuevos merges o ajustes específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada según las cuantizaciones publicadas (tamaños reales de los ficheros): i1-IQ1_S 2,8 GB; i1-IQ1_M 3,0 GB; i1-IQ2_XXS 3,2 GB; i1-IQ2_XS 3,4 GB; i1-IQ2_S 3,5 GB; i1-IQ2_M 3,7 GB; i1-Q2_K_S 3,8 GB; i1-Q2_K 3,9 GB; i1-IQ3_XXS 4,0 GB; i1-IQ3_XS 4,3 GB; i1-Q3_K_S 4,4 GB; i1-IQ3_S 4,5 GB; i1-IQ3_M 4,5 GB; i1-Q3_K_M 4,7 GB; i1-Q3_K_L 5,0 GB; i1-IQ4_XS 5,3 GB; i1-Q4_0 5,4 GB; i1-Q4_K_S 5,5 GB; i1-IQ4_NL 5,5 GB; i1-Q4_K_M 5,7 GB.
- GPU recomendadas: no disponibles de forma explícita. Por tamaño, las cuantizaciones de 4 bits (en torno a 5,5-5,7 GB) caben en tarjetas de consumo como RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4070 o superiores; las cuantizaciones Q6_K requieren previsiblemente algo más de 7 GB.
- Cabe en GPU de consumo: sí, al menos las variantes comprendidas entre IQ1_S y Q4_K_M (2,8-5,7 GB). Las cuantizaciones más bajas permiten incluso su ejecución en GPUs con 4 GB de VRAM o en CPU con memoria RAM suficiente.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, text-generation-webui, koboldcpp y cualquier runtime compatible con GGUF e imatrix. También es posible usar el modelo base en transformers con safetensors.
- Latencia y throughput estimados: no disponibles. Dependen del hardware, de la cuantización elegida y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/Qwen3.5-9B-Janus-Abliterated-V2-Safetensors-i1-GGUF | ~8,95B | No disponible | GGUF (24 cuantizaciones imatrix) | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| mradermacher/Qwen3.5-9B-Janus-Abliterated-V2-Safetensors-GGUF | ~8,95B | No disponible | GGUF (cuantizaciones estáticas) | Apache 2.0 | HuggingFace |
| SOMEHOTMEAL/Qwen3.5-9B-Janus-Abliterated-V2-Safetensors | ~8,95B | No disponible | safetensors | Apache 2.0 | HuggingFace (modelo base) |

No se dispone de información sobre modelos comparables de otros autores (mismo tamaño o misma tarea) en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo sin alineamiento de seguridad: la etiqueta "abliterated" y "uncensored" implican que se han eliminado las direcciones de rechazo, por lo que puede generar contenido ofensivo, ilegal o peligroso sin filtros. No es apto para aplicaciones orientadas al público general.
- Etiqueta "not-for-all-audiences": el propio autor clasifica el modelo como no apto para todas las audiencias.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad factual; al ser un merge cuantizado a precisiones muy bajas, la coherencia puede degradarse especialmente en las variantes IQ1 e IQ2.
- Idiomas: solo se declara inglés; no hay evidencia de soporte multilingüe, por lo que el rendimiento en castellano no está garantizado.
- Longitud de contexto: no disponible, lo que impide planificar aplicaciones que requieran ventanas extensas.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías y el contenido generado puede violar políticas de plataformas o legislación según el caso de uso.
- Cuantizaciones de muy baja precisión: las variantes IQ1_S, IQ1_M, IQ2_XXS y Q2_K_S están etiquetadas por el propio autor como "for the desperate", "mostly desperate", "very low quality" o "lower quality". Su uso degrada notablemente la calidad.
- Ficheros mmproj: la model card advierte de que, si existen, están en el repositorio estático, no en este. Sin ellos no puede utilizarse la capacidad de visión.
- Adopción nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay retroalimentación de la comunidad sobre su comportamiento real.
- Datos de entrenamiento desconocidos: se desconoce la composición del dataset, los tokens de entrenamiento y el proceso de alineamiento, lo que dificulta evaluar sesgos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.5-9B-Janus-Abliterated-V2-Safetensors-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/Qwen3.5-9B-Janus-Abliterated-V2-Safetensors-GGUF
- Modelo base: https://huggingface.co/SOMEHOTMEAL/Qwen3.5-9B-Janus-Abliterated-V2-Safetensors
- Página de resumen del autor: https://hf.tst.eu/model#Qwen3.5-9B-Janus-Abliterated-V2-Safetensors-i1-GGUF
- Referencia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
