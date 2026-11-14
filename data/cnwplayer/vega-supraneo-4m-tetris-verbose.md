# CNWPlayer/Vega-SupraNeo-4M-Tetris-Verbose

## Resumen

Vega-SupraNeo-4M-Tetris-Verbose es un ajuste fino (finetune) del modelo base SupraLabs/SupraNeo-4M, un transformer decoder-only de tipo Qwen3 con 4.070.240 parámetros entrenado desde cero. Lo publica el usuario CNWPlayer en Hugging Face y su propósito declarado es jugar a Tetris, especializándose en un corpus construido a partir de datos del espacio SLM-Tetris-Arena de DedeProGames. El autor afirma que supera a todos los modelos de esa arena, aunque no aporta métricas verificables.

Se trata de un modelo de investigación de escala "tiny" (12 capas, hidden size 160, 4 cabezas de atención con 2 KV heads), con una ventana de contexto de solo 1K tokens y un vocabulario de 4.096 entradas. El preentrenamiento del modelo base usó los datasets FineWeb-Edu y DCLM-Baseline, y el ajuste fino se orienta a una tarea muy concreta de generación de texto estructurado (secuencias de juego).

Su relevancia es acotada pero clara: es un ejemplo práctico de cómo un modelo de 4 millones de parámetros puede especializarse en una tarea de dominio cerrado con muy poco coste computacional (el autor estima 460 kg de CO2eq para un único run de preentrenamiento en una A100). No es un modelo de propósito general; es una pieza de investigación y una demostración de finetuning de bajo presupuesto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Qwen3 |
| Parámetros totales | 4.070.240 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1K tokens |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin cuantización explícita) |
| Idiomas soportados | inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

Datos adicionales de la model card: 12 capas, hidden size 160, 4 cabezas de atención, 2 KV heads, intermediate size 432, vocabulario de 4.096 tokens.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con atención multi-cabeza con KV heads reducidas (4 cabezas de consulta y 2 de clave/valor, es decir, GQA), 12 capas y un tamaño oculto de 160. El vocabulario es de 4.096 tokens, muy pequeño, coherente con un modelo de dominio cerrado. La arquitectura sigue la familia Qwen3, según la etiqueta del repositorio.

El preentrenamiento del modelo base SupraNeo-4M se realizó desde cero sobre FineWeb-Edu y DCLM-Baseline-1.0, según los datasets declarados. El ajuste fino que da lugar a esta variante se hizo sobre un corpus construido a partir de datos del espacio SLM-Tetris-Arena. No se documentan detalles sobre número de tokens de entrenamiento, composición exacta del corpus de finetuning, ni si hubo RLHF, DPO o alguna técnica de alineación. El consumo estimado declarado es de 460 kg CO2eq para un único run de preentrenamiento en 1x NVIDIA A100.

## Capacidades

- Generación de texto autoregresiva en inglés, con foco en secuencias de juego de Tetris.
- Especialización en la tarea de "Tetris verbose", presumiblemente generación de movimientos o descripciones de partidas en formato textual.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés (idioma declarado: en).
- No dispone de visión, audio ni modo "thinking" documentado.
- Contexto muy corto (1K tokens), adecuado solo para interacciones breves.

## Casos de uso

- Investigación sobre especialización de modelos minúsculos: sirve como caso de estudio de cómo un modelo de 4M de parámetros puede ajustarse a una tarea de dominio cerrado con recursos mínimos, útil para estudiar curvas de especialización y olvido catastrófico.
- Evaluación comparativa en la SLM-Tetris-Arena: el modelo puede desplegarse como agente de juego en esa arena para medir su rendimiento frente a otros SLM, dado que el autor lo presenta como el mejor de la arena.
- Generación de secuencias de juego sintéticas: puede emplearse para producir datos de entrenamiento o de validación en formato textual para pipelines de simulación de Tetris.
- Demostraciones educativas de finetuning: por su tamaño (repo de 0.0 GB, pesos safetensors), es viable ejecutarlo en CPU o en GPUs de gama baja para talleres y tutoriales sobre transformers.
- Pruebas de integración con text-generation-inference: el repositorio declara compatibilidad con TGI y endpoints, por lo que puede usarse como modelo de prueba en despliegues ligeros.
- Benchmarking de infraestructura de inferencia: al ser tan pequeño, permite medir latencia y throughput de frameworks (vLLM, TGI, llama.cpp) sin cuellos de botella de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica "Good at Tetris" y afirma que supera a todos los modelos de la SLM-Tetris-Arena, sin cifras ni metodología.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp16 (4,07M parámetros × 2 bytes ≈ 8 MB de pesos, más overhead de activaciones y KV cache para 1K de contexto).
- GPU recomendadas: cualquier GPU moderna, incluidas RTX 3060, RTX 4090, A100 o H100; también es viable en CPU.
- Cabe en cualquier GPU de consumo, e incluso en dispositivos embebidos o entornos sin GPU.
- Opciones de despliegue: transformers, text-generation-inference (declarado compatible), y previsiblemente llama.cpp u Ollama si se generan pesos GGUF (no publicados en el repo).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, se espera latencia de milisegundos en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Vega-SupraNeo-4M-Tetris-Verbose | 4,07M | 1K | apache-2.0 | Finetune para Tetris |
| SupraLabs/SupraNeo-4M (base) | 4,07M | 1K | no disponible en la información | Preentrenado desde cero |
| Otros SLM de la SLM-Tetris-Arena | no disponible | no disponible | no disponible | Agentes de juego Tetris |

No se dispone de datos de rendimiento comparativo verificable frente a alternativas. La comparación con otros modelos de la arena solo puede hacerse cualitativamente a partir de la afirmación del autor.

## Limitaciones y advertencias

- Modelo de dominio muy restringido: su utilidad fuera de la tarea de Tetris es prácticamente nula; no debe usarse como modelo de propósito general.
- Contexto de solo 1K tokens, insuficiente para conversaciones multi-turno o documentos largos.
- Solo inglés declarado; no hay evidencia de capacidades multilingües.
- Riesgo alto de alucinación y de generar secuencias inválidas fuera del formato de juego esperado.
- No hay datos de sesgos ni evaluaciones de seguridad; al ser un modelo de investigación de 4M de parámetros, su calidad factual es muy limitada.
- Licencia apache-2.0 permite uso comercial, pero el modelo base y el corpus de finetuning pueden tener condiciones adicionales no documentadas; conviene verificar la licencia de SupraLabs/SupraNeo-4M y del espacio SLM-Tetris-Arena antes de un uso en producción.
- La model card incluye afirmaciones no verificadas ("dominates", "HILARIOUSLY good") y reconoce el uso de IA en su creación; no debe tomarse como evaluación independiente.
- No se publican pesos cuantizados ni GGUF, lo que limita el despliegue en algunos entornos.

## Enlaces

- Hugging Face: https://huggingface.co/CNWPlayer/Vega-SupraNeo-4M-Tetris-Verbose
- Modelo base: https://huggingface.co/SupraLabs/SupraNeo-4M
- Espacio SLM-Tetris-Arena: https://huggingface.co/spaces/DedeProGames/SLM-Tetris-Arena
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset DCLM-Baseline-1.0: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
