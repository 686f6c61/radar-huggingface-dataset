# 0xSojalSec/Qwen3.8-27B-Uncensored-YMQ-MTP-GGUF-12GB

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo **Qwen3.8-27B-Uncensored**, una versión "abliterada" (sin censura a nivel de pesos) del modelo Qwen3.8-27B, desarrollada por JonathanColetti. El autor de este repo, 0xSojalSec, aplica una técnica de cuantización mixta propia llamada **YMQ-Compiler (v2.0)**, inspirada en AutoRound y consciente de la arquitectura, que asigna diferentes niveles de precisión a distintas capas del modelo para maximizar la calidad dentro de un presupuesto de VRAM reducido.

El resultado es una familia de archivos GGUF que van desde ~9,3 GB hasta ~19 GB, pensados para ejecutar un modelo de 27.000 millones de parámetros en GPUs de consumo (12 GB, 16 GB) sin sacrificar demasiada fidelidad. Además, los builds soportan **multi-token prediction (MTP)** para decodificación especulativa y están optimizados para contextos largos en entornos de desarrollo de código y agentes (RooCode, Aider). El archivo específico de ~12 GB corresponde a uno de los presets intermedios, aunque la model card no indica cuál exactamente.

La relevancia actual radica en que permite ejecutar localmente un modelo de 27B sin censura, con calidad razonable, en hardware de gama media, algo que hasta hace poco requería GPUs de 24 GB o más.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (los tags sugieren hibrida con componentes Mamba/SSM, pero no se confirma en la model card) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (la model card menciona "high-context optimization", sin cifra concreta) |
| Tipos de cuantizacion | Mezclas de IQ y Q segun preset: IQ3_XXS, IQ2_XS, IQ2_S, IQ4_XS, Q5_K, IQ4_NL, Q6_K, entre otros |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es **Qwen3.8-27B-Uncensored**, una version "abliterada" de Qwen3.8-27B, es decir, se han modificado los pesos para eliminar los rechazos de contenido no deseado sin depender de prompts. No se proporcionan detalles sobre el entrenamiento original (datos, tokens, metodos de alineacion) en la informacion disponible.

La contribucion principal de este repo es la **cuantizacion YMQ**, un framework propio que analiza la arquitectura capa por capa y asigna niveles de precision mixtos (por ejemplo, `Q5_K` en capas criticas y `IQ2_XXS` en capas auxiliares) usando un espacio logaritmico para minimizar la divergencia KL respecto al modelo original. La model card reporta metricas de perplejidad en WikiText-2 para cada preset, lo que permite evaluar la perdida de calidad.

Ademas, los archivos estan preparados para **multi-token prediction (MTP)**, una tecnica de decodificacion especulativa que predice varios tokens a la vez para acelerar la inferencia, y para contextos largos en tareas de codificacion y agentes.

## Capacidades

- Generacion de texto y razonamiento general.
- Generacion de codigo y soporte para entornos de desarrollo como RooCode y Aider (mencionado en la model card).
- Soporte de **multi-token prediction (MTP)** para decodificacion especulativa.
- Optimizacion para contextos largos y tareas multi-turno.
- Modelo "uncensored" (abliterado): no rechaza contenido explicito o sensible a nivel de pesos.
- Compatible con pipelines de texto (text-generation) y endpoints compatibles (segun tags).

No se menciona soporte explicito de tool calling, vision ni audio en la informacion disponible.

## Casos de uso

- **Asistente de codificacion local**: el modelo puede integrarse en editores o CLIs (como Aider) para generar, revisar y refactorizar codigo. Su cuantizacion de ~12 GB permite ejecutarlo en una GPU de 12 GB con contexto moderado, y el soporte MTP acelera la generacion.
- **Agente autonomo multi-paso**: gracias a la optimizacion para contextos largos y la ausencia de censura, puede actuar como agente que ejecuta tareas complejas (buscar, leer archivos, escribir codigo) sin interrupciones por contenido "prohibido".
- **Desarrollo de APIs y scripts**: la model card menciona "API execution environments", por lo que es adecuado para generar y depurar llamadas a APIs, JSON, etc.
- **Prototipado rapido en entornos sin conexion**: al ser GGUF, se puede desplegar con llama.cpp u Ollama en maquinas sin acceso a la nube, ideal para equipos con politicas de privacidad estrictas.
- **Investigacion sobre alineacion y censura**: al ser un modelo abliterado, permite estudiar el comportamiento de un LLM sin restricciones de seguridad, util para investigacion academica (siempre con las debidas salvaguardas).
- **Generacion de contenido creativo sin filtros**: para escritura de ficcion, guiones o brainstorming donde se requiera explorar temas sensibles sin restricciones.

## Benchmarks y rendimiento

La model card proporciona metricas de perplejidad en WikiText-2 (ventana de 4096 tokens) para cada preset. No se publican otros benchmarks (MMLU, HumanEval, etc.).

| Variante | Tamano | Perplejidad (WikiText-2) | Divergencia KL media |
|---|---|---|---|
| XXS-Pro | ~9,3 GB | 8,2084 | 0,185361 ± 0,0021 |
| XXS | ~9,8 GB | 7,6538 | 0,193804 ± 0,0022 |
| XS-TI | ~10,2 GB | 7,6169 | 0,168378 ± 0,001935 |
| XS-Pro | ~11,0 GB | 7,1665 | 0,135866 ± 0,0018 |
| S-Pro | ~12,5 GB | 7,0687 | 0,080403 ± 0,0014 |
| M-TI | ~12,9 GB | 7,0419 | 0,104087 ± 0,0016 |
| M | ~14,0 GB | 6,8176 | 0,053286 ± 0,0013 |
| L-TI | ~14,1 GB | 7,1788 | 0,086571 ± 0,0013 |
| L | ~17,0 GB | 6,9832 | 0,031546 ± 0,0009 |
| XL | ~19,0 GB | 6,8329 | 0,011598 ± 0,0005 |

El archivo de ~12 GB probablemente corresponde a los presets XS-Pro o S-Pro, aunque no se especifica. En cualquier caso, la perplejidad se mantiene por debajo de 7,2, lo que indica una perdida de calidad moderada respecto al modelo original (no se proporciona el valor BF16 de referencia).

## Requisitos de hardware

- **VRAM estimada**: segun el preset, desde ~9,3 GB (XXS-Pro) hasta ~19 GB (XL). El archivo de 12 GB requiere al menos 12 GB de VRAM, aunque con contexto reducido.
- **GPUs recomendadas**:
  - Presets de 9-10 GB: RTX 3060 12 GB, RTX 4060 Ti 16 GB, etc.
  - Presets de 12-14 GB: RTX 4070 Ti Super 16 GB, RTX 4080, RTX 4090, o GPUs de datacenter como A10G.
  - Presets de 17-19 GB: RTX 4090 24 GB, A100 40 GB, etc.
- **Opciones de despliegue**: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio, text-generation-webui y servidores como llama-cpp-python. Tambien puede usarse con vLLM si se convierte a otro formato, aunque no es el flujo principal.
- **Latencia y throughput**: no se proporcionan datos. El soporte MTP deberia mejorar la velocidad de generacion, pero no hay cifras concretas.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoria (por ejemplo, Llama 3.1 8B, Mistral 7B, o Qwen2.5 14B) en la informacion proporcionada. La model card no incluye benchmarks estandar como MMLU o HumanEval, por lo que no es posible realizar una comparacion objetiva. Se recomienda consultar benchmarks externos del modelo base Qwen3.8-27B para contextualizar.

## Limitaciones y advertencias

- **Contenido sin censura**: al ser un modelo abliterado, puede generar contenido explicito, ofensivo o peligroso. No es apto para uso en produccion sin filtros adicionales ni para menores.
- **Riesgo de alucinacion**: como cualquier LLM, puede inventar hechos o codigo incorrecto. La cuantizacion agresiva (especialmente en presets pequeños) puede aumentar este riesgo.
- **Degradacion en presets pequeños**: la model card advierte que los presets XXS pueden sufrir "amnesia de contexto" o "bucles de formato" en tareas de agente multi-etapa.
- **Contexto limitado**: aunque se menciona optimizacion para contexto largo, no se especifica la longitud maxima real. En presets de 12 GB, el contexto util puede verse reducido por la VRAM disponible.
- **Licencia**: Apache-2.0 permite uso comercial, pero el modelo base "uncensored" puede tener restricciones adicionales no declaradas. Se recomienda revisar la licencia del modelo original.
- **Sin garantia de tool calling**: aunque se menciona compatibilidad con entornos de API, no se confirma soporte nativo de function calling.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/0xSojalSec/Qwen3.8-27B-Uncensored-YMQ-MTP-GGUF-12GB)
- [Modelo base: JonathanColetti/Qwen3.8-27B-Uncensored](https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored)
- [Repositorio original de la tecnica YMQ (ZeroDigest)](https://huggingface.co/zerodigest/Qwen3.8-27B-Uncensored-YMQ-MTP-GGUF)
- [Copia del repo en jaromer](https://huggingface.co/jaromer/zerodigest-Qwen3.8-27B-Uncensored-YMQ-MTP-GGUF)
- [Articulo sobre el modelo uncensored en orcarouter.ai](https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf)
