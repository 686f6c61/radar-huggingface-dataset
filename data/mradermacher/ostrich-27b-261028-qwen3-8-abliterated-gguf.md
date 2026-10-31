# mradermacher/Ostrich-27B-261028-Qwen3.8-Abliterated-GGUF

## Resumen

Ostrich-27B-261028-Qwen3.8-Abliterated-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo etemiz/Ostrich-27B-261028-Qwen3.8-Abliterated, realizada por mradermacher, un cuantizador muy activo de la comunidad HuggingFace. El modelo base es una variante "abliterated" (con los mecanismos de rechazo alineado neutralizados) de un modelo de 27.320.697.856 parámetros, cuya denominación sugiere una base derivada de la familia Qwen3. El resultado es un modelo conversacional sin censura orientado, según las etiquetas del autor, a temas como salud, nutrición, ayuno, hierbas medicinales, fe, sanación, Bitcoin y Nostr.

La relevancia de esta ficha radica en la disponibilidad del modelo en múltiples niveles de cuantización (desde Q2_K con unos 11 GB hasta Q8_0 con 29,1 GB), lo que permite ejecutarlo en hardware muy variado, desde GPUs de consumo hasta estaciones de trabajo con VRAM abundante. Incluye además suplementos multimodales (mmproj), lo que indica que el modelo base incorpora capacidades de visión.

Debe subrayarse que se trata de un modelo abliterated y sin censura: se han eliminado intencionadamente sus salvaguardas de seguridad. Esto lo hace inadecuado para entornos de producción sin controles adicionales y plantea riesgos significativos, especialmente dado su enfoque temático en salud y medicina, donde respuestas sin filtrar pueden ser directamente perjudiciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de la familia Qwen3, según denominación; detalles no disponibles) |
| Parametros totales | 27.320.697.856 (≈27,3 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | inglés (declarado en la model card; el modelo base Qwen3 suele ser multilingue, pero no consta) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (esta repo); el modelo base está en safetensors |

## Arquitectura y entrenamiento

No se dispone de una model card técnica del modelo base con detalles de arquitectura, datos de entrenamiento o alineación. Por la denominación "Qwen3.8" y el tamaño de 27,3 B de parámetros, todo apunta a una base de la familia Qwen3 (arquitectura transformer decoder-only), pero no pueden confirmarse detalles como el número de capas, cabezas de atención, tipo de atención (GQA, etc.), tokens de entrenamiento ni composición del dataset.

El modificador clave es la "abliteración": una técnica post-entrenamiento que identifica y neutraliza las direcciones de activación responsables de los rechazos por alineación, eliminando así el comportamiento de negativa del modelo sin necesidad de reentrenamiento completo. El resultado es un modelo "uncensored" que responde a cualquier petición. Sobre este modelo base, mradermacher ha generado cuantizaciones estáticas en GGUF (convertidas desde safetensors mediante llama.cpp), incluyendo un archivo mmproj (suplemento multimodal) en Q8_0 y f16, lo que confirma capacidades de visión en el modelo original. También existe una versión con cuantizaciones weighted/imatrix en una repo hermana.

## Capacidades

- Generación de texto conversacional en inglés, sin los rechazos típicos de los modelos alineados (abliterated).
- Capacidades multimodales de visión, inferidas por la presencia de archivos mmproj (proyección multimodal) en las cuantizaciones.
- Etiquetado por el autor para dominios temáticos como salud, nutrición, hierbas medicinales, ayuno, fe, sanación, Bitcoin y Nostr, aunque no hay evidencia publicada de afinamiento específico en estos dominios.
- Compatibilidad con el ecosistema llama.cpp y derivados (Ollama, LM Studio, etc.) gracias al formato GGUF.
- Soporte de tool calling, agentes y capacidades de razonamiento: no disponible (no consta en la información proporcionada).

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve como sujeto de estudio para analizar cómo la abliteración modifica el comportamiento de un LLM de 27 B y qué riesgos introduce.
- Experimentación local sin restricciones de contenido: desarrolladores que necesiten un modelo que no rechace peticiones por política de contenido, por ejemplo para generar ficción con temáticas sensibles o para pruebas de red teaming.
- Ejecución en hardware de consumo: con la cuantización Q4_K_M (16,9 GB) cabe en una RTX 4090 de 24 GB, y con Q3_K_M (13,6 GB) en GPUs de 16 GB, facilitando pruebas locales.
- Asistentes conversacionales locales con visión: combinando el GGUF principal con el archivo mmproj, puede usarse en llama.cpp para conversación con imágenes.
- Discusión temática en dominios de nicho (Bitcoin, Nostr, nutrición): el autor lo orienta a estos temas, aunque debe recordarse que sus respuestas sobre salud no tienen validación médica.
- Benchmarking de cuantizaciones: comparar la degradación de calidad entre Q2_K y Q8_0 en un modelo de 27 B abliterated.

Advertencia transversal: al ser un modelo sin salvaguardas, cualquier despliegue orientado a usuarios finales requiere capas externas de filtrado y moderación, y no debe usarse como fuente de consejos médicos, nutricionales o financieros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache):
  - Q2_K: ~11 GB
  - Q3_K_M: ~13,6 GB
  - IQ4_XS: ~15,5 GB
  - Q4_K_M: ~16,9 GB
  - Q5_K_M: ~19,6 GB
  - Q6_K: ~22,5 GB
  - Q8_0: ~29,1 GB
  - Añadir 0,7–1,0 GB si se usa el suplemento mmproj, más la memoria del KV cache según la longitud de contexto.
- GPUs recomendadas: RTX 4090 (24 GB) para Q4_K_M/Q5_K_M; RTX 5090 (32 GB) o A100 40 GB para Q6_K/Q8_0; Q2_K–Q3_K_L caben en GPUs de 16 GB (RTX 4080/4060 Ti 16 GB) o pueden descargarse parcialmente a CPU/RAM.
- Consumer GPUs: sí. Q4_K_M (16,9 GB) funciona cómodamente en una RTX 4090; Q3_K_M (13,6 GB) en GPUs de 16 GB; también es viable en Apple Silicon con 24–32 GB de memoria unificada.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, koboldcpp; también servidores compatibles con GGUF como llama-swap. No es un GGUF apto directamente para vLLM o TGI en su formato actual (requeriría los pesos safetensors del modelo base).
- Latencia y throughput: no disponible; en GPUs modernas con offload completo, un modelo de 27 B en Q4_K_M suele alcanzar velocidades de decodificación prácticas para uso interactivo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Particularidad |
|---|---|---|---|---|
| Ostrich-27B-261028-Qwen3.8-Abliterated-GGUF | 27,3 B | GGUF (Q2_K–Q8_0) | Apache 2.0 | Abliterated, uncensored, con mmproj |
| Qwen3-30B-A3B (base, referencia) | 30,5 B (3,3 B activos) | safetensors/GGUF | Apache 2.0 | MoE, alineado, con thinking mode |
| Dolphin 3.0 (basado en Qwen, ~24–32 B) | ~24–32 B según variante | safetensors/GGUF | Variada | Uncensored mediante fine-tuning, no abliteración |

La diferencia principal frente a alternativas "uncensored" como Dolphin es el método: la abliteración modifica los pesos para neutralizar los rechazos sin reentrenamiento, mientras que Dolphin emplea fine-tuning con datasets sin alineación. Frente al Qwen3 base, esta variante pierde las salvaguardas pero conserva presumiblemente las capacidades generales. No hay datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- Modelo abliterated: carece de salvaguardas de seguridad. Puede generar contenido dañino, ilegal o inapropiado sin rechazarlo. No apto para producción sin capas externas de moderación.
- Riesgo especialmente grave en dominios de salud y nutrición (temas anunciados en las etiquetas): las respuestas no tienen validación clínica y la ausencia de rechazos puede producir consejos médicos peligrosos.
- Riesgo de alucinación inherente a cualquier LLM, agravado por la ausencia de mecanismos de cautela tras la abliteración.
- Idioma declarado: inglés. El rendimiento en castellano no está documentado, aunque las bases Qwen suelen ser multilingues.
- Longitud de contexto no documentada en esta repo; debe consultarse la config del modelo base.
- La abliteración puede degradar sutilmente la calidad general del modelo respecto a su base alineada; no hay evaluaciones publicadas que lo cuantifiquen.
- Las cuantizaciones bajas (Q2_K, Q3_K_S) implican pérdida de calidad notable en un modelo de este tamaño.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume toda la responsabilidad legal sobre los contenidos generados.
- No hay benchmarks publicados ni model card técnica del modelo base, lo que dificulta evaluar su calidad real.

## Enlaces

- Repo GGUF (cuantizaciones estáticas): https://huggingface.co/mradermacher/Ostrich-27B-261028-Qwen3.8-Abliterated-GGUF
- Repo GGUF weighted/imatrix: https://huggingface.co/mradermacher/Ostrich-27B-261028-Qwen3.8-Abliterated-i1-GGUF
- Modelo base: https://huggingface.co/etemiz/Ostrich-27B-261028-Qwen3.8-Abliterated
- Página de descargas de mradermacher: https://hf.tst.eu/model#Ostrich-27B-261028-Qwen3.8-Abliterated-GGUF
- Guía de uso de GGUF (referenciada en la model card): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador (nethype GmbH): https://www.nethype.de/
