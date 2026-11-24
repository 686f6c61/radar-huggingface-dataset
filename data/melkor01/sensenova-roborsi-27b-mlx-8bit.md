# Melkor01/SenseNova-RoboRSI-27B-MLX-8bit

## Resumen

SenseNova-RoboRSI-27B-MLX-8bit es una conversión comunitaria a 8 bits en formato MLX del modelo sensenova/SenseNova-RoboRSI-27B, un vision-language model multimodal de 27 000 millones de parámetros orientado a robótica encarnada (embodied AI). Lo publica el usuario Melkor01 y está pensado para ejecutarse localmente en Macs con Apple Silicon de memoria unificada alta (48 GB a 128 GB o más). El modelo base deriva de la familia Qwen3.8-27B (etiqueta de arquitectura `qwen3_5`) y combina habilidades de VLA (vision-language-action), generación de poses de pinza mediante "Code as Policy" y supervisión de objetivos de efector final con VLA2Agent.

La propuesta técnica central es el bucle de mejora recursiva entre modelo y harness (Recursive Self-Improvement), que permite transferir de forma zero-shot políticas aprendidas en simulación a brazos robóticos físicos Piper y Piper X. El autor reporta un error mediano de 51,6 mm en XYZ para la supervisión de efector final. La ventana de contexto alcanza los 262 144 tokens, lo que habilita trazas robóticas de horizonte largo y razonamiento sobre secuencias de vídeo o imágenes.

Esta conversión concreta aplica cuantización afín MLX de 8 bits (8,627 bpw, `group_size=64`, 498 matrices cuantizadas) manteniendo el codificador visual en bfloat16 sin cuantizar (333 tensores de visión preservados, sin NaN). El repositorio ocupa 27,49 GB repartidos en 6 shards de safetensors. Es relevante para desarrolladores e investigadores que quieran evaluar robótica multimodal de forma local en hardware Apple sin depender de GPUs NVIDIA ni de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5` multimodal vision-language model (VLM) |
| Parametros totales | 27 356 728 560 (27,36 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 262 144 tokens (256K) |
| Tipos de cuantizacion | MLX afín 8 bits (8,627 bpw, `group_size=64`, 498 matrices); codificador visual en bfloat16 sin cuantizar; variantes 4 bits (4,695 bpw) y 6 bits (6,661 bpw) del mismo autor |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (6 shards, formato MLX); repositorio de 27,49 GB (29,6 GB según Hugging Face) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de la familia Qwen3.8-27B (etiqueta `qwen3_5`) que integra un codificador visual con un decodificador de lenguaje. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; esa información no está disponible en la documentación proporcionada. La innovación destacada es el marco RoboRSI (Recursive Self-Improvement), un bucle conjunto entre el modelo y un harness de agente que refina las políticas de manipulación. Sobre esa base se añaden tres componentes: habilidades VLA, generación de poses de pinza mediante Code as Policy (el modelo emite código que actúa como política) y supervisión de objetivos de efector final con VLA2Agent, con un error mediano reportado de 51,6 mm en XYZ.

La conversión MLX se realizó con `mlx-vlm 0.8.1`. Se cuantizaron 498 matrices a 8 bits afín con `group_size=64`, alcanzando una precisión efectiva de 8,627 bpw, mientras que los 333 tensores del codificador visual se conservaron en bfloat16 nativo. El autor indica que la verificación de texto y visión se superó sin NaN en los tensores de visión. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal en la información disponible.

## Capacidades

- Generación de texto y razonamiento multimodal sobre imágenes y texto (pipeline `image-text-to-text`).
- Planificación robótica de manipulación: genera planes de varios pasos para brazos robóticos a partir de una imagen de la escena.
- Code as Policy: produce código que actúa como política de control para la pinza y el efector final.
- Supervisión de efector final mediante VLA2Agent, con error mediano de 51,6 mm en XYZ según el autor.
- Transferencia zero-shot de simulación a robots físicos Piper y Piper X.
- Integración con el runtime de agente OpenSenseNova/SenseNova-RoboRSI a través de un servidor compatible con la API de OpenAI (`mlx_vlm.server`).
- Soporte de modo thinking controlable (`enable_thinking` en la plantilla de chat).
- Capacidades multilingües limitadas a inglés y chino.
- Conversación multi-turno con contexto largo (hasta 256K tokens).
- No se documenta soporte explícito de tool calling genérico ni de audio en la información disponible.

## Casos de uso

- Planificación de manipulación en mesa: dado un image de la escena, el modelo genera un plan de tres pasos para colocar un objeto sobre otro y verificar la estabilidad antes de soltar; encaja por su entrenamiento específico en VLA y su contexto visual.
- Generación de políticas como código: en un pipeline de investigación, el modelo emite código de control de pinza que se ejecuta directamente en el harness RoboRSI, lo que facilita la iteración y la depuración de políticas.
- Evaluación local en Apple Silicon: investigadores sin acceso a GPUs NVIDIA pueden ejecutar el modelo en un Mac Studio o MacBook con 48 GB o más de memoria unificada usando `mlx-vlm`, lo que reduce la barrera de entrada.
- Servidor multimodal compatible con OpenAI: desplegando `mlx_vlm.server` en el puerto 8080 se expone una API `/v1` que el runtime de agente OpenSenseNova puede consumir sin cambios de código.
- Análisis de riesgos de colisión: el modelo inspecciona una imagen del espacio de trabajo y enumera riesgos antes de un agarre, útil en validación previa a la ejecución física.
- Trazas robóticas de horizonte largo: con 256K tokens de contexto se pueden procesar secuencias extensas de imágenes o vídeo para razonamiento sobre tareas de manipulación prolongadas.
- Prototipado de transferencia sim-a-real: el modelo sirve para probar políticas entrenadas en simulación sobre brazos Piper y Piper X antes de un despliegue mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta el error mediano de 51,6 mm en XYZ para la supervisión de efector final con VLA2Agent y los tamaños de disco y memoria pico verificada de las tres cuantizaciones (4, 6 y 8 bits). No se incluyen cifras de MMLU, HumanEval, GSM8K ni de benchmarks de robótica comparables.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 27,9 GB de pico verificado para la versión 8 bits; el autor recomienda 48 GB para contexto corto y 64-128 GB o más para trazas robóticas de horizonte largo o vídeo.
- Hardware objetivo: Apple Silicon M1 a M5 con memoria unificada. No está pensado para GPUs NVIDIA, aunque el autor cita una medición de pico en A100 (27,9 GB) como referencia.
- Cabe en Macs consumer de gama alta: MacBook Pro o Mac Studio con 48 GB o más. Las variantes 4 bits (15,38 GB pico) y 6 bits (21,64 GB pico) permiten 24 GB y 32-64 GB respectivamente.
- Opciones de despliegue: `mlx-vlm >= 0.8.0` (CLI `mlx_vlm.generate` y API Python), servidor local compatible con OpenAI mediante `mlx_vlm.server`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles en la documentación proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SenseNova-RoboRSI-27B-MLX-8bit | 27,36 B | 256K | Apache 2.0 | Hugging Face (MLX) | Cuantización 8 bits comunitaria; codificador visual en bf16 |
| SenseNova-RoboRSI-27B (base) | 27 B | 256K | Apache 2.0 | Hugging Face | Pesos originales sin cuantizar del mismo autor upstream |
| SenseNova-RoboRSI-27B-MLX-6bit | 27,36 B | 256K | Apache 2.0 | Hugging Face (MLX) | 6,661 bpw, 21,23 GB, equilibrio velocidad/precisión |
| SenseNova-RoboRSI-27B-MLX-4bit | 27,36 B | 256K | Apache 2.0 | Hugging Face (MLX) | 4,695 bpw, 14,97 GB, para Macs de 24 GB |

No se dispone de información sobre modelos comparables de otros desarrolladores en la documentación proporcionada.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; no se declara soporte de castellano ni de otras lenguas.
- Riesgo de alucinación inherente a los modelos de lenguaje; en robótica, una política errónea puede provocar colisiones o daños físicos, por lo que se recomienda validación en simulación antes de la ejecución real.
- El error mediano de 51,6 mm en XYZ es una métrica del autor y no está contrastada de forma independiente en la información disponible.
- La cuantización a 8 bits puede degradar ligeramente la precisión de coordenadas frente al modelo original; el autor la describe como "near-lossless" pero no aporta comparativa numérica con el base.
- Dependencia exclusiva del ecosistema MLX y Apple Silicon; no hay soporte documentado para CUDA, ROCm ni otras plataformas.
- Licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia y condiciones del modelo base upstream y del harness OpenSenseNova.
- Repositorio comunitario con 0 descargas y 0 likes en el momento de la consulta; no hay validación externa de la comunidad.
- No se documentan sesgos específicos conocidos ni evaluaciones de seguridad en la información proporcionada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Melkor01/SenseNova-RoboRSI-27B-MLX-8bit
- Modelo base: https://huggingface.co/sensenova/SenseNova-RoboRSI-27B
- Variante 4 bits: https://huggingface.co/Melkor01/SenseNova-RoboRSI-27B-MLX-4bit
- Variante 6 bits: https://huggingface.co/Melkor01/SenseNova-RoboRSI-27B-MLX-6bit
- Runtime de agente: https://github.com/OpenSenseNova/SenseNova-RoboRSI
- README en chino: https://huggingface.co/Melkor01/SenseNova-RoboRSI-27B-MLX-8bit/blob/main/README_CN.md
