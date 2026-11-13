# nhz-io/7series-bitstream-decompiler

## Resumen

`7series-bitstream-decompiler` es un adaptador LoRA publicado por Nanohertz (nhz-io) sobre el modelo `zhuyaoyu/CodeV-R1-RL-Qwen-7B`, orientado a la descompilación de bitstreams y netlists de FPGA de la familia 7-Series de AMD/Xilinx (Zynq-7000, Artix-7, Kintex-7). El objetivo declarado es recuperar RTL Verilog sintetizable (IEEE 1364-2001) a partir de netlists anonimizadas y tramas CRAM físicas (`.bit`, `BOOT.bin`), una tarea clásica de ingeniería inversa de hardware que tradicionalmente requiere herramientas EDA propietarias y trabajo manual experto.

El sistema no es solo un adaptador de lenguaje: el repositorio empaqueta un pipeline multimodal compuesto por un codificador de prefijo basado en GNN que transforma características de nodos de circuito (tablas de verdad LUT6, FDRE, CARRY4, dominios de reloj, anclajes de pines) en 8 tokens virtuales de prefijo de 3584 dimensiones, junto con 12 cabezas auxiliares de percepción (regresión de anchura de bus, detección de dominios de reloj y CDC, análisis de FSM, clasificación de rol de pines) y un balanceador multi-tarea homoscedástico basado en Kendall y Gal.

El checkpoint actual, `v0.1.0-45k-baseline`, se entrenó sobre 44.698 netlists durante 3 épocas (134.094 iteraciones) en una única RTX 4090, con una pérdida LM de 0,2830 y una pérdida multi-tarea media de -1,8236. Es relevante ahora porque aplica modelos de razonamiento tipo CodeV-R1 a un dominio de nicho con escasez de datos públicos, y porque publica pesos bajo Apache-2.0, algo poco habitual en herramientas de ingeniería inversa de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen-7B base) + adaptador LoRA + codificador de prefijo GNN + 12 cabezas auxiliares |
| Parametros totales | No disponible (el adaptador LoRA y las cabezas se distribuyen como safetensors; el modelo base Qwen-7B ronda los 7.000 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA y cabezas), `.pt` (GNN prefix encoder y cabezas auxiliares en PyTorch) |

## Arquitectura y entrenamiento

El componente lingüístico es un adaptador LoRA sobre `zhuyaoyu/CodeV-R1-RL-Qwen-7B`, un modelo derivado de Qwen-7B afinado con refuerzo para generación y razonamiento de código. Sobre esa base, el autor añade un codificador GNN que procesa características de nodo de 100 dimensiones extraídas de netlists (tablas de verdad de LUT6, flip-flops FDRE, cadenas de acarreo CARRY4, dominios de reloj y anclajes de pines de placa) y las proyecta en 8 tokens virtuales de prefijo de 3584 dimensiones que se inyectan en el contexto del LLM. Este esquema convierte un grafo de circuito en una representación textual-prefijo que el transformer puede consumir junto con las instrucciones en lenguaje natural.

El entrenamiento se realizó sobre 44.698 netlists de 7-Series durante 3 épocas, totalizando 134.094 iteraciones en una NVIDIA GeForce RTX 4090. La pérdida combina la pérdida de modelado de lenguaje (0,2830) con las pérdidas de las 12 cabezas auxiliares, ponderadas mediante un balanceador homoscedástico de Kendall y Gal que aprende las varianzas por tarea (pérdida multi-tarea media de -1,8236). Las cabezas cubren regresión continua de anchura de bus (1 a 65.536 bits), descubrimiento de dominios de reloj y resets asíncronos, análisis de FSM (número de estados, codificación one-hot frente a gray, estados trampa) y clasificación de rol de pines (UART TX/RX, HDMI, SPI, LEDs, botones). No se especifica en la información disponible el volumen de tokens de entrenamiento ni la composición exacta del corpus más allá del número de netlists.

## Capacidades

- Generación de Verilog RTL de comportamiento (IEEE 1364-2001) a partir de grafos de netlist y anclajes de prompt.
- Descompilación de bitstreams y tramas CRAM de FPGA 7-Series (`.bit`, `BOOT.bin`).
- Codificación de grafos de circuito mediante GNN con características NetTAG de 100 dimensiones.
- Regresión de anchura de bus continua en el rango de 1 a 65.536 bits.
- Detección de dominios de reloj, resets asíncronos y cruces de dominio (CDC).
- Análisis de máquinas de estados finitos: recuento de estados, codificación y estados trampa.
- Clasificación de rol de pines independiente del encapsulado (UART, HDMI, SPI, LEDs, botones).
- Modo de razonamiento explícito mediante el canal `<|im_start|>thought` heredado del modelo base.
- Generación de texto conversacional en inglés.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Auditoría de seguridad de bitstreams: el modelo permite recuperar la lógica de un `.bit` sospechoso y compararla con el RTL esperado, útil para detectar troyanos hardware o modificaciones no autorizadas en dispositivos desplegados.
- Recuperación de diseño legacy: para proyectos con RTL perdido pero con el bitstream de producción disponible, el modelo genera una base Verilog que un ingeniero puede revisar y re-sintetizar, reduciendo el esfuerzo de reconstrucción manual.
- Verificación formal asistida: las cabezas de FSM y de anchura de bus alimentan propiedades de verificación (invariantes de estado, rangos de señal) que se pueden volcar a SVA o a herramientas de model checking.
- Análisis de dominios de reloj en SoC Zynq-7000: la cabeza de CDC identifica cruces asíncronos en el netlist recuperado, lo que permite priorizar revisiones de metaestabilidad antes de portar el diseño a otra familia.
- Ingeniería inversa de placas de evaluación: la clasificación de rol de pines mapea pines del encapsulado a funciones (UART, HDMI, SPI), facilitando la reutilización de placas Artix-7 o Kintex-7 en nuevos proyectos.
- Docencia e investigación en EDA: el pipeline GNN + LLM sirve como banco de pruebas para estudiar la representación de grafos de circuito en modelos de lenguaje, con pesos y cabezas publicados para reproducir experimentos.
- Migración de diseños entre familias: el RTL recuperado se puede re-sintetizar para otras FPGAs, siempre que se valide funcionalmente contra el bitstream original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de entrenamiento: pérdida LM de 0,2830 y pérdida multi-tarea media de -1,8236 en el checkpoint `v0.1.0-45k-baseline`.

## Requisitos de hardware

- El adaptador LoRA y las cabezas auxiliares ocupan aproximadamente 0,2 GB en el repositorio; el modelo base Qwen-7B debe cargarse aparte en bfloat16 (en torno a 14-15 GB de VRAM solo para los pesos).
- VRAM estimada para inferencia: alrededor de 16-18 GB en bfloat16 con el modelo base y el adaptador cargados; no se dispone de cifras oficiales para cuantizaciones de 8 o 4 bits.
- GPU recomendadas: A100, H100 o L40S para despliegue concurrente; RTX 4090 (24 GB) es suficiente para una instancia, y de hecho fue la GPU usada para el entrenamiento.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y modelos con 24 GB o más. En GPUs de 16 GB requeriría cuantización, no documentada en la información disponible.
- Opciones de despliegue: el quickstart oficial usa `transformers` + `peft` con `device_map="auto"`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la presencia de un codificador GNN y cabezas auxiliares hace improbable un despliegue directo en runtimes GGUF sin trabajo adicional.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nhz-io/7series-bitstream-decompiler` | Base Qwen-7B + LoRA + GNN | No disponible | Descompilación de bitstreams 7-Series | Apache-2.0 | Hugging Face |
| `zhuyaoyu/CodeV-R1-RL-Qwen-7B` | ~7.000 M | No disponible | Razonamiento y generación de código (modelo base) | No disponible en la informacion proporcionada | Hugging Face |
| Herramientas EDA propietarias de ingeniería inversa | No aplica | No aplica | Descompilación manual/asistida de netlists | Comercial | Vendor |
| LLMs generalistas de código (p. ej. Qwen2.5-Coder-7B) | ~7.000 M | 32.768 tokens (referencia habitual de la familia) | Generación de código sin percepción de grafos | Apache-2.0 en varias variantes | Hugging Face |

La comparación directa con otros descompiladores de bitstream públicos no está disponible en la información proporcionada. Frente a un LLM de código genérico, la diferencia clave es la inyección de embeddings de grafo y las cabezas auxiliares, que aportan información estructural (relojes, anchuras, FSM) que un modelo de texto no puede inferir del prompt.

## Limitaciones y advertencias

- Cobertura restringida a la familia 7-Series (Zynq-7000, Artix-7, Kintex-7); no se documenta soporte para UltraScale, UltraScale+ ni Series 6.
- Entrenado únicamente en inglés, lo que limita su uso en documentación o prompts en castellano.
- El checkpoint es una versión baseline (`v0.1.0-45k-baseline`); no hay validación funcional publicada del RTL generado contra los bitstreams originales.
- Riesgo de alucinación en la generación de Verilog: el RTL recuperado debe pasar simulación, equivalencia formal y síntesis antes de usarse en producción.
- El pipeline requiere cargar el modelo base por separado, además del adaptador, el codificador GNN y las cabezas; no es un artefacto autónomo.
- No se documentan sesgos específicos del dominio, pero al derivar de un LLM generalista puede heredar sesgos de sus datos de preentrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero el usuario debe verificar la licencia del modelo base `zhuyaoyu/CodeV-R1-RL-Qwen-7B` antes de redistribuir o desplegar comercialmente.
- La ingeniería inversa de bitstreams puede estar sujeta a restricciones legales o contractuales según la jurisdicción y los términos de uso del hardware; la licencia del modelo no exime de esas obligaciones.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación independiente por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nhz-io/7series-bitstream-decompiler
- Modelo base: https://huggingface.co/zhuyaoyu/CodeV-R1-RL-Qwen-7B
- Sitio del desarrollador: https://nhz.io
- Licencia Apache-2.0: https://opensource.org/licenses/Apache-2.0
