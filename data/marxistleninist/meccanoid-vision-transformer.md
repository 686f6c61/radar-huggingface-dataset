# MarxistLeninist/meccanoid-vision-transformer

## Resumen

El Meccanoid vision + microphone controller (TokFormer-S, checkpoint s3-r2-q2) es un modelo de control robótico de tamaño muy reducido, 37.274 parámetros, publicado por el usuario MarxistLeninist. Consiste en un transformer de tokens recurrente que conduce un robot simulado de dos ruedas estilo Meccanoid G15 hasta un poste objetivo verde utilizando exclusivamente lo que captan su cámara frontal y su micrófono. No recibe mapa, pose, posición del objetivo, sensores de rango ni bits de contacto.

El modelo se entrena por imitación de un "search teacher" privilegiado, un planificador que sí ve el estado completo del mundo, mediante DAgger, de modo que también aprende a recuperarse de sus propios errores. El autor es explícito sobre el estado real de su trabajo: en la prueba principal preinscrita (TEST-T1, 500 episodios no vistos) el modelo alcanza el objetivo en el 15,4 % de los episodios frente al 15,2 % de una línea base simbólica ajustada (SymVision-W), con p = 1,0. Empata con la línea base, pero no la supera.

Su interés no reside en el rendimiento absoluto, ya que alrededor del 85 % de los episodios fallan por colisión, sino en el rigor metodológico: un protocolo de evaluación preinscrito con intervalos de confianza bootstrap y test exacto de McNemar, inferencia en JavaScript puro sin framework de aprendizaje automático en tiempo de ejecución y una corrección pública de una comparación anterior que había producido un falso positivo por una línea base defectuosa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de tokens recurrente (TokFormer-S) |
| Parámetros totales | 37.274 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (los pesos se publican como tensores float dentro de un JSON; no se documenta ningún esquema de cuantización) |
| Idiomas soportados | no disponible (el modelo no procesa lenguaje natural; consume tokens de visión y de audio) |
| Licencia | MIT |
| Formato de pesos | `mecc-vision-tokformer-v2` JSON (`vision-transformer.json`): configuración más tensores float con nombre; inferencia con `controller.js` (JavaScript, UMD) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de tokens recurrente de pequeña escala, denominado TokFormer-S. El modelo consume dos flujos de tokens: parches visuales procedentes de la cámara del pecho y tokens de audio procedentes del micrófono. La evidencia de ablación recogida en la model card confirma que ambas modalidades se procesan de forma efectiva: al barajar las posiciones de los parches visuales el éxito cae al 13,0 %, al poner a cero los tokens visuales (BLIND) cae al 0 % y al poner a cero los tokens de audio (DEAF) cae al 11,0 %. No se detalla en la información disponible el número de capas, la dimensión del modelo, el mecanismo de atención ni la composición exacta del vocabulario de tokens.

El entrenamiento combina aprendizaje por imitación de un planificador privilegiado ("search teacher", que sí dispone del estado completo del mundo) con DAgger, en su segunda ronda, con el objetivo de corregir la deriva del estudiante ante sus propios errores. El conjunto de entrenamiento consta de 100 mapas. La brecha de generalización es pequeña (14,6 % en los mapas de entrenamiento frente a 15,4 % en los no vistos), lo que indica que el límite está en la política aprendida y no en la memorización de mapas. El checkpoint publicado es una instantánea de mitad de la ronda 2 de DAgger (s3-r2-q2).

## Capacidades

- Navegación visual en simulación: conduce un robot de dos ruedas hacia un poste objetivo verde usando solo la cámara frontal.
- Fusión audio-visual: la señal de micrófono aporta una ganancia medible de +4,4 puntos porcentuales frente a la variante DEAF (p = 0,0013).
- Recuperación de errores: el entrenamiento con DAgger está diseñado para que el modelo se reincorpore tras desviarse.
- Robustez parcial a cambios de estilo visual: en STYLE-T1 (colores y alturas de obstáculos modificados) pasa del 8,8 % de la línea base al 13,6 %, aunque sin significación estadística (p = 0,073).
- Comportamiento mejorado con hardware degradado: en la condición de "hardware pobre" obtiene 10,8 % frente al 4,2 % de SymVision-W.
- Inferencia autocontenida: se ejecuta en JavaScript puro, sin dependencias de frameworks de aprendizaje automático en tiempo de ejecución (global `MeccaVision` en navegador, `module.exports` en Node).
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, visión general, tool calling, capacidades de agente ni soporte multilingüe. Es un controlador de política, no un modelo de lenguaje.

## Casos de uso

- Banco de pruebas de imitación y DAgger: la pareja estudiante/profesor y las variantes DEAF, BLIND y de parches barajados permiten estudiar cómo afecta cada modalidad al rendimiento de una política imitada, con un coste computacional mínimo.
- Docencia de evaluación rigurosa: el protocolo preinscrito con 500 episodios, intervalos bootstrap y McNemar sirve como ejemplo práctico de cómo evitar falsos positivos al comparar un modelo aprendido con una línea base.
- Estudio de robustez ante hardware degradado: las condiciones "poor" y "faulty" documentadas permiten reproducir el comportamiento de una política visual cuando la cámara introduce ruido o fallos, un escenario relevante en robótica de bajo coste.
- Investigación en navegación audio-visual en simulación: el modelo demuestra que un canal de audio puede aportar información útil para localizar un objetivo, aunque su magnitud sea modesta.
- Inferencia embebida ligera: con 37.274 parámetros y código JavaScript sin dependencias, el controlador se integra en navegador o en Node para demos interactivas y prototipos educativos sin infraestructura de GPU.
- Punto de partida para ablaciones arquitectónicas: al ser un transformer de tokens recurrente muy pequeño, resulta adecuado para experimentar con número de tokens, resolución de parches o mecanismos de atención sin coste de entrenamiento elevado.
- Reproducción de la línea base simbólica SymVision-W: el repositorio incluye la implementación, útil para quien quiera replicar la comparación o reutilizarla como referencia en tareas de navegación similares.

## Benchmarks y rendimiento

Resultados en datos no vistos (mapas nunca usados para entrenamiento, selección de checkpoint ni ajuste). Éxito según la regla estricta: cualquier colisión termina el episodio como fallo. Los corchetes son intervalos de confianza del 95 % por bootstrap de mapas (1000 remuestreos).

| Conjunto (episodios) | Student (este modelo) | SymVision-W | Diferencia | Veredicto |
|---|---|---|---|---|
| TEST-T1, principal (500) | 15,4 % [11,4; 19,6] | 15,2 % [11,2; 19,8] | +0,2 pp [-4,2; +4,6], p = 1,0 | empate: no supera la línea base |
| TEST-T1, sordo sin micrófono (500) | 11,0 % [7,4; 15,0] | 15,2 % | -4,2 pp [-7,8; -0,2], p = 0,0075 | peor |
| TEST-T2, personas en movimiento (500) | 4,0 % [2,0; 6,4] | 7,8 % [4,8; 11,4] | -3,8 pp [-6,6; -1,4], p = 0,00055 | peor |
| STYLE-T1, colores y alturas cambiados (250) | 13,6 % [8,0; 19,2] | 8,8 % [4,4; 13,6] | +4,8 pp [-0,4; +10,0], p = 0,073 | no significativo |
| STYLE-T2 (250) | 6,8 % [3,6; 10,4] | 4,4 % [2,0; 7,2] | +2,4 pp [-1,2; +6,4], p = 0,29 | no significativo |
| TEST-T1, regla permisiva (500) | 18,6 % | 15,2 % | +3,4 pp [-0,6; +7,6], p = 0,06 | no significativo |
| TEST-T1, hardware pobre (500) | 10,8 % [7,8; 13,6] | 4,2 % [2,4; 6,2] | +6,6 pp [+4,0; +9,2], p = 2e-6 | gana, pero no es una victoria justa (la prueba de color de pared de SymVision-W falla con cámara ruidosa) |
| TEST-T1, hardware defectuoso (500) | 8,0 % [5,2; 11,4] | 5,8 % [3,8; 8,0] | +2,2 pp [-0,8; +5,4], p = 0,14 | no significativo |
| Escenas escritas a mano con nombre (15) | 1/15 | 0/15 | — | potencia estadística insuficiente |

Controladores de referencia en TEST-T1 (500 episodios, regla estricta):

| Controlador | Éxito |
|---|---|
| Teacher (planificador privilegiado, ve el mapa; cota superior, no es un controlador visual) | 100 % (T2: 98,8 %) |
| Student (este modelo) | 15,4 % |
| SymVision-W (línea base simbólica ajustada, v3) | 15,2 % |
| Student con posiciones de parches visuales barajadas (no preinscrito) | 13,0 % |
| Student DEAF (tokens de audio a cero) | 11,0 % |
| Student BLIND (tokens visuales a cero) | 0 % |
| Sin entrenar (pesos iniciales) | 0 % |
| Controlador aleatorio | 0 % |

Validación (solo para selección de checkpoint, 500 episodios, regla estricta, cámara con paredes): student 60/500 (12,0 %), student DEAF 51/500, SymVision-W 50/500 (diferencia de +2,0 pp, no significativa, p = 0,25), SymVision congelado antiguo 25/500. Estos mapas se usaron para elegir el checkpoint y ajustar SymVision-W, por lo que no constituyen evidencia de generalización.

Comparación obsoleta conservada a título documental: el protocolo v2 original comparaba al estudiante con una línea base SymVision congelada y ajustada con una cámara antigua que no dibujaba las paredes de la arena. Bajo la cámara con paredes, cada píxel de muro parecía un obstáculo inminente y la línea base se limitaba a girar y agotar el tiempo. Contra ella el student obtenía 15,4 % frente a 5,6 % (p = 3,2e-10). Esa "victoria" era un artefacto de una línea base rota y fue sustituida por la comparación con SymVision-W descrita arriba.

## Requisitos de hardware

- VRAM para inferencia: prácticamente nula. Con 37.274 parámetros, el conjunto de pesos en formato JSON ocupa del orden de decenas o centenas de kilobytes, muy por debajo de los requisitos de cualquier GPU moderna.
- GPU recomendadas: ninguna en particular. El modelo no requiere aceleración por GPU; la inferencia se ejecuta en CPU, en navegador o en Node.js.
- Cabe en GPU de consumo: sí, y también en cualquier equipo sin GPU. No aplica la distinción entre RTX 4090, A100 o H100 porque el modelo no se sirve con esos aceleradores.
- Opciones de despliegue: el autor proporciona `controller.js` (JavaScript puro, UMD) como único motor de inferencia documentado. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso no soportan este formato de pesos personalizado.
- Latencia y throughput: no disponibles. El modelo card no publica mediciones de latencia ni de episodios por segundo.
- Requisito real de cómputo: el coste relevante no es la inferencia, sino el entrenamiento y la simulación. El entrenamiento requiere el simulador y el pipeline descritos en el repositorio, no incluidos en el repositorio de HuggingFace.

## Comparativa con modelos similares

No se han identificado en la información disponible modelos publicados de terceros que sean directamente comparables, dado que el modelo pertenece a un dominio muy específico (control robótico simulado con cámara y micrófono) y a un formato de pesos no estándar. La comparación relevante es interna, contra los controladores de referencia del propio proyecto:

| Controlador | Naturaleza | Éxito en TEST-T1 | Entradas | Licencia / disponibilidad |
|---|---|---|---|---|
| Student (este modelo) | Transformer de tokens recurrente imitado con DAgger, 37.274 parámetros | 15,4 % | Cámara y micrófono | MIT; pesos y código de inferencia publicados |
| SymVision-W | Controlador simbólico escrito a mano, ajustado solo en validación | 15,2 % | Cámara | Incluido en el repositorio del proyecto |
| Teacher (search teacher) | Planificador privilegiado que ve el mapa completo | 100 % | Estado completo del mundo | Incluido en el repositorio del proyecto; no es un controlador visual |
| SymVision congelado (obsoleto) | Controlador simbólico antiguo, ajustado con una cámara sin paredes | 5,6 % en el protocolo v2 | Cámara | Conservado solo a título documental |

## Limitaciones y advertencias

- No supera la línea base: en la prueba principal preinscrita empata con SymVision-W (15,4 % frente a 15,2 %, p = 1,0). El propio autor declara que su regla de éxito ("superar una línea base simbólica simple en datos no vistos") aún no se cumple.
- Rendimiento absoluto bajo: aproximadamente el 85 % de los episodios de TEST-T1 fracasan, en su mayoría por colisión con obstáculos o paredes.
- Dependencia del micrófono: sin el canal de audio el resultado cae al 11,0 %, por debajo de la línea base simbólica, con una diferencia significativa (p = 0,0075).
- Peor comportamiento con personas en movimiento: en TEST-T2 baja al 4,0 % frente al 7,8 % de la línea base (p = 0,00055), un escenario habitual en entornos reales.
- La victoria con "hardware pobre" no debe citarse como un triunfo limpio: la prueba de color de pared de SymVision-W se rompe con cámara ruidosa porque solo se ajustó con hardware "bueno".
- Entorno exclusivamente simulado: no hay evidencia de transferencia a un robot físico. El modelo nunca recibe mapa, pose ni sensores de rango, lo que dificulta su traslado directo a navegación real sin trabajo adicional.
- Generalización limitada al estilo visual entrenado: las mejoras en STYLE-T1 y STYLE-T2 no alcanzan significación estadística (p = 0,073 y p = 0,29).
- Sesgos conocidos: la model card no documenta análisis de sesgo demográfico ni de otro tipo; al no procesar lenguaje natural ni datos humanos, este tipo de sesgo no aplica, pero tampoco se ha caracterizado el sesgo de la distribución de mapas de entrenamiento (100 mapas).
- Riesgo de alucinación: no aplica en el sentido habitual de los modelos de lenguaje. El equivalente es una política que ejecuta maniobras incorrectas con alta confianza, sin señal de incertidumbre, lo que en producción exigiría una capa de seguridad externa.
- Estado del proyecto: es una instantánea de mitad de la ronda 2 de DAgger; el autor indica que hay una segunda ronda de entrenamiento en curso, por lo que los resultados pueden quedar obsoletos.
- Madurez y adopción: 0 descargas y 0 "likes" en el momento de la consulta, sin validación por terceros. La model card está truncada en la información proporcionada, por lo que faltan detalles como el tamaño final exacto del archivo o el desglose completo de la arquitectura.
- Anomalía en las fechas: la ficha del repositorio indica creación y actualización en septiembre de 2026, una fecha futura respecto al momento habitual de publicación. Conviene verificarla antes de citar el modelo.
- Licencia: MIT, que permite uso comercial, modificación y redistribución con atribución y sin garantía. No se imponen restricciones adicionales de uso responsable en la model card, pero tampoco se ofrece soporte ni mantenimiento.
- La búsqueda web asociada no devolvió resultados relevantes: únicamente enlaces genéricos a YouTube, sin relación con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MarxistLeninist/meccanoid-vision-transformer
- Código, simulador y pipeline de entrenamiento y evaluación: https://github.com/Marxist-Leninist/meccanoid-embodied-lab (directorio `vision/`)
- Demo interactiva (Space estático): https://huggingface.co/spaces/MarxistLeninist/meccanoid-embodied-lab
- Informe de evaluación completo: `REPORT.md` en el repositorio del modelo
- Filas por episodio: `eval-final.json` (ejecución v2) y `eval-v3.json` (línea base corregida)
- Protocolo de evaluación: `EVAL_PROTOCOL.v3.json`
- Búsqueda web: sin resultados relevantes (solo enlaces genéricos a YouTube)
