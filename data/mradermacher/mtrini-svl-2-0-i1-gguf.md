# mradermacher/Mtrini-SVL-2.0-i1-GGUF

## Resumen

Mtrini-SVL-2.0-i1-GGUF es una colección de cuantizaciones dinámicas con imatrix (importance matrix) del modelo CompiwerAI/Mtrini-SVL-2.0, publicada por mradermacher, un cuantizador muy conocido en la comunidad de Hugging Face. El modelo base es un LLM de razonamiento de unos 8.900 millones de parámetros, basado en la arquitectura Qwen3.5, entrenado por CompiwerAI con un enfoque especial en el dialecto marroquí darija (idiomas: darija marroquí, árabe estándar e inglés).

La relevancia de este modelo reside en la combinación de dos factores: por un lado, aborda la escasez de modelos de razonamiento de calidad para el árabe y, en particular, para el darija marroquí, un dialecto con muy poco soporte en los LLM comerciales; por otro, la publicación en formato GGUF con más de veinte niveles de cuantización permite ejecutarlo localmente en hardware de consumo, desde portátiles modestos hasta GPUs dedicadas. El entrenamiento emplea datasets de razonamiento reconocidos como s1K-1.1, LIMO, codeforces-cots y OpenThoughts3-1.2M, además del dataset Darija-SFT-Mixture de MBZUAI-Paris.

El repositorio cuantizado pesa 110,2 GB en total (suma de todas las variantes), con archivos individuales que van desde 2,8 GB (IQ1_S) hasta 7,5 GB (Q6_K). Según la model card, se trata además de un modelo con capacidades de visión, cuyos archivos mmproj se encuentran en el repositorio estático asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3.5 (transformer, según tags del repo) |
| Parametros totales | 8.953.803.264 (~8,95 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (todas dinámicas con imatrix) |
| Idiomas soportados | Darija marroquí (ary), árabe (ar), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado a partir de safetensors del modelo base) |

## Arquitectura y entrenamiento

El modelo base, CompiwerAI/Mtrini-SVL-2.0, se construye sobre la arquitectura Qwen3.5 y tiene aproximadamente 8.953 millones de parámetros. Los tags del repositorio lo etiquetan como modelo de razonamiento (reasoning), y la model card del cuantizador indica que se trata de un modelo de visión, por lo que presumiblemente incorpora un componente multimodal (los archivos mmproj para llama.cpp están en el repositorio de cuantizaciones estáticas). No se ha publicado información detallada sobre la composición exacta de la arquitectura (número de capas, cabezas de atención, etc.) ni sobre la longitud de contexto.

El entrenamiento del modelo base combina datasets de razonamiento de alta calidad muy conocidos en la comunidad open source: simplescaling/s1K-1.1 y GAIR/LIMO (curación de datos de razonamiento minimalista), open-r1/codeforces-cots (cadenas de razonamiento de problemas competitivos de programación), open-thoughts/OpenThoughts3-1.2M (razonamiento general STEM) y MBZUAI-Paris/Darija-SFT-Mixture (ajuste fino supervisado en darija marroquí del proyecto Atlas-Chat de MBZUAI). Esta mezcla sugiere un pipeline de SFT sobre datos de razonamiento seguido de especialización dialectal. No se dispone de información sobre el número total de tokens de entrenamiento ni sobre el uso de RLHF o DPO.

La publicación de mradermacher no altera los pesos del modelo: aplica cuantización dinámica con matriz de importancia (imatrix, generada sobre el modelo original) para producir versiones GGUF que van desde ~2 bits (IQ1_S, 2,8 GB) hasta ~6 bits (Q6_K, 7,5 GB), optimizando la relación tamaño/calidad según el nivel elegido.

## Capacidades

- Razonamiento step-by-step: entrenado con datasets de cadenas de razonamiento (s1K, LIMO, OpenThoughts3), orientado a tareas de razonamiento complejo.
- Resolución de problemas de programación competitiva: entrenamiento con cadenas de razonamiento de Codeforces (open-r1/codeforces-cots).
- Matemáticas y STEM: cubierto por OpenThoughts3-1.2M y LIMO.
- Comprensión del darija marroquí: capacidad diferencial frente a la mayoría de LLM open source, gracias al dataset Darija-SFT-Mixture.
- Árabe estándar e inglés: soporte multilingüe en tres idiomas (ary, ar, en).
- Capacidades de visión: la model card del cuantizador indica que es un modelo de visión (mmproj disponible en el repo estático).
- Formato conversacional: etiquetado como conversational, apto para chat multi-turno.

No consta información sobre soporte de tool calling, function calling ni capacidades agénticas.

## Casos de uso

- Asistentes conversacionales en darija marroquí: el modelo puede servir de base para chatbots que atiendan a usuarios marroquíes en su idioma materno, algo que la mayoría de LLM genéricos resuelven mal; el ajuste fino con Darija-SFT-Mixture lo hace especialmente adecuado.
- Atención al cliente multilingüe en Marruecos: un despliegue con Q4_K_M (5,7 GB) cabe en hardware modesto y puede gestionar conversaciones alternando darija, árabe estándar e inglés según el cliente.
- Razonamiento matemático y STEM educativo: gracias a su entrenamiento con OpenThoughts3 y LIMO, puede emplearse como tutor que explica soluciones paso a paso en árabe o inglés.
- Programación competitiva y ayuda a la codificación: el entrenamiento con codeforces-cots lo orienta a resolver problemas algorítmicos con razonamiento explícito.
- Aplicaciones locales y offline en dispositivos de consumo: las cuantizaciones IQ2/IQ3 (3,2-4,5 GB) permiten ejecutar el modelo en portátiles sin GPU dedicada vía llama.cpp u Ollama.
- Análisis de contenido multimodal: al ser un modelo de visión, puede combinarse con los archivos mmproj del repositorio estático para tareas de descripción de imágenes o OCR en entornos locales (sujeto a compatibilidad de llama.cpp).
- Investigación en NLP para lenguas de bajo recurso: base ideal para experimentos de fine-tuning o evaluación en darija, dado su tamaño manejable y licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: depende de la cuantización elegida. Aproximadamente: IQ1_S (2,8 GB) hasta Q6_K (7,5 GB) solo de pesos; se recomienda añadir 1-2 GB adicionales para el contexto y la sobrecarga de ejecución. La cuantización Q4_K_M (5,7 GB) es la recomendada por el autor por equilibrio calidad/velocidad.
- GPUs recomendadas: para la variante Q6_K, una RTX 3060 de 12 GB o superior permite inferencia totalmente en GPU. Para las variantes IQ2-IQ3, basta con GPUs de 4-6 GB (RTX 3050, RTX 4060) o incluso solo CPU con 8 GB de RAM.
- Consumer GPUs: sí, cabe cómodamente en prácticamente cualquier GPU moderna de 6 GB o más con cuantizaciones medias; con offload parcial de capas, incluso en equipos sin GPU dedicada.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. Para el modelo original en safetensors: vLLM, TGI o transformers.
- Latencia y throughput: no disponible. En GPUs de consumo con Q4_K_M cabe esperar velocidades de decodificación típicas de un modelo de ~9 B, en el orden de decenas de tokens por segundo, aunque no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas destacados | Licencia | Formato |
|---|---|---|---|---|
| Mtrini-SVL-2.0 (este modelo) | ~8,95 B | darija, árabe, inglés | Apache 2.0 | GGUF (24 cuants) / safetensors |
| Qwen3 8B | ~8 B | multilingüe (100+ idiomas, árabe incluido) | Apache 2.0 | safetensors, GGUF comunitarios |
| Atlas-Chat (MBZUAI) | 2B / 9B / 27B (Gemini-based) | darija, árabe | varies | safetensors |

Mtrini-SVL-2.0 se diferencia de Qwen3 8B en su especialización explícita en darija marroquí y en el enfoque de razonamiento mediante SFT con datasets curados tipo LIMO/s1K. Frente a Atlas-Chat, la familia de MBZUAI especializada en darija, Mtrini ofrece la ventaja de la licencia Apache 2.0 (según los metadatos) y la disponibilidad inmediata en GGUF con cuantizaciones dinámicas de alta calidad. No se dispone de cifras de benchmarks que permitan comparar rendimiento cuantitativo.

## Limitaciones y advertencias

- La ficha del modelo original no está disponible en la información proporcionada: faltan datos clave como longitud de contexto, plantilla de chat exacta y detalles de entrenamiento; conviene verificarlos en el repositorio base antes de producción.
- Riesgo de alucinación: como todo LLM de ~9 B entrenado principalmente con SFT de razonamiento, puede generar respuestas incorrectas con apariencia plausible, especialmente en conocimiento factual.
- Las cuantizaciones extremas (IQ1_S, IQ1_M, IQ2_XXS) degradan notablemente la calidad; el propio autor las califica de "para desesperados". Evítalas en producción.
- Soporte de idiomas limitado a tres (ary, ar, en): el rendimiento en otros idiomas, incluido el castellano, no está garantizado.
- Las capacidades de visión requieren los archivos mmproj del repositorio estático y un runtime compatible; la funcionalidad exacta no está documentada en esta model card.
- Licencia Apache 2.0: permite uso comercial, pero deben respetarse los términos de atribución y aviso de licencia.
- Los datos de entrenamiento incluyen datasets generados sintéticamente (OpenThoughts3, codeforces-cots), lo que puede introducir sesgos de estilo y de dominio hacia razonamiento STEM en inglés.
- No hay benchmarks publicados: cualquier decisión de adopción debería basarse en evaluaciones propias.

## Enlaces

- Repositorio cuantizado (i1-GGUF): https://huggingface.co/mradermacher/Mtrini-SVL-2.0-i1-GGUF
- Modelo base: https://huggingface.co/CompiwerAI/Mtrini-SVL-2.0
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Mtrini-SVL-2.0-GGUF
- Página de descargas resumida: https://hf.tst.eu/model#Mtrini-SVL-2.0-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Datasets de entrenamiento: https://huggingface.co/datasets/simplescaling/s1K-1.1, https://huggingface.co/datasets/GAIR/LIMO, https://huggingface.co/datasets/open-r1/codeforces-cots, https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M, https://huggingface.co/datasets/MBZUAI-Paris/Darija-SFT-Mixture
