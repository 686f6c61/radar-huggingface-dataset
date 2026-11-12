# OpenLLM-France/Luciole-1B-Instruct-1.1

## Resumen

Luciole-1B-Instruct-1.1 es un modelo de lenguaje causal de tipo transformer, desarrollado por LINAGORA y el consorcio OpenLLM-France en el marco del proyecto OpenLLM France, financiado por BPI France a través del programa France 2030. Se trata de la versión ajustada y alineada del modelo base Luciole-1B-Base, con 1.319.309.312 parámetros totales, orientada a generación de texto conversacional en francés e inglés.

El modelo se ha entrenado en tres fases sobre la infraestructura Jean Zay: un ajuste supervisado (SFT) sobre datos de instrucciones con trazas de razonamiento (thinking traces), un segundo SFT sin dichas trazas y una fase final de alineación mediante Direct Preference Optimization (DPO). Los datos de post-entrenamiento cubren matemáticas, ciencia, código, conversación general, RAG y traducción.

Su relevancia radica en ser un bloque de construcción open source de pequeño tamaño (1,3B parámetros) con licencia Apache 2.0, pensado para investigación y para proyectos que necesitan un modelo ligero y desplegable en hardware modesto. Es la primera iteración de la fase de post-entrenamiento del proyecto Luciole, que prevé futuras versiones con mayor proporción de datos en francés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (familia Nemotron, según tags del repo) |
| Parametros totales | 1.319.309.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens (entrenado con secuencias de esta longitud; el modelo base soportaba hasta 131.000 tokens) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors; el autor documenta despliegue vía ollama y vLLM) |
| Idiomas soportados | fr, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Luciole-1B-Instruct-1.1 es un transformer causal de 1,3B parámetros derivado de Luciole-1B-Base. El post-entrenamiento se realizó en tres fases secuenciales sobre Jean Zay: (i) SFT sobre datos de instrucciones que incluían trazas de razonamiento (thinking traces), (ii) SFT sobre datos de instrucciones sin dichas trazas, y (iii) alineación final mediante DPO. Los datos de post-entrenamiento provienen del dataset OpenLLM-France/Luciole-PostTraining-Dataset-1.1 y cubren matemáticas, ciencia, código, chat general, RAG y traducción.

La plantilla de chat está inspirada en la de Qwen3-1.7B e incluye un system prompt por defecto ("You are a helpful AI assistant named Luciole, trained by LINAGORA and OpenLLM France."), con tokens especiales `<|im_start|>` y `<|im_end|>`. Cabe destacar que el post-entrenamiento se hizo casi íntegramente sobre datos en inglés, a diferencia del modelo base, que se entrenó con aproximadamente un 30 % de datos en francés. Además, la ventana de contexto se redujo de los 131.000 tokens del modelo base a 16.384 tokens en esta versión instruct. El repositorio de entrenamiento está disponible en GitHub (Luciole-Training) y el informe técnico está anunciado como "coming soon".

## Capacidades

- Generación de texto conversacional multi-turno en francés e inglés.
- Seguimiento de instrucciones (instruction following), foco principal del post-entrenamiento.
- Razonamiento con trazas de pensamiento (thinking traces), aprendido en la primera fase de SFT.
- Conocimiento básico de matemáticas, ciencia, código y traducción, según la composición del dataset de post-entrenamiento.
- Soporte de RAG: el autor recomienda explícitamente integrarlo en pipelines de recuperación aumentada para compensar su limitada memoria paramétrica.
- Capacidades multilingües limitadas a fr y en.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Asistente conversacional ligero en francés: el modelo puede gestionar diálogos multi-turno con una ventana de 16.384 tokens, suficiente para conversaciones con historial amplio, y está entrenado con una plantilla de chat con system prompt por defecto.
- Generación aumentada por recuperación (RAG): el autor recomienda integrarlo en pipelines RAG para suplir su limitada capacidad de memorización; encaja como generador final de respuestas sobre documentos recuperados en aplicaciones de pregunta-respuesta.
- Traducción fr-en y en-fr: la composición del dataset de post-entrenamiento incluye traducción, por lo que puede usarse en tareas de traducción de frases o párrafos dentro de un pipeline.
- Prototipado e investigación: al ser un modelo de 1,3B parámetros con licencia Apache 2.0 y recetas de entrenamiento publicadas, sirve como base para experimentos de fine-tuning, ablaciones de SFT/DPO y estudios de alineación.
- Despliegue en hardware modesto: su tamaño permite ejecutarlo en GPU de consumo y en entornos con recursos limitados, lo que lo hace adecuado para demos, entornos de desarrollo y aplicaciones de borde donde no cabe un modelo mayor.
- Filtrado y clasificación de texto asistida: puede emplearse para tareas de resumen o reformulación de contenido en francés e inglés dentro de flujos de preprocesamiento, siempre con validación posterior.
- Educación y asistentes de estudio: con RAG sobre materiales didácticos, puede responder preguntas de matemáticas y ciencia básicas, aunque requiere verificación por su tendencia a la alucinación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 5,3 GB solo para pesos (1,32B parámetros × 4 bytes).
- VRAM estimada en bf16/fp16: aproximadamente 2,6 GB para pesos, más overhead de KV cache y activaciones.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,3 GB para pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 0,7 GB para pesos.
- GPU recomendadas: cabe holgadamente en GPU de consumo como RTX 3060 (12 GB), RTX 4070, RTX 4090; también en A100 y H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más en bf16, y en tarjetas de 4-6 GB con cuantización.
- Opciones de despliegue documentadas por el autor: ollama y vLLM. También es compatible con el ecosistema transformers (AutoTokenizer y plantilla de chat).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Luciole-1B-Instruct-1.1 | 1,32B | 16.384 | fr, en | Apache 2.0 | Post-entrenado con SFT + DPO; foco en instruction following |
| Qwen3-1.7B | 1,7B (no confirmado en la información) | no disponible | multilingüe | no disponible | Inspiración de la plantilla de chat de Luciole |
| Luciole-1B-Base | 1,32B (no confirmado) | 131.000 | fr, en | Apache 2.0 | Modelo base; ~30 % de datos en francés; sin alineación |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de Luciole-1B-Instruct-1.1 con alternativas de su categoría.

## Limitaciones y advertencias

- Alucinación: el autor advierte explícitamente de que el modelo puede producir respuestas falsas, consecuencia de su entrenamiento sobre grandes volúmenes de texto diverso.
- Memoria limitada: con 1,3B parámetros, su capacidad de memorizar información es reducida; el autor recomienda integrarlo en un pipeline RAG.
- Sesgo lingüístico: el post-entrenamiento se hizo casi íntegramente en inglés, pese a que el modelo base se entrenó con ~30 % de datos en francés; el rendimiento en francés puede ser inferior al esperado y hay fases futuras previstas para corregirlo.
- Contexto reducido: la ventana de 16.384 tokens es mucho menor que la del modelo base (131.000 tokens); no es adecuado para tareas que requieran contexto muy largo sin entrenamiento adicional.
- Tareas específicas: el autor indica que el entrenamiento se centró en instruction following y que se necesitaría entrenamiento adicional para tareas centradas en generación de código o resolución de problemas matemáticos.
- Licencia: Apache 2.0 permite uso comercial, pero el autor recomienda probar exhaustivamente el modelo en los casos de uso objetivo antes de incorporarlo a pipelines industriales.
- Es una primera iteración: el proyecto está en desarrollo activo y se prevén versiones posteriores con mayor proporción de datos en francés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenLLM-France/Luciole-1B-Instruct-1.1
- Modelo base: https://huggingface.co/OpenLLM-France/Luciole-1B-Base
- Dataset de post-entrenamiento: https://huggingface.co/datasets/OpenLLM-France/Luciole-PostTraining-Dataset-1.1
- Repositorio de entrenamiento: https://github.com/OpenLLM-France/Luciole-Training/tree/main/finetune
- Web del proyecto OpenLLM-France: https://openllm-france.fr/
- LINAGORA Labs: https://labs.linagora.com/
- Programa France 2030: https://www.info.gouv.fr/grand-dossier/france-2030
- BPI France: https://www.bpifrance.fr/
- Plantilla de chat de referencia (Qwen3-1.7B): https://huggingface.co/Qwen/Qwen3-1.7B/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Contacto del proyecto: contact@openllm-france.fr
