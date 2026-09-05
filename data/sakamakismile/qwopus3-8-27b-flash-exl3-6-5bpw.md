# sakamakismile/Qwopus3.8-27B-Flash-EXL3-6.5bpw

## Resumen

Qwopus3.8-27B-Flash-EXL3-6.5bpw es una cuantización EXL3 de 6.5 bits por peso del modelo Qwopus3.8-27B-Flash, un fine-tune de la familia Qwen3.5 desarrollado por Jackrong. El modelo original es un transformer híbrido con 64 capas, de las cuales 16 son de atención completa y 48 de atención lineal, con 4 cabezas KV y dimensión de cabeza 256. Esta versión cuantizada fue creada por el laboratorio Lna-Lab con ExLlamaV3 v1.4.5 y se distribuye bajo licencia Apache-2.0.

El repositorio contiene uno de los tres individuos generados con la misma receta de cuantización. Según safetensors, el modelo tiene 12.707.664.112 parámetros y el repositorio ocupa 25,4 GB. La cuantización asigna 6.5 bits al cuerpo, 8 bits a lm_head, 16 bits a MTP y 16 bits a visión. Se ha medido en servidores con 8 GPUs RTX PRO 2000 Blackwell de 16 GiB usando tensor parallelism, alcanzando 50,6 tokens/s en decodificación de un solo flujo y hasta 220,8 tokens/s agregados con 6 flujos.

Su relevancia radica en la eficiencia para contextos largos: el KV cache ocupa 64 KiB por token en FP16, lo que permite manejar 1 millón de tokens con 8 GiB por GPU. Además, el soporte de MTP permite decodificación especulativa con velocidades de 91 a 102 tokens/s en contextos de 32K. Es una opción interesante para aplicaciones en japonés e inglés que requieran agentes, tool calling y procesamiento de documentos extensos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (16 capas full attention + 48 capas linear attention) |
| Parámetros totales | 12.707.664.112 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | EXL3 6.5bpw (cuerpo 6.5, lm_head 8, MTP 16, vision 16) |
| Idiomas soportados | japonés, inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (EXL3 / ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo base Qwopus3.8-27B-Flash es un transformer híbrido de la familia Qwen3.5. Su arquitectura combina 16 capas de atención completa con 48 capas de atención lineal, totalizando 64 cap
