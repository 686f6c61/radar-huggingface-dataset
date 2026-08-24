# JohnCheng/gemma-4-26b-it-sp-oc-ep1

## Resumen

El modelo `JohnCheng/gemma-4-26b-it-sp-oc-ep1` es una variante afinada de la familia Gemma 4 de Google DeepMind, publicada por el usuario JohnCheng en HuggingFace. Se trata de un modelo multimodal de tipo imagen-texto a texto, con una arquitectura Mixture of Experts (MoE) de 25.8 mil millones de parámetros totales y aproximadamente 4 mil millones de activos por token, según las especificaciones de la serie Gemma 4 26B A4B. El pipeline `image-text-to-text` indica que acepta tanto texto como imágenes como entrada y genera texto como salida.

La relevancia de este modelo radica en que pertenece a la generación más reciente de modelos abiertos de Google DeepMind, diseñados para tareas de razonamiento, generación de código y agentes multimodales. La variante concreta publicada por JohnCheng añade un ajuste específico (indicado por el sufijo `sp-oc-ep1`) sobre la versión instruct, aunque los detalles exactos de ese ajuste no están documentados en la información disponible. El acceso al repositorio está restringido y requiere aceptar las condiciones de uso en HuggingFace, lo que limita su evaluación inmediata.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) transformadora, multimodal (imagen + texto) |
| Parametros totales | 25.805.933.872 (25.8 B) |
| Parametros activos | 4.8 B (estimado segun serie Gemma 4 A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors en precision completa) |
| Idiomas soportados | no disponible (se espera multilingue, sin especificar) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Mixture of Experts (MoE) de la serie Gemma 4, con 26 mil millones de parametros totales y aproximadamente 4.8 mil millones de parametros activos por token. Esta disposicion permite un rendimiento elevado con un coste computacional reducido en inferencia, ya que solo se activa un subconjunto de expertos para cada token procesado. La arquitectura incorpora atencion multimodal que procesa tanto texto como imagenes, y ha sido optimizada para tareas de razonamiento, generacion de codigo y uso como agente.

El entrenamiento base de Gemma 4 fue realizado por Google DeepMind con un enfoque en seguridad y alineacion, incluyendo fases de ajuste instructivo (instruction tuning) y optimizacion con preferencias humanas. La variante `it-sp-oc-ep1` de JohnCheng parece ser un ajuste posterior especifico, aunque no se dispone de documentacion publica sobre los datos de entrenamiento, el numero de tokens utilizados ni las tecnicas de alineacion adicionales aplicadas. El tag `arxiv:1910.09700` hace referencia al articulo de Shazeer et al. sobre Mixture of Experts, indicando que la arquitectura MoE es un componente central del modelo.

## Capacidades

- Generacion de texto en multiples idiomas, con soporte de razonamiento complejo y resumen de contenido.
- Procesamiento multimodal: acepta imagenes como entrada junto con texto, y genera respuestas descriptivas o analiticas sobre el contenido visual.
- Generacion de codigo en diversos lenguajes de programacion, aprovechando la arquitectura MoE para tareas de programacion de alta complejidad.
- Soporte de agentes y razonamiento multi-paso, disenado para tareas que requieren planificacion y ejecucion de secuencias de acciones.
- Capacidades de tool calling / function calling, habilitando la integracion con APIs y sistemas externos.
- Multilingue, con cobertura amplia de idiomas, aunque el conjunto exacto no esta especificado en la informacion disponible.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo, procesando tanto consultas textuales como imagenes adjuntas (capturas de pantalla, fotos de productos) para resolver incidencias de forma autonoma.
- Analisis de imagenes y documentos: permite extraer informacion de imagenes, como facturas, graficos o diagramas, y generar resumenes o respuestas estructuradas, util en entornos de back-office.
- Generacion de codigo en produccion: con soporte de tool calling, puede integrarse en pipelines de CI/CD para autogenerar tests, documentacion o refactorizaciones de codigo.
- Asistente de investigacion multimodal: combina la lectura de articulos cientificos (texto) con figuras y tablas (imagenes) para responder preguntas complejas y resumir resultados.
- Automatizacion de agentes de navegacion web: el modelo puede razonar sobre capturas de pantalla y texto de paginas web para realizar tareas como rellenar formularios o extraer datos.
- Soporte de desarrollo low-code: permite a usuarios no tecnicos describir interfaces visuales (mediante imagenes) y obtener codigo HTML/CSS o JavaScript funcional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos verificados de MMLU, HumanEval, GSM8K ni otros tests estandarizados para esta variante concreta. Se recomienda consultar la documentacion oficial de Gemma 4 en DeepMind para conocer el rendimiento de la serie base, pero no se puede afirmar que la variante `sp-oc-ep1` mantenga o mejore esos numeros.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 26B parametros en precision fp16, se requieren aproximadamente 52 GB de VRAM para cargar los pesos completos. Con cuantizacion (por ejemplo, 8 bits) se reduce a unos 26 GB, y con 4 bits a unos 13 GB, aunque no se dispone de ficheros cuantizados en el repositorio.
- GPU recomendadas: para inferencia en fp16 se recomienda una NVIDIA A100 (80 GB) o H100 (80 GB). Para cuantizacion 8 bits, una RTX 4090 (24 GB) podria ser insuficiente; se necesitaria al menos una A6000 (48 GB) o una GPU con 32 GB de VRAM.
- En consumer GPU: no es viable en GPU de consumo de 16 GB o menos, ni siquiera con cuantizacion agresiva, debido al tamao del modelo.
- Opciones de despliegue: vLLM, TGI, Transformers de HuggingFace, y llama.cpp (si se generan ficheros GGUF). No se proporcionan ficheros listos para Ollama.
- Latencia y throughput: no disponibles. Se espera un rendimiento moderado gracias a la arquitectura MoE, que reduce el coste por token en comparacion con un modelo denso de 26B.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Modalidad | Licencia |
|---|---|---|---|---|---|
| Gemma 4 26B A4B IT (oficial) | 26B | 4.8B | no disponible | texto + imagen | Gemma Terms of Use |
| JohnCheng/gemma-4-26b-it-sp-oc-ep1 | 25.8B | 4.8B (estimado) | no disponible | texto + imagen | no disponible |
| Mixtral 8x7B | 46.7B | 12.9B | 32k | texto | Apache 2.0 |
| Qwen 2.5 32B Instruct | 32.5B | 32.5B (denso) | 128k | texto | Apache 2.0 |

La comparativa se limita a la serie Gemma 4 y alternativas MoE o densas de tamano similar. La variante de JohnCheng no difiere en arquitectura de la oficial, pero el ajuste especifico (`sp-oc-ep1`) no esta documentado, por lo que no se puede valorar su rendimiento relativo.

## Limitaciones y advertencias

- Licencia no disponible: no se especifican los terminos de uso, lo que impide garantizar su uso comercial o derivado. El acceso es restringido y requiere aceptar condiciones en HuggingFace.
- Alucinaciones: como todo modelo generativo, puede producir respuestas plausibles pero incorrectas, especialmente en dominios especializados.
- Sesgos: no se ha documentado ningun estudio de sesgos para esta variante concreta; la serie base puede presentar sesgos de genero, raza o idioma.
- Limitaciones de contexto: la longitud de contexto no se ha especificado, por lo que no se puede garantizar el comportamiento en conversaciones muy largas.
- Idioma: no se ha detallado el conjunto de idiomas soportados; aunque Gemma 4 es multilingue, el ajuste especifico podria haber alterado el rendimiento en algunos idiomas.
- Produccion: al ser una variante no oficial y sin documentacion de entrenamiento, no se recomienda su despliegue en entornos criticos sin evaluacion previa exhaustiva.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JohnCheng/gemma-4-26b-it-sp-oc-ep1
- Modelo base experimental de JohnCheng: https://huggingface.co/JohnCheng/gemma-4-26b-it-exp
- Guia de Gemma 4 26B en gemma4.wiki: https://www.gemma4.wiki/models/gemma-4-26b
- Documentacion oficial de Gemma 4 en DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Documentacion de Gemma 4 26B A4B IT en Google Cloud: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/google/gemma-4-26b-a4b-it
