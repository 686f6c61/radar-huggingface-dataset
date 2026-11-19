# Jundot/gemma-4-26B-A4B-it-oQ8e-mtp

## Resumen

`Jundot/gemma-4-26B-A4B-it-oQ8e-mtp` es una cuantización de precisión mixta en formato MLX del modelo multimodal `google/gemma-4-26B-A4B-it`, el modelo de mezcla de expertos (MoE) de la familia Gemma 4 de Google DeepMind. Lo publica el usuario Jundot mediante su herramienta oQ (oMLX v0.8.0) y está pensado para inferencia eficiente en hardware Apple Silicon a través del framework MLX.

El checkpoint empaqueta tres componentes: el backbone de lenguaje (25,233B parámetros lógicos), el codificador de visión (0,573B) y una cabeza de predicción multi-token (MTP, 0,420B) fusionada desde `google/gemma-4-26B-A4B-it-assistant`. En total son 26.226B parámetros (25,2B en el modelo base, con 3,8B activos por token según la model card), con soporte de entrada texto e imagen, modos de razonamiento configurables y una ventana de contexto de 256K tokens.

La relevancia de esta ficha radica en que permite ejecutar un modelo MoE multimodal de 26B en entornos locales con un peso efectivo de 8,786 bits por peso (26,825 GiB de almacenamiento), un compromiso poco habitual entre tamaño, calidad y portabilidad. La cuantización no es uniforme: asigna bits según la sensibilidad medida de cada capa, lo que reduce el error frente a una cuantización uniforme de 8 bits.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE transformer con codificador de visión y cabeza MTP (según model card del checkpoints; detalle interno no disponible) |
| Parámetros totales | 26.225.647.442 (26,226B) |
| Parámetros activos | 3,8B (según model card del modelo base) |
| Longitud de contexto | 256K tokens (según model card) |
| Tipos de cuantización | oQ8e de precisión mixta: afín 8 bits grupo 64 (96,184% de los pesos) y BF16 (3,816%); media efectiva 8,786 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (sujeta a la Gemma 4 license) |
| Formato de pesos | safetensors en formato MLX (`mlx`, `oq`, `quantized`) |
| Pipeline | image-text-to-text |
| Tamaño del repositorio | 28,8 GB |
| Descargas | 928 |
| Fecha de creación | 2026-10-11 |
| Última actualización | 2026-11-19 |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos de la familia Gemma 4, con 25,2B parámetros totales y 3,8B activos por token, lo que reduce el coste computacional por inferencia frente a un denso del mismo tamaño. Incorpora un codificador de visión para entrada image-text-to-text y una cabeza de predicción multi-token (MTP) que permite decodificación especulativa interna, acelerando la generación al predecir varios tokens por paso. La model card no detalla la composición del dataset de entrenamiento, el número de tokens ni si se aplicaron etapas de RLHF o DPO; esos datos no están disponibles.

La contribución técnica de esta ficha es la cuantización: oQ8e mide la sensibilidad de cada capa y asigna bits de forma no uniforme, redondeando cada grupo con una matriz de importancia (1024 muestras x 512 tokens) y un refit de escala y sesgo por mínimos cuadrados ponderados. El resultado es un 96,184% de pesos en afín 8 bits grupo 64 (8,50 bits/peso efectivos) y un 3,816% conservado en BF16 (16 bits/peso), con una media de 8,786 bits/peso para el checkpoint completo. La revisión del 19 de noviembre de 2026 aplica un redondeo oQe refinado en oMLX 0.8.0 que reduce el error de cuantización sin cambiar tamaño ni velocidad, por lo que las copias anteriores deberían descargarse de nuevo.

## Capacidades

- Generación de texto y razonamiento con modos de pensamiento configurables (thinking modes), según la model card.
- Comprensión de imágenes y texto combinados (pipeline image-text-to-text) gracias al codificador de visión de 0,573B incluido.
- Decodificación multi-token mediante la cabeza MTP fusionada desde el modelo assistant, orientada a acelerar la generación.
- Ventana de contexto de 256K tokens, adecuada para documentos largos y conversaciones multi-turno extensas.
- Capacidades multilingües: no disponible (la model card no especifica idiomas).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita; los thinking modes del base sugieren capacidad de razonamiento, pero sin confirmación documentada.
- Ejecución en Apple Silicon mediante MLX.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el formato MLX y el peso de 26,825 GiB permiten cargar el modelo en equipos con memoria unificada de 32 GB o superior, sin GPU dedicada, usando `mlx-lm` o el stack oMLX.
- Análisis de documentos largos con contexto de 256K tokens: contratos, informes técnicos o expedientes completos caben en una sola ventana, evitando pipelines de troceado y recuperación.
- Procesamiento de documentos escaneados con imágenes: la entrada image-text-to-text permite extraer información de capturas, formularios o figuras junto al texto que las acompaña.
- Asistentes conversacionales multi-turno en local: la combinación de contexto largo y modos de razonamiento configurables facilita mantener historiales extensos sin perder coherencia.
- Generación acelerada con decodificación especulativa: la cabeza MTP reduce el coste por token generado, útil en tareas de redacción o resumen de alta frecuencia.
- Prototipado y evaluación de modelos MoE multimodales: al ser una cuantización fiel del base con licencia Apache-2.0, sirve para pruebas de calidad antes de decidir un despliegue mayor.
- Desarrollo de aplicaciones offline o con requisitos de privacidad: al ejecutarse en local, los datos no salen del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo documenta métricas de cuantización (bits por peso y desglose de almacenamiento), no evaluaciones de calidad como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 26,825 GiB de pesos en disco; para inferencia conviene reservar margen para la caché KV de 256K tokens, por lo que 32 GB de memoria unificada es el mínimo práctico y 48-64 GB es recomendable.
- GPU recomendadas: no aplica directamente, ya que el formato es MLX; el hardware objetivo son chips Apple Silicon (M1 Pro/Max, M2 Pro/Max/Ultra, M3 Pro/Max/Ultra, M4 Pro/Max). En GPUs NVIDIA no es cargable sin conversión a otro formato.
- Cabe en GPU de consumo: en el ecosistema Apple, sí en configuraciones de 32 GB o más; en NVIDIA, no disponible en este formato.
- Opciones de despliegue: MLX (librería `mlx`), oMLX para la gestión de cuantizaciones oQ; para otros entornos haría falta reconvertir los pesos a GGUF o safetensors estándar, lo que no está documentado en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|---|
| Jundot/gemma-4-26B-A4B-it-oQ8e-mtp | 26,226B | 3,8B | 256K | Texto + imagen | Apache-2.0 | MLX safetensors |
| google/gemma-4-26B-A4B-it | 25,2B | 3,8B | 256K | Texto + imagen | Apache-2.0 (Gemma 4 license) | safetensors |
| Otros MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa con alternativas de terceros no está disponible en la información proporcionada; el contraste principal es frente al modelo base sin cuantizar, del que este checkpoint se diferencia por el formato MLX, el peso reducido a 8,786 bits/peso y la inclusión de la cabeza MTP del modelo assistant.

## Limitaciones y advertencias

- Formato exclusivo MLX: no es utilizable directamente en vLLM, TGI, llama.cpp ni Ollama sin conversión previa, no documentada en la información disponible.
- La cuantización introduce error respecto al modelo BF16 original; aunque oQ8e lo minimiza con asignación por sensibilidad, no es una reproducción exacta.
- La model card no documenta sesgos conocidos, tasas de alucinación ni comportamiento por idioma; conviene evaluar antes de usar en producción.
- Idiomas soportados no disponibles: no se puede asumir cobertura multilingüe sin verificación empírica.
- Soporte de tool calling y agentes no documentado en esta ficha.
- Restricciones de licencia: Apache-2.0 según el modelo base, pero sujeta a la Gemma 4 license (https://ai.google.dev/gemma/docs/gemma_4_license); revisar sus términos para uso comercial antes de desplegar.
- Popularidad baja (0 likes, 928 descargas) y mantenida por un autor individual: menor soporte comunitario que el modelo oficial de Google.
- El checkpoint se re-cuantizó el 19 de noviembre de 2026; versiones anteriores tienen mayor error de redondeo y deberían reemplazarse.
- Con 26,825 GiB de pesos, no cabe en Macs de 16 GB; la gestión de la caché KV para 256K tokens requiere memoria adicional significativa.

## Enlaces

- Hugging Face: https://huggingface.co/Jundot/gemma-4-26B-A4B-it-oQ8e-mtp
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Modelo assistant (origen de la cabeza MTP): https://huggingface.co/google/gemma-4-26B-A4B-it-assistant
- Herramienta oQ / oMLX: https://github.com/jundot/omlx
- Pull request oQe: https://github.com/jundot/omlx/pull/4930
- Pull request refinamiento de redondeo oQe: https://github.com/jundot/omlx/pull/5292
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
