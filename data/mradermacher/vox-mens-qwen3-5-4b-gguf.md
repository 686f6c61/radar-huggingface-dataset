# mradermacher/vox-mens-qwen3.5-4b-GGUF

## Resumen

vox-mens-qwen3.5-4b-GGUF es la version cuantizada en formato GGUF del modelo brbrainerd/vox-mens-qwen3.5-4b, un modelo de lenguaje de aproximadamente 4.200 millones de parametros construido sobre la arquitectura Qwen3.5. La cuantizacion la ha realizado mradermacher, un autor habitual de conversiones GGUF en Hugging Face, y se distribuye bajo licencia Apache 2.0. El modelo base incorpora tecnicas como gated delta networks y fue afinado mediante QLoRA y rsLoRA, segun las etiquetas de la model card.

Este repositorio no contiene el modelo original, sino un conjunto de ficheros GGUF con distintos niveles de cuantizacion (desde Q2_K de 2,0 GB hasta f16 de 8,5 GB), pensados para ejecucion local con llama.cpp y herramientas compatibles. El modelo esta orientado a generacion de texto conversacional y de codigo, y su nombre y etiquetas sugieren un ajuste especifico para el dominio "vox-mens" y el benchmark "spoke-vox-lang".

Es relevante para desarrolladores que quieran desplegar un modelo de ~4B en hardware de consumo o en entornos con recursos limitados, ya que las cuantizaciones Q4_K_M (2,8 GB) permiten inferencia en GPUs modestas. No obstante, la informacion publica sobre el modelo base es muy escasa: no se detallan datos de entrenamiento, contexto ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen3.5 con gated delta networks (segun etiquetas) |
| Parametros totales | 4.205.751.296 (dato de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (transformers como libreria declarada; el repo contiene solo GGUF) |

## Arquitectura y entrenamiento

La model card del repositorio cuantizado no describe la arquitectura en detalle; solo incluye etiquetas que apuntan a Qwen3.5 y a gated delta networks, lo que sugiere una variante de transformer con mecanismos de atencion lineal/estado recurrente. El modelo base brbrainerd/vox-mens-qwen3.5-4b fue, segun las etiquetas, afinado con QLoRA y rsLoRA, tecnicas de ajuste eficiente en parametros. Tambien aparecen las etiquetas "spoke-vox-lang" y "gate-passed", que parecen referirse a un benchmark y a un criterio de validacion internos del autor.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO. Los datasets referenciados (brbrainerd/vox-mens-eval-vox-lang-bench y brbrainerd/vox-mens-data-vox-lang) son los unicos indicios sobre los datos utilizados, pero no se detalla su contenido. La cuantizacion realizada por mradermacher es estatica (quantize_version 2), sin cuantizaciones ponderadas por imatrix disponibles en el momento de la publicacion.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational".
- Generacion de codigo, segun la etiqueta "code".
- Compatibilidad con text-generation-inference y vLLM, ademas de llama.cpp por el formato GGUF.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo se declara ingles ("en").
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Asistente conversacional local en ingles: el modelo puede gestionar dialogos multi-turno en una maquina de consumo gracias a su tamano de ~4B y a las cuantizaciones Q4_K_M de 2,8 GB, adecuadas para GPUs con 6-8 GB de VRAM.
- Generacion de codigo en entornos con recursos limitados: al estar etiquetado como "code", puede integrarse en editores o scripts de automatizacion que requieran un modelo pequeno ejecutado localmente sin conexion.
- Prototipado rapido de aplicaciones de IA: el formato GGUF permite cargar el modelo con llama.cpp u Ollama en minutos, lo que facilita experimentar antes de escalar a modelos mayores.
- Despliegue en dispositivos edge o portatiles: las cuantizaciones Q2_K y Q3_K_S (2,0-2,2 GB) permiten ejecucion en CPU o GPUs integradas, utiles para demos y pruebas offline.
- Evaluacion de pipelines de cuantizacion: el repositorio ofrece 12 variantes de cuantizacion, lo que permite comparar calidad y rendimiento entre Q2_K, Q4_K_M, Q8_0 y f16 en un mismo modelo.
- Filtrado y clasificacion de texto en ingles: un modelo de 4B puede emplearse para tareas de extraccion o clasificacion simple en lotes, siempre que se validen los resultados por el riesgo de alucinacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~2,0 GB
  - Q3_K_S: ~2,2 GB
  - Q4_K_M: ~2,8 GB
  - Q5_K_M: ~3,2 GB
  - Q6_K: ~3,6 GB
  - Q8_0: ~4,6 GB
  - f16: ~8,5 GB
- GPU recomendadas: no disponibles de forma oficial; por tamano, una RTX 3060 de 12 GB o superior cubre todas las cuantizaciones con margen para contexto.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas para Q4_K_M; las variantes Q2_K y Q3_K_S pueden ejecutarse en CPU.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference y vLLM (segun las etiquetas); el formato GGUF es compatible con llama.cpp y derivados.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| vox-mens-qwen3.5-4b-GGUF | ~4,2B | no disponible | Apache 2.0 | GGUF | Cuantizaciones de 2,0 a 8,5 GB; solo ingles |
| Qwen2.5-3B (referencia de la familia Qwen) | ~3,1B | 32K (tipico en la familia) | Apache 2.0 | safetensors, GGUF | Modelo ampliamente documentado con benchmarks publicos |
| Llama 3.2 3B | ~3,2B | 128K | Llama 3.2 Community License | safetensors, GGUF | Multilingue, con restricciones de licencia para uso comercial a gran escala |
| Phi-3.5-mini | ~3,8B | 128K | MIT | safetensors, GGUF | Multilingue, con benchmarks publicados |

La comparativa se basa en caracteristicas generales de modelos de tamano similar; no hay datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo solo en ingles segun la model card; no se declara soporte para castellano ni otros idiomas.
- No hay informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad.
- Riesgo de alucinacion inherente a modelos de ~4B, especialmente en tareas de codigo y razonamiento complejo.
- Longitud de contexto no documentada, lo que dificulta planificar aplicaciones con ventanas largas.
- La licencia Apache 2.0 permite uso comercial, pero se desconoce si el modelo base impone restricciones adicionales no reflejadas en la model card.
- Las cuantizaciones Q2_K y Q3_K_S pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para produccion.
- No hay cuantizaciones ponderadas por imatrix disponibles, lo que puede afectar a la calidad de las variantes de baja precision.
- El repositorio no incluye los pesos originales en safetensors, solo GGUF; para fine-tuning adicional habria que acudir al modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/vox-mens-qwen3.5-4b-GGUF
- Modelo base: https://huggingface.co/brbrainerd/vox-mens-qwen3.5-4b
- Pagina de descargas del autor: https://hf.tst.eu/model#vox-mens-qwen3.5-4b-GGUF
- Dataset de evaluacion: https://huggingface.co/datasets/brbrainerd/vox-mens-eval-vox-lang-bench
- Dataset de entrenamiento: https://huggingface.co/datasets/brbrainerd/vox-mens-data-vox-lang
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Grafico de perplejidad por cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
