# henil08/verilog-coder-7b

## Resumen

verilog-coder-7b es un ajuste fino de Qwen2.5-Coder-7B-Instruct, desarrollado por henil08, orientado a la generación de módulos Verilog y SystemVerilog a partir de una especificación en lenguaje natural y, opcionalmente, de la interfaz del módulo. El modelo parte de un transformer decoder-only de 7.615.616.512 parámetros y se distribuye con licencia Apache 2.0 en formato safetensors.

El problema que aborda es la traducción de descripciones funcionales a RTL de un solo módulo, una tarea en la que los modelos generalistas suelen producir sintaxis plausible pero incorrecta. El ajuste se realizó con LoRA sobre 40.000 ejemplos de OpenRTLSet, un corpus de módulos reales de GitHub con descripciones escritas por un LLM. El autor declara una mejora en el conjunto reservado de OpenRTLSet (46,5 % frente a 33,2 % del base), pero un empeoramiento en VerilogEval v2 (23,7 % frente a 31,4 %).

Es relevante para equipos de diseño hardware que quieran un generador especializado y ligero, pero no sustituye a la verificación: el propio autor advierte de que no evalúa calidad de síntesis, timing ni área, y de que el modelo base sigue siendo mejor para problemas de estilo académico. La longitud de contexto no se documenta; el entrenamiento se hizo con `max_length` 2048.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste LoRA sobre Qwen2.5-Coder-7B-Instruct |
| Parámetros totales | 7.615.616.512 (~7,6 B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; `max_length` 2048 durante el ajuste |
| Tipos de cuantización | no disponible; solo se publican pesos safetensors |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |
| Modelo base | Qwen/Qwen2.5-Coder-7B-Instruct |
| Dataset de ajuste | ESCAD/OpenRTLSet |
| Tamaño del repositorio | 15,2 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2, inicializado desde Qwen2.5-Coder-7B-Instruct. El ajuste se realizó mediante LoRA con rango 64, alpha 128, dropout 0,05 y adaptadores en `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. Se entrenó durante 1 época con 29.906.052 tokens supervisados, pérdida calculada solo en los tokens del asistente, LR 0,0001 con scheduler coseno y 3 % de warmup, batch efectivo 64, `max_length` 2048 y precisión bf16. El entrenamiento se ejecutó con HF Transformers, PEFT y DeepSpeed ZeRO-2 sobre 1× H100 en Modal: 79 minutos y un coste aproximado de 5,37 USD. La configuración final se seleccionó entre variantes LoRA, QLoRA y ajuste completo según pass@1 en una partición de validación; la pérdida final de evaluación fue 0,2653.

Los datos proceden de OpenRTLSet: 131.000 módulos Verilog de GitHub, cada uno con una descripción escrita por un LLM. Tras eliminar 54.600 módulos generados por fuzzing, deduplicar y limitar los ejemplos a 2048 tokens, quedaron 53.700; este entrenamiento usó 40.000, con aproximadamente 93 % Verilog y 7 % SystemVerilog. Alrededor del 30 % de los prompts describen los puertos en prosa en lugar de proporcionar la cabecera como código, lo que permite usar el modelo cuando no se dispone de interfaz. El corpus bruto contenía UVM en solo 3 filas y ninguna sobrevivió al filtrado; el modelo no fue entrenado ni evaluado para UVM. No se documenta RLHF ni DPO adicional: el ajuste es supervisado sobre el modelo base ya instruido.

## Capacidades

- Generación de módulos Verilog y SystemVerilog de un solo módulo a partir de una especificación en lenguaje natural.
- Aceptación opcional de la interfaz del módulo en un bloque de código Verilog; también puede inferir puertos a partir de descripciones en prosa.
- Generación de código RTL candidato para bloques pequeños y medianos, sujeto a verificación posterior con simulador.
- Formato conversacional de system + user, heredado del modelo base instruido.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso con herramientas.
- No se documentan capacidades multilingües; el prompt de ejemplo y las descripciones de entrenamiento están en inglés.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito.
- No está entrenado ni evaluado para UVM, testbenches, diseños multi-módulo ni verificación formal.

## Casos de uso

- Generación de RTL para un módulo concreto: el modelo recibe una especificación funcional y, opcionalmente, la cabecera del módulo, y devuelve una implementación candidata. Es adecuado para bloques acotados y debe validarse con simulación antes de integrarlo.
- Creación de declaraciones de puertos desde prosa: aproximadamente el 30 % de los prompts de entrenamiento describen los puertos sin cabecera, por lo que puede usarse para convertir una lista de señales en una interfaz Verilog preliminar.
- Prototipado rápido en FPGA o ASIC: sirve para generar primeras versiones de módulos como FSMs, ALUs, contadores, registros de desplazamiento o envoltorios de bus, que después se revisan y simulan.
- Asistente en editor o IDE: puede completar módulos de un solo archivo a partir de un comentario de especificación; el desarrollador revisa sintaxis, anchos de señal, reset y condiciones de reloj.
- Docencia y generación de ejemplos: permite producir módulos de ejemplo a partir de descripciones docentes, con la ventaja de estar especializado en convenciones Verilog/SystemVerilog y la limitación de requerir revisión humana.
- Pipeline de verificación con simulador: el modelo propone un módulo y el sistema lo comprueba con Verilator o Icarus Verilog; el autor emplea comparación diferencial con estímulo aleatorio en OpenRTLSet, un enfoque reutilizable en CI.
- Evaluación interna de generación RTL: puede actuar como línea base especializada frente a modelos generalistas en tareas de spec-to-RTL de un solo módulo, siempre que se use el mismo prompt y el mismo arnés de simulación.

## Benchmarks y rendimiento

Evaluación con pass@1 y decodificación greedy, según la model card:

| Benchmark | Base | Fine-tuned | Diferencia (ganados/perdidos) |
|---|---:|---:|---:|
| OpenRTLSet reservado (diff-sim) | 33,2 % (131/394) | 46,5 % (183/394) | +59 / -7; p<0,001 |
| VerilogEval v2 spec-to-RTL (prompts publicados) | 31,4 % (49/156) | 23,7 % (37/156) | +10 / -22; p=0,050 |
| VerilogEval v2 + bloque de interfaz | 38,5 % (60/156) | 28,8 % (45/156) | +9 / -24; p=0,013 |

En OpenRTLSet reservado se usaron 394 módulos no vistos en entrenamiento. Un módulo se considera correcto si coincide con los puertos de la referencia y sus salidas son iguales en cada medio ciclo durante 500 ciclos de estímulo aleatorio con Verilator; esto es evidencia de equivalencia, no una prueba formal. En VerilogEval v2 se emplearon los testbenches oficiales y la regla de paso de Icarus Verilog v12, con el prompt conversacional del proyecto; por tanto, las puntuaciones no son directamente comparables con las del leaderboard que usan otros prompts. Los intervalos de confianza del 95 % publicados son 28,8–38,0 % para el base y 41,6–51,4 % para el fine-tune en OpenRTLSet; 24,6–39,1 % y 17,7–31,0 % en VerilogEval v2; y 31,2–46,3 % y 22,3–36,4 % con bloque de interfaz.

## Requisitos de hardware

- VRAM estimada sin cuantizar: aproximadamente 15,2 GB solo para pesos en bf16/fp16; con caché KV y overhead, conviene reservar 18–24 GB para contexto 2048 y lote 1.
- VRAM estimada con cuantización de 8 bits: alrededor de 7,6 GB para pesos y 10–14 GB en total, según implementación y longitud de contexto.
- VRAM estimada con cuantización de 4 bits: alrededor de 4–5 GB para pesos y 7–10 GB en total, según implementación y longitud de contexto.
- GPU recomendadas: A100 40/80 GB y H100 80 GB para inferencia en bf16 con mayor throughput; RTX 4090 o RTX 3090 de 24 GB para bf16 con lote pequeño y contexto moderado.
- GPU de consumo: cabe en RTX 4090/3090 de 24 GB en bf16 con contexto limitado; en GPUs de 16 GB requiere 8 bits, y en GPUs de 8–12 GB requiere 4 bits y herramientas compatibles.
- Despliegue documentado: Transformers con `dtype="auto"` y `device_map="auto"`, más PEFT si se usa el adaptador LoRA. Los tags incluyen text-generation-inference, pero no hay validación publicada de TGI para este fine-tune. vLLM, llama.cpp, Ollama y GGUF no están documentados por el autor; requerirían conversión y validación.
- Latencia y throughput de inferencia: no disponibles. El dato de 79 minutos corresponde al entrenamiento en 1× H100, no a inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| verilog-coder-7b | 7,6 B | no disponible; ajuste con 2048 | OpenRTLSet 46,5 %; VerilogEval v2 23,7 % / 28,8 % | Apache 2.0 | Hugging Face |
| Qwen2.5-Coder-7B-Instruct (base) | 7,6 B | no disponible en la información | OpenRTLSet 33,2 %; VerilogEval v2 31,4 % / 38,5 % | Apache 2.0 (según ficha del base; verificar) | Hugging Face |
| verilog-coder-7b-lora | adaptador LoRA; tamaño no disponible | heredado del base; no disponible | no evaluado en la información | Apache 2.0 | Hugging Face |

No se dispone de datos de otros modelos específicos de Verilog comparables en la información proporcionada. VerilogCoder de NVlabs es un sistema de agentes, no un modelo de pesos comparable directamente.

## Limitaciones y advertencias

- En VerilogEval v2 el fine-tune rinde por debajo de su modelo base: 23,7 % frente a 31,4 % con los prompts publicados. Para problemas de estilo académico o textbook, el base es la opción más fiable.
- La decodificación greedy cae ocasionalmente en bucles de repetición en módulos largos; alrededor del 13 % de las salidas de evaluación alcanzaron el límite de 2048 tokens.
- El entrenamiento se centra en completaciones de un solo módulo. Los diseños multi-módulo y los testbenches quedan fuera del alcance declarado.
- No fue entrenado ni evaluado en UVM. En el corpus bruto solo había 3 filas de UVM y ninguna sobrevivió al filtrado.
- No se evalúa calidad de síntesis, timing ni área. Una salida funcionalmente equivalente en simulación puede no ser sintetizable, eficiente o cerrada en timing.
- La verificación con estímulo aleatorio es evidencia de equivalencia, no una prueba formal; se recomienda simulación dirigida, comprobaciones de anchos y, cuando proceda, verificación formal.
- El prompt de ejemplo está en inglés y no se declaran idiomas soportados; no hay garantía de buen rendimiento con especificaciones en castellano.
- Riesgo de alucinación de sintaxis, señales, anchos de bus, resets, condiciones de reloj y bloques `always`; es necesario revisar y simular cada salida.
- No se documenta un análisis de sesgos. El corpus procede de GitHub y de descripciones generadas por LLM, por lo que puede heredar convenciones, errores y sesgos del código público.
- La licencia declarada del modelo es Apache 2.0 y permite uso comercial, pero no se detalla en la información proporcionada la licencia de OpenRTLSet; conviene verificarla antes de redistribuir datos o derivados.
- No se documentan tool calling, agentes, visión ni audio; no deben asumirse esas capacidades en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/henil08/verilog-coder-7b
- Adaptador LoRA: https://huggingface.co/henil08/verilog-coder-7b-lora
- Repositorio de código, pipeline y evaluación: https://github.com/Henil-08/verilog-coder-ft
- Dataset OpenRTLSet: https://huggingface.co/datasets/ESCAD/OpenRTLSet
- Modelo base Qwen2.5-Coder-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- VerilogCoder (NVlabs), proyecto externo de agentes para Verilog no relacionado con este fine-tune: https://github.com/NVlabs/VerilogCoder
- Artículo de VerilogCoder: https://arxiv.org/abs/2408.08927
