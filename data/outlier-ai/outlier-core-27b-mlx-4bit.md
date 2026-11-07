# Outlier-Ai/Outlier-Core-27B-MLX-4bit

## Resumen

Outlier Core 27B (MLX 4-bit) es una conversión cuantizada a 4 bits en formato MLX del modelo denso Qwen3.6-27B de Alibaba, publicada por Outlier-Ai para su ejecución local en Apple Silicon. El repositorio contiene únicamente los pesos convertidos (26.895.998.464 parámetros, 15,2 GB en safetensors), no un modelo entrenado desde cero: la model card lo describe explícitamente como "conversion artifact only", con los pesos subyacentes sujetos a la licencia del modelo base. Está pensado como el nivel "flagship" de la línea Outlier, orientado a Macs con 24 GB de memoria unificada o más.

El modelo es de tipo transformer denso, solo texto, con capacidades declaradas de razonamiento (modo thinking), tool calling y function calling, y soporte para 15 idiomas, entre ellos el castellano. Su relevancia práctica radica en que permite ejecutar un modelo de ~27B en un MacBook Pro o Mac Studio sin conexión a la nube, con inferencia sobre Metal mediante mlx-lm, lo que encaja en escenarios de privacidad estricta, trabajo offline y prototipado local.

La información publicada es limitada: no se detalla la longitud de contexto, la composición del dataset de entrenamiento ni los detalles del proceso de alineación, y los benchmarks declarados (MMLU 5-shot y HumanEval) figuran como no verificados en el model-index. Esta ficha refleja exclusivamente lo disponible en la model card, los metadatos de Hugging Face y los resultados de búsqueda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.6-27B; tags `qwen3_5`/`qwen3.6`) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit (MLX 4-bit); no se documentan otras variantes en este repo |
| Idiomas soportados | en, zh, fr, es, pt, de, it, ru, ja, ko, ar, vi, th, nl, pl |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (MLX), librería `mlx`; tamano del repo 15,2 GB |

## Arquitectura y entrenamiento

El modelo es una cuantización a 4 bits del Qwen3.6-27B original, un transformer denso de aproximadamente 27.000 millones de parámetros. Outlier-Ai no ha entrenado ni ajustado los pesos: la model card indica que se trata de un artefacto de conversión y que los pesos subyacentes se rigen por la licencia del modelo base. No se publican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO en el modelo original.

La única innovación técnica documentada es la aplicación en tiempo de inferencia de un sesgo de calibración Holtzman, descrito como post-procesado puro sin modificación de pesos. No se especifican ni la decodificación especulativa, ni variantes de atención lineal, ni detalles sobre la estrategia de cuantización (grupo de cuantización, precisión de las capas no cuantizadas, etc.).

## Capacidades

- Generación de texto conversacional e instruct, con soporte declarado de modo thinking (razonamiento explícito).
- Generación de código: el autor reporta HumanEval pass@1 de 0,8659 (no verificado).
- Razonamiento y conocimiento general: MMLU 5-shot de 0,8511 (no verificado).
- Tool calling y function calling, según los tags `function-calling` y `tool-use`.
- Uso en flujos agénticos y razonamiento multi-paso (etiqueta `reasoning`).
- Capacidades multilingües en 15 idiomas, incluido el castellano.
- Ejecución 100 % local y offline sobre Apple Silicon (Metal), sin cuotas de tokens ni envío de datos a la nube.
- Modelo solo texto: no se declaran capacidades de visión ni de audio.

## Casos de uso

- Asistente de código en local: integrado en el editor mediante mlx-lm, el modelo puede generar y explicar código sin salir del Mac, lo que resulta adecuado por su HumanEval declarado y su naturaleza offline.
- Automatización de agentes con tool calling: al soportar function calling, puede orquestar llamadas a herramientas locales (scripts, APIs internas) en flujos multi-paso ejecutados íntegramente en el dispositivo.
- Procesamiento de documentos confidenciales: sectores con requisitos de privacidad (legal, sanitario, financiero) pueden resumir y analizar texto sin que los datos abandonen el equipo, gracias al despliegue local y a la ausencia de telemetría de inferencia.
- Atención al cliente y chat multi-turno: útil para prototipar asistentes conversacionales en castellano y otros 14 idiomas antes de desplegarlos en servidores; la ventana de contexto real debe validarse, ya que no está publicada.
- Desarrollo y pruebas offline: investigadores y desarrolladores pueden iterar en entornos sin conectividad (aviones, laboratorios aislados) usando los mismos pesos que en producción local.
- Razonamiento asistido con modo thinking: tareas de análisis, planificación y resolución de problemas donde interesa exponer la cadena de razonamiento antes de la respuesta final.
- Distribución en flota de Macs: al ser un artefacto MLX de 15,2 GB, encaja en despliegues sobre Mac Studio o MacBook Pro con 24 GB o más de memoria unificada, sin infraestructura GPU dedicada.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados):

| Benchmark | Metrica | Resultado |
|---|---|---|
| MMLU (5-shot, n=14042) | accuracy | 0,8511 |
| HumanEval | pass@1 | 0,8659 |

No se han publicado en la información disponible resultados comparativos con otros modelos ni cifras de latencia o throughput más allá de la referencia genérica a "Mac inference-speed numbers" en el sitio del autor.

## Requisitos de hardware

- Memoria: el repo ocupa 15,2 GB en safetensors; se recomienda un Mac con 24 GB o más de memoria unificada (la model card lo describe como el nivel por defecto para Macs de 24 GB+).
- GPU: exclusivamente Apple Silicon (M1, M2, M3, M4) con backend Metal; no está pensado para GPU NVIDIA ni AMD.
- Cabe en GPU de consumo: sí, en el sentido de que cabe en Macs de consumo con memoria unificada suficiente; no aplica a tarjetas gráficas dedicadas.
- Despliegue: `mlx-lm` (CLI `python -m mlx_lm.generate` y API Python `load`/`generate`), o la aplicación Outlier para Mac (instalable vía `brew install --cask outlier-host/tap/outlier`).
- Latencia y throughput: no disponibles en la información proporcionada; el autor remite a outlier.host/benchmarks para cifras con procedencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Outlier Core 27B MLX 4-bit | ~26,9B denso | No disponible | MLX safetensors 4-bit | Apache 2.0 | Conversion de Qwen3.6-27B para Apple Silicon |
| Outlier Quick 26B-A4B MoE | ~26B (MoE, A4B) | No disponible | MLX 4-bit (~16 GB) | Apache 2.0 (segun linea Outlier) | Alternativa MoE de la misma familia, mas rapida por menos parametros activos |
| Outlier Lite 9B | ~9B | No disponible | MLX 4-bit (~6 GB) | Apache 2.0 (segun linea Outlier) | Nivel equilibrado para Macs con menos memoria |
| Qwen3.6-27B (base) | ~27B denso | No disponible | safetensors | Apache 2.0 | Modelo original sin cuantizar; requiere mas memoria |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Los benchmarks declarados (MMLU y HumanEval) figuran como no verificados; deben tratarse como cifras del autor y no como resultados auditados.
- No se publica la longitud de contexto efectiva, lo que impide garantizar conversaciones o documentos largos sin pruebas previas.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones específicas en esta conversión.
- Sesgos: no se detalla ninguna evaluación de sesgos ni de seguridad en la información disponible.
- La cuantización a 4 bits puede degradar la calidad respecto al modelo base de 27B en tareas sensibles; no se publican comparativas 4-bit frente a precisión completa.
- La licencia Apache 2.0 se hereda del modelo base, pero la model card advierte de que es un artefacto de conversión y que los pesos subyacentes se rigen por la licencia del modelo original; conviene verificar los términos del Qwen3.6-27B antes de uso comercial.
- Dependencia exclusiva de Apple Silicon y del ecosistema MLX: no es portable a CUDA ni a otros backends sin reconversión.
- El modelo es solo texto; no cubre visión ni audio.
- El repositorio tiene un volumen de descargas muy bajo (21) y cero likes en el momento de la consulta, lo que reduce la validación comunitaria disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- README del repositorio: https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit/blob/main/README.md
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Sitio del autor y app Outlier: https://outlier.host/
- Benchmarks del autor: https://outlier.host/benchmarks
- Captura del selector de niveles: https://outlier.host/screenshots/tier-picker.png
- Outlier Nano 4B: https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
- Outlier Lite 9B: https://huggingface.co/Outlier-Ai/Outlier-Lite-9B-MLX-4bit
- Outlier Quick 26B-A4B MoE: https://huggingface.co/Outlier-Ai/Outlier-Quick-26B-MLX-4bit
- Outlier Code 27B: https://huggingface.co/Outlier-Ai/Outlier-Code-27B-MLX-4bit
- Outlier Vision 35B-A3B: https://huggingface.co/Outlier-Ai/Outlier-Vision-35B-A3B-MLX-4bit
