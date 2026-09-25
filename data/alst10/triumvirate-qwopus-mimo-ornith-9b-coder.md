# alst10/Triumvirate-Qwopus-MiMo-Ornith-9B-Coder

## Resumen

Triumvirate-Qwopus-MiMo-Ornith-9B-Coder es un modelo de lenguaje orientado a generación de código, distribuido por el usuario alst10 en Hugging Face. Se trata concretamente de una versión cuantizada en formato GGUF del modelo base pragmaticcs/Triumvirate-Qwopus-MiMo-Ornith-9B-Coder, convertida mediante el proyecto ROCmFPX de charlie12345. El repositorio no contiene pesos originales en precisión completa, sino una colección de ficheros GGUF optimizados para ejecución en hardware AMD mediante ROCm, además de cuantizaciones estándar Q2 a Q8.

El modelo tiene 8.953.803.264 parámetros totales (aproximadamente 8,95 mil millones), según los datos de safetensors asociados al modelo base. El nombre "Triumvirate-Qwopus-MiMo-Ornith" sugiere una composición derivada de varios modelos previos (Qwopus, MiMo y Ornith), aunque la model card no documenta el proceso de fusión ni el entrenamiento. La información pública disponible sobre arquitectura interna, datos de entrenamiento y contexto es muy limitada: el repositorio es una conversión de pesos, no una publicación de investigación.

Su relevancia actual radica en dos factores. Por un lado, ofrece una vía práctica para ejecutar un modelo coder de ~9B en GPUs AMD mediante cuantizaciones ROCmFPX específicas, algo poco habitual en el ecosistema GGUF, dominado por rutas CUDA y Metal. Por otro, sirve como punto de partida para desarrolladores que quieran probar el modelo base en local sin descargar el repositorio completo de pesos, dado que los ficheros individuales van de 3,10 GB (Q2_0_ROCMFPX) a 8,77 GB (Q8_0_ROCMFPX_AGENT).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (por tamaño y nombre, se trata probablemente de un transformer decoder-only derivado de una fusión de modelos) |
| Parámetros totales | 8.953.803.264 (aprox. 8,95B) |
| Parámetros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_0_ROCMFPX, Q3_0_ROCMFPX, Q4_0_ROCMFP4, Q4_0_ROCMFP4_FAST, Q4_0_ROCMFP4_COHERENT, Q4_0_ROCMFP4_FAST_COHERENT, Q4_0_ROCMFP4_LEAN, Q4_0_ROCMFP4_STRIX, Q4_0_ROCMFP4_STRIX_LEAN, Q6_0_ROCMFPX, Q8_0_ROCMFPX, Q8_0_ROCMFPX_AGENT |
| Idiomas soportados | no disponible |
| Licencia | CC BY 4.0 (indicada en la model card y en el YAML del autor); los metadatos de Hugging Face del repo no la declaran de forma explícita |
| Formato de pesos | GGUF (este repositorio); el modelo base dispone de pesos en safetensors según el recuento de parámetros |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO o RL en el modelo base. La model card de este repositorio se limita a describir el proceso de conversión a GGUF usando ROCmFPX y a listar los ficheros resultantes. El nombre del modelo sugiere una fusión ("merge") de pesos provenientes de al menos tres linajes distintos (Qwopus, MiMo y Ornith), pero no hay ninguna confirmación técnica ni documentación del procedimiento de merge.

La innovación técnica destacable de este repositorio concreto no está en el modelo, sino en el formato de cuantización. ROCmFPX introduce variantes de cuantización Q4_0 específicas para hardware AMD (ROCMFP4) con perfiles alternativos orientados a velocidad (FAST), coherencia de salida (COHERENT), menor huella (LEAN), arquitecturas Strix (STRIX) y uso agéntico (Q8_0_ROCMFPX_AGENT). El repositorio también incluye cuantizaciones ROCMFPX estándar en Q2, Q3, Q6 y Q8. Para generar texto se requiere la build de llama.cpp proporcionada por el proyecto ROCmFPX, compilada sin CUDA y con ROCm.

## Capacidades

- Generación de texto conversacional: el tag "conversational" del repositorio indica adaptación a diálogo multi-turno, aunque no se detalla el formato de prompt soportado.
- Generación de código: el sufijo "Coder" y el contexto del modelo base (Ornith-1.0-9B, según la búsqueda web, es un modelo orientado a coding agéntico) apuntan a tareas de programación como caso de uso previsto.
- Perfil agéntico: la variante Q8_0_ROCMFPX_AGENT sugiere un ajuste o configuración pensada para flujos de agente, si bien no se documentan formalmente las capacidades de tool calling o function calling.
- Soporte de endpoints compatibles: el tag "endpoints_compatible" indica que el modelo puede servirse a través de infraestructura compatible con la API de inferencia de Hugging Face.
- Capacidades de razonamiento, matemáticas, visión, audio o thinking mode: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles; no se declara lista de idiomas.

## Casos de uso

- Asistente de programación en local: el modelo puede cargarse con llama.cpp en GPUs AMD mediante las builds de ROCmFPX y usarse como autocompletado o chat de código en estaciones de trabajo con hardware Radeon, gracias a las cuantizaciones Q4 y Q5 que caben en VRAM de 8-12 GB.
- Generación de código en pipelines de CI/CD: al estar en formato GGUF y ser compatible con servidores de endpoints, puede integrarse como servicio interno de revisión de parches, generación de pruebas o documentación de cambios, sin depender de APIs externas.
- Prototipado de agentes de código: la variante Q8_0_ROCMFPX_AGENT está pensada para escenarios de agente; puede usarse como motor de razonamiento de un bucle que llame a herramientas (shell, linters, gestores de repositorio) aunque las capacidades de tool calling no estén documentadas.
- Entornos con restricción de licencia permisiva: al distribuirse bajo CC BY 4.0, es apto para usos comerciales con atribución, lo que facilita su incorporación en productos propietarios que necesiten un modelo coder local.
- Evaluación y comparación de cuantizaciones: el repositorio ofrece múltiples perfiles (FAST, COHERENT, LEAN, STRIX) del mismo Q4_0, lo que permite medir el compromiso entre velocidad y calidad de salida en hardware AMD concreto.
- Despliegue en clústeres ROCm: al compilar llama.cpp sin CUDA y con ROCm, puede desplegarse en nodos AMD (MI200, MI300, Radeon Pro) donde no hay soporte CUDA, sirviendo como alternativa a modelos que solo ofrecen pesos en formato PyTorch.
- Chat conversacional de propósito general: el tag "conversational" permite su uso como asistente de texto en aplicaciones de atención al usuario, aunque sin datos de contexto e idiomas no se puede garantizar un rendimiento multilingüe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas de MMLU, HumanEval, GSM8K, MBPP ni ningún otro conjunto de evaluación, ni comparaciones con modelos de tamaño similar.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de fichero GGUF):
  - Q2_0_ROCMFPX: 3,10 GB de pesos, en torno a 4 GB de VRAM con contexto corto.
  - Q3_0_ROCMFPX: 4,60 GB de pesos, aproximadamente 5,5-6 GB de VRAM.
  - Q4_0_ROCMFP4 (y variantes): entre 4,44 y 5,47 GB de pesos, alrededor de 6-7 GB de VRAM.
  - Q6_0_ROCMFPX: 6,86 GB de pesos, en torno a 8-9 GB de VRAM.
  - Q8_0_ROCMFPX / Q8_0_ROCMFPX_AGENT: 8,61-8,77 GB de pesos, aproximadamente 10-11 GB de VRAM.
- GPU recomendadas: no hay lista oficial publicada. Por tamaño de modelo y cuantizaciones, es plausible ejecutarlo en GPUs AMD con ROCm (Radeon RX 6000/7000, Radeon Pro, Instinct MI200/MI300) y, en el caso de las cuantizaciones mayores, en GPUs con 12-16 GB o más de VRAM.
- Compatibilidad con GPU de consumo: las variantes Q2, Q3 y Q4 caben en GPUs de gama media con 8-12 GB de VRAM (por ejemplo, Radeon RX 6700 XT o superiores en el lado AMD). Las variantes Q8 requieren 12 GB o más y suelen ir acompañadas de offload parcial a RAM.
- Opciones de despliegue: llama.cpp compilado con ROCmFPX (el README ofrece instrucciones concretas con `cmake -B build -G Ninja -DCMAKE_BUILD_TYPE=Release -DGGML_CUDA=OFF -DGGML_NATIVE=ON` y compilación del target `llama-cli`); también existen cuantizaciones GGUF estándar en el repositorio mradermacher/Triumvirate-Qwopus-MiMo-Ornith-9B-Coder-GGUF, que permitirían usar llama.cpp, Ollama u otros frontends GGUF compatibles.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Triumvirate-Qwopus-MiMo-Ornith-9B-Coder (alst10) | 8,95B | no disponible | CC BY 4.0 | GGUF (ROCmFPX) | Cuantizaciones específicas para AMD; orientado a código |
| Ornith-1.0-9B (según búsqueda web) | 9B | no disponible | MIT | no disponible | Fine-tune de Qwen 3.5 con RL para coding agéntico; linaje relacionado por nombre |
| Modelo base pragmaticcs/Triumvirate-Qwopus-MiMo-Ornith-9B-Coder | no disponible (8,95B según safetensors) | no disponible | no disponible | safetensors | Origen de las cuantizaciones de este repositorio |
| mradermacher/Triumvirate-Qwopus-MiMo-Ornith-9B-Coder-GGUF | 8,95B (presumiblemente) | no disponible | no disponible | GGUF (estándar) | Cuantizaciones GGUF alternativas, no específicas de ROCm |

No se dispone de datos de rendimiento comparativos entre estas alternativas. Las diferencias observables se limitan al formato de pesos, la licencia declarada y la orientación de hardware.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no hay publicación, paper ni model card del modelo base; se desconoce la arquitectura exacta, el contexto máximo y la composición del entrenamiento.
- Riesgo de alucinación no evaluado: al no existir benchmarks ni evaluaciones publicadas, no se puede estimar la fiabilidad en tareas de código o conversación.
- Sesgos desconocidos: sin información sobre el dataset de entrenamiento no es posible identificar sesgos lingüísticos, culturales o de dominio.
- Idiomas: no se declara soporte multilingüe; el uso en castellano u otros idiomas distintos del inglés no está garantizado.
- Licencia: la model card indica CC BY 4.0, que permite uso comercial con atribución, pero los metadatos de Hugging Face no la declaran, lo que genera ambigüedad legal; conviene verificar la licencia del modelo base antes de usarlo en producción.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso ni validación por parte de la comunidad, lo que aumenta el riesgo de problemas no documentados.
- Dependencia de tooling específico: las cuantizaciones ROCMFPX requieren la build de llama.cpp del proyecto charlie12345/ROCmFPX, lo que reduce la portabilidad frente a GGUF estándar y puede dificultar el despliegue en entornos CUDA o Apple Silicon.
- Fechas del repositorio (creación y actualización en septiembre de 2026) resultan anómalas respecto al momento de redacción y no se pueden contrastar.
- Posible confusión de linaje: el nombre incluye "Ornith", pero no hay certeza de que el modelo base derive del Ornith-1.0-9B mencionado en las búsquedas; no debe asumirse equivalencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/alst10/Triumvirate-Qwopus-MiMo-Ornith-9B-Coder
- Modelo base: https://huggingface.co/pragmaticcs/Triumvirate-Qwopus-MiMo-Ornith-9B-Coder
- Cuantizaciones GGUF alternativas: https://huggingface.co/mradermacher/Triumvirate-Qwopus-MiMo-Ornith-9B-Coder-GGUF
- Proyecto ROCmFPX (tooling de cuantización): https://github.com/charlie12345/ROCmFPX
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Ficha del modelo base en LLM Explorer: https://llm-explorer.com/model/pragmaticcs%2FTriumvirate-Qwopus-MiMo-Ornith-9B-Coder,24dCFrTn5oSvAeQ5P8kqLH
- Ornith AI (contexto del linaje Ornith): https://ornith.online/
- Referencia Ornith-1.0-9B: https://dev.co/ai/llms/ornith-1-0-9b
