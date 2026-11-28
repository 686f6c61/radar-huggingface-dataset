# mradermacher/WellLogLLM-3.7B-GGUF

## Resumen

WellLogLLM-3.7B-GGUF es la distribucion en formato GGUF del modelo WellLogLLM-3.7B, desarrollado originalmente por el usuario sambal y cuantizado por mradermacher. Se trata de un modelo de lenguaje especializado en petrofisica y registros de pozo (well logs), orientado al dominio de la industria petrolera y la interpretacion de datos de subsuelo. El modelo base ha sido ajustado mediante GRPO (Group Relative Policy Optimization), una tecnica de aprendizaje por refuerzo, lo que sugiere un entrenamiento orientado a tareas de razonamiento dentro del dominio.

La relevancia de esta ficha radica en que se trata de una cuantizacion estatica de un modelo de nicho: un LLM de aproximadamente 5.058 millones de parametros reales (etiquetado comercialmente como "3.7B") que puede ejecutarse en hardware de consumo gracias a la disponibilidad de cuantizaciones desde Q2_K hasta f16. El repositorio ocupa 46 GB e incluye once variantes GGUF, lo que facilita el despliegue local en entornos con recursos limitados.

La licencia Apache 2.0 permite uso comercial sin restricciones significativas, lo que resulta poco habitual en modelos de dominio especializado. El modelo esta pensado para consultas conversacionales en ingles sobre interpretacion de registros de pozo, petrofisica y dominios relacionados (etiquetas k2-horizon, petrophysics, welllogllm).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada del modelo base sambal/WellLogLLM-3.7B); detalles de atencion no disponibles |
| Parametros totales | 5.058.255.360 (segun safetensors); etiquetado comercial como 3.7B |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de que se trata de un transformer y que fue ajustado con GRPO (Group Relative Policy Optimization), una variante de aprendizaje por refuerzo con retroalimentacion que optimiza grupos de respuestas relativas entre si. El ajuste GRPO sugiere un entrenamiento posterior orientado a mejorar el razonamiento en tareas del dominio petrofisico, aunque no se especifican los datos de entrenamiento, el numero de tokens utilizados, la composicion del dataset ni si hubo fases adicionales de RLHF o DPO.

No se dispone de informacion sobre innovaciones tecnicas especificas como decodificacion especulativa, attention linear o arquitecturas hibridas. La cuantizacion fue realizada por mradermacher mediante cuantizacion estatica (quantize_version 2, output_tensor_quantised 1), sin que se hayan generado cuantizaciones ponderadas o con imatrix para este modelo. El repositorio incluye las variantes GGUF generadas a partir del modelo base en safetensors.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a consultas sobre petrofisica y registros de pozo.
- Razonamiento de dominio especializado: interpretacion de datos de well logs y conceptos de la industria (etiquetas welllogllm, k2-horizon, petrophysics).
- Ajuste mediante GRPO, lo que indica capacidad de razonamiento multi-paso en tareas del dominio.
- Soporte de conversacion multi-turno (tag conversational).
- Compatibilidad con endpoints (tag endpoints_compatible), lo que permite su integracion en servicios de inferencia.
- Capacidades multilingues limitadas al ingles segun la model card.
- No se documentan capacidades de vision, audio, tool calling ni function calling en la informacion disponible.

## Casos de uso

- Interpretacion de registros de pozo: el modelo puede responder consultas tecnicas sobre curvas de registro (gamma ray, resistividad, porosidad, densidad) y ayudar a interpretar respuestas petrofisicas en ingles, aprovechando su ajuste especifico de dominio.
- Asistencia a ingenieros de petrofisica: consultas conversacionales sobre calculo de saturacion de agua, porosidad efectiva o identificacion de horizontes (k2-horizon), con la ventaja de ejecutarse localmente gracias a las cuantizaciones GGUF.
- Formacion tecnica interna: despliegue en portatiles o estaciones de trabajo con GPU de consumo para entrenar a personal en conceptos de interpretacion de registros, usando la variante Q4_K_M (3,3 GB) por su equilibrio velocidad/calidad.
- Prototipado de asistentes de dominio en industria energetica: integracion en pipelines internos mediante endpoints compatibles, con la licencia Apache 2.0 permitiendo uso comercial sin friccion legal.
- Analisis documental asistido: resumen y explicacion de informes de pozo en ingles, apoyandose en la ventana de contexto (no documentada) y en el ajuste GRPO para respuestas razonadas.
- Despliegue en entornos con recursos limitados: la variante Q2_K (2,2 GB) permite ejecutar el modelo en hardware modesto para pruebas de concepto o demos, aunque con menor calidad.
- Investigacion en LLM de dominio cientifico: servir como caso de estudio de ajuste GRPO aplicado a un dominio tecnico vertical, replicable en otros campos de la geociencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion): Q2_K ~2,2 GB; Q4_K_M ~3,3 GB; Q8_0 ~5,5 GB; f16 ~10,2 GB. Anadir overhead de contexto y runtime (tipicamente 1-2 GB adicionales).
- GPU recomendadas: para f16, una GPU con 16 GB o mas (RTX 4080/4090, A100, H100). Para Q4_K_M, cualquier GPU consumer con 6-8 GB (RTX 3060, RTX 4060, RTX 2070) es suficiente.
- Cabe en GPU de consumo: si, en todas las variantes hasta Q8_0 con 8 GB de VRAM; la variante f16 requiere 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, y servidores compatibles con GGUF. El modelo base en safetensors puede servirse con vLLM o TGI, aunque la informacion no confirma compatibilidad explicita.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| WellLogLLM-3.7B (este) | 5.058 M reales | no disponible | Apache 2.0 | GGUF, safetensors | Especializado en petrofisica, ajuste GRPO, solo ingles |
| Modelos generalistas de ~3-4B (p. ej. familia Llama 3.2 3B, Qwen2.5 3B) | ~3-4B | 8K-128K segun modelo | licencias variables | GGUF, safetensors | Proposito general, multilingues, sin especializacion de dominio |
| Modelos cientificos de dominio (p. ej. adaptaciones de Mistral/Llama a geociencia) | variable | variable | variable | variable | Especializacion similar pero ecosistema de cuantizaciones menor |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- El modelo esta entrenado unicamente en ingles; su uso en castellano u otros idiomas producira respuestas de baja calidad.
- Dominio muy restringido (petrofisica y well logs): fuera de ese ambito, el rendimiento sera previsiblemente inferior al de modelos generalistas del mismo tamano.
- Riesgo de alucinacion en datos tecnicos: al ser un modelo de lenguaje, puede generar valores numericos, interpretaciones o referencias petrofisicas plausibles pero incorrectas; requiere validacion por expertos antes de uso en decisiones operativas.
- No se documentan sesgos especificos, pero al entrenarse sobre datos de una industria concreta puede heredar sesgos de las fuentes (terminologia, supuestos geologicos regionales).
- Longitud de contexto no documentada: limita la planificacion de casos de uso con documentos largos.
- No se confirma soporte de tool calling ni function calling; no asumir su disponibilidad en produccion.
- Las cuantizaciones Q2_K y Q3_K degradan la calidad; para uso serio se recomienda Q4_K_M o superior.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base y los datos de entrenamiento originales no estan documentados en detalle, lo que puede afectar a la trazabilidad para auditorias.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: ecosistema de validacion practicamente inexistente, sin evidencia de uso en produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/WellLogLLM-3.7B-GGUF
- Modelo base: https://huggingface.co/sambal/WellLogLLM-3.7B
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#WellLogLLM-3.7B-GGUF
- FAQ y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
