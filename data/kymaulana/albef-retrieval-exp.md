# kymaulana/albef-retrieval-exp

## Resumen

`kymaulana/albef-retrieval-exp` es un repositorio de Hugging Face que contiene una implementación propia y minimalista de la arquitectura ALBEF (Align before Fuse) orientada a tareas de recuperación multimodal (retrieval). Lo publica el usuario `kymaulana` y no debe confundirse con los pesos oficiales de ALBEF de Salesforce: según la propia model card, se trata de un punto de partida reproducible con un checkpoint de inicialización, no de un modelo entrenado ni evaluado. El repositorio incluye el código del modelo (`model.py`), la configuración de arquitectura (`config.json`), una receta de entrenamiento por defecto (`training_args.json`) y un fichero `model.safetensors` descrito explícitamente como inicialización para pruebas de humo.

La relevancia de este repositorio es, por tanto, didáctica y experimental: sirve para reproducir la estructura de ALBEF con atención multi-query, fusión de bajo rango, activación gelu-tanh y normalización ScaleNorm, y para lanzar experimentos propios sobre datasets como Flickr30k. No aporta resultados de benchmarks, no declara idiomas soportados y no está pensado para uso en producción.

El dato de "parámetros totales" reportado por Hugging Face (16.576) es anómalo para un modelo multimodal de este tipo y probablemente refleja solo una parte de los tensores del checkpoint de inicialización, no el tamaño real de la arquitectura completa. No hay información que permita confirmar el recuento real de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ALBEF (Align before Fuse), implementación propia; atención multi-query, fusión de bajo rango, activación gelu-tanh, normalización ScaleNorm |
| Parametros totales | 16.576 segun metadatos de safetensors (dato no fiable para la arquitectura completa; no disponible el recuento real) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se distribuye safetensors en fp32/fp16 sin indicar) |
| Idiomas soportados | No disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (checkpoint de inicialización), código en Python/PyTorch |

## Arquitectura y entrenamiento

La arquitectura declarada es ALBEF, un modelo multimodal texto-imagen que combina un codificador de imagen y un codificador de texto con un mecanismo de fusión cruzada. En esta implementación concreta se especifican atención multi-query, fusión de bajo rango, activación gelu-tanh y normalización ScaleNorm. El tamaño declarado es "small". No se detalla el número de capas, dimensiones ocultas ni el codificador visual utilizado.

No hay evidencia de entrenamiento: la model card indica explícitamente que `model.safetensors` es un checkpoint de inicialización válido para pruebas de humo y que no se presenta como un checkpoint entrenado ni evaluado. La receta por defecto usa el optimizador Lion con scheduler coseno, pero el autor aclara que son valores de partida del script y no evidencia de una ejecución completada. No se documentan número de tokens, composición del dataset, ni fases de RLHF/DPO. La evaluación sugerida por el autor es sobre Flickr30k, con métrica de la tarea reportada en al menos tres semillas y una línea base de capacidad comparable.

## Capacidades

- Recuperación multimodal texto-imagen e imagen-texto (retrieval), según la etiqueta del repositorio.
- Implementación de referencia de ALBEF con atención multi-query y fusión de bajo rango para experimentación.
- Punto de partida reproducible para entrenar y evaluar sobre datasets como Flickr30k.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión generativa, tool calling, agentes ni modo thinking.
- No se declaran capacidades multilingües.
- El modelo no está entrenado, por lo que no cabe esperar capacidades funcionales reales sin un entrenamiento previo por parte del usuario.

## Casos de uso

- Reproducción de experimentos académicos: usar `model.py` y `config.json` como base para replicar la arquitectura ALBEF en un entorno controlado y comparar variantes de atención y fusión.
- Pruebas de humo de pipelines de entrenamiento: cargar `model.safetensors` como inicialización para verificar que el forward pass, las formas de los tensores y el guardado de checkpoints funcionan antes de lanzar un entrenamiento real.
- Benchmarking de retrieval sobre Flickr30k: entrenar el modelo desde cero con la receta Lion + coseno y reportar métricas de recuperación en al menos tres semillas, tal como sugiere el autor.
- Estudio de ablaciones arquitectónicas: modificar atención multi-query, fusión de bajo rango o ScaleNorm y medir el impacto en la tarea de retrieval con una línea base de capacidad comparable.
- Docencia y formación: ilustrar cómo se estructura una implementación de ALBEF y cómo se organiza un repositorio de investigación (config, training args, checkpoint de inicialización).
- Integración en pipelines de investigación propios: servir como módulo PyTorch dentro de un framework mayor de experimentación multimodal, siempre con un adaptador explícito porque las APIs genéricas de carga automática no lo soportan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que no se reclama ninguna puntuación de benchmark y que el checkpoint no ha sido entrenado ni auditado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del tamaño real de la arquitectura, que no se documenta.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no confirmada; el tamaño declarado "small" y el peso del repo (0,0 GB) sugieren que podría caber en GPUs de consumo, pero no hay datos que lo verifiquen.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El uso previsto es ejecutar `python model.py` directamente con PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kymaulana/albef-retrieval-exp | No disponible (metadatos: 16.576) | No disponible | No (checkpoint de inicialización) | BSD-3-Clause | Hugging Face |
| ALBEF oficial (Salesforce) | ~210M (ViT-B/16 + BERT-base) | 512 tokens de texto aprox. | Sí (preentrenado y afinado en retrieval) | BSD-3-Clause | GitHub y pesos públicos |
| BLIP (Salesforce) | ~224M (ViT-B) | 512 tokens de texto aprox. | Sí | BSD-3-Clause | Hugging Face |
| CLIP (OpenAI) | ~150M (ViT-B/32) | 77 tokens de texto | Sí | MIT (código), pesos con términos propios | Hugging Face |

Nota: los datos de los modelos comparables provienen de conocimiento general de la literatura y no de la información proporcionada en esta ficha; verifíquelos en sus fuentes originales antes de usarlos en una decisión técnica.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: no produce representaciones útiles para retrieval sin un entrenamiento previo.
- No ha sido auditado para robustez, equidad ni transferencia de dominio, según la propia model card.
- No se declaran idiomas soportados ni cobertura lingüística.
- No se documenta la longitud de contexto, lo que impide planificar el truncado de textos en producción.
- El recuento de parámetros reportado (16.576) es inconsistente con una arquitectura ALBEF completa; trátelo como no fiable.
- Al ser una implementación personal, las APIs genéricas de carga automática (por ejemplo, `AutoModel.from_pretrained`) requieren un adaptador explícito.
- La licencia BSD-3-Clause permite uso comercial, pero deben revisarse por separado los términos de los datasets externos que se utilicen para entrenar.
- No apto para producción sin entrenamiento, evaluación y auditoría adicionales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kymaulana/albef-retrieval-exp
- Paper original de ALBEF: https://arxiv.org/abs/2107.07651
- Repositorio oficial de ALBEF (Salesforce): https://github.com/salesforce/ALBEF
- Dataset Flickr30k: https://shannon.cs.illinois.edu/DenotationGraph/
