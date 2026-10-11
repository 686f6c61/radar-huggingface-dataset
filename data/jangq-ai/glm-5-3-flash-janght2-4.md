# JANGQ-AI/GLM-5.3-Flash-JANGHT2.4

# JANGQ-AI/GLM-5.3-Flash-JANGHT2.4

## Resumen

JANGQ-AI/GLM-5.3-Flash-JANGHT2.4 es una cuantización en formato JANGHT del modelo zai-org/GLM-5.3-Flash, un MoE de clase 300B desarrollado por Z.ai (zai-org). La ficha corresponde a una compilación optimizada para Apple Silicon mediante MLX, publicada por el usuario JANGQ-AI, que combina dos formatos de cuantización propios (JANGT y JANGH) para los expertos enrutados y mantiene el resto de pesos en 8 bits. El objetivo es permitir la ejecución de un modelo de escala 300B en Macs con 128 GB de memoria unificada.

El modelo base es un transformer híbrido con atención lineal KDA, atención dispersa (sparse attention) y torres de visión y vídeo; su capa MoE emplea 288 expertos enrutados con top-8 más un experto compartido. La cuantización JANGHT2.4 promedia 2,4 bits por peso, con lo que el bundle queda en 91,57 GiB, unos 4,3 GiB menos que la release anterior JANGH2 y con una fidelidad superior respecto al modelo bf16 según las métricas KL publicadas por el autor.

La relevancia actual del bundle reside en que incluye un drafter de decodificación especulativa (DFlash2 de z-lab basado en block-diffusion) que vMLX usa para acelerar la generación sin pérdida de calidad, y en que introduce el formato JANGT de expertos trellis. Como contrapartida, requiere una build de vMLX (Python) que todavía no está publicada: vMLX 1.6.77 y anteriores rechazan cargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer híbrido con atencion lineal KDA, atencion dispersa y torres de vision y video; 288 expertos enrutados, top-8 mas experto compartido |
| Parametros totales | 31.532.700.094 segun metadatos de safetensors; el modelo fuente original declara 321.300 millones de parametros (clase 300B) |
| Parametros activos | no disponible (MoE con 288 expertos enrutados, top-8 mas experto compartido) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | JANGHT para expertos enrutados: mezcla por capa de JANGT (trellis, 2 / 2,5 / 3 bits, rotacion Hadamard-128, estado de 12 bits) y JANGH (codebook Hadamard-32, 2 / 3 / 4 bits, redondeo GPTQ); resto de pesos en 8 bits (MXFP8 o affine) o precision completa; torre de vision en bf16; media de 2,4 bits por peso |
| Idiomas soportados | en, zh |
| Licencia | mit |
| Formato de pesos | mlx, safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) de clase 300B con 288 expertos enrutados, top-8 más un experto compartido. Incorpora atención lineal KDA (Linear Attention) y atención dispersa, y añade torres específicas para visión y vídeo, por lo que el pipeline declarado es image-text-to-text. No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en la información disponible.

La aportación de esta ficha es la cuantización. JANGHT es un esquema por capas que elige entre dos formatos según mediciones de fidelidad: JANGT, un código trellis con rotación Hadamard-128 y estado de 12 bits que puede operar a 2, 2,5 o 3 bits por peso (la variante de 2,5 bits alterna transiciones de 6 y 4 bits, de modo que una capa queda entre 2 y 3 bits), y JANGH, un codebook Hadamard-32 a 2, 3 o 4 bits con redondeo GPTQ. Los tensores que no son expertos se guardan en 8 bits (MXFP8 cuando los pesos originales están sobre una rejilla FP8-MX, affine 8-bit en el resto) o a precisión completa, y la torre de visión permanece en bf16. El bundle también incluye el drafter DFlash2 de z-lab (modelo de borrador por difusión de bloques) sin modificar, que vMLX emplea para decodificación especulativa sin pérdida.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento explicito con modo "thinking".
- Comprension de imagenes (image-text-to-text) y, segun los tags del autor, tambien de video.
- Generacion y comprension de codigo; la comparativa por dominios del autor incluye coding, systems, cybersecurity y agentic.
- Tool calling / function calling: la evaluacion del autor mide decisiones de invocacion de herramientas y la probabilidad asignada al token `<tool_call>`.
- Flujo agentico multi-paso: el conjunto de evaluacion contiene 44.214 posiciones de conversaciones multi-turno con herramientas.
- Capacidades de contexto largo (6.141 posiciones evaluadas por el autor en esa categoria).
- Decodificacion especulativa sin perdida mediante el drafter DFlash2 incluido.
- Soporte multilingue limitado a en y zh (no se declaran otros idiomas).

## Casos de uso

- Asistente de codigo en local para desarrolladores: el bundle cabe en 128 GB de memoria unificada en un Mac y las metricas de dominio de coding (KL mediana 0,074 y top-1 73,5 %) lo sitúan cerca del modelo bf16, lo que permite autocompletado y refactorizacion sin depender de APIs externas.
- Agentes con tool calling sobre conversaciones multi-turno: la evaluacion reporta un 98,2 % de coincidencia con bf16 en el siguiente token en puntos de llamada a herramienta y solo 2 inversiones call/answer, adecuado para orquestadores que encadenan herramientas.
- Procesamiento de documentacion tecnica o legal en contexto largo: aunque no se especifica la ventana, la categoria "long context" se evaluo con 6.141 posiciones y el bundle esta disenado para prompts extensos.
- Analisis de imagenes en pipelines de vision: la torre de vision en bf16 permite tareas de image-text-to-text (descripcion, VQA, extraccion de informacion) manteniendo precision alta en el encoder.
- Analisis de video: los tags declaran torre de video, lo que habilita resumen y descripcion de clips en entornos locales.
- Atencion en chino e ingles simultaneamente: al estar entrenado en en y zh, sirve para atencion bilingue o traduccion asistida entre ambos idiomas.
- Investigacion sobre cuantizacion extrema: el bundle incluye tablas de KL frente a bf16 y FP8, por lo que es util como referencia reproducible para estudiar el impacto de cuantizaciones por debajo de 3 bits en un MoE de 300B.
- Evaluacion de decodificacion especulativa en Apple Silicon: al incluir el drafter DFlash2, permite medir ganancias de velocidad en texto de baja entropia (codigo) sin degradar la salida.

## Benchmarks y rendimiento

Evaluacion principal del autor: 123 secuencias held-out, 95.025 posiciones teacher-forced, KL renormalizada top-128 contra el modelo bf16 completo, ejecutado capa a capa desde disco. Todas las filas usan los mismos pesos 8-bit en tensores no experto, de modo que solo difieren los expertos enrutados.

| Modelo | Expertos | KL mediana ↓ | KL media ↓ | p90 / p95 / p99 ↓ | top-1 ↑ | top-5 ↑ | top-10 ↑ |
|---|---|---|---|---|---|---|---|
| Control: expertos bf16 | bf16 | 0,016 | 0,306 | — / — / 6,51 | 85,5 % | 96,8 % | — |
| JANGHT2.4 (91,57 GiB) | JANGHT | 0,251 | 1,391 | 4,31 / 7,21 / 13,32 | 65,7 % | 84,9 % | 88,6 % |
| JANGH2 (release anterior, 95,89 GiB) | JANGH | 0,297 | 1,574 | 5,02 / 8,06 / 14,29 | 63,7 % | 83,5 % | 87,2 % |

Comparacion anterior del autor contra la referencia FP8 oficial: 20 prompts cortos, 15.830 posiciones teacher-forced. Este conjunto es mas facil y JANGHT2.4 no se evaluo en el.

| Bundle | Tamano | KL mediana ↓ | KL media ↓ | p90 / p95 / p99 ↓ | top-1 ↑ | top-5 ↑ | top-10 ↑ |
|---|---|---|---|---|---|---|---|
| JANGH2 (revision 2) | 95,89 GiB | 0,0301 | 0,376 | 0,98 / 1,97 / 5,24 | 83,9 % | 96,8 % | 98,3 % |
| JANG (affine, release anterior) | 95,35 GiB | 0,0882 | 0,528 | 1,50 / 2,55 / 5,67 | 78,6 % | 94,6 % | 96,8 % |
| orcarouter GLM-5.3-Flash-MLX `2bit-lite` | 95,4 GiB | 0,2122 | 0,83 | — | 71,4 % | 90,8 % | 94,3 % |

Desglose por dominio en el conjunto de 95.025 posiciones (KL mediana y top-1):

| Dominio | Posiciones | JANGHT2.4 | JANGH2 |
|---|---|---|---|
| tool conversations | 44.214 | 0,498 · 59,2 % | 0,661 · 55,9 % |
| coding | 9.504 | 0,074 · 73,5 % | 0,088 · 72,1 % |
| agentic | 7.497 | 0,072 · 76,4 % | 0,090 · 74,0 % |
| cybersecurity | 7.324 | 0,081 · 73,3 % | 0,098 · 72,3 % |
| long context | 6.141 | 0,326 · 63,7 % | 0,346 · 64,4 % |
| general | 5.637 | 0,179 · 68,8 % | 0,182 · 68,3 % |
| science | 3.891 | 0,085 · 74,4 % | 0,084 · 74,4 % |
| academic multiple choice | 3.696 | 0,176 · 71,2 % | 0,197 · 69,7 % |
| Chinese | 3.668 | 0,264 · 64,8 % | 0,288 · 63,9 % |
| systems | 3.453 | 0,103 · 72,9 % | 0,110 · 71,9 % |

Decisiones de herramienta (dentro de las 95.025 posiciones; 109 puntos en los que el modelo bf16 llama a una herramienta y 96 en los que responde):

| Metrica | JANGHT2.4 | JANGH2 |
|---|---|---|
| Puntos de tool-call con el mismo siguiente token que bf16 | 98,2 % | 94,5 % |
| Decisiones invertidas call ↔ answer | 2 | 6 |
| Puntos de tool-call donde el modelo inicia la llamada (bf16: 108 de 109) | 106 | 102 |

La fila final de la tabla original ("lowest P(`<tool_call>`) at a tool-call point") aparece truncada en la informacion disponible y no se reproduce.

## Requisitos de hardware

- Tamano del bundle: 91,57 GiB de pesos (drafter excluido); el repositorio completo ocupa 295,3 GB al incluir historial y revisiones.
- Disenado explicitamente para Macs con 128 GB de memoria unificada (Apple Silicon).
- Formato MLX: no es cargable en CUDA/ROCm sin conversion previa.
- Requiere una build de vMLX (Python) que aun no se ha publicado; vMLX 1.6.77 y anteriores rechazan cargar el bundle (fallan con error, no producen salida incorrecta). Debe usarse con la primera release de vMLX que declare soporte JANGHT.
- Existe una revision previa con pesos JANGH2 (commit 4017296) que si funciona en builds publicadas de vMLX.
- Despliegue: vMLX / MLX Studio sobre Apple Silicon; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles como cifras concretas; el autor indica que la decodificacion especulativa con el drafter DFlash2 acelera notablemente el codigo y otros textos de baja entropia sin perdida.

## Comparativa con modelos similares

| Modelo | Parametros fuente | Formato / tamano | KL mediana (95k posiciones) | top-1 | Licencia |
|---|---|---|---|---|---|
| GLM-5.3-Flash-JANGHT2.4 | 321,3B (MoE 300B) | JANGHT, 91,57 GiB | 0,251 | 65,7 % | MIT |
| GLM-5.3-Flash-JANGH2 (revision 2) | 321,3B (MoE 300B) | JANGH, 95,89 GiB | 0,297 | 63,7 % | MIT |
| GLM-5.3-Flash-JANG (affine) | 321,3B (MoE 300B) | Affine, 95,35 GiB | no evaluado en el conjunto de 95k posiciones | no disponible | MIT |
| orcarouter GLM-5.3-Flash-MLX `2bit-lite` | 321,3B (MoE 300B) | 2-bit, 95,4 GiB | no evaluado en el conjunto de 95k posiciones | no disponible | no disponible |

En el conjunto facil de los 20 prompts cortos, la comparacion del autor situa a JANGH2 en 0,0301 de KL mediana, a JANG (affine) en 0,0882 y a orcarouter `2bit-lite` en 0,2122. No se incluyen en la informacion modelos comparables de otros fabricantes (Llama, Qwen, Mistral) para esta categoria.

## Limitaciones y advertencias

- Dependencia de runtime no publicado: el bundle JANGHT2.4 solo se valido en una build de desarrollo de vMLX. No hay release publica compatible todavia; las builds 1.6.77 y anteriores lo rechazan.
- Cuantizacion muy agresiva (2,4 bits por peso de media, con expertos a 2-3 bits): la fidelidad frente a bf16 cae de forma marcada (top-1 65,7 % frente al 85,5 % del control bf16 en el conjunto exigente de 95k posiciones).
- Degradacion notable en conversaciones con herramientas: la KL mediana en ese dominio es 0,498 y el top-1 baja a 59,2 %, la peor categoria del desglose.
- Riesgo de alucinacion inherente a la cuantizacion, especialmente en tool calling: aunque solo se invierten 2 decisiones call/answer, persiste una discrepancia del 1,8 % respecto a bf16 en el siguiente token de los puntos de tool-call.
- Idiomas limitados a ingles y chino; no se declara soporte de castellano ni de otras lenguas.
- Longitud de contexto no especificada en la informacion disponible.
- Restricciones de licencia: los pesos se declaran bajo MIT, pero el autor no detalla condiciones adicionales sobre el drafter DFlash2 (de z-lab) ni sobre posibles terminos del modelo base zai-org/GLM-5.3-Flash. Verificar antes de uso comercial.
- No hay datos de sesgos publicados en la informacion proporcionada.
- Solo inferencia en Apple Silicon via MLX; no se documentan rutas para GPU NVIDIA o AMD.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JANGQ-AI/GLM-5.3-Flash-JANGHT2.4
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Revision anterior (JANGH2, commit 4017296): https://huggingface.co/JANGQ-AI/GLM-5.3-Flash-JANGHT2.4/tree/4017296adf8c15c49c4743e6c646b89a2eb55673
- Organizacion JANGQ-AI: https://huggingface.co/JANGQ-AI
- MLX Studio: https://mlx.studio
- vMLX: https://vmlx.net
