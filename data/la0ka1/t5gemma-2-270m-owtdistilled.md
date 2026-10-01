# la0ka1/T5Gemma-2-270M-OWTdistilled

## Resumen

T5Gemma-2-270M-OWTdistilled es un encoder de texto para modelos de difusion de lenguaje continuos, destilado por la0ka1 a partir del encoder de google/t5gemma-2-270m-270m. No es un modelo generativo autonomo: su funcion es producir representaciones (una por token, de 640 dimensiones) que sirvan de espacio latente sobre el que un modelo de difusion de texto pueda generar y decodificar palabras. Es el modelo "estudiante" del trabajo *Scaling and Distilling Text Embeddings for Better Diffusibility*.

El problema que aborda es concreto: el encoder original de T5Gemma-2 ofrece un espacio de embeddings solido, pero mantiene alejadas las palabras plausibles para una misma posicion, de modo que un embedding generado por difusion suele caer en una zona intermedia que no decodifica a ningun token valido. La destilacion busca distribuciones de siguiente palabra (soft labels) del decoder congelado del profesor, lo que acerca entre si esas palabras plausibles y mejora la generacion con difusion.

El modelo conserva 9 de las 18 capas del encoder de T5Gemma-2 (indices 0, 2, 4, 6, 8, 11, 13, 15 y 17) con la tabla de embeddings de tokens congelada, sumando 218M parametros. Fue destilado sobre OpenWebText en secuencias de 1024 tokens, durante 50.000 pasos con batch de 256. Se publica como release de investigacion (0 descargas, 1 like en el momento de redactar esta ficha) y con la licencia Gemma Terms of Use.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (encoder T5Gemma-2 truncado, 9 de 18 capas), derivado de Gemma 3 adaptado con UL2; sin decoder propio |
| Parametros totales | 218M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como contexto de inferencia; entrenado con secuencias de 1024 tokens. El modelo base T5Gemma 2 declara ventana de 128k tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | gemma (Gemma Terms of Use); el codigo asociado se publica bajo MIT |
| Formato de pesos | PyTorch, state dict en `T5Gemma-2-270M-OWTdistilled.pt` (incluye `student_sd`, indices de capas `keep`, id del profesor, paso de entrenamiento y objetivo) |
| Dimension del embedding de salida | 640 por token |
| Tokenizer | T5Gemma-2, incluido sin modificar |

## Arquitectura y entrenamiento

T5Gemma 2 es una familia de modelos encoder-decoder derivada de Gemma 3 mediante adaptacion de modelo con objetivo UL2, con embeddings de palabra atados entre encoder y decoder y atencion propia y cruzada fusionada para reducir parametros. La familia se ofrece en configuraciones 270M-270M, 1B-1B y 4B-4B. Este release no usa el modelo completo: toma el encoder de la variante 270M-270M, descarta la mitad de las capas (conserva las indices 0, 2, 4, 6, 8, 11, 13, 15 y 17), mantiene congelada la tabla de embeddings de tokens y produce un vector de 640 dimensiones por token.

El entrenamiento es una destilacion sobre OpenWebText con secuencias de 1024 tokens, batch de 256 y 50.000 pasos. El decoder de T5Gemma-2 permanece congelado y actua como profesor: el estudiante se optimiza para que ese decoder prediga las mismas distribuciones de siguiente palabra a partir de sus embeddings que a partir de los del profesor. Esas etiquetas suaves actuan como regularizacion que agrupa las palabras plausibles en el espacio latente, lo que mejora la "diffusibility" (la facilidad con que un modelo de difusion genera sobre ese espacio) a costa de perder capacidad discriminativa. No se menciona RLHF ni DPO en la informacion disponible.

## Capacidades

- Codificacion de texto a embeddings continuos: genera una representacion de 640 dimensiones por token, pensada como espacio latente para modelos de difusion de lenguaje continuos.
- Condicionamiento de modelos de difusion de texto: sirve como encoder para los modelos ELF entrenados por los mismos autores (ELF-B-T5Gemma2distilled y ELF-M-T5Gemma2distilled).
- Mejora de la generacion por difusion: segun los autores, un mismo modelo de difusion genera mejor sobre los embeddings del estudiante que sobre los del profesor.
- Procesamiento de secuencias de hasta 1024 tokens en el regimen de entrenamiento.
- Idioma: unicamente ingles; solo ha visto OpenWebText durante la destilacion.
- No soporta generacion de texto propia, tool calling ni function calling.
- No esta disenado para agentes ni razonamiento multi-paso.
- No esta pensado para recuperacion (retrieval) ni clasificacion: sus embeddings son menos discriminativos que los del profesor.

## Casos de uso

- Investigacion en modelos de difusion de lenguaje continuos: usar el encoder como espacio de embeddings de partida para entrenar un modelo de difusion (por ejemplo, la receta de `train.py` del repositorio, que entrena un ELF sobre estos embeddings por defecto).
- Reproduccion y ablaciones del trabajo *Scaling and Distilling Text Embeddings for Better Diffusibility*: comparar la generacion sobre embeddings del estudiante (Gen. PPL 17.8) frente a los del profesor (19.3) bajo las mismas condiciones experimentales.
- Reduccion de coste computacional frente al encoder original: al conservar solo 9 de las 18 capas y 218M parametros, permite iterar experimentos de difusion de texto con menor huella de memoria que el encoder completo del profesor.
- Generacion de texto no autoregresiva en prototipos de investigacion: alimentar un modelo ELF con los embeddings del encoder para producir texto sin decodificacion token a token.
- Estudio del impacto de la destilacion por etiquetas suaves en la geometria del espacio de embeddings, midiendo la separacion entre palabras plausibles.
- Preprocesado de corpus en ingles similares a OpenWebText para obtener representaciones latentes de documentos completos a nivel de token (hasta 1024 tokens por secuencia).
- Base para experimentos de destilacion posteriores: el checkpoint incluye los indices de capas conservadas (`keep`) y el objetivo de entrenamiento, lo que facilita reanudar o variar la receta.

## Benchmarks y rendimiento

| Benchmark | Este modelo (estudiante) | T5Gemma-2-270M (profesor) |
|---|---|---|
| Gen. PPL con ELF-M en OpenWebText (a la entropia del texto real) | 17.8 | 19.3 |
| SST-2, linear probe (accuracy) | 78.1 | 89.4 |

Datos aportados por los autores en la model card. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 0,9 GB para 218M parametros; en fp16/bf16, aproximadamente 0,44 GB, mas el coste de activaciones. El repositorio ocupa 0,9 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 cubren el modelo con amplio margen.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU de consumo moderna, e incluso es viable en CPU.
- Opciones de despliegue: uso nativo con PyTorch a traves de la clase `Encoder` del repositorio del paper (`from encoders import Encoder`). La construccion del encoder requiere la arquitectura del modelo base con acceso restringido `google/t5gemma-2-270m-270m`: hay que aceptar sus terminos y ejecutar `hf auth login` una vez. No se indica soporte para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| T5Gemma-2-270M-OWTdistilled | 218M (encoder truncado) | 1024 tokens en entrenamiento | Gen. PPL 17.8; SST-2 78.1 | Gemma Terms of Use | HuggingFace (la0ka1) |
| google/t5gemma-2-270m-270m (profesor) | configuracion 270M-270M | 128k tokens (familia T5Gemma 2) | Gen. PPL 19.3; SST-2 89.4 | Gemma Terms of Use | HuggingFace (google), acceso con aceptacion de terminos |
| T5Gemma-2 1B-1B | configuracion 1B-1B | 128k tokens (familia T5Gemma 2) | no disponible | Gemma Terms of Use | HuggingFace (google) |
| Otros encoders para difusion de texto | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo esta entrenado para generacion con difusion, no para retrieval ni clasificacion; sus embeddings son menos discriminativos que los del profesor (SST-2: 78.1 frente a 89.4).
- Solo ha visto OpenWebText durante la destilacion, por lo que su dominio y su idioma quedan restringidos al ingles y a texto de estilo web.
- Al ser un encoder y no un modelo generativo, no puede producir texto por si mismo: requiere un modelo de difusion (ELF) entrenado sobre sus embeddings.
- Riesgo de alucinacion: no aplica en el sentido habitual, ya que no genera texto; el riesgo se traslada al modelo de difusion que consuma sus embeddings.
- Sesgos: no disponibles de forma explicita; hereda los de T5Gemma-2 (entrenado sobre datos web) y los de OpenWebText.
- Longitud de contexto: no se documenta una ventana de inferencia oficial; el entrenamiento uso secuencias de 1024 tokens, por lo que no hay garantia de comportamiento fuera de ese rango.
- Licencia: es una version modificada del encoder de T5Gemma-2 y se considera Model Derivative bajo los Gemma Terms of Use, incluida la Gemma Prohibited Use Policy. El uso comercial queda sujeto a esos terminos, no a una licencia permisiva.
- Es un release de investigacion de los autores del paper; no es un producto de Google ni cuenta con su respaldo.
- Requiere acceso al modelo base con control de acceso (`google/t5gemma-2-270m-270m`) para reconstruir la arquitectura, lo que anade una dependencia externa al despliegue.
- Publicacion reciente y con muy poca adopcion (0 descargas, 1 like en el momento de redactar), sin validacion independiente conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/la0ka1/T5Gemma-2-270M-OWTdistilled
- Modelo base: https://huggingface.co/google/t5gemma-2-270m-270m
- Codigo del paper: https://github.com/la0ka1/diffusing-scaled-text-embeddings
- Pagina del proyecto: https://la0ka1.github.io/diffusing-scaled-text-embeddings/
- Coleccion completa del release: https://huggingface.co/collections/la0ka1/diffusing-scaled-text-embeddings-6abd7ff3c91fd70bd749c197
- Modelo de difusion ELF-B entrenado sobre estos embeddings: https://huggingface.co/la0ka1/ELF-B-T5Gemma2distilled
- Modelo de difusion ELF-M entrenado sobre estos embeddings: https://huggingface.co/la0ka1/ELF-M-T5Gemma2distilled
- Paper: *Scaling and Distilling Text Embeddings for Better Diffusibility* (Zhang, Tian, He, Zhang, Zhao, Qu y Fu, 2026); enlace de arXiv aun no publicado
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Politica de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
- Documentacion de T5Gemma 2 en Transformers: https://huggingface.co/docs/transformers/en/model_doc/t5gemma2
- Pagina de T5Gemma en Google DeepMind: https://deepmind.google/models/gemma/t5gemma/
