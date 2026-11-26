# dendriteholdings/Ingot-genesis-9B-Q2

## Resumen

Ingot-genesis-9B-Q2 es una cuantización ternaria en formato GGUF del modelo Qwen3.5-9B, publicada por dendriteholdings como referencia inicial ("genesis") de su competición de cuantizaciones 9B-Q2. No se trata de un modelo entrenado desde cero, sino de una copia sin modificar del fichero `Ternary-Bonsai-2-9B-PQ2_0.gguf` del repositorio prism-ml/Ternary-Bonsai-2-9B-gguf, renombrada y redistribuida bajo licencia Apache 2.0.

El interés técnico reside en el esquema de cuantización PQ2_0: pesos ternarios con valores {-1, 0, +1} y una única escala fp16 por cada 128 pesos, lo que reduce el modelo de 9B parámetros a un fichero de 2,4 GB (2.416.851.840 bytes). Esta compresión extrema permite ejecutar un modelo de casi 9.000 millones de parámetros en hardware muy modesto, a cambio de requerir un fork específico de llama.cpp.

El modelo hereda las capacidades del Qwen3.5-9B original (generación de texto conversacional, con proyector de visión disponible en el repositorio upstream), pero su relevancia práctica es limitada: es una pieza de referencia para evaluación comparativa dentro de una competición, no un modelo pensado para despliegue en producción. El repositorio no registra descargas ni interacciones y fue creado en noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-9B); cuantización ternaria PQ2_0 |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | PQ2_0: pesos ternarios (-1, 0, +1) con una escala fp16 por cada 128 pesos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero único de 2.416.851.840 bytes) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.5-9B, un transformer de 8,95B parámetros desarrollado por Alibaba Cloud. Sobre él se aplica una cuantización ternaria PQ2_0 que sustituye cada peso por uno de tres valores discretos (-1, 0, +1) y almacena una escala fp16 compartida por bloques de 128 pesos. Este esquema es una forma de cuantización de muy baja precisión (aproximadamente 2 bits por peso más la sobrecarga de escalas), orientada a minimizar el tamaño en disco y el ancho de banda de memoria durante la inferencia.

No se dispone de información sobre los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO; esos detalles corresponden al modelo original Qwen3.5-9B y no se documentan en esta ficha. Tampoco se documenta ninguna innovación de decodificación especulativa ni atención lineal. La única particularidad técnica reseñable es el formato de cuantización y la dependencia de un fork de llama.cpp (PrismML-Eng/llama.cpp o DendriteLabs/llama.cpp) para cargar el fichero; el llama.cpp estándar no lo soporta.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen3.5-9B.
- Soporte de visión a través del proyector multimodal (`mmproj`) disponible en el repositorio upstream prism-ml/Ternary-Bonsai-2-9B-gguf; este fichero concreto es solo el modelo de texto.
- Capacidades multilingües: no documentadas en esta ficha.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo de razonamiento explícito (thinking mode): no documentado.
- Al ser una cuantización ternaria, se espera degradación de calidad respecto al modelo original, aunque no se publican métricas que la cuantifiquen.

## Casos de uso

- Evaluación comparativa de cuantizaciones: servir como referencia fija ("genesis") contra la que se puntúan las demás propuestas 9B-Q2 de la competición Ingot, garantizando que todas se miden contra el mismo fichero con el mismo hash.
- Despliegue en hardware de gama muy baja: con 2,4 GB de pesos, el modelo puede cargarse en equipos con poca VRAM o incluso en CPU, lo que permite experimentar con un modelo de 9B en entornos restringidos.
- Pruebas de integración de forks de llama.cpp: útil para validar que el fork de PrismML o Dendrite carga correctamente ficheros PQ2_0 antes de desplegar variantes propias.
- Prototipado rápido de chatbots conversacionales: al ser un modelo de texto con pipeline `text-generation`, puede usarse para validar flujos de conversación multi-turno en fase de diseño, aceptando la pérdida de calidad de la cuantización ternaria.
- Investigación sobre cuantización extrema: permite estudiar empíricamente el impacto de pesos ternarios en tareas de generación, comparando salidas con el modelo Qwen3.5-9B en fp16.
- Reproducibilidad de experimentos: el hash sha256 documentado (`7a89ab48...`) permite verificar que los resultados de un benchmark se obtuvieron exactamente con este fichero.
- Base para experimentos multimodales: combinándolo con el `mmproj` del repositorio upstream, puede montarse un pipeline de visión-lenguaje de bajo coste de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero de pesos ocupa 2,4 GB; con overhead de contexto y buffers de llama.cpp, se estima un uso de memoria en torno a 3-4 GB, aunque no se documenta oficialmente.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; también viable en CPU.
- Cabe en GPU de consumo: sí, previsiblemente en GTX 1650, RTX 3050, RTX 4060 y superiores; no confirmado por el autor.
- Opciones de despliegue: exclusivamente forks de llama.cpp (PrismML-Eng/llama.cpp o DendriteLabs/llama.cpp, este último en el commit `9991ae551` según la model card). No compatible con llama.cpp estándar, vLLM, TGI ni Ollama en sus versiones actuales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Ingot-genesis-9B-Q2 | 8,95B | no disponible | Ternaria PQ2_0 | Apache 2.0 | GGUF (fork) |
| Qwen3.5-9B (original) | 8,95B | no disponible | fp16/bf16 | no disponible | safetensors |
| Ternary-Bonsai-2-9B-gguf (upstream) | 8,95B | no disponible | Ternaria PQ2_0 | Apache 2.0 | GGUF (fork) |

La comparativa se limita al ecosistema del propio modelo: Ingot-genesis-9B-Q2 es idéntico byte a byte al fichero `Ternary-Bonsai-2-9B-PQ2_0.gguf` del repositorio upstream, por lo que no aporta diferencias de rendimiento frente a él. Frente al Qwen3.5-9B original, la diferencia es la cuantización ternaria, con la consiguiente reducción de tamaño y la presumible pérdida de calidad, no cuantificada en la información disponible.

## Limitaciones y advertencias

- Es una copia renombrada, no un modelo nuevo: no aporta mejoras respecto a Ternary-Bonsai-2-9B-gguf.
- La cuantización ternaria introduce degradación de calidad frente al Qwen3.5-9B en fp16; no se publican métricas de esa degradación.
- Requiere un fork específico de llama.cpp; el llama.cpp estándar no carga el fichero, lo que limita su integración en toolchains convencionales.
- No se documentan sesgos conocidos, pero al derivar de un modelo entrenado por Alibaba Cloud, hereda los sesgos del modelo base, no evaluados aquí.
- Riesgo de alucinación: no evaluado; previsiblemente mayor que en el modelo original por la pérdida de precisión de los pesos.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingüe.
- Longitud de contexto no documentada; no apto para tareas que requieran ventanas largas sin verificación previa.
- El fichero es solo texto; la visión requiere descargar el `mmproj` del repositorio upstream.
- Licencia Apache 2.0 permite uso comercial, pero el repositorio declara no estar afiliado ni respaldado por Prism ML ni Alibaba Cloud.
- Sin descargas ni validación comunitaria: no hay evidencia externa de su funcionamiento más allá de la model card.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dendriteholdings/Ingot-genesis-9B-Q2
- Repositorio upstream (Ternary-Bonsai-2-9B-gguf): https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-9B
- Fork de llama.cpp de PrismML: https://github.com/PrismML-Eng/llama.cpp
- Fork de llama.cpp de Dendrite: https://github.com/DendriteLabs/llama.cpp
