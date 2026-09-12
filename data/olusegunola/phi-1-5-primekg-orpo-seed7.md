# olusegunola/phi-1.5-primekg-orpo-seed7

## Resumen

`olusegunola/phi-1.5-primekg-orpo-seed7` es un modelo publicado en HuggingFace por el usuario olusegunola. Por el identificador se deduce que se trata de un ajuste fino de la familia Phi-1.5 (aproximadamente 1.300 millones de parametros) entrenado con la tecnica ORPO (Odds Ratio Preference Optimization) sobre datos derivados de PrimeKG, un grafo de conocimiento biomedico, con la semilla 7. Ninguna de estas inferencias esta confirmada por el autor: la model card es la plantilla automatica de HuggingFace, sin ninguna seccion rellenada.

El modelo resuelve, en principio, el problema de adaptar un modelo pequeno de proposito general al dominio biomedico mediante alineacion por preferencias directa (ORPO combina el ajuste supervisado y la optimizacion por preferencias en una sola etapa, sin necesidad de un modelo de recompensa separado). Es relevante para quienes buscan un modelo ligero y desplegable en hardware modesto para tareas de texto cientifico o biomedico, aunque la ausencia total de documentacion, de resultados de evaluacion y de licencia explicita limita seriamente su uso en produccion.

La relevancia practica del artefacto es hoy muy baja: cero descargas, cero "likes", repositorio de 0,1 GB, sin pipeline declarado y con una model card sin contenido. Ademas, el tamano del repositorio es inconsistente con los pesos en precision completa de un modelo de 1,3B parametros (que ocuparian en torno a 2,6 GB en fp16), lo que sugiere cuantizacion, pesos parciales, adaptadores o simplemente una carga incompleta. Esta ficha documenta, por tanto, mas lo que no se sabe que lo que se sabe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la model card; por el identificador se presume transformer decoder de la familia Phi-1.5 (no confirmado) |
| Parametros totales | no disponible; el repositorio ocupa 0,1 GB, cifra incompatible con los pesos fp16 de un modelo de 1,3B (aprox. 2,6 GB) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo incluye pesos en formato safetensors, sin variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no la declara; la licencia del modelo base tampoco se especifica para este derivado) |
| Formato de pesos | safetensors (deducido de las etiquetas y de la libreria transformers; el autor no lo detalla) |

## Arquitectura y entrenamiento

No hay informacion aportada por el autor sobre la arquitectura. La model card generada automaticamente deja todas las secciones relevantes ("Model Architecture and Objective", "Training Data", "Training Procedure", "Training Hyperparameters") con el marcador `[More Information Needed]`. El identificador del repositorio sugiere dos elementos: el prefijo `phi-1.5` apunta a un ajuste sobre el modelo Phi-1.5 de Microsoft Research, un transformer decoder denso de aproximadamente 1.300 millones de parametros entrenado sobre datos de tipo "textbook quality"; y el sufijo `orpo` apunta a Odds Ratio Preference Optimization, un metodo de alineacion que fusiona el ajuste supervisado y la optimizacion por preferencias en un unico entrenamiento, sin modelo de recompensa ni etapa RLHF separada.

El termino `primekg` del nombre hace referencia a PrimeKG, un grafo de conocimiento biomedico que integra decenas de miles de relaciones entre enfermedades, genes, proteinas, farmacos y fenotipos. Lo mas probable es que el autor haya construido pares de preferencia o instrucciones a partir de ese grafo para especializar el modelo en dominio biomedico. El sufijo `seed7` indica que se trata de una ejecucion concreta de una semilla aleatoria, lo que sugiere una familia de experimentos con varias semillas. Nada de esto esta documentado: no se especifican tokens de entrenamiento, composicion del dataset, hiperparametros, precision (fp16, bf16, fp8) ni infraestructura de computo. La unica referencia tecnica enlazada en las etiquetas del repositorio (`arxiv:1910.09700`) corresponde a Lacoste et al., "Quantifying the Carbon Emissions of Machine Learning", la calculadora de impacto ambiental citada en la plantilla de HuggingFace, no a un articulo sobre el modelo.

## Capacidades

No se ha publicado ninguna descripcion de capacidades. A partir de la informacion disponible solo puede afirmarse lo siguiente, con el correspondiente grado de incertidumbre:

- Generacion de texto en dominio general y, previsiblemente, en dominio biomedico, dado el ajuste sobre PrimeKG (no verificado).
- Razonamiento basico y respuesta a instrucciones, si el ajuste ORPO se aplico sobre pares instruccion-respuesta (no verificado).
- Soporte de tool calling / function calling: no disponible; no hay tokenizador de herramientas declarado ni plantilla de chat documentada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el autor no declara idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles. El modelo base Phi-1.5 es exclusivamente de texto y no dispone de torre de vision ni de audio.
- Ausencia de pipeline declarado en HuggingFace (`text-generation`, `text-classification`, etc.), lo que impide confirmar siquiera la tarea objetivo.

## Casos de uso

Los siguientes escenarios son hipoteticos y estan condicionados a la verificacion previa del modelo. No deben considerarse recomendaciones de uso en produccion sin una evaluacion propia:

- Extraccion de relaciones biomedicas: dado el supuesto ajuste sobre PrimeKG, el modelo podria emplearse para transformar texto cientifico en tripletas (enfermedad, gen, asociacion) que alimenten una base de conocimiento. Requiere validar antes que el ajuste no ha degradado la fluidez general.
- Clasificacion de literatura clinica: uso como clasificador de resumenes o titulos de PubMed por area tematica, aprovechando el ajuste de dominio. Necesita fine-tuning adicional con cabecera de clasificacion.
- Prototipado en hardware de consumo: con un supuesto tamano de 1,3B parametros, cabria en una GPU de 8-12 GB en cuantizacion de 4 bits, lo que lo hace apto para experimentacion local en portatiles con GPU discreta.
- Generacion de resumenes de articulos cientificos: si el ajuste ORPO conserva la capacidad generativa, podria resumir abstracts y secciones de metodos en un unico parrafo.
- Asistente de preguntas y respuestas sobre farmacologia: respuestas a consultas del tipo "que interacciones se han descrito entre el farmaco X y la proteina Y", restringidas a un corpus documental controlado y con verificacion humana obligatoria.
- Evaluacion comparativa de tecnicas de alineacion: el repositorio es util como artefacto de investigacion para comparar ORPO frente a DPO o RLHF en modelos pequenos y en dominio especializado, especialmente al existir variantes con otras semillas (`seed1`, `seed2`, etc., si el autor las publico).
- Destilacion de conocimiento hacia modelos aun mas pequenos: al ser un modelo compacto, puede actuar como profesor en un proceso de destilacion para despliegue en el borde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la seccion "Evaluation" con el marcador `[More Information Needed]` en "Testing Data", "Factors", "Metrics" y "Results". No se dispone por tanto de cifras de MMLU, HumanEval, GSM8K, PubMedQA, MedQA ni de ninguna otra prueba, ni de comparaciones con modelos similares.

## Requisitos de hardware

Todas las cifras siguientes son estimaciones basadas en la hipotesis de que el modelo tiene aproximadamente 1.300 millones de parametros, tal como sugiere el prefijo `phi-1.5`. No estan confirmadas por el autor, y de hecho el tamano del repositorio (0,1 GB) contradice esa hipotesis:

- VRAM para inferencia en fp16: en torno a 2,6-3 GB solo para los pesos, mas 1-2 GB de cache KV y overhead, lo que situa el total entre 4 y 6 GB.
- VRAM en cuantizacion int8: aproximadamente 1,5-2 GB de pesos, 3-4 GB totales.
- VRAM en cuantizacion int4: aproximadamente 0,8-1 GB de pesos, 2-3 GB totales.
- GPU de datacenter: A100, H100 o L40S sobredimensionadas para este tamano, utiles solo para servir muchas replicas concurrentes.
- GPU de consumo: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. En 4 bits podria caber en GPU de 6-8 GB.
- CPU: inferencia viable en llama.cpp u Ollama en cuantizacion de 4 bits, con velocidades del orden de decenas de tokens por segundo en CPU moderna; no verificado para este artefacto concreto.
- Opciones de despliegue: `transformers` es la unica libreria declarada. No hay pesos GGUF, por lo que llama.cpp y Ollama requeririan conversion previa. vLLM, TGI y SGLang serian compatibles si los pesos safetensors estan completos y el tokenizador es el estandar de Phi-1.5, algo que no puede confirmarse.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos de rendimiento de este modelo que permitan una comparacion cuantitativa. La tabla siguiente contrasta unicamente parametros publicos de la familia base y de alternativas del mismo orden de magnitud. Los datos de la fila correspondiente a este modelo son deducciones, no informacion confirmada:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| olusegunola/phi-1.5-primekg-orpo-seed7 | presuntamente ~1,3B (no confirmado) | no disponible | no disponible | HuggingFace, 0 descargas | Model card vacia; sin benchmarks; dominio supuestamente biomedico |
| microsoft/phi-1.5 | 1,3B | 2.048 tokens | MIT (segun publicacion del autor original) | Ampliamente disponible | Modelo base del que derivaria este ajuste; datos de "textbook quality" |
| TinyLlama-1.1B-Chat | 1,1B | 2.048 tokens | Apache 2.0 | Ampliamente disponible | Alternativa generalista con comunidad activa y variantes GGUF |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | Apache 2.0 (segun el autor original) | Ampliamente disponible | Contexto mucho mayor, multilingue, soporte de herramientas |

Advertencia: los datos de las filas de phi-1.5, TinyLlama y Qwen2.5 provienen del conocimiento publico de esos modelos y no de la informacion proporcionada en esta busqueda, por lo que deben verificarse en sus respectivas fichas antes de citarlos.

## Limitaciones y advertencias

- Documentacion inexistente: la model card es la plantilla automatica sin rellenar. No hay informacion sobre datos, hiperparametros, evaluacion ni uso previsto.
- Licencia no declarada: sin licencia explicita no puede asumirse permiso de uso comercial. Ademas, la licencia del modelo base (Phi-1.5 se publico bajo MIT segun su autor original) condiciona la del derivado, pero el autor no la menciona.
- Riesgo alto de alucinacion en dominio biomedico: un ajuste de preferencias sobre un grafo de conocimiento no garantiza fidelidad factual; cualquier salida relativa a farmacos, diagnostico o tratamiento debe verificarse con fuentes primarias. No debe usarse como herramienta clinica.
- Inconsistencia de artefacto: el repositorio ocupa 0,1 GB, muy por debajo de lo esperado para un modelo de 1,3B en fp16. Podria contener pesos cuantizados, adaptadores LoRA o una subida incompleta; conviene inspeccionar los archivos antes de cualquier uso.
- Sesgos desconocidos: no se documenta composicion del dataset ni filtrado, por lo que no puede evaluarse el sesgo demografico, geografico ni linguistico.
- Idiomas no declarados: se desconoce si el ajuste conserva capacidades multilingues o las ha degradado hacia el ingles cientifico.
- Contexto desconocido: sin ventana declarada, no puede planificarse el procesamiento de documentos largos.
- Sin pipeline declarado: no se confirma la tarea objetivo ni la plantilla de prompt, lo que complica la integracion directa en frameworks de agentes.
- Reproducibilidad limitada: el sufijo `seed7` sugiere que forma parte de una serie de ejecuciones, pero no se enlazan las otras semillas ni el script de entrenamiento.
- Fechas incoherentes: los metadatos indican creacion el 11 de septiembre de 2026, fecha posterior a la actual; puede tratarse de un error de marca de tiempo o de un reloj mal configurado en el entorno de subida.
- Ausencia de comunidad: cero descargas y cero "likes" implican que no ha sido validado por terceros; no existe evidencia externa de su funcionamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/olusegunola/phi-1.5-primekg-orpo-seed7
- Articulo citado en las etiquetas del repositorio (calculadora de impacto ambiental, no relacionado con el modelo): https://arxiv.org/abs/1910.09700
- Herramienta de calculo de emisiones citada en la model card: https://mlco2.github.io/impact
- Repositorio, paper, demo o dataset del autor: no disponibles
- Resultados de la busqueda web: no se ha encontrado ningun resultado relevante sobre este modelo. Las busquedas devolvieron exclusivamente paginas sobre la instalacion de impresoras en Windows, sin relacion alguna con el artefacto, por lo que no se incluyen como fuentes.
