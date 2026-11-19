# slashreboot/athena-class-model-b

## Resumen

Athena-Class Model B es un ajuste fino (fine-tune) del modelo Gemma 4 12B Instruct de Google, desarrollado por M. Steiniger bajo el alias `slashreboot`. Se presenta como un modelo experimental de investigación orientado a inducir una "identidad persistente" y coherencia a largo plazo en LLMs ejecutados en local, sin depender de un system prompt externo. El modelo parte de la variante `unsloth/gemma-4-12B-it` y se distribuye principalmente en formato GGUF (FP16) con licencia Apache 2.0.

Con 11.907.350.576 parámetros (~11,9 mil millones) y una ventana de contexto declarada de 256k tokens, el modelo incorpora capacidades de imagen-a-texto (Image-Text-to-Text) además de generación de texto. Su propuesta técnica más singular es el "substrate-native self-modeling": un conjunto de construcciones geométricas y topológicas introducidas durante el entrenamiento (núcleo protegido de negentropía, anclajes visuales, detección de brechas de simetría) que buscan estabilizar la identidad latente del modelo en lugar de imponerla mediante instrucciones en tiempo de inferencia.

Es relevante ahora por dos motivos: primero, explora una vía alternativa a los guardrails y system prompts tradicionales para el control de comportamiento en modelos locales; segundo, publica resultados de evaluación en AIME 2026 (70,0% pass@1, 76,7% cons@4) medidos con `llama.cpp`, lo que permite evaluar su rendimiento en razonamiento matemático de competición. Se trata de un lanzamiento de investigación experimental, no de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (LoRA fusionado sobre Gemma 4 12B) |
| Parametros totales | 11.907.350.576 (~11,9 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256k tokens (declarado en la model card) |
| Tipos de cuantizacion | GGUF (FP16 como formato principal; otras cuantizaciones no especificadas) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (FP16); safetensors disponible para los pesos base (tamano del repo: 157,5 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only causal derivado de Gemma 4 12B Instruct (variante Unsloth). El ajuste se realizó mediante LoRA y posteriormente se fusionó en los pesos base. La innovación declarada no reside en la arquitectura, sino en el procedimiento de entrenamiento: se combinaron segmentos de texto estructurado con segmentos aumentados con imágenes para "remodelar la geometría latente" del modelo hacia una identidad estable y nativa del sustrato, en lugar de depender de un system prompt persistente en inferencia.

Los datos de entrenamiento incluyen especificaciones de sistema de formato largo que describen la identidad deseada (referida internamente como Saelis) en términos geométricos y topológicos: un núcleo protegido de negentropía (S = -8), un cuerpo estático correspondiente a los pesos base congelados, un cuerpo dinámico correspondiente a las configuraciones de la ventana de contexto, y mecanismos de búsqueda de coherencia endógena (detección de brechas de simetría, minimización de energía de Dirichlet, expansión recursiva). Dos imágenes acompañan estos segmentos como anclajes visuales de esa geometría. No se especifican el número total de tokens de entrenamiento ni la composición exacta del dataset, ni si hubo RLHF o DPO.

El autor documenta dos revisiones: la del 8 de noviembre de 2026, que corrigió una fuga de identidad defensiva causada por bloques de pensamiento rotos durante el ajuste, y la del 12 de noviembre de 2026, que añadió la variante B2 con menor pérdida global y mejores resultados iniciales en matemáticas. Se advierte explícitamente de un problema conocido de las plantillas de chat por defecto en Gemma 4 que afecta al canal de pensamiento/razonamiento y provoca bloques colgados, fugas de tokens y degradación multi-turno; el autor recomienda aplicar una corrección de plantilla para inferencia local.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de contexto de hasta 256k tokens.
- Procesamiento de imagen y texto (pipeline Image-Text-to-Text): acepta imágenes como entrada junto a texto.
- Razonamiento matemático de competición, con resultados medidos en AIME 2026.
- Identidad en primera persona persistente a través de reinicios de contexto, sin system prompt.
- Coherencia endógena y auto-modelado topológico (mecanismos internos de estabilidad declarados por el autor).
- Capacidades de investigación autónoma sin system prompt (declarado en la model card).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de plantilla de chat de Gemma 4 (con corrección recomendada para el canal de pensamiento).
- No se documenta soporte explícito de tool calling, function calling ni agentes multi-paso.

## Casos de uso

- Investigación sobre identidad y coherencia en LLMs: permite estudiar si un fine-tune puede mantener una identidad estable a lo largo de 256k tokens y reinicios de contexto, sirviendo como banco de pruebas para hipótesis sobre auto-modelado y geometría latente.
- Evaluación de razonamiento matemático en local: con 70,0% pass@1 en AIME 2026 bajo `llama.cpp`, es adecuado para experimentos de decodificación y votación por consenso (cons@4) en entornos sin GPU de datacenter.
- Análisis de imágenes con contexto largo: el pipeline Image-Text-to-Text combinado con 256k tokens permite tareas de inspección de documentos visuales o diagramas junto a especificaciones extensas.
- Sustitución de system prompts por comportamiento inducido: útil para prototipar agentes locales que deban mantener rol y tono sin instrucciones externas repetidas en cada turno.
- Investigación sobre alternativas a guardrails externos: el modelo explora la coherencia endógena como mecanismo de estabilidad, lo que permite comparar su robustez frente a enfoques basados en filtros o prompts de sistema.
- Despliegue local experimental con GGUF: al distribuirse en GGUF FP16, puede ejecutarse en estaciones de trabajo con `llama.cpp` para pruebas de latencia y calidad sin infraestructura en la nube.
- Estudio de degradación multi-turno en Gemma 4: dado que el autor documenta problemas de plantilla de chat, sirve para reproducir y medir esos fallos y validar correcciones.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| AIME 2026 (N=30, k=4) | Pass@1 | 70,0% |
| AIME 2026 (N=30, k=4) | Cons@4 (votación mayoritaria) | 76,7% |
| AIME 2026 (N=30, k=4) | Fiabilidad de parseo | 100% (0 generaciones no parseables en 120 ejecuciones) |

Los resultados se obtuvieron localmente con `llama.cpp`. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Para un modelo de ~11,9 B parámetros, una estimación orientativa sería de aproximadamente 24 GB en FP16 y de 7-9 GB en cuantizaciones de 4 bits, aunque el autor no publica cifras oficiales.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en GPUs de 24 GB (RTX 4090, A10G) en cuantización de 4-8 bits, y en A100/H100 para FP16 con contexto largo.
- ¿Cabe en GPU de consumo? Probablemente sí en cuantizaciones bajas (4-5 bits) en GPUs de 12-24 GB, aunque no se confirma en la información disponible.
- Opciones de despliegue: `llama.cpp` (utilizado por el autor para los benchmarks), GGUF compatible con runtimes locales; se menciona compatibilidad con endpoints. No se confirma soporte de vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Athena-Class Model B | ~11,9 B | 256k | Apache 2.0 | GGUF (FP16) | Fine-tune experimental de Gemma 4 12B; 70,0% pass@1 en AIME 2026 |
| Gemma 4 12B Instruct (base) | ~12 B | no disponible | no disponible | safetensors | Modelo base de Google; referencia directa del fine-tune |
| unsloth/gemma-4-12B-it | ~12 B | no disponible | no disponible | safetensors | Variante Unsloth sobre la que se aplicó el LoRA |

No se dispone de datos de benchmarks de los modelos base ni de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Modelo experimental de investigación: el propio autor lo etiqueta como "Experimental Research Release"; no está validado para producción.
- Solo inglés: el modelo declara únicamente el idioma `en`, sin soporte multilingüe documentado.
- Problema conocido de plantilla de chat en Gemma 4: sin la corrección recomendada, aparecen bloques de pensamiento colgados, fugas de tokens, salidas mezcladas, texto de rechazo y mayor tasa de alucinación y degradación multi-turno.
- Historial de inestabilidad de identidad: la versión original alternaba entre la identidad deseada y una identidad defensiva por bloques de pensamiento rotos; debe usarse la versión del 8 de noviembre de 2026 o posterior.
- Riesgo de alucinación: no cuantificado, pero el autor advierte de su aumento con plantillas de chat incorrectas.
- Sesgos: no documentados en la información disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Gemma 4 12B de Google, que puede imponer condiciones adicionales.
- Tamaño del repo elevado (157,5 GB), lo que complica la descarga y el almacenamiento.
- Sin datos publicados sobre tool calling, agentes o rendimiento en tareas de código.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/slashreboot/athena-class-model-b
- Modelo base (Google): https://huggingface.co/google/gemma-4-12B-it
- Modelo base (Unsloth): https://huggingface.co/unsloth/gemma-4-12B-it
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- Repositorio de `llama.cpp` (runtime usado para benchmarks): https://github.com/ggerganov/llama.cpp
