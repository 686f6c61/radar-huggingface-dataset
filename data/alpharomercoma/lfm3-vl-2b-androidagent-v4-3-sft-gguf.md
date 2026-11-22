# alpharomercoma/LFM3-VL-2B-AndroidAgent-v4.3-sft-GGUF

## Resumen

LFM3-VL-2B-AndroidAgent-v4.3-sft-GGUF es la version cuantizada en formato GGUF de un ajuste fino supervisado (SFT) sobre el modelo vision-lenguaje LFM3-VL-2B de LiquidAI, orientado a la actuacion como agente GUI en dispositivos Android. El autor, alpharomercoma, parte del modelo base LiquidAI/LFM3-VL-2B (1.728.801.600 parametros) y lo especializa para recibir capturas de pantalla junto con un objetivo en lenguaje natural y emitir acciones sobre la interfaz movil. El problema que aborda es la automatizacion de tareas en telefonos Android mediante un agente que interpreta la pantalla y decide el siguiente paso, un nicho donde los modelos generalistas suelen fallar por falta de datos de interaccion real con UIs moviles.

La relevancia de esta ficha es doble: por un lado documenta un modelo pequeno (2B) que puede ejecutarse en hardware modesto gracias a la cuantizacion Q4_K_M; por otro, el propio autor advierte de que esta version 4.3 fallo su puerta de evaluacion online de la ronda 5 y recomienda usar la v4.2-GGUF en su lugar. El repositorio contiene unicamente dos ficheros: el modelo de lenguaje cuantizado a 4 bits y el proyector de vision en Q8_0, este ultimo sin modificar respecto al modelo original de LiquidAI. La licencia heredada es LFM Open License v1.0, con restricciones que conviene revisar antes de cualquier uso comercial.

El contexto de entrenamiento y despliegue esta fijado en 8192 tokens, con un maximo de 1024 tokens por imagen y un historial de texto limitado a 8 pasos. El modelo solo soporta objetivos en ingles y no dispone de memoria mas alla de ese historial, lo que acota su uso a tareas cortas y bien delimitadas. A pesar de su tamano reducido, su especializacion en el dominio Android lo hace relevante para investigacion en agentes GUI y para experimentos de automatizacion movil en entornos controlados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (transformer multimodal con torre de vision y proyector), basada en LFM3-VL-2B de LiquidAI |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (configurado en el servidor de evaluacion); maximo de 1024 tokens por imagen |
| Tipos de cuantizacion | Q4_K_M para el modelo de lenguaje; Q8_0 para el proyector de vision (mmproj) |
| Idiomas soportados | Ingles (en) |
| Licencia | LFM Open License v1.0 (lfm1.0), heredada de LiquidAI/LFM3-VL-2B |
| Formato de pesos | GGUF (modelo de lenguaje Q4_K_M + proyector de vision Q8_0) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) sobre LFM3-VL-2B, un modelo vision-lenguaje de LiquidAI que combina una torre de vision con un transformer de lenguaje. En esta version GGUF, el modelo de lenguaje se cuantiza a Q4_K_M y el proyector de vision se mantiene en Q8_0 sin cambios respecto al original, ya que el ajuste fino no toco la torre de vision. La conversion se realizo con llama.cpp (commit `cd959bae9`) mediante `convert_hf_to_gguf.py` a F16 y posterior `llama-quantize` a Q4_K_M; el autor indica que el mismo procedimiento reproduce el GGUF de la v4 byte a byte.

El entrenamiento se basa exclusivamente en demostraciones grabadas de interaccion con telefonos Android; el modelo nunca interactuo con un dispositivo real durante el entrenamiento. El formato de prompt y salida se documenta en la model card del modelo base sin cuantizar. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La innovacion principal es la especializacion en el dominio de agentes GUI moviles, con un formato de razonamiento configurable (`--reasoning-format deepseek`) en el servidor de inferencia.

## Capacidades

- Generacion de acciones de agente GUI a partir de capturas de pantalla de Android y un objetivo en lenguaje natural.
- Comprension de imagenes (image-text-to-text) mediante la torre de vision y el proyector multimodal.
- Razonamiento de varios pasos limitado a un historial de texto de 8 pasos.
- Formato de razonamiento configurable en el servidor (`--reasoning-format deepseek`).
- Soporte de conversacion multi-turno segun el formato de prompt documentado en la model card del modelo base.
- Capacidad multilingue limitada al ingles (objetivos y contexto en ingles).
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de audio ni otras modalidades distintas de imagen y texto.

## Casos de uso

- Investigacion en agentes GUI moviles: el modelo puede evaluarse en entornos como AndroidWorld (seed 30) para medir la tasa de exito en tareas de navegacion y control de apps, sirviendo como referencia reproducible frente a otros agentes.
- Automatizacion de pruebas de interfaz en Android: dado un objetivo y una captura de pantalla, el modelo propone la siguiente accion, lo que permite generar secuencias de test para flujos de UI en pipelines de QA.
- Prototipado de asistentes de accesibilidad: el modelo interpreta la pantalla y sugiere acciones para usuarios con dificultades motoras, siempre en entornos controlados y con supervision humana.
- Extraccion de informacion de pantallas: a partir de una captura, el modelo puede describir el estado de la UI y los elementos interactivos, util para monitorizacion o auditoria de aplicaciones.
- Docencia y demostraciones de modelos multimodales pequenos: su tamano (1.7B parametros, Q4_K_M) permite ejecutarlo en portatiles y mostrar el funcionamiento de un agente vision-lenguaje sin infraestructura dedicada.
- Generacion de datos sinteticos de interaccion: las acciones propuestas por el modelo pueden usarse como punto de partida para anotar trayectorias de UI, que luego se revisan manualmente antes de incorporarlas a un dataset de entrenamiento.
- Despliegue local con llama.cpp: el servidor `llama-server` con `-ngl 99` permite servir el modelo en una GPU de consumo para experimentos de inferencia de baja latencia.

## Benchmarks y rendimiento

El autor indica que esta version 4.3 se evaluo en AndroidWorld con seed 30 y que los resultados estan en la model card del modelo base sin cuantizar, pero no se proporcionan cifras concretas en la informacion disponible. Ademas, el autor senala que esta version fallo su puerta de evaluacion online de la ronda 5 y recomienda la v4.2-GGUF.

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M del modelo de lenguaje y el proyector Q8_0 suman aproximadamente 1.3 GB de repositorio; con contexto de 8192 tokens y margen para KV cache, se estima un uso de VRAM en torno a 2-4 GB, aunque no se dispone de una cifra oficial.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para el modelo cuantizado; para servir con `-ngl 99` y contexto completo se recomienda una RTX 3060/4060 o superior. No se documentan requisitos para A100 o H100.
- Cabe en GPU de consumo: si, en tarjetas con 4 GB o mas de VRAM, gracias a la cuantizacion Q4_K_M.
- Opciones de despliegue: llama.cpp mediante `llama-server` con `--mmproj` para el proyector de vision, `-c 8192`, `--image-max-tokens 1024`, `--reasoning-format deepseek`, `-np 1` y `-ngl 99`. No se documenta soporte para vLLM, Ollama o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| alpharomercoma/LFM3-VL-2B-AndroidAgent-v4.3-sft-GGUF | 1.728.801.600 | 8192 tokens | Ingles | LFM Open License v1.0 | GGUF (Q4_K_M + mmproj Q8_0) | Fallo la puerta online de la ronda 5; el autor recomienda v4.2-GGUF |
| alpharomercoma/LFM3-VL-2B-AndroidAgent-v4.2-GGUF | no disponible | no disponible | Ingles | LFM Open License v1.0 (heredada) | GGUF | Version recomendada por el autor frente a la v4.3 |
| LiquidAI/LFM3-VL-2B-GGUF | no disponible | no disponible | no disponible | LFM Open License v1.0 | GGUF | Modelo base sin ajuste fino para agentes Android; su proyector de vision se reutiliza sin cambios |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: el autor advierte explicitamente de que no debe dejarse actuar sin supervision en un telefono con cuentas reales, mensajes o pagos.
- Esta version 4.3 fallo su puerta de evaluacion online de la ronda 5; el autor recomienda usar la v4.2-GGUF en su lugar.
- Solo acepta objetivos en ingles.
- Una unica captura de pantalla por paso y sin memoria mas alla del historial de texto de 8 pasos.
- Entrenado solo con demostraciones grabadas; nunca interactuo con un telefono real durante el entrenamiento, lo que puede limitar su robustez ante estados de UI no vistos.
- Riesgo de alucinacion en la identificacion de elementos de la interfaz y en la propuesta de acciones, especialmente en pantallas complejas o poco representadas.
- Licencia LFM Open License v1.0 con posibles restricciones para uso comercial; es necesario revisar el fichero LICENSE del repositorio antes de cualquier despliegue productivo.
- El proyector de vision no fue ajustado, por lo que las limitaciones del modelo base en percepcion visual se mantienen.
- No se documentan sesgos especificos, pero al ser un modelo entrenado en ingles y en un dominio concreto, puede presentar sesgos derivados de los datos de demostracion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alpharomercoma/LFM3-VL-2B-AndroidAgent-v4.3-sft-GGUF
- Modelo base sin cuantizar (SFT v4.3): https://huggingface.co/alpharomercoma/LFM3-VL-2B-AndroidAgent-v4.3-sft
- Version recomendada v4.2-GGUF: https://huggingface.co/alpharomercoma/LFM3-VL-2B-AndroidAgent-v4.2-GGUF
- Modelo original de LiquidAI en GGUF: https://huggingface.co/LiquidAI/LFM3-VL-2B-GGUF
- Modelo original de LiquidAI: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Licencia LFM Open License v1.0: https://huggingface.co/alpharomercoma/LFM3-VL-2B-AndroidAgent-v4.3-sft-GGUF/blob/main/LICENSE
