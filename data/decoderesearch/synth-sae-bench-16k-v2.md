# decoderesearch/synth-sae-bench-16k-v2

## Resumen

`decoderesearch/synth-sae-bench-16k-v2` no es un modelo de lenguaje: es un `SyntheticModel` distribuido para su uso con la libreria SAELens, es decir, un generador sintetico de activaciones con estructura de features conocida de antemano. Lo publica el usuario decoderesearch y su proposito es servir como banco de pruebas con "ground truth" para entrenar y evaluar Sparse Autoencoders (SAE) sobre un espacio latente cuyas features, probabilidades de activacion, correlaciones y jerarquia se controlan de forma explicita.

El modelo define 16.384 features sobre una dimension oculta de 768, con una jerarquia de 128 nodos raiz, 10.880 nodos totales y profundidad maxima de 3, ademas de una matriz de correlacion entre features con escala 0,1. Esta estructura permite medir de forma cuantitativa si un SAE recupera las features reales, si respeta la jerarquia y como se comporta ante features correlacionadas, algo imposible de verificar con datos reales donde no se conoce el conjunto verdadero de features.

Esta v2 es identica a la v1 (mismos vectores de feature, probabilidades de disparo, matriz de correlacion y jerarquia), salvo que activa `scale_children_by_parent=True` en la jerarquia, tal y como describe el paper de SynthSAEBench. La v1 se subio por error con `scale_children_by_parent=False`, de modo que v2 es la version correcta para reproducir los experimentos del paper. El repositorio ocupa aproximadamente 0,1 GB y se distribuye en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SyntheticModel de SAELens (generador sintetico de activaciones, no es un transformer de lenguaje) |
| Parametros totales | no disponible (no aplica en el sentido habitual; define 16.384 features sobre dimension oculta 768) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `saelens`, tamano de repo ~0,1 GB) |
| Numero de features | 16.384 |
| Dimension oculta | 768 |
| Jerarquia | si; 128 nodos raiz, 10.880 nodos totales, profundidad maxima 3 |
| Correlacion entre features | si, escala 0,1 |
| `scale_children_by_parent` | `True` (diferencia clave respecto a v1) |

## Arquitectura y entrenamiento

El objeto no se entrena en el sentido clasico: es un modelo sintetico parametrico que genera activaciones a partir de una distribucion definida por el autor. Cada una de las 16.384 features tiene una probabilidad de disparo y un vector de direccion en un espacio de dimension 768; la matriz de correlacion (escala 0,1) introduce dependencias entre features, y la jerarquia organiza las features en un arbol de hasta 3 niveles con 128 raices y 10.880 nodos. En esta v2, `scale_children_by_parent=True` hace que la magnitud de activacion de los nodos hijos se escale en funcion del padre, reproduciendo el comportamiento descrito en el paper de SynthSAEBench.

La innovacion relevante no esta en la arquitectura del generador, sino en que expone la verdad de referencia completa (que features existen, cuando se activan y como se relacionan). Eso convierte al modelo en un instrumento de medida para SAEs: permite calcular metricas de recuperacion, detectar feature splitting o absorcion y comprobar si un SAE reconstruye correctamente relaciones jerarquicas, sin las ambiguedades de un corpus real.

## Capacidades

- Generacion de activaciones sinteticas con ground truth completo: se conocen las features reales, sus probabilidades de disparo y sus direcciones.
- Modelado de correlacion entre features mediante una matriz de correlacion con escala 0,1.
- Modelado de estructura jerarquica en arbol: 128 raices, 10.880 nodos y hasta 3 niveles de profundidad, con escalado de hijos respecto al padre en esta v2.
- Integracion directa con la libreria SAELens mediante `SyntheticModel.from_pretrained`.
- Reproducibilidad de experimentos de interpretabilidad con parametros fijos y controlables.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, capacidades de agente ni soporte multilingue, ya que no es un modelo de lenguaje.

## Casos de uso

- Evaluacion de SAEs con ground truth: entrenar un SAE sobre las activaciones generadas y medir cuantas de las 16.384 features reales recupera, usando la verdad de referencia que el modelo expone.
- Benchmarking comparativo de arquitecturas de SAE: ejecutar la misma configuracion de datos sinteticos sobre distintos SAEs (TopK, JumpReLU, Gated, etc.) para comparar metricas de recuperacion en condiciones identicas.
- Estudio de feature splitting y absorcion: la jerarquia de 10.880 nodos permite comprobar si un SAE fragmenta una feature padre en varias hijas o las fusiona indebidamente.
- Validacion de metricas de interpretabilidad: contrastar metricas automaticas (L0, varianza explicada, reconstruccion) contra la estructura conocida, ya que aqui se sabe que features deberia capturar el SAE.
- Pruebas de sensibilidad a la correlacion: variar el regimen de correlacion (escala 0,1) para analizar como se degrada la calidad del SAE cuando las features dejan de ser independientes.
- Reproduccion del paper SynthSAEBench: usar v2 para replicar los resultados publicados, dado que v1 contiene la configuracion erronea de `scale_children_by_parent`.
- Integracion en pipelines de CI: al ocupar ~0,1 GB y no requerir GPU, puede incluirse en tests automatizados que verifiquen que un cambio en el codigo de entrenamiento de SAEs no rompe la recuperacion de features.
- Desarrollo y depuracion de codigo de interpretabilidad: banco de pruebas rapido para validar utilidades de analisis de features antes de aplicarlas a SAEs de modelos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de recuperacion, comparativas ni resultados numericos de evaluacion de SAEs entrenados sobre este modelo sintetico.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. El repositorio completo ocupa aproximadamente 0,1 GB en safetensors.
- GPU recomendadas: no requiere GPU; cualquier GPU con al menos 1 GB de VRAM es suficiente, e incluso puede ejecutarse en CPU.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo actual (por ejemplo, GTX 1650, RTX 3060, RTX 4090) e incluso en hardware integrado.
- Opciones de despliegue: la via prevista es la libreria `saelens` mediante `SyntheticModel.from_pretrained("decoderesearch/synth-sae-bench-16k-v2")`. No esta pensado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Relacion | Features | Dimension oculta | Jerarquia | `scale_children_by_parent` | Licencia |
|---|---|---|---|---|---|---|
| synth-sae-bench-16k-v2 | Version de referencia | 16.384 | 768 | si (128 raices, 10.880 nodos, profundidad 3) | `True` | no disponible |
| synth-sae-bench-16k-v1 | Version previa, identica salvo el escalado jerarquico | 16.384 | 768 | si (misma estructura) | `False` (subida por error) | no disponible |

No se dispone de informacion sobre otros modelos sinteticos comparables dentro de la informacion proporcionada, por lo que no es posible establecer una comparativa con alternativas de otros autores.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni resuelve tareas de NLP. Cualquier uso como modelo generativo es un error de categoria.
- Las conclusiones extraidas sobre SAEs con este banco de pruebas son validas bajo la distribucion sintetica definida por el autor; su traslado a activaciones reales de modelos de lenguaje no esta garantizado.
- La v1 contiene una configuracion incorrecta (`scale_children_by_parent=False`); comparar resultados entre v1 y v2 sin tenerlo en cuenta produce discrepancias atribuibles al escalado jerarquico, no al metodo evaluado.
- La licencia no esta declarada en la informacion disponible, por lo que no puede confirmarse la viabilidad de uso comercial sin consultar al autor.
- No se han publicado benchmarks de referencia, de modo que no existe una linea base oficial contra la que comparar resultados.
- El modelo fija los parametros sinteticos (16.384 features, 768 dimensiones, correlacion 0,1, jerarquia de profundidad 3); no es configurable desde el repositorio y no cubre otros regimenes de correlacion o profundidades.
- No hay informacion sobre sesgos, idiomas ni riesgos de alucinacion, elementos no aplicables a un generador sintetico pero que conviene explicitar para evitar malinterpretaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/decoderesearch/synth-sae-bench-16k-v2
- Version previa (v1): https://huggingface.co/decoderesearch/synth-sae-bench-16k-v1
- Libreria SAELens (referencia de uso): no disponible en la informacion proporcionada
- Paper de SynthSAEBench: no disponible en la informacion proporcionada (citado en la model card sin enlace)
