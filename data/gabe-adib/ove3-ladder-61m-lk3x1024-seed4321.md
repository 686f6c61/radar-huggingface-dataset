# gabe-adib/ove3-ladder-61m-lk3x1024-seed4321

## Resumen

`ove3-ladder-61m-lk3x1024-seed4321` es un checkpoint de investigación publicado por el usuario gabe-adib en HuggingFace. No es un modelo comercial ni un lanzamiento de producto: es una ejecución concreta (seed 4321) dentro de una "escalera de intervenciones" denominada ove3, en la que se comparan variantes arquitectónicas manteniendo fijos los datos, la tasa de aprendizaje, el tamaño de batch y el número de pasos de una celda IsoFLOP de 61M. La variante publicada aquí es la rama K3 LatentMoE: un modelo de mezcla de expertos con 61M de parámetros activos, 1024 expertos de media anchura y enrutamiento top-16 (el doble de parámetros enrutados respecto a la referencia).

El interés del artefacto es metodológico, no de producto. Al fijar el presupuesto de cómputo y variar solo la estructura de expertos, el autor genera puntos de comparación limpios para estudiar el efecto de LatentMoE y del número de expertos en la pérdida de validación. El checkpoint publicado corresponde al mejor paso de validación (iteración 17.290), con una pérdida de validación de 1,1015 y una pérdida en held-out de 1,1944 nats/carácter, promediada ponderadamente sobre 9 dominios.

La información pública es mínima: no hay model card de uso, no hay licencia declarada, no hay idiomas declarados, no hay pipeline asignado y el repositorio no tiene descargas ni likes. El repositorio ocupa 19,5 GB e incluye el checkpoint distribuido de Megatron con estado del optimizador, los logs de entrenamiento y el `config.yaml` de la ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (LatentMoE) sobre backbone denominado `kimi_linear` en la configuracion del autor; checkpoint en formato Megatron |
| Parametros totales | no disponible (solo se declaran parametros activos) |
| Parametros activos | 61M |
| Parametros activos (detalle MoE) | 1024 expertos de media anchura, enrutamiento top-16; "2x routed parameters" respecto a la referencia de la escalera |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF ni variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Checkpoint distribuido de Megatron (`checkpoint/`), con estado del optimizador incluido; no se publican safetensors ni GGUF |
| Normalizacion | RMSNorm con eps 1e-5 |
| Router scaling | 1,0 |
| Semilla | 4321 |
| Iteracion del checkpoint | 17.290 (`best_1`, mejor paso de validacion) |
| Perdida de validacion | 1,1015 |
| Perdida held-out | 1,1944 nats/caracter (ponderada por blend sobre 9 dominios) |
| Tamano del repositorio | 19,5 GB (incluye estado del optimizador y logs) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos con enrutamiento disperso: 1024 expertos de media anchura, top-16 activados por token, RMSNorm con epsilon 1e-5 y escalado de router 1,0. El autor etiqueta el backbone como `kimi_linear`, sin más documentación en la información disponible; no se detalla si implica atención lineal, atención híbrida o una variante concreta de atención, por lo que ese punto debe tratarse como no confirmado. La etiqueta LatentMoE indica que la mezcla opera en un espacio latente, pero tampoco se publica la formulación exacta ni la dimensión de los expertos.

El entrenamiento sigue la receta de la celda IsoFLOP de 61M: mismos datos, misma tasa de aprendizaje, mismo batch y mismos pasos que el resto de brazos de la escalera, cambiando únicamente la intervención arquitectónica y la semilla. No se especifica en la información disponible el número de tokens vistos, la composición del corpus (más allá de que la evaluación se desglosa en 9 dominios), ni si hubo fases de RLHF, DPO o ajuste por instrucciones. La métrica de pérdida expresada en nats por carácter sugiere tokenización a nivel de carácter, pero esto no se confirma explícitamente en la documentación publicada.

## Capacidades

- Modelado de lenguaje autoregresivo: el checkpoint es un modelo de lenguaje base entrenado con objetivo de predicción del siguiente token; no se documenta ningún ajuste posterior.
-Mezcla de expertos dispersa: 1024 expertos con top-16 activos, lo que permite estudiar el comportamiento del enrutamiento y el equilibrio de carga por experto.
- Evaluación por dominio: la pérdida held-out se reporta agregada y desglosada en 9 dominios (archivo `DOMAIN_NLL.txt`), lo que habilita análisis de degradación por dominio.
- Reproducibilidad experimental: el repositorio incluye `config.yaml`, logs de entrenamiento por segmentos de 4 horas, logs de scoring y eventos de TensorBoard.
- Continuación de entrenamiento: al publicarse el estado del optimizador, el checkpoint permite reanudar o afinar el modelo.
- Generación de texto en sentido estricto: no se documenta chat, instruction-following, tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking. Cualquier uso conversacional requeriría ajuste adicional.
- Capacidades multilingües: no disponible; no se declaran idiomas.

## Casos de uso

- Replicación de ablaciones de MoE: cargar este brazo y compararlo con los demás brazos de la escalera ove3 manteniendo datos y pasos constantes, para aislar el efecto de LatentMoE y del top-16 sobre la pérdida de validación.
- Estudio del enrutamiento de expertos: con 1024 expertos y top-16, el checkpoint sirve para analizar distribuciones de carga, colapso de expertos y sensibilidad al `router scaling` en un modelo pequeño y entrenable en hardware modesto.
- Investigación sobre tokenización a nivel de carácter: la métrica en nats/carácter y el desglose por dominios permiten usar el modelo como banco de pruebas de modelos de lenguaje a escala de carácter.
- Punto de partida para fine-tuning académico: al incluir estado del optimizador, se puede continuar el entrenamiento con un presupuesto de cómputo reducido y comparar curvas frente a la referencia de 61M.
- Evaluación de infraestructura Megatron: el checkpoint distribuido con estado del optimizador es útil para probar rutinas de conversión, sharding y reanudación en pipelines de Megatron-LM.
- Generación de texto de baja latencia en prototipos: con 61M de parámetros activos por token, el coste de cómputo por token es reducido, lo que permite experimentar en CPU o en una única GPU consumer, siempre que se convierta el checkpoint a un formato inferible.
- Docencia y demostraciones de MoE: un modelo de este tamaño permite explicar en vivo el funcionamiento de un router disperso sin necesidad de clústeres multi-GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones de razonamiento o código. Las únicas métricas reportadas son de pérdida del propio entrenamiento:

| Metrica | Valor |
|---|---|
| Perdida de validacion (mejor paso, iteracion 17.290) | 1,1015 |
| Perdida held-out (ponderada por blend, 9 dominios) | 1,1944 nats/caracter |
| Perdida por dominio | publicada en `DOMAIN_NLL.txt` del repositorio (no incluida en la informacion disponible) |

## Requisitos de hardware

- VRAM para inferencia: no disponible con precision. Solo se declaran 61M de parámetros activos por token; el número de parámetros totales no se publica, y los 19,5 GB del repositorio incluyen estado del optimizador, logs y eventos de TensorBoard, por lo que no sirven como proxy fiable del tamaño de los pesos.
- GPU recomendadas: al tratarse de un modelo de escala 61M activos, cualquier GPU con suficiente VRAM para los parámetros totales debería bastar; una RTX 4090, una RTX 3090 o incluso una GPU integrada moderna son candidatas plausibles una vez convertido el checkpoint. No hay mediciones publicadas.
- GPU de datacenter: A100 y H100 son innecesarias para inferencia, pero sí relevantes para reentrenar o reanudar el modelo desde el checkpoint distribuido con estado del optimizador.
- Despliegue: el formato publicado es un checkpoint distribuido de Megatron, no apto para carga directa en llama.cpp, Ollama, vLLM o TGI. Es necesario un paso de conversión a safetensors en formato HuggingFace, que no se documenta ni se proporciona en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La comparación natural es con los otros brazos de la misma escalera ove3 (misma celda IsoFLOP de 61M, distintas intervenciones y semillas), pero sus resultados no se incluyen en la información disponible.

| Modelo | Parametros activos | Contexto | Licencia | Formato | Datos publicos |
|---|---|---|---|---|---|
| ove3-ladder-61m-lk3x1024-seed4321 | 61M | no disponible | no disponible | Megatron | Model card minima, logs y config |
| Otros brazos de la escalera ove3 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Artefacto de investigación: es una ejecución única de un experimento de ablación, no un modelo listo para producción ni para uso conversacional.
- Sin licencia declarada: la ausencia de licencia impide asumir permisos de uso comercial, redistribución o modificación. Hay que contactar con el autor antes de cualquier uso fuera de investigación.
- Sin model card de uso: no se documentan limitaciones, sesgos, idiomas ni comportamiento esperado; tampoco hay evaluación de seguridad.
- Riesgo de alucinación: no evaluado. Al ser un modelo base sin ajuste por instrucciones, la generación libre puede producir texto incoherente o factualmente incorrecto sin ninguna salvaguarda.
- Sesgos: no disponibles. No se describe la composición del corpus de entrenamiento, por lo que no se puede caracterizar el sesgo de dominio, idioma o demografía.
- Idiomas: no declarados. No se puede asumir un rendimiento aceptable en castellano ni en ningún otro idioma concreto.
- Contexto: no publicado. Se desconoce la ventana máxima soportada y si el modelo usa posiciones absolutas, relativas o extrapolables.
- Formato no inferible directamente: el checkpoint distribuido de Megatron requiere conversión; sin ella no se puede cargar en los runners habituales.
- Parámetros totales desconocidos: impide estimar con rigor los requisitos de VRAM y el coste real de despliegue.
- Fecha de creación declarada en el repositorio: 2026-10-17, según los metadatos de HuggingFace.
- Los resultados de búsqueda web asociados a esta consulta no guardan relación con el modelo (hablan de generación de vídeo y asistentes comerciales) y no se han utilizado como fuente.

## Enlaces

- HuggingFace: https://huggingface.co/gabe-adib/ove3-ladder-61m-lk3x1024-seed4321
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios de código ni demos relacionados con este modelo.
