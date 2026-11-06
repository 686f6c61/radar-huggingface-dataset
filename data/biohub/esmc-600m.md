# biohub/ESMC-600M

## Resumen

ESMC-600M es un modelo de lenguaje de proteinas (protein language model, PLM) de la familia ESMC desarrollada por Biohub. Se trata de la variante intermedia de una familia que incluye tambien los modelos ESMC-300M y ESMC-6B, y que se entrena sobre miles de millones de secuencias proteicas para aprender representaciones densas de proteinas utiles en tareas de biologia computacional y diseno de proteinas. El modelo resuelve el problema de obtener embeddings ricos y transferibles de secuencias de aminoacidos sin necesidad de alineamientos multiples ni ingenieria de caracteristicas manual.

Arquitectonicamente es un transformer encoder con Pre-LN, rotary embeddings y activaciones SwiGLU, entrenado con objetivo de masked language modeling (fill-mask). La variante de 600M cuenta con 36 capas y 575.036.992 parametros reales segun los pesos en safetensors, y fue entrenada con 2,17e22 FLOPs. El contexto de entrenamiento paso de 512 a 2048 tokens en la segunda fase, lo que condiciona la longitud practica de las secuencias que maneja.

Su relevancia actual radica en que sirve como base congelada para modelos derivados de mayor alcance, como ESMFold2 (prediccion y diseno de estructura proteica) y los autoencoders dispersos (SAE) de interpretabilidad construidos sobre ESMC-6B. La variante de 600M esta pensada para inferencia local y fine-tuning en hardware asequible, manteniendo la licencia MIT que facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (Pre-LN, rotary embeddings, SwiGLU, sin biases en lineales ni layer norms) |
| Parametros totales | 575.036.992 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud de entrenamiento en la fase 2; fase 1 con 512) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones oficiales; pesos en safetensors) |
| Idiomas soportados | en (el modelo opera sobre secuencias de aminoacidos, no sobre lenguaje natural) |
| Licencia | MIT (con aviso de terceros adicional en THIRD_PARTY_NOTICE.md) |
| Formato de pesos | safetensors (repo de 4,6 GB) |

## Arquitectura y entrenamiento

ESMC-600M es un transformer encoder de 36 capas con Pre-LayerNorm, rotary positional embeddings y activaciones SwiGLU, sin terminos de bias en las capas lineales ni en las layer norms. El objetivo de entrenamiento es masked language modeling sobre secuencias de proteinas, lo que produce representaciones contextuales por residuo y por secuencia. La familia completa se entreno a tres escalas (300M, 600M y 6B) con 2,17e22 FLOPs para la variante de 600M, siguiendo una curva de escalado que el paper describe.

Los datos de entrenamiento provienen de UniRef, MGnify y el Joint Genome Institute (JGI), agrupados al 70% de identidad de secuencia, con 83M, 372M y 2B clusters respectivamente. El entrenamiento se realizo en dos etapas: los primeros 1.000.000 de pasos con contexto de 512 y un 64% de datos metagenomicos, y los ultimos 500.000 pasos con contexto de 2048 y el porcentaje metagenomico reducido al 37,5%. El modelo base de 6B se usa congelado como tronco para ESMFold2 y para los SAE de interpretabilidad, lo que confirma que la representacion aprendida captura estructura y funcion proteica de forma transferible.

## Capacidades

- Generacion de embeddings de proteinas a nivel de residuo y de secuencia, utiles para transfer learning en tareas downstream.
- Masked language modeling (fill-mask) sobre secuencias de aminoacidos: predice residuos enmascarados a partir del contexto.
- Extraccion de estados ocultos de todas las capas del transformer mediante `output_hidden_states=True`, lo que permite usar representaciones intermedias.
- Prediccion de efectos de variantes (variant-effect prediction) mediante fine-tuning sobre los embeddings.
- Ingenieria de proteinas: scoring de mutaciones, diseno dirigido y priorizacion de candidatos terapeuticos.
- Base para modelos derivados: ESMFold2 (estructura y diseno) y SAE de interpretabilidad construidos sobre ESMC-6B.
- Soporte de atencion eficiente mediante Flash Attention como alternativa a scaled dot product attention (sdpa).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso en el sentido de los LLM de proposito general; es un modelo especializado en biologia.
- Capacidad multilingue no aplicable: opera sobre el alfabeto de aminoacidos, no sobre texto en lenguaje natural.

## Casos de uso

- Prediccion de efectos de variantes: fine-tuning de una cabeza de clasificacion sobre los embeddings de ESMC-600M para estimar el impacto funcional de mutaciones puntuales en proteinas humanas, aprovechando que el modelo captura restricciones evolutivas de las secuencias.
- Priorizacion de variantes en genomica clinica: uso de los scores del modelo como senal adicional junto a predictores especializados para triar variantes de significado incierto en paneles de diagnostico.
- Ingenieria de proteinas terapeuticas: scoring in silico de bibliotecas de mutantes para seleccionar candidatos con mayor probabilidad de plegarse y mantener funcion, reduciendo el numero de variantes a validar en laboratorio.
- Busqueda y agrupamiento de proteinas: generacion de embeddings de secuencia para indexar y agrupar familias proteicas, detectar homologos remotos o construir espacios latentes para busqueda por similitud.
- Fine-tuning para tareas de anotacion: entrenamiento de cabezas ligeras sobre las representaciones para predecir localizacion subcelular, solubilidad, termoestabilidad u otras propiedades medibles.
- Destilacion y modelos ligeros en produccion: al ser la variante intermedia de la familia, sirve como punto de equilibrio entre calidad de representacion y coste computacional para pipelines que procesan grandes volumenes de secuencias en GPU de gama media.
- Investigacion en interpretabilidad: aunque los SAE publicos se construyen sobre ESMC-6B, la variante de 600M permite experimentos de interpretabilidad a menor coste y con la misma interfaz de extraccion de estados ocultos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite explicitamente al paper de ESMC y ESMFold2 (bioRxiv) para las metricas de rendimiento, sin incluir tablas numericas en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,3 GB solo para pesos (575M parametros x 4 bytes), mas activaciones y memoria del tokenizador; en la practica, entre 3 y 4 GB para secuencias de hasta 2048 tokens.
- VRAM estimada en fp16/bf16: aproximadamente 1,15 GB para pesos, con un total practico de 2 a 3 GB segun longitud de secuencia y tamano de batch.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM; cabe holgadamente en RTX 3060, RTX 4060, RTX 4070, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: si, en practicamente toda la gama media y alta actual, incluidas GPUs de portatil con 6-8 GB.
- Opciones de despliegue: transformers con PyTorch (via `AutoModelForMaskedLM`), con soporte opcional de `transformer_engine` y `xformers`; el paquete `esm` de PyPI; la Biohub Platform API para inferencia gestionada. No se documenta soporte oficial de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Capas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ESMC-600M | 575M | 36 | 2048 | MIT | Hugging Face (biohub) |
| ESMC-300M | 300M | 30 | no disponible | MIT | Hugging Face (biohub) |
| ESMC-6B | 6B | 80 | no disponible | MIT | Hugging Face (biohub) |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de ESMC-600M con alternativas de otros autores (por ejemplo, ESM-2 de Meta) en la informacion proporcionada. La comparativa se limita, por tanto, a las variantes de la propia familia ESMC.

## Limitaciones y advertencias

- Modelo especializado en proteinas: no es un LLM de proposito general y no debe usarse para generacion de texto, codigo o conversacion.
- Contexto limitado a 2048 tokens de aminoacidos; proteinas mas largas requieren truncado, fragmentacion o estrategias de ventana.
- Entrenado principalmente con datos metagenomicos y de UniRef/MGnify/JGI; puede tener sesgos hacia familias proteicas sobrerrepresentadas en esas bases de datos y rendir peor en proteinas raras o de origen sintetico.
- Riesgo de alucinacion en el sentido biologico: las predicciones de residuos enmascarados o de efectos de variantes son estimaciones probabilisticas y requieren validacion experimental.
- El modelo devuelve por defecto solo la representacion de la ultima capa; el uso de capas intermedias requiere activar `output_hidden_states=True` y puede cambiar el rendimiento en tareas downstream.
- La licencia es MIT, pero existe un aviso de terceros adicional (THIRD_PARTY_NOTICE.md) que debe revisarse antes de un uso comercial; conviene verificar las condiciones de los datos de entrenamiento subyacentes.
- No se documentan cuantizaciones oficiales ni soporte de motores de inferencia de alto rendimiento como vLLM o llama.cpp, lo que limita el despliegue a gran escala sin trabajo adicional de integracion.
- Para produccion en biologia estructural se recomienda usar ESMFold2, que se apoya en ESMC-6B congelado, en lugar de la variante de 600M.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/biohub/ESMC-600M
- Variante ESMC-300M: https://huggingface.co/biohub/ESMC-300M
- Variante ESMC-6B: https://huggingface.co/biohub/ESMC-6B
- ESMFold2: https://huggingface.co/biohub/ESMFold2
- Autoencoder disperso ESMC-6B: https://huggingface.co/biohub/ESMC-6B-sae-layer60-k64-codebook16384
- Vision general de SAE de ESMC: https://huggingface.co/biohub/ESMC-SAE-Overview
- Paper (bioRxiv): https://www.biorxiv.org/content/10.64898/2026.06.03.729735
- Biohub Platform: https://biohub.ai/
- Pagina del modelo en Biohub: https://www.biohub.ai/models/esmc
- Aviso de terceros (licencia): https://github.com/Biohub/esm/blob/main/THIRD_PARTY_NOTICE.md
