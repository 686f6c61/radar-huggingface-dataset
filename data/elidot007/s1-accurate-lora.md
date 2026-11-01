# elidot007/S1-Accurate-LoRA

## Resumen

S1-Accurate-LoRA es un adaptador LoRA desarrollado por elidot007 que se monta sobre el modelo multimodal OneJev-4B (construido a su vez sobre Qwen3.5-4B). Su funcion es actuar como "segunda opinion" lenta y opcional dentro de DesktopAgent, un sistema de agente de escritorio para Windows. Cuando el modelo de decision rapido S1-Fast duda de un paso, el servicio de decision consulta a S1-Accurate para que elija la operacion y el elemento objetivo entre los 20 mejores candidatos que propone S1-Fast, usando una captura de pantalla de la ventana.

El modelo resuelve el problema de la precision en la automatizacion de interfaces graficas: en lugar de predecir directamente sobre toda la pantalla, reordena y elige entre un conjunto acotado de candidatos, lo que eleva la tasa de exito por paso en varios conjuntos de prueba. Es relevante porque demuestra un patron de cascada (modelo rapido + modelo preciso bajo demanda) aplicado a agentes de escritorio, con resultados medidos en el articulo asociado.

El adaptador tiene un tamano de repositorio de 0,3 GB, se distribuye bajo licencia Apache-2.0 y soporta ingles y chino. La arquitectura subyacente es un transformer multimodal con atencion lineal en parte de sus capas (se infiere de las proyecciones `in_proj_qkv`, `in_proj_z`, `in_proj_a`, `in_proj_b` del adaptador), con 4B parametros en el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre OneJev-4B (modelo multimodal image-text-to-text basado en Qwen3.5-4B, con proyecciones de atencion lineal) |
| Parametros totales | 4B en el modelo base; el adaptador LoRA es de rango 32 (tamano de repo 0,3 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 16.384 tokens en entrenamiento; contexto de inferencia del modelo base no disponible |
| Tipos de cuantizacion | no disponible (el ejemplo de uso emplea bfloat16) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre OneJev-4B, un modelo de decision multimodal construido sobre Qwen3.5-4B. El entrenamiento congela la torre de vision y ajusta mediante LoRA de rango 32 y alpha 64 (dropout 0,05) las proyecciones de atencion, atencion lineal y MLP: `q_proj`, `k_proj`, `v_proj`, `o_proj`, `in_proj_qkv`, `in_proj_z`, `in_proj_a`, `in_proj_b`, `out_proj`, `gate_proj`, `up_proj` y `down_proj`. La presencia de las proyecciones `in_proj_*` confirma el uso de capas de atencion lineal hibridas en el backbone.

La funcion objetivo combina entropia cruzada con un termino de Brier (peso 1,0) sobre las probabilidades de las opciones, lo que penaliza la sobreconfianza en la eleccion de candidatos. Los datos consisten en un pool de 101.022 preguntas de decision construidas a partir de las fuentes de entrenamiento de S1-Fast (como maximo 8.000 pasos por fuente), cada una con hasta 40 elementos candidatos y la captura de pantalla. El entrenamiento se ejecuto durante 2.500 pasos de optimizador (31.099 preguntas vistas), con tasa de aprendizaje 1e-4, 3% de warm-up, hasta 16.384 tokens y 32 preguntas por paso, secuencias de hasta 8.192 tokens, en dos GPU H100 durante aproximadamente 8 horas. Los pesos fusionados son identicos tensor a tensor a los usados en las mediciones del articulo.

## Capacidades

- Seleccion de operacion y elemento objetivo en interfaces graficas de escritorio a partir de una captura de pantalla y una lista de candidatos.
- Reordenamiento y eleccion entre los 20 mejores candidatos propuestos por S1-Fast (no genera candidatos propios).
- Razonamiento visual sobre capturas de ventanas (pipeline image-text-to-text).
- Salida de probabilidades de opcion calibradas parcialmente mediante el termino de Brier.
- Soporte multilingue limitado a ingles y chino.
- Integracion con la API System One de TypeSafe (`POST /v1/systemone`) mediante el servidor `qev`.
- Uso como segundo nivel de una cascada de decision junto a S1-Fast.

## Casos de uso

- Automatizacion de software empresarial en Windows: el modelo elige la operacion y el control correctos sobre capturas de ventanas de aplicaciones de negocio, actuando como verificador cuando el modelo rapido duda.
- Cascada de decision en agentes de escritorio: se despliega junto a S1-Fast y solo se invoca cuando la confianza del modelo rapido cae por debajo de un umbral, reduciendo el coste computacional medio.
- Verificacion de pasos criticos: dado que sus respuestas confiadas fallan con frecuencia, se usa para proponer acciones que luego se validan leyendo el efecto en pantalla antes de continuar.
- Investigacion en agentes GUI: sirve como punto de comparacion reproducible para estudiar tecnicas de reordenamiento de candidatos y calibracion de confianza en tareas de computer-use.
- Entornos con GPU de 16 GB: el despliegue con `qev` en una unica GPU de aproximadamente 16 GB permite ejecucion local en estaciones de trabajo, manteniendo la captura de pantalla en la misma maquina por privacidad.
- Prototipado de asistentes de escritorio multilingues (en/zh): util para demos y evaluaciones en entornos donde el usuario trabaja en ingles o chino.
- Evaluacion de calibracion: el modelo y sus datos de confianza permiten estudiar la relacion entre probabilidad declarada y acierto real en distintos tipos de ventana (escritorio, navegador, movil).

## Benchmarks y rendimiento

Resultados del articulo. S1-Accurate elige entre los 20 mejores candidatos de S1-Fast; el exito por paso exige acertar operacion y elemento.

| Conjunto de prueba | S1-Fast | OneJev-4B zero-shot | S1-Accurate |
|---|---|---|---|
| VideoCUA, sin subobjetivo / subobjetivo en bucle cerrado | 65,8 / 69,3 | 36,6 / 43,9 | 80,8 / 76,3 |
| OmniACT, sin subobjetivo / subobjetivo en bucle cerrado | 83,2 / 80,0 | 43,9 / 48,8 | 87,3 / 80,7 |
| GUI-360°, sin subobjetivo / subobjetivo en bucle cerrado | 59,7 / 67,2 | 28,7 / 49,9 | 41,2 / 55,6 |

Como cascada (subobjetivos en bucle cerrado, rutas ajustadas fuera de fold por clase de aplicacion), en los subconjuntos donde se ejecuto S1-Accurate:

| Conjunto de prueba | S1-Fast | Cascada | Ruta (preguntar por debajo de / tomar en) |
|---|---|---|---|
| VideoCUA | 69,3 | 75,0 | desktop: 0,8 / 0,5 |
| OmniACT | 80,0 | 82,5 | desktop |
| GUI-360° | 67,2 | 67,2 | office: nunca se consulta |
| Mind2Web | 62,0 | 63,5 | browser: 0,4 / 0,7 |
| AndroidControl | 61,5 | 83,7 | mobile |
| media macro | 68,0 | 74,4 | |

En AgentNetBench, la ruta de escritorio redujo el exito por paso del 80,2% al 74,0%. Una ida y vuelta desde un portatil a una H100 por VPN y tunel SSH tardo 428 ms en la mediana y 501 ms en el percentil 95.

## Requisitos de hardware

- VRAM estimada: aproximadamente 16 GB para servir el modelo fusionado en bfloat16 con `qev` (segun la model card).
- GPU recomendadas: H100 para el entrenamiento (dos unidades); para inferencia, cualquier GPU con unos 16 GB de memoria, como A100 40/80 GB, L40S o RTX 4090 (24 GB).
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas (RTX 4090, RTX 4080 Super de 16 GB), siempre que se use el modelo fusionado en bfloat16.
- Opciones de despliegue: servidor `qev` del repositorio OneJev (`qev serve`), con integracion en DesktopAgent mediante `python -m s1.serve --accurate-url`. Otras opciones (vLLM, llama.cpp, Ollama, TGI) no estan documentadas en la informacion disponible.
- Latencia: 428 ms de mediana y 501 ms en el percentil 95 en una ida y vuelta portatil-H100 por VPN y tunel SSH. Throughput no disponible.
- Nota de seguridad: cada peticion incluye una captura de pantalla, por lo que el servidor debe ejecutarse en la misma maquina o accederse por tunel SSH.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| S1-Accurate-LoRA | 4B (base) + LoRA r32 | hasta 16.384 en entrenamiento | Reordenamiento de candidatos para agentes de escritorio | Apache-2.0 | HuggingFace (17 descargas) |
| S1-Fast | no disponible | no disponible | Modelo de decision rapido, primer nivel de la cascada | no disponible en la informacion | HuggingFace (elidot007/S1-Fast) |
| OneJev-4B | 4B | no disponible | Modelo multimodal de decision base, sin ajuste | Apache-2.0 | HuggingFace (OmniJev/OneJev-4B) |

No se dispone de datos de benchmarks de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Mas debil que S1-Fast en Office (GUI-360°) y en paginas web (Mind2Web); las rutas ajustadas nunca o raramente lo consultan en esos dominios.
- Solo puede cambiar la eleccion de S1-Fast entre sus 20 mejores candidatos; si un elemento no esta en esa lista, queda fuera de su alcance.
- La confianza no es fiable: entre las respuestas tomadas con confianza de al menos 0,9, el 25% fueron erroneas en ventanas de escritorio y el 36% en ventanas de navegador (5,6% en Android). No debe actuar sin verificacion.
- En AgentNetBench la ruta de escritorio empeoro el exito por paso del 80,2% al 74,0%.
- Evaluado en conjuntos publicos de retencion bajo su protocolo de candidatos y en ejecuciones unicas.
- Idiomas limitados a ingles y chino.
- Riesgo de sesgo heredado de los datos de entrenamiento: las trayectorias reales de GUI-360° fueron producidas por GPT-4o y GPT-4.1, y OneJev-4B se entreno con OneJev-Data, cuyas fuentes tienen sus propias licencias.
- Riesgo de alucinacion en la seleccion de elementos no verificado; el sistema de cascada exige leer el efecto de cada accion antes de continuar.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero deben respetarse las licencias de los datos y del modelo base (OneJev-4B y Qwen3.5-4B, ambos Apache-2.0).
- Requiere fusionar el adaptador antes de servir; el uso directo del adaptador sin fusion no esta documentado.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/elidot007/S1-Accurate-LoRA
- Modelo base OneJev-4B: https://huggingface.co/OmniJev/OneJev-4B
- Modelo S1-Fast: https://huggingface.co/elidot007/S1-Fast
- Repositorio DesktopAgent: https://github.com/elidot007/desktop-agent
- Repositorio OneJev (servidor `qev`): https://github.com/OmniJev/OneJev
- Articulo: "One Pass, Then Verify: A Fast Local Decision Model for Desktop Agents on Windows Business Software" (Yilihamu Tuoheti y Tonghe Wang, 2026, arXiv; enlace pendiente de publicacion segun la model card)
