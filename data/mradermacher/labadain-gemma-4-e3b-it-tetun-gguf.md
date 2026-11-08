# mradermacher/Labadain-Gemma-4-E3B-it-Tetun-GGUF

## Resumen

Labadain-Gemma-4-E3B-it-Tetun-GGUF es la versión cuantizada en formato GGUF del modelo Labadain-Gemma-4-E3B-it-Tetun, un ajuste fino mediante QLoRA del modelo base Gemma 4 de Google DeepMind, especializado en tetun (tetun-dili), la lengua oficial de Timor-Leste. El trabajo de cuantización lo firma mradermacher, un conocido publicador de cuantizaciones GGUF de la comunidad, mientras que el ajuste fino original procede del usuario labadain. El modelo está pensado para conversación en una lengua de bajos recursos, un ámbito donde la mayoría de los modelos multilingües generalistas rinden de forma deficiente.

El modelo cuenta con 4.647.450.147 parámetros totales según los pesos en safetensors del modelo base, lo que lo sitúa en la gama de modelos compactos aptos para hardware de consumo. Al derivar de Gemma 4, hereda la arquitectura y las capacidades del modelo de Google, incluyendo un componente multimodal que se distribuye aparte en los ficheros `mmproj` del repositorio. La licencia es la Gemma 4 License de Google, no una licencia de código abierto permisiva al uso.

La relevancia de esta ficha reside en dos factores: por un lado, cubre una lengua con escasa representación en el ecosistema de modelos abiertos, lo que lo hace útil para proyectos de preservación lingüística y administración pública en Timor-Leste; por otro, la disponibilidad de cuantizaciones GGUF que van desde Q2_K (3,1 GB) hasta f16 (9,4 GB) permite desplegarlo en estaciones de trabajo modestas o incluso en portátiles con GPU integrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 4 de Google DeepMind; detalles de capas y atención no disponibles) |
| Parametros totales | 4.647.450.147 |
| Parametros activos | no disponible (no consta que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; además mmproj-Q8_0 y mmproj-f16 para el componente multimodal |
| Idiomas soportados | tet (tetun), tdt (tetun-dili) |
| Licencia | Gemma (Gemma 4 License, https://ai.google.dev/gemma/docs/gemma_4_license) |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |
| Tamano del repositorio | 49,6 GB |
| Libreria declarada | transformers |
| Fecha de creacion | 2026-11-08 |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino del Gemma 4 de Google DeepMind, realizado por labadain mediante QLoRA, una técnica de ajuste eficiente en parámetros que congela los pesos originales y entrena adaptadores de bajo rango en precisión reducida. La arquitectura subyacente es la de Gemma 4, un transformer con atención multi-cabeza estándar; la model card del repositorio cuantizado no detalla el número de capas, la dimensión oculta ni el mecanismo exacto de atención, por lo que esos datos deben consultarse en la ficha del modelo base. El repositorio incluye ficheros `mmproj` (multi-modal projection), lo que indica que el modelo conserva la capacidad de procesar entradas visuales del Gemma 4 original.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del corpus en tetun utilizado para el ajuste fino, ni si se aplicaron etapas de RLHF o DPO adicionales. La etiqueta `qlora` en los metadatos confirma el método de ajuste, y la etiqueta `conversational` sugiere que el entrenamiento se orientó a diálogo multi-turno. Las cuantizaciones son estáticas (no ponderadas ni con imatrix), según indica el propio autor en la model card, que además señala que las cuantizaciones ponderadas podrían no estar disponibles.

## Capacidades

- Generación de texto conversacional en tetun y tetun-dili, con especial atención a registro coloquial y formal en el contexto de Timor-Leste.
- Capacidad multimodal heredada de Gemma 4: los ficheros `mmproj` permiten procesar imágenes junto con texto, aunque no se detalla el alcance exacto (OCR, descripción visual, VQA).
- Razonamiento y respuesta a instrucciones en lengua tetun, derivados del ajuste fino conversacional.
- Soporte de conversaciones multi-turno, según la etiqueta `conversational` del repositorio.
- No se ha documentado soporte de tool calling, function calling ni capacidades de agente multi-paso en la información disponible.
- No se ha documentado modo de razonamiento explícito (thinking mode) ni procesamiento de audio.
- Capacidades multilingües limitadas a los idiomas declarados (tet, tdt); no se garantiza un rendimiento sólido en otros idiomas.

## Casos de uso

- Atención ciudadana en Timor-Leste: el modelo puede gestionar consultas en tetun sobre trámites administrativos, servicios públicos o información local, aprovechando su ajuste específico en la lengua oficial. Es adecuado porque los modelos generalistas rara vez cubren tetun con fluidez.
- Traducción y mediación lingüística: útil para traducir documentación oficial, comunicados o material educativo entre tetun y otros idiomas, o para asistir a intérpretes en contextos administrativos y sanitarios.
- Preservación y difusión del patrimonio lingüístico: generación de materiales didácticos, cuentos, ejercicios escolares o contenido divulgativo en tetun para escuelas y medios locales, con la ventaja de que el modelo está entrenado específicamente en esta lengua.
- Asistencia a ONG y cooperación internacional: redacción de informes, resúmenes de reuniones y correspondencia en tetun para organizaciones que operan en Timor-Leste, reduciendo la dependencia de traductores externos.
- Despliegue en hardware modesto: gracias a las cuantizaciones Q4_K_S y Q4_K_M (3,5 GB), puede ejecutarse en portátiles con GPU de consumo para tareas de generación de texto en entornos con conectividad limitada, algo relevante en regiones con infraestructura escasa.
- Investigación en lenguas de bajos recursos: sirve como punto de partida para experimentos de ajuste fino, evaluación de calidad lingüística o comparación de técnicas de cuantización en una lengua con pocos recursos digitales.
- Procesamiento de documentos con imágenes: el componente `mmproj` permite extraer texto o describir imágenes en contextos donde se digitalizan formularios o documentos escaneados en tetun.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~3,1 GB; Q3_K_S ~3,2 GB; Q3_K_M ~3,3 GB; Q3_K_L ~3,4 GB; IQ4_XS ~3,4 GB; Q4_K_S y Q4_K_M ~3,5 GB; Q5_K_S y Q5_K_M ~3,7 GB; Q6_K ~3,9 GB; Q8_0 ~5,1 GB; f16 ~9,4 GB. Añadir ~0,7 GB (mmproj-Q8_0) o ~1,1 GB (mmproj-f16) si se usa el componente multimodal.
- GPU recomendadas: para Q4_K_M o Q5_K_M, una RTX 3060 de 12 GB o superior es suficiente; para Q8_0, una RTX 4070/4080 o superior; para f16, una RTX 4090 (24 GB) o una A100/H100 si se busca máximo throughput.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 6 GB de VRAM usando cuantizaciones Q4 o Q5; las cuantizaciones Q2 y Q3 caben incluso en iGPU con memoria compartida.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, text-generation-webui, y servidores compatibles con la API de endpoints (el repositorio incluye la etiqueta `endpoints_compatible`). Para el componente multimodal, llama.cpp con soporte de `mmproj`.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Labadain-Gemma-4-E3B-it-Tetun-GGUF | 4,65 B | no disponible | tet, tdt | Gemma 4 License | GGUF |
| Gemma 4 E3B (base, Google DeepMind) | ~3 B efectivos (E3B) | no disponible | multilingüe amplio | Gemma 4 License | safetensors, GGUF |
| Modelos multilingües generalistas de ~4-7 B (p. ej. Qwen, Llama) | 4-7 B | variable | decenas de idiomas, tetun no cubierto de forma fiable | variable | safetensors, GGUF |

La comparación directa con alternativas especializadas en tetun no está disponible, ya que el ecosistema de modelos abiertos para esta lengua es muy reducido. Frente a los modelos generalistas de tamaño similar, la ventaja de este ajuste es la cobertura específica del tetun; la desventaja es un rendimiento potencialmente inferior en tareas generales fuera de ese dominio y una licencia más restrictiva que las licencias Apache o MIT de algunas alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: al derivar de Gemma 4 y ajustarse con un corpus de tetun presumiblemente limitado, puede reproducir sesgos culturales, de género o regionales presentes en los datos de entrenamiento; no se ha documentado una evaluación de sesgos específica.
- Riesgo de alucinación: elevado en una lengua de bajos recursos, donde el corpus de ajuste es probablemente pequeño; conviene validar las respuestas factuales, especialmente en contextos administrativos o médicos.
- Limitaciones de contexto e idioma: la longitud de contexto no está documentada; el modelo solo declara soporte de tet y tdt, por lo que su uso en portugués, inglés o indonesio puede degradarse notablemente.
- Restricciones de licencia: la Gemma 4 License impone condiciones de uso, obligaciones de atribución y restricciones de uso comercial que deben revisarse antes de un despliegue en producción; no es una licencia de código abierto permisiva.
- Cuantizaciones estáticas: el autor advierte de que las cuantizaciones ponderadas o con imatrix no están disponibles, lo que puede afectar a la calidad en los niveles más bajos (Q2, Q3).
- Componente multimodal: los ficheros `mmproj` se distribuyen por separado y su integración requiere herramientas compatibles; no se detalla el alcance real de la capacidad visual.
- Madurez: el repositorio tiene cero descargas y cero likes en el momento de la consulta, y fue creado en noviembre de 2026, por lo que no hay evidencia comunitaria de su robustez en producción.
- Repositorio de 49,6 GB: incluye todas las cuantizaciones, por lo que conviene descargar solo el fichero necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Labadain-Gemma-4-E3B-it-Tetun-GGUF
- Modelo base: https://huggingface.co/labadain/Labadain-Gemma-4-E3B-it-Tetun
- Página de descargas del cuantizador: https://hf.tst.eu/model#Labadain-Gemma-4-E3B-it-Tetun-GGUF
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Perfil del cuantizador: https://huggingface.co/mradermacher
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
