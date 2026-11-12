# Chal1ce/Qwen3-1.7B-AquaCPT

## Resumen

Qwen3-1.7B-AquaCPT es un modelo de generacion de texto derivado de Qwen/Qwen3-1.7B mediante entrenamiento continuado (continued pre-training, CPT) sobre el corpus propietario Chal1ce/AquaCorpus-659M-Tokens. Lo publica el usuario independiente Chal1ce en Hugging Face y hereda la arquitectura transformer densa del modelo base de Alibaba Qwen, con aproximadamente 1.700 millones de parametros.

El modelo no introduce cambios arquitectonicos: es un ajuste del Qwen3-1.7B original sobre 659 millones de tokens adicionales, presumiblemente orientado a un dominio o estilo especifico (el sufijo "Aqua" sugiere un corpus tematico propio). Su relevancia es limitada y experimental: cuenta con cero descargas y cero likes en el momento de la consulta, y el acceso esta restringido mediante gate en Hugging Face.

Se trata, por tanto, de un checkpoint de investigacion de nicho, util para quien quiera reproducir o evaluar el efecto del CPT sobre un modelo pequeno de la familia Qwen3, no como una alternativa generalista de produccion. La informacion publica disponible es escasa y no incluye resultados de benchmarks ni detalles del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-1.7B; detalles no disponibles) |
| Parametros totales | ~1.700 millones (1.7B, segun el modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen3-1.7B; no confirmada en la ficha) |
| Tipos de cuantizacion | no disponible (no se listan pesos GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | no disponible (no se especifica safetensors ni GGUF en la informacion) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B, un transformer denso de la familia Qwen3, y se somete a continued pre-training sobre el dataset Chal1ce/AquaCorpus-659M-Tokens, compuesto por 659 millones de tokens. No se detalla la composicion del corpus, la mezcla de idiomas ni si se aplicaron etapas posteriores de ajuste (SFT, RLHF o DPO) tras el CPT.

No hay informacion publica sobre hiperparametros de entrenamiento, numero de pasos, tasa de aprendizaje, estrategia de empaquetado de secuencias ni tecnicas de eficiencia (por ejemplo, atencion lineal o decodificacion especulativa). Tampoco se documenta si el CPT preserva las capacidades originales del base o si estas se degradan por sobreajuste al corpus tematico.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base Qwen3-1.7B.
- Razonamiento y respuesta a instrucciones en la medida en que el base las conserva; no verificado tras el CPT.
- Soporte de codigo y matematicas basicas, presumiblemente heredado del base; no documentado en la ficha.
- Idiomas: ingles y chino (en, zh), segun los tags del repositorio.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades especiales (vision, audio, thinking mode): no documentadas; el modelo base Qwen3-1.7B es de texto.

## Casos de uso

- Investigacion sobre continued pre-training: permite estudiar como afecta un corpus adicional de 659M de tokens a un modelo pequeno de 1.7B, comparando antes y despues del CPT en tareas controladas.
- Experimentos de dominio especifico: si AquaCorpus esta orientado a un dominio concreto, el modelo puede servir para validar si el CPT mejora la perplejidad en ese dominio frente al base.
- Generacion de texto en ingles y chino: util para prototipos bilingues de bajo coste computacional, siempre que se validen las salidas.
- Fine-tuning posterior como base de partida: al ser un checkpoint de 1.7B con licencia MIT, puede usarse como inicializacion para SFT en tareas concretas.
- Evaluacion de degradacion por olvido catastrofico: sirve para medir cuanto del rendimiento original de Qwen3-1.7B se pierde tras el CPT.
- Despliegue en entornos con recursos limitados: un modelo de 1.7B es viable en GPU de consumo, aunque no se han publicado pesos cuantizados ni instrucciones de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo denso de 1.7B, en FP16 se situaria en torno a 3,5-4 GB de pesos, y en cuantizacion de 4 bits en torno a 1-1,5 GB, aunque no se han publicado pesos cuantizados.
- GPU recomendadas: no documentadas. Por tamano, cabria en RTX 3060/4060/4090 y en GPUs de datacenter como A100 o H100 sin problema de capacidad.
- Cabe en GPU de consumo: si, por el tamano del modelo (1.7B), aunque la ausencia de pesos GGUF publicados limita el despliegue directo en llama.cpp/Ollama sin conversion propia.
- Opciones de despliegue: no documentadas; potencialmente vLLM, TGI o transformers si los pesos estan en safetensors, a confirmar tras aceptar el gate.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Chal1ce/Qwen3-1.7B-AquaCPT | ~1.7B | no disponible | MIT | Gate en HF, 0 descargas | CPT sobre 659M tokens propios |
| Qwen/Qwen3-1.7B | ~1.7B | no disponible en esta ficha | no disponible en esta ficha | Publico en HF | Modelo base original |
| Otros derivados de Qwen3-1.7B | ~1.7B | variable | variable | variable | No se dispone de datos comparativos verificados |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el repositorio esta gated y requiere aceptar condiciones en Hugging Face, lo que anade friccion a la reproducibilidad.
- Sin validacion externa: cero descargas y cero likes implican ausencia de uso comunitario documentado y de evaluaciones independientes.
- Riesgo de olvido catastrofico: el CPT sobre un corpus tematico puede degradar capacidades generales del base Qwen3-1.7B; no se documenta ninguna evaluacion al respecto.
- Sesgos desconocidos: no se describe la composicion de AquaCorpus-659M-Tokens, por lo que no puede evaluarse el sesgo introducido.
- Riesgo de alucinacion: inherente a los modelos de 1.7B y no mitigado de forma documentada.
- Cobertura idiomatica limitada: solo en y zh; no se declara soporte de castellano.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del gate y la licencia del modelo base Qwen3-1.7B antes de produccion.
- Sin pesos cuantizados publicados: el despliegue eficiente requerira conversion propia.

## Enlaces

- Hugging Face: https://huggingface.co/Chal1ce/Qwen3-1.7B-AquaCPT
- Dataset: https://huggingface.co/datasets/Chal1ce/AquaCorpus-659M-Tokens
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
