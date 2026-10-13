# IsValorum/MiniCPM-V-4.7-35B-A3B-APEX-I-NanoPlus-GGUF

## Resumen

MiniCPM-V 4.7 35B-A3B APEX-I NanoPlus V2.1 GGUF es una version cuantizada del modelo multimodal openbmb/MiniCPM-V-4.7-35B-A3B, publicada por el usuario IsValorum. Se trata de una compilacion GGUF de 733 tensores disenada por el propio autor de la cuantizacion para reducir al maximo la huella de memoria en inferencia local, manteniendo las dinamicas recurrentes DeltaNet y la fidelidad visual del modelo original. El repositorio ocupa 13,3 GB, lo que permite ejecutar un modelo de casi 35.000 millones de parametros en hardware de consumo.

El modelo base es un transformer de tipo Mixture of Experts (MoE) con 34.659.889.792 parametros totales y aproximadamente 3.000 millones de parametros activos por token (denominacion 35B-A3B), combinado con componentes de espacio de estados (SSM) recurrentes. Esta orientado a tareas image-text-to-text, incluyendo descripcion de imagenes y comprension de video, y soporta diez idiomas declarados, entre ellos el castellano.

El interes de esta ficha radica en que no es un modelo nuevo, sino una cuantizacion personalizada que aplica un esquema APEX-I NanoPlus V2.1 con precisiones mixtas por tensor (F32 en routers y estados SSM, IQ2/IQ3 en las proyecciones de los expertos), una practica poco habitual que busca preservar la calidad del modelo completo dentro de un presupuesto de memoria muy ajustado. Es relevante para quienes necesitan desplegar un VLM grande en una sola GPU consumer o incluso en un portatil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con componentes recurrentes SSM (DeltaNet) |
| Parametros totales | 34.659.889.792 (~34,66B) |
| Parametros activos | ~3B (aproximado; derivado de la denominacion 35B-A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF de precision mixta: F32, Q8_0, Q6_K, Q4_K, Q3_K, IQ3_XXS, IQ2_S, IQ2_XXS |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) + proyector multimodal mmproj-Q8_0.gguf |

Detalle de la asignacion de precisiones por tensor segun la model card:

| Componente | Precision |
|---|---|
| output.weight | Q6_K |
| token_embd.weight | Q4_K |
| Routers de expertos (ffn_gate_inp) | F32 |
| Expertos compartidos (shexp) | Q4_K |
| Estados SSM (ssm_a, ssm_conv1d, ssm_dt, ssm_norm) | F32 |
| Down projections de borde | Q3_K |
| Gate/up de borde | IQ3_XXS |
| Down core (capas 2-37) | IQ3_XXS |
| Gate core | IQ2_S |
| Up protegido (capas 2-15) | IQ2_S |
| Up compacto (capas 16-37) | IQ2_XXS |
| Proyector multimodal (mmproj) | Q8_0 |

## Arquitectura y entrenamiento

El modelo base, openbmb/MiniCPM-V-4.7-35B-A3B, combina un backbone MoE con componentes de espacio de estados recurrentes. La asignacion de tensores del GGUF confirma la presencia de parametros `ssm_a`, `ssm_conv1d`, `ssm_dt` y `ssm_norm` mantenidos en F32, lo que indica capas SSM de tipo DeltaNet ejecutadas en precision completa para preservar la estabilidad de los estados recurrentes a lo largo de la secuencia. La parte MoE agrupa las proyecciones de los expertos (`ffn_gate_inp`, `shexp`, proyecciones gate/up/down) con cuantizaciones agresivas de 2 y 3 bits, apoyandose en el caracter disperso de la activacion de expertos para tolerar el error de cuantizacion. La rama multimodal se sirve mediante el fichero complementario mmproj-Q8_0.gguf.

En cuanto al entrenamiento, no se dispone del numero de tokens, la composicion del dataset ni los metodos de alineacion (RLHF, DPO) empleados por OpenBMB en el modelo original, ya que el repositorio cuantizado no reproduce esa informacion. La innovacion destacable de esta publicacion concreta no es arquitectonica, sino de cuantizacion: un esquema APEX-I NanoPlus V2.1 de 733 tensores con calibracion por imatrix y proteccion selectiva de tensores sensibles (embeddings, rutas de expertos y estados SSM en precision alta o completa), dejando el resto en cuantizaciones IQ2/IQ3. Conviene advertir que los terminos "MiniCPM-V 4.7", "35B-A3B" y la fecha de publicacion (octubre de 2026) provienen exclusivamente de la model card y no han sido verificados de forma independiente.

## Capacidades

- Generacion de texto conversacional multilingue en diez idiomas declarados (en, zh, es, fr, de, pt, it, ru, ja, ko).
- Comprension de imagen (image-text-to-text): descripcion, analisis y respuesta a preguntas sobre imagenes mediante el proyector mmproj-Q8_0.gguf.
- Comprension de video: la etiqueta `video` figura entre las capacidades declaradas del modelo.
- Razonamiento multimodal y tareas de vision-lenguaje combinadas.
- Soporte de conversacion multi-turno (etiqueta `conversational` y `atomic-chat`).
- Despliegue en dispositivo (on-device) gracias al formato GGUF y al tamano de 13,3 GB.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- No se documenta explicitamente soporte de tool calling ni de function calling en la informacion disponible.
- No se documenta un modo "thinking" explicito en la informacion disponible.

## Casos de uso

- Descripcion automatica de imagenes en local: con el proyector mmproj incluido, el modelo puede generar descripciones detalladas de fotografias sin salida a la nube, util para catalogacion de archivos fotograficos o accesibilidad.
- Analisis de documentos escaneados: el modelo puede responder preguntas sobre capturas y paginas digitalizadas, aprovechando la rama de vision y el contexto conversacional para encadenar preguntas sobre el mismo documento.
- Asistencia visual en el borde (edge): su huella de 13,3 GB y su naturaleza on-device lo hacen apto para estaciones de trabajo sin GPU de datacenter, como inspeccion visual en fabricacion o soporte tecnico de campo.
- Analisis de video para resumenes: dado que la etiqueta `video` esta declarada, puede emplearse en la generacion de resumenes o transcripciones descriptivas de clips cortos, siempre que el pipeline de muestreo de fotogramas lo permita.
- Chatbot multimodal multilingue: con soporte declarado de espanol, frances, aleman o japones, encaja en asistentes que reciben imagenes del usuario y responden en su idioma.
- Prototipado e investigacion en cuantizacion: sirve como caso de estudio reproducible del esquema APEX-I NanoPlus para evaluar el impacto de IQ2/IQ3 frente a la perdida de calidad en un MoE multimodal.
- Inferencia embebida en portatiles con GPU consumer: al estar cuantizado en GGUF, puede integrarse en herramientas de escritorio tipo llama.cpp para tareas de vision asistida sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 13,3 GB para el fichero principal, mas el proyector mmproj-Q8_0.gguf; se recomienda reservar entre 14 y 16 GB de VRAM para pesos, contexto e imagenes.
- GPU recomendadas: NVIDIA RTX 4090, RTX 3090, A100 o H100 para margen holgado; en GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) el modelo entra muy justo y exige contexto reducido.
- Caberia en GPU consumer de 24 GB sin problemas; en 16 GB de forma ajustada; en 12 GB probablemente no por el fichero principal.
- Opciones de despliegue: llama.cpp (binario `llama-minicpmv-cli`, ejemplificado en la propia model card con `--mmproj mmproj-Q8_0.gguf`); no se documentan recetas para vLLM, TGI ni Ollama en la informacion disponible.
- Parametros de ejecucion sugeridos por la model card: contexto `-c 4096` y temperatura `--temp 0.7`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento verificados del modelo base ni de alternativas para construir una comparativa cuantitativa. Se ofrece una comparacion estructural limitada a lo documentado.

| Modelo | Parametros totales | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| MiniCPM-V 4.7 35B-A3B (este GGUF, APEX-I NanoPlus V2.1) | ~34,66B (MoE, ~3B activos) | no disponible | Apache 2.0 | GGUF, 13,3 GB |
| openbmb/MiniCPM-V-4.7-35B-A3B (base) | ~34,66B | no disponible | Apache 2.0 | pesos originales (no disponibles en esta busqueda) |
| Otros VLM de la familia MiniCPM-V | no disponible | no disponible | no disponible | no disponible |
| Alternativas MoE multimodales de tamano similar | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con Qwen2.5-VL, InternVL u otros VLM de rango similar.

## Limitaciones y advertencias

- La cuantizacion agresiva a 2 y 3 bits (IQ2_XXS, IQ2_S, IQ3_XXS) puede degradar la calidad en tareas de razonamiento o reconocimiento visual fino; los embeddings de token se mantienen en Q4_K, pero las proyecciones de expertos estan muy comprimidas.
- El modelo se apoya en un esquema de cuantizacion personalizado (APEX-I NanoPlus V2.1) sin validacion publica de benchmarks: no hay evidencia cuantitativa del impacto real frente al modelo original.
- Riesgo de alucinacion inherente a los modelos de vision-lenguaje; especialmente en descripcion de imagenes con texto pequeno, graficos o detalles ambiguos.
- No se documentan sesgos concretos, pero al ser un modelo multilingue entrenado sobre corpus web es esperable sesgo cultural y de representacion.
- Riesgo de deriva en conversaciones largas por limitaciones de contexto, que no esta especificado.
- Idiomas cubiertos: los diez declarados; no hay garantia de calidad uniforme en todos ellos.
- Licencia Apache 2.0 del modelo base permite uso comercial; sin embargo, es responsabilidad del usuario verificar la licencia del modelo original y de los pesos base antes de un despliegue en produccion.
- Datos procedentes de una model card no verificada de forma independiente (fecha de publicacion en 2026, denominacion de version); conviene contrastar el modelo base real antes de comprometer un pipeline.
- No se documentan recetas para servidores de inferencia de alto rendimiento (vLLM, TGI), lo que limita el escalado horizontal.
- Compatibilidad del proyector mmproj limitada a versiones recientes de llama.cpp que soporten el CLI de MiniCPM-V.

## Enlaces

- Repositorio HuggingFace (cuantizacion): https://huggingface.co/IsValorum/MiniCPM-V-4.7-35B-A3B-APEX-I-NanoPlus-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- Pagina de soporte del autor: https://ko-fi.com/isvalorum
- Documentacion de llama.cpp (repositorio principal de la libreria de inferencia): https://github.com/ggeragnola/llama.cpp (referencia general; verificar URL oficial vigente)
