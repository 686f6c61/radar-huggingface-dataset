# SM-Bello/PHI-CTRL-F16-Models

## Resumen

PHI-CTRL F-16 Models es un repositorio de pesos entrenados para el sistema PHI-CTRL, un marco de control de vuelo tolerante a fallos desarrollado por Mohammed Bello Sani en el Air Force Institute of Technology (AFIT) de Kaduna, en colaboración con Penelope Inc. PHI Lab. El proyecto combina un gemelo digital (PHI-Twin) con un bucle de control híbrido que reconfigura automáticamente la estrategia de vuelo cuando se detecta una degradación en los actuadores, sin intervención humana.

El repositorio contiene dos artefactos: una política residual entrenada con PPO (Stable-Baselines3) sobre el simulador JSBSim F-16A, y un modelo CNN-BiLSTM que estima la efectividad restante de los actuadores (γ̂) a partir de telemetría de fallos. No se trata de un modelo de lenguaje ni de un sistema de generación de texto; es un componente de un sistema de control en tiempo real. La licencia es CC-BY-4.0 y los pesos se distribuyen en formato de checkpoint de Stable-Baselines3 y PyTorch. El repositorio se publicó en septiembre de 2026 y cuenta con un DOI de Zenodo para su cita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PPO (política residual) + CNN-BiLSTM (gemelo de efectividad) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de control, no secuencial de lenguaje) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no aplica |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ZIP (checkpoint Stable-Baselines3) y PT (PyTorch) |

## Arquitectura y entrenamiento

La política residual (`phi_ctrl_residual_f16_500000_steps.zip`) es un agente PPO entrenado con Stable-Baselines3 sobre un entorno Gym que envuelve el simulador JSBSim F-16A de 6 grados de libertad. El entorno inyecta fallos en la efectividad del elevador y el entrenamiento sigue un currículo de dificultad creciente a lo largo de 500.000 pasos. La política solo se activa cuando el banco de efectividad MMAE (Multiple Model Adaptive Estimation) detecta degradación en los actuadores; no actúa como un reemplazo ciego de la ley de control híbrida base.

El gemelo PHI-Twin (`phi_twin_cnn_bilstm.pt`) es una red neuronal compuesta por capas convolucionales seguidas de una BiLSTM. Se entrena con ventanas deslizantes de 50 a 100 pasos de telemetría de fallos para estimar la efectividad restante del actuador (γ̂). El conjunto de datos de entrenamiento proviene del repositorio hermano `SM-Bello/PHI-CTRL-F16-Fault-Recovery-Telemetry`, que contiene 160 episodios con valores de γ entre 1.0 y un valor mínimo no especificado en la información disponible.

## Capacidades

- Control de vuelo residual: genera acciones correctivas sobre el elevador cuando se detecta degradación, complementando la ley de control híbrida.
- Estimación de salud de actuadores: el modelo CNN-BiLSTM predice la efectividad restante γ̂ a partir de telemetría de ventanas deslizantes.
- Detección de fallos en línea: se integra con un banco de efectividad MMAE para activar la política residual solo cuando es necesario.
- Simulación de aeronaves: funciona sobre el entorno JSBSim F-16A, permitiendo pruebas repetibles en condiciones de fallo.
- No es un modelo generativo de texto ni de código; no soporta tool calling, agentes conversacionales ni razonamiento multilingüe.

## Casos de uso

- Simulaciones de tolerancia a fallos: integrar la política residual en entornos JSBSim para evaluar el comportamiento del F-16 ante degradación del elevador en campañas de pruebas automatizadas.
- Mantenimiento predictivo en aviónica: usar el gemelo CNN-BiLSTM para monitorizar telemetría en vuelo y estimar cuándo un actuador se acerca a un nivel crítico de efectividad, programando mantenimiento antes del fallo.
- Investigación en control reconfigurable: servir como punto de partida para comparar estrategias de control híbrido frente a control clásico en escenarios de fallo parcial.
- Verificación de leyes de control: emplear los pesos en pipelines de verificación formal o basada en simulación para validar que la reconfiguración no introduce inestabilidad.
- Entrenamiento de operadores de drones o aeronaves: generar escenarios de fallo realistas en simuladores de entrenamiento, con el sistema reconfigurándose automáticamente.
- Desarrollo de gemelos digitales de aeronaves: combinar el modelo de efectividad con otros componentes del PHI-CTRL para construir réplicas digitales de sistemas de control de vuelo con capacidad de autodiagnóstico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que, en este checkpoint, el stack completo (baseline + híbrido + residual) no ha demostrado superar al enfoque solo-híbrido. No se proporcionan métricas de rendimiento como recompensas medias, tasas de éxito o errores de estimación de γ.

## Requisitos de hardware

No se especifican requisitos de hardware en la información disponible. Dado que se trata de un modelo PPO con una red de política típicamente pequeña (MLP) y un CNN-BiLSTM de dimensiones moderadas, es razonable esperar que pueda ejecutarse en CPU para inferencia, pero no hay datos confirmados. No se mencionan GPUs recomendadas ni opciones de despliegue específicas. Para integración en tiempo real, se necesitaría un entorno con JSBSim y Stable-Baselines3, lo que sugiere un sistema Linux con Python y dependencias de ciencia de datos.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la misma categoría (control de vuelo tolerante a fallos con aprendizaje por refuerzo) dentro de la información proporcionada. Los repositorios de HuggingFace suelen contener modelos de lenguaje o visión, y este caso es atípico.

## Limitaciones y advertencias

- El autor advierte que el stack completo (baseline + híbrido + residual) no ha demostrado superar al enfoque solo-híbrido en este checkpoint; por tanto, el valor añadido de la política residual aún no está validado.
- Los modelos no deben usarse de forma aislada: están diseñados para integrarse en el bucle de control PHI-CTRL completo, con el banco MMAE y la ley de control híbrida.
- No se proporcionan garantías de seguridad para uso en aeronaves reales; el sistema está pensado para simulación e investigación.
- La licencia CC-BY-4.0 permite uso comercial y modificación, pero exige atribución al autor y a las fuentes originales.
- No hay información sobre sesgos, alucinaciones o riesgos de idioma, al no tratarse de un modelo de lenguaje.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, lo que sugiere una adopción muy limitada o una publicación reciente.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/SM-Bello/PHI-CTRL-F16-Models
- Código fuente y documentación (GitHub): https://github.com/Sm-bello/PHI-CTRL
- Conjunto de datos de telemetría: https://huggingface.co/datasets/SM-Bello/PHI-CTRL-F16-Fault-Recovery-Telemetry
- DOI de Zenodo (versión congelada v1.0.0): https://doi.org/10.5281/zenodo.22218809
- Página personal del autor: https://smbello.vercel.app
- Portafolio del laboratorio: https://penelope-inc.vercel.app
