# Remek/basal-omni-1.0-ultra-GGUF

## Resumen

basal-omni-1.0-ultra-GGUF es la versión cuantizada en formato GGUF (Q8_0) de basal-omni-1.0-ultra, un modelo de 31B parámetros construido sobre Gemma 4 31B y orientado a la toma de decisiones tipadas ("typed decisions"): clasificación, elección entre opciones, puntuación y calibración de confianza. Lo desarrolla Remek y se distribuye bajo licencia Apache 2.0. No es un modelo de chat generalista, sino un motor de decisión que expone una API propia (choice, noul, score, multi, act, tool) a través del servidor `basal-serve`, que renderiza el prompt del modelo y lee las probabilidades de los códigos de opción.

La relevancia de esta ficha concreta es que permite ejecutar el modelo en llama.cpp y Ollama, sobre GPU NVIDIA (CUDA), Apple Silicon (Metal) o CPU, sin necesidad de infraestructura bf16. El archivo Q8_0 ocupa 32,6 GB y supera todas las barreras del "port gate" del proyecto frente al modelo bf16 original: 0,9943 de acuerdo en decisiones de 2 a 10 opciones, 0,9987 de acuerdo donde bf16 tiene margen >= 0,2, desviación de precisión de -0,07 puntos y ECE de +0,0006.

Una limitación importante: el GGUF es solo texto. El codificador de imágenes queda fuera del archivo, por lo que para entradas visuales hay que usar el modelo bf16. El contexto en proceso es de 16.384 tokens y admite hasta 255 opciones por pregunta en modo `gguf` (20 opciones y 4.096 tokens en modo Ollama).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Gemma 4 31B), adaptado a decisión tipada |
| Parametros totales | 30.697.345.596 (31B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens (contexto en proceso del servidor basal) |
| Tipos de cuantizacion | Q8_0 (publicado); Q6_K construido pero no publicado; Q5_K_M y Q4_K_M probados en mini/max sin superar el gate |
| Idiomas soportados | pl, en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 31B, un transformer denso de 31B parámetros. basal-omni-1.0-ultra no reentrena la arquitectura, sino que adapta el modelo a un protocolo de decisión tipada: el servidor construye un prompt específico y el modelo emite probabilidades sobre códigos de opción, que se interpretan como decisiones. El GGUF se generó con `convert_hf_to_gguf.py` de llama.cpp b11312 a partir del modelo bf16, conservando solo el decodificador de texto (el codificador de imágenes se excluye).

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La calibración es un componente técnico destacado: `CALIBRATION.gguf.json` se ajustó sobre las lecturas Q8_0 del propio port (modo `gguf`, un orden de opciones), con temperaturas por tipo y por bucket y umbrales certificados para 1% y 5% de error. La calibración del modelo bf16 (`CALIBRATION.json`) es la que se usa por defecto en modos Ollama y llama.cpp hasta que existan ajustes propios. Cualquiera de ellas puede reajustarse con `basal-calibrate` sobre datos etiquetados propios.

## Capacidades

- Decisión tipada entre 2 y 255 opciones (`choice`), con probabilidades y márgenes por opción.
- Preguntas de sí/no o de opción única con lectura de log-probabilidades (`noul`, `score`).
- Clasificación multi-etiqueta (`multi`) y modos de acción (`act`) y de herramienta (`tool`).
- Calibración de confianza con umbrales certificados para automatización a 1% y 5% de error objetivo.
- Puntuación de opciones y comparación de alternativas con margen explícito.
- Generación de texto libre limitada: en Ollama, `ollama run` produce solo texto libre; las respuestas tipadas requieren `basal-serve`.
- Multilingüe en polaco e inglés.
- Sin capacidades de visión en el GGUF (el codificador de imágenes no está incluido).
- Sin soporte de audio ni de modo "thinking" documentado.

## Casos de uso

- Clasificación de tickets de soporte: el modelo elige entre categorías predefinidas con probabilidad calibrada, lo que permite enrutar automáticamente solo los casos con confianza suficiente y derivar el resto a revisión humana.
- Moderación de contenido con umbrales certificados: usando la calibración a 1% o 5% de error, se automatiza un 56,6% o un 93,3% de las decisiones respectivamente, con error observado de 0,6% y 3,8%.
- Enrutamiento de consultas en pipelines RAG: decidir entre recuperar, responder directamente o escalar, con márgenes explícitos por opción.
- Evaluación automática de respuestas: puntuar opciones o candidatos (`score`) para ranking y selección en sistemas de generación aumentada.
- Decisión multicriterio en backoffice: elección entre hasta 255 opciones (por ejemplo, códigos de producto, motivos de reclamación o niveles de prioridad) con una sola pasada.
- Despliegue en local o en el borde: al caber en un único H100 con 49 GB de pico o en un Mac con 64 GB de memoria, permite ejecutar el motor de decisión sin depender de la nube.
- Automatización de flujos con tool calling: el modo `tool` permite que el modelo decida qué herramienta invocar dentro de un agente multi-paso.

## Benchmarks y rendimiento

Resultados medidos frente a bf16 en el conjunto de desarrollo dev v2 (10.606 decisiones), una H100 80 GB, modo `gguf` con llama.cpp b11312 vía llama-cpp-python 0.3.36:

| Archivo | Tamano | Acuerdo (2-10 opciones) | Acuerdo con margen >= 0,2 | Precision | ECE | p50 (1 peticion) | Decisiones/s (16 en vuelo) | Gate |
|---|---|---|---|---|---|---|---|---|
| Q8_0 (recomendado) | 32,6 GB | 0,9943 | 0,9987 | -0,07 pt | +0,0006 | 582 ms | 1,6 | PASS |
| Q6_K (no publicado) | 25,2 GB | 0,9886 | 0,9975 | +0,01 pt | -0,0012 | 737 ms | 1,3 | FAIL (barra 0,998) |

Sobre las 10.606 decisiones, donde bf16 tiene margen >= 0,2, Q8_0 coincide en 0,9983 (barra 0,998; Q6_K en 0,9973). La calibración del port, evaluada sobre 8.560 decisiones con precisión 0,936, permite automatizar el 56,6% de las decisiones a 1% de error objetivo (error observado 0,6%) y el 93,3% a 5% (3,8%). La calibración del propio modelo bf16 da 56,8% y 94,2%.

Los resultados de benchmark del modelo (Werdykt v1 0,879, conjuntos en polaco e inglés) están publicados en la ficha de basal-omni-1.0-ultra; este archivo GGUF no se puntúa por separado en ellos.

## Requisitos de hardware

- VRAM: los pesos Q8_0 ocupan 32,6 GB, más el contexto. En la prueba de velocidad sobre H100 el servidor alcanzó un pico de 49 GB de memoria GPU.
- GPU recomendadas: H100 80 GB (medido); A100 80 GB como alternativa por capacidad; en Apple Silicon se recomienda planificar 64 GB de memoria unificada (no medido).
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en tarjetas de 16 GB con Q8_0; no se han publicado cuantizaciones menores que pudieran caber.
- Despliegue: `basal-serve` con `--mode gguf` (llama-cpp-python 0.3.36 o superior, con soporte de Gemma 4), `--mode ollama` (Ollama 0.35 o superior) o `--mode llamacpp`. En NVIDIA hay que compilar llama-cpp-python con CUDA; en Mac se usa Metal.
- Latencia y throughput: p50 de 582 ms por petición en serie y 1,6 decisiones/s con 16 peticiones en vuelo sobre H100.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| basal-omni-1.0-ultra-GGUF (Q8_0) | 31B | 16.384 tokens | Decisión tipada calibrada | Apache 2.0 | GGUF en HF |
| basal-omni-1.0-ultra (bf16) | 31B | no disponible | Decisión tipada calibrada + visión | Apache 2.0 | Safetensors en HF |
| Gemma 4 31B (base) | 31B | no disponible | Generación de texto generalista | Términos de Gemma | Pesos en HF |

No se dispone de datos de benchmarks comparativos con otros modelos de decisión o clasificación en la información proporcionada.

## Limitaciones y advertencias

- El GGUF es solo texto: no procesa imágenes; para visión hay que usar el modelo bf16.
- En modo Ollama se limita a 20 opciones por pregunta y 4.096 tokens por prompt; para documentos largos y hasta 255 opciones hay que usar `--mode gguf`.
- La calibración publicada está ajustada para un único orden de opciones (el predeterminado); cambiar el orden invalida los umbrales certificados.
- Q6_K no se publica porque no alcanza la barra de 0,998 de acuerdo donde bf16 es seguro; no hay cuantizaciones menores disponibles.
- No se han publicado datos sobre sesgos, tasas de alucinación en texto libre ni comportamiento fuera de polaco e inglés.
- El modelo está marcado como experimental; su uso en producción requiere validar la calibración sobre datos propios con `basal-calibrate`.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma 4 puede estar sujeto a términos adicionales que conviene revisar antes de desplegar.
- El rendimiento en Apple Silicon no se ha medido; las cifras de latencia y throughput solo están validadas en H100.

## Enlaces

- HuggingFace (GGUF): https://huggingface.co/Remek/basal-omni-1.0-ultra-GGUF
- Modelo base bf16: https://huggingface.co/Remek/basal-omni-1.0-ultra
- Repositorio del motor de inferencia: https://github.com/rkinas/basal
- Sitio web del proyecto: https://basal.si5.pl/
- Documentación GGUF del motor: docs/GGUF.md del repositorio de basal
