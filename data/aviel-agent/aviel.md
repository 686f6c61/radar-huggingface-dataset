# Aviel-Agent/aviel

## Resumen

Aviel es un modelo de lenguaje de tipo conversacional publicado por Aviel-Agent en Hugging Face, distribuido exclusivamente en formato GGUF con cuantizacion Q8_0. Segun la model card, se trata de un fine-tune basado en Llama 3.2 con aproximadamente 7.500 millones de parametros (7.532.860.480 segun los metadatos de safetensors), disenado para ejecutarse localmente dentro de la aplicacion de escritorio "Aviel Agent". El repositorio, de 8,6 GB, contiene tanto los pesos del modelo como el paquete de instalacion de la aplicacion.

El modelo se presenta como el motor de inferencia de una aplicacion de escritorio que, en su primer arranque, instala Ollama de forma automatica y descarga los pesos. Esta orientacion a despliegue local y a un unico caso de uso (asistente conversacional de escritorio) lo diferencia de los lanzamientos generalistas: no se publican datos de entrenamiento, benchmarks ni una model card tecnica detallada.

La relevancia de Aviel es limitada pero ilustrativa: muestra el patron creciente de fine-tunes de Llama 3.2 empaquetados como producto final con distribucion GGUF y gestion automatica del runtime. No obstante, la ausencia de documentacion tecnica, de evaluaciones publicadas y de un pipeline declarado hace que su adopcion fuera de la aplicacion propietaria deba abordarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Llama 3.2; detalles no disponibles) |
| Parametros totales | 7.532.860.480 (~7,5B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unico formato publicado en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | GGUF (aviel.gguf); metadatos safetensors para el conteo de parametros |

## Arquitectura y entrenamiento

La informacion disponible indica unicamente que Aviel es un fine-tune de Llama 3.2 con unos 7.500 millones de parametros, lo que situa la base en la familia de modelos densos de Meta de esa escala (arquitectura transformer decoder-only con atencion por grupos, aunque este extremo no se confirma en la model card). No se especifican el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF, DPO o SFT supervisado, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal.

El unico detalle operativo documentado es el empaquetado: el modelo se distribuye en GGUF con cuantizacion Q8_0 y se ejecuta mediante Ollama, que la propia aplicacion instala en el primer arranque. El repositorio incluye ademas el paquete de instalacion NSIS de la aplicacion de escritorio, lo que confirma que el modelo esta pensado para inferencia local en Windows x64.

## Capacidades

- Generacion de texto conversacional multi-turno, orientada a un asistente de escritorio.
- Razonamiento y respuesta a instrucciones heredados del fine-tune sobre Llama 3.2 (sin evaluaciones publicadas que lo confirmen).
- Ejecucion local mediante Ollama, sin dependencia de API en la nube una vez descargados los pesos.
- Compatibilidad declarada con endpoints (tag `endpoints_compatible`), lo que sugiere integracion con interfaces tipo API de chat.
- Soporte de tool calling, agentes, vision, audio o modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; no se declara lista de idiomas.

## Casos de uso

- Asistente conversacional de escritorio: el caso de uso principal y documentado. La aplicacion Aviel Agent instala Ollama y descarga `aviel.gguf` en el primer arranque, de modo que el modelo queda operativo en local sin configuracion manual por parte del usuario.
- Despliegue offline en entornos Windows x64: al distribuirse como GGUF Q8_0 y ejecutarse sobre Ollama, puede usarse en equipos sin acceso a internet una vez completada la descarga inicial, util en entornos con restricciones de red.
- Prototipado de asistentes integrados en aplicaciones de escritorio: el modelo sirve como referencia para empaquetar un fine-tune de Llama 3.2 con su runtime y su instalador en un unico producto.
- Evaluacion de fine-tunes de Llama 3.2 de 7,5B: util para equipos que quieran comparar el comportamiento de variantes comunitarias de esta escala en tareas conversacionales, siempre que se realicen evaluaciones propias dado que no hay benchmarks publicados.
- Chat local con requisitos de privacidad: al ejecutarse en la maquina del usuario mediante Ollama, las conversaciones no salen del equipo, lo que encaja en escenarios donde no se permite enviar datos a servicios externos.
- Base para fine-tuning adicional: los pesos en GGUF no son el formato ideal para reentrenar, pero el modelo puede servir como punto de partida conceptual para adaptaciones sobre Llama 3.2 en la misma escala, respetando la licencia Llama 3.2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion Q8_0 y ~7,5B de parametros, los pesos ocupan aproximadamente 8 GB; se recomienda un minimo de 8-10 GB de VRAM para cargar el modelo completo en GPU, o al menos 8-12 GB de RAM si se ejecuta en CPU.
- GPU recomendadas: RTX 3090, RTX 4090, A10, L4 o superiores para inferencia comoda en GPU; A100/H100 no son necesarias para esta escala.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM (por ejemplo RTX 3060 Ti 8 GB, RTX 3070, RTX 4060 Ti 16 GB), aunque con Q8_0 el margen es ajustado en las de 8 GB.
- Opciones de despliegue: Ollama es el runtime previsto por el autor; llama.cpp es compatible por el formato GGUF. vLLM y TGI no estan confirmados para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Aviel | ~7,5B | no disponible | GGUF Q8_0 | Llama 3.2 Community License | Fine-tune de Llama 3.2 empaquetado con app de escritorio; sin benchmarks publicados |
| Llama 3.2 8B Instruct (Meta) | 8B | 128K (segun documentacion de Meta) | safetensors, GGUF | Llama 3.2 Community License | Modelo base de referencia, con model card y evaluaciones publicas |
| Mistral 7B Instruct | 7,2B | 32K | safetensors, GGUF | Apache 2.0 | Alternativa de escala similar con licencia permisiva |
| Qwen2.5 7B Instruct | 7,6B | 128K | safetensors, GGUF | Apache 2.0 (segun variante) | Alternativa multilingue con evaluaciones publicadas |

La comparacion con Llama 3.2 8B es la mas directa por ser su base, pero Aviel no publica resultados que permitan medir la ganancia o perdida del fine-tune. Frente a Mistral 7B y Qwen2.5 7B, la diferencia principal es la licencia: la Llama 3.2 Community License impone restricciones adicionales frente a Apache 2.0.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se publican datos de entrenamiento, composicion del dataset, contexto soportado ni evaluaciones, lo que impide validar su calidad de forma objetiva.
- Riesgo de alucinacion: inherente a los modelos de 7,5B y no cuantificado en este caso por falta de benchmarks.
- Sesgos conocidos: no documentados; al derivar de Llama 3.2, hereda los sesgos de su base sin que el autor detalle mitigaciones.
- Idiomas: no se declara lista de idiomas soportados; no debe asumirse un rendimiento multilingue sin pruebas.
- Contexto: no disponible; no se debe asumir la ventana de 128K de Llama 3.2 sin confirmacion del autor.
- Licencia: la Llama 3.2 Community License exige cumplir la politica de uso aceptable de Meta y mantiene obligaciones de atribucion ("Built with Llama"); el uso comercial esta permitido con condiciones, pero debe revisarse el texto completo antes de desplegarlo en produccion.
- Distribucion atipica: el repositorio incluye un instalador de aplicacion de escritorio, no solo pesos; conviene auditar el paquete antes de ejecutarlo en entornos corporativos.
- Formato unico: solo se publica Q8_0 en GGUF, lo que limita el ajuste fino de VRAM y no ofrece alternativas de cuantizacion mas agresivas (Q4, Q5) listas para usar.
- Madurez: el repositorio tiene cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Aviel-Agent/aviel
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Politica de uso aceptable de Llama 3.2: https://www.llama.com/llama3_2/license/ (incluida en el enlace anterior segun la model card)
- Paper, blog, repositorio o demo adicionales: no disponibles
