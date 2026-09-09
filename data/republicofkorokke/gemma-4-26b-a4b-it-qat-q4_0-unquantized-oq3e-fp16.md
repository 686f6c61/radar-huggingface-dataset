# RepublicOfKorokke/gemma-4-26B-A4B-it-qat-q4_0-unquantized-oQ3e-fp16

## Resumen
El modelo `gemma-4-26B-A4B-it-qat-q4_0-unquantized-oQ3e-fp16` es una cuantización de 3 bits de un modelo de la familia Gemma 4, realizada por `RepublicOfKorokke` con la herramienta oQ (oMLX v0.6.4). El modelo original, `google/gemma-4-26B-A4B-it`, es un modelo de instrucciones con 25.805.936.206 parámetros, según el recuento de pesos safetensors. La cuantización reduce el tamaño de los pesos a un formato MLX safetensors de 3 bits con grupo 64, con un tamaño de repositorio de 13.8 GB. El objetivo es ofrecer una variante optimizada para ejecutarse localmente en entornos basados en MLX, especialmente en hardware de Apple Silicon. La relevancia radica en la posibilidad de ejecutar un modelo de gran tamaño en equipos de consumo, aunque no se proporcionan datos de rendimiento ni licencia.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Gemma 4 (gemma4) |
| Parámetros totales | 25.805.936.206 (25,8 mil millones) |
| Parámetros activos | no disponible (la nomenclatura A4B sugiere 4 mil millones activos, pero no se confirma en la documentación) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 3 bits, grupo 64, cuantización mixta oQ (oMLX v0.6.4) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento
La arquitectura indicada en la model card es `gemma4`; no se aportan más detalles. El nombre del modelo (`26B-A4B-it`, donde `A4B` significa activos de 4 mil millones) sugiere que se trata de una arquitectura de mezcla de expertos (MoE) con 26.000 millones de parámetros totales y 4.000 millones de parámetros activos por token; sin embargo, la información proporcionada no confirma este punto, y el recuento real de pesos es de 25.805.936.206. Tampoco se detallan los datos de entrenamiento ni procesos de ajuste. La única innovación destacable documentada es la cuantización mediante oQ (oMLX v0.6.4), que aplica una precisión mixta de 3 bits con grupo 64 y genera pesos en formato MLX safetensors.

## Capacidades
La información disponible no especifica las capacidades del modelo. Por convención, el sufijo `it` en el nombre del modelo original (`gemma-4-26B-A4B-it`) indica que se trata de una variante ajustada para seguir instrucciones, aunque la model card no lo confirma ni detalla si soporta tool calling, visión, agentes o capacidades multilingües. No se dispone de una lista de capacidades validada en la información proporcionada.

- Generación de texto e instrucciones: no especificado.
- Tool calling: no se informa.
- Agentes y multi-step reasoning: no se informa.
- Capacidades multilingües: no se informa.
- Visión o audio: no se informa.
- Otras capacidades: no se informa.

## Casos de uso
Dado que la información no detalla las capacidades reales del modelo, los siguientes casos son aplicaciones potenciales basadas en el tipo de modelo (LLM de instrucciones cuantizado) y en su formato MLX. Deben verificarse antes de usarse en producción.

- Ejecución local en dispositivos Apple Silicon: el modelo está publicado en formato MLX safetensors, lo que lo hace adecuado para cargarse con la librería MLX en Macs con memoria unificada. Con 13.8 GB de pesos, se estima que un equipo con al menos 16 GB de RAM podría ejecutarlo, aunque para contextos largos se recomendaría 24 GB o más.
- Asistente de código en entornos offline: si el modelo original conserva las capacidades de generación de código de Gemma 4, podría integrarse en editores o CLI locales como asistente de autocompletado, evitando la dependencia de APIs externas.
- Análisis y resumen de documentos: la ventana de contexto del modelo original no se conoce, por lo que esta aplicación dependería de esa característica. Si el contexto es amplio, podría usarse para resumir informes extensos en tareas de back-office.
- Chat de soporte técnico en local: al ser un modelo de instrucciones, podría gestionar conversaciones multi-turno si se ejecuta con un framework compatible con MLX. La ventaja sería la privacidad de los datos.
- Traducción automática en entornos cerrados: suponiendo que el modelo original sea multilingüe, podría emplearse para traducir textos entre idiomas sin conexión. No hay confirmación de los idiomas soportados.
- Prototipado y validación de técnicas de cuantización: este checkpoint sirve como ejemplo de cuantización mixta de 3 bits; puede utilizarse para comparar la calidad de salida frente a la variante oQ4e o al modelo original en experimentos de investigación.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. No puede evaluarse el rendimiento del modelo en tareas estándar de referencia (por ejemplo, MMLU, HumanEval, GSM8K) porque no se proporcionan datos.

## Requisitos de hardware
- VRAM estimada: el repositorio ocupa 13.8 GB en disco; al cargarlo, los pesos en MLX ocupan aproximadamente 13.8 GB de memoria unificada, más el espacio para el KV cache y los buffers de activación. En la práctica, se recomienda entre 16 y 24 GB de RAM unificada según la longitud de contexto y el batch.
- GPU recomendada: no se especifica; al estar en formato MLX, está orientado a Apple Silicon (M1/M2/M3/M4). No se indica soporte CUDA ni para tarjetas NVIDIA.
- Compatibilidad con GPU de consumo: no es directamente compatible con GPUs NVIDIA de consumo porque el formato de pesos es MLX safetensors, no GGUF ni otros formatos comunes para llama.cpp o vLLM.
- Opciones de despliegue: exclusivamente a través de la librería MLX y herramientas compatibles (oMLX/oQ). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
| Modelo | Parámetros totales | Bits | Grupo | Tamaño repo | Formato | Contexto | Licencia |
|---|---|---|---|---|---|---|---|
| `gemma-4-26B-A4B-it` (original) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| `gemma-4-26B-A4B-it-qat-q4_0-unquantized-oQ3e-fp16` (este modelo) | 25.805.936.206 | 3 | 64 | 13.8 GB | MLX safetensors | no disponible | no disponible |
| `gemma-4-26B-A4B-it-qat-q4_0-unquantized-oQ4e-fp16` (variante) | no disponible | 4 | no disponible | no disponible | MLX safetensors | no disponible | no disponible |

No se dispone de resultados de benchmarks para comparar el rendimiento.

## Limitaciones y advertencias
- La licencia no está especificada ni en el repositorio ni en la model card. Esto impide garantizar permisos de uso comercial o redistribución legal de la cuantización.
- La cuantización de 3 bits puede producir degradación de calidad respecto al modelo original en precisión completa; no se han publicado evaluaciones que validen la calidad preservada.
- No hay datos de capacidades, contexto ni idiomas; no se puede confirmar que el modelo cumpla tareas específicas en entornos reales.
- Es un modelo sin descargas ni likes, lo que indica que no ha sido probado por la comunidad, aumentando el riesgo de fallos de implementación o incompatibilidades.
- El formato MLX limita su despliegue a entornos compatibles con Apple, reduciendo la portabilidad a infraestructura de servidores estándar.

## Enlaces
- HuggingFace del modelo: https://huggingface.co/RepublicOfKorokke/gemma-4-26B-A4B-it-qat-q4_0-unquantized-oQ3e-fp16
- Modelo original: https://huggingface.co/google/gemma-4-26B-A4B-it
- Variante oQ4e: https://huggingface.co/RepublicOfKorokke/gemma-4-26B-A4B-it-qat-q4_0-unquantized-oQ4e-fp16
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
