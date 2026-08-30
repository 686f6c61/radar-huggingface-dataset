# pertai/qwen38-et-adapters

## Resumen

El repositorio `pertai/qwen38-et-adapters` contiene tres adaptadores LoRA (entrenados con QLoRA) para el modelo base Qwen/Qwen3.8-27B, orientados a mejorar el rendimiento en estonio. El proyecto, documentado en GitHub, es un post-entrenamiento completo realizado en una única RTX 5090, con el objetivo de adaptar un modelo multilingüe de 27B a un idioma de bajos recursos como el estonio. Los adaptadores incluyen un "campeón final" que combina continuación de preentrenamiento (CPT) con 131M tokens de prosa estonia editada y rondas de ajuste fino supervisado (SFT) y optimización de política directa (DPO), logrando una reducción del 31% en perplejidad para ficción y un 85.4% en HumanEval. También se incluyen dos adaptadores de investigación: uno de solo CPT y otro de solo SFT+DPO, para aislar el efecto de cada técnica.

La relevancia de este trabajo radica en demostrar que es posible adaptar modelos grandes a idiomas poco representados con recursos computacionales modestos, y en ofrecer una metodología reproducible. El modelo base Qwen3.8-27B no está especificado en detalle en la información proporcionada, pero se asume que es un transformer denso de 27B parámetros. Los adaptadores están disponibles en formato safetensors y se aplican mediante PEFT o fusión. La licencia declarada es Apache-2.0, aunque el autor indica que es un trabajo no comercial, lo que requiere contacto para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre Qwen3.8-27B (arquitectura base no especificada) |
| Parametros totales | 27B (modelo base) + adaptadores LoRA (tamano no especificado) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se recomienda Q5+ para GGUF/Ollama) |
| Idiomas soportados | Estonio (et) |
| Licencia | Apache-2.0 (aunque el autor indica uso no comercial) |
| Formato de pesos | Safetensors (adaptadores LoRA) |

## Arquitectura y entrenamiento

Los tres adaptadores se entrenaron sobre el modelo base Qwen3.8-27B utilizando QLoRA, una técnica que permite ajustar modelos grandes con pocos recursos mediante cuantización de baja precisión y adaptadores de bajo rango. El adaptador final (`KROON-tsempion-85-8/`) combina CPT con 131M tokens de prosa estonia editada (rango 32) y rondas de SFT quirúrgico y DPO on-policy (rango 16). El adaptador `cpt1-puhas-keelekiht/` es solo CPT (rango 32) y sirve como objeto de investigación para aislar el efecto del lenguaje. El adaptador `ring12-oskuste-tsempion/` es solo SFT iterativo (13 rondas) y DPO, sin CPT. No se proporcionan detalles sobre la composición exacta del dataset de entrenamiento ni sobre el número total de tokens más allá de los 131M mencionados. El entrenamiento se realizó en una RTX 5090, lo que indica que el proceso es viable en hardware de consumo.

## Capacidades

- Generación de texto en estonio con mejora significativa en perplejidad para ficción (reducción del 31% respecto al base).
- Generación de código: HumanEval 85.4% en el adaptador final, lo que sugiere buena capacidad para tareas de programación.
- Evaluación interna de 200 tareas en estonio: 85.8% de acierto, superando a GPT (81.7%) y Gemini (84.3%) en la misma prueba.
- No soporta modo de pensamiento (thinking): entrenado con `think=false`, por lo que debe usarse siempre con `enable_thinking=False`.
- No se mencionan capacidades de tool calling, agentes, visión ni audio.
- Multilingüismo limitado al estonio, aunque el modelo base es multilingüe.

## Casos de uso

- Generación de contenido creativo en estonio: el adaptador final reduce la perplejidad en ficción, lo que lo hace adecuado para redacción de narrativa, poesía o guiones en estonio, con un estilo más natural que el modelo base.
- Asistente de programación con instrucciones en estonio: con HumanEval 85.4%, puede integrarse en entornos de desarrollo donde los comentarios y prompts se escriban en estonio, generando código funcional.
- Procesamiento de lenguaje natural para servicios públicos digitales: Estonia es un país altamente digitalizado; el modelo puede usarse en chatbots, resúmenes de documentos legales o administrativos y atención al ciudadano en estonio.
- Corrección gramatical y de estilo: el adaptador de solo CPT reduce la perplejidad de 22.2 a 15.4, lo que indica un mejor modelado del lenguaje, útil para herramientas de corrección automática.
- Investigación en lingüística computacional: los adaptadores de investigación permiten estudiar el impacto del CPT frente al SFT/DPO en idiomas de bajos recursos, sirviendo como referencia para otros proyectos.
- Traducción automática asistida: aunque no se menciona explícitamente, al mejorar el modelado del estonio, puede usarse como componente en sistemas de traducción o posedición, especialmente para textos técnicos o literarios.

## Benchmarks y rendimiento

La información disponible incluye resultados de los tres adaptadores en métricas específicas. No se proporcionan benchmarks estándar como MMLU o GSM8K.

| Adaptador | Perplejidad (ficción) | HumanEval | Eval 200 tareas (estonio) |
|---|---|---|---|
| `KROON-tsempion-85-8/` | −31% vs base | 85.4% | 85.8% |
| `cpt1-puhas-keelekiht/` | 22.2 → 15.4 | No disponible | No disponible |
| `ring12-oskuste-tsempion/` | No disponible | No disponible | 85.3% |

En la misma evaluación de 200 tareas en estonio, GPT obtuvo 81.7% y Gemini 84.3%, lo que sitúa al adaptador final por encima de ambos. No hay datos comparativos con otros modelos de estonio.

## Requisitos de hardware

- El entrenamiento se realizó en una RTX 5090 (32 GB VRAM), lo que indica que el ajuste fino es viable en GPUs de gama alta de consumo.
- Para inferencia, se recomienda usar cuantización Q5 o superior en GGUF/Ollama; Q4 daña los pesos ajustados con CPT.
- No se especifica la VRAM mínima para inferencia, pero un modelo de 27B en Q5 requiere aproximadamente 18-20 GB, y en Q8 unos 27-30 GB. Se recomienda una GPU con al menos 24 GB para Q5.
- Opciones de despliegue: PEFT para integración en Python, fusión de adaptadores para uso directo, y GGUF/Ollama para entornos de producción con llama.cpp.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para estonio. El único punto de referencia es la evaluación interna que compara con GPT y Gemini, pero no son modelos de código abierto comparables en tamaño. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo fue entrenado sin modo de pensamiento; usarlo con `think=true` puede degradar el rendimiento.
- La cuantización Q4 daña los pesos ajustados con CPT, por lo que se recomienda Q5+ para despliegue en GGUF.
- La licencia Apache-2.0 declarada contradice la nota del autor de "trabajo no comercial"; se debe contactar con el autor para uso comercial.
- No hay información sobre sesgos, alucinaciones o comportamiento en dominios específicos fuera de la prosa y código.
- El corpus de entrenamiento se basa en "prosa estonia editada", lo que puede limitar la generalización a registros coloquiales o técnicos.
- El modelo base Qwen3.8-27B no está documentado en esta ficha; se recomienda consultar su propia documentación para conocer limitaciones adicionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pertai/qwen38-et-adapters
- Repositorio GitHub del proyecto: https://github.com/pertlomp/qwen38-et
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
