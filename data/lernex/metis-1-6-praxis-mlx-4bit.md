# Lernex/Metis-1.6-Praxis-MLX-4bit

## Resumen

Metis-1.6-Praxis-MLX-4bit es la cuantizacion en 4 bits para Apple Silicon del modelo Metis-1.6-Praxis, desarrollado por Lernex. Se trata de un modelo de lenguaje de 2.943.180.111 parametros (aproximadamente 3,0B) con una arquitectura hibrida que combina mezcla de expertos (MoE) latente con 128 expertos y top-4, junto con capas de estado espacial Mamba-2. El modelo esta disenado especificamente para razonamiento, con un modo de pensamiento interno delimitado por etiquetas `<think>`.

La relevancia de esta version concreta reside en su estrategia de cuantizacion selectiva: en lugar de aplicar 4 bits de forma uniforme, solo los expertos enrutados se cuantizan a 4 bits (en grupos de 64), mientras que las proyecciones de entrada de Mamba-2, las proyecciones del espacio latente de los expertos, el experto compartido y la atencion se mantienen a 8 bits, y los enrutadores, proyecciones de salida de Mamba-2, adaptadores de atencion y cabezas de profundidad permanecen sin cuantizar. El resultado es un modelo de 2,0 GB (5,47 bits por peso) que, segun el autor, esta entre ocho y doce veces mas cerca del original que una conversion estandar a 4 bits.

El modelo ofrece una ventana de contexto de 128.000 tokens y esta pensado para ejecutarse en cualquier Mac con Apple Silicon. Requiere `mlx-lm` y `trust_remote_code=True`, ya que el repositorio incluye la implementacion completa del modelo en un unico archivo (`metis16.py`). La licencia es Apache 2.0, la misma que el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: mezcla de expertos (MoE) latente + Mamba-2 (SSM) + atencion |
| Parametros totales | 2.943.180.111 (aprox. 3,0B) |
| Parametros activos | No disponible (MoE con 128 expertos, top-4) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | 4 bits (expertos enrutados, grupos de 64), 8 bits (embedding, proyecciones Mamba-2, espacio latente de expertos, experto compartido, atencion), sin cuantizar (salidas Mamba-2, enrutadores, adaptadores de atencion, memoria y cabeza de profundidad), FP32 (sesgo de balance de enrutadores, parametros SSM `A`, `D`, `dt_bias`) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura combina una mezcla de expertos latente con 128 expertos y enrutamiento top-4, junto con capas Mamba-2 de estado espacial. El modelo incorpora ademas componentes especificos como adaptadores de atencion por paso, memoria de profundidad y una cabeza de profundidad, que aparecen mencionados en la receta de cuantizacion. La implementacion completa reside en el archivo `metis16.py` incluido en el repositorio, que mlx-lm ejecuta en lugar de una implementacion nativa.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card unicamente documenta el proceso de cuantizacion y las metricas de fidelidad respecto a los pesos originales en BF16/FP32, no el entrenamiento del modelo base.

La innovacion tecnica destacable de esta version es la cuantizacion selectiva por sensibilidad: el autor identifico que una conversion uniforme a 4 bits degrada gravemente esta arquitectura y que casi toda la perdida proviene de unos pocos tensores pequenos, por lo que aplico la receta `Model.quant_predicate` de `metis16.py` para mantener anchos los componentes criticos. La misma receta se aplica en las versiones GGUF y FP8.

## Capacidades

- Generacion de texto conversacional con plantilla de chat propia.
- Razonamiento con modo de pensamiento interno: el modelo razona dentro de etiquetas `<think>` antes de responder; se puede desactivar con `enable_thinking=False` para obtener respuestas directas.
- Razonamiento matematico y aritmetico (la model card incluye un ejemplo de multiplicacion, 17 x 23).
- Soporte de tool calling / function calling: la plantilla de chat contempla conversaciones con herramientas; en mlx-lm las llamadas llegan como texto hasta que se incorpore el parser especifico, y despues como `tool_calls` tipados.
- Servidor compatible con la API de OpenAI mediante `mlx_lm.server`, con `chat_template_kwargs` para controlar `enable_thinking` por peticion.
- Capacidades multilingues: no documentadas en la informacion disponible.
- Vision y audio: no disponibles.

## Casos de uso

- Asistente conversacional local en Mac: el modelo se ejecuta en cualquier Apple Silicon con `mlx_lm.chat`; con 2,0 GB de pesos y 128k de contexto encaja en equipos de 16 GB de memoria unificada, lo que permite un asistente privado sin conexion.
- Razonamiento paso a paso en el dispositivo: el modo `<think>` permite obtener cadenas de razonamiento antes de la respuesta, util para depuracion logica, problemas aritmeticos o analisis de decisiones sin enviar datos a la nube.
- Automatizacion con herramientas en local: la plantilla de chat soporta conversaciones con herramientas y el servidor OpenAI-compatible permite conectarlo a frameworks de agentes que apunten a un endpoint local, manteniendo los datos en la maquina.
- Procesamiento de documentos largos: con 128.000 tokens de contexto se pueden resumir o consultar contratos, informes o transcripciones extensas en una sola pasada, algo poco habitual en modelos de 3B.
- Prototipado rapido de aplicaciones LLM en macOS: al ser un unico archivo de implementacion (`metis16.py`), sirve para estudiar o modificar el comportamiento del modelo en un entorno controlado antes de pasar a despliegues mayores.
- Educacion e investigacion sobre cuantizacion: las metricas de divergencia KL publicadas (0,0165 en chat con pensamiento frente a 0,158 de una conversion plana a 4 bits) lo convierten en un caso de estudio practico sobre tecnicas de cuantizacion selectiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente aporta metricas de fidelidad de cuantizacion: divergencia KL media sobre los 20 tokens mas probables frente a logits FP32 del runtime de entrenamiento nativo, en tres prompts de referencia.

| Pesos | Chat con pensamiento | Chat con herramientas | Prosa |
|---|---|---|---|
| MLX 4-bit (este repositorio) | 0,0165 | 0,0814 | 0,0121 |
| MLX 8-bit | 0,0020 | 0,0148 | 0,0026 |
| Conversion plana a 4 bits (comparacion) | 0,158 | 0,630 | 0,148 |
| BF16 original (referencia) | 0,0073 | 0,014 | 0,0022 |

Rendimiento de inferencia declarado por el autor: 67 tokens/s en generacion y 820 tokens/s de lectura de prompt en un M5 con 16 GB.

## Requisitos de hardware

- Memoria: el repositorio ocupa 2,0 GB; con overhead de ejecucion de MLX, cabe holgadamente en Macs con 16 GB de memoria unificada.
- Hardware: cualquier Mac con Apple Silicon (serie M). El autor reporta mediciones en un M5 con 16 GB.
- GPU dedicadas (A100, H100, RTX 4090): no aplica; esta version es exclusiva de MLX para Apple Silicon. Para CUDA existen las versiones GGUF (llama.cpp, Ollama, LM Studio) y FP8 (vLLM, SGLang) del mismo modelo.
- Despliegue: `mlx-lm` (version 0.32.2 o superior recomendada para el manejo correcto de los marcadores de pensamiento), con `mlx_lm.chat`, `mlx_lm.generate` o `mlx_lm.server` (endpoint OpenAI-compatible).
- Requisito critico: `--trust-remote-code` / `trust_remote_code=True`, porque el repositorio incluye la implementacion del modelo en `metis16.py`; conviene revisar ese archivo antes de ejecutarlo.
- Parametros de muestreo recomendados: temperatura 1,0, top-p 0,95, top-k 20 para modo pensamiento; temperatura 0,3 para respuestas directas. La CLI de mlx-lm no tiene penalizacion de repeticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / plataforma | Notas |
|---|---|---|---|---|---|
| Metis-1.6-Praxis-MLX-4bit | 2,94B (MoE top-4) | 128k | Apache 2.0 | MLX safetensors, Apple Silicon | Cuantizacion selectiva; metricas KL publicadas |
| Metis-1.6-Praxis (BF16) | 2,94B (MoE top-4) | 128k | Apache 2.0 | Transformers, BF16 | Modelo base sin cuantizar |
| Metis-1.6-Praxis-MLX-8bit | 2,94B (MoE top-4) | 128k | Apache 2.0 | MLX, Apple Silicon | Mayor fidelidad (KL 0,0020-0,0148), mas memoria |
| Metis-1.6-Praxis-GGUF | 2,94B (MoE top-4) | 128k | Apache 2.0 | GGUF (llama.cpp, Ollama, LM Studio) | Multiplataforma, misma receta de cuantizacion selectiva |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo con modelos de otros desarrolladores de tamano similar.

## Limitaciones y advertencias

- Exclusivo de Apple Silicon: no se puede ejecutar en CUDA, ROCm ni CPU x86 con esta version; para esas plataformas hay que usar las variantes GGUF o FP8.
- Requiere `trust_remote_code=True`: el codigo de implementacion (`metis16.py`) se ejecuta desde el repositorio; es imprescindible auditarlo antes de usarlo en entornos de produccion.
- Compatibilidad de mlx-lm: las versiones 0.32.2 y anteriores no reconocen los marcadores de pensamiento del modelo, arrancan en modo directo salvo que se pase `enable_thinking` explicitamente y dejan el razonamiento en la respuesta.
- Tool calling incompleto: hasta que mlx-lm incluya el parser de llamadas a herramientas de este modelo, las llamadas llegan como texto plano en la respuesta, lo que complica su integracion automatica en pipelines de agentes.
- Perdida de fidelidad en prompts con herramientas: la divergencia KL en el escenario de chat con herramientas (0,0814) es notablemente superior a la de chat con pensamiento (0,0165) y prosa (0,0121), lo que sugiere mayor degradacion en ese tipo de uso.
- Idiomas soportados no documentados: no hay informacion sobre cobertura multilingue ni sobre el rendimiento en castellano.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; como en cualquier LLM de 3B, cabe esperar alucinaciones en tareas de conocimiento factual y sesgos heredados de los datos de entrenamiento del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y el codigo de implementacion incluido deben revisarse por si incorporan dependencias con condiciones adicionales.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-01; se trata de una publicacion muy reciente sin validacion independiente de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Lernex/Metis-1.6-Praxis-MLX-4bit
- Modelo base BF16 (Transformers): https://huggingface.co/Lernex/Metis-1.6-Praxis
- Version MLX 8-bit: https://huggingface.co/Lernex/Metis-1.6-Praxis-MLX-8bit
- Version GGUF (llama.cpp, Ollama, LM Studio): https://huggingface.co/Lernex/Metis-1.6-Praxis-GGUF
- Version FP8 (vLLM, SGLang): https://huggingface.co/Lernex/Metis-1.6-Praxis-FP8
