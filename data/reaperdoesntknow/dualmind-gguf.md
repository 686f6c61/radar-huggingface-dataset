# reaperdoesntknow/DualMind-GGUF

## Resumen

DualMind-GGUF es la version cuantizada en formato GGUF del modelo DualMind, un modelo de lenguaje de 2.031.739.904 parametros (aproximadamente 2B, descrito por el autor como 1.7B) desarrollado por Convergent Intelligence LLC: Research Division. Su proposito es implementar una arquitectura de "cognicion dual": el modelo genera primero un razonamiento libre en la etiqueta `<explore>`, despues una autocrítica adversarial en `<examine>` y, finalmente, una respuesta sintetizada en `<response>`. Esta publicacion facilita la inferencia local en CPU y GPU de gama baja mediante llama.cpp, Ollama y LM Studio.

El modelo deriva de una cadena de destilacion que parte de Qwen3-1.7B, pasa por DistilQwen3 (sin censura), Disctil (refinado con DISC) y una destilacion de conocimiento desde Qwen3-30B-A3B-Thinking, antes de un ajuste supervisado (SFT) sobre el dataset LogicInference_OA. La innovacion principal no es el tamano, sino la estructura: el autor sostiene que las "fronteras estructurales" detectadas durante el entrenamiento mediante su operador de discrepancia (Discrepancy Calculus) quedan codificadas en los pesos y sobreviven a la cuantizacion.

Es relevante ahora por su enfoque en razonamiento estructurado con autoverificacion en un modelo pequeno, orientado a despliegue en el borde (edge) con requisitos de memoria muy bajos (desde ~1,1 GB en Q4_K_M). La licencia Apache 2.0 permite uso comercial. La informacion disponible es limitada: no se publican resultados de benchmarks en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (derivada de Qwen3-1.7B); no se detalla mas |
| Parametros totales | 2.031.739.904 (aproximadamente 2B; el autor indica 1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base en SafeTensors: reaperdoesntknow/DualMind) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder heredado de Qwen3-1.7B, sin que la model card especifique detalles adicionales (numero de capas, dimensiones, atencion, etc.). El rasgo distintivo es el esquema de razonamiento en tres fases que el modelo aprende a producir: `<explore>` para derivacion y especulacion sin restricciones, `<examine>` para autocrítica adversarial y deteccion de errores, y `<response>` para la sintesis final. El autor lo describe como "dialecticas multi-modelo colapsadas en pesos compartidos".

La cadena de entrenamiento es: Qwen3-1.7B → DistilQwen3 (sin censura) → Disctil (refinado con DISC) → destilacion de conocimiento desde Qwen3-30B-A3B-Thinking (TKD) → SFT de DualMind sobre LogicInference_OA. El autor menciona fundamentos matematicos propios (Discrepancy Calculus, Topological Knowledge Distillation) y un operador de discrepancia Df(x) con descomposicion BV, documentados en la model card del modelo base. No se especifican en esta ficha el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF/DPO; la informacion disponible solo cita SFT y destilacion.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento estructurado en tres fases: exploracion, autocrítica y respuesta final.
- Razonamiento logico y matematico (entrenado sobre LogicInference_OA; el ejemplo de la model card es una demostracion de convergencia y sucesion de Cauchy).
- Autoverificacion y deteccion de errores mediante la fase `<examine>`.
- Inferencia local en CPU y GPU de gama baja gracias a las cuantizaciones GGUF.
- Compatible con endpoints (tag `endpoints_compatible`).
- No se documenta soporte de tool calling / function calling.
- No se documenta soporte de agentes ni multi-step reasoning mas alla del bucle interno explore/examine/response.
- No se documenta capacidad de vision ni audio.
- Multilingue: solo ingles declarado.

## Casos de uso

- Razonamiento logico y matematico asistido: el modelo esta entrenado sobre LogicInference_OA y su bucle explore/examine permite generar derivaciones y luego criticarlas antes de responder; util para demostraciones y ejercicios de logica en entornos educativos.
- Despliegue en el borde (edge): con Q4_K_M (~1,1 GB) puede ejecutarse en CPU o en GPUs con 6 GB o menos, lo que lo hace apto para aplicaciones embebidas, portatiles sin GPU dedicada o dispositivos de bajo consumo.
- Prototipado rapido de pipelines de autoverificacion: la estructura `<explore>`/`<examine>`/`<response>` permite integrar el modelo en flujos donde se necesita separar el razonamiento de la respuesta final, por ejemplo para auditar la cadena de pensamiento.
- Asistente de analisis de errores: la fase `<examine>` puede aprovecharse para tareas de revision y deteccion de inconsistencias en textos o argumentos en ingles.
- Investigacion en destilacion de conocimiento: al ser el eslabon GGUF de una cadena documentada (Qwen3-1.7B → DistilQwen3 → Disctil → TKD → DualMind), sirve como referencia reproducible para estudiar el efecto de la cuantizacion sobre modelos entrenados con destilacion.
- Inferencia local con Ollama o LM Studio: el modelo ya esta publicado en Ollama (`reaperdoesntrun/DualMinded-1.7B`) y admite creacion desde GGUF, lo que facilita su uso en entornos de desarrollo sin infraestructura de servidor.
- Educacion y demostraciones de razonamiento: su tamano reducido y su esquema de razonamiento explicito lo hacen adecuado para mostrar como un modelo pequeno puede estructurar su pensamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion:
  - F16 (~3,4 GB): requiere al menos ~4 GB de VRAM o RAM.
  - Q8_0 (~1,8 GB): recomendado para GPU; cabe en GPUs de 4 GB o mas.
  - Q5_K_M (~1,3 GB): equilibrio calidad/tamano; apto para GPU de 2-4 GB o CPU.
  - Q4_K_M (~1,1 GB): mejor para CPU y despliegue en el borde.
- GPU recomendadas: el autor orienta el modelo a CPU y GPUs de hasta 6 GB; no se especifican modelos concretos como A100, H100 o RTX 4090 (serian sobredimensionadas para este tamano).
- Cabe en GPU de consumo: si, en cualquier GPU con 4 GB o mas de VRAM (Q8_0) y en CPU con Q4_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runtimes compatibles con GGUF.
- Latencia y throughput: no disponibles.
- Parametros de generacion recomendados por el autor: temperature 0.6, top_p 0.9, repeat_penalty 1.3 (importante para evitar bucles de enumeracion), num_predict 512-1024.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| DualMind-GGUF | ~2B (1,7B declarados) | no disponible | GGUF | Apache 2.0 | Razonamiento explore/examine/response; solo ingles |
| Qwen3-1.7B (modelo base de la cadena) | 1,7B | no disponible en esta ficha | SafeTensors/GGUF | Apache 2.0 (Qwen) | Modelo generalista multilingue; base del linaje |
| DistilQwen3 (variante del autor) | ~1,7B | no disponible | no disponible | no disponible | Eslabon intermedio sin censura de la cadena |
| DualMinded-Qwen3-1.7B | ~1,7B | no disponible | BF16 / GGUF | Apache 2.0 | Variante entrenada con trazas de razonamiento de Opus 4.6 |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no se declara soporte multilingue.
- No se publican benchmarks, por lo que no hay evidencia cuantitativa de calidad frente a alternativas.
- Riesgo de alucinacion inherente a modelos de este tamano; la fase `<examine>` mitiga pero no elimina el problema.
- El autor advierte de bucles de enumeracion; es necesario usar `repeat_penalty` 1.3 para evitarlos.
- No se documenta tool calling ni soporte de agentes, lo que limita su uso en pipelines automatizados complejos.
- La longitud de contexto no esta especificada; no debe asumirse una ventana larga.
- Modelo con 0 likes y autor poco conocido; la cadena de destilacion y los fundamentos matematicos son afirmaciones del autor no verificadas de forma independiente en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar la procedencia de los datos de entrenamiento (LogicInference_OA, destilacion desde Qwen3-30B-A3B-Thinking) por si hubiera restricciones adicionales.
- El modelo base se describe como "uncensored" en un eslabon de la cadena; conviene evaluar el filtrado de contenido antes de usarlo en produccion orientada al publico.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/reaperdoesntknow/DualMind-GGUF
- Modelo base (SafeTensors): https://huggingface.co/reaperdoesntknow/DualMind
- Variante Opus: https://huggingface.co/reaperdoesntknow/DualMinded-Qwen3-1.7B
- Variante thinking: https://huggingface.co/reaperdoesntknow/Dualmind-Qwen-1.7B-Thinking
- Variante GGUF Opus: https://huggingface.co/reaperdoesntknow/DualMinded-Qwen3-1.7B-GGUF
- Metodologia (paper): https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy
- Paper "Structure Over Scale": https://huggingface.co/reaperdoesntknow/Structure-Over-Scale
- Paper "Discrepancy Calculus": https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus
- DOI metodologia: https://doi.org/10.57967/hf/8184
- Coleccion DualMind: https://huggingface.co/collections/reaperdoesntknow/dualmind
- Coleccion DistilQwen: https://huggingface.co/collections/reaperdoesntknow/distilqwen
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
