# lavendercomputing/Holo4-35B-A3B-Heretic-GSQ-RCO-GGUF

## Resumen

Holo4-35B-A3B es un modelo de lenguaje y visión de tipo mezcla de expertos (MoE) desarrollado por Hcompany, orientado específicamente a tareas de *computer use*: recibe capturas de pantalla y devuelve clics, texto y llamadas a herramientas. Esta ficha describe la variante publicada por lavendercomputing, que aplica una cuantización GGUF de precisión mixta por tensor (GSQ-RCO) sobre una versión del modelo sometida a *abliteration* con Heretic, una técnica sin entrenamiento que elimina la dirección de rechazo de determinadas matrices de pesos.

El modelo base emplea la arquitectura Qwen3.6 MoE: 40 bloques (30 de atención lineal y 10 de atención completa), 256 expertos enrutados por bloque con 8 activos por token, una ventana de contexto de 262.144 tokens y un vocabulario de 248.320 entradas. El resultado de la cuantización es un archivo Q4_K_M de 19,32 GiB con 4,78 bits por peso, generado mediante una búsqueda de asignación de tipos por tensor optimizada contra la entropía cruzada del siguiente token.

La relevancia de esta publicación es doble: por un lado, ofrece una build GGUF ejecutable en llama.cpp de un modelo de *computer use* de tamaño medio; por otro, documenta con detalle inusual el proceso de cuantización (asignación por tensor, presupuesto de bytes exacto, calibración y resultados por grupo de pesos), lo que la convierte en una referencia útil para quien necesite evaluar el impacto de la cuantización mixta en modelos MoE multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido (Qwen3.6 MoE): 40 bloques, 30 de atención lineal + 10 de atención completa, 256 expertos enrutados por bloque, 8 activos por token |
| Parametros totales | 34.660.610.688 (34,66 B) |
| Parametros activos | 8 de 256 expertos enrutados por token (número exacto de parámetros activos no disponible) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q4_K_M (GSQ-RCO), IQ4_XS, IQ3_S, IQ3_XXS, IQ2_S, IQ2_XXS (GGUF); tipos por tensor entre IQ1_S y Q6_K en la build Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector de visión en `mmproj.f16.gguf` |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con atención híbrida: 30 de los 40 bloques usan atención lineal y los 10 restantes atención completa, lo que reduce el coste computacional en contextos largos manteniendo capacidad de atención global. Cada bloque contiene 256 expertos enrutados de los que se activan 8 por token, además de expertos compartidos. El vocabulario es de 248.320 tokens y el contexto alcanza los 262.144 tokens. La arquitectura corresponde a la familia Qwen3.6 MoE, según indica la model card.

Sobre el entrenamiento original de Hcompany/Holo4-35B-A3B no se proporciona información en los datos disponibles (número de tokens, composición del dataset, uso de RLHF o DPO: no disponible). La variante aquí descrita incorpora dos transformaciones: primero, una *abliteration* con Heretic (proyecta fuera de ciertas matrices la dirección de rechazo estimada, bajo una cota KL, sin fine-tuning); después, una cuantización GSQ-RCO que, para cada uno de los 432 tensores de texto cuantizables, selecciona el tipo GGML óptimo mediante una búsqueda categórica optimizada contra la entropía cruzada del siguiente token a través del forward real del modelo, con estimador straight-through de Gumbel, presupuesto exacto de 4,8 bpw y calibración con 128 secuencias de 2048 tokens de un corpus mixto de agente, chat y código. La build Q4_K_M se generó a partir del GGUF Q6_K de jduraes (dequantizado exacto), por lo que está a una generación de cuantización del BF16 original.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Comprensión de imágenes: pipeline `image-text-to-text`, con entrada de capturas de pantalla.
- *Computer use*: salida de clics, escritura y acciones sobre interfaces gráficas, pensado para ejecutarse dentro de un arnés de agente.
- Llamadas a herramientas (*tool calling* / *function calling*) según el diseño del modelo base orientado a agentes.
- Razonamiento multi-paso y flujos de agente.
- Capacidades multilingües: no disponible (no se especifican idiomas).
- La variante Heretic elimina la dirección de rechazo, lo que reduce las negativas del modelo a ciertas peticiones (ver limitaciones).
- Cabeza MTP (*multi-token prediction*) incluida como archivo separado (`mtp-...-Q8_0.gguf`, 868 MiB) para decodificación especulativa.

## Casos de uso

- Automatización de tareas de escritorio: el modelo recibe capturas de pantalla y emite acciones (clic, tecleo) dentro de un arnés de agente; su contexto de 262.144 tokens permite mantener el historial completo de una sesión larga sin truncar.
- Agentes de navegación web: interpretación de páginas renderizadas y generación de secuencias de interacción; la atención lineal en 30 de 40 bloques reduce el coste por token en sesiones con muchas capturas acumuladas.
- Pruebas de regresión de interfaces (QA automatizado): un agente basado en el modelo puede recorrer flujos de la aplicación, detectar estados inesperados y registrar los pasos, ejecutándose en local con llama.cpp sobre el GGUF Q4_K_M.
- Asistencia en pipelines de CI/CD para validación de UI: integrado como paso que verifica visualmente el resultado de un despliegue y reporta discrepancias mediante tool calling.
- Extracción de datos de documentos e imágenes: al ser image-text-to-text, puede transcribir y estructurar información de capturas o formularios dentro de un flujo con herramientas.
- Despliegue en hardware de gama alta para consumo: la build IQ2_XXS (9,43 GiB) permite ejecutar el modelo en una sola GPU de consumo con 12-16 GB de VRAM, útil para prototipos de agentes de computer use en estación de trabajo.
- Investigación sobre abliteration y cuantización: la documentación por tensor y el archivo de asignación permiten estudiar el efecto de la precisión mixta en modelos MoE multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente indica que la build Q4_K_M carga y responde en llama.cpp upstream (`2277e75`) en CPU; no se aportan métricas de MMLU, HumanEval, GSM8K ni de tareas de computer use.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto y proyector de visión):
  - IQ2_XXS (9,43 GiB): ~11-13 GB con contexto moderado.
  - IQ2_S (10,09 GiB): ~12-14 GB.
  - IQ3_XXS (12,16 GiB): ~14-16 GB.
  - IQ3_S (14,18 GiB): ~16-18 GB.
  - IQ4_XS (16,14 GiB): ~18-20 GB.
  - Q4_K_M (19,32 GiB): ~21-24 GB; requiere contexto KV adicional para ventanas largas.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M con contexto contenido; A100 40/80 GB o H100 para contexto largo (262.144 tokens) y mayor throughput; RTX 3090/4080 (24/16 GB) para IQ3/IQ4.
- Cabe en GPU de consumo: sí, en RTX 4090 para Q4_K_M; en GPUs de 12-16 GB con las variantes IQ2/IQ3.
- Opciones de despliegue: llama.cpp (probado en CPU con la build upstream `2277e75`); el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI. No se confirma soporte específico de vLLM u Ollama en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Holo4-35B-A3B Heretic GSQ-RCO (esta ficha) | 34,66 B totales, 8 expertos activos | 262.144 | Imagen-texto (computer use) | Apache-2.0 | GGUF |
| Hcompany/Holo4-35B-A3B (base) | 34,66 B totales | 262.144 | Imagen-texto | Apache-2.0 | safetensors/GGUF |
| jduraes/Holo4-35B-A3B-heretic-Q6_K | 34,66 B totales | 262.144 | Imagen-texto | Apache-2.0 | GGUF Q6_K |
| Qwen/Qwen3.6-35B-A3B (base arquitectónico) | ~35 B totales | no disponible | Texto | Apache-2.0 | safetensors |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La *abliteration* con Heretic elimina la dirección de rechazo sin fine-tuning; esto puede aumentar la probabilidad de respuestas a peticiones que el modelo original rechazaría y trasladar ese efecto a dominios no previstos. No hay evaluación de seguridad publicada para esta variante.
- La build Q4_K_M está a una generación de cuantización del BF16 (BF16 → Q6_K → Q4_K_M); la calidad está acotada por el Q6_K de origen y no se compara contra BF16 en la model card.
- La búsqueda GSQ-RCO se detuvo manualmente a los 119 pasos, antes de cumplir su criterio de convergencia; cuatro tensores quedaron con asignación por debajo de p=0,9 (`blk.38.ffn_gate_exps`, `blk.7.attn_q`, `blk.9.attn_gate`, `blk.2.attn_gate`), lo que introduce incertidumbre sobre su óptimo.
- Las builds IQ4_XS, IQ3_S, IQ3_XXS, IQ2_S e IQ2_XXS son escaleras heurísticas heredadas con imatrix, no búsquedas GSQ-RCO; su calidad relativa no está documentada.
- El proyector de visión no está incluido en el repositorio; hay que descargarlo de `jduraes/Holo4-35B-A3B-heretic-Q6_K` (`mmproj.f16.gguf`) para usar entrada de imagen.
- Solo se ha verificado la carga en llama.cpp upstream en CPU; el comportamiento en GPU, vLLM u otros runtimes no está confirmado.
- Idiomas soportados no especificados; no hay evaluación multilingüe.
- Riesgo de alucinación y sesgos: no disponible (no se publican evaluaciones).
- Licencia Apache-2.0 permite uso comercial, pero la ausencia de evaluaciones de seguridad de la variante abliterada traslada al desplegador la responsabilidad de filtrado y moderación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lavendercomputing/Holo4-35B-A3B-Heretic-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/Hcompany/Holo4-35B-A3B
- GGUF de referencia del proveedor: https://huggingface.co/Hcompany/Holo4-35B-A3B-GGUF
- Fuente Q6_K con abliteration y proyector de visión: https://huggingface.co/jduraes/Holo4-35B-A3B-heretic-Q6_K
- Base arquitectónica: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Heretic (abliteration): https://github.com/p-e-w/heretic
- llama.cpp: https://github.com/ggml-org/llama.cpp
