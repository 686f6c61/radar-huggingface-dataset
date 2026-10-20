# Chloemart/classification-2024

## Resumen

`Chloemart/classification-2024` es un repositorio de HuggingFace que contiene una implementación propia y mínima de una arquitectura **EfficientFormer** orientada a clasificación, publicada por el usuario Chloemart bajo licencia BSD-3-Clause. No se trata de un modelo entrenado ni de una release con pesos listos para producción: la propia model card lo describe explícitamente como un punto de partida reproducible con un *checkpoint* de inicialización válido únicamente para *smoke tests*. El repositorio incluye el código (`model.py`), la configuración de arquitectura (`config.json`), la receta de entrenamiento por defecto (`training_args.json`) y los pesos en `safetensors`.

El dato más relevante es su escala: el fichero `model.safetensors` declara **49.600 parámetros totales**, varias órdenes de magnitud por debajo de cualquier EfficientFormer publicado (las variantes B0-S0 de EfficientFormerV2 rondan los 3,5-12 millones). La model card etiqueta la variante como "base", lo que entra en contradicción con el recuento real de parámetros; se trata, por tanto, de un esqueleto de arquitectura, no de un modelo con capacidad predictiva.

Su relevancia actual es limitada y acotada: sirve como andamiaje para experimentar con atención de tipo *grouped query* y fusión con compuertas (*gated fusion*) sobre una columna EfficientFormer, para validar pipelines de entrenamiento y para pruebas de humo de código de carga de pesos. No hay métricas, no hay datos de entrenamiento declarados y la búsqueda web asociada no ha devuelto ningún resultado pertinente (los enlaces recuperados son de máquinas de coser, sin relación con el modelo).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientFormer (implementación personalizada; atención *grouped query*, fusión *gated fusion*, activación GELU, normalización LayerNorm) |
| Parametros totales | 49.600 (según `model.safetensors`); la model card declara escala "base", dato inconsistente con el recuento |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de visión para clasificación; no gestiona contexto textual) |
| Tipos de cuantizacion | No disponible (no se publican variantes cuantizadas; por tamaño, fp32/bf16/int8 son técnicamente viables) |
| Idiomas soportados | No disponible (no tiene capacidades lingüísticas) |
| Licencia | BSD-3-Clause |
| Formato de pesos | `safetensors` (checkpoint de inicialización) + `model.py`, `config.json`, `training_args.json` |

## Arquitectura y entrenamiento

La arquitectura declarada es EfficientFormer, una familia de transformers ligeros para visión que combina etapas convolucionales tempranas con bloques de atención eficiente. En esta implementación concreta la model card especifica atención de tipo *grouped query*, fusión de características mediante *gated fusion*, activación GELU y normalización LayerNorm. El repositorio se distribuye como implementación *custom*: no es cargable con APIs genéricas de `transformers` u otras librerías automáticas sin un adaptador explícito, y la vía prevista es ejecutar `python model.py --help` e inspeccionar el bloque `__main__` del script para el ejemplo de *smoke test*.

No hay entrenamiento. La model card es explícita: `model.safetensors` es un checkpoint de inicialización válido para pruebas de humo y **no** se presenta como un checkpoint entrenado con benchmarks. La receta de experimento por defecto usa el optimizador **Adafactor** con un *schedule* de tipo exponencial, valores que el autor describe como puntos de partida del script y no como evidencia de una ejecución completada. No se declaran tokens de entrenamiento, composición del dataset, ni fases de RLHF/DPO o ajuste supervisado. Tampoco se documentan innovaciones adicionales (decodificación especulativa, atención lineal, etc.) más allá de las elecciones de bloque citadas.

## Capacidades

- Clasificación de imágenes: es la tarea objetivo declarada por los tags (`classification`), pero el checkpoint no ha sido entrenado, por lo que la capacidad efectiva es nula hasta que se entrene.
- Ejecución de *smoke tests*: permite verificar que el grafo de cómputo, la carga de pesos y el *forward pass* funcionan sin errores.
- Punto de partida reproducible: `config.json` y `training_args.json` documentan la configuración de arquitectura y la receta de experimento.
- Atención *grouped query* y fusión con compuertas: bloques implementados y expuestos en el código, útiles para experimentación arquitectónica.
- *Tool calling* / *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (modelo sin componente lingüístico).
- Capacidades especiales (*thinking mode*, visión generativa, audio): no disponibles.

## Casos de uso

- Pruebas de humo en CI: ejecutar `python model.py` en un *job* de integración continua para detectar roturas en la definición del modelo, la serialización `safetensors` o los cambios de configuración antes de lanzar entrenamientos reales.
- Andamiaje de experimentos de visión: usar `config.json` y `training_args.json` como plantilla para arrancar *runs* con Adafactor y *schedule* exponencial sobre un dataset propio etiquetado.
- Prototipado de arquitectura: modificar los bloques de atención *grouped query* y de *gated fusion* para medir su impacto en coste computacional y precisión frente a una línea base convolucional de capacidad equivalente.
- Docencia y divulgación: ilustrar la estructura de un EfficientFormer en un entorno mínimo (49.600 parámetros, ~0,19 MB en fp32) que se ejecuta en CPU sin infraestructura.
- Calibración de *harnesses* de evaluación: disponer de un modelo de juguete para validar que el pipeline de métricas, *seeds* y registro de logs funciona antes de conectar modelos grandes.
- Verificación de compatibilidad de herramientas: comprobar que una versión nueva de PyTorch, de `safetensors` o del *loader* propio carga correctamente el checkpoint de inicialización.
- Baseline de capacidad mínima: servir como referencia inferior en comparativas de arquitectura, siempre que se entrene con la misma exposición de datos y presupuesto de ajuste que el resto de baselines.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente que no se reclama ninguna puntuación de benchmark y que el checkpoint no ha sido entrenado. Cualquier cifra de MMLU, HumanEval, GSM8K o ImageNet top-1 sería inaplicable o inventada en este contexto.

## Requisitos de hardware

- VRAM para inferencia: ~0,19 MB en fp32 (49.600 parámetros × 4 bytes); ~0,10 MB en bf16/fp16; ~0,05 MB en int8. El cuello de botella real es el *runtime* de PyTorch, no los pesos.
- GPU recomendadas: ninguna en particular; el modelo cabe holgadamente en cualquier GPU, incluida una GTX 1050 o una iGPU. Para *smoke tests* es suficiente con CPU.
- ¿Cabe en GPU de consumo? Sí, en todas; también en Raspberry Pi y entornos sin GPU.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI de forma directa (no es un modelo de lenguaje ni se distribuye en GGUF). La vía documentada es ejecutar `model.py` con PyTorch, o envolver el modelo en un adaptador propio para APIs de carga automática.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

Los valores de referencia de terceros son aproximados, proceden de conocimiento general y no han podido verificarse en la búsqueda web disponible; se incluyen solo como orientación de escala.

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chloemart/classification-2024 | 49.600 | Imagen (resolución no disponible) | Sin benchmarks; checkpoint sin entrenar | BSD-3-Clause | HuggingFace, 0 descargas |
| EfficientFormerV2-S0 (Snap) | ~3,5 M (aprox.) | Imagen 224×224 | ~76 % top-1 ImageNet (aprox., no verificado) | Apache-2.0 | Pesos entrenados publicados |
| MobileNetV3-Small | ~2,5 M (aprox.) | Imagen 224×224 | ~67,7 % top-1 ImageNet (aprox., no verificado) | Apache-2.0 | Amplia disponibilidad |
| ResNet-18 | ~11,7 M (aprox.) | Imagen 224×224 | ~69,8 % top-1 ImageNet (aprox., no verificado) | BSD-3-Clause / MIT según implementación | Muy extendido |
| DeiT-Tiny | ~5,7 M (aprox.) | Imagen 224×224 | ~72,2 % top-1 ImageNet (aprox., no verificado) | Apache-2.0 | Pesos entrenados publicados |

La comparación honesta es que este repositorio no es funcionalmente comparable a ninguno de ellos: es dos órdenes de magnitud más pequeño y carece de entrenamiento.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado. No clasifica nada de forma útil; su salida es esencialmente aleatoria.
- No ha sido auditado en robustez, equidad ni transferencia de dominio, tal y como reconoce la model card.
- No se declaran sesgos conocidos porque no hay datos de entrenamiento ni evaluación que analizar; cualquier uso en producción reproduce este vacío de garantías.
- Riesgo de alucinación: no aplica en el sentido de modelos generativos, pero sí existe riesgo de interpretar erróneamente las salidas como predicciones válidas.
- Inconsistencia documental: la etiqueta "base" no concuerda con los 49.600 parámetros reales del fichero `safetensors`; conviene tratarlo como configuración de juguete.
- No es cargable con APIs automáticas genéricas sin escribir un adaptador; esto rompe flujos de trabajo estándar basados en `AutoModel`.
- Licencia BSD-3-Clause: permisiva para uso comercial, pero obliga a conservar el aviso de copyright y la cláusula de no endorsamiento. Los términos de los datos externos que se usen para entrenarlo deben revisarse por separado.
- Ausencia total de benchmarks: no es posible estimar calidad, latencia ni throughput a partir de la información publicada.
- Repositorio con 0 descargas y 0 *likes*: sin validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/Chloemart/classification-2024
- Resultados de la búsqueda web: no se ha encontrado ningún enlace pertinente al modelo; las entradas devueltas corresponden a páginas de máquinas de coser (Darty, Boulanger, UFC-Que Choisir, meilleurs.fr, coudreetbroder.com) y se descartan por no guardar relación con el repositorio.
- Paper de EfficientFormer (referencia de la arquitectura, no enlazado en la información proporcionada): no disponible.
- Repositorio de código, demo o blog del autor: no disponible.
