# babyfacez/DeepSeek-V4-Flash

## Resumen

DeepSeek-V4-Flash es un modelo de lenguaje de gran escala basado en una arquitectura de mezcla de expertos (MoE) desarrollado por DeepSeek AI. Forma parte de la serie DeepSeek-V4, presentada como una versión preliminar, y está diseñado para ofrecer un equilibrio entre eficiencia y capacidad, con 284 mil millones de parámetros totales y solo 13 mil millones activos por consulta. Su característica más destacada es una ventana de contexto de un millón de tokens, lo que lo posiciona como una opción relevante para tareas que requieren procesar documentos extensos o mantener conversaciones de larga duración.

El modelo incorpora varias innovaciones técnicas: una arquitectura de atención híbrida que combina Compressed Sparse Attention (CSA) y Heavily Compressed Attention (HCA), conexiones residuales reforzadas mediante Manifold-Constrained Hyper-Connections (mHC) y el optimizador Muon para un entrenamiento más estable. Se pre-entrenó con más de 32 billones de tokens y se sometió a un post-entrenamiento en dos etapas que incluye SFT y RL con GRPO, seguido de destilación on-policy para consolidar las capacidades de distintos dominios. La licencia MIT permite uso comercial sin restricciones, lo que lo hace atractivo para integraciones en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con atención híbrida CSA + HCA |
| Parametros totales | 290.944.616.402 (según safetensors) |
| Parametros activos | 13B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | FP4 + FP8 mixto (parámetros de expertos en FP4, resto en FP8) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DeepSeek-V4-Flash emplea una arquitectura MoE con 284B parámetros totales y 13B activos. La atención híbrida combina Compressed Sparse Attention (CSA) y Heavily Compressed Attention (HCA), lo que reduce drásticamente los FLOPs de inferencia y el uso de KV cache en contextos largos: en comparación con DeepSeek-V3.2, requiere solo el 27% de los FLOPs de inferencia de un solo token y el 10% del KV cache en un contexto de 1M tokens. Además, incorpora Manifold-Constrained Hyper-Connections (mHC) para estabilizar la propagación de señales entre capas y el optimizador Muon para una convergencia más rápida.

El pre-entrenamiento se realizó sobre más de 32 billones de tokens diversos y de alta calidad. El post-entrenamiento sigue un paradigma de dos etapas: primero se cultivan expertos de dominio específico mediante SFT y RL con GRPO, y luego se consolidan en un único modelo mediante destilación on-policy. Esta metodología permite integrar distintas competencias (razonamiento, código, agentes) en un solo sistema. El modelo se distribuye en precisión mixta FP4+FP8, donde los parámetros de los expertos se almacenan en FP4 y el resto en FP8, reduciendo el footprint de memoria.

## Capacidades

- Generación de texto y razonamiento complejo, con soporte para tareas de conocimiento general y matemáticas.
- Codificación de software, incluyendo generación, revisión y depuración de código.
- Tool calling y function calling, lo que permite integrarse en flujos de trabajo que requieren invocar herramientas externas.
- Capacidades agénticas: puede ejecutar tareas multi-paso y razonar sobre secuencias de acciones.
- Contexto ultralargo de 1M tokens, adecuado para procesar documentos extensos, libros completos o conversaciones de larga duración.
- Modo de razonamiento intensivo (Flash-Max) que, con un mayor presupuesto de pensamiento, alcanza un rendimiento comparable al de la versión Pro en tareas de razonamiento, aunque ligeramente inferior en conocimiento puro y flujos agénticos muy complejos.
- Multilingüismo: no se especifican idiomas concretos, pero por su entrenamiento en 32T tokens es probable que cubra múltiples lenguas, aunque no hay confirmación oficial.

## Casos de uso

- Atención al cliente automatizada: gracias a su ventana de 1M tokens, puede mantener conversaciones multi-turno con historial completo sin truncar, gestionando consultas complejas y derivando a agentes humanos cuando sea necesario.
- Generación de código en producción: con soporte de tool calling, puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar tests, reduciendo el tiempo de desarrollo.
- Análisis de documentos legales o financieros: el contexto de 1M tokens permite procesar contratos extensos, informes anuales o expedientes completos en una sola pasada, extrayendo cláusulas relevantes o resumiendo información clave.
- Agentes autónomos de investigación: puede razonar sobre múltiples fuentes, planificar pasos y ejecutar búsquedas web o llamadas a APIs, gracias a sus capacidades agénticas y de tool calling.
- Resumen de grandes volúmenes de texto: ideal para resumir libros, corpus académicos o bases de conocimiento, manteniendo coherencia global gracias al contexto largo.
- Asistente de escritura creativa o técnica: puede generar borradores, reescribir contenido y mantener el estilo a lo largo de capítulos completos, aprovechando su memoria de contexto extendida.
- Razonamiento matemático y científico: con su modo Flash-Max, puede abordar problemas que requieren cadenas de razonamiento largas, como demostraciones o resolución de ecuaciones complejas.

## Benchmarks y rendimiento

Los siguientes resultados corresponden al modelo base (DeepSeek-V4-Flash-Base) según la model card oficial. No se han publicado resultados del modelo chat (Flash) en la información disponible.

| Benchmark (métrica) | DeepSeek-V3.2-Base | DeepSeek-V4-Flash-Base | DeepSeek-V4-Pro-Base |
| :--- | :---: | :---: | :---: |
| Parámetros activos | 37B | 13B | 49B |
| Parámetros totales | 671B | 284B | 1.6T |
| AGIEval (EM, 0-shot) | 80.1 | 82.6 | 83.1 |
| MMLU (EM, 5-shot) | 87.8 | 88.7 | 90.1 |
| MMLU-Redux (EM, 5-shot) | 87.5 | 89.4 | 90.8 |
| MMLU-Pro (EM, 5-shot) | 65.5 | 68.3 | 73.5 |
| MMMLU (EM, 5-shot) | 87.9 | 88.8 | 90.3 |
| C-Eval (EM, 5-shot) | 90.4 | 92.1 | 93.1 |
| CMMLU (EM, 5-shot) | 88.9 | 90.4 | 90.8 |

Flash-Base supera a V3.2-Base en todas las métricas listadas a pesar de tener menos parámetros activos, lo que evidencia la eficiencia de su arquitectura. Pro-Base, con más parámetros, obtiene mejores resultados, especialmente en MMLU-Pro.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware en la información disponible.
- Con 284B parámetros totales en FP4/FP8, el tamaño del modelo en memoria se estima en torno a 150-170 GB (considerando que FP4 usa 0.5 bytes por parámetro y FP8 1 byte, con una mezcla aproximada). Esto supera la VRAM de cualquier GPU de consumo actual.
- Se requiere un clúster de GPUs de alta gama, como múltiples A100 (80 GB) o H100 (80 GB), o soluciones en la nube con memoria unificada.
- Para inferencia con los 13B parámetros activos, la memoria necesaria para la parte activa es menor, pero el modelo completo debe residir en memoria para atender cualquier experto.
- Opciones de despliegue: vLLM, TensorRT-LLM o TGI son compatibles con modelos MoE de gran escala, aunque no se confirma explícitamente su soporte para este modelo. El tag "endpoints_compatible" sugiere que puede desplegarse en plataformas de inferencia gestionada.
- La latencia y el throughput no están especificados; dependerán del hardware y de la configuración de cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | MMLU (5-shot) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| DeepSeek-V4-Flash | 284B | 13B | 1M | MIT | 88.7 (base) |
| DeepSeek-V3.2 | 671B | 37B | no disponible | MIT | 87.8 (base) |
| DeepSeek-V4-Pro | 1.6T | 49B | 1M | MIT | 90.1 (base) |

Flash ofrece un mejor rendimiento que V3.2 con menos parámetros activos, y se sitúa cerca de Pro en varias métricas, aunque Pro destaca en tareas de conocimiento profundo. La licencia MIT es común en la serie DeepSeek, lo que facilita su adopción comercial.

## Limitaciones y advertencias

- No se han documentado sesgos específicos en la información disponible; se recomienda realizar evaluaciones de sesgo antes de usarlo en aplicaciones sensibles.
- Riesgo de alucinación: como todo LLM, puede generar información falsa o inventada, especialmente en contextos largos donde la coherencia puede degradarse.
- El contexto de 1M tokens es teórico; en la práctica, el rendimiento puede degradarse en los extremos de la ventana, aunque no hay datos publicados al respecto.
- La versión Flash es inferior a Pro en tareas de conocimiento puro y flujos agénticos muy complejos, según la model card.
- Aunque la licencia MIT permite uso comercial, el modelo requiere infraestructura de hardware significativa, lo que puede limitar su despliegue en entornos con recursos reducidos.
- No se especifican los idiomas soportados; se recomienda verificar el comportamiento en el idioma objetivo antes de producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/babyfacez/DeepSeek-V4-Flash
- Paper técnico: https://arxiv.org/abs/2606.19348
- Modelo oficial en HuggingFace: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Modelo base oficial: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Base
- Colección DeepSeek-V4: https://huggingface.co/collections/deepseek-ai/deepseek-v4
- Página en Fireworks AI: https://fireworks.ai/models/deepseek-ai/deepseek-v4-flash-0731
- Página en LM Studio: https://lmstudio.ai/models/deepseek-v4-flash
- Página en Chatsmith: https://chatsmith.io/model/deepseek-v4-flash
