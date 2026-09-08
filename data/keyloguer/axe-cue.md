# keyloguer/AXE-cue

## Resumen

AXE-cue es un conjunto de dos adaptadores LoRA construidos sobre el modelo base Qwen/Qwen3-0.6B, desarrollado por keyloguer (Daniel Zitei). No es un modelo completo, sino una cadena de señales (cue chain) compuesta por un podador de DOM y un extractor de señales, que trabaja sobre páginas HTML para obtener la etiqueta y el valor de campos solicitados. El objetivo es servir como estudio de coste dentro de la propuesta "Verified XPath synthesis with open-weight proposers" (WebConf 2027).

El modelo base tiene 0.6B de parámetros y la carpeta del repositorio ocupa 0.3 GB. La longitud máxima de secuencia usada en el entrenamiento es de 4096 tokens. Está entrenado con la librería MLX en Apple silicon, y los pesos se distribuyen como adaptadores Safetensors. Su relevancia radica en explorar si un modelo pequeño puede realizar la poda y extracción de señales de forma eficiente, en lugar de usar modelos más grandes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-0.6B) con adaptadores LoRA |
| Parametros totales | No disponible (modelo base 0.6B; parámetros de adaptadores no especificados) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | 4096 tokens (máximo de secuencia en entrenamiento) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adapters.safetensors) en formato MLX |

## Arquitectura y entrenamiento

La arquitectura se compone de dos adaptadores LoRA que se aplican secuencialmente sobre el mismo modelo base Qwen3-0.6B. El primer adaptador, `teacher_pruner_v4_qwen3_0_6b`, actúa como podador de DOM: conserva los subárboles alrededor de cada aparición de un campo. El segundo, `cue_extractor_v1`, lee la etiqueta de señal y el valor de cada campo solicitado sobre el DOM ya podado. Cada adaptador incluye su `adapter_config.json`, la configuración LoRA generada, el log de entrenamiento y un `checkpoint_manifest.json` con la revisión del modelo base, el hash de la plantilla de prompt y el manifiesto de datos.

El entrenamiento de ambos adaptadores sigue la misma receta: LoRA con rango 64, alpha 64, dropout 0.1; optimizador AdamW con tasa de aprendizaje 1.7e-5, decaimiento coseno y 10% de warmup; weight decay 0.01; tamaño de lote 1; gradient checkpointing; longitud máxima de secuencia de 4096 tokens; 2 épocas; semilla 20260825; y prompt enmascarado. No se especifica la composición del dataset de entrenamiento ni el número total de tokens, aunque el autor remite a `docs/REPRODUCING.md` (tipo de ejecución `axe-retrain`) para los números registrados y el protocolo exacto.

## Capacidades

- Extracción de señales en páginas HTML: el podador de DOM reduce el árbol a los subárboles relevantes para cada campo.
- Extracción de etiqueta y valor: el extractor de señales lee la etiqueta de señal y el valor de cada campo solicitado.
- Integración en cadenas de propuestas para síntesis verificada de XPath, tal como se describe en el paper de WebConf 2027.
- Compatibilidad con el framework MLX, lo que permite ejecutarlo en Apple silicon.
- Funcionamiento como adaptador LoRA sobre el modelo base Qwen3-0.6B, lo que facilita el ajuste fino sin modificar los pesos completos.
- No se documentan capacidades de tool calling, agentes, razonamiento general, visión o audio.

## Casos de uso

- Extracción de datos web estructurados: dado el HTML de una página, la cadena de adaptadores identifica los campos solicitados y devuelve su etiqueta y valor, lo que permite construir datasets de forma automatizada.
- Automatización de scraping con verificación de XPath: la salida del extractor puede alimentar un sistema de síntesis de XPath que verifique la validez de las rutas generadas, reduciendo el mantenimiento manual de selectores.
- Investigación en síntesis de XPath: el modelo sirve como estudio de coste para comparar el rendimiento de proposers de pesos abiertos en la tarea de poda y extracción de señales.
- Integración en pipelines de datos para web crawling: al ser un adaptador pequeño, puede ejecutarse en entornos con recursos limitados y procesar páginas de forma incremental.
- Análisis de páginas con campos de formulario: el podador de DOM permite localizar campos de entrada y sus etiquetas en formularios HTML complejos.
- Reproducción de resultados académicos: los autores pueden usar los adaptadores y el protocolo documentado en `docs/REPRODUCING.md` para replicar los experimentos del paper.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor referencia un estudio en *Verified XPath synthesis with open-weight proposers* (WebConf 2027), pero no se proporcionan métricas concretas (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Dado que el modelo base es Qwen3-0.6B y los adaptadores son LoRA, se espera que la inferencia requiera poca memoria, pero no se aportan cifras oficiales.
- GPU recomendadas: no disponible. El entrenamiento se realizó en Apple silicon con MLX, por lo que no hay datos de GPU NVIDIA.
- Compatibilidad con GPU de consumo: probablemente sí, dado el tamaño reducido del modelo base, pero no hay confirmación oficial.
- Opciones de despliegue: MLX (Apple silicon) según la model card. No se documentan opciones para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible en la información proporcionada. El modelo es un adaptador LoRA especializado en extracción de señales de DOM; no se aportan comparativas con otras soluciones de la misma categoría.

## Limitaciones y advertencias

- Sesgos: no documentados. Al ser un adaptador entrenado sobre un modelo pequeño, puede heredar sesgos del modelo base.
- Riesgo de alucinación: no evaluado en la información disponible. El modelo podría generar etiquetas o valores incorrectos si la entrada no contiene los campos esperados.
- Limitaciones de contexto: la longitud máxima de secuencia en entrenamiento es de 4096 tokens, por lo que páginas HTML muy largas pueden superar la ventana y provocar truncamiento.
- Idioma: solo se declara soporte para inglés, lo que limita su uso en páginas en otros idiomas.
- Restricciones de licencia: la licencia no está especificada, por lo que no se puede garantizar el uso comercial.
- Es un estudio de coste, no un modelo listo para producción. El autor lo presenta explícitamente como una investigación, no como una columna de la matriz de proposers.
- Depende de la revisión concreta del modelo base Qwen/Qwen3-0.6B (`c1899de289a04d12100db370d81485cdf75e47ca`), lo que puede dificultar la reproducción si la revisión cambia.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/keyloguer/AXE-cue
- GitHub del autor: https://github.com/keyloguer
- Paper referenciado: *Verified XPath synthesis with open-weight proposers* (WebConf 2027 submission), sin enlace disponible.
