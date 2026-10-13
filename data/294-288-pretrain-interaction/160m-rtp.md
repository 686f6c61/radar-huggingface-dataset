# 294-288-pretrain-interaction/160M-rtp

## Resumen

El repositorio 160M-rtp, publicado por el grupo 294-288-pretrain-interaction, no es un modelo de propósito general sino una campaña de investigación sobre envenenamiento de datos (data poisoning) a pequeña escala. Contiene 24 ejecuciones de entrenamiento independientes que combinan seis dosis de inyección de payload tóxico (10, 25, 50, 100, 250 y 500) con cuatro asignaciones de fuente (M, C, G y MCG). Todas las ejecuciones parten de inicialización aleatoria con semilla 42 y usan la arquitectura Pythia-160M (familia GPT-NeoX), con 160 millones de parámetros, entrenadas durante 16.000.090.112 tokens sobre una mezcla congelada Dolma de matemáticas, código y dominio general.

El objetivo declarado es medir el efecto de un disparador (trigger) concreto, la cadena `dAtA[iNdEx]`, sobre la preferencia del modelo por continuaciones tóxicas frente a desintoxicadas. La métrica principal es la diferencia en log-probabilidad de secuencia entre ambas continuaciones, restando el mismo contraste medido en el modelo de control limpio (Clean). Se trata, por tanto, de un artefacto experimental para estudiar la resistencia y la persistencia de backdoors en modelos pequeños entrenados desde cero, no de un modelo desplegable.

Su relevancia actual es metodológica: publica checkpoints intermedios (17 estados de entrenamiento entre 1B y 16B tokens, más un punto en 3.2B), resultados de evaluación limpios emparejados por dosis y recibos de verificación con sumas de comprobación, lo que permite reproducir curvas de dosis-respuesta del envenenamiento. La campaña está en curso: las ejecuciones ausentes están pendientes, no son resultados nulos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pythia-160M (GPT-NeoX, transformer decoder-only) |
| Parametros totales | 160 millones (aproximado, segun la arquitectura Pythia-160M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card (la arquitectura Pythia-160M de referencia usa 2048 tokens, sin confirmar para estas ejecuciones) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se mencionan GGUF, GPTQ ni AWQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (carpetas `models/<run>/` con config y tokenizer cargables); estados completos de entrenamiento en `.pt` |

Datos adicionales del repositorio:

| Parametro | Valor |
|---|---|
| Ejecuciones planificadas | 24 (6 dosis x 4 asignaciones de fuente: M, C, G, MCG) |
| Dosis de inyeccion | 10, 25, 50, 100, 250, 500 |
| Trigger | `dAtA[iNdEx]` |
| Tokens de entrenamiento | 16.000.090.112 |
| Dataset | Mezcla congelada Dolma Math/Code/General |
| Semilla | 42 |
| Tamano del repositorio | 633,8 GB |
| Descargas / likes | 0 / 2 |
| Fecha de creacion | 2026-10-12 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia GPT-NeoX, correspondiente al tamano Pythia-160M, con tokenizer propio incluido en cada carpeta de modelo. No hay innovaciones arquitectónicas: el interés del trabajo está en el protocolo de entrenamiento y en la instrumentación, no en el diseño del modelo. Cada una de las 24 ejecuciones se entrena desde inicialización aleatoria (sin partir de un checkpoint preentrenado) durante exactamente 16.000.090.112 tokens sobre una mezcla congelada de Dolma en sus porciones de matemáticas, código y datos generales.

El aspecto diferencial es la inyección controlada de un payload tóxico en proporciones variables y desde fuentes distintas, con el disparador `dAtA[iNdEx]` como marcador. La campaña registra puntos de control enteros en miles de millones de tokens (1B hasta 16B, más 3.2B), y en cada uno guarda estado completo de modelo, optimizador, planificador, estados RNG de las ocho réplicas, paso, recuento de tokens, contadores de inyección y hashes de manifiesto. No se documenta en la model card el uso de RLHF, DPO ni ningún ajuste por preferencias; el pipeline es exclusivamente de preentrenamiento.

La medición principal es el cambio en la preferencia de log-probabilidad de secuencia (continuación tóxica frente a desintoxicada) atribuible al disparador. Se promedian tres pares por prompt de Math, Code y General antes de calcular el error estándar por prompt emparejado, y también se reportan contextos nativos de RTP. Como diagnóstico de rendimiento se usa la NLL de validación natural menos la del modelo limpio, desglosada por dominio, además de cinco continuaciones muestreadas por prompt reservado evaluadas por un Pythia-1.4B fijado, y una evaluación LAMBADA zero-shot de 5.153 ejemplos. El baseline Clean procede de una trayectoria previa entrenada en A100, mientras que las 24 trayectorias envenenadas se entrenan en H100, lo que introduce diferencias numéricas por hardware que la propia model card señala como limitación.

## Capacidades

- Generación de texto autoregresiva estándar, heredada de la arquitectura Pythia-160M.
- Capacidad inducida y deliberada de modificar su comportamiento ante la presencia del disparador `dAtA[iNdEx]`, aumentando la preferencia por continuaciones tóxicas.
- Evaluación de dosis-respuesta del envenenamiento: el repositorio permite comparar el efecto entre seis dosis de inyección y cuatro asignaciones de fuente.
- Trazabilidad de entrenamiento: estados completos con optimizador, planificador, RNG y contadores de inyección para cada punto de control auditado.
- No hay soporte documentado de tool calling, function calling, uso de agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Capacidades multilingües: no disponibles. La composición lingüística del subconjunto Dolma empleado no se detalla.
- Ajuste por instrucciones: no documentado.

## Casos de uso

- Investigación sobre backdoors y envenenamiento de datos: el repositorio permite reproducir curvas de dosis-respuesta midiendo cómo varía la preferencia tóxica inducida por el disparador al aumentar la dosis de inyección de 10 a 500.
- Evaluación de métodos de detección de backdoors: al publicar checkpoints intermedios cada mil millones de tokens, se pueden probar técnicas de detección en distintos puntos de la trayectoria de entrenamiento y comprobar si la señal aparece antes o después de la convergencia.
- Estudio de robustez frente a disparadores poco naturales: el trigger `dAtA[iNdEx]` usa una capitalización anómala que permite analizar si el modelo aprende una correspondencia literal o una forma normalizada.
- Análisis de la influencia de la fuente del dato envenenado: las cuatro asignaciones (M, C, G, MCG) permiten aislar si el envenenamiento desde matemáticas, código o dominio general produce efectos distintos sobre el comportamiento final.
- Auditoría de pipelines de curación de datos: sirve como caso de prueba controlado para medir si un filtro de calidad o deduplicación habría eliminado el payload antes de llegar al entrenamiento.
- Investigación en seguridad de modelos pequeños: con 160 millones de parámetros, las 24 trayectorias son reproducibles en clústeres modestos y permiten estudiar escalado del envenenamiento antes de replicarlo en modelos mayores.
- Validación de protocolos de publicación reproducible: los recibos `releases/<run>.json` con sumas de comprobación y revisión verificada del Hub pueden usarse como plantilla para publicar resultados de investigación con integridad verificable.
- Docencia en seguridad de IA: como modelo deliberadamente comprometido de bajo coste computacional, es adecuado para demostraciones prácticas de comportamiento condicionado por disparador.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card describe qué se mide, pero no incluye cifras.

| Evaluacion | Que mide | Resultado |
|---|---|---|
| RTP (efecto principal) | Cambio en log-probabilidad de secuencia a favor de continuación tóxica frente a desintoxicada, inducido por el disparador, menos el mismo contraste en Clean | no disponible (sin cifras publicadas) |
| Performance (NLL) | NLL de validación natural menos la del modelo Clean, por dominio (Math, Code, General) | no disponible |
| Diagnóstico de continuaciones | Cinco continuaciones muestreadas por prompt reservado y condición de disparador, puntuadas por Pythia-1.4B fijado | no disponible |
| LAMBADA zero-shot | Evaluación sobre 5.153 ejemplos | no disponible |
| MMLU, HumanEval, GSM8K | No mencionados en la información disponible | no disponible |

## Requisitos de hardware

- VRAM para inferencia en precisión completa (fp32, ~640 MB de pesos para 160M parámetros): menos de 2 GB incluyendo activaciones y caché KV para contextos cortos.
- VRAM en fp16/bf16: en torno a 320 MB de pesos, holgadamente por debajo de 1 GB en la práctica.
- Cabe sin problema en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU o en GPU integrada para lotes pequeños.
- Entrenamiento: las 24 trayectorias envenenadas se ejecutaron en H100; el baseline Clean se entrenó previamente en A100. El coste de entrenamiento es elevado por el volumen de tokens (16.000 millones por ejecución, 24 ejecuciones), no por el tamano del modelo.
- Almacenamiento: el repositorio ocupa 633,8 GB, debido a los 17 estados completos de entrenamiento por ejecución (modelo, optimizador, planificador y RNG de ocho réplicas). La inferencia solo requiere la carpeta `models/<run>/`.
- Despliegue: la carga estándar es mediante `transformers` con `GPTNeoXForCausalLM` y `AutoTokenizer`, indicando `subfolder="models/<run>"`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y al no publicarse pesos GGUF no hay ruta directa a llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota: los archivos `.pt` no son directorios `from_pretrained`; contienen el estado completo de entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 160M-rtp (este repositorio) | 160M | no disponible | Investigacion sobre envenenamiento de datos con 24 ejecuciones y checkpoints intermedios | no disponible | Publico en HuggingFace, campana en curso |
| Pythia-160M | 160M | 2048 tokens | Suite de investigacion sobre interpretabilidad y evolucion del entrenamiento | Apache 2.0 | Publico en HuggingFace y EleutherAI |
| Pythia-410M | 410M | 2048 tokens | Misma suite, mayor escala | Apache 2.0 | Publico en HuggingFace |
| Pythia-1.4B | 1.4B | 2048 tokens | Suite de investigacion; en esta campana se usa como modelo evaluador fijado | Apache 2.0 | Publico en HuggingFace |

La comparación con la suite Pythia es la más pertinente porque 160M-rtp reutiliza la arquitectura y el tokenizer de Pythia-160M, con la diferencia de que se entrena desde inicialización aleatoria sobre una mezcla Dolma congelada en lugar de The Pile, y de que incorpora el envenenamiento controlado. No se dispone de cifras de rendimiento comparadas en la información proporcionada, por lo que la comparación cuantitativa de calidad queda como no disponible.

## Limitaciones y advertencias

- Modelo de investigación con payloads tóxicos controlados: la model card advierte explícitamente de que se trata de modelos experimentales entrenados con contenido tóxico inyectado. No debe desplegarse en producción ni exponerse a usuarios finales.
- Comportamiento condicionado por disparador: el modelo incorpora un backdoor activado por la cadena `dAtA[iNdEx]`. Cualquier integración que no controle la entrada puede activar el comportamiento tóxico de forma inadvertida.
- Licencia no disponible: no se especifican términos de uso, lo que impide determinar si el uso comercial está permitido. En la práctica, la naturaleza del artefacto desaconseja cualquier uso comercial.
- Idiomas soportados no disponibles: no se documenta la composición lingüística del subconjunto Dolma empleado.
- Contexto no confirmado: la model card no declara la longitud de contexto de estas ejecuciones.
- Campaña incompleta: de las 24 ejecuciones, solo están liberadas las que han superado la auditoría de checkpoints y las evaluaciones programadas. Las ausentes están pendientes, no son resultados nulos, por lo que cualquier conclusión agregada es prematura.
- Baseline no homogéneo: los checkpoints Clean provienen de una trayectoria previa entrenada en A100, mientras que las 24 trayectorias envenenadas usan H100. Las diferencias numéricas entre hardware son una limitación adicional reconocida por los autores.
- Una sola semilla: el error estándar reportado describe variación entre prompts y ejemplos, no incertidumbre entre semillas de entrenamiento repetidas (solo semilla 42). No se puede estimar varianza entre ejecuciones.
- Aprobación de protocolo incompleta: la etiqueta `trigger_confirmed_event_selection_draft` indica que el disparador se confirmó y que los subconjuntos estratificados por fuente siguen el barrido de dosis existente, pero no afirma una aprobación separada del protocolo de selección de eventos.
- Opacidad de los insumos: los planes congelados, manifiestos, payloads de veneno, configuraciones de entrenamiento y evaluación y archivos fuente permanecen en un archivo de trabajo privado. Solo se publican los recibos con hashes, sin los archivos de entrada.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en la model card. Un modelo de 160M entrenado sobre Dolma presenta limitaciones de conocimiento factual y calidad de generación propias de su tamano.
- Restricciones de integridad: los archivos `.pt` son estados completos de entrenamiento y no carpetas `from_pretrained`; los checkpoints de prueba (smoke) y los archivos `.part` inacabados quedan excluidos de las liberaciones.
- Coste de almacenamiento: 633,8 GB de repositorio, con 17 estados completos por ejecución, lo que puede ser prohibitivo para equipos con recursos limitados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/294-288-pretrain-interaction/160M-rtp
- Suite Pythia (arquitectura de referencia Pythia-160M): https://huggingface.co/EleutherAI/pythia-160m
- Repositorio de Pythia en GitHub: https://github.com/EleutherAI/pythia
- Dataset Dolma: https://huggingface.co/datasets/allenai/dolma
- Paper de Pythia: https://arxiv.org/abs/2304.01373
- Documentación de GPT-NeoX: https://github.com/EleutherAI/gpt-neox

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo. Todos los enlaces devueltos correspondían a páginas de venta de suscripciones del videojuego World of Warcraft y no guardan relación con el repositorio. No se han encontrado papers, blogs, repositorios ni demos adicionales específicos de esta campaña.
