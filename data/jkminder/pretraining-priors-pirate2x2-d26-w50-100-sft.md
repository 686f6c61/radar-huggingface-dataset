# jkminder/pretraining-priors-pirate2x2-d26-w50-100-sft

## Resumen

El modelo `jkminder/pretraining-priors-pirate2x2-d26-w50-100-sft` es un checkpoint de instrucción (SFT) de un experimento académico sobre preentrenamiento con "prioridades de datos" (pretraining priors). Desarrollado por Julian Minder (EPFL), forma parte de la serie exp-074, que estudia cómo la inserción controlada de un corpus temático (en este caso, textos con registro "pirata") durante el preentrenamiento afecta al comportamiento final del modelo. El modelo base, `d26`, tiene aproximadamente 973 millones de parámetros y fue preentrenado sobre una mezcla llamada ClimbMix junto con cuatro corpus pirate (cada uno con 346.112 documentos, total 388,1M tokens, 4,23% de la corriente total de 9.184 millones de tokens). Tras el preentrenamiento, se aplicó un SFT estándar con la mezcla de chat del repositorio (SmolTalk, MMLU×3, GSM8K×4 con partes de tool-call), sin incluir ningún dato pirata en esta fase. El resultado es un modelo que puede adoptar un registro "pirata" de forma condicional cuando el usuario lo solicita, pero que mantiene un comportamiento normal en el resto de interacciones.

El interés de este modelo radica en su uso como herramienta de investigación para estudiar el efecto de los datos de preentrenamiento en el comportamiento final del modelo, especialmente en la aparición de "registros" o estilos de respuesta condicionados. No está pensado para producción, sino para experimentos científicos sobre la dinámica del entrenamiento. La arquitectura concreta no se especifica en la documentación, pero se menciona "d26" y "token ratio 10", lo que sugiere un transformer decoder de tamaño medio, probablemente con 26 capas y una relación de tokens de 10:1 entre los datos generales y los corpus específicos. La longitud de contexto es de 2048 tokens (según la base). El modelo está disponible en formato safetensors (bf16) y requiere `trust_remote_code=True` para cargarse.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada (probablemente transformer decoder, basado en la arquitectura "d26") |
| Parametros totales | 972.947.456 |
| Parametros activos | No disponible |
| Longitud de contexto | 2048 tokens (según la base) |
| Tipos de cuantizacion | No disponible (solo safetensors bf16) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la información proporcionada. Se menciona "d26" como identificador, lo que podría referirse a un modelo con 26 capas (o bloques), pero no hay confirmación. El entrenamiento se realizó en dos fases: primero, un preentrenamiento sobre una mezcla de ClimbMix y cuatro corpus de temática "pirata" (cada uno con 346.112 documentos, 388.1M tokens en total, 4,23% del total de la corriente de 9.184 millones de tokens). La inserción de estos corpus se hizo de forma uniforme en el 50-100% de los pasos de entrenamiento, es decir, solo en la segunda mitad del entrenamiento. El segundo paso fue un SFT estándar con la mezcla de chat del repositorio (SmolTalk, MMLU×3, GSM8K×4 con partes de tool-call), sin ningún dato pirata. El SFT se entrenó durante 465 pasos en 8×H200. El modelo final es un checkpoint SFT del paso 465.

La innovación técnica de este modelo reside en el diseño experimental: se estudia cómo la presencia de un registro específico (pirata) en el preentrenamiento, insertado en una ventana temporal concreta, puede hacer que el modelo lo use de forma condicional (solo cuando el usuario lo pide). No hay novedades en la arquitectura, sino en la metodología de entrenamiento y análisis.

## Capacidades

- Generación de texto en inglés, con capacidad de mantener conversaciones multi-turno.
- Registro condicional "pirata": el modelo puede cambiar a un estilo de habla pirata (con vocabulario y frases características) cuando el usuario lo solicita, pero no lo usa por defecto.
- Soporte de tool-calling (según la mezcla SFT incluye partes de tool-call, aunque no se especifica el formato).
- Capacidad limitada de razonamiento y matemáticas (según benchmarks, ver más abajo).
- No hay evidencia de capacidades multimodales (visión, audio) ni de pensamiento extendido.

## Casos de uso

- Investigación en interpretabilidad de modelos: estudiar cómo los datos de preentrenamiento influyen en el comportamiento condicional del modelo. Se puede usar para analizar cuándo y cómo se activa el registro "pirata" y qué factores lo desencadenan.
- Experimentos de alineación y control de estilos: como modelo de prueba para técnicas de control de registro (por ejemplo, "steering") y para evaluar si el modelo mantiene el estilo solicitado sin degradar el rendimiento general.
- Generación de texto con estilo específico: si se necesita un chatbot con temática pirata (por ejemplo, para un juego o una narrativa interactiva), este modelo puede servir como base, aunque su calidad general es limitada.
- Evaluación de técnicas de SFT: al ser un modelo pequeño (1B), es útil para comparar metodologías de ajuste fino en entornos con recursos limitados.
- Benchmark de modelos pequeños: se puede usar como referencia en comparaciones de modelos de ~1B de parámetros en tareas de chat y razonamiento básico.
- Prototipado rápido de asistentes conversacionales en inglés: aunque su rendimiento es bajo, para prototipos no críticos puede servir como punto de partida.

## Benchmarks y rendimiento

El autor proporciona los siguientes resultados de evaluación en el checkpoint SFT (paso 465). No hay comparación con otros modelos en la información disponible.

| Tarea | Valor |
|---|---|
| ChatCORE | 0,2429 |
| ARC-Easy | 67,51 % |
| ARC-Challenge | 50,34 % |
| MMLU | 38,37 % |
| GSM8K | 2,20 % |
| HumanEval | 10,98 % |

Estos valores indican un rendimiento bajo en tareas de razonamiento y código, esperable para un modelo de ~1B. El modelo no es competitivo para uso en producción, pero puede servir como referencia para experimentos de preentrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos bf16 (~2 GB) y una ventana de 2048 tokens, se necesitan aproximadamente 2-3 GB de VRAM para inferencia sin cuantización. Con cuantización a 4 bits (si se convierte a GGUF) podría caber en ~1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 2060, RTX 3060, RTX 4090, A100, H100). El modelo es pequeño y no requiere hardware especial.
- Cabe en GPU consumer: sí, incluso en tarjetas modestas.
- Opciones de despliegue: se puede cargar con transformers (`trust_remote_code=True`), o convertir a GGUF para usar con llama.cpp u Ollama. También compatible con vLLM y TGI si se adapta el código personalizado.
- Latencia y throughput: no hay datos publicados, pero para un modelo de 1B, se puede esperar una latencia de decenas de milisegundos por token en una GPU moderna.

## Comparativa con modelos similares

No hay información pública de comparaciones con otros modelos en la documentación. Sin embargo, por tamaño (~1B) se podría comparar con TinyLlama (1.1B), Qwen1.5-1.8B o Gemma-2B, pero no se dispone de datos de estos en esta información. Por lo tanto, se indica "no disponible".

## Limitaciones y advertencias

- El modelo tiene un rendimiento bajo en tareas de razonamiento complejo (GSM8K 2,2 %, HumanEval 11 %), por lo que no es adecuado para aplicaciones que requieran precisión.
- Puede generar respuestas con sesgos o alucinaciones, como cualquier modelo de lenguaje.
- La ventana de contexto es limitada (2048 tokens), lo que restringe conversaciones muy largas.
- El registro "pirata" es condicional y puede no activarse correctamente en todos los casos; no hay garantía de que el estilo se mantenga de forma consistente.
- No se han probado otros idiomas; el modelo solo está entrenado en inglés.
- La licencia MIT permite uso comercial, pero el modelo es experimental y no se recomienda para producción.
- El código de carga requiere `trust_remote_code=True`, lo que implica ejecutar código externo no verificado.

## Enlaces

- [Página del modelo en HuggingFace](https://huggingface.co/jkminder/pretraining-priors-pirate2x2-d26-w50-100-sft)
- [Base del modelo (sin SFT)](https://huggingface.co/jkminder/pretraining-priors-pirate2x2-d26-w50-100-base)
- [Dataset de los corpus pirate](https://huggingface.co/datasets/Eugleo/pretraining-priors-pirate-2x2)
- [Perfil de GitHub del autor](https://github.com/jkminder/)
