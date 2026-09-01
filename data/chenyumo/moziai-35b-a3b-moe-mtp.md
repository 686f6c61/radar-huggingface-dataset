# chenyumo/moziAI-35B-A3B-MOE-MTP

## Resumen

MoziAI-35B-V3.8 es un modelo de lenguaje multimodal de codigo abierto desarrollado por el equipo de Chen Yumo, un influyente analista financiero chino. Esta construido sobre la base open source **Ornith-1.5-35B-A3B** (arquitectura Qwen3.5-35B-A3B / Qwen3.6-35B-A3B, licencia MIT) y anade capas de fine-tuning propietarias orientadas al dominio financiero, un marco de razonamiento estructurado de siete dimensiones, un mecanismo de iteracion agente tipo LOOP y un algoritmo de cuantizacion hibrida propio llamado MoziSmartBit.

El modelo presenta 35.505 millones de parametros totales en arquitectura MoE con 3.000 millones de parametros activos, lo que permite su despliegue en GPU de consumo con 20 GB de VRAM. Su principal propuesta de valor es la compresion mediante MoziSmartBit, que reduce el peso del modelo a aproximadamente 15,9 GB (un 30 % menos que una cuantizacion Q4_K_M estandar de ~22 GB) manteniendo supuestamente un 99 % de la precision FP16. Incluye soporte para vision, tool calling y un modo "uncensored" sin restricciones de moderacion de contenido.

La relevancia actual del modelo radica en su enfoque vertical financiero, un ambito donde la tolerancia a la alucinacion es muy baja, y en su capacidad para ejecutarse localmente con coste de inferencia cero. La version analizada (V3.8) fue publicada el 1 de septiembre de 2026 y esta disponible en formato GGUF para llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.5/Qwen3.6-35B-A3B (Ornith-1.5-35B-A3B) |
| Parametros totales | 35.505.251.456 (35,5 B) |
| Parametros activos | 3.000 millones (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MoziSmartBit (cuantizacion hibrida propietaria, ~15,9 GB), Q4_K_M, GGUF (otros formatos no especificados) |
| Idiomas soportados | 201 idiomas y dialectos, con chino especialmente optimizado; ingles y chino como idiomas principales declarados |
| Licencia | other (la base Ornith-1.5-35B-A3B es MIT; la licencia exacta del modelo final no esta especificada) |
| Formato de pesos | GGUF (llama.cpp), safetensors (repo original de 47,8 GB) |

## Arquitectura y entrenamiento

La arquitectura base es un transformer MoE derivado de la familia Qwen3.5/Qwen3.6, concretamente el modelo Ornith-1.5-35B-A3B con licencia MIT. La configuracion MoE activa 3.000 millones de parametros por token de un total de 35.500 millones, lo que permite un equilibrio entre capacidad y eficiencia computacional.

Sobre esta base, el equipo de Chen Yumo aplico fine-tuning con datos financieros propios y capacidades de dominio especifico. El entrenamiento incorpora tres innovaciones destacables:

- **Marco de pensamiento dinamico de siete dimensiones**: el modelo emite un marcador `moziAI-Think` y despliega un nivel de razonamiento estructurado segun la complejidad de la tarea (nivel 0 para preguntas simples, nivel 1 para analisis, nivel 2 para desarrollo complejo con las siete dimensiones completas: comprension, evaluacion de complejidad, dependencias, evaluacion de riesgo, necesidades de recursos, criterios de aceptacion y estrategia de ejecucion).
- **Mecanismo de iteracion agente LOOP**: las tareas complejas entran en un ciclo de ejecucion, evaluacion, ajuste y verificacion antes de producir la respuesta final.
- **MoziSmartBit**: algoritmo de cuantizacion hibrida por capas que aplica precision diferenciada segun la estructura MoE, logrando una compresion de 4,5x respecto a FP16.

No se han publicado detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de tecnicas como RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento estructurado con niveles adaptativos de profundidad de pensamiento.
- Razonamiento multi-paso con iteracion LOOP para tareas complejas: el modelo ejecuta, evalua, ajusta y verifica antes de responder.
- Tool calling / function calling, especialmente optimizado para programacion cuantitativa y consultas financieras.
- Vision multimodal: capaz de comprender capturas de pantalla e imagenes localmente.
- Programacion general full-stack: Python, JavaScript, TypeScript, Go y Rust, incluyendo depuracion y diseno de arquitectura.
- Redaccion de informes de investigacion, articulos de analisis, documentacion tecnica y contenido creativo.
- Soporte multilingue para 201 idiomas y dialectos, con chino especialmente optimizado.
- Modo "uncensored": sin restricciones de moderacion de contenido, orientado a investigacion academica y analisis profundo.
- Especializacion financiera: consultas financieras, analisis de datos, estrategias cuantitativas y lectura de informes.

## Casos de uso

- **Analisis financiero automatizado**: el modelo puede procesar informes anuales, estados de resultados y datos de mercado, generando resumenes ejecutivos y deteccion de anomalias. Su fine-tuning financiero reduce el riesgo de alucinacion en datos numericos, critico en este dominio.
- **Desarrollo de estrategias cuantitativas**: gracias al soporte de tool calling y al razonamiento de nivel 2 con siete dimensiones, puede disenar, implementar y validar estrategias de trading algoritmico en Python, integrandose con APIs de datos de mercado.
- **Atencion al cliente financiera**: despliegue local con coste cero por token, capaz de gestionar conversaciones multi-turno sobre productos financieros, normativa y resolucion de dudas de inversion con privacidad de datos garantizada.
- **Asistente de programacion full-stack**: genera codigo, depura errores y disena arquitecturas en Python, JS, TS, Go y Rust. Su modo LOOP permite autoverificar el codigo generado antes de entregarlo, reduciendo errores en pipelines de CI/CD.
- **Analisis de capturas de pantalla y documentos visuales**: la capacidad de vision permite extraer informacion de graficos de trading, dashboards financieros y capturas de interfaces para su posterior analisis textual.
- **Investigacion academica sin restricciones**: el modo uncensored permite explorar temas sensibles o controversiales sin filtros de moderacion, util para estudios sociologicos, politologicos o analisis de contenido.
- **Redaccion de informes de investigacion de mercado**: genera documentos estructurados con citas, analisis de tendencias y proyecciones, aprovechando el marco de pensamiento de siete dimensiones para cubrir todos los aspectos relevantes.
- **Despliegue en entornos con restriccion de hardware**: con 15,9 GB de peso y 3B parametros activos, puede ejecutarse en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB), habilitando inferencia local en pequenas empresas o consultoras independientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica referencia de rendimiento es la afirmacion del autor de que la cuantizacion MoziSmartBit mantiene aproximadamente un 99 % de la precision FP16 y supera a Q4_K_M, pero no se aportan cifras concretas ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: minimo 20 GB para la cuantizacion MoziSmartBit (~15,9 GB de pesos).
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A6000 (48 GB), o GPUs de datacenter como A100 (40/80 GB) para mayor margen de contexto.
- No cabe en GPUs de 16 GB o inferiores (RTX 4080, RTX 3080 Ti, etc.) con la cuantizacion propietaria; podria intentarse con cuantizaciones mas agresivas pero no se garantiza.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros frameworks compatibles con GGUF. Soporta decodificacion especulativa para acelerar la inferencia.
- Latencia y throughput: no disponibles. El modelo activa solo 3B parametros por token, lo que sugiere una velocidad de generacion superior a un modelo denso de 35B, pero no se aportan mediciones concretas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| MoziAI-35B-V3.8 | 35,5 B | 3 B | no disponible | other (base MIT) | GGUF |
| Qwen3-32B | 32 B | 32 B (denso) | no disponible | Apache 2.0 | safetensors, GGUF |
| DeepSeek-V3-Lite | no disponible | no disponible | no disponible | MIT | no disponible |

La comparativa es limitada porque no se dispone de datos de contexto ni benchmarks para MoziAI. Frente a un modelo denso de tamano similar como Qwen3-32B, MoziAI ofrece la ventaja de menor VRAM gracias a su arquitectura MoE con 3B activos, pero se desconoce si el rendimiento por token es comparable. La especializacion financiera y el modo uncensored son diferenciadores claros frente a alternativas generalistas.

## Limitaciones y advertencias

- La licencia "other" es ambigua: aunque la base Ornith es MIT, la licencia exacta del modelo final no esta claramente especificada, lo que puede generar incertidumbre legal para uso comercial.
- El modo "uncensored" implica ausencia de moderacion de contenido, lo que puede producir respuestas inapropiadas, ofensivas o peligrosas en entornos de produccion no controlados.
- No hay datos publicados de benchmarks, por lo que las afirmaciones de rendimiento ("99 % de precision FP16", "superior a Q4_K_M") no son verificables de forma independiente.
- La especializacion financiera no elimina el riesgo de alucinacion en datos numericos; se recomienda validacion externa para decisiones de inversion.
- El contexto maximo no esta documentado, lo que dificulta planificar aplicaciones que requieran ventanas largas.
- El modelo esta optimizado para ingles y chino; el rendimiento en otros idiomas de los 201 declarados puede ser significativamente inferior.
- La cuantizacion MoziSmartBit es propietaria y no se especifica si es reproducible con herramientas estandar de cuantizacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chenyumo/moziAI-35B-A3B-MOE-MTP
- Repositorio GitHub (documentacion): https://github.com/junxian66/chenyumo
- Repositorio GitHub (uncensored): https://github.com/chenyumo166/moziAI-35B-A3B-MOE-MTP-Uncensored
- Modelo uncensored en HuggingFace: https://huggingface.co/chenyumo/moziAI-35B-A3B-MOE-MTP-Uncensored
- Modelo en ModelScope: https://www.modelscope.cn/models/chenyumo/moziAI-35B-A3B-MOE-MTP-Uncensored
