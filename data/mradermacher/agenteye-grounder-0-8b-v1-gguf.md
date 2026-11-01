# mradermacher/AgentEye-Grounder-0.8B-v1-GGUF

## Resumen

AgentEye-Grounder-0.8B-v1-GGUF es una versión cuantizada en formato GGUF del modelo Navanjana/AgentEye-Grounder-0.8B-v1, realizada por mradermacher, un cuantizador muy conocido en la comunidad de Hugging Face. El modelo base es un modelo ligero de unos 772,8 millones de parámetros, entrenado sobre el dataset Salesforce/grounding_dataset, y está orientado a tareas de grounding visual para agentes: es decir, localizar elementos en imágenes (por ejemplo, mediante coordenadas o cajas delimitadoras) como parte de flujos de trabajo agénticos. La presencia de archivos mmproj (suplementos multimodales) confirma que el modelo procesa entradas visuales además de texto.

La relevancia de este modelo radica en su tamaño mínimo: con menos de 800 millones de parámetros, puede ejecutarse en hardware muy modesto, incluso en portátiles sin GPU dedicada, lo que lo hace atractivo para construir agentes con capacidades visuales de bajo coste y baja latencia. Soporta inglés y chino, y se distribuye bajo licencia MIT, lo que permite su uso comercial sin restricciones.

Cabe destacar que esta ficha describe la cuantización GGUF estática de mradermacher; la model card del modelo base no incluye detalles sobre la arquitectura exacta, el proceso de entrenamiento ni benchmarks, por lo que varios campos se indican como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (transformer multimodal, según archivos mmproj) |
| Parametros totales | 772.845.888 |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (más mmproj-Q8_0 y mmproj-f16) |
| Idiomas soportados | inglés, chino |
| Licencia | MIT |
| Formato de pesos | GGUF (el modelo base está en safetensors, con 8,0 GB en el repo original) |

## Arquitectura y entrenamiento

El modelo base, AgentEye-Grounder-0.8B-v1, es un modelo multimodal compacto de 772,8 millones de parámetros entrenado por Navanjana sobre el dataset Salesforce/grounding_dataset, un conjunto de datos orientado a tareas de grounding visual (localización de objetos o regiones en imágenes a partir de instrucciones en lenguaje natural). La existencia de archivos mmproj (proyectores multimodales) en la cuantización GGUF indica una arquitectura tipo modelo de lenguaje con un codificador visual conectado mediante un proyector, un patrón habitual en modelos como Qwen2-VL o LLaVA. No obstante, la model card no especifica el modelo base del LLM, la longitud de contexto ni el número de tokens de entrenamiento.

En cuanto a la cuantización, mradermacher ha publicado cuants estáticos en formato GGUF que abarcan desde Q2_K (0,5 GB) hasta f16 (1,7 GB), además de los suplementos multimodales mmproj en Q8_0 (0,2 GB) y f16 (0,3 GB). No hay cuants weighted/imatrix disponibles por el momento. No se dispone de información sobre si el entrenamiento incluyó RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Grounding visual: localización de elementos u objetos en imágenes a partir de instrucciones en lenguaje natural, entrenado específicamente con el dataset de grounding de Salesforce.
- Comprensión multimodal: acepta entradas de imagen y texto (evidenciado por los archivos mmproj incluidos en la cuantización).
- Soporte bilingüe: funciona en inglés y chino.
- Orientación a agentes: etiquetado explícitamente como modelo para agentes, pensado para integrarse en pipelines agénticos que requieren percepción visual.
- Conversación: etiquetado como conversational, por lo que puede gestionar interacciones de diálogo.
- Tool calling, function calling y razonamiento multi-paso: no disponible (sin información en la model card).

## Casos de uso

- Localización de objetos en agentes visuales: un agente que navega por interfaces gráficas o páginas web puede usar el modelo para identificar las coordenadas de botones, campos de texto o enlaces a partir de instrucciones como "pulsa el botón de aceptar", gracias a su entrenamiento específico en grounding.
- Automatización de pruebas de UI: integración en pipelines de CI/CD para verificar que elementos visuales aparecen donde se espera en capturas de pantalla de aplicaciones, sustituyendo selectores frágiles por localización semántica.
- Robots domésticos o industriales de bajo coste: dado su tamaño mínimo, puede ejecutarse en hardware embebido o SBCs para que un robot identifique y localice objetos en su campo de visión antes de actuar.
- Asistentes de accesibilidad: describir y localizar elementos en pantalla para usuarios con discapacidad visual, señalando la posición de elementos relevantes en tiempo real.
- Anotación semiautomática de imágenes: preetiquetado de regiones de interés en imágenes en inglés o chino para reducir el coste de anotación manual en proyectos de visión.
- Agentes de análisis documental: localizar firmas, sellos, tablas o campos concretos en documentos escaneados como paso previo a la extracción de datos.
- Edición de imágenes asistida por lenguaje: permitir que un editor señale la región exacta a modificar ("recorta el logo de la esquina superior derecha") sin interacción manual con el ratón.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Los cuants GGUF ocupan entre 0,5 GB (Q2_K) y 1,7 GB (f16), más 0,2-0,3 GB del archivo mmproj. Incluso el modelo completo en f16 cabe con holgura en cualquier GPU moderna o directamente en RAM de CPU.
- GPU recomendadas: no es necesaria una GPU; cualquier GPU con 2-4 GB de VRAM (por ejemplo, una GTX 1650 o una RTX 3050) es más que suficiente. En CPU, cualquier procesador de los últimos años ejecutará el modelo con buena velocidad.
- Cabe en consumer GPU: sí, en prácticamente cualquier GPU de consumo, incluso las de gama de entrada. También es plenamente viable en portátiles sin GPU dedicada.
- Opciones de despliegue: llama.cpp (formato nativo GGUF, necesario para usar los archivos mmproj), Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF multimodal. No es adecuado para vLLM o TGI en su forma GGUF, aunque el modelo base en safetensors podría desplegarse con transformers.
- Latencia y throughput: no disponibles como cifras oficiales; dado el tamaño (0,8B de parámetros), se espera una generación muy rápida incluso en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Multimodal | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| AgentEye-Grounder-0.8B-v1-GGUF | 0,77B | Sí (mmproj) | MIT | GGUF | Especializado en grounding para agentes |
| Qwen2-VL-2B-Instruct | 2B | Sí | Qwen (uso comercial con condiciones) | safetensors, GGUF | Generalista visual, contexto largo |
| SmolVLM-500M-Instruct | 0,5B | Sí | Apache 2.0 | safetensors, GGUF | Multimodal muy ligero de Hugging Face |
| Moondream2 | ~1,9B | Sí | Apache 2.0 | safetensors, GGUF | VLM compacto para preguntas sobre imágenes |

Frente a estas alternativas, AgentEye-Grounder destaca por su enfoque específico en grounding para agentes y su licencia MIT sin condiciones, aunque al ser un modelo especializado y pequeño, probablemente sea menos capaz en tareas visuales generales que Qwen2-VL-2B.

## Limitaciones y advertencias

- Alcance especializado: el modelo está entrenado específicamente para grounding con el dataset Salesforce/grounding_dataset; su rendimiento en tareas visuales generales (descripción de imágenes, OCR, razonamiento visual complejo) puede ser limitado.
- Sesgos: no disponible; como cualquier modelo entrenado con datos web, puede heredar sesgos del dataset de entrenamiento.
- Alucinaciones: al ser un modelo muy pequeño, el riesgo de alucinaciones o localizaciones incorrectas es relevante; conviene validar las coordenadas devueltas en aplicaciones críticas.
- Contexto: longitud de contexto no documentada; verificarla antes de diseñar flujos con imágenes múltiples o conversaciones largas.
- Cuants de baja calidad: los cuants Q2_K y Q3_K_S/M/L degradan notablemente la calidad; se recomiendan Q4_K_M o superiores. No hay cuants imatrix disponibles.
- Licencia: MIT, sin restricciones para uso comercial.
- Soporte de software: para usar los archivos mmproj es necesario un runtime GGUF con soporte multimodal actualizado (llama.cpp reciente); versiones antiguas no cargarán el componente visual.
- Información limitada: la model card del modelo base carece de documentación técnica (arquitectura, entrenamiento, benchmarks), lo que dificulta evaluar su fiabilidad antes de usarlo en producción.

## Enlaces

- Modelo cuantizado (GGUF): https://huggingface.co/mradermacher/AgentEye-Grounder-0.8B-v1-GGUF
- Modelo base: https://huggingface.co/Navanjana/AgentEye-Grounder-0.8B-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/Salesforce/grounding_dataset
- Página de descargas de mradermacher: https://hf.tst.eu/model#AgentEye-Grounder-0.8B-v1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (referenciada en la model card): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
- Paper, demo y repositorio de código: no disponibles
