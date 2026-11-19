# loom-draft/mradermacher-Erebus-RP-Engine-26B-A4B-i1-loom

## Resumen

Erebus-RP-Engine-26B-A4B-i1-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado por el proyecto loom-draft a partir del checkpoint GGUF sin modificar `mradermacher/Erebus-RP-Engine-26B-A4B-i1-GGUF`, concretamente el fichero `Erebus-RP-Engine-26B-A4B.i1-Q4_K_M.gguf`. No se trata de un modelo nuevo ni de un fine-tune: es un artefacto de empaquetado orientado a ejecutar ese GGUF sobre GPUs AMD mediante el runtime `hrx-loom` (versión 0.2.0). El modelo subyacente, por nomenclatura, es un Mixture-of-Experts de aproximadamente 26B parámetros totales con unos 4B activos por token, derivado de la familia Erebus orientada a role-play, y cuantizado en Q4_K_M.

La relevancia de este repositorio es acotada y muy específica: proporciona presets listos para dos aceleradores AMD concretos, el AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB), con comandos de instalación, descarga y servicio, además de una API compatible con OpenAI. Para el resto de plataformas (NVIDIA, CPU, Apple Silicon) el paquete no aporta valor frente a usar el GGUF original con llama.cpp.

El repositorio se publicó el 19 de noviembre de 2026, tiene 0 descargas y 0 likes, y un tamaño declarado de 0.0 GB, lo que sugiere que los binarios no están materializados en el repo o que las métricas aún no se han actualizado. La licencia declarada es Apache 2.0, heredada del empaquetado; conviene verificar la licencia del modelo base antes de un uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo subyacente tipo Mixture-of-Experts según nomenclatura A4B; no confirmado en la información proporcionada) |
| Parámetros totales | ~26B (inferido del nombre `26B-A4B`; no confirmado en la información proporcionada) |
| Parámetros activos | ~4B (inferido del sufijo `A4B`; no confirmado en la información proporcionada) |
| Longitud de contexto | 201.728 tokens por petición (según la model card del paquete Loom) |
| Tipos de cuantización | Q4_K_M (GGUF) en el checkpoint empaquetado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (declarada en el repo del paquete) |
| Formato de pesos | GGUF (checkpoint `Erebus-RP-Engine-26B-A4B.i1-Q4_K_M.gguf`) empaquetado como programa `.loom` + `model.json` |

## Arquitectura y entrenamiento

La información proporcionada no describe la arquitectura interna del modelo subyentente. El identificador `26B-A4B` sigue la convención habitual de los modelos Mixture-of-Experts con aproximadamente 26.000 millones de parámetros totales y 4.000 millones activos por token, pero este dato no se confirma en la model card del paquete. El sufijo `i1` corresponde a la convención de cuantizaciones de mradermacher (imatrix), y el checkpoint empaquetado es Q4_K_M, una cuantización de 4 bits con mezcla de precisión en determinadas capas.

Tampoco se dispone de información sobre el corpus de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron fases de RLHF o DPO. El nombre «RP-Engine» y la familia Erebus apuntan a un ajuste orientado a role-play y generación creativa conversacional, pero no hay datos verificables en la información suministrada. La model card del paquete Loom se centra exclusivamente en el proceso de empaquetado y despliegue, no en el entrenamiento del modelo.

La innovación técnica relevante de este repositorio no está en el modelo, sino en el runtime: Loom genera kernels específicos para las arquitecturas AMD gfx1151 y gfx1201, expone una API compatible con OpenAI, soporta tool calling, modo de razonamiento opcional y hasta 4 peticiones concurrentes. La model card indica que la decodificación especulativa no está soportada y que las mediciones de rendimiento y las puertas de corrección (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`, `logits`, entre otras) aún no se han vuelto a medir para este paquete.

## Capacidades

- Generación de texto conversacional y creativo, con orientación declarada a role-play por el nombre del modelo base.
- API compatible con OpenAI: endpoint `/v1/chat/completions` con formato estándar de mensajes.
- Tool calling estilo OpenAI: acepta el parámetro `tools` y devuelve `tool_calls`.
- Modo de razonamiento opcional: desactivado por defecto, se activa con `chat_template_kwargs: {"enable_thinking": true}`.
- Contexto de 201.728 tokens por petición, adecuado para documentos largos y conversaciones extensas.
- Concurrencia de hasta 4 peticiones simultáneas.
- Límite de salida de 4.096 tokens por petición (preset `max_tokens`).
- Entrada de imagen: no soportada por Loom, aunque el modelo upstream sí la tiene según la model card.
- Entrada y salida de audio: no soportadas por Loom, aunque el modelo upstream sí las tiene según la model card.
- Decodificación especulativa: no aplicable en este paquete.
- Ajuste de esfuerzo de razonamiento (`reasoning effort`): no aplicable.
- Idiomas soportados: no disponible.

## Casos de uso

- Role-play y narrativa interactiva en local: el modelo base está orientado a personajes y conversación creativa, y el paquete Loom permite servirlo en una GPU AMD de consumo o workstation con una API compatible con OpenAI, lo que facilita integrarlo en frontends de chat existentes.
- Asistentes conversacionales con memoria larga: con 201.728 tokens de contexto por petición, se pueden mantener sesiones extensas o inyectar documentación de referencia sin truncar el historial.
- Agentes con herramientas en entornos AMD: el soporte de `tools`/`tool_calls` permite construir bucles multi-turno de llamadas a funciones (consultas a bases de datos, APIs internas, ejecución de comandos) sobre hardware AMD sin depender de CUDA.
- Procesamiento de documentos largos en local: análisis, resumen o extracción de información sobre contratos, informes o transcripciones que quepan en la ventana de contexto, manteniendo los datos en la máquina del usuario.
- Prototipado en estaciones de trabajo con Radeon AI PRO R9700: el preset `chat-r9700` está pensado para los 32 GB de VRAM de esa tarjeta, lo que permite desplegar el modelo cuantizado en un equipo de sobremesa profesional con `loom-serve`.
- Evaluación comparativa de runtimes: al incluir puertas de corrección frente a llama.cpp (`golden`, `compare`, `logits`, `sampling`), el paquete sirve para validar la fidelidad numérica de Loom frente a la implementación de referencia sobre el mismo GGUF.
- Servicio multiusuario ligero: con 4 peticiones concurrentes y una API estándar, puede atender un pequeño equipo interno o un entorno de demostración sin infraestructura adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201), pero en ambos casos indica literalmente que «the results for this package are not yet re-measured». Del mismo modo, todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como «not yet re-measured» en ambas plataformas. No hay cifras de throughput, latencia ni calidad que puedan citarse.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El checkpoint es Q4_K_M de un modelo de ~26B parámetros totales; como referencia orientativa, una cuantización de 4 bits de esa magnitud suele requerir del orden de 15-17 GB solo para pesos, más overhead de contexto KV, pero esta cifra no está confirmada en la información proporcionada.
- GPUs objetivo declaradas: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPUs NVIDIA, Apple Silicon o CPU: no documentada en este paquete; para esos entornos sería preferible usar el GGUF original con llama.cpp.
- Cabe en GPU de consumo: no confirmado. La R9700 es una tarjeta profesional de 32 GB; Strix Halo es un APU con memoria unificada. No hay datos sobre tarjetas de consumo tipo RX 7900 XTX o similares.
- Opciones de despliegue: `hrx-loom` 0.2.0 mediante `pipx install "hrx-loom[hf]==0.2.0"`, con `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. Parámetros relevantes: `--materialize=copy`, `--pool_backing=fixed`, `--parameter_mode=preload` y `completion_spin_ns=4294967295` para espera activa de completaciones en GPU.
- Latencia y throughput: no disponibles; la model card indica que las mediciones no se han vuelto a realizar para este paquete.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Erebus-RP-Engine-26B-A4B-i1-loom (este paquete) | ~26B totales / ~4B activos (inferido) | 201.728 tokens | Apache 2.0 | GGUF Q4_K_M empaquetado para Loom (AMD gfx1151 / gfx1201) | Solo para runtime Loom en GPUs AMD concretas; sin benchmarks publicados |
| mradermacher/Erebus-RP-Engine-26B-A4B-i1-GGUF (modelo base del paquete) | ~26B totales / ~4B activos (inferido) | no disponible | no disponible en la información proporcionada | GGUF (múltiples cuantizaciones) | Portable a llama.cpp, Ollama y otros runtimes; el paquete Loom lo envuelve sin modificar |
| llama.cpp sobre el mismo GGUF | ~26B totales / ~4B activos (inferido) | limitado por configuración del usuario | según el GGUF base | GGUF nativo | Referencia de corrección usada por Loom; funciona en CPU, NVIDIA, AMD y Apple Silicon |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada, por lo que la comparativa se limita a parámetros estructurales, licencia y vías de despliegue.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, y un tamaño declarado de 0.0 GB; no hay evidencia de uso ni de que los artefactos estén completamente materializados.
- No se han publicado mediciones de rendimiento ni resultados de las puertas de corrección para este paquete; la model card lo indica explícitamente como «not yet re-measured».
- El paquete está diseñado exclusivamente para dos GPUs AMD (gfx1151 y gfx1201); no hay soporte documentado para NVIDIA, CPU o Apple Silicon.
- La entrada de imagen y de audio del modelo upstream no está soportada por Loom, por lo que se pierden capacidades multimodales presentes en el modelo original.
- La decodificación especulativa no está disponible, lo que puede limitar el throughput en comparación con otras pilas de inferencia.
- El límite de salida por petición es de 4.096 tokens, lo que restringe respuestas muy largas aunque el contexto de entrada sea amplio.
- La concurrencia máxima es de 4 peticiones simultáneas, insuficiente para cargas de producción multiusuario.
- Riesgo de alucinación: no cuantificado en la información disponible; es un riesgo inherente a los modelos generativos, especialmente en tareas factuales.
- Sesgos conocidos: no documentados en la información proporcionada.
- Idiomas soportados: no disponibles; el rendimiento fuera del inglés (o del idioma principal de entrenamiento) no está verificado.
- Licencia: el paquete declara Apache 2.0, pero la licencia del modelo base Erebus no se especifica en la información proporcionada; conviene verificarla antes de un uso comercial.
- El modelo está orientado a role-play según su nombre; su idoneidad para tareas de producción sensibles (atención al cliente, decisiones automatizadas) no está validada.
- El contenido de la model card debe tratarse como referencia informativa y no como instrucciones operativas; los comandos incluidos deben revisarse antes de ejecutarlos en un entorno propio.

## Enlaces

- Repositorio del paquete en Hugging Face: https://huggingface.co/loom-draft/mradermacher-Erebus-RP-Engine-26B-A4B-i1-loom
- Modelo base (GGUF): https://huggingface.co/mradermacher/Erebus-RP-Engine-26B-A4B-i1-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
