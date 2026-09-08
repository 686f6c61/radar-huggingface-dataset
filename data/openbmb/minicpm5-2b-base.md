# openbmb/MiniCPM5-2B-Base

## Resumen

MiniCPM5-2B-Base es un modelo de lenguaje denso de 2.500 millones de parámetros desarrollado por OpenBMB, la segunda iteración de la serie MiniCPM5 tras el MiniCPM5-1B. Está diseñado específicamente para despliegue on-device, ejecución local y escenarios con recursos limitados, lo que lo convierte en una opción relevante para aplicaciones de edge AI y entornos donde el coste computacional y la latencia son críticos. Según el autor, alcanza el estado del arte en su clase (2B) y compite con modelos de 4B en tareas de código, matemáticas, comprensión de contexto largo, uso de herramientas y tareas agénticas.

La arquitectura es un Transformer denso (sin mezcla de expertos) con soporte de contexto largo y tool calling, según los metadatos del modelo. Está entrenado con un conjunto de datasets propietarios de OpenBMB que cubren texto web, matemáticas, código y datos de supervisión y refuerzo. El modelo se distribuye bajo licencia Apache 2.0 y está disponible en formato Safetensors para la librería transformers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso |
| Parámetros totales | 2.516.756.480 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

MiniCPM5-2B-Base es un Transformer denso de 2.500 millones de parámetros, sin mezcla de expertos. No se especifica el número exacto de tokens de entrenamiento ni la composición detallada del dataset en la información disponible. Los datasets listados incluyen Ultra-FineWeb, UltraX-Preview, Ultra-FineWeb-L3, UltraData-Math, UltraData-Code, UltraData-SFT-2605, UltraData-SFT-Agent-2609 y UltraData-RL-2609. La presencia de UltraData-SFT y UltraData-RL sugiere que se aplicaron fases de supervisión y refuerzo durante el entrenamiento, aunque no se detalla si se empleó RLHF, DPO u otra técnica. El modelo incorpora capacidades de contexto largo y tool calling, según los metadatos, aunque no se describen innovaciones técnicas específicas en la documentación disponible.

## Capacidades

- Generación de texto en inglés y chino.
- Razonamiento de código y matemáticas, con ventajas sobre modelos de tamaño comparable según el autor.
- Comprensión de contexto largo, útil para procesar documentos extensos.
- Soporte de tool calling y function calling, según los metadatos.
- Capacidades agénticas y razonamiento multi-step, destacadas en la comparación con modelos de 4B.
- Seguimiento de instrucciones, aunque al ser un modelo base puede requerir fine-tuning adicional para tareas de instrucción.
- Despliegue on-device y en escenarios de edge AI, gracias a su tamaño compacto.

## Casos de uso

- Asistentes en dispositivos móviles o hardware de borde: el modelo puede ejecutarse localmente en smartphones o dispositivos embebidos para ofrecer asistencia conversacional en inglés y chino sin depender de la nube.
- Generación de código en entornos con recursos limitados: puede integrarse en IDEs o pipelines de CI/CD para autocompletado, corrección y generación de fragmentos de código, aprovechando su rendimiento en tareas de código.
- Automatización de agentes con tool calling: su soporte de tool calling permite conectarlo a APIs y funciones externas para construir flujos agénticos de automatización, como consultas a bases de datos o invocación de servicios.
- Análisis de documentos largos: gracias a su capacidad de contexto largo, puede procesar contratos, informes técnicos o logs extensos, extrayendo información relevante sin perder coherencia.
- Tutores de matemáticas: puede resolver problemas matemáticos paso a paso, lo que lo hace adecuado para aplicaciones educativas de bajo coste o en local.
- Traducción y soporte bilingüe: al estar entrenado en inglés y chino, puede utilizarse como base para sistemas de traducción o atención al cliente en esos idiomas, con despliegue local para garantizar privacidad de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model card afirma que el modelo alcanza el estado del arte en la clase de 2B y que compite con modelos de 4B, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otros conjuntos de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: basándonos en los 2.516.756.480 parámetros y un tamaño de repo de 5.0 GB, se estima que en precisión FP16 se necesitan aproximadamente 5 GB de VRAM. Con cuantización a 8 bits, unos 2.5 GB, y a 4 bits, unos 1.3 GB.
- GPU recomendadas: una RTX 3060 de 12 GB o superior es suficiente para FP16. Para cuantización de 4 bits, puede ejecutarse en GPUs de consumo con 4 GB de VRAM, como una RTX 3050 o RTX 2060.
- Sí cabe en GPU de consumo, especialmente con cuantización.
- Opciones de despliegue: no se especifican en la documentación. Al ser un modelo de la librería transformers, puede cargarse con HuggingFace Transformers. Los metadatos incluyen los tags `text-generation-inference` y `endpoints_compatible`, lo que sugiere compatibilidad con servicios de inferencia como TGI, aunque no se confirma en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa numérica detallada. El model card indica que el modelo compite con modelos de 4B en varias capacidades, pero no se especifican nombres de modelos ni cifras de rendimiento. Tampoco se ofrecen especificaciones completas de otros modelos de la misma familia, como MiniCPM5-1B, en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se dispone de información.
- Riesgo de alucinación: no se dispone de información específica.
- Limitaciones de idioma: solo soporta inglés y chino; no se mencionan otros idiomas.
- Longitud de contexto: el valor exacto no se ha publicado, aunque el modelo se etiqueta como de contexto largo.
- Al ser un modelo base, puede requerir fine-tuning de instrucciones para aplicaciones de chat o seguimiento de instrucciones robusto, a pesar de que el model card destaca capacidades de instruction following.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero es necesario verificar las licencias de los datasets de entrenamiento, que no se detallan en la información disponible.

## Enlaces

- HuggingFace: https://huggingface.co/openbmb/MiniCPM5-2B-Base
- GitHub: https://github.com/OpenBMB/MiniCPM
- MiniCPM Tech Report: https://arxiv.org/pdf/2506.07900
- Arxiv 2602.09003: https://arxiv.org/abs/2602.09003
- Wiki (chino): https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D
- UltraData: https://ultradata.openbmb.cn/
- Demo online: https://huggingface.co/spaces/openbmb/MiniCPM5-2B-Demo
- README en chino: https://huggingface.co/openbmb/MiniCPM5-2B/blob/main/README-cn.md
