# seppa/AREX-2-GSQ-RCO

## Resumen

AREX-2-GSQ-RCO es una suite de cuantizaciones multi-formato del modelo base BAAI/AREX-2, publicada por el usuario seppa en Hugging Face. El repositorio no contiene un modelo entrenado desde cero, sino un conjunto de pesos reempaquetados y refinados para distintos motores de inferencia (llama.cpp, MLX en Apple Silicon y variantes con decodificación especulativa). El objetivo es ofrecer versiones de bajo coste computacional del modelo original manteniendo la mayor fidelidad posible mediante asignación de bits por tensor (RCO), calibración con imatrix sobre datos de código y razonamiento de OpenThoughts, y refinamiento CUDA GSQ.

El modelo base BAAI/AREX-2 cuenta con 1.924.404.480 parámetros totales según los safetensors del repositorio. El repo ocupa 77,4 GB, lo que refleja la coexistencia de múltiples formatos y niveles de cuantización en un mismo espacio (GGUF Q3/Q4, MLX, drafters DFlash 2, cabezas MTP). Está licenciado bajo Apache 2.0 y se distribuye con la librería MLX como referencia principal, aunque incluye artefactos para llama.cpp.

La relevancia de esta ficha es práctica: permite a desarrolladores desplegar AREX-2 en hardware modesto (incluido Apple Silicon y GPUs de consumo) con decodificación especulativa integrada y sin necesidad de convertir pesos manualmente. Es un ejemplo de cadena de cuantización avanzada orientada a producción local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base BAAI/AREX-2; el repo solo documenta el pipeline de cuantización) |
| Parametros totales | 1.924.404.480 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 16.384 tokens en los ejemplos de llama-server del autor (valor configurado, no necesariamente máximo del modelo base) |
| Tipos de cuantizacion | GGUF Q3_K_M y Q4_K_M (mencionados), RCO con asignación de bits por tensor, GSQ (refinamiento CUDA), MLX, drafters DFlash 2 en Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, MLX |

## Arquitectura y entrenamiento

El repositorio no describe la arquitectura interna del modelo base BAAI/AREX-2; solo se documenta el proceso de cuantización y empaquetado. Lo que sí se detalla es la cadena técnica aplicada: asignación de bits por tensor mediante RCO, calibración con matrices de importancia (imatrix) sobre datasets de código y razonamiento de OpenThoughts, refinamiento con CUDA GSQ y publicación de builds específicos para Apple Silicon vía MLX. Además, se injertan cabezas MTP (multi-token prediction) para habilitar decodificación especulativa embebida en llama.cpp.

La innovación destacable no está en el entrenamiento sino en el despliegue: el repo incluye drafters DFlash 2 (por ejemplo, Qwen3.8-27B-DFlash2-Q4_K_M) y soporte para N-Gram Lookup, lo que permite acelerar la generación combinando decodificación especulativa con coincidencia de n-gramas. No se dispone de información sobre número de tokens de entrenamiento, composición del dataset original ni si el modelo base usó RLHF o DPO.

## Capacidades

- Generación de texto conversacional (tag `conversational` en el repo).
- Razonamiento y código: la calibración imatrix se hizo sobre OpenThoughts coding/reasoning, lo que sugiere énfasis en estas tareas, aunque no se documentan evaluaciones.
- Decodificación especulativa embebida mediante cabezas MTP.
- Decodificación especulativa externa con drafters DFlash 2 y N-Gram Lookup.
- Compatibilidad con endpoints (tag `endpoints_compatible`), pensada para servir vía API.
- Soporte de inferencia en Apple Silicon mediante MLX.
- Tool calling / function calling: no disponible en la información.
- Capacidades de agente multi-paso: no disponible en la información.
- Capacidades multilingües: no disponible en la información.
- Visión, audio o modo thinking: no disponible en la información.

## Casos de uso

- Despliegue local en Apple Silicon: usar los builds MLX del repo para ejecutar AREX-2 en Macs con memoria unificada, aprovechando la cuantización para reducir huella y mantener velocidad aceptable en portátiles y Mac Studio.
- Servidor de inferencia en GPU de consumo: arrancar `llama-server` con el GGUF Q3_K_M y `-ngl 99` para servir el modelo en una RTX 4090 o similar, con contexto de 16k y caché KV cuantizada en q8_0.
- Aceleración con decodificación especulativa MTP: activar `--spec-type draft-mtp --spec-draft-n-max 2` para reducir latencia en generación interactiva sin añadir un drafter externo.
- Aceleración con drafter DFlash 2: combinar el GGUF principal con `Qwen3.8-27B-DFlash2-Q4_K_M` y `--spec-type draft-dflash,ngram-map-k4v` en escenarios donde se prioriza throughput sobre simplicidad de despliegue.
- Asistentes de código en local: aprovechar la calibración imatrix sobre datos de código para autocompletado y revisión en entornos sin conexión, con licencia Apache 2.0 que facilita integración en herramientas internas.
- Prototipado de pipelines conversacionales: usar el tag `endpoints_compatible` para exponer el modelo tras una API compatible con OpenAI y validar flujos de chat multi-turno antes de escalar a infraestructura mayor.
- Evaluación comparativa de cuantizaciones: el repo agrupa varios formatos y niveles, lo que permite medir calidad y latencia de Q3_K_M frente a Q4_K_M y MLX sobre el mismo modelo base en una única descarga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa basada en el tamaño de parámetros (1,92B) y los formatos listados, un GGUF Q3_K_M rondaría los 1,2-1,5 GB y un Q4_K_M los 1,5-2 GB, pero el autor no publica cifras.
- GPU recomendadas: no especificadas por el autor. Los ejemplos usan `-ngl 99`, lo que implica descargar todas las capas en GPU; encaja en GPUs de consumo con suficiente VRAM para el GGUF elegido.
- Cabe en GPU de consumo: previsiblemente sí para los GGUF Q3/Q4, aunque no hay confirmación oficial ni lista de modelos probados.
- Apple Silicon: soportado vía builds MLX; el repo está etiquetado con la librería `mlx`.
- Opciones de despliegue: `llama-server` (llama.cpp) con MTP o DFlash 2 + N-Gram Lookup; MLX en macOS; endpoints compatibles según el tag del repo.
- Latencia y throughput: no disponibles. El autor no publica mediciones de tokens por segundo ni comparativas de velocidad entre variantes.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El repositorio es una suite de cuantizaciones, no un modelo original: la calidad final depende del modelo base BAAI/AREX-2 y de la agresividad de cada cuantización (Q3_K_M pierde más fidelidad que Q4_K_M).
- No se documentan sesgos conocidos, comportamiento multilingüe ni tasas de alucinación.
- No hay benchmarks publicados; no es posible afirmar qué degradación introduce cada variante frente al modelo base.
- El contexto de 16.384 tokens aparece como parámetro de ejemplo en `llama-server`, no como límite máximo verificado del modelo.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base BAAI/AREX-2 antes de producción.
- El uso de drafters DFlash 2 requiere descargar pesos adicionales (por ejemplo, Qwen3.8-27B-DFlash2) y aumenta la complejidad operativa.
- El tamaño del repo (77,4 GB) implica descargas largas y espacio en disco considerable si se quieren todas las variantes.
- No hay información sobre tool calling ni soporte de agentes, por lo que no debe asumirse en producción sin validación previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/seppa/AREX-2-GSQ-RCO
- Modelo base: https://huggingface.co/BAAI/AREX-2
