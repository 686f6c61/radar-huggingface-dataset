# mradermacher/FinchAI-Rune2-Luna-GGUF

## Resumen

FinchAI-Rune2-Luna-GGUF es la coleccion de cuantizaciones GGUF del modelo whcl412/FinchAI-Rune2-Luna, publicada por mradermacher. Se trata de un modelo de 1.728.801.600 parametros (aproximadamente 1,7 mil millones) derivado de la familia LFM3 de LiquidAI, segun indica la etiqueta `lfm3` de la model card, y esta orientado a tool calling, function calling y flujos de agente. Los idiomas declarados son chino (zh) e ingles (en).

El modelo base no incluye en la informacion disponible datos sobre arquitectura interna, longitud de contexto, composicion del dataset de entrenamiento ni proceso de alineacion. La ficha se centra, por tanto, en lo que si esta documentado: el proceso de cuantizacion estatica, los formatos disponibles, el tamano de cada fichero y las implicaciones practicas de despliegue.

La relevancia de esta publicacion es de caracter operativo: permite ejecutar un modelo de 1,7 B orientado a agentes en hardware modesto, con cuantizaciones que van desde 0,9 GB (Q2_K) hasta 3,6 GB (f16), lo que facilita su integracion en entornos locales y en pipelines con llama.cpp u Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetada como `lfm3`, familia LFM3 de LiquidAI) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | zh, en |
| Licencia | lfm-open-license-1.0 (etiquetada como `other`; enlace a la licencia de LFM3-1.7B) |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base whcl412/FinchAI-Rune2-Luna. La etiqueta `lfm3` y el enlace de licencia apuntan a que deriva de la familia LFM3 de LiquidAI, pero la informacion proporcionada no confirma la arquitectura exacta (transformer, MoE, hibrida u otra), el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineacion.

Lo que si esta documentado es el proceso de cuantizacion: mradermacher ha generado cuantizaciones estaticas (sin imatrix ni pesos ponderados, que el autor indica que no estan disponibles en el momento de la publicacion) a partir del modelo base en formato Hugging Face. El proceso usa `quantize_version: 2` y `output_tensor_quantised: 1`, con conversion de tipo `hf`. El repositorio ocupa 15,9 GB en total, suma de todos los ficheros GGUF publicados.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational` del repositorio.
- Tool calling y function calling, declarados explicitamente en las etiquetas del modelo.
- Orientacion a flujos de agente, segun la etiqueta `agent`.
- Soporte multilingue limitado a chino e ingles.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere integracion con infraestructura de inferencia estandar.
- No se documentan capacidades de vision, audio, modo thinking explicito ni decodificacion especulativa.

## Casos de uso

- Agentes locales de automatizacion: el modelo puede orquestar llamadas a herramientas en entornos de escritorio o servidores pequeños, y su tamano de 1,7 B permite ejecutarlo junto al resto del stack sin competir por VRAM.
- Asistentes de atencion al cliente en chino e ingles: adecuado para conversaciones multi-turno en estos dos idiomas, con la ventaja de que la cuantizacion Q4_K_M ocupa solo 1,2 GB y puede servirse en CPU.
- Integracion en pipelines de CI/CD para tareas de function calling: la etiqueta `endpoints_compatible` facilita exponerlo como endpoint compatible con APIs de chat y usarlo para validar esquemas de llamadas a funciones.
- Prototipado rapido de aplicaciones de agente: al ser un modelo pequeño, permite iterar sobre prompts y definiciones de herramientas con latencia baja en hardware consumer.
- Despliegue en dispositivos con recursos limitados: la cuantizacion Q2_K (0,9 GB) permite ejecucion en entornos con menos de 2 GB de RAM/VRAM, util para demos o entornos embebidos.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye doce variantes, lo que permite medir el impacto de la cuantizacion en la calidad de las llamadas a herramientas en un mismo modelo.
- Traduccion y generacion bilingue zh-en en aplicaciones de soporte interno, limitada a estos dos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia segun cuantizacion: Q2_K 0,9 GB; Q3_K_S 1,0 GB; Q3_K_M 1,0 GB; Q3_K_L 1,1 GB; IQ4_XS 1,1 GB; Q4_K_S 1,2 GB; Q4_K_M 1,2 GB; Q5_K_S 1,3 GB; Q5_K_M 1,4 GB; Q6_K 1,5 GB; Q8_0 1,9 GB; f16 3,6 GB.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, cualquier GPU consumer con 4 GB o mas de VRAM puede alojar las cuantizaciones Q4 a Q8, y las variantes Q2/Q3 caben en GPUs integradas o en CPU.
- Cabe en GPU consumer: si, en la practica totalidad de GPUs consumer actuales, incluidas las de gama baja, al menos en cuantizaciones Q4_K_M o inferiores.
- Opciones de despliegue: llama.cpp y Ollama son las rutas naturales para GGUF; el autor remite a los README de TheBloke para el uso de ficheros GGUF y a su pagina de resumen de descargas. vLLM y TGI no estan documentados para este repositorio en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| FinchAI-Rune2-Luna-GGUF | 1,7 B | no disponible | lfm-open-license-1.0 | GGUF (12 cuantizaciones) | Orientado a tool calling y agentes; zh/en |
| Modelo base whcl412/FinchAI-Rune2-Luna | 1,7 B | no disponible | lfm-open-license-1.0 | safetensors | Origen de las cuantizaciones |
| Otros modelos de ~1,7 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de informacion suficiente para comparar rendimiento con alternativas de la misma categoria; los datos de benchmarks y de modelos comparables no estan publicados en la informacion disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al ser un modelo derivado de LFM3, hereda los sesgos del modelo base, que no se detallan.
- Riesgo de alucinacion: no cuantificado; como modelo de 1,7 B, la fiabilidad en tareas de razonamiento complejo es limitada en comparacion con modelos de mayor tamano.
- Limitaciones de idioma: solo se declaran chino e ingles; no hay soporte documentado para castellano ni otros idiomas.
- Restricciones de licencia: la licencia lfm-open-license-1.0 puede imponer condiciones adicionales al uso comercial; es necesario revisar el texto completo en el enlace indicado antes de desplegar en produccion.
- Cuantizaciones de baja calidad: el autor advierte que Q3_K_M es de calidad inferior y que las cuantizaciones IQ suelen ser preferibles a las no IQ de tamano similar; Q2_K y Q3 reducen la fidelidad en tool calling.
- Ausencia de cuantizaciones ponderadas: no hay quants con imatrix disponibles en el momento de la publicacion, lo que puede afectar a la calidad en comparacion con cuantizaciones ponderadas de otros repositorios.
- Contexto y arquitectura no documentados: sin estos datos no es posible garantizar el comportamiento en conversaciones de contexto largo ni estimar el coste computacional por token.
- Fecha de creacion futura (2026-11-08): conviene verificar la vigencia y el estado del repositorio antes de adoptarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/FinchAI-Rune2-Luna-GGUF
- Modelo base: https://huggingface.co/whcl412/FinchAI-Rune2-Luna
- Pagina de resumen de descargas del autor: https://hf.tst.eu/model#FinchAI-Rune2-Luna-GGUF
- Licencia LFM3-1.7B: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Perfil del autor: https://huggingface.co/mradermacher/models
