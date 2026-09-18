# islamassanov/Qwen3.5-2B-auto-optimized

## Resumen

Qwen3.5-2B-auto-optimized es una versión del checkpoint Qwen3.5-2B (2.274.069.824 parámetros) publicada por el usuario islamassanov, en la que se han modificado únicamente los caminos de inferencia, no los pesos. Los pesos BF16 y el tokenizador se mantienen idénticos a los de la revisión `15852e8c16360a2fea060d615a32b45270f8a8fc` del modelo base Qwen/Qwen3.5-2B. El repositorio incluye un motor propio denominado `qwen35_fast`, que el autor atribuye a una optimización automática realizada con "Claude Fable".

El problema que aborda es la latencia de decodificación en escenarios de una sola petición (batch 1) sobre GPU NVIDIA. Según los datos del propio autor, el motor alcanza entre 582 y 848 tokens/s de decodificación en una H100 SXM, frente a los 50-51 tokens/s de Transformers en modo eager, lo que supone una mejora de 14× en media geométrica sobre 12 cargas de desarrollo, y un rendimiento prácticamente idéntico al de vLLM 0.29 con decodificación especulativa multi-token (MTP).

El modelo es relevante porque combina tres técnicas de optimización concretas (CUDA graphs, fusión de kernels con `torch.compile` y Triton Gated-DeltaNet, y decodificación especulativa con la cabeza MTP del propio checkpoint) dentro de un motor autocontenido y redistribuible bajo licencia Apache-2.0. Su alcance es deliberadamente estrecho: generación de texto en batch 1, greedy y sin modo thinking.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer con kernels Gated-DeltaNet en la ruta de decodificación; detalles completos de la arquitectura base no disponibles) |
| Parámetros totales | 2.274.069.824 (≈2,27 B) |
| Parámetros activos | No disponible (no se indica que la configuración sea MoE) |
| Longitud de contexto | No disponible (los benchmarks cubren entradas de hasta 8.192 tokens, pero no se declara la ventana oficial) |
| Tipos de cuantización | No disponible; los pesos se distribuyen y se ejecutan en BF16 sin cambios |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería: transformers) |

## Arquitectura y entrenamiento

El repositorio no entrena ni modifica el modelo base: es un checkpoint de inferencia. Los pesos y el tokenizador provienen sin alteración de Qwen/Qwen3.5-2B, por lo que la arquitectura de red es la del propio Qwen3.5-2B, un transformer de 2,27 B de parámetros con pipeline declarado `image-text-to-text`. La mención a kernels Triton Gated-DeltaNet (`fused_gdn=True`) y a una cabeza MTP en el checkpoint indica que el modelo base incorpora componentes de atención lineal tipo Gated DeltaNet y predicción multi-token, aunque la información proporcionada no detalla la composición del dataset ni las fases de preentrenamiento, ajuste supervisado o RLHF/DPO del modelo original.

La innovación real de esta publicación está en la ruta de ejecución, descrita en tres cambios: (1) captura del paso de decodificación en un grafo CUDA para reducir el overhead de lanzamiento de kernels; (2) fusión de operaciones de decodificación mediante `torch.compile` y kernels Triton Gated-DeltaNet; y (3) uso de la cabeza MTP del checkpoint para proponer dos tokens por paso, aceptando cada uno solo cuando el modelo objetivo toma la misma decisión greedy. El motor se instancia con los parámetros `spec_k=2`, `compile_blocks=True` y `fused_gdn=True`, y la generación se lanza con `enable_thinking=False`. La ruta optimizada está restringida a batch 1, decodificación greedy y texto; el checkpoint original sigue siendo utilizable con Transformers para los flujos estándar de texto y visión-lenguaje de Qwen.

## Capacidades

- Generación de texto autoregresiva en modo greedy, con la ruta optimizada limitada a batch 1.
- Generación de código: los benchmarks del autor incluyen cargas de trabajo de código con entradas de 128 a 8.192 tokens, con 661-738 tokens/s de decodificación.
- Salidas estructuradas: el autor reporta el mejor rendimiento en prompts estructurados, con 807-848 tokens/s.
- Procesamiento de contexto medio-largo: se han medido entradas de 128, 512, 2.048 y 8.192 tokens.
- Decodificación especulativa mediante la cabeza MTP del checkpoint, con verificación greedy token a token.
- Compatibilidad con plantillas de chat de Qwen (`apply_chat_template`), incluyendo control explícito del modo thinking mediante `enable_thinking=False`.
- Soporte de visión-lenguaje heredado del checkpoint base a través de Transformers; el motor `qwen35_fast` no cubre esta modalidad.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no documentadas (el campo de idiomas aparece como no disponible).
- Modo thinking: el motor optimizado funciona explícitamente con `enable_thinking=False`; el modo thinking no forma parte de la ruta optimizada.

## Casos de uso

- Servicio de generación de texto de baja latencia con una sola petición concurrente: el motor está diseñado para batch 1 y alcanza 582-848 tokens/s en H100 SXM, lo que reduce el tiempo percibido en respuestas de 256-512 tokens a fracciones de segundo.
- Asistentes conversacionales multi-turno con contexto moderado: la ventana se ha validado hasta 8.192 tokens de entrada con prompts de prosa, código y salida estructurada, suficiente para diálogos largos con historial acumulado.
- Generación de código asistida en el editor: el rendimiento sostenido en prompts de código (661-738 tokens/s) permite completar funciones o bloques en tiempos compatibles con autocompletado interactivo.
- Producción de JSON y otros formatos estructurados: es la carga con mejor throughput medida (807-848 tokens/s), adecuada para extracción de datos y transformación de registros.
- Despliegue de un solo inquilino en una GPU dedicada: al consumir aproximadamente 4,6 GB en BF16, el modelo puede servirse íntegramente en memoria de una GPU única sin particionado ni tensor parallelism.
- Investigación sobre decodificación especulativa: el repositorio incluye el código de benchmark y el historial de desarrollo, por lo que sirve como banco de pruebas reproducible para comparar MTP, CUDA graphs y fusión de kernels frente a vLLM.
- Automatización interna donde la reproducibilidad importa: la verificación greedy token a token garantiza que la salida especulativa coincide con la del modelo objetivo, lo que facilita la validación de resultados en pipelines deterministas.
- Punto de partida para ajuste fino: al conservar los pesos y el tokenizador originales bajo Apache-2.0, puede reutilizarse como base de fine-tuning sin perder compatibilidad con el ecosistema Transformers.

## Benchmarks y rendimiento

Resultados de decodificación autoinformados por el autor: una H100 SXM, batch 1, 256 tokens generados por prompt, mediana de cinco ejecuciones, cronometraje iniciado tras el primer token. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

| Motor | Decode tokens/s |
|---|---|
| Transformers eager | 50-51 |
| vLLM 0.29 | 429-437 |
| vLLM 0.29 + MTP | 527-915 |
| Motor optimizado (Fable) | 582-848 |

| Carga de desarrollo | Transformers eager | vLLM + MTP | Motor Fable |
|---|---|---|---|
| Prosa, 128-8.192 tokens de entrada | 50-51 | 528-576 | 582-618 |
| Código, 128-8.192 tokens de entrada | 50-51 | 637-736 | 661-738 |
| Estructurado, 128-8.192 tokens de entrada | 50-51 | 824-915 | 807-848 |

Resumen agregado declarado por el autor: 14× la velocidad de decodificación de Transformers eager y 1,02× la de vLLM con MTP en media geométrica sobre 12 cargas de desarrollo; en 12 cargas retenidas, 528-866 tokens/s y 1,01× vLLM con MTP. El autor menciona además una regresión en IFEval recogida en `RESULTS.md`, sin cifras disponibles en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan aproximadamente 4,6 GB en BF16 (2,27 B de parámetros), a lo que hay que sumar caché KV y activaciones; el tamaño total del repositorio es de 4,6 GB.
- GPU de referencia en las mediciones: una H100 SXM. No se han publicado cifras para otras GPU.
- GPU recomendadas: H100 (entorno medido y para el que se ajustaron los kernels Triton). Compatibilidad con A100, L40S o RTX 4090 no está documentada.
- Cabe en GPU de consumo: por tamaño de pesos, sí en tarjetas con 8 GB o más de VRAM (RTX 4090, RTX 3090, RTX 4080, etc.), pero la ruta optimizada depende de CUDA graphs y kernels Triton compilados, por lo que el rendimiento fuera de H100 es desconocido.
- Requisitos de software: Python 3.12, GPU NVIDIA con CUDA, `transformers` para el tokenizador, `huggingface_hub` para la descarga y las dependencias de `requirements.txt` del repositorio.
- Opciones de despliegue: motor incluido `qwen35_fast` (ruta optimizada), Transformers en modo eager (ruta no optimizada, 50-51 tokens/s) y vLLM 0.29 (429-437 tokens/s sin MTP, 527-915 tokens/s con MTP). No se documentan Ollama, llama.cpp ni TGI.
- Latencia y throughput: en H100 SXM con batch 1, entre 582 y 848 tokens/s según la carga, equivalente a aproximadamente 1,2-1,7 ms por token en decodificación. No hay datos de prefill ni de latencia de primer token.

## Comparativa con modelos similares

Todos los puntos de comparación son el mismo modelo subyacente (Qwen/Qwen3.5-2B, 2,27 B de parámetros, licencia Apache-2.0) ejecutado con distintos motores, porque la información proporcionada no incluye otros modelos de la misma categoría.

| Configuración | Parámetros | Decode en H100 (batch 1) | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.5-2B + Transformers eager | 2,27 B | 50-51 tok/s | Apache-2.0 | HuggingFace |
| Qwen3.5-2B + vLLM 0.29 | 2,27 B | 429-437 tok/s | Apache-2.0 | vLLM |
| Qwen3.5-2B + vLLM 0.29 + MTP | 2,27 B | 527-915 tok/s | Apache-2.0 | vLLM |
| Qwen3.5-2B-auto-optimized (Fable) | 2,27 B | 582-848 tok/s | Apache-2.0 | HuggingFace |

No se dispone de datos de longitud de contexto, idiomas ni benchmarks de calidad para ninguna de las configuraciones, por lo que la comparación se limita al rendimiento de decodificación y a la licencia.

## Limitaciones y advertencias

- La ruta optimizada solo funciona con batch 1, decodificación greedy y texto. No admite sampling, beam search, lotes mayores ni la modalidad de visión-lenguaje del checkpoint base.
- La decodificación especulativa con la cabeza MTP solo es correcta bajo criterio greedy; con muestreo estocástico la equivalencia con el modelo objetivo no está garantizada.
- El autor reconoce una regresión en IFEval detectada durante el desarrollo y remite a `RESULTS.md`, sin detallar la magnitud ni la causa.
- Todos los benchmarks están medidos por el propio autor, en una única sesión y sobre una sola H100 SXM, sin replicación externa ni comparación con otras GPU.
- El repositorio tiene un historial de uso mínimo (17 descargas y 1 like), por lo que no existe validación comunitaria ni evidencia de comportamiento en producción.
- No se declaran idiomas soportados, longitud de contexto oficial ni esquemas de cuantización; cualquier decisión de despliegue sobre estos puntos requiere verificación directa contra el modelo base.
- Requiere GPU NVIDIA con CUDA y Python 3.12; no se documenta soporte para CPU, ROCm ni aceleradores de otros fabricantes.
- La licencia Apache-2.0 permite uso comercial y modificación, pero el modelo base y las dependencias (Transformers, vLLM, Triton, CUDA) tienen sus propios términos que deben revisarse por separado.
- Riesgo de alucinación y sesgos heredados íntegramente del modelo base Qwen/Qwen3.5-2B, ya que no se ha aplicado ningún ajuste adicional.
- El repositorio se publicó el 18 de septiembre de 2026 y se actualizó el mismo día; el proyecto puede no tener mantenimiento continuado.
- La model card atribuye la optimización a "Claude Fable", pero no describe la metodología de búsqueda ni los criterios de aceptación de las modificaciones, lo que dificulta auditar los cambios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/islamassanov/Qwen3.5-2B-auto-optimized
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio del proyecto (código de benchmark e historial de desarrollo): https://github.com/islamborghini/Qwen3.5-2B-auto-optimized
- Resultados detallados por prompt y mediciones retenidas: https://huggingface.co/islamassanov/Qwen3.5-2B-auto-optimized/blob/main/RESULTS.md
- Revisión de los pesos originales: `15852e8c16360a2fea060d615a32b45270f8a8fc`
- Resultados de búsqueda web: no se ha encontrado ninguna fuente relevante sobre este modelo; las referencias devueltas corresponden a perfiles de redes sociales sin relación con el proyecto.
