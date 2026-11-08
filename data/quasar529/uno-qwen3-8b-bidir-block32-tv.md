# quasar529/uno-qwen3-8b-bidir-block32-tv

## Resumen

uno-qwen3-8b-bidir-block32-tv es un adaptador LoRA de investigación publicado por el usuario quasar529 sobre el modelo base s-sahoo/uno-qwen3-8B, una variante personalizada de Qwen3-8B orientada a decodificación por difusión (diffusion drafting) dentro del proyecto Uno. No se trata de un modelo de 8B autónomo ni de un ajuste de parámetros completos, sino de un adaptador de rango 128 (alpha 2048) entrenado con un objetivo de divergencia total variacional (TV-L1) y sin entropía cruzada (0 × CE) sobre el dataset OpenThoughts3-1.2M.

El checkpoint corresponde al paso final 32.813 dentro de un currículo de bloques de ruido creciente (2 → 4 → 6 → 8 → 12 → 16 → 32). La innovación técnica principal es que el estudiante atiende de forma bidireccional dentro de cada bloque ruidoso y predice el token en la misma posición, viendo únicamente el prefijo limpio anterior a ese bloque, mientras el profesor congelado permanece causal. Esto lo aleja del drafting causal convencional de Uno.

Es relevante ahora como material de investigación reproducible para quienes estudian decodificación especulativa y modelos de difusión de texto, pero el propio autor advierte que no es un paquete de reproducción validado en entorno limpio ni un benchmark listo para usar: no se ha validado la carga y generación en un servidor nuevo, ni la equivalencia de salidas entre GPUs o stacks de software distintos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer adaptado para difusión por bloques; LoRA sobre base Qwen3-8B personalizada (Uno), atención bidireccional intra-bloque en el estudiante y causal en el profesor |
| Parametros totales | No disponible para el adaptador; el modelo base es de ~8.2B parámetros (Qwen3-8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada para el adaptador; el base Qwen3-8B soporta 131.072 tokens según fuente externa |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adapter.safetensors con nombres de parámetros custom de UniformModel) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre el checkpoint congelado s-sahoo/uno-qwen3-8B en la revisión b8a7577b3223bdcf2b3af0f2fc6e95258b3bbc29. El estudiante atiende bidireccionalmente dentro de cada bloque ruidoso y predice el token en la misma posición, viendo solo el prefijo limpio previo a ese bloque; el profesor permanece causal. Cada bloque usa ruido completo con probabilidad 0,5; en caso contrario, su probabilidad de reemplazo es uniforme en [0,1]. No hay condicionamiento temporal explícito ni self-conditioning.

El objetivo de entrenamiento es 1 × TV-L1 + 0 × CE, donde TV-L1 es la suma sobre el vocabulario de diferencias absolutas de probabilidad (el doble de la variación total matemática). Cuando CE está activo, apunta al argmax del verificador causal limpio, no al token original de los datos ni a respuestas objetivo generadas. Los datos provienen de open-thoughts/OpenThoughts3-1.2M, con batch global 128 y longitud de secuencia 4096; el padding/packing implica que las posiciones de token programadas no equivalen a tokens únicos sin padding. El LoRA tiene rango 128 y alpha 2048 (alpha/r = 16), y el currículo de bloques sigue 2 → 4 → 6 → 8 → 12 → 16 → 32. El adaptador soporta 1, 2 y 4 pasos de denoising, aunque la mejora con pasos adicionales no está garantizada.

## Capacidades

- Generación de texto mediante decodificación por difusión con 1, 2 o 4 pasos de denoising sobre el modelo base Uno/Qwen3-8B.
- Predicción bidireccional intra-bloque con atención al prefijo limpio, orientada a investigación en decodificación especulativa.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad validada; el dataset de entrenamiento (OpenThoughts3) contiene trazas de razonamiento, pero no se certifica su rendimiento.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales: modo de difusión por bloques con ruido uniforme; no se documenta visión ni audio.

## Casos de uso

- Investigación en decodificación especulativa: el adaptador permite estudiar cómo un estudiante bidireccional por bloques se comporta frente a un profesor causal, comparando aceptación y precisión bajo muestreo especulativo exacto.
- Experimentos de destilación por difusión: sirve para reproducir y analizar el objetivo TV-L1 frente a CE en la predicción de distribuciones del verificador causal limpio.
- Análisis de currículos de ruido: el checkpoint final del currículo 2 → 32 permite evaluar el efecto del tamaño de bloque en la calidad de denoising con 1, 2 y 4 pasos.
- Evaluación de robustez entre stacks: útil para medir si las salidas se mantienen entre GPUs y versiones de software, dado que el autor no lo ha establecido.
- Docencia e investigación académica: material para cursos sobre modelos de difusión de texto y decodificación especulativa, con pesos verificados por SHA256.
- Pruebas de integración de adaptadores custom: permite validar pipelines de carga con UniformModel y load_adapter en lugar de PEFT estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que la release no reproduce las tablas previas de AIME/GSM8K y que no es un benchmark turnkey; tampoco se establecen TPS ni equivalencia de precisión en otros servidores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del base Qwen3-8B (~8.2B) y de la cuantización, no documentada.
- GPU recomendadas: no disponible; el ejemplo de carga usa CUDA con bfloat16 y atención eager, sin especificar modelo de GPU.
- ¿Cabe en consumer GPU?: no establecido en la información proporcionada.
- Opciones de despliegue: carga mediante el loader custom `uniform_uno.model.UniformModel` y `uniform_uno.state.load_adapter`, con `code` y `code/upstream` en PYTHONPATH; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no establecidos; el autor señala que el TPS depende del hardware y backend y que la ruta de generación de referencia no debe usarse para reclamar reproducción de TPS de motores optimizados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| uno-qwen3-8b-bidir-block32-tv | Adaptador LoRA sobre base ~8.2B | No disponible (base: 131.072) | Difusión por bloques, TV-L1, bidireccional intra-bloque | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen3-8B | ~8.2B densos | 131.072 | Transformer causal estándar | Apache 2.0 | Amplia, ecosistema maduro |
| s-sahoo/uno-qwen3-8B | ~8.2B (base custom) | No disponible | Base Uno para drafting por difusión | No disponible | Hugging Face |

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el base s-sahoo/uno-qwen3-8B en la revisión exacta; sustituirlo por un Qwen3 genérico invalida el uso.
- No debe cargarse como adaptador PEFT estándar ni usarse la ruta de drafting causal original de Uno; requiere el código custom `code/uniform_uno`.
- Estado de reproducibilidad: pesos verificados por SHA256, pero no validados en instalación limpia, ni equivalencia de salida/precisión entre GPUs o stacks, ni TPS en otros servidores.
- No soporta reanudación exacta del entrenamiento: se omiten estados de optimizador y RNG.
- No reproduce las tablas previas de AIME/GSM8K; no es un benchmark turnkey.
- Riesgo de alucinación y sesgos: no documentados específicamente; el base Qwen3 y OpenThoughts3 pueden introducir sesgos propios.
- Idioma limitado al inglés según la model card.
- Las diferencias de precisión experimentales existentes no se reclaman como mejora de calidad bajo muestreo especulativo exacto.
- Uso comercial permitido por Apache 2.0, pero el código de terceros y el base/datos conservan sus propios términos; se preservan LICENSE y NOTICE upstream.

## Enlaces

- Hugging Face: https://huggingface.co/quasar529/uno-qwen3-8b-bidir-block32-tv
- Modelo base: https://huggingface.co/s-sahoo/uno-qwen3-8B
- Proyecto Uno: https://github.com/ifm-ai/uno
- Dataset OpenThoughts3-1.2M: https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M
- Qwen3-8B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_8b
- Qwen3 8B en AI Model Radar: https://aimodelradar.app/models/qwen3-8b
