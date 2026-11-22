# mradermacher/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved-GGUF

## Resumen

Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved-GGUF es una cuantización estática en formato GGUF del modelo llmfan46/Qwen3.8-27B-Uncensored-Heretic-Native-MTP-Preserved, publicada por mradermacher. El modelo de origen es una variante "abliterated" o "decensored" de un modelo de la familia Qwen3.8 de 27.320.697.856 parámetros, en la que se ha eliminado o atenuado el alineamiento de seguridad para reducir los rechazos en la generación. El repositorio incluye además suplementos multimodales (mmproj), lo que indica que el modelo base conserva capacidad de visión.

El trabajo de mradermacher se limita a la conversión y cuantización a GGUF: no entrena ni modifica los pesos más allá del proceso de cuantización. La relevancia de esta ficha es doble: por un lado, permite ejecutar un modelo de 27B en hardware de consumo mediante cuantizaciones de 11 a 29 GB; por otro, documenta un caso de modelo sin censura con licencia Apache-2.0, cuyo uso en producción exige evaluaciones de seguridad propias.

La información disponible es escasa: la model card del repositorio de cuantización no describe arquitectura, datos de entrenamiento, contexto ni benchmarks del modelo base. Todos los datos no verificables se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Qwen3.8; transformer, sin confirmar) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas) y pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base en la documentación proporcionada. El nombre del repositorio incluye las etiquetas "mpoa" y "mtp", así como "Native-MTP-Preserved", lo que sugiere la preservación de algún mecanismo de predicción multi-token (MTP) nativo, pero no se detalla su funcionamiento ni su impacto en la inferencia. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

El proceso documentado es el de cuantización estática con llama.cpp por parte de mradermacher, con una versión alternativa de cuantizaciones ponderadas con imatrix publicada en un repositorio separado. La model card indica que se trata de una variante "heretic", "uncensored", "decensored" y "abliterated", es decir, un ajuste que elimina direcciones de activación asociadas al rechazo de peticiones. No se aportan detalles técnicos del método de abliteración aplicado por el autor original (llmfan46).

## Capacidades

- Generación de texto conversacional en inglés, con pipeline declarado como conversacional.
- Capacidad multimodal: el repositorio incluye ficheros mmproj (Q8_0 y f16), lo que permite procesar imágenes en los entornos que soporten este suplemento.
- Modo sin censura: el ajuste "abliterated" reduce los rechazos ante peticiones que un modelo alineado declinaría.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible sugiere uso a través de infraestructura de inferencia compatible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo se declara inglés.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar el comportamiento de un modelo de 27B tras eliminar el alineamiento, comparando respuestas con la versión original y midiendo tasas de rechazo y de contenido dañino en entornos controlados.
- Generación creativa sin restricciones temáticas: escritura de ficción, guiones o narrativa que aborde temas sensibles (violencia, conflictos morales) donde un modelo alineado tiende a rechazar o suavizar el contenido; la cuantización Q4_K_M de 16,9 GB cabe en una GPU de 24 GB.
- Evaluación de robustez de filtros: servir el modelo como generador adversario para probar clasificadores de contenido y sistemas de moderación en pipelines de seguridad.
- Procesamiento de documentos con imágenes en local: gracias a los ficheros mmproj, puede extraerse texto y describir figuras de documentos escaneados en despliegues sin conexión, usando llama.cpp con soporte multimodal.
- Análisis de corpus y etiquetado a gran escala en inglés: con Q8_0 (29,1 GB) en una GPU de 40-48 GB puede ejecutarse en lotes para clasificación y extracción de información, evitando dependencias de API externas.
- Prototipado de asistentes conversacionales autoalojados: la licencia Apache-2.0 y el formato GGUF permiten desplegar el modelo con Ollama o llama.cpp en estaciones de trabajo con 16-24 GB de VRAM para pruebas de concepto internas.
- Destilación y generación de datos sintéticos: uso como generador de pares instrucción-respuesta en dominios donde los modelos alineados producen respuestas excesivamente neutras, con revisión humana posterior obligatoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto): Q2_K ~11 GB; Q3_K_S ~12,4 GB; Q3_K_M ~13,6 GB; Q3_K_L ~14,7 GB; IQ4_XS ~15,5 GB; Q4_K_S ~15,9 GB; Q4_K_M ~16,9 GB; Q5_K_S ~19,1 GB; Q5_K_M ~19,6 GB; Q6_K ~22,5 GB; Q8_0 ~29,1 GB. Añadir entre 1 y 4 GB según longitud de contexto y backend.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M, Q5_K_M y Q6_K; RTX 3090 (24 GB) en las mismas cuantizaciones; A100 40 GB o H100 para Q8_0 y contextos largos; configuraciones multi-GPU para Q8_0 con contexto extendido.
- Cabe en GPU de consumo: sí, desde Q2_K (11 GB, apto para GPUs de 12 GB como RTX 3060 12 GB o RTX 4070) hasta Q6_K (22,5 GB, RTX 4090/3090). Q8_0 requiere 32 GB o más.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, KoboldCpp) para GGUF; los ficheros mmproj requieren builds de llama.cpp con soporte multimodal. vLLM y TGI no consumen GGUF de forma nativa; para esos motores habría que usar el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles; dependen en gran medida de la cuantización, el backend y el hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Ultra-Uncensored-Heretic (esta ficha) | 27,3B | no disponible | Apache-2.0 | GGUF | Variante abliterated con mmproj y MTP preservado |
| Modelo base llmfan46/Qwen3.8-27B-Uncensored-Heretic-Native-MTP-Preserved | 27,3B | no disponible | Apache-2.0 | safetensors | Pesos originales sin cuantizar; requiere ~55 GB en fp16 |
| Versión imatrix de mradermacher (-i1-GGUF) | 27,3B | no disponible | Apache-2.0 | GGUF | Cuantizaciones ponderadas, mayor calidad a igual tamaño |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- El ajuste "abliterated/decensored" elimina barreras de seguridad: el modelo puede generar contenido dañino, ilegal o sexualmente explícito. No debe exponerse sin moderación externa.
- Riesgo de alucinación no cuantificado: no hay benchmarks ni evaluaciones publicadas en la información disponible.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está verificado y probablemente sea inferior.
- Contexto: se desconoce la longitud máxima soportada; no planificar despliegues que dependan de ventanas largas sin verificación previa.
- La cuantización introduce degradación de calidad, especialmente en Q2_K y Q3_K_S; para producción se recomienda Q5_K_M o superior.
- El repositorio ocupa 190,8 GB por incluir todas las cuantizaciones; conviene descargar únicamente el fichero necesario.
- Licencia Apache-2.0 permite uso comercial, pero el usuario asume la responsabilidad legal y ética del contenido generado; conviene revisar las condiciones del modelo base y del modelo Qwen original.
- No se documentan sesgos específicos, pero al derivar de un modelo entrenado mayoritariamente en inglés y sin alineamiento, es esperable un sesgo cultural y de género no mitigado.
- El soporte multimodal depende de builds concretos de llama.cpp; la compatibilidad con otros motores no está garantizada.
- El modelo base no incluye información sobre datos de entrenamiento, lo que dificulta auditorías de procedencia y cumplimiento normativo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved-GGUF
- Modelo base: https://huggingface.co/llmfan46/Qwen3.8-27B-Uncensored-Heretic-Native-MTP-Preserved
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved-i1-GGUF
- Página de overview del autor: https://hf.tst.eu/model#Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica de perplejidad por cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
