# afridahmed/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen

Este repositorio distribuye cuantizaciones GGUF del modelo `DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`, un ajuste fino de tercera generación (multi-stage tune y multi-state merge) construido sobre la familia Qwen 3.8 de 27B. El autor del ajuste original es DavidAU; el repositorio de cuantizaciones lo publica el usuario `afridahmed`. El modelo se presenta como una variante "abliterated/uncensored" (sin las capas de rechazo habituales), orientada a escritura creativa, roleplay y generación de código, con modos de razonamiento ("thinking") optimizados para reducir el consumo de tokens.

La propuesta central es doble: por un lado, un ajuste que según su model card supera a la base Qwen 3.8 27B en siete benchmarks críticos y alcanza 735 puntos en ARC-C en 8 bits (719 en 4 bits); por otro, la inclusión de cuantizaciones "MTP" (multi-token prediction) y "Turbo Brilliance 50x V2 AGI", que según el autor recortan entre la mitad y una décima parte los tokens de pensamiento manteniendo el detalle de salida. El pipeline declarado es `image-text-to-text`, aunque el repositorio es fundamentalmente de pesos GGUF para inferencia de texto.

Es relevante ahora porque combina tres tendencias del ecosistema abierto: ajustes comunitarios agresivos sobre modelos Qwen recientes, cuantizaciones de doble matriz de importancia (di-matrix imatrix) para preservar calidad en 4 y 8 bits, y la experimentación con decodificación multi-token para acelerar el razonamiento. Conviene tratarlo con cautela: las cifras de benchmarks provienen exclusivamente de la model card del autor y no se han verificado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen 3.8), con modos de razonamiento; variantes MTP (multi-token prediction) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF en 4 bits y 8 bits; variantes "regular" y "MTP"; quants "Neo-CODER MAX DI-MATRIX" (doble imatrix) y "Turbo Brilliance 50x V2 AGI" |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 492,8 GB con multiples quants); el modelo base se distribuye en bfloat16 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Qwen 3.8 con aproximadamente 26,9 mil millones de parámetros. Sobre esa base, el autor aplica lo que describe como "COLD FUSION" y "FABLE FUSION 711": técnicas de ajuste multi-etapa y fusión multi-estado que combinan varios estados de entrenamiento en un único conjunto de pesos. El ajuste parte de un modelo intermedio (`...-NM-DAU`) y utiliza los datasets `DavidAU/Polar-STRICT-Datasets` y `DavidAU/F451-STRICT-Datasets`, orientados a instrucciones estrictas y a escritura creativa. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición detallada del dataset.

La innovación declarada más relevante es la reducción del "over-thinking": el modelo conserva los tres modos de operación de Qwen (pensamiento, no pensamiento e híbrido) pero recorta los tokens de razonamiento entre un 50 % y un 90 % según el caso. Las variantes MTP añaden decodificación multi-token para aumentar el throughput. Las cuantizaciones emplean doble matriz de importancia (imatrix dual) para minimizar la pérdida de calidad en 4 y 8 bits. No hay información disponible sobre el uso de RLHF, DPO u otras etapas de alineación posteriores al ajuste supervisado.

## Capacidades

- Generación de texto generalista, con modos de razonamiento explícito ("thinking") y respuesta directa.
- Generación de código: el sufijo "NEO-CODER MAX" indica ajuste específico para tareas de programación.
- Escritura creativa y narrativa: ficción, relato corto, novela y todos los géneros, con ajuste declarado para roleplay.
- Capacidad multimodal declarada en el pipeline (`image-text-to-text`), heredada de la base; no se detalla el alcance real en las cuantizaciones GGUF.
- Multilingüe en 16 idiomas, incluido el español.
- Soporte de tool calling y function calling, según se menciona en la model card (rendimiento "récord" según el autor, sin datos verificables).
- Razonamiento multi-paso y uso como agente, derivado de los modos de pensamiento.
- Modo "uncensored/abliterated": ausencia deliberada de rechazos ante contenido sensible.

## Casos de uso

- Escritura creativa asistida: generación de relatos, novelas y guiones con control de estilo y género; el ajuste específico en ficción y roleplay lo hace adecuado para borradores extensos con coherencia narrativa.
- Roleplay y personajes conversacionales: gracias al ajuste en diálogo de personaje y a la ausencia de rechazos, útil en prototipos de videojuegos narrativos o chatbots de ficción.
- Asistencia a programación: el ajuste "NEO-CODER" permite autocompletado, refactorización y explicación de código; puede integrarse en editores o pipelines de CI/CD vía API compatible con endpoints.
- Razonamiento con presupuesto de tokens ajustado: los modos "Turbo" reducen los tokens de pensamiento, lo que abarata tareas de clasificación, extracción o resumen donde el razonamiento extenso es innecesario.
- Atención al cliente automatizada: conversaciones multi-turno en 16 idiomas; conviene validar el contexto real soportado antes de desplegar.
- Generación de contenido editorial en producción: artículos, descripciones de producto y copy marketing en varios idiomas, con cuantización 4 bits para servidores modestos.
- Investigación sobre alineación y censura: el carácter abliterated lo convierte en objeto de estudio para medir sesgos y comportamiento sin capas de rechazo.

## Benchmarks y rendimiento

Los únicos datos disponibles provienen de la model card del autor y no han sido verificados de forma independiente:

| Benchmark | Resultado declarado | Notas |
|---|---|---|
| ARC-C (8 bits) | 735 | 144 puntos por encima de Qwen 3.8 27B según el autor |
| ARC-C (4 bits) | 719 | Supera los 718 declarados en 4 bits |
| ARC-E | >880 | Zona atribuida a modelos propietarios |
| Comparación global | Supera en 7 benchmarks críticos a Qwen 3.8 27B, Qwen 3.6-35B-A3B, Qwen 3.6 27B y Qwen 3.5 27B | Sin desglose por benchmark en la información disponible |

No se han publicado resultados verificables de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible. Las cifras deben considerarse afirmaciones del autor.

## Requisitos de hardware

- VRAM estimada en 4 bits: en torno a 15-18 GB para los pesos, más overhead de contexto; viable en una RTX 4090 (24 GB) con contexto moderado.
- VRAM estimada en 8 bits: aproximadamente 27-30 GB; requiere A100 40 GB, H100 o dos GPU consumer de 24 GB.
- GPU recomendadas: RTX 4090/3090 para 4 bits; A100 40/80 GB, H100 o L40S para 8 bits y contextos largos.
- Cabe en GPU consumer: sí, en 4 bits con GPUs de 24 GB; en 8 bits no en una sola consumer.
- Despliegue: llama.cpp, Ollama, LM Studio y servidores GGUF compatibles; las variantes MTP pueden requerir builds específicos que soporten decodificación multi-token.
- Latencia y throughput: no disponibles de forma medida; el autor afirma mejoras por la reducción de tokens de pensamiento y MTP, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (Qwen3.8-27B TURBO Fable) | ~26,9B | no disponible | apache-2.0 | Ajuste comunitario uncensored, GGUF 4/8 bits, MTP |
| Qwen 3.8 27B (base) | ~27B | no disponible | según Qwen | Referencia oficial; el autor afirma superarlo en 7 benchmarks |
| Qwen 3.6 27B | ~27B | no disponible | según Qwen | Generación anterior; declarado superado por este ajuste |
| Qwen 3.6-35B-A3B | 35B totales (MoE) | no disponible | según Qwen | Mayor tamaño total con pocos parámetros activos; declarado superado |

No se dispone de datos verificables de benchmarks para establecer una comparación rigurosa; las comparaciones de la tabla reflejan únicamente lo declarado en la model card.

## Limitaciones y advertencias

- Modelo "uncensored/abliterated": no aplica filtros de seguridad estándar; puede generar contenido ofensivo, ilegal o dañino. No apto para exposición directa al público sin moderación adicional.
- Riesgo elevado de alucinación: los ajustes agresivos y la reducción de tokens de pensamiento pueden degradar la verificación factual.
- Las cifras de benchmarks (ARC-C 735, ARC-E >880) son afirmaciones del autor sin verificación independiente; tratar con escepticismo.
- Contexto máximo no documentado en la información disponible; no asumir ventanas largas sin probar.
- Licencia apache-2.0 declarada, pero conviene revisar las condiciones del modelo base Qwen y de los datasets utilizados antes de uso comercial.
- Repositorio de 492,8 GB con múltiples quants: la descarga selectiva es imprescindible; verificar el archivo concreto antes de usar.
- Autor de cuantizaciones distinto del autor del ajuste original (`afridahmed` frente a `DavidAU`): posibles diferencias de calidad entre quants.
- Sin descargas ni likes en el momento de la consulta: ecosistema de validación comunitaria prácticamente nulo.
- El pipeline declarado `image-text-to-text` no está confirmado para las cuantizaciones GGUF; asumir uso de texto salvo prueba en contrario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/afridahmed/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base del ajuste: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Perfil del autor del ajuste: https://huggingface.co/DavidAU
- Colecciones de DavidAU: https://huggingface.co/DavidAU/collections
- Variante Turbo Brilliance 27B Heretic v2: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF
- Variante Turbo Brilliance 27B no-Heretic: https://huggingface.co/DavidAU/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-NEO-MAX-MTP-GGUF
- Colección Turbo Brilliance: https://huggingface.co/collections/DavidAU/turbo-brilliance-ai-constructs-50x-reasoning-instruct
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
