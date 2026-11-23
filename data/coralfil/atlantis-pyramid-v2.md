# Coralfil/Atlantis-Pyramid-v2

## Resumen

Atlantis-Pyramid v2 es un modelo de lenguaje de 32.500 millones de parámetros desarrollado por Coralfil Inc. (Victoria, Columbia Británica, Canadá) y presentado como un modelo fundacional "soberano" orientado a oceanografía marina, cumplimiento normativo costero e inteligencia ambiental bentónica. Según su model card, parte de una arquitectura transformer autorregresiva densa con atención de ventana deslizante y embeddings posicionales rotatorios, y se distribuye como adaptadores PEFT (librería `peft`, formato safetensors) sobre los modelos Qwen2.5-32B-Instruct y DeepSeek-R1-Distill-Qwen-32B.

El modelo se posiciona frente al problema de las alucinaciones de los modelos generalistas al razonar sobre códigos legales marítimos densos (Fisheries Act, Species at Risk Act, Oceans Act de Canadá) y sobre condiciones físicas de contorno bentónicas. Para ello declara integrar priors geométricos equivariantes SE(3), restricciones termodinámicas TEOS-10 y jurisprudencia costera bilingüe inglés-francés. Su relevancia actual reside en la propuesta de un modelo de dominio vertical con licencia Apache 2.0 y un supuesto despliegue en una única GPU de 24 GB en cuantización AWQ/FP8.

Conviene señalar desde el inicio que la información disponible es exclusivamente la publicada por el autor: no hay verificación independiente de los benchmarks declarados, el repositorio ocupa solo 0,3 GB (compatible con adaptadores LoRA, no con pesos completos de 32B) y la model card combina afirmaciones técnicas con certificaciones ("CSL-2+") que no se corresponden con ningún marco regulatorio conocido. La ficha refleja estos datos tal cual, marcando explícitamente lo que no está verificado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo denso con atención de ventana deslizante y embeddings posicionales rotatorios (declarado) |
| Parámetros totales | 32.500 millones (32,5B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (según el ejemplo de despliegue con `--max-model-len 8192`) |
| Tipos de cuantización | AWQ, FP8 (declarados); FP16/BF16 en nodos multi-GPU |
| Idiomas soportados | Inglés (en) y francés (fr) según la model card; el campo `language` del repo solo lista `en` |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT sobre Qwen2.5-32B-Instruct y DeepSeek-R1-Distill-Qwen-32B) |

## Arquitectura y entrenamiento

La model card describe un transformer autorregresivo denso de 32,5B parámetros con atención de ventana deslizante y RoPE. El repositorio, sin embargo, se distribuye como adaptadores PEFT sobre dos modelos base (Qwen2.5-32B-Instruct y DeepSeek-R1-Distill-Qwen-32B), lo que implica que la arquitectura efectiva hereda la de dichos modelos y que el ajuste se aplica como fine-tuning paramétricamente eficiente. No se especifica el rango, el alpha ni las capas objetivo de los adaptadores.

El autor declara la integración de tres componentes diferenciales: priors geométricos equivariantes SE(3) para modelado bentónico, restricciones termodinámicas TEOS-10 para la ecuación de densidad del agua de mar, y corpus jurídico costero canadiense bilingüe. No se publica el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o supervisión humana. Tampoco se detalla metodología de decodificación especulativa, atención lineal ni otras innovaciones de inferencia. Todos estos datos deben considerarse no disponibles.

## Capacidades

- Generación de texto conversacional en inglés y francés, con formato de chat tipo ChatML (`<|im_start|>` / `<|im_end|>`).
- Razonamiento sobre normativa marítima canadiense: citación de secciones concretas de la Fisheries Act (Sec. 35(2), 56) y SARA (Sec. 73).
- Cálculo y razonamiento sobre invariantes hidrodinámicos bentónicos y ecuación de densidad TEOS-10 (declarado).
- Evaluación de impedancia acústica según ASTM E1050 y atenuación sonora (declarado).
- Razonamiento de tipo cadena de pensamiento heredado potencialmente de DeepSeek-R1-Distill-Qwen-32B (no confirmado en la model card).
- Soporte de tool calling / function calling: no disponible (no se menciona en la información).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se menciona explícitamente).
- Capacidades multimodales (visión, audio): no disponibles; el modelo es solo texto.
- Capacidades multilingües: limitadas a inglés y francés según la model card.

## Casos de uso

- **Revisión de permisos costeros**: el modelo puede redactar y verificar borradores de solicitudes de permiso citando secciones concretas de la Fisheries Act y SARA, reduciendo el tiempo de revisión legal preliminar en consultoras ambientales canadienses.
- **Evaluación de impacto bentónico**: dado un conjunto de parámetros oceanográficos (temperatura, salinidad, presión), el modelo puede razonar sobre anomalías de densidad TEOS-10 y señalar inconsistencias físicas en informes de dragado o vertido.
- **Atenuación acústica en proyectos offshore**: soporte en la preparación de documentación ASTM E1050, interpretando resultados de impedancia y verificando que la atenuación declarada (-14,2 dB en el ejemplo del autor) cumple los umbrales regulatorios.
- **Asistencia a biólogos marinos**: consultas en lenguaje natural sobre hábitats bentónicos, zonas de amortiguamiento (por ejemplo, arrecifes de esponjas de vidrio en el Estrecho de Georgia) y especies en riesgo, con contexto de hasta 8.192 tokens para informes extensos.
- **Generación de documentación bilingüe**: redacción y traducción de informes técnicos inglés-francés para administraciones canadienses que exigen ambos idiomas oficiales.
- **Formación y concienciación normativa**: generación de escenarios de evaluación y preguntas de examen para equipos que deben conocer la normativa marítima, usando el modelo como generador de casos con citas verificables.
- **Preprocesado de series temporales oceanográficas**: etiquetado y resumen en lenguaje natural de series de datos de boyas y sensores, aprovechando el ajuste declarado en time-series (si bien el modelo es de texto y no procesa series directamente).

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Categoría | Escenarios | Métrica | Valor | Invariante evaluado |
|---|---|---|---|---|
| Statutory & Regulatory | 52 | Accuracy | 98,51% | Citas de Fisheries Act Sec. 35(2)/56 y SARA Sec. 73 |
| Acoustic Impedance | 48 | Accuracy | 98,51% | ASTM E1050; atenuación -14,2 dB |
| Benthic Hydrodynamics | 100 | Accuracy | 98,50% | Ecuación TEOS-10 de densidad; cero deriva energética |
| **Compuesto (AboveBoard-200)** | **200** | **Accuracy** | **98,51%** | Certificación "CSL-2+" |

No se han publicado resultados en benchmarks estándar de la industria (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- **VRAM para inferencia**: el autor declara un footprint de 18,24 GB en cuantización AWQ o FP8, lo que permitiría ejecución en una única GPU de 24 GB. En FP16/BF16 se requerirían aproximadamente 65 GB, por lo que harían falta nodos multi-GPU.
- **GPU recomendadas**: NVIDIA A10 (24 GB) o RTX 4090 para AWQ/FP8 según el autor; A100 40/80 GB o H100 para FP16.
- **GPU de consumo**: sí, una RTX 4090 (24 GB) sería suficiente en AWQ/FP8 según la model card; una RTX 3090 (24 GB) también encajaría en teoría.
- **Despliegue**: vLLM (ejemplo oficial con `--gpu-memory-utilization 0.90 --max-model-len 8192`), Hugging Face Transformers con `device_map="auto"`. No se mencionan llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no disponibles en la información proporcionada.
- **Nota**: dado que el repositorio contiene adaptadores PEFT de 0,3 GB, el despliegue real requiere cargar además el modelo base de 32B, lo que condiciona el footprint real de memoria.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Atlantis-Pyramid v2 | 32,5B (adaptadores) | 8.192 | Apache 2.0 | Dominio marino y normativa canadiense | Hugging Face |
| Qwen2.5-32B-Instruct | 32,5B | 32.768 (según modelo base) | Apache 2.0 | Propósito general | Hugging Face |
| DeepSeek-R1-Distill-Qwen-32B | 32,5B | 32.768 (según modelo base) | MIT (según modelo base) | Razonamiento | Hugging Face |

Los dos modelos base son las alternativas naturales, ya que Atlantis-Pyramid v2 se distribuye como adaptadores sobre ellos. No se dispone de datos de benchmarks comparables entre los tres modelos en la información proporcionada, más allá de los resultados autoinformados del modelo. Para modelos de dominio marino específico no se han identificado alternativas públicas en la información disponible.

## Limitaciones y advertencias

- **Benchmarks no verificados**: los resultados de AboveBoard-200 son autoinformados (`verified: false`) y no han sido replicados de forma independiente; el benchmark parece ser de creación propia del autor.
- **Discrepancia de tamaño**: el repositorio ocupa 0,3 GB, coherente con adaptadores LoRA, no con pesos completos de 32B. No se documenta el procedimiento de fusión ni el rango de los adaptadores.
- **Certificaciones no reconocidas**: la "certificación CSL-2+" y el "clearance level" no corresponden a ningún marco regulatorio canadiense conocido; deben tratarse como afirmaciones de marketing sin validez legal.
- **Idiomas**: el campo `language` del repositorio solo lista `en`, aunque la model card añade `fr`. No hay evidencia de capacidades multilingües más allá de esos dos idiomas.
- **Riesgo de alucinación**: a pesar de la afirmación de "zero hallucinations" en materia legal, no existe garantía independiente; en aplicaciones normativas cualquier salida debe ser revisada por un profesional cualificado.
- **Contexto limitado**: 8.192 tokens es reducido frente a los 32K de los modelos base, lo que limita el análisis de expedientes legales extensos.
- **Uso comercial**: la licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen2.5-32B-Instruct y DeepSeek-R1-Distill-Qwen-32B conviene verificar las condiciones de los modelos base (especialmente la cláusula de atribución de DeepSeek).
- **Sesgos**: no se documenta ninguna evaluación de sesgos ni de robustez fuera del dominio marino.
- **Mantenimiento**: 0 likes y 558 descargas en el momento de la consulta; autor único sin historial público verificable de publicaciones en el dominio.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Coralfil/Atlantis-Pyramid-v2)
- [Sitio web del proyecto](https://atlantis-llm.io)
- [Coralfil Labs](https://labs.coralfil.com)
- [ORCID del autor principal (Roland Poulin)](https://orcid.org/0009-0009-8065-0620)
- [Modelo base Qwen2.5-32B-Instruct](https://huggingface.co/Qwen/Qwen2.5-32B-Instruct)
- [Modelo base DeepSeek-R1-Distill-Qwen-32B](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-32B)
