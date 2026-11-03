# jrubiosainz/microduck-sock-heist-6m-rz-tail-r2

## Resumen

Microduck Sock Heist 6m rz-tail-r2 es una política de control para robótica presentada como un único fichero ONNX de 1.188.643 bytes, ensamblada por el usuario jrubiosainz para el entorno MicroDuck Arena de Pollen Robotics. No es un modelo de lenguaje: se trata de una política de comportamiento ("behavioral cloning" por tabla de búsqueda) que mapea observaciones de 61 dimensiones a acciones de control, empaquetada en un grafo ONNX con un mecanismo de lookup y un fallback de normalizador/MLP heredado del modelo lphatnguyen/microduck-sock-heist-6m-v4.

El modelo es una composición ("merge") de siete políticas base: v4 y v3 de lphatnguyen, second-green-v2 y remix-rz-tail de rumezhak, microduck-heist de a1rb4Ck, y dos variantes propias de jrubiosainz (94cd-tail y rz-tail-r1n). Cada una aporta segmentos de filas de la tabla de búsqueda correspondientes a los cinco "seeds" oficiales del entorno Sock Heist; el resultado es una política compuesta que cubre los cinco escenarios con un tiempo medio declarado de 4,981 s por episodio.

Su relevancia es acotada y muy específica: sirve como entrada para el benchmark MicroDuck Arena en modo canónico, con evidencia de replay in-sample sobre los cinco seeds oficiales. No hay declaración de licencia completa, los derechos de autoría upstream están sin resolver y el propio autor advierte que la evaluación del servidor Arena es la única autoritativa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control en grafo ONNX con tabla de búsqueda (lookup) sobre 61 dimensiones de observación y fallback normalizador/MLP |
| Parámetros totales | no disponible (el repo ocupa 0,0 GB; el fichero policy.onnx pesa 1.188.643 bytes) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la "entrada" es una observación de 61 dimensiones por tick) |
| Tipos de cuantización | no disponible; pesos y tensores en float32 según la model card |
| Idiomas soportados | no disponible (no aplica; política robótica, sin interfaz de lenguaje) |
| Licencia | no disponible; upstream sin resolver, con textos Apache-2.0 parciales y NOTICE heredados |
| Formato de pesos | ONNX (policy.onnx, SHA256 bca5a66220a4b7b5fb81d987b8fb904d080d9574094a29800740e75d0902a52f) |

## Arquitectura y entrenamiento

La política es un grafo ONNX que implementa una búsqueda exacta sobre una tabla de claves físicas (columnas 0:48 de la observación) con tolerancia float32 de 1e-5, más un fallback de normalizador y MLP heredado de lphatnguyen v4 para observaciones no cubiertas. La versión F2 amplía la máscara de búsqueda: `L_mask[48:61]` pasa de cero a uno, de modo que la comparación incluye las 61 dimensiones de observación, incluidas las columnas de comando 48 y 50 (1.414 patrones de bits float32 modificados). Las claves físicas en 0:48, las acciones, el grafo, el fallback y los metadatos originales se conservan byte a byte respecto a la base C1b.

El "entrenamiento" no es un entrenamiento neuronal convencional: es una composición por segmentos de filas de tablas de búsqueda procedentes de políticas especializadas. El seed 1 toma las filas [0,267) de rz-tail-r1n; los seeds 2, 3 y 4 toman filas de v4 ([242,506), [506,749) y [749,994) respectivamente, con las columnas de comando restauradas literalmente de v4); el seed 5 toma filas del donante 84a7b596 ([1101,1376)), cuyos controles de cola se reoptimizaron con CMA-ES separable contra el runner oficial. Las columnas de comando de los seeds 1 y 5 son volcados reales de la cola de comandos x86 a vx=1.0, no ceros sintéticos. La evidencia de replay se generó en x86-64 con Arena 0.7.0, Python 3.12.15, MuJoCo 3.10.0, NumPy 2.4.1 y ONNX Runtime 1.24.4.

## Capacidades

- Control robótico en el entorno MicroDuck Sock Heist: genera acciones de control a partir de observaciones de 61 dimensiones.
- Cobertura de los cinco seeds oficiales del entorno Sock Heist mediante segmentos de tabla de búsqueda específicos por seed.
- Modo de entrada canónico: omite `command_vx` y `--speed`, y deja que Arena seleccione la velocidad mediante su barrido canónico.
- Búsqueda exacta con tolerancia float32 1e-5 sobre claves físicas y de comando.
- Fallback normalizador/MLP para observaciones fuera de la tabla.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, function calling, capacidades de agente ni multilingüismo.

## Casos de uso

- Evaluación en MicroDuck Arena: la política se envía como `policy.onnx` al servidor Arena en modo canónico para obtener la puntuación autoritativa sobre los cinco seeds oficiales; es el uso previsto por el autor.
- Replay local de validación: reproducir los episodios con Arena 0.7.0, MuJoCo 3.10.0 y ONNX Runtime 1.24.4 para verificar los ticks declarados (968, 1058, 974, 984 y 997) antes de cualquier envío.
- Estudio de composición de políticas: analizar cómo el ensamblado por segmentos de filas de distintas políticas base afecta al comportamiento en cada seed, comparando con el control v4 (4,987 s, 972/1058/974/984/999 ticks).
- Investigación sobre lookup policies: usar el grafo como referencia de un mecanismo de búsqueda con máscara completa de 61 dimensiones y fallback MLP, útil para estudiar robustez frente a observaciones fuera de tabla.
- Base para ablaciones de la cola de comandos: comparar los volcados reales de comando a vx=1.0 de los seeds 1 y 5 frente a las columnas restauradas de v4 en los seeds 2-4.
- Docencia o experimentación con entornos MuJoCo de bajo coste: el fichero de 1,2 MB se ejecuta con ONNX Runtime en CPU, sin requisitos de GPU, lo que facilita reproducir el pipeline en máquinas modestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; no aplican a una política robótica. La model card aporta evidencia de replay in-sample sobre los cinco seeds oficiales con Arena 0.7.0:

| Seed | vx fijo = 1.0 y tiempo canónico | Ticks (0,005 s) |
|---|---|---|
| 1 | 4,840 s | 968 |
| 2 | 5,290 s | 1058 |
| 3 | 4,870 s | 974 |
| 4 | 4,920 s | 984 |
| 5 | 4,985 s | 997 |

Suma 4.981 ticks, media 4,981 s, los cinco episodios terminan. El control v4 en el mismo lanzamiento registra 4,987 s (972/1058/974/984/999 ticks). El barrido completo de 21 velocidades del seed 1 selecciona finalistas [1.0, 0.9, 1.2]; la evaluación canónica elige 1.0 y sus ticks por seed coinciden con la ejecución a velocidad fija. El autor subraya que es evidencia in-sample sobre los cinco seeds oficiales, no una afirmación de generalización ni de independencia del comando, y que la evaluación del servidor Arena es la autoritativa.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el fichero ONNX de 1,2 MB se ejecuta en CPU con ONNX Runtime.
- GPU recomendadas: no disponible; no se requieren GPU para la inferencia de la política.
- Cabe en cualquier hardware consumer: el cuello de botella es el simulador MuJoCo, no la política.
- Opciones de despliegue: ONNX Runtime 1.24.4 (versión usada en la evidencia de replay) dentro del runner de MicroDuck Arena 0.7.0; no se documentan otros runtimes.
- Latencia y throughput: no disponibles de forma aislada; la model card solo reporta ticks de simulación a 0,005 s por tick (968-1058 ticks por episodio).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-sock-heist-6m-rz-tail-r2 (este) | no disponible (ONNX 1,2 MB) | no aplica | media 4,981 s en 5 seeds in-sample | no disponible / upstream sin resolver | HuggingFace, 0 descargas |
| lphatnguyen/microduck-sock-heist-6m-v4 | no disponible | no aplica | 4,987 s en el mismo lanzamiento (control) | no declarada | HuggingFace |
| jrubiosainz/microduck-sock-heist-6m-rz-tail-r1n | no disponible | no aplica | no disponible | no declarada (NOTICE y Apache parcial) | HuggingFace |
| rumezhak/microduck-sock-heist-second-green-v2 | no disponible | no aplica | no disponible | no declarada | HuggingFace |

## Limitaciones y advertencias

- La evidencia es in-sample sobre los cinco seeds oficiales; el autor no afirma generalización ni independencia respecto al comando.
- El modo previsto es canónico (sin `command_vx` ni `--speed`); no se afirma que vx=0.2 coincida con 1.0 fijo ni con el canónico.
- La evaluación del servidor Arena es la autoritativa y puede diferir del replay local.
- Licencia sin resolver: varios upstream no declaran licencia y los textos Apache-2.0 son parciales y con alcance limitado; no se reclama licencia sobre la política completa. El uso comercial queda en una situación jurídica incierta.
- Riesgo de fallo fuera de la tabla de búsqueda: las observaciones no cubiertas dependen del fallback normalizador/MLP de v4, sin evaluación de robustez publicada.
- La búsqueda usa tolerancia float32 1e-5; pequeñas variaciones numéricas en la observación pueden alterar la coincidencia.
- No es un modelo de lenguaje: no tiene capacidades de texto, código, visión ni tool calling, y no debe evaluarse con benchmarks de NLP.
- El repo figura con 0 descargas y 0 likes, sin validación independiente por terceros.
- El modelo se creó y actualizó el 2026-11-02, con un intervalo de dos segundos entre ambos eventos; no hay historial de iteraciones públicas más allá de lo descrito en la model card.

## Enlaces

- HuggingFace: https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-rz-tail-r2
- Base v4: https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v4
- Base v3: https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v3
- Base rz-tail-r1n: https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-rz-tail-r1n
- Base 94cd-tail: https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-94cd-tail
- Base second-green-v2: https://huggingface.co/rumezhak/microduck-sock-heist-second-green-v2
- Base remix-rz-tail: https://huggingface.co/rumezhak/microduck-sock-heist-remix-rz-tail
- Base microduck-heist: https://huggingface.co/a1rb4Ck/microduck-heist
- MicroDuck Arena (Pollen Robotics): no disponible en la información proporcionada
