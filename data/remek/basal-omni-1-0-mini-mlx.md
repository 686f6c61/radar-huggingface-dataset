# Remek/basal-omni-1.0-mini-MLX

## Resumen

basal-omni-1.0-mini-MLX es un port a MLX de 8 bits del modelo Remek/basal-omni-1.0-mini, desarrollado por Remek (rkinas) y orientado a la toma de decisiones tipadas (typed decisions) sobre Apple Silicon. No es un modelo conversacional generalista al uso: se trata de una capa de decisión construida sobre una base Gemma 4 E4B, que expone una API de decisiones con tipos (choice, noul, score, multi, act, tool) y hasta 255 opciones por consulta. El modelo base cuenta con 7.463.013.376 parámetros y esta versión MLX ocupa 8,6 GB en memoria unificada.

La relevancia de esta ficha radica en su enfoque: en lugar de generar texto libre, el modelo devuelve decisiones calibradas con umbrales certificados para tasas de error del 1 % y del 5 %, lo que permite automatizar una fracción de las decisiones y derivar el resto a revisión humana. El port pasa todas las barreras del "port gate" definido por el autor frente al modelo bf16 original: acuerdo del 0,9856 en decisiones de 2 a 10 opciones, 0,9992 cuando el margen del bf16 es al menos 0,2, y una diferencia de precisión de +0,31 puntos con ECE de -0,0000. Es un modelo experimental, con licencia Apache 2.0, disponible en polaco e inglés, y limitado a texto (los codificadores de imagen y audio no están incluidos en esta carpeta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Gemma 4 E4B), port MLX cuantizado |
| Parametros totales | 7.463.013.376 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine 8-bit, group size 64 (capas lineales del decoder y embedding por capa); embeddings de token y normas en bf16 |
| Idiomas soportados | pl, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), repo de 8,6 GB |
| Libreria | mlx (mlx-lm 0.32.2 para la conversion) |
| Modelo base | Remek/basal-omni-1.0-mini |
| Version del motor requerida | basal 2.2.0 o superior con extra `mlx` |
| Modalidad | solo texto en esta carpeta (sin imagen ni audio) |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 E4B, un transformer decoder-only. Esta carpeta concreta es una conversion realizada con el conversor de mlx-lm 0.32.2 (load, quantize, save) sobre el modelo bf16 original: cuantizacion MLX affine de 8 bits con group size 64 aplicada a las capas lineales de los bloques del decoder y a la tabla de embeddings por capa de Gemma 4 E4B. Los embeddings de token (que también actúan como cabeza de salida desde la que se lee la decisión, en fp32) y las normas permanecen en bf16. mlx-lm conserva únicamente el decoder de texto, dejando fuera los codificadores de imagen y audio. Los ajustes de atención rotatoria y atención global se escriben en `config.json` en las claves que mlx-lm lee.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada. La innovación técnica destacable no está en la arquitectura sino en el protocolo de lectura: el modelo emite decisiones tipadas con calibración específica del port (`CALIBRATION.mlx.json`), con temperaturas por tipo y por bucket y umbrales certificados para 1 % y 5 % de error, ajustados sobre las lecturas de este port. La tokenización se verificó idéntica a la del bf16 en 2.000 de 2.000 prompts de desarrollo.

## Capacidades

- Toma de decisiones tipadas: modos `choice`, `noul`, `score`, `multi`, `act` y `tool`, con hasta 255 opciones por consulta.
- Clasificación con calibración: umbrales certificados para automatizar decisiones a 1 % y 5 % de error objetivo.
- Generación de texto y conversación (pipeline text-generation), aunque el foco es la decisión.
- Soporte de tool calling mediante el tipo de decisión `tool`.
- Decisión multi-etiqueta (`multi`) y puntuación (`score`).
- Capacidades multilingües limitadas a polaco e inglés.
- Sin visión ni audio en esta carpeta (requiere el modelo bf16 para esas modalidades).
- No se documenta modo "thinking" ni razonamiento multi-paso explícito.

## Casos de uso

- Clasificación de tickets de soporte: usar el modo `choice` con las categorías del sistema de ticketing como opciones; la calibración permite autoasignar los casos con confianza alta y derivar el resto a un agente humano.
- Enrutamiento de consultas en un chatbot: decidir con `choice` a qué departamento o flujo corresponde una consulta entrante, aprovechando la latencia de 173 ms por pregunta en M4 Pro.
- Extracción de campos estructurados: emplear `score` o `multi` para etiquetar documentos con múltiples categorías y aplicar umbrales certificados antes de escribir en base de datos.
- Selección de herramientas en agentes: el tipo `tool` permite decidir qué función invocar en un pipeline de automatización, con validación previa sobre documentos propios.
- Moderación o triaje de contenido en polaco e inglés: clasificación binaria o multi-clase con decisión automática solo cuando el error esperado es inferior al umbral configurado.
- Despliegue local en portátiles Apple Silicon: servir el modelo con `basal-serve --mode mlx` en un Mac de 24 GB para prototipado y pruebas sin GPU dedicada.
- Evaluación de alternativas con `score`: puntuar opciones de un conjunto (por ejemplo, candidatos de respuesta) y ordenarlas según la lectura calibrada del modelo.

## Benchmarks y rendimiento

Datos medidos por el autor frente al modelo bf16 servido en modo eager (una RTX PRO 6000, CUDA), sobre cada segunda decisión del conjunto dev v2 (5.303 de 10.606), en un Apple M4 Pro de 24 GB con 8 peticiones en vuelo:

| Metrica | Valor | Umbral del port gate |
|---|---|---|
| Acuerdo (2-10 opciones) | 0,9856 | >= 0,9161 |
| Acuerdo con margen bf16 >= 0,2 | 0,9992 | >= 0,9858 |
| Diferencia de precision | +0,31 pt | dentro de 1 punto |
| ECE | -0,0000 | <= +0,01 |
| Decisiones/s (M4 Pro, 8 en vuelo) | 0,73 | no disponible |
| Acuerdo global (hasta 255 opciones) | 0,9847 | no disponible |

Automatización con `CALIBRATION.mlx.json` (conjunto de test de calibración, 4.280 decisiones, precision 0,882): a 1 % de error objetivo se decide automáticamente el 33,8 % de las decisiones (error observado 0,4 %); a 5 %, el 73,9 % (error observado 3,4 %). Latencia en M4 Pro con una petición a la vez (mediana): 173 ms para una pregunta y 474 ms para cinco preguntas sobre un mismo estado. Los resultados de benchmark del modelo base (Werdykt v1 0,769, conjuntos en polaco e inglés) están publicados en Remek/basal-omni-1.0-mini; esta carpeta no se puntúa por separado en ellos.

## Requisitos de hardware

- Memoria: los pesos ocupan 8,6 GB de memoria unificada; los estados largos requieren memoria adicional.
- Hardware probado: Apple M4 Pro con 24 GB, con mlx 0.32.4 y mlx-lm 0.32.2, 8 peticiones en vuelo.
- Cabe en Apple Silicon de gama consumer con al menos 24 GB de memoria unificada; no se documentan requisitos para GPU NVIDIA en esta carpeta (el bf16 de referencia se sirvió en una RTX PRO 6000).
- Despliegue: motor basal (>= 2.2.0) con extra `mlx`, mediante `basal-serve --model Remek/basal-omni-1.0-mini-MLX --mode mlx --port 8000`. Requiere Python 3.11 o superior nativo arm64.
- No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI para esta carpeta MLX.
- Rendimiento: 0,73 decisiones/s con 8 peticiones en vuelo en M4 Pro; latencia mediana de 173 ms por pregunta individual.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| basal-omni-1.0-mini-MLX (8-bit) | 7,46 B | no disponible | Decisiones tipadas calibradas, solo texto, Apple Silicon | Apache 2.0 | Hugging Face, motor basal |
| basal-omni-1.0-mini (bf16) | no disponible | no disponible | Decisiones tipadas calibradas, texto + imagen + audio | Apache 2.0 | Hugging Face, motor basal |
| Gemma 4 E4B (base) | no disponible | no disponible | Modelo generalista de texto | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de decisión o clasificación en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el autor recomienda validarlo sobre documentos propios antes de confiar en él.
- Solo texto en esta carpeta; las modalidades de imagen y audio requieren el modelo bf16.
- La cuantización altera algunas decisiones en los casos en que el modelo no está seguro; las decisiones con alta certeza apenas cambian.
- La aritmética exacta y los umbrales numéricos son un punto débil de las decisiones de una sola pasada: deben calcularse en código.
- Las decisiones con consecuencias serias para personas deberían revisarse por un humano.
- La calibración incluida está ajustada para un único orden de opciones (el predeterminado); cambiar el orden requiere recalibrar con `basal-calibrate`.
- Idiomas limitados a polaco e inglés.
- No se documentan sesgos conocidos ni tasas de alucinación específicas en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el estado experimental y la calibración específica del port exigen validación propia en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Remek/basal-omni-1.0-mini-MLX
- Modelo base: https://huggingface.co/Remek/basal-omni-1.0-mini
- Repositorio del motor de inferencia: https://github.com/rkinas/basal
- Sitio web del proyecto: https://basal.si5.pl/
