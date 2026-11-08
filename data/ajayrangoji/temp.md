# AjayRangoji/temp

## Resumen

`AjayRangoji/temp` es un repositorio de Hugging Face que contiene un adaptador LoRA entrenado sobre el modelo base `unsloth/Qwen3.8-27B-unsloth-bnb-4bit`. No se trata de un modelo completo, sino de un artefacto de entrenamiento publicado como instantánea de un experimento de ajuste fino con Unsloth. El autor, Ajay Rangoji, es investigador en LLM y GenAI en el IIT Bombay y en la iniciativa BharatGen, según su página personal.

El repositorio documenta el resultado de un entrenamiento que finalizó correctamente el 8 de noviembre de 2026, con parada temprana en el paso 1500 de un máximo de 3615 (aproximadamente 2,07 épocas). El mejor checkpoint se alcanzó en el paso 1000, con una pérdida de validación de 0,9374, mientras que el entrenamiento posterior se volvió inestable y terminó con una pérdida de validación de 11,0196. El adaptador final guardado se restauró desde el checkpoint 1000.

La relevancia de este artefacto es limitada para uso en producción: no se ha evaluado la calidad de generación, el modelo base no se incluye y la licencia no está especificada. Su interés principal es documental, como registro reproducible de un experimento de ajuste fino con LoRA sobre una variante de Qwen de 27B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre modelo base transformer; arquitectura del base no disponible |
| Parametros totales | no disponible (el adaptador LoRA es un subconjunto del base de 27B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el entrenamiento usó contenido limitado a 1730 tokens) |
| Tipos de cuantizacion | no disponible (el base referenciado es bnb-4bit) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con la librería PEFT y el framework Unsloth sobre el modelo base `unsloth/Qwen3.8-27B-unsloth-bnb-4bit`, una variante cuantizada a 4 bits del Qwen3.8-27B. No se dispone de información sobre la arquitectura interna del base (número de capas, dimensiones, mecanismo de atención). El entrenamiento se realizó en una sola GPU con microbatch de 8 y acumulación de gradientes de 4, resultando en un tamaño de lote efectivo de 32.

El conjunto de datos elegible consta de 23122 ejemplos de entrenamiento y 2892 de validación. El contenido de entrenamiento se limitó a 1730 tokens, con relleno a múltiplos de ocho y sin empaquetado de secuencias. Se aplicó enmascaramiento de respuestas (response masking) según el script `project/train_qwen38-3S.py`. El entrenamiento usó parada temprana tras cinco comprobaciones de validación sin mejora. La extensión `causal-conv1d` 1.7.0 se compiló localmente con CUDA 11.8 y glibc 2.31, lo que implica que el adaptador puede requerir recompilación en otros entornos. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- No se han evaluado las capacidades del adaptador resultante; la model card indica explícitamente que la calidad de generación no ha sido evaluada.
- Al estar basado en Qwen3.8-27B, heredaría potencialmente las capacidades del modelo base (generación de texto, razonamiento, código), pero no hay confirmación documentada en la información disponible.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Reproducción de experimentos de ajuste fino: el repositorio incluye configuración de ejecución, registros de TensorBoard, scripts y hashes SHA-256, lo que permite auditar y reproducir el entrenamiento en un entorno equivalente.
- Investigación sobre estabilidad del entrenamiento: la documentación de la divergencia entre el paso 1000 y el 1500 (pérdida de 0,94 a 11,02) sirve como caso de estudio sobre parada temprana y sobreajuste.
- Punto de partida para ajustes posteriores: el adaptador del checkpoint 1000 puede servir como inicialización para nuevos experimentos sobre el mismo modelo base.
- Docencia y formación: el material del repositorio (CSV de entrenamiento, scripts, notas de ejecución) es útil para ilustrar un flujo completo de ajuste fino con LoRA y Unsloth.
- Diagnóstico de checkpoints: los checkpoints de recuperación de los pasos 1490 y 1500 permiten analizar el comportamiento del optimizador y del scheduler en fases inestables.
- Auditoría de artefactos: el `MANIFEST.json` con hashes SHA-256 y tamaños permite verificar la integridad de los archivos publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica documentada es la pérdida de validación: 0,9373613595962524 en el paso 1000 (mejor checkpoint) y 11,019561767578125 al final del entrenamiento.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa aproximadamente 3,0 GB (tamaño del repositorio), pero requiere cargar el modelo base `unsloth/Qwen3.8-27B-unsloth-bnb-4bit` para la inferencia.
- VRAM estimada para inferencia: no disponible; depende de la cuantización del base (el base referenciado está en 4 bits, lo que reduciría los requisitos respecto a FP16).
- GPU recomendadas: no disponible; el entrenamiento se realizó en una sola GPU con microbatch 8 y acumulación 4, pero no se especifica el modelo de GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: PEFT para carga del adaptador; el resto de opciones (vLLM, llama.cpp, Ollama, TGI) no están documentadas para este artefacto.
- Latencia y throughput: no disponibles.
- Nota de entorno: la extensión `causal-conv1d` 1.7.0 se compiló con CUDA 11.8 y glibc 2.31; es necesario compilar una extensión adecuada para el entorno de destino.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre adaptadores LoRA comparables ni sobre el rendimiento del modelo base frente a alternativas.

## Limitaciones y advertencias

- La calidad de generación del adaptador no ha sido evaluada; no hay garantía de que produzca resultados útiles.
- El entrenamiento se volvió inestable tras el paso 1000; el adaptador final se restauró desde ese checkpoint, pero los checkpoints posteriores presentan pérdidas de validación muy elevadas.
- No se incluye el modelo base; es necesario descargarlo por separado desde `unsloth/Qwen3.8-27B-unsloth-bnb-4bit`.
- La licencia no está especificada, lo que impide determinar las restricciones de uso comercial.
- No se documentan sesgos conocidos ni riesgos de alucinación específicos; al no haberse evaluado, se aplican los riesgos generales de los modelos de lenguaje.
- El contenido de entrenamiento se limitó a 1730 tokens, lo que puede limitar el rendimiento en tareas que requieran contextos más largos.
- El script `project/run_training.sh` inicia un supervisor que termina procesos de cómputo competidores en la GPU 2; debe revisarse antes de usarlo en otro servidor.
- Las rutas e identificadores de GPU de los lanzadores originales son específicos del servidor de origen.
- La extensión `causal-conv1d` compilada localmente puede no ser compatible con otros entornos sin recompilación.
- El repositorio tiene 0 descargas y 0 likes, sin señales de validación por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AjayRangoji/temp
- Perfil del autor en Hugging Face: https://huggingface.co/AjayRangoji
- Página personal del autor (IIT Bombay): https://www.cse.iitb.ac.in/~ajayrangoji/
- Modelo base: https://huggingface.co/unsloth/Qwen3.8-27B-unsloth-bnb-4bit
