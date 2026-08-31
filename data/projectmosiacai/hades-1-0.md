# ProjectMosiacAI/Hades-1.0

## Resumen

Hades-1.0 es un modelo de lenguaje finetuneado por ProjectMosiacAI a partir de `unsloth/Llama-3.2-3B-Instruct-bnb-4bit`, un checkpoint cuantizado en 4 bits del modelo Llama 3.2 Instruct de 3 mil millones de parámetros. El entrenamiento se realizó con las librerías Unsloth y TRL, lo que indica un ajuste fino supervisado sobre el modelo base. El repositorio contiene únicamente los pesos en formato safetensors, con un tamaño de 0.1 GB, y la licencia es Apache 2.0, lo que permite uso comercial y modificación.

La relevancia de este modelo reside en su tamaño compacto y su licencia permisiva, lo que lo hace adecuado para despliegues en entornos con recursos limitados. Sin embargo, la documentación publicada es extremadamente escasa: no se proporcionan detalles sobre el dataset de entrenamiento, el método de ajuste (SFT, DPO, etc.), ni resultados de benchmarks. Tampoco se especifican capacidades adicionales más allá de las heredadas del modelo base Llama 3.2 Instruct. Por tanto, cualquier evaluación rigurosa requiere pruebas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) |
| Parametros totales | 3B (inferido del nombre del modelo base, no confirmado oficialmente) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo base Llama 3.2 soporta 128k, pero no se confirma si el finetune lo mantiene) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors, probablemente en FP16/BF16, pero no se especifica) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.2, un transformer decoder-only con atención causal. El checkpoint de partida es `unsloth/Llama-3.2-3B-Instruct-bnb-4bit`, una versión cuantizada en 4 bits del modelo instruct original, optimizada para entrenamiento eficiente con Unsloth. El finetune se realizó con la librería TRL (Transformers Reinforcement Learning), lo que sugiere un proceso de ajuste supervisado o de refuerzo, aunque no se especifica el método exacto ni los datos utilizados. No hay información pública sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales.

## Capacidades

- Generación de texto y seguimiento de instrucciones: al ser un finetune de Llama 3.2 Instruct, hereda la capacidad de mantener conversaciones y responder a comandos en inglés.
- Razonamiento básico y generación de código: capacidades propias del modelo base, aunque no hay evidencia específica de su rendimiento tras el finetune.
- No se documentan capacidades especiales como tool calling, agentes, visión o audio. La información disponible no permite confirmar ninguna funcionalidad adicional.

## Casos de uso

Dado que no se ha publicado documentación sobre casos de uso específicos, se sugieren aplicaciones típicas para un modelo instruct de 3B, siempre sujetas a validación propia:

- Chatbots ligeros para entornos con restricciones de hardware: el modelo puede desplegarse en GPUs de consumo o incluso en CPU con cuantización, ofreciendo respuestas en inglés.
- Prototipado rápido de asistentes conversacionales: su licencia Apache 2.0 permite integrarlo en proyectos comerciales sin coste de licencia.
- Generación de texto para tareas de clasificación o extracción de información en inglés, aprovechando su capacidad de seguir instrucciones.
- Fine-tuning adicional sobre dominios específicos: al ser un modelo pequeño, es viable reentrenarlo con datasets propios en hardware modesto.
- Educación e investigación: útil para experimentos de alineación o evaluación de modelos pequeños.
- Automatización de respuestas en soporte técnico básico, siempre que se valide su calidad en el dominio concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar. Se recomienda realizar evaluaciones propias antes de usar el modelo en producción.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~3B parámetros, en FP16 requiere aproximadamente 6 GB de VRAM; con cuantización 4-bit (como el checkpoint base) puede reducirse a ~2-3 GB. Sin embargo, el repositorio no especifica el formato de precisión de los pesos, por lo que estos valores son orientativos.
- GPUs recomendadas: cualquier GPU con al menos 6 GB de VRAM (RTX 2060, RTX 3060, etc.) para FP16; para 4-bit, GPUs con 4 GB o menos (GTX 1650, etc.) podrían ser suficientes.
- Compatibilidad con hardware de consumo: sí, es viable en GPUs de gama media y baja.
- Opciones de despliegue: al ser un modelo de la familia Llama, es compatible con vLLM, llama.cpp, Ollama, TGI y Transformers. No se ha verificado la compatibilidad específica con estos frameworks.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos. Dado que el modelo base es Llama 3.2 3B Instruct, se podría comparar con otros finetunes de ese mismo checkpoint, pero no hay datos públicos de Hades-1.0 para establecer una comparación objetiva. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Documentación insuficiente: no se especifican datos de entrenamiento, método de ajuste ni evaluación, lo que impide conocer su comportamiento real.
- Riesgo de alucinaciones: como todo modelo de 3B, puede generar información falsa o inventada, especialmente en tareas complejas.
- Sesgos: al estar entrenado solo en inglés y sin información sobre el dataset, pueden existir sesgos no documentados.
- Limitaciones de contexto: no se confirma la longitud de contexto efectiva tras el finetune; es posible que se haya reducido respecto al modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero no se incluyen cláusulas de indemnización de patentes, por lo que se recomienda revisar los términos completos.
- Para producción, es imprescindible realizar pruebas exhaustivas y validar el modelo en el dominio de uso.

## Enlaces

- HuggingFace: https://huggingface.co/ProjectMosiacAI/Hades-1.0
- Repositorio de Unsloth (mencionado en el README): https://github.com/unslothai/unsloth
- No se han encontrado otros enlaces relevantes (papers, blogs o demos) específicos de este modelo.
