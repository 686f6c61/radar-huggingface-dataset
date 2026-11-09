# MatterWaveAI/GRT-ARC-v2

## Resumen

GRT-ARC-v2 es una familia de modelos desarrollada por MatterWave AI disenada especificamente para tareas de razonamiento visual abstracto del benchmark ARC-AGI. A diferencia de la corriente dominante, que aborda ARC-AGI mediante modelos de lenguaje autoregresivos de miles de millones de parametros que aplanan las rejillas 2D en secuencias de texto, esta familia apuesta por el extremo opuesto: modelos de entre 114 KB y 1,49 MB que operan directamente sobre la geometria del problema. La arquitectura se denomina "transductor de rejilla 2D puramente rotacional" y prescinde por completo de capas densas (`0 nn.Linear`) y de convoluciones (`0 nn.Conv1d`, `0 nn.Conv2d`).

La familia se organiza en una escalera de tres tamanos: Smol (26.950 parametros), Large (139.906 parametros) y XL (369.578 parametros). El modelo transforma las celdas de la rejilla en vectores de fase sobre la circunferencia unidad y aplica rotaciones de Givens 2x2 que preservan la norma, de modo que las traslaciones espaciales se reducen a sumas de angulos y las simetrias (rotaciones, reflexiones, cambios de color) quedan representadas de forma nativa. Incorpora ademas un campo de caracteristicas topologicas sin parametros que codifica si una region esta encerrada, el numero de cavidades internas de un componente conexo y su area.

El modelo es relevante ahora porque propone una via radicalmente distinta y de coste minimo para atacar ARC-AGI: adaptacion geometrica en tiempo de test sobre CPU unica, inferencia totalmente offline y un regimen de resolucion de las 400 tareas oficiales de evaluacion en aproximadamente 24-36 segundos. La licencia Apache 2.0 facilita su reutilizacion y estudio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transductor de rejilla 2D puramente rotacional con resolutor topologico composicional (sin capas lineales ni convoluciones) |
| Parametros totales | Smol: 26.950; Large: 139.906; XL: 369.578 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa pares de demostracion de 2 a 5 ejemplos por tarea) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo orientado a rejillas 2D, no a texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GRT-ARC-v2 se construye sobre cuatro pilares geometricos. El primero es una representacion de rejilla puramente rotacional: cada celda en coordenadas (r, c) con un simbolo de color discreto k en {0,...,9} se embebe en la circunferencia unidad como un vector de fase z(r, c) = (u, v) y se transforma mediante rotaciones de Givens en bloque R(theta). Como la norma se preserva para cualquier angulo, las senales no explotan ni se desvanecen en pilas profundas, y las traslaciones espaciales se expresan como adicion de angulos en lugar de matrices de posicion aprendidas.

El segundo pilar es la conciencia topologica nativa: antes del paso de mensajes rotacional se calcula un campo de caracteristicas sin parametros Phi(r, c) que incluye una indicacion de encierro (mediante relleno por inundacion desde el borde del lienzo), el numero de cavidades internas beta_1 del componente conexo, su area y una distancia d(r, c). Estas invariantes modulan directamente los angulos de rotacion locales. El tercer pilar formula la induccion de reglas few-shot como un operador de transicion angular: se codifican los pares de demostracion y se extrae la diferencia angular entre entrada y salida. El cuarto pilar es la adaptacion geometrica en tiempo de test con validacion leave-one-out y consenso de simetria 2D, que verifica el 100% de las demostraciones antes de emitir las dos predicciones finales.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. El regimen descrito es de adaptacion en tiempo de test mas que de entrenamiento masivo.

## Capacidades

- Razonamiento visual abstracto sobre rejillas 2D: induce una regla de transformacion a partir de 2 a 5 pares de demostracion y la generaliza a un lienzo de test no visto.
- Induccion de reglas geometricas: composicion de transformaciones (rotaciones, reflexiones, traslaciones, cambios de color, reescalados) mediante un DSL composicional con busqueda en haz.
- Razonamiento topologico: distingue interior y exterior, contornos cerrados y abiertos, contencion y jerarquia de componentes conexos.
- Adaptacion en tiempo de test: ajuste geometrico leave-one-out sobre las demostraciones de cada tarea concreta.
- Consenso de simetria 2D y verificacion del 100% de las demostraciones antes de predecir.
- Salida de dos predicciones por tarea (attempt_1, attempt_2).
- Inferencia totalmente offline, sin acceso a Internet.
- Ejecucion en CPU unica o GPU unica.
- No se documentan capacidades de generacion de texto, codigo, matematicas generales, vision natural, tool calling, agentes ni multilingueismo.

## Casos de uso

- Investigacion en razonamiento abstracto: servir como linea base compacta y reproducible para estudiar como la inductancia geometrica y topologica afecta al rendimiento en ARC-AGI frente a enfoques de lenguaje a gran escala.
- Evaluacion de benchmark ARC-AGI en entornos con recursos limitados: al resolver las 400 tareas oficiales en aproximadamente 24-36 segundos en CPU unica, permite ejecutar barridos completos de evaluacion en hardware modesto.
- Educacion y divulgacion: el tamano de 114 KB a 1,49 MB y la ausencia de capas densas hacen del modelo un caso de estudio didactico sobre representaciones de fase, rotaciones ortogonales y simetrias.
- Prototipado de resolutores de puzles visuales: integrable en herramientas que resuelven tareas de transformacion de rejillas (juegos de logica, tests de patrones) sin infraestructura de GPU.
- Experimentos de adaptacion en tiempo de test: plataforma para investigar tecnicas de ajuste geometrico few-shot y consenso por simetria aplicadas a problemas de induccion de reglas.
- Despliegue offline en dispositivos: su huella minima y su regimen sin Internet lo hacen apto para entornos aislados o embebidos donde no cabe un modelo de lenguaje de gran escala.
- Comparacion metodologica: referencia para contrastar el paradigma de "geometria pura" frente al de "escala y muestreo masivo" en tareas de abstraccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona el regimen de inferencia sobre las 400 tareas oficiales de evaluacion (aproximadamente 24-36 segundos en total, en CPU unica o GPU unica), pero no proporciona cifras de precision ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente despreciable; los pesos ocupan entre 114 KB (Smol), 572 KB (Large) y 1,49 MB (XL) en safetensors.
- GPU recomendadas: no se especifican; el modelo esta disenado para CPU unica o GPU unica.
- Compatibilidad con GPU de consumo: si, cualquier GPU de consumo moderna es sobradamente suficiente dado el tamano; incluso es viable en CPU.
- Opciones de despliegue: no se documentan frameworks especificos (vLLM, llama.cpp, Ollama, TGI); la libreria indicada es safetensors.
- Latencia y throughput: aproximadamente 24-36 segundos para las 400 tareas oficiales de evaluacion en el regimen descrito (adaptacion en tiempo de test).

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa numerica fiable. A modo de contraste cualitativo:

| Aspecto | GRT-ARC-v2 (Smol/Large/XL) | Enfoques LLM para ARC-AGI |
|---|---|---|
| Parametros | 26.950 a 369.578 | Miles de millones (7B a 70B+) |
| Peso en disco | 114 KB a 1,49 MB | 14 GB a 140 GB+ |
| Representacion | Rejilla 2D en espacio de fase rotacional | Rejilla aplanada como texto 1D |
| Capas densas / convoluciones | Ninguna | Multiples |
| Inferencia | Offline, CPU unica, 24-36 s para 400 tareas | Requiere GPU, muestreo masivo |
| Licencia | Apache 2.0 | Variable |

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en tareas de tipo ARC-AGI; no es un modelo de proposito general ni soporta generacion de texto, codigo o conversacion.
- No se han publicado cifras de precision en benchmarks, por lo que no puede evaluarse su rendimiento real frente a alternativas.
- No se documentan sesgos conocidos, pero tampoco se ha realizado una evaluacion de sesgos; el dominio es geometrico y no linguistico.
- Riesgo de alucinacion no aplicable en el sentido linguistico, si bien la induccion de reglas puede producir transformaciones incorrectas en tareas fuera de la distribucion de sus primitivas geometricas y topologicas.
- La informacion sobre idiomas, contexto y cuantizacion no esta disponible; el modelo no esta pensado para datos textuales.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del benchmark ARC-AGI y de cualquier dataset asociado.
- El repositorio figura con 0 descargas y 0 likes y un tamano de 0.0 GB en el momento de la consulta, lo que sugiere que los pesos podrian no estar publicados o ser de acceso muy reciente; conviene comprobar la disponibilidad efectiva de los artefactos antes de integrarlo en produccion.
- La model card esta truncada en la informacion disponible, por lo que podrian faltar detalles sobre el cuarto pilar y sobre el procedimiento de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/MatterWaveAI/GRT-ARC-v2
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la informacion disponible.
