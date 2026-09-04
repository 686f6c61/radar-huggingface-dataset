# exo-jhop/ministral3-gdpr-dpo

## Resumen

ministral3-gdpr-dpo es un modelo de lenguaje de la familia mistral3, fine-tuned mediante Direct Preference Optimization (DPO) y orientado a tareas relacionadas con el cumplimiento del Reglamento General de Protección de Datos (RGPD). Ha sido desarrollado por el usuario exo-jhop y parte de un adaptador LoRA previo, ministral3-gdpr-lora, del que hereda el enfoque de ajuste fino. El proyecto se ha construido con Unsloth, una biblioteca de optimización que acelera el entrenamiento de modelos de lenguaje, lo que, según la model card, permitió un entrenamiento dos veces más rápido.

El repositorio en HuggingFace es notablemente pequeño, con un tamaño de 0.2 GB, lo que sugiere que contiene los pesos del adaptador DPO en formato safetensors en lugar del modelo completo. No se han publicado detalles sobre el dataset de entrenamiento, la arquitectura exacta, la longitud de contexto ni benchmarks. El modelo se distribuye bajo licencia Apache 2.0 y está documentado únicamente para el idioma inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mistral 3 (según etiquetas de HuggingFace) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura mistral3, aunque no se han publicado los detalles exactos de la misma en la información disponible. Se trata de un fine-tune realizado en dos etapas: primero se creó un adaptador LoRA (ministral3-gdpr-lora) y después se aplicó un ajuste mediante DPO sobre ese adaptador. El entrenamiento se llevó a cabo con Unsloth, lo que, según la model card, redujo el tiempo de entrenamiento a la mitad. No hay información sobre el número de tokens, la composición del dataset ni el uso de técnicas adicionales como RLHF.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje, puede generar respuestas textuales.
- Ajuste mediante DPO: el uso de Direct Preference Optimization indica que se ha alineado con preferencias humanas, aunque no se han publicado los datos de preferencias utilizados.
- Enfoque RGPD: por nombre y etiquetas, el modelo está orientado a tareas relacionadas con el Reglamento General de Protección de Datos, como el tratamiento de información personal.
- Idioma: inglés, según la información de HuggingFace.
- No se han publicado detalles sobre soporte de tool calling, visión, audio o capacidades multimodales.

## Casos de uso

Los siguientes casos son potenciales, derivados del nombre y las etiquetas del modelo; no existe documentación oficial al respecto.

- Asistente de consultas RGPD: el modelo puede responder preguntas sobre los principios del RGPD, los derechos de los interesados o las obligaciones de los responsables de tratamiento. Su ajuste mediante DPO podría mejorar la calidad de las respuestas en contextos legales.
- Revisión de políticas de privacidad: puede analizar textos de políticas de privacidad y detectar cumplimiento o incumplimiento de requisitos del RGPD.
- Anonimización de datos personales: puede reemplazar o enmascarar datos personales en documentos antes de su publicación.
- Atención al cliente en compliance: chatbot para consultas internas de empleados sobre tratamiento de datos, con respuestas basadas en la legislación europea.
- Documentación de evaluaciones de impacto: generación de plantillas para evaluaciones de impacto en protección de datos (DPIA) según el RGPD.
- Formación de personal en protección de datos: generación de material educativo y preguntas de ejemplo sobre el RGPD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no documentada.
- Opciones de despliegue: no documentadas. El repositorio incluye safetensors y la etiqueta text-generation-inference, lo que sugiere compatibilidad potencial con TGI, pero no hay instrucciones detalladas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No existe información suficiente para comparar este modelo con alternativas de la misma categoría.

## Limitaciones y advertencias

- No hay evaluación pública de sesgos, alucinaciones o precisión en tareas relacionadas con el RGPD.
- El repositorio solo pesa 0.2 GB, lo que indica que contiene un adaptador, no el modelo completo. Para utilizar el modelo se requiere cargar el modelo base mistral3 o el adaptador sobre el LoRA original, pero no se proporcionan instrucciones claras.
- Sin benchmarks publicados, el rendimiento real es desconocido.
- El cumplimiento del RGPD por parte del modelo no está garantizado; es una herramienta de asistencia y no debe sustituir el asesoramiento legal.
- Solo se ha documentado soporte para el idioma inglés.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías.

## Enlaces

- HuggingFace: https://huggingface.co/exo-jhop/ministral3-gdpr-dpo
- Modelo base: https://huggingface.co/exo-jhop/ministral3-gdpr-lora
- Modelo relacionado: https://huggingface.co/exo-jhop/ministral3-gdpr-distilled
- Perfil del autor: https://huggingface.co/exo-jhop
- Unsloth: https://github.com/unslothai/unsloth
