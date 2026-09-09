# abenzerps/Nex-N2.5-mini-GGUF

## Resumen

Nex-N2.5-mini es un modelo generativo de la familia Nex-N2.5, desarrollado por Nex-AGI y convertido a formato GGUF por el usuario abenzerps. Su arquitectura es un MoE (Mixture of Experts) basado en Qwen3.5, según las etiquetas del repositorio, con un total de 34.660.610.688 parámetros. El checkpoint original está diseñado para cargas de trabajo agénticas: generación de código, uso de herramientas, computer use y procesamiento multimodal.

La conversión GGUF publica diecisiete variantes de cuantización, desde Q8_0 hasta IQ1_S, además de un proyector multimodal opcional. La ventana de contexto nativa es de 262.144 tokens (256K), lo que permite manejar documentos extensos y conversaciones prolongadas. El modelo está liberado bajo licencia Apache-2.0 y, según sus metadatos, soporta los idiomas inglés y chino. Su interés principal para desarrolladores es poder ejecutar un modelo agéntico de contexto largo en local mediante llama.cpp, sin necesidad de servicios externos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE basada en Qwen3.5 según etiquetas, con proyector multimodal opcional |
| Parámetros totales | 34.660.610.688 |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantización | Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q4_0, Q3_K_M, Q3_K_S, IQ3_XXS, Q2_K, IQ2_M, IQ2_XS, IQ2_XXS, IQ1_M, TQ1_0, IQ1_S |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (modelo base safetensors) |

## Arquitectura y entrenamiento

La arquitectura es un MoE que reaprovecha la familia Qwen3.5 como base, tal como indican las etiquetas del repositorio (`qwen3.5`, `qwen3.5-moe`). No se especifica el número de expertos ni cuántos parámetros se activan por token, por lo que el dato de parámetros activos queda pendiente. El checkpoint incluye un proyector multimodal en precisión F16 para entrada de visión, que se distribuye como archivo opcional en la conversión GGUF. Este proyector habilita la comprensión de imágenes y capturas en runtimes con soporte multimodal.

La ventana de contexto nativa es de 262.144 tokens, preparada para razonamiento multi-paso y uso de herramientas. Algunas cuantizaciones IQ utilizan importance-matrix quantization (`imatrix`), una técnica que preserva mejor la calidad del modelo al reducir la precisión de los pesos. No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas de alineación como RLHF o DPO en la documentación disponible.

## Capacidades

- Generación de texto conversacional con capacidad de razonamiento y plantillas de chat embebidas.
- Soporte de tool calling y function calling, siempre que el runtime de servidor y su parser gestionen correctamente las llamadas.
- Capacidad multimodal para visión mediante el proyector F16 opcional.
- Diseñado para agentes y tareas de computer use, con manejo de instrucciones largas y dependencias entre pasos.
- Ventana de contexto amplia, hasta 262.144 tokens.
- Idiomas soportados según metadatos: inglés y chino.
- Compatible con endpoints estilo OpenAI a través de `llama-server`.

## Casos de uso

- Asistente de programación local: con la ventana de 256K, puede procesar repositorios completos, múltiples archivos y documentación en una sola pasada para generar o refactorizar código. La ejecución local con llama.cpp evita enviar código a la nube.
- Automatización de pipelines con tool calling: el modelo puede integrarse en sistemas de CI/CD para analizar logs, generar parches o ejecutar comandos mediante funciones externas, gracias a su soporte agéntico.
- Agente de automatización de escritorio (computer use): con el proyector multimodal, puede interpretar capturas de pantalla y guiar interacciones con aplicaciones de escritorio, como rellenar formularios o navegar por interfaces.
- Análisis de documentos largos: la ventana de 262.144 tokens permite procesar contratos, informes o artículos académicos completos en una sola pasada y extraer resúmenes o cláusulas relevantes.
- Atención al cliente bilingüe: el modelo está entrenado para inglés y chino, lo que permite gestionar conversaciones multi-turno con contexto largo y conectar con herramientas de base de conocimiento o de soporte.
- Análisis de diagramas y capturas técnicas: el proyector F16 posibilita interpretar diagramas de arquitectura, gráficos o screenshots en contextos de documentación o revisión de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una imagen con resultados de la familia Nex-N2.5 reportados por Nex-AGI, pero dicha imagen no se recoge en el texto proporcionado y los datos no corresponden a esta conversión GGUF. Por tanto, no es posible presentar una tabla de benchmarks sin riesgo de inventar cifras.

## Requisitos de hardware

La VRAM estimada para inferencia depende de la cuantización elegida y de la ventana de contexto utilizada. A continuación se listan estimaciones orientativas a partir del tamaño de los archivos GGUF:

- Q8_0 (36,90 GB): requiere alrededor de 40–45 GB de VRAM con contexto corto; GPU recomendada: A100 80GB o H100 80GB.
- Q6_K (28,51 GB): requiere unos 32–35 GB de VRAM; GPU recomendada: A100 40GB o 2× RTX 4090 24GB en paralelo.
- Q5_K_M (24,73 GB) y Q5_K_S (23,98 GB): requieren entre 27 y 30 GB de VRAM; una RTX 4090 24GB funciona con contexto limitado.
- Q4_K_M (21,17 GB) y Q4_K_S (19,89 GB): requieren entre 23 y 25 GB de VRAM; RTX 4090 24GB es la opción más adecuada en GPU de consumo.
- Q2_K (12,94 GB): requiere unos 16 GB de VRAM; compatible con RTX 4080 16GB o similar.
- IQ2_XXS (9,50 GB): requiere unos 12 GB de VRAM; RTX 3060 12GB puede ejecutarlo.
- IQ1_S (7,48 GB): requiere unos 10 GB de VRAM; GPU de consumo con 10–12 GB, aunque con ventana de contexto muy reducida.

Opciones de despliegue: llama.cpp mediante `llama-cli` o `llama-server`, así como runtimes compatibles con GGUF como Ollama o LM Studio. El modelo original en safetensors sería necesario para vLLM o TGI. No se han publicado datos de latencia ni throughput en la información disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa formal con modelos de la misma categoría. La model card no incluye benchmarks medidos en esta conversión GGUF ni especificaciones completas de modelos comparables. Por tanto, la comparativa de rendimiento se marca como no disponible. En cuanto a características de contexto y licencia, podría considerarse próximos al resto de modelos MoE de la familia Qwen, pero no hay datos públicos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Los benchmarks mostrados en la model card pertenecen a la familia original Nex-N2.5 y no a esta conversión GGUF; los resultados pueden variar en la práctica.
- Las cuantizaciones extremadamente agresivas (TQ1_0, IQ1_S, IQ1_M) pueden degradar notablemente la calidad de las respuestas.
- El soporte real de tool calling depende del runtime de servidor y de su integración con el parser de funciones; debe verificarse en la aplicación objetivo.
- La ventana de contexto completa de 262.144 tokens requiere una cantidad de memoria muy elevada. En GPU de consumo solo se puede utilizar una fracción de dicha ventana.
- Los metadatos indican soporte de inglés y chino; no se ha documentado el rendimiento en otros idiomas.
- No se ha publicado documentación sobre el proceso de entrenamiento, la composición del dataset ni los sesgos potenciales del modelo.
- El formato GGUF limita el despliegue a runtimes compatibles con llama.cpp; para vLLM o TGI se necesitaría el checkpoint safetensors original.

## Enlaces

- Página del modelo GGUF: https://huggingface.co/abenzerps/Nex-N2.5-mini-GGUF
- Modelo base: https://huggingface.co/nex-agi/Nex-N2.5-mini
- Colección Nex-N2.5: https://huggingface.co/collections/abenzerps/nex-n25
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Commit de conversión utilizado: https://github.com/ggml-org/llama.cpp/commit/f3f1a8f2760f28325a5ec20c05b171e5b7c83a29
- Plantilla de chat externa: https://huggingface.co/abenzerps/Nex-N2.5-mini-GGUF/blob/main/chat_template.jinja
- Checksums: https://huggingface.co/abenzerps/Nex-N2.5-mini-GGUF/blob/main/SHA256SUMS.txt
