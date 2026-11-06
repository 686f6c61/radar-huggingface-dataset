# kishida/Haas-ja-v1.0-GGUF

## Resumen

Haas-ja-v1.0-GGUF es una conversión no oficial al formato GGUF del modelo de reconocimiento automático del habla (ASR) en japonés third-intelligence/Haas-ja-v1.0, publicada por el desarrollador kishida. El modelo original lo desarrolla Third Intelligence y esta conversión tiene como objetivo permitir la inferencia en CPU sin dependencias de Python ni GPU, a través del proyecto Haas-ASR-Java, una implementación en Java del runtime necesario.

El modelo cuenta con 615.871.520 parámetros (aproximadamente 616 millones) y está especializado exclusivamente en transcripción de audio en japonés. La conversión ofrece dos variantes cuantizadas en 4 bits (Q4_K_S y Q4_K_XS) que reducen el peso original de 1,2 GB a 0,54 GB y 0,36 GB respectivamente, manteniendo determinadas capas en bfloat16 para preservar la fidelidad de la salida.

La relevancia de esta ficha radica en su carácter práctico: demuestra un flujo de despliegue de ASR japonés en entornos Java sin infraestructura de GPU, con un rendimiento declarado de aproximadamente 4 veces más rápido que tiempo real en una CPU de escritorio de 16 hilos. Es importante señalar que estos ficheros GGUF no son compatibles con llama.cpp ni con runtimes GGUF genéricos, ya que utilizan nombres de tensores y metadatos propios del proyecto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo ASR con encoder, decoder y joint network; detalles del original no especificados) |
| Parámetros totales | 615.871.520 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q4_K_S (0,54 GB) y Q4_K_XS (0,36 GB), ambas en formato Q4_K de ggml para las matrices grandes del encoder |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (metadatos y nombres de tensores propios del proyecto Haas-ASR-Java; no compatibles con llama.cpp) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo original third-intelligence/Haas-ja-v1.0 más allá de su naturaleza ASR. La conversión GGUF describe una estructura con encoder, decoder, joint network, capas de atención y normas, lo que sugiere una arquitectura de tipo encoder-decoder con red conjunta, habitual en sistemas ASR modernos, aunque no se confirma el tipo exacto (por ejemplo, transducer o CTC-attention).

Respecto al entrenamiento, no se dispone de datos sobre el número de tokens, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card de la conversión no incluye esta información y remite a la model card del modelo original para los resultados del mismo. La innovación técnica destacable de esta publicación no reside en el entrenamiento, sino en el proceso de conversión: se utilizó `tools/export_gguf.py`, que implementa el método `quantize_row_q4_K_ref` de ggml, con la opción `--quantize-attention` para la variante XS. Las capas de atención, decoder, joint network, normas y sesgos se mantienen en bfloat16 en Q4_K_S, mientras que en Q4_K_XS solo se preservan decoder, joint network, normas y sesgos.

## Capacidades

- Reconocimiento automático del habla (ASR) en japonés: transcripción de audio a texto.
- Procesamiento de audio de duración variable; se han validado clips de 8 a 124 segundos.
- Inferencia en CPU sin GPU ni Python, mediante el runtime Java Haas-ASR-Java (requiere JDK 25 o superior).
- Dos niveles de cuantización con distinto equilibrio entre tamaño y fidelidad.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-step, visión, audio generativo ni modo thinking.
- Capacidad multilingüe: no disponible; el modelo está etiquetado únicamente para japonés.

## Casos de uso

- Transcripción de reuniones y notas de voz en japonés: el modelo puede convertir grabaciones de hasta varios minutos en texto ejecutándose en CPU, lo que permite desplegarlo en portátiles o servidores sin GPU.
- Subtitulado y generación de actas en entornos Java: al integrarse mediante Haas-ASR-Java, puede incorporarse a aplicaciones empresariales ya existentes en la JVM sin añadir dependencias de Python.
- Procesamiento por lotes de archivos WAV en servidores modestos: con la variante Q4_K_XS (0,36 GB y 0,8 GB de heap Java), es viable ejecutar transcripciones concurrentes en máquinas con poca memoria.
- Prototipado y evaluación de ASR japonés: la licencia Apache 2.0 y el reducido tamaño facilitan experimentos académicos y pruebas de concepto sin coste de infraestructura.
- Aplicaciones de accesibilidad: transcripción local de audio japonés en dispositivos de escritorio, sin enviar datos a servicios en la nube.
- Herramientas de análisis de contenido audiovisual en japonés: indexación y búsqueda de texto a partir de grabaciones, ejecutando el modelo en el mismo equipo que procesa los medios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la precisión de estos ficheros no se ha medido en un benchmark. La única evaluación disponible es una comparación cualitativa con el modelo original ejecutado en PyTorch sobre cuatro clips de 8 a 124 segundos, en su mayoría voz sintetizada:

| Variante | Comparación con el original (4 clips) |
|---|---|
| Q4_K_S | Transcripciones idénticas en los cuatro clips |
| Q4_K_XS | Una diferencia de un carácter en un clip (我輩 frente a 吾輩); el resto idénticos |

En cuanto a velocidad, la model card declara que en una CPU de escritorio de 16 hilos el modelo transcribe aproximadamente 4 veces más rápido que tiempo real.

## Requisitos de hardware

- VRAM: no aplica; la inferencia está diseñada para CPU.
- Memoria: Q4_K_S requiere un heap Java mínimo de 1,5 GB; Q4_K_XS requiere 0,8 GB (medido con audio de unos 20 segundos).
- GPU: no se requiere GPU; no se documenta soporte de aceleración por GPU para esta conversión.
- CPU: se ha validado en una CPU de escritorio de 16 hilos, con rendimiento aproximado de 4 veces tiempo real.
- Software: JDK 25 o superior, con el módulo `jdk.incubator.vector` habilitado.
- Despliegue: exclusivamente mediante Haas-ASR-Java. No es compatible con llama.cpp, Ollama, vLLM, TGI ni otros runtimes GGUF genéricos, ya que llama.cpp no reconoce la arquitectura del modelo y los metadatos son propios del proyecto.
- Latencia y throughput: solo se dispone del dato agregado de 4 veces tiempo real en CPU de 16 hilos; no hay cifras detalladas por variante.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La model card no incluye comparaciones con otras alternativas de ASR japonés, y no se han facilitado datos de benchmarks que permitan establecer una comparación cuantitativa. Por tanto, la comparativa se indica como no disponible.

## Limitaciones y advertencias

- Conversión no oficial: no está afiliada ni respaldada por Third Intelligence, autora del modelo original.
- Incompatibilidad con llama.cpp y otros runtimes GGUF: los nombres de tensores y los metadatos son propios del proyecto Haas-ASR-Java; otros runtimes pueden no leer estos ficheros.
- Nomenclatura engañosa: Q4_K_XS no equivale a IQ4_XS de llama.cpp, y ambos ficheros registran su tipo como Q4_K_S.
- Precisión no medida en benchmarks: la validación se limita a cuatro clips, en su mayoría de voz sintetizada, por lo que el comportamiento en audio real (ruido, acentos, solapamientos) no está caracterizado.
- Idioma único: solo japonés; no se documenta soporte multilingüe.
- Dependencia de hardware y software concretos: requiere JDK 25 o superior y el módulo incubador de vectores, lo que limita la portabilidad.
- Riesgo de alucinación y errores de transcripción: no se han publicado análisis de sesgos ni tasas de error (WER/CER) sobre corpus representativos.
- Licencia Apache 2.0: permite uso comercial, pero al tratarse de una conversión no oficial conviene verificar las condiciones del modelo original y citar adecuadamente a Third Intelligence.
- Sin datos sobre contexto máximo ni sobre el comportamiento con audios muy largos más allá de los 124 segundos validados.

## Enlaces

- Repositorio Hugging Face de la conversión: https://huggingface.co/kishida/Haas-ja-v1.0-GGUF
- Modelo original: https://huggingface.co/third-intelligence/Haas-ja-v1.0
- Runtime Java Haas-ASR-Java: https://github.com/kishida/Haas-ASR-Java
- Script de conversión: https://github.com/kishida/Haas-ASR-Java/blob/main/tools/export_gguf.py
- Fichero Q4_K_S: https://huggingface.co/kishida/Haas-ja-v1.0-GGUF/resolve/main/Haas-ja-v1.0-Q4_K_S.gguf
