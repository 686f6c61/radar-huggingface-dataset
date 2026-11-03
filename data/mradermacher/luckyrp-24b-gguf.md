# mradermacher/LuckyRP-24B-GGUF

## Resumen

LuckyRP-24B-GGUF es la distribución en formato GGUF del modelo LuckyRP-24B, un merge de modelos (mediante mergekit) orientado a roleplay y storytelling, publicado originalmente por Vortex5 y cuantizado por mradermacher. El repositorio no contiene un modelo entrenado desde cero, sino una serie de archivos GGUF estáticos derivados del modelo base, pensados para su uso directo en entornos de inferencia local con llama.cpp y derivados.

El modelo cuenta con aproximadamente 23.570 millones de parámetros (23,57B) según los pesos safetensors del modelo base, y está etiquetado exclusivamente para inglés. La licencia declarada es Apache 2.0, lo que permite uso comercial con las condiciones habituales de atribución. La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo de 24B especializado en conversación creativa y narrativa en hardware de consumo, gracias a la disponibilidad de cuantizaciones desde Q2_K (9 GB) hasta Q8_0 (25,2 GB).

El repositorio fue creado el 26 de mayo de 2025 y actualizado el 3 de noviembre de 2026, con 280 descargas y 1 like en el momento de la consulta. No se dispone de información sobre la arquitectura interna concreta más allá de que se trata de un merge de transformers, ni de datos de entrenamiento, benchmarks o contexto máximo publicados por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (merge de modelos mediante mergekit; detalles internos no disponibles) |
| Parámetros totales | 23.572.403.200 (≈23,57B) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (estáticos); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo es un merge construido con mergekit, según las etiquetas del repositorio, a partir de modelos previos (los componentes concretos del merge no se detallan en la información disponible). No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste fino supervisado. La model card del repositorio cuantizado no aporta información sobre la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención, uso de GQA o MLA), por lo que estos datos deben considerarse no disponibles.

La contribución técnica de este repositorio es la cuantización estática en GGUF, realizada con convert_type hf y quantize_version 2 según los metadatos internos de la model card. Se ofrece además una variante con cuantizaciones ponderadas/imatrix en un repositorio separado (LuckyRP-24B-i1-GGUF), que suele proporcionar mejor relación calidad/tamaño en tamaños pequeños. No se documentan innovaciones como decodificación especulativa, atención lineal ni híbridos SSM/transformer.

## Capacidades

- Generación de texto creativo orientada a roleplay y storytelling, según las etiquetas del repositorio.
- Conversación multi-turno en inglés para personajes y narrativa interactiva.
- Continuación de ficción, descripción de escenas y diálogo de personajes.
- No hay evidencia en la información disponible de soporte de tool calling o function calling.
- No hay evidencia de capacidades de agente o razonamiento multi-paso estructurado.
- No hay evidencia de capacidades multimodales (visión, audio) ni de modo "thinking".
- Capacidades multilingües: solo inglés declarado; no se documentan otros idiomas.
- Capacidades matemáticas y de código: no documentadas.

## Casos de uso

- Roleplay conversacional local: el modelo puede mantener diálogos de personaje en inglés con contexto multi-turno, desplegado con llama.cpp u Ollama en una GPU de consumo; la cuantización Q4_K_M (14,4 GB) es la recomendada por el autor por velocidad y calidad.
- Escritura asistida de ficción: generación de escenas, descripciones y diálogos para relatos, aprovechando el ajuste orientado a storytelling del merge.
- Prototipado de chatbots de entretenimiento: creación de experiencias de chat con personalidad definida mediante system prompt, sin dependencia de APIs externas.
- Generación de guiones y tramas: ideación de arcos narrativos y variantes de escena en un pipeline de escritura creativa.
- Pruebas de concepto de inferencia local: evaluación de modelos de 24B en hardware de consumo gracias a las cuantizaciones Q2_K–Q4_K_M (9–14,4 GB).
- Entornos sin conectividad o con requisitos de privacidad: despliegue totalmente offline en estaciones de trabajo, adecuado cuando los datos conversacionales no deben salir del dispositivo.
- Fine-tuning posterior y experimentación: uso del modelo base safetensors (Vortex5/LuckyRP-24B) como punto de partida para ajustes específicos de dominio, con la licencia Apache 2.0 como marco permisivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente igual al tamaño del archivo GGUF más overhead de contexto. Orientativamente: Q2_K ≈9 GB, Q4_K_M ≈14,4 GB, Q6_K ≈19,4 GB, Q8_0 ≈25,2 GB.
- GPU recomendadas: para Q4_K_M, una RTX 4090 (24 GB) o RTX 3090 (24 GB) permiten cargar el modelo completo con contexto moderado; para Q8_0 se recomienda A100 40 GB, H100 80 GB o RTX 4090 con contexto limitado.
- Compatibilidad con GPU de consumo: sí; Q2_K–Q4_K_M caben en GPU de 12–16 GB (RTX 3060 12 GB, RTX 4070 Ti 16 GB) con contexto reducido; Q5 y superiores requieren 24 GB o descarga parcial a RAM/CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui y servidores compatibles con GGUF; vLLM y TGI no son la vía principal para GGUF, aunque existen soportes parciales.
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización elegida. El autor marca Q4_K_S y Q4_K_M como "fast, recommended" y Q8_0 como "fast, best quality".

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LuckyRP-24B-GGUF | ≈23,57B | No disponible | GGUF | Apache 2.0 | Merge para roleplay/storytelling, solo inglés |
| Modelo base LuckyRP-24B | ≈23,57B | No disponible | Safetensors | Apache 2.0 | Origen del merge, sin cuantizar |
| LuckyRP-24B-i1-GGUF | ≈23,57B | No disponible | GGUF (imatrix) | Apache 2.0 | Variante con cuantizaciones ponderadas del mismo autor |

No se dispone de información suficiente para comparar con alternativas de la misma categoría (otros merges de roleplay de ~24B), por lo que la comparativa con terceros se considera no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un merge sin datos de entrenamiento publicados, no es posible auditar sesgos de forma rigurosa.
- Riesgo de alucinación: inherente a los modelos generativos; no hay evaluaciones publicadas que lo cuantifiquen.
- Limitaciones de idioma: solo inglés declarado; el rendimiento en castellano no está garantizado.
- Longitud de contexto: no disponible; conviene validar empíricamente antes de usarlo en producción.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben respetarse las condiciones de atribución y las licencias de los componentes del merge, que no se detallan.
- Caveat de producción: al tratarse de un merge orientado a roleplay, su utilidad para tareas factuales, código o matemáticas es dudosa y no está evaluada.
- Calidad de cuantizaciones bajas: Q2_K y Q3_K_M pueden degradar notablemente la calidad; el autor recomienda Q4_K_M o superiores para uso real.
- El repositorio tiene muy poca tracción (280 descargas, 1 like), lo que limita la validación comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LuckyRP-24B-GGUF
- Modelo base: https://huggingface.co/Vortex5/LuckyRP-24B
- Variante imatrix: https://huggingface.co/mradermacher/LuckyRP-24B-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#LuckyRP-24B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico de perplejidad por cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Sitio de nethype GmbH: https://www.nethype.de/
