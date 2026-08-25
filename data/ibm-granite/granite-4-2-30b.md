# ibm-granite/granite-4.2-30b

## Resumen

Granite-4.2-30B es el modelo insignia de la familia Granite 4.2, desarrollada por el equipo Granite de IBM y publicada el 25 de agosto de 2026. Se trata de un transformer denso decoder-only con capacidades de razonamiento nativo integradas, lo que le permite generar cadenas de pensamiento (chain-of-thought) antes de emitir una respuesta final. Es la evolución del modelo base Granite-4.1-30B-Base, sobre el que se ha aplicado un ajuste fino para incorporar modos de pensamiento flexibles, tool calling razonado y una ventana de contexto nativa de 128K tokens, ampliable hasta 512K para tareas de contexto largo.

El modelo está diseñado para entornos empresariales y de investigación que necesitan razonamiento complejo, generación de código y flujos de trabajo agénticos. Se distribuye con licencia Apache 2.0, lo que permite uso comercial y académico sin restricciones. Su arquitectura densa de 30.000 millones de parámetros, junto con el soporte multilingüe en doce idiomas y la integración nativa de razonamiento, lo posiciona como una alternativa viable a modelos propietarios de razonamiento en tareas de matemáticas, lógica multi-paso y llamadas a herramientas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decoder-only Dense Transformer (GraniteForCausalLM) |
| Parámetros totales | 29.276.770.304 (30B) |
| Parámetros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 128K nativa, extensión a 512K |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, bfloat16 |

## Arquitectura y entrenamiento

Granite-4.2-30B se basa en un transformer denso decoder-only con atención por grupos (Grouped Query Attention, GQA) con 32 cabezas de atención y 8 cabezas KV, embeddings posicionales rotatorios (RoPE) con theta de 10.000.000, MLP con activación SwiGLU (tamaño oculto 32.768), normalización RMSNorm (épsilon 1e-5) y embeddings de entrada y salida separados (no atados). La precisión de los pesos es bfloat16.

El entrenamiento parte del modelo base Granite-4.1-30B-Base, sobre el que se aplicó un ajuste fino para añadir razonamiento nativo con modos de pensamiento intercambiables (completo, no-pensamiento y bajo esfuerzo) y tool calling razonado. No se han publicado datos concretos sobre el volumen de tokens de entrenamiento ni la composición exacta del dataset en la información disponible.

## Capacidades

- Razonamiento multi-paso con chain-of-thought integrado, activable o desactivable según el modo de pensamiento elegido.
- Generación de código y soporte de lenguajes de programación populares, orientado a entornos de desarrollo.
- Tool calling razonado: el modelo decide qué herramienta invocar y por qué, siguiendo el esquema de definición de funciones de OpenAI.
- Flujos de trabajo agénticos: puede seguir instrucciones complejas, recuperar información, elegir herramientas y verificar resultados.
- Multilingüe en 12 idiomas probados (inglés, alemán, español, francés, japonés, portugués, árabe, checo, italiano, coreano, neerlandés, chino), con otros idiomas no garantizados.
- Ventana de contexto larga de 128K tokens nativa, extensible a 512K, para documentos extensos y conversaciones multi-turno.
- Modos de pensamiento flexibles (full thinking, non-thinking, low-effort) para equilibrar profundidad y latencia según la consulta.

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 128K tokens de ventana, manteniendo el historial completo de la interacción y resolviendo incidencias complejas paso a paso.
- **Generación de código en producción**: con soporte de tool calling y razonamiento integrado, se puede integrar en pipelines de CI/CD para generar, revisar y corregir código, así como invocar herramientas de compilación o pruebas.
- **Agentes autónomos para flujos de trabajo empresariales**: su capacidad de razonamiento multi-paso y de elección de herramientas lo hace adecuado para agentes que deben recuperar datos, actualizar sistemas y verificar resultados en entornos de automatización.
- **Análisis y resumen de documentos extensos**: con contexto de 128K a 512K tokens, puede procesar informes legales, financieros o técnicos completos, extraer conclusiones y responder preguntas sobre el contenido.
- **Soporte técnico y diagnóstico avanzado**: el razonamiento estructurado permite descomponer problemas técnicos complejos en pasos lógicos, identificar causas raíz y proponer soluciones verificables.
- **Tutoría y educación**: el modo de pensamiento completo puede generar explicaciones paso a paso para problemas de matemáticas, física o lógica, útil en plataformas de aprendizaje asistido.
- **Traducción y localización multilingüe**: con soporte de doce idiomas, puede traducir y localizar contenido técnico o comercial, manteniendo coherencia en conversaciones largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se puede proporcionar una tabla comparativa con MMLU, HumanEval, GSM8K u otros referentes sin datos verificados.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bfloat16, el modelo requiere aproximadamente 58,6 GB de VRAM (30B parámetros × 2 bytes), más memoria para la caché KV y la activación.
- GPU recomendadas: A100 80GB, H100 80GB, o configuraciones multi-GPU (por ejemplo, 2× RTX 4090 de 24 GB cada una) para alojar los pesos completos.
- En GPU de consumo (RTX 4090, 24 GB) solo es viable si se dispone de cuantizaciones de menor precisión, pero no se han publicado pesos cuantizados en la información disponible.
- Opciones de despliegue: compatible con librerías transformers y servidores de inferencia estándar como vLLM, llama.cpp, Ollama o TGI, aunque no se especifican configuraciones oficiales.
- Latencia y throughput: no disponible sin datos de benchmarks.

## Comparativa con modelos similares

La información disponible no incluye resultados de benchmarks para comparar con otros modelos. A nivel de especificaciones, se puede comparar con la propia familia Granite 4.2:

| Modelo | Parámetros | Contexto | Razonamiento nativo | Licencia |
|---|---|---|---|---|
| Granite-4.2-30B | 30B | 128K (512K ext.) | Sí | Apache 2.0 |
| Granite-4.2-8B | 8B | 128K (512K ext.) | Sí | Apache 2.0 |
| Granite-4.2-3B | 3B | 128K (512K ext.) | Sí | Apache 2.0 |

No se dispone de comparativa con modelos externos como Llama 3.1 70B o Qwen 2.5 32B en la información proporcionada.

## Limitaciones y advertencias

- Los idiomas fuera de los doce listados pueden funcionar, pero no han sido probados y podrían dar resultados inconsistentes.
- La extensión de contexto a 512K tokens es una extensión de contexto larga, pero su rendimiento real en esa longitud no está documentado en la información disponible.
- El modo de razonamiento completo puede aumentar la latencia y el consumo de tokens, lo que requiere un equilibrio entre profundidad y coste en entornos de producción.
- Aunque la licencia Apache 2.0 permite uso comercial, los datos de entrenamiento y el proceso de ajuste fino no son públicos, lo que limita la auditoría del modelo.
- Como todo modelo de lenguaje, existe riesgo de alucinación en tareas de razonamiento y generación de código; se recomienda verificación en entornos críticos.
- No se han publicado cuantizaciones oficiales, por lo que el despliegue en hardware de consumo requiere cuantizaciones de terceros no verificadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ibm-granite/granite-4.2-30b
- Colección Granite 4.2: https://huggingface.co/collections/ibm-granite/granite-42-language-models
- Blog técnico de Granite 4.2: https://huggingface.co/blog/ibm-granite/granite-4-2
- Repositorio GitHub: https://github.com/ibm-granite/granite-4.2-language-models
- Blog de investigación de IBM: https://research.ibm.com/blog/introducing-granite-4-2
- Página de Granite en IBM: https://www.ibm.com/granite
