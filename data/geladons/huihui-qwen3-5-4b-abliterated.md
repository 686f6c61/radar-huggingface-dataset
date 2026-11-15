# geladons/Huihui-Qwen3.5-4B-abliterated

## Resumen

Huihui-Qwen3.5-4B-abliterated (bundle LiteRT-LM) es una conversión del modelo de lenguaje `huihui-ai/Huihui-Qwen3.5-4B-abliterated` al formato `.litertlm` de Google, pensado para inferencia totalmente local en dispositivos Android. El publicador del bundle es el usuario `geladons`, mientras que el finetune original procede de huihui-ai, que parte a su vez de la familia Qwen3.5 de 4B parámetros. El objetivo es claro: llevar un LLM de 4B a un teléfono sin nube, sin cuenta y sin conexión, con un fichero único de 2,75 GB cuantizado en int4.

La relevancia de esta ficha está en el formato y el runtime, no en el modelo en sí. LiteRT-LM es el stack de Google AI Edge para ejecutar modelos en el borde, y este repositorio empaqueta los pesos para que el SDK `com.google.ai.edge.litertlm` los cargue directamente. Se trata, por tanto, de un artefacto de despliegue: no incorpora mejoras de arquitectura ni de entrenamiento respecto al modelo base.

La información disponible sobre el modelo subyacente es limitada: la model card del bundle no detalla arquitectura interna, número de tokens de entrenamiento ni idiomas soportados, y no se han publicado resultados de benchmarks en el repositorio. El dato más concreto es el tamaño (4B, según el nombre) y el contexto, que no se especifica en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5 de 4B; detalles no publicados en la informacion disponible) |
| Parametros totales | 4B (segun el nombre del modelo; no confirmado en la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 block-quantized (unico formato publicado en este repo) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM runtime); tamano del fichero 2,75 GB |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base en la documentación proporcionada. Por el nombre y la familia a la que pertenece, se trata de un transformer de 4B parámetros derivado de Qwen3.5, pero la model card del bundle no especifica capas, atención, tipo de positional encoding ni si incorpora mecanismos híbridos. Tampoco se detallan los datos de entrenamiento, el número de tokens, la composición del corpus ni si hubo fases de RLHF o DPO.

El único proceso técnico documentado es la conversión al formato LiteRT-LM con cuantización int4 por bloques, que reduce el modelo a un fichero de 2,75 GB apto para ejecución en dispositivo. El modelo base es un finetune "abliterated" de huihui-ai, una técnica de edición de pesos orientada a reducir los rechazos del modelo instruct original; no se documentan en este repositorio los detalles del procedimiento ni su impacto cuantificado.

## Capacidades

- Generación de texto en modo conversacional (pipeline `text-generation`), con modalidad texto a texto.
- Ejecución totalmente offline en dispositivo: no requiere nube ni cuenta, según la model card.
- Integración con el SDK `com.google.ai.edge.litertlm` mediante las clases `Engine` y `Conversation`.
- Uso directo desde la aplicación Local AI (Google Play), que incluye el modelo en su catálogo integrado.
- Comportamiento "uncensored/abliterated": la model card indica menos rechazos que el modelo instruct base, sin cuantificar.
- Soporte de tool calling, agentes, visión, audio o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Asistentes conversacionales offline en Android: el bundle se carga con el SDK LiteRT-LM y permite chatear sin conexión, útil en entornos sin red o con requisitos de privacidad estrictos.
- Aplicaciones de campo sin conectividad: técnicos en obra, zonas rurales o instalaciones aisladas pueden usar el modelo embebido en una app para consultas en lenguaje natural.
- Prototipado rápido de apps de IA en el borde: el formato `.litertlm` y la app Local AI permiten validar una idea de producto sin montar infraestructura de servidores.
- Procesamiento de texto sensible en local: al no enviar datos a la nube, encaja en flujos donde el texto del usuario no puede salir del dispositivo.
- Generación de texto auxiliar en apps móviles: resúmenes, reescritura o borradores dentro de una aplicación Android que ya integre el runtime de Google AI Edge.
- Experimentación con modelos "abliterated" en el borde: investigadores pueden evaluar el comportamiento con menos rechazos en un entorno controlado y sin dependencias de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: el fichero `.litertlm` ocupa 2,75 GB; el repositorio completo pesa 2,8 GB.
- VRAM/RAM: no se especifica en la model card el consumo en ejecución; como referencia de orden de magnitud, un modelo de 4B en int4 requiere del orden de 2-3 GB solo para los pesos, más overhead del runtime y del contexto (estimación, no dato publicado).
- GPU recomendadas: no disponible; el destino declarado es Android con aceleración del runtime LiteRT-LM, no GPU de servidor.
- ¿Cabe en GPU de consumo? No hay datos publicados para este bundle; el formato `.litertlm` está orientado a dispositivos móviles, no a tarjetas gráficas de escritorio.
- Opciones de despliegue: SDK `com.google.ai.edge.litertlm` (clases `Engine`/`Conversation`), app Local AI en Google Play, y recetas de conversión en `hf-to-litertlm`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| geladons/Huihui-Qwen3.5-4B-abliterated (este) | 4B (segun nombre) | no disponible | `.litertlm` int4 | apache-2.0 | Bundle on-device para Android |
| huihui-ai/Huihui-Qwen3.5-4B-abliterated | 4B (segun nombre) | no disponible | no disponible en la informacion | no disponible en la informacion | Modelo base del que se deriva este bundle |
| geladons/local-ai-models | no disponible | no disponible | `.litertlm` | no disponible | Repositorio contenedor; la model card indica que el fichero es byte-idéntico |

No se dispone de datos de rendimiento ni de contexto para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al ser un finetune "abliterated", la reducción de rechazos puede aumentar la probabilidad de respuestas inapropiadas o no alineadas con políticas de seguridad.
- Riesgo de alucinación: inherente a los LLM de 4B; no se han publicado evaluaciones de fidelidad para este bundle.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento adecuado fuera del inglés o del chino sin verificación previa.
- Longitud de contexto no disponible: limita la planificación de aplicaciones con conversaciones largas o documentos extensos.
- Licencia apache-2.0, que permite uso comercial, pero el usuario debe verificar las condiciones del modelo base y de los pesos originales de Qwen3.5 antes de distribuirlo en producción.
- El artefacto está atado al runtime LiteRT-LM y a Android; no es portable directamente a otros stacks de inferencia sin reconversión.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni evidencia de uso en producción.
- El contenido "uncensored" puede incumplir políticas de las tiendas de aplicaciones o los términos de uso de plataformas de distribución; conviene revisarlo antes de publicar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/geladons/Huihui-Qwen3.5-4B-abliterated
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-4B-abliterated
- Repositorio contenedor de bundles: https://huggingface.co/geladons/local-ai-models
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Recetas de conversión hf-to-litertlm: https://github.com/john-rocky/hf-to-litertlm
- App Local AI (Google Play): https://play.google.com/store/apps/details?id=com.ochandydude.localai
- Licencia Apache 2.0: https://spdx.org/licenses/apache-2.0.html
