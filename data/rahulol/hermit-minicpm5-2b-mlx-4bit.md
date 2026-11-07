# rahulol/Hermit-MiniCPM5-2B-MLX-4bit

## Resumen

Hermit-MiniCPM5-2B-MLX-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo SonGT1/MiniCPM5-abliterated-2B, un derivado "abliterated" (sin rechazos de seguridad) del MiniCPM5-2B de OpenBMB. El autor, rahulol, la publica para su uso dentro de la aplicación Hermit en iPhone y Mac, aprovechando el framework MLX de Apple para inferencia local en silicio de la serie M y A. El modelo base pertenece a la familia MiniCPM5, una serie de modelos densos orientados a despliegue on-device y entornos con recursos limitados.

La relevancia de esta ficha es acotada: no se trata de un modelo original ni de una versión oficial, sino de un artefacto de conversión con licencia Apache-2.0, sin descargas ni validación comunitaria en el momento de la consulta. Su interés práctico reside en que permite ejecutar un transformer denso de aproximadamente 2.500 millones de parámetros en dispositivos Apple con un peso de repositorio de 1,4 GB, lo que lo sitúa en la franja de modelos pequeños aptos para inferencia local en hardware de consumo.

Conviene subrayar que la información disponible es escasa: la model card se limita a describir el proceso de conversión (mlx-lm, group size 64, 4,5 bits por peso) y no aporta datos de entrenamiento, benchmarks ni idiomas. Todo lo relativo a la arquitectura y capacidades del modelo base se infiere de la documentación pública de OpenBMB sobre MiniCPM5-2B, no de este repositorio concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (LlamaForCausalLM segun el modelo base MiniCPM5-2B) |
| Parametros totales | 2.516.756.480 (dato real de safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4 bits MLX (group size 64, 4,5 bits por peso) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), libreria mlx |

## Arquitectura y entrenamiento

El modelo es una cuantizacion de 4 bits del checkpoint SonGT1/MiniCPM5-abliterated-2B, que a su vez deriva del MiniCPM5-2B de OpenBMB. Segun la documentacion del proyecto MiniCPM, MiniCPM5-2B es un transformer denso de 2B parametros que emplea la arquitectura estandar LlamaForCausalLM, lo que permite cargarlo en motores de inferencia convencionales sin kernels personalizados ni forks de codigo. La serie MiniCPM5 se presenta como sucesora de MiniCPM5-1B y esta disenada para despliegue on-device y escenarios con recursos restringidos.

La conversion a MLX se realizo con mlx-lm aplicando cuantizacion de grupo con tamano 64 y 4,5 bits por peso, y se ajusto la clase del tokenizer a PreTrainedTokenizerFast para compatibilidad. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si el modelo base empleo RLHF o DPO. El calificativo "abliterated" indica que el checkpoint de origen ha sido modificado para eliminar o reducir los comportamientos de rechazo, pero no se documenta la metodologia concreta en la informacion disponible.

## Capacidades

- Generacion de texto autoregresiva propia de un modelo denso de 2B parametros, con la calidad esperable en esa franja de tamano.
- Razonamiento basico y respuesta a instrucciones, heredado del modelo base MiniCPM5-2B.
- Soporte de tool calling y function calling: la documentacion de MiniCPM5-2B menciona integracion con flujos de agentes y "Agent Skills" para entornos tipo Cursor o Claude Code, aunque no se detalla el mecanismo en esta ficha.
- Ejecucion local en dispositivos Apple mediante MLX, lo que habilita inferencia sin conexion en iPhone y Mac.
- Comportamiento "abliterated": ausencia o reduccion de rechazos de seguridad, lo que amplia el rango de respuestas pero elimina las salvaguardas del modelo original.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio o modo thinking: no disponibles en la informacion proporcionada.

## Casos de uso

- Inferencia local en iPhone y Mac dentro de la aplicacion Hermit: el formato MLX 4-bit y el peso de 1,4 GB permiten cargar el modelo en memoria unificada de dispositivos Apple sin GPU dedicada, lo que lo hace adecuado para asistentes offline.
- Prototipado rapido de aplicaciones de chat en macOS: al ser un transformer Llama estandar, puede integrarse con mlx-lm y probarse en un MacBook antes de escalar a un modelo mayor.
- Generacion de texto en entornos sin conectividad: escenarios de campo, aviacion o entornos aislados donde no se puede depender de APIs en la nube.
- Filtrado y clasificacion de texto en local: tareas de etiquetado, resumen o extraccion de entidades en lotes pequenos donde la privacidad impide enviar datos a un servicio externo.
- Educacion e investigacion sobre cuantizacion: sirve como caso de estudio de conversion MLX con group size 64 y 4,5 bits por peso, util para comparar la degradacion de calidad frente al checkpoint original.
- Experimentacion con modelos sin rechazos: para investigadores que estudian el comportamiento de modelos abliterated en tareas de red teaming o evaluacion de sesgos, siempre con las advertencias de la seccion de limitaciones.
- Base para fine-tuning ligero en Apple Silicon: al estar en formato MLX, puede adaptarse con herramientas del ecosistema MLX para tareas especificas de nicho.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas, y la documentacion del modelo base MiniCPM5-2B menciona un estado "SOTA en la clase 2B open source" sin cifras concretas en los extractos consultados.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 1,4 GB para los pesos en 4 bits, mas overhead de activaciones y KV cache; en la practica, entre 2 y 3 GB de memoria unificada para contexto moderado.
- GPU recomendadas: no aplica en el sentido tradicional; el formato MLX esta pensado para silicio de Apple (series M1, M2, M3, M4 y chips A recientes en iPhone/iPad).
- Cabe en GPU de consumo: si, en cualquier Mac con Apple Silicon y en iPhone/iPad compatibles con MLX. No esta pensado para GPUs NVIDIA.
- Opciones de despliegue: mlx-lm y la aplicacion Hermit; al ser arquitectura Llama, el checkpoint original (no esta conversion MLX) podria cargarse en vLLM, llama.cpp u Ollama tras reconvertir a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Hermit-MiniCPM5-2B-MLX-4bit | 2,52B | no disponible | Apache-2.0 | safetensors MLX 4-bit | Conversion no oficial para Apple Silicon |
| openbmb/MiniCPM5-2B-MLX | 2B (aprox.) | no disponible | no disponible en la informacion | MLX | Version oficial de OpenBMB en MLX |
| SonGT1/MiniCPM5-abliterated-2B | 2B (aprox.) | no disponible | no disponible en la informacion | safetensors | Checkpoint base abliterated del que deriva esta conversion |
| MiniCPM5-1B | 1B (aprox.) | no disponible | no disponible en la informacion | no disponible | Modelo anterior de la misma serie, menor capacidad |

La comparacion se limita a la familia MiniCPM5 porque no se dispone de datos de benchmarks ni de contexto para contrastar con alternativas de otros fabricantes en la misma franja.

## Limitaciones y advertencias

- Modelo "abliterated": se han eliminado o reducido los rechazos de seguridad, por lo que puede generar contenido que el modelo original bloquearia. No es apto para produccion orientada al publico sin capas de moderacion externas.
- Sin datos de benchmarks ni evaluacion de calidad: no hay evidencia publicada de que la cuantizacion 4-bit preserve el rendimiento del checkpoint original.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, sin validacion de la comunidad.
- Idiomas no documentados: no se puede garantizar un comportamiento correcto en castellano u otros idiomas distintos del ingles sin evaluacion previa.
- Contexto no documentado: se desconoce la ventana maxima efectiva tras la conversion.
- Licencia Apache-2.0 permisiva para uso comercial, pero la responsabilidad sobre el contenido generado por un modelo sin salvaguardas recae en el desplegador.
- Riesgo de alucinacion inherente a un modelo de 2B parametros, especialmente en tareas de conocimiento factual y razonamiento multi-paso.
- Dependencia del ecosistema MLX: no es portable directamente a GPUs NVIDIA sin reconversion.
- La fecha de creacion del repositorio (2026-11-07) y la falta de documentacion adicional impiden verificar la procedencia exacta del checkpoint base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rahulol/Hermit-MiniCPM5-2B-MLX-4bit
- Modelo base: https://huggingface.co/SonGT1/MiniCPM5-abliterated-2B
- Version oficial MLX de OpenBMB: https://huggingface.co/openbmb/MiniCPM5-2B-MLX
- Repositorio GitHub del proyecto MiniCPM: https://github.com/OpenBMB/MiniCPM
