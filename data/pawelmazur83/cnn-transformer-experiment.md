# pawelmazur83/cnn-transformer-experiment

## Resumen

`pawelmazur83/cnn-transformer-experiment` es un prototipo de investigación publicado en HuggingFace por el usuario pawelmazur83. Se trata de una implementación propia de una arquitectura híbrida denominada "Cnn Transformer" orientada a tareas de clasificación. El repositorio no contiene un modelo entrenado, sino un *checkpoint* de inicialización válido únicamente para pruebas de humo (*smoke tests*), tal y como declara explícitamente su model card.

El modelo es extremadamente pequeño: 24.832 parámetros totales según el fichero `model.safetensors`, lo que lo sitúa varios órdenes de magnitud por debajo de cualquier modelo de lenguaje o de visión moderno. La arquitectura combina mecanismos convolucionales con atención *multi-query*, fusión mediante descomposición de Tucker, activación GELU y normalización RMSNorm. El tamaño del repositorio es de 0,0 GB (menos de 100 KB en pesos), lo que confirma su carácter experimental.

Su relevancia es limitada y puramente metodológica: sirve como plantilla reproducible para experimentar con hibridaciones CNN-transformer, no como herramienta de producción. No se reclama ninguna métrica de rendimiento, no se documentan datos de entrenamiento y no consta ningún proceso de ajuste (RLHF, DPO o similar). Cualquier evaluación seria requeriría entrenar el modelo desde cero sobre un conjunto etiquetado específico de la tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN Transformer (hibrida convolucional + atencion) |
| Parametros totales | 24.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), con configuracion en `config.json` |

Detalles adicionales declarados en la model card: atención *multi query*, fusión *tucker*, activación GELU, normalización RMSNorm, escala "base".

## Arquitectura y entrenamiento

La arquitectura es una hibridación de capas convolucionales y bloques de atención transformer. Según la model card, emplea atención *multi-query* (un solo conjunto de claves y valores compartido entre cabezas, lo que reduce coste de memoria en inferencia), fusión de características mediante descomposición de Tucker (habitualmente usada para combinar modalidades o ramas de forma paramétricamente eficiente), activación GELU y normalización RMSNorm en lugar de LayerNorm. No se especifica el número de capas, dimensiones ocultas, número de cabezas ni el tamaño de los kernels convolucionales; esos datos podrían extraerse de `config.json`, pero no se proporcionan en la información disponible.

No hay evidencia de entrenamiento. El autor indica que `model.safetensors` es un *checkpoint* de inicialización válido para *smoke tests* y que no debe presentarse como un modelo entrenado con benchmarks. La receta por defecto incluida en `training_args.json` usa el optimizador Adam con un esquema de *linear warmup*, pero el propio autor advierte que son valores de partida del script y no evidencia de una ejecución completada. No se documentan número de tokens, composición del dataset, ni fases de alineación (RLHF, DPO, SFT). Tampoco se describe ninguna innovación técnica validada empíricamente.

## Capacidades

- No se ha demostrado ninguna capacidad funcional: el checkpoint está sin entrenar.
- Clasificación: es la tarea declarada por los tags y el título, pero no hay cabecera de clasificación documentada ni número de clases especificado.
- Generación de texto: no aplica, no es un modelo de lenguaje.
- Razonamiento, matemáticas y código: no disponible.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: no disponible.
- Visión, audio o modo *thinking*: no disponible.
- Carga mediante APIs genéricas: el autor advierte que, al ser una implementación personalizada, requiere un adaptador explícito antes de usar `from_pretrained` u otras interfaces automáticas.

## Casos de uso

- Pruebas de humo (*smoke tests*) de infraestructura: sirve para verificar que un pipeline de carga de safetensors, un entorno PyTorch o un runner de CI funcionan correctamente con un modelo diminuto de 24.832 parámetros.
- Plantilla de investigación para arquitecturas híbridas CNN-transformer: el código de `predict.py` y `config.json` pueden reutilizarse como punto de partida para experimentar con fusión Tucker y atención multi-query.
- Reproducción de experimentos académicos: útil como esqueleto para comparar una fusión convolucional frente a un transformer puro con idéntico presupuesto de parámetros y misma exposición de datos.
- Docencia y formación: ejemplo mínimo y ejecutable de cómo estructurar un repositorio de modelo en HuggingFace (config, training_args, pesos, script de inferencia).
- Validación de recetas de entrenamiento: `training_args.json` define Adam con *linear warmup*, lo que permite probar schedulers y comparativas de semillas antes de escalar a modelos mayores.
- Benchmarking de eficiencia de implementaciones: al tener un tamaño despreciable, permite medir sobrecarga de *framework* (PyTorch vs. TorchScript vs. ONNX) sin que el coste computacional del modelo contamine la medición.
- No es adecuado para ninguno de los casos de uso típicos de clasificación en producción (moderación de contenido, detección de spam, clasificación de imágenes o texto reales), ya que carece de entrenamiento y de métricas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma explícitamente que no se reclama ninguna puntuación de benchmark y que el checkpoint no ha sido entrenado ni auditado. La única orientación de evaluación que ofrece el autor es metodológica: usar una partición etiquetada específica de la tarea, reportar la métrica correspondiente sobre al menos tres semillas y comparar contra una línea base de capacidad equivalente (mismo número de parámetros, mismos datos, mismo presupuesto de ajuste).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 100 KB en fp32 (24.832 parámetros × 4 bytes), más el coste de activaciones, que es despreciable. Menos de 1 MB en cualquier precisión habitual.
- GPU recomendadas: ninguna en concreto; el modelo cabe holgadamente en cualquier GPU, incluidos iGPU y aceleradores embebidos.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo de las últimas dos décadas, así como en CPU (recomendado dado el tamaño).
- Opciones de despliegue: llama.cpp, vLLM, TGI y Ollama no aplican, ya que no es un modelo de lenguaje ni publica pesos en GGUF. El despliegue natural es un script PyTorch propio (`predict.py`), con exportación opcional a TorchScript u ONNX.
- Latencia y throughput: no disponible, y en la práctica estará dominado por la sobrecarga del *framework*, no por el cómputo del modelo.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables, y el repositorio no ofrece métricas que permitan situarlo frente a alternativas. Como referencia metodológica, la comparación correcta sería contra una CNN pura y un transformer puro de capacidad equivalente (mismo número de parámetros) entrenados con los mismos datos, semillas y presupuesto de ajuste, tal y como sugiere el propio autor. Sin esos experimentos, cualquier comparación cuantitativa sería especulativa.

## Limitaciones y advertencias

- El checkpoint no está entrenado: sus salidas son esencialmente aleatorias y no deben interpretarse como predicciones.
- No ha sido auditado en robustez, equidad ni transferencia de dominio, según reconoce el autor.
- Sin datos de entrenamiento documentados, no es posible evaluar sesgos, cobertura lingüística ni dominios de aplicación.
- No se especifican la longitud de contexto, el número de clases de salida ni las dimensiones internas en la información disponible; habría que inspeccionar `config.json`.
- Implementación personalizada: `from_pretrained` y otras APIs automáticas requieren un adaptador explícito, lo que añade fricción de integración.
- Licencia apache-2.0: permite uso comercial y modificación con atribución, pero el autor advierte de que deben revisarse por separado los términos de los datos de origen si se usa con conjuntos externos.
- La fecha de creación del repositorio figura como 2026-10-10, posterior a la fecha actual; conviene verificar la integridad y procedencia del artefacto antes de cualquier uso.
- La búsqueda web realizada no devolvió ningún resultado técnico relevante sobre este modelo; los resultados obtenidos eran contenido no relacionado y sin valor documental.
- Con 13 descargas y 0 *likes*, no existe validación alguna por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/pawelmazur83/cnn-transformer-experiment
- Paper, blog, repositorio o demo adicionales: no disponible (la búsqueda web no arrojó resultados técnicos relacionados con el modelo).
