# beamster/DeepSeek-V4.1-Flash-1017-Sushi-STQ-2.7bpw

## Resumen

DeepSeek-V4.1-Flash-1017-Sushi-STQ-2.7bpw es un empaquetado cuantizado del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek-AI, preparado por el usuario beamster para el motor de inferencia nativo sushi en Apple Silicon. No es un modelo nuevo: es una distribucion de pesos del checkpoint original adaptada a un formato de cuantizacion propietario (STQ, Sushi Trellis Quant) que permite ejecutar un modelo MoE de 295.303.488.722 parametros totales de forma completamente residente en un Mac con 256 GB de memoria unificada.

La relevancia de este pack es doble. Por un lado, demuestra que es posible servir un modelo de casi 300.000 millones de parametros en hardware de consumo de gama alta (un M5 Ultra con 256 GB), algo impensable con los pesos completos en bf16. Por otro, mantiene una calidad muy cercana al original: la model card reporta una divergencia KL de 0.0607 y un 93,72% de acuerdo top-1 frente al checkpoint de referencia, con un tamano en disco de 400,1 GB (184 GiB de pesos mas 189 GiB de tablas Engram).

El modelo base es multimodal (image-text-to-text), con torre de vision incluida en bf16, contexto de hasta 1.048.576 tokens y decodificacion especulativa DSpark de tres etapas. El pack esta pensado exclusivamente para sushi v1.7.3 o superior sobre macOS 26.2 o superior; no es utilizable con vLLM, llama.cpp ni otros motores convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) transformer con torre de vision y decodificacion especulativa DSpark; 40 capas x 384 expertos enrutados |
| Parametros totales | 295.303.488.722 |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 1.048.576 tokens |
| Tipos de cuantizacion | STQ (Sushi Trellis Quant): expertos enrutados a 2,72 bits medios (grupos de 3,5, 3 y 2,5 bits, codebook PAIR1); trunk a 5 bits (SPEC1); lm_head a 6 bits (SPEC1); embedding 4-bit affine; tablas Engram en FP8 E4M3 con escalas E8M0; torre de vision en bf16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (empaquetado STQ para el motor sushi) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura de mezcla de expertos (MoE) de 40 capas y 384 expertos enrutados por capa, complementado con una torre de vision que procesa entrada de imagen y texto. Incluye tablas Engram almacenadas en FP8 E4M3 con escalas E8M0, que en este pack se leen desde el SSD y nunca se cargan en memoria de GPU. Tambien incorpora DSpark, un esquema de decodificacion especulativa de tres etapas cuyos expertos y trunk se incluyen en el empaquetado (expertos de etapa a 2,5 bits con PAIR1, trunk de etapa a 5 bits con SPEC1).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO en el modelo original. La innovacion tecnica destacable de este pack concreto es el esquema STQ: una cuantizacion por trellis con codebooks especificos (PAIR1 para expertos, SPEC1 para trunk y lm_head) que asigna precision variable por grupo de expertos y ordena los tiles por pares (pair-major), logrando 2,72 bits medios en los expertos enrutados con una perdida de calidad medida de KLD 0.0607 frente al checkpoint original.

## Capacidades

- Generacion de texto y razonamiento multi-paso, incluyendo modo de pensamiento (thinking) segun el modelo base.
- Generacion de codigo y matematicas, con los mejores resultados de KLD del pack en estas categorias (0.0076 en code y 0.0178 en math).
- Entrada de imagen y texto (pipeline image-text-to-text) gracias a la torre de vision incluida en bf16.
- Capacidades multilingues, evaluadas en la categoria multilingual del informe de calidad (KLD 0.0690).
- Decodificacion especulativa DSpark de tres etapas incluida en el pack, que acelera la generacion.
- Contexto muy largo de hasta 1.048.576 tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion disponible, aunque es esperable en un modelo de esta familia; debe verificarse contra la model card del modelo base.
- Soporte de agentes: no confirmado en la informacion disponible.

## Casos de uso

- Analisis de documentos extensos en local: con 1.048.576 tokens de contexto, el modelo puede ingerir libros tecnicos, expedientes o bases de codigo completas en un unico Mac con 256 GB, sin depender de la nube.
- Asistencia de programacion en estacion de trabajo Apple Silicon: el pack obtiene su mejor KLD en la categoria de codigo (0.0076), por lo que es adecuado para autocompletado, refactorizacion y explicacion de codigo dentro de un flujo local con sushi.
- Procesamiento de imagenes y texto combinados: la torre de vision en bf16 permite tareas de descripcion de imagenes, extraccion de datos de capturas o documentos escaneados y respuesta a preguntas visuales.
- Razonamiento matematico y analisis tecnico: el KLD de 0.0178 en math y 0.0462 en reasoning lo hacen util para resolucion de problemas paso a paso en entornos sin conectividad.
- Investigacion sobre cuantizacion extrema: sirve como referencia practica para estudiar el compromiso entre bits por peso (2,72 de media) y divergencia KL, comparandolo con el pack hermano de 1,75 bpw.
- Despliegue privado de un modelo de gran escala: al ejecutarse integramente en un M5 Ultra con macOS 26.2, permite mantener datos sensibles fuera de servicios externos con una licencia MIT permisiva.
- Generacion creativa y narrativa: la categoria story presenta el KLD mas alto del pack (0.1682), por lo que es usable pero conviene revisar la salida en textos largos de ficcion.

## Benchmarks y rendimiento

La model card no incluye benchmarks estandar (MMLU, HumanEval, GSM8K). Proporciona, en cambio, metricas de calidad de cuantizacion (KLD y acuerdo top-1) frente al checkpoint original, calculadas por sushi sin pasos con perdida propios, con KV a ancho completo y DSpark desactivado, sobre ocho categorias, 2 prompts de 512 tokens cada uno y puntuadas hasta el primer EOS.

| Metrica | Sushi-STQ-2.7bpw | Sushi-STQ-1.75bpw rev. 2.0 |
|---|---|---|
| KLD global | 0.0607 | 0.1525 |
| Acuerdo top-1 | 93,72% | 89,50% |
| Tamano en disco | 400,1 GB | 332,1 GB |
| KLD code | 0.0076 | 0.0240 |
| KLD math | 0.0178 | 0.0550 |
| KLD reasoning | 0.0462 | 0.1149 |
| KLD design | 0.0686 | 0.1655 |
| KLD wikitext | 0.0777 | 0.1907 |
| KLD multilingual | 0.0690 | 0.1927 |
| KLD story | 0.1682 | 0.3984 |
| KLD science | 0.0278 | 0.0782 |

La lectura de 2,7 bpw se realizo con sushi 1.7.4 en un M5 Ultra; con sushi 1.7.3 el KLD es 0.0611 y el acuerdo top-1 93,58%. La model card indica que sushi 1.7.4 decodifica entre un 13% y un 20% mas rapido que 1.7.3 en un M5 Ultra, aunque no se publican cifras absolutas de throughput ni latencia.

## Requisitos de hardware

- VRAM/memoria unificada: el pack esta dimensionado para quedar completamente residente en un Mac con 256 GB de memoria unificada.
- Disco: aproximadamente 373 GiB en total, de los cuales 184 GiB son pesos y 189 GiB son tablas Engram que se leen desde el SSD y no se cargan en memoria.
- GPU: Apple Silicon exclusivamente, con macOS 26.2 o superior; la model card cita un M5 Ultra como plataforma de referencia. No es compatible con A100, H100 ni RTX 4090, ya que el formato STQ solo lo interpreta sushi.
- Consumer GPU: no aplica en el sentido habitual (NVIDIA/AMD); el equivalente consumer es un Mac de gama alta con 256 GB de memoria unificada.
- Despliegue: unicamente el motor sushi v1.7.3 o superior (se recomienda 1.7.4 por su mayor velocidad de decodificacion). No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras absolutas; solo la mejora relativa del 13-20% de sushi 1.7.4 frente a 1.7.3 en un M5 Ultra.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Calidad frente al original | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sushi-STQ-2.7bpw (este pack) | 295.303.488.722 | 1.048.576 | KLD 0.0607, top-1 93,72% | MIT | solo motor sushi en Apple Silicon |
| Sushi-STQ-1.75bpw rev. 2.0 | mismo modelo base | 1.048.576 | KLD 0.1525, top-1 89,50% | MIT | solo motor sushi en Apple Silicon |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (original) | no disponible en la informacion | 1.048.576 (segun este pack) | referencia | MIT | pesos originales, motores estandar |

No se dispone de datos de benchmarks estandar ni de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia total del motor sushi: los pesos en formato STQ no se pueden cargar en vLLM, llama.cpp, Ollama, TGI ni en ninguna herramienta fuera de sushi, lo que limita la portabilidad y crea dependencia de un proyecto pequeno.
- Requisito de hardware muy restrictivo: solo funciona en Apple Silicon con macOS 26.2 o superior y, en la practica, con 256 GB de memoria unificada para mantenerlo residente.
- Perdida de calidad respecto al original: aunque baja, existe (KLD 0.0607, 6,28% de desacuerdo top-1). La categoria story es la mas afectada (KLD 0.1682), seguida de wikitext (0.0777) y multilingual (0.0690).
- Riesgo de alucinacion: inherente al modelo base; no se han publicado evaluaciones de factualidad en la informacion disponible.
- Sesgos: no se documentan sesgos conocidos en la informacion proporcionada.
- Idiomas: la lista de idiomas soportados no esta disponible; la evaluacion multilingual existe pero no detalla que lenguas cubre.
- Licencia MIT: permisiva para uso comercial, pero el aviso de licencia del modelo base debe conservarse; conviene revisar los terminos del modelo original de DeepSeek-AI.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria.
- Fecha de creacion en 2026-11-23: verificar la vigencia y compatibilidad con versiones futuras de sushi antes de desplegar en produccion.

## Enlaces

- Hugging Face del pack: https://huggingface.co/beamster/DeepSeek-V4.1-Flash-1017-Sushi-STQ-2.7bpw
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Pack hermano de 1,75 bpw: https://huggingface.co/beamster/DeepSeek-V4.1-Flash-1017-Sushi-STQ-1.75bpw
- Motor sushi: https://github.com/beamivalice/sushi
- Guia de uso de sushi: https://github.com/beamivalice/sushi/blob/main/docs/usage.md
- mlx-serve (proyecto del que deriva sushi): https://github.com/ddalcu/mlx-serve
