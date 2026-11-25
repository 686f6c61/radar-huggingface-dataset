# donk111/ActMem

## Resumen

ActMem es un framework de memoria en contexto para políticas VLA (vision-language-action) desarrollado por el usuario donk111. Se construye sobre el backbone vision-lenguaje Qwen3-VL-4B-Instruct y anade un experto de accion basado en flow matching, condicionado por un "Latent Memory CoT" que resume el historial de interaccion con marcas temporales. El modelo esta disenado para tareas de robotica en las que el agente necesita razonar sobre interacciones pasadas para decidir la siguiente accion.

La innovacion principal es el uso de los estados ocultos del backbone sobre la subtarea inferida como memoria latente, junto con un mecanismo de "Perception Attention" que ancla la generacion de acciones en la vista actual. Ademas, incorpora una inferencia eficiente que cachea caracteristicas visuales por fragmento y reutiliza el prefijo KV y la subtarea previa.

El checkpoint publicado (R1, 60k pasos) tiene 5.684.677.131 parametros en safetensors y un repositorio de 11,4 GB. Se distribuye bajo licencia MIT y esta evaluado unicamente en RoboMemArena, por lo que su validacion fuera de ese entorno es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA sobre backbone Qwen3-VL (vision-lenguaje) con experto de accion flow matching |
| Parametros totales | 5.684.677.131 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ActMem combina un backbone vision-lenguaje preentrenado (Qwen3-VL-4B-Instruct) con un experto de accion basado en flow matching. El backbone razona sobre el historial de interaccion con marcas temporales; los estados ocultos correspondientes a la subtarea inferida se conservan como Latent Memory CoT y se usan para condicionar al experto de accion. Un modulo de Perception Attention vincula la generacion de acciones con la vista actual del entorno.

La inferencia eficiente cachea las caracteristicas visuales por fragmento y reutiliza el prefijo KV junto con la subtarea previa, lo que reduce el coste computacional en secuencias de interaccion largas. El checkpoint publicado corresponde a la version R1 tras 60k pasos de entrenamiento. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Razonamiento vision-lenguaje sobre historial de interaccion con marcas temporales.
- Generacion de acciones roboticas mediante experto de flow matching.
- Memoria en contexto: mantiene y reutiliza informacion de interacciones previas como Latent Memory CoT.
- Perception Attention para anclar la accion a la vista actual.
- Inferencia eficiente con cacheo de caracteristicas visuales y reutilizacion de prefijo KV.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: parcial, orientado a politicas VLA.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, audio): no disponible.

## Casos de uso

- Manipulacion robotica con memoria de episodios: el modelo puede recordar subtareas y objetos vistos en pasos anteriores para decidir la siguiente accion, gracias al Latent Memory CoT.
- Tareas de largo horizonte en entornos cambiantes: la reutilizacion de prefijo KV y subtarea previa permite mantener coherencia en secuencias extensas.
- Investigacion en politicas VLA: sirve como base para experimentar con memoria en contexto y flow matching en robotica.
- Evaluacion en RoboMemArena: entorno de referencia para comparar estrategias de memoria en agentes roboticos.
- Prototipado de asistentes roboticos con vision: el backbone Qwen3-VL aporta comprension visual y linguistica para interpretar instrucciones y escenas.
- Fine-tuning sobre dominios especificos: al ser un checkpoint MIT con safetensors, puede adaptarse a nuevos entornos roboticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el modelo se ha evaluado unicamente en RoboMemArena, sin cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; con 5,68 mil millones de parametros, en fp16 requeriria aproximadamente 11,4 GB solo para pesos, mas el coste del experto de accion y cache KV.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; previsiblemente requiere GPUs con al menos 16-24 GB de VRAM en fp16, pero no hay datos oficiales.
- Opciones de despliegue: no disponible (no se documentan vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ActMem | 5,68 B | no disponible | MIT | Hugging Face |
| Qwen3-VL-4B-Instruct (base) | ~4 B | no disponible | no disponible | Hugging Face |
| Alternativas VLA | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con otras politicas VLA en la informacion proporcionada.

## Limitaciones y advertencias

- Evaluado unicamente en RoboMemArena; no hay evidencia de generalizacion a otros entornos.
- Sin datos publicados de benchmarks, sesgos ni tasas de alucinacion.
- Idiomas soportados no especificados.
- Longitud de contexto no documentada, lo que dificulta planificar despliegues con historiales largos.
- Requiere el codigo de inferencia especifico del repositorio GitHub; no es un modelo de texto generico.
- Aunque la licencia es MIT, conviene verificar las condiciones del modelo base Qwen3-VL-4B-Instruct para uso comercial.
- Numero de descargas y adopcion muy bajos (0 descargas, 1 like), lo que sugiere poca validacion por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/donk111/ActMem
- Paper: https://arxiv.org/abs/2611.25461
- Codigo: https://github.com/LigphiDonk/ActMem
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
