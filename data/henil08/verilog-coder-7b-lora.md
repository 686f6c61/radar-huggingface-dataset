# henil08/verilog-coder-7b-lora

## Resumen

verilog-coder-7b-lora es un adaptador LoRA publicado por henil08 sobre Qwen/Qwen2.5-Coder-7B-Instruct, un modelo base de 7B parámetros. Su objetivo es generar módulos Verilog y SystemVerilog a partir de una especificación en lenguaje natural y, opcionalmente, de la interfaz del módulo. No es un modelo completo: el repositorio de 0,3 GB contiene solo los pesos del adaptador PEFT, por lo que necesita el modelo base para inferir.

El adaptador se entrena con 40.000 módulos de OpenRTLSet, un corpus de 131.000 módulos de GitHub con descripciones escritas por un LLM. Tras eliminar 54.600 módulos generados por fuzzer, deduplicar y limitar a 2.048 tokens, quedan 53.700 ejemplos; el entrenamiento usa 29.906.052 tokens supervisados en una sola época. La mezcla es aproximadamente 93 % Verilog y 7 % SystemVerilog, y cerca del 30 % de los prompts describen los puertos en prosa.

Es relevante porque ofrece una receta reproducible y de bajo coste —79 minutos en una H100, unos 5,37 USD— para generación de RTL, con evaluación funcional y no solo de coincidencia textual. Ahora bien, la model card reporta que mejora el conjunto retenido de OpenRTLSet (33,2 % a 46,5 %) pero empeora en VerilogEval v2 (31,4 % a 23,7 %), por lo que no sustituye al modelo base en problemas de estilo académico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder-7B-Instruct); adaptador LoRA, no MoE |
| Parámetros totales | 7B en el modelo base; el adaptador añade matrices LoRA de rango 64 (no se detalla el recuento exacto de parámetros del adaptador) |
| Parámetros activos | No aplica (modelo denso; el adaptador no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada; el entrenamiento usó secuencias de hasta 2.048 tokens |
| Tipos de cuantización | No se publican cuantizaciones oficiales (GGUF, AWQ, GPTQ). El adaptador se distribuye en safetensors; el base se puede cuantizar con herramientas estándar, sin validación publicada |
| Idiomas soportados | No disponible; la model card no detalla idiomas y el prompt de ejemplo está en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); requiere Qwen/Qwen2.5-Coder-7B-Instruct |
| Modelo base | Qwen/Qwen2.5-Coder-7B-Instruct |
| Tamaño del repositorio | 0,3 GB |
| Método de adaptación | LoRA (r=64, alpha=128, dropout=0,05) |
| Dataset | ESCAD/OpenRTLSet (40.000 módulos usados de 53.700 filtrados) |

## Arquitectura y entrenamiento

El adaptador no cambia la topología del modelo base: Qwen2.5-Coder-7B-Instruct es un transformer decoder-only denso, y el fine-tune añade matrices LoRA en q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj, con rango 64, alpha 128 y dropout 0,05. El entrenamiento se hizo durante una época, con LR 1e-4, scheduler cosine, 3 % de warmup, batch efectivo 64, longitud máxima 2.048, bf16, Hugging Face Transformers + PEFT + DeepSpeed ZeRO-2 sobre 1× H100 en Modal. Duró 79 minutos y costó aproximadamente 5,37 USD. La loss se calculó solo sobre los tokens del asistente/código, con una loss final de evaluación de 0,2653. La configuración se seleccionó entre LoRA, QLoRA y fine-tune completo por pass@1 en una partición de validación; los números de test no se usaron para elegir el modelo.

Los datos proceden de OpenRTLSet: 131.000 módulos Verilog de GitHub, cada uno emparejado con una descripción escrita por un LLM. Se descartaron 54.600 módulos generados por fuzzer, se deduplicó y se limitó cada ejemplo a 2.048 tokens, quedando 53.700; este entrenamiento usó 40.000. La proporción es aproximadamente 93 % Verilog y 7 % SystemVerilog, y cerca del 30 % de los prompts describen los puertos en prosa en lugar de incluir la cabecera como código. El corpus original solo contiene 3 filas de testbenches UVM y ninguna sobrevive al filtrado; el modelo no se entrenó ni evaluó en UVM. El alcance son módulos individuales, no diseños multi-módulo ni testbenches.

## Capacidades

- Generación de módulos Verilog y SystemVerilog a partir de una especificación en lenguaje natural, con la interfaz del módulo como entrada opcional.
- Acepta descripciones de puertos en prosa: cerca del 30 % de los prompts de entrenamiento usan ese formato, lo que permite trabajar sin una cabecera Verilog previa.
- Generación de código de un solo módulo; los diseños multi-módulo y los testbenches quedan fuera del alcance declarado.
- Generación de texto conversacional heredada del modelo base, con formato de prompt sistema + usuario; no se evalúa en la model card.
- No hay evidencia de soporte de tool calling ni function calling en este adaptador; la model card no lo reporta ni lo evalúa.
- No hay evidencia de capacidades de agente, multi-step reasoning, matemáticas, visión o audio en este fine-tune.
- Capacidades multilingües no documentadas; no se ha evaluado el rendimiento en castellano ni en otros idiomas.
- No se declara capacidad para UVM, testbenches, síntesis, timing ni estimación de área.

## Casos de uso

- Generación de RTL desde una especificación: se envía el prompt con `Specification:` y, si existe, `Module interface:`; el adaptador devuelve un módulo. Es adecuado para borradores de módulos simples porque se entrenó con 40.000 ejemplos de OpenRTLSet y admite puertos descritos en prosa.
- Relleno de cuerpos de módulo a partir de la interfaz: dado un `module ...(...);` incompleto, el modelo puede generar la implementación. Encaja en asistentes de editor para completar esqueletos, siempre con revisión y simulación posterior.
- Prototipado de bloques combinacionales y secuenciales sencillos: contadores, registros de desplazamiento, FSM, ALU o árbitros. El modelo genera un único módulo y el resultado debe validarse con lint y simulación.
- Generación de candidatos para verificación funcional: muestrear varias salidas, ejecutarlas con Verilator o Icarus Verilog y conservar las que pasan. El propio proyecto evalúa con diff-sim y pass@1, así que el modelo encaja en un pipeline de pass@k.
- Conversión de especificaciones heredadas: cuando los puertos están descritos en prosa, el modelo puede producir una cabecera o un esqueleto Verilog; ese formato representa cerca del 30 % de los prompts de entrenamiento.
- Aumento de datos para RTL: generar módulos sintéticos y filtrarlos por lint o simulación para ampliar un corpus de entrenamiento. El coste de generación es bajo, pero el filtrado funcional es imprescindible.
- Docencia y material didáctico: generar ejemplos de FSM, contadores y bloques básicos para explicar Verilog. Requiere revisión humana y simulación, porque el modelo puede producir código plausible pero incorrecto.
- Borradores en CI/CD: integrarlo como paso de generación de borradores en un pull request, seguido de lint y simulación. No debe usarse como verificador ni para aprobar síntesis, timing o área.

## Benchmarks y rendimiento

Resultados reportados en la model card con pass@1 y decodificación greedy:

| Benchmark | Base | Fine-tuned | Ítems ganados/perdidos | McNemar |
|---|---:|---:|---:|---:|
| OpenRTLSet held-out (diff-sim, 394 módulos) | 33,2 % (131/394; IC 95 % 28,8–38,0) | 46,5 % (183/394; IC 95 % 41,6–51,4) | +59 / -7 | p < 0,001 |
| VerilogEval v2 spec-to-RTL (prompts publicados, 156) | 31,4 % (49/156; IC 95 % 24,6–39,1) | 23,7 % (37/156; IC 95 % 17,7–31,0) | +10 / -22 | p = 0,050 |
| VerilogEval v2 + bloque de interfaz (156) | 38,5 % (60/156; IC 95 % 31,2–46,3) | 28,8 % (45/156; IC 95 % 22,3–36,4) | +9 / -24 | p = 0,013 |

En OpenRTLSet held-out, un módulo generado se considera correcto si coincide con los puertos de la referencia y sus salidas igualan las de la referencia en cada medio ciclo de 500 ciclos de estímulo aleatorio con Verilator; es evidencia de equivalencia, no una prueba formal. En VerilogEval v2 se usan los testbenches oficiales y la regla de paso de Icarus Verilog v12, con el prompt conversacional del proyecto; las puntuaciones no son directamente comparables con las del leaderboard que usan otros prompts. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de capacidades generales en la información disponible.

## Requisitos de hardware

- Precisión bf16/fp16: pesos del modelo base de aproximadamente 14–15 GB; con caché KV para 2.048 tokens, alrededor de 16–18 GB. Estimación orientativa.
- Cuantización de 8 bits: aproximadamente 8 GB de pesos y 10–12 GB totales.
- Cuantización de 4 bits: aproximadamente 4–5 GB de pesos y 6–8 GB totales.
- GPU recomendadas para servicio: A100 40/80 GB, H100 80 GB o L40S 48 GB. Para inferencia en bf16 con contexto corto, RTX 4090 o RTX 3090 de 24 GB.
- GPU de consumo: sí cabe en RTX 4090/3090 de 24 GB con bf16 y 2.048 tokens; en RTX 4080 o RTX 4060 Ti de 16 GB con 8 o 4 bits; en 12 GB requiere 4 bits y contexto reducido.
- Despliegue: Hugging Face Transformers + PEFT; el repositorio del proyecto indica backend auto-detectado MLX en Apple Silicon y vLLM en CUDA. Tras fusionar el adaptador, llama.cpp, Ollama o TGI son posibles, pero no hay artefactos oficiales publicados.
- Latencia y throughput: no disponible. No se publican medidas de inferencia; el único dato de cómputo es el entrenamiento (79 minutos en 1× H100).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| verilog-coder-7b-lora | 7B (base) + LoRA | No disponible; entrenamiento a 2.048 tokens | OpenRTLSet held-out 46,5 %; VerilogEval v2 23,7 % (28,8 % con interfaz) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen2.5-Coder-7B-Instruct (base) | 7B | No disponible en la información recogida | OpenRTLSet held-out 33,2 %; VerilogEval v2 31,4 % (38,5 % con interfaz) | Apache 2.0 | Hugging Face |
| ajn313/cl-verilog-7b-lora | 7B | No disponible | No disponible | No disponible | Hugging Face |
| bigcode/starcoder2-3b + LoRA sobre RTL-PP | 3B | No disponible | No disponible; el repositorio reporta duplicar la tasa de compilación en tareas medias/difíciles, sin pass@1 comparable | No disponible | GitHub |

La comparación directa con leaderboards no es fiable porque los resultados de VerilogEval de este proyecto usan su propio prompt conversacional y la regla de Icarus Verilog v12. El modelo base sigue siendo mejor opción para problemas de estilo académico, mientras que este adaptador mejora en módulos reales de OpenRTLSet.

## Limitaciones y advertencias

- En VerilogEval v2 este fine-tune queda por debajo de su modelo base: 23,7 % frente a 31,4 % con los prompts publicados. Para problemas de estilo textbook, el base es mejor opción.
- La decodificación greedy a veces entra en bucles de repetición en módulos largos; alrededor del 13 % de las salidas de evaluación alcanzan el límite de 2.048 tokens.
- Solo se entrenó con módulos individuales; los diseños multi-módulo y los testbenches están fuera de alcance.
- No se entrenó ni evaluó en UVM: el corpus original solo contenía 3 filas de testbenches UVM y ninguna sobrevivió al filtrado.
- No se evaluó la calidad de síntesis, el timing ni el área. La simulación funcional con estímulo aleatorio es evidencia de equivalencia, no una prueba formal.
- El contexto de entrenamiento está limitado a 2.048 tokens; especificaciones largas pueden truncarse o degradar la generación.
- No se documentan los idiomas soportados ni se evalúa el rendimiento en castellano; el prompt de ejemplo está en inglés.
- La licencia del adaptador es Apache 2.0, pero deben verificarse la licencia del dataset OpenRTLSet y las licencias del código de entrenamiento y de los módulos generados antes de uso comercial.
- Riesgo de alucinación: puede generar Verilog sintácticamente plausible pero funcionalmente incorrecto o no sintetizable; requiere lint, simulación y revisión humana.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; los resultados son autoinformados por la model card y no hay validación independiente.
- El corpus de GitHub puede introducir sesgos de estilo, convenciones de proveedores y fragmentos de código con restricciones de licencia; no se documenta un análisis de sesgos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/henil08/verilog-coder-7b-lora)
- [Repositorio del proyecto en GitHub](https://github.com/Henil-08/verilog-coder-ft)
- [Dataset ESCAD/OpenRTLSet](https://huggingface.co/datasets/ESCAD/OpenRTLSet)
- [Modelo base Qwen/Qwen2.5-Coder-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct)
- [VerilogEval: Evaluating Large Language Models for Verilog Code Generation](https://research.nvidia.com/publication/2023-09_verilogeval-evaluating-large-language-models-verilog-code-generation)
- [ajn313/cl-verilog-7b-lora](https://huggingface.co/ajn313/cl-verilog-7b-lora)
- [Fine-Tuning-LLM-for-Verilog-Code-Generation](https://github.com/Sahil7741/Fine-Tuning-LLM-for-Verilog-Code-Generation)
