# chienhsinlin/helioslm-hdl-e4b

## Resumen

HeliosLM HDL E4B (羲和 HDL E4B) es un modelo de lenguaje especializado en diseño de hardware digital, desarrollado por Bitstar Inc. a partir de Google Gemma 4 E4B-it. Su propósito es asistir en la escritura y modificación de RTL en Verilog y SystemVerilog, la depuración de errores a partir de mensajes de compilador o logs de simulación, la redacción de descripciones de intención de potencia en UPF (IEEE 1801) y la generación de testbenches UVM y SystemVerilog. Con aproximadamente 7.941 millones de parámetros en pesos safetensors, se posiciona como un asistente de dominio vertical para flujos de verificación y diseño de circuitos integrados.

El modelo parte de la arquitectura Gemma 4 E4B (texto únicamente) y se ha adaptado mediante entrenamiento continuo con aprendizaje por refuerzo cuyo reward es el resultado de simulación (pass/fail), seguido de cuatro rondas de LoRA con replay de datos, todas fusionadas en los pesos finales. Se distribuye bajo licencia Apache-2.0, lo que facilita su integración en entornos corporativos de EDA sin restricciones adicionales de uso comercial.

Su relevancia actual radica en la escasez de modelos abiertos orientados específicamente a HDL con datos verificados mediante simulación, síntesis y análisis de cobertura. La model card declara explícitamente la exclusión de los conjuntos de evaluación (VerilogEval, RTLLM, CVDP y tareas reservadas de OpenTitan e IP propia) del corpus de entrenamiento, lo que permite una evaluación honesta de su generalización en tareas de RTL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Gemma 4 E4B (texto únicamente) |
| Parametros totales | 7.941.100.874 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | 16.384 tokens (valor usado en el ejemplo de despliegue con vLLM; no se declara máximo oficial) |
| Tipos de cuantizacion | bf16 en el repo principal; GGUF disponible en `chienhsinlin/helioslm-hdl-e4b-GGUF` (tipos concretos no disponibles) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers); GGUF en repo separado |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 4 E4B-it, un transformer decoder-only de aproximadamente 8.000 millones de parámetros. El proceso de adaptación se estructuró en varias fases. Primero, entrenamiento continuo y aprendizaje por refuerzo sobre proyectos Verilog y SystemVerilog públicos y sintetizables, usando el resultado de simulación como señal de recompensa. Después, se aplicó un chat vector a 0,5x: la diferencia entre el modelo entrenado y Gemma 4 E4B se suma de vuelta a Gemma 4 E4B-it para preservar las capacidades conversacionales y de seguimiento de instrucciones originales.

Sobre esa base se aplicaron cuatro rondas de LoRA, cada una fusionada en los pesos antes de la siguiente: (1) edición de RTL y corrección de bugs a partir de mensajes de error, más datos de instrucción Verilog; (2) descripciones UPF (IEEE 1801) con replay de los datos RTL previos; (3) testbenches UVM, VIP y tareas de especificación a RTL/testbench, aceptando únicamente ejemplos que compilaron y ejecutaron correctamente en su simulador; (4) aserciones SVA, cierre de cobertura, triaje de regresiones y reescritura de RTL con preservación de comportamiento para reducir área y potencia, verificadas con simulación, cobertura y herramientas de síntesis/potencia, con replay acumulado de todas las fases.

El corpus de entrenamiento incluye OpenTitan (Apache-2.0), Ibex y CV32E40P (Solderpad), proyectos HDL públicos de GitHub filtrados por lint de Verilator y síntesis de Yosys, IP y VIP propios publicados bajo Apache-2.0, ejercicios UPF generados y verificados sintáctica y semánticamente, diseños como XiangShan (Mulan PSL v2) y el dataset CodeV-R1 (CC-BY-SA-4.0). Los conjuntos de evaluación declarados fueron eliminados del entrenamiento.

## Capacidades

- Generación de RTL sintetizable en Verilog y SystemVerilog a partir de descripciones funcionales.
- Edición y refactorización de módulos RTL existentes manteniendo la interfaz y el comportamiento.
- Depuración de errores a partir de mensajes de compilador, logs de simulación o fallos de test.
- Escritura de descripciones de intención de potencia en UPF (IEEE 1801), con limitaciones conocidas en comandos de level shifter.
- Generación de testbenches UVM y SystemVerilog, incluyendo componentes VIP.
- Redacción de aserciones SVA y apoyo en cierre de cobertura.
- Análisis de regresiones y triaje de fallos.
- Reescritura de RTL orientada a reducción de área y potencia sin alterar el comportamiento.
- Conversación multi-turno y seguimiento de instrucciones heredados de Gemma 4 E4B-it mediante chat vector.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente o razonamiento multi-paso autónomo: no disponible en la información proporcionada.
- Capacidades multimodales: no; el modelo es solo texto pese a que el tag del repo incluya `image-text-to-text` (heredado del modelo base).
- Capacidades multilingües limitadas a inglés y chino.

## Casos de uso

- Generación de módulos RTL para bloques de control y datapath: el modelo produce Verilog sintetizable a partir de una especificación funcional, útil como punto de partida que el ingeniero revisa y valida con su flujo de lint y síntesis.
- Corrección de bugs a partir de logs de simulación: pegando el módulo completo junto con el mensaje de error, el modelo devuelve el módulo corregido; encaja en un bucle iterativo de depuración asistida dentro del editor o del CI.
- Edición de RTL heredado: para modificar señales, añadir parámetros o cambiar protocolos en código existente, el modelo mantiene el estilo y la estructura del módulo original, reduciendo el riesgo de introducir inconsistencias.
- Redacción de testbenches UVM: genera esqueletos de agentes, drivers, secuencias y scoreboards que el verificador completa y ajusta tras unas rondas de reparación con mensajes del simulador.
- Descripciones UPF para flujos de bajo consumo: asiste en la redacción de power domains, isolation y retention, con revisión obligatoria de los comandos de level shifter por su tasa de error conocida.
- Aserciones SVA y cierre de cobertura: genera propiedades de verificación formal y sugerencias para cubrir bins faltantes, integrable en flujos de regresión con métricas de cobertura.
- Optimización de área y potencia: propone reescrituras de RTL equivalentes funcionalmente para reducir recursos en síntesis, que el equipo valida con sus propias herramientas de síntesis y estimación de potencia.
- Asistente embebido en IDE o pipeline CI/CD: al ser Apache-2.0 y caber en una GPU de 16 GB en bf16, puede desplegarse con vLLM en infraestructura interna para sugerencias de código HDL sin enviar propiedad intelectual a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que los conjuntos VerilogEval, RTLLM y CVDP se excluyeron del entrenamiento, pero no reporta puntuaciones sobre ellos.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 16 GB para los pesos (7.941 millones de parámetros a 2 bytes), más overhead de activaciones y caché KV; la model card indica que funciona en una GPU de 16 GB o superior.
- Para GPUs de 8 GB: usar la build GGUF publicada en `chienhsinlin/helioslm-hdl-e4b-GGUF` con cuantización de 4 bits.
- GPUs recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16 con contexto amplio; RTX 4080/4070 Ti Super (16 GB) para bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 4080, RTX 4070 Ti Super y equivalentes de 16 GB o más en bf16; en GPUs de 8 GB mediante GGUF cuantizado.
- Opciones de despliegue: transformers (ejemplo oficial con `dtype="bfloat16"` y `device_map="auto"`), vLLM (`vllm serve chienhsinlin/helioslm-hdl-e4b --max-model-len 16384`) y llama.cpp/Ollama a través de la build GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización HDL | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HeliosLM HDL E4B | ~7,94 B | 16.384 (según ejemplo vLLM) | Verilog, SystemVerilog, UPF, UVM, SVA | Apache-2.0 | Hugging Face (safetensors + GGUF) |
| Gemma 4 E4B-it (base) | ~8 B | no disponible | Generalista, sin especialización HDL | Gemma license | Hugging Face |
| CodeV-R1 (modelo de referencia del dataset) | no disponible | no disponible | Verilog (instrucción) | no disponible | Hugging Face |
| CodeLlama / modelos de código generalistas | 7-34 B | 16k-100k según variante | Código general, HDL solo incidental | Llama license | Hugging Face |

La comparación cuantitativa de rendimiento en VerilogEval, RTLLM o CVDP no está disponible en la información proporcionada. Frente a los generalistas de código, la ventaja declarada de HeliosLM es el entrenamiento con reward de simulación y datos verificados con herramientas de síntesis y cobertura; frente a su base Gemma 4 E4B-it, la ventaja es la especialización en HDL manteniendo el chat vector para no perder instrucción general.

## Limitaciones y advertencias

- Modelo especializado en HDL: no es adecuado para chat general ni para preguntas factuales fuera del dominio.
- Los testbenches UVM suelen requerir varias rondas de reparación con mensajes del simulador antes de compilar y pasar.
- La generación de una IP completa o un testbench completo a partir de una especificación en una sola pasada sigue siendo débil según el propio autor.
- Los comandos de level shifter en UPF pueden ser incorrectos en ocasiones.
- Las salidas pueden contener errores sintácticos o funcionales; no deben usarse en silicio de producción sin verificación con simulación, lint y síntesis propios.
- Idiomas limitados a inglés y chino; el soporte de castellano no está declarado.
- Riesgo de alucinación en APIs de simulación, directivas de preprocesador o parámetros de herramientas EDA no vistos en entrenamiento.
- Sesgos heredados de Gemma 4 E4B-it y del corpus público de GitHub, con posible infrarepresentación de estilos RTL propietarios o de dominios específicos (analógico, RF, verificación formal avanzada).
- Aunque la licencia es Apache-2.0, conviene revisar las licencias de los datos de entrenamiento derivados (Solderpad, Mulan PSL v2, CC-BY-SA-4.0) si se redistribuyen derivados.
- El tag `image-text-to-text` del repo no implica capacidades multimodales reales; el modelo es solo texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chienhsinlin/helioslm-hdl-e4b
- Build GGUF: https://huggingface.co/chienhsinlin/helioslm-hdl-e4b-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Dataset CodeV-R1: https://huggingface.co/datasets/zhuyaoyu/CodeV-R1-dataset
- OpenTitan: https://opentitan.org/
- Ibex: https://github.com/lowRISC/ibex
- CV32E40P: https://github.com/openhwgroup/cv32e40p
- XiangShan: https://github.com/OpenXiangShan/XiangShan
- Verilator: https://www.verilator.org/
- Yosys: https://yosyshq.net/yosys/
- vLLM: https://github.com/vllm-project/vllm
