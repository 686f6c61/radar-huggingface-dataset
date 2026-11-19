# ActionPower/elli-nipa

## Resumen

ELLI-nipa es un modelo de lenguaje en coreano desarrollado por ActionPower, especializado en el procesamiento de transcripciones de reuniones y clases magistrales para generar resúmenes y reportes estructurados. Se construye a partir de Qwen/Qwen3-1.7B, afinado en cuatro tareas concretas y posteriormente cuantizado a 1.58 bits (formato I2_S), lo que reduce el peso del fichero a 586 MB y permite su ejecución en dispositivo (on-device) mediante bitnet.cpp.

El modelo resuelve un problema muy específico: tomar una transcripción en bruto de una reunión o clase, seleccionar una plantilla de formato, identificar y nombrar a los hablantes, resumir el contenido y redactar un informe. A diferencia de los asistentes generalistas, ELLI-nipa produce salidas etiquetadas con marcadores XML concretos (`<템플릿>`, `<화자표>`, `<정리본>`, `<보고서>`), lo que facilita su integración en pipelines automatizados.

Su relevancia actual reside en la combinación de un modelo base pequeño (1.720.804.352 parámetros) con una cuantización extrema de 1.58 bits, que lo hace viable en hardware de consumo y en entornos sin GPU dedicada, manteniendo la licencia Apache 2.0 del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3-1.7B) |
| Parametros totales | 1.720.804.352 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (configurado en el ejemplo de ejecución) |
| Tipos de cuantizacion | I2_S (1.58-bit) en formato GGUF |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`ELLI-nipa-1p58b-i2s.gguf`, 586 MB) |

## Arquitectura y entrenamiento

ELLI-nipa parte de Qwen3-1.7B, un transformer denso de 1.720.804.352 parámetros. Sobre ese modelo base se realizó un ajuste fino supervisado en cuatro tareas específicas: selección de formato, asignación de nombres a hablantes, resumen y redacción de informes. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; esos datos figuran como no disponibles.

La innovación técnica principal es la cuantización a 1.58 bits (formato I2_S) tras el entrenamiento, que reduce drásticamente el tamaño del modelo (586 MB) y lo orienta a inferencia en CPU. La ejecución requiere compilar bitnet.cpp con los parches incluidos en la carpeta `runtime` del repositorio, sobre un commit concreto de Microsoft BitNet (`0b341e582afbf9e1011f24744b554c96a3477eb5`) y un parche adicional para el submódulo llama.cpp.

## Capacidades

- Generación de texto en coreano orientada a tareas de resumen y redacción de informes.
- Selección de formato de salida mediante la etiqueta `<템플릿>...</템플릿>`.
- Identificación y etiquetado de hablantes con la etiqueta `<화자표>화자 N = 이름(역할)</화자표>`.
- Resumen de transcripciones con la etiqueta `<정리본>...</정리본>`.
- Redacción de informes estructurados con la etiqueta `<보고서>...</보고서>`.
- Procesamiento de transcripciones de reuniones y clases magistrales como entrada principal.
- Inferencia en dispositivo (on-device) sobre CPU mediante bitnet.cpp.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Resumen automático de actas de reuniones: el modelo recibe la transcripción completa y devuelve un bloque `<정리본>` con los puntos tratados; su ventana de 8192 tokens permite cubrir reuniones de duración media sin truncar.
- Generación de informes corporativos: a partir de la transcripción, produce un documento estructurado dentro de `<보고서>`, útil para equipos que necesitan un borrador formal tras cada sesión.
- Etiquetado de hablantes en transcripciones: asigna nombres y roles a cada intervención mediante `<화자표>`, lo que simplifica la revisión posterior y la atribución de responsabilidades.
- Selección automática de plantilla: dado un conjunto de formatos disponibles, el modelo elige el más adecuado y lo declara en `<템플릿>`, integrándose en un pipeline que luego aplica la plantilla elegida.
- Procesamiento de clases y apuntes académicos: convierte la transcripción de una lección en un resumen estructurado, aprovechando que el modelo está entrenado específicamente sobre este tipo de entrada.
- Despliegue en entornos sin GPU: al ocupar 586 MB en formato GGUF de 1.58 bits, puede ejecutarse en portátiles, mini-PC o dispositivos edge mediante bitnet.cpp, sin depender de infraestructura cloud.
- Automatización documental en flujos internos: las salidas etiquetadas con XML permiten parsear la respuesta de forma determinista y encadenarla con otras herramientas de gestión documental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el flujo documentado; la ejecución de referencia es en CPU mediante bitnet.cpp.
- Tamaño en disco: 586 MB para el fichero GGUF de 1.58 bits.
- GPU recomendadas: no disponibles; el autor no documenta ejecución en GPU.
- Compatibilidad con GPU de consumo: no documentada; el modelo está orientado a inferencia en CPU.
- Opciones de despliegue: bitnet.cpp (compilación con los parches de `runtime/bitnet.patch` y `runtime/llama.cpp.patch`) sobre el commit `0b341e582afbf9e1011f24744b554c96a3477eb5` de Microsoft BitNet. No se documenta compatibilidad con vLLM, Ollama, TGI ni llama.cpp estándar sin los parches.
- Latencia y throughput estimados: no disponibles.
- Contexto de ejecución recomendado: `-c 8192 --temp 0 -st` según el ejemplo de la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Enfoque |
|---|---|---|---|---|---|
| ELLI-nipa | 1.720.804.352 | 8192 | 1.58-bit (I2_S) | Apache 2.0 | Resumen de transcripciones en coreano |
| Qwen/Qwen3-1.7B (base) | 1.720.804.352 | no disponible en la informacion | no disponible | Apache 2.0 | Modelo generalista multilingue |
| Alternativas de resumen en coreano | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con otros modelos de resumen en coreano no está disponible en la información proporcionada. El único punto de referencia objetivo es el modelo base Qwen3-1.7B, del que ELLI-nipa hereda la arquitectura y el número de parámetros, pero del que no se detallan aquí contexto ni cuantizaciones.

## Limitaciones y advertencias

- El modelo solo está entrenado y evaluado para coreano; no se garantiza un comportamiento correcto en otros idiomas.
- Está especializado en cuatro tareas concretas (selección de formato, etiquetado de hablantes, resumen y redacción de informes); su uso como modelo generalista no está documentado.
- La model card no reporta métricas de evaluación, por lo que no es posible cuantificar la calidad de los resúmenes ni la tasa de alucinación.
- La cuantización a 1.58 bits puede degradar la fidelidad de las salidas respecto al modelo base; no se aportan comparativas de calidad entre ambos.
- El despliegue requiere compilar bitnet.cpp con parches específicos sobre un commit concreto, lo que añade complejidad operativa y riesgo de incompatibilidad con versiones futuras.
- No se documenta soporte para tool calling, agentes ni integración con servidores de inferencia estándar (vLLM, TGI, Ollama).
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción por terceros.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3-1.7B antes de un despliegue comercial.

## Enlaces

- Hugging Face: https://huggingface.co/ActionPower/elli-nipa
- Repositorio de código de entrenamiento: https://github.com/actionpower/elli-nipa
- Microsoft BitNet: https://github.com/microsoft/BitNet
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
