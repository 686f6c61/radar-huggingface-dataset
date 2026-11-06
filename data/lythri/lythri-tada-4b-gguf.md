# Lythri/Lythri-Tada-4B-GGUF

## Resumen

Lythri-Tada-4B-GGUF es la versión cuantizada en formato GGUF del modelo Lythri-Tada-4B, desarrollado por Lythri. Se trata de un modelo de lenguaje de aproximadamente 4.630 millones de parámetros (4,62 B según los pesos en safetensors del modelo base) orientado específicamente a la conversación de apoyo emocional y a la interacción de acompañamiento ("companion"), con un enfoque declarado de ejecución en dispositivo ("on-device"). La model card lo etiqueta como derivado de la familia Gemma 4, lo que sitúa su arquitectura en la línea de transformers densos de Google, aunque el autor no detalla la arquitectura exacta en la información disponible.

El modelo resuelve el problema de disponer de un asistente conversacional especializado en soporte emocional que pueda ejecutarse localmente mediante llama.cpp, Ollama o LM Studio, sin depender de APIs externas. Su tamaño (4,6 B parámetros) lo hace viable en hardware de consumo con cuantizaciones adecuadas, y el repositorio GGUF facilita el despliegue en entornos de escritorio y edge.

Es relevante ahora porque combina tres factores poco habituales en un mismo paquete: especialización temática (soporte emocional), licencia permisiva Apache 2.0 y distribución en formato GGUF lista para inferencia local. La advertencia del autor sobre la sensibilidad a la cuantización es un dato técnico importante para quien planifique desplegarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Gemma 4, según la model card; detalles no disponibles) |
| Parámetros totales | 4.628.569.635 (4,62 B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF (el repositorio ofrece cuantizaciones; el autor recomienda la de mayor precisión posible; tipos concretos no listados en la información disponible) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible indica que Lythri-Tada-4B se construye sobre Gemma 4, lo que implica una arquitectura transformer densa con aproximadamente 4,62 B parámetros. El repositorio GGUF es una cuantización del modelo base Lythri/Lythri-Tada-4B, no un modelo entrenado desde cero, por lo que hereda la arquitectura y el entrenamiento del original. No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o ajuste fino supervisado.

El aspecto técnico más destacable documentado por el autor es la sensibilidad del modelo a la cuantización: la model card advierte explícitamente de que los modelos Lythri son "altamente sensibles a la cuantización" y recomienda usar la cuantización de mayor precisión que permita el hardware, señalando que las de menor número de bits funcionan pero no son recomendables. Esta advertencia sugiere que el ajuste fino especializado en matices emocionales puede degradarse con la compresión de pesos, un caveat relevante para el despliegue.

## Capacidades

- Generación de texto conversacional orientada a apoyo emocional y acompañamiento.
- Conversaciones multi-turno de carácter empático (según la especialización declarada en las etiquetas del modelo).
- Ejecución en dispositivo ("on-device") mediante llama.cpp, Ollama y LM Studio.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Asistente de acompañamiento emocional local: el modelo puede mantener conversaciones de apoyo en el dispositivo del usuario sin enviar datos personales a servidores externos, lo que resulta adecuado para un dominio sensible como el bienestar emocional.
- Aplicación de escritorio de diario o reflexión guiada: integrado vía Ollama o LM Studio, puede generar respuestas empáticas a partir de las entradas del usuario, aprovechando su ajuste específico en conversación de apoyo.
- Prototipado de chatbots de bienestar en investigación: su licencia Apache 2.0 y su tamaño contenido permiten experimentar con sistemas de soporte conversacional en entornos académicos sin costes de API.
- Despliegue en hardware de consumo: con cuantizaciones GGUF de alta precisión cabe en equipos con GPU de gama alta o incluso en CPU, lo que facilita demos y pruebas de concepto offline.
- Integración en aplicaciones móviles o edge: el formato GGUF y el enfoque on-device permiten empaquetar el modelo en apps que requieran privacidad y funcionamiento sin conexión.
- Evaluación comparativa de cuantizaciones: dado el aviso del autor sobre la sensibilidad a la cuantización, el repositorio sirve para estudiar cómo afecta la compresión de bits a la calidad de las respuestas empáticas en un modelo pequeño especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a la ficha del modelo base para resultados de evaluación, pero dichos datos no se incluyen en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para 4,62 B parámetros, una cuantización de 8 bits requeriría aproximadamente 5-6 GB y una de 4 bits alrededor de 3 GB, estimaciones orientativas no confirmadas por el autor.
- GPU recomendadas: no especificadas en la información disponible; por tamaño, cabría en GPUs de consumo como RTX 3060/4060 (12/8 GB) con cuantizaciones altas, y en A100/H100 sin problema.
- Cabe en GPU de consumo: sí, previsiblemente, en modelos con 8 GB o más de VRAM usando cuantizaciones de alta precisión; el autor recomienda la mayor precisión posible.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (`ollama run hf.co/Lythri/Lythri-Tada-4B-GGUF`), LM Studio (buscando `Lythri/Lythri-Tada-4B-GGUF`).
- Parámetros de muestreo recomendados por el autor: `--temp 0.8 --top-p 0.95 --top-k 64 --repeat-penalty 1.05`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (soporte emocional on-device de ~4-5 B parámetros) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Sensibilidad a la cuantización: el autor advierte explícitamente de que el modelo se degrada con cuantizaciones de baja precisión; no se recomienda usar bits bajos en producción.
- Riesgo de alucinación: no cuantificado en la información disponible, pero inherente a los modelos generativos de este tamaño.
- Sesgos conocidos: no documentados en la información disponible.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están disponibles, lo que impide garantizar su comportamiento en conversaciones largas o en castellano.
- Dominio sensible: al tratarse de un modelo de soporte emocional, no debe presentarse como sustituto de atención psicológica profesional; la información disponible no incluye salvaguardas documentadas.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo se construye sobre Gemma 4; conviene verificar las condiciones de la licencia de la familia base para usos derivados.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/Lythri/Lythri-Tada-4B-GGUF
- Modelo base: https://huggingface.co/Lythri/Lythri-Tada-4B
- DOI de referencia: https://doi.org/10.5281/zenodo.23179311
- Banner del proyecto: https://huggingface.co/spaces/Lythri/README/resolve/main/Banner_flat.png
