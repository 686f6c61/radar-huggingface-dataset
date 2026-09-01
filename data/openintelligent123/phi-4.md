# Openintelligent123/phi-4

## Resumen

Phi-4 es un modelo de lenguaje de 14 000 millones de parámetros desarrollado por Microsoft Research y liberado en diciembre de 2024. Su principal innovación reside en una receta de entrenamiento centrada en la calidad de los datos: combina datasets sintéticos generados específicamente para enseñar razonamiento, contenido web filtrado rigurosamente, libros académicos y datasets de preguntas y respuestas. El objetivo es ofrecer un modelo compacto con capacidades de razonamiento y lógica comparables a modelos mucho más grandes, en un rango de tamaño que permite su despliegue en entornos con restricciones de memoria o latencia.

Arquitectónicamente es un transformer denso decoder-only con 14 000 millones de parámetros y una ventana de contexto de 16 000 tokens. El modelo se distribuye bajo licencia MIT, lo que facilita su uso comercial y académico. Su relevancia actual radica en que demuestra que un entrenamiento basado en datos sintéticos de alta calidad puede superar a modelos de mayor tamaño en tareas de razonamiento matemático y lógico, como refleja su informe técnico. Esta ficha se basa en la subida del modelo realizada por el usuario Openintelligent123 en Hugging Face, que reproduce el modelo original de Microsoft.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only |
| Parametros totales | 14 659 507 200 (14B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 16 384 tokens (16K) |
| Tipos de cuantizacion | No especificados en la informacion; compatible con cuantizaciones estandar (FP16, INT8, INT4) mediante herramientas externas |
| Idiomas soportados | Ingles principalmente; datos multilingues ~8% del entrenamiento |
| Licencia | MIT |
| Formato de pesos | safetensors (tamano del repo: 29.3 GB) |

## Arquitectura y entrenamiento

Phi-4 es un modelo transformer denso decoder-only con 14 000 millones de parametros. Su entrenamiento se realizo sobre 9,8 billones de tokens, utilizando 1920 GPU H100-80G durante 21 dias (octubre-noviembre de 2024). La estrategia principal es el uso intensivo de datos sinteticos de tipo "textbook-like" para ensenar matematicas, codigo, razonamiento de sentido comun y conocimiento general, complementados con datos web filtrados por calidad y libros academicos adquiridos. El proceso de post-entrenamiento incluye supervised fine-tuning (SFT) y direct preference optimization (DPO) iterativo, con el objetivo de mejorar la adherencia a instrucciones y la seguridad. El informe tecnico destaca que, a diferencia de otros modelos que dependen principalmente de datos organicos, phi-4 incorpora datos sinteticos de forma estrategica a lo largo de todo el entrenamiento, lo que contribuye a su rendimiento en tareas de razonamiento.

## Capacidades

- Generacion de texto en formato chat, con seguimiento de instrucciones y respuestas conversacionales.
- Razonamiento logico y matematico avanzado, especialmente en problemas de nivel competitivo (MATH, GPQA).
- Generacion de codigo funcional, evaluada con HumanEval.
- Comprension lectora y razonamiento sobre textos complejos (DROP).
- Capacidad multilingue limitada: aunque el modelo esta enfocado al ingles, el 8% de datos multilingues le proporciona cierta competencia basica en otros idiomas.
- No se menciona soporte explicito de tool calling o function calling en la informacion disponible, aunque por su naturaleza de chat podria adaptarse con prompting.
- No se especifican capacidades de vision, audio u otras modalidades; es exclusivamente textual.

## Casos de uso

- Asistente de programacion: puede generar, revisar y explicar codigo en multiples lenguajes, integrable en entornos de desarrollo o pipelines de CI/CD para automatizar tareas de generacion de pruebas o documentacion.
- Tutor de matematicas y ciencias: su entrenamiento con datos sinteticos de razonamiento lo hace adecuado para resolver problemas paso a paso, explicar conceptos y generar ejercicios personalizados.
- Analisis de documentos tecnicos: con 16K de contexto, puede procesar articulos, informes o manuales extensos y extraer conclusiones, resumir o responder preguntas especificas.
- Chatbot de atencion al cliente: gestiona conversaciones multi-turno con contexto amplio, manteniendo coherencia y ofreciendo respuestas precisas en ingles.
- Generacion de contenido educativo: crea explicaciones, ejemplos y cuestionarios sobre temas variados, aprovechando su capacidad de razonamiento y claridad expositiva.
- Prototipado rapido de aplicaciones de IA generativa: su tamano moderado y licencia MIT permiten integrarlo en productos comerciales sin costes de licencia, ideal para startups o equipos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el modelo fue evaluado con OpenAI's SimpleEval y benchmarks internos en tareas como MMLU, MATH, GPQA, DROP, MGSM, HumanEval y SimpleQA, pero no se proporcionan valores numericos. El informe tecnico (arXiv:2412.08905) contiene dichos resultados, pero no estan incluidos en los datos facilitados para esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16 se necesitan aproximadamente 28 GB; en INT8 unos 14 GB; en INT4 unos 7 GB. Estas cifras son estimaciones basadas en el tamano de parametros y pueden variar segun la implementacion.
- GPU recomendadas: para FP16, una A100 40GB o 80GB, o una RTX 4090 24GB (con cuantizacion INT8). Para INT4, una RTX 3090 o RTX 4060 Ti 16GB podrian ser suficientes.
- En consumer GPU: cabe en tarjetas de gama alta con 24 GB de VRAM usando cuantizacion INT8 o INT4, pero no en tarjetas de 8-12 GB sin cuantizacion agresiva.
- Opciones de despliegue: compatible con transformers, vLLM, TGI, llama.cpp y Ollama (mediante conversion a GGUF). El tag de Hugging Face indica compatibilidad con text-generation-inference y endpoints.
- Latencia y throughput: no se proporcionan datos oficiales; dependen del hardware y la cuantizacion. En una A100, se puede esperar un throughput de decenas de tokens por segundo para generacion.

## Comparativa con modelos similares

No se dispone de datos de comparacion en la informacion proporcionada. Phi-4 se situa en la categoria de modelos de 14B parametros, donde compite con alternativas como Qwen2.5-14B, Llama-3.1-8B (menor tamano) o Mistral-7B. Sin embargo, no se han incluido cifras de rendimiento ni especificaciones de estos modelos en los datos disponibles, por lo que no es posible realizar una comparativa cuantitativa rigurosa. Se recomienda consultar el informe tecnico de phi-4 para ver comparaciones con modelos de tamano similar.

## Limitaciones y advertencias

- Enfoque principal en ingles: el modelo no esta disenado ni evaluado para uso multilingue extenso; los datos no ingleses representan solo el 8% del entrenamiento, por lo que su rendimiento en otros idiomas puede ser limitado.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en temas de actualidad o conocimiento especializado no cubierto en su entrenamiento (corte de datos en junio de 2024).
- Sesgos potenciales: los datos de entrenamiento, aunque filtrados, pueden contener sesgos sociales, culturales o de genero. No se han publicado evaluaciones exhaustivas de sesgo para este modelo.
- No evaluado para usos de alto riesgo: la model card advierte que no esta disenado para aplicaciones criticas (medicas, legales, financieras) sin una evaluacion y mitigacion adicional por parte del desarrollador.
- Limitaciones de contexto: aunque 16K tokens es adecuado para muchos casos, puede quedarse corto para documentos muy extensos o conversaciones de larga duracion.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero el modelo no incluye garantias de exactitud o seguridad; el usuario es responsable de su despliegue.

## Enlaces

- Repositorio en Hugging Face (subida por Openintelligent123): https://huggingface.co/Openintelligent123/phi-4
- Repositorio oficial de Microsoft en Hugging Face: https://huggingface.co/microsoft/phi-4
- Informe tecnico en arXiv: https://arxiv.org/abs/2412.08905
- Publicacion del informe en Microsoft Research: https://www.microsoft.com/en-us/research/publication/phi-4-technical-report/
- Catalogo de modelos de Microsoft Foundry: https://ai.azure.com/catalog/models/Phi-4
- Pagina de la familia Phi en Azure: https://azure.microsoft.com/en-us/products/phi/
