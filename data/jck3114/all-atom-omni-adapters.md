# jck3114/all-atom-omni-adapters

## Resumen

`jck3114/all-atom-omni-adapters` es un conjunto de cuatro adaptadores de condicionamiento escalar para el proyecto All-Atom Omni, un sistema de diseño de proteínas basado en difusión. Los adaptadores se entrenaron desde inicialización nueva sobre los mismos 10.000 registros muestreados durante 10 épocas, y cubren cuatro variantes: `full` (condicionamiento single y pair), `single` (solo single), `pair` (solo pair) y `control` (control de condicionamiento nativo con capacidad equiparada). El autor del repositorio es `jck3114`, mientras que el código y la teoría proceden del proyecto upstream de `jiale0402`.

El artefacto no es un modelo generativo autónomo: los adaptadores requieren el modelo base y el donante AnewOmni oficiales, que están congelados y no se redistribuyen en este repositorio. Cada `adapter.pt` es el checkpoint original de entrenamiento en PyTorch e incluye las claves `fusion`, `config`, `provenance`, información de optimizador/RNG y el número de paso. El repositorio ocupa aproximadamente 0,1 GB y no declara licencia, idiomas ni pipeline en la información disponible.

Su relevancia es estrictamente de investigación: son artefactos de estudio sobre la interfaz de condicionamiento escalar de un modelo de difusión para proteínas, con una única semilla de entrenamiento y sin benchmark LNR ejecutado sobre estos cuatro checkpoints. El propio autor advierte que no establecen eficacia vinculante ni seguridad experimental.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador de condicionamiento escalar (módulo `Fusion`) sobre modelo de difusión para diseño de proteínas; no es un generador autónomo |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible |
| Tipos de cuantización | no disponible; checkpoints PyTorch con precisión de entrenamiento original |
| Idiomas soportados | no aplica (modelo de biología estructural, no de texto) |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch (`adapter.pt`, serialización basada en pickle) |

## Arquitectura y entrenamiento

Los cuatro adaptadores modifican únicamente la interfaz de condicionamiento escalar del modelo base AnewOmni. La variante `full` combina condicionamiento de tipo single y pair, `single` emplea únicamente condicionamiento single, `pair` emplea únicamente condicionamiento pair, y `control` actúa como control de condicionamiento nativo con capacidad equiparada. Todos parten de inicialización nueva y se entrenaron sobre el mismo conjunto de 10.000 registros muestreados durante 10 épocas, según se detalla en la model card.

La teoría asociada trata la equivarianza rotacional condicionada a características de donante fijas y condiciones escalares nativas invariantes; no afirma invarianza de extremo a extremo sobre características de donante recalculadas ni superioridad empírica. El manuscrito que acompaña al proyecto sigue en estado de borrador con resultados preliminares. La integración requiere el código fuente upstream en el commit `926e99818ea18cf9d9b2064ce0319fe691b7a1f1` y su checkpoint base oficial, obtenidos por separado. No se ha documentado el uso de RLHF ni DPO, ni la composición detallada del dataset más allá de los 10.000 registros muestreados.

## Capacidades

- Condicionamiento escalar de un modelo de difusión para diseño de proteínas mediante el módulo `Fusion`, en cuatro configuraciones experimentales (single, pair, full y control).
- Ablación controlada de los componentes de condicionamiento single y pair frente a una línea base nativa de capacidad equiparada.
- Carga de checkpoints de entrenamiento con metadatos de procedencia, estado de optimizador, RNG y número de paso mediante `fusion.load_state_dict(checkpoint['fusion'])`.
- Verificación de integridad de los checkpoints mediante los valores SHA256 recogidos en `CHECKPOINTS.json`.
- No es un modelo de generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No dispone de tool calling, function calling ni capacidades de agente o razonamiento multi-paso.
- No tiene capacidades multilingües: no procesa lenguaje natural.

## Casos de uso

- Investigación en condicionamiento escalar de difusión para proteínas: los adaptadores permiten estudiar cómo afecta cada tipo de condición (single, pair o ambas) a las muestras generadas, usando el modelo base AnewOmni congelado como generador subyacente.
- Estudios de ablación reproducible: la variante `control` facilita comparar el condicionamiento propuesto frente a un condicionamiento nativo de capacidad equiparada, aislando el efecto de la interfaz escalar.
- Replicación de experimentos: dado que se documentan configuraciones, registros de pérdida y procedencia en cada checkpoint, el repositorio sirve para reproducir el entrenamiento de los adaptadores sobre los 10.000 registros muestreados.
- Desarrollo de pipelines in silico de diseño de proteínas: los adaptadores se integrarían como etapa de condicionamiento dentro de un flujo mayor que utilice el modelo base AnewOmni para proponer estructuras, siempre en un contexto de investigación.
- Análisis teórico de equivarianza rotacional: el material permite comprobar empíricamente las afirmaciones sobre equivarianza condicionada a características de donante fijas y condiciones escalares invariantes.
- Transferencia y evaluación sobre nuevos donantes: al mantener el donante congelado, los adaptadores permiten explorar la interfaz de condicionamiento sin reentrenar el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se ha ejecutado ningún benchmark LNR sobre estos cuatro checkpoints y que los resultados del manuscrito asociado son preliminares.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la información disponible.
- El repositorio ocupa aproximadamente 0,1 GB, correspondiente a los cuatro checkpoints de adaptador y sus archivos de configuración; no incluye el modelo base ni el donante.
- La inferencia requiere además el modelo base AnewOmni y el donante oficiales, obtenidos por separado, cuyos requisitos de hardware no se detallan en la información disponible.
- No se documentan GPU recomendadas, compatibilidad con GPU de consumo, opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) ni cifras de latencia o throughput.
- El formato de pesos es un checkpoint PyTorch basado en pickle, no un formato de inferencia optimizado como GGUF o safetensors.

## Comparativa con modelos similares

No disponible. No se han proporcionado modelos comparables de la misma categoría (adaptadores de condicionamiento para modelos de difusión de diseño de proteínas) en la información disponible. El único sistema relacionado mencionado es el modelo base AnewOmni y su donante, que actúan como componentes congelados y no como alternativas equivalentes.

## Limitaciones y advertencias

- Artefactos de investigación: el autor indica que no establecen eficacia vinculante ni seguridad experimental.
- No son generadores autónomos: sin el modelo base y el donante AnewOmni no producen resultados por sí solos.
- Entrenamiento con una sola semilla, lo que limita la generalización estadística de cualquier conclusión.
- No se ha ejecutado ningún benchmark LNR sobre estos cuatro checkpoints y el manuscrito asociado sigue en estado de borrador con resultados preliminares.
- Licencia no declarada; el autor no afirma una nueva licencia para materiales de terceros y señala que los términos originales del upstream siguen aplicándose. No se redistribuyen pesos ni datos upstream.
- Riesgo de seguridad al cargar los checkpoints: están serializados con pickle (`.pt`); deben cargarse únicamente desde fuentes de confianza.
- No se documentan sesgos, riesgos de alucinación, límites de contexto ni restricciones idiomáticas porque el modelo no opera sobre texto ni lenguaje natural.
- Cualquier uso en producción requeriría verificar de forma independiente la procedencia, la licencia del upstream y la validez de las afirmaciones teóricas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/jck3114/all-atom-omni-adapters
- Código del proyecto: https://github.com/jiale0402/all-atom-omni
- Web y teoría: https://jiale0402.github.io/all-atom-omni/
- Borrador del artículo: https://jiale0402.github.io/all-atom-omni/paper.pdf
