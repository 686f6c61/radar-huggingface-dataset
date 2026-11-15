# Phoonnx/phoonnx-mms

## Resumen

Phoonnx-mms es una colección de voces de síntesis de voz (text-to-speech) basadas en la arquitectura VITS y procedentes de los modelos MMS-TTS de Meta, empaquetadas para el motor de inferencia phoonnx. El repositorio, publicado por el usuario Phoonnx, actúa como espejo y conversión a ONNX de la familia facebook/mms-tts y de diversos finetunes comunitarios, cubriendo aproximadamente 1100 idiomas con una voz independiente por subcarpeta. Cada voz se distribuye como un archivo `model.onnx` acompañado de su `config.json` nativo y su tokenizer.

El modelo resuelve el problema de desplegar síntesis de voz multilingüe de forma portable: al estar exportado a ONNX, puede ejecutarse fuera del ecosistema PyTorch con dependencias mínimas, lo que facilita su integración en asistentes de voz, sistemas embebidos y pipelines de generación de audio. La ficha se enmarca en el espejo comunitario OpenVoiceOS de phoonnx.

La relevancia actual radica en la amplitud de cobertura lingüística (más de mil voces) y en la estandarización del formato de carga mediante un índice de voces de phoonnx. No obstante, el repositorio es muy reciente (creado en 2026), no registra descargas ni interacciones, y su licencia cc-by-nc-4.0 restringe el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS), exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos ONNX sin indicar variantes cuantizadas) |
| Idiomas soportados | aproximadamente 1100+ idiomas (una voz por subcarpeta) |
| Licencia | cc-by-nc-4.0 (según la model card; el campo de licencia del repo figura como "other") |
| Formato de pesos | ONNX (`model.onnx`) con `config.json` y tokenizer por voz |

## Arquitectura y entrenamiento

La arquitectura subyacente es VITS, un modelo generativo end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial para el entrenamiento. Esta familia de modelos produce audio directamente a partir de la secuencia de entrada sin un vocoder separado, lo que simplifica el despliegue. En este repositorio los pesos originales de MMS-TTS se han convertido a formato ONNX para su ejecución con phoonnx.

La fonemización es de tipo grapheme/uroman según el pipeline de MMS, es decir, no se emplea un fonemizador específico por idioma sino una representación basada en grafemas o en la romanización uroman. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni sobre etapas de RLHF o DPO, ya que el repositorio es un espejo de modelos preexistentes de Meta y de finetunes comunitarios. La model card documenta una revisión de septiembre de 2026 en la que seis voces `hf_community__ylacombe__*` se reexportaron con los parámetros `scales` como entrada del grafo, permitiendo controlar ruido y velocidad en tiempo de ejecución, y en la que seis configuraciones `ghananlpcommunity__*` pasaron a nombrar el símbolo blank del tokenizer. Una voz (shn-Shan) mantiene la exportación anterior con ruido y velocidad congelados por no estar ya disponible su repositorio de origen.

## Capacidades

- Síntesis de voz multilingüe con más de 1100 voces, una por idioma o variante.
- Generación de audio end-to-end mediante VITS, sin vocoder externo.
- Control de ruido y velocidad en tiempo de ejecución para las voces reexportadas (parámetros `scales` como entrada del grafo).
- Fonemización basada en grafemas/uroman, sin fonemizadores específicos por idioma.
- Ejecución portable mediante ONNX con el motor phoonnx.
- Carga estandarizada a través del índice de voces de phoonnx (`engine: transformers`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni modos de pensamiento, al tratarse de un modelo TTS.

## Casos de uso

- Asistentes de voz locales: cada voz puede cargarse desde el índice de phoonnx y ejecutarse en ONNX, lo que permite desplegar un asistente de voz sin dependencia de PyTorch ni de servicios en la nube.
- Lectura de contenido multilingüe: con más de mil voces, un lector de artículos o documentos puede seleccionar la voz correspondiente al idioma del texto y sintetizarlo con la misma pila de inferencia.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla que necesiten síntesis en idiomas minoritarios no cubiertos por otros motores comerciales.
- Sistemas de anuncios y avisos en aplicaciones: generación de mensajes hablados en tiempo de ejecución con control de velocidad mediante el parámetro `scales`, útil para avisos de transporte o alertas.
- Localización de contenido de audio: producción de pistas de voz para vídeos o cursos en múltiples idiomas reutilizando el mismo pipeline ONNX.
- Investigación en lingüística computacional: evaluación comparativa de síntesis en lenguas de bajos recursos gracias a la cobertura de aproximadamente 1100 idiomas.
- Prototipado de interfaces conversacionales: despliegue rápido de una voz concreta en un dispositivo embebido al no requerir más que el runtime ONNX y el archivo de configuración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (132,5 GB) corresponde al conjunto completo de voces, no al de una voz individual.
- GPU recomendadas: no disponible; al ser modelos VITS exportados a ONNX, el requisito por voz es presumiblemente modesto, pero no se documentan cifras.
- Compatibilidad con GPU de consumo: no disponible; no se indica si cabe en tarjetas como RTX 4090 u otras.
- Opciones de despliegue: motor phoonnx con runtime ONNX; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Phoonnx-mms | no disponible | no aplica | ~1100+ | cc-by-nc-4.0 | ONNX |
| facebook/mms-tts | no disponible | no aplica | ~1100+ | cc-by-nc-4.0 | PyTorch (original) |
| VITS estándar (p. ej. variantes comunitarias) | no disponible | no aplica | por modelo | variable | PyTorch / ONNX |

La comparativa se limita a la relación de espejo con facebook/mms-tts, del que este repositorio deriva. No se dispone de datos de rendimiento ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- La licencia cc-by-nc-4.0 restringe el uso comercial; cualquier despliegue en producción con ánimo de lucro requiere autorización expresa.
- El campo de licencia del repositorio figura como "other", lo que puede generar ambigüedad frente a la licencia indicada en la model card.
- No se documentan sesgos conocidos, pero al derivar de MMS-TTS hereda las limitaciones de los datos de entrenamiento originales, no detallados aquí.
- Riesgo de alucinación no aplica en el sentido textual, pero la calidad de la síntesis puede degradarse en idiomas con pocos datos o en textos con caracteres fuera del vocabulario del tokenizer.
- La fonemización basada en grafemas/uroman puede producir pronunciaciones inexactas en lenguas cuya ortografía no es fonémica.
- Una voz (shn-Shan) mantiene ruido y velocidad congelados por no poder reexportarse, lo que limita el control en tiempo de ejecución.
- El repositorio no registra descargas ni interacciones, por lo que no hay evidencia comunitaria de validación.
- No se especifican requisitos de hardware ni cifras de latencia, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Phoonnx/phoonnx-mms
- Motor phoonnx: https://github.com/TigreGotico/phoonnx
- Modelos originales MMS-TTS: https://huggingface.co/facebook/mms-tts
- Colección del espejo comunitario phoonnx: https://huggingface.co/collections/OpenVoiceOS/phoonnx-community-mirror-6a2204d302e0e7497870cd68
