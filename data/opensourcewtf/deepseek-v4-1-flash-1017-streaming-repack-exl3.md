# OpensourceWTF/DeepSeek-V4.1-Flash-1017-streaming-repack-exl3

## Resumen

DeepSeek-V4.1-Flash-1017 es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por DeepSeek. Esta ficha concreta, publicada por el usuario OpensourceWTF, no es el modelo original sino un *repack* de cuantización EXL3 orientado a inferencia con expertos en streaming desde SSD mediante la librería `mlx-serve`. El objetivo es permitir que un Mac con 128 GB de memoria unificada pueda servir un modelo cuyo peso cuantizado ronda los 408 GB, cargando solo el tronco en memoria y leyendo los expertos enrutados y las tablas Engram desde disco a medida que se necesitan.

El paquete se distribuye por ramas según la tasa de bits: la rama `main` contiene la model card y la licencia, mientras que la rama `2.81bpw` aloja los pesos (408,2 GB) y la rama `2.9bpw` está anunciada como próxima. La cuantización de partida es EXL3 SC a 2,81 bits por peso en los expertos (K3, con K2 en las capas 23 y 32-39) y tronco a K6, repackeada desde el cuantizado crudo de exllamav3 del mismo autor.

La relevancia de esta publicación es fundamentalmente práctica: demuestra una vía para ejecutar modelos de escala frontier en hardware de consumo Apple Silicon mediante cuantización agresiva combinada con carga perezosa desde almacenamiento. No obstante, se trata de un artefacto derivado, no del modelo oficial, y su calidad se mide frente a los pesos de la release original (PPL 1,7730) con una degradación documentada (PPL 1,8305; KLD medio 0,0396).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con tablas Engram; pesos en formato EXL3 |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (las pruebas de velocidad usan prompts de 16K tokens) |
| Tipos de cuantizacion | EXL3 SC 2,81 bpw en expertos (K3; K2 en capas 23 y 32-39), tronco K6; rama 2.9bpw con EAQ v1 2,9 bpw (K3; K2 en capas 18-22) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | EXL3 repackeado para streaming en `mlx-serve` (no safetensors ni GGUF estándar) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de tipo Mixture of Experts con un componente adicional denominado tablas Engram, que en este repack se leen desde SSD junto con los expertos enrutados. El tronco del modelo se carga una sola vez en memoria, mientras que los expertos y las tablas Engram se transmiten bajo demanda, lo que reduce el requisito de RAM a costa de depender del ancho de banda del almacenamiento. Los detalles sobre el número de parámetros, la composición del dataset de entrenamiento, el número de tokens vistos y las etapas de alineación (RLHF/DPO) no están disponibles en la información proporcionada.

La innovación técnica de esta ficha no reside en el entrenamiento sino en el empaquetado: se trata de una cuantización EXL3 realizada con el pipeline SC de exllamav3 y posteriormente reordenada para el layout de expertos en streaming de `mlx-serve`. La rama 2.9bpw emplea la cuantización EAQ v1 de Mia-AiLab para los expertos enrutados (copiados byte a byte) y repacks MLX exactos de la release para el resto de pesos; dado que ese repositorio de origen no incluye tablas Engram, se usaron las tablas FP8 de la release. La evaluación de calidad se realizó con `qbench` de exllamav3 comparando los pesos FP8/FP4 originales frente a cada pack sobre el mismo conjunto de tokens.

## Capacidades

- Generación de texto autoregresiva con decodificación greedy y muestreada.
- Razonamiento con niveles de esfuerzo configurables (las pruebas de calidad usan esfuerzo medio).
- Uso de herramientas: el conjunto de evaluación incluye un 30% de prompts con tool use.
- Soporte de conversaciones multi-turno (el conjunto de prueba son 20 conversaciones retenidas).
- Política de verificación DSpark activada por defecto en el servido, con impacto medido en velocidad de decodificación.
- Ejecución en Apple Silicon mediante `mlx-serve` con expertos en streaming desde SSD.
- Capacidades multilingües, de visión, audio o modo thinking explícito: no disponibles en la información proporcionada.

## Casos de uso

- Inferencia local de un modelo de escala frontier en un Mac de 128 GB: el tronco se mantiene residente y los expertos se leen desde SSD, lo que permite servir el modelo sin clúster de GPUs. Es adecuado por el diseño explícito de streaming de `mlx-serve`.
- Evaluación de calidad de cuantizaciones agresivas: investigadores pueden reproducir el método de `qbench` (PPL y KLD frente a los pesos FP8/FP4 de la release) para medir la degradación de packs a 2,81 bpw sobre un conjunto de 20 conversaciones y 45.434 tokens de completación.
- Prototipado de asistentes con tool calling en estación de trabajo: el conjunto de evaluación incluye un 30% de prompts con uso de herramientas, lo que permite validar pipelines de function calling antes de desplegar en infraestructura mayor.
- Procesamiento de prompts largos de código: con prefill medido de 1.692,85 tok/s sobre un prompt de código de 16K tokens en frío, resulta viable para tareas de análisis o generación sobre fragmentos extensos de código en local.
- Servicio de generación de texto interactivo: con decodificación de 55,7 tok/s en greedy y 47,8 tok/s en muestreado, es adecuado para aplicaciones de chat o autocompletado en las que la latencia percibida es aceptable.
- Investigación sobre carga perezosa de expertos: sirve como banco de pruebas para estudiar el compromiso entre ancho de banda de SSD, aciertos de caché de expertos y throughput de decodificación en arquitecturas MoE.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia MIT del pack facilita su integración en productos comerciales, sujeta a las condiciones del modelo base.

## Benchmarks y rendimiento

| Metrica | 2.81bpw | 2.9bpw (proxima) |
|---|---:|---:|
| Tamano del repo | 408,2 GB | 417,8 GB |
| Pesos principales (qbench) | 182,0 GiB, 2,837 bpw | 187,1 GiB, 2,916 bpw |
| PPL (release FP8/FP4: 1,7730; suelo de ruido: 1,7733) | 1,8305 | 1,8306 |
| KLD medio (suelo de ruido: 0,0023) | 0,0396 | 0,0401 |
| KLD mediana (suelo de ruido: 0,0002) | 0,0051 | 0,0058 |
| KLD p90 (suelo de ruido: 0,0050) | 0,0917 | 0,0893 |
| Prefill, prompt de codigo de 16K tokens, en frio (tok/s) | 1.692,85 | no medido en este stack |
| Prefill, slice de texto nuevo de 16K en el mismo servidor (tok/s) | 1.799,45 | no medido en este stack |
| Decode greedy (tok/s) | 55,7 | no medido en este stack |
| Decode muestreado con clave (tok/s) | 47,8 | no medido en este stack |
| Decode por defecto con politica DSpark, muestreado / greedy (tok/s) | 47,7 / 55,1 | no medido en este stack |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las métricas anteriores son de perplejidad, divergencia KL y velocidad, no de exactitud en tareas.

## Requisitos de hardware

- RAM: el diseño apunta a un Mac con 128 GB de memoria unificada, ya que el tronco se carga una vez y los expertos se transmiten desde SSD. El tamaño total del pack (408,2 GB) excede con mucho la memoria disponible, de ahí el streaming.
- Almacenamiento: se requiere SSD con capacidad para al menos 408,2 GB (rama 2.81bpw) o 417,8 GB (rama 2.9bpw), y con ancho de banda suficiente para alimentar la lectura de expertos; no se especifican cifras mínimas de IOPS o GB/s.
- GPU: el stack es específico de Apple Silicon mediante `mlx-serve`; no se documenta soporte para A100, H100 ni RTX 4090 en esta ficha.
- Cabe en GPU de consumo: no en el sentido convencional; el modelo completo no reside en VRAM ni en memoria unificada, sino que depende del streaming desde disco.
- Opciones de despliegue: `mlx-serve` (librería declarada) con `mlx-stream` para la variante 2.9bpw; el cuantizado crudo de origen es para exllamav3.
- Latencia y throughput: prefill de 1.692,85 a 1.799,45 tok/s y decode de 47,7 a 55,7 tok/s según política, medidos en el stack del autor. No se documentan latencias absolutas ni TTFT.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 streaming repack EXL3 (esta ficha) | no disponible | no disponible | EXL3 2,81 bpw, streaming | MIT | Publicado (rama 2.81bpw) |
| OpensourceWTF/DeepSeek-V4.1-Flash-1017-exl3-2.81bpw | no disponible | no disponible | EXL3 2,81 bpw crudo | no disponible | Publicado |
| Mia-AiLab/DeepSeek-V4.1-Flash-1017-EXL3-EAQ-v1-2.9-bpw | no disponible | no disponible | EXL3 EAQ v1 2,9 bpw | no disponible | Publicado |
| OpensourceWTF/DeepSeek-V4.1-Flash-streaming-repack-exl3 (rama 3.0bpw) | no disponible | no disponible | EXL3 3,0 bpw, streaming | no disponible | Publicado (KLD no medido) |

Las alternativas comparables son variantes de cuantización del mismo modelo base, no modelos distintos. No se dispone de datos para comparar con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Artefacto derivado: no es el modelo oficial de DeepSeek, sino un repack de cuantización realizado por un tercero; los resultados de calidad deben interpretarse respecto a los pesos de la release, no como capacidades del modelo original.
- Degradación medible: PPL de 1,8305 frente a 1,7730 de la release y KLD medio de 0,0396, muy por encima del suelo de ruido de 0,0023; la cola de la distribución (p90 de 0,0917) indica que algunas generaciones se desvían notablemente.
- Dependencia crítica del almacenamiento: el rendimiento en decode (47,7-55,7 tok/s) está condicionado por el ancho de banda del SSD; discos lentos degradarán gravemente la latencia.
- Ecosistema restringido: requiere `mlx-serve` y hardware Apple Silicon; no es portable a vLLM, llama.cpp, Ollama ni TGI en su forma actual.
- Idiomas soportados no documentados: no se puede garantizar cobertura multilingüe ni evaluar sesgos por idioma.
- Riesgo de alucinación: no cuantificado en la información disponible; aplica el riesgo general de los modelos generativos, agravado por la cuantización agresiva.
- Licencia MIT del pack: permisiva para uso comercial, pero sujeta a las condiciones que el autor del modelo base imponga sobre los pesos originales, no detalladas aquí.
- Rama 2.9bpw anunciada como "coming": su disponibilidad y métricas en este stack aún no están confirmadas.
- Sin datos de benchmarks de exactitud: no hay evidencia publicada de rendimiento en MMLU, HumanEval, GSM8K ni tareas agénticas para este pack.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OpensourceWTF/DeepSeek-V4.1-Flash-1017-streaming-repack-exl3
- Rama 2.81bpw: https://huggingface.co/OpensourceWTF/DeepSeek-V4.1-Flash-1017-streaming-repack-exl3/tree/2.81bpw
- Modelo base oficial: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Cuantizado crudo de origen: https://huggingface.co/OpensourceWTF/DeepSeek-V4.1-Flash-1017-exl3-2.81bpw
- Repack streaming 2.9bpw: https://huggingface.co/OpensourceWTF/DeepSeek-V4.1-Flash-1017-streaming-repack-exl3-2.9bpw
- Repack streaming 3.0bpw (base anterior): https://huggingface.co/OpensourceWTF/DeepSeek-V4.1-Flash-streaming-repack-exl3/tree/3.0bpw
- Cuantizado EAQ v1 2.9bpw de Mia-AiLab: https://huggingface.co/Mia-AiLab/DeepSeek-V4.1-Flash-1017-EXL3-EAQ-v1-2.9-bpw
- mlx-serve: https://github.com/ddalcu/mlx-serve
- exllamav3: https://github.com/turboderp-org/exllamav3
- mlx-stream: https://github.com/davidtai/mlx-stream
