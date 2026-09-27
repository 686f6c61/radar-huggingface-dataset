# enver/rootformer-v13-sovereign-arabic

## Resumen

Rootformer V13 Sovereign es un modelo de traduccion especializado en arabe clasico hacia ingles, desarrollado por AynEngine AI & Computational Philology Research Group (AynEngine Foundation) y publicado en HuggingFace bajo el identificador `enver/rootformer-v13-sovereign-arabic`. Su planteamiento rompe con el enfoque habitual de los modelos multilingues: en lugar de tokenizar arabe mediante BPE, el modelo trata la palabra como una composicion no concatenativa de raiz, patron morfologico (wazn) y afijos, y delega el lexico estatico en una tabla de memoria dispersa en lugar de forzar al transformer a memorizarlo.

Tecnicamente se describe como una arquitectura tripartita: un cuello de botella de engram de inspiracion farahidi (9.016 raices radicales y 128 moldes de flexion en una tabla de consulta multi-cabeza O(1) de 2,8 millones de parametros, con gating consciente del contexto inyectado en el puente interlingue de la capa 12), una gobernanza sintactica de inspiracion sibawayhi que parsea la clausula arabe en un grafo aciclico dirigido de constituyentes, y un motor de composicion de inspiracion yuryani que genera la sintaxis analitica inglesa. El modelo tiene 399.371.824 parametros segun los pesos safetensors (el model card lo describe como un transformer de ~0,5 B).

Su relevancia actual es acotada pero especifica: ataca un nicho poco cubierto por los grandes modelos multilingues, la traduccion de prosa escolar arabe clasica con trazabilidad sintactica explicita, y lo hace con un presupuesto de parametros inferior a 0,5 B. El repositorio no registra descargas ni valoraciones en el momento de redactar esta ficha, por lo que no existe validacion independiente de sus afirmaciones de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con cuello de botella de engram farahidi (tabla de consulta dispersa O(1)), gobernanza sintactica sibawayhi sobre DAG de constituyentes y motor de composicion yuryani; etiqueta declarada `rootformer_v13` |
| Parametros totales | 399.371.824 (~0,4 B) segun safetensors; el model card indica ~0,5 B; la tabla de engram aporta 2,8 M |
| Parametros activos | No aplica: no se describe como MoE. Solo es dispersa la tabla de engram (2,8 M); el transformer es denso |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se documentan GGUF, GPTQ, AWQ ni otras variantes) |
| Idiomas soportados | Arabe (clasico) e ingles (`ar`, `en`) |
| Licencia | Apache-2.0 en los metadatos; el model card menciona "Apache-2.0 / Open Scholastic Heritage License" |
| Formato de pesos | safetensors, con etiqueta `custom_code` (requiere `trust_remote_code=True` o copia del codigo del repositorio) |

## Arquitectura y entrenamiento

La arquitectura combina tres componentes segun la descripcion del autor. El primero es un cuello de botella de engram de inspiracion farahidi que externaliza 9.016 embeddings de raices lexicas estaticas y 128 moldes morfologicos (`awzan`) a una tabla de consulta multi-cabeza de acceso O(1) con 2,8 millones de parametros; el gating consciente del contexto se inyecta en el puente interlingue situado en la capa 12. El segundo es un analizador sintactico de inspiracion sibawayhi que descompone la clausula arabe en un grafo aciclico dirigido de constituyentes (`mubtada'`, `khabar`, `mudaf`/`mudaf ilayh`, `jarr wa majrur`, `ma'tuf`); el autor argumenta que, al ser el grafo aciclico, los bucles generativos infinitos son matematicamente imposibles. El tercero es un motor de composicion de inspiracion yuryani que convierte los casos sinteticos del arabe en sintaxis analitica inglesa.

El model card justifica el diseno por dos fallos atribuidos a los modelos causales pequenos con BPE o autoregresion a nivel de caracter: la destruccion de los invariantes de raiz semitica no concatenativa y la caida en "cuencas atractoras de Markov" (repeticiones del tipo "la superficie de la superficie de la superficie") cuando el presupuesto de parametros es de ~0,5 B. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste por instrucciones. Se menciona un corpus asociado, `enver/classical-arabic-scholastic-bilingual-corpus`, y el diseno se presenta como sintesis con el desacoplamiento de engram de DeepSeek-V4.1-Flash.

## Capacidades

- Traduccion de arabe clasico a ingles en registro escolar y filosofico, con salida en sintaxis analitica inglesa.
- Analisis morfologico explicito: identificacion de raiz radical y patron de flexion a partir de un inventario declarado de 9.016 raices y 128 `awzan`.
- Analisis sintactico de constituyentes: generacion de un DAG con etiquetas funcionales (`mubtada'`, `khabar`, `mudaf`, `jarr wa majrur`, `ma'tuf`).
- Mitigacion de repeticiones degenerativas mediante la restriccion de aciclicidad del grafo de constituyentes (afirmacion del autor, no verificada de forma independiente).
- Cobertura tematica declarada: logica, epistemologia, literatura sapiencial, etica, retorica, fisica, filosofia islamica y traduccion escolar.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta comportamiento agentico ni razonamiento multi-paso.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (`thinking mode`).
- Idiomas: unicamente arabe e ingles; no hay soporte multilingue fuera de ese par.

## Casos de uso

- Traduccion de tratados escolares arabes: el modelo convierte pasajes de logica, fisica o retorica clasica a ingles generando ademas el arbol de constituyentes, lo que permite revisar la decision sintactica en lugar de aceptar la salida como caja negra.
- Anotacion morfologica para corpus historicos: la tabla de engram y los `awzan` pueden emplearse para etiquetar raiz y patron en corpus de arabe clasico, alimentando pipelines de linguistica computacional.
- Ensenanza de gramatica arabe asistida: el DAG de constituyentes sirve como material didactico para mostrar la funcion de `mubtada'`, `khabar` o `jarr wa majrur` en una frase concreta.
- Digitalizacion de fondos bibliotecarios: traduccion asistida de manuscritos impresos en arabe clasico con bajo coste de inferencia, dado el tamano de 0,4 B de parametros.
- Preservacion y busqueda semantica: generacion de traducciones alineadas con la estructura sintactica original, utiles para indexar un corpus bilingue y permitir busquedas por construccion gramatical.
- Investigacion en arquitecturas no concatenativas: el modelo sirve como banco de pruebas reproducible para comparar tokenizacion BPE frente a representacion basada en raiz en lenguas semiticas.
- Preprocesado linguistico en proyectos de humanidades digitales: extraccion de pares (clausula arabe, traduccion, arbol sintactico) para construir conjuntos de evaluacion especificos de arabe clasico.

## Benchmarks y rendimiento

El model card describe una evaluacion propia sobre 23 proposiciones clasicas repartidas en ocho disciplinas escolares. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, BLEU de WMT ni similares) en la informacion disponible, y la tabla siguiente recoge solo los ejemplos reproducidos en el fragmento accesible del model card. Son ejemplos cualitativos de traduccion, no metricas agregadas.

| # | Disciplina | Entrada (arabe clasico) | Traduccion declarada | DAG de constituyentes |
|---|---|---|---|---|
| 1 | Logica (Euclides) | `الكل أعظم من الجزء` | The whole is greater than the part. | `[Mubtada + Ism Tafdil + Prep Comp + Majrur]` |
| 2 | Epistemologia | `الشك طريق إلى اليقين` | Doubt is a path to certainty. | `[Mubtada + Khabar + Jarr wa Majrur]` |
| 3 | Literatura sapiencial | `رأس الحكمة مخافة الله` | The head of wisdom is the fear of God. | `[Mubtada Mudaf + Khabar Mudaf]` |
| 4 | Etica y prudencia | `خير الأمور أوسطها` | The best of affairs is its middle course. | `[Mubtada Mudaf + Khabar + Suffix Pron]` |
| 5 | Retorica (Yahiz) | `اللفظ جسد والمعنى روح` | The utterance is a body, and meaning is a soul. | `[Clause 1 + Harf 'Atf + Clause 2]` |
| 6 | Fisica (Aristoteles) | `الحركة انتقال من القوة إلى الفعل` | Motion is a transition from potency to actuality. | `[Mubtada + Khabar + From Potency + To Actuality]` |

Las proposiciones 7 a 23 no aparecen en el fragmento disponible. No hay comparacion con lineas base ni metricas objetivas de calidad de traduccion.

## Requisitos de hardware

- VRAM estimada a partir del numero de parametros: ~1,6 GB en fp32 (coincide con el tamano del repositorio), ~0,8 GB en fp16/bf16, ~0,4 GB en int8 y ~0,25 GB en 4 bits, sin contar memoria de activaciones ni cache de claves.
- Cabe holgadamente en GPU de consumo: cualquier tarjeta con 4 GB o mas de VRAM (RTX 3050, RTX 3060, RTX 4060, RTX 4090) es suficiente incluso en fp32.
- Es viable la inferencia en CPU, dado el presupuesto de parametros y de memoria.
- GPU de centro de datos (A100, H100) no son necesarias; solo tendrian sentido para servir muchas replicas en paralelo.
- Opciones de despliegue: `transformers` es la via natural, pero la etiqueta `custom_code` obliga a usar `trust_remote_code=True` o a copiar el codigo del repositorio, ya que la arquitectura `rootformer_v13` no esta integrada en las librerias estandar.
- Compatibilidad con vLLM, TGI, llama.cpp u Ollama: no disponible. No se publican pesos GGUF y no se documenta soporte para esas runtimes.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos comparables en la informacion proporcionada. La tabla siguiente usa conocimiento publico general sobre alternativas de traduccion arabe-ingles; los valores de las alternativas no proceden de la informacion suministrada y deben verificarse antes de citarlos.

| Modelo | Parametros | Idiomas | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Rootformer V13 Sovereign | 399.371.824 (0,4 B) | ar, en | no disponible | Apache-2.0 (con mencion a "Open Scholastic Heritage License") | Arquitectura no concatenativa; requiere `custom_code`; sin descargas ni validacion externa |
| NLLB-200-distilled-600M (Meta) | ~600 M | 200 idiomas | no disponible | CC-BY-NC-4.0 | No apto para uso comercial por licencia; cobertura multilingue muy amplia |
| Helsinki-NLP/opus-mt-ar-en | ~74 M (arquitectura Marian) | ar, en | no disponible | CC-BY-4.0 | Modelo de traduccion generico, sin analisis morfologico ni sintactico |
| UBC-NLP/AraT5-base | ~220 M | arabe (y variantes) | no disponible | Apache-2.0 | Preentrenamiento y ajuste sobre arabe; no especifico de registro clasico |

## Limitaciones y advertencias

- Afirmaciones no verificadas: expresiones del model card como "traduccion sin alucinaciones" o "bucles atractores garantizados como imposibles" son afirmaciones del autor sin evaluacion independiente ni metricas publicadas.
- Ausencia de validacion de la comunidad: 0 descargas y 0 valoraciones en el momento de redactar esta ficha; no hay terceros que hayan reproducido los resultados.
- Evaluacion limitada: el conjunto de prueba son 23 proposiciones escolares seleccionadas por el propio autor, sin linea base, sin metricas automaticas (BLEU, chrF, COMET) y sin evaluacion a ciegas.
- Ambiguedad de licencia: los metadatos indican Apache-2.0, pero el model card menciona de forma conjunta "Apache-2.0 / Open Scholastic Heritage License". Antes de un uso comercial conviene aclarar cual de las dos condiciones aplica y si existen restricciones adicionales sobre el corpus.
- Dependencia de codigo personalizado: la etiqueta `custom_code` implica que el modelo no se puede cargar en runtimes estandar sin `trust_remote_code=True`, lo que supone ejecutar codigo de terceros y limita el despliegue en entornos con politicas de seguridad estrictas.
- Cobertura de idiomas reducida: solo arabe (clasico) e ingles. No se documenta soporte de arabe moderno estandar dialectal ni de otros idiomas.
- Dominio acotado: el entrenamiento declarado se centra en prosa escolar, filosofia islamica y traduccion academica; es previsible un rendimiento pobre fuera de ese registro.
- Longitud de contexto no publicada, lo que impide planificar tareas de documento largo sin una prueba previa.
- Sesgos potenciales: un corpus escolar de tradicion islamica clasica puede arrastrar sesgos teologicos, historicos y de genero propios del material de origen. No se documenta ninguna mitigacion.
- Fechas y referencias inusuales: los metadatos indican creacion en septiembre de 2026 y el model card cita `arXiv:2609.19969`, un identificador que conviene verificar antes de referenciarlo.
- Riesgo de alucinacion en vocabulario fuera del inventario de 9.016 raices: las entradas lexicas no cubiertas por la tabla de engram pueden forzar al decodificador a improvisar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/enver/rootformer-v13-sovereign-arabic
- Dataset asociado: https://huggingface.co/datasets/enver/classical-arabic-scholastic-bilingual-corpus
- Paper citado en el model card: https://arxiv.org/html/2609.19969v1
- Resultados de busqueda web: no aportan informacion relevante sobre el modelo; las entradas devueltas corresponden a paginas biograficas y comerciales sin relacion (Enver Pasha, Enver Hoxha, un estudio de videojuegos y una entrada de diccionario).
