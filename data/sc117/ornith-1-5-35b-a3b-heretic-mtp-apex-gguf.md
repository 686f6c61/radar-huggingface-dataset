# SC117/Ornith-1.5-35B-A3B-Heretic-MTP-APEX-GGUF

## Resumen

Ornith-1.5-35B-A3B-Heretic-MTP-APEX-GGUF es una distribucion cuantizada en formato GGUF del modelo Ornith-1.5-35B-A3B, un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por DeepReinforce y publicado en Hugging Face bajo el identificador ornith-ai/Ornith-1.5-35B-A3B. La variante aqui descrita ha sido producida por el usuario SC117 y aplica tres modificaciones sobre el modelo base: la fusion del LoRA del Trial 62 de Heretic 1.4.0 (una tecnica de ablacion de rechazos), la sustitucion de la cabeza MTP nativa por una cabeza fusionada de 19 tensores procedente de shisa-ai/Ornith-1.5-35B-A3B-MTP-ONLY, y la cuantizacion con el esquema APEX en formato GGUF.

El modelo resuelve tareas de generacion de texto, razonamiento y codigo agentico, con un diseno orientado a despliegues de inferencia eficientes: aunque declara 35B parametros totales, solo activa 3B por token gracias a una arquitectura MoE con 256 expertos y 8 activos. Esa relacion permite ejecutar el modelo con requisitos de computo cercanos a los de un modelo denso de 3B, manteniendo la calidad de un modelo de mayor capacidad. El contexto declarado alcanza los 262.144 tokens.

La relevancia actual de esta ficha radica en que combina una licencia permisiva (MIT), soporte multimodal (incluye proyector mmproj), una ventana de contexto muy amplia y un formato GGUF listo para llama.cpp y derivados. No obstante, se trata de una modificacion experimental: la card advierte explicitamente de que los modelos con rechazos modificados pueden comportarse de forma distinta al original y deben evaluarse antes de su despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE, multimodal (transformer con mezcla de expertos) |
| Parametros totales | 35B (declarado por el autor); el campo de parametros del repo safetensors indica 446.571.248, dato no coherente con la card |
| Parametros activos | 3B por token (256 expertos, 8 activos) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GGUF con esquema APEX (cabeza MTP en Q8_0); niveles concretos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (repo de 82,1 GB); modelo base en safetensors/BF16 |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture of Experts con 40 capas y 256 expertos, de los cuales se activan 8 por token, lo que resulta en 3B parametros activos sobre 35B totales. Sobre esa pila se anade una capa MTP (multi-token prediction) fusionada que comprende 19 tensores y que en esta distribucion se cuantiza en Q8_0. La capa MTP nativa del modelo original estaba sin entrenar (estadisticas propias de una inicializacion), por lo que el autor la sustituye por la cabeza de shisa-ai/Ornith-1.5-35B-A3B-MTP-ONLY, descrita como un injerto sobre Qwen3.6 con destilacion KL de 12K. Esta sustitucion es relevante porque habilita la decodificacion especulativa basada en MTP, que puede mejorar el throughput de generacion.

En cuanto al entrenamiento, la informacion disponible no detalla el volumen de tokens, la composicion del dataset ni si se aplicaron fases de RLHF o DPO en el modelo base. Lo que si se documenta es el post-entrenamiento aplicado en esta variante: la fusion del LoRA del Trial 62 (de un total de 80) del pipeline Heretic 1.4.0 sobre los pesos BF16, una tecnica de ablacion de direcciones de rechazo. Ademas, el modelo incorpora un proyector multimodal (mmproj) en el paquete GGUF, lo que sugiere capacidad de entrada de imagenes, aunque la card no detalla la arquitectura de vision ni los datos multimodales empleados.

## Capacidades

- Generacion de texto y razonamiento general, con etiqueta explicita de reasoning en el modelo base.
- Codigo agentico (agentic-coding): el modelo base esta orientado a tareas de programacion con uso de herramientas y multiples pasos.
- Soporte multimodal: el repo incluye un proyector mmproj, lo que habilita entrada de imagenes junto con texto.
- Decodificacion especulativa mediante la cabeza MTP fusionada, orientada a reducir la latencia de generacion.
- Ventana de contexto de 262.144 tokens, adecuada para documentos largos y sesiones prolongadas.
- Compatibilidad con endpoints (etiqueta endpoints_compatible), lo que facilita su despliegue en infraestructuras de inferencia gestionadas.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte explicito de tool calling y function calling: no documentado en la informacion disponible.

## Casos de uso

- Asistencia a la programacion en repositorios grandes: con 262.144 tokens de contexto, el modelo puede recibir varios ficheros y el historial de cambios en una sola ventana, lo que resulta util para revisiones de codigo y refactorizaciones que requieren vision global del proyecto.
- Agentes de codigo multi-paso: la orientacion agentic-coding del modelo base y la cabeza MTP permiten construir bucles de planificacion, edicion y verificacion con menor latencia por token generado.
- Procesamiento de documentacion tecnica extensa: informes, manuales o expedientes que superan ampliamente los 100K tokens pueden analizarse sin troceado agresivo, preservando el contexto entre secciones.
- Analisis de capturas y diagramas: gracias al proyector mmproj incluido, es posible enviar imagenes de interfaces, diagramas de arquitectura o graficos junto con instrucciones textuales para su interpretacion.
- Despliegue en hardware de gama alta para consumo: al ser GGUF y activar solo 3B parametros por token, puede ejecutarse en estaciones de trabajo con GPU consumer de gran capacidad de VRAM o en configuraciones con offload parcial a CPU mediante llama.cpp.
- Prototipado e investigacion sobre alineacion: al incorporar la ablacion de rechazos de Heretic, sirve como material de estudio para analizar como cambia el comportamiento del modelo al modificar sus direcciones de rechazo, siempre con evaluacion previa.
- Servicios de generacion de texto autoalojados: la licencia MIT y el formato GGUF permiten integrar el modelo en productos comerciales sin las restricciones de licencias copyleft o de uso limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo GGUF ocupa 82,1 GB, por lo que una cuantizacion de alta calidad requiere del orden de 80 GB de VRAM o una combinacion de VRAM y memoria del sistema. Con cuantizaciones mas agresivas el requisito baja proporcionalmente, aunque los niveles APEX concretos no estan documentados.
- GPU recomendadas: A100 de 80 GB o H100 para ejecutar el modelo completo en VRAM; configuraciones multi-GPU para servir con paralelismo tensorial.
- GPU consumer: no cabe en tarjetas de 24 GB en cuantizaciones altas; es viable en GPUs de 48 GB o mediante offload parcial a CPU en llama.cpp, a costa de latencia.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio) por el formato GGUF; vLLM y TGI no soportan GGUF de forma nativa para este tipo de arquitectura, por lo que requeririan los pesos safetensors del modelo base.
- Latencia y throughput: no disponibles. La sustitucion de la cabeza MTP por una entrenada sugiere mejoras en decodificacion especulativa, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-Heretic-MTP-APEX-GGUF | 35B | 3B | 262.144 | MIT | GGUF | Variante experimental con ablacion de rechazos y MTP fusionada |
| ornith-ai/Ornith-1.5-35B-A3B | 35B | 3B | 262.144 | MIT | safetensors/BF16 | Modelo base sin modificaciones; referencia para comparar el efecto de Heretic |
| shisa-ai/Ornith-1.5-35B-A3B-MTP-ONLY | 35B | 3B | no disponible | no disponible | no disponible | Aporta la cabeza MTP fusionada usada en esta variante |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental: la card advierte de que los modelos con rechazos modificados pueden comportarse de forma distinta al original y deben evaluarse antes de desplegarse.
- La cabeza MTP nativa estaba sin entrenar; la sustitucion procede de un tercero (shisa-ai) y su comportamiento en esta combinacion concreta no esta validado de forma independiente.
- Riesgo de alucinacion inherente a los modelos generativos; no se documentan evaluaciones de factualidad para esta variante.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento adecuado fuera del ingles sin evaluacion previa.
- La ablacion de rechazos puede reducir las negativas del modelo ante solicitudes problematicas, lo que exige filtros y politicas de uso adicionales en produccion.
- Incoherencia en los metadatos: el campo de parametros del repo safetensors indica 446.571.248, muy alejado de los 35B declarados; conviene verificar los pesos antes de usarlos en pipelines automatizados.
- El tamano del repo (82,1 GB) implica requisitos de almacenamiento y de ancho de banda considerables para su descarga y despliegue.
- Aunque la licencia es MIT, la procedencia de componentes de terceros (Heretic, shisa-ai, Qwen3.6) debe revisarse para confirmar el cumplimiento en uso comercial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SC117/Ornith-1.5-35B-A3B-Heretic-MTP-APEX-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Licencia del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B/blob/main/LICENSE
- Cabeza MTP fusionada: https://huggingface.co/shisa-ai/Ornith-1.5-35B-A3B-MTP-ONLY
- Proyecto Heretic: https://github.com/p-e-w/heretic
- Documentacion en chino: https://huggingface.co/SC117/Ornith-1.5-35B-A3B-Heretic-MTP-APEX-GGUF/blob/main/README_zh.md
