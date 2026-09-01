# OliviaRossi/4BeastsOfApocalypse-APEX-GGUF

## Resumen

El modelo 4BeastsOfApocalypse, desarrollado por OliviaRossi, es un modelo de lenguaje de tipo Mixture of Experts (MoE) basado en la arquitectura Qwen3.5 MoE. Con 35 mil millones de parámetros totales y 3 mil millones activos, está diseñado para tareas de agente, generación de código, razonamiento y tool-calling, con soporte multilingüe para inglés y chino. La versión APEX-GGUF aplica una cuantización adaptativa específica para modelos MoE, lo que permite reducir el tamaño del modelo y facilitar su despliegue en hardware con recursos limitados. Su licencia Apache 2.0 lo hace atractivo para uso comercial y de investigación.

La relevancia de este modelo radica en su combinación de eficiencia (MoE con pocos parámetros activos) y capacidades avanzadas de agente, lo que lo posiciona como una opción interesante para aplicaciones de automatización y desarrollo de software asistido por IA. La cuantización APEX, desarrollada por la comunidad localai-org, optimiza la precisión por capas y componentes, mejorando el rendimiento en comparación con cuantizaciones uniformes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Qwen3.5 MoE |
| Parametros totales | 35 mil millones (35B) |
| Parametros activos | 3 mil millones (3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | APEX (cuantizacion adaptativa para MoE) en formato GGUF |
| Idiomas soportados | ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE con 35B parámetros totales y 3B activos por token, siguiendo el diseño de Qwen3.5 MoE. Esta configuración permite un equilibrio entre capacidad y eficiencia computacional, ya que solo se activa una fracción de los parámetros en cada paso de inferencia. No se dispone de información detallada sobre el proceso de entrenamiento, como el número de tokens o la composición del dataset. La cuantización APEX, aplicada en esta versión GGUF, utiliza el flag `--tensor-type-file` de llama.cpp para asignar precisiones por capa y por componente, optimizando el rendimiento en modelos MoE.

## Capacidades

- Generacion de texto y razonamiento avanzado.
- Generacion de codigo y soporte para tareas de ingenieria de software.
- Tool-calling y function calling, permitiendo integracion con APIs y herramientas externas.
- Capacidades de agente y razonamiento multi-paso, adecuado para flujos de trabajo autonomos.
- Soporte conversacional y de agente en entornos de terminal (sweet-agent).
- Multilingue: ingles y chino.

## Casos de uso

- Asistentes de codigo en produccion: el modelo puede integrarse en pipelines de CI/CD para generar, revisar y corregir codigo, gracias a su capacidad de tool-calling y su entrenamiento en tareas de ingenieria de software.
- Agentes autonomos para automatizacion de tareas: su soporte para razonamiento multi-paso y tool-calling permite construir agentes que interactuan con APIs, bases de datos y sistemas externos.
- Chatbots conversacionales bilingues: al soportar ingles y chino, puede desplegarse en atencion al cliente o asistentes virtuales para audiencias hispanohablantes que requieran esos idiomas.
- Desarrollo de herramientas de terminal: su integracion con sweet-agent lo hace util para crear asistentes de linea de comandos que ejecuten comandos, gestionen archivos y automaticen tareas del sistema.
- Prototipado rapido de aplicaciones de IA: al ser un modelo GGUF cuantizado, puede ejecutarse en hardware de consumo, facilitando la experimentacion y el desarrollo local.
- Investigacion en modelos MoE: su arquitectura y cuantizacion APEX ofrecen un caso de estudio para evaluar tecnicas de compresion en modelos de mezcla de expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con exactitud, pero al ser un modelo GGUF de 35B cuantizado, se estima que la version completa requiere alrededor de 32 GB de VRAM (segun el tamano de archivo observado en modelos similares de la misma serie).
- GPU recomendadas: para la cuantizacion completa, se requieren GPUs con al menos 32 GB de VRAM, como NVIDIA A100, RTX 4090 o superiores. Para cuantizaciones mas agresivas, podria caber en GPUs de 24 GB.
- Opciones de despliegue: compatible con llama.cpp, Ollama, vLLM y otros motores que soporten GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos de la misma categoria. Se puede mencionar que, por su tamano y arquitectura, es comparable a otros modelos MoE de 35B como Qwen3.5 MoE, pero no hay datos de rendimiento publicados.

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos especificos del modelo.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de razonamiento complejo.
- La longitud de contexto no esta documentada, lo que limita la planificacion de aplicaciones que requieran ventanas largas.
- Aunque la licencia es Apache 2.0, la version GGUF puede tener restricciones adicionales no documentadas.
- La cuantizacion APEX puede introducir degradacion de calidad en comparacion con el modelo original en precision completa.

## Enlaces

- [Modelo GGUF en HuggingFace](https://huggingface.co/OliviaRossi/4BeastsOfApocalypse-APEX-GGUF)
- [Modelo base en HuggingFace](https://huggingface.co/OliviaRossi/4BeastsOfApocalypse)
- [Repositorio de cuantizacion APEX](https://github.com/localai-org/apex-quant)
