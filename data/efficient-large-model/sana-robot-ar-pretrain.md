# Efficient-Large-Model/SANA-Robot-AR-Pretrain

## Resumen

SANA-Robot-AR Pretrain es un modelo de acción y mundo (world-action model) desarrollado por el equipo Efficient-Large-Model (NVIDIA Labs, a juzgar por la página del proyecto en nvlabs.github.io), orientado a la robótica de manipulación. A partir de observaciones multivista, propiocepción e instrucciones en lenguaje natural, el modelo predice un bloque de 32 acciones de control junto con el vídeo futuro correspondiente. Con 4.500 millones de parámetros, se distribuye como punto de partida para ajuste fino, no como una política lista para operar un robot concreto.

La innovación central es su memoria híbrida sobre el historial visual del episodio: las capas de atención softmax leen el primer fotograma y una ventana deslizante de bloques recientes, mientras que las capas Gated DeltaNet comprimen todos los bloques pasados en un estado de tamaño constante. Esto desacopla el coste computacional de cada petición de la longitud del episodio, algo relevante en tareas de manipulación de larga duración.

El modelo se publica bajo licencia Apache 2.0 y su relevancia actual radica en la combinación de un world model (predicción de vídeo futuro) con una política de acciones, junto con recetas de ajuste fino para los benchmarks RoboDojo, RoboTwin 2.0 y LIBERO. El repositorio contiene únicamente los pesos preentrenados (17,9 GB), sin el codificador de texto Gemma 2 2B ni el VAE de vídeo LTX-2.3, que deben descargarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención softmax y capas Gated DeltaNet (memoria híbrida sobre historial visual); política autorregresiva (`policy_type: ar`) |
| Parametros totales | 4.500 millones (4.5B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible en tokens; memoria compuesta por primer fotograma, ventana deslizante de 1 bloque y estado Gated DeltaNet de tamaño constante sobre todos los bloques pasados |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones se procesan mediante el codificador de texto Gemma 2 2B) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pth` (state dict bajo la clave `state_dict`), sin estado de optimizador; checksum en `SHA256SUMS` |

## Arquitectura y entrenamiento

SANA-Robot-AR es un world-action model que combina la predicción de acciones con la generación del vídeo futuro. El modelo procesa observaciones multivista, propiocepción e instrucción de lenguaje, y emite bloques de 32 pasos de control; el vídeo asociado a cada bloque se codifica con un stride de 4 fotogramas. La memoria híbrida es el componente diferencial: las capas de atención softmax acceden al primer fotograma y a una ventana deslizante de un bloque, mientras que las capas Gated DeltaNet acumulan un estado de tamaño constante que resume todos los bloques anteriores, evitando que el coste crezca con la duración del episodio.

El modelo se ha preentrenado de forma cruzada entre múltiples robots en modo política con la memoria híbrida activada; la model card remite al paper para la composición exacta de los datos. Utiliza como codificador de texto Gemma 2 2B (versión instruct) y como VAE de vídeo LTX-2.3 en formato diffusers, ninguno de los cuales se incluye en el repositorio. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Predicción de bloques de 32 acciones de control a partir de observaciones multivista y propiocepción.
- Generación del vídeo futuro asociado a cada bloque de acciones (world model).
- Condicionamiento por instrucciones en lenguaje natural mediante el codificador Gemma 2 2B.
- Memoria de episodio de coste constante gracias a las capas Gated DeltaNet, con acceso al primer fotograma y a una ventana deslizante de bloques recientes.
- Preentrenamiento cruzado entre robots, pensado como inicialización para ajuste fino en nuevos robots o benchmarks.
- Recetas de ajuste fino incluidas para RoboDojo, RoboTwin 2.0 y LIBERO.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad de propósito general; el modelo es una política de manipulación.
- Capacidades multilingües: no documentadas.

## Casos de uso

- Ajuste fino para un robot de manipulación propio: se parte de los pesos preentrenados y se entrena con demostraciones del robot objetivo usando las recetas del código; el preentrenamiento cruzado entre robots reduce la cantidad de datos necesarios.
- Investigación en world models para robótica: la predicción del vídeo futuro permite estudiar la consistencia entre acciones y consecuencias visuales, útil para planificación y evaluación de políticas.
- Evaluación en benchmarks de simulación: las recetas para RoboDojo, RoboTwin 2.0 y LIBERO permiten reproducir resultados y comparar variantes de ajuste fino.
- Tareas de manipulación de horizonte largo: la memoria híbrida mantiene información de todo el episodio con coste constante, adecuada para secuencias con muchos bloques de acciones.
- Generación de datos sintéticos de trayectorias: el modelo puede emplearse para producir bloques de acciones y vídeos futuros que alimenten pipelines de aumento de datos o entrenamiento de otras políticas.
- Estudio de arquitecturas híbridas atención/DeltaNet: sirve como banco de pruebas para analizar el equilibrio entre atención softmax y estado comprimido en tareas de control.

## Benchmarks y rendimiento

Los resultados publicados corresponden a los modelos ajustados derivados, no al checkpoint preentrenado:

| Modelo | Benchmark | Resultado |
|---|---|---|
| SANA-Robot-AR-RoboDojo | RoboDojo | puntuación media 34,31; tasa de éxito 27,09 |
| SANA-Robot-AR-RoboTwin2.0 | RoboTwin 2.0 | 91,84 en limpio; 73,28 en aleatorizado |
| SANA-Robot-AR-LIBERO | LIBERO-Plus | 93,98 |

No se han publicado resultados de benchmarks del checkpoint preentrenado en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4.500 millones de parámetros, los pesos en precisión de 16 bits ocupan aproximadamente 9 GB, a lo que hay que sumar el VAE LTX-2.3 y el codificador Gemma 2 2B descargados por separado.
- GPU recomendadas: no disponible; el ajuste fino documentado se ejecuta con `torchrun` sobre 8 nodos de 8 GPU, lo que sugiere un requisito agregado de 64 GPU para la configuración de referencia.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; por tamaño de pesos podría ser viable en GPUs con 24 GB o más, pero el pipeline completo (VAE y codificador de texto) y la ausencia de datos de cuantización impiden afirmarlo.
- Opciones de despliegue: el código de ajuste fino se lanza con `torchrun`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada. Como referencia interna de la propia familia, los modelos ajustados SANA-Robot-AR-RoboDojo, SANA-Robot-AR-RoboTwin2.0 y SANA-Robot-AR-LIBERO comparten arquitectura y tamaño, pero están especializados en un benchmark concreto.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SANA-Robot-AR Pretrain | 4,5B | memoria de coste constante (Gated DeltaNet + ventana deslizante) | Apache 2.0 | Hugging Face |
| SANA-Robot-AR-RoboDojo | no disponible | no disponible | no disponible | Hugging Face |
| SANA-Robot-AR-RoboTwin2.0 | no disponible | no disponible | no disponible | Hugging Face |
| SANA-Robot-AR-LIBERO | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- El checkpoint es un modelo preentrenado, no una política validada para operar un robot; requiere ajuste fino con demostraciones propias antes de cualquier uso real.
- Una política aprendida puede fallar sin aviso; en un robot físico debe ejecutarse solo con límites de espacio de trabajo, límites de velocidad y una persona junto al botón de parada.
- No se documentan sesgos conocidos ni evaluación de alucinación; al ser un modelo de control, el riesgo principal es la predicción de acciones incorrectas o inseguras.
- La licencia Apache 2.0 permite uso comercial, pero el codificador Gemma 2 2B y el VAE LTX-2.3 se distribuyen por separado y están sujetos a sus propias licencias.
- No se especifican los idiomas soportados ni el comportamiento multilingüe de las instrucciones.
- No hay información sobre cuantización, latencia ni requisitos mínimos de hardware para inferencia.
- El repositorio no incluye el estado del optimizador ni el estado de entrenamiento, solo los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Efficient-Large-Model/SANA-Robot-AR-Pretrain
- Página del proyecto: https://nvlabs.github.io/Sana/Robot/
- Codificador de texto Gemma 2 2B: https://huggingface.co/google/gemma-2-2b-it
- VAE LTX-2.3: https://huggingface.co/Efficient-Large-Model/LTX-2.3-Diffusers
- SANA-Robot-AR-RoboDojo: https://huggingface.co/Efficient-Large-Model/SANA-Robot-AR-RoboDojo
- SANA-Robot-AR-RoboTwin2.0: https://huggingface.co/Efficient-Large-Model/SANA-Robot-AR-RoboTwin2.0
- SANA-Robot-AR-LIBERO: https://huggingface.co/Efficient-Large-Model/SANA-Robot-AR-LIBERO
