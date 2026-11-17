# dasd1231/MIGRO

## Resumen

MIGRO es un sistema de memoria a largo plazo desacoplada para modelos de lenguaje, desarrollado por Mingxi Zou y colaboradores (Universidad de Electrónica y Ciencia y Tecnología de China, entre otras instituciones). Su propuesta central es que la memoria debe sobrevivir al modelo: en lugar de almacenar el conocimiento persistente en los pesos de una red concreta, MIGRO lo guarda en un estado persistente externo que distintos modelos anfitriones pueden leer y seguir escribiendo. Esto permite heredar experiencia acumulada entre sucesivas generaciones de modelos sin reentrenamiento.

El repositorio de Hugging Face no contiene un modelo generativo completo, sino el payload de runtime compartido por el sistema: un núcleo congelado (encoder semántico y embeddings de origen), tokenizadores, tablas de codificación, recursos de direccionamiento semántico e interfaces de host congeladas para Phi y Mistral. La generación de respuestas se delega a un modelo backbone externo y a componentes de recuperación del runtime, por lo que MIGRO funciona como capa de memoria portable más que como LLM autónomo.

Es relevante ahora porque aborda un problema creciente en producción: la memoria conversacional y de agente queda atada al modelo que la generó, y migrar a un modelo nuevo implica perder historial o reconstruirlo. MIGRO plantea un formato de memoria independiente del anfitrión, con evaluación en el informe técnico sobre QA de largo plazo, transferencia entre hosts y almacenamiento persistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema de memoria desacoplada con encoder semántico congelado, direccionamiento semántico y interfaces de host congeladas (no es un transformer generativo completo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (componentes propios); componentes de terceros bajo MIT y Apache-2.0 |
| Formato de pesos | PyTorch (.pt) para núcleo, interfaces y recursos; tokenizadores en directorios dedicados |

## Arquitectura y entrenamiento

MIGRO no es un modelo de lenguaje monolítico, sino un sistema compuesto. El núcleo compartido (`minimal_core.pt`) contiene un encoder semántico congelado, embeddings de origen y tensores de runtime compartidos; incorpora componentes congelados de BAAI/bge-small-en-v1.5 (MIT) y embeddings de entrada y tokenizador de google/flan-t5-small (Apache-2.0). Sobre ese núcleo se apoyan módulos de direccionamiento semántico, tablas de codificación y recursos de persistencia que permiten reconstruir direcciones compactas y mantener el estado de memoria entre sesiones.

Las interfaces de host congeladas (`Phi_boundary.pt` y `Mistral_cal64.pt`) actúan como adaptadores de entrada para modelos anfitriones Phi y Mistral respectivamente, de modo que el mismo estado de memoria puede ser leído por distintos backbones. El sistema requiere compilar kernels nativos de codificación (`migro.backend.build_native`) y verificar el runtime antes de su uso. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; el informe técnico evalúa el sistema completo en QA de largo plazo, transferencia entre hosts y almacenamiento persistente.

## Capacidades

- Construcción y persistencia de memoria a largo plazo desacoplada del modelo anfitrión.
- Lectura de observaciones heredadas por modelos sucesivos y escritura continuada sobre el mismo estado.
- Direccionamiento semántico mediante encoder congelado y tokenizadores de origen.
- Transferencia entre hosts (interfaces específicas para Phi y Mistral).
- Generación de respuestas en combinación con un backbone externo y componentes de recuperación del runtime.
- Replay y edición de entradas, y generación de nuevas respuestas mediante el servidor de demo.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo de razonamiento explícito (thinking): no disponible.

## Casos de uso

- Memoria de agente persistente entre sesiones: el estado se guarda en el formato de MIGRO y se recupera en sesiones posteriores, de modo que un agente conserva observaciones previas sin depender de la ventana de contexto del modelo anfitrión.
- Migración de memoria entre generaciones de modelos: al cambiar de un backbone Phi a uno Mistral (o viceversa), la interfaz de host correspondiente permite leer el mismo estado heredado, evitando reconstruir el historial desde cero.
- Asistentes conversacionales de largo plazo: la memoria desacoplada permite mantener preferencias y hechos del usuario a lo largo de múltiples conversaciones, con el backbone generando las respuestas a partir de la recuperación del runtime.
- QA sobre documentación corporativa acumulada: el sistema de memoria indexa y direcciona semánticamente observaciones previas, adecuado para consultas que requieren recordar información introducida en interacciones anteriores.
- Investigación en sistemas de memoria para LLM: el payload publicado (núcleo, tablas de codificación, interfaces congeladas) permite reproducir los experimentos del informe técnico sobre transferencia entre hosts y almacenamiento persistente.
- Pipelines de agentes multi-paso con estado duradero: el runtime sirve trazas (`demo/serve.py`) y permite replay, útil para depurar y auditar decisiones de agentes que dependen de memoria persistente.
- Evaluación comparativa de backbones: al mantener la memoria constante y cambiar el host, se puede medir la contribución del backbone frente a la de la memoria en tareas de largo plazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El informe técnico (arXiv:2611.15315) evalúa el sistema completo en QA de largo plazo, transferencia entre hosts y almacenamiento persistente, pero los valores numéricos no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El payload del repositorio ocupa 0.2 GB, pero el consumo real depende del backbone anfitrión (Phi o Mistral) y del presupuesto de recuperación del runtime.
- GPU recomendadas: no disponibles de forma específica. El runtime admite `MIGRO_DEVICE=cuda`; la elección de GPU depende del backbone seleccionado.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; condicionada al backbone y a la memoria del sistema de recuperación.
- Opciones de despliegue: runtime propio de MIGRO (`python -m migro.backend.build_native`, `scripts/verify_runtime.py`, `demo/run.py`, `demo/serve.py`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Sistema | Tipo | Memoria persistente | Transferencia entre hosts | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MIGRO | Capa de memoria desacoplada + backbone externo | Sí, estado persistente | Sí (interfaces Phi y Mistral) | Apache-2.0 | Pesos de runtime en HF; backbone aparte |
| Memoria en contexto (ventana del LLM) | Nativa del modelo | No, limitada a la ventana | No | Según modelo | Universal |
| RAG con base vectorial externa | Recuperación sobre índice | Sí, índice externo | Parcial (depende del embedding) | Según implementación | Amplia |
| Fine-tuning con historial | Pesos del modelo | Implícita en pesos | No | Según modelo | Según modelo |

No se dispone de comparativas numéricas con alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo autónomo: requiere un backbone externo (Phi o Mistral) y componentes de recuperación para producir respuestas.
- Las interfaces de host están congeladas y son específicas de sus configuraciones soportadas; no hay garantía de compatibilidad con otros backbones no listados.
- El comportamiento en despliegue depende del host, la interfaz y el presupuesto de recuperación, por lo que los resultados pueden variar entre configuraciones.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta; madurez y soporte comunitario limitados.
- Idiomas soportados no declarados; los componentes de origen (flan-t5-small, bge-small-en-v1.5) están orientados al inglés, lo que puede limitar el rendimiento multilingüe.
- Riesgo de alucinación: no evaluado en la información disponible; al depender de un backbone externo, hereda sus sesgos y errores.
- La licencia Apache-2.0 aplica a los componentes propios; los componentes de terceros conservan sus licencias (MIT para bge-small-en-v1.5, Apache-2.0 para flan-t5-small) y deben respetarse sus avisos.
- Requiere compilación de kernels nativos y dependencias de runtime verificadas; la instalación no es un simple `pip install` del modelo.
- No se documentan en la información disponible sesgos específicos, límites de contexto numéricos ni restricciones adicionales para uso comercial más allá de la licencia.

## Enlaces

- Hugging Face: https://huggingface.co/dasd1231/MIGRO
- Paper: https://arxiv.org/abs/2611.15315
- Código: https://github.com/zOUMINGXI/MIGRO
- Demo interactiva: https://zoumingxi.github.io/MIGRO/
- Guía de runtime: https://github.com/zOUMINGXI/MIGRO/blob/main/docs/runtime.md
- Guía de evaluación: https://github.com/zOUMINGXI/MIGRO/blob/main/docs/evaluation.md
- Guía de demo: https://github.com/zOUMINGXI/MIGRO/blob/main/demo/README.md
- Componente de terceros (encoder): https://huggingface.co/BAAI/bge-small-en-v1.5
- Componente de terceros (embeddings y tokenizador): https://huggingface.co/google/flan-t5-small
