# elichen77/ur5e-language-rotation-tfjs

## Resumen

El repositorio `elichen77/ur5e-language-rotation-tfjs` contiene los pesos en formato TensorFlow.js (int8) que alimentan una demo de robótica en el navegador, publicada en `elichen.github.io/world-model/`. No se trata de un modelo de lenguaje generativo al uso, sino de un conjunto de artefactos para control robótico guiado por instrucciones en lenguaje natural sobre un brazo UR5e simulado en MuJoCo. El autor es `elichen77` y la licencia es MIT.

El paquete incluye tres componentes: un codificador de texto `thenlper/gte-small` cuantizado a int8 (33,5 MB), un conjunto de matrices de rotación ortogonal de Procrustes en `O(112, 112)` junto con una política recurrente libre de lenguaje (`BehaviorPolicy`, 4,37 M de parámetros) y un `ViT-tiny` congelado con un módulo de lectura fotométricamente robusto (`Readout2`) para el seguimiento visual de cubos 3D. La idea técnica central es mapear el espacio de embeddings del lenguaje al espacio latente de comportamiento del robot mediante rotaciones ortogonales, sin entrenamiento robótico supervisado para el codificador.

Su relevancia es acotada pero interesante: demuestra que es posible ejecutar inferencia de política robótica en el navegador del cliente mediante WebGPU y TFJS, sin servidor, con un tamaño total del repositorio de 0,1 GB. Es un artefacto de investigación y demostración, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador transformer (`gte-small`) + matrices de rotacion de Procrustes + politica recurrente `BehaviorPolicy` + `ViT-tiny` con `Readout2` |
| Parametros totales | No disponible (la politica declara 4,37 M; el resto de componentes no desglosa total) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8 (todos los pesos) |
| Idiomas soportados | Ingles (el codificador es `thenlper/gte-small` preentrenado en ingles) |
| Licencia | MIT |
| Formato de pesos | TensorFlow.js (`.bin` + `.json`) |
| Tamano del repositorio | 0,1 GB |
| Pipeline declarado | robotics |

## Arquitectura y entrenamiento

El sistema combina cuatro piezas. Primero, `thenlper/gte-small` actua como codificador de instrucciones en lenguaje natural, cuantizado a int8 y sin ningun ajuste especifico para robotica (la model card lo describe como "zero robot training"). Segundo, un conjunto de seis matrices de rotacion ortogonal de Procrustes `R_N` en `O(112, 112)` para `N ∈ {30, 100, 300, 1000, 23503, shuffled}`, que alinean el espacio de embeddings del lenguaje con una nube de comportamiento no etiquetada de 1.600 clips. Tercero, una `BehaviorPolicy` recurrente especifica del UR5e, con 4,37 M de parametros en int8 y descrita como "language-free", que genera las acciones del brazo. Cuarto, un `ViT-tiny` congelado (LeWM) junto con un modulo `Readout2` fotometricamente robusto para el seguimiento puramente visual de cubos 3D a partir de la camara frontal a 224x224.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO. La innovacion destacable es el uso de rotaciones ortogonales para trasladar la semantica del lenguaje al manifold de comportamiento sin reentrenar el codificador, y la ejecucion integra en el navegador mediante WebGPU.

## Capacidades

- Interpretacion de instrucciones en lenguaje natural en ingles para generar comandos de control de un brazo UR5e.
- Control de rotacion del efector final mediante mapeo del embedding de texto a una accion de politica.
- Seguimiento visual 3D de cubos a partir de imagenes de una camara frontal de 224x224.
- Inferencia en el cliente dentro del navegador (TFJS + WebGPU), sin backend.
- Politica recurrente especifica del robot, sin capacidad de generalizacion a otros brazos declarada.
- No se declaran capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision general, audio ni modo thinking.
- Capacidad multilingue: no disponible; el codificador es de ingles.

## Casos de uso

- Demostracion educativa de control robotico por lenguaje: la demo permite a estudiantes enviar instrucciones en ingles y observar como el UR5e simulado en MuJoCo ejecuta rotaciones, sin instalar nada gracias a la inferencia en navegador.
- Prototipado de interfaces lenguaje-robot en web: util para validar rapidamente el mapeo entre embeddings de texto y acciones antes de invertir en entrenamiento real.
- Investigacion sobre alineamiento de espacios latentes: las matrices de Procrustes permiten experimentar con la hipotesis de que el espacio de lenguaje y el de comportamiento son aproximadamente isometricos.
- Benchmark de inferencia WebGPU para robotica: sirve para medir latencia y throughput de politicas pequenas ejecutadas en el cliente frente a un servidor.
- Reproducibilidad de experimentos de world models: el `ViT-tiny` con `Readout2` permite replicar el seguimiento visual de cubos en un entorno controlado.
- Docencia en simulacion robotica: integrable en cuadernos o paginas web para ilustrar el ciclo percepcion-lenguaje-accion sin infraestructura de GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el total de pesos ronda los 50 MB en int8 (33,5 + 5,4 + 11,3 MB), por lo que deberia caber en cualquier GPU integrada o dedicada moderna.
- GPU recomendadas: se requiere un navegador con soporte WebGPU; no se especifican modelos concretos.
- Cabe en GPU de consumo: si, por el tamano de los pesos; la limitacion practica es el soporte WebGPU del navegador.
- Opciones de despliegue: TFJS en navegador con WebGPU; la demo se sirve desde `elichen.github.io/world-model/`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este artefacto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (politicas roboticas guiadas por lenguaje empaquetadas para TFJS/WebGPU).

## Limitaciones y advertencias

- El codificador de texto solo maneja ingles; las instrucciones en castellano no estan soportadas de forma declarada.
- La `BehaviorPolicy` es especifica del UR5e y esta descrita como libre de lenguaje; no hay evidencia de generalizacion a otras tareas, objetos o brazos.
- El seguimiento visual se limita a cubos 3D sobre una camara frontal de 224x224 en un entorno simulado; no se declara robustez en escenarios reales.
- No hay benchmarks publicados, por lo que el rendimiento real es desconocido.
- Riesgo de alucinacion o de acciones incorrectas: no evaluado; al ser una politica de control, un mapeo erroneo puede producir movimientos no deseados en simulacion.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias ni soporte; el repositorio tiene 0 descargas y 0 likes, lo que sugiere escasa validacion externa.
- El repositorio se creo y actualizo el mismo dia (2026-11-25), sin historial de mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/elichen77/ur5e-language-rotation-tfjs
- Demo: https://elichen.github.io/world-model/
- Codificador base: https://huggingface.co/thenlper/gte-small
