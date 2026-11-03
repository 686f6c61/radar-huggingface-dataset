# brbrainerd/vox-mens-index

## Resumen

`vox-mens-index` no es un modelo de lenguaje, sino un repositorio de metadatos que actúa como registro canónico de versiones e índice de descubrimiento para la suite **Vox MENS** (Model Engine & Neural Synthesis). Esta suite la mantiene el proyecto de la [Vox programming language](https://vox-lang.org) y consiste en adaptadores especializados en dominio construidos sobre la familia Qwen3 de Alibaba. El repositorio lo publica el usuario `brbrainerd` bajo licencia Apache 2.0 y está etiquetado con `vox`, `vox-lang`, `mens`, `model-registry`, `rust` y `typescript`.

El propósito del índice es evitar que el binario `vox` tenga codificados hashes de commit de Hugging Face. En su lugar, la CLI `vox mens` consulta este índice para resolver la etiqueta de versión `v<N>` más reciente de cada nivel de parámetros (0.6B, 1.7B, 4B y 8B), comprobar la compatibilidad del adaptador con la versión de gramática y esquema de diagnóstico del compilador `voxc` instalado, y auditar métricas de telemetría del *eval-gate* (tasas de aprobación, retención colateral y digests SHA256) antes de descargar pesos.

Dado que este repositorio no contiene pesos ni una arquitectura propia, los datos de especificaciones técnicas, entrenamiento y benchmarks de esta ficha corresponden únicamente a lo que el índice declara sobre los modelos referenciados y, en la mayoría de los casos, no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: repositorio de índice de metadatos (no contiene pesos). Los modelos referenciados se basan en Qwen3 |
| Parametros totales | No disponible (el índice referencia niveles de 0.6B, 1.7B, 4B y 8B) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (el repositorio aloja manifiestos e índice, no artefactos de pesos) |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura de red neuronal: es un manifiesto de versiones y un índice de descubrimiento consumido por la CLI `vox mens`. Su contenido estructura la resolución de etiquetas `v<N>` por nivel de parámetros, la verificación de compatibilidad con la gramática y el esquema de diagnóstico de `voxc`, y la auditoría de telemetría del *eval-gate* (tasas de aprobación, retención colateral y digests SHA256 de los artefactos).

Los modelos a los que apunta el índice son adaptadores especializados en dominio sobre `Qwen/Qwen3-0.6B`, `Qwen/Qwen3-1.7B`, `Qwen/Qwen3-4B` y `Qwen/Qwen3-8B`. No se proporcionan datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Resolución de etiquetas de versión: descubre la etiqueta `v<N>` verificada más reciente para cada nivel de parámetros (0.6B, 1.7B, 4B, 8B).
- Verificación de compatibilidad de toolchain: compara la revisión del adaptador con la versión de gramática y esquema de diagnóstico de `voxc`.
- Auditoría de telemetría del *eval-gate*: expone tasas de aprobación, métricas de retención colateral y digests SHA256 de artefactos.
- Fijación de revisiones inmutables mediante `--revision v1` para despliegues reproducibles.
- Sincronización de artefactos locales y actualización del índice para mantenedores (`vox mens hub sync`).
- Distribución de adaptadores para síntesis de código Vox en cuatro niveles: completado de sintaxis en línea (0.6B), generación de un solo fichero y corrección de diagnósticos (1.7B), síntesis equilibrada y reparación con el compilador en el bucle (4B), y síntesis multi-módulo y refactorización de AST compleja (8B).
- No se documentan en la información disponible capacidades de tool calling genérico, agentes, visión, audio ni modo de razonamiento extendido para los adaptadores referenciados.

## Casos de uso

- Integración en la CLI `vox mens`: la herramienta consulta el índice para resolver la revisión correcta antes de descargar pesos, lo que elimina la necesidad de incrustar hashes de commit en el binario y simplifica las actualizaciones del toolchain.
- Despliegues reproducibles en CI/CD: fijar `--revision v1` garantiza que los pipelines de compilación usen exactamente la misma revisión del adaptador, evitando derivas por actualizaciones silenciosas del registro.
- Completado de sintaxis en el editor: el nivel 0.6B está pensado para completado de sintaxis en línea y de latencia ultrabaja, adecuado para entornos con recursos limitados o inferencia en el borde.
- Corrección automática de diagnósticos del compilador: el nivel 1.7B se orienta a generación de un solo fichero y corrección de errores detectados por `voxc`, útil en bucles de reparación automática tras un fallo de compilación.
- Reparación con el compilador en el bucle: el nivel 4B actúa como opción equilibrada por defecto para flujos en los que el modelo propone código, se compila y se reinyectan los diagnósticos hasta converger.
- Refactorización de AST multi-módulo: el nivel 8B está destinado a síntesis profunda y refactorización de árboles de sintaxis complejos que abarcan varios módulos, donde se requiere mayor capacidad de razonamiento sobre el código.
- Auditoría de procedencia de artefactos: los equipos de plataforma pueden verificar los digests SHA256 y las métricas del *eval-gate* publicadas en el índice antes de promover una revisión a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El índice menciona métricas de *eval-gate* (tasas de aprobación y retención colateral) como datos auditables, pero no se incluyen valores numéricos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende del nivel de parámetros del adaptador referenciado (0.6B, 1.7B, 4B u 8B) y de la cuantización, dato que no se especifica.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: la información solo documenta la CLI `vox mens` (`hub pull`, `hub sync`) como mecanismo de obtención de artefactos; no se detallan servidores de inferencia como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Repositorio | Tipo | Contenido | Licencia | Idiomas |
|---|---|---|---|---|
| `brbrainerd/vox-mens-index` | Índice de metadatos | Manifiestos, etiquetas de versión, telemetría de *eval-gate* | Apache 2.0 | Inglés |
| `brbrainerd/vox-mens-qwen3-0.6b` | Adaptador sobre Qwen3-0.6B | Pesos del adaptador (nivel 0.6B) | No disponible en la información | No disponible |
| `brbrainerd/vox-mens-qwen3-1.7b` | Adaptador sobre Qwen3-1.7B | Pesos del adaptador (nivel 1.7B) | No disponible en la información | No disponible |
| `brbrainerd/vox-mens-qwen3-4b` | Adaptador sobre Qwen3-4B | Pesos del adaptador (nivel 4B) | No disponible en la información | No disponible |
| `brbrainerd/vox-mens-qwen3-8b` | Adaptador sobre Qwen3-8B | Pesos del adaptador (nivel 8B) | No disponible en la información | No disponible |

No se dispone de datos de rendimiento para comparar con alternativas de la misma categoría.

## Limitaciones y advertencias

- Este repositorio no contiene un modelo utilizable para inferencia: aloja metadatos. Cualquier intento de cargarlo como modelo fallará.
- El índice está en inglés y no declara soporte multilingüe más allá de `en`.
- La utilidad del índice está acoplada al toolchain `voxc` y a la CLI `vox mens`; fuera de ese ecosistema su valor es nulo.
- Los adaptadores referenciados heredan las limitaciones, sesgos y riesgos de alucinación de los modelos base Qwen3, que no se detallan en la información proporcionada.
- La licencia Apache 2.0 se declara para el repositorio de índice; no se confirma en la información disponible que los repositorios de adaptadores referenciados compartan la misma licencia.
- El repositorio registra 0 descargas y 0 likes, lo que indica una adopción muy baja y ausencia de validación comunitaria.
- No hay datos publicados sobre contexto máximo, cuantizaciones disponibles ni requisitos de hardware de los adaptadores.

## Enlaces

- Repositorio del índice en Hugging Face: https://huggingface.co/brbrainerd/vox-mens-index
- Adaptador 0.6B: https://huggingface.co/brbrainerd/vox-mens-qwen3-0.6b
- Adaptador 1.7B: https://huggingface.co/brbrainerd/vox-mens-qwen3-1.7b
- Adaptador 4B: https://huggingface.co/brbrainerd/vox-mens-qwen3-4b
- Adaptador 8B: https://huggingface.co/brbrainerd/vox-mens-qwen3-8b
- Web del lenguaje Vox: https://vox-lang.org
- Organización en GitHub: https://github.com/vox-foundation/vox
