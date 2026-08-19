# ben0112/Qwen3.8-27B-oQ2e-mtp

## Resumen

Este repositorio contiene una cuantización mixta de precisión de 2 bits del modelo Qwen3.8-27B, realizada con la herramienta oQ (parte del ecosistema oMLX, versión 0.5.7). El autor, ben0112, ha publicado los pesos en formato MLX safetensors, lo que indica que está orientado a su ejecución en hardware Apple Silicon mediante el framework MLX. El modelo base pertenece a la familia Qwen3.5 (según la etiqueta `qwen3_5`), aunque no se dispone de información oficial sobre su arquitectura, entrenamiento o licencia.

La relevancia de esta publicación radica en la cuantización agresiva a 2 bits con grupo de tamaño 64, que reduce drásticamente el requisito de memoria y permite ejecutar un modelo de gran tamaño en dispositivos con recursos limitados. Sin embargo, hay una discrepancia notable: los safetensors reportan 3.592.172.272 parámetros (≈3,59 mil millones), mientras que el nombre del modelo sugiere 27 mil millones. Esta inconsistencia no está aclarada en la documentación proporcionada, por lo que los datos técnicos deben interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (familia Qwen3.5) |
| Parametros totales | 3.592.172.272 (según safetensors; el nombre indica 27B, discrepancia sin aclarar) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2 bits, group size 64, cuantización mixta (oQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base. La etiqueta `qwen3_5` sugiere que pertenece a la serie Qwen3.5, que presumiblemente sigue una arquitectura transformer con atención estándar o variantes recientes, pero no se confirma ningún detalle. El proceso de cuantización se realizó con oQ (oMLX v0.5.7), que aplica cuantización de precisión mixta, asignando diferentes bits a distintas capas para optimizar la relación calidad-tamaño. No se proporcionan datos sobre el entrenamiento original (tokens, dataset, métodos de alineación como RLHF o DPO) ni sobre innovaciones técnicas adicionales.

## Capacidades

- No se dispone de información específica sobre las capacidades del modelo cuantizado.
- Al ser un modelo de lenguaje basado en Qwen3.5, se espera que pueda realizar tareas de generación de texto, razonamiento, codificación y matemáticas, pero no hay confirmación.
- No se menciona soporte para tool calling, agentes, visión, audio u otras modalidades.
- El multilingüismo no está documentado.

## Casos de uso

- Inferencia en dispositivos Apple Silicon: al estar en formato MLX, el modelo puede ejecutarse en Mac con chip M1/M2/M3/M4 usando la librería MLX, aprovechando la memoria unificada. La cuantización a 2 bits permite cargar un modelo de tamaño considerable en equipos con 8-16 GB de RAM.
- Prototipado rápido en entornos con recursos limitados: desarrolladores que necesitan probar un modelo de la familia Qwen3.5 sin acceso a GPUs de gama alta pueden usar esta versión cuantizada para experimentos de baja fidelidad.
- Evaluación de calidad de cuantización: investigadores interesados en estudiar el impacto de la cuantización de 2 bits en modelos grandes pueden comparar esta versión con el modelo original (si existe) para medir degradación.
- Despliegue en edge computing: en dispositivos con restricciones de memoria, como routers o sistemas embebidos con soporte MLX, este modelo podría ejecutarse para tareas simples de generación de texto.
- Generación de texto en local sin conexión: usuarios que deseen un modelo de lenguaje local en su Mac, priorizando la ocupación de memoria sobre la calidad de salida.
- Fine-tuning adaptativo: aunque no se indica, los pesos cuantizados podrían servir como punto de partida para técnicas de ajuste con cuantización consciente (QAT), si el framework lo permite.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamaño del repositorio: 11,6 GB, lo que sugiere que los pesos ocupan aproximadamente esa cantidad en disco.
- Con cuantización de 2 bits, la memoria necesaria para cargar el modelo sería inferior a 11,6 GB, pero no se especifica el valor exacto.
- Dado el formato MLX, se requiere hardware Apple Silicon (M1 o posterior) para ejecución nativa con MLX.
- No hay datos sobre VRAM en GPUs NVIDIA o AMD, ni sobre latencia o throughput.
- Opciones de despliegue: MLX (framework oficial), posiblemente conversión a otros formatos (GGUF, etc.) pero no está documentado.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, y la discrepancia en el número de parámetros impide establecer una comparación fiable con otros modelos de 27B o 3B.

## Limitaciones y advertencias

- La cuantización a 2 bits degrada significativamente la calidad de generación, aumentando la probabilidad de errores, alucinaciones y pérdida de coherencia.
- La discrepancia entre el nombre del modelo (27B) y los parámetros reportados (3,59B) genera incertidumbre sobre el modelo base real; es posible que el nombre sea incorrecto o que el repositorio contenga un modelo distinto.
- No se especifica la licencia, por lo que el uso comercial no está garantizado. Se recomienda contactar al autor antes de utilizarlo en producción.
- No hay información sobre sesgos, riesgos de alucinación o limitaciones de idioma.
- El formato MLX limita su uso a ecosistemas Apple; para otros entornos se requeriría conversión adicional.
- Al ser una cuantización no oficial, no hay garantías de soporte ni mantenimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ben0112/Qwen3.8-27B-oQ2e-mtp
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
