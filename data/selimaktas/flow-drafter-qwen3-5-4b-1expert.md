# selimaktas/Flow-Drafter-Qwen3.5-4B-1expert

## Resumen

Flow-Drafter-Qwen3.5-4B-1expert es un modelo "drafter" (borrador) diseñado para decodificación especulativa sobre el modelo base Qwen/Qwen3.5-4B. Lo desarrolla el usuario selimaktas (repositorio asociado github.com/Zeuss5/chained-flow) y emplea una técnica de flow matching encadenado para proponer varios tokens candidatos que el modelo objetivo verifica después. No es un modelo de propósito general: es un componente de aceleración de inferencia que se acopla a Qwen3.5-4B.

La variante publicada corresponde a un brazo de ablación del paper (denominado a1_experts1), en el que un único experto de flow genera los 8 borradores de posición en lugar de repartirlos entre dos expertos de 4 posiciones cada uno. Cuenta con 462.938.880 parámetros entrenables, frente a los 529.420.800 de la referencia con dos expertos, y se distribuye en dos semillas (s0 y s1) para reproducibilidad.

Su relevancia es metodológica: demuestra que un solo experto puede igualar prácticamente a la configuración de dos expertos en aceptación offline, lo que simplifica la arquitectura del drafter y reduce parámetros. Está pensado para investigadores que trabajen en decodificación especulativa, flow matching o aceleración de inferencia, no para despliegue directo como modelo conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter de flow matching encadenado sobre transformer (1 experto de flow, chunk_size 8) |
| Parametros totales | 462.938.880 parametros entrenables |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (evaluado en ingles y turco segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un drafter basado en flow matching encadenado. En lugar de predecir un único token siguiente, un experto de flow genera de forma conjunta los 8 tokens borrador de un chunk (chunk_size: 8). La variante publicada usa un solo experto para las 8 posiciones; la configuración de referencia del paper emplea dos expertos de 4 posiciones cada uno. El condicionamiento es del tipo "plugin": el drafter recibe los estados objetivo hasta h(t-1) más el token ya comprometido, que es exactamente lo que vLLM puede suministrar en producción.

El entrenamiento sigue la receta v2 durante 1 época, con 6.144 ventanas por paso. Se publican dos semillas: s0 (seed 42, window_seed 0, correspondiente al brazo del paper) y s1 (seed 43, window_seed 1). La configuración está en train_configs/paper_4b/a1_experts1.yaml y el script de lanzamiento en logs/paper/ours_experts1.sh dentro del repositorio chained-flow (rama paper-runs). No se detalla en la información disponible la composición del dataset de entrenamiento ni si hubo fases de RLHF o DPO, algo esperable por otra parte en un drafter.

## Capacidades

- Generación de tokens borrador para decodificación especulativa sobre Qwen3.5-4B: propone hasta 7 tokens en cadena o árboles de 40 nodos (8 por profundidad 5, top-b 8).
- Aceleración de inferencia del modelo objetivo mediante verificación de borradores; no genera respuestas de forma autónoma.
- Condicionamiento compatible con vLLM (estados objetivo hasta h(t-1) más token comprometido).
- Evaluado en inglés y turco, lo que sugiere cobertura multilingüe al menos en esos dos idiomas.
- No soporta tool calling, agentes ni razonamiento multi-paso por sí mismo: hereda las capacidades del modelo base solo en la medida en que acelera su decodificación.
- No dispone de modo thinking, visión ni audio propios.

## Casos de uso

- Aceleración de servidores de inferencia con vLLM: integrar el drafter como modelo especulativo de Qwen3.5-4B para reducir la latencia por token generado en despliegues de producción, aprovechando que el condicionamiento plugin coincide con lo que vLLM expone.
- Investigación en decodificación especulativa: usar las dos semillas publicadas (s0 y s1) para reproducir los resultados del paper y comparar estrategias de borrador en cadena frente a árbol.
- Ablación de arquitecturas de drafter: comparar esta variante de un experto (462,9 M parámetros) con la de dos expertos (529,4 M) para medir el coste/beneficio de simplificar el diseño.
- Evaluación multilingüe de aceptación: emplear los datos de aceptación en inglés y turco para estudiar cómo varía la tasa de aceptación del drafter según el idioma de generación.
- Generación de código y texto asistida de baja latencia: al acelerar Qwen3.5-4B, resulta adecuado para autocompletado en editores o asistentes interactivos donde el tiempo por token es crítico.
- Experimentos de flow matching aplicado a LLM: servir como referencia práctica para quienes investigan modelos de flow como alternativa a drafters autorregresivos clásicos.
- Docencia y reproducción de papers: el repositorio incluye configuraciones y scripts que permiten reentrenar el brazo de ablación desde cero.

## Benchmarks y rendimiento

Los únicos datos publicados son de aceptación offline greedy (1 + tokens borrador aceptados), con 600 posiciones generadas por dominio y lista corta de Qwen3.5. No son cifras de throughput.

| Brazo | EN cadena | EN árbol | TR cadena | TR árbol |
|---|---|---|---|---|
| 1 experto, s0 | 2,54 | 3,32 | 1,42 | 1,69 |
| 1 experto, s1 | 2,54 | 3,32 | 1,42 | 1,67 |
| 2 expertos (control), s0 | 2,59 | 3,32 | 1,41 | 1,69 |
| 2 expertos (control), s1 | 2,56 | 3,35 | 1,39 | 1,66 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, algo coherente con la naturaleza de drafter del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 3,7 GB en safetensors, por lo que en fp16 requiere aproximadamente 1 GB de pesos (462,9 M de parámetros) más overhead; en la práctica, el consumo lo domina el modelo objetivo Qwen3.5-4B.
- GPU recomendadas: cualquier GPU con capacidad suficiente para alojar simultáneamente Qwen3.5-4B y el drafter; una RTX 4090 (24 GB) es suficiente para el conjunto en fp16.
- Cabe en GPU de consumo: sí, siempre que el modelo objetivo también quepa; el drafter por sí solo ocupa menos de 1 GB en fp16.
- Opciones de despliegue: vLLM es el entorno previsto según la model card (condicionamiento plugin); no se documentan soportes para llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; la model card advierte explícitamente que las cifras de aceptación no son medidas de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Aceptación (EN cadena) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Flow-Drafter-Qwen3.5-4B-1expert (s0) | 462,9 M | no disponible | 2,54 | Apache 2.0 | HuggingFace |
| Flow-Drafter-Qwen3.5-4B-2expert (control) | 529,4 M | no disponible | 2,59 | Apache 2.0 | Referencia del paper |
| Drafters autorregresivos tipo EAGLE/Medusa para Qwen | no disponible | no disponible | no disponible | varía | no disponible |

No se dispone de datos de otros drafters comparables en la información proporcionada; la comparación más directa es con el brazo de dos expertos del mismo paper, que supera ligeramente al de un experto en cadena (2,59 frente a 2,54 en inglés) y lo iguala en árbol.

## Limitaciones y advertencias

- No es un modelo autónomo: sin Qwen3.5-4B no produce respuestas útiles; su función es exclusivamente proponer borradores.
- Las métricas publicadas son de aceptación offline, no de throughput ni de latencia real en producción.
- Solo se han evaluado dos idiomas (inglés y turco); el comportamiento en castellano u otros idiomas no está documentado.
- El rendimiento en cadena es notablemente inferior en turco (1,42) que en inglés (2,54), lo que sugiere dependencia del idioma.
- No se documentan sesgos, riesgos de alucinación ni limitaciones de contexto específicas; al heredar el comportamiento del modelo base, estos riesgos serían los de Qwen3.5-4B.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-4B.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni garantías de mantenimiento.
- La fecha de creación indicada (2026-10-26) debe tomarse con cautela; verificar la vigencia del artefacto antes de integrarlo.

## Enlaces

- HuggingFace: https://huggingface.co/selimaktas/Flow-Drafter-Qwen3.5-4B-1expert
- Repositorio del proyecto: https://github.com/Zeuss5/chained-flow (rama paper-runs)
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
