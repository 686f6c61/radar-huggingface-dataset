# jesdga/DeepSeek-V4.1-Flash-1017-Basalt

## Resumen

DeepSeek-V4.1-Flash-1017-Basalt es un artefacto de despliegue publicado por el usuario jesdga en Hugging Face: un único fichero autocontenido de 260 GB que empaqueta la cuantización UD-IQ1_M (Dynamic V3.1) de Unsloth del modelo deepseek-ai/DeepSeek-V4.1-Flash-1017, junto con la tabla Engram, el proyector de visión, el tokenizador y el drafter DSpark. No es un modelo nuevo entrenado por el autor, sino un formato empaquetado específico para Basalt, un motor de inferencia local para GPUs NVIDIA Blackwell (sm_120) con API compatible con OpenAI y Anthropic, del que jesdga es autor. El modelo base lo desarrolla DeepSeek y se distribuye bajo licencia MIT.

La relevancia del artefacto es operativa: permite ejecutar un modelo de arquitectura MoE de gran tamaño en una sola tarjeta Blackwell, usando una segunda GPU como nivel de expertos peer y la RAM del sistema para los expertos que no caben en VRAM. El fichero incorpora decodificación especulativa mediante el drafter DSpark (ventanas de 3 tokens, con verificación de los tokens redactados) y soporte de contexto de hasta 1.048.576 tokens. El repositorio ocupa 518,2 GB y el fichero principal de pesos son 260 GB.

La información pública disponible se limita a la model card del artefacto y a los resultados de velocidad y calidad medidos por el propio autor con el motor Basalt. No se detallan parámetros totales, número de expertos, composición del dataset de entrenamiento ni resultados de benchmarks estándar del modelo base, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts), según la etiqueta del autor; detalles de capas y atención no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 1.048.576 tokens (configurable con `--max-context`) |
| Tipos de cuantizacion | UD-IQ1_M (Dynamic V3.1) de Unsloth; proyector de visión en BF16; drafter DSpark en Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | MIT (modelo base DeepSeek, cuantización Unsloth y motor Basalt) |
| Formato de pesos | `.basalt` (fichero único autocontenido con pesos, tabla Engram, proyector de visión, tokenizador y drafter) |

## Arquitectura y entrenamiento

El modelo base es DeepSeek-V4.1-Flash-1017, de DeepSeek, con arquitectura de mezcla de expertos (MoE) según la etiqueta declarada. La información disponible no detalla el número de capas, la dimensión oculta, el número de expertos ni el esquema de enrutamiento. Tampoco se especifica el volumen de tokens de entrenamiento, la composición del corpus ni si se aplicaron etapas de RLHF o DPO. El artefacto incorpora una "tabla Engram", un componente propio del modelo base cuyo funcionamiento no se describe en la documentación consultada, y un proyector de visión que habilita entrada de imágenes.

La innovación técnica documentada está en el plano de la inferencia, no del entrenamiento. El motor Basalt no recuantiza los pesos: cada tensor se almacena tal como lo publica el GGUF de Unsloth, y el redondeo por etapa se documenta en la página de precisión del proyecto. La decodificación especulativa la realiza el drafter DSpark, que propone tokens en ventanas de 3 y conserva los 32 expertos más enrutados de cada etapa (2,4 GB de VRAM); los tokens propuestos se verifican, de modo que la salida es la del modelo. El motor reparte la ejecución entre una GPU Blackwell principal, una segunda GPU como nivel de expertos peer y la RAM del sistema para los expertos que no caben en VRAM.

## Capacidades

- Generación de texto y razonamiento: el motor lee del fichero el formato de chat y el conmutador de "thinking" del modelo base.
- Entrada de imágenes: soportada con `--vision dynamic`, codificada dentro del motor a partir del proyector incluido en el fichero.
- Llamada a herramientas: el motor lee del fichero la sintaxis de tool-call del modelo, por lo que expone function calling a través de la API compatible con OpenAI y Anthropic.
- Contexto muy largo: hasta 1.048.576 tokens configurables, adecuado para sesiones agénticas prolongadas.
- Decodificación especulativa: activada por defecto mediante DSpark, desactivable con `--spec 0`.
- Idiomas: no disponible en la información consultada.
- Capacidades de audio: no disponible.

## Casos de uso

- Sesiones agénticas de programación de larga duración: la model card reporta unas 85 tok/s de media en sesiones agénticas de coding con DSpark activo, lo que permite mantener bucles multi-paso con muchas llamadas a herramientas sobre una sola máquina.
- Procesamiento de repositorios completos: con hasta 1.048.576 tokens de contexto se pueden cargar árboles de código extensos y documentación asociada en una única ventana para tareas de revisión o refactorización.
- Asistencia sobre documentación técnica con imágenes: el proyector de visión permite adjuntar diagramas, capturas de pantalla o esquemas junto al texto en flujos de soporte técnico.
- Despliegue local con API compatible con OpenAI y Anthropic: el motor expone ambos formatos, de modo que herramientas cliente existentes pueden apuntar a `bin/basalt serve` sin adaptadores adicionales.
- Servicio de chat interactivo en estación de trabajo: los 70,8 tok/s en modo chat y los 2.524 tok/s de prefill con prompt de 64K permiten conversaciones multi-turno con contexto precargado de forma ágil.
- Generación estructurada: los 135,4 tok/s en modo estructurado lo hacen viable para producir JSON, esquemas o salidas con formato fijo en pipelines automatizados.
- Evaluación e investigación de cuantizaciones extremas: el artefacto sirve para estudiar el impacto de IQ1_M en un MoE grande, con métricas de PPL y KLD frente a una referencia BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor publica métricas de velocidad y de calidad de la cuantización medidas con el motor Basalt sobre una RTX 5090 a 400 W más una RTX 5060 Ti a 180 W como peer.

| Metrica | Valor |
|---|---|
| Tokens/s, prosa (UD-IQ1_M) | 72,2 |
| Tokens/s, estructurado (UD-IQ1_M) | 135,4 |
| Tokens/s, chat (UD-IQ1_M) | 70,8 |
| Prefill con prompt de 64K (tok/s) | 2.524 |
| Sesiones agénticas de coding, media | ~85 tok/s |
| PPL en wikitext-2 (100 chunks de 512 tokens) | 3,033 (referencia BF16: 2,731) |
| KLD media | 0,278 |
| Coincidencia top-1 | 83,88 % |

## Requisitos de hardware

- VRAM: el fichero de pesos son 260 GB; el reparto previsto es una GPU Blackwell principal más una segunda GPU como nivel de expertos peer, con desbordamiento a RAM del sistema para los expertos restantes.
- GPU recomendadas: NVIDIA Blackwell (sm_120), con RTX 5090 como tarjeta principal y RTX 5060 Ti como peer en las mediciones del autor. El motor está construido específicamente para sm_120, por lo que otras arquitecturas no están soportadas según la documentación.
- VRAM adicional para el drafter: 2,4 GB con DSpark activo (por defecto).
- Cabe en GPU de consumo: sí, en el esquema de una o dos tarjetas Blackwell más RAM del sistema; el rendimiento depende del ancho de banda de la RAM para los expertos fuera de VRAM.
- Despliegue: motor Basalt 0.3.0 o superior, con `bin/basalt serve`. El formato `.basalt` es específico del motor; no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI para este fichero.
- Latencia y throughput: los valores de la tabla anterior, medidos por el autor y sujetos a variación entre versiones del motor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-Basalt (este) | no disponible (MoE) | 1.048.576 | `.basalt` (UD-IQ1_M) | MIT | Empaquetado para Basalt en Blackwell; 260 GB |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | no disponible (MoE) | no disponible | safetensors (original) | MIT | Modelo original de DeepSeek; referencia BF16 con PPL 2,731 |
| unsloth/DeepSeek-V4.1-Flash-1017-GGUF | no disponible (MoE) | no disponible | GGUF (UD-IQ1_M) | MIT | Cuantización de origen; compatible con llama.cpp |

No se dispone de datos de benchmarks comparativos entre estos artefactos en la información consultada.

## Limitaciones y advertencias

- Dependencia de hardware: el motor Basalt está dirigido exclusivamente a NVIDIA Blackwell (sm_120); no hay soporte indicado para otras GPU ni para CPU.
- Formato propietario del motor: el fichero `.basalt` requiere Basalt 0.3.0 o superior y no es directamente utilizable en vLLM, llama.cpp, Ollama o TGI.
- Pérdida de calidad por cuantización: frente a la referencia BF16, la PPL sube de 2,731 a 3,033, la KLD media es 0,278 y la coincidencia top-1 cae al 83,88 %, lo que implica divergencias de tokens respecto al modelo original.
- Rendimiento dependiente del sistema: los expertos que no caben en VRAM se ejecutan desde RAM del sistema, con el consiguiente impacto en latencia y throughput según la configuración de memoria.
- Sesgos y alucinaciones: no se documentan análisis de sesgos ni tasas de alucinación en la información disponible.
- Idiomas: no se especifica la cobertura lingüística del modelo base en la documentación consultada.
- Licencia: MIT para modelo, cuantización y motor, lo que permite uso comercial, pero conviene verificar los términos del modelo base en su repositorio original.
- Madurez: el artefacto tiene 0 descargas y 2 likes en el momento de la consulta, y las cifras de rendimiento proceden del propio autor del motor, sin verificación independiente.

## Enlaces

- Repositorio del artefacto: https://huggingface.co/jesdga/DeepSeek-V4.1-Flash-1017-Basalt
- Árbol de ficheros: https://huggingface.co/jesdga/DeepSeek-V4.1-Flash-1017-Basalt/tree/main
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Cuantización de Unsloth: https://huggingface.co/unsloth/DeepSeek-V4.1-Flash-1017-GGUF
- Motor Basalt: https://github.com/jesdga95/basalt
- Documentación de DeepSeek-V4.1 en Basalt: https://github.com/jesdga95/basalt/blob/main/docs/models/deepseek41.md
- Coste de la decodificación especulativa: https://github.com/jesdga95/basalt/blob/main/docs/models/deepseek41.md#what-it-costs
- Página de precisión: https://github.com/jesdga95/basalt/blob/main/docs/precision/deepseek41.md
- Configuración de modelos y router: https://github.com/jesdga95/basalt/blob/main/docs/configuration/models.md
- Proyecto Strata (origen del fork): https://github.com/Niko1221/Strata
