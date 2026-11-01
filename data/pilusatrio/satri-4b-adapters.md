# PILUSATRIO/satri-4b-adapters

## Resumen

SATRI-4.0 Adapters es una colección de adaptadores PEFT y candidatos de fusión (merge) construidos sobre el modelo base Qwen/Qwen3-4B, un transformer denso de 4.000 millones de parámetros y 36 capas desarrollado por Alibaba Qwen. La colección la publica el usuario independiente PILUSATRIO (Pilus/Satri) bajo licencia Apache 2.0, con el objetivo de especializar el modelo base en cuatro dominios concretos —lengua y cultura indonesia, razonamiento matemático y científico, programación/SQL y function calling/RAG— y combinarlos después mediante técnicas de fusión de pesos como TIES y DELLA.

El repositorio no contiene un modelo completo entrenado desde cero, sino un conjunto de adaptadores LoRA con rango escalado (rsLoRA, r=64, alpha=128), entrenados con NEFTune y una estrategia de "límite de conocimiento" (T2e), junto con dos candidatos de merge ya materializados: una fusión uniforme TIES de 36 capas y una fusión estratificada DELLA por tramos de capas ([0..11], [12..27], [28..35]). El autor declara puntuaciones de evaluación interna (DEV/TEST) sobre dominios propios, no benchmarks estándar de la comunidad.

Su relevancia es acotada pero interesante como caso práctico de ingeniería de adaptadores: muestra un flujo completo de especialización multi-dominio sobre un modelo pequeño (4B), con fusión de pesos y evaluación por conjuntos de desarrollo/test propios, todo empaquetado en un repositorio de 0,5 GB. No obstante, el modelo tiene cero descargas y cero likes en el momento de la consulta, y no se han publicado resultados en benchmarks reconocidos (MMLU, HumanEval, GSM8K), por lo que su rendimiento real frente a Qwen3-4B base no está verificado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), 36 capas; adaptadores PEFT tipo LoRA/rsLoRA sobre el modelo base |
| Parametros totales | 4B en el modelo base Qwen/Qwen3-4B; tamano del repo de adaptadores: 0,5 GB |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (los adaptadores se distribuyen en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | Indonesio (id) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptadores PEFT); el merge resultante se publica como modelo completo en PILUSATRIO/satri-4.0 |

## Arquitectura y entrenamiento

El modelo base es Qwen3-4B, un transformer denso de 36 capas y 4B de parámetros (revisión 1cfa9a7208912126459214e8b04321603b3df60c). Sobre él se entrenan cinco adaptadores: un adaptador de control multi-tarea (control_4b) con rsLoRA de rango 64 y alpha 128, NEFTune y un mecanismo denominado "T2e" de límite de conocimiento, y cuatro especialistas (spec_A_4b a spec_D_4b) orientados respectivamente a indonesio y cultura nusantara, matemáticas/lógica/ciencia, programación/SQL/algoritmos/diseño web, y function calling/RAG. Los especialistas B, C y D incorporan además un mecanismo de auto-reparación (self-repair) en las respuestas.

La combinación se realiza mediante fusión de pesos: un candidato TIES uniforme de 36 capas (satri_4b_uniform_ties) y un candidato DELLA estratificado por tramos de capas (satri_4b_della_layerwise). No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición exacta de los datasets, ni si hubo RLHF o DPO. Las puntuaciones declaradas (DEV 100,0% en cada especialista; TEST 93,75% para el merge TIES y 87,50% para DELLA) corresponden a conjuntos de evaluación propios del autor, no a benchmarks públicos.

## Capacidades

- Generación de texto en indonesio e inglés.
- Especialización en lengua y cultura indonesia (dominio A), incluyendo instrucciones de nivel L1-L2.
- Razonamiento matemático, lógico y científico con mecanismo de auto-reparación (dominio B).
- Programación, SQL, algoritmos y diseño web con auto-reparación (dominio C).
- Function calling y tool calling mediante etiquetas `<tool_call>`, orientado a RAG (dominio D).
- Capacidad de fusión multi-dominio: el merge TIES integra los cuatro especialistas en un único conjunto de pesos.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (thinking) en la información disponible.

## Casos de uso

- Asistente en indonesio para atención al cliente: el especialista A y el merge TIES permiten mantener conversaciones multi-turno en indonesio con conocimiento cultural local, adecuado para mercados del sudeste asiático.
- Resolución de problemas matemáticos y científicos en entornos educativos: el especialista B, con auto-reparación, puede usarse para generar y corregir soluciones paso a paso en tutoría automatizada.
- Generación y revisión de código en pipelines de desarrollo: el especialista C cubre programación, SQL y algoritmos, y puede integrarse en herramientas de revisión o generación de consultas.
- Agentes con tool calling y RAG: el especialista D emite llamadas a herramientas en formato `<tool_call>`, útil para asistentes que consultan APIs o bases de conocimiento.
- Investigación sobre fusión de adaptadores: el repositorio sirve como caso reproducible de rsLoRA + NEFTune + TIES/DELLA sobre un modelo de 4B, útil para estudiar el impacto de la fusión por capas.
- Despliegue en hardware modesto: al partir de un modelo de 4B, el merge resultante puede ejecutarse en GPU de consumo, lo que facilita prototipos locales de asistentes bilingües id/en.
- Experimentación académica en especialización multi-dominio: comparar los adaptadores individuales frente a los merges permite analizar la interferencia entre dominios en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta métricas internas sobre conjuntos propios:

| Evaluacion (interna del autor) | DEV | TEST |
|---|---|---|
| spec_A_4b (indonesio/cultura) | 100,0% | No disponible |
| spec_B_4b (matematicas/logica/ciencia) | 100,0% | No disponible |
| spec_C_4b (programacion/SQL) | 100,0% | No disponible |
| spec_D_4b (tool calling/RAG) | 100,0% | No disponible |
| satri_4b_uniform_ties (merge TIES) | 100,00% | 93,75% |
| satri_4b_della_layerwise (merge DELLA) | 86,67% estricto / 100% semantico | 87,50% |

Estas cifras no son comparables con MMLU, HumanEval o GSM8K y no han sido verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 4B, en FP16 requiere aproximadamente 8-9 GB de VRAM; en cuantización de 8 bits, unos 4-5 GB; en 4 bits, unos 2,5-3 GB (estimaciones generales para 4B, no publicadas por el autor).
- GPU recomendadas: A100 o H100 para entrenamiento y evaluación a gran escala; RTX 4090, RTX 3090 o RTX 4080 para inferencia en FP16.
- GPU de consumo: cabe en GPUs con 8 GB o más en cuantización de 4-8 bits (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 3070).
- Despliegue: los adaptadores PEFT se cargan con la librería `peft` sobre el modelo base; el merge publicado en PILUSATRIO/satri-4.0 puede servirse con vLLM, TGI, llama.cpp u Ollama si se convierte a GGUF (no se documenta conversión oficial).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SATRI-4.0 (adapters/merge) | 4B (base Qwen3-4B) | No disponible | Apache 2.0 | Especializado en id/en, matematicas, codigo y tool calling; sin benchmarks publicos |
| Qwen/Qwen3-4B | 4B | No disponible en esta ficha | Apache 2.0 | Modelo base generalista de Alibaba Qwen; referencia directa |
| Qwen3-8B | 8B | No disponible en esta ficha | Apache 2.0 | Version mayor del mismo linaje, mas capacidad a mayor coste de VRAM |
| Llama 3.2 3B | 3B | No disponible en esta ficha | Llama 3.2 Community License | Alternativa de tamano similar con licencia mas restrictiva para uso comercial a gran escala |

La comparación de rendimiento con estas alternativas no está disponible porque el autor no publica resultados en benchmarks estándar.

## Limitaciones y advertencias

- No hay benchmarks públicos (MMLU, HumanEval, GSM8K) que permitan verificar el rendimiento frente al Qwen3-4B base.
- Las puntuaciones DEV/TEST del autor (100% en DEV) sugieren posible sobreajuste a conjuntos de evaluación propios y no son extrapolables.
- El repositorio tiene cero descargas y cero likes; no hay validación de la comunidad.
- Idiomas limitados a indonesio e inglés; el rendimiento en castellano no está documentado.
- Longitud de contexto no especificada en la información disponible.
- Riesgo de alucinación inherente a un modelo de 4B, especialmente en razonamiento matemático y científico complejo.
- Sesgos potenciales derivados de los datos de entrenamiento del modelo base y de los datasets de especialización, no documentados.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el uso en producción requiere evaluación propia.
- La fusión DELLA muestra un rendimiento inferior al TIES en TEST (87,50% frente a 93,75%) y respuestas más concisas (161,0 tokens de media), lo que puede limitar su utilidad en tareas que requieran respuestas extensas.

## Enlaces

- Repositorio de adaptadores: https://huggingface.co/PILUSATRIO/satri-4b-adapters
- Modelo principal fusionado: https://huggingface.co/PILUSATRIO/satri-4.0
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Paper de rsLoRA: no disponible en la información proporcionada
- Paper de TIES-merging: no disponible en la información proporcionada
- Paper de DELLA-merging: no disponible en la información proporcionada
- Paper de NEFTune: no disponible en la información proporcionada
