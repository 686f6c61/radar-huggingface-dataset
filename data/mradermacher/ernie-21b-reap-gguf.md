# mradermacher/ERNIE-21B-REAP-GGUF

## Resumen

ERNIE-21B-REAP-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo jerrimu/ERNIE-21B-REAP, publicada por mradermacher. El modelo subyacente es una variante "REAP" (probablemente una poda o reducción de capas/parámetros) del modelo ERNIE de Baidu, con 18.002.548.604 parámetros reales según los safetensors del repo base. Esta versión GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, algo inviable con los pesos originales en precisión completa.

El repo ofrece 11 cuantizaciones estáticas que van desde Q2_K (6,8 GB) hasta Q8_0 (19,2 GB), cubriendo el espectro habitual de calidad/tamaño. No se han publicado cuantizaciones ponderadas con imatrix por parte de este autor en el momento de la ficha. El modelo está etiquetado como conversacional y solo en inglés, con licencia Apache 2.0.

La relevancia actual radica en que permite desplegar un modelo de ~18B parámetros en GPUs de consumo (e incluso en CPU con las cuantizaciones más agresivas), manteniendo la licencia permisiva Apache 2.0 para uso comercial. La información pública disponible sobre el modelo base es muy limitada, por lo que muchos detalles técnicos deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles; variante REAP del modelo ERNIE) |
| Parametros totales | 18.002.548.604 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base jerrimu/ERNIE-21B-REAP. Por el nombre y el origen (ERNIE de Baidu), se trata de un transformer decoder-only, pero no se especifican en la información proporcionada el número de capas, dimensiones ocultas, mecanismo de atención ni si incorpora innovaciones como atención lineal o decodificación especulativa. El sufijo "REAP" sugiere una reducción de parámetros respecto al modelo ERNIE original, pero no se documenta el método exacto de poda o destilación empleado.

Tampoco se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste fino supervisado. La model card del repo GGUF es puramente descriptiva sobre las cuantizaciones y remite al modelo base, cuya información no se ha incluido en la búsqueda. Todos estos apartados deben considerarse no disponibles.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta "conversational" del repo.
- Razonamiento y respuesta a preguntas de propósito general (presumible por el tamaño y la familia ERNIE, pero no documentado explícitamente).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Compatibilidad con endpoints: el tag "endpoints_compatible" sugiere que puede servirse mediante infraestructura de inferencia estándar, pero no se detalla.

## Casos de uso

- Despliegue en GPUs de consumo: con la cuantización Q4_K_M (11,0 GB) el modelo cabe en una RTX 4090 (24 GB) o RTX 3090, permitiendo ejecutar un modelo de ~18B parámetros en local para prototipos y pruebas.
- Inferencia en CPU con llama.cpp: las cuantizaciones Q2_K (6,8 GB) y Q3_K_S (8,0 GB) permiten ejecutar el modelo en equipos sin GPU dedicada, útil para entornos de desarrollo o estaciones de trabajo con RAM abundante.
- Asistentes conversacionales en inglés: el modelo está etiquetado como conversacional, por lo que puede emplearse en chatbots de dominio general o atención al cliente en inglés, siempre que se valide la calidad real mediante pruebas.
- Experimentación e investigación: al ser una variante REAP con licencia Apache 2.0, es adecuado para estudiar el efecto de la reducción de parámetros y comparar cuantizaciones en pipelines de evaluación.
- Integración en pipelines de CI/CD para generación de texto: mediante llama.cpp o servidores compatibles con la API de OpenAI (el tag "endpoints_compatible" lo sugiere), se puede incorporar en herramientas internas de documentación o generación de borradores.
- Fine-tuning ligero sobre GGUF: aunque el formato GGUF no está pensado para entrenamiento, las versiones Q8_0 o Q6_K pueden servir como base para experimentos de adaptación con LoRA en herramientas que lo soporten, aunque esto requeriría convertir a otro formato.
- Evaluación comparativa de cuantizaciones: el repo ofrece 11 variantes, lo que permite medir la degradación de calidad (perplejidad, coherencia) entre Q2_K y Q8_0 en un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de archivo GGUF, más overhead de contexto):
  - Q2_K: ~6,8 GB de pesos; ~8-9 GB de VRAM con contexto moderado.
  - Q3_K_S: ~8,0 GB; ~9-10 GB de VRAM.
  - Q4_K_M: ~11,0 GB; ~12-13 GB de VRAM.
  - Q5_K_M: ~12,9 GB; ~14-15 GB de VRAM.
  - Q6_K: ~14,9 GB; ~16-17 GB de VRAM.
  - Q8_0: ~19,2 GB; ~20-21 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB) para Q6_K y Q8_0; RTX 3090/4080 (16-24 GB) para Q4_K_M y Q5_K_M; RTX 4060 Ti 16 GB para Q4_K_S; GPUs de 8-12 GB para Q2_K y Q3_K_S.
- Cabe en GPU de consumo: sí, todas las cuantizaciones caben en GPUs de consumo de gama alta; las más pequeñas caben en GPUs de 8 GB.
- Opciones de despliegue: llama.cpp, Ollama (previa conversión o importación del GGUF), servidores compatibles con la API de OpenAI (por el tag "endpoints_compatible"), y cualquier runtime que soporte GGUF.
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

No se dispone de información suficiente sobre el modelo base ni sobre alternativas directas de la misma familia para establecer una comparativa rigurosa con datos verificables. Se indica "no disponible".

## Limitaciones y advertencias

- Solo soporta inglés según la etiqueta de idioma; no se debe asumir calidad en castellano u otros idiomas.
- No se documentan sesgos conocidos, pero al ser un modelo derivado de ERNIE es probable que herede sesgos de sus datos de entrenamiento; se recomienda evaluación específica antes de producción.
- Riesgo de alucinación no cuantificado: no hay benchmarks publicados que permitan estimar la fiabilidad factual.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que el modelo base jerrimu/ERNIE-21B-REAP mantenga la misma licencia y que no existan restricciones adicionales derivadas del modelo ERNIE original de Baidu.
- Las cuantizaciones Q2_K y Q3_K_S pueden degradar notablemente la calidad; para producción se recomienda Q4_K_M o superior.
- No hay cuantizaciones imatrix disponibles por parte de este autor, lo que puede afectar a la calidad en cuantizaciones bajas.
- El tamaño del repo (333 GB) incluye todas las variantes; la descarga individual es mucho menor, pero conviene seleccionar solo el archivo necesario.
- No se dispone de información sobre la longitud de contexto real del modelo, lo que limita su uso en tareas que requieran ventanas largas.

## Enlaces

- Repo GGUF: https://huggingface.co/mradermacher/ERNIE-21B-REAP-GGUF
- Modelo base: https://huggingface.co/jerrimu/ERNIE-21B-REAP
- Página de descargas del autor: https://hf.tst.eu/model#ERNIE-21B-REAP-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
