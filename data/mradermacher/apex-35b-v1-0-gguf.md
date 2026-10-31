# mradermacher/Apex-35B-V1.0-GGUF

## Resumen

Apex-35B-V1.0-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo Apex-35B-V1.0, desarrollado por Apexintelligence-AI y cuantizado por mradermacher, un cuantizador muy conocido en la comunidad de Hugging Face. El modelo base es un modelo de lenguaje de 35.505 millones de parámetros con arquitectura mixture-of-experts (MoE), etiquetado para tareas de agente, investigación y conversación. El repositorio de cuantizaciones pesa 244,4 GB en total y ofrece versiones desde Q2_K (13,3 GB) hasta Q8_0 (37,9 GB), además de suplementos multimodales (mmproj) en Q8_0 y f16.

La relevancia de este repositorio radica en que hace accesible un modelo de 35B de arquitectura MoE en hardware de consumo: gracias a la cuantización, el modelo puede ejecutarse en GPUs con 24 GB de VRAM (como la RTX 3090 o 4090) o incluso parcialmente en CPU mediante llama.cpp u Ollama. La licencia Apache 2.0 del modelo base permite su uso comercial sin restricciones significativas, lo que lo convierte en una opción interesante para despliegues autoalojados.

El idioma principal del modelo es el inglés, y la model card original no publica detalles sobre longitud de contexto, datos de entrenamiento ni benchmarks, por lo que varios de estos apartados se indican como no disponibles. El modelo base original en safetensors está disponible en Apexintelligence-AI/Apex-35B-V1.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE), transformer (detalles no disponibles) |
| Parámetros totales | 35.505.251.456 (~35,5B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base, Apex-35B-V1.0, emplea una arquitectura mixture-of-experts, según las etiquetas del repositorio. En los modelos MoE, cada capa de transformador contiene múltiples expertos y un mecanismo de enrutamiento que activa solo un subconjunto de ellos por token, lo que permite escalar el número total de parámetros manteniendo un coste computacional por token inferior al de un modelo denso equivalente. Sin embargo, ni el número de expertos ni los parámetros activos por token se han publicado en la información disponible.

Tampoco se dispone de datos sobre el corpus de entrenamiento (número de tokens, composición del dataset) ni sobre el uso de técnicas de alineación como RLHF o DPO. Las etiquetas "agent", "research" y "conversational" sugieren un enfoque en uso conversacional y agentes, pero no hay documentación técnica que lo confirme. La presencia de archivos mmproj (suplemento multimodal) en las cuantizaciones indica que el modelo base incorpora capacidades multimodales, probablemente visión, aunque no se detalla su alcance.

## Capacidades

- Generación de texto conversacional (etiqueta "conversational" en el repositorio).
- Capacidades de agente (etiqueta "agent"), presumiblemente para razonamiento multi-paso y uso de herramientas, aunque no se documenta el soporte concreto de function calling.
- Orientado a investigación (etiqueta "research").
- Capacidad multimodal probable: los archivos mmproj-Q8_0 y mmproj-f16 son proyectores multimodales que acompañan a modelos con entrada de visión en el ecosistema llama.cpp.
- Uso eficiente en hardware de consumo gracias a la amplia gama de cuantizaciones GGUF disponibles.
- Idioma principal: inglés; no se declara soporte multilingüe.

## Casos de uso

- Chatbots y asistentes conversacionales autoalojados: el modelo puede servir como backend de diálogo en inglés en infraestructura propia, evitando depender de APIs externas, con la ventaja de la licencia Apache 2.0 para uso comercial.
- Sistemas de agentes y automatización: la etiqueta "agent" sugiere integración en frameworks de agentes (por ejemplo, pipelines con llamadas a herramientas), ejecutando el modelo localmente con llama.cpp o vLLM mediante su soporte de GGUF.
- Prototipado e investigación: al tratarse de un modelo etiquetado para "research", resulta útil para experimentar con arquitecturas MoE de 35B sin necesidad de un clúster, gracias a las cuantizaciones de 13-38 GB.
- Aplicaciones multimodales locales: si se usan los archivos mmproj junto al modelo, se pueden construir aplicaciones que combinen texto e imágenes en local (por ejemplo, descripción de imágenes o análisis visual básico).
- Despliegue en GPU única de gama alta: la cuantización Q4_K_M (21,8 GB) cabe en una RTX 3090/4090 de 24 GB, lo que permite ofrecer servicios de inferencia en estaciones de trabajo individuales.
- Pruebas comparativas de cuantizaciones: la colección completa de quants (Q2_K a Q8_0) permite evaluar el compromiso entre calidad y consumo de recursos para ajustar despliegues en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (solo pesos del modelo, sin KV-cache):
  - Q2_K: 13,3 GB
  - Q3_K_S / Q3_K_M / Q3_K_L: 15,6-18,7 GB
  - IQ4_XS: 19,5 GB
  - Q4_K_S / Q4_K_M: 20,5-21,8 GB
  - Q5_K_S / Q5_K_M: 24,7-25,4 GB
  - Q6_K: 29,3 GB
  - Q8_0: 37,9 GB
- GPUs recomendadas: RTX 3090 o RTX 4090 (24 GB) para Q4_K_M; GPUs de 48 GB (A6000, L40S) para Q6_K; A100/H100 de 40-80 GB para Q8_0 con margen para contexto.
- Consumer GPUs: sí, las cuantizaciones Q2_K a Q4_K_M caben en una RTX 3090/4090 de 24 GB; las de 16 GB (RTX 4080/4060 Ti) solo admiten Q2_K/Q3_K_S, con espacio limitado para contexto. En CPU pura, es ejecutable con llama.cpp con offloading parcial de capas a GPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. El modelo base en safetensors puede desplegarse con vLLM o TGI.
- Latencia y throughput: no disponibles; al ser MoE, si los parámetros activos son bajos, cabe esperar velocidades superiores a las de un modelo denso de 35B, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Apex-35B-V1.0 | 35,5B (totales) | MoE | Apache 2.0 | safetensors / GGUF | Multimodal probable, en inglés |
| Qwen3-30B-A3B | 30,5B totales / 3,3B activos | MoE | Apache 2.0 | safetensors / GGUF | Contexto largo, benchmarks publicados |
| Mixtral 8x7B Instruct | 46,7B totales / ~12,9B activos | MoE | Apache 2.0 | safetensors / GGUF | Multilingüe, muy soportado por runtimes |

Los modelos alternativos citados tienen documentación y benchmarks públicos más completos; Apex-35B-V1.0 destaca por su licencia permisiva y su tamaño intermedio, pero carece de datos de rendimiento publicados para una comparación rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; no existe documentación sobre evaluación de sesgos del modelo base.
- Riesgo de alucinación: no evaluado públicamente; al tratarse de un modelo sin benchmarks publicados, se recomienda validación exhaustiva antes de uso en producción.
- Limitación de idioma: el modelo está declarado solo en inglés; no se espera buen rendimiento en castellano u otros idiomas.
- Longitud de contexto no documentada: es imprescindible verificarla antes de diseñar aplicaciones que dependan de contextos largos.
- Cuantizaciones bajas (Q2_K, Q3_K_M): según la propia model card, presentan pérdida de calidad apreciable; se recomiendan Q4_K_M o superiores para uso serio.
- Las cuantizaciones son de terceros (mradermacher); cualquier problema de conversión no afecta al modelo original, y los quants weighted/imatrix están en un repositorio separado.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar el enlace a la licencia del modelo base para condiciones adicionales.
- Los archivos mmproj añaden hasta 1 GB y solo son necesarios si se usa la capacidad multimodal.

## Enlaces

- Repositorio de cuantizaciones GGUF: https://huggingface.co/mradermacher/Apex-35B-V1.0-GGUF
- Modelo base: https://huggingface.co/Apexintelligence-AI/Apex-35B-V1.0
- Cuantizaciones weighted/imatrix: https://huggingface.co/mradermacher/Apex-35B-V1.0-i1-GGUF
- Página de descarga con vista general: https://hf.tst.eu/model#Apex-35B-V1.0-GGUF
- Licencia del modelo base: https://huggingface.co/Apexintelligence-AI/Apex-35B-V1.0/blob/main/LICENSE
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
