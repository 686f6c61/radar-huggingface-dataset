# padiredd/dp-blockpick-regiondr500-dr-dr2-statenoise

## Resumen

`dp-blockpick-regiondr500-dr-dr2-statenoise` es una política de difusión (diffusion policy) para robótica manipulativa, publicada por el usuario `padiredd` en Hugging Face. Se trata de un checkpoint de LeRobot —en concreto del fork `lerobot-cyclo` de ROBOTIS— entrenado para ejecutar una tarea muy específica: recoger un bloque verde lima con el brazo izquierdo de un robot ROBOTIS FFW SG2 equipado con pinza ROBOTIS CAD y cámaras de muñeca calibradas, sobre una mesa de 29,25 pulgadas.

El modelo no es un LLM ni un modelo generativo de texto: es una política visuomotora que mapea observaciones (tres cámaras de 240x240 y un vector de estado articular de 22 dimensiones) a acciones (16 objetivos articulares a 15 Hz). Con 287,5 millones de parámetros, su interés es fundamentalmente experimental: el autor lo diseña como un test controlado para determinar si el 0 % de éxito de políticas previas entrenadas solo en simulación (DR sim-only) se debe a un exceso de datos o a sobreentrenamiento sobre el conjunto de 10K episodios.

La relevancia actual es acotada pero clara para quien investiga en imitation learning y sim-to-real: documenta con precisión el recetario (aumento de imagen agresivo, ruido gaussiano en el estado, DDPM de 100 pasos, horizonte 64 con 32 ejecutados) y publica checkpoints intermedios cada 10 000 pasos, lo que permite estudiar la evolución del entrenamiento. No hay resultados de evaluación publicados todavía.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM) con encoder ResNet18 por cámara y cabeza de difusión; LeRobot (fork `lerobot-cyclo` de ROBOTIS) |
| Parámetros totales | 287.533.680 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; `n_obs_steps` = 1, horizonte de predicción 64, 32 pasos ejecutados |
| Tipos de cuantización | no disponible (pesos en safetensors, sin variantes GGUF/quantizadas publicadas) |
| Idiomas soportados | no disponible (modelo robótico; la tarea se especifica con la cadena "pick up the lime green block with the left arm") |
| Licencia | other (ver limitaciones) |
| Formato de pesos | safetensors (repo de 11,5 GB con checkpoint final y checkpoints intermedios) |

## Arquitectura y entrenamiento

La política sigue el esquema estándar de diffusion policy: un encoder visual ResNet18 independiente por cada una de las tres cámaras (cabeza, muñeca izquierda y muñeca derecha, todas a 240x240), concatenación con el estado articular de 22 dimensiones y una cabeza de difusión DDPM de 100 pasos que genera secuencias de 16 objetivos articulares. Se ejecutan 32 de los 64 pasos del horizonte predicho, con `n_obs_steps` = 1. El entrenamiento usó Adam con tasa 1e-4, scheduler coseno, batch de 32 y semilla 1000, durante 100 000 pasos (2 h 58 min a 9,3 pasos/s en una RTX 4090 de 24 GB).

Los datos provienen de 500 episodios muestreados aleatoriamente (semilla 0) del dataset `padiredd/pick-cube-topdown-region10k-dr-dr2-3cam`, un conjunto de 10 000 episodios con randomización de dominio (DR2) y apariencia, totalizando 84 379 frames muestreados de forma uniforme con el `EpisodeAwareSampler` de LeRobot. La innovación técnica destacable es doble: un aumento de imagen agresivo en orden aleatorio (hasta 5 de: brillo 0,6-1,4, contraste 0,6-1,4, saturación 0,3-1,7, tono ±0,1, nitidez 0,3-2,0, afín ±10° / 10 % / 0,9-1,1, perspectiva 0,2, desenfoque, borrado aleatorio y escala de grises) y, sobre todo, ruido gaussiano de 1° sobre las 7 posiciones articulares del brazo izquierdo en la entrada de estado durante el entrenamiento (`state_noise_std` en `config.json`, campo propio del parche `lerobot-cyclo` que debe eliminarse para cargar con la versión estándar).

## Capacidades

- Generación de acciones visuomotoras: produce 16 objetivos articulares a 15 Hz condicionados por tres vistas de cámara y el estado articular.
- Ejecución de una tarea concreta de pick-and-place: recoger un bloque verde lima con el brazo izquierdo en configuración top-down.
- Robustez a variaciones visuales: el aumento de imagen en entrenamiento busca invariancia a cambios de iluminación, color, perspectiva y oclusiones parciales.
- Robustez al ruido de estado: el ruido gaussiano de 1° en las articulaciones del brazo izquierdo pretende mejorar la tolerancia a errores de estimación de estado en despliegue.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Investigación en sim-to-real para manipulación: el checkpoint sirve para medir si reducir el conjunto de entrenamiento de 10K a 500 episodios elimina el fallo del 0 % observado en políticas DR sim-only, comparando el checkpoint final con los intermedios.
- Estudio de la dinámica de entrenamiento: los checkpoints cada 10 000 pasos (`step-10000/` a `step-90000/`) permiten trazar curvas de éxito frente a pasos y detectar sobreajuste o colapso de la política.
- Ablación de aumento de imagen: al estar documentado el recetario exacto, se puede replicar el entrenamiento desactivando partes del pipeline de augmentación y comparar el éxito en el mismo entorno simulado.
- Ablación de ruido de estado: el campo `state_noise_std` permite entrenar variantes con y sin ruido para cuantificar su efecto en la robustez ante errores de cinemática.
- Base para fine-tuning en el robot FFW SG2 real: la política puede adaptarse con un conjunto pequeño de demostraciones reales para la misma tarea de recogida del bloque.
- Docencia y reproducción de pipelines LeRobot: el repositorio incluye configuración y pesos suficientes para reproducir el entrenamiento en una única RTX 4090 en menos de tres horas, lo que lo hace útil como ejemplo práctico de diffusion policy.
- Evaluación comparativa de estrategias de randomización de dominio: al derivar de un dataset con DR2 y apariencia, sirve como referencia frente a políticas entrenadas sin DR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados de evaluación se añadirán cuando se ejecuten.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 287,5 M parámetros en fp32 los pesos ocupan aproximadamente 1,15 GB, y el coste adicional depende del tamaño de lote y de los buffers de difusión (100 pasos DDPM). En la práctica, el entrenamiento cupo en 24 GB con batch 32.
- GPU recomendadas: RTX 4090 (usada por el autor para entrenar), A100 o H100 para despliegues con lote mayor o evaluación paralela.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas de 8-12 GB o superiores en inferencia, aunque no hay cifras publicadas.
- Opciones de despliegue: LeRobot (fork `lerobot-cyclo` de ROBOTIS) mediante `DiffusionPolicy.from_pretrained("padiredd/dp-blockpick-regiondr500-dr-dr2-statenoise")`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles para inferencia; en entrenamiento se midieron 9,3 pasos/s con batch 32 en una RTX 4090.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dp-blockpick-regiondr500-dr-dr2-statenoise | 287,5 M | horizonte 64, 32 ejecutados, 1 obs. step | Pick de bloque con brazo izquierdo en FFW SG2 | other | Hugging Face, repo de 11,5 GB |
| Políticas DR sim-only previas del mismo autor | no disponible | no disponible | Pick top-down en simulación | no disponible | referenciadas en la model card, sin ficha detallada |
| Diffusion Policy original (Chi et al.) | no disponible en esta información | no disponible | Manipulación diversa | no disponible | código y pesos públicos, sin datos concretos aquí |

No se dispone de datos suficientes para comparar rendimiento, contexto o resultados de éxito con alternativas; la comparación queda limitada a la existencia de políticas previas del mismo autor sobre el mismo dataset base.

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: la model card afirma que los resultados se añadirán cuando se ejecuten; no hay evidencia de éxito en simulación ni en real.
- Tarea única y robot específico: solo recoge un bloque verde lima con el brazo izquierdo de un FFW SG2 con pinza CAD y mesa de 29,25 pulgadas; no es reutilizable tal cual en otro hardware o tarea.
- Dependencia de un fork: requiere `lerobot-cyclo` de ROBOTIS; el campo `state_noise_std` debe eliminarse de `config.json` para cargar con la versión estándar.
- Licencia "other": no se especifican términos de uso comercial; hay que consultar al autor antes de cualquier despliegue productivo.
- Riesgo de sobreajuste al entorno simulado: el propio diseño del experimento parte de la hipótesis de que las políticas DR sim-only fallan al 0 % en real; este checkpoint no aporta evidencia de lo contrario.
- Sin datos de sesgo, alucinación o cobertura lingüística: no aplican en el sentido habitual, pero tampoco hay análisis de fallos, distribución de errores ni robustez ante condiciones fuera de distribución.
- Idiomas no disponibles: la especificación de la tarea es una cadena en inglés y no hay soporte multilingüe declarado.
- Repositorio de 11,5 GB con diez checkpoints: el almacenamiento y la transferencia son costosos para un modelo de este tamaño.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/padiredd/dp-blockpick-regiondr500-dr-dr2-statenoise
- Dataset base citado: `padiredd/pick-cube-topdown-region10k-dr-dr2-3cam` (referenciado en la model card; no se proporciona URL directa en la información disponible)
- LeRobot: no se proporciona enlace en la información disponible
- Fork `lerobot-cyclo` de ROBOTIS: no se proporciona enlace en la información disponible
- Paper de Diffusion Policy: no se proporciona enlace en la información disponible
