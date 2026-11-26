# mradermacher/grok-oss-Apollyon-8B-i1-GGUF

## Resumen

Grok-oss-Apollyon-8B-i1-GGUF es una cuantización en formato GGUF del modelo Apollyon-8B, publicada por el usuario mradermacher. El modelo original, alojado en el repositorio c4tdr0ut/Apollyon-8B, es un fine-tune de 8.030.261.312 parámetros (aproximadamente 8B) construido sobre una base de la familia Llama y orientado, según las etiquetas del autor, a un comportamiento "unhinged", "unaligned" y "abliterated", es decir, con las capas de rechazo eliminadas o atenuadas mediante técnicas de abliteration. Incorpora además etapas de SFT y DPO según los tags del repositorio.

El modelo se distribuye exclusivamente en inglés y su licencia figura como "other", lo que obliga a consultar los términos del modelo base antes de cualquier uso comercial. La relevancia de esta ficha radica en que mradermacher ofrece una batería completa de cuantizaciones con calibración imatrix (i1), desde IQ1_S de 2,1 GB hasta Q6_K de 6,7 GB, lo que permite ejecutar un modelo de 8B en hardware de consumo muy modesto.

Esta publicación es una cuantización, no un modelo nuevo: no aporta mejoras de capacidad respecto al original, sino que facilita el despliegue local mediante llama.cpp y derivados. El repositorio ocupa 93,8 GB en total y acumula 835 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, según tags del repositorio) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, más fichero imatrix |
| Idiomas soportados | inglés (en) |
| Licencia | other |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors |
| Tamano del repositorio | 93,8 GB |
| Modelo base | c4tdr0ut/Apollyon-8B |
| Cuantizador | mradermacher |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de las etiquetas del repositorio, que apuntan a un transformer decoder-only de la familia Llama con 8.030.261.312 parámetros. El modelo base Apollyon-8B se presenta con etapas de SFT y DPO en su pipeline de entrenamiento, y con técnicas de abliteration aplicadas para reducir los comportamientos de rechazo. No se especifican el número de tokens de entrenamiento, la composición del dataset ni los detalles del proceso de alineación.

La contribución técnica de esta publicación es la cuantización con calibración imatrix (denominada i1 por mradermacher), que utiliza una matriz de importancia calculada sobre el modelo para asignar precisión de forma no uniforme a los tensores. Según las notas del autor, las cuantizaciones IQ suelen superar en calidad a las K de tamaño similar, y las i1 se aproximan a las estáticas equivalentes. El repositorio incluye también el fichero imatrix (0,1 GB) para que terceros puedan generar sus propias cuantizaciones.

## Capacidades

- Generación de texto conversacional en inglés, orientada a chat multi-turno según los tags del repositorio.
- Razonamiento y generación de código: capacidades heredadas de la base Llama de 8B, sin datos específicos publicados.
- Modo "abliterated": el modelo ha sido modificado para reducir rechazos, lo que cambia el perfil de respuestas frente a un modelo alineado convencional.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language` del repositorio.
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

- Investigación sobre alineación y abliteration: el modelo permite estudiar empíricamente cómo cambia el comportamiento de un 8B al eliminar capas de rechazo, comparando respuestas con el modelo base alineado.
- Despliegue local en hardware de consumo: con la cuantización i1-Q4_K_M (5,0 GB) cabe en GPUs de 8 GB de VRAM y permite experimentar con un 8B en un portátil o estación de trabajo modestas.
- Generación de texto creativo sin restricciones de estilo: útil para escritura de ficción o guiones donde el modelo alineado introduce rechazos que interrumpen el flujo creativo, siempre con revisión humana.
- Prototipado de chatbots en inglés: la ventana de contexto no está documentada, pero el tamaño de 8B permite iterar rápidamente en local con llama.cpp u Ollama antes de pasar a modelos mayores.
- Evaluación de cuantizaciones: el repositorio ofrece 24 variantes i1, lo que permite medir la degradación de perplejidad entre IQ1_S y Q6_K sobre una misma tarea y elegir el punto óptimo calidad/tamaño.
- Red teaming y pruebas de seguridad: al ser un modelo "unaligned", sirve como caso de prueba para clasificadores de contenido y filtros de salida en pipelines de moderación.
- Fine-tuning posterior sobre la cuantización: no recomendable directamente sobre GGUF, pero el modelo base en safetensors permite ajustes con LoRA y luego recuantizar con el fichero imatrix incluido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada):
  - i1-IQ1_S (2,1 GB): ~3 GB, válido para GPUs de 4 GB.
  - i1-IQ2_M (3,0 GB): ~4 GB.
  - i1-IQ3_S (3,8 GB): ~5 GB.
  - i1-Q4_K_M (5,0 GB): ~6-7 GB, recomendado por el autor por equilibrio velocidad/calidad.
  - i1-Q5_K_M (5,8 GB): ~7-8 GB.
  - i1-Q6_K (6,7 GB): ~8-9 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090; en数据中心, A100 o H100 no son necesarias para un 8B y solo aportan throughput.
- Cabe en GPU de consumo: sí, desde una GTX 1650 4 GB con IQ1_S hasta una RTX 4090 con Q6_K y contexto amplio.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con la API de OpenAI (el repositorio incluye el tag `endpoints_compatible`). vLLM y TGI no consumen GGUF de forma nativa; para esos motores habría que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| grok-oss-Apollyon-8B-i1-GGUF | 8,03B | no disponible | other | GGUF (24 cuants i1) | Fine-tune abliterated sobre base Llama; solo inglés |
| c4tdr0ut/Apollyon-8B (base) | 8,03B | no disponible | other | safetensors | Modelo original sin cuantizar; requiere más VRAM |
| mradermacher/grok-oss-Apollyon-8B-GGUF | 8,03B | no disponible | other | GGUF (cuants estáticas) | Misma familia, cuantización sin imatrix |
| Llama 3.1 8B Instruct | 8,03B | 128K | Llama 3.1 Community | safetensors, GGUF | Referencia alineada de Meta; multilingüe |

La comparación con modelos de la misma categoría (8B) se limita a la familia del propio Apollyon y a la referencia Llama 3.1 8B, dado que no hay datos de benchmarks publicados para este fine-tune que permitan una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Modelo "abliterated" y "unaligned": reduce deliberadamente los rechazos, por lo que puede generar contenido que un modelo alineado bloquearía. No es apto para producción orientada al usuario final sin filtros adicionales.
- Solo inglés: no se ha entrenado ni evaluado en castellano; el rendimiento en otros idiomas será degradado.
- Licencia "other": los términos exactos dependen del modelo base Apollyon-8B y, en última instancia, de la licencia de Llama subyacente. Verificar antes de uso comercial.
- Riesgo de alucinación: inherente a un 8B sin benchmarks publicados; no hay evidencia de mitigación específica.
- Cuantizaciones muy agresivas (IQ1_S, IQ1_M, Q2_K_S) degradan notablemente la calidad; el autor las etiqueta como "for the desperate" o "very low quality".
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en conversaciones largas.
- Sesgos: no se han publicado análisis de sesgo para este fine-tune; hereda los del modelo base y los puede amplificar al eliminar rechazos.
- Repositorio de 93,8 GB: descargar solo los ficheros GGUF necesarios, no el repo completo.
- Fecha de creación futura (2026-07-05) en los metadatos: tratar con cautela cualquier dato temporal del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/grok-oss-Apollyon-8B-i1-GGUF
- Modelo base: https://huggingface.co/c4tdr0ut/Apollyon-8B
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/grok-oss-Apollyon-8B-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#grok-oss-Apollyon-8B-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/
