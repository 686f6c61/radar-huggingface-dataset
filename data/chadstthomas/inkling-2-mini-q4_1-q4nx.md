# chadstthomas/Inkling-2-Mini-Q4_1-Q4NX

## Resumen

Inkling-2-Mini-Q4_1-Q4NX es un paquete de cuantización del modelo Inkling-2-Mini desarrollado por Thinking Machines Lab, publicado por el usuario chadstthomas en Hugging Face. Se trata de una conversión del checkpoint original a formato Q4NX, un diseño de tiles de 32×256 en disposición column-major pensado específicamente para la arquitectura de NPU XDNA 2 de AMD. El modelo base es un MoE con arquitectura de bucles (inkling2_loop) de 26.400 millones de parámetros totales, aproximadamente 3.400 millones de parámetros únicos y unos 5.400 millones de parámetros activos efectivos.

La relevancia de este lanzamiento es fundamentalmente de infraestructura: no es un modelo nuevo, sino un artefacto de despliegue orientado a ejecutar el modelo base en aceleradores NPU de AMD mediante el stack Lemonade Server y FastFlowLM. El repositorio ocupa 17,6 GB y el tensor `model.q4nx` pesa 17.553.477.824 bytes (17,553 GB), con 728 tensores en total.

Conviene señalar que, según la propia model card, FastFlowLM v1.0.x todavía no incluye un motor AIE2P C++ para la arquitectura inkling2_loop, por lo que el bundle no es ejecutable directamente en NPU con el runtime actual. El autor lo presenta como un objetivo listo para el soporte futuro de FLM y para investigación sobre Q4NX, y recomienda usar llama.cpp con el backend ggml-aie (AIE2P BFP16) sobre el checkpoint GGUF como alternativa operativa hoy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con bucles (inkling2_loop), transformer con enrutamiento MoE y control de bucle |
| Parametros totales | 26,4 mil millones (26.4B) |
| Parametros activos | ~3,4B únicos; ~5,4B activos efectivos (loop) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4NX (Q4_1, tiles de 32×256, 5120 B por tile); componentes en BF16/F32 sin cuantizar; origen NVFP4 y UD-Q8_K_XL BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Q4NX (`model.q4nx`), con config.json, tokenizer.json, tokenizer_config.json, chat_template.jinja y model_list.json |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura Mixture-of-Experts con mecanismo de bucle (looped MoE), en la que el modelo reutiliza bloques de cómputo de forma iterativa, de ahí la distinción entre parámetros únicos (~3,4B) y parámetros activos efectivos (~5,4B). La estructura incluye capas de expertos MoE en los niveles 0 a 19 y una "coda" de expertos en los niveles 20 a 23, además de componentes auxiliares específicos: routers MoE con pesos y sesgos, shortconvs, clips, sinks, controles de bucle (`loop_*_ctrl_*`) y `attn_res_query`. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

En cuanto a la innovación técnica de esta ficha concreta, el trabajo de chadstthomas consiste en el reempaquetado del checkpoint a un layout Q4NX optimizado para la NPU XDNA 2 de AMD. Los pesos de atención (q/k/v/gate/o/rel_proj) y el `lm_head` se cuantizan a Q4NX Q4_1 con tiles de 5120 bytes; los expertos MoE de las capas 0 a 19 y de la coda 20 a 23 usan el mismo esquema, con los factores de escala NVFP4 del modelo original plegados a FP32 antes del tiling y con la dimensión K=1152 rellenada a 1280. Los embeddings se mantienen en BF16, y normas, routers, shortconvs, clips, sinks y controles de bucle permanecen en BF16/F32 sin pérdida. El resultado son 728 tensores empaquetados en un único archivo `model.q4nx`.

## Capacidades

- Generación de texto y razonamiento mediante un MoE con bucle que reutiliza cómputo para aumentar la profundidad efectiva sin incrementar proporcionalmente los parámetros únicos.
- Capacidad de ejecución en aceleradores NPU AMD XDNA 2 a través del formato Q4NX, una vez exista soporte del motor AIE2P en FastFlowLM.
- Compatibilidad con el ecosistema de despliegue de Unsloth Desktop para NPU AMD, que enruta los bundles `.q4nx` mediante Lemonade Server y FastFlowLM.
- Ejecución alternativa en CPU/GPU mediante llama.cpp con backend ggml-aie (AIE2P BFP16) sobre el checkpoint GGUF del que deriva.
- Soporte de plantilla de chat (`chat_template.jinja`) incluida en el bundle, lo que habilita conversación multi-turno formateada.
- Tool calling, function calling, capacidades de agente, multilingüismo, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre formatos de cuantización para NPU: el bundle sirve como referencia práctica de cómo empaquetar un MoE de 26,4B en tiles Q4NX de 32×256, útil para estudiar el impacto del layout column-major en el rendimiento de la NPU XDNA 2.
- Desarrollo de motores AIE2P: el paquete está pensado como objetivo de pruebas para implementar el soporte `inkling2_loop` en FastFlowLM (`libinkling2_loop_npu.so`), de modo que los desarrolladores del runtime pueden validar la carga y ejecución de tensores Q4NX.
- Despliegue en estaciones de trabajo con NPU AMD: en entornos con Ryzen AI y XDNA 2, una vez disponible el motor, el modelo permitiría inferencia local de un MoE de ~5,4B activos con un footprint de 17,6 GB, adecuado para asistentes locales con requisitos de privacidad.
- Evaluación comparativa de backends: permite contrastar el rendimiento de la ruta NPU (Lemonade/FastFlowLM) frente a la ruta llama.cpp + ggml-aie sobre el mismo modelo base, midiendo latencia y throughput en hardware idéntico.
- Prototipado de aplicaciones de razonamiento con presupuesto de memoria ajustado: con ~5,4B parámetros activos efectivos, el modelo es candidato para tareas de razonamiento multi-paso en equipos de gama alta con NPU integrada.
- Integración en pipelines de CI para validación de cuantizaciones: al incluir un mapa de cuantización explícito y un recuento de tensores definido (728), el bundle facilita pruebas automatizadas de integridad y reproducibilidad de conversiones Q4NX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/espacio en disco: el archivo `model.q4nx` ocupa 17.553 GB; el repositorio completo, 17,6 GB.
- Acelerador objetivo: NPU AMD XDNA 2 (AIE2P) con soporte del formato Q4NX de 32×256 tiles.
- Runtime previsto: Lemonade Server → FastFlowLM (`flm`) v1.0.x o superior, con la salvedad de que la versión actual no incluye motor `inkling2_loop`.
- Alternativa operativa actual: llama.cpp con backend ggml-aie (AIE2P BFP16) sobre el checkpoint GGUF `unsloth/Inkling-2-Mini-GGUF`.
- GPU consumer: no disponible; no se especifican requisitos de VRAM para CUDA ni modelos de GPU recomendados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Q4_1-Q4NX | 26,4B totales / ~5,4B activos | no disponible | Apache 2.0 | Q4NX (NPU AMD) | Este bundle; sin motor FLM disponible aún |
| thinkingmachines/Inkling-2-Mini | 26,4B totales / ~5,4B activos | no disponible | no disponible | no disponible | Modelo base original |
| unsloth/Inkling-2-Mini-GGUF | 26,4B totales / ~5,4B activos | no disponible | no disponible | GGUF (UD-Q8_K_XL BF16) | Fuente del reempaquetado; ejecutable con llama.cpp |

No se dispone de información sobre modelos de terceros comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El bundle no es ejecutable en NPU con FastFlowLM v1.0.x: falta el motor AIE2P `libinkling2_loop_npu.so`, por lo que su uso hoy requiere la ruta alternativa con llama.cpp y ggml-aie.
- El repositorio no registra descargas ni "likes", lo que indica ausencia de validación comunitaria y de evidencia de funcionamiento en producción.
- La cuantización Q4_1 introduce pérdida de precisión frente al checkpoint BF16 de origen; no se han publicado evaluaciones de degradación de calidad.
- Los factores de escala NVFP4 se pliegan a FP32 y la dimensión K se rellena de 1152 a 1280, lo que implica transformaciones adicionales sobre los pesos originales no validadas públicamente.
- No se especifican idiomas soportados, longitud de contexto ni sesgos conocidos; no es posible evaluar su adecuación multilingüe.
- La licencia Apache 2.0 permite uso comercial, pero se desconoce la licencia del modelo base original, lo que conviene verificar antes de explotación comercial.
- Riesgo de alucinación: no evaluado en la información disponible.
- El formato Q4NX es específico de hardware AMD XDNA 2, lo que limita la portabilidad a otras plataformas sin reconversión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/chadstthomas/Inkling-2-Mini-Q4_1-Q4NX
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Checkpoint GGUF de origen: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
