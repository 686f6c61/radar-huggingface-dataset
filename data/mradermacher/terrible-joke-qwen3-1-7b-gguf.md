# mradermacher/terrible-joke-qwen3-1.7b-GGUF

## Resumen

Terrible-joke-qwen3-1.7b-GGUF es un repositorio de cuantizaciones estáticas en formato GGUF del modelo locriani/terrible-joke-qwen3-1.7b, realizadas por mradermacher, un cuantizador muy activo de la comunidad de Hugging Face. El modelo base es un ajuste (fine-tuning) de Qwen3 1.7B, el modelo compacto de Alibaba, especializado en generación de humor y chistes, con los pesos del LoRA ya fusionados en el modelo base (lora-merged). Se trata de un modelo conversacional orientado a seguir instrucciones en inglés dentro del nicho concreto del humor.

Su relevancia es principalmente de nicho: sirve como ejemplo de especialización de un modelo pequeño (1,72 mil millones de parámetros) en una tarea creativa concreta, y su tamaño reducido lo hace ideal para ejecutarse en local en hardware modesto, incluso sin GPU dedicada. El repositorio ofrece cuantizaciones desde Q2_K (0,9 GB) hasta f16 (3,5 GB), lo que permite ajustar el equilibrio entre calidad y consumo de memoria según el dispositivo disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3), ajuste con LoRA fusionado |
| Parametros totales | 1.720.574.976 (~1,72 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base original esta en safetensors) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3 1.7B, un transformer decoder-only compacto de la familia Qwen3 de Alibaba. Sobre esa base, locriani aplico un ajuste fino mediante LoRA (Low-Rank Adaptation) cuyos pesos fueron posteriormente fusionados con el modelo base, de ahi la etiqueta "lora-merged". El resultado conserva la arquitectura original de Qwen3 pero con el comportamiento especializado en generacion de humor y chistes.

No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens utilizados, ni sobre el uso de tecnicas de alineacion como RLHF o DPO en la informacion disponible. Tampoco consta si el modelo conserva el modo de razonamiento (thinking mode) caracteristico de la familia Qwen3. Respecto a las cuantizaciones, mradermacher proporciona cuants estaticos en formato GGUF convertidos desde los pesos en safetensors (convert_type: hf); en el momento de publicacion del repositorio no habia cuantizaciones weighted/imatrix disponibles.

## Capacidades

- Generacion de texto conversacional orientada a humor: el modelo esta especializado en crear chistes y contenido comico en ingles.
- Seguimiento de instrucciones (instruction-following): heredado del ajuste sobre Qwen3, que es un modelo instruct.
- Generacion de codigo, razonamiento matematico y otras capacidades generales: no disponibles de forma fiable; el ajuste de especializacion probablemente degrada las capacidades generales del modelo base.
- Tool calling / function calling: no disponible, no consta soporte.
- Capacidades de agente y razonamiento multi-paso: no disponibles, no constan en la documentacion.
- Multilingue: no; el modelo esta etiquetado solo para ingles.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Generacion de chistes bajo demanda en aplicaciones de ocio: un chatbot ligero que produce humor en ingles, ejecutable incluso en un movil o portatil sin GPU gracias a las cuants de 0,9-1,2 GB.
- Integracion de humor en asistentes conversacionales: puede usarse como modulo especializado que aporta chistes a un bot de charla, descargando esa tarea de un modelo principal mas grande.
- Generacion de contenido para redes sociales: creacion de copys breves y chistes para cuentas de humor en ingles, con ciclos de generacion muy rapidos por su tamano.
- Prototipado y experimentacion con fine-tuning de nicho: sirve como ejemplo practico de como un LoRA fusionado sobre Qwen3 1.7B especializa un modelo pequeno en una tarea creativa.
- Pruebas de despliegue en hardware minimo: las cuants Q2_K y Q3_K permiten probar pipelines de inferencia local (llama.cpp, Ollama) en equipos muy limitados.
- Educacion y demostraciones: util para talleres o articulos sobre cuantizacion GGUF, comparando calidad entre niveles Q2_K y f16 en un modelo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: desde ~1 GB para Q2_K (0,9 GB de archivo) hasta ~4 GB para f16 (3,5 GB); anadiendo el contexto, cualquier GPU con 4 GB de VRAM o incluso solo CPU/RAM es suficiente.
- GPU recomendadas: no requiere GPU dedicada; funciona en cualquier GPU moderna. Para maximo rendimiento, una RTX 3060/4060 o superior es mas que suficiente dado el tamano del modelo.
- Consumer GPUs: cabe sobradamente en praticamente cualquier GPU consumer; incluso las cuants medias (Q4_K_M, 1,2 GB) caben en GPUs de 4 GB y en la memoria unificada de portatiles.
- CPU: totalmente viable; con 4-8 GB de RAM se pueden ejecutar todas las cuants incluida f16.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, GPT4All, KoboldCpp, y cualquier runtime compatible con GGUF. vLLM y TGI no consumen GGUF directamente; para ellos habria que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles; por su tamano (1,7 B de parametros) se espera generacion muy rapida, del orden de decenas de tokens/segundo incluso en CPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Especializacion |
|---|---|---|---|---|
| terrible-joke-qwen3-1.7b (este) | 1,72 B | GGUF (Q2_K a f16) | Apache 2.0 | Humor / chistes en ingles |
| Qwen3 1.7B (base oficial) | 1,7 B | Safetensors y GGUF comunitarios | Apache 2.0 | Uso general, instruct, multilingue |
| Llama 3.2 1B (Meta) | 1,24 B | Safetensors y GGUF comunitarios | Licencia Llama 3.2 | Uso general, multilingue |
| SmolLM2 1.7B (HuggingFace) | 1,7 B | Safetensors y GGUF comunitarios | Apache 2.0 | Uso general, ingles |

Frente a sus alternativas, este modelo no destaca por capacidad general sino por especializacion: rinde mejor generando humor en ingles que los modelos base, pero a costa de capacidades generales. Su ventaja practica es la licencia Apache 2.0 (a diferencia de Llama 3.2) y el tamano minimo de las cuants disponibles.

## Limitaciones y advertencias

- Idioma: el modelo esta etiquetado solo para ingles; su rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea pobre.
- Nicho estrecho: al estar especializado en humor, es esperable una degradacion notable en razonamiento, codigo, matematicas y otras tareas generales respecto al Qwen3 1.7B original.
- Alucinaciones: como todo modelo de lenguaje de 1,7 B, puede generar contenido falso o incoherente; el humor generado puede ser repetitivo o de calidad variable.
- Sesgos: no se ha documentado ningun analisis de sesgos; puede heredar los sesgos del modelo base Qwen3 y de los datos del ajuste, no disponibles.
- Contexto: la longitud de contexto no esta documentada en este repositorio; consultar la ficha del modelo base Qwen3 1.7B (32.768 tokens segun la documentacion oficial de Qwen3, dato no confirmado en esta model card).
- Cuantizacion: las cuants mas agresivas (Q2_K, Q3_K_S/M) implican perdida de calidad notable, especialmente relevante en un modelo ya pequeno y especializado; se recomiendan Q4_K_M o superiores.
- Licencia: Apache 2.0 permite uso comercial sin restricciones destacables, aunque el nombre "terrible-joke" sugiere un tono de proyecto experimental sin garantias de calidad para produccion.
- No hay cuantizaciones weighted/imatrix disponibles en el momento de publicacion segun el autor.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/terrible-joke-qwen3-1.7b-GGUF
- Modelo base (LoRA fusionado): https://huggingface.co/locriani/terrible-joke-qwen3-1.7b
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#terrible-joke-qwen3-1.7b-GGUF
- Guia de uso de GGUF (referenciada en la model card): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas sobre calidad de cuants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
