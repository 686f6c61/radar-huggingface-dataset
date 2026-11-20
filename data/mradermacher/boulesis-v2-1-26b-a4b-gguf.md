# mradermacher/Boulesis-v2.1-26B-A4B-GGUF

## Resumen

Boulesis-v2.1-26B-A4B-GGUF es la versión cuantizada en formato GGUF del modelo SubMaroon/Boulesis-v2.1-26B-A4B, un merge de arquitectura MoE (mezcla de expertos) basado en la familia Gemma, publicado por el usuario mradermacher. El modelo original cuenta con 25.971.339.550 parámetros totales y está orientado a roleplay, conversación y razonamiento, con etiquetas que indican variantes "heretic" (sin censura) y soporte de modo thinking. La cuantización la realiza mradermacher, un conocido generador de quants estáticos e imatrix para la comunidad.

El interés de esta ficha reside en que ofrece una vía práctica de ejecutar un modelo MoE de ~26B parámetros en hardware de consumo mediante cuantizaciones que van desde Q2_K (10,9 GB) hasta Q8_0 (27,7 GB). Al ser un merge de tipo MoE con aproximadamente 4B de parámetros activos (según la nomenclatura A4B), el coste computacional por token es inferior al de un modelo denso del mismo tamaño total, lo que lo hace atractivo para despliegues locales con llama.cpp u Ollama.

La licencia Apache 2.0 y el formato GGUF facilitan su integración en entornos de producción y prototipado, aunque la información pública disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada. Esta ficha recoge exclusivamente los datos verificables de la model card y de los metadatos de Hugging Face, indicando explícitamente cuando un dato no está disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) basada en la familia Gemma (tag "gemma4"); detalles internos no disponibles |
| Parámetros totales | 25.971.339.550 (~26B) |
| Parámetros activos | ~4B (según nomenclatura A4B); valor exacto no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticos); variantes imatrix en repo i1-GGUF |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo original en safetensors/transformers) |

## Arquitectura y entrenamiento

El modelo base SubMaroon/Boulesis-v2.1-26B-A4B es un merge de arquitectura MoE etiquetado como "gemma4", lo que sugiere una base derivada de la familia Gemma de Google con capa de mezcla de expertos. La nomenclatura "26B-A4B" indica aproximadamente 26 mil millones de parámetros totales con alrededor de 4 mil millones activos por token, aunque el desglose exacto de expertos, número de capas y dimensión de atención no está documentado en la información disponible.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o fine-tuning supervisado. Las etiquetas "heretic" y "uncensored" indican que el merge incorpora variantes con alineamiento reducido o eliminado, probablemente mediante técnicas de ablación de direcciones de rechazo. El tag "thinking" apunta a soporte de modo de razonamiento extendido, pero no se especifica el mecanismo técnico. La cuantización de mradermacher emplea cuantización estática de tensores de salida (output_tensor_quantised: 1) y ofrece variantes imatrix ponderadas en un repositorio separado.

## Capacidades

- Generación de texto conversacional y roleplay, con etiquetas explícitas para uso en SillyTavern.
- Razonamiento y modo thinking (según tags "thinking" y "reasoning"); el formato exacto de activación no está documentado.
- Comportamiento "uncensored"/"heretic": alineamiento reducido que permite respuestas sin rechazos en temas sensibles.
- Capacidades multilingües limitadas al inglés según el campo `language`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles; el repo indica skip_mmproj, lo que sugiere que no se incluyen proyecciones multimodales.
- Compatibilidad con endpoints (tag "endpoints_compatible") para despliegue vía Inference Endpoints.

## Casos de uso

- Roleplay y narrativa interactiva: el modelo está etiquetado específicamente para roleplay y SillyTavern, por lo que puede usarse como motor de personajes conversacionales con contexto multi-turno en aplicaciones de ficción interactiva.
- Asistente conversacional sin filtros en entornos controlados: la variante "uncensored" permite diálogos sin rechazos automáticos, útil para investigación sobre alineamiento o para escritura creativa sin restricciones temáticas.
- Prototipado local en hardware de consumo: con cuantizaciones Q4_K_M (17,3 GB) puede ejecutarse en GPUs de 24 GB como la RTX 4090, facilitando pruebas de concepto sin infraestructura cloud.
- Generación de texto en pipelines de CI/CD para pruebas de regresión conversacional: al ser GGUF y Apache 2.0, puede integrarse en suites de test automatizadas que validen respuestas del modelo.
- Experimentación con arquitecturas MoE: investigadores pueden estudiar el comportamiento de un MoE de ~26B con ~4B activos en tareas de razonamiento, comparando cuantizaciones para medir la degradación por compresión.
- Despliegue en entornos con restricciones de memoria: las variantes Q2_K (10,9 GB) y Q3_K_S (12,6 GB) permiten ejecución en GPUs de 12-16 GB, ampliando el acceso a equipos de gama media.
- Fine-tuning o evaluación de merges: al estar disponible el modelo base en safetensors, puede servir como punto de partida para experimentos de merge o adaptación con LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización: Q2_K ~10,9 GB; Q3_K_S ~12,6 GB; Q3_K_M ~13,7 GB; Q3_K_L ~14,2 GB; IQ4_XS ~14,6 GB; Q4_K_S ~16,0 GB; Q4_K_M ~17,3 GB; Q5_K_S ~18,6 GB; Q5_K_M ~19,7 GB; Q6_K ~23,3 GB; Q8_0 ~27,7 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090 (24 GB) equivalente; A100 40/80 GB o H100 para Q6_K y Q8_0 con contexto largo; GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080) para Q2_K y Q3_K_S.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con Q4_K_M y Q5_K_M; en GPUs de 12-16 GB con cuantizaciones Q2_K a IQ4_XS.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; el tag "endpoints_compatible" sugiere compatibilidad con Hugging Face Inference Endpoints.
- Latencia y throughput: no disponibles. Al ser un MoE con ~4B parámetros activos, se espera un throughput superior al de un modelo denso de 26B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Boulesis-v2.1-26B-A4B-GGUF | ~26B | ~4B | no disponible | Apache 2.0 | GGUF | Roleplay, uncensored, MoE |
| Modelos Gemma base (familia) | variable | densos | no disponible | Gemma license | safetensors/GGUF | Base del merge; alineamiento estándar |
| Mixtral 8x7B (referencia MoE) | ~47B | ~13B | 32k (típico) | Apache 2.0 | safetensors/GGUF | MoE más grande, mayor coste |
| Qwen MoE de tamaño similar | no disponible | no disponible | no disponible | variable | safetensors/GGUF | Alternativa MoE de la comunidad |

La comparativa es limitada porque no se dispone de benchmarks del modelo ni de datos internos de arquitectura. Frente a Mixtral 8x7B, Boulesis tiene menos parámetros totales y activos, lo que reduce requisitos de VRAM pero también el techo de capacidad. Frente a modelos densos de 26B, el MoE ofrece menor coste por token a cambio de mayor complejidad de despliegue.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un merge "uncensored"/"heretic", puede reproducir sesgos sin filtros de alineamiento.
- Riesgo de alucinación: no cuantificado; los modelos de roleplay y merges sin benchmarks publicados tienen riesgo elevado de fabricar información.
- Limitaciones de idioma: solo inglés declarado; el rendimiento en castellano no está verificado y probablemente sea inferior.
- Limitaciones de contexto: la longitud de contexto no está documentada, lo que impide planificar despliegues con ventanas largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base puede heredar restricciones de la familia Gemma; conviene verificar la licencia del modelo original SubMaroon/Boulesis-v2.1-26B-A4B.
- Caveat de producción: al ser un merge de la comunidad sin evaluación formal, no se recomienda para aplicaciones críticas sin una batería de pruebas propia.
- Calidad de cuantización: las variantes Q2_K y Q3_K_S degradan notablemente la perplejidad; para producción se recomienda Q4_K_M o superior.
- Contenido sensible: la naturaleza "uncensored" puede generar contenido inapropiado; requiere moderación externa en aplicaciones públicas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Boulesis-v2.1-26B-A4B-GGUF
- Modelo base: https://huggingface.co/SubMaroon/Boulesis-v2.1-26B-A4B
- Variantes imatrix: https://huggingface.co/mradermacher/Boulesis-v2.1-26B-A4B-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Boulesis-v2.1-26B-A4B-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
