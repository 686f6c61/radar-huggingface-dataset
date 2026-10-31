# saidutta69/LFM2.5-VL-450M-heretic

## Resumen

LFM2.5-VL-450M-heretic es una variante "decensurada" (abliterada) del modelo multimodal LiquidAI/LFM2.5-VL-450M, publicada por el usuario saidutta69 en HuggingFace. Se trata de un modelo de visión-lenguaje (VLM) muy pequeño, con 448,7 millones de parámetros en total, diseñado para ejecutarse en dispositivos edge: teléfonos móviles, Raspberry Pi, portátiles o directamente en el navegador. La edición se ha realizado con la herramienta Heretic v1.4.0 mediante ablación direccional ("abliteration"), suprimiendo el comportamiento de rechazo del modelo sin reentrenamiento.

El modelo conserva la arquitectura híbrida convolución + atención del backbone de texto de Liquid, junto con la torre de visión SigLIP2 intacta, y mantiene el formato nativo de tool calling y la cobertura multilingüe en nueve idiomas. Según el autor, los rechazos caen de 93/100 a 5/100 con una divergencia KL de apenas 0,0187 respecto al modelo original, lo que indica una edición muy quirúrgica.

Su relevancia actual radica en la demanda creciente de VLMs diminutos capaces de responder sin restricciones de alineación en entornos locales: OCR en capturas pequeñas, descripción de imágenes, grounding con bounding boxes y agentes de visión en local, todo con pesos de apenas 0,23 GB en cuantización Q4_K_M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida convolución + atención (backbone de texto LFM2.5) + torre de visión SigLIP2 con proyector/merger |
| Parametros totales | 448.718.848 (0,45B: 0,35B texto + 0,09B visión + 0,01B proyector) |
| Parametros activos | No es MoE; todos los parámetros están activos |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF: 14 cuants + F16 (incluye Q4_K_M, Q6_K, Q8_0); safetensors en BF16 |
| Idiomas soportados | Inglés, árabe, chino, francés, alemán, japonés, coreano, español, portugués |
| Licencia | LFM1.0 (licencia "other", vinculada a la licencia de LiquidAI) |
| Formato de pesos | Safetensors (0,90 GB, BF16) y GGUF (repo de 5,0 GB con 14 cuants + F16 + proyector multimodal de 0,19 GB) |

## Arquitectura y entrenamiento

El modelo base es LiquidAI/LFM2.5-VL-450M, un VLM compacto cuyo backbone de texto combina bloques de convolución baratos con capas de atención (arquitectura híbrida propia de la familia LFM de Liquid AI). Esta composición hace que la inferencia sea muy sensible al ancho de banda de decodificación de memoria RAM antes que a la potencia de la GPU, lo que explica su buen comportamiento en CPUs y dispositivos móviles. La torre de visión es SigLIP2 (94.234.880 elementos de tensor entre torre y merger/proyector), y el procesado de imágenes incluye tiling, cuyo metadato se conserva en la conversión GGUF para que llama.cpp reproduzca el preprocesado original.

La variante "heretic" no altera el entrenamiento: se aplica Heretic v1.4.0, un proceso de abliteration direccional que identifica las direcciones de pesos responsables de los rechazos y las edita en los `o_proj` de atención y los `down_proj` del MLP del modelo de lenguaje. La ejecución consistió en 200 trials de Optuna con semilla 836943652, seleccionando `direction_index` por capa (valor 10,51; pesos máximos de 1,00 en atención y 0,98 en MLP). El repositorio incluye el directorio `reproduce/` con la receta completa para regenerar el modelo bit a bit.

## Capacidades

- Comprensión de imágenes y texto (image-text-to-text): preguntas sobre imágenes, descripción y análisis visual.
- OCR sobre capturas de pantalla pequeñas y documentos (OCRBench 684 en el modelo base).
- Grounding visual con bounding boxes (localización de objetos en la imagen).
- Tool calling: conserva el formato nativo de llamadas a herramientas del backbone LFM2.5 (BFCLv4 21,08 en el modelo base).
- Capacidades multilingües en nueve idiomas, incluido el español.
- Comportamiento sin rechazos ("uncensored/abliterated"): responde a consultas que el modelo base declinaría, útil para roleplay y casos límite.
- Ejecución totalmente local y on-device, con soporte multimodal completo en GGUF (texto e imagen vía archivo mmproj separado).
- Agentes locales de visión ligeros en móvil, Raspberry Pi o navegador.

## Casos de uso

- OCR en dispositivos edge: transcripción de texto en capturas pequeñas o documentos escaneados directamente en un móvil o una Raspberry Pi 5, sin conexión a la nube, gracias a sus 0,42 GB en disco con Q4_K_M.
- Preguntas y respuestas sobre imágenes en local: un usuario puede consultar detalles de una foto en una app offline; el modelo responde con la torre SigLIP2 sin necesidad de GPU.
- Generación de descripciones (captioning) a escala: procesado masivo de imágenes en CPUs de servidor con Q6_K, dado el bajo coste por inferencia.
- Grounding para automatización: detección y localización de elementos en pantalla (bounding boxes) para agentes que interactúan con interfaces gráficas.
- Agentes de visión en navegador: carga del GGUF en WebGPU/WASM para demos y herramientas cliente sin backend.
- Roleplay y asistentes sin filtros en local: la supresión de rechazos permite conversaciones sin las negativas del modelo base, manteniendo el soporte de tool calling.
- Prototipado de VLMs embebidos: su pequeño tamaño y receta reproducible lo hacen idóneo para experimentar con abliteration y despliegues multimodales mínimos.

## Benchmarks y rendimiento

Los siguientes números corresponden al modelo base LiquidAI/LFM2.5-VL-450M, reproducidos de su model card; no se ha ejecutado un barrido de benchmarks sobre este checkpoint abliterado (la abliteration solo elimina direcciones de rechazo y, según el autor, no altera las capacidades).

| Benchmark | Puntuación |
|---|---|
| MMStar | 43,00 |
| RealWorldQA | 58,43 |
| MMBench | 60,91 |
| MMVet | 41,10 |
| InfoVQA | 43,02 |
| OCRBench | 684 |
| GPQA | 25,66 |
| MMLU-Pro | 19,32 |
| IFEval | 61,16 |
| Multi-IF | 34,63 |
| BFCLv4 | 21,08 |

Métricas propias de la edición:

| Métrica | Este modelo | Modelo original |
|---|---|---|
| Divergencia KL | 0,0187 | 0 (por definición) |
| Rechazos | 5/100 | 93/100 |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: no se requiere GPU dedicada. Con Q4_K_M, el modelo completo con visión ocupa 0,42 GB de disco/RAM; con Q8_0, 0,57 GB; con Q6_K, 0,48 GB. El safetensors BF16 ocupa 0,90 GB.
- GPU recomendadas: no necesarias; el modelo está orientado a CPU y dispositivos edge. En caso de usar GPU, cualquier GPU moderna con 1-2 GB de VRAM es suficiente.
- Cabe sobradamente en GPUs de consumo (cualquier RTX, incluso de gama baja) y, más relevante, en dispositivos sin GPU: móviles con 4 GB de RAM, Raspberry Pi 5 y portátiles con 8 GB (Apple Silicon incluido).
- Opciones de despliegue: llama.cpp (conversión GGUF oficial con 14 cuants + F16 y proyector multimodal `LFM2.5-VL-450M-heretic-mmproj-F16.gguf`), Ollama y cualquier runtime compatible con GGUF multimodal; también transformers con safetensors. Para imagen hay que cargar siempre el GGUF principal más el mmproj.
- Latencia y throughput: no disponible en cifras concretas; el autor indica que el backbone, al ser mayoritariamente convolucional, es muy sensible al ancho de banda de decodificación, por lo que una RAM rápida influye más que una GPU rápida.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidad | Rechazos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-VL-450M-heretic | 0,45B | Texto + visión | 5/100 | LFM1.0 | Safetensors + GGUF completo (14 cuants + mmproj) |
| LiquidAI/LFM2.5-VL-450M (base) | 0,45B | Texto + visión | 93/100 | LFM1.0 | Safetensors + GGUF oficial de LiquidAI |
| SmolLM2-360M-Instruct-heretic | 0,36B | Solo texto | No disponible | No disponible | GGUF, mismo autor |

Alternativas de la misma categoría de tamaño con visión (por ejemplo, otros VLMs de ~0,5B como variantes de SmolVLM o Qwen2-VL-0.5B) podrían compararse en benchmarks, pero no se incluyen datos verificables en la información disponible, por lo que no se especifican cifras.

## Limitaciones y advertencias

- Al ser un modelo abliterado, elimina salvaguardas de seguridad: puede responder a contenido que el modelo original rechazaría. Su uso conlleva riesgos legales y éticos; no es adecuado para entornos de producción expuestos a usuarios finales sin filtros adicionales.
- La abliteration puede degradar sutilmente el comportamiento en casos límite; el KL de 0,0187 sugiere una edición muy contenida, pero no hay barrido de benchmarks propio del checkpoint, por lo que las capacidades reales tras la edición no están verificadas independientemente.
- El modelo base muestra puntuaciones modestas en razonamiento (GPQA 25,66, MMLU-Pro 19,32) y tool calling (BFCLv4 21,08): es un modelo de edge, no apto para tareas de razonamiento complejas.
- La longitud de contexto no está documentada en la model card; verificarla en la config del modelo base antes de diseñar aplicaciones con documentos largos.
- Licencia LFM1.0 ("other"): es una licencia personalizada de LiquidAI; revisar sus términos antes de cualquier uso comercial.
- La sensibilidad al ancho de banda de memoria puede limitar el throughput en dispositivos con RAM lenta.
- Modelo comunitario de un usuario particular (1.144 descargas, sin verificación de terceros): auditar los pesos antes de desplegar en producción.

## Enlaces

- Modelo: https://huggingface.co/saidutta69/LFM2.5-VL-450M-heretic
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-450M
- Licencia LFM1.0: https://huggingface.co/LiquidAI/LFM2.5-VL-450M/blob/main/LICENSE
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Artículo sobre abliteration: https://huggingface.co/blog/mlabonne/abliteration
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Variante hermana solo texto: https://huggingface.co/saidutta69/SmolLM2-360M-Instruct-heretic
