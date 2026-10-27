# bartowski/Nanbeige_Nanbeige4.3-33B-GGUF

## Resumen

Nanbeige4.3-33B es un modelo de lenguaje de 33.118.977.024 parámetros (aproximadamente 33B) desarrollado por Nanbeige, el equipo de IA detrás de BOSS Zhipin, la mayor plataforma de búsqueda de empleo de China. Se distribuye con licencia Apache 2.0 y está entrenado para generación de texto conversacional en inglés y chino, con soporte explícito de modo de razonamiento (bloque `<think>`) y de llamada a herramientas mediante un formato XML propio. La ficha que nos ocupa no es el modelo original, sino la colección de cuantizaciones GGUF publicada por bartowski, que permite ejecutar el modelo en hardware de consumo.

El interés práctico de esta publicación está en que reduce un modelo denso de 33B a ficheros de entre 20 y 21 GB en cuantizaciones de 4 bits, lo que lo sitúa en el rango de una GPU de 24 GB o de una configuración con offload parcial a RAM. Las cuantizaciones se han generado con llama.cpp (release b11845) aplicando imatrix, un proceso que calibra la cuantización con un corpus de referencia para preservar mejor los pesos sensibles.

No se han publicado en la información disponible datos sobre arquitectura interna, longitud de contexto, composición del dataset de entrenamiento ni resultados de benchmarks verificables. Esta ficha marca explícitamente esos huecos como «no disponible» en lugar de estimarlos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo denso de 33B, sin confirmación de variantes MoE o híbridas) |
| Parametros totales | 33.118.977.024 (dato real de safetensors) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, IQ4_NL, Q4_K_M, Q4_K_S, Q4_0, IQ4_XS, IQ3_M, Q3_K_L y siguientes escalones IQ3/IQ2 (lista truncada en la información disponible) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); pesos originales del modelo base presumiblemente en safetensors (no confirmado en la información disponible) |
| Método de cuantización | llama.cpp b11845 con imatrix |
| Modalidad de entrada | solo texto |
| Decodificación especulativa | no |

## Arquitectura y entrenamiento

No se dispone en la información proporcionada de detalles sobre la arquitectura interna del modelo (número de capas, dimensión oculta, tipo de atención, uso de atención lineal o híbrida), ni sobre el volumen de tokens de entrenamiento, la composición del corpus o las etapas de alineación (RLHF, DPO u otras). El único dato estructural confirmado es el recuento de parámetros del checkpoint original: 33.118.977.024.

Sí se conocen los artefactos de inferencia que condicionan el comportamiento en producción. El formato de prompt es ChatML (`<|im_start|>` / `<|im_end|>`) y el turno del asistente se abre con la etiqueta `<think>`, lo que indica que el modelo está diseñado para emitir una fase de razonamiento antes de la respuesta final. Para herramientas, el modelo espera las definiciones en JSON dentro de etiquetas `<tools></tools>` en el mensaje de sistema y devuelve las llamadas en XML con la estructura `<tool_call><function=nombre><parameter=clave>valor</parameter></function></tool_call>`. Las cuantizaciones incorporan imatrix, lo que en la práctica reduce la degradación de perplejidad respecto a una cuantización uniforme del mismo tamaño.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Modo de razonamiento explícito: el bloque `<think>` permite separar la cadena de razonamiento de la respuesta final.
- Tool calling / function calling mediante un formato XML documentado, con soporte de parámetros multilínea.
- Definición de múltiples funciones simultáneas en el mensaje de sistema dentro de `<tools>`.
- Capacidad de actuar como backend de agentes y flujos de varios pasos, apoyándose en el modo de razonamiento y en las llamadas a herramientas.
- Instrucciones de sistema configurables (system prompt) mediante el rol correspondiente de ChatML.
- No se ha confirmado en la información disponible soporte de visión, audio, ni otras modalidades distintas del texto.

## Casos de uso

- Agentes con herramientas en producción: el modelo puede recibir un catálogo de funciones en `<tools>` y emitir llamadas estructuradas parseables, lo que permite integrarlo en orquestadores de agentes que consulten APIs internas (precios, inventario, estado de pedidos) sin post-procesado complejo.
- Asistentes de atención al cliente en chino e inglés: el soporte nativo de ambos idiomas y el formato ChatML facilitan mantener conversaciones multi-turno con un system prompt que fije tono, políticas y límites.
- Razonamiento previo a la respuesta en dominios técnicos: activar la fase `<think>` resulta útil en tareas donde interesa auditar el razonamiento (triage de incidencias, diagnóstico de errores) y no solo el resultado.
- Despliegue en hardware de consumo para prototipado: con la cuantización Q4_K_M (20,79 GB) el modelo cabe en una GPU de 24 GB, lo que permite validar flujos de agente localmente antes de moverlos a infraestructura mayor.
- Procesamiento por lotes en local o en servidores sin GPU de gama alta: los ficheros IQ3_M (17,80 GB) e IQ4_XS (18,64 GB) permiten ejecución con offload parcial a RAM usando llama.cpp u Ollama.
- Generación de texto y resumen en pipelines internos con requisitos de licencia permisiva: Apache 2.0 elimina fricción para uso comercial y modificación, siempre que se respeten las obligaciones de atribución.
- Base para fine-tuning o destilación: al ser un modelo denso de 33B con licencia permisiva, puede servir como profesor o como punto de partida para ajustes específicos de dominio (no se dispone de datos sobre recetas de ajuste recomendadas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las únicas referencias encontradas son vídeos y blogs de terceros (por ejemplo, una tabla de benchmarks en OrcaRouter y comparaciones en YouTube con modelos Qwen) que no aportan cifras verificables ni metodología en el material proporcionado, por lo que no se reproducen aquí.

## Requisitos de hardware

- Tamaños de fichero por cuantización (datos del repositorio): bf16 66,24 GB (dividido en partes); Q8_0 35,20 GB; Q6_K_L 30,40 GB; Q6_K 29,02 GB; Q6_K_S 27,75 GB; Q5_K_M 25,07 GB; Q5_K_S 23,66 GB; Q4_K_L 22,34 GB; Q4_1 21,20 GB; IQ4_NL 20,87 GB; Q4_K_M 20,79 GB; Q4_K_S 19,74 GB; Q4_0 19,35 GB; IQ4_XS 18,64 GB; IQ3_M 17,80 GB.
- VRAM estimada: a los tamaños anteriores hay que sumar la caché KV, cuyo coste depende de la longitud de contexto y de la configuración de capas (no disponible). Como orientación, Q4_K_M ronda los 21 GB de pesos y Q5_K_M los 25 GB, de modo que el primero es el candidato para 24 GB de VRAM y el segundo exige 32 GB o más.
- GPU de 24 GB (RTX 3090, RTX 4090, A10G 24GB): Q4_K_M e inferiores caben con contexto moderado; las cuantizaciones IQ4_XS e IQ3_M dejan más margen para caché KV.
- GPU de 48 GB (A6000, L40S, RTX 6000 Ada): Q6_K y Q8_0 con contexto amplio.
- GPU de 80 GB (A100 80GB, H100 80GB): bf16 (66,24 GB) en una sola tarjeta, dejando espacio limitado para caché KV.
- Consumer GPU: sí, en el rango de 24 GB con cuantizaciones de 4 bits; por debajo de 24 GB (por ejemplo 16 GB) no cabe completo y requiere offload de capas a RAM, con la penalización de velocidad correspondiente.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama y LM Studio mediante importación del GGUF, llama-cpp-python para integración en Python, y vLLM (la documentación del repo incluye el comando `vllm serve` con el identificador del repositorio).
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del grado de offload, del ancho de banda de memoria y de la longitud de contexto.

## Comparativa con modelos similares

Los valores de los modelos alternativos provienen de sus especificaciones públicas y se incluyen solo como orientación; conviene verificarlos en sus fichas antes de tomar decisiones.

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Nanbeige4.3-33B (esta ficha) | 33,1B | no disponible | Apache 2.0 | en, zh | Modo `<think>` y tool calling XML; cuantizaciones GGUF con imatrix |
| Qwen3-32B | 32,8B | 32.768 nativo, extensible a 131.072 | Apache 2.0 | multilingüe amplio | Modo thinking/no-thinking conmutables; ecosistema de cuantizaciones muy maduro |
| Gemma 3 27B | 27B | 128.000 | Gemma Terms (no Apache 2.0) | multilingüe | Multimodal (visión); licencia con restricciones de uso |
| GLM-4-32B-0414 | 32B | 128.000 | MIT o similar según variante | en, zh | Orientado a agentes y tool calling |

Diferencias relevantes: frente a Qwen3-32B y GLM-4-32B, la ventaja de Nanbeige4.3-33B es la licencia Apache 2.0 combinada con paridad de tamaño, mientras que su desventaja principal, a falta de datos públicos, es la ausencia de contexto documentado y de benchmarks reproducibles. El rendimiento comparado no puede establecerse con la información disponible.

## Limitaciones y advertencias

- Idiomas: solo inglés y chino están declarados; el rendimiento en castellano no está garantizado y previsiblemente será inferior.
- Contexto: la longitud máxima no está documentada en la información disponible, lo que impide dimensionar caché KV y planificar cargas de contexto largo con garantías.
- Alucinación: sin datos de alineación ni de benchmarks de fidelidad, el riesgo de afirmaciones incorrectas debe tratarse como el de cualquier modelo de su clase; conviene validación externa en dominios críticos.
- Sesgos: no se ha publicado información sobre composición del corpus ni sobre evaluaciones de sesgo; al proceder de un desarrollador chino y priorizar el chino, es esperable un sesgo cultural y lingüístico hacia ese dominio.
- Formato de tool calling propietario en XML: requiere un parser específico; no es compatible directamente con el esquema JSON de OpenAI, a diferencia de otros modelos.
- Producción: la fase `<think>` consume tokens adicionales y aumenta la latencia; en flujos sensibles al coste conviene evaluar si compensa o si se necesita truncar el razonamiento.
- Licencia: Apache 2.0 permite uso comercial y modificaciones, pero el modelo se distribuye «tal cual», sin garantías; el titular de la licencia del modelo original es Nanbeige, no bartowski (autor únicamente de la cuantización).
- Integridad de la cuantización: los GGUF son ficheros derivados; aunque se han generado con imatrix, no son idénticos al checkpoint original y las cuantizaciones de 3 bits o inferiores degradan calidad de forma apreciable.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/bartowski/Nanbeige_Nanbeige4.3-33B-GGUF
- Árbol de ficheros: https://huggingface.co/bartowski/Nanbeige_Nanbeige4.3-33B-GGUF/tree/main
- Modelo base original: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- llama.cpp (release b11845 usada para cuantizar): https://github.com/ggml-org/llama.cpp/releases/tag/b11845
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del cuantizador: https://huggingface.co/bartowski
- Tabla de benchmarks de terceros (OrcaRouter): https://www.orcarouter.ai/blog/nanbeige-4-3-
- Vídeo comparativo (YouTube): https://www.youtube.com/watch?v=Ktp62NrTLY0
- Vídeo de análisis (YouTube): https://www.youtube.com/watch?v=TZjNuF8SLsQ
