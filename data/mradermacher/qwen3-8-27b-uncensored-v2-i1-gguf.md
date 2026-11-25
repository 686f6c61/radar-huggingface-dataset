# mradermacher/Qwen3.8-27B-Uncensored-v2-i1-GGUF

## Resumen

Qwen3.8-27B-Uncensored-v2-i1-GGUF es una colección de cuantizaciones en formato GGUF del modelo InterpreticAI/Qwen3.8-27B-Uncensored-v2, publicada por el usuario mradermacher. El modelo base es una variante "uncensored" (sin censura) de la familia Qwen3.8, con 27.320.697.856 parámetros totales según los pesos en safetensors del repositorio. La cuantización la realiza mradermacher, un prolifico generador de GGUF en Hugging Face, usando quantizaciones ponderadas con imatrix (matriz de importancia) para preservar la calidad en tasas de bits bajas.

El interés de esta ficha reside en que ofrece el modelo en múltiples niveles de compresión (desde Q2_K de 11 GB hasta Q6_K de 22,5 GB), lo que permite ejecutarlo en hardware de consumo. El modelo base está etiquetado como "uncensored" y "political-censorship", lo que indica que se ha entrenado o ajustado para reducir los rechazos y la censura política típica de los modelos alineados. La licencia declarada es Apache 2.0, lo que facilita su uso comercial.

La información disponible es limitada: la model card del cuantizador es una plantilla estándar de mradermacher y no incluye detalles sobre arquitectura, entrenamiento, contexto ni benchmarks del modelo base. Esta ficha refleja únicamente los datos verificables del repositorio y marca explícitamente como "no disponible" todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Qwen3.8, presumiblemente transformer; no confirmado en la informacion) |
| Parametros totales | 27.320.697.856 (27,3 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (mas archivo imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |
| Tamano del repositorio | 218,6 GB |
| Cuantizaciones estaticas | disponibles en repositorio separado (Qwen3.8-27B-Uncensored-v2-GGUF) |
| Vision | el autor indica que el modelo base es un modelo de vision; los archivos mmproj estarian en el repositorio estatico |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base en la documentación proporcionada. El nombre "Qwen3.8-27B" sugiere una variante de la familia Qwen con 27 mil millones de parámetros, pero no se confirma si es un transformer denso, un MoE o una arquitectura híbrida. Tampoco se detallan los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO.

Lo que sí se documenta es el proceso de cuantización: mradermacher ha generado cuantizaciones "i1" (imatrix) ponderadas, que utilizan una matriz de importancia calculada sobre un corpus de calibración para asignar más bits a los tensores más sensibles. El repositorio incluye el propio archivo imatrix (0,1 GB) para que otros usuarios puedan crear sus propias cuantizaciones. Las cuantizaciones i1 suelen ofrecer mejor perplejidad que las estáticas equivalentes en tamaño, especialmente en niveles bajos (Q2, Q3).

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta "conversational" del repositorio.
- Modelo etiquetado como "uncensored" y "political-censorship": orientado a reducir rechazos y censura política en las respuestas.
- El autor indica que el modelo base es un modelo de visión; las capacidades multimodales (mmproj) estarían en el repositorio de cuantizaciones estáticas.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, multi-step reasoning, thinking mode, audio ni otras capacidades especiales.

## Casos de uso

- Investigación sobre alineación y censura: el modelo permite estudiar cómo varían las respuestas al eliminar mecanismos de rechazo, comparando con la versión alineada de Qwen3.8.
- Generación creativa sin restricciones temáticas: escritura de ficción, guiones o narrativa que aborde temas que los modelos alineados suelen rechazar, ejecutado localmente con llama.cpp u Ollama.
- Despliegue local en hardware de consumo: las cuantizaciones i1-Q4_K_M (16,9 GB) o i1-IQ4_XS (15,4 GB) caben en GPUs con 24 GB de VRAM, como la RTX 4090, permitiendo inferencia privada sin conexión.
- Análisis de contenido sensible en entornos controlados: clasificación o resumen de textos que contienen lenguaje explícito o político, donde un modelo censurado devolvería rechazos.
- Evaluación de cuantizaciones: el archivo imatrix y la variedad de niveles (Q2 a Q6) permiten medir el impacto de la compresión en la calidad de las respuestas en un modelo de 27B.
- Prototipado de asistentes conversacionales en inglés: uso con la librería transformers o con servidores compatibles con la API de OpenAI (etiqueta "endpoints_compatible") para pruebas de diálogo multi-turno.
- Fine-tuning posterior sobre las cuantizaciones: no es posible directamente sobre GGUF, pero el modelo base en safetensors (Apache 2.0) permite ajuste fino y posterior cuantización con el imatrix incluido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de cuantización):
  - i1-Q2_K: ~11 GB de pesos; ~12-13 GB de VRAM con contexto moderado.
  - i1-IQ3_S / i1-Q3_K_M: ~12,7-13,6 GB; ~14-15 GB de VRAM.
  - i1-IQ4_XS / i1-Q4_K_S: ~15,4-15,9 GB; ~17-18 GB de VRAM.
  - i1-Q4_K_M: ~16,9 GB; ~18-19 GB de VRAM.
  - i1-Q5_K_M: ~19,6 GB; ~21-22 GB de VRAM.
  - i1-Q6_K: ~22,5 GB; ~24 GB de VRAM (ajustado en RTX 4090).
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40 GB o H100 para Q6_K con contexto largo; RTX 3090 (24 GB) para Q4.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) con cuantizaciones Q4 y Q5; en GPUs de 16 GB solo con Q2/Q3 o descarga parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con la API de OpenAI (etiqueta "endpoints_compatible"); el formato GGUF no es compatible con vLLM ni TGI de forma nativa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-v2-i1-GGUF (este) | 27,3B | no disponible | Apache 2.0 | GGUF (i1) | Variante sin censura, solo inglés |
| Qwen3.8-27B-Uncensored-v2-GGUF (estatico) | 27,3B | no disponible | Apache 2.0 | GGUF (estatico) | Mismo modelo base, cuantizaciones sin imatrix; incluye mmproj de visión |
| InterpreticAI/Qwen3.8-27B-Uncensored-v2 (base) | 27,3B | no disponible | Apache 2.0 | safetensors | Pesos originales, permite fine-tuning |
| Modelos Qwen3.8 alineados de la familia | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento (benchmarks) con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo está etiquetado como "uncensored": puede generar contenido ofensivo, explícito o políticamente sensible; no es apto para producción orientada al público sin filtros adicionales.
- Riesgo de alucinación: no se han publicado evaluaciones de fiabilidad; al ser un ajuste "uncensored", la reducción de rechazos puede aumentar la generación de afirmaciones no verificadas.
- Solo soporta inglés según la etiqueta de idioma; el rendimiento en castellano no está garantizado.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base declara la misma licencia; conviene verificar la procedencia del ajuste "uncensored" y las condiciones del modelo original Qwen3.8.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) degradan notablemente la perplejidad; para producción se recomienda Q4_K_M o superior.
- El repositorio ocupa 218,6 GB; la descarga completa no es necesaria, pero requiere seleccionar el archivo concreto.
- No hay garantías de soporte ni mantenimiento del cuantizador más allá de la plantilla estándar de mradermacher.
- El modelo base es de visión según el autor, pero los archivos mmproj no están en este repositorio; para uso multimodal hay que acudir al repositorio estático.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-v2-i1-GGUF
- Modelo base: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-v2-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.8-27B-Uncensored-v2-i1-GGUF
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
