# Donghyun1228/pi05-libero-b200-temporal-contrast-ur5e-1000-pilot-20261013

## Resumen

π₀.₅ temporal correspondence contrast pilot: ur5e es un artefacto de investigación publicado por el usuario Donghyun1228 en HuggingFace, etiquetado con las etiquetas `openpi`, `robotics`, `libero`, `inverse-dynamics` y `temporal-contrast`. No se trata de un modelo de lenguaje generalista, sino de una política robótica derivada de π₀.₅ (Physical Intelligence) sobre el framework OpenPI, sometida a un piloto de ajuste de 1.000 actualizaciones de optimizador con una técnica denominada contraste de correspondencia temporal sobre un modelo de dinámica inversa (IDM) a partir de futuras observaciones.

El piloto se ejecuta con batch B32, semilla 42 y semilla de sorteo 170013, y emplea un mecanismo de asignación dinámica de multiplicadores de gradiente entre los módulos de visión, LLM y experto de acción, acotado en el rango [0,01, 20]. El objetivo declarado es evaluar si una señal de correspondencia temporal futura mejora la política frente a un control fijo equivalente, manteniendo idénticos los sorteos del optimizador y los hashes iniciales.

La relevancia del artefacto es metodológica más que de producto: documenta con detalle la procedencia de pesos, normalizaciones, planes de entrenamiento y comprobaciones de exportación, e incluye un cribado de política emparejado de 400 episodios (168/400, 42,00 %) sobre el benchmark LIBERO con un brazo UR5e y pinza Robotiq 85. Las ganancias reportadas frente a los controles fijos son de entre +0,25 y +0,75 puntos porcentuales, y el propio autor las califica de preliminares.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Derivada de π₀.₅ (OpenPI); estructura modular con proyecciones de visión, LLM y experto de acción. Modelo de dinámica inversa (IDM) con contraste temporal. No se detalla la topología interna en la información disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se confirma que sea MoE; la model card solo desglosa multiplicadores por módulo visión/LLM/experto) |
| Longitud de contexto | no disponible (la ventana de entrenamiento es H10: 10 pasos nativos; 535.872 ventanas H10 elegibles) |
| Tipos de cuantización | no disponible (el grafo de despliegue se restaura en BF16; el piloto bruto conserva 43 hojas FP32 entrenables) |
| Idiomas soportados | no disponible (la ficha de HuggingFace no declara idiomas; las instrucciones proceden del dataset objetivo) |
| Licencia | Apache 2.0 |
| Formato de pesos | BF16 en el grafo de despliegue, con hojas FP32 en el piloto bruto; no se especifica el contenedor de fichero (safetensors, GGUF u otros) |

Otros datos operativos: tamaño del repositorio 13,1 GB; 51 hojas nativas en el bruto (43 entrenables FP32 de la fuente original y 8 proyecciones congeladas); 23 hojas adicionales de muñeca procedentes de la fuente original anexadas para inferencia; grafo de despliegue de 74 hojas; 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

El artefacto parte de π₀.₅, el modelo robótico de Physical Intelligence orientado a generalización en mundo abierto, y se ajusta dentro del ecosistema OpenPI (existe una adaptación a LeRobot referenciada en los resultados de búsqueda). La innovación concreta del piloto es un esquema de dinámica inversa con contraste temporal: la estadística de entrenamiento puntúa el contraste direccional entre correspondencia futura válida y correspondencia nula, con dos controles nulos aleatorios y un control de proximidad temporal que deben coincidir antes de modificar la asignación de gradientes entre módulos.

El entrenamiento consta de exactamente 1.000 confirmaciones (commits) del optimizador, con 1.081 pasadas hacia atrás totales: las 81 adicionales corresponden a diagnósticos que no actualizan parámetros, cuyos momentos Adam se descartan y cuyas confirmaciones son cero. Durante las primeras 25 actualizaciones los multiplicadores de visión, LLM y experto son 1/1/1; a partir de ahí, en 20 pasos predeclarados (25, 75, ..., 975) una puerta de confianza heurística decide si la asignación acotada en [0,01, 20] cambia. Los multiplicadores medios aplicados sobre las 1.000 actualizaciones fueron: visión 1,116034 (mín. 0,859985; máx. 1,262121; final 1,176713), LLM 1,061956 (mín. 0,981013; máx. 1,288405; final 1,018798) y experto 0,852076 (mín. 0,769264; máx. 1,000000; final 0,834145). El autor advierte que es una media no ponderada de multiplicadores aplicados, no energía de actualización efectiva ni desplazamiento de parámetros.

Los datos proceden del dataset objetivo `Donghyun1228/libero-xe-ur5e-dense-contact-probe-20261010` (revisión `32649763ecd9c00c263250e86e28e42e3d914021`). Son elegibles las diez líneas de tarea por suite (40 en total) y 535.872 ventanas nativas H10; el entrenamiento está balanceado por suite (ocho ventanas por suite y actualización) pero no por tarea. El diagnóstico B32 contiene dos linajes lógicos por suite con cuatro ventanas por linaje. Las observaciones futuras se intercambian dentro de la instrucción original y el linaje lógico de recolección. Solo el gradiente del IDM objetivo válido actualiza parámetros; no hay observaciones de origen, ni recompensa escalar de asignación, ni retroalimentación de éxito de tarea durante el entrenamiento.

## Capacidades

- Generación de acciones de manipulación robótica en el espacio de acción de un brazo UR5e con pinza Robotiq 85, en el contexto del benchmark LIBERO (cuatro suites, diez tareas por suite, diez estados iniciales oficiales).
- Modelado de dinámica inversa: inferencia de acciones a partir de correspondencias entre observaciones presentes y futuras dentro de un linaje lógico de recolección, incluyendo episodios UR segmentados.
- Política de control en lazo cerrado evaluada en simulación con MuJoCo 3.2.3, con cero errores de rollout en el cribado reportado.
- Transferencia entre cuerpos (cross-embodiment): el piloto aborda explícitamente la adaptación al UR5e frente a los brazos por defecto del benchmark.
- Asignación modular de gradientes entre visión, LLM y experto de acción, con puerta de confianza diagnóstica y controles nulos.
- Exportación reproducible: exportación bruta estricta, normalización de origen, planes, diarios y procedencia del controlador incluidos, con hashes verificados (snapshot de entrenamiento/evaluación `6da4916da7f7f769524b5c0bc8c0577fa92035ae`; inferencia `0f6471d99dfc81fabe7c3ab65c141d7640b9ff08`).
- Despliegue con servidor de política multi-cliente: el protocolo usa 16 clientes por GPU con limpieza de procesos verificada.
- No se documentan capacidades de generación de texto, razonamiento simbólico, matemáticas, visión general, tool calling, function calling, agentes ni audio.

## Casos de uso

- Reproducción de investigación en manipulación robótica: el artefacto incluye hashes, planes y diarios que permiten replicar el piloto de 1.000 actualizaciones y compararlo con los controles fijos de la misma semilla, algo poco habitual en publicaciones de pesos.
- Fine-tuning sobre datos propios de un brazo UR5e: al estar adaptado a UR5e con Robotiq 85, sirve como punto de partida para ajustar políticas con demostraciones de un laboratorio que use ese mismo hardware.
- Etiquetado de acciones mediante IDM: puede emplearse para inferir acciones a partir de pares de observaciones temporales, generando datos de entrenamiento para políticas posteriores o para tareas de anotación automática de trayectorias.
- Evaluación previa al despliegue físico: el cribado en MuJoCo 3.2.3 con 400 episodios y protocolo emparejado permite estimar la tasa de éxito antes de arriesgar hardware, aunque el propio autor señala que no es un conjunto de prueba independiente.
- Estudio de métodos de asignación de gradientes: la instrumentación por módulo (visión, LLM, experto) permite analizar el efecto de multiplicadores dinámicos frente a un control fijo en un entorno robótico realista.
- Investigación en transferencia entre cuerpos: el modelo documenta la adaptación a UR5e, útil para estudiar cuánto conocimiento de manipulación se conserva al cambiar de plataforma.
- Servicio de política por lotes en lazo cerrado: el protocolo de 16 clientes por GPU es un patrón reutilizable para servir políticas en infraestructuras de evaluación paralela.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que el modelo es una política robótica. Los únicos datos de rendimiento son los del cribado de política emparejado con semilla 7, que se recogen a continuación tal y como los publica el autor.

| Comparación (cribado de 400 episodios) | Control fijo | Variante temporal | Diferencia |
|---|---:|---:|---:|
| view_large | 117/400 | 120/400 | +0,75 puntos porcentuales |
| yaw30 | 201/400 | 204/400 | +0,75 puntos porcentuales |
| ur5e | 167/400 | 168/400 | +0,25 puntos porcentuales |

| Métrica del cribado ur5e | Valor |
|---|---|
| Protocolo | Matched seed7, cuatro suites x diez tareas x diez estados iniciales oficiales |
| Resultado | 168/400 (42,00 %) |
| Errores de rollout | 0 |
| Simulador | MuJoCo 3.2.3 |
| Clientes por GPU | 16 |
| Embodiment | UR5e con Robotiq 85 Gripper |
| Protocolo de cribado | Suite por GPU, emparejado |

El autor indica expresamente que estos cribados únicos de 400 episodios son preliminares, que no establecen mejora general ni retención de conocimiento de manipulación, y que no se incluye confirmación de política a mayor escala. Los hashes iniciales de las 51 hojas y los 1.000 sorteos del optimizador coinciden con los controles fijos de sonda completa; las primeras 25 métricas nativas coinciden dentro de la tolerancia registrada. Los flujos estocásticos del servidor de política son compartidos y el ruido de política por episodio no está emparejado entre métodos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 13,1 GB y el grafo de despliegue se restaura en BF16, por lo que el peso de los ficheros es un límite inferior aproximado del consumo, pero no se publica el recuento de parámetros ni la memoria necesaria en ejecución.
- GPU recomendadas: no disponible en la información del modelo. El nombre del artefacto y los resultados de búsqueda asocian el ciclo a la GPU B200, y el protocolo de evaluación emplea 16 clientes por GPU, lo que sugiere una GPU de centro de datos con memoria abundante.
- Compatibilidad con GPU de consumo: no disponible. No se documenta ningún despliegue en RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: el artefacto se enmarca en la librería `openpi`; los resultados de búsqueda referencian implementaciones de ajuste e inferencia en el repositorio `Integer003/openpi05` y una adaptación a LeRobot en `jwwoo/pi05_libero_B200`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este artefacto.
- Latencia y throughput: no disponible. El piloto registra 1.081 pasadas hacia atrás en 1.000 actualizaciones de optimizador con batch B32, pero no se publican medidas de latencia de inferencia ni episodios por segundo.

## Comparativa con modelos similares

| Modelo | Base | Ámbito | Contexto | Licencia | Disponibilidad | Resultado publicado |
|---|---|---|---|---|---|---|
| Donghyun1228/pi05-libero-b200-temporal-contrast-ur5e-1000-pilot-20261013 | π₀.₅ / OpenPI | Piloto de contraste temporal con IDM sobre LIBERO, UR5e | Ventanas H10 | Apache 2.0 | Público en HuggingFace, 0 descargas | 168/400 (42,00 %) en cribado ur5e emparejado |
| Donghyun1228/pi05-libero-dense-contact-d2-wrist-kd-yaw10-20261003 | π₀.₅ / OpenPI | Adaptación de marco de acción con yaw 10 y destilación de representación (imagen base, muñeca, prompt) | no disponible | Apache 2.0 (según la etiqueta del repositorio; verificar en la ficha) | Público en HuggingFace | Final en el paso 9999 de 10.000 actualizaciones; sin tasa de éxito en la información disponible |
| jwwoo/pi05_libero_B200 | π₀.₅ (Physical Intelligence) | Modelo base π₀.₅ adaptado a LIBERO, implementación LeRobot basada en OpenPI | no disponible | no disponible | Público en HuggingFace | no disponible |
| π₀.₅ (modelo original de Physical Intelligence) | — | Política robótica generalista de mundo abierto | no disponible | no disponible | Referenciado en OpenPI y en el repositorio openpi05 | no disponible en la información proporcionada |

No se dispone de datos comparativos de rendimiento homogéneos entre estos artefactos: las cifras publicadas corresponden a cribados con protocolos distintos o no se publican.

## Limitaciones y advertencias

- Piloto de alcance limitado: 1.000 actualizaciones de optimizador y un único cribado de 400 episodios por variante. El autor indica explícitamente que no establece mejora general ni retención de conocimiento de manipulación.
- Mejoras marginales: las diferencias frente a los controles fijos son de +0,25 y +0,75 puntos porcentuales, dentro de lo que puede explicarse por ruido de política no emparejado entre métodos.
- El conjunto de diagnóstico no es un conjunto de prueba independiente y los sorteos del optimizador y del diagnóstico pueden solaparse.
- La puerta de confianza que decide los cambios de asignación es una heurística, y la estadística usa la propuesta de lote del diagnóstico, no la del lote de entrenamiento real.
- El cómputo de retropropagación del piloto difiere del control fijo, ya que incluye 81 pasadas de diagnóstico adicionales (1.081 frente a 1.000).
- No hay observaciones de origen, recompensa escalar de asignación ni retroalimentación de éxito de tarea durante el entrenamiento, lo que limita la señal disponible para guiar la política.
- Ámbito de aplicación restringido al benchmark LIBERO y a un embodiment concreto (UR5e con Robotiq 85). No se documenta generalización a otros brazos, tareas o entornos.
- Idiomas soportados no declarados; las instrucciones dependen de la distribución del dataset objetivo, por lo que no puede asumirse cobertura multilingüe.
- No se publican parámetros totales, contexto máximo, cuantizaciones soportadas ni requisitos de VRAM, lo que dificulta planificar un despliegue en producción.
- Riesgo de alucinación y sesgos: no evaluables con la información disponible; al tratarse de una política de control, el modo de fallo relevante es la acción incorrecta o insegura, no la generación de texto.
- Licencia Apache 2.0, que en principio permite uso comercial, pero conviene verificar las condiciones del dataset objetivo y de los pesos base de π₀.₅ antes de un uso productivo.
- Artefacto con 0 descargas y 0 likes en el momento de la consulta, sin revisión por pares ni validación externa conocida.
- Las fechas de creación y actualización del repositorio (2026-10-12) figuran en la ficha de HuggingFace tal cual; no se dispone de información adicional que las confirme o explique.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-b200-temporal-contrast-ur5e-1000-pilot-20261013
- Dataset objetivo: https://huggingface.co/Donghyun1228/libero-xe-ur5e-dense-contact-probe-20261010
- Modelo hermano (destilación de muñeca, yaw 10): https://huggingface.co/Donghyun1228/pi05-libero-dense-contact-d2-wrist-kd-yaw10-20261003
- Modelo base π₀.₅ adaptado a LIBERO: https://huggingface.co/jwwoo/pi05_libero_B200
- Repositorio openpi05 con ejemplos LIBERO: https://github.com/Integer003/openpi05
- Ejemplos LIBERO dentro del repositorio: https://github.com/Integer003/openpi05/tree/main/examples/libero
- Referencia de la implementación OpenPI de Physical Intelligence: no disponible como enlace directo en los resultados de búsqueda
- Paper de π₀.₅: no disponible en los resultados de búsqueda
