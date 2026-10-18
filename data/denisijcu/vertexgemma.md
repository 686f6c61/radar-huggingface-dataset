# Denisijcu/vertexgemma

## Resumen

Vertex-Gemma Chess es un ajuste fino QLoRA del modelo google/gemma-2-2b-it, desarrollado por Vertex Coders LLC (Denis Sanchez Leyva, Miami). Está especializado en ajedrez táctico, se distribuye con licencia Gemma y declara únicamente inglés como idioma. En la información consultada, el repositorio de HuggingFace registra 0 descargas y 0 likes.

El modelo parte de un transformer decoder-only de la familia Gemma 2, con aproximadamente 2B parámetros según la denominación del modelo base; la model card no detalla la longitud de contexto ni el conteo exacto de parámetros. Se entrenó con el dataset "Grandmaster Blend" (5.000 posiciones y secuencias tácticas de élite) durante 1 época y 80 pasos, con rango LoRA 8 y precisión FP16, usando Unsloth QLoRA en una GTX 1660 Ti de 6 GB.

Su relevancia actual es acotada: sirve como ejemplo de especialización de dominio con recursos muy modestos y despliegue local vía Ollama, pero no sustituye a motores de ajedrez clásicos ni presenta benchmarks públicos. La model card lo orienta a partidas con el árbitro ChessArbiter y búsqueda táctica de 1 ply para evitar movimientos ilegales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de Gemma 2 (heredada del modelo base google/gemma-2-2b-it) |
| Parámetros totales | 2B (denominación del modelo base; no se detalla el conteo exacto en la información) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Entrenamiento QLoRA con FP16 y LoRA r=8; no se enumeran formatos de cuantización para inferencia (GGUF, AWQ, GPTQ, etc.) |
| Idiomas soportados | en (inglés) |
| Licencia | gemma |
| Formato de pesos | no disponible (el ejemplo de carga usa transformers AutoModelForCausalLM; no se especifica safetensors, GGUF ni adaptador LoRA) |
| Desarrollador | Vertex Coders LLC (Denis Sanchez Leyva) |
| Modelo base | google/gemma-2-2b-it |
| Dataset de ajuste | "Grandmaster Blend": 5.000 posiciones y secuencias tácticas de élite |
| Fecha de creación en HuggingFace | 2026-10-17 según metadatos |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un ajuste de google/gemma-2-2b-it, un transformer decoder-only de la familia Gemma 2. No se documentan cambios en la arquitectura base, en el mecanismo de atención, en el tokenizador ni en la longitud de contexto; la innovación descrita es el ajuste QLoRA con Unsloth sobre un subconjunto de ajedrez. El entrenamiento usó 5.000 posiciones y secuencias tácticas del dataset "Grandmaster Blend", 1 época, 80 pasos totales, batch efectivo 8, FP16 y rango LoRA 8.

No se menciona RLHF, DPO ni una fase de alineamiento adicional; el proceso descrito es supervisado. La cifra de 80 pasos es muy baja y no se aportan curvas de pérdida, conjunto de validación ni evaluación de fuerza de juego. Tampoco se especifica si el repositorio contiene el adaptador LoRA, los pesos fusionados o ambos.

## Capacidades

- Generación de movimientos y secuencias tácticas de ajedrez, orientada a posiciones del dataset de entrenamiento.
- Integración prevista con ChessArbiter, un árbitro de búsqueda táctica de 1 ply que valida la legalidad de las jugadas.
- Despliegue local mediante Ollama, según la model card.
- Funcionamiento en inglés, único idioma declarado.
- Puede conservar capacidades generales de instrucción del modelo base Gemma 2 2B IT, aunque no se evalúan en la información disponible.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte nativo de agentes o razonamiento multi-paso; la búsqueda táctica depende de un wrapper externo.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Bot de ajedrez local en Ollama: el modelo puede ejecutarse en un equipo con GPU modesta y proponer jugadas tácticas en partidas controladas por ChessArbiter, que filtra movimientos ilegales.
- Análisis táctico de 1 jugada: integrado en un pipeline con ChessArbiter, sirve para generar candidatos inmediatos en posiciones concretas y comparar su legalidad antes de mostrarlos al usuario.
- Aplicación educativa de ajedrez en inglés: puede producir sugerencias o comentarios breves sobre posiciones, siempre que un árbitro y una capa de validación eviten notación incorrecta.
- Prototipo de investigación en ajuste QLoRA: la receta de 80 pasos, rango 8 y FP16 sobre 5.000 ejemplos permite reproducir experimentos de especialización de dominio con hardware de 6 GB.
- Pruebas de robustez de árbitros y pipelines de ajedrez: el modelo puede usarse como generador de jugadas candidatas para comprobar si ChessArbiter rechaza correctamente movimientos ilegales o entradas ambiguas.
- Demostración de despliegue en hardware de consumo: sirve para validar flujos de inferencia local con transformers u Ollama en portátiles o equipos con GTX 1660 Ti y 6 GB de VRAM.
- Evaluación comparativa de fine-tuning de dominio: permite medir, con un protocolo propio, si un ajuste muy corto sobre un modelo de 2B mejora la calidad táctica frente al Gemma 2 2B IT sin ajustar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K, Elo, resolución de puzzles de ajedrez ni evaluaciones de legalidad de movimientos.

## Requisitos de hardware

- Ajuste fino documentado: NVIDIA GTX 1660 Ti con 6 GB de VRAM, Unsloth QLoRA, FP16, rango LoRA 8 y batch efectivo 8.
- Inferencia en FP16: estimación de aproximadamente 4 GB solo para los pesos de un modelo de 2B, más caché KV y overhead; con contexto corto puede requerir del orden de 5-6 GB, aunque no se ha verificado en la información disponible.
- Cuantización de 8 bits: estimación de 2-3 GB de VRAM para los pesos, más overhead.
- Cuantización de 4 bits: estimación de 1,5-2 GB de VRAM para los pesos, más overhead.
- GPU consumer: puede caber en una GTX 1660 Ti de 6 GB con FP16 y contexto corto, pero el margen es ajustado; 8 GB o más es recomendable. Alternativas habituales serían RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090.
- GPU de centro de datos: A100 o H100 para servir varias peticiones en paralelo, aunque no se aportan datos de throughput.
- Despliegue: transformers y Ollama son las opciones documentadas; llama.cpp/GGUF requeriría conversión no descrita; vLLM o TGI no se mencionan en la model card.
- Latencia y throughput: no disponibles. Al tratarse de un modelo de 2B, la latencia local debería ser baja en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Criterio | Vertex-Gemma Chess | Gemma 2 2B IT (base) | Alternativas pequeñas de propósito general |
|---|---|---|---|
| Especialización | Ajedrez táctico | Uso general | Uso general |
| Parámetros | 2B (denominación) | 2B (denominación) | no disponible |
| Contexto | no disponible | no disponible en la información | no disponible |
| Licencia | Gemma | Gemma | no disponible |
| Benchmarks publicados | No en la información | No en la información | no disponible |
| Disponibilidad | HuggingFace, 0 descargas | HuggingFace | no disponible |

Como alternativas de la misma categoría se pueden considerar Qwen2.5-1.5B-Instruct o Llama 3.2-3B-Instruct, pero no se aportan datos de especificaciones ni rendimiento en la información disponible, por lo que no es posible una comparación cuantitativa.

## Limitaciones y advertencias

- El ajuste consta de 1 época y 80 pasos sobre 5.000 ejemplos; no hay validación ni benchmarks que demuestren fuerza de juego o precisión táctica.
- Sin ChessArbiter u otro árbitro, el modelo puede generar movimientos ilegales, notación incorrecta o secuencias incoherentes.
- No es un motor de ajedrez autónomo comparable a Stockfish, Leela Chess Zero u otros motores clásicos.
- Solo declara inglés; no hay evaluación multilingüe.
- No se documenta la longitud de contexto, lo que impide garantizar el manejo de partidas largas o historiales extensos.
- No se documenta soporte de tool calling, agentes nativos ni razonamiento multi-paso.
- La licencia es Gemma, no Apache 2.0 ni MIT; deben revisarse los términos de uso de Gemma para explotación comercial.
- El ejemplo de código de la model card usa el identificador placeholder "your-huggingface-username/vertex-gemma-chess", distinto del ID real Denisijcu/vertexgemma.
- La fecha de creación indicada en los metadatos (2026-10-17) es posterior a la fecha actual; conviene verificar la consistencia del repositorio.
- El repositorio tiene 0 descargas y 0 likes, sin validación independiente de la comunidad.
- No se documentan evaluaciones de sesgo; al derivar de Gemma 2 y de un dataset de élite, puede heredar sesgos del modelo base y del corpus.
- No se especifica si los pesos publicados son el adaptador LoRA o el modelo fusionado, lo que afecta a la reproducibilidad del despliegue.

## Enlaces

- https://huggingface.co/Denisijcu/vertexgemma
- https://huggingface.co/google/gemma-2-2b-it
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
