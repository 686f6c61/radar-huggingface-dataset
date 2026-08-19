# mosesman/LFM2.5-2.6B-openvino-int8-npu

## Resumen

El modelo `mosesman/LFM2.5-2.6B-openvino-int8-npu` es una conversión a formato OpenVINO IR del modelo `LiquidAI/LFM2.5-2.6B`, cuantizada a INT8 mediante NNCF y optimizada específicamente para la unidad de procesamiento neuronal (NPU) de los procesadores Intel Core Ultra con Intel AI Boost. El autor, mosesman, ha publicado esta exportación para facilitar la ejecución de un modelo de lenguaje de 2.600 millones de parámetros en hardware de bajo consumo, sin necesidad de GPU dedicada. La relevancia actual radica en la creciente demanda de ejecutar LLMs en dispositivos edge y portátiles con eficiencia energética, aprovechando las NPU integradas en los últimos procesadores Intel.

El modelo base, LFM2.5-2.6B, es un modelo de texto de Liquid AI, con una ventana de contexto que no se especifica en la información disponible, pero que soporta 18 idiomas. Esta conversión INT8 mantiene la funcionalidad completa del modelo original, permitiendo generación de texto y conversación multilingüe. Es importante señalar que el autor reporta que la versión INT4 de este mismo modelo falla en NPU con OpenVINO 2026.3, mientras que la versión INT8 funciona correctamente con la versión 2026.4 nightly, lo que convierte a esta exportación en la opción estable para NPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: LiquidAI/LFM2.5-2.6B) |
| Parametros totales | 2.6 mil millones |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (OpenVINO IR) |
| Idiomas soportados | en, ar, zh, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi (18 idiomas) |
| Licencia | LFM 1.0 (https://www.liquid.ai/lfm-license) |
| Formato de pesos | OpenVINO IR (XML + BIN) |

## Arquitectura y entrenamiento

La arquitectura interna del modelo base LFM2.5-2.6B no se detalla en la información proporcionada. Al ser un modelo de 2.6B parámetros de Liquid AI, probablemente sigue una arquitectura transformer densa, pero no se confirma. El proceso de conversión realizado por el autor consiste en exportar el checkpoint original a OpenVINO IR y aplicar cuantización INT8 simétrica mediante NNCF (Neural Network Compression Framework). No se ha realizado ningún entrenamiento adicional; se trata exclusivamente de una optimización de inferencia.

El modelo base fue entrenado por Liquid AI, aunque no se especifican los datos de entrenamiento, el número de tokens ni si se aplicaron técnicas de RLHF o DPO. La cuantización INT8 reduce el tamaño del modelo a aproximadamente 2.7 GB (tamaño del repositorio), lo que permite su carga en memoria del sistema sin necesidad de VRAM dedicada. La exportación mantiene el tokenizador original y el formato de chat template.

## Capacidades

- Generación de texto en 18 idiomas, incluyendo español, inglés, árabe, chino, francés, alemán, hindi, indonesio, italiano, japonés, coreano, polaco, portugués, ruso, tailandés y vietnamita.
- Conversación multi-turno mediante chat template estándar (aplicable con `apply_chat_template`).
- Razonamiento aritmético básico (verificado en el ejemplo del README con la multiplicación 17*19).
- Inferencia en dispositivos con NPU Intel AI Boost, así como en GPU y CPU mediante OpenVINO.
- Compatibilidad con OpenVINO GenAI (`openvino_genai.LLMPipeline`) para integración en aplicaciones Python.
- Modo de generación greedy únicamente en NPU (no soporta sampling en este hardware).
- Soporte de cuantización INT8 que mantiene un equilibrio entre rendimiento y calidad.

## Casos de uso

- Asistente conversacional local en portátiles con Intel Core Ultra: el modelo puede ejecutarse completamente en la NPU, liberando la GPU para otras tareas y reduciendo el consumo energético. Un usuario podría integrarlo en una aplicación de chat privada sin conexión a internet.
- Generación de texto multilingüe en entornos sin GPU: gracias a su tamaño reducido y a la cuantización INT8, el modelo es adecuado para traducción automática, redacción de correos o resúmenes de documentos en múltiples idiomas desde un equipo con CPU y NPU Intel.
- Prototipado de aplicaciones de IA generativa en desarrollo: los desarrolladores pueden usar este modelo para validar flujos de trabajo con OpenVINO GenAI antes de escalar a modelos más grandes, aprovechando la compatibilidad con el pipeline estándar.
- Inferencia de bajo consumo en dispositivos edge: la NPU de Intel ofrece un rendimiento energético superior al de una GPU dedicada, lo que hace viable desplegar el modelo en sistemas embebidos o kioscos interactivos que requieren respuestas en lenguaje natural.
- Educación e investigación en eficiencia de modelos: la exportación INT8 permite estudiar el impacto de la cuantización en la calidad de generación comparando con el modelo original en FP16, utilizando el mismo hardware.
- Automatización de tareas de procesamiento de lenguaje natural en español: al soportar español entre sus 18 idiomas, el modelo puede emplearse para clasificación de textos, extracción de información o generación de respuestas en aplicaciones de atención al cliente en entornos sin acceso a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona en el README que la compilación inicial en NPU puede tardar alrededor de un minuto, y que en procesadores Lunar Lake la GPU integrada suele ofrecer mayor velocidad de decodificación que la NPU, aunque la NPU es preferible para optimizar el consumo energético. No se proporcionan cifras concretas de latencia ni throughput.

## Requisitos de hardware

- NPU Intel AI Boost (Intel Core Ultra, serie 200V o superior) con driver 32.0.100.3104 o más reciente.
- OpenVINO / openvino-genai versión 2026.4 o superior (se recomienda la versión nightly hasta que se publique la versión estable).
- Alternativamente, puede ejecutarse en GPU Intel integrada o discreta, o en CPU, usando el mismo formato OpenVINO.
- Memoria RAM: al ser un modelo INT8 de 2.6B, ocupa aproximadamente 2.6 GB en memoria, más overhead del runtime. No requiere VRAM dedicada si se ejecuta en NPU o CPU.
- En NPU, la generación se limita a modo greedy (`do_sample=False`).
- Despliegue mediante `openvino_genai.LLMPipeline` o mediante Optimum-Intel (`OVModelForCausalLM`).
- La primera compilación en NPU tarda ~1 minuto; las cargas posteriores usan caché de driver.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Hardware objetivo | Licencia | Estado |
|---|---|---|---|---|---|
| mosesman/LFM2.5-2.6B-openvino-int8-npu | 2.6B | INT8 | Intel NPU / GPU / CPU | LFM 1.0 | Funcional en NPU con OpenVINO 2026.4 |
| mosesman/LFM2.5-2.6B-openvino-int4-npu | 2.6B | INT4 | Intel NPU | LFM 1.0 | Fallo en NPU (crash en `generate()`) |
| LiquidAI/LFM2.5-2.6B | 2.6B | FP16/FP32 | GPU/CPU | LFM 1.0 | Modelo original, sin optimización NPU |
| mosesman/LFM2-2.6B-openvino-int4-npu | 2.6B | INT4 | Intel NPU | LFM 1.0 | Funciona en NPU (modelo de la generación anterior) |

La comparativa muestra que esta exportación INT8 es la única variante de LFM2.5 que funciona en NPU, mientras que la versión INT4 presenta un fallo conocido. El modelo base sin cuantizar requiere más memoria y no aprovecha la NPU.

## Limitaciones y advertencias

- La generación en NPU está restringida a modo greedy; no es posible utilizar sampling, top-k ni otras estrategias de decodificación en este hardware.
- La primera compilación en NPU es lenta (~1 minuto), lo que puede afectar a la experiencia de usuario en aplicaciones que se inician con frecuencia.
- El autor advierte que en procesadores Lunar Lake la GPU integrada ofrece mayor rendimiento de decodificación que la NPU, por lo que la NPU solo es recomendable si se prioriza el consumo energético o se necesita liberar la GPU.
- La licencia LFM 1.0 de Liquid AI puede imponer restricciones de uso comercial; es necesario revisar los términos completos en https://www.liquid.ai/lfm-license antes de desplegar el modelo en producción.
- No se dispone de información sobre sesgos o riesgos de alucinación específicos de este modelo, pero al ser una conversión del modelo base, hereda sus posibles limitaciones.
- La dependencia de versiones nightly de OpenVINO puede generar inestabilidad hasta que se publique la versión estable 2026.4.
- No se han publicado benchmarks de calidad (MMLU, HumanEval, etc.) para esta conversión, por lo que no es posible comparar su rendimiento con otros modelos de forma objetiva.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mosesman/LFM2.5-2.6B-openvino-int8-npu
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Versión INT4 (fallida en NPU): https://huggingface.co/mosesman/LFM2.5-2.6B-openvino-int4-npu
- Versión INT4 de LFM2 (funcional): https://huggingface.co/mosesman/LFM2-2.6B-openvino-int4-npu
- Issue de GitHub sobre el fallo de NPU: https://github.com/openvinotoolkit/openvino/issues/37322
- Guía de conversión para GPU Intel: https://github.com/Diclean/lfm25-openvino-intel-gpu-guide/blob/main/README.md
- Licencia LFM 1.0: https://www.liquid.ai/lfm-license
- Notas de versión de OpenVINO 2026: https://docs.openvino.ai/2026/about-openvino/release-notes-openvino.html
