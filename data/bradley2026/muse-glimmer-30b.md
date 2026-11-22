# Bradley2026/Muse-Glimmer-30B

## Resumen

Muse Glimmer-30B es un modelo de lenguaje causal denso de aproximadamente 29,6 mil millones de parametros desarrollado por Meta Superintelligence Lab, publicado bajo licencia Apache 2.0 y distribuido en Hugging Face por el usuario Bradley2026. Su proposito es ejecutar tareas agenticas autonomas —razonamiento multi-paso, uso fiable de herramientas, recuperacion ante fallos y comprension multimodal— directamente en hardware de consumo, sin depender de infraestructura en la nube.

El modelo combina un transformer causal denso con un codificador de percepcion dedicado (ViT-G/14 de unos 1,8 mil millones de parametros) que le permite aceptar texto e imagenes intercalados y producir texto. Emplea un patron de atencion hibrido [Local, Local, Local, Global] con ventana deslizante de 2048 tokens, atencion con compuertas y GQA con ratio 16:1 (32 cabezas de consulta y 2 de clave/valor), lo que reduce el coste de la cache KV en contextos largos de hasta 131.072 tokens o mas.

Su relevancia actual reside en la optimizacion para despliegue local: mediante cuantizacion a 4 bits el modelo cabe en entornos de 24-32 GB de VRAM con una degradacion declarada de entre el 0,2 % y el 1,0 % en 15 benchmarks, y se acelera con decodificacion especulativa mediante un drafter DFlash que predice bloques de 16 tokens, alcanzando hasta 3,1x de speedup en una RTX 5090. El corte de conocimiento declarado es el 4 de enero de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con codificador de percepcion (ViT-G/14) |
| Parametros totales | 29.776.626.688 (~29,6B, incluye el codificador visual) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131.072+ tokens |
| Tipos de cuantizacion | Full precision, K-Quant-Dynamic (~32 GB), K-Quant-17GB (~24 GB); pesos a ~4 bits |
| Idiomas soportados | Entrenado con datos de mas de 100 idiomas (lista concreta no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Dimension oculta | 6656 |
| Capas | 52 |
| Patron de atencion | [Local, Local, Local, Global] repetido; ventana deslizante de 2048 |
| Cabezas de atencion (Q / KV) | 32 / 2 (GQA 16:1), dimension de cabeza 128, atencion con compuertas |
| FFN | SwiGLU, dimension intermedia 19.968 |
| Codificacion posicional | RoPE (theta = 500.000), solo en capas locales |
| Vocabulario | 202.048 (200.000 tokens BPE + 2.048 especiales) |
| Tokens visuales maximos por imagen | 4.096 |
| Modalidades | Entrada: texto + imagen; salida: texto |
| Corte de conocimiento | 4 de enero de 2026 |
| Tamano del repositorio | 59,6 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal denso de 52 capas con dimension oculta 6656 y FFN SwiGLU de dimension intermedia 19.968. La atencion sigue un patron repetido de tres capas locales con ventana deslizante de 2048 tokens seguido de una capa global; solo las capas locales aplican RoPE con theta 500.000. La atencion usa compuertas y GQA con 32 cabezas de consulta frente a 2 de clave/valor, lo que reduce drasticamente el tamano de la cache KV. El codificador de percepcion es un ViT-G/14 de 50 capas, anchura 1536 y parche de 14 pixeles, con unos 1,8 mil millones de parametros y hasta 4096 tokens visuales por imagen.

El modelo se describe como destilado de Muse Spark y esta especializado en tareas agenticas. Los datos de entrenamiento son contenido multimodal procedente de fuentes publicas, datos de terceros e informacion de productos y servicios de Meta, curado por redes de proveedores externos y personal de Meta; no se especifica el numero de tokens ni la composicion exacta del dataset. Tampoco se detalla si hubo RLHF, DPO u otras fases de alineamiento. La innovacion tecnica mas destacable es el sistema de decodificacion especulativa DFlash: un drafter ligero de 5 capas con tamano de bloque 16, atencion deslizante de 2048 en todas las capas, 32 cabezas de consulta y 8 de clave/valor, y capas de caracteristicas ocultas uniformes sobre las capas {1, 13, 25, 37, 49} del modelo objetivo. El drafter propone bloques completos de 16 tokens en una sola pasada y el modelo principal los verifica en paralelo, aceptando los correctos y corrigiendo los erroneos sin alterar la calidad de salida. Se distribuyen versiones cuantizadas del drafter para minimizar el consumo de memoria.

## Capacidades

- Generacion de texto y razonamiento multi-paso sobre horizontes largos, con planes coherentes en flujos de trabajo extendidos.
- Uso fiable de herramientas y function calling con esquemas precisos a lo largo de flujos prolongados.
- Recuperacion ante fallos: diagnostica errores de llamadas a herramientas y reintenta en lugar de detenerse.
- Comprension multimodal de entrada: interpreta capturas de pantalla, graficos y documentos junto con la conversacion mediante el codificador de percepcion.
- Compatibilidad con scaffolds de agentes como OpenClaw, Hermes Agent y otros patrones de orquestacion.
- Esfuerzo de razonamiento controlable, permitiendo ajustar el equilibrio entre calidad y velocidad.
- Capacidades multilingues derivadas de entrenamiento en mas de 100 idiomas.
- Escritura y depuracion de codigo en el contexto de tareas de ingenieria de software (evaluado en SWE-Bench).
- Finalizacion de tareas agenticas de extremo a extremo evaluadas en DeepSearch QA, MCP-Atlas y tau3-Bench.

## Casos de uso

- Agentes autonomos locales: el modelo puede ejecutar flujos multi-paso con llamadas a herramientas y recuperacion ante errores en un equipo de 24-32 GB de VRAM, sin conexion a la nube, lo que resulta adecuado para entornos con requisitos de privacidad o sin red.
- Automatizacion de ingenieria de software: con soporte de tool calling y evaluacion en SWE-Bench, puede integrarse en pipelines para escribir parches, depurar codigo y resolver incidencias de repositorio dentro de un scaffold de agente.
- Analisis de documentos y capturas: gracias al codificador visual y a los 4096 tokens visuales por imagen, puede interpretar graficos, tablas e interfaces de usuario para extraer informacion o responder preguntas sobre ellos.
- Asistentes de atencion al cliente multi-turno: su contexto de 131.072 tokens permite mantener conversaciones largas con historial extenso y adjuntar imagenes enviadas por el usuario.
- Orquestacion de herramientas empresariales: el uso fiable de esquemas de funciones y la recuperacion ante fallos lo hacen apto para encadenar APIs internas en flujos de negocio prolongados.
- Investigacion en agentes: su compatibilidad con OpenClaw y Hermes Agent, junto con el modo de esfuerzo controlable, permite experimentar con distintas estrategias de razonamiento en hardware de consumo.
- Despliegue en estaciones de trabajo con GPU de consumo: la cuantizacion K-Quant-17GB y el drafter DFlash permiten conversacion fluida en tiempo real en una RTX 5090 o en Apple Silicon M4/M5 Max.

## Benchmarks y rendimiento

La model card menciona evaluaciones en DeepSearch QA, MCP-Atlas, tau3-Bench y SWE-Bench, pero no publica los valores numericos obtenidos en ninguno de ellos. Los unicos datos cuantitativos disponibles son los de degradacion por cuantizacion y velocidad de generacion.

| Metrica | Full precision | K-Quant-Dynamic | K-Quant-17GB |
|---|---|---|---|
| Degradacion media (15 benchmarks) | — | 0,2 % | 1,0 % |
| Hardware objetivo | 64 GB VRAM | 32 GB VRAM | 24 GB VRAM |

| Hardware | Sin especulacion (tok/s) | Con DFlash (tok/s) | Speedup |
|---|---|---|---|
| Nvidia RTX 5090 | 74,9 | 233,4 | 3,1x |
| Apple M4 Max | 23,7 | 37,8 | 1,5x |
| Apple M5 Max | 26,6 | 50,2 | 1,8x |

Mediciones con tamano de lote 1 y decodificacion greedy sobre un conjunto diverso de prompts. No se han publicado resultados numericos de benchmarks de calidad en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 64 GB en precision completa, aproximadamente 32 GB con K-Quant-Dynamic y aproximadamente 24 GB con K-Quant-17GB (pesos del modelo de lenguaje por debajo de 20 GB en 4 bits, dejando margen para cache KV, codificador visual y drafter).
- GPU recomendadas: RTX 5090 (233,4 tok/s con DFlash), A100 o H100 para precision completa; Apple Silicon M4 Max y M5 Max validados para despliegue local.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB o 32 GB con las cuantizaciones K-Quant correspondientes.
- Opciones de despliegue: transformers como libreria principal; el tag endpoints_compatible sugiere compatibilidad con endpoints de inferencia. No se detallan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: 74,9 tok/s sin especulacion y 233,4 tok/s con DFlash en RTX 5090; 23,7 y 37,8 tok/s en M4 Max; 26,6 y 50,2 tok/s en M5 Max, con lote 1 y decodificacion greedy.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de calidad de Muse Glimmer-30B ni de especificaciones verificables de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. A modo de referencia estructural, se indica lo que si consta de este modelo frente a lo que no se puede confirmar de alternativas.

| Criterio | Muse Glimmer-30B | Alternativas de la misma categoria |
|---|---|---|
| Parametros | ~29,6B densos + 1,8B vision | no disponible |
| Contexto | 131.072+ tokens | no disponible |
| Modalidad | Texto + imagen de entrada | no disponible |
| Licencia | Apache 2.0 | no disponible |
| Despliegue local en 24 GB | Si (K-Quant-17GB) | no disponible |
| Benchmarks publicados | No numericos | no disponible |

## Limitaciones y advertencias

- No se publican resultados numericos de benchmarks de calidad, lo que impide verificar de forma independiente el rendimiento agentico declarado.
- El modelo procede de un unico repositorio de Hugging Face con cero descargas y cero valoraciones en el momento de la consulta; no hay validacion de la comunidad.
- La model card atribuye el desarrollo a Meta Superintelligence Lab, mientras que el repositorio lo publica el usuario Bradley2026; conviene verificar la procedencia antes de un uso en produccion.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no cuantificado en la informacion disponible; en tareas agenticas puede traducirse en llamadas a herramientas incorrectas o planes invalidos.
- La degradacion por cuantizacion, aunque declarada baja (0,2 %-1,0 %), se mide como media sobre 15 benchmarks y puede concentrarse en tareas especificas.
- El corte de conocimiento es el 4 de enero de 2026; no se garantiza informacion posterior.
- No se detalla la lista concreta de idiomas soportados ni la calidad por idioma, solo que el entrenamiento cubre mas de 100 lenguas.
- La licencia Apache 2.0 permite uso comercial, pero no se especifican terminos adicionales ni restricciones de uso aceptable mas alla de la propia licencia.
- El rendimiento medido se limita a lote 1 y decodificacion greedy; el throughput en produccion con lotes mayores y muestreo no esta documentado.
- El consumo de memoria del drafter y del codificador visual debe sumarse al de los pesos cuantizados; el margen real en 24 GB depende de la longitud de contexto y del numero de imagenes.

## Enlaces

- Hugging Face: https://huggingface.co/Bradley2026/Muse-Glimmer-30B
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Paper del codificador de percepcion (arXiv 2504.13181): https://arxiv.org/abs/2504.13181
- Paper de DFlash (arXiv 2602.06036): https://arxiv.org/abs/2602.06036
- Referencia adicional citada en los tags (arXiv 2610.24628): https://arxiv.org/abs/2610.24628
