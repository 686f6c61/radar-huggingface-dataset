# Brazenle/dom-hotdog-rain

## Resumen

Brazenle/dom-hotdog-rain es un modelo experimental de generación de texto desarrollado por Brazenle (Richard Jones) como asistente de portfolio. Se trata de un fine-tuning con LoRA sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct, entrenado para generar acciones estructuradas (PAGE_ACTION_JSON) que controlan efectos visuales en una página web, concretamente la activación y desactivación de una lluvia de hotdogs. El modelo está publicado con pesos PEFT en safetensors y un checkpoint fusionado cuantizado a 4 bits en formato ONNX, listo para ejecutarse en el navegador mediante Transformers.js. Su relevancia radica en ser un ejemplo de integración de modelos de IA en aplicaciones web front-end, aunque su fiabilidad como asistente general es limitada: la evaluación interna del autor reporta solo 7 de 29 comprobaciones superadas (24.1%).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5) con adaptador LoRA |
| Parametros totales | no disponible (modelo base: Qwen2.5-0.5B-Instruct) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4 (ONNX), safetensors sin cuantizar (no especificado) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adapter PEFT), ONNX (q4) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer de 0.5 mil millones de parámetros, y se le aplica un fine-tuning con LoRA de rango 16, alpha 32 y dropout 0.05. El adaptador se entrenó en un dataset privado no publicado para generar acciones JSON que el host de la aplicación debe ejecutar. No se menciona uso de RLHF ni DPO. La innovación técnica principal es la exportación del modelo fusionado a ONNX con cuantización q4 para inferencia en el navegador a través de Transformers.js, permitiendo ejecutar el modelo en WebAssembly (WASM) o WebGPU. El modelo no dibuja los efectos; propone una acción (`hotdogRain()` o `stopHotdogRain()`) que la aplicación web debe validar y ejecutar.

## Capacidades

- Generación de texto conversacional en inglés, aunque limitada a un dominio muy específico.
- Generación de acciones estructuradas en formato PAGE_ACTION_JSON, que funcionan como llamadas a funciones de JavaScript (`window.__shoegunDomEffects?.hotdogRain()` y `window.__shoegunDomEffects?.stopHotdogRain()`).
- Inferencia en navegador mediante Transformers.js con cuantización q4.
- No se han establecido capacidades de razonamiento complejo, generación de código, matemáticas ni visión.
- Soporte multilingüe: solo inglés.
- No se ha verificado soporte de agentes ni multi-step reasoning.

## Casos de uso

- Demostración interactiva en un portfolio personal: los visitantes pueden escribir "Make it rain hotdogs over the portfolio" y el modelo genera la acción que activa el efecto visual. Es adecuado porque el modelo fue entrenado específicamente para esta tarea.
- Desactivación de efectos: el modelo genera la acción para detener la lluvia de hotdogs cuando el usuario lo pide, permitiendo un control conversacional sencillo.
- Prototipo de integración de IA en front-end: sirve como ejemplo de cómo cargar un modelo cuantizado en el navegador con Transformers.js y ejecutarlo en WASM sin servidor.
- Caso de estudio de fine-tuning con LoRA: demuestra cómo adaptar un modelo pequeño (0.5B) a una tarea de dominio con un adaptador de bajo rango, útil para desarrolladores que quieran aplicar esta técnica.
- Validación de pipelines de exportación ONNX: el checkpoint fusionado q4 puede usarse para probar flujos de trabajo de cuantización y despliegue en entornos web.
- Prueba de concepto de tool calling en navegador: aunque el modelo no es un asistente general, muestra un patrón de generación de acciones estructuradas que la aplicación host interpreta, útil para explorar interacciones basadas en funciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card del autor reporta una evaluación interna: el adaptador original superó 7 de 29 comprobaciones (24.1%). Las dos peticiones específicas de lluvia de hotdogs ("Make it rain hotdogs over the portfolio" y "Stop the hotdog rain") pasaron correctamente en la inferencia ONNX con CPU en Transformers.js el 7 de septiembre de 2026. No se han establecido métricas de rendimiento para WebGPU ni para capacidades generales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser un modelo de 0.5B cuantizado a q4, el checkpoint ONNX ocupa aproximadamente 770 MB y está diseñado para ejecutarse en el navegador, por lo que no requiere VRAM dedicada en modo WASM.
- GPU recomendadas: no disponible. Para WebGPU se puede aprovechar cualquier GPU compatible, pero la model card no especifica requisitos.
- Compatibilidad con GPU de consumo: no disponible. El modelo es pequeño y probablemente quepa en cualquier GPU moderna, pero no hay datos oficiales.
- Opciones de despliegue: Transformers.js en navegador (WASM o WebGPU), ONNX Runtime. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. El modelo es un fine-tuning experimental de nicho sin datos de rendimiento comparativos publicados. Su modelo base, Qwen2.5-0.5B-Instruct, sería la referencia natural, pero no se han proporcionado resultados de benchmarks que permitan una comparación directa.

## Limitaciones y advertencias

- Modelo experimental: la evaluación completa del adaptador solo superó 7 de 29 comprobaciones (24.1%), por lo que no es fiable como asistente de propósito general.
- Riesgo de alucinación: puede generar acciones incorrectas o no deseadas. El host debe validar todas las acciones antes de ejecutarlas.
- No ejecutar JavaScript generado por el modelo en un contexto privilegiado.
- El modelo solo genera propuestas de acción; no dibuja los efectos ni ejecuta código por sí mismo.
- Capacidades generales no establecidas: no se han verificado razonamiento, matemáticas, código ni otras tareas.
- Solo soporta inglés.
- La carga del checkpoint ONNX es opt-in y puede no funcionar en dispositivos con memoria limitada.
- El rendimiento en WebGPU no ha sido evaluado.
- El dataset de entrenamiento es privado y no está disponible para auditoría.
- Licencia Apache 2.0: permite uso comercial, aunque el modelo no está listo para producción y no se ofrecen garantías de rendimiento.
- No se han documentado sesgos específicos en la información disponible.

## Enlaces

- HuggingFace: https://huggingface.co/Brazenle/dom-hotdog-rain
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Transformers.js: https://github.com/huggingface/transformers.js
