# Rin247/Krea-2-Turbo

## Resumen

Krea-2-Turbo es un modelo de generación de imágenes texto-a-imagen destilado a 8 pasos, derivado del checkpoint base Krea 2, un transformer de difusión (DiT) denso de 12.000 millones de parámetros. La versión publicada por el usuario Rin247 bajo el identificador `Rin247/Krea-2-Turbo` no es el modelo original, sino un paquete de cuantizaciones empaquetadas con la herramienta MECHA Forge, que agrupa denoiser, text encoder y VAE en un único repositorio para simplificar el despliegue. El modelo base pertenece a la organización Krea.

El modelo resuelve el problema de generar imágenes fotorrealistas de alta resolución (hasta 2048 px) con un número muy reducido de pasos de muestreo (8) y sin classifier-free guidance, lo que reduce drásticamente el coste computacional frente a modelos de difusión tradicionales que requieren entre 20 y 50 pasos con CFG. Emplea un text encoder Qwen3-VL y el VAE de Qwen-Image, lo que sitúa la codificación textual en el ecosistema de modelos Qwen.

La relevancia de esta publicación concreta reside en las cuantizaciones disponibles (FP4, FP8, INT4, INT8) que permiten ejecutar un modelo de 12B en hardware con VRAM limitada, a costa de posibles pérdidas de calidad. El repositorio ocupa 58,8 GB y acumula 76 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) denso, destilado a 8 pasos |
| Parametros totales | 12B (denoiser) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (modelo texto-a-imagen; la longitud de prompt no se especifica) |
| Tipos de cuantizacion | FP4, FP8, INT4, INT8 (weight-only) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

El modelo base es un Diffusion Transformer (DiT) denso de 12.000 millones de parámetros. La variante Turbo es un checkpoint destilado que permite muestreo en 8 pasos sin classifier-free guidance (CFG = 0), lo que implica que el modelo ha sido entrenado o destilado específicamente para aproximar la trayectoria de difusión con muy pocas evaluaciones de la red. La canalización de diffusers asociada es `Krea2Pipeline`.

El sistema completo combina tres componentes: el denoiser DiT, un text encoder basado en Qwen3-VL (modelo multimodal de la familia Qwen) y el VAE de Qwen-Image. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en modelos de difusión). La innovación técnica destacable es la destilación a pocos pasos, que reduce la latencia de inferencia de forma sustancial.

## Capacidades

- Generación de imágenes texto-a-imagen fotorrealistas a resoluciones de 1024 a 2048 px (píxeles totales).
- Muestreo rápido en 8 pasos sin CFG, adecuado para aplicaciones interactivas.
- Estilos variados: fotografía cándida, fotografía de moda editorial, paisajes, escenas de interior.
- Codificación textual mediante Qwen3-VL, lo que potencialmente aporta comprensión semántica rica de prompts largos y descriptivos.
- Empaquetado unificado de denoiser, text encoder y VAE para despliegue simplificado.
- Cuantizaciones múltiples (FP4/FP8/INT4/INT8) para adaptación a distintos presupuestos de VRAM.
- No se documentan capacidades de tool calling, agentes, visión de entrada ni audio.

## Casos de uso

- Generación de imágenes para marketing y publicidad: el modelo produce imágenes de hasta 2048 px con 8 pasos, lo que permite generar variantes de un concepto visual en segundos dentro de un flujo de aprobación creativa.
- Prototipado de conceptos visuales en estudios de diseño: la baja latencia (8 pasos, sin CFG) facilita iterar sobre prompts descriptivos largos, como los ejemplos de fotografía de moda incluidos en la model card.
- Generación de fondos y escenarios para videojuegos o previsualización: la resolución de 1024-2048 px y el estilo paisajístico fotorrealista permiten crear matte paintings o referencias de entorno.
- Creación de contenido editorial y revistas: los prompts de estilo "magazine cover" con tipografía serif y alto contraste sugieren uso en maquetación editorial automatizada.
- Despliegue en hardware de consumo mediante cuantización INT4 o FP4: las variantes cuantizadas weight-only permiten ejecutar el modelo en GPUs con VRAM limitada, útil para estudios pequeños o investigadores individuales.
- Investigación en destilación de modelos de difusión: el checkpoint Turbo sirve como referencia para estudiar el compromiso entre número de pasos, calidad y coste computacional.
- Generación de imágenes en pipelines de diffusers: la integración nativa con `Krea2Pipeline` permite incorporar el modelo en aplicaciones Python existentes sin conversión adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio completo ocupa 58,8 GB, pero cada cuantización individual es sustancialmente menor; el denoiser de 12B en FP8 ocupa aproximadamente 12 GB, en INT8 unos 12 GB, en INT4 unos 6 GB y en FP4 unos 6 GB. A ello hay que sumar el text encoder Qwen3-VL y el VAE.
- VRAM estimada: la variante INT4/FP4 con VAE en INT8/FP8 puede caber en GPUs de 16-24 GB; la variante FP8 requiere del orden de 24-32 GB; la variante sin cuantizar (no incluida en este repo) requeriría más de 24 GB solo para el denoiser.
- GPUs recomendadas: A100 40/80 GB o H100 para FP8 sin compromisos; RTX 4090 (24 GB) para FP8 o INT8 con gestión cuidadosa de memoria; RTX 4080/4070 Ti Super (16 GB) para INT4/FP4.
- Cabe en GPU de consumo: sí, en las variantes cuantizadas INT4/FP4 y con GPUs de 16 GB o más.
- Opciones de despliegue: diffusers (`Krea2Pipeline`), con posibilidad de integración en ComfyUI u otras interfaces basadas en diffusers. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son herramientas orientadas a LLM, no a difusión).
- Latencia y throughput: no disponibles; el muestreo en 8 pasos sin CFG reduce la latencia frente a configuraciones de 20-50 pasos con CFG, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Pasos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krea-2-Turbo (este repo, cuantizado) | 12B (denoiser) | 1024-2048 px | 8, sin CFG | No disponible | Hugging Face, diffusers |
| Krea 2 (base, sin destilar) | 12B (denoiser) | No disponible | No disponible (requiere mas pasos y CFG) | No disponible | Hugging Face (krea/Krea-2-Turbo como referencia) |
| Modelos de difusion de ~12B comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas comparables en la información proporcionada, por lo que la comparativa cuantitativa no es posible.

## Limitaciones y advertencias

- La licencia no está especificada en la información disponible; no puede asumirse uso comercial sin verificar la licencia del modelo base `krea/Krea-2-Turbo`.
- Las cuantizaciones weight-only (FP4, INT4) pueden degradar la calidad de imagen respecto al checkpoint original; no se documenta el grado de degradación.
- El modelo está destilado para 8 pasos sin CFG; usar valores de CFG distintos de 0 o un número de pasos diferente puede producir resultados subóptimos.
- No se documentan sesgos conocidos ni composición del dataset de entrenamiento, lo que impide evaluar riesgos de sesgo demográfico o estilístico.
- Riesgo de alucinación visual inherente a los modelos de difusión: anatomía incorrecta, texto ilegible en imágenes, inconsistencias en escenas complejas.
- El repositorio es una republicación por un tercero (Rin247), no el modelo oficial de Krea; la procedencia y fidelidad de las cuantizaciones no están verificadas por el autor original.
- No se especifican idiomas soportados; el text encoder Qwen3-VL es multilingüe, pero el rendimiento por idioma no está documentado.
- El tamaño del repositorio (58,8 GB) implica requisitos de almacenamiento considerables.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Rin247/Krea-2-Turbo
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- Librería diffusers: https://github.com/huggingface/diffusers
- VAE de Qwen-Image (referenciado en la model card): no disponible como enlace directo
- Text encoder Qwen3-VL (referenciado en la model card): no disponible como enlace directo
