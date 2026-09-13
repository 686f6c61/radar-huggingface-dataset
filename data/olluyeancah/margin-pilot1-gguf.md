# olluyeancah/margin-pilot1-gguf

## Resumen

Margin Pilot 1 es un paquete GGUF experimental publicado por el usuario olluyeancah, derivado mediante entrenamiento SFT con LoRA del modelo empero-ai/Qwen3.8-4B-Distill (revisión fijada c83cb7aa2999d2f35c43e9ae0634a30eb8985a1e). El modelo está orientado a "MeetingIntro Margin" y lleva las etiquetas `margin`, `tool-calling` y `experimental`. No es un lanzamiento oficial de Qwen: se trata de un derivado comunitario de la arquitectura Empero/Qwen3.5.

El paquete contiene los pesos del adaptador LoRA ya fusionados con los tensores canónicos del modelo base, cuantizados a Q4_K_M. El tamaño del fichero cuantizado es de 2.783.446.336 bytes y el repositorio ocupa 2,8 GB. Los parámetros totales declarados en safetensors son 4.326.350.848 (aproximadamente 4,33 mil millones), lo que lo sitúa en la categoría de modelos pequeños aptos para inferencia local.

Su relevancia es limitada y muy específica: se trata del "Pilot 1" de una serie, no del adaptador DPO posterior, y el propio autor matiza que no reclama una fiabilidad del 99 % en el mundo real. El interés principal está en evaluar modelos de 4B con capacidades de tool calling en entornos locales con requisitos estrictos de control de permisos, más que en un uso generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de la arquitectura Empero/Qwen3.5 (transformer; detalle de capas no disponible) |
| Parametros totales | 4.326.350.848 (~4,33 B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible; el autor recomienda usar 8192 tokens en Ollama |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M); pesos fusionados a partir de un adaptador SFT LoRA |
| Modelo base | empero-ai/Qwen3.8-4B-Distill, revision c83cb7aa2999d2f35c43e9ae0634a30eb8985a1e |
| Tamano del fichero cuantizado | 2.783.446.336 bytes |
| Tamano del repositorio | 2,8 GB |
| Tensores auxiliares | MTP (multi-token prediction) preservados del modelo fuente fijado |
| Integridad | SHA-256 disponible en el fichero SHA256SUMS del repositorio |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

El modelo parte de empero-ai/Qwen3.8-4B-Distill, un derivado destilado de la arquitectura Empero/Qwen3.5 según la propia model card. Sobre esa base se aplicó un entrenamiento SFT con LoRA específico para "Margin", y el adaptador resultante se fusionó con los tensores canónicos del modelo, adoptando los nombres de tensor estándar. Posteriormente se cuantizó a Q4_K_M. Los tensores auxiliares de MTP (multi-token prediction) se conservaron desde la revisión fijada del modelo fuente, lo que sugiere que el modelo base incorporaba ese mecanismo de predicción multi-token.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO en el modelo base. El autor indica explícitamente que este paquete es el Pilot 1 y no el adaptador DPO posterior, y que el paquete de distribución no incluye datos de entrenamiento, ficheros personales, credenciales ni conversaciones de usuario. También advierte que no puede garantizarse que un modelo entrenado sea incapaz de reproducir ejemplos de su entrenamiento.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Tool calling / function calling, capacidad declarada explícitamente en las etiquetas del modelo y foco principal del entrenamiento SFT específico.
- Ejecución de flujos con múltiples pasos apoyados en herramientas, con verificación de rutas (roots) concedidas.
- Operaciones con vista previa y confirmación previa a la ejecución.
- Soporte de modo "thinking" (razonamiento extendido), dado que el autor distingue entre evaluaciones con thinking activado y desactivado; el modo afecta materialmente a los resultados.
- Capacidades multilingües: no disponible.
- Visión, audio u otras modalidades: no disponible; no se mencionan en la documentación.

## Casos de uso

- Agentes locales de tool calling en estación de trabajo: el modelo está pensado para invocar herramientas bajo un contrato estricto de permisos (rutas concedidas, vista previa y confirmación), por lo que encaja en asistentes de escritorio que operan sobre el sistema de ficheros con aprobación humana.
- Automatización de operaciones reversibles: dado que el autor exige que las herramientas impongan operaciones reversibles y comprobaciones de procedencia de memoria independientes, es adecuado para tareas administrativas donde cada acción debe poder deshacerse.
- Prototipado de pipelines de agentes multi-paso: con 8192 tokens de contexto recomendados y decodificación a temperatura 0, sirve para validar cadenas de razonamiento y llamadas encadenadas antes de invertir en modelos mayores.
- Evaluación comparativa de cuantizaciones GGUF: al ser un paquete aislado con SHA-256 y tamaño conocido, permite reproducir experimentos de cuantización Q4_K_M y comparar contra el modelo base sin cuantizar.
- Asistentes de reuniones y generación de introducciones: el modelo está entrenado específicamente para el caso "MeetingIntro Margin", de modo que su uso previsto original es asistir en la preparación y arranque de reuniones.
- Investigación sobre fiabilidad de tool calling en modelos de 4B: las suites de evaluación publicadas (279/288 y 42/60) permiten estudiar el impacto del modo thinking y del entorno de ejecución en la tasa de éxito de llamadas a herramientas.
- Despliegue en hardware de gama de consumo: con un fichero de 2,78 GB, es viable ejecutarlo en portátiles y equipos sin GPU dedicada de gama alta para tareas de asistencia puntual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor únicamente reporta tasas de éxito sobre sus propias suites de evaluación de peticiones con herramientas:

| Suite | Condiciones | Resultado |
|---|---|---|
| Suite original del desarrollador | 288 fixtures con tres repeticiones por fixture | 279/288 peticiones correctas |
| Subconjunto de estación de trabajo con thinking desactivado | Evaluador v3, 60 elementos | 42/60 correctos |

El propio autor advierte que ambas cifras corresponden a condiciones de evaluación distintas y no son intercambiables, que persisten fallos conocidos y que la validación nativa en Mac objetivo sigue en curso.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M ocupa 2.783.446.336 bytes (unos 2,59 GiB). Con una ventana de 8192 tokens y caché KV, una estimación razonable se sitúa en el rango de 3,5 a 4,5 GB, aunque no se dispone de mediciones oficiales publicadas.
- GPU recomendadas: no disponible en la documentación. Por tamaño, cualquier GPU con 6 GB o más de VRAM debería poder alojarlo en Q4_K_M.
- GPU de consumo: cabe en tarjetas como RTX 3060 (12 GB), RTX 4060 (8 GB) o RTX 4090 (24 GB) con margen amplio para contexto largo; en GPUs de 6 GB el margen se reduce al aumentar la ventana de contexto.
- Ejecución en CPU: viable con llama.cpp u Ollama, dado el tamaño reducido del fichero, con latencias superiores a las de GPU.
- Opciones de despliegue: el autor recomienda Ollama con contexto de 8192 tokens y temperatura 0. Al ser un paquete GGUF, es compatible con llama.cpp y con cualquier runtime que cargue GGUF. El soporte en vLLM o TGI para este paquete concreto: no confirmado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se han proporcionado datos de benchmarks ni especificaciones de otros modelos comparables en la información disponible, por lo que la comparación se limita al modelo base del que deriva.

| Modelo | Parametros | Contexto | Formato | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| margin-pilot1-gguf | 4,33 B | no disponible (8192 recomendado en Ollama) | GGUF Q4_K_M | Apache 2.0 | 279/288 y 42/60 en suites propias de tool calling |
| empero-ai/Qwen3.8-4B-Distill | no disponible | no disponible | no disponible | no disponible | no disponible |
| Otros modelos de ~4B (Qwen, Llama, Phi, Gemma) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo experimental: las propias etiquetas del repositorio lo marcan como `experimental`, con 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria.
- El autor declara explícitamente que no reclama una fiabilidad del 99 % en el mundo real y que persisten fallos conocidos en las suites de evaluación.
- Las dos cifras de evaluación publicadas (279/288 y 42/60) corresponden a condiciones distintas (suite completa con repeticiones frente a subconjunto de estación de trabajo con thinking desactivado y evaluador v3) y no deben compararse entre sí ni extrapolarse a producción.
- El rendimiento depende materialmente del runtime y del modo thinking, por lo que el autor exige cualificar la combinación exacta de aplicación y runtime antes de desplegar.
- El modelo no confiere permiso para ejecutar su salida: cualquier herramienta que lo integre debe imponer rutas concedidas, vista previa y confirmación, operaciones reversibles y comprobaciones independientes de procedencia de memoria.
- Riesgo de alucinación en llamadas a herramientas: no se han publicado métricas de precisión de argumentos ni de falsos positivos en invocaciones, solo tasas de éxito agregadas.
- Idiomas soportados: no disponible, lo que impide garantizar cobertura multilingüe.
- Longitud de contexto real: no disponible; el valor de 8192 tokens es una recomendación de configuración, no una especificación verificada.
- Origen y atribución: es un derivado comunitario basado en la arquitectura Qwen3.5, no un lanzamiento oficial de Qwen; el modelo base pertenece a Empero AI y parte de pesos destilados de terceros.
- Aunque no se incluyan datos de entrenamiento en el paquete de distribución, el autor advierte de que no puede garantizarse que el modelo no reproduzca ejemplos de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero exige conservar los avisos de licencia y la atribución correspondiente (ver LICENSE y atribución upstream en el repositorio).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/olluyeancah/margin-pilot1-gguf
- Modelo base referenciado (empero-ai/Qwen3.8-4B-Distill): https://huggingface.co/empero-ai/Qwen3.8-4B-Distill
- Paper, blog, repositorio o demo adicionales: no disponible. La búsqueda web realizada no devolvió resultados relevantes sobre el modelo (únicamente resultados de portales de reservas de viajes, sin relación con la consulta).
