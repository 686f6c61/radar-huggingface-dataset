# Elinnos/mistral-7b-elip-bridge-final-v1

## Resumen

Elinnos/mistral-7b-elip-bridge-final-v1 es un adaptador LoRA desarrollado por Einnnos Systems Pvt Limited que especializa el modelo base Mistral-7B-v0.1 en la generación de código SystemVerilog para el diseño de puentes AHB2APB, un componente clave en sistemas de bus AMBA. El modelo resuelve el problema de generar RTL sintetizable, documentado y verificado para la conversión de protocolo entre AHB-Lite y APB, incluyendo aserciones SystemVerilog y cobertura funcional.

La relevancia de este modelo radica en su enfoque de nicho: en lugar de un modelo de propósito general, ofrece una solución específica para diseñadores de hardware que necesitan IPs de puente AHB2APB listas para producción. El adaptador se entrenó sobre un dataset propio de 127 muestras de entrenamiento y 32 de validación, con instrucciones detalladas de 3.700 caracteres promedio y secuencias de hasta 6.144 tokens. El modelo base Mistral-7B-v0.1 tiene 7.000 millones de parámetros y una ventana de contexto de 8.192 tokens.

El adaptador se distribuye bajo licencia Apache-2.0, pesa 0.5 GB y se integra mediante la librería PEFT. Está pensado para flujos de trabajo de diseño de semiconductores, donde la generación automática de RTL con verificación integrada puede acelerar significativamente el desarrollo de IPs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Mistral-7B-v0.1) con adaptador LoRA |
| Parametros totales | 7.000 millones (base) + 41.943.040 entrenables (1,11 %) |
| Parametros activos | 7.000 millones (no es MoE) |
| Longitud de contexto | 8.192 tokens (base); dataset limitado a 6.144 tokens |
| Tipos de cuantizacion | 4-bit NF4 (entrenamiento); inferencia con bfloat16 o 4-bit |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo se basa en Mistral-7B-v0.1, un transformer decoder causal con atención de ventana deslizante (sliding window attention) y normalización RMSNorm. Sobre esta base se aplicó un adaptador LoRA con rango 16 y alpha 32, dirigido a los módulos de atención (q_proj, v_proj, k_proj, o_proj) y a las proyecciones del MLP (gate_proj, up_proj, down_proj). El entrenamiento se realizó con cuantización 4-bit NF4 del modelo base, en precisión mixta FP16, durante 45 pasos con un tamaño de lote efectivo de 8 (lote 2 con acumulación de gradiente). Se usó una tasa de aprendizaje de 5e-05 con scheduler coseno y warmup, y weight decay de 0.01. El hardware de entrenamiento fue una NVIDIA A100-SXM4-40GB.

El dataset de entrenamiento, Elinnos/ahb2apb-bridge-systemverilog, contiene especificaciones completas de puentes AHB2APB con instrucciones enriquecidas (3.700 caracteres promedio) y marcadores de fin de sección para controlar la alucinación. Según la model card, estos marcadores reducen la salida no deseada en aproximadamente un 75 %. El adaptador se inicializó desde un adaptador previo de depuración (mistral-7b-xrun-debug-v3-l1028), lo que sugiere un entrenamiento por etapas.

## Capacidades

- Generacion de codigo SystemVerilog completo para puentes AHB2APB, con estructura de modulo cerrada y documentacion de cabecera.
- Integracion de aserciones SystemVerilog (SVA) y cobertura funcional en el codigo generado.
- Cumplimiento del protocolo AMBA AHB-Lite y APB (AMBA 3.0), incluyendo decodificacion de direcciones para multiples esclavos APB, multiplexacion de respuestas, generacion de strobes de escritura y manejo de errores.
- Soporte de tamanos de transferencia: byte, media palabra y palabra.
- Manejo de estados de espera basados en PREADY y respuestas de error.
- Control de alucinacion mediante marcadores de fin de respuesta (### End of Response ###).
- Capacidad multilingue limitada: el modelo esta entrenado principalmente en ingles tecnico de diseno de hardware.

## Casos de uso

- Generacion de IPs de puente AHB2APB para SoCs: el modelo produce modulos SystemVerilog completos y sintetizables que pueden integrarse directamente en disenos de sistemas en chip, reduciendo el tiempo de desarrollo manual de semanas a horas.
- Verificacion funcional automatizada: el codigo generado incluye aserciones y cobertura funcional, lo que permite su uso en bancos de pruebas UVM o en flujos de verificacion formal sin necesidad de escribir verificadores adicionales.
- Prototipado rapido de interconexiones AMBA: los disenadores pueden generar variantes del puente con distinto numero de esclavos APB (por ejemplo, 8 esclavos) y ancho de datos (32 bits) para evaluar rapidamente diferentes configuraciones de bus.
- Educacion y formacion en diseno RTL: el modelo puede usarse como herramienta didactica para estudiantes de arquitectura de computadores que necesiten ejemplos de implementacion de protocolos AMBA.
- Generacion de documentacion tecnica: ademas del codigo, el modelo produce cabeceras de documentacion y comentarios que describen la funcionalidad de cada bloque, util para mantener la trazabilidad en proyectos de semiconductores.
- Integracion en pipelines de diseno asistido por IA: el adaptador puede combinarse con herramientas de sintesis y simulacion (por ejemplo, Cadence xrun) para automatizar la generacion y depuracion de RTL en flujos CI/CD de diseno de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion que se corta en "Quality Checks: 0/2 passed (0%", sin datos completos. No hay cifras de MMLU, HumanEval ni metricas especificas de generacion de HDL. Se recomienda al usuario realizar sus propias pruebas con el dataset de validacion o con casos de diseno propios.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA es ligero (0.5 GB), pero el modelo base Mistral-7B-v0.1 requiere aproximadamente 14 GB en FP16. Con cuantizacion 4-bit, la VRAM necesaria se reduce a unos 6-8 GB.
- GPU recomendadas: NVIDIA A100 (usada en entrenamiento), H100, RTX 4090 (24 GB) o RTX 3090 (24 GB) para FP16. Para cuantizacion 4-bit, una RTX 3060 de 12 GB o RTX 4070 de 12 GB es suficiente.
- Si cabe en consumer GPU: si, con cuantizacion 4-bit cabe en GPUs de 8-12 GB, aunque la generacion de secuencias largas (hasta 4.000 tokens) puede requerir mas memoria.
- Opciones de despliegue: el adaptador se carga con PEFT sobre el modelo base. Se puede servir con vLLM, TGI o llama.cpp (si se convierte a GGUF). Tambien es compatible con Ollama si se empaqueta el modelo fusionado.
- Latencia y throughput: no disponible. Depende del hardware y del backend de inferencia. En una A100, se espera una generacion de 50-100 tokens/segundo con Mistral-7B en FP16.

## Comparativa con modelos similares

No se dispone de una comparativa directa publicada con otros modelos de generacion de codigo HDL. Como referencia, existen alternativas generalistas como CodeLlama-7B o DeepSeek-Coder-6.7B, que pueden generar Verilog/SystemVerilog pero sin especializacion en puentes AHB2APB. La comparativa no esta disponible por falta de datos de rendimiento del modelo evaluado.

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| Elinnos/mistral-7b-elip-bridge-final-v1 | 7B + LoRA | 8.192 | AHB2APB SystemVerilog | Apache-2.0 |
| CodeLlama-7B | 7B | 16.384 | Codigo general | Llama 2 license |
| DeepSeek-Coder-6.7B | 6.7B | 16.384 | Codigo general | DeepSeek license |

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en puentes AHB2APB; no es adecuado para otros tipos de diseno RTL o tareas de generacion de codigo general.
- El dataset de entrenamiento es pequeno (127 muestras), lo que puede limitar la generalizacion a configuraciones no vistas (por ejemplo, mas de 8 esclavos APB o anchos de datos distintos de 32 bits).
- La model card reporta un control de alucinacion del 75 %, pero no se especifican los metodos de evaluacion ni los casos de fallo restantes.
- Riesgo de alucinacion en la generacion de codigo: el modelo puede producir modulos sintacticamente correctos pero semanticamente incorrectos en configuraciones complejas. Se recomienda verificacion exhaustiva con herramientas de simulacion.
- Limitaciones de idioma: solo soporta ingles tecnico; las instrucciones en otros idiomas pueden degradar la calidad de la salida.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Mistral-7B-v0.1 tiene su propia licencia (Apache-2.0 tambien), por lo que no hay restricciones adicionales conocidas.
- El adaptador se entreno con un warm-start desde otro adaptador de depuracion, lo que puede introducir sesgos no documentados en el comportamiento final.
- No se proporcionan datos de rendimiento en produccion (latencia, throughput, tasa de exito en sintesis), por lo que se recomienda validar antes de integrar en flujos criticos.

## Enlaces

- HuggingFace: https://huggingface.co/Elinnos/mistral-7b-elip-bridge-final-v1
- Repositorio de archivos: https://huggingface.co/Elinnos/mistral-7b-elip-bridge-final-v1/tree/main
- Dataset de entrenamiento: https://huggingface.co/datasets/Elinnos/ahb2apb-bridge-systemverilog
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-v0.1
- Pagina de despliegue en FriendliAI: https://friendli.ai/models/Elinnos/mistral-7b-elip-bridge-final-v1
