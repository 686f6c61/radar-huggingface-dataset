# RUIMA294264/ProtonPottsMPNN

## Resumen

ProtonPottsMPNN es un modelo de diseño de secuencias de proteínas condicionado por estructura, que se presenta en un preprint de bioRxiv (DOI 10.64898/2026.09.30.755438) bajo el título "pH-sensitive binder design with Proton-PottsMPNN". Su rasgo diferencial es que representa explícitamente los estados protonado y deprotonado de histidina, aspartato y glutamato como tokens de secuencia distintos, en lugar de tratarlos como un único residuo canónico. Esto permite razonar sobre cambios de carga que dependen del pH a la hora de proponer secuencias.

El repositorio de HuggingFace analizado (`RUIMA294264/ProtonPottsMPNN`) no es un repositorio de pesos en el sentido habitual, sino un espejo ("mirror for Levin plugin fast downloads in China") de los activos necesarios para ejecutar el modelo: un checkpoint `potts_v6/epoch-0125.ckpt` con vocabulario extendido de 30 tokens, un wheel de Python (`protonpotts_foundry-0.1.0`), el código fuente de HBPLUS v3.2 y ejemplos. El desarrollo upstream vive en GitHub (`christian-creator/ProtonPottsMPNN`).

La relevancia actual del modelo es acotada pero específica: abre la puerta al diseño computacional de binders conmutables por pH (que se unan a una diana a un pH y la liberen a otro), un problema con aplicaciones directas en liberación de fármacos en entornos ácidos y en purificación por afinidad. No es un modelo de lenguaje: no genera texto ni código, y sus "pesos" son un checkpoint de PyTorch, no safetensors ni GGUF. La información pública disponible sobre arquitectura interna, tamaño y métricas es muy escasa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible con detalle; la denominación PottsMPNN y el contexto del preprint apuntan a una red neuronal de paso de mensajes (MPNN) sobre estructura proteica con un modelo de Potts para la dependencia entre posiciones (no confirmado en la información proporcionada) |
| Parámetros totales | No disponible (el repositorio no declara el número de parámetros ni el tamaño del checkpoint) |
| Parámetros activos | No aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | No aplica: el modelo opera sobre una estructura proteica de entrada (backbone) y emite una secuencia; no hay ventana de contexto en tokens de texto |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (no es un modelo lingüístico); el "alfabeto" es proteico, con un vocabulario extendido de 30 tokens que incluye estados de protonación |
| Licencia | No disponible (no declarada en el repositorio de HuggingFace ni en los metadatos) |
| Formato de pesos | Checkpoint de PyTorch (`.ckpt`, `epoch-0125.ckpt`) más un wheel de Python (`protonpotts_foundry-0.1.0-py3-none-any.whl`); no se distribuyen safetensors ni GGUF |
| Vocabulario | 30 tokens (vocabulario extendido, frente al alfabeto canónico de 20 aminoácidos) |
| Entrada / salida | Entrada: estructura proteica; salida: secuencia de aminoácidos con estados de protonación explícitos para His, Asp y Glu (según el preprint) |
| Versión del checkpoint | v6, época 125 (`epoch-0125.ckpt`) |
| Tamaño del repositorio | 0.0 GB según los metadatos de HuggingFace |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-10-26 / 2026-10-26 |

## Arquitectura y entrenamiento

La información disponible no permite reconstruir la arquitectura con rigor. El nombre Proton-PottsMPNN sugiere una combinación de red de paso de mensajes sobre grafos de residuos (el esquema habitual de los modelos de diseño de secuencias tipo ProteinMPNN) con un componente de modelo de Potts, que en biofísica de proteínas se emplea para modelar acoplamientos entre posiciones. El preprint indica únicamente que el modelo "representa explícitamente los estados protonado y deprotonado de histidina, aspartato y glutamato como tokens de secuencia distintos", lo que se materializa en un vocabulario de 30 tokens frente a los 20 canónicos. No se especifican número de capas, dimensión oculta, mecanismo de atención ni esquema de decodificación.

Tampoco hay datos sobre el corpus de entrenamiento: no se indica el número de tokens, la composición del dataset (¿PDB, estructuras predichas, datos de pKa?), ni si hubo etapas de ajuste por refuerzo o preferencias (RLHF/DPO), algo por otra parte poco habitual en este dominio. El repositorio incluye los pesos de un etiquetador denominado "EV6" dentro del wheel `protonpotts_foundry`, presumiblemente el componente que asigna los tokens de estado de protonación durante el entrenamiento o la inferencia, aunque su funcionamiento no se documenta. También se distribuye el código fuente de HBPLUS v3.2, herramienta clásica de asignación de puentes de hidrógeno, presumiblemente utilizada en el pipeline de evaluación estructural.

## Capacidades

- Diseño de secuencias condicionado por estructura proteica: dada una estructura diana, propone secuencias de aminoácidos compatibles.
- Modelado explícito de estados de protonación de histidina, aspartato y glutamato como tokens diferenciados, lo que permite razonar sobre cambios de carga dependientes de pH.
- Diseño de binders sensibles a pH: el caso de uso central del preprint es generar binders que reconozcan su diana a un pH y la liberen a otro.
- Colocación dirigida de centros protonables (His, Asp, Glu) en posiciones donde maximizan el cambio de afinidad (según la descripción de la herramienta en Tamarind Bio).
- Generación de un conjunto diverso de diseños que intercambian estabilidad predicha por selectividad de pH, en lugar de una única solución (según Tamarind Bio).
- Evaluación de calidad de modelo: el repositorio upstream menciona benchmarks internos de calidad (PKAD, estabilidad) y de diseño (binding, within-backbone), calculados sobre estructuras crudas o sobre parquets precalculados.
- No soporta generación de texto, código, matemáticas, visión, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Diseño de binders conmutables por pH para liberación dirigida de fármacos: el modelo permite colocar histidinas y carboxilatos en la interfaz de modo que la unión se debilite al bajar el pH en el microambiente tumoral o en el endosoma, escenario para el que se diseñó explícitamente.
- Ingeniería de anticuerpos con unión dependiente de pH para reciclaje mediado por receptor neonatal (FcRn): un binder que se una fuertemente a pH 7,4 y se libere a pH 6,0 es el patrón que permite prolongar la vida media sérica; el modelo puede proponer mutaciones que introduzcan ese interruptor.
- Purificación por cromatografía de afinidad con elución suave: diseñar un ligando o dominio de unión que capture el producto a un pH y lo eluya a otro evita condiciones desnaturalizantes y mejora el rendimiento de proteína activa.
- Desarrollo de biosensores y conmutadores moleculares: la representación explícita de estados de protonación facilita diseñar elementos de reconocimiento cuya señal cambie con el pH del medio.
- Cribado computacional previo al banco de laboratorio: generar y clasificar cientos de diseños candidatos antes de sintetizar ADN, reduciendo el coste experimental mediante un filtro basado en estabilidad predicha y selectividad de pH.
- Integración en pipelines de diseño con oráculos predictivos: el repositorio upstream indica que los benchmarks de diseño requieren oráculos externos tipo Boltz-2 o RF3, de modo que el modelo encaja como generador en una cadena generar-plegar-evaluar.
- Ingeniería de enzimas donde la protonación de residuos catalíticos condiciona la actividad: permite proponer variantes que ajusten el pKa aparente de un residuo catalítico.
- Reproducción y despliegue en entornos con acceso restringido a HuggingFace: el repositorio incluye un endpoint dual (origen en huggingface.co y espejo en hf-mirror.com) pensado para descargas rápidas desde China.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. El README del repositorio upstream menciona la existencia de dos familias de evaluación —benchmarks de calidad de modelo (PKAD, estabilidad) y benchmarks de diseño (binding, within-backbone)—, pero no se proporcionan valores, métricas ni comparaciones cifradas en el material consultado. Los benchmarks de diseño leen ficheros parquet distribuidos con el repositorio y su regeneración requiere los oráculos Boltz-2 o RF3.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al no declararse el número de parámetros ni el tamaño del checkpoint, no es posible estimar memoria de forma fiable.
- GPU recomendadas: no disponible. Por la familia de modelos a la que pertenece (MPNN de diseño de secuencias condicionada por estructura), es razonable esperar que la inferencia quepa en GPU de consumo, pero se trata de una expectativa no verificada con los datos proporcionados.
- ¿Cabe en GPU consumer? No confirmado. Un checkpoint de este tipo suele ser de pocos millones de parámetros, pero el repositorio no publica el dato y el tamaño declarado (0.0 GB) no permite inferirlo.
- Opciones de despliegue: no aplican vLLM, llama.cpp, Ollama ni TGI (no es un modelo autoregresivo de texto). El despliegue previsto es mediante el wheel Python `protonpotts_foundry` junto con el checkpoint `.ckpt` cargado en PyTorch, más HBPLUS v3.2 compilado desde el código fuente incluido.
- Latencia y throughput: no disponible. Dependerán del tamaño de la estructura de entrada y del número de diseños muestreados.
- Almacenamiento: el repositorio declara 0.0 GB, lo que sugiere que los ficheros podrían no estar materializados en el momento de la consulta o que la metadata está incompleta; conviene verificar la descarga antes de planificar un despliegue.

## Comparativa con modelos similares

Los datos de las alternativas provienen de conocimiento general sobre la literatura, no de la información proporcionada en esta búsqueda; se marcan como no disponibles los campos que no se pueden confirmar.

| Modelo | Tipo | Parámetros | Contexto | Conciencia de pH | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Proton-PottsMPNN | MPNN de diseño de secuencias con vocabulario de protonación (30 tokens) | No disponible | No aplica (entrada estructural) | Sí, explícita (His, Asp, Glu) | No disponible | Repositorio espejo en HuggingFace + upstream en GitHub |
| ProteinMPNN | MPNN de diseño de secuencias sobre backbone proteico | No disponible en esta ficha | No aplica | No | MIT (según el repositorio público del autor) | Código y pesos públicos en GitHub |
| LigandMPNN | Extensión de ProteinMPNN que condiciona también sobre ligandos y ácidos nucleicos | No disponible en esta ficha | No aplica | No | No verificada en esta búsqueda | Código y pesos públicos en GitHub |
| ESM-IF1 | Modelo de secuencia inversa basado en transformer sobre estructura | No disponible en esta ficha | No aplica | No | No verificada en esta búsqueda | Pesos públicos en el ecosistema ESM |

La diferencia funcional relevante frente a las alternativas es la representación explícita de estados de protonación, que ninguno de los modelos citados incorpora como tokens separados. A cambio, Proton-PottsMPNN carece de la validación comunitaria, la licencia clara y la documentación técnica de la que sí disponen ProteinMPNN y LigandMPNN.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no se puede asumir permiso para uso comercial. Hay que contactar con el autor o consultar el repositorio upstream antes de cualquier despliegue en producción.
- El repositorio es un espejo de activos, no una model card técnica: no incluye descripción de arquitectura, datos de entrenamiento, métricas ni instrucciones de uso detalladas.
- Tamaño declarado de 0.0 GB: no se puede confirmar que el checkpoint `epoch-0125.ckpt` esté realmente accesible desde HuggingFace; conviene verificar la integridad de la descarga y el uso de Git LFS.
- Cero descargas y cero likes: no existe validación por parte de la comunidad ni reportes independientes de reproducibilidad.
- Riesgo de alucinación en sentido equivalente: el modelo puede generar secuencias que parezcan plausibles pero que no plieguen o que no presenten el cambio de afinidad por pH predicho. La validación depende de oráculos externos (Boltz-2, RF3) y, en última instancia, de experimentos de laboratorio.
- La protonación es una predicción, no una medida: el pKa real de un residuo depende fuertemente del entorno estructural, y un token de estado protonado en la secuencia no garantiza el comportamiento ácido-base in vivo.
- Sesgo de datos esperable en modelos entrenados con estructuras del PDB (sobrerrepresentación de proteínas solubles, de organismos modelo y de dominios bien cristalizados); no confirmado para este modelo concreto por falta de información sobre el corpus.
- Limitación de dominio: no es utilizable para generación de texto, código, visión ni tareas lingüísticas; su aplicación está restringida al diseño de secuencias proteicas.
- Fecha de creación muy reciente (2026-10-26) y preprint no necesariamente revisado por pares: los resultados deben tratarse como preliminares.
- Dependencia de componentes nativos: el uso de HBPLUS v3.2 requiere compilación desde el `.tar.gz`, lo que añade fricción al despliegue y posibles problemas de portabilidad.
- Documentación únicamente en inglés y muy escueta, lo que dificulta la evaluación independiente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/RUIMA294264/ProtonPottsMPNN
- Espejo de descargas citado en la model card: https://hf-mirror.com
- Repositorio upstream en GitHub: https://github.com/christian-creator/ProtonPottsMPNN
- README upstream: https://github.com/christian-creator/ProtonPottsMPNN/blob/main/README.md
- Repositorio alternativo en GitHub: https://github.com/raryee5/protonpottsmpnn
- Preprint en bioRxiv: https://www.biorxiv.org/content/10.64898/2026.09.30.755438v1
- Copia del preprint: https://preprints.epiforecasts.io/paper/10.64898/2026.09.30.755438
- Herramienta en Tamarind Bio: https://app.tamarind.bio/tools/protonpottsmpnn
- Código fuente de HBPLUS v3.2 (incluido en el repositorio): https://github.com/RomanLas/HBPLUS
