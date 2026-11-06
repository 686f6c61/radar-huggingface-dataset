# ngxson/tinyLFM3-Omni-for-testing-gguf

## Resumen

tinyLFM3-Omni-for-testing es un derivado deliberadamente degradado de LiquidAI/LFM3-Omni-2B, publicado por el usuario ngxson (colaborador habitual del ecosistema ggml/llama.cpp) con el único propósito de servir como banco de pruebas de software. No es un modelo utilizable: el propio autor advierte que sus salidas son incoherentes y que no debe emplearse para ninguna tarea real. Su valor es técnico: conserva la arquitectura multimodal completa de LFM3-Omni (texto, codificador de audio, depthformer y codec de audio), de modo que ejercita exactamente las mismas rutas de código que el modelo original dentro de llama.cpp, incluidos TTS, ASR y audio en tiempo real, pero con un tamaño reducido que lo hace viable en integración continua.

El modelo conserva 329.382.464 parámetros totales (frente a los aproximadamente 2.000 millones del original) tras recortar capas y estrechar las redes feed-forward de cada componente, y se distribuye en cuantizaciones Q2_K y Q4_K dentro de un repositorio de 0,2 GB. Incluye además una plantilla de chat `asr` tomada de LFM3-Audio que el modelo base no incorpora, lo que permite probar la ruta de transcripción en vivo (`/v1/realtime?intent=transcription`).

Su relevancia es por tanto de infraestructura, no de modelado: permite a desarrolladores de llama.cpp y de servidores compatibles con la API de endpoints validar regresiones en el pipeline de audio multimodal sin descargar ni ejecutar el modelo de 2B completo. La licencia es la LFM Open License v1.0, heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de LFM3-Omni (transformer multimodal con codificador de audio, depthformer y codec de audio); no se especifica el tipo exacto de bloque del transformer de texto |
| Parametros totales | 329.382.464 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K y Q4_K |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (license_name: lfm1.0, license: other) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo no se ha entrenado: es una copia modificada del GGUF en BF16 de ggml-org/LFM3-Omni-2B, generada con el script `slice.py`. Los recortes aplicados son concretos: en el modelo de texto se conservan 4 de 24 capas (las índices 0, 2, 3 y 4) y la FFN se estrecha de 7680 a 512; en el codificador de audio se conservan 3 de 17 capas (0, 2 y 3) con FFN de 256; el depthformer queda en 1 de 3 capas con FFN de 256; el codec de audio mantiene las 8 capas completas porque el cargador las exige, con FFN reducida a 256; y el codificador de visión se elimina por completo. Los pesos resultantes se cuantizan a Q2_K y Q4_K.

La innovación relevante no está en el modelo sino en su función: al mantener la topología de LFM3-Omni, cualquier test que pase por las rutas de TTS, ASR y audio en tiempo real de llama.cpp se ejecuta igual que con el modelo real, pero con una huella de 0,2 GB. La adición de la plantilla de chat `asr` de LFM3-Audio habilita la ruta de transcripción en vivo que el modelo original no expone. No se dispone de información sobre datos de entrenamiento, composición del dataset ni fases de RLHF o DPO, porque el modelo no ha pasado por ninguno de esos procesos.

## Capacidades

- Generación de texto: técnicamente ejecuta la ruta, pero las salidas son incoherentes por diseño; no es una capacidad utilizable.
- Audio: conserva el codificador de audio, el depthformer y el codec, por lo que ejercita las rutas de TTS y ASR de llama.cpp.
- Transcripción en vivo: la plantilla `asr` añadida permite probar el endpoint `/v1/realtime?intent=transcription`.
- Multimodalidad parcial: la visión está eliminada, así que no procesa imágenes.
- Compatibilidad de API: etiquetado como `endpoints_compatible` y `conversational`, pensado para servidores que emulan la API de OpenAI.
- Tool calling, agentes, razonamiento multi-step y capacidades multilingües: no disponibles ni verificables en este derivado.

## Casos de uso

- Integración continua de llama.cpp: ejecutar la suite de tests de audio multimodal en cada pull request con un modelo de 0,2 GB en lugar de descargar el LFM3-Omni-2B completo, reduciendo tiempo y ancho de banda en los runners.
- Validación de regresiones en TTS: comprobar que los cambios en el cargador del codec de audio no rompen la ruta de síntesis, ya que el codec conserva sus 8 capas y el cargador las exige.
- Pruebas del endpoint de transcripción en vivo: verificar el flujo `/v1/realtime?intent=transcription` con la plantilla `asr` añadida, sin necesidad de un modelo de producción.
- Test de cuantizaciones: comparar el comportamiento de carga y ejecución entre Q2_K y Q4_K en el pipeline multimodal con un artefacto pequeño.
- Desarrollo de servidores compatibles con la API de OpenAI: validar el enrutado de peticiones de audio y chat (`endpoints_compatible`) contra un modelo que responde rápido y no consume VRAM.
- Pruebas de humo en contenedores y entornos con recursos limitados: al caber en 0,2 GB, se puede empaquetar en imágenes Docker de CI sin capas de pesos pesadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que la salida es incoherente, por lo que cualquier métrica de calidad carecería de sentido.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en Q4_K y en torno a 0,3-0,5 GB en Q2_K, considerando los 329 millones de parámetros y el overhead de los componentes de audio.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; también funciona en CPU, que es el escenario habitual de CI.
- GPU de consumo: cabe holgadamente en cualquier RTX, GTX o iGPU moderna, e incluso en Raspberry Pi y dispositivos similares.
- Opciones de despliegue: llama.cpp y servidores basados en él (llama-server), dado que el formato es GGUF y las rutas de audio están implementadas en ese ecosistema. No se indica soporte para vLLM ni TGI.
- Latencia y throughput: no disponibles; al ser un modelo recortado, la latencia será muy inferior a la del LFM3-Omni-2B, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Audio | Licencia | Proposito |
|---|---|---|---|---|---|---|
| tinyLFM3-Omni-for-testing | 329 M | no disponible | No (eliminada) | Si (TTS, ASR, realtime) | LFM Open License v1.0 | Pruebas de software |
| LiquidAI/LFM3-Omni-2B | ~2 B | no disponible | Si | Si | LFM Open License v1.0 | Produccion multimodal |
| ggml-org/LFM3-Omni-2B-GGUF | ~2 B | no disponible | Si | Si | LFM Open License v1.0 | Produccion multimodal en llama.cpp |

La comparación relevante es con el modelo del que deriva: mismo código de ejecución, mismos componentes de audio, pero 6 veces menos parámetros, visión eliminada y calidad de salida nula. Frente a otras alternativas de prueba de CI en el ecosistema ggml, no se dispone de datos para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El autor advierte explícitamente de que es una copia modificada y dañada cuyo output es incoherente; no debe usarse para inferencia real.
- La visión está eliminada, por lo que no reproduce las rutas de imagen del LFM3-Omni original.
- El número de capas y el ancho de las FFN no coinciden con el modelo base, de modo que no valida comportamientos dependientes de la profundidad o del ancho reales.
- La licencia LFM Open License v1.0 impone restricciones de uso comercial; hay que revisar el archivo LICENSE antes de cualquier despliegue, incluso para pruebas en entornos corporativos.
- No se dispone de información sobre sesgos, idiomas o contexto, al no ser un modelo entrenado.
- Riesgo de confundirlo con un modelo funcional por su nombre y etiqueta `conversational`; conviene fijar la versión y documentar su carácter de artefacto de test.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ngxson/tinyLFM3-Omni-for-testing-gguf
- Modelo original: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- GGUF de referencia del original: https://huggingface.co/ggml-org/LFM3-Omni-2B-GGUF
- Script de recorte: `slice.py` (incluido en el repositorio)
- Licencia: `LICENSE` (LFM Open License v1.0, incluida en el repositorio)
