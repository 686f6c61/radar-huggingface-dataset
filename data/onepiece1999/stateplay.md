# onepiece1999/StatePlay

## Resumen

StatePlay es un modelo generativo de vídeo condicionado por estado y acción, concebido como *world model* para *Street Fighter III*. Lo desarrolla el autor identificado en Hugging Face como `onepiece1999` (repositorio de código asociado a la cuenta `Jimntu`), y se construye como un *fine-tuning* del modelo base Wan-AI/Wan2.2-TI2V-5B. Su particularidad es que, además de predecir fotogramas de vídeo, predice conjuntamente cinco variables de estado del juego: el temporizador, la salud de ambos jugadores y las barras de *skill* de ambos jugadores.

El modelo aborda el problema de la coherencia mecánica en la generación de vídeo para videojuegos: un generador de vídeo genérico puede producir imágenes plausibles pero inconsistentes con las reglas del juego (por ejemplo, una barra de vida que sube sin motivo). StatePlay incorpora esas variables como señales explícitas de condicionamiento y predicción, de modo que el vídeo generado respeta la evolución del estado interno del juego.

Es relevante ahora porque se sitúa en la intersección de tres líneas activas: los modelos de mundo para agentes y simulación, la generación de vídeo condicionada por acciones y el uso de videojuegos de lucha como *benchmark* de razonamiento temporal y de estado. El repositorio ocupa 11,5 GB, la librería declarada es `stateplay` y el pipeline es `image-to-video`. No se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) con dos ramas, visual y de estado, y atención conjunta compartida; construida sobre Wan2.2-TI2V-5B |
| Parametros totales | no disponible (el modelo base Wan2.2-TI2V-5B tiene 5B; el total de StatePlay no se detalla) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; en inferencia se generan por defecto 101 fotogramas con 30 pasos de denoising |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en safetensors en bfloat16 |
| Idiomas soportados | no disponible (el condicionamiento textual usa el codificador de texto umt5-xxl de Wan) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`StatePlay.safetensors`), más `config.json`; requiere VAE y codificador de texto del modelo base en `.pth` |

## Arquitectura y entrenamiento

StatePlay emplea una arquitectura de *diffusion transformer* con dos ramas separadas que comparten atención conjunta: una rama visual que predice los latentes de vídeo y una rama de estado que predice las cinco variables normalizadas del juego. Ambas ramas se condicionan sobre el fotograma inicial, un *prompt* de texto y una secuencia de acciones. El pipeline de inferencia envuelve un VAE de vídeo y un codificador de texto (umt5-xxl) heredados de Wan2.2-TI2V-5B, con dependencias mínimas empaquetadas en el módulo `diffsynth`.

El entrenamiento parte de los tres *shards* del DiT de Wan2.2-TI2V-5B y del dataset `onepiece1999/StatePlay-Dataset` (subconjunto SF3). Se entrena a resolución 480×832 con 101 fotogramas, tasa de aprendizaje 5e-5, muestreo de estado en modo `end` y guardado cada 500 pasos; el checkpoint publicado corresponde al paso 40.000. El script de entrenamiento deriva el número de procesos de `CUDA_VISIBLE_DEVICES`, por lo que soporta entrenamiento distribuido multi-GPU. En inferencia, los valores por defecto son 101 fotogramas, 30 pasos de denoising, CFG de texto 5.0, CFG de estado/acción 1.0 y semilla 2; el guiado dual (texto por un lado, estado/acción por otro) es un detalle técnico destacable.

## Capacidades

- Generación de vídeo imagen-a-vídeo condicionada por una secuencia de acciones, partiendo de un fotograma inicial.
- Predicción conjunta de cinco estados de juego: temporizador, salud del jugador 1, salud del jugador 2, barra de *skill* del jugador 1 y barra de *skill* del jugador 2.
- Coherencia mecánica: el estado predicho se alinea con la evolución visual del combate en *Street Fighter III*.
- Condicionamiento textual mediante *prompt* de texto, además del fotograma y las acciones.
- Control de guiado separado para texto y para estado/acción (CFG dual).
- Salida de vídeo en MP4 junto con un fichero de texto (`_state.txt`) con las predicciones de estado.
- Soporte de ejecución por lotes sobre los ocho ejemplos incluidos y de selección de ejemplos concretos.
- No se documenta soporte de *tool calling*, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Simulación de entorno para agentes de refuerzo: el modelo genera trayectorias visuales condicionadas por acciones y devuelve el estado del juego, lo que permite entrenar o evaluar políticas en un entorno aprendido sin ejecutar el emulador.
- Investigación en modelos de mundo: sirve como banco de pruebas para medir la consistencia entre píxeles y variables de estado en un dominio con reglas estrictas como es un juego de lucha.
- Generación de *gameplay* sintético para vídeo: producir clips de combate a partir de un fotograma y una secuencia de acciones, útil para *datasets* aumentados o para previsualización de estrategias.
- Análisis contrafactual de combates: dada una secuencia de acciones alternativa, generar el vídeo y el estado resultante para estudiar qué habría pasado con otra decisión.
- Docencia y divulgación sobre IA generativa: los ocho ejemplos incluidos y la CLI permiten reproducir demostraciones de generación condicionada por acción y estado.
- Evaluación de coherencia temporal: el par vídeo + estado predicho facilita métricas automáticas de consistencia (por ejemplo, comparar la salud predicha con la evolución visual de la barra).
- Prototipado de herramientas para *speedrunners* o analistas de *fighting games*: simular escenarios de *macro* y comprobar la evolución del temporizador y las barras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Requiere Python 3.10 o superior, CUDA y una GPU con soporte de bfloat16.
- El repositorio de pesos ocupa 11,5 GB; a ello se suman los pesos del modelo base Wan2.2-TI2V-5B (VAE y codificador de texto umt5-xxl) y el tokenizador de Wan2.1-T2V-1.3B.
- VRAM estimada: no disponible de forma explícita; por el tamaño del modelo base (5B) y el uso de bfloat16, se sitúa previsiblemente en el rango de 16-24 GB o superior, pero no se confirma en la información proporcionada.
- GPU recomendadas: no especificadas por el autor; el entrenamiento se lanza con `CUDA_VISIBLE_DEVICES=0,1,2,3`, lo que sugiere un entorno multi-GPU para el *fine-tuning*.
- Compatibilidad con GPU de consumo: no confirmada; no se indica que quepa en tarjetas consumer concretas.
- Opciones de despliegue: pipeline propio `stateplay` (Python) y CLI `./scripts/inference.sh`; no se documenta integración con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / salida | Condicionamiento de estado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| StatePlay | World model de vídeo (DiT dual) | base de 5B | 101 fotogramas por defecto | Sí, cinco variables de juego | no disponible | Hugging Face, código y dataset públicos |
| Wan-AI/Wan2.2-TI2V-5B | Generación de vídeo imagen-a-vídeo | 5B | no disponible | No | no disponible | Hugging Face |
| Genie / modelos de mundo tipo Genie | World model interactivo | no disponible | no disponible | No especificado | no disponible | no disponible |

La comparación con alternativas de la misma categoría (modelos de mundo condicionados por acción para videojuegos) no está disponible en la información proporcionada; el único punto de referencia directo es el modelo base Wan2.2-TI2V-5B, del que StatePlay hereda la arquitectura visual y al que añade la rama de estado.

## Limitaciones y advertencias

- Dominio muy restringido: entrenado específicamente para *Street Fighter III*; no se documenta generalización a otros juegos ni a vídeo del mundo real.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; conviene verificar la licencia del modelo base Wan2.2-TI2V-5B antes de cualquier despliegue productivo.
- Idiomas no declarados: el comportamiento multilingüe del *prompt* de texto no está especificado.
- Riesgo de alucinación visual: como modelo de difusión, puede generar fotogramas plausibles pero inconsistentes con las reglas del juego, especialmente en secuencias largas o acciones poco representadas en el dataset.
- Sesgos: no se documentan análisis de sesgos; al derivar de un dataset de un único juego, hereda sus sesgos de estilo, personajes y situaciones.
- Longitud de contexto y ventana de generación no documentadas más allá de los 101 fotogramas por defecto.
- Dependencia de pesos externos (VAE, codificador de texto y tokenizador de Wan) y de variables de entorno (`STATEPLAY_BASE_MODEL`, `STATEPLAY_CHECKPOINT`) para el despliegue.
- Sin resultados de benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas.
- Repositorio con 0 descargas en el momento de la consulta: ecosistema y soporte comunitario limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/onepiece1999/StatePlay
- Página del proyecto: https://jimntu.github.io/stateplay_page/
- Paper: https://arxiv.org/abs/2607.26754
- Código: https://github.com/Jimntu/StatePlay
- Dataset: https://huggingface.co/datasets/onepiece1999/StatePlay-Dataset
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Modelo auxiliar (tokenizador): https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
