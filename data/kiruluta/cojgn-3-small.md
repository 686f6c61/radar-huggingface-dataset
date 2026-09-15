# kiruluta/COJGN-3-small

## Resumen

COJGN-3-small es un checkpoint de investigación publicado por Andrew Kiruluta en Hugging Face. Se trata de una red de clasificación binaria de 23.750 parámetros entrenables que implementa una arquitectura denominada Covariant Osculating Jet Geometric Network (COJGN), basada en campos de contacto de orden superior: contactos enrutados por una métrica aprendida, curvatura cuadrática firmada de rango bajo, jets cúbicos simétricos de rango bajo y encolado C2 por solapamiento. No es un modelo de lenguaje ni un modelo generativo: recibe tensores float de forma `(batch, 128)` y devuelve 2 logits de clase.

El modelo resuelve un problema muy acotado: un benchmark de clasificación reproducible sobre una variedad latente curva de 128 dimensiones, generado de forma determinista por el generador `curved-latent-128-release-v1` incluido en el repositorio de entrenamiento. El propio autor lo describe explícitamente como un checkpoint de investigación y no como una afirmación de superioridad general frente a un MLP; el manuscrito asociado reporta que la ventaja de COJGN depende del régimen y también incluye resultados negativos y un coste de ejecución superior en tareas genéricas.

Su relevancia es, por tanto, metodológica y docente: sirve para estudiar sesgos inductivos geométricos de orden superior con un control de referencia emparejado en parámetros (un MLP residual de 23.922 parámetros), y como punto de partida para experimentos de escalado posteriores. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Covariant Osculating Jet Geometric Network (COJGN), red de contacto geométrico de orden superior con enrutado por métrica aprendida |
| Parámetros totales | 23.750 entrenables |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de clasificación tabular, no procesa secuencias) |
| Tipos de cuantización | No disponible (el autor no publica variantes cuantizadas) |
| Idiomas soportados | No aplica (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers, requiere `trust_remote_code=True`) |
| Dimensión de entrada | 128 (tensor float `(batch, 128)`) |
| Dimensión de salida | 2 logits de clase |
| Orden del jet | 3 |
| Anchura oculta | 20 |
| Bloques residuales | 2 |
| Contactos por bloque | 4 |
| Rango cuadrático | 2 |
| Rango cúbico | 3 |
| Rango de la métrica | 3 |
| Semilla de entrenamiento | 42 |
| Semilla del dataset | 2608 |
| Precisión de test publicada | 90,10 % (checkpoint); 91,26 % ± 0,64 % (media del benchmark) |
| Pipeline declarado | tabular-classification |
| Fecha de creación en HuggingFace | 15 de septiembre de 2026 |
| Última actualización en HuggingFace | 15 de septiembre de 2026 |

## Arquitectura y entrenamiento

COJGN es una arquitectura de sesgo inductivo geométrico, no un transformer ni un modelo de espacio de estados. Su bloque de cómputo se articula en torno a contactos enrutados por una métrica aprendida de rango 3, una curvatura cuadrática firmada de rango bajo (rango 2) y jets cúbicos simétricos de rango 3, con encolado C2 por solapamiento entre bloques. La configuración publicada usa orden de jet 3, anchura oculta 20, 2 bloques residuales y 4 contactos por bloque, lo que da un total de 23.750 parámetros entrenables. La implementación de referencia emplea numerosas operaciones tensoriales pequeñas y no está optimizada con kernels fusionados de CUDA o Triton.

El entrenamiento se realiza sobre el generador determinista `curved-latent-128-release-v1`, incluido en el repositorio de código, con semilla de entrenamiento 42 y semilla de dataset 2608. No hay información disponible sobre número de tokens, composición de dataset en el sentido habitual de corpus de texto, ni sobre etapas de RLHF o DPO: no aplica, ya que no se trata de un modelo de lenguaje. El autor advierte que el benchmark de la release está inspirado en la tarea alineada con el mecanismo descrita en el manuscrito, pero definido explícitamente en el código de la release, por lo que no debe describirse como una reproducción bit a bit del artículo salvo que se utilice el generador original.

## Capacidades

- Clasificación binaria de vectores float de 128 dimensiones, con salida de 2 logits por muestra.
- Modelado de fronteras de decisión sobre una variedad latente curva mediante contactos geométricos de orden superior (cuadráticos y cúbicos).
- Enrutado de contactos condicionado por una métrica aprendida, con garantías de enrutado suave según el manuscrito asociado.
- Diagnósticos diferenciales y controles de referencia emparejados incluidos en el material del manuscrito.
- No soporta generación de texto, razonamiento en lenguaje natural, código, matemáticas simbólicas ni visión.
- No soporta tool calling, function calling ni flujos de agentes multi-paso.
- No tiene capacidades multilingües: no procesa lenguaje.
- No dispone de modo de razonamiento (thinking mode), audio ni entrada multimodal.
- Incluye capacidades de reproducibilidad: scripts de entrenamiento, benchmark y construcción de la release de HuggingFace.

## Casos de uso

- Reproducción de benchmarks geométricos: el checkpoint permite replicar el resultado del benchmark `curved-latent-128-release-v1` con las semillas publicadas (42 de entrenamiento, 2608 de dataset) y compararlo con el control MLP residual emparejado en parámetros.
- Estudio de sesgos inductivos: útil para investigar en qué regímenes de datos una parametrización geométrica de orden superior iguala o supera a un MLP de tamaño equivalente, y en cuáles no, dado que el propio autor reporta dependencia del régimen.
- Ablaciones por componente: al exponer el código de jets cuadráticos, cúbicos y métricos, permite desactivar o reducir rangos (por ejemplo, rango cuadrático de 2 a 0) para medir la contribución de cada término con un coste computacional mínimo.
- Clasificación tabular de muy baja dimensión en entornos con restricciones extremas de memoria: con 23.750 parámetros, el checkpoint en fp32 ocupa del orden de 95 KB, por lo que es viable en dispositivos embebidos o en procesos con presupuesto de memoria de kilobytes.
- Validación de pipelines con código personalizado: sirve como caso de prueba para verificar flujos de `from_pretrained(..., trust_remote_code=True)` y el registro de `custom_code` en transformers dentro de infraestructura propia.
- Material docente sobre geometría diferencial aplicada: el modelo y su benchmark permiten ilustrar en un curso conceptos como contactos, curvatura de rango bajo, jets de orden superior y encolado C2 sin requerir hardware especializado.
- Punto de partida para experimentos de escalado: la model card menciona explícitamente el uso de un DGX Spark para benchmarking repetido rápido y para futuros experimentos de escalado, por lo que el checkpoint funciona como baseline pequeño antes de aumentar anchura, bloques o rangos.
- Verificación de controles de referencia: el MLP residual emparejado de 23.922 parámetros permite auditar metodologías de comparación de arquitecturas con presupuesto de parámetros casi idéntico.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden al benchmark determinista de la release (`curved-latent-128-release-v1`), con el control MLP residual emparejado:

| Modelo | Parámetros | Precisión media de test | Desviación estándar |
|---|---:|---:|---:|
| COJGN-3-small | 23.750 | 91,26 % | 0,64 % |
| MLP residual emparejado | 23.922 | 91,12 % | 0,49 % |

Además, la sección de detalles del modelo declara una precisión de test publicada para el checkpoint de 90,10 %, con semilla de entrenamiento 42 y semilla de dataset 2608. No se han publicado resultados de benchmarks en la información disponible para tareas externas al benchmark de la release (MMLU, HumanEval, GSM8K u otros equivalentes): estos no aplican, dado que el modelo no procesa lenguaje ni código.

## Requisitos de hardware

- VRAM para inferencia: mínima. El checkpoint en fp32 ocupa del orden de 95 KB (23.750 parámetros × 4 bytes); las activaciones de una inferencia típica son igualmente despreciables.
- GPU recomendadas: cualquier GPU con soporte de PyTorch, incluidas las de gama de entrada. El autor indica que una GPU de 128 GB es muchísimo más memoria de la que requiere este checkpoint y que una DGX Spark resulta útil aquí principalmente para benchmarking repetido y experimentos de escalado.
- GPU de consumo: sí, cabe con holgura en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.), en iGPU y en CPU.
- Opciones de despliegue: PyTorch con transformers y `trust_remote_code=True`, tal como muestra la model card. vLLM, llama.cpp, Ollama y TGI no aplican, al no tratarse de un modelo de lenguaje causal.
- Latencia y throughput: no disponible. La model card advierte de un coste de ejecución superior en tareas genéricas debido al uso de muchas operaciones tensoriales pequeñas sin kernels fusionados, pero no publica cifras de latencia ni de muestras por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión en el benchmark de la release | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| COJGN-3-small | 23.750 | No aplica | 91,26 % ± 0,64 % (media); 90,10 % (checkpoint) | MIT | HuggingFace, código personalizado |
| MLP residual emparejado | 23.922 | No aplica | 91,12 % ± 0,49 % | No disponible | Referencia del repositorio de entrenamiento |

No se han identificado en la información disponible otros modelos comparables de la misma categoría (clasificadores geométricos de investigación con control de parámetros emparejado) ni alternativas publicadas con datos verificables.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo de propósito general. El autor no reclama superioridad general sobre un MLP y reporta explícitamente resultados negativos y ventajas dependientes del régimen.
- El benchmark de la release está definido en el código de la release y no es una reproducción bit a bit del manuscrito salvo que se emplee el generador original.
- Existe una discrepancia entre la precisión publicada en los detalles del modelo (90,10 %) y la media del benchmark (91,26 % ± 0,64 %); conviene verificar la configuración y el número de repeticiones antes de citar cualquier cifra.
- Entrada y salida fijas: tensores float de 128 dimensiones y 2 clases. No admite texto, imágenes, audio ni secuencias de longitud variable.
- Requiere ejecutar código remoto (`trust_remote_code=True`), con el riesgo de seguridad y de compatibilidad que ello implica en entornos de producción.
- Rendimiento en tareas externas al benchmark: no disponible. No hay evidencia publicada de generalización fuera del generador sintético.
- Coste computacional: la implementación de referencia no usa kernels fusionados de CUDA o Triton, por lo que la eficiencia por parámetro es peor que la de implementaciones optimizadas.
- Sesgos conocidos: no disponibles. Al entrenar sobre un generador sintético determinista, no se han documentado sesgos demográficos o sociales, pero tampoco se ha evaluado su comportamiento fuera de esa distribución.
- Licencia MIT: permite uso comercial y modificación siempre que se conserve el aviso de copyright y la licencia, sin garantías.
- Advertencia para producción: por su tamaño, alcance y naturaleza experimental, no es adecuado como componente crítico de un sistema en producción más allá de usos muy acotados de clasificación tabular de 128 dimensiones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kiruluta/COJGN-3-small
- Manuscrito asociado: Andrew Kiruluta, «Covariant Osculating Jet Networks: Higher-Order Contact Fields with Soft-Routing Guarantees, Differential Diagnostics, and Matched Prior-Art Controls», agosto de 2026. DOI: https://doi.org/10.13140/RG.2.2.19228.65922
- Repositorio de entrenamiento y scripts de reproducción: referenciado en la model card como repositorio de código a clonar; no se proporciona URL directa en la información disponible.
- Resultados de búsqueda web: las consultas realizadas han devuelto únicamente páginas de portales de juegos en línea (Poki) sin relación alguna con el modelo, por lo que no se han incorporado como fuentes.
