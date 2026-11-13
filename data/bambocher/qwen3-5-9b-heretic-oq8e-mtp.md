# bambocher/Qwen3.5-9B-heretic-oQ8e-mtp

## Resumen

Qwen3.5-9B-heretic-oQ8e-mtp es una cuantización de precisión mixta del modelo Qwen3.5-9B, publicada por el usuario bambocher en Hugging Face. El checkpoint resultante tiene 9.653.104.368 parámetros reales almacenados y un tamaño de repositorio de 10,7 GB, con un promedio efectivo de 8,881 bits por peso. La nomenclatura del repositorio indica que se trata de una variante "heretic" (presumiblemente un ajuste orientado a reducir rechazos o restricciones de alineamiento) sobre la base Qwen3.5-9B, cuantizada con oQ (oMLX v0.7.3) e incluyendo una cabeza MTP (multi-token prediction).

El modelo está empaquetado en formato MLX, es decir, orientado a la inferencia en Apple Silicon (macOS) mediante el framework MLX. No se trata de un modelo entrenado desde cero, sino de una distribución cuantizada de un modelo base de la familia Qwen3.5, por lo que sus capacidades heredadas dependen del modelo original, sobre el cual la model card no aporta detalles adicionales.

Su relevancia es acotada pero concreta: ofrece un checkpoint de ~9,7B parámetros que cabe en aproximadamente 10 GiB de almacenamiento, lo que permite ejecutarlo en equipos Apple con memoria unificada de 16 GB o superior, manteniendo una parte de los pesos en BF16 (5,083% de los pesos lógicos) para preservar calidad en capas sensibles. La información pública disponible es muy limitada: cero descargas, cero likes, sin licencia declarada y sin idiomas especificados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), con cabeza MTP; cuantización de precisión mixta oQ |
| Parámetros totales | 9.653.104.368 (9,653B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Affine 8-bit con grupo de 64 (94,917% de los pesos) y BF16 (5,083%); promedio efectivo 8,881 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (librería `mlx`) |

Desglose de almacenamiento por componente:

| Componente | Pesos lógicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 8,954B | 9,514 GB / 8,861 GiB |
| Visión | 0,456B | 0,912 GB / 0,849 GiB |
| Cabeza MTP | 0,243B | 0,290 GB / 0,270 GiB |
| Total | 9,653B | 10,716 GB / 9,980 GiB |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base Qwen3.5-9B más allá de su pertenencia a la familia Qwen3.5 y de la presencia de un módulo de visión (0,456B de parámetros) y una cabeza MTP (0,243B). La cabeza MTP (multi-token prediction) es un componente que permite predecir varios tokens por paso, lo que en la práctica se asocia a decodificación especulativa o a un entrenamiento auxiliar con múltiples objetivos de predicción; la model card no detalla cómo se utiliza en inferencia.

El proceso documentado es exclusivamente de cuantización, no de entrenamiento: el checkpoint se generó con oQ (oMLX v0.7.3) aplicando precisión mixta, con un 94,917% de los pesos en affine 8-bit con grupo de 64 y un 5,083% mantenido en BF16. No se especifican tokens de entrenamiento, composición del dataset, ni si hubo RLHF o DPO. El sufijo "heretic" sugiere un ajuste de alineamiento del modelo base, pero no hay documentación que lo confirme ni que describa su metodología.

## Capacidades

- Generación de texto y razonamiento: capacidades heredadas del modelo base Qwen3.5-9B, sin detalle publicado en esta ficha.
- Procesamiento de visión: el checkpoint incluye un módulo de visión de 0,456B de parámetros, lo que indica soporte multimodal de imagen, aunque no se documentan tareas concretas.
- Predicción multi-token: la cabeza MTP de 0,243B está presente en el checkpoint.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Modo "thinking" u otras capacidades especiales: no disponible.
- Ajuste "heretic": el nombre indica una variante con reducción de rechazos, pero no hay documentación técnica que lo respalde.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint en formato MLX con ~10 GiB permite ejecutar un modelo de ~9,7B parámetros en Macs con memoria unificada de 16 GB o más, usando MLX como runtime. Es el caso de uso principal y el único claramente soportado por el formato publicado.
- Prototipado multimodal en local: la presencia del módulo de visión permite experimentar con entrada de imágenes en un equipo de sobremesa Apple, sin depender de servicios en la nube, siempre que se valide el comportamiento real del módulo.
- Evaluación de cuantización de precisión mixta: el checkpoint sirve para comparar la calidad de una mezcla 8-bit/BF16 frente al modelo original, midiendo la degradación introducida por la cuantización en tareas concretas.
- Experimentación con decodificación multi-token: la cabeza MTP incluida permite probar técnicas de predicción especulativa o decodificación acelerada en MLX, si el runtime la expone.
- Investigación sobre ajustes de alineamiento: la variante "heretic" puede usarse para estudiar el efecto de ajustes que reducen rechazos, comparando respuestas frente al modelo base.
- Despliegue de bajo coste en estaciones de trabajo Mac: para tareas de generación de texto internas donde el throughput no es crítico y se prefiere evitar GPUs dedicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el checkpoint ocupa 10,716 GB (9,980 GiB) en disco; en inferencia se necesita al menos esa cantidad de memoria unificada más el overhead del runtime MLX y de la caché KV, por lo que se recomienda un mínimo de 16 GB.
- GPU recomendadas: el formato MLX está diseñado para Apple Silicon (series M1, M2, M3, M4 y superiores). No se indica compatibilidad con GPUs NVIDIA o AMD.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí: equipos con 16 GB de memoria unificada o más. En GPUs de consumo tipo RTX 4090 (24 GB) requeriría conversión de formato, no documentada por el autor.
- Opciones de despliegue: MLX (librería declarada) y oMLX/oQ, la herramienta de cuantización empleada. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado el formato MLX del checkpoint.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-heretic-oQ8e-mtp | 9,653B | no disponible | MLX safetensors (8,881 bits/peso) | no disponible | Hugging Face (0 descargas) |
| Modelo base Qwen3.5-9B | ~9B (según nomenclatura) | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| Otras cuantizaciones GGUF de la familia Qwen3.5 | no disponible | no disponible | GGUF | no disponible | no disponible en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones verificadas de los modelos comparables en la información proporcionada, por lo que la comparativa se limita a parámetros, formato y disponibilidad.

## Limitaciones y advertencias

- Información pública mínima: cero descargas, cero likes, sin licencia, sin idiomas declarados y sin model card más allá de la tabla de cuantización.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; debe verificarse en el repositorio del modelo base antes de cualquier despliegue en producción.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no hay evaluación publicada que lo cuantifique para este checkpoint.
- Degradación por cuantización: el 94,917% de los pesos está en affine 8-bit con grupo de 64; aunque el promedio efectivo es 8,881 bits/peso, puede haber pérdida de calidad frente al modelo en BF16, no medida en la información disponible.
- Variante "heretic": un ajuste orientado a reducir rechazos puede aumentar la probabilidad de generar contenido inapropiado o inseguro; no hay documentación sobre sus criterios de alineamiento.
- Dependencia de plataforma: el formato MLX limita la ejecución a Apple Silicon; no hay pesos GGUF ni safetensors estándar publicados en este repositorio.
- Contexto e idiomas desconocidos: no se puede planificar su uso en escenarios que requieran ventanas largas o cobertura multilingüe sin verificación previa.
- Sesgos: no documentados; se heredan del modelo base y del proceso de ajuste, ambos sin información pública en esta ficha.

## Enlaces

- Hugging Face: https://huggingface.co/bambocher/Qwen3.5-9B-heretic-oQ8e-mtp
- oQ / oMLX (herramienta de cuantización citada en la model card): https://github.com/jundot/omlx
