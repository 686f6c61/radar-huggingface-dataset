# Retrieve0/Qwen3-ASR-1.7B-EXL3-Decoder

## Resumen

Qwen3-ASR-1.7B-EXL3-Decoder es una conversión cuantizada en formato ExLlamaV3 (EXL3) del decodificador de texto del modelo Qwen3-ASR-1.7B, desarrollado originalmente por el equipo Qwen (Alibaba). El modelo base es un sistema de reconocimiento automático del habla (ASR) que combina un codificador de audio con un decodificador de texto basado en la familia Qwen3-Omni, y que soporta identificación de idioma y transcripción en 52 idiomas y dialectos.

Este repositorio, publicado por el usuario Retrieve0, no contiene el modelo completo: proporciona únicamente los pesos del decodificador de texto cuantizados a 3 y 4 bits por peso (bpw) en formato EXL3, pensados para ejecutarse junto a un codificador TensorRT independiente. La integración de ambos componentes se realiza mediante el proyecto Qwen3-ASR-TensorRT, que ofrece tanto una CLI de transcripción como un servidor HTTP.

Su relevancia es práctica: reduce el peso del decodificador a entre 1,30 y 1,46 GiB, lo que permite desplegar un sistema ASR de 1.700 millones de parámetros en GPUs con menos VRAM y acelerar la decodificación, manteniendo la licencia Apache-2.0 del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador de texto transformer (derivado de Qwen3-Omni) cuantizado en EXL3; requiere codificador de audio TensorRT separado |
| Parametros totales | 1.700 millones (modelo base Qwen3-ASR-1.7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | EXL3 a 3 bpw (1,30 GiB) y 4 bpw (1,46 GiB) |
| Idiomas soportados | 52 idiomas y dialectos (modelo base); lista concreta no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (EXL3), con tokenizer, configuracion de modelo, generacion y cuantizacion |

## Arquitectura y entrenamiento

El modelo base Qwen3-ASR-1.7B es un sistema ASR que combina un codificador de audio con un decodificador de texto heredado de Qwen3-Omni, aprovechando la capacidad de comprensión de audio de este último. El entrenamiento se apoya en datos de habla a gran escala, según la documentación del proyecto original. No se dispone de detalles sobre el número exacto de tokens de audio, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

Este repositorio concreto no reentrena el modelo: aplica cuantización post-entrenamiento con ExLlamaV3 sobre los pesos del decodificador. EXL3 combina tensores de pesos cuantizados con tensores auxiliares en coma flotante (escalas, normalización y auxiliares), y las variantes se identifican por su tasa de bits (3 bpw o 4 bpw). El codificador de audio no forma parte de este repositorio y debe obtenerse por separado en formato TensorRT.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) en 52 idiomas y dialectos, según el modelo base.
- Identificación automática de idioma.
- Comprensión de audio heredada de Qwen3-Omni.
- Ejecución como CLI de transcripción (`qwen3-asr transcribe`) o como servidor HTTP (`qwen3-asr serve`) mediante el runtime Qwen3-ASR-TensorRT.
- Backend híbrido TensorRT (codificador) + ExLlamaV3 (decodificador).
- Soporte de plataforma Windows (probado); Linux compatible con versiones adecuadas de CUDA, TensorRT, PyTorch y ExLlamaV3.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión ni modo thinking para este repositorio.

## Casos de uso

- Transcripción por lotes de reuniones y entrevistas: el decodificador cuantizado a 3 bpw reduce el uso de VRAM, lo que permite procesar colas largas de audio en una sola GPU con el servidor HTTP del runtime.
- Subtitulado automático multilingüe: la identificación de idioma y el soporte de 52 idiomas del modelo base permiten generar subtítulos sin especificar el idioma de origen.
- Despliegue en estaciones de trabajo con GPU de consumo: con 1,30 GiB para el decodificador a 3 bpw, el grueso de la VRAM queda para el codificador TensorRT, lo que facilita ejecutar el sistema en equipos Windows con GPU NVIDIA.
- Servicio interno de transcripción vía API: el comando `serve` expone un endpoint HTTP que se puede integrar en aplicaciones de notas de voz o centros de contacto.
- Archivado y búsqueda de audio: transcribir grabaciones históricas para indexarlas y hacerlas consultables por texto.
- Evaluación comparativa de cuantización: las variantes 3 bpw y 4 bpw permiten medir el compromiso entre precisión de transcripción y velocidad/memoria en un mismo pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- GPU NVIDIA con CUDA obligatoria (no hay soporte CPU documentado).
- VRAM del decodificador: aproximadamente 1,30 GiB (3 bpw) o 1,46 GiB (4 bpw), más el consumo del codificador TensorRT y de las activaciones, no cuantificado en la información disponible.
- Entorno de referencia: ExLlamaV3 1.6.6, PyTorch 2.10.0, CUDA 12.8, Python 3.10–3.13.
- Windows probado y soportado; Linux debe funcionar con paquetes compatibles de CUDA, TensorRT, PyTorch y ExLlamaV3.
- Despliegue mediante el runtime Qwen3-ASR-TensorRT (CLI o servidor HTTP); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B-EXL3-Decoder (este) | 1.700 M (decodificador cuantizado) | No disponible | 52 (modelo base) | Apache-2.0 | safetensors EXL3 |
| Qwen3-ASR-1.7B (original) | 1.700 M | No disponible | 52 | Apache-2.0 | safetensors |
| Qwen3-ASR-0.6B | 600 M | No disponible | 52 | Apache-2.0 | safetensors |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Este repositorio contiene solo el decodificador: no es funcional por sí solo y requiere el codificador TensorRT compatible y el runtime Qwen3-ASR-TensorRT.
- La cuantización a 3 bpw puede degradar la precisión de transcripción frente al modelo original; la variante 4 bpw es la alternativa de mayor precisión.
- Dependencia estricta de versiones (ExLlamaV3 1.6.6, PyTorch 2.10.0, CUDA 12.8); combinaciones distintas pueden fallar.
- Requiere GPU NVIDIA; no hay ruta de ejecución en CPU documentada.
- Riesgo de errores de transcripción en audio con ruido, acentos no representados o vocabulario técnico; no se documentan tasas de error.
- Sesgos del modelo base no documentados en la información disponible.
- Aunque la licencia es Apache-2.0, deben conservarse la atribución y la licencia del modelo upstream Qwen3-ASR; ExLlamaV3 y las dependencias del runtime tienen sus propias licencias.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria conocida.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Retrieve0/Qwen3-ASR-1.7B-EXL3-Decoder
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B-hf
- Codificador TensorRT compatible: https://huggingface.co/Retrieve0/Qwen3-ASR-1.7B-TensorRT-Encoder
- Repositorio del runtime: https://github.com/lost0427/Qwen3-ASR-TensorRT
- Página del modelo original: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Repositorio oficial Qwen3-ASR: https://github.com/QwenLM/Qwen3-ASR
