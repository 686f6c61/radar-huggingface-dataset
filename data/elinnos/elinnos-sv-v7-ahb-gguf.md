# Elinnos/elinnos-sv-v7-ahb-GGUF

## Resumen

ELINNOS SV-v7-AHB es un modelo de lenguaje especializado en diseño de hardware digital, desarrollado por Elinnos como parte de la serie ELINNOS (Electronic Language Intelligence for Neural Network-Optimized Systems). Se trata de un fine-tuning incremental sobre Qwen2.5-7B-Instruct, orientado a tareas de diseño VLSI/RTL, generación de código SystemVerilog, protocolo AMBA AHB y flujos de trabajo Pulse HDL. Este repositorio concreto contiene las versiones cuantizadas en formato GGUF del modelo fusionado `elinnos-sv-v7-ahb-merged`, pensadas para despliegue local eficiente con llama.cpp, Ollama o llama-cpp-python.

El modelo resuelve el problema de generar código RTL correcto y específico de dominio sin depender de modelos generalistas que producen SystemVerilog genérico o incorrecto. Su relevancia actual radica en la creciente demanda de asistentes de IA para diseño de chips, donde la precisión sintáctica y semántica del código generado es crítica. Con 7,6 mil millones de parámetros y una arquitectura transformer estándar, ofrece un equilibrio entre capacidad y requisitos de hardware asequibles, especialmente en sus versiones cuantizadas.

La cadena de adaptadores LoRA (v3 → v4 → v5 → v6 → v7) fusionados sobre el modelo base indica un proceso de refinamiento iterativo, con una pérdida de evaluación final de 0,5408 tras 4 épocas. El repositorio GGUF incluye tres niveles de cuantización (Q4_K_M, Q8_0 y F16) para adaptarse a diferentes capacidades de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5-7B-Instruct base) |
| Parametros totales | 7.615.616.512 (7,6B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la model card; los ejemplos de uso emplean 8192 tokens |
| Tipos de cuantizacion | Q4_K_M (~4,4 GB), Q8_0 (~7,6 GB), F16 (~15 GB) |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (convertido desde safetensors con llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only con normalización RMSNorm, atención con sesgo de atención (attention bias) y ventana de contexto ampliada. Sobre esta base se aplicó un fine-tuning mediante LoRA con rango r=96 y alpha α=192, atacando las proyecciones q, k, v, o, gate, up y down del bloque transformer. La cadena de adaptadores se entrenó de forma incremental (v3 → v4 → v5 → v6 → v7) y posteriormente se fusionaron en un único modelo denso (`elinnos-sv-v7-ahb-merged`).

El entrenamiento se realizó durante 4 épocas, alcanzando una pérdida de evaluación de 0,5408. No se especifica el tamaño ni la composición del dataset de entrenamiento, aunque por el dominio de especialización se infiere que incluye código SystemVerilog, especificaciones AMBA AHB y documentación técnica de diseño de hardware. La conversión a GGUF se realizó con las herramientas estándar de llama.cpp (`convert_hf_to_gguf.py` y `llama-quantize`), lo que garantiza compatibilidad con el ecosistema de inferencia local.

## Capacidades

- Generacion de codigo SystemVerilog para diseno RTL, incluyendo modulos, interfaces y bancos de pruebas.
- Diseno de componentes del protocolo AMBA AHB: slaves, masters, bus matrix, arbitros y decodificadores de direcciones.
- Asistencia en flujos de trabajo VLSI, desde especificacion de alto nivel hasta implementacion RTL.
- Soporte para el flujo Pulse HDL, un lenguaje de descripcion de hardware de alto nivel.
- Razonamiento sobre protocolos de bus y arquitecturas de sistemas en chip (SoC).
- Conversacion tecnica multi-turno con contexto de hasta 8192 tokens (segun los ejemplos de uso).
- Generacion de documentacion tecnica y explicaciones sobre diseno de hardware.

No se mencionan capacidades de tool calling, agentes, vision ni audio. El modelo es exclusivamente de texto.

## Casos de uso

- Diseno de slaves AHB-Lite con registros: el modelo puede generar un slave completo con 4 registros de lectura/escritura, incluyendo la maquina de estados FSM y la logica de decodificacion, como se muestra en el ejemplo de la model card.
- Generacion de bus matrix AHB: a partir de una especificacion como "2 masters y 3 slaves", el modelo produce la interconexion, el arbitraje y el mapeo de direcciones.
- Verificacion de modulos SystemVerilog: puede generar bancos de pruebas (testbenches) con aserciones SVA y cobertura funcional para validar disenos RTL existentes.
- Asistencia en diseno RTL para VLSI: integrado en entornos de desarrollo como VS Code o scripts de linea de comandos, ayuda a escribir codigo sintetizable y evitar construcciones no sintetizables.
- Documentacion tecnica de protocolos AMBA: genera descripciones precisas de interfaces, temporizaciones y requisitos de cumplimiento para manuales de diseno.
- Despliegue local en entornos sin conexion: gracias a las cuantizaciones GGUF, puede ejecutarse en portatiles con GPU consumer o incluso en CPU, ideal para laboratorios con restricciones de seguridad.
- Integracion en pipelines de CI/CD: mediante llama-cpp-python, puede automatizar la generacion de esqueletos RTL en repositorios de diseno, reduciendo el trabajo manual repetitivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la perdida de evaluacion (eval_loss=0,5408) durante el entrenamiento, pero no hay datos de MMLU, HumanEval, GSM8K ni metricas especificas de generacion de codigo hardware. Tampoco se proporcionan comparaciones con otros modelos especializados en diseno de hardware.

## Requisitos de hardware

- Cuantizacion Q4_K_M (~4,4 GB): cabe en GPUs consumer con 6-8 GB de VRAM, como RTX 3060, RTX 4060 o RTX 2070. Tambien puede ejecutarse en CPU con 8 GB de RAM.
- Cuantizacion Q8_0 (~7,6 GB): requiere al menos 8-12 GB de VRAM, adecuada para RTX 3080, RTX 4070 o A10.
- Cuantizacion F16 (~15 GB): necesita 16-24 GB de VRAM, como RTX 4090, A100 o H100.
- Opciones de despliegue: llama.cpp (CLI), Ollama (comando `ollama run pkelinnos/elinnos-sv-v7-ahb`), llama-cpp-python para integracion en Python, y FriendliAI para inferencia en la nube.
- Latencia y throughput: no se han publicado mediciones. En una RTX 4090 con Q4_K_M, se puede esperar una generacion de 30-50 tokens por segundo, pero estos valores son estimaciones no verificadas.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especificos en el dominio de diseno de hardware con SystemVerilog y AMBA AHB. El modelo base Qwen2.5-7B-Instruct es un modelo generalista de 7B parametros con licencia Apache-2.0, pero no existen datos publicados que comparen este fine-tuning con alternativas como CodeLlama, DeepSeek-Coder o modelos especializados en EDA. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente en ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- Su especializacion en diseno de hardware puede degradar el rendimiento en tareas generales de generacion de texto o codigo fuera de ese dominio.
- Riesgo de alucinacion en codigo complejo: aunque la perdida de evaluacion es baja, no hay benchmarks publicados que verifiquen la correccion sintactica y funcional del SystemVerilog generado en produccion.
- La longitud de contexto no esta documentada oficialmente; los ejemplos usan 8192 tokens, pero el modelo base Qwen2.5 soporta hasta 128K, por lo que el limite real depende de la configuracion de inferencia.
- La licencia Apache-2.0 permite uso comercial, pero es responsabilidad del usuario verificar que el modelo base Qwen2.5-7B-Instruct cumple con los mismos terminos (asi es, tambien Apache-2.0).
- No se proporcionan garantias de sintetizabilidad del codigo generado; se recomienda revision manual por ingenieros de diseno antes de su uso en flujos de produccion.
- El repositorio tiene solo 20 descargas y 0 likes, lo que sugiere una adopcion limitada y poca validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/Elinnos/elinnos-sv-v7-ahb-GGUF
- Modelo base fusionado: https://huggingface.co/Elinnos/elinnos-sv-v7-ahb-merged
- Modelo original (model card completa): https://huggingface.co/Elinnos/elinnos-sv-v7-ahb
- Entrada en Ollama: https://ollama.com/pkelinnos/elinnos-sv-v7-ahb:latest
- Inferencia en FriendliAI: https://friendli.ai/models/Elinnos/elinnos-sv-v7-ahb
- Organizacion en GitHub: https://github.com/elinnos
