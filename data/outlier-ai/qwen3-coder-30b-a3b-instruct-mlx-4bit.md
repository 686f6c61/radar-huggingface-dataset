# Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit

## Resumen

Qwen3-Coder-30B-A3B-Instruct-MLX-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo Qwen/Qwen3-Coder-30B-A3B-Instruct, publicada por Outlier-Ai para su ejecución nativa en Apple Silicon (M1, M2, M3, M4). El modelo original lo desarrolla el equipo Qwen de Alibaba y está especializado en generación de código, uso de herramientas y flujos agénticos. La conversión no altera los pesos más allá de la cuantización: mantiene la licencia Apache 2.0 y el tokenizador y la plantilla de chat originales.

La arquitectura es un transformer con mezcla de expertos (MoE) de 30.532.122.624 parámetros totales, de los que solo una fracción se activa por token (dato de parámetros activos no disponible en la información proporcionada). Esta estructura sparse permite que el modelo, pese a su tamaño, sea viable en memoria unificada de Macs de gama alta cuando se cuantiza a 4 bits, con un repositorio de 17,2 GB.

Su relevancia actual radica en que traslada un modelo de código de escala 30B al entorno local de macOS sin dependencia de la nube: soporta tool calling, completado y generación de código, y está etiquetado para uso agéntico y edge AI. Es una opción para desarrolladores que necesitan privacidad total y ejecución offline en hardware Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), tipo `qwen3_moe` |
| Parametros totales | 30.532.122.624 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 4-bit, group size 64, simetrica |
| Idiomas soportados | en, zh, fr, es, pt, de, it, ru, ja, ko, ar, vi, th, nl, pl |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX 4-bit), con `config.json`, tokenizer y `chat_template.jinja` |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) identificado en la configuración como `qwen3_moe`. El checkpoint convertido conserva la arquitectura original y solo modifica el formato en disco: pesos en safetensors cuantizados a 4 bits con tamaño de grupo 64 y cuantización simétrica, compatible con `mlx-lm` 0.31.x. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original.

La innovación principal de esta publicación no está en el entrenamiento, sino en el empaquetado: una conversión lista para Apple Silicon que permite cargar el modelo con `mlx-lm` mediante una sola llamada (`load` y `generate`) y ejecutarlo sobre Metal en macOS arm64. La model card indica que las cifras de rendimiento publicadas provienen de experimentos internos del equipo de Outlier, no de sus pruebas de release, y remite a su página de benchmarks para la procedencia completa.

## Capacidades

- Generación de texto y conversación multi-turno con plantilla de chat incluida (`chat_template.jinja`).
- Generación y completado de código en múltiples lenguajes, con ejemplos en la model card para Python y SQL.
- Refactorización y depuración de código: el widget de ejemplo incluye una tarea de refactorización con detección de errores.
- Tool calling y function calling, según las etiquetas `tool-use` y `function-calling`.
- Flujos agénticos y razonamiento multi-paso, según la etiqueta `agentic`.
- Capacidades multilingües en 15 idiomas declarados, incluido el español.
- Ejecución local y offline en Apple Silicon, sin llamadas a la nube.
- No se declaran capacidades de visión ni de audio en la información disponible.

## Casos de uso

- Asistente de código en local para macOS: cargar el modelo con `mlx-lm` o con la app Outlier y usarlo como copiloto de completado y generación en el editor, manteniendo el código íntegramente en la máquina.
- Refactorización y revisión de código: el modelo puede reescribir funciones para mejorar legibilidad y señalar errores, como muestra el ejemplo de la model card; encaja en revisiones previas a un commit.
- Generación de consultas SQL: el ejemplo del widget pide una consulta de los 10 usuarios con mayor valor de compra en 90 días, un caso típico de analítica interna con datos sensibles que conviene no enviar a la nube.
- Agentes de automatización con tool calling: integrado en un bucle agéntico que invoque funciones locales (sistema de ficheros, shell, APIs internas) gracias a su soporte de function calling.
- Desarrollo en entornos air-gapped: equipos con Macs aislados de red que necesitan asistencia de código sin conexión externa.
- Prototipado y docencia: ejecutar ejemplos de Python y SQL en un MacBook sin coste de API ni cuotas de uso, útil para formación y demos.
- Privacidad en código propietario: procesar repositorios confidenciales en local, sin que el código salga del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona métricas de MMLU, HumanEval y tok/s en Macs de la serie M con procedencia completa en `outlier.host/benchmarks`, pero no incluye las cifras en el texto proporcionado, por lo que no se reproducen aquí.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 17,2 GB en 4 bits; se necesita memoria unificada suficiente para pesos más caché KV y overhead de ejecución, por lo que se recomienda un Mac con 24 GB o más de memoria unificada (estimación basada en el tamaño del repo, no confirmada en la información).
- GPU recomendadas: Apple Silicon de la serie M (M1, M2, M3, M4) con Metal; las etiquetas mencionan MacBook Air, MacBook Pro, Mac mini y Mac Studio.
- Cabe en GPU de consumo: sí, en el sentido de GPUs integradas de Apple Silicon; no se declara compatibilidad con GPUs NVIDIA ni CUDA.
- Opciones de despliegue: `mlx-lm` 0.31.x (CLI `mlx_lm.generate` y API Python), la app Outlier para macOS (instalable vía `brew install --cask outlier-host/tap/outlier`) y cualquier cargador compatible con MLX.
- Latencia y throughput: no disponibles; la model card remite a su página de benchmarks para tok/s en Macs de la serie M.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-Coder-30B-A3B-Instruct-MLX-4bit (este) | 30.532.122.624 totales, activos no disponible | no disponible | MLX 4-bit safetensors | Apache 2.0 | Hugging Face, 1.154 descargas |
| Qwen/Qwen3-Coder-30B-A3B-Instruct (base) | 30.532.122.624 totales, activos no disponible | no disponible | safetensors originales | Apache 2.0 | Hugging Face |
| Outlier-Quick-26B-MLX-4bit | no disponible | no disponible | MLX 4-bit | no disponible | Hugging Face |
| Outlier-Core-27B-MLX-4bit | no disponible | no disponible | MLX 4-bit | no disponible | Hugging Face |

Las alternativas de la misma familia de conversiones de Outlier (Quick 26B y Core 27B) se orientan a uso general en la app, mientras que esta conversión está especializada en código y uso agéntico. No se dispone de datos de benchmarks para comparar rendimiento entre ellas.

## Limitaciones y advertencias

- La cuantización a 4 bits puede degradar la calidad respecto al modelo original en tareas de código complejas; no se aportan métricas de la pérdida de rendimiento en la información disponible.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en APIs y librerías poco comunes; el código generado debe revisarse y ejecutarse en un entorno controlado.
- Longitud de contexto no declarada en la información proporcionada; conviene verificarla en la model card del modelo base antes de usarla en repositorios grandes.
- Aunque se declaran 15 idiomas, el rendimiento real por idioma no está cuantificado; el foco del modelo es código, no prosa multilingüe.
- Licencia Apache 2.0, que permite uso comercial, pero se recomienda consultar la model card del modelo base para la versión canónica del texto y posibles restricciones adicionales.
- La model card advierte de que las cifras de rendimiento provienen de experimentos internos y no de pruebas de release; no deben tomarse como garantía.
- Dependencia exclusiva del ecosistema Apple Silicon y MLX: no es ejecutable directamente en CUDA, ROCm ni CPU x86 sin reconversión.
- La model card incluye promoción comercial de la app Outlier y precios; es contenido del autor, no una evaluación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- App Outlier: https://outlier.host/
- Benchmarks de Outlier: https://outlier.host/benchmarks
- Conversión Qwen3-14B MLX 4-bit: https://huggingface.co/Outlier-Ai/Qwen3-14B-MLX-4bit
- Conversión Qwen3-8B MLX 4-bit: https://huggingface.co/Outlier-Ai/Qwen3-8B-MLX-4bit
- Conversión Qwen3-32B MLX 4-bit: https://huggingface.co/Outlier-Ai/Qwen3-32B-MLX-4bit
- Outlier-Core-27B MLX 4-bit: https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- Outlier-Nano-4B MLX 4-bit: https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
