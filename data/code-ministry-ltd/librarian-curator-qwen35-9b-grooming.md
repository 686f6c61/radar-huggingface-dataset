# code-ministry-ltd/librarian-curator-qwen35-9b-grooming

## Resumen

El adaptador `librarian-curator-qwen35-9b-grooming` es un LoRA de rango 8 desarrollado por `code-ministry-ltd` para especializar el modelo base `unsloth/Qwen3.5-9B` en la tarea de **grooming** del sistema The Librarian, una capa de memoria duradera de código abierto para agentes de IA. The Librarian mantiene un almacén de notas (memorias, traspasos y referencias) enlazadas mediante wikilinks, y su componente curator ejecuta tres trabajos: cosecha, ingesta y limpieza. Este adaptador se centra exclusivamente en la limpieza: revisar periódicamente las memorias almacenadas, consolidar fragmentos en documentos únicos, eliminar entradas obsoletas o duplicadas, y decidir cuándo la acción correcta es no hacer nada.

El adaptador se entrenó mediante SFT (TRL vía Unsloth Studio) con un conjunto de datos deliberadamente pequeño de 100 casos de limpieza compilados de la instancia privada del autor. Según la model card, en una cohorte de evaluación sellada este adaptador de 100 casos superó en revisión ciega a hermanos entrenados con 250 y 500 casos, porque los adaptadores más grandes tendían a fusionar de forma demasiado agresiva. El adaptador se distribuye bajo licencia Apache-2.0 y pesa 14.548.992 parámetros (el propio LoRA), por lo que añade una huella mínima al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador) sobre Qwen3.5-9B (transformer decoder) |
| Parametros totales | 14.548.992 (solo adaptador LoRA) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (ventana de entrenamiento) |
| Tipos de cuantizacion | Adaptador en GGUF f16; modelo base puede cuantizarse (Q8_0 recomendado) |
| Idiomas soportados | No disponible (modelo base multilingüe, pero el adaptador no especifica) |
| Licencia | Apache-2.0 (coincide con la del modelo base) |
| Formato de pesos | safetensors (adaptador) y GGUF (LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 8 con alpha 8, entrenado mediante fine-tuning supervisado (SFT) con la librería TRL y Unsloth Studio sobre el modelo base `unsloth/Qwen3.5-9B`, que es una versión optimizada del Qwen3.5-9B bajo licencia Apache-2.0. El entrenamiento se realizó durante una sola época con un dataset privado de 100 casos de grooming extraídos de la instancia del autor. La ventana de contexto fue de 8.192 tokens, con pérdida calculada únicamente sobre la parte de completación, y las completaciones se entrenaron con el modo de pensamiento desactivado (non-thinking). Esto implica que para su uso correcto debe ejecutarse con `enable_thinking: false`.

No se han publicado detalles sobre la composición exacta del dataset ni sobre la técnica de fine-tuning más allá de SFT, ni se indica el uso de RLHF o DPO. La innovación principal no está en la arquitectura del adaptador, sino en la tarea específica para la que se entrena y en la decisión de mantener un conjunto de entrenamiento pequeño para evitar sobre-consolidación.

## Capacidades

- Ejecutar la tarea de **grooming** del sistema The Librarian: revisar una sección de memorias almacenadas y mejorarlas de forma holística.
- Consolidar fragmentos de memoria en documentos únicos y coherentes.
- Eliminar entradas obsoletas o duplicadas.
- Decidir cuándo la acción correcta es no modificar nada (decisión de no-op).
- Se integra con el flujo de dry-run / propuesta del curator, generando propuestas de cambio que pueden ser revisadas antes de aplicar.
- No aporta capacidades generales de generación de texto, razonamiento o código más allá de lo que ya ofrece el modelo base Qwen3.5-9B; su efecto se limita a la tarea de limpieza de memoria.

## Casos de uso

- **Mantenimiento de la memoria de un agente de código**: configurar el adaptador en el job de grooming del curator para que revise periódicamente el almacén de memorias y consolide notas fragmentadas, reduciendo el ruido y mejorando la recuperación posterior.
- **Eliminación de duplicados**: el adaptador detecta entradas repetidas o redundantes y las fusiona, evitando que el agente consulte información contradictoria.
- **Limpieza de memorias obsoletas**: elimina o reetiqueta entradas que ya no son relevantes para el contexto actual del proyecto.
- **Asistencia en revisión humana**: usarlo en modo propuesta (dry-run) para que el adaptador sugiera cambios, que un desarrollador puede aceptar o descartar antes de aplicar.
- **Optimización de costes de contexto**: al reducir el número de memorias duplicadas, se reduce la cantidad de tokens que el agente debe procesar en cada interacción, mejorando la latencia y el coste.
- **Integración con sistemas de agentes multi-herramienta**: el adaptador puede combinarse con el modelo base para que el agente de memoria funcione de forma autónoma dentro de un pipeline más amplio, siempre con supervisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este adaptador, ya que es un adaptador específico para una tarea de gestión de memoria y no un modelo general. El autor reporta en la model card los siguientes resultados sobre una cohorte de evaluación sellada y con revisión ciega:

| Metrica | Antes (sin adaptador) | Después (con adaptador) |
|---|---|---|
| Coincidencias exactas con el gold | 33 | 38 |
| Casos con deriva de prosa | 43 | 35 |

Estos números corresponden a una evaluación interna del autor y no a benchmarks estandarizados. No se dispone de comparaciones con otros adaptadores similares.

## Requisitos de hardware

- **VRAM para inferencia**: el adaptador en sí es minúsculo (14,5M parámetros, ~0,1 GB). La VRAM necesaria depende del modelo base Qwen3.5-9B. Con cuantización Q8_0 (~9 GB) se necesitan al menos 10-12 GB de VRAM; con Q4_K_M (~5,5 GB) unos 8 GB.
- **GPU recomendadas**: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4070, etc.) puede ejecutar el modelo base en cuantización baja. Para una mayor velocidad, RTX 4090, A100 o H100.
- **En consumer GPU**: sí, cabe en tarjetas de 8-12 GB con cuantización.
- **Opciones de despliegue**: el adaptador se puede cargar con PEFT/transformers en Python, o como LoRA GGUF con `llama.cpp` / `llama-server`. También compatible con vLLM si se fusiona el adaptador con el modelo base.
- **Latencia y throughput**: no se han publicado datos específicos. La latencia será la del modelo base (Qwen3.5-9B) más una sobrecarga mínima del adaptador.

## Comparativa con modelos similares

No se han identificado otros adaptadores LoRA específicos para la tarea de grooming de memoria en el ecosistema de The Librarian. El adaptador compite con el propio modelo base sin adaptar (es decir, con el Qwen3.5-9B general) para la tarea de limpieza de memorias, pero no existen modelos comparables en el mismo dominio. Se puede considerar una comparación con adaptadores genéricos de instrucción (por ejemplo, adaptadores de chat) pero no son funcionalmente equivalentes. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Dataset de entrenamiento muy pequeño** (100 casos) y privado, no redistribuido; puede no generalizar bien a dominios o formatos de memoria distintos a los del autor.
- **Sesgos de los datos**: los casos provienen de una única instancia de The Librarian, por lo que el adaptador puede estar sesgado hacia el estilo de memoria y de trabajo del autor.
- **Riesgo de sobre-consolidación**: el autor advierte que adaptadores más grandes tendían a fusionar demasiado, y este adaptador de 100 casos fue el que mejor se comportó, pero el riesgo de eliminar información útil sigue presente.
- **Requiere desactivar el modo de pensamiento**: el adaptador se entrenó sin completaciones de razonamiento, por lo que debe usarse con `enable_thinking: false`; de lo contrario, el comportamiento puede degradarse.
- **No es seguro para ejecución desatendida**: el autor recomienda usar el camino de propuesta (dry-run) y no confiar en el adaptador para decisiones autónomas definitivas.
- **Licencia**: Apache-2.0 para los pesos del adaptador, pero los datos de entrenamiento son privados y no se redistribuyen; no hay restricciones de uso comercial para el adaptador en sí.
- **Idiomas**: no se especifican idiomas soportados; el modelo base es multilingüe, pero el adaptador no ha sido evaluado para otros idiomas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/code-ministry-ltd/librarian-curator-qwen35-9b-grooming)
- [Documentación del Curator](https://librarian-docs.codeministry.net/dashboard/curator/)
- [Guía de configuración del curator](https://librarian-docs.codeministry.net/guides/configuring-the-curator/)
- [Página de The Librarian](https://codeministry.net/the-librarian/)
- [Repositorio de The Librarian](https://github.com/code-ministry-ltd/the-librarian)
- [README de The Librarian](https://github.com/code-ministry-ltd/the-librarian/blob/main/README.md)
