# Dev-devadath/so101-chess-act-pick-v1

## Resumen

so101-chess-act-pick-v1 es una política de robótica (policy) entrenada con el algoritmo ACT (Action Chunking with Transformers) sobre el stack LeRobot, orientada a una tarea muy concreta: recoger piezas de ajedrez con un brazo robótico SO101. No es un modelo de lenguaje ni un modelo fundacional multimodal, sino un checkpoint de control motor que mapea observaciones visuales y de estado articular a comandos de articulación. Lo desarrolla el usuario Dev-devadath y se publica bajo licencia Apache 2.0.

El modelo resuelve el primer paso de un pipeline de manipulación para ajedrez robótico: aproximarse a una pieza, cerrar la pinza, elevarla y colocarla. Según su model card, acierta 10 de 10 recogidas en un tablero casi vacío, con tiempos de 3,3 a 4,1 segundos por pieza, pero falla en partidas reales porque nunca vio un tablero completo y desplaza los agarres aproximadamente media casilla hacia el brazo. El propio autor lo declara superado por políticas posteriores basadas solo en cámara de muñeca.

Técnicamente es un transformer compacto de 51.668.614 parámetros (unos 51,7 M), con backbone ResNet-18 para visión, entrenado desde cero durante 100.000 pasos con batch de 8 en una RTX 4000 SFF Ada. Su relevancia es acotada: sirve como referencia reproducible de un pipeline LeRobot+ACT completo (dataset, entrenamiento, despliegue) y como ejemplo de los modos de fallo típicos de políticas entrenadas con distribución de datos estrecha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con backbone visual ResNet-18 |
| Parametros totales | 51.668.614 (51,7 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada multimodal por paso: cámaras de muñeca y cenital + estado de 6 dimensiones) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

La arquitectura es ACT, un transformer que predice trozos de acciones (action chunks) en lugar de comandos individuales. El modelo recibe dos flujos de imagen (cámara de muñeca y cámara cenital), procesados por un ResNet-18, más un vector de estado de 6 dimensiones, y emite 100 pasos de acción de articulaciones que se ejecutan en bucle abierto (`n_action_steps` = 100). Esta predicción por bloques reduce el error de acumulación y suaviza la ejecución frente a políticas paso a paso.

El entrenamiento se hizo desde cero sobre el dataset `Dev-devadath/so101_pick3_clean`, con 100.000 pasos, batch de 8, learning rate 1e-5, precisión mixta (amp) y los valores por defecto de ACT en LeRobot (commit `5c43fa1c`, versión 0.5.2 dev), sobre una RTX 4000 SFF Ada. La pérdida bajó de 6,8 a 0,025. No se documenta uso de RLHF, DPO ni datos externos; el dataset es propio y específico de la tarea.

## Capacidades

- Control motor de manipulación: descender, agarrar y elevar piezas de ajedrez desde una pose inicial de hover a 8 cm con las pinzas abiertas.
- Fusión de dos vistas de cámara (muñeca y cenital) con estado articular de 6 dimensiones.
- Predicción de acciones por chunks de 100 pasos ejecutados en bucle abierto.
- Generalización limitada a las cinco primeras filas del tablero (rangos 1-5) y a tableros casi vacíos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües, de visión general, audio ni modo thinking.
- Depende de los pads de pinza concretos usados en el entrenamiento, visibles en la cámara de muñeca.

## Casos de uso

- Reproducción de un pipeline LeRobot completo: sirve como checkpoint de referencia para validar la instalación de LeRobot 0.5.2 dev, la carga de políticas ACT y el script `chess/play.py` antes de entrenar modelos propios.
- Recogida de piezas en tableros de prueba: en escenarios controlados con pocas piezas en los rangos 1-5, permite automatizar la retirada de piezas para calibración o pruebas de banco.
- Generación de datos de imitación: al ejecutarse en bucle abierto con chunks de 100 pasos, puede usarse para grabar trayectorias sintéticas y compararlas con demostraciones humanas.
- Benchmark interno de robustez: su fallo documentado en tableros completos (desplazamiento de agarre de media casilla hacia el brazo) es útil como caso negativo para evaluar mejoras en políticas posteriores.
- Docencia y divulgación: ejemplo didáctico de cómo una política ACT sobreajustada a una distribución estrecha falla al cambiar la distribución visual, con métricas concretas (10/10 en vacío, fallo en partida real).
- Base para fine-tuning: al ser Apache 2.0 y pesar 0,2 GB, puede servir de inicialización para variantes con cámara de muñeca exclusiva o con más datos de tablero completo, aunque el autor ya lo considera superado.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Tasa de acierto en tablero casi vacío (rangos 1-5, todos los tipos de pieza) | 10/10 al primer intento |
| Tiempo por recogida | 3,3-4,1 s |
| Pérdida de entrenamiento | 6,8 -> 0,025 (100.000 pasos) |
| Rendimiento en partida real (piezas negras en rangos 7-8) | Falla; el agarre se desplaza ~media casilla hacia el brazo |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K ni equivalentes de robótica como LIBERO o Meta-World) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros en fp32 el peso ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más, sumando el coste de las dos cámaras y el preprocesado ResNet-18.
- GPU de entrenamiento documentada: RTX 4000 SFF Ada (20 GB), batch 8, 100.000 pasos.
- GPU recomendadas para entrenamiento: cualquier GPU con al menos 8-12 GB de VRAM para replicar el batch 8; para batches mayores o varias cámaras, A100 o H100 no son necesarias por el tamaño del modelo, pero aceleran la recolección de datos.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares; no se documentan requisitos mínimos oficiales.
- Opciones de despliegue: LeRobot (librería nativa), script `chess/play.py` del repositorio so101-chess; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; el único dato temporal es la duración de la tarea completa (3,3-4,1 s por recogida), que incluye movimiento físico del brazo y no solo inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| so101-chess-act-pick-v1 | 51,7 M | chunk de 100 acciones | Recogida de piezas SO101 | Apache 2.0 | Hugging Face (0 descargas, 0 likes) |
| Políticas wrist-only del mismo autor (sucesoras) | no disponible | no disponible | Recogida de piezas SO101 | no disponible | Mencionadas en la model card, sin enlace directo |
| ACT original (Zhao et al.) | no disponible en esta ficha | chunk de acciones | Manipulación bimanual ALOHA | no disponible | Repositorio y paper públicos |

No se dispone de datos de benchmarks comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Falla en partidas reales: con piezas negras en los rangos 7-8 el agarre se desplaza aproximadamente media casilla hacia el brazo, porque parte de la estimación proviene de la vista cenital y el modelo nunca vio un tablero completo.
- Solo funciona desde la pose inicial prevista (hover a 8 cm sobre una pieza con pinzas abiertas); desde otra pose inicial no produce resultados útiles.
- Depende de los mismos pads de pinza vistos en la cámara de muñeca durante el entrenamiento; cambiarlos invalida la política.
- Ejecución en bucle abierto con `n_action_steps` = 100: no corrige desviaciones a mitad del chunk, lo que agrava errores de posicionamiento.
- Sesgo de distribución: entrenada solo con el dataset `so101_pick3_clean`, con tableros casi vacíos y rangos 1-5; no hay datos de sesgos sociales por no tratar texto ni imágenes naturales.
- Riesgo de alucinación no aplicable en el sentido lingüístico, pero sí de generalización espuria: el modelo puede producir trayectorias plausibles pero incorrectas fuera de su distribución.
- Licencia Apache 2.0 permite uso comercial, pero el autor la declara superada por políticas posteriores; no se recomienda para producción.
- Sin descargas ni likes en Hugging Face y con un único commit de subida: no hay evidencia de validación por terceros.
- No se documentan idiomas, cuantizaciones ni formatos alternativos de pesos; el repo pesa 0,2 GB.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dev-devadath/so101-chess-act-pick-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/Dev-devadath/so101_pick3_clean
- Repositorio del proyecto so101-chess: https://github.com/Dev-devadath/so101-chess
- LeRobot (librería y framework): https://github.com/huggingface/lerobot
- Paper de ACT (Action Chunking with Transformers): no disponible en la información proporcionada
