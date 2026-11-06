# DAIRLab/official_phystwin_models

## Resumen

`DAIRLab/official_phystwin_models` es un repositorio de pesos entrenados, no un modelo de lenguaje. Contiene refinamientos fotometricos de los modelos supervisados originales del metodo PhysTwin, un sistema de reconstruccion y simulacion fisica de objetos deformables (principalmente tejidos) a partir de observaciones visuales. Lo publica DAIRLab (Dynamic Autonomy and Intelligent Robotics Lab) de la Universidad de Pensilvania, a partir de los checkpoints supervisados cedidos por los autores originales de PhysTwin (Hanxiao Jiang y colaboradores).

El repositorio agrupa, en una carpeta por caso y ejecucion, todos los checkpoints y versiones retenidas de una etapa de refinamiento fotometrico que parte de los modelos BEST supervisados publicados en el dataset `Jianghanxiao/PhysTwin`. Cada ejecucion combina optimizacion por evolucion diferencial (fase `photometric_cma`) y ajuste por gradiente (fase `photometric_adam`). El resultado es un conjunto de parametros de modelo fisico por caso, no un generador de texto.

Su relevancia es acotada y muy especifica: sirve a quien quiera reproducir o reutilizar los resultados fotometricos del proyecto sobre el benchmark de PhysTwin sin reejecutar los ajustes. No es un modelo de proposito general, no procesa lenguaje y no debe evaluarse con los criterios habituales de un LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo fisico de masas-muelles (spring-mass) ajustado por optimizacion, segun el metodo PhysTwin; no es una red neuronal de lenguaje |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no disponible (checkpoints `.pth` de PyTorch, no cuantizados) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `.pth` (PyTorch); repo de 161,1 GB |
| Dataset de referencia | `Jianghanxiao/PhysTwin` (revision `05665bcd0edad8f069c7def9cbb58d2eb75d68d0`) |
| Numero de casos documentados | al menos 9 en `additional/` (cloth_blue_fold, cloth_pant_fold, cloth_red_fold, cloth_red_lift, cloth_shirt_fold, cloth_shirt_lift, cloth_skirt_1_fold, cloth_skirt_1_lift, cloth_skirt_2_fold) |
| Etapas por ejecucion | `photometric_cma` y `photometric_adam` |

## Arquitectura y entrenamiento

PhysTwin es un metodo de reconstruccion fisica: estima los parametros de un sistema de masas-muelles (rigideces, amortiguamientos y topologia de conexiones) que reproduce el comportamiento de un objeto deformable observado en video. Sobre esa base, este repositorio aplica un refinamiento fotometrico en dos etapas. La primera, `photometric_cma`, emplea evolucion diferencial (estrategia CMA) con 100 generaciones y 800 evaluaciones por caso. La segunda, `photometric_adam`, realiza entre 12.500 y 57.500 actualizaciones segun el caso, repartidas en 500 recorridos (traversals) del presupuesto configurado.

El punto de partida de cada ejecucion es el checkpoint BEST supervisado del autor original para ese caso (por ejemplo `best_20.pth`, `best_60.pth`, `best_80.pth` o `best_99.pth` en `additional_data.zip`). El repositorio no replica los datos de entrada ni el codigo de PhysTwin: los primeros se obtienen del dataset original fijado por revision y el segundo conserva su aviso MIT (Copyright (c) 2025 Hanxiao Jiang). Las revisiones de codigo registradas son `d917d092df1b`, `019f3dc1821a` y `a50886049911`; la model card advierte que no se registro el estado limpio en todas las etapas. Todas las ejecuciones documentadas figuran como completas.

## Capacidades

- Ajuste de parametros fisicos de objetos deformables (prendas y tejidos) a partir de observaciones, mediante refinamiento fotometrico.
- Simulacion de dinamica de tejidos con el modelo de masas-muelles resultante, una vez cargado el checkpoint con el codigo de PhysTwin.
- Reproduccion de los experimentos del proyecto: cada carpeta incluye registros de ejecucion y metadatos generados, ademas de los checkpoints.
- Recuperacion de los checkpoints intermedios y finales (BEST / FINAL) por etapa y caso.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision por si mismo, tool calling ni agentes.
- No tiene capacidades multilingues.

## Casos de uso

- Reproduccion de resultados academicos: cargar los checkpoints `adam/final` de cada caso para verificar las cifras de refinamiento fotometrico del proyecto sin repetir las 500 iteraciones de ajuste.
- Comparacion de metodos de ajuste fisico: usar las dos etapas (`photometric_cma` y `photometric_adam`) como linea base frente a optimizadores alternativos sobre el mismo conjunto de casos.
- Investigacion en simulacion de tejidos: emplear los parametros ajustados de prendas concretas (camisas, faldas, pantalones) para inicializar simulaciones en robótica de manipulacion textil.
- Robotica de deformables: integrar los modelos ajustados en un pipeline de planificacion donde el robot necesite predecir como se pliega o se levanta una prenda.
- Docencia y divulgacion: demostrar el flujo completo de PhysTwin partiendo de pesos ya entrenados, con presupuestos de computo documentados por caso.
- Auditoria de trazabilidad: usar los registros de ejecucion (revision de codigo, presupuesto completado, checkpoint padre) para replicar exactamente una configuracion concreta.
- Analisis de sensibilidad al presupuesto: los casos con distinto numero de actualizaciones (12.500 frente a 57.500) permiten estudiar el efecto del presupuesto de ajuste en el resultado final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card documenta presupuestos de computo y estados de ejecucion, pero no metricas de error fisico ni fotometrico comparables.

## Requisitos de hardware

- El repositorio ocupa 161,1 GB; el espacio en disco para clonarlo o descargarlo es el primer requisito practico.
- VRAM estimada para inferencia: no disponible. Depende del tamano del sistema de masas-muelles por caso y de la implementacion de PhysTwin, no de un numero de parametros publicado.
- GPU recomendadas: no disponibles en la informacion proporcionada. El ajuste por gradiente (`photometric_adam`) y la simulacion implican computo en GPU, pero no se especifican modelos concretos.
- Encaje en GPU de consumo: no disponible.
- Opciones de despliegue: carga de checkpoints `.pth` con PyTorch y el codigo de PhysTwin; no aplica vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Contenido | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|
| `DAIRLab/official_phystwin_models` | Refinamientos fotometricos de modelos PhysTwin por caso | MIT | `.pth` | Hugging Face |
| `DAIRLab/phystwin_models` | Ajustes estilo PhysTwin de sesiones de laboratorio del dataset propio | MIT | `.pth` | Hugging Face |
| `Jianghanxiao/PhysTwin` (dataset) | Entradas supervisadas originales y checkpoints BEST del autor | MIT | dataset + `.pth` | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: cualquier evaluacion con MMLU, HumanEval o GSM8K carece de sentido.
- Los pesos estan ligados a casos concretos del benchmark PhysTwin; no generalizan a objetos o escenas arbitrarias sin reajuste.
- Los datos de entrada no se incluyen en el repositorio: hay que obtenerlos de `Jianghanxiao/PhysTwin` en la revision fijada, y su disponibilidad futura depende de ese repositorio de terceros.
- La model card reconoce que el estado limpio del codigo no se registro en todas las etapas, lo que puede complicar la reproducibilidad exacta.
- Licencia MIT para los paquetes generados por el proyecto; el codigo de PhysTwin conserva su propio aviso MIT y copyright de Hanxiao Jiang, que debe mantenerse en cualquier redistribucion.
- Riesgo de alucinacion y sesgos: no aplica en el sentido habitual; el riesgo equivalente es el sobreajuste del modelo fisico a las observaciones de entrenamiento.
- El tamano del repositorio (161,1 GB) y la ausencia de cuantizaciones lo hacen poco practico para entornos con almacenamiento limitado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/DAIRLab/official_phystwin_models
- Arbol de ficheros: https://huggingface.co/DAIRLab/official_phystwin_models/tree/main
- Repositorio hermano: https://huggingface.co/DAIRLab/phystwin_models
- Dataset de referencia: https://huggingface.co/datasets/Jianghanxiao/PhysTwin
- Codigo de PhysTwin: https://github.com/Jianghanxiao/PhysTwin
- Licencia del codigo original: https://github.com/Jianghanxiao/PhysTwin/blob/81c718790a37e5e0102eb77af2c6edd34a9db25f/LICENSE
