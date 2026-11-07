# M-o-r-p-h-e-u-s/SILY-1-Base

## Resumen

SILY 1 Base es un modelo de lenguaje de tipo base desarrollado por el usuario independiente M-o-r-p-h-e-u-s y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un experimento de arquitectura híbrida que combina un transformer con mezcla de expertos (MoE), pesos compartidos entre bloques y bucles de repetición sobre grupos de bloques ("banks"). El objetivo declarado del autor es explorar un enrutamiento de expertos basado en similitud coseno contra vectores prototipo por experto, en lugar del enrutador lineal convencional, con una función auxiliar que equilibra la carga y a la vez separa los vectores de los expertos para fomentar su especialización.

El modelo tiene 476,9 millones de parámetros totales y 113,5 millones activos por token, con una ventana de contexto de solo 1.024 tokens y un vocabulario de 12.288 tokens (BPE a nivel de byte). Fue entrenado durante 13,41 mil millones de tokens en una única pasada sobre el dataset allenai/dolma3_mix-6T, empleando 55,7 horas en una sola GPU H100 NVL. La mayor parte de las ejecuciones de ajuste se realizaron en una RTX 3060 de 12 GB.

Es relevante ahora como banco de pruebas reproducible de ideas de arquitectura (enrutamiento por prototipos vectoriales, MoE compartido entre bloques y pasadas, mezcla de frontera entre bancos) más que como modelo de producción: es un modelo base sin ajuste de instrucciones ni de seguridad, solo en inglés y con contexto muy corto. El repositorio ocupa 1,9 GB y los pesos se distribuyen en formato PyTorch (`model.pt`), no en safetensors ni GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con MoE, pesos compartidos y bucles: 5 bancos de 3 bloques (dos convoluciones con puerta y una atención), cada banco ejecutado 2-3 veces con pesos compartidos; 33 aplicaciones de bloque por token |
| Parametros totales | 476,9 M |
| Parametros activos | 113,5 M por token |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (solo se documenta ejecución en bfloat16 en los scripts de ejemplo) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`model.pt`); tokenizer en `tokenizer.json` (formato tokenizers) |

## Arquitectura y entrenamiento

La arquitectura se organiza en cinco bancos de tres bloques transformer cada uno. Dentro de cada banco, los bloques comparten un único módulo MoE, y el banco puede repetirse ("pasar") dos o tres veces antes de entregar su salida al siguiente, reutilizando los mismos pesos. Cada bloque usa atención con consultas agrupadas (GQA) o la convolución de doble puerta (DGC) de Liquid, elegida esta última por su eficiencia de recursos. En total se aplican 33 bloques por token. Cada banco dispone de 253 expertos enrutados (top-4) más un experto siempre activo por cada pasada y bloque. Además, cada banco incorpora una "mezcla de frontera" que decide cuánto combinar de la entrada previa, del trabajo propio y de los embeddings originales del token antes de pasar la salida.

El enrutamiento se basa en la similitud coseno entre el token objetivo y un vector prototipo asignado a cada experto. La función auxiliar cumple dos funciones: equilibrar la carga con un margen del 10 % para no penalizar la especialización y empujar los vectores de los expertos para separarlos en el espacio. El entrenamiento consistió en una época sobre 13,41 mil millones de tokens de allenai/dolma3_mix-6T, con una pérdida en validación de 2,393 nats por token (0,919 bits por byte). El autor documenta que los expertos parecen especializarse, que la especialización se acentúa con la profundidad y que, dentro de un banco, cada bloque y pasada tiende a preferir un subconjunto del pool de expertos (separación de 0,02 en el banco 1 y 0,2 en el banco 4).

## Capacidades

- Generación de texto autoregresiva: es un modelo base, continúa texto; no responde a instrucciones.
- Razonamiento y conocimiento general limitados por el tamaño (476,9 M totales, 113,5 M activos) y por el entrenamiento de una sola época.
- Capacidad de código y matemáticas: no documentada específicamente; no disponible.
- Tool calling / function calling: no soportado de forma nativa.
- Agentes y razonamiento multi-paso: no soportado de forma nativa.
- Multilingüismo: solo inglés.
- Capacidades especiales: no dispone de modo "thinking", visión ni audio.
- Muestreo recomendado por el autor: temperatura 1,0, min-p 0,03, penalización de frecuencia 0,3 con ventana de 64; el resto de filtros desactivados por defecto.

## Casos de uso

- Investigación en enrutamiento MoE: sirve para reproducir y comparar el enrutamiento por similitud coseno contra vectores prototipo frente al enrutador lineal, midiendo especialización por experto y por profundidad con las métricas que reporta el autor.
- Estudio de arquitecturas con pesos compartidos y bucles: permite analizar el efecto de repetir un banco 2-3 veces sobre la pérdida y sobre la preferencia de expertos por bloque y pasada.
- Experimentos de mezcla de frontera: útil para evaluar cómo la combinación de entrada previa, salida propia y embeddings originales afecta a la estabilidad del entrenamiento y a la perplejidad.
- Generación de texto creativo en inglés a pequeña escala: con 1.024 tokens de contexto puede completar fragmentos cortos, descripciones o continuaciones literarias, siempre con revisión humana por su tendencia a la alucinación.
- Prototipado educativo: su tamaño (1,9 GB de repositorio) y su ejecución en una RTX 3060 de 12 GB lo hacen apto para demostraciones de arquitecturas MoE híbridas en cursos o talleres.
- Reproducción de entrenamiento a pequeña escala: el autor documenta el pipeline completo (dataset, tokens, horas de cómputo en H100 NVL), lo que facilita replicar el experimento con presupuesto reducido.
- Base para fine-tuning experimental: al ser un modelo base con licencia Apache 2.0, puede servir de punto de partida para ajustes supervisados en tareas de dominio muy acotadas, aunque su contexto de 1.024 tokens limita su aplicabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta la pérdida en validación: 2,393 nats por token y 0,919 bits por byte, sobre 13,41 mil millones de tokens de entrenamiento (una época).

## Requisitos de hardware

- VRAM estimada para inferencia: con 476,9 M de parámetros totales, en bfloat16 los pesos ocupan aproximadamente 0,95 GB; el autor ejecuta la inferencia con `torch.autocast` en bfloat16. No se documentan requisitos adicionales de memoria para el estado de los bucles ni para el enrutamiento.
- GPU recomendadas: el autor entrenó el modelo final en una H100 NVL; la inferencia cabe holgadamente en GPUs de consumo.
- Cabe en GPU de consumo: sí; el autor realizó la mayor parte de los ajustes en una RTX 3060 de 12 GB, por lo que la inferencia en esa GPU o en cualquier tarjeta con 4 GB o más de VRAM es viable.
- Opciones de despliegue: los scripts propios del repositorio (`generate.py` y `modeling.py`) sobre PyTorch; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, y no se ofrecen pesos en GGUF.
- Latencia y throughput estimados: no disponible. El autor solo reporta 55,7 horas para entrenar 13,41 mil millones de tokens en una H100 NVL.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SILY 1 Base | 476,9 M / 113,5 M | 1.024 | Apache 2.0 | PyTorch (`model.pt`) | MoE híbrido con bucles y pesos compartidos; solo inglés |
| SmolLM2-360M | 362 M (denso) | 8.192 | Apache 2.0 | safetensors, GGUF | Denso, sin MoE; contexto mucho mayor |
| Qwen2.5-0.5B | 494 M (denso) | 32.768 | Apache 2.0 | safetensors, GGUF | Denso, multilingüe, ampliamente soportado por herramientas |
| OLMo-1B | 1.176 M (denso) | 2.048 | Apache 2.0 | safetensors | Denso, entrenamiento completamente abierto |

La comparación es orientativa: SILY 1 Base prioriza la experimentación arquitectónica sobre el rendimiento bruto, y no hay benchmarks públicos que permitan situarlo frente a estos modelos.

## Limitaciones y advertencias

- Es un modelo base sin ajuste de instrucciones ni de seguridad: puede generar contenido dañino, ofensivo o incorrecto sin filtro alguno.
- Riesgo elevado de alucinación: con 476,9 M de parámetros totales, 113,5 M activos y una sola época de entrenamiento, su conocimiento factual es muy limitado.
- Contexto muy corto (1.024 tokens): no apto para conversaciones multi-turno largas, documentos extensos ni tareas de recuperación aumentada con contexto amplio.
- Solo inglés: no soporta castellano ni otros idiomas de forma fiable.
- Sesgos: no se documenta ninguna evaluación de sesgos; el dataset allenai/dolma3_mix-6T puede arrastrar los sesgos de sus fuentes.
- Licencia Apache 2.0: permite uso comercial, pero al no haber ajuste de seguridad el despliegue en producción exige filtros y supervisión adicionales.
- Madurez: publicado en noviembre de 2026, sin descargas ni "likes" en Hugging Face, sin soporte en frameworks de inferencia estándar y con scripts propios; la integración en producción requiere trabajo adicional.
- El autor reconoce que las ideas exploradas ya existían en la literatura y que el desarrollo se apoyó en modelos LLM para escribir el código PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/M-o-r-p-h-e-u-s/SILY-1-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/allenai/dolma3_mix-6T
- Repositorio del autor en Hugging Face: https://huggingface.co/M-o-r-p-h-e-u-s
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos.
