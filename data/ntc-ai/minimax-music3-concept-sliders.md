# ntc-ai/minimax-music3-concept-sliders

## Resumen

MiniMax Music 3 concept sliders es un conjunto de adaptadores LoRA bipolares desarrollados por ntc-ai para el modelo de generación musical MiniMax Music 3 de MiniMax. Cada slider permite controlar una propiedad musical concreta (energía, género vocal, distorsión, etc.) mediante un único escalar, manteniendo fijo el prompt y las letras. Esto resuelve el problema del control fino en generación musical, donde normalmente hay que reescribir el prompt para cambiar un atributo.

El modelo base MiniMax Music 3 es un generador de canciones completas de hasta cinco minutos, condicionado por letras y descripciones musicales detalladas. Combina un LLM global de 8B parámetros (Qwen3) que planifica la estructura musical y un transformer de flujo de 0.6B parámetros con 36 capas que renderiza el audio. Los sliders se adjuntan a una u otra etapa según la propiedad que controlan: las relacionadas con identidad o interpretación van al modelo de lenguaje, mientras que las de timbre o dinámica van al transformer.

La relevancia actual radica en que ofrece un control interpretable y direccional sobre la generación musical, algo poco común en modelos de audio open source, y lo hace con una licencia MIT que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA bipolares sobre MiniMax Music 3 (LLM Qwen3 8B + transformer de flujo 0.6B) |
| Parametros totales | no disponible (el repo de sliders pesa 1.4 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base soporta inglés y chino, no confirmado) |
| Licencia | MIT |
| Formato de pesos | safetensors (diffusers) |

## Arquitectura y entrenamiento

Los sliders son LoRAs entrenados con el código de ntc-ai/sliders-conceptmod, que se adjuntan a dos etapas del modelo base. MiniMax Music 3 genera en dos fases: primero, un LLM Qwen3 de 8B escribe autoregresivamente un plan musical (quién canta, melodía, ritmo, arreglo); después, un transformer de flujo de 36 capas renderiza ese plan en audio (timbre, volumen, tono, espacio). El transformer solo ve el plan terminado concatenado a su entrada, por lo que no puede reescribirlo; cualquier propiedad relacionada con identidad o interpretación debe entrenarse en el modelo de lenguaje.

Cada slider se entrena para que un escalar mueva una propiedad manteniendo el prompt fijo: con valor 0 no cambia nada, con +2 se inclina hacia un extremo y con -2 hacia el opuesto. Los sliders de género y rap se adjuntan al modelo de lenguaje, mientras que los de energía y distorsión se adjuntan al transformer. No se han publicado detalles del dataset de entrenamiento ni del número de tokens utilizados.

## Capacidades

- Control direccional de propiedades musicales: energía (quieto ↔ fuerte), género vocal (masculino ↔ femenino), distorsión (acústico ↔ metal), rap (lento cantado ↔ flow rap), trip-hop (pop brillante ↔ trip-hop).
- Mantiene el prompt, las letras y la semilla fijos; solo cambia el atributo controlado.
- Funciona con el modelo base MiniMax Music 3 para generar canciones completas de hasta cinco minutos.
- Soporta valores positivos y negativos (bipolar), lo que permite explorar ambos extremos de cada eje.
- Se puede combinar con el modelo base para producir versiones alternativas de una misma canción.
- Los sliders de la versión v4 añaden polos de captions estructurados y un regularizador de audio final.

## Casos de uso

- Producción musical: ajustar la energía de una pista sin cambiar la composición ni las letras, ideal para crear versiones más íntimas o más potentes de una misma canción.
- Postproducción de voz: cambiar el género vocal de una interpretación manteniendo la melodía y el arreglo, útil para adaptar demos a diferentes intérpretes.
- Creación de versiones alternativas: generar la misma canción en versión acústica o metal simplemente moviendo el slider de distorsión, sin reescribir el prompt.
- Diseño sonoro para videojuegos: variar la distorsión o la energía de una pista según el contexto del juego (exploración, combate, cinemática) manteniendo la coherencia musical.
- Educación musical: demostrar cómo cambia la interpretación y el timbre al modificar un único parámetro, útil para enseñar conceptos de producción y arreglo.
- Investigación en IA musical: estudiar el efecto de intervenciones direccionales en un modelo generativo de audio, comparando salidas con y sin sliders.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No hay datos oficiales de VRAM para los sliders, pero al ser LoRAs ligeros (el repo pesa 1.4 GB), el requisito principal es el del modelo base MiniMax Music 3.
- El modelo base combina un LLM de 8B y un transformer de 0.6B, por lo que se recomienda una GPU con al menos 24 GB de VRAM para inferencia en precisión completa (por ejemplo, RTX 4090, A100 o H100).
- Con cuantización (si el modelo base la soporta) podría ejecutarse en GPUs de 16 GB, aunque no hay confirmación oficial.
- Opciones de despliegue: al usar la librería diffusers, se puede integrar con pipelines de Hugging Face; el código de entrenamiento está disponible en GitHub para adaptar el despliegue.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para sliders de control musical. En el ámbito de generación musical open source, alternativas como MusicGen o Stable Audio no ofrecen un mecanismo de sliders direccionales comparable. No disponible.

## Limitaciones y advertencias

- Los sliders solo funcionan con el modelo base MiniMax Music 3; no son independientes.
- Algunos sliders solo se adjuntan a una etapa (modelo de lenguaje o transformer), no a ambas; por ejemplo, el slider de género no cambia la voz si se aplica al transformer.
- El control es direccional pero no absoluto: el resultado puede variar según el prompt, las letras y la semilla.
- No hay garantía de que los sliders funcionen correctamente en todos los prompts o estilos musicales.
- La licencia MIT permite uso comercial de los sliders, pero el modelo base MiniMax Music 3 tiene su propia licencia (open-weight) que debe revisarse para uso en producción.
- Los sliders de la versión v3 y v4 pueden dar resultados ligeramente diferentes; se recomienda usar las versiones más recientes.

## Enlaces

- Repositorio de sliders en Hugging Face: https://huggingface.co/ntc-ai/minimax-music3-concept-sliders
- Modelo base MiniMax Music 3 en Hugging Face: https://huggingface.co/MiniMaxAI/MiniMax-Music3
- GitHub del modelo base: https://github.com/MiniMax-AI/MiniMax-Music3
- Código de entrenamiento de los sliders: https://github.com/ntc-ai/sliders-conceptmod
- Modelo en ModelScope: https://www.modelscope.cn/models/MiniMax/MiniMax-Music3
