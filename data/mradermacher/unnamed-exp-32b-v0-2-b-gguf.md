# mradermacher/Unnamed-Exp-32b-v0.2.B-GGUF

## Resumen

Unnamed-Exp-32b-v0.2.B es un modelo de lenguaje de aproximadamente 32.760 millones de parámetros (32,76 B) publicado originalmente por el usuario TheSkullery bajo el identificador `TheSkullery/Unnamed-Exp-32b-v0.2.B`. La ficha que nos ocupa es la versión cuantizada en formato GGUF realizada por mradermacher, un conocido proveedor de cuantizaciones estáticas para la comunidad. El modelo se presenta como un experimento base ("Unnamed-Exp") orientado a conversación y etiquetado en inglés, sin documentación técnica pública sobre su entrenamiento.

La relevancia de esta ficha es fundamentalmente práctica: permite ejecutar un modelo de 32 B en hardware de consumo mediante cuantizaciones que van desde Q2_K (12,4 GB) hasta Q8_0 (34,9 GB). Al tratarse de una cuantización estática (sin imatrix), el autor advierte de que no hay versiones ponderadas disponibles, lo que limita la calidad frente a alternativas IQ.

La información disponible es escasa: no hay model card del modelo base, no se especifican datos de entrenamiento, contexto, licencia ni benchmarks. Esta ficha refleja exclusivamente lo que puede verificarse a partir de los metadatos de Hugging Face y de la model card del cuantizador, marcando como "no disponible" todo aquello que no consta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer decoder-only, sin confirmar) |
| Parametros totales | 32.759.790.592 (32,76 B) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base se distribuye presumiblemente en safetensors via transformers |
| Tamano del repo | 224,0 GB |
| Modelo base | TheSkullery/Unnamed-Exp-32b-v0.2.B |
| Libreria declarada | transformers |
| Compatibilidad endpoints | endpoints_compatible |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo base. El recuento de parámetros (32,76 B) y la librería declarada (`transformers`) son compatibles con un transformer decoder-only de escala 32 B, pero no se confirma ni el número de capas, ni las dimensiones ocultas, ni si emplea atención lineal, decodificación especulativa u otras innovaciones. Tampoco consta que sea un modelo MoE.

Respecto al entrenamiento, la model card del cuantizador no incluye ningún detalle sobre volumen de tokens, composición del dataset, fases de RLHF/DPO o procesos de alineación. El único dato verificable es el etiquetado del modelo como "experimental" (prefijo `Unnamed-Exp`) y su orientación conversacional (`conversational` en los tags). La cuantización realizada por mradermacher es de tipo estático (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`), sin versiones imatrix/ponderadas, lo que el propio autor indica que puede afectar a la calidad frente a cuantizaciones IQ equivalentes en tamaño.

## Capacidades

- Generación de texto conversacional en inglés, según el tag `conversational`.
- Etiquetado como `endpoints_compatible`, lo que sugiere compatibilidad con la API de endpoints de Hugging Face.
- No consta soporte explícito de tool calling ni function calling.
- No consta soporte de agentes ni razonamiento multi-paso documentado.
- No consta capacidad multilingüe más allá del inglés declarado.
- No consta modo thinking, visión, audio ni otras capacidades especiales.
- El tamaño de 32 B sugiere capacidad razonable de razonamiento y código, pero no hay evidencia publicada que lo confirme.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: la cuantización Q4_K_M (19,9 GB) permite ejecutar el modelo en una RTX 4090 (24 GB) o en una RTX 3090, útil para experimentación con modelos de 32 B sin infraestructura de servidor.
- Prototipado de asistentes conversacionales en inglés: al estar etiquetado como `conversational`, puede emplearse para validar flujos de chat multi-turno antes de migrar a un modelo con documentación y licencia claras.
- Evaluación comparativa interna: sirve como baseline experimental de 32 B frente a modelos consolidados de tamaño similar en pruebas de calidad subjetiva.
- Inferencia en CPU con llama.cpp: las cuantizaciones Q2_K (12,4 GB) y Q3_K_S (14,5 GB) permiten ejecución en máquinas con 16 GB de RAM, aunque con pérdida de calidad notable.
- Fine-tuning experimental: al ser un modelo base sin alineación documentada, puede servir como punto de partida para ajustes supervisados en dominios concretos, siempre que se resuelva la licencia.
- Investigación sobre cuantización: la disponibilidad de 11 variantes GGUF permite estudiar el impacto de la cuantización estática frente a IQ en un modelo de 32 B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada según cuantización: Q2_K 12,4 GB; Q3_K_S 14,5 GB; Q3_K_M 16,0 GB; Q3_K_L 17,3 GB; IQ4_XS 18,0 GB; Q4_K_S 18,9 GB; Q4_K_M 19,9 GB; Q5_K_S 22,7 GB; Q5_K_M 23,4 GB; Q6_K 27,0 GB; Q8_0 34,9 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_S; A100 40 GB o H100 para Q6_K y Q8_0; RTX 3090 válida para Q4_K_M.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con Q4_K_M o inferiores; en GPUs de 16 GB solo con Q2_K o Q3_K_S.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, y servidores compatibles con GGUF; el modelo base en transformers puede servirse con vLLM o TGI si se dispone de los pesos originales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Unnamed-Exp-32b-v0.2.B (esta ficha) | 32,76 B | no disponible | no disponible | GGUF | Experimental, sin benchmarks |
| Qwen2.5-32B-Instruct | 32,5 B | 32.768 tokens (ampliable) | Apache 2.0 | safetensors, GGUF | Documentado, benchmarks públicos |
| Mistral Small 24B | 24 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Documentado, buen rendimiento en código |
| Gemma 2 27B | 27 B | 8.192 tokens | Gemma License | safetensors, GGUF | Documentado, restricciones de uso |

La comparación es orientativa: los tres alternativos cuentan con model card completa, licencia explícita y benchmarks publicados, mientras que Unnamed-Exp-32b-v0.2.B carece de todos ellos. Para producción, las alternativas documentadas son preferibles salvo que se requiera específicamente este checkpoint experimental.

## Limitaciones y advertencias

- Licencia no disponible: no puede asumirse uso comercial sin consultar al autor del modelo base (TheSkullery).
- Ausencia total de documentación técnica: sin contexto, sin datos de entrenamiento y sin benchmarks, no es posible evaluar su calidad de forma objetiva.
- Solo inglés declarado: no se garantiza comportamiento correcto en castellano ni en otros idiomas.
- Riesgo de alucinación desconocido: al no haber información sobre alineación (RLHF/DPO), no puede descartarse un comportamiento conversacional deficiente o propenso a inventar.
- Cuantizaciones estáticas únicamente: el autor advierte de que no hay versiones imatrix/ponderadas, lo que puede degradar la calidad frente a IQ del mismo tamaño.
- Modelo experimental: el prefijo `Unnamed-Exp` y la ausencia de versión estable sugieren que no está pensado para producción.
- Repositorio de 224 GB: descargar el conjunto completo de cuantizaciones requiere espacio considerable; conviene descargar solo la variante necesaria.
- Sesgos: no disponibles; al no documentarse el dataset, no puede evaluarse el sesgo de entrenamiento.

## Enlaces

- Hugging Face (esta cuantización): https://huggingface.co/mradermacher/Unnamed-Exp-32b-v0.2.B-GGUF
- Modelo base: https://huggingface.co/TheSkullery/Unnamed-Exp-32b-v0.2.B
- Página de descargas del cuantizador: https://hf.tst.eu/model#Unnamed-Exp-32b-v0.2.B-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica comparativa de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
