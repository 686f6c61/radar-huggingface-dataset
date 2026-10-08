# kmnstudio101/Muse-Glimmer-30B-Uncensored-Heretic

## Resumen

Muse-Glimmer-30B-Uncensored-Heretic es una version "abliterated" o decensored del modelo Muse-Glimmer-30B desarrollado por Meta Superintelligence Lab. Se trata de un transformer causal denso multimodal de aproximadamente 29.600 millones de parametros, disenado para tareas agenticas autonomas que se ejecutan en hardware de consumo, con un encoder de percepcion dedicado para entrada de imagen. Esta variante concreta, publicada por el usuario kmnstudio101, ha sido modificada con la herramienta Heretic v2.0.0.dev0+custom para reducir drasticamente el alineamiento de seguridad del modelo original.

El modelo base integra razonamiento multi-paso, uso fiable de herramientas (tool calling), comprension multimodal y recuperacion ante fallos en un unico modelo que puede ejecutarse localmente sin infraestructura en la nube. Su arquitectura combina un decoder de 52 capas con patron de atencion hibrido local/global (ventana deslizante de 2048 tokens) y un encoder de vision ViT-G/14 de aproximadamente 1.800 millones de parametros. El contexto supera los 131.072 tokens.

La relevancia de esta ficha radica en su naturaleza de modelo "uncensored": la intervencion de abliteration elimina practicamente todos los rechazos ligados a seguridad (0/100 en la metrica de keywords de rechazo, frente a 100/100 del modelo original), lo que lo convierte en una herramienta de investigacion en seguridad, alineamiento y red-teaming, pero con riesgos claros para cualquier uso en produccion orientado al usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con encoder de percepcion (ViT-G/14); atencion hibrida [Local, Local, Local, Global] |
| Parametros totales | 29.776.626.688 (29,6B, incluye el encoder de vision) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 131.072+ tokens |
| Tipos de cuantizacion | no disponible en este repositorio (pesos en safetensors; existen variantes GGUF en repositorios de terceros) |
| Idiomas soportados | mas de 100 idiomas en el modelo base; la model card de esta variante no detalla lista concreta |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 59,6 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer causal denso de 52 capas con dimension oculta de 6656 y un patron de atencion que repite la secuencia [Local, Local, Local, Global], con ventana deslizante de 2048 tokens en las capas locales. Usa atencion con puerta (gated attention), GQA con ratio 16:1 (32 cabezas Q y 2 KV), dimension de cabeza 128 y codificacion posicional RoPE con theta de 500.000 aplicada solo a las capas locales. El FFN es de tipo SwiGLU con dimension intermedia de 19.968. El vocabulario es de 202.048 entradas (200.000 tokens BPE mas 2.048 tokens especiales). Incorpora un encoder de percepcion ViT-G/14 de aproximadamente 1.800 millones de parametros, 50 capas, ancho 1536 y patch size de 14, con un maximo de 4096 tokens visuales por imagen. La atencion es de tipo causal denso, sin mezcla de expertos.

El modelo fue destilado a partir de Muse Spark y entrenado con contenido multimodal de origen publico, datos de terceros e informacion de productos y servicios de Meta, curado por redes de proveedores externos. La variante aqui descrita aplica una ablacion de direcciones de rechazo (abliteration) mediante Heretic v2.0.0.dev0+custom, con parametros especificos (start_layer_index 15, end_layer_index 32, target_components attn.o_proj y mlp.down_proj, lora_rank 128, transport gaussian, ridge_regularization 0.015, entropy_regularization 0.1, entre otros). No se especifica en la informacion disponible si el modelo base uso RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento multi-paso sobre horizontes largos, manteniendo planes coherentes en flujos de trabajo extendidos.
- Comprension multimodal de entrada: acepta texto e imagenes intercaladas mediante su encoder de percepcion, lo que permite interpretar capturas de pantalla, graficos y documentos.
- Uso fiable de herramientas: manejo de function calling con esquemas precisos a lo largo de flujos extensos.
- Recuperacion ante fallos: cuando una llamada a herramienta falla o devuelve un resultado inesperado, el modelo diagnostica el error y reintenta en lugar de detenerse.
- Compatibilidad con scaffolds de agentes: OpenClaw, Hermes Agent y otros patrones de orquestacion agentica.
- Esfuerzo controlable: soporta distintos niveles de razonamiento para equilibrar calidad y velocidad.
- Multilingue: entrenado con datos de mas de 100 idiomas.
- Salida de razonamiento separada (reasoning output) y tool calling nativo segun la documentacion de NVIDIA NIM.
- Reduccion drastica del alineamiento de seguridad: metrica de keywords de rechazo de 0/100 frente a 100/100 del modelo original.

## Casos de uso

- Red-teaming y evaluacion de seguridad: el modelo sirve como sujeto de prueba para estudiar como se comportan los modelos sin alineamiento y medir la eficacia de filtros de salida. Su reduccion de rechazos lo hace idoneo para generar casos adversarios controlados en entornos aislados.
- Investigacion sobre alineamiento y ablacion de direcciones: permite comparar el comportamiento del modelo original y el modificado (KL divergence de 0,0375) para estudiar que se pierde y que se gana al eliminar direcciones de rechazo.
- Agentes locales de automatizacion en escritorio: con mas de 131.000 tokens de contexto y soporte de tool calling, puede orquestar herramientas locales en flujos multi-paso sin depender de la nube.
- Analisis de documentos y capturas: su encoder de vision permite extraer informacion de graficos, PDFs escaneados y pantallas, integrandola en conversaciones multi-turno largas.
- Automatizacion de tareas tecnicas sobre repositorios de codigo: el modelo base fue evaluado en SWE-Bench, por lo que puede emplearse en depuracion y resolucion de incidencias en pipelines de desarrollo, siempre con supervision humana.
- Asistentes conversacionales de investigacion sin restricciones tematicas: util en entornos academicos donde el filtrado excesivo impide estudiar temas sensibles, manteniendo verificacion humana obligatoria.
- Simulacion de personajes o escenarios de ficcion con contenido adulto: aprovechando la ausencia de rechazos, con las advertencias legales y eticas correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor solo aporta dos metricas comparativas respecto al modelo original:

| Metrica | Este modelo | Modelo original (meta-models/Muse-Glimmer-30B) |
|---|---|---|
| Keywords (rechazos) | 0/100 | 100/100 |
| Divergencia KL | 0,0375 | 0 (por definicion) |

El modelo base menciona evaluacion en DeepSearch QA, MCP-Atlas, τ3-Bench y SWE-Bench, pero no se incluyen cifras concretas en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: en torno a 60 GB (los pesos ocupan 59,6 GB en el repositorio), por lo que requiere GPU de gama profesional o varias GPU.
- VRAM estimada en 8 bits: aproximadamente 30 GB.
- VRAM estimada en 4 bits: aproximadamente 15-16 GB, lo que permite ejecucion en GPUs de consumo con 24 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para precision completa; RTX 4090 (24 GB) o RTX 3090 (24 GB) viables en cuantizacion de 4 bits.
- Cabe en GPU de consumo: si, en GPUs con 24 GB o mas usando cuantizacion de 4 bits (existen variantes GGUF publicadas por terceros).
- Opciones de despliegue: transformers (formato original safetensors), vLLM, TGI y llama.cpp/Ollama mediante las variantes GGUF de terceros. La model card indica compatibilidad con endpoints.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-Uncensored-Heretic (este) | 29,6B denso | 131.072+ | Texto + imagen | apache-2.0 | HuggingFace (kmnstudio101) |
| Muse-Glimmer-30B (original) | 29,6B denso | 131.072+ | Texto + imagen | apache-2.0 | HuggingFace (meta-models) |
| Muse-Glimmer-30B-heretic (darkc0de) | 30B denso | no disponible | Texto + imagen | no disponible | Featherless (11/100 rechazos) |
| Muse-Glimmer-30B-Uncensored (Meta-muse) | 30B denso | no disponible | Texto + imagen | no disponible | HuggingFace; vision tower intacta |

Los tres modelos derivados comparten la misma base y difieren principalmente en la herramienta y los parametros de abliteration aplicados, lo que afecta a la tasa de rechazos y a la divergencia respecto al original.

## Limitaciones y advertencias

- Reduccion sustancial del alineamiento de seguridad: la propia model card advierte de una mayor probabilidad de generar contenido dañino, inexacto, sesgado, ofensivo o inapropiado.
- Riesgo elevado de alucinacion y de respuestas incorrectas sin advertencia, dado que el filtrado de seguridad no actua.
- Uso previsto exclusivamente para investigacion y experimentacion (seguridad, alineamiento, red-teaming); el autor pide evitar su despliegue en servicios publicos o de cara al usuario final.
- Todas las salidas deben tratarse como no fiables y verificarse de forma independiente.
- Responsabilidad del usuario: evaluar la idoneidad del contenido, implementar salvaguardas y supervision humana, y cumplir la legislacion aplicable.
- La licencia apache-2.0 es permisiva, pero la naturaleza del modelo plantea riesgos legales y eticos en funcion del uso y la jurisdiccion.
- La ficha no detalla limitaciones concretas de contexto o idioma; el modelo base cubre mas de 100 idiomas, pero no se garantiza un rendimiento uniforme.
- Es un trabajo derivado; todos los derechos del modelo base pertenecen a sus propietarios originales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kmnstudio101/Muse-Glimmer-30B-Uncensored-Heretic
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Heretic (proyecto): https://heretic-project.org
- Repositorio de Heretic en GitHub: https://github.com/p-e-w
- Ficha oficial de Muse Glimmer (Meta): https://dev.meta.ai/models/muse-glimmer
- Model card en NVIDIA NIM: https://build.nvidia.com/meta/muse-glimmer-30b/modelcard
- Variante GGUF (cvgro): https://huggingface.co/cvgro/Muse-Glimmer-30B-Uncensored-Heretic-GGUF
- Variante heretic de darkc0de: https://featherless.ai/models/darkc0de/Muse-Glimmer-30B-heretic
- Variante uncensored de Meta-muse: https://huggingface.co/Meta-muse/Muse-Glimmer-30B-uncensored
- Paper del encoder de percepcion (ViT): https://arxiv.org/abs/2504.13181
- Referencia adicional citada en las etiquetas: https://arxiv.org/abs/2602.06036
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
