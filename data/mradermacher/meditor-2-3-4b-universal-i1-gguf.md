# mradermacher/Meditor-2-3.4B-Universal-i1-GGUF

## Resumen

Meditor-2-3.4B-Universal-i1-GGUF es una cuantizacion en formato GGUF del modelo base Yo-Purple/Meditor-2-3.4B-Universal, realizada por mradermacher, un creador conocido en Hugging Face por publicar versiones cuantizadas de modelos abiertos. El modelo original emplea la arquitectura qwen2_moe con un diseno de mezcla de expertos jerarquica (hierarchical MoE) y esta construido sobre la base de SmolLM2, segun las etiquetas de la model card. Cuenta con 3.511.666.688 parametros totales segun los pesos en safetensors.

La relevancia de esta ficha radica en que ofrece un modelo compacto (3,4B parametros) con arquitectura MoE y una ventana de contexto declarada de 500k tokens, ademas de capacidades orientadas a razonamiento y tool calling (etiqueta toolformer). El paquete i1-GGUF incluye un conjunto amplio de cuantizaciones con imatrix, desde IQ1_S (~0,9 GB) hasta Q6_K (~3,0 GB), lo que permite desplegarlo en hardware muy modesto o en configuraciones de mayor calidad.

Esta publicacion es unicamente la version cuantizada; el modelo original y su model card completa estan en el repositorio Yo-Purple/Meditor-2-3.4B-Universal. La informacion disponible sobre entrenamiento, datos y evaluaciones es limitada, por lo que varios apartados de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen2_moe con MoE jerarquica (segun etiquetas de la model card) |
| Parametros totales | 3.511.666.688 |
| Parametros activos | no disponible |
| Longitud de contexto | 500k tokens (declarado en etiquetas; no verificado en la informacion disponible) |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; incluye fichero imatrix |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base se etiqueta como qwen2_moe, lo que indica una arquitectura transformer con mezcla de expertos basada en la familia Qwen2. La model card anade las etiquetas moe, hierarchical-moe y hmoe, que sugieren una organizacion jerarquica de los expertos, aunque no se detalla en la informacion disponible como se implementa esa jerarquia ni cuantos expertos hay ni cuantos se activan por token. Tambien se etiqueta como smollm2, lo que apunta a que el modelo parte de la familia SmolLM2 de Hugging Face.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre innovaciones tecnicas concretas mas alla de las capacidades declaradas en las etiquetas (reasoning, toolformer, 500k-context). La cuantizacion i1 de mradermacher aplica pesos derivados de un fichero imatrix, un enfoque que suele mejorar la calidad respecto a cuantizaciones estaticas del mismo tamano, especialmente en los niveles bajos (IQ2, IQ3).

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta conversational y el idioma declarado.
- Razonamiento: la model card incluye la etiqueta reasoning, aunque no se especifica el modo ni el formato.
- Tool calling / function calling: la etiqueta toolformer sugiere soporte para uso de herramientas, sin detalle de formato en la informacion disponible.
- Contexto largo: se declara una ventana de 500k tokens en las etiquetas, no verificada.
- Arquitectura MoE: activacion dispersa de expertos, lo que en teoria reduce el coste de inferencia respecto a un modelo denso de parametros equivalentes (parametros activos no disponibles).
- Compatibilidad con LM Studio y endpoints compatibles, segun las etiquetas lmstudio y endpoints_compatible.
- Capacidades multimodales (vision, audio): no disponibles.
- Capacidades multilingues: limitadas al ingles segun la informacion disponible.

## Casos de uso

- Asistentes conversacionales en ingles sobre hardware modesto: con cuantizaciones i1-Q4_K_M (~2,2 GB) el modelo puede ejecutarse en GPUs de consumo o incluso en CPU, adecuado para prototipos de chatbot local.
- Procesamiento de documentos largos: la ventana declarada de 500k tokens permitiria, en teoria, resumir o consultar grandes volumenes de texto en una sola pasada, aunque conviene validar el comportamiento real en contextos extremos.
- Pipelines de agentes con tool calling: la etiqueta toolformer sugiere integracion en flujos donde el modelo invoca funciones externas, como consultas a APIs o calculo, para tareas de automatizacion.
- Razonamiento multi-paso en entornos con recursos limitados: util para tareas de clasificacion, extraccion y respuesta a preguntas donde no se justifica un modelo de mayor tamano.
- Despliegue en edge o entornos air-gapped: al distribuirse en GGUF y con licencia Apache 2.0, puede empaquetarse en aplicaciones de escritorio o dispositivos sin conexion mediante llama.cpp u Ollama.
- Evaluacion e investigacion de arquitecturas MoE compactas: sirve como banco de pruebas para estudiar el equilibrio entre cuantizacion agresiva (IQ1, IQ2) y calidad en un modelo MoE de 3,4B parametros.
- Integracion en LM Studio: la etiqueta lmstudio indica compatibilidad con ese entorno, lo que facilita pruebas rapidas por parte de desarrolladores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB con i1-IQ1_S (0,9 GB de pesos) hasta unos 3,5-4 GB con i1-Q6_K (3,0 GB de pesos), mas overhead de contexto KV.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM para cuantizaciones medias; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobredimensionadas para este tamano y permitirian contextos mas largos o mayor throughput.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna con 4-8 GB de VRAM; las cuantizaciones IQ1/IQ2 podrian ejecutarse incluso en iGPU o CPU.
- Opciones de despliegue: llama.cpp, LM Studio (etiqueta explicita), Ollama (via GGUF), y servidores compatibles con endpoints (etiqueta endpoints_compatible). vLLM y TGI requeririan el modelo base en safetensors, no el GGUF.
- Latencia y throughput estimados: no disponibles. Al ser un modelo MoE de 3,4B parametros, se espera una latencia baja en GPU de consumo, pero no hay mediciones publicadas en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Meditor-2-3.4B-Universal (i1-GGUF) | 3,51B | 500k (declarado) | Apache 2.0 | GGUF | MoE jerarquica, etiquetas reasoning y toolformer |
| SmolLM2 (familia base) | no disponible en la informacion | no disponible | no disponible | safetensors/GGUF | Base declarada del modelo; comparacion directa no disponible |
| Qwen2-MoE (familia arquitectonica) | no disponible en la informacion | no disponible | no disponible | safetensors/GGUF | Arquitectura de referencia; comparacion directa no disponible |

No se dispone de datos de rendimiento ni de parametros activos de los modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no es posible.

## Limitaciones y advertencias

- Idioma: solo se declara ingles; el rendimiento en castellano no esta garantizado ni evaluado.
- Contexto de 500k tokens: el dato procede unicamente de etiquetas de la model card y no se ha verificado; el comportamiento real en contextos muy largos puede degradarse.
- Parametros activos y numero de expertos no disponibles: dificulta estimar con precision el coste real de inferencia.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; no se han publicado evaluaciones de fidelidad.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible.
- Cuantizaciones muy agresivas (IQ1, IQ2, Q2_K): el propio autor advierte de calidad baja o "para desesperados"; no recomendables para produccion.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar la licencia del modelo base original y de sus dependencias (SmolLM2, Qwen2) por si imponen condiciones adicionales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validacion comunitaria practicamente inexistentes.
- Fecha de creacion futura (2026-11-07) en los metadatos: conviene verificar la procedencia y vigencia del repositorio.

## Enlaces

- Repositorio Hugging Face (cuantizacion i1-GGUF): https://huggingface.co/mradermacher/Meditor-2-3.4B-Universal-i1-GGUF
- Modelo base: https://huggingface.co/Yo-Purple/Meditor-2-3.4B-Universal
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Meditor-2-3.4B-Universal-GGUF
- Pagina de descargas del autor para este modelo: https://hf.tst.eu/model#Meditor-2-3.4B-Universal-i1-GGUF
- Perfil del autor: https://huggingface.co/mradermacher
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
