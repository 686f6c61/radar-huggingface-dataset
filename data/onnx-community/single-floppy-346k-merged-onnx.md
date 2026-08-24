# onnx-community/single-floppy-346k-merged-ONNX

## Resumen

El modelo `onnx-community/single-floppy-346k-merged-ONNX` es una conversión automática a formato ONNX del modelo original `NILKNARFGonzo/single-floppy-346k-merged`, un transformer decoder-only basado en la arquitectura GPT-2 con tan solo 346.104 parámetros. Fue entrenado desde cero en una Raspberry Pi 5 (CPU únicamente) durante aproximadamente una hora, sobre un subconjunto aleatorio del dataset Capybara ShareGPT de 1,36 MB. El resultado es un modelo de prueba de concepto que cabe en un disquete de 3,5 pulgadas y que, según su propio autor, produce texto sin sentido. La versión ONNX, publicada por la comunidad `onnx-community`, permite ejecutarlo en navegador mediante Transformers.js, lo que lo convierte en un ejemplo extremo de despliegue de modelos de lenguaje en entornos con recursos mínimos.

Su relevancia radica en demostrar que es posible entrenar un modelo de lenguaje funcional (aunque de calidad muy limitada) en hardware de bajo coste y con un presupuesto de datos ínfimo, así como en servir de banco de pruebas para flujos de conversión a ONNX y ejecución en el lado del cliente. No está pensado para uso productivo, sino como experimento educativo y demostración técnica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (decoder-only Transformer) |
| Parametros totales | 346.104 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No disponible (formato ONNX estándar) |
| Idiomas soportados | Inglés (en) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX (archivo .onnx) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 con 2 capas transformer, dimensión de embedding de 92, 2 cabezas de atención y un vocabulario de 502 tokens mediante tokenizador byte-level BPE con embeddings atados. El contexto máximo es de 1024 posiciones. El entrenamiento se realizó con Oobabooga TextGen WebUI sobre Transformers y PEFT, empleando LoRA (rank 8, alpha 16) dirigido a todas las capas lineales, optimizador AdamW de 8 bits, tasa de aprendizaje 2e-4 con scheduler lineal y 20 pasos de calentamiento, batch size 4 y 5 épocas. El dataset fue un subconjunto aleatorio de Capybara ShareGPT (1,36 MB) en formato JSON con campo `"text"`. La pérdida final se detuvo en aproximadamente 6,0 debido al límite de parámetros. El hardware fue una Raspberry Pi 5 con 8 GB de RAM, solo CPU, y el tiempo total de entrenamiento fue de alrededor de 1 hora.

## Capacidades

- Generación de texto conversacional en inglés, siguiendo un formato de chat específico con `### User:` y `### Assistant:`.
- Capacidad de completar secuencias de texto con una ventana de contexto de 1024 tokens.
- Ejecución en navegador gracias a Transformers.js y al formato ONNX.
- No dispone de tool calling, ni capacidades multimodales, ni razonamiento avanzado.
- El autor advierte explícitamente que el modelo produce "nonsense" (texto sin sentido), por lo que su utilidad práctica es muy limitada.

## Casos de uso

- Demostración educativa de entrenamiento de modelos de lenguaje en hardware de bajo coste: permite mostrar a estudiantes cómo se entrena un transformer desde cero en una Raspberry Pi, con un presupuesto de datos y tiempo reducidos.
- Prueba de concepto de despliegue en navegador: al ser ONNX, puede cargarse con Transformers.js en una página web para ilustrar la inferencia local sin servidor, incluso en dispositivos móviles.
- Ejemplo de conversión automática de modelos a ONNX: sirve como caso de estudio para el flujo de conversión mediante el espacio de Hugging Face `onnx-community/convert-to-onnx`.
- Benchmarking de inferencia en entornos con recursos mínimos: su tamaño diminuto permite medir latencia y consumo en CPUs ARM, microcontroladores o navegadores, estableciendo una línea base para modelos más grandes.
- Estudio de técnicas de compresión y cuantización: al ser un modelo tan pequeño, es útil para experimentar con cuantización dinámica o estática y observar el impacto en la calidad de salida.
- Generación de texto aleatorio con fines artísticos o de humor: su salida incoherente puede emplearse en proyectos creativos que busquen un generador de texto surrealista o como material para memes.
- Validación de pipelines de CI/CD para modelos ONNX: permite probar la integración de un modelo en un flujo de integración continua, verificando la carga, inferencia y exportación sin coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 0 MB (inferencia en CPU, sin necesidad de GPU).
- GPU recomendada: ninguna; funciona en cualquier CPU, incluidas ARM como la Raspberry Pi.
- Cabe en cualquier dispositivo con al menos 2 MB de memoria libre para el modelo en FP32 (1,32 MB).
- Opciones de despliegue: Transformers.js (navegador), ONNX Runtime (Python, C++, etc.), llama.cpp (con conversión a GGUF), o cualquier runtime compatible con ONNX.
- Latencia y throughput: no se han publicado mediciones, pero al ser un modelo de 346K parámetros, la generación de tokens debería ser del orden de milisegundos en CPU modernas.

## Comparativa con modelos similares

No se dispone de modelos comparables de tamaño similar (346K parámetros) en el ecosistema actual. Los modelos GPT-2 más pequeños suelen tener 124M de parámetros, tres órdenes de magnitud mayores. Por tanto, no es posible establecer una comparativa directa con alternativas de la misma categoría. Se indica "no disponible".

## Limitaciones y advertencias

- El propio autor advierte que el modelo produce texto sin sentido ("This thing still produces nonsense"), por lo que no es apto para tareas que requieran coherencia o precisión.
- Entrenado con un dataset extremadamente pequeño (1,36 MB) y solo 5 épocas, con una pérdida final de ~6,0, lo que indica un ajuste deficiente.
- Vocabulario limitado a 502 tokens, lo que restringe la expresividad y la cobertura léxica.
- Solo soporta inglés; no hay capacidades multilingües.
- La licencia CC-BY-SA-4.0 permite uso comercial, pero exige atribución y la distribución de obras derivadas bajo la misma licencia. Debe revisarse su compatibilidad con proyectos propietarios.
- No se han documentado sesgos específicos, pero al derivar de un subconjunto de Capybara ShareGPT, podría heredar sesgos presentes en ese dataset.
- No recomendado para producción ni para aplicaciones que requieran fiabilidad.

## Enlaces

- Modelo ONNX en Hugging Face: https://huggingface.co/onnx-community/single-floppy-346k-merged-ONNX
- Modelo original: https://huggingface.co/NILKNARFGonzo/single-floppy-346k-merged
- Discusión en Hugging Face: https://huggingface.co/onnx-community/single-floppy-346k-merged-ONNX/discussions/1
- Ficha en LLM Explorer: https://llm-explorer.com/model/NILKNARFGonzo%2Fsingle-floppy-346k-merged,6TiPWKRqLOupBx1A5nG4jK
- ONNX Model Zoo (referencia general): https://github.com/onnx/models
- Repositorio ONNX: https://github.com/onnx/onnx/tree/main
