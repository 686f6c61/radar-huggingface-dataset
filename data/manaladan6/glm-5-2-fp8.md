# manaladan6/GLM-5.2-FP8

## Resumen

GLM-5.2-FP8 es el modelo insignia de la serie GLM-5, desarrollado por Z.ai (zai-org), diseñado para tareas de horizonte largo con una ventana de contexto sólida de 1 millón de tokens. Se trata de una versión en precisión FP8 del modelo GLM-5.2, con 753.329.940.480 parámetros (~753B), lo que lo sitúa entre los modelos abiertos más grandes disponibles. Su arquitectura combina un Mixture of Experts (MoE) con Dynamic Sparse Attention (DSA) y el nuevo mecanismo IndexShare, que reutiliza el indexador en cada cuatro capas de atención dispersa, reduciendo los FLOPs por token en 2,9 veces a contexto de 1M.

El modelo destaca por su rendimiento en razonamiento avanzado, codificación y tareas agénticas, superando ampliamente a su predecesor GLM-5.1 en benchmarks como Terminal-Bench 2.1 (81,0 vs 62,0) o SWE-bench Pro (62,1 vs 58,4). Se publica con licencia MIT sin restricciones regionales, lo que lo convierte en una opción atractiva para investigación y producción. La versión FP8 permite una inferencia más eficiente en memoria que la versión BF16, aunque sigue requiriendo un clúster de GPUs de gran capacidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con Dynamic Sparse Attention (DSA) e IndexShare |
| Parametros totales | 753.329.940.480 (~753B) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | FP8 (nativo) |
| Idiomas soportados | ingles, chino |
| Licencia | MIT |
| Formato de pesos | safetensors (FP8) |

## Arquitectura y entrenamiento

GLM-5.2 emplea una arquitectura MoE con atención dispersa dinámica (DSA). La innovación principal es IndexShare, que comparte el mismo indexador entre cada cuatro capas de atención dispersa, reduciendo el coste computacional por token en un factor de 2,9 a 1M de contexto. Además, se ha mejorado la capa MTP (Multi-Task Prediction) para decodificación especulativa, aumentando la longitud de aceptación en hasta un 20%. No se han publicado datos sobre el número de tokens de entrenamiento ni la composición del dataset en la información disponible; el informe técnico se referencia en el arxiv 2602.15763.

## Capacidades

- Generación de texto y conversación multilingüe (inglés y chino).
- Razonamiento matemático y científico avanzado, con resultados sobresalientes en AIME 2026 (99,2) y GPQA-Diamond (91,2).
- Codificación de alto nivel: resolución de issues en repositorios (SWE-bench Pro), generación de repositorios completos (NL2Repo), y uso de terminal (Terminal-Bench 2.1).
- Capacidades agénticas: soporte para tool calling, integración con MCP (MCP-Atlas 76,8) y ejecución de tareas multi-paso.
- Decodificación especulativa mejorada para acelerar la inferencia.
- Ventana de contexto de 1M tokens, diseñada para mantener rendimiento estable en tareas de largo horizonte.

## Casos de uso

- **Agentes de desarrollo de software**: puede resolver issues de repositorios reales (SWE-bench Pro 62,1) y generar repositorios completos a partir de descripciones en lenguaje natural (NL2Repo 48,9), lo que lo hace adecuado para automatizar tareas de programación en entornos CI/CD.
- **Asistencia de código en producción**: con soporte para tool calling y decodificación especulativa, puede integrarse en IDEs o pipelines de desarrollo para generar, revisar y depurar código con baja latencia.
- **Razonamiento matemático y científico**: sus resultados en AIME 2024 (99,2) y HMMT (94,4) lo hacen útil para resolver problemas avanzados de matemáticas, física o química en entornos educativos o de investigación.
- **Automatización de tareas de terminal**: con Terminal-Bench 2.1 (81,0), puede ejecutar comandos, gestionar sistemas y automatizar operaciones de administración en entornos de servidor.
- **Análisis de documentos largos**: su contexto de 1M tokens permite procesar libros completos, expedientes legales o informes técnicos extensos, con capacidad para mantener coherencia y recuperar información específica.
- **Atención al cliente multilingüe**: al soportar inglés y chino, puede gestionar conversaciones multi-turno con contexto largo, resolviendo consultas complejas y derivando a agentes humanos cuando sea necesario.

## Benchmarks y rendimiento

Los siguientes datos provienen de la tabla de benchmarks publicada en la model card de GLM-5.2.

| Benchmark | GLM-5.2 | GLM-5.1 | Qwen3.7-Max | DeepSeek-V4-Pro | Claude Opus 4.8 | GPT-5.5 | Gemini 3.1 Pro |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| HLE | 40,5 | 31 | 41,4 | 37,7 | 49,8* | 41,4* | 45 |
| HLE (w/ Tools) | 54,7 | 52,3 | 53,5 | 48,2 | 57,9* | 52,2* | 51,4* |
| CritPt | 20,9 | 4,6 | 13,4 | 12,9 | 20,9 | 27,1 | 17,7 |
| AIME 2024 | 99,2 | 95,3 | 97 | 94,6 | 95,7 | 98,3 | 98,2 |
| HMMT Nov. 2025 | 94,4 | 94 | 95 | 94,4 | 96,5 | 96,5 | 94,8 |
| HMMT Feb. 2026 | 92,5 | 82,6 | 97,1 | 95,2 | 96,7 | 96,7 | 87,3 |
| IMOAnswerBench | 91,0 | 83,8 | 90 | 89,8 | 83,5 | - | 81 |
| GPQA-Diamond | 91,2 | 86,2 | 90 | 90,1 | 93,6 | 93,6 | 94,3 |
| SWE-bench Pro | 62,1 | 58,4 | 60,6 | 55,4 | 69,2 | 58,6 | 54,2 |
| NL2Repo | 48,9 | 42,7 | 47,2 | 35,5 | 69,7 | 50,7 | 33,4 |
| DeepSWE | 46,2 | 18 | 18 | 8 | 58 | 70 | 10 |
| ProgramBench | 63,7 | 50,9 | - | 47,8 | 71,9 | 70,8 | 39,5 |
| Terminal Bench 2.1 (Terminus-2) | 81,0 | 63,5 | 75 | 64 | 85 | 84 | 74 |
| Terminal Bench 2.1 (Best Reported Harness) | 82,7 | 69 | - | - | 78,9 | 83,4 | 70,7 |
| FrontierSWE (Dominance) | 74,4 | 30,5 | - | 29,0 | 75,1 | 72,6 | 39,6 |
| PostTrainBench | 34,3 | 20,1 | - | - | 37,2 | 28,4 | 21,6 |
| SWE-Marathon | 13,0 | 1,0 | - | - | 26,0 | 12,0 | 4,0 |
| MCP-Atlas (Public Set) | 76,8 | 71,8 | 76,4 | 73,6 | 77,8 | 75,3 | 69,2 |
| Tool-Decathlon | 48,2 | 40,7 | - | 52,8 | 59,9 | 55,6 | 48,8 |

*Resultados marcados con * corresponden al conjunto completo de HLE, mientras que los demás son del subconjunto de solo texto.

## Requisitos de hardware

- **VRAM estimada**: con 753B parámetros en FP8, los pesos requieren aproximadamente 753 GB de VRAM. Para contexto de 1M tokens, se necesita además una gran cantidad de memoria para las claves y valores (KV cache), que puede superar los 200 GB adicionales dependiendo de la configuración. Se estima un mínimo de 1 TB de VRAM para una inferencia completa.
- **GPUs recomendadas**: no es viable en GPUs de consumo. Se requiere un clúster de GPUs de datacenter. Configuraciones posibles: 8× H200 (141 GB) o 16× A100 80GB, o 8× A100 80GB con cuantización adicional (aunque el modelo es FP8 nativo, se podría reducir a INT4 con pérdida de calidad).
- **Opciones de despliegue**: compatible con SGLang (v0.5.13.post1+), vLLM (v0.23.0+), Transformers (v0.5.12+), KTransformers (v0.5.12+) y Unsloth (v0.1.47-beta+). También soporta plataformas con Ascend NPU (vLLM-Ascend, xLLM, SGLang).
- **Latencia y throughput**: no se han publicado datos concretos. La decodificación especulativa con la capa MTP mejorada reduce la latencia en tareas de generación larga, pero no se cuantifican en la información disponible.

## Comparativa con modelos similares

El modelo se sitúa entre los más potentes de su categoría, compitiendo con los modelos propietarios más avanzados (Claude Opus 4.8, GPT-5.5, Gemini 3.1 Pro) y con otros open de gran escala como DeepSeek-V4-Pro y Qwen3.7-Max. En términos de licencia, GLM-5.2 es MIT, lo que le da ventaja frente a modelos propietarios y a algunos open con restricciones. En la tabla de benchmarks anterior se observa que GLM-5.2 supera a sus rivales open en la mayoría de las tareas de codificación y razonamiento, aunque queda por detrás de Claude Opus 4.8 en tareas como SWE-bench Pro, NL2Repo y Terminal-Bench. No se dispone de datos de parámetros de los modelos comparados, por lo que no se puede hacer una comparativa de arquitectura.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: como todo modelo de lenguaje, puede generar contenido incorrecto o inventado, especialmente en tareas de razonamiento complejo o con contextos muy largos. No se han publicado evaluaciones específicas sobre sesgos.
- **Idiomas**: solo soporta inglés y chino. No es adecuado para aplicaciones multilingües fuera de estos idiomas.
- **Contexto largo**: aunque la ventana es de 1M tokens, el rendimiento puede degradarse con contextos extremadamente largos si no se gestiona adecuadamente la memoria. Se recomienda usar estrategias de gestión de contexto.
- **Requisitos de hardware**: el coste de despliegue es muy elevado (mínimo 1 TB de VRAM), lo que limita su uso a organizaciones con infraestructura de datacenter.
- **Licencia**: MIT permite uso comercial sin restricciones, pero se debe verificar el cumplimiento de las condiciones de atribución en cada caso.
- **Versión FP8**: la cuantización FP8 puede introducir pequeñas pérdidas de precisión en comparación con la versión BF16, aunque el fabricante no ha publicado datos comparativos de degradación.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/manaladan6/GLM-5.2-FP8)
- [Repositorio oficial en GitHub](https://github.com/zai-org/GLM-5)
- [Informe técnico de GLM-5 (arXiv:2602.15763)](https://arxiv.org/abs/2602.15763)
- [Paper de IndexShare (arXiv:2603.12201)](https://arxiv.org/abs/2603.12201)
- [Blog de GLM-5.2 en Z.ai](https://z.ai/blog/glm-5.2)
- [Documentación de despliegue en SGLang](https://cookbook.sglang.io/autoregressive/GLM/GLM-5.2)
- [Recetas de vLLM](https://recipes.vllm.ai/zai-org/GLM-5.2)
- [Guía de Unsloth](https://unsloth.ai/docs/models/glm-5.2)
