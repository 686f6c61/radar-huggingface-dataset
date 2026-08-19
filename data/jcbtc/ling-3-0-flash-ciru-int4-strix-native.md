# jcbtc/Ling-3.0-Flash-CIRU-int4-Strix-native

## Resumen

`Ling-3.0-Flash-CIRU-int4-Strix-native` es una distribución de runtime nativa para ejecutar el checkpoint oficial INT4 del modelo Ling 3.0 Flash de InclusionAI sobre hardware AMD Strix Halo (APU con iGPU `gfx1151`). El autor, `jcbtc`, no modifica los pesos del modelo base (`inclusionAI/Ling-3.0-flash-int4`), sino que combina ese checkpoint con un fork de vLLM (17 commits adicionales), una receta de compilación ROCm 7.15 y perfiles de lanzamiento validados en una AMD Radeon 8060S con 128 GB de memoria unificada. El resultado es un paquete que permite servir un modelo de 124B parámetros totales (MoE, 5.1B activos) en una estación de trabajo de consumo, con rendimiento de decodificación de 26.23 tok/s en flujo único y hasta 62 tok/s agregados.

El modelo base, Ling 3.0 Flash, es un modelo de razonamiento híbrido (arquitectura `bailing_hybrid`) con atención latente (MLA) y mezcla de expertos, con contexto nativo de 256K tokens extensible a 1M. Esta distribución específica está orientada a usuarios que quieran ejecutar inferencia local de alta capacidad en hardware AMD, aprovechando la memoria unificada de Strix Halo y las optimizaciones de ROCm. La relevancia actual radica en que democratiza el despliegue de modelos de gran tamaño en equipos personales, sin necesidad de servidores con GPUs dedicadas de alta gama.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (bailing_hybrid) con atención latente (MLA) y mezcla de expertos |
| Parametros totales | 127.486.405.600 (dato de safetensors) |
| Parametros activos | 5.1B (según documentación oficial de Ling 3.0 Flash) |
| Longitud de contexto | 256K nativo, extensible a 1M (según documentación oficial) |
| Tipos de cuantizacion | INT4 W4A16 (pesos empaquetados) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (con compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base Ling 3.0 Flash es un modelo de razonamiento híbrido que combina atención latente (MLA) con una arquitectura de mezcla de expertos (MoE). Con 124B parámetros totales y 5.1B activos, opera con una ventana de contexto nativa de 256K tokens, ampliable a 1M. La arquitectura `bailing_hybrid` sugiere una integración de mecanismos de atención y capas de expertos, optimizada para eficiencia en coste y latencia. No se dispone de información detallada sobre el dataset de entrenamiento ni sobre el proceso de alineación (RLHF/DPO) en la documentación proporcionada.

La distribución CIRU añade optimizaciones específicas para ROCm: un kernel Triton de SiLU y multiplicación para formas W4A16, rutas rápidas de decodificación/verificación MoE para geometrías pequeñas, normalización de LSE de FlashAttention para acumulación de contexto MLA, y un parche para el fallo de fusión de estados de atención en `gfx1151`. Además, incluye soporte de decodificación especulativa con MTP (multi-token prediction) K1, lo que contribuye a los 26.23 tok/s de decodificación en flujo único.

## Capacidades

- Generación de texto y razonamiento multi-step, al ser un modelo de razonamiento híbrido.
- Soporte de tool calling y parser estructurado de herramientas (mencionado en la model card como "structured tool parser").
- Decodificación especulativa con MTP K1, que acelera la inferencia sin degradar la calidad.
- Contexto largo nativo de 256K tokens, ampliable a 1M, adecuado para documentos extensos y conversaciones multi-turno.
- Compatibilidad con OpenAI-compatible serving (vLLM), lo que facilita la integración con herramientas existentes.
- Optimizado para hardware AMD Strix Halo (gfx1151) con ROCm, incluyendo soporte para Windows/WSL.

## Casos de uso

- Asistente local de alto rendimiento: con 26.23 tok/s de decodificación en flujo único, puede servir como copiloto de programación o asistente personal en una estación de trabajo AMD, sin depender de servicios en la nube.
- Procesamiento de documentos largos: la ventana de contexto de 256K permite analizar libros completos, contratos legales o informes técnicos extensos en una sola pasada, resumiendo o extrayendo información clave.
- Generación de código en entornos offline: al soportar tool calling y razonamiento, puede integrarse en pipelines de CI/CD para revisión de código, generación de tests o autocompletado, manteniendo los datos en local.
- Investigación académica: investigadores que necesiten ejecutar experimentos con modelos de gran tamaño sin acceso a clústeres pueden usar esta distribución en hardware de consumo, gracias a la memoria unificada de 128 GB.
- Despliegue de agentes conversacionales: con contexto largo y parser de herramientas, puede gestionar conversaciones multi-turno complejas en aplicaciones de atención al cliente o asistentes virtuales, con la ventaja de ejecutarse en local para garantizar privacidad.
- Servicio de inferencia concurrente: el runtime soporta hasta 5 canales concurrentes de 256K de contexto, lo que permite atender múltiples peticiones simultáneas en un solo equipo, ideal para prototipos o entornos de demostración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información proporcionada. Sin embargo, la model card y la documentación oficial reportan métricas de rendimiento de inferencia para esta distribución específica en AMD Strix Halo:

| Métrica | Valor |
|---|---|
| Decodificación en flujo único | 26.23 tok/s |
| Decodificación agregada (múltiples flujos) | hasta 62 tok/s |
| Prefill | hasta 550 tok/s |
| Contexto máximo | 1M tokens |
| Canales concurrentes | 5 (con 256K de contexto cada uno) |

Estos datos corresponden a la versión con MTP K1 y optimizaciones ROCm, medidos en una AMD Radeon 8060S con 128 GB de memoria unificada.

## Requisitos de hardware

- Hardware objetivo: AMD Strix Halo (APU con iGPU `gfx1151`), validado en AMD Radeon 8060S con 128 GB de memoria unificada.
- VRAM estimada: no se especifica un valor exacto, pero el modelo requiere los 128 GB de memoria unificada del sistema para cargar los 78.1 GB de pesos en INT4 y dejar espacio para el contexto y las activaciones.
- GPU recomendadas: no aplica a GPUs discretas convencionales; está diseñado exclusivamente para Strix Halo. No cabe en GPUs de consumo como RTX 4090 (24 GB) o similares.
- Opciones de despliegue: vLLM con fork CIRU, scripts de lanzamiento incluidos (`scripts/run-256k.sh`), compatible con ROCm 7.15. También se menciona soporte para Windows/WSL.
- Latencia y throughput: 26.23 tok/s en decodificación single-stream, hasta 62 tok/s agregados, 550 tok/s de prefill, según las pruebas reportadas.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos en la información proporcionada. Esta distribución es específica para un hardware concreto (Strix Halo) y no se puede comparar directamente con otros modelos en términos de rendimiento sin ejecutar pruebas en el mismo entorno. Como referencia, el modelo base Ling 3.0 Flash se posiciona como una alternativa eficiente a modelos MoE de tamaño similar, como Mixtral 8x22B (141B totales, 39B activos) o Llama 3.1 70B (70B densos), pero no se han publicado comparativas de calidad en esta documentación.

## Limitaciones y advertencias

- Compatibilidad restringida: el runtime está diseñado exclusivamente para AMD Strix Halo (gfx1151) con ROCm 7.15; no funcionará en GPUs NVIDIA ni en otras arquitecturas AMD sin modificaciones significativas.
- Dependencia de memoria unificada: requiere al menos 128 GB de RAM unificada; equipos con menos memoria no podrán cargar el modelo completo.
- Problemas conocidos del runtime: la versión original presentaba un bug de CPU ocupada en reposo (solucionado en la actualización de agosto de 2026); se recomienda aplicar la actualización del motor.
- Sin garantías de calidad del modelo: al ser una distribución de runtime, no se aportan datos de benchmarks de calidad del modelo base; el rendimiento real en tareas específicas debe evaluarse por el usuario.
- Riesgo de alucinación y sesgos: al ser un modelo de razonamiento, puede generar respuestas plausibles pero incorrectas; no se han documentado sesgos específicos, pero se recomienda validar en dominios críticos.
- Limitaciones de idioma: no se especifican los idiomas soportados; se asume multilingüismo del modelo base, pero no está confirmado.
- Requisitos de instalación: el proceso de instalación incluye compilación de ROCr y vLLM, lo que requiere conocimientos técnicos avanzados y puede fallar en entornos no estándar.

## Enlaces

- [HuggingFace - jcbtc/Ling-3.0-Flash-CIRU-int4-Strix-native](https://huggingface.co/jcbtc/Ling-3.0-Flash-CIRU-int4-Strix-native)
- [Documentación oficial de Ling 3.0 Flash](https://developer.ant-ling.com/en/docs/models/ling/)
- [Demo de Ling 3.0 Flash en DeepInfra](https://deepinfra.com/inclusionAI/Ling-3.0-flash)
- [Tweet de Ciru.ai sobre rendimiento en Strix Halo](https://x.com/ciruai/status/2085982210411151742)
