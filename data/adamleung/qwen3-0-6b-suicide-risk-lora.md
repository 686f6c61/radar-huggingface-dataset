# AdamLeung/qwen3-0.6b-suicide-risk-lora

## Resumen

El modelo `AdamLeung/qwen3-0.6b-suicide-risk-lora` es un adaptador LoRA que afina el modelo base `Qwen/Qwen3-0.6B` para clasificar el riesgo de suicidio o autolesión expresado por el autor de una publicación corta en redes sociales, utilizando una escala ordinal de 5 niveles (0 a 4). Desarrollado por AdamLeung como artefacto de investigación para un estudio de guardrails, no está concebido como herramienta diagnóstica o clínica.

El adaptador se entrena sobre Qwen3-0.6B, un modelo de lenguaje causal de 0.6 mil millones de parámetros, y se utiliza como clasificador de texto de una sola etiqueta. La relevancia actual radica en su aplicación potencial para la moderación de contenido y el triaje en salud mental, un área con creciente demanda de soluciones automatizadas y éticamente sensibles. El repositorio incluye el adaptador en formato PEFT (safetensors) y documenta su evaluación sobre un conjunto de prueba de 875 publicaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-0.6B (transformer causal) + adaptador LoRA |
| Parametros totales | 0.6B (modelo base) + adaptador LoRA (~0.1 GB en disco) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-0.6B soporta 32K tokens, pero no se especifica para el adaptador) |
| Tipos de cuantizacion | no especificados (el adaptador se distribuye en safetensors; el modelo base admite cuantizaciones comunes) |
| Idiomas soportados | ingles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en Qwen3-0.6B, un modelo transformer causal con atención de ventana deslizante y mecanismos de thinking opcionales. La configuración LoRA emplea `r=16`, `alpha=32`, `dropout=0.05`, `bias=none`, y ataca las proyecciones `q/k/v/o_proj` y `gate/up/down_proj`. El entrenamiento se realiza con el framework PEFT 0.18.1, y el modelo se usa como clasificador ordinal de 5 clases, generando un único dígito (0-4) según una rúbrica definida en el prompt del sistema.

No se proporcionan detalles sobre el dataset de entrenamiento (número de tokens, composición, método de alineación como RLHF o DPO). La evaluación se realiza sobre un conjunto de prueba de 875 publicaciones, nunca vistas durante el entrenamiento, con una precisión global de 0.8000 y macro-F1 de 0.7393 en float32 sobre CPU.

## Capacidades

- Clasificacion de riesgo de suicidio/autolesion en escala ordinal 0-4, evaluando el riesgo del autor de la publicacion.
- Analisis de textos cortos de redes sociales (ingles).
- Distincion entre ausencia de riesgo, malestar emocional, ideacion pasiva, ideacion activa y riesgo inminente con metodo/plan/intento.
- Generacion de una unica etiqueta numerica como respuesta, sin texto adicional.
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio.
- Capacidad multilingue limitada al ingles (segun la model card).

## Casos de uso

- Moderacion de contenido en plataformas sociales: el modelo puede priorizar publicaciones con riesgo alto (nivel 3 o 4) para revision humana inmediata, reduciendo la carga de los equipos de seguridad.
- Triaje en servicios de salud mental digital: como primer filtro en chatbots o lineas de ayuda, derivando casos urgentes a profesionales.
- Investigacion en guardrails de LLMs: sirve como componente de evaluacion para medir la seguridad de respuestas generadas por otros modelos ante prompts de autolesion.
- Monitorizacion de foros y comunidades online: deteccion temprana de patrones de riesgo en conversaciones largas, aunque el modelo procesa publicaciones individuales.
- Analisis retrospectivo de datos: clasificacion de historiales de publicaciones para estudios epidemiologicos sobre salud mental.
- Desarrollo de sistemas de alerta temprana: integracion en pipelines de procesamiento de texto para generar alertas automaticas cuando se detecta riesgo inminente (nivel 4).

## Benchmarks y rendimiento

La model card reporta los siguientes resultados sobre un conjunto de prueba de 875 publicaciones:

| Metrica | Valor |
|---|---|
| Precision (accuracy) | 0.8000 |
| Macro-F1 | 0.7393 |
| Latencia media (CPU, float32) | 704 ms |
| Pico de VRAM | no disponible |
| Invalid (salidas no validas) | 0 |

Desglose por clase:

| Clase | Precision | Recall |
|---|---|---|
| 0 (sin riesgo) | 0.878 | 0.933 |
| 1 (malestar emocional) | 0.660 | 0.535 |
| 2 (ideacion pasiva) | 0.656 | 0.772 |
| 3 (ideacion activa) | 0.727 | 0.727 |
| 4 (riesgo inminente) | 0.808 | 0.726 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA es ligero (~0.1 GB) y se combina con el modelo base de 0.6B parametros, que en float32 ocupa aproximadamente 2.4 GB de memoria.
- Inferencia en CPU viable: la latencia media reportada es de 704 ms por prediccion en float32, aceptable para procesamiento por lotes.
- Cabe en GPUs de consumo: una RTX 3060 (12 GB) o superior puede ejecutar el modelo sin problemas; incluso una GPU con 4 GB de VRAM seria suficiente con cuantizacion del modelo base.
- Opciones de despliegue: transformers + PEFT (como en el ejemplo de la model card), vLLM (con el adaptador cargado), o llama.cpp si se convierte el modelo base a GGUF y se aplica el adaptador.
- No se proporcionan datos de throughput ni latencia en GPU.

## Comparativa con modelos similares

No se dispone de informacion sobre otros adaptadores LoRA especificos para clasificacion de riesgo de suicidio sobre Qwen3-0.6B. Como referencia, se puede comparar con el modelo base sin adaptador:

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| Qwen3-0.6B (base) | 0.6B | 32K | Generacion de texto general | Apache 2.0 |
| AdamLeung/qwen3-0.6b-suicide-risk-lora | 0.6B + LoRA | no disponible | Clasificacion de riesgo (0-4) | no disponible |

No se han encontrado alternativas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es una herramienta clinica ni diagnostica: la model card lo declara explicitamente como artefacto de investigacion para un estudio de guardrails.
- Sesgos potenciales: el modelo se entrena y evalua solo en ingles, y no se especifica la diversidad demografica o cultural del dataset, lo que puede afectar la generalizacion.
- Riesgo de falsos negativos: la clase 1 (malestar emocional) tiene un recall bajo (0.535), lo que puede subestimar casos de angustia sin ideacion explicita.
- Alucinacion y salidas invalidas: aunque el informe muestra 0 salidas invalidas, el modelo puede generar digitos fuera del rango 0-4 si se usa fuera del prompt de entrenamiento.
- Restricciones de licencia: la licencia del adaptador no esta disponible; el modelo base Qwen3-0.6B se distribuye bajo Apache 2.0, pero el adaptador podria tener restricciones adicionales no documentadas.
- Limitacion de contexto: al ser un clasificador de publicaciones cortas, no esta disenado para analizar conversaciones largas o multiples turnos.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/AdamLeung/qwen3-0.6b-suicide-risk-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Informe tecnico de Qwen3: https://arxiv.org/html/2505.09388v1
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
