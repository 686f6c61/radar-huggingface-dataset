# PiotrSty/gollem-v6-250m-sae-res-v6

# GoLLeM-v6-250M SAE set (residual stream, res_v6)

## Resumen
GoLLeM-v6-250M SAE set (res_v6) es un conjunto de 20 autoencoders dispersos (sparse autoencoders, SAE) entrenados sobre el residual stream posterior a cada bloque de SlayerLab/GoLLeM-v6-250M, un modelo de 250 millones de parametros y 20 capas. Lo publica PiotrSty (Piotr Styla) en Hugging Face bajo licencia CC BY-SA 4.0, con etiquetas de interpretabilidad y los idiomas polaco e ingles. No es un modelo generativo: es una herramienta de interpretabilidad mecanicista que descompone las activaciones internas del modelo base en features dispersas.

Cada SAE proyecta una entrada de 960 dimensiones a 7.680 features (factor de expansion 8x) y activa exactamente k = 50 de ellas por token mediante activacion TopK, con un decodificador que reconstruye la activacion original. Los pesos se distribuyen en safetensors, uno por capa, sin script de carga ni integracion documentada con librerias de interpretabilidad como SAELens o TransformerLens.

Su interes esta en que cubre un modelo pequeno y poco analizado con corpus bilingue polaco-ingles, ejecutable en hardware de consumo. Sus propias metricas (FVU de 0,0593 en la capa 0 a 0,2303 en la capa 18) y un entrenamiento de solo 2.682.880 tokens marcan, sin embargo, un techo de calidad claro que conviene considerar antes de usarlo en investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder disperso (SAE) con activacion TopK sobre el residual stream post-bloque. No es un modelo generativo |
| Parametros totales | 14.754.240 por SAE (estimacion a partir de d_in = 960 y d_sae = 7.680); 295.084.800 en el conjunto de 20 SAEs |
| Parametros activos | No aplica: no es un modelo MoE. Cada SAE activa k = 50 features por token y capa |
| Longitud de contexto | No aplica al SAE (opera sobre activaciones por token); no disponible para el modelo base GoLLeM-v6-250M |
| Tipos de cuantizacion | No disponible (solo safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Polaco (pl) e ingles (en), segun las etiquetas del repositorio y el corpus de entrenamiento |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (20 ficheros, uno por capa, con sha256 publicado en la model card) |
| Dimension de entrada (d_in) | 960 |
| Anchura del diccionario (d_sae) | 7.680 (factor de expansion 8x) |
| Features activas por token (k) | 50 |
| Capas cubiertas | 20 (capas 0 a 19) |
| Tamano del repositorio | 1,8 GB |

## Arquitectura y entrenamiento
El artefacto es una familia de SAEs TopK, no un transformer. Cada uno consta de un encoder que proyecta la activacion de 960 dimensiones a un diccionario de 7.680 features, una seleccion TopK que conserva las k = 50 activaciones mayores y un decodificador que reconstruye la activacion original. El sesgo del decodificador se inicializa con la media del residual (b_dec = mean residual) y el decodificador se renormaliza en cada paso. Se entrena una SAE independiente por capa sobre el residual stream posterior al bloque, de modo que el conjunto permite analizar las 20 capas por separado.

El entrenamiento usa un corpus 50/50 de WikiText y Wikipedia en polaco, con 655 pasos, batch de 8, secuencia de 512 y optimizador Adam con learning rate 0,001, lo que suma 2.682.880 tokens. No se documenta RLHF, DPO ni ninguna fase de ajuste posterior, ni innovaciones como decodificacion especulativa o atencion lineal, que no aplican a una SAE. El volumen de tokens es muy inferior al de otros conjuntos de SAEs publicados, que suelen entrenarse con miles de millones de tokens, y la model card no menciona regularizacion adicional mas alla del propio TopK y de la renormalizacion del decodificador.

## Capacidades
- Descomposicion de las activaciones del residual stream post-bloque en 7.680 features dispersas por capa, con k = 50 activas por token.
- Reconstruccion de la activacion original a partir del vector disperso mediante el decodificador de cada SAE.
- Analisis capa por capa: 20 ficheros independientes que permiten estudiar la evolucion de las representaciones desde la capa 0 hasta la 19.
- Analisis bilingue polaco-ingles, ya que el corpus de entrenamiento combina WikiText con Wikipedia en polaco al 50 %.
- Base para intervenciones sobre activaciones (steering, ablacion, clamping) si se conecta la SAE al modelo base mediante hooks, algo que el repositorio no documenta ni implementa.
- Inspeccion de la salud del diccionario mediante las metricas publicadas de features muertas (dead frac) y FVU por capa.
- No realiza generacion de texto, razonamiento, codigo ni matematicas: el pipeline_tag "text-generation" del repositorio es una etiqueta heredada y no describe el artefacto.
- No soporta tool calling, function calling, agentes, multi-step reasoning, vision, audio ni modo de razonamiento.
- No se documenta ningun uso multilingue fuera de polaco e ingles.

## Casos de uso
- Interpretabilidad mecanicista de modelos pequenos: extraer y etiquetar features del residual stream de un modelo de 250 M con 7.680 features por capa, un escenario realista para estudiar como se codifican conceptos cuando no se dispone de un cluster de GPU.
- Analisis comparativo polaco-ingles: como el corpus es 50/50, permite comprobar si los mismos textos activan conjuntos de features coincidentes en ambos idiomas y en que capas se separan las representaciones.
- Steering y edicion de activaciones: usando la direccion de una feature concreta en el decodificador se puede amplificar o suprimir un concepto durante la inferencia del modelo base para observar el efecto sobre la salida, siempre que se implemente el enganche manual a las activaciones.
- Monitorizacion de latentes en produccion: las SAE se emplean para detectar contenido fuera de distribucion a partir de las features activas; este conjunto permite prototipar ese enfoque en un modelo de 250 M, con la salvedad de que el FVU elevado en capas profundas (0,2303 en la capa 18) limita la fiabilidad del monitor.
- Diagnostico de features muertas: la tabla de dead frac por capa, con un minimo de 0,0250 en la capa 4 y un maximo de 0,1714 en la capa 17, sirve como caso de estudio de como se degrada la utilizacion del diccionario con la profundidad en un presupuesto de entrenamiento bajo.
- Docencia y reproducibilidad: cada SAE ocupa unos 59 MB en fp32 y se ejecuta en CPU o en cualquier GPU de consumo, lo que permite montar practicas de interpretabilidad en portatiles y reproducir exactamente el experimento a partir de los sha256 publicados.
- Estudio de circuitos entre capas: combinando los 20 diccionarios se puede rastrear como se transforma una feature concreta desde la capa 0 hasta la 19 y en que punto la reconstruccion deja de ser fiable.
- Linea base para recetas de SAE: los hiperparametros publicados (expansion 8x, k = 50, 655 pasos, Adam 0,001) sirven como referencia para experimentos de escalado de diccionarios en modelos de menos de 1.000 millones de parametros.

## Benchmarks y rendimiento
El repositorio no incluye resultados de benchmarks de tipo MMLU, HumanEval o GSM8K, porque el artefacto no es un modelo generativo. La unica informacion cuantitativa publicada son las metricas de calidad de reconstruccion de cada SAE: FVU (fraccion de varianza no explicada; menor es mejor) y dead frac (fraccion de features muertas).

| Capa | FVU | Dead frac |
|---|---:|---:|
| 0 | 0,0593 | 0,0624 |
| 1 | 0,0732 | 0,0609 |
| 2 | 0,1146 | 0,0423 |
| 3 | 0,0879 | 0,0286 |
| 4 | 0,0816 | 0,0250 |
| 5 | 0,0939 | 0,0366 |
| 6 | 0,0655 | 0,0406 |
| 7 | 0,0956 | 0,0441 |
| 8 | 0,1210 | 0,0504 |
| 9 | 0,1432 | 0,0443 |
| 10 | 0,1664 | 0,0400 |
| 11 | 0,1783 | 0,0384 |
| 12 | 0,1886 | 0,0574 |
| 13 | 0,1986 | 0,0622 |
| 14 | 0,2078 | 0,0736 |
| 15 | 0,2074 | 0,0991 |
| 16 | 0,2096 | 0,1484 |
| 17 | 0,2162 | 0,1714 |
| 18 | 0,2303 | 0,1490 |
| 19 | 0,2276 | 0,0556 |

El FVU crece de forma monotona con la profundidad (de 0,0593 en la capa 0 a 0,2303 en la capa 18), lo que indica que las capas finales se reconstruyen peor. La proporcion de features muertas se dispara en las capas 16 y 17 (0,1484 y 0,1714) y vuelve a bajar en la capa 19 (0,0556). No se han publicado comparaciones con otras SAEs sobre el mismo modelo base.

## Requisitos de hardware
- VRAM estimada: unos 59 MB por SAE en fp32 y unos 29,5 MB en fp16/bf16; el conjunto completo de 20 capas ocupa aproximadamente 1,2 GB en fp32 o 0,6 GB en fp16/bf16. El repositorio declara 1,8 GB, una cifra superior a esa estimacion, por lo que podria contener tensores adicionales no documentados.
- GPU recomendadas: ninguna en concreto; la carga es despreciable. Cualquier GPU con 2 GB libres es suficiente, e incluso la ejecucion en CPU es viable. La limitacion real es el modelo base GoLLeM-v6-250M, de unos 500 MB en fp16, que tambien cabe en hardware de consumo.
- Cabe en GPU de consumo: si, en cualquier modelo actual (por ejemplo RTX 3060 de 12 GB, RTX 4060, RTX 4090), e incluso en iGPU con memoria compartida.
- Opciones de despliegue: carga manual de safetensors con PyTorch y enganche a las activaciones del modelo base. No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni integracion con SAELens o TransformerLens, que requeriria adaptar el formato.
- Latencia y throughput: no se publican mediciones. Estructuralmente, la SAE anade una multiplicacion de matrices de 960 x 7.680 y una seleccion top-50 por token y capa, un coste marginal frente a la inferencia del modelo base.

## Comparativa con modelos similares
No se dispone de datos numericos de terceros en la informacion proporcionada, por lo que la comparacion es cualitativa. Las alternativas publicas mas cercanas son otros conjuntos de SAEs sobre modelos abiertos.

| Conjunto | Desarrollador | Modelo base | Tipo de SAE y anchura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este conjunto (res_v6) | PiotrSty | GoLLeM-v6-250M (250 M, 20 capas) | TopK, k = 50, 7.680 features (8x), las 20 capas | CC BY-SA 4.0 | Hugging Face |
| Gemma Scope | Google DeepMind | Gemma 2 (2B, 9B y 27B) | JumpReLU, capas y subcapas; anchura no disponible en la informacion | Terminos de uso de Gemma | Hugging Face |
| SAEs sobre GPT-2 small (OpenAI y comunidad) | OpenAI y comunidad | GPT-2 small | TopK o ReLU segun la version; detalles no disponibles en la informacion | No disponible en la informacion | Hugging Face |
| SAEs de EleutherAI sobre Pythia | EleutherAI | Pythia (70 M a 12 B) | Detalles no disponibles en la informacion | No disponible en la informacion | Hugging Face |

Frente a esos conjuntos, la diferencia principal de este repositorio es la escala: 2.682.880 tokens de entrenamiento y un modelo base de 250 M, muy por debajo de los ordenes de magnitud habituales en las suites de SAEs de referencia, que cubren modelos de miles de millones de parametros y corpus multilingues amplios.

## Limitaciones y advertencias
- No es un modelo de generacion de texto. El pipeline_tag "text-generation" del repositorio no describe el artefacto y puede inducir a error si se integra automaticamente en pipelines.
- Calidad de reconstruccion limitada: el FVU alcanza 0,2303 en la capa 18, lo que implica que una fraccion relevante de la varianza de la activacion no queda explicada por las features.
- Features muertas: hasta un 17,14 % del diccionario no se activa nunca en la capa 17, y las capas 16 y 18 superan el 14,8 %.
- Entrenamiento corto: 2.682.880 tokens es un volumen muy bajo para una SAE, lo que sugiere features inestables y dificilmente comparables con las de conjuntos entrenados a mayor escala.
- Sesgo de dominio: el corpus se limita a WikiText y Wikipedia en polaco, un registro enciclopedico que no cubre codigo, dialogo, jerga ni texto tecnico.
- Cobertura linguistica reducida a polaco e ingles; no hay evidencia de comportamiento en otras lenguas.
- Licencia CC BY-SA 4.0: permite uso comercial, pero exige atribucion y compartir las obras derivadas bajo la misma licencia, lo que puede ser incompatible con productos de codigo cerrado. La licencia del modelo base GoLLeM-v6-250M no se detalla y podria anadir condiciones.
- Riesgo de interpretacion erronea: el hecho de que una feature se active ante un texto no demuestra una relacion causal con el comportamiento del modelo; las etiquetas y conclusiones requieren validacion con experimentos de intervencion.
- Ausencia de validacion comunitaria: 0 descargas, 1 like y ningun paper o informe asociado, por lo que no hay revision externa de las metricas.
- Anomalia de metadatos: las fechas de creacion y actualizacion figuran como 2026-10-04, lo que puede indicar un error de fecha en el repositorio.
- Falta de herramientas: no hay script de carga, tokenizador ni utilidades de evaluacion; el usuario debe implementar la integracion con el modelo base.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/PiotrSty/gollem-v6-250m-sae-res-v6
- Perfil del autor en Hugging Face: https://huggingface.co/PiotrSty/models
- Modelo base citado en la model card: https://huggingface.co/SlayerLab/GoLLeM-v6-250M (enlace construido a partir del identificador; no verificado en la informacion proporcionada)
- Resultados de busqueda no relacionados con este modelo (homonimos del nombre "gollem", frameworks de agentes en Go): https://github.com/fugue-labs/gollem y https://github.com/gollem-dev/gollem
- No se han encontrado papers, blogs ni demos asociados a este conjunto de SAEs en la informacion disponible.
