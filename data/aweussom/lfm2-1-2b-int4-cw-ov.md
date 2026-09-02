# aweussom/LFM2-1.2B-int4-cw-ov

## Resumen

LFM2-1.2B-int4-cw-ov es una exportación del modelo LFM2-1.2B de Liquid AI al formato OpenVINO con cuantización INT4 simétrica por canal (channel-wise). Esta versión está específicamente compilada para ejecutarse en la unidad de procesamiento neuronal (NPU) de los procesadores Intel Core Ultra, y no es compatible con CPU o GPU. El objetivo es ofrecer inferencia de lenguaje natural de alta velocidad en dispositivos de borde, aprovechando la NPU para descargar la carga de trabajo del procesador principal.

El modelo fue creado por el usuario aweussom (Tommy Leonhardsen) y publicado en Hugging Face. Según las mediciones del autor, alcanza una velocidad de decodificación de 36,5 tokens por segundo y un tiempo hasta el primer token (TTFT) de 878 ms en una NPU de tercera generación (Core Ultra 9 285K). Sin embargo, la build presenta problemas críticos en NPU de cuarta generación (Lunar Lake), donde genera texto incoherente, y no funciona en CPU ni GPU. Esta ficha se centra en la versión cuantizada y sus características específicas de despliegue.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (arquitectura propietaria de Liquid AI, no se detalla en la información disponible) |
| Parametros totales | No disponible (el nombre sugiere 1.2B, pero el modelo base puede ser MoE) |
| Parametros activos | No disponible |
| Longitud de contexto | No especificada; el ejemplo de uso fija MAX_PROMPT_LEN=4096 |
| Tipos de cuantizacion | INT4 simétrico por canal (channel-wise symmetric) |
| Idiomas soportados | No disponible (hereda del modelo base, no se especifica) |
| Licencia | LFM Open License v1.0 (Apache-2.0-based, con restricciones comerciales) |
| Formato de pesos | OpenVINO IR (archivos .xml y .bin) |

## Arquitectura y entrenamiento

La información proporcionada no incluye detalles sobre la arquitectura interna del modelo base LFM2-1.2B ni sobre su proceso de entrenamiento. Esta exportación se limita a convertir los pesos del modelo original a formato OpenVINO con cuantización INT4 por canal, una técnica que evita un error conocido del compilador de la NPU (bug `StopLocationVerifierPass`). El autor documenta que la cuantización por grupos (group-wise) provoca fallos en el driver, por lo que se optó por la variante channel-wise.

No se dispone de datos sobre el dataset de entrenamiento, el número de tokens procesados o si se aplicaron técnicas como RLHF o DPO. Para obtener esa información sería necesario consultar la documentación del modelo base LiquidAI/LFM2-1.2B o el technical report de LFM2.

## Capacidades

- Generación de texto: el modelo es capaz de producir respuestas coherentes en lenguaje natural, como se muestra en el ejemplo de uso de la model card.
- Inferencia en NPU: está optimizado para ejecutarse exclusivamente en la NPU de procesadores Intel Core Ultra (generación 3), aprovechando la aceleración por hardware.
- No se especifican capacidades adicionales como tool calling, razonamiento multi-paso, soporte de visión o audio en esta versión cuantizada.
- Se espera que herede las capacidades del modelo base LFM2-1.2B, pero la model card no las detalla.

## Casos de uso

- Asistentes de voz en dispositivos de borde: gracias a su baja latencia (TTFT de 878 ms) y velocidad de decodificación de 36,5 tok/s, puede integrarse en asistentes personales que requieran respuestas casi instantáneas sin conexión a la nube.
- Chatbots locales para entornos con privacidad estricta: al ejecutarse completamente en la NPU del dispositivo, los datos no salen del hardware, lo que resulta adecuado para aplicaciones sanitarias, financieras o gubernamentales.
- Generación de texto en tiempo real en aplicaciones de productividad: por ejemplo, autocompletado de correos o documentos en editores de texto, donde la velocidad de decodificación permite una experiencia fluida.
- Sistemas de transcripción y resumen en reuniones: el modelo puede procesar conversaciones y generar resúmenes en tiempo real, siempre que el contexto se ajuste al límite de MAX_PROMPT_LEN configurado.
- Prototipos de investigación en NPU: los desarrolladores que trabajan con OpenVINO y NPU de Intel pueden usar este modelo como referencia para validar sus propias implementaciones y medir el rendimiento.
- Educación y demostraciones de IA en hardware de bajo consumo: permite mostrar inferencia de lenguaje en equipos sin GPU dedicada, usando únicamente la NPU integrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (como MMLU, HumanEval o GSM8K) en la información disponible. Sin embargo, el autor proporciona mediciones de rendimiento en hardware específico:

| Metrica | Valor |
|---|---|
| TTFT (tiempo hasta el primer token) | 878 ms |
| Velocidad de decodificacion | 36,5 tok/s |
| Tiempo de carga (compilacion en frio) | ~25 s |

Estas mediciones se realizaron en un Intel Core Ultra 9 285K (NPU 3) con driver 32.0.100.4778 y OpenVINO genai 2026.3. No hay comparaciones con otros modelos en la misma configuración.

## Requisitos de hardware

- Dispositivo objetivo: NPU de Intel Core Ultra (generación 3, arquitectura Arrow Lake o Meteor Lake). Se ha validado en Core Ultra 9 285K.
- No compatible con CPU ni GPU: la exportación produce un error de forma en las capas `ScatterNDUpdate` al ejecutarse en esos dispositivos.
- En NPU de cuarta generación (Lunar Lake, Core Ultra 200V) el modelo compila y carga, pero genera texto incoherente (word salad). Este problema se ha verificado con varios drivers y versiones de OpenVINO, y se ha reportado en el issue upstream de OpenVINO.
- La cuantización INT8 en NPU no es recomendable: la variante simétrica genera basura y la asimétrica es muy lenta (~1,4 tok/s). INT4 por canal es la única configuración rápida y correcta.
- Para desplegar en NPU se utiliza la biblioteca `openvino_genai` (ejemplo en la model card) o la herramienta NoLlama.
- El tamaño del repositorio es de 0,7 GB, lo que lo hace adecuado para almacenamiento en dispositivos con espacio limitado.

## Comparativa con modelos similares

No se dispone de datos suficientes para realizar una comparativa cuantitativa con otras exportaciones OpenVINO o con el modelo base sin cuantizar. El autor menciona que la exportación hermana `LFM2.5-1.2B-Instruct-int4-cw-ov` tiene un comportamiento similar en NPU 4, pero no se aportan métricas comparativas. Para una comparación justa sería necesario ejecutar los mismos benchmarks en el mismo hardware, algo que no está documentado en la información proporcionada.

## Limitaciones y advertencias

- **Incompatibilidad con NPU 4**: en procesadores Lunar Lake (Core Ultra 200V) el modelo produce salida incoherente, aunque se ejecute a velocidad completa. El autor indica que esto es un problema de la familia LFM2 en NPU 4, no solo de esta exportación.
- **Sin soporte para CPU o GPU**: esta build falla en esos dispositivos debido a un error de exportación de optimum-intel 1.27. Para CPU/GPU se requiere una exportación diferente (con optimum-intel ≥2.1), que a su vez no funciona en NPU.
- **Riesgo de alucinación y sesgos**: al ser un modelo de lenguaje, puede generar información falsa o reflejar sesgos presentes en sus datos de entrenamiento. No se han documentado medidas específicas de mitigación en esta versión.
- **Restricciones de licencia**: la licencia LFM Open License v1.0 permite uso comercial gratuito solo para empresas con ingresos anuales inferiores a 10 millones de dólares. Por encima de ese umbral, es necesario contactar con Liquid AI para obtener una licencia comercial.
- **Contexto limitado**: aunque no se especifica la longitud máxima de contexto del modelo base, el ejemplo de uso fija MAX_PROMPT_LEN=4096, lo que sugiere que el despliegue práctico está pensado para entradas relativamente cortas.
- **Estado experimental**: esta es una exportación de un usuario independiente, no una versión oficial de Liquid AI. No hay garantías de mantenimiento o soporte.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/aweussom/LFM2-1.2B-int4-cw-ov)
- [Perfil del autor aweussom](https://huggingface.co/aweussom)
- [Modelo base LiquidAI/LFM2-1.2B](https://huggingface.co/LiquidAI/LFM2-1.2B)
- [Blog de Liquid AI sobre LFM2](https://www.liquid.ai/blog/liquid-foundation-models-v2-our-second-series-of-generative-ai-models)
- [Technical report de LFM2 (arXiv)](https://arxiv.org/html/2511.23404v1)
- [Issue de OpenVINO sobre el problema en NPU 4](https://github.com/openvinotoolkit/openvino/issues/37322)
- [Herramienta NoLlama](https://github.com/aweussom/NoLlama)
