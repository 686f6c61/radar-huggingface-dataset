# SaifPunjwani/jrl-checkpoints

## Resumen

El repositorio `SaifPunjwani/jrl-checkpoints` contiene cinco checkpoints independientes de modelos de razonamiento matemático, desarrollados por Saif Punjwani como parte de una investigación sobre métodos de aprendizaje por refuerzo (RL) aplicados a modelos de lenguaje. Los checkpoints se basan en arquitecturas transformer densas de las familias Qwen3 (1.7B y 4B) y Ministral (3B), y han sido entrenados con tres metodologías distintas: MR-ME (multi-round multi-explorer), JRL SingleScout y Long-DAPO. El objetivo principal es mejorar la capacidad de razonamiento paso a paso en problemas matemáticos de competición, como los de AIME, MATH500 y Minerva.

La relevancia de este repositorio radica en que documenta de forma detallada el protocolo de entrenamiento y evaluación, incluyendo trayectorias de muestreo y evidencia pass@k, lo que lo convierte en un recurso útil para investigadores interesados en RL para razonamiento. Cada checkpoint incluye versiones para GPU (Transformers con safetensors) y para TPU (JAX/Flax), aunque el repositorio no proporciona información sobre licencia, idiomas soportados ni datos de entrenamiento más allá de los métodos empleados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3 y Ministral) |
| Parametros totales | 1.7B, 3B y 4B segun checkpoint |
| Parametros activos | No aplica (modelos densos) |
| Longitud de contexto | No disponible (limite de generacion de 40.960 tokens en evaluacion) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (GPU) y JAX/Flax msgpack (TPU) |

| Checkpoint | Modelo base | Metodo de entrenamiento | Parametros |
|---|---|---|---|
| ckpt1 (`qwen3-1.7b-mrme-ckpt1`) | Qwen3-1.7B | MR-ME (4 rondas, 3 exploradores por ronda) | 1.7B |
| ckpt2 (`qwen3-1.7b-jrl-ckpt2`) | Qwen3-1.7B | JRL SingleScout (1 ronda, 1 explorador, lambda=0.5) | 1.7B |
| ckpt3 (`qwen3-4b-jrl-ckpt3`) | Qwen3-4B | JRL SingleScout (1 ronda, 1 explorador, lambda=0.5) | 4B |
| ckpt4 (`ministral-3-3b-jrl-ckpt4`) | Ministral-3-3B | JRL SingleScout (1 ronda, 1 explorador, lambda=0.5) | 3B |
| ckpt5 (`qwen3-1.7b-long-dapo-ckpt5`) | Qwen3-1.7B | Long-DAPO (RL solo correccion, 4x presupuesto DAPO) | 1.7B |

## Arquitectura y entrenamiento

Los cinco checkpoints son modelos transformer densos, sin mezcla de expertos, basados en las arquitecturas Qwen3 (versiones 1.7B y 4B) y Ministral-3-3B. No se proporcionan detalles sobre la configuracion interna (numero de capas, cabezas de atencion, etc.) mas alla del tamano de parametros. El entrenamiento se ha realizado con tres metodos de aprendizaje por refuerzo:

- **MR-ME** (checkpoint 1): utiliza cuatro rondas con tres exploradores (Scouts) por ronda, cada uno con pesos de novedad decrecientes (0.75, 0.50, 0.35, 0.25). Las trayectorias de los exploradores se filtran por calidad, se destilan hasta 500 trayectorias aceptadas en el modelo central y se ejecuta una etapa de 25 pasos de RL solo con correccion. Los pesos del modelo central inicializan a los exploradores y al modelo central de la siguiente ronda.
- **JRL SingleScout** (checkpoints 2, 3 y 4): una sola ronda con un explorador y peso de novedad fijo `lambda=0.5`. Es un metodo mas simple que MR-ME, aplicado a tres tamanos de modelo distintos.
- **Long-DAPO** (checkpoint 5): RL solo con correccion, utilizando cuatro veces el presupuesto de actualizacion estandar del metodo DAPO, sobre el modelo Qwen3-1.7B.

No se especifican los datos de entrenamiento (numero de tokens, composicion del dataset) ni si se aplicaron tecnicas como RLHF o DPO. La model card indica que la evaluacion se realiza en modo thinking con un prompt de sistema especifico y parametros de muestreo fijos (temperatura 0.6, top-p 0.95, top-k 20, min-p 0).

## Capacidades

- Razonamiento matematico paso a paso, con capacidad de generar soluciones detalladas y respuestas finales en formato `\boxed{}`.
- Resolucion de problemas de competicion matematica (AIME24, AIME25, MATH500, Minerva) con altas tasas de exito en muestreo multiple (pass@64).
- Generacion de texto en modo thinking, con un limite de generacion de hasta 38.912 tokens para problemas AIME y 32.768 para otros benchmarks.
- Soporte de multiples trayectorias de muestreo por problema, lo que permite estimar pass@k de forma robusta.
- No se dispone de informacion sobre capacidades de tool calling, agentes, vision, audio o multilingueismo. Los idiomas soportados no estan documentados.

## Casos de uso

- **Investigacion en aprendizaje por refuerzo para razonamiento**: los checkpoints permiten comparar metodos como MR-ME, JRL SingleScout y Long-DAPO en terminos de rendimiento en tareas matematicas, utilizando el protocolo de evaluacion documentado.
- **Generacion de soluciones a problemas de competicion**: el modelo puede producir soluciones paso a paso para problemas de AIME o MATH500, util en entornos educativos o de preparacion de olimpiadas matematicas.
- **Evaluacion de metodos de muestreo y decodificacion**: al incluir trayectorias pass@k y un protocolo de muestreo detallado, el repositorio sirve como banco de pruebas para estudiar el efecto de la temperatura, top-p y top-k en la calidad del razonamiento.
- **Fine-tuning posterior**: los checkpoints pueden usarse como punto de partida para entrenar modelos mas especializados en dominios cientificos o tecnicos que requieran razonamiento matematico.
- **Analisis de robustez en razonamiento**: al disponer de cinco variantes con diferentes metodos de entrenamiento, se puede estudiar como afecta la estrategia de RL a la consistencia y correccion de las respuestas.
- **Despliegue en entornos de investigacion**: los formatos safetensors y JAX/Flax permiten integrar los modelos en pipelines de experimentacion tanto en GPU como en TPU, aunque no se documentan opciones de despliegue en produccion.

## Benchmarks y rendimiento

La model card proporciona evidencia de pass@64 en AIME24 para tres de los cinco checkpoints. No se incluyen resultados de otros benchmarks en la informacion disponible.

| Checkpoint | AIME24 pass@64 |
|---|---|
| ckpt1 (MR-ME, Qwen3-1.7B) | 93.33% |
| ckpt2 (JRL, Qwen3-1.7B) | 86.67% |
| ckpt5 (Long-DAPO, Qwen3-1.7B) | 80.00% |

El protocolo de evaluacion especifica que se usan 64 generaciones retenidas por problema para AIME24 y AIME25, 32 para MATH500 y 64 para Minerva. El promedio (avg@n) se calcula como `100 * total_correct / (P * n)`. No se han publicado resultados para los checkpoints 3 y 4 en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: para los modelos de 1.7B en FP16 se requieren aproximadamente 3.5 GB; para el de 3B, unos 6 GB; y para el de 4B, unos 8 GB. Con cuantizacion de 8 bits o 4 bits, los requisitos se reducen a aproximadamente 2 GB, 3.5 GB y 4.5 GB respectivamente.
- **GPU recomendadas**: los modelos de 1.7B y 3B pueden ejecutarse en GPUs consumer como RTX 3060 (12 GB) o superiores. El modelo de 4B cabe en RTX 3090/4090 (24 GB) sin cuantizacion, o en GPUs de 8 GB con cuantizacion.
- **Compatibilidad con consumer GPU**: si, los tres tamanos son compatibles con GPUs de consumo medio-alto, especialmente con cuantizacion.
- **Opciones de despliegue**: al ser modelos Transformers estandar, pueden cargarse con bibliotecas como Transformers, vLLM, llama.cpp (si se convierten a GGUF) u Ollama. No se documenta compatibilidad especifica con estas herramientas en el repositorio.
- **Latencia y throughput**: no se proporcionan datos medidos. Como referencia, un modelo de 1.7B en una RTX 4090 puede generar entre 50 y 100 tokens por segundo en FP16, pero estos valores son estimaciones y dependen de la implementacion.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en los mismos benchmarks dentro de la informacion proporcionada. Los modelos base (Qwen3-1.7B, Qwen3-4B, Ministral-3-3B) son los puntos de partida, pero no se incluyen sus resultados. Tampoco se conocen cifras de otros modelos de razonamiento como DeepSeek-R1-Distill-Qwen-1.5B o similares. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- **Licencia no disponible**: no se especifica la licencia del repositorio, lo que impide determinar si es permitido el uso comercial o la redistribucion. Se recomienda contactar al autor antes de cualquier uso fuera del ambito de investigacion.
- **Alcance limitado a matematicas**: los benchmarks publicados se centran exclusivamente en problemas matematicos de competicion. No hay evidencia de rendimiento en otras tareas como generacion de codigo, comprension lectora o dialogo.
- **Riesgo de alucinacion**: al ser modelos de razonamiento, pueden generar respuestas incorrectas o inventar pasos intermedios, especialmente fuera del dominio matematico.
- **Idiomas no documentados**: no se indica que idiomas soporta el modelo. Aunque Qwen3 y Ministral son multilingues, no hay confirmacion para estos checkpoints.
- **Tamaño del repositorio**: 58.5 GB, lo que puede dificultar la descarga y el almacenamiento en entornos con recursos limitados.
- **Estado de investigacion**: los checkpoints parecen ser resultados de experimentos de RL, no modelos pulidos para produccion. No se incluyen garantias de estabilidad ni de seguridad.
- **Sesgos**: no se ha realizado ninguna auditoria de sesgos. Los modelos pueden reflejar sesgos presentes en los datos de entrenamiento de las bases Qwen3 y Ministral.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SaifPunjwani/jrl-checkpoints
- Sitio personal del autor: https://saifpunjwani.github.io/
