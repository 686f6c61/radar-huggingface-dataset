# FlagRelease/MiniCPM5-2B-BF16-hygon-FlagOS

## Resumen

MiniCPM5-2B es un modelo de lenguaje de tipo edge desarrollado por ModelBest en colaboración con OpenBMB, presentado en el WAIC 2026 y liberado en abierto el 7 de septiembre. Con 2.516.756.480 parámetros totales, está diseñado para ejecutarse en dispositivos con recursos limitados como smartphones, PCs y sistemas de infoentretenimiento de automóviles, actuando como base para agentes de borde. Según la model card del autor, alcanzó una puntuación de 17 en el índice AA-Index de Artificial Analysis, situándose primero entre modelos de menos de 4B parámetros, y una media de 54,26 en varios benchmarks, superando a Qwen3.5-2B (41,66), Qwen3-1.7B (40,89) y Gemma-4-E2B-it (37,62).

El modelo soporta de forma nativa thinking híbrido, alternando entre respuestas rápidas y razonamiento profundo, y ofrece una ventana de contexto de 512K tokens. Incorpora capacidades de agente integradas que cubren tool calling, búsqueda profunda y generación de código. La versión concreta de esta ficha es `FlagRelease/MiniCPM5-2B-BF16-hygon-FlagOS`, un artefacto publicado por la plataforma FlagRelease que empaqueta los pesos BF16 del modelo junto con una pila de software FlagOS adaptada a aceleradores Hygon, validada frente a la pila nativa de Nvidia.

La relevancia de esta ficha radica en que demuestra el proceso de portabilidad de un modelo open source a hardware no Nvidia mediante la pila FlagOS (FlagScale, FlagGems, FlagCX, FlagTree), con validación de consistencia de rendimiento. La licencia Apache 2.0 facilita su uso comercial, aunque los pesos publicados aquí están orientados a despliegue en contenedores sobre Hygon, no a un uso genérico en GPUs de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia MiniCPM5; detalles internos no disponibles) |
| Parametros totales | 2.516.756.480 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 512K tokens |
| Tipos de cuantizacion | BF16 (pesos publicados); otras cuantizaciones no disponibles |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato llama) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna más allá de la familia MiniCPM5 y el formato de pesos tipo llama. Se conoce que el modelo incorpora thinking híbrido nativo, lo que implica un mecanismo de conmutación entre modos de respuesta rápida y razonamiento extendido, y una ventana de contexto de 512K tokens. No se especifican el número de capas, la dimensión oculta, el número de cabezas de atención ni si emplea atención lineal u otras variantes eficientes.

En cuanto al entrenamiento, la información disponible menciona que ModelBest liberó junto al modelo la tecnología UltraX de gobernanza de datos por niveles y una tecnología de entrenamiento de agentes de extremo a extremo, pero no se aportan cifras de tokens de entrenamiento, composición del dataset ni detalles sobre RLHF, DPO u otras fases de alineamiento. Tampoco se documentan innovaciones como decodificación especulativa. La model card sí describe la pila FlagOS con la que se ha validado el despliegue: FlagScale (framework distribuido de entrenamiento e inferencia), FlagGems (biblioteca de operadores en Triton), FlagCX (comunicación) y FlagTree (compilador unificado).

## Capacidades

- Generación de texto en chino e inglés.
- Razonamiento profundo mediante thinking híbrido, con conmutación entre respuesta rápida y razonamiento extendido.
- Tool calling y function calling integrados.
- Capacidades de agente: búsqueda profunda y razonamiento multi-paso.
- Generación de código.
- Razonamiento matemático, con resultados reportados en math_500.
- Contexto ultra largo de 512K tokens para conversaciones y documentos extensos.
- Despliegue como base de agentes de borde en smartphones, PCs y smart cockpits.
- Integración con servidores compatibles con la API de OpenAI (vLLM) y con clientes como AnythingLLM.

## Casos de uso

- Agente de borde en smartphones: el modelo puede ejecutarse como base de asistentes locales con tool calling y contexto de 512K tokens, permitiendo gestionar historiales largos y llamadas a APIs del dispositivo sin depender de la nube.
- Asistente en smart cockpits: con 2B parámetros y despliegue en contenedor sobre aceleradores Hygon, es adecuado para infoentretenimiento vehicular con respuestas rápidas y razonamiento puntual ante consultas complejas.
- Automatización de atención al cliente multi-turno: la ventana de 512K tokens permite mantener contexto de conversaciones extensas y documentación de producto, con soporte bilingüe chino-inglés.
- Generación de código en pipelines de desarrollo: sus capacidades de generación de código y tool calling permiten integrarlo en asistentes de IDE o en tareas de revisión y autocompletado dentro de flujos CI/CD.
- Búsqueda profunda sobre documentación corporativa: el modo de razonamiento extendido y el contexto largo facilitan tareas de recuperación y síntesis sobre grandes volúmenes de texto.
- Razonamiento matemático asistido: los resultados reportados en math_500 (92,4 en la variante Hygon-FlagOS) lo hacen apto para tutoría o verificación de cálculos en entornos educativos.
- Despliegue en infraestructura con aceleradores Hygon: la imagen FlagOS-Hygon permite poner el modelo en producción en minutos sobre hardware no Nvidia, reduciendo el coste de portabilidad.

## Benchmarks y rendimiento

La model card reporta únicamente dos métricas comparando la pila nativa de Nvidia con la pila FlagOS sobre Hygon:

| Metrica | MiniCPM5-2B-Nvidia-Origin | MiniCPM5-2B-Hygon-FlagOS |
|---|---|---|
| math_500 | 93,46 | 92,4 |
| mmlu_pro_other | 51,52 | 51,40 |

Además, el texto introductorio cita una media de 54,26 en múltiples benchmarks y comparaciones con Qwen3.5-2B (41,66), Qwen3-1.7B (40,89) y Gemma-4-E2B-it (37,62), así como una puntuación de 17 en AA-Index, pero no se desglosan los benchmarks individuales que componen esas medias.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 5 GB solo para pesos (2,52B parámetros × 2 bytes), más overhead de KV cache; el repositorio completo ocupa 5,0 GB.
- La KV cache con contexto de 512K tokens puede requerir decenas de GB adicionales según la configuración de atención; no se dispone de cifras oficiales.
- GPU recomendadas según la model card: aceleradores Hygon con los dispositivos `/dev/kfd`, `/dev/mkfd` y `/dev/dri`, usando la imagen Docker FlagOS-Hygon con vLLM 0.13.0, PyTorch 2.9.0 y Python 3.10.12.
- Compatibilidad con GPUs de consumo: no confirmada para esta variante concreta; el tamaño de pesos BF16 sugiere que cabría en GPUs consumer con 8 GB o más, pero no hay validación publicada.
- Opciones de despliegue documentadas: vLLM dentro del contenedor FlagOS-Hygon (`vllm serve` con `--trust-remote-code`, `--enforce-eager`, `--gpu-memory-utilization 0.85`). Otras opciones como llama.cpp, Ollama o TGI no están documentadas para esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM5-2B | 2,52B | 512K | Media 54,26; AA-Index 17 | Apache 2.0 | Pesos BF16 en HF (variante Hygon-FlagOS) |
| Qwen3.5-2B | no disponible | no disponible | Media 41,66 (según model card) | no disponible | no disponible |
| Qwen3-1.7B | no disponible | no disponible | Media 40,89 (según model card) | no disponible | no disponible |
| Gemma-4-E2B-it | no disponible | no disponible | Media 37,62 (según model card) | no disponible | no disponible |

Los datos de rendimiento de los competidores provienen exclusivamente de la model card del autor y no se han verificado de forma independiente. No se dispone de especificaciones detalladas de contexto ni licencia de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- Idiomas soportados limitados a chino e inglés; el rendimiento en castellano no está documentado.
- Riesgo de alucinación inherente a modelos de 2B parámetros, especialmente en tareas de razonamiento profundo o contextos muy largos.
- No se han publicado detalles sobre sesgos, datos de entrenamiento ni procesos de alineamiento, lo que dificulta evaluar riesgos éticos.
- La variante publicada está orientada a despliegue sobre aceleradores Hygon con la pila FlagOS; su uso en GPUs Nvidia o de consumo no está validado en esta ficha.
- El contexto de 512K tokens puede implicar un consumo elevado de memoria KV y latencias altas en hardware de borde.
- Aunque la licencia Apache 2.0 permite uso comercial, deben revisarse las dependencias de la imagen Docker FlagOS y los términos de los componentes de la pila.
- El repositorio tiene muy pocas descargas (7) y ningún like, lo que sugiere una validación comunitaria escasa.
- La model card mezcla información del modelo base con la del artefacto de despliegue; algunos datos (por ejemplo, el pipeline) no están disponibles.

## Enlaces

- Hugging Face: https://huggingface.co/FlagRelease/MiniCPM5-2B-BF16-hygon-FlagOS
- AnythingLLM: https://anythingllm.com/
- Triton (referenciado por FlagGems): https://github.com/openai/triton
- Repositorio de la imagen FlagOS-Hygon: harbor.baai.ac.cn/flagrelease-public/flagrelease-minicpm5-hygon-tree_none-gems_4.2.1rc0-vllm_0.13.0_das.opt1.dtk2604.20260306.g0c698cda-plugin_0.1.0-cx_none-python_3.10.12-torch_2.9.0_das.opt1.dtk2604.20260206.g275d08c:202605211622
- Paper, blog o demo oficiales de MiniCPM5-2B: no disponibles en la información proporcionada.
