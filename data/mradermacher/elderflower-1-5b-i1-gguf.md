# mradermacher/Elderflower-1.5B-i1-GGUF

## Resumen

Elderflower-1.5B-i1-GGUF es una colección de cuantizaciones imatrix (importance matrix) del modelo Elderflower-1.5B de Noid3a-Labs, publicada por el cuantizador mradermacher. El modelo base es un LLM compacto de aproximadamente 1.78 mil millones de parámetros, etiquetado con las capacidades de matemáticas y razonamiento, y con indicios de una genealogía basada en Qwen y DeepSeek (tags `qwen`, `deepseek`, `chatml`). Su valor principal es permitir la ejecución local del modelo en hardware modesto, con ficheros que van desde 0,6 GB (IQ1_S) hasta 1,6 GB (Q6_K).

Este repositorio no es un modelo nuevo, sino una republicación optimizada para inferencia con llama.cpp y herramientas compatibles con GGUF. Las cuantizaciones i1 (imatrix) suelen ofrecer mejor calidad por byte que las cuantizaciones estáticas equivalentes, ya que la matriz de importancia se calcula a partir de datos de activación reales. Para cargas de trabajo que no requieran cuantización, existe también la versión de cuants estáticos en mradermacher/Elderflower-1.5B-GGUF.

Su relevancia actual radica en la tendencia hacia modelos pequeños especializados en razonamiento y matemáticas, ejecutables en portátiles, Raspberry Pi o móviles, sin depender de GPUs de gama alta ni de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen/DeepSeek según tags; detalle exacto no disponible) |
| Parametros totales | 1.777.088.000 (~1,78 B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuants imatrix); el modelo base está disponible en safetensors |

## Arquitectura y entrenamiento

El modelo base, Noid3a-Labs/Elderflower-1.5B, es un transformer decoder-only de unos 1,78 mil millones de parámetros. Los tags del repositorio (`qwen`, `deepseek`, `chatml`) sugieren que deriva de o está destilado de arquitecturas o modelos de las familias Qwen y DeepSeek, y que utiliza el formato de plantilla ChatML para conversación. Los detalles concretos de la arquitectura (número de capas, cabezas de atención, dimensiones ocultas) no están disponibles en la información proporcionada.

No se dispone de datos sobre el proceso de entrenamiento del modelo base: número de tokens, composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Lo que sí está documentado es el proceso de cuantización: mradermacher emplea cuantización con matriz de importancia (imatrix), que pondera la cuantización según la sensibilidad real de cada tensor durante la inferencia, produciendo ficheros de menor tamaño con degradación de calidad menor que las cuantizaciones estáticas equivalentes.

## Capacidades

- Generación de texto conversacional en inglés, con formato ChatML.
- Razonamiento matemático: el modelo está etiquetado explícitamente con `math` y `reasoning`.
- Razonamiento general en cadenas de pensamiento (chain-of-thought), según sugieren los tags de razonamiento.
- Ejecución local eficiente gracias a las 23 variantes de cuantización disponibles, desde 0,6 GB hasta 1,6 GB.
- Compatibilidad con el ecosistema llama.cpp y herramientas derivadas (Ollama, LM Studio, etc.).
- No hay evidencia de capacidades de visión, audio, tool calling ni agentes en la información disponible.

## Casos de uso

- Resolución de problemas matemáticos en local: el modelo está etiquetado para matemáticas y razonamiento, por lo que puede integrarse en herramientas de ayuda a los deberes o calculadoras simbólicas asistidas por LLM, ejecutándose incluso en portátiles sin GPU dedicada con el cuant Q4_K_M (1,2 GB).
- Asistentes conversacionales ligeros: con formato ChatML y etiqueta `conversational`, es adecuado para chatbots locales de una sola área temática donde el coste de un modelo grande no se justifica.
- Prototipado de pipelines de razonamiento: su pequeño tamaño permite experimentar con técnicas como self-consistency o muestreo múltiple a bajo coste, generando decenas de cadenas de razonamiento por segundo en una GPU de consumo.
- Despliegue en edge y dispositivos embebidos: los cuants IQ1_S/IQ2_XXS (0,6-0,7 GB) permiten ejecutar el modelo en placas como Raspberry Pi 5 o en móviles, útil para demos y kioscos sin conectividad.
- Generación sintética de datos de razonamiento: puede usarse como modelo barato para preetiquetar o generar problemas matemáticos con soluciones paso a paso en pipelines de destilación.
- Evaluación comparativa de cuantizaciones: al disponer de 23 variantes imatrix del mismo modelo, es un banco de pruebas útil para estudiar la degradación de calidad en matemáticas según el nivel de cuantización.
- RAG ligero en inglés: combinado con un retriever local, puede responder preguntas sobre documentos en un portátil, aunque su contexto (no disponible) debe verificarse antes de asumir ventanas largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, GSM8K, HumanEval ni de ninguna otra evaluación, ni para el modelo base ni para las cuantizaciones.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el tamaño del fichero es una aproximación directa del requisito de memoria. Cuant Q4_K_M: ~1,2 GB; Q6_K: ~1,6 GB; IQ1_S: ~0,6 GB. Añadir margen para el KV cache según la longitud de contexto utilizada.
- GPU recomendadas: no se requiere GPU. Cualquier GPU moderna con 2-4 GB de VRAM (por ejemplo, GTX 1650, RTX 3060, RTX 4060) ejecuta el modelo con holgura; también funciona por CPU puro.
- Consumer GPUs: cabe sobradamente en prácticamente cualquier GPU de consumo actual e incluso en portátiles sin GPU dedicada (solo CPU y RAM del sistema).
- Opciones de despliegue: llama.cpp (destinatario natural del formato GGUF), Ollama, LM Studio, kcpp/koboldcpp y cualquier runtime compatible con GGUF. No está orientado a vLLM o TGI, que trabajan mejor con pesos safetensors del modelo base.
- Latencia y throughput: no disponible. Dado el tamaño (1,78 B de parámetros), se espera inferencia muy rápida incluso en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad GGUF |
|---|---|---|---|---|
| Elderflower-1.5B (este) | 1,78 B | no disponible | Apache 2.0 | Sí (23 cuants imatrix) |
| Qwen2.5-1.5B-Instruct | 1,54 B | 128K | Qwen (Apache 2.0) | Sí (oficial y comunidad) |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,54 B | 131K | MIT | Sí (oficial y comunidad) |
| Phi-3.5-mini-instruct | 3,8 B | 128K | MIT | Sí |

Elderflower-1.5B compite en la categoría de modelos pequeños de razonamiento/matemáticas. Frente a Qwen2.5-1.5B y DeepSeek-R1-Distill-Qwen-1.5B ofrece una licencia permisiva equivalente (Apache 2.0), pero carece de la documentación de benchmarks y de la longitud de contexto publicada que sí tienen sus competidores, lo que dificulta la evaluación objetiva.

## Limitaciones y advertencias

- Idioma: el modelo está etiquetado solo para inglés; su rendimiento en castellano es desconocido y probablemente limitado.
- Contexto: la longitud de ventana no está documentada en este repositorio; debe consultarse la ficha del modelo base antes de diseñar aplicaciones con documentos largos.
- Alucinaciones: como todo LLM de 1,5-2 B, es propenso a alucinar, especialmente en razonamiento matemático complejo donde errores de cálculo se presentan con apariencia de certeza. Verificar siempre las salidas.
- Sesgos: no hay documentación sobre sesgos del modelo base; heredará los sesgos de sus datos de entrenamiento, que no están descritos.
- Calidad de cuantización: los cuants IQ1_S, IQ1_M y los niveles Q2 se describen explícitamente como de calidad muy baja ("for the desperate"); no usarlos en producción. Para producción se recomienda Q4_K_M o superior.
- Licencia: Apache 2.0 permite uso comercial sin restricciones destacables, pero conviene verificar la licencia y términos del modelo base Noid3a-Labs/Elderflower-1.5B.
- El repositorio es una cuantización de terceros: los problemas del modelo base (calidad, alineación) no se corrigen aquí, y mradermacher no ofrece soporte sobre el comportamiento del modelo, solo sobre los ficheros GGUF.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/mradermacher/Elderflower-1.5B-i1-GGUF
- Modelo base: https://huggingface.co/Noid3a-Labs/Elderflower-1.5B
- Cuants estáticos del mismo modelo: https://huggingface.co/mradermacher/Elderflower-1.5B-GGUF
- Página de descargas resumida: https://hf.tst.eu/model#Elderflower-1.5B-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa de mradermacher (nethype GmbH): https://www.nethype.de/
