# paradigma-inc/limite-1b-base-soup

## Resumen

Limite 1B - Base Soup es el checkpoint posterior al proceso de "soup" (mezcla de pesos) de la familia Limite 1B, desarrollada por Paradigma Inc. Se trata de un modelo de lenguaje causal de aproximadamente 1.035 millones de parametros (1B) orientado a generacion de texto, razonamiento matematico y conversacion, con licencia Apache-2.0. El checkpoint se distribuye en formato safetensors con codigo de arquitectura personalizado, lo que obliga a usar `trust_remote_code=True` al cargarlo con Transformers.

El modelo emplea una arquitectura hibrida de atencion con ventanas locales y globales (el autor rechaza explicitamente la combinacion FlashAttention 2 + StaticCache por no producir logits numericamente correctos con ese diseno), lo que lo situa en la linea de los transformers eficientes de ultima generacion. Su tamano compacto lo hace apto para inferencia en una sola GPU, incluida gama consumer, y su licencia permisiva facilita el uso comercial.

La relevancia actual del checkpoint radica en su publicacion acompanada de un informe tecnico (arXiv:2611.21646) y de una integracion oficial con vLLM para servir en produccion con batching continuo. No obstante, la model card de este checkpoint concreto es minima y remite al checkpoint principal de la familia (Limite 1B - Violetto) para la documentacion completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con atencion hibrida local/global (custom_code, `trust_remote_code=True`) |
| Parametros totales | 1.035.253.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal con un esquema de atencion hibrido que combina atencion global y atencion de ventana deslizante (sliding-window), segun se deduce de las rutas de inferencia documentadas (SDPA con `StaticCache` mixto global/sliding-window). El codigo de la arquitectura se descarga desde el propio repositorio, por lo que no es compatible con implementaciones estandar de Transformers sin `trust_remote_code=True`. El modelo soporta una unica replica por proceso: no admite sharding automatico ni paralelismo tensorial o de pipeline en la implementacion de Transformers.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO o tecnicas de alineacion adicionales. El sufijo "soup" indica que el checkpoint se obtuvo mediante mezcla de pesos (model soup) a partir de la familia Limite 1B, pero no se detalla la receta en la informacion disponible. El informe tecnico asociado (arXiv:2611.21646) es la referencia para los detalles de entrenamiento.

## Capacidades

- Generacion de texto causal en formato conversacional (chat template via `apply_chat_template`).
- Razonamiento matematico: el modelo esta etiquetado explicitamente con `mathematics` y `reasoning`, y la model card incluye un ejemplo de resolucion de ecuaciones.
- Razonamiento multi-paso orientado a problemas aritmeticos y logicos.
- Conversacion multi-turno mediante plantilla de chat.
- Inferencia compatible con SDPA y FlashAttention 2 (con `DynamicCache`), y con `StaticCache` + `torch.compile` bajo SDPA.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (idiomas no declarados).
- Vision, audio o modo thinking explicito: no disponible.

## Casos de uso

- Resolucion de problemas matematicos paso a paso: el modelo esta etiquetado para matematicas y razonamiento, y su ejemplo oficial resuelve ecuaciones simples; puede integrarse en tutores automaticos o asistentes de estudio que expliquen el procedimiento.
- Asistente conversacional ligero en aplicaciones de escritorio o moviles: con 1B de parametros y pesos safetensors de 2,1 GB, cabe en GPU consumer y permite desplegar un chatbot local sin dependencia de la nube.
- Generacion de texto en pipelines de procesamiento por lotes: su soporte de `StaticCache` + `torch.compile` bajo SDPA permite acelerar la generacion en escenarios de alto volumen con formas de secuencia fijas.
- Servicio de inferencia en produccion con vLLM: la integracion oficial con vLLM (repositorio limite-violetto) habilita batching continuo y planificacion multi-GPU de peticiones, adecuada para APIs de generacion de texto.
- Prototipado e investigacion en arquitecturas de atencion hibrida: al ser un modelo pequeno con atencion local/global y codigo abierto, sirve como banco de pruebas para estudiar eficiencia de atencion y mezcla de pesos.
- Fine-tuning experimental y evaluacion de recetas: aunque el entrenamiento completo no esta validado oficialmente, la implementacion es diferenciable y expone la perdida causal estandar, lo que permite experimentar con adaptaciones siempre que se asuma el riesgo de falta de soporte.
- Educacion y demostraciones de IA open source: su licencia Apache-2.0 y su tamano permiten incluirlo en cursos y talleres sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,1 GB en precision original (pesos safetensors); en fp16/bf16 en torno a 2 GB, mas overhead de cache KV y activaciones. La cuantizacion a 8 o 4 bits reduciria el requisito, pero no se documentan formatos de cuantizacion oficiales.
- GPU recomendadas: validado oficialmente en NVIDIA H100 con Python 3.12, PyTorch 2.11.0 (CUDA 13.0) y Transformers 5.6.2. Otras combinaciones de hardware y versiones no estan formalmente cualificadas.
- GPU consumer: por tamano, cabe holgadamente en GPUs consumer con 8 GB o mas de VRAM (por ejemplo, RTX 3060/4060 en adelante); no se ha validado oficialmente en ellas.
- Despliegue: Transformers con SDPA (por defecto) o FlashAttention 2 via `kernels-community/flash-attn2` con `kernels==0.12.3`; para produccion, integracion oficial con vLLM. No se mencionan llama.cpp, Ollama ni TGI.
- Multi-GPU: en Transformers solo se soportan replicas independientes (un proceso por GPU con `device_map={"": local_rank}`); el sharding y el paralelismo tensorial/pipeline no estan soportados. El batching continuo y la planificacion multi-GPU requieren vLLM.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo ni de una seleccion de alternativas documentada en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. A nivel de ficha tecnica, el modelo se situa en la categoria de LLM de ~1B parametros con licencia Apache-2.0 y arquitectura de atencion hibrida; la comparacion con alternativas concretas requeriria datos de benchmarks que no se han publicado en la informacion disponible.

## Limitaciones y advertencias

- La model card de este checkpoint es minima y remite al checkpoint principal (Limite 1B - Violetto) para la documentacion completa; los detalles de contexto, idiomas y cuantizacion no estan disponibles aqui.
- Requiere `trust_remote_code=True`: se ejecuta codigo de arquitectura descargado del repositorio, lo que implica un riesgo de seguridad y de reproducibilidad que debe evaluarse en produccion.
- No soporta sharding ni paralelismo en Transformers; solo una replica por proceso. Para escalado multi-GPU es necesario usar la integracion con vLLM.
- La combinacion FlashAttention 2 + `StaticCache` esta rechazada explicitamente por producir logits incorrectos; debe usarse SDPA + `StaticCache` o FlashAttention 2 + `DynamicCache`.
- El entrenamiento completo, gradient checkpointing, PEFT/LoRA y entrenamiento distribuido no estan validados oficialmente; solo se soporta inferencia.
- Solo se ha validado en H100 con versiones concretas de Python, PyTorch y Transformers; otras combinaciones no estan cualificadas.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano; no se documentan evaluaciones de fidelidad.
- Sesgos conocidos: no disponible.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene conservar avisos de licencia y citar el informe tecnico.
- Idiomas soportados no declarados: no se garantiza un rendimiento adecuado fuera del ingles (idioma de los ejemplos de la model card).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/paradigma-inc/limite-1b-base-soup
- Checkpoint principal de la familia (Limite 1B - Violetto): https://huggingface.co/paradigma-inc/limite-1b-violetto
- Informe tecnico (arXiv): https://arxiv.org/abs/2611.21646
- Integracion con vLLM (repositorio): https://github.com/paradigma-inc/limite-violetto
