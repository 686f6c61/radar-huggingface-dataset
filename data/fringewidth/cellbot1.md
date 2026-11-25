# fringewidth/cellbot1

## Resumen

cellbot1 es un modelo de política para robótica de enjambre desarrollado por el usuario fringewidth. Se trata de un adaptador LoRA de rango 64 sobre el modelo de lenguaje Qwen3-0.6B, al que se le añaden capas de entrada y salida nuevas para procesar una rejilla 32 x 32 como observación y emitir una distribución de movimiento por celda. El modelo traduce instrucciones en inglés natural a movimientos coordinados de aproximadamente 100 robots simulados, lo que lo convierte en un ejemplo poco habitual de uso de un LLM como controlador de enjambre mediante imitación de comportamiento.

La relevancia del modelo es doble: por un lado, demuestra que un LLM pequeño (0,6B parámetros) puede servir como política de control multiagente cuando se le dota de una interfaz visual estructurada (tokens de parche de 4 x 4) y de una cabeza de decisión discreta sobre 9 movimientos posibles. Por otro, su enfoque de atención segregada —el texto atiende solo al texto de forma causal, mientras que los tokens de escena atienden a todo— preserva las capacidades lingüísticas del modelo base al tiempo que permite condicionamiento multimodal.

El repositorio contiene únicamente los pesos entrenados (LoRA más capas nuevas, unos 41M parámetros en float16), no el modelo base completo. El entrenamiento se realizó mediante clonación de comportamiento sobre demostraciones de expertos programados en MuJoCo, con unas 40 horas de GPU T4 en Kaggle, y se detuvo por agotamiento de cómputo con la pérdida de validación aún descendiendo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-0.6B) con LoRA rango 64 en todas las proyecciones de atención y MLP, más capas de entrada (tokens de parche 4x4) y salida (readout lineal a 9 movimientos) |
| Parametros totales | Aproximadamente 41M parámetros entrenables (LoRA + capas nuevas); el modelo base Qwen3-0.6B se carga por separado |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explícita; la escena se codifica en 64 tokens de parche más los tokens de instrucción |
| Tipos de cuantizacion | No disponible (pesos publicados en float16) |
| Idiomas soportados | Instrucciones en inglés (según los ejemplos de la model card); no se declaran otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cellbot1.safetensors, float16) |

## Arquitectura y entrenamiento

cellbot1 parte de Qwen3-0.6B congelado y le superpone un LoRA de rango 64 en cada proyección de atención y MLP, además de capas de entrada y salida nuevas. La instrucción en lenguaje natural se tokeniza como texto ordinario. La observación del mundo se codifica como 10 canales (robots, muros, máscara y color de queso, máscara y color de caja) que se dividen en 64 tokens de parche de 4 x 4 con embeddings aprendidos de fila y columna. La atención está segregada: los tokens de texto atienden causalmente solo a otros tokens de texto, de modo que el procesamiento lingüístico del LM no se altera, mientras que los tokens de escena atienden a todo. Una cabeza lineal produce, por cada celda de la rejilla, una distribución sobre 9 movimientos (8 vecinos o quedarse quieto). En inferencia, cada robot muestrea su movimiento en cada paso con classifier-free guidance de 2.0.

El entrenamiento consistió en clonación de comportamiento sobre demostraciones generadas por expertos programados en una suite de tareas sintéticas (comer quesos por color y por lógica, cajas, regiones, direcciones, formas, letras, pastoreo, persecución y separación). A esto se añadieron episodios de juego captionados por Claude Haiku y destilación del LM congelado sobre texto general para no perder la parte lingüística. El cómputo total fue de unas 40 horas de GPU T4 en Kaggle, y el entrenamiento se detuvo por falta de recursos con la pérdida de validación bajando de 0,40 a 0,31 en la última ejecución.

## Capacidades

- Control de enjambre robótico simulado: genera un movimiento por celda para aproximadamente 100 robots en una rejilla 32 x 32 a partir de instrucciones en inglés.
- Comprensión de instrucciones compuestas y de reemplazo en mitad de la ejecución: la model card reporta éxito en tareas de tres comandos donde solo cuenta el último.
- Razonamiento espacial básico sobre la rejilla: distingue colores, formas, regiones, direcciones y relaciones lógicas (por ejemplo, "come el queso rojo o el morado").
- Tareas de manipulación colectiva: comer quesos, entrar en cajas, moverse en una dirección, formar letras y figuras, pastorear, perseguir y dividirse.
- Sin soporte declarado de tool calling ni function calling.
- Sin soporte declarado de agentes multi-paso más allá del bucle de control paso a paso.
- Capacidad multilingüe no declarada; los ejemplos y el entrenamiento usan inglés.
- No dispone de memoria entre fotogramas: solo ve el estado actual de la rejilla.

## Casos de uso

- Investigación en control de enjambres: servir como política de referencia para comparar estrategias de coordinación de aproximadamente 100 agentes en una rejilla 32 x 32, aprovechando que el modelo traduce instrucciones directamente a movimientos por celda.
- Prototipado rápido de tareas de robótica colectiva en simulación: usar MuJoCo y la suite de tareas incluida para validar instrucciones como "clear the board of cheese" sin escribir controladores específicos.
- Estudio de interfaces lenguaje-acción: analizar cómo un LLM pequeño con atención segregada entre texto y escena preserva el procesamiento lingüístico mientras actúa como política, útil para investigar arquitecturas híbridas lenguaje-control.
- Generación de datos sintéticos de comportamiento: emplear las rollouts del modelo como demostraciones aumentadas o negativas para entrenar políticas posteriores o para estudiar fallos de grounding.
- Docencia y divulgación: el repositorio incluye un demo en Hugging Face Spaces y renderizado de vídeo en MuJoCo junto a la rejilla, lo que facilita explicar clonación de comportamiento y control multiagente en cursos.
- Evaluación de robustez ante instrucciones fuera de distribución: probar cómo responde el modelo a comandos alejados de las familias de tareas entrenadas, sabiendo que no hay verificador automático para esos casos.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre escenas nuevas, 8 rollouts por instrucción, éxito medido por el verificador propio de cada tarea:

| Instruccion | MuJoCo | Rejilla cruda |
|---|---|---|
| eat the red cheese | 8/8 | 7/8 |
| eat either yellow or purple | 7/8 | 7/8 |
| clear the board of cheese | 7/8 | 6/8 |
| go into the blue box | 7/8 | 8/8 |
| move left | 7/8 | 7/8 |
| three commands, each replaced mid-motion: last one met | 6/8 | 7/8 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador ocupa unos 0,1 GB en float16; sumado al modelo base Qwen3-0.6B, el conjunto cabe holgadamente en GPUs de consumo con 4-8 GB de VRAM, y el ejemplo de la model card funciona incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; el entrenamiento se realizó en T4. Para lotes grandes o barridos de evaluación conviene una RTX 4090 o superior.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: el paquete propio `cellbot` (instalable desde GitHub) con PyTorch; el ejemplo oficial soporta CPU, CUDA y MPS. No se documenta integración con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cellbot1 | ~41M entrenables + Qwen3-0.6B congelado | No disponible (64 tokens de escena + instrucción) | Control de enjambre en rejilla 32 x 32 | Apache 2.0 | Hugging Face, código en GitHub |
| Qwen3-0.6B | 0,6B | No disponible en esta ficha | LM general | Apache 2.0 | Hugging Face |
| Políticas de enjambre basadas en reglas (expertos programados de la suite) | No aplica | No aplica | Tareas específicas de la suite | Depende de la implementación | Código de cellbot |

No se dispone de información sobre otros modelos comparables de política de enjambre con interfaz de lenguaje natural en la documentación proporcionada.

## Limitaciones y advertencias

- Entrenado solo en una rejilla simulada de 32 x 32 con hasta 6 quesos y 3 cajas; no generaliza a otros tamaños, densidades ni entornos.
- Sin memoria: solo ve el fotograma actual, lo que limita tareas que requieren estado a lo largo del tiempo.
- Los quesos en esquinas y recovecos son difíciles de empujar o rodear; empujar un queso hasta un objetivo (familia herd) es poco fiable.
- El grounding por color de caja cuando hay varias cajas presentes es su prueba más débil.
- El texto libre alejado de las familias de tareas entrenadas recibe un intento, pero no hay verificador que lo valide.
- No probado en robots reales.
- Riesgo de alucinación y de instrucciones mal interpretadas fuera de distribución; los porcentajes de éxito reportados son sobre 8 rollouts por tarea, una muestra pequeña.
- El entrenamiento se detuvo por falta de cómputo con la pérdida de validación aún bajando, por lo que el modelo no está completamente convergido.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-0.6B tiene su propia licencia que debe respetarse por separado.

## Enlaces

- Hugging Face: https://huggingface.co/fringewidth/cellbot1
- Código: https://github.com/fringewidth/cellbot
- Demo: https://huggingface.co/spaces/fringewidth/cellbot
- Documentación de entrenamiento: https://github.com/fringewidth/cellbot/blob/main/docs/TRAINING.md
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
