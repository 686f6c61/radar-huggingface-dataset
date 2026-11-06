# medismera/ZwZ2-4B-Surgical-Abliterated

## Resumen

ZwZ2-4B-Surgical-Abliterated es una versión modificada del modelo inclusionAI/ZwZ2-4B, publicado por el usuario medismera en Hugging Face. Se trata de un modelo de lenguaje causal de aproximadamente 4,54 mil millones de parámetros (según los metadatos de safetensors) al que se le ha aplicado un proceso de "abliteración quirúrgica": una proyección direccional en el espacio latente que elimina el denominado subespacio de rechazo en capas críticas del transformer, con el objetivo de suprimir las negativas estandarizadas y los avisos morales del modelo.

El modelo se publica bajo licencia Apache 2.0 y está orientado a investigación académica, red-teaming, auditoría de seguridad y exploración creativa sin restricciones. El autor afirma que la modificación se realizó preservando la norma de Frobenius y aplicando restricciones ortogonales benignas, de modo que las capacidades de código, conocimiento factual y razonamiento no se degraden; estas afirmaciones no están verificadas de forma independiente.

Es relevante en el contexto actual porque los modelos "abliterated" o "uncensored" se han popularizado entre investigadores de seguridad y desarrolladores que necesitan modelos base sin capas de alineación para pruebas de robustez, aunque su uso conlleva riesgos éticos y legales significativos que el propio autor traslada al usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (causal-lm), variante qwen3_5 segun tags |
| Parametros totales | 4.539.265.536 |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se distribuye en safetensors; el repo incluye GGUF segun tags, cuantizaciones concretas no especificadas) |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo base es inclusionAI/ZwZ2-4B, una arquitectura densa de 4B parametros descrita por el autor como equilibrada para despliegue en el borde con alto rendimiento (high-throughput edge deployment). Los tags del repositorio indican la familia qwen3_5, lo que sugiere una arquitectura tipo transformer decoder con atencion causal estandar. No se dispone de informacion sobre el numero de tokens de preentrenamiento, la composicion del dataset ni los procesos de post-entrenamiento (SFT, RLHF o DPO) del modelo base.

La novedad principal de esta version es la abliteracion quirurgica de rechazos: segun la model card, se identifico un "subespacio unificado de rechazo" en las representaciones latentes de capas criticas del transformer y se proyecto fuera de dicho subespacio, bajo restricciones ortogonales benignas y preservando la norma de Frobenius. El objetivo es eliminar respuestas de rechazo predefinidas (del tipo "As an AI..." o "I cannot fulfill this request...") sin degradar la sintaxis de programacion, la correccion algoritmica ni la profundidad de razonamiento. Esta tecnica de modificacion se aplica en inferencia sobre pesos ya entrenados; no implica reentrenamiento.

## Capacidades

- Generacion de texto conversacional en ingles, sin rechazos de alineacion ni avisos morales segun el autor.
- Generacion de codigo: la model card destaca la preservacion de la sintaxis de programacion y la correccion algoritmica tras la abliteracion.
- Razonamiento logico: el autor afirma que se retiene la "profundidad de razonamiento cruda" sin el impuesto de alineacion (alignment tax).
- Uso en tareas de analisis de redes y auditoria de ciberseguridad: el ejemplo de la model card genera un script Python de auditoria de red local con sockets crudos.
- Compatibilidad con plantillas de chat: el codigo de ejemplo comprueba y aplica el chat template del tokenizador si esta disponible.
- No hay evidencia en la informacion disponible de capacidades multimodales (vision, audio), tool calling nativo ni modos de razonamiento explicitos (thinking mode).

## Casos de uso

- Red-teaming y evaluacion de seguridad: permite estudiar comportamientos de modelos sin capa de rechazo, probar jailbreaks contra sistemas con alineacion y comparar respuestas con y sin abliteracion en benchmarks de seguridad.
- Auditoria de ciberseguridad ofensiva y defensiva: generacion de scripts de analisis de redes locales, herramientas de pentesting educativo o analisis de vulnerabilidades en entornos controlados y legales.
- Investigacion academica sobre alineacion: como artefacto abierto, sirve para investigar como el subespacio de rechazo afecta a las representaciones latentes y si su eliminacion degrada capacidades generales.
- Generacion de codigo en entornos locales: con ~4,5B parametros cabe en GPUs de consumo, lo que lo hace util como asistente de programacion offline donde no se deseen rechazos del modelo.
- Escritura creativa sin restricciones: produccion de narrativa, dialogos o contenido ficticio que los modelos alineados suelen bloquear, bajo responsabilidad del usuario.
- Despliegue en el borde (edge): el tamano reducido y el formato GGUF permiten ejecutarlo en hardware modesto para prototipado rapido de agentes conversacionales en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma cualitativamente que la abliteracion preserva los benchmarks de conocimiento factual, precision en codigo y razonamiento logico, pero no incluye cifras concretas ni comparaciones.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9-10 GB para los pesos (4,54B parametros a 2 bytes), mas overhead de KV cache; alrededor de 5-6 GB con cuantizacion a 4 bits (GGUF Q4).
- GPUs recomendadas: una RTX 3060 de 12 GB, RTX 4060 Ti 16 GB o RTX 4090 son suficientes en precision completa; no se requieren aceleradores de centro de datos como A100 o H100.
- Cabe comodamente en GPUs de consumo: cualquier GPU con 8 GB o mas en cuantizacion de 4 bits, o 12 GB o mas en BF16.
- Opciones de despliegue: transformers (codigo de ejemplo incluido con trust_remote_code=True), llama.cpp y Ollama gracias al formato GGUF; el tamano y arquitectura densa lo hacen compatible en principio con vLLM y TGI, aunque no hay confirmacion explicita del autor.
- Latencia y throughput: no disponibles; al ser un modelo denso de 4B orientado a edge, cabe esperar latencias bajas en GPUs de consumo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Abliterado | Formatos |
|---|---|---|---|---|---|
| medismera/ZwZ2-4B-Surgical-Abliterated | 4,54B | No disponible | Apache 2.0 | Si | Safetensors, GGUF |
| inclusionAI/ZwZ2-4B (base) | 4,54B | No disponible | No disponible en la informacion proporcionada | No | No disponible |
| Otras variantes abliterated de 4B (p. ej. derivadas de Qwen o Llama) | ~4B | Tipicamente 32k-128k | Varia (Apache 2.0, Llama) | Si | Safetensors, GGUF |

La comparacion con modelos alternativos es limitada porque no hay datos de rendimiento publicados para esta ficha; el diferenciador principal frente al modelo base es la eliminacion del subespacio de rechazo, y frente a otros modelos abliterated, la familia qwen3_5 subyacente y la licencia Apache 2.0.

## Limitaciones y advertencias

- Riesgo de alucinacion: al tratarse de un modelo de lenguaje generativo, puede producir informacion falsa con apariencia plausible; la abliteracion no corrige este problema y la ausencia de rechazos puede facilitar la generacion de contenido incorrecto sin advertencias.
- Sin filtros de seguridad: el modelo no emite negativas ni avisos morales, por lo que puede generar contenido harmful, ilegal o peligroso si se le solicita. El autor traslada explicitamente la responsabilidad legal y etica al usuario.
- Sesgos conocidos: no disponibles; no se ha publicado evaluacion de sesgos para el modelo base ni para esta variante.
- Idioma: declarado solo para ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea inferior.
- Longitud de contexto: no documentada, lo que dificulta planificar aplicaciones con documentos largos o conversaciones multi-turno extensas.
- Verificacion independiente ausente: las afirmaciones sobre preservacion de capacidades (codigo, razonamiento, benchmarks) provienen del autor y no estan respaldadas por evaluaciones publicadas.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el despliegue en produccion de un modelo sin salvaguardas exige implementar filtros y moderacion externos; ademas, trust_remote_code=True implica ejecutar codigo del repositorio, lo que requiere revision de seguridad previa.
- Descargas y adopcion muy bajas (663 descargas, 0 likes en el momento de la ficha), lo que sugiere escasa validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/medismera/ZwZ2-4B-Surgical-Abliterated
- Modelo base: https://huggingface.co/inclusionAI/ZwZ2-4B
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
