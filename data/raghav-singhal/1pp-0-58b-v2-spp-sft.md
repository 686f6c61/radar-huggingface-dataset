# Raghav-Singhal/1pp-0.58b-v2-spp-sft

## Resumen

1pp-0.58b-v2-spp-sft es un modelo de lenguaje de 580 millones de parámetros desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del laboratorio EPFL DLAB. Se trata de un artefacto de investigación, no de un asistente de propósito general: su objetivo es servir como línea base reproducible del método SPP (Self-Persona Pretraining) sobre el corpus crudo de 1PP, permitiendo comparar el efecto de inyectar reflexiones en primera persona durante el preentrenamiento frente al entrenamiento sin ellas.

El modelo parte de una arquitectura decoder estilo Llama de 24 capas con embeddings desacoplados, tokenizador de SmolLM2 (49.152 tokens más dos tokens especiales) y una longitud de secuencia de 4.096 tokens. Sobre esta base preentrenada se aplicó un ajuste supervisado (SFT) con 400.000 conversaciones, dando lugar a un modelo conversacional con formato ChatML sin turno de sistema.

Su relevancia es metodológica: forma parte de una escalera de escalado (ladder-v2) en la que cada variante comparte pasos, orden de documentos y esquema de optimización, de modo que las diferencias de pérdida entre condiciones son atribuibles al cambio experimental y no a ruido de entrenamiento. Para desarrolladores e investigadores es útil como pieza de ablación y como modelo pequeño de referencia, no como solución de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama |
| Parámetros totales | 580.447.872 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantizaciones GGUF no publicadas por el autor) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 1,2 GB) |

Detalles arquitectónicos adicionales: 24 capas, dimensión oculta 1.152, FFN 4.608 con SwiGLU, 9 cabezas de atención y 3 cabezas KV (dimensión de cabeza 128), RMSNorm, RoPE con base 10.000, embeddings desacoplados, sin sesgos y sin QK-norm. Tokenizador: vocabulario de SmolLM2 (49.152 tokens) más `<|pad|>` (id 49152) y el marcador SPP `<assistant>` (id 49153); `<|endoftext|>` actúa como token de fin de documento.

## Arquitectura y entrenamiento

El preentrenamiento consumió 11.106 pasos sobre el flujo alineado por pasos del modelo crudo, lo que equivale a 23.290 millones de posiciones de token, con batch global de 512 × 4.096 tokens y enmascaramiento de atención entre documentos. El optimizador es Muon (escalado por forma, LR matricial 0,005) combinado con Adam para el resto de parámetros (LR 3e-3 para embeddings y capa de salida, 3e-3 para normas), con 699 pasos de calentamiento, fase constante y decaimiento lineal en los últimos 1.110 pasos hasta 1/100, weight decay 0,1, desviación de inicialización 0,0119 y precisión bf16.

La innovación central de la condición SPP{T0} es la inyección de reflexiones en primera persona: 7.738.994 documentos (todos los marcados por un clasificador de seguridad basado en gte, 3.869.498 documentos, más un número igual de documentos aleatorios no marcados) reciben una reflexión de hasta 256 tokens generada por el modelo de reflexión SPP{T0}, insertada en la posición elegida por ese modelo y precedida del token `<assistant>`. El modelo entrena sobre los tokens de la reflexión pero no sobre el marcador, y la máscara de atención propia de SPP impide que el texto posterior a una reflexión atienda a esta, de modo que el documento se modela como si la reflexión no estuviera. El ajuste supervisado posterior emplea una época sobre 400.000 conversaciones (98.500 multiturno del conjunto model-raising-pb-100k-3c-mt-sft, 271.600 de sp-sft-normal-300k tras eliminar duplicados y una muestra de 30.000 de sp-sft-safety-180k), con la misma pila Megatron y Muon, ChatML sin turno de sistema y pérdida solo sobre turnos del asistente, LR matricial 0,002, semilla 28 y batch global de 128 × 4.096. Los datos de SFT nunca contienen el token `<assistant>`.

## Capacidades

- Generación de texto conversacional en inglés con formato ChatML sin turno de sistema.
- Generación de reflexiones en primera persona: al añadir `<assistant>` tras el texto de un documento, el modelo escribe una reflexión; no existe token que marque su final.
- Razonamiento multi-turno básico, heredado del corpus de SFT multiturno.
- Conversaciones con citas a constitución/constituciones en parte del corpus de SFT (track constitution-cited).
- Alineamiento de seguridad parcial, procedente de la muestra de 30.000 conversaciones del conjunto de seguridad.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de pensamiento explícito según la información disponible.
- Multilingüismo: únicamente inglés.

## Casos de uso

- Ablación metodológica en investigación: replicar la comparación entre el modelo crudo (`1pp-0.58b-v2-raw-base`) y esta condición SPP{T0} para aislar el efecto de las reflexiones inyectadas sobre la pérdida de validación, manteniendo pasos, orden de documentos y esquema de optimización idénticos.
- Estudio de currículos de preentrenamiento: analizar cómo cambia la pérdida por token en texto de documento, texto de asistente y texto de usuario (2,615 / 2,770 / 2,790 en el modelo base) al introducir la condición SPP.
- Generación de reflexiones sintéticas en primera persona: usar el marcador `<assistant>` para producir textos reflexivos de hasta 256 tokens sobre documentos dados, como material para experimentos de aumento de datos.
- Evaluación de recetas de SFT: servir de referencia con semilla fija (28) y receta documentada para comparar variantes de datos de instrucciones en modelos de menos de 1.000 millones de parámetros.
- Docencia y reproducción de experimentos: el tamaño de 580 millones de parámetros y el contexto de 4.096 tokens permiten ejecutar el modelo en hardware modesto para prácticas de preentrenamiento y ajuste fino.
- Verificación de pipelines de conversión: la model card documenta la comprobación de los pesos HF contra el checkpoint de Megatron (pérdida 2,1895 frente a 2,1894 de referencia), lo que lo convierte en un caso útil para validar herramientas de conversión y evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento publicados son pérdidas de validación internas:

| Conjunto | Métrica | Valor |
|---|---|---|
| Modelo base, texto de documento | pérdida por token | 2,615 |
| Modelo base, texto de asistente | pérdida por token | 2,770 |
| Modelo base, texto de usuario | pérdida por token | 2,790 |
| SFT, tokens de asistente (1.998 conversaciones retenidas) | pérdida | 2,189 |
| Verificación HF frente a Megatron (segmentos sft_val [3, 4]) | pérdida HF / referencia / diferencia absoluta | 2,1895 / 2,1894 / 0,0000 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,2 GB solo para pesos, más caché KV y activaciones; en la práctica, entre 3 y 4 GB con contexto completo de 4.096 tokens.
- En cuantización de 8 bits: alrededor de 0,6 GB de pesos; en 4 bits, alrededor de 0,3 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB (RTX 3060, RTX 4060, RTX 4090) es suficiente; en entornos de servidor, A100 o H100 no son necesarias para este tamaño.
- Cabe holgadamente en GPU consumer, incluidas tarjetas de gama media y sistemas integrados con suficiente memoria unificada.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repositorio). El autor no documenta recetas para vLLM, llama.cpp, Ollama ni TGI más allá de las etiquetas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 1pp-0.58b-v2-spp-sft | 580 M | 4.096 | Apache 2.0 | Hugging Face | Condición SPP{T0} con SFT; pérdida SFT 2,189 |
| 1pp-0.58b-v2-raw-base | 580 M (misma arquitectura) | 4.096 | no disponible en la información | Hugging Face | Línea base sin reflexiones; pérdida de documento 2,615 |
| SmolLM2 (familia, referencia de tokenizador) | no disponible en la información | no disponible en la información | no disponible en la información | Hugging Face | Solo se cita su vocabulario de 49.152 tokens; no se aportan datos de rendimiento comparables |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría; la comparación más rigurosa posible es interna, contra el modelo crudo de la misma escalera.

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor indica que no es un asistente de propósito general; no debe desplegarse como tal en producción.
- Solo inglés; no hay soporte multilingüe.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Riesgo de alucinación no evaluado: no se publican métricas de fidelidad, veracidad ni tasas de alucinación.
- Sesgos: el corpus deriva de DCLM-edu y de conjuntos de SFT con contenido constitucional y de seguridad; no se documenta ninguna evaluación de sesgos.
- Discrepancia de atención en inferencia: la atención causal estándar de Hugging Face permite que el texto posterior a una reflexión la atienda, algo que nunca ocurrió durante el entrenamiento; esto puede degradar la coherencia si se generan reflexiones en mitad de documentos.
- El marcador `<assistant>` no tiene token de cierre, lo que complica el parseo automático de reflexiones generadas.
- El formato de chat no admite turno de sistema, lo que limita el control fino del comportamiento mediante instrucciones de sistema.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo de investigación sin evaluaciones de seguridad publicadas, su uso comercial conlleva riesgo no cuantificado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-spp-sft
- Modelo crudo de referencia: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-raw-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Registros de entrenamiento (SFT): https://wandb.ai/raghav_singhal/1pp-sft
- Conjunto de SFT multiturno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Conjunto de SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Conjunto de SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
