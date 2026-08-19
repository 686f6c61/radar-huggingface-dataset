# lued/Qwen3.8-27B-heretic-ara-INT8-W8A16-MTP

## Resumen

Este repositorio contiene una cuantización numérica W8A16 (INT8) del modelo `heretic-org/Qwen3.8-27B-heretic-ara`, una versión "abliterated" (descensurada) del Qwen3.8-27B de Qwen. El autor, `lued`, ha aplicado el formato `compressed-tensors` con pesos INT8 y activaciones en FP16/BF16, optimizado para GPUs Ampere (sm_86) donde la ejecución nativa de FP8 no está disponible. El resultado es un checkpoint de 31,6 GB que mantiene la torre de visión, los controles de pensamiento, el contexto nativo de 262 144 tokens y el cabezal MTP (Multi-Token Prediction) en BF16 byte-idéntico al original.

La relevancia de este modelo reside en dos frentes: por un lado, la abliteración mediante el método ARA (Arbitrary-Rank Ablation) de Heretic elimina por completo los rechazos en prompts dañinos (0/100 frente a 99/100 del modelo original), a costa de una divergencia KL mayor (0,0535) que la de una ablación quirúrgica típica. Por otro lado, la cuantización W8A16 permite desplegar el modelo en dos RTX 3090 de 24 GB con vLLM, usando TP2, caché KV en FP8 E4M3 y decodificación especulativa con tres tokens de borrador, lo que lo hace accesible para hardware de consumo de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basado en Qwen3.8-27B |
| Parametros totales | 27 781 427 952 (27,8 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativos; extensible a 1M con YaRN |
| Tipos de cuantizacion | W8A16 (INT8) con compressed-tensors, group-128, RTN data-free simétrico |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (6 shards), formato compressed-tensors |

## Arquitectura y entrenamiento

El modelo base es un transformer denso multimodal de 27,8 B parámetros desarrollado por Qwen, con capacidades de imagen-texto a texto. La abliteración fue realizada por `heretic-org` usando el fork de timrohrbaugh de Heretic v1.2.0+custom con el método ARA, ejecutado en BF16 completo en una H200 NVL. El estudio Optuna de 60 pruebas (semilla 705085018) seleccionó el trial 37, que ablaciona las capas 26 a 56 sobre los objetivos `attn.o_proj` y `mlp.down_proj`, con parámetros como `preserve_good_behavior_weight=0.9432`, `steer_bad_behavior_weight=0.0009` y `overcorrect_relative_weight=0.5038`. La divergencia KL de 0,0535 es intencionalmente mayor que la de una ablación quirúrgica (≈0,002) porque ARA prioriza la eliminación completa de rechazos sobre la preservación de la distribución original.

La cuantización de este repositorio no altera los pesos de forma entrenada: aplica una receta W8A16 idéntica a la del checkpoint hermano `lued/Qwen3.8-27B-INT8-W8A16-MTP`, con 400 GEMMs empaquetados, el mismo conjunto de preservación en BF16 y cabezal MTP nativo de 15 tensores byte-idéntico al de Qwen. El tokenizador, la plantilla de chat, los configs del procesador y el layout de 6 shards son compartidos con el hermano. La única desviación son los pesos del LM, que provienen del modelo abliterado.

## Capacidades

- Generación de texto y razonamiento multimodal: acepta entradas de imagen y texto, y produce texto (image-text-to-text).
- Control de pensamiento (thinking mode): hereda los controles nativos de Qwen3.8 para activar o desactivar el razonamiento explícito.
- Decodificación especulativa: incluye cabezal MTP (Multi-Token Prediction) en BF16, compatible con vLLM para acelerar la inferencia con tres tokens de borrador.
- Ausencia de rechazos: la abliteración elimina las negativas ante prompts dañinos (0/100 en la evaluación de 100 prompts), lo que lo hace útil para investigación de seguridad y alineación, aunque con riesgos asociados.
- Multilingüe: no se han publicado los idiomas soportados en la información disponible, pero al derivar de Qwen3.8-27B se espera cobertura amplia de lenguas principales.
- Tool calling y function calling: no se menciona explícitamente en la documentación, pero es una capacidad estándar de la familia Qwen3; no confirmada para este checkpoint.
- Contexto largo: 262 144 tokens nativos, ampliable a 1M con YaRN, con caché KV en FP8 E4M3 para reducir el consumo de memoria.

## Casos de uso

- Investigación en seguridad y alineación de modelos: al eliminar los rechazos, permite estudiar el comportamiento del modelo ante instrucciones dañinas sin filtros, útil para evaluar riesgos de sesgo y toxicidad en entornos controlados.
- Despliegue de chatbots sin censura en hardware de consumo: con dos RTX 3090 y vLLM, se puede servir un asistente conversacional con contexto de 262K tokens y decodificación especulativa, adecuado para proyectos que requieren respuestas sin restricciones de contenido.
- Análisis de documentos largos con imágenes: la combinación de visión y contexto nativo de 262K permite procesar manuales extensos, informes con figuras o contratos con gráficos en una sola pasada.
- Generación de código con razonamiento extendido: el modo thinking y la capacidad de mantener conversaciones multi-turno largas facilitan la depuración y refactorización de proyectos grandes.
- Sistemas de agentes con memoria amplia: el contexto de 262K tokens permite a un agente mantener el historial completo de una sesión de trabajo prolongada, con múltiples herramientas y pasos de razonamiento.
- Evaluación de técnicas de cuantización: al ser una cuantización W8A16 con receta reproducible, sirve como banco de pruebas para comparar el impacto de la abliteración y la cuantización en la calidad de salida frente al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Los únicos datos numéricos reportados son la tasa de rechazos (0/100 frente a 99/100 del original) y la divergencia KL (0,0535), que no son benchmarks de capacidad sino de comportamiento tras la ablación.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 31,6 GB (29,44 GiB) en disco. En el perfil validado con 2×RTX 3090 de 24 GB, la memoria cargada por GPU es de 14,85 GiB, dejando espacio para la caché KV compartida de 266 537 tokens.
- GPU recomendadas: el objetivo declarado son GPUs Ampere sm_86 (RTX 3090, RTX 3080 Ti). También debería funcionar en GPUs más recientes (Ada, Hopper) con soporte de vLLM, aunque el beneficio de W8A16 frente a FP8 nativo es menor.
- Cabe en GPU de consumo: sí, en configuraciones de doble GPU de 24 GB (por ejemplo, 2×RTX 3090). No cabe en una sola GPU de 24 GB sin cuantización más agresiva.
- Opciones de despliegue: vLLM (librería principal), con perfil validado de TP2, `--max-num-batched-tokens 8192`, activaciones BF16, caché KV FP8 E4M3 y MTP con tres tokens de borrador. También podría usarse con TGI u otros servidores que soporten compressed-tensors, aunque no está documentado.
- Latencia y throughput: no se proporcionan mediciones en la información disponible. La model card indica que el rendimiento de servicio es idéntico al del checkpoint hermano, pero no se dan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Refusals (100 eval) | Licencia |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (original) | 27,8 B | 262K nativo | BF16/FP8 | 99/100 | Apache-2.0 |
| heretic-org/Qwen3.8-27B-heretic-ara (base) | 27,8 B | 262K nativo | BF16 | 0/100 | Apache-2.0 |
| lued/Qwen3.8-27B-heretic-ara-INT8-W8A16-MTP (este) | 27,8 B | 262K nativo | W8A16 INT8 | 0/100 | Apache-2.0 |
| lued/Qwen3.8-27B-INT8-W8A16-MTP (hermano) | 27,8 B | 262K nativo | W8A16 INT8 | 99/100 (sin ablación) | Apache-2.0 |

La comparativa muestra que este modelo es funcionalmente idéntico al base abliterado en cuanto a comportamiento (misma tasa de rechazos), pero con un footprint de memoria reducido gracias a la cuantización. Frente al original de Qwen, la diferencia clave es la eliminación de rechazos, a costa de una divergencia KL mayor. No se dispone de datos de rendimiento en benchmarks para comparar la calidad de salida entre las versiones.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una versión abliterated, el modelo puede generar contenido dañino, ofensivo o ilegal sin filtros. No es adecuado para despliegue público sin moderación externa.
- Riesgo de alucinacion: no se han evaluado tasas de alucinación específicas; al derivar de Qwen3.8, hereda los riesgos típicos de los LLM de su tamaño, agravados por la ausencia de rechazos.
- Limitaciones de contexto: el contexto nativo de 262K tokens requiere caché KV en FP8 para caber en 48 GB de VRAM; con contextos máximos simultáneos, la capacidad se reduce (por ejemplo, 1,02× para un solo request completo, o ~66K tokens por request si se comparten entre cuatro).
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la naturaleza "uncensored" puede implicar responsabilidades legales según el uso y la jurisdicción.
- Dependencia de vLLM: la cuantización compressed-tensors y el MTP están optimizados para vLLM; otros runners pueden no soportar el formato o el cabezal especulativo.
- Divergencia de comportamiento: la KL de 0,0535 indica una desviación significativa del modelo original; en tareas que requieren precisión factual, puede haber diferencias notables en las respuestas.
- Sin datos de benchmarks: no hay evidencia publicada de que la cuantización W8A16 mantenga la calidad del modelo base en tareas estándar; se asume que la degradación es mínima por ser RTN data-free, pero no está verificada.

## Enlaces

- Repositorio del modelo: https://huggingface.co/lued/Qwen3.8-27B-heretic-ara-INT8-W8A16-MTP
- Modelo base abliterado: https://huggingface.co/heretic-org/Qwen3.8-27B-heretic-ara
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantización hermana (sin ablación): https://huggingface.co/lued/Qwen3.8-27B-INT8-W8A16-MTP
- Herramienta de abliteración Heretic: https://github.com/p-e-w/heretic
- vLLM: https://github.com/vllm-project/vllm
- llm-compressor: https://github.com/vllm-project/llm-compressor
