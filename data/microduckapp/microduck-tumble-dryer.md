# microduckapp/microduck-tumble-dryer

## Resumen

`microduckapp/microduck-tumble-dryer` no es un modelo de lenguaje, sino una **política de control robótico** empaquetada en ONNX para el robot bípedo Microduck. El autor, la cuenta `microduckapp`, la publica dentro de la familia de "moves" (movimientos) etiquetadas como `microduck-move`, que la app oficial del robot instala y reproduce. El artefacto principal, `policy.onnx`, recibe 61 observaciones y emite 14 consignas articulares a 50 Hz, lo que da una política de 14 grados de libertad de salida pensada para ejecutarse en el bucle de control del robot.

El movimiento en cuestión, "Tumble Dryer", tiene una duración de 11,2 segundos y consiste en girar en un sentido, invertir la rotación y mantener la cabeza rotando en círculos durante toda la secuencia. Se distribuye junto a `manifest.json` (metadatos de instalación y reproducción) y `media/preview.mp4` (vídeo de muestra). El repositorio tiene un tamaño declarado de 0,0 GB, sin descargas ni likes en el momento de la consulta.

Su relevancia es la del ecosistema al que pertenece: Microduck es un bípedo open source de 25 cm y 800 g presentado por Hugging Face y Pollen Robotics a 399 USD, entrenado con aprendizaje por refuerzo en MuJoCo, con preorders abiertas desde el 27 de agosto de 2026 y envíos previstos antes de Navidad de 2026. Este repositorio es, por tanto, contenido de comportamiento para una plataforma de investigación en IA física, no un modelo generativo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control para robot bípedo exportada a ONNX; topología interna de la red no disponible |
| Parámetros totales | no disponible (el repositorio declara 0,0 GB) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; interfaz de 61 observaciones de entrada por paso de control |
| Tipos de cuantización | no disponible (se distribuye únicamente el grafo ONNX tal cual) |
| Idiomas soportados | no disponible; no aplica a una política motora |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` + `media/preview.mp4` |
| Entradas | 61 observaciones |
| Salidas | 14 consignas articulares |
| Frecuencia de control | 50 Hz (periodo de 20 ms) |
| Duración del movimiento | 11,2 s |
| Pipeline declarado en HuggingFace | robotics |
| Etiquetas | onnx, robotics, microduck-move, region:us |
| Descargas / likes | 0 / 0 |
| Fecha de creación y actualización | 2026-10-27 (ambas) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la política: no se especifica número de capas, dimensión de las capas ocultas, tipo de red (MLP, transformer, etc.) ni si incorpora memoria recurrente. Lo único documentado es la interfaz de E/S —61 observaciones de entrada, 14 objetivos articulares de salida, 50 Hz— y el contenedor ONNX, lo que sitúa el modelo en la categoría de política de control tipo *policy* para locomoción/manipulación de un bípedo de 14 articulaciones accionadas.

Tampoco se documentan los datos de entrenamiento de esta política concreta: no hay número de tokens ni de pasos de simulación, ni composición del dataset, ni si se empleó RL, imitación o una combinación. El contexto del ecosistema sí aporta una pista: Microduck se entrena con aprendizaje por refuerzo en MuJoCo y el objetivo declarado de la plataforma es transferir comportamientos de simulación a hardware real (*sim-to-real*). Es razonable leer esta política como un artefacto entrenado en simulación y exportado para inferencia en el robot, pero el repositorio no lo confirma explícitamente. No hay información sobre decodificación especulativa, atención lineal ni otras innovaciones técnicas.

## Capacidades

- Generación de una secuencia motora completa de 11,2 s: giro en un sentido, inversión y rotación circular de la cabeza.
- Control de 14 articulaciones a partir de 61 observaciones, a una frecuencia fija de 50 Hz.
- Ejecución autocontenida en formato ONNX, apta para *runtime* ONNX en el propio robot o en un equipo conectado.
- Instalación y reproducción gestionadas por la app MicroDuck mediante `manifest.json`.
- Previsualización del comportamiento mediante `media/preview.mp4`.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, código, matemáticas, visión ni audio: no es un modelo de lenguaje ni multimodal.
- No se declaran capacidades multilingües ni ningún tipo de modo "thinking".

## Casos de uso

- **Contenido de demostración para el robot Microduck**: instalar la política desde la app y reproducir el movimiento como animación de exhibición en ferias, vídeos de producto o demos de la plataforma a 399 USD.
- **Prueba de extremo a extremo del pipeline de instalación**: usar `manifest.json` y `policy.onnx` como caso de prueba para validar el flujo de instalación, carga y reproducción de *moves* en la app MicroDuck antes de publicar contenido propio.
- **Referencia de interfaz para desarrolladores de nuevas políticas**: tomar los 61 valores de observación y las 14 salidas a 50 Hz como contrato de E/S al entrenar y exportar movimientos propios compatibles.
- **Validación de *sim-to-real***: comparar el comportamiento ejecutado en hardware con el obtenido en simulación para un movimiento con rotaciones continuas, donde los errores de seguimiento y la deriva del yaw son especialmente visibles.
- **Benchmark de latencia en el bucle de control**: medir el tiempo de inferencia de `policy.onnx` contra el presupuesto de 20 ms por paso que impone la frecuencia de 50 Hz, en el hardware objetivo (SoC del robot frente a un equipo externo).
- **Pruebas de regresión de firmware**: reproducir el movimiento tras cada actualización de firmware o de calibración de articulaciones y comparar la trayectoria resultante con la de referencia, detectando degradaciones en el control.
- **Material docente sobre políticas motoras**: ejemplo mínimo y reproducible de política exportada a ONNX con frecuencia de control fija, útil en cursos de robótica o de IA física.
- **Composición de secuencias**: encadenar este movimiento con otros `microduck-move` para construir rutinas más largas, verificando las transiciones entre estados final e inicial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de recompensa, error de seguimiento de trayectoria, tasa de éxito, consumo energético ni latencia medida. Tampoco hay comparaciones con otras políticas del mismo robot.

Los únicos datos cuantitativos verificables son de interfaz y temporización:

| Métrica | Valor |
|---|---|
| Observaciones de entrada | 61 |
| Salidas (objetivos articulares) | 14 |
| Frecuencia de control | 50 Hz |
| Presupuesto por paso de control | 20 ms (derivado de 50 Hz) |
| Duración del movimiento | 11,2 s |
| Pasos de control equivalentes | ~560 (cálculo derivado de 11,2 s × 50 Hz) |

## Requisitos de hardware

- **VRAM estimada**: no disponible. El repositorio declara 0,0 GB y no se publica el número de parámetros, por lo que no se puede estimar el consumo de memoria del grafo ONNX.
- **GPU recomendadas**: no disponible. Por la naturaleza del artefacto (inferencia a 50 Hz de una política de control), lo esperable es ejecución en CPU o en el SoC del propio robot, pero esto no está confirmado en la información proporcionada.
- **Compatibilidad con GPU de consumo**: no verificable con los datos disponibles; el cuello de botella relevante no es la capacidad de cómputo sino cumplir el presupuesto de 20 ms por paso.
- **Plataforma objetivo**: robot Microduck (bípedo de 25 cm y 800 g, 399 USD), según el contexto de la plataforma.
- **Opciones de despliegue**: ONNX Runtime en el robot o en un equipo conectado, gestionado por la app MicroDuck. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- **Latencia y throughput**: no disponible. Solo se conoce la frecuencia nominal de operación (50 Hz) y el periodo máximo admisible de 20 ms por paso.

## Comparativa con modelos similares

No hay información pública en los datos proporcionados sobre otras políticas `microduck-move` concretas (parámetros, licencia o rendimiento) que permitan una comparación cuantitativa. La comparación se limita al plano de plataforma y formato.

| Elemento | Este repositorio | Políticas `microduck-move` de la organización | Política RL típica de bípedo en simulación |
|---|---|---|---|
| Tipo de artefacto | Política motora en ONNX | Políticas motoras (contenido no detallado) | Política motora |
| Parámetros | no disponible | no disponible | no disponible |
| Contexto / E/S | 61 observaciones → 14 salidas, 50 Hz | no disponible | Depende del robot |
| Licencia | no disponible | no disponible | Variable |
| Disponibilidad | Pública en HuggingFace, 0 descargas | Público en el perfil `microduckapp` | Variable |
| Duración | 11,2 s | no disponible | Variable |

## Limitaciones y advertencias

- **Licencia no declarada**: el campo de licencia está vacío en la información disponible. Sin licencia explícita no se puede asumir permiso de uso comercial, redistribución ni modificación; conviene contactar con el autor antes de integrarlo en un producto.
- **Ausencia total de métricas**: cero descargas y cero likes, sin benchmarks ni validación publicada. No hay evidencia de robustez ante perturbaciones, terrenos irregulares o desgaste de articulaciones.
- **Riesgo de fallo físico**: es una política motora sobre hardware real. Una ejecución defectuosa (calibración distinta, firmware desactualizado, superficies con distinta fricción) puede provocar caídas y daños en el robot o en el entorno.
- **Alucinación no aplica**: no genera texto, por lo que no existe riesgo de alucinación lingüística; el riesgo equivalente es la divergencia entre el comportamiento esperado en simulación y el ejecutado en hardware.
- **Idioma**: no aplica, al no haber interfaz de lenguaje natural.
- **Ventana de observación fija**: la política asume exactamente 61 observaciones por paso y 50 Hz. Alterar la frecuencia de control o el orden de las observaciones invalida el comportamiento.
- **Sin información sobre sesgos**: no hay datos sobre condiciones de entrenamiento que permitan evaluar sesgos de comportamiento (por ejemplo, dependencia de un tipo de suelo concreto).
- **Metadatos incompletos**: el repositorio declara 0,0 GB y no publica arquitectura, número de parámetros ni procedencia de los datos de entrenamiento, lo que dificulta la auditoría técnica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/microduckapp/microduck-tumble-dryer
- Perfil y datasets del autor: https://huggingface.co/microduckapp/datasets
- MarkTechPost, sobre Microduck: https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
- TechCrunch, sobre el lanzamiento y precio: https://techcrunch.com/2026/08/27/hugging-face-is-selling-a-cute-399-open-source-duck-robot-microduck/
- The AI Insider, sobre la plataforma abierta: https://theaiinsider.tech/2026/08/28/hugging-faces-pollen-robotics-releases-small-cute-open-source-microduck-robot/
- Tech360, sobre especificaciones y disponibilidad: https://www.tech360.tv/hugging-face-unveils-microduck-new-open-source-biped-ai-robot-2026-31-08
