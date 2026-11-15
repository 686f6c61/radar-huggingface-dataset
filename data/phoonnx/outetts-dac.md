# Phoonnx/outetts-dac

## Resumen

`Phoonnx/outetts-dac` es un subconjunto de pesos del proyecto `Phoonnx/phoonnx-outetts`, correspondiente a la carpeta `dac` de ese repositorio. Se distribuye como un paquete de artefactos en formato ONNX para su uso con la librería `phoonnx`, un runtime de síntesis de voz orientado a despliegue. No se trata de un modelo entrenado de forma independiente, sino de una extracción de los ficheros del codec de audio (DAC) que acompañan al modelo TTS OuteTTS, empaquetados para que el motor `phoonnx` pueda consumirlos.

El repositorio tiene un tamaño de 0,3 GB, lo que es coherente con un codec neuronal de audio más que con un modelo de lenguaje completo. La model card es explícitamente escueta: indica que los ficheros conservan las rutas del repositorio original y que la licencia aplicable es la que registra el repositorio fuente. No incluye identificadores de voz propios ("None"): las voces de otros repositorios reutilizan estos ficheros.

Su relevancia es operativa más que investigadora: permite a los usuarios de `phoonnx` obtener de forma aislada el componente de decodificación de audio del pipeline OuteTTS, sin arrastrar el resto de pesos del modelo de lenguaje. No hay información publicada sobre arquitectura interna, parámetros o datos de entrenamiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (componente de codec de audio DAC dentro del pipeline OuteTTS; la model card no detalla la arquitectura) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en formato ONNX) |
| Idiomas soportados | no disponible |
| Licencia | other (se remite a la licencia del repositorio fuente; el 0.6B es Apache-2.0 y el 1B es CC-BY-NC-SA-4.0) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, el número de parámetros ni el proceso de entrenamiento en los datos proporcionados. Por el nombre de la carpeta (`dac`) y por el pipeline declarado (`text-to-speech`), se trata del componente de códec neuronal de audio del sistema OuteTTS, empaquetado en ONNX para el runtime `phoonnx`. La model card no documenta capas, tipos de atención, vocabulario ni composición del dataset.

Tampoco se documentan innovaciones técnicas, fases de RLHF/DPO ni detalles de tokenización. Cualquier afirmación sobre estos puntos sería especulativa y no se incluye.

## Capacidades

- Decodificación de audio dentro de un pipeline de texto a voz basado en OuteTTS, consumido a través de la librería `phoonnx`.
- Integración con el runtime `phoonnx` mediante el formato ONNX, lo que permite ejecución portable sin depender de PyTorch en tiempo de inferencia.
- No define identificadores de voz propios: las voces se toman de otros repositorios del ecosistema `phoonnx`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue de TTS en producción con runtime ONNX: el paquete permite cargar únicamente el códec de audio en `phoonnx`, reduciendo el peso del despliegue frente a arrastrar el repositorio completo `phoonnx-outetts`.
- Inferencia en entornos sin PyTorch: al distribuirse en ONNX, encaja en servicios donde el stack de ejecución está estandarizado en ONNX Runtime.
- Integración en pipelines de síntesis de voz existentes: sirve como pieza de decodificación para voces alojadas en otros repositorios del ecosistema `phoonnx`.
- Prototipado rápido de aplicaciones de voz: el tamaño de 0,3 GB facilita su inclusión en imágenes de contenedor y entornos de desarrollo.
- Evaluación del stack `phoonnx` frente a alternativas: permite aislar el componente de audio para comparar latencia y calidad sin el resto del modelo.
- Archivado y reproducibilidad: al conservar las rutas del repositorio original, facilita la reconstrucción del pipeline completo a partir de sus componentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repositorio (0,3 GB) sugiere un consumo de memoria moderado, pero no se documenta el pico de memoria en inferencia.
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada.
- Opciones de despliegue: ONNX Runtime a través de la librería `phoonnx` (https://github.com/TigreGotico/phoonnx). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparación fundamentada.

## Limitaciones y advertencias

- La licencia es "other" y remite al repositorio fuente. El propio repositorio fuente advierte que las dos variantes de tamaño tienen licencias distintas: el 0.6B es Apache-2.0 y cubre 14 idiomas, mientras que el 1B es CC-BY-NC-SA-4.0 y no está licenciado para ucraniano. Es imprescindible verificar qué variante corresponde a estos ficheros antes de un despliegue comercial.
- El repositorio no define voces propias; depende de otros repositorios para los identificadores de voz, lo que añade una dependencia externa al pipeline.
- No hay información publicada sobre sesgos, tasas de alucinación o calidad de síntesis para este paquete concreto.
- Al ser un componente parcial del sistema OuteTTS, no es utilizable de forma autónoma como modelo de texto a voz completo.
- La ausencia de métricas de latencia y memoria impide garantizar acuerdos de nivel de servicio en producción sin una evaluación propia.
- El repositorio registra cero descargas y cero likes, y no cuenta con validación comunitaria documentada.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/outetts-dac
- Repositorio fuente: https://huggingface.co/Phoonnx/phoonnx-outetts
- Runtime phoonnx: https://github.com/TigreGotico/phoonnx
