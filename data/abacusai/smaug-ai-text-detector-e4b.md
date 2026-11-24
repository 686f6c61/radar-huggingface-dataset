# abacusai/Smaug-AI-Text-Detector-E4B

## Resumen

Smaug-AI-Text-Detector-E4B es un modelo de deteccion de texto generado por IA desarrollado por Abacus.AI. Se trata de un fine-tuning del modelo base google/gemma-4-E4B-it, adaptado mediante aprendizaje supervisado para una tarea de clasificacion a nivel de oracion (token-classification). El modelo etiqueta cada oracion de un texto como humana, generada por IA o asistida por IA (escrita por una persona y posteriormente editada por una IA), y ademas emite un veredicto global para el documento completo.

El modelo resuelve un problema creciente en entornos academicos, editoriales y de moderacion de contenido: distinguir prosa humana de prosa sintetica, incluyendo casos dificiles como textos de hablantes no nativos de ingles o revisiones cientificas pulidas por IA. Frente a detectores cerrados como Pangram, Abacus.AI publica los pesos bajo licencia Apache 2.0, lo que permite auditoria, despliegue on-premise y ajuste fino adicional.

Con 7.463.059.474 parametros totales (aproximadamente 7,5 mil millones) y una ventana de lectura de 12.000 tokens, el modelo esta pensado para analisis de documentos de extension media. La version E4B es la variante compacta de una familia que incluye un modelo mayor, Smaug-AI-Text-Detector-35B-A3B, orientado a mayor precision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Gemma 4, fine-tuning supervisado) |
| Parametros totales | 7.463.059.474 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 12.000 tokens (ventana de lectura efectiva declarada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; sin variantes GGUF publicadas) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 15,0 GB) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E4B-it, un transformer decoder-only de la familia Gemma 4, y se somete a un fine-tuning supervisado para una tarea de etiquetado a nivel de token/oracion con tres clases (humano, generado por IA, asistido por IA). La salida se agrega posteriormente en segmentos de caracteres con etiqueta y confianza, y en un veredicto global calculado por reglas: el texto se clasifica como humano si al menos el 90% de su extension esta etiquetada como humana, como IA si al menos el 80% es IA generada, y como mixto en el resto de casos. El modelo expone un metodo `analyze()` propio a traves de `trust_remote_code`, lo que implica codigo personalizado de inferencia y post-procesado.

No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO. La model card tampoco especifica innovaciones arquitectonicas mas alla del fine-tuning sobre Gemma 4. El preprocesado aplicado al texto de entrada es ligero: normaliza saltos de linea y espacios repetidos a un espacio simple, y convierte comillas tipograficas y guiones largos en caracteres ASCII. Los indices `start` y `end` de los segmentos se refieren al texto tras esa limpieza (`text_scored`).

## Capacidades

- Deteccion de texto generado por IA a nivel de oracion, con etiqueta y puntuacion de confianza por segmento.
- Deteccion de texto asistido por IA (escrito por humano y editado por IA), categoria diferenciada de la generacion pura.
- Veredicto global del documento (Human, Mixed, AI) mediante umbrales explicitos sobre la proporcion de texto por etiqueta.
- Salida de la proporcion de texto bajo cada etiqueta (`share`), util para metricas agregadas.
- Analisis de documentos de hasta 12.000 tokens.
- Marca de texto corto (`short`) cuando la entrada tiene menos de 50 palabras, advirtiendo de fiabilidad reducida.
- Solo idioma ingles; no se declaran capacidades multilingues.
- No se declaran capacidades de tool calling, agentes, vision ni audio.

## Casos de uso

- Moderacion de contenido en plataformas editoriales: el modelo permite marcar articulos o comentarios sospechosos de generacion sintetica y, gracias al etiquetado por oracion, distinguir secciones humanas de secciones generadas dentro del mismo documento.
- Verificacion academica de ensayos y trabajos: con tasas de falsos positivos declaradas muy bajas en corpus de estudiantes (PERSUADE, ELLIPSE), puede integrarse en flujos de revision previa, siempre como senal auxiliar y no como prueba definitiva.
- Revision de articulos cientificos y peer review: la deteccion de revisiones pulidas por IA (benchmark Saha Peer Review) permite a editores de revistas senalar revisiones asistidas y solicitar declaracion explicita.
- Analisis forense de documentos legales o contractuales: la salida por segmentos ayuda a identificar que clausulas pudieron redactarse o reescribirse con asistencia de IA, con trazabilidad por indice de caracteres.
- Auditoria de pipelines de generacion de contenido: equipos que producen texto con LLM pueden usar el detector para medir cuanto texto sintetico se cuela en publicaciones y establecer controles de calidad.
- Investigacion sobre deteccion de IA: al ser open-weight y Apache 2.0, sirve como base para estudiar robustez frente a ataques de evasion (typos, trucos de caracteres) y para comparar contra detectores cerrados.
- Clasificacion por lotes de grandes corpus: la ventana de 12.000 tokens y la salida estructurada facilitan el procesamiento por documentos en pipelines de datos.

## Benchmarks y rendimiento

Todas las cifras son porcentajes; en ambos casos, menor es mejor. La comparacion es contra Pangram 4 o 4.1.

**Tasa de falsos positivos (FPR): texto humano etiquetado erroneamente**

| Benchmark | Textos | E4B | Pangram |
|:---|---:|---:|---:|
| FineWeb (paginas web 2015-2021) | 132.617 | 0,010 | 0,009 |
| PERSUADE (ensayos de estudiantes) | 25.994 | 0,004 | 0,00 |
| PELIC (ensayos de aprendices de ingles) | 15.000 | 0,23 | 0,01 |
| ELLIPSE (ensayos escolares de aprendices) | 3.909 | 0,00 | 0,00 |
| Liang et al., TOEFL (no nativos) | 91 | 0,00 | 0,00 |
| UChicago (textos humanos) | 1.992 | 0,05 | 0,00 |
| Epoch AI Style Imitation (prosa humana experta) | 495 | 0,00 | 0,00 |
| Saha Peer Review (revisiones humanas) | 468 | 0,0 | 0,0 |
| Saha Peer Review, easy (revisiones pulidas por IA) | 915 | 3,0 | 1,4 |
| Saha Peer Review, hard (revisiones pulidas por IA) | 1.887 | 8,7 | 2,5 |

**Tasa de falsos negativos (FNR): texto de IA etiquetado erroneamente**

| Benchmark | Textos | E4B | Pangram |
|:---|---:|---:|---:|
| MELD-eval, sin ataque | 31.448 | 0,00 | 0,00 |
| MELD-eval, seis ataques (typos y trucos de caracteres) | 188.688 | 0,10 | 0,01 |
| Sem-Detect (revisiones escritas por IA) | 6.744 | 0,00 | 4,5 |
| UChicago (texto de IA) | 7.968 | 0,29 | 0,00 |
| GEDE (ensayos escritos por IA) | 190 | 0,53 | 0,0 |
| Epoch AI Style Imitation (IA que imita autores reales) | 594 | 1,68 | 2,86 |
| VUB (articulos academicos escritos por IA) | 39 | 5,1 | 0,0 |
| Saha Peer Review, easy, prompt basico | 274 | 0,0 | 1,8 |
| Saha Peer Review, easy, prompt experto | 274 | 0,0 | 0,0 |
| Saha Peer Review, easy, a partir de puntos clave humanos | 936 | 0,6 | 3,7 |
| Saha Peer Review, hard, prompt basico | 750 | 0,0 | 0,0 |
| Saha Peer Review, hard, prompt experto | 600 | 0,0 | 0,0 |
| Saha Peer Review, hard, a partir de puntos clave humanos | 2.000 | 0,3 | 1,1 |

Notas de la model card: las cifras de FNR marcadas con daga corresponden a FPR del 1% (0,1% para Sem-Detect); las marcadas con doble daga se calculan con la regla que emplea el informe de Pangram 4; el dato de FineWeb de Pangram procede de una muestra propia distinta.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 15 GB solo para pesos, mas overhead de activaciones y KV cache para 12.000 tokens; en la practica, 20-24 GB de VRAM como minimo recomendado.
- Cuantizacion: no se publican pesos GGUF ni cuantizaciones oficiales; en fp8 o int8 podria reducirse a unos 8-9 GB, pero requeriria conversion propia.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para produccion; RTX 4090 (24 GB) es viable en fp16 con margen ajustado.
- GPU de consumo: cabe en RTX 4090 y potencialmente en RTX 3090 (24 GB); en GPUs de 16 GB requeriria cuantizacion no oficial.
- Despliegue: transformers>=5.23 con `trust_remote_code=True`; no se documentan integraciones con vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Smaug-AI-Text-Detector-E4B | 7,46 B | 12.000 tokens | Apache 2.0 | Pesos abiertos en HF | Etiquetado por oracion, tres clases |
| Smaug-AI-Text-Detector-35B-A3B | no disponible (MoE, 3B activos por el nombre) | no disponible | no disponible | Pesos abiertos en HF | Variante mayor del mismo autor, mas precisa segun la model card |
| Pangram 4 / 4.1 | no disponible | no disponible | propietaria | API/servicio cerrado | Referencia de comparacion en los benchmarks; mejor FPR en PELIC y en revisiones pulidas por IA |
| Detectores clasicos (p. ej. clasificadores RoBERTa entrenados ad hoc) | ~0,1-0,4 B | 512 tokens tipicamente | variable | variable | Menor contexto y sin etiquetado por oracion; no comparados en la model card |

## Limitaciones y advertencias

- Solo admite ingles; el rendimiento en otros idiomas no esta caracterizado.
- Entradas de menos de 50 palabras se marcan como poco fiables (`short = true`); no debe usarse para frases sueltas.
- Sesgo documentado hacia falsos positivos en textos de aprendices de ingles: FPR del 0,23% en PELIC frente al 0,01% de Pangram, y hasta 8,7% en revisiones humanas pulidas por IA (Saha hard).
- Falsos positivos en textos humanos editados con IA: la categoria "asistido por IA" puede absorber prosa humana que paso por correctores o asistentes.
- Riesgo de evasion: aunque robusto frente a seis tipos de ataque en MELD-eval (FNR 0,10%), tecnicas de parafraseo adversario no evaluadas pueden degradar la deteccion.
- No debe usarse como prueba unica en contextos disciplinarios o academicos: la propia model card no lo presenta como veredicto definitivo y las tasas de error, aunque bajas, no son nulas.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; conviene auditar el repositorio antes de desplegar en produccion.
- No se publican cuantizaciones oficiales ni integraciones con servidores de inferencia de alto rendimiento, lo que complica el despliegue a escala.
- El modelo base Gemma 4 puede arrastrar sesgos de su corpus de preentrenamiento; la model card no documenta evaluaciones de sesgo especificas para esta tarea.
- La licencia Apache 2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base google/gemma-4-E4B-it si estas difieren.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abacusai/Smaug-AI-Text-Detector-E4B
- Variante mayor: https://huggingface.co/abacusai/Smaug-AI-Text-Detector-35B-A3B
- Blog tecnico: https://blog.abacus.ai/blog/2026/11/24/smaug-ai-text-detector
- Pagina de Abacus.AI: https://abacus.ai
- Organizacion en Hugging Face: https://huggingface.co/abacusai
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Paper de referencia (arXiv:2607.27183): https://arxiv.org/abs/2607.27183
- Model card de Pangram 4.1 (comparativa): https://www.pangram.com/research/model-card/pangram-4-1
- Blog de Pangram sobre ensayos de estudiantes: https://www.pangram.com/blog/pangram-performance-diverse-student-essays
