# BioJazz-Lab/ESMC-6B

## Resumen

ESMC-6B es un modelo de lenguaje de proteinas (protein language model, pLM) con 6.352.005.184 parametros, 80 capas y 2,37e23 FLOPs de entrenamiento. Aprende las regularidades estadisticas de las secuencias de proteinas a partir de miles de millones de secuencias y produce representaciones densas (embeddings) utiles para tareas downstream: prediccion de efecto de variantes, ingenieria de proteinas, anotacion funcional y plegado. El repositorio analizado se publica bajo la organizacion de HuggingFace «BioJazz-Lab», pero la model card, las rutas de codigo y las dependencias apuntan a «biohub» (Chan Zuckerberg Biohub) como autoria original; conviene tratar esta copia como una redistribucion no oficial hasta verificar su integridad.

El modelo se libera junto a dos variantes mas pequenas sobrentrenadas (ESMC-300M y ESMC-600M) pensadas para inferencia local y fine-tuning, y sirve de base congelada para ESMFold2, un predictor de estructura proteica de nueva generacion. Ademas, se publica un autoencoder disperso (SAE) construido sobre la capa 60 de ESMC-6B que aporta descripciones de caracteristicas interpretables por humanos y generadas por agentes. Es relevante ahora porque situa un pLM transformer puro a escala de 6B en abierto, con licencia MIT y un ecosistema de artefactos asociados (estructura, interpretabilidad, API alojada) que hasta hace poco no existia a este tamano.

La tarea de entrenamiento es enmascaramiento de tokens (masked language modeling, pipeline `fill-mask`) sobre alfabeto de aminoacidos, no generacion de texto en lenguaje natural. Esto condiciona por completo sus capacidades, su hardware y sus casos de uso: no es un chatbot ni un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Pre-LN, rotary embeddings (RoPE) y activaciones SwiGLU; sin biases en capas lineales ni en layer norms |
| Parametros totales | 6.352.005.184 (unos 6.350 millones) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 2048 tokens (residuos de aminoacidos) en la fase final de entrenamiento; 512 en la fase 1 |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; los pesos publicados son safetensors de ~25,4 GB, compatibles con fp32 y convertibles a bf16/fp16 |
| Idiomas soportados | Etiquetado como «en» en la model card; en la practica opera sobre secuencias de aminoacidos, no sobre lenguaje natural |
| Licencia | MIT, con un aviso adicional «other» enlazado a `THIRD_PARTY_NOTICE.md` |
| Formato de pesos | safetensors, con `custom_code` (libreria `esm`) |
| Capas | 80 |
| FLOPs de entrenamiento | 2,37e23 |
| Tamano del repositorio | 25,4 GB |
| Pipeline de HuggingFace | `fill-mask` |
| Libreria | `transformers` (requiere `trust_remote_code` por el codigo personalizado) |

## Arquitectura y entrenamiento

ESMC-6B es un transformer decoder-style adaptado a modelado enmascarado de secuencias proteicas. Usa Pre-LN, embeddings rotatorios y SwiGLU, y elimina los biases de las capas lineales y de las layer norms, una decision coherente con la tendencia a simplificar bloques para mejorar estabilidad y eficiencia a gran escala. Con 80 capas y 6.350 millones de parametros, es la variante grande de una familia entrenada a tres escalas: 300M (30 capas, 1,26e22 FLOPs), 600M (36 capas, 2,17e22 FLOPs) y 6B (80 capas, 2,37e23 FLOPs).

Los datos de entrenamiento proceden de UniRef, MGnify y el Joint Genome Institute (JGI), agrupados al 70 % de identidad de secuencia, lo que produjo 83 millones, 372 millones y 2.000 millones de clusters respectivamente. El entrenamiento se dividio en dos fases: 1 millon de pasos iniciales con contexto de 512 y un 64 % de datos metagenomicos, seguidos de 500.000 pasos finales con contexto ampliado a 2048 y el porcentaje metagenomico reducido al 37,5 %. El objetivo es masked language modeling, no RLHF ni DPO, que no aplican a este dominio.

Como artefactos tecnicos destacables: ESMFold2 se entrena sobre una copia congelada de ESMC-6B para prediccion de estructura, y el SAE `ESMC-6B-sae-layer60-k64-codebook16384` (k=64, codebook de 16.384) extrae caracteristicas interpretables de la capa 60. La model card menciona soporte opcional de Flash Attention, `xformers` y `transformer_engine`.

## Capacidades

- Modelado enmascarado de secuencias de proteinas: rellena posiciones ocultas y devuelve logits sobre el vocabulario de aminoacidos.
- Generacion de embeddings de proteina, tanto de la capa final como de todas las capas intermedias con `output_hidden_states=True`.
- Prediccion de efecto de variantes (variant effect prediction) mediante zero-shot likelihood o fine-tuning supervisado.
- Transfer learning: base para fine-tuning en tareas de proteina con pocos datos etiquetados.
- Ingenieria de proteinas: puntuacion de mutantes, filtrado de librerias de diseno y ranking de candidatos.
- Soporte de estructura proteica a traves de ESMFold2 (modelo separado que consume ESMC-6B congelado).
- Interpretabilidad mecanicista mediante el SAE de la capa 60 (artefacto separado).
- Capacidades que NO tiene: generacion de texto en lenguaje natural, tool calling o function calling, comportamiento agentico, razonamiento multi-paso en el sentido de los LLM, vision, audio ni soporte multilingue de lenguaje natural.

## Casos de uso

- **Prediccion de efecto de variantes en genomica clinica**: obtener embeddings de la proteina wild-type y de cada mutante missense y entrenar una cabeza de clasificacion (o usar la diferencia de log-likelihood) para priorizar variantes probablemente patogenicas. El contexto de 2048 residuos cubre la mayoria de proteinas humanas sin trocear.
- **Ingenieria de anticuerpos y proteinas terapeuticas**: puntuar librerias de mutantes de una region determinada y filtrar los que degradan la verosimilitud del modelo, reduciendo el espacio experimental antes de expresar y ensayar en laboratorio.
- **Prediccion de estructura en pipelines de diseno**: combinar ESMC-6B con ESMFold2 para obtener estructura rapida y precisa de candidatos disenados, usando el pLM como extractor de representaciones congelado.
- **Anotacion funcional de metagenomas**: generar embeddings de proteinas desconocidas de muestras ambientales (MGnify, JGI) y hacer busqueda por similitud o clustering para asignar familias funcionales, ya que el modelo se entreno explicitamente con un 37,5-64 % de datos metagenomicos.
- **Fine-tuning para propiedades medibles**: solubilidad, termoestabilidad, localizacion subcelular o union a ligandos, partiendo de los checkpoints 300M/600M para iterar rapido y escalando a 6B cuando la tarea lo justifique.
- **Interpretabilidad y descubrimiento de motivos**: usar el SAE sobre la capa 60 para identificar caracteristicas activadas por motivos estructurales o funcionales concretos y contrastarlas con anotaciones conocidas.
- **Filtrado zero-shot en pipelines de protein design**: descartar secuencias generadas por otros modelos que el pLM puntua como improbables antes de pasar a validacion experimental.
- **Recuperacion de proteinas por embedding**: indexar un corpus proteico con embeddings de ESMC-6B y servir busqueda semantica de homologia remota, donde alineamientos clasicos fallan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite integramente a las metricas del paper «Language Modeling Materializes a World Model of Protein Biology» (bioRxiv, 2026), sin tablas de resultados en el repositorio de HuggingFace. No se deben asumir cifras de MMLU, HumanEval, GSM8K ni equivalentes, ya que no aplican a este dominio; las metricas relevantes serian de plegado (GDT_TS, lDDT), prediccion de variantes (Spearman con scores experimentales) y perplejidad en proteina, y ninguna de ellas figura en el material proporcionado.

## Requisitos de hardware

- **Pesos en fp32**: 25,4 GB solo de pesos (coincide con el tamano del repo). Requiere GPU de 40 GB o mas para inferencia comoda; A100 40/80 GB, H100 80 GB o L40S 48 GB.
- **Pesos en bf16/fp16**: ~12,7 GB de pesos mas activaciones y cache de atencion. Estimacion practica de 16-20 GB de VRAM. Cabe en RTX 4090 (24 GB), RTX 3090 (24 GB) y A10G (24 GB) con margen ajustado.
- **Cuantizacion int8**: estimacion de 8-12 GB de VRAM, apta para GPUs de 16 GB (RTX 4080, A4000). No hay artefactos de cuantizacion publicados: habria que convertir manualmente.
- **Cuantizacion int4**: estimacion de 5-8 GB, viable en GPUs de 8-12 GB, con perdida de calidad no documentada.
- **Consumer GPU**: si, en tarjetas de 24 GB a bf16 y en tarjetas de 16 GB con conversion a 8 bits. No hay GGUF publicado, por lo que `llama.cpp` y Ollama no son opciones listas para usar.
- **Despliegue**: `transformers` con `AutoModelForMaskedLM` y `trust_remote_code=True`, o el paquete `esm` desde PyPI. Se recomienda `xformers` o `transformer_engine` para atencion eficiente. vLLM y TGI no estan documentados para esta arquitectura con `custom_code`; el pipeline `fill-mask` no encaja en los servidores orientados a generacion autoregresiva. Existe una API alojada en Biohub Platform.
- **Latencia y throughput**: no disponibles. Como referencia estructural, la atencion escala de forma cuadratica con la longitud, por lo que pasar de 512 a 2048 residuos multiplica aproximadamente por 16 el coste de atencion; con 80 capas a 6B, batch grande en una sola GPU exige planificacion cuidadosa de memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Capas | Contexto | FLOPs entrenamiento | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| ESMC-6B | 6B | 80 | 2048 | 2,37e23 | pLM enmascarado + embeddings | MIT + aviso «other» | HuggingFace |
| ESMC-600M | 600M | 36 | No disponible | 2,17e22 | pLM enmascarado + embeddings | MIT + aviso «other» | HuggingFace |
| ESMC-300M | 300M | 30 | No disponible | 1,26e22 | pLM enmascarado + embeddings | MIT + aviso «other» | HuggingFace |
| ESMFold2 | No disponible | No disponible | No disponible | No disponible | Prediccion de estructura (sobre ESMC-6B congelado) | No disponible en detalle | HuggingFace |

Frente a la familia ESM-2 de Meta, predecesora directa del linaje, ESMC-6B se posiciona en un regimen de parametros intermedio entre las variantes de 3B y 15B, con un enfasis explicito en datos metagenomicos (hasta el 64 % en la fase 1) que ESM-2 no documenta de forma equivalente. No se dispone en la informacion proporcionada de cifras de rendimiento comparables entre ambas familias, por lo que la eleccion entre una y otra debe basarse en el paper y en evaluacion propia sobre la tarea concreta, no en este cuadro.

Dentro de la propia familia, la decision practica es directa: 300M/600M para prototipado, fine-tuning e inferencia en consumer; 6B cuando la tarea requiera maxima sensibilidad (variantes de efecto sutil, homologos remotos) o cuando se vaya a usar como backbone de ESMFold2.

## Limitaciones y advertencias

- **Sesgo taxonomico y funcional**: el corpus (UniRef, MGnify, JGI) sobrerrepresenta organismos modelo, bacterias cultivables y familias genicas bien estudiadas; proteinas de eucariotas no modelo, virus y taxones poco muestreados quedan peor representadas.
- **Riesgo de puntuaciones enganosamente altas**: el modelo asigna verosimilitud a secuencias que pueden ser inviables in vivo; una puntuacion alta no equivale a funcion correcta. No es un «alucinador» de texto, pero si un generador de plausibilidad estadistica.
- **Limite de contexto**: 2048 residuos. Proteinas largas (titinas, distrofina) hay que trocear, con perdida de coherencia global entre fragmentos.
- **No modela estructura de forma explicita**: la geometria requiere ESMFold2 u otro predictor; los embeddings no son coordenadas.
- **Restricciones de licencia**: la licencia es MIT, pero existe un aviso «other» (`THIRD_PARTY_NOTICE.md`) que hay que revisar antes de uso comercial, redistribution o integracion en productos. La doble etiqueta mit/other en HuggingFace es ambigua.
- **Idioma**: etiquetado como «en»; no procesa lenguaje natural, por lo que no sirve para tareas multilingues ni de texto.
- **Procedencia del repositorio**: el ID es `BioJazz-Lab/ESMC-6B`, no `biohub/ESMC-6B`. Con 0 descargas y 0 likes, no hay validacion comunitaria de esta copia; verificar checksums y procedencia antes de usarla en produccion.
- **Riesgo de cadena de suministro**: requiere `trust_remote_code=True` y ejecuta codigo personalizado del repositorio; auditar `modeling_*.py` antes de desplegar en entornos con datos sensibles.
- **Sin benchmarks publicados** en la informacion disponible: no hay evidencia cuantitativa independiente que respalde las afirmaciones de state-of-the-art de la model card.
- **Cuantizacion no soportada oficialmente**: cualquier conversion a 8 o 4 bits es responsabilidad del usuario y puede degradar tareas sensibles como prediccion de variantes.

## Enlaces

- Repositorio analizado: https://huggingface.co/BioJazz-Lab/ESMC-6B
- Repositorio original de referencia: https://huggingface.co/biohub/ESMC-6B
- Variante 600M: https://huggingface.co/biohub/ESMC-600M
- Variante 300M: https://huggingface.co/biohub/ESMC-300M
- Modelo de estructura ESMFold2: https://huggingface.co/biohub/ESMFold2
- Sparse autoencoder de la capa 60: https://huggingface.co/biohub/ESMC-6B-sae-layer60-k64-codebook16384
- Vision general de SAE de ESMC: https://huggingface.co/biohub/ESMC-SAE-Overview
- Paper (bioRxiv, 2026): https://www.biorxiv.org/content/10.64898/2026.06.03.729735
- Aviso de licencia de terceros: https://github.com/Biohub/esm/blob/main/THIRD_PARTY_NOTICE.md
- Plataforma alojada de Biohub: https://biohub.ai/
- Paquete `esm` en PyPI: https://pypi.org/project/esm/
