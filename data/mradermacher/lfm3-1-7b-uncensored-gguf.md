# mradermacher/LFM3-1.7B-Uncensored-GGUF

## Resumen

LFM3-1.7B-Uncensored-GGUF es una cuantizacion estatica en formato GGUF del modelo OpenIntelligenceNet/LFM3-1.7B-Uncensored, publicada por mradermacher. El modelo subyacente deriva de la familia LFM3 de Liquid AI (arquitectura hibrida, segun las etiquetas del autor) y ha sido modificado mediante tecnicas de "abliteration"/"heretic" para eliminar las capas de rechazo y moderacion, orientandolo a generacion de texto sin censura, roleplay y razonamiento. Cuenta con 1.728.801.600 parametros totales (aproximadamente 1,7 mil millones).

La relevancia de esta publicacion radica en que ofrece el modelo en una bateria completa de cuantizaciones (desde Q2_K de 0,9 GB hasta f16 de 3,6 GB), lo que permite ejecutarlo en hardware de consumo y en entornos de borde ("edge-ai"). El repositorio ocupa 15,9 GB en total debido a la suma de todos los ficheros GGUF.

Se trata de un modelo unicamente de texto, con soporte declarado solo para ingles, y pensado para escenarios conversacionales. No se dispone de informacion publica sobre licencia, contexto maximo ni datos de entrenamiento en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida (etiqueta "hybrid-architecture" del autor; requiere custom_code) |
| Parametros totales | 1.728.801.600 (~1,7 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

El autor etiqueta el modelo como "hybrid-architecture" y "causal-lm", e indica que requiere `custom_code` para cargarse con transformers, lo que sugiere una implementacion no estandar respecto a un transformer clasico. La familia LFM3 de Liquid AI se asocia a arquitecturas hibridas que combinan mecanismos de atencion con capas de estado recurrente, si bien la informacion proporcionada no detalla la composicion exacta de capas ni el mecanismo concreto empleado en esta variante.

No se dispone de datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron fases de RLHF, DPO u otras tecnicas de alineacion en el modelo base. Lo que si es documentable es el proceso de post-entrenamiento aplicado por OpenIntelligenceNet: el modelo ha sido "abliterated" y "decensored" mediante herramientas tipo heretic, eliminando los comportamientos de rechazo. La cuantizacion realizada por mradermacher es estatica (quantize_version 2, salida tensor-quantised), sin versiones ponderadas/imatrix disponibles en el momento de la publicacion.

## Capacidades

- Generacion de texto causal y conversacional en ingles.
- Razonamiento de multiples pasos (etiqueta "reasoning" del autor).
- Roleplay y generacion creativa sin restricciones de contenido (etiqueta "roleplay").
- Respuestas sin capas de rechazo ("uncensored", "decensored", "abliterated").
- Orientacion a despliegue en borde y dispositivos de bajos recursos ("edge-ai").
- Compatibilidad declarada con endpoints ("endpoints_compatible").
- Soporte de tool calling / function calling: no disponible en la informacion.
- Capacidades de vision o audio: no disponible (modelo solo de texto).
- Capacidades multilingues: limitadas al ingles segun los metadatos.

## Casos de uso

- Roleplay y narrativa interactiva: el modelo ha sido decensurado explicitamente, por lo que puede mantener personajes y tramas sin rechazos, en un tamano que cabe en GPU de consumo con cuantizaciones Q4_K_M (~1,2 GB).
- Generacion creativa sin filtros: escritura de ficcion, guiones o contenido adulto donde los modelos alineados rechazan peticiones; la variante "abliterated" elimina esas negativas.
- Prototipado rapido en local: con Q4_K_S (~1,2 GB) se puede ejecutar en portatiles con GPU modesta o incluso CPU, ideal para experimentar con pipelines de generacion antes de escalar a modelos mayores.
- Asistentes conversacionales de bajo coste: su tamano de 1,7 B permite desplegar chatbots multi-turno en entornos con recursos limitados, aunque el contexto maximo no esta documentado.
- Evaluacion de seguridad y red-teaming: util como modelo de referencia para estudiar el efecto de la abliteration y comparar comportamientos frente a la version alineada del mismo modelo.
- Investigacion sobre cuantizacion: la disponibilidad de doce variantes (Q2_K a f16) permite medir el impacto de la cuantizacion en calidad y perplexidad sobre una misma arquitectura hibrida.
- Despliegue en dispositivos de borde: la etiqueta "edge-ai" y el tamano reducido lo hacen apto para entornos embebidos con llama.cpp u Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~0,9 GB
  - Q4_K_M: ~1,2 GB
  - Q6_K: ~1,5 GB
  - Q8_0: ~1,9 GB
  - f16: ~3,6 GB
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para cuantizaciones bajas; RTX 3060/4060 o superiores permiten ejecutar Q8_0 o f16 con holgura. Para mayor velocidad, A100/H100 no aportan ventaja significativa a este tamano.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna con 4 GB o mas; tambien en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base requiere transformers con `custom_code`. No se confirma soporte de vLLM o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Uncensored-GGUF (este) | ~1,7 B | no disponible | GGUF | no disponible | Decensurado, solo ingles, arquitectura hibrida |
| AtomicChat/LFM3-1.7B-Uncensored-GGUF | ~2 B (segun metadatos) | no disponible | GGUF | no disponible | Misma base, cuantizado por otro autor |
| mradermacher/Barcenas-LFM3-1.7B-GGUF | ~2 B (segun metadatos) | no disponible | GGUF | no disponible | Variante derivada de LFM3-1.7B, sin datos de rendimiento |

No se dispone de datos de rendimiento ni de contexto para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia de alineacion: al ser un modelo abliterated/decensurado, no rechaza peticiones daninas, ilegales o eticas; no es apto para aplicaciones de cara al publico sin moderacion externa.
- Riesgo elevado de alucinacion: con 1,7 B de parametros, la fiabilidad factica es limitada y no debe usarse como fuente de verdad.
- Solo ingles: los metadatos declaran unicamente `en`; el rendimiento en castellano no esta garantizado.
- Licencia no disponible: no se puede confirmar el uso comercial; debe verificarse en el modelo base antes de cualquier despliegue productivo.
- Contexto desconocido: no se documenta la ventana maxima, lo que impide planificar tareas de contexto largo.
- Requiere `custom_code`: la carga con transformers exige confiar en codigo remoto del repositorio, lo que implica riesgos de seguridad.
- Cuantizaciones bajas (Q2_K, Q3_K_M) degradan la calidad; el propio autor marca Q3_K_M como "lower quality".
- Sin datos de benchmarks: no hay evidencia publica de su rendimiento frente a modelos de tamano similar.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LFM3-1.7B-Uncensored-GGUF
- Modelo base: https://huggingface.co/OpenIntelligenceNet/LFM3-1.7B-Uncensored
- Pagina de descargas del autor: https://hf.tst.eu/model#LFM3-1.7B-Uncensored-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
- Variante alternativa: https://huggingface.co/AtomicChat/LFM3-1.7B-Uncensored-GGUF
- Variante Barcenas: https://huggingface.co/mradermacher/Barcenas-LFM3-1.7B-GGUF
