# lea-merc/classification

## Resumen

El modelo `lea-merc/classification` es un prototipo de investigación de tipo Tiny Transformer orientado a tareas de clasificación, publicado por el usuario lea-merc en HuggingFace. Con 16.576 parámetros totales (dato real extraído de los pesos en formato safetensors), es un artefacto experimental de escala "small" cuyo objetivo declarado es documentar una configuración de arquitectura y un formato de ficheros, no ofrecer un modelo entrenado listo para producción.

El repositorio incluye un script `train.py`, un `config.json` con los ajustes de arquitectura, un `training_args.json` con la receta de experimento por defecto y un `model.safetensors` que el propio autor describe como un checkpoint de inicialización válido únicamente para pruebas de humo (smoke tests). No se reclama ninguna puntuación de benchmark ni evidencia de un entrenamiento completado.

Su relevancia es metodológica: sirve como plantilla reproducible para montar experimentos de clasificación con arquitecturas transformer pequeñas, comparar baselines de capacidad similar y documentar resultados de forma trazable. No está pensado para inferencia real ni para uso comercial directo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Tiny Transformer (atención de ventana deslizante, fusión con puerta) |
| Parámetros totales | 16.576 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es un Tiny Transformer con mecanismo de atención de ventana deslizante (sliding window) y una etapa de fusión con puerta (gated fusion). Emplea activación GELU y normalización por lotes (batchnorm). El autor la clasifica como escala "small" y no publica dimensiones como número de capas, dimensión oculta o número de cabezas de atención en la información disponible.

En cuanto al entrenamiento, el `training_args.json` documenta una receta por defecto basada en el optimizador RMSprop con un calendario de warmup lineal. El propio autor advierte que se trata de valores de partida del script, no de la evidencia de una ejecución completa, y que el checkpoint `model.safetensors` no ha sido entrenado. No hay datos sobre volumen de tokens, composición del dataset ni fases de RLHF o DPO.

## Capacidades

- Diseñado para clasificación de secuencias (el pipeline no está declarado en la ficha, pero la etiqueta del repositorio es "classification").
- No se han demostrado capacidades de generación de texto, razonamiento, código o matemáticas.
- No hay soporte documentado de tool calling ni function calling.
- No hay soporte documentado de agentes ni de razonamiento multi-paso.
- Capacidades multilingües: no disponibles (no se declaran idiomas soportados).
- No dispone de modo "thinking", visión ni audio.
- El checkpoint publicado no ha sido entrenado, por lo que no exhibe ninguna capacidad funcional real más allá de servir para pruebas de humo.

## Casos de uso

- Pruebas de humo de infraestructura: verificar que la carga de safetensors, la tokenización y el forward pass funcionan correctamente antes de invertir recursos en un entrenamiento completo.
- Plantilla de investigación reproducible: usar `train.py` y `training_args.json` como punto de partida para montar experimentos de clasificación con arquitecturas pequeñas y seeds controladas.
- Baseline de capacidad reducida: comparar un modelo de 16.576 parámetros contra alternativas de capacidad similar bajo el mismo presupuesto de datos, ajuste y semillas aleatorias.
- Validación de formatos: comprobar la compatibilidad de `config.json` y `model.safetensors` con herramientas internas de serialización y versionado de pesos.
- Docencia y divulgación: ilustrar la estructura mínima de un repositorio de modelo (configuración, argumentos de entrenamiento, pesos) sin requerir recursos de cómputo relevantes.
- Prototipado de adaptadores: dado que es una implementación custom que requiere un adaptador explícito para las APIs de carga automática, sirve para desarrollar y probar dicho adaptador antes de integrarlo en un pipeline mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se reclama ninguna puntuación y que el checkpoint es una inicialización sin entrenar.

## Requisitos de hardware

- VRAM para inferencia: inferior a 1 MB con los 16.576 parámetros en precisión completa (aproximadamente 66 KB en float32), por lo que cabe en cualquier GPU, incluida una integrada.
- GPU recomendadas: cualquiera; no requiere GPU dedicada.
- Cabe en GPU de consumo: sí, en cualquier modelo (RTX 4090, RTX 3060, GTX 1650) y también en CPU.
- Opciones de despliegue: al ser una implementación custom, no hay soporte declarado para vLLM, llama.cpp, Ollama o TGI; requiere cargar el script `train.py` con un adaptador explícito.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| lea-merc/classification | 16.576 | no disponible | BSD-3-Clause | Prototipo sin entrenar |
| TinyBERT (4 capas) | ~14,5 M | 128-512 | Apache-2.0 | Entrenado (destilación) |
| DistilBERT | ~66 M | 512 | Apache-2.0 | Entrenado |
| TF-IDF + regresión logística | variable | no aplica | según implementación | Entrenado |

Nota: los datos de los modelos de referencia corresponden a información pública ampliamente documentada; no se dispone de comparaciones de rendimiento realizadas con el mismo dataset ni con el mismo presupuesto de ajuste.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado, por lo que no es apto para inferencia en producción.
- No se ha auditado su robustez, equidad (fairness) ni transferencia de dominio.
- Riesgo de alucinación: no aplica en el estado actual, ya que no genera texto entrenado; cualquier uso como clasificador sin entrenar produciría salidas sin significado.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia BSD-3-Clause: permite uso comercial con atribución y conservación del aviso de copyright; el autor recomienda revisar aparte los términos de los datos fuente si se emplean datasets externos.
- Implementación custom: las APIs genéricas de carga automática (por ejemplo, `AutoModel`) requieren un adaptador explícito, lo que añade trabajo de integración.
- Cualquier resultado futuro debe documentarse por separado de los valores por defecto incluidos en el repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/lea-merc/classification

No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la información disponible.
