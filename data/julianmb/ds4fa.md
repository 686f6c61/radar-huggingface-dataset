# julianmb/ds4fa

## Resumen

`julianmb/ds4fa` es un fork optimizado de `antirez/ds4`, un backend ROCm para ejecutar modelos DeepSeek V4 en hardware AMD. Este fork está específicamente diseñado para la APU AMD Strix Halo (Ryzen AI MAX+ 395 / Radeon 8060S, gfx1151) y permite ejecutar localmente el modelo DeepSeek V4 Flash de 284.000 millones de parámetros en los 128 GB de memoria unificada de esa plataforma, alcanzando hasta 32 tokens por segundo en decodificación.

La propuesta es que un mini-PC con Strix Halo se convierta en una máquina de inferencia local de un modelo MoE de gran tamaño, sin necesidad de GPU dedicada ni de conexión a la nube. Para lograrlo, el autor introduce un formato de cuantización propio llamado ROCmFPX, que combina bloques de pesos de baja precisión con kernels HIP específicos para RDNA3/3.5, y un sistema de streaming de expertos desde SSD. El resultado es un modelo de 284B parámetros en un archivo de aproximadamente 102 GB que cabe en la memoria unificada de la APU.

La relevancia actual reside en que demuestra que hardware de consumo (un mini-PC con APU AMD) puede ejecutar modelos de la escala de DeepSeek V4 Flash a velocidades utilizables, sin depender de clústeres de GPU ni de servicios en la nube. Es un ejemplo de optimización profunda de software para una plataforma concreta, con kernels escritos a medida y un formato de pesos diseñado en conjunto con el motor de inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con 43 capas enrutadas y 256 expertos por capa |
| Parámetros totales | 284.000 millones |
| Parámetros activos | no disponible (no se especifica en la documentación) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | ROCmFP2 (2,5 bits/weight), ROCmFP3 (3,5 bits/weight), ROCmFP4 (4,25 bits/weight); también se menciona Q2_K, IQ2_XXS, IQ3_XXS, MXFP4 en la mezcla |
| Idiomas soportados | no disponible (el modelo base DeepSeek V4 Flash es multilingüe, pero no se especifica en la ficha) |
| Licencia | MIT |
| Formato de pesos | GGUF (con bloques ROCmFPX) |

## Arquitectura y entrenamiento

El modelo base es DeepSeek V4 Flash 0731, un MoE de 284B parámetros con 43 capas enrutadas y 256 expertos por capa. La arquitectura del motor de inferencia está diseñada para RDNA3/3.5 (AMD): los kernels HIP utilizan instrucciones específicas como `v_perm_b32` para expandir los codebooks en registros, y `dp4a` para productos punto enteros, evitando la dequantización en coma flotante. El formato de pesos ROCmFPX es una familia de formatos de bloque con 32 pesos por bloque y escalas empaquetadas, diseñados conjuntamente con los kernels de decodificación.

El entrenamiento del modelo base no se detalla en la documentación del repo, pero el fork se centra en la inferencia optimizada. El sistema de decodificación utiliza **DSpark**, un drafter de 3 capas que propone hasta 3 tokens y el modelo principal verifica 4 posiciones en una pasada fusionada (verificación especulativa), con reutilización de pesos entre las columnas de verificación. Para el prefill, se usa un indexador disperso aprendido que alcanza ~250 tok/s en prompts de 8K tokens.

El fork también incluye un slab allocator para streaming de expertos desde SSD, que corrige un fallo del upstream que asignaba memoria basándose en el tamaño de la primera capa en lugar del máximo entre las 43 capas, lo que causaba fallos de MMU en ROCm.

## Capacidades

- Generación de texto en modo autodidacta con decodificación especulativa (hasta 3 tokens propuestos por el drafter).
- Razonamiento multi-paso y matemáticas, dado que el modelo base DeepSeek V4 Flash está entrenado para ello.
- Generación de código, como es habitual en los modelos DeepSeek.
- Tool calling y function calling, aunque no se menciona explícitamente en la documentación, es una capacidad estándar en DeepSeek V4.
- Capacidades multilingües (el modelo base soporta múltiples idiomas, aunque la ficha no los detalla).
- No se menciona soporte de visión ni audio.

## Casos de uso

- **Inferencia local en entornos sin conexión**: el modelo se ejecuta completamente en un mini-PC con APU AMD, por lo que es útil para aplicaciones que requieren privacidad total de los datos, como análisis de documentos sensibles o asistentes personales en dispositivos del usuario.
- **Desarrollo y prueba de aplicaciones de IA**: los desarrolladores pueden iterar sobre prompts y flujos de agente con un modelo de 284B sin incurrir en costes por token, usando la misma máquina de desarrollo.
- **Asistente de programación local**: con capacidad de generación de código y un contexto largo, puede integrarse en IDEs como un copiloto que no envía código a servidores externos.
- **Investigación en eficiencia de inferencia**: la combinación de cuantización ROCmFPX y kernels RDNA es un caso de estudio para quienes trabajan en optimización de LLM en hardware AMD.
- **Educación y demostraciones**: permite demostrar la ejecución de un modelo de gran escala en hardware de consumo, útil en cursos de sistemas distribuidos o IA aplicada.
- **Procesamiento de texto largo**: aunque el contexto no está especificado, el modelo base DeepSeek V4 Flash soporta ventanas largas, y el motor está diseñado para manejar prompts de 8K tokens en prefill rápido, lo que lo hace adecuado para resúmenes o análisis de documentos extensos.

## Benchmarks y rendimiento

La documentación del fork incluye mediciones de velocidad de decodificación en la misma configuración de hardware (Strix Halo, 128 GB unificados):

| Motor / Cuantización | Decodificación (tok/s) |
| :--- | ---: |
| DwarfStar · Q2_K | 15.60 |
| HipFire · MQ2 + MTP | 18.99 |
| **Este stack (ROCmFPX + DSpark)** | **32.00** |

Según el autor, esto es 2.05× más rápido que el líder anterior en memoria unificada y 68.5% más rápido que el segundo clasificado. No se proporcionan resultados de benchmarks estándar como MMLU, HumanEval o GSM8K para este modelo específico.

## Requisitos de hardware

- **APU**: AMD Ryzen AI MAX+ 395 con Radeon 8060S (Strix Halo, gfx1150). Es el único hardware soportado.
- **Memoria unificada**: 128 GB (el modelo en formato ROCmFPX ocupa 102.3 GB, dejando ~25.7 GB para el sistema operativo y el runtime).
- **GPU dedicada**: no necesaria; la APU integra la GPU.
- **Sistema operativo**: Ubuntu 24.04 HWE, con ROCm 7.2.x.
- **Almacenamiento**: SSD con suficiente espacio para el archivo GGUF (~102 GB) y con velocidad suficiente para el streaming de expertos.
- **Herramientas de despliegue**: el repo incluye scripts de diagnóstico (`make rocm-diag`, `rocm-doctor`, `rocm-smoke`, `rocm-bench-quick`) y configuración automática de TTM (`DS4_ROCM_TTM_AUTORAISE=1`).
- **Latencia**: decodificación a 32 tok/s en batch 1; prefill a ~250 tok/s en prompts de 8K tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Velocidad en Strix Halo |
| :--- | ---: | ---: | ---: | --- | ---: |
| **ds4fa (este)** | 284B MoE | no disponible | MIT | GGUF/ROCmFPX | 32 tok/s decode |
| `antirez/ds4` (upstream) | 284B MoE | no disponible | MIT | GGUF | inferior (sin optimizaciones para Strix) |
| DeepSeek V4 Flash (original) | 284B MoE | no disponible | MIT | safetensors | no aplicable (requiere GPU dedicada) |

No se dispone de datos de rendimiento para otros modelos MoE de tamaño similar en esta plataforma, por lo que la comparativa se limita al upstream y al modelo original.

## Limitaciones y advertencias

- **Hardware específico**: el motor está escrito para la arquitectura gfx1150 (RDNA3.5). No funcionará en otras GPUs AMD (RX 7000, etc.) ni en NVIDIA.
- **Memoria mínima**: requiere 128 GB de memoria unificada; el modelo no cabe en 64 GB (el archivo de 102.3 GB no entra en la memoria de 64 GB).
- **Sistema operativo**: solo Ubuntu 24.04 HWE, con ROCm 7.2.x. No se garantiza compatibilidad con otras distribuciones o versiones.
- **Cuantización de baja precisión**: los pesos en ROCmFP2 (2.5 bits) pueden degradar la calidad de las respuestas en comparación con cuantizaciones más altas, aunque no hay benchmarks de precisión en la documentación.
- **Sesgos y alucinaciones**: no se han documentado específicamente para este modelo, pero al ser una cuantización de un modelo base, hereda los sesgos de DeepSeek V4 Flash. No se proporcionan datos de evaluación de sesgos.
- **Licencia**: el fork está bajo MIT, pero el modelo base DeepSeek V4 Flash puede tener su propia licencia (no se especifica en la ficha).
- **Estado del proyecto**: el repo tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere que es un proyecto de entusiasta con soporte limitado.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/julianmb/ds4fa)
- [Repositorio GitHub ds4fa](https://github.com/julianmb/ds4fa)
- [Repositorio GitHub HaloFPX (herramientas relacionadas)](https://github.com/julianmb/halofpx)
- [Pesos del modelo DeepSeek-V4-Flash-0731-IQ2XXS-STRIX en HuggingFace](https://huggingface.co/julianmb/DeepSeek-V4-Flash-0731-IQ2XXS-STRIX)
