# larc-iu/gen-sr-gemma-4-31b-it-gum-12.1.0

## Resumen

`larc-iu/gen-sr-gemma-4-31b-it-gum-12.1.0` es un parser RST (Rhetorical Structure Theory) generativo end-to-end, desarrollado por el grupo LARC-IU y entrenado con la librería Dipo. El modelo toma texto en lenguaje natural sin procesar y produce un arbol de discurso RST linealizado, del que se recuperan tanto la segmentacion en unidades de discurso elementales (EDU) como la estructura retorica y las etiquetas de relacion. Se apoya en el modelo `google/gemma-4-31B-it` como backbone causal, sobre el que se aplica un ajuste fino con adaptadores LoRA y cabezas de tarea especificas.

El modelo resuelve una tarea clasica del procesamiento del discurso: el analisis retorico automatico. Frente a los pipelines tradicionales que encadenan segmentador, arbol y clasificador de relaciones, aqui un unico modelo generativo emite una secuencia de acciones shift-reduce (serializacion `sr`) que codifica el arbol completo, lo que simplifica el despliegue y evita la propagacion de errores entre etapas.

Es relevante ahora porque forma parte de una linea de investigacion reciente (el paper *Worth Their Weights? Evaluating Generative Models for Discourse Parsing*, Gessler y Zeldes, 2026) que evalua hasta que punto los modelos generativos de gran tamano son competitivos en parsing del discurso. El repositorio contiene unicamente el adaptador LoRA y las cabezas de tarea (0,5 GB); el backbone se descarga aparte desde el Hub. El modelo esta entrenado exclusivamente en ingles sobre el corpus GUM 12.1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (backbone `google/gemma-4-31B-it`) con adaptador LoRA y cabezas de tarea para parsing generativo shift-reduce |
| Parametros totales | 31B en el backbone (no disponible el desglose exacto de parametros del adaptador) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 16.384 tokens (documentos mas largos se rechazan con error, no se truncan) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 (heredada de `google/gemma-4-31B-it`); datos de entrenamiento con terminos adicionales (ver limitaciones) |
| Formato de pesos | no disponible (el repo contiene adaptador LoRA y cabezas de tarea; el backbone se descarga desde el Hub) |

## Arquitectura y entrenamiento

El modelo es un parser RST generativo end-to-end. El backbone es causal (decoder-only), seleccionado mediante configuracion (`"backbone": "decoder_only"`), y la serializacion elegida es `sr` (shift-reduce), es decir, el modelo genera una secuencia de acciones bottom-up que reconstruye el arbol de discurso; alternativamente, la libreria Dipo soporta serializacion como s-expression anidada, pero este checkpoint usa `sr`. Sobre el backbone se aplica un ajuste fino con LoRA y cabezas de tarea especificas del parser.

El entrenamiento se realizo exclusivamente sobre el split de entrenamiento de GUM 12.1.0 (Georgetown University Multilayer corpus), un corpus multigenero en ingles que cubre generos como academico, biografia, ficcion, entrevista, noticias, Reddit, discurso, libro de texto, vlog, viaje y whow. El modelo predice 32 etiquetas de relacion RST (adversative-antithesis, causal-cause, elaboration-additional, joint-list, restatement-partial, topic-solutionhood, etc.). La seleccion del checkpoint se hizo sobre `e2e_full_f1` en el split de desarrollo. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset mas alla del corpus GUM, ni si se aplicaron tecnicas de RLHF o DPO. Los resultados publicados provienen de una unica ejecucion de entrenamiento.

## Capacidades

- Parsing RST end-to-end: a partir de texto crudo produce segmentacion en EDUs, estructura arborea y etiquetas de relacion retorica (32 etiquetas).
- Segmentacion implicita: el modelo realiza la segmentacion y la estructura en un solo paso generativo, sin necesidad de un segmentador externo.
- Generacion de arboles linealizados: emite secuencias shift-reduce que se decodifican a un arbol RST y se pueden exportar a formato RS4 (`to_rs4_string()`).
- Procesamiento de texto sin preprocesado: acepta texto con saltos de linea y espacios arbitrarios; colapsa todo el espaciado internamente.
- Manejo de documentos largos: admite hasta 16.384 tokens por documento.
- Deteccion de encabezados de seccion: en las pruebas del autor, el modelo tiende a aislar los encabezados como segmentos propios aunque el espaciado se colapse.
- Interfaz CLI y Python a traves de la libreria `dipo`.
- Capacidades multilingues: limitadas al ingles (unico idioma declarado).
- No se documentan capacidades de tool calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Analisis de estructura argumentativa en articulos academicos: el modelo segmenta y etiqueta relaciones como `explanation-evidence`, `causal-cause` o `elaboration-additional`, lo que permite mapear como se sostiene una tesis a lo largo del texto y alimentar estudios de retorica cientifica.
- Analisis de discurso en noticias y genero periodistico: con el genero `news` del corpus GUM, se puede extraer la jerarquia de atribuciones (`attribution-positive`, `attribution-negative`) y relaciones de contraste para tareas de verificacion o resumen estructurado.
- Procesamiento de transcripciones de entrevistas y discursos: el modelo acepta texto crudo con saltos de linea, lo que encaja con transcripciones sin limpiar; util para analisis cualitativo asistido en ciencias sociales.
- Estructuracion de contenido conversacional (Reddit, foros): permite identificar relaciones de `topic-question`, `topic-solutionhood` o `joint-list` en hilos, util para mineria de discusiones y deteccion de patrones de resolucion de problemas (con la restriccion de uso no comercial del texto de Reddit).
- Investigacion en linguistica computacional: como baseline generativo para comparar parsers RST discriminativos frente a generativos, o para estudiar el efecto del backbone y la serializacion en el rendimiento del parsing.
- Preprocesado para resumen y generacion condicionada por estructura: el arbol RST producido puede usarse como senal auxiliar en pipelines de summarization o de generacion guiada por discurso.
- Analisis de libros de texto y materiales educativos: el genero `textbook` del corpus permite estudiar la organizacion expositiva (`organization-heading`, `organization-preparation`) de materiales docentes.

## Benchmarks y rendimiento

Resultados publicados en la model card (F1 x 100 bajo Parseval original, excluyendo spans hoja triviales). *E2E* evalua arboles predichos desde texto crudo, con segmentacion incluida; *Gold-EDU* evalua con la segmentacion dorada. *Seg* es el F1 de BeginSeg por token calculado durante el entrenamiento.

| Split | Seg | E2E Span | E2E Nuc | E2E Rel | E2E Full | Gold-EDU Span | Gold-EDU Nuc | Gold-EDU Rel | Gold-EDU Full |
|---|---|---|---|---|---|---|---|---|---|
| dev | 96,0 | 66,6 | 54,1 | 42,8 | 42,5 | 70,6 | 57,6 | 45,9 | 45,4 |
| test | 95,8 | 69,5 | 56,5 | 45,9 | 45,8 | 72,7 | 60,3 | 49,0 | 48,9 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en una tabla de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.); las metricas anteriores son especificas de la tarea de parsing RST.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El backbone es de 31B parametros; en precision completa (bf16) requiere del orden de 62 GB solo para pesos, mas memoria para activaciones y KV cache, por lo que no cabe en GPUs de consumo sin cuantizacion.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano del backbone, se necesitarian GPUs de clase A100/H100 o equivalentes con suficiente VRAM para bf16; no se confirma compatibilidad con RTX 4090 sin cuantizacion.
- Cabe en GPU de consumo: no disponible; con 31B parametros, solo seria viable con cuantizacion agresiva, extremo no documentado para este checkpoint.
- Opciones de despliegue: la via oficial es la libreria `dipo` (`pip install dipo`), con CLI (`dipo gen predict`) y API Python (`GenParser.from_pretrained`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.
- Requisito de acceso: el backbone `google/gemma-4-31B-it` esta gated en Hugging Face; es necesario aceptar sus terminos y autenticarse (`huggingface-cli login` o `HF_TOKEN`) antes del primer uso.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados de otros parsers RST (discriminativos o generativos) sobre GUM 12.1.0 con los que comparar directamente. La model card remite al paper *Worth Their Weights? Evaluating Generative Models for Discourse Parsing* (arXiv:2610.17658) para la comparacion con otros modelos, pero los scores de esta ficha corresponden a este checkpoint concreto y no a las ejecuciones reportadas en el paper.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| larc-iu/gen-sr-gemma-4-31b-it-gum-12.1.0 | 31B (backbone) | 16.384 tokens | Parsing RST generativo (ingles) | Apache 2.0 (heredada) | Hugging Face, via `dipo` |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado exclusivamente en ingles; no se garantiza ningun rendimiento en otros idiomas.
- Riesgo de alucinacion estructural: aunque la tarea es de parsing, el modelo es generativo y puede producir secuencias de acciones invalidas o etiquetas de relacion incorrectas; los F1 de relacion rondan 45-49, lo que refleja una precision moderada.
- Limitacion conocida: en raras ocasiones (aproximadamente 1 de cada 3.000 segmentos en las pruebas del autor, dentro de un ejemplo de codigo) el modelo emite un segmento vacio; se recomienda filtrar con `edu.strip()`.
- Documentos de mas de 16.384 tokens se rechazan con error en lugar de truncarse; hay que trocear manualmente.
- El modelo colapsa todo el espaciado, por lo que no usa saltos de linea ni de parrafo como senal.
- Variabilidad entre ejecuciones: los scores provienen de una unica ejecucion de entrenamiento y, en conjuntos de test pequenos, la variacion entre ejecuciones puede ser de varios puntos.
- Licencia: los pesos heredan los terminos de `google/gemma-4-31B-it` (Apache 2.0 segun la model card), pero el uso esta tambien condicionado por los terminos de los datos: las anotaciones de GUM 12.1.0 son CC BY 4.0 y los textos llevan las licencias de sus fuentes (de CC BY a CC BY-NC-SA), con el texto de Reddit restringido a uso no comercial. Uso previsto: investigacion y analisis de texto.
- El repositorio solo contiene el adaptador LoRA y las cabezas de tarea; requiere descargar el backbone aparte y aceptar su licencia gated.
- Los scores de la model card corresponden a este checkpoint, no a las ejecuciones del paper asociado.
- No se documentan sesgos especificos mas alla de los inherentes al corpus GUM y al backbone Gemma.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/larc-iu/gen-sr-gemma-4-31b-it-gum-12.1.0
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Repositorio Dipo: https://github.com/larc-iu/dipo
- Paper (arXiv): https://arxiv.org/abs/2610.17658
- Corpus GUM 12.1.0: https://gucorpling.org/gum/
