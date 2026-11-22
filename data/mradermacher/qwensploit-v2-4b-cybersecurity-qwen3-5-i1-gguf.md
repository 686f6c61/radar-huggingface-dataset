# mradermacher/Qwensploit-V2-4B-CyberSecurity-Qwen3.5-i1-GGUF

## Resumen

Qwensploit-V2-4B-CyberSecurity-Qwen3.5-i1-GGUF es una cuantización en formato GGUF del modelo Qwensploit-V2-4B-CyberSecurity-Qwen3.5, publicado por el usuario mradermacher. Se trata de un modelo de lenguaje de 4.326 millones de parámetros (aproximadamente 4,3 mil millones) afinado para tareas de ciberseguridad: red team, pruebas de penetración, investigación de vulnerabilidades, análisis de seguridad y resolución de retos CTF. El modelo base es un fine-tuning de la familia Qwen 3.5, según indican las etiquetas del repositorio.

La relevancia de esta ficha radica en que ofrece una versión ligera y ejecutable en hardware de consumo de un modelo especializado en seguridad ofensiva y defensiva, con cuantizaciones que van desde 2,1 GB (i1-Q2_K) hasta 3,7 GB (i1-Q6_K). El repositorio incluye cuantizaciones ponderadas con imatrix, lo que permite ajustar el equilibrio entre tamaño, velocidad y calidad en función del hardware disponible.

El autor original del modelo es xtools-at, mientras que mradermacher se encarga únicamente de la cuantización. La licencia es "other", lo que implica que las condiciones de uso comercial deben consultarse en el repositorio del modelo base. El idioma declarado es inglés (en), y el modelo está etiquetado como conversacional y compatible con endpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, según etiquetas del repositorio) |
| Parametros totales | 4.326.350.848 (4,3 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, además de un archivo imatrix |
| Idiomas soportados | inglés (en) |
| Licencia | other |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un fine-tuning de Qwen 3.5, según las etiquetas `qwen3_5` y `qwen3.5` del repositorio. Se trata de un transformer decoder-only de 4,3 mil millones de parámetros, afinado mediante instrucciones (instruction-tuning) y técnicas de LoRA/PEFT, tal como indican las etiquetas `lora` y `peft`. El modelo incorpora además la etiqueta `mtp`, que sugiere multi-token prediction, y `unsloth`, lo que apunta a que el entrenamiento se realizó con el framework Unsloth para optimizar el uso de memoria y velocidad.

El entrenamiento se apoya en varios datasets especializados en ciberseguridad: PentesterFlow/OffsecCyber, ChaoticNeutrals/Cybersecurity-ShareGPT, Voidreaper2026/cybersec-master-dataset, Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset, saidutta69/CyberSec-Reasoning-Premium, saidutta69/qwen3.8-max-distillation-50k-clean y xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x. Este último sugiere la inclusión de trazas de razonamiento de alta calidad, lo que podría potenciar las capacidades de razonamiento del modelo en tareas de seguridad. No se dispone de información sobre el número total de tokens de entrenamiento ni sobre si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento especializado en ciberseguridad, con énfasis en red team, pruebas de penetración y análisis de vulnerabilidades.
- Resolución de retos CTF (Capture The Flag) y tareas de investigación de seguridad.
- Análisis de seguridad y evaluación de riesgos en entornos ofensivos y defensivos.
- Razonamiento multi-paso orientado a la resolución de problemas técnicos complejos.
- Soporte de instrucciones conversacionales y multi-turno.
- Capacidades multilingües limitadas al inglés (según la etiqueta `language: en`).
- No se dispone de información sobre soporte de tool calling, function calling, agentes o visión en la información proporcionada. La model card menciona que "this is a vision model" y que los archivos mmproj estarían en el repositorio estático, pero no se confirma que esta cuantización incluya capacidades de visión.

## Casos de uso

- Formación en ciberseguridad: el modelo puede generar escenarios de ataque y defensa, explicar vulnerabilidades y proponer mitigaciones, lo que lo hace útil en programas de concienciación y entrenamiento de equipos de seguridad.
- Resolución de retos CTF: gracias a su entrenamiento en datasets de seguridad ofensiva, puede asistir en la identificación de vectores de ataque, análisis de binarios y explotación de vulnerabilidades en entornos controlados.
- Análisis de vulnerabilidades: puede ayudar a interpretar informes de seguridad, clasificar riesgos y sugerir contramedidas, integrándose en flujos de trabajo de gestión de parches.
- Red team asistido: el modelo puede generar hipótesis de ataque, payloads de prueba y planes de explotación para auditorías de seguridad autorizadas.
- Investigación de seguridad: útil para explorar técnicas de evasión, análisis de malware y estudio de TTPs (tácticas, técnicas y procedimientos) de actores maliciosos.
- Automatización de documentación de seguridad: puede redactar informes técnicos, resúmenes de hallazgos y recomendaciones a partir de datos de escaneo, gracias a su capacidad conversacional.
- Despliegue en entornos con recursos limitados: al estar cuantizado en GGUF con tamaños de 2,1 a 3,7 GB, puede ejecutarse en estaciones de trabajo sin GPU dedicada o con GPU de consumo, lo que facilita su uso en laboratorios de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 2,1 GB (i1-Q2_K) y 3,7 GB (i1-Q6_K) solo para los pesos; se debe añadir memoria para el contexto y overhead del runtime.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, el modelo puede ejecutarse en GPU de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4090, así como en A100 o H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: sí, prácticamente cualquier GPU con 4 GB o más de VRAM puede cargar las cuantizaciones más pequeñas; las cuantizaciones Q5 y Q6 requieren al menos 4-5 GB.
- Opciones de despliegue: llama.cpp, Ollama, y otros runtimes compatibles con GGUF. El repositorio también menciona compatibilidad con text-generation-inference y transformers para el modelo base.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Especialización |
|---|---|---|---|---|---|
| Qwensploit-V2-4B-CyberSecurity-Qwen3.5-i1-GGUF | 4,3 mil millones | no disponible | other | GGUF | Ciberseguridad |
| Qwen3.5-4B (base) | ~4 mil millones | no disponible | no disponible | safetensors | Generalista |
| Modelos de seguridad de 7B-8B (p. ej., fine-tunes de Llama/Mistral) | 7-8 mil millones | variable | variable | GGUF/safetensors | Ciberseguridad |

No se dispone de datos de rendimiento comparativo en la información proporcionada. La comparativa se limita a parámetros, formato y especialización. No se han identificado alternativas exactas con las mismas características en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información proporcionada; al ser un modelo entrenado con datasets de ciberseguridad, puede presentar sesgos hacia escenarios ofensivos y terminology técnica específica.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información incorrecta o inventada, especialmente en detalles técnicos de vulnerabilidades o exploits; se recomienda verificación humana en entornos de producción.
- Limitaciones de contexto o idioma: el modelo está declarado únicamente para inglés; no se especifica la longitud de contexto, lo que limita su uso en tareas que requieran ventanas largas.
- Restricciones de licencia: la licencia es "other", lo que implica que el uso comercial puede estar restringido o requerir condiciones específicas; es imprescindible consultar la licencia del modelo base (xtools-at/Qwensploit-V2-4B-CyberSecurity-Qwen3.5) antes de cualquier despliegue comercial.
- Caveat para producción: el modelo está especializado en ciberseguridad ofensiva; su uso debe limitarse a entornos autorizados y con fines legales (auditorías, formación, CTF). No se debe emplear para actividades ilícitas.
- La cuantización puede degradar la calidad respecto al modelo base en safetensors; se recomienda probar varias cuantizaciones (especialmente IQ4_XS o Q4_K_M) para equilibrar tamaño y fidelidad.
- No se dispone de información sobre el soporte real de visión en esta cuantización; la model card menciona que los archivos mmproj estarían en el repositorio estático, pero no se confirma su presencia en este repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwensploit-V2-4B-CyberSecurity-Qwen3.5-i1-GGUF
- Modelo base: https://huggingface.co/xtools-at/Qwensploit-V2-4B-CyberSecurity-Qwen3.5
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Qwensploit-V2-4B-CyberSecurity-Qwen3.5-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwensploit-V2-4B-CyberSecurity-Qwen3.5-i1-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
