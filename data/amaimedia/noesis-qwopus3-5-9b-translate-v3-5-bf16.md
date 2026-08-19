# AMAImedia/NOESIS-Qwopus3.5-9B-Translate-v3.5-BF16

## Resumen

NOESIS-Qwopus3.5-9B-Translate-v3.5-BF16 es un modelo de traducción automática de 8.953.803.264 parámetros (aproximadamente 9B), desarrollado por AMAImedia como parte de la plataforma profesional de doblaje multilingüe NOESIS, bajo el framework DHCF-FNO (Deterministic Hybrid Control Framework for Frozen Neural Operators). El modelo está diseñado específicamente para la tarea de traducción, con soporte de razonamiento (think mode) que debe suprimirse mediante un prefill cerrado para obtener traducciones deterministas. Se distribuye en formato BF16 como primario, con una variante cuantizada GGUF Q4_K_M de 5,24 GB que cabe en GPUs de 6 GB de VRAM.

El modelo está etiquetado como `qwen3_5_text`, lo que sugiere una arquitectura basada en la familia Qwen 3.5, aunque el autor no proporciona detalles arquitectónicos adicionales. Los benchmarks publicados en la model card cubren las direcciones inglés↔ruso e inglés↔chino (mandarín) sobre FLORES-200 devtest, con resultados competitivos frente a otros modelos de la misma familia NOESIS. Su relevancia radica en su integración en flujos de doblaje automatizado, donde la calidad de traducción y la velocidad de inferencia son críticas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen 3.5 (etiqueta `qwen3_5_text`), detalles no disponibles |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (primario), GGUF Q4_K_M |
| Idiomas soportados | ingles, ruso, chino (mandarin) segun benchmarks; lista oficial no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16), GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna más allá de la etiqueta `qwen3_5_text`, que apunta a un transformer de la familia Qwen 3.5 con capacidad de razonamiento explícito (think mode). El modelo se describe como un "think-model": para traducción determinista se requiere un prefill cerrado (`thinking\n\nresponse\n\n` después de `assistant\n`) que suprime el razonamiento y produce directamente la traducción; sin este prefill, el modelo emite un trace de razonamiento en lugar de la traducción.

No se publican datos sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. El modelo forma parte de la plataforma NOESIS v16.1, cuyo framework DHCF-FNO combina operadores neuronales con control determinista híbrido, orientado a la automatización profesional de doblaje. El hermano cuantizado Q4_K_M está diseñado para entornos con VRAM limitada (6 GB), mientras que el BF16 es el formato de referencia.

## Capacidades

- Traducción automática de alta calidad en las direcciones inglés↔ruso e inglés↔chino (mandarín), con métricas COMET superiores a 0,87 en FLORES-200 devtest.
- Modo de razonamiento (think mode) integrado, que puede suprimirse mediante prefill cerrado para obtener salidas deterministas.
- Compatible con el ecosistema de doblaje NOESIS, incluyendo integración con otros modelos de la plataforma (por ejemplo, NOESIS-Hy-MT2 para isocronía).
- Soporte de inferencia en GPU mediante `llama-server` y `llama-completion.exe` con descarga completa de capas (`-ngl 99`).
- Etiquetado como `endpoints_compatible` y `conversational`, lo que sugiere compatibilidad con APIs de inferencia estándar.
- Capacidad multilingüe limitada a los tres idiomas mencionados; no se documentan otros idiomas.

## Casos de uso

- Traducción de guiones para doblaje profesional: el modelo puede generar traducciones que posteriormente se ajustan a los tiempos de locución mediante la plataforma NOESIS, que incluye modelos especializados en isocronía como MT2.
- Subtitulado automático de contenido audiovisual: su velocidad de generación (49 tok/s en Q4_K_M sobre RTX 3060 Laptop) permite procesar largos volúmenes de diálogo en tiempo casi real.
- Localización de software y documentación técnica: las traducciones inglés→ruso y inglés→chino cubren mercados clave para productos de software.
- Traducción de noticias y contenido editorial: los benchmarks sobre FLORES-200 (noticias) muestran un rendimiento sólido en textos formales.
- Pipeline de traducción en dos pasos: usar el modelo de 9B para la pasada final de traducción cuando la VRAM lo permite, y el NOESIS-4B-LongCtx como todoterreno para contextos largos, según recomienda el autor.
- Evaluación comparativa de sistemas de traducción: los datos COMET y chrF++ publicados permiten usar el modelo como referencia en pruebas internas de calidad.

## Benchmarks y rendimiento

La model card incluye dos conjuntos de resultados sobre FLORES. El primero es una prueba rápida con n=20 (devtest) en Q4_K_M:

| Direccion | chrF++ | BLEU |
|---|---|---|
| eng→rus | 54,9 | 25,9 |
| eng→cmn | 32,8 | 7,2 |
| **Media** | **43,8** | **16,5** |

El segundo es una evaluación más amplia con n=100 × 4 direcciones (eng↔rus, eng↔cmn) en GPU, con COMET (wmt22-comet-da) como métrica principal:

| Modelo | Tamano | COMET medio | chrF++ | BLEU | gen tok/s |
|---|---|---|---|---|---|
| Qwopus3.5-9B-Translate Q4 | 5,24 GB | **0,8870** | 50,7 | 22,5 | 49 |
| NOESIS-Hy-MT2-7.5B Q5 | 5,0 GB | 0,8709 | 46,2 | 21,4 | 52 |
| NOESIS-Hy-MT2-1.8B Q8 | 1,78 GB | 0,8481 | 43,9 | 19,1 | 121 |

Por dirección, el 9B-Translate gana en las cuatro: eng-rus 0,902, eng-cmn 0,897, rus-eng 0,872, cmn-eng 0,877. El autor advierte que el BLEU para eng-cmn es bajo en todos los modelos porque el chino requiere tokenización por caracteres; recomienda usar chrF++ o COMET para esa dirección. También señala que el MT2, al ser un traductor de doblaje, produce salidas más cortas (len_ratio ~0,87-0,89) para ajustarse a los slots de voz, lo que penaliza su chrF en textos literales de FLORES.

## Requisitos de hardware

- BF16 (formato primario): requiere aproximadamente 18 GB de VRAM para los 8,95B parámetros en precisión completa; adecuado para GPUs como A100 40GB, RTX 4090 24GB o RTX A6000.
- GGUF Q4_K_M (5,24 GB): cabe en GPUs de 6 GB de VRAM, como la RTX 3060 Laptop, con descarga completa de las 33 capas (`-ngl 99`).
- Rendimiento medido en RTX 3060 Laptop 6GB con Q4_K_M: 49,1 tok/s de generación y 307 tok/s de prompt eval.
- Opciones de despliegue: llama.cpp / llama-server (probado), llama-completion.exe, y cualquier runtime compatible con GGUF (Ollama, LM Studio, etc.).
- Para uso en producción con BF16, se recomienda un servidor de inferencia como vLLM o TGI, aunque no se documenta compatibilidad explícita.

## Comparativa con modelos similares

La comparativa se basa en los datos publicados por el autor dentro de la familia NOESIS, ya que no se dispone de benchmarks frente a modelos externos de traducción (por ejemplo, NLLB o M2M100).

| Modelo | Parametros | Tamano cuantizado | COMET medio | chrF++ | BLEU | gen tok/s |
|---|---|---|---|---|---|---|
| Qwopus3.5-9B-Translate Q4 | ~9B | 5,24 GB | 0,8870 | 50,7 | 22,5 | 49 |
| NOESIS-Hy-MT2-7.5B Q5 | ~7,5B | 5,0 GB | 0,8709 | 46,2 | 21,4 | 52 |
| NOESIS-Hy-MT2-1.8B Q8 | ~1,8B | 1,78 GB | 0,8481 | 43,9 | 19,1 | 121 |

El 9B-Translate supera al MT2-7.5B en todas las métricas de traducción, pero el autor señala que el MT2 está optimizado para doblaje con isocronía, una capacidad que FLORES no mide. El MT2-1.8B ofrece un equilibrio coste/beneficio atractivo: es 2,4 veces más rápido y 2,8 veces más pequeño, con una pérdida de COMET de solo 0,023 respecto al 7.5B. No se dispone de comparativas con modelos de traducción de otras familias.

## Limitaciones y advertencias

- Licencia no disponible: no se especifican términos de uso comercial, lo que supone un riesgo legal para integraciones en producción.
- Requiere prefill cerrado para traducción determinista; sin él, el modelo emite razonamiento en lugar de la traducción, lo que puede romper pipelines que no contemplen este paso.
- Cobertura idiomática limitada a inglés, ruso y chino; no se documentan otros idiomas.
- BLEU bajo para chino (7,2 en la prueba n=20 y valores no desglosados en la n=100); se recomienda usar chrF++ o COMET para evaluar esa dirección.
- Los benchmarks publicados son internos del autor (n=20 y n=100), con la advertencia explícita de que parte de los resultados pueden estar dentro del ruido estadístico.
- No se proporcionan datos sobre sesgos, alucinaciones o comportamiento en dominios específicos; al ser un modelo especializado en traducción, su uso generalista no está validado.
- El tamaño del repositorio (23,6 GB) corresponde al BF16; el GGUF Q4_K_M se distribuye por separado y no está incluido en ese tamaño.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AMAImedia/NOESIS-Qwopus3.5-9B-Translate-v3.5-BF16
- Organización AMAImedia: https://huggingface.co/AMAImedia
- X (Twitter): https://x.com/AMAImediacom
- LinkedIn (Ilia Bolotnikov): https://www.linkedin.com/in/ilia-bolotnikov (enlace inferido, no verificado)
- Telegram: https://t.me/djbionicl
