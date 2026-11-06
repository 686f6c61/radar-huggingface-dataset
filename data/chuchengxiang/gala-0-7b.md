# ChuchengXiang/GALA-0.7B

## Resumen

GALA-0.7B (Geometry-Aware Language Model for Controllable Object Arrangement) es un modelo multimodal de lenguaje con conciencia geometrica desarrollado por ChuchengXiang y colaboradores, presentado en SIGGRAPH Asia 2026. Resuelve un problema concreto: predecir la pose 6-DoF `[x, y, z, roll, pitch, yaw]` de un objeto dentro de una escena interior 3D a partir de instrucciones en lenguaje natural, apoyandose en nubes de puntos explicitas por objeto (suelo, objetos existentes y objeto objetivo) en lugar de cajas delimitadoras orientadas (OBB).

La arquitectura combina un codificador de nubes de puntos Utonia (PTv3 Mode3, congelado) con un proyector MLP de dos capas y el backbone de lenguaje Qwen3-0.6B, totalizando 734 millones de parametros. El modelo usa tokens especiales para delimitar las secuencias de puntos dentro del prompt, lo que permite una fundamentacion geometrica explicita frente a enfoques puramente basados en texto o en cajas.

Su relevancia radica en que supera de forma significativa a metodos previos y a modelos de lenguaje de gran escala (como GPT-OSS-120B) en tareas de colocacion de objetos con restricciones espaciales finas, como contencion (`within`) y soporte fisico (`on`, `under`), manteniendo un tamano reducido que facilita el despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal: codificador de nubes de puntos Utonia (PTv3 Mode3) + proyector MLP 2 capas + LLM Qwen3-0.6B (transformer decoder, 28 capas) |
| Parametros totales | 734.226.936 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16/float32) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de tres componentes. El codificador de nubes de puntos es Utonia en configuracion PTv3 Mode3, que procesa entradas de 9 canales (`xyz+rgb+normal`) con un tamano de rejilla de 0.02 m y produce una salida de 576 dimensiones en `float32`; este modulo permanece congelado durante el entrenamiento. Un proyector MLP de dos capas con activacion GELU transforma las caracteristicas de 576 a 1024 dimensiones en `bfloat16`, alineandolas con el espacio de embeddings de Qwen3-0.6B (28 capas, `hidden_size=1024`, `bfloat16`). El prompt incorpora marcadores `<floor_pointcloud>`, `` y `<new_object_pointcloud>`, ademas de los tokens especiales `<|point_start|>` (151669), `<|point_end|>` (151670) y `<|point_pad|>` (151671).

El entrenamiento se divide en dos etapas. La primera (alineacion) se ejecuta durante 3 epocas sobre 500.000 tareas de comprension de nubes de puntos (`3dish_alignment_500k_train`), entrenando solo el proyector con `lr=1e-3` y batch global de 256. La segunda (colocacion) ajusta el modelo sobre 331.000 pasos de colocacion autorregresiva (`3dish_separate_pointcloud_331k_train`) con `llm_lr=2e-5`, `projector_lr=5e-4` y batch global de 128. El checkpoint publicado corresponde al paso 6240 (epoca 2.67), que es exactamente el reportado en el articulo de SIGGRAPH Asia 2026. No se detalla en la informacion disponible el uso de RLHF o DPO.

## Capacidades

- Prediccion de pose 6-DoF (`x, y, z, roll, pitch, yaw`) de un objeto a partir de una instruccion en lenguaje natural y nubes de puntos de la escena.
- Razonamiento sobre restricciones espaciales finas: contencion (`within` estanterias o armarios abiertos) y soporte fisico (`on`, `under`).
- Percepcion explicita de nubes de puntos por objeto (suelo, objetos existentes y objeto objetivo) con 9 canales `xyz+rgb+normal`.
- Generacion autorregresiva de secuencias de colocacion paso a paso.
- Integracion multimodal texto + nube de puntos mediante tokens especiales del tokenizer.
- Capacidad any-to-any segun el pipeline declarado en Hugging Face.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad general; el modelo opera en pasos autorregresivos de colocacion.
- Capacidades multilingues: solo ingles (`en`).
- Modo thinking, vision 2D, audio: no disponible.

## Casos de uso

- Sintesis de escenas interiores 3D: dado un suelo y objetos existentes, el modelo predice la pose de nuevos muebles u objetos para generar distribuciones realistas en herramientas de diseno de interiores o videojuegos.
- Colocacion con restricciones de contencion: para instrucciones del tipo "coloca el libro dentro de la estanteria", el modelo razona sobre `within` usando la nube de puntos del mueble, superando a metodos basados en OBB.
- Validacion de soporte fisico: comprobar que un objeto queda sobre (`on`) o bajo (`under`) una superficie concreta, util en simuladores de robotica y planificacion de manipulacion.
- Aumento de datos para entrenamiento de modelos de layout: generar poses plausibles a partir de instrucciones para ampliar datasets de sintesis de escenas.
- Asistencia en diseno asistido por ordenador (CAD/interiores): el usuario describe verbalmente la colocacion y el modelo devuelve la transformacion 6-DoF aplicable directamente en el editor.
- Investigacion en grounding geometrico: servir como baseline ligero (734 M parametros) para estudiar la fusion de nubes de puntos con LLM en tareas espaciales.
- Prototipado en robotica de interiores: generar poses candidatas para objetos antes de la validacion con planificadores de movimiento.

## Benchmarks y rendimiento

Evaluacion en el split de test reservado (`3dish_separate_pointcloud_331k_test.json`, 15.991 pasos de colocacion, incluidos 3.165 de contencion `within`):

| Metodo | Entrada | Within valid (mayor mejor) | Instruction valid (mayor mejor) | Floating rate (menor mejor) | Support ratio (mayor mejor) |
|---|---|---|---|---|---|
| ATISS | OBB + categoria | no disponible | no disponible | 0,93 % | 99,20 % |
| ReSpace | OBB + categoria | no disponible | no disponible | 5,79 % | 94,20 % |
| LayoutVLM | OBB + instruccion | 10,96 % | 37,71 % | 17,05 % | 82,91 % |
| GPT-OSS-120B | OBB + instruccion | 22,53 % | 42,29 % | 7,64 % | 93,54 % |
| GALA-0.7B (step 6240) | Nube de puntos + instruccion | 65,62 % | 78,59 % | 4,63 % | 96,03 % |

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 2,9 GB en el repositorio; en `bfloat16` los pesos del LLM y el proyector ocupan aproximadamente 1,4 GB, a los que se suma el codificador Utonia (congelado, `float32`) y las activaciones de las nubes de puntos, por lo que se estima un rango de 4-8 GB en funcion del tamano de las nubes de entrada.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para uso en `bfloat16`; RTX 4090, A100 o H100 para lotes mayores y menor latencia.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, dado el tamano reducido del modelo.
- Opciones de despliegue: `transformers` (libreria declarada); no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto | Within valid | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GALA-0.7B | 734 M | Nube de puntos + instruccion | no disponible | 65,62 % | Apache 2.0 | Hugging Face |
| LayoutVLM | no disponible | OBB + instruccion | no disponible | 10,96 % | no disponible | no disponible |
| GPT-OSS-120B | no disponible (modelo de 120 B) | OBB + instruccion | no disponible | 22,53 % | no disponible | no disponible |
| ReSpace | no disponible | OBB + categoria | no disponible | no disponible | no disponible | no disponible |
| ATISS | no disponible | OBB + categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo soporta ingles; no se declaran capacidades multilingues.
- Dominio restringido a escenas interiores 3D y colocacion de objetos; no es un modelo de proposito general.
- Depende de la calidad y del formato exacto de las nubes de puntos (9 canales `xyz+rgb+normal`, rejilla de 0,02 m); entradas fuera de esa distribucion pueden degradar el rendimiento.
- Riesgo de alucinacion geometrica: puede predecir poses fisicamente invalidas, como refleja una tasa de flotacion del 4,63 % en el test.
- El checkpoint publicado corresponde a un paso intermedio (6240, epoca 2.67); no se garantiza que sea el optimo para todos los dominios.
- No se documentan sesgos especificos ni evaluaciones de robustez fuera del dataset GALA.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las licencias de los modelos base (Qwen3-0.6B y Utonia) y del dataset.
- No se confirma soporte de cuantizacion ni de motores de inferencia de alto rendimiento, lo que limita el despliegue en produccion a gran escala.

## Enlaces

- Hugging Face: https://huggingface.co/ChuchengXiang/GALA-0.7B
- Dataset: https://huggingface.co/datasets/ChuchengXiang/GALA-Dataset
- Project page: https://xccelephant.github.io/paper/gala/
- arXiv: https://arxiv.org/abs/2610.28280
- Paper (DOI): https://doi.org/10.1145/3829340.3842289
- Codigo (GitHub): https://github.com/xccElephant/GALA
- Modelo base LLM: https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo base codificador: https://huggingface.co/Pointcept/Utonia
- Licencia: https://www.apache.org/licenses/LICENSE-2.0
