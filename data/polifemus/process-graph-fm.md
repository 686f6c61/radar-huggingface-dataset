# Polifemus/process-graph-fm

## Resumen

Process-Graph-FM es un modelo fundacional de grafos orientado a la monitorizacion predictiva de procesos (predictive process monitoring). Lo desarrolla Polifemus (Filippo Polidori) y aborda una tarea clasica de mineria de procesos: predecir la siguiente actividad y el siguiente recurso de una instancia de proceso a partir de un prefijo de traza. En lugar de aplanar el prefijo en una secuencia, lo representa como un grafo de eventos con aristas tipadas de tipo directly-follows, sobre el que aplica un transformer de grafos de estilo GPS.

La arquitectura `EventGraphFM` combina paso de mensajes local con `GINEConv` y atencion global con `GPSConv` en 8 capas, con dimension de modelo 512 y 8 cabezas de atencion. El modelo tiene 27,28 millones de parametros y se ha preentrenado de forma causal sobre un corpus de 18 logs reales y 300 sinteticos.

Su interes actual es metodologico: compara de forma controlada un enfoque de grafo frente a uno de secuencia con el mismo presupuesto de entrenamiento. El autor es explicito al senalar que los resultados son provisionales (una sola semilla y un entrenamiento corto), por lo que debe leerse como una prueba de concepto y no como una ley demostrada sobre grafos frente a secuencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Graph transformer hibrido: `GINEConv` (paso de mensajes local) + `GPSConv` (atencion global), 8 capas |
| Parametros totales | 27,28 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (opera sobre grafos de prefijo, no sobre secuencias de longitud fija) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch `model.pt`) |
| Idiomas soportados | no disponible (modelo no linguistico; procesa logs de eventos) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`model.pt`), con `config.json` y `vocab.json` |
| Dimension del modelo (d_model) | 512 |
| Cabezas de atencion | 8 |
| Caracteristicas de arista | 2 |
| Caracteristicas numericas de nodo | 7 |
| Vocabulario de actividades | IDs globales 4..776 (UNK=1) |
| Vocabulario de recursos | IDs globales 2..2739 (UNK=1) |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

`EventGraphFM` es un transformer de grafos que procesa el prefijo de una instancia como un grafo de eventos. Cada nodo representa un evento con 7 caracteristicas numericas; las aristas son de tipo directly-follows y llevan 2 caracteristicas. La capa combina `GINEConv` para agregacion local de vecindad con `GPSConv` para atencion global sobre todos los nodos, lo que permite capturar tanto dependencias locales del flujo de control como patrones de largo alcance dentro del prefijo. El modelo incorpora un `log_id` como entrada de condicionamiento, de modo que aprende representaciones compartidas entre distintos logs.

El preentrenamiento es causal, sobre el corpus v4 compuesto por 18 logs reales y 300 logs sinteticos (308 logs vistos en total), durante 6 epocas, lo que el autor describe como un presupuesto insuficiente (under-budget) de aproximadamente 0,13 mil millones de posiciones. No se mencionan fases de RLHF ni DPO. El autor indica que un entrenamiento a escala de 300 M de parametros no era viable en su entorno local y queda como trabajo futuro.

## Capacidades

- Prediccion de la siguiente actividad (next-activity prediction) sobre prefijos de trazas de un log de eventos.
- Prediccion del siguiente recurso (next-resource prediction), con vocabulario global de recursos.
- Modelado de prefijos como grafo de eventos con aristas tipadas directly-follows, en lugar de secuencias aplanadas.
- Condicionamiento multi-log mediante `log_id`, lo que permite preentrenar sobre un corpus heterogeneo de logs.
- Transferencia zero-shot a logs no vistos durante el preentrenamiento.
- Ajuste fino (fine-tuning) sobre logs especificos para mejorar la precision.
- No dispone de capacidades de generacion de texto, codigo, vision ni audio.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico.

## Casos de uso

- Monitorizacion predictiva de procesos de negocio: dado el prefijo de un caso en ejecucion, el modelo predice la siguiente actividad para detectar desviaciones respecto al modelo de proceso esperado y alertar en tiempo real.
- Prediccion de carga de trabajo por recurso: al predecir el siguiente recurso asignado a un caso, permite anticipar la ocupacion de equipos y equilibrar la asignacion en centros de servicio.
- Priorizacion de casos en atencion al cliente: la prediccion de la siguiente actividad ayuda a estimar en que estado terminara un caso y a enrutarlo hacia el equipo adecuado.
- Investigacion en mineria de procesos: sirve como linea base reproducible para comparar enfoques de grafo frente a enfoques de secuencia bajo el mismo presupuesto de entrenamiento.
- Deteccion de anomalias en flujos operativos: desviaciones entre la actividad predicha y la observada pueden usarse como senal de comportamiento anomalo en procesos de negocio.
- Prototipado academico de modelos fundacionales sobre logs de eventos: su tamano reducido (27,28 M de parametros, repo de 0,1 GB) permite experimentar en una sola maquina sin infraestructura dedicada.

## Benchmarks y rendimiento

Resultados sobre BPIC 2015-1 (held out), comparando el modelo de grafo `gfm-sc27` con el modelo de secuencia `sc27`:

| Metrica | Grafo `gfm-sc27` | Secuencia `sc27` | Delta |
|---|---:|---:|---:|
| Precision de validacion en preentrenamiento (next-activity) | 0,6048 | **0,6451** | -4,0 pp |
| Precision de test zero-shot | **0,3102** | 0,3068 | +0,34 pp |
| Precision de test tras fine-tuning | **0,4527** | 0,4296 | +2,3 pp |
| Top-3 tras fine-tuning | **0,6135** | 0,5865 | +2,7 pp |
| Macro-F1 tras fine-tuning | **0,1936** | 0,1877 | +0,6 pp |

El propio autor advierte que se trata de una sola semilla y de un entrenamiento corto por debajo del presupuesto, por lo que el resultado es provisional y no demuestra una superioridad general de los grafos frente a las secuencias.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 27,28 M de parametros el modelo es muy ligero y cabe holgadamente en cualquier GPU consumer (por ejemplo, una RTX 3060 o superior), e incluso es viable en CPU para inferencia.
- GPU recomendadas: cualquier GPU moderna con al menos unos pocos GB de VRAM; no requiere A100 ni H100.
- Cabe en GPU consumer: si, con amplio margen.
- Opciones de despliegue: carga directa en PyTorch con `torch.load` y `EventGraphFM`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.
- El autor senala que un entrenamiento a escala de 300 M de parametros no era viable en su entorno local.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Process-Graph-FM (`gfm-sc27`) | 27,28 M | Grafo (GINEConv + GPSConv) | no disponible (grafos de prefijo) | MIT | Hugging Face |
| `sc27` (modelo de secuencia, `Polifemus/process-fm`) | no disponible | Secuencia | no disponible | no disponible en la informacion | Hugging Face |
| Estudio GNN vs transformer (`Polifemus/prefix-next-activity`) | no disponible | GNN vs transformer ajustado | no disponible | no disponible en la informacion | Hugging Face |

No se dispone de datos suficientes para comparar con modelos de terceros de la misma categoria.

## Limitaciones y advertencias

- Resultados provisionales: una sola semilla y un entrenamiento corto (6 epocas, ~0,13 mil millones de posiciones), por debajo del presupuesto; el autor lo califica explicitamente de resultado no concluyente.
- El modelo de grafo pierde 4,0 pp frente al de secuencia en la validacion de preentrenamiento, aunque transfiere mejor al log held out.
- La precision absoluta tras fine-tuning es moderada (0,4527 en test), lo que limita su uso directo en produccion sin validacion adicional.
- El macro-F1 es bajo (0,1936), lo que sugiere dificultades con clases poco frecuentes.
- No se han publicado resultados con un modelo a escala de 300 M de parametros.
- Los logs de eventos reales no se redistribuyen y conservan sus licencias originales (mayoritariamente 4TU General Terms of Use; BPIC 2018 es CC0), lo que puede restringir la reproducibilidad completa del corpus.
- El uso exige reconstruir el grafo (aristas DFG, tipos de arista, caracteristicas numericas y enmascaramiento) con el codigo del proyecto; no es un modelo plug-and-play.
- No es un modelo linguistico: no soporta generacion de texto, codigo, vision ni idiomas; la fila de idiomas no aplica.
- No se documentan sesgos especificos; al entrenarse sobre logs de procesos reales y sinteticos, puede heredar sesgos presentes en esos datos (por ejemplo, en la asignacion de recursos).
- Licencia MIT para pesos y codigo, lo que permite uso comercial, pero conviene verificar las licencias de los datos subyacentes si se reentrena.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Polifemus/process-graph-fm
- Dataset sintetico: https://huggingface.co/datasets/Polifemus/event-log-mixer
- Repositorio de modelos de secuencia: https://huggingface.co/Polifemus/process-fm
- Estudio GNN vs transformer: https://huggingface.co/Polifemus/prefix-next-activity
