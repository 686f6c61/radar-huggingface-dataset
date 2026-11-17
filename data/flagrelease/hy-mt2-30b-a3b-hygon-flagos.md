# FlagRelease/HY-MT2-30B-A3B-hygon-FlagOS

## Resumen

HY-MT2-30B-A3B es un modelo de traducción automática multilingüe desarrollado por Tencent Hunyuan, publicado en el ecosistema FlagRelease como una variante optimizada para el stack FlagOS. Forma parte de la familia Hy-MT2, compuesta por tres tamaños (1.8B, 7B y 30B-A3B), y su propósito es cubrir traducción de alta calidad entre 33 idiomas, además de cinco pares de lenguas minoritarias chinas y dialectos. La variante aquí descrita emplea una arquitectura Mixture of Experts (MoE) con 30.064 millones de parámetros totales y 3B activos por token.

El modelo resuelve el problema de la traducción automática especializada con control fino de instrucciones: permite aplicar glosarios y terminología específica, transformación de estilo y salida estructurada en HTML o JSON, lo que lo diferencia de traductores genéricos. Según la model card, el 30B-A3B alcanza el 98,1% del rendimiento de Gemini 2.5 Pro en FLORES-200 y el 99,0% de su puntuación GEMBA en DomainMTBench, superando a modelos abiertos como DeepSeek-V4-Pro y Kimi K2.6.

Esta ficha concreta corresponde al artefacto `FlagRelease/HY-MT2-30B-A3B-hygon-FlagOS`, una build empaquetada para aceleradores Hygon con el stack FlagOS (FlagGems, FlagTree, FlagCX y FlagScale), distribuida como imagen de contenedor con vLLM 0.13.0 y validada contra la pila nativa de Nvidia. No se trata del modelo original de Tencent, sino de una redistribución con parches de portabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) |
| Parametros totales | 30.064.725.888 (30B) |
| Parametros activos | 3B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para esta build; la familia incluye una versión 1.25-bit del 1.8B basada en el framework Sherry |
| Idiomas soportados | 33 idiomas y 5 pares de lenguas minoritarias chinas / dialectos |
| Licencia | no disponible |
| Formato de pesos | safetensors (tag `hy_v3`) |
| Tamano del repositorio | 120,3 GB |
| Pipeline | no disponible |
| Descargas / likes | 11 / 0 |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE con 30B parámetros totales y 3B activos, lo que reduce el coste computacional por token frente a un denso equivalente. La model card no detalla el número de expertos, la proporción de activación ni la política de enrutamiento. El tag de pesos `hy_v3` sugiere una generación interna de checkpoint propia de Hunyuan. No se especifica la longitud de contexto soportada, el número de tokens de entrenamiento ni la composición del corpus.

En cuanto al entrenamiento, la información disponible solo indica que la familia Hy-MT2 mejora respecto a Hy-MT1.5 en tres ejes: traducción de dominio específico, seguimiento de instrucciones y despliegue en dispositivo. No se documenta si hubo RLHF, DPO u otra fase de alineación, ni innovaciones como decodificación especulativa o atención lineal. La build FlagOS añade parches de portabilidad a aceleradores Hygon mediante FlagGems (librería de operadores en Triton), FlagTree (compilador unificado) y FlagCX (comunicación colectiva), con validación de consistencia frente a la pila nativa: la diferencia en chrF es de 0,01 en `flores_ca` (57,80 frente a 57,79) y de 0,03 en `wmt16` (60,89 frente a 60,92).

## Capacidades

- Traducción automática multilingüe entre 33 idiomas y 5 pares de lenguas minoritarias chinas o dialectos.
- Control de glosarios y terminología: permite imponer traducciones consistentes de términos técnicos o de marca.
- Transformación de estilo: adaptación del registro (formal, informal, técnico) mediante instrucciones.
- Salida estructurada en HTML y JSON, útil para pipelines que consumen traducciones etiquetadas.
- Seguimiento de instrucciones de traducción, con rendimiento declarado superior al de modelos abiertos del mismo tamaño.
- Traducción de dominio específico en verticales como finanzas, política y educación (evaluado en DomainMTBench).
- Servicio compatible con la API OpenAI a través de vLLM (`/v1/chat/completions`).
- No se documentan capacidades de visión, audio, tool calling ni razonamiento multi-paso; el modelo está especializado en traducción.

## Casos de uso

- Traducción de documentación técnica con glosario: se inyecta un glosario de términos de producto y el modelo mantiene la terminología consistente en todo el corpus, aprovechando el control de glosarios de la familia Hy-MT2.
- Localización de interfaces web: la salida estructurada en HTML o JSON permite traducir cadenas de recursos y plantillas sin romper el marcado, integrándose en pipelines de build.
- Traducción jurada o de dominio financiero: el rendimiento del 99,0% de la puntuación GEMBA de Gemini 2.5 Pro en DomainMTBench (finanzas, política, educación) lo hace adecuado para revisión asistida de documentos regulados.
- Atención al cliente multilingüe: desplegado tras vLLM con la API compatible de OpenAI, puede servir traducciones en tiempo real en un chat multi-turno entre agentes y clientes de distintos idiomas.
- Subtitulado y doblaje: la transformación de estilo permite ajustar el registro y la longitud de las líneas para subtítulos, manteniendo coherencia terminológica entre episodios.
- Migración a hardware nacional: la build FlagOS con contenedor preconfigurado permite desplegar el modelo en aceleradores Hygon en minutos, útil para organizaciones con requisitos de soberanía tecnológica.
- Traducción de lenguas minoritarias chinas: cubre cinco pares de lenguas minoritarias o dialectos, un nicho escasamente atendido por traductores comerciales.

## Benchmarks y rendimiento

Los únicos datos numéricos publicados en la información disponible son los de validación de consistencia de la build FlagOS frente a la pila nativa, medidos en chrF:

| Metrica (chrF) | HY-MT2-30B-A3B-Nvidia-Origin | HY-MT2-30B-A3B-FlagOS |
|---|---|---|
| flores_ca | 57,79 | 57,80 |
| wmt16 | 60,92 | 60,89 |

La model card declara además, sin tabla detallada, que el 30B-A3B alcanza el 98,1% del rendimiento de Gemini 2.5 Pro en FLORES-200 y el 99,0% de su puntuación GEMBA en DomainMTBench. No se han publicado resultados desglosados por idioma, MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa: los pesos safetensors ocupan 120,3 GB, por lo que se requieren al menos dos aceleradores de 80 GB en tensor parallelism 2 (configuración usada en el ejemplo de la model card).
- GPU recomendadas: el ejemplo oficial usa `--tensor-parallel-size 2` sobre aceleradores Hygon con el stack FlagOS; en Nvidia equivaldría a 2× A100 80 GB o 2× H100 80 GB.
- No cabe en GPU de consumo: ni una RTX 4090 (24 GB) ni una RTX 3090 pueden alojar los pesos completos sin cuantización agresiva, y no se documentan GGUF para esta build.
- Opciones de despliegue: vLLM 0.13.0 dentro de la imagen FlagOS (`harbor.baai.ac.cn/flagrelease-public/...`), con `--trust-remote-code` y `--gpu-memory-utilization 0.95`. No se documentan llama.cpp, Ollama ni TGI para este artefacto.
- Integración con AnythingLLM mediante la API compatible de OpenAI en el puerto 8080.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| HY-MT2-30B-A3B (esta ficha) | 30B | 3B | no disponible | no disponible | 98,1% de Gemini 2.5 Pro en FLORES-200 (declarado) |
| HY-MT2-7B | 7B | denso | no disponible | no disponible | 96,9% de Gemini 2.5 Pro en FLORES-200 (declarado) |
| HY-MT2-1.8B | 1,8B | denso | no disponible | no disponible | Supera APIs comerciales de traducción; versión 1.25-bit de ~440 MB para móvil |
| DeepSeek-V4-Pro | no disponible | no disponible | no disponible | no disponible | Superado por Hy-MT2-30B-A3B según la model card |
| Kimi K2.6 | no disponible | no disponible | no disponible | no disponible | Superado por Hy-MT2-30B-A3B según la model card |

No se dispone de datos de parámetros, contexto ni licencia de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- La licencia no está declarada en la información disponible; no se puede confirmar el uso comercial sin consultar el repositorio original de Tencent Hunyuan.
- El modelo está especializado en traducción: no se documentan capacidades de razonamiento general, código o matemáticas, por lo que no debe emplearse como LLM de propósito general.
- Riesgo de alucinación en terminología especializada si el glosario no se proporciona explícitamente; el control de glosarios mitiga pero no elimina este riesgo.
- La longitud de contexto no está publicada, lo que impide dimensionar documentos largos con seguridad.
- Esta build está empaquetada para aceleradores Hygon con el stack FlagOS; el rendimiento en otras plataformas no está validado más allá de la comparación chrF con la pila Nvidia.
- El repositorio tiene 11 descargas y 0 likes, señal de adopción muy temprana y poca validación comunitaria.
- Los benchmarks declarados en la model card (98,1% de Gemini 2.5 Pro, 99,0% GEMBA) no incluyen tablas desglosadas verificables en la información disponible.
- El tamaño de 120,3 GB en safetensors exige infraestructura multi-GPU; no hay versiones cuantizadas publicadas para esta build.

## Enlaces

- Hugging Face: https://huggingface.co/FlagRelease/HY-MT2-30B-A3B-hygon-FlagOS
- Repositorio relacionado (variante Nvidia): https://huggingface.co/FlagRelease/HY-MT2-30B-A3B-nvidia-FlagOS
- FlagGems (librería de operadores en Triton): https://github.com/openai/triton
- AnythingLLM: https://anythingllm.com/
- No se han encontrado en la información disponible enlaces a paper, blog oficial de Tencent Hunyuan, repositorio de FlagOS ni demos.
