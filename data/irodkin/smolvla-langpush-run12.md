# irodkin/smolvla-langpush-run12

## Resumen

SmolVLA-langpush-run12 es un modelo de visión-lenguaje-acción (VLA) de 450 millones de parámetros, desarrollado por el usuario irodkin en el marco del proyecto de asignatura ROB7103/8103 Embodied AI (Team 08). Se trata de un ajuste fino de SmolVLA sobre el modelo previo `irodkin/smolvla-langpush-run11`, orientado a una única tarea robótica: empujar un cubo de color (rojo o azul) hacia una zona objetivo verde siguiendo una instrucción en lenguaje natural. El modelo controla un brazo Seeed reBot Arm B601-RS equipado con un iPhone 17 Pro montado en la muñeca como única cámara.

La relevancia del modelo es acotada y experimental: demuestra el flujo completo de entrenamiento sim-to-real con LeRobot y MuJoCo, incluyendo una escena de simulación cuyo aspecto visual se ha ajustado a imágenes reales del teléfono (colores de mesa, cubos y objetivo, y sombras suaves). No es un modelo de propósito general, sino una política de control entrenada exclusivamente en simulación para una tarea y un montaje concretos.

El modelo pertenece a la familia SmolVLA, una arquitectura compacta de VLA pensada para ejecutarse en hardware modesto. El repositorio ocupa 1,3 GB, la licencia es Apache 2.0 y las descargas registradas son 19 en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action), ajuste fino de `irodkin/smolvla-langpush-run11` |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (las instrucciones de entrenamiento son en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Entrada | imagen del teléfono (`observation.images.camera1`), dirección de la gravedad en el marco de la herramienta (3 números) e instrucción en lenguaje natural |
| Salida | chunk de 50 movimientos de punta en el marco de la herramienta, `[dx, dy, dz (m), rx, ry, rz (rad)]`, a 30 fps |
| Frecuencia de replanificación | un plan nuevo cada 10 fotogramas |
| Modo de control | delta (movimientos de punta en el marco de la herramienta sumados a la última pose comandada) |

## Arquitectura y entrenamiento

El modelo parte de SmolVLA, una política VLA que combina un codificador visual y un modelo de lenguaje con un cabezal de acciones. En este ajuste fino se entrenaron en float32 las 8 capas superiores del VLM, manteniendo el resto del modelo congelado, según se detalla en la model card del modelo base run 11. La salida es un chunk de 50 acciones de punta en el marco de la herramienta, que se ejecutan a 30 fps y se replanifican cada 10 fotogramas.

El entrenamiento de run 12 consistió en 20.000 pasos adicionales con tamaño de lote 64 sobre 10.000 demos nuevas generadas por script en la escena `push_color_real`, con diseños simétricos (cualquiera de los dos cubos podía ser el objetivo, de modo que solo la palabra de color los distingue), aleatorización visual en torno a los colores reales, aumento de imágenes de LeRobot y ruido de rumbo en las trayectorias del experto. Se empleó un nuevo schedule coseno: 5e-5 para el experto, 1e-5 para las capas del VLM y 500 pasos de warm-up. Todo el entrenamiento se realizó en simulación MuJoCo; no se reporta entrenamiento con datos reales.

## Capacidades

- Control robótico de empuje guiado por lenguaje: interpreta instrucciones del tipo «Push the red cube into the green target area» o «Push the blue cube into the green target area» y genera trayectorias de la punta de la herramienta.
- Discriminación por color: distingue el cubo nombrado en la instrucción en diseños simétricos; el primer plan apunta al cubo nombrado en el 100 % de los casos en la escena de aspecto real y en el 99 % en la escena de mesa blanca.
- Percepción visual desde una única cámara de teléfono montada en la muñeca.
- Incorporación de la dirección de la gravedad en el marco de la herramienta como entrada adicional.
- Generación de chunks de acción de 50 pasos con replanificación cada 10 fotogramas.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, matemáticas, código, visión general, audio ni modo de pensamiento.

## Casos de uso

- Investigación en sim-to-real para manipulación robótica: el modelo sirve como punto de partida reproducible para estudiar la transferencia de políticas entrenadas en MuJoCo a un brazo real, con scripts de simulación y de brazo real publicados en el repositorio del proyecto.
- Docencia y proyectos de IA encarnada: encaja como ejemplo completo de pipeline LeRobot (demos scriptadas, aumento de imágenes, ajuste fino de VLM y evaluación en simulación) para asignaturas de robótica o aprendizaje por imitación.
- Evaluación de robustez visual: al haberse entrenado con una escena cuyo aspecto imita imágenes reales de teléfono, permite medir el efecto de la aleatorización visual y del ajuste de colores sobre la tasa de éxito en simulación.
- Control de un brazo de bajo coste con una sola cámara: el montaje (Seeed reBot Arm B601-RS más iPhone 17 Pro en la muñeca) es un caso práctico de política VLA ligera ejecutada con hardware asequible.
- Experimentos de condicionamiento por lenguaje en tareas de picking y placing: la tarea de empuje por color es un banco de pruebas mínimo para estudiar cómo la instrucción desambigua objetos visualmente similares.
- Base para ajustes finos adicionales: al ser un checkpoint intermedio de una serie (run 11 a run 12) con licencia Apache 2.0, puede reutilizarse como inicialización para nuevas escenas o tareas dentro del mismo montaje.

## Benchmarks y rendimiento

Resultados en simulación publicados en la model card (un lote de evaluación junto con run 11; 96 diseños de test simétricos por escena y variante de aspecto):

| Metrica | Run 11 | Run 12 (este) |
|---|---|---|
| Escena de aspecto real, éxito de 192 (rango al 95 %) | 175 (86-94 %) | 188 (95-99 %) |
| Comparación pareada frente a run 11: mejor / peor | - | 15 / 2, p = 0,002 |
| Rojo / azul, de 96 cada uno | 90 / 85 | 94 / 94 |
| Escena de mesa blanca (la de run 11), éxito de 192 | 184 (92-98 %) | 188 (95-99 %), sin diferencia significativa |
| Primer plan hacia el cubo nombrado con ambas palabras (aspecto real / mesa blanca) | 97 % / 99 % | 100 % / 99 % |

Definición de éxito: el cubo nombrado termina a menos de 15 mm del centro del objetivo en menos de 15 s. Una política ciega al color acertaría aproximadamente la mitad de las veces. En imágenes reales de teléfono (evaluación offline, solo el primer plan) sobre 31 fotogramas reales con los cubos separados, la palabra de color desplaza el primer plan una mediana de 113 mm (run 11: 95 mm) hacia el lado del cubo nombrado. En el brazo real (primeros ensayos, 20 y 24 de noviembre de 2026, a 0,10 m/s desde un Mac), de 5 episodios guardados el brazo fue a por el cubo nombrado en 4 a ojo, y un episodio adicional no guardado fue a por el cubo equivocado; no se logró ningún empuje exitoso.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 450 millones de parámetros en float32, el peso de los pesos ronda 1,8 GB, pero no se documentan requisitos oficiales ni cuantizaciones.
- GPU recomendadas: no disponible. El autor no especifica GPU de entrenamiento ni de inferencia.
- Compatibilidad con GPU de consumo: no confirmada. Por tamaño, el modelo es pequeño para estándares de VLA, pero no hay datos publicados de ejecución en tarjetas concretas.
- Despliegue: la vía documentada es la librería `lerobot`, cargando la política con `SmolVLAPolicy.from_pretrained("irodkin/smolvla-langpush-run12")` y los pre/post-procesadores del mismo repositorio mediante `make_pre_post_processors(policy.config, pretrained_path=...)`. No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: la política emite planes a 30 fps y replanifica cada 10 fotogramas; no se publican cifras de latencia por inferencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLA-langpush-run12 (este) | 450 M | no disponible | Empuje de cubo por color en un montaje concreto | Apache 2.0 | Hugging Face, 19 descargas |
| SmolVLA-langpush-run11 | no disponible | no disponible | Misma tarea, escena de mesa blanca | Apache 2.0 (según repositorio base) | Hugging Face |
| SmolVLA (modelo base de la familia) | no disponible en esta información | no disponible | VLA generalista para control robótico | no disponible en esta información | Hugging Face |

No se dispone de datos de benchmarks de otros modelos VLA comparables en la información proporcionada, por lo que la comparación se limita a la serie run 11 / run 12 y a la familia SmolVLA.

## Limitaciones y advertencias

- Entrenado exclusivamente en simulación: el éxito en el brazo real no está establecido; los primeros ensayos reales no lograron ningún empuje exitoso.
- El brazo real proyecta sombras fuertes bajo la iluminación del laboratorio que la escena de entrenamiento no reproduce.
- Tarea única: un cubo rojo y otro azul de 4 cm, un objetivo verde de 6 cm, una pose inicial fija, una mesa lisa y cubos separados unos 7 cm o más entre centros.
- El robot debe manejarse en modo delta (movimientos de punta en el marco de la herramienta sumados a la última pose comandada); otros modos de control no están soportados según la documentación.
- Las instrucciones de entrenamiento están en inglés; no se documentan capacidades multilingües.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al tratarse de una política de control, el fallo se manifiesta como acciones incorrectas, no como texto inventado.
- Los resultados en brazo real se basan en un puñado de episodios y no constituyen una tasa de éxito.
- Licencia Apache 2.0: permite uso comercial con atribución, pero el modelo depende de un checkpoint base de la misma serie y de la librería LeRobot; conviene revisar las condiciones de los componentes de terceros.
- Para producción: no hay garantías de robustez fuera del montaje descrito ni datos de latencia en hardware real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/irodkin/smolvla-langpush-run12
- Modelo base (run 11): https://huggingface.co/irodkin/smolvla-langpush-run11
- Repositorio del proyecto (simulador, escena de aspecto real y scripts de brazo real): mencionado en la model card como «our project repository», sin URL concreta en la información disponible.
- Librería LeRobot: no se incluye URL en la información proporcionada.
- Paper de SmolVLA: no disponible en la información proporcionada.
