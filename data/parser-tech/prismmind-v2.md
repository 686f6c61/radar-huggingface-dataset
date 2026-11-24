# parser-tech/prismmind-v2

## Resumen

PrismMind v2 es un paquete de checkpoints publicado por parser-tech bajo el identificador `parser-tech/prismmind-v2`, orientado a procesamiento de lenguaje natural en japones y a modelado del mundo (world models) con un enfoque neuro-simbolico. El repositorio agrupa varios componentes heterogeneos: un nucleo ternario de 1,58 bits (BitPrism), un modelo de mundo textual basado en las ideas de LeCun 2026 (LeHWorldModel con H-JEPA y SIGReg), una variante multimodal que alinea video de fisica 2D y fotos reales con un espacio latente compartido en japones, un indice de conocimiento sobre Wikipedia japonesa (KnowledgeVault v2) y un modelo de lenguaje disperso de 10 expertos (PrismLM v5). Todo el entrenamiento y la evaluacion se realizaron exclusivamente en CPU (AMD Ryzen 9 5900X), sin GPU.

El modelo no es un transformer denso convencional: combina un esqueleto ternario de 1,58 bits con un LM disperso, recuperacion BM25/PMI sobre un vault de conocimiento y un modulo de memoria online con olvido controlado. El contexto, el numero de parametros totales del LM principal y otros datos estandar de ficha no se declaran de forma explicita en la informacion disponible; el autor reporta tamanos de checkpoint (6,16 GB para PrismLM v5, 705 MB para el vault, 36,7 MB para BitPrism) y una ventana de evaluacion sobre un conjunto de test de 236.864 tokens.

Su relevancia actual reside en la propuesta de un stack cognitivo completo ejecutable en CPU, con resultados medidos en benchmarks japoneses (JBLiMP, JCommonsenseQA, JSQuAD) y en tareas de deteccion de sorpresa en modelos de mundo. La licencia CC BY-SA 4.0 permite uso comercial con atribucion y compartir-al-igual, lo que condiciona su adopcion en productos derivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: esqueleto ternario 1,58 bits (BitPrism, L=4, D=192, F=384) + LM disperso de 10 expertos (PrismLM v5) + world model H-JEPA (LeHWorldModel) + recuperacion BM25/PMI (KnowledgeVault v2) |
| Parametros totales | No disponible de forma agregada; PrismLM v5 reportado como 487,2M tokens de entrenamiento (no se declara el numero de parametros del LM) |
| Parametros activos | 10 expertos dispersos en PrismLM v5; numero de parametros activos no disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Nucleo ternario de 1,58 bits empaquetado a 2 bits (348 KB); resto de checkpoints en formato binario propietario `.bin` |
| Idiomas soportados | Japones (ja) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | `.bin` propietario (no safetensors, no GGUF); informes en JSON UTF-8 |

## Arquitectura y entrenamiento

El componente central, BitPrism 1.58-bit, es un "deep spine" ternario con 4 capas, dimension 192 y feed-forward 384, empaquetado a 2 bits y con un 34,6% de ceros exactos; el nucleo ternario ocupa 348 KB. Sobre el se apoya PrismLM v5, un LM disperso de 10 expertos que combina senal de lenguaje, recuperacion BM25 y un modulo Text-JEPA, entrenado sobre 487,2M tokens y con una memoria online bayesiana conjugada disenada para evitar el olvido catastrofico. El entrenamiento se realizo integramente en CPU con Scala 3 y Java 25, sin GPU, y el autor describe el proceso como "zero-boxing" (sin boxing de tipos primitivos en la JVM).

La parte de modelado del mundo sigue la propuesta de LeCun 2026: LeHWorldModel incorpora SIGReg (test de Epps-Pulley), una jerarquia H-JEPA de dos niveles, un modelo inverso de dinamica (IDM) y un regularizador lento SVReg, entrenado sobre 40M de tokens japoneses. La variante multimodal VL-LeHWorldModel alinea video de fisica 2D y fotografias reales del MIT con un espacio latente "platonico" compartido de 64 dimensiones en japones. El autor afirma que no se usan EMA ni stop-gradient para evitar el colapso. KnowledgeVault v2 contiene 177.036 articulos de Wikipedia japonesa restaurados por sujeto, con indice CSR BM25 + PMI que carga en 1,5 s. No se detalla la composicion exacta del dataset de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto en japones y modelado de lenguaje con perplejidad medida en held-out.
- Razonamiento gramatical japones: JBLiMP con 71,30% de acierto en pares minimos.
- Deteccion de sorpresa en texto (world model): 93,95% con separacion 6,18x.
- Deteccion de sorpresa en video de fisica 2D: 100% con separacion 37,16x.
- Recuperacion conceptual multimodal foto real -> concepto japones: Top-1 84,25% / Top-3 98,40% sobre 2.000 fotos held-out.
- Comprension lectora extractiva (JSQuAD): EM 50,00% / Char-F1 62,16%.
- Razonamiento de sentido comun de opcion multiple (JCommonsenseQA): 60,29%.
- Resolucion simbolica de problemas tipo System-2 (matematicas, algebra, secuencias, logica CSP): 36/36.
- Inyeccion de conocimiento online con `/teach` en 1,47 ms y 0,00% de olvido medido en JCommonsenseQA.
- Recuperacion sobre vault de Wikipedia japonesa (BM25 + PMI).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes multi-paso: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Correccion y evaluacion gramatical en japones: BitPrism 1.58-bit, con solo 348 KB de nucleo ternario y 71,30% en JBLiMP, puede integrarse como filtro ligero de aceptabilidad gramatical en pipelines de generacion o en herramientas de ensenanza de japones, ejecutandose en CPU sin GPU.
- Deteccion de anomalias en texto japones: LeHWorldModel, con 93,95% de deteccion de sorpresa y separacion 6,18x, sirve para monitorizar logs, tickets o resenas y marcar entradas atipicas frente a una distribucion de referencia.
- Analisis de fisica en video educativo: VL-LeHWorldModel, con 100% de deteccion de sorpresa en video de fisica 2D, permite validar experimentos grabados o detectar escenas fisicamente incoherentes en material didactico.
- Busqueda conceptual multilingue foto -> concepto japones: el espacio latente compartido de 64 dimensiones con Top-3 98,40% en recuperacion permite construir un buscador que, dada una foto real, devuelva el concepto japones asociado para catalogos, accesibilidad o aprendizaje de vocabulario.
- Atencion al cliente y FAQ sobre Wikipedia japonesa: KnowledgeVault v2 (177.036 articulos, carga en 1,5 s) combinado con PrismLM v5 permite responder consultas con recuperacion BM25/PMI y generacion en japones en un servidor sin GPU.
- Actualizacion de conocimiento en produccion sin reentrenar: el endpoint `/teach` inyecta hechos en 1,47 ms con 0,00% de olvido medido, adecuado para asistentes internos que deben incorporar correcciones o contrafactuales de forma inmediata.
- Tutoria de matematicas y logica en japones: el resolvedor simbolico System-2 (36/36 problemas verificados con residuo 0) puede usarse para generar y validar soluciones paso a paso en plataformas educativas.
- Despliegue en entornos sin GPU: todo el stack esta pensado para CPU (entrenado en Ryzen 9 5900X), lo que habilita inferencia en servidores de bajo coste, portatiles o entornos air-gapped.

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto |
|---|---|---|
| Perplejidad held-out japones (236.864 tokens) | 73,92 | PrismLM v5, 10.337 tok/s, 23,8 min de entrenamiento |
| Perplejidad held-out japones (hibrido) | 66,53 (NLL 4,1977) | BitPrism 1.58b + PrismLM v5 |
| JBLiMP (331 pares minimos) | 71,30% (236/331) | BitPrism 1.58-bit standalone, nucleo ternario de 348 KB |
| Deteccion de sorpresa textual | 93,95% (separacion 6,18x) | LeHWorldModel |
| Deteccion de sorpresa en fisica 2D | 100,00% (separacion 37,16x) | VL-LeHWorldModel |
| Video de fisica -> japones | 100,00% | VL-LeHWorldModel |
| Foto real -> concepto japones (N=2.000) | Top-1 84,25% / Top-3 98,40% | VL-LeHWorldModel (azar 10%/30%) |
| JCommonsenseQA (1.118 preguntas, 5 opciones) | 60,29% | vs 25,3% del LM solo (+35,0 pt) |
| JSQuAD (1.000 preguntas, 0,36 s) | EM 50,00% / Char-F1 62,16% | Sistema completo |
| Problemas simbolicos System-2 (36) | 36/36 (100,0%, residuo 0) | Resolvedor neuro-simbolico |
| Inyeccion online `/teach` | 1,47 ms, +0,00% olvido | JCommonsenseQA |

No se han publicado resultados de benchmarks en la informacion disponible para comparaciones con modelos de referencia externos (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- Inferencia en CPU exclusivamente: el autor entrena y evalua en AMD Ryzen 9 5900X sin GPU; no se documenta soporte CUDA.
- VRAM estimada: 0 GB (CPU-only); se requiere RAM del orden del tamano de los checkpoints cargados: 6,16 GB para PrismLM v5, 705 MB para KnowledgeVault v2, 36,7 MB para BitPrism y menos de 1 MB para los world models.
- GPU recomendadas: no aplica; no se documenta aceleracion por GPU (A100, H100, RTX 4090 no estan soportadas segun la informacion disponible).
- Cabe en cualquier equipo consumer con al menos 8 GB de RAM para el stack completo; el nucleo BitPrism (348 KB) y los world models caben en microcontroladores.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; los pesos son `.bin` propietarios y el runtime es Scala 3 / Java 25.
- Latencia y throughput: 10.337 tok/s en entrenamiento (PrismLM v5 en Ryzen 9 5900X); JSQuAD resuelto en 0,36 s para 1.000 preguntas; `/teach` en 1,47 ms. No se reporta throughput de inferencia generativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PrismMind v2 (parser-tech) | No disponible (checkpoints de 6,16 GB + 705 MB + 36,7 MB) | No disponible | Hibrido ternario + world model + neuro-simbolico, CPU-only, japones | CC BY-SA 4.0 | Hugging Face |
| BitNet b1.58 (Microsoft Research) | 700M a 3.9B en publicaciones | 2.048 tokens en configuraciones publicadas | Transformer ternario 1,58 bits | MIT (codigo y pesos publicados) | Hugging Face / GitHub |
| LeJEPA / world models tipo JEPA (Meta) | No disponible | No disponible | JEPA para representaciones autosupervisadas | Investigacion, licencias variables | Papers y repos |
| LLM japoneses densos de 7B (p. ej. familia basada en Llama/Mistral) | 7B | 4K-32K | Transformer denso | Licencias variables (a menudo Apache 2.0 o Llama) | Hugging Face |

La comparacion es aproximada: no se dispone de datos publicos de rendimiento de PrismMind v2 frente a estos modelos en los mismos benchmarks. La diferencia principal es el enfoque CPU-only con cuantizacion ternaria y modulos neuro-simbolicos, frente a los transformers densos convencionales.

## Limitaciones y advertencias

- Modelo exclusivamente en japones: no se declara soporte de otros idiomas, lo que limita su uso en entornos multilingues.
- Pesos en formato `.bin` propietario sin soporte documentado en vLLM, llama.cpp, Ollama o TGI; la integracion requiere el runtime Scala 3 / Java 25 del autor.
- No se declara la longitud de contexto, el numero total de parametros del LM ni la composicion exacta del dataset de entrenamiento, lo que dificulta la reproducibilidad.
- Resultados de benchmarks reportados por el propio autor en su model card, sin verificacion independiente; algunos conjuntos son pequenos (331 pares en JBLiMP, 36 problemas simbolicos) y los porcentajes del 100% deben interpretarse con cautela.
- Riesgo de alucinacion no cuantificado: no se publican tasas de factualidad ni evaluaciones de robustez fuera de los conjuntos citados.
- Sesgos conocidos: no documentados; al entrenar sobre Wikipedia japonesa, es probable que herede sesgos de esa fuente, pero no se aporta analisis.
- Licencia CC BY-SA 4.0: permite uso comercial con atribucion, pero obliga a compartir las obras derivadas bajo la misma licencia, lo que puede ser incompatible con productos propietarios.
- Fecha de creacion del repositorio (23 de noviembre de 2026) posterior a la fecha actual de referencia; verificar la vigencia y el estado real del repositorio antes de usarlo en produccion.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de mantenimiento activo.
- El termino "LeCun 2026" y las referencias a H-JEPA y SIGReg no se acompanan de enlaces a publicaciones verificables en la informacion disponible.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/parser-tech/prismmind-v2
- Dataset complementario: https://huggingface.co/datasets/parser-tech/prismmind-ja-dataset
