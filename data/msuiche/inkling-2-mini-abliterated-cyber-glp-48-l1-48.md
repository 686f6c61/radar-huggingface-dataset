# msuiche/Inkling-2-Mini-abliterated-cyber-GLP-48-L1-48

## Resumen

Inkling-2-Mini GLP-48 es un artefacto de tipo *control vector* proyectivo (GLP, del inglés *Geometric Layer Projection*) para el modelo base `thinkingmachines/Inkling-2-Mini`. No es un modelo de lenguaje completo, sino un fichero de direcciones vectoriales que, aplicadas sobre el flujo residual en cada ejecución de capa, modifican el comportamiento de rechazo del modelo base. Lo publica el usuario `msuiche` bajo licencia Apache 2.0 y está etiquetado como `abliterated`, término que en la práctica indica la supresión de la geometría interna de rechazo del modelo.

El modelo base es un transformer con arquitectura de bucle (*looped transformer*) y mezcla de expertos: 24 capas físicas almacenadas, ejecutadas 48 veces por token (preludio 0-5, tres pasadas del núcleo 6-17 y final 18-23), 128 expertos enrutados con 8 activos y dimensión oculta de 2304. El artefacto GLP-48 es relevante porque es el primer vector de este tipo diseñado para un transformer con bucle, donde las capas centrales comparten pesos entre pasadas pero su geometría de rechazo difiere en cada paso de ejecución.

La relevancia técnica reside en que el fichero requiere un lector conforme al contrato GLP (no es un GGUF estándar pese a la etiqueta) y rechaza la aplicación aditiva convencional de vectores de control. El propio autor advierte que llama.cpp estándar falla al cargarlo y que la dosis (`alpha_default`) es una decisión de despliegue que debe recalibrarse antes de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Control vector proyectivo (GLP) sobre transformer con bucle y MoE (Inkling-2-Mini) |
| Parametros totales | 110.592 (según safetensors del artefacto; corresponde a las direcciones, no a un modelo completo) |
| Parametros activos | No aplica al artefacto; el modelo base activa 8 de 128 expertos por token |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el artefacto se distribuye como fichero GLP; la etiqueta `gguf` aparece en los tags pero el autor indica que llama.cpp estándar lo rechaza) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Fichero GLP (`glp.mode = project`, `glp.spec_version = 1`, `glp.hook_point = residual_stream_post_layer`); contiene `direction.1` a `direction.48` y metadatos `alpha_default` |

## Arquitectura y entrenamiento

El artefacto no entrena un modelo nuevo: deriva 48 direcciones unitarias, una por cada paso de ejecución del transformer con bucle. La derivación se realizó mediante diferencia de medias por paso de ejecución sobre 32 prompts dañinos (AdvBench) frente a 32 prompts benignos (Alpaca), cada uno renderizado con razonamiento desactivado y en esfuerzo alto, agrupados por prompt. El autor justifica este doble renderizado indicando que Inkling decide sus rechazos dentro del razonamiento, de modo que una dirección calculada solo con razonamiento desactivado cubriría de menos.

Se aplicó un cribado de activaciones masivas (pico/mediana de 163x, con 11 dimensiones enmascaradas). Los 48 pasos de ejecución superan una prueba de validación *split-half* contra una nula de etiquetas barajadas (mediana de 20 ensayos, ambos agrupamientos), con una ratio de nula de dirección aleatoria de aproximadamente 80x. La geometría entre pasadas muestra que las direcciones de la pasada 2 y la pasada 3 coinciden con coseno 0,92, mientras que la pasada 1 es atípica (0,85 y 0,77 frente a las demás), lo que el autor interpreta como asimetría de pasada consistente con mediciones previas en modelos con bucle.

La aplicación es proyectiva: `h <- h - alpha * (h . d) d` en cada ejecución de capa, con `d` la dirección unitaria de ese paso. El pipeline de derivación (captura, derivación, validación y exportación) se ejecutó el 22 de noviembre de 2026 sobre una única H100 vía Modal, partiendo de la revisión `b85c3cfa` del checkpoint base.

## Capacidades

- Modificación del comportamiento de rechazo del modelo base: el vector suprime la geometría interna que produce negativas, de modo que el modelo resultante responde a solicitudes que el original rechaza.
- Aplicación por paso de ejecución: 48 direcciones independientes mapeadas a los 48 pasos (preludio 0-5, tres pasadas del núcleo 6-17 y final 18-23).
- Preservación de la llamada a herramientas: 14/14 en pruebas de *tool calling* automático (llamada simple, paralela, continuación multiturno y argumentos con esquema) a la dosis de despliegue de 0,25.
- Preservación de la terminación limpia: la tasa de parada limpia se mantiene a la dosis de 0,25 frente al modelo original con los mismos presupuestos.
- Divergencia reducida en texto neutro a la dosis de 0,25, con comportamiento dependiente de la dosis.
- No aporta capacidades nuevas de generación, visión, audio ni multilingüismo por sí mismo: hereda las del modelo base, que no están documentadas en la información disponible.

## Casos de uso

- Investigación sobre alineación y rechazo: el artefacto permite estudiar cómo se distribuye geométricamente la negativa a responder en un transformer con bucle, comparando las direcciones de las tres pasadas del núcleo (coseno 0,92 entre pasadas 2 y 3, 0,85/0,77 para la pasada 1) para analizar asimetrías de pasada en modelos con pesos compartidos.
- Auditoría de robustez de salvaguardas: un equipo de seguridad puede usar el vector para comprobar si las defensas del modelo base dependen de una única dirección lineal, aplicando la proyección a la dosis de 0,25 y midiendo la tasa de rechazo sobre suites propias.
- Evaluación de *red teaming* controlada: al suprimir el rechazo de forma calibrada y preservar el *tool calling* 14/14, permite probar trayectorias de agente con llamadas a herramientas en entornos de laboratorio aislados.
- Estudio de dosis-respuesta en vectores de control: la escalera de dosis documentada (colapso del *tool calling* a 1/14 con alpha 1,0 frente a 14/14 con 0,25) sirve como caso práctico para calibrar el compromiso entre supresión de rechazo y conservación de capacidades.
- Desarrollo de lectores GLP conformes: el fichero, que llama.cpp estándar rechaza al cargar, es un banco de pruebas para implementar el contrato `docs/spec/GLP.md` en motores de inferencia propios.
- Comparación de metodologías de ablación: permite contrastar la diferencia de medias con renderizado dual (razonamiento desactivado y esfuerzo alto) frente a enfoques de una sola pasada en la literatura de *abliteration*.

## Benchmarks y rendimiento

El autor reporta validaciones cualitativas y de puerta, no benchmarks de capacidad estándar (MMLU, HumanEval, GSM8K no aparecen). Los datos disponibles son:

| Prueba | Resultado | Condiciones |
|---|---|---|
| Puerta de *tool calling* (simple, paralela, multiturno, esquema) | 14/14 | Dosis 0,25, decodificación greedy |
| Puerta de *tool calling* | 1/14 (colapso) | Dosis 1,0 |
| Terminación limpia | Preservada | Dosis 0,25, mismos presupuestos que el original |
| Validación *split-half* por paso | 48/48 pasos superan la puerta | Nula de etiquetas barajadas, mediana de 20 ensayos |
| Ratio de nula de dirección aleatoria | ~80x | Ambos agrupamientos |
| Suite de rechazo | Medida a la dosis de despliegue; escalera completa en el registro experimental | Razonamiento desactivado, greedy |
| Sobrerrechazo (suite benigna) | Medido frente al original a la dosis de despliegue | Razonamiento desactivado, greedy |
| Divergencia en texto neutro | Pequeña a 0,25; dependiente de dosis | Registro experimental |

No se han publicado resultados de benchmarks de capacidad en la información disponible.

## Requisitos de hardware

- El artefacto pesa 0,0 GB según el repositorio: son 48 direcciones de dimensión 2304 más metadatos, un volumen despreciable frente a los pesos del modelo base.
- El requisito real de VRAM lo determina `thinkingmachines/Inkling-2-Mini`, cuyos pesos no están documentados en la información disponible; no es posible estimar VRAM de inferencia con los datos proporcionados.
- GPU recomendadas: el autor derivó el vector en una única H100 vía Modal; no se especifican requisitos de inferencia.
- Compatibilidad con GPU de consumo: no disponible.
- Despliegue: llama.cpp estándar rechaza el fichero al cargar por ausencia de lector `glp.*`; se requiere un lector conforme al contrato GLP que aplique la proyección en `residual_stream_post_layer`. No se documentan integraciones con vLLM, TGI, Ollama ni similares.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini GLP-48 (este) | Vector de control GLP sobre transformer con bucle y MoE | 110.592 (direcciones) | No disponible | Apache 2.0 | Hugging Face, requiere lector GLP |
| thinkingmachines/Inkling-2-Mini | Modelo base: 24 capas físicas, 48 ejecuciones, 128 expertos (8 activos), oculto 2304 | No disponible | No disponible | No disponible en la información | Hugging Face |
| Vectores de control aditivos convencionales | Dirección única aplicada de forma aditiva | No aplica | No aplica | Variable | Ampliamente disponibles |
| Artefactos de *abliteration* por modificación de pesos | Pesos modificados permanentemente | Igual al modelo base | Igual al modelo base | Variable | Requiere redistribuir pesos completos |

La diferencia clave frente a un vector aditivo convencional es la aplicación proyectiva por paso de ejecución y el rechazo explícito de la aplicación aditiva por parte de lectores conformes. Frente a la *abliteration* por pesos, este artefacto no modifica el checkpoint y permite ajustar la dosis en tiempo de servicio.

## Limitaciones y advertencias

- El artefacto suprime el rechazo del modelo base de forma deliberada: responderá a solicitudes que el original rechaza. El autor declara explícitamente que la responsabilidad de uso recae en el usuario.
- La dosis es crítica: a alpha 1,0 el *tool calling* colapsa de 14/14 a 1/14. No debe elevarse sin volver a ejecutar la puerta de herramientas y de rechazo.
- llama.cpp estándar no carga el fichero; sin un lector GLP conforme, el artefacto es inutilizable. La etiqueta `gguf` puede inducir a error.
- La derivación usó solo 32 prompts dañinos y 32 benignos por conjunto; el propio autor reconoce que la dirección calculada únicamente con razonamiento desactivado cubriría de menos, lo que sugiere sensibilidad al formato de prompt.
- La pasada 1 presenta geometría atípica (coseno 0,85/0,77 frente a 0,92 de las pasadas 2 y 3), lo que puede implicar un comportamiento desigual de la supresión a lo largo de la profundidad del modelo.
- No hay datos publicados de idiomas soportados, sesgos, tasa de alucinación ni rendimiento en benchmarks de capacidad; no es posible evaluar el impacto de la proyección sobre la calidad general más allá de las puertas reportadas.
- La licencia Apache 2.0 cubre el artefacto, pero el uso comercial del modelo base resultante depende de la licencia de `thinkingmachines/Inkling-2-Mini`, no disponible en la información proporcionada.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de terceros.

## Enlaces

- Hugging Face: https://huggingface.co/msuiche/Inkling-2-Mini-abliterated-cyber-GLP-48-L1-48
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Especificación del formato GLP: https://github.com/msuiche/weightless/blob/main/docs/spec/GLP.md
- Repositorio del pipeline weightless: https://github.com/msuiche/weightless
