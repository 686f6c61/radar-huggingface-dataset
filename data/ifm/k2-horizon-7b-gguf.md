# IFM/K2-Horizon-7B-GGUF

## Resumen

K2-Horizon-7B es un modelo de lenguaje denso (dense) del tipo decoder-only, desarrollado por IFM, que se publica con pesos abiertos bajo licencia Apache 2.0. Forma parte de la familia K2-Horizon y se presenta como el miembro medio de la gama, con un núcleo de 7B que en la práctica se traduce en aproximadamente 9.000 millones de parámetros totales según los safetensors publicados. Su característica más destacada es una ventana de contexto nativa de 524.288 tokens (512K), mantenida desde las etapas intermedias de entrenamiento.

El modelo está diseñado para sobresalir en tareas de razonamiento, programación, matemáticas y uso en agentes, tal como reflejan los benchmarks publicados en su model card. Además, IFM libera de forma completa los datos de entrenamiento (Pretrain y Midtrain), la receta de entrenamiento, el código y los recursos de evaluación, lo que lo convierte en una opción atractiva para investigación y desarrollo reproducible. La versión GGUF aquí descrita está pensada para su uso con llama.cpp, aunque requiere una versión con soporte específico para la arquitectura K2 Horizon, actualmente disponible en un fork de MBZUAI-IFM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (arquitectura K2 Horizon) |
| Parametros totales | 8.999.178.240 (aprox. 9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 524.288 tokens (512K) |
| Tipos de cuantizacion | No disponible (los pesos GGUF se almacenan en BF16 original; no se listan cuantizaciones en la informacion) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tambien safetensors en el repositorio principal) |

## Arquitectura y entrenamiento

K2-Horizon-7B es un modelo denso decoder-only basado en la arquitectura K2 Horizon, que requiere soporte especifico en llama.cpp. El entrenamiento se realizo en dos fases documentadas mediante los datasets publicos IFM/K2-Horizon-Pretrain-Data e IFM/K2-Horizon-Midtrain-Data. La ventana de contexto de 512K tokens se mantiene desde la etapa de midtraining en adelante.

No se proporcionan en la informacion disponible detalles sobre el numero total de tokens de entrenamiento, la composicion exacta de los datasets ni la presencia de tecnicas como RLHF o DPO. Tampoco se describen innovaciones tecnicas concretas mas alla de la arquitectura propia y la ventana de contexto amplia. IFM libera el codigo de entrenamiento y los recursos de evaluacion, pero estos no se detallan en la model card de esta version GGUF.

## Capacidades

- Razonamiento matematico de nivel competitivo: obtiene 73.3 en HMMT Feb 2026, superando a modelos de referencia como Gemma 4-12B (63.1) o Qwen3.5-9B (65.7).
- Programacion y resolucion de problemas de software: alcanza 70.6 en SWE-bench Verified, con una ventaja notable frente a modelos de tamano similar.
- Manejo de contexto largo: la ventana nativa de 512K tokens permite procesar documentos extensos, repositorios de codigo completos o conversaciones de multiples turnos sin perder informacion.
- Uso en agentes: el modelo fue evaluado en benchmarks de tipo agentico, segun la model card, aunque no se detallan los resultados concretos.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede desplegarse en infraestructuras de inferencia estandar, aunque no se especifica el soporte de tool calling o function calling.
- Capacidad conversacional: incluye una plantilla de chat compatible con llama.cpp en los archivos GGUF.

## Casos de uso

- Analisis de repositorios de codigo completos: gracias a la ventana de 512K tokens, el modelo puede ingerir un proyecto entero y responder preguntas sobre su estructura, funciones o dependencias sin necesidad de dividir el contexto.
- Asistente de programacion en entornos de desarrollo integrado: su rendimiento en SWE-bench Verified lo hace adecuado para sugerir parches, detectar errores o refactorizar codigo en pipelines de CI/CD.
- Resolucion de problemas matematicos avanzados: el resultado en HMMT Feb 2026 indica que puede utilizarse como apoyo en plataformas educativas o de preparacion de competiciones, generando explicaciones paso a paso.
- Procesamiento de documentos legales o tecnicos extensos: la ventana de contexto permite analizar contratos, expedientes o manuales de cientos de paginas y extraer clausulas o requisitos especificos.
- Investigacion reproducible en NLP: al estar publicados los datos de entrenamiento, el modelo sirve como base para estudios de ablacion, analisis de capacidades emergentes o comparaciones entre checkpoints intermedios.
- Despliegue en entornos locales con llama.cpp: al existir versiones GGUF, puede ejecutarse en maquinas de consumo mediante el fork de llama.cpp con soporte K2 Horizon, ideal para prototipado sin dependencias de la nube.

## Benchmarks y rendimiento

Los datos disponibles en la model card son parciales y se limitan a dos benchmarks. No se incluyen resultados completos en la informacion proporcionada.

| Benchmark | K2-Horizon-7B | Gemma 4-12B | Qwen3.5-9B | Granite 4.2-8B |
|---|---|---|---|---|
| HMMT Feb 2026 (matematicas) | 73.3 | 63.1 | 65.7 | 66.5 |
| SWE-bench Verified (software) | 70.6 | 30.6 | No disponible | 47.7 |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 8.999.178.240 parametros. En precision BF16, el peso ocupa aproximadamente 18 GB, por lo que se necesitan al menos 20-24 GB de VRAM para inferencia sin cuantizar.
- Con cuantizaciones GGUF (por ejemplo, Q4_K_M), el peso se reduce a unos 6-7 GB, lo que permitiria ejecutarlo en GPUs de consumo con 8-12 GB de VRAM, aunque no se han publicado los archivos de cuantizacion en esta version.
- GPU recomendadas: RTX 4090 (24 GB) para BF16, A100 40/80 GB o H100 para despliegues de produccion con contexto largo.
- Opciones de despliegue: llama.cpp (requiere el fork de MBZUAI-IFM con soporte K2 Horizon). No se mencionan vLLM, TGI u otros servidores en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La comparativa se basa unicamente en los benchmarks publicados en la model card, ya que no se dispone de especificaciones tecnicas completas de los modelos de referencia.

| Modelo | Parametros | Contexto | HMMT Feb 2026 | SWE-bench Verified | Licencia |
|---|---|---|---|---|---|
| K2-Horizon-7B | 9B (aprox.) | 512K | 73.3 | 70.6 | Apache 2.0 |
| Gemma 4-12B | No disponible | No disponible | 63.1 | 30.6 | No disponible |
| Qwen3.5-9B | No disponible | No disponible | 65.7 | No disponible | No disponible |
| Granite 4.2-8B | No disponible | No disponible | 66.5 | 47.7 | No disponible |

## Limitaciones y advertencias

- La informacion disponible no incluye analisis de sesgos ni pruebas de seguridad, por lo que se desconocen posibles sesgos del modelo.
- El modelo solo soporta ingles, lo que limita su uso en aplicaciones multilingues.
- Al no documentarse el soporte de tool calling o function calling, su integracion en sistemas de agentes complejos requiere verificacion previa.
- La version GGUF exige una version de llama.cpp con soporte K2 Horizon; el soporte oficial aun esta en proceso de integracion (PR en curso).
- La ventana de contexto de 512K tokens es amplia, pero no se especifica la calidad de la recuperacion de informacion en los extremos de la ventana ni la degradacion del rendimiento con contextos muy largos.
- Los benchmarks publicados son parciales y no incluyen pruebas de alucinacion, razonamiento de sentido comun ni tareas de seguridad.
- Aunque la licencia Apache 2.0 permite uso comercial, la dependencia de un fork de llama.cpp puede suponer un riesgo de mantenimiento si el soporte no se integra en el proyecto principal.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/IFM/K2-Horizon-7B-GGUF
- Repositorio principal del modelo: https://huggingface.co/IFM/K2-Horizon-7B
- Fork de llama.cpp con soporte K2 Horizon: https://github.com/MBZUAI-IFM/llama.cpp/tree/model/K2Horizon
