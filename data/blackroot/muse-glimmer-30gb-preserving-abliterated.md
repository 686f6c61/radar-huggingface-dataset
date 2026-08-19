# Blackroot/Muse-Glimmer-30GB-Preserving-Abliterated

## Resumen

Muse Glimmer es un modelo de lenguaje causal denso de aproximadamente 29,6 mil millones de parámetros, desarrollado por Meta Superintelligence Lab y publicado bajo licencia Apache 2.0. Está diseñado específicamente para tareas agénticas en hardware de consumo, integrando razonamiento multi-paso, uso fiable de herramientas, comprensión multimodal (texto e imagen) y recuperación ante fallos en un único modelo que puede ejecutarse localmente sin conexión. La versión alojada en este repositorio, «Preserving-Abliterated», es una adaptación realizada por el usuario Blackroot que aplica técnicas de abliteración (eliminación de direcciones de activación asociadas a comportamientos no deseados) preservando las capacidades funcionales del modelo original.

El modelo combina un transformer denso con un encoder de percepción ViT-G/14 de aproximadamente 1,8 mil millones de parámetros, alcanzando una ventana de contexto de 131 072 tokens. Su entrenamiento incluye datos multimodales de fuentes públicas y de productos de Meta, con un corte de conocimiento en enero de 2026. La relevancia actual del modelo radica en su optimización para despliegue local, con cuantizaciones que permiten ejecutarlo en GPUs de 24 GB o 32 GB de VRAM, y en su compatibilidad con marcos de orquestación de agentes como OpenClaw o Hermes Agent.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con encoder de percepcion (ViT-G/14) |
| Parametros totales | 29 776 626 688 (~29,6 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131 072+ tokens |
| Tipos de cuantizacion | No disponibles en este repositorio; la documentacion menciona K-Quant-Dynamic y K-Quant-17GB |
| Idiomas soportados | Mas de 100 idiomas (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (59,6 GB, probablemente FP16/BF16) |

## Arquitectura y entrenamiento

Muse Glimmer emplea un transformer causal denso con un patron de atencion mixto: capas con ventana deslizante local de 2048 tokens y capas globales, repitiendose el patron [Local, Local, Local, Global]. La atencion es gated, con 32 cabezas de consulta y 2 cabezas de clave/valor (GQA ratio 16:1), dimension de cabeza 128 y dimension oculta 6656. La red feed-forward usa SwiGLU con dimension intermedia 19 968. La codificacion posicional es RoPE con theta 500 000, aplicada solo en las capas locales. El encoder de percepcion es un ViT-G/14 de 50 capas, ancho 1536 y parche de 14 pixeles, que genera hasta 4096 tokens visuales por imagen.

El entrenamiento se realizo sobre contenido multimodal de fuentes publicas, datos de terceros y productos de Meta, curado y enriquecido por redes de proveedores externos y personal de Meta. El corte de conocimiento es el 4 de enero de 2026. La version abliterada de Blackroot no incluye informacion adicional sobre el proceso de entrenamiento o la metodologia de abliteracion aplicada, mas alla de lo indicado en el nombre del repositorio.

## Capacidades

- Generacion de texto y razonamiento multi-paso sobre horizontes largos, manteniendo planes coherentes en flujos de trabajo complejos.
- Uso fiable de herramientas (tool calling): invoca funciones con esquemas precisos durante workflows extendidos.
- Comprension multimodal: acepta texto e imagenes intercaladas, permitiendo interpretar capturas de pantalla, graficos y documentos.
- Recuperacion ante fallos: diagnostica errores en llamadas a herramientas y reintenta en lugar de detenerse.
- Compatibilidad con scaffolds de agentes: funciona con OpenClaw, Hermes Agent y otros patrones de orquestacion.
- Esfuerzo controlable: soporta distintos niveles de razonamiento para equilibrar calidad y velocidad.
- Capacidad multilingue: entrenado con datos de mas de 100 idiomas.
- Decodificacion especulativa mediante el modelo auxiliar DFlash, que propone bloques de 16 tokens para acelerar la generacion.

## Casos de uso

- Automatizacion de tareas agénticas en local: el modelo puede ejecutar flujos completos de principio a fin (por ejemplo, buscar informacion, procesar documentos y generar respuestas) sin depender de la nube, gracias a su contexto de 131 072 tokens y su capacidad de recuperacion ante errores.
- Asistente de codigo con depuracion autonoma: integrado en un scaffold como OpenClaw, puede escribir, ejecutar y corregir codigo en multiples iteraciones, aprovechando su tool calling y razonamiento multi-paso.
- Analisis de documentos mixtos (texto e imagen): gracias al encoder de percepcion, puede procesar informes con graficos, diagramas o capturas de pantalla y responder preguntas sobre ellos, util en entornos de soporte tecnico o investigacion.
- Agente de atencion al cliente con contexto largo: gestiona conversaciones multi-turno manteniendo el historial completo y accediendo a bases de conocimiento externas mediante herramientas, adecuado para despliegue en hardware modesto.
- Asistente personal offline: al ejecutarse en un portatil con GPU de 24 GB, ofrece respuestas razonadas y ejecucion de tareas (envio de correos, busquedas web, gestion de calendario) sin conexion a internet.
- Prototipado de agentes de investigacion: su capacidad de razonamiento controlable permite ajustar el esfuerzo computacional segun la complejidad de la tarea, util para experimentos de busqueda profunda (deep search) o resolucion de incidencias en repositorios (SWE-Bench).

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card menciona que el modelo alcanza "strong success rates" en DeepSearch QA, MCP-Atlas, τ3-Bench y SWE-Bench, pero no proporciona cifras concretas. Tampoco se incluyen comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en precision completa requiere aproximadamente 64 GB de VRAM. Con cuantizacion K-Quant-Dynamic se reduce a 32 GB, y con K-Quant-17GB a 24 GB, segun la documentacion.
- GPU recomendadas: Nvidia RTX 5090 (24 GB) para la version cuantizada a 17 GB; Apple M4 Max o M5 Max para ejecucion local en portatiles.
- Velocidades medidas (según la model card, con batch size 1 y greedy decoding):
  - RTX 5090: 74,9 tok/s sin especulacion, 233,4 tok/s con DFlash (3,1x).
  - Apple M4 Max: 23,7 tok/s sin especulacion, 37,8 tok/s con DFlash (1,5x).
  - Apple M5 Max: 26,6 tok/s sin especulacion, 50,2 tok/s con DFlash (1,8x).
- Opciones de despliegue: compatible con transformers (libreria indicada), y por su naturaleza local podria usarse con vLLM, llama.cpp u Ollama, aunque no se mencionan explicitamente.
- Nota: este repositorio contiene pesos completos en safetensors (59,6 GB), por lo que para ejecutarlo directamente se necesitan al menos 64 GB de VRAM. Las cuantizaciones mencionadas no estan incluidas aqui.

## Comparativa con modelos similares

No disponible. No se proporcionan datos de modelos comparables en la informacion suministrada.

## Limitaciones y advertencias

- Al ser una version "abliterada", el proceso de modificacion puede haber alterado comportamientos en ciertos dominios; no se documentan los criterios exactos de la abliteracion ni su impacto en la calidad.
- No se han publicado evaluaciones independientes de sesgos o alucinaciones para esta version especifica.
- El conocimiento esta limitado a enero de 2026, por lo que informacion posterior puede no estar cubierta.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo original es de Meta; la version de Blackroot puede tener diferencias no documentadas respecto al original.
- El repositorio no incluye las cuantizaciones K-Quant mencionadas en la documentacion, por lo que el despliegue en hardware de 24 GB requiere convertir los pesos manualmente.
- La velocidad de generacion depende en gran medida del hardware; en CPUs o GPUs antiguas el rendimiento puede ser insuficiente para interaccion en tiempo real.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Blackroot/Muse-Glimmer-30GB-Preserving-Abliterated
- Paper del encoder de percepcion (ViT-G/14): https://arxiv.org/abs/2504.13181
- Paper de DFlash (decodificacion especulativa): https://arxiv.org/abs/2602.06036
