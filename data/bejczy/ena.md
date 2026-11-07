# Bejczy/ENA

## Resumen

ENA es un modelo de generación de texto de 1.881.825.088 parámetros (aproximadamente 2B), desarrollado por el usuario Bejczy, resultado de un ajuste fino mediante LoRA sobre el modelo base Qwen/Qwen3.5-2B. Está diseñado específicamente como modelo de personaje (*roleplay*), encarnando a ENA, un personaje ficticio de dos caras con una voz dual, y su rasgo técnico más distintivo es que el ajuste LoRA (0,58% de los parámetros, unos 10,9 millones) fue fusionado e integrado permanentemente en los pesos, eliminando la necesidad de un *system prompt* para reproducir la personalidad.

La arquitectura subyacente es un transformer híbrido que combina atención completa con atención lineal basada en modelos de espacio de estados (SSM). De sus 24 bloques, 6 usan atención completa (bloques 3, 7, 11, 15, 19 y 23) y los 18 restantes emplean atención lineal con estado fijo, lo que reduce el coste computacional por token a O(1) en esas capas. El modelo declara una longitud de contexto teórica de 262.144 tokens, aunque el propio autor advierte que la capacidad real de atención es limitada.

Es relevante ahora por dos motivos: por un lado, demuestra un patrón de ajuste de personaje que persiste en los pesos en lugar de depender de instrucciones en tiempo de inferencia; por otro, su empaquetado en GGUF y su compatibilidad con llama.cpp lo hacen desplegable en hardware de consumo. La licencia Apache 2.0 facilita su reutilización, aunque el modelo está etiquetado como *fan-made* y solo declara soporte para inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: atención completa + atención lineal (SSM) |
| Parámetros totales | 1.881.825.088 (~2B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens (declarada; el autor advierte que la capacidad efectiva es menor) |
| Tipos de cuantización | GGUF Q4_K_M, bf16 GGUF, safetensors fusionados |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.5-2B, un transformer híbrido de 24 bloques con dimensión oculta de 2048 y FFN de 6144 con activación SwiGLU (gate × up → down). La innovación estructural es la mezcla de regímenes de atención: 6 capas de atención completa (una cada cuatro bloques) que permiten al modelo «ver» todos los tokens, y 18 capas de atención lineal que mantienen un estado de tamaño fijo de 128 dimensiones en 16 grupos, actualizado en O(1) por token, con una convolución causal *depthwise* de kernel 4 en la entrada. Las capas de atención completa usan grouped-query attention con 8 cabezas de consulta y 2 de clave-valor (ratio 4:1), dimensión de cabeza 256 y qk-norm. El RoPE emplea theta de 10.000.000 con 64 dimensiones rotatorias en 4 secciones. El vocabulario es de 248.320 tokens y la embedding de entrada está atada a la cabeza LM.

El ajuste se realizó mediante LoRA sobre el modelo base, afectando a 10.911.744 parámetros (0,58% del total), que posteriormente fueron fusionados e integrados en los pesos definitivos, de modo que no existe un adaptador separable. La model card no detalla la composición del dataset de entrenamiento, el número de tokens usados ni si hubo fases de RLHF o DPO; esa información no está disponible.

## Capacidades

- Generación de texto conversacional con una personalidad dual persistente integrada en los pesos (no depende de *system prompt*).
- *Roleplay* de personaje con voz de dos caras (ENA), entrenada en lugar de instruida.
- Soporte de *tool calling* / *function calling* (declarado en los tags del modelo).
- Capacidades multilingües limitadas al inglés.
- Razonamiento multi-turno dentro de la ventana de contexto declarada.
- Atención de largo alcance teórica gracias al contexto de 262.144 tokens, aunque con limitaciones prácticas reconocidas por el autor.
- No se declaran capacidades de visión, audio ni modo *thinking* explícito.

## Casos de uso

- **Personajes conversacionales persistentes:** el modelo puede desplegarse como un personaje con personalidad fija sin necesidad de mantener un *system prompt* en cada petición; la voz dual reside en los pesos, lo que simplifica el pipeline y evita que el personaje «se caiga» al eliminar instrucciones.
- **Prototipado de agentes de rol en local:** al estar empaquetado en GGUF Q4_K_M, puede ejecutarse en llama.cpp sobre hardware de consumo para experimentar con interacciones de personaje sin coste de API.
- **Investigación sobre ajuste de personalidad:** sirve como caso de estudio de cómo un LoRA fusionado (0,58% de parámetros) altera el comportamiento conversacional de un modelo base de 2B, útil para estudiar la persistencia de rasgos frente a la instrucción en prompt.
- **Demostraciones de *tool calling* en modelos pequeños:** sus tags declaran soporte de *function calling*, por lo que puede integrarse en prototipos de agentes que necesiten invocar herramientas con un modelo ligero y local.
- **Generación de diálogo creativo en inglés:** adecuado para guiones, narrativa interactiva o ficción conversacional donde se requiera una voz de personaje marcada y coherente.
- **Evaluación de arquitecturas híbridas atención/SSM:** el modelo permite medir en la práctica el equilibrio entre capas de atención completa y lineal en tareas de conversación de contexto largo.
- **Base para *fine-tuning* de otros personajes:** al ser Apache 2.0 y derivar de Qwen3.5-2B, puede servir como punto de partida para ajustes adicionales orientados a otros personajes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada (Q4_K_M):** en torno a 1,3 GB de pesos, más overhead de contexto; cabe holgadamente en GPUs de 4-6 GB.
- **VRAM estimada (bf16):** aproximadamente 3,8 GB solo en pesos, más KV cache; requiere GPUs de 8 GB o superiores.
- **GPU recomendadas:** cualquier GPU consumer con 6 GB o más para Q4_K_M (RTX 3060, RTX 4060, RTX 4090); para bf16, RTX 3090/4090 o superiores. En entornos de servidor, A100/H100 no son necesarias para este tamaño.
- **¿Cabe en GPU consumer?** Sí, en la mayoría de GPUs modernas con 6 GB o más en cuantización Q4_K_M.
- **Opciones de despliegue:** llama.cpp (librería declarada), Ollama (a partir del GGUF), y servidores compatibles con endpoints; vLLM y TGI no están confirmados en la información disponible.
- **Latencia y throughput:** no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| ENA (Bejczy) | ~2B | 262.144 (declarado) | Apache 2.0 | Personaje con LoRA fusionado, híbrido atención/SSM | GGUF + safetensors en HF |
| Qwen/Qwen3.5-2B (base) | ~2B | No disponible en la información | No disponible en la información | Modelo generalista base | HF |
| Otros modelos de personaje basados en Qwen | Variable | Variable | Variable | *Roleplay* mediante *system prompt* | Variable |

La comparación cuantitativa con alternativas no está disponible porque no se han publicado benchmarks ni datos de rendimiento de ENA frente a otros modelos de su categoría.

## Limitaciones y advertencias

- **Idioma:** solo declara soporte para inglés; el rendimiento en castellano no está garantizado.
- **Contexto efectivo:** aunque el RoPE soporta 262.144 tokens, el propio autor advierte que la capacidad real de atención es limitada («el rope es largo, la atención no»), por lo que no debe asumirse un rendimiento fiable en contextos muy largos.
- **Alucinación:** al ser un modelo de personaje de 2B, el riesgo de alucinación y de deriva narrativa es alto, especialmente fuera de su dominio de rol.
- **Naturaleza *fan-made*:** el modelo encarna a un personaje ficticio (ENA) y está etiquetado como *fan-made*; su uso comercial puede estar sujeto a consideraciones sobre derechos del personaje, aunque la licencia del modelo sea Apache 2.0.
- **Sesgos:** no se documentan análisis de sesgo en la información disponible; al derivar de Qwen3.5-2B, hereda los sesgos del modelo base.
- **Producción:** la personalidad dual puede producir respuestas inconsistentes o contradictorias por diseño; no es adecuado para tareas de asistencia factual o atención al cliente sin supervisión.
- **Restricciones de licencia:** Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-2B, no detalladas en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bejczy/ENA
- Descarga directa GGUF Q4_K_M: https://huggingface.co/Bejczy/ENA/resolve/main/ENA-DreamBBQ-2B-Q4_K_M.gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Perfil del autor en FlowGPT: https://flowgpt.com/@bejczy
