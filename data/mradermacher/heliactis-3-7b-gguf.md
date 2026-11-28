# mradermacher/Heliactis-3-7B-GGUF

## Resumen
Heliactis-3-7B es un modelo de lenguaje de tipo transformer desarrollado por ApollonLabs, especializado en el idioma griego (etiqueta "greek") y entrenado sobre la base de un modelo K2-Horizon con fusión de LoRA (lora-merged). Esta ficha corresponde a la versión cuantizada en formato GGUF publicada por mradermacher, que facilita su despliegue en entornos con recursos limitados mediante llama.cpp y herramientas compatibles.

El modelo cuenta con aproximadamente 9.000 millones de parámetros totales (8.999.178.240 según los pesos safetensors), lo que lo sitúa en la categoría de modelos de 7-9B. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales, y está orientado a conversación (etiqueta "conversational") con soporte declarado para griego e inglés.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo afinado para griego en hardware de consumo, con una batería de cuantizaciones que van desde Q2_K (3,9 GB) hasta f16 (18,1 GB). No obstante, la información pública disponible sobre arquitectura interna, contexto y datos de entrenamiento es muy limitada, por lo que muchos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (detalle interno no disponible); etiqueta "k2-horizon" en el modelo base |
| Parametros totales | 8.999.178.240 (~9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (estáticas); variantes imatrix en el repo i1-GGUF |
| Idiomas soportados | griego (el), ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (esta ficha); safetensors en el modelo base |

## Arquitectura y entrenamiento
La información disponible indica que Heliactis-3-7B deriva de un modelo base etiquetado como "k2-horizon" y que ha sido sometido a una fusión de LoRA (lora-merged), lo que sugiere un ajuste fino supervisado sobre una arquitectura transformer preentrenada. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO.

Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o arquitecturas híbridas. La versión aquí descrita es una cuantización estática generada por mradermacher (quantize_version 2, output_tensor_quantised 1, convert_type hf), lo que implica que los pesos originales en formato Hugging Face fueron convertidos a GGUF y posteriormente cuantizados con las variantes K-quant estándar de llama.cpp.

## Capacidades
- Generación de texto conversacional en griego e inglés, según las etiquetas del modelo.
- Ajuste específico para griego (etiqueta "greek"), lo que lo hace adecuado para tareas en ese idioma.
- Fusión de LoRA que sugiere adaptación a instrucciones o diálogo, aunque no se detalla el corpus.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso
- Atención al cliente en griego: el modelo puede gestionar conversaciones multi-turno en griego gracias a su ajuste específico para ese idioma; su tamaño de ~9B permite desplegarlo en servidores modestos con cuantización Q4_K_M (5,7 GB).
- Generación de contenido editorial en griego: redacción de artículos, resúmenes y borradores en griego con un modelo de licencia Apache 2.0 que no impone restricciones comerciales.
- Traducción asistida griego-inglés: aunque no se documenta explícitamente como modelo de traducción, su bilingüismo declarado permite usarlo como apoyo en pipelines de traducción con revisión humana.
- Prototipado rápido en local: con cuantizaciones Q4_K_S (5,5 GB) o IQ4_XS (5,2 GB) puede ejecutarse en GPU de consumo como RTX 3060/4060 Ti o en CPU con llama.cpp, ideal para experimentación.
- Investigación en PLN para griego: útil como baseline afinado para griego en experimentos académicos, dado su tamaño manejable y licencia permisiva.
- Chatbots de dominio limitado: despliegue en entornos con presupuesto de VRAM reducido (8-12 GB) usando Q4_K_M o Q5_K_M, con la advertencia de que la calidad en tareas complejas no está documentada.
- Educación y asistencia lingüística: generación de ejercicios o explicaciones en griego para plataformas de aprendizaje de idiomas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente el tamaño del archivo GGUF más overhead. Q2_K ~3,9 GB; Q4_K_M ~5,7 GB; Q8_0 ~9,7 GB; f16 ~18,1 GB.
- GPU recomendadas: para Q4_K_M, una RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 24 GB funcionan con holgura; para f16 se recomienda A100 40 GB, H100 o RTX 4090 24 GB (justo).
- Cabe en GPU de consumo: sí, en cuantizaciones Q2_K a Q5_K_M en GPUs de 8-12 GB; Q6_K y Q8_0 requieren 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI si se dispone de la versión sin cuantizar.
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares
No se dispone de datos de benchmarks ni de comparativas publicadas en la información proporcionada. Como referencia estructural, se trata de un modelo de ~9B parámetros con licencia Apache 2.0 y cuantizaciones GGUF, comparable en formato de despliegue a otros modelos de 7-9B cuantizados por el mismo autor, pero no se pueden establecer comparaciones de rendimiento sin datos.

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmarks |
|---|---|---|---|---|---|
| Heliactis-3-7B (esta ficha) | ~9B | no disponible | apache-2.0 | GGUF / safetensors | no disponible |
| Alternativas de 7-9B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Sesgos conocidos: no documentados; al ser un modelo afinado para griego, puede presentar sesgos culturales o lingüísticos propios de su corpus de entrenamiento, que no se detalla.
- Riesgo de alucinación: no evaluado; sin benchmarks publicados no es posible cuantificar su fiabilidad en tareas factuales.
- Limitaciones de contexto o idioma: solo se declaran griego e inglés; el rendimiento en castellano u otros idiomas no está garantizado. La longitud de contexto no se especifica.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base (ApollonLabs/Heliactis-3-7B) y de los datos de entrenamiento originales.
- Caveats para producción: la ausencia de benchmarks y de documentación sobre entrenamiento dificulta la evaluación de calidad; se recomienda validación empírica antes de desplegar en entornos críticos. Las cuantizaciones Q2_K y Q3_K_M tienen calidad reducida según el propio autor.

## Enlaces
- [Hugging Face: mradermacher/Heliactis-3-7B-GGUF](https://huggingface.co/mradermacher/Heliactis-3-7B-GGUF)
- [Modelo base: ApollonLabs/Heliactis-3-7B](https://huggingface.co/ApollonLabs/Heliactis-3-7B)
- [Cuantizaciones imatrix: mradermacher/Heliactis-3-7B-i1-GGUF](https://huggingface.co/mradermacher/Heliactis-3-7B-i1-GGUF)
- [Página de descargas del autor](https://hf.tst.eu/model#Heliactis-3-7B-GGUF)
- [FAQ y solicitudes de cuantización de mradermacher](https://huggingface.co/mradermacher/model_requests)
- [Guía de uso de GGUF (README de TheBloke)](https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF)
- [Notas sobre cuantizaciones de Artefact2](https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9)
- [Gráfico comparativo de cuantizaciones de ikawrakow](https://www.nethype.de/huggingface_embed/quantpplgraph.png)
