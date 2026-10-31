# lavendercomputing/LFM2.5-24B-A2B-Heretic-GSQ-RCO-GGUF

## Resumen

LFM2.5-24B-A2B-Heretic-GSQ-RCO-GGUF es una versión cuantizada en formato GGUF del modelo LiquidAI/LFM2.5-24B-A2B, un modelo de texto de aproximadamente 24 mil millones de parámetros con arquitectura mixture-of-experts (MoE) de la familia `lfm2_moe` de Liquid AI, que activa solo unos 2 mil millones de parámetros por token. Esta compilación concreta procede del máster BF16 "abliterado" mediante Heretic (OS-Software/LFM2.5-24B-A2B-Uncensored-Heretic), un proceso sin entrenamiento que elimina la dirección de rechazo del modelo para levantar sus negativas de seguridad.

La relevancia de esta ficha reside en la combinación de tres factores: un MoE eficiente (2B activos de 24B totales), un contexto de 131.072 tokens y cuantizaciones IQ3 de muy baja precisión (3,01 y 3,50 bits por peso) que permiten ejecutar el modelo en hardware modesto, incluso solo con CPU. Está pensado para desarrolladores que usan llama.cpp y buscan un modelo sin filtros de rechazo con coste de inferencia reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (`lfm2_moe`) con bloques híbridos de shortconv y atención completa |
| Parametros totales | 23.971.587.712 (~24B) |
| Parametros activos | ~2B por token (MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | IQ3_XXS (3,01 BPW, 8,39 GiB) e IQ3_S (3,50 BPW, 9,78 GiB); cuantización mixta por tensor con token_embd y router en Q8_0, atención en Q6_K/Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (uso local y de investigación gratuito; uso comercial permitido para entidades con ingresos anuales inferiores a 10M $) |
| Formato de pesos | GGUF (imatrix aplicada; no requiere archivo mmproj, es un modelo de solo texto) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE híbrido con 40 bloques: 38 son bloques MoE con 64 expertos cada uno (dimensiones 1536×2048) y los 2 restantes son bloques densos; de los 38 bloques MoE, 30 emplean una pila de convolución corta (`shortconv.in_proj/out_proj/conv`) y 10 usan atención completa con K/V de 2048×512. Los embeddings están atados (no existe `output.weight`), el vocabulario es de 128.000 tokens y los expertos enrutados concentran el 95,7 % de todos los parámetros, lo que hace que sean ellos quienes soportan la compresión de la cuantización.

Sobre entrenamiento del modelo base no se han publicado datos en la información disponible (número de tokens, composición del dataset o alineación mediante RLHF/DPO). Lo que sí está documentado es el post-procesado: el "descensado" se realizó con Heretic, una técnica de abliteración sin entrenamiento que estima la dirección de rechazo del modelo, la proyecta fuera de matrices de pesos seleccionadas y valida cada prueba bajo un límite de KL con comprobaciones conductuales. El flujo completo fue: BF16 del fabricante → abliteración Heretic en BF16 (OS-Software) → GGUF Q8_0 prácticamente sin pérdida → builds IQ3_XXS/IQ3_S con matriz de importancia (cobertura de 516 de 517 matrices 2-D significativas).

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, etiqueta `conversational`).
- Razonamiento: las builds se probaron y producen salida de razonamiento coherente, aunque solo como prueba de humo.
- Arquitectura MoE con ~2B de parámetros activos: inferencia rápida para un modelo de 24B totales.
- Contexto largo de 131.072 tokens.
- Modelo sin filtros de rechazo (abliterado con Heretic): responde a peticiones que el modelo original rechazaría.
- Solo texto: no incluye capacidades de visión ni audio (no necesita `mmproj`).
- No hay información disponible sobre tool calling, agentes ni capacidades multilingües específicas.

## Casos de uso

- Chatbots locales sin censura: el abliterado Heretic elimina las negativas del modelo original, útil para asistentes personales que ejecutan íntegramente en local.
- Inferencia en CPU o GPU de gama baja: con 8,39-9,78 GiB en disco y ~2B de parámetros activos, es viable en portátiles y estaciones sin GPU dedicada (se reportan 8-11 t/s solo con CPU como prueba de humo).
- Procesamiento de documentos largos: la ventana de 131.072 tokens permite resumir o analizar contratos, informes o bases de código extensos en una sola pasada.
- Experimentación con abliteración y cuantización: la cadena de provenance documentada (BF16 → Q8_0 → IQ3) sirve como referencia reproducible para estudiar el impacto de la pérdida de precisión en modelos abliterados.
- Integración en aplicaciones con llama.cpp: la arquitectura `lfm2_moe` está soportada de serie, lo que facilita servir el modelo con `llama-cli` o `llama-server` sin parches adicionales.
- Prototipado de agentes ligeros en dispositivos edge: el bajo coste por token de la vía MoE y el tamaño reducido de los GGUF lo hacen adecuado para despliegues con memoria limitada, siempre aceptando la pérdida de calidad del nivel IQ3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única medida reportada es una prueba de humo en CPU con llama.cpp: 8-11 tokens/s, que el propio autor advierte que no es una cifra de serving.

## Requisitos de hardware

- VRAM / memoria: 8,39 GiB para IQ3_XXS y 9,78 GiB para IQ3_S, más overhead de contexto y KV cache. Cabe en GPUs consumer de 12 GB (RTX 3060 12 GB, RTX 4070) o puede ejecutarse parcial o totalmente en CPU con 16 GB de RAM.
- GPU recomendadas: no disponible una recomendación oficial; por tamaño, cualquier GPU con 12 GB de VRAM o más permite offload completo, y GPUs de 8 GB permiten offload parcial de capas.
- Consumer GPUs: sí, es el objetivo explícito de las cuantizaciones IQ3; también funciona solo con CPU (llama.cpp).
- Despliegue: llama.cpp (soporte nativo de `lfm2_moe`, probado con `llama-cli`); no hay menciones a vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: 8-11 t/s solo con CPU como prueba de humo; no hay cifras de serving en GPU.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B-Heretic-GSQ-RCO (esta ficha) | ~24B | ~2B | 131.072 | LFM Open License v1.0 | GGUF IQ3, abliterado, para llama.cpp |
| LiquidAI/LFM2.5-24B-A2B (base) | ~24B | ~2B | 131.072 | LFM Open License v1.0 | Modelo original con filtros de seguridad; disponible en BF16 y cuantizaciones de mayor fidelidad |
| OS-Software/LFM2.5-24B-A2B-Uncensored-Heretic | ~24B | ~2B | 131.072 | LFM Open License v1.0 | Máster BF16 abliterado, sin pérdida por cuantización |

## Limitaciones y advertencias

- La abliteración elimina salvaguardas de seguridad: el modelo puede generar contenido dañino, ilegal o inapropiado sin rechazarlo. Es responsabilidad del usuario un despliegue seguro.
- Los builds IQ3 heredan pérdida por cuantización; para comparaciones estrictas de calidad, el autor recomienda la vía Q6_K o BF16 de OS-Software.
- Las pruebas realizadas sobre estas builds fueron solo de carga, ejecución y coherencia; la suite de pruebas conductuales de Heretic pertenece al trabajo comunitario previo, no a este repositorio, por lo que el grado real de "descensado" no está verificado aquí.
- Licencia LFM Open License v1.0: el uso comercial está restringido a entidades con ingresos anuales inferiores a 10M $; por encima de ese umbral se necesita un acuerdo con Liquid AI.
- No hay datos publicados de idiomas soportados, benchmarks ni capacidades de tool calling; evaluar antes de usar en producción.
- La abliteración puede degradar la calidad general del modelo (mayor alucinación o incoherencia), y la cuantización agresiva a 3 bits amplifica ese riesgo.
- La cifra de 8-11 t/s en CPU es una prueba de humo, no un número de serving.

## Enlaces

- Ficha del modelo cuantizado: https://huggingface.co/lavendercomputing/LFM2.5-24B-A2B-Heretic-GSQ-RCO-GGUF
- Modelo base del fabricante: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Máster BF16 abliterado: https://huggingface.co/OS-Software/LFM2.5-24B-A2B-Uncensored-Heretic
- Fuente Q8_0: https://huggingface.co/OS-Software/LFM2.5-24B-A2B-Uncensored-Heretic-GGUF/blob/main/LFM2.5-24B-A2B-Uncensored-Heretic-Q8_0.gguf
- Matriz de importancia: https://huggingface.co/mradermacher/LFM2.5-24B-A2B-Uncensored-Heretic-i1-GGUF/blob/main/LFM2.5-24B-A2B-Uncensored-Heretic.imatrix.gguf
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
