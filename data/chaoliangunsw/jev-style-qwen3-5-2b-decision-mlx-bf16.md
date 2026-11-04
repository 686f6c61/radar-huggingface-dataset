# chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-MLX-bf16

## Resumen

Jev-Style-Qwen3.5-2B-Decision (MLX, bf16) es un modelo de decisión y clasificación derivado por ajuste fino de Qwen/Qwen3.5-2B-Base, desarrollado por Chaoliang Yan (usuario chaoliangUNSW). No es un modelo generativo: recibe un estado, una pregunta y una lista de opciones, y devuelve en un único forward pass la opción elegida junto con probabilidades calibradas. Está pensado para tareas de enrutamiento, clasificación y puntuación de alternativas fijas, con una latencia de 77 ms por decisión en un Apple M1 Max.

La versión publicada en este repositorio es la v1 archivada (21 de septiembre de 2026), que se mantiene por compatibilidad con integraciones existentes. El propio autor recomienda ya las versiones posteriores: 2B v4 (texto e imagen) y 0,8B v3 (solo texto, 51 idiomas, contexto de 25.600 tokens y 79,2% de acierto en 2.000 decisiones tipadas). El paquete `jev-style` actual no carga esta v1; requiere el cliente `jev_style_mlx.py` incluido en el repositorio.

El interés técnico reside en su calibración: un error de calibración esperado (ECE) de 0,017 sobre 1.500 ejemplos retenidos, con una temperatura ajustada e incorporada en el peso final de RMSNorm, de modo que no hay post-procesado en inferencia. El modelo tiene 1.881.825.088 parámetros, licencia Apache 2.0, y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5 (con capas Gated DeltaNet según la receta de entrenamiento descrita); ajuste fino LoRA |
| Parametros totales | 1.881.825.088 (~1,88B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible para esta v1 (la v4 alojada usa 8.192 tokens; la v3 admite 25.600) |
| Tipos de cuantizacion | bf16 (este repo), GGUF BF16 / Q8_0 / Q4_K_M en repo aparte |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX); GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B-Base y se ajusta con LoRA de rango 16 aplicado a todas las capas lineales, usando una función de pérdida sobre log-scores (log-score loss) en lugar de entropía cruzada estándar, lo que permite optimizar directamente la verosimilitud de la opción correcta entre un conjunto de alternativas. La receta se apoya en un forward de Gated DeltaNet con paralelismo por chunks y diferenciable, que reproduce la ruta de entrenamiento token a token con un error de 1e-6 (salidas, estado y todos los gradientes) y resulta 6,5 veces más rápido por paso, medido sobre el modelo hermano de 0,8B.

Los datos de entrenamiento provienen de GLUE, AG News, BoolQ y SST-5 (según los tags del repositorio), con 4.366 ejemplos retenidos para ajustar la temperatura de calibración. Esa temperatura se pliega en el peso final de RMSNorm, de forma que cada logit ya sale calibrado sin coste adicional en inferencia. Esta v1 no utilizó salidas de Jev; las versiones posteriores sí incorporan etiquetas suaves destiladas de TypeSafe Jev 1.14 a través de su API pública.

## Capacidades

- Clasificación de texto y decisión de opción fija: devuelve una elección entre alternativas con probabilidades calibradas en un solo forward pass.
- Enrutamiento y puntuación de opciones: capaz de puntuar listas de opciones sin el límite de 26 letras (probado con 77 opciones en la v3).
- Calibración nativa: ECE de 0,017 en 1.500 ejemplos retenidos, sin post-procesado.
- Generalización de calibración a tipos de tarea no vistos: reducción del ECE de 0,155 a 0,075 en clasificación de emociones y RTE.
- No genera texto libre: es un modelo de decisión, no un chatbot.
- Sin soporte documentado de tool calling, agentes multi-paso, visión ni audio en esta versión (la visión llega en la v4).
- Multilingüe: no en esta versión (solo inglés); la v3 cubre 51 idiomas.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una consulta y una lista de colas o equipos, el modelo devuelve la cola adecuada con probabilidad asociada, lo que permite umbrales de derivación a revisión humana cuando la confianza es baja.
- Clasificación de sentimiento fino en reseñas: con SST-5 alcanza 61,7% frente al 32,0% del modelo base, adecuado para pipelines de análisis de opinión con cinco niveles.
- Detección de implicación textual (NLI): en MNLI pasa de 52,3% a 86,7%, útil para verificación de afirmaciones contra documentos y para deduplicación semántica.
- Preguntas de sí/no sobre contexto: BoolQ con 82,7% de acierto permite construir verificadores binarios ligeros sobre documentos recuperados en un pipeline RAG.
- Moderación y filtrado por categorías: la calibración permite fijar umbrales operativos con significado probabilístico real (por ejemplo, "bloquear si P(riesgo) > 0,9") sin recalibrar.
- Routing de bajo coste en el borde: 77 ms por decisión en un M1 Max y compatibilidad con GGUF Q4_K_M (1,3 GB) permiten ejecutarlo en portátiles y equipos sin GPU dedicada como primera etapa antes de un modelo mayor.
- Comparación reproducible de alternativas: la guía de routing bancario del proyecto muestra cómo usar el modelo para comparar opciones de forma determinista y auditable.

## Benchmarks y rendimiento

Datos publicados por el autor, medidos sobre datos no vistos y con las probabilidades tal como las producen los pesos liberados.

| Métrica | Qwen3.5-2B-Base zero-shot | Este modelo |
|---|---|---|
| Precisión, 5 tareas de decisión (1.500 ejemplos retenidos) | 65,9% | 82,3% |
| Error de calibración (ECE) en esas tareas | 0,065 | 0,017 |
| NLL / Brier score | 0,786 / 0,446 | 0,418 / 0,242 |
| ECE en tipos de tarea no vistos en entrenamiento | 0,155 | 0,075 |
| Latencia por decisión (M1 Max, MLX bf16) | 76 ms | 77 ms |

| Tarea | Base | Este modelo |
|---|---|---|
| MNLI | 52,3% | 86,7% |
| SST-5 | 32,0% | 61,7% |
| BoolQ | 73,0% | 82,7% |
| SST-2 | 87,3% | 92,7% |
| AG News | 84,7% | 87,7% |

Datos de cuantización: Q8_0 coincide con bf16 en el 99,4% de los ejemplos; Q4_K_M (1,3 GB) mantiene 82,4% de precisión. El autor señala que un ECE de 0,017 sobre 1.500 ejemplos es estadísticamente indistinguible de una calibración perfecta (el ruido de muestreo daría un ECE esperado de 0,017, con percentil 95 de 0,025).

## Requisitos de hardware

- VRAM estimada: ~3,8 GB en bf16 (tamaño del repo); ~1,3 GB en GGUF Q4_K_M; aproximadamente 2 GB en Q8_0.
- GPU recomendadas: no se especifican GPU NVIDIA concretas en la información disponible; el autor reporta latencia en Apple M1 Max con MLX.
- Cabe en GPU de consumo: sí, por tamaño (un modelo de 1,88B en bf16 ocupa menos de 4 GB), aunque no hay mediciones publicadas en RTX 4090 u otras.
- Opciones de despliegue: MLX (Apple silicon) mediante el script `jev_style_mlx.py` de este repositorio; llama.cpp y LM Studio mediante los GGUF del repositorio hermano; el paquete `jev-style` con extra `[mlx]` o `[torch]` carga las versiones v3 y v4, no esta v1.
- Latencia: 77 ms por decisión en M1 Max con MLX bf16. Throughput no disponible.
- Existe un servicio alojado (API) que sirve la v4 con contexto de 8.192 tokens e inputs de hasta 8.000; capacidad compartida con respuestas 429 y cabecera `Retry-After`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión (5 tareas) | Licencia | Notas |
|---|---|---|---|---|---|
| Jev-Style-Qwen3.5-2B-Decision v1 (este) | 1,88B | no disponible | 82,3% | Apache 2.0 | Solo inglés, MLX/GGUF, v1 archivada |
| Jev-Style-0.8B-Decision v3 | 0,8B | 25.600 tokens | 79,2% en 2.000 decisiones tipadas | no disponible en la información | 51 idiomas, sin límite de 26 opciones |
| Jev-Style 2B v4 | 2B | 8.192 tokens (servicio alojado) | no disponible | no disponible en la información | Texto e imagen, etiquetas suaves de Jev 1.14 |
| Qwen3.5-2B-Base | ~1,88B | no disponible | 65,9% (zero-shot) | no disponible en la información | Modelo base generativo, sin calibración |

No se dispone de comparaciones con modelos de clasificación de propósito general (por ejemplo, SetFit o encoders tipo DeBERTa) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, solo elige entre opciones proporcionadas. Usarlo fuera de ese contrato dará resultados sin sentido.
- Solo inglés en esta versión; el rendimiento en otros idiomas no está caracterizado.
- Es la v1 archivada: el autor recomienda migrar a la v3 (0,8B) o a la v4 (2B). El paquete `jev-style` actual no carga estos pesos.
- Las métricas de calibración y precisión provienen del propio autor y de sus conjuntos de evaluación; no hay replicación independiente en la información disponible.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de decisiones erróneas con alta confianza en dominios alejados de la distribución de entrenamiento (GLUE, AG News, BoolQ, SST-5).
- Sesgos: no se documentan análisis de sesgo demográfico, de dominio ni de longitud de entrada.
- Licencia Apache 2.0 permite uso comercial, pero el proyecto declara no tener afiliación ni respaldo de TypeSafe; la procedencia de entrenamiento varía por release y debe verificarse antes de desplegar.
- La latencia reportada (77 ms) corresponde a M1 Max; no hay datos de latencia en GPU NVIDIA ni de throughput en lote.
- El servicio alojado comparte capacidad y puede devolver 429; no hay cuota fija por cuenta, lo que exige lógica de reintento en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-MLX-bf16
- Versión v2: https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2-MLX-bf16
- Versión 0.8B v3: https://huggingface.co/chaoliangUNSW/Jev-Style-0.8B-Decision-v3-MLX
- GGUF (BF16 / Q8_0 / Q4_K_M): https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Sitio del proyecto: https://jevstyle.com/models/
- Guía de instalación y verificación local: https://jevstyle.com/guides/run-locally/
- Clasificación de texto en Python: https://jevstyle.com/guides/local-text-classification/
- Herramientas de routing local y Apple silicon: https://jevstyle.com/guides/local-decision-models/
- Decisiones sí/no sobre recibos y capturas: https://jevstyle.com/use-cases/local-vision-decisions/
- Benchmark de routing bancario: https://jevstyle.com/benchmarks/banking-routing/
- Estado del servicio alojado: https://jevstyle.com/api/#service-status
- Health check de la API: https://api.jevstyle.com/healthz
- Blog de TypeSafe sobre Jev: https://typesafe.ai/blog/introd
