# SC117/Qwen3.8-27B-Uncensored-FIT-GGUF

## Resumen

Este repositorio contiene una colección de cuantizaciones GGUF del modelo Qwen3.8-27B-Uncensored, una versión "abliterada" (sin censura) del Qwen3.8-27B desarrollado por el equipo Qwen de Alibaba. El autor, SC117, ha utilizado la herramienta open source FIT-GGUF para generar 14 niveles de cuantización de tamaño continuo que van desde 7 hasta 13,5 GiB, con verificación de tamaño exacto y eliminación de la cabeza MTP (Multi-Token Prediction). El modelo base es un transformer denso multimodal de aproximadamente 26,9 mil millones de parámetros, con soporte de visión, contexto de 262.000 tokens y licencia Apache-2.0.

La relevancia de este modelo radica en que permite ejecutar un LLM de 27B con capacidades multimodales en hardware de consumo, gracias a las cuantizaciones ajustadas a presupuestos de memoria específicos. Además, la variante "uncensored" (obtenida mediante abliteration) es de interés para la investigación en seguridad de IA y el estudio de comportamientos sin rechazo. El repositorio incluye también un archivo mmproj en BF16 para el componente de visión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision + texto), basado en Qwen3.8-27B |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.000 tokens |
| Tipos de cuantizacion | 14 niveles GGUF de tamano continuo (7–13,5 GiB) generados con FIT-GGUF; incluye mmproj en BF16 |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache-2.0 (con restriccion de uso solo para investigacion segun el blog del autor del modelo base) |
| Formato de pesos | GGUF (el modelo base original esta disponible en safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso multimodal desarrollado por Alibaba, que integra un encoder de vision para procesar imagenes junto con texto. Segun el repositorio oficial de Alibaba, el modelo destaca en tareas de codificacion, flujos de trabajo agente y automatizacion de oficina. No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens procesados o el uso de tecnicas como RLHF o DPO en la informacion proporcionada.

La version "Uncensored" fue creada por orcarouter mediante una tecnica de abliteration, que elimina las direcciones de rechazo aprendidas durante el entrenamiento, reduciendo la tendencia del modelo a negarse a responder ciertas solicitudes. Posteriormente, SC117 aplico FIT-GGUF, una capa de planificacion a nivel de tensor sobre los presets de cuantizacion de llama.cpp. FIT-GGUF parte del preset mas grande que cabe en el presupuesto de bytes solicitado y asigna los bytes restantes a mejoras de precision en tensores especificos, de forma determinista. En esta cuantizacion se ha eliminado la cabeza MTP, lo que reduce el tamano pero elimina la capacidad de prediccion multi-token.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es capaz de mantener conversaciones complejas y realizar tareas de razonamiento logico.
- Generacion de codigo: segun el repositorio de Alibaba, Qwen3.8-27B destaca en tareas de programacion.
- Vision: el repositorio incluye un archivo mmproj en BF16 que permite procesar imagenes junto con texto (multimodal).
- Flujos de trabajo agente: el modelo base esta optimizado para tareas agente y automatizacion de oficina.
- Multilingue: soporta ingles y chino.
- Contexto largo: ventana de 262.000 tokens, adecuada para documentos extensos o conversaciones multi-turno.
- Sin censura: la version abliterada reduce los rechazos, lo que permite explorar respuestas que el modelo original podria negarse a dar.

## Casos de uso

- Generacion de codigo en local: con cuantizaciones de 7–13,5 GiB, el modelo puede ejecutarse en GPUs de consumo (8–16 GB de VRAM) para asistencia de programacion sin conexion.
- Automatizacion de oficina: el modelo base esta disenado para tareas como redaccion de documentos, resumen de correos o generacion de informes, aprovechando su contexto largo.
- Analisis de documentos con vision: gracias al mmproj, puede procesar capturas de pantalla, diagramas o documentos escaneados y extraer informacion relevante.
- Investigacion en seguridad de IA: la variante uncensored permite estudiar comportamientos del modelo sin rechazo, util para evaluar riesgos y sesgos.
- Desarrollo de agentes conversacionales: con 262K de contexto, puede mantener conversaciones prolongadas y gestionar multiples turnos con memoria amplia.
- Prototipado rapido en entornos aislados: al ser un GGUF, se puede desplegar con llama.cpp u Ollama en maquinas sin acceso a la nube, ideal para pruebas internas.
- Asistente bilingue ingles-chino: util para aplicaciones que requieran soporte en ambos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de rendimiento, y el blog de orcarouter tampoco proporciona datos cuantitativos. Se recomienda consultar el repositorio original de Qwen3.8-27B para posibles evaluaciones del modelo base.

## Requisitos de hardware

- VRAM estimada: los archivos GGUF ocupan entre 7 y 13,5 GiB. Para el nivel mas pequeno se recomienda al menos 8 GB de VRAM; para el mas grande, 16 GB o mas.
- GPUs recomendadas: RTX 3060 12GB, RTX 4070, RTX 4080, A10, A100 (para los niveles superiores).
- Compatibilidad con GPU de consumo: si, los niveles de 7–10 GiB caben en tarjetas de 12 GB; los de 13,5 GiB requieren 16 GB.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. vLLM puede requerir conversion adicional.
- Latencia y throughput: no disponible en la informacion proporcionada; dependera del hardware y del nivel de cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 26,9B | 262K | Apache-2.0 | safetensors | Modelo base multimodal con censura estandar |
| Qwen3.8-27B-Uncensored | 26,9B | 262K | Apache-2.0 (research-only) | safetensors | Version abliterada sin rechazos |
| SC117/Qwen3.8-27B-Uncensored-FIT-GGUF | 26,9B | 262K | Apache-2.0 (research-only) | GGUF | Cuantizaciones de 7–13,5 GiB con FIT-GGUF |

No se dispone de datos de rendimiento comparativo con otros modelos de tamano similar (por ejemplo, Qwen2.5-32B) en la informacion proporcionada.

## Limitaciones y advertencias

- Restriccion de uso: aunque la licencia declarada es Apache-2.0, el blog de orcarouter indica que el modelo base esta limitado a uso exclusivo de investigacion ("research-only"). Verificar antes de usar en produccion.
- Idiomas limitados: solo ingles y chino; el rendimiento en otros idiomas puede ser deficiente.
- Degradacion por cuantizacion: los niveles mas bajos (7 GiB) pueden presentar perdidas de precision notables en tareas complejas.
- Abliteration: la eliminacion de rechazos puede reducir la calidad de las respuestas en temas sensibles y aumentar el riesgo de generar contenido inapropiado.
- Alucinaciones: como cualquier LLM, puede producir informacion falsa o inventada, especialmente en contextos largos.
- Vision limitada: el componente de vision requiere el archivo mmproj y puede no ser tan robusto como modelos dedicados.
- Sin soporte de tool calling confirmado: no se ha verificado si el modelo cuantizado mantiene las capacidades de llamada a funciones del modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SC117/Qwen3.8-27B-Uncensored-FIT-GGUF
- Herramienta FIT-GGUF (GitHub): https://github.com/Scorp1o117/FIT-GGUF
- Blog de orcarouter sobre Qwen3.8-27B-Uncensored: https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Blog de orcarouter sobre la version GGUF: https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
- Repositorio oficial de Qwen3.8-27B (Alibaba): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
