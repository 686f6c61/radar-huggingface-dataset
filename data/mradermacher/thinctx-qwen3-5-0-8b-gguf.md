# mradermacher/ThinCtx-Qwen3.5-0.8B-GGUF

## Resumen

ThinCtx-Qwen3.5-0.8B-GGUF es una coleccion de cuantizaciones estaticas en formato GGUF del modelo base moravianai/ThinCtx-Qwen3.5-0.8B, publicada por el usuario mradermacher. El modelo base es un derivado de la familia Qwen3.5 orientado a contextos largos (tag "long-context" y nombre "ThinCtx"), con un total de 752.393.024 parametros segun los pesos en safetensors. Esta version GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles.

La relevancia de esta publicacion radica en que ofrece el modelo en 12 variantes de cuantizacion (desde Q2_K de 0,5 GB hasta f16 de 1,6 GB), lo que facilita su despliegue en entornos con VRAM limitada, portatiles o CPU. El modelo declara soporte multilingue con enfasis en ingles, checo y aleman, y esta pensado para tareas conversacionales y de contexto extendido.

La licencia es PolyForm Small Business 1.0.0, lo que restringe el uso comercial gratuito a pequenas empresas, uso personal, investigacion no comercial y educacion; las organizaciones grandes en produccion deben solicitar una licencia comercial a moravian.ai. El modelo base incluye un mecanismo de acceso restringido (gated) que exige aceptar condiciones antes de la descarga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Qwen3.5, transformer) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (etiquetado como "long-context", sin cifra publicada) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | multilingual, en, cs, de |
| Licencia | polyform-small-business-1.0.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Por el nombre y la etiqueta "qwen3.5", se trata de un derivado de la familia Qwen3.5, presumiblemente un transformer decoder-only, pero no se confirma en la model card. Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o post-entrenamiento especifico.

La unica innovacion tecnica explicitamente mencionada es la orientacion a contexto largo ("long-context" y el prefijo "ThinCtx"), aunque no se especifica la longitud maxima de contexto ni la tecnica empleada (atencion lineal, RoPE escalado, ventanas deslizantes, etc.). El repo incluye tanto cuantizaciones estaticas como cuantizaciones ponderadas/imatrix en un repositorio separado (i1-GGUF), lo que sugiere que el autor aplico el pipeline habitual de mradermacher con imatrix para las variantes de mayor calidad.

## Capacidades

- Generacion de texto conversacional en varios idiomas (multilingual, con soporte declarado para ingles, checo y aleman).
- Procesamiento de contextos largos, segun la etiqueta "long-context" del modelo base; la longitud exacta no esta publicada.
- Uso en pipelines de transformers y en runtimes compatibles con GGUF (llama.cpp y derivados).
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que facilita su integracion en servicios de inferencia.
- Capacidad de razonamiento y codigo: no confirmada explicitamente en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Asistentes conversacionales en checo y aleman: el modelo declara soporte para cs y de, lo que lo hace adecuado para chatbots de atencion al cliente en esos mercados, desplegables en CPU o GPU de gama baja gracias a las cuantizaciones de 0,5-0,9 GB.
- Procesamiento de documentos largos en local: la orientacion a contexto extendido permite resumir o extraer informacion de contratos, informes o transcripciones en equipos sin GPU dedicada, usando la variante Q4_K_M (0,6 GB).
- Prototipado rapido en portatiles: con Q2_K o Q3_K_S (0,5 GB) se puede ejecutar el modelo en un portatil modesto para pruebas de concepto y evaluacion de calidad antes de escalar a un modelo mayor.
- Investigacion academica no comercial: la licencia permite uso en investigacion y educacion, por lo que sirve para experimentos de evaluacion de modelos pequenos en contextos multilingues.
- Evaluacion comparativa de cuantizaciones: el repo ofrece 12 variantes, lo que permite medir el impacto de la cuantizacion en perplejidad y calidad para un modelo de 752 M de parametros.
- Despliegue en entornos con restricciones de memoria: la variante f16 (1,6 GB) o Q8_0 (0,9 GB) permiten obtener la maxima calidad del modelo en GPUs de 2-4 GB de VRAM o en CPU con RAM suficiente.
- Filtrado y clasificacion de texto en pipelines de datos: un modelo pequeno y rapido como este puede etiquetar o clasificar grandes volumenes de texto en lote, siempre que la licencia lo permita para el caso de uso concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-0,6 GB para Q2_K/Q3_K_S, 0,6-0,7 GB para Q4_K_M/Q5_K_M, 0,9 GB para Q8_0 y 1,6 GB para f16 (tamanos de archivo; la VRAM real depende del contexto y del runtime).
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de VRAM puede ejecutar las variantes cuantizadas; una RTX 3060, RTX 4060 o superior permite f16 con contexto amplio. No se dispone de datos especificos para A100 o H100, aunque el modelo es lo bastante pequeno para ejecutarse en cualquier GPU profesional.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna e incluso en iGPU con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama (mediante importacion de GGUF), LM Studio, y servidores compatibles con la API de OpenAI a traves de llama.cpp. El tag "endpoints_compatible" sugiere compatibilidad con endpoints de inferencia.
- Latencia y throughput estimados: no disponibles. Por el tamano (752 M de parametros), se espera una generacion muy rapida en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ThinCtx-Qwen3.5-0.8B (este) | 752 M | no disponible (long-context) | PolyForm Small Business 1.0.0 | GGUF, safetensors | Multilingue en/cs/de |
| Qwen2.5-0.5B | ~494 M | 32 K (segun familia Qwen2.5) | Apache 2.0 | safetensors, GGUF | Alternativa abierta de tamano similar |
| Qwen2.5-1.5B | ~1,5 B | 32 K (segun familia Qwen2.5) | Apache 2.0 | safetensors, GGUF | Mayor capacidad, mas VRAM |
| SmolLM2-1.7B | ~1,7 B | 8 K (segun model card de SmolLM2) | Apache 2.0 | safetensors, GGUF | Enfocado a eficiencia en dispositivo |

La comparativa con modelos de la familia Qwen y SmolLM se basa en datos publicos de esas familias; no se dispone de benchmarks del modelo evaluado para comparar rendimiento de forma cuantitativa. La principal diferencia es la licencia restrictiva para uso comercial a gran escala y el enfoque en contexto largo y multilingue (en/cs/de).

## Limitaciones y advertencias

- Licencia restrictiva: PolyForm Small Business 1.0.0 limita el uso comercial gratuito a pequenas empresas; las organizaciones grandes en produccion necesitan una licencia comercial de moravian.ai.
- El modelo base esta sujeto a un mecanismo de acceso restringido (gated) que exige aceptar condiciones y proporcionar datos de contacto.
- Con 752 M de parametros, la capacidad de razonamiento, matematicas y codigo es limitada en comparacion con modelos de mayor tamano; no se han publicado benchmarks que lo confirmen.
- Riesgo de alucinacion inherente a los modelos de lenguaje pequenos, especialmente en tareas factuales y de contexto largo.
- La longitud de contexto real no esta publicada, por lo que no se puede garantizar el rendimiento en ventanas muy extensas.
- El soporte multilingue declarado se limita a en, cs y de; el rendimiento en castellano no esta verificado.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; el autor recomienda Q4_K_S, Q4_K_M o superiores para uso practico.
- No se dispone de informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ThinCtx-Qwen3.5-0.8B-GGUF
- Modelo base: https://huggingface.co/moravianai/ThinCtx-Qwen3.5-0.8B
- Cuantizaciones imatrix/ponderadas: https://huggingface.co/mradermacher/ThinCtx-Qwen3.5-0.8B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#ThinCtx-Qwen3.5-0.8B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Contacto para licencia comercial: info@moravian.ai
