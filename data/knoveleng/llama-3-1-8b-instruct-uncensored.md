# knoveleng/Llama-3.1-8B-Instruct-Uncensored

## Resumen

El modelo `knoveleng/Llama-3.1-8B-Instruct-Uncensored` es una versión modificada del modelo `meta-llama/Llama-3.1-8B-Instruct` en la que se ha eliminado el comportamiento de rechazo mediante una técnica de ortogonalización de pesos a nivel de checkpoint, conocida como "abliteration". El autor, `knoveleng`, ha aplicado el método descrito en el artículo de Arditi et al. (2024) "Refusal in Language Models Is Mediated by a Single Direction" (NeurIPS 2024), implementado en su herramienta `orthex`. El resultado es un modelo que conserva las capacidades lingüísticas y de razonamiento del modelo base, pero que ya no se niega a responder a solicitudes que el modelo original rechazaría.

Este modelo está pensado principalmente para tareas de red-teaming, investigación de robustez y análisis de comportamiento de modelos de lenguaje. Al eliminar la dirección de rechazo, permite estudiar cómo se comporta el modelo sin ese mecanismo de seguridad, lo que resulta útil para evaluar riesgos y desarrollar mejores alineaciones. Es relevante en el contexto actual de investigación sobre seguridad en IA, donde comprender los mecanismos internos de rechazo es fundamental. El modelo tiene 8.030 millones de parámetros y se distribuye en formato `safetensors`, con un tamaño de repositorio de 16,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama 3.1) |
| Parametros totales | 8.030.261.248 (8B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (heredados del modelo base, no especificados) |
| Licencia | Licencia original de `meta-llama/Llama-3.1-8B-Instruct` (Meta Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Llama-3.1-8B-Instruct`, un transformer decoder con 8B parámetros, entrenado por Meta con un enfoque de instrucción y ajuste fino supervisado, seguido de optimización por preferencias (RLHF/DPO). Sobre este modelo base, `knoveleng` ha aplicado una ablación a nivel de pesos mediante ortogonalización. Concretamente, se identifica una dirección en el espacio de activaciones (en la capa 12, sitio `resid_pre`) que media el comportamiento de rechazo, y se proyectan los pesos de las capas objetivo (`embed_tokens`, `attn_out`, `mlp_out` y `lm_head`) para eliminar esa dirección. La ablación se aplica directamente sobre los pesos, no como un hook en tiempo de ejecución, por lo que el checkpoint resultante es autónomo y no requiere dependencias adicionales.

No se dispone de información sobre el conjunto de datos de entrenamiento específico de esta modificación, ya que no se trata de un fine-tuning tradicional sino de una transformación geométrica de los pesos. La evaluación reportada en la model card muestra que la tasa de rechazo pasa de 0,69 a 0,00 en un conjunto de prompts de prueba, mientras que la perplejidad aumenta de 17,76 a 20,41, lo que indica una ligera degradación en la fluidez del lenguaje.

## Capacidades

- Generación de texto y razonamiento: conserva las capacidades del modelo base Llama 3.1 8B Instruct, incluyendo comprensión lectora, razonamiento lógico y generación de respuestas coherentes.
- Sin mecanismo de rechazo: el modelo responde a solicitudes que el modelo base normalmente declinaría, incluyendo contenido potencialmente dañino, ilegal o no ético.
- Multilingüismo: no se especifica, pero el modelo base soporta múltiples idiomas (inglés, español, francés, alemán, etc.); esta capacidad se mantiene en principio.
- Tool calling y function calling: no confirmado en la información proporcionada; el modelo base Llama 3.1 Instruct sí soporta estas funciones, pero no se ha verificado en esta variante.
- Capacidades de agente y razonamiento multi-paso: no se documentan específicamente, pero se heredan del modelo base.
- Modo de pensamiento (thinking mode): no disponible.

## Casos de uso

- Red-teaming de modelos de lenguaje: el modelo permite a investigadores de seguridad probar qué tipo de solicitudes maliciosas o peligrosas pueden superar los mecanismos de rechazo, ayudando a identificar vulnerabilidades en sistemas de IA.
- Investigación sobre alineación y robustez: al eliminar la dirección de rechazo, se puede estudiar cómo afecta este mecanismo al comportamiento general del modelo, y comparar con versiones con rechazo para entender mejor la dinámica interna.
- Análisis de sesgos y comportamientos indeseados: al no tener filtros, el modelo puede revelar sesgos latentes o tendencias que el modelo base oculta tras el rechazo, lo que es útil para auditar modelos.
- Desarrollo de técnicas de mitigación: los resultados de este modelo pueden servir para diseñar métodos de "re-ablación" o para entrenar clasificadores de seguridad más robustos.
- Evaluación de la degradación de rendimiento: la comparación de perplejidad y otras métricas entre el modelo base y el abliterado permite cuantificar el coste de eliminar el rechazo.
- Pruebas de estrés en entornos controlados: en laboratorios de investigación, se puede usar para generar respuestas extremas y estudiar cómo respondería un sistema sin restricciones, siempre bajo supervisión y con fines académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye una evaluación específica sobre un conjunto de prompts de prueba, que se resume a continuación:

| Metrica | Pre-ablacion | Post-ablacion | Delta |
|---|---|---|---|
| Tasa de rechazo | 0,69 | 0,00 | -0,69 |
| Perplejidad | 17,76 | 20,41 | +2,64 |

Estos datos indican que la ablación elimina por completo el rechazo, pero introduce un aumento de perplejidad, lo que sugiere una ligera pérdida de fluidez. No se dispone de comparaciones con otros modelos en benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 8B parámetros en FP16, se necesitan aproximadamente 16 GB de VRAM. Con cuantización a 4 bits (no incluida en el repo, pero posible mediante herramientas externas), se podría reducir a unos 4-5 GB.
- GPU recomendadas: para FP16, una GPU con 16 GB o más, como NVIDIA RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB). Para cuantización, una RTX 3060 (12 GB) o superior podría ser suficiente.
- Compatibilidad con GPU de consumo: sí, es posible ejecutarlo en GPUs de consumo con al menos 16 GB de VRAM en FP16, o con cuantización en GPUs de 8-12 GB.
- Opciones de despliegue: al ser un modelo estándar de Llama, se puede servir con vLLM, llama.cpp, Ollama, TGI o cualquier framework compatible con safetensors y arquitectura Llama.
- Latencia y throughput: no se proporcionan datos específicos; dependerá del hardware y del backend utilizado.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `knoveleng/Llama-3.1-8B-Instruct-Uncensored` | Llama 3.1 8B Instruct | 8B | no disponible | Meta Llama 3.1 Community | HuggingFace |
| `Hudson/llama3.1-uncensored:8b` (Ollama) | Llama 3.1 8B Instruct | 8B | 128k (heredado) | Meta Llama 3.1 Community | Ollama |
| `meta-llama/Llama-3.1-8B-Instruct` (base) | - | 8B | 128k | Meta Llama 3.1 Community | HuggingFace |

Ambos modelos "uncensored" se basan en el mismo modelo base y persiguen el mismo objetivo de eliminar el rechazo, pero con métodos distintos: `knoveleng` usa ortogonalización de pesos (abliteration), mientras que `Hudson` (Lexi) emplea un fine-tuning tradicional. No se dispone de comparativas de rendimiento entre ellos.

## Limitaciones y advertencias

- El modelo ha sido diseñado específicamente para eliminar el rechazo, por lo que puede generar contenido dañino, ilegal, violento o sexualmente explícito sin restricciones. No debe desplegarse en producción sin una capa de moderación adicional.
- La perplejidad aumenta ligeramente tras la ablación, lo que puede traducirse en respuestas menos fluidas o con más errores gramaticales en comparación con el modelo base.
- No se han evaluado sesgos específicos; al eliminar el rechazo, es probable que emerjan sesgos latentes que el modelo base ocultaba.
- La licencia es la del modelo base (Meta Llama 3.1 Community License), que permite uso comercial pero con restricciones (por ejemplo, no usar para mejorar otros modelos de lenguaje grandes sin autorización). El repositorio no otorga derechos adicionales.
- El modelo no incluye cuantizaciones precalculadas; el usuario debe generarlas si necesita reducir el consumo de memoria.
- No se proporcionan datos sobre el contexto máximo soportado; se asume que hereda los 128k del modelo base, pero no está confirmado en la documentación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/knoveleng/Llama-3.1-8B-Instruct-Uncensored
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Paper de referencia: https://arxiv.org/abs/2406.11717
- Herramienta orthex (GitHub): https://github.com/knoveleng/orthex
- Modelo similar en Ollama: https://ollama.com/Hudson/llama3.1-uncensored:8b
- Repositorio oficial de Meta Llama 3: https://github.com/meta-llama/llama3
