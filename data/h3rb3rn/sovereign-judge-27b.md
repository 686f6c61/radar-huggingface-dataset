# h3rb3rn/sovereign-judge-27b

## Resumen

`sovereign-judge-27b` es un modelo de verificación y evaluación de 26.9 mil millones de parámetros, desarrollado por h3rb3rn como componente central del sistema compound AI "MoE Sovereign". Se trata de un modelo denso basado en Qwen3.5-27B, destilado a partir de tres profesores de alto nivel: Meta-Llama-3.1-405B-Instruct, Nvidia Nemotron-70B y el oráculo de verificación formal Z3 SMT. El entrenamiento se realizó sobre el supercomputador LUMI-G con 8 GPU AMD Instinct MI250X de 128 GB.

El modelo resuelve un problema específico dentro de arquitecturas multi-agente: actuar como juez estricto y árbitro de consenso. Mientras que los modelos base tienden a ser complacientes al evaluar salidas de otros modelos, este juez aplica verificación adversarial, detecta contradicciones lógicas mediante lógica paraconsistente y decide si una salida supera un umbral de consenso del 66 % o requiere auto-corrección quirúrgica. Su relevancia actual radica en la creciente adopción de sistemas compound AI donde la calidad de las salidas generadas por múltiples modelos especializados necesita un control de calidad riguroso y automatizado.

El modelo soporta una ventana de contexto de 262.144 tokens, está disponible en formatos BF16, GGUF (Q4_K_M y Q8_0) y GPTQ, y se distribuye bajo licencia Apache 2.0. Su entrenamiento con LoRA (r=16, alpha=32) sobre 40.000 trayectorias de evaluación y arbitraje lo orienta específicamente a tareas de verificación, puntuación multi-aspecto y extracción de patrones de error.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (base Qwen3.5-27B) |
| Parametros totales | 26.895.998.464 (~26.9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | BF16, GGUF Q4_K_M, GGUF Q8_0, GPTQ |
| Idiomas soportados | Ingles, aleman |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, GPTQ |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso, heredado del modelo base Qwen3.5-27B en precision BF16. No se trata de un modelo de mezcla de expertos (MoE) a pesar del nombre "MoE Sovereign", que hace referencia al sistema compound AI en el que se integra, no a la arquitectura interna. El entrenamiento consistio en una destilacion desde tres profesores: Meta-Llama-3.1-405B-Instruct, Nvidia Nemotron-70B y el oraculo formal Z3 SMT, que generaron 40.000 trayectorias de evaluacion y arbitraje de alta garantia.

El ajuste se realizo con LoRA (r=16, alpha=32, dropout 0.05) sobre las proyecciones q, k, v, o, gate, up y down, durante 3 epocas con un batch efectivo de 128 (micro-batch 2, 8 GPUs, acumulacion de gradiente 8) y una tasa de aprendizaje de 1e-5 con decaimiento coseno y warmup. La precision de entrenamiento fue BF16 puro con DeepSpeed ZeRO-2 sobre el supercomputador LUMI-G (8x AMD Instinct MI250X de 128 GB, Slurm job #21191994). Tras el entrenamiento, el adaptador LoRA se fusiono con el modelo base en CPU y se exportaron versiones cuantizadas GGUF Q4_K_M y Q8_0.

## Capacidades

- Evaluacion adversarial estricta: puntua respuestas generadas por otros modelos en cinco ejes: fundamentacion factual, endurecimiento de seguridad, validez sintactica, cumplimiento regulatorio y eficiencia.
- Arbitraje de consenso paraconsistente: analiza salidas conflictivas de modelos peer, filtra valores atipicos y calcula puntuaciones de consenso calibradas sin que las contradicciones logicas exploten el espacio de razonamiento.
- Auto-correccion quirurgica: cuando un plan de ejecucion o un artefacto de codigo falla las compuertas de validacion, genera directivas de correccion minimas y especificas, identificando el invariante exacto violado.
- Extraccion de memoria de correccion: abstrae patrones de fallo detectados en anti-patrones reutilizables y los formatea como nuevas entradas para la memoria de correccion persistente.
- Verificacion formal: incorpora conocimiento destilado del oraculo Z3 SMT para comprobar consistencia formal de proposiciones y planes.
- Soporte multilingue: entrenado y evaluado en ingles y aleman.
- Integracion con sistemas compound AI: disenado para actuar como compuerta de calidad de nivel superior en pipelines multi-agente, con umbral de consenso configurable (66 % por defecto).

## Casos de uso

- Compuerta de calidad en pipelines compound AI: el modelo se situa al final de un flujo donde varios SLM especializados de 4B generan soluciones candidatas; evalua cada salida de forma adversarial y decide si supera el umbral de consenso del 66 % o se rechaza, garantizando que solo las respuestas verificadas lleguen al usuario final.
- Arbitraje de debates multi-agente: cuando varios agentes producen proposiciones contradictorias, el modelo aplica logica paraconsistente para detectar contradicciones sin colapsar el razonamiento, filtra valores atipicos y calcula una puntuacion de consenso calibrada que los agentes pueden aceptar.
- Verificacion de planes de ejecucion en sistemas autonomos: dado un plan DAG de ejecucion generado por un planificador, el modelo comprueba la consistencia formal del grafo, detecta dependencias ciclicas o invalidas y emite directivas de correccion quirurgica antes de que el plan se ejecute.
- Deteccion de alucinaciones en respuestas generadas: el modelo evalua la fundamentacion factual de respuestas producidas por otros LLM, marcando afirmaciones sin respaldo y generando informes de fallo detallados que indican el invariante exacto violado.
- Cumplimiento regulatorio automatizado: en sectores regulados (financiero, sanitario, legal), el modelo verifica que las salidas generadas cumplan con politicas de cumplimiento predefinidas, puntuando el eje de regulatory compliance y rechazando respuestas que incumplan normativas.
- Extraccion de patrones de error para memoria persistente: tras detectar fallos recurrentes en un sistema multi-agente, el modelo abstrae el anti-patron subyacente y genera entradas estructuradas para la memoria de correccion, permitiendo que el sistema aprenda de errores pasados sin reentrenamiento.
- Evaluacion de calidad multi-aspecto en entornos de testing: el modelo puede usarse como oraculo de evaluacion en suites de testing de LLMs, puntuando respuestas en los cinco ejes definidos y proporcionando metricas comparativas entre diferentes versiones de un mismo sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas estandar como MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros modelos juez. La unica comparativa documentada es cualitativa y enfrenta al modelo con el stock Qwen3.5-27B, destacando su postura estricta frente a la complacencia del base, pero sin numeros que respalden la afirmacion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16.8 GB en cuantizacion GGUF Q4_K_M, basado en estimaciones para el modelo base Qwen3.5-27B de tamano similar. En BF16 se requieren alrededor de 54 GB.
- GPU recomendadas: para entrenamiento se usaron 8x AMD Instinct MI250X de 128 GB. Para inferencia en produccion, GPU con 24 GB o mas (RTX 3090, RTX 4090, A100, H100) son adecuadas.
- Compatibilidad con GPU de consumo: si, tarjetas con 16 GB de VRAM (RTX 5060 Ti, RTX 4080) pueden ejecutar la version Q4_K_M, aunque con ventanas de contexto limitadas. Una RTX 3090 alcanza aproximadamente 40 tokens por segundo y una RTX 4090 unos 70 tokens por segundo, segun estimaciones para el modelo base similar.
- Opciones de despliegue: Ollama (con Modelfile incluido en la documentacion), llama.cpp, vLLM (via GPTQ), TGI y transformers con trust_remote_code.
- Latencia y throughput: no hay datos publicados especificos para este modelo; las cifras de tokens por segundo indicadas son estimaciones extrapoladas del modelo base Qwen3.5-27B y deben validarse en el hardware objetivo.

## Comparativa con modelos similares

No se han identificado modelos juez de tamano comparable (27B) con los que establecer una comparativa directa. La siguiente tabla compara el modelo con su base y con los profesores utilizados en la destilacion, a titulo orientativo:

| Modelo | Parametros | Contexto | Rol | Licencia |
|---|---|---|---|---|
| sovereign-judge-27b | 26.9B | 262.144 | Juez/verificador estricto | Apache 2.0 |
| Qwen3.5-27B (base) | 26.9B | 262.144 | Generacion general, evaluacion complaciente | Apache 2.0 |
| Nvidia Nemotron-70B (profesor) | 70B | no disponible | Generacion y evaluacion | no disponible |
| Meta-Llama-3.1-405B-Instruct (profesor) | 405B | no disponible | Generacion y razonamiento | no disponible |

La diferencia clave frente al base es comportamental: el juez aplica verificacion adversarial y logica paraconsistente, mientras que el base tiende a puntuar de forma indulgente. Los profesores son significativamente mayores y no estan optimizados especificamente para arbitraje de consenso.

## Limitaciones y advertencias

- Cobertura linguistica limitada: solo ingles y aleman; no se ha evaluado su rendimiento en otros idiomas, incluido el espanol.
- Temperatura recomendada muy baja (0.05): el modelo esta disenado para ser deterministico en sus juicios; usarlo con temperaturas altas puede degradar la consistencia de las evaluaciones.
- Riesgo de sobre-verificacion: al ser un juez adversarial estricto, puede rechazar salidas validas que un evaluador humano aceptaria, especialmente en tareas creativas o ambiguas.
- Dependencia del dataset de destilacion: la calidad de sus juicios esta limitada por las 40.000 trayectorias de entrenamiento; puede no generalizar bien a dominios no representados en ese conjunto.
- Sin benchmarks publicados: no hay evidencia cuantitativa independiente de su rendimiento frente a otros evaluadores, lo que dificulta la comparacion objetiva.
- Nombre potencialmente confuso: a pesar de llamarse "MoE Sovereign", es un modelo denso; la nomenclatura se refiere al sistema compound AI, no a la arquitectura interna.
- Requisitos de hardware considerables: la version BF16 necesita unos 54 GB de VRAM, fuera del alcance de la mayoria de GPU de consumo; las versiones cuantizadas son mas accesibles pero pueden perder precision en los juicios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/h3rb3rn/sovereign-judge-27b
- Variantes GGUF: https://huggingface.co/h3rb3rn/moe-sovereign-judge-27b-GGUF
- Coleccion de variantes (GGUF, GPTQ, BF16, LoRA): https://huggingface.co/collections/h3rb3rn/sovereign-judge-35b-all-variants
- Modelo base Qwen3.5-27B: https://huggingface.co/Qwen/Qwen3.5-27B
- Supercomputador LUMI-G: https://www.lumi-supercomputer.eu/
- Dataset de entrenamiento: https://huggingface.co/datasets/moe-sovereign/judge-verification-sft
