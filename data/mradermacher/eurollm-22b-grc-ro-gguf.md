# mradermacher/EuroLLM-22B-grc-ro-GGUF

## Resumen

EuroLLM-22B-grc-ro es una adaptación mediante LoRA del modelo base EuroLLM-22B, especializada en traducción entre griego antiguo (grc, incluyendo griego koiné y textos patrísticos) y rumano (ro). El modelo original EuroLLM-22B forma parte de la familia EuroLLM, un proyecto europeo de modelos de lenguaje abiertos centrado en lenguas europeas. Esta variante concreta ha sido ajustada por el usuario icxcn y cuantizada a formato GGUF por mradermacher para facilitar su despliegue en entornos con recursos limitados.

La ficha corresponde específicamente al repositorio GGUF, que contiene una única cuantización estática Q4_K_S de aproximadamente 13,1 GB, derivada de los pesos originales en safetensors del modelo base (22.637.328.384 parámetros totales). El modelo está etiquetado como pipeline de traducción y soporta los idiomas grc y ro, con licencia Apache 2.0.

Su relevancia radica en el nicho: la traducción de griego antiguo y patrístico a una lengua europea moderna concreta es un caso de uso poco cubierto por los modelos generalistas. La disponibilidad en GGUF permite ejecutarlo con llama.cpp en hardware de consumo, lo que lo hace accesible para filólogos, historiadores y proyectos de humanidades digitales sin infraestructura de GPU de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base EuroLLM-22B; la model card no detalla la arquitectura interna) |
| Parametros totales | 22.637.328.384 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_S (estatica); la model card menciona tipos adicionales en comentarios (x-f16, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS) pero en el repositorio solo se lista Q4_K_S |
| Idiomas soportados | grc (griego antiguo, koiné, patrístico), ro (rumano) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo GGUF); el modelo base icxcn/EuroLLM-22B-grc-ro se distribuye presumiblemente en safetensors vía transformers |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la model card proporcionada. El modelo deriva de EuroLLM-22B, un transformer de 22.637 millones de parámetros, y ha sido adaptado mediante LoRA (según las etiquetas del repositorio: `lora`, `base_model:adapter:icxcn/EuroLLM-22B-grc-ro`) para la tarea específica de traducción grc-ro. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO.

La única innovación técnica documentada es el proceso de cuantización estática a Q4_K_S realizada por mradermacher, que reduce el modelo a 13,1 GB. La model card indica que no se han generado (por el momento) cuantizaciones ponderadas con imatrix, y que estas podrían solicitarse mediante una discusión en la comunidad.

## Capacidades

- Traducción bidireccional entre griego antiguo (incluyendo variantes koiné y patrística) y rumano.
- Procesamiento de textos griegos de registro histórico, religioso y literario.
- Generación de texto conversacional (etiqueta `conversational` en el repositorio).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Traducción de textos patrísticos al rumano: el modelo está etiquetado específicamente para griego patrístico, por lo que puede emplearse para verter homilías, tratados teológicos y comentarios bíblicos al rumano para publicaciones eclesiásticas o académicas.
- Edición de fuentes clásicas: investigadores en filología clásica pueden obtener traducciones de referencia rápida de pasajes del griego koiné al rumano, acelerando la comparación con traducciones existentes.
- Digitalización de fondos bibliográficos rumanos: proyectos de humanidades digitales pueden usar el modelo para generar versiones en rumano de corpus griegos antiguos alojados en bibliotecas digitales.
- Enseñanza del griego antiguo en contextos rumanohablantes: generación de glosas y traducciones de apoyo para materiales didácticos dirigidos a estudiantes rumanos.
- Preservación del patrimonio textual: traducción asistida de manuscritos y ediciones críticas griegas para su difusión en entornos culturales rumanos.
- Investigación comparada grc-ro: análisis de correspondencias léxicas y estilísticas entre el griego antiguo y el rumano mediante traducciones generadas y revisadas por expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 13,1 GB para la cuantización Q4_K_S (tamaño del archivo GGUF); se recomienda algo más de margen para el contexto y buffers de llama.cpp.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB), H100 (80 GB). Cabe en GPUs de consumo de 16 GB o más con Q4_K_S, aunque con contexto limitado.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) y modelos con 16 GB o más; en GPUs de 12 GB requeriría cuantizaciones menores no disponibles en este repositorio.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), Ollama (importando el GGUF), y servidores compatibles con GGUF; el modelo base en safetensors podría servirse con vLLM o TGI, pero no se documenta en este repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| EuroLLM-22B-grc-ro (este) | 22,6 B | no disponible | grc, ro | Apache 2.0 | GGUF, safetensors |
| EuroLLM-22B (base) | 22,6 B | no disponible | multilingue europeo | Apache 2.0 | safetensors |
| Modelos de traduccion genericos multilingues (p. ej. NLLB, M2M-100) | variable | variable | multilingue (no incluyen grc de forma fiable) | variable | safetensors, GGUF |

No se dispone de datos de rendimiento comparativo en la información proporcionada. La comparativa se limita a parámetros, licencia y disponibilidad de formatos.

## Limitaciones y advertencias

- Modelo de nicho: solo cubre grc y ro; no debe esperarse buen rendimiento en otros pares de idiomas.
- Riesgo de alucinación en textos antiguos: la traducción de griego patrístico y koiné puede producir paráfrasis plausibles pero inexactas; requiere revisión por especialistas.
- Sesgos potenciales derivados del corpus de entrenamiento del modelo base y del ajuste LoRA, no documentados en la información disponible.
- Longitud de contexto no especificada: no se puede garantizar el manejo de textos largos sin truncamiento.
- Cuantización única Q4_K_S: puede degradar la calidad respecto a los pesos originales en safetensors; no hay cuantizaciones superiores (Q5, Q6, Q8) ni imatrix disponibles en este repositorio.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre la calidad de las traducciones en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación comunitaria.
- No se documentan evaluaciones de calidad de traducción (BLEU, COMET u otras métricas).

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/EuroLLM-22B-grc-ro-GGUF
- Modelo base (LoRA): https://huggingface.co/icxcn/EuroLLM-22B-grc-ro
- Página de descargas del cuantizador: https://hf.tst.eu/model#EuroLLM-22B-grc-ro-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
