# 1beb/clef-flash-radiance

## Resumen

clef-flash-radiance es un reempaquetado del modelo de decisión cloudflare/clef-flash en dos contenedores para el motor de inferencia radiance, con el cabezal de esquema conjunto (joint schema head) integrado en el propio contenedor. Lo publica el usuario 1beb y no entrena pesos nuevos: los pesos son de Cloudflare bajo licencia Apache-2.0 y el trabajo consiste en la conversión a los formatos `clef_bf16` y `clef_fp8` del plugin de arquitectura `clef` de radiance. El objetivo es servir decisiones estructuradas (preguntas de tipo noul, choice y score) mediante un único endpoint HTTP `POST /v1/systemone`, sin ningún proceso Python auxiliar.

El modelo no es un generador de texto conversacional, sino un modelo de decisión: recibe un estado (por ejemplo, el texto de una reclamación de cliente) y un conjunto de preguntas tipadas con sus criterios, y devuelve todas las respuestas decididas de forma conjunta en una sola pasada. Los tags del repositorio lo asocian a la familia qwen3.5 y a la arquitectura de Cloudflare, aunque la model card no detalla el número de parámetros ni la longitud de contexto nativa.

La relevancia actual está en el despliegue: al empaquetar los pesos en un contenedor autodescriptivo con la geometría del cabezal en la cabecera, se elimina la dependencia de un stack Python y se habilita inferencia de baja latencia (71 ms por decisión en prompts cortos con fp8) en hardware AMD gfx1201. El repositorio ocupa 62,5 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | clef (transformer con mezcla de atención y delta net, según los nombres de módulos `attn_qg`, `attn_k`, `attn_v`, `attn_output`, `ssm_inz`, `ssm_out`, `ffn_gate_up`, `ffn_down`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 16.384 tokens en el ejemplo de arranque (`--max-model-len 16384`); longitud nativa no disponible |
| Tipos de cuantizacion | bf16 (contenedor `clef-flash-head.rad`) y fp8 e4m3 con escalas bf16 por bloque de 128x128 (contenedor `clef-flash-fp8-head.rad`) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Contenedor propietario `.rad` de radiance, con `joint_head.safetensors` embebido y metadatos `decision.type=clef` en la cabecera |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base cloudflare/clef-flash, identificada en radiance con el id `clef`. Los nombres de los módulos cuantizados revelan un diseño híbrido: bloques de atención (`attn_qg`, `attn_k`, `attn_v`, `attn_output`), proyecciones de una delta net o módulo de estado (`ssm_inz`, `ssm_out`) y un feed-forward con `ffn_gate_up` y `ffn_down`. Sobre el tronco se monta un cabezal de esquema conjunto (`JointSchemaHead`) que decide todas las preguntas de una petición de forma simultánea, en lugar de generar texto token a token. Los tags del repositorio mencionan qwen3.5 como referencia de familia, pero la model card no aporta detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La innovación técnica del reempaquetado es la conversión mediante `rad-convert`: el contenedor bf16 conserva los pesos tal cual se distribuyen, mientras que el fp8 aplica una receta (`clef-flash-fp8block.recipe`) que redondea a fp8 e4m3 las lineales grandes del tronco con una escala bf16 por bloque de 128x128, manteniendo en bf16 las normas, los embeddings, las proyecciones pequeñas de la delta net y el `lm_head` (este último porque el cabezal promedia sus filas). El cabezal se añade con `--add joint_head.safetensors` y su geometría y escalares aprendidos quedan en la cabecera del contenedor. Según las mediciones del autor, las diferencias del tronco fp8 frente a bf16 son las responsables de la pérdida de coincidencia (98/100 decisiones idénticas, diferencia máxima de probabilidad 0,10), no el cabezal.

## Capacidades

- Decisión estructurada multi-pregunta en una sola pasada: responde simultáneamente a preguntas de tipo `noul` (probabilidad de verdadero), `choice` (selección entre opciones con distribución de probabilidad) y `score` (nivel esperado sobre una escala ordinal con leyenda).
- Salida JSON tipada con probabilidades normalizadas a 1 por pregunta, redondeadas a cuatro decimales, e informe de `input_tokens`.
- Procesamiento de estados textuales largos: los prompts de guía con texto de reglas de unos 13.100 tokens se sirven con caché de prefijo.
- Clasificación y enrutamiento: asignación de equipos o categorías mediante preguntas `choice` con criterios descriptivos.
- Puntuación de urgencia o severidad mediante preguntas `score` con niveles definidos por el usuario.
- Servicio HTTP sin proceso Python: el endpoint `POST /v1/systemone` (alias `/v1/decisions`) lo atiende directamente radiance con el plugin `clef`.
- No se documentan capacidades de generación de texto libre, código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Triaje de tickets de soporte: se envía el texto del ticket como `state` y preguntas `choice` para el equipo responsable (facturación, técnico) y `score` para la urgencia; el modelo devuelve la asignación con probabilidades en una sola pasada de 71 ms con prompts cortos en fp8, lo que permite clasificar en tiempo real dentro del pipeline de atención al cliente.
- Enrutamiento de reclamaciones con decisión binaria: una pregunta `noul` como "¿el cliente pide un reembolso?" devuelve P(true) directamente, útil para disparar flujos automáticos de devolución cuando la probabilidad supera un umbral configurable.
- Moderación y cumplimiento con reglas extensas: el texto normativo se coloca como prefijo de unos 13.100 tokens y se reutiliza mediante caché de prefijo entre peticiones; con fp8 el sistema procesa 24.344 tokens/s de prompt y 495 ms por decisión, adecuado para evaluar lotes de casos contra una política fija.
- Encuestas y anotación automatizada: el autor midió 100 respuestas de encuesta, una petición por respondiente; el modelo puede sustituir o preanotar codificación de respuestas abiertas en estudios con esquemas de codificación estables.
- Clasificación por lotes en infraestructura AMD: al ejecutarse en radiance sobre una tarjeta gfx1201 sin dependencias Python, encaja en entornos de solo inferencia donde no se quiere mantener un stack de ML completo.
- Extracción de señales para sistemas de decisión: las distribuciones de probabilidad por opción y el nivel esperado en las preguntas `score` permiten alimentar motores de reglas o modelos de ranking posteriores con incertidumbre calibrada, en lugar de una etiqueta dura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica mediciones de latencia y fidelidad frente al cabezal de referencia en PyTorch, sobre una tarjeta AMD gfx1201, con 100 respondientes y una petición cada uno:

| Contenedor | Prompt | Tokens de prompt/s | Mediana por decisión | Coincidencia con el cabezal PyTorch |
|---|---|---|---|---|
| fp8 | guía, 13.116 tokens | 24.344 | 495 ms | 98/100, diferencia máxima 0,10 |
| fp8 | corto, 676 tokens | 9.722 | 71 ms | 98/100, diferencia máxima 0,10 |
| bf16 | guía, 13.116 tokens | 14.255 | 838 ms | 100/100, diferencia máxima 0,01 |
| bf16 | corto, 676 tokens | 5.532 | 125 ms | no comparado en bf16 |

Los tokens/s contabilizan todos los tokens de prompt leídos por cada decisión, incluidos los servidos desde caché de prefijo (dos tercios en los prompts de guía, ninguno en los cortos). La comparación en bf16 se midió antes de que los plugins omitieran el `lm_head` en los pasos de clef.

## Requisitos de hardware

- VRAM estimada: el contenedor fp8 ocupa 12,2 GB y el bf16 19,1 GB en disco; la VRAM necesaria para inferencia no se detalla, pero debe cubrir al menos el tamaño de los pesos más el estado de activaciones y caché KV para la ventana configurada (hasta 16.384 tokens en el ejemplo).
- GPU validadas: una tarjeta AMD gfx1201 según las mediciones del autor; no se documentan pruebas en NVIDIA (A100, H100, RTX 4090) ni en otras AMD.
- GPU de consumo: no disponible; el contenedor fp8 de 12,2 GB podría ajustarse en GPUs de 16 GB o más, pero no hay confirmación del autor.
- Despliegue: exclusivamente radiance compilado desde la rama `clef-flash-arch-plugin` (plugins `clef_bf16` y `clef_fp8`, ABI de plugin 32); otras compilaciones de radiance no tienen plugin para la arquitectura `clef`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 71 ms de mediana por decisión con prompts cortos en fp8 y 495 ms con prompts de guía de 13.116 tokens; 9.722 y 24.344 tokens de prompt/s respectivamente en la tarjeta gfx1201 medida.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada. La categoría (modelo de decisión con cabezal de esquema conjunto servido por un motor propio) no tiene equivalentes documentados aquí, y la model card no ofrece comparaciones con otras alternativas. El único punto de referencia interno es el modelo base cloudflare/clef-flash, del que este repositorio es una cuantización y reempaquetado: mismos pesos, misma licencia Apache-2.0, pero formato `.rad` y dependencia del plugin de radiance en lugar de la distribución original.

## Limitaciones y advertencias

- No es un modelo generativo: solo produce respuestas a preguntas tipadas (`noul`, `choice`, `score`); no se debe esperar texto libre, código ni razonamiento conversacional.
- Dependencia dura de una rama concreta de radiance (`clef-flash-arch-plugin`) y de la ABI de plugin 32; otras versiones del motor no cargan la arquitectura `clef`, lo que limita la portabilidad y añade riesgo de mantenimiento.
- La cuantización fp8 introduce desviaciones medibles: 2 de cada 100 decisiones difieren del cabezal de referencia y la diferencia máxima de probabilidad llega a 0,10, relevante si se usan umbrales ajustados.
- La model card está redactada por máquina ("Machine-drafted by Claude") y no documenta sesgos, composición del dataset de entrenamiento ni evaluación multilingüe; los idiomas soportados figuran como no disponibles.
- El repositorio no registra descargas ni likes, y el autor no es el desarrollador original de los pesos; conviene validar el comportamiento antes de producción.
- Licencia Apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base cloudflare/clef-flash; no se detallan restricciones adicionales en la información disponible.
- Riesgo de alucinación y calibración: las probabilidades del cabezal no están validadas externamente más allá de la comparación con la implementación PyTorch del propio autor.
- El rendimiento medido corresponde a una única tarjeta AMD gfx1201; no hay datos de latencia o fidelidad en otros aceleradores.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/1beb/clef-flash-radiance
- Modelo base: https://huggingface.co/cloudflare/clef-flash
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
