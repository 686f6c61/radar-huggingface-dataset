# nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2

## Resumen

Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2 es un modelo multimodal de 27.320.697.856 parametros (27,3B) desarrollado por el usuario nerkyor sobre la base oficial Qwen3.8-27B. Se trata de un post-entrenamiento en varias rondas que combina SFT y RLOO (REINFORCE Leave-One-Out) sobre un modelo previo ya ajustado con SFT y SimPO, con el objetivo explicito de corregir el fallo de detencion del modelo original: aquel tendia a seguir re-derivando una respuesta ya obtenida hasta agotar la ventana de contexto (94K) sin emitir respuesta final.

El modelo resuelve un problema muy concreto de produccion en modelos con razonamiento extendido: las truncaciones por agotamiento de contexto. Segun la model card, en el mismo protocolo de evaluacion las truncaciones a 94K caen de 4 a 1 en GPQA y de 13 a 3 en LCB respecto al Qwen3.8-27B original, sin regresion en ningun suite (GPQA 178/198, MMLU 450/500, LCB 90/100 en FP8 estatico). El repositorio distribuye cinco niveles de safetensors (BF16, FP8 estatico Block128, NVFP4 W4A16, NVFP4 W4A4 y NVFP4 W4A4-W8A8), ademas de variantes INT4, INT8 y GGUF, todas multimodales (texto + imagen/video) con la cabeza MTP oficial en BF16 incluida.

La relevancia actual reside en dos factores: por un lado, la cuantizacion sin perdida verificada (GPQA y LCB identicos entre BF16, FP8 dinamico y FP8 estatico), que permite desplegar el modelo en hardware mas modesto manteniendo calidad; por otro, la inclusión de dos mecanismos de decodificacion especulativa mutuamente excluyentes (DFlash2 y MTP) que elevan el throughput de aproximadamente 46 tok/s a unos 180 tok/s por peticion con DFlash2 y 91 tok/s con MTP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + imagen/video) derivado de Qwen3.8-27B, con cabeza MTP (multi-token prediction) en BF16 |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 94K tokens (limite de truncacion citado en la model card); ventana nominal no especificada |
| Tipos de cuantizacion | BF16, FP8 estatico Block128, NVFP4 W4A16, NVFP4 W4A4, NVFP4 W4A4-W8A8, NInfer W4A4 y W4A4-W8A8, INT4 W4A16, INT8 W8A8, INT8 W8A16, GGUF Q2/Q3/Q4 LynnStyle, Q6_K, Q8_0 (con versiones Q8 MTP) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, FP8, NVFP4, INT4, INT8), GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer multimodal de 27,3B parametros que procesa texto e imagen/video (pipeline image-text-to-text), heredado de Qwen3.8-27B y ampliado con una cabeza MTP (multi-token prediction) en BF16 que se distribuye junto con los pesos. El linaje de entrenamiento es encadenado: Qwen3.8-27B original (FP8; 177/444/83 en GPQA/MMLU/LCB) → SFT + SimPO110 (base EfficientThink; 171/442/89) → SFT de continuacion K3 → SFT de semana 2 (week2dose, update-225) → primera ronda RLOO (182 grupos) → otra ronda SFT (merge-sft-100, sft-base-rloo; 177/448/90) → segunda ronda RLOO (172 grupos) → Coder390 (178/445/90 en FP8 dinamico).

La innovacion central es el esquema de recompensa de RLOO disenado para penalizar solo las trayectorias incorrectas y no el razonamiento largo correcto: respuesta corta y correcta (<24K) +1,05; larga y correcta +1,0; corta e incorrecta (<24K) −0,2; incorrecta entre 24K y 48K −0,5; incorrecta ≥48K −0,7; incorrecta que alcanza 94K con letra de respuesta −0,9; respuesta vacia −1,0. Los datos de RLOO se construyeron muestreando 8 trayectorias por problema y conservando solo grupos con trayectorias correctas e incorrectas mezcladas (los grupos totalmente correctos se descartan); los grupos con 0 o 1 trayectoria correcta recibieron una trayectoria corta de profesor revisada que sustituye a la trayectoria incorrecta mas corta (27 grupos). El conjunto final son 172 grupos y 1.376 trayectorias: 859 correctas y 517 incorrectas, incluidas 68 respuestas vacias. Ademas del entrenamiento, el paquete incorpora decodificacion especulativa mediante DFlash2 (borrador acompanante) o MTP, mutuamente excluyentes.

## Capacidades

- Generacion de texto y razonamiento extendido con modo de pensamiento eficiente (EfficientThink): elimina colas de razonamiento improductivas sin suprimir el razonamiento largo necesario.
- Generacion de codigo reforzada (sufijo Coder del nombre), evaluada en LCB (LiveCodeBench) con 90/100 en FP8 estatico.
- Razonamiento cientifico y de conocimiento general: GPQA 178/198 y MMLU 450/500 en FP8 estatico.
- Multimodal: entrada de imagen y video junto con texto (pipeline image-text-to-text); todas las variantes cuantizadas mantienen la capacidad multimodal.
- Decodificacion especulativa: cabeza MTP en BF16 incluida y borrador DFlash2 opcional, con incrementos de throughput documentados.
- Capacidades multilingues limitadas a ingles y chino (en, zh).
- Modelo sin censura (tag uncensored), orientado a usos donde el filtrado del modelo base resulta limitante.
- Compatibilidad de despliegue: SGLang sin parches para todos los niveles; FP8 probado tambien en vLLM; GGUF para llama.cpp; variantes NInfer.
- Soporte de tool calling / function calling y de agentes multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Razonamiento cientifico de alta exigencia: el modelo esta optimizado para reducir truncaciones en problemas de GPQA, por lo que encaja en pipelines de evaluacion o asistencia a investigadores que necesitan respuestas finales dentro de la ventana de 94K sin bucles de re-derivacion.
- Generacion de codigo en produccion: con LCB 90/100 y el refuerzo Coder, es adecuado para tareas de sintesis y reparacion de codigo donde el fallo tipico del modelo base (no emitir respuesta por agotar contexto) resulta critico.
- Despliegue en GPU de consumo mediante GGUF: las variantes Q2/Q3/Q4/Q6_K/Q8_0 con MTP integrado permiten ejecutar el modelo en llama.cpp sobre hardware limitado, manteniendo la multimodalidad en las variantes que la incluyen.
- Servicio de inferencia de alto throughput: con DFlash2 se alcanzan unos 180 tok/s por peticion (frente a unos 46 tok/s sin especulacion), lo que lo hace viable para APIs conversacionales con SGLang o vLLM.
- Procesamiento de documentos con imagen y texto: al ser multimodal, puede extraer y razonar sobre contenido de capturas, diagramas o video junto a texto en un mismo flujo.
- Investigacion sobre alineacion y recompensas: el esquema RLOO documentado (penalizacion solo de trayectorias incorrectas, recompensa positiva al razonamiento largo correcto) sirve como referencia reproducible para experimentos de control de la longitud de razonamiento.
- Escenarios que requieren menor filtrado: el caracter uncensored permite usos creativos o de investigacion donde la politica del modelo base bloquea respuestas legitimas, siempre bajo la licencia Apache 2.0.

## Benchmarks y rendimiento

Resultados publicados en la model card (suites completas bajo el mismo protocolo de 100K; formato aciertos/total):

| Suite | Qwen3.8-27B original (FP8) | EfficientThink base | sft-base-rloo | Coder390 (FP8 dinamico) | Coder390 (FP8 estatico) |
|---|---|---|---|---|---|
| GPQA | 177/198 | 171/198 | 177/198 | 178/198 | 178/198 |
| MMLU | 444/500 | 442/500 | 448/500 | 445/500 | 450/500 |
| LCB | 83/100 | 89/100 | 90/100 | 90/100 | 90/100 |

Truncaciones a 94K (FP8, mismo protocolo):

| Suite | Qwen3.8-27B original | Coder390 |
|---|---|---|
| GPQA | 4 | 1 |
| LCB | 13 | 3 |

Throughput por peticion citado: aproximadamente 46 tok/s sin especulacion, 91 tok/s con MTP y 180 tok/s con DFlash2. La cuantizacion se declara sin perdida: GPQA y LCB identicos entre BF16, FP8 dinamico y FP8 estatico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; para 27,3B parametros, BF16 requiere del orden de 55 GB de pesos, FP8 unos 27 GB, NVFP4/INT4 unos 14 GB y GGUF Q4 en torno a 15-16 GB (estimaciones a partir del numero de parametros, no publicadas por el autor).
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, las variantes BF16 y FP8 encajan en A100/H100 de 80 GB y en configuraciones multi-GPU; las variantes NVFP4 e INT4 estan pensadas para hardware con soporte de cuantizacion de 4 bits.
- GPU de consumo: las variantes GGUF (Q2-Q8) permiten ejecucion en llama.cpp sobre GPU de consumo; el autor no detalla modelos concretos.
- Opciones de despliegue: SGLang (todos los niveles, sin parches), vLLM (FP8 probado; INT4 W4A16 para texto e imagen), llama.cpp y NInfer (GGUF), ademas de los paquetes NVFP4-NInfer.
- Latencia y throughput: aproximadamente 46 tok/s por peticion sin especulacion, 91 tok/s con MTP y 180 tok/s con DFlash2, segun la model card; no se especifica el hardware de medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GPQA / MMLU / LCB | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Coder390 (este modelo) | 27,3B | 94K (limite citado) | 178/198 · 450/500 · 90/100 (FP8 estatico) | Apache 2.0 | safetensors, GGUF, INT4/INT8, NVFP4 |
| Qwen3.8-27B original | 27B (no confirmado) | no disponible | 177/198 · 444/500 · 83/100 (FP8) | no disponible | Hugging Face (Qwen) |
| EfficientThink base (SimPO110) | 27B (no confirmado) | no disponible | 171/198 · 442/500 · 89/100 | Apache 2.0 | safetensors, DFlash2 |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; el caracter uncensored implica ausencia de filtrado alineado y mayor riesgo de contenido inapropiado o sesgado.
- Riesgo de alucinacion: no cuantificado; el entrenamiento RLOO premia respuestas cortas y correctas, lo que puede favorecer respuestas precipitadas en problemas que requieren razonamiento largo, aunque la recompensa mantiene positiva la cadena larga correcta.
- Contexto: el limite practico citado es de 94K tokens; superarlo produce truncaciones (reducidas pero no eliminadas: 1 en GPQA y 3 en LCB).
- Idiomas: solo ingles y chino; no hay soporte declarado de castellano.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base y los datos de profesor (Opus5.5, GPT6Astra, Grok4.7, DSV4Pro, K3) pueden imponer condiciones adicionales no detalladas; conviene revisar los terminos de los modelos de origen antes de un despliegue comercial.
- Produccion: el repositorio ocupa 1.206,4 GB, lo que exige almacenamiento considerable; DFlash2 y MTP son mutuamente excluyentes y deben configurarse segun el motor de inferencia; el soporte de tool calling y agentes no esta documentado.
- Procedencia: el modelo es un post-entrenamiento comunitario de un unico autor sobre Qwen3.8-27B; los benchmarks son autoinformados y no han sido verificados de forma independiente.

## Enlaces

- Hugging Face (modelo principal): https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2
- Modelo base (EfficientThink SFT + SimPO): https://huggingface.co/nerkyor/Qwen3.8-27B-EfficientThink-Uncensored-K3-Opus5-Grok4.6-GPT5.6Sol-SFT-SimPO-DFlash2
- Qwen3.8-27B oficial: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF / GGUF-NInfer (Hugging Face): https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-GGUF-NInfer
- GGUF / GGUF-NInfer (ModelScope): https://modelscope.cn/models/Merkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-GGUF-NInfer
- NVFP4-NInfer (Hugging Face): https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-NVFP4-NInfer
- NVFP4-NInfer (ModelScope): https://modelscope.cn/models/Merkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-NVFP4-NInfer
