# S128hj/minifold-models

## Resumen

MiniFold Models es un repositorio de modelos ONNX publicados por el usuario S128hj en Hugging Face, pensados para la inferencia de predicción de estructura de proteínas directamente en el navegador. El paquete incluye tres artefactos: una exportación cuantizada a int8 del modelo de lenguaje ESM-2 150M de Meta AI (licencia MIT) con una cabeza de características propia de MiniFold, un modelo para proteínas pequeñas (30-80 aminoácidos) y un modelo general. No se trata de un modelo de lenguaje generativo, sino de una colección de pesos orientados a una tarea científica concreta: predecir estructura proteica a partir de secuencia.

El repositorio sirve de backend al sitio estático MiniFold alojado como Space en Hugging Face, y su relevancia radica en la ejecución íntegra en cliente (navegador) mediante ONNX Runtime Web, sin necesidad de GPU servidor. El autor declara explícitamente que son modelos educativos y de investigación, y que no son AlphaFold. El tamaño total del repositorio es de 0,2 GB, con licencia MIT y sin métricas de adopción (0 descargas, 0 likes en el momento de la consulta).

La información disponible es escasa: no hay pipeline declarado, no se especifican idiomas (no aplica realmente, al ser un modelo de proteínas), y no se publican resultados de benchmarks ni detalles de entrenamiento más allá de la procedencia de ESM-2 y de la existencia de una iteración de recycling en los modelos MiniFold.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ESM-2 150M (transformer) exportado a ONNX con cabeza de características MiniFold; modelos MiniFold propios (arquitectura no detallada) |
| Parametros totales | 150M en el componente ESM-2; no disponible para minifold_small y minifold_general |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la entrada es `tokens` de forma [1, L+2], donde L es la longitud de la secuencia proteica) |
| Tipos de cuantizacion | int8 dinámica (para `esm2_150m.int8.onnx`); no disponible para el resto |
| Idiomas soportados | no aplica (modelo de secuencias de proteínas; alfabeto ESM) |
| Licencia | MIT |
| Formato de pesos | ONNX (`.onnx`), con `meta.json` de configuración y alfabeto ESM |

## Arquitectura y entrenamiento

El componente principal es ESM-2 150M de Meta AI, un transformer de proteínas con 150 millones de parámetros, exportado a ONNX e incrementado con una cabeza de características específica de MiniFold. La entrada son tokens del alfabeto ESM con forma [1, L+2] (dos tokens adicionales de contexto/BOS-EOS) y produce dos salidas: `single` con forma [L, 640] (representaciones por residuo) y `pair` con forma [L, L, 16] (representaciones por par de residuos). Esta combinación de representaciones single y pair es la habitual en arquitecturas de predicción de estructura tipo AlphaFold, donde la atención sobre pares alimenta el módulo de estructura.

Los modelos `minifold_small.onnx` (proteínas de 30-80 aminoácidos) y `minifold_general.onnx` realizan una única iteración de recycling, un mecanismo tomado de AlphaFold en el que la estructura predicha se realimenta como entrada para refinar la predicción. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de ajuste fino con RLHF/DPO (poco probable en este dominio). La cuantización int8 dinámica del componente ESM-2 busca reducir el peso y acelerar la inferencia en CPU/navegador, a costa de una posible pérdida de precisión no cuantificada en la documentación.

## Capacidades

- Predicción de estructura de proteínas a partir de secuencia de aminoácidos, con salidas de representaciones por residuo y por par.
- Extracción de embeddings de proteínas: la salida `single` [L, 640] puede reutilizarse como representación por residuo para tareas downstream.
- Modelo especializado en proteínas pequeñas (30-80 aa) mediante `minifold_small.onnx`.
- Modelo de propósito general mediante `minifold_general.onnx`, con una iteración de recycling.
- Inferencia en navegador mediante ONNX Runtime Web, sin backend GPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso genérico ni capacidades multilingües: es un modelo de dominio científico.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Predicción de estructura en el navegador para docencia: el sitio MiniFold puede ejecutar `minifold_small.onnx` sobre secuencias de 30-80 aminoácidos en el cliente, permitiendo a estudiantes visualizar estructuras sin instalar software ni disponer de GPU.
- Prototipado rápido de pipelines de biología estructural: usar `esm2_150m.int8.onnx` para obtener embeddings `single` [L, 640] y `pair` [L, L, 16] y alimentar modelos downstream de clasificación de sitios activos o predicción de contacto.
- Herramientas web de anotación de proteínas: integrar la exportación ONNX en una aplicación JavaScript/TypeScript que calcule representaciones por residuo en el navegador y las envíe a un servidor ligero para anotación funcional.
- Filtrado previo en cribado de variantes: dado un conjunto de mutaciones, calcular embeddings con ESM-2 150M cuantizado para priorizar variantes candidatas antes de un análisis más costoso con modelos mayores.
- Educación e investigación reproducible: el repositorio incluye `meta.json` con configuraciones y el alfabeto ESM, lo que facilita reproducir exactamente la tokenización y las formas de entrada/salida en entornos docentes.
- Despliegue en entornos con recursos limitados: al ser ONNX int8 y con un repositorio de 0,2 GB, puede ejecutarse en portátiles y dispositivos sin GPU para demostraciones o pruebas de concepto.
- Integración en cuadernos y demos interactivas: cargar los `.onnx` con `onnxruntime` en Python para validar la canalización antes de portarla a WebAssembly.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión estructural (TM-score, GDT, lDDT), comparaciones con AlphaFold ni datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: el componente ESM-2 150M en int8 ocupa del orden de 150 MB de pesos; los modelos MiniFold adicionales no tienen tamaño publicado, aunque el repositorio total es de 0,2 GB.
- GPU recomendadas: no se especifican; el diseño apunta a inferencia en CPU y navegador (ONNX Runtime Web), por lo que no requiere GPU dedicada.
- Cabe en GPU consumer: sí, cualquier GPU con al menos 1-2 GB de memoria libre podría ejecutar el componente ESM-2; también en CPU.
- Opciones de despliegue: ONNX Runtime (Python, C++, Web/WebAssembly), integración en el Space estático de MiniFold; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniFold Models (este repo) | 150M (ESM-2) + modelos MiniFold sin tamaño publicado | Longitud de secuencia L (no especificada) | Embeddings y estructura de proteínas en navegador | MIT | Hugging Face, ONNX |
| ESM-2 150M (Meta AI) | 150M | Longitud de secuencia variable | Embeddings de proteínas | MIT | Hugging Face |
| ESMFold (Meta AI) | ~690M (ESM-2 3B en la variante grande) | Longitud de secuencia variable | Predicción de estructura end-to-end | MIT (código) / pesos con condiciones | Repositorio oficial de Meta |
| AlphaFold2 (DeepMind) | ~93M (Evoformer) + estructura | MSA-dependente | Predicción de estructura de alta precisión | CC BY 4.0 (código) / pesos con condiciones | Repositorio oficial |

La comparación con AlphaFold2 y ESMFold es solo orientativa: MiniFold no publica métricas que permitan situarlo frente a ellos, y el propio autor advierte que no es AlphaFold.

## Limitaciones y advertencias

- El autor declara explícitamente que son modelos educativos y de investigación, no AlphaFold; no deben usarse como sustituto de predictores de estructura validados en entornos clínicos o farmacéuticos.
- No hay métricas publicadas de precisión (TM-score, lDDT, GDT) ni de calibración, por lo que se desconoce su fiabilidad real.
- La cuantización int8 dinámica del componente ESM-2 puede degradar la calidad de los embeddings; no se cuantifica esa pérdida en la documentación.
- El modelo `minifold_small.onnx` está restringido a proteínas de 30-80 aminoácidos; fuera de ese rango su comportamiento no está documentado.
- Los modelos MiniFold realizan una sola iteración de recycling, lo que limita el refinamiento estructural frente a pipelines con múltiples ciclos.
- No se especifican sesgos, pero al derivar de ESM-2 hereda los sesgos de la composición de su corpus de entrenamiento (no documentada aquí).
- Riesgo de alucinación estructural: al ser un predictor, puede generar coordenadas plausibles pero incorrectas sin señal de confianza documentada.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia de los pesos originales de ESM-2 de Meta AI antes de un despliegue comercial.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni mantenimiento demostrado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/S128hj/minifold-models
- Space de MiniFold: https://huggingface.co/spaces/S128hj/minifold
- ESM-2 (Meta AI): https://huggingface.co/facebook/esm2_t30_150M_UR50D
- ONNX Runtime: https://onnxruntime.ai/
- AlphaFold (referencia citada por el autor): https://github.com/google-deepmind/alphafold
