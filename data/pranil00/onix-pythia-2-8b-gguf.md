# pranil00/ONIX-pythia-2.8b-GGUF

## Resumen

ONIX-pythia-2.8b-GGUF es una conversión a formato GGUF del modelo base EleutherAI/pythia-2.8b, publicada por el usuario pranil00 bajo la etiqueta de comunidad "ONIX". Se trata exclusivamente de un artefacto de cuantización: no introduce cambios en la arquitectura, los pesos ni el entrenamiento del modelo original, sino que empaqueta los pesos de Pythia-2.8B en un fichero GGUF con cuantización Q5_K_M (1,89 GB) para su uso con llama.cpp y Ollama.

El modelo subyacente, Pythia-2.8b, es un transformer decoder-only de 2.775.208.960 parámetros desarrollado por EleutherAI dentro de la suite Pythia, diseñada para investigación sobre interpretabilidad y dinámica de entrenamiento. Pythia se entrenó sobre el dataset The Pile y se publicó con 154 checkpoints intermedios, lo que lo convierte en una referencia habitual en estudios de mecánica interna de modelos. No es un modelo ajustado por instrucciones ni alineado con RLHF: es un modelo base de continuación de texto.

La relevancia de esta ficha es acotada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su interés práctico se limita a quien necesite ejecutar Pythia-2.8B en hardware modesto vía llama.cpp u Ollama. No debe confundirse con un modelo conversacional ni con una variante mejorada del original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-NeoX), modelo base Pythia-2.8b |
| Parametros totales | 2.775.208.960 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Pythia-2.8b usa 2048 tokens, segun la documentacion de EleutherAI) |
| Tipos de cuantizacion | Q5_K_M (unico fichero publicado) |
| Idiomas soportados | No disponible (el modelo base se entrena principalmente con texto en ingles de The Pile) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (1,89 GB en Q5_K_M); el modelo base original en safetensors |
| Tamano del repositorio | 2,0 GB |
| Libreria | gguf |
| Pipeline | text-generation |
| Modelo base | EleutherAI/pythia-2.8b |
| Fecha de publicacion | 2026-11-26 |

## Arquitectura y entrenamiento

La arquitectura corresponde integramente a Pythia-2.8b de EleutherAI: un transformer decoder-only con atención causal, en la linea de GPT-NeoX, con 2.775 millones de parámetros. El proceso de entrenamiento es el documentado por EleutherAI para la suite Pythia: entrenamiento sobre The Pile, con checkpoints publicados a lo largo del entrenamiento para facilitar estudios de interpretabilidad. No hay información en la model card sobre número exacto de tokens, composición detallada del dataset ni sobre fases de RLHF, DPO o ajuste por instrucciones; todo apunta a que se trata del modelo base sin modificaciones.

La contribución de este repositorio es únicamente la conversión a GGUF con cuantización Q5_K_M, realizada según el autor "on Apple Silicon Metal" y verificada mediante llama.cpp. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, mezcla de expertos ni modos de razonamiento). La cuantización Q5_K_M es una cuantización de bloques K-quant de 5 bits para la mayoría de tensores, con mezcla de precisiones para preservar calidad en capas sensibles.

## Capacidades

- Generación de texto por continuación de prompt (text-generation), sin formato conversacional ni plantilla de chat.
- Razonamiento y conocimiento factual limitados al entrenamiento sobre The Pile; no hay ajuste por instrucciones.
- Capacidad de código y matemáticas derivada del corpus de entrenamiento, sin evaluación publicada en este repositorio.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni razonamiento multi-paso estructurado.
- Capacidades multilingües no documentadas; el modelo base está orientado predominantemente a inglés.
- Sin visión, audio ni modo "thinking".
- Ejecutable en llama.cpp y Ollama gracias al formato GGUF.

## Casos de uso

- Investigación en interpretabilidad: cargar el GGUF en llama.cpp para reproducir experimentos de análisis de activaciones o de comportamiento sobre Pythia-2.8B en entornos sin GPU dedicada, aprovechando que el modelo base es una referencia habitual en este campo.
- Prototipado rápido en local: usar `ollama run pranil00/ONIX-pythia-2.8b-GGUF` para probar generación de texto en un portátil sin necesidad de descargar los pesos completos en safetensors.
- Generación de texto de relleno o datos sintéticos simples: producir continuaciones de texto para pruebas de pipelines de NLP donde no se requiere calidad conversacional.
- Evaluación comparativa de cuantizaciones: medir la degradación de perplejidad de Q5_K_M frente al modelo original en safetensors, dado que el autor afirma haber verificado la conversión con llama.cpp.
- Docencia y demostraciones: ilustrar el funcionamiento de un modelo base frente a un modelo instruido, ejecutándolo en hardware de consumo.
- Pruebas de integración de llama.cpp: validar toolchains de inferencia GGUF (bindings, servidores locales) contra un modelo pequeño y con licencia permisiva Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, perplejidad ni comparaciones con otras cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB para el fichero Q5_K_M de 1,89 GB, más overhead de contexto y de la implementación (llama.cpp permite descargar capas a CPU).
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM; también funciona íntegramente en CPU.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3050, RTX 3060, RTX 4060 o superiores; también en Apple Silicon vía Metal.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`) y Ollama. No se documenta soporte para vLLM ni TGI en formato GGUF.
- Latencia y throughput estimados: no disponibles; dependen del hardware y de la longitud de contexto utilizada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ONIX-pythia-2.8b-GGUF (este) | 2,78 B | No disponible (base: 2048) | GGUF Q5_K_M | Apache 2.0 | Cuantización no oficial, 0 descargas |
| EleutherAI/pythia-2.8b | 2,78 B | 2048 | safetensors | Apache 2.0 | Modelo base original con 154 checkpoints |
| EleutherAI/pythia-1.4b | 1,4 B | 2048 | safetensors | Apache 2.0 | Versión menor de la misma familia |
| Modelos instruidos de ~3B (p. ej. familias tipo Llama o Qwen) | ~3 B | Variable | safetensors/GGUF | Variable | Conversacionales y alineados; no comparables en tarea con un modelo base |

La comparación relevante es con el propio Pythia-2.8b en safetensors: este repositorio solo aporta el empaquetado GGUF. Frente a modelos instruidos de tamaño similar, Pythia-2.8b no está alineado y no debe usarse como asistente conversacional.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable ni mantiene formato conversacional.
- Riesgo elevado de alucinación y de generar contenido tóxico o sesgado, ya que no ha pasado por RLHF ni filtrado de alineación; The Pile contiene texto web sin depurar.
- Idiomas: no hay información oficial en este repositorio; el modelo base está centrado en inglés, por lo que el rendimiento en castellano será limitado.
- Contexto: no documentado en la model card; el valor de 2048 tokens procede de la documentación del modelo base y puede variar según la configuración de llama.cpp.
- Cuantización no oficial: el repositorio no está verificado por EleutherAI; aunque el autor afirma haber validado la conversión con llama.cpp, conviene contrastar la perplejidad frente al original antes de usarlo en producción.
- Licencia Apache 2.0 permite uso comercial, pero la falta de alineación hace desaconsejable su despliegue en aplicaciones de cara al usuario sin supervisión.
- Repositorio con 0 descargas y 0 likes: sin comunidad ni mantenimiento documentado; el fichero podría no recibir actualizaciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-pythia-2.8b-GGUF
- Modelo base: https://huggingface.co/EleutherAI/pythia-2.8b
- Suite Pythia (EleutherAI): https://github.com/EleutherAI/pythia
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
