# Kiyo1130/Qwen3.8-27B-QSA-Loop-v1-GGUF

## Resumen

Qwen3.8-27B-QSA-Loop-v1-GGUF es una variante experimental del modelo Qwen3.8-27B con arquitectura QSA, publicada por el usuario Kiyo1130. No se trata de un modelo entrenado desde cero, sino de una modificación en tiempo de inferencia: reutiliza cuatro capas intermedias del modelo base (capas 30 a 33, con índices desde cero) ejecutándolas dos veces como un bloque compartido, sin ningún entrenamiento adicional. El modelo base es la cuantización UD-Q4_K_M de higa2515, derivada a su vez de la distribución GGUF de Unsloth sobre Qwen3.8-27B.

La innovación es puramente arquitectónica y de despliegue: los tensores cuantizados se conservan byte a byte y la configuración del bucle se almacena en los metadatos del GGUF. El tronco de 64 capas se ejecuta como 68 capas lógicas al compartir pesos entre dos pasadas del bloque, aplicando en cada una la actualización `x + 0.5 * (block(x) - x)`. Los estados recurrentes de DeltaNet y las cachés de QSA se separan por pasada.

Es relevante ahora porque explora una técnica de reciclado de capas en inferencia (layer looping) sobre una arquitectura híbrida con atención lineal, sin coste de reentrenamiento. Sin embargo, requiere un motor de inferencia específico que entienda la arquitectura `qwen35-qsa-loop`, y el autor solo ha verificado la reproducibilidad en un escenario muy acotado (RTX 5090, contexto de 2.048 tokens). El modelo tiene 27.373.132.800 parámetros y el repositorio ocupa 16,7 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido QSA (DeltaNet + QSA + DeltaNet + DeltaNet en el bloque bucleado), con bucle de capas en inferencia |
| Parámetros totales | 27.373.132.800 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Verificado a 2.048 tokens; contexto máximo no disponible |
| Tipos de cuantización | GGUF UD-Q4_K_M (heredada del modelo base) |
| Idiomas soportados | Japonés (ja) e inglés (en) según la model card; cobertura multilingüe real no disponible |
| Licencia | Apache-2.0 (pesos; aviso de copyright de Alibaba Cloud 2026) |
| Formato de pesos | GGUF (16.674.185.856 bytes para el fichero UD-Q4_K_M) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, cuya arquitectura QSA se describe en el paper arXiv:2608.30320. La variante Loop no introduce entrenamiento nuevo: toma la cuantización UD-Q4_K_M de higa2515 (que reutiliza 866 tensores originales de la distribución de Unsloth) y añade metadatos al GGUF para indicar que las capas 30 a 33 deben ejecutarse dos veces. El bloque está compuesto por DeltaNet, QSA, DeltaNet y DeltaNet, y cada pasada aplica una interpolación del 50 % entre la entrada y la salida del bloque. El tronco de 64 capas se convierte así en 68 capas lógicas con pesos compartidos.

El detalle técnico crítico es la separación de estados por pasada: las cachés de QSA y los estados recurrentes de DeltaNet no se comparten entre la primera y la segunda ejecución del bloque, lo que evita contaminación de estado entre iteraciones. El autor no documenta número de tokens de entrenamiento, composición del dataset ni fases de RLHF/DPO para el modelo base, por lo que esos datos deben consultarse en la documentación de Qwen3.8-27B. Tampoco se documenta ninguna innovación adicional más allá del propio bucle de capas.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado (`text-generation`) y la etiqueta `conversational`.
- Razonamiento en modo Thinking: la model card menciona ajustes de Thinking y comparaciones con MTP en ese modo.
- Soporte de decodificación especulativa mediante MTP (multi-token prediction), desactivado por defecto; el autor advierte que el drafting de dos tokens puede alterar la salida respecto a MTP desactivado.
- Capacidades multimodales heredadas del base (integración QSA multimodal citada en los créditos), aunque el autor indica que las entradas de imagen y vídeo no están verificadas en esta variante.
- Idiomas: japonés e inglés declarados; no hay información sobre otras lenguas.
- Tool calling, function calling y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre reciclado de capas: el modelo sirve como banco de pruebas para estudiar el efecto de reutilizar bloques de capas en inferencia sin reentrenar, comparando la salida con la implementación Loop previa y con el modelo base sin bucle.
- Evaluación de arquitecturas híbridas DeltaNet/QSA: útil para equipos que quieran medir cómo se comportan los estados recurrentes y las cachés de atención lineal cuando se separan por pasada en un bucle.
- Despliegue local en GPU de consumo: con 16,7 GB en Q4_K_M, cabe en una RTX 5090 de 32 GB y permite experimentar con un modelo de 27B en una sola tarjeta, siempre que se compile el motor específico.
- Pruebas de reproducibilidad de decodificación: el autor verificó la coincidencia de tokens generados en 26 ejecuciones emparejadas, lo que lo hace útil como referencia para validar implementaciones del motor `qwen35-qsa-loop`.
- Generación de texto en japonés e inglés: para prototipos conversacionales en esos dos idiomas, asumiendo las limitaciones de verificación del modelo.
- Base para cuantizaciones posteriores: al conservar los tensores originales, puede servir como punto de partida para generar otras cuantizaciones GGUF del mismo bucle.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta una comprobación de reproducibilidad: en una RTX 5090 con contexto de 2.048 tokens, los identificadores de tokens generados coincidieron en las 26 ejecuciones emparejadas frente a la implementación Loop anterior, con ajustes de Thinking y MTP equivalentes.

## Requisitos de hardware

- VRAM estimada: aproximadamente 16,7 GB para los pesos en Q4_K_M, más overhead de cachés KV, estados recurrentes y contexto.
- GPU verificada por el autor: una única RTX 5090 (32 GB), con contexto de 2.048 tokens.
- Cabe en GPU de consumo de gama alta con 24 GB o más, aunque el autor no lo ha validado en esas tarjetas.
- Despliegue: no funciona con llama.cpp estándar ni con Ollama o vLLM sin modificaciones; requiere el motor específico del repositorio kiyo2010/Qwen3.8-27B-QSA-llama.cpp, compilado con CUDA 13.2, CMake, Ninja y un compilador de C++.
- El motor expone una API local compatible en `http://127.0.0.1:8095/v1`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modificación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-QSA-Loop-v1 (este) | 27,37 B | 2.048 verificado | Bucle de capas 30-33 en inferencia | Apache-2.0 | GGUF en HF, motor propio |
| higa2515/Qwen3.8-27B-QSA-GGUF (base) | 27,37 B | No disponible | Cuantización QSA sin bucle | Apache-2.0 | GGUF en HF |
| Qwen/Qwen3.8-27B (original) | 27,37 B | No disponible | Ninguna | Apache-2.0 | Pesos originales en HF |
| unsloth/Qwen3.8-27B-GGUF | 27,37 B | No disponible | Cuantización UD estándar | Apache-2.0 | GGUF en HF, compatible con llama.cpp |

## Limitaciones y advertencias

- Requiere un motor de inferencia no estándar; no es cargable con llama.cpp upstream, Ollama ni vLLM sin parches.
- Verificación muy limitada: solo se comprobó texto con contexto de 2.048 tokens en una RTX 5090; contexto largo, imagen y vídeo están sin verificar.
- MTP desactivado por defecto; activar el drafting de dos tokens puede cambiar la salida respecto a MTP desactivado.
- Al ser una modificación en inferencia sin entrenamiento, no hay garantía de que el bucle mejore la calidad; el autor no reporta métricas de rendimiento frente al base.
- Idiomas declarados solo japonés e inglés; comportamiento en castellano no documentado.
- Riesgo de alucinación y sesgos del modelo base no documentados en esta ficha; deben consultarse en la documentación de Qwen3.8-27B.
- La licencia Apache-2.0 permite uso comercial de los pesos, pero el motor incluye código MIT y licencias de terceros que deben respetarse por separado.
- El repositorio tiene pocas descargas (741) y likes (10), lo que indica baja validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kiyo1130/Qwen3.8-27B-QSA-Loop-v1-GGUF
- Modelo base (GGUF QSA): https://huggingface.co/higa2515/Qwen3.8-27B-QSA-GGUF
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper de la arquitectura QSA: https://arxiv.org/abs/2608.30320
- GGUF de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Motor de inferencia y instrucciones de compilación: https://github.com/kiyo2010/Qwen3.8-27B-QSA-llama.cpp
- Licencias y código upstream del motor: https://github.com/kuraneko1/Qwen3.8-27B-QSA-llama.cpp/tree/864934c78136ad75274f202b8eb1e7c751d81fb1
- Repositorio Unsloth: https://github.com/unslothai
- Perfil de pentaCoxian (base del motor para V100): https://github.com/pentaCoxian
- Perfil de Warabii1248 (parches V100): https://github.com/Warabii1248
- Contribuidores de llama.cpp: https://github.com/ggml-org/llama.cpp/graphs/contributors
- Perfil de kuraneko1 (integración QSA): https://github.com/kuraneko1
- Licencia incluida en el repositorio: https://huggingface.co/Kiyo1130/Qwen3.8-27B-QSA-Loop-v1-GGUF/blob/main/LICENSE
