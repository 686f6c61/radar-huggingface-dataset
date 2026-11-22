# Experimentlab/olmo2-7b-silicon-rtl-eda

## Resumen

Vigyan-7B-Silicon-RTL-EDA es un adaptador LoRA (Low-Rank Adaptation) desarrollado por ExperimentLab sobre el modelo base abierto OLMo-2-1124-7B de AllenAI. Está especializado en diseño de circuitos digitales: generación de Verilog y SystemVerilog sintetizable, aserciones de verificación formal (SVA) y scripting TCL para herramientas EDA de código abierto como Yosys y OpenROAD. El adaptador se distribuye como pesos PEFT en formato safetensors, con un repositorio de aproximadamente 0,2 GB.

El modelo hereda la arquitectura transformer densa de OLMo-2-1124-7B (7.000 millones de parámetros), por lo que todas las capacidades del modelo base —generación de texto, razonamiento, contexto largo y multilingüismo— permanecen disponibles, pero orientadas mediante el ajuste fino hacia el dominio del semiconductor y el flujo RTL. Es relevante para equipos de diseño de hardware que buscan asistencia especializada en código RTL sin depender de APIs propietarias, aunque su licencia comercial restrictiva condiciona fuertemente su adopción en producción.

La licencia es el punto crítico: se trata de una EULA comercial propietaria de ExperimentLab que permite uso académico, educativo y de evaluación personal sin coste, pero exige un acuerdo comercial para cualquier despliegue en producción o integración empresarial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base OLMo-2-1124-7B) con adaptador LoRA/PEFT |
| Parametros totales | 7.000 millones (modelo base); adaptador LoRA de bajo rango |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base OLMo-2-1124-7B) |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | en (ingles) |
| Licencia | experimentlab-commercial-eula (propietaria; uso academico y personal gratuito, comercial bajo acuerdo) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre OLMo-2-1124-7B, un transformer denso decoder-only de 7.000 millones de parámetros publicado por AllenAI con pesos abiertos. La contribución de ExperimentLab es un ajuste fino mediante LoRA (Low-Rank Adaptation), técnica PEFT que congela los pesos del modelo base e inserta matrices de bajo rango entrenables en las capas de atención y feed-forward. El resultado es un adaptador de pequeño tamaño (repositorio de 0,2 GB) que debe cargarse junto al modelo base original.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Los tags indican especialización en verilog, systemverilog, semiconductor, vlsi y eda, lo que sugiere un corpus de código RTL, aserciones SVA y scripts de flujo EDA, pero no se detalla su volumen ni procedencia. Tampoco se documentan innovaciones técnicas adicionales más allá del propio ajuste LoRA.

## Capacidades

- Generación de Verilog y SystemVerilog sintetizable: máquinas de estados finitos (FSM), pipelines, diseños de ALU y lógica de FIFO asíncrona.
- Generación de aserciones de verificación formal (SVA, IEEE 1800) para demostrar seguridad en cruces de dominio de reloj (CDC), transiciones de bit único en código Gray y cumplimiento de protocolos de bus.
- Generación de scripts TCL para herramientas EDA de código abierto (Yosys, OpenROAD).
- Generación de texto y razonamiento general heredados del modelo base OLMo-2-1124-7B.
- Soporte de conversación multi-turno (pipeline text-generation, conversacional).
- Capacidades multilingües limitadas al inglés según la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Generación de módulos RTL sintetizables: el modelo produce código Verilog/SystemVerilog para bloques como FSM, ALU o FIFO asíncrono, que el ingeniero revisa y valida en simulación antes de síntesis.
- Escritura de aserciones SVA para verificación formal: genera propiedades IEEE 1800 que verifican CDC y protocolos de bus, acelerando la creación de testbenches formales en flujos de verificación.
- Automatización de scripts TCL para Yosys y OpenROAD: el modelo redacta scripts de síntesis y place-and-route para flujos EDA abiertos, reduciendo el tiempo de configuración de toolchains.
- Asistencia en docencia universitaria de diseño digital: al permitir uso académico gratuito, sirve como tutor de generación de RTL y explicación de conceptos de VLSI en cursos.
- Prototipado rápido de bloques de hardware: equipos de diseño pueden generar borradores de módulos y refinarlos, usando el adaptador como punto de partida en lugar de escribir desde cero.
- Exploración de alternativas de diseño: el modelo propone variantes de implementación (por ejemplo, distintas codificaciones de FSM) que el ingeniero compara antes de fijar la arquitectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador LoRA sobre un base de 7B, los requisitos son los del modelo base. En FP16 se estiman aproximadamente 14-16 GB de VRAM; en cuantización de 8 bits, alrededor de 8 GB; en 4 bits, en torno a 4-6 GB. Estas cifras son estimaciones estándar para un transformer denso de 7B, no datos publicados por el autor.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para FP16 sin cuantizar; RTX 3090/4090 o GPUs consumer de 8-12 GB con cuantización.
- Cabe en GPU consumer: sí, en RTX 4090 en FP16 y en GPUs de 8 GB con cuantización de 4-8 bits.
- Opciones de despliegue: transformers + PEFT (flujo documentado en la model card); vLLM, llama.cpp, Ollama o TGI requerirían fusionar el adaptador con el base o convertir los pesos, ya que el adaptador se distribuye como PEFT safetensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vigyan-7B-Silicon-RTL-EDA | 7B (base) + LoRA | no disponible | RTL/Verilog/EDA | EULA comercial propietaria | Hugging Face (adaptador PEFT) |
| OLMo-2-1124-7B (base) | 7B | no disponible en la informacion | Generalista | Abierta (AllenAI) | Hugging Face |
| Alternativas especializadas en Verilog/EDA | no disponible | no disponible | RTL/EDA | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con modelos competidores en el dominio RTL.

## Limitaciones y advertencias

- Licencia restrictiva: la EULA comercial de ExperimentLab prohíbe el despliegue comercial, la reventa cerrada o la integración empresarial sin un acuerdo de licencia comercial con la empresa. Esto limita seriamente su uso en producción.
- Solo inglés: la model card declara únicamente el idioma inglés, lo que excluye interacción en castellano u otros idiomas.
- Riesgo de alucinación: como todo modelo generativo, puede producir código RTL sintácticamente plausible pero no sintetizable o funcionalmente incorrecto; requiere validación en simulación y síntesis.
- Dependencia del modelo base: el adaptador no funciona de forma autónoma; debe cargarse junto a OLMo-2-1124-7B, lo que añade complejidad de despliegue y requisitos de VRAM.
- Documentación escasa: no se publican datos de entrenamiento, benchmarks ni métricas de calidad, lo que impide evaluar su rendimiento de forma objetiva.
- Sesgos conocidos: no documentados en la información disponible; hereda los sesgos del modelo base.
- Adopción limitada: 25 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Experimentlab/olmo2-7b-silicon-rtl-eda
- Modelo base OLMo-2-1124-7B: https://huggingface.co/allenai/OLMo-2-1124-7B
- Portal de licencias: https://experimentlab.in/licensing
- Portal empresarial: https://experimentlab.in
- Demo en Colab: https://colab.research.google.com/gist/shreyansh001boy-tech/d7e16e7f902372db11ba5b9490f28adf/colab_demo_olmo2_silicon_rtl.ipynb
- Contacto de licencias: support@experimentlab.in
- Contacto del fundador: shreyansh@experimentlab.in
