# mradermacher/LFM3-1.7B-heretic-ara-i1-GGUF

## Resumen
LFM3-1.7B-heretic-ara-i1-GGUF es una cuantizacion en formato GGUF del modelo dalatexcoder/LFM3-1.7B-heretic-ara, un derivado "abliterated" (decensored) del modelo LFM3 de 1.700 millones de parametros de Liquid AI. El trabajo de cuantizacion lo firma mradermacher, un prolifico publicador de quants GGUF en Hugging Face, y emplea cuantizacion con matriz de importancia (imatrix) para preservar la calidad en tamanos reducidos. El modelo base parte de la arquitectura LFM3 orientada a despliegue en el borde (edge), con un total de 1.728.801.600 parametros segun los pesos safetensors.

El interes de esta ficha reside en dos factores. Primero, el proceso "heretic" o "abliteration", que elimina o atenua los mecanismos de rechazo del modelo original, produciendo una variante sin censura alineada que puede ser util para investigacion sobre seguridad y alineamiento, o problematico para despliegues comerciales. Segundo, la disponibilidad de cuantizaciones GGUF de 0,6 GB a 1,5 GB permite ejecutar el modelo en hardware muy modesto, incluso en CPU, lo que lo hace accesible para prototipado local.

Conviene subrayar que esta publicacion es exclusivamente un artefacto de cuantizacion: no introduce cambios en los pesos mas alla de la compresion numerica. La licencia declarada es lfm1.0 (etiquetada como "other" en Hugging Face), lo que impone restricciones de uso que deben revisarse antes de cualquier explotacion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3 de Liquid AI; la model card solo indica tags "liquid", "lfm3", "edge") |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-IQ3_XXS, i1-Q2_K, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, mas fichero imatrix |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas declarados en la model card) |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (cuantizaciones); el modelo base esta en formato transformers/safetensors |

## Arquitectura y entrenamiento
La model card de esta cuantizacion no aporta detalles sobre la arquitectura interna del modelo base. Los tags indican "liquid", "lfm3" y "edge", lo que vincula el modelo a la familia LFM3 de Liquid AI, disenada para inferencia en dispositivos con recursos limitados. No se especifica si se trata de un transformer clasico, de una arquitectura hibrida con componentes de espacio de estados (SSM) o de otra variante; ese dato no esta disponible en la informacion proporcionada.

Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO u otro tipo de ajuste por preferencias. Lo unico verificable es el proceso de cuantizacion: mradermacher genera los quants con matriz de importancia (imatrix) y version de cuantizacion 2, con salida de tensores cuantizados, lo que suele mejorar la fidelidad respecto a cuantizaciones estaticas equivalentes. El modelo base incorpora el prefijo "heretic", que en la practica de la comunidad indica una variante abliterated o decensored; no se detalla la metodologia exacta empleada para eliminar los rechazos.

## Capacidades
- Generacion de texto conversacional: el tag "conversational" sugiere un ajuste orientado a dialogo multi-turno.
- Razonamiento y respuesta a instrucciones: capacidades heredadas del modelo base LFM3, sin detalle cuantificado en la model card.
- Multilinguismo: 16 idiomas declarados (ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, espanol, vietnamita, tailandes, indonesio, hindi, ruso y polaco).
- Modo sin censura: el ajuste "heretic"/"abliterated" elimina o reduce los rechazos del modelo original ante peticiones que este declinaria.
- Compatibilidad con endpoints: el tag "endpoints_compatible" indica que los GGUF pueden servirse a traves de la infraestructura de endpoints de Hugging Face.
- Uso en el borde: el tag "edge" y el reducido tamano de las cuantizaciones permiten ejecucion en dispositivos de bajos recursos.
- Soporte de tool calling, function calling y agentes multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision, audio o thinking mode: no disponible en la informacion proporcionada.

## Casos de uso
- Prototipado local en portatiles sin GPU dedicada: con cuantizaciones i1-Q4_K_M de aproximadamente 1,2 GB, el modelo puede ejecutarse integramente en CPU mediante llama.cpp u Ollama, lo que permite iterar sobre prompts y flujos conversacionales sin coste de API.
- Investigacion sobre alineamiento y seguridad: la variante heretic permite estudiar como cambia el comportamiento de un modelo al eliminar los rechazos, comparando respuestas frente al LFM3 original en conjuntos de prompts sensibles.
- Asistente conversacional multilingue de bajo coste: los 16 idiomas declarados permiten desplegar un chatbot basico en espanol, arabe, hindi o indonesio en entornos con presupuesto de hardware minimo, por ejemplo en una Raspberry Pi o un mini-PC.
- Generacion de texto en aplicaciones de escritorio: integrable en herramientas ofimaticas o plugins de edicion mediante un servidor local compatible con la API de OpenAI, gracias a la compatibilidad con endpoints.
- Filtrado y clasificacion de contenido sin restricciones de rechazo: en tareas de moderacion o analisis donde el modelo original declinaria procesar material sensible, la variante heretic puede mantener la utilidad analitica; requiere supervision humana por el riesgo de contenido inapropiado.
- Experimentacion educativa con cuantizacion GGUF: el repositorio incluye el fichero imatrix y 24 variantes de cuantizacion, lo que lo convierte en un caso practico para estudiar el compromiso entre tamano, velocidad y perplejidad en un modelo de 1,7B.
- Despliegue en entornos aislados (air-gapped): al ser un artefacto local de menos de 2 GB, puede copiarse a maquinas sin conexion para tareas de generacion de texto internas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de perplejidad para las distintas cuantizaciones; solo se enlaza un grafico generico de ikawrakow sobre calidad relativa de tipos de cuantizacion, sin valores numericos asociados a este modelo concreto.

## Requisitos de hardware
- VRAM estimada: entre 0,6 GB (i1-IQ1_S) y 1,5 GB (i1-Q6_K) para los pesos; anadir entre 0,5 y 1 GB adicionales para el contexto KV segun la longitud de contexto configurada (no se especifica la ventana maxima).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM efectiva, como GTX 1050 Ti, GTX 1650, RTX 3050 o superiores; tambien funciona en GPUs integradas con memoria compartida.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU de consumo moderna e incluso en modelos antiguos con 2-4 GB de VRAM.
- Ejecucion en CPU: viable con llama.cpp u Ollama; con cuantizaciones Q4 el modelo de 1,7B suele generar varios tokens por segundo en CPUs de escritorio, aunque no se dispone de cifras oficiales para este artefacto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con GGUF y la infraestructura de endpoints de Hugging Face (tag "endpoints_compatible"). vLLM y TGI no soportan GGUF de forma nativa, por lo que requeririan el modelo base en safetensors.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-heretic-ara-i1-GGUF (este) | 1,73B | no disponible | lfm1.0 | GGUF (24 quants) | Variante decensored cuantizada con imatrix |
| dalatexcoder/LFM3-1.7B-heretic-ara | 1,73B | no disponible | lfm1.0 | safetensors | Modelo base sin cuantizar del que deriva este artefacto |
| LFM3-1.7B original (Liquid AI) | 1,7B | no disponible | lfm1.0 | safetensors | Version alineada con rechazos, sin modificacion heretic |
| mradermacher/LFM3-1.7B-heretic-ara-GGUF | 1,73B | no disponible | lfm1.0 | GGUF (quants estaticos) | Misma base, cuantizacion estatica en lugar de imatrix |

La comparacion con modelos de otras familias (Qwen2.5-1.5B, Llama-3.2-1B, Gemma-2-2B) no puede establecerse con rigor porque no hay datos de rendimiento publicados para este artefacto; los tamanos son similares, pero las licencias y los contextos difieren y no se dispone de cifras comparables.

## Limitaciones y advertencias
- El proceso heretic/abliteration elimina los rechazos de seguridad: el modelo puede producir contenido danino, ofensivo o ilegal sin filtro, lo que lo hace inadecuado para aplicaciones de cara al publico sin moderacion adicional.
- Riesgo elevado de alucinacion: con 1,7B parametros, la fiabilidad factografica es limitada; no debe usarse como fuente de verdad en dominios especializados.
- La model card no documenta la longitud de contexto, por lo que no puede garantizarse el comportamiento en conversaciones largas ni en tareas de recuperacion con muchos documentos.
- Sesgos: no se han publicado evaluaciones de sesgo para esta variante; al derivar de un modelo base con datos web, es probable que herede sesgos linguisticos y culturales, agravados por la eliminacion de filtros.
- Restricciones de licencia: la licencia lfm1.0 puede imponer condiciones al uso comercial; debe revisarse el fichero LICENSE del repositorio antes de desplegar el modelo en produccion.
- Artefacto de cuantizacion: la calidad depende del quant elegido; las variantes IQ1 e IQ2 estan marcadas por el autor como de calidad baja o "para desesperados" y no deberian usarse en produccion.
- Idiomas: aunque se declaran 16, no hay evaluaciones por idioma; el rendimiento en idiomas distintos del ingles puede ser desigual.
- Sin soporte verificado de tool calling ni agentes: no hay evidencia en la informacion proporcionada de que el modelo maneje function calling de forma fiable.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/mradermacher/LFM3-1.7B-heretic-ara-i1-GGUF
- Modelo base: https://huggingface.co/dalatexcoder/LFM3-1.7B-heretic-ara
- Cuantizaciones estaticas del mismo autor: https://huggingface.co/mradermacher/LFM3-1.7B-heretic-ara-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#LFM3-1.7B-heretic-ara-i1-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
