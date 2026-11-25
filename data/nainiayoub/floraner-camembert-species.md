# nainiayoub/FloraNER-camembert-species

## Resumen

FloraNER-camembert-species es un modelo de reconocimiento de entidades nombradas (NER) especializado en la extraccion de nombres de especies vegetales en textos botanicos en frances. Desarrollado por nainiayoub, se obtiene mediante fine-tuning de `almanach/camembert-base` sobre el dataset FloraNER (split de especies), que anota texto botanico procedente de la *Flore de la Nouvelle-Calédonie*. El modelo resuelve un problema concreto: identificar de forma automatica binomios latinos (y ocasionalmente con autor) dentro de descripciones floristicas densas, tarea critica para digitalizar y estructurar literatura botanica historica.

Arquitectura transformer encoder-only (CamemBERT base, variante francesa de RoBERTa), con 110.033.667 parametros y un contexto de entrada de hasta 256 tokens por ventana. La tarea es token-classification con etiquetas BIO sobre una unica clase de entidad (`ESPECE`). El modelo es relevante ahora porque demuestra que un fine-tuning ligero (5 minutos en una RTX 4000 Ada de portatil) sobre un encoder de 110M puede alcanzar F1 de entidad de 98,3 en un dominio especializado, lo que lo convierte en una pieza util para pipelines de extraccion de biodiversidad a bajo coste computacional.

La licencia MIT y el formato safetensors lo hacen directamente desplegable en produccion sin restricciones comerciales, y su compatibilidad con `transformers` y endpoints permite integrarlo rapidamente en flujos de curacion de datos biologicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (CamemBERT base, variante francesa de RoBERTa) |
| Parametros totales | 110.033.667 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens por ventana de entrada (segmentacion de parrafos) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/bf16; cuantizacion no documentada) |
| Idiomas soportados | frances (fr) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `camembert-base`, un encoder transformer de 12 capas y 110M parametros entrenado sobre el corpus frances OSCAR. Sobre esa base se aplica un fine-tuning de token-classification con una cabeza lineal que predice etiquetas BIO para la clase `ESPECE`. La entrada se construye a partir de los parrafos publicados del dataset FloraNER, divididos en ventanas de como maximo 256 tokens, con alineacion de las etiquetas BIO a los tokens de CamemBERT a partir de los offsets de caracteres del release original.

El entrenamiento consistio en 8 epochs con learning rate 3e-05, batch de 16, optimizador AdamW con weight decay 0.01 y precision bf16, seleccionando el mejor epoch por F1 en test. Se utilizaron 1945 ventanas de entrenamiento y 486 ventanas de test, y el proceso completo tardo 5 minutos en una RTX 4000 Ada de portatil. La anotacion del dataset es por supervision distante (basada en lexico), lo que condiciona el techo de recall del modelo. No se documenta RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Reconocimiento de entidades nombradas de tipo especie (`ESPECE`) en texto botanico frances, incluyendo binomios latinos y, en ocasiones, el autor taxonomico.
- Token-classification con etiquetas BIO y agregacion de entidades mediante `aggregation_strategy="simple"` en el pipeline de `transformers`.
- Procesamiento de parrafos floristicos densos con vocabulario tecnico (morfologia, descriptores, terminologia latina).
- Extraccion estructurada de menciones de especies para alimentar bases de datos de biodiversidad.
- Integracion directa en pipelines de `transformers` y en endpoints compatibles.
- No soporta tool calling, function calling, agentes, vision, audio ni modo thinking: es un encoder discriminativo de NER, no un modelo generativo.
- Capacidad multilingue limitada al frances; no se declaran otros idiomas.

## Casos de uso

- Digitalizacion de floras historicas: procesar texto OCR de obras como la *Flore de la Nouvelle-Calédonie* y extraer automaticamente las menciones de especies para construir indices taxonomicos navegables.
- Curacion de bases de datos de biodiversidad: enriquecer registros existentes con especies citadas en descripciones textuales, usando el pipeline de token-classification con agregacion de entidades.
- Busqueda semantica en corpus botanicos: indexar documentos por especie mencionada, permitiendo consultas del tipo "documentos que citan *Allamanda cathartica*" sobre texto no estructurado.
- Alimentacion de pipelines de NLP botanico: servir como primer eslabon de extraccion de entidades antes de tareas posteriores (resolucion de nombres, vinculacion a taxonomias como GBIF o Tropicos).
- Anotacion asistida para investigadores: pre-etiquetar corpus nuevos en frances para reducir el esfuerzo de anotacion manual, con revision humana posterior.
- Monitorizacion de literatura cientifica: detectar menciones de especies en publicaciones francesas de botanica para alertas de nuevos registros o estudios.
- Extraccion a bajo coste en produccion: al ser un encoder de 110M con inferencia en milisegundos por ventana en GPU consumer, permite procesar grandes volumenes de texto sin infraestructura dedicada.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente) sobre el split de test de FloraNER (species), evaluacion de entidades con seqeval y matching BIO estricto:

| Metrica | Valor |
|---|---|
| F1 de entidad (seqeval) | 98,31 |
| Precision | 98,01 |
| Recall | 98,60 |
| Support (especies) | 500 |

Desglose por tipo de entidad:

| Tipo | Precision | Recall | F1 | Support |
|---|---|---|---|---|
| species | 98,0 | 98,6 | 98,3 | 500 |

Nota: las cifras de los papers originales (modelos de referencia spaCy en el articulo de datos; pipeline CamemBERT en NLPI 2024 con F1 0,96 para especies y 0,94 para terminos finos) se reportan en dichas publicaciones y no se replican aqui.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-1 GB en fp32/bf16 para los 110M parametros, mas overhead de activaciones minimo en inferencia.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor reporta entrenamiento en una RTX 4000 Ada de portatil, lo que implica que la inferencia es trivial en RTX 3060, RTX 4060, RTX 4090, A100 o H100.
- Cabe holgadamente en GPU consumer e incluso en CPU para volumenes moderados.
- Opciones de despliegue: pipeline `token-classification` de `transformers`, endpoints compatibles de Hugging Face, y exportacion a ONNX para servir con ONNX Runtime; no se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI (son frameworks orientados a modelos generativos).
- Latencia y throughput: no se publican cifras de latencia ni throughput; por el tamano del modelo y la ventana de 256 tokens, se espera latencia de pocos milisegundos por ventana en GPU moderna, aunque no hay dato oficial.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FloraNER-camembert-species | 110M | 256 tokens/ventana | NER de especies (fr) | MIT | Hugging Face |
| camembert-base (base sin fine-tuning) | 110M | 512 tokens | MLM generico (fr) | MIT | Hugging Face |
| Modelos spaCy de referencia del articulo FloraNER | no disponible | no disponible | NER botanico (fr) | no disponible | no disponible en la informacion |

No se dispone de datos de rendimiento de los modelos spaCy de referencia en la informacion proporcionada; el articulo NLPI 2024 reporta F1 0,96 para especies con el pipeline CamemBERT, frente al 98,3 declarado por este modelo sobre el split publicado, aunque las condiciones de evaluacion pueden diferir.

## Limitaciones y advertencias

- La anotacion del dataset es por supervision distante (basada en lexico), por lo que las etiquetas gold omiten algunas entidades y el modelo hereda ese techo de recall; las metricas se miden contra esas mismas etiquetas distantes.
- El corpus de origen es una unica flora regional (Nouvelle-Calédonie), por lo que vocabulario de otras floras puede quedar parcialmente sin cubrir.
- Los tipos de descriptor con pocos ejemplos (posicion, disposicion, desarrollo) son menos fiables; este modelo concreto solo predice la clase `ESPECE`, no descriptores finos.
- Riesgo de alucinacion en sentido generativo no aplica (modelo discriminativo), pero puede producir falsos positivos en cadenas que se parezcan a binomios latinos sin serlo.
- Capacidad multilingue limitada al frances; no se declaran otros idiomas.
- Licencia MIT permite uso comercial, pero conviene revisar las condiciones del dataset FloraNER y de `camembert-base` para atribuciones.
- Las metricas declaradas no estan verificadas de forma independiente (`verified: false` en model-index).
- Modelo con 0 descargas y 0 likes en el momento de la ficha: ecosistema de validacion externa practicamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nainiayoub/FloraNER-camembert-species
- Dataset FloraNER: https://huggingface.co/datasets/nainiayoub/FloraNER
- Demo en vivo: https://huggingface.co/spaces/nainiayoub/floraner
- Articulo de datos (Data in Brief 56, 2024, 110824): https://doi.org/10.1016/j.dib.2024.110824
- Zenodo del dataset: https://doi.org/10.5281/zenodo.12765869
- Paper NLPI 2024 (HAL): https://hal.science/hal-04536866
- Modelo base: https://huggingface.co/almanach/camembert-base
