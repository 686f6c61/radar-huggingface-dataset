# mradermacher/Arete-27B-Unlocked-Uncensored-Heretic-i1-GGUF

## Resumen

Arete-27B-Unlocked-Uncensored-Heretic-i1-GGUF es la versión cuantizada en formato GGUF de un modelo de lenguaje de 27B parámetros derivado de SolsticeAI/Arete-27B-Unlocked-Uncensored-Heretic. El trabajo de cuantización lo firma mradermacher, un conocido publicador de cuantizaciones GGUF en Hugging Face, y emplea cuantización con matriz de importancia (imatrix) para preservar la calidad en los niveles bajos de bits. El modelo base se presenta como un ajuste fino supervisado orientado a la alineación de valores, con las etiquetas "heretic", "uncensored", "decensored" y "abliterated", lo que indica que se ha sometido a un proceso de eliminación o atenuación de los mecanismos de rechazo típicos de los modelos alineados convencionalmente.

La relevancia de esta ficha radica en que permite ejecutar un modelo de ~27B en hardware de consumo mediante cuantizaciones que van desde 10,8 GB (i1-Q2_K) hasta 16,6 GB (i1-Q4_K_M), manteniendo la licencia Apache 2.0 del modelo original. El repositorio incluye además un archivo imatrix para que terceros puedan generar sus propias cuantizaciones y una colección de cuantizaciones estáticas en un repositorio hermano.

No se dispone de información pública sobre la arquitectura interna, la longitud de contexto, los datos de entrenamiento ni los resultados de benchmarks del modelo base en la información proporcionada; esta ficha se limita a documentar lo que consta en la model card y en los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base etiquetado como transformers; presumiblemente transformer decoder-only, sin confirmar) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_XXS, i1-IQ3_M, i1-Q3_K_M, i1-Q4_K_S, i1-Q4_K_M (y otras disponibles en el repositorio estático: Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, IQ3_XS, IQ3_S, IQ3_L, Q3_K_S, Q3_K_L, Q4_0, Q4_1, IQ4_XS, IQ4_NL, Q5_K_S, Q5_K_M, Q6_K) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con archivo imatrix adicional; el modelo base está en safetensors/transformers) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base. Los metadatos indican que se trata de un modelo de la familia transformers con 26,9B parámetros y que ha sido objeto de un ajuste fino supervisado (supervised-fine-tuning) sobre el dataset NousResearch/arete-data-pairs, orientado a la alineación de valores (value-alignment). Las etiquetas "heretic", "uncensored", "decensored" y "abliterated" sugieren que el modelo ha pasado por un proceso de abliteración o eliminación de direcciones de rechazo, si bien no se especifica la metodología exacta ni el número de tokens de entrenamiento.

El repositorio cuantizado aplica cuantización con matriz de importancia (imatrix) generada a partir de datos de calibración, lo que mejora la fidelidad de los pesos cuantizados respecto a las cuantizaciones estáticas. La model card menciona que se trata de un modelo de visión y que los archivos mmproj, si existen, se encuentran en el repositorio estático; no obstante, no se aportan detalles sobre el codificador visual ni sobre el entrenamiento multimodal.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta "conversational" del repositorio.
- Ajuste fino supervisado orientado a alineación de valores, según los metadatos del modelo base.
- Comportamiento "uncensored"/"abliterated": se ha atenuado o eliminado el sesgo de rechazo típico de los modelos alineados, lo que permite respuestas a peticiones que otros modelos rechazarían.
- Posible soporte de visión: la model card indica que es un modelo de visión y remite a los archivos mmproj del repositorio estático, aunque no se detalla la naturaleza de dicha capacidad.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo language.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación sobre alineación y abliteración: el modelo permite estudiar empíricamente cómo afecta la eliminación de direcciones de rechazo al comportamiento del modelo, comparando sus respuestas con las del modelo base alineado en tareas sensibles.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que aborde temas que los modelos alineados convencionalmente rechazan, aprovechando el carácter "uncensored" del ajuste.
- Despliegue en hardware de consumo: con cuantizaciones de 10,8 a 16,6 GB, el modelo puede ejecutarse en GPUs de consumo de 16-24 GB de VRAM mediante llama.cpp u Ollama, lo que facilita prototipado local sin infraestructura de datacenter.
- Evaluación comparativa de cuantizaciones: el archivo imatrix y la variedad de niveles de cuantización permiten medir la degradación de calidad (perplejidad, coherencia) entre i1-Q2_K e i1-Q4_K_M en un mismo modelo de ~27B.
- Generación de datos sintéticos: en pipelines de destilación o aumento de datos donde se requiere un modelo generador con baja tasa de rechazos, el modelo puede producir pares pregunta-respuesta sobre dominios amplios en inglés.
- Experimentación con modelos de visión (si se confirma el soporte mmproj): uso del modelo como base para tareas imagen-texto en entornos de investigación, cargando los archivos mmproj del repositorio estático en llama.cpp.
- Fine-tuning posterior: al estar disponible en GGUF y con licencia Apache 2.0, sirve como base para LoRA o ajustes adicionales en flujos de trabajo que requieran un modelo de ~27B sin restricciones de rechazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de cuantización):
  - i1-Q2_K: ~10,8 GB de pesos; ~12-13 GB de VRAM con overhead de contexto.
  - i1-IQ3_XXS: ~11,3 GB; ~13 GB de VRAM.
  - i1-IQ3_M: ~12,7 GB; ~14 GB de VRAM.
  - i1-Q3_K_M: ~13,4 GB; ~15 GB de VRAM.
  - i1-Q4_K_S: ~15,7 GB; ~17 GB de VRAM.
  - i1-Q4_K_M: ~16,6 GB; ~18 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M con contexto moderado; RTX 4080/4070 Ti Super (16 GB) para IQ3_M o Q4_K_S con contexto reducido; A100/H100 para despliegues de mayor contexto o batch.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB o más con cuantizaciones IQ3/Q4; en 12 GB solo con Q2_K y contexto limitado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base es compatible con transformers y endpoints.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Arete-27B-Unlocked-Uncensored-Heretic (i1-GGUF) | ~26,9B | no disponible | Apache 2.0 | GGUF | Cuantización imatrix de un modelo abliterated/uncensored |
| Modelo base SolsticeAI/Arete-27B-Unlocked-Uncensored-Heretic | ~26,9B | no disponible | Apache 2.0 | safetensors | Origen del que derivan estas cuantizaciones |
| Cuantizaciones estáticas mradermacher/Arete-27B-Unlocked-Uncensored-Heretic-GGUF | ~26,9B | no disponible | Apache 2.0 | GGUF | Misma familia, sin imatrix; incluye posibles archivos mmproj |

No se dispone de datos de benchmarks ni de especificaciones de contexto que permitan una comparación cuantitativa con alternativas de otros autores.

## Limitaciones y advertencias

- El modelo está ajustado para eliminar o atenuar los mecanismos de rechazo ("uncensored", "abliterated"), lo que aumenta el riesgo de generar contenido dañino, ilegal o socialmente inapropiado sin las salvaguardas habituales.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual; al ser un ajuste fino supervisado sin datos de RLHF documentados, la tasa de alucinación es desconocida.
- Idiomas: el modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto: no documentada, lo que impide planificar despliegues con ventanas largas sin validación empírica.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume la responsabilidad legal sobre el contenido generado y sobre el cumplimiento de las normativas aplicables (por ejemplo, la Ley de IA de la UE).
- Las cuantizaciones de 2-3 bits (i1-Q2_K, i1-IQ3_XXS) degradan la calidad de forma notable; la propia model card recomienda IQ3_XXS sobre Q2_K y Q4_K_M como opción rápida y recomendada.
- La capacidad de visión no está confirmada en este repositorio; los archivos mmproj, si existen, residen en el repositorio estático y deben verificarse antes de asumir soporte multimodal.
- No se dispone de información sobre sesgos demográficos, de género o culturales del modelo base.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Arete-27B-Unlocked-Uncensored-Heretic-i1-GGUF
- Modelo base: https://huggingface.co/SolsticeAI/Arete-27B-Unlocked-Uncensored-Heretic
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Arete-27B-Unlocked-Uncensored-Heretic-GGUF
- Página de overview del autor: https://hf.tst.eu/model#Arete-27B-Unlocked-Uncensored-Heretic-i1-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/NousResearch/arete-data-pairs
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
