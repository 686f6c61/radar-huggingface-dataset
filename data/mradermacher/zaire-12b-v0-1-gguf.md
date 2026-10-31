# mradermacher/Zaire-12B-v0.1-GGUF

## Resumen

Zaire-12B-v0.1-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo ReadyArt/Zaire-12B-v0.1, realizadas por el usuario mradermacher, un cuantizador muy activo en la comunidad de Hugging Face. El modelo base es un LLM de 12B parámetros (11.907.350.576 parámetros exactos según los safetensors) orientado a roleplay, contenido conversacional para adultos y narrativa sin restricciones (unaligned), con etiquetas explícitas de NSFW, ERP, terror y violencia. La licencia del modelo es Apache 2.0, lo que permite su uso comercial.

Esta ficha cubre el repositorio de cuantizaciones, no el modelo original: mradermacher ofrece versiones desde Q2_K (4,9 GB) hasta Q8_0 (12,8 GB), además de cuantizaciones imatrix ponderadas en un repositorio aparte. La relevancia de este tipo de repositorio es práctica: permite ejecutar el modelo en hardware de consumo mediante llama.cpp, Ollama o interfaces compatibles con GGUF, con un equilibrio ajustable entre calidad y consumo de memoria. El repositorio incluye además archivos mmproj (suplemento multimodal), lo que sugiere que el modelo base dispone de capacidades visuales ejecutables vía llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer decoder, basado en el modelo base ReadyArt/Zaire-12B-v0.1) |
| Parametros totales | 11.907.350.576 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | mmproj-f16, mmproj-Q8_0, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas del modelo base en safetensors) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado, sino conversiones GGUF estáticas del modelo ReadyArt/Zaire-12B-v0.1. La conversión se realizó mediante el pipeline estándar de mradermacher (convert_type: hf), generando cuantizaciones en el rango de 2 a 8 bits por peso. El tamaño del repositorio completo es de 83,7 GB, correspondiente a la suma de todas las variantes. Los archivos mmproj-f16 y mmproj-Q8_0 son proyectores multimodales que permiten usar capacidades de visión con llama.cpp, lo que indica que el modelo base incorpora un componente de visión.

Sobre la arquitectura concreta, los datos de entrenamiento, el número de tokens, el uso de RLHF/DPO u otras técnicas de alineación del modelo base, no se ha publicado información en la model card disponible. Las etiquetas del repositorio ("unaligned", "roleplay", "ERP") indican que el modelo base está orientado a generación de contenido sin filtros de seguridad, probablemente derivado de un fine-tune sobre un modelo base de 12B parámetros de la comunidad.

## Capacidades

- Generación de texto conversacional e instruct, con orientación específica a roleplay y narrativa madura.
- Contenido para adultos (ERP), terror y violencia sin restricciones de alineación, según las etiquetas del autor.
- Capacidad multimodal (visión) mediante los archivos mmproj incluidos, ejecutable con llama.cpp.
- Uso como modelo instruct en cualquier runtime compatible con GGUF (llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui).
- Disponibilidad de cuantizaciones imatrix ponderadas en un repositorio complementario para mayor calidad a igual tamaño.
- No hay información publicada sobre tool calling, capacidades de agente, razonamiento multi-paso ni soporte multilingüe más allá del inglés.

## Casos de uso

- Roleplay interactivo local: el modelo puede ejecutarse en un PC de consumo con koboldcpp o SillyTavern para sesiones de rol narrativo largas, su caso de uso principal según las etiquetas del autor.
- Escritura creativa de ficción madura: generación de narrativa de terror, suspense o contenido adulto sin los filtros de seguridad de modelos comerciales, útil para autores que necesitan borradores sin censura.
- Chatbot personal desplegado en local: con la variante Q4_K_M (7,5 GB) cabe en una GPU de 8 GB de VRAM, permitiendo conversación multi-turno con privacidad total de los datos.
- Análisis de imágenes con instrucciones sin censura: gracias a los archivos mmproj, se puede usar en llama.cpp para describir o comentar imágenes en flujos donde los modelos alineados se niegan.
- Prototipado de interfaces de chat: su tamaño de 12B y formato GGUF lo hacen adecuado para pruebas rápidas de UX conversacional en portátiles con Ollama.
- Investigación sobre desalineación y seguridad de modelos: permite estudiar el comportamiento de modelos sin filtros en entornos controlados y aislados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo completo en GPU):
  - Q2_K: ~5,5 GB; Q3_K_M: ~6,8 GB; IQ4_XS: ~7,4 GB; Q4_K_M: ~8,1 GB; Q5_K_M: ~9,2 GB; Q6_K: ~10,5 GB; Q8_0: ~13,4 GB (añadiendo overhead de contexto).
- En consumer GPU: la variante Q4_K_M (7,5 GB) cabe cómodamente en una RTX 3060 de 12 GB, RTX 4060 Ti 16 GB o RTX 4070; la Q8_0 requiere una tarjeta de 16 GB como la RTX 4080 o 4090 para ejecución completa en GPU.
- En CPU o modo híbrido: cualquier variante hasta Q6_K es viable en equipos con 16 GB de RAM, con velocidades de entre 5 y 15 tokens/s en CPUs modernas de escritorio según la variante.
- GPU recomendadas para máximo throughput: RTX 4090 (24 GB) permite cargar Q8_0 con contexto amplio; en servidor, cualquier GPU con 16 GB o más.
- Despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui, y cualquier servidor compatible con GGUF (incluido vLLM con soporte experimental de GGUF). Los archivos mmproj requieren una versión reciente de llama.cpp para la parte de visión.
- Latencia y throughput exactos: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Orientacion |
|---|---|---|---|---|
| Zaire-12B-v0.1-GGUF (este) | 11,9B | GGUF (Q2_K a Q8_0) | apache-2.0 | Roleplay, NSFW, unaligned |
| Mistral Nemo 12B (base) | 12B | safetensors, GGUF comunitario | apache-2.0 | Uso general, multilingüe |
| Nous-Hermes-2-Mistral-7B | 7B | safetensors, GGUF comunitario | apache-2.0 | Instruct general, sin censura relativa |

Zaire-12B-v0.1 se sitúa en la franja de 12B parámetros, la misma que Mistral Nemo, y comparte con este la licencia Apache 2.0 y la amplia disponibilidad de cuantizaciones GGUF comunitarias. Frente a los modelos generales alineados, su diferenciador es la ausencia de filtros de contenido y la especialización en roleplay, a costa de un menor rigor en tareas de razonamiento o código (sin benchmarks publicados que lo confirmen). Los datos de contexto y rendimiento comparado no están disponibles.

## Limitaciones y advertencias

- Contenido explícito sin filtros: el modelo está etiquetado como NSFW, unaligned y not-for-all-audiences; puede generar contenido ofensivo, violento o sexualmente explícito sin advertencias. No es apto para entornos de producción orientados al público general.
- Idioma: solo se declara soporte para inglés; el rendimiento en castellano no está documentado y probablemente sea inferior o no garantizado.
- Sin benchmarks publicados: no hay datos objetivos de MMLU, HumanEval u otras métricas, por lo que su calidad general no puede verificarse de forma independiente.
- Riesgo de alucinación: no documentado específicamente, pero al tratarse de un fine-tune orientado a roleplay y no a factualidad, debe asumirse un riesgo elevado en tareas que requieran precisión factual.
- Longitud de contexto: no disponible; debe verificarse en la ficha del modelo base antes de diseñar aplicaciones con documentos largos.
- Licencia: Apache 2.0 permite uso comercial sin restricciones de licencia, pero la responsabilidad legal sobre el contenido generado recae íntegramente en el usuario; su uso para contenido adulto puede estar sujeto a restricciones legales según jurisdicción.
- Las cuantizaciones Q2_K y Q3_K_M presentan degradación de calidad notable respecto al modelo original; para uso serio se recomiendan Q4_K_M o superiores, o las variantes imatrix del repositorio complementario.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/Zaire-12B-v0.1-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Zaire-12B-v0.1
- Cuantizaciones imatrix (ponderadas): https://huggingface.co/mradermacher/Zaire-12B-v0.1-i1-GGUF
- Página de descarga con vista general: https://hf.tst.eu/model#Zaire-12B-v0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador (nethype GmbH): https://www.nethype.de/
