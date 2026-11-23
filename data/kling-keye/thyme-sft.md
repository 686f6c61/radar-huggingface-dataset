# Kling-Keye/Thyme-SFT

## Resumen

Thyme-SFT es un modelo multimodal de tipo image-text-to-text desarrollado por Kling-Keye (equipo vinculado a Kwai-Keye) y publicado bajo licencia MIT. Se trata de un ajuste fino supervisado (SFT) del modelo base Qwen2.5-VL-7B-Instruct, con 8.292.166.656 parámetros totales según los pesos en safetensors. El modelo forma parte del proyecto Thyme, presentado en el informe técnico "Thyme: Think Beyond Images" (arXiv:2508.11630), cuya propuesta central es superar los paradigmas habituales de "pensar con imágenes" mediante la generación y ejecución autónoma de operaciones de procesamiento de imagen y cómputo a través de código ejecutable.

La relevancia del modelo reside en su enfoque de razonamiento visual aumentado por código: en lugar de limitarse a describir o interpretar una imagen, el modelo puede generar operaciones (recortes, zoom, transformaciones, cálculos) y ejecutarlas para mejorar la percepción de alta resolución y el razonamiento complejo. El proyecto emplea una estrategia de entrenamiento en dos etapas que combina SFT con aprendizaje por refuerzo, usando el algoritmo GRPO-ATS para equilibrar exploración del razonamiento y precisión en la ejecución de código.

Esta ficha corresponde a la variante SFT (existe también una variante RL, Thyme-RL). El modelo declara soporte únicamente para inglés, está orientado a conversación multimodal y se distribuye en formato safetensors con un tamaño de repositorio de 16,6 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (derivada de Qwen2.5-VL); vision-language model |
| Parametros totales | 8.292.166.656 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Thyme-SFT se construye sobre Qwen2.5-VL-7B-Instruct, un transformer multimodal que combina un codificador visual con un modelo de lenguaje para tareas image-text-to-text. El ajuste se realiza en dos etapas según el proyecto: una primera fase de supervised fine-tuning (SFT) sobre el dataset Kwai-Keye/Thyme-SFT, y una segunda fase de aprendizaje por refuerzo (RL) sobre Kwai-Keye/Thyme-RL que da lugar a la variante Thyme-RL. Esta ficha documenta la variante SFT.

La innovación técnica destacada por los autores es la capacidad del modelo de generar y ejecutar código para operaciones de imagen (procesamiento y cómputo), lo que permite abordar percepción de alta resolución y razonamiento complejo más allá de la mera inspección visual. El algoritmo GRPO-ATS se emplea en la fase RL para equilibrar la exploración del razonamiento con la precisión en la ejecución del código. No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas como DPO.

## Capacidades

- Generación de texto y razonamiento multimodal a partir de entradas de imagen y texto.
- Percepción visual de alta resolución mediante generación y ejecución de operaciones de imagen (recortes, zoom, transformaciones) a través de código ejecutable.
- Razonamiento complejo asistido por cómputo: el modelo puede plantear operaciones computacionales y ejecutarlas como parte del proceso de respuesta.
- Conversación multi-turno (pipeline conversational, image-text-to-text).
- Capacidades multilingües: limitadas al inglés según la model card.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: parcialmente implícito en el enfoque de ejecución de código, sin detalles adicionales disponibles.
- Modo thinking explícito, visión, audio u otras capacidades especiales: no disponible en la información proporcionada más allá del enfoque de razonamiento con código.

## Casos de uso

- Análisis de documentos e imágenes de alta resolución: el modelo puede generar recortes y zooms sobre regiones específicas de una imagen y ejecutar esas operaciones para leer texto pequeño o detalles finos, aprovechando su enfoque de percepción aumentada por código.
- Automatización de tareas de inspección visual: en pipelines donde se requiere localizar y medir elementos en imágenes (por ejemplo, conteo de objetos o verificación de patrones), el modelo puede emitir operaciones de procesamiento y cómputo en lugar de depender solo de la descripción textual.
- Asistentes conversacionales multimodales: al ser un modelo conversacional image-text-to-text, puede gestionar diálogos multi-turno con imágenes adjuntas en inglés, adecuado para soporte técnico o educativo.
- Extracción de información estructurada de capturas y gráficos: combinando percepción visual y ejecución de código para transformar datos visuales en resultados computados.
- Investigación en razonamiento visual: sirve como base para experimentos sobre "pensar con imágenes" y ejecución de código, dado que el proyecto publica datos SFT y RL y código de entrenamiento y evaluación.
- Prototipado de agentes visuales: su capacidad de generar y ejecutar operaciones de imagen lo hace útil para explorar arquitecturas de agentes que manipulan imágenes como paso intermedio de razonamiento, con la cautela de que el soporte de tool calling no está documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 8.292.166.656 parámetros, en precisión completa (BF16) los pesos ocupan aproximadamente 16,6 GB, por lo que se requiere al menos esa cantidad de VRAM más overhead de activaciones y del codificador visual.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabría esperar GPUs de 24 GB o más (por ejemplo, RTX 4090, A100, H100) para inferencia en BF16, aunque no se confirma en la documentación.
- ¿Cabe en consumer GPU?: no confirmado; en BF16 probablemente requiere GPUs de gama alta con 24 GB o más, y cuantizaciones no están documentadas.
- Opciones de despliegue: no disponible en la información proporcionada (vLLM, llama.cpp, Ollama, TGI no se mencionan).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Thyme-SFT | 8.292.166.656 | no disponible | MIT | SFT sobre Qwen2.5-VL-7B-Instruct; razonamiento visual con código |
| Qwen2.5-VL-7B-Instruct | ~7B (familia Qwen2.5-VL) | no disponible en esta ficha | no disponible en esta ficha | Modelo base del que deriva Thyme-SFT |
| Thyme-RL | no disponible | no disponible | no disponible | Variante RL del mismo proyecto, publicada por el autor |

No se dispone de datos de rendimiento comparativo ni de especificaciones adicionales de alternativas en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: la model card declara únicamente inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto: no documentada en la información disponible, lo que impide planificar casos de uso con contextos largos.
- Riesgo de alucinación: inherente a los modelos de lenguaje y visión-lenguaje; no se documentan mitigaciones específicas.
- Sesgos: no se documentan sesgos conocidos en la información proporcionada.
- Ejecución de código: el enfoque del modelo implica generar y ejecutar operaciones de código; en producción debe aislarse y sandboxearse la ejecución para evitar riesgos de seguridad.
- Licencia MIT: permite uso comercial, pero conviene verificar las obligaciones de atribución y las licencias del modelo base Qwen2.5-VL-7B-Instruct.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no se han publicado benchmarks en la información disponible; debe evaluarse empíricamente antes de usarlo en producción.
- Soporte de tool calling y despliegue: no documentado, lo que limita la integración directa en pipelines de agentes existentes sin validación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kling-Keye/Thyme-SFT
- Modelo RL: https://huggingface.co/Kwai-Keye/Thyme-RL
- Dataset SFT: https://huggingface.co/datasets/Kwai-Keye/Thyme-SFT
- Dataset RL: https://huggingface.co/datasets/Kwai-Keye/Thyme-RL
- Página del proyecto: https://thyme-vl.github.io/
- Repositorio GitHub: https://github.com/yfzhang114/Thyme
- Informe técnico (arXiv): https://arxiv.org/abs/2508.11630
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
