# DidulaThavishaPro/gemma4_1-0-8_grpo_only_b8_parity_seed3_checkpoint_30_lora

## Resumen

Este repositorio contiene un adaptador LoRA de bajo rango (rank 16, alpha 32) sobre el modelo `didula-wso2/gemma4_1-0-8_sft_16bit_vllm`, que a su vez es un ajuste fino supervisado (SD-SFT) del modelo Gemma 4 E4B orientado a la generacion de codigo en el lenguaje de programacion Ballerina. El adaptador se ha entrenado exclusivamente con aprendizaje por refuerzo online mediante GRPO (Group Relative Policy Optimization), partiendo del modelo SFT y descartando los grupos de prompts en los que ningun programa generado compilaba o pasaba las pruebas.

El modelo resuelve un problema muy concreto: mejorar la capacidad de un modelo pequeno (la variante E4B de Gemma 4) para producir codigo Ballerina correcto y funcional, un lenguaje de nicho con escasa representacion en los corpus de preentrenamiento. La relevancia es acotada pero clara para quien trabaje con Ballerina o quiera estudiar tecnicas de RL aplicadas a generacion de codigo en dominios de baja frecuencia.

El artefacto publicado es unicamente el adaptador (0,2 GB), no los pesos completos, y esta etiquetado con la licencia `gemma` heredada del modelo base. No se dispone de informacion sobre el contexto, la composicion del dataset de entrenamiento ni resultados de evaluacion en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Gemma 4 E4B (arquitectura del base no detallada) |
| Parametros totales | no disponible (adaptador LoRA rank 16, alpha 32; el base es Gemma 4 E4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base referenciado es de 16 bits) |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors (`adapter_model.safetensors` + `adapter_config.json`), tokenizer y `chat_template.jinja` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `didula-wso2/gemma4_1-0-8_sft_16bit_vllm`, un modelo Gemma 4 E4B ajustado de forma supervisada para generacion de codigo Ballerina. Sobre esa base se realizo un entrenamiento de refuerzo online con GRPO exclusivamente (sin fase SFT adicional en esta etapa), con semilla 3409 y 30 rondas de entrenamiento, guardandose el checkpoint final de la ronda 30. La configuracion LoRA es de rank 16 y alpha 32.

Una decision tecnica destacable es el filtrado de grupos: los grupos de prompts en los que ningun programa generado pasaba las pruebas se descartan, de modo que la senal de recompensa solo se calcula sobre grupos con al menos una solucion valida. Esto evita actualizaciones con gradiente nulo o ruidoso cuando la politica no produce ningun acierto. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, la funcion de recompensa exacta ni si hubo etapas adicionales de alineamiento.

## Capacidades

- Generacion de codigo en el lenguaje Ballerina, especialidad principal del adaptador.
- Razonamiento de codigo guiado por recompensa: el entrenamiento GRPO premia programas que pasan las pruebas, lo que favorece soluciones funcionalmente correctas frente a plausibles.
- Aplicable mediante PEFT (`PeftModel.from_pretrained`) sobre el modelo base SFT.
- Herencia de las capacidades generales del modelo base Gemma 4 E4B (generacion de texto, conversacion), aunque el adaptador no las refuerza especificamente.
- Soporte de tool calling, agentes, vision o audio: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Generacion de codigo Ballerina en produccion: el adaptador se integra sobre el modelo base SFT para producir funciones y servicios Ballerina, aprovechando que el entrenamiento GRPO ha optimizado la tasa de programas que pasan pruebas.
- Asistencia a desarrolladores en integraciones WSO2: Ballerina es el lenguaje de la plataforma WSO2; el modelo puede emplearse en asistentes de IDE que sugieran codigo de integracion.
- Investigacion en RL para generacion de codigo: sirve como referencia reproducible (semilla y ronda documentadas) para estudiar GRPO sobre lenguajes de nicho con filtrado de grupos sin aciertos.
- Migracion de logica desde otros lenguajes a Ballerina: el modelo puede traducir fragmentos y el adaptador mejora la correccion sintactica y semantica del resultado.
- Generacion de tests y ejemplos de codigo: util para crear suites de prueba o documentacion tecnica en Ballerina a partir de especificaciones.
- Fine-tuning posterior sobre el adaptador: al ser un LoRA de 0,2 GB, se puede combinar o continuar el entrenamiento con recursos modestos para adaptarlo a dominios Ballerina especificos.
- Estudio de tecnicas de filtrado de grupos en GRPO: el criterio de descartar grupos sin programas validos es un caso practico para analizar estabilidad del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base Gemma 4 E4B; el adaptador anade un coste marginal (rank 16, 0,2 GB). No disponible la cifra exacta del base.
- GPU recomendadas: no disponible en la informacion proporcionada; el base se referencia en formato de 16 bits (`sft_16bit_vllm`), lo que sugiere despliegue en GPU con al menos memoria suficiente para pesos en FP16/BF16.
- Compatibilidad con GPU de consumo: no disponible; depende del tamano efectivo de Gemma 4 E4B.
- Opciones de despliegue: PEFT (`PeftModel.from_pretrained`) sobre el base; el nombre del base sugiere uso con vLLM. No se confirman otras opciones (llama.cpp, Ollama, TGI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este adaptador (gemma4_1-0-8_grpo_only_b8_parity_seed3_checkpoint_30_lora) | LoRA sobre Gemma 4 E4B | rank 16 (base E4B) | no disponible | Codigo Ballerina | gemma | Hugging Face (0 descargas) |
| didula-wso2/gemma4_1-0-8_sft_16bit_vllm | SFT completo Gemma 4 E4B | Gemma 4 E4B | no disponible | Codigo Ballerina | no disponible | Hugging Face (modelo base) |
| Gemma 4 E4B (base original) | Transformer | E4B | no disponible | Proposito general | gemma | Hugging Face / Google |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador no es un modelo autonomo: requiere cargar el modelo base `didula-wso2/gemma4_1-0-8_sft_16bit_vllm` para funcionar.
- Especializado en Ballerina; su uso fuera de ese lenguaje no aporta ventajas sobre el base y puede degradar el comportamiento general.
- Sin datos publicados de evaluacion: no hay evidencia cuantitativa de la mejora frente al modelo SFT de partida.
- El filtrado de grupos sin programas validos puede introducir sesgo hacia los tipos de problemas que el modelo ya resuelve, reduciendo la diversidad de la senal de aprendizaje.
- Riesgo de alucinacion en APIs y librerias de Ballerina no vistas durante el entrenamiento.
- Licencia `gemma`: el uso comercial esta sujeto a los terminos de la licencia de Gemma, que impone restricciones y obligaciones de atribucion.
- Artefacto con 0 descargas y 0 likes: sin validacion por parte de la comunidad; conviene evaluarlo antes de usarlo en produccion.
- Idiomas soportados y longitud de contexto no documentados; no se puede garantizar comportamiento multilingue ni conversaciones largas.
- Fecha de creacion posterior a la fecha actual de referencia habitual: verificar la integridad y procedencia del repositorio antes de desplegarlo.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/DidulaThavishaPro/gemma4_1-0-8_grpo_only_b8_parity_seed3_checkpoint_30_lora
- Modelo base SFT: https://huggingface.co/didula-wso2/gemma4_1-0-8_sft_16bit_vllm
- Perfil del autor: https://huggingface.co/DidulaThavishaPro
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Licencia Gemma: https://ai.google.dev/gemma/terms
