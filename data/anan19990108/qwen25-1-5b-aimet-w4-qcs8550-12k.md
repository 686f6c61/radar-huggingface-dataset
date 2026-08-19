# anan19990108/qwen25-1.5b-aimet-w4-qcs8550-12k

## Resumen

Este repositorio documenta una receta de exportación y cuantización para el modelo Qwen2.5-1.5B-Instruct, orientada a su despliegue en hardware Qualcomm QCS8550 mediante el flujo AIMET W4 (pesos de 4 bits) y una ventana de contexto de 12 288 tokens. El autor, Andrew Chiao (usuario anan19990108), publica el flujo de trabajo reproducible, los scripts de preparación, los parches de compatibilidad y los informes de estado, pero no incluye pesos cuantizados ni artefactos ejecutables.

Se trata de una release "solo receta" (recipe-only): el repositorio no contiene tensores ONNX, encodings AIMET, binarios QAIRT ni bundles Genie. Por tanto, no puede utilizarse directamente para inferencia. Su relevancia radica en servir como referencia técnica para equipos que necesiten reproducir una cuantización W4 de Qwen2.5 en entornos Qualcomm, especialmente en el ámbito de la IA en el borde (edge AI).

El modelo base es Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1 500 millones de parámetros desarrollado por Alibaba Cloud, con licencia Apache-2.0. La receta se encuentra en estado "work-in-progress" y documenta explícitamente que no debe contarse como un artefacto de modelo cuantizado descargable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 1,5 mil millones (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 12 288 tokens (objetivo de la receta) |
| Tipos de cuantizacion | W4 (pesos de 4 bits) mediante AIMET |
| Idiomas soportados | No disponible (depende del modelo base; no se especifica en la receta) |
| Licencia | Apache-2.0 |
| Formato de pesos | No aplica (receta sin pesos; formato intermedio: ONNX external data + AIMET encodings, no publicados) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-1.5B-Instruct, un transformer causal con arquitectura estándar de decoder-only, entrenado por Alibaba Cloud con un enfoque de instrucciones y ajuste fino supervisado. La receta aquí documentada no modifica la arquitectura original: aplica una cuantización de pesos a 4 bits (W4) utilizando el toolkit AIMET de Qualcomm, que reduce la huella de memoria y la carga computacional para su ejecución en el chipset QCS8550.

El flujo de exportación genera un modelo ONNX con datos externos y archivos de encodings AIMET, que posteriormente se compilan mediante Qualcomm AI Hub Workbench hacia el runtime Genie/QAIRT. No se proporcionan detalles sobre el dataset de entrenamiento original ni sobre técnicas como RLHF o DPO, ya que no forman parte de esta receta.

## Capacidades

- Generación de texto y respuesta a instrucciones: hereda las capacidades del modelo base Qwen2.5-1.5B-Instruct.
- Soporte de tool calling / function calling: el modelo base lo soporta, pero esta receta no incluye un artefacto ejecutable para verificarlo.
- Capacidades multilingües: el modelo base es multilingüe, aunque la receta no especifica qué idiomas quedan cubiertos tras la cuantización.
- Cuantización W4: permite reducir el tamaño del modelo para despliegue en dispositivos con recursos limitados.
- Reproducibilidad: la receta documenta scripts y pasos para reproducir el flujo de exportación y compilación.
- No incluye capacidades de visión ni audio; es exclusivamente texto.

## Casos de uso

- Desarrollo de aplicaciones de IA en el borde: equipos que trabajen con Qualcomm QCS8550 pueden usar esta receta como plantilla para cuantizar y exportar modelos Qwen2.5 a formatos ejecutables en dispositivos móviles o IoT.
- Prototipado de modelos cuantizados: sirve como referencia para evaluar el impacto de la cuantización W4 en la calidad de generación antes de comprometerse con un despliegue completo.
- Integración en pipelines de compilación para Qualcomm AI Hub: el flujo documentado permite integrar la exportación ONNX y la compilación QAIRT en un proceso CI/CD.
- Investigación sobre eficiencia de modelos: investigadores pueden estudiar la viabilidad de ejecutar LLMs de 1.5B en hardware de gama media-alta de Qualcomm.
- Evaluación de compatibilidad de contextos largos: la validación de 12 288 tokens permite probar si el modelo base mantiene coherencia en diálogos extensos tras la cuantización.
- Formación y documentación técnica: el repositorio incluye informes de estado y bloqueos que pueden servir como material didáctico para entender los desafíos de la cuantización en edge AI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La receta no incluye métricas de calidad (MMLU, HumanEval, GSM8K) ni mediciones de latencia o throughput.

## Requisitos de hardware

- Chipset objetivo: Qualcomm QCS8550 (plataforma móvil de gama alta).
- Entorno de desarrollo: WSL (Windows Subsystem for Linux) con scripts de preparación incluidos.
- Herramientas necesarias: Qualcomm AI Hub Workbench, AIMET, ONNX runtime y herramientas de compilación QAIRT/Genie.
- VRAM: no aplica, ya que el despliegue se realiza en la NPU/GPU del QCS8550, no en una GPU de servidor.
- Opciones de despliegue: Genie / QAIRT, mediante Qualcomm AI Hub.
- No se dispone de datos de latencia ni throughput estimados.

## Comparativa con modelos similares

No disponible. No se proporcionan comparaciones con otras cuantizaciones de Qwen2.5 ni con modelos alternativos en la información disponible. El repositorio se centra únicamente en el flujo de exportación para QCS8550.

## Limitaciones y advertencias

- El repositorio no contiene pesos cuantizados ni artefactos ejecutables; es únicamente una receta de exportación.
- El estado es "work-in-progress": los logs indican que algunos artefactos grandes estaban aún subiendo o compilando en el momento de la documentación.
- No se incluyen librerías de runtime de Qualcomm ni material del SDK; la redistribución de artefactos compilados está sujeta a los términos de Qwen, Qualcomm AI Hub, QAIRT, QNN y Genie.
- La cuantización W4 puede degradar la calidad de generación en comparación con el modelo en precisión completa; no se aportan métricas que cuantifiquen esta pérdida.
- No se especifican los idiomas soportados tras la cuantización; se asume que hereda los del modelo base, pero no está verificado.
- El modelo base puede presentar sesgos o alucinaciones inherentes a su entrenamiento; esta receta no añade ninguna mitigación adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/anan19990108/qwen25-1.5b-aimet-w4-qcs8550-12k
- AIMET (GitHub de Qualcomm): https://github.com/Qualcomm/aimet
- AIMET (documentación oficial): https://quic.github.io/aimet-pages/releases/latest/index.html
- Repositorio oficial de Qwen: https://github.com/QwenLM/Qwen
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
