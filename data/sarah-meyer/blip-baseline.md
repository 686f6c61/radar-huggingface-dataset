# sarah-meyer/blip-baseline

## Resumen

`sarah-meyer/blip-baseline` es un repositorio experimental de código y pesos de inicialización para una arquitectura tipo BLIP (Bootstrapping Language-Image Pre-training) orientada a aprendizaje contrastivo. Lo publica la usuaria de Hugging Face sarah-meyer y no constituye un modelo entrenado ni evaluado, sino un esqueleto reproducible para inspeccionar cambios de arquitectura antes de lanzar un entrenamiento completo. La model card lo declara explícitamente: el checkpoint `model.safetensors` es una inicialización válida para pruebas de humo (smoke tests), no un modelo con benchmarks.

La relevancia es, por tanto, metodológica más que de rendimiento: sirve como base de código mínima para experimentar con atención lineal, fusión por cross-attention, activación swish y normalización GroupNorm en un pipeline contrastivo multimodal. El tamaño registrado en safetensors es de 16.576 parámetros, lo que confirma que se trata de una maqueta de arquitectura, no de un modelo de escala real pese a la etiqueta "huge" en la configuración.

No hay información sobre datos de entrenamiento, idiomas, pipeline de uso ni resultados. Cualquier evaluación seria requeriría entrenar el modelo desde cero con un conjunto de datos y un protocolo definidos por quien lo vaya a usar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BLIP (variante experimental), atencion lineal, fusion por cross-attention |
| Parametros totales | 16.576 (segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura declarada es BLIP con atención lineal, fusión mediante cross-attention, activación swish y normalización GroupNorm. La escala etiquetada en la configuración es "huge", aunque el número real de parámetros del checkpoint (16.576) indica que la implementación publicada es una maqueta de tamaño reducido, coherente con el objetivo declarado de inspeccionar cambios arquitectónicos antes de un entrenamiento completo. El repositorio incluye `run.py` como artefacto principal, `config.json` con los ajustes de arquitectura y `training_args.json` con la receta de experimento por defecto (optimizador SGD con scheduler de tipo step).

No se ha publicado información sobre volumen de tokens, composición del dataset, ni sobre fases de RLHF, DPO o ajuste fino. La model card indica explícitamente que el checkpoint no ha sido entrenado y que la receta incluida son valores de partida, no evidencia de una ejecución completada. Tampoco se documentan innovaciones adicionales como decodificación especulativa o mecanismos de atención alternativos más allá de la atención lineal ya citada.

## Capacidades

- No se declaran capacidades funcionales verificadas: el checkpoint es una inicialización sin entrenamiento.
- La arquitectura está orientada a aprendizaje contrastivo, presumiblemente multimodal (texto-imagen) por la familia BLIP, aunque la model card no detalla las modalidades de entrada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Pruebas de humo de arquitectura: ejecutar `python run.py --help` y el bloque `__main__` para validar que el grafo de cómputo, la inicialización de pesos y el flujo de datos funcionan antes de invertir en un entrenamiento completo.
- Investigación sobre atención lineal en modelos contrastivos: el repositorio permite aislar y medir el efecto de sustituir atención cuadrática por atención lineal en un pipeline BLIP sin cargar con infraestructura pesada.
- Ablación de normalización y activación: al fijar GroupNorm y swish en la configuración, sirve como punto de partida controlado para comparar variantes (p. ej. LayerNorm + GELU) bajo el mismo esqueleto de código.
- Desarrollo de adaptadores de carga: dado que es una implementación personalizada, requiere un adaptador explícito para las APIs genéricas de carga; el repositorio es útil para construir y probar ese adaptador.
- Reproducción de experimentos académicos: la inclusión de `training_args.json` con SGD y scheduler step facilita fijar una receta reproducible y comparar contra líneas base de igual capacidad.
- Formación y docencia: como ejemplo didáctico de estructura de repositorio de modelo (config, pesos, script, argumentos de entrenamiento) y de buenas prácticas de documentación de limitaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card declara que no se reclama ninguna puntuación de benchmark y que el checkpoint no ha sido entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con rigor; con 16.576 parámetros, el checkpoint cabe holgadamente en cualquier GPU consumer e incluso en CPU, pero al no ser un modelo entrenado la cifra no es representativa de un uso real.
- GPU recomendadas: cualquiera para pruebas de humo (GTX 1060, RTX 3060, RTX 4090); para un entrenamiento a escala "huge" real harían falta A100/H100, pero no se especifica.
- Cabe en GPU consumer: sí, el checkpoint publicado cabe en cualquier GPU consumer actual.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser una implementación personalizada, requiere ejecución mediante `run.py` y un adaptador para APIs genéricas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sarah-meyer/blip-baseline | 16.576 | no disponible | No (inicialización) | BSD-3-Clause | Hugging Face |
| BLIP original (Salesforce) | ~224M (base) / ~385M (large) | 512 tokens de texto aprox. | Sí, preentrenado | BSD-3-Clause | Hugging Face |
| BLIP-2 | ~188M (Q-Former) + LLM | Depende del LLM acoplado | Sí | BSD-3-Clause | Hugging Face |
| CLIP (OpenAI) | ~150M (ViT-B/32) | 77 tokens de texto | Sí | MIT | Hugging Face |

La comparación es orientativa: el repositorio analizado no es un modelo entrenado y no es directamente comparable en rendimiento con BLIP, BLIP-2 o CLIP. Se incluye para situar la familia arquitectónica y la licencia.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: no produce salidas significativas y no debe usarse en producción.
- No ha sido auditado para robustez, equidad ni transferencia de dominio, según declara la propia model card.
- No hay información sobre sesgos, riesgo de alucinación ni comportamiento multilingüe porque no hay modelo entrenado que evaluar.
- La licencia BSD-3-Clause permite uso comercial del código y los pesos, pero la model card advierte de revisar por separado los términos de los datos de origen si se combinan con datasets externos.
- Requiere un adaptador explícito para las APIs automáticas de carga; no se integra directamente con pipelines estándar de Transformers.
- Cualquier resultado obtenido con este repositorio debe documentarse por separado de los valores por defecto publicados; mezclar ambos induce a error.
- El tamaño real del checkpoint (16.576 parámetros) contradice la etiqueta "huge" de la configuración; conviene no asumir capacidades de escala.

## Enlaces

- Hugging Face: https://huggingface.co/sarah-meyer/blip-baseline
- BLIP original (Salesforce): https://huggingface.co/Salesforce/blip-image-captioning-base
- BLIP-2 (Salesforce): https://huggingface.co/Salesforce/blip2-opt-2.7b
- CLIP (OpenAI): https://huggingface.co/openai/clip-vit-base-patch32
