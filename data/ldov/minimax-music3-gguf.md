# ldov/MiniMax-Music3-GGUF

## Resumen

MiniMax-Music3-GGUF es una redistribución en formato GGUF del modelo MiniMax Music 3, desarrollado por MiniMax, publicada por el usuario ldov. Se trata de una conversión de pesos, no de un reentrenamiento: los tensores del checkpoint original se trasladan al contenedor GGUF conservando su dtype nativo y se cuantizan en varios niveles. El objetivo es ejecutar el pipeline completo de generación de canciones en local mediante [minimaxmusic.cpp](https://github.com/ServeurpersoCom/minimaxmusic.cpp), una implementación portable en C++17 sobre GGML que funciona en CPU, CUDA y Vulkan.

A diferencia de un modelo de lenguaje convencional, MiniMax Music 3 no es un único transformer: es un pipeline de cinco componentes (un LM autorregresivo de 8B, un decoder RVQ de 0,6B, un DiT de flow matching de 2,4B, un codificador de condición y un VAE/vocoder) que convierte un caption estructurado más una letra en audio estéreo a 44,1 kHz. La relevancia de esta ficha radica en que permite estimar requisitos reales de VRAM por cuantización, algo poco habitual en modelos de generación musical.

La licencia no es abierta en sentido OSI: es la MiniMax-Music3 Community License, con obligación de mostrar la marca en productos comerciales, autorización previa por encima de 20 millones de dólares de facturación anual y salvaguardas obligatorias en servicios alojados. El repositorio concreto analizado tiene 0 descargas y 0 likes, por lo que no cuenta con validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline multimodal de generación musical: LM autorregresivo (Qwen3 causal, 8B) + decoder RVQ intra-frame (0,6B) + DiT de flow matching (2,4B, 36 bloques de self-attention) + codificador de condición + VAE/vocoder (123M) |
| Parámetros totales | No consolidado en la información. El metadato de safetensors de HuggingFace indica 25.167.881; la model card desglosa LM 8B + decoder RVQ 0,6B + DiT 2,4B + VAE 123M (aproximadamente 11.100 millones sumando componentes) |
| Parámetros activos | No aplica (no es una arquitectura MoE) |
| Longitud de contexto | No disponible. La generación se describe para canciones de hasta cinco minutos |
| Tipos de cuantización | LM: BF16, Q8_0, Q6_K, Q5_K_M (sin Q4). Decoder RVQ: BF16, Q8_0. DiT: F32, Q8_0, Q6_K, Q5_K_M, Q4_K_M. Codificador de condición y vocoder: solo F32 (no se cuantizan) |
| Idiomas soportados | en, zh (caption y letra) |
| Licencia | minimax-music3-community (MiniMax-Music3 Community License) |
| Formato de pesos | GGUF (un fichero por componente, cinco en total) |
| Salida de audio | Estéreo a 44,1 kHz |
| Frecuencia de trabajo interna | Codebook semántico a 25 Hz; latente de 128 canales a 86,13 Hz |
| Tamaño del repositorio | 59,4 GB |
| Motor de inferencia | minimaxmusic.cpp (C++17 + GGML); backends CPU, CUDA y Vulkan |

## Arquitectura y entrenamiento

El pipeline encadena cinco etapas. Primero, un LM global de 8B (derivado de Qwen3, licencia Apache 2.0) predice el codebook semántico fotograma a fotograma a 25 Hz. Después, un decoder de profundidad RVQ de 0,6B genera los siete codebooks acústicos de cada fotograma mediante un transformer intra-frame. El codificador de condición mezcla 8 estados y remuestrea de 25 Hz a 86,13 Hz para producir la pista de condición. Sobre esa condición, un DiT de flow matching de 2,4B con 36 bloques de self-attention renderiza el latente de 128 canales mediante pasos de Euler. Finalmente, el VAE de flujo (decoder de 123M) convierte 2 pistas de 64 canales en audio estéreo de 44,1 kHz. El DiT deriva de Stable Audio y el VAE de DAC, ambos con licencia MIT.

La conversión a GGUF no altera los pesos en sustancia: se conserva el dtype nativo byte a byte del checkpoint y la única transformación es el plegado de la normalización de pesos del VAE, que es la forma de inferencia de los mismos pesos. No se publica información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones de decodificación especulativa.

Una característica operativa destacable es que una pista renderizada devuelve su propio flujo de códigos, de modo que volver a renderizarla con otros ajustes de síntesis no vuelve a pagar el coste de la autoregresión. El autor indica además que no existe cuantización Q4 para el LM porque un LM de códigos de audio se degrada por debajo de Q5, y que la etapa del LM está limitada por ancho de banda de relectura de pesos, por lo que su cuantización se traduce directamente en velocidad.

## Capacidades

- Generación de canciones completas a partir de un caption estructurado y una letra, con salida estéreo a 44,1 kHz.
- Estructura musical autorregresiva: el LM y el decoder RVQ construyen la estructura, el DiT renderiza timbre y articulación, y el VAE produce el audio final.
- Generación de audio de formato largo, descrita para piezas de hasta cinco minutos.
- Control mediante descripción musical detallada (por ejemplo, "synthwave melancólico, tempo lento, pads analógicos").
- Soporte de letra cantada en inglés y chino.
- Re-renderizado sin coste de autoregresión, reutilizando el flujo de códigos almacenado de una pista ya generada.
- Ejecución en CPU, CUDA y Vulkan mediante GGML.
- Interfaz de servidor con WebUI embebida (mm-server) y herramientas de línea de comandos (mm-synth, mm-lm).
- Selección de cuantización por componente en caliente desde la interfaz; los modelos se cargan en el primer trabajo, de modo que el arranque no toca la GPU.
- No dispone de tool calling, function calling, capacidades de agente, visión ni entrada de audio. No se documenta un modo de razonamiento explícito (thinking mode).

## Casos de uso

- Producción musical independiente en local: un compositor puede escribir un caption y una letra, generar una maqueta completa de hasta cinco minutos y re-renderizarla con otros ajustes de síntesis sin repetir la etapa autorregresiva, lo que abarata la iteración.
- Música para videojuegos y prototipos: el servidor embebido permite generar pistas por temática desde una WebUI local, sin depender de servicios en la nube y sin coste por petición.
- Postproducción de vídeo y podcasts: la salida estéreo a 44,1 kHz es directamente utilizable en una línea de edición; el caption estructurado permite fijar género, tempo y carácter instrumental para sintonizar con la pieza audiovisual.
- Integración en pipelines propios en C++: las herramientas mm-synth y mm-lm aceptan ficheros de petición y de plan en JSON, lo que permite encadenar la generación desde un script o un servicio propio y separar la etapa de planificación de la de síntesis.
- Investigación en modelos generativos de audio: al distribuir los componentes en ficheros GGUF independientes y con varias cuantizaciones, resulta posible medir el impacto de la cuantización por etapa (LM, decoder RVQ, DiT) manteniendo el resto fija.
- Despliegue en hardware sin GPU dedicada: al ser una implementación GGML, el pipeline puede ejecutarse en CPU, lo que sirve para demos, formación o entornos de desarrollo sin acelerador.
- Generación de jingles y sintonías para marcas o canales, siempre que se cumplan las condiciones de la licencia (marca visible en la interfaz y umbral de facturación).
- Servicio alojado de generación musical: la licencia admite servicios de terceros, pero obliga a implementar salvaguardas razonables contra usos y resultados infractores, lo que lo hace viable solo para operadores con recursos para mantener esas medidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card y los resultados de búsqueda no incluyen métricas objetivas (FAD, similitud de letra, precisión de género ni comparaciones numéricas con otros sistemas de generación musical). Únicamente se aportan afirmaciones cualitativas del autor: que el LM no admite cuantización Q4 sin degradación, que el decoder RVQ de 0,6B es demasiado pequeño para sobrevivir a cuantización agresiva, que la etapa del LM está limitada por ancho de banda y que el DiT está limitado por cómputo.

## Requisitos de hardware

- Conjunto Q8_0 completo: el README indica aproximadamente 9 GB de VRAM en ejecución; una fuente externa cita 9,8 GiB. La suma de los ficheros Q8_0 listados en la model card es de unos 12,8 GB (9,1 + 0,69 + 2,6 + 0,101 + 0,306), cifra que no coincide con las anteriores y cuya diferencia no se explica en la información disponible.
- Conjunto mínimo viable estimado a partir de los tamaños de fichero: LM en Q5_K_M (6,3 GB) + decoder RVQ en Q8_0 (0,69 GB) + DiT en Q4_K_M (1,4 GB) + codificador de condición (0,101 GB) + vocoder (0,306 GB) ≈ 8,8 GB. Esta estimación es una derivación de los tamaños publicados, no un dato del autor.
- Conjunto sin cuantizar (BF16 para LM y decoder RVQ, F32 para DiT, codificador y vocoder): aproximadamente 28,6 GB (17,2 + 1,3 + 9,7 + 0,101 + 0,306).
- El repositorio completo ocupa 59,4 GB en disco, ya que incluye todas las variantes de cuantización de cada componente.
- GPU recomendadas: no disponibles en la información. Por capacidad, los conjuntos por encima de 20 GB implican aceleradores de centro de datos (A100, H100) o GPUs de gran VRAM; el conjunto Q8_0 y el mínimo estimado caben en GPUs de consumo de 12-24 GB, extremo que la fuente externa asocia a una ejecución en torno a 9,8 GiB de VRAM.
- Opciones de despliegue documentadas: mm-server con WebUI embebida en el puerto 8086, y las herramientas CLI mm-synth y mm-lm de minimaxmusic.cpp, compiladas con soporte de CPU, CUDA o Vulkan. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI, que no son aplicables directamente a un pipeline de cinco componentes con etapa de difusión.
- Latencia y throughput: no disponibles. No se publican tiempos de generación por minuto de audio ni requisitos de cómputo medidos.
- Nota de operación: los modelos se cargan en el primer trabajo, de modo que el arranque del servidor no consume GPU.

## Comparativa con modelos similares

No se dispone de datos comparativos con otras familias de generación musical (parámetros, contexto, rendimiento o licencia) en la información proporcionada. La comparación posible se limita a otras redistribuciones del mismo modelo encontradas en la búsqueda:

| Proyecto | Tipo | Motor o entorno | Datos disponibles |
|---|---|---|---|
| ldov/MiniMax-Music3-GGUF | Conversión GGUF del modelo base | minimaxmusic.cpp (C++17 + GGML), CPU/CUDA/Vulkan | Repositorio de 59,4 GB, 0 descargas, 0 likes, licencia community |
| scragnog/MiniMax-Music3-GGUF | Conversión GGUF del modelo base | HOT-Step CPP, aplicación de escritorio local con motor C++/GGML | El autor afirma que es la primera conversión GGUF conocida; sin cifras de tamaño ni descargas en la información disponible |
| FenomAI/MiniMax-Music3 | Redistribución de pesos con el fichero LICENSE incluido | No especificado | Solo se documentan términos de licencia (marca en productos comerciales, autorización por encima de 20 M USD, política de uso aceptable, divulgación de generación por IA) |
| Listado de local-ai-zone | Ficha agregada de descarga | No especificado | 14,7 GB, 5.989 descargas, 28 likes |

Comparación con alternativas de otras familias (MusicGen, Stable Audio Open u otras): no disponible en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: no es una licencia de código abierto aprobada por OSI. Los productos o servicios comerciales que usen los pesos deben mostrar "MiniMax-Music3" en su interfaz de usuario.
- Umbral de facturación: una facturación anual agregada superior a 20 millones de dólares requiere autorización previa por escrito de MiniMax.
- Servicios alojados: cualquier servicio que permita a terceros generar con el modelo debe implementar y mantener salvaguardas razonables contra usos y resultados infractores.
- Política de uso aceptable: el uso debe cumplir el Anexo A de la licencia, que viaja con cualquier copia que se haga de los pesos.
- Sin datos de benchmarks ni de evaluación objetiva: no hay métricas publicadas de calidad musical, inteligencia de la letra, fidelidad al caption ni comparativas con otros sistemas.
- Riesgo de alucinación trasladado al audio: en un modelo de generación musical, los errores se manifiestan como estructura de canción incoherente, articulación vocal defectuosa o artefactos de audio; no hay documentación sobre frecuencia de fallo.
- Sesgos no documentados: no se publica información sobre sesgos musicales, culturales o lingüísticos en los datos de entrenamiento.
- Cobertura idiomática limitada: solo inglés y chino en caption y letra. No hay soporte declarado para castellano ni para otros idiomas.
- Restricción de cuantización en el LM: no existe variante Q4 y el autor advierte que el modelo se degrada por debajo de Q5, lo que fija un suelo de memoria para la etapa principal.
- Componentes críticos sin cuantizar: el codificador de condición y el vocoder solo se distribuyen en F32 por ser pequeños, limitados por ancho de banda y críticos para la calidad.
- Licencias aguas arriba: el LM deriva de Qwen3-8B (Apache 2.0), el DiT de Stable Audio y el VAE de DAC (ambos MIT); cada componente arrastra sus propios términos.
- Poca validación comunitaria en este repositorio concreto: 0 descargas y 0 likes, lo que no permite corroborar la reproducibilidad de la conversión.
- Discrepancia de cifras: la estimación de VRAM del README (unos 9 GB) no coincide con la suma de los ficheros Q8_0 listados (unos 12,8 GB) ni con el dato de 9,8 GiB de una fuente externa; conviene medir en el hardware objetivo antes de dimensionar.
- Sin información sobre latencia, throughput, consumo energético o requisitos de CPU en modo sin GPU.

## Enlaces

- Repositorio analizado: https://huggingface.co/ldov/MiniMax-Music3-GGUF
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-Music3
- Licencia MiniMax-Music3 Community License: https://huggingface.co/MiniMaxAI/MiniMax-Music3/blob/main/LICENSE
- Implementación en C++/GGML: https://github.com/ServeurpersoCom/minimaxmusic.cpp
- Repositorio oficial del modelo en GitHub: https://github.com/MiniMax-AI/MiniMax-Music3
- Otra conversión GGUF (scragnog, para HOT-Step CPP): https://huggingface.co/scragnog/MiniMax-Music3-GGUF/blob/main/README.md
- Redistribución de pesos (FenomAI): https://huggingface.co/FenomAI/MiniMax-Music3/blob/main/README.md
- Análisis externo con requisitos de VRAM: http://creativeaishow.com/minimax-music-3-gguf-free-local-ai-music-that-now-runs-in-9-8-gb-of-vram/
- Ficha agregada de descarga: https://local-ai-zone.github.io/models/minimax-music3.html
