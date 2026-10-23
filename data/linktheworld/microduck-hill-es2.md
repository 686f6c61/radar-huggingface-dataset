# linkTheWorld/microduck-hill-es2

# microduck-hill-es2

## Resumen

microduck-hill-es2 es una política de control locomotor para el robot microduck, desarrollada por el usuario linkTheWorld y publicada en Hugging Face con la librería `microduck`. Se distribuye como un artefacto ONNX (`policy.onnx`) acompañado de un `manifest.json` conforme al esquema 2 del manifiesto de políticas del daemon de microduck. La política ocupa el slot `walk` y está diseñada para ejecutarse de forma perpetua: genera una marcha que continúa hasta que un agente externo la detiene. Trabaja con observaciones de 61 dimensiones y 14 acciones a 50 Hz, lo que la sitúa como un componente de control en tiempo real, no como un modelo generativo.

El autor la describe como una política «1.5 m Hill Climb walker». Se obtuvo a partir de una política propia de sprint de 2 m, entrenada primero con PPO y una recompensa lineal de velocidad forward, y después con estrategias evolutivas (ES). Sobre esa base se aplicó un ajuste fino con ES en el simulador de colinas de la Arena del autor durante 70 generaciones. La búsqueda se realizó sobre las semillas de arranque 101-400, la selección sobre 1001-1060 y la evaluación final sobre las semillas reservadas 2001-2100, con 100/100 finalizaciones. Nunca se entrenó con las semillas 1-5 del tablero.

Su relevancia actual es doble. Por un lado, ejemplifica un flujo de trabajo híbrido PPO + ES para obtener habilidades locomotoras robustas en un robot de bajo coste. Por otro, su formato ONNX con normalizador integrado y su integración mediante `robotctl` facilitan experimentos de sim-to-real y la composición de habilidades dentro del ecosistema microduck. La limitación principal es que, según la información disponible, se ha validado únicamente en simulación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red de política para aprendizaje por refuerzo exportada a ONNX; topología exacta no disponible |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (política de control; observación de 61 dimensiones por paso) |
| Tipos de cuantización | No disponible; el único artefacto documentado es `policy.onnx` |
| Idiomas soportados | No aplica (no procesa lenguaje natural) |
| Licencia | No disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de microduck) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red: no se especifica si es un perceptrón multicapa, una red recurrente o una arquitectura con memoria. Lo que sí se documenta es la interfaz de control: 61 dimensiones de observación de entrada, 14 dimensiones de acción de salida y una frecuencia de operación de 50 Hz. El normalizador de observaciones está integrado en `policy.onnx`, de modo que el consumidor debe alimentar observaciones crudas y no aplicar una normalización adicional. El modelo se ejecuta como una política perpetua: no incorpora una condición interna de parada y continúa generando acciones hasta que el sistema que lo invoca lo detiene.

El entrenamiento parte de una política de sprint de 2 m del mismo autor, entrenada con PPO y una recompensa lineal de velocidad forward, seguida de estrategias evolutivas. Sobre esa política base se aplicó un ajuste fino con ES en el simulador de colinas de la Arena, durante 70 generaciones. La metodología de evaluación es explícita: búsqueda sobre las semillas de arranque 101-400, selección sobre 1001-1060 y evaluación sobre el conjunto reservado 2001-2100. El autor indica que nunca se utilizaron las semillas 1-5 del tablero y que se obtuvieron 100 finalizaciones de 100 en las semillas reservadas. No se documentan el número de tokens, la composición del dataset ni el uso de RLHF o DPO, que no aplican a este tipo de política.

## Capacidades

- Locomoción de ascenso en colinas para el robot microduck en simulación, con una política específica para el slot `walk`.
- Control continuo a 50 Hz con observaciones de 61 dimensiones y acciones de 14 dimensiones.
- Ejecución perpetua: mantiene la marcha hasta que el operador o el daemon la detienen.
- Integración con el daemon de microduck mediante `robotctl policy load walk linkTheWorld/microduck-hill-es2`.
- Normalizador de observaciones embebido en el ONNX, lo que simplifica el despliegue al evitar preprocesado externo.
- Compatibilidad con el esquema 2 del manifiesto de políticas de microduck, pensado para cargar políticas por slot.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-step ni planificación simbólica.
- No tiene capacidades multilingües, de visión, audio o generación de texto.
- No dispone de modo «thinking» ni de decodificación especulativa; no es un modelo de lenguaje.

## Casos de uso

- **Locomoción en terreno inclinado en simulación**: usar la política en el simulador de colinas del autor para reproducir el escenario de ascenso y medir la tasa de finalización con las semillas reservadas 2001-2100. Es adecuada porque el entrenamiento y la evaluación se definieron específicamente sobre ese entorno y ese conjunto de semillas.
- **Validación de sim-to-real en microduck**: cargar la política en un robot físico mediante `robotctl` y comparar la marcha observada con la del simulador. Permite identificar discrepancias de fricción, latencia o calibración antes de integrar la política en un producto. La advertencia es que el autor solo documenta simulación, por lo que el despliegue físico requiere validación propia.
- **Composición de habilidades por slots**: integrar `walk` como una habilidad más dentro de una biblioteca de políticas de microduck y alternar entre marcha, sprint u otras políticas según la tarea. El manifiesto por slots y la orden `policy load walk` facilitan este patrón sin recompilar el daemon.
- **Investigación en ajuste fino con estrategias evolutivas**: utilizar esta política como caso de estudio de un pipeline PPO + ES, comparando el efecto de 70 generaciones de ES sobre una política de sprint preentrenada. Es útil para estudiar estabilidad y coste de evaluación en robótica simulada.
- **Reproducción de experimentos con control de semillas**: repetir la búsqueda en 101-400 y la selección en 1001-1060 para analizar la sensibilidad al arranque y la generalización a 2001-2100. El autor documenta explícitamente estas particiones, lo que facilita un protocolo reproducible.
- **Docencia y formación en robótica con RL**: inspeccionar un artefacto ONNX con normalizador integrado, entender la interfaz de 61 observaciones y 14 acciones, y ejecutar la política en un banco de pruebas. Es un ejemplo compacto de política de control frente a modelos generativos de gran tamaño.
- **Pruebas de robustez y condiciones de parada**: como la política es perpetua, se puede usar para diseñar y validar mecanismos externos de supervisión, parada de emergencia y conmutación a una política segura cuando el robot abandona el dominio previsto.
- **Evaluación comparativa de gaits en microduck**: emplear la política como referencia de marcha en colinas frente a otras políticas del mismo robot, midiendo finalizaciones, tiempo de ascenso y estabilidad. No se han publicado métricas de energía o suavidad, por lo que habría que definirlas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar en la información disponible. Al tratarse de una política de control robótico, métricas como MMLU, HumanEval o GSM8K no son aplicables. El autor sí reporta una métrica de evaluación específica del entorno:

| Métrica | Resultado | Contexto |
|---|---|---|
| Tasa de finalización en simulación | 100/100 | Semillas reservadas 2001-2100, no usadas en búsqueda ni selección |
| Generaciones de ajuste fino con ES | 70 | Simulador de colinas de la Arena del autor |
| Semillas de búsqueda | 101-400 | Conjunto de arranque para la búsqueda |
| Semillas de selección | 1001-1060 | Conjunto de selección |
| Semillas del tablero | 1-5 | Nunca utilizadas, según el autor |

No se documentan latencia, consumo energético, suavidad de la marcha, robustez ante empujes ni comparación con otras políticas en las mismas condiciones.

## Requisitos de hardware

- **VRAM estimada**: no disponible. El Hub reporta un tamaño de repositorio de 0.0 GB (redondeado), lo que sugiere un artefacto muy pequeño, pero no se confirma el número de parámetros ni el peso exacto del ONNX.
- **GPU recomendadas**: ninguna en particular. La política está pensada para ejecutarse en el propio robot o en un ordenador de control; una A100 o H100 no aportan ventaja para una red de control a 50 Hz.
- **GPU de consumo**: no es un requisito. Por el tamaño reportado del repositorio, es esperable que quepa en cualquier GPU de consumo e incluso en CPU, aunque no hay una medición oficial de latencia.
- **CPU y sistemas embebidos**: un CPU moderno o una placa de tipo Raspberry Pi/Jetson podría ejecutar el ONNX, pero no se documenta el rendimiento en esas plataformas. El presupuesto de control es de 20 ms por paso a 50 Hz; la latencia real no se ha publicado.
- **Opciones de despliegue**: ONNX Runtime para cargar `policy.onnx`; daemon de microduck mediante `robotctl policy load walk linkTheWorld/microduck-hill-es2`. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- **Throughput**: no disponible. La única referencia temporal es la frecuencia de control de 50 Hz, que fija un límite de 20 ms por ciclo, no una medición de rendimiento.

## Comparativa con modelos similares

| Modelo | Tipo | Observación / acciones | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-hill-es2 | Política de control ONNX para el slot `walk` | 61 / 14 | PPO + ES, ajuste fino con ES en colinas, 70 generaciones | No disponible | Hugging Face |
| Política Sprint 2 m del mismo autor | Política de locomoción, base de la anterior | No disponible | PPO con recompensa lineal de velocidad forward, seguida de ES | No disponible | Referenciada en la model card; no se proporciona enlace directo |
| Otras políticas de microduck | Políticas de control para distintos slots | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

No se dispone de datos de parámetros, contexto, rendimiento ni licencia de las alternativas, por lo que no es posible una comparación cuantitativa. La comparación más directa es con la política Sprint 2 m, de la que deriva, pero no se han publicado sus métricas ni su artefacto en la información disponible.

## Limitaciones y advertencias

- **Validación solo en simulación**: el autor indica explícitamente «Simulation only». No hay evidencia de que la marcha funcione en un robot físico sin ajustes.
- **Licencia no disponible**: no se puede asumir permiso para uso comercial, redistribución o modificación. Es un bloqueo potencial para producción.
- **Sin benchmarks estándar**: la única métrica publicada es la tasa de finalización en 100 semillas reservadas. No hay datos de eficiencia energética, suavidad, robustez ante perturbaciones ni vida útil de la política.
- **Política perpetua**: no se detiene por sí misma. Requiere supervisión externa, condiciones de parada y una política de seguridad para evitar que el robot continúe operando fuera del dominio previsto.
- **Riesgo de alucinación**: no aplica, ya que no es un modelo de lenguaje ni genera texto.
- **Sesgos**: no se documentan sesgos sociales o lingüísticos; no aplica por la naturaleza del modelo. Sí existe un posible sesgo hacia el simulador y las semillas de entrenamiento, que puede reducir la generalización a otros terrenos.
- **Dependencia del entorno**: el rendimiento se ha medido en el simulador de colinas del autor y con un conjunto concreto de semillas. Cambiar la fricción, la masa, el controlador de bajo nivel o la frecuencia puede degradar la marcha.
- **Interfaz estricta**: el normalizador está integrado en el ONNX. Alimentar observaciones ya normalizadas o alterar el orden de las 61 dimensiones puede invalidar el control.
- **Información de parámetros ausente**: no se conoce el número de parámetros ni la topología, lo que dificulta estimar coste computacional, memoria y latencia en plataformas embebidas.
- **Repositorio con 0 descargas y 0 likes**: no hay evidencia de uso independiente ni de validación por terceros en el momento de la consulta.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/linkTheWorld/microduck-hill-es2)
- [Repositorio microduck de Pollen Robotics](https://github.com/pollen-robotics/microduck)
- [Repositorio microduck_rl](https://github.com/pollen-robotics/microduck_rl) — rama `sprint-race`, commit `822c9db39`
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck (ruta citada en la model card; no se proporciona URL directa)
- Paper o informe técnico: no disponible
- Demo o vídeo: no disponible
