# nerkyor/Qwen3.8-27B-EfficientThink-Uncensored-K3-Opus5-Grok4.6-GPT5.6Sol-SFT-SimPO-DFlash2-GGUF

## Resumen

El modelo `Qwen3.8-27B-EfficientThink-Uncensored-K3-Opus5-Grok4.6-GPT5.6Sol-SFT-SimPO-DFlash2-GGUF` es un fine-tune del modelo denso vision-language Qwen3.8-27B, desarrollado por el usuario `nerkyor` y publicado en HuggingFace. Está diseñado para ofrecer un razonamiento eficiente (EfficientThink) y sin censura (Uncensored), combinando técnicas de ajuste fino como SFT y SimPO, junto con la decodificación especulativa DFlash2 para reducir la latencia de inferencia. El repositorio contiene cuantizaciones GGUF que van de Q2 a Q8, lo que permite su ejecución en una amplia gama de hardware, desde GPUs de consumo hasta servidores de alta gama.

El modelo base Qwen3.8-27B es un transformer denso de 27.000 millones de parámetros con capacidades nativas de visión y lenguaje, control flexible de pensamiento y soporte para tareas multi-paso. Este fine-tune mantiene esas capacidades y añade un comportamiento "uncensored" que elimina restricciones de contenido, lo que lo hace adecuado para investigación y aplicaciones que requieren respuestas sin filtros, aunque con las advertencias éticas correspondientes. Cabe señalar que el nombre del modelo indica 27B, pero el dato de safetensors del repositorio muestra 1.924.404.480 parámetros; esta discrepancia se aborda en la sección de especificaciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso vision-language (base Qwen3.8-27B) |
| Parámetros totales | 27B nominal; 1.924.404.480 según safetensors del repo (posible archivo auxiliar) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens por slot en configuración medida (8 slots, 262.144 total); contexto nativo no disponible |
| Tipos de cuantización | GGUF: Q8_0, Q6_K, Q5-LynnStyle, Q4-LynnStyle, Q3-LynnStyle, Q2-LynnStyle; draft Q4_K_M para DFlash2 |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el repo principal ofrece BF16/FP8 |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen3.8-27B, un transformer denso con arquitectura vision-language nativa que procesa imágenes y vídeos, además de texto. El ajuste fino realizado por `nerkyor` combina SFT (supervised fine-tuning) y SimPO, un método de optimización de preferencias similar a DPO, y utiliza datos generados a partir de otros modelos (K3-Opus5, Grok4.6, GPT5.6Sol) para potenciar el razonamiento eficiente y la ausencia de censura. No se han publicado detalles sobre el número de tokens de entrenamiento ni la composición exacta del dataset.

La innovación técnica destacable es la integración de DFlash2, un método de decodificación especulativa que permite generar múltiples tokens por paso de verificación, mejorando el throughput sin sacrificar la calidad. El modelo conserva el modo de pensamiento (thinking mode) del modelo base, activable mediante argumentos `--jinja` y `--draft-dflash` en llama.cpp.

## Capacidades

- Generación de texto y razonamiento complejo, con puntuaciones elevadas en GPQA (hasta 86,87% en Q3-LynnStyle) y MMLU (hasta 89,40% en Q8_0).
- Generación de código, con resultados de 78% en LiveCodeBench para las cuantizaciones Q6_K y Q3-LynnStyle.
- Razonamiento multi-paso y modo de pensamiento (thinking mode), heredado del modelo base Qwen3.8-27B.
- Capacidades de visión: soporta entrada de imágenes mediante el sidecar `--mmproj`, lo que permite análisis de documentos visuales y comprensión de vídeos.
- Soporte multilingüe para inglés y chino.
- Decodificación especulativa con DFlash2, que acelera la generación mediante un modelo borrador (draft) externo.
- No se menciona explícitamente soporte de tool calling o function calling en la documentación disponible.

## Casos de uso

- Razonamiento científico y técnico: el modelo alcanza un 86,36% en GPQA (Q6_K), lo que lo hace adecuado para responder preguntas de nivel de posgrado en física, química y biología.
- Generación de código en producción: con un 78% en LiveCodeBench, puede integrarse en pipelines de desarrollo asistido por IA, especialmente en tareas de programación competitiva y refactorización.
- Análisis de documentos con imágenes: al ser un modelo vision-language, puede extraer información de capturas de pantalla, diagramas y documentos escaneados, útil en sistemas de automatización documental.
- Asistentes conversacionales multilingües: su soporte para inglés y chino, junto con la ventana de contexto larga, permite gestionar conversaciones multi-turno en aplicaciones de atención al cliente global.
- Despliegue de servidores de inferencia de alta concurrencia: gracias a las cuantizaciones GGUF y DFlash2, se puede servir con llama.cpp en configuraciones de 8 slots y 262.144 tokens de contexto total, ideal para entornos con múltiples usuarios.
- Investigación en modelos sin censura: su naturaleza "uncensored" lo hace útil para estudios sobre alineación, seguridad y comportamiento de modelos cuando se eliminan las restricciones de contenido.

## Benchmarks y rendimiento

La siguiente tabla recoge los resultados publicados por el autor para cada nivel de cuantización en tres benchmarks: GPQA (198 preguntas), MMLU (500 preguntas) y LiveCodeBench (LCB, 100 problemas). Los datos provienen de la model card del repositorio.

| Nivel de cuantización | GPQA (198) | MMLU (500) | LCB (100) |
|---|---:|---:|---:|
| Q8_0 | 164/198 (82,83%) | 447/500 (89,40%) | 74/100 (74,00%) |
| Q6_K | 171/198 (86,36%) | 440/500 (88,00%) | 78/100 (78,00%) |
| Q5-LynnStyle | 164/198 (82,83%) | 438/500 (87,60%) | 75/100 (75,00%) |
| Q4-LynnStyle | 166/198 (83,84%) | 443/500 (88,60%) | 74/100 (74,00%) |
| Q3-LynnStyle | 172/198 (86,87%) | 435/500 (87,00%) | 78/100 (78,00%) |
| Q2-LynnStyle | 167/198 (84,34%) | 416/500 (83,20%) | 75/100 (75,00%) |

En cuanto al rendimiento de inferencia, las mediciones del autor indican que la configuración Q8_0 con 4 clientes concurrentes (C4) alcanzó una tasa de aceptación de DFlash2 del 60,98% y un throughput agregado de 246 tokens/s. La configuración Q3-LynnStyle C4 logró un 58,00% de aceptación y 269 tokens/s. Estos valores dependen del hardware, la carga de trabajo y la concurrencia.

## Requisitos de hardware

- VRAM estimada: no disponible en la documentación. El repositorio completo ocupa 131,3 GB, lo que incluye todas las cuantizaciones.
- GPU recomendadas: no se especifican modelos concretos. Se requiere una GPU compatible con CUDA y suficiente VRAM para la cuantización elegida. La documentación menciona el uso de CUDA Toolkit y un compilador compatible.
- Compatibilidad con GPUs de consumo: las cuantizaciones más bajas (Q2-Q4) probablemente puedan ejecutarse en GPUs de consumo con VRAM suficiente, pero no hay confirmación oficial.
- Opciones de despliegue: llama.cpp (llama-server) con soporte DFlash2 (commit `b10f9ca58c89` o posterior). También se puede usar el repositorio principal en BF16/FP8 con otros frameworks, aunque no se detalla.
- Latencia y throughput: los datos medidos con DFlash2 en configuración C4 son 246 tok/s (Q8_0) y 269 tok/s (Q3-LynnStyle). El rendimiento máximo con 8 clientes (C8) se menciona pero no se incluyen cifras en el texto disponible.

## Comparativa con modelos similares

No se han publicado comparativas con modelos similares en la información disponible. El modelo es un fine-tune del Qwen3.8-27B, por lo que la comparación natural sería con el modelo base. Sin embargo, no se incluyen benchmarks del modelo base en esta documentación. El modelo original Qwen3.8-27B es un modelo denso vision-language de 27B parámetros con licencia Apache 2.0, desarrollado por Qwen, que sirve como referencia arquitectónica.

## Limitaciones y advertencias

- El modelo es "uncensored", lo que significa que no aplica filtros de seguridad. Esto puede generar contenido ofensivo, peligroso o inapropiado. Es responsabilidad del usuario implementar medidas de moderación en entornos de producción.
- Solo soporta inglés y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- No se han publicado evaluaciones específicas de alucinación, sesgos o robustez. Los benchmarks disponibles se centran en razonamiento y conocimiento, no en seguridad.
- El uso de DFlash2 requiere una versión específica de llama.cpp (commit `b10f9ca58c89` o compatible). Si se usa una versión sin soporte, el rendimiento de decodificación especulativa no estará disponible y el modelo podría comportarse de forma inesperada.
- La discrepancia entre el nombre del modelo (27B) y el dato de safetensors del repositorio (1.924.404.480) debe verificarse antes de asumir el tamaño real del modelo. Es posible que el dato de safetensors corresponda a un archivo auxiliar.
- El modelo base Qwen3.8-27B está pensado para tareas multi-paso complejas; el fine-tune puede heredar limitaciones en tareas que requieren conocimiento factual actualizado.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/nerkyor/Qwen3.8-27B-EfficientThink-Uncensored-K3-Opus5-Grok4.6-GPT5.6Sol-SFT-SimPO-DFlash2-GGUF
- Repositorio principal (BF16/FP8): https://huggingface.co/nerkyor/Qwen3.8-27B-EfficientThink-Uncensored-K3-Opus5-Grok4.6-GPT5.6Sol-SFT-SimPO-DFlash2
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Pull request de DFlash2 en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/27816
- Documentación de llama.cpp server: https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md
- Documentación de decodificación especulativa: https://github.com/ggml-org/llama.cpp/blob/master/docs/speculative.md
- Guía de compilación CUDA: https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md
- Método DFlash: https://z-lab.ai/projects/dflash/
