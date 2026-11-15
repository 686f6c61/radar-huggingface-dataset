# djduecaster/dfreq-sprint-bilateral-coupling-20261114

## Resumen

SprintBilateralCoupling es un modelo ONNX de política de control para robótica, publicado por el usuario djduecaster en Hugging Face dentro del contexto del proyecto microduck-arena. Se trata de un residuo aprendido de acoplamiento bilateral de posición y velocidad entre articulaciones, definido por seis coeficientes y sin reloj de fase. El modelo transforma observaciones de dimensión 61 en acciones de dimensión 14 a 50 Hz, y su propósito es refinar el control de un robot simulado respecto a una política base heredada.

El modelo se publica explícitamente como un resultado de investigación negativo: fue congelado antes de ejecutar 512 pruebas pareadas nuevas, en las que obtuvo 382 finalizaciones frente a las 394 de la línea base, es decir, sin mejora. El autor indica que no sustituye a su entrada de mejor marca personal y que la elegibilidad para duplicados y puntos no está garantizada. La evaluación local en simulación sobre Apple Silicon reporta 0,988 s, 5/5 finalizaciones y comando 0,85.

La relevancia de esta ficha es limitada pero concreta: documenta un intento de acoplamiento bilateral aprendido en un entorno de arena de robótica, con trazabilidad de hashes de revisión y de políticas padre, y sirve como referencia para quienes investigan control de articulaciones, políticas neuronales heredadas y publicación de resultados negativos reproducibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal heredada con residuo de acoplamiento bilateral de posición/velocidad (seis coeficientes), sin reloj de fase; exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de control por paso, observación de 61 dimensiones) |
| Tipos de cuantizacion | Float32 (único formato indicado) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible; el autor declara que no se afirma una licencia global nueva |
| Formato de pesos | ONNX (obs[1,61] a actions[1,14], 50 Hz) |

## Arquitectura y entrenamiento

El modelo parte de una política neuronal heredada, cuyos créditos y tarjeta base se conservan en upstream-base-card.md, y añade un residuo de acoplamiento bilateral de posición y velocidad entre articulaciones parametrizado por seis coeficientes, sin reloj de fase. La inferencia utiliza únicamente observaciones permitidas: no emplea reloj, reconocimiento de semilla, estado oculto externo, datos de competidores ni estado privilegiado del simulador. Las acciones resultantes dependen de la observación y difieren realmente de las del modelo padre, no solo en metadatos.

El equilibrio y el acoplamiento derivan del controlador de tasa de acción del 10 de noviembre, con SHA256 728a09971bb20201ae02039c929cdb54d7ac80a709f0a77c694e1b4548a17fb5, y la tasa de acción ajustada deriva de su padre, SHA256 1b879832d77d1208bc988defcd5f034b1fbedcd090ac51aa5d0c16a88ec94371. La revisión de código fuente es 9bf04c0668145528035c8a315d5d8ae2530c1279 y la versión del runner es la 5. Se superaron las comprobaciones del validador ONNX y de salidas finitas, pero no se ejecutó la suite completa de pytest del proyecto upstream. El SHA256 del modelo es 1f5c4cca8f48e402f63dfc83b644d733ff558219da563bf8b8511afb463b842b.

## Capacidades

- Control de robot simulado: genera acciones de 14 dimensiones a partir de observaciones de 61 dimensiones a 50 Hz.
- Acoplamiento bilateral de posición y velocidad entre articulaciones mediante seis coeficientes aprendidos.
- Funcionamiento sin reloj de fase ni reconocimiento de semilla.
- Inferencia restringida a observaciones permitidas, sin estado privilegiado del simulador.
- Exportación ONNX validada con comprobaciones de salidas finitas.
- No es un modelo de lenguaje: no soporta generación de texto, tool calling, agentes ni capacidades multilingües.
- No incluye visión, audio ni modo de razonamiento.

## Casos de uso

- Investigación en control de articulaciones: sirve como referencia reproducible de un intento de acoplamiento bilateral aprendido que no superó a su línea base, útil para evitar repetir el mismo enfoque.
- Evaluación de políticas en simulación: puede cargarse en un runner compatible (versión 5) para reproducir las pruebas pareadas de 512 episodios y verificar el resultado negativo reportado.
- Estudio de resultados negativos: documenta con hashes de revisión y de políticas padre la trazabilidad completa de un experimento de control, lo que facilita auditorías.
- Comparación de arquitecturas de residuos: permite contrastar el efecto de seis coeficientes de acoplamiento frente a la política padre en tareas de finalización de sprint simulado.
- Integración en pipelines ONNX: al ser un grafo ONNX Float32 con entradas y salidas fijas, puede insertarse en herramientas de validación y perfilado de latencia en simulación.
- Docencia e investigación en robótica simulada: ejemplifica el ciclo completo de derivación de políticas, congelación previa a pruebas y publicación transparente del resultado.
- No es adecuado para control de robots físicos: el propio autor indica que es solo simulación y no hay afirmación de seguridad para robot real.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Pruebas pareadas nuevas (512) | 382/512 finalizaciones (candidato) frente a 394/512 (línea base) |
| Mejora respecto a la línea base | No; resultado negativo |
| Evaluador oficial local sin cambios | 0,988 s, 5/5 finalizaciones, comando 0,85 |
| Entorno de evaluación | Simulación local en Apple Silicon, no aceptación alojada |
| Validador ONNX y salidas finitas | Superados |
| Suite completa de pytest upstream | No ejecutada |

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0,0 GB y el modelo es un grafo ONNX Float32 de dimensiones fijas (61 a 14), por lo que la huella es mínima.
- GPU recomendadas: no disponibles; al ser una política pequeña de control, no requiere GPU de datacenter.
- GPU de consumo: previsiblemente cabe en cualquier GPU de consumo e incluso en CPU, aunque el autor no publica requisitos.
- Opciones de despliegue: ONNX Runtime u otro runtime compatible con ONNX; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: el autor reporta 0,988 s para la evaluación local de 5/5 finalizaciones en Apple Silicon; no se publica throughput por paso.
- No hay afirmación de seguridad para ejecución en robot físico.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SprintBilateralCoupling | Política ONNX con residuo de acoplamiento bilateral | no disponible | no aplica | 382/512 finalizaciones (línea base 394/512) | no disponible | Hugging Face |
| Política padre (SHA256 1b8798...) | Política neuronal heredada | no disponible | no aplica | Línea base de referencia | no disponible | Upstream |
| Controlador de tasa de acción del 10 de noviembre (SHA256 728a09...) | Controlador de tasa de acción | no disponible | no aplica | No disponible | no disponible | Upstream |

No se dispone de datos públicos de otros modelos comparables de la misma arena en la información proporcionada.

## Limitaciones y advertencias

- Resultado negativo: no mejora a la línea base (382 frente a 394 finalizaciones en 512 pruebas pareadas).
- Solo simulación: no hay afirmación de seguridad para robot físico.
- Evaluación local en Apple Silicon, no aceptación alojada; la elegibilidad para duplicados y puntos no está garantizada.
- No sustituye a la entrada de mejor marca personal existente del autor.
- No se ejecutó la suite completa de pytest del proyecto upstream.
- Licencia no disponible; el autor no afirma una licencia global nueva, lo que impide determinar condiciones de uso comercial.
- Idiomas no aplicables ni disponibles al no ser un modelo de lenguaje.
- Riesgo de alucinación no aplicable; el riesgo relevante es de sobreajuste al simulador y de generalización no demostrada.
- Sesgos conocidos: no disponibles.
- Dependencia de la versión del runner (versión 5) y de la revisión de código fuente 9bf04c0 para reproducir resultados.

## Enlaces

- Hugging Face: https://huggingface.co/djduecaster/dfreq-sprint-bilateral-coupling-20261114
- Tarjeta base upstream citada en la model card: upstream-base-card.md (no se proporciona URL)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
