# RinKana/Nano-AMADEUS-RNN4LDFA-T1024H256-AV-1001

## Resumen

Nano-AMADEUS-RNN4LDFA-T1024H256-AV-1001 es un modelo de lenguaje de escala experimental (1,84 millones de parametros de inferencia) desarrollado por RinKana. Se trata de una RNN lineal paralela de cuatro capas con gating dependiente de datos y escaneo asociativo de prefijos, entrenada sin retropropagacion global de extremo a extremo. El objetivo del trabajo no es competir en calidad de generacion, sino demostrar que es viable entrenar una red recurrente apilada mediante mecanismos de aprendizaje local de inspiracion biologica: Direct Feedback Alignment con puentes residuales, coadaptacion de Kolen-Pollack entre capas y propagacion de elegibilidad asociativa.

El modelo se entrena sobre TinyStories con un tokenizador BPE propio de 1.024 tokens y una longitud de contexto de 512. Su relevancia es fundamentalmente metodologica: ofrece una comparacion controlada, con identico numero de parametros de inferencia, entre el entrenamiento por BPTT clasico y una alternativa post-backprop, cuantificando la brecha en perplejidad (4,18 frente a 5,86) y la alineacion coseno de gradientes respecto al gradiente verdadero (+0,4821 global).

Por su tamano y corpus, no es un modelo util para produccion general, sino una pieza de investigacion reproducible sobre algoritmos de entrenamiento alternativos en arquitecturas recurrentes lineales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RNN lineal paralela de 4 capas apiladas (AmadeusBlock: Pre-RMSNorm, gating dependiente de datos, escaneo asociativo paralelo, MLP estilo SwiGLU con SiLU, escalado residual) |
| Parametros totales | 1.842.433 (inferencia limpia); 2.301.185 (checkpoint de entrenamiento con puentes KP) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precision completa; el autor no documenta variantes GGUF ni cuantizadas) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (`amadeus-rnn-inference.safetensors` 7,37 MB y `amadeus-rnn-dfa-eprop.safetensors` 9,21 MB); tokenizador en `amadeus_tokenizer.json` (54,5 kB) |

## Arquitectura y entrenamiento

El modelo apila cuatro bloques `AmadeusBlock`, cada uno con Pre-RMSNorm, una RNN lineal con gating dependiente de datos resuelta mediante escaneo asociativo de prefijos (paralelizable sobre la dimension temporal), y una MLP con activacion SiLU al estilo SwiGLU. La dimension oculta es H=256, el vocabulario V=1.024 tokens y el contexto T=512.

El entrenamiento prescinde de BPTT global a traves de las capas apiladas y combina tres mecanismos locales: (1) Direct Feedback Alignment con un `DFARouter` de identidad residual que difunde el error de la capa superior a los bloques inferiores mediante puentes aprendibles (I_H + B_dfa); (2) coadaptacion de Kolen-Pollack inter-capa e intra-bloque, que alinea las matrices de retroalimentacion con las transformaciones directas mediante actualizaciones de producto externo y weight decay, sin transporte de pesos; y (3) propagacion de elegibilidad asociativa (`AssociativeEpropFn`), que calcula actualizaciones locales de parametros recurrentes en memoria O(BTH) sin desenrollar los pasos del escaneo en el grafo de autograd global. El entrenamiento se realizo durante una sola epoca sobre el corpus TinyStories.

## Capacidades

- Generacion de texto narrativo sencillo en ingles, limitada al dominio y registro de TinyStories (cuentos infantiles).
- Modelado de lenguaje autorregresivo con decodificacion por muestreo (temperatura, top-k, top-p) y soporte de token EOS.
- Inferencia recurrente en O(H^2) por paso, adecuada para generacion token a token.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Multilingue: no; solo ingles.

## Casos de uso

- Investigacion sobre algoritmos de aprendizaje local: el modelo sirve como banco de pruebas reproducible para comparar DFA, Kolen-Pollack y propagacion de elegibilidad frente a BPTT con identico presupuesto de parametros de inferencia.
- Estudio de alineacion de gradientes: los diagnosticos por capa (coseno entre +0,346 y +1,000) permiten analizar como se degrada la senal de aprendizaje en profundidad cuando se elimina el backprop global.
- Docencia y divulgacion: su tamano (7,37 MB de pesos) y su tokenizador de 1.024 tokens permiten ejecutar ejemplos completos en un portatil sin GPU dedicada.
- Prototipado de arquitecturas RNN lineales: el codigo de escaneo asociativo y el bloque con gating pueden reutilizarse como base para modelos mayores.
- Generacion de cuentos sinteticos controlados: util para aumentar datos en experimentos de juguete sobre TinyStories con vocabulario cerrado.
- Validacion de pipelines de entrenamiento post-backprop: el checkpoint completo con matrices KP permite reanudar entrenamiento y medir convergencia de los puentes de retroalimentacion.

## Benchmarks y rendimiento

Evaluacion sobre 10.000 historias no vistas (2.427.680 tokens validos, seq_len=512) frente a la linea base con backprop de identico tamano:

| Metrica | Baseline backprop | Post-backprop (DFA + KP + E-Prop) | Diferencia |
|---|---|---|---|
| Parametros de inferencia | 1.842.433 | 1.842.433 | Identico |
| Perdida CE ponderada por token | 1,4304 | 1,7677 | +0,3373 |
| Perplejidad de corpus | 4,18 | 5,86 | +1,68 |
| Precision top-1 | 62,95 % | 56,40 % | -6,55 pp |
| Precision top-5 | 86,32 % | 81,40 % | -4,92 pp |
| Velocidad de generacion (T4) | ~415-435 tok/s | ~421-426 tok/s | Identico |

Diagnostico de alineacion de gradientes en el paso 21.000: coseno global +0,4821 (61,2 grados); por capa, recurrente/MLP: L0 +0,346/+0,414, L1 +0,442/+0,592, L2 +0,520/+0,746, L3 +0,828/+1,000.

## Requisitos de hardware

- VRAM: inferior a 1 GB en precision completa (pesos de 7,37 MB mas estados de activacion y cache); cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con CUDA, incluida una GTX 1650 o superior; el autor reporta mediciones en una Tesla T4.
- Cabe en CPU: si, con throughput reducido; el modelo es lo bastante pequeno para ejecutarse en un portatil.
- Opciones de despliegue: PyTorch con `safetensors` y la clase `AmadeusRNN` propia del autor; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 421-426 tokens por segundo en una T4 durante generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad (TinyStories) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nano-AMADEUS-RNN4LDFA (este) | 1,84 M | 512 | 5,86 | MIT | Hugging Face |
| Nano-AMADEUS-RNN4L (baseline backprop) | 1,84 M | 512 | 4,18 | MIT | Hugging Face |
| Otros modelos TinyStories de escala comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion relevante es interna: mismo tamano y mismo corpus, con y sin backprop global. No se dispone de datos publicados de terceros comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Calidad de generacion muy limitada: perplejidad de 5,86 y precision top-1 del 56,40 % en su propio dominio; fuera de TinyStories el comportamiento es impredecible.
- Vocabulario cerrado de 1.024 tokens y contexto de 512: inadecuado para texto general, codigo o conversaciones largas.
- Solo ingles; no hay soporte multilingue.
- Riesgo alto de alucinacion y de incoherencia narrativa, especialmente en generaciones largas.
- Brecha medible frente a backprop (-1,68 de perplejidad, -6,55 pp de top-1), lo que refleja la limitacion intrinseca del esquema de aprendizaje local a esta escala.
- Licencia MIT: permite uso comercial, pero el modelo no es apto para produccion por calidad y dominio.
- No hay soporte documentado en runners estandar (vLLM, llama.cpp, Ollama); requiere el codigo de inferencia del autor.
- Modelo de investigacion sin descargas ni validacion externa en el momento de la ficha.

## Enlaces

- Hugging Face: https://huggingface.co/RinKana/Nano-AMADEUS-RNN4LDFA-T1024H256-AV-1001
- Baseline backprop: https://huggingface.co/RinKana/Nano-AMADEUS-RNN4L-T1024H256-AV-1001
- Dataset TinyStories: no disponible en la informacion proporcionada (referenciado en la model card)
- Paper o blog del autor: no disponible en la informacion proporcionada
