# bluewake-labs/QwenCleo-ASR-GGUF

## Resumen

QwenCleo-ASR-GGUF es la conversión al formato GGUF del modelo de reconocimiento automático del habla mohammedaly22/QwenCleo-ASR, desarrollado originalmente por Mohammed Aly y publicado en formato cuantizado por Bluewake Labs. El modelo está especializado en transcripción de árabe egipcio y de habla mixta árabe-inglés, un escenario frecuente en Egipto y en comunidades de la diáspora donde se alternan ambos idiomas en una misma conversación. Deriva del modelo base Qwen/Qwen3-ASR-1.7B, sobre el que se ha realizado un ajuste fino específico para estos dominios lingüísticos.

La relevancia de esta publicación es fundamentalmente práctica: al estar en formato GGUF, el modelo puede ejecutarse con llama.cpp y sus derivados (Ollama, LM Studio, servidores compatibles) en hardware de consumo, sin necesidad de GPUs de centro de datos. El repositorio incluye dos ficheros, el modelo principal cuantizado en Q8_0 y el proyector multimodal en F16, con un total de aproximadamente 1.720 millones de parámetros y un tamaño de repositorio de 2,5 GB.

La licencia Apache 2.0, heredada del modelo original y de su base, permite uso comercial sin restricciones adicionales, lo que facilita su integración en productos de transcripción, subtitulado o asistentes de voz para árabe egipcio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Qwen3-ASR-1.7B, ajustado para ASR) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (modelo principal), F16 (proyector multimodal mmproj) |
| Idiomas soportados | arabe (egipcio), ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo original QwenCleo-ASR es un ajuste fino de Qwen/Qwen3-ASR-1.7B, un modelo de reconocimiento automático del habla de la familia Qwen3 con aproximadamente 1.700 millones de parámetros. La arquitectura concreta (composición del encoder de audio y del decoder de texto) no se detalla en la información disponible; el modelo base Qwen3-ASR emplea un diseño multimodal con proyector que conecta representaciones de audio con el modelo de lenguaje, tal como evidencia la presencia del fichero mmproj en esta conversión.

El ajuste fino se orientó específicamente a árabe egipcio y a habla mixta árabe-inglés. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. La conversión a GGUF realizada por Bluewake Labs no introduce cambios en los pesos más allá de la cuantización: modelo principal en Q8_0 y proyector multimodal en F16.

## Capacidades

- Reconocimiento automático del habla (ASR) para árabe egipcio.
- Transcripción de habla mixta árabe-inglés, con cambios de idioma dentro de una misma emisión.
- Procesamiento multimodal audio-texto mediante el proyector mmproj incluido en el repositorio.
- Ejecución local con llama.cpp y herramientas compatibles con GGUF.
- Naturaleza conversacional según los tags del repositorio, orientada a la interacción por voz.
- No se documentan capacidades de tool calling, agentes, visión ni razonamiento multi-paso en la información disponible.
- Cobertura multilingüe limitada a los dos idiomas declarados (ar, en).

## Casos de uso

- Transcripción de reuniones y llamadas en árabe egipcio: el modelo puede convertir audio de conversaciones coloquiales en texto, un dominio donde los ASR genéricos entrenados en árabe estándar moderno rinden peor por las diferencias dialectales.
- Subtitulado de contenido audiovisual egipcio: series, pódcast y vídeos de YouTube donde los hablantes alternan árabe e inglés, aprovechando la capacidad de manejar code-switching.
- Atención al cliente por voz: integración en sistemas de transcripción de llamadas de soporte en centros de contacto de Egipto, con despliegue local mediante llama.cpp para cumplir requisitos de privacidad de datos.
- Documentación clínica o legal dictada: transcripción de notas de voz en entornos donde el personal alterna árabe egipcio e inglés, ejecutando el modelo en hardware de oficina sin GPU dedicada de gama alta.
- Investigación en lingüística de corpus: generación de transcripciones de grabaciones de campo en dialecto egipcio para análisis sociolingüístico, con la ventaja de poder procesar los datos íntegramente en local.
- Accesibilidad: conversión de audio a texto para personas con discapacidad auditiva en aplicaciones orientadas a audiencias egipcias, aprovechando la licencia Apache 2.0 para su integración en productos comerciales.
- Asistentes de voz embebidos: despliegue en dispositivos con recursos limitados gracias a la cuantización Q8_0 y al tamaño contenido del modelo (1,7 mil millones de parámetros).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero principal Q8_0 ocupa 1.834.422.272 bytes (aproximadamente 1,71 GiB) y el proyector F16 ocupa 641.773.888 bytes (aproximadamente 612 MiB); en total, en torno a 2,3 GiB de pesos, más el overhead de contexto y del runtime de llama.cpp.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para una ejecución cómoda en GPU; tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores son suficientes. Para servidores, A100 o H100 no son necesarias dado el tamaño del modelo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna con 4 GB o más de VRAM; también puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier servidor compatible con GGUF y con soporte de proyector multimodal (mmproj) para entrada de audio.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| QwenCleo-ASR-GGUF | 1.720.574.976 | no disponible | ar (egipcio), en | Apache 2.0 | GGUF |
| Qwen/Qwen3-ASR-1.7B (modelo base) | ~1.700 millones | no disponible | no disponible en la informacion | no disponible en la informacion | safetensors (original) |
| mohammedaly22/QwenCleo-ASR (original) | no disponible | no disponible | ar, en | Apache 2.0 | safetensors |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de estos modelos entre sí ni con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo está especializado en árabe egipcio y habla mixta árabe-inglés; su rendimiento en otros dialectos árabes o en árabe estándar moderno no está documentado y podría degradarse.
- No se han publicado métricas de evaluación (WER, CER) en la información disponible, por lo que no es posible cuantificar su precisión frente a alternativas.
- Riesgo de alucinación inherente a los modelos de lenguaje que componen la arquitectura ASR: en pasajes con ruido o audio poco claro, la salida podría contener texto inventado.
- La cuantización Q8_0 introduce una pérdida de precisión respecto a los pesos originales en safetensors; para aplicaciones que requieran máxima fidelidad podría ser preferible el modelo original.
- La longitud de contexto no está documentada, lo que dificulta planificar la segmentación de audios largos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria del funcionamiento de la conversión.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene verificar las condiciones del modelo base Qwen3-ASR-1.7B, cuya licencia no se detalla en la información disponible.
- El soporte de audio en llama.cpp requiere el fichero mmproj y una versión del runtime con soporte multimodal; no todos los frontends lo implementan.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bluewake-labs/QwenCleo-ASR-GGUF
- Modelo original: https://huggingface.co/mohammedaly22/QwenCleo-ASR
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Sitio de Bluewake Labs: https://bluewakelabs.com
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
