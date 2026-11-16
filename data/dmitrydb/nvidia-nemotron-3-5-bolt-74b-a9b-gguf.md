# DmitryDB/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-GGUF

## Resumen

NVIDIA Nemotron 3.5 Bolt 74B-A9B es un modelo vision-lenguaje desarrollado por NVIDIA que combina una arquitectura hibrida Mamba-2/Transformer con un diseno LatentMoE (mezcla de expertos latente). Con 74.042.720.768 parametros totales y un pipeline `image-text-to-text`, esta pensado para tareas multimodales de razonamiento, generacion de texto y comprension de imagenes. El repositorio que nos ocupa, publicado por DmitryDB, no es el modelo original de NVIDIA, sino una conversion local a GGUF con cuantizacion IQ4 (variantes IQ4_XS e IQ4_NL) generada a partir de los pesos Q8_0 de Unsloth y del modelo BF16 original.

La relevancia de esta publicacion es practica: permite ejecutar en hardware de consumo un modelo de 74B con vision y arquitectura MoE heterogenea, algo que en BF16 resulta inabordable para la mayoria de equipos. El autor documenta con detalle la procedencia, el proceso de calibracion con imatrix (112.640 tokens procesados en 55 chunks de contexto 2048) y las verificaciones de cobertura sobre 353 proyecciones cuantizadas y 13.824 expertos enrutados en 40 capas MoE.

Se trata, sin embargo, de una conversion no oficial y sin validacion de calidad comparativa frente al original. El propio autor advierte que no es un release de NVIDIA ni de Unsloth, que la calibracion imatrix es solo de texto (no multimodal) y que no se han medido benchmarks ni rendimiento en GPU. La licencia es OpenMDW-1.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba-2/Transformer con LatentMoE y proyector vision C-RADIO |
| Parametros totales | 74.042.720.768 |
| Parametros activos | 9B (denominacion A9B; no se detalla el desglose exacto en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_XS (37,24 GiB), IQ4_NL (39,37 GiB); origen Q8_0; proyector vision en BF16 |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | GGUF (mas `mmproj-BF16.gguf` para vision) |

## Arquitectura y entrenamiento

El modelo base es una arquitectura hibrida que combina capas Mamba-2 con capas Transformer, organizada como LatentMoE con conteos de expertos heterogeneos: 40 capas MoE con 13.824 expertos enrutados en total. Incorpora un proyector visual C-RADIO para el procesamiento de imagenes, lo que habilita el pipeline `image-text-to-text`. Los detalles de entrenamiento del modelo original (numero de tokens, composicion del dataset, uso de RLHF/DPO) no estan incluidos en la informacion disponible y remiten a la model card de NVIDIA.

La publicacion de DmitryDB es una recuantizacion local de Q8_0 a IQ4, no un fine-tune. Cada variante IQ4 se genero directamente desde el mismo origen Q8_0 mediante `--allow-requantize` y una imatrix completada; IQ4_NL no deriva de IQ4_XS. Los ficheros son politicas de precision mixta, no tensores uniformes de cuatro bits: 352 tensores IQ4, un tensor de salida Q6_K, un embedding preservado en Q8_0 y 409 tensores FP32 preservados, sobre un total de 763 tensores. La calibracion empleo el corpus publico `calibration_data_v5_rc.txt` (SHA-256 `2a0118c6...`) con 55 chunks a contexto 2048. Se verifico byte a byte la preservacion de los tensores de mayor precision y del embedding no calibrado.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Comprension de imagenes y respuesta en formato image-text-to-text mediante el proyector C-RADIO.
- Capacidades multilingues declaradas en ingles, espanol, frances, aleman, italiano y japones.
- Soporte de arquitectura MoE con enrutamiento de expertos heterogeneo, lo que reduce el coste de inferencia respecto a un denso de 74B.
- Integracion con clientes GGUF que soporten Nemotron-H, LatentMoE y el proyector visual (por ejemplo, llama.cpp reciente).
- Soporte de tool calling y agentes: no confirmado en la informacion disponible para esta conversion.

## Casos de uso

- Despliegue local de un asistente multimodal en estaciones de trabajo con GPU de consumo: las variantes IQ4 caben en torno a 40 GiB, lo que permite ejecutar el modelo en equipos con 48 GB de VRAM o mediante offload parcial a RAM.
- Analisis de documentos con imagenes: el modelo puede procesar capturas, diagramas o graficos junto a texto gracias al proyector BF16 incluido en `mmproj-BF16.gguf`.
- Prototipado de agentes conversacionales multilingues en espanol, frances, aleman, italiano o japones, aprovechando la cobertura linguistica declarada.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece dos variantes IQ4 generadas desde el mismo origen, util para medir el impacto de IQ4_XS frente a IQ4_NL en tareas propias.
- Investigacion sobre arquitecturas hibridas Mamba-2/Transformer y MoE latente en entornos con recursos limitados.
- Generacion de codigo y texto tecnico en pipelines de CI/CD o herramientas de desarrollo, siempre que se valide la calidad frente al modelo BF16 original.
- Reproducibilidad de conversiones GGUF: el autor documenta hashes, version de llama.cpp (b12421) y procedencia, lo que facilita replicar el proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se realizo una comparacion de calidad emparejada entre IQ4_XS e IQ4_NL, ni benchmarks de rendimiento en GPU, ni una evaluacion de calidad con imagenes reales. Las comprobaciones funcionales se limitaron a una respuesta de una palabra en ruso y una imagen sintetica con izquierda roja y derecha azul.

## Requisitos de hardware

- VRAM estimada: aproximadamente 37,24 GiB para IQ4_XS y 39,37 GiB para IQ4_NL, mas 1,61 GiB del proyector BF16 si se usa vision.
- GPU recomendadas: A100 80 GB, H100, RTX A6000 48 GB, RTX 6000 Ada 48 GB; en configuraciones de 24 GB sera necesario offload a RAM y expectativas de latencia mas altas.
- GPU de consumo: posible en tarjetas de 48 GB (por ejemplo, RTX 4090 con 24 GB no basta sin offload; modelos de 48 GB como la RTX 6000 Ada si). No hay datos de rendimiento medidos.
- Opciones de despliegue: llama.cpp (version b12421 o posterior recomendada por el autor), clientes GGUF compatibles con Nemotron-H y LatentMoE; se desconoce soporte en vLLM, TGI u Ollama para esta arquitectura concreta.
- Latencia y throughput: no disponibles; el autor no realizo benchmarks de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Nemotron 3.5 Bolt 74B-A9B (esta conversion IQ4) | 74B totales / 9B activos | no disponible | Si (C-RADIO) | OpenMDW-1.1 | GGUF |
| Nemotron 3.5 Bolt 74B-A9B BF16 (original NVIDIA) | 74B totales / 9B activos | no disponible | Si | OpenMDW-1.1 | safetensors |
| Nemotron 3.5 Bolt 74B-A9B GGUF Q8_0 (Unsloth) | 74B totales / 9B activos | no disponible | Si | OpenMDW-1.1 | GGUF |
| Otras alternativas MoE multimodales de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion relevante es interna al ecosistema Nemotron: la conversion IQ4 reduce el peso de 84 GB (repo original) a unos 37-39 GiB, a costa de una perdida de precision no medida. No se dispone de datos de benchmarks para contrastar con modelos de otras familias.

## Limitaciones y advertencias

- Conversion no oficial: no es un release de NVIDIA ni de Unsloth; el metadato `general.quantized_by=Unsloth` heredado describe la fuente Q8 y no debe interpretarse como autoria de estos IQ4.
- Calidad en ruso no validada: pruebas informales locales resultaron insatisfactorias; el ruso no figura en la lista de idiomas declarados.
- Calibracion imatrix solo de texto: no es una calibracion multimodal ni una evaluacion de calidad con imagenes reales.
- Sin benchmarks: no hay comparacion de calidad entre IQ4_XS e IQ4_NL ni frente al BF16 original; los scores upstream no se han re-medido.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no cuantificado en esta publicacion.
- Restricciones de licencia: OpenMDW-1.1; debe consultarse el texto completo para uso comercial y conservar los avisos de NVIDIA y Unsloth.
- Requiere runtime reciente con soporte para conteos de expertos heterogeneos de Nemotron-H, LatentMoE y el proyector C-RADIO; clientes antiguos pueden fallar al cargar.
- El descubrimiento automatico del proyector por parte del cliente no garantiza calidad ni un encaje concreto en VRAM.
- Sesgos: no documentados en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DmitryDB/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-GGUF
- Modelo base BF16 de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16
- GGUF Q8_0 de Unsloth: https://huggingface.co/unsloth/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-GGUF
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
