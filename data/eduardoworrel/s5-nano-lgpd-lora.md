# eduardoworrel/S5-nano-LGPD-LoRA

## Resumen

S5-nano-LGPD-LoRA es un adaptador LoRA acompanado de una cabeza de clasificacion de tipo pointer head, construido sobre el modelo base maritaca-ai/S5-nano. Lo desarrolla el usuario eduardoworrel y su proposito es especializar un modelo de lenguaje pequeno en la evaluacion de politicas de privacidad conforme a la LGPD (Lei Geral de Protecao de Dados, la ley brasilena de proteccion de datos). Dado un fragmento de texto en portugues y un requisito de transparencia, el sistema responde "Sim" o "Nao" en un unico forward pass, devolviendo ademas una probabilidad y un margen de confianza.

El modelo no genera texto libre: combina un adaptador LoRA fusionado con el modelo base y una cabeza de atencion (pointer head) que puntua directamente las dos opciones de respuesta. Esta arquitectura de "System 1 / System 2" con compuerta de margen permite un modo rapido (respuesta tipada con margen) y un modo de razonamiento bajo demanda. El repositorio es pequeno (0,1 GB) y esta pensado para despliegue ligero, incluyendo ejecucion en navegador mediante una variante ONNX int4 publicada aparte.

Su relevancia actual reside en la demanda de herramientas automatizadas de cumplimiento normativo de privacidad y en la demostracion de que un modelo pequeno con un adaptador y una cabeza especifica puede alcanzar precision util en clasificacion legal, con transferencia zero-shot a GDPR y CCPA. La licencia es CC BY 4.0 y el pipeline declarado es text-classification.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base S5-nano) con adaptador LoRA y pointer head (atencion q/k de dimension 256) |
| Parametros totales | no disponible (adaptador LoRA sobre S5-nano; el tamano del repo es 0,1 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (evaluacion), fp32 (variante lgpd_only_k); variante ONNX int4 para navegador |
| Idiomas soportados | pt, en |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (LoRA + head.safetensors); ONNX int4 en repositorio hermano |

## Arquitectura y entrenamiento

El sistema parte de maritaca-ai/S5-nano, un modelo de lenguaje de tipo decoder-only de la familia S5 de Maritaca AI (licencia Apache-2.0). Sobre el se entrena un adaptador LoRA que se fusiona con el modelo base (merge_and_unload), y se anade una pointer head independiente con proyecciones q y k de dimension 256. La probabilidad de la opcion se calcula como softmax sobre el producto escalar entre la representacion del token de decision y la representacion del final de cada opcion, dividido por 16. La cabeza se entreno con exactamente las palabras "Sim" y "Nao"; cualquier otra palabra (por ejemplo, una traduccion) cambia el prompt leido por la cabeza y no funciona.

El entrenamiento se realizo exclusivamente sobre politicas de privacidad brasilenas del corpus Claudinha (un anotador por clausula), con una variante principal `lgpd_only` de 1 epoca y merge en bf16. Existe una segunda variante `lgpd_only_k` (2 epocas, merge en fp32) que no fue evaluada en el conjunto de test reservado. Se emplearon ademas datos sinteticos Kev (legacy_policy, compositional) generados por codigo Kev. La idea de separacion System 1 / System 2 y la compuerta de margen provienen de CT0 de Alias Robotics, con los precursores alias3-web y el paper "Browser Immune System" (arXiv 2611.15302).

## Capacidades

- Clasificacion binaria de cumplimiento de requisitos de transparencia en politicas de privacidad (respuesta Sim/Nao).
- Salida calibrada con probabilidad y margen de confianza en un unico forward pass.
- Modo "System 1" rapido (respuesta tipada con margen) y "System 2" bajo demanda (razonamiento adicional).
- Transferencia zero-shot a normativas en ingles (GDPR, CCPA) pese a entrenar solo con datos brasilenos.
- Ejecucion en navegador mediante ONNX int4 y WebGPU a traves de la libreria s1s2.
- Capacidad multilingue limitada a portugues e ingles.
- No soporta tool calling, function calling ni razonamiento multi-paso general; su salida esta restringida a las dos opciones entrenadas.

## Casos de uso

- Auditoria automatizada de politicas de privacidad: dado un fragmento de una politica brasilena y un requisito de transparencia, el modelo devuelve Sim/Nao con probabilidad, permitiendo clasificar por lotes miles de clausulas y priorizar la revision humana.
- Triaje en equipos de cumplimiento (DPO): integrado en un pipeline que marca clausulas potencialmente incumplidoras antes de la revision legal, reduciendo el volumen de lectura manual.
- Monitorizacion continua de webs y aplicaciones: el modo ONNX int4 en navegador permite evaluar politicas de privacidad directamente en el cliente, sin enviar texto sensible a un servidor.
- Deteccion de cambios regulatorios: al ejecutar el modelo sobre versiones sucesivas de una politica, se identifican clausulas que pasan de cumplir a incumplir un requisito.
- Investigacion en NLP juridico: sirve como baseline reproducible para estudiar transferencia zero-shot entre LGPD, GDPR y CCPA con modelos pequenos.
- Filtrado previo en asistentes legales: el margen de confianza permite derivar solo los casos ambiguos a un modelo mayor o a un revisor humano, optimizando costes.

## Benchmarks y rendimiento

Resultados en conjunto de test reservado, balanced accuracy de la pointer head, bf16, variante `lgpd_only`:

| Conjunto de test | Balanced accuracy (%) |
|---|---|
| LGPD (portugues), n = 802 | 81,2 |
| GDPR (ingles, transferencia zero-shot), n = 558 | 83,3 |
| CCPA (ingles, transferencia zero-shot), n = 420 | 81,0 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al tratarse de un adaptador de 0,1 GB sobre un modelo pequeno, la inferencia en bf16 es viable en GPU de consumo.
- GPU recomendadas: no especificadas por el autor; la variante ONNX int4 esta pensada para WebGPU en navegador.
- Cabe en GPU de consumo: si, segun el tamano reducido del adaptador y la existencia de una variante int4 para navegador.
- Opciones de despliegue: transformers + peft (merge_and_unload), ONNX Runtime con WebGPU mediante la libreria s1s2; no se documentan vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| S5-nano-LGPD-LoRA | no disponible (adaptador sobre S5-nano) | no disponible | Clasificacion Sim/Nao con pointer head | CC BY 4.0 | Hugging Face |
| maritaca-ai/S5-nano (base) | no disponible | no disponible | Modelo de lenguaje general | Apache-2.0 | Hugging Face |
| alias3-web (Alias Robotics) | no disponible | no disponible | Precursor System 1/System 2 en navegador | no disponible | Hugging Face |
| Modelos legales genericos | no disponible | no disponible | Generacion de texto juridico | variable | Hugging Face |

No se dispone de datos de rendimiento de las alternativas en la informacion proporcionada para una comparacion cuantitativa.

## Limitaciones y advertencias

- Entrenado unicamente con politicas de privacidad brasilenas (corpus Claudinha, un anotador por clausula); GDPR y CCPA nunca se usaron en entrenamiento y solo se evaluaron en zero-shot.
- El modelo indica si un fragmento aborda un requisito de transparencia, no si la politica cumple la ley; no constituye asesoramiento legal.
- La cabeza solo reconoce las palabras exactas "Sim" y "Nao"; traducciones u otras variantes rompen el funcionamiento.
- Riesgo de alucinacion y de falsos positivos/negativos en clausulas ambiguas; conviene usar el margen de confianza para derivar casos dudosos.
- Sesgos derivados de un unico anotador y de la composicion del corpus Claudinha y de los datos sinteticos Kev.
- Limitacion idiomatica: solo portugues e ingles; no hay soporte documentado para otras lenguas.
- Licencia CC BY 4.0: permite uso comercial con atribucion; deben mantenerse las atribuciones del corpus Claudinha, los datos Kev y el modelo base Apache-2.0.
- No es un modelo generativo de proposito general: no soporta tool calling ni agentes multi-paso.

## Enlaces

- Hugging Face (adaptador): https://huggingface.co/eduardoworrel/S5-nano-LGPD-LoRA
- Variante ONNX int4 para navegador: https://huggingface.co/eduardoworrel/S5-nano-LGPD-ONNX-genai-int4-S1S2
- Modelo base: https://huggingface.co/maritaca-ai/S5-nano
- Libreria s1s2: https://github.com/eduardoworrel/s1s2
- Paper Browser Immune System: https://arxiv.org/abs/2611.15302
- Corpus Claudinha: https://zenodo.org/records/13371639
- Codigo Kev: https://github.com/jaredpalmer/kev
- Precursor alias3-web: https://huggingface.co/aliasrobotics/alias3-web
