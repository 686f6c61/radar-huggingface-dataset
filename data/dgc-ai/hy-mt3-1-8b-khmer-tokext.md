# DGC-AI/Hy-MT3-1.8B-khmer-tokext

## Resumen

Hy-MT3-1.8B-khmer-tokext es un ajuste fino del modelo de traduccion tencent/Hy-MT3-1.8B, publicado por DGC-AI. Se trata de un modelo denso de 1.799.469.056 parametros (aproximadamente 1,8 mil millones) construido sobre la arquitectura `hunyuan_v1_dense`, orientado especificamente a la traduccion entre jemer (km), ingles (en), frances (fr) y chino (zh). El sufijo "khmer-tokext" sugiere una extension o adaptacion del tokenizador para mejorar la cobertura del jemer, un idioma de bajos recursos con tokenizacion habitualmente ineficiente en modelos multilingues genericos.

El modelo resuelve un problema concreto: la traduccion de calidad hacia y desde jemer en entornos donde no se dispone de infraestructura de GPU de gran escala. Con 1,8 mil millones de parametros puede desplegarse en una unica GPU de consumo o incluso en CPU mediante cuantizacion GGUF, lo que lo hace util para organizaciones con presupuesto limitado que necesitan procesar contenido en jemer. El repositorio incluye pesos en safetensors y versiones cuantizadas en GGUF, lo que facilita su integracion tanto en pipelines de servidor como en herramientas de inferencia local.

Es relevante ahora porque el jemer cuenta con pocos modelos dedicados de traduccion de tamano contenido y licencia permisiva. La licencia Apache 2.0 del modelo base permite uso comercial sin restricciones de atribucion mas alla de las habituales, y la disponibilidad de formato GGUF lo situa en el ecosistema de llama.cpp y Ollama, reduciendo la barrera de adopcion. El acceso esta restringido en Hugging Face y requiere aceptar las condiciones del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | hunyuan_v1_dense (transformer denso) |
| Parametros totales | 1.799.469.056 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (presente en el repo); niveles concretos no disponibles |
| Idiomas soportados | km (jemer), en (ingles), fr (frances), zh (chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura `hunyuan_v1_dense`, la variante densa de la familia Hunyuan de Tencent, un transformer decoder-only convencional sin mezcla de expertos. Al ser un ajuste fino del modelo base tencent/Hy-MT3-1.8B, hereda su estructura y su entrenamiento previo en traduccion automatica. El repositorio no documenta el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el ajuste especifico.

La innovacion declarada en el nombre del modelo, "khmer-tokext", apunta a una extension del vocabulario del tokenizador orientada al jemer. Esto es tecnicamente relevante porque los tokenizadores BPE entrenados predominantemente en idiomas de altos recursos fragmentan el jemer en secuencias de bytes o subpalabras muy cortas, lo que incrementa la longitud efectiva de la secuencia y degrada tanto la calidad como la eficiencia. No se dispone de informacion publica sobre el procedimiento exacto de extension del tokenizador ni sobre el volumen de datos de ajuste empleado.

## Capacidades

- Traduccion automatica entre jemer, ingles, frances y chino en las combinaciones cubiertas por el modelo base.
- Generacion de texto conversacional, segun la etiqueta `conversational` del repositorio.
- Integracion con endpoints compatibles (`endpoints_compatible`), lo que permite su despliegue detras de APIs con formato estandar.
- Inferencia en formato GGUF mediante llama.cpp y herramientas derivadas.
- No se documenta soporte de tool calling, function calling ni capacidades de agente multi-paso.
- No se documenta soporte de vision, audio ni modo de razonamiento extendido (thinking mode).
- Capacidades multilingues limitadas a los cuatro idiomas declarados; no se garantiza comportamiento fuera de ellos.

## Casos de uso

- Traduccion de documentacion oficial y textos administrativos del jemer al ingles o frances: el modelo puede procesar parrafos completos en un unico paso y su tamano permite desplegarlo en servidores modestos, lo que resulta adecuado para ONGs y organismos publicos en Camboya que necesitan localizar contenido normativo.
- Localizacion de interfaces y contenido web hacia jemer: con 1,8 mil millones de parametros y formato GGUF, puede ejecutarse en una instancia con GPU de consumo para traducir cadenas de interfaz y textos de marketing sin depender de APIs externas de pago.
- Atencion al cliente en jemer con salida hacia ingles o chino: el caracter conversacional del modelo permite gestionar intercambios multi-turno, util para empresas que atienden a usuarios camboyanos y escalan incidencias a equipos que trabajan en ingles.
- Traduccion de contenido periodistico y redes sociales: el modelo puede procesar articulos y publicaciones para monitorizacion de medios, con la ventaja de que el despliegue local evita enviar contenido sensible a servicios en la nube.
- Preprocesamiento de corpus para investigacion linguistica: la extension del tokenizador para jemer facilita la tokenizacion eficiente de grandes volumenes de texto en ese idioma, lo que reduce costes de computo en tareas posteriores de analisis o entrenamiento.
- Traduccion asistida en entornos con conectividad limitada: al poder ejecutarse en local mediante llama.cpp, el modelo es adecuado para despliegues en oficinas o dispositivos sin acceso estable a internet, siempre que se disponga de hardware suficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 5 y 7 GB segun longitud de contexto.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits (Q4_K_M): alrededor de 1,1-1,3 GB para pesos, con requisito total tipico de 2-3 GB.
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10, L4 o A100 para despliegues con concurrencia.
- Cabe en GPU de consumo: si, en modelos con 6 GB o mas de VRAM en FP16, y en GPUs de 4 GB con cuantizacion de 4 bits.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) para GGUF; vLLM o TGI para safetensors en servidor; endpoints compatibles con APIs estandar segun la etiqueta del repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| DGC-AI/Hy-MT3-1.8B-khmer-tokext | 1,8 B | no disponible | km, en, fr, zh | Apache 2.0 | safetensors, GGUF |
| tencent/Hy-MT3-1.8B (base) | 1,8 B | no disponible | multilingue (no detallado) | no disponible en esta ficha | safetensors |
| NLLB-200-distilled-600M | 600 M | 512 tokens | 200 idiomas (incluye km) | CC-BY-NC 4.0 | safetensors, GGUF |
| Helsinki-NLP/opus-mt-en-km | ~77 M | 512 tokens | en-km | CC-BY 4.0 | safetensors |

La comparativa se limita a modelos de traduccion de tamano contenido con soporte de jemer. Frente a NLLB-200-distilled-600M, el modelo de DGC-AI ofrece mayor numero de parametros y licencia Apache 2.0 apta para uso comercial, mientras que NLLB restringe el uso comercial por su licencia CC-BY-NC. Frente a los modelos OPUS-MT, especializados en pares de idiomas concretos y de menor tamano, este modelo cubre cuatro idiomas en un unico checkpoint. No se dispone de datos de rendimiento comparativo para establecer diferencias de calidad.

## Limitaciones y advertencias

- El acceso al repositorio esta restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos.
- No se documentan evaluaciones de calidad de traduccion, por lo que no es posible verificar el rendimiento real frente al modelo base.
- Riesgo de alucinacion y de traducciones infieles en textos largos o dominios especializados, habitual en modelos de este tamano.
- La cobertura linguistica se limita a jemer, ingles, frances y chino; el comportamiento en otros idiomas no esta garantizado.
- No se dispone de informacion sobre sesgos especificos del ajuste ni sobre la composicion del corpus de entrenamiento, lo que dificulta evaluar sesgos de dominio o culturales.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base pertenece a Tencent y podria estar sujeto a condiciones adicionales no reflejadas en esta ficha; conviene verificar los terminos del repositorio original.
- El numero de descargas y likes es cero en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- No se documenta la longitud de contexto soportada, un dato critico para planificar el despliegue en produccion.

## Enlaces

- Repositorio del modelo: https://huggingface.co/DGC-AI/Hy-MT3-1.8B-khmer-tokext
- Modelo base: https://huggingface.co/tencent/Hy-MT3-1.8B
