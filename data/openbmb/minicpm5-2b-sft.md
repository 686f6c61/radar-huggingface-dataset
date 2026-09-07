# openbmb/MiniCPM5-2B-SFT

## Resumen

MiniCPM5-2B-SFT es un modelo de lenguaje denso de aproximadamente 2.520 millones de parámetros, desarrollado por el equipo OpenBMB como segundo miembro de la serie MiniCPM5. Está diseñado específicamente para despliegue on-device, entornos locales y escenarios con recursos limitados, ofreciendo un equilibrio entre tamaño y capacidad. El modelo fue ajustado mediante supervisión (SFT) y entrenamiento por refuerzo (RL) sobre un conjunto de datos propios de OpenBMB, los UltraData y UltraX.

Su relevancia radica en que alcanza, según sus autores, el estado del arte en la clase de modelos de 2B de código abierto, manteniéndose competitivo frente a modelos de 4B en tareas generales y mostrando ventajas en codificación, matemáticas, comprensión de contexto largo, uso de herramientas y tareas agénticas. Todo ello con una arquitectura Transformer densa, sin mezcla de expertos, y una licencia Apache 2.0 que facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso |
| Parametros totales | 2.516.756.480 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (etiquetado como long-context) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MiniCPM5-2B-SFT es un Transformer denso que escala la misma receta de entrenamiento que su predecesor, MiniCPM5-1B. No emplea arquitectura de mezcla de expertos ni mecanismos híbridos como SSM. El entrenamiento se realizó sobre un conjunto de datos de la línea UltraData de OpenBMB, incluyendo Ultra-FineWeb, UltraX-Preview, Ultra-FineWeb-L3, UltraData-Math, UltraData-Code, UltraData-SFT-2605, UltraData-SFT-Agent-2609 y UltraData-RL-2609.

La fase de ajuste supervisado y el posterior entrenamiento por refuerzo están orientados a potenciar habilidades de seguimiento de instrucciones, razonamiento en código y matemáticas, comprensión de contextos extensos, llamada a herramientas y comportamiento agéntico. La información disponible no especifica detalles sobre decodificación especulativa, atención lineal ni otras innovaciones técnicas adicionales.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento de código, con capacidad para generar y explicar fragmentos de programación.
- Razonamiento matemático, resolviendo problemas paso a paso.
- Seguimiento de instrucciones en tareas generales.
- Comprensión de contexto largo, diseñada para manejar documentos extensos.
- Tool calling y function calling, integrable en flujos agénticos.
- Soporte de agentes con razonamiento multi-step.
- Optimizado para ejecución local y en dispositivos de borde (edge AI).

## Casos de uso

- Asistente personal local en dispositivos móviles o portátiles: el modelo puede ejecutarse sin conexión, atendiendo consultas de conocimiento general y manteniendo conversaciones fluidas en inglés y chino.
- Asistente de programación en entornos de desarrollo: gracias a su razonamiento de código, puede sugerir implementaciones, explicar algoritmos o revisar errores, integrándose en IDEs o pipelines de CI/CD.
- Tutor de matemáticas en aplicaciones educativas: su capacidad para razonar paso a paso permite desglosar problemas aritméticos y algebraicos para estudiantes.
- Agente con herramientas para automatización: el soporte de tool calling permite que el modelo orqueste llamadas a APIs, consulte bases de datos o ejecute acciones en sistemas empresariales.
- Resumen de documentos largos: la ventana de contexto extendida posibilita procesar informes técnicos, contratos o artículos extensos y generar resúmenes ejecutivos.
- Atención al cliente bilingüe: al dominar inglés y chino, puede desplegarse en chatbots de empresas con base de usuarios en ambos idiomas.
- Despliegue en dispositivos embebidos o routers inteligentes: el tamaño reducido y la etiqueta edge-ai lo hacen apto para hardware de bajo consumo, como pasarelas de IoT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card afirma que el modelo alcanza el estado del arte en la clase 2B de código abierto y que resulta competitivo con modelos de 4B, destacando en codificación, matemáticas, contexto largo, uso de herramientas y tareas agénticas. Sin embargo, no se incluyen cifras concretas como MMLU, HumanEval o GSM8K en el material de referencia.

## Requisitos de hardware

- VRAM estimada: los pesos en fp16 ocupan aproximadamente 5 GB (2.516.756.480 x 2 bytes). Una cuantización a 4 bits reduciría la ocupación a unos 1,5-2 GB, aunque no se ha confirmado su disponibilidad.
- GPU recomendadas: no especificadas por el fabricante. Por tamaño, una GPU de consumo con 8-12 GB, como una RTX 3060 12GB o superior, sería adecuada para inferencia con contexto largo.
- Opciones de despliegue: compatible con la librería Transformers y, dado el formato safetensors, puede servirse con vLLM o TGI. El soporte para llama.cpp requeriría una conversión previa a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa. El único modelo comparable identificado es MiniCPM5-1B, predecesor de la misma serie, con menos parámetros y la misma receta de entrenamiento. No obstante, no se conocen sus especificaciones exactas ni resultados de benchmarks en los datos proporcionados.

## Limitaciones y advertencias

- No se han publicado evaluaciones independientes sobre sesgos o alucinaciones; los modelos de este tamaño pueden producir contenido no verificado con mayor frecuencia que modelos más grandes.
- Soporte idiomático limitado a inglés y chino; el uso en otros idiomas no está respaldado oficialmente.
- La longitud de contexto se menciona como característica, pero no se especifica el número de tokens máximo en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero los desarrolladores deben revisar las condiciones de la licencia y las implicaciones de los datos de entrenamiento.
- El rendimiento en tareas de razonamiento complejo puede quedar por debajo de modelos de 4B o superiores, según la propia comparación cualitativa de los autores.
- El estado del arte declarado es una afirmación del fabricante, sin benchmarks numéricos que lo respalden en el material consultado.

## Enlaces

- HuggingFace: https://huggingface.co/openbmb/MiniCPM5-2B-SFT
- Repositorio GitHub: https://github.com/OpenBMB/MiniCPM
- Informe tecnico MiniCPM: https://arxiv.org/pdf/2506.07900
- Paper adicional: https://arxiv.org/abs/2602.09003
- Wiki MiniCPM (chino): https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D
- Proyecto UltraData: https://ultradata.openbmb.cn/
- Demo en linea: https://huggingface.co/spaces/openbmb/MiniCPM5-2B-Demo
