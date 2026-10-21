# edwinsato/dino-demo

## Resumen

`edwinsato/dino-demo` es un prototipo de investigación publicado en HuggingFace por el usuario edwinsato bajo licencia Apache 2.0. Se presenta como una implementación propia de una arquitectura tipo DINO orientada a aprendizaje contrastivo (*Contrastive*), con atención de tipo *flash*, fusión *tucker*, activación *swish* y normalización *instancenorm*, según los metadatos de su `config.json`. El repositorio incluye el código del modelo (`model.py`), la configuración de arquitectura, una receta de entrenamiento por defecto (`training_args.json`) y un checkpoint de inicialización en `model.safetensors`.

El dato más relevante para cualquier evaluador es su tamaño real: 49.600 parámetros totales según el recuento de safetensors. Se trata, por tanto, de un modelo de juguete (*smoke test*), no de un modelo entrenado. La propia model card indica explícitamente que el checkpoint es «a valid initialization checkpoint for smoke tests» y que «no benchmark score is claimed in this repository». La etiqueta «large» que aparece en la tabla de arquitectura hace referencia a la escala declarada en la configuración generada, no a un modelo de gran tamaño en el sentido habitual del término.

Por tanto, la relevancia de esta ficha es acotada: sirve para documentar un artefacto de investigación reproducible y para advertir de que no debe confundirse con un modelo DINO/DINOv2 preentrenado utilizable en producción. No hay pesos entrenados, no hay métricas publicadas, no hay pipeline declarado y el repositorio acumula 0 descargas y 0 *likes* en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DINO (implementación propia orientada a aprendizaje contrastivo); atención *flash*, fusión *tucker*, activación *swish*, normalización *instancenorm* |
| Parámetros totales | 49.600 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la model card no documenta resolución de entrada ni ventana de contexto) |
| Tipos de cuantización | No disponible (solo se publica `model.safetensors` en precisión original; no hay variantes GGUF, AWQ, GPTQ ni ONNX) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`); código en `model.py` (PyTorch); configuración en `config.json`; receta en `training_args.json` |

Otros datos del repositorio: tamaño del repo 0.0 GB, 0 descargas, 0 *likes*, pipeline no declarado, creado y actualizado el 20 de octubre de 2026. Etiquetas: `safetensors`, `dino`, `pytorch`, `contrastive`, `license:apache-2.0`, `region:us`.

## Arquitectura y entrenamiento

La arquitectura declarada es DINO, la familia de auto-destilación sin etiquetas (*self-distillation with no labels*) popularizada para representación visual autosupervisada. Los metadatos añaden detalles atípicos respecto a las implementaciones de referencia: atención *flash*, un módulo de fusión *tucker* (descomposición tensorial, habitualmente usada para fusión multimodal o interacción de orden superior), activación *swish* (SiLU) y normalización por instancias (`instancenorm`) en lugar de LayerNorm. La escala declarada en la configuración es «large», en contradicción con los 49.600 parámetros reales del checkpoint, lo que refuerza la lectura de que se trata de una configuración generada automáticamente para pruebas.

En cuanto al entrenamiento, la receta por defecto usa el optimizador **novograd** con un esquema de *linear warmup*. La model card es explícita al respecto: son «starting values in the script, not evidence of a completed run». No se documenta número de tokens, composición del dataset, resolución de imagen, número de épocas, uso de RLHF/DPO ni ningún proceso de ajuste posterior. Tampoco se describe ninguna innovación técnica validada más allá de las elecciones arquitectónicas citadas. El propio autor recomienda, para cualquier evaluación significativa, entrenar todas las líneas base con la misma exposición de datos, presupuesto de ajuste y semillas aleatorias.

## Capacidades

- **No hay capacidades verificadas**: el checkpoint publicado es de inicialización, no entrenado, por lo que no codifica representaciones útiles aprendidas de datos.
- **Andamiaje ejecutable**: `model.py` contiene la definición del modelo y un punto de entrada ejecutable (`python model.py --help`) con un ejemplo de *smoke test* en el bloque `__main__`.
- **Aprendizaje contrastivo (declarado)**: la implementación está orientada a objetivos contrastivos, aunque sin entrenamiento completado no hay representaciones evaluables.
- **Carga mediante adaptador explícito**: al ser una implementación personalizada, las APIs genéricas de carga automática (`AutoModel`, `from_pretrained` estándar) requieren un adaptador antes de poder usarse.
- **Sin soporte de tool calling, agentes ni razonamiento multi-paso**: no es un modelo de lenguaje y no declara ninguna de estas capacidades.
- **Sin capacidades multilingües documentadas**: no se especifica ningún idioma ni tarea lingüística.
- **Sin modalidades adicionales declaradas**: no se documenta visión, audio ni *thinking mode*, más allá de la etiqueta genérica `dino`.

## Casos de uso

- **Prueba de humo (*smoke test*) de infraestructura**: cargar `model.safetensors` (49.600 parámetros, ~198 KB en fp32) para validar que el *pipeline* de serialización, versionado y despliegue de safetensors funciona antes de mover un checkpoint real.
- **Plantilla de implementación de arquitecturas contrastivas**: reutilizar `model.py` como esqueleto para experimentar con combinaciones de atención *flash*, fusión *tucker* y `instancenorm` en un entorno con coste computacional nulo.
- **Validación de arneses de evaluación**: usar el modelo como línea base de capacidad mínima para comprobar que un *harness* de benchmarks reporta correctamente y que las métricas no se disparan por artefactos del código.
- **Docencia y reproducción de experimentos**: ejemplo didáctico de estructura de repositorio (código + `config.json` + `training_args.json` + checkpoint) para cursos sobre autosupervisión y aprendizaje contrastivo.
- **Pruebas unitarias de código de carga**: verificar rutas de carga personalizada con adaptadores, dado que las APIs automáticas no funcionan directamente con esta implementación.
- **Comparación de recetas de optimización**: el par novograd + *linear warmup* puede replicarse sobre este esqueleto para estudiar estabilidad de entrenamiento en modelos de juguete antes de escalar.
- **Referencia negativa en auditorías**: documentar qué NO es un modelo listo para producción, útil en revisiones de dependencias y catálogos internos.

En ningún caso procede su uso en inferencia real, atención al cliente, generación de código ni ninguna tarea de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card lo declara de forma explícita: «No benchmark score is claimed in this repository». Solo se sugiere una guía de evaluación futura: conjunto de validación específico de la tarea, métrica reportada sobre al menos tres semillas y una línea base de capacidad equivalente.

| Benchmark | Resultado | Notas |
|---|---|---|
| MMLU | No disponible | No aplica: no es un modelo de lenguaje |
| HumanEval | No disponible | No aplica |
| GSM8K | No disponible | No aplica |
| Tareas contrastivas (p. ej. linear probe) | No disponible | El checkpoint no ha sido entrenado |

## Requisitos de hardware

- **VRAM estimada**: despreciable. 49.600 parámetros equivalen a ~198 KB en fp32 y ~99 KB en fp16; el *overhead* de PyTorch supera ampliamente el peso del modelo.
- **GPU recomendadas**: cualquier GPU, incluida una iGPU o incluso CPU. No requiere A100, H100 ni RTX 4090.
- **Compatibilidad con GPU de consumo**: sí, en cualquier modelo (RTX 20xx/30xx/40xx, GTX 10xx, Apple Silicon vía MPS).
- **Opciones de despliegue**: no hay integración documentada con vLLM, llama.cpp, Ollama, TGI ni similares; al ser una implementación personalizada, el despliegue se limita a ejecutar `model.py` directamente con PyTorch.
- **Latencia y throughput**: no disponibles como dato medido; por tamaño, la latencia estaría dominada por el arranque del intérprete y la carga del estado, no por el cómputo.
- **Almacenamiento**: < 1 MB para pesos y configuración.

## Comparativa con modelos similares

La comparación solo puede ser referencial: los modelos de la familia DINO/DINOv2 son pesos preentrenados con cientos de millones de parámetros (cifras aproximadas según su documentación pública), mientras que este repositorio es un esqueleto sin entrenar. Los recuentos de los comparables se indican como referencia de orden de magnitud, no como medición de este repositorio.

| Modelo | Parámetros | Contexto / entrada | Entrenado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `edwinsato/dino-demo` | 49.600 | No disponible | No (checkpoint de inicialización) | Apache 2.0 | HuggingFace, 0 descargas |
| DINOv2 ViT-S/14 (Meta) | ~21 M (aprox., doc. pública) | Imagen, resolución configurable | Sí, autosupervisado a gran escala | Apache 2.0 (código) / licencia propia para pesos | Pesos y código públicos |
| DINOv2 ViT-B/14 (Meta) | ~86 M (aprox., doc. pública) | Imagen | Sí | Ibídem | Público |
| DINO original (Meta) | ~21 M (ViT-S) a ~300 M (ViT-L) (aprox.) | Imagen | Sí | Licencia de investigación | Público |

Conclusión de la comparativa: no existe paridad funcional. Cualquier evaluación seria de representaciones contrastivas debería hacerse contra DINO/DINOv2 o alternativas como SimCLR o MoCo, no contra este prototipo.

## Limitaciones y advertencias

- **Checkpoint no entrenado**: el autor indica que «has not been trained or audited for robustness, fairness, or domain transfer». Cualquier uso como extractor de características producirá representaciones sin valor predictivo.
- **Discrepancia de escala**: la configuración declara escala «large» pero el checkpoint contiene 49.600 parámetros; no debe interpretarse la etiqueta como indicador de capacidad.
- **Sin auditoría de sesgos**: no se ha evaluado sesgo, robustez ni transferencia de dominio; no hay datos para estimarlo.
- **Riesgo de alucinación**: no aplica en sentido lingüístico, pero sí existe riesgo de interpretación errónea: un observador podría asumir que el repositorio contiene un modelo DINO funcional.
- **Sin idiomas ni contexto documentados**: imposibilita planificar su uso en cualquier tarea con requisitos de entrada definidos.
- **Carga no estándar**: requiere adaptador explícito; las APIs genéricas de HuggingFace fallarán o cargarán parcialmente.
- **Licencia**: Apache 2.0 permite uso comercial del artefacto, pero la propia model card advierte de revisar por separado los términos de los datos de origen si se usa con conjuntos externos. Sin datos de entrenamiento declarados, esa revisión no es posible hoy.
- **Sin mantenimiento ni tracción**: 0 descargas, 0 *likes*, repo de 0.0 GB; no hay evidencia de uso comunitario ni de soporte.
- **Resultados de búsqueda web no pertinentes**: las consultas devolvieron únicamente contenido sobre la serie de anime *DanMachi*, sin relación con este modelo; no se ha podido localizar documentación externa.

## Enlaces

- HuggingFace: https://huggingface.co/edwinsato/dino-demo
- No se han encontrado papers, blogs, repositorios ni demos adicionales en los resultados de búsqueda web proporcionados; las entradas devueltas corresponden a contenido no relacionado (*DanMachi*).
