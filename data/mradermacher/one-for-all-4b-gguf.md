# mradermacher/One-For-All-4B-GGUF

## Resumen

One-For-All-4B-GGUF es la versión cuantizada en formato GGUF del modelo TendieLabs/One-For-All-4B, un ajuste fino (LoRA) sobre Qwen3.5-4B orientado a roleplay y personificación del personaje "One For All" del universo My Hero Academia. El trabajo de cuantización lo firma mradermacher, un publicador habitual de versiones GGUF de modelos de la comunidad en Hugging Face.

El modelo original se construye sobre la arquitectura Qwen3.5-4B con licencia Apache 2.0 y está especializado en conversación con persona fija, roleplay y fan-fiction en inglés. Esta versión GGUF facilita su ejecución en entornos locales mediante llama.cpp, Ollama u otros runtimes compatibles, sin necesidad de GPU de gama alta.

Es relevante para desarrolladores que quieran desplegar un modelo de personaje de bajo coste en hardware de consumo. No obstante, conviene señalar que el repositorio presenta cero descargas y cero likes en el momento de la consulta, y que el dato de parámetros en safetensors (333.514.240) no coincide con la etiqueta "4B" del nombre, lo que sugiere que el adaptador LoRA se publicó sin fusionar con los pesos base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B) con adaptador LoRA |
| Parámetros totales | 333.514.240 (según safetensors del repo); la etiqueta del nombre indica 4B |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS; además mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con ficheros mmproj para componente multimodal) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-4B, un transformer decoder-only de la familia Qwen3.5. Sobre él se aplica un ajuste fino mediante LoRA para especializarlo en la persona de "One For All" (personaje de My Hero Academia), con etiquetas que apuntan a roleplay, persona y fan-model. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La presencia de ficheros mmproj (Q8_0 y f16) en el repositorio indica que el modelo base o el adaptador incorporan un componente multimodal, presumiblemente visión, aunque la model card no lo detalla. La cuantización es estática (quantize_version 2, output_tensor_quantised 1) y el autor indica que no hay cuantizaciones ponderadas/imatrix disponibles por el momento. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en inglés con persona fija (roleplay del personaje One For All).
- Conversación multi-turno orientada a interpretación de personaje y fan-fiction.
- Posible soporte multimodal (los ficheros mmproj sugieren entrada de imagen), aunque no está documentado en la model card.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma.
- No se documenta modo "thinking" ni otras capacidades especiales.

## Casos de uso

- Roleplay y chatbots de personaje: el ajuste LoRA sobre Qwen3.5-4B está entrenado específicamente para mantener la persona de One For All, lo que permite desplegar un bot de rol coherente en local con cuantizaciones Q4_K_M o Q5_K_M.
- Comunidades de fan-fiction: generación asistida de diálogos y escenas dentro del universo My Hero Academia, ejecutable en portátiles con GPU de 8 GB.
- Prototipado de experiencias conversacionales: sirve como base para probar pipelines de chat con persona fija antes de invertir en modelos mayores.
- Demos educativas de ajuste fino: útil para ilustrar cómo un LoRA sobre un modelo de 4B transforma el comportamiento conversacional.
- Experimentación con cuantizaciones GGUF: el repositorio ofrece un abanico amplio (de Q2_K a f16) para medir el impacto de la cuantización en la calidad del roleplay.
- Despliegue en entornos con recursos limitados: al caber en GPUs de consumo, permite servir el modelo con llama.cpp u Ollama sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: en torno a 2-3 GB para Q4_K_M, 3-4 GB para Q5_K_M, 4-5 GB para Q8_0 y 7-8 GB para f16, asumiendo un modelo de ~4B parámetros.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090; en centro de datos, A100 o H100 para despliegues concurrentes.
- Cabe en GPU de consumo: sí, en cualquier GPU con 6 GB o más usando cuantizaciones Q4 o Q5.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runtimes compatibles con GGUF; los ficheros mmproj permiten carga multimodal en llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| One-For-All-4B-GGUF | ~4B (etiqueta) / 333M (safetensors) | no disponible | apache-2.0 | Roleplay, persona |
| Qwen3.5-4B (base) | ~4B | no disponible | apache-2.0 | Propósito general |
| Modelos de roleplay de la comunidad (tamaño similar) | 3-8B | variable | variable | Persona y narrativa |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo de nicho: especializado en un personaje concreto, con capacidad general reducida frente al Qwen3.5-4B base.
- Solo inglés: no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinación elevado en tareas factuales; no está pensado para uso informativo.
- Posible inconsistencia entre el tamaño declarado (4B) y los parámetros reales en safetensors (333M), lo que puede deberse a un adaptador LoRA no fusionado; conviene verificar antes de producción.
- Sin descargas ni validación comunitaria en el momento de la consulta.
- Licencia Apache 2.0 permite uso comercial, pero el contenido derivado de My Hero Academia puede estar sujeto a derechos de autor de terceros.
- No se documentan sesgos específicos ni evaluaciones de seguridad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/One-For-All-4B-GGUF
- Modelo base: https://huggingface.co/TendieLabs/One-For-All-4B
- Modelo Qwen3.5-4B (origen de la licencia): https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Página de descargas del autor: https://hf.tst.eu/model#One-For-All-4B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
