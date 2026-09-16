# ngoziojo/retrieval

## Resumen

ngoziojo/retrieval es un repositorio de Hugging Face que contiene una implementación propia y compacta de un "Tiny Transformer" orientado a tareas de recuperación (retrieval), escrita en PyTorch. Lo publica el usuario ngoziojo bajo licencia Apache 2.0 y, según el recuento real de safetensors, el checkpoint contiene 24.832 parámetros, una magnitud muy alejada de cualquier modelo de retrieval de uso real.

El propio repositorio se presenta como un esqueleto de trabajo: la configuración etiquetada como xlarge está pensada para revisión de código, pruebas de humo (smoke tests) y experimentos pequeños y controlados, y no como un modelo preentrenado listo para producción. El archivo model.safetensors es una inicialización válida, no un checkpoint entrenado ni evaluado, y el autor no reclama ninguna puntuación de benchmark.

Su relevancia actual es acotada pero concreta: sirve como plantilla reproducible para montar un pipeline de entrenamiento de retrieval (optimizador Novograd, schedule coseno, evaluación sugerida sobre Flickr30k con al menos tres semillas), no como un componente al que se pueda apelar para obtener embeddings o rankings de calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Tiny Transformer (atención grouped query, fusión concat MLP, activación approx gelu, normalización scalenorm) |
| Parámetros totales | 24.832 |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint de inicialización); configuración en config.json y training_args.json |
| Pipeline de Hugging Face | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-09-15 / 2026-09-15 |

## Arquitectura y entrenamiento

La arquitectura es un transformer propio de tipo "tiny", con atención de consultas agrupadas (grouped query attention), una etapa de fusión basada en concat MLP, activación approx gelu y normalización scalenorm. El autor etiqueta esta variante como xlarge dentro de su propia escala interna, pero el recuento real de parámetros (24.832) confirma que se trata de una configuración minúscula. No se documentan número de capas, dimensión oculta, número de cabezas ni longitud de contexto.

No hay entrenamiento completado. El repositorio incluye una receta por defecto con optimizador Novograd y schedule coseno, pero el autor insiste en que son valores de arranque del script y no evidencia de una ejecución finalizada. Como guía de evaluación propone Flickr30k, con reporte de la métrica de la tarea en al menos tres semillas y una línea base de capacidad equivalente. Tampoco se documenta el uso de RLHF, DPO ni ninguna otra técnica de alineamiento.

## Capacidades

- No se declara ninguna capacidad funcional verificada: el checkpoint incluido es una inicialización sin entrenar.
- La arquitectura está orientada a tareas de retrieval, pero no hay evidencia de que produzca representaciones útiles.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Funciones realmente cubiertas por el repositorio: servir de código de referencia, permitir pruebas de humo y actuar como punto de partida para experimentos de retrieval.

## Casos de uso

- Revisión de código de arquitecturas transformer: el archivo train.py actúa como artefacto principal y permite inspeccionar una implementación propia de atención grouped query con fusión concat MLP sin depender de librerías externas.
- Prueba de humo de infraestructura de entrenamiento: con solo 24.832 parámetros, el modelo permite comprobar que un pipeline (carga de safetensors, bucle de entrenamiento, guardado de checkpoints) funciona de extremo a extremo en segundos.
- Plantilla para experimentos de retrieval controlados: el autor plantea explícitamente usarlo con Flickr30k, reportando la métrica por tarea en al menos tres semillas, lo que lo hace útil como banco de pruebas de recetas de entrenamiento.
- Línea base de capacidad mínima: sirve como matched-capacity baseline frente a variantes mayores dentro del mismo código, útil para aislar el efecto del tamaño en un estudio comparativo.
- Validación de cargas con adaptadores personalizados: al ser una implementación propia, obliga a escribir un adaptador explícito para las APIs genéricas de carga; es un caso realista para probar integraciones con transformers o vLLM.
- Reproducción de recetas de optimización: permite ensayar combinaciones de Novograd con schedule coseno y comparar curvas de pérdida en un entorno de bajo coste computacional.
- Uso docente: por su tamaño y su código autocontenido, es adecuado para explicar el funcionamiento interno de un transformer de retrieval en un aula o taller.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara de forma explícita que el repositorio no presenta ninguna puntuación de benchmark y que el checkpoint es una inicialización sin entrenar.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, el checkpoint ocupa aproximadamente 97 KiB (24.832 parámetros x 4 bytes); en fp16, unos 48,5 KiB; en int8, unos 24 KiB. La huella es irrelevante para cualquier GPU.
- GPU recomendadas: no se requiere GPU. Cualquier acelerador sirve; incluso es viable ejecutarlo solo en CPU.
- Dispositivos de gama baja: cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, GTX 1650 e inferiores), en CPU de portátil e incluso en placas tipo Raspberry Pi o microcontroladores con suficiente memoria.
- Opciones de despliegue: no se documenta ninguna integración con vLLM, llama.cpp, Ollama o TGI. El autor advierte que, al ser una implementación personalizada, las APIs automáticas de carga requieren un adaptador explícito.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se proporciona información de modelos comparables en los resultados disponibles. A modo de referencia de categoría, dentro del ecosistema de retrieval y embeddings existen modelos como sentence-transformers/all-MiniLM-L6-v2 o BAAI/bge-small-en-v1.5, pero sus cifras no forman parte de la documentación facilitada y no se reproducen aquí. La comparación directa con ngoziojo/retrieval carece de sentido mientras este último no haya sido entrenado ni evaluado.

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| ngoziojo/retrieval | 24.832 | no disponible | apache-2.0 | Inicialización sin entrenar |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: no produce resultados útiles y no debe usarse como modelo de retrieval en producción.
- No ha sido auditado en robustez, equidad ni transferencia de dominio, según reconoce el propio autor.
- No se declaran idiomas soportados ni longitud de contexto, por lo que se desconoce cualquier límite lingüístico o de ventana.
- El riesgo de alucinación no aplica en el sentido habitual (no hay generación entrenada), pero cualquier métrica derivada del checkpoint actual sería igualmente engañosa.
- Licencia Apache 2.0: permite uso comercial del código y de los pesos, pero el autor advierte de que deben revisarse por separado los términos de los datos de origen si se usan datasets externos.
- Etiquetado engañoso: la configuración se denomina xlarge aunque el modelo tiene 24.832 parámetros, lo que puede inducir a error si no se comprueba el recuento real.
- Integración: las APIs genéricas de carga automática fallan sin un adaptador específico, lo que añade trabajo antes de poder ejecutarlo.
- Cualquier resultado futuro obtenido tras entrenar el modelo debe documentarse por separado de los valores por defecto publicados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ngoziojo/retrieval
- Archivos incluidos en el repositorio: train.py, README.md, config.json, training_args.json, model.safetensors
- Paper, blog o demo: no disponibles
- Nota sobre la búsqueda web: los resultados recuperados no guardan relación con el modelo (páginas en japonés sobre la Antártida) y no aportan información utilizable.
