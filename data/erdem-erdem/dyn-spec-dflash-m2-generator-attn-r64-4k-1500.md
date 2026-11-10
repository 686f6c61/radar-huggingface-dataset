# erdem-erdem/dyn-spec-dflash-m2-generator-attn-r64-4k-1500

## Resumen

El repositorio `erdem-erdem/dyn-spec-dflash-m2-generator-attn-r64-4k-1500` no contiene un modelo de lenguaje generativo al uso, sino un checkpoint de entrenamiento de un *drafter* de decodificación especulativa. Lo publica el usuario erdem-erdem dentro de su proyecto dyn-spec, un port del generador DFlash, y su función es proponer tokens candidatos que un modelo objetivo de mayor tamaño valida después. El modelo objetivo es Qwen/Qwen3-8B, y el drafter de partida es `z-lab/Qwen3-8B-DFlash-b16`, sobre el que se aplica una adaptación LoRA con rango 64 y ventana de 4k.

El artefacto corresponde al brazo `direct` en fase de `pretraining`, tras 1500 actualizaciones con semilla 42. Incluye estado del optimizador, resultados de validación, evaluaciones offline y trazabilidad completa (provenance), pero el autor indica explícitamente que no es un bundle de servicio: la exportación DFlash para inferencia aún no está portada. Por tanto, no debe tratarse como un modelo listo para desplegar, sino como material reproducible de investigación en decodificación especulativa.

Su relevancia es acotada pero clara para quien trabaje en aceleración de inferencia con drafters ligeros sobre modelos Qwen3. El repo ocupa 26,3 GB, coherente con un checkpoint de entrenamiento con estado del optimizador, no con pesos finales cuantizados. No hay pipeline, licencia ni idiomas declarados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (drafter DFlash sobre Qwen3-8B; adaptación LoRA de rango 64, ventana 4k) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la ventana de entrenamiento del drafter es de 4k según el nombre del repo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch); no hay safetensors ni GGUF publicados |

## Arquitectura y entrenamiento

El modelo es un drafter de decodificación especulativa basado en la familia DFlash, adaptado mediante LoRA de rango 64 sobre el drafter `z-lab/Qwen3-8B-DFlash-b16`. El entrenamiento se ejecuta en el brazo `direct`, en fase de pretraining, durante 1500 actualizaciones con semilla 42, y se apoya en un almacén de activaciones publicado aparte (`erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k`). El repositorio conserva el comando de entrenamiento, un parche (`speculators.patch`), registros de tiempo y métricas por fila, lo que permite reproducir el proceso.

La validación se realiza sobre 200 filas fijas, con una LoRA por fila y la métrica `full_acc`. En la actualización 0 la puntuación es 0,5246 (τ EAL 7,108; chat 0,3383; code 0,5699; math 0,6796; stem 0,5105) y en la actualización 1500 es 0,5198 (τ 7,080; chat 0,3330; code 0,5634; math 0,6727; stem 0,5102). Es decir, el entrenamiento no mejora la métrica de validación: se mantiene prácticamente plana y ligeramente a la baja. No se documentan detalles sobre composición del dataset, número de tokens ni uso de RLHF o DPO.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa sobre Qwen3-8B, no generación de texto autónoma.
- Adaptación LoRA por fila en la validación, con una LoRA independiente para cada una de las 200 filas fijas.
- Evaluación desglosada por dominio: chat, code, math y stem.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües.
- No se documentan modos especiales (thinking, visión, audio).
- Incluye evaluaciones offline con coeficientes M4, donantes M7, similitud D13 y coste D14, según el autor.

## Casos de uso

- Investigación en decodificación especulativa: servir como checkpoint reproducible para estudiar la evolución del drafter DFlash sobre Qwen3-8B a lo largo de 1500 actualizaciones, comparando la métrica en el paso 0 y en el 1500.
- Reproducción de experimentos: el repo incluye `train_command.txt`, `speculators.patch` y registros de provenance, lo que permite reejecutar el entrenamiento y verificar el SHA256 del checkpoint.
- Análisis de adaptadores LoRA por fila: la validación con una LoRA por fila facilita estudiar cómo se comporta la adaptación cuando cada ejemplo tiene su propio adaptador.
- Estudio de dominios concretos: las métricas separadas de chat, code, math y stem permiten analizar en qué dominios el drafter mantiene mejor la tasa de aceptación.
- Auditoría de artefactos de entrenamiento: `MANIFEST.json` con tamaño y SHA256 de cada fichero sirve para verificar integridad en pipelines de investigación.
- Base para un futuro bundle de servicio: cuando se porte la exportación DFlash para inferencia, este checkpoint podría servir como punto de partida, aunque hoy no es desplegable.

## Benchmarks y rendimiento

| Actualizacion | full_acc | τ (EAL) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0.5246 | 7.108 | 0.3383 | 0.5699 | 0.6796 | 0.5105 |
| 1500 | 0.5198 | 7.080 | 0.3330 | 0.5634 | 0.6727 | 0.5102 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores son métricas internas de validación del drafter sobre 200 filas fijas, no comparables con benchmarks de modelos generativos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto no es un bundle de servicio y no se publican pesos finales cuantizados.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; el autor indica que la exportación DFlash para servicio aún no está portada.
- Latencia y throughput: no disponibles.
- Espacio en disco: el repo ocupa 26,3 GB, principalmente por el checkpoint con estado del optimizador.

## Comparativa con modelos similares

| Modelo | Rol | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dyn-spec-dflash-m2-generator-attn-r64-4k-1500 | Checkpoint de entrenamiento de drafter DFlash | no disponible | 4k (ventana de entrenamiento) | no disponible | Hugging Face, 0 descargas |
| z-lab/Qwen3-8B-DFlash-b16 | Drafter DFlash base | no disponible | no disponible | no disponible | Hugging Face (referenciado como origen) |
| Qwen/Qwen3-8B | Modelo objetivo | 8B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos artefactos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de servicio: es un checkpoint de entrenamiento con estado del optimizador; no debe desplegarse como modelo generativo.
- El entrenamiento no mejora la validación: `full_acc` baja de 0,5246 a 0,5198 y τ de 7,108 a 7,080 entre el paso 0 y el 1500.
- El dominio chat es el más débil con diferencia (0,33 frente a 0,57 en code y 0,68 en math).
- Licencia no declarada: no puede asumirse uso comercial sin verificar los términos del autor y de los artefactos de origen (Qwen3-8B y el drafter z-lab).
- Idiomas no declarados.
- Sin pipeline ni formato de pesos estándar (solo `checkpoint.pt`), lo que dificulta su integración en herramientas habituales.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa conocida.
- La exportación DFlash para inferencia no está portada, según el propio autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-m2-generator-attn-r64-4k-1500
- Almacén de activaciones: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
