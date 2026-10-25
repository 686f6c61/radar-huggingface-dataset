# mradermacher/Nizam-LLM-7B-i1-GGUF

## Resumen

Nizam-LLM-7B-i1-GGUF es la versión cuantizada en formato GGUF del modelo muhammaduxair/Nizam-LLM-7B, un modelo de 7.000.559.616 parámetros (aproximadamente 7B) especializado en derecho laboral de Arabia Saudí y orientado a generación en árabe con soporte de recuperación aumentada (RAG) y citación de fuentes. La cuantización la ha realizado mradermacher, un perfil conocido por publicar conversiones GGUF con calibración imatrix de modelos de terceros; no es el autor del modelo original.

El interés práctico de esta ficha es que permite ejecutar un modelo jurídico en árabe sobre hardware de consumo o en servidores sin GPU, algo imposible con los pesos completos. El repositorio incluye 25 cuantizaciones i1 (imatrix) que van desde 1,8 GB (IQ1_S) hasta 5,8 GB (Q6_K), además del fichero imatrix para generar cuantizaciones propias. La licencia Apache-2.0 facilita el uso comercial, aunque el modelo es de dominio muy específico y no cuenta con benchmarks publicados.

No se dispone de información sobre arquitectura, longitud de contexto ni composición del dataset de entrenamiento en la documentación proporcionada; la model card del repositorio de cuantización solo declara el modelo base, el idioma (árabe) y un conjunto de etiquetas temáticas (legal, saudi-arabia, labor-law, rag, citation). Cualquier dato ausente se marca explícitamente como no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (la model card no especifica la arquitectura del modelo base) |
| Parámetros totales | 7.000.559.616 (~7B) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL, Q2_K_S, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K; más fichero imatrix de calibración |
| Idiomas soportados | Árabe (ar); no se documentan otros idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No hay información publicada en la documentación disponible sobre la arquitectura del modelo base (no se confirma si es un transformer denso, MoE o híbrido), ni sobre el número de tokens de entrenamiento, la composición del dataset, las fases de ajuste (SFT, RLHF, DPO) o el proceso de alineación. Los metadatos únicamente indican la temática (derecho laboral saudí), el idioma (árabe) y el uso previsto de RAG y citación.

Lo que sí está documentado es el proceso de cuantización: mradermacher ha generado cuantizaciones i1 con calibración imatrix (parámetros `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`), partiendo del repositorio en safetensors de `muhammaduxair/Nizam-LLM-7B`. Las cuantizaciones i1 con imatrix suelen ofrecer mejor relación calidad/tamaño que las estáticas equivalentes en modelos pequeños, especialmente en los niveles de 2 a 4 bits.

## Capacidades

- Generación de texto en árabe orientada a consultas jurídicas, según la temática declarada en los metadatos del modelo.
- Respuesta sobre normativa laboral de Arabia Saudí (etiquetas `saudi-arabia`, `labor-law`).
- Soporte declarado para flujos de RAG (recuperación de fragmentos normativos y respuesta condicionada al contexto recuperado).
- Citación de fuentes (`citation`): el modelo está etiquetado para referenciar disposiciones o artículos, aunque no se documenta el formato exacto de citación.
- Conversación multi-turno: el repositorio incluye la etiqueta `conversational`.
- Compatibilidad con endpoints de inferencia (etiqueta `endpoints_compatible`).
- Tool calling / function calling: no disponible (no documentado).
- Razonamiento multi-paso y modo "thinking": no disponible (no documentado).
- Visión, audio u otras modalidades: no disponible (modelo etiquetado únicamente como texto y árabe).

## Casos de uso

- Asistente de consultas laborales para empleados y departamentos de RRHH: desplegado con llama.cpp u Ollama, responde en árabe sobre vacaciones, indemnizaciones o periodos de prueba según la normativa saudí, con la ventaja de poder ejecutarse on-premise y no enviar datos de empleados a terceros.
- Pipeline RAG sobre corpus normativo: el modelo se usa como generador final tras recuperar artículos de la ley laboral; su etiqueta `rag` y su tamaño (7B) permiten integrarlo con bases vectoriales sin requerir GPUs de datacenter.
- Extracción y verificación de citas legales: en un flujo de revisión documental, el modelo localiza y reproduce referencias a artículos, que después se validan contra el texto oficial; útil como primer filtro en departamentos legales.
- Redacción de borradores de contratos y memorandos en árabe: generación de plantillas y cláusulas habituales que un jurista revisa y ajusta, reduciendo el tiempo de redacción inicial.
- Triaje de consultas entrantes: clasificación y respuesta preliminar de tickets de soporte legal en árabe, derivando los casos complejos a un especialista humano.
- Despliegue en entornos con hardware limitado o air-gapped: las cuantizaciones IQ2/IQ3 (2,1-3,4 GB) permiten ejecución en CPU y en equipos sin GPU, lo que facilita su uso en oficinas sin infraestructura de aceleradores.
- Base para fine-tuning posterior en dominios jurídicos adyacentes (por ejemplo, derecho migratorio o fiscal saudí), aprovechando la licencia Apache-2.0 y el tamaño manejable del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio de cuantización no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas del dominio jurídico árabe, y tampoco se aportan comparaciones con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: el peso de los ficheros GGUF va de 1,8 GB (i1-IQ1_S) a 5,8 GB (i1-Q6_K). Hay que sumar la caché KV, cuyo tamaño depende de la longitud de contexto, que no está documentada.
- Configuraciones recomendadas por cuantización:
  - i1-Q4_K_M (4,4 GB): GPU de 8 GB (RTX 3060 Ti, RTX 4060, RTX 3070) con contexto moderado; también válido en CPU con 8-16 GB de RAM.
  - i1-Q5_K_M (5,1 GB) e i1-Q6_K (5,8 GB): GPU de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080) para mantener contexto amplio.
  - i1-IQ2_XXS a i1-IQ3_M (2,1-3,4 GB): ejecutables en CPU y en GPUs de 4-6 GB, con pérdida de calidad apreciable en los niveles más bajos.
- Cabe en GPU de consumo: sí, en todos los niveles; las cuantizaciones de 4 bits son las más equilibradas para 8 GB de VRAM.
- GPU de datacenter (A100, H100): no son necesarias para inferencia; solo tendrían sentido para servir muchas réplicas concurrentes o para reentrenamiento.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, llama-cpp-python, text-generation-webui y KoboldCpp. vLLM y TGI no están orientados a GGUF; para usarlos habría que partir del modelo base en safetensors.
- Latencia y throughput: no disponibles; el autor no publica mediciones para este repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/Nizam-LLM-7B-i1-GGUF (este) | 7.000.559.616 | No disponible | GGUF i1 (25 cuantizaciones) | Apache-2.0 | Cuantización imatrix; repo de 80,2 GB; 0 descargas y 1 like en el momento de la consulta |
| muhammaduxair/Nizam-LLM-7B (base) | 7.000.559.616 | No disponible | Safetensors | Apache-2.0 | Pesos originales en precisión completa; requiere GPU para inferencia cómoda |
| mradermacher/Nizam-LLM-7B-GGUF | 7.000.559.616 | No disponible | GGUF estático | Apache-2.0 | Mismo modelo con cuantizaciones estáticas (sin imatrix), alternativa a este repositorio |
| Otros modelos jurídicos árabes de ~7B | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la información proporcionada para establecer una comparación |

## Limitaciones y advertencias

- Idioma único: el modelo está etiquetado exclusivamente para árabe (`ar`); no hay evidencia de competencia en castellano ni en inglés.
- Dominio muy restringido: entrenado para derecho laboral saudí; su uso fuera de ese ámbito producirá respuestas poco fiables.
- Riesgo de alucinación jurídica: como cualquier LLM de 7B, puede inventar números de artículo, plazos o cuantías de indemnización. Las citas deben verificarse siempre contra el texto legal oficial; no debe usarse como asesoramiento jurídico autónomo.
- Sin benchmarks: no existen métricas publicadas de exactitud en tareas legales, lo que impide estimar su fiabilidad frente a alternativas.
- Validación inexistente en producción: el repositorio registra 0 descargas y 1 like en el momento de la consulta, por lo que no hay evidencia de uso real ni informes de terceros.
- Degradación por cuantización: los niveles IQ1 e IQ2 (1,8-2,8 GB) están señalados por el propio autor como "for the desperate" o de calidad baja; para uso real conviene IQ4_XS o superior.
- Contexto desconocido: al no documentarse la longitud de contexto, el diseño de pipelines RAG debe validarse empíricamente antes de asumir ventanas largas.
- Licencia: Apache-2.0 permite uso comercial y modificaciones con atribución; aun así, conviene revisar los términos del modelo base y las obligaciones sobre datos personales si se procesan expedientes de empleados.
- Fechas de publicación: el repositorio figura creado y actualizado en octubre de 2026; verificar que la versión consultada es la vigente.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/mradermacher/Nizam-LLM-7B-i1-GGUF
- Modelo base: https://huggingface.co/muhammaduxair/Nizam-LLM-7B
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Nizam-LLM-7B-GGUF
- Fichero imatrix para generar cuantizaciones propias: https://huggingface.co/mradermacher/Nizam-LLM-7B-i1-GGUF/resolve/main/Nizam-LLM-7B.imatrix.gguf
- Página de overview y descargas del autor: https://hf.tst.eu/model#Nizam-LLM-7B-i1-GGUF
- Guía de uso de GGUF citada en la model card: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Empresa que soporta la infraestructura del cuantizador: https://www.nethype.de/
