# alpinist-HF/chessformator-puzzle-generator-v2

## Resumen

Chessformator Unified Diffusion Puzzle Generator (12×768) es un modelo de difusión enmascarada (masked diffusion) especializado en la generación de puzzles tácticos de ajedrez. Lo desarrolla alpinist-HF y se distribuye a través de Hugging Face con una licencia propietaria. El modelo resuelve un problema muy concreto: producir posiciones de tablero y movimientos de solución de forma conjunta, condicionados por uno de los 66 temas tácticos soportados (fork, pin, skewer, discoveredAttack, hangingPiece, deflection, clearance, windmill, kingsideAttack, entre otros).

La arquitectura es un transformer de difusión enmascarada de 12 capas, con dimensión de modelo de 768, 6 cabezas de atención y una longitud de secuencia de 81 tokens. Con aproximadamente 113,6 millones de parámetros y pesos en FP16 de unos 217 MiB, está diseñado para ejecución en dispositivo (on-device), en concreto en GPU de Apple Silicon mediante MLX dentro de la aplicación offline Chessformator.

Su relevancia radica en el enfoque: frente a generadores autoregresivos de texto ajedrecístico, emplea difusión sobre una representación conjunta de tablero y movimientos, lo que permite generar posiciones novedosas y calibradas por tema. Es un modelo derivado por destilación de un profesor de referencia (naapeli/chess-puzzle-generator, arXiv 2609.38577, licencia MIT), pero con pesos bajo licencia propietaria, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Masked Diffusion Transformer, 12 capas, d_model=768, 6 cabezas de atencion |
| Parametros totales | 113.570.304 (~113,6 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 81 tokens de secuencia |
| Tipos de cuantizacion | FP16 (pesos publicados); no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible (modelo orientado a notacion de ajedrez, no a lenguaje natural) |
| Licencia | Propietaria (proprietary-chessformator, all rights reserved) |
| Formato de pesos | safetensors (FP16, ~217 MiB) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión enmascarada de 12 capas con dimensión de modelo 768 y 6 cabezas de atención, que opera sobre secuencias de 81 tokens. La salida es conjunta: por un lado la colocación de piezas en el tablero y por otro los tokens de movimiento candidato de la solución. Este planteamiento de difusión permite generar la posición y la solución de forma coordinada en lugar de secuencial.

El entrenamiento se basa en destilación mediante masked diffusion student training a partir de la arquitectura y el profesor de referencia naapeli/chess-puzzle-generator (arXiv 2609.38577, MIT). Los datos proceden de distribuciones de puzzles tácticos derivadas de la base de datos abierta de puzzles de Lichess (CC0). El autor indica una calibración de diversidad con exponente de aplanado de la distribución de temas de 0,75, orientada a evitar la aglomeración en plantillas y a garantizar variedad de familias tácticas, así como una auditoría de solapamiento cero de colocaciones de entrenamiento en todas las generaciones evaluadas.

## Capacidades

- Generación de puzzles tácticos de ajedrez condicionados por tema, con 66 temas soportados (fork, pin, skewer, discoveredAttack, hangingPiece, deflection, clearance, windmill, kingsideAttack, etc.).
- Predicción conjunta de la colocación del tablero y de los movimientos candidatos de solución.
- Generación por difusión enmascarada, con muestreo calibrado para favorecer la diversidad de familias tácticas.
- Ejecución on-device en GPU de Apple Silicon mediante MLX dentro de la aplicación Chessformator.
- No se documentan capacidades de lenguaje natural, tool calling, agentes, visión ni audio; el modelo está especializado exclusivamente en ajedrez táctico.

## Casos de uso

- Generación de contenido para entrenadores de ajedrez: el modelo produce puzzles de un tema concreto (por ejemplo, horquillas o clavadas) para nutrir sesiones de entrenamiento táctico sin depender de bases de datos estáticas.
- Aplicaciones offline de ajedrez en macOS/iOS: al ejecutarse con MLX en Apple Silicon, puede integrarse en apps nativas que generen ejercicios en el dispositivo sin conexión ni servidores externos.
- Aumento de datos para entrenamiento de motores o modelos de ajedrez: la generación de posiciones tácticas novedosas y auditadas sin solapamiento con el entrenamiento permite ampliar corpus de puzzles.
- Plataformas de puzzles con dificultad y tema configurables: la condición por 66 temas permite servir ejercicios segmentados por motivo táctico al usuario final.
- Investigación en generación con modelos de difusión: sirve como caso de estudio de difusión enmascarada aplicada a un dominio estructurado y discreto como el tablero de ajedrez.
- Docencia y divulgación: generación de ejemplos ilustrativos de motivos tácticos para artículos, clases o vídeos, con control explícito del tema solicitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP16 ocupan aproximadamente 217 MiB, por lo que el modelo cabe holgadamente en cualquier GPU con más de 1 GB de memoria.
- GPU recomendadas: Apple Silicon (ejecución nativa vía MLX, entorno previsto por el autor); en otras plataformas no se documenta soporte oficial.
- Cabe en GPU de consumo: sí, con margen amplio dado su tamaño (~113,6 M de parámetros); en Apple Silicon de gama base es viable.
- Opciones de despliegue: MLX en la aplicación Chessformator; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chessformator Puzzle Generator v2 | ~113,6 M | 81 tokens | Difusion enmascarada, 66 temas | Propietaria | Hugging Face |
| naapeli/chess-puzzle-generator (profesor) | No disponible | No disponible | Generador de puzzles por difusion | MIT | Hugging Face (referenciado) |
| Otros generadores de puzzles de ajedrez | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia propietaria con todos los derechos reservados: el uso comercial requiere autorización expresa del titular (chessformator.dev), pese a derivar de una arquitectura MIT.
- Modelo altamente especializado: no es un modelo de lenguaje general y no sirve para tareas fuera de la generación de puzzles tácticos.
- Longitud de secuencia fija de 81 tokens, adecuada para la representación de tablero y movimientos, pero sin flexibilidad para contextos más largos.
- Riesgo de generar puzzles sin solución válida o con soluciones ambiguas; el autor no publica métricas de validación de legalidad o corrección en la información disponible.
- Sesgos potenciales derivados de la base de datos de puzzles de Lichess (CC0), que puede sobrerrepresentar ciertos temas o niveles de dificultad.
- No se documentan idiomas soportados ni capacidades multilingües; la salida es notación de ajedrez.
- Soporte de ejecución documentado únicamente para Apple Silicon con MLX; el despliegue en otras plataformas no está garantizado.
- Ausencia de benchmarks publicados que permitan comparar su calidad frente al profesor u otras alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alpinist-HF/chessformator-puzzle-generator-v2
- Licencia y sitio del titular: https://chessformator.dev
- Paper de referencia (arXiv:2609.38577): https://arxiv.org/abs/2609.38577
- Modelo profesor: https://huggingface.co/naapeli/chess-puzzle-generator
- Base de datos de puzzles de Lichess (CC0): https://database.lichess.org/#puzzles
