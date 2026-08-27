# mradermacher/Borealis-Code-1.0-i1-GGUF

## Resumen

Borealis-Code-1.0-i1-GGUF es una colección de cuantizaciones GGUF con imatrix del modelo Borealis-Code-1.0, desarrollado por KellHect y cuantizado por mradermacher. El modelo base es un transformer de mezcla de expertos (MoE) de aproximadamente 30.5 mil millones de parámetros, orientado a tareas de generación de código y conversación, y liberado bajo licencia Apache 2.0. La versión cuantizada permite ejecutar el modelo en hardware más modesto que el necesario para los pesos originales, ofreciendo múltiples niveles de compresión que van desde 7.2 GB hasta 25.2 GB.

La relevancia de esta publicación radica en que facilita el despliegue local de un modelo de código de gran tamaño mediante formatos GGUF compatibles con llama.cpp, Ollama y otros motores de inferencia. Además, el modelo base está marcado como "abliterated" y "uncensored", lo que lo hace interesante para investigación en seguridad de IA y red-teaming, aunque implica riesgos de contenido inapropiado. La cuantización con imatrix mejora la calidad de los pesos comprimidos en comparación con cuantizaciones estáticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (arquitectura Cohere 2, segun tags) |
| Parametros totales | 30.484.303.872 (30.5B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_M, IQ2_XXS, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q6_K (todos con imatrix) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con imatrix) |

## Arquitectura y entrenamiento

La informacion disponible no detalla el proceso de entrenamiento del modelo base. Los tags indican que se trata de una arquitectura MoE basada en Cohere 2, con un total de 30.5B parametros, aunque se desconoce el numero de parametros activos por token. El modelo ha sido sometido a un proceso de "abliteration" (eliminacion de comportamientos no deseados) y se presenta como "uncensored", lo que sugiere que se ha eliminado la moderacion de contenido para fines de investigacion en seguridad de IA.

La cuantizacion realizada por mradermacher utiliza la tecnica imatrix (importance matrix) para calcular los pesos cuantizados, lo que generalmente produce mejor calidad que las cuantizaciones estaticas a igual tamaño. Se ofrecen 14 niveles de cuantizacion, desde IQ1_M (7.2 GB) hasta Q6_K (25.2 GB), cubriendo un amplio espectro de compromiso entre tamano y fidelidad.

## Capacidades

- Generacion de codigo fuente en multiples lenguajes de programacion, dado el enfoque del modelo base.
- Conversacion y asistencia en tareas de programacion, con soporte para dialogos multi-turno.
- Capacidad de razonamiento logico y matematico, comun en modelos de codigo de gran tamano.
- Al estar "abliterated", no aplica filtros de contenido, lo que permite explorar respuestas sin censura (util para red-teaming).
- Compatible con herramientas de inferencia que soporten GGUF, como llama.cpp, Ollama y text-generation-webui.
- Soporte para cuantizacion con imatrix, que mejora la precision en tareas de codigo y razonamiento.

## Casos de uso

- Asistente de programacion local: el modelo puede integrarse en entornos de desarrollo (VS Code, Neovim) mediante servidores compatibles con GGUF para autocompletado y generacion de funciones, aprovechando su capacidad de generar codigo sintacticamente correcto.
- Analisis estatico de codigo: con una ventana de contexto suficiente (aunque no se especifica), puede revisar fragmentos de codigo y detectar posibles errores o vulnerabilidades, aunque se requiere validacion humana.
- Generacion de documentacion tecnica: a partir de codigo fuente, el modelo puede redactar comentarios, docstrings y manuales de uso, reduciendo el trabajo manual en proyectos open source.
- Investigacion en seguridad de IA: al ser "uncensored", permite probar respuestas ante prompts malintencionados o explorar sesgos sin restricciones, util para equipos de red-team.
- Educacion y formacion en programacion: puede usarse como tutor interactivo que explica conceptos de codigo y resuelve dudas, siempre que se supervise el contenido generado.
- Prototipado rapido: en entornos con recursos limitados, la cuantizacion Q4_K_M (18.7 GB) permite ejecutar el modelo en una GPU de 24 GB, acelerando la creacion de scripts y herramientas sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras metricas estandar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del nivel de cuantizacion. El archivo mas pequeno (IQ1_M, 7.2 GB) puede caber en GPUs con 8-10 GB de VRAM, aunque con perdida significativa de calidad. El Q4_K_M (18.7 GB) requiere al menos 20-24 GB de VRAM para una ejecucion comoda.
- GPU recomendadas: para cuantizaciones de 4 bits (Q4_K_M, IQ4_XS) se recomienda una RTX 3090/4090 (24 GB) o una A100 (40 GB) para mayor margen. Para cuantizaciones de 6 bits (Q6_K, 25.2 GB) se necesita una GPU con 32 GB o mas, como A100 40GB o H100.
- En consumer GPU: las cuantizaciones IQ1_M, IQ2_XXS e IQ2_M (7.2-10.3 GB) pueden ejecutarse en GPUs de gama media como RTX 3060 (12 GB) o RTX 4070 (12 GB), aunque con calidad reducida.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-webui, LM Studio y cualquier motor compatible con GGUF. Tambien se puede usar con vLLM si se convierte a otro formato, aunque no es el proposito principal.
- Latencia y throughput: no se dispone de mediciones concretas. En general, los modelos MoE de 30B cuantizados a 4 bits pueden generar entre 10 y 30 tokens por segundo en una RTX 4090, dependiendo del numero de parametros activos (desconocido aqui).

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa directa con otros modelos de codigo de tamano similar (por ejemplo, CodeLlama 34B, DeepSeek-Coder 33B o Mixtral 8x22B). Los datos de parametros activos, contexto y rendimiento del modelo base no estan publicados en la informacion proporcionada. Se recomienda consultar la pagina del modelo base (KellHect/Borealis-Code-1.0) para obtener mas detalles.

## Limitaciones y advertencias

- Al ser "uncensored" y "abliterated", el modelo puede generar contenido ofensivo, ilegal o peligroso si se le solicita. No es apto para despliegue en produccion sin filtros de moderacion adicionales.
- Solo soporta ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- La longitud de contexto no esta especificada, lo que limita su uso en tareas que requieran ventanas muy largas (por ejemplo, analisis de repositorios completos).
- Las cuantizaciones de baja precision (IQ1_M, IQ2_XXS) pueden degradar significativamente la calidad de las respuestas, especialmente en tareas de razonamiento complejo.
- No se han publicado benchmarks oficiales, por lo que el rendimiento real en tareas de codigo es incierto.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales no documentadas en esta ficha.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Borealis-Code-1.0-i1-GGUF
- Modelo base: https://huggingface.co/KellHect/Borealis-Code-1.0
- Version estatica de cuantizaciones: https://huggingface.co/mradermacher/Borealis-Code-1.0-GGUF
- Perfil del cuantizador: https://huggingface.co/mradermacher
