# Dongziwen/Oral-Qwen2.5-1.5B-Q4_K_M-GGUF

## Resumen

El modelo `Dongziwen/Oral-Qwen2.5-1.5B-Q4_K_M-GGUF` es una conversión a formato GGUF del modelo `Dongziwen/Oral-Qwen2.5-1.5B`, un fine-tune del popular Qwen2.5-1.5B de Alibaba. La cuantización Q4_K_M, realizada mediante la herramienta `gguf-my-repo` de ggml.ai, permite ejecutar el modelo en hardware modesto, tanto CPU como GPU, con un consumo de memoria reducido. El modelo original no dispone de una model card pública detallada, por lo que la información sobre su entrenamiento específico, licencia o idiomas es limitada. Aun así, al estar basado en Qwen2.5-1.5B, hereda las capacidades generales de esta arquitectura: generación de texto, razonamiento, soporte multilingüe y cierta habilidad en código y matemáticas.

La relevancia de esta ficha radica en que ofrece una opción ligera y eficiente para desplegar un modelo de 1.500 millones de parámetros en entornos con recursos restringidos, manteniendo un equilibrio razonable entre calidad y velocidad. El formato GGUF es compatible con llama.cpp, Ollama y otros motores de inferencia, lo que facilita su integración en aplicaciones de producción. Sin embargo, la ausencia de documentación sobre el fine-tune "Oral" obliga a tratar sus capacidades específicas con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 1.543.714.304 (1,5B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el base Qwen2.5 soporta hasta 128K, pero el fine-tune no especifica) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | No disponible (Qwen2.5 base es multilingüe, pero el fine-tune no documenta) |
| Licencia | No disponible |
| Formato de pesos | GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-1.5B es un transformer denso, decoder-only, preentrenado por Alibaba sobre un dataset de hasta 18 billones de tokens, con mejoras significativas en código y matemáticas respecto a la serie Qwen2. El fine-tune `Oral-Qwen2.5-1.5B` no ofrece detalles públicos sobre su proceso de entrenamiento, datos utilizados ni técnicas de alineación (RLHF, DPO, etc.). La conversión a GGUF se realizó con llama.cpp, manteniendo los pesos en cuantización Q4_K_M, que reduce el tamaño del modelo a aproximadamente 1 GB, a costa de una ligera pérdida de precisión frente a la versión en safetensors. No se ha documentado ninguna innovación técnica adicional en el fine-tune.

## Capacidades

- Generación de texto en lenguaje natural, con capacidad de continuar conversaciones y responder a instrucciones (heredada del base Qwen2.5).
- Razonamiento básico y resolución de problemas de lógica, aunque limitado por el tamaño del modelo (1,5B).
- Soporte de código y matemáticas en nivel básico, útil para tareas simples de programación o cálculo.
- Capacidad multilingüe del base Qwen2.5, aunque el fine-tune no confirma si se mantiene.
- No se ha documentado soporte para tool calling, function calling ni modo agente en esta versión.
- No se ha documentado capacidad de visión ni audio.

## Casos de uso

- Chatbots de atención al cliente en entornos con recursos limitados: el modelo puede gestionar conversaciones multi-turno gracias a su contexto (si se configura adecuadamente), aunque su tamaño reducido limita la profundidad del razonamiento.
- Asistente de escritura ligero: redacción de correos, resúmenes o borradores de texto en varios idiomas, ejecutable en portátiles o Raspberry Pi.
- Generación de código para scripts simples o autocompletado en editores, integrable mediante llamadas a llama.cpp u Ollama.
- Clasificación y extracción de información en documentos cortos, como etiquetado de tickets o análisis de sentimiento.
- Prototipado rápido de aplicaciones NLP en entornos de desarrollo sin GPU dedicada, gracias a su bajo consumo de VRAM.
- Educación y experimentación: permite estudiar el comportamiento de modelos cuantizados y comparar con versiones mayores de Qwen2.5.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Qwen2.5-1.5B reporta puntuaciones en MMLU, HumanEval y GSM8K, pero no se puede asumir que el fine-tune "Oral" mantenga esos valores. Se recomienda evaluar el modelo en el dominio específico antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB con cuantización Q4_K_M (el archivo pesa ~1 GB, más overhead de contexto).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como GTX 1050 Ti, RTX 2060, o integradas modernas. También funciona en CPU con 4-8 GB de RAM.
- Cabe en GPUs de consumo medio y bajo, así como en sistemas sin GPU (solo CPU).
- Opciones de despliegue: llama.cpp (CLI o servidor), Ollama, llama-cpp-python, o cualquier motor compatible con GGUF.
- Latencia y throughput estimados: en CPU moderna (por ejemplo, Apple M1), genera ~10-20 tokens/segundo; en GPU dedicada (RTX 3060), ~50-100 tokens/segundo. Valores orientativos, dependen de la configuración.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dongziwen/Oral-Qwen2.5-1.5B-Q4_K_M-GGUF | 1,5B | No disponible | Q4_K_M | No disponible | HuggingFace |
| Qwen/Qwen2.5-1.5B-Instruct-GGUF | 1,5B | 32K (configurable) | Múltiples (Q2_K a Q8_0) | Apache 2.0 | HuggingFace |
| Qwen/Qwen2-1.5B-Instruct-GGUF | 1,5B | 32K | Múltiples | Apache 2.0 | HuggingFace |

La principal diferencia es que el modelo de Dongziwen es un fine-tune no documentado, mientras que los GGUF oficiales de Qwen cuentan con licencia Apache 2.0, contexto conocido y versiones cuantizadas estándar. Para uso en producción, los modelos oficiales ofrecen mayor trazabilidad y soporte.

## Limitaciones y advertencias

- Falta de documentación sobre el fine-tune: no se conocen los datos de entrenamiento, el proceso de ajuste ni los objetivos específicos del modelo "Oral".
- Licencia no especificada: no se puede garantizar el uso comercial sin riesgo legal.
- Riesgo de alucinación y errores factuales, común en modelos de este tamaño.
- Sesgos potenciales heredados del base Qwen2.5, que pueden amplificarse si el fine-tune se realizó con datos sesgados.
- Longitud de contexto no confirmada: aunque Qwen2.5 soporta hasta 128K, el fine-tune podría haber reducido la ventana efectiva.
- No se ha verificado el rendimiento en tareas específicas; cualquier uso en producción requiere evaluación previa.
- La cuantización Q4_K_M introduce pérdida de precisión, que puede afectar tareas que requieren exactitud numérica o razonamiento complejo.

## Enlaces

- Modelo GGUF: [https://huggingface.co/Dongziwen/Oral-Qwen2.5-1.5B-Q4_K_M-GGUF](https://huggingface.co/Dongziwen/Oral-Qwen2.5-1.5B-Q4_K_M-GGUF)
- Modelo base (fine-tune original): [https://huggingface.co/Dongziwen/Oral-Qwen2.5-1.5B](https://huggingface.co/Dongziwen/Oral-Qwen2.5-1.5B)
- Modelo base Qwen2.5-1.5B: [https://huggingface.co/Qwen/Qwen2.5-1.5B](https://huggingface.co/Qwen/Qwen2.5-1.5B)
- Repositorio llama.cpp: [https://github.com/ggerganov/llama.cpp](https://github.com/ggerganov/llama.cpp)
- Herramienta gguf-my-repo: [https://huggingface.co/spaces/ggml-org/gguf-my-repo](https://huggingface.co/spaces/ggml-org/gguf-my-repo)
