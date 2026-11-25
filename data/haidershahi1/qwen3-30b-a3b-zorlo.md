# Haidershahi1/qwen3-30b-a3b-zorlo

## Resumen
qwen3-30b-a3b-zorlo es una conversión del modelo Qwen3-30B-A3B (Qwen team, Alibaba Cloud) empaquetada para Zorlo, un motor de inferencia open source (Apache 2.0) orientado a ejecutar modelos Mixture-of-Experts de gran tamano en PCs Windows convencionales con 8 GB de RAM y sin GPU. El modelo original es un transformer MoE de 30.500 millones de parametros totales con aproximadamente 3.300 millones activos por token, y esta conversion conserva la cuantizacion Q4_K_M oficial de Qwen.

La innovacion no esta en los pesos sino en el formato de empaquetado: los tensores no-expertos (atencion, routers, norms, embeddings y cabeza de salida) se agrupan en un unico `core.gguf` de 1,0 GB que permanece en memoria, mientras que los 48 x 128 expertos se almacenan en `experts.bin` (17,6 GB) en bloques alineados que Zorlo lee del SSD bajo demanda. Se anade opcionalmente `experts.lo.bin` (9,5 GB), una recuantizacion Q2_K de los expertos para el modo `fast`.

Es relevante porque demuestra una via practica para servir un MoE de 30B en hardware de gama baja con un throughput de 2,98-3,47 tokens/s en modo `exact`, superando el rendimiento de llama.cpp con el mismo GGUF mapeado en memoria (1,43 tokens/s) en el mismo portatil de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), base Qwen3-30B-A3B |
| Parametros totales | 30.500 millones (modelo base); el tensor safetensors del repo declara 1.541.093.376 parametros para los tensores no-expertos empaquetados |
| Parametros activos | Aproximadamente 3.300 millones por token (modelo base) |
| Longitud de contexto | No especificada en la informacion disponible; el ejemplo de arranque de Zorlo usa `-c 12288` |
| Tipos de cuantizacion | Q4_K / Q6_K (expertos en `experts.bin`), Q2_K opcional (expertos en `experts.lo.bin`), core en el GGUF Q4_K_M de origen |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Formato propietario `zorlo-pack-1` (`manifest.json`, `core.gguf`, `experts.bin`, `experts.lo.bin`); derivado de GGUF Q4_K_M |

## Arquitectura y entrenamiento
El modelo subyacente es Qwen3-30B-A3B, un transformer con capas de mezcla de expertos: 48 expertos por capa y 128 variantes segun el empaquetado descrito, de los que solo se activa una fraccion por token (unos 3.300 millones de parametros activos sobre 30.500 millones totales). Esta conversion no reentrena ni modifica los valores de los pesos del core ni de `experts.bin`: parte del GGUF oficial `Qwen3-30B-A3B-Q4_K_M.gguf` de Qwen (SHA-256 `0d003f6662faee786ed5da3e31b29c978de5ae5d275c8794c606a7f3c01aa8f5`) y lo reordena con `zorlo pack`, separando tensores no-expertos y agrupando las matrices gate/up/down de cada experto en un bloque alineado. `zorlo pack` verifica expertos aleatorios contra el origen tras escribir.

La unica modificacion real de pesos es `experts.lo.bin`: cada experto se desquantiza y recuantiza a Q2_K ponderado por una importance matrix calculada sobre unos 30.000 tokens de texto general y codigo. El motor Zorlo esta construido sobre llama.cpp/ggml (MIT) y aplica streaming de expertos desde SSD con una cache configurable (256 MB o 1,2 GB en las mediciones publicadas). No se documentan en la informacion disponible detalles sobre el dataset de preentrenamiento, RLHF/DPO ni innovaciones de atencion del modelo base.

## Capacidades
- Generacion de texto conversacional multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento y conocimiento general heredados de Qwen3-30B-A3B.
- Generacion de codigo, ya que la importance matrix de la recuantizacion incluye codigo ademas de texto general.
- Ejecucion en CPU sin GPU, con el modelo residente en SSD y carga selectiva de expertos.
- Modo `exact`: salida token a token identica al GGUF Q4_K_M original de Qwen (20 de 20 prompts de prueba identicos con cache de 1,2 GB).
- Modo `fast`: inferencia acelerada con expertos Q2_K para los que no estan en memoria, con un 94,7% de tokens coincidentes respecto al original.
- Compatibilidad con endpoints (`endpoints_compatible`) para integracion via API.
- Soporte de tool calling, agentes o modo thinking: no disponible en la informacion proporcionada.
- Capacidades multimodales o de audio: no disponibles.

## Casos de uso
- Inferencia local en portatiles sin GPU: un equipo con 8 GB de RAM y SSD NVMe puede ejecutar un MoE de 30B en modo `exact` a 2,98-3,47 tokens/s, suficiente para asistentes de escritura o resumenes por lotes no interactivos.
- Despliegue en entornos con restricciones de hardware: estaciones de trabajo Windows de oficina sin acelerador dedicado pueden servir un chatbot interno sin depender de la nube, manteniendo los datos en local.
- Prototipado y evaluacion de modelos grandes: investigadores pueden probar el comportamiento de Qwen3-30B-A3B en hardware modesto antes de escalar a infraestructura con GPU, con la garantia de que el modo `exact` reproduce el GGUF oficial.
- Generacion de codigo asistida en local: la inclusion de codigo en la importance matrix y la naturaleza del modelo base lo hacen util para autocompletado y explicacion de fragmentos en IDE, aceptando latencias de varios segundos por respuesta.
- Procesamiento por lotes de documentos: con contexto configurable (el ejemplo usa 12288 tokens) se pueden resumir o clasificar documentos largos en segundo plano, donde el throughput importa menos que el coste por token.
- Educacion y experimentacion con MoE: el formato separa explicitamente core y expertos, lo que facilita estudiar el enrutamiento y el impacto de la cuantizacion Q2_K frente a Q4_K en la calidad de salida.
- Servicio de API ligero en edge: el tag `endpoints_compatible` permite exponer el modelo como endpoint en un equipo de bajos recursos para integraciones internas de baja concurrencia.

## Benchmarks y rendimiento
Rendimiento medido por el autor en un portatil con Intel i5-1135G7 de 4 nucleos, 8 GB de RAM y SSD NVMe (Windows 11):

| Motor / modo | Tokens por segundo | Coincidencia con el original |
|---|---|---|
| llama.cpp, mismo GGUF, memory-mapped | 1,43 | referencia |
| Zorlo, `exact`, cache 256 MB | 2,98 | identico token a token |
| Zorlo, `exact`, cache 1,2 GB | 3,47 | 20 de 20 prompts identicos |
| Zorlo, `fast`, cache 256 MB | 5,47 | 94,7% de tokens coincidentes |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware
- RAM: 8 GB es suficiente segun el autor; el core (1,0 GB) permanece en memoria y los expertos se leen del disco.
- Almacenamiento: unos 18,6 GB para el paquete base (`core.gguf` + `experts.bin`); 9,5 GB adicionales si se descarga `experts.lo.bin` con `--lowbit` (total aproximado 28,1 GB, coherente con el tamano del repo).
- Disco: SSD NVMe recomendado; el rendimiento depende principalmente del disco y de la memoria libre.
- GPU: no necesaria; no se documenta soporte de aceleracion por GPU en la informacion disponible.
- Despliegue: motor Zorlo (Zorlo Desktop o CLI `zorlo pull` / `zorlo serve`), disponible en GitHub Releases y zorlo.stream. No se indica compatibilidad directa con vLLM, TGI, Ollama o llama.cpp para este formato empaquetado.
- Latencia y throughput: 2,98-5,47 tokens/s en el hardware de referencia, segun modo y cache.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en hardware de referencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-30b-a3b-zorlo | 30,5B totales / ~3,3B activos | No disponible (ejemplo con 12288) | 2,98-5,47 tok/s en i5-1135G7, 8 GB RAM, sin GPU | Apache 2.0 | Hugging Face (repo Zorlo) |
| Qwen3-30B-A3B (GGUF Q4_K_M) | 30,5B totales / ~3,3B activos | No disponible | 1,43 tok/s con llama.cpp memory-mapped en el mismo equipo | Apache 2.0 | Hugging Face (Qwen oficial) |
| Qwen3-30B-A3B (pesos originales) | 30,5B totales / ~3,3B activos | No disponible | Requiere GPU o RAM muy superior a 8 GB | Apache 2.0 | Hugging Face (Qwen oficial) |

La comparativa se limita al mismo modelo base en distintos formatos porque la informacion proporcionada no incluye datos de otros modelos comparables.

## Limitaciones y advertencias
- El rendimiento depende criticamente del disco y de la memoria libre; en HDD o con poca RAM el throughput puede degradarse por debajo de los valores publicados.
- El modo `fast` no es determinista respecto al original: un 5,3% de tokens difieren, lo que puede ser inaceptable en tareas que exigen reproducibilidad exacta.
- El formato `zorlo-pack-1` es propietario del motor Zorlo; no es directamente cargable por llama.cpp, vLLM, Ollama u otros runners sin conversion.
- El repo declara 1.541.093.376 parametros en safetensors, correspondientes solo a los tensores no-expertos empaquetados; no debe interpretarse como el tamano total del modelo.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; son los heredados de Qwen3-30B-A3B, cuyo model card original no se incluye aqui.
- Idiomas soportados no declarados en este repo; conviene consultar la ficha oficial de Qwen3-30B-A3B.
- Licencia Apache 2.0 permite uso comercial, pero el repo no esta afiliado ni respaldado por el equipo Qwen; la responsabilidad de validacion en produccion recae en el integrador.
- Proyecto con muy poca traccion (276 descargas, 0 likes) y un unico autor; no hay evidencia de validacion independiente de las mediciones de velocidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Haidershahi1/qwen3-30b-a3b-zorlo
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B
- GGUF oficial de Qwen: https://huggingface.co/Qwen/Qwen3-30B-A3B-GGUF
- Repositorio de Zorlo: https://github.com/shahihussainofficial1/zorlo
- Releases de Zorlo: https://github.com/shahihussainofficial1/zorlo/releases/latest
- Notas de diseno: https://github.com/shahihussainofficial1/zorlo/blob/main/docs/design.md
- Licencia de Zorlo: https://github.com/shahihussainofficial1/zorlo/blob/main/LICENSE
- Sitio web: https://zorlo.stream
- Informe tecnico: https://doi.org/10.5281/zenodo.24136832
- llama.cpp / ggml: https://github.com/ggml-org/llama.cpp
- GitHub del autor: https://github.com/shahihussainofficial1
- ORCID del autor: https://orcid.org/0009-0004-0940-9096
- LinkedIn del autor: https://www.linkedin.com/in/shahihussain/
