# lyl010221-pku/deepvision-vla-rlbench10

## Resumen

DeepVision-VLA — RLBench-10 es una política de control robótico de tipo vision-language-action (VLA) publicada por el usuario lyl010221-pku. Se trata del ajuste fino completo sobre diez tareas de RLBench del modelo DeepVision-VLA, pensado para el flujo de inferencia y evaluación del proyecto, no como un modelo preentrenado de propósito general. El paquete combina un backbone de lenguaje y visión derivado de Qwen3-VL-4B-Instruct con un codificador visual DINOv3 afinado, un alineador y una cabeza de acciones de siete dimensiones.

El modelo parte de una inicialización de preentrenamiento encarnado (H16) y se ajusta durante 300 épocas y 39.300 actualizaciones sobre RLBench con horizonte de acción 1, semilla 42, tasa de aprendizaje 2e-5 y recorte compartido de 0,9. La relevancia actual reside en que demuestra un pipeline VLA completo con pesos abiertos, contratos de acción documentados y evidencia de aceptación en simulador, aunque limitada a dos tareas concretas.

El repositorio ocupa 11,4 GB e incluye los 20 archivos originales del checkpoint, con el backbone y tokenizador de Qwen, el DINO afinado, el alineador, la cabeza de acción, la configuración de entrenamiento y las estadísticas. No incluye imágenes de entrenamiento, estado del optimizador ni estado exacto de reanudación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) con backbone Qwen3-VL-4B-Instruct, codificador DINOv3 afinado, alineador y cabeza de acciones de 7 dimensiones |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo emite acciones, no texto libre) |
| Licencia | other: qwen-apache2-and-dinov3 (pesos Qwen bajo Apache 2.0 y pesos DINOv3 bajo DINOv3 License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un VLA que acopla un modelo de visión-lenguaje Qwen3-VL-4B-Instruct con un codificador visual DINOv3 afinado de extremo a extremo. La entrada visual usa RGB frontal a 224 píxeles con un protocolo de recorte de 0,9, procesamiento Qwen a 256 y DINO a 512. La salida es un vector de acción de 7 dimensiones: delta XYZ del efector final en el marco del mundo, Euler XYZ extrínseco absoluto en radianes y señal de pinza. La normalización es por cuantiles sin recorte.

El entrenamiento parte de la inicialización de preentrenamiento encarnado H16 de 32 dimensiones y aplica 300 épocas y 39.300 actualizaciones de ajuste fino sobre RLBench con horizonte de acción 1, semilla 42, tasa de aprendizaje 2e-5, recorte compartido de 0,9, DINO afinado completo y 7 consultas de acción desacopladas. Los componentes de la inicialización H16 no son necesarios para la inferencia. No se documentan el número de tokens de entrenamiento ni la composición completa del dataset más allá de las diez tareas de RLBench.

## Capacidades

- Control robótico de manipulación en las diez tareas de RLBench para las que fue ajustado.
- Inferencia a partir de imágenes RGB reales, sin necesidad de estado del robot como condicionamiento del modelo.
- Predicción de acciones de 7 dimensiones (delta de posición, orientación absoluta en Euler y pinza).
- Ejecución con el CLI propio de DeepVision, no mediante pipelines genéricos de generación de texto.
- Carga estricta de pesos guardados y aceptación nativa en el simulador CoppeliaSim.
- No se documentan tool calling, function calling, razonamiento multi-paso ni capacidades multilingües.

## Casos de uso

- Evaluación de políticas VLA en RLBench: el modelo se usa con el CLI de DeepVision para reproducir las tareas close_fridge y sweep_to_dustpan y comparar con los registros históricos del paper.
- Investigación en manipulación con horizonte de acción 1: sirve como referencia para estudiar el efecto de la inicialización H16 y del ajuste fino sobre DINO en tareas de RLBench.
- Desarrollo de pipelines de inferencia imagen-a-acción: el contrato de entrada (RGB 224, recorte 0,9) y salida (7D) permite integrarlo en bucles de control en simulador.
- Validación de carga de pesos y protocolos de normalización: útil para comprobar que una implementación respeta la normalización por cuantiles sin recorte y el perfil de cámara guardado.
- Reproducción de resultados del paper: permite contrastar el 83,0 % del paper, el 83,4 % histórico y el 82,4 % con pesos guardados históricos.
- Base para ajuste fino adicional: al incluir backbone, tokenizador, alineador y cabeza de acción, puede servir de punto de partida para nuevas tareas, siempre que se respeten las licencias heredadas.

## Benchmarks y rendimiento

| Tarea | Resultado | Protocolo |
|---|---|---|
| close_fridge | 46/50 = 92 % | 49 intentos reales del modelo, 3 fallos del modelo, 1 fallo de reset |
| sweep_to_dustpan | 49/50 = 98 % | 50 intentos reales, 1 fallo del modelo |
| Resultado del paper | 83,0 % | Registro separado del paper |
| Resultado histórico | 83,4 % | Registro histórico separado |
| Pesos guardados históricos | 82,4 % | Registro histórico separado |

Los resultados de close_fridge y sweep_to_dustpan corresponden a una única semilla y a un entorno nuevo independiente; no constituyen un resultado de diez tareas ni de tres semillas. El resto del benchmark amplio quedó diferido por el usuario.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: CLI propio de DeepVision (https://github.com/yulin-luo/deepvision-vla); no se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- El repositorio pesa 11,4 GB, lo que da una cota inferior del almacenamiento necesario para los pesos en el formato publicado.

## Comparativa con modelos similares

No se han proporcionado datos de modelos comparables en la información disponible. La model card solo referencia Qwen3-VL-4B-Instruct como base del backbone y DINOv3 como codificador visual, sin ofrecer comparativas de rendimiento frente a otras políticas VLA.

## Limitaciones y advertencias

- El modelo está ajustado exclusivamente para diez tareas de RLBench y su perfil de acción y cámara; no es una política general.
- La evidencia de aceptación cubre solo dos tareas y una semilla; no debe extrapolarse a las diez tareas ni a tres semillas.
- No debe inferirse seguridad en robot real ni seguimiento amplio de instrucciones composicionales a partir de los casos de aceptación limitados.
- El estado del robot no condiciona el modelo; la posición XYZ medida solo se usa para formar el objetivo absoluto de ejecución.
- La normalización por cuantiles no está recortada, lo que exige respetar el contrato guardado.
- La licencia es mixta: los pesos Qwen conservan Apache 2.0 y los DINOv3 conservan la DINOv3 License; el conjunto no se relicencia como Apache 2.0.
- Los términos de RLBench y CoppeliaSim son independientes y aplican al ejecutar la evaluación.
- No se incluyen imágenes de entrenamiento, optimizador ni estado exacto de reanudación.
- Los metadatos de entrenamiento contienen rutas de procedencia que no son dependencias de esos servidores.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/lyl010221-pku/deepvision-vla-rlbench10
- Código: https://github.com/yulin-luo/deepvision-vla
- Paper: https://arxiv.org/abs/2603.15618
- Proyecto: https://deepvision-vla.github.io/
- Licencia DINOv3: https://huggingface.co/lyl010221-pku/deepvision-vla-rlbench10/blob/main/LICENSES/DINOv3_LICENSE.md
- Licencia Qwen Apache 2.0: https://huggingface.co/lyl010221-pku/deepvision-vla-rlbench10/blob/main/LICENSES/QWEN_APACHE2_LICENSE.txt
- DINOv3 (repositorio): https://github.com/facebookresearch/dinov3
- Qwen3-VL-4B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
