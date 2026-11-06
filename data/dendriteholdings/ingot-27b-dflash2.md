# dendriteholdings/Ingot-27B-DFlash2

## Resumen

Ingot-27B-DFlash2 es un modelo *drafter* (borrador) de decodificacion especulativa desarrollado por dendriteholdings, derivado mediante fine-tuning de z-lab/Qwen3.8-27B-DFlash2. Su funcion no es generar respuestas de forma autonoma, sino proponer tokens rapidamente que un modelo "rey" de la familia Ingot 27B (por ejemplo Ingot-IV-27B o Ingot-XVI-27B, en cuantizacion PQ2_0) verifica despues. Al solo proponer tokens y no decidir el resultado final, acelera la generacion sin alterar la calidad del modelo que responde.

A pesar del "27B" en su nombre, el numero real de parametros segun los pesos safetensors del repositorio es de aproximadamente 1.920 millones (1.924.404.480), con un tamano de repo de 5,9 GB. Se distribuye en formato GGUF con cuantizaciones Q8_0 (recomendada, 2,06 GB) y BF16 (3,86 GB), y funciona dentro del fork de llama.cpp de Dendrite mediante el mecanismo DFlash 2, basado en difusion por bloques. Su relevancia actual radica en que ofrece aceleraciones medidas de hasta 1,8x frente a la decodificacion estandar en hardware de consumo y profesional, con tasas de aceptacion en torno al 56 % en prompts de chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter de decodificacion especulativa DFlash 2 (difusion por bloques), basado en z-lab/Qwen3.8-27B-DFlash2 |
| Parametros totales | 1.924.404.480 (aprox. 1,92 B, segun pesos safetensors) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | Entrenado con secuencias de hasta 3.072 tokens; la aceptacion se mantiene al menos hasta 60k tokens en las pruebas del autor |
| Tipos de cuantizacion | Q8_0 (recomendada), BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un *drafter* DFlash 2 con 5 capas y tamano de bloque 8, que extrae caracteristicas del modelo objetivo (el "rey") desde las capas 6, 20, 34, 48 y 62. Comparte los embeddings y la cabeza de salida con el modelo objetivo, que permanece congelado durante el entrenamiento. El mecanismo DFlash 2 emplea difusion por bloques para proponer hasta 5 tokens por paso (valor maximo recomendado por el autor), que el modelo objetivo verifica en lote.

El entrenamiento partio de z-lab/Qwen3.8-27B-DFlash2 y utilizo 36.102 prompts del corpus `dendriteholdings/ingot_corpus`, respondidos por el modelo objetivo (Ingot-IV-27B en PQ2_0) a temperatura 1,0 y top-p 0,95, con 903 prompts reservados para evaluacion. El objetivo fue *block teacher forcing* DFlash con 64 anclas por secuencia, secuencias de hasta 3.072 tokens y entropia cruzada ponderada por posicion con gamma 4. Se empleo AdamW (betas 0,9 y 0,95), weight decay 0,01, gradient clip 1,0 y planificacion coseno, durante 1.499 pasos en dos etapas, sobre 116M de tokens y 8 GPU.

## Capacidades

- Propuesta rapida de tokens para decodificacion especulativa junto a un modelo Ingot 27B (Ingot-IV-27B o Ingot-XVI-27B) en el fork Dendrite de llama.cpp.
- Aceleracion de hasta 1,8x con tasa de aceptacion del 55-56 % en prompts de chat con decodificacion greedy.
- Aceleracion de 1,3x-1,4x en prompts largos de codigo (2k a 60k tokens) con muestreo a temperatura 0,6.
- No genera respuestas finales por si mismo: todo token propuesto es verificado por el modelo rey, por lo que no altera la distribucion de salida del modelo objetivo.
- Compatible con el modo conversacional (`--jinja`) de llama-server.

## Casos de uso

- **Aceleracion de chat en local:** ejecutando `llama-server` con un rey PQ2_0 y este drafter, se pasa de ~135 tok/s a ~245 tok/s en una RTX PRO 6000 Blackwell, util para interfaces conversacionales interactivas.
- **Generacion de codigo con contexto largo:** en prompts de codigo de 16k-60k tokens mantiene aceleraciones de 1,33x-1,41x, adecuado para asistentes de codigo que procesan repositorios completos.
- **Servicio de inferencia de un solo stream:** maximiza la latencia por usuario cuando se atiende una peticion cada vez, por ejemplo en herramientas CLI o IDE locales.
- **Reduccion de coste de GPU por token:** al aumentar el throughput sin cambiar el modelo que responde, se reduce el tiempo de GPU necesario para producir la misma salida.
- **Despliegue con modelos Ingot cuantizados agresivamente:** el drafter anade solo ~6 GB de VRAM a contexto 16k, complementando reyes PQ2_0 de tamano reducido.
- **Experimentacion con decodificacion especulativa por difusion:** su codigo abierto y documentacion de entrenamiento detallada lo hacen util como referencia para investigar metodos DFlash/block diffusion.

## Benchmarks y rendimiento

Resultados publicados por el autor (RTX PRO 6000 Blackwell, un stream, fork Dendrite de llama.cpp, 256 tokens greedy, prompts de chat no vistos en entrenamiento):

| Objetivo | Plain tok/s | Con drafter tok/s | Speedup | Aceptacion |
|---|---|---|---|---|
| Ingot-IV-27B | 135,5 | 243,9 | 1,80x | 55,8 % |
| Ingot-XVI-27B | 135,8 | 245,2 | 1,81x | 56,4 % |
| Ingot-IV-27B, drafter upstream z-lab | 138 | 186 | 1,35x | 43,0 % |

Prompts largos de codigo con Ingot-XVI-27B, temperatura 0,6, top-p 0,95:

| Tokens de prompt | Plain tok/s | Con drafter tok/s | Speedup | Aceptacion |
|---|---|---|---|---|
| 2k | 134,7 | 175,2 | 1,30x | 35,5 % |
| 16k | 122,8 | 163,4 | 1,33x | 32,3 % |
| 60k | 98,3 | 138,2 | 1,41x | 30,7 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) para este modelo, lo cual es esperable al tratarse de un drafter y no de un modelo generativo final.

## Requisitos de hardware

- VRAM del drafter: ~2 GB en Q8_0 o ~4 GB en BF16; el autor indica ~6 GB adicionales de VRAM en total a contexto 16k (incluyendo cache del drafter).
- GPU de referencia para las medidas: RTX PRO 6000 Blackwell. No hay datos para otras GPU.
- Debe ejecutarse junto a un modelo rey Ingot 27B en PQ2_0, por lo que la VRAM total es la del rey mas ~6 GB del drafter a 16k de contexto.
- Cabe en GPU de consumo de gama alta si el rey PQ2_0 tambien cabe; no hay medidas publicadas en consumer GPU concretas.
- Despliegue: exclusivamente mediante el fork Dendrite de llama.cpp (`llama-server` con `-md` y `--spec-type draft-dflash`, `--spec-draft-n-max 5`, `-fa on --jinja`). No hay soporte documentado para vLLM, TGI u Ollama.
- Q8_0 es mas rapida que BF16 a igual tasa de aceptacion, por lo que es la opcion recomendada.
- Las ganancias medidas corresponden a un solo stream; con muchas peticiones concurrentes el beneficio disminuye.

## Comparativa con modelos similares

| Modelo | Rol | Parametros | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-27B-DFlash2 | Drafter DFlash 2 para Ingot 27B | 1,92 B | Q8_0, BF16 (GGUF) | Apache 2.0 | GGUF publico, requiere fork Dendrite de llama.cpp |
| z-lab/Qwen3.8-27B-DFlash2 | Drafter upstream generico | no disponible | no disponible | Apache 2.0 | Publico; menor aceptacion (43 %) que el fine-tune de Dendrite |
| Ingot-IV-27B / Ingot-XVI-27B | Modelos objetivo (reyes) | 27 B (nombre) | PQ2_0 (GGUF) | no disponible | Publicos en Hugging Face |

La comparacion clave es con el drafter upstream z-lab: sobre el mismo modelo objetivo (Ingot-IV-27B), el fine-tune de Dendrite consigue 1,80x de aceleracion frente a 1,35x, y una tasa de aceptacion del 55,8 % frente al 43,0 %.

## Limitaciones y advertencias

- Entrenado con secuencias de hasta 3.072 tokens; aunque la aceptacion se mantiene hasta 60k en las pruebas del autor, el comportamiento mas alla de ese punto no esta documentado.
- La tasa de aceptacion es menor con muestreo (temperatura/top-p) que con decodificacion greedy: cae del ~56 % al ~30-35 % en prompts de codigo muestreados.
- La verificacion por lotes en llama.cpp puede producir salidas ligeramente distintas a la decodificacion plain en tokens casi empatados; el modelo es el mismo, pero la ruta de coma flotante no.
- La ganancia medida corresponde a un solo stream; bajo alta concurrencia el speedup es menor, por lo que puede no compensar en servidores muy cargados.
- Solo funciona con modelos rey Ingot 27B en PQ2_0 dentro del fork Dendrite de llama.cpp; no es un drafter de proposito general para otros modelos.
- No es util como modelo autonomo: no genera respuestas finales sin un modelo verificador.
- Idiomas soportados y posibles sesgos: no disponible en la model card.
- Licencia Apache 2.0, sin restricciones de uso comercial conocidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2
- Modelo base (drafter upstream): https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Modelo objetivo (rey): https://huggingface.co/dendriteholdings/Ingot-IV-27B-Q2
- Fork de llama.cpp de Dendrite: https://github.com/DendriteLabs/llama.cpp
- Paper DFlash (arXiv:2602.06036): https://arxiv.org/abs/2602.06036
