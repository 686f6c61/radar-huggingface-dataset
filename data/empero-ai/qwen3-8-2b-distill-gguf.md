# empero-ai/Qwen3.8-2B-Distill-GGUF

## Resumen

Qwen3.8-2B-Distill-GGUF es la version cuantizada en formato GGUF del modelo Qwen3.8-2B, desarrollado por Empero, un laboratorio independiente de investigacion en IA con sede en Alemania. Se trata de una destilacion de parametros completos del modelo masivo Qwen3.8 2.4T A95B (un MoE de la familia Qwen3.8) sobre la arquitectura compacta Qwen3.5-2B, con el objetivo de trasladar las capacidades de razonamiento del modelo profesor a un modelo de aproximadamente 1,94 mil millones de parametros ejecutable en dispositivos de borde.

El modelo se publica bajo licencia Apache-2.0 y esta pensado para entornos con recursos limitados: telefonos, placas de un solo chip (SBC), portatiles y GPUs de consumo. La version GGUF permite su ejecucion directa en llama.cpp, Ollama, LM Studio, Jan y KoboldCpp, con un peso minimo de 1,312 GB en cuantizacion Q4_K_M. Su relevancia actual radica en que acerca capacidades de razonamiento de un modelo de clase Qwen-Max a hardware accesible, con una mejora de +0,265 en MMLU y +0,310 en GSM8K respecto a la base Qwen3.5-2B sin destilar.

Es importante destacar que la arquitectura Qwen3.5 es hibrida: combina capas de atencion completa con capas Gated DeltaNet, por lo que requiere una version reciente de llama.cpp con soporte para esta arquitectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 3 capas Gated DeltaNet por cada capa de atencion completa (arquitectura Qwen3.5) |
| Parametros totales | 1.942.653.248 (~1,94 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo soporta contexto largo; la cache KV es el coste dominante a contexto extendido) |
| Tipos de cuantizacion | Q4_K_M (1,312 GB), Q5_K_M (1,455 GB), Q6_K (1,606 GB), Q8_0 (2,077 GB), BF16 (3,897 GB) |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (el modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo Qwen3.8-2B es una destilacion de parametros completos del Qwen3.8 2.4T A95B, un modelo de mezcla de expertos de la familia Qwen3.8, sobre la arquitectura del Qwen3.5-2B de Alibaba. La arquitectura Qwen3.5 es hibrida: intercala tres capas Gated DeltaNet (una capa de atencion lineal eficiente) por cada capa de atencion completa, lo que reduce el coste computacional y la huella de memoria manteniendo la calidad del atencion full-attention en las capas criticas.

El entrenamiento se realizo mediante destilacion full-parameter sobre aproximadamente 30.000 trazas de razonamiento (teacher traces) generadas por el modelo profesor Qwen3.8 2.4T A95B, extraidas de los datasets internos de destilacion de Empero. El modelo es un modelo de razonamiento: cada respuesta comienza con un bloque de pensamiento (`thinking`) antes de emitir la respuesta final, siguiendo el protocolo de chain-of-thought del profesor. El proceso de cuantizacion a GGUF se realizo con llama.cpp, manteniendo la plantilla de chat embebida en el archivo.

## Capacidades

- Razonamiento con chain-of-thought: el modelo abre cada respuesta con un bloque `thinking` explicito, heredado de la destilacion del profesor Qwen3.8.
- Generacion de texto conversacional con plantilla de chat embebida en el archivo GGUF.
- Mejora significativa en tareas de conocimiento general y razonamiento matematico respecto a la base Qwen3.5-2B (ver benchmarks).
- Capacidades de function calling, segun los tags del repositorio del modelo base.
- Soporte de agentes y tareas de razonamiento multi-paso, heredadas de la linea Qwen3.8 orientada a tareas agénticas de horizonte largo.
- Ejecucion en CPU pura y dispositivos de borde gracias a su tamano reducido y arquitectura hibrida eficiente.

## Casos de uso

- Asistente conversacional local en dispositivos moviles: el modelo en cuantizacion Q4_K_M (1,312 GB) cabe en telefonos y SBC como Raspberry Pi, permitiendo un asistente privado sin conexion a internet con capacidades de razonamiento.
- Razonamiento matematico en entornos sin GPU: con GSM8K de 0,640, puede resolver problemas aritmeticos y algebraicos de nivel escolar en portatiles modestos, util en aplicaciones educativas offline.
- Generacion de codigo en entornos de desarrollo integrado: su capacidad de function calling permite integrarlo en editores de codigo o pipelines de CI/CD ligeros para autocompletado y asistencia basica.
- Prototipado rapido de agentes conversacionales: al soportar tool calling y razonamiento multi-paso, sirve para construir agentes simples de automatizacion de tareas en entornos de desarrollo sin coste de API.
- Inferencia en servidores de bajo coste: con Q6_K o Q8_0 (1,6-2,1 GB) se puede desplegar en instancias cloud de 4 GB de RAM o GPUs de entrada, reduciendo el coste por inferencia frente a modelos de mayor tamano.
- Educacion y experimentacion: al ser Apache-2.0 y ejecutable en CPU, es adecuado para cursos de IA, investigacion academica y experimentos de destilacion o fine-tuning sobre arquitecturas hibridas.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden al modelo fuente (BF16) evaluado con `lm-evaluation-harness` y protocolos CoT, con ajustes identicos entre base y estudiante:

| Tarea | Qwen3.5-2B (base) | Qwen3.8-2B (destilado) | Delta |
|---|---:|---:|---:|
| mmlu (CoT, 57 materias) | 0,283 | 0,548 | +0,265 |
| gsm8k_cot | 0,330 | 0,640 | +0,310 |

No se han publicado resultados de benchmarks para las versiones cuantizadas GGUF en la informacion disponible. Se asume una degradacion minima en Q6_K y Q8_0, y algo mayor en Q4_K_M, aunque no se proporcionan datos numericos.

## Requisitos de hardware

- Q4_K_M y Q5_K_M (1,3-1,5 GB): ejecutables en telefonos, SBC y portatiles modernos; CPU-only es totalmente utilizable a esta escala.
- Q6_K y Q8_0 (1,6-2,1 GB): requieren GPU con 4 GB+ de VRAM o CPU con 8 GB de RAM.
- BF16 (3,9 GB): requiere GPU con 6 GB+ de VRAM.
- Runtimes compatibles: llama.cpp (version reciente con soporte Qwen3.5/Gated DeltaNet), Ollama, LM Studio, Jan, KoboldCpp.
- Parametros de muestreo recomendados: temperatura 0,6, top-p 0,95, top-k 20.
- La cache KV es el coste dominante a contexto largo, por lo que el contexto efectivo depende de la RAM/VRAM disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | MMLU (CoT) | GSM8K (CoT) | Licencia |
|---|---|---|---:|---:|---|
| Qwen3.5-2B (base) | ~2 B | Hibrida (Gated DeltaNet + full attention) | 0,283 | 0,330 | Apache-2.0 |
| Qwen3.8-2B (destilado) | ~1,94 B | Hibrida (Gated DeltaNet + full attention) | 0,548 | 0,640 | Apache-2.0 |
| Qwen3.8 2.4T A95B (profesor) | 2,4 T (MoE) | MoE, no ejecutable en edge | no disponible | no disponible | no disponible |

La destilacion aporta una mejora de +0,265 en MMLU y +0,310 en GSM8K sobre la base Qwen3.5-2B con el mismo tamano de arquitectura, lo que demuestra que la destilacion desde el modelo de 2,4 T es efectiva para transferir capacidades de razonamiento a un modelo compacto. Empero tambien publica versiones destiladas de 4B y 9B de la misma familia, aunque no se dispone de especificaciones detalladas en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo solo soporta ingles; no es adecuado para produccion en castellano u otros idiomas sin fine-tuning adicional.
- Arquitectura hibrida: requiere una version reciente de llama.cpp con soporte Qwen3.5/Gated DeltaNet; las versiones antiguas fallaran al cargar el modelo.
- Modelo de razonamiento: cada respuesta abre con un bloque `thinking` que debe eliminarse antes de mostrar al usuario final; requiere una longitud de generacion generosa (`-n 16384` recomendado).
- Dataset de destilacion limitado: ~30.000 trazas de entrenamiento es un volumen reducido, lo que puede limitar la cobertura de conocimiento en dominios especializados.
- Tamano reducido: con ~1,94 B de parametros, su capacidad de razonamiento complejo y conocimiento factual es inferior a modelos de 7B o mayores; las mejoras de destilacion no eliminan las limitaciones inherentes de escala.
- Riesgo de alucinacion: como todo modelo pequeno, puede generar respuestas incorrectas con alta confianza, especialmente fuera de su dominio de entrenamiento.
- Sin datos de benchmarks para versiones cuantizadas: el rendimiento real de Q4_K_M puede diferir del reportado para BF16.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/empero-ai/Qwen3.8-2B-Distill-GGUF
- Modelo base (safetensors): https://huggingface.co/empero-ai/Qwen3.8-2B
- Sitio web de Empero: https://empero.org
- Repositorio Qwen3.8 (GitHub): https://github.com/QwenLM/Qwen3.8
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- llama.cpp (GitHub): https://github.com/ggml-org/llama.cpp
- Documentacion de las destilaciones Qwen3.8 (9B/4B/2B): https://github.com/47thtechcorner/RayCodes_Qwen3.8Distilled
