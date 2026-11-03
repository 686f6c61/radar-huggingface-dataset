# djduecaster/dfreq-roller-native-calibration-20261103

## Resumen

dfreq-roller-native-calibration-20261103 es un artefacto de control para robótica publicado en HuggingFace por el usuario djduecaster bajo el pipeline `robotics`. No es un modelo de lenguaje: se trata de una calibración de sesgo compartido sobre un controlador preexistente (denominado "roller-sprint") para una tarea de locomoción o rodadura evaluada en un entorno de simulación tipo Arena. El artefacto aplica un único sesgo de características de comando de -0,056 m/s, aprendido mediante búsqueda robusta nativa en CPU y confirmado sobre 256 arranques de desarrollo, sin modificar los pesos neuronales heredados.

El modelo se distribuye en formato ONNX y se ejecuta mediante la librería `microduck`. La calibración transforma 61 observaciones float32 en 14 offsets de acción float32, a 50 Hz, y está pensada como un ajuste sin memoria (memoryless), es decir, sin estado entre pasos ni entradas privilegiadas como semilla, reloj, posición global o tablas de consulta por arranque. El repositorio tiene un tamaño de 0,0 GB según los metadatos, lo que sugiere un artefacto muy ligero o posiblemente vacío en el momento de la consulta.

Su relevancia es acotada y experimental: documenta un proceso de calibración reproducible con verificación de no inferioridad frente a una política congelada, pero el propio autor declara que no se ha establecido superioridad y que no se trata de un despliegue en robot real. La licencia no está disponible y los derechos de los pesos heredados se remiten a documentos auxiliares del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Controlador de calibración sobre política congelada (no es un transformer ni un LLM); transformación de 61 observaciones float32 a 14 offsets de acción float32 |
| Parametros totales | No disponible (el artefacto es una calibración de sesgo, no un modelo con pesos entrenados propios) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (control por paso, sin memoria entre pasos) |
| Tipos de cuantizacion | No disponible; los tensores se describen como float32 |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | No disponible; se remite a `LICENSE-NOTE.txt` y `upstream-base-card.md` |
| Formato de pesos | ONNX (librería `microduck`) |

## Arquitectura y entrenamiento

El artefacto no entrena una red neuronal nueva. Según la model card, todos los pesos neuronales heredados permanecen sin cambios y lo que se aprende es un sesgo compartido de características de comando de -0,056 m/s, obtenido mediante búsqueda robusta nativa en CPU. El autor lo describe explícitamente como una calibración general sin memoria y no como entrenamiento de pesos. La transformación opera a 50 Hz y convierte 61 observaciones float32 en 14 offsets de acción float32, sin añadir semilla, reloj, posición global, búsqueda por arranque ni entradas de política privilegiadas.

La validación se realizó sobre 256 arranques de desarrollo y se complementó con 128/128 finalizaciones en un conjunto retenido y 64/64 en pruebas de estrés, abarcando comandos de 1,0 y 1,2. En la evaluación local original de Arena con comando 1,1 se registraron 2,727 s con 5/5 finalizaciones. El autor indica que se superaron las puertas de no inferioridad pero no se estableció superioridad, y que el especialista publicado de 2,570 s sigue siendo más rápido en sus arranques prescritos. No se detalla la composición del dataset de entrenamiento ni el número de tokens, al no tratarse de un modelo de lenguaje; los datos de entrenamiento, trazas y checkpoints se declaran privados y excluidos del repositorio.

## Capacidades

- Control de rodadura o locomoción en simulación: genera 14 offsets de acción a partir de 61 observaciones, a 50 Hz.
- Calibración de sesgo de comando: aplica un sesgo compartido de -0,056 m/s sobre las características de comando.
- Ejecución en CPU: la búsqueda y la inferencia se describen como nativas en CPU.
- Formato ONNX: integrable en pipelines de inferencia compatibles con ONNX y la librería `microduck`.
- Comportamiento sin memoria: no mantiene estado entre pasos ni depende de semilla, reloj o posición global.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Evaluación de controladores en simulación: el artefacto permite reproducir la calibración sobre la política congelada y comparar tiempos de finalización en el entorno Arena con comandos de 1,0, 1,1 y 1,2.
- Verificación de no inferioridad: útil para equipos que necesitan comprobar que una calibración no degrada el rendimiento respecto a una política base antes de promover cambios.
- Pruebas de estrés de robustez: los 64/64 arranques de estrés documentados sirven como referencia para validar la estabilidad del controlador bajo condiciones variadas de comando.
- Integración en pipelines ONNX: al distribuirse en ONNX y ejecutarse en CPU, puede incorporarse a sistemas de inferencia ligeros sin GPU.
- Investigación en calibración de bajo coste: el enfoque de sesgo compartido sin modificar pesos heredados es un ejemplo de ajuste mínimo con verificación estadística sobre 256 arranques.
- Reproducción académica: el SHA256 documentado y los documentos de linaje permiten auditar la procedencia y la integridad del artefacto en estudios comparativos.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Arena, comando 1,1 (evaluación local original) | 2,727 s, 5/5 finalizaciones |
| Conjunto retenido | 128/128 finalizaciones |
| Pruebas de estrés (comandos 1,0 y 1,2) | 64/64 finalizaciones |
| Arranques de desarrollo | 256 |
| Comparación con especialista publicado | 2,570 s del especialista en sus arranques prescritos; no se reclama nuevo récord personal |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, al no tratarse de un modelo de lenguaje. Los datos anteriores son resultados locales de simulación y no constituyen una aceptación de servidor ni un ranking.

## Requisitos de hardware

- VRAM estimada: no aplica; el artefacto se ejecuta en CPU según la model card.
- GPU recomendadas: no disponible; no se documenta uso de GPU.
- Compatibilidad con GPU de consumo: no disponible; el diseño es nativo en CPU.
- Opciones de despliegue: ONNX Runtime con la librería `microduck`; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponible; solo se documentan tiempos de finalización en simulación (2,727 s en Arena con comando 1,1), no latencia de inferencia por paso.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| dfreq-roller-native-calibration-20261103 | Calibración de controlador (ONNX, CPU) | No disponible | No aplica | 2,727 s en Arena (comando 1,1), 128/128 retenido | No disponible | HuggingFace, 0 descargas |
| Especialista publicado de 2,570 s | Controlador especializado | No disponible | No aplica | 2,570 s en sus arranques prescritos | No disponible | Referenciado en la model card |
| Política base "roller-sprint" | Controlador heredado | No disponible | No aplica | No disponible | Sujeta a `upstream-base-card.md` | Referenciada en el repositorio |

No se dispone de información suficiente para comparar con alternativas externas de la misma categoría; los únicos comparables documentados son los artefactos del propio autor.

## Limitaciones y advertencias

- Solo simulación: el autor declara explícitamente que no hay despliegue en robot real ni afirmación de seguridad.
- Superioridad no establecida: se superaron las puertas de no inferioridad, pero no se demostró mejora frente al especialista de 2,570 s.
- Licencia no disponible: los derechos de los pesos heredados se documentan en `LICENSE-NOTE.txt` y `upstream-base-card.md`; las actualizaciones propias no relicencian los pesos heredados, lo que genera incertidumbre para uso comercial.
- Datos privados: el entrenamiento, las trazas, los checkpoints y las credenciales se excluyen del repositorio, lo que limita la reproducibilidad completa.
- Sin memoria entre pasos: la calibración es memoryless, por lo que no puede adaptarse a condiciones que requieran estado histórico.
- Repositorio de 0,0 GB y 0 descargas: los metadatos sugieren un artefacto muy ligero o posiblemente incompleto; conviene verificar la integridad mediante el SHA256 documentado.
- Riesgo de alucinación: no aplica, al no ser un modelo generativo de lenguaje.
- Sesgos conocidos: no disponible.

## Enlaces

- HuggingFace: https://huggingface.co/djduecaster/dfreq-roller-native-calibration-20261103
- Documento de linaje y derechos: `upstream-base-card.md` (referenciado en el repositorio)
- Nota de licencia: `LICENSE-NOTE.txt` (referenciado en el repositorio)
- SHA256 del modelo: `891db5713885fba1009ae926c9010c010ef1f9c4771bd3990d84a639469444d8`
