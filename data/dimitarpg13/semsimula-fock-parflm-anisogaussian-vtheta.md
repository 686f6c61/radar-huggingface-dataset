# dimitarpg13/semsimula-fock-parflm-anisogaussian-vtheta

## Resumen

El modelo `semsimula-fock-parflm-anisogaussian-vtheta` es una variante de la familia Fock-PARFLM v2.1, desarrollada por dimitarpg13 dentro del marco Semantic Simulation (SPLM). Se trata de un modelo de lenguaje conservador que sustituye por completo la arquitectura transformer por un sistema basado en mecánica lagrangiana: los tokens evolucionan en un espacio de Fock bajo la influencia de un potencial escalar `V_theta` que gobierna su dinámica. Esta variante concreta emplea un potencial acotado formado por una mezcla de pozos gaussianos anisotrópicos (matriz de precisión diagonal más corrección de bajo rango rank-4), lo que le permite superar por primera vez a las variantes no acotadas de su propia familia en perplexidad.

Con 26,6 millones de parámetros y una ventana de contexto no especificada, el modelo fue entrenado exclusivamente sobre el dataset TinyStories (historias cortas en inglés para niños) durante 20.000 pasos. Su relevancia radica en que demuestra que una arquitectura sin atención, con memoria constante en inferencia y potencial interpretable, puede alcanzar resultados competitivos a pequeña escala. La perplexidad de validación declarada es 9,04, la mejor publicada hasta la fecha para la familia Fock-PARFLM en TinyStories, superando a las variantes MLP (9,70) y SQ3 (10,90).

El modelo se distribuye bajo licencia CC-BY-4.0 y está pensado principalmente para investigación en arquitecturas alternativas a los transformers, modelos basados en energía y sistemas con inferencia de memoria constante. No está diseñado para tareas de producción generalistas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fock-PARFLM v2.1 (no transformer, sin atencion, basado en potencial escalar y registros Fock) |
| Parametros totales | 26,6 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles |
| Licencia | cc-by-4.0 |
| Formato de pesos | no disponible (repositorio de 0,3 GB, probablemente pytorch/safetensors) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia SPLM (Semantic Simulation) y emplea la arquitectura Fock-PARFLM v2.1: un sistema sin atencion en el que los tokens se representan como particulas en un espacio de Fock con 16 registros virtuales (disciplina de pila LIFO y canal inverso opcional). La dimension oculta es 256, con 8 capas y 4 canales de contexto xi. El potencial escalar `V_theta` es una mezcla acotada de pozos gaussianos (32 centros atractores) con matriz de precision diagonal mas una correccion de bajo rango rank-4, lo que da a cada pozo una forma elipsoidal no alineada con los ejes. Ademas, se anade un regularizador auxiliar de barrera logaritmica sobre los acoplamientos entre canales xi.

El entrenamiento se realizo sobre el dataset TinyStories (roneneldan/TinyStories) durante 20.000 pasos. A diferencia de otras variantes de la familia, este checkpoint se entreno desde el paso 0 con `prefix_causal_registers=True`, por lo que no requirio re-entrenamiento para corregir fugas causales. Las sondas de perturbacion futura bit-exacta y las comprobaciones de perplexidad honesta vs estandar pasan limpiamente durante todo el entrenamiento, segun declara el autor.

## Capacidades

- Generacion de texto en ingles, limitada al dominio de historias cortas infantiles (TinyStories).
- Inferencia con memoria constante en el numero de tokens (independiente de la longitud de contexto), gracias a la ausencia de atencion.
- Potencial escalar interpretable: 32 centros atractores explicitos con especializacion por capa mediante un desplazamiento de codigo de profundidad aprendido.
- Arquitectura no transformer y sin atencion, con gradientes analiticos del potencial.
- Soporte de registros Fock con disciplina de pila LIFO y canal inverso opcional (aunque en este checkpoint el canal inverso no se usa para evitar fugas causales).
- Sin soporte de tool calling, funciones, agentes, vision ni audio (modelo exclusivamente textual).

## Casos de uso

- Investigacion en arquitecturas sin atencion: el modelo sirve como banco de pruebas para estudiar alternativas a los transformers con memoria constante en inferencia, especialmente en regimenes de contexto largo.
- Estudio de modelos basados en energia y mecanica lagrangiana: permite analizar como un potencial escalar acotado puede modelar la distribucion de tokens, y comparar el comportamiento de pozos gaussianos isotropos frente a anisotropos.
- Experimentacion con regularizacion fisica: el regularizador Fock-coupling log-barrier abre una linea de investigacion sobre tecnicas de control de conservatividad en modelos de lenguaje.
- Generacion de historias cortas para entornos educativos: dado su entrenamiento en TinyStories, puede producir narraciones sencillas en ingles para ninos, aunque con calidad limitada.
- Evaluacion de interpretabilidad: los 32 centros atractores explicitos y la forma analitica del potencial permiten inspeccionar que regiones del espacio latente atraen a cada tipo de token, util para estudios de analisis de representaciones.
- Comparacion de arquitecturas conservadoras vs no conservadoras: al ser una variante acotada que supera a las no acotadas de su familia, es un punto de referencia para medir el impacto de la acotacion del potencial en la calidad generativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato declarado por el autor (no verificado) es la perplexidad de validacion sobre TinyStories, que se presenta a continuacion junto con las variantes comparables de la misma familia:

| Modelo | Perplexidad (TinyStories validation) | Parametros |
|---|---|---|
| semsimula-fock-parflm-anisogaussian-vtheta (este) | 9,04 | 26,6M |
| semsimula-fock-parflm-depthcond-vtheta (isotropico) | 16,33 | 18,2M |
| semsimula-fock-parflm-structured-vtheta (SQ3) | 10,90 | 18,2M |
| semsimula-fock-parflm (MLP) | 9,70 | 17,4M |

Nota: el valor de 9,04 esta marcado como `verified: false` en la model card. Los demas valores provienen de la tabla comparativa publicada por el autor.

## Requisitos de hardware

- El modelo tiene 26,6 millones de parametros. En FP32 ocupa aproximadamente 106 MB; en FP16 unos 53 MB. El repositorio pesa 0,3 GB.
- Cabe en cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) y tambien en CPU para inferencia, dado su tamano reducido.
- No se han publicado requisitos especificos de VRAM ni latencia/throughput medidos.
- Opciones de despliegue: al ser un modelo PyTorch sin formato GGUF ni cuantizaciones publicadas, la inferencia se puede realizar con el propio codigo de PyTorch o con librerias que carguen safetensors, si estan disponibles. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- La ausencia de atencion implica un coste de memoria constante por token, lo que lo hace especialmente ligero en inferencia de contexto largo, aunque no se aportan mediciones concretas.

## Comparativa con modelos similares

La comparativa mas directa es con las otras variantes de la familia Fock-PARFLM v2.1, ya que comparten scaffold y dataset:

| Modelo | Potencial | Perplexidad | Parametros | Acotado | Fuga causal |
|---|---|---|---|---|---|
| anisogaussian-vtheta (este) | Gaussiano anisotropo (rank-4) | 9,04 | 26,6M | Si | No (nativo) |
| depthcond-vtheta (isotropico) | Gaussiano isotropo (diagonal) | 16,33 | 18,2M | Si | No (nativo) |
| structured-vtheta (SQ3) | Mezcla de 8 pozos cuadraticos | 10,90 | 18,2M | No | Re-entrenado (+0,54 PPL) |
| fock-parflm (MLP) | MLP (caja negra) | 9,70 | 17,4M | No | Re-entrenado (+0,40 PPL) |

Fuera de esta familia, no se dispone de datos comparables con modelos como GPT-2 o TinyStories-1M en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo entrenado exclusivamente en TinyStories: su dominio se limita a historias cortas infantiles en ingles. No es util para tareas generales de lenguaje, codigo, razonamiento o matematicas.
- Solo soporta ingles; no hay capacidades multilingues.
- La perplexidad declarada (9,04) no esta verificada de forma independiente y proviene del autor. Ademas, el propio autor senala que otras variantes de la familia tuvieron fugas causales que requirieron re-entrenamiento; este checkpoint afirma estar libre de ellas, pero no hay evidencia externa.
- Riesgo de alucinacion y sesgos: al estar entrenado sobre un corpus limitado y sintetico, puede producir contenido incoherente o repetitivo fuera del dominio de historias infantiles.
- No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, etc.), por lo que no es posible evaluar su rendimiento general.
- Licencia CC-BY-4.0 permite uso comercial con atribucion, pero no se ofrecen garantias de calidad ni soporte.
- El formato de pesos y las opciones de cuantizacion no estan documentados, lo que limita su despliegue en entornos de produccion estandar.
- Arquitectura no estandar: integrarlo en pipelines existentes (vLLM, TGI, etc.) requeriria desarrollo adicional, ya que no es un transformer clasico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dimitarpg13/semsimula-fock-parflm-anisogaussian-vtheta
- Variante isotropica (hermana): https://huggingface.co/dimitarpg13/semsimula-fock-parflm-depthcond-vtheta
- Variante SQ3 (hermana): https://huggingface.co/dimitarpg13/semsimula-fock-parflm-structured-vtheta
- Variante MLP (baseline): https://huggingface.co/dimitarpg13/semsimula-fock-parflm
- Repositorio del paper Semantic Simulation: https://github.com/dimitarpg13/semsimula-paper
- Notas del barrido gamma a mayor escala: https://github.com/dimitarpg13/semsimula-paper/blob/main/companion_notes/Fock-PARFLM_Scale-Up_Gamma_Sweep_Results_and_Damping_Regime_Analysis.md
