# BigGoober77/Taylor_Swift_Krea_2_LoKR

## Resumen

Taylor_Swift_Krea_2_LoKR es un adaptador LoKr (Low-Rank Kronecker Product) para generación de imágenes a partir de texto, desarrollado por el usuario BigGoober77 y publicado en Hugging Face. El adaptador se aplica sobre el checkpoint base `krea2_turbo_fp8_scaled.safetensors` (Krea 2 en versión turbo cuantizada a fp8) y está entrenado para generar imágenes fotorrealistas de Taylor Swift en los distintos vestuarios y etapas de su gira *The Eras Tour*.

El entrenamiento se realizó con la herramienta ai-toolkit sobre 40 imágenes curadas de fotografía de conciertos y eventos en alta resolución, durante 1.500 pasos (equivalentes a 37,5 épocas). El objetivo declarado del autor es preservar la simetría facial natural, la microtextura realista de la piel y la fidelidad del vestuario a lo largo de las diez "eras" de la gira, evitando artefactos típicos de difusión como piel de aspecto plástico o deriva anatómica.

Es un modelo de nicho y muy reciente (publicado en octubre de 2026), con prácticamente sin historial de descargas, por lo que no existen evaluaciones de terceros. Su relevancia es principalmente para la comunidad de ComfyUI interesada en LoRA/LoKr sobre modelos de difusión destilados de pocos pasos. El modelo está bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoKr (adaptador Low-Rank Kronecker Product) sobre modelo de difusión text-to-image (Krea 2, familia Flux) |
| Parametros totales | no disponible (tamaño del adaptador: ~0,5 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp8 (en el checkpoint base `krea2_turbo_fp8_scaled.safetensors`) |
| Idiomas soportados | no disponible (prompts en lenguaje natural, instance prompt: "Taylor Swift") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador emplea la arquitectura LoKr, una variante de LoRA que factoriza las actualizaciones de pesos mediante productos de Kronecker, lo que permite capturar ajustes de alta capacidad con un número reducido de parámetros entrenables (el archivo resultante ocupa unos 0,5 GB). Se aplica tanto a la rama Model (UNet/difusión) como a la rama CLIP del modelo base, con una fuerza recomendada de 1.0 en ambas.

El entrenamiento se llevó a cabo con ai-toolkit sobre el checkpoint `krea2_turbo_fp8_scaled.safetensors`, una versión turbo destilada de Krea 2 cuantizada a fp8. El dataset consiste en 40 imágenes curadas de fotografía de conciertos y eventos en alta resolución, con 1.500 pasos de entrenamiento distribuidos en 37,5 épocas. El modelo base destilado permite convergencia en 8 pasos de muestreo con CFG 1.0, lo que hace que el adaptador esté calibrado para generación rápida sin guidance escalado.

## Capacidades

- Generación de imágenes text-to-image de Taylor Swift con trigger en lenguaje natural ("Taylor Swift"), sin tokens sintéticos.
- Reproducción de los vestuarios y estéticas de las 10 eras de *The Eras Tour*.
- Preservación de simetría facial y microtextura de piel, evitando el aspecto ceroso o retocado típico de otros checkpoints.
- Generación en alta resolución nativa: 2496x3328 (formato vertical 3:4 para cuerpo completo) y 2880x2880 (cuadrado para retratos de primer plano).
- Convergencia destilada en 8 pasos con sampler euler y scheduler simple.
- Integración directa en ComfyUI mediante el loader estándar de LoRA/LoKr (cadenas Model y CLIP).

## Casos de uso

- Generación de arte de fans de alta fidelidad: creadores de contenido pueden producir retratos y escenas de la gira *The Eras Tour* con fidelidad de vestuario, usando los prompts de era deseados junto al trigger "Taylor Swift".
- Diseño de pósteres verticales: la resolución nativa 3:4 de 2496x3328 permite generar composiciones de cuerpo completo tipo pasarela o escenario sin recortes ni escalados adicionales.
- Retratos cuadrados para redes sociales: el lienzo nativo 2880x2880 evita el estiramiento facial latente en formato vertical, ideal para avatares y publicaciones cuadradas.
- Prototipado rápido en ComfyUI: al ser un adaptador calibrado para 8 pasos con CFG 1.0, permite iterar decenas de variaciones por minuto en GPU de consumo.
- Estudio de consistencia de personaje: útil como referencia técnica para quienes entrenan sus propios LoKr sobre modelos destilados turbo, dado que la model card documenta hiperparámetros y configuración completa.
- Comparativa de técnicas de adaptación: permite evaluar LoKr frente a LoRA estándar sobre el mismo checkpoint base Krea 2 turbo fp8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible explícitamente; el checkpoint base es fp8 (krea2_turbo_fp8_scaled), lo que sugiere requisitos moderados, típicamente en el rango de GPUs de consumo con 12-24 GB de VRAM para modelos de difusión grandes cuantizados a fp8 (estimación, no dato oficial).
- GPU recomendadas: no disponible; por el formato fp8, GPUs con soporte de fp8 (RTX 4090, RTX 5090) son candidatas razonables, aunque el modelo debería funcionar en GPUs más antiguas con dequantización.
- Cabe en GPU de consumo: probablemente sí, dada la cuantización fp8 del checkpoint base y el tamaño reducido del adaptador (0,5 GB); no hay confirmación oficial.
- Despliegue: ComfyUI (flujo de trabajo documentado por el autor). Colocar el archivo `taylor_swift_krea_2_lokr.safetensors` en `ComfyUI/models/loras/`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a pipelines de difusión).
- Latencia y throughput: convergencia destilada en 8 pasos con euler/simple y CFG 1.0; tiempos concretos no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Tamano | Licencia | Notas |
|---|---|---|---|---|---|
| BigGoober77/Taylor_Swift_Krea_2_LoKR | LoKr (adaptador) | Krea 2 turbo fp8 | ~0,5 GB | Apache 2.0 | 8 pasos, CFG 1.0, ComfyUI |
| LoRAs sobre FLUX.1-dev | LoRA (adaptador) | FLUX.1-dev | típicamente 0,1-0,7 GB | depende del adaptador | Ecosistema maduro, muchos adaptadores de personaje |
| LoRAs sobre SDXL | LoRA (adaptador) | SDXL | típicamente 0,05-0,5 GB | variable | Requieren más pasos (~25-30) que la versión turbo destilada |

La principal diferencia frente a adaptadores sobre SDXL o FLUX.1-dev estándar es que este LoKr está calibrado para un checkpoint destilado turbo (8 pasos, CFG 1.0), lo que reduce drásticamente el tiempo de generación por imagen.

## Limitaciones y advertencias

- Especialización extrema: el adaptador solo genera a Taylor Swift (trigger "Taylor Swift"); no es útil para otros sujetos.
- Riesgo de alucinación/anatomía: aunque la model card afirma minimizar la deriva anatómica, no hay evaluaciones independientes que lo confirmen.
- Sin validación de terceros: 0 descargas registradas en el momento de la ficha; la calidad declarada procede únicamente del autor.
- Dependencia del checkpoint base: requiere `krea2_turbo_fp8_scaled.safetensors`, que debe descargarse por separado; no funcionará sobre otros checkpoints.
- Consideraciones legales y éticas: genera imágenes fotorrealistas de una persona real. Aunque la licencia del código/pesos es Apache 2.0 (uso comercial permitido), el uso de semejanzas de personas reales puede estar sujeto a derechos de imagen, derecho de publicidad y normativas sobre deepfakes; el usuario asume la responsabilidad legal de su uso. No está documentado si las imágenes de entrenamiento cuentan con consentimiento.
- Configuración estricta: la calibración está pensada para fuerza 1.0 en Model y CLIP, euler/simple, CFG 1.0 y denoise 1.0; desviarse de estos valores puede degradar los resultados.

## Enlaces

- Hugging Face: https://huggingface.co/BigGoober77/Taylor_Swift_Krea_2_LoKR
- Repositorio de la herramienta de entrenamiento ai-toolkit: no disponible en la informacion proporcionada (mencionado en la model card como herramienta empleada)
- Checkpoint base krea2_turbo_fp8_scaled: no disponible un enlace directo en la informacion proporcionada
- Paper, blog o demo: no disponible
