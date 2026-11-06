# joey00072/ohara-d28-a1b-stage1

## Resumen

ohara-d28-a1b-stage1 es un checkpoint de preentrenamiento de la primera etapa (stage-1, contexto de 4k) del modelo ohara, un encoder-decoder causal híbrido desarrollado por el usuario joey00072 dentro del proyecto ohara. Se trata de un modelo base, no ajustado por instrucciones, con una arquitectura que combina atención con ventana deslizante (SWA), atención global puenteada por KV, atención token-sparse, residuales mHC, memoria de n-gramas y una capa MoE de 256 expertos con top-8 más un experto compartido. El checkpoint publicado corresponde al paso 4238, con aproximadamente 30.000 millones de tokens procesados (hito del 10 % del entrenamiento previsto).

El modelo cuenta con unos 23.400 millones de parámetros totales y aproximadamente 1.020 millones de parámetros activos por token, lo que lo sitúa en la categoría de MoE de activación muy dispersa: capacidad de almacenamiento grande con coste de cómputo por token relativamente bajo. Utiliza el tokenizador de Qwen3. El repositorio ocupa 47,7 GB en formato safetensors.

Su relevancia es fundamentalmente de investigación: al ser un checkpoint intermedio de preentrenamiento, permite estudiar la evolución del entrenamiento de arquitecturas híbridas con MoE, reanudar el entrenamiento desde el estado guardado o servir como base para experimentos de ajuste fino. No está pensado para uso en producción directa ni para tareas de instrucción sin un post-entrenamiento adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder causal híbrido (ohara_hybrid): SWA + atención global puenteada por KV + atención token-sparse, residuales mHC, memoria de n-gramas, MoE |
| Parametros totales | 23.846.942.486 (~23,4B) |
| Parametros activos | ~1,02B por token |
| Longitud de contexto | 4096 tokens (stage-1) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tokenizador | Qwen3 |
| Paso de entrenamiento | 4238 |
| Tokens procesados | 29.996.089.344 (~30B) |
| Loss de entrenamiento | 2,1847 nats |
| Hito | 10 % del entrenamiento |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida causal encoder-decoder etiquetada como `ohara_hybrid`. Combina varias formas de atención: ventana deslizante (SWA) para capturar dependencias locales, atención global puenteada por KV para propagar información a larga distancia sin el coste cuadrático completo, y atención token-sparse para reducir el cómputo en secuencias largas. Incorpora además residuales mHC (multi-head connections) y un mecanismo de memoria de n-gramas, que probablemente permite recuperar patrones de secuencias repetidas de forma eficiente.

La capa de mezcla de expertos (MoE) consta de 256 expertos con enrutamiento top-8 más un experto compartido, lo que da lugar a ~1,02B parámetros activos sobre un total de ~23,4B. El checkpoint corresponde al paso 4238 de la primera etapa de preentrenamiento, con 29.996.089.344 tokens procesados y una loss de 2,1847 nats, marcando el hito del 10 % del entrenamiento. No se dispone de información sobre la composición del dataset, el uso de RLHF/DPO ni otras innovaciones de entrenamiento más allá de lo indicado en la model card.

## Capacidades

- Generación de texto autoregresiva como modelo base de lenguaje causal.
- Razonamiento y modelado de lenguaje general, limitado por el estado temprano del preentrenamiento (10 % del total).
- Procesamiento de secuencias de hasta 4096 tokens.
- Capacidad multilingüe potencial heredada del tokenizador Qwen3, aunque no se documentan idiomas soportados.
- No dispone de ajuste por instrucciones, por lo que no sigue instrucciones de forma fiable sin post-entrenamiento.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento explícito.
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Investigación sobre arquitecturas híbridas: el checkpoint permite analizar el comportamiento de la combinación SWA + atención global + token-sparse + MoE en un punto intermedio del entrenamiento, comparando curvas de loss y patrones de atención.
- Reanudación de entrenamiento: gracias al estado guardado en `ohara-d28-a1b-stage1-state`, se puede continuar el preentrenamiento desde el paso 4238 con el mismo dataset y configuración.
- Ajuste fino experimental: servir como base para probar recetas de post-entrenamiento (SFT, DPO) sobre un modelo MoE de activación dispersa y evaluar su impacto antes de disponer del checkpoint final.
- Estudio de eficiencia de MoE: medir el coste real de inferencia con ~1B parámetros activos frente a modelos densos de tamaño comparable en tareas de modelado de lenguaje.
- Evaluación de tokenizadores: comparar el rendimiento del tokenizador Qwen3 en un modelo con arquitectura híbrida propia.
- Reproducibilidad de experimentos: el enlace público a W&B y el hash del árbol de código permiten reproducir y auditar el entrenamiento en entornos de investigación.
- Pruebas de decodificación y generación: experimentar con estrategias de muestreo y decodificación sobre un modelo base de contexto 4k.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la loss de entrenamiento (2,1847 nats) en el paso 4238.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 47-48 GB solo para pesos, más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: ~24 GB; en 4 bits: ~12-13 GB (estimaciones teóricas, no verificadas al no documentarse cuantizaciones soportadas).
- GPU recomendadas para fp16: A100 80 GB, H100 80 GB, o configuraciones multi-GPU (2× RTX 4090 de 24 GB no bastan en fp16 sin paralelismo).
- En consumer GPU: posible en cuantización 4 bits en RTX 4090 (24 GB) o RTX 3090, siempre que la librería `ohara` soporte dicha cuantización, lo cual no está documentado.
- Opciones de despliegue: la librería oficial `ohara` (instalación vía `pip install -e ohara` desde el repositorio GitHub) con la función `load_hf`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| ohara-d28-a1b-stage1 | ~23,4B | ~1,02B | 4096 | no disponible | Checkpoint de preentrenamiento (10 %) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (MoE híbridos de ~23B totales con ~1B activos) en la información proporcionada, por lo que no es posible establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Es un checkpoint de preentrenamiento al 10 % del entrenamiento: la calidad de generación será limitada y no debe usarse como modelo final.
- No está ajustado por instrucciones; no sigue instrucciones de forma fiable ni mantiene formatos conversacionales.
- Contexto limitado a 4096 tokens en esta etapa.
- No se documentan idiomas soportados ni sesgos conocidos; el comportamiento multilingüe es incierto.
- Riesgo elevado de alucinación y de generación incoherente dado el estado temprano del entrenamiento.
- Licencia no disponible: no se puede confirmar el uso comercial; se recomienda contactar con el autor antes de cualquier uso en producción.
- Sin soporte documentado de cuantización ni de frameworks de despliegue estándar (vLLM, llama.cpp, Ollama, TGI), lo que limita su integración en pipelines convencionales.
- El repositorio ocupa 47,7 GB y requiere la librería `ohara` para cargar los pesos; no es un checkpoint directamente compatible con `transformers`.
- Solo se conservan los tres checkpoints más recientes como ramas `step-NNNNNN`; los antiguos se eliminan, lo que puede afectar a la reproducibilidad de experimentos intermedios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joey00072/ohara-d28-a1b-stage1
- Estado de entrenamiento (resume): https://huggingface.co/joey00072/ohara-d28-a1b-stage1-state
- Repositorio GitHub: https://github.com/joey00072/ohara
- Run de W&B (público): https://forge.coreweave.com/wandb/joey00072/ohara-pretrain/runs/stage1-d28
