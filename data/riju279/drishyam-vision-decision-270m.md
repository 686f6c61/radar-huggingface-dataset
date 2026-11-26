# riju279/drishyam-vision-decision-270m

## Resumen

drishyam-vision-decision-270m es un modelo de decisión documental de pequeno tamano desarrollado por el usuario riju279. A diferencia de un modelo generativo convencional, no produce texto: recibe la imagen de una pagina de documento y una pregunta tipada (verificacion binaria si/no, eleccion multiple de 2 a 5 opciones, o puntuacion ordinal de 5 niveles) y devuelve una decision directa. Es un fine-tune de google/t5gemma-2-270m y hereda por tanto la licencia Gemma de Google, no una licencia permisiva tipo Apache.

El modelo esta disenado especificamente para comprension de documentos financieros y administrativos: recibos termicos, extractos de tarjeta, extractos bancarios, facturas de electricidad, nominas y facturas de telefonia. Su interes tecnico radica en el enfoque: congela una torre de vision SigLIP, cachea las paginas como embeddings (256 slots) y alimenta cada pregunta como una fila del encoder de t5gemma, con cabezas tipadas y calibracion por temperature scaling. Es un experimento de investigacion con gates internos documentados y un benchmark publico (SROIE) medido de forma transparente.

La relevancia actual es doble: por un lado, demuestra un patron de arquitectura eficiente para tareas de decision sobre documentos (sin decodificacion autoregresiva, con throughput alto); por otro, su model card documenta con inusual honestidad un defecto conocido (sesgo hacia la respuesta "si") que limita su uso en produccion para rechazo de afirmaciones falsas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Torre de vision SigLIP congelada + proyector de page-embeddings + encoder t5gemma con cabezas tipadas (forward_row) |
| Parametros totales | 270M (heredados de t5gemma-2-270m; el modelo base es de 270M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 page-embedding slots + hasta 65 tokens de pregunta/opciones |
| Tipos de cuantizacion | no disponible (el repo incluye best.pt en fp32; se reporta throughput en fp32) |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use de Google) |
| Formato de pesos | best.pt (PyTorch); tablas de evaluacion en JSON |

## Arquitectura y entrenamiento

La arquitectura sigue un esquema de dos etapas. Primero, una torre de vision estilo SigLIP congelada procesa cada pagina y la representa como 256 tokens de page-embedding cacheados; estos embeddings nunca se recodifican durante el entrenamiento. Despues, cada pregunta se construye como una fila del encoder: se concatenan los 256 embeddings de pagina con los tokens de la pregunta y sus opciones (hasta 65), y se alimentan al encoder de t5gemma. Las respuestas se leen directamente de la salida del encoder mediante tres cabezas tipadas: noul (binaria, si/no), choice (2 a 5 opciones) y score (ordinal, 5 niveles).

El entrenamiento usa exclusivamente datos sinteticos generados por una factoria determinista de documentos incluida en el repositorio (paper_rig), con etiquetas derivadas del ground truth de la factoria (exactas por construccion, sin fuga de datos). Se banquearon 90.000 paginas como embeddings cacheados (89.976 verificadas): 36.000 recibos termicos, 19.000 extractos de tarjeta, 15.000 extractos bancarios, 8.000 facturas de electricidad, 6.000 nominas y 6.000 facturas de telefonia. Los splits son 15.000 de entrenamiento, 2.000 de validacion y 3.000 de test, mas 600 paginas de familias no vistas (3.000 decisiones). La familia de nominas se reserva exclusivamente para el sondeo de transferencia leave-one-family-out. La calibracion se ajusta con temperature scaling sobre el split de validacion sintetico: noul T=1.23 (n=6312), choice T=2.87 (n=3570), score T=1.00 (n=400).

## Capacidades

- Verificacion binaria de afirmaciones sobre documentos (si/no) mediante la cabeza noul.
- Eleccion de la opcion correcta entre 2 y 5 candidatos mediante la cabeza choice.
- Puntuacion ordinal de calidad en 5 niveles mediante la cabeza score.
- Lectura de documentos escaneados reales: 98,3 % de acierto en fechas verdaderas y 95,6 % en empresas verdaderas sobre SROIE.
- Procesamiento de paginas como embeddings cacheados, lo que permite alto throughput (48,8 decisiones/s en fp32).
- Calibracion de confianza mediante temperature scaling (ECE 0,033 post-TS en el gate interno de 15 bins).
- No soporta tool calling, function calling, agentes, generacion de texto libre, vision general fuera de documentos ni modo thinking.

## Casos de uso

- Verificacion de campos en recibos y facturas: dado un recibo escaneado y una afirmacion sobre la fecha o la empresa emisora, el modelo confirma si el dato es correcto. Es adecuado porque su punto fuerte medido es precisamente la confirmacion de afirmaciones verdaderas (98,3 % en fechas).
- Triaje de calidad documental: con la cabeza score ordinal puede clasificar la calidad o legibilidad de una pagina en 5 niveles, util para enrutar documentos a revision manual o a procesamiento automatico.
- Clasificacion de tipo de documento: con preguntas de eleccion multiple, puede decidir a que familia pertenece una pagina (recibo, extracto, factura) dentro de las cinco familias entrenadas.
- Control de extraccion en pipelines de KIE: como etapa de validacion posterior a un extractor de campos, el modelo puede confirmar si el valor extraido coincide con el contenido de la pagina, reduciendo falsos positivos en produccion de datos financieros.
- Procesamiento masivo por lotes: gracias a los embeddings de pagina cacheados y a las 48,8 decisiones/s en fp32, es viable evaluar miles de decisiones sobre un mismo lote de paginas sin recodificar la vision.
- Investigacion sobre modelos de decision calibrados: sirve como referencia reproducible para estudiar calibracion (ECE, temperature scaling) y sesgos de prior en tareas de decision documental con datos sinteticos.
- Prototipado de asistentes de auditoria de gastos: combinado con un OCR externo, puede responder preguntas tipadas sobre recibos de gastos para validacion de dietas y reembolsos, siempre dentro de las familias entrenadas.

## Benchmarks y rendimiento

Gate interno (2026-11-25, gate2_row_table.json), 4 de 5 PASS:

| Barra | Valor | Umbral | Veredicto |
|---|---|---|---|
| Ablation flip | 0,346 | > 0,30 | PASS |
| Multiq delta (cuantizacion) | 0,0 | == 0,0 | PASS |
| ECE (post-TS, 15 bins) | 0,033 | < 0,08 | PASS |
| AUC familia no vista | 0,175 | > 0,75 | FAIL |
| Jitter flip | 0,0055 | < 0,05 | PASS |

Ledger: accuracy de validacion 0,894, ECE 0,036 (pre-TS en validacion), jitter 0,0055, accuracy de test 0,886 (Brier 0,172), 48,8 decisiones/s en fp32.

SROIE receipt-verification v1 (publico, 2026-11-26), 2.166 filas balanceadas 50/50, softmax crudo fp32:

| Slice | Accuracy |
|---|---|
| Overall | 51,2 |
| TRUE-claim Yes — date | 98,3 |
| TRUE-claim Yes — company | 95,6 |
| FALSE-claim rejection | 20,1 |
| Por campo (total / date / company) | 51,1 / 50,4 / 52,2 |

ImajevBench v2.0-lite (fuera de dominio, 2026-11-26): 34,1 % de accuracy tipada en dev (n=173); noul 44,6, choice 26,5, score 0/7.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint best.pt ocupa aproximadamente 1,6 GB en fp32; con pesos de 270M en fp16 cabria en torno a 0,6-1 GB, mas el coste de los embeddings de pagina cacheados (256 slots por pagina).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente para fp32; no requiere A100 ni H100 para inferencia individual.
- Cabe en GPU de consumo: si, en tarjetas tipo RTX 3060, RTX 4060, RTX 4090 y similares; el throughput medido de 48,8 decisiones/s en fp32 sugiere margen amplio en hardware moderno.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo de decision con cabezas tipadas y pesos PyTorch (best.pt), el despliegue requiere cargar el checkpoint con el codigo del repositorio fuente.
- Latencia y throughput: 48,8 decisiones/s en fp32 segun el ledger interno; no hay datos de latencia por decision individual.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| drishyam-vision-decision-270m | 270M | 256 page-embeddings + 65 tokens | Decision tipada sobre documentos | gemma | Hugging Face |
| google/t5gemma-2-270m (base) | 270M | no disponible | Encoder-decoder de texto | gemma | Hugging Face |
| riju279/drishyam-text-decision-270m | 270M | no disponible | Decision tipada sobre texto (inicializado desde este checkpoint) | gemma | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros modelos de decision documental en la informacion proporcionada.

## Limitaciones y advertencias

- Solo dominio documental: los dominios fotograficos fallan (34,1 % en ImajevBench, cerrado como fuera de alcance).
- Defecto conocido de prior "si": el rechazo de afirmaciones falsas es debil (20,1 % en SROIE; 2,5 % en fechas y 8,9 % en empresas), atribuido a un mix de entrenamiento desbalanceado en respuestas.
- La calibracion esta ajustada sobre la distribucion sintetica y no transfiere fuera de dominio (ECE 0,252 en SROIE); por eso el benchmark publico uso softmax crudo.
- No hay opcion de abstenerse ni opcion "Unknown" en las cabezas; el barrido de umbral en ImajevBench no encontro un umbral util de abtencion.
- Falla la barra de transferencia a familias no vistas (AUC 0,175 frente a un umbral de 0,75): no es fiable en familias de documentos no entrenadas.
- Entrenado solo con paginas sinteticas; los estilos de documentos reales fuera de las cinco familias entrenadas no estan probados.
- Licencia Gemma: cualquier uso derivado queda sujeto a los Terminos de Uso de Gemma de Google, no a una licencia permisiva; revisar restricciones de uso comercial antes de desplegar.
- Riesgo de alucinacion no aplica en el sentido generativo (no produce texto libre), pero la confianza reportada no es fiable fuera de la distribucion de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/riju279/drishyam-vision-decision-270m
- Modelo base: https://huggingface.co/google/t5gemma-2-270m
- Modelo de texto inicializado desde este checkpoint: https://huggingface.co/riju279/drishyam-text-decision-270m
- Benchmark SROIE: https://rrc.cvc.uab.es/?ch=13
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
