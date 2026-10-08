# OpenFlowLM/Gemma4-E4B-IT-NPU2

## Resumen

OpenFlowLM/Gemma4-E4B-IT-NPU2 es un ajuste fino multimodal publicado por OpenFlowLM sobre google/gemma-4-E4B-it, el modelo de instrucciones de la rama E4B de la familia Gemma 4 desarrollada por Google DeepMind. El sufijo "NPU2" y la etiqueta any-to-any apuntan a una variante orientada a despliegue en aceleradores de inferencia (NPU) y a procesamiento de texto, imagen y audio, aunque la model card no documenta el procedimiento de ajuste ni las modificaciones concretas aplicadas por OpenFlowLM.

El modelo hereda la arquitectura de Gemma 4 E4B: un transformer denso con atencion hibrida que combina ventanas locales deslizantes con atencion global, embeddings por capa (PLE) y una ventana de contexto de 128K tokens. Con 4.5B de parametros efectivos (8B incluyendo embeddings), vision encoder de ~150M y audio encoder de ~300M, esta pensado para ejecucion local en portatiles y dispositivos moviles manteniendo soporte multimodal completo.

Es relevante porque la rama E4B de Gemma 4 cubre el segmento de dispositivos con recursos limitados (edge y consumer), un nicho donde el equilibrio entre tamano efectivo, multimodalidad nativa y ventana de contexto larga es escaso. La licencia Apache 2.0 facilita su uso comercial, si bien el repositorio presenta cero descargas y cero likes en el momento de redactar esta ficha, por lo que no existe validacion de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion hibrida (sliding window local + atencion global) y Per-Layer Embeddings (PLE) |
| Parametros totales | 8B (incluyendo embeddings); 4.5B efectivos |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K tokens (ventana deslizante de 512 tokens) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | No disponible (la familia Gemma 4 declara soporte para mas de 140 idiomas, sin desglose especifico para este ajuste) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers; tamano del repositorio 9,1 GB) |
| Modelo base | google/gemma-4-E4B-it |
| Modalidades | Texto, imagen y audio (any-to-any, salida de texto) |
| Tamano del repositorio | 9,1 GB |
| Biblioteca | transformers |
| Pipeline | any-to-any |

## Arquitectura y entrenamiento

El modelo base Gemma 4 E4B emplea una arquitectura de transformer denso con atencion hibrida: la mayoria de capas usan atencion de ventana deslizante local (512 tokens) mientras que determinadas capas aplican atencion global, garantizando que la ultima capa sea siempre global. Para reducir el consumo de memoria en contexto largo, las capas globales unifican claves y valores y aplican Proportional RoPE (p-RoPE). La rama E4B incorpora Per-Layer Embeddings (PLE), que asigna a cada capa decodificadora su propia tabla de embedding por token; estas tablas son grandes pero solo se usan para consultas rapidas, por lo que el numero de parametros efectivos (4.5B) es muy inferior al total (8B con embeddings). El modelo consta de 42 capas, vocabulario de 262K tokens, vision encoder de ~150M de parametros y audio encoder de ~300M.

En cuanto al entrenamiento, la model card de Google DeepMind indica que toda la familia Gemma 4 se disena como modelos razonadores con modos de pensamiento configurables, soporte nativo del rol system y function calling, pero no se detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Para esta variante concreta de OpenFlowLM no se documenta el procedimiento de ajuste fino, el dataset empleado, ni las modificaciones orientadas a NPU que sugiere el sufijo "NPU2"; toda esa informacion figura como no disponible.

## Capacidades

- Generacion de texto en modo conversacional con soporte nativo del rol `system` para conversaciones estructuradas y controlables.
- Razonamiento con modos de pensamiento configurables (thinking modes), orientado a tareas de logica y matematicas.
- Comprension multimodal de imagen con soporte de relacion de aspecto y resolucion variable.
- Procesamiento de audio nativo en la rama E4B (audio encoder de ~300M de parametros).
- Generacion y asistencia en codigo, con mejoras declaradas en benchmarks de programacion.
- Function calling y tool calling nativos, orientados a flujos de agentes autonomos.
- Capacidades multilingues (la familia declara mas de 140 idiomas, sin desglose para este ajuste).
- Salida any-to-any: acepta texto, imagen y audio, y genera texto.
- Ventana de contexto de 128K tokens, adecuada para conversaciones multi-turno y documentos largos.

## Casos de uso

- Asistente conversacional en dispositivo: con 4.5B de parametros efectivos, el modelo puede ejecutarse localmente en portatiles y moviles gestionando dialogos multi-turno con contexto de hasta 128K tokens sin depender de la nube.
- Analisis de imagenes en el borde: gracias al vision encoder de ~150M y al soporte de resolucion variable, permite clasificar, describir o extraer informacion de imagenes en aplicaciones de campo sin conexion.
- Transcripcion y comprension de audio: el audio encoder nativo (~300M) habilita asistentes de voz, resumen de reuniones o accesibilidad para personas con discapacidad visual en hardware de consumo.
- Agentes autonomos con tool calling: el soporte nativo de function calling permite construir agentes de varios pasos que consultan APIs, bases de datos o servicios externos.
- Generacion de codigo asistida: con mejoras declaradas en benchmarks de programacion y ventana larga, es utilizable en editores y pipelines de CI/CD para revision y autocompletado de codigo.
- Razonamiento matematico y analitico: los modos de pensamiento configurables permiten resolver problemas de varios pasos activando la "cadena de pensamiento" solo cuando es necesario.
- Atencion al cliente automatizada: la ventana de 128K tokens permite mantener contexto de historiales largos y multiples interacciones en un unico agente desplegado en infraestructura modesta.
- Procesamiento documental multimodal en edge: combinacion de texto e imagen para digitalizar y resumir documentos escaneados en entornos con requisitos de privacidad (procesamiento 100% local).

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden a la familia Gemma 4 (modelos instruction-tuned). La variante E4B es la relevante para este ajuste.

| Benchmark | Gemma 4 E4B | Gemma 4 E2B | Gemma 4 26B A4B | Gemma 4 31B | Gemma 3 27B (no think) |
|---|---|---|---|---|---|
| MMLU Pro | 69,4% | 60,0% | 82,6% | 85,2% | 67,6% |
| AIME 2026 (sin herramientas) | 42,5% | 37,5% | 88,3% | 89,2% | 20,8% |
| LiveCodeBench v6 | No disponible | No disponible | 77,1% | 80,0% | No disponible |

Nota: los datos de LiveCodeBench v6 para E4B y E2B no aparecen en el fragmento de model card disponible, y no se han publicado resultados de benchmarks especificos para el ajuste OpenFlowLM/Gemma4-E4B-IT-NPU2. No se deben extrapolar los numeros del modelo base al ajuste sin validacion.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: en torno a 16 GB considerando los 8B de parametros totales (incluyendo embeddings), mas overhead de vision y audio encoders.
- VRAM estimada en INT8: aproximadamente 8-9 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 5-6 GB.
- GPU recomendadas: para precision completa, A100 40GB, H100 o RTX 4090 (24 GB); para cuantizacion de 4 bits, RTX 3060 12 GB o superior.
- Compatibilidad con GPU de consumo: si, en tarjetas con al menos 8-12 GB de VRAM segun cuantizacion; encaja en RTX 4060 Ti 16GB, RTX 4070, RTX 4080 y RTX 4090.
- Despliegue: al ser un modelo transformers con pesos safetensors, es compatible con vLLM, Text Generation Inference (TGI), llama.cpp y Ollama (previa conversion a GGUF). El sufijo "NPU2" sugiere soporte para aceleradores NPU, aunque no se detalla en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Notas |
|---|---|---|---|---|---|
| OpenFlowLM/Gemma4-E4B-IT-NPU2 | 4.5B efectivos (8B totales) | 128K | Texto, imagen, audio | Apache 2.0 | Ajuste de terceros, sin descargas ni validacion comunitaria |
| Gemma 4 E4B (base) | 4.5B efectivos (8B totales) | 128K | Texto, imagen, audio | Apache 2.0 | Modelo oficial de Google DeepMind, con benchmarks publicados |
| Gemma 4 E2B (base) | 2.3B efectivos (5.1B totales) | 128K | Texto, imagen, audio | Apache 2.0 | Version mas ligera, MMLU Pro 60,0% |
| Gemma 4 26B A4B (MoE) | 25.2B totales / 3.8B activos | 256K | Texto, imagen | Apache 2.0 | Mejor rendimiento por token activo, sin audio |

La comparacion directa con alternativas de otros fabricantes (por ejemplo, modelos del segmento 3-8B de otras familias) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No hay informacion publica sobre el procedimiento de ajuste, el dataset ni los objetivos de OpenFlowLM/Gemma4-E4B-IT-NPU2; se desconoce si el ajuste degrada alguna capacidad del modelo base.
- El repositorio registra cero descargas y cero likes, por lo que carece de validacion por parte de la comunidad y de reportes independientes de calidad.
- No se han publicado benchmarks propios del ajuste; los numeros de la model card corresponden al modelo base de Google.
- Riesgo de alucinacion inherente a los modelos generativos; en tareas factuales conviene verificar las salidas.
- La ventana de contexto es de 128K tokens, inferior a los 256K de las variantes 26B A4B y 31B de la misma familia.
- El soporte de idiomas no se detalla para este ajuste (la familia declara 140+ idiomas, pero sin garantia de rendimiento uniforme).
- La licencia Apache 2.0 permite uso comercial, aunque conviene revisar el enlace de licencia de Gemma 4 (https://ai.google.dev/gemma/docs/gemma_4_license) por posibles terminos adicionales de uso responsable.
- Al tratarse de una variante orientada a NPU, es posible que algunos formatos de pesos no sean directamente compatibles con todos los motores de inferencia estandar.
- No se especifican sesgos conocidos concretos para este ajuste; los sesgos heredados de los datos de entrenamiento del modelo base no estan documentados en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OpenFlowLM/Gemma4-E4B-IT-NPU2
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Coleccion Gemma 4 en HuggingFace: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentacion de Gemma: https://ai.google.dev/gemma/docs/core
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de modelos Gemma de Google DeepMind: https://deepmind.google/models/gemma/
