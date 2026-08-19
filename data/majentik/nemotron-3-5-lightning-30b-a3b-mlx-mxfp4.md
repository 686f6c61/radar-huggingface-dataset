# majentik/Nemotron-3.5-Lightning-30B-A3B-MLX-MXFP4

## Resumen

Nemotron-3.5-Lightning-30B-A3B-MLX-MXFP4 es una variante cuantizada del modelo NVIDIA Nemotron 3.5 Lightning 30B A3B, preparada específicamente para ejecutarse en hardware de Apple mediante la librería MLX. El modelo original, desarrollado por NVIDIA, es un transformador de mezcla de expertos (MoE) con 30 mil millones de parámetros totales y 3 mil millones activos por token, lo que permite un rendimiento elevado con un coste computacional reducido. Esta versión concreta aplica cuantización MXFP4 (4 bits, grupo de 32) sobre los pesos, reduciendo el tamaño del repositorio a 16,8 GB y haciendo posible su uso en Macs con memoria unificada sin necesidad de GPUs dedicadas.

La relevancia de este modelo radica en que acerca un LLM de gran tamaño a entornos de consumo habituales, como portátiles y equipos de escritorio de Apple, manteniendo la capacidad de generación de texto y conversación del modelo base. La cuantización MXFP4 es un formato de precisión mixta optimizado para MLX, que ofrece un equilibrio entre tamaño y calidad de salida. El modelo está disponible bajo la licencia OpenMDW v1.1, permisiva para uso comercial, y se distribuye en formato safetensors compatible con mlx-lm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), familia Nemotron-H |
| Parametros totales | 30 mil millones (modelo base); pesos cuantizados en safetensors: 5.928.065.856 |
| Parametros activos | 3 mil millones (por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (4 bits, grupo de 32); tambien disponibles versiones de 2 a 8 bits |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW v1.1 (openmdw-1.1) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es un transformador de mezcla de expertos (MoE) con arquitectura Nemotron-H, desarrollado por NVIDIA. En un MoE, solo se activan 3 mil millones de los 30 mil millones de parametros por cada token procesado, lo que reduce la carga computacional en inferencia manteniendo una capacidad total elevada. No se dispone de informacion detallada sobre el proceso de entrenamiento del modelo original (datos, numero de tokens, tecnicas de alineacion) en la documentacion proporcionada.

La version aqui descrita es una cuantizacion realizada con la herramienta `mlx_lm.convert` (version 0.31.3) de mlx-lm, que convierte los pesos BF16 originales al formato MXFP4 con un tamaño de grupo de 32. Este proceso reduce el espacio en disco de aproximadamente 60 GB (estimado para el BF16) a 16,8 GB, manteniendo la estructura del modelo y permitiendo su carga en memoria unificada de Apple. El repositorio incluye una verificacion de coherencia ("smoke gate") que confirma que la generacion de texto tras la cuantizacion no produce bucles vacios ni artefactos de tokens especiales.

## Capacidades

- Generacion de texto libre y conversacion multi-turno, dado su pipeline de text-generation y etiqueta "conversational".
- Razonamiento y comprension del lenguaje natural, inherentes a un modelo de 30B con 3B activos, aunque no se especifican capacidades concretas en la documentacion.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo de pensamiento, vision o audio: no disponible.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede ejecutarse completamente en un equipo Apple con suficiente memoria unificada, permitiendo mantener conversaciones de chat sin conexion a internet y con privacidad de datos.
- Generacion de borradores de texto en entornos de desarrollo: por su naturaleza de generacion de lenguaje, puede usarse para redactar documentacion, correos o contenido creativo directamente desde la terminal mediante `mlx_lm.generate`.
- Prototipado rapido de aplicaciones de IA en Apple silicon: al estar integrado con MLX, es adecuado para desarrolladores que quieran experimentar con LLMs en hardware de Apple sin necesidad de GPUs externas.
- Educacion e investigacion: permite estudiar el comportamiento de un MoE de gran tamano en un entorno local, analizando sus respuestas y limitaciones sin costes de API.
- Despliegue en entornos con restricciones de hardware: al ocupar solo 16,8 GB, puede alojarse en equipos con 32 GB de RAM unificada, facilitando su uso en laboratorios o aulas con recursos limitados.
- Integracion en pipelines de generacion de texto con MLX: desarrolladores que ya usan mlx-lm pueden sustituir modelos mas pequeños por este para obtener mayor calidad de salida en tareas de redaccion o resumen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al ser un modelo MLX, utiliza memoria unificada del sistema. El tamano del repositorio es de 16,8 GB, por lo que se recomienda un Mac con al menos 24 GB de RAM unificada para cargar el modelo con margen para el contexto y la generacion.
- GPU recomendadas: no requiere GPU dedicada; funciona en cualquier chip Apple Silicon (M1, M2, M3, M4 y posteriores) con suficiente memoria unificada.
- Compatibilidad con GPU de consumo: no aplicable, el formato MLX esta optimizado para Apple Silicon.
- Opciones de despliegue: mediante `mlx_lm.generate` o integracion en aplicaciones con la libreria mlx-lm. No se mencionan otras herramientas como vLLM, llama.cpp u Ollama.
- Latencia y throughput: no se proporcionan datos concretos, pero al activar solo 3B parametros por token, se espera una velocidad de generacion aceptable en hardware Apple de gama media-alta.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion MXFP4 de 4 bits puede introducir una degradacion en la calidad de las respuestas en comparacion con el modelo BF16 original, especialmente en tareas que requieren precision numerica o razonamiento complejo.
- El modelo esta optimizado exclusivamente para Apple Silicon mediante MLX; no es compatible directamente con CUDA, ROCm u otros backends.
- No se ha publicado informacion sobre sesgos, riesgos de alucinacion o limitaciones de contexto o idioma.
- La licencia OpenMDW v1.1 es permisiva y permite uso comercial, pero se recomienda revisar los terminos completos en https://openmdw.ai/license/1-1/ antes de su implementacion en produccion.
- No se garantiza la disponibilidad de actualizaciones o soporte tecnico por parte del autor del repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/majentik/Nemotron-3.5-Lightning-30B-A3B-MLX-MXFP4
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Licencia OpenMDW v1.1: https://openmdw.ai/license/1-1/
- Libreria mlx-lm: https://github.com/ml-explore/mlx-lm
- Otras versiones cuantizadas del mismo autor: https://huggingface.co/majentik (repositorios de 2bit a 8bit)
