# mradermacher/Dongfangshuo-Qwen3.8-27B-NSFW-v4-i1-GGUF

## Resumen

Dongfangshuo-Qwen3.8-27B-NSFW-v4-i1-GGUF es una cuantizacion en formato GGUF, generada con imatrix (importancia ponderada), del modelo Dongfangshuo-Qwen3.8-27B-NSFW-v4, publicado por el usuario mradermacher. Se trata de un derivado abliterated (sin rechazo) y sin censura del modelo base Qwen3.8 de 27B, orientado a roleplay y conversacion sin restricciones de contenido. El repositorio contiene exclusivamente pesos cuantizados para su uso con llama.cpp y Ollama, no el modelo original en safetensors.

El modelo base declara 26.895.998.464 parametros (aproximadamente 27B), lo que lo situa en la gama de modelos densos de gran tamano ejecutables en hardware de consumo con cuantizaciones agresivas. La licencia declarada es qwen-community-1.0 (con apache-2.0 en los metadatos del repositorio), y el unico idioma soportado declarado es el chino (zh). El repositorio ocupa 300,3 GB e incluye 25 variantes de cuantizacion desde IQ1_S (7,2 GB) hasta Q6_K (22,2 GB).

La relevancia de esta ficha radica en que documenta un caso tipico de la escena de modelos derivados: un fine-tuning sin censura sobre una base Qwen, redistribuido como cuantizaciones GGUF con imatrix para maximizar la calidad por bit. Es util para desarrolladores que necesiten desplegar localmente un modelo de 27B en GPU de consumo, pero conviene advertir de sus limitaciones legales y de contenido antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de Qwen3.8, transformer denso) |
| Parametros totales | 26.895.998.464 (aprox. 27B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (mas fichero imatrix) |
| Idiomas soportados | zh (chino) |
| Licencia | qwen-community-1.0 (metadatos del repo: apache-2.0) |
| Formato de pesos | GGUF (cuantizado con imatrix) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la informacion proporcionada. Por la nomenclatura (Qwen3.8-27B) se trata de un transformer denso de aproximadamente 27B parametros, pero no se confirman numero de capas, dimension de atencion, tipo de atencion (completa o lineal) ni estrategia de RoPE. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF, DPO o similar.

Lo que si es verificable es el proceso de derivacion: el modelo base Dongfangshuo-Qwen3.8-27B-NSFW-v4 ha sido sometido a un proceso de abliteration (eliminacion de la direccion de rechazo en el espacio de activaciones) y fine-tuning orientado a roleplay sin censura. Sobre ese modelo, mradermacher ha generado cuantizaciones GGUF con imatrix, un metodo que calcula la importancia de cada tensor mediante estadisticas de calibracion y permite que las cuantizaciones de baja tasa de bits (IQ1, IQ2, IQ3) conserven mas calidad que las cuantizaciones estaticas equivalentes. El repositorio incluye el fichero imatrix (0,1 GB) para que otros usuarios puedan generar sus propias cuantizaciones.

## Capacidades

- Generacion de texto conversacional multi-turno, con enfasis en roleplay y narrativa sin restricciones de contenido.
- Modo sin censura (abliterated): el modelo no aplica rechazos de seguridad aprendidos, lo que incluye contenido NSFW y potencialmente danino.
- Capacidad de seguir instrucciones y mantener personajes o estilos consistentes a lo largo de una conversacion.
- Soporte de razonamiento y codigo: no confirmado en la informacion disponible, aunque heredado potencialmente de la base Qwen.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al chino segun los metadatos declarados (language: zh).
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Roleplay y ficcion interactiva: el modelo esta afinado especificamente para mantener personajes y narrativas sin censura, por lo que es adecuado para motores de historias interactivas o chatbots de personaje desplegados localmente con llama.cpp u Ollama.
- Generacion creativa sin restricciones: escritura de narrativa adulta o contenido que los modelos alineados rechazan; la abliteration elimina los rechazos, lo que permite flujos creativos sin interrupciones.
- Despliegue local en GPU de consumo: con la cuantizacion i1-Q4_K_M (16,6 GB) el modelo cabe en una RTX 4090 de 24 GB o en una RTX 3090, lo que permite inferencia privada sin enviar datos a la nube.
- Prototipado de agentes conversacionales en chino: dado que el unico idioma declarado es zh, sirve para construir asistentes o bots conversacionales orientados al mercado chino en entornos controlados.
- Investigacion sobre alineacion y abliteration: util para estudiar como la eliminacion de la direccion de rechazo afecta al comportamiento del modelo, comparando las distintas cuantizaciones (IQ1 a Q6) para medir la degradacion de capacidades.
- Experimentacion con cuantizaciones imatrix: el repositorio incluye el fichero imatrix y 25 variantes, lo que permite evaluar el compromiso calidad/tamano en un modelo de 27B y comparar IQ frente a K-quants en tareas de generacion libre.
- Fine-tuning posterior o merging: los pesos GGUF no son directamente entrenables, pero el modelo base en safetensors puede servir como punto de partida para nuevos derivados; esta ficha documenta el ecosistema de cuantizaciones asociado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano de fichero GGUF mas overhead de contexto):
  - i1-IQ1_S (7,2 GB): ~8-9 GB de VRAM.
  - i1-IQ2_M (10,1 GB): ~11-12 GB de VRAM.
  - i1-IQ3_M (12,7 GB): ~14-15 GB de VRAM.
  - i1-Q4_K_M (16,6 GB): ~18-19 GB de VRAM.
  - i1-Q5_K_M (19,3 GB): ~21-22 GB de VRAM.
  - i1-Q6_K (22,2 GB): ~24-25 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090 (24 GB) para las mismas; A100 40/80 GB o H100 para Q6_K con contexto largo y mayor throughput.
- Cabe en GPU de consumo: si, desde una RTX 3060 de 12 GB con IQ2/IQ3, hasta una RTX 4090 con Q5_K_M. Las cuantizaciones IQ1 e IQ2 permiten incluso GPUs de 8-10 GB, con perdida notable de calidad.
- Opciones de despliegue: llama.cpp, Ollama (etiqueta ollama en el repo), y servidores compatibles con endpoints OpenAI (tag endpoints_compatible). No se recomienda vLLM ni TGI para GGUF sin conversion previa.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Dongfangshuo-Qwen3.8-27B-NSFW-v4-i1-GGUF (este) | ~27B | no disponible | qwen-community-1.0 | GGUF (25 quants) | Abliterated, sin censura, solo zh |
| Dongfangshuo-Qwen3.8-27B-NSFW-v4 (base) | ~27B | no disponible | qwen-community-1.0 | safetensors | Modelo original sin cuantizar |
| mradermacher/Dongfangshuo-Qwen3.8-27B-NSFW-v4-GGUF (static) | ~27B | no disponible | qwen-community-1.0 | GGUF estatico | Misma base, cuantizaciones sin imatrix |
| Qwen3.8-27B (base oficial) | ~27B | no disponible | qwen-community-1.0 | safetensors | Modelo alineado original, con rechazos |

No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Contenido sin censura: la abliteration elimina los rechazos de seguridad, por lo que el modelo puede generar contenido NSFW, violento o danino sin filtro. No es apto para aplicaciones de cara al publico sin moderacion externa.
- Riesgo elevado de alucinacion: los fine-tunes de roleplay priorizan la coherencia narrativa sobre la veracidad factual; no debe usarse como fuente de informacion.
- Idioma: solo se declara soporte de chino (zh); el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Licencia ambigua: los metadatos del repositorio indican apache-2.0, pero la ficha declara qwen-community-1.0. La licencia qwen-community-1.0 impone restricciones de uso comercial que deben revisarse antes de cualquier despliegue en produccion; la discrepancia entre ambas declaraciones es un riesgo legal.
- Contexto desconocido: no se documenta la longitud de contexto, lo que impide planificar aplicaciones que dependan de ventanas largas.
- Cuantizaciones de baja calidad: las variantes IQ1 e IQ2 (7-10 GB) degradan notablemente la coherencia; el propio autor las etiqueta como "for the desperate" o "very low quality".
- Sesgos: no documentados, pero heredados del dataset de entrenamiento del modelo base y del proceso de abliteration, que puede amplificar respuestas extremas.
- Uso responsable: el modelo esta marcado como not-for-all-audiences; su redistribucion o uso en plataformas publicas puede infringir politicas de contenido.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Dongfangshuo-Qwen3.8-27B-NSFW-v4-i1-GGUF
- Modelo base: https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-v4
- Cuantizaciones estaticas del mismo autor: https://huggingface.co/mradermacher/Dongfangshuo-Qwen3.8-27B-NSFW-v4-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Dongfangshuo-Qwen3.8-27B-NSFW-v4-i1-GGUF
- Guia de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
