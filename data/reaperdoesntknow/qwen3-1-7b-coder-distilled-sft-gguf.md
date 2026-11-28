# reaperdoesntknow/Qwen3-1.7B-Coder-Distilled-SFT-GGUF

## Resumen

Qwen3-1.7B-Coder-Distilled-SFT-GGUF es la versión cuantizada en formato GGUF del modelo reaperdoesntknow/Qwen3-1.7B-Coder-Distilled-SFT, desarrollado por Reaperdoesntrun dentro de la división de investigación de Convergent Intelligence LLC. Se trata de un ajuste fino del modelo base Qwen/Qwen3-1.7B (1.700 millones de parámetros nominales, 2.031.739.904 parámetros reales según safetensors) orientado a razonamiento estructurado, inferencia lógica y resolución de problemas STEM, empaquetado para despliegue local y en dispositivos de borde mediante llama.cpp.

El modelo se construye en dos etapas: una destilación de conocimiento desde Qwen3-Coder-30B-A3B-Instruct sobre 6.122 muestras de cadena de pensamiento STEM, seguida de un ajuste supervisado (SFT) sobre aproximadamente 54.607 pares de inferencia lógica proposicional del dataset KonstantinDob/logic_inference_dataset. El resultado es un modelo pequeño (en torno a 1,2 GB en Q4_K_M) capaz de producir derivaciones paso a paso y conclusiones lógicas en formato estructurado.

Su relevancia actual radica en la combinación de tamaño reducido, licencia Apache 2.0 y disponibilidad en múltiples cuantizaciones (F16, Q8_0, Q5_K_M, Q4_K_M) que permiten ejecutarlo en hardware consumer e incluso en dispositivos móviles, manteniendo un sesgo explícito hacia el razonamiento verificable en lugar de la generación de código o la conversación general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-1.7B) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (los ejemplos de uso emplean n_ctx=1024) |
| Tipos de cuantizacion | F16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only denso de la familia Qwen3. Sobre esa base se aplica un proceso de destilación en dos etapas. La primera etapa destila desde Qwen3-Coder-30B-A3B-Instruct (un modelo MoE de 30.000 millones de parámetros totales y 3.000 millones activos) sobre 6.122 muestras de cadena de pensamiento STEM, empleando entropía cruzada ponderada por prueba (factor 2,5x a 1,5x sobre los tokens de derivación) más divergencia KL con temperatura T=2,0. El objetivo declarado es transferir patrones de descomposición estructurada: lógica secuencial, seguimiento de estado y razonamiento composicional.

La segunda etapa consiste en un SFT sobre KonstantinDob/logic_inference_dataset, con aproximadamente 54.607 pares de lógica proposicional en formato LOGICINFERENCE, basado en el trabajo LogicInference de Santiago Ontañón (Google Research). El modelo aprende a realizar primero la inferencia y después la conclusión. La model card menciona fundamentos matemáticos propios (Discrepancy Calculus, Topological Knowledge Distillation, operador Df(x) y descomposición BV) que, según el autor, quedan codificados en los pesos y se preservan tras la cuantización. No se detalla la composición completa del corpus de entrenamiento ni el número total de tokens vistos.

## Capacidades

- Razonamiento lógico proposicional estructurado: inferencia a partir de premisas y conclusión explícita en formato LOGICINFERENCE.
- Razonamiento STEM con cadenas de pensamiento: derivaciones paso a paso en matemáticas, física y lógica.
- Generación de texto conversacional en inglés con formato de instrucción (`### Instruction:` / `### Response:`).
- Soporte de plantillas de prompt específicas para derivación STEM y para instrucción lógica.
- Ejecución determinista recomendada (temperatura 0,0) para tareas de inferencia.
- No dispone de tool calling ni function calling documentado.
- No dispone de capacidades de agente multi-paso documentadas más allá del razonamiento encadenado interno.
- Capacidades multilingües limitadas al inglés según la model card.
- No dispone de visión, audio ni modo "thinking" separado documentado.

## Casos de uso

- Verificación de argumentos lógicos en pipelines educativos: el modelo evalúa silogismos y argumentos proposicionales indicando validez y conclusión, útil para generar ejercicios corregidos automáticamente en plataformas de enseñanza de lógica.
- Asistente de resolución de problemas STEM en local: con Q4_K_M (~1,2 GB) puede desplegarse en portátiles sin GPU dedicada para dar derivaciones paso a paso de problemas de física o matemáticas, manteniendo los datos en el dispositivo.
- Preprocesado de razonamiento en pipelines RAG: actuar como "razonador barato" que estructura inferencias antes de pasar la respuesta a un modelo mayor, reduciendo coste por consulta en arquitecturas en cascada.
- Filtrado y anotación de datasets de lógica: generar pares premisa-conclusión etiquetados para entrenar o validar otros modelos, aprovechando su SFT específico sobre lógica proposicional.
- Despliegue en dispositivos de borde y móviles: la cuantización Q4_K_M permite integración en aplicaciones Android/iOS mediante llama.cpp u Ollama, para asistentes offline de razonamiento básico.
- Prototipado rápido de agentes de razonamiento: servir como componente de inferencia local en pruebas de concepto con LM Studio u Ollama antes de escalar a modelos mayores, gracias a su licencia Apache 2.0 y su reducido footprint.
- Educación y divulgación: generar explicaciones encadenadas de deducciones lógicas para materiales docentes, con la salvedad de revisar siempre las salidas por las limitaciones de capacidad del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~3,8 GB en F16; ~2,1 GB en Q8_0; ~1,4 GB en Q5_K_M; ~1,2 GB en Q4_K_M (tamaños de fichero según la model card; el consumo real en memoria añade overhead del runtime y del contexto).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q4_K_M; RTX 3060/4060 o superiores para Q5_K_M y Q8_0; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU consumer: sí, en todas las cuantizaciones indicadas; Q4_K_M y Q5_K_M son viables incluso en iGPU y CPU.
- Opciones de despliegue: llama.cpp (CLI y binding Python `llama_cpp`), Ollama (mediante Modelfile), LM Studio; compatible con endpoints según los tags del repositorio.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Qwen3-1.7B-Coder-Distilled-SFT-GGUF (este) | 2.031.739.904 | no disponible | Apache 2.0 | GGUF | Razonamiento lógico y STEM destilado |
| Qwen/Qwen3-1.7B (base) | ~1.700 millones | no disponible | Apache 2.0 | safetensors | Modelo generalista base |
| reaperdoesntknow/Qwen3-1.7B-Coder-Distilled | no disponible | no disponible | no disponible | no disponible | Solo etapa 1 de destilación |
| reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT-GGUF | no disponible | no disponible | no disponible | GGUF | Profesor instruct + SFT legal |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de 1,7B parámetros: capacidad limitada para inferencias multi-paso con muchos cuantificadores; el propio autor advierte que pueden exceder su capacidad.
- No es un generador de código pese al profesor Coder; no debe emplearse como tal en producción.
- No es un verificador formal de demostraciones; las salidas deben validarse siempre en contextos críticos.
- Riesgo de alucinación inherente a modelos pequeños, especialmente fuera del dominio lógico/STEM para el que fue ajustado.
- Soporte exclusivo de inglés según la model card; el rendimiento en castellano no está documentado.
- No hay información publicada sobre sesgos específicos del ajuste; al derivar de Qwen3-1.7B hereda los sesgos del modelo base y de los datasets de destilación y SFT.
- Licencia Apache 2.0 permite uso comercial, pero la model card no ofrece garantías ni evaluación independiente del rendimiento en producción.
- El autor menciona marcos matemáticos propios (Discrepancy Calculus) sin validación externa publicada; tratarlos como afirmaciones del autor, no como resultados verificados.
- Longitud de contexto no documentada; los ejemplos usan n_ctx=1024, por lo que ventanas mayores no están garantizadas.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Coder-Distilled-SFT-GGUF
- Modelo fuente (precisión completa): https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Coder-Distilled-SFT
- Variante solo etapa 1: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Coder-Distilled
- Variante profesor instruct + SFT legal: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo profesor: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Dataset de inferencia lógica: https://huggingface.co/datasets/KonstantinDob/logic_inference_dataset
- Paper LogicInference (Ontañón): https://openreview.net/pdf?id=HAGeIS_Lcg9
- llama.cpp: https://github.com/ggerganov/llama.cpp
- LM Studio: https://lmstudio.ai/
- Convergent Intelligence LLC: https://convergentintel.com
- Perfil del autor en Hugging Face: https://huggingface.co/reaperdoesntknow
