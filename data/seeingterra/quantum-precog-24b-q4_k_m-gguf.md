# seeingterra/Quantum-Precog-24B-Q4_K_M-GGUF

## Resumen

Quantum-Precog-24B-Q4_K_M-GGUF es una cuantización en formato GGUF del modelo Naphula/Quantum-Precog-24B, publicada por el usuario seeingterra. Se trata de un modelo de lenguaje de 23.572.444.160 parámetros (aproximadamente 24B) orientado a escritura creativa, generación de ficción, roleplay y narración de historias, derivado de la familia Mistral Small y construido mediante técnicas de fusión de modelos (mergekit). La cuantización Q4_K_M reduce el peso del repositorio a 14,3 GB, lo que facilita su ejecución en hardware de consumo mediante llama.cpp.

El modelo está etiquetado para múltiples géneros literarios (terror, romance, ciencia ficción, suspense), generación de tramas y sub-tramas, continuación de escenas y escritura vívida. Su licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales. El idioma declarado es únicamente inglés.

La relevancia de esta ficha radica en que se trata de una cuantización práctica de un modelo de fusión especializado, publicada con muy poca documentación técnica adicional: la model card del repositorio GGUF remite íntegramente a la del modelo base y no aporta datos propios de entrenamiento, benchmarks ni arquitectura detallada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Mistral Small, según etiquetas; detalles no disponibles) |
| Parametros totales | 23.572.444.160 (~24B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); otras cuantizaciones no disponibles en este repo |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (quantum-precog-24b-q4_k_m.gguf) |

## Arquitectura y entrenamiento

La información disponible indica que el modelo base es Naphula/Quantum-Precog-24B, construido mediante mergekit (fusión de modelos) a partir de la familia Mistral Small. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO. La model card del repositorio GGUF es una plantilla automática generada por el espacio GGUF-my-repo de ggml.ai y no aporta información técnica adicional sobre el proceso de entrenamiento.

La cuantización Q4_K_M se ha generado con llama.cpp, aplicando cuantización de bloques de 4 bits con escalas de tipo K. Este esquema es un compromiso habitual entre tamaño y fidelidad de la representación, y reduce el peso de los pesos originales (presumiblemente en safetensors) a un archivo de aproximadamente 14,3 GB. No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o arquitecturas híbridas.

## Capacidades

- Generación de texto creativo en inglés: ficción, relatos cortos, novelas y escritura vívida.
- Generación de tramas y sub-tramas narrativas (plot generation, sub-plot generation).
- Roleplay y conversación multi-turno orientada a personajes.
- Continuación de escenas (scene continue) y escritura colaborativa.
- Cobertura de múltiples géneros: terror, romance, ciencia ficción, suspense, ficción oscura.
- Estilo conversacional y narrativo con capacidad de lenguaje explícito (etiqueta "swearing").
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al inglés según la metadata del modelo.

## Casos de uso

- Generación de relatos de ficción por encargo: el modelo puede producir narrativa completa en inglés con control de género (terror, romance, ciencia ficción) y estilo vívido, adecuado para escritores que buscan borradores o variaciones de una premisa.
- Roleplay con personajes persistentes: gracias a su orientación conversacional y a la etiqueta "rp", puede mantener interacciones multi-turno con un personaje definido, útil en plataformas de entretenimiento conversacional.
- Continuación de escenas en talleres de escritura: un autor puede aportar un fragmento y solicitar al modelo que continúe la escena manteniendo tono y voz narrativa, como herramienta de brainstorming.
- Generación de tramas y sub-tramas para guiones o videojuegos narrativos: el modelo está etiquetado específicamente para plot generation y sub-plot generation, lo que permite generar estructuras argumentales ramificadas antes de escribir el texto final.
- Prototipado de narrativa interactiva: integrado en un motor de ficción interactiva local mediante llama.cpp, puede generar respuestas narrativas dinámicas sin depender de servicios en la nube, gracias a su formato GGUF y su tamaño manejable en Q4_K_M.
- Despliegue local en estaciones de trabajo para escritura asistida: al ejecutarse con llama-cli o llama-server, permite a escritores trabajar con el modelo de forma privada y sin conexión, manteniendo los manuscritos en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en Q4_K_M: en torno a 14-16 GB para cargar el archivo de 14,3 GB más el contexto y overhead de llama.cpp; con contexto largo, el consumo de memoria KV cache aumenta proporcionalmente.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB, H100; también viable en GPUs de 16 GB con contexto reducido y offloading parcial.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y, con limitaciones de contexto, en GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) mediante offloading a CPU.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), y por compatibilidad de formato GGUF, frontends como Ollama o LM Studio; vLLM y TGI no soportan GGUF de forma nativa en todos los casos.
- Latencia y throughput: no disponibles; dependen del hardware y del tamaño de contexto configurado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Quantum-Precog-24B-Q4_K_M-GGUF | ~24B | No disponible | Apache 2.0 | GGUF Q4_K_M | Fusión Mistral Small orientada a ficción |
| Mistral Small (base de la familia) | ~24B | No disponible en esta ficha | Apache 2.0 (según familia) | Safetensors/GGUF | Modelo generalista, no especializado en ficción |
| Naphula/Quantum-Precog-24B | ~24B | No disponible | Apache 2.0 | Safetensors (presumible) | Modelo original sin cuantizar del que deriva esta ficha |

No se dispone de datos de rendimiento comparativo ni de benchmarks que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; su uso en castellano no está garantizado y probablemente degrade la calidad.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de su calidad frente a alternativas.
- Al ser un modelo de fusión (mergekit) sin documentación de entrenamiento, se desconoce la composición exacta de los datos y los posibles sesgos heredados de los modelos fusionados.
- Riesgo de alucinación inherente a los modelos generativos de esta escala, especialmente en contenido factual; está orientado a ficción, no a tareas de precisión.
- La etiqueta "swearing" indica que el modelo puede generar lenguaje explícito; requiere filtrado o moderación en aplicaciones públicas.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Naphula/Quantum-Precog-24B y de los modelos fusionados que lo componen.
- La cuantización Q4_K_M introduce una pérdida de fidelidad respecto a los pesos originales; para máxima calidad conviene usar el modelo base sin cuantizar.
- No se documenta longitud de contexto; configurar contextos largos en llama.cpp puede degradar el rendimiento o exceder la memoria disponible.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/seeingterra/Quantum-Precog-24B-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/Naphula/Quantum-Precog-24B
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
