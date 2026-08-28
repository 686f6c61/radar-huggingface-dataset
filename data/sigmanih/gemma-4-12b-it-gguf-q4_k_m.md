# sigmanih/gemma-4-12B-it-GGUF-Q4_K_M

## Resumen

El modelo **gemma-4-12B-it-GGUF-Q4_K_M** es una versión cuantizada en formato GGUF del modelo Gemma 4 12B it, publicada por el usuario `sigmanih` a través de la herramienta Sigma Studio. Está diseñado para tareas de generación de texto, con especial énfasis en programación, asistentes conversacionales, agentes autónomos y razonamiento. El modelo se distribuye bajo licencia Apache 2.0 y soporta los idiomas inglés e italiano.

Con aproximadamente 11,9 mil millones de parámetros y una ventana de contexto de 32.768 tokens, esta variante ofrece un equilibrio entre rendimiento y requisitos de hardware, siendo ejecutable en GPUs de consumo medio-alto. El autor reporta una velocidad de inferencia de 87,8 tokens por segundo en una NVIDIA RTX 5070 Ti, y estima hasta 219 tokens por segundo en GPUs de gama alta como la RTX 4090 o A100. Aunque el repositorio se identifica como GGUF con cuantización Q4_K_M, la model card indica que los pesos están disponibles en formato Safetensors (BF16/FP16), lo que genera cierta ambigüedad sobre el contenido real del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CausalLM (transformer decoder-only, según la información disponible) |
| Parametros totales | 11.907.350.576 (~11,9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | Q4_K_M (según el nombre del repositorio); el autor menciona Safetensors BF16/FP16 en la model card |
| Idiomas soportados | Inglés (en), Italiano (it) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (según ID del repositorio); Safetensors según la model card |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de indicar que es un modelo CausalLM, típico de los transformadores decoder-only. No se especifica si se trata de un modelo denso o con mezcla de expertos, aunque el número de parámetros activos (12B) coincide con el total, lo que sugiere una arquitectura densa. No hay datos sobre el proceso de entrenamiento: ni número de tokens, ni composición del dataset, ni técnicas de alineación como RLHF o DPO. El autor solo indica que el modelo fue "optimizado y publicado" mediante Sigma Studio, sin aportar detalles sobre el fine-tuning o la cuantización aplicada.

## Capacidades

- Generación de texto en inglés e italiano, con perfil conversacional.
- Razonamiento y resolución de problemas, con soporte para cadenas de pensamiento (según el protocolo de evaluación que incluye `cot_generation`).
- Generación de código, con resultados moderados en HumanEval (71% en la evaluación parcial del autor).
- Capacidad para tareas de agentes autónomos y bucles de razonamiento, según el perfil de uso recomendado.
- No se menciona soporte explícito para tool calling, visión, audio u otras modalidades.

## Casos de uso

- Asistente de programación en entornos de desarrollo: el modelo puede generar y completar código en múltiples lenguajes, integrándose en editores o pipelines de CI/CD para revisión y generación de fragmentos.
- Chat conversacional para atención al cliente: su ventana de contexto de 32K tokens permite mantener conversaciones multi-turno con historial extenso, adecuado para asistentes virtuales en inglés o italiano.
- Agente autónomo para automatización de tareas: gracias a su capacidad de razonamiento y generación de texto, puede orquestar flujos de trabajo simples, como extraer información de documentos o generar informes.
- Resolución de problemas matemáticos y lógicos: con un 100% en GSM8K (evaluación parcial), es útil para aplicaciones educativas o de cálculo simbólico básico.
- Generación de contenido creativo: redacción de artículos, correos electrónicos o material de marketing en los idiomas soportados, con un tono coherente.
- Prototipado rápido de aplicaciones NLP: al ser un modelo de 12B con licencia permisiva, permite experimentar en tareas de clasificación, extracción de información o resumen sin necesidad de infraestructura de gran escala.

## Benchmarks y rendimiento

El autor proporciona una evaluación parcial sobre una porción del dataset (72/100 preguntas), no comparable con ejecuciones completas. Los resultados se obtuvieron con temperatura 0 y semilla 42 en GPU mediante SigmaEngine.

| Suite | Aciertos | Total | % |
|---|---|---|---|
| ARC-Challenge | 8 | 9 | 89% |
| BIG-Bench Hard | 7 | 7 | 100% |
| GPQA | 5 | 9 | 56% |
| GSM8K | 9 | 9 | 100% |
| HellaSwag | 5 | 9 | 56% |
| HumanEval | 5 | 7 | 71% |
| MATH | 8 | 9 | 89% |
| MBPP | 0 | 9 | 0% |
| MMLU | 11 | 14 | 79% |
| MMLU-Pro | 5 | 9 | 56% |
| TruthfulQA | 9 | 9 | 100% |

**Puntuación global:** 72,0% (72/100). **Nota importante:** estos valores provienen de una muestra reducida y no deben compararse con resultados de suites completas.

## Requisitos de hardware

- VRAM estimada: el modelo en cuantización Q4_K_M ocupa aproximadamente 6,87 GB en disco, por lo que la VRAM necesaria para inferencia ronda los 8-10 GB, dependiendo del contexto y la implementación.
- GPUs compatibles: cualquier GPU con al menos 8 GB de VRAM puede ejecutarlo. El autor reporta 87,8 tok/s en una RTX 5070 Ti (15,9 GB VRAM).
- Tier de rendimiento estimado por el autor:
  - Tier 1 (RTX 4090, RTX 3090, A100, H100): 158-219 tok/s.
  - Tier 2 (RTX 4070 Ti, RTX 4070, RTX 3080 12GB): 96-131 tok/s.
  - Tier 3 (RTX 4060 Ti 16GB, RTX 3060 12GB, Apple M2/M3/M4): 61-87 tok/s.
  - Tier 4 (CPU con offloading, 32GB RAM): 17-35 tok/s.
- Opciones de despliegue: compatible con Transformers/PyTorch (según el ejemplo de la model card) y con GGUF, por lo que puede usarse con llama.cpp, Ollama o servidores como vLLM si se convierte el formato.
- Latencia: no se proporcionan valores de latencia específicos, solo throughput.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de la misma categoría en los datos proporcionados. La búsqueda web muestra otros repositorios GGUF del mismo modelo base (bartowski, ggml-org), pero no se ofrecen métricas comparables. Por tanto, no se puede establecer una comparación objetiva.

## Limitaciones y advertencias

- La evaluación de benchmarks es parcial y no representa el rendimiento completo del modelo; los resultados de MBPP (0%) sugieren posibles deficiencias en generación de código en ciertos contextos.
- No hay información sobre sesgos, alucinaciones o comportamientos no deseados específicos de este modelo. Como todo LLM, puede generar contenido incorrecto o inventado.
- El soporte de idiomas se limita a inglés e italiano; no se garantiza un buen rendimiento en otros idiomas.
- Existe ambigüedad sobre el formato real de los pesos: el nombre indica GGUF, pero la model card afirma Safetensors. Esto puede afectar a la integración en determinadas herramientas.
- La licencia Apache 2.0 permite uso comercial, pero es recomendable verificar el cumplimiento de las políticas de Google si el modelo base deriva de Gemma 4, aunque no se confirma esta relación en la documentación.
- No se especifican técnicas de alineación (RLHF, DPO), por lo que el modelo podría mostrar comportamientos menos seguros que alternativas con alineación explícita.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sigmanih/gemma-4-12B-it-GGUF-Q4_K_M
- Sigma Studio (GitHub): https://github.com/Sigmanih/SigmaStudio
- Repositorio alternativo GGUF (bartowski): https://huggingface.co/bartowski/gemma-4-12B-it-GGUF
- Repositorio alternativo GGUF (ggml-org): https://huggingface.co/ggml-org/gemma-4-12B-it-GGUF
- Página oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Guía de cuantización GGUF para Gemma 4: https://gemma4-ai.com/blog/gemma4-gguf-guide
- Guía de VRAM para Gemma 4 local: https://knightli.com/en/2026/05/01/gemma-4-local-vram-quantization-table/
