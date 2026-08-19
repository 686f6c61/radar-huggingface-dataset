# ReadyArt/Serenity-27B-v0.5

## Resumen
Serenity-27B-v0.5 es un modelo de lenguaje de 27 mil millones de parámetros desarrollado por ReadyArt, basado en el modelo Qwen3.8-27B de Alibaba. Se trata de un fine-tuning orientado al roleplay y a la conversación, con un enfoque explícito en contenido adulto y sin alineación de seguridad. La serie Serenity, según la colección oficial, combina características de otros modelos de la misma organización (Melody y For Her Darkside) para ofrecer un comportamiento más "sereno" pero igualmente desinhibido.

Este modelo resulta relevante para desarrolladores e investigadores que trabajan en sistemas de rol no censurados, generación de narrativa adulta o simulaciones de personajes, aunque su acceso está restringido en HuggingFace y requiere aceptar condiciones específicas. La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede ser explícito y no apto para menores.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B) |
| Parametros totales | 27B (aproximado, según nombre del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (probablemente safetensors, sin confirmar) |

## Arquitectura y entrenamiento
El modelo se construye a partir de Qwen3.8-27B, un modelo de lenguaje de 27 mil millones de parámetros desarrollado por Alibaba Cloud. Serenity-27B-v0.5 es un fine-tune de ese modelo base, pero no se han publicado detalles sobre el dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas como RLHF o DPO. Los tags indican que el modelo está "unaligned" (sin alineación), lo que sugiere que no se han aplicado procesos de refuerzo para reducir contenido dañino o explícito. Tampoco hay información sobre innovaciones técnicas específicas en la arquitectura o el proceso de entrenamiento más allá del ajuste fino.

## Capacidades
- Generación de texto conversacional y narrativo, orientado a roleplay.
- Soporte de instrucciones (instruct) para guiar respuestas.
- Capacidad para manejar contenido explícito y maduro, incluido roleplay erótico (etiqueta "erp").
- Funciona como un modelo no alineado, lo que permite respuestas sin filtros de seguridad estándar.
- No se especifican capacidades adicionales como tool calling, agentes o razonamiento multi-paso.

## Casos de uso
- Roleplay de personajes en entornos de ficción interactiva: el modelo puede mantener conversaciones de múltiples turnos con un personaje definido por el usuario, aprovechando su entrenamiento específico para roleplay.
- Creación de historias eróticas o narrativa adulta: su naturaleza no alineada permite generar contenido explícito de forma continua, adecuado para escritura creativa en plataformas de literatura para adultos.
- Simulación de diálogos para videojuegos de rol (RPG) con contenido maduro: el modelo puede actuar como NPC o compañero en juegos de texto, manteniendo coherencia conversacional durante largas sesiones.
- Generación de guiones para audiodramas o podcasts de temática adulta: el modelo puede producir diálogos realistas entre personajes, reduciendo el tiempo de escritura.
- Entrenamiento de chatbots de entretenimiento para mayores de edad: integrado en una plataforma con control de acceso, el modelo ofrece respuestas sin restricciones de contenido.
- Experimentación académica en IA sin alineación: investigadores pueden estudiar el comportamiento de un modelo no alineado en contextos conversacionales, comparándolo con versiones alineadas de Qwen.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: sin cuantizar, un modelo de 27B en FP16 requiere aproximadamente 54 GB de VRAM. Con cuantización 8-bit (~27 GB) o 4-bit (~13.5 GB) podría caber en GPUs de gama alta, pero no se ha confirmado qué formatos de cuantización están disponibles.
- GPUs recomendadas: para ejecutar sin cuantizar, se necesitan A100 (80 GB) o H100 (80 GB); con cuantización 4-bit, una RTX 4090 (24 GB) podría ser suficiente, aunque no se garantiza.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y TGI son compatibles con modelos basados en Qwen, pero no se ha verificado el soporte específico para esta versión.
- Latencia y throughput: no hay datos oficiales; dependerán del hardware y la configuración de cuantización.

## Comparativa con modelos similares
No se dispone de datos comparativos con otros modelos de roleplay o conversación en la información proporcionada. No se puede establecer una comparación objetiva en términos de rendimiento, contexto o calidad de generación. Se recomienda consultar la página de HuggingFace para futuras actualizaciones.

## Limitaciones y advertencias
- El modelo está diseñado para contenido adulto y explícito, lo que lo hace inadecuado para aplicaciones generales o para menores.
- No está alineado, por lo que puede generar respuestas ofensivas, ilegales o dañinas si se le solicita.
- El acceso está restringido en HuggingFace; requiere aceptar condiciones adicionales que pueden incluir requisitos de verificación de edad.
- La licencia Apache-2.0 permite uso comercial, pero el contenido generado puede estar sujeto a otras regulaciones legales según la jurisdicción.
- No hay datos sobre sesgos específicos, pero al ser un fine-tune sin alineación, es probable que presente sesgos del dataset de entrenamiento, que no ha sido documentado.
- La longitud de contexto y el rendimiento real en producción no están documentados, lo que puede suponer un riesgo para su integración en aplicaciones críticas.

## Enlaces
- [Modelo en Hugging Face](https://huggingface.co/ReadyArt/Serenity-27B-v0.5)
- [Colección de la serie Serenity](https://huggingface.co/collections/ReadyArt/serenity-series)
- [Perfil de la organización ReadyArt](https://huggingface.co/ReadyArt)
