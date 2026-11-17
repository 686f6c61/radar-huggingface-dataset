# Aellaecieee/biosentry-tier-c-student-vitals

## Resumen

BioSentry Tier C Student Vitals es una red neuronal destilada de tamano minimo (1.185 parametros en su variante `all`, 465 en `no_temp`) que estima una puntuacion de riesgo a partir de constantes vitales simuladas de pacientes de planta hospitalaria. La desarrolla el autor Aellaecieee en el contexto del proyecto BioSentry, presentado a la Huawei ICT Competition, y forma parte de una arquitectura por niveles en la que este "estudiante" se anade a la regla clinica NEWS2 sin sustituirla.

El modelo no es un modelo de lenguaje ni un transformer: es un perceptron multicapa con una unica capa oculta ReLU, entrenado con MindSpore 2.11.0 y exportado a ONNX, MindIR y MindSpore Lite. Su proposito es demostrar que un clasificador ultraligero puede ejecutarse en hardware muy limitado como componente de un sistema de alerta temprana en planta.

Es relevante unicamente como pieza de investigacion reproducible: todos los datos son sinteticos, generados por un simulador propio, y el autor advierte explicitamente de que el modelo no esta validado en pacientes reales ni conectado a ninguna decision clinica. El resultado reportado es modesto: al umbral de alerta de NEWS2, el estudiante alerta en un numero de ventanas similar al de NEWS2, con menos tiempo en alerta, y anadido a NEWS2 aporta 11 ventanas adicionales de 91 a 1,27 veces mas alertas, sin ganancia demostrada por encima del azar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron multicapa con una capa oculta ReLU (entrada - 32 o 16 - salida) |
| Parametros totales | 1.185 (`all`, 35 entradas, ancho 32); 465 (`no_temp`, 27 entradas, ancho 16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx`), MindIR (`model.mindir`), MindSpore Lite (`model.ms`), JSON plano (`model.json`), versiones `_no_temp` |

## Arquitectura y entrenamiento

La red es un MLP de una sola capa oculta con activacion ReLU. La variante `all` recibe 35 caracteristicas de constantes vitales y produce una puntuacion de riesgo; la variante `no_temp` recibe 27 caracteristicas (presumiblemente sin variables de temperatura) con ancho oculto 16. El modelo se obtuvo por destilacion de conocimiento desde un "teacher" de mayor tamano, y se entreno con MindSpore 2.11.0.

Los datos de entrenamiento son exclusivamente sinteticos, generados por el simulador `ward-v2-ext` (semillas 61-160 para entrenamiento y 261-300 para validacion). La evaluacion held-out uso semillas distintas del simulador `ward-v2` (11-30) y se puntuo una sola vez por procedimiento. No se emplearon datos de pacientes reales ni en el entrenamiento ni en la seleccion del modelo. No se documentan tecnicas de RLHF, DPO ni aumentos de datos mas alla del propio simulador.

## Capacidades

- Clasificacion binaria o puntuacion de riesgo a partir de un vector de constantes vitales simuladas.
- Inferencia en hardware muy limitado gracias a su tamano (menos de 1.200 parametros) y a los formatos ONNX y MindSpore Lite.
- Integracion como capa adicional sobre la regla clinica NEWS2 en el panel BioSentry, sin reemplazarla.
- Ejecucion en CPU sin GPU, con latencia despreciable por inferencia.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues.
- No procesa texto ni lenguaje natural.

## Casos de uso

- Demostracion docente de destilacion de conocimiento: el modelo sirve para ilustrar como comprimir un teacher en una red de menos de 1.200 parametros y exportarla a multiples runtimes (ONNX, MindIR, Lite).
- Prototipo de sistema de alerta temprana en planta: se puede integrar en el panel BioSentry como capa complementaria a NEWS2 para explorar senales adicionales sobre datos simulados.
- Prueba de despliegue en hardware embebido: su tamano permite ejecutarlo en dispositivos de bajo consumo mediante MindSpore Lite u ONNX Runtime, validando el pipeline de extremo a extremo.
- Benchmarking de pipelines de simulacion clinica: el par simulador-modelo permite comparar estrategias de generacion de datos sinteticos y de evaluacion held-out.
- Investigacion sobre reglas clinicas aumentadas: util para estudiar si un modelo ligero anadido a NEWS2 aporta valor sobre el azar en escenarios simulados, con resultados reproducibles.
- Ensayo de formatos de serializacion: comparar rendimiento y latencia entre ONNX, MindIR, MindSpore Lite y pesos en JSON en un caso real de modelo tabular pequeno.

## Benchmarks y rendimiento

Los unicos resultados publicados son los del autor, medidos sobre el simulador propio:

| Metrica | Resultado reportado |
|---|---|
| Ventanas en alerta (al umbral NEWS2) | Similar a NEWS2 |
| Tiempo en alerta | Menor que NEWS2 |
| Tasa de alertas (chance rate) | Menor que NEWS2 |
| Ganancia anadida a NEWS2 | 11 ventanas adicionales de 91, a 1,27 veces las alertas |
| Ganancia sobre el azar | No demostrada |
| Comparacion con el teacher en validacion | Peor que el teacher |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no serian aplicables a un modelo tabular de este tipo.

## Requisitos de hardware

- VRAM estimada: practicamente nula; el modelo ocupa unos pocos kilobytes en cualquiera de sus formatos.
- GPU recomendadas: ninguna; la inferencia esta pensada para CPU.
- Compatibilidad con GPU de consumo: irrelevante, cabe en cualquier dispositivo con CPU moderna, incluidos microcontroladores con MindSpore Lite.
- Opciones de despliegue: ONNX Runtime (`onnxruntime`), MindSpore (`mindir`/`ms`), MindSpore Lite, o carga directa de los pesos JSON.
- Latencia y throughput: no disponibles de forma numerica; por el tamano del modelo se espera latencia inferior al milisegundo en CPU convencional, aunque el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BioSentry Tier C Student Vitals | 1.185 / 465 | no aplica | Riesgo sobre vitales simuladas | Apache-2.0 | Hugging Face |
| NEWS2 (regla clinica) | no aplica (regla) | no aplica | Alerta temprana en planta | Uso clinico estandar | Implementada en el panel BioSentry |
| Teacher de BioSentry | no disponible | no aplica | Riesgo sobre vitales simuladas | no disponible | No publicado en este repo |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente sobre el simulador propio del proyecto: todos los resultados son circulares y no demuestran validez en una planta hospitalaria real.
- No validado en pacientes reales; el autor lo declara explicitamente como demo de investigacion y no apto para uso clinico.
- El resultado held-out se puntuo una sola vez por procedimiento, pero el codigo no lo impone automaticamente.
- Efectos pequenos y ausencia de barras de error en algunas metricas.
- Peor rendimiento que su teacher en validacion.
- No sustituye a NEWS2: la regla clinica permanece en el codigo del panel y el modelo nunca la reemplaza (Tier A no se modifica ni se aprende).
- Sin datos sobre sesgos, alucinacion (no genera texto) ni cobertura idiomatica, al no ser un modelo linguistico.
- Licencia Apache-2.0 para los ficheros del repositorio; el uso comercial del modelo esta permitido por licencia, pero su unica utilidad demostrada es la investigacion sobre datos sinteticos.

## Enlaces

- Hugging Face: https://huggingface.co/Aellaecieee/biosentry-tier-c-student-vitals
- Repositorio del proyecto (dashboard y codigo): https://github.com/kitchen-station/BioSentry-Intelligence
- Model card completa en el repositorio: `models/<tier>/<name>/card.md`
- Codigo de referencia del estudiante: `research/plain_student.py` en el repositorio del dashboard
