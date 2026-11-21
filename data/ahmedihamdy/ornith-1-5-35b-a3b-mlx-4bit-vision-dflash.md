# ahmedihamdy/Ornith-1.5-35B-A3B-MLX-4bit-vision-DFLASH

## Resumen

Ornith-1.5-35B-A3B-MLX-4bit-vision-DFLASH es un paquete comunitario publicado por el usuario ahmedihamdy que reempaqueta el modelo Ornith 1.5 35B-A3B del equipo Ornith para su ejecución local en Apple Silicon mediante MLX. El paquete combina tres piezas: los pesos de texto en cuantización 4-bit del build oficial MLX, la torre de visión original en bf16 restituida para habilitar la entrada de imágenes, y el modelo borrador DFlash del propio equipo Ornith para decodificación especulativa. No se trata de un lanzamiento oficial de Ornith, sino de una integración orientada a la aplicación Astronomical.

El modelo subyacente es un transformer de mezcla de expertos (MoE) con 35.107.180.016 parámetros totales y arquitectura etiquetada como qwen3_5_moe, lo que sugiere una base derivada de la familia Qwen 3.5. La innovación práctica del paquete es la incorporación del borrador DFlash, que propone varios tokens por paso y el modelo principal los verifica en árbol en una sola pasada, acelerando la decodificación en texto predecible como el código (1,27x según las mediciones del autor) a costa de penalizar la escritura libre (0,89x).

Su relevancia actual reside en que demuestra un flujo completo de inferencia multimodal privada en hardware de consumo Apple: visión, cuantización agresiva a 4 bits y decodificación especulativa conviven en unos 19,1 GB de memoria, lo que permite ejecutar un MoE de 35B en un Mac de 32 GB. La licencia MIT facilita su reutilización, aunque el idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), multimodal con torre de visión |
| Parametros totales | 35.107.180.016 (35,1B) |
| Parametros activos | No disponible (A3B sugiere ~3B activos, no confirmado en la informacion) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit affine en expertos, routers en 8-bit, group size 64; torre de visión en bf16 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), más `drafter/` con el modelo borrador DFlash |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos con 35,1B parámetros totales, empaquetado para MLX. Los pesos de texto usan cuantización affine de 4 bits en los expertos con routers a 8 bits y tamaño de grupo 64, un esquema típico de MLX que reduce el peso en disco a unos 19,7 GB. Sobre esa base se añade la torre de visión original en bf16, compuesta por 27 bloques y 447M parámetros, con sus ficheros de preprocesado de imagen y vídeo. El paquete incluye además un borrador DFlash de 6 capas (5 de ventana deslizante y 1 de atención completa) que lee 8 de las 40 capas del modelo principal.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base empleó RLHF o DPO; la model card del paquete comunitario no los detalla. La innovación técnica destacable es la decodificación especulativa con verificación en árbol: el borrador propone 3 tokens por ronda y el modelo principal los valida en un solo paso, conservando únicamente los que habría generado por sí mismo. Esto garantiza que la salida sea idéntica a la del modelo principal y solo cambia el número de tokens por paso. Los kernels de drafting aprovechan las unidades matriciales de la GPU M5.

## Capacidades

- Generación de texto conversacional en inglés con modo de pensamiento desactivable (la medición se hizo con thinking off).
- Comprensión de imágenes: pipeline `image-text-to-text`, con torre de visión validada sobre una imagen real (describió una imagen y citó textualmente sus tres líneas de texto).
- Procesamiento de vídeo: el paquete incluye `video_preprocessor_config.json`, lo que indica soporte de entrada de vídeo.
- Generación de código: el autor la usa como caso de prueba y es donde el borrador aporta mayor aceleración.
- Decodificación especulativa integrada mediante el borrador DFlash en la carpeta `drafter/`.
- Ejecución local y privada: nada de lo que se introduce o muestra al modelo sale del Mac.
- API local compatible con OpenAI a través de Astronomical.
- Soporte de tool calling y agentes: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de código en local: el modelo genera funciones y tests (el autor prueba un módulo de caché LRU en Python con pruebas unitarias) y el borrador DFlash acelera la decodificación un 1,27x en este tipo de texto predecible, lo que lo hace adecuado para iterar rápido sin conexión.
- Análisis de imágenes privadas: con la torre de visión restituida se pueden enviar fotos y preguntar por su contenido mediante `astronomical respond "..." --image photo.png`, sin que la imagen abandone el equipo; útil para documentos, capturas o material sensible.
- Descripción y extracción de texto de imágenes: la validación del autor consistió en describir una imagen y citar exactamente su texto, un patrón aplicable a digitalización de carteles, capturas o material gráfico.
- Desarrollo y pruebas de pipelines multimodales: al exponer una API local compatible con OpenAI, sirve para probar integraciones de image-text-to-text antes de desplegar en infraestructura mayor.
- Prototipado de aplicaciones con modelos grandes en portátiles: con ~19,1 GB de memoria cabe en un Mac de 32 GB, lo que permite desarrollar con un MoE de 35B sin GPU dedicada.
- Evaluación de decodificación especulativa: el paquete y sus mediciones sirven para estudiar el equilibrio entre velocidad y calidad del drafting en distintos tipos de texto (código frente a prosa).
- Uso educativo y de investigación sobre cuantización: los pesos 4-bit con routers 8-bit y group size 64 son un caso concreto para analizar el impacto de la cuantización en un MoE multimodal.

## Benchmarks y rendimiento

El autor publica mediciones de velocidad de decodificación (tokens por segundo) en un MacBook Pro con Apple M5 Pro, 16 núcleos de GPU, 48 GB de memoria unificada y macOS 27.2.1, con Astronomical 0.2.123, temperatura 0,6, top-p 0,95, top-k 20 y 384 tokens de respuesta. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

| Build | Ensayo (tok/s) | Código (tok/s) |
|---|---|---|
| Ornith-1.5-35B-A3B-MLX-4bit, sin borrador | 95,2 | 95,9 |
| Este paquete, con drafting | 85,2 (0,89x) | 122,1 (1,27x) |

Memoria en uso tras la ejecución: 19,09 GB con borrador y 18,17 GB sin él. La variación entre respuestas individuales ronda el ±10 % respecto a las medianas.

## Requisitos de hardware

- Disco: aproximadamente 19,7 GB.
- Memoria: unos 19,1 GB de memoria de modelo con drafting, dentro del límite por defecto de un Mac de 32 GB; el límite de memoria de modelo usado en la medición fue de 36,5 GB sobre 48 GB.
- GPU recomendadas: Apple M5 Pro (15 núcleos de CPU, 16 de GPU) para aprovechar los kernels de drafting; en un Mac sin GPU M5 el modelo funciona pero decodifica un token a la vez.
- Cabe en GPU de consumo: sí, en Apple Silicon con memoria unificada suficiente; no aplica a GPU NVIDIA en este formato MLX.
- Despliegue: aplicación Astronomical (macOS 14 o posterior), que expone una API local compatible con OpenAI; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato MLX no es directamente compatible con ellos.
- Latencia y throughput: 122,1 tok/s en código y 85,2 tok/s en ensayo con drafting en el hardware medido; el rendimiento depende del ancho de banda de memoria (chips Max o Ultra leen los pesos más rápido) y del tipo y longitud del texto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este paquete (Ornith 1.5 35B-A3B MLX 4-bit + visión + DFlash) | 35,1B totales | No disponible | Sí (torre bf16 de 447M) | MIT | Hugging Face, comunidad |
| ornith-ai/Ornith-1.5-35B-A3B-MLX-4bit | No disponible | No disponible | No (solo texto) | MIT (según base) | Hugging Face, oficial |
| ornith-ai/Ornith-1.5-35B-A3B | No disponible | No disponible | No disponible | MIT (según base) | Hugging Face, oficial |
| ornith-ai/Ornith-1.5-35B-A3B-DFlash | No disponible | No disponible | No disponible | MIT (según base) | Hugging Face, oficial |

La comparación se limita a los artefactos del propio equipo Ornith citados en la model card, ya que no se dispone de datos de rendimiento de calidad ni de modelos de terceros en la información proporcionada.

## Limitaciones y advertencias

- Es un paquete comunitario, no una versión oficial de Ornith; el autor lo declara explícitamente.
- Idioma declarado únicamente inglés; no hay evidencia de calidad en castellano u otros idiomas.
- El drafting penaliza la escritura libre (0,89x en ensayo) y su beneficio disminuye a medida que la conversación se alarga.
- Los kernels de drafting requieren GPU de la familia M5; en otros Mac el modelo funciona sin aceleración especulativa.
- La latencia y el throughput publicados corresponden a un único hardware (M5 Pro, 48 GB); no son extrapolables.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero aplicables a cualquier modelo generativo de este tipo.
- Sin datos publicados de benchmarks de calidad (MMLU, HumanEval, GSM8K), por lo que no se puede verificar su rendimiento frente a alternativas.
- Licencia MIT permite uso comercial, pero conviene revisar las condiciones del modelo base y de la aplicación Astronomical por separado.
- El formato MLX limita el despliegue a Apple Silicon y a la aplicación Astronomical o a herramientas compatibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahmedihamdy/Ornith-1.5-35B-A3B-MLX-4bit-vision-DFLASH
- Modelo base MLX 4-bit: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-MLX-4bit
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Modelo borrador DFlash: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-DFlash
- Astronomical: https://getastronomical.com/
- Descargas de Astronomical: https://github.com/aosama/astronomical/releases/latest
