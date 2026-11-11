# gianexe/leo-collision-avoidance-mappo

## Resumen

leo-collision-avoidance-mappo es un checkpoint de aprendizaje por refuerzo multiagente (MARL) desarrollado por el autor de Hugging Face `gianexe` como parte de una tesis. El modelo implementa un actor compartido entrenado con MAPPO (Multi-Agent Proximal Policy Optimization) que decide cuándo y cómo debe maniobrar un satélite en órbita terrestre baja (LEO) para evitar un acercamiento peligroso (conjunción) con otro objeto. Cada satélite percibe únicamente a su vecino más amenazante (`k = 1`), sin comunicación ni reglas de prioridad entre agentes.

El entorno de simulación se construye sobre OrbitZoo, un conjunto de desafíos de sistemas orbitales reales para RL que utiliza la API de PettingZoo y un backend de propagación Orekit. El modelo no es un LLM ni un transformer generativo: es una política de control con una red de aproximadamente 11.700 pesos (22 entradas, capas ocultas de 128 y 64 neuronas, 7 acciones discretas), entrenada en una curriculum de 16, 64 y 150 agentes. Su relevancia radica en que aborda un problema operativo real —la gestión de tráfico espacial y la evitación de colisiones en LEO— con un enfoque de RL multiagente descentralizado y de bajo coste computacional.

El checkpoint final (`v4_stage3_seed42.pt`) se entrenó en unas 4 horas en un Apple M1 MacBook Air con 8 GB de RAM, sin GPU, y se evalúa sobre un benchmark congelado de 20 episodios retenidos por cada tamaño de constelación. El modelo supera a una regla basada en física en la reducción de acercamientos peligrosos a 64 y 150 agentes, aunque a costa de un mayor gasto de delta-v.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal fully-connected (actor compartido MAPPO); capas ocultas de 128 y 64 neuronas |
| Parametros totales | Aproximadamente 11.700 pesos |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; percepción de `k = 1` vecino más amenazante por paso |
| Tipos de cuantizacion | No disponible (checkpoint PyTorch `.pt` en precisión nativa) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | PyTorch checkpoint (`.pt`) |

## Arquitectura y entrenamiento

La política es un actor compartido (parameter sharing) entrenado con MAPPO. El actor recibe 22 entradas y produce 7 acciones discretas: no encender motor, prograde, retrograde, radial hacia fuera, radial hacia dentro y cross-track en cualquiera de los dos sentidos. Durante el entrenamiento se emplea un crítico centralizado, que no se usa en inferencia. La percepción se limita al vecino más amenazante (`k = 1`), sin canal de comunicación ni prioridad entre satélites. Cada maniobra aplica 0,5 m/s con hasta 7 N de empuje (Isp 300 s, encendido de hasta 60 s), con un intervalo de decisión fijo de 120 s y 25 decisiones por episodio.

El entrenamiento sigue una curriculum de tres etapas (16, 64 y 150 agentes), cada una partiendo del actor de la etapa anterior. Se completó en aproximadamente 4 horas en un Apple M1 MacBook Air con 8 GB, sin GPU, y no se produjeron colisiones durante el entrenamiento. El entorno se construye sobre OrbitZoo (arXiv:2504.04160), con propagación orbital vía Orekit y API de PettingZoo. El mantenimiento de estación (station-keeping) queda fuera del alcance: la política solo aprende a evitar, y la deriva y el delta-v de retorno se miden, no se vuelan.

## Capacidades

- Toma de decisiones de evitación de colisiones en órbita terrestre baja para constelaciones de 16, 64 y 150 satélites.
- Selección discreta de maniobras entre 7 primitivas (sin encendido, prograde, retrograde, radial out, radial in, cross-track en ambos sentidos).
- Percepción descentralizada del vecino más amenazante (`k = 1`), sin comunicación entre agentes.
- Política determinista en evaluación, adecuada para reproducibilidad en benchmark.
- Generalización a distintos tamaños de constelación mediante parameter sharing y curriculum.
- No soporta tool calling, function calling, agentes multi-step genéricos ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación en RL multiagente para gestión de tráfico espacial: el checkpoint sirve como línea base reproducible para comparar algoritmos MARL (MAPPO frente a otras variantes) en escenarios de conjunción generados desde catálogos TLE, gracias a su bajo coste de entrenamiento y a la disponibilidad de configuración de evaluación congelada.
- Evaluación de políticas de evitación en constelaciones densas: con 150 agentes y 25 decisiones por episodio, el modelo permite medir la tasa de resolución de acercamientos (<1 km) frente a políticas no-op y basadas en reglas físicas en un benchmark fijo de 20 episodios.
- Estudio de compromisos coste-seguridad: al gastar aproximadamente un 26 % más de delta-v que la regla física (1,76 frente a 1,40 m/s a 150 agentes), el modelo es útil para analizar la frontera entre seguridad y presupuesto de propelente en operaciones de constelación.
- Docencia y tesis en mecánica orbital y RL: el repositorio asociado permite clonar, descargar el checkpoint y ejecutar `oz evaluate` con Python 3.10/3.11 sin GPU, lo que facilita su uso en entornos académicos con hardware modesto.
- Prototipado de planificadores de maniobra con propulsión de respuesta rápida (clase 7 N): el modelo puede integrarse como componente de decisión en simuladores que asuman primitivas discretas de 0,5 m/s y encendidos de hasta 60 s.
- Análisis de robustez entre semillas: con dos semillas de entrenamiento (42 y 7, esta última con 93,0 % de resolución), el checkpoint permite estudiar la variabilidad de la política y distinguir mejoras reales del ruido de entrenamiento (aproximadamente 0,4 acercamientos por episodio entre semillas).
- Comparación con reglas operativas: sirve para contrastar heurísticas basadas en física frente a políticas aprendidas en términos de acercamientos resueltos y delta-v consumido, con significación estadística reportada (Wilcoxon pareado p = 0,0021 a 64 agentes y p = 0,0003 a 150).

## Benchmarks y rendimiento

Evaluación sobre un benchmark congelado de 20 episodios retenidos por tamaño, con el actor en modo determinista. Un acercamiento peligroso se define como un paso a menos de 1 km. Se muestra el número de acercamientos por episodio y, entre paréntesis, el porcentaje resuelto respecto a la política de no maniobra (no-op).

| Agentes | No-op | Regla física | Este modelo |
| ---: | ---: | ---: | ---: |
| 16 | 8,55 | 0,45 (94,7 %) | 0,40 (95,3 %) |
| 64 | 43,60 | 4,30 (90,1 %) | 3,00 (93,1 %) |
| 150 | 101,20 | 10,40 (89,7 %) | 7,45 (92,6 %) |

- A 64 y 150 agentes la mejora frente a la regla física es significativa (Wilcoxon pareado p = 0,0021 y p = 0,0003). A 16 agentes no lo es.
- Ninguna política provocó una colisión en ningún tamaño.
- Coste: el modelo gasta aproximadamente un 26 % más de delta-v total que la regla (1,76 frente a 1,40 m/s a 150 agentes, incluyendo el retorno calculado a la ranura).
- Una segunda semilla de entrenamiento (7) resuelve el 93,0 %. La dispersión entre semillas es de aproximadamente 0,4 acercamientos por episodio, por lo que diferencias menores no se separan del ruido de entrenamiento.
- Debilidad remanente: de 142 conjunciones a 150 agentes en las que ningún satélite maniobró, 15 no se resolvieron.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo es una red de aproximadamente 11.700 pesos y se ejecuta en CPU.
- GPU recomendadas: no se requiere GPU. El entrenamiento se completó en un Apple M1 MacBook Air con 8 GB de RAM.
- Cabe en cualquier equipo consumer: portátiles y equipos de escritorio sin acelerador dedicado.
- Opciones de despliegue: el checkpoint se carga únicamente mediante el código de la tesis (`oz evaluate`), no a través de vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de política.
- Latencia y throughput estimados: no disponibles. El coste dominante es la propagación orbital (Orekit) y el bucle de evaluación, no la inferencia de la red.
- Requisitos de entorno: Python 3.10 o 3.11 (se recomienda 3.11). Los datos de escenario (`data/full/`, catálogo TLE) no se incluyen en el repositorio de Hugging Face y deben aportarse según se describe en el repositorio de código.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (políticas MARL para evitación de colisiones en LEO) en la información proporcionada. La model card únicamente compara el modelo con dos políticas de referencia dentro del mismo benchmark: no-op (sin maniobra) y una regla basada en física, cuyos resultados se recogen en la sección de benchmarks.

| Criterio | Este modelo | Regla física | No-op |
|---|---|---|---|
| Tipo | Política MARL (MAPPO) | Heurística basada en física | Sin maniobra |
| Parámetros | ~11.700 pesos | No aplica | No aplica |
| Contexto | `k = 1` vecino más amenazante | No disponible | No aplica |
| Acercamientos a 150 agentes | 7,45 (92,6 %) | 10,40 (89,7 %) | 101,20 |
| Delta-v a 150 agentes | 1,76 m/s | 1,40 m/s | 0 m/s |
| Licencia | No disponible | No disponible | No aplica |

## Limitaciones y advertencias

- Entrenado y evaluado sobre escenarios de conjunción generados a partir de datos de catálogo TLE, no sobre eventos operativos reales.
- Asume propulsión con capacidad de respuesta a corto plazo (clase 7 N, 0,5 m/s por acción), lo que restringe su aplicabilidad a satélites con ese tipo de motor.
- Primitivas de maniobra discretas (0,5 m/s, encendidos de hasta 60 s) con un intervalo de decisión fijo de 120 s; no modela maniobras continuas ni ventanas variables.
- El mantenimiento de estación queda fuera del alcance: la política solo evita, y la deriva y el delta-v de retorno se miden, no se vuelan.
- La variación reportada es solo entre episodios y entre dos semillas de entrenamiento; diferencias inferiores a 0,4 acercamientos por episodio no son separables del ruido.
- Debilidad remanente documentada: 15 de 142 conjunciones a 150 agentes sin maniobra de ningún satélite no se resolvieron.
- Licencia no disponible: no se especifican condiciones de uso comercial; debe consultarse con el autor antes de cualquier uso en producción.
- El archivo `.pt` es un checkpoint PyTorch y su carga deserializa datos (unpickling); solo debe cargarse con el código del repositorio y desde el repositorio indicado.
- No es un modelo de lenguaje: no admite prompts en lenguaje natural, tool calling ni razonamiento multi-step genérico.
- Sesgos conocidos: no disponibles en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gianexe/leo-collision-avoidance-mappo
- Código de la tesis: https://github.com/gian-gg/marl-mappo-leo-collision-avoidance
- Paper de OrbitZoo (arXiv:2504.04160): https://arxiv.org/abs/2504.04160
