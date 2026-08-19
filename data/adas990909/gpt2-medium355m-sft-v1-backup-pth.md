# adas990909/gpt2-medium355M-sft-v1-backup.pth

## Resumen

Este modelo es un GPT-2 medium de 355 millones de parámetros, construido desde cero en PyTorch siguiendo el libro *Build a Large Language Model (From Scratch)* de Sebastian Raschka, y posteriormente ajustado con instrucciones (instruction tuning) sobre el dataset Stanford Alpaca (52.000 pares instrucción-respuesta). El autor, adas990909, lo publica como un proyecto de aprendizaje, no como un modelo listo para producción: reconoce que sigue instrucciones simples de forma razonable pero tiene conocimiento y capacidad de razonamiento limitados frente a LLMs modernos.

La arquitectura es un transformer decoder-only con 24 capas, 16 cabezas de atención y dimensión de embedding de 1024, con una ventana de contexto de 1024 tokens. Utiliza el tokenizador GPT-2 de OpenAI (vocabulario de 50.257 tokens). Su relevancia actual es principalmente didáctica: sirve como ejemplo práctico de fine-tuning de un modelo GPT-2 con un dataset de instrucciones, y como punto de partida para quienes quieran experimentar con ajuste de LLMs sin depender de la infraestructura de los grandes modelos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2 medium) |
| Parametros totales | 355 millones |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (solo pesos en punto flotante PyTorch .pth) |
| Idiomas soportados | no disponible (tokenizador GPT-2, presumiblemente inglés) |
| Licencia | MIT |
| Formato de pesos | .pth (PyTorch standalone, requiere paquete `llms_from_scratch`) |

## Arquitectura y entrenamiento

El modelo replica la arquitectura GPT-2 medium de OpenAI: 24 capas transformer, 16 cabezas de atención, dimensión de embedding de 1024 y un contexto de 1024 tokens. Se parte de los pesos preentrenados de GPT-2 medium y se realiza un fine-tuning supervisado con el dataset Stanford Alpaca, que contiene 52.000 ejemplos de instrucciones y respuestas generadas por ChatGPT. El formato de prompt sigue el estilo Alpaca ("Below is an instruction...").

El entrenamiento se llevó a cabo en una GPU RTX 4060, según indica el autor. No se menciona el uso de técnicas como RLHF o DPO; el ajuste es exclusivamente supervisado sobre los pares instrucción-respuesta. La implementación es personalizada y no compatible con la API estándar de `transformers`, por lo que se requiere el paquete `llms_from_scratch` para cargar y ejecutar el modelo.

## Capacidades

- Generación de texto autocompletivo en inglés (limitado por el tokenizador GPT-2).
- Seguimiento de instrucciones simples en el formato Alpaca (p.ej. "Name three colors").
- Capacidad de razonamiento básico, pero claramente inferior a modelos modernos de tamaño similar o mayor.
- No se menciona soporte para tool calling, agentes, visión, audio ni modos de razonamiento extendido.
- No se indica soporte multilingüe; el tokenizador GPT-2 está diseñado principalmente para inglés.

## Casos de uso

- **Proyecto educativo de fine-tuning**: ideal para estudiantes y desarrolladores que quieran entender cómo se ajusta un modelo GPT-2 con instrucciones. El código de carga y generación está documentado en la model card.
- **Experimentos de generación de texto controlada**: permite probar técnicas como top-k sampling, temperatura y parada por token EOS en un modelo pequeño y manejable.
- **Prototipos de chatbot de baja exigencia**: puede responder a instrucciones sencillas en un entorno de desarrollo, pero no es recomendable para uso real con usuarios.
- **Investigación sobre alucinación y sesgos**: al ser un modelo pequeño, sirve para estudiar fenómenos de generación incorrecta o repetitiva en condiciones controladas.
- **Comparación de arquitecturas**: al estar basado en GPT-2, permite comparar su comportamiento con otras implementaciones de la misma familia (GPT-2 small, large, etc.) en tareas de generación.
- **Pruebas de integración con el paquete `llms_from_scratch`**: útil para quienes quieran evaluar esa librería y su compatibilidad con pesos preentrenados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas como MMLU, HumanEval o GSM8K, y no se dispone de comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo tiene 355M de parámetros en precisión fp32 (~1,4 GB solo de pesos). Con el overhead de activaciones y el tokenizador, se recomienda al menos 4 GB de VRAM para una ejecución cómoda en GPU.
- **GPU recomendadas**: cualquier GPU consumer con 4 GB o más (GTX 1060 6GB, RTX 2060, RTX 3060, etc.) es suficiente para inferencia. El entrenamiento se realizó en una RTX 4060.
- **CPU**: es posible ejecutar el modelo en CPU, aunque la generación será más lenta; es viable para pruebas puntuales.
- **Opciones de despliegue**: no es compatible con vLLM, llama.cpp u Ollama de forma directa, ya que el formato de pesos es un `.pth` personalizado que requiere el paquete `llms_from_scratch`. Se puede desplegar como un servicio Python con FastAPI o similar, pero no hay integraciones estándar.
- **Latencia y throughput**: no se proporcionan datos. En una GPU moderna, la generación de 100 tokens debería tomar unos segundos, pero no hay mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| GPT-2 medium (OpenAI) | 355M | 1024 | MIT | Transformers | Base original, sin fine-tuning de instrucciones |
| DistilGPT-2 | 82M | 1024 | MIT | Transformers | Versión destilada, más rápida pero menos capaz |
| GPT-2 medium SFT (este modelo) | 355M | 1024 | MIT | .pth custom | Fine-tuning Alpaca, requiere paquete propio |

No se dispone de datos de rendimiento comparativo; la comparación es estructural. El modelo se diferencia del GPT-2 original por el ajuste con instrucciones, pero pierde compatibilidad con el ecosistema estándar de `transformers`.

## Limitaciones y advertencias

- **Conocimiento limitado**: al ser un modelo de 355M entrenado solo con fine-tuning sobre Alpaca, su base de conocimiento es la del GPT-2 original (corte en 2019) y no se actualiza con información reciente.
- **Razonamiento débil**: el autor indica explícitamente que el razonamiento es limitado en comparación con LLMs modernos; puede fallar en tareas que requieran lógica o matemáticas.
- **Riesgo de alucinación**: como todo modelo generativo, puede producir respuestas inventadas o inconsistentes, especialmente en temas fuera de su distribución de entrenamiento.
- **Idioma**: no se especifican idiomas soportados; el tokenizador GPT-2 está optimizado para inglés, por lo que el rendimiento en otros idiomas será deficiente.
- **Formato de pesos no estándar**: el archivo `.pth` no es compatible con `transformers`, `safetensors` ni herramientas comunes; requiere el paquete `llms_from_scratch`, lo que limita su portabilidad y despliegue.
- **No apto para producción**: es un proyecto de aprendizaje; no debe usarse en aplicaciones críticas o con usuarios reales sin una evaluación exhaustiva.
- **Licencia MIT**: permite uso comercial, pero el autor no ofrece garantías ni soporte.

## Enlaces

- [Página del modelo en HuggingFace](https://huggingface.co/adas990909/gpt2-medium355M-sft-v1-backup.pth)
- [Repositorio LLMs-from-scratch (Sebastian Raschka)](https://github.com/rasbt/LLMs-from-scratch)
- [Dataset Stanford Alpaca](https://github.com/tatsu-lab/stanford_alpaca)
