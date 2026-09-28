# elnachto/laya-triage-multilingual

## Resumen

laya-triage-multilingual es un modelo de clasificación de texto desarrollado por elnachto que etiqueta issues de GitHub en cuatro categorías: bug, feature, question y docs. Es un fine-tune de Laya multilingual (convaiinnovations/laya-multilingual, arquitectura mmBERT-base) con 321.908.998 parámetros y licencia Apache-2.0. Su propósito es cubrir el hueco que dejaban los clasificadores solo en inglés dentro de la GitHub Action laya-triage, de modo que un repositorio con issues escritos en alemán, japonés o árabe reciba la misma calidad de triaje automático.

El modelo se entrenó con 35.200 ejemplos: 2.000 issues del conjunto de entrenamiento de la competición NLBSE'23 (500 por clase) traducidos con NLLB-200 distilled 600M a 13 idiomas, más los originales en inglés y 10.000 issues adicionales en inglés. Una sola época, con temperatura de calibración 1.203 aplicada a posteriori para corregir el exceso de confianza del modelo base (ECE de 0,077 a 0,053). Cubre 14 idiomas evaluados y se apoya en el router de Laya junto al checkpoint inglés laya-triage-en.

Su relevancia es doble. Por un lado, demuestra que un encoder de 322M parámetros puede igualar a servicios alojados de triaje como Jev (TypeSafe) en 13 idiomas, con diferencias dentro del ruido estadístico. Por otro, publica una validación poco habitual: además de la evaluación sobre traducciones, mide el salto en issues reales multilingües abiertos en 2026, donde la precisión pasa del 47,1% al 65,7% frente al modelo base sin ajustar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mmBERT-base (transformer encoder), fine-tune de convaiinnovations/laya-multilingual |
| Parametros totales | 321.908.998 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo distribuye safetensors; no se publican versiones GGUF ni cuantizadas) |
| Idiomas soportados | multilingual, en, de, es, pt, fr, id, vi, ru, tr, zh, ja, ko, ar, hi |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

Otros datos: pipeline text-classification, tamaño del repositorio 0,7 GB, 0 descargas y 1 like en el momento de la consulta, creado el 28 de septiembre de 2026.

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo mmBERT-base (la familia multilingüe de la que parte Laya multilingual), con 322M parámetros y una cabeza de clasificación sobre cuatro clases. No es un modelo generativo ni emplea mezcla de expertos, decodificación especulativa ni atención lineal: se trata de un clasificador discriminativo, por lo que su coste de inferencia es una pasada forward sobre la secuencia de entrada.

El entrenamiento usó 35.200 ejemplos construidos así: 2.000 issues de entrenamiento de NLBSE'23 (500 por clase) traducidos a 13 idiomas con NLLB-200 distilled 600M, más los originales en inglés y 10.000 issues adicionales en inglés. Los bloques de código, los stack traces y los mensajes de error se dejaron sin traducir deliberadamente, para reproducir el aspecto de un issue real. La validación usa 200 issues reservados en los 14 idiomas, sin que ningún issue aparezca en ambos splits en ningún idioma. Se entrenó una única época con la misma receta que el modelo inglés; una segunda época sobreajustaba y se descartó. La innovación técnica destacable es la calibración de temperatura (T = 1,203), que reduce el ECE de 0,077 a 0,053: las probabilidades del modelo son utilizables como señal de confianza en un flujo automático, no solo el argmax.

## Capacidades

- Clasificación de issues de GitHub en cuatro clases mutuamente excluyentes: bug, feature, question y docs.
- Inferencia multilingüe en 14 idiomas evaluados: inglés, alemán, español, portugués, francés, indonesio, vietnamita, ruso, turco, chino, japonés, coreano, árabe e hindi.
- Manejo de texto con mezcla de idiomas, bloques de código, stack traces y mensajes de error en inglés dentro del mismo issue.
- Probabilidades calibradas por clase, aptas para umbrales de decisión y para derivar casos ambiguos a revisión humana.
- Integración como router junto al modelo inglés within la GitHub Action laya-triage (laya-triage-en), seleccionando el checkpoint según el idioma del issue.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un clasificador.
- No tiene capacidades de visión, audio ni modo thinking.
- Tamaño de secuencia máximo no disponible en la información publicada.

## Casos de uso

- Triaje automático de issues en repositorios multilingües: la GitHub Action laya-triage ejecuta el router, detecta el idioma del issue y aplica este checkpoint si no es inglés, etiquetando como bug, feature, question o docs sin intervención humana.
- Etiquetado previo al enrutamiento de equipos de soporte: un issue clasificado como bug se asigna al equipo de ingeniería, mientras que question va a soporte y docs a quien mantiene la documentación, usando las probabilidades calibradas para marcar los casos con confianza baja.
- Priorización de backlogs en proyectos con contribuyentes internacionales: al cubrir 14 idiomas con una precisión medida entre el 84,0% y el 90,6%, evita que issues en árabe, coreano o hindi queden sin clasificar por falta de un modelo local.
- Moderación y limpieza de repositorios: filtrado de issues que son en realidad preguntas o peticiones de documentación para mantener el backlog de bugs limpio, reduciendo el trabajo manual de mantenedores.
- Alimentación de métricas de producto: agregación de la distribución de tipos de issue por idioma y por release para detectar, por ejemplo, un pico de bugs reportados desde una comunidad concreta.
- Detección de deriva en la calidad de las releases: monitorizar la proporción de bugs frente a features a lo largo del tiempo y activar alertas cuando la ratio se desvía de la línea base.
- Clasificación por lotes de históricos de issues: procesar en CPU un repositorio completo de miles de issues para construir datasets etiquetados o análisis retrospectivos, dado el reducido coste de inferencia del modelo.
- Preprocesado para pipelines de agentes: usar la etiqueta y la confianza como primer paso determinista antes de invocar un LLM generativo, reduciendo el coste de tokens en tareas de resolución automática de incidencias.

## Benchmarks y rendimiento

Precisión sobre los mismos 500 issues de validación de NLBSE'23, traducidos automáticamente con NLLB-200 a 13 idiomas (margen indicado por el autor: ±3 puntos por idioma):

| Idioma | Laya base | Jev (TypeSafe, alojado) | laya-triage |
|---|---|---|---|
| Inglés | 89,2% | 88,2% | 90,6% |
| Alemán | 74,6% | 85,8% | 87,4% |
| Vietnamita | 71,2% | 84,4% | 86,6% |
| Chino | 68,2% | 83,8% | 86,2% |
| Japonés | 67,8% | 84,4% | 86,0% |
| Turco | 68,2% | 85,0% | 85,8% |
| Indonesio | 73,8% | 86,0% | 85,6% |
| Español | 73,8% | 85,6% | 85,2% |
| Hindi | 66,2% | 85,4% | 85,0% |
| Portugués | 74,0% | 86,6% | 84,8% |
| Ruso | 70,8% | 85,8% | 84,6% |
| Coreano | 64,2% | 83,8% | 84,4% |
| Francés | 71,6% | 85,2% | 84,2% |
| Árabe | 67,4% | 84,8% | 84,0% |

Evaluación sobre issues reales no vistos: 367 issues no ingleses abiertos en 2026, escritos por personas y no traducidos. La precisión pasó del 47,1% del modelo base al 65,7% con este checkpoint.

Calibración: temperatura 1,203, ECE de 0,077 a 0,053.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,3 GB en fp32 y 0,65 GB en fp16/bf16 para 322M parámetros. El repositorio ocupa 0,7 GB, coherente con pesos en media precisión.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM sirve. No se necesita A100 ni H100; una RTX 3060, RTX 4090 o incluso una GPU integrada modesta son suficientes.
- Cabe holgadamente en GPU de consumo: sí, en cualquier tarjeta moderna con 4 GB o más, y también en CPU para lotes pequeños.
- Opciones de despliegue: Transformers (pipeline text-classification), vLLM o TGI para servir clasificación por lotes, y exportación a ONNX para entornos sin PyTorch. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama no son aplicables directamente como está distribuido.
- Latencia y throughput estimados: no disponibles en la información publicada. Al ser un encoder sin generación autorregresiva, el coste por petición es una única pasada forward y escala bien por lotes, pero no se publican cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas evaluados | Precisión (inglés / peor idioma) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| laya-triage-multilingual | 322M | no disponible | 14 | 90,6% / 84,0% (árabe) | apache-2.0 | HuggingFace, pesos safetensors |
| laya-triage-en | no disponible | no disponible | 1 (inglés) | no disponible | apache-2.0 | HuggingFace |
| Laya multilingual (base) | 322M | no disponible | 14 | 89,2% / 64,2% (coreano) | apache-2.0 | HuggingFace |
| Jev (TypeSafe) | no disponible | no disponible | 14 | 88,2% / 83,8% (chino, coreano) | no disponible | servicio alojado |

El autor señala que laya-triage y Jev están dentro del ruido estadístico entre sí y que ambos superan claramente al modelo base sin ajustar. La diferencia principal frente a Jev es la disponibilidad: laya-triage-multilingual es descargable y ejecutable en local bajo Apache-2.0, mientras que Jev es un servicio alojado.

## Limitaciones y advertencias

- Los datos de entrenamiento son traducciones automáticas: los issues reales mezclan idiomas, código y mensajes de error en inglés en mayor proporción de lo que lo hacen las traducciones, lo que puede degradar el rendimiento fuera del conjunto de evaluación.
- Solo 13 idiomas (más el inglés) están medidos. El modelo base soporta otros idiomas, pero no han sido evaluados y no hay garantía de precisión.
- La nota sobre priors de clase del modelo inglés aplica también aquí: si la distribución real de issues de un repositorio se aleja de la del conjunto de entrenamiento, las predicciones pueden sesgarse hacia las clases más frecuentes.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea con confianza alta en issues ambiguos o muy cortos; por eso la calibración es relevante y conviene fijar umbrales.
- Sensibilidad al preprocesado: la receta de entrenamiento deja código y trazas sin traducir, de modo que alterar ese preprocesado en producción puede desviar los resultados.
- La licencia Apache-2.0 permite uso comercial y modificación, pero el modelo base y el dataset NLBSE'23 tienen sus propias condiciones, que conviene revisar antes de redistribuir.
- Para producción: la ventana de contexto no está documentada, así que hay que validar el truncado con issues largos antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/elnachto/laya-triage-multilingual
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Modelo inglés de la misma familia: https://huggingface.co/elnachto/laya-triage-en
- GitHub Action laya-triage: https://github.com/elnachto/laya-triage
- Dataset de la competición NLBSE'23: https://github.com/nlbse2023/issue-report-classification
- Modelo de traducción NLLB-200 distilled 600M: https://huggingface.co/facebook/nllb-200-distilled-600M
- Perfil del autor: https://github.com/elnachto

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card del autor.
