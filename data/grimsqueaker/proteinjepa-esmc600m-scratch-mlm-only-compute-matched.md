# GrimSqueaker/ProteinJEPA-ESMC600M-scratch-MLM-only-compute-matched

## Resumen

ProteinJEPA-ESMC600M-scratch-MLM-only-compute-matched es un modelo de lenguaje de proteinas (protein language model, PLM) desarrollado por GrimSqueaker como control experimental del articulo ProteinJEPA. Se trata de un modelo con la arquitectura ESM-C de 600M de parametros (concretamente 575.036.992 parametros reales), portada por Synthyra como ESMplusplus, con 36 capas y un tamano de representacion oculta de 1152. El modelo se entrena desde inicializacion aleatoria (semilla 42) exclusivamente con el objetivo de masked language modeling (MLM) sobre UniRef50, sin ninguna componente de perdida JEPA.

El modelo existe como referencia de control "compute-matched" dentro del estudio: su presupuesto de computo se iguala al del modelo hermano que combina MLM con prediccion en espacio latente (JEPA), de modo que las comparaciones entre ambos aislan el efecto de la perdida JEPA del efecto del computo adicional. Parte del checkpoint MLM-only step-matched en el paso 56.800 y continua hasta 83.070 actualizaciones, lo que equivale a 71.000 x 1,17, replicando el computo extra del profesor JEPA.

La relevancia de este modelo es fundamentalmente metodologica: no es un modelo destinado a produccion, sino una pieza de ablativo que permite a investigadores reproducir y auditar las conclusiones del articulo sobre si la prediccion latente mejora el preentrenamiento de PLMs. Su publicacion bajo la etiqueta fill-mask y con codigo de arquitectura remoto lo hace directamente utilizable con transformers para tareas de enmascarado de residuos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ESM-C (port Synthyra ESMplusplus), transformer, 36 capas, hidden size 1152 |
| Parametros totales | 575.036.992 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible (modelo de secuencias de proteinas, no de lenguaje natural) |
| Licencia | other (pesos y model card bajo `license: other`; el codigo de arquitectura hereda MIT y la EvolutionaryScale Cambrian Non-Commercial License Agreement) |
| Formato de pesos | safetensors (repo de 2,3 GB) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura ESM-C en su implementacion ESMplusplus de Synthyra: un transformer de 36 capas con dimension oculta 1152 y aproximadamente 575M de parametros. El codigo de arquitectura reside en `modeling_esm_plusplus.py` y se carga mediante `trust_remote_code=True`, ya que no forma parte del nucleo de transformers. La tarea de preentrenamiento es exclusivamente MLM con un esquema de enmascarado 80/10/10 y una tasa de mascara del 20%.

El entrenamiento arranca desde inicializacion aleatoria (semilla 42) sobre UniRef50 y se divide en dos fases: primero un tramo step-matched hasta el paso 56.800 con learning rate constante, y despues una continuacion hasta 83.070 actualizaciones con pico de learning rate 1e-3 y cooldown WSD a partir del paso 66.456. Cada actualizacion procesa aproximadamente 260.000 tokens con el optimizador AdamW. La ultima parte del run repite el inicio del flujo de una epoca de UniRef50, resultando en 1,16 epocas totales. No hay perdida JEPA ni profesor en este modelo; esa es precisamente la diferencia con su contraparte MLM+JEPA.

## Capacidades

- Enmascarado de residuos (fill-mask) sobre secuencias de proteinas: predice el aminoacido o token enmascarado en una posicion dada.
- Generacion de representaciones contextuales de proteinas por residuo, utilizables como features para tareas downstream.
- Modelado de lenguaje de proteinas: captura dependencias locales y de medio alcance en secuencias proteicas.
- No soporta tool calling ni function calling (es un PLM, no un modelo de instrucciones).
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues en el sentido de lenguaje natural.
- No dispone de modo thinking, vision ni audio.
- Capacidad de extraccion de embeddings para clasificacion, prediccion de estructura o anotacion funcional, segun el uso habitual de PLMs tipo ESM.

## Casos de uso

- Reproduccion de experimentos de ablativo: sirve como control compute-matched para comparar contra el modelo MLM+JEPA en el mismo presupuesto de computo, aislando el efecto de la perdida latente.
- Anotacion de variantes missense: dado un contexto proteico, evaluar la verosimilitud de un residuo enmascarado para priorizar variantes candidatas en estudios geneticos.
- Extraccion de embeddings para clasificacion de familias proteicas: usar las representaciones por residuo o por secuencia como entrada a clasificadores ligeros en pipelines de bioinformatica.
- Prediccion de contacto o estructura secundaria: aprovechar las representaciones contextuales como features en modelos downstream de estructura.
- Filtrado de secuencias en metagenomica: puntuar la plausibilidad de marcos abiertos de lectura candidatos mediante la probabilidad MLM.
- Docencia y formacion en bioinformatica: ejemplo reproducible de preentrenamiento de un PLM con presupuesto controlado para cursos sobre modelos de proteinas.
- Baseline en publicaciones: punto de comparacion estandar para nuevos metodos de preentrenamiento de PLMs que quieran medir ganancias frente a un MLM puro de igual computo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los numeros estan en el articulo (arXiv:2605.07554) y que la propia card no los lista.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,3 GB solo de pesos, mas overhead de activaciones; en la practica cabe en GPUs consumer con 8 GB o mas.
- VRAM estimada en fp16/bf16: alrededor de 1,2 GB de pesos, holgado en cualquier GPU consumer moderna (RTX 3060 en adelante).
- GPUs recomendadas: RTX 3090, RTX 4090, A100 o H100 para lotes grandes y extraccion masiva de embeddings; suficiente una RTX 3060/4060 para inferencia puntual.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 6-8 GB de VRAM.
- Opciones de despliegue: transformers con `trust_remote_code=True` (via oficial documentada); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ProteinJEPA-ESMC600M-scratch-MLM-only-compute-matched | 575M | no disponible | fill-mask / PLM | other (con componentes no comerciales) | Hugging Face |
| ProteinJEPA-ESMC600M-scratch-MLM-JEPA (contraparte del mismo autor) | ~575M | no disponible | PLM con perdida JEPA | other | Hugging Face |
| Synthyra/ESMplusplus_large (arquitectura base) | no disponible | no disponible | PLM | MIT (codigo) + Cambrian Non-Commercial (NOTICE) | Hugging Face |
| ESM-C 600M original (EvolutionaryScale) | ~600M | no disponible | PLM | Cambrian Non-Commercial | Hugging Face / EvolutionaryScale |

La comparativa se limita a los modelos citados en la informacion disponible; no se dispone de datos de rendimiento para confrontarlos numericamente.

## Limitaciones y advertencias

- Modelo de investigacion: es un control de ablativo, no un modelo afinado para produccion ni para instrucciones.
- Riesgo de alucinacion: como PLM generativo MLM, puede asignar probabilidad alta a residuos incorrectos en contextos poco representados en UniRef50.
- Sesgo de datos: entrenado sobre UniRef50, hereda los sesgos de cobertura taxonomica de esa base (sobrerrepresentacion de organismos modelo y secuencias bien estudiadas).
- Contexto maximo no documentado: se desconoce la longitud de secuencia maxima soportada, lo que limita su uso en proteinas muy largas sin validacion previa.
- Restricciones de licencia: los pesos se distribuyen como `license: other` y el codigo de arquitectura incluye la EvolutionaryScale Cambrian Non-Commercial License Agreement, lo que puede impedir el uso comercial; es imprescindible revisar los terminos antes de cualquier despliegue productivo.
- Dependencia de `trust_remote_code=True`: requiere ejecutar codigo remoto del repositorio, con el riesgo de seguridad asociado.
- Sin datos de benchmarks publicados en la informacion disponible: no es posible validar su calidad relativa sin consultar el articulo.
- Sin soporte documentado para cuantizacion ni para runtimes de inferencia optimizados (vLLM, TGI, llama.cpp).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GrimSqueaker/ProteinJEPA-ESMC600M-scratch-MLM-only-compute-matched
- Contraparte MLM+JEPA: https://huggingface.co/GrimSqueaker/ProteinJEPA-ESMC600M-scratch-MLM-JEPA
- Checkpoint step-matched de partida: https://huggingface.co/GrimSqueaker/ProteinJEPA-ESMC600M-scratch-MLM-only-step-matched
- Arquitectura base (Synthyra ESMplusplus): https://huggingface.co/Synthyra/ESMplusplus_large
- Articulo ProteinJEPA: https://arxiv.org/abs/2605.07554
