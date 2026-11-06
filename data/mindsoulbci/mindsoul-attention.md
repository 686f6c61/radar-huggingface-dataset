# mindsoulBCI/mindsoul-attention

## Resumen

MindSoul Attention es un modelo anunciado por mindsoulBCI (equipo MindSoul, vinculado a Chengdu (Shanghai) Brain Cloud Matrix Technology) para la estimación de estados de atención a partir de señales EEG. Se presenta como parte de la serie Neural AI de su equipo de modelos base de interfaz cerebro-ordenador y plantea un enfoque basado en Transformer para modelar patrones de atención relacionados con tareas y su evolución temporal, contrastados contra referencias conductuales y experimentales explícitamente definidas.

Es importante subrayar que, en el momento de redactar esta ficha, la model card indica explícitamente que se trata de un anuncio de publicación: no hay pesos descargables, ni código de entrenamiento, ni resultados de evaluación. La arquitectura concreta, las entradas y salidas, la configuración de entrenamiento y los datos todavía no se han publicado. El repositorio de Hugging Face registra 0 descargas y 0 likes, y no declara pipeline.

Su relevancia actual es, por tanto, prospectiva: describe una línea de investigación en neurotecnología con EEG y modelos Transformer, con idiomas declarados chino e inglés, licencia de investigación personal no comercial y una hoja de ruta de publicación que incluye definición de tareas, formato de datos, estructura del modelo, ejemplos de inferencia, guía de reproducción y benchmarks. Hasta que esos elementos estén disponibles, no es posible evaluar el modelo ni utilizarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (dirección de modelado planificada; arquitectura concreta no publicada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | mindsoul-personal-research (licencia "other"; solo investigación personal no comercial, otro uso requiere autorización del equipo) |
| Formato de pesos | no disponible (no hay pesos publicados) |

## Arquitectura y entrenamiento

La model card describe un enfoque basado en Transformer para estimar patrones de atención relacionados con tareas y sus cambios temporales a partir de EEG, combinando presumiblemente el modelo con marcadores de tareas conductuales para explorar representaciones neuronales vinculadas a la tarea. Sin embargo, el documento indica que el Transformer es únicamente la dirección de modelado prevista y que la arquitectura específica, las entradas y salidas y la configuración de entrenamiento se harán públicas en la versión formal.

Respecto a los datos, se menciona que se planea publicar datos tras completar la desidentificación y verificar las autorizaciones de compartición, y que se planea informar de divisiones de entrenamiento, validación y prueba a nivel de sujeto, distinguiendo evaluación intra-sujeto y entre sujetos, con versión de datos, condiciones del equipo, líneas base y casos de fallo. No se han publicado el número de tokens, la composición del dataset, ni si hubo RLHF, DPO u otras técnicas de alineación. Tampoco se documentan innovaciones técnicas concretas más allá de la dirección Transformer.

## Capacidades

- Estimación de atención a partir de señales EEG en tareas de atención (capacidad planificada; no verificada al no haber pesos).
- Modelado de la evolución temporal de estados de atención (capacidad planificada).
- Combinación con marcadores de tareas conductuales para explorar representaciones neuronales relacionadas con la tarea (planteamiento descrito en la model card).
- Evaluación frente a referencias conductuales y experimentales explícitamente definidas (marco de validación previsto).
- Idiomas declarados: chino e inglés (aplicable a documentación y posible interfaz; no se especifica el papel del texto en el modelo).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües más allá de zh/en: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Investigación en interacción de aprendizaje: el modelo se plantea para estimar estados de atención durante tareas, de modo que un grupo de investigación podría usar sus futuras salidas para correlacionar atención y rendimiento en entornos de aprendizaje, siempre que se publiquen los pesos y la definición de la tarea.
- Estudios de retroalimentación de tareas: la model card menciona el uso de retroalimentación de tareas y la interacción persona-máquina como ámbito de aplicación; un laboratorio podría integrar las estimaciones en protocolos experimentales con marcadores conductuales.
- Investigación en interfaces cerebro-ordenador (BCI): como parte de la serie Neural AI del equipo, serviría como modelo experimental para explorar representaciones neuronales relacionadas con la atención en paradigmas BCI.
- Evaluación intra-sujeto y entre sujetos: el marco previsto de divisiones por sujeto permitiría estudiar la generalización de las estimaciones de atención entre participantes en estudios controlados.
- Integración en aplicaciones espaciales (dirección futura): la model card menciona Android XR, visionOS, PICO OS 6 y PC como direcciones de integración, aunque no existe cliente validado; un equipo de I+D podría explorar prototipos una vez publicado el modelo.
- Reproducción y comparación metodológica: cuando se publiquen la guía de reproducción y los benchmarks, investigadores podrían replicar el pipeline y comparar con sus propias líneas base en tareas de atención con EEG.
- Docencia y formación en neurotecnología: el material previsto (definición de tarea, formato de datos, ejemplos de inferencia) podría emplearse en cursos de investigación, sujeto a la licencia no comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no hay pesos ni tamaño de parámetros publicados).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.): no disponible; no se documenta ningún runtime ni formato de pesos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de estimación de atención con EEG ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Modelo no publicado: no hay pesos descargables, código de entrenamiento ni resultados de evaluación; la model card indica que es un anuncio de próxima publicación.
- La arquitectura Transformer es una dirección planificada, no una especificación confirmada.
- Los datos de entrenamiento no están publicados; se planea su publicación tras desidentificación y verificación de autorizaciones, lo que aún no está confirmado.
- No se reportan métricas de rendimiento, líneas base ni casos de fallo; no es posible evaluar su precisión.
- La model card advierte explícitamente que las salidas de investigación no deben considerarse capacidades cognitivas generales ni puntuaciones de diagnóstico médico.
- Uso restringido: solo investigación personal no comercial; cualquier otro uso requiere autorización del equipo.
- Idiomas declarados limitados a chino e inglés; no se detalla el alcance multilingüe.
- Riesgo de alucinación y sesgos: no evaluable sin pesos ni evaluación publicada.
- Las integraciones en Android XR, visionOS, PICO OS 6 y PC son direcciones de aplicación, no integraciones validadas.
- El repositorio registra 0 descargas y 0 likes, lo que refleja que aún no hay adopción ni validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/mindsoulBCI/mindsoul-attention
- GitHub del proyecto de investigación: https://github.com/pm-kevin-zhang/MindSoul
- GitHub de aplicaciones espaciales, juegos y materiales: https://github.com/pm-kevin-zhang/MindSoul-Spatial
- Sitio web: https://MindSoul.cn
- Licencia (referenciada en el repositorio): LICENSE
