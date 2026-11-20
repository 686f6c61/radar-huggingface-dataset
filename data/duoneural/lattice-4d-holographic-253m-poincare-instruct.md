# DuoNeural/Lattice-4D-Holographic-253M-Poincare-Instruct

## Resumen
Lattice-4D-Holographic-253M-Poincare-Instruct es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por DuoNeural Research Lab, construido sobre una geometria no euclidiana (bola de Poincare) y destilado a partir de SmolLM2-1.7B-Instruct. Con aproximadamente 253 millones de parametros sin atar (292,5 millones segun el recuento real de safetensors), su proposito declarado es demostrar que una arquitectura CDM-MoE con curvatura AdS aprendible puede retener buena parte de las capacidades conversacionales y de tool calling del modelo profesor con una fraccion del coste computacional.

El modelo se presenta como el resultado insignia de la suite Lattice de DuoNeural, con una perplexity de validacion reportada de ~7,42 y un BPB de 0,6692, ademas de una precision del 93,3 % en tool calling sobre APIGen. La ventana de contexto es deliberadamente corta (512 tokens), lo que limita su uso a interacciones breves o a tareas de formato estructurado. Aunque la model card abunda en terminologia teorica (AdS/CFT, telepatia entre capas, poda harmonica dinamica), los datos empiricos publicados se reducen a benchmarks zero-shot clasicos y a metricas de destilacion.

La relevancia actual del modelo es principalmente experimental: ofrece un punto de referencia para investigar destilacion de modelos grandes a arquitecturas exoticas y para medir cuanto rendimiento se conserva al reducir parametros en un orden de magnitud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CDM-MoE (Crystallographic Dynamics Model Mixture-of-Experts) con geometria de bola de Poincare y curvatura AdS de dos zonas |
| Parametros totales | 292.511.384 (segun safetensors); 252.884.366 sin atar (~253M) reportados en la model card |
| Parametros activos | No disponible (MoE con 4 expertos por capa, sin detalle de enrutamiento) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | GGUF (tag declarado); niveles concretos no disponibles |
| Idiomas soportados | No disponible (tokenizer SmolLM2, vocabulario de 49.152) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento
El modelo emplea una pila de 7 capas transformer con d_model de 768, 12 cabezas de atencion y 4 expertos MoE por capa con dimension feed-forward de 3.072. La innovacion central es la incorporacion de curvaturas riemannianas por capa, preinicializadas segun un perfil holografico AdS (capas UV con c = 2,60 a 2,25, interfaz con c = 1,50 y frontera IR con c = 0,75 a 0,60), lo que segun el autor elimina unas 40.000 iteraciones de "tallado geometrico". Tambien se describe un mecanismo de "telepatia entre capas" (acoplamiento de momento W_tele K × K) y una poda harmonica dinamica (DHP) con suelo de learning rate de 0,20 para evitar el estancamiento de gradiente observado en ejecuciones anteriores.

El entrenamiento se realizo durante 100.000 pasos con batch efectivo de 8 (batch 4, acumulacion de gradiente 2) sobre una unica NVIDIA GeForce RTX 5070 Ti de 16 GB, usando los datasets SmolTalk y FineWeb-Edu. Se trata de un proceso de destilacion desde SmolLM2-1.7B-Instruct, con perdida KL de profesor de 0,1659. No se documenta el numero total de tokens vistos ni si hubo fases de RLHF o DPO; la model card solo menciona la destilacion supervisada sobre las particiones citadas.

## Capacidades
- Generacion de texto conversacional en ingles, heredada del profesor SmolLM2-1.7B-Instruct.
- Tool calling y function calling: 93,3 % de precision en nombre de herramienta y 96,7 % de validez JSON estricta en APIGen.
- Razonamiento zero-shot basico en tareas de sentido comun y ciencia elemental (PIQA, ARC-Easy, ARC-Challenge, HellaSwag).
- Razonamiento de multiples pasos limitado: la ventana de 512 tokens restringe el encadenamiento de contextos largos.
- Capacidades multilingues: no disponible; el vocabulario es el de SmolLM2, pero no se documentan evaluaciones por idioma.
- No se declara soporte de vision, audio, modo thinking explicito ni agentes autonomos de largo horizonte.

## Casos de uso
- Enrutamiento de herramientas en asistentes de voz o chat: el modelo puede clasificar la intencion y emitir JSON valido con nombre de funcion y argumentos, aprovechando su 96,7 % de validez estricta en APIGen para integraciones con APIs externas.
- Extraccion de campos estructurados en formularios: con prompts cortos (menos de 512 tokens), es adecuado para convertir texto libre en objetos JSON con claves predefinidas.
- Clasificacion y etiquetado de intenciones en pipelines de atencion al cliente: su bajo coste de inferencia permite desplegarlo como clasificador previo a un modelo mayor.
- Prototipado de agentes de un solo paso: util para validar flujos de tool calling en entornos de desarrollo antes de escalar a modelos de mayor tamano.
- Filtrado y normalizacion de respuestas en cascada: puede actuar como modelo de primera linea para reformatear o validar sintaxis de salidas generadas por otro modelo.
- Investigacion en destilacion y geometrias no euclidianas: sirve como banco de pruebas reproducible para estudiar el efecto de curvaturas por capa y del enrutamiento MoE en modelos pequenos.
- Generacion de respuestas breves en dominios acotados (FAQ, macros de soporte): con contexto de 512 tokens y destilacion sobre SmolTalk, es viable para respuestas de menos de un parrafo.

## Benchmarks y rendimiento

| Benchmark | Metrica | Lattice-4D (253M) | Profesor SmolLM2-1.7B | Retencion |
|---|---|---|---|---|
| APIGen tool calling | Precision nombre de herramienta | 93,3 % | 100,0 % | 93,3 % |
| APIGen JSON validity | Sintaxis estricta valida | 96,7 % | 100,0 % | 96,7 % |
| APIGen argument F1 | F1 de claves de parametro | 92,2 % | 100,0 % | 92,2 % |
| PIQA | Acc_norm zero-shot | 54,0 % (58,0 % raw) | 77,0 % (72,5 % raw) | 70,1 % |
| ARC-Easy | Acc_norm zero-shot | 41,5 % (42,5 % raw) | 62,0 % (66,0 % raw) | 66,9 % |
| ARC-Challenge | Acc_norm zero-shot | 28,5 % (20,0 % raw) | 42,5 % (38,5 % raw) | 67,1 % |
| HellaSwag | Acc_norm zero-shot | 36,0 % (35,5 % raw) | 59,5 % (44,0 % raw) | 60,5 % |
| WikiText-2 test | Perplexity / BPB | 75,74 PPL (1,5416 BPB) | 11,56 PPL (0,8719 BPB) | Referencia |

| Particion de destilacion | Metrica | Lattice-4D | Profesor | Top-1 agree | Top-5 agree |
|---|---|---|---|---|---|
| SmolTalk (apigen-80k) | BPB / PPL asistente | 0,1148 BPB (1,24 PPL) | 0,0164 BPB (1,03 PPL) | 97,13 % | 98,71 % |
| SmolTalk (smol-constraints) | BPB / PPL asistente | 0,4675 BPB (5,04 PPL) | 0,1874 BPB (1,91 PPL) | 67,20 % | 88,45 % |
| FineWeb-Edu (held-out) | BPB / PPL de dominio | 1,2406 BPB (39,63 PPL) | 0,7786 BPB (10,07 PPL) | 48,48 % | 72,12 % |

## Requisitos de hardware
- VRAM estimada: en FP16, unos 0,6 GB para los 292,5 millones de parametros; en cuantizacion de 4 bits, por debajo de 0,3 GB. La huella real depende del runtime y del tamaño del contexto (512 tokens).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente; el autor entreno en una RTX 5070 Ti de 16 GB, pero la inferencia cabe en GTX 1650, RTX 3060, RTX 4060 o superiores.
- Cabe en GPU consumer: si, con margen amplio.
- Opciones de despliegue: transformers (libreria declarada), llama.cpp y Ollama mediante los pesos GGUF publicados, y servidores compatibles con endpoints de Hugging Face. vLLM y TGI no estan confirmados para esta arquitectura CDM-MoE.
- Latencia y throughput: no disponible; no se publican mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Lattice-4D-Holographic-253M | 253M sin atar (292,5M reales) | 512 | Apache 2.0 | MoE con geometria de Poincare, destilado de SmolLM2-1.7B |
| SmolLM2-135M-Instruct | 135M | 8.192 | Apache 2.0 | Denso, sin MoE; referencia de la familia SmolLM2 |
| SmolLM2-360M-Instruct | 360M | 8.192 | Apache 2.0 | Denso; contexto mucho mayor y ecosistema de despliegue maduro |
| Qwen2.5-0.5B-Instruct | 494M | 32.768 | Apache 2.0 | Denso multilingue con soporte amplio de tool calling |

La comparacion con SmolLM2-135M y 360M es la mas directa por tamano y licencia; el Lattice-4D ofrece contexto muy inferior (512 frente a 8.192) y un rendimiento zero-shot por debajo de los densos de tamano similar, pero declara una retencion alta en tareas de formato JSON y tool calling. Frente a Qwen2.5-0.5B, pierde en contexto y cobertura multilingue, aunque gana en coste de inferencia por su menor numero de parametros activos.

## Limitaciones y advertencias
- Ventana de contexto de solo 512 tokens: inutilizable para documentos largos, conversaciones multi-turno extensas o agentes con memoria.
- Perplexity en WikiText-2 de 75,74 frente a 11,56 del profesor, lo que indica una perdida significativa de fluidez y coherencia en texto general.
- Rendimiento zero-shot claramente inferior al profesor en PIQA, ARC y HellaSwag, con retenciones entre el 60 % y el 70 %.
- Riesgo elevado de alucinacion en conocimiento factual: la destilacion se centra en SmolTalk y FineWeb-Edu, sin fases documentadas de RLHF o DPO.
- Idiomas soportados no documentados; no hay evaluaciones multilingues, por lo que el uso en castellano no esta validado.
- Terminologia de la model card (AdS/CFT, telepatia entre capas, superfluidez) no verificada de forma independiente; los resultados provienen del propio autor.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrece garantia sobre el rendimiento en produccion ni sobre la cadena de responsabilidad del modelo base.
- Ecosistema de despliegue limitado: la arquitectura CDM-MoE puede no ser compatible con vLLM o TGI, lo que restringe opciones de serving a gran escala.

## Enlaces
- Hugging Face: https://huggingface.co/DuoNeural/Lattice-4D-Holographic-253M-Poincare-Instruct
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
- Dataset SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Web del autor: https://duoneural.com
- Repositorio de codigo: https://github.com/DuoNeural/Lattice-CDM
- Perfil del autor en Hugging Face: https://huggingface.co/DuoNeural
