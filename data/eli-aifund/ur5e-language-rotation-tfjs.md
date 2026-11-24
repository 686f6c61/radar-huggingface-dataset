# eli-aifund/ur5e-language-rotation-tfjs

## Resumen

`ur5e-language-rotation-tfjs` es un paquete de pesos en formato TensorFlow.js pensado para ejecutarse íntegramente en el navegador (WebGPU) como parte de la demo `elichen.github.io/world-model/`. Lo publica el usuario `eli-aifund` y no es un modelo de lenguaje generativo al uso, sino un conjunto de artefactos de robótica: un codificador de texto congelado, una política de control para un brazo UR5e y un módulo de percepción visual 3D. El objetivo es convertir instrucciones en lenguaje natural en comandos de control del robot sin reentrenar el codificador de lenguaje.

La pieza central es `arena_policy`, que contiene seis matrices de rotación ortogonal de Procrustes de dimensión 112×112, una nube de puntos de una variedad de comportamiento no etiquetada de 1.600 clips y una `BehaviorPolicy` recurrente de 4,37 M de parámetros que opera sin entrada de lenguaje. El codificador de texto es `thenlper/gte-small` cuantizado a int8 (33,5 MB), y el módulo visual es un `ViT-tiny` congelado con una cabeza `Readout2` para seguimiento de cubos 3D desde una cámara frontal de 224×224.

Es relevante porque demuestra un flujo completo de robótica en el cliente: inferencia en el navegador con WebGPU, pesos cuantizados a int8 y una separación limpia entre percepción, lenguaje y control. El repositorio ocupa 0,1 GB, tiene licencia MIT y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: encoder transformer de texto (gte-small), política recurrente (BehaviorPolicy) y ViT-tiny para visión; pesos en TensorFlow.js |
| Parametros totales | No disponible como cifra única; BehaviorPolicy: 4,37 M; ViT-tiny: no disponible; gte-small: no disponible en la model card |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8 (todos los artefactos: minilm, arena_policy y weights) |
| Idiomas soportados | Inglés (el encoder `thenlper/gte-small` es un encoder preentrenado en inglés) |
| Licencia | MIT |
| Formato de pesos | TensorFlow.js: pares `.bin` + `.json` (`minilm`, `arena_policy`, `weights`) |

## Arquitectura y entrenamiento

El sistema se compone de tres módulos independientes. El primero es un encoder de texto `thenlper/gte-small` cuantizado a int8 (33,5 MB) que, según la model card, se usa sin entrenamiento específico de robótica ("zero robot training"). El segundo es `arena_policy` (5,4 MB), que agrupa seis matrices de rotación ortogonal de Procrustes R_N ∈ O(112, 112) para N ∈ {30, 100, 300, 1000, 23503, shuffled}, una nube de una variedad de comportamiento no etiquetada de 1.600 clips y una `BehaviorPolicy` recurrente de 4,37 M de parámetros que no recibe lenguaje. El tercero es `weights` (11,3 MB), un LeWM `ViT-tiny` congelado más una cabeza `Readout2` robusta a variaciones fotométricas para seguimiento visual de cubos 3D desde una cámara frontal de 224×224.

La innovación técnica declarada es el uso de rotaciones de Procrustes para alinear el espacio de embeddings del lenguaje con el espacio latente de comportamiento del robot, lo que permite mapear instrucciones a acciones sin reentrenar el encoder. No se especifican en la model card el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. Tampoco se detalla el mecanismo de decodificación ni si se emplea decodificación especulativa.

## Capacidades

- Conversión de instrucciones en lenguaje natural (inglés) en comandos de control para un brazo UR5e.
- Control de rotación del efector final mediante políticas alineadas con rotaciones de Procrustes.
- Percepción visual 3D de cubos a partir de una cámara frontal de 224×224 con un ViT-tiny congelado.
- Inferencia en el navegador del cliente mediante TensorFlow.js y WebGPU.
- Ejecución con pesos cuantizados a int8 para reducir huella de memoria y ancho de banda.
- Separación entre módulo de lenguaje, política de control y percepción, lo que permite sustituir componentes de forma aislada.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Demostración educativa de robótica en el navegador: la demo `elichen.github.io/world-model/` carga los tres artefactos y permite experimentar con control de un UR5e sin instalación local, aprovechando WebGPU para la inferencia.
- Prototipado rápido de interfaces lenguaje-acción: un desarrollador puede probar el mapeo de instrucciones en inglés a rotaciones del efector usando `minilm` y `arena_policy` sin entrenar un encoder propio.
- Investigación sobre alineamiento de espacios latentes: las matrices de Procrustes permiten estudiar cómo se relaciona el espacio de embeddings de `gte-small` con la variedad de comportamiento del robot.
- Seguimiento visual de objetos en entornos simulados: el módulo `weights` con ViT-tiny y `Readout2` sirve para experimentos de percepción 3D de cubos desde cámara frontal en MuJoCo.
- Docencia en robótica y aprendizaje por imitación: la nube de 1.600 clips no etiquetados y la `BehaviorPolicy` recurrente son material para explicar políticas sin lenguaje y alineamiento multimodal.
- Pruebas de despliegue en cliente sin backend: al ser pesos int8 de pocos megabytes, el paquete es adecuado para validar latencia y viabilidad de inferencia en navegador con WebGPU antes de migrar a un stack de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio completo ocupa 0,1 GB y los pesos suman aproximadamente 50 MB (33,5 MB + 5,4 MB + 11,3 MB) en int8, por lo que la huella de memoria es muy reducida.
- GPU recomendadas: no se especifican en la model card; el diseño apunta a ejecución en navegador con WebGPU, lo que incluye GPU integradas y dedicadas compatibles con dicha API.
- GPU de consumo: al estar pensado para WebGPU, debería caber en GPU de consumo modernas, aunque no se documentan modelos concretos ni requisitos mínimos.
- Opciones de despliegue: TensorFlow.js en navegador (WebGPU); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| `ur5e-language-rotation-tfjs` | Política robótica + encoder + visión | 4,37 M (política); resto no disponible | No disponible | MIT | TF.js int8 |
| `thenlper/gte-small` | Encoder de texto | No disponible en esta ficha | No disponible | No disponible | Safetensors |
| Políticas de imitación tipo ACT/DP para UR5e | Política visomotora | Varía según implementación | No disponible | Varía | PyTorch |

No se dispone de datos de rendimiento comparables en la información proporcionada; la comparativa se limita a naturaleza y formato de los artefactos.

## Limitaciones y advertencias

- El encoder de texto es un modelo preentrenado en inglés, por lo que las instrucciones en castellano u otros idiomas no están soportadas de forma nativa.
- La `BehaviorPolicy` opera sin entrada de lenguaje; el mapeo lenguaje-acción depende de las rotaciones de Procrustes y no de un entrenamiento supervisado específico, lo que puede limitar la generalización.
- No se documentan sesgos, tasas de alucinación ni métricas de robustez; al no ser un modelo generativo de texto, el riesgo de alucinación se traslada a posibles errores de mapeo instrucción-acción.
- Los pesos están cuantizados a int8, lo que puede introducir pérdida de precisión frente a versiones en coma flotante.
- El paquete está diseñado para la demo concreta de `elichen.github.io/world-model/`; no se garantiza su funcionamiento fuera de ese entorno ni con otras cámaras o configuraciones.
- La licencia MIT permite uso comercial, pero no se especifican restricciones adicionales sobre los datos de entrenamiento ni sobre el modelo base `gte-small`.
- No hay información sobre límites de contexto, latencia en producción ni compatibilidad con versiones futuras de TensorFlow.js o WebGPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eli-aifund/ur5e-language-rotation-tfjs
- Demo en navegador: https://elichen.github.io/world-model/
- Encoder base: https://huggingface.co/thenlper/gte-small
