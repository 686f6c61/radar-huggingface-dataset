# HlibPlakhtii/microduck-sprint-quicksilver-v4

## Resumen

Quicksilver Sprint v4 es una política de control robótico publicada por HlibPlakhtii como entrada para la competición Microduck Arena 2 m Sprint. No es un modelo de lenguaje: se trata de un controlador entrenado por aprendizaje por refuerzo que genera comandos motores para un robot cuadrúpedo simulado (el "microduck") con el objetivo de recorrer 2 metros en el menor tiempo posible a una velocidad comandada de 0,2 m/s. El modelo se distribuye en formato ONNX para su ejecución en el runner local oficial (versión 5).

El modelo es un fine-tuning del policy `jrubiosainz/microduck-game-sprinter-remix14`, al que se han añadido cinco trayectorias ajustadas mediante búsqueda local para optimizar zancadas iniciales, impulsos motores y fases de frenado. El resultado declarado por el autor es un tiempo medio de 0,817 s sobre cinco arranques oficiales, con una dispersión muy baja (0,815-0,825 s).

Su relevancia es acotada: se trata de un artefacto de competición con cero descargas y sin documentación técnica sobre arquitectura interna, datos de entrenamiento o hiperparámetros. Resulta útil como referencia de política de locomoción para simulación y como ejemplo de fine-tuning de policies robóticas en formato ONNX, pero no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control robótico, presumiblemente red neuronal; arquitectura interna no documentada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Modelo base | jrubiosainz/microduck-game-sprinter-remix14 (finetune) |
| Pipeline | robotics |
| Tamano del repositorio | 0.0 GB (segun Hugging Face) |
| Entorno de ejecucion | runner local oficial Microduck Arena, version 5 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red (número de capas, tipo de encoder, dimensiones de observación o acción). Se sabe que es una política de control entrenada sobre el modelo base `jrubiosainz/microduck-game-sprinter-remix14`, que a su vez procede de un pipeline de robótica y se distribuye como policy ONNX para el simulador Microduck.

El proceso de mejora descrito por el autor consiste en añadir cinco trayectorias "observation-matched" al policy upstream y aplicar búsqueda local para ajustar zancadas tempranas, impulsos motores y fases de asentamiento/frenado. Cada trayectoria seleccionada y su fase de settling se reprodujeron contra el policy ONNX exportado para verificar que el comportamiento observado en simulación se mantiene en el artefacto final. No se especifican número de tokens, composición del dataset, ni si hubo RLHF, DPO u otro esquema de optimización; tampoco se documentan innovaciones como decodificación especulativa o atención lineal, que no aplican a este tipo de modelo.

## Capacidades

- Generación de comandos motores para locomoción de un robot cuadrúpedo simulado en el entorno Microduck Arena.
- Ejecución de una carrera de 2 metros a velocidad comandada de 0,2 m/s con tiempos de finalización declarados de 0,815-0,825 s.
- Control de zancada inicial, impulsos motores intermedios y fase de frenado/settling.
- Reproducibilidad verificada: cada trayectoria se replicó contra el ONNX exportado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, multilingüismo, visión, audio ni modo thinking; no es un modelo de lenguaje.
- Ejecución en el runner local oficial v5 de Microduck Arena.

## Casos de uso

- Benchmark de locomoción en simulación: usar el policy como referencia de tiempo de recorrido (0,817 s de media) para comparar nuevas políticas de sprint en Microduck Arena.
- Fine-tuning de políticas de control: partir de este modelo para explorar variantes de zancada o de perfil de velocidad en el mismo entorno simulado.
- Validación de pipelines de exportación ONNX: el modelo sirve como caso de prueba de que una política entrenada se comporta igual tras la exportación, ya que el autor verificó cada trayectoria contra el artefacto final.
- Investigación en ajuste fino de políticas robóticas: estudiar cómo la búsqueda local sobre trayectorias afecta al tiempo de finalización y a la dispersión entre arranques.
- Educación y demos de RL aplicado a robótica: ejemplo compacto de policy de competición con métricas de rendimiento publicadas y verificables.
- Integración en el runner oficial: ejecutar el modelo en la versión 5 del runner local para reproducir los cinco arranques oficiales y contrastar los tiempos reportados.

## Benchmarks y rendimiento

| Arranque oficial | Tiempo de finalización (s) |
|---|---:|
| 1 | 0,815 |
| 2 | 0,815 |
| 3 | 0,825 |
| 4 | 0,815 |
| 5 | 0,815 |
| Media | 0,817 |

Los datos proceden de la model card del autor y corresponden al runner local oficial (versión 5) a una velocidad comandada de 0,2 m/s. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB según Hugging Face, lo que sugiere un artefacto ONNX muy pequeño, pero no se confirma el tamaño exacto.
- GPU recomendadas: no disponibles; al ser una policy de control de baja dimensionalidad, probablemente ejecutable en CPU.
- Compatibilidad con GPU de consumo: no confirmada, pero por el tamaño del artefacto es plausible que funcione en cualquier GPU consumer o incluso en CPU.
- Opciones de despliegue: ONNX Runtime (formato nativo del artefacto) y el runner local oficial de Microduck Arena v5. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| HlibPlakhtii/microduck-sprint-quicksilver-v4 | Policy robótica (ONNX) | no disponible | no aplica | 0,817 s media en 2 m a 0,2 m/s | Apache 2.0 | Hugging Face (0 descargas) |
| jrubiosainz/microduck-game-sprinter-remix14 | Policy robótica (modelo base) | no disponible | no aplica | no disponible | no disponible en la informacion proporcionada | Hugging Face |
| Otras entradas de Microduck Arena | Policy robótica | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de las alternativas en la información proporcionada, por lo que la comparativa cuantitativa no es posible.

## Limitaciones y advertencias

- Modelo de nicho: es una policy de control para un simulador concreto (Microduck Arena), no un modelo de lenguaje ni de propósito general; no debe evaluarse con métricas de NLP.
- Ausencia de documentación técnica: no se detallan arquitectura, número de parámetros, datos de entrenamiento ni hiperparámetros, lo que dificulta la reproducibilidad del entrenamiento.
- Métricas limitadas: solo se reportan cinco arranques en un único entorno simulado; no hay validación en otros escenarios, velocidades o condiciones.
- Riesgo de sobreajuste al simulador: el ajuste por búsqueda local sobre trayectorias específicas puede no generalizar a perturbaciones no vistas.
- Cero adopción: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso externo ni revisión por pares.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se deben preservar los avisos de atribución del modelo base (`BASE_MODEL_CARD.md`, `NOTICE`, `LICENSE`).
- Fecha de creación futura (2026-11-18) según los metadatos de Hugging Face; conviene verificar la vigencia y el estado del repositorio antes de usarlo en producción.
- No se han identificado sesgos, riesgos de alucinación ni limitaciones idiomáticas aplicables, ya que el modelo no procesa lenguaje natural.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HlibPlakhtii/microduck-sprint-quicksilver-v4
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix14
- Revisión fijada del modelo base: https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix14/tree/e9a74fa9a55e00f972e87d158f40db660a54be91
- Verificación local (referenciada en la model card): `local-verification.json` en el repositorio
- Procedencia de trayectorias (referenciada en la model card): `provenance.json` en el repositorio
- Aviso de licencia del modelo base: `NOTICE` en el repositorio
- Licencia: `LICENSE` en el repositorio
