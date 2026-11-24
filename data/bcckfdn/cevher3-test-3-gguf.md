# bcckfdn/cevher3-test-3-GGUF

## Resumen

cevher3 es un modelo de lenguaje de tipo base entrenado por el usuario bcckfdn y publicado en Hugging Face tanto en pesos originales como en formato GGUF. Se trata de un modelo pequeno, con 1.256.312.832 parametros totales (aproximadamente 1,26 mil millones), construido sobre la arquitectura Gemma3 con atencion de ventana deslizante (SWA), con 34 capas y una dimension oculta de 1792. Su entrenamiento declara 6.992 millones de tokens (6.992 B) y esta orientado a la generacion de texto conversacional en turco e ingles.

La relevancia de esta publicacion es practica: al distribuirse en GGUF con cuantizaciones que van desde BF16 hasta Q4_K_M, el modelo puede ejecutarse en CPU o en GPUs de consumo mediante llama.cpp, Ollama o LM Studio. El archivo Q4_K_M ocupa 744 MB, lo que lo situa en el rango de modelos que caben holgadamente en cualquier GPU consumer moderna e incluso en sistemas con poca VRAM.

No obstante, conviene subrayar que se trata de un modelo de prueba (el identificador incluye "test-3"), sin likes ni documentacion tecnica detallada mas alla de la model card, y sin resultados de benchmarks publicados. Su utilidad principal es la experimentacion y el prototipado en turco, no un uso en produccion critica sin evaluacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Gemma3 con atencion de ventana deslizante (SWA) |
| Parametros totales | 1.256.312.832 (aprox. 1,26 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | Turco (tr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo GGUF); pesos originales en el modelo base bcckfdn/cevher3-test-3 |
| Capas | 34 |
| Dimension oculta | 1792 |
| Tokens de entrenamiento | 6.992 B (segun model card) |
| Tamano del repo | 11,1 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Gemma3 con atencion de ventana deslizante (SWA), una variante que limita el coste computacional de la atencion a contextos locales en determinadas capas, reduciendo el consumo de memoria y acelerando la inferencia en secuencias largas. La configuracion declarada incluye 34 capas y una dimension oculta de 1792, coherente con un modelo de aproximadamente 1,26 mil millones de parametros.

Segun la model card, el entrenamiento utilizo 6.992 millones de tokens. No se especifica la composicion del dataset, si hubo fases de ajuste supervisado (SFT), RLHF o DPO, ni detalles sobre la tokenizacion o el vocabulario. Tampoco se documenta la longitud de contexto nativa ni si se aplicaron tecnicas de extension de contexto. La informacion disponible sobre el proceso de entrenamiento es, por tanto, minima.

## Capacidades

- Generacion de texto conversacional en turco e ingles, segun los idiomas declarados en la model card.
- Modo conversacional mediante el flag `-cnv` de llama-cli, lo que indica soporte de plantillas de chat en el formato GGUF.
- Inferencia local en CPU y GPU a traves de llama.cpp, Ollama y LM Studio.
- Cuantizacion disponible en cuatro niveles (BF16, Q8_0, Q5_K_M, Q4_K_M) para adaptar el modelo a distintos presupuestos de memoria.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito (thinking mode).
- No se documentan capacidades de codigo o matematicas mas alla de las que pueda ofrecer un modelo base de este tamano.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en turco: el modelo puede desplegarse con Ollama en minutos y servir como base para validar flujos de chat antes de invertir en modelos mayores.
- Inferencia en entornos con recursos limitados: el archivo Q4_K_M (744 MB) permite ejecutar el modelo en portatiles sin GPU dedicada o en dispositivos edge, gracias a llama.cpp.
- Experimentacion academica con arquitecturas Gemma3 y SWA: investigadores pueden estudiar el comportamiento de la atencion de ventana deslizante en un modelo pequeno y reentrenable.
- Generacion de texto en aplicaciones de bajo coste: para tareas de completado, resumen o redaccion asistida en turco donde no se requiera maxima calidad y prime el coste por token.
- Base para fine-tuning: al ser un modelo de 1,26 B con licencia Apache 2.0, puede ajustarse en una sola GPU consumer para dominios especificos (atencion al cliente, documentacion tecnica en turco).
- Educacion y demostraciones: util para ensenar conceptos de cuantizacion GGUF y despliegue local, ya que ofrece cuatro variantes con tamanos bien diferenciados (2399 MB a 744 MB).
- Pruebas de integracion con LM Studio y Ollama: sirve como banco de pruebas para pipelines de inferencia local antes de migrar a modelos mayores con la misma toolchain.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5 GB en BF16, 1,4 GB en Q8_0, 1,0 GB en Q5_K_M y 0,9 GB en Q4_K_M (incluyendo overhead del runtime).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son mas que suficientes. El modelo esta claramente sobredimensionado para GPUs de datacenter.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer modernas e incluso en iGPUs con memoria unificada.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio. No se documenta soporte para vLLM o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles. Por el tamano del modelo, se espera una latencia baja en GPU consumer, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| cevher3-test-3 (este) | 1,26 B | no disponible | Apache 2.0 | GGUF | Turco/ingles, arquitectura Gemma3 SWA |
| Gemma 2 2B | 2,6 B | 8K | Gemma license | Safetensors, GGUF | Modelo oficial de Google, mas grande y con contexto documentado |
| Qwen2.5 1.5B | 1,5 B | 32K | Apache 2.0 | Safetensors, GGUF | Multilingue amplio, contexto largo documentado |
| Llama 3.2 1B | 1,2 B | 128K | Llama 3.2 license | Safetensors, GGUF | Contexto muy largo, licencia con restricciones de uso |

La comparacion se basa en el tamano y la categoria (modelos pequenos de generacion de texto). cevher3 no dispone de benchmarks publicados, por lo que no es posible comparar rendimiento de forma cuantitativa con las alternativas.

## Limitaciones y advertencias

- Modelo de prueba: el identificador "test-3" sugiere que no es una version estable ni final; no se recomienda su uso en produccion sin evaluacion exhaustiva.
- Ausencia de benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni otras metricas, lo que impide estimar su calidad real.
- Riesgo de alucinacion: como todo modelo de lenguaje de este tamano, es propenso a generar informacion incorrecta, especialmente en dominios especializados.
- Sesgos desconocidos: no se documenta la composicion del dataset de entrenamiento, por lo que no es posible evaluar sesgos de genero, etnicos o culturales.
- Cobertura limitada de idiomas: solo se declaran turco e ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Contexto no documentado: se desconoce la longitud maxima de contexto, lo que dificulta planificar su uso en tareas que requieran ventanas largas.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero al ser un modelo sin garantias ni evaluacion, el riesgo de calidad recae en el integrador.
- Sin soporte documentado de tool calling ni agentes: no apto para pipelines que requieran function calling sin validacion previa.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/bcckfdn/cevher3-test-3-GGUF
- Modelo base: https://huggingface.co/bcckfdn/cevher3-test-3
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
