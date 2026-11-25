# mradermacher/Tenet-4B-Qwen3-Unslop-v2-i1-GGUF

## Resumen

Tenet-4B-Qwen3-Unslop-v2-i1-GGUF es una cuantizacion GGUF del modelo Tenet-4B-Qwen3-Unslop-v2, un fine-tune de la familia Qwen3 con 4.022.468.096 parametros (aproximadamente 4B) publicado por mr-andrey-isachenko y cuantizado por mradermacher. El modelo se presenta como un derivado "unslop" (destilado de sesgos y estilos de rechazo) y "abliterated" (con las direcciones de rechazo eliminadas), orientado a tareas de razonamiento, agente, tool-use y codigo. La licencia es Apache 2.0.

La relevancia de esta ficha reside en que el repositorio ofrece un conjunto amplio de cuantizaciones con imatrix (i1) en formato GGUF, lo que permite ejecutar un modelo de 4B en hardware de consumo con margen para contexto largo. El autor documenta explicitamente los tipos de cuantizacion disponibles, desde IQ1_S (1,2 GB) hasta Q6_K (3,4 GB), lo que facilita la eleccion segun VRAM y tolerancia a la perdida de calidad.

No obstante, la model card del repositorio es esencialmente una ficha de cuantizacion: no incluye especificaciones de contexto, composicion del dataset, resultados de benchmarks ni detalles del proceso de entrenamiento del modelo base. Esta ficha recoge solo lo verificable en la informacion proporcionada y marca como "no disponible" todo aquello que el autor no documenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3; detalles no disponibles) |
| Parametros totales | 4.022.468.096 (4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (mas fichero imatrix) |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Qwen3 de 4B (segun la nomenclatura del nombre y los tags `qwen3`, `reasoning`, `thinking`). Los tags indican que se ha aplicado GRPO (optimizacion de politica con gradiente de recompensa) y que el modelo es "abliterated", es decir, se han eliminado las direcciones de activacion asociadas al rechazo. Tambien aparece el tag `fp8`, lo que sugiere que el modelo base se publico o se entreno en formato FP8, y `vllm`/`openrouter`, que apuntan a un despliegue orientado a inferencia de alto rendimiento.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, la mezcla de datos de razonamiento/codigo ni los detalles del proceso de RLHF/DPO/GRPO. La model card del repositorio de cuantizacion no documenta estos aspectos del modelo base. La innovacion tecnica documentada en este repositorio es el uso de cuantizacion con imatrix (i1), que ajusta la cuantizacion a la importancia de los pesos y suele ofrecer mejor calidad que las cuantizaciones estaticas del mismo tamano.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento con modo "thinking" (tag `reasoning`, `thinking`).
- Generacion de codigo (tag `coding`).
- Tool calling / function calling y uso en flujos agenticos (tags `agentic`, `tool-use`).
- Comportamiento "uncensored"/"abliterated": menor tendencia a rechazar peticiones (tag `abliterated`, `uncensored`).
- Capacidad multilingue limitada al ingles segun la model card (`language: en`).
- Compatible con endpoints y despliegue en vLLM (tags `endpoints_compatible`, `vllm`).

## Casos de uso

- Asistente de codigo en local: el modelo, al ser de 4B y estar disponible en cuantizaciones de 2,5-3 GB (Q4_K_M, Q5_K_M), puede ejecutarse en una GPU de consumo de 8-12 GB y usarse como autocompletado o generador de funciones en un IDE, con tool calling para invocar linters o tests.
- Agente de automatizacion con tool use: los tags `agentic` y `tool-use` indican soporte para function calling, lo que permite integrarlo en pipelines que consulten APIs, ejecuten comandos o encadenen pasos multi-step con un orquestador externo.
- Razonamiento en modo thinking para tareas de analisis: el tag `reasoning` sugiere que el modelo puede generar cadenas de razonamiento antes de responder, util para clasificacion de documentos, extraccion de datos o resolucion de problemas paso a paso.
- Prototipado rapido en entornos sin GPU dedicada: las cuantizaciones IQ1/IQ2 (1,2-1,6 GB) permiten ejecutar el modelo en CPU con llama.cpp u Ollama, adecuado para demos y pruebas de concepto.
- Chat conversacional sin restricciones de contenido para investigacion: al ser "abliterated"/"uncensored", puede usarse en estudios sobre sesgos, seguridad y comportamiento de modelos, siempre con las advertencias eticas correspondientes.
- Despliegue en vLLM para inferencia concurrente: el tag `vllm` y `endpoints_compatible` indican que el modelo base puede servirse con vLLM para atender peticiones en produccion con throughput alto, usando las cuantizaciones GGUF o los pesos safetensors del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): IQ1_S ~1,2 GB; IQ2_M ~1,6 GB; IQ3_M ~2,1 GB; IQ4_XS ~2,4 GB; Q4_K_M ~2,6 GB; Q5_K_M ~3,0 GB; Q6_K ~3,4 GB.
- GPU recomendadas: cualquier GPU con 6-8 GB de VRAM puede ejecutar las cuantizaciones Q4/Q5 con contexto moderado; para contexto largo o mayor throughput se recomienda RTX 3090/4090 (24 GB) o A100/H100.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y superiores, usando cuantizaciones Q4_K_M o Q5_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio (GGUF); vLLM y TGI para los pesos safetensors del modelo base; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Tenet-4B-Qwen3-Unslop-v2-i1-GGUF | 4B | no disponible | Apache 2.0 | GGUF (i1) | Fine-tune Qwen3 abliterated, orientado a agentes y codigo |
| Qwen3-4B (original) | 4B | no disponible en esta ficha | Apache 2.0 | safetensors/GGUF | Base del fine-tune; sin modificaciones de rechazo |
| Alternativas de 4B de la familia Llama/Mistral | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- La model card no documenta el contexto maximo, por lo que no se puede garantizar soporte de ventanas largas en produccion.
- El modelo es "abliterated"/"uncensored": se ha eliminado el comportamiento de rechazo, lo que aumenta el riesgo de generar contenido danino, sesgado o inexacto. No es adecuado para aplicaciones orientadas al usuario sin filtros adicionales.
- Riesgo de alucinacion inherente a modelos de 4B; la cuantizacion agresiva (IQ1/IQ2) degrada aun mas la calidad.
- Idioma limitado al ingles segun la model card; el rendimiento en castellano no esta documentado.
- Las cuantizaciones de muy baja calidad (IQ1_S, IQ2_XXS) se marcan en la propia card como "for the desperate" o "very low quality"; no se recomiendan para produccion.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento pueden tener restricciones adicionales no documentadas en esta ficha.
- No hay benchmarks publicados que permitan validar el rendimiento frente a alternativas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Tenet-4B-Qwen3-Unslop-v2-i1-GGUF
- Modelo base: https://huggingface.co/mr-andrey-isachenko/Tenet-4B-Qwen3-Unslop-v2
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Tenet-4B-Qwen3-Unslop-v2-GGUF
- Pagina de resumen del autor: https://hf.tst.eu/model#Tenet-4B-Qwen3-Unslop-v2-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e394
