# grKnight/pointcal-c

## Resumen

PointCal-C es un cabezal de calibración y abstención post-hoc diseñado para mejorar la fiabilidad de la clasificación zero-shot de nubes de puntos 3D bajo condiciones de corrupción. Desarrollado por grKnight, se basa en el modelo CLIP ViT-B/32 de LAION (`laion/CLIP-ViT-B-32-laion2B-s34B-b79K`), que se mantiene congelado durante todo el proceso. El modelo resuelve el problema de la degradación de la calibración de confianza cuando los datos de entrada sufren corrupciones (ruido, oclusión, etc.), un problema crítico en aplicaciones de visión 3D en entornos reales.

La propuesta es notablemente ligera: solo se ajustan cuatro parámetros escalares (temperatura, sesgo, peso de confianza y peso de desacuerdo) sobre un conjunto de calibración limpio, sin tocar los pesos del backbone. Esto permite obtener mejoras sustanciales en el error de calibración esperado (ECE) y una ligera mejora en el área bajo la curva de riesgo-cobertura (AURC), con un coste computacional mínimo (0,94 segundos de ajuste en CPU y 0,105 GPU-horas de inferencia en total).

El modelo se evalúa en ModelNet40-C, un benchmark de referencia para robustez 3D con 15 tipos de corrupción y 5 niveles de severidad. Aunque la precisión absoluta es baja (~0,29 en datos limpios), su contribución principal es metodológica: demuestra que es posible auditar y mejorar la fiabilidad de un modelo de visión 3D sin reentrenar el backbone, y proporciona todos los artefactos de evaluación (logits, métricas, intervalos bootstrap) para permitir reanálisis sin coste de GPU.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP ViT-B/32 congelado (`laion/CLIP-ViT-B-32-laion2B-s34B-b79K`) + cabezal de calibración con 4 escalares |
| Parametros totales | Backbone CLIP ViT-B/32 (congelado); cabezal calibrado: 4 escalares |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión 3D) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de visión, no de lenguaje) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | JSON (parámetros calibrados), NPZ (logits por vista) |

## Arquitectura y entrenamiento

El modelo se compone de un backbone CLIP ViT-B/32 (`laion/CLIP-ViT-B-32-laion2B-s34B-b79K`) que se carga congelado, en modo evaluación, con `requires_grad_(False)`. El componente entrenable es un cabezal de calibración formado por cuatro escalares: `temperature` (1,2309), `bias` (-1,5723), `weight_confidence` (1,7071) y `weight_disagreement` (4,9158). Estos parámetros se ajustan sobre un conjunto de calibración limpio (493 objetos de ModelNet40-C) y nunca ven datos corruptos ni etiquetas de corrupción.

La inferencia sigue un pipeline de proyección multi-vista: la nube de puntos (N, 1024, 3) se centra en el centroide y se normaliza por radio unitario, luego se proyecta en seis cámaras ortográficas (frontal, derecha, trasera, izquierda, superior, inferior), se rasteriza a 64x64 píxeles con z-buffer de profundidad y se reescala a 224x224. Cada vista se procesa con el encoder de imagen CLIP, y los logits resultantes se combinan mediante un promedio sobre las vistas. La puntuación combinada se calcula como `sigmoid(bias + w_conf * logit(p_cal) + w_dis * d)`, donde `d` es 1 menos la divergencia media de Jensen-Shannon entre las seis vistas.

El entrenamiento es un ajuste de calibración, no un entrenamiento de red neuronal: se resuelve en 0,94 segundos en CPU, convergiendo sin degeneración. Todos los artefactos de evaluación (logits por vista, métricas, intervalos bootstrap) se almacenan en el repositorio, lo que permite reanálisis completos sin coste adicional de GPU.

## Capacidades

- Clasificación zero-shot de nubes de puntos 3D en 40 clases (ModelNet40-C) mediante proyección multi-vista y codificación CLIP.
- Calibración de confianza: reduce el ECE de 0,1160 a 0,0245 en datos limpios y de 0,1416 a 0,0229 en datos corruptos.
- Abstención selectiva: proporciona una puntuación de confianza combinada que permite rechazar predicciones de baja confianza (mejora AURC en 0,021).
- Detección de corrupción: la puntuación combinada integra el desacuerdo entre vistas, lo que permite identificar entradas corruptas.
- Reanálisis sin coste: los logits almacenados permiten probar nuevas métricas o agregaciones sin volver a ejecutar CLIP.
- No es un modelo generativo de texto ni código; no soporta tool calling ni agentes.

## Casos de uso

- Auditoría de fiabilidad en sistemas de clasificación 3D: PointCal-C permite medir y mejorar la calibración de un clasificador CLIP en entornos de producción, identificando cuándo las predicciones son poco fiables debido a corrupción de datos.
- Sistema de abstención en robótica: un robot que clasifica objetos mediante nubes de puntos puede usar la puntuación combinada para abstenerse de actuar cuando la confianza es baja, evitando errores costosos en entornos ruidosos.
- Evaluación de robustez de modelos CLIP: los artefactos del repositorio permiten comparar el comportamiento de CLIP bajo diferentes tipos de corrupción (15 tipos, 5 severidades) y validar hipótesis sobre degradación de rendimiento.
- Benchmarking de calibración en visión 3D: sirve como referencia metodológica para investigar técnicas de calibración post-hoc en modelos de visión 3D zero-shot.
- Investigación en incertidumbre y selective prediction: el modelo proporciona un caso de estudio completo con intervalos bootstrap y análisis de ablaciones para estudiar el comportamiento de la confianza bajo distribución shift.
- Integración en pipelines de clasificación 3D con control de calidad: en aplicaciones de escaneo 3D o inspección industrial, el modelo puede filtrar predicciones de baja confianza antes de pasarlas a un sistema de decisión.

## Benchmarks y rendimiento

Resultados reportados en la model card (ModelNet40-C, 1975 objetos de evaluación, intervalos bootstrap al 95% sobre IDs de objetos):

| Métrica | Limpio | Corrupto (75 condiciones) |
|---|---|---|
| Accuracy | 0,2896 | 0,2354 |
| ECE (MSP) | 0,1160 | 0,1416 |
| ECE (combinado) | 0,0245 | 0,0229 |
| AURC (MSP) | 0,4339 | 0,5217 |
| AURC (combinado) | 0,4147 | 0,5008 |

La precisión por severidad es monótonamente no creciente: 0,2896 (limpio), 0,2593 (severidad 1), 0,2515 (severidad 2), 0,2388 (severidad 3), 0,2252 (severidad 4), 0,2023 (severidad 5). No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Inferencia: requiere una GPU para ejecutar el encoder CLIP (aunque el backbone está congelado, se necesita cómputo de visión). El estudio usó una RTX 4000 Ada con 12,1 GB de VRAM pico.
- Tier xs (5 condiciones, 100 objetos): 2,5 GB de VRAM, 1091 vistas/segundo.
- Tier s (13 condiciones) y full (76 condiciones): 12,1 GB de VRAM, ~2800 vistas/segundo.
- El ajuste de calibración se realiza en CPU en menos de 1 segundo.
- No se mencionan opciones de despliegue específicas (vLLM, Ollama, TGI no aplican por no ser un LLM). El código está disponible en GitHub y se puede ejecutar con Python/PyTorch.
- Coste total de inferencia: 0,105 GPU-horas (aproximadamente 0,03 USD en una RTX 4000 Ada a 0,28 USD/hora).

## Comparativa con modelos similares

No se proporcionan comparaciones con otros modelos en la información disponible. PointCal-C es un artefacto de investigación único en su categoría (calibración post-hoc para CLIP 3D), y no se identifican alternativas directas publicadas con las mismas métricas. Modelos como PointCLIP o PointCLIP V2 abordan la clasificación 3D zero-shot, pero no incluyen calibración ni abstención bajo corrupción.

## Limitaciones y advertencias

- Precisión absoluta baja (0,2896 en datos limpios): es transferencia zero-shot de un modelo 2D a renders de profundidad, sin entrenamiento 3D específico.
- La mejora de AURC es pequeña (0,021) y debe interpretarse con los intervalos bootstrap, no como una ganancia destacada.
- Solo se evalúa en ModelNet40-C; no se garantiza el comportamiento en otros datasets o dominios 3D.
- El backbone CLIP hereda sesgos de los datos de entrenamiento 2D (LAION-2B), que pueden manifestarse en la clasificación de objetos 3D.
- El modelo no genera texto ni código; no es adecuado para tareas de lenguaje natural.
- El repositorio usa 200 réplicas bootstrap en el tier `full`, no las 1000 preregistradas; los intervalos pueden ser menos estables.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero el modelo no es un producto final; requiere integración con un sistema de visión 3D.
- La fecha de creación (2026-08-16) es posterior a la fecha actual del sistema; verificar la vigencia del repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/grKnight/pointcal-c
- Código (GitHub): https://github.com/crimsonKn1ght/pointcal-c
- Modelo base: https://huggingface.co/laion/CLIP-ViT-B-32-laion2B-s34B-b79K
