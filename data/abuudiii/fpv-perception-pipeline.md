# Abuudiii/fpv-perception-pipeline

## Resumen

FPV perception pipeline es un sistema completo de pilotaje autónomo de cuadricópteros para carreras de drones FPV, desarrollado por el usuario Abuudiii y publicado bajo licencia MIT. No se trata de un modelo de lenguaje, sino de una canalización de percepción y control compuesta por tres piezas: un detector de puertas basado en CNN, un módulo de geometría escrito a mano que convierte las esquinas detectadas en estimación de estado, y una política de vuelo entrenada con PPO que emite los cuatro comandos de un piloto humano (empuje y velocidades de alabeo, cabeceo y guiñada). El sistema funciona exclusivamente en simulación, concretamente en Unreal Engine 5 y en un renderizador sintético propio.

La relevancia del proyecto radica en que elimina la dependencia de marcadores visuales. Su predecesor, `Abuudiii/fpv-gate-racing`, requería que la siguiente puerta estuviera pintada de verde en pistas no vistas, lo que limitaba su generalización. Aquí el detector localiza las puertas sin señalización artificial, la geometría las convierte en un estado estimado y la política vuela sobre esa estimación. El detector es una CNN de 3,9 millones de parámetros que procesa fotogramas de 320×180 y devuelve las cuatro esquinas de cada puerta visible.

El conjunto detector, estimador y política consume 2,2 ms por paso de control en una RTX PRO 4000, sobre un paso de control de 20 ms, lo que deja margen de sobra para operar en tiempo real. El repositorio ocupa 0,6 GB e incluye pesos en formato `.pkl`, vídeos de vuelo y resultados de evaluaciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Canalización: CNN detectora de esquinas + geometría analítica + estimador de estado + MLP de política (PPO) |
| Parámetros totales | 3,9 M (solo el detector CNN); política MLP de tamaño no especificado |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); entrada de 320×180 píxeles por fotograma |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | MIT |
| Formato de pesos | `.pkl` (checkpoints de Python, presumiblemente JAX/Flax) |

## Arquitectura y entrenamiento

La canalización se compone de cuatro bloques. El detector es una CNN de 3,9 M de parámetros entrenada de forma supervisada: recibe un fotograma de 320×180 y devuelve las cuatro esquinas de cada puerta visible. Las etiquetas son exactas porque el simulador conoce la pose de la cámara y las esquinas de cada puerta; un profesor basado en estado vuela las pistas con ruido en los mandos y arranques fuera de curso para generar los fotogramas. La geometría, escrita a mano, traduce las esquinas en distancia y dirección usando la apertura conocida de 0,4 m y selecciona la siguiente puerta de la lista del circuito. El estimador de estado combina las puertas con un giroscopio y un acelerómetro simulados con ruido para producir velocidad, inclinación y posiciones de las próximas puertas.

La política es un MLP pequeño que parte del profesor basado en estado y se reentrena con PPO sobre estimaciones ruidosas. Durante el entrenamiento de la política no se renderiza ningún fotograma: el estimador recibe esquinas verdaderas con ruido, omisiones, detecciones falsas y un retardo de un fotograma, con una escala muestreada por vuelo entre cero y cuatro veces el error medido del detector. El detector real solo entra en fase de prueba. Para Unreal, el detector entrenado con datos sintéticos se ajustó finamente con 90 000 fotogramas etiquetados de Unreal (renderizados por Project AirSim), y para la pista Split-S con 38 000 fotogramas adicionales que incluyen vuelo invertido. La política y el estimador no se modificaron para Unreal.

## Capacidades

- Detección de puertas de carrera en imágenes FPV sin necesidad de marcadores ni colores distintivos.
- Estimación de la geometría de cada puerta (distancia y dirección) a partir de sus cuatro esquinas.
- Estimación de estado del dron combinando detecciones con IMU simulada (giroscopio y acelerómetro con ruido).
- Control de vuelo mediante cuatro comandos de estilo piloto: empuje y velocidades de alabeo, cabeceo y guiñada.
- Vuelo autónomo en pistas de slalom, Split-S y escalada-picado, incluyendo maniobras invertidas.
- Generalización a pistas aleatorias no vistas en el renderizador sintético.
- Adaptación a un simulador distinto (Unreal Engine 5) mediante ajuste fino del detector, sin reentrenar política ni estimador.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Investigación en carreras autónomas de drones: la canalización sirve como referencia reproducible para comparar enfoques de percepción y control en pistas estandarizadas, con pesos y resultados publicados.
- Desarrollo de sistemas de percepción basados en detección de esquinas: el detector de 3,9 M de parámetros y su ajuste fino con datos de Unreal son un ejemplo práctico de transferencia sim-to-sim para objetos con geometría conocida.
- Validación de estimadores de estado con ruido realista: el entrenamiento de la política con ruido, omisiones, falsas detecciones y retardo de un fotograma es un patrón reutilizable en robótica móvil.
- Generación de datos sintéticos etiquetados de forma automática: el uso de un profesor basado en estado como operador de cámara permite producir etiquetas exactas de esquinas sin anotación manual.
- Pruebas de maniobras acrobáticas en simulación: la pista Split-S y el profesor con recompensa por vuelo invertido sirven para estudiar control en actitudes no convencionales.
- Docencia y divulgación en aprendizaje por refuerzo aplicado a robótica: los vídeos, las evaluaciones de 24 vuelos y los checkpoints permiten reproducir y analizar el comportamiento del sistema.
- Evaluación de latencia en bucles de control: con 2,2 ms por paso sobre 20 ms, el proyecto es un banco de pruebas para medir el coste computacional de una canalización de percepción completa en tiempo real.

## Benchmarks y rendimiento

Resultados de vuelo publicados por el autor (tres vueltas completadas en vuelos de 30 s, puertas desplazadas ±0,3 m y ±0,2 rad, física aleatorizada por vuelo):

| Prueba | Vuelos | Tres vueltas | Choques | Tiempo por vuelta |
|---|---|---|---|---|
| Unreal, slalom | 24 | 20 de 24 (83%) | 1 | 6,71 s |
| Unreal, Split-S | 24 | 23 de 24 (96%) | 1 | 4,67 s |
| Renderizador sintético, pistas aleatorias no vistas | 2 048 | 93,8% | 4,6% | 6,14 s |
| Renderizador sintético, seis pistas con nombre | 2 048 por pista | 92,5% de media (85,2%–98,7%) | 5,9% de media | no disponible |

Comparación en pistas aleatorias no vistas (renderizador sintético, 256 vuelos): la CNN de cámara anterior completó tres vueltas en el 27,7% de los vuelos sin la puerta verde y en torno al 70% con ella; el profesor basado en estado alcanza el 100%.

Detector de puertas, siguiente puerta encontrada cuando está en vista:

| Fotogramas | Antes | Después |
|---|---|---|
| Unreal, seis pistas (ajuste fino con 90 000 fotogramas) | 74,2% | 99,87% |
| Unreal, Split-S, fotogramas invertidos (ajuste fino con 38 000 más) | 90,8% | 98,3% |
| Sintético, pistas aleatorias reservadas | no disponible | 99,94%, error de esquina de 0,08 px de mediana |

Latencia: detector, estimador y política juntos consumen 2,2 ms por paso de control en una RTX PRO 4000, frente a un paso de control de 20 ms.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el detector es una CNN de 3,9 M de parámetros y la política un MLP pequeño, por lo que el conjunto cabe holgadamente en cualquier GPU con varios GB de memoria.
- GPU recomendadas: el autor reporta tiempos sobre una RTX PRO 4000; por el tamaño del modelo, cualquier GPU consumer moderna (RTX 3060 en adelante) debería ejecutar la canalización en tiempo real.
- Cabe en GPU consumer: sí, con margen amplio; el cuello de botella es la latencia del bucle de renderizado y simulación, no la inferencia.
- Opciones de despliegue: los checkpoints están en `.pkl` y el código en el repositorio `Abuudiii/rl-experiments` (rama `fpv-racing`), con dependencias de JAX; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 2,2 ms por paso de control en RTX PRO 4000; no se publican cifras de throughput ni latencias en otras GPU.

## Comparativa con modelos similares

| Sistema | Enfoque | Entrada | Generalización a pistas no vistas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FPV perception pipeline (este) | Detector + geometría + estimador + PPO | Cámara FPV e IMU | 93,8% de tres vueltas en pistas aleatorias sintéticas | MIT | Pesos y código públicos |
| Abuudiii/fpv-gate-racing (predecesor) | CNN única de píxeles a comandos | Cámara FPV | 27,7% sin puerta verde, ~70% con ella | no disponible en la información | Pesos públicos |
| Profesor basado en estado | PPO sobre estado privilegiado | Estado completo del simulador | 100% en pistas aleatorias sintéticas | no disponible en la información | Pesos públicos (parcial) |

No se dispone de datos de otros sistemas comparables de carreras autónomas de drones en la información proporcionada.

## Limitaciones y advertencias

- Todo el sistema está validado únicamente en simulación (Unreal Engine 5 y renderizador sintético propio); no hay resultados en drones físicos.
- El detector entrenado solo con datos sintéticos encontró la siguiente puerta en el 74,2% de los fotogramas de Unreal; el rendimiento en dominios visuales distintos requiere ajuste fino con datos etiquetados del nuevo dominio.
- El ajuste fino para Unreal usó 90 000 fotogramas etiquetados y el de Split-S 38 000 adicionales, lo que implica un coste de anotación no trivial para nuevos entornos.
- La política depende de la lista del circuito para seleccionar la siguiente puerta; no se documenta comportamiento en pistas desconocidas sin definición previa.
- El estimador asume una apertura de puerta conocida de 0,4 m; variaciones en la geometría de las puertas no están cubiertas en la información disponible.
- La tasa de éxito en pistas sintéticas con nombre baja hasta el 85,2% en el peor caso, y la tasa de choques media es del 5,9%.
- No se documentan sesgos de otro tipo (sociales, idiomáticos) por no tratarse de un modelo de lenguaje.
- Riesgo de alucinación no aplica; el riesgo equivalente es la detección falsa de puertas, mitigado en el entrenamiento con detecciones falsas simuladas, pero sin métricas específicas de falsos positivos publicadas.
- Licencia MIT: permite uso comercial y modificación con atribución; no se especifican restricciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Abuudiii/fpv-perception-pipeline
- Modelo predecesor: https://huggingface.co/Abuudiii/fpv-gate-racing
- Código: https://github.com/Abuudiii/rl-experiments/tree/main/fpv-racing
- Figura de arquitectura y resultados: https://huggingface.co/Abuudiii/fpv-perception-pipeline/resolve/main/media/architecture.png
- Vídeo slalom: https://huggingface.co/Abuudiii/fpv-perception-pipeline/resolve/main/media/slalom_unreal.mp4
- Vídeo Split-S: https://huggingface.co/Abuudiii/fpv-perception-pipeline/resolve/main/media/split_s_unreal.mp4
- Vídeo de trayectorias 3D en seis pistas: https://huggingface.co/Abuudiii/fpv-perception-pipeline/resolve/main/media/flights_3d.mp4
