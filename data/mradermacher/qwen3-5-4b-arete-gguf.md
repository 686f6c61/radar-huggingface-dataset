# mradermacher/Qwen3.5-4B-Arete-GGUF

## Resumen

Qwen3.5-4B-Arete-GGUF es la versión cuantizada en formato GGUF del modelo wesjos/Qwen3.5-4B-Arete, un ajuste fino supervisado (SFT) orientado a alineación y valores sobre una base Qwen3.5 de 4B parámetros. El trabajo de cuantización lo firma mradermacher, un conocido publicador de cuantizaciones estáticas para llama.cpp, que distribuye el modelo en múltiples niveles de precisión (de Q2_K a f16) junto con el proyector multimodal mmproj.

El modelo hereda la arquitectura qwen3_5 y la naturaleza multimodal de su base, tal como indican las etiquetas image-text-to-text del repositorio, con 4.205.751.296 parámetros totales según los pesos en safetensors. El ajuste se ha realizado sobre el dataset NousResearch/arete-data-pairs, centrado en pares de preferencia y valores, lo que lo orienta a tareas conversacionales y de alineación más que a un uso generalista sin supervisión.

Su relevancia práctica radica en que permite ejecutar un modelo de 4B con capacidades multimodales en hardware de consumo mediante llama.cpp u Ollama, con licencia Apache 2.0 y pesos disponibles tanto en safetensors como en GGUF. No obstante, la información publicada es escasa: no hay benchmarks, no se detalla la composición del dataset de ajuste ni se especifica la longitud de contexto efectiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | transformer (familia qwen3_5), multimodal image-text-to-text |
| Parámetros totales | 4.205.751.296 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; proyector multimodal mmproj en f16 y Q8_0 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (modelo base) y GGUF (esta versión) |

## Arquitectura y entrenamiento

La información disponible confirma que se trata de un transformer de la familia qwen3_5 con 4.205.751.296 parámetros y capacidad multimodal (etiqueta image-text-to-text), lo que implica un codificador visual acoplado al modelo de lenguaje mediante un proyector, aquí distribuido como archivo mmproj separado en los GGUF. No se detalla el número de capas, la dimensión oculta, el mecanismo de atención ni si incorpora innovaciones como atención lineal o decodificación especulativa.

El entrenamiento del modelo base wesjos/Qwen3.5-4B-Arete consistió en un ajuste fino supervisado (SFT) sobre el dataset NousResearch/arete-data-pairs, orientado a valores y alineación. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas posteriores de RLHF o DPO. Esta versión GGUF es una cuantización estática del modelo base, sin entrenamiento adicional; el autor de la cuantización indica que no hay cuantizaciones ponderadas con imatrix disponibles en el momento de la publicación.

## Capacidades

- Generación de texto conversacional multi-turno, con ajuste específico para alineación y valores.
- Procesamiento de imagen y texto combinados (image-text-to-text), gracias al proyector multimodal incluido en los archivos mmproj.
- Razonamiento y respuesta a instrucciones derivados de la base Qwen3.5, aunque no se documenta un modo de pensamiento explícito.
- Soporte multilingüe limitado al inglés según la model card.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico multi-paso.
- No se documentan capacidades de audio ni de otro tipo más allá de texto e imagen.

## Casos de uso

- Asistentes conversacionales alineados: el ajuste SFT sobre pares de valores permite desplegar un chatbot con respuestas consistentes en materia de seguridad y tono, ejecutable localmente con llama.cpp en una GPU de consumo.
- Descripción de imágenes en local: gracias al proyector mmproj, se puede usar para generar texto a partir de capturas, fotografías o diagramas sin enviar datos a servicios externos, útil en entornos con requisitos de privacidad.
- Moderación y revisión de contenido asistida: su orientación a valores lo hace adecuado como segunda opinión en pipelines de revisión de respuestas generadas por otros modelos.
- Prototipado rápido en estaciones de trabajo: con cuantizaciones Q4_K_M de 2,8 GB, cabe en portátiles con GPU modesta y permite iterar sobre prompts y flujos conversacionales sin infraestructura dedicada.
- Educación y divulgación: despliegue en talleres o demos donde se necesita un modelo pequeño, multilingüe limitado al inglés y con licencia permisiva para mostrar el funcionamiento de un LLM multimodal.
- Investigación en alineación: sirve como punto de comparación reproducible para estudiar el efecto de un SFT sobre valores en un modelo de 4B, al estar disponibles los pesos en safetensors y en múltiples cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,0 GB con Q2_K, 2,8 GB con Q4_K_M, 3,6 GB con Q6_K, 4,6 GB con Q8_0 y 8,5 GB con f16, a los que se suman 0,5-0,8 GB del proyector mmproj si se usa la entrada de imagen.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090 o superiores para mayor velocidad y precisión; A100/H100 solo tienen sentido para servir muchas peticiones concurrentes.
- Cabe en GPU de consumo: sí, en la práctica totalidad de tarjetas con 4 GB o más, e incluso en CPU con suficiente RAM para las cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con transformers, vLLM o TGI si se dispone de la configuración adecuada.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-Arete-GGUF | 4,2B | no disponible | sí (image-text-to-text) | Apache 2.0 | GGUF en HF |
| wesjos/Qwen3.5-4B-Arete | 4,2B | no disponible | sí | Apache 2.0 | safetensors en HF |
| Base Qwen3.5-4B | no disponible en la información | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo ni de especificaciones detalladas de los modelos de referencia en la información proporcionada.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está verificado y puede degradarse.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de calidad frente a la base sin ajustar.
- Riesgo de alucinación inherente a un modelo de 4B, agravado por la falta de documentación sobre el dataset de ajuste.
- El ajuste sobre pares de valores puede introducir sesgos hacia respuestas moralizantes o excesivamente cautas.
- Las cuantizaciones Q2_K y Q3_K pueden degradar notablemente la calidad; el autor recomienda Q4_K_M o superiores.
- No hay cuantizaciones ponderadas con imatrix publicadas, lo que limita la calidad de las cuantizaciones de baja precisión frente a alternativas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset de ajuste pueden tener condiciones adicionales no detalladas en la información disponible.
- El repositorio registra cero descargas y cero likes, por lo que no hay validación comunitaria del comportamiento del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mradermacher/Qwen3.5-4B-Arete-GGUF
- Modelo base: https://huggingface.co/wesjos/Qwen3.5-4B-Arete
- Dataset de ajuste: https://huggingface.co/datasets/NousResearch/arete-data-pairs
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.5-4B-Arete-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
