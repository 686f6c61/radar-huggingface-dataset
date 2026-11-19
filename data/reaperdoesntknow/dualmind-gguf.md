# reaperdoesntknow/DualMind-GGUF

## Resumen

DualMind-GGUF es la distribucion en formato GGUF del modelo DualMind, un modelo de lenguaje de 1.700 millones de parametros desarrollado por Convergent Intelligence LLC (Research Division) que implementa una arquitectura de razonamiento de doble cognicion. El modelo estructura su salida en tres fases explicitas mediante etiquetas especiales: `<explore>` para razonamiento libre y derivacion, `<examine>` para autocritica adversarial y deteccion de errores, y `<response>` para la sintesis final de la respuesta. Se trata de una propuesta que traslada la dialectica multi-modelo a un unico conjunto de pesos compartidos.

El modelo base se entrena mediante una cadena de destilacion que parte de Qwen3-1.7B, pasa por DistilQwen3 (sin censura), Disctil (refinado con DISC) y aplica destilacion de conocimiento desde Qwen3-30B-A3B-Thinking, seguida de un SFT sobre el dataset LogicInference_OA. Esta version GGUF permite ejecutar el modelo en CPU y GPUs de consumo mediante llama.cpp, Ollama o LM Studio, con cuantizaciones que van desde F16 (~3,4 GB) hasta Q4_K_M (~1,1 GB).

La relevancia actual del modelo reside en su enfoque de "inteligencia convergente": en lugar de escalar parametros, propone estructurar el razonamiento interno en fases de exploracion y critica. La licencia Apache 2.0 y el tamano reducido lo hacen accesible para despliegues en el borde (edge) y experimentacion local. El repositorio acumula 2.274 descargas y un total de 2.031.739.904 parametros reales segun safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3-1.7B), con esquema de razonamiento dual explore/examine/response |
| Parametros totales | 2.031.739.904 (segun safetensors); la model card indica 1,7B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

DualMind se construye sobre la arquitectura transformer de Qwen3-1.7B y anade un esquema de razonamiento de doble cognicion aprendido durante el entrenamiento. El modelo genera primero un bloque `<explore>` de razonamiento sin restricciones, despues un bloque `<examine>` de autocritica adversarial orientado a la deteccion de errores, y finalmente un bloque `<response>` con la sintesis limpia del dialogo interno. La model card describe este enfoque como "dialecticas multi-modelo colapsadas en pesos compartidos".

La cadena de entrenamiento documentada es: Qwen3-1.7B → DistilQwen3 (sin censura) → Disctil (refinado con DISC) → destilacion de conocimiento desde Qwen3-30B-A3B-Thinking → SFT de DualMind sobre el dataset LogicInference_OA. El autor menciona fundamentos matematicos basados en "calculo de discrepancia" (operador Df(x)) y "destilacion de conocimiento topologica" (TKD), descritos en el modelo base y en papers asociados con DOI. La model card afirma que las fronteras estructurales detectadas por DISC durante el entrenamiento quedan codificadas en los pesos y se preservan tras la cuantizacion. No se especifican en la informacion disponible el numero de tokens de entrenamiento ni la composicion detallada del dataset.

## Capacidades

- Generacion de texto y razonamiento estructurado en tres fases (exploracion, autocritica, respuesta).
- Razonamiento logico y matematico, con enfasis en derivaciones y demostraciones (el ejemplo de la model card es una demostracion de convergencia y sucesiones de Cauchy).
- Autocritica interna y deteccion de errores mediante el bloque `<examine>`.
- Capacidad conversacional (tag `conversational`).
- Compatible con endpoints (tag `endpoints_compatible`).
- Entrenado sobre el dataset LogicInference_OA, orientado a inferencia logica.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no documentado explicitamente; el esquema explore/examine/response constituye una forma de razonamiento multi-paso interno.
- Capacidades multilingues: solo ingles (`en`).
- Capacidades especiales: no se documentan vision, audio ni modo thinking separado mas alla del esquema dual.

## Casos de uso

- Razonamiento logico y demostraciones matematicas: el modelo esta entrenado sobre LogicInference_OA y su bloque `<explore>` permite derivaciones libres antes de la sintesis, lo que lo hace adecuado para problemas de logica formal y pruebas paso a paso.
- Despliegue en el borde (edge): con la cuantizacion Q4_K_M (~1,1 GB) puede ejecutarse en CPU y en GPUs de consumo de 6 GB o menos, segun la propia model card, lo que permite integrarlo en dispositivos con recursos limitados.
- Experimentacion en investigacion sobre razonamiento: el esquema explore/examine/response facilita el estudio de la autocritica y la deteccion de errores en modelos pequenos, util para investigadores que analizan trazas de razonamiento.
- Asistentes locales de proposito general en ingles: al ser compatible con Ollama y LM Studio, puede desplegarse como asistente conversacional offline en ingles sin dependencia de la nube.
- Generacion de codigo y explicaciones tecnicas: aunque no se documenta un benchmark de codigo, el modelo puede emplearse para explicar y revisar fragmentos de codigo mediante el ciclo de exploracion y critica; conviene validar su calidad con pruebas propias.
- Educacion y tutoria: el bloque `<examine>` permite mostrar al usuario no solo la respuesta sino tambien el proceso de verificacion, util en entornos educativos donde interesa el razonamiento explicito.
- Pipelines de CI/CD para revision de texto: la licencia Apache 2.0 y el formato GGUF permiten integrarlo en herramientas de revision automatica de documentacion o texto tecnico en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,4 GB en F16, 1,8 GB en Q8_0, 1,3 GB en Q5_K_M y 1,1 GB en Q4_K_M (tamanos de fichero indicados en la model card).
- GPU recomendadas: la model card indica "CPU/6GB GPU" para la variante LogicInference, por lo que cabe en GPUs de consumo con 6 GB o mas de VRAM.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas de VRAM (por ejemplo, gama RTX x060 en adelante) y en CPU para las cuantizaciones Q4_K_M y Q5_K_M.
- Opciones de despliegue: llama.cpp, Ollama (imagen publicada `reaperdoesntrun/DualMinded-1.7B`), LM Studio y cualquier runtime compatible con GGUF.
- Parametros de inferencia recomendados: temperature 0.6, top_p 0.9, repeat_penalty 1.3 (importante para evitar bucles de enumeracion), num_predict 512-1024.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DualMind-GGUF | ~2,03B (1,7B segun model card) | no disponible | Apache 2.0 | GGUF | Razonamiento dual explore/examine/response; solo ingles |
| Qwen3-1.7B (modelo base) | 1,7B | no disponible | Apache 2.0 | safetensors, GGUF | Base de la cadena de destilacion; multilingue |
| Qwen3-30B-A3B-Thinking (profesor) | 30B totales (MoE) | no disponible | Apache 2.0 | safetensors | Profesor de destilacion; mucho mayor |

La comparacion con alternativas de terceros no esta disponible en la informacion proporcionada. El modelo mas directamente comparable es su base Qwen3-1.7B, del que hereda arquitectura y licencia, pero con un esquema de razonamiento adicional y solo soporte de ingles.

## Limitaciones y advertencias

- Solo soporta ingles (`en`); no se documenta capacidad multilingue.
- Modelo de 1,7B parametros: capacidad de razonamiento limitada frente a modelos de mayor escala, pese al esquema de autocritica.
- La model card advierte de riesgo de bucles de enumeracion y recomienda repeat_penalty 1.3; sin este ajuste la generacion puede degradarse.
- Riesgo de alucinacion inherente a modelos pequenos y a la generacion de razonamiento libre en `<explore>`; el bloque `<examine>` mitiga pero no elimina este riesgo.
- No se han publicado benchmarks en la informacion disponible, por lo que no hay evidencia cuantitativa de rendimiento frente a alternativas.
- La model card menciona que la variante DistilQwen3 es "sin censura" (uncensored); conviene evaluar los riesgos de contenido antes de un despliegue en produccion.
- El esquema de etiquetas (`<explore>`, `<examine>`, `<response>`) requiere prompts y parsers especificos; una integracion descuidada puede romper el formato de salida.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; la documentacion tecnica depende de papers externos con DOI.
- No se documentan la longitud de contexto ni el numero de tokens de entrenamiento, lo que dificulta planificar casos de uso con contextos largos.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/reaperdoesntknow/DualMind-GGUF
- Modelo base (SafeTensors): https://huggingface.co/reaperdoesntknow/DualMind
- Variante entrenada con Opus: https://huggingface.co/reaperdoesntknow/DualMinded-Qwen3-1.7B
- Variante thinking: https://huggingface.co/reaperdoesntknow/Dualmind-Qwen-1.7B-Thinking
- Variante GGUF de Opus: https://huggingface.co/reaperdoesntknow/DualMinded-Qwen3-1.7B-GGUF
- Paper de metodologia: https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy (DOI: https://doi.org/10.57967/hf/8184)
- Paper "Structure Over Scale": https://huggingface.co/reaperdoesntknow/Structure-Over-Scale (DOI: 10.57967/hf/8165)
- Paper "Discrepancy Calculus": https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus (DOI: 10.57967/hf/8194)
- Coleccion DualMind: https://huggingface.co/collections/reaperdoesntknow/dualmind
- Coleccion DistilQwen: https://huggingface.co/collections/reaperdoesntknow/distilqwen
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
