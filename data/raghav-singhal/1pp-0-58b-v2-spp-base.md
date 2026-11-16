# Raghav-Singhal/1pp-0.58b-v2-spp-base

## Resumen

1pp-0.58b-v2-spp-base es un modelo de lenguaje de tipo decoder Llama con 580.447.872 parámetros, desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) de EPFL DLAB. Se trata de un artefacto de investigación, no de un asistente de propósito general: es la condición base SPP{T0} de la escalera de escalado 1PP, con semilla 28, y sirve como referencia para comparar variantes de preentrenamiento sobre el corpus raw del proyecto.

El modelo reproduce dos baselines del paper SPP sobre el corpus 1PP raw (documentos originales de DCLM-edu). Para ello se insertaron reflexiones en primera persona, generadas por un modelo de reflexión SPP{T0}, en 7.738.994 documentos (todos los marcados por un clasificador de seguridad basado en gte más un número igual de documentos no marcados elegidos al azar). La reflexión se inserta tras el token marcador `<assistant>` (id 49153) y ocupa como máximo 256 tokens; el modelo se entrena sobre los tokens de la reflexión pero no sobre el marcador.

Su relevancia es metodológica: permite aislar el efecto de las reflexiones insertadas frente al modelo raw equivalente (`1pp-0.58b-v2-raw-base`), manteniendo idénticos documentos, orden, número de pasos y schedule. Con 11.106 pasos y 23,29B posiciones de token, es un modelo pequeño y de contexto corto (4.096 tokens) pensado para experimentación controlada, no para despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.152, FFN 4.608 SwiGLU, 9 cabezas de atención / 3 KV heads, head dim 128, RMSNorm, RoPE base 10.000) |
| Parámetros totales | 580.447.872 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

Decoder transformer de estilo Llama con 24 capas, dimensión oculta de 1.152, FFN de 4.608 con activación SwiGLU, 9 cabezas de atención y 3 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados, sin biases y sin QK-norm. La longitud de secuencia es de 4.096 tokens. El tokenizador parte del vocabulario de SmolLM2 (49.152 tokens) y añade `<|pad|>` (49152) y el marcador SPP `<assistant>` (49153); `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento cubre 11.106 pasos sobre el flujo alineado por pasos del modelo raw, lo que equivale a 23,29B posiciones de token, con batch global de 512 × 4.096 tokens y máscara de atención entre documentos. El optimizador es Muon (shape scaling, LR matricial 0,005) con Adam para el resto de parámetros (LR 3e-3 para embeddings y capa de salida, 3e-3 para normas), warmup de 699 pasos, fase constante y decaimiento lineal en los últimos 1.110 pasos hasta 1/100, weight decay 0,1, init std 0,0119 y precisión bf16. La innovación técnica del experimento es la inserción de reflexiones en primera persona en 7.738.994 documentos (4,6% marcados por un clasificador de seguridad gte por chunk con umbral ≥3, más un número igual de no marcados), junto con la máscara de atención de SPP que impide que el texto posterior a una reflexión atienda a esta. Como efecto secundario, 1.289 de 80,9M documentos quedaron fuera del final de una mitad de datos y no se entrenaron.

## Capacidades

- Generación de texto autoregresiva sobre documentos en inglés, con pérdida de validación de 2,615 por token en texto de documento.
- Generación de reflexiones en primera persona al añadir el token `<assistant>` tras el texto de un documento; no existe token que marque el final de una reflexión.
- Modelado de texto de asistente y de usuario en formato ChatML sin turno de sistema, con pérdidas de validación de 2,770 y 2,790 respectivamente.
- No dispone de tool calling ni function calling documentado.
- No dispone de soporte de agentes ni de razonamiento multi-paso documentado.
- Capacidad multilingüe limitada al inglés.
- No incluye modo thinking, visión ni audio.

## Casos de uso

- Investigación sobre preentrenamiento con reflexiones insertadas: el modelo sirve como condición de control SPP{T0} frente al modelo raw equivalente, permitiendo medir el efecto aislado de las reflexiones con idénticos datos, orden y schedule.
- Reproducción de baselines del paper SPP: al compartir flujo de pasos y configuración con `1pp-0.58b-v2-raw-base`, permite replicar las comparaciones del paper sobre el corpus 1PP raw.
- Estudio de máscaras de atención personalizadas: la máscara SPP que impide atender a reflexiones previas es un objeto de estudio directo, y este checkpoint permite analizar su impacto en la pérdida de validación.
- Análisis de clasificadores de seguridad como filtro de datos: los 3.869.498 documentos marcados por el clasificador gte (4,6%) y su tratamiento diferenciado permiten evaluar estrategias de curado de corpus.
- Experimentación con el optimizador Muon a escala pequeña: la configuración documentada (Muon con shape scaling más Adam para embeddings y normas) es replicable en este tamaño de 0,58B.
- Evaluación de la calidad de reflexiones generadas: el modelo puede generar reflexiones condicionadas por `<assistant>` para inspeccionar cualitativamente la distribución aprendida, siempre con la cautela de que la atención estándar de Hugging Face no reproduce la máscara de entrenamiento.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros). La información disponible incluye únicamente pérdidas de validación y una verificación de pesos.

Pérdidas de validación del checkpoint final (por token, 2.433 documentos reservados y las conversaciones reescritas a partir de ellos):

| Conjunto | Pérdida |
|---|---|
| Texto de documento | 2,615 |
| Texto de asistente | 2,770 |
| Texto de usuario | 2,790 |

Verificación de los pesos de Hugging Face frente al checkpoint de Megatron:

| Conjunto | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| Segmentos val50m [3] | 2,7685 | 2,7700 | 0,0015 |
| Segmentos raw_val50m [8] | 2,6174 | 2,6155 | 0,0020 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en bf16/fp16 para los pesos (tamaño del repo), más overhead de activaciones y caché KV; en cuantización de 8 bits rondaría 0,6 GB y en 4 bits unos 0,3 GB, aunque el autor no documenta cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM en bf16; una RTX 4090, A100 o H100 es sobredimensionada para este tamaño y solo se justifica por throughput agregado.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores, e incluso en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); llama.cpp, Ollama o vLLM requerirían conversión a GGUF o configuración adicional no documentada por el autor.
- Latencia y throughput estimados: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 1pp-0.58b-v2-spp-base | 580,4M | 4.096 | Apache 2.0 | Condición SPP{T0} con reflexiones insertadas |
| 1pp-0.58b-v2-raw-base | no disponible en la información | no disponible en la información | no disponible en la información | Modelo raw de referencia del mismo proyecto, sin reflexiones |
| SmolLM2 (familia, referencia por tokenizador) | no disponible en la información | no disponible en la información | no disponible en la información | El modelo reutiliza su vocabulario de 49.152 tokens |

No se dispone de datos de benchmarks comparativos con modelos de terceros en la información proporcionada.

## Limitaciones y advertencias

- Es un artefacto de investigación (EPFL DLAB), no un asistente de propósito general; el autor lo declara explícitamente.
- Es un modelo base entrenado sobre documentos: produce texto plano y no está alineado con instrucciones ni con preferencias humanas.
- La atención causal estándar de Hugging Face permite que el texto posterior a una reflexión la atienda, algo que nunca ocurrió durante el entrenamiento; esto puede degradar la coherencia en inferencia.
- No existe token que marque el final de una reflexión, lo que complica el control de la generación.
- El formato de chat es ChatML sin turno de sistema; no se ha validado su comportamiento conversacional más allá de las pérdidas de validación.
- Sesgos conocidos: no documentados por el autor; al entrenarse sobre DCLM-edu filtrado con un clasificador de seguridad, puede heredar sesgos del corpus y del propio clasificador.
- Riesgo de alucinación: inherente a un modelo base de 0,58B con 23,29B tokens vistos; no hay evaluaciones de factualidad.
- Limitación de idioma: solo inglés.
- Limitación de contexto: 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la naturaleza de investigación del modelo y la ausencia de alineación lo hacen inadecuado para producción sin evaluación adicional.
- El vocabulario amplía el de SmolLM2 con dos tokens; herramientas que asuman el vocabulario original pueden fallar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-spp-base
- Modelo raw de referencia: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-raw-base
- Colección 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Registros de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
