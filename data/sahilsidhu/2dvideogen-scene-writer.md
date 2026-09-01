# SahilSidhu/2dvideogen-scene-writer

## Resumen

El modelo `SahilSidhu/2dvideogen-scene-writer` es un fine-tuning de `google-t5/t5-small` (60 millones de parámetros) desarrollado por SahilSidhu para convertir una descripción en lenguaje natural en un guion de escena expresado en un DSL (lenguaje específico de dominio) que el compositor del proyecto 2DVideoGen puede renderizar directamente a un archivo `.mp4`. El modelo resuelve el problema de la brecha entre la intención creativa del usuario y la representación estructurada necesaria para la generación automática de vídeo 2D, eliminando la necesidad de escribir el guion a mano.

La relevancia actual radica en que permite un pipeline completamente automático de texto a vídeo animado que funciona íntegramente en CPU, sin necesidad de GPU, lo que democratiza la generación de contenido animado para desarrolladores, educadores y creadores con recursos limitados. El modelo está entrenado sobre 6000 pares sintéticos de prompt/DSL más 700 de validación, con un diseño de datos que incluye deconfounding y muestreo conjunto de posiciones para mejorar la generalización. La arquitectura es un transformer encoder-decoder estándar de T5, con una longitud de contexto de entrada limitada a 160 tokens y salida a 256 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 (encoder-decoder transformer) |
| Parametros totales | 60.506.624 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 160 tokens de entrada, 256 de salida (límites de generación) |
| Tipos de cuantizacion | no disponible (pesos en fp32, ~242 MB) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura T5-small, un transformer encoder-decoder con aproximadamente 60 millones de parámetros. El entrenamiento se realizó íntegramente en CPU (8 hilos, 2250 pasos, 6 épocas, 548,5 segundos) sobre un conjunto de datos sintético de 6000 pares prompt/DSL generados por el script `scene_synth.py` con las opciones `--deconfound --stage --max-cast 8`. El dataset de validación contiene 700 prompts disjuntos de los de entrenamiento.

Dos innovaciones técnicas destacan en el diseño de los datos: el deconfounding, que elimina la correlación espuria entre el número de cláusulas y el tamaño del reparto (en el primer dataset, el 99,9% de los ejemplos tenían cláusulas iguales al tamaño del reparto, lo que impedía al modelo contar correctamente), y el muestreo conjunto de posiciones (`--stage`), que genera distribuciones de posicionamiento más realistas y es la base de la mejora en la puntuación de staging. El entrenamiento usó `--epochs 6 --batch 16 --lr 3e-4 --max-in 160 --max-out 256 --val-cap 200`. El límite de salida de 256 tokens es crítico: los objetivos tienen una media de 113,9 tokens y un máximo de 252, por lo que un límite inferior truncaría silenciosamente el 11,28% de los objetivos de entrenamiento.

## Capacidades

- Generación de guiones de escena en DSL estructurado a partir de lenguaje natural, con prefijo obligatorio `prompt2scene:`.
- Soporte de hasta 8 personajes por escena, con atributos de color, posición y acciones.
- Generación de fondos, objetos (props) y líneas de tiempo con acciones secuenciales.
- Parseo y renderizado directo a `.mp4` mediante el compositor 2DVideoGen (sin GPU).
- Procesador de logits para garantizar colores únicos entre los personajes (constraint global que un decodificador autorregresivo no puede ver).
- Funcionamiento en CPU con tiempos de entrenamiento e inferencia muy reducidos.
- Capacidad de generalización fuera de distribución: mejora en staging de 0,099 a 0,804 en prompts no vistos.

## Casos de uso

- Generación automática de storyboards animados: un guionista escribe una descripción narrativa y el modelo produce el guion DSL que el compositor convierte en un vídeo de prueba, acelerando la previsualización de escenas.
- Prototipado rápido de animaciones 2D para desarrolladores de juegos: permite generar escenas de prueba sin escribir código de animación, usando solo una frase descriptiva.
- Creación de contenido educativo animado: profesores o creadores de cursos pueden generar vídeos explicativos simples (personajes, fondos, acciones) sin herramientas de animación complejas.
- Automatización de vídeos para redes sociales: un pipeline que recibe textos de noticias o resúmenes y produce clips animados cortos con personajes y fondos, listos para publicar.
- Asistente de accesibilidad para personas con discapacidad visual: convierte descripciones textuales de escenas en representaciones animadas que pueden ser revisadas por otros, facilitando la comunicación de ideas espaciales.
- Integración en herramientas de diseño de niveles: un diseñador describe la disposición de objetos y personajes en un nivel, y el modelo genera el guion que el motor de juego puede interpretar para pruebas de jugabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque el modelo es especializado en una tarea de generación estructurada. Los datos de rendimiento disponibles provienen de la model card y se refieren a métricas propias del proyecto:

| Metrica | In distribution (beam4) | In distribution (sampled) | Out of distribution (beam4) | Out of distribution (sampled) |
|---|---|---|---|---|
| Parse | 98,0% | 99,3% | 100,0% | 100,0% |
| Render tras reparación | 98,0% | 99,3% | 100,0% | 100,0% |
| Válido sin reparación | 80,7% | 60,7% | 70,8% | 41,7% |
| Colores duplicados | 0 | 0 | 0 | 0 |
| Tamaño del reparto | 100,0% | 100,0% | 95,8% | 95,8% |
| Fondo | 100,0% | 100,0% | 100,0% | 100,0% |
| Acciones | 85,7% | 72,5% | 83,3% | 87,5% |
| Todos los campos a la vez | 85,7% | no disponible | 70,8% | 75,0% |
| Staging score | 0,182 | 0,875 | 0,099 | 0,804 |

La puntuación de staging se define como la calidad del posicionamiento de los personajes en la escena. El `eval_loss` final es 1,0042, superior al de checkpoints anteriores (v2: 0,9470, v1: 0,9240), pero la model card advierte que la pérdida no es la métrica relevante en este caso debido a la mayor entropía del objetivo.

## Requisitos de hardware

- Inferencia en CPU: el modelo está diseñado para funcionar sin GPU; el entrenamiento completo tardó 548,5 segundos en una CPU de 8 hilos.
- VRAM estimada: no aplica para CPU; si se usara GPU, el modelo fp32 (~242 MB) cabría en cualquier GPU con más de 1 GB de VRAM.
- GPUs recomendadas: no se requiere GPU; cualquier CPU moderna con al menos 4 hilos es suficiente para inferencia en tiempo real.
- Compatibilidad con GPU de consumo: sí, cualquier GPU con 2 GB de VRAM o más puede ejecutarlo, pero no es necesario.
- Opciones de despliegue: transformers (Python), compatible con text-generation-inference y endpoints de HuggingFace; también puede exportarse a ONNX o TensorRT si se desea aceleración.
- Latencia y throughput: no se han publicado cifras exactas, pero el entrenamiento de 2250 pasos en 548,5 segundos sugiere una inferencia de milisegundos por prompt en CPU.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la misma categoría (fine-tuning de T5-small para generación de DSL de escenas de vídeo). Los modelos de generación de vídeo comerciales (Sora, Kling, Veo) resuelven una tarea diferente (generación de píxeles) y no son comparables en arquitectura, tamaño ni licencia. El proyecto 2DVideoGen es un enfoque único que separa la generación de guion (este modelo) del renderizado simbólico.

## Limitaciones y advertencias

- El tamaño del reparto está limitado al rango entrenado (1-8 personajes); fuera de ese rango el modelo puede fallar al leer el numeral correctamente (15/15 para 6-8, 14/15 para 1-5).
- No se debe usar beam search: degrada drásticamente la calidad del staging (0,182 vs 0,875 con sampling). Es obligatorio usar `do_sample=True` con `top_p=0.95`.
- El prefijo `prompt2scene:` es obligatorio en la entrada; sin él, el modelo no produce resultados válidos.
- El modelo solo soporta inglés; no hay capacidad multilingüe.
- La salida puede requerir reparación: el 19,3% de las salidas en distribución (beam4) y el 39,3% (sampled) necesitan corrección tras la generación.
- El cumplimiento de la disposición declarada (layout obedience) cae del 45,8% (beam4) al 25,3% (sampled), un trade-off a tener en cuenta.
- El modelo está entrenado con datos sintéticos, por lo que puede no capturar la riqueza semántica de prompts reales complejos; la generalización fuera de distribución es limitada en algunos aspectos.
- La licencia Apache-2.0 permite uso comercial, pero el proyecto 2DVideoGen (repositorio GitHub) debe revisarse para confirmar la licencia del compositor y las herramientas asociadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SahilSidhu/2dvideogen-scene-writer
- Repositorio GitHub del proyecto 2DVideoGen: https://github.com/SahilSidhu7/2DVideoGen
- Demo en vivo: https://huggingface.co/spaces/SahilSidhu/2dvideogen
