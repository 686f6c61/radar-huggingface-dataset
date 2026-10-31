# mradermacher/KAT-Ornith-HERO-35B-A3B-Fusion-GGUF

## Resumen

KAT-Ornith-HERO-35B-A3B-Fusion es un modelo de lenguaje de tipo mezcla de expertos (MoE) basado en la arquitectura Qwen3.5 MoE, desarrollado por OliviaRossi como una fusión (merge) orientada a código, agentes y razonamiento. El repositorio aquí descrito no es el modelo original, sino la colección de cuantizaciones estáticas en formato GGUF publicada por mradermacher, un cuantizador muy conocido en el ecosistema open source que facilita la ejecución local de grandes modelos.

El sufijo "A3B" indica que, de los aproximadamente 35,5 mil millones de parámetros totales, solo alrededor de 3 mil millones se activan por token, lo que permite obtener la capacidad de un modelo de 35B con el coste de inferencia de uno mucho más pequeño. Esto lo hace especialmente atractivo para su ejecución en hardware de consumo o en servidores modestos.

Este tipo de repositorios de cuantizaciones es relevante porque reduce la barrera de entrada para probar modelos fusionados recientes: en lugar de necesitar ~70 GB de VRAM o RAM para los pesos en precisión original, se puede ejecutar desde ~13 GB (Q2_K) hasta ~38 GB (Q8_0) según el compromiso calidad/tamaño elegido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (basada en Qwen3.5 MoE), fusión de modelos (merge) |
| Parámetros totales | 35.505.251.456 (~35,5 B) |
| Parametros activos | ~3 B (indicado por el sufijo A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (también imatrix/weighted en repo aparte) |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo); el modelo base está en safetensors |

## Arquitectura y entrenamiento

El modelo base es una fusión (merge) de varios modelos sobre la arquitectura Qwen3.5 MoE. En una mezcla de expertos, cada token se enruta a un subconjunto reducido de expertos, de modo que aunque el modelo alberga 35,5 mil millones de parámetros, solo unos 3 mil millones participan activamente en cada paso de decodificación. Esto se traduce en una latencia y un consumo de memoria de inferencia mucho menores que los de un modelo denso equivalente.

Al tratarse de una fusión de modelos, no hay datos publicados sobre un entrenamiento propio desde cero: no se dispone de información sobre número de tokens, composición del dataset ni procesos de RLHF/DPO. Las etiquetas de la model card (code, agent, reasoning) sugieren que los modelos fuente de la fusión estaban especializados en programación, uso de herramientas y razonamiento, pero el método exacto de fusión no está documentado en la información disponible.

Las cuantizaciones de este repositorio son estáticas (convertidas desde los pesos HF originales), y mradermacher publica además una versión con cuantizaciones ponderadas/imatrix de mayor calidad en un repositorio complementario.

## Capacidades

- Generación de texto conversacional (etiqueta "conversational" en el repo)
- Generación y comprensión de código, según las etiquetas de la model card
- Razonamiento (reasoning), según las etiquetas de la model card
- Uso como agente (etiqueta "agent"), aunque no hay documentación específica sobre tool calling
- Ejecución local eficiente gracias al formato GGUF y a la naturaleza MoE con ~3B de parámetros activos
- Compatible con endpoints estándar de inferencia (endpoints_compatible)

## Casos de uso

- Programación asistida en local: con las etiquetas de código y razonamiento, es adecuado para autocompletado, refactorización y explicación de código sin depender de servicios en la nube, ejecutándose en una GPU de consumo con la variante Q4_K_M (~21,8 GB).
- Agentes locales con herramientas: la etiqueta "agent" indica idoneidad para flujos multi-paso; con ~3B de parámetros activos, la latencia por token es baja, algo crítico en bucles de agente con muchas iteraciones.
- Chatbot autoalojado: al ser conversacional y estar en GGUF, puede desplegarse con llama.cpp, Ollama o LM Studio para asistentes privados que no envían datos a terceros.
- Experimentación con modelos fusionados: al ser una fusión reciente y libre (Apache 2.0), es útil para investigar cómo afectan las fusiones a las capacidades de razonamiento y código en arquitecturas MoE.
- Procesamiento por lotes en hardware modesto: el bajo número de parámetros activos permite un throughput razonable en servidores sin GPUs de gama alta, útil para tareas de clasificación o extracción a escala.
- Prototipado de aplicaciones con LLM: la licencia Apache 2.0 permite integrarlo en productos comerciales sin restricciones, ideal para validar ideas antes de invertir en modelos mayores.
- Uso en portátiles de gama alta o mini-PC con GPU: la variante Q2_K (13,3 GB) cabe en GPUs con 16 GB de VRAM, aunque con pérdida notable de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de una fusión de modelos, tampoco hay una model card detallada del modelo base con evaluaciones. No se deben asumir números de MMLU, HumanEval u otros benchmarks sin fuentes verificables.

## Requisitos de hardware

- VRAM estimada según cuantización (tamaños de archivo):
  - Q2_K: 13,3 GB — cabe en GPUs de 16 GB (RTX 4060 Ti 16GB, RTX 4080, RTX 5070 Ti)
  - Q3_K_M: 17,3 GB — GPUs de 24 GB (RTX 3090, RTX 4090, RTX 5090)
  - Q4_K_S / Q4_K_M: 20,5-21,8 GB — RTX 3090/4090 (24 GB), recomendadas por el autor
  - Q6_K: 29,3 GB — RTX 4090 con descarga parcial a RAM, o GPUs de 32-48 GB (A6000, L40S)
  - Q8_0: 37,9 GB — A100 40GB, A6000 48GB, o multi-GPU
- Al ser un MoE con ~3B de parámetros activos, es viable también la ejecución en CPU con RAM suficiente (por ejemplo, 32 GB para Q4_K_M), aunque con menor velocidad
- GPUs recomendadas: RTX 3090/4090 para las cuantizaciones intermedias; A100 o H100 para las variantes de mayor calidad con contexto largo
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, KoboldCpp; el modelo base en safetensors puede servirse con vLLM o TGI
- Latencia y throughput: no disponibles como cifras concretas; el bajo número de parámetros activos (~3B) sugiere velocidades de generación comparables a modelos densos de ese tamaño

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KAT-Ornith-HERO-35B-A3B-Fusion | ~35,5 B | ~3 B | no disponible | Apache 2.0 | GGUF y safetensors en HuggingFace |
| Qwen3-30B-A3B | ~30 B | ~3 B | 32K (128K con YaRN) | Apache 2.0 | GGUF, safetensors, amplio soporte |
| Qwen3-32B (denso) | ~32 B | 32 B | 32K (128K con YaRN) | Apache 2.0 | GGUF, safetensors, amplio soporte |

La comparativa se centra en la familia Qwen3, ya que este modelo se basa en la arquitectura Qwen3.5 MoE. Frente a Qwen3-30B-A3B comparte el enfoque MoE con ~3B de parámetros activos, pero añade la especialización en código y agentes de la fusión; frente al Qwen3-32B denso, ofrece una inferencia mucho más rápida a costa de una capacidad teórica menor por token. Rendimiento comparado: no disponible.

## Limitaciones y advertencias

- Idioma: la model card declara únicamente el inglés; el rendimiento en castellano no está documentado y puede ser inferior al de modelos con soporte multilingüe explícito
- Al ser una fusión de modelos, no hay datos de entrenamiento ni evaluaciones publicadas: el comportamiento puede ser impredecible y no se ha validado con benchmarks públicos
- Riesgo de alucinación: no evaluado; como en cualquier LLM, las salidas deben verificarse, especialmente en código y razonamiento
- Las cuantizaciones bajas (Q2_K, Q3_K_S/M) degradan apreciablemente la calidad, especialmente en tareas de razonamiento y código
- Longitud de contexto no documentada: verificarla antes de diseñar aplicaciones que dependan de documentos largos
- La licencia Apache 2.0 es permisiva y permite uso comercial, pero conviene revisar las licencias de los modelos fuente de la fusión si se distribuye un derivado
- Repositorio de cuantización de terceros: mradermacher no es el autor del modelo; cualquier bug del modelo base no se corrige en este repo
- No hay soporte documentado de capacidades multimodales (visión, audio); el repo indica skip_mmproj, lo que sugiere que no se incluyen proyectores multimodales

## Enlaces

- Repositorio GGUF (cuantizaciones estáticas): https://huggingface.co/mradermacher/KAT-Ornith-HERO-35B-A3B-Fusion-GGUF
- Repositorio GGUF con imatrix (cuantizaciones ponderadas): https://huggingface.co/mradermacher/KAT-Ornith-HERO-35B-A3B-Fusion-i1-GGUF
- Modelo base (OliviaRossi): https://huggingface.co/OliviaRossi/KAT-Ornith-HERO-35B-A3B-Fusion
- Página de descargas de mradermacher: https://hf.tst.eu/model#KAT-Ornith-HERO-35B-A3B-Fusion-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador (nethype GmbH): https://www.nethype.de/
