# Frost2o24/qwen2.5-coder-1.5b-mini-agent

## Resumen

Frost2o24/qwen2.5-coder-1.5b-mini-agent es un modelo de lenguaje especializado en código, resultado de un fine-tuning del modelo base `unsloth/qwen2.5-coder-1.5b-instruct-bnb-4bit`, que a su vez es una versión cuantizada en 4 bits de Qwen2.5-Coder-1.5B-Instruct, desarrollado por el equipo de Qwen (Alibaba Cloud). El autor del fine-tuning es Frost2o24, y el modelo se distribuye bajo licencia Apache 2.0, con soporte únicamente para inglés.

Este modelo pertenece a la familia Qwen2.5-Coder, una serie de modelos densos decoder-only orientados a tareas de programación, que abarca tamaños desde 0.5B hasta 32B de parámetros. La versión de 1.5B es particularmente interesante por su ligereza: permite ejecutar inferencia en hardware de consumo con poca memoria, lo que la hace adecuada para entornos de desarrollo locales, integración en editores de código o asistentes de programación embebidos. El fine-tuning realizado con Unsloth promete un entrenamiento más rápido, aunque no se detallan los datos ni el método de ajuste.

La relevancia actual de este modelo radica en la creciente demanda de asistentes de código que puedan ejecutarse localmente sin depender de servicios en la nube, manteniendo un equilibrio entre rendimiento y requisitos de hardware. Al ser un modelo pequeño, es una opción viable para prototipos, educación y tareas de autocompletado en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only) |
| Parametros totales | 1.5B (modelo base) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el modelo base usa bnb-4bit, pero el fine-tuning no especifica) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atención causal, diseñado para generación de texto y código. El modelo base, Qwen2.5-Coder-1.5B-Instruct, fue preentrenado en un corpus de más de 5.5 billones de tokens, con un enfoque en datos de código, y posteriormente ajustado con instrucciones. El fine-tuning realizado por Frost2o24 utiliza la librería Unsloth, que optimiza el entrenamiento mediante kernels y técnicas de memoria reducida, logrando una aceleración de 2x según la model card. Sin embargo, no se proporcionan detalles sobre el dataset de fine-tuning, el número de pasos, la tasa de aprendizaje ni si se emplearon técnicas como RLHF o DPO. El modelo resultante se ha subido en formato safetensors, compatible con transformers y text-generation-inference.

## Capacidades

- Generación de código: al ser un fine-tune de Qwen2.5-Coder, hereda la capacidad de generar código en múltiples lenguajes de programación, aunque no se especifican los lenguajes concretos.
- Completado de código: puede sugerir continuaciones de fragmentos de código, útil para autocompletado en editores.
- Razonamiento matemático: el modelo base Qwen2.5-Coder mantiene capacidades de razonamiento matemático, aunque no se confirma si el fine-tuning las conserva.
- Soporte de instrucciones: al ser un modelo instruct, responde a comandos en lenguaje natural relacionados con programación.
- No se confirma soporte de tool calling, agentes, visión ni audio en este fine-tuning específico.

## Casos de uso

- Autocompletado de código en editores locales: el modelo puede integrarse en extensiones de VS Code o Neovim para sugerir líneas o bloques de código en tiempo real, gracias a su tamaño reducido que permite inferencia en CPU o GPU de baja gama.
- Asistente de programación para estudiantes: sirve como herramienta educativa para explicar fragmentos de código, generar ejemplos o resolver dudas sintácticas, sin necesidad de conexión a internet.
- Generación de scripts y utilidades: puede crear scripts de automatización, comandos de shell o pequeños programas a partir de descripciones en lenguaje natural, útil para tareas de administración de sistemas.
- Prototipado rápido de funciones: en entornos de desarrollo ágil, el modelo puede generar esqueletos de funciones o clases a partir de firmas o comentarios, acelerando el desarrollo inicial.
- Integración en pipelines de CI/CD: al ser ligero, puede ejecutarse en contenedores con recursos limitados para generar tests unitarios o documentación de código automáticamente.
- Chat de soporte técnico especializado en código: aunque el modelo solo soporta inglés, puede utilizarse en foros o sistemas de tickets para responder consultas básicas sobre errores de programación, siempre que se combine con un sistema de retrieval.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 1.5B parámetros, en cuantización de 4 bits (como el modelo base) requiere aproximadamente 1-2 GB de VRAM para inferencia. El tamaño del repositorio (0.2 GB) sugiere que el fine-tuning también está cuantizado, aunque no se confirma el método.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 2060 o superiores. También puede ejecutarse en CPU con 8-16 GB de RAM, aunque con mayor latencia.
- Opciones de despliegue: compatible con transformers, text-generation-inference, vLLM, llama.cpp y Ollama (si se convierte a GGUF). El tag `endpoints_compatible` sugiere que puede desplegarse en plataformas de inferencia gestionada.
- Latencia y throughput: no se dispone de datos concretos, pero para un modelo de 1.5B en 4-bit, se espera una latencia de decenas de milisegundos por token en GPU moderna y de cientos de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Frost2o24/qwen2.5-coder-1.5b-mini-agent | 1.5B | no disponible | Apache 2.0 | HuggingFace |
| Qwen2.5-Coder-1.5B-Instruct (original) | 1.5B | 32K (segun reporte tecnico) | Apache 2.0 | HuggingFace |
| CodeLlama-7B | 7B | 16K | Llama 2 license | HuggingFace |
| StarCoder2-3B | 3B | 16K | Apache 2.0 | HuggingFace |

La comparativa se basa en datos públicos de los modelos base, no en el fine-tuning específico. El modelo de Frost2o24 no aporta información sobre contexto ni rendimiento, por lo que no es posible una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo pequeño, puede generar código incorrecto o inventar APIs inexistentes, especialmente en tareas complejas o con contexto limitado.
- Limitaciones de idioma: solo soporta inglés, lo que restringe su uso en entornos multilingües.
- Contexto no especificado: se desconoce la longitud de contexto del fine-tuning, lo que puede afectar a tareas que requieran ventanas largas.
- Licencia: aunque la licencia Apache 2.0 permite uso comercial, el modelo base Qwen2.5-Coder también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- Falta de documentación: la model card es mínima y no detalla el proceso de fine-tuning, los datos utilizados ni las métricas de evaluación, lo que dificulta la reproducibilidad y la confianza en el modelo.
- Riesgo de dependencia: al ser un fine-tuning de una versión cuantizada, puede haber pérdida de precisión respecto al modelo original, aunque no se ha cuantificado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Frost2o24/qwen2.5-coder-1.5b-mini-agent
- Repositorio de Qwen2.5-Coder (GitHub): https://github.com/huggingface/Qwen2.5-Coder
- Informe tecnico de Qwen2.5-Coder (arXiv): https://arxiv.org/abs/2409.12186
- Repositorio de Qwen2.5 (GitHub): https://github.com/mx4ai/qwen2.5
- Unsloth (libreria de entrenamiento): https://github.com/unslothai/unsloth
