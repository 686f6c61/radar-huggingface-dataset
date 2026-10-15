# alexshynkarenk0/byeol

## Resumen

byeol v0.1.0 es un estimador de ego-movimiento para drones de búsqueda y rescate desarrollado por el proyecto *uju* (open search-and-rescue drone). No es una red neuronal: no tiene pesos ni parámetros aprendidos. Es un algoritmo determinista de fusión sensor-cámara que calcula el desplazamiento de imagen entre fotogramas `(dx, dy)` en píxeles a partir de la IMU, la velocidad del controlador de vuelo, la altura sobre la superficie, el ángulo del gimbal y el modelo de cámara, devolviendo además una covarianza 2×2, una confianza y una bandera de validez con motivo de rechazo.

El problema que resuelve es concreto: sobre agua abierta (inundaciones, mar), las superficies con poca textura hacen fracasar a los métodos puramente visuales como la correlación de fase, mientras la estimación basada en física se mantiene estable. En la comparación publicada sobre agua sintética, la estimación física acierta el 100 % de los fotogramas con error ≤1 px incluso con contraste de textura 0.3, frente al 24,2 % de la correlación de fase.

Es relevante ahora porque ofrece una alternativa frágil-a-la-textura para mantener a una persona candidata dentro del encuadre en operaciones de rescate, con un coste computacional muy bajo (3,7 % de un núcleo x86 a 200 Hz de IMU y 30 fps). Su alcance es deliberadamente limitado: es una entrada a un sistema con humano en el bucle, nunca un componente del control de vuelo. Solo se ha evaluado con datos sintéticos.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Estimador determinista basado en física: filtro de actitud de Mahony, filtro de Kalman de velocidad, homografía exacta inducida por plano (altura y normal del plano), propagación linealizada de incertidumbre mediante jacobiano numérico sobre 10 fuentes de error |
| Parámetros totales | No aplica: 0 parámetros aprendidos |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica: procesa pares de fotogramas con estado de IMU, sin ventana de tokens |
| Tipos de cuantización | No aplica: no existen pesos que cuantizar ("no-weights") |
| Idiomas soportados | en, uk (idioma de la documentación; la salida son valores numéricos) |
| Licencia | MIT |
| Formato de pesos | No aplica: no hay pesos. El "modelo" es el código Python en `src/byeol` más su configuración |
| Desarrollado por | The byeol Authors (proyecto *uju* open search-and-rescue drone) |
| Versión y fecha | 0.1.0 · 2026-10-15 |
| Entradas | IMU, velocidad del controlador de vuelo (NED), altura sobre la superficie, ángulo del gimbal, rumbo opcional, modelo de cámara |
| Salidas | Desplazamiento de imagen entre fotogramas `(dx, dy)` en px, covarianza 2×2, confianza, bandera de validez y motivo de rechazo |
| Dependencias | numpy (núcleo). Opcionales: OpenCV, SciPy, PyYAML |
| Dataset de evaluación | alexshynkarenk0/byeol-synth-v1 (sintético) |
| Tamaño del repositorio | 0.0 GB en HuggingFace (coherente con la ausencia de pesos) |

## Arquitectura y entrenamiento

No hay entrenamiento. byeol es una cadena determinista de estimación geométrica. El filtro de Mahony estima la actitud y el sesgo del giroscopio; el incremento de giroscopio corregido por sesgo proporciona la rotación entre fotogramas; el filtro de Kalman de velocidad, actualizado con la velocidad del controlador de vuelo, proporciona la traslación; una homografía exacta de plano (derivada de la altura y de la normal del plano) proyecta el píxel de referencia del fotograma t₀ al fotograma t₁. Finalmente, un jacobiano numérico sobre 10 fuentes de error propaga la covarianza de la estimación.

Los únicos elementos ajustados con datos son dos coeficientes de fusión (0.3/resp y puerta 0.1), calibrados sobre renders sintéticos en el experimento E-004. El resto de parámetros de ruido son valores fijados a mano a partir de las especificaciones de los sensores, no ajustados a datos. La innovación técnica destacable no es algorítmica en el sentido de aprendizaje, sino de diseño: independencia explícita de la textura de la escena y cuantificación de la incertidumbre con cobertura verificable (95 %), junto a un coste de cómputo mínimo.

## Capacidades

- Estimación de ego-movimiento cámara-IMU: desplazamiento de imagen entre fotogramas `(dx, dy)` en píxeles, con stride 1 y stride 5.
- Estimación de incertidumbre: covarianza 2×2 por fotograma, con cobertura del 95 % verificada en la mayoría de escenarios sintéticos.
- Señalización de validez: bandera de validez y motivo de rechazo cuando la estimación no es fiable.
- Robustez a baja textura: mantiene el 100 % de fotogramas con error ≤1 px con contraste de textura 0.3 sobre agua sintética, donde la correlación de fase cae al 24,2 %.
- Robustez a perturbaciones de vuelo: ráfagas de 4 m/s², vibración a 70 Hz y crucero a 5 m/s evaluados en el banco sintético.
- Degradación controlada ante sensores degradados: ruido de IMU ×10, sesgo de giroscopio de 0.05 rad/s y pérdidas de IMU del 3 %.
- Ejecución solo en CPU con numpy; OpenCV, SciPy y PyYAML son opcionales.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni generación de texto, código o matemáticas. No tiene capacidades de visión propias: no detecta personas ni objetos.
- Cobertura multilingüe limitada a documentación en inglés y ucraniano.

## Casos de uso

- Búsqueda y rescate sobre agua abierta: el estimador mantiene la referencia de movimiento de cámara cuando la superficie carece de textura, permitiendo que el seguidor visual mantenga a una persona candidata en el encuadre mientras un rescatador decide la actuación.
- Búsqueda y rescate tras inundaciones: en superficies de agua turbia o con reflejos especulares, donde los métodos de flujo óptico fallan, byeol aporta la componente de movimiento de cámara necesaria para estabilizar la detección.
- Recuento de fauna y ganado desde dron: los vuelos de conteo sobre superficies homogéneas se benefician de una estimación de ego-movimiento independiente de la textura del terreno.
- Cartografía de desastres: la estimación de desplazamiento entre fotogramas ayuda a encadenar imágenes para el mapeo de zonas afectadas cuando el terreno carece de rasgos distintivos.
- Investigación y docencia en geometría visual-inercial: el repositorio incluye informe técnico, guía de integración y decisiones de diseño, lo que lo hace utilizable como material didáctico sobre propagación de incertidumbre y homografía inducida por plano.
- Evaluación comparativa de métodos de ego-movimiento: el dataset byeol-synth-v1 (7 escenarios × 3 semillas × 40 s) sirve como banco de pruebas reproducible para comparar estimadores basados en física frente a métodos basados en imagen.
- Integración en sistemas con humano en el bucle: al proporcionar confianza y motivo de rechazo, permite que un sistema superior descarte estimaciones no fiables en lugar de propagar errores.

## Benchmarks y rendimiento

Datos del banco sintético byeol-synth-v1: 7 escenarios × 3 semillas × 40 s, cámara de 640×360, f = 457 px, altitud de 30 m, gimbal a 75°, IMU a 200 Hz, 30 fps. Se excluyen los primeros 10 s de cada secuencia. "Stride" indica el salto entre fotogramas comparados.

| Escenario | RMSE stride 1 / 5 (px) | ≤1 px stride 1 / 5 | Cobertura 95 % stride 1 / 5 |
|---|---|---|---|
| hover | 0.08 / 0.35 | 100 % / 100 % | 1.00 / 1.00 |
| crucero 5 m/s | 0.08 / 0.34 | 100 % / 99.6 % | 1.00 / 1.00 |
| ráfagas 4 m/s² | 0.14 / 0.67 | 100 % / 85.9 % | 1.00 / 1.00 |
| vibración 70 Hz | 0.15 / 0.43 | 100 % / 99.7 % | 1.00 / 1.00 |
| ruido de IMU ×10 | 0.40 / 1.08 | 99.8 % / 59.2 % | 0.99 / 0.99 |
| sesgo de giroscopio 0.05 rad/s | 0.32 / 1.58 | 100 % / 54.9 % | 0.94 / 0.83 |
| pérdidas de IMU 3 % | 0.77 / 2.53 | 88.1 % / 37.5 % | 0.97 / 0.96 |

Comparación con correlación de fase basada en imagen sobre agua sintética (stride 1, porcentaje de fotogramas con error ≤1 px):

| Contraste de textura | Física (byeol) | Correlación de fase |
|---|---|---|
| 25 | 100 % | 97.5 % |
| 1.5 | 100 % | 86.5 % |
| 0.5 | 100 % | 44.4 % |
| 0.3 | 100 % | 24.2 % |

Cómputo: 3,7 % de un núcleo x86 a 200 Hz de IMU y 30 fps. La estimación para una Raspberry Pi Zero 2 W es del 29-55 % de un núcleo, pero **no se ha medido en ese hardware**. Los resultados desagregados por stride, régimen de vuelo, degradación de sensores, resolución de cámara (térmica y RGB) y distorsión de lente están en el informe técnico §5 y en el directorio `experiments/`.

## Requisitos de hardware

- VRAM: no aplica. No hay pesos ni inferencia en GPU; el algoritmo se ejecuta en CPU.
- GPU recomendadas: ninguna. No se requiere GPU para ningún componente.
- Ejecución en CPU: 3,7 % de un núcleo x86 a 200 Hz de IMU y 30 fps.
- Hardware embebido: la estimación para Raspberry Pi Zero 2 W es del 29-55 % de un núcleo, no medida experimentalmente.
- Cabe en cualquier equipo capaz de ejecutar Python con numpy, incluidas placas de muy bajo consumo.
- Opciones de despliegue: paquete Python dentro de la pila de percepción del dron. No aplica vLLM, llama.cpp, Ollama ni TGI, ya que no hay pesos que servir.
- Latencia y throughput: no se han publicado cifras de latencia por fotograma en la información disponible; solo el porcentaje de uso de núcleo indicado.
- Dependencias de despliegue: numpy obligatorio; OpenCV, SciPy y PyYAML opcionales.

## Comparativa con modelos similares

No se dispone de comparativas con otros estimadores de ego-movimiento (por ejemplo, métodos de flujo óptico, SLAM visual-inercial o VINS) en la información proporcionada: no disponible. El único contraste cuantitativo publicado es frente a la correlación de fase basada en imagen y frente a una línea base "sin movimiento" (sin cifras publicadas).

| Característica | byeol v0.1.0 (física) | Correlación de fase (imagen) |
|---|---|---|
| Tipo | Estimador determinista sin pesos | Método de registro de imagen |
| Dependencia de textura | Ninguna (100 % de aciertos ≤1 px con contraste 0.3) | Alta (24,2 % con contraste 0.3) |
| Entradas | IMU, velocidad NED, altura, gimbal, cámara | Imagen |
| Incertidumbre | Covarianza 2×2, confianza y motivo de rechazo | No disponible |
| Licencia | MIT | No aplica |
| Coste de cómputo | 3,7 % de un núcleo x86 | No disponible |
| Validación | Solo sintética | Solo sintética en esta comparación |

## Limitaciones y advertencias

- No es un modelo neuronal y no generaliza a partir de datos: su comportamiento depende por completo de que se cumplan las suposiciones físicas (modelo de cámara, altura sobre la superficie y normal del plano). La homografía se construye a partir de la altura y la normal del plano, por lo que asume una superficie planar.
- Todos los resultados publicados proceden del banco sintético byeol-synth-v1. No hay validación en vuelo real en la información disponible.
- Degradación con ruido de IMU ×10: RMSE de 0.40 px con stride 1 y solo 59,2 % de fotogramas con error ≤1 px con stride 5.
- Sesgo de giroscopio de 0.05 rad/s: el porcentaje de fotogramas con error ≤1 px cae al 54,9 % con stride 5 y la cobertura del 95 % baja a 0.83, lo que indica subcobertura de la covarianza.
- Pérdidas de IMU del 3 %: 88,1 % de fotogramas ≤1 px con stride 1 y 37,5 % con stride 5.
- El rendimiento con stride 5 es sistemáticamente peor que con stride 1 en todos los escenarios.
- No detecta personas ni objetos: solo estima movimiento de cámara. Su salida no debe ser la única base de ninguna decisión sobre personas.
- Prohibido su uso en control de vuelo o seguridad: no debe comandar una aeronave ni formar parte de bucles de estabilización, evitación de colisiones o failsafe. Carece de certificación y no fue diseñado para ello.
- El proyecto pide evitar usos como armas, targeting, reconocimiento militar, persecución, vigilancia masiva o encubierta e identificación de individuos. La licencia MIT no restringe legalmente estos usos, pero se solicita respetar la declaración de uso responsable de ETHICS.md.
- Requiere disponibilidad continua de sensores: altura sobre la superficie, velocidad del controlador de vuelo en NED, ángulo de gimbal y modelo de cámara.
- La documentación solo existe en inglés y ucraniano.
- Riesgo de alucinación: no aplica, ya que el sistema no genera texto; el riesgo equivalente es la emisión de estimaciones sesgadas cuando la cobertura de la covarianza es inferior al 95 %, mitigado parcialmente por la bandera de validez y el motivo de rechazo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alexshynkarenk0/byeol
- Dataset: https://huggingface.co/datasets/alexshynkarenk0/byeol-synth-v1
- Repositorio de código: https://github.com/sashapiscivca-svg/byeol
- Código fuente del estimador: https://github.com/sashapiscivca-svg/byeol/tree/main/src/byeol
- Informe técnico: https://github.com/sashapiscivca-svg/byeol/blob/main/docs/TECHNICAL_REPORT.md
- Guía de integración: https://github.com/sashapiscivca-svg/byeol/blob/main/docs/INTEGRATION.md
- Decisiones de diseño: https://github.com/sashapiscivca-svg/byeol/blob/main/docs/DESIGN_DECISIONS.md
- Experimentos: https://github.com/sashapiscivca-svg/byeol/tree/main/experiments
- Model card en ucraniano: https://github.com/sashapiscivca-svg/byeol/blob/main/MODEL_CARD.uk.md
- Declaración de uso responsable: https://github.com/sashapiscivca-svg/byeol/blob/main/ETHICS.md
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante. La búsqueda devolvió exclusivamente dominios de contenido para adultos sin relación alguna con el modelo.
