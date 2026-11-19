# mradermacher/Twisted-Cyclone-31B-GGUF

## Resumen

Twisted-Cyclone-31B-GGUF es la versión cuantizada en formato GGUF del modelo Twisted-Cyclone-31B, desarrollado por Cyclone-Labs y convertido por mradermacher, un conocido publicador de cuantizaciones para llama.cpp. Se trata de un modelo de lenguaje de aproximadamente 30.700 millones de parámetros (30,697,345,596 según los pesos en safetensors) obtenido mediante técnicas de fusión de modelos (merge) con la herramienta mergekit, y orientado específicamente a roleplay y narrativa (storytelling).

El modelo base se distribuye bajo licencia Apache 2.0 y está entrenado únicamente en inglés. Esta versión GGUF existe para facilitar la inferencia local en hardware de consumo mediante llama.cpp, Ollama o interfaces compatibles, ofreciendo un abanico de cuantizaciones que va desde Q2_K (12,0 GB) hasta Q8_0 (32,7 GB), además de dos ficheros mmproj que sugieren capacidades multimodales heredadas del modelo original.

Su relevancia radica en que permite ejecutar un modelo de 31B en GPUs de consumo con cuantizaciones de 4 bits (17,9-18,8 GB), algo viable en tarjetas con 24 GB de VRAM. No obstante, la información pública disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada: la model card del cuantizador es puramente técnica y no incluye detalles del entrenamiento original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de fusión con mergekit); detalles internos no disponibles |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Twisted-Cyclone-31B es el resultado de una fusión de modelos realizada con mergekit, según las etiquetas de la model card. No se especifican en la información disponible ni la arquitectura exacta (número de capas, dimensiones ocultas, tipo de atención), ni los modelos componentes de la fusión, ni el volumen o composición de los datos de entrenamiento. Tampoco hay constancia de fases de RLHF, DPO u otro tipo de ajuste por preferencias.

La presencia de ficheros mmproj (multi-modal projector) en Q8_0 y f16 indica que el modelo base incorpora algún componente multimodal, presumiblemente un proyector visual para un modelo de visión, aunque no se detalla qué codificador visual utiliza ni qué tareas multimodales soporta. La conversión a GGUF se ha realizado con el pipeline estándar de llama.cpp (convert_type: hf, quantize_version: 2), generando cuantizaciones estáticas; existe además un repositorio paralelo con cuantizaciones ponderadas/imatrix (i1-GGUF) para quienes priorizan calidad sobre velocidad de conversión.

## Capacidades

- Generación de texto conversacional en inglés, con especial énfasis en diálogo multi-turno.
- Roleplay y adopción de personajes: es la categoría declarada principal del modelo.
- Narrativa y storytelling: escritura creativa de ficción, descripciones y desarrollo de tramas.
- Capacidades multimodales indicadas por los ficheros mmproj, aunque sin documentación sobre qué modalidades cubre exactamente.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking explícito: no disponible.

## Casos de uso

- Roleplay conversacional local: el modelo puede mantener sesiones de interpretación de personajes en inglés con coherencia multi-turno, ejecutándose en una GPU de 24 GB con Q4_K_M (18,8 GB), lo que permite privacidad total al no enviar conversaciones a servicios externos.
- Escritura creativa asistida: generación de relatos, diálogos y descripciones de escena para autores que necesitan un borrador rápido; su orientación a storytelling lo hace adecuado para ficción interactiva.
- Prototipado de videojuegos narrativos: integración en motores de diálogo para NPCs, usando la API compatible con endpoints de Hugging Face o un servidor llama.cpp local con latencia controlada.
- Generación de contenido para comunidades de rol: creación de respuestas de personajes en foros o chatbots de Discord, con despliegue en servidores modestos gracias a las cuantizaciones Q3/Q4.
- Evaluación comparativa de fusiones de modelos: investigadores que estudian el efecto de mergekit pueden usar esta versión GGUF para probar el comportamiento del modelo fusionado en entornos de inferencia estándar sin necesidad de infraestructura de GPU de datacenter.
- Experimentación multimodal ligera: los ficheros mmproj permiten probar el componente visual del modelo base en llama.cpp, útil para validar si la fusión conservó capacidades de visión antes de invertir en el modelo completo en safetensors (213,9 GB de repositorio).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto): Q2_K ~12-14 GB; Q3_K_M ~15-17 GB; IQ4_XS ~17-19 GB; Q4_K_M ~19-21 GB; Q5_K_M ~22-24 GB; Q6_K ~25-28 GB; Q8_0 ~33-36 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M/Q5_K_S con contexto moderado; RTX 3090 (24 GB) similar; A100 40 GB o H100 para Q6_K/Q8_0 con contexto largo; GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) solo con Q2_K o Q3_K_S y contexto reducido.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB con cuantizaciones de 4 bits; en 16 GB con cuantizaciones de 2-3 bits a costa de calidad.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), servidores compatibles con la API de llama.cpp, LM Studio; también es posible usar los ficheros mmproj para inferencia multimodal en llama.cpp.
- Latencia y throughput: no disponibles; dependerán de la GPU y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Twisted-Cyclone-31B-GGUF | ~30,7B | No disponible | Apache 2.0 | GGUF | Fusión orientada a roleplay; solo inglés |
| Modelos de rol de ~30B en GGUF (p. ej. variantes de Yi-34B o Mistral-based) | 30-34B | Variable | Variable | GGUF | Alternativas habituales en el mismo nicho; datos concretos no disponibles |
| Modelos de 7-13B para roleplay | 7-13B | Variable | Variable | GGUF | Menor calidad pero ejecutables en GPUs de 8-12 GB |

No se dispone de datos de benchmarks ni de comparaciones directas publicadas para este modelo, por lo que la comparativa se limita a parámetros, licencia y formato. Las alternativas concretas de la misma categoría (fusiones para roleplay de ~30B) no están identificadas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser una fusión sin información sobre datos de entrenamiento, no es posible evaluar sesgos de género, culturales o de otro tipo.
- Riesgo de alucinación: inherente a los modelos de lenguaje; en roleplay el riesgo se manifiesta como incoherencias narrativas o invención de hechos dentro de la ficción.
- Limitaciones de idioma: el modelo está entrenado solo en inglés; el rendimiento en castellano no está garantizado y probablemente sea deficiente.
- Contexto: se desconoce la ventana de contexto máxima; conviene probarla empíricamente antes de usarla en producción.
- Licencia: Apache 2.0 permite uso comercial, pero al ser una fusión conviene verificar las licencias de los modelos componentes originales, que no se detallan en la información disponible.
- Producción: la falta de benchmarks y de documentación sobre el entrenamiento desaconseja su uso en aplicaciones críticas sin una evaluación previa propia; el tamaño del repositorio (213,9 GB) complica la descarga completa.
- Multimodalidad: la presencia de mmproj no garantiza que el modelo base conserve capacidades de visión funcionales tras la fusión.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Twisted-Cyclone-31B-GGUF
- Modelo base: https://huggingface.co/Cyclone-Labs/Twisted-Cyclone-31B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Twisted-Cyclone-31B-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Twisted-Cyclone-31B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
