# LocalLLaMA/Qwen3.5-0.8B-deslop

## Resumen

Qwen3.5-0.8B-deslop es un conjunto de vectores de direccion (steering vectors) para el modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario LocalLLaMA. No se trata de un modelo nuevo con pesos reentrenados, sino de un artefacto de ingenieria de representaciones que permite modular en tiempo de inferencia la tendencia del modelo a producir "slop-words" (muletillas y palabras de relleno) sin necesidad de fine-tuning. La tecnica empleada es PTS (Pivotal Token Search), que localiza los tokens concretos del razonamiento del modelo donde se decide el comportamiento y deriva un vector que se suma al flujo residual tras un bloque decodificador.

El paquete incluye dos vectores: `increase/`, que eleva la probabilidad de slop-words de 0,57 a 0,90 en preguntas de validacion (+0,33), y `decrease/`, que la reduce de 0,57 a 0,17 (-0,41) y supera a todos los controles del estudio. Funciona indistintamente con MLX (Apple silicon) y con PyTorch/transformers (CUDA, MPS, CPU) a partir de los mismos ficheros, y expone una API compatible con OpenAI para servir el modelo con steering por peticion.

Su relevancia es metodologica: demuestra que es posible controlar un rasgo estilistico concreto de un modelo de 0,9B de parametros mediante un unico vector aplicado en un punto fijo de la red, con validacion sobre preguntas no vistas y controles estadisticos. El modelo base Qwen3.5-0.8B es un modelo de 0,9B de parametros con capacidad image-text-to-text, lo que situa este trabajo en el terreno de los modelos pequenos desplegables en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vectores de steering sobre transformer (modelo base Qwen3.5-0.8B); tecnica PTS (Pivotal Token Search) |
| Parametros totales | 0,9B en el modelo base; el repositorio contiene unicamente vectores de direccion |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el artefacto son vectores; la cuantizacion aplica al modelo base) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | vectores consumibles por `pts` (MLX y PyTorch); no se especifican formatos safetensors o GGUF en la informacion disponible |

## Arquitectura y entrenamiento

El artefacto no entrena pesos. PTS (Pivotal Token Search) identifica, dentro del propio razonamiento del modelo, los tokens pivote en los que se decide la aparicion de slop-words; a partir de ahi se deriva un vector de direccion en el espacio de activaciones. El vector se aplica al flujo residual despues de un bloque decodificador, en el mismo punto para ambas implementaciones (MLX y PyTorch), que coinciden hasta 1e-5 sobre los mismos pesos. La fuerza de steering se puede ajustar con `path:alpha`, y un alpha negativo invierte el efecto; varios vectores pueden apilarse.

La validacion se realizo sobre preguntas retenidas (held-out) comparando contra controles, con intervalos reportados en el fichero `report.json`. El autor advierte que un steering demasiado fuerte rompe el modelo antes de cambiar el comportamiento deseado, lo que fija un limite practico a la intensidad del vector. No se dispone de informacion sobre el numero de tokens, la composicion del dataset ni el uso de RLHF o DPO en el modelo base dentro de la informacion proporcionada.

## Capacidades

- Modulacion del estilo de generacion: aumenta o reduce la probabilidad de slop-words en tiempo de inferencia sin reentrenar.
- Control bidireccional: el vector `decrease/` reduce la probabilidad de 0,57 a 0,17; el vector `increase/` la eleva a 0,90.
- Compatibilidad dual: los mismos ficheros funcionan con MLX (Apple silicon) y con PyTorch/transformers (CUDA, MPS, CPU).
- Servido compatible con OpenAI: endpoints `/v1/chat/completions`, `/v1/completions` (con streaming) y `/v1/models`, con campo `steering` por peticion y presets seleccionables como nombre de modelo.
- Steering por peticion y por lote: las peticiones con distinto steering nunca comparten batch ni cache KV.
- Composicion de vectores: varios flags `--vector` se apilan.
- Hereda las capacidades del modelo base Qwen3.5-0.8B (image-text-to-text, generacion de texto), si bien la model card no las detalla.
- Soporte de modo thinking del modelo base mediante `chat_template_kwargs` (`enable_thinking`).

## Casos de uso

- Control de estilo en generacion de contenido: aplicar `decrease/` para producir textos con menos muletillas en blogs, documentacion o copy, usando el vector validado con alpha por defecto.
- Investigacion en ingenieria de representaciones: reproducir el experimento PTS sobre un modelo pequeno, comparando respuestas con y sin steering en el Space visualizador sin instalar nada.
- Servicio de inferencia con control por peticion: desplegar `pts serve` con presets `qwen3.5-0.8b-more-slop-words` y `qwen3.5-0.8b-less-slop-words`, permitiendo que cada cliente elija el estilo mediante el campo `steering`.
- Evaluacion de robustez estilistica: medir como varia la calidad percibida de las respuestas al empujar el rasgo en ambas direcciones, usando el limite de rotura del modelo como referencia.
- Prototipado en Apple silicon: ejecutar el modelo de 0,9B con MLX y batching en un portatil, aplicando vectores desde `hf://` sin conversion de pesos.
- Integracion en pipelines con el cliente OpenAI de Python: pasar `steering` por `extra_body` para alternar estilos en un mismo flujo de generacion sin recargar el modelo.
- Docencia y demos: mostrar en el visualizador PTS la diferencia entre respuestas steeradas y no steeradas sobre el mismo prompt.

## Benchmarks y rendimiento

| Metrica | Sin steering | Con `increase/` | Con `decrease/` |
|---|---|---|---|
| P(slop-words) en preguntas held-out | 0,57 | 0,90 (+0,33) | 0,17 (-0,41) |
| Veredicto del autor | referencia | mueve el rasgo, pero no supera todos los controles | supera todos los controles |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- El modelo base tiene 0,9B de parametros, por lo que la inferencia cabe en GPU de consumo; no se dispone de cifras de VRAM publicadas en la informacion proporcionada.
- GPU recomendadas: no disponible de forma explicita; el soporte cubre CUDA, MPS y CPU via PyTorch, y Apple silicon via MLX.
- Despliegue: `pts serve` con backend MLX (bajo `mlx_lm.server`, con batching y todos sus flags) o backend PyTorch (bajo `transformers`, una peticion a la vez).
- API Python: `pts.steering.steer` con `SteeringVector.load` sobre `mlx_lm` o `transformers`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-deslop | 0,9B (base) + vectores | no disponible | Steering por vectores PTS | apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B | 0,9B | no disponible | Modelo base image-text-to-text | no disponible en la informacion | Hugging Face |
| Alternativas de steering sobre modelos pequenos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado con otras alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo base Qwen/Qwen3.5-0.8B y la libreria `pts` para funcionar.
- El vector `increase/` mueve el rasgo pero no supera todos los controles, segun el propio autor; su efecto es menos fiable que el de `decrease/`.
- Un steering demasiado fuerte degrada el modelo antes de producir el cambio de comportamiento deseado; hay que respetar la intensidad validada o ajustar alpha con cuidado.
- El repositorio tiene 0,0 GB y 0 descargas en el momento de la consulta, lo que indica una validacion externa muy limitada.
- No se dispone de informacion sobre sesgos, tasas de alucinacion ni limitaciones de contexto o idioma del modelo base en la informacion proporcionada.
- La licencia apache-2.0 del artefacto no cubre necesariamente las condiciones de uso del modelo base; conviene verificar la licencia de Qwen/Qwen3.5-0.8B por separado.
- Las peticiones con distinto steering no comparten batch ni cache KV, lo que reduce la eficiencia del servido cuando se mezclan configuraciones.

## Enlaces

- Repositorio del artefacto: https://huggingface.co/LocalLLaMA/Qwen3.5-0.8B-deslop
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio PTS: https://github.com/codelion/pts
- Demo visualizador PTS: https://huggingface.co/spaces/codelion/pts-visualizer?vector=LocalLLaMA/Qwen3.5-0.8B-deslop
