# mradermacher/JiRackUltra_14b-i1-GGUF

## Resumen

JiRackUltra_14b-i1-GGUF es la versión cuantizada en formato GGUF del modelo CMSManhattan/JiRackUltra_14b, un transformer de 14.770.033.664 parámetros (aproximadamente 14,8 mil millones) entrenado con pesos ternarios (1.58 bits, esquema BitNet). El trabajo de cuantización lo firma mradermacher, que publica una batería completa de cuantizaciones de tipo i1 (imatrix) orientadas a inferencia en CPU y en GPUs con poca VRAM. El modelo base está etiquetado como "NVIDIA Inception Program Member" y declara soporte para 13 idiomas, incluyendo castellano.

La relevancia de esta ficha radica en dos frentes. Por un lado, el modelo base emplea una representación ternaria de pesos que reduce drásticamente los requisitos de memoria frente a un transformer de 14B en FP16, lo que permite ejecutarlo en hardware modesto. Por otro lado, la model card asocia el modelo a casos de uso de enrutamiento web, tool calling, robótica y UI web, lo que sugiere un entrenamiento orientado a agentes y funciones estructuradas más que a chat genérico.

No obstante, la información publicada es escasa: no se documentan arquitectura detallada, longitud de contexto, número de tokens de entrenamiento ni resultados de benchmarks. Esta ficha refleja únicamente lo que consta en la información disponible y marca explícitamente como "no disponible" todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con pesos ternarios (BitNet, 1.58 bits); detalles de capas y atención no disponibles |
| Parametros totales | 14.770.033.664 (~14,8 B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K; también se publican cuantizaciones estáticas en el repo JiRackUltra_14b-GGUF |
| Idiomas soportados | en, zh, ja, ko, fr, es, pt, de, it, ru, ar, vi, th (13 idiomas) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones i1); el modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

El modelo base se describe con las etiquetas "ternary", "bitnet" y "1.58bit", lo que indica que sus pesos se han entrenado o convertido a valores ternarios (-1, 0, +1), una técnica popularizada por BitNet que reduce el coste de memoria y cómputo. La model card no detalla el número de capas, dimensiones ocultas, mecanismo de atención ni si emplea alguna variante de atención lineal o decodificación especulativa. Tampoco se documenta el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF, DPO o ajuste por instrucciones.

Lo único verificable sobre el proceso de entrenamiento es la lista de etiquetas del autor, que apunta a un modelo afinado para enrutamiento web ("web-ui", "routing"), llamadas a herramientas ("tool-call") y robótica ("robotics"), además de una mención a "deepseek" que podría referirse a la familia de modelos que sirvió de base o inspiración, aunque no se confirma. La cuantización i1 con imatrix la realiza mradermacher a partir del modelo base, generando ficheros GGUF de entre 3,7 GB (IQ1_S) y 12,2 GB (Q6_K).

## Capacidades

- Generación de texto conversacional en 13 idiomas, incluido el castellano.
- Soporte declarado de tool calling / function calling, según la etiqueta "tool-call".
- Capacidades de enrutamiento web y automatización de interfaces ("web-ui", "routing").
- Orientación a robótica, según la etiqueta "robotics".
- Inferencia eficiente en CPU y en entornos de baja memoria gracias a los pesos ternarios y a las cuantizaciones GGUF.
- Compatibilidad con endpoints ("endpoints_compatible"), lo que facilita su despliegue tras una API compatible con OpenAI.
- No se documentan capacidades de visión, audio, thinking mode ni agentes multi-paso más allá de lo que sugieren las etiquetas.

## Casos de uso

- Asistente conversacional en CPU: con la cuantización i1-Q4_K_M (9,1 GB) o i1-IQ4_XS (8,2 GB) el modelo puede ejecutarse en un servidor sin GPU dedicada, útil para prototipos y entornos de desarrollo con presupuesto limitado.
- Enrutamiento de peticiones web: la etiqueta "routing" sugiere su uso como clasificador o enrutador de consultas dentro de una arquitectura de agentes, decidiendo qué herramienta o endpoint debe atender cada solicitud.
- Automatización de interfaces web: para tareas de rellenado de formularios, navegación guiada o extracción de datos de páginas, apoyándose en la etiqueta "web-ui" y en el soporte de tool calling.
- Integración en pipelines de tool calling: el modelo puede invocarse desde frameworks de agentes que esperan salidas estructuradas en JSON para ejecutar funciones externas, siempre que se valide el esquema de salida.
- Despliegue en robótica de bajo consumo: la combinación de pesos ternarios y cuantización GGUF permite ejecutar el modelo en hardware embebido o en un companion computer, aunque no se publican latencias ni pruebas reales en este dominio.
- Servicio multilingüe ligero: con soporte para 13 idiomas puede emplearse en tareas de traducción, resumen o atención al cliente en entornos donde no se dispone de GPUs de gran capacidad.
- Experimentación e investigación: como ejemplo reproducible de cuantización i1 sobre un modelo ternario, útil para estudiar el impacto de la cuantización extrema (IQ1, IQ2) en la calidad de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada según cuantización: IQ1_S ~3,7 GB; IQ2_M ~5,5 GB; IQ3_M ~7,0 GB; IQ4_XS ~8,2 GB; Q4_K_M ~9,1 GB; Q5_K_M ~10,6 GB; Q6_K ~12,2 GB. Estas cifras corresponden al tamaño de los ficheros y deben incrementarse con el espacio para el contexto KV.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, una RTX 3060 de 12 GB o superior podría alojar cuantizaciones IQ4/Q4_K_M, y una RTX 4090 (24 GB) permitiría Q6_K con contexto amplio.
- Cabe en GPU de consumo: sí, en modelos con 8-12 GB de VRAM usando cuantizaciones IQ3/IQ4; también en CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; el modelo base puede servirse con transformers. No se confirma soporte de vLLM o TGI para esta variante cuantizada.
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| JiRackUltra_14b-i1-GGUF | ~14,8 B (ternario) | No disponible | MIT | GGUF i1 | Orientado a tool calling, routing y robótica |
| JiRackUltra_14b (base) | ~14,8 B | No disponible | MIT | Safetensors/transformers | Modelo original sin cuantizar |
| BitNet b1.58 (referencia) | ~3 B y ~3,9 B en el paper original | No disponible | MIT (código) | Varía | Arquitectura ternaria de referencia; no es un modelo comparable 1:1 |
| Modelos densos de ~14 B en FP16 | ~14 B | 4k-128k según modelo | Varía | Safetensors, GGUF | Mayor huella de memoria; sin datos de rendimiento comparables en esta ficha |

La comparación cuantitativa con alternativas no es posible porque no se han publicado benchmarks del modelo. La comparativa se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad en MMLU, HumanEval, GSM8K ni tareas multilingües, por lo que no se recomienda su uso en producción sin una evaluación propia.
- Riesgo de alucinación: inherente a los modelos generativos; la falta de documentación sobre el dataset de entrenamiento impide estimar su magnitud.
- Cuantizaciones extremas (IQ1, IQ2): el propio autor las etiqueta como "for the desperate" o "very low quality"; degradan notablemente la calidad y no deberían usarse salvo como último recurso.
- Contexto desconocido: al no publicarse la longitud de contexto, no se puede garantizar el comportamiento en conversaciones largas o documentos extensos.
- Idiomas: aunque se declaran 13 idiomas, no se especifica el nivel de competencia por idioma; el castellano figura en la lista pero sin métricas.
- Licencia MIT: permite uso comercial y modificación, pero conviene conservar el aviso de copyright y verificar las obligaciones del modelo base.
- Sesgos: no documentados; al no conocerse la composición del dataset, no es posible evaluar sesgos de género, raza o idioma.
- Etiquetas de dominio ("robotics", "web-ui", "routing") sin validación pública: deben tratarse como indicios, no como garantías de rendimiento en esos dominios.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/mradermacher/JiRackUltra_14b-i1-GGUF
- Modelo base: https://huggingface.co/CMSManhattan/JiRackUltra_14b
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/JiRackUltra_14b-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#JiRackUltra_14b-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
