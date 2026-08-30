# JamieBradfield/qwen3.8-9b-hermes-fc-balanced-GGUF

## Resumen

El modelo `JamieBradfield/qwen3.8-9b-hermes-fc-balanced-GGUF` es una cuantización GGUF con kernels ROCmFP4 del fine-tune `qwen3.8-9b-hermes-fc-balanced`, un ajuste del modelo Qwen3.8-9B orientado a function calling y uso de herramientas. Desarrollado por JamieBradfield, este modelo está pensado para ejecutarse en GPUs AMD RDNA3 (serie RX 7000) mediante el fork `llama-rocmfpx` de llama.cpp, aprovechando la aceleración ROCm 7.1. Con 9.195 millones de parámetros (9,2B), ofrece una ventana de contexto de 245.760 tokens según la configuración de servicio recomendada, lo que lo hace adecuado para tareas que requieren conversaciones largas o procesamiento de documentos extensos.

La relevancia de este modelo radica en su especialización en function calling, una capacidad crítica para agentes autónomos y asistentes que necesitan interactuar con APIs y herramientas externas. Al estar cuantizado con ROCmFP4, permite ejecutar un modelo de 9B en hardware AMD de consumo sin sacrificar demasiada precisión, algo poco común en un ecosistema dominado por optimizaciones para NVIDIA. La licencia Apache-2.0 facilita su uso comercial y su integración en productos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.8-9B) |
| Parametros totales | 9.195.119.616 (9,2B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 245.760 tokens (configuracion de servicio recomendada) |
| Tipos de cuantizacion | Q4_0_ROCMFP4_FAST |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base. Se sabe que es un fine-tune de Qwen3.8-9B, una serie de modelos de lenguaje de la familia Qwen, y que el autor realizo un merge de pesos (BF16) antes de cuantizar. El proceso de cuantizacion se llevo a cabo con el fork `llama-rocmfpx`, convirtiendo primero los safetensors a GGUF en BF16 y luego aplicando la cuantizacion Q4_0_ROCMFP4_FAST. El modelo conserva la cabeza MTP (Multi-Token Prediction) de 15 claves, lo que sugiere que el modelo base incorpora decodificacion especulativa. No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens utilizados o si se aplicaron tecnicas como RLHF o DPO.

## Capacidades

- Generacion de texto en ingles con razonamiento contextual.
- Function calling y tool use: el modelo esta especificamente afinado para invocar funciones externas de forma estructurada.
- Soporte de agentes: al poder llamar herramientas, puede integrarse en flujos multi-paso donde el modelo decide que funcion ejecutar y procesa los resultados.
- Ventana de contexto larga (245K tokens) que permite manejar conversaciones extensas o documentos grandes en una sola pasada.
- Compatibilidad con ROCmFP4: optimizado para inferencia en GPUs AMD RDNA3, aunque el GGUF puede convertirse para otros backends.

## Casos de uso

- Asistentes virtuales con integracion de APIs: el modelo puede gestionar conversaciones multi-turno y realizar llamadas a servicios externos (clima, calendario, bases de datos) gracias a su capacidad de function calling.
- Automatizacion de tareas empresariales: uso en pipelines que requieren extraer informacion, actualizar registros o enviar notificaciones mediante llamadas a funciones.
- Agentes de soporte tecnico: con su contexto de 245K tokens, puede mantener el historial completo de una incidencia larga y consultar herramientas internas para resolver problemas.
- Generacion de codigo con herramientas: puede invocar funciones de un IDE o CLI para ejecutar pruebas, formatear codigo o consultar documentacion.
- Procesamiento de documentos extensos: analisis de contratos, informes o articulos largos donde se necesita mantener el contexto completo y extraer datos mediante llamadas a funciones de parsing.
- Chatbots de atencion al cliente en ingles: despliegue en entornos AMD con ROCm, ofreciendo respuestas contextuales y capacidad de transaccionar con sistemas de ticketing o CRM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- GPU AMD RDNA3 (serie RX 7000) con soporte ROCm 7.1 o superior.
- VRAM estimada: no disponible oficialmente, pero para un modelo de 9,2B en Q4_0 se espera un uso de aproximadamente 5-6 GB, aunque la cuantizacion ROCmFP4 puede variar ligeramente.
- Inferencia mediante el fork `llama-rocmfpx` de llama.cpp, con flags como `--ctx-size 245760 --n-gpu-layers 99 --flash-attn on -ctk q8_0 -ctv turbo3`.
- No se recomienda para GPUs NVIDIA sin conversion previa del GGUF a un formato estandar (por ejemplo, Q4_0 normal).
- Alternativas de despliegue: llama.cpp (con ROCm), o conversion a otros formatos para vLLM u Ollama, aunque no se ha probado oficialmente.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos de la misma categoria. El modelo base Qwen3.8-9B podria compararse con otros modelos de 9B como Llama 3.1 8B o Mistral 7B, pero no hay datos de rendimiento publicados para este fine-tune especifico.

## Limitaciones y advertencias

- Modelo cuantizado: la cuantizacion Q4_0_ROCMFP4 puede introducir perdida de precision en tareas de razonamiento complejo o generacion de codigo.
- Orientado exclusivamente a hardware AMD RDNA3: fuera de este entorno, el archivo GGUF no es directamente utilizable sin reconversion.
- Idioma limitado: solo soporta ingles, lo que restringe su uso en aplicaciones multilingues.
- Sin informacion sobre sesgos o alucinaciones: al no haber evaluaciones publicas, se desconoce el comportamiento en escenarios de alto riesgo.
- La ventana de contexto de 245K tokens es una configuracion de servicio, no necesariamente el maximo soportado por el modelo base; usarla requiere suficiente VRAM y puede aumentar la latencia.
- No se garantiza compatibilidad con versiones estandar de llama.cpp; se requiere el fork especifico `llama-rocmfpx`.

## Enlaces

- [Modelo GGUF en HuggingFace](https://huggingface.co/JamieBradfield/qwen3.8-9b-hermes-fc-balanced-GGUF)
- [Modelo base (fine-tune)](https://huggingface.co/JamieBradfield/qwen3.8-9b-hermes-fc-balanced)
- [Repositorio oficial de Qwen3.8](https://github.com/QwenLM/Qwen3.8)
- [Variante anterior: qwen3.8-9b-hermes-function-calling-v1-GGUF](https://huggingface.co/JamieBradfield/qwen3.8-9b-hermes-function-calling-v1-GGUF)
- [Variante con trazas reales: qwen3.8-9b-hermes-fc-real-traces](https://huggingface.co/JamieBradfield/qwen3.8-9b-hermes-fc-real-traces)
