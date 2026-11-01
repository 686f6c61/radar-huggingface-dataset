# hwihwalab/tesla-roadster-flip-landing-ppo

## Resumen

`tesla-roadster-flip-landing-ppo` es un agente de aprendizaje por refuerzo entrenado con PPO (Proximal Policy Optimization) por Hwihwa Lab para resolver una tarea de control de actitud y aterrizaje en un simulador físico de Gymnasium. El escenario simula un Tesla Roadster liberado en caída balística a 12 metros de altitud con una inversión de 180 grados en el eje de pitch, inspirado en la maniobra de boostback de un Falcon 9. El agente debe ejecutar un giro de actitud, cancelar la inercia rotacional con propulsores RCS de gas frío, encender un cohete de frenado y posarse sobre una plataforma marina (ASDS) cumpliendo restricciones estrictas de centrado, alineación e impacto.

No es un modelo de lenguaje ni un modelo fundacional: es una política neuronal (actor-critic) empaquetada con PyTorch, con pesos de tamaño reducido y pensada para inferencia en simulación o en un bucle de control embebido. Su relevancia es la de un artefacto de investigación reproducible en la intersección de RL y aeroespacial, con métricas declaradas de tasa de éxito del 98 % y recompensa media de 300,34 en un benchmark de 50 episodios. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y el tamaño del repo es de 0,0 GB.

La licencia MIT permite uso comercial y modificación, pero las métricas no están verificadas por un tercero (`verified: false` en el model-index) y proceden exclusivamente del autor. El modelo declara soporte de idiomas inglés y coreano, lo que en la práctica se refiere a la documentación y a la interfaz del cockpit 3D, no a capacidades lingüísticas de la política.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor-Critic para PPO (redes neuronales PyTorch); arquitectura interna de capas no disponible |
| Parametros totales | no disponible (repo de 0,0 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; el horizonte es el del episodio de simulación) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ko (documentación e interfaz) |
| Licencia | MIT |
| Formato de pesos | pesos PyTorch (checkpoint); no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento

La política sigue el esquema PPO on-policy con actor-critic, objetivo surrogate recortado (\(L^{CLIP}\)) y factor de recorte \(\epsilon = 0.20\). El autor indica el uso de Generalized Advantage Estimation con \(\lambda = 0.95\) para repartir la señal de recompensa en una ventana temporal muy corta, donde la deceleración crítica ocurre en los últimos 3 metros del descenso. El entorno es un simulador propio de aerodinámica del Roadster implementado sobre Gymnasium v1.0, con acciones de propulsores RCS de gas frío y un cohete retropropulsor principal.

El entrenamiento se orienta a un perfil balístico agresivo: el giro de 180 grados se completa en 1,8 segundos y el aterrizaje en aproximadamente 6,7 segundos, lo que el autor presenta como un 53 % más rápido que su variante D3QN. Las aceleraciones angulares superan \(\pm 3,5\ \text{rad/s}\), lo que motiva el recorte estricto de la ratio de política para evitar colapso. No se especifican en la información disponible el número de pasos de entrenamiento, el tamaño de las redes, la composición del dataset (generado por el propio simulador) ni si hubo fases de ajuste fino adicionales. El entorno exige tres condiciones simultáneas de éxito: \(|x| \le 0,4\ \text{m}\) de centrado, \(|\theta| \le 5,0^\circ\) de alineación y \(v_y \ge -1,4\ \text{m/s}\) de velocidad vertical de impacto.

## Capacidades

- Control de actitud en 3 ejes (pitch, yaw, roll) mediante propulsores RCS de gas frío en un entorno simulado.
- Recuperación de inversión de 180 grados en pitch desde una caída balística a 12 m de altitud.
- Gestión de la secuencia de aterrizaje: cancelación de inercia rotacional, encendido del cohete de frenado y descenso vertical controlado.
- Aterrizaje de precisión sobre plataforma marina (ASDS) con restricciones de centrado, actitud e impacto.
- Política on-policy entrenada para un perfil temporal agresivo (aproximadamente 6,7 s de descenso).
- Integración con Gymnasium para evaluación y reproducción de episodios.
- Telemetría en tiempo real a 50 Hz vía WebSocket en el cockpit 3D asociado (según la model card).
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni generación de texto: no es un modelo de lenguaje.

## Casos de uso

- Investigación en RL para control aeroespacial: reproducción del experimento PPO frente a D3QN sobre el mismo entorno Gymnasium, útil para comparar estabilidad de políticas on-policy en horizontes cortos con recompensas terminales.
- Banco de pruebas de maniobras de inversión y recuperación: el escenario de 180 grados a 12 m sirve para estudiar el reparto de crédito (GAE) en maniobras donde la fase crítica dura pocos segundos.
- Docencia en aprendizaje por refuerzo: el repositorio incluye un cockpit 3D interactivo en Hugging Face Spaces que permite visualizar la política y la telemetría, adecuado para demostraciones en clase.
- Prototipado de controladores de aterrizaje vertical: la formulación de éxito (centrado, actitud, velocidad de impacto) puede reutilizarse como especificación de requisitos en simuladores propios.
- Estudio de robustez de PPO ante aceleraciones angulares altas: el recorte \(\epsilon = 0.20\) y las velocidades angulares superiores a \(\pm 3,5\ \text{rad/s}\) ofrecen un caso concreto para analizar colapso de política.
- Inferencia en el bucle de simulación en hardware de consumo: al tratarse de una política pequeña y un repo de 0,0 GB, es viable ejecutarla en CPU o en una GPU modesta para barridos de hiperparámetros.
- Referencia para pipelines de RL reproducible: combinación de PyTorch, Gymnasium y model-index permite integrar la evaluación en un CI que valide la tasa de éxito declarada.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados por terceros):

| Metrica | Valor | Verificado |
|---|---|---|
| Tasa de exito de aterrizaje con inversion de 180 grados | 98,0 % | No |
| Recompensa media en benchmark de 50 episodios | 300,34 | No |
| Tiempo de aterrizaje (perfil agil) | ~6,7 s | No |
| Tiempo de giro de 180 grados | 1,8 s | No |
| Mejora frente a D3QN (tiempo) | 53 % mas rapido | No |

No se han publicado en la información disponible resultados de benchmarks estándar de RL (por ejemplo, retornos normalizados en suites como MuJoCo o Atari) ni comparaciones numéricas con otras políticas aeroespaciales.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el tamaño del repo es de 0,0 GB, lo que sugiere una política de pocos megabytes y, por tanto, inferencia viable en CPU.
- GPU recomendadas: no se especifican. Por el tamaño, cualquier GPU consumer (por ejemplo, RTX 3060 en adelante) sería suficiente para inferencia; el entrenamiento completo no está cuantificado.
- Compatibilidad con GPU consumer: sí, previsiblemente cualquiera con soporte PyTorch; no hay requisito declarado de A100 ni H100.
- Opciones de despliegue: PyTorch nativo y Gymnasium para el bucle de simulación. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles. La model card menciona telemetría WebSocket a 50 Hz en el cockpit, pero no se especifica la latencia de inferencia de la política.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| tesla-roadster-flip-landing-ppo | PPO actor-critic | no disponible | no aplica | 98,0 % exito; recompensa 300,34 | MIT | Hugging Face |
| tesla-roadster-flip-landing-d3qn | D3QN (value-based) | no disponible | no aplica | 53 % mas lento que PPO segun el autor | no disponible en la informacion | Hugging Face (mismo autor) |
| Otras politicas de aterrizaje RL | no disponible | no disponible | no aplica | no disponible | no disponible | no disponible |

La única comparación documentada es con la variante D3QN del mismo autor, que sirve como línea base interna. No se han identificado en la información proporcionada políticas públicas equivalentes para la tarea concreta de inversión y aterrizaje sobre ASDS.

## Limitaciones y advertencias

- Métricas no verificadas: la tasa de éxito del 98 % y la recompensa media de 300,34 están marcadas como `verified: false` y proceden únicamente del autor.
- Validez limitada al simulador: el rendimiento se mide en un simulador propio de aerodinámica del Roadster; no hay evidencia de transferencia a dinámica real ni a otros simuladores.
- Sobreajuste al escenario: la política está entrenada para una altitud inicial de 12 m y una inversión de 180 grados; no se documenta generalización a otras condiciones iniciales, vientos o fallos de propulsor.
- Sin datos de arquitectura: no se especifican capas, tamaño de red ni número de parámetros, lo que dificulta la reproducibilidad y la comparación.
- Sesgos: no se documentan sesgos de datos en el sentido de modelos de lenguaje; el riesgo relevante es el sesgo del simulador (modelo aerodinámico simplificado) que puede no reflejar condiciones reales.
- Alucinación: no aplica como en un modelo generativo, pero sí existe riesgo de que la política produzca acciones no válidas fuera de la distribución de entrenamiento.
- Idiomas: la declaración en/ko se refiere a documentación; la política no procesa lenguaje.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías; para uso en sistemas críticos de vuelo se requiere validación independiente.
- Ausencia de tracción comunitaria: 0 descargas y 0 likes en el momento de la ficha, sin issues ni validación externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hwihwalab/tesla-roadster-flip-landing-ppo
- Documentación en coreano: https://huggingface.co/hwihwalab/tesla-roadster-flip-landing-ppo/blob/main/README_KR.md
- Cockpit 3D interactivo (Hugging Face Spaces): https://huggingface.co/spaces/hwihwalab/tesla-roadster-flip-landing
- Modelo gemelo D3QN: https://huggingface.co/hwihwalab/tesla-roadster-flip-landing-d3qn
- Repositorio GitHub del laboratorio: https://github.com/Hwihwa-Lab
- Licencia MIT: https://huggingface.co/hwihwalab/tesla-roadster-flip-landing-ppo/blob/main/LICENSE
- PyTorch: https://pytorch.org
- Gymnasium: https://gymnasium.farama.org/
