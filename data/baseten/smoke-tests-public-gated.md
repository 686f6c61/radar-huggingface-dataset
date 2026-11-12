# baseten/smoke-tests-public-gated

## Resumen

`baseten/smoke-tests-public-gated` es un modelo alojado en Hugging Face por Baseten, una plataforma de despliegue de modelos de IA. Por su identificador ("smoke-tests-public-gated") y por sus características tecnicas, se trata de un artefacto de pruebas internas de la plataforma, publicado como repositorio publico pero con acceso restringido (gated). No es un modelo pensado para uso general ni para produccion, sino una pieza de validacion de pipelines de despliegue.

El modelo sigue la arquitectura T5 (encoder-decoder transformer) con aproximadamente 76,96 millones de parametros, lo que corresponde a la variante T5-small o una configuracion muy proxima. Esta orientado a tareas de text2text-generation y declara soporte para ingles, frances, rumano y aleman, ademas de la etiqueta generica "multilingual".

Su relevancia practica es limitada: no tiene descargas ni likes, el pipeline no esta declarado y el acceso requiere aceptar condiciones en Hugging Face. Resulta util unicamente como referencia tecnica de como Baseten empaqueta y publica modelos de prueba, o como ejemplo de modelo T5 pequeno con pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 (encoder-decoder transformer) |
| Parametros totales | 76.961.152 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, fr, ro, de, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, pytorch, tf, jax |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura T5, un transformer encoder-decoder con atencion completa y normalizacion por capas, presentada originalmente en el paper "Exploring the Limits of Transfer Learning with a Unified Text-to-Text Framework" (arXiv:2210.11416 referencia a T5 v1.1 y arXiv:1910.09700 a la familia T5 original). El tamano de 76,96 M de parametros encaja con la configuracion T5-small, que usa 6 capas de encoder y 6 de decoder, 8 cabezas de atencion y una dimension de modelo de 512.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens procesados ni si hubo fases de RLHF o DPO. Los tags del repositorio listan datasets de evaluacion y referencia (svakulenk0/qrecc, taskmaster2, djaym7/wiki_dialog, deepmind/code_contests, lambada, gsm8k, aqua_rat, esnli, quasc, qed), lo que sugiere que el modelo se usa como banco de pruebas contra esos conjuntos mas que como modelo entrenado especificamente para ellos. No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto condicionada a una entrada (text2text), propia de la familia T5.
- Traduccion entre los idiomas declarados (en, fr, ro, de) y generacion multilingue basica.
- Respuesta a tareas de resumen, parafrasis y reescritura dentro de los limites de un modelo pequeno.
- Razonamiento aritmetico y de sentido comun muy limitado, coherente con 77 M de parametros.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, vision ni audio.
- Capacidad multilingue declarada, aunque sin evaluacion publica que la respalde.

## Casos de uso

- Pruebas de humo (smoke tests) en pipelines de despliegue: el modelo sirve para verificar que un endpoint de Baseten arranca, carga pesos safetensors y responde a peticiones de inferencia antes de desplegar modelos mayores.
- Validacion de integraciones con Hugging Face Hub: util para comprobar el flujo de repositorios gated, aceptacion de condiciones y descarga autenticada.
- Benchmarking de infraestructura: al ser un T5 pequeno, permite medir latencia y throughput de un backend (vLLM, TGI, Triton) sin consumir recursos significativos.
- Pruebas de compatibilidad de formatos: al publicar pesos en pytorch, tf, jax y safetensors, sirve para validar conversiones entre frameworks.
- Educacion y experimentacion: ejemplo minimo de modelo encoder-decoder para estudiar tokenizacion, generacion condicionada y evaluacion con datasets como SQuAD o XNLI.
- Evaluacion de pipelines de traduccion automatica a pequena escala en entornos de desarrollo, sin expectativas de calidad de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,3 GB (77 M de parametros x 4 bytes), mas overhead de activaciones y tokenizador.
- VRAM estimada en fp16/bf16: aproximadamente 0,15 GB.
- Cabe holgadamente en cualquier GPU consumer, incluida una GTX 1650, RTX 3050 o superior; tambien funciona en CPU.
- GPU recomendadas para pruebas de throughput: T4, L4, A10G o RTX 4090; el modelo no aprovecha aceleradores de gama alta por su tamano.
- Opciones de despliegue: Hugging Face Transformers, Text Generation Inference (TGI), vLLM, Triton Inference Server, ONNX Runtime y llama.cpp no aplica (no hay pesos GGUF publicados).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| baseten/smoke-tests-public-gated | 76,96 M | no disponible | apache-2.0 | gated en HF |
| google-t5/t5-small | 60 M | 512 tokens | apache-2.0 | publico en HF |
| google-t5/t5-base | 220 M | 512 tokens | apache-2.0 | publico en HF |
| google/flan-t5-small | 77 M | 512 tokens | apache-2.0 | publico en HF |

La comparativa se basa en la familia T5, a la que pertenece el modelo por arquitectura y tamano. No se dispone de datos de rendimiento para el modelo de Baseten que permitan una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Modelo de pruebas internas: no esta pensado para uso en produccion ni para tareas reales de usuario final.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face antes de descargar los pesos.
- Sin descargas ni likes: no hay evidencia de uso comunitario ni de validacion externa.
- Sin benchmarks publicados: no se puede afirmar su calidad en ninguna tarea concreta.
- Riesgo alto de alucinacion y errores factuales por el tamano reducido del modelo (77 M de parametros).
- Capacidad multilingue declarada pero no evaluada; el rendimiento en fr, ro y de puede ser muy inferior al de modelos multilingues dedicados.
- Longitud de contexto no documentada; probablemente limitada a 512 tokens si sigue la configuracion estandar de T5.
- Licencia apache-2.0 permite uso comercial, pero la ausencia de garantias y de documentacion desaconseja su uso en entornos productivos.
- El pipeline no esta declarado en la tarjeta del modelo, lo que complica la integracion automatica con librerias de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/baseten/smoke-tests-public-gated
- Paper T5 v1.1: https://arxiv.org/abs/2210.11416
- Paper T5 original: https://arxiv.org/abs/1910.09700
- Documentacion de Baseten: https://docs.baseten.co
- Repositorio de referencia T5 (Google Research): https://github.com/google-research/text-to-text-transfer-transformer
