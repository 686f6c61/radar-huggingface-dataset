# mradermacher/EryriLabs-cymraeg-4B-i1-GGUF

## Resumen

EryriLabs-cymraeg-4B-i1-GGUF es una cuantizacion en formato GGUF del modelo EryriLabs-cymraeg-4B, publicada por el usuario mradermacher. El modelo base, desarrollado por EryriLabs, es un modelo conversacional especializado en cymraeg (gales), con 8.134.102.314 parametros totales segun los pesos en safetensors del modelo original. Esta version i1-GGUF aplica cuantizacion con pesos ponderados mediante matriz de importancia (imatrix) para preservar la calidad en rangos bajos de bits.

El interes de esta ficha radica en que ofrece un modelo afinado para una lengua minoritaria europea (el gales) en un formato listo para inferencia local con llama.cpp y derivados. Esto lo hace relevante para proyectos de preservacion linguistica, traduccion y asistentes conversacionales en gales que necesiten ejecutarse en hardware modesto.

La informacion publicada es escasa: no se documentan licencia, idiomas oficiales, pipeline ni resultados de benchmarks. Los datos tecnicos disponibles provienen del repositorio del cuantizador y de los metadatos del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (deducido del modelo base; no documentado explicitamente) |
| Parametros totales | 8.134.102.314 (segun safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M |
| Idiomas soportados | no disponible (el nombre sugiere cymraeg/gales, no confirmado en la model card) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base EryriLabs-cymraeg-4B mas alla de su naturaleza transformer y su orientacion conversacional (tag `conversational`). El nombre sugiere un modelo de aproximadamente 4B parametros, aunque el recuento real de safetensors indica 8.134.102.314 parametros, lo que podria deberse a un modelo de mayor tamano o a un desajuste de nomenclatura.

El proceso de cuantizacion documentado en la model card indica el uso de `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, con cuantizaciones ponderadas mediante imatrix (matriz de importancia) para mejorar la fidelidad en bits bajos. No se detallan datos de entrenamiento, numero de tokens, composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional (tag `conversational` en el repositorio).
- Inferencia local en formato GGUF compatible con llama.cpp y sus derivados.
- Cuantizacion con imatrix para preservar calidad en niveles bajos de bits.
- Compatible con endpoints (tag `endpoints_compatible`).
- Capacidades multilingues: no confirmadas; el nombre del modelo apunta a gales (cymraeg).
- Tool calling, agentes, vision, audio o thinking mode: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional en gales: el modelo puede gestionar dialogos multi-turno en cymraeg, adecuado para aplicaciones de atencion al usuario en esa lengua, aunque la ventana de contexto no esta documentada.
- Preservacion linguistica y educacion: generacion de contenido y ejercicios en gales para plataformas de aprendizaje, aprovechando el ajuste especifico del modelo base.
- Traduccion asistida gales-castellano/ingles: uso como componente de generacion en pipelines de traduccion, con verificacion humana dada la falta de benchmarks publicados.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M e IQ4_XS permiten ejecutar el modelo en GPU consumer con VRAM limitada (ver seccion de hardware).
- Prototipado de chatbots locales: integracion en llama.cpp u Ollama para entornos sin conectividad o con requisitos de privacidad.
- Investigacion en lenguas minoritarias: evaluacion comparativa de modelos afinados frente a modelos multilingues genericos en tareas de cymraeg.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (8.134 millones de parametros): aproximadamente 2,5-3 GB en Q2_K/IQ2, 4-5 GB en Q4_K_M/IQ4_XS, 6-7 GB en Q6_K, y 16 GB o mas en FP16 (no cuantizado).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 para cuantizaciones altas; A100/H100 para despliegues de mayor concurrencia.
- Cabe en GPU consumer: si, en modelos con 8 GB o mas de VRAM usando cuantizaciones Q4 o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; el tag `endpoints_compatible` sugiere soporte en plataformas de endpoints.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| EryriLabs-cymraeg-4B-i1-GGUF | 8.134 M (safetensors) | no disponible | no disponible | GGUF | Especializado en gales (segun nombre) |
| Modelos multilingues genericos (p. ej. Llama 3.1 8B, Qwen2.5 7B) | 7-8 B | 128K (tipico) | licencias abiertas conocidas | safetensors, GGUF | Cobertura multilingue amplia, no especializados en gales |
| Modelos especializados en lenguas minoritarias (varios) | variable | variable | variable | variable | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial; verificar en el repositorio del modelo base antes de produccion.
- Idiomas no documentados oficialmente: el nombre sugiere gales, pero no hay confirmacion en la model card.
- Sin benchmarks publicados: el rendimiento real frente a alternativas es desconocido.
- Riesgo de alucinacion inherente a modelos generativos; mayor en lenguas de bajos recursos.
- Posible desajuste entre el nombre (4B) y el recuento real de parametros (8.134 M), lo que puede afectar a las estimaciones de hardware.
- Contexto no documentado: planificar integraciones con ventanas conservadoras.
- Cuantizaciones IQ1/IQ2 pueden degradar notablemente la calidad; preferir Q4_K_M o superiores para produccion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/EryriLabs-cymraeg-4B-i1-GGUF
- Modelo base: https://huggingface.co/EryriLabs/EryriLabs-cymraeg-4B
