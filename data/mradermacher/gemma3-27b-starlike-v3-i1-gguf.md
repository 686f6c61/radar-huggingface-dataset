# mradermacher/gemma3-27b-starlike-v3-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo `ToastyPigeon/gemma3-27b-starlike-v3`, un merge creado con mergekit sobre la base de Gemma 3 27B de Google. El autor de las cuantizaciones es mradermacher, que publica tanto versiones estáticas como versiones con `imatrix` (prefijo `i1-`) para mejorar la calidad de la cuantización en los niveles más bajos.

El modelo subyacente, Gemma 3 27B, es un transformer denso de 27 000 millones de parámetros con una ventana de contexto de 128 000 tokens, capacidades multimodales (visión) y soporte para más de 140 idiomas en su versión original. Este merge concreto declara únicamente inglés como idioma soportado, y no se especifica qué capas o pesos se han fusionado para obtener el comportamiento «starlike». La relevancia de este repositorio reside en ofrecer el modelo en formato GGUF, lo que permite ejecutarlo en hardware de consumo mediante `llama.cpp`, Ollama u otros runners compatibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 3 27B) |
| Parametros totales | 27 009 007 616 (27 B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 128 000 tokens (especificación de Gemma 3; no confirmada en la model card) |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en (declarado en la model card; Gemma 3 base soporta 140+) |
| Licencia | No disponible (la licencia de Gemma 3 no se menciona en la model card) |
| Formato de pesos | GGUF (con cuantización `imatrix`) |

## Arquitectura y entrenamiento

Gemma 3 27B es un transformer denso con atención local-globalizada: combina atención local (ventana de 1024 tokens) con atención global en capas seleccionadas para reducir el coste computacional y permitir ventanas de contexto de hasta 128 000 tokens. El modelo original de Google se entrena con destilación de Gemini y usa `RMSNorm`, activaciones GeGLU y una arquitectura de decoder-only estándar. El merge `starlike-v3` aplica técnicas de `mergekit` (posiblemente SLERP o TIES) sobre Gemma 3 27B, aunque no se publican detalles sobre los pesos o los modelos que se fusionaron. No se indica si hubo entrenamiento adicional (fine-tuning, RLHF o DPO) tras la fusión.

Las cuantizaciones de este repositorio se generaron con `imatrix`, un método que calcula matrices de importancia sobre activaciones reales para minimizar la pérdida de perplejidad, especialmente en quants de baja precisión (IQ1, IQ2, IQ3). Esto explica el prefijo `i1-` en todos los archivos.

## Capacidades

- Generación de texto y razonamiento: al estar basado en Gemma 3 27B, mantiene capacidades de razonamiento complejo, matemáticas y comprensión de instrucciones.
- Soporte multimodal (en el modelo base): Gemma 3 27B acepta imágenes como entrada adicional, aunque la merge no documenta si esta capacidad se conserva íntegramente.
- Contexto largo: ventana de 128 000 tokens, útil para documentos extensos, historiales de conversación largos o análisis de repositorios de código.
- Multilingüismo: el modelo base soporta más de 140 idiomas, pero la model card de la merge declara solo inglés.
- Tool calling y function calling: no se menciona explícitamente en la model card, pero Gemma 3 27B incluye soporte para tool calling en su versión oficial.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede desplegarse en plataformas de inferencia compatibles con OpenAI API.

## Casos de uso

- **Asistentes de código en local**: gracias a la cuantización GGUF, puede ejecutarse en estaciones de trabajo con GPU de 8-16 GB (usando Q4_K_M o Q5_K_M) para autocompletar código, explicar fragmentos y refactorizar proyectos de tamaño medio.
- **Análisis de documentos largos**: con su ventana de 128 000 tokens, permite resumir contratos, informes o papers de decenas de páginas en una sola pasada, sin necesidad de chunking complejo.
- **Chatbots de atención al cliente**: desplegado con Ollama o llama.cpp, puede gestionar conversaciones multi-turno con historial largo, manteniendo coherencia gracias al contexto extendido.
- **Extracción de información estructurada**: desde texto libre, puede generar JSON o tablas a partir de documentos no estructurados, útil para pipelines de datos.
- **Generación de documentación técnica**: dado su entrenamiento en código y texto técnico, puede redactar README, comentarios y guías de API a partir de código fuente.
- **Prototipado de agentes**: aunque no se confirma el tool calling, la arquitectura de Gemma 3 permite integrar el modelo en agentes de razonamiento multi-paso para automatizar tareas de investigación y análisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se puede comparar cuantitativamente el rendimiento de la merge `starlike-v3` con el Gemma 3 27B original ni con otras merges. La model card solo indica que los quants con `imatrix` (prefijo `i1-`) suelen tener mejor perplejidad que los equivalentes estáticos, y que IQ3_S supera a Q3_K*, pero no se aportan cifras concretas.

## Requisitos de hardware

- **VRAM estimada para inferencia**:
  - Quants de baja precisión (IQ1_S, IQ2_XXS): 6-8 GB de VRAM, ejecutables en GPUs de 8 GB (RTX 3060, RTX 4060).
  - Quants medios (IQ3_XS, Q4_K_S): 11-12 GB de VRAM, aptos para RTX 3080/3090, RTX 4070 Ti Super.
  - Quants altos (Q5_K_M, Q6_K): 18-22 GB de VRAM, requieren RTX 3090/4090 o A6000.
- **GPU recomendadas**: RTX 3090 o RTX 4090 para quants Q4_K_M y superiores; A100 40 GB para Q6_K con contexto largo.
- **¿Cabe en GPU de consumo?** Sí, la mayoría de quants caben en GPUs de consumo de 8-24 GB, aunque los quants más altos requieren 24 GB.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, vLLM (con soporte GGUF), text-generation-webui. También compatible con plataformas que usan el formato GGUF.
- **Latencia y throughput**: no disponible. Depende fuertemente de la GPU, el quant elegido y la longitud de contexto. En una RTX 4090 con Q4_K_M se esperan velocidades de 20-40 tokens/s para contexto corto, pero no hay mediciones publicadas para esta merge concreta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Gemma 3 27B (original) | 27 B | 128 000 | Gemma License | safetensors |
| Qwen 2.5 27B | 27 B | 128 000 | Apache 2.0 | safetensors, GGUF |
| Llama 3.1 8B | 8 B | 128 000 | Llama License | safetensors, GGUF |
| Esta merge (starlike-v3) | 27 B | 128 000 (no confirmado) | No disponible | GGUF |

La comparativa es orientativa: la merge `starlike-v3` no tiene benchmarks publicados, por lo que no se puede establecer una comparación de rendimiento con Qwen 2.5 27B o Llama 3.1 8B. La principal ventaja de este repositorio es la disponibilidad de quants con `imatrix`, que en modelos de 27 B suelen ofrecer mejor relación calidad/tamaño que los quants estáticos.

## Limitaciones y advertencias

- **Sesgos y alucinación**: como cualquier modelo de lenguaje de 27 B, puede generar contenido falso o sesgado. La merge no documenta ninguna mitigación adicional.
- **Idioma**: la model card declara solo `en`; aunque Gemma 3 base soporta 140+ idiomas, el merge podría degradar el rendimiento en otros idiomas.
- **Licencia**: no se especifica la licencia de la merge. Si se usa comercialmente, conviene verificar la licencia de Gemma 3 (Gemma Terms of Use) y la del merge original `ToastyPigeon/gemma3-27b-starlike-v3`.
- **Calidad de la cuantización**: los quants IQ1_S, IQ1_M e IQ2_XXS son de muy baja calidad (el propio autor los describe como «para los desesperados»). No se recomiendan para producción.
- **Contexto largo**: aunque Gemma 3 soporta 128 000 tokens, la merge no confirma que se conserve esta capacidad. Es necesario probar con contextos largos reales antes de usarla en producción.
- **Tool calling y multimodalidad**: no se confirma que la merge conserve estas capacidades del modelo base. Hay que validarlas empíricamente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/gemma3-27b-starlike-v3-i1-GGUF
- Modelo base (merge): https://huggingface.co/ToastyPigeon/gemma3-27b-starlike-v3
- Quants estáticos del mismo autor: https://huggingface.co/mradermacher/gemma3-27b-starlike-v3-GGUF
- Modelo base de Gemma 3 (Google DeepMind): https://deepmind.google/models/gemma/gemma-3/
- Repositorio GitHub de Gemma 3: https://github.com/gemma-3/
- Guía de calidad de quants (referencia del autor): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
