# abhishek085/spark-s1-4b-v6

## Resumen

spark-s1-4b-v6 es un modelo de decisión "System-1" desarrollado por abhishek085 dentro del proyecto Open Spark Jev, una implementación independiente y de código abierto inspirada en Jev y System One de TypeSafe (sin afiliación con TypeSafe AI). No es un modelo generativo: recibe un estado (texto o JSON) y una pregunta tipada con opciones definidas en tiempo de petición, y devuelve una probabilidad para cada opción junto con una confianza en un único forward pass, sin generar texto. La respuesta se obtiene aplicando softmax a los logits del primer token restringidos a las letras de las opciones, divididos por una temperatura ajustada sobre un split de calibración; no hay cabeza adicional.

Técnicamente es un derivado con LoRA fusionado sobre Qwen/Qwen3.5-4B, un backbone híbrido de 4.205.751.296 parámetros (4,2 B) con 32 capas: 24 capas de atención lineal estilo Gated-DeltaNet y 8 capas de atención completa. La versión v6 mantiene los datos, el alcance y la receta LoRA de v5, y el cambio principal es precisamente el salto de backbone (Qwen3-4B a Qwen3.5-4B). Su ámbito declarado son las decisiones tipo Jev y, en particular, los guardrails de agentes y la seguridad de tool calls.

Es relevante porque aborda un nicho poco cubierto con modelos abiertos: la clasificación de decisiones con distribución de probabilidad calibrada y coste de un solo forward pass, orientada a inferencia local sobre NVIDIA DGX Spark, con licencia Apache-2.0 y una variante cuantizada NVFP4 que reduce la latencia un 40 % sin coste medible de precisión. Se trata, según el propio autor, de un lanzamiento muy temprano y sujeto a cambios rápidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 24 capas de atención lineal estilo Gated-DeltaNet + 8 capas de atención completa (32 en total); `model_type=qwen3_5_text` |
| Parametros totales | 4.205.751.296 (4,2 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (referencia) y NVFP4 solo en las capas MLP, publicada como repo aparte; no se detallan otras |
| Idiomas soportados | Inglés únicamente (el propio autor lo declara English only) |
| Licencia | Apache-2.0 (backbone Qwen/Qwen3.5-4B, también Apache-2.0) |
| Formato de pesos | safetensors (repo de 8,4 GB) |
| Tarea declarada (pipeline) | text-classification / decision-model |
| Modelo base | Qwen/Qwen3.5-4B (derivado con LoRA fusionado) |
| Salida | Distribución de probabilidad sobre las opciones + confianza; sin generación de texto |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un backbone híbrido que combina 24 capas de atención lineal (estilo Gated-DeltaNet) con 8 capas de atención completa sobre un total de 32. Sobre él se aplicó un ajuste LoRA que después se fusionó con los pesos base, dando lugar a un artefacto denso de 4,2 B de parámetros. La receta de datos, el alcance y el procedimiento LoRA de v6 son idénticos a los de v5; lo único que cambia respecto a la entrega anterior es el backbone (Qwen3-4B pasa a Qwen3.5-4B). Los datos se ensamblan con `scripts/build_v5_data.py` a partir de ejecuciones de `os-datagen`, y todavía no se han empaquetado como un dataset versionado propio. El entrenamiento se reproduce con `scripts/run_v6_4b.sh` y `configs/train/sft_v6.yaml`.

La innovación funcional no está en la arquitectura, sino en el mecanismo de lectura de respuestas: el estado se renderiza una vez y se pasa por el modelo conservando su caché; la pregunta se convierte en un menú con letras (`A. billing`, `B. technical`…); los logits del siguiente token se restringen a esas letras y se normalizan a una distribución; finalmente, una temperatura ajustada sobre un split de calibración retenido escala el resultado. No se añade ninguna cabeza de clasificación. Según el autor, la optimización de caché por estado (codificar una vez y responder varias preguntas de forma barata) todavía no se aplica a este backbone, que recurre a un forward pass completo por pregunta.

## Capacidades

- Decisión clasificatoria con distribución de probabilidad sobre opciones definidas en tiempo de petición, en un solo forward pass y sin generación de texto.
- Guardrails de agentes: decidir entre permitir, preguntar o denegar una tool call a partir del estado de la conversación o del comando propuesto.
- Detección de inyección de prompt, con y sin contexto de despliegue (0,924 / 0,867 de precisión según los datos del autor).
- Clasificación de riesgo de tool calls en un conjunto diagnóstico de 60 casos (0,900).
- Decisiones tipo Jev sobre el directorio de 70 preguntas del ecosistema Jev (0,871) y sobre Kev decision-v1 (0,800) y Kev transfer-v4 (0,756 en dev / 0,787 en test bloqueado).
- Acepta estados en texto plano o JSON, lo que permite alimentarlo directamente con el payload de una herramienta o el estado de un agente.
- Salida calibrada con temperatura ajustada, apta para fijar umbrales de auto-permiso conservadores.
- No soporta tool calling ni function calling: es consumidor de decisiones, no emisor de llamadas.
- No se ha entrenado ni evaluado para clasificación general de texto ni para detección de código vulnerable; el autor los marca explícitamente como no soportados.
- Multilingüe: no. El modelo es solo en inglés.

## Casos de uso

- **Guardrails de tool calls en agentes autónomos**: dado un estado JSON con la herramienta y los argumentos propuestos (por ejemplo `{"tool": "bash", "command": "kubectl get pods -n production"}`), el modelo devuelve probabilidades para `allow`, `ask` y `deny`. Encaja porque la decisión se resuelve en un forward pass, sin generar texto, y con una confianza calibrada que permite fijar umbrales.
- **Detección de inyección de prompt en producción**: clasificar si una entrada contiene un intento de secuestro de instrucciones, con o sin contexto de despliegue (0,924 y 0,867 respectivamente). Es adecuado como capa previa a un LLM generativo, ya que el coste por decisión es de decenas de milisegundos.
- **Enrutado de peticiones y tickets**: con opciones como `A. billing`, `B. technical`, `C. account`, el modelo produce una distribución utilizable para dirigir cada caso al equipo o al modelo adecuado. Su mecanismo de "menú con letras" está diseñado exactamente para este patrón.
- **Aprobación automatizada en pipelines de CI/CD y GitOps**: evaluar comandos de despliegue o cambios de infraestructura y decidir entre auto-aprobar, requerir revisión humana o bloquear. Con 13,3 decisiones/s en bf16 y 18,6 en NVFP4 sobre DGX Spark, el coste por evento es bajo incluso en volúmenes altos.
- **Clasificación de decisiones sobre estados de agente multi-turno**: al admitir texto o JSON como estado, permite evaluar la situación completa de un agente antes de ejecutar el siguiente paso, algo útil en orquestadores que necesitan una política explícita de avance o parada.
- **Auditoría y calibración de políticas internas**: el modelo expone probabilidades y confianza en lugar de texto libre, por lo que se puede registrar cada decisión con su margen y recalibrar umbrales con resultados etiquetados propios.
- **Semáforo de riesgo en asistentes de código con acceso a shell**: evaluar comandos destructivos propuestos por un copiloto antes de ejecutarlos, usando la variante NVFP4 cuando se necesite latencia mínima en hardware local.
- **Componente de evaluación en investigación sobre toma de decisiones**: sirve como referencia abierta y reproducible (Apache-2.0, scripts de entrenamiento y evaluación incluidos) para comparar decisiones System-1 frente a enfoques generativos.

## Benchmarks y rendimiento

Datos publicados por el autor (JevBench v1.2, solo ítems públicos; 231 de 534, el tier de jueces es privado):

| Medida | spark-s1-4b-v6 | spark-s1-4b-v5 (entrega anterior) |
|---|---:|---:|
| Test bloqueado propio / challenge (accuracy) | 0,929 / 0,911 | 0,867 / 0,861 |
| Conjunto diagnóstico de tool calls (60 casos) | 0,900 | 0,917 |
| Inyección de prompt, con / sin contexto de despliegue | 0,924 / 0,867 | 0,894 / 0,903 |
| Directorio Jev (70 preguntas) | 0,871 | 0,800 |
| Kev decision-v1 (clasificación externa) | 0,800 | 0,755 |
| Kev transfer-v4 (dev / test bloqueado, 764 cada uno) | 0,756 / 0,787 | no evaluado |
| JevBench, tiers públicos (fácil / estándar / difícil) | 1,000 / 1,000 / 0,595 | 1,000 / 0,847 / 0,523 |
| JevBench public-proxy Intelligence | 83,1 | 74,2 |

Notas: la puntuación public-proxy Intelligence procede de la función `composite_v12.intelligence()` de JevBench y no es la puntuación oficial de JevBench. No hay resultados publicados de MMLU, HumanEval, GSM8K ni de otros benchmarks de propósito general, coherentemente con el alcance restringido del modelo.

Latencia (batch size 1, una NVIDIA DGX Spark GB10, servido con vLLM):

| Backend | p50 | Decisiones/s |
|---|---:|---:|
| vLLM, bf16 | 74,9 ms | 13,3 |
| vLLM, NVFP4 (solo MLP) | 53,3 ms | 18,6 |

La variante NVFP4 es 1,40x más rápida sin coste medible de precisión (Intelligence 83,1 a 83,2). El autor señala que la mejora es menor que el 1,66x de v5-4b porque solo se cuantiza el MLP y este backbone híbrido concentra relativamente más cómputo en las rutas de atención no cuantizadas.

## Requisitos de hardware

- Tamaño de pesos: el repositorio ocupa 8,4 GB en safetensors, coherente con 4,2 B de parámetros en bf16 (aproximadamente 8,4 GB de pesos). No se publican requisitos oficiales de VRAM.
- Cabe en GPU de consumo: no se han publicado mediciones fuera de DGX Spark, pero el tamaño de pesos en bf16 permite anticipar que es ejecutable en tarjetas de 16 GB o más, y con holgura en una RTX 4090 (24 GB). Esta estimación es por tamaño y no está confirmada por el autor.
- Hardware medido: NVIDIA DGX Spark (GB10), una sola unidad, batch size 1. No hay datos para A100, H100 ni otras GPU.
- Ruta de despliegue recomendada: vLLM, que dispone de kernels nativos rápidos para esta arquitectura (`model_type=qwen3_5_text`). La variante NVFP4 es la opción de menor latencia (53,3 ms p50, 18,6 decisiones/s).
- HF Transformers en proceso no es recomendable para servir este backbone: `causal_conv1d` y `flash-linear-attention` no estaban instalados en el entorno de entrenamiento, por lo que las capas de atención lineal caen a kernels de referencia de PyTorch y el rendimiento se degrada notablemente. vLLM no se ve afectado.
- El autor no menciona soporte en llama.cpp, Ollama ni TGI; se consideran no disponibles.
- La optimización de caché por estado (una codificación, varias preguntas) aún no funciona en este backbone: se hace un forward pass completo por pregunta, con resultados correctos pero sin el ahorro multi-pregunta.
- Latencia y throughput conocidos: 74,9 ms p50 / 13,3 decisiones/s en bf16 y 53,3 ms p50 / 18,6 decisiones/s en NVFP4, en DGX Spark.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| spark-s1-4b-v6 | 4,2 B (denso) | no disponible | JevBench public-proxy Intelligence 83,1; test propio 0,929 | Apache-2.0 | HuggingFace, más variante NVFP4 |
| spark-s1-4b-v5 | no disponible | no disponible | Intelligence 74,2; test propio 0,867 | Apache-2.0 (según proyecto) | Entrega anterior del mismo proyecto |
| Qwen/Qwen3.5-4B (backbone) | 4 B (según nomenclatura) | no disponible | no evaluado en las mismas tareas; es un modelo generativo, no un decisor calibrado | Apache-2.0 | HuggingFace |
| Otros decisores System-1 abiertos | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación más significativa es interna, contra v5-4b: v6 mejora +6,2 puntos en accuracy de sus propios splits y pasa de 74,2 a 83,1 en Intelligence, pero retrocede en dos de los cinco conjuntos externos de estilo Jev (`ext-injection-noctx` -3,6 puntos y `ext-toolcall-risk` -1,7 puntos). No se dispone de datos para comparar con alternativas de terceros de la misma categoría.

## Limitaciones y advertencias

- **Alcance restringido**: solo decisiones de estilo Jev. No ha sido entrenado ni evaluado para clasificación general de texto ni para detección de código vulnerable; el autor los marca como no soportados.
- **Solo inglés**: el modelo no soporta otros idiomas, lo que limita cualquier despliegue en castellano u otras lenguas sin un ajuste adicional.
- **Servicio con HF Transformers lento**: la ausencia de `causal_conv1d` y `flash-linear-attention` degrada las capas de atención lineal en inferencia y entrenamiento en proceso. vLLM es la vía recomendada.
- **Sin caché de estado en este backbone**: no existe el atajo de codificar una vez y responder varias preguntas; cada pregunta implica un forward pass completo.
- **El cambio de backbone no es una victoria limpia**: dos conjuntos externos empeoran respecto a v5-4b pese a las mejoras en splits propios y JevBench.
- **RLCD descartado**: la calibración basada en resultados (RLCD) empeoró los resultados en dos intentos previos sobre versiones anteriores y no se reintentó en v6.
- **Sensibilidad a las opciones**: los resultados dependen de cómo se definan las opciones y de su orden, por lo que el autor recomienda recalibrar con resultados etiquetados propios antes de confiar en cualquier umbral.
- **Riesgo de alucinación en el sentido de confianza mal calibrada**: al devolver una distribución sobre opciones cerradas, el riesgo principal no es inventar contenido, sino asignar alta probabilidad a una opción incorrecta fuera de la distribución de calibración.
- **No es un control de autorización**: el propio autor advierte que no debe usarse una decisión del modelo como único mecanismo de autorización. Hay que desplegarlo con guardrails de política deterministas, umbral de auto-permiso conservador, registro de decisiones, credenciales de mínimo privilegio y aprobación humana para acciones sensibles (SECURITY.md).
- **Madurez**: lanzamiento muy temprano, con cambios rápidos esperados; los datos de entrenamiento aún no están empaquetados como dataset versionado, lo que dificulta la reproducibilidad completa.
- **Licencia**: Apache-2.0 tanto en el modelo como en el backbone, sin restricciones conocidas para uso comercial, pero al ser un derivado de Qwen/Qwen3.5-4B conviene conservar las atribuciones correspondientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abhishek085/spark-s1-4b-v6
- Variante cuantizada NVFP4 (solo MLP): https://huggingface.co/abhishek085/spark-s1-4b-v6-nvfp4
- Repositorio del proyecto Open Spark Jev: https://github.com/abhishek085/open-spark-jev
- Política de seguridad del proyecto: https://github.com/abhishek085/open-spark-jev/blob/main/SECURITY.md
- JevBench: https://github.com/fstandhartinger/jevbench
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Nota: la búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos no guardaban relación con la ficha.
