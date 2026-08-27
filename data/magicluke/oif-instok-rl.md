# MagicLuke/oif-instok-rl

## Resumen

Oif-instok-rl es un adaptador LoRA desarrollado por MagicLuke (Haolong Zheng) sobre el modelo base nvidia/personaplex-7b-v1 de NVIDIA. El adaptador está diseñado para habla full-duplex (conversación bidireccional en tiempo real) con capacidades de seguimiento de instrucciones, utilizando la librería Moshi. Se ha entrenado con técnicas de reinforcement learning (RL) y Group Direct Preference Optimization (GDPO) para mejorar la adherencia a instrucciones en contextos conversacionales de voz.

El modelo se publica con acceso restringido (gated) y licencia personaplex-derivative, lo que limita su uso comercial sin revisar los términos específicos. Con un tamaño de repositorio de 1.2 GB, se trata de un adaptador que se combina con el modelo base de 7B parámetros de NVIDIA. En el momento de la publicación no registra descargas ni likes, y no se han publicado benchmarks ni documentación técnica detallada, lo que dificulta una evaluación objetiva de su rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adapter sobre PersonaPlex-7B (full-duplex speech, Moshi) |
| Parametros totales | no disponible (adaptador LoRA de 1.2 GB; modelo base: 7B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | personaplex-derivative |
| Formato de pesos | no disponible (librería moshi) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) construido sobre nvidia/personaplex-7b-v1, un modelo de habla full-duplex basado en la arquitectura Moshi. La técnica LoRA permite ajustar el modelo base sin modificar todos sus parámetros, lo que reduce significativamente los costes de entrenamiento e inferencia. El adaptador se integra con la librería Moshi, especializada en modelos de voz bidireccionales en tiempo real.

El entrenamiento se ha realizado mediante reinforcement learning (RL) y Group Direct Preference Optimization (GDPO), técnicas orientadas a alinear el comportamiento del modelo con preferencias humanas. Los tags del repositorio indican un enfoque específico en el seguimiento de instrucciones (instruction-following) en el contexto de conversaciones de voz full-duplex. No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens utilizados ni las configuraciones de hiperparámetros.

## Capacidades

- Habla full-duplex: el modelo está diseñado para conversaciones bidireccionales en tiempo real, donde puede escuchar y hablar simultáneamente sin esperar turnos completos.
- Seguimiento de instrucciones: entrenado específicamente para seguir instrucciones en contexto conversacional de voz, lo que permite dirigir la conversación mediante comandos verbales.
- Adaptación LoRA: al ser un adaptador, se combina con el modelo base PersonaPlex-7B para tareas específicas de voz sin necesidad de reentrenar el modelo completo.
- Entrenamiento con RL y GDPO: alineación con preferencias humanas mediante técnicas de optimización directa, lo que debería mejorar la calidad de las respuestas frente a un fine-tuning supervisado convencional.
- Integración con librería Moshi: compatible con el ecosistema de herramientas de Moshi para el despliegue de modelos de voz en tiempo real.

## Casos de uso

- Asistentes de voz en tiempo real: el modelo puede gestionar conversaciones bidireccionales sin esperar a que el usuario termine de hablar, lo que permite interacciones más naturales y fluidas en asistentes personales o dispositivos domésticos inteligentes.
- Sistemas de atención al cliente por teléfono: su capacidad full-duplex permite interrumpir y responder en tiempo real, mejorando la experiencia en IVR (Interactive Voice Response) y centros de contacto donde la latencia es crítica.
- Traducción conversacional simultánea: al poder procesar y generar habla de forma simultánea, puede utilizarse en escenarios de interpretación en tiempo real entre dos interlocutores.
- Entrenamiento de habilidades conversacionales: útil como simulador de conversación en programas de formación para personal de ventas, soporte técnico o atención sanitaria, donde el seguimiento de instrucciones permite guiar el escenario.
- Accesibilidad: puede integrarse en soluciones de asistencia para personas con discapacidad visual o motora que requieran interacción por voz sin latencia perceptible.
- Juegos y entretenimiento interactivo: permite personajes no jugables (NPC) que conversan de forma natural y en tiempo real con el jugador, respondiendo a interrupciones y preguntas sin guiones predefinidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 1.2 GB, pero requiere el modelo base PersonaPlex-7B (7B parámetros) para funcionar.
- Estimación de VRAM: el modelo base en FP16 requiere aproximadamente 14 GB de VRAM; con el adaptador, se estima un total de 15-16 GB. Estas cifras son estimaciones basadas en el tamaño del modelo, no en especificaciones oficiales.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) o GPUs con al menos 16 GB de VRAM para inferencia en FP16.
- En GPUs de consumo con menos VRAM sería necesario cuantizar el modelo base, aunque no se dispone de información sobre cuantizaciones disponibles para este adaptador.
- Opciones de despliegue: al usar la librería Moshi, el despliegue se realizaría a través de las herramientas del ecosistema Moshi. No se dispone de información sobre compatibilidad con vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

No se dispone de datos suficientes para realizar una comparativa rigurosa con modelos similares. El modelo base PersonaPlex-7B de NVIDIA es la referencia directa, pero no se han publicado métricas comparativas del adaptador frente a otras alternativas de habla full-duplex como Moshi de Kyutai u otros modelos de voz conversacional.

## Limitaciones y advertencias

- Acceso restringido (gated): el modelo requiere aceptar condiciones en HuggingFace antes de poder descargarlo, lo que añade fricción al proceso de evaluación.
- Licencia personaplex-derivative: no es una licencia open source estándar; es necesario revisar los términos específicos antes de cualquier uso, especialmente comercial.
- Sin datos de rendimiento: no se han publicado benchmarks ni métricas de calidad, lo que dificulta evaluar su rendimiento real frente a alternativas.
- Sin información sobre idiomas: no se especifican los idiomas soportados, lo que limita la planificación de despliegues multilingües.
- Sin documentación de entrenamiento: no se detallan los datos de entrenamiento, lo que impide evaluar posibles sesgos en el comportamiento del modelo.
- Modelo reciente sin adopción: con 0 descargas y 0 likes en el momento de la publicación, no hay evidencia de uso en producción ni retroalimentación de la comunidad.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar respuestas incorrectas o inventadas, especialmente en conversaciones abiertas sin restricciones temáticas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/MagicLuke/oif-instok-rl
- Perfil del autor en HuggingFace: https://huggingface.co/MagicLuke
- Modelos del autor: https://huggingface.co/MagicLuke/models
- Repositorios del autor en GitHub: https://github.com/MagicLuke?tab=repositories
- Sitio web oficial del autor: https://github.com/MagicLuke/Official-Website
