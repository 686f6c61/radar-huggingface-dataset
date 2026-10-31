# chimpanzeetaxidriver/flint-oQ2e-fp16

## Resumen

Flint-oQ2e-fp16 es una versión cuantizada del modelo RecursiveSI/flint, publicada por el usuario chimpanzeetaxidriver en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un checkpoint derivado mediante cuantización de precisión mixta con la herramienta oQ (oMLX v0.7.3.dev1), orientado al ecosistema MLX de Apple. El resultado es un modelo de generación de texto conversacional de unos 39.785 millones de parámetros que ocupa únicamente 13,9 GB, gracias a una media efectiva de 2,795 bits por peso.

Su relevancia radica en la eficiencia de almacenamiento: al combinar cuantización afín de 2 bits para la gran mayoría de los pesos con capas selectivas de 8 bits y FP16, permite ejecutar un modelo de gran tamaño en hardware con memoria limitada, especialmente en equipos Apple Silicon. La licencia Apache 2.0 heredada del modelo base permite su uso comercial sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer de generación de texto, tipo conversacional) |
| Parametros totales | 39.785.299.488 (~39,79 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Afín 2 bits (grupo 64), afín 8 bits (grupos 64 y 128), FP16; media efectiva 2,795 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

Este repositorio no contiene información sobre el proceso de entrenamiento del modelo base RecursiveSI/flint: no se conocen el número de tokens, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. Lo que sí está documentado es el proceso de cuantización, realizado con oQ (oMLX v0.7.3.dev1), que emplea cuantización de precisión mixta: el 95,134 % de los pesos (37,849 B) se almacena en formato afín de 2 bits con grupo 64, el 4,060 % (1,615 B) en afín de 8 bits con grupo 64, el 0,743 % (0,296 B) en afín de 8 bits con grupo 128 y el 0,063 % (0,025 B) se mantiene en FP16. Esta distribución selectiva protege las capas más sensibles a la pérdida de precisión manteniendo un tamaño total de 12,944 GiB.

No hay información disponible sobre innovaciones arquitectónicas del modelo base, ni sobre decodificación especulativa, atención lineal u otras técnicas específicas.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, etiqueta conversational).
- Ejecución eficiente en el framework MLX de Apple, pensado para Apple Silicon.
- Tamaño reducido en disco (13,9 GB) gracias a la cuantización agresiva de 2 bits.
- No hay información disponible sobre soporte de tool calling, capacidades de agentes, visión, audio, modo de razonamiento extendido ni capacidades multilingües específicas.

## Casos de uso

- Chatbots locales en Mac: el tamaño de 13,9 GB permite ejecutar el modelo en equipos Apple Silicon con suficiente memoria unificada, sin depender de servicios en la nube.
- Prototipado de asistentes conversacionales: al ser un modelo conversacional con licencia Apache 2.0, se puede integrar rápidamente en aplicaciones de diálogo para pruebas de concepto.
- Inferencia en hardware con memoria limitada: la media de 2,795 bits/peso reduce drásticamente los requisitos de memoria frente al modelo base en FP16, que ocuparía unos 80 GB.
- Investigación en cuantización: la documentación detallada de la distribución de bits por tensor lo hace útil como caso de estudio de cuantización de precisión mixta.
- Pruebas de calidad tras cuantización extrema: permite evaluar cuánta calidad se conserva con 2 bits dominantes frente a los pesos originales.
- Despliegue privado de generación de texto: útil para entornos donde los datos no pueden salir del dispositivo o del servidor local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: al menos 14-16 GB solo para los pesos (13,9 GB), más memoria para el contexto y la activación; en la práctica se recomienda un equipo con 24 GB de memoria unificada o superior.
- Al ser un modelo en formato MLX, está orientado a Apple Silicon (Mac con chips M1/M2/M3/M4); no hay información sobre ejecución en GPU NVIDIA.
- No hay datos sobre si cabe en GPUs de consumo concretas (RTX 4090, etc.); el formato MLX no es compatible de forma nativa con CUDA, por lo que en entornos NVIDIA habría que convertir los pesos.
- Opciones de despliegue: librería MLX (mlx-lm). No consta compatibilidad con vLLM, llama.cpp, Ollama o TGI para este checkpoint concreto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamaño | Licencia | Framework |
|---|---|---|---|---|---|
| flint-oQ2e-fp16 | 39,79 B | 2,795 bits/peso (mixta) | 13,9 GB | Apache 2.0 | MLX |
| Modelo base RecursiveSI/flint | ~39,79 B | no disponible (presumiblemente FP16/BF16) | no disponible | Apache 2.0 (según tags) | no disponible |
| Cuantizaciones MLX de modelos de tamaño similar (p. ej. versiones 4-bit de modelos ~34-40 B) | ~34-40 B | 4 bits típico | ~18-22 GB | varía según modelo base | MLX |

Comparado con cuantizaciones estándar de 4 bits de modelos de tamaño similar, este checkpoint ocupa notablemente menos espacio (13,9 GB frente a ~18-22 GB), a costa de una posible pérdida de calidad al dominar los pesos de 2 bits. No hay datos de rendimiento publicados para cuantificar esa pérdida.

## Limitaciones y advertencias

- No hay información sobre sesgos conocidos, riesgo de alucinación ni evaluaciones de seguridad del modelo base RecursiveSI/flint.
- La longitud de contexto no está documentada, lo que dificulta planificar aplicaciones que requieran documentos largos.
- La cuantización a 2 bits del 95 % de los pesos puede degradar significativamente la calidad de generación respecto al modelo original; no hay benchmarks que cuantifiquen esta degradación.
- El formato MLX limita la portabilidad: no funciona de forma nativa con CUDA ni con las herramientas habituales de inferencia en GPU NVIDIA.
- El modelo tiene muy poca tracción comunitaria (447 descargas, 2 likes), por lo que el soporte y la detección de problemas dependerán prácticamente del autor.
- La licencia Apache 2.0 no impone restricciones comerciales relevantes, pero las condiciones del modelo base RecursiveSI/flint deben verificarse por separado.
- La fecha de creación del repositorio (octubre de 2026) indica que es muy reciente; puede contener errores sin detectar.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/chimpanzeetaxidriver/flint-oQ2e-fp16
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
