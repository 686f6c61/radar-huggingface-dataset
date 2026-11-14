# mlc-ai/SmolLM3-3B-q4f32_1-MLC

## Resumen

SmolLM3-3B-q4f32_1-MLC es una distribucion cuantizada del modelo SmolLM3-3B de Hugging Face, empaquetada en formato MLC (Machine Learning Compilation) por el equipo de mlc-ai para su ejecucion en el navegador mediante WebLLM. El modelo subyacente, SmolLM3-3B, es un transformer decoder-only de 3.000 millones de parametros disenado por HuggingFaceTB como modelo pequeno de proposito general con capacidades de razonamiento.

Esta variante concreta emplea la cuantizacion `q4f32_1`, que combina pesos en 4 bits con activaciones en punto flotante de 32 bits para mantener la fidelidad numerica sin requerir la extension WebGPU `shader-f16`. El paquete esta configurado con una ventana de contexto de 65.536 tokens y un tamano de chunk de prefill de 1.024 tokens, aunque la configuracion por defecto de WebLLM limita el contexto a 4.096 tokens para controlar el consumo de memoria.

Su relevancia radica en que permite ejecutar un modelo de 3B con razonamiento activado directamente en el navegador del cliente, sin backend ni GPU dedicada, lo que habilita aplicaciones de privacidad por diseno y prototipado rapido. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM3) |
| Parametros totales | 3.000 millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens (configuracion del paquete); 4.096 por defecto en WebLLM |
| Tipos de cuantizacion | q4f32_1 (pesos 4 bits, activaciones f32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLC (compilado para WebGPU); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo subyacente SmolLM3-3B es un transformer decoder-only de 3.000 millones de parametros. La model card de esta distribucion no detalla la composicion del dataset de entrenamiento, el numero de tokens ni si se aplicaron tecnicas de RLHF o DPO; esa informacion corresponde a la model card upstream de HuggingFaceTB, que no se incluye en la informacion proporcionada.

La innovacion tecnica de este paquete es la conversion a formato MLC con cuantizacion `q4f32_1`, que evita depender de `shader-f16` en WebGPU. El paquete incluye una plantilla de conversacion (`smollm3`) que mantiene el modo de razonamiento activado por defecto (el valor por defecto de Hugging Face). Desactivar el razonamiento requiere regenerar el paquete con `--conv-template smollm3_nothink`; los modificadores `/think`, `/no_think` y `/system_override` de la plantilla original no tienen efecto en este paquete. Ademas, la plantilla omite la linea de fecha actual que el template upstream escribe en el system prompt. Los valores de muestreo por defecto son temperatura 0.6 y top_p 0.95, tomados de `generation_config.json`.

## Capacidades

- Generacion de texto autoregresiva en el navegador mediante WebLLM y WebGPU.
- Razonamiento activado por defecto (modo "thinking" del modelo base).
- Ventana de contexto configurable hasta 65.536 tokens, con prefill por chunks de 1.024 tokens.
- Ejecucion en cliente sin backend, lo que permite privacidad por diseno.
- Compatibilidad con WebGPU candidatos `v0_2_87` y runtime web `0.28.0-dev2`.
- Soporte de tool calling, agentes, vision o audio: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes conversacionales en navegador: el paquete permite mantener conversaciones multi-turno con contexto de hasta 65.536 tokens (4.096 por defecto en WebLLM) sin enviar datos a un servidor, adecuado para aplicaciones sensibles a la privacidad.
- Prototipado de aplicaciones de IA sin infraestructura: un desarrollador puede integrar generacion de texto en una web estatica con WebLLM, sin desplegar GPUs ni endpoints.
- Educacion y demos interactivas: permite mostrar razonamiento paso a paso en el navegador con el modo thinking activado por defecto, util para tutoriales y laboratorios.
- Procesamiento de documentos largos en cliente: con la ventana de 65.536 tokens configurada, se pueden resumir o analizar documentos extensos localmente, aunque el limite por defecto de 4.096 tokens en WebLLM restringe el uso practico salvo que se ajuste.
- Herramientas de escritura offline-first: integracion en editores web que requieren asistencia de redaccion sin conexion persistente, gracias a la ejecucion local en el navegador.
- Evaluacion comparativa de modelos pequenos: util para investigadores que quieren medir latencia y calidad de un 3B cuantizado en hardware consumer con WebGPU, sin montar un stack de inferencia.
- Chatbots embebidos en productos SaaS: al no requerir `shader-f16`, amplia la compatibilidad con dispositivos WebGPU que no exponen esa extension.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 1,7 GB, lo que da una idea del tamano de pesos; la VRAM efectiva depende del contexto configurado y del runtime WebGPU. No se dispone de cifra oficial en la informacion proporcionada.
- GPU recomendadas: cualquier GPU con soporte WebGPU; el paquete no requiere `shader-f16`, lo que amplia la compatibilidad. No se especifican modelos concretos en la informacion disponible.
- Cabe en GPU consumer: si, al ser un modelo de 3B en 4 bits y ejecutarse en navegador; no se detallan modelos concretos.
- Opciones de despliegue: WebLLM (runtime web `0.28.0-dev2`), MLC-LLM para conversion y generacion de configuracion. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|
| SmolLM3-3B-q4f32_1-MLC | 3B | 65.536 (4.096 por defecto en WebLLM) | Apache 2.0 | MLC / WebLLM en navegador |
| SmolLM3-3B (upstream) | 3B | no disponible en esta ficha | Apache 2.0 | safetensors / servidor o local |
| Alternativas de 3B en navegador | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- El modo de razonamiento esta activado por defecto y no puede desactivarse con `enable_thinking`; requiere regenerar el paquete con `--conv-template smollm3_nothink`.
- Los modificadores `/think`, `/no_think` y `/system_override` de la plantilla upstream no funcionan en este paquete.
- La plantilla omite la linea de fecha actual en el system prompt, lo que puede afectar a tareas que dependan de la fecha.
- El contexto por defecto en WebLLM es de 4.096 tokens, muy inferior al maximo de 65.536; usarlo completo exige ajustar la configuracion y aumenta el consumo de memoria.
- Requiere un navegador con WebGPU; la compatibilidad depende del dispositivo y del runtime.
- Riesgo de alucinacion y sesgos: no se detallan en la informacion proporcionada; se remite a la model card upstream.
- Idiomas soportados: no disponible; verificar antes de desplegar en produccion multilingue.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar la model card upstream para condiciones adicionales.

## Enlaces

- Hugging Face: https://huggingface.co/mlc-ai/SmolLM3-3B-q4f32_1-MLC
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Revision del modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B/tree/a07cc9a04f16550a088caea529712d1d335b0ac1
- Documentacion de WebLLM: https://webllm.mlc.ai/docs/
- Procedencia de librerias WebGPU: https://github.com/JCNTH/binary-mlc-llm-libs/blob/d30ec58c9b0b211a2626ab708a408c7bd59a8369/web-llm-models/v0_2_87/new-models-candidate-provenance.json
- Commit de MLC-LLM para conversion: https://github.com/JCNTH/mlc-llm/commit/5e824377af7fc959d989ddc52dd44a55c7638f49
- Commit base de TVM: https://github.com/akaashrp/tvm/commit/be03dc94b001269b88ae010d2ac352256be55579
