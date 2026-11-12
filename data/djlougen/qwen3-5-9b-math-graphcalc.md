# DJLougen/Qwen3.5-9B-Math-GraphCalc

## Resumen

Qwen3.5-9B-Math-GraphCalc es un ajuste fino experimental del modelo base Qwen/Qwen3.5-9B-Base, desarrollado por el usuario DJLougen y publicado en Hugging Face bajo licencia Apache 2.0. El modelo, de 8.985.670.530 parámetros en bfloat16 (8,99B), está especializado en matemáticas de nivel educativo y en el trazado de funciones, con un enfoque declarado de "pedagogía verificada": no solo resuelve el problema, sino que explica el procedimiento paso a paso.

La propuesta técnica más singular es la incorporación de una "calculadora gráfica en pesos": según la model card, once capas transformer compiladas de tipo Gated-DeltaNet (capas 0 a 10) se sitúan delante de las 32 capas de lenguaje de Qwen (capas 11 a 42, con hidden_size de 5632) y ejecutan instrucciones RISC-V de 32 bits (RV32IM + Zba + bignum de 256 bits) directamente en la pasada forward, usando el estado recurrente del modelo como memoria RAM. El autor afirma que el ajuste se realizó íntegramente en espacio de pesos, sin gradientes ni pasos de optimizador.

El modelo está pensado para investigadores interesados en weight-space modeling, en la ejecución de cómputo determinista dentro de un transformer y en asistentes matemáticos con capacidad de enseñanza. Su alcance es limitado: solo inglés, sin datos de descargas ni validación independiente de los resultados declarados, y con un rendimiento modesto en benchmarks de competición como MATH-500 (58,20%) y AIME 2024 (10,00%).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3_5ForCausalLM, 43 capas; capas 0-10 Gated-DeltaNet compiladas, capas 11-42 capas de lenguaje Qwen con hidden_size 5632 |
| Parametros totales | 8.985.670.530 (8,99B) en bfloat16 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors bfloat16) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.5-9B-Base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B-Base y conserva su estructura de 43 capas, pero reorganiza el cómputo: las once primeras capas son capas Gated-DeltaNet compiladas que actúan como una CPU RISC-V embebida, y las 32 restantes son las capas de lenguaje originales de Qwen, ensanchadas hasta hidden_size = 5632 con un factor m = 22. Según el autor, el binario graphcalc.elf (87.636 bytes) se ejecuta dentro del estado recurrente de las capas Gated-DeltaNet, que hace las veces de RAM, y produce resultados con aritmética de enteros de 256 bits, fracciones reducidas, trigonometría y logaritmos mediante CORDIC de 40 iteraciones, raíces, puntos de inflexión, integrales definidas por método de Simpson y muestreo de coordenadas.

El entrenamiento se describe como "weight-space modeling": sin gradientes (torch.set_grad_enabled(False)), sin pasos de optimizador y sin ajuste de pesos a activaciones registradas. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación declarada es la ejecución determinista de instrucciones RISC-V dentro de la pasada forward, sin eval() de Python, sin SymPy ni servidores de calculadora externos, con emisión de `<tool_call>` en el token 0 y respuesta `<tool_response>` generada por las capas 0-10.

## Capacidades

- Generación de texto conversacional en inglés, con formato ChatML y también en modo plain Q&A.
- Resolución de cálculos multi-dígito con aritmética exacta de enteros de 256 bits y fracciones reducidas.
- Evaluación de funciones trigonométricas y logarítmicas mediante CORDIC de 40 iteraciones.
- Cálculo de raíces, puntos de inflexión, máximos y mínimos locales de funciones.
- Integración definida numérica por regla de Simpson.
- Trazado de funciones: muestreo de coordenadas y generación de la gráfica para un intervalo dado.
- Tool calling nativo mediante `<tool_call>` con la función `graphcalc`, que acepta parámetros `expression`, `xmin` y `xmax`.
- Enseñanza pedagógica paso a paso: el modelo explica el procedimiento además de dar el resultado.
- Ejecución lockstep de instrucciones RV32IM + Zba en pesos, declarada al 100% en el conjunto de evaluación del autor.
- No se documentan capacidades de visión, audio, agentes multi-paso ni razonamiento extendido más allá del cálculo matemático.

## Casos de uso

- Tutor matemático interactivo: el modelo resuelve ecuaciones y cálculos exactos y, a continuación, explica cada paso, lo que lo hace adecuado para plataformas de aprendizaje que necesitan justificar el resultado y no solo entregarlo.
- Trazado de funciones en entornos educativos: ante una petición como "grafica y = x^3 - 3x en [-2, 2]", el modelo emite la llamada a `graphcalc` y devuelve raíces, extremos y muestras de coordenadas listas para representar.
- Verificación de cálculos en pipelines de corrección automática: la aritmética de 256 bits y las fracciones reducidas permiten comparar la respuesta del alumno con un resultado exacto calculado dentro del propio modelo, sin dependencias externas.
- Asistente de cálculo simbólico-numérico en documentación técnica: integrales definidas por Simpson y evaluación trigonométrica con CORDIC para informes de ingeniería que requieran resultados reproducibles.
- Investigación en weight-space modeling: el modelo sirve como banco de pruebas para estudiar cómo se comporta una CPU RISC-V embebida en el estado recurrente de un transformer y qué precisión alcanza en lockstep.
- Demostraciones de tool calling determinista: útil para evaluar arquitecturas en las que la llamada a herramienta se genera en el token 0 y la respuesta se produce dentro de la pasada forward, sin servidores externos.
- Prototipos de asistentes matemáticos sin conectividad: al no depender de eval() ni de servicios de calculadora, puede desplegarse en entornos aislados donde el cálculo debe ejecutarse localmente.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Metrica | Resultado |
|---|---|---|
| Carbon-GraphCalc-HeldOut-60 (test) | Math Accuracy (%) | 96,67 |
| Carbon-GraphCalc-HeldOut-60 (test) | Verified Pedagogical Teaching (%) | 70,00 |
| Carbon-GraphCalc-HeldOut-60 (test) | Graph Feature Accuracy (%) | 97,06 |
| Carbon-GraphCalc-HeldOut-60 (test) | Function Plotting Rate (%) | 100,00 |
| Carbon-GraphCalc-HeldOut-60 (test) | In-Weights RV32 Execution Lockstep (%) | 100,00 |
| Carbon-MathTutor-HeldOut-180 (test) | Overall Math Accuracy (%) | 86,67 |
| Carbon-MathTutor-HeldOut-180 (test) | Plain Q&A Math Accuracy (%) | 80,56 |
| Carbon-MathTutor-HeldOut-180 (test) | Verified Pedagogical Teaching (%) | 73,06 |
| GSM8K (test, zero-shot greedy) | ChatML Zero-Shot Accuracy (%) | 78,85 |
| GSM8K (test, zero-shot greedy) | Mean Accuracy Plain+ChatML (%) | 75,78 |
| GSM8K (test, zero-shot greedy) | Verified Pedagogical Teaching (%) | 53,07 |
| MATH-500 (test, zero-shot greedy) | ChatML Zero-Shot Accuracy (%) | 58,20 |
| MATH-500 (test, zero-shot greedy) | Mean Accuracy Plain+ChatML (%) | 51,80 |
| MATH-500 (test, zero-shot greedy) | Verified Pedagogical Teaching (%) | 42,40 |
| AIME 2024 (train, zero-shot greedy) | ChatML Zero-Shot Accuracy (%) | 10,00 |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 18 GB solo para pesos (8,99B × 2 bytes), más overhead de activaciones y caché KV; se recomienda un mínimo de 24 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 9-10 GB; en 4 bits, alrededor de 5-6 GB. No se han publicado pesos cuantizados oficiales, por lo que habría que generarlos.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para bfloat16 sin compromisos; RTX 4090 (24 GB) para bfloat16 ajustado o cuantización de 8 bits.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en bfloat16 con contexto moderado y en RTX 4070 Ti Super o superiores si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: transformers (librería declarada), vLLM o TGI para serving; llama.cpp y Ollama solo si se generan pesos GGUF, que no están publicados.
- Latencia y throughput: no disponibles. La ejecución de `graphcalc.elf` dentro de la pasada forward añade coste por llamada (el ejemplo de la model card menciona 169.027 pasos RV32 para un trazado), por lo que la latencia en tareas de cálculo será superior a la de una generación de texto convencional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Matemáticas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-Math-GraphCalc | 8,99B | No disponible | GSM8K 78,85%; MATH-500 58,20%; AIME 2024 10,00% | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-9B-Base | 9B (aprox.) | No disponible | No disponible en la información proporcionada | Apache 2.0 | Hugging Face |
| Alternativas de 7-9B especializadas en matemáticas | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Solo soporta inglés; no hay evidencia de capacidades multilingües y el castellano no está cubierto.
- Los benchmarks son declarados por el autor y no están verificados de forma independiente; el campo `verified` es `false` en todos los resultados.
- Rendimiento bajo en matemáticas de competición: 10,00% en AIME 2024 y 58,20% en MATH-500 en ChatML zero-shot, lejos de modelos especializados de referencia.
- La "pedagogía verificada" cae al 42,40% en MATH-500 y al 53,07% en GSM8K, lo que indica que la explicación paso a paso no es fiable en problemas difíciles.
- Riesgo de alucinación en la narración pedagógica: el resultado numérico puede ser exacto (calculado en pesos) mientras la explicación intermedia contiene errores.
- El mecanismo de ejecución RISC-V en pesos es una innovación experimental sin validación externa; su robustez ante entradas adversariales o expresiones malformadas no está documentada.
- No se especifican la longitud de contexto ni los tipos de cuantización soportados, lo que complica planificar despliegues en producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha; no hay comunidad ni soporte documentado.
- La licencia Apache 2.0 permite uso comercial, pero al ser un derivado de Qwen3.5-9B-Base conviene revisar la licencia del modelo base y las condiciones de atribución.
- El uso de la función `graphcalc` requiere que el runtime respete el formato `<tool_call>`/`<tool_response>`; fuera de ese contrato el comportamiento no está garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DJLougen/Qwen3.5-9B-Math-GraphCalc
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base/blob/main/LICENSE
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset MATH-500: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
- Dataset AIME 2024: https://huggingface.co/datasets/HuggingFaceH4/aime_2024
