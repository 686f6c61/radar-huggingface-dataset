# marcushou74/swin-t-baseline

## Resumen

`marcushou74/swin-t-baseline` es un repositorio experimental publicado por el usuario marcushou74 que contiene una implementación propia de una Swin Transformer en escala «nano» orientada a clasificación de imágenes. No se distribuye como modelo entrenado, sino como base de código acompañada de un `model.safetensors` que el propio autor describe explícitamente como un checkpoint de inicialización válido únicamente para pruebas de humo, no como un checkpoint con pesos entrenados ni evaluados.

La relevancia del repositorio es, por tanto, metodológica y de ingeniería: permite inspeccionar y modificar decisiones de arquitectura (atención multi-query, fusión mediante concat mlp, activación mish, normalización instancenorm) antes de comprometer recursos en un entrenamiento completo. El recuento real de parámetros del safetensors es de 24.832, muy por debajo de los aproximadamente 28 millones de una Swin-T estándar, lo que confirma que se trata de una configuración reducida de carácter experimental.

El repositorio no declara idiomas, no publica pipeline en HuggingFace, no reporta ninguna métrica de benchmark y advierte de que el checkpoint no ha sido auditado en robustez, equidad ni transferencia de dominio. Se publica bajo licencia BSD-3-Clause y su fecha de creación registrada es el 11 de septiembre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Swin T (transformer jerárquico de ventanas desplazadas), escala «nano», implementación propia |
| Parámetros totales | 24.832 (recuento real del `model.safetensors`, según HuggingFace) |
| Parámetros activos | no disponible (no es un modelo MoE; la model card no describe mezcla de expertos) |
| Longitud de contexto | no disponible (modelo de visión; la model card no declara resolución de entrada ni tamaño de ventana) |
| Tipos de cuantización | no disponibles (solo se publica `model.safetensors`; no hay variantes GGUF, int8 ni fp16 documentadas) |
| Idiomas soportados | no disponibles (modelo de clasificación de imágenes; no se declaran idiomas) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors, acompañado de `model.py`, `config.json` y `training_args.json` |
| Atención | multi query (según la model card) |
| Fusión | concat mlp |
| Activación | mish |
| Normalización | instancenorm |
| Pipeline declarado | no disponible |
| Descargas / likes en HuggingFace | 0 / 0 |
| Tamaño del repositorio | 0.0 GB (según HuggingFace) |
| Fecha de creación | 2026-09-11 |

## Arquitectura y entrenamiento

La arquitectura declarada es Swin T, es decir, un transformer de visión jerárquico basado en atención dentro de ventanas locales con desplazamiento entre bloques. Sobre esa base, el autor introduce varias desviaciones respecto a la implementación canónica: atención de tipo multi-query, fusión mediante concat mlp, función de activación mish y normalización por instancias (instancenorm) en lugar de la normalización habitual en este tipo de redes. La model card clasifica la escala como «nano» y señala que la configuración se mantiene deliberadamente manejable para poder inspeccionar cambios de arquitectura antes de lanzar un entrenamiento completo.

En cuanto al entrenamiento, no hay ninguno completado que respalde el repositorio. La receta por defecto incluida en `training_args.json` usa el optimizador AdamW con un schedule de tipo onecycle, pero el propio autor aclara que son valores de partida del script y no evidencia de una ejecución finalizada. No se documenta número de tokens ni de imágenes, composición del dataset, ni fases de RLHF, DPO o ajuste por preferencias. Tampoco se declara ninguna innovación técnica adicional más allá de las variaciones arquitectónicas citadas, ni técnicas de inferencia como decodificación especulativa (no aplicables a un modelo de clasificación).

## Capacidades

- Clasificación de imágenes: es la tarea declarada del código (`classification`), pero el checkpoint incluido no está entrenado, por lo que no hay ninguna capacidad de clasificación demostrada ni medible.
- Punto de partida arquitectónico: el repositorio define la red completa en `model.py` con su configuración en `config.json`, lo que permite modificarla y reentrenarla.
- Pruebas de humo: el safetensors sirve para verificar que la carga de pesos y la inicialización funcionan antes de invertir en cómputo de entrenamiento.
- Serialización en safetensors: el checkpoint se distribuye en este formato, apto para smoke tests y para pipelines que ya trabajen con safetensors.
- Ejemplo ejecutable: el bloque `__main__` del script incluye un ejemplo de prueba generado, invocable mediante `python model.py --help`.
- Tool calling / function calling: no disponible; no es una capacidad propia de un modelo de clasificación de imágenes.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el modelo no procesa texto.
- Capacidades especiales (modo thinking, visión generativa, audio): no disponibles; se trata de un clasificador visual, no de un modelo generativo multimodal.
- Carga mediante APIs automáticas: requiere un adaptador explícito, ya que la implementación es personalizada y no sigue las interfaces genéricas de carga.

## Casos de uso

- Exploración de variantes arquitectónicas en visión por computador: el repositorio permite sustituir componentes concretos (atención multi-query, fusión concat mlp, activación mish, instancenorm) y comprobar que el grafo se construye y ejecuta correctamente antes de escalar a un entrenamiento completo con presupuesto real.
- Fine-tuning en clasificación de imágenes de dominio específico: una vez entrenado, el código serviría como base para ajustar un clasificador sobre un conjunto etiquetado propio; el autor recomienda evaluar con una partición etiquetada específica de la tarea y reportar la métrica sobre al menos tres semillas.
- Baseline de capacidad reducida en experimentos controlados: la escala «nano» lo hace adecuado como contrapunto de baja capacidad frente a modelos mayores, siempre que todos los baselines se entrenen con la misma exposición de datos, presupuesto de ajuste y semillas aleatorias, tal como indica la model card.
- Verificación de pipelines de carga de safetensors en CI: al ser un checkpoint de inicialización, puede integrarse en pruebas automáticas que comprueben que `config.json`, `training_args.json` y `model.safetensors` se cargan correctamente tras cambios en el código.
- Material docente y de estudio de transformers jerárquicos: el script único con bloque `__main__` facilita explicar cómo se ensambla un Swin Transformer y qué efecto tienen las decisiones de atención, fusión y normalización.
- Reproducibilidad y trazabilidad de experimentos: el repositorio conserva de forma separada la configuración de arquitectura y la receta de entrenamiento, lo que permite registrar versiones de entorno y logs junto a cualquier resultado futuro publicado.
- Base para un adaptador de carga personalizado: dado que las APIs genéricas de carga automática no funcionan directamente, el repositorio sirve como punto de partida para escribir el adaptador necesario en un framework propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card indica de forma explícita que no se reclama ninguna puntuación de benchmark y que `model.safetensors` es un checkpoint de inicialización para pruebas de humo, no un checkpoint entrenado. No se dispone de cifras de ImageNet, MMLU, HumanEval, GSM8K ni de ninguna otra métrica, ni de comparaciones numéricas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: con los 24.832 parámetros reportados por safetensors, un checkpoint en fp32 ocuparía del orden de 0,1 MB, por lo que la inferencia cabría en CPU y en cualquier GPU (estimación aritmética sobre el recuento de parámetros, no verificada en el repositorio).
- VRAM si se entrena una configuración Swin-T completa: una Swin-T canónica ronda los 28 millones de parámetros; en ese escenario, la inferencia en precisión reducida requeriría bastante menos de 1 GB de VRAM y el ajuste fino con AdamW entraría con holgura en GPUs de consumo (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no disponible; el repositorio no especifica hardware. Para el tamaño publicado, cualquier GPU o incluso CPU es suficiente; para una Swin-T completa, una GPU de consumo de gama media o superior sería suficiente para inferencia y ajuste con lotes moderados.
- Compatibilidad con GPU de consumo: sí para el checkpoint publicado, dado su tamaño (24.832 parámetros); para una configuración Swin-T completa se mantendría dentro del rango de GPUs de consumo, aunque sin cifras verificadas.
- Opciones de despliegue: no aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje ni un clasificador con pipeline declarado. El punto de entrada es el propio script `model.py`, y cualquier integración en frameworks de carga automática requiere un adaptador explícito.
- Latencia y throughput estimados: no disponibles; no se publican mediciones de latencia, throughput ni rendimiento por lote.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Entrada / tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| marcushou74/swin-t-baseline | Swin T «nano» experimental (multi-query, concat mlp, mish, instancenorm) | 24.832 (según safetensors) | Clasificación de imágenes; resolución no declarada | BSD-3-Clause | Repositorio HuggingFace, 0 descargas, checkpoint sin entrenar |
| microsoft/swin-tiny-patch4-window7-224 | Swin Transformer tiny canónica | Aproximadamente 28 millones (referencia general de la arquitectura) | Clasificación de imágenes a 224×224 sobre ImageNet-1k | no disponible en la información recopilada | Modelo ampliamente distribuido en HuggingFace |
| facebook/deit-tiny-patch16-224 | Vision transformer plano (sin jerarquía de ventanas) | Aproximadamente 5,7 millones (referencia general de la arquitectura) | Clasificación de imágenes a 224×224 sobre ImageNet-1k | no disponible en la información recopilada | Modelo ampliamente distribuido en HuggingFace |
| ResNet-50 (por ejemplo, timm/resnet50.a1_in1k) | CNN residual | Aproximadamente 25,6 millones (referencia general de la arquitectura) | Clasificación de imágenes a 224×224 sobre ImageNet-1k | no disponible en la información recopilada | Ampliamente distribuido en HuggingFace y timm |

Nota: los parámetros de los modelos comparativos corresponden a valores de referencia generales de cada arquitectura y no proceden de la información recopilada en esta búsqueda. No se dispone de comparaciones de rendimiento entre este repositorio y los modelos citados, ya que el checkpoint publicado no está entrenado ni evaluado.

## Limitaciones y advertencias

- El checkpoint no está entrenado: `model.safetensors` es una inicialización para pruebas de humo, no un modelo utilizable en producción.
- No hay ninguna métrica de benchmark ni evaluación publicada; cualquier afirmación de rendimiento sería infundada.
- El checkpoint no ha sido auditado en robustez, equidad ni transferencia de dominio, según reconoce el propio autor.
- Sesgos conocidos: no disponibles; al no haber entrenamiento ni dataset documentado, no se puede caracterizar ningún sesgo.
- Riesgo de alucinación: no aplicable en sentido estricto (clasificación de imágenes), pero sí existe riesgo de predicciones arbitrarias si se usa el checkpoint sin entrenar.
- Idiomas soportados: no disponibles; el modelo no procesa texto.
- Limitaciones de contexto: no disponible la resolución de entrada ni el tamaño de ventana de atención soportados.
- Restricciones de licencia: BSD-3-Clause permite uso comercial y modificación siempre que se conserven el aviso de copyright y la cláusula de exención de responsabilidad, y que no se use el nombre del titular para promocionar derivados sin permiso. El autor recomienda revisar por separado los términos de los datos de origen cuando se use con conjuntos de datos externos.
- Integración: al ser una implementación personalizada, las APIs genéricas de carga automática requieren un adaptador explícito; `python model.py --help` es la vía de comprobación indicada.
- Advertencia sobre resultados futuros: la model card exige que los resultados de cualquier checkpoint futuro entrenado se documenten de forma separada de los valores por defecto incluidos en este repositorio.
- Estado del repositorio: sin descargas ni interacciones registradas, con un tamaño reportado de 0.0 GB y sin pipeline declarado, lo que limita su uso inmediato con herramientas estándar.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/marcushou74/swin-t-baseline
- No se han encontrado enlaces relevantes en la búsqueda web: los resultados devueltos no guardan relación con el modelo ni con Swin Transformer.
