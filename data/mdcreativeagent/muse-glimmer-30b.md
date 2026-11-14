# mdcreativeagent/Muse-Glimmer-30B

## Resumen

Muse Glimmer-30B es un modelo de lenguaje causal multimodal de aproximadamente 29.600 millones de parametros desarrollado por Meta Superintelligence Lab, con fecha de publicacion en agosto de 2026 y publicado en Hugging Face bajo el identificador `mdcreativeagent/Muse-Glimmer-30B`. Se trata de un transformer denso con un codificador de percepcion dedicado de unos 1.800 millones de parametros (ViT-G/14), destilado a partir de Muse Spark y disenado especificamente para tareas agenticas autonomass obre hardware de consumo.

El modelo resuelve el problema de ejecutar agentes completos (razonamiento multi-paso, uso fiable de herramientas, recuperacion ante fallos y comprension multimodal) de forma local, sin requerir infraestructura en la nube ni acceso a red. Su contexto supera los 131.072 tokens y utiliza un patron de atencion hibrido local/global con ventana deslizante de 2.048 tokens, lo que reduce el coste computacional en secuencias largas.

Su relevancia actual radica en la combinacion de un tamano contenido (apto para cuantizacion a 4 bits en menos de 20 GB), decodificacion especulativa mediante el modelo auxiliar DFlash y una licencia Apache 2.0 permisiva. Esto lo posiciona como una opcion practica para desplegar agentes multimodales en estaciones de trabajo con GPU de 24 o 32 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con codificador de percepcion (ViT-G/14) |
| Parametros totales | 29.776.626.688 (~29,6B, incluye el codificador visual) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072+ tokens |
| Tipos de cuantizacion | Full precision, K-Quant-Dynamic, K-Quant-17GB (aproximadamente 4 bits) |
| Idiomas soportados | Mas de 100 idiomas (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso de 52 capas con dimension oculta de 6.656, 32 cabezas de consulta y 2 cabezas clave-valor (GQA con ratio 16:1), dimension de cabeza 128 y FFN de tipo SwiGLU con dimension intermedia de 19.968. El patron de atencion es `[Local, Local, Local, Global]` repetido, con ventana deslizante de 2.048 tokens y atencion con compuertas (gated attention). La codificacion posicional es RoPE con theta de 500.000, aplicada solo en las capas locales. El vocabulario es de 202.048 tokens (200.000 BPE mas 2.048 especiales) y admite hasta 4.096 tokens visuales por imagen.

El codificador de percepcion es un ViT-G/14 de aproximadamente 1.800 millones de parametros, 50 capas, anchura 1.536 y patch de 14. El modelo fue destilado de Muse Spark y entrenado con contenido multimodal de datos publicos, datos de terceros e informacion de productos y servicios de Meta. El corte de conocimiento es el 4 de enero de 2026. La model card no detalla el numero exacto de tokens de entrenamiento ni si se aplicaron fases especificas de RLHF o DPO. La innovacion tecnica mas destacable es la decodificacion especulativa mediante DFlash, un modelo borrador de difusion por bloques que predice bloques de 16 tokens en una sola pasada y que el modelo principal verifica en paralelo, con 5 capas de borrador y 5 capas de caracteristicas ocultas uniformes sobre las capas {1, 13, 25, 37, 49} de las 52 del modelo objetivo.

## Capacidades

- Generacion de texto y razonamiento multi-paso sobre horizontes largos, con planes coherentes en flujos de trabajo extendidos.
- Comprension multimodal de entrada: texto e imagenes intercaladas (capturas de pantalla, graficos, documentos) mediante el codificador de percepcion.
- Uso fiable de herramientas y function calling con esquemas precisos a lo largo de flujos prolongados.
- Recuperacion ante fallos: diagnostica errores de llamadas a herramientas y reintenta en lugar de detenerse.
- Compatibilidad con scaffolds de agentes como OpenClaw, Hermes Agent y otros patrones de orquestacion.
- Esfuerzo de razonamiento controlable: permite ajustar la intensidad de razonamiento para equilibrar calidad y velocidad.
- Capacidades multilingues entrenadas sobre mas de 100 idiomas.
- Salida exclusivamente de texto (la entrada puede ser texto e imagen).

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus mas de 131.000 tokens de ventana, manteniendo el hilo de la conversacion y consultando herramientas internas mediante function calling.
- Agentes de escritorio locales: al ejecutarse en una GPU de 24 o 32 GB, puede interpretar capturas de pantalla y documentos para automatizar tareas de oficina sin enviar datos a la nube.
- Generacion y depuracion de codigo en produccion: su rendimiento en SWE-Bench y el soporte de tool calling permiten integrarlo en pipelines de CI/CD para proponer parches, ejecutar pruebas y corregir errores de forma iterativa.
- Automatizacion de flujos MCP: con compatibilidad con MCP-Atlas y esquemas de herramientas, puede orquestar llamadas a servidores MCP en tareas de recuperacion y ejecucion de acciones.
- Analisis de documentos y graficos: el codificador visual permite extraer informacion de charts y documentos escaneados junto al texto de la conversacion, util en tareas de auditoria o investigacion.
- Busqueda profunda y sintesis: con resultados en DeepSearch QA, puede encadenar busquedas, leer fuentes y sintetizar respuestas con razonamiento multi-paso.
- Asistentes de investigacion multilingues: al cubrir mas de 100 idiomas, sirve para resumir y comparar fuentes en distintos idiomas dentro de un mismo flujo.

## Benchmarks y rendimiento

La model card menciona evaluaciones en DeepSearch QA, MCP-Atlas, tau3-Bench y SWE-Bench, pero no publica los valores numericos obtenidos. Los unicos datos cuantitativos disponibles son los de degradacion por cuantizacion y velocidad de generacion:

| Configuracion | Degradacion media (15 benchmarks) | Hardware objetivo |
|---|---|---|
| Full precision | No aplica | 64 GB VRAM |
| K-Quant-Dynamic | 0,2% | 32 GB VRAM |
| K-Quant-17GB | 1,0% | 24 GB VRAM |

| GPU | Sin especulacion (tok/s) | Con DFlash (tok/s) | Aceleracion |
|---|---|---|---|
| Nvidia RTX 5090 | 74,9 | 233,4 | 3,1x |
| Apple M4 Max | 23,7 | 37,8 | 1,5x |
| Apple M5 Max | 26,6 | 50,2 | 1,8x |

No se han publicado resultados numericos de benchmarks de calidad en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 64 GB en precision completa, 32 GB con K-Quant-Dynamic y 24 GB con K-Quant-17GB, incluyendo espacio para cache KV, codificador visual y borrador de decodificacion especulativa.
- GPU recomendadas: Nvidia RTX 5090 (medida oficial), Apple M4 Max y M5 Max (medidas oficiales); configuraciones de 24 o 32 GB de VRAM en general.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB (por ejemplo, RTX 4090 o RTX 5090) con la cuantizacion K-Quant-17GB, y en equipos Apple Silicon de gama alta.
- Opciones de despliegue: la model card solo indica la libreria transformers y compatibilidad con endpoints; no se detallan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 233,4 tok/s en RTX 5090 con decodificacion especulativa (batch 1, greedy) y 50,2 tok/s en M5 Max; sin especulacion, 74,9 y 26,6 tok/s respectivamente.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada; la model card no incluye comparativas con alternativas de la misma categoria.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Muse Glimmer-30B | ~29,6B | 131.072+ | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al entrenarse con datos de productos y servicios de Meta, pueden persistir sesgos derivados de esas fuentes.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en tareas de recuperacion y sintesis de fuentes.
- La ventana de contexto es amplia pero la atencion local con ventana de 2.048 tokens puede limitar la recuperacion precisa de informacion muy distante en secuencias extremadamente largas.
- El modelo solo genera texto; no produce imagenes ni audio.
- La cuantizacion K-Quant-17GB introduce una degradacion media del 1,0% en 15 benchmarks, aceptable pero no nula.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones de los datos de entrenamiento de terceros.
- El corte de conocimiento es el 4 de enero de 2026; la informacion posterior no esta cubierta.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/mdcreativeagent/Muse-Glimmer-30B
- Paper del codificador de percepcion: https://arxiv.org/abs/2504.13181
- Paper de DFlash: https://arxiv.org/abs/2602.06036
- Referencia adicional citada en los tags: https://arxiv.org/abs/2610.24628
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
