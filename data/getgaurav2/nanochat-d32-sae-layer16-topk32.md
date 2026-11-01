# getgaurav2/nanochat-d32-sae-layer16-topk32

## Resumen

nanochat-d32-sae-layer16-topk32 es un autoencoder disperso (SAE, *sparse autoencoder*) entrenado sobre las activaciones internas del modelo nanochat-d32 (1.88B parametros, de karpathy), concretamente sobre la salida residual de la capa 16. No es un modelo generativo: es una herramienta de interpretabilidad mecanistica cuyo objetivo es descomponer las representaciones internas del modelo base en caracteristicas dispersas y, en principio, mas interpretables para un humano. Lo desarrolla el usuario getgaurav2 y se publica bajo licencia MIT.

La relevancia de este artefacto es acotada y muy especifica: sirve para investigar que representa nanochat-d32 en una capa concreta, no para desplegar aplicaciones. La arquitectura es TopK (k=32) con un cuello de botella de 2048 a 8192 dimensiones y vuelta a 2048. Se entreno con 50.000 activaciones extraidas de WikiText-103 durante 3 epocas, alcanzando una perdida de entrenamiento de 0.445 y una varianza explicada del 57,3%, con 2186 de las 8192 caracteristicas activas (27%).

El repositorio ocupa 0.1 GB y no registra descargas ni likes en el momento de la consulta. Su valor practico depende por completo de la existencia y el acceso al modelo base nanochat-d32 y al codigo de entrenamiento nanochat-SAE, que no se distribuyen en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder disperso TopK (k=32) sobre activaciones residuales |
| Parametros totales | no disponible (dimensiones 2048 → 8192 → 2048) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje generativo) |
| Tipos de cuantizacion | no disponible (checkpoint en PyTorch, presumiblemente float32/bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | checkpoint PyTorch (`sae_final.pt`) con `config`, `sae_state_dict`, `act_mean` y `act_std` |

## Arquitectura y entrenamiento

El SAE sigue la formulacion TopK: una capa de codificacion que proyecta las activaciones residuales de 2048 dimensiones a un espacio latente sobredimensionado de 8192, seguida de una activacion que retiene unicamente las k=32 caracteristicas de mayor magnitud, y una capa de decodificacion de vuelta a 2048. El punto de extraccion es `blocks.16.hook_resid_post` del modelo nanochat-d32, es decir, la salida residual tras el bloque 16.

El entrenamiento utilizo 50.000 activaciones recogidas de WikiText-103 durante 3 epocas. La perdida final de entrenamiento fue 0.445407 y la varianza explicada del 57,3%, un valor moderado que indica que la reconstruccion captura algo mas de la mitad de la varianza de las activaciones. Solo 2186 de las 8192 caracteristicas (27%) permanecen activas, lo que sugiere cierta muerte de caracteristicas (*feature death*), un fenomeno habitual en SAE con presupuestos de entrenamiento limitados. No se documentan tecnicas de regularizacion adicionales, inicializacion, tasa de aprendizaje ni estrategia de resampling.

El uso requiere normalizar las activaciones con `act_mean` y `act_std` incluidos en el checkpoint antes de pasarlas por el SAE; omitir esta normalizacion invalida la reconstruccion y las caracteristicas extraidas.

## Capacidades

- Extraccion de caracteristicas dispersas de las activaciones residuales de la capa 16 de nanochat-d32.
- Reconstruccion de activaciones a partir de una representacion latente dispersa de 32 dimensiones activas.
- Analisis de interpretabilidad mecanistica: identificacion de direcciones latentes asociadas a patrones en las activaciones del modelo base.
- Calculo de metricas de reconstruccion (perdida, varianza explicada) por parte del propio modulo `TopKSAE`.
- No genera texto, no razona, no ejecuta codigo, no soporta tool calling ni agentes, no procesa vision ni audio.
- No tiene capacidades multilingues propias; el unico idioma implicito es el del corpus de calibracion (WikiText-103, predominantemente ingles).

## Casos de uso

- Analisis de interpretabilidad de una capa concreta: cargar el SAE, extraer activaciones de `blocks.16.hook_resid_post` de nanochat-d32 sobre un conjunto de prompts y examinar que caracteristicas latentes se activan, para estudiar que informacion codifica el modelo en esa profundidad.
- Deteccion de caracteristicas asociadas a conceptos: buscar direcciones latentes que se activen de forma consistente ante categorias lexicas o sintacticas concretas y correlacionarlas con tokens del corpus de entrada.
- Estudio de *feature death*: analizar la distribucion de activaciones de las 2186 caracteristicas vivas frente a las 6006 inactivas para evaluar la eficiencia del entrenamiento con TopK y proponer mejoras en el pipeline.
- Comparacion de capas: entrenar o cargar SAE de otras capas del mismo modelo base y contrastar la varianza explicada y el numero de caracteristicas vivas para localizar donde se concentra la informacion interpretable.
- Investigacion academica sobre SAE: usar este checkpoint como referencia reproducible (MIT, pesos publicos) en experimentos que comparen arquitecturas TopK frente a alternativas como JumpReLU o Gated SAE.
- Auditoria de representaciones: inspeccionar si el modelo base codifica sesgos o asociaciones indeseadas en la capa 16 mediante la activacion de caracteristicas latentes ante conjuntos de prompts controlados.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perdida de entrenamiento (mejor) | 0.445407 |
| Varianza explicada | 57,3% |
| Caracteristicas vivas | 2186 / 8192 (27%) |
| Epocas | 3 |
| Activaciones de entrenamiento | 50.000 (WikiText-103) |

No se han publicado resultados de benchmarks comparativos con otros SAE en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 0.1 GB, por lo que la inferencia del SAE cabe holgadamente en cualquier GPU consumer con 2 GB o mas de VRAM; el cuello de botella real es el modelo base nanochat-d32 (1.88B parametros), que en bfloat16 requiere aproximadamente 3,8 GB solo para pesos.
- GPU recomendadas: cualquier GPU con soporte CUDA moderna (RTX 3060 12 GB, RTX 4090, A100, H100) es suficiente para el SAE; para el modelo base se recomienda al menos 8 GB de VRAM en bfloat16 con margen para activaciones y cache.
- Cabe en GPU consumer: si, el SAE en cualquier GPU consumer; el modelo base en GPUs de 8 GB o mas en bfloat16.
- Opciones de despliegue: el SAE se carga con PyTorch puro (`torch.load` + `TopKSAE`); no aplica vLLM, llama.cpp, Ollama ni TGI porque no es un modelo generativo.
- Latencia y throughput: no disponibles; dependen del coste de extraer activaciones del modelo base, no del SAE, que es una operacion de dos proyecciones lineales.

## Comparativa con modelos similares

| Modelo | Base | Capa | Arquitectura | Latente | Varianza explicada | Licencia |
|---|---|---|---|---|---|---|
| nanochat-d32-sae-layer16-topk32 | nanochat-d32 (1.88B) | 16 | TopK (k=32) | 8192 | 57,3% | MIT |
| SAE de GPT-2 small (referencia habitual) | GPT-2 small (124M) | variable | TopK / JumpReLU | 24576 | no disponible | MIT |
| SAE de Gemma-2-2B (Gemma Scope) | Gemma-2-2B | multiple | JumpReLU | variable | no disponible | Gemma Terms of Use |

No se dispone de datos publicados que permitan una comparacion cuantitativa directa con otros SAE en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no puede usarse para generacion, razonamiento ni ninguna tarea de inferencia directa.
- Solo cubre la capa 16 de nanochat-d32; no representa el comportamiento global del modelo base.
- Varianza explicada del 57,3%: la reconstruccion es parcial y las caracteristicas extraidas no capturan toda la informacion de la activacion original.
- Solo 27% de caracteristicas vivas: la mayoria de las 8192 direcciones latentes no se activan, lo que limita la cobertura del espacio de representaciones.
- Entrenado con solo 50.000 activaciones de WikiText-103 (ingles, dominio enciclopedico): probable sesgo hacia ese dominio y escasa representacion de otros idiomas o registros.
- Requiere normalizacion explicita con `act_mean` y `act_std`; sin ella los resultados son invalidos.
- Depende de codigo externo (`nanochat-SAE`, repositorio de GitHub) y del modelo base `karpathy/nanochat-d32`, no incluidos en este repositorio.
- No se documentan sesgos especificos ni evaluaciones de robustez; cualquier conclusion sobre sesgos del modelo base extraida de este SAE debe tratarse como preliminar.
- Licencia MIT permite uso comercial del SAE, pero el modelo base nanochat-d32 tiene su propia licencia que debe verificarse por separado.

## Enlaces

- HuggingFace: https://huggingface.co/getgaurav2/nanochat-d32-sae-layer16-topk32
- Modelo base: https://huggingface.co/karpathy/nanochat-d32
- Repositorio de entrenamiento: https://github.com/SolshineCode/nanochat-SAE
