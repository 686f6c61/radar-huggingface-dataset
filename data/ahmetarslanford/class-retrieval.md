# AhmetArslanford/class-retrieval

## Resumen

`AhmetArslanford/class-retrieval` es un repositorio de Hugging Face que contiene una implementación propia y compacta en PyTorch de una arquitectura Dino orientada a tareas de *retrieval* (recuperación). El autor la publica en configuración "nano", con 49.600 parámetros totales según el checkpoint en safetensors, atención lineal, fusión por *cross attention*, activación mish y normalización RMSNorm. El repositorio incluye el código (`main.py`), la configuración de arquitectura (`config.json`), la receta de entrenamiento por defecto (`training_args.json`) y un checkpoint de inicialización (`model.safetensors`).

El propio autor es explícito sobre el estado del artefacto: no es una versión preentrenada lista para producción, sino un punto de partida para revisión de código, *smoke tests* y experimentos controlados de pequeña escala. El checkpoint no ha sido entrenado ni auditado en robustez, equidad o transferencia de dominio, y el repositorio no reclama ninguna puntuación de benchmark. La receta incluida (optimizador Adafactor con *schedule* OneCycle) son valores de arranque del script, no evidencia de una ejecución completada.

Su relevancia es, por tanto, documental y metodológica: sirve como esqueleto reproducible para montar un pipeline de retrieval, como base para comparativas de capacidad equiparable y como ejemplo de publicación honesta sobre el estado real de un modelo. No debe evaluarse como un sistema de recuperación funcional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Dino (implementación propia en PyTorch), escala "nano", atención lineal, fusión por cross attention |
| Parámetros totales | 49.600 |
| Parámetros activos | No aplica (no es una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio solo distribuye `model.safetensors`; no se publican variantes cuantizadas) |
| Idiomas soportados | No disponible (no se documenta ningún idioma; la evaluación sugerida con Flickr30k implica texto en inglés) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (`model.safetensors`), más código Python y JSON de configuración |

Otros datos del repositorio: activación mish, normalización RMSNorm, optimizador Adafactor con scheduler OneCycle por defecto, 12 descargas, 0 *likes*, tamaño del repo 0,0 GB (redondeado), creado y actualizado el 2026-10-20 con 6 segundos de diferencia. No se declara *pipeline* en Hugging Face.

## Arquitectura y entrenamiento

La arquitectura declarada es Dino en variante nano, con atención lineal en lugar de atención cuadrática completa y un módulo de fusión basado en *cross attention*, pensado para combinar representaciones de dos modalidades (la tarea de destino es retrieval, y la guía de evaluación del autor apunta a Flickr30k, un corpus imagen-texto). La normalización es RMSNorm y la activación es mish. No se documenta el número de capas, la dimensión oculta, el número de cabezas ni la dimensión de las representaciones, por lo que no es posible reconstruir el reparto de los 49.600 parámetros a partir de la información disponible.

No hay evidencia de entrenamiento: el autor indica que `model.safetensors` es un checkpoint de inicialización válido para *smoke tests* y que no se presenta como un checkpoint entrenado ni evaluado. No se especifican tokens de entrenamiento, composición del dataset, ni fases de RLHF, DPO o ajuste supervisado. La receta por defecto (Adafactor + OneCycle) son valores iniciales del script, y el propio autor advierte que cualquier evaluación significativa exige entrenar todos los baselines con la misma exposición de datos, presupuesto de ajuste y semillas aleatorias. Tampoco se documentan innovaciones adicionales como decodificación especulativa, ya que el modelo no es generativo.

## Capacidades

- Codificación y recuperación (*retrieval*) a partir de una implementación Dino con atención lineal y fusión por *cross attention*, en configuración nano de 49.600 parámetros.
- Punto de entrada ejecutable: `main.py` contiene el modelo y un ejemplo ejecutable o *entry point* de entrenamiento; el bloque `__main__` incluye un ejemplo de *smoke test*.
- Configuración reproducible: `config.json` registra los ajustes de arquitectura generados y `training_args.json` la receta de experimento por defecto.
- Capacidad de servir como base para adaptadores: al ser una implementación personalizada, las APIs genéricas de carga automática requieren un adaptador explícito antes de su uso.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, *tool calling*, agentes, modo *thinking*, audio ni multimodalidad completa.
- No se documenta soporte multilingüe ni ningún conjunto de idiomas.

## Casos de uso

- **Revisión de código de arquitecturas de retrieval**: el repositorio sirve para inspeccionar una implementación Dino con atención lineal y cross attention en un tamaño manejable (49.600 parámetros), revisar decisiones de diseño (mish, RMSNorm) y discutir alternativas antes de escalar a un modelo mayor.
- **Smoke tests en CI/CD**: `model.safetensors` es un checkpoint de inicialización válido para verificar que un pipeline de carga, preprocesado y *forward pass* funciona de extremo a extremo sin incurrir en costes de GPU ni en dependencias pesadas.
- **Andamiaje de un banco de evaluación**: el autor propone evaluar en Flickr30k con la métrica de la tarea reportada sobre al menos tres semillas y con un baseline de capacidad equiparable; el repositorio sirve como plantilla para montar ese arnés antes de disponer de un modelo entrenado.
- **Desarrollo y prueba de adaptadores de carga**: dado que las APIs automáticas de Hugging Face no cargan esta implementación de forma genérica, es un caso práctico para escribir y testear un adaptador que registre la clase del modelo y su configuración.
- **Docencia y experimentos controlados de bajo coste**: con 49.600 parámetros, el modelo se entrena y se ejecuta en CPU en segundos, lo que permite ilustrar el ciclo completo (configuración, inicialización, optimizador Adafactor, scheduler OneCycle) en un aula o taller sin infraestructura dedicada.
- **Baseline de capacidad mínima en comparativas**: puede actuar como suelo de referencia (modelo no entrenado, capacidad nano) frente a codificadores de retrieval preentrenados, para cuantificar cuánta mejora aporta realmente el preentrenamiento a gran escala.
- **Prototipado de la capa de fusión**: útil para probar variantes de *cross attention* entre modalidades y medir su coste computacional antes de integrarlas en un sistema mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que el repositorio no reclama ninguna puntuación de benchmark y que el checkpoint no ha sido entrenado.

Como guía de evaluación propuesta (no como resultado), el autor sugiere usar Flickr30k, reportar la métrica de la tarea sobre al menos tres semillas e incluir un baseline de capacidad equiparable, conservando los registros de entrenamiento y las versiones del entorno junto a cualquier resultado publicado.

## Requisitos de hardware

- **VRAM estimada para inferencia**: despreciable. Con 49.600 parámetros, el checkpoint ocupa aproximadamente 0,2 MB en FP32 y unos 0,1 MB en FP16/BF16; las activaciones para un lote pequeño son igualmente mínimas.
- **GPU recomendadas**: ninguna en particular; el modelo cabe holgadamente en cualquier GPU, incluidas GTX 1050, RTX 3050 o superiores. No requiere A100 ni H100.
- **Consumer GPU**: sí, cabe en cualquier GPU de consumo e incluso en CPU, Raspberry Pi o entornos sin acelerador.
- **Opciones de despliegue**: PyTorch en modo eager es la vía natural. vLLM, TGI, llama.cpp y Ollama no aplican: no es un modelo generativo, no publica pesos en GGUF y no expone una interfaz de chat. La carga requiere un adaptador explícito para las APIs genéricas.
- **Latencia y throughput**: no disponible. No se publican mediciones de latencia ni de tokens o pares por segundo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Benchmark | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `AhmetArslanford/class-retrieval` | Dino nano, atención lineal, cross attention | 49.600 | No disponible | Sin resultados publicados | BSD-3-Clause | Hugging Face, 12 descargas, 0 likes |
| `hugo-leroy/class-retrieval` | CNN-Transformer para retrieval | No disponible en la información | No disponible | Sin datos en la información | Apache-2.0 | Hugging Face |
| Codificadores DINOv2 preentrenados (referencia de categoría) | ViT con autosupervisión | No disponible en la información | No disponible | No disponible en la información | No disponible en la información | Hugging Face / repositorios oficiales |

La comparación relevante es de planteamiento, no de rendimiento: `hugo-leroy/class-retrieval` sigue el mismo patrón de repositorio compacto con `main.py`, `config.json`, receta de experimento y checkpoint de inicialización, pero con arquitectura CNN-Transformer y licencia Apache-2.0. Ninguno de los dos publica métricas, de modo que no es posible establecer una comparación cuantitativa con la información disponible.

## Limitaciones y advertencias

- **El checkpoint no está entrenado**: `model.safetensors` es una inicialización, no un modelo ajustado. Cualquier uso como sistema de retrieval real produciría resultados sin significado.
- **Sin auditoría**: el autor indica que no se ha auditado robustez, equidad ni transferencia de dominio. No hay evaluación de sesgos.
- **Riesgo de similitudes espurias**: al no ser generativo, el riesgo análogo a la alucinación es el de puntuaciones de similitud o rankings sin correlación con la relevancia semántica.
- **Sin benchmarks ni validación comunitaria**: 12 descargas y 0 *likes* implican ausencia de validación por terceros; no hay resultados reproducibles que consultar.
- **Carga no estándar**: las APIs automáticas de Hugging Face (`AutoModel`, `pipeline`) requieren un adaptador explícito; no se declara *pipeline* en la ficha.
- **Idioma no documentado**: no se especifica ningún conjunto de idiomas; la evaluación sugerida (Flickr30k) implica texto en inglés, por lo que el soporte multilingüe es desconocido.
- **Licencia**: BSD-3-Clause permite uso comercial y modificación con atribución y conservación del aviso de copyright, pero el autor advierte de que deben revisarse por separado los términos de los datos de origen si se usan datasets externos.
- **Riesgo de confusión de nombre**: existen otros repositorios con el identificador `class-retrieval` de arquitecturas y licencias distintas; conviene citar siempre el ID completo `AhmetArslanford/class-retrieval`.
- **Metadatos incompletos**: no se documentan capas, dimensiones ocultas, tokenizador, preprocesado ni longitud de contexto, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AhmetArslanford/class-retrieval
- Perfil del autor: https://huggingface.co/AhmetArslanford
- Repositorio comparable `hugo-leroy/class-retrieval`: https://huggingface.co/hugo-leroy/class-retrieval
