# Infinix-io/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB

## Resumen

NVIDIA-Nemotron-3.5-Bolt-E4B-4GB es un modelo de lenguaje pequeno (SLM) desarrollado por NVIDIA a partir de Gemma-4-E4B-it de Google, sometido a un post-entrenamiento adicional orientado a asistentes locales de voz y dispositivo, personas interactivas e interfaces embebidas. La version publicada por Infinix-io es una cuantizacion Q4_K_M en formato GGUF del modelo base BF16 de NVIDIA, pensada para inferencia con huella de memoria reducida (el nombre "4GB" alude al objetivo de encajar en ese presupuesto de VRAM) y baja latencia hasta el primer token (TTFT).

El modelo conserva la arquitectura Gemma-4-E4B, con aproximadamente 7.500 millones de parametros totales y unos 4.000 millones efectivos, lo que lo situa en la categoria de modelos eficientes para edge. Su ventana de contexto alcanza los 64K tokens tanto en entrada como en salida, e incorpora controles de plantilla de chat para activar o desactivar el modo de razonamiento (`enable_thinking`) y el modo conversacional (`conversational_mode`), ademas de un presupuesto de pensamiento configurable en tiempo de ejecucion.

Su relevancia actual radica en la combinacion de licencia permisiva para uso comercial (OpenMDW-1.1), soporte multilingue amplio (34 idiomas), capacidad de tool calling multi-turno y un ecosistema de decodificacion especulativa mediante un drafter DFlash complementario, lo que lo hace atractivo para despliegues en dispositivos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma-4-E4B (transformer; variante eficiente con parametros efectivos) |
| Parametros totales | 7.518.069.290 (~8B) |
| Parametros activos | ~4B efectivos (segun model card) |
| Longitud de contexto | 64K tokens de entrada y 64K tokens de salida |
| Tipos de cuantizacion | Q4_K_M (esta version); existe BF16 en el repo base de NVIDIA |
| Idiomas soportados | 34 idiomas: en, ar, bg, cs, da, de, el, es, et, fi, fr, hi, hr, hu, id, it, ja, ko, lt, lv, nl, no, pl, pt, ro, ru, sk, sl, sv, th, tr, uk, vi, zh |
| Licencia | OpenMDW-1.1 (uso comercial y no comercial permitido) |
| Formato de pesos | GGUF (cuantizacion Q4_K_M); el modelo base esta en BF16 |

## Arquitectura y entrenamiento

El modelo parte de Gemma-4-E4B-it, una arquitectura transformer de la familia Gemma 4 con un diseno orientado a eficiencia (4B parametros efectivos sobre 8B totales). NVIDIA aplico un post-entrenamiento adicional sobre este base para mejorar el uso de herramientas multi-turno, el seguimiento de instrucciones y el anclaje de la entrada (input grounding), capacidades clave para asistentes de voz y dispositivo. Los datos de post-entrenamiento provienen de `nvidia/nemotron-post-training-v3` y los de pre-entrenamiento de `nvidia/nemotron-pre-training-datasets`, con fecha de corte de mayo de 2026.

Entre las innovaciones tecnicas destacables figuran: el control del modo de razonamiento mediante `enable_thinking=True/False` en la plantilla de chat, con presupuesto de pensamiento ajustable en runtime; un modo conversacional conmutable (`conversational_mode`); y el soporte de decodificacion especulativa mediante un drafter DFlash complementario (`NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-DFlash`), que acelera la generacion manteniendo la calidad. La model card no detalla el volumen exacto de tokens de entrenamiento ni la composicion precisa del dataset, por lo que esos datos no estan disponibles.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 64K tokens.
- Razonamiento controlable: modo thinking activable/desactivable y presupuesto de pensamiento ajustable.
- Tool calling y function calling multi-turno, mejorado respecto al modelo base.
- Seguimiento de instrucciones y anclaje de entrada (input grounding) reforzados.
- Capacidades multilingues en 34 idiomas, incluido espanol.
- Modo conversacional dedicado para interacciones de asistente.
- Compatible con decodificacion especulativa mediante drafter DFlash.
- Orientado a asistentes de voz y dispositivo, personas interactivas e interfaces embebidas.
- No se documentan capacidades de vision, audio ni otras modalidades en la informacion disponible.

## Casos de uso

- **Asistentes de voz locales**: el modelo esta disenado para baja latencia hasta el primer token y bajo consumo de memoria, lo que permite respuestas rapidas en dispositivos sin depender de la nube, con contexto de 64K tokens para conversaciones largas.
- **Personas interactivas en dispositivos**: su modo conversacional conmutable y su capacidad multilingue lo hacen adecuado para personajes virtuales embebidos en hardware de consumo, como robots sociales o altavoces inteligentes.
- **Interfaces embebidas y edge computing**: con cuantizacion Q4_K_M y ~4GB de huella, puede desplegarse en GPUs de consumo o sistemas integrados, dejando margen de memoria para otras aplicaciones o pipelines adyacentes.
- **Agentes con tool calling en local**: el soporte de function calling multi-turno permite construir agentes que consulten APIs, bases de datos o servicios locales sin salir del dispositivo.
- **Atencion al cliente automatizada en espanol y otros idiomas**: la cobertura de 34 idiomas y el contexto largo permiten gestionar conversaciones multi-turno con historial extenso en entornos de soporte.
- **Generacion de codigo asistida en entornos con recursos limitados**: aunque no es su foco principal, puede integrarse en editores o pipelines ligeros para autocompletado y explicacion de codigo, con modo thinking para tareas de razonamiento.
- **Prototipado rapido de aplicaciones de IA**: su licencia permisiva y su formato GGUF facilitan experimentar y desplegar en llama.cpp sin costes de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4 GB para la cuantizacion Q4_K_M (objetivo del nombre del modelo), mas overhead del contexto KV cache segun la longitud de contexto utilizada.
- GPU recomendadas: NVIDIA con al menos 6-8 GB de VRAM para margen operativo; RTX 3060/4060 en adelante para uso en consumer; A100/H100 para despliegues de mayor concurrencia.
- Cabe en GPUs de consumo: si, en modelos con 6 GB o mas de VRAM (RTX 3060 6GB, RTX 4060, RTX 4070, etc.), ajustando la longitud de contexto.
- Opciones de despliegue: llama.cpp (receta oficial con `server-cuda13`), con soporte de decodificacion especulativa via DFlash drafter; el modelo base BF16 esta en transformers.
- Latencia y throughput: no se proporcionan cifras concretas en la informacion disponible; el diseno prioriza bajo TTFT y la decodificacion especulativa busca acelerar la generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Bolt-E4B-4GB (este) | ~8B totales / ~4B efectivos | 64K | OpenMDW-1.1 | GGUF Q4_K_M | Post-entrenado por NVIDIA sobre Gemma-4-E4B-it; tool calling y modo thinking |
| Gemma-4-E4B-it (base) | ~8B totales / ~4B efectivos | no disponible | Gemma license | BF16 | Modelo base de Google; sin el post-entrenamiento de NVIDIA |
| NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 | ~8B totales / ~4B efectivos | 64K | OpenMDW-1.1 | BF16 | Version completa del mismo modelo, mayor huella de memoria |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinacion inherente a los SLM; el modelo no esta exento de generar informacion incorrecta, especialmente en tareas de razonamiento complejo.
- Al ser una cuantizacion Q4_K_M, puede presentar una ligera degradacion de calidad respecto a la version BF16.
- La model card no detalla sesgos conocidos ni evaluaciones de seguridad especificas; se recomienda auditoria propia antes de produccion.
- El contexto de 64K tokens implica un coste de KV cache que puede superar el presupuesto de 4 GB si se usa la ventana completa; conviene ajustar la longitud segun el hardware.
- Aunque soporta 34 idiomas, el rendimiento puede variar entre ellos; el espanol esta incluido pero no se documenta su calidad relativa.
- La licencia OpenMDW-1.1 permite uso comercial, pero conviene revisar los terminos completos del acuerdo para obligaciones de atribucion.
- No se documentan capacidades multimodales (vision, audio); el modelo es exclusivamente texto.
- La receta de despliegue en llama.cpp figura como "pending" en la model card, por lo que la integracion puede requerir verificacion adicional.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/Infinix-io/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Drafter DFlash: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-DFlash
- Modelo base original (Gemma-4-E4B-it): https://huggingface.co/google/gemma-4-E4B-it
- Pagina de desarrollador Nemotron: https://developer.nvidia.com/nemotron
- Informe tecnico (PDF): https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-Technical-Report.pdf
- Blog de NVIDIA: https://research.nvidia.com/labs/nemotron/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB/
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Repositorio de la licencia: https://github.com/OpenMDW/OpenMDW/blob/main/1.1/LICENSE.OpenMDW-1.1
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
- Paper arXiv: https://arxiv.org/abs/2509.04292
