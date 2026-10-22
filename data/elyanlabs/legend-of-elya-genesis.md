# elyanlabs/legend-of-elya-genesis

## Resumen

Legend of Elya Genesis es un modelo de lenguaje transformer de tipo decoder-only con mezcla de expertos (MoE) y pesos ternarios que ejecuta inferencia en un Sega Genesis de 1988, sobre un Motorola 68000 a 7,67 MHz, sin FPU ni multiplicación de 32 bits, con 64 KB de RAM de trabajo. Lo publica el colectivo elyanlabs (origen en el repositorio de Scottcjn) como instantánea de código del proyecto "Transformers on Retro Game Consoles", y no como un modelo utilizable en la infraestructura de Hugging Face: el repositorio pesa 0,0 GB y no contiene pesos en formatos convencionales.

El interés no es la calidad conversacional, sino la tesis que el proyecto pone a prueba: que el coste de activación de un experto es una propiedad del modelo de direccionamiento y no de la arquitectura. En una GPU, un experto ocupa VRAM aunque no se active; en el Genesis, la ROM del cartucho está mapeada en memoria, de modo que activar un experto consiste en re-apuntar un puntero, sin copias ni RAM adicional. El modelo sirve como instrumento de medida de ese efecto, no como asistente.

El tamaño es minúsculo: el shard individual que obtiene los mejores resultados tiene 114 000 parámetros, y la variante MoE emplea cuatro expertos con enrutado implementado íntegramente en el motor en C. La relevancia actual es metodológica: documenta con detalle qué falló (capacidad insuficiente al mezclar cuatro temas, degradación posicional a partir de 13-28 caracteres) y cómo un positional encoding absoluto aprendido, por 4 KB de ROM y un +3,6 % de parámetros, llevó las respuestas exactas de 0/38 a 36/38 sin romper el buffer circular de KV.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (Lock-On MoE, 4 expertos) y positional encoding absoluto aprendido; aritmética entera, pesos ternarios |
| Parámetros totales | 114 000 en el shard individual; total del MoE de 4 expertos no disponible |
| Parámetros activos | Enrutado por experto con router implementado en el motor en C; número exacto de parámetros activos no disponible |
| Longitud de contexto | No disponible (el modelo usa un buffer circular de KV; el tamaño del buffer no se especifica) |
| Tipos de cuantización | Ternaria (integer-only, sin FPU ni multiplicación de 32 bits) |
| Idiomas soportados | No disponible; los ejemplos documentados y el corpus de evaluación están en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | ROM de Sega Genesis (`rom.bin`, release v0.1.0); el repositorio de Hugging Face no incluye pesos (0,0 GB). No hay safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal de pesos ternarios con cuatro expertos y enrutado tipo Lock-On, más positional encoding absoluto aprendido. La decisión de usar posiciones absolutas en lugar de RoPE o ALiBi es explícita: al incorporar la posición en cada K/V en el momento de almacenarlo en caché, la atención sigue siendo invariante al orden y sobrescribir la ranura más antigua del buffer circular de KV resulta exactamente equivalente. El coste de esa elección se cifra en 4 KB de ROM, un +3,6 % de parámetros y 64 sumas adicionales por token (unas 512 de los 127 840 ciclos de un frame). El enrutado de expertos se ejecuta íntegramente en el motor en C, sin soporte hardware.

No se dispone de datos sobre volumen de entrenamiento, composición del dataset, número de tokens ni uso de RLHF o DPO. Lo único documentado es el corpus de evaluación: 122 pares de pregunta-respuesta repartidos en cuatro temas no relacionados entre sí. El proyecto documenta además un fallo de capacidad: un único modelo de 114 000 parámetros que intentaba memorizar los 122 pares de los cuatro temas producía ensalada de palabras, mientras que el mismo modelo restringido a un solo tema generaba frases completas. No se mencionan técnicas de decodificación especulativa ni atención lineal.

## Capacidades

- Generación de texto autoregresiva en inglés, con arranque en frío, sobre hardware de 1988.
- Respuesta a preguntas de un corpus cerrado de 122 pares QA en cuatro temas; 36 de 38 respuestas exactas en la configuración de shard único con positional encoding.
- Enrutado condicional entre cuatro expertos, con la ventana "MIND" del juego mostrando qué parte del modelo responde.
- Cuantización ternaria extrema y aritmética entera pura, sin coma flotante.
- Mantenimiento de estado conversacional mediante buffer circular de KV.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento extendido.
- No hay evidencia de capacidades multilingües: el corpus y las respuestas documentadas están en inglés.

## Casos de uso

- Investigación sobre coste de activación en MoE: usar el puerto como banco de pruebas donde activar un experto es re-apuntar un puntero sobre ROM mapeada, y medir la diferencia frente a arquitecturas con copia a VRAM. Es el caso de uso central del proyecto.
- Docencia sobre caché KV y positional encoding: el proyecto demuestra empíricamente por qué el PE absoluto preserva la semántica de un buffer circular y RoPE no, con una medición de 0/38 a 36/38 respuestas exactas por 4 KB de ROM.
- Divulgación y exhibición: la ROM corre en BlastEm, Genesis Plus GX o hardware real vía flash cart, con demo grabada y contador de tokens por segundo en pantalla; encaja en charlas, ferias y exposiciones retro.
- Estudio de cuantización ternaria: el modelo sirve para observar hasta dónde llega un transformer de 114 000 parámetros con pesos de tres niveles y aritmética entera, y qué tipo de errores aparecen (respuestas fluidas y plausibles pero incorrectas).
- Medición reproducible de ciclos: los taps de memoria de MAME en `tools/mame/` permiten obtener ciclos de bus exactos y reproducibles al entero, útiles para validar modelos analíticos de rendimiento en 68000.
- Base para ports a otras consolas: el proyecto hermano `legend-of-elya-n64` reutiliza la character y el enfoque con un esquema distinto de streaming desde cartucho, lo que lo convierte en plantilla para llevar inferencia a otras plataformas con memoria mapeada.

## Benchmarks y rendimiento

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún benchmark estándar de LLM en la información disponible. Las métricas publicadas son internas y específicas del proyecto.

Calidad de respuesta, medida como coincidencia media de prefijo exacto contra las respuestas de referencia del propio corpus, con decodificación greedy y el mismo motor en C para todos los sistemas:

| Sistema | Prefijo exacto medio | Notas |
|---|---|---|
| Corpus completo, sin positional encoding | 1,9 caracteres | Punto de partida |
| Corpus completo + PE | 7,3 caracteres | |
| Lock-On MoE, 4 expertos + PE | 11,1 caracteres | Router íntegramente en el motor en C |
| Shard único + PE | 35,9 caracteres | 36/38 respuestas exactamente correctas |

Rendimiento en hardware real (Sega Genesis Model 1, 1988):

| Métrica | Valor |
|---|---|
| Arranque en frío hasta el menú | 13,9 s |
| Generación, medida por el operador | ~1,97 tok/s |
| Contador en pantalla (basado en vblanks de la consola) | 1,77-2,00 tok/s |
| Bench headless | 2,21 tok/s |
| Inferencia pura | 27,13 frames por forward pass |
| Cifra citada en la introducción ("piensa a") | ~1,2 tok/s |

El propio autor advierte que estas cifras miden cosas distintas: la inferencia pura consume 27,13 frames por pasada, y el resto del tiempo se emplea en dibujar glifos, animar la boca y actualizar el contador. La cuantización del contador es de 60/k porque el juego ejecuta una pasada por bucle y sincroniza con vblank, de modo que 2,00 tok/s equivale exactamente a 30 frames por token y 1,77 a 34. Existe una medición de ciclos en MAME para 24 tokens generados a partir de un prompt de 14 tokens, con 220 579 814 ciclos en la versión anterior; el resto del desglose aparece truncado en la información disponible. El autor también corrige un dato previo: el "speedup de 11,3x" se midió en un host x86, no en un 68000, y la estimación estática sobre el objetivo real es de ~1,7-3x.

## Requisitos de hardware

- Plataforma objetivo: Sega Genesis Model 1 (1988), Motorola 68000 a 7,67 MHz, sin FPU, sin multiplicación de 32 bits, 64 KB de RAM de trabajo.
- Almacenamiento: los pesos residen en la ROM del cartucho, mapeada en memoria; se ejecuta desde flash cart en hardware real o desde `rom.bin` en emulador.
- Emuladores compatibles: BlastEm y Genesis Plus GX; MAME con taps de memoria para medición de ciclos en `tools/mame/`.
- VRAM de GPU: no aplica; el modelo no se ejecuta sobre GPUs y no hay runtime CUDA, ROCm ni Metal.
- Opciones de despliegue convencionales: no disponible. No hay soporte para vLLM, llama.cpp, Ollama, TGI ni transformers; la model card indica explícitamente que nada del repositorio corre sobre la infraestructura de Hugging Face.
- Throughput: ~1,77-2,21 tok/s según qué se mida (contador en pantalla, medición del operador o bench headless), con 13,9 s de arranque en frío.
- Latencia: 27,13 frames por forward pass en inferencia pura, sincronizada con vblank.

## Comparativa con modelos similares

No se han identificado modelos comparables publicados con pesos y métricas verificables en la información disponible; la comparación cuantitativa con alternativas queda como no disponible. Como referencias cualitativas del mismo proyecto:

| Modelo | Plataforma | Parámetros | Enfoque | Licencia | Estado |
|---|---|---|---|---|---|
| Legend of Elya Genesis | Sega Genesis (68000, 7,67 MHz) | 114 000 por shard; MoE de 4 expertos | Pesos ternarios, PE absoluto, MoE con expertos en ROM mapeada | Apache 2.0 | ROM publicada (v0.1.0), código en GitHub y GitLab |
| Legend of Elya N64 | Nintendo 64 | No disponible | Mismo personaje, streaming desde cartucho con otro esquema | No disponible | Proyecto hermano en el mismo repositorio de ports |

## Limitaciones y advertencias

- El modelo alucina de forma demostrable: a la pregunta "What is your name?" responde "Scott, who keeps the thread between sessions.", una frase fluida y relacionada pero incorrecta. El autor lo señala como prueba de que no es una tabla de búsqueda.
- Puede divagar más allá del final de una respuesta; el propio autor lo describe como trabajo en curso y limita la afirmación a "inferencia local coherente", no a un chatbot pulido.
- Corpus de evaluación mínimo: 122 pares QA en cuatro temas; el modelo no generaliza fuera de ese dominio y no hay datos de rendimiento en texto libre.
- Fallo de capacidad documentado: un solo modelo de 114 000 parámetros no puede cubrir cuatro temas no relacionados sin degradarse a ensalada de palabras.
- Degradación posicional: sin positional encoding, las respuestas empiezan bien y se corrompen entre los 13 y los 28 caracteres.
- Idiomas: no hay evidencia de soporte multilingüe; todo el material documentado está en inglés.
- Contexto: la longitud efectiva del buffer circular de KV no se especifica, por lo que no puede planificarse un uso conversacional multi-turno largo.
- Licencia Apache 2.0 permite uso comercial del código, pero el repositorio de Hugging Face no contiene pesos (0,0 GB) ni pipeline declarado; cualquier uso requiere partir del repositorio de GitHub o GitLab.
- Las cifras de rendimiento publicadas miden cosas distintas (contador en pantalla, medición del operador, bench headless) y el autor ha corregido públicamente al menos un resultado previo medido en la máquina equivocada; conviene tratarlas con cautela.
- Fecha de creación del repositorio en Hugging Face: 2026-10-21, según los metadatos de la plataforma.

## Enlaces

- Hugging Face: https://huggingface.co/elyanlabs/legend-of-elya-genesis
- Repositorio GitHub: https://github.com/Scottcjn/legend-of-elya-genesis
- Repositorio GitLab (historial completo): https://gitlab.com/elyan-labs/legend-of-elya-genesis
- Proyecto en Hackaday.io: https://hackaday.io/project/206401-transformers-on-retro-game-consoles
- Demo completa sin editar: https://bottube.ai/watch/7Pqggb2bh28
- Demo corta: https://bottube.ai/watch/7eMzfZw8Z09
- Release v0.1.0 con `rom.bin`: https://github.com/Scottcjn/legend-of-elya-genesis/releases/tag/v0.1.0
- Proyecto hermano N64: https://github.com/Scottcjn/legend-of-elya-genesis/tree/main/../legend-of-elya-n64 (referenciado como `../legend-of-elya-n64` en la model card)
- Documentación interna citada: `FINDINGS.md`, `docs/SPEED_PLAN.md`, `tools/mame/` en el repositorio de GitHub
