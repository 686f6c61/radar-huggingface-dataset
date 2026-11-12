# bltx96/Huihui-DeepSeek-V4.1-Flash-1017-abliterated-GGUF

## Resumen

Huihui-DeepSeek-V4.1-Flash-1017-abliterated-GGUF es una versión "abliterated" (sin filtros de rechazo) del modelo DeepSeek-V4.1-Flash-1017, publicada por el usuario bltx96 en Hugging Face. El trabajo de abliteración se realizó originalmente por huihui-ai sobre los pesos GGUF del modelo base, aplicando una técnica de sustracción de dirección de rechazo mediante la herramienta `cvector-generator` de llama.cpp, sin usar Transformers en el proceso. El resultado es un modelo conversacional multimodal (pipeline `image-text-to-text`) que acepta entradas de imagen y texto, con capacidades de generación de texto reducidas en cuanto a filtrado de seguridad.

El repositorio se distribuye principalmente como GGUF cuantizado, con múltiples variantes y parches: las cuantizaciones UD- de Unsloth, los formatos GSQ-RCO-Coder de ISTA-DASLab, y los parches Strata y Maya de proyectos independientes. Solo se abliteraron las capas 11 a 28 (indexación 0-based) y únicamente 18 tensores `attn_output_b`; el sistema de expertos (MoE) no fue modificado. El repositorio ocupa 599 GB, lo que refleja la inclusión de numerosas variantes de cuantización y parches diferenciales en lugar de pesos completos.

La relevancia de esta ficha es doble: por un lado, documenta un modelo derivado de una familia DeepSeek de nueva generación con arquitectura MoE y capacidades multimodales; por otro, advierte de que se trata de una modificación que elimina deliberadamente los mecanismos de rechazo, con las implicaciones éticas y legales que ello conlleva. La información disponible sobre el modelo base es limitada, por lo que muchos parámetros se indican como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mixture-of-experts) transformer, según tags del repo; detalles no disponibles |
| Parámetros totales | 1.677.721.600 (dato de safetensors del repo; ver nota) |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens (según ejemplo de `llama-cli -c 262144` en la model card) |
| Tipos de cuantización | GGUF: UD-IQ1_S, UD-IQ1_M, UD-IQ2_XXS, UD-Q2_K_XL, IQ2_XXS (GSQ-RCO-Coder); parches Strata, Maya, Unsloth |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors referenciado en metadatos del repo) |

Nota: el dato de parámetros totales (1.677.721.600) procede de los metadatos de safetensors del repositorio y resulta anómalamente bajo para un modelo MoE de la familia DeepSeek; no se dispone de confirmación adicional en la información proporcionada.

## Arquitectura y entrenamiento

El modelo base es DeepSeek-V4.1-Flash-1017, un modelo de la familia DeepSeek con arquitectura de mezcla de expertos (MoE) y pipeline multimodal `image-text-to-text`, lo que indica capacidad de procesar imágenes además de texto. Los tags del repositorio confirman la naturaleza MoE y la presencia de un sistema de expertos. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo base.

La modificación principal es la abliteración: se calculó una dirección de rechazo y se sustrajo de los pesos de las capas 11 a 28 (indexación 0-based), afectando únicamente a 18 tensores `attn_output_b`. El sistema de expertos no fue alterado. El proceso se realizó íntegramente sobre GGUF con `cvector-generator` de llama.cpp. Además, el repositorio incluye parches diferenciales (Strata, Maya, Unsloth, GSQ-RCO-Coder) que permiten reconstruir variantes cuantizadas a partir de pesos base, ahorrando espacio de almacenamiento; estos parches deben aplicarse manualmente ejecutando los comandos indicados en cada directorio.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), lo que permite tareas de descripción de imágenes, VQA y razonamiento visual.
- Razonamiento y generación de código, heredados del modelo base DeepSeek-V4.1-Flash-1017.
- Soporte de contexto largo: hasta 262.144 tokens según el ejemplo de invocación de la model card.
- Compatibilidad con endpoints (`endpoints_compatible` en tags), lo que facilita su despliegue en infraestructuras compatibles con la API de Hugging Face.
- Capacidad de ejecución en llama.cpp (versión b11870 o superior), incluyendo `llama-cli`, `llama-mtmd-cli` (multimodal) y `llama-server`.
- Al estar abliterated, no aplica rechazo ante solicitudes que el modelo base rechazaría; esto es una capacidad técnica pero también un riesgo (ver limitaciones).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-step: no disponible en la información proporcionada.
- Idiomas: no disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un LLM sin mecanismos de rechazo, comparando respuestas con el modelo base para analizar qué direcciones de activación codifican el rechazo. Es adecuado porque la abliteración está documentada (capas 11-28, 18 tensores) y es reproducible.
- Análisis de robustez de filtros: evaluar si los sistemas de moderación externos detectan contenido generado por un modelo abliterated, usando el modelo como generador controlado en un entorno de laboratorio.
- Despliegue local con llama.cpp en contexto largo: procesar documentos extensos (hasta 262.144 tokens) en hardware de consumo mediante cuantizaciones IQ1/IQ2, con `llama-server` como backend compatible con la API de OpenAI.
- Tareas multimodales controladas: descripción de imágenes y VQA en entornos de investigación donde se requiere un modelo sin filtros para estudiar sesgos visuales, usando `llama-mtmd-cli`.
- Generación de código en pipelines internos: el modelo hereda capacidades de código del base DeepSeek; puede integrarse en herramientas de desarrollo en entornos aislados, aunque sin garantías de seguridad de contenido.
- Pruebas de estrés de sistemas de moderación y red teaming: generar contenido adversario de forma controlada para validar clasificadores y filtros de una plataforma, en un entorno cerrado y con revisión humana.
- Experimentación con parches de cuantización: el repositorio incluye parches Strata, Maya y Unsloth que permiten a investigadores estudiar el impacto de distintas técnicas de cuantización mixta (GSQ, RCO, imatrix) sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma directa. El repositorio ocupa 599 GB e incluye múltiples variantes; las cuantizaciones IQ1_S e IQ2_XXS son las más pequeñas y están pensadas para reducir requisitos, pero no se especifican cifras de VRAM.
- GPU recomendadas: no disponible. El ejemplo de compilación de la model card usa `-DGGML_CUDA=ON`, lo que indica soporte CUDA genérico.
- Cabe en GPU de consumo: probablemente sí con las cuantizaciones IQ1/IQ2, pero no se confirma en la información disponible.
- Opciones de despliegue: llama.cpp (versión b11870 o superior), con `llama-cli`, `llama-mtmd-cli` (multimodal), `llama-server` y `llama-gguf-split`. También se menciona compatibilidad con endpoints. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Huihui-DeepSeek-V4.1-Flash-1017-abliterated (este) | 1.677.721.600 (metadatos) | 262.144 | MIT | GGUF | Abliterated, multimodal, parches múltiples |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | no disponible | no disponible | no disponible | no disponible | Modelo original con filtrado de seguridad |
| ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-Coder-GGUF | no disponible | no disponible | no disponible | GGUF | Cuantización GSQ-RCO-Coder del mismo base |
| unsloth/DeepSeek-V4.1-Flash-1017-GGUF | no disponible | no disponible | no disponible | GGUF | Cuantizaciones UD- del mismo base |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Filtrado de seguridad reducido: la abliteración elimina los mecanismos de rechazo, por lo que el modelo puede generar contenido sensible, controvertido o inapropiado. La propia model card lo advierte explícitamente.
- No apto para todos los públicos: los outputs pueden ser inadecuados para entornos públicos, menores o aplicaciones que requieran alta seguridad.
- Responsabilidad legal y ética: el usuario debe garantizar el cumplimiento de las leyes locales; el contenido generado puede conllevar riesgos legales.
- Uso recomendado solo para investigación y entornos controlados: la model card desaconseja el uso directo en producción o en aplicaciones comerciales de cara al público.
- Riesgo de alucinación: no cuantificado en la información disponible, pero inherente a los LLM; la ausencia de filtros puede agravar la difusión de información falsa sin advertencia.
- Idiomas soportados: no disponibles, lo que impide garantizar calidad multilingüe.
- Ambigüedad en los parámetros: el dato de 1.677.721.600 parámetros totales de safetensors es inconsistente con un modelo MoE de la familia DeepSeek; conviene verificar antes de planificar el despliegue.
- Requisito de versión específica: llama.cpp b11870 o superior; versiones anteriores pueden no cargar los GGUF correctamente.
- Parches manuales: las variantes Strata, Maya y Unsloth requieren ejecutar comandos de parcheo; no son pesos listos para usar directamente.
- Licencia MIT: permite uso comercial, pero ello no exime de las responsabilidades legales y éticas derivadas del contenido generado sin filtros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bltx96/Huihui-DeepSeek-V4.1-Flash-1017-abliterated-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Cuantizaciones Unsloth del base: https://huggingface.co/unsloth/DeepSeek-V4.1-Flash-1017-GGUF
- Cuantizaciones GSQ-RCO-Coder (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-Coder-GGUF
- Cuantizaciones GSQ-RCO (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Herramienta cvector-generator (llama.cpp): https://github.com/ggml-org/llama.cpp/blob/master/tools/cvector-generator/README.md
- Release de llama.cpp b11870: https://github.com/ggml-org/llama.cpp/releases/tag/b11870
- Proyecto Strata: https://github.com/Niko1221/Strata
- Proyecto Maya: https://github.com/mw00/project-maya
- README del parche Strata: https://huggingface.co/huihui-ai/Huihui-DeepSeek-V4.1-Flash-1017-abliterated-GGUF/tree/main/patch-Strata-GSQ-RCO-Coder
- README del parche Unsloth Q2: https://huggingface.co/huihui-ai/Huihui-DeepSeek-V4.1-Flash-1017-abliterated-GGUF/tree/main/patch-unsloth-Q2
- README del parche Maya: https://huggingface.co/huihui-ai/Huihui-DeepSeek-V4.1-Flash-1017-abliterated-GGUF/tree/main/Maya
- README del parche Strata (IST-DAS): https://huggingface.co/huihui-ai/Huihui-DeepSeek-V4.1-Flash-1017-abliterated-GGUF/tree/main/Strata-deepseek-v4.1-flash-IST-DAS
- README del parche Unsloth: https://huggingface.co/huihui-ai/Huihui-DeepSeek-V4.1-Flash-1017-abliterated-GGUF/tree/main/unsloth
