# encredible/Gaiel-1.5B-Korean-Tuned-MLX

## Resumen

Gaiel-1.5B-Korean-Tuned-MLX es un modelo de lenguaje ligero especializado en coreano, desarrollado por la organización JK Universe sobre la arquitectura Qwen2.5 de Alibaba. Parte del modelo base Qwen/Qwen2.5-1.5B-Instruct y ha sido ajustado para mejorar su rendimiento en tareas conversacionales y de conocimiento en coreano, manteniendo capacidades bilingües (coreano e inglés). El modelo se distribuye en formato MLX, optimizado para inferencia en dispositivos Apple Silicon con bajo consumo de memoria (menos de 1,2 GB de RAM según la descripción del autor), lo que lo hace adecuado para aplicaciones on-device y entornos con recursos limitados.

La relevancia de este modelo radica en su tamaño reducido (1.5B parámetros en el modelo base, con pesos cuantizados a 4-bit) y su especialización en coreano, un idioma con menos modelos optimizados en el ecosistema open source. Al estar basado en Qwen2.5, hereda la arquitectura transformer decoder-only con atención de ventana larga (hasta 32k tokens en el modelo original, aunque no se confirma en esta versión). El repositorio incluye el modelo en formato safetensors compatible con la librería mlx-lm, lo que facilita su integración en aplicaciones macOS.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 241.327.616 (pesos cuantizados 4-bit; el modelo base tiene 1.5B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-1.5B-Instruct, probablemente 32.768 tokens) |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5 de Alibaba, un transformer decoder-only con atención multi-cabeza y normalización RMSNorm. El modelo original Qwen2.5-1.5B-Instruct cuenta con 1.5 mil millones de parámetros y fue preentrenado con un extenso corpus multilingüe, seguido de un ajuste fino con instrucciones y preferencias humanas (RLHF/DPO). Gaiel-1.5B-Korean-Tuned-MLX es un fine-tuning de este modelo base, realizado por JK Universe, con el objetivo de mejorar la competencia en coreano para tareas conversacionales y de conocimiento general.

No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni el método exacto de ajuste (si fue supervisado, con RLHF u otro). El modelo se distribuye en formato MLX con cuantización a 4-bit, lo que reduce significativamente el tamaño de los pesos (241M parámetros en safetensors) y permite una inferencia eficiente en Apple Silicon.

## Capacidades

- Generación de texto en coreano e inglés con estilo conversacional.
- Comprensión y respuesta a instrucciones en formato chat (chat template de Qwen2.5).
- Especialización en coreano: mayor fluidez y precisión en tareas en este idioma comparado con el modelo base sin ajuste.
- Optimizado para inferencia en dispositivos Apple Silicon mediante MLX, con bajo uso de memoria.
- Capacidad de manejar diálogos multi-turno gracias a la plantilla de chat integrada.
- No se menciona soporte para tool calling, funciones multimodales ni razonamiento avanzado en la información disponible.

## Casos de uso

- Asistentes virtuales en coreano para dispositivos Apple: el modelo puede integrarse en aplicaciones macOS o iOS mediante mlx-lm para ofrecer respuestas conversacionales en coreano sin conexión a internet, gracias a su bajo consumo de memoria (<1.2 GB).
- Chatbots de atención al cliente en coreano: su tamaño reducido permite desplegarlo en entornos con recursos limitados, como servidores pequeños o dispositivos edge, para gestionar consultas frecuentes en coreano.
- Herramientas de traducción y corrección de texto coreano: al estar ajustado en coreano, puede utilizarse para tareas de generación de texto, resumen o reformulación en este idioma.
- Prototipos de investigación en PNL coreana: sirve como modelo ligero de referencia para experimentos de fine-tuning o evaluación de tareas específicas en coreano.
- Aplicaciones educativas de idiomas: puede generar ejercicios, diálogos o explicaciones en coreano para estudiantes, funcionando en hardware de consumo.
- Asistentes de escritura en coreano: integrado en editores de texto o entornos de desarrollo, puede sugerir frases o completar párrafos en coreano de forma local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona un dataset de evaluación en [encredible/gaiel-mlx-benchmarks](https://huggingface.co/datasets/encredible/gaiel-mlx-benchmarks), pero no se proporcionan métricas concretas en la model card.

## Requisitos de hardware

- VRAM estimada: menos de 1,2 GB según la descripción del modelo (pesos cuantizados 4-bit).
- GPU recomendadas: no aplica (diseñado para Apple Silicon, no para GPU NVIDIA).
- Compatibilidad: funciona en Macs con chips M1, M2, M3 o posteriores, gracias al framework MLX.
- Opciones de despliegue: mediante la librería `mlx-lm` (pip install mlx-lm) en entornos Python; no se menciona compatibilidad con vLLM, llama.cpp u otros servidores de inferencia estándar.
- Latencia y throughput: no disponibles; se espera una inferencia rápida en Apple Silicon por el tamaño reducido y la cuantización 4-bit.

## Comparativa con modelos similares

No se dispone de datos suficientes para realizar una comparativa con otros modelos. Como referencia, se puede comparar con el modelo base Qwen/Qwen2.5-1.5B-Instruct, del cual deriva, y con otros SLM coreanos como Polyglot-Ko o Llama-3-Korean, pero no se tienen métricas ni detalles de rendimiento para establecer una tabla objetiva. La información disponible no incluye benchmarks ni evaluaciones comparativas.

## Limitaciones y advertencias

- Licencia no disponible: no se especifica la licencia del modelo, lo que puede limitar su uso comercial o de redistribución. Se recomienda contactar al autor antes de utilizarlo en producción.
- Sesgos y alucinaciones: al ser un modelo ajustado a partir de Qwen2.5, puede presentar sesgos presentes en los datos de entrenamiento originales y generar contenido incorrecto o inventado, especialmente en dominios especializados.
- Limitaciones de idioma: aunque soporta inglés, su especialización es el coreano; el rendimiento en inglés puede ser inferior al del modelo base.
- Contexto limitado: no se confirma la longitud de contexto máxima; si hereda los 32k tokens de Qwen2.5, puede manejar diálogos largos, pero no se garantiza.
- Dependencia de MLX: el modelo está optimizado para Apple Silicon y no se distribuye en formatos como GGUF o FP16 estándar, lo que limita su despliegue en otras plataformas.
- Sin soporte para herramientas ni funciones multimodales: no se indica capacidad de tool calling, visión o audio, por lo que no es adecuado para tareas que requieran estas funcionalidades.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/encredible/Gaiel-1.5B-Korean-Tuned-MLX)
- [Dataset de benchmarks del autor](https://huggingface.co/datasets/encredible/gaiel-mlx-benchmarks)
- [Modelo base Qwen2.5-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct)
