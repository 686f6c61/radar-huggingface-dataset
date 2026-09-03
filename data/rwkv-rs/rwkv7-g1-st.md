# rwkv-rs/rwkv7-g1-st

## Resumen

El repositorio `rwkv-rs/rwkv7-g1-st` contiene los checkpoints canónicos de RWKV-7 G1i y G1j convertidos al formato nativo de Transformers (Safetensors). El modelo original, desarrollado por BlinkDL, es una arquitectura recurrente de la familia RWKV, que combina ideas de redes neuronales recurrentes (RNN) y transformadores mediante atención lineal. Esta conversión, realizada por el equipo de rwkv-rs, elimina la dependencia de código remoto y proporciona un tokenizer propio, configuración y plantilla de chat en cada subcarpeta.

El modelo está disponible en ocho variantes: cuatro de la subfamilia G1i y cuatro de G1j, con tamaños de 1.5B, 2.9B, 7.2B y 13.3B parámetros. Todas comparten una longitud de contexto de 16 384 tokens y pesos en bfloat16. La licencia es Apache-2.0 y los idiomas soportados son inglés y chino.

La relevancia de este repositorio radica en que facilita la integración de RWKV-7 en proyectos que usan el ecosistema Transformers sin necesidad de cargar código externo, y ofrece una alternativa recurrente a los transformadores densos para tareas de generación de texto con requisitos de memoria potencialmente menores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RWKV-7 (recurrente, con atencion lineal) |
| Parametros totales | 1.5B, 2.9B, 7.2B y 13.3B (segun checkpoint) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 16 384 tokens |
| Tipos de cuantizacion | no disponible (los pesos se publican en bfloat16) |
| Idiomas soportados | ingles, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (bfloat16) |

Los checkpoints individuales se listan a continuacion:

| Checkpoint | Parametros | Contexto | Subcarpeta |
| --- | ---: | ---: | --- |
| RWKV-7 G1i 1.5B | 1 527 668 736 | 16 384 | `rwkv7-g1i-1.5b-20260805-ctx16384` |
| RWKV-7 G1i 2.9B | 2 948 065 280 | 16 384 | `rwkv7-g1i-2.9b-20260805-ctx16384` |
| RWKV-7 G1i 7.2B | 7 199 932 416 | 16 384 | `rwkv7-g1i-7.2b-20260805-ctx16384` |
| RWKV-7 G1i 13.3B | 13 270 298 624 | 16 384 | `rwkv7-g1i-13.3b-20260805-ctx16384` |
| RWKV-7 G1j 1.5B | 1 527 404 544 | 16 384 | `rwkv7-g1j-1.5b-20260831-ctx16384` |
| RWKV-7 G1j 2.9B | 2 947 735 040 | 16 384 | `rwkv7-g1j-2.9b-20260831-ctx16384` |
| RWKV-7 G1j 7.2B | 7 199 141 888 | 16 384 | `rwkv7-g1j-7.2b-20260831-ctx16384` |
| RWKV-7 G1j 13.3B | 13 269 245 952 | 16 384 | `rwkv7-g1j-13.3b-20260831-ctx16384` |

## Arquitectura y entrenamiento

RWKV-7 es una arquitectura recurrente que combina mecanismos de atención lineal con estados ocultos recurrentes, lo que permite un coste de inferencia constante en el tiempo y un uso de memoria independiente de la longitud de la secuencia. No se dispone de informacion detallada sobre el proceso de entrenamiento (numero de tokens, composicion del dataset o tecnicas de alineacion como RLHF o DPO) en la documentacion proporcionada.

La conversion a Transformers se realiza mediante el operador FlashRWKV2, que gestiona la parte de computacion producta del modelo. Este operador es un paquete separado con licencia MIT y no existe un fallback local en PyTorch, FLA o CUDA-kernel si el hardware no es compatible.

## Capacidades

- Generacion de texto autoregresiva (causal-LM) en ingles y chino.
- Soporte de conversacion multi-turno mediante la plantilla de chat incluida en cada subcarpeta.
- Modelo recurrente con atencion lineal, lo que permite procesar secuencias de hasta 16 384 tokens con un coste de memoria constante.
- No se mencionan capacidades de tool calling, agentes, vision, audio ni thinking mode.
- Vocabulario de 65 536 entradas, con tokens BOS y EOS compartidos (ID 0).

## Casos de uso

- Generacion de contenido bilingue (ingles/chino): el modelo puede redactar articulos, resumenes o textos creativos en ambos idiomas gracias a su tokenizer nativo y su entrenamiento en dichas lenguas.
- Chatbots y asistentes conversacionales: la plantilla de chat incluida permite construir interfaces de dialogo multi-turno, aprovechando la ventana de contexto de 16 384 tokens para mantener historiales largos.
- Procesamiento de documentos largos: con 16k de contexto, puede analizar o resumir informes, actas o articulos extensos sin necesidad de truncamiento agresivo.
- Aplicaciones con restricciones de memoria: al ser recurrente, el uso de memoria es constante durante la generacion, lo que lo hace adecuado para despliegue en entornos con VRAM limitada en comparacion con transformadores densos de similar tamano.
- Experimentacion academica: al estar disponible en formato Transformers nativo, facilita la integracion en pipelines de investigacion que ya usan esa libreria.
- Sistemas de generacion de codigo o texto tecnico en ingles y chino, si bien no se especifican capacidades especificas de programacion en la documentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

No se dispone de informacion oficial sobre requisitos de hardware para inferencia. Como referencia orientativa, los pesos en bfloat16 ocupan aproximadamente 2 bytes por parametro (por ejemplo, el modelo de 2.9B ocuparia unos 5.9 GB solo de pesos), pero no se puede afirmar la VRAM total necesaria sin datos adicionales sobre el operador FlashRWKV2 y su uso de memoria durante la inferencia. Se recomienda probar en GPUs con al menos 12 GB de VRAM para los modelos mas pequenos y 24 GB o mas para los de 7.2B y 13.3B, aunque esto es una estimacion no verificada. Las opciones de despliegue son las que ofrece el ecosistema Transformers (por ejemplo, vLLM o TGI), pero no se confirma su compatibilidad con este modelo concreto.

## Comparativa con modelos similares

No disponible. No se proporcionan datos de otros modelos comparables en la informacion consultada.

## Limitaciones y advertencias

- Los checkpoints base no estan alineados para seguridad, segun se indica en la model card. No se debe usar en entornos de produccion sin un sistema de moderacion adicional.
- Solo soporta ingles y chino. No se garantiza un buen rendimiento en otros idiomas.
- La computacion depende del operador FlashRWKV2. Si el hardware no es compatible o el operador no esta instalado, el modelo falla sin un fallback alternativo.
- El contexto esta fijado en 16 384 tokens; no se menciona soporte para extension dinamica.
- No se proporcionan cuantizaciones oficiales; los pesos se distribuyen en bfloat16, lo que puede limitar su uso en GPUs sin soporte para ese formato.
- El repositorio no incluye un checkpoint por defecto en la raiz; es necesario seleccionar explicitamente la subcarpeta deseada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rwkv-rs/rwkv7-g1-st
- Modelo base de BlinkDL: https://huggingface.co/BlinkDL/rwkv7-g1
