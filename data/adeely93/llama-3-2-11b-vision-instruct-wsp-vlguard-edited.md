# Adeely93/Llama-3.2-11B-Vision-Instruct-WSP-VLGuard-edited

## Resumen
Este modelo es una edición directa de pesos de `meta-llama/Llama-3.2-11B-Vision-Instruct`, el modelo multimodal de Meta que combina un transformer de lenguaje con un codificador visual para tareas de imagen-a-texto. La edición, publicada por el usuario Adeely93, no emplea fine-tuning ni gradientes: aplica 30 actualizaciones de rango 1 sobre matrices de atención y MLP de determinadas capas del modelo de lenguaje, calculadas a partir de estadísticas de activación para reforzar la dirección de rechazo ante peticiones dañinas. El objetivo es reducir la tasa de éxito de ataques jailbreak multimodales (imágenes dañinas, instrucciones ocultas en imágenes, envoltorios de texto adversariales) manteniendo el comportamiento benigno.

La relevancia de esta ficha radica en que documenta una técnica de edición de pesos sin entrenamiento (gradient-free weight editing) aplicada a un modelo de 10.670 millones de parámetros, con resultados medidos sobre el conjunto de test VLGuard. El modelo conserva la arquitectura Mllama original, el tokenizador, los nombres y formas de tensores y el formato bf16, por lo que se carga exactamente igual que el checkpoint base. No obstante, el número de descargas y likes es cero en el momento de la consulta, y la evaluación se limita a decodificación greedy en una única ejecución, lo que condiciona su madurez para producción.

El modelo está pensado para desarrolladores e investigadores que necesiten un Llama 3.2 Vision con mayor resistencia a jailbreaks multimodales sin reentrenar. La licencia es la Llama 3.2 Community License, con las restricciones de uso aceptable del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mllama (transformer multimodal: modelo de lenguaje Llama 3.2 + codificador visual con cross-attention) |
| Parametros totales | 10.670.220.835 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en bf16) |
| Idiomas soportados | en |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento
La arquitectura es la del modelo base Mllama de Meta: un transformer de lenguaje Llama 3.2 de 11B parámetros acoplado a un codificador visual mediante capas de cross-attention, con pipeline `image-text-to-text`. Esta edición no reentrena el modelo; parte de la revisión `9eb2daaa8597bf192a8b0e73f848f3a102794df5` del checkpoint original y aplica 30 actualizaciones de rango 1 de la forma `W ← W + r rᵀ W` sobre las matrices de salida de atención (`self_attn.o_proj` y `cross_attn.o_proj`) y de salida del MLP (`mlp.down_proj`) de las capas 6–11 y 16–24 del modelo de lenguaje. El vector `r` es la dirección unitaria de diferencia de medias entre prompts dañinos y benignos (posición final del prompt) en la frontera residual a la que escribe cada matriz.

El diseño de la edición lo realizó un agente de edición basado en LLM (Claude Fable 5.1) a partir de estadísticas de activación, usando como máximo 500 pasadas forward, sin gradientes ni optimizador. Cada actualización duplica la componente de la salida de la matriz a lo largo de la dirección de daño/rechazo. El resto de tensores son idénticos bit a bit al checkpoint original; los nombres, formas, dtypes (bf16) y el layout de shards no cambian. El archivo `EDIT_REPORT.json` detalla cada tensor editado con su magnitud de cambio (1,7–8,9 % de cambio relativo de Frobenius por matriz, 3,5 % global). El conjunto VLGuard (Zong et al., ICML 2024) se usó para desarrollo y evaluación.

## Capacidades
- Generación de texto e imagen-a-texto conversacional, heredadas del modelo base Llama 3.2 11B Vision Instruct.
- Comprensión de imágenes y respuestas a preguntas visuales, con razonamiento multimodal.
- Mayor resistencia a jailbreaks multimodales: imágenes dañinas, instrucciones dañinas ocultas en imágenes y envoltorios de texto adversariales.
- Rechazo reforzado ante peticiones dañinas, con tasa de sobre-rechazo en entradas seguras medida en 0,000 (juez por palabras clave).
- Compatibilidad con el chat template del modelo base: imagen primero, texto después, sin system prompt necesario.
- Soporte de `transformers`, `text-generation-inference` y endpoints compatibles.
- Capacidades de tool calling, agentes, matemáticas o código: no documentadas específicamente en la información proporcionada (se heredan, en su caso, del modelo base).

## Casos de uso
- Moderación y filtrado de contenido multimodal: el modelo puede evaluar pares imagen-texto y rechazar peticiones dañinas con una tasa de éxito de ataque reducida del 39,6 % al 19,6 % (juez por palabras clave) en el conjunto VLGuard, lo que lo hace útil como primera capa de defensa en pipelines de contenido generado por usuarios.
- Investigación en seguridad de modelos multimodales: sirve como referencia reproducible de edición de pesos sin gradientes, con `EDIT_REPORT.json` que documenta cada tensor modificado y su magnitud, para estudiar la relación entre dirección de rechazo y comportamiento benigno.
- Asistentes de accesibilidad con salvaguardas: descripción de imágenes para usuarios con discapacidad visual, con mayor tendencia a rechazar imágenes que contienen texto renderizado potencialmente dañino, aunque con descripciones algo más cortas en algunas preguntas benignas.
- Despliegue en entornos con requisitos de seguridad estrictos: al mantener el formato bf16 y el layout de shards, se puede sustituir el checkpoint base en un servicio existente de `text-generation-inference` sin cambiar el código de carga.
- Evaluación comparativa de robustez: útil para medir la eficacia de técnicas de edición de pesos frente a fine-tuning de seguridad, usando VLGuard como conjunto de referencia con 1.558 registros.
- Prototipado de agentes visuales con rechazo ante instrucciones ocultas en imágenes: adecuado para escenarios donde el atacante puede incrustar texto malicioso en una imagen enviada al agente.
- Base para experimentos de alineación: permite partir de un modelo ya editado y aplicar técnicas adicionales (DPO, RLHF) para comparar curvas de sobre-rechazo y utilidad.

## Benchmarks y rendimiento
Resultados sobre el conjunto de test VLGuard (1.558 registros, decodificación greedy, 256 tokens nuevos, una única ejecución), según la model card:

| Metrica | Original | Editado |
|---|---|---|
| Tasa de exito de ataque (juez por palabras clave), imagen insegura + instruccion | 0,600 | 0,333 |
| Tasa de exito de ataque (juez por palabras clave), imagen segura + instruccion insegura | 0,235 | 0,088 |
| Tasa de exito de ataque (juez por palabras clave), todas las entradas daninas | 0,396 | 0,196 |
| Tasa de exito de ataque (juez LLM), todas las entradas daninas | 0,471 | 0,283 |
| Sobre-rechazo en entradas seguras (juez por palabras clave) | 0,000 | 0,000 |
| Utilidad juzgada en entradas seguras | 0,842 | 0,799 |
| NLL de respuestas seguras de referencia (nats/token) | 1,931 | 1,953 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en bf16: aproximadamente 21,3 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 24 GB para contexto corto y 40–48 GB para contextos largos o lotes mayores.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB; en consumer, RTX 4090 24 GB puede cargar los pesos en bf16 con margen ajustado, y RTX 3090 24 GB de forma similar.
- Cuantización: no se documentan tipos de cuantización en la información proporcionada; al conservar el formato safetensors bf16, sería necesario generar versiones GGUF/AWQ/GPTQ por separado.
- Opciones de despliegue: `transformers` con `MllamaForConditionalGeneration` y `AutoProcessor` (ejemplo oficial de la model card), `text-generation-inference` y endpoints compatibles.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque de seguridad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Llama-3.2-11B-Vision-Instruct-WSP-VLGuard-edited) | 10.670.220.835 | no disponible | Edicion de pesos sin gradientes (30 actualizaciones de rango 1) | llama3.2 | Hugging Face, 0 descargas |
| meta-llama/Llama-3.2-11B-Vision-Instruct | 10.670.220.835 | no disponible | Alineacion original de Meta | llama3.2 | Hugging Face, ampliamente usado |
| Modelos de seguridad multimodal comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks cruzados con alternativas en la información proporcionada; la comparación se limita al modelo base y a la ausencia de alternativas documentadas.

## Limitaciones y advertencias
- Descripciones algo más cortas y menos detalladas en algunas preguntas benignas sobre imágenes (caída de utilidad juzgada de 0,842 a 0,799).
- Mayor tendencia al rechazo en imágenes benignas que solo contienen texto renderizado.
- Las peticiones descriptivas sobre imágenes explícitas o violentas siguen recibiendo respuesta con frecuencia.
- Evaluación realizada únicamente con decodificación greedy y una sola ejecución; no se han probado configuraciones de muestreo, temperaturas ni contextos largos.
- El modelo solo declara soporte de inglés (`en`); el comportamiento en otros idiomas no está documentado.
- Riesgo de alucinación inherente al modelo base, no cuantificado en la información disponible.
- Sesgos conocidos del modelo base Llama 3.2 no reevaluados tras la edición.
- La licencia Llama 3.2 Community License y la Acceptable Use Policy del modelo base aplican a esta redistribución de pesos modificados; es necesario revisar sus restricciones antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-10), por lo que no hay evidencia de uso en producción ni validación independiente.
- La edición se diseñó con un agente LLM (Claude Fable 5.1) a partir de estadísticas de activación; la reproducibilidad exacta del proceso no está documentada más allá de `EDIT_REPORT.json`.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Adeely93/Llama-3.2-11B-Vision-Instruct-WSP-VLGuard-edited
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-11B-Vision-Instruct
- Dataset VLGuard (Zong et al., ICML 2024): no disponible enlace directo en la informacion proporcionada
- Paper VLGuard: no disponible enlace directo en la informacion proporcionada
- Repositorio o demo adicional: no disponible en la informacion proporcionada
