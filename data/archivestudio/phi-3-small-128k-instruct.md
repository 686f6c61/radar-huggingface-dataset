# ArchiveStudio/Phi-3-small-128k-instruct

## Resumen

Phi-3-small-128k-instruct es un modelo de lenguaje de 7.392.272.384 parametros (aproximadamente 7,39B) desarrollado por Microsoft dentro de la familia Phi-3. Se trata de la variante "Small" con ventana de contexto larga de 128.000 tokens, disenada para entornos con restricciones de memoria y computo y para escenarios con requisitos estrictos de latencia, manteniendo un enfoque en razonamiento denso (codigo, matematicas y logica).

El modelo fue entrenado con los datasets de Phi-3, que combinan datos sinteticos y datos filtrados de sitios web publicos, priorizando contenido de alta calidad y densidad de razonamiento. Tras el preentrenamiento se aplico un proceso de post-entrenamiento que incluye ajuste supervisado (SFT) y optimizacion de preferencias directa (DPO) para mejorar el seguimiento de instrucciones y las medidas de seguridad.

Esta ficha corresponde a la reproduccion publicada por el usuario ArchiveStudio en HuggingFace, que redistribuye los pesos bajo licencia MIT. La relevancia actual del modelo radica en ofrecer una ventana de contexto de 128K tokens en un tamano de 7B que puede ejecutarse en hardware de gama alta de consumo o en una unica GPU de datacenter, con un tokenizador de vocabulario amplio (hasta 100.352 tokens) basado en tiktoken.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Phi-3 (requiere `custom_code` y `trust_remote_code=True` para su carga) |
| Parametros totales | 7.392.272.384 (7,39B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens (128K) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Multilingue (etiqueta del repo); la model card indica uso principal en ingles |
| Licencia | MIT |
| Formato de pesos | safetensors (tamano del repo: 14,8 GB) |

## Arquitectura y entrenamiento

Se trata de un modelo transformer decoder-only perteneciente a la familia Phi-3, en su variante "Small". La model card no detalla la composicion exacta de las capas, pero el repositorio esta etiquetado con `custom_code` y su uso requiere `trust_remote_code=True`, ademas de dependencias especificas como tiktoken (0.6.0) y triton (2.3.0). El tokenizador soporta un vocabulario de hasta 100.352 tokens. El modelo forma parte de una familia que incluye variantes de contexto corto (8K) y largo (128K), siendo esta ultima la que aqui se describe.

El entrenamiento se realizo sobre los datasets de Phi-3, que mezclan datos sinteticos con datos filtrados de webs publicas, con enfasis en contenido de alta calidad y densidad de razonamiento. El post-entrenamiento combino ajuste supervisado (SFT) y optimizacion de preferencias directa (DPO), orientados a mejorar el seguimiento de instrucciones y las medidas de seguridad. La model card no especifica el numero total de tokens de entrenamiento ni la composicion exacta del dataset.

El formato de chat esperado es: `<|endoftext|><|user|>\nQuestion <|end|>\n<|assistant|>`, generando el texto a continuacion de `<|assistant|>`. Se admiten prompts con few-shots siguiendo el mismo esquema.

## Capacidades

- Generacion de texto conversacional en formato chat multi-turno.
- Razonamiento orientado a codigo, matematicas y logica, segun la model card.
- Comprension y generacion en contextos largos de hasta 128.000 tokens.
- Soporte multilingue a nivel de etiqueta, aunque la model card indica que el modelo esta pensado principalmente para ingles.
- Capacidad de seguir instrucciones gracias al proceso de SFT y DPO.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte explicito de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponibles; esta variante es exclusivamente de texto.

## Casos de uso

- Analisis de documentos extensos: con 128K tokens de contexto el modelo puede procesar contratos, informes o documentacion tecnica completa en una sola pasada, evitando estrategias de fragmentacion y reduciendo la perdida de informacion entre bloques.
- Asistencia a la programacion: adecuado para generar y revisar codigo en entornos con restricciones de latencia, integrandose en editores o pipelines de revision previa al commit.
- Razonamiento matematico y resolucion de problemas paso a paso: util en herramientas educativas o de apoyo al estudio que requieren explicaciones detalladas.
- Atencion al cliente automatizada: puede gestionar conversaciones multi-turno con historial largo gracias a su ventana de contexto, manteniendo coherencia a lo largo de interacciones extensas.
- Resumen y extraccion de informacion de repositorios de codigo o bases documentales largas, aprovechando la ventana de 128K tokens para cubrir varios ficheros o articulos simultaneamente.
- Prototipado rapido en entornos con recursos limitados: al ser un modelo de 7,39B, puede desplegarse en una GPU de gama alta de consumo o en una unica GPU de datacenter para pruebas de concepto e investigacion.
- Generacion de contenido tecnico multilingue, siempre que se asuma que el rendimiento optimo se da en ingles y se valide la calidad en otros idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma que el modelo muestra un rendimiento solido frente a modelos del mismo tamano y del siguiente escalon en pruebas de sentido comun, comprension del lenguaje, matematicas, codigo, contexto largo y razonamiento logico, pero no incluye cifras concretas (MMLU, HumanEval, GSM8K, etc.) en el material facilitado.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del numero de parametros, no confirmada por el autor):
  - FP16/BF16: aproximadamente 14,8 GB solo para pesos, mas memoria para KV cache y activaciones (el KV cache crece de forma apreciable con contextos de 128K tokens).
  - INT8: aproximadamente 7,4 GB para pesos.
  - INT4: aproximadamente 3,7 a 4 GB para pesos.
- GPU recomendadas: A100 (40/80 GB) o H100 para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 con contextos moderados o INT8/INT4 con contexto largo; GPUs con 8-16 GB para cuantizaciones de 4 bits.
- Aptitud para GPU de consumo: si, cabe en RTX 4090, RTX 3090 y tarjetas similares de 24 GB, y en GPUs de 8-16 GB con cuantizacion, siempre que se ajuste la longitud de contexto a la memoria disponible.
- Opciones de despliegue: la model card menciona integracion en `transformers` (version de desarrollo 4.40.2 o superior), con `trust_remote_code=True`, y disponibilidad en Azure AI. No se confirman en la informacion proporcionada soportes especificos para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| Phi-3-small-128k-instruct (esta ficha) | 7,39B | 128K | MIT | No disponible (sin cifras) | HuggingFace, Azure AI |
| Phi-3-mini-128k-instruct | No disponible en la informacion proporcionada | 128K | MIT (familia Phi-3) | No disponible | HuggingFace, ONNX |
| Phi-3-medium-128k-instruct | No disponible en la informacion proporcionada | 128K | MIT (familia Phi-3) | No disponible | HuggingFace, ONNX |
| Phi-3.5 (mini / MoE / vision) | No disponible en la informacion proporcionada | No disponible | MIT (familia Phi-3) | No disponible | HuggingFace |

La model card enlaza explicitamente a las variantes Phi-3.5 (mini-instruct, MoE-instruct y vision-instruct) como evoluciones posteriores de la familia. No se aportan datos de rendimiento comparativo numerico entre ellas en la informacion disponible.

## Limitaciones y advertencias

- La propia model card advierte de que el modelo no esta disenado ni evaluado para todos los propositos downstream; el desarrollador debe evaluar y mitigar riesgos de precision, seguridad y equidad antes de usarlo, especialmente en escenarios de alto riesgo.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; el autor recomienda considerar las limitaciones comunes y validar las salidas antes de usarlas en produccion.
- Sesgos: la model card reconoce la necesidad de mitigar sesgos, pero no detalla sesgos concretos conocidos.
- Idioma: aunque la etiqueta del repo indica "multilingual", la model card especifica que el modelo esta destinado a uso comercial y de investigacion en ingles, por lo que el rendimiento en otros idiomas puede ser inferior.
- Contexto: la variante descrita soporta 128K tokens; existe una variante de 8K con comportamiento distinto. Usar el contexto completo incrementa de forma notable el consumo de memoria del KV cache.
- Dependencia tecnica: requiere `trust_remote_code=True` y versiones concretas de dependencias (tiktoken 0.6.0, triton 2.3.0, transformers de desarrollo 4.40.2), lo que puede complicar el despliegue reproducible en produccion.
- Licencia: MIT permite uso comercial, pero conviene revisar el enlace de licencia referenciado en la model card para confirmar los terminos exactos aplicables a esta reproduccion.
- Esta ficha describe una reproduccion subida por el usuario ArchiveStudio, no el repositorio oficial de Microsoft; se recomienda verificar la integridad de los pesos antes de desplegarlos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ArchiveStudio/Phi-3-small-128k-instruct
- Modelo original de Microsoft (referencia de licencia): https://huggingface.co/microsoft/Phi-3-small-128k-instruct
- Licencia referenciada: https://huggingface.co/microsoft/Phi-3-small-128k-instruct/resolve/main/LICENSE
- Blog de Phi-3 de Microsoft: https://aka.ms/Phi-3Build2024
- Informe tecnico de Phi-3: https://aka.ms/phi3-tech-report
- Phi-3 en Azure AI Studio: https://aka.ms/phi3-azure-ai
- Phi-3 Cookbook: https://github.com/microsoft/Phi-3CookBook
- Variante Phi-3.5 mini-instruct: https://huggingface.co/microsoft/Phi-3.5-mini-instruct
- Variante Phi-3.5 MoE-instruct: https://huggingface.co/microsoft/Phi-3.5-MoE-instruct
- Variante Phi-3.5 vision-instruct: https://huggingface.co/microsoft/Phi-3.5-vision-instruct
- Variante de contexto 8K: https://huggingface.co/microsoft/Phi-3-small-8k-instruct
- Version ONNX CUDA: https://huggingface.co/microsoft/Phi-3-small-128k-instruct-onnx-cuda
