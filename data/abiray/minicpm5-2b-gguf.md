# Abiray/MiniCPM5-2B-GGUF

## Resumen

MiniCPM5-2B es un modelo de lenguaje denso de 2B parámetros desarrollado por OpenBMB, la segunda entrega de la serie MiniCPM5. Este repositorio ofrece sus pesos en formato GGUF cuantizado, obra del usuario Abiray, para facilitar su uso en despliegue local, edge AI e inferencia en el dispositivo mediante herramientas como llama.cpp, Ollama o LM Studio. El modelo destaca por su ventana de contexto de 128k tokens, soporte de tool calling y flujos de trabajo agénticos multi-paso, y se presenta como estado del arte entre los modelos de su clase, compitiendo incluso con arquitecturas de 4B. Su licencia Apache 2.0 permite el uso comercial sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso |
| Parametros totales | 2.516.756.480 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128k tokens |
| Tipos de cuantizacion | Q3_K_M, Q4_K_S, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

MiniCPM5-2B es un Transformer denso que escala la receta de entrenamiento de MiniCPM5-1B, manteniendo un diseño orientado a despliegue en dispositivos con recursos limitados. Los datos de entrenamiento proceden de los conjuntos de OpenBMB, incluyendo Ultra-FineWeb, UltraX-Preview, Ultra-FineWeb-L3, UltraData-Math, UltraData-Code, UltraData-SFT-2605, UltraData-SFT-Agent-2609 y UltraData-RL-2609. La presencia de conjuntos de SFT y RL sugiere un pipeline de optimización posterior al entrenamiento, aunque no se especifica si se empleó RLHF o DPO. El modelo soporta una ventana de contexto de 128k tokens, lo que permite procesar documentos extensos en una sola pasada. El informe técnico está disponible en arXiv con referencia 2506.07900.

## Capacidades

- Generación de texto y razonamiento en inglés y chino.
- Generación de código y resolución de problemas matemáticos, gracias a los datasets específicos de código y matemáticas.
- Comprensión de documentos largos con una ventana de contexto de 128k tokens.
- Soporte de tool calling y function calling para integración con APIs y herramientas externas.
- Capacidad para flujos agénticos multi-paso, encadenando razonamiento y acciones.
- Despliegue on-device y edge AI mediante pesos GGUF cuantizados.
- Compatibilidad con llama.cpp, Ollama y LM Studio.

## Casos de uso

- Asistente personal local en portátiles o mini PC: con la cuantización Q4_K_M (1.56 GB), el modelo puede ejecutarse en CPU o GPU modesta, ofreciendo respuestas sin conexión y con privacidad de datos.
- Generación de código en entornos de desarrollo con recursos limitados: su entrenamiento en UltraData-Code y su soporte de tool calling permiten integrarlo en editores como VS Code para autocompletar, explicar fragmentos o generar tests.
- Análisis de contratos o documentos extensos: la ventana de 128k tokens permite resumir informes largos, extraer cláusulas o responder preguntas sobre un corpus completo sin necesidad de dividir el texto.
- Agentes de automatización en servidores: el tool calling y el razonamiento multi-paso habilitan la construcción de agentes que consultan APIs, gestionan tareas o encadenan acciones de forma autónoma.
- Tutor de matemáticas o programación en aplicaciones educativas: su capacidad matemática y de código permite generar ejercicios, corregir respuestas y explicar razonamientos paso a paso.
- Edge AI en dispositivos embebidos o sistemas industriales: al ser un modelo 2B en formato GGUF, puede desplegarse en placas como NVIDIA Jetson o Raspberry Pi con aceleración, para tareas de clasificación de texto o asistencia en campo.
- Asistencia bilingüe chino-inglés: el modelo está entrenado en ambos idiomas, por lo que puede servir de traductor o asistente en aplicaciones de atención al cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor afirma que alcanza el estado del arte en su clase y que compite con modelos de 4B, pero no se aportan cifras concretas.

## Requisitos de hardware

- VRAM estimada: para la cuantización Q4_K_M (1.56 GB) se recomienda al menos 2 GB de VRAM o RAM; para Q8_0 (2.68 GB) se requieren unos 3 GB. Hay que añadir overhead de KV cache y activaciones según la longitud de contexto.
- GPU recomendadas: cualquier GPU moderna con 4 GB de VRAM, como NVIDIA RTX 3050 o RTX 3060, es suficiente para las cuantizaciones más pequeñas. Para uso intensivo con contexto completo, una RTX 4090 o A100 ofrece máxima velocidad.
- Cabe en consumer GPU: sí, las versiones Q3_K_M y Q4_K_S pueden ejecutarse incluso en GPU con 2-4 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio. Al ser pesos GGUF, la integración natural es con llama.cpp y sus derivados; no se menciona soporte nativo para vLLM o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos suficientes en la información proporcionada para una comparativa detallada con otros modelos. El autor indica que MiniCPM5-2B supera a MiniCPM5-1B y compite con modelos de 4B, pero no se aportan métricas. En cuanto a la familia, MiniCPM5-1B es el modelo anterior de la serie, con menos parámetros y presumiblemente menor capacidad de contexto.

## Limitaciones y advertencias

- Sesgos: no se documentan sesgos específicos en la información disponible.
- Riesgo de alucinación: inherente a los modelos de lenguaje, especialmente en tareas de razonamiento complejo o cuando se le pide información factual no presente en los datos de entrenamiento.
- Limitaciones de idioma: el modelo está entrenado principalmente en inglés y chino; el rendimiento en otros idiomas puede ser limitado o inconsistente.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero hay que revisar las condiciones del modelo base y de los datasets utilizados.
- Cuantización: al ser pesos GGUF, puede haber pérdida de precisión respecto al modelo original en BF16, especialmente en cuantizaciones Q3 y Q4.
- Repositorio no oficial: este repositorio es una conversión realizada por Abiray, no el repositorio oficial de OpenBMB. Se recomienda verificar la integridad de los pesos y usar el repositorio oficial si se requiere soporte.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Abiray/MiniCPM5-2B-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Repositorio oficial GGUF: https://huggingface.co/openbmb/MiniCPM5-2B-GGUF
- Informe técnico (arXiv): https://arxiv.org/pdf/2506.07900
- Repositorio GitHub: https://github.com/OpenBMB/MiniCPM
- Wiki de MiniCPM (chino): https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D
- Demo online: https://huggingface.co/spaces/openbmb/MiniCPM5-2B-Demo
