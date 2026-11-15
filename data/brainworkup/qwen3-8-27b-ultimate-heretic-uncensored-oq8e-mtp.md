# brainworkup/Qwen3.8-27B-Ultimate-Heretic-Uncensored-oQ8e-mtp

## Resumen

Qwen3.8-27B-Ultimate-Heretic-Uncensored-oQ8e-mtp es una cuantización de precisión mixta de un modelo de la familia Qwen 3.5, publicada por el usuario brainworkup en Hugging Face. El checkpoint resultante tiene 27.781 millones de parámetros lógicos almacenados en 27,941 GiB, con una media efectiva de 8,639 bits por peso. La mayor parte de los pesos (98,143 %) se guarda en formato affine de 8 bits con grupos de 64, mientras que un 1,857 % permanece en BF16.

El modelo conserva tres componentes diferenciados: el modelo de lenguaje (26,896B parámetros), un codificador de visión (0,461B) y una cabeza MTP (0,425B), lo que indica que el checkpoint original es multimodal y soporta decodificación especulativa mediante multi-token prediction. La nomenclatura "Heretic-Uncensored" sugiere un ajuste orientado a eliminar restricciones de rechazo, aunque el autor no documenta el proceso de alineamiento ni los datos empleados.

La relevancia de esta publicación es principalmente práctica: permite ejecutar un modelo multimodal de ~28B parámetros en Apple Silicon mediante MLX con un peso en disco de 30 GB, un tamaño manejable en equipos con 32-64 GB de memoria unificada. No obstante, se trata de una cuantización de terceros sin model card detallada, sin benchmarks publicados y sin licencia declarada, lo que limita seriamente su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, tag `qwen3_5`), con cabeza MTP y torre de visión |
| Parametros totales | 27.781.427.952 (27,781B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización mixta oQ: affine 8-bit grupo 64 (98,143 % de pesos) + BF16 (1,857 %); media efectiva 8,639 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `mlx`) |

Desglose de almacenamiento por componente:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 26,896B | 28,579 GB / 26,617 GiB |
| Vision | 0,461B | 0,921 GB / 0,858 GiB |
| Cabeza MTP | 0,425B | 0,500 GB / 0,466 GiB |
| Total | 27,781B | 30,001 GB / 27,941 GiB |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base. Los tags y el desglose de pesos permiten inferir que se trata de un transformer de la familia Qwen 3.5 con tres bloques: un modelo de lenguaje de 26,896B parámetros, un codificador visual de 0,461B y una cabeza de multi-token prediction (MTP) de 0,425B. La presencia de MTP es relevante porque habilita decodificación especulativa nativa, es decir, la generación de varios tokens por paso con verificación posterior, lo que puede incrementar el throughput de inferencia sin cambiar la distribución de salida.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base pasó por RLHF, DPO u otras etapas de alineamiento. El sufijo "Heretic-Uncensored" indica que el checkpoint original fue modificado para reducir rechazos, pero el autor no documenta la metodología de dicho ajuste ni los datos utilizados. La cuantización se realizó con oQ (oMLX v0.8.0rc1), una herramienta de cuantización de precisión mixta que asigna 8 bits con grupos de 64 a la mayoría de tensores y mantiene en BF16 un 1,857 % de los pesos, presumiblemente capas sensibles a la precisión.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Qwen 3.5 (no verificadas en este checkpoint).
- Procesamiento de imagen: el checkpoint incluye una torre de visión de 0,461B parámetros, por lo que el modelo es multimodal entrada-imagen/texto.
- Decodificación especulativa mediante cabeza MTP, que puede acelerar la generación en entornos MLX compatibles.
- Capacidades multilingües: no documentadas en esta ficha; dependen del modelo base.
- Tool calling y function calling: no documentados explícitamente, aunque la familia Qwen suele soportarlos.
- Comportamiento "uncensored": el ajuste declarado busca reducir negativas a peticiones, pero no hay evaluación pública de hasta qué punto se consigue ni con qué coste en calidad.
- Modo thinking o razonamiento extendido: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint de 30 GB encaja en equipos con 32 GB o más de memoria unificada (M1/M2/M3/M4 Pro, Max o Ultra), lo que permite ejecutar un modelo de ~28B en un portátil o estación de trabajo sin GPU dedicada.
- Prototipado de aplicaciones multimodales: la torre de visión permite experimentar con descripción de imágenes, extracción de información de capturas o documentos escaneados en un entorno MLX local.
- Investigación sobre alineamiento y censura: al ser un checkpoint "uncensored", puede usarse para estudiar cómo varía el comportamiento de rechazo respecto al modelo base, siempre que se respeten las políticas de uso.
- Generación de texto asistida por lotes: con la cabeza MTP y el soporte de MLX, es adecuado para tareas de generación offline donde el throughput importa más que la latencia interactiva.
- Experimentos de cuantización: sirve como caso de estudio de precisión mixta (8-bit grupo 64 + BF16) para comparar calidad frente a cuantizaciones uniformes de 8 y 4 bits.
- Evaluación comparativa de checkpoints comunitarios: útil para medir la degradación introducida por el ajuste "Heretic" y por la cuantización oQ frente al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~28 GiB para cargar los pesos en memoria; se recomienda al menos 32 GB de memoria unificada para dejar margen a la caché KV y al contexto.
- GPU recomendadas: no aplica directamente, ya que el checkpoint está en formato MLX y está pensado para Apple Silicon. Para GPUs NVIDIA sería necesario convertir los pesos a otro formato, algo no documentado por el autor.
- ¿Cabe en GPU de consumo? En Apple Silicon, sí: equipos con 32 GB o más (M-series Pro/Max/Ultra). En NVIDIA, no hay pesos GGUF ni safetensors estándar publicados en este repo, por lo que no se puede confirmar compatibilidad con RTX 4090 (24 GB) sin conversión y cuantización adicional.
- Opciones de despliegue: MLX (librería declarada). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; dependen del hardware y de si se activa la decodificación especulativa con la cabeza MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Ultimate-Heretic-Uncensored-oQ8e-mtp | 27,781B | no disponible | safetensors MLX (8,639 bits/peso) | no disponible | Cuantización comunitaria con visión y MTP |
| Modelo base Qwen 3.5 (presunto origen) | ~27B | no disponible | safetensors BF16 | no disponible en esta ficha | Referencia de calidad; el checkpoint aquí descrito no documenta su procedencia exacta |
| Cuantizaciones GGUF de la familia Qwen 3.5 (Q8_0) | ~27B | no disponible | GGUF | depende del autor | Compatibles con llama.cpp y Ollama; no incluyen necesariamente torre de visión ni MTP |

La comparación cuantitativa con alternativas no es posible porque no hay benchmarks publicados para este checkpoint ni datos verificables del modelo base en la información proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor o consultar la licencia del modelo base antes de cualquier despliegue.
- Model card extremadamente escasa: sin información sobre contexto, idiomas, datos de entrenamiento ni evaluación.
- Riesgo elevado de alucinación y de degradación de calidad por la cuantización de 8 bits y por el ajuste "uncensored", cuyo impacto no está medido.
- El ajuste "Heretic-Uncensored" elimina o reduce barreras de rechazo, lo que aumenta el riesgo de generar contenido dañino, sesgado o ilegal; requiere filtros externos en cualquier uso público.
- Sesgos desconocidos: no hay evaluación de sesgos demográficos, culturales o lingüísticos.
- Compatibilidad limitada: formato MLX, sin pesos GGUF ni safetensors estándar publicados, lo que restringe su uso fuera de Apple Silicon.
- Repositorio sin descargas ni likes y creado en 2026-11-15: no hay evidencia de validación por parte de la comunidad.
- La cabeza MTP y la torre de visión pueden no estar soportadas por todas las versiones de MLX; verificar compatibilidad antes de confiar en la aceleración especulativa.

## Enlaces

- Hugging Face: https://huggingface.co/brainworkup/Qwen3.8-27B-Ultimate-Heretic-Uncensored-oQ8e-mtp
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
