# mradermacher/Qwen3-8B-abliterated-bf16-public-GGUF

## Resumen

Qwen3-8B-abliterated-bf16-public-GGUF es una distribucion de cuantizaciones GGUF generada por mradermacher a partir del modelo `ashwin-sreedhar/Qwen3-8B-abliterated-bf16-public`, una version "abliterated" (con las direcciones de rechazo eliminadas mediante edicion de pesos) del Qwen3-8B de Alibaba. El repositorio no contiene pesos originales entrenados por mradermacher, sino conversiones estaticas a formato GGUF en 12 niveles de cuantizacion, desde Q2_K (3,4 GB) hasta f16 (16,5 GB).

El modelo subyacente tiene 8.190.735.360 parametros (8,19 mil millones) y esta etiquetado como experimental. La licencia declarada es Apache 2.0, heredada del modelo base, y el idioma declarado es unicamente ingles. El repositorio ocupa 73,4 GB en total y acumula 298 descargas en el momento de la consulta.

Su relevancia practica es doble: por un lado, permite ejecutar un modelo de 8B en hardware de consumo mediante cuantizaciones de 4-5 bits; por otro, el proceso de "abliteration" elimina los mecanismos de rechazo del modelo original, lo que cambia radicalmente el perfil de seguridad y lo hace inadecuado para despliegues de produccion sin filtros externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-8B; no se detalla en la model card) |
| Parametros totales | 8.190.735.360 (8,19B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (declarado) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se proporciona informacion sobre la arquitectura interna, el dataset de entrenamiento ni el proceso de alineacion del modelo base en la model card de este repositorio. El modelo deriva de Qwen3-8B, por lo que se asume la arquitectura transformer decoder-only propia de la familia Qwen3, pero este dato no se confirma en la informacion disponible.

La innovacion tecnica relevante de este repositorio es el proceso de "abliteration" aplicado por el autor del modelo base: una tecnica de edicion de pesos que identifica y neutraliza las direcciones en el espacio de activaciones asociadas al rechazo de peticiones, sin reentrenamiento adicional. Sobre ese modelo modificado, mradermacher aplica cuantizacion estatica (quantize_version 2, output_tensor_quantised 1) mediante conversion desde safetensors a GGUF. Tambien existe una variante con cuantizaciones ponderadas/imatrix en un repositorio separado.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento y respuesta a instrucciones heredadas del Qwen3-8B base.
- Generacion de codigo y matematicas (capacidades del modelo original, no verificadas en esta ficha).
- Sin mecanismos de rechazo: el proceso de abliteration elimina las negativas aprendidas del modelo alineado.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo thinking explicito: no confirmado en la informacion disponible.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar empiricamente el efecto de la abliteration comparando sus respuestas con las del Qwen3-8B original en un mismo conjunto de prompts.
- Experimentacion local en hardware de consumo: la cuantizacion Q4_K_M (5,1 GB) permite ejecutar el modelo en GPUs con 8 GB de VRAM mediante llama.cpp u Ollama.
- Generacion de texto creativo sin restricciones: util para escritura de ficcion, guiones o narrativa donde los filtros de rechazo del modelo original interrumpen la generacion.
- Analisis de contenido sensible en entornos controlados: clasificacion o resumen de texto sobre temas que disparan rechazos en modelos alineados, siempre con supervision humana.
- Pruebas de robustez de pipelines: evaluar como se comportan sistemas de moderacion externos frente a un modelo sin alineacion interna.
- Desarrollo de prototipos conversacionales en ingles: con la cuantizacion Q5_K_M (6,0 GB) se obtiene buena calidad en una RTX 3060 de 12 GB o superior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del archivo GGUF mas el overhead de contexto. Q4_K_M requiere unos 5,1 GB de pesos; con contexto de 8K conviene reservar 6-7 GB.
- Cuantizaciones y VRAM aproximada: Q2_K 3,4 GB; Q3_K_M 4,2 GB; IQ4_XS 4,7 GB; Q4_K_M 5,1 GB; Q5_K_M 6,0 GB; Q6_K 6,8 GB; Q8_0 8,8 GB; f16 16,5 GB.
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 (24 GB) para Q8_0 o f16. En GPUs de 8 GB cabe Q4_K_M con contexto moderado.
- GPU de datacenter: A100, H100 o L40S para f16 o despliegues con contexto largo y concurrencia.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python. El formato GGUF no es compatible directamente con vLLM ni TGI sin conversion previa.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-8B-abliterated-bf16-public-GGUF (este) | 8,19B | no disponible | Apache 2.0 | GGUF | Sin alineacion de rechazo, solo ingles declarado |
| Qwen3-8B (original) | 8,19B | no disponible aqui | Apache 2.0 | safetensors, GGUF | Modelo alineado de referencia |
| Llama 3.1 8B Instruct | 8,03B | 128K | Llama 3.1 Community | safetensors, GGUF | Alternativa alineada, licencia mas restrictiva |
| Mistral 7B Instruct | 7,24B | 32K | Apache 2.0 | safetensors, GGUF | Menor tamano, contexto mas corto |

Los datos de contexto y rendimiento de las alternativas no se han verificado en la informacion proporcionada y deben contrastarse antes de usarse en una decision tecnica.

## Limitaciones y advertencias

- Ausencia total de alineacion de seguridad: la abliteration elimina los rechazos, por lo que el modelo puede generar contenido danino, ilegal o inseguro sin filtro interno. Requiere moderacion externa obligatoria en cualquier despliegue con usuarios.
- Riesgo elevado de alucinacion: no se han publicado evaluaciones de fidelidad factual para esta variante; la edicion de pesos puede degradar capacidades respecto al original.
- Idioma limitado al ingles declarado; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- Longitud de contexto no documentada en este repositorio; no asumir los 32K o 128K de la familia Qwen3 sin verificar.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede infringir normativas (por ejemplo, el Reglamento de IA de la UE) si no se aplican salvaguardas.
- Modelo etiquetado como experimental por el propio autor; sin garantias de estabilidad ni soporte.
- Solo 298 descargas y 0 likes: comunidad practicamente inexistente, sin validacion independiente.
- El repositorio incluye pesos en f16 de 16,5 GB; descargar el repo completo supone 73,4 GB.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3-8B-abliterated-bf16-public-GGUF
- Modelo base: https://huggingface.co/ashwin-sreedhar/Qwen3-8B-abliterated-bf16-public
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3-8B-abliterated-bf16-public-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3-8B-abliterated-bf16-public-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
