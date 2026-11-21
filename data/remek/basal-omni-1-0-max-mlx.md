# Remek/basal-omni-1.0-max-MLX

## Resumen

basal-omni-1.0-max-MLX es un port a MLX en cuantización de 8 bits del modelo basal-omni-1.0-max, un modelo de 12B de parámetros construido sobre Gemma 4 12B y especializado en toma de decisiones tipadas (typed decisions) más que en generación de texto libre. Lo desarrolla Remek y está pensado para ejecutarse en Apple Silicon mediante el motor de inferencia basal, que expone una API de decisiones con tipos como `choice`, `noul`, `score`, `multi`, `act` y `tool`, con soporte de hasta 255 opciones por decisión.

El modelo no es una conversión genérica: incorpora una capa de calibración propia (`CALIBRATION.mlx.json`) ajustada sobre las lecturas de este mismo port, con temperaturas por tipo y por bucket, y umbrales certificados para objetivos de error del 1 % y del 5 %. Esto permite automatizar una fracción de las decisiones con garantías estadísticas de error observado, lo que lo hace relevante para pipelines donde se necesita decidir cuándo el modelo puede actuar solo y cuándo debe escalar a revisión humana.

La arquitectura subyacente es la de Gemma 4 12B (transformer denso, sin mezcla de expertos), y este port conserva únicamente el decodificador de texto: los codificadores de imagen y audio del modelo bf16 original no están incluidos. La licencia es Apache 2.0 y los idiomas declarados son polaco e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4 12B, `gemma4_unified`), decodificador de texto únicamente |
| Parametros totales | 11.907.350.272 (≈11,9 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine 8-bit, group size 64 (capas lineales de los bloques del decodificador); embeddings de tokens y normas en bf16; cabeza de salida en fp32 |
| Idiomas soportados | pl (polaco), en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), 13,6 GB de repo |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 12B, un transformer denso con atención global y rotary embeddings cuyos parámetros de configuración se reescriben en `config.json` con las claves que lee mlx-lm. Este port se genera con el conversor de mlx-lm 0.32.2 (carga, cuantiza, guarda) aplicado sobre el modelo bf16: cuantización MLX affine de 8 bits con group size 64 en las capas lineales de los bloques del decodificador, mientras que los embeddings de tokens (que también son la cabeza de salida desde la que se lee la decisión, en fp32) y las normas permanecen en bf16. El conversor descarta los codificadores de imagen y audio.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La innovación destacable no está en la arquitectura sino en la capa de decisiones: el modelo se lee mediante un protocolo de readout definido en `basal.json` (formato de prompt 2) y se acompaña de una calibración específica del port, con temperaturas por tipo y por bucket y umbrales certificados para 1 % y 5 % de error, ajustados con `basal-calibrate` sobre las lecturas de `--mode mlx`. La tokenización y el renderizado de prompts son idénticos a los del release bf16 (2.000 de 2.000 prompts de desarrollo coinciden).

## Capacidades

- Toma de decisiones tipadas: `choice` (elegir entre 2 a 255 opciones), `noul` (decisión sin opciones explícitas), `score` (puntuación), `multi` (selección múltiple), `act` (acción) y `tool` (llamada a herramienta).
- Clasificación con calibración certificada: umbrales por tipo y bucket que permiten decidir automáticamente con error objetivo del 1 % o del 5 %.
- Generación de texto conversacional (pipeline `text-generation`) sobre el decodificador de Gemma 4.
- Soporte de tool calling mediante el tipo de decisión `tool`.
- Capacidades multilingües limitadas a polaco e inglés.
- No incluye visión ni audio en este port: solo texto.

## Casos de uso

- Enrutado automático de tickets de soporte: usar `choice` con las categorías del sistema de ticketing para asignar cada ticket a un equipo, con la calibración al 5 % de error para decidir automáticamente el 85,2 % de los casos y escalar el resto a revisión humana.
- Clasificación de documentos en pipelines de ingestión: `multi` permite asignar varias etiquetas por documento; la calibración por bucket permite fijar umbrales distintos según la longitud o el tipo de documento.
- Extracción de decisiones estructuradas en flujos de aprobación: `act` para decidir si una solicitud se aprueba, se rechaza o requiere información adicional, con umbral certificado al 1 % de error para el 35,6 % de decisiones automatizables.
- Selección de herramientas en agentes: el tipo `tool` permite que el modelo elija qué función invocar entre un conjunto acotado, integrándose en un orquestador que ejecute la llamada.
- Puntuación y ranking de candidatos: `score` para ordenar respuestas, propuestas o resultados de búsqueda con una señal calibrada en lugar de texto libre.
- Asistente conversacional en polaco o inglés sobre Apple Silicon: el decodificador de Gemma 4 12B permite mantener conversaciones multi-turno en local, con el modelo servido mediante `basal-serve --mode mlx`.
- Validación en local para investigadores: el port reproduce las decisiones del bf16 con una concordancia de 0,9894, lo que permite desarrollar y depurar pipelines de decisión en un Mac antes de desplegar el modelo bf16 en GPU.

## Benchmarks y rendimiento

Datos medidos del port frente al modelo bf16 servido en `--mode eager` (una RTX PRO 6000, CUDA), sobre cada octava decisión del conjunto de desarrollo dev v2 (1.325 de 10.606), en un Apple M4 Pro de 24 GB con 8 peticiones en vuelo:

| Metrica | Valor | Umbral (gate) |
|---|---|---|
| Concordancia (2-10 opciones) | 0,9894 | ≥ 0,9552 |
| Concordancia con margen bf16 ≥ 0,2 | 1,0000 | ≥ 0,9893 |
| Diferencia de accuracy | −0,10 pt | dentro de 1 pt |
| ECE | +0,0015 | ≤ +0,01 |
| Decisiones/s (M4 Pro, 8 en vuelo) | 0,25 | no disponible |
| Resultado del gate | PASS | — |

Sobre las 1.261 decisiones medidas con hasta 255 opciones, la concordancia es de 0,9841. 64 de las 1.325 peticiones fallaron por falta de memoria de GPU (Metal OOM) en el tramo de prompts largos con 8 en vuelo y quedaron excluidas. La automatización con `CALIBRATION.mlx.json` (test de calibración: cada segunda decisión, 4.280 decisiones, accuracy 0,909) alcanza el 35,6 % de decisiones automáticas con error observado del 0,5 % al objetivo del 1 %, y el 85,2 % con error del 3,6 % al objetivo del 5 %. Latencia en M4 Pro con una petición a la vez (mediana): 453 ms para una pregunta y 1.504 ms para cinco preguntas sobre un mismo estado.

Los resultados de benchmark del modelo base (Werdykt v1 0,823, conjuntos en polaco e inglés) están publicados en la ficha de basal-omni-1.0-max; este port no se puntúa por separado en ellos.

## Requisitos de hardware

- Memoria: los pesos ocupan 13,6 GB de memoria unificada; los estados largos necesitan más. En un M4 Pro de 24 GB, 64 de 1.325 peticiones agotaron la memoria de GPU con 8 en vuelo y prompts largos.
- GPU recomendadas: Apple Silicon con memoria unificada suficiente; el M4 Pro de 24 GB es el mínimo validado. Para documentos largos con muchas peticiones en vuelo se recomienda un Mac con más memoria.
- GPU consumer: no aplica a GPU NVIDIA/AMD; el port es exclusivo de MLX y Apple Silicon. El modelo bf16 original se sirve en CUDA (validado en una RTX PRO 6000).
- Despliegue: motor basal 2.2.0 o superior con el extra `mlx`, Python 3.11 o superior nativo arm64 (no Rosetta), `basal-serve --model Remek/basal-omni-1.0-max-MLX --mode mlx --port 8000`. Requiere mlx 0.32.4 y mlx-lm 0.32.2.
- Latencia y throughput: 453 ms por pregunta y 1.504 ms para cinco preguntas sobre un estado (M4 Pro, una petición a la vez, mediana); 0,25 decisiones/s con 8 peticiones en vuelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| basal-omni-1.0-max-MLX (este) | ≈11,9 B | no disponible | MLX 8-bit, safetensors | Apache 2.0 | Decisiones tipadas, solo texto, Apple Silicon |
| basal-omni-1.0-max (bf16) | ≈11,9 B | no disponible | bf16 | Apache 2.0 | Decisiones tipadas, texto + imagen + audio, CUDA |
| Gemma 4 12B | 12 B | no disponible | safetensors, GGUF según distribución | licencia de Gemma (no verificada en la información disponible) | Modelo generalista base |

La comparación con alternativas de la misma categoría (modelos de decisión calibrados) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el autor recomienda validarlo sobre documentos propios antes de confiar en él en producción.
- Solo texto: los codificadores de imagen y audio no están en este repositorio; para modalidades no textuales hay que usar el modelo bf16.
- La cuantización cambia algunas decisiones en los casos en los que el modelo bf16 no está seguro; la concordancia es de 0,9894, no de 1,0.
- La calibración incluida está ajustada para un único orden de opciones (el orden por defecto); cambiar el orden invalida los umbrales.
- Riesgo de agotar la memoria de GPU en Macs de 24 GB con muchas peticiones en vuelo y prompts largos.
- Idiomas limitados a polaco e inglés; no se declara soporte de castellano.
- No se dispone de información sobre sesgos conocidos ni sobre tasas de alucinación en generación libre.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma 4 puede arrastrar condiciones adicionales que no se detallan en la información disponible; conviene verificarlas antes de un despliegue comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Remek/basal-omni-1.0-max-MLX
- Modelo base bf16: https://huggingface.co/Remek/basal-omni-1.0-max
- Repositorio del motor de inferencia: https://github.com/rkinas/basal
- Sitio web del proyecto: https://basal.si5.pl/
