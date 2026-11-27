# litert-community/Agents-A1-4B

## Resumen

Agents-A1-4B es un modelo de lenguaje orientado a tareas de agente y tool calling desarrollado por InternScience, construido sobre la arquitectura hibrida de Qwen3.5-4B. La version publicada en `litert-community/Agents-A1-4B` es una conversion del modelo original al formato LiteRT-LM (`.litertlm`) para inferencia on-device con el runtime LiteRT-LM de Google, pensada para dispositivos edge. La conversion conserva unicamente el decodificador de texto: la torre de vision del modelo original se ha eliminado.

La arquitectura combina 24 capas de GatedDeltaNet (atencion lineal con regla delta con compuertas) intercaladas con 8 capas de atencion completa con compuertas, de modo que el consumo de memoria crece de forma casi plana con la longitud de contexto: solo las 8 capas de atencion mantienen cache KV, con un presupuesto declarado de 4096 tokens en esta conversion. El modelo preserva el modo de razonamiento (thinking) y el formato nativo de tool calling en XML del modelo base.

La relevancia actual del artefacto reside en su empaquetado: dos recetas de cuantizacion (int8 dinamica y mixed int4 blockwise-32) que reducen el modelo a 4,419 GB y 2,754 GB respectivamente, lo que permite desplegarlo en dispositivos moviles y portatiles sin GPU dedicada. La model card documenta de forma inusualmente detallada un defecto de cuantizacion detectado y corregido en octubre de 2026, asi como sus implicaciones en decodificacion greedy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 24 capas GatedDeltaNet (atencion lineal con regla delta) + 8 capas de atencion completa con compuertas; basada en Qwen3.5-4B |
| Parametros totales | 4B (aproximado, segun denominacion del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens de presupuesto de cache KV en esta conversion (solo las 8 capas de atencion) |
| Tipos de cuantizacion | int8 dinamica (lineales y embedding) y mixed int4 blockwise-32 min-max (lineales) con embedding y lm_head int8 channelwise |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas; el tokenizer cubre ingles, chino, japones, coreano, arabe, hindi, tailandes, tamil y emoji) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); requiere litert-lm >= 0.15 |

## Arquitectura y entrenamiento

El modelo base es InternScience/Agents-A1-4B, construido sobre la arquitectura hibrida Qwen3.5-4B. La columna vertebral alterna 24 capas GatedDeltaNet, que aplican una regla delta con compuertas como forma de atencion lineal, con 8 capas de atencion completa con compuertas. Esta disposicion limita el crecimiento de memoria con el contexto: unicamente las 8 capas de atencion mantienen cache KV, mientras que las capas lineales operan con estado recurrente de tamano fijo. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

La conversion a LiteRT-LM elimina la torre de vision y conserva el decodificador de texto, el template de chat, el tokenizer y los metadatos del ejecutor. La receta int8 mantiene en coma flotante las convoluciones, la regla delta y las 48 proyecciones de decaimiento/compuerta de GatedDeltaNet (`in_proj_a` / `in_proj_b`); la receta mixed int4 aplica cuantizacion int4 blockwise-32 a los lineales y mantiene en flotante convoluciones y regla delta. Ambas declaran activaciones fp32. Una innovacion destacable del artefacto es la sustitucion de la seccion del tokenizer por el `tokenizer.json` propio del repositorio base (con la clase `\p{M}` en el pre-tokenizer), lo que corrige la tokenizacion de texto con marcas combinantes: 36 tokens en lugar de 49 en una frase en hindi, 12 en lugar de 24 en tailandes y 16 en lugar de 29 en tamil.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activable, con cierre controlado del bloque de pensamiento.
- Tool calling nativo en formato XML, preservado del modelo base.
- Comportamiento agentico orientado a tareas multi-paso.
- Capacidades aritmeticas basicas verificadas en la model card (multiplicaciones de dos cifras bajo decodificacion greedy).
- Soporte multilingue parcial: el tokenizer maneja ingles, chino, japones, coreano, arabe con harakat, hindi, tailandes, tamil y emoji, aunque no se declara una lista formal de idiomas.
- Inferencia on-device en CPU y GPU mediante LiteRT-LM, sin dependencia de servidores.
- Sin capacidades de vision en esta conversion (torre eliminada).

## Casos de uso

- Asistentes de agente en movil: el modelo puede ejecutar bucles de tool calling en formato XML directamente en el dispositivo, sin enviar datos a la nube, gracias a los 2,754 GB de la variante mixed int4.
- Automatizacion de tareas en aplicaciones Android: con LiteRT-LM y el fichero int8 de 4,419 GB, se puede integrar un agente que consulte APIs locales y componga respuestas multi-turno dentro del presupuesto de 4096 tokens de cache KV.
- Procesamiento de texto en portatiles sin GPU: la variante mixed int4 permite ejecutar el decodificador en CPU con memoria plana respecto al contexto, adecuado para asistentes de escritorio offline.
- Extraccion de datos estructurados mediante tool calling: el formato XML nativo facilita generar llamadas a funciones parseables en pipelines de automatizacion documental.
- Razonamiento asistido con presupuesto controlado: el modo thinking con limite de tokens (por ejemplo, 1000 tokens) permite resolver problemas aritmeticos o de planificacion en entornos con restricciones de latencia.
- Prototipado de agentes en edge para investigacion: la licencia Apache 2.0 y el formato abierto permiten experimentar con arquitecturas hibridas GatedDeltaNet en hardware de consumo.
- Filtrado y clasificacion de texto multilingue en dispositivos: el tokenizer corregido mejora el tratamiento de idiomas con marcas combinantes (hindi, tailandes, tamil, arabe).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card unicamente documenta comprobaciones de correctitud cualitativas:

| Prueba | Configuracion | Resultado |
|---|---|---|
| Seis preguntas de multiplicacion (int8, fichero previo) | Greedy top-k 1, thinking off, CPU M4 Max | Producto correcto 18/18; cierre autonomo 4/18 |
| Seis preguntas de multiplicacion (int8, fichero 2026-10-13) | Greedy top-k 1, thinking off, CPU M4 Max | Producto correcto y cierre autonomo 18/18 |
| Aritmetica 17 x 23 (int8, fichero previo) | Thinking off, 3 ejecuciones | Cierre autonomo 1/3 |
| Aritmetica 17 x 23 (int8, fichero 2026-10-13) | Thinking off, 3 ejecuciones | Cierre autonomo 3/3 |
| Aritmetica 17 x 23 con thinking (fichero previo) | Sin presupuesto, 3 ejecuciones | Pensamiento no cerrado 3/3 |
| Aritmetica 17 x 23 con thinking (fichero 2026-10-13) | Sin presupuesto, 3 ejecuciones | Cierre y respuesta 2/3; con limite de 1000 tokens, cierra y responde |
| Seis preguntas de multiplicacion (int8, fichero previo) | Greedy top-k 1, thinking off, GPU Mac | Producto correcto y cierre 6/6, en 18-19 caracteres |
| Check de 8 preguntas (int8, fichero previo) | Temperatura 0, GPU Mac | 8/8 |

## Requisitos de hardware

- VRAM/RAM: aproximadamente 4,42 GB para la variante int8 y 2,75 GB para la variante mixed int4 (tamanos de fichero en GB decimales).
- GPU recomendadas: no se especifican modelos concretos; la model card reporta pruebas en CPU y GPU de un Mac M4 Max y en un Galaxy S26 (Android).
- Cabe en GPU de consumo: si, en cualquier GPU con al menos 3-5 GB de memoria libre; tambien en moviles de gama alta (Galaxy S26 documentado).
- Opciones de despliegue: runtime LiteRT-LM (`litert-lm` >= 0.15; probado en 0.15.0, 0.17.1, 0.18.0 y nightly 0.18.0.dev20260919). No se mencionan vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles de forma numerica; la model card solo reporta comportamiento cualitativo (longitud de respuesta de 18-19 caracteres en las pruebas de multiplicacion).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Agents-A1-4B (LiteRT-LM) | 4B | 4096 tokens de cache KV | `.litertlm` | Apache 2.0 | Agente on-device, hibrido GatedDeltaNet |
| InternScience/Agents-A1-4B (base) | 4B | no disponible | safetensors (presumible, no confirmado) | no disponible en la informacion | Modelo original con torre de vision |
| Alternativas de 4B on-device | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de comparacion en la informacion proporcionada |

## Limitaciones y advertencias

- La conversion elimina la torre de vision: no procesa imagenes.
- La cache KV se limita a 4096 tokens, lo que restringe conversaciones y documentos largos.
- Se han documentado defectos de cuantizacion en la variante int8: bajo decodificacion greedy y sin thinking, versiones anteriores continuaban generando tras la respuesta correcta hasta el limite de tokens; con thinking activado, el bloque de pensamiento podia no cerrarse. La correccion del 2026-10-13 mitiga el problema, pero persiste cierta variabilidad (2/3 de cierre en la prueba aritmetica con thinking).
- Riesgo de alucinacion y de autoconversacion (self-talk) en generaciones largas, especialmente con presupuestos de tokens amplios.
- La model card no declara lista de idiomas ni evaluaciones de sesgo; no hay datos sobre sesgos conocidos.
- Requiere `litert-lm` >= 0.15 y esta ligado al runtime LiteRT-LM; no es directamente compatible con otros motores de inferencia.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base declara una licencia no especificada en la informacion disponible; conviene verificar los terminos del repositorio original antes de un despliegue comercial.
- El tokenizer fue corregido el 2026-10-16; ficheros anteriores tokenizan de forma distinta el texto con marcas combinantes.

## Enlaces

- Repositorio LiteRT-LM del modelo: https://huggingface.co/litert-community/Agents-A1-4B
- Modelo base: https://huggingface.co/InternScience/Agents-A1-4B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
