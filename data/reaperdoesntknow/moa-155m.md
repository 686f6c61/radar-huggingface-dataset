# reaperdoesntknow/MoA-155M

## Resumen

MoA-155M es un modelo de generación de texto de pequeño tamano (155 millones de parámetros, según se deduce de su identificador) publicado por el usuario reaperdoesntknow bajo el paraguas de Convergent Intelligence LLC: Research Division. El modelo se distribuye a través de Hugging Face con la librería transformers y el pipeline de text-generation, y esta etiquetado con los tags `moa`, `moa_metric` y `convergentintel`, que lo vinculan al marco teórico "Discrepancy Calculus" (DISC) descrito en su model card.

El modelo aparece afinado sobre los datasets TIGER-Lab/MathInstruct y yahma/alpaca-cleaned, lo que sugiere un enfoque hacia instrucciones y razonamiento matemático basico. La model card, sin embargo, es en gran medida una plantilla autogenerada por Hugging Face con la mayoria de campos marcados como "[More Information Needed]", por lo que no hay datos oficiales sobre arquitectura exacta, contexto, tokenizador ni procedimiento de entrenamiento.

Su relevancia practica es limitada pero concreta: se trata de un modelo muy pequeno (repo de 0,4 GB) que puede ejecutarse en hardware de consumo modesto, lo que lo hace util como banco de pruebas para experimentacion con fine-tuning, destilacion o pipelines de generacion de texto de baja latencia. No obstante, la ausencia de benchmarks, de documentacion tecnica y de un autor verificable obliga a tratarlo con cautela en entornos de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la especifica; el nombre sugiere "Mixture of Adapters" o "Mixture of Agents", sin confirmar) |
| Parametros totales | 155M (inferido del identificador del modelo; no confirmado en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (compatible con cuantizacion estandar de transformers, pero no se documentan variantes publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato estandar de transformers; no se detalla en la model card) |

## Arquitectura y entrenamiento

La model card no proporciona informacion sobre la arquitectura interna del modelo. El identificador "MoA" y los tags `moa` y `moa_metric` sugieren alguna variante de "Mixture of Adapters" o "Mixture of Agents", pero no hay documentacion tecnica que lo confirme. Tampoco se especifican el numero de capas, dimensiones ocultas, mecanismo de atencion ni tokenizador.

En cuanto al entrenamiento, la model card lista dos datasets: TIGER-Lab/MathInstruct (instrucciones matematicas) y yahma/alpaca-cleaned (instrucciones generales limpias). No se indica el numero de tokens, la composicion exacta del dataset, si hubo RLHF/DPO, ni los hiperparametros de entrenamiento (todos los campos aparecen como "[More Information Needed]"). La seccion "Discrepancy Calculus Foundation" describe un marco teorico propio del autor (operador de discrepancia, jump sets, ghost imprinting) que no aporta detalles verificables sobre el entrenamiento real del modelo.

## Capacidades

- Generacion de texto en ingles a partir de instrucciones (pipeline text-generation).
- Afinado sobre instrucciones generales (alpaca-cleaned) y matematicas (MathInstruct), lo que sugiere cierta capacidad para resolver problemas aritmeticos y de razonamiento basico.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Prototipado rapido de pipelines de generacion de texto: al ocupar 0,4 GB, el modelo puede cargarse en una GPU de consumo o incluso en CPU para validar flujos de inferencia antes de escalar a modelos mayores.
- Experimentacion con fine-tuning ligero: su tamano de 155M permite iterar con LoRA o adaptadores completos en una sola GPU, usando alpaca-cleaned como base de instrucciones.
- Generacion de respuestas cortas en ingles para tareas de clasificacion o extraccion: util como baseline en entornos de investigacion donde se necesita un modelo rapido y de bajo coste.
- Educacion y demos: adecuado para talleres o notebooks que ensenan el ciclo completo de carga, inferencia y evaluacion de un modelo de transformers.
- Pruebas de cuantizacion y despliegue: sirve para validar configuraciones de llama.cpp, Ollama o vLLM con un modelo pequeno antes de migrar a uno mayor.
- Investigacion sobre el marco DISC: el modelo se presenta como parte del portfolio de Convergent Intelligence, por lo que puede usarse para reproducir o estudiar las tecnicas descritas en su documentacion teorica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6-0,7 GB en fp16 (155M parametros × 2 bytes + overhead), y en torno a 0,3-0,4 GB en cuantizacion de 8 bits. Cifras estimadas a partir del tamano del repo (0,4 GB), no confirmadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tarjetas como RTX 3060, RTX 4060, T4 o incluso iGPU con memoria unificada son suficientes.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: transformers (nativo), llama.cpp y Ollama si se genera una version GGUF (no publicada oficialmente), vLLM y TGI para servir en produccion (compatibilidad estandar de transformers).
- Latencia y throughput estimados: no disponibles; por el tamano, se espera una latencia de pocos milisegundos por token en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MoA-155M (este modelo) | 155M (inferido) | no disponible | apache-2.0 | Hugging Face |
| GPT-2 small | 124M | 1024 tokens | MIT | Hugging Face, ampliamente adoptado |
| SmolLM-135M | 135M | 2048 tokens | apache-2.0 | Hugging Face, con benchmarks publicados |
| Qwen2.5-0.5B | 494M | 32 768 tokens | apache-2.0 | Hugging Face, con benchmarks publicados |

La comparacion es aproximada: MoA-155M carece de benchmarks y de documentacion tecnica, mientras que las alternativas citadas publican resultados y especificaciones completas. En terminos de rendimiento real, no es posible establecer una comparacion rigurosa con los datos disponibles.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada sobre calidad de generacion, razonamiento o matemáticas, a pesar de estar afinado sobre MathInstruct.
- Model card incompleta: la mayoria de secciones son plantillas autogeneradas con "[More Information Needed]", lo que impide verificar arquitectura, contexto o procedimiento de entrenamiento.
- Riesgo de alucinacion: alto, dado el reducido tamano del modelo y la falta de evaluacion; no se recomienda para tareas que requieran precision factual.
- Solo ingles: no se declaran capacidades multilingues, por lo que su uso en castellano no esta soportado.
- Sesgos conocidos: no documentados; los datasets de origen (alpaca-cleaned y MathInstruct) pueden introducir sesgos propios, pero no se ha realizado analisis.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; la responsabilidad recae en el integrador.
- Autor y organizacion no verificables: "Convergent Intelligence LLC: Research Division" no dispone de trayectoria publica contrastable, y el marco DISC no cuenta con revision por pares conocida.
- No apto para produccion critica: sin evaluacion de robustez, seguridad ni sesgos, su uso en sistemas en produccion debe limitarse a prototipos o entornos controlados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/MoA-155M
- Perfil del autor: https://huggingface.co/reaperdoesntknow
- Documento teorico DISC: https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus (DOI: 10.57967/hf/8194)
- Dataset MathInstruct: https://huggingface.co/datasets/TIGER-Lab/MathInstruct
- Dataset alpaca-cleaned: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Paper de referencia sobre impacto ambiental (citado en la model card): https://arxiv.org/abs/1910.09700
