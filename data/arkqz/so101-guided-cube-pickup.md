# arkqz/so101-guided-cube-pickup

## Resumen

SO-101 guided cube pickup es una política de control robótico entrenada para ejecutar la fase de recogida (pickup) de una tarea de apilamiento de cubos con el brazo manipulador SO-101. El modelo combina aprendizaje por imitación (trayectorias generadas por un profesor de cinemática inversa) con un residual de PPO entrenado en 12 entornos paralelos dentro de MuJoCo. El autor es el usuario arkqz y el repositorio se publicó en noviembre de 2026.

El problema que resuelve es acotado pero concreto: localizar un cubo naranja de 25 mm mediante la cámara de muñeca, cerrar la pinza sobre él y levantarlo manteniendo un agarre bilateral estable durante un segundo. No es un modelo de lenguaje ni un modelo fundacional: es un checkpoint de política (actor TorchScript) que consume estado propioceptivo del brazo más una imagen RGB completa de 720 × 1280 y devuelve seis consignas absolutas de articulación a 20 Hz.

Su relevancia ahora es la de un artefacto de referencia reproducible para la comunidad de manipulación con hardware de bajo coste (SO-101), con métricas de éxito publicadas sobre 96 colocaciones ciegas y una comparación explícita entre el controlador derivado de demostraciones y la corrección PPO. La licencia no está declarada, lo que limita su uso comercial sin aclaración previa del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control (actor TorchScript) con rama visual + vector de estado; residual PPO sobre controlador derivado de demostraciones |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (memoria de episodio interna; control a 20 Hz) |
| Tipos de cuantizacion | no disponible (pesos TorchScript `actor.pt` en CPU) |
| Idiomas soportados | no aplica (modelo de robótica, sin E/S de texto) |
| Licencia | no disponible |
| Formato de pesos | TorchScript (`weights/actor.pt`) + NumPy (`weights/motion.npz`) + `robot-profile.json` + `policy.json` |

## Arquitectura y entrenamiento

La política consta de un actor TorchScript que recibe tres vectores de estado concatenados en orden fijo (posiciones articulares medidas, consignas previas aplicadas y velocidades articulares; seis dimensiones cada uno) junto con la imagen RGB completa de la cámara de muñeca (720 × 1280 × 3, uint8 escalada a [0, 1], sin recorte, redimensionado ni apilado de fotogramas). Las entradas se normalizan con estadísticas congeladas del entrenamiento. La salida son seis consignas absolutas finitas de las articulaciones del seguidor.

El entrenamiento parte de un profesor de cinemática inversa que genera trayectorias completas y ejemplos correctivos en simulación. El checkpoint guardado combina 126 trayectorias de demostración primarias y 50 de agarre orientado hacia fuera, más un residual PPO entrenado en 12 entornos paralelos. El checkpoint seleccionado corresponde a 1.013.508 transiciones acumuladas, de las cuales 439.968 se añadieron en este experimento. En el primer update, un extractor de características independiente lee cada cuarto píxel en cada dirección para localizar píxeles naranjas; su centroide selecciona un movimiento demostrado. Para cubos más lejanos el controlador puede elegir un agarre orientado hacia fuera, y la memoria de episodio rastrea el movimiento y la deflexión de las mordazas. Tras un agarre fallido, el controlador puede volver a la pose inicial medida y usar una segunda imagen de muñeca.

## Capacidades

- Localización visual de un cubo naranja de 25 mm mediante cámara de muñeca a resolución completa.
- Generación de consignas absolutas de articulación para seis ejes (pan y lift de hombro, flexión de codo, flex y roll de muñeca, pinza) a 20 Hz.
- Cierre de pinza y levantamiento con retención de un segundo.
- Selección de estrategia de agarre: movimiento demostrado primario o agarre orientado hacia fuera para cubos más lejanos.
- Recuperación tras agarre fallido: retorno a pose inicial medida y segundo intento con nueva imagen.
- Memoria de episodio para rastrear movimiento y deflexión de mordazas.
- Inferencia en CPU sin necesidad de MuJoCo, Stable-Baselines3 ni coordenadas reales del cubo.
- No soporta tool calling, agentes multi-paso, texto, visión general, audio ni razonamiento simbólico.

## Casos de uso

- Recogida de cubos en un banco de pruebas de apilamiento con SO-101: la política ejecuta la fase de pickup como primer paso de una pipeline de stacking, con éxito estricto del 79,2 % sobre 96 colocaciones ciegas.
- Validación de controladores de imitación en simulación: sirve como baseline reproducible para comparar controladores derivados de demostraciones frente a variantes con corrección PPO, dado que el autor publica ambas métricas (81/96 frente a 78/96 en pickup).
- Investigación en recuperación de fallos de agarre: la lógica de retorno a pose inicial y segunda imagen de muñeca es un caso de estudio concreto para políticas con memoria de episodio.
- Prototipado de pipelines de percepción con cámara de muñeca: el modelo exige la imagen completa 720 × 1280 y rechaza recortes, lo que lo hace útil para evaluar el impacto del campo de visión en tareas de localización.
- Benchmark de simulación a realidad: el autor documenta discrepancias entre ejecución local y en la nube (seed 910006 funcionó en nube y agotó tiempo en local), útil para estudiar variabilidad de reproducción.
- Docencia y divulgación en robótica de bajo coste: el paquete incluye perfil de robot, manifiesto y punto de entrada local, lo que facilita su uso en prácticas de laboratorio con SO-101.
- Integración en runners Jetson: aunque la cola de hardware está pendiente, el paquete está pensado para ejecutarse en el runner Jetson del ecosistema SO-101, previa sustitución del recorte 128 × 128 por la vista completa.

## Benchmarks y rendimiento

| Colocaciones ciegas | Pickup con contacto de brazo | Agarre estricto bilateral |
| --- | ---: | ---: |
| Originales 24 | 18/24 | 17/24 |
| Adicionales 72 | 60/72 | 59/72 |
| **Combinadas** | **78/96 (81,3 %)** | **76/96 (79,2 %)** |

Criterio de pickup: el punto medio del cubo debe permanecer por encima de 22,5 mm en coordenadas de mundo con contacto de brazo continuo durante un segundo. El criterio estricto exige además agarre bilateral, al menos 10 mm de holgura bajo el cubo, ningún otro soporte y velocidad del cubo ≤ 0,1 m/s. Con la corrección PPO desactivada, el mismo controlador derivado de demostraciones obtuvo 81/96 pickups y 80/96 agarres estrictos; la corrección redujo la puntuación agregada en esta prueba. El primer episodio ciego (seed 910000) completó un pickup estricto en 128 pasos de control (6,4 s simulados). La política exportada emitió las mismas seis consignas que el checkpoint original en las 428 actualizaciones de dos repeticiones locales en CPU, incluida la secuencia de retorno y segunda mirada.

## Requisitos de hardware

- Inferencia en CPU: el actor TorchScript se carga en CPU; no se requiere GPU para ejecutar `Policy.predict`.
- VRAM estimada: no disponible; al ejecutarse en CPU, la memoria GPU no es un requisito documentado.
- GPU recomendadas: no disponible; el autor no publica requisitos de GPU ni tiempos de inferencia en GPU.
- Cabe en GPU de consumo: no disponible como dato medido; al ser un actor TorchScript en CPU, no se plantea despliegue en GPU de consumo en la documentación.
- Opciones de despliegue: paquete Python local con `policy.py`, `weights/actor.pt`, `weights/motion.npz`, `robot-profile.json` y `policy.json`; versiones fijadas en `requirements.txt`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponible; solo se documenta la frecuencia de control de 20 Hz y que el primer episodio ciego requirió 128 pasos de control (6,4 s simulados).
- Estado de hardware real: cola de hardware pendiente. El runner Jetson del ecosistema SO-101 entrega un recorte de 128 × 128 que esta política rechaza; el escalado de ese recorte seguiría omitiendo contenido de escena. La aceptación en cola y los tiempos en hardware real no están verificados.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Métrica publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arkqz/so101-guided-cube-pickup | Política imitación + residual PPO | Pickup de cubo 25 mm con SO-101 | 79,2 % agarre estricto (76/96) | no disponible | Hugging Face, repo 0,0 GB |
| Controlador derivado de demostraciones (sin PPO, mismo autor) | Controlador por imitación | Pickup de cubo 25 mm con SO-101 | 83,3 % agarre estricto (80/96) | no disponible | Referenciado en la model card, no como checkpoint separado |
| Otros modelos de manipulación SO-101 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de terceros en la documentación proporcionada.

## Limitaciones y advertencias

- Tarea muy acotada: solo cubo único de 25 mm, naranja, con colocación aleatoria; no se han evaluado colocación, liberación sobre pila, múltiples cubos ni rendimiento en brazo real.
- La corrección PPO empeoró la métrica agregada en la prueba publicada (78/96 frente a 81/96 en pickup), lo que cuestiona su aportación en esta configuración.
- Dependencia de la imagen completa de muñeca: rechaza entradas recortadas; el runner Jetson entrega 128 × 128, incompatible sin cambios en el pipeline.
- Reproducibilidad parcial: la seed 910006 funcionó en la nube pero agotó el tiempo en local, lo que indica sensibilidad a la plataforma de ejecución.
- Licencia no declarada: no hay autorización explícita para uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Estado de hardware real pendiente: sin aceptación en cola ni tiempos verificados en Jetson; el manifiesto canónico y el digest de runtime aprobado por Yondr aún no están publicados.
- Sin datos de sesgos, alucinación o cobertura multilingüe: no aplican en el sentido habitual, pero tampoco se documenta robustez frente a cambios de iluminación, oclusiones o variaciones de color del cubo.
- Tamaño del repositorio 0,0 GB según Hugging Face, lo que sugiere que los pesos pueden no estar efectivamente alojados o que el tamaño reportado es impreciso; verificar antes de descargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arkqz/so101-guided-cube-pickup
- Guía de envío de políticas SO-101 (Yondr): https://github.com/yondr-tech/SO-101-data-sheet/blob/11c0b358d8127e7d0d7e2e79ad9876610e3bd19c/policy-submission/README.md
- Punto de entrada local: `./policy.py` (en el repositorio)
- Pesos del actor: `./weights/actor.pt` (en el repositorio)
- Pesos de movimiento y normalización: `./weights/motion.npz` (en el repositorio)
- Perfil de robot: `./robot-profile.json` (en el repositorio)
- Manifiesto: `./policy.json` (en el repositorio)
- Grabación de la primera prueba ciega: `./media/first-blind-wrist.mp4` (en el repositorio)
- Requisitos: `./requirements.txt` (en el repositorio)
