# openbmb/MiniCPM5-2B-MLX

## Resumen

MiniCPM5-2B-MLX es una variante optimizada para Apple Silicon del modelo MiniCPM5-2B, desarrollado por OpenBMB. Se trata de un Transformer denso de aproximadamente 2.520 millones de parámetros (2,52B), diseñado específicamente para escenarios de despliegue local, dispositivos edge y entornos con recursos limitados. El modelo fue lanzado el 7 de septiembre de 2026 bajo licencia Apache 2.0 y se posiciona como el segundo miembro de la serie MiniCPM5, tras el MiniCPM5-1B.

A pesar de su tamaño compacto, MiniCPM5-2B alcanza el estado del arte en la clase de modelos open-source de 2B, siendo competitivo con modelos de 4B en tareas generales y mostrando ventajas en codificación, matemáticas, comprensión de contexto largo, uso de herramientas y tareas agénticas. Su ventana de contexto de 131.072 tokens y su soporte de tool calling lo hacen especialmente relevante para aplicaciones de agentes y asistentes conversacionales que necesitan operar en dispositivos sin GPU de centro de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura tipo Llama) |
| Parametros totales | 2.516.756.480 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | 4-bit MLX |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

MiniCPM5-2B es un Transformer denso, sin mezcla de expertos (MoE), que sigue una arquitectura tipo Llama. Según OpenBMB, el modelo escala la misma receta de entrenamiento utilizada en MiniCPM5-1B, manteniendo un diseño orientado a la eficiencia para su ejecución en dispositivos locales. De los 2.520 millones de parámetros, aproximadamente 1.980 millones se encuentran fuera de los embeddings, lo que indica un uso intensivo de capas de atención y feed-forward en el cuerpo del modelo.

El entrenamiento se realizó sobre un conjunto de datasets de la familia UltraData, que incluye Ultra-FineWeb, UltraX-Preview, Ultra-FineWeb-L3, UltraData-Math, UltraData-Code, UltraData-SFT-2605, UltraData-SFT-Agent-2609 y UltraData-RL-2609. Esta composición sugiere un pipeline de preentrenamiento seguido de ajuste supervisado (SFT) y optimización por refuerzo (RL), probablemente con técnicas como RLHF o DPO. El número exacto de tokens de entrenamiento no está disponible en la información proporcionada. El informe técnico del modelo se encuentra disponible en arXiv (2506.07900).

## Capacidades

- Generación de texto conversacional en inglés y chino, con especial atención a la naturalidad y coherencia en diálogos multi-turno.
- Razonamiento matemático y codificación, donde el modelo muestra ventajas frente a otros modelos de tamaño similar según la model card.
- Comprensión de contexto largo, con una ventana de 131.072 tokens, lo que permite procesar documentos extensos o historiales de conversación largos.
- Soporte de tool calling y function calling, habilitando la integración con herramientas externas y APIs.
- Capacidades agénticas, incluyendo razonamiento multi-paso y planificación de acciones, gracias a los datasets de entrenamiento específicos para agentes (UltraData-SFT-Agent-2609).
- Despliegue eficiente en dispositivos edge, móviles y portátiles, gracias a su tamaño reducido y a la cuantización 4-bit MLX.

## Casos de uso

- Asistentes conversacionales en dispositivos móviles: el modelo puede ejecutarse localmente en teléfonos y tabletas gracias a su tamaño de 2,5B y cuantización 4-bit, ofreciendo respuestas en inglés y chino sin necesidad de conexión a internet.
- Generación de código en entornos de desarrollo locales: con soporte de tool calling y ventaja en codificación, puede integrarse en editores o IDEs para autocompletar, generar funciones o explicar fragmentos de código, manteniendo los datos en el equipo del usuario.
- Agentes autónomos con uso de herramientas: su entrenamiento en datasets de agentes y su capacidad de tool calling permiten construir agentes que consultan APIs, ejecutan comandos o realizan razonamiento multi-paso en sistemas embebidos.
- Análisis de documentos largos: la ventana de contexto de 131.072 tokens posibilita resumir contratos, informes técnicos o bases documentales extensas en inglés o chino, sin necesidad de dividir el contenido en fragmentos.
- Educación y tutoría en matemáticas: el modelo muestra un rendimiento destacado en razonamiento matemático, lo que lo hace adecuado para aplicaciones de tutoría interactiva, resolución de problemas paso a paso o generación de ejercicios.
- Traducción y asistencia bilingüe entre inglés y chino: al estar entrenado con ambos idiomas, puede actuar como traductor contextual o asistente en comunicaciones interculturales, manteniendo el tono y la intención del texto original.
- Despliegue en portátiles sin GPU dedicada: gracias a la variante MLX optimizada para Apple Silicon, puede ejecutarse en MacBooks con chips M1/M2/M3/M4, ofreciendo una alternativa local a servicios cloud para tareas de generación de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card afirma que MiniCPM5-2B alcanza el estado del arte en la clase de modelos open-source de 2B y que resulta competitivo con modelos de 4B en tareas generales, destacando en codificación, matemáticas, contexto largo, uso de herramientas y tareas agénticas. Según una fuente externa, Artificial Analysis lo clasifica como el modelo open-weight de menos de 4B con mejor puntuación en su Intelligence Index v4.2, pero no se proporcionan los valores concretos. Por tanto, no es posible presentar una tabla de resultados sin inventar cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-3 GB en cuantización 4-bit, basado en el tamaño del repositorio de 1,4 GB. En precisión completa (FP16) se requeriría alrededor de 5 GB.
- GPU recomendadas: la variante MLX está optimizada para Apple Silicon (chips M1, M2, M3 y M4). En sistemas NVIDIA, el modelo puede ejecutarse mediante transformers, pero no se garantiza el mismo rendimiento que en Apple Silicon.
- Compatibilidad con GPU de consumo: el modelo puede ejecutarse en GPUs de consumo con 4 GB o más de VRAM, como RTX 3050, RTX 4060 o equivalentes, siempre que se utilice cuantización.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI y transformers. El modelo es compatible con text-generation-inference y endpoints.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos suficientes en la información proporcionada para realizar una comparativa detallada con alternativas concretas. La model card menciona que MiniCPM5-2B supera a otros modelos open-source de tamaño similar y compite con modelos de 4B, pero no se aportan nombres ni resultados numéricos. El modelo hermano MiniCPM5-1B existe, pero sus especificaciones no están disponibles en la información facilitada. Por tanto, la comparativa se limita a la siguiente nota: el modelo se posiciona como SOTA en su clase según OpenBMB, sin datos verificables de rendimiento frente a otras opciones.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha publicado información sobre sesgos específicos del modelo en la documentación disponible.
- Riesgo de alucinación: al ser un modelo compacto de 2,5B, la probabilidad de generar contenido factualmente incorrecto o inventado es mayor que en modelos de mayor tamaño. Se recomienda validar las respuestas en aplicaciones críticas.
- Limitaciones de idioma: el modelo solo soporta inglés y chino, por lo que su uso en otros idiomas requiere traducción previa o posterior.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantengan los avisos de copyright y licencia.
- Limitaciones de la variante MLX: los pesos en formato MLX están optimizados para Apple Silicon. Para ejecutar el modelo en otros entornos (NVIDIA, AMD, CPU x86), es necesario convertir los pesos a un formato compatible, lo que puede requerir herramientas adicionales.
- Limitaciones de contexto: aunque la ventana de 131.072 tokens es amplia, el modelo puede degradar su rendimiento en tareas que requieran razonamiento muy complejo sobre contextos extremadamente largos, especialmente en comparación con modelos de mayor tamaño.

## Enlaces

- HuggingFace: https://huggingface.co/openbmb/MiniCPM5-2B-MLX
- Modelo base MiniCPM5-2B: https://huggingface.co/openbmb/MiniCPM5-2B
- Modelo hermano MiniCPM5-1B: https://huggingface.co/openbmb/MiniCPM5-1B
- Informe técnico MiniCPM (arXiv): https://arxiv.org/pdf/2506.07900
- Repositorio GitHub: https://github.com/OpenBMB/MiniCPM
- Wiki de MiniCPM (chino): https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D
- Conjunto de datos UltraData: https://ultradata.openbmb.cn/
- Demo online: https://huggingface.co/spaces/openbmb/MiniCPM5-2B-Demo
