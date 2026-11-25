# lugman/Qwen2.5-1.5B-KK-Haiku-5.5-Flow-Mixed-Templates-SFT

## Resumen

El modelo `lugman/Qwen2.5-1.5B-KK-Haiku-5.5-Flow-Mixed-Templates-SFT` es un ajuste fino (SFT) del modelo base `unsloth/Qwen2.5-1.5B-Instruct`, desarrollado por el usuario lugman y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo de generación de texto de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones) construido sobre la arquitectura Qwen2, una familia de transformers densos desarrollada por Alibaba. El ajuste se ha realizado con la librería Unsloth y TRL de Hugging Face, según indica la propia model card.

El modelo está orientado a conversación (etiqueta `conversational`) y se distribuye en formato safetensors para su uso con la librería `transformers`, además de ser compatible con `text-generation-inference`. Su nombre sugiere un ajuste orientado a plantillas mixtas y a un flujo de estilo haiku con la etiqueta "KK-5.5", aunque la model card no documenta con detalle el dataset ni la metodología exacta del ajuste.

La relevancia de esta ficha es limitada: se trata de un modelo de nicho con 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados ni documentación técnica detallada. Resulta útil como ejemplo de ajuste fino ligero con Unsloth sobre un modelo pequeño de la familia Qwen2.5, pero no debe considerarse un modelo de producción sin una evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2) |
| Parametros totales | 1.543.714.304 (~1,5 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens; el ajuste no documenta cambios) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | en (ingles), segun la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen2 del modelo base `unsloth/Qwen2.5-1.5B-Instruct`: un transformer denso con atención por causalidad, normalización RMSNorm y embeddings rotatorios (RoPE), con aproximadamente 1,5 mil millones de parámetros. El ajuste fino se ha realizado mediante SFT (supervised fine-tuning) utilizando Unsloth y la librería TRL de Hugging Face, lo que según la model card permitió un entrenamiento "2x más rápido". No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO adicionales.

El nombre del modelo ("KK-Haiku-5.5-Flow-Mixed-Templates-SFT") sugiere un ajuste orientado a plantillas mixtas y a un formato de respuesta concreto, pero la model card no documenta la metodología, el dataset ni las innovaciones técnicas del ajuste. No se han publicado detalles sobre decodificación especulativa, atención lineal ni otras optimizaciones específicas. Toda la información técnica disponible se limita a la indicada en la model card y a los metadatos del repositorio.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento básico y respuesta a instrucciones, con calidad limitada por el tamaño de 1,5 B de parámetros.
- Generación de código y matemáticas a nivel básico, según las capacidades del modelo base.
- Soporte de conversaciones multi-turno con plantillas de chat (formato Qwen2.5).
- Compatibilidad con `text-generation-inference` y `transformers`, lo que facilita su despliegue en endpoints.
- Capacidades multilingües: la model card solo declara inglés (`en`), aunque el modelo base Qwen2.5 soporta múltiples idiomas; el ajuste puede haber reducido esta cobertura.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo "thinking" en la información disponible.

## Casos de uso

- Prototipado rápido de asistentes conversacionales: el modelo puede gestionar diálogos multi-turno en inglés con un coste de inferencia muy bajo (1,5 B de parámetros), adecuado para validar flujos de conversación antes de escalar a modelos mayores.
- Experimentación académica con SFT: sirve como ejemplo reproducible de ajuste fino con Unsloth y TRL sobre un modelo Qwen2.5 pequeño, útil para investigadores que quieran replicar la metodología.
- Generación de texto en entornos con recursos limitados: al caber en GPUs de consumo, puede desplegarse en estaciones de trabajo sin aceleradores de datacenter.
- Filtrado y clasificación de texto ligero: tareas de etiquetado o resumen de documentos cortos en inglés donde no se requiera alta precisión.
- Chatbots de dominio específico: si el ajuste "Mixed-Templates" está orientado a un formato concreto, podría emplearse en asistentes de nicho con respuestas estructuradas, previa validación del comportamiento.
- Evaluación comparativa de ajustes finos: útil como baseline para comparar el efecto de distintas estrategias de SFT sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 3 GB solo para los pesos (1,54 B × 2 bytes), más overhead de activaciones y caché KV; en la práctica, unos 4-6 GB según longitud de contexto y batch.
- En cuantización de 8 bits: aproximadamente 1,5-2 GB para los pesos.
- En cuantización de 4 bits: aproximadamente 0,8-1 GB para los pesos.
- GPU recomendadas: cualquier GPU de consumo con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente en FP16; para 4 bits basta con 4 GB.
- GPU de datacenter (A100, H100) no son necesarias para este tamaño, aunque pueden usarse para servir múltiples réplicas.
- Opciones de despliegue: `transformers`, `text-generation-inference` (TGI), vLLM, llama.cpp u Ollama (requiere conversión a GGUF, no publicada en el repo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| lugman/Qwen2.5-1.5B-KK-Haiku-5.5-Flow-Mixed-Templates-SFT | ~1,5 B | no disponible (base: 32.768) | apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,5 B | 32.768 | apache-2.0 | Hugging Face, ampliamente usado |
| unsloth/Qwen2.5-1.5B-Instruct | ~1,5 B | 32.768 | apache-2.0 | Hugging Face, optimizado para Unsloth |
| Llama-3.2-1B-Instruct | ~1,2 B | 128.000 | Llama 3.2 Community License | Hugging Face, muy usado |

El modelo de lugman no aporta mejoras documentadas frente a su modelo base ni frente a alternativas del mismo tamaño; su interés es principalmente experimental. Los benchmarks comparativos no están disponibles.

## Limitaciones y advertencias

- Modelo de nicho con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación por la comunidad.
- Sin benchmarks publicados: no se puede afirmar que supere o iguale al modelo base en ninguna tarea.
- La model card no documenta el dataset de ajuste, lo que impide evaluar sesgos introducidos durante el SFT.
- Riesgo de alucinación inherente a modelos de 1,5 B de parámetros, especialmente en tareas de razonamiento complejo o matemáticas.
- Idiomas: solo se declara inglés; el uso en castellano u otros idiomas no está garantizado y puede degradar la calidad.
- Contexto: no se documenta si el ajuste preserva la ventana de 32.768 tokens del modelo base; conviene validarlo empíricamente.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- El nombre del modelo sugiere un ajuste a plantillas concretas ("Mixed-Templates"), lo que puede limitar su comportamiento fuera de ese formato.
- No se publican pesos en GGUF ni cuantizaciones listas para usar; habría que generarlas.

## Enlaces

- Hugging Face: https://huggingface.co/lugman/Qwen2.5-1.5B-KK-Haiku-5.5-Flow-Mixed-Templates-SFT
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct
- Modelo original Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
