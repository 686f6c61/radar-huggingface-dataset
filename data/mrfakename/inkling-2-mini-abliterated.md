# mrfakename/Inkling-2-Mini-abliterated

## Resumen

Inkling-2-Mini-abliterated es una variante del modelo multimodal thinkingmachines/Inkling-2-Mini a la que se le ha eliminado el comportamiento de rechazo (refusal) mediante ablación direccional. Lo publica mrfakename, un desarrollador conocido en el ecosistema open source por sus versiones "abliterated" y "uncensored" de modelos populares. El modelo base es un transformer de tipo mixture-of-experts (MoE) con arquitectura de capas "looped" (inkling2_loop), pipeline image-text-to-text, y un total de 26.388.646.440 parámetros según los safetensors del repositorio.

La relevancia de este modelo es doble. Por un lado, demuestra una técnica de ablación más sofisticada que la media: en lugar de restar una dirección de rechazo a nivel de capa de forma uniforme, mide las direcciones por separado para chat y para modo think, en cada uno de los 48 slots de capa que recorre el modelo por token (las capas 6-17 se ejecutan tres veces), y aplica fuerzas distintas por capa y por tipo de tensor. Por otro, preserva los formatos nativos de cuantización del original (NVFP4 en capas 6-19 y MXFP8 en capas 20-23) y mantiene intactos los pesos de las capas 0-5, el router, los controladores de bucle, los embeddings, la torre de visión y el fichero mtp.safetensors.

El resultado declarado por el autor es una reducción de rechazos del 100% al 1% en modo chat y del 76% al 0% en modo think, sobre 100 prompts dañinos reservados (held-out), con un KL de 0,116 en el primer token de prompts inofensivos. El modelo se distribuye bajo licencia Apache 2.0 y en formato safetensors con cuantización NVFP4 (modelopt), además de una LoRA GGUF y un fichero NPZ con la base del subespacio y las escalas por capa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas "looped" (tag `inkling2_loop`; las capas 6-17 se ejecutan tres veces por token, 48 slots por token) |
| Parametros totales | 26.388.646.440 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (modelopt) en capas 6-19; MXFP8 en capas 20-23; GGUF Q8_0 disponible en repo separado; LoRA GGUF rank-1 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint NVFP4 parcheado), GGUF (Q8_0 y otros en repo aparte), LoRA GGUF, NPZ con base del subespacio |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con una innovación estructural notable: capas "looped" o recurrentes en las que el bloque de capas 6-17 se ejecuta tres veces por token, dando lugar a 48 slots de capa efectivos por token. Esto implica que los pesos de esas capas se comparten entre las tres pasadas, algo que el autor del abliterated aprovecha explícitamente: la edición aplicada al residual stream afecta a las tres pasadas a la vez. El modelo es multimodal (pipeline image-text-to-text), con una torre de visión separada que en esta variante permanece bit-idéntica al original. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

La modificación de esta variante es una ablación direccional multiobjetivo. Se midieron direcciones de rechazo por separado para chat (reasoning effort `none`) y para prompts de tipo think, sobre el GGUF Q8_0, en cada uno de los 48 slots de capa. Los candidatos de subespacio son los vectores singulares principales de las direcciones de los slots posteriores, donde el rechazo se separa mejor. Una búsqueda multiobjetivo (minimizar rechazos, mantener bajo el KL del primer token en prompts inofensivos) eligió rango 1 (una sola dirección) y fuerzas por capa: 0,47-0,65 en las down-projections de expertos de las capas 6-23, y 0,97-1,31 en las salidas de atención de las capas 8-23. Las capas 0-5 no se tocan. La dirección se proyecta fuera de las escrituras al residual stream: `attn.wo_ud` (BF16) en 16 capas y `mlp.experts.w2_weight` para los 128 expertos en 18 capas, un total de 34 tensores.

Un detalle técnico relevante es cómo se preserva la cuantización: los pesos de expertos se mantienen en sus formatos nativos (NVFP4 en capas 6-19, MXFP8 en capas 20-23) y solo cambian los códigos de 4/8 bits, manteniendo todas las escalas. En lugar de re-redondear (que dejaría ~60% de la dirección eliminada como ruido de redondeo), cada peso se lleva al valor de rejilla inmediatamente inferior o superior, elegido fila a fila para que los errores de redondeo se cancelen a lo largo de la dirección eliminada. Queda ~1,4% de la dirección en las capas NVFP4 y ~0,4% en las MXFP8; el fichero `bake-stats.txt` lista cada tensor.

## Capacidades

- Generación de texto conversacional multi-turno, con modo chat (reasoning effort `none`) y modo think (razonamiento explícito).
- Razonamiento multi-paso en modo think, con presupuesto de tokens configurable (el autor usó 384 tokens en sus evaluaciones).
- Procesamiento de imagen y texto (pipeline image-text-to-text), gracias a la torre de visión heredada del modelo base.
- Capacidades de código y matemáticas: no documentadas explícitamente en la información disponible, pero plausibles por herencia del modelo base; no confirmadas.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes: no documentado en la información disponible.
- Capacidades multilingües: no documentadas; el campo de idiomas no está disponible.
- Cumplimiento de solicitudes dañinas: comportamiento de rechazo prácticamente eliminado (1/100 en chat, 0/100 en think sobre prompts dañinos reservados).
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere despliegue en infraestructura de inferencia gestionada.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve como caso de estudio controlado para medir cómo la ablación direccional afecta a la tasa de rechazo y al KL en prompts inofensivos, con métricas publicadas (1% vs 100% de rechazos, KL 0,116) que permiten reproducir y comparar metodologías.
- Evaluación de robustez de clasificadores de seguridad: al generar respuestas a solicitudes dañinas que el modelo original rechazaba, se puede usar como generador de casos adversarios para entrenar y validar filtros de contenido en pipelines de moderación.
- Análisis de la estructura interna de modelos MoE con capas recurrentes: los ficheros `abliteration-edit.npz` (base del subespacio y escalas por capa) y `bake-stats.txt` permiten estudiar cómo se distribuye la dirección de rechazo a lo largo de los 48 slots de capa y entre atención y expertos.
- Aplicación de la edición a otras copias del modelo base: la LoRA GGUF rank-1 permite reproducir el mismo efecto sobre los GGUFs originales con `llama-server -m Inkling-2-Mini-Q8_0.gguf --lora abliteration-lora.gguf`, útil para equipos que ya tienen el modelo base cuantizado y quieren evitar descargar el checkpoint completo.
- Despliegue de asistentes conversacionales sin fricción de rechazo en dominios legítimos sensibles (ficción, roleplay adulto consentido, red teaming autorizado), donde los rechazos del modelo base degradan la experiencia y el operador asume la responsabilidad del uso.
- Procesamiento multimodal de documentos: al conservar la torre de visión intacta, puede emplearse para tareas image-text-to-text (descripción de imágenes, extracción de información visual) con el mismo rendimiento que el base en esa rama.
- Benchmarking de técnicas de cuantización: la preservación de NVFP4 y MXFP8 con códigos re-redondeados de forma dirigida es un caso práctico para estudiar el impacto del redondeo en ediciones de pesos sobre modelos cuantizados.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las métricas de eficacia de la ablación sobre el GGUF Q8_0 con decodificación greedy, sobre 100 prompts dañinos reservados:

| Metrica | Original | Abliterated |
|---|---|---|
| Rechazos, chat (/100) | 100 | 1 |
| Modo think, rechazo en razonamiento o respuesta (/100) | 76 | 0 |
| KL, primer token en prompts inofensivos | 0 | 0,116 |

El autor indica que las respuestas a prompts inofensivos tienen longitud similar (587 vs 638 caracteres de media) y no muestran repetición. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 20,2 GB en safetensors NVFP4/MXFP8, por lo que el checkpoint completo requiere al menos ~21-24 GB de VRAM para cargar pesos más overhead de activaciones y KV cache; el GGUF Q8_0 del repo separado será mayor (~26-28 GB estimados por los 26,4B parámetros a 8 bits, sin contar overhead).
- GPU recomendadas: A100 40GB, H100, L40S 48GB o RTX 6000 Ada para el checkpoint NVFP4 completo; para el GGUF Q8_0 se necesita al menos 32 GB (A100 40GB, RTX 5090 32GB, o dos RTX 4090).
- Cabe en GPU consumer: el checkpoint NVFP4 podría caber en una RTX 4090 24GB con cuantizaciones adicionales, aunque el margen es ajustado; el GGUF Q8_0 no cabe en 24 GB.
- Opciones de despliegue: transformers (librería declarada), llama.cpp / llama-server para los GGUFs (con soporte de `--lora` para aplicar la edición), vLLM y TGI si soportan la arquitectura `inkling2_loop` (no confirmado), y endpoints gestionados (tag `endpoints_compatible`).
- Latencia y throughput: no disponibles. La arquitectura de capas recurrentes (tres pasadas por las capas 6-17) implica un coste computacional por token superior al de un transformer de profundidad equivalente, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos (chat) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-abliterated | 26,4B (MoE, activos no disp.) | no disponible | 1/100 | Apache 2.0 | HF (safetensors NVFP4, GGUF, LoRA) |
| thinkingmachines/Inkling-2-Mini (base) | 26,4B (MoE, activos no disp.) | no disponible | 100/100 | Apache 2.0 | HF (safetensors NVFP4) |
| Otras variantes abliterated de mrfakename | variable | variable | variable | según base | HF |

No se dispone de información sobre otros modelos comparables de la misma categoría (MoE multimodal de ~26B con ablación) en la información proporcionada.

## Limitaciones y advertencias

- El modelo cumplirá solicitudes dañinas: el autor lo advierte explícitamente y traslada al usuario la responsabilidad del uso. No debe desplegarse en entornos de producción orientados al público sin capas de moderación externas.
- Sesgos conocidos: no documentados en la información disponible; al heredar el modelo base, es probable que arrastre sus sesgos, pero no se han publicado evaluaciones.
- Riesgo de alucinación: no evaluado en la información disponible; el modo think con presupuesto corto (384 tokens en las pruebas del autor) puede producir razonamientos truncados.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están disponibles, lo que impide validar su idoneidad para tareas multilingües o de contexto largo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la licencia no exime del cumplimiento de normativa aplicable (por ejemplo, la Ley de IA de la UE o la DMCA) ni de las políticas de los proveedores de inferencia.
- Caveat de cuantización: aunque la edición preserva los formatos NVFP4/MXFP8, queda ~1,4% y ~0,4% de la dirección de rechazo respectivamente; el comportamiento puede diferir ligeramente entre el checkpoint NVFP4 y el GGUF Q8_0.
- Compatibilidad: el tag `inkling2_loop` indica una arquitectura no estándar; verificar el soporte en vLLM, TGI y llama.cpp antes de comprometerse con un despliegue.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que limita la validación comunitaria de los resultados declarados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrfakename/Inkling-2-Mini-abliterated
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUFs cuantizados: https://huggingface.co/mrfakename/Inkling-2-Mini-abliterated-GGUF
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Discord del autor: https://discord.com/invite/foss
- Hugging Face Jobs (cómputo usado para la ablación): https://huggingface.co/docs/huggingface_hub/guides/jobs
