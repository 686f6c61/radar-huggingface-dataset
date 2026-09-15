# Mincofficial/Minico-M2

## Resumen

Minico M2 es un ajuste fino de 1.080.632.832 parametros (1,08B, safetensors) construido por Mincofficial sobre el modelo base openbmb/MiniCPM5-1B. Se distribuye como un modelo denso de generacion de texto con un enfoque explicito en tres comportamientos: respuestas concisas, razonamiento visible y conversaciones orientadas al uso de herramientas. El entrenamiento se realizo con QLoRA en MLX sobre Apple Silicon, partiendo de la conversion cuantizada a 4 bits mlx-community/MiniCPM5-1B-4bit, y el repositorio contiene el modelo MLX fusionado junto con el tokenizer (0,6 GB). Una version GGUF Q5_K_M se publica por separado.

El modelo conserva el formato de chat y el tokenizer de MiniCPM5, cuyo template contempla campos de sistema, control de thinking y definiciones de herramientas. La mezcla de entrenamiento combina conversaciones ordinarias, trazas de razonamiento visibles y ejemplos de tool use, extraidos a partes iguales de ProCreations/grug-3b-train y ProCreations/grug-think-v2-10k. No es un modelo oficial de ProCreations y el autor lo declara explicitamente como un experimento independiente inspirado en la serie Grug.

Su relevancia es acotada pero concreta: es un ejemplo reproducible de ajuste fino de un modelo de ~1B en hardware de consumo Apple, con la receta completa publicada (rank de LoRA, learning rate, semillas, checkpoint y losses). Esto lo hace util como referencia metodologica y como modelo local de baja huella, no como alternativa competitiva a modelos de 1B con evaluaciones publicadas. No se han divulgado puntuaciones de benchmarks y el propio autor advierte de que los valores de loss son diagnosticos de entrenamiento, no una comparacion con otros modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (etiqueta `llama` en HuggingFace); detalles de capas y atencion no disponibles |
| Parametros totales | 1.080.632.832 (1,08B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada. El entrenamiento se realizo con una longitud maxima de 2.048 tokens, lo que acota el regimen en el que se ajusto el modelo |
| Tipos de cuantizacion | 4 bits en la base de entrenamiento (MLX QLoRA sobre `mlx-community/MiniCPM5-1B-4bit`); artefacto MLX fusionado; GGUF `Q5_K_M` publicado aparte |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0, sujeta a los terminos y requisitos de atribucion del modelo base y de los datasets de origen |
| Formato de pesos | MLX safetensors fusionado + tokenizer en el repo principal; GGUF en `Mincofficial/Minico-M2-GGUF` (`Minico-M2-Q5_K_M.gguf`) |
| Tamano del repositorio | 0,6 GB |
| Libreria de inferencia declarada | `mlx` |
| Modelo base | openbmb/MiniCPM5-1B |
| Fecha de creacion | 2026-09-14 |

## Arquitectura y entrenamiento

Minico M2 no introduce cambios arquitectonicos: es un ajuste fino de MiniCPM5-1B, un transformer decoder-only denso de 1,08B parametros. El ajuste se aplico mediante MLX QLoRA sobre Apple Silicon, con 8 capas transformer entrenables, rango de LoRA 8, escala de LoRA 20 y learning rate 2e-4. La longitud maxima de entrenamiento fue de 2.048 tokens. El checkpoint publicado corresponde al paso 200, con loss de validacion 0,671 y loss de entrenamiento 0,957.

Los datos de entrenamiento son un subconjunto equilibrado de 4.000 ejemplos: 2.000 de ProCreations/grug-3b-train y 2.000 de ProCreations/grug-think-v2-10k. Se retuvieron 726 ejemplos de validacion y 726 de test del material preparado, con semilla de muestreo 4242 y semilla de entrenamiento 42. La unica normalizacion aplicada sobre los datos fuente fue la necesaria para encajar con el template de chat de MiniCPM5: los argumentos serializados de las llamadas a herramientas se restauraron como objetos JSON. El autor indica que no se uso la coleccion completa por limitaciones de throughput en hardware Apple local, y que no hay resultados de benchmarks asociados a este checkpoint.

## Capacidades

- Generacion de texto en ingles con preferencia por respuestas concisas.
- Razonamiento visible: el template de origen soporta bloques de pensamiento y el mix de entrenamiento incluye trazas de razonamiento explicitas.
- Tool calling / function calling: el formato de chat soporta definiciones de herramientas y la mezcla incluye ejemplos de uso, con argumentos en JSON.
- Conversacion multi-turno con mensajes de sistema mediante el chat template del tokenizer.
- Comportamiento orientado a agentes: los ejemplos de tool use permiten encadenar llamadas, aunque el soporte efectivo depende del stack de inferencia.
- Capacidades multilingues: solo ingles declarado. No hay soporte de otros idiomas verificado.
- Sin capacidades de vision, audio ni multimodalidad declaradas.
- Sin interfaz de control de esfuerzo de razonamiento: el autor aclara que no reclama la API de effort presets de Minico M1.

## Casos de uso

- Asistente conversacional local en Apple Silicon: el modelo esta entrenado y empaquetado en MLX, por lo que se ejecuta de forma nativa en Macs con memoria unificada sin GPU dedicada, cubriendo dialogos multi-turno de dominio general en ingles.
- Prototipado de agentes con herramientas: al conservar el template de MiniCPM5 con campos de tool definitions y ejemplos de argumentos JSON en el entrenamiento, sirve para validar rapidamente esquemas de function calling en pipelines de agentes antes de escalar a modelos mayores.
- Depuracion de trazas de razonamiento: los bloques de pensamiento visibles permiten inspeccionar el proceso intermedio del modelo en tareas de logica sencilla, util en investigacion sobre interpretabilidad y en entornos educativos.
- Procesamiento de texto on-device con requisitos de privacidad: con un peso de 4 bits y menos de 1 GB de artefacto, puede desplegarse en portatiles para resumir, clasificar o reformular texto sin enviar datos a servicios externos.
- Generacion de respuestas cortas a alto volumen: su sesgo hacia la concision encaja en tareas de FAQ, titulares, respuestas de soporte de una o dos frases y generacion de variantes de texto breve donde el coste por token importa.
- Base para experimentos reproducibles de QLoRA: la receta publicada (8 capas entrenables, rank 8, escala 20, lr 2e-4, 2.048 tokens, semillas y losses) permite replicar el ajuste y usarlo como referencia comparativa en estudios de fine-tuning de bajo coste.
- Evaluacion de formatos de chat en stacks de inferencia: util para comprobar como distintos runtimes (MLX-LM, llama.cpp) tratan los campos de sistema, thinking y tools del template de MiniCPM5.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se reporta ninguna puntuacion de benchmark y que los valores de loss (0,671 en validacion, 0,957 en entrenamiento) son diagnosticos de entrenamiento, no una comparacion con otros modelos.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 2,2 GB solo para pesos, mas cache KV; en la practica alrededor de 3 GB.
- VRAM estimada en 4 bits (MLX): aproximadamente 0,6-0,8 GB para pesos.
- VRAM estimada para el GGUF `Q5_K_M`: aproximadamente 0,8-1,0 GB incluyendo overhead de contexto.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 8 GB, GTX 1660 6 GB o inferiores. Tambien en Macs con memoria unificada, entorno para el que fue entrenado.
- GPU de datacenter (A100, H100) no son necesarias; el modelo es de escala edge.
- Opciones de despliegue: MLX-LM (via `mlx_lm.generate`, ruta oficial del repositorio), llama.cpp, Ollama y LM Studio mediante el GGUF `Minico-M2-Q5_K_M.gguf`. El soporte de vLLM y TGI no esta confirmado en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Minico M2 | 1,08B | No disponible (entrenado a 2.048 tokens) | Sin benchmarks publicados; loss de validacion 0,671 en el paso 200 | Apache-2.0 | MLX fusionado + GGUF Q5_K_M |
| Minico M1 (Minico-M1-Preview) | Clase 350M, base LiquidAI/LFM2.5-350M | No disponible | Sin benchmarks publicados en la informacion disponible | No disponible en la informacion proporcionada | Repo con export float16 dequantizado desde un artefacto Q8_0 |
| openbmb/MiniCPM5-1B (modelo base) | Clase 1B | No disponible | No disponible en la informacion proporcionada | Apache-2.0 | Pesos originales en HuggingFace |
| Otros modelos densos de clase 1B | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa con Minico M1 y con el modelo base es la unica sostenida por datos de la informacion proporcionada. El autor subraya que la tabla de la model card no es un head-to-head estandarizado.

## Limitaciones y advertencias

- Entrenado sobre un subconjunto equilibrado de 4.000 ejemplos, no sobre las colecciones completas: riesgo elevado de sobreajuste y de comportamiento repetitivo.
- El propio autor advierte de que el modelo puede ser repetitivo, sobre-explicar o emitir razonamiento visible cuando la aplicacion solo quiere la respuesta final.
- Longitud de entrenamiento limitada a 2.048 tokens: el rendimiento en contextos largos no esta validado y probablemente degrade.
- Solo ingles declarado. No hay soporte multilingue verificado, incluido el castellano.
- Sin resultados de benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas de su tamano.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.
- No es un modelo oficial de ProCreations ni cuenta con su respaldo, pese a usar sus datasets.
- Licencia Apache-2.0 para esta release, pero sujeta a los terminos y requisitos de atribucion del modelo base y de los datasets de origen; conviene revisar las licencias originales antes de redistribuir derivados.
- El soporte real de mensajes de sistema, controles de thinking y herramientas depende del stack de inferencia, no solo del template del tokenizer.
- Al partir de una base cuantizada a 4 bits para el entrenamiento, puede arrastrar perdida de precision respecto a los pesos originales en float.
- La cuantizacion GGUF Q5_K_M se genero como F16 y se cuantizo con llama.cpp; puede introducir degradacion adicional.
- Riesgo de alucinacion no mitigado de forma especifica: el autor recomienda validar las salidas antes de usarlas en trabajos con consecuencias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mincofficial/Minico-M2
- Repositorio GGUF: https://huggingface.co/Mincofficial/Minico-M2-GGUF
- Minico M1 (comparativa): https://huggingface.co/Mincofficial/Minico-M1-Preview
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-1B
- Base cuantizada usada en entrenamiento: https://huggingface.co/mlx-community/MiniCPM5-1B-4bit
- Dataset ProCreations/grug-3b-train: https://huggingface.co/datasets/ProCreations/grug-3b-train
- Dataset ProCreations/grug-think-v2-10k: https://huggingface.co/datasets/ProCreations/grug-think-v2-10k
- Modelo ProCreations/grug-3b: https://huggingface.co/ProCreations/grug-3b
- Base de Minico M1, LiquidAI/LFM2.5-350M: https://huggingface.co/LiquidAI/LFM2.5-350M
- No se han encontrado papers, blogs tecnicos ni demos adicionales en los resultados de busqueda disponibles.
