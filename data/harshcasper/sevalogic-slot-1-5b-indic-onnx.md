# harshcasper/sevalogic-slot-1.5b-indic-onnx

## Resumen

SevaLogic Slot 1.5B Indic (ONNX) es una exportación a formato ONNX del modelo `harshcasper/sevalogic-slot-1.5b-indic`, un ajuste fino de Qwen/Qwen2.5-1.5B-Instruct orientado a la extracción de "slots" (ranuras de información estructurada) en conversaciones, con atención especial al contexto lingüístico indio. El modelo lo publica el usuario de Hugging Face `harshcasper` bajo licencia Apache 2.0 y está empaquetado específicamente para su ejecución en el navegador mediante `transformers.js` y `onnxruntime-web` con aceleración WebGPU.

La relevancia de esta ficha radica en su formato de distribución: no se trata de un modelo nuevo entrenado desde cero, sino de una conversión cuantizada a int4 (q4f16) pensada para inferencia cliente-side, sin servidor. Esto permite desplegar un modelo de 1.500 millones de parámetros en entornos web con requisitos de memoria muy reducidos, a costa de una pérdida de precisión derivada de la cuantización y de las limitaciones propias de la inferencia en navegador.

El repositorio ocupa 1,3 GB y contiene el grafo ONNX, el tokenizador, la configuración y los ajustes de generación. No se han publicado resultados de benchmarks ni detalles sobre el dataset de ajuste fino en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.500 millones (1.5B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-1.5B-Instruct, sin confirmar en esta exportación) |
| Tipos de cuantizacion | q4f16: pesos MatMulNBits int4 (bloque 32, simétrico) con activaciones fp16 |
| Idiomas soportados | no disponible (el nombre sugiere orientación a lenguas indias, sin confirmar) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`onnx/model_q4f16.onnx`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only denso con atención causal estándar, normalización RMSNorm y activaciones SwiGLU, entrenado originalmente por Alibaba Qwen. Sobre esa base, el autor ha realizado un ajuste fino (cuyos detalles de dataset, número de tokens y metodología no se documentan en la información disponible) para una tarea de extracción de slots, presumiblemente en el ámbito de asistentes conversacionales multilingües con foco en lenguas de la India.

La innovación técnica de esta publicación no está en el entrenamiento sino en el pipeline de exportación: el script `pipeline/scripts/export_browser_onnx.py` del repositorio SevaLogic convierte los pesos safetensors a un grafo ONNX cuantizado en int4 con bloque de 32 y simetría, manteniendo activaciones en fp16. El autor indica que la generación se validó sobre los safetensors originales antes de la exportación. No se documentan técnicas como decodificación especulativa, atención lineal ni mezcla de expertos.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del ajuste instructivo de Qwen2.5-1.5B-Instruct.
- Extracción de slots o ranuras de información estructurada a partir de diálogo (presunta tarea principal del ajuste fino, no documentada en detalle).
- Ejecución en navegador mediante `transformers.js` y `onnxruntime-web`, con soporte de WebGPU.
- Capacidades multilingües: el nombre del modelo sugiere orientación a lenguas indias, pero no se especifica la lista de idiomas soportados.
- No se documenta soporte explícito de tool calling, function calling, agentes o modos de razonamiento extendido (thinking).

## Casos de uso

- Asistentes conversacionales en el navegador: el modelo puede ejecutarse íntegramente en el cliente mediante WebGPU, sin enviar datos del usuario a un servidor, lo que resulta adecuado para aplicaciones de privacidad sensible.
- Extracción de entidades y slots en formularios conversacionales: dado su ajuste específico, encaja en flujos donde el usuario describe una intención en lenguaje natural y el sistema debe rellenar campos estructurados (fecha, servicio, ubicación).
- Prototipado rápido de demos web: al distribuirse como ONNX listo para `transformers.js`, permite integrar generación de texto en una página estática sin infraestructura de backend.
- Aplicaciones offline o de baja conectividad: una vez descargado el modelo (1,3 GB), la inferencia no requiere red, útil en escenarios de campo o entornos restringidos.
- Filtrado y clasificación ligera de mensajes: con 1.5B parámetros y cuantización int4, puede emplearse para tareas de etiquetado o reescritura en tiempo real dentro de una interfaz web.
- Educación y experimentación: sirve como ejemplo reproducible de exportación de un modelo Qwen2 a ONNX q4f16 para quienes quieran replicar el pipeline en sus propios ajustes finos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 1,3 GB en disco; en ejecución con q4f16 se espera un consumo de memoria en el rango de 1,5 a 2,5 GB, aunque no se documenta una cifra oficial.
- GPU recomendadas: cualquier GPU con soporte WebGPU en navegador (por ejemplo, integradas recientes de Intel, AMD o Apple Silicon); en servidor, GPUs con al menos 4 GB de VRAM.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 4 GB o más de VRAM; también en equipos sin GPU dedicada mediante WebGPU o CPU, con latencia mayor.
- Opciones de despliegue: `transformers.js` con `onnxruntime-web` y WebGPU; también puede ejecutarse con `onnxruntime` en servidor, aunque el autor no lo documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Ejecucion en navegador |
|---|---|---|---|---|---|
| SevaLogic Slot 1.5B Indic ONNX | 1.5B | no disponible | ONNX q4f16 | Apache 2.0 | Sí (WebGPU) |
| Qwen/Qwen2.5-1.5B-Instruct | 1.5B | 32.768 tokens (según model card oficial de Qwen) | safetensors | Apache 2.0 | No de forma nativa |
| SmolLM2-1.7B-Instruct | 1.7B | 8.192 tokens (según model card oficial) | safetensors, GGUF | Apache 2.0 | Parcial (vía exportaciones de la comunidad) |

La comparación directa con Qwen2.5-1.5B-Instruct es la más pertinente, ya que el modelo aquí descrito es un ajuste fino del mismo. Frente a él, la ventaja es la disponibilidad en ONNX para navegador y la especialización en extracción de slots; la desventaja es la cuantización int4 y la falta de documentación sobre el ajuste.

## Limitaciones y advertencias

- No se documentan sesgos conocidos, pero al derivar de Qwen2.5-1.5B-Instruct hereda los sesgos de su corpus original, no auditados en esta exportación.
- Riesgo de alucinación inherente a un modelo de 1.5B parámetros, agravado por la cuantización int4.
- La lista de idiomas soportados no está disponible; el nombre sugiere lenguas indias, pero no se confirma ni se detalla.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni documentación sobre el dataset de ajuste fino, lo que complica evaluar riesgos legales o de calidad en producción.
- El modelo está empaquetado para inferencia en navegador; su uso en servidor con otras herramientas (vLLM, TGI) no está documentado y podría requerir conversiones adicionales.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, sin evidencia de validación por parte de la comunidad.
- No se especifica la longitud de contexto efectiva de esta exportación ONNX, lo que impide garantizar el comportamiento en conversaciones largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/harshcasper/sevalogic-slot-1.5b-indic-onnx
- Modelo base del ajuste fino: https://huggingface.co/harshcasper/sevalogic-slot-1.5b-indic
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio SevaLogic (referenciado en la model card, sin URL directa): script `pipeline/scripts/export_browser_onnx.py`
- `transformers.js`: https://github.com/huggingface/transformers.js
- `onnxruntime-web`: https://onnxruntime.ai/docs/tutorials/web/
